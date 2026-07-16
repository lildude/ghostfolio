import { defineConfig } from '@prisma/config';
import { join } from 'node:path';

import database from '../prisma/database.js';

database.loadEnvironment();

const databaseConfiguration = database.getDatabaseConfiguration(process.env, {
  useDirectUrl: true
});

export default defineConfig({
  datasource: {
    url: databaseConfiguration.url
  },
  migrations: {
    path: join(
      __dirname,
      '..',
      'prisma',
      databaseConfiguration.provider === 'sqlite'
        ? 'migrations-sqlite'
        : 'migrations'
    ),
    seed: `node ${join(__dirname, '..', 'prisma', 'seed.mts')}`
  },
  schema: join(
    __dirname,
    '..',
    'prisma',
    databaseConfiguration.provider === 'sqlite'
      ? 'schema.sqlite.prisma'
      : 'schema.prisma'
  )
});
