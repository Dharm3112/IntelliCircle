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
├── legacy
│   ├── client
│   │   ├── index.html
│   │   └── src
│   │       ├── App.tsx
│   │       ├── components
│   │       │   ├── ui
│   │       │   │   ├── accordion.tsx
│   │       │   │   ├── alert-dialog.tsx
│   │       │   │   ├── alert.tsx
│   │       │   │   ├── aspect-ratio.tsx
│   │       │   │   ├── avatar.tsx
│   │       │   │   ├── badge.tsx
│   │       │   │   ├── breadcrumb.tsx
│   │       │   │   ├── button.tsx
│   │       │   │   ├── calendar.tsx
│   │       │   │   ├── card.tsx
│   │       │   │   ├── carousel.tsx
│   │       │   │   ├── chart.tsx
│   │       │   │   ├── checkbox.tsx
│   │       │   │   ├── collapsible.tsx
│   │       │   │   ├── command.tsx
│   │       │   │   ├── context-menu.tsx
│   │       │   │   ├── dialog.tsx
│   │       │   │   ├── drawer.tsx
│   │       │   │   ├── dropdown-menu.tsx
│   │       │   │   ├── form.tsx
│   │       │   │   ├── hover-card.tsx
│   │       │   │   ├── input-otp.tsx
│   │       │   │   ├── input.tsx
│   │       │   │   ├── label.tsx
│   │       │   │   ├── menubar.tsx
│   │       │   │   ├── navigation-menu.tsx
│   │       │   │   ├── pagination.tsx
│   │       │   │   ├── popover.tsx
│   │       │   │   ├── progress.tsx
│   │       │   │   ├── radio-group.tsx
│   │       │   │   ├── resizable.tsx
│   │       │   │   ├── scroll-area.tsx
│   │       │   │   ├── select.tsx
│   │       │   │   ├── separator.tsx
│   │       │   │   ├── sheet.tsx
│   │       │   │   ├── sidebar.tsx
│   │       │   │   ├── skeleton.tsx
│   │       │   │   ├── slider.tsx
│   │       │   │   ├── switch.tsx
│   │       │   │   ├── table.tsx
│   │       │   │   ├── tabs.tsx
│   │       │   │   ├── textarea.tsx
│   │       │   │   ├── toast.tsx
│   │       │   │   ├── toaster.tsx
│   │       │   │   ├── toggle-group.tsx
│   │       │   │   ├── toggle.tsx
│   │       │   │   └── tooltip.tsx
│   │       │   └── waitlist-form.tsx
│   │       ├── hooks
│   │       │   ├── use-mobile.tsx
│   │       │   └── use-toast.ts
│   │       ├── index.css
│   │       ├── lib
│   │       │   ├── queryClient.ts
│   │       │   └── utils.ts
│   │       ├── main.tsx
│   │       └── pages
│   │           ├── chat.tsx
│   │           ├── discover.tsx
│   │           ├── home.tsx
│   │           ├── not-found.tsx
│   │           └── profile.tsx
│   ├── server
│   │   ├── db.ts
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   ├── storage.ts
│   │   └── vite.ts
│   └── shared
│       └── schema.ts
├── packages
│   ├── client
│   │   ├── lint.log
│   │   ├── next-env.d.ts
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── src
│   │   │   ├── app
│   │   │   │   ├── (app)
│   │   │   │   │   ├── chat
│   │   │   │   │   │   ├── [id]
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── dashboard
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── discover
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── profile
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (marketing)
│   │   │   │   │   ├── about
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── contact
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── privacy
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── terms
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── waitlist
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── auth
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── globals.css
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── not-found.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components
│   │   │   │   ├── CreateRoomModal.tsx
│   │   │   │   ├── auth-modal.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── mobile-drawer.tsx
│   │   │   │   ├── page-transition.tsx
│   │   │   │   ├── posthog-provider.tsx
│   │   │   │   ├── providers.tsx
│   │   │   │   └── upgrade-modal.tsx
│   │   │   ├── hooks
│   │   │   │   ├── useGeolocation.ts
│   │   │   │   └── useSocket.ts
│   │   │   ├── lib
│   │   │   │   ├── api.ts
│   │   │   │   └── utils.ts
│   │   │   ├── middleware.ts
│   │   │   └── store
│   │   │       ├── authStore.ts
│   │   │       └── index.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.tsbuildinfo
│   │   └── typescript-errors.log
│   ├── server
│   │   ├── .env
│   │   ├── .env.keys
│   │   ├── Dockerfile
│   │   ├── check-logs.ts
│   │   ├── check_db.ts
│   │   ├── drizzle.config.ts
│   │   ├── inject_nearby.txt
│   │   ├── inject_nearby_fixed.txt
│   │   ├── inject_out.txt
│   │   ├── migrations
│   │   │   ├── 0000_fantastic_shriek.sql
│   │   │   ├── 0001_youthful_ser_duncan.sql
│   │   │   ├── 0002_steady_xavin.sql
│   │   │   └── meta
│   │   │       ├── 0000_snapshot.json
│   │   │       ├── 0001_snapshot.json
│   │   │       ├── 0002_snapshot.json
│   │   │       └── _journal.json
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.ts
│   │   │   ├── config
│   │   │   │   └── env.ts
│   │   │   ├── db
│   │   │   │   ├── enable-postgis.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── redis.ts
│   │   │   │   ├── run-migrations.ts
│   │   │   │   └── seed.ts
│   │   │   ├── index.ts
│   │   │   ├── jobs
│   │   │   │   ├── deadRoomCleanup.ts
│   │   │   │   └── summarizeRoom.ts
│   │   │   ├── plugins
│   │   │   ├── routes
│   │   │   │   ├── auth.ts
│   │   │   │   ├── health.ts
│   │   │   │   ├── rooms.ts
│   │   │   │   ├── test-db.ts
│   │   │   │   └── waitlist.ts
│   │   │   ├── services
│   │   │   │   ├── geocoding.ts
│   │   │   │   └── queue.ts
│   │   │   ├── test_inject.ts
│   │   │   ├── utils
│   │   │   │   ├── auth.ts
│   │   │   │   ├── logger.ts
│   │   │   │   ├── metrics.ts
│   │   │   │   └── response.ts
│   │   │   ├── websocket
│   │   │   │   ├── pubsub.ts
│   │   │   │   └── wsHandler.ts
│   │   │   └── worker.ts
│   │   ├── test_inject.ts
│   │   ├── test_ws.ts
│   │   └── tsconfig.json
│   └── shared
│       ├── package.json
│       ├── src
│       │   ├── index.d.ts
│       │   ├── index.js
│       │   ├── index.ts
│       │   ├── schema.d.ts
│       │   ├── schema.js
│       │   └── schema.ts
│       ├── test_schema.ts
│       ├── test_zod_bug.ts
│       └── tsconfig.json
├── .env.example
├── .gitignore
├── .nvmrc
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── deploy.md
├── netlify.toml
├── package-lock.json
├── package.json
├── docker-compose.yml
├── drizzle.config.ts
├── generate-keys.js
├── generated-icon.png
├── postcss.config.js
├── render.yaml
├── replit.md
├── tailwind.config.ts
├── test_api.js
├── theme.json
├── tsconfig.json
└── vite.config.ts
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
