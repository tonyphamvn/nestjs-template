#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import { DEFAULT_GIGET_TEMPLATE, DEFAULT_TEMPLATE_REPO } from '../lib/constants.js';
import {
  assertTargetIsEmpty,
  assertValidProjectName,
  copyLocalTemplate,
} from '../lib/copy-template.js';
import { downloadProjectTemplate } from '../lib/download-template.js';
import { collectProjectOptions } from '../lib/prompts.js';
import { postProcessProject } from '../lib/post-process.js';
import { installDependencies } from '../lib/install.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_OPTIONS = {
  local: false,
  template: DEFAULT_TEMPLATE_REPO,
  provider: 'degit',
  orm: 'mikroorm',
  database: 'postgres',
  jwt: true,
  deploy: 'docker',
  redis: false,
  git: true,
  packageManager: 'npm',
  yes: false,
  help: false,
};

const DEPLOY_VALUES = new Set(['docker', 'pm2', 'none']);
const ORM_VALUES = new Set(['mikroorm', 'sequelize', 'prisma', 'typeorm']);
const DATABASE_VALUES = new Set(['postgres', 'mysql', 'sqlite']);

function parseArgs(argv) {
  const options = { ...DEFAULT_OPTIONS };
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--yes' || arg === '-y') {
      options.yes = true;
    } else if (arg === '--local') {
      options.local = true;
    } else if (arg === '--git') {
      options.git = true;
    } else if (arg === '--no-git') {
      options.git = false;
    } else if (arg === '--jwt') {
      options.jwt = true;
    } else if (arg === '--no-jwt') {
      options.jwt = false;
    } else if (arg === '--deploy') {
      const value = argv[index + 1];
      if (!DEPLOY_VALUES.has(value)) {
        throw new Error(`Invalid --deploy value: ${value}. Use docker | pm2 | none`);
      }
      options.deploy = value;
      index += 1;
    } else if (arg === '--docker') {
      options.deploy = 'docker';
    } else if (arg === '--no-docker') {
      options.deploy = 'none';
    } else if (arg === '--pm2') {
      options.deploy = 'pm2';
    } else if (arg === '--redis') {
      options.redis = true;
    } else if (arg === '--no-redis') {
      options.redis = false;
    } else if (arg === '--template') {
      options.template = argv[index + 1];
      index += 1;
    } else if (arg === '--provider') {
      options.provider = argv[index + 1];
      index += 1;
    } else if (arg === '--orm') {
      const value = argv[index + 1];
      if (!ORM_VALUES.has(value)) {
        throw new Error(
          `Invalid --orm value: ${value}. Use mikroorm | sequelize | prisma | typeorm`,
        );
      }
      options.orm = value;
      index += 1;
    } else if (arg === '--database') {
      const value = argv[index + 1];
      if (!DATABASE_VALUES.has(value)) {
        throw new Error(`Invalid --database value: ${value}. Use postgres | mysql | sqlite`);
      }
      options.database = value;
      index += 1;
    } else if (arg === '--package-manager') {
      options.packageManager = argv[index + 1];
      index += 1;
    } else {
      positionals.push(arg);
    }
  }

  return { options, projectName: positionals[0] };
}

function printHelp() {
  console.log(`
Usage:
  npx create-nestjs-ts-app [project-name] [options]

Options:
  --yes, -y                 Use defaults (non-interactive)
  --orm <name>              mikroorm | sequelize | prisma | typeorm (default: mikroorm)
  --database <type>         postgres | mysql | sqlite (default: postgres)
  --jwt / --no-jwt          Include auth module scaffold
  --deploy <mode>           docker | pm2 | none (default: docker)
  --docker / --no-docker    Alias for --deploy docker / --deploy none
  --pm2                     Alias for --deploy pm2
  --redis / --no-redis      Include Redis + BullMQ queues
  --git / --no-git          Initialize git repository
  --package-manager <pm>    npm | pnpm | yarn | bun
  --provider <name>         degit | giget
  --template <source>       Template source (default: ${DEFAULT_TEMPLATE_REPO})
  --local                   Copy template from local repo (development)
  -h, --help                Show help

Examples:
  npx create-nestjs-ts-app
  npx create-nestjs-ts-app my-api --yes
  npx create-nestjs-ts-app my-api --yes --orm typeorm --database mysql
  npx create-nestjs-ts-app my-api --yes --orm prisma --deploy pm2 --redis
  npx create-nestjs-ts-app my-api --yes --orm sequelize --no-jwt --deploy none
  node packages/create-nestjs-ts-app/bin/create-nestjs-ts-app.js my-api --local --yes
`);
}

