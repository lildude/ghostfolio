import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as PostgreSQLPrismaClient } from '@prisma/client';

import database from './database.js';
import { PrismaClient as SQLitePrismaClient } from './generated/sqlite/index.js';

database.loadEnvironment();

const databaseConfiguration = database.getDatabaseConfiguration(process.env, {
  useDirectUrl: true
});
const PrismaClient =
  databaseConfiguration.provider === 'sqlite'
    ? (SQLitePrismaClient as unknown as typeof PostgreSQLPrismaClient)
    : PostgreSQLPrismaClient;
const adapter =
  databaseConfiguration.provider === 'sqlite'
    ? new PrismaBetterSqlite3({ url: databaseConfiguration.url })
    : new PrismaPg({ connectionString: databaseConfiguration.url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tags = [
    {
      id: '4452656d-9fa4-4bd0-ba38-70492e31d180',
      name: 'EMERGENCY_FUND'
    },
    {
      id: 'f2e868af-8333-459f-b161-cbc6544c24bd',
      name: 'EXCLUDE_FROM_ANALYSIS'
    }
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      create: tag,
      update: {},
      where: { id: tag.id }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
