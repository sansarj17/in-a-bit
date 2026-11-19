import cookieParser from "cookie-parser"
import express from "express"
import helmet from "helmet"
import { env } from "./config/env"
import { errorHandler } from "./middlewares/errorHandler"
import { notFound } from "./middlewares/notFound"
import { originLock } from "./middlewares/originLock"
import { apiLimiter } from "./middlewares/rateLimit"
import { redirectRouter } from "./modules/redirect/redirect.routes"
import { apiRouter } from "./routes"
import { healthRouter } from "./routes/health.routes"

/** Request bodies here are tiny (a URL, an email), so anything bigger is rejected early. */
const JSON_BODY_LIMIT = "10kb"

export function createApp() {
    const app = express()

    // Requests arrive through proxies (Next.js, the host's load balancer). Trusting exactly
    // that many hops makes req.ip the visitor's IP. With the origin lock on, rate limits use
    // the IP the frontend reports instead (see originLock); req.ip is the fallback.
    app.set("trust proxy", env.trustProxyHops)

    // Security headers (nosniff, frame blocking, a strict CSP, ...) and no X-Powered-By.
    app.use(helmet())

    // The host's health check calls the API directly, so this one route stays open...
    app.use("/api", healthRouter)
    // ...and everything else only answers requests that came through our frontend.
    app.use(originLock)

    // No CORS middleware on purpose: browsers reach the API only through the Next.js
    // `/api/*` proxy (same origin), so other sites' pages can't read API responses.
    // JSON bodies only. A plain HTML form on another site can't send JSON, and a cross-site
    // `fetch` with a JSON body needs a CORS preflight we never allow, so forged requests fail.
    app.use(express.json({ limit: JSON_BODY_LIMIT }))
    // Reads the auth cookie into req.cookies.
    app.use(cookieParser())

    // Routes
    app.use("/api", apiLimiter, apiRouter)
    // Short links: GET /:code. After /api, so API paths are never treated as codes.
    app.use(redirectRouter)

    // 404 Handler
    app.use(notFound)

    // Global Error Handler
    app.use(errorHandler)

    return app
}
