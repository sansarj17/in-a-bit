import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { linksRouter } from "../modules/links/links.routes";

/**
 * API Router for the application.
 * 
 * Combines all the routes in one application router. (/api/health is mounted separately
 * in app.ts, ahead of the origin lock, so the host's health check can reach it.)
 */
const apiRouter = Router()

apiRouter.use("/auth", authRouter)
apiRouter.use("/links", linksRouter)

export { apiRouter }