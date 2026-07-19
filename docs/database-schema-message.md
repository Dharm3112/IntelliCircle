# Message Database Schema Relations

This document outlines the database schema relations for the `messages` table within IntelliCircle, as defined in `packages/shared/src/schema.ts`.

## The `messages` Table
The `messages` table stores the core chat content for the application.

### Columns
- `id`: Serial Primary Key
- `roomId`: Integer (Foreign Key to `chatRooms.id`)
- `userId`: Integer (Foreign Key to `users.id`)
- `content`: Text (Not Null)
- `createdAt`: Timestamp (Defaults to now)

### Relationships
1. **Belongs to a Room:** 
   Each message is tied to exactly one chat room via `roomId`.
2. **Belongs to a User:** 
   Each message is authored by exactly one user via `userId`.

### Indexes
- `roomHistoryIdx`: A composite index on `(roomId, createdAt)` exists to optimize the fetching of room message history in chronological order.

### Drizzle ORM Definition
```typescript
export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    roomId: integer("room_id").notNull(),
    userId: integer("user_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
    return {
        roomHistoryIdx: index("message_room_created_idx").on(table.roomId, table.createdAt),
    };
});
```
