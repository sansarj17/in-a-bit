# Origin lock: only the frontend can call the API

The API (Render) only answers requests that came through the frontend (Vercel). The
frontend also tells the API who the visitor is, so rate limits count per real visitor
and can't be dodged with a forged header.

## The problem

The API's rate limits (login attempts, demo accounts, link creation) count requests per
visitor IP. Two things made that IP unreliable:

1. **The API's URL is public.** `https://in-a-bit-api.onrender.com` can be called directly,
   skipping the frontend entirely.
2. **The IP came from `X-Forwarded-For`.** Every proxy appends to that header, and so can the
   visitor. Express picks the entry `TRUST_PROXY_HOPS` steps from the end. A request
   passes through several proxies (Vercel → Cloudflare → Render), and the number differs
   by path.

What we measured on the live site with `TRUST_PROXY_HOPS=4`. The "key" is what the rate
limiter counted the request against:

| Request | Key the limiter used |
|---|---|
| Normal visit through the site | the visitor's real IP ✅ |
| Forged `X-Forwarded-For: 1.2.3.4` through the site | the visitor's real IP ✅ |
| Forged `X-Forwarded-For: 9.9.9.9, 8.8.8.8, 7.7.7.7` through the site | `7.7.7.7`, chosen by the visitor ❌ |
| Forged entries sent straight to the Render URL | chosen by the visitor ❌ |

So anyone who wanted to could get around the limits. No hop count fixes this, because the
same number has to work for two paths of different lengths, and visitors control the start
of the header.

## The fix

```
Browser ──► Vercel: src/proxy.ts                         ──► Render: originLock middleware
            adds  x-proxy-secret: <PROXY_SECRET>              wrong/missing secret → 403
                  x-client-ip:    <x-real-ip>                 right secret → trust x-client-ip
            (removes any copies the visitor sent)            rate limits key on that IP
```

- **The frontend proves the request is real.** `frontend/src/proxy.ts` runs on the server for
  every request and adds a shared secret. The API rejects anything without it, so calling
  the Render URL directly gets `403 Forbidden`. The only exception is `/api/health`, which
  Render's health check calls directly.
- **The frontend reports the visitor's IP.** Vercel sets `x-real-ip` from the actual network
  connection, so a visitor can't fake it. The proxy passes it on as `x-client-ip`. The API
  trusts that header *only* when the secret is correct, so nobody else can set it.
- **Visitors can't inject either header.** The proxy deletes any `x-proxy-secret` or
  `x-client-ip` the browser sent before adding its own.
- **The secret check runs in constant time.** Both values are hashed and compared with
  `crypto.timingSafeEqual`, so response timing doesn't leak how close a guess was.

| File | Change |
|---|---|
| `frontend/src/proxy.ts` | adds the secret and the visitor IP to forwarded requests |
| `frontend/next.config.ts` | production builds fail without `PROXY_SECRET` |
| `backend-node/src/middlewares/originLock.ts` | checks the secret (403 otherwise), sets `req.clientIp` |
| `backend-node/src/app.ts` | `/api/health` stays open; everything after it is locked |
| `backend-node/src/middlewares/rateLimit.ts` | IP limits key on `req.clientIp` |
| `backend-node/src/config/env.ts` | `PROXY_SECRET`: optional locally, required in production |

## Configuration

One new environment variable, `PROXY_SECRET`, with **the same value on both sides**:

- **Generate:** `openssl rand -base64 48` (at least 32 characters).
- **API (Render):** required when `NODE_ENV=production`; the server refuses to start without it.
- **Frontend (Vercel):** required for production builds; the build fails without it.
- **Locally:** leave it empty on both sides and the lock is off, so local development works as before.

## Rolling it out without downtime

Order matters. The new API rejects requests without the secret, so the frontend must send
it before the new API goes live.

1. Generate the secret.
2. **Render:** add `PROXY_SECRET`. The redeploy runs the old code, which ignores it.
3. **Vercel:** add `PROXY_SECRET` for Production. It's picked up by the next deploy.
4. Push. Vercel rebuilds the frontend in about a minute and starts sending the secret.
   Render rebuilds the API in a few minutes and starts requiring it.

If the frontend ever runs without the secret, every API call gets a 403. The site looks
logged out and nothing loads, and that's the first thing to check.

## Checking it

```bash
# Direct calls are refused (health is the only exception)
curl -i https://in-a-bit-api.onrender.com/api/auth/me      # 403 {"message":"Forbidden"}
curl -i https://in-a-bit-api.onrender.com/api/health       # 200

# Through the site everything works as before
curl -i https://in-a-bit.vercel.app/api/auth/me            # 401 (not logged in), not 403

# Forged headers no longer change the rate-limit key: the `pk` in RateLimit-Policy stays
# the same with and without them
curl -sI https://in-a-bit.vercel.app/api/auth/me | grep -i ratelimit-policy
curl -sI -H 'X-Forwarded-For: 9.9.9.9, 8.8.8.8, 7.7.7.7' -H 'X-Real-IP: 1.2.3.4' \
  https://in-a-bit.vercel.app/api/auth/me | grep -i ratelimit-policy
```

## Rotating the secret

Set a new value on both platforms and redeploy both. Between the two deploys, API calls
fail with 403 for a minute or two. To rotate with zero downtime, the API would accept a
current and a previous secret for a while. Not needed at this size.

## What it doesn't cover

- **The secret is the key.** If it leaks (for example, committed by accident), anyone can call
  the API directly again. Rotate it.
- **It relies on Vercel's `x-real-ip`.** We trust Vercel to set it from the connection. When
  running elsewhere, use that platform's equivalent.
- **Rate limits still live in memory**, per API instance. With several instances they'd move
  to Redis.
- **It isn't authentication.** It proves a request passed through our frontend, not who the
  user is. Logins and ownership checks work exactly as before.

## Interview version

"The API sat behind two proxies, and rate limiting trusted `X-Forwarded-For`, which a client
can partly write. I measured it on the live site and found a three-entry forged header
could pick the limiter's key. So I made the frontend's proxy the only way in: it signs
forwarded requests with a shared secret and passes the visitor IP from Vercel's own
`x-real-ip`. The API returns 403 to everything else, and only trusts that IP when the
secret checks out."
