## NestJS TS Boilerplate

Scaffold and ship a NestJS + TypeScript API with one command.

This repository contains:

1. The **API template** (NestJS + Fastify + MikroORM + PostgreSQL by default)
2. The **`create-nestjs-ts-app`** npm package under `packages/create-nestjs-ts-app`

## Quick Overview

```sh
npx create-nestjs-ts-app my-api
cd my-api
docker compose up -d
npm run db:up
npm run start:dev
```

Then open [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health).

## Creating an App

```sh
npx create-nestjs-ts-app my-api
# or
npm create nestjs-ts-app my-api
```

Skip prompts / customize:

```sh
npx create-nestjs-ts-app my-api --yes
npx create-nestjs-ts-app my-api --yes --orm typeorm --database mysql
npx create-nestjs-ts-app my-api --yes --orm prisma --deploy pm2 --redis
npx create-nestjs-ts-app my-api --yes --orm sequelize --database sqlite --deploy none
```

### Options

| Option                   | Description                                        | Default    |
| ------------------------ | -------------------------------------------------- | ---------- |
| `--orm`                  | `mikroorm` \| `typeorm` \| `prisma` \| `sequelize` | `mikroorm` |
| `--database`             | `postgres` \| `mysql` \| `sqlite`                  | `postgres` |
| `--jwt` / `--no-jwt`     | Auth module scaffold                               | on         |
| `--deploy`               | `docker` \| `pm2` \| `none`                        | `docker`   |
| `--redis` / `--no-redis` | Redis + BullMQ                                     | off        |

See [`packages/create-nestjs-ts-app/README.md`](packages/create-nestjs-ts-app/README.md) for full CLI docs.

## Developing This Repo

```sh
cp .env.example .env
yarn install
docker compose up -d
yarn db:up
yarn start:dev
```

Test CLI locally:

```sh
cd packages/create-nestjs-ts-app && npm install
node bin/create-nestjs-ts-app.js my-api --local --yes --orm typeorm --no-git
```

## License

MIT
