import { Router } from "express"

const healthRouter = Router()

/** Liveness check for uptime monitors and the deploy platform. */
healthRouter.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        data: { status: "ok" },
    })
})

export { healthRouter }
