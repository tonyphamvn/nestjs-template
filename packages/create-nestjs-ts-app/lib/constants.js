export const DEFAULT_TEMPLATE_REPO = 'tonyphamvn/nestjs-template';
export const DEFAULT_GIGET_TEMPLATE = `github:${DEFAULT_TEMPLATE_REPO}`;

export const EXCLUDE_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'packages',
  '.github',
  '.cursor',
  '.pnpm-store',
  'test-scaffold',
  'logs',
]);

export const EXCLUDE_FILES = new Set([
  '.env',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log',
  '.DS_Store',
]);

export const DATABASE_OPTIONS = ['postgres', 'mysql', 'sqlite'];
export const ORM_OPTIONS = ['mikroorm', 'sequelize', 'prisma', 'typeorm'];
export const PROVIDER_OPTIONS = ['degit', 'giget'];
export const PACKAGE_MANAGER_OPTIONS = ['npm', 'pnpm', 'yarn', 'bun'];
export const DEPLOY_OPTIONS = ['docker', 'pm2', 'none'];
