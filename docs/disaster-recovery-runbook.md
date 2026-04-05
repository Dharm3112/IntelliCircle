# IntelliCircle Disaster Recovery Runbook

This document defines the standard operating procedures for catastrophic failures in the IntelliCircle production environment.

## Incident Roles
- **Incident Commander (IC)**: Leads triage, declares incidents.
- **Operations (Ops)**: Executes runbook steps.
- **Communications**: Updates statuspage.

## Scenario 1: Database Corruption / Data Loss
*Symptom: Critical user data is missing, or `pg_stat_activity` shows massive query blocking causing 503s.*

### Action Plan: Point-In-Time-Recovery (PITR)
1. Navigate to **Render Dashboard** → `intellicircle-db`.
2. Click **Backups** tab.
3. If on Starter plan, click **Restore to Point in Time**.
4. Select a timestamp 5 minutes prior to the corruption event.
5. Render will provision a **NEW** database `intellicircle-db-recovery`.
6. Update the `DATABASE_URL` environment variable on `intellicircle-server` and `intellicircle-worker` to point to the new DB.
7. Execute `npm run db:push` to ensure schema is strictly synced.
8. Manually trigger deploy.

## Scenario 2: Redis Outage / Deletion
*Symptom: Websocket connections continually sever, chat rooms show empty, and the `/api/health` indicates `redis: "down"`.*

### Action Plan: Recovery
1. If the Upstash cluster was entirely deleted (e.g. paused free tier), login to **Upstash**.
2. Click **Create Database** → Name: `intellicircle-redis-prod` → Region: Same as Render Web service.
3. Retrieve new connection URL (`rediss://...`).
4. Update `REDIS_URL` on Render `intellicircle-server` and `intellicircle-worker`.
5. Restart both services in Render Dashboard.
6. *Note*: This means all active websocket connectivity will momentarily drop, users will automatically reconnect. All BullMQ pending jobs will be lost.

## Scenario 3: Secret Compromise
*Symptom: Malicious API activity, or keys were accidentally committed to public repo.*

### Action Plan: Full Rotation (Downtime: 1-2 mins)
1. Locally execute: `node scripts/rotate-keys.js`.
2. Copy the resulting `JWT_PUBLIC_KEY` and `JWT_PRIVATE_KEY`.
3. In Render Dashboard, replace the keys for `intellicircle-server`.
4. *Impact*: All existing JWT access tokens will become mathematically invalid. Active users will be logged out and must get a new anonymous token.
5. In Google Cloud Console, cycle the `GEMINI_API_KEY` and update `intellicircle-worker`.
6. Check Datadog for unauthorized queries.

## Scenario 4: CI/CD Pipeline Deploys Broken Build
*Symptom: `main` was updated, but the `/api/health` returns `503 Service Unavailable`, or the frontend displays a white screen on Netlify.*

### Action Plan: Manual Rollback
1. **Frontend (Netlify)**: Navigate to Site → Deploys. Click on the previous successful deploy in the list, and select **Publish Deploy**. This is instantaneous.
2. **Backend (Render)**: Navigate to `intellicircle-server` → Events. Find the previous successful deploy, click **Rollback to this deploy**. Repeat for `intellicircle-worker` if necessary.

---

> [!CAUTION]
> If a disaster involves the Database, **never** wipe `chatRooms` without backing it up! Use `db:push` and never `db:generate` + raw SQL against production without a local dry-run.
