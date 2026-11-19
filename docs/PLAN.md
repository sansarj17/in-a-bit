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
              │  /api/*  → backend   (same origin → cookies just work, no CORS)
              │  /:code  → backend   ("fallback" rewrite: only when no page matches)
              ▼
           Express (backend-node, :8080)
              ├── /api/*     JSON API
              └── /:code     302 redirect ──► Postgres
```

Short links live on the frontend's domain (`in-a-bit.app/x7Kp2Qa`). Next.js checks its own
pages first (`/login`, `/dashboard`, ...) and only forwards unknown paths to Express, which
answers with the 302. Next passes the redirect straight through to the browser.

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
| `links` | id, code (unique), original_url, user_id → users (cascade delete), title, expires_at, is_active, created_at, updated_at; index on (user_id, created_at desc) for the dashboard list |

## API

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | |
| POST | `/api/auth/login` | sets httpOnly JWT cookie |
| POST | `/api/auth/logout` | clears cookie |
| GET | `/api/auth/me` | current user |
| POST / GET | `/api/links` | create / list own links (paginated) |
| GET / PATCH / DELETE | `/api/links/:id` | owner only; someone else's link is a 404 |
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
- **URL safety** — only `http`/`https` with a real domain (blocks `javascript:` / `data:`
  links); reject links to our own domain (loops); reserved aliases (`api`, `login`,
  `dashboard`, …); rate-limited creation.
- **Ownership in the query** — every link query filters by `id` *and* `userId`, so another
  user's link is simply "not found". No separate permission check to forget.
- **No caching of redirects** — `Cache-Control: no-store`, so edits and disables apply on the
  very next visit.
- **Login required** to create links, plus a demo account so recruiters can try it in one click.

## Security and abuse limits

| What | Where | Why |
|---|---|---|
| Rate limit: 300 req / 15 min per IP | all of `/api` | ceiling against scripts |
| Rate limit: 20 / 15 min per IP | login, register | slows password guessing |
| Rate limit: 10 / hour per IP | demo accounts | each click creates an account |
| Rate limit: 50 / hour per user | creating links | stops one account flooding the DB |
| Origin lock (`PROXY_SECRET`) | Next.js proxy + Express | the API only answers requests carrying a secret the frontend adds; IP rate limits use the visitor IP the frontend reports, which can't be forged. See [API-ORIGIN-LOCK.md](API-ORIGIN-LOCK.md) |
| `trust proxy` = `TRUST_PROXY_HOPS` | Express | fallback IP when the lock is off (local development): behind proxies, `req.ip` would otherwise be the proxy |
| helmet | Express | security headers on API responses and redirect pages |
| CSP + nosniff + frame blocking | Next.js (production builds) | scripts only from our origin; can't be framed (clickjacking) |

Rate limits are kept in memory, so they reset on restart and aren't shared between server
instances. That's fine for one instance; with several, the store would move to Redis.

**Custom aliases** use the same `code` column as random codes. Aliases that would clash with
app routes (`login`, `dashboard`, `api`, …) are reserved; a taken alias is a 409.

**Expiry** is a nullable `expires_at`; after it, `GET /:code` answers 410 "Link expired".

**Demo accounts** — "Try the demo" creates a fresh throwaway user (`is_demo`, an
`@demo.invalid` email, a random password nobody knows) with three sample links (active,
expiring, disabled). Each visitor gets their own, so nobody sees anyone else's links.
Clean-up would be one scheduled query: delete demo users older than a day (links cascade).

## Phases

| # | Phase | Backend | Frontend |
|---|---|---|---|
| 0 | Cleanup | Remove `backend-spring`, untrack `.env`, zod env, error handling, Postgres in Docker, Prisma setup | Fix scaffold bugs, proxy `/api` to backend |
| 1 | Accounts | `users` table, register / login / logout / me, `requireAuth` | Login + register pages |
| 2 | Links | `links` table, CRUD, `GET /:code` redirect | Dashboard: shorten, list, copy, edit, delete |
| 3 | Polish | Rate limits, helmet, custom aliases, expiry, demo account | Demo button, alias / expiry inputs |
| 4 | Ship | Dockerfile, GitHub Actions CI, deploy guide | Deploy guide, README with screenshots |

### Testing (later)

Tests get added in a separate pass once the features are built. Plan:

- Vitest + Supertest: unit tests for helpers (env parsing, short codes), HTTP tests for the API.
- A separate `in_a_bit_test` database, migrated with `prisma migrate deploy` before the run.
- Vitest `fileParallelism: false` so test files don't race on the shared test database.
- Aim for 80%+ coverage.

## "How would you scale it?" (interview answers, not built)

- Move rate-limit counters to Redis so several API instances share them.
- Abuse: public shorteners get used for phishing. Real ones check URLs against Google Safe
  Browsing and require verified emails before links go live.

- Cache `code → url` in Redis in front of Postgres (reads vastly outnumber writes).
- Record clicks asynchronously via a queue for analytics.
- Refresh tokens for shorter-lived access tokens and server-side revocation.
