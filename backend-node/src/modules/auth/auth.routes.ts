import { Router } from "express"
import { requireAuth } from "../../middlewares/requireAuth"
import { validateBody } from "../../middlewares/validate"
import * as authController from "./auth.controller"
import { loginSchema, registerSchema } from "./auth.schema"

/** Mounted at /api/auth. */
export const authRouter = Router()

authRouter.post("/register", validateBody(registerSchema), authController.register)
authRouter.post("/login", validateBody(loginSchema), authController.login)
authRouter.post("/logout", authController.logout)
authRouter.get("/me", requireAuth, authController.me)
