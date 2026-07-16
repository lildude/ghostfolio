import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const prismaDirectory = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(prismaDirectory, 'schema.prisma');
const sqliteSchemaPath = join(prismaDirectory, 'schema.sqlite.prisma');

const postgresSchema = await readFile(schemaPath, 'utf8');
const sqliteSchema = postgresSchema
  .replace(
    /generator client \{[\s\S]*?\n\}/,
    `generator client {
  provider = "prisma-client-js"
  output   = "./generated/sqlite"
}`
  )
  .replace('provider = "postgresql"', 'provider = "sqlite"')
  .replace(
    'permissions   AccessPermission[] @default([READ_RESTRICTED])',
    'permissions   Json'
  )
  .replaceAll(' @default("{}")', '')
  .replaceAll(' @default("[]")', '');

const incompatibleSQLiteSchemaPatterns = [
  'provider = "postgresql"',
  'permissions   AccessPermission[]',
  '@default("{}")',
  '@default("[]")'
];

if (
  sqliteSchema === postgresSchema ||
  incompatibleSQLiteSchemaPatterns.some((pattern) => {
    return sqliteSchema.includes(pattern);
  })
) {
  throw new Error('Could not generate a compatible SQLite Prisma schema.');
}

await writeFile(sqliteSchemaPath, sqliteSchema);
