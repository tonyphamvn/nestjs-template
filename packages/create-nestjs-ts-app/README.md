# create-nestjs-ts-app

Scaffold a NestJS + TypeScript API with one command.

```sh
npx create-nestjs-ts-app my-api
```

## Quick start

```sh
npx create-nestjs-ts-app my-api
cd my-api
docker compose up -d
npm run db:up
npm run start:dev
```

Then open:

- Health: http://localhost:8000/api/v1/health
- Swagger: http://localhost:8000/api

Also available as:

```sh
npm create nestjs-ts-app my-api
```

## What’s included

- NestJS 11 + Fastify + TypeScript
- ORM choice: MikroORM (default), TypeORM, Prisma, or Sequelize
- Database choice: PostgreSQL (default), MySQL, or SQLite
- Optional auth module scaffold
- Optional Redis + BullMQ
- Optional Docker (Distroless prod image) or PM2
- Winston logging, Swagger docs, Terminus health check
- Validation, exception filters, response interceptor

## Options

| Option | Description | Default |
| --- | --- | --- |
| `--yes`, `-y` | Skip prompts and use defaults | off |
| `--orm <name>` | `mikroorm` \| `sequelize` \| `prisma` \| `typeorm` | `mikroorm` |
| `--database <type>` | `postgres` \| `mysql` \| `sqlite` | `postgres` |
| `--jwt` / `--no-jwt` | Include auth module scaffold | on |
| `--deploy <mode>` | `docker` \| `pm2` \| `none` | `docker` |
| `--docker` / `--no-docker` | Alias for `--deploy docker` / `--deploy none` | — |
| `--pm2` | Alias for `--deploy pm2` | — |
| `--redis` / `--no-redis` | Include Redis + BullMQ queues | off |
| `--git` / `--no-git` | Initialize a git repository | on |
| `--package-manager <pm>` | `npm` \| `pnpm` \| `yarn` \| `bun` | `npm` |
| `--provider <name>` | Template downloader: `degit` \| `giget` | `degit` |
| `--template <source>` | Template source | `tonyphamvn/nestjs-template` |
| `--local` | Copy template from a local checkout (development) | off |
| `-h`, `--help` | Show help | — |

## Examples

```sh
# Interactive
npx create-nestjs-ts-app

# Defaults, non-interactive
npx create-nestjs-ts-app my-api --yes

# TypeORM + MySQL
npx create-nestjs-ts-app my-api --yes --orm typeorm --database mysql

# Prisma + PM2 + Redis
npx create-nestjs-ts-app my-api --yes --orm prisma --deploy pm2 --redis

# Sequelize + SQLite, no auth, no deploy tooling
npx create-nestjs-ts-app my-api --yes --orm sequelize --database sqlite --no-jwt --deploy none

# Custom package manager
npx create-nestjs-ts-app my-api --yes --package-manager pnpm
```

## After scaffolding

Typical next steps (printed by the CLI as well):

```sh
cd my-api
docker compose up -d   # if deploy is docker/pm2 and DB is not sqlite
npm run db:up
npm run start:dev
```

### Production (Docker)

When `--deploy docker` (default):

```sh
docker build -t api .
docker run --env-file .env -p 8000:8000 api
```

The production image is Distroless (no shell). Entry point: `dist/src/main`.

### Production (PM2)

When `--deploy pm2`:

```sh
npm run build
npm run pm2:prod
```

## Requirements

- Node.js `>= 20`
- Docker (optional; for Compose services and Docker deploy)

## Template source

By default the CLI downloads [`tonyphamvn/nestjs-template`](https://github.com/tonyphamvn/nestjs-template).

Override with:

```sh
npx create-nestjs-ts-app my-api --template owner/repo --provider degit
```

## License

MIT
