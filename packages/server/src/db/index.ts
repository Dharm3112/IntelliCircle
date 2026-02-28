import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "@intellicircle/shared/src/schema";

// Create native postgres client
const client = postgres(env.DATABASE_URL, { ssl: 'require' });

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });
