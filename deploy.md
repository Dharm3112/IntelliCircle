# IntelliCircle Deployment Guide (Free Hosting)

This guide provides a fully detailed, step-by-step process for deploying the IntelliCircle full-stack application (Vite Client + Fastify Server + PostgreSQL + Redis + BullMQ Worker) using entirely **free** hosting providers.

## Architecture Overview
*   **Database (PostgreSQL):** Render (Free Tier)
*   **Redis (Cache & WebSockets):** Upstash (Free Tier)
*   **Backend API (Node.js/Fastify):** Render Web Service (Free Tier)
*   **Background Worker (BullMQ):** Render Worker Service (Free Tier)
*   **Frontend Client (React/Vite):** Netlify (Free Tier)

---

## Prerequisites
1. A [GitHub](https://github.com/) account with this repository pushed to it.
2. A [Render](https://render.com/) account.
3. A [Netlify](https://netlify.com/) account.
4. An [Upstash](https://upstash.com/) account.
5. Node.js installed on your local machine.

---

## Step 1: Generate Cryptographic Keys
The Fastify server requires RSA keys to sign JWT tokens securely. You need to generate these locally before deploying.

1. Open your terminal in the root of the project.
2. Run the following command:
   ```bash
   node generate-keys.js
   ```
3. This creates a `.env.keys` file containing your `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`. Keep these safe; you will need to paste them into Render shortly.

---

## Step 2: Setup Upstash Redis (Free)
The app uses Redis for WebSocket Pub/Sub and BullMQ background job processing. Upstash provides a generous free serverless Redis tier.

1. Go to your [Upstash Dashboard](https://console.upstash.com/).
2. Click **Create Database**.
   *   **Name:** `intellicircle-redis`
   *   **Type:** Regional
   *   **Region:** Choose the one closest to where you will deploy Render (e.g., US East or Europe).
   *   Enable **Eviction** (Optional, but recommended for free tiers).
3. Once created, scroll down to the **Connect** section.
4. Copy the **Redis URL** (Make sure to select the `rediss://...` format). Save this for Step 3.

---

## Step 3: Deploy Backend & Database on Render
This project comes with a `render.yaml` Infrastructure as Code (IaC) file, making backend deployment nearly automatic.

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click the **New +** button and select **Blueprint**.
3. Connect your GitHub account and select the `IntelliCircle` repository.
4. Render will read the `render.yaml` file and automatically prepare to create:
   *   `intellicircle-db` (PostgreSQL Database)
   *   `intellicircle-server` (Web API)
   *   `intellicircle-worker` (Background Jobs Worker)
5. **Environment Variables:** Render will prompt you for variables marked as `sync: false` or those not hardcoded. Provide the following:
   *   `DATADOG_API_KEY`: *(Optional)* Leave blank unless you use DataDog.
   *   `NEXT_PUBLIC_POSTHOG_KEY`: *(Optional)* Leave blank unless you use PostHog.
   *   `GEMINI_API_KEY`: **(Required)** Your Google Gemini API Key for AI features. (Get it from [Google AI Studio](https://aistudio.google.com/)).
   *   `REDIS_URL`: **(Required)** Paste the `rediss://...` URL you got from Upstash in Step 2.
   *   `JWT_PRIVATE_KEY`: **(Required)** Paste the huge private key block generated in Step 1. (Include the `-----BEGIN...` and `-----END...` lines).
   *   `JWT_PUBLIC_KEY`: **(Required)** Paste the public key block generated in Step 1.
6. Click **Apply**.
7. Render will begin deploying your Database first, then your Server and Worker. *Note: Free tier deployments might take a few minutes.*
8. Once `intellicircle-server` shows as "Live", click on it to go to its specific dashboard page.
9. **Copy the Public URL** (It will look something like `https://intellicircle-server-xxxx.onrender.com`). You will need this for the frontend!

---

## Step 4: Run Database Migrations
Before the app can work, you need to create the tables inside your new Render PostgreSQL database.

1. On the Render Dashboard, navigate to your `intellicircle-server` Web Service.
2. Click on the **Shell** tab on the left sidebar.
3. Wait for the terminal to connect, then run the following command to enable PostGIS (Required for geocoding):
   ```bash
   npm run db:enable-postgis -w @intellicircle/server
   ```
4. Run the schema migrations:
   ```bash
   npm run db:push -w @intellicircle/server
   ```
5. **CRITICAL:** Solve the "Cold Start" problem by seeding global virtual rooms:
   ```bash
   npm run seed:production -w @intellicircle/server
   ```

> For advanced recovery, failures during deployment, or lost data, refer to our [Disaster Recovery Runbook](docs/disaster-recovery-runbook.md) and our [Production Checklist](docs/production-checklist.md).


---

## Step 5: Deploy Frontend on Netlify
The Vite client is configured to be seamlessly deployed via the included `netlify.toml` file.

1. Go to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Connect your GitHub account and select your `IntelliCircle` repository.
4. Netlify will automatically detect the build settings from `netlify.toml` (`npm run build:client` and publish directory `dist/public`).
5. **CRITICAL: Set Environment Variables:** Before clicking Deploy, click **Add environment variables** and enter the following:
   *   `NEXT_PUBLIC_API_URL`: Set this to your Render Backend URL with `/api` at the end (e.g., `https://intellicircle-server-xxxx.onrender.com/api`).
   *   `NEXT_PUBLIC_WS_URL`: Set this to your Render Backend URL, but replace `https` with `wss` (e.g., `wss://intellicircle-server-xxxx.onrender.com`).
   *   `NEXT_PUBLIC_POSTHOG_KEY`: *(Optional)* Your PostHog key if using frontend tracking.
6. Click **Deploy Site**.
7. Wait ~2 minutes for Netlify to finish the build.
8. Once done, Netlify will provide you with a live URL for your client application!

---

## Troubleshooting
*   **"Cannot connect to Database" on Render Server:** Render free databases take about 1-2 minutes to accept connections after spinning up. If the server fails to start initially, just click `Manual Deploy > Clear build cache & deploy` on the `intellicircle-server`.
*   **CORS Errors on Frontend:** Ensure that your `NEXT_PUBLIC_API_URL` exactly matches the Render URL (without any trailing slashes other than `/api`). The backend is configured to accept connections dynamically, but a mismatched URL will break API calls.
*   **WebSockets not connecting:** Double check that your `NEXT_PUBLIC_WS_URL` starts with `wss://` and **not** `https://`.
