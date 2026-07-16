import { copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const prismaDirectory = dirname(fileURLToPath(import.meta.url));

await copyFile(
  join(
    prismaDirectory,
    '..',
    'node_modules',
    '@prisma',
    'client',
    'runtime',
    'client.js.map'
  ),
  join(prismaDirectory, 'generated', 'sqlite', 'runtime', 'client.js.map')
);
