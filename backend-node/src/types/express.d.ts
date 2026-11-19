// Adds our own fields to Express's Request type.
declare global {
    namespace Express {
        interface Request {
            /** Id of the logged-in user. Set by the requireAuth middleware. */
            userId?: string
            /** The visitor's IP, as reported by our frontend. Set by the originLock middleware. */
            clientIp?: string
        }
    }
}

export {}
