import type { RequestHandler } from "express"
import { AUTH_COOKIE_NAME } from "../modules/auth/auth.cookie"
import { AppError } from "../utils/AppError"
import { verifyToken } from "../utils/jwt"

/**
 * Lets the request through only if it carries a valid login cookie,
 * and stores the logged-in user's id on `req.userId` for the handlers after it.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
    const token: unknown = req.cookies?.[AUTH_COOKIE_NAME]
    const userId = typeof token === "string" ? verifyToken(token) : null

    if (!userId) {
        throw new AppError(401, "Please log in to continue")
    }

    req.userId = userId
    next()
}
