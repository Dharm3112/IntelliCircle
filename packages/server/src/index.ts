import "dd-trace/init"; // Must be strictly the first import for APM instrumentation
import { buildApp } from "./app";
import { env } from "./config/env";
import { startEventLoopMonitor, startRedisMemoryMonitor, stopMetricMonitors } from "./utils/metrics";
import { getRedisClient } from "./db/redis";

const start = async () => {
    const app = await buildApp();

    try {
        await app.listen({ port: env.PORT, host: "0.0.0.0" });
        app.log.info(`🚀 Server listening on http://localhost:${env.PORT}`);

        // --- Phase 10: Start Observability Monitors ---
        startEventLoopMonitor();
        startRedisMemoryMonitor(getRedisClient());

        app.log.info("📊 Observability monitors initialized");
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }

    // Graceful shutdown: clean up metric monitors
    const shutdown = async () => {
        stopMetricMonitors();
        await app.close();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
};

start();
