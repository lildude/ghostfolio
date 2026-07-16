import { AccessService } from '@ghostfolio/api/app/access/access.service';
import { DataProviderService } from '@ghostfolio/api/services/data-provider/data-provider.service';
import { MarketDataService } from '@ghostfolio/api/services/market-data/market-data.service';
import { PrismaService } from '@ghostfolio/api/services/prisma/prisma.service';
import {
  DATE_FORMAT,
  getAssetProfileIdentifier
} from '@ghostfolio/common/helper';
import {
  AccessPermission,
  DataSource,
  MarketDataState,
  PrismaClient
} from '@ghostfolio/prisma/generated/sqlite';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { format } from 'date-fns';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('SQLite integration', () => {
  let accessService: AccessService;
  let databaseDirectory: string;
  let dataProviderService: DataProviderService;
  let marketDataService: MarketDataService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    databaseDirectory = mkdtempSync(join(tmpdir(), 'ghostfolio-sqlite-'));
    const databaseUrl = `file:${join(databaseDirectory, 'portfolio.db')}`;
    const migrationAdapterFactory = new PrismaBetterSqlite3({
      url: databaseUrl
    });
    const migrationAdapter = await migrationAdapterFactory.connect();

    await migrationAdapter.executeScript(
      readFileSync(
        join(
          process.cwd(),
          'prisma',
          'migrations-sqlite',
          '20260715000000_initial_sqlite',
          'migration.sql'
        ),
        'utf8'
      )
    );
    await migrationAdapter.dispose();

    prisma = new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url: databaseUrl })
    });

    Object.defineProperty(prisma, 'databaseProvider', { value: 'sqlite' });

    const prismaService = prisma as unknown as PrismaService;

    accessService = new AccessService(prismaService);
    marketDataService = new MarketDataService(prismaService);
    dataProviderService = new DataProviderService(
      undefined,
      [],
      marketDataService,
      prismaService,
      undefined,
      undefined
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
    rmSync(databaseDirectory, { recursive: true });
  });

  it('stores access permissions as JSON arrays', async () => {
    const user = await prisma.user.create({ data: {} });
    const access = await accessService.createAccess({
      user: { connect: { id: user.id } }
    });

    expect(access.permissions).toEqual([AccessPermission.READ_RESTRICTED]);
    expect(access.settings).toEqual({});
  });

  it('removes duplicate market data before inserting', async () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    await marketDataService.replaceForSymbol({
      data: [
        { date, marketPrice: 100, state: MarketDataState.CLOSE },
        { date, marketPrice: 101, state: MarketDataState.CLOSE }
      ],
      dataSource: DataSource.YAHOO,
      symbol: 'AAPL'
    });

    await expect(prisma.marketData.findMany()).resolves.toEqual([
      expect.objectContaining({ date, marketPrice: 100 })
    ]);
  });

  it.each([
    {
      expectedDates: ['2024-01-02', '2024-02-01'],
      from: new Date('2024-01-02T00:00:00.000Z'),
      granularity: 'day' as const,
      to: new Date('2024-02-01T00:00:00.000Z')
    },
    {
      expectedDates: ['2024-01-01', '2024-02-01'],
      from: new Date('2024-01-01T00:00:00.000Z'),
      granularity: 'month' as const,
      to: new Date('2024-02-02T00:00:00.000Z')
    }
  ])(
    'queries $granularity historical data',
    async ({ expectedDates, from, granularity, to }) => {
      await prisma.marketData.deleteMany();
      await prisma.marketData.createMany({
        data: [
          ['2024-01-01T00:00:00.000Z', 100],
          ['2024-01-02T00:00:00.000Z', 101],
          ['2024-02-01T00:00:00.000Z', 102],
          ['2024-02-02T00:00:00.000Z', 103]
        ].map(([date, marketPrice], index) => ({
          createdAt: new Date(),
          dataSource: DataSource.YAHOO,
          date: new Date(date as string),
          id: `market-data-${index}`,
          marketPrice: marketPrice as number,
          state: MarketDataState.CLOSE,
          symbol: 'AAPL'
        }))
      });

      const response = await dataProviderService.getHistorical(
        [{ dataSource: DataSource.YAHOO, symbol: 'AAPL' }],
        granularity,
        from,
        to
      );
      const historicalData =
        response[
          getAssetProfileIdentifier({
            dataSource: DataSource.YAHOO,
            symbol: 'AAPL'
          })
        ];

      expect(Object.keys(historicalData)).toEqual(expectedDates);
      expect(
        Object.keys(historicalData).every((date) => {
          return date === format(new Date(date), DATE_FORMAT);
        })
      ).toBe(true);
    }
  );
});
