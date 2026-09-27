# Mixtape Studio - production image
# One container: Express backend serves the API, live updates (SSE), media files and the built frontend.

# Must be >= 22.12 (backend require()s the ESM-only music-metadata)
ARG NODE_VERSION=22

# ---- Base: toolchain for native modules (better-sqlite3) ----
FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /src
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
# Skip ffmpeg-static's binary download (system ffmpeg is used at runtime).
# Its installer exits early when FFMPEG_BIN points at an existing file.
ENV FFMPEG_BIN=/bin/sh
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY shared/package.json shared/

# ---- Build: compile backend + build frontend ----
FROM base AS build
RUN npm ci
COPY shared shared
COPY backend backend
COPY frontend frontend
RUN npm run build

# ---- Deps: backend production dependencies only ----
FROM base AS deps
RUN npm ci --omit=dev --workspace backend \
 && mkdir -p backend/node_modules

# ---- Runtime ----
FROM node:${NODE_VERSION}-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=3001 \
    FFMPEG_BIN=/usr/bin/ffmpeg \
    FRONTEND_DIST=/app/public

WORKDIR /app
COPY --from=deps /src/node_modules ./node_modules
# The backend resolves data/mp3s/images/temp relative to its compiled files.
# Placing them in /app/src makes those /app/data, /app/mp3s, /app/images and
# /app/temp, which docker-compose mounts as volumes.
COPY --from=build /src/backend/dist/backend/src ./src
# Non-hoisted backend deps (if any) resolve from /app/src/node_modules
COPY --from=deps /src/backend/node_modules ./src/node_modules
COPY --from=build /src/frontend/dist ./public
RUN mkdir -p data mp3s images temp && chown node:node data mp3s images temp

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
