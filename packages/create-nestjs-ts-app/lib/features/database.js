import fs from 'node:fs/promises';
import path from 'node:path';

const MYSQL_DOCKER = `services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: \${DB_PASS}
      MYSQL_USER: \${DB_USER}
      MYSQL_PASSWORD: \${DB_PASS}
      MYSQL_DATABASE: \${DB_NAME}
    ports:
      - \${DB_PORT}:3306
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - backend
    restart: always

  redis:
    image: redis:7.0-alpine
    volumes:
      - redis_data:/data
    ports:
      - 6379:6379
    restart: always
    networks:
      - backend

networks:
  backend:

volumes:
  mysql_data:
  redis_data:
`;

const SQLITE_DOCKER = `services:
  redis:
    image: redis:7.0-alpine
    volumes:
      - redis_data:/data
    ports:
      - 6379:6379
    restart: always
    networks:
      - backend

networks:
  backend:

volumes:
  redis_data:
`;

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeFile(targetDir, relativePath, content) {
  await fs.writeFile(path.join(targetDir, relativePath), content);
}

async function patchFile(targetDir, relativePath, replacer) {
  const filePath = path.join(targetDir, relativePath);
  if (!(await pathExists(filePath))) {
    return;
  }

  const content = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, replacer(content));
}

async function applyMysqlConfig(targetDir, orm) {
  await patchFile(targetDir, 'src/config/index.ts', (content) =>
    content
      .replace("dialect: process.env.DB_DIALECT || 'postgres'", "dialect: process.env.DB_DIALECT || 'mysql'")
      .replace(
        "port: parseInt(process.env.DB_PORT ?? '', 10) || 5432",
        "port: parseInt(process.env.DB_PORT ?? '', 10) || 3306",
      )
      .replace(
        "user: process.env.DB_USER || 'postgres'",
        "user: process.env.DB_USER || 'root'",
      ),
  );

  if (orm === 'sequelize') {
    await patchFile(targetDir, 'src/config/sequelize-cli.js', (content) =>
      content
        .replace("dialect: process.env.DB_DIALECT || 'postgres'", "dialect: process.env.DB_DIALECT || 'mysql'")
        .replace("port: parseInt(process.env.DB_PORT || '5432', 10)", "port: parseInt(process.env.DB_PORT || '3306', 10)")
        .replace("username: process.env.DB_USER || 'postgres'", "username: process.env.DB_USER || 'root'"),
    );
  }

  if (orm === 'typeorm') {
    await patchFile(targetDir, 'src/infrastructure/database/data-source.ts', (content) =>
      content
        .replace("type: (process.env.DB_DIALECT as 'postgres') || 'postgres'", "type: 'mysql'")
        .replace("port: parseInt(process.env.DB_PORT || '5432', 10)", "port: parseInt(process.env.DB_PORT || '3306', 10)")
        .replace("username: process.env.DB_USER || 'postgres'", "username: process.env.DB_USER || 'root'"),
    );
  }

  await writeFile(targetDir, 'docker-compose.yml', MYSQL_DOCKER);
  await patchFile(targetDir, '.env.example', (content) =>
    content
      .replace('DB_TYPE=postgresql', 'DB_TYPE=mysql')
      .replace('DB_PORT=5432', 'DB_PORT=3306')
      .replace('DB_USER=postgres', 'DB_USER=root'),
  );
}

async function applySqliteConfig(targetDir, orm) {
  await patchFile(targetDir, 'src/config/index.ts', (content) =>
    content.replace(
      / {2}\/\/ Database Connection Details\n {2}database: \{[\s\S]*?\},/,
      `  // Database Connection Details
  database: {
    dialect: 'sqlite',
    name: process.env.DB_STORAGE || './database/dev.sqlite',
    host: 'localhost',
    port: 0,
    user: '',
    password: '',
  },`,
    ),
  );

  if (orm === 'sequelize') {
    await patchFile(
      targetDir,
      'src/config/sequelize-cli.js',
      () => `require('dotenv/config')

const shared = {
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './database/dev.sqlite',
}

module.exports = {
  development: shared,
  test: shared,
  production: shared,
}
`,
    );

    await patchFile(targetDir, 'src/infrastructure/database/database.module.ts', (content) =>
      content.replace(
        /useFactory: \(config: ConfigService\) => \(\{[\s\S]*?synchronize: false,\n {6}\}\)/,
        `useFactory: (config: ConfigService) => ({
        dialect: 'sqlite',
        storage: config.get<string>('database.name') || './database/dev.sqlite',
        models: [User],
        autoLoadModels: true,
        synchronize: false,
      })`,
      ),
    );
  }

  if (orm === 'typeorm') {
    await patchFile(
      targetDir,
      'src/infrastructure/database/data-source.ts',
      () => `import 'dotenv/config'
import { DataSource } from 'typeorm'

import { User } from './entities'

export default new DataSource({
  type: 'sqlite',
  database: process.env.DB_STORAGE || './database/dev.sqlite',
  entities: [User],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
})
`,
    );

    await patchFile(targetDir, 'src/infrastructure/database/database.module.ts', (content) =>
      content.replace(
        /useFactory: \(config: ConfigService\) => \(\{[\s\S]*?migrations: \['dist\/infrastructure\/database\/migrations\/\*\.js'\],\n {6}\}\)/,
        `useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get<string>('database.name') || './database/dev.sqlite',
        entities: [User],
        synchronize: false,
        migrations: ['dist/infrastructure/database/migrations/*.js'],
      })`,
      ),
    );
  }

  await writeFile(targetDir, 'docker-compose.yml', SQLITE_DOCKER);
  await patchFile(targetDir, '.env.example', (content) =>
    content
      .replace(/DB_TYPE=.*\n/, 'DB_TYPE=sqlite\n')
      .replace(/DB_HOST=.*\n/, '')
      .replace(/DB_PORT=.*\n/, '')
      .replace(/DB_USER=.*\n/, '')
      .replace(/DB_PASS=.*\n/, '')
      .replace(/DB_NAME=.*\n/, 'DB_STORAGE=./database/dev.sqlite\n'),
  );
}

export async function applyDatabaseFeature(targetDir, database, orm = 'mikroorm') {
  if (database === 'postgres') {
    return;
  }

  if (database === 'mysql') {
    await applyMysqlConfig(targetDir, orm);
    return;
  }

  if (database === 'sqlite') {
    await applySqliteConfig(targetDir, orm);
  }
}

export function getDatabaseDependencies(database, orm = 'mikroorm') {
  if (orm === 'prisma' || orm === 'mikroorm') {
    return { add: {}, remove: [] };
  }

  if (database === 'mysql') {
    return {
      add: { mysql2: '^3.14.0' },
      remove: ['pg', '@types/pg'],
    };
  }

  if (database === 'sqlite') {
    return {
      add: { sqlite3: '^5.1.7' },
      remove: ['pg', '@types/pg'],
    };
  }

  return { add: {}, remove: [] };
}
