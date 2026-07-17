import fs from 'node:fs/promises';
import path from 'node:path';
import { removeDockerFeature, removeDockerfileOnly } from './docker.js';

const ECOSYSTEM_CONFIG = `module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
`;

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function removePm2Artifacts(targetDir) {
  await removeIfExists(path.join(targetDir, 'ecosystem.config.js'));
  await removeIfExists(path.join(targetDir, 'ecosystem.config.cjs'));
}

async function writePm2Artifacts(targetDir) {
  await fs.writeFile(path.join(targetDir, 'ecosystem.config.js'), ECOSYSTEM_CONFIG);
}

/**
 * deploy:
 * - docker: Dockerfile + compose, no PM2
 * - pm2: PM2 + compose (DB/Redis infra), no Dockerfile
 * - none: plain node, no Docker files, no PM2
 */
export async function applyDeployFeature(targetDir, deploy) {
  if (deploy === 'docker') {
    await removePm2Artifacts(targetDir);
    return;
  }

  if (deploy === 'pm2') {
    await removeDockerfileOnly(targetDir);
    await writePm2Artifacts(targetDir);
    return;
  }

  await removeDockerFeature(targetDir);
  await removePm2Artifacts(targetDir);
}

export function getDeployDependencies(deploy) {
  if (deploy === 'pm2') {
    return {
      add: {
        pm2: '^7.0.3',
      },
      remove: [],
    };
  }

  return {
    add: {},
    remove: ['pm2'],
  };
}

export function getDeployScripts(deploy) {
  if (deploy === 'pm2') {
    return {
      start: 'pm2-runtime start ecosystem.config.js',
      'pm2:delete': 'pm2 delete all || true',
      'pm2:dev':
        'npm run build && npm run pm2:delete && pm2 start ecosystem.config.js --env development',
      'pm2:prod':
        'npm run build && npm run pm2:delete && pm2 start ecosystem.config.js --env production',
    };
  }

  return {
    start: 'node dist/src/main',
    'pm2:delete': undefined,
    'pm2:dev': undefined,
    'pm2:prod': undefined,
  };
}
