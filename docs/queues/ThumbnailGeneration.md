# ThumbnailGeneration BullMQ Queue

The `ThumbnailGeneration` queue is responsible for offloading heavy image processing tasks (such as resizing user avatars and generating preview thumbnails for image attachments) to background workers.

## Architecture

1. **Producer**: Fastify route handles the direct file upload to S3-compatible storage, then pushes a job containing the `objectKey` to the BullMQ queue.
2. **Worker**: The worker downloads the source image, uses `sharp` to generate optimized thumbnails (e.g. 100x100 webp), uploads the derivatives back to storage, and updates the database record.

## Concurrency
To prevent CPU starvation, the ThumbnailGeneration worker is configured with a concurrency limit of `5`.
