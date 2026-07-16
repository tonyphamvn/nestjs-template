import fs from 'node:fs/promises';
import path from 'node:path';

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function patchFile(targetDir, relativePath, replacer) {
  const filePath = path.join(targetDir, relativePath);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    await fs.writeFile(filePath, replacer(content));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function removeRedisFeature(targetDir) {
  await removeIfExists(path.join(targetDir, 'src/config/queue.config.ts'));

  await patchFile(targetDir, 'src/app.module.ts', (content) =>
    content
      .replace("import { BullModule } from '@nestjs/bullmq'\n", '')
      .replace("import { createQueueConfig } from './config/queue.config'\n", '')
      .replace(
        / {4}BullModule\.forRootAsync\(\{[\s\S]*?\}\),\n/,
        '',
      )
      .replace(
        "import { ConfigModule, ConfigService } from '@nestjs/config'\n",
        "import { ConfigModule } from '@nestjs/config'\n",
      ),
  );

  await patchFile(targetDir, 'src/modules/users/users.module.ts', (content) =>
    content
      .replace("import { BullModule } from '@nestjs/bullmq'\n", '')
      .replace("import { createQueueConfig } from '@src/config/queue.config'\n", '')
      .replace(
        / {4}BullModule\.forRootAsync\(\{[\s\S]*?\}\),\n/,
        '',
      )
      .replace(
        "import { ConfigModule, ConfigService } from '@nestjs/config'\n",
        "import { ConfigModule } from '@nestjs/config'\n",
      ),
  );

  await patchFile(targetDir, 'src/config/index.ts', (content) =>
    content.replace(/\n {2}\/\/ Redis\n {2}redis: \{[\s\S]*?\},\n/, '\n'),
  );

  await patchFile(targetDir, '.env.example', (content) =>
    content
      .replace(/\nREDIS_HOST=.*\n/, '\n')
      .replace(/\nREDIS_PORT=.*\n/, '\n')
      .replace(/\nREDIS_PASSWORD=.*\n/, '\n'),
  );

  const dockerComposePath = path.join(targetDir, 'docker-compose.yml');
  try {
    const content = await fs.readFile(dockerComposePath, 'utf8');
    const withoutRedis = content
      .replace(/\n {2}redis:[\s\S]*?restart: always\n {4}networks:[\s\S]*?- backend\n/, '\n')
      .replace(/\n {2}redis_data:\n/, '\n');
    await fs.writeFile(dockerComposePath, withoutRedis);
  } catch {
    // optional when docker disabled
  }
}

export function getRedisDependencies(enabled) {
  if (enabled) {
    return { add: {}, remove: [] };
  }

  return {
    add: {},
    remove: ['@nestjs/bullmq', 'bullmq'],
  };
}
