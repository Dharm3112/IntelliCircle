import {
    pgTable,
    serial,
    varchar,
    json,
    timestamp,
    text,
    integer,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Waitlist Table ---
export const waitlist = pgTable("waitlist", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    fullName: varchar("full_name", { length: 256 }).notNull(),
    interests: json("interests").$type<string[]>().notNull(),
    location: varchar("location", { length: 256 }).notNull(),
    profession: varchar("profession", { length: 256 }).notNull(),
});

// --- User Table ---
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 256 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

import { customType } from "drizzle-orm/pg-core";

// Custom PostGIS Point Type
const point = customType<{ data: { x: number; y: number }, driverData: string }>({
    dataType() {
        return 'geometry(Point, 4326)';
    },
    toDriver(value) {
        return `SRID=4326;POINT(${value.x} ${value.y})`;
    },
});

import { sql } from "drizzle-orm";

// --- Chat Rooms Table ---
// Note: Spatial columns (geometry) will be added natively via raw SQL migrations or Drizzle custom types later.
export const chatRooms = pgTable("chatRooms", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    // Temporarily using point as standard varchar for initial seeding until PostGIS custom type mapping is perfected
    location: point("location"),
    interests: json("interests").$type<string[]>().notNull(),
    isActive: integer("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Messages Table ---
export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    roomId: integer("room_id").notNull(),
    userId: integer("user_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Participants Table (Junction Table) ---
export const participants = pgTable(
    "participants",
    {
        id: serial("id").primaryKey(),
        roomId: integer("room_id").notNull(),
        userId: integer("user_id").notNull(),
    },
    (table) => {
        return {
            uniqueParticipant: uniqueIndex("unique_participant").on(
                table.userId,
                table.roomId
            ),
        };
    }
);

// Waitlist Schemas
export const insertWaitlistSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    profession: z.string().optional()
});

export const selectWaitlistSchema = insertWaitlistSchema.extend({
    id: z.number(),
    status: z.enum(["pending", "approved", "rejected"]),
    joinedAt: z.date()
});
