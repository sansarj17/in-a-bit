// Configuration for the Prisma CLI (generate, migrate, studio).
// Prisma 7 does not load .env on its own, so dotenv does it here.
import dotenv from "dotenv"
import { defineConfig } from "prisma/config"

dotenv.config({ quiet: true })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Not `env("DATABASE_URL")`: that throws even for `prisma generate`, which needs no
    // database. This lets `pnpm install` (postinstall → generate) work in CI and on hosts
    // without a .env; migrate/studio still fail clearly if the URL is missing.
    url: process.env.DATABASE_URL,
  },
})
