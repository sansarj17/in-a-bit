import dotenv from "dotenv"

dotenv.config()

export const env = {
    port: Number(process.env.PORT ?? 8080),
    isProduction: process.env.NODE_ENV !== "development",
    nodeEnv: process.env.NODE_ENV ?? "development",
    logLevel:process.env.DEFAULT_LOG_LEVEL ?? "info"
} as const