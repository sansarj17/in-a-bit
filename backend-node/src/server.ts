import { createApp } from "./app"
import { env } from "./config/env"
import { logger } from "./lib/logger"
import { prisma } from "./lib/prisma"

/** How long in-flight requests get to finish before we stop waiting. */
const SHUTDOWN_TIMEOUT_MS = 10_000

const app = createApp()

const server = app.listen(env.port, (error) => {
    if (error) {
        logger.fatal({ err: error }, "Server failed to start")
        process.exit(1)
    }

    logger.info(`Server is running on http://localhost:${env.port}`)
})

/**
 * Graceful shutdown: stop accepting new requests, let in-flight ones finish,
 * then close the database pool. Hosting platforms send SIGTERM before stopping the app.
 */
function shutdown(signal: NodeJS.Signals): void {
    logger.info({ signal }, "Shutting down")

    // Safety net: if a connection hangs, exit anyway instead of waiting forever.
    // unref() stops this timer from keeping the process alive on its own.
    setTimeout(() => {
        logger.error("Shutdown timed out, forcing exit")
        process.exit(1)
    }, SHUTDOWN_TIMEOUT_MS).unref()

    server.close(async () => {
        try {
            await prisma.$disconnect()
            process.exit(0)
        } catch (err) {
            logger.error({ err }, "Error while closing the database connection")
            process.exit(1)
        }
    })
}

// `once`: a second Ctrl+C falls back to Node's default and quits immediately.
process.once("SIGINT", shutdown)
process.once("SIGTERM", shutdown)
