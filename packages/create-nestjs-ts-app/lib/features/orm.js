import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIKRO_PATHS = [
  'src/infrastructure/database',
  'src/mikro-orm.config.ts',
];

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, targetPath);
        return;
      }

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(sourcePath, targetPath);
    }),
  );
}

async function patchFile(targetDir, relativePath, replacer) {
  const filePath = path.join(targetDir, relativePath);
  if (!(await pathExists(filePath))) {
    return;
  }

  const content = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, replacer(content));
}

function prismaProvider(database) {
  if (database === 'mysql') return 'mysql';
  if (database === 'sqlite') return 'sqlite';
  return 'postgresql';
}

function typeormType(database) {
  if (database === 'mysql') return 'mysql';
  if (database === 'sqlite') return 'sqlite';
  return 'postgres';
}

function mikroDriver(database) {
  if (database === 'mysql') return '@mikro-orm/mysql';
  if (database === 'sqlite') return '@mikro-orm/sqlite';
  return '@mikro-orm/postgresql';
}

function buildDatabaseUrl(database) {
  if (database === 'sqlite') {
    return 'file:./database/dev.sqlite';
  }

  if (database === 'mysql') {
    return 'mysql://root:postgres@localhost:3306/db_name';
  }

  return 'postgresql://postgres:postgres@localhost:5432/db_name';
}

function usersCreateSql(database) {
  if (database === 'mysql') {
    return `CREATE TABLE users (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);`;
  }

  if (database === 'sqlite') {
    return `CREATE TABLE users (
  id TEXT NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;
  }

  return `CREATE TABLE "users" (
  "id" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "username" varchar(255) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);`;
}

function usersDropSql(database) {
  if (database === 'sqlite' || database === 'mysql') {
    return 'DROP TABLE IF EXISTS users;';
  }

  return 'DROP TABLE IF EXISTS "users" CASCADE;';
}

async function writePrismaMigration(targetDir, database) {
  const migrationDir = path.join(
    targetDir,
    'prisma/migrations/20250429052621_create_users',
  );
  await fs.mkdir(migrationDir, { recursive: true });
  await fs.writeFile(path.join(migrationDir, 'migration.sql'), `${usersCreateSql(database)}\n`);
}

async function writeTypeormMigration(targetDir, database) {
  const migrationsDir = path.join(targetDir, 'src/infrastructure/database/migrations');
  await fs.mkdir(migrationsDir, { recursive: true });
  await fs.writeFile(
    path.join(migrationsDir, '1730000000000-CreateUsers.ts'),
    `import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUsers1730000000000 implements MigrationInterface {
  name = 'CreateUsers1730000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`${usersCreateSql(database).replace(/`/g, '\\`')}\`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`${usersDropSql(database).replace(/`/g, '\\`')}\`)
  }
}
`,
  );
}

async function writePrismaService(targetDir, database) {
  let content;

  if (database === 'mysql') {
    content = `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set')
    }

    const url = new URL(connectionString)
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\\//, ''),
    })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
`;
  } else if (database === 'sqlite') {
    content = `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../../generated/prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL || 'file:./database/dev.sqlite'
    const adapter = new PrismaBetterSqlite3({ url: connectionString })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
`;
  } else {
    content = `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set')
    }

    const adapter = new PrismaPg({ connectionString })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
