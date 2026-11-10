import jwt from "jsonwebtoken"
import { env } from "../config/env"

// Pinned so a token can't pick its own algorithm (e.g. "none") when it is verified.
const TOKEN_ALGORITHM = "HS256"

export const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

/** Creates a signed login token whose subject (`sub`) is the user's id. */
export function signToken(userId: string): string {
    return jwt.sign({}, env.jwtSecret, {
        algorithm: TOKEN_ALGORITHM,
        subject: userId,
        expiresIn: TOKEN_TTL_SECONDS,
    })
}

/**
 * Returns the user id inside a token, or null when the token is malformed,
 * tampered with or expired. An invalid token is an expected case here, not an error.
 */
export function verifyToken(token: string): string | null {
    try {
        const payload = jwt.verify(token, env.jwtSecret, { algorithms: [TOKEN_ALGORITHM] })
        return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null
    } catch {
        return null
    }
}
