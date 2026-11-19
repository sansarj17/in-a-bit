import type { Request } from "express"
import { ipKeyGenerator, rateLimit, type Options } from "express-rate-limit"

const MINUTE_MS = 60 * 1000

/**
 * Rate limits count per visitor IP. clientIp is the IP our frontend saw (see originLock),
 * which visitors can't fake; req.ip is the fallback when the lock is off (local development).
 * ipKeyGenerator groups IPv6 addresses by network, so one machine can't rotate through many.
 */
function keyByClientIp(req: Request): string {
    return ipKeyGenerator(req.clientIp ?? req.ip ?? "unknown")
}

/** Shared settings: standard `RateLimit` headers, and our usual error body for 429s. */
function limiter(options: Partial<Options> & { message: string }) {
    return rateLimit({
        standardHeaders: "draft-8",
        legacyHeaders: false,
        keyGenerator: keyByClientIp,
        ...options,
        message: { success: false, message: options.message },
    })
}

/** Ceiling for the whole API, per IP. High enough that normal use never hits it. */
export const apiLimiter = limiter({
    windowMs: 15 * MINUTE_MS,
    limit: 300,
    message: "Too many requests. Please slow down and try again in a few minutes.",
})

/** Login and sign-up, per IP: makes guessing passwords slow. */
export const authLimiter = limiter({
    windowMs: 15 * MINUTE_MS,
    limit: 20,
    message: "Too many attempts. Please wait a few minutes and try again.",
})

/** Demo accounts, per IP: each click creates an account, so keep it to a handful an hour. */
export const demoLimiter = limiter({
    windowMs: 60 * MINUTE_MS,
    limit: 10,
    message: "Too many demo accounts from your network. Please try again later.",
})

/** Creating links, per user (runs after requireAuth): stops one account flooding the database. */
export const createLinkLimiter = limiter({
    windowMs: 60 * MINUTE_MS,
    limit: 50,
    keyGenerator: (req) => req.userId ?? "anonymous",
    message: "You've created a lot of links in the last hour. Please try again later.",
})
