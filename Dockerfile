# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS build
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY nest-cli.json tsconfig.json tsconfig.build.json .swcrc ./
COPY src ./src
RUN npm run build && npm cache clean --force

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV APP_PORT=8000

COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=deps --chown=nonroot:nonroot /app/package.json ./
COPY --from=build --chown=nonroot:nonroot /app/dist ./dist

EXPOSE 8000
CMD ["dist/src/main"]
