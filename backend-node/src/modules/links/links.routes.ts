import { Router } from "express"
import { createLinkLimiter } from "../../middlewares/rateLimit"
import { requireAuth } from "../../middlewares/requireAuth"
import { validateBody } from "../../middlewares/validate"
import * as linksController from "./links.controller"
import { createLinkSchema, updateLinkSchema } from "./links.schema"

/** Mounted at /api/links. Every route needs a logged-in user. */
export const linksRouter = Router()

linksRouter.use(requireAuth)

linksRouter.post("/", createLinkLimiter, validateBody(createLinkSchema), linksController.create)
linksRouter.get("/", linksController.list)
linksRouter.get("/:id", linksController.getOne)
linksRouter.patch("/:id", validateBody(updateLinkSchema), linksController.update)
linksRouter.delete("/:id", linksController.remove)
