# AnalyticsAggregation BullMQ Queue

The `AnalyticsAggregation` queue is responsible for compiling and aggregating raw telemetry and event data into materialized views or time-series rollup tables.

## Architecture

1. **Producer**: A cron-based job triggers the aggregation every hour.
2. **Worker**: The worker queries the raw event logs, aggregates counts and unique user metrics by time bucket (hourly, daily, weekly), and `UPSERT`s them into the `analytics_rollups` table.

## Retention Policy
The raw event logs are kept for 7 days, after which they are pruned by the `DataCleanup` job. The aggregated data is kept indefinitely.
