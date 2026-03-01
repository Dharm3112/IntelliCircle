import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { getRedisClient } from "../db/redis";
import { db } from "../db/index";
import { messages } from "@intellicircle/shared";
import { logger } from "../utils/logger";
import { eq, desc } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
const redis = getRedisClient();

export const summarizeRoomJob = async (data: { roomId: number }) => {
    const { roomId } = data;
    logger.info({ roomId }, "Starting summarizeRoomJob");

    if (!env.GEMINI_API_KEY) {
        logger.warn("GEMINI_API_KEY is missing from environment. Skipping summarizeRoomJob.");
        await redis.publish(`room:${roomId}`, JSON.stringify({
            type: "room_summary_unavailable",
            timestamp: new Date().toISOString()
        }));
        return { skipped: true, reason: "No API Key" };
    }

    try {
        // Fetch the last 50 messages for context
        const recentMessages = await db.select()
            .from(messages)
            .where(eq(messages.roomId, roomId))
            .orderBy(desc(messages.createdAt))
            .limit(50);

        if (recentMessages.length < 5) {
            logger.info({ roomId }, "Not enough messages to summarize yet.");
            await redis.publish(`room:${roomId}`, JSON.stringify({
                type: "room_summary_unavailable",
                timestamp: new Date().toISOString()
            }));
            return { skipped: true, reason: "Not enough messages" };
        }

        // Reverse to chronological order for the AI to read correctly
        recentMessages.reverse();

        // Anonymize PII from the text before sending to the LLM
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

        const transcript = recentMessages.map((m: any) => {
            let safeContent = m.content.replace(emailRegex, "[REDACTED EMAIL]");
            safeContent = safeContent.replace(phoneRegex, "[REDACTED PHONE]");
            return `User${m.userId}: ${safeContent}`;
        }).join("\n");

        const prompt = `
You are an AI assistant for a local chat room platform.
Below is a transcript of recent messages in a chat room.
Please provide a concise, 2-3 sentence summary of the current conversation context so new users joining can catch up instantly.
Do not use names or assume identities beyond what is provided. Keep the tone helpful, vibrant, and friendly.

Transcript:
${transcript}
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Save summary to Redis with an expiration of 1 hour
        const key = `room:summary:${roomId}`;
        await redis.set(key, text, "EX", 3600);

        // Also broadcast the new summary via PubSub so active listeners get it immediately without refreshing
        await redis.publish(`room:${roomId}`, JSON.stringify({
            type: "room_summary_update",
            content: text,
            timestamp: new Date().toISOString()
        }));

        logger.info({ roomId }, "Successfully summarized room and saved to Redis.");
        return { summary: text };
    } catch (err) {
        logger.error({ err, roomId }, "Failed to generate room summary with Gemini API");
        await redis.publish(`room:${roomId}`, JSON.stringify({
            type: "room_summary_unavailable",
            timestamp: new Date().toISOString()
        }));
        throw err;
    }
};
