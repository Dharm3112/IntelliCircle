import { defineConfig } from "drizzle-kit";

// Note: Ensure DATABASE_URL is available in your shell or .env
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
    out: "./migrations",
    schema: "../shared/src/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
