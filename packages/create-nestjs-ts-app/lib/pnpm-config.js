import fs from 'node:fs/promises';
import path from 'node:path';

export async function writePnpmWorkspaceConfig(targetDir) {
  const workspacePath = path.join(targetDir, 'pnpm-workspace.yaml');
  const lines = [
    '# pnpm 11+ settings live here, not in package.json',
    'allowBuilds:',
    '  "unrs-resolver": true',
    '',
  ];

  await fs.writeFile(workspacePath, lines.join('\n'));
}
