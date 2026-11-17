import { Router } from "express"
import { authLimiter, demoLimiter } from "../../middlewares/rateLimit"
import { requireAuth } from "../../middlewares/requireAuth"
import { validateBody } from "../../middlewares/validate"
import * as authController from "./auth.controller"
import { loginSchema, registerSchema } from "./auth.schema"

/** Mounted at /api/auth. */
export const authRouter = Router()

authRouter.post("/register", authLimiter, validateBody(registerSchema), authController.register)
authRouter.post("/login", authLimiter, validateBody(loginSchema), authController.login)
authRouter.post("/demo", demoLimiter, authController.demo)
authRouter.post("/logout", authController.logout)
authRouter.get("/me", requireAuth, authController.me)
