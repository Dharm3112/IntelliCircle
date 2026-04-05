import { StatsD } from "hot-shots";
import { env } from "../config/env";
import { monitorEventLoopDelay, type IntervalHistogram } from "perf_hooks";
import { logger } from "./logger";

// Initialize the DogStatsD client
// It will attempt to send UDP packets to the Datadog agent running on localhost:8125
export const metrics = new StatsD({
    prefix: "intellicircle.",
    globalTags: { env: env.NODE_ENV },
    mock: env.NODE_ENV !== "production" // In Dev/Test, simply drop the metrics silently instead of failing
});

// Helper for timing functions
export const trackTiming = async <T>(metricName: string, fn: () => Promise<T>, tags?: string[]): Promise<T> => {
    const start = Date.now();
    try {
        return await fn();
    } finally {
        metrics.histogram(metricName, Date.now() - start, tags);
    }
};

// ─── Event Loop Lag Monitor ───────────────────────────────────────────────────
// Uses perf_hooks to sample event loop delay at a nanosecond resolution.
// Emits p50, p95, p99 percentiles every 10 seconds to track Node.js health.
let eventLoopMonitor: IntervalHistogram | null = null;

export function startEventLoopMonitor(): void {
    eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 }); // 20ms sampling
    eventLoopMonitor.enable();

    const interval = setInterval(() => {
        if (!eventLoopMonitor) return;

        // Convert nanoseconds -> milliseconds
        const p50 = eventLoopMonitor.percentile(50) / 1e6;
        const p95 = eventLoopMonitor.percentile(95) / 1e6;
        const p99 = eventLoopMonitor.percentile(99) / 1e6;
        const mean = eventLoopMonitor.mean / 1e6;

        metrics.gauge("event_loop_lag_ms.p50", p50);
        metrics.gauge("event_loop_lag_ms.p95", p95);
        metrics.gauge("event_loop_lag_ms.p99", p99);
        metrics.gauge("event_loop_lag_ms.mean", mean);

        logger.debug({ p50, p95, p99, mean }, "Event loop lag (ms)");

        // Reset the histogram to avoid accumulating stale data
        eventLoopMonitor.reset();
    }, 10_000); // Every 10 seconds

    // Prevent the interval from keeping the process alive during shutdown
    interval.unref();
    logger.info("📊 Event loop lag monitor started (10s interval)");
}

// ─── Redis Memory Growth Monitor ─────────────────────────────────────────────
// Polls Redis INFO memory every 30 seconds to track used_memory_bytes.
// This is critical for detecting memory leaks from Pub/Sub or cache bloat.
export function startRedisMemoryMonitor(redisClient: any): void {
    const interval = setInterval(async () => {
        try {
            const info: string = await redisClient.info("memory");
            const usedMemoryMatch = info.match(/used_memory:(\d+)/);
            const maxMemoryMatch = info.match(/maxmemory:(\d+)/);

            if (usedMemoryMatch) {
                const usedBytes = parseInt(usedMemoryMatch[1], 10);
                metrics.gauge("redis_used_memory_bytes", usedBytes);

                if (maxMemoryMatch) {
                    const maxBytes = parseInt(maxMemoryMatch[1], 10);
                    if (maxBytes > 0) {
                        const usagePercent = (usedBytes / maxBytes) * 100;
                        metrics.gauge("redis_memory_usage_percent", usagePercent);
                    }
                }

                logger.debug({ usedBytes }, "Redis memory sampled");
            }
        } catch (err) {
            logger.error({ err }, "Failed to sample Redis memory");
        }
    }, 30_000); // Every 30 seconds

    interval.unref();
    logger.info("📊 Redis memory monitor started (30s interval)");
}

// Graceful cleanup
export function stopMetricMonitors(): void {
    if (eventLoopMonitor) {
        eventLoopMonitor.disable();
        eventLoopMonitor = null;
    }
}
