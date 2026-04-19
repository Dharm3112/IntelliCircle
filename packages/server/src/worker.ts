import { Worker } from "bullmq";
import { getBullMQConnection } from "./db/redis";
import { logger } from "./utils/logger";
import { summarizeRoomJob } from "./jobs/summarizeRoom";
import { deadRoomCleanupJob } from "./jobs/deadRoomCleanup";
import { backgroundJobService } from "./services/queue";
import { env } from "./config/env";
import http from "http";

const connection = getBullMQConnection();

logger.info("👷 Starting BullMQ Background Worker Process...");

// Render expects web services to bind to a port, even if they only process background jobs.
// This dummy HTTP server responds to Render's port scans and health checks.
const dummyServer = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Worker is running\\n");
});

dummyServer.listen(env.PORT, "0.0.0.0", () => {
    logger.info(`🌐 Dummy HTTP server listening on port ${env.PORT} for Render health checks`);
});

const worker = new Worker(
    "intellicircle-queue",
    async (job) => {
        switch (job.name) {
            case "summarizeRoom":
                return summarizeRoomJob(job.data);
            case "deadRoomCleanup":
                return deadRoomCleanupJob();
            default:
                logger.warn(`Unknown job name: ${job.name}`);
        }
    },
    { connection: connection as any, concurrency: 5 }
);

worker.on("completed", (job) => {
    logger.info(`✅ Job ${job.id} (${job.name}) completed successfully`);
});

worker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, jobName: job?.name }, "❌ Job Failed");
});

// Prime the repeated cron job schedule on boot
backgroundJobService.scheduleDeadRoomCleanup().then(() => {
    logger.info("Primed Hourly Dead Room Cleanup Cron.");
}).catch((err) => {
    logger.error({ err }, "Could not prime cleanup cron.");
});

// Graceful shutdown handling
const shutdown = async () => {
    logger.info("🛑 Shutting down worker gracefully...");
    await worker.close();
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