`;
  }

  await fs.writeFile(
    path.join(targetDir, 'src/infrastructure/database/prisma.service.ts'),
    content,
  );
}

async function applyPrismaDialect(targetDir, database) {
  await patchFile(targetDir, 'prisma/schema.prisma', (content) =>
    content.replace(
      /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]+(")/,
      `$1${prismaProvider(database)}$2`,
    ),
  );

  await writePrismaService(targetDir, database);
  await writePrismaMigration(targetDir, database);

  await patchFile(targetDir, '.env.example', (content) => {
    const url = `DATABASE_URL=${buildDatabaseUrl(database)}`;
    if (content.includes('DATABASE_URL=')) {
      return content.replace(/DATABASE_URL=.*/, url);
    }
    return `${content.trimEnd()}\n\n${url}\n`;
  });

  await patchFile(targetDir, '.gitignore', (content) => {
    if (content.includes('src/generated')) {
      return content;
    }
    return `${content.trimEnd()}\n\nsrc/generated\n`;
  });
}

async function applyTypeormDialect(targetDir, database) {
  await patchFile(targetDir, 'src/infrastructure/database/database.module.ts', (content) =>
    content.replace(
      /type: \(config\.get<string>\('database\.dialect'\) as 'postgres'\) \|\| 'postgres'/,
      `type: '${typeormType(database)}'`,
    ),
  );
  await patchFile(targetDir, 'src/infrastructure/database/data-source.ts', (content) =>
    content.replace(
      /type: \(process\.env\.DB_DIALECT as 'postgres'\) \|\| 'postgres'/,
      `type: '${typeormType(database)}'`,
    ),
  );
  await writeTypeormMigration(targetDir, database);
}

async function applyMikroDialect(targetDir, database) {
  const driver = mikroDriver(database);

  await patchFile(targetDir, 'src/infrastructure/database/database.provider.ts', (content) =>
    content
      .replace(/from '@mikro-orm\/[^']+'/g, `from '${driver}'`)
      .replace(
        /entities: \['\.\/dist\/infrastructure\/database\/entities\/\*\.js'\],\n {4}entitiesTs: \['\.\/src\/infrastructure\/database\/entities\/\*\.ts'\],/,
        '',
      ),
  );
  await patchFile(targetDir, 'src/mikro-orm.config.ts', (content) =>
    content.replace(/from '@mikro-orm\/[^']+'/g, `from '${driver}'`),
  );
  await patchFile(targetDir, 'src/modules/users/users.service.ts', (content) =>
    content.replace(/from '@mikro-orm\/[^']+'/g, `from '${driver}'`),
  );

  if (database === 'sqlite') {
    await patchFile(targetDir, 'src/infrastructure/database/database.provider.ts', (content) =>
      content.replace(
        /defineConfig\(\{[\s\S]*?pool: \{[\s\S]*?\},/,
        `defineConfig({
    dbName: configService.get<string>('database.name') || './database/dev.sqlite',
    discovery: { warnWhenNoEntities: false },
    debug: false,
    allowGlobalContext: true,
    pool: {
      min: 1,
      max: 5,
    },`,
      ),
    );
  }
}

async function removePaths(targetDir, relativePaths) {
  await Promise.all(
    relativePaths.map((relativePath) => removeIfExists(path.join(targetDir, relativePath))),
  );
}

export async function applyOrmFeature(targetDir, orm, database) {
  const selectedOrm = orm || 'mikroorm';

  if (selectedOrm === 'mikroorm') {
    await applyMikroDialect(targetDir, database);
    return;
  }

  const overlayDir = path.join(__dirname, '../../templates/orm', selectedOrm);
  if (!(await pathExists(overlayDir))) {
    throw new Error(`ORM overlay not found: ${selectedOrm}`);
  }

  await removePaths(targetDir, MIKRO_PATHS);
  await copyDirectory(overlayDir, targetDir);

  if (selectedOrm === 'prisma') {
    await applyPrismaDialect(targetDir, database);
  } else if (selectedOrm === 'typeorm') {
    await applyTypeormDialect(targetDir, database);
  }
}

const MIKRO_PACKAGES = [
  '@mikro-orm/cli',
  '@mikro-orm/core',
  '@mikro-orm/migrations',
  '@mikro-orm/nestjs',
  '@mikro-orm/postgresql',
  '@mikro-orm/mysql',
  '@mikro-orm/sqlite',
  '@mikro-orm/seeder',
];

export function getOrmDependencies(orm, database) {
  const selectedOrm = orm || 'mikroorm';

  if (selectedOrm === 'mikroorm') {
    if (database === 'postgres') {
      return { add: {}, remove: [], scripts: null, devDependencies: {} };
    }

    const driverPackage = mikroDriver(database);
    return {
      add: {
        [driverPackage]: '^6.4.11',
      },
      remove: ['@mikro-orm/postgresql'],
      scripts: null,
      devDependencies: {},
    };
  }

  if (selectedOrm === 'sequelize') {
    let driverAdd = { pg: '^8.14.1' };
    let driverRemove = [];
    if (database === 'mysql') {
      driverAdd = { mysql2: '^3.14.0' };
      driverRemove = ['pg', '@types/pg'];
    } else if (database === 'sqlite') {
      driverAdd = { sqlite3: '^5.1.7' };
      driverRemove = ['pg', '@types/pg'];
    }

    return {
      add: {
        '@nestjs/sequelize': '^11.0.0',
        sequelize: '^6.37.7',
        'sequelize-typescript': '^2.1.6',
        ...driverAdd,
      },
      remove: [...MIKRO_PACKAGES, ...driverRemove],
      devDependencies: {
        'sequelize-cli': '^6.6.3',
        ...(database === 'postgres' ? { '@types/pg': '^8.11.11' } : {}),
      },
      scripts: {
        'db:up': 'sequelize db:migrate',
        'db:migrate': 'sequelize migration:generate --name',
        'db:fresh': 'sequelize db:migrate:undo:all && sequelize db:migrate',
        'db:seed': 'sequelize db:seed:all',
      },
    };
  }

  if (selectedOrm === 'prisma') {
    let adapterAdd = {
      '@prisma/adapter-pg': '^6.16.0',
      pg: '^8.14.1',
    };

    if (database === 'mysql') {
      adapterAdd = {
        '@prisma/adapter-mariadb': '^6.16.0',
        mariadb: '^3.4.0',
      };
    } else if (database === 'sqlite') {
      adapterAdd = {
        '@prisma/adapter-better-sqlite3': '^6.16.0',
        'better-sqlite3': '^11.8.1',
      };
    }

    return {
      add: {
        '@prisma/client': '^6.16.0',
        ...adapterAdd,
      },
      remove: [...MIKRO_PACKAGES],
      devDependencies: {
        prisma: '^6.16.0',
        ...(database === 'postgres' ? { '@types/pg': '^8.11.11' } : {}),
      },
      scripts: {
        'db:up': 'prisma migrate deploy',
        'db:migrate': 'prisma migrate dev --name',
        'db:fresh': 'prisma migrate reset --force',
        'db:seed': 'prisma db seed',
        postinstall: 'prisma generate',
      },
    };
  }

  if (selectedOrm === 'typeorm') {
    let driverAdd = { pg: '^8.14.1' };
    let driverRemove = [];
    if (database === 'mysql') {
      driverAdd = { mysql2: '^3.14.0' };
      driverRemove = ['pg', '@types/pg'];
    } else if (database === 'sqlite') {
      driverAdd = { sqlite3: '^5.1.7' };
      driverRemove = ['pg', '@types/pg'];
    }

    return {
      add: {
        '@nestjs/typeorm': '^11.0.0',
        typeorm: '^0.3.21',
        ...driverAdd,
      },
      remove: [...MIKRO_PACKAGES, ...driverRemove],
      devDependencies: {
        ...(database === 'postgres' ? { '@types/pg': '^8.11.11' } : {}),
      },
      scripts: {
        'db:up':
          'typeorm-ts-node-commonjs migration:run -d src/infrastructure/database/data-source.ts',
        'db:migrate':
          'typeorm-ts-node-commonjs migration:generate -d src/infrastructure/database/data-source.ts',
        'db:fresh':
          'typeorm-ts-node-commonjs migration:revert -d src/infrastructure/database/data-source.ts',
        'db:seed': undefined,
      },
    };
  }

  return { add: {}, remove: [], scripts: null, devDependencies: {} };
}
