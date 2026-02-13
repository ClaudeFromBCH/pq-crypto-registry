import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

export interface GlossaryEntry {
  term: string;
  slug: string;
  definition: string;
}

const GLOSSARY_PATH = path.join(process.cwd(), 'content', 'glossary.yaml');

export function getGlossary(): GlossaryEntry[] {
  if (!fs.existsSync(GLOSSARY_PATH)) return [];
  const raw = fs.readFileSync(GLOSSARY_PATH, 'utf-8');
  return parseYaml(raw) as GlossaryEntry[];
}
