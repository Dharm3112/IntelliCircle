# CLAUDE.md — IntelliCircle Project Guide

## Project Overview

**IntelliCircle** is a real-time, location-aware professional networking platform. Users discover hyper-local chat rooms based on GPS proximity and shared interests, join with zero-friction anonymous entry, and optionally upgrade to persistent accounts. The app features AI-powered conversation summaries via Google Gemini and horizontally-scalable WebSocket messaging via Redis Pub/Sub.

**Positioning:** "The synchronous, location-aware watercooler" — a real-time complement to LinkedIn's asynchronous model.

---

## Architecture

### Monorepo Structure (npm Workspaces)

```
IntelliCircle/
├── packages/
│   ├── client/          # @intellicircle/client — Next.js 14 App Router frontend
│   ├── server/          # @intellicircle/server — Fastify 5 backend + WebSocket server
│   └── shared/          # @intellicircle/shared — Zod schemas, Drizzle table definitions
├── .github/workflows/   # CI/CD pipelines (CI, Production Deploy, Security Scanning)
├── docker-compose.yml   # Local dev: PostGIS + Redis + Server + Client
├── render.yaml          # Production IaC: Render.com deployment config
├── generate-keys.js     # RSA key pair generator for JWT RS256
└── package.json         # Root workspace config
```

### Service Architecture

| Service | Framework | Port | Purpose |
|---------|-----------|------|---------|
| **Web Server** | Fastify 5 | 8080 | REST API + WebSocket server |
| **Background Worker** | BullMQ | 8080 (dummy) | AI summaries, dead room cleanup |
| **Frontend** | Next.js 14 | 3000 | SSR/CSR React application |
| **Database** | PostgreSQL 15 + PostGIS | 5432 | Primary data store with spatial indexes |
| **Cache/Broker** | Redis (Upstash) | 6379 | Pub/Sub, rate limiting, session blacklist, job queue |

### Data Flow

```
Client (Browser)
  ├── REST API (axios) ──→ Fastify Routes ──→ PostgreSQL (Drizzle ORM)
  └── WebSocket (native) ──→ Fastify WS Handler ──→ Redis Pub/Sub ──→ All connected nodes
                                                  └──→ PostgreSQL (message persistence)
```

---

## Tech Stack Summary

### Frontend (`packages/client`)
- **Framework:** Next.js 14 (App Router), React 18
- **Styling:** Tailwind CSS 3, custom design system (dark theme, Electric Indigo `#4F46E5`)
- **State:** Zustand (auth/UI state, persisted to localStorage), TanStack Query (server state)
- **Animations:** Framer Motion
- **Icons:** lucide-react
- **Chat rendering:** react-virtuoso (virtualized lists)
- **Analytics:** PostHog (product events), Vercel Analytics, Web Vitals
- **Fonts:** Inter (UI), Space Grotesk (display headers)

### Backend (`packages/server`)
- **Framework:** Fastify 5 with TypeScript
- **WebSockets:** @fastify/websocket (native `ws`)
- **Auth:** RS256 asymmetric JWT (@fastify/jwt), Argon2 password hashing
- **Security:** Helmet, CORS, CSRF protection, Redis-backed rate limiting, DOMPurify XSS sanitization
- **Database:** Drizzle ORM → PostgreSQL + PostGIS (`ST_DWithin` spatial queries)
- **Cache/Broker:** ioredis → Redis/Upstash
- **Jobs:** BullMQ (AI summarization, dead room cleanup cron)
- **AI:** Google Gemini 2.5 Flash (@google/generative-ai)
- **Geocoding:** OpenCage API (reverse geocoding with Redis cache, 30-day TTL)
- **Observability:** Pino logger, dd-trace (Datadog APM), hot-shots (StatsD metrics)
- **Monitoring:** Event loop lag (perf_hooks), Redis memory usage, HTTP latency histograms

### Shared (`packages/shared`)
- **Schema:** Drizzle ORM table definitions (pg-core) + Zod validation schemas
- **Exports:** All tables (`users`, `chatRooms`, `messages`, `participants`, `waitlist`, `authAuditLogs`) and all Zod schemas
- **Build:** TypeScript compiled to `dist/`, consumed by both client and server

