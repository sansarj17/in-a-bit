import dotenv from "dotenv"
import { z } from "zod"

// Loads backend-node/.env into process.env. Variables that are already set win.
dotenv.config({ quiet: true })

const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const

/** Every environment variable the app reads, with its type and default. */
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(8080),
    DEFAULT_LOG_LEVEL: z.enum(LOG_LEVELS).default("info"),
    DATABASE_URL: z.url(),
})

export interface Env {
    readonly nodeEnv: "development" | "test" | "production"
    readonly isProduction: boolean
    readonly port: number
    readonly logLevel: (typeof LOG_LEVELS)[number]
    readonly databaseUrl: string
}

/**
 * Validates raw environment variables and returns typed config.
 * Throws on startup if anything is missing or malformed, so the app never runs half-configured.
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
    const result = envSchema.safeParse(source)

    if (!result.success) {
        throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`)
    }

    const vars = result.data

    return {
        nodeEnv: vars.NODE_ENV,
        isProduction: vars.NODE_ENV === "production",
        port: vars.PORT,
        logLevel: vars.DEFAULT_LOG_LEVEL,
        databaseUrl: vars.DATABASE_URL,
    }
}

export const env = parseEnv(process.env)
