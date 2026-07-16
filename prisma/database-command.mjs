import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

import database from './database.js';

const { getDatabaseConfiguration } = database;
const command = process.argv[2];

database.loadEnvironment();

const databaseConfiguration = getDatabaseConfiguration(process.env, {
  useDirectUrl: true
});

let prismaArguments;

switch (command) {
  case 'migrate':
    prismaArguments = ['migrate', 'deploy'];
    break;
  case 'push':
    prismaArguments = ['db', 'push'];
    break;
  case 'setup':
    prismaArguments =
      databaseConfiguration.provider === 'sqlite'
        ? ['migrate', 'deploy']
        : ['db', 'push'];
    break;
  default:
    throw new Error(`Unsupported database command: ${command}`);
}

if (databaseConfiguration.provider === 'sqlite') {
  await import('./generate-sqlite-schema.mjs');

  const databasePath = databaseConfiguration.url.slice('file:'.length);

  if (databasePath !== ':memory:') {
    mkdirSync(dirname(databasePath), { recursive: true });
  }
}

const require = createRequire(import.meta.url);
const result = spawnSync(
  process.execPath,
  [require.resolve('prisma/build/index.js'), ...prismaArguments],
  { stdio: 'inherit' }
);

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
