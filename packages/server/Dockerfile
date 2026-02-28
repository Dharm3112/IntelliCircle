# Use Node.js LTS
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies required for Drizzle/pg
RUN apk add --no-cache libc6-compat

# Copy workspace configuration
COPY package.json package-lock.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared

# Build shared first, then server
RUN npm run build -w @intellicircle/shared
RUN npm run build -w @intellicircle/server

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary files for the server to run
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Expose the API port
EXPOSE 8080

# Create a startup script to tune OS limits before executing node
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'ulimit -n 65535' >> /app/start.sh && \
    echo 'exec npm run start -w @intellicircle/server' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start using the tuned script
CMD ["/app/start.sh"]
