import type { RequestHandler } from "express"
import { createHash, timingSafeEqual } from "node:crypto"
import { isIP } from "node:net"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"

// Headers added by the frontend's proxy (frontend/src/proxy.ts). Keep the names in sync.
const PROXY_SECRET_HEADER = "x-proxy-secret"
const CLIENT_IP_HEADER = "x-client-ip"

/**
 * Compares two secrets in constant time, so response timing doesn't reveal how much of a
 * guess was right. Hashing first gives both sides the same length, which timingSafeEqual needs.
 */
function isSameSecret(received: string, expected: string): boolean {
    const receivedHash = createHash("sha256").update(received).digest()
    const expectedHash = createHash("sha256").update(expected).digest()
    return timingSafeEqual(receivedHash, expectedHash)
}

/**
 * Origin lock: the API only answers requests that came through our frontend.
 *
 * The frontend's proxy adds a shared secret plus the visitor's IP (as Vercel saw it) to
 * everything it forwards. Anything without the secret, e.g. someone calling the API's URL
 * directly, gets a 403. Because only the frontend can send the secret, the IP it sends can be
 * trusted for rate limiting, unlike X-Forwarded-For, which visitors can write themselves.
 *
 * With no PROXY_SECRET configured (local development) the lock is off.
 */
export const originLock: RequestHandler = (req, _res, next) => {
    if (!env.proxySecret) {
        req.clientIp = req.ip
        next()
        return
    }

    const receivedSecret = req.get(PROXY_SECRET_HEADER)
    if (!receivedSecret || !isSameSecret(receivedSecret, env.proxySecret)) {
        throw new AppError(403, "Forbidden")
    }

    const forwardedIp = req.get(CLIENT_IP_HEADER)
    req.clientIp = forwardedIp && isIP(forwardedIp) ? forwardedIp : req.ip
    next()
}
