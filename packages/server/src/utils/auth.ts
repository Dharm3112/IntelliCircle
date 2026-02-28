import argon2 from "argon2";
import { getRedisClient } from "../db/redis";
const redis = getRedisClient();

const TOKEN_BLACKLIST_PREFIX = "blacklisted:";

export const hashPassword = async (password: string): Promise<string> => {
    return await argon2.hash(password);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await argon2.verify(hash, password);
};

export const blacklistToken = async (jti: string, expiresInMs: number): Promise<void> => {
    // Math.ceil in case expiresInMs isn't a perfect integer
    await redis.setex(`${TOKEN_BLACKLIST_PREFIX}${jti}`, Math.ceil(expiresInMs / 1000), "true");
};

export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
    const exists = await redis.exists(`${TOKEN_BLACKLIST_PREFIX}${jti}`);
    return exists === 1;
};
