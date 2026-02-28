import {
  mysqlTable,
  serial,
  varchar,
  json,
  timestamp,
  text,
  int,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Waitlist Table ---
// This table stores entries from your initial waitlist form.
export const waitlist = mysqlTable("waitlist", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  fullName: varchar("full_name", { length: 256 }).notNull(),
  interests: json("interests").$type<string[]>().notNull(),
  location: varchar("location", { length: 256 }).notNull(),
  profession: varchar("profession", { length: 256 }).notNull(),
});

// --- User Table ---
// Stores the basic information for each chat user.
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Chat Rooms Table ---
// Defines each chat room, including its name and associated interests.
export const chatRooms = mysqlTable("chatRooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  interests: json("interests").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Messages Table ---
// Stores every message sent in every chat room.
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  roomId: int("room_id").notNull(),
  userId: int("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Participants Table (Junction Table) ---
// Links users to the chat rooms they are a part of.
export const participants = mysqlTable(
  "participants",
  {
    id: serial("id").primaryKey(),
    roomId: int("room_id").notNull(),
    userId: int("user_id").notNull(),
  },
  (table) => {
    return {
      // Ensures a user can only be in a room once.
      uniqueParticipant: uniqueIndex("unique_participant").on(
        table.userId,
        table.roomId
      ),
    };
  }
);

// Zod schemas for validating API input - you don't need to change this.
export const insertWaitlistSchema = createInsertSchema(waitlist).pick({
  email: true,
  fullName: true,
  interests: true,
  location: true,
  profession: true,
});

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

