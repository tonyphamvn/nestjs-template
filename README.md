# NestJS TS Boilerplate

Scaffold and ship a NestJS + TypeScript API with one command.

This repository contains:

1. The **API template** (NestJS + Fastify + MikroORM + PostgreSQL by default)
2. The **`create-nestjs-ts-app`** npm package under [`packages/create-nestjs-ts-app`](packages/create-nestjs-ts-app)

## Features

- NestJS 11 + Fastify + TypeScript (SWC)
- ORM: MikroORM (default), TypeORM, Prisma, or Sequelize
- Database: PostgreSQL (default), MySQL, or SQLite
- Optional JWT auth module scaffold
- Optional Redis + BullMQ queues
- Winston logging, Swagger, Terminus health checks
- Validation pipes, exception filters, response interceptor
- Deploy: Docker (Distroless prod image), PM2, or none

## Requirements

- Node.js `>= 20`
- npm `>= 10` (or pnpm / yarn / bun via CLI)
- Docker (optional, for Postgres/Redis locally and production images)

## Quick start (scaffold a new app)

```sh
npx create-nestjs-ts-app my-api
cd my-api
docker compose up -d
npm run db:up
npm run start:dev
```

Then open:

- Health: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- Swagger: [http://localhost:8000/api](http://localhost:8000/api)

### CLI examples

```sh
npx create-nestjs-ts-app my-api
npx create-nestjs-ts-app my-api --yes
npx create-nestjs-ts-app my-api --yes --orm typeorm --database mysql
npx create-nestjs-ts-app my-api --yes --orm prisma --deploy pm2 --redis
npx create-nestjs-ts-app my-api --yes --orm sequelize --database sqlite --deploy none
```

### CLI options

| Option | Description | Default |
| --- | --- | --- |
| `--yes`, `-y` | Skip prompts and use defaults | off |
| `--orm <name>` | `mikroorm` \| `typeorm` \| `prisma` \| `sequelize` | `mikroorm` |
| `--database <type>` | `postgres` \| `mysql` \| `sqlite` | `postgres` |
| `--jwt` / `--no-jwt` | Auth module scaffold | on |
| `--deploy <mode>` | `docker` \| `pm2` \| `none` | `docker` |
| `--docker` / `--no-docker` | Alias for `--deploy docker` / `--deploy none` | — |
| `--pm2` | Alias for `--deploy pm2` | — |
| `--redis` / `--no-redis` | Redis + BullMQ | off |
| `--git` / `--no-git` | Initialize a git repository | on |
| `--package-manager <pm>` | `npm` \| `pnpm` \| `yarn` \| `bun` | `npm` |
| `--template <source>` | Template repo | `tonyphamvn/nestjs-template` |
| `--provider <name>` | `degit` \| `giget` | `degit` |
| `--local` | Copy template from this repo (CLI development) | off |

Full CLI docs: [`packages/create-nestjs-ts-app/README.md`](packages/create-nestjs-ts-app/README.md)

---

## Developing this template

### Setup

```sh
cp .env.example .env
npm install
docker compose up -d
npm run db:up
npm run start:dev
```

### Project structure

```text
src/
├── main.ts                 # Bootstrap (Fastify, Swagger, global pipes/filters)
├── app.module.ts
├── mikro-orm.config.ts
├── config/                 # Env + queue config
├── common/                 # DTOs, filters, interceptors, logger
├── infrastructure/
│   └── database/           # MikroORM module, entities, migrations, seeders
├── modules/
│   ├── auth/
│   ├── users/
│   ├── organizations/
│   ├── orders/
│   └── payments/
├── health/                 # Terminus health checks
├── shared/                 # Constants / utils
└── scripts/                # DB init helpers
```

### Environment

Copy `.env.example` → `.env`. Important variables:

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | `development` \| `production` | `development` |
| `APP_PORT` | HTTP port | `8000` |
| `DB_DIALECT` | Database dialect | `postgres` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASS` | Database password | `postgres` |
| `DB_NAME` | Database name | `db_name` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (used by `docker compose`) | — |

### Scripts

| Script | Description |
| --- | --- |
| `npm run start:dev` | Dev server with watch |
| `npm run start:debug` | Dev server with debugger |
| `npm run build` | Compile with Nest + SWC |
| `npm run start:prod` | Run `node dist/src/main` |
| `npm run lint` | ESLint with `--fix` |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run db:up` | Run MikroORM migrations |
| `npm run db:migrate` | Drop schema + create migration |
| `npm run db:fresh` | Fresh migrations |
| `npm run db:seed` | Fresh migrations + seed |
| `npm run pm2:dev` | Build + start with PM2 (development) |
| `npm run pm2:prod` | Build + start with PM2 (production) |

### Local services (Docker Compose)

`docker compose up -d` starts:

- **PostgreSQL** `16.3-alpine` on `$DB_PORT` (default `5432`)
- **Redis** `7.0-alpine` on `$REDIS_PORT` (default `6379`)

### API endpoints

| Path | Description |
| --- | --- |
| `GET /` | Redirects to `/api/v1/health` |
| `GET /api/v1/health` | Health check |
| `GET /api` | Swagger UI |
| `GET /api/v1/...` | Application routes (global prefix `api/v1`) |

---

## Production deploy

### Docker (recommended)

Multi-stage build: compile on `node:22-bookworm-slim`, run on Distroless (`gcr.io/distroless/nodejs22-debian12:nonroot`).

```sh
docker build -t create-nestjs-ts-app:prod .
docker run --env-file .env -p 8000:8000 create-nestjs-ts-app:prod
```

Notes:

- Entry point: `dist/src/main`
- Default port: `8000`
- Distroless has no shell — `docker exec ... sh` will not work
- Pass runtime config via `--env-file` or `-e`

### PM2

```sh
npm run build
npm run pm2:prod
```

Uses [`ecosystem.config.js`](ecosystem.config.js).

---

## Testing the CLI locally

```sh
cd packages/create-nestjs-ts-app && npm install
node bin/create-nestjs-ts-app.js my-api --local --yes --orm typeorm --no-git
```

`--local` copies the template from this repo instead of downloading from GitHub.

## Publishing the CLI

The package is published from [`packages/create-nestjs-ts-app`](packages/create-nestjs-ts-app) via [`.github/workflows/release.yml`](.github/workflows/release.yml).

1. Bump `version` in `packages/create-nestjs-ts-app/package.json`
2. Tag `vX.Y.Z` matching that version (or run the workflow manually)
3. Ensure `NPM_TOKEN` is set in GitHub secrets

```sh
npx create-nestjs-ts-app my-api
```

## License

MIT
