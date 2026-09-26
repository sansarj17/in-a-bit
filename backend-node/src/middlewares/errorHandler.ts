import type {Request, Response, NextFunction} from "express"
import { logger } from "../lib/logger"

export function errorHandler(
    err:Error,
    _req:Request,
    res:Response,
    _next:NextFunction
):void {
    logger.error({err},"Unhandled Exception")

    res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
}