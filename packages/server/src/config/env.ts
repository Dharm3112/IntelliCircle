import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(8080),
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long").default("super-secret-key-change-in-prod-123"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1);
}

export const env = _env.data;
