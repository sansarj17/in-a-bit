# API image. Build from backend-node/:  docker build -t in-a-bit-api .
#
# Two stages: the first installs everything (TypeScript and Prisma are needed to build),
# compiles to dist/ and then drops the dev dependencies; the second copies only what
# running the server needs, so the final image stays small.

# Shared base. Prisma's engines need OpenSSL, which the slim image leaves out; it must be
# present at install time too, so Prisma downloads the engine build that matches it.
FROM node:24-slim AS base
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app


FROM base AS build
RUN corepack enable

# Dependencies first, so Docker can reuse this layer when only source code changes.
# postinstall runs `prisma generate`, which needs the schema and config.
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build && pnpm prune --prod


FROM base AS runtime
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/prisma.config.ts ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Don't run as root inside the container.
USER node

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 8080) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Apply any new database migrations, then start the server.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/server.js"]
