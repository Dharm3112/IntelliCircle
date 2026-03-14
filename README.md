<div align="center">
  <h1>✨ IntelliCircle ✨</h1>
  <p><strong>The real-time, location-aware watercooler for local professional networking.</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#architecture--tech-stack">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#project-structure">Folder Structure</a> •
    <a href="#design--ux">Design Philosophy</a> •
    <a href="#troubleshooting">Troubleshooting</a>
  </p>
</div>

---

## 📖 Product Overview

**IntelliCircle** is a modern, real-time networking and chat application designed to digitally map users to hyper-localized professional groups. 
We remove the friction of traditional networking by providing spontaneous, hyper-local chat environments. IntelliCircle calculates physical proximity to instantly drop users into curated professional hubs based entirely on shared interests. 

While platforms like LinkedIn serve as a global, asynchronous resume repository, IntelliCircle serves as the **synchronous, location-aware watercooler**. Stop swiping. Start meeting.

---

## 🚀 Key Features

* **🌍 Location-Based Discovery**: Automatically detects your city and calculates real-time distances to active chat rooms using `PostGIS` native geospatial indexes.
* **⚡ Ultra-Low Latency Messaging**: Sub-50ms native WebSocket broadcasting powered by `ws` and scaled horizontally via `Redis Pub/Sub`. 
* **🎯 Frictionless Zero-Click Entry**: Users can join local rooms immediately with temporary aliases. No lengthy signup walls required.
* **🤖 AI-Powered Context**: Integrates with Google Gemini Flash 2.5 (via `BullMQ` background jobs) to automatically summarize missed conversations in active rooms.
* **🔒 Enterprise-Grade Security**: Fully asymmetric JWT authentication (RS256), `Zod` payload validation across the entire stack, CSRF protection, and strict rate limiting.

---

## 🏗️ Architecture & Tech Stack

IntelliCircle leverages a cutting-edge decoupled Client-Server architecture utilizing an **npm Workspaces Monorepo**. This allows for strict type-sharing while maintaining isolated execution environments.

### Frontend (`@intellicircle/client`)
Built for SEO, speed, and seamless UX.
- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
- **UI & Styling:** Tailwind CSS, Shadcn UI, and highly-optimized Framer Motion micro-interactions.
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Client Global State) + TanStack Query/React Query (Server State).
- **Infinite Scrolling:** `react-virtuoso` for rendering massive chat logs without frame drops.

### Backend (`@intellicircle/server`)
High-throughput, real-time processing engine.
- **Framework:** [Fastify](https://fastify.dev/) for maximum JSON parsing speed.
- **WebSockets:** `@fastify/websocket` binding native Node.js `ws` to the HTTP instance.
- **Queue System:** `BullMQ` (Redis) for heavy async jobs (Email dispatch, AI Summarization).
- **AI Integration:** `@google/generative-ai` for intelligent room summaries.

### Database Layer
- **Primary Database:** PostgreSQL with the **PostGIS** extension for `ST_DWithin` spatial queries.
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/), the fastest TypeScript ORM available.
- **Broker & Caching:** Redis (Upstash) serving as the WebSocket Pub/Sub backplane, rate-limit store, and job queue.

