import { StatsD } from "hot-shots";
import { env } from "../config/env";

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
