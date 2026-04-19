import { z } from "zod";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load standard .env
dotenv.config();

// Try to safely load the dedicated .env.keys generated earlier
const keysPath = path.resolve(process.cwd(), '.env.keys');
if (fs.existsSync(keysPath)) {
    dotenv.config({ path: keysPath, override: true });
}

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(8080),
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
    REDIS_URL: z.string().url("REDIS_URL must be a valid connection string"),

    // Transform literal \n into actual newline characters
    JWT_PRIVATE_KEY: z.string().min(50, "Valid RSA Private Key required").transform(s => s.replace(/\\n/g, '\n')),
    JWT_PUBLIC_KEY: z.string().min(50, "Valid RSA Public Key required").transform(s => s.replace(/\\n/g, '\n')),

    OPENCAGE_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1);
}

export const env = _env.data;