### Universal Validation (`@intellicircle/shared`)
- **[Zod](https://zod.dev/)**: Ensures type safety across the network boundary, strictly typing DB schemas, WS payloads, and REST APIs.

---

## 📂 Project Structure

```text
IntelliCircle/
├── package.json               # Root monorepo workspace definition
├── README.md                  # This documentation
├── PRD.md                     # Product Requirements
├── Design Doc.md              # UX & Design Philosophy
├── Tech Stack.md              # Technical Architecture details
│
├── packages/
│   ├── client/                # Next.js 14 Frontend Application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router (/(app)/chat, /auth, /discover)
│   │   │   ├── components/    # Reusable UI (Radix Primitives, ChatBubbles)
│   │   │   ├── hooks/         # Custom React hooks (useSocket, useGeolocation)
│   │   │   ├── lib/           # Axios singletons and generic utilities
│   │   │   └── store/         # Zustand authentication & session store
│   │   └── tailwind.config.ts # Global theme definitions
│   │
│   ├── server/                # Fastify Node.js Backend API
│   │   ├── src/
│   │   │   ├── config/        # Environment validation (Env Zod Schemas)
│   │   │   ├── db/            # Drizzle configuration and seed scripts
│   │   │   ├── routes/        # Fastify REST endpoints (Auth, Waitlist, Rooms)
│   │   │   ├── services/      # 3rd party modules (OpenCage API, Gemini 2.5)
│   │   │   ├── websocket/     # Real-time message handlers & Redis Adapters
│   │   │   └── worker.ts      # BullMQ background worker ingest process
│   │   └── drizzle.config.ts  # Database migration configuration
│   │
│   └── shared/                # Universal Cross-Platform Logic
│       └── src/
│           └── schema.ts      # Single-Source-of-Truth DB queries & Zod schemas
```

---

## 🛠️ Getting Started Locally

Because IntelliCircle is a strictly defined monorepo, **running `npm run dev` in the root folder will fail**. You must run the Client and Server as separate, concurrent processes.

### Prerequisites
1. **Node.js** v20+
2. **PostgreSQL** instance with PostGIS installed.
3. **Redis** instance (Local or Upstash Serverless).
4. Environment variables configured properly (See `.env.example` in both `client` and `server` packages).

### Step 1: Start the Backend Layer
The Fastify server builds the DB connection pool and spins up the WebSocket server on port `8080`.
```bash
# Terminal 1
cd packages/server
npm i
npm run db:push     # Synchronize Drizzle schema to PostgreSQL
npm run dev         # Starts Fastify on http://localhost:8080
```
> **Note:** To test AI and background jobs, you may also need to start the BullMQ worker in an adjacent terminal using `npm run worker`.

### Step 2: Start the Frontend UI
The Next.js client runs on port `3000` and proxys to the backend.
```bash
# Terminal 2
cd packages/client
npm i
npm run dev         # Starts Next.js on http://localhost:3000
```

Open `http://localhost:3000` in your browser. Upon clicking **"Find Nearby Rooms"**, you will be prompted for Location access by your browser.

---

## 🗄️ Database Management (Drizzle ORM)

Our single source of truth for all schemas lives in `packages/shared/src/schema.ts`.
This ensures that frontend forms and backend queries use the exact same Zod validation objects.

When modifying the database structure in `schema.ts`, apply changes to your PostgreSQL instance by navigating to `packages/server` and running:
```bash
npm run db:generate   # Generates SQL migration files
npm run db:push       # Pushes migrations to the DB
```
*Note: Depending on your config, some projects rely solely on `db:push` for rapid prototyping.*

---

## 🎨 Design & UX 

IntelliCircle heavily relies on specific UX principles to convert casual browsers into engaged community members:
1. **Dark, Deep Palette:** A high-contrast `#0A0A0A` background layered with electric indigo (`#4F46E5`) neon accents creates a secure, tech-forward environment.
2. **Product-Led Growth (PLG):** The application delays account creation until **after** a user has engaged in a chat, bypassing traditional signup walls and significantly boosting conversion.
3. **Typography:** We use `Inter` for hyper-legible chat interfaces and stark formatting.

*(See `Design Doc.md` for our complete design system details).*

---

## 🐛 Troubleshooting

* **"Error: Cannot find module '@intellicircle/shared'"**
  Ensure you ran `npm install` at the **root** of the monorepo first so NPM links the workspaces.
* **"Port 3000 / 8080 is already in use"**
  You likely have an orphaned Node process.
  * Windows: `Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force`
  * Mac/Linux: `pkill -f node`
* **"Discover Page: 400 Bad Request"**
  Your browser must have Geolocation enabled. If testing locally, ensure you aren't blocking location API requests.
* **"WebSocket Reconnecting..."**
  The Fastify server requires a valid Redis connection string in the `.env` to bind the Pub/Sub network. Validate your Redis URI.

---

## 🤝 Contributing

When contributing to IntelliCircle, please ensure your changes respect the `shared` boundaries. If you alter the database, update the Zod schemas; the Next.js client and Fastify server will instantly inherit these validation rules.

*Designed with 🩵 for local networking.*
