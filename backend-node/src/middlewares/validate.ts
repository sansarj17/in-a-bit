import type { RequestHandler } from "express"
import { z } from "zod"
import { AppError } from "../utils/AppError"

/**
 * Validates `req.body` against a zod schema before the route handler runs.
 * On success the body is replaced with the parsed (trimmed, lowercased, ...) data.
 * On failure it responds 400 with the problems per field, e.g. { email: ["Enter a valid email"] }.
 */
export function validateBody(schema: z.ZodType): RequestHandler {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            throw new AppError(400, "Invalid request body", z.flattenError(result.error).fieldErrors)
        }

        req.body = result.data
        next()
    }
}
