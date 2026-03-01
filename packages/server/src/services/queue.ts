import { Queue } from "bullmq";
import { getBullMQConnection } from "../db/redis";

const connection = getBullMQConnection();

export const backgroundQueue = new Queue("intellicircle-queue", { connection: connection as any });

export const backgroundJobService = {
    async dispatchSummarizeRoom(roomId: number) {
        // Enqueue the AI summary job. It should be processed within seconds.
        return backgroundQueue.add("summarizeRoom", { roomId });
    },

    async scheduleDeadRoomCleanup() {
        // Repeated job, runs every hour
        return backgroundQueue.add("deadRoomCleanup", {}, {
            repeat: {
                pattern: "0 * * * *" // every hour
            },
            jobId: "hourly-cleanup" // predictable ID so it doesn't queue multiple
        });
    }
};
