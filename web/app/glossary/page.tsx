import { getGlossary } from '@/lib/glossary';
import { GlossaryHighlight } from '@/components/glossary-highlight';

export default function GlossaryPage() {
  const entries = getGlossary();

  return (
    <div>
      <GlossaryHighlight />
      <h1 className='mb-2 text-2xl font-semibold tracking-tight'>Glossary</h1>
      <p className='mb-8 text-sm text-muted-foreground'>
        Terms and concepts used across the registry. Linked automatically from
        algorithm pages.
      </p>

      <dl className='space-y-6'>
        {entries.map(entry => (
          <div key={entry.slug} id={entry.slug} className='scroll-mt-20'>
            <dt className='text-sm font-semibold'>{entry.term}</dt>
            <dd className='mt-1 text-sm text-muted-foreground'>
              {entry.definition}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
