import { Redis } from "ioredis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
    if (redisClient) return redisClient;

    redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
    });

    redisClient.on("error", (err) => {
        logger.error({ err }, "Redis Client Error");
    });

    redisClient.on("connect", () => {
        logger.info("🟢 Redis Client Connected");
    });

    return redisClient;
};
