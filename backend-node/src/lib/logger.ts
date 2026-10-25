import pino from "pino"
import { env } from "../config/env"

/**
 * Default logger that needs to be used for all log related work.
 * Pretty, colourised output in development; plain JSON lines everywhere else
 * (what log platforms expect, and pino-pretty is only a dev dependency).
 */
export const logger = pino({
    level: env.logLevel,
    transport: env.nodeEnv === "development" ? {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
        },
    } : undefined,
})
