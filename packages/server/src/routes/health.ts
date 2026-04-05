import { FastifyPluginAsync } from "fastify";
import { createSuccessResponse, createErrorResponse } from "../utils/response";
import { db } from "../db";
import { getRedisClient } from "../db/redis";
import { sql } from "drizzle-orm";

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/health", async (request, reply) => {
        try {
            // 1. Check PostgreSQL
            const dbStart = performance.now();
            await db.execute(sql`SELECT 1`);
            const dbLatency = Math.round(performance.now() - dbStart);

            // 2. Check Redis
            const redisStart = performance.now();
            const redis = getRedisClient();
            await redis.ping();
            const redisLatency = Math.round(performance.now() - redisStart);

            // 3. Memory Usage
            const memUsage = process.memoryUsage();

            return reply.send(createSuccessResponse({
                status: "ok",
                timestamp: new Date().toISOString(),
                dependencies: {
                    database: { status: "up", latencyMs: dbLatency },
                    redis: { status: "up", latencyMs: redisLatency }
                },
                memory: {
                    heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
                    heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
                    rssMb: Math.round(memUsage.rss / 1024 / 1024)
                }
            }));
        } catch (error: any) {
            fastify.log.fatal({ err: error }, "Health check failed: Core dependency down");
            return reply.status(503).send(createErrorResponse(`Service Unavailable: ${error.message}`));
        }
    });
};
