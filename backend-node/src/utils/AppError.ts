/**
 * An error that is safe to show to the client.
 *
 * Throw it anywhere (routes, services) and the global error handler turns it into
 * `{ success: false, message, details? }` with the given HTTP status.
 *
 * @example throw new AppError(404, "Link not found")
 */
export class AppError extends Error {
    readonly statusCode: number
    readonly details?: unknown

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message)
        this.name = "AppError"
        this.statusCode = statusCode
        this.details = details
    }
}
