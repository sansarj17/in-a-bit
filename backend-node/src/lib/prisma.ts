import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import { env } from "../config/env"

/**
 * The single Prisma client for the whole app.
 * Each client owns a connection pool, so creating more than one would waste connections.
 */
const adapter = new PrismaPg({ connectionString: env.databaseUrl })

export const prisma = new PrismaClient({ adapter })
