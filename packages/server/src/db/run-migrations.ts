import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index"; // Use relative import inside src/db
import postgres from "postgres";
import { env } from "../config/env";

const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

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
