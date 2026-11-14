import type { RequestHandler } from "express"
import { z } from "zod"
import { AppError } from "../utils/AppError"

/**
 * Parses untrusted input (body, query string) with a zod schema.
 * Throws a 400 with the problems per field, e.g. { email: ["Enter a valid email"] }.
 */
export function parseInput<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
    const result = schema.safeParse(data)

    if (!result.success) {
        // formErrors: problems with the input as a whole (e.g. "Nothing to update").
        // fieldErrors: problems with one field (e.g. { email: ["Enter a valid email"] }).
        const { formErrors, fieldErrors } = z.flattenError(result.error)
        throw new AppError(400, formErrors[0] ?? "Invalid request", fieldErrors)
    }

    return result.data
}

/**
 * Validates `req.body` before the route handler runs, and replaces it with the
 * parsed (trimmed, lowercased, ...) data.
 */
export function validateBody(schema: z.ZodType): RequestHandler {
    return (req, _res, next) => {
        req.body = parseInput(schema, req.body)
        next()
    }
}
