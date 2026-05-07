# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/client/package*.json ./packages/client/
COPY packages/server/package*.json ./packages/server/
COPY packages/shared ./packages/shared

# Install dependencies with workspace support
RUN npm ci

# Copy source code
COPY . .

# Build client and server
RUN npm run build:client && npm run build:server

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/shared ./packages/shared

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/migrations ./migrations

# Copy .env files if needed
COPY .env.example .env.example

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000 5000

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

CMD ["node", "packages/server/dist/index.js"]
