import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Algorithm } from './schema';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'algorithms');

export function getAllAlgorithms(): Algorithm[] {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.yaml'));

  return files.map(file => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    // Validation is handled by scripts/validate-content.ts before build.
    return parseYaml(raw) as Algorithm;
  });
}

export function getAlgorithm(id: string): Algorithm | undefined {
  return getAllAlgorithms().find(a => a.id === id);
}

/**
 * Returns MDX source for an algorithm. Resolves path safely to prevent
 * path traversal (e.g. id containing ".." or path separators).
 */
export function getAlgorithmMdx(id: string): string {
  // Explicitly reject path traversal and path separators in id
  if (id.includes('..') || id.includes(path.sep)) {
    return '';
  }
  const base = path.resolve(CONTENT_DIR);
  const mdxPath = path.resolve(base, `${id}.mdx`);
  // Resolved path must be exactly base or under base (base + sep + segment)
  const baseWithSep = base + path.sep;
  if (mdxPath !== base && !mdxPath.startsWith(baseWithSep)) {
    return '';
  }
  if (!fs.existsSync(mdxPath)) {
    return '';
  }
  return fs.readFileSync(mdxPath, 'utf-8');
}
