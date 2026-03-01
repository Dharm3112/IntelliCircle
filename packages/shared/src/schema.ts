import {
    pgTable,
    serial,
    varchar,
    json,
    timestamp,
    text,
    integer,
    uniqueIndex,
    index,
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

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 256 }).notNull().unique(),
    email: varchar("email", { length: 256 }).unique(),
    passwordHash: varchar("password_hash", { length: 256 }),
    role: varchar("role", { length: 50 }).notNull().default("user"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
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
}, (table) => {
    return {
        // Essential composite index for optimizing the `WHERE roomId = X ORDER BY createdAt DESC` query for room history hydration
        roomHistoryIdx: index("message_room_created_idx").on(table.roomId, table.createdAt),
    };
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

// --- Auth Schemas ---
export const anonymousAuthSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export const upgradeAuthSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const loginAuthSchema = z.object({
    usernameOrEmail: z.string(),
    password: z.string(), // Keep login schema simple to not leak requirements to attackers
});

// --- Audit Logs ---
export const authAuditLogs = pgTable("auth_audit_logs", {
    id: serial("id").primaryKey(),
    ipAddress: varchar("ip_address", { length: 45 }), // 45 chars handles IPv6
    eventType: varchar("event_type", { length: 50 }).notNull(), // 'login_failed', 'signup_failed', etc.
    usernameOrEmailAttempted: varchar("attempted_identity", { length: 256 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Geolocation & Rooms Schemas ---
export const createRoomSchema = z.object({
    name: z.string().min(3).max(64),
    description: z.string().max(500).optional(),
    lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    lng: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
    interests: z.array(z.string().max(50)).min(1).max(5)
});

export const nearbyRoomsQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().min(1).max(5000).default(50), // Default 50km radius
    interests: z.union([z.string(), z.array(z.string())]).optional()
        .transform(val => Array.isArray(val) ? val : (val ? [val] : []))
});
