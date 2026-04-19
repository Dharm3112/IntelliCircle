import postgres from "postgres";

// Clears the Drizzle migration journal so migrations can run fresh.
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
}

const sql = postgres(DATABASE_URL, {
    max: 1,
    ssl: DATABASE_URL.includes("render.com") || DATABASE_URL.includes("supabase") ? "require" : undefined,
});

async function resetJournal() {
    console.log("🗑️  Clearing Drizzle migration journal...");
    await sql`DELETE FROM "drizzle"."__drizzle_migrations"`;
    console.log("✅ Journal cleared. Run db:migrate to apply migrations from scratch.");
    await sql.end();
    process.exit(0);
}

resetJournal().catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
});
