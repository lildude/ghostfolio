const { config } = require('dotenv');
const { expand } = require('dotenv-expand');
const { isAbsolute, resolve } = require('node:path');

const DEFAULT_DATABASE_URL = 'file:db/portfolio.db';

function loadEnvironment(
  environment = process.env,
  { cwd = process.cwd() } = {}
) {
  const dotenvPath = environment.DOTENV_CONFIG_PATH ?? resolve(cwd, '.env');

  expand(
    config({
      path: dotenvPath,
      processEnv: environment,
      quiet: true
    })
  );

  return environment;
}

function hasPostgresEnvironment(environment) {
  return Object.entries(environment).some(([key, value]) => {
    return key.startsWith('POSTGRES_') && value !== undefined && value !== '';
  });
}

function normalizeSqliteUrl(url, cwd) {
  const databasePath = url.slice('file:'.length);

  if (databasePath === ':memory:' || isAbsolute(databasePath)) {
    return url;
  }

  return `file:${resolve(cwd, databasePath)}`;
}

function getDatabaseConfiguration(
  environment = process.env,
  { cwd = process.cwd(), useDirectUrl = false } = {}
) {
  const configuredUrl = environment.DATABASE_URL;
  const postgresEnvironmentIsSet = hasPostgresEnvironment(environment);
  let databaseConfiguration;

  if (!configuredUrl) {
    if (postgresEnvironmentIsSet) {
      throw new Error(
        'DATABASE_URL must be set when POSTGRES_* environment variables are configured.'
      );
    }

    databaseConfiguration = {
      provider: 'sqlite',
      url: normalizeSqliteUrl(DEFAULT_DATABASE_URL, cwd)
    };
  } else if (configuredUrl.startsWith('file:')) {
    if (postgresEnvironmentIsSet) {
      throw new Error(
        'POSTGRES_* environment variables must be unset when using SQLite.'
      );
    }

    databaseConfiguration = {
      provider: 'sqlite',
      url: normalizeSqliteUrl(configuredUrl, cwd)
    };
  } else if (/^postgres(?:ql)?:/.test(configuredUrl)) {
    databaseConfiguration = {
      provider: 'postgresql',
      url: configuredUrl
    };
  } else {
    throw new Error(
      'DATABASE_URL must use the file:, postgres:, or postgresql: protocol.'
    );
  }

  if (useDirectUrl && environment.DIRECT_URL) {
    if (!configuredUrl) {
      throw new Error('DIRECT_URL requires DATABASE_URL to be set.');
    }

    const directUrlIsSQLite = environment.DIRECT_URL.startsWith('file:');
    const directUrlIsPostgreSQL = /^postgres(?:ql)?:/.test(
      environment.DIRECT_URL
    );

    if (!directUrlIsSQLite && !directUrlIsPostgreSQL) {
      throw new Error(
        'DIRECT_URL must use the file:, postgres:, or postgresql: protocol.'
      );
    }

    if (directUrlIsSQLite !== (databaseConfiguration.provider === 'sqlite')) {
      throw new Error(
        'DIRECT_URL must use the same database provider as DATABASE_URL.'
      );
    }

    databaseConfiguration.url = directUrlIsSQLite
      ? normalizeSqliteUrl(environment.DIRECT_URL, cwd)
      : environment.DIRECT_URL;
  }

  return databaseConfiguration;
}

module.exports = {
  DEFAULT_DATABASE_URL,
  getDatabaseConfiguration,
  hasPostgresEnvironment,
  loadEnvironment
};