function printNextSteps(projectName, options) {
  const runCommand = {
    npm: 'npm run',
    pnpm: 'pnpm',
    yarn: 'yarn',
    bun: 'bun run',
  }[options.packageManager];

  const lines = ['', '🚀 Next steps:', `  cd ${projectName}`];
  const hasCompose = options.deploy === 'docker' || options.deploy === 'pm2';

  if (hasCompose && options.database !== 'sqlite') {
    lines.push('  docker compose up -d');
  }

  if (options.orm === 'prisma') {
    lines.push(`  ${runCommand.includes('npm') ? 'npx' : options.packageManager} prisma generate`);
  }

  lines.push(`  ${runCommand} db:up`, `  ${runCommand} start:dev`, '');

  if (options.deploy === 'pm2') {
    lines.push('Production (PM2):', `  ${runCommand} build`, `  ${runCommand} start`, '');
  } else if (options.deploy === 'docker') {
    lines.push(
      'Production (Docker):',
      '  docker build -t api .',
      '  docker run --env-file .env -p 8000:8000 api',
      '',
    );
  }

  console.log(lines.join('\n'));
}

function buildNonInteractiveOptions(argvOptions, argvProjectName) {
  const deploy = argvOptions.deploy || 'docker';

  return {
    projectName: argvProjectName,
    orm: argvOptions.orm,
    database: argvOptions.database,
    jwt: argvOptions.jwt,
    deploy,
    docker: deploy === 'docker',
    redis: argvOptions.redis,
    git: argvOptions.git,
    packageManager: argvOptions.packageManager,
    provider: argvOptions.provider,
    template:
      argvOptions.provider === 'giget' && !argvOptions.template.startsWith('github:')
        ? DEFAULT_GIGET_TEMPLATE
        : argvOptions.template,
    local: argvOptions.local,
  };
}

async function main() {
  const { options: argvOptions, projectName: argvProjectName } = parseArgs(process.argv.slice(2));

  if (argvOptions.help) {
    printHelp();
    return;
  }

  const shouldPrompt = !argvOptions.yes || !argvProjectName;
  const options = shouldPrompt
    ? await collectProjectOptions({ ...argvOptions, projectName: argvProjectName })
    : buildNonInteractiveOptions(argvOptions, argvProjectName);

  await assertValidProjectName(options.projectName);

  const targetDir = path.resolve(process.cwd(), options.projectName);
  await assertTargetIsEmpty(targetDir);

  const s = p.spinner();
  s.start('Setting up');

  try {
    await fs.mkdir(targetDir, { recursive: true });

    if (options.local) {
      const templateRoot = path.resolve(__dirname, '../../..');
      await copyLocalTemplate(templateRoot, targetDir);
    } else {
      await downloadProjectTemplate({
        provider: options.provider,
        template: options.template,
        targetDir,
        local: false,
      });
    }

    await postProcessProject(targetDir, options);

    s.message(`Installing dependencies via ${options.packageManager}`);
    await installDependencies(targetDir, options.packageManager);

    s.stop(`🎉 Done. Created ${options.projectName} project.`);
  } catch (error) {
    s.stop('Setup failed', 1);
    throw error;
  }

  process.once('beforeExit', () => {
    printNextSteps(options.projectName, options);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
