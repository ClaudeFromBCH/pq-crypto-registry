import type { ReactNode } from 'react';

interface GlossaryRef {
  term: string;
  slug: string;
}

interface LinkedTextProps {
  text: string;
  glossary: GlossaryRef[];
}

/**
 * Renders a plain text string with known glossary terms automatically
 * linked to /glossary#slug. Longest-match-first to avoid partial matches
 * (e.g. "Module-LWE" matches before "LWE").
 */
export function LinkedText({ text, glossary }: LinkedTextProps) {
  if (glossary.length === 0) return <>{text}</>;

  // Sort by term length descending so longer terms match first
  const sorted = [...glossary].sort((a, b) => b.term.length - a.term.length);

  const pattern = new RegExp(
    `(${sorted.map(g => escapeRegex(g.term)).join('|')})`,
    'g'
  );

  // Key by exact term so terms that differ only by case (e.g. "Module-LWE" vs
  // "MODULE-LWE") do not collide; matching is case-sensitive per glossary spec.
  const termMap = new Map(glossary.map(g => [g.term, g]));

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset lastIndex so the loop is correct on every invocation (global regex
  // state does not carry over between renders or calls).
  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const entry = termMap.get(match[1]);
    if (entry) {
      parts.push(
        <a
          key={`${entry.slug}-${match.index}`}
          href={`/glossary#${entry.slug}`}
          className='underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-foreground transition-colors'
        >
          {match[1]}
        </a>
      );
    } else {
      parts.push(match[1]);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
