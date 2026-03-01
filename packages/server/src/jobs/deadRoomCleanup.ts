import { db } from "../db/index";
import { chatRooms, messages } from "@intellicircle/shared";
import { eq, desc } from "drizzle-orm";
import { logger } from "../utils/logger";

export const deadRoomCleanupJob = async () => {
    logger.info("Starting deadRoomCleanupJob");

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        // Find all active rooms
        const activeRooms = await db.select({ id: chatRooms.id }).from(chatRooms).where(eq(chatRooms.isActive, 1));

        let archivedCount = 0;

        for (const room of activeRooms) {
            // Fetch the most recent message in this room
            const latestMessage = await db.select({ createdAt: messages.createdAt })
                .from(messages)
                .where(eq(messages.roomId, room.id))
                .orderBy(desc(messages.createdAt))
                .limit(1);

            let shouldArchive = false;

            if (latestMessage.length === 0) {
                // No messages at all. Was the room created > 24h ago?
                const roomData = await db.select({ createdAt: chatRooms.createdAt })
                    .from(chatRooms)
                    .where(eq(chatRooms.id, room.id));

                if (roomData[0]?.createdAt && roomData[0].createdAt < twentyFourHoursAgo) {
                    shouldArchive = true;
                }
            } else {
                // Has messages, but is the newest one > 24 hours old?
                if (latestMessage[0].createdAt < twentyFourHoursAgo) {
                    shouldArchive = true;
                }
            }

            if (shouldArchive) {
                await db.update(chatRooms).set({ isActive: 0 }).where(eq(chatRooms.id, room.id));
                archivedCount++;
                logger.info({ roomId: room.id }, "Archived inactive room");
            }
        }

        logger.info({ archivedCount }, "Finished deadRoomCleanupJob");
        return { archivedCount };
    } catch (err) {
        logger.error({ err }, "Error running deadRoomCleanupJob");
        throw err;
    }
};
