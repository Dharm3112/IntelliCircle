import { FastifyPluginAsync } from "fastify";
import { db } from "../db";
import { getRedisClient } from "../db/redis";
import { sql } from "drizzle-orm";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

export const dbTestRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/test-db", async (request, reply) => {
        try {
            const dbStart = Date.now();
            await db.execute(sql`SELECT 1`);
            const dbLatency = Date.now() - dbStart;

            const redis = getRedisClient();
            const redisStart = Date.now();
            await redis.ping();
            const redisLatency = Date.now() - redisStart;

            return reply.send(createSuccessResponse({
                postgres: { status: "connected", latencyMs: dbLatency },
                redis: { status: "connected", latencyMs: redisLatency }
            }));
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send(createErrorResponse("Substrate Connection Failed", "DB_ERROR"));
        }
    });
};
