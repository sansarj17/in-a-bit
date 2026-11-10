import type { CookieOptions, Response } from "express"
import { env } from "../../config/env"
import { signToken, TOKEN_TTL_SECONDS } from "../../utils/jwt"

export const AUTH_COOKIE_NAME = "token"

const cookieOptions: CookieOptions = {
    httpOnly: true, // page JavaScript can't read it, so an XSS bug can't steal the token
    secure: env.isProduction, // HTTPS only in production (localhost runs on plain HTTP)
    sameSite: "lax", // not sent on cross-site POSTs, which blocks CSRF
    path: "/",
}

/** Logs the user in: signs a token and stores it in an httpOnly cookie. */
export function setAuthCookie(res: Response, userId: string): void {
    res.cookie(AUTH_COOKIE_NAME, signToken(userId), {
        ...cookieOptions,
        maxAge: TOKEN_TTL_SECONDS * 1000,
    })
}

/** Logs the user out by deleting the cookie (options must match the ones it was set with). */
export function clearAuthCookie(res: Response): void {
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions)
}
