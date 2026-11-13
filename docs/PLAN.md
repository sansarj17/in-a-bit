# in-a-bit — Project Plan

A URL shortener built as a resume project. Goal: a small, finished app where every piece
can be explained in an interview. Nothing fancy for its own sake.

## Scope

**In:** accounts (register / login / logout), create / list / edit / delete short links,
`GET /:code` redirect, custom aliases, expiry dates, a one-click demo account.

**Out (for now):** click analytics, Redis caching, refresh tokens, API docs, load testing.

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js 24 | LTS |
| Backend framework | Express 5 + TypeScript | Most common Node backend; v5 forwards async errors to the error handler |
| Database | PostgreSQL 17 (Docker) | Relational data (users own links), unique constraints |
| ORM | Prisma 7 | Schema file, migrations, typed queries |
| Validation | zod | Validates request bodies and env vars with one tool |
| Passwords | bcryptjs | Hashes passwords (pure JS, no native build) |
| Auth tokens | jsonwebtoken | Signs/verifies the login JWT |
| Cookies | cookie-parser | Reads the httpOnly auth cookie |
| Config | dotenv | Loads `.env` into `process.env` |
| Logging | pino | Fast structured logs |
| Security | helmet, express-rate-limit | Security headers, brute-force / spam limits |
| Backend tests (planned) | Vitest + Supertest | Unit + HTTP integration tests against a real Postgres |
| Frontend | Next.js 16 (Pages Router), React 19 | Simplest Next routing model; deploys to Vercel with zero config |
| Data fetching | TanStack Query + wretch | Caching / loading states + small fetch wrapper |
| Styling | Tailwind CSS 4 | |

## Architecture

```
Browser ──► Next.js (frontend, :3000)
              │  rewrites /api/* → backend   (same origin → cookies just work, no CORS)
              ▼
           Express (backend-node, :8080)
              ├── /api/*     JSON API
              └── /:code     302 redirect ──► Postgres
```

Backend layout (by feature):

```
backend-node/src/
  config/env.ts       env vars validated with zod at startup
  lib/                logger, prisma client
  middlewares/        errorHandler, notFound, validate, requireAuth, rateLimit
  types/              additions to Express types (req.userId)
  modules/
    auth/             routes · controller · service · schema
    links/            routes · controller · service · schema
    redirect/
  utils/              AppError, jwt, shortCode
```

## Data model

| Table | Columns |
|---|---|
| `users` | id, email (unique), password_hash, name, created_at |
| `links` | id, code (unique), original_url, user_id → users, title, expires_at, is_active, created_at, updated_at |

## API

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | |
| POST | `/api/auth/login` | sets httpOnly JWT cookie |
| POST | `/api/auth/logout` | clears cookie |
| GET | `/api/auth/me` | current user |
| POST / GET | `/api/links` | create / list own links (paginated) |
| GET / PATCH / DELETE | `/api/links/:id` | owner only |
| GET | `/:code` | 302 redirect; 404 unknown, 410 expired/inactive |

Responses: success → `{ success: true, data }`, error → `{ success: false, message, details? }`.

## Auth (kept simple)

- Register: `bcrypt.hash(password, 10)` → save user.
- Login: `bcrypt.compare` → `jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" })` → httpOnly cookie.
- `requireAuth`: read cookie → `jwt.verify` (algorithm pinned to HS256) → `req.userId`.
- Logout: clear the cookie.
- Passwords capped at 72 bytes (bcrypt ignores anything longer).
- Wrong email and wrong password get the same 401 message. An unknown email is still checked
  against a dummy hash, so response times don't reveal which emails have accounts.
- Duplicate email: the unique index rejects it (Prisma `P2002`) → 409. No "check first" query,
  which could race when two sign-ups for the same email arrive at once.
- CSRF: the cookie is `SameSite=Lax`, and the API only accepts JSON bodies, which other sites
  can't send cross-origin without a CORS preflight we never allow.

## Design decisions

- **302, not 301** — browsers cache 301s, so edited/disabled links would keep going to the old URL.
- **Random short codes** — 7 chars from base62 via `crypto.randomInt`, unique index, retry on
  collision. Sequential IDs would make every link guessable.
- **URL safety** — only `http`/`https`; reject links to our own domain (loops); reserved
  aliases (`api`, `login`, `dashboard`, …); rate-limited creation.
- **Login required** to create links, plus a demo account so recruiters can try it in one click.

## Phases

| # | Phase | Backend | Frontend |
|---|---|---|---|
| 0 | Cleanup | Remove `backend-spring`, untrack `.env`, zod env, error handling, Postgres in Docker, Prisma setup | Fix scaffold bugs, proxy `/api` to backend |
| 1 | Accounts | `users` table, register / login / logout / me, `requireAuth` | Login + register pages |
| 2 | Links | `links` table, CRUD, `GET /:code` redirect | Dashboard: shorten, list, copy, edit, delete |
| 3 | Polish | Rate limits, helmet, custom aliases, expiry, demo account | Demo button, alias / expiry inputs |
| 4 | Ship | Dockerfile, GitHub Actions CI, deploy | Deploy, README with screenshots |

### Testing (later)

Tests get added in a separate pass once the features are built. Plan:

- Vitest + Supertest: unit tests for helpers (env parsing, short codes), HTTP tests for the API.
- A separate `in_a_bit_test` database, migrated with `prisma migrate deploy` before the run.
- Vitest `fileParallelism: false` so test files don't race on the shared test database.
- Aim for 80%+ coverage.

### Carried forward from the Phase 0 review

- **Phase 3:** `app.set("trust proxy", …)` before rate limiting — behind Vercel's rewrite and
  the API host's proxy, `req.ip` is otherwise the proxy, so every user shares one limit.
- **Phase 4:** the Dockerfile builds with dev dependencies (needs `prisma` + `typescript`),
  then copies `dist/` into a slim runtime image.

## "How would you scale it?" (interview answers, not built)

- Cache `code → url` in Redis in front of Postgres (reads vastly outnumber writes).
- Record clicks asynchronously via a queue for analytics.
- Refresh tokens for shorter-lived access tokens and server-side revocation.
