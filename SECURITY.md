# Security Policy

## Supported Versions

IntelliCircle is actively developed. Security fixes are applied to the latest version on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| latest (`main`) | :white_check_mark: |
| older commits   | :x:                |

## Reporting a Vulnerability

We take the security of IntelliCircle very seriously. If you discover a vulnerability in this project, please **do not** open a public GitHub issue.

### How to Report

Please report vulnerabilities by opening a private GitHub Security Advisory or contacting the repository owner:

1. Navigate to the repository page on GitHub.
2. Go to the **Security** tab.
3. Click **"Report a vulnerability"** under the Security Advisories section.
4. Fill in the details of the issue.

### What to Include

Please include as much of the following information as possible to help us understand, reproduce, and resolve the issue quickly:

- A description of the vulnerability and its potential impact
- Detailed steps to reproduce the issue (including example HTTP payloads or WebSocket frame content if applicable)
- Any proof-of-concept (PoC) code or exploit examples
- Affected component(s) (e.g., Fastify websocket handler, Next.js client middleware, JWT validation flow, or shared Zod schemas)

## Sensitive Areas

IntelliCircle manages real-time, location-aware environments. Please pay special attention to the following sensitive components during security audits or updates:

- **JWT Asymmetric Keys (`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`)** — used by Fastify (`@fastify/jwt`) to sign and verify session tokens (RS256). Keeping the private key secure is paramount.
- **Geospatial Location Data (Postgres + PostGIS)** — location coordinates are used to fetch nearby rooms. Ensure location-query APIs (such as `ST_DWithin` functions) do not accidentally leak precise user coordinate histories.
- **WebSocket Broadcast Handlers (`packages/server/src/websocket/`)** — handles real-time connections and Redis Pub/Sub events. Ensure validation checks exist to prevent message spoofing, room hijacking, or unauthorized broadcasting.
- **API Routes and Middlewares (`packages/server/src/routes/` & `packages/client/src/middleware.ts`)** — verifies cookie authentication and limits unauthorized access. Always check CSRF protection and rate limits here.
- **Integration Secrets (`GEMINI_API_KEY`, `OPENCAGE_API_KEY`)** — controls connection with Google Gemini Flash AI (for BullMQ room summarization jobs) and OpenCage (for geocoding). Protection against secret exposure is crucial to prevent API abuse.
- **Zod Data Schemas (`packages/shared/src/schema.ts`)** — defines validation boundaries across client and server. Make sure schemas do not permit prototype pollution, SQL/spatial injection, or HTML script injection (XSS).

## Response Timeline

- **Acknowledgement:** Within 48 to 72 hours of receiving a report.
- **Status update:** Within 7 days.
- **Fix or mitigation:** Timeline depends on severity; critical issues affecting user data or server operations will be prioritized.

## Disclosure Policy

We follow a **coordinated disclosure** model. Once a patch or mitigation is ready, we will:

1. Publish a GitHub Security Advisory.
2. Credit the reporter (unless you prefer to remain anonymous).
3. Release the patched code version to the `main` branch.

Thank you for helping keep IntelliCircle and its users safe!
