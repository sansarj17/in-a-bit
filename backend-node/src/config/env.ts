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
    // HS256 needs a long random key; a short one can be brute-forced offline from any token.
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    // Public URL of the frontend, where short links live. Used to stop links pointing back at us.
    APP_URL: z.url(),
    // How many proxies sit in front of the API and add X-Forwarded-For (see .env.example).
    // Needed to read the visitor's real IP for rate limiting; too high lets clients fake it.
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
    // Shared with the frontend's proxy: only requests carrying it are accepted (origin lock).
    // Optional locally; required in production (checked in parseEnv below).
    // An empty value (as in .env.example) counts as "not set".
    PROXY_SECRET: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().min(32, "PROXY_SECRET must be at least 32 characters").optional(),
    ),
})

export interface Env {
    readonly nodeEnv: "development" | "test" | "production"
    readonly isProduction: boolean
    readonly port: number
    readonly logLevel: (typeof LOG_LEVELS)[number]
    readonly databaseUrl: string
    readonly jwtSecret: string
    readonly appUrl: string
    readonly trustProxyHops: number
    /** Undefined means the origin lock is off (local development only). */
    readonly proxySecret: string | undefined
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

    // Without it in production, anyone could call the API directly and bypass the frontend.
    if (vars.NODE_ENV === "production" && !vars.PROXY_SECRET) {
        throw new Error("Invalid environment variables:\nPROXY_SECRET is required in production")
    }

    return {
        nodeEnv: vars.NODE_ENV,
        isProduction: vars.NODE_ENV === "production",
        port: vars.PORT,
        logLevel: vars.DEFAULT_LOG_LEVEL,
        databaseUrl: vars.DATABASE_URL,
        jwtSecret: vars.JWT_SECRET,
        appUrl: vars.APP_URL,
        trustProxyHops: vars.TRUST_PROXY_HOPS,
        proxySecret: vars.PROXY_SECRET,
    }
}

export const env = parseEnv(process.env)
