import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeEnvFile(targetDir, options) {
  const envExamplePath = path.join(targetDir, '.env.example');
  const envPath = path.join(targetDir, '.env');
  let content = await fs.readFile(envExamplePath, 'utf8');

  if (!options.redis) {
    content = content
      .replace(/\nREDIS_HOST=.*\n/, '\n')
      .replace(/\nREDIS_PORT=.*\n/, '\n')
      .replace(/\nREDIS_PASSWORD=.*\n/, '\n');
  }

  await fs.writeFile(envExamplePath, content);
  await fs.writeFile(envPath, content);
}
