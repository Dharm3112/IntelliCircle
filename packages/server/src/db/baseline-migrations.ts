import postgres from "postgres";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Standalone script — reads DATABASE_URL from process.env directly
// to avoid importing the full app env validation.
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
}

const sql = postgres(DATABASE_URL, {
    max: 1,
    ssl: DATABASE_URL.includes("render.com") || DATABASE_URL.includes("supabase") ? "require" : undefined,
});

/**
 * This script marks all existing migrations as "already applied" in the
 * Drizzle migration journal table without actually running them.
 * 
 * Use this when your database already has the tables (e.g. created via db:push)
 * but the migration journal doesn't know about them.
 */
async function baselineMigrations() {
    console.log("🔧 Baselining Drizzle migrations...\n");

    // 1. Ensure the drizzle schema and migration table exist
    await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`;
    await sql`
        CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
            id SERIAL PRIMARY KEY,
            hash TEXT NOT NULL,
            created_at BIGINT
        )
    `;

    // 2. Read the migration journal
    const journalPath = path.resolve(__dirname, "../../migrations/meta/_journal.json");
    const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));

    // 3. Check what's already recorded
    const existing = await sql`SELECT hash FROM "drizzle"."__drizzle_migrations"`;
    const existingHashes = new Set(existing.map((r: any) => r.hash));

    // 4. For each migration, compute its hash and insert if not present
    for (const entry of journal.entries) {
        const migrationFile = path.resolve(
            __dirname,
            `../../migrations/${entry.tag}.sql`
        );
        
        if (!fs.existsSync(migrationFile)) {
            console.log(`⚠️  Skipping ${entry.tag} — SQL file not found`);
            continue;
        }

        const content = fs.readFileSync(migrationFile, "utf-8");
        const hash = crypto.createHash("sha256").update(content).digest("hex");

        if (existingHashes.has(hash)) {
            console.log(`✅ ${entry.tag} — already recorded`);
        } else {
            await sql`
                INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
                VALUES (${hash}, ${entry.when})
            `;
            console.log(`📝 ${entry.tag} — marked as applied`);
        }
    }

    console.log("\n✅ Baseline complete. Future migrations will run normally.");
    await sql.end();
    process.exit(0);
}

baselineMigrations().catch((err) => {
    console.error("❌ Baseline failed:", err);
    process.exit(1);
});
