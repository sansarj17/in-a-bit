import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { linksRouter } from "../modules/links/links.routes";
import { healthRouter } from "./health.routes";

/**
 * API Router for the application.
 * 
 * Combines all the routes in one application router.
 */
const apiRouter = Router()

apiRouter.use(healthRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/links", linksRouter)

export { apiRouter }