# in-a-bit

A URL shortener: sign in, paste a long URL, get a short link that redirects to it.

```
in-a-bit/
├── backend-node/      # Express 5 + TypeScript API (Prisma, PostgreSQL)
├── frontend/          # Next.js 16 (Pages Router) + React 19
├── docker-compose.yml # Local Postgres
└── docs/PLAN.md       # Scope, architecture, phases
```

```
Browser ──► Next.js (:3000) ── /api/* rewrite ──► Express (:8080) ──► PostgreSQL (:5433)
```

The browser only ever talks to the frontend's origin; Next.js forwards `/api/*` to the
backend, so the auth cookie is first-party and no CORS setup is needed in the browser.

## Prerequisites

- Node.js 24+, pnpm 10
- Docker (for Postgres)

## Getting started

```bash
# 1. Database (from the repo root) — Postgres on localhost:5433
docker compose up -d

# 2. Backend
cd backend-node
cp .env.example .env  # then set JWT_SECRET, e.g. to the output of: openssl rand -base64 48
pnpm install          # also generates the Prisma client
pnpm db:migrate       # creates the tables
pnpm dev              # http://localhost:8080/api/health

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev              # http://localhost:3000
```

Short links are served from the frontend: `http://localhost:3000/<code>`.

## Backend scripts (`backend-node/`)

| Command | What it does |
|---|---|
| `pnpm dev` | Run with reload (tsx watch) |
| `pnpm build` / `pnpm start` | Compile to `dist/` / run the build |
| `pnpm typecheck` | Type-check without building |
| `pnpm db:migrate` | Create / apply Prisma migrations |
| `pnpm db:studio` | Browse the database in Prisma Studio |

## Stack

**Backend:** Express 5, TypeScript, Prisma 7 + PostgreSQL 17, zod, pino.
Auth: bcryptjs (password hashing), jsonwebtoken (login token in an httpOnly cookie), cookie-parser.

**Frontend:** Next.js 16 (Pages Router), React 19, TanStack Query, wretch, Tailwind CSS 4.
Deployed on Vercel.

See [docs/PLAN.md](docs/PLAN.md) for the full plan and design decisions.
