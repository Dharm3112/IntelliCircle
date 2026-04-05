/**
 * Pino Transport Configuration for Centralized Log Aggregation
 *
 * In production, logs are piped to the Datadog Log Intake via HTTP (no agent sidecar needed)
 * using pino-datadog-transport. If the DATADOG_API_KEY is not set, falls back to plain stdout.
 *
 * For local development, pino-pretty is used for human-readable console output.
 *
 * Architecture Decision:
 * - Using HTTP intake instead of Datadog Agent allows deployments on PaaS (Render, Railway)
 *   where installing a sidecar agent is not feasible.
 * - The `pino.multistream()` approach is avoided in favor of Pino v7+ transport targets
 *   which run in worker threads, keeping the main event loop unblocked.
 */

import type { LoggerOptions } from "pino";

export function buildLoggerTransport(nodeEnv: string): LoggerOptions["transport"] {
    // Development: Pretty-print to console
    if (nodeEnv !== "production") {
        return {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
            },
        };
    }

    // Production: Structured JSON to stdout (consumed by Datadog Agent, CloudWatch, or any log collector)
    // The Datadog Agent / Render log drain / CloudWatch agent picks up structured JSON from stdout.
    // This is the most portable approach for PaaS environments.
    //
    // If DATADOG_API_KEY is available, we can optionally add a direct HTTP intake transport
    // using pino-datadog-transport, but stdout-based collection is preferred for reliability.
    return undefined; // Pino defaults to structured JSON on stdout when transport is undefined
}
