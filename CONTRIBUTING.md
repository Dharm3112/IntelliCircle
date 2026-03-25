# Contributing to IntelliCircle

Thank you for considering contributing to IntelliCircle! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Code Style & Conventions](#code-style--conventions)
- [Submitting Changes](#submitting-changes)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We want IntelliCircle to be a welcoming community for everyone.

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v20+ |
| PostgreSQL | With PostGIS extension |
| Redis | Local or Upstash Serverless |

### Setup

1. **Fork & clone** the repository.

2. **Install dependencies** from the monorepo root:
   ```bash
   npm install
   ```

3. **Configure environment variables.** Copy the example files and fill in your values:
   ```bash
   # Root (for Drizzle config)
   cp .env.example .env

   # Server
   cp packages/server/.env.example packages/server/.env
   cp packages/server/.env.keys.example packages/server/.env.keys
   ```
   Generate your RSA key pair by running:
   ```bash
   node generate-keys.js
   ```

4. **Set up the database:**
   ```bash
   cd packages/server
   npm run db:enable-postgis   # Enable PostGIS extension
   npm run db:push             # Push Drizzle schema to PostgreSQL
   ```

5. **Start development servers** in two separate terminals:
   ```bash
   # Terminal 1 — Backend (Fastify on port 8080)
   npm run dev:server

   # Terminal 2 — Frontend (Next.js on port 3000)
   npm run dev:client
   ```

---

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes in small, focused commits.
3. Run the type checker before pushing:
   ```bash
   npm run check
   ```
4. Open a Pull Request against `main`.

### Branch Naming

| Prefix | Use For |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code refactoring |
| `chore/` | Maintenance / tooling |

---

## Project Structure

IntelliCircle is an **npm Workspaces monorepo** with three packages:

```
packages/
├── client/     → Next.js 14 frontend (App Router, Tailwind, Zustand)
├── server/     → Fastify backend (WebSockets, BullMQ, Drizzle ORM)
└── shared/     → Zod schemas shared between client & server
```

**Key rule:** If you modify the database schema in `packages/shared/src/schema.ts`, both the client and server automatically inherit those changes via the shared Zod types. Always regenerate migrations after schema changes:

```bash
cd packages/server
npm run db:generate
npm run db:push
```

---

## Code Style & Conventions

- **TypeScript** everywhere — no `any` types without justification.
- **Zod** for all external data validation (API payloads, WebSocket messages, DB rows).
- **Functional style** — prefer pure functions and immutable patterns.
- Use existing conventions in the codebase as your reference.

---

## Submitting Changes

1. Ensure your code compiles: `npm run check`
2. Write clear, descriptive commit messages.
3. Keep PRs focused — one feature or fix per PR.
4. Describe **what** and **why** in your PR description.
5. Link relevant issues if applicable.

---

## Questions?

Open a [GitHub Issue](../../issues) or start a [Discussion](../../discussions). We're happy to help!
