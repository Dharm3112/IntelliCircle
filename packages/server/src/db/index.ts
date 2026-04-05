import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "@intellicircle/shared/src/schema";

// ─── Connection Pool Configuration ───────────────────────────────────────────
// Right-sized for Supabase/PgBouncer transaction-mode pooling.
//
// Why max: 20?
// - Supabase free tier allows ~20 direct connections per client
// - PgBouncer in transaction mode multiplexes, so 20 is sufficient for
//   thousands of concurrent WS users (queries are fast, connections return quickly)
// - The previous max: 100 caused "too many connections" errors under load
//
// Why prepare: false?
// - PgBouncer in transaction mode doesn't support prepared statements
// - Without this, queries will fail with "prepared statement does not exist"
//
// Connection lifecycle:
// - idle_timeout: 20s – reclaim idle connections faster under burst patterns
// - connect_timeout: 10s – fail fast on pool exhaustion instead of hanging
// - max_lifetime: 1800s (30 min) – rotate connections to prevent stale TCP
const client = postgres(env.DATABASE_URL, {
    ssl: 'require',
    max: 20,                   // Right-sized for Supabase connection limits
    idle_timeout: 20,          // Reclaim idle connections after 20s
    connect_timeout: 10,       // Fail fast on pool exhaustion (10s)
    max_lifetime: 60 * 30,     // Rotate connections every 30 minutes
    prepare: false,            // Required for PgBouncer transaction-mode compatibility
});

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });
