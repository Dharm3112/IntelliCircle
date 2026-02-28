import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// We need two distinct connections to Redis when using Pub/Sub:
// 1. Publisher: Sends messages to channels (can also be used for generic GET/SET like caching)
// 2. Subscriber: Listens to channels (BLOCKS the connection for other commands while subscribed)
const publisher = new Redis(env.REDIS_URL);
const subscriber = new Redis(env.REDIS_URL);

publisher.on("error", (err) => logger.error({ err }, "Redis Publisher Error"));
subscriber.on("error", (err) => logger.error({ err }, "Redis Subscriber Error"));

export const getPubSubClients = () => {
    return { publisher, subscriber };
};
