import pino from "pino"
import { env } from "../config/env"

/**
 * Default logger that needs to be used for all log related work. 
 */
export const logger = pino({
    level:env.logLevel,
    transport: env.isProduction ? undefined : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    },
})