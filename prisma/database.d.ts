export type DatabaseProvider = 'postgresql' | 'sqlite';

export interface DatabaseConfiguration {
  provider: DatabaseProvider;
  url: string;
}

export interface DatabaseConfigurationOptions {
  cwd?: string;
  useDirectUrl?: boolean;
}

export interface LoadEnvironmentOptions {
  cwd?: string;
}

export const DEFAULT_DATABASE_URL: string;

export function getDatabaseConfiguration(
  environment?: NodeJS.ProcessEnv,
  options?: DatabaseConfigurationOptions
): DatabaseConfiguration;

export function hasPostgresEnvironment(environment: NodeJS.ProcessEnv): boolean;

export function loadEnvironment(
  environment?: NodeJS.ProcessEnv,
  options?: LoadEnvironmentOptions
): NodeJS.ProcessEnv;

declare const database: {
  DEFAULT_DATABASE_URL: typeof DEFAULT_DATABASE_URL;
  getDatabaseConfiguration: typeof getDatabaseConfiguration;
  hasPostgresEnvironment: typeof hasPostgresEnvironment;
  loadEnvironment: typeof loadEnvironment;
};

export default database;
