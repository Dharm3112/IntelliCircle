# LocationHistorySync BullMQ Queue

The `LocationHistorySync` queue is responsible for flushing user location history from the Redis fast-path into the PostgreSQL database.

## Architecture

1. **Redis Cache**: High-frequency location updates are written to Redis sorted sets (ZSET) by the fast-path WebSocket handlers.
2. **Cron Producer**: A repeating BullMQ job runs every 5 minutes to trigger the sync process.
3. **Worker**: The worker pops the data from Redis, batches it into bulk `INSERT` statements using Drizzle ORM, and stores it in PostGIS.

## Fault Tolerance
If the worker fails, the data remains in Redis and will be picked up on the next cron execution, ensuring zero data loss.
