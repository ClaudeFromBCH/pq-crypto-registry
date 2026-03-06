import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Algorithm } from './schema';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'algorithms');

/** Maps algorithm id → YAML/MDX filename stem (without extension). */
const idToFileStem = new Map<string, string>();

export function getAllAlgorithms(): Algorithm[] {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.yaml'));

  return files.map(file => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const algo = parseYaml(raw) as Algorithm;
    idToFileStem.set(algo.id, path.basename(file, '.yaml'));
    return algo;
  });
}

export function getAlgorithm(id: string): Algorithm | undefined {
  return getAllAlgorithms().find(a => a.id === id);
}

/**
 * Returns MDX source for an algorithm. Uses the YAML filename stem
 * (not the algorithm id) to locate the corresponding .mdx file.
 * Resolves path safely to prevent path traversal.
 */
export function getAlgorithmMdx(id: string): string {
  const stem = idToFileStem.get(id);
  if (!stem) return '';

  if (stem.includes('..') || stem.includes(path.sep)) {
    return '';
  }
  const base = path.resolve(CONTENT_DIR);
  const mdxPath = path.resolve(base, `${stem}.mdx`);
  const baseWithSep = base + path.sep;
  if (mdxPath !== base && !mdxPath.startsWith(baseWithSep)) {
    return '';
  }
  if (!fs.existsSync(mdxPath)) {
    return '';
  }
  return fs.readFileSync(mdxPath, 'utf-8');
}
