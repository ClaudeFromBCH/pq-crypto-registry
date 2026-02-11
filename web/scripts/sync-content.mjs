/* eslint-disable no-console */
import { cpSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, '../../data');
const dest = resolve(__dirname, '../content');

if (!existsSync(src)) {
  console.error(
    'Error: ../data directory not found. Run from the web/ directory.'
  );
  process.exit(1);
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true });
}

cpSync(src, dest, { recursive: true });
console.log('Synced data/ → web/content/');
