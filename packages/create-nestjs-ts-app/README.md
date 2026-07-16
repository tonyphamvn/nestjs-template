## Create NestJS TS App

Scaffold a NestJS + TypeScript API with one command.

## Quick Overview

```sh
npx create-nestjs-ts-app my-api
cd my-api
docker compose up -d
npm run db:up
npm run start:dev
```

## Options

| Option                     | Description                                        | Default    |
| -------------------------- | -------------------------------------------------- | ---------- |
| `--yes`, `-y`              | Skip prompts and use defaults                      | off        |
| `--orm <name>`             | `mikroorm` \| `sequelize` \| `prisma` \| `typeorm` | `mikroorm` |
| `--database <type>`        | `postgres` \| `mysql` \| `sqlite`                  | `postgres` |
| `--jwt` / `--no-jwt`       | Include auth module scaffold                       | on         |
| `--deploy <mode>`          | `docker` \| `pm2` \| `none`                        | `docker`   |
| `--docker` / `--no-docker` | Alias for `--deploy docker` / `--deploy none`      | —          |
| `--pm2`                    | Alias for `--deploy pm2`                           | —          |
| `--redis` / `--no-redis`   | Include Redis + BullMQ queues                      | off        |
| `--git` / `--no-git`       | Initialize a git repository                        | on         |
| `--package-manager <pm>`   | `npm` \| `pnpm` \| `yarn` \| `bun`                 | `npm`      |

## Examples

```sh
npx create-nestjs-ts-app my-api --yes
npx create-nestjs-ts-app my-api --yes --orm typeorm --database mysql
npx create-nestjs-ts-app my-api --yes --orm prisma --deploy pm2
npx create-nestjs-ts-app my-api --yes --orm sequelize --database sqlite --no-jwt
```

## What’s Included?

- NestJS 11 + Fastify + TypeScript
- MikroORM (default), TypeORM, Prisma, or Sequelize
- PostgreSQL, MySQL, or SQLite
- Optional auth module scaffold
- Optional Redis + BullMQ
- Optional Docker or PM2
- Winston, Swagger, Terminus health check

## License

MIT
