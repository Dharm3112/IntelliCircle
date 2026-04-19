import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
}

const sql = postgres(DATABASE_URL, {
    max: 1,
    ssl: DATABASE_URL.includes("render.com") || DATABASE_URL.includes("supabase") ? "require" : undefined,
});

async function inspectAndFix() {
    // 1. Show existing tables
    const tables = await sql`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    console.log("📋 Existing tables:", tables.map((t: any) => t.tablename));

    // 2. Show migration journal
    try {
        const migrations = await sql`SELECT hash, created_at FROM "drizzle"."__drizzle_migrations" ORDER BY created_at`;
        console.log(`\n📜 Migration journal: ${migrations.length} entries`);
    } catch {
        console.log("\n📜 No migration journal found");
    }

    // 3. Drop ALL public tables so migrations can run cleanly
    console.log("\n🗑️  Dropping all existing public tables...");
    
    // Disable FK checks and drop everything
    for (const table of tables) {
        const name = table.tablename;
        // Skip PostGIS internal tables
        if (name === 'spatial_ref_sys') continue;
        console.log(`  Dropping: ${name}`);
        await sql.unsafe(`DROP TABLE IF EXISTS "${name}" CASCADE`);
    }

    // 4. Clear migration journal
    try {
        await sql`DELETE FROM "drizzle"."__drizzle_migrations"`;
        console.log("\n✅ Migration journal cleared.");
    } catch {
        console.log("\n⚠️  No journal to clear.");
    }

    console.log("\n✅ Database is clean. Run db:migrate to apply all migrations fresh.");
    await sql.end();
    process.exit(0);
}

inspectAndFix().catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
});
