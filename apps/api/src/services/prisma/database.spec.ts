import database from '@ghostfolio/prisma/database';

import { resolve } from 'node:path';

const {
  DEFAULT_DATABASE_URL,
  getDatabaseConfiguration,
  hasPostgresEnvironment
} = database;

describe('database configuration', () => {
  const cwd = '/ghostfolio';

  it('defaults to SQLite when PostgreSQL is not configured', () => {
    expect(getDatabaseConfiguration({}, { cwd })).toEqual({
      provider: 'sqlite',
      url: `file:${resolve(cwd, DEFAULT_DATABASE_URL.slice('file:'.length))}`
    });
  });

  it('uses an explicitly configured SQLite database', () => {
    expect(
      getDatabaseConfiguration(
        { DATABASE_URL: 'file:data/ghostfolio.db' },
        { cwd }
      )
    ).toEqual({
      provider: 'sqlite',
      url: `file:${resolve(cwd, 'data/ghostfolio.db')}`
    });
  });

  it('uses an explicitly configured PostgreSQL database', () => {
    const url = 'postgresql://user:password@localhost:5432/ghostfolio';

    expect(getDatabaseConfiguration({ DATABASE_URL: url }, { cwd })).toEqual({
      provider: 'postgresql',
      url
    });
  });

  it('supports PostgreSQL environment variables with a PostgreSQL URL', () => {
    const url = 'postgresql://user:password@localhost:5432/ghostfolio';

    expect(
      getDatabaseConfiguration(
        { DATABASE_URL: url, POSTGRES_DB: 'ghostfolio' },
        { cwd }
      )
    ).toEqual({ provider: 'postgresql', url });
  });

  it('rejects unsupported database URL protocols', () => {
    expect(() => {
      getDatabaseConfiguration({
        DATABASE_URL: 'mysql://localhost/ghostfolio'
      });
    }).toThrow('DATABASE_URL must use the file:, postgres:, or postgresql:');
  });

  it('uses the direct URL for Prisma commands', () => {
    expect(
      getDatabaseConfiguration(
        {
          DATABASE_URL: 'file:data/ghostfolio.db',
          DIRECT_URL: 'file:data/ghostfolio-direct.db'
        },
        { cwd, useDirectUrl: true }
      )
    ).toEqual({
      provider: 'sqlite',
      url: `file:${resolve(cwd, 'data/ghostfolio-direct.db')}`
    });
  });

  it('ignores an empty direct URL', () => {
    expect(
      getDatabaseConfiguration(
        {
          DATABASE_URL: 'file:data/ghostfolio.db',
          DIRECT_URL: ''
        },
        { cwd, useDirectUrl: true }
      )
    ).toEqual({
      provider: 'sqlite',
      url: `file:${resolve(cwd, 'data/ghostfolio.db')}`
    });
  });

  it('rejects a direct URL without a database URL', () => {
    expect(() => {
      getDatabaseConfiguration(
        { DIRECT_URL: 'file:data/ghostfolio-direct.db' },
        { useDirectUrl: true }
      );
    }).toThrow('DIRECT_URL requires DATABASE_URL');
  });

  it('rejects a direct URL for a different database provider', () => {
    expect(() => {
      getDatabaseConfiguration(
        {
          DATABASE_URL: 'file:data/ghostfolio.db',
          DIRECT_URL: 'postgresql://user:password@localhost:5432/ghostfolio'
        },
        { useDirectUrl: true }
      );
    }).toThrow('DIRECT_URL must use the same database provider');
  });

  it('rejects unsupported direct URL protocols', () => {
    expect(() => {
      getDatabaseConfiguration(
        {
          DATABASE_URL: 'postgresql://localhost/ghostfolio',
          DIRECT_URL: 'mysql://localhost/ghostfolio'
        },
        { useDirectUrl: true }
      );
    }).toThrow('DIRECT_URL must use the file:, postgres:, or postgresql:');
  });

  it('rejects SQLite when PostgreSQL variables are configured', () => {
    expect(() => {
      getDatabaseConfiguration({
        DATABASE_URL: 'file:data/ghostfolio.db',
        POSTGRES_DB: 'ghostfolio'
      });
    }).toThrow('POSTGRES_* environment variables must be unset');
  });

  it('requires a URL when PostgreSQL variables are configured', () => {
    expect(() => {
      getDatabaseConfiguration({ POSTGRES_DB: 'ghostfolio' });
    }).toThrow('DATABASE_URL must be set');
  });

  it('ignores empty PostgreSQL variables', () => {
    expect(
      hasPostgresEnvironment({
        POSTGRES_DB: '',
        POSTGRES_PASSWORD: undefined
      })
    ).toBe(false);
  });
});
