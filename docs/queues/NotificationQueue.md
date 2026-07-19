# NotificationQueue Configuration

The `NotificationQueue` handles sending push notifications and emails to users asynchronously via BullMQ.

## Architecture

1. **Redis**: Used as the backing store for BullMQ.
2. **Worker**: A dedicated worker processes the `NotificationQueue` and interfaces with APNs/FCM or SendGrid.
3. **Producer**: The main Fastify server adds jobs to the queue when specific events occur (e.g. `MESSAGE_RECEIVED`, `ROOM_INVITE`).

## Local Setup

1. Start Redis:
   ```bash
   docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest
   ```
2. Set `REDIS_URL` in your `.env` file:
   ```env
   REDIS_URL=redis://localhost:6379
   ```
3. Start the worker process:
   ```bash
   npm run worker:start
   ```
