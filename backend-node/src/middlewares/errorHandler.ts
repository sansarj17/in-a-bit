import type { Request, Response, NextFunction } from "express"
import { logger } from "../lib/logger"
import { AppError } from "../utils/AppError"

/**
 * Errors raised by Express's body parser (malformed JSON, body too large) carry an HTTP
 * `status` and `expose: true`, which means their message is safe to send to the client.
 */
interface ExposableHttpError extends Error {
    status: number
    expose: true
}

function isExposableHttpError(err: unknown): err is ExposableHttpError {
    return (
        err instanceof Error &&
        "status" in err &&
        typeof err.status === "number" &&
        "expose" in err &&
        err.expose === true
    )
}

/**
 * Global error handler. Express 5 sends both sync throws and rejected promises from
 * route handlers here, so routes never need their own try/catch just to respond.
 */
export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // The response is already partly sent, so let Express close the connection.
    if (res.headersSent) {
        next(err)
        return
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details !== undefined && { details: err.details }),
        })
        return
    }

    if (isExposableHttpError(err)) {
        res.status(err.status).json({
            success: false,
            message: err.message,
        })
        return
    }

    // Anything else is a bug: log the full error, but never leak its details to the client.
    logger.error({ err, method: req.method, url: req.originalUrl }, "Unhandled exception")

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    })
}
