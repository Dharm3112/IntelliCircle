import { FastifyInstance } from "fastify";
import { getPubSubClients } from "./pubsub";
import { z } from "zod";
import { db } from "../db/index";
import { messages } from "@intellicircle/shared";
import { sql } from "drizzle-orm";
import DOMPurify from "isomorphic-dompurify";

const wsIncomingMessageSchema = z.object({
    type: z.enum(["join_room", "send_message", "leave_room", "typing_start", "typing_stop"]),
    payload: z.any(),
});

const joinRoomPayloadSchema = z.object({
    roomId: z.number().int().positive(),
});

const typingPayloadSchema = z.object({
    roomId: z.number().int().positive(),
});

const sendMessagePayloadSchema = z.object({
    roomId: z.number().int().positive(),
    content: z.string().min(1).max(5000), // Prevent gigantic buffer spam
});

interface ConnectedClient {
    userId: number;
    username: string;
    isAlive: boolean; // For Heartbeat Ping/Pong
    activeRooms: Set<number>;
    messageTimestamps: number[]; // For rate limiting (5 msgs / sec)
}

// Global registry linking raw Sockets to identified users
const clients = new Map<any, ConnectedClient>();

export async function websocketRoutes(app: FastifyInstance) {
    const { publisher, subscriber } = getPubSubClients();

    // Redis Subscriber Handler: When a message hits a Redis Channel, pump it out to all local Fastify Sockets subscribed to that room
    subscriber.on("message", (channel, message) => {
        const [prefix, roomIdStr] = channel.split(":");
        if (prefix !== "room") return;

        const roomId = parseInt(roomIdStr, 10);

        // Find all local sockets currently in this room and broadcast the event
        for (const [socket, clientData] of clients.entries()) {
            if (clientData.activeRooms.has(roomId)) {
                // Ensure socket is actually open before sending
                if (socket.readyState === 1) {
                    socket.send(message);
                }
            }
        }
    });

    app.get("/", { websocket: true }, (socket, request) => {
        // 1. Handshake Auth: Extract JWT from Query Params since standard WS constructor cannot pass auth headers natively
        const token = (request.query as { token?: string }).token;
        if (!token) {
            socket.send(JSON.stringify({ type: "error", message: "Missing authentication token." }));
            return socket.close(1008, "Policy Violation"); // Close with HTTP 403 equivalent
        }

        try {
            // Verify JWT synchronously decoding the payload
            const decoded = app.jwt.verify<{ id: number; username: string }>(token);

            // Register Client Session
            clients.set(socket, {
                userId: decoded.id,
                username: decoded.username,
                isAlive: true,
                activeRooms: new Set(),
                messageTimestamps: [],
            });

            // Acknowledge connection
            socket.send(JSON.stringify({ type: "connected", payload: { userId: decoded.id } }));

            // --- Primary Event Loop ---
            socket.on("message", async (rawBuffer: Buffer) => {
                const clientContext = clients.get(socket);
                if (!clientContext) return;

                let parsed;
                try {
                    parsed = JSON.parse(rawBuffer.toString());
                } catch (e) {
                    return socket.send(JSON.stringify({ type: "error", message: "Malformed JSON" }));
                }

                // --- Rate Limiting (Max 5 messages per rolling 1000ms) ---
                const now = Date.now();
                clientContext.messageTimestamps = clientContext.messageTimestamps.filter(t => now - t < 1000);
                if (clientContext.messageTimestamps.length >= 5) {
                    return socket.send(JSON.stringify({ type: "error", message: "Rate limit exceeded. Please slow down." }));
                }
                clientContext.messageTimestamps.push(now);

                const validation = wsIncomingMessageSchema.safeParse(parsed);
                if (!validation.success) {
                    return socket.send(JSON.stringify({ type: "error", message: "Invalid message structure" }));
                }

                const { type, payload } = validation.data;

                // --- Event: Join Room ---
                if (type === "join_room") {
                    const joinData = joinRoomPayloadSchema.safeParse(payload);
                    if (!joinData.success) return socket.send(JSON.stringify({ type: "error", message: "Invalid Room ID" }));

                    const roomId = joinData.data.roomId;
                    clientContext.activeRooms.add(roomId);

                    // Tell backend Redis subscriber to listen to this channel if it isn't already
                    await subscriber.subscribe(`room:${roomId}`);

                    // Broadcast user joined locally to the room
                    const joinEvent = JSON.stringify({
                        type: "user_joined",
                        payload: { roomId, userId: clientContext.userId, username: clientContext.username }
                    });

                    await publisher.publish(`room:${roomId}`, joinEvent);
                }

                // --- Event: Send Message ---
                else if (type === "send_message") {
                    const msgData = sendMessagePayloadSchema.safeParse(payload);
                    if (!msgData.success) return socket.send(JSON.stringify({ type: "error", message: "Invalid message payload" }));

                    const { roomId, content } = msgData.data;

                    if (!clientContext.activeRooms.has(roomId)) {
                        return socket.send(JSON.stringify({ type: "error", message: "You must join the room before sending messages." }));
                    }

                    // 1. Sanitize HTML tags to prevent XSS payloads
                    const sanitizedContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
                    if (!sanitizedContent.trim()) {
                        return socket.send(JSON.stringify({ type: "error", message: "Message content is empty or invalid" }));
                    }

                    // 2. Persist to PostgreSQL Database
                    try {
                        const [newMsg] = await db.insert(messages).values({
                            roomId,
                            userId: clientContext.userId,
                            content: sanitizedContent,
                        }).returning();

                        // 2. Broadcast via Redis to all nodes
                        const chatEvent = JSON.stringify({
                            type: "new_message",
                            payload: {
                                id: newMsg.id,
                                roomId: newMsg.roomId,
                                userId: newMsg.userId,
                                username: clientContext.username, // Attach sender info for UI
                                content: newMsg.content,
                                createdAt: newMsg.createdAt,
                            }
                        });

                        await publisher.publish(`room:${roomId}`, chatEvent);
                    } catch (dbError) {
                        app.log.error(dbError);
                        socket.send(JSON.stringify({ type: "error", message: "Failed to save message due to internal error." }));
                    }
                }

                // --- Event: Typing Start / Stop ---
                else if (type === "typing_start" || type === "typing_stop") {
                    const typingData = typingPayloadSchema.safeParse(payload);
                    if (!typingData.success) return; // Ephemeral events can silently fail

                    const { roomId } = typingData.data;

                    if (!clientContext.activeRooms.has(roomId)) return;

                    const typingEvent = JSON.stringify({
                        type,
                        payload: { roomId, userId: clientContext.userId, username: clientContext.username }
                    });

                    // Bypass postgres completely, pipe straight to redis
                    await publisher.publish(`room:${roomId}`, typingEvent);
                }
            });

            // --- Heartbeat Responses ---
            socket.on("pong", () => {
                const clientContext = clients.get(socket);
                if (clientContext) clientContext.isAlive = true;
            });

            // --- Breakdown / Cleanup ---
            socket.on("close", async () => {
                const clientContext = clients.get(socket);
                if (clientContext) {
                    // Alert all active rooms the user dropped
                    for (const roomId of clientContext.activeRooms) {
                        const leaveEvent = JSON.stringify({
                            type: "user_left",
                            payload: { roomId, userId: clientContext.userId, username: clientContext.username }
                        });
                        await publisher.publish(`room:${roomId}`, leaveEvent);
                    }
                }
                clients.delete(socket);
            });

        } catch (jwtError) {
            socket.send(JSON.stringify({ type: "error", message: "Invalid or expired token." }));
            socket.close(1008);
        }
    });

    // --- 30s Heartbeat Garbage Collector ---
    const interval = setInterval(() => {
        for (const [socket, clientContext] of clients.entries()) {
            if (clientContext.isAlive === false) {
                // Client didn't respond to previous ping, it's dead, drop it.
                app.log.debug(`Terminating dead socket for user ${clientContext.userId}`);
                socket.terminate();
                clients.delete(socket);
                continue;
            }

            // Mark false and send a ping. They must return 'pong' by next interval or get dropped.
            clientContext.isAlive = false;
            socket.ping();
        }
    }, 30000); // 30 seconds

    app.addHook('onClose', (app, done) => {
        clearInterval(interval);
        publisher.disconnect();
        subscriber.disconnect();
        done();
    });
}
