import fs from 'node:fs/promises';
import path from 'node:path';

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function patchFile(targetDir, relativePath, replacer) {
  const filePath = path.join(targetDir, relativePath);
  const content = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, replacer(content));
}

export async function removeAuthFeature(targetDir) {
  await removeIfExists(path.join(targetDir, 'src/modules/auth'));

  await patchFile(targetDir, 'src/app.module.ts', (content) =>
    content
      .replace("import { AuthModule } from './modules/auth/auth.module'\n", '')
      .replace(/ {4}AuthModule,\n/, ''),
  );
}

export function getAuthDependencies(enabled) {
  if (enabled) {
    return { add: {}, remove: [] };
  }

  return {
    add: {},
    remove: [],
  };
}
