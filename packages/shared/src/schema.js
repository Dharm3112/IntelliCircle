"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearbyRoomsQuerySchema = exports.createRoomSchema = exports.authAuditLogs = exports.loginAuthSchema = exports.upgradeAuthSchema = exports.anonymousAuthSchema = exports.selectWaitlistSchema = exports.insertWaitlistSchema = exports.participants = exports.messages = exports.chatRooms = exports.users = exports.waitlist = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const zod_1 = require("zod");
// --- Waitlist Table ---
exports.waitlist = (0, pg_core_1.pgTable)("waitlist", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 256 }).notNull().unique(),
    fullName: (0, pg_core_1.varchar)("full_name", { length: 256 }).notNull(),
    interests: (0, pg_core_1.json)("interests").$type().notNull(),
    location: (0, pg_core_1.varchar)("location", { length: 256 }).notNull(),
    profession: (0, pg_core_1.varchar)("profession", { length: 256 }).notNull(),
});
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.varchar)("username", { length: 256 }).notNull().unique(),
    email: (0, pg_core_1.varchar)("email", { length: 256 }).unique(),
    passwordHash: (0, pg_core_1.varchar)("password_hash", { length: 256 }),
    role: (0, pg_core_1.varchar)("role", { length: 50 }).notNull().default("user"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
const pg_core_2 = require("drizzle-orm/pg-core");
// Custom PostGIS Point Type
const point = (0, pg_core_2.customType)({
    dataType() {
        return 'geometry(Point, 4326)';
    },
    toDriver(value) {
        return `SRID=4326;POINT(${value.x} ${value.y})`;
    },
});
// --- Chat Rooms Table ---
// Note: Spatial columns (geometry) will be added natively via raw SQL migrations or Drizzle custom types later.
exports.chatRooms = (0, pg_core_1.pgTable)("chatRooms", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 256 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    // Temporarily using point as standard varchar for initial seeding until PostGIS custom type mapping is perfected
    location: point("location"),
    interests: (0, pg_core_1.json)("interests").$type().notNull(),
    isActive: (0, pg_core_1.integer)("is_active").default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
// --- Messages Table ---
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomId: (0, pg_core_1.integer)("room_id").notNull(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
// --- Participants Table (Junction Table) ---
exports.participants = (0, pg_core_1.pgTable)("participants", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomId: (0, pg_core_1.integer)("room_id").notNull(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
}, (table) => {
    return {
        uniqueParticipant: (0, pg_core_1.uniqueIndex)("unique_participant").on(table.userId, table.roomId),
    };
});
// Waitlist Schemas
exports.insertWaitlistSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    profession: zod_1.z.string().optional()
});
exports.selectWaitlistSchema = exports.insertWaitlistSchema.extend({
    id: zod_1.z.number(),
    status: zod_1.z.enum(["pending", "approved", "rejected"]),
    joinedAt: zod_1.z.date()
});
// --- Auth Schemas ---
exports.anonymousAuthSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});
exports.upgradeAuthSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});
exports.loginAuthSchema = zod_1.z.object({
    usernameOrEmail: zod_1.z.string(),
    password: zod_1.z.string(), // Keep login schema simple to not leak requirements to attackers
});
// --- Audit Logs ---
exports.authAuditLogs = (0, pg_core_1.pgTable)("auth_audit_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    ipAddress: (0, pg_core_1.varchar)("ip_address", { length: 45 }), // 45 chars handles IPv6
    eventType: (0, pg_core_1.varchar)("event_type", { length: 50 }).notNull(), // 'login_failed', 'signup_failed', etc.
    usernameOrEmailAttempted: (0, pg_core_1.varchar)("attempted_identity", { length: 256 }),
    userAgent: (0, pg_core_1.text)("user_agent"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
// --- Geolocation & Rooms Schemas ---
exports.createRoomSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(64),
    description: zod_1.z.string().max(500).optional(),
    lat: zod_1.z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    lng: zod_1.z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
    interests: zod_1.z.array(zod_1.z.string().max(50)).min(1).max(5)
});
exports.nearbyRoomsQuerySchema = zod_1.z.object({
    lat: zod_1.z.coerce.number().min(-90).max(90),
    lng: zod_1.z.coerce.number().min(-180).max(180),
    radiusKm: zod_1.z.coerce.number().min(1).max(5000).default(50), // Default 50km radius
    interests: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .transform(val => Array.isArray(val) ? val : (val ? [val] : []))
});
