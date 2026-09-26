import express from "express"
import cors from "cors"
import { errorHandler } from "./middlewares/errorHandler"
import { notFound } from "./middlewares/notFound"
import { apiRouter } from "./routes"

export function createApp() {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))

    // Routes
    app.use("/api",apiRouter)

    // 404 Handler
    app.use(notFound)

    // Global Error Handler
    app.use(errorHandler)

    return app
}