---

## Key Commands

### Root Level
```bash
npm run dev              # Start both client and server concurrently
npm run dev:client       # Start only the Next.js frontend
npm run dev:server       # Start only the Fastify backend
npm run build:client     # Production build for client
npm run build:server     # Production build for server
npm run check            # TypeScript type check (tsc --noEmit)
```

### Server (`packages/server`)
```bash
npm run dev              # tsx watch src/index.ts (hot reload)
npm run worker           # tsx watch src/worker.ts (BullMQ worker)
npm run build            # tsc compile
npm run start            # node dist/index.js (production)
npm run start:worker     # node dist/worker.js (production worker)
npm run db:push          # Drizzle push schema to DB (rapid prototyping)
npm run db:generate      # Generate SQL migration files
npm run db:migrate       # Run pending migrations
npm run db:enable-postgis # Enable PostGIS extension
npm run seed             # Seed dev data (clears existing!)
npm run seed:production  # Seed production data
```

### Client (`packages/client`)
```bash
npm run dev              # next dev
npm run build            # next build
npm run start            # next start
npm run lint             # next lint
npm run analyze          # Bundle analyzer (set ANALYZE=true)
```

### Docker (Local Development)
```bash
docker-compose up -d     # Start PostGIS + Redis containers
.\start-project.ps1      # PowerShell: docker-compose up + npm run dev
```

### Key Generation
```bash
node generate-keys.js    # Generates RS256 key pair → packages/server/.env.keys
```

---

## Environment Variables

### Server (`packages/server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (must have PostGIS) |
| `REDIS_URL` | ✅ | Redis connection string (supports `rediss://` TLS) |
| `JWT_PRIVATE_KEY` | ✅ | RSA private key (PEM, `\\n` escaped) |
| `JWT_PUBLIC_KEY` | ✅ | RSA public key (PEM, `\\n` escaped) |
| `PORT` | ❌ | Server port (default: 8080) |
| `NODE_ENV` | ❌ | `development` / `production` / `test` |
| `CORS_ORIGIN` | ❌ | Comma-separated allowed origins |
| `GEMINI_API_KEY` | ❌ | Google Gemini API key for AI summaries |
| `OPENCAGE_API_KEY` | ❌ | OpenCage geocoding API key |

All env vars are validated at startup via Zod in `packages/server/src/config/env.ts`. Missing required vars cause immediate `process.exit(1)`.

### Client Environment
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: `http://localhost:8081/api`) |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL (auto-derived from API URL if missing) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (default: `https://app.posthog.com`) |

---

## Database Schema

Defined in `packages/shared/src/schema.ts`. All tables use PostgreSQL (`drizzle-orm/pg-core`).

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | id, username (unique), email, passwordHash, role, timestamps | Supports anonymous→upgraded accounts |
| `chatRooms` | id, name, description, location (PostGIS Point), interests (JSON), isActive | `location` uses custom `geometry(Point, 4326)` type |
| `messages` | id, roomId, userId, content, createdAt | Composite index on `(roomId, createdAt)` for history queries |
| `participants` | id, roomId, userId | Unique index on `(userId, roomId)` |
| `waitlist` | id, email (unique), fullName, interests (JSON), location, profession | Pre-launch signup capture |
| `authAuditLogs` | id, ipAddress, eventType, attemptedIdentity, userAgent, createdAt | Security audit trail |

### Zod Validation Schemas (also in shared)
- `anonymousAuthSchema` — username validation (3-20 chars, alphanumeric + underscore)
- `upgradeAuthSchema` — email + strong password (8+ chars, upper/lower/number/special)
- `loginAuthSchema` — usernameOrEmail + password
- `createRoomSchema` — name, description, lat/lng, interests (1-5 tags)
- `nearbyRoomsQuerySchema` — lat/lng, radiusKm (1-5000, default 50), optional interests filter
- `insertWaitlistSchema` / `selectWaitlistSchema`

---

## API Routes

