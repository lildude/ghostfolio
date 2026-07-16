import type { PrismaService as PrismaServiceType } from '@ghostfolio/api/services/prisma/prisma.service';

import { ConfigService } from '@nestjs/config';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('PrismaService with SQLite', () => {
  const databaseEnvironment = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => {
      return (
        key === 'DATABASE_URL' ||
        key === 'DIRECT_URL' ||
        key === 'DOTENV_CONFIG_PATH' ||
        key.startsWith('POSTGRES_')
      );
    })
  );
  let databaseDirectory: string;
  let databasePath: string;
  let prismaService: PrismaServiceType;

  beforeAll(async () => {
    databaseDirectory = mkdtempSync(join(tmpdir(), 'ghostfolio-prisma-'));
    databasePath = join(databaseDirectory, 'portfolio.db');

    for (const key of Object.keys(process.env)) {
      if (key.startsWith('POSTGRES_')) {
        delete process.env[key];
      }
    }

    process.env.DATABASE_URL = `file:${databasePath}`;
    process.env.DOTENV_CONFIG_PATH = '/dev/null';
    delete process.env.DIRECT_URL;

    const { PrismaService } =
      await import('@ghostfolio/api/services/prisma/prisma.service');

    prismaService = new PrismaService(new ConfigService());
    await prismaService.$connect();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    rmSync(databaseDirectory, { recursive: true });

    for (const key of Object.keys(process.env)) {
      if (
        key === 'DATABASE_URL' ||
        key === 'DIRECT_URL' ||
        key === 'DOTENV_CONFIG_PATH' ||
        key.startsWith('POSTGRES_')
      ) {
        delete process.env[key];
      }
    }

    Object.assign(process.env, databaseEnvironment);
  });

  it('selects the SQLite client and adapter', async () => {
    expect(prismaService.databaseProvider).toBe('sqlite');
    expect(existsSync(databasePath)).toBe(true);
    await expect(
      prismaService.$queryRawUnsafe('SELECT 1')
    ).resolves.toHaveLength(1);
  });
});
