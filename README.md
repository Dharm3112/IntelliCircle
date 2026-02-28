# ✨ IntelliCircle

**IntelliCircle** is a modern, real-time networking and chat application designed to digitally map users to hyper-localized professional groups. Stop swiping. Start meeting. IntelliCircle calculates physical proximity graphs to instantly drop users into local, highly-curated professional hubs based entirely on shared interests.

---

## 🏗️ Architecture & Tech Stack

IntelliCircle utilizes a scalable **npm Workspaces Monorepo**. The frontend and backend codebases live together to share data validation schemas and types but run entirely independently.

### Frontend (`packages/client`)
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS & Glassmorphism Design System
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Persistent Local Storage) & TanStack Query
- **Animations:** Framer Motion (Page Transitions, Dynamic Typing Indicators)
- **Data Rendering:** `react-virtuoso` (Virtualized infinite chat histories)

### Backend (`packages/server`)
- **Server:** [Fastify](https://fastify.dev/) 
- **Real-Time:** `@fastify/websocket` over standard `ws` protocols
- **Scaling Backplane:** [Redis Pub/Sub](https://redis.io/) (via Upstash Serverless) for horizontal socket scaling
- **ORM & DB:** [Drizzle ORM](https://orm.drizzle.team/) connecting to PostgreSQL (Supabase)
- **Geospatial Math:** **PostGIS** (`ST_DWithin`, `ST_MakePoint`) for calculating earth-curvature distances natively in Postgres.
- **Security:** Argon2 Hashing, Asymmetric JWTs (RS256), `@fastify/rate-limit`, `@fastify/csrf-protection`

### Shared APIs (`packages/shared`)
- **Validation:** [Zod](https://zod.dev/) schemas defining strict payloads boundary parsing for both Client and Server.

---

## 📂 Real-Time Folder Structure

```text
IntelliCircle/
├── package.json               # Root monorepo workspace definition
├── README.md                  # This documentation
├── TODO.md                    # Project Roadmap & MVP Tracking
│
├── packages/
│   ├── client/                # Next.js Frontend Application
│   │   ├── src/
│   │   │   ├── app/           # App Router Pages (/(app)/chat, /auth, /discover)
│   │   │   ├── components/    # Reusable UI (AuthModal, MobileDrawer, PageTransition)
│   │   │   ├── hooks/         # Custom React hooks (useSocket, useGeolocation)
│   │   │   ├── lib/           # Intercepted Axios API clients
│   │   │   └── store/         # Zustand authentication & session store
│   │   └── tailwind.config.ts # Global theme definitions
│   │
│   ├── server/                # Fastify Backend API
│   │   ├── src/
│   │   │   ├── config/        # Environment validation (Zod)
│   │   │   ├── db/            # Drizzle instance and seeding scripts
│   │   │   ├── routes/        # REST APIs (auth.ts, rooms.ts, waitlist.ts)
│   │   │   ├── services/      # 3rd party integrations (OpenCage Geocoding)
│   │   │   ├── websocket/     # Real-time WebSocket handlers & Redis Pub/Sub adapters
│   │   │   └── app.ts         # Fastify bootstrapper and Global Error Handlers
│   │   └── drizzle.config.ts  # Database migration configuration
│   │
│   └── shared/                # Universal Cross-Platform Logic
│       └── src/
│           └── schema.ts      # Single-Source-of-Truth DB Schemas & Zod validation
```

---

## � How to Start the Project Locally

Because this is a monorepo, **running `npm run dev` in the root folder will fail with a "Missing script" error.** 
You must start the Frontend and Backend servers in **two separate terminal windows**.

### Prerequisites
1. Node.js (v20+ Recommended)
2. Valid `.env` files in both `packages/server` and `packages/client` containing Supabase PostgreSQL and Upstash Redis URIs.

### Step 1: Start the Backend API (Fastify)
The backend handles the Database and Real-time WebSockets.
1. Open Terminal 1.
2. Navigate to the server folder:
   ```bash
   cd packages/server
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *Success Output:* `🚀 Server listening on http://localhost:8080` (or 8081)

### Step 2: Start the Frontend UI (Next.js)
1. Open Terminal 2.
2. Navigate to the client folder:
   ```bash
   cd packages/client
   ```
3. Start the UI:
   ```bash
   npm run dev
   ```
   *Success Output:* `Ready in X.Xms - Local: http://localhost:3000`

### Step 3: View the App
Open your web browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🗄️ Database Changes (Drizzle)

We use Drizzle ORM to manage Postgres. Our single source of truth for the schema lives in `packages/shared/src/schema.ts`.
If you ever modify a schema there, you need to push those changes to the live Supabase database.

From the `packages/server` folder, run:
```bash
npm run db:push
```

---

## 🐛 Common Troubleshooting

*   **"npm error Missing script: dev"**
    *   You are running Node in the root folder. You *must* `cd` into either `packages/client` or `packages/server` first!
*   **"Port 3000 / 8080 is already in use"**
    *   You have an orphaned process. Open PowerShell in Windows and run:
        `Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force`
*   **"Discover Page: 400 Bad Request"**
    *   Ensure that you granted Location/GPS permissions in your web browser. The Discover page mathematically filters rooms based on your exact physical location coordinates.
*   **"WebSocket Reconnecting..." constantly flashes**
    *   Ensure that your Upstash Redis credentials inside `packages/server/.env` are active. WebSockets require the Redis PubSub backbone to bind.
