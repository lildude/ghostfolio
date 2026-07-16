import database from '@ghostfolio/prisma/database.js';
import { PrismaClient as SQLitePrismaClient } from '@ghostfolio/prisma/generated/sqlite';

import {
  Injectable,
  Logger,
  LogLevel,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient as PostgreSQLPrismaClient } from '@prisma/client';

database.loadEnvironment();

const databaseConfiguration = database.getDatabaseConfiguration();
const PrismaClient =
  databaseConfiguration.provider === 'sqlite'
    ? (SQLitePrismaClient as unknown as typeof PostgreSQLPrismaClient)
    : PostgreSQLPrismaClient;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public readonly databaseProvider = databaseConfiguration.provider;

  private readonly logger = new Logger(PrismaService.name);

  public constructor(configService: ConfigService) {
    const adapter =
      databaseConfiguration.provider === 'sqlite'
        ? new PrismaBetterSqlite3({ url: databaseConfiguration.url })
        : new PrismaPg({ connectionString: databaseConfiguration.url });

    let customLogLevels: LogLevel[];

    try {
      customLogLevels = JSON.parse(
        configService.get<string>('LOG_LEVELS')
      ) as LogLevel[];
    } catch {}

    const log: Prisma.LogDefinition[] =
      customLogLevels?.includes('debug') || customLogLevels?.includes('verbose')
        ? [{ emit: 'stdout', level: 'query' }]
        : [];

    super({
      adapter,
      log,
      errorFormat: 'colorless'
    });
  }

  public async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async onModuleDestroy() {
    await this.$disconnect();
  }
}