All routes prefixed with `/api`. Standardized response format: `{ data, error, meta }`.

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/anonymous` | ❌ | Create/login anonymous user, returns JWT |
| POST | `/login` | ❌ | Standard email/username + password login |
| POST | `/upgrade` | ✅ | Upgrade anonymous account with email/password |
| POST | `/refresh` | Cookie | Rotate refresh token, issue new access token |
| POST | `/logout` | Cookie | Blacklist refresh token, clear cookie |

### Rooms (`/api/rooms`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✅ | Create room with PostGIS location |
| GET | `/nearby` | ✅ | Discover rooms via `ST_DWithin` spatial query |
| GET | `/global` | ✅ | Fallback: all active rooms (no GPS required) |
| GET | `/:id/history` | ✅ | Fetch last 50 messages with usernames |

### Other
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/waitlist` | ❌ | Join waitlist (rate: 3/hour) |
| GET | `/api/health` | ❌ | Health check (DB + Redis latency, memory) |
| GET | `/api/test-db` | ❌ | DB + Redis connectivity test |
| GET | `/api/csrf` | ❌ | Get CSRF token |

---

## WebSocket Protocol

**Endpoint:** `GET /ws?token=<JWT>`

Authentication via JWT query parameter (WebSocket constructor can't send headers).

### Client → Server Events
| Type | Payload | Description |
|------|---------|-------------|
| `join_room` | `{ roomId: number }` | Subscribe to room channel |
| `send_message` | `{ roomId: number, content: string }` | Send chat message (max 5000 chars) |
| `leave_room` | — | Leave room |
| `typing_start` | `{ roomId: number }` | Typing indicator on |
| `typing_stop` | `{ roomId: number }` | Typing indicator off |

### Server → Client Events
| Type | Payload | Description |
|------|---------|-------------|
| `connected` | `{ userId }` | Connection acknowledged |
| `new_message` | `{ id, roomId, userId, username, content, createdAt }` | New chat message |
| `user_joined` | `{ roomId, userId, username }` | User entered room |
| `user_left` | `{ roomId, userId, username }` | User left room |
| `typing_start/stop` | `{ roomId, userId, username }` | Typing indicators |
| `room_summary_update` | `{ content, timestamp }` | AI-generated room summary |
| `room_summary_pending` | `{ timestamp }` | Summary being generated |
| `room_summary_unavailable` | `{ timestamp }` | Summary not available |
| `error` | `{ message }` | Error notification |

### Rate Limiting
- HTTP: 100 requests/minute globally (Redis-backed)
- Auth endpoints: 5 requests/minute
- Waitlist: 3 requests/hour
- WebSocket: 5 messages/second per client (in-memory sliding window)

### Heartbeat
- Server pings every 30 seconds
- Clients must respond with pong
- Dead connections terminated on next interval

---

## Authentication System

### Flow: Anonymous → Upgraded
1. User enters username → `POST /api/auth/anonymous` → anonymous JWT issued
2. User chats freely with temporary identity
3. User clicks "Upgrade" → `POST /api/auth/upgrade` → adds email + password
4. Subsequent logins via `POST /api/auth/login`

### Token Architecture
- **Access Token:** RS256 JWT, 15-minute expiry, contains `{ id, username, role }`
- **Refresh Token:** RS256 JWT, 7-day expiry, stored in HTTP-only cookie, contains unique `jti`
- **Token Rotation:** On refresh, old token's `jti` is blacklisted in Redis
- **Password Hashing:** Argon2

### Client-Side Auth
- Zustand store (`authStore.ts`) persisted to localStorage
- Axios interceptor attaches `Authorization: Bearer <token>` to all requests
- 401 responses trigger automatic logout
- Next.js middleware (`proxy.ts`) checks `refreshToken` cookie for protected routes

---

## Background Jobs (BullMQ)

Queue name: `intellicircle-queue`. Worker runs as separate process (`src/worker.ts`).

| Job | Schedule | Description |
|-----|----------|-------------|
| `summarizeRoom` | On-demand (when user joins) | Fetches last 50 messages, sends to Gemini 2.5 Flash, caches summary in Redis (1h TTL) |
| `deadRoomCleanup` | Hourly cron (`0 * * * *`) | Archives rooms with no messages in 24 hours (sets `isActive = 0`) |

The worker binds a dummy HTTP server for Render health checks.

AI summarization anonymizes PII (emails, phone numbers) before sending to the LLM.

---

## Frontend Architecture

### Route Groups (Next.js App Router)
```
src/app/
├── page.tsx              # Landing page (marketing)
├── layout.tsx            # Root layout (Inter + Space Grotesk fonts, Providers, Header, Footer)
├── not-found.tsx         # 404 page
├── globals.css           # Tailwind imports
├── auth/page.tsx         # Auth page
├── (app)/                # Authenticated app routes
│   ├── discover/         # Room discovery with geolocation
│   ├── chat/             # Chat room list
│   │   └── [id]/         # Individual chat room
│   ├── dashboard/        # User dashboard
│   └── profile/          # User profile
└── (marketing)/          # Public marketing pages
    ├── about/
    ├── contact/
    ├── privacy/
    ├── terms/
    └── waitlist/
```

### Key Components
| Component | Purpose |
|-----------|---------|
| `providers.tsx` | QueryClientProvider (TanStack Query) |
| `posthog-provider.tsx` | PostHog analytics + Web Vitals reporting |
| `header.tsx` | Navigation with auth-aware state |
| `footer.tsx` | Site footer |
| `auth-modal.tsx` | Anonymous login / registration modal |
| `upgrade-modal.tsx` | Account upgrade (add email/password) |
| `CreateRoomModal.tsx` | Room creation with location + interests |
| `mobile-drawer.tsx` | Mobile navigation drawer |
| `page-transition.tsx` | Framer Motion page transitions |

### Custom Hooks
| Hook | Purpose |
|------|---------|
| `useSocket` | WebSocket lifecycle, exponential backoff reconnection, message pub/sub |
| `useGeolocation` | Browser Geolocation API wrapper with error handling |

### State Management
- **`authStore`** (Zustand + persist): `user`, `accessToken`, `isAuthenticated`, `setAuth()`, `logout()`
- **`useAppStore`** (Zustand): `roomId`, `setRoomId()` — tracks active room

### API Client (`lib/api.ts`)
- Axios instance with `baseURL` from `NEXT_PUBLIC_API_URL`
- Request interceptor: attaches JWT Bearer token
- Response interceptor: auto-logout on 401

---

## Security

### Server-Side
- **Helmet:** HTTP security headers
- **CORS:** Whitelist-based origins in production, open in development
- **CSRF:** Token-based protection via `@fastify/csrf-protection`
- **Rate Limiting:** Redis-backed, per-route customization
- **Payload Validation:** All inputs validated with Zod before processing
- **XSS Prevention:** DOMPurify sanitizes all chat messages (strips all HTML)
- **JWT:** Asymmetric RS256 (no shared secrets across services)
- **Password:** Argon2 hashing
- **Audit Logging:** Failed auth attempts logged to `authAuditLogs` table
- **Log Redaction:** Pino redacts authorization headers, cookies, tokens, PII, message content

### Client-Side
- **CSP:** Content-Security-Policy headers in `next.config.mjs`
- **X-Content-Type-Options:** nosniff
- **Referrer-Policy:** strict-origin-when-cross-origin
- **Edge Caching:** Marketing pages cached at CDN (1h s-maxage, 24h stale-while-revalidate)

### CI/CD Security
- **npm audit:** Critical vulnerability scanning
- **TruffleHog:** Secret scanning in repository

---

## Observability

### Logging
- **Pino** with structured JSON (production) or pretty-print (development)
- PII fields automatically redacted: `authorization`, `cookie`, `email`, `password`, `content`
- Datadog Agent / log drain consumes stdout JSON in production

### Metrics (StatsD → Datadog)
| Metric | Type | Description |
|--------|------|-------------|
| `http_request_duration_ms` | histogram | Per-route latency with status codes |
| `http_5xx_errors` | counter | 5xx error count per route |
| `active_ws_connections` | gauge | Live WebSocket connection count |
| `messages_per_minute` | counter | Chat messages per room |
| `db_query_time` | histogram | Tagged DB query durations |
| `event_loop_lag_ms.*` | gauge | p50/p95/p99/mean event loop lag |
| `redis_used_memory_bytes` | gauge | Redis memory consumption |
| `redis_memory_usage_percent` | gauge | Redis memory vs maxmemory |

### APM
- **dd-trace:** Imported first in `index.ts` for automatic instrumentation
- Traces HTTP requests, DB queries, Redis commands

### Product Analytics (PostHog)
Events: `waitlist_joined`, `location_granted`, `room_joined`, `message_sent`, `web_vital`

---

## Deployment

### Production Infrastructure
- **Frontend:** Vercel (Next.js Edge Network)
- **Backend API:** Render.com (Web Service, Node.js)
- **Background Worker:** Render.com (Worker Service)
- **Database:** Render PostgreSQL (with PostGIS) or Supabase
- **Redis:** Upstash (serverless Redis with TLS)

### CI/CD Pipelines (`.github/workflows/`)
| Workflow | Trigger | Steps |
|----------|---------|-------|
| `ci.yml` | Push/PR to main | Install → Build shared → Build server → Build client → Type check |
| `deploy-production.yml` | Push to main | Trigger Render deploy hooks → Wait for health check → Auto-rollback on failure |
| `security.yml` | Push/PR to main | npm audit (critical) → TruffleHog secret scan |

### Render Config (`render.yaml`)
- Web tier: Build shared+server, pre-deploy runs PostGIS enable + migrations
- Worker tier: Separate service for BullMQ processor
- Auto-scaling configs documented (commented out, requires Starter+ plan)

### Build Order (Critical)
1. `@intellicircle/shared` must build first (other packages import from it)
2. `@intellicircle/server` second
3. `@intellicircle/client` last

---

## Database Connection

- **Pool:** max 20 connections, 20s idle timeout, 10s connect timeout, 30min max lifetime
- **PgBouncer compatible:** `prepare: false` (required for transaction-mode pooling)
- **SSL:** Required (`ssl: 'require'`)
- **Migrations:** `drizzle-orm/postgres-js/migrator` — standalone script that only needs `DATABASE_URL`

---

## Code Conventions

### Response Format
All API responses use the standardized envelope from `utils/response.ts`:
```typescript
{ data: T | null, error: { message, code?, details? } | null, meta? }
```

### File Organization
- **Server routes:** One file per domain (`auth.ts`, `rooms.ts`, `waitlist.ts`, `health.ts`)
- **Server services:** Business logic extracted to `services/` (geocoding, queue)
- **Server jobs:** Background job handlers in `jobs/`
- **Client components:** Feature components at `components/`, no `ui/` primitives (Shadcn removed in migration)
- **Shared schemas:** All Drizzle tables AND Zod validators co-located in `schema.ts`

### TypeScript
- Strict mode enabled across all packages
- Server: CommonJS module output, ES2022 target
- Client: Next.js defaults (bundler moduleResolution)
- Shared: Compiled to `dist/` with `.d.ts` declarations
- Path aliases: `@/*` → client src, `~/*` → server src

### Naming Conventions
- Files: kebab-case for components (`auth-modal.tsx`), camelCase for utilities (`authStore.ts`)
- Database columns: snake_case (Drizzle maps to camelCase in TypeScript)
- API routes: RESTful (`/api/rooms/nearby`, `/api/auth/anonymous`)
- WebSocket events: snake_case (`join_room`, `send_message`, `new_message`)

---

## Common Gotchas

1. **`@intellicircle/shared` not found:** Run `npm install` at root first to link workspaces
2. **Port conflicts:** Kill orphan Node processes: `Get-Process node | Stop-Process -Force`
3. **Discover 400 errors:** Browser must have Geolocation enabled
4. **WebSocket reconnecting:** Verify Redis connection string in `.env`
5. **PostGIS errors:** Run `npm run db:enable-postgis` before migrations
6. **JWT key format:** Keys in `.env.keys` must have `\\n` literal newlines (not actual newlines)
7. **localhost IPv6:** Client replaces `localhost` with `127.0.0.1` to avoid IPv6 issues on Windows Chrome
8. **PgBouncer:** `prepare: false` is required — without it, queries fail with "prepared statement does not exist"
9. **Build order:** Always build `shared` before `server` or `client`
10. **Worker health:** Render requires port binding even for workers — dummy HTTP server handles this
