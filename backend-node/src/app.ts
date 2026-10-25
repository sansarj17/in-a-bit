import express from "express"
import { errorHandler } from "./middlewares/errorHandler"
import { notFound } from "./middlewares/notFound"
import { apiRouter } from "./routes"

/** Request bodies here are tiny (a URL, an email), so anything bigger is rejected early. */
const JSON_BODY_LIMIT = "10kb"

export function createApp() {
    const app = express()

    // No CORS middleware on purpose: browsers reach the API only through the Next.js
    // `/api/*` proxy (same origin), so other sites' pages can't read API responses.
    app.use(express.json({ limit: JSON_BODY_LIMIT }))
    app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }))

    // Routes
    app.use("/api", apiRouter)

    // 404 Handler
    app.use(notFound)

    // Global Error Handler
    app.use(errorHandler)

    return app
}
