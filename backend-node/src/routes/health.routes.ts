import { Router } from "express";
import { logger } from "../lib/logger";

const healthRouter = Router()

healthRouter.get("/health", (req,res) => {
    logger.info("Server Health Route up and running")

    res.status(200).json({
        success:true,
        message:"Health Check: Health Router up and running"
    })
})

export { healthRouter }