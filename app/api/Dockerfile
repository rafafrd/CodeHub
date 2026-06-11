# =============================================================================
# CodeHub API — imagem multi-stage. Build context = raiz do monorepo.
#   docker build -f app/api/Dockerfile -t codehub-api .
# =============================================================================

# --- Stage 1: build (TypeScript -> dist) ------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Toolchain p/ compilar o binding nativo do better-sqlite3 caso não haja
# prebuilt para musl nesta arquitetura.
RUN apk add --no-cache python3 make g++

# Manifestos primeiro (aproveita cache de camadas do npm)
COPY package.json package-lock.json ./
COPY app/api/package.json ./app/api/package.json
RUN npm ci

# Código-fonte + config de TS, e compila
COPY tsconfig.base.json ./
COPY app/api ./app/api
RUN npm run build -w @codehub/api

# --- Stage 2: runtime (somente dist + deps de produção) ---------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
COPY app/api/package.json ./app/api/package.json
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/app/api/dist ./app/api/dist

EXPOSE 3333
WORKDIR /app/app/api
CMD ["node", "dist/shared/http/server.js"]
