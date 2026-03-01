import { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { chatRooms, createRoomSchema, nearbyRoomsQuerySchema } from "@intellicircle/shared";
import { reverseGeocode } from "../services/geocoding";
import { createSuccessResponse, createErrorResponse } from "../utils/response";
import { sql, eq, desc } from "drizzle-orm";
import { messages } from "@intellicircle/shared";
import { trackTiming } from "../utils/metrics";

export async function roomRoutes(app: FastifyInstance) {
    // 1. Create a New Room with Location
    app.post("/", { preValidation: [app.authenticate] }, async (request, reply) => {
        const payload = createRoomSchema.safeParse(request.body);
        if (!payload.success) {
            return reply.status(400).send(createErrorResponse("Invalid payload", "VALIDATION_ERROR", payload.error.format()));
        }

        const { name, description, lat, lng, interests } = payload.data;

        try {
            // Translate the Lat/Lng into a human string via OpenCage
            const regionString = await reverseGeocode(lat, lng);

            // Construct PostGIS Geometry Point using Raw SQL wrapper
            // ST_SetSRID(ST_MakePoint(lng, lat), 4326) -> Longitude FIRST in PostGIS MakePoint
            const locationPoint = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

            const [newRoom] = await db.insert(chatRooms).values({
                name,
                description,
                interests,
                location: { x: lng, y: lat } as any,
                // We're dynamically adding a region string column next migration to hold OpenCage result. 
                // Currently just making sure the spatial bounds store.
            }).returning();

            return reply.status(201).send(createSuccessResponse({
                room: newRoom,
                resolvedRegion: regionString
            }));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Failed to create room"));
        }
    });

    // 2. Discover Nearby Rooms
    app.get("/nearby", { preValidation: [app.authenticate] }, async (request, reply) => {
        const payload = nearbyRoomsQuerySchema.safeParse(request.query);
        if (!payload.success) {
            return reply.status(400).send(createErrorResponse("Invalid query parameters", "VALIDATION_ERROR", payload.error.format()));
        }

        const { lat, lng, radiusKm, interests } = payload.data;

        try {
            // Convert Radius from Kilometers to Meters (ST_DWithin expects meters when using geography features)
            const radiusMeters = radiusKm * 1000;

            // Base spatial query: Find rooms where the room's location is within X meters of the user's location
            // We cast the reference point to `geography` so ST_DWithin calculates distance over the curvature of the earth (meters)
            // ST_MakePoint takes (Longitude, Latitude)
            const conditions = [
                sql`ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})`,
                sql`is_active = 1` // Only show active rooms
            ];

            // Overlay Interest Filtering if array provided (Intersection operator @>)
            if (interests && interests.length > 0) {
                conditions.push(sql`interests @> ${JSON.stringify(interests)}::jsonb`);
            }

            // Combine all where clauses dynamically
            const whereClause = sql.join(conditions, sql` AND `);

            // Execute Query mapping distance for sorting, tracked via Datadog StatsD
            const nearbyRooms = await trackTiming("db_query_time", async () => {
                return db.select({
                    id: chatRooms.id,
                    name: chatRooms.name,
                    description: chatRooms.description,
                    interests: chatRooms.interests,
                    createdAt: chatRooms.createdAt,
                    distanceMeters: sql<number>`ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`
                })
                    .from(chatRooms)
                    .where(whereClause)
                    .orderBy(sql`ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) ASC`)
                    .limit(50);
            }, ["query:nearby_rooms_search"]);

            return reply.status(200).send(createSuccessResponse({ rooms: nearbyRooms, searchRadius: radiusKm }));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Failed to discover nearby rooms"));
        }
    });

    // 3. Get Global Rooms (Fallback for users without GPS)
    app.get("/global", { preValidation: [app.authenticate] }, async (request, reply) => {
        try {
            const globalRooms = await db.select({
                id: chatRooms.id,
                name: chatRooms.name,
                description: chatRooms.description,
                interests: chatRooms.interests,
                createdAt: chatRooms.createdAt,
            })
                .from(chatRooms)
                .where(eq(chatRooms.isActive, 1))
                .orderBy(desc(chatRooms.createdAt))
                .limit(50);

            return reply.status(200).send(createSuccessResponse({ rooms: globalRooms, searchRadius: "Global" }));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Failed to fetch global rooms"));
        }
    });

    // 4. Get Room History (Hydrate chat before WS takes over)
    app.get("/:id/history", { preValidation: [app.authenticate] }, async (request, reply) => {
        const _id = (request.params as { id: string }).id;
        const roomId = parseInt(_id, 10);
        if (isNaN(roomId)) return reply.status(400).send(createErrorResponse("Invalid Room ID"));

        try {
            // Fetch Room Details
            const [roomDef] = await db.select({
                id: chatRooms.id,
                name: chatRooms.name,
                description: chatRooms.description,
                interests: chatRooms.interests,
            }).from(chatRooms).where(eq(chatRooms.id, roomId));

            if (!roomDef) return reply.status(404).send(createErrorResponse("Room not found"));

            // Fetch Top 50 latest messages
            const history = await db.select({
                id: messages.id,
                userId: messages.userId,
                roomId: messages.roomId,
                content: messages.content,
                createdAt: messages.createdAt,
                // Note: Ideally join users table here to get username if needed, 
                // but WS pushes `username` dynamically. For now, rely on `userId`.
            }).from(messages).where(eq(messages.roomId, roomId)).orderBy(desc(messages.createdAt)).limit(50);

            // Reverse to chronological order for React Feed
            return reply.send(createSuccessResponse({
                room: roomDef,
                messages: history.reverse()
            }));
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Failed to fetch room history"));
        }
    });
}
