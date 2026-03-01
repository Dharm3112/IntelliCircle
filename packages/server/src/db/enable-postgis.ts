import { db } from "./index";
import { sql } from "drizzle-orm";

const enablePostGIS = async () => {
    console.log("Enabling PostGIS extension and optimizations...");
    try {
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis`);
        console.log("✅ PostGIS enabled.");

        await db.execute(sql`CREATE INDEX IF NOT EXISTS "chat_rooms_gix" ON "chatRooms" USING GIST (location)`);
        console.log("✅ Spatial GIST Index created.");
    } catch (e) {
        console.error("❌ Failed to enable PostGIS", e);
    } finally {
        process.exit();
    }
};

enablePostGIS();
