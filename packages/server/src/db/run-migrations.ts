import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Standalone migration script — only requires DATABASE_URL.
// Does NOT import the full app env/db modules to avoid requiring
// REDIS_URL, JWT keys, etc. that are irrelevant for schema migrations.
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
}

const migrationClient = postgres(DATABASE_URL, {
    max: 1,
    ssl: DATABASE_URL.includes("render.com") || DATABASE_URL.includes("supabase") ? "require" : undefined,
});
const db = drizzle(migrationClient);

const runMigration = async () => {
    console.log("Running migrations...");
    try {
        await migrate(db, { migrationsFolder: "./migrations" });
        console.log("✅ Migration complete");
    } catch (e) {
        console.error("❌ Migration failed", e);
    } finally {
        await migrationClient.end();
        process.exit();
    }
};

runMigration();
