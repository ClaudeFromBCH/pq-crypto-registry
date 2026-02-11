import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkedText } from '@/components/linked-text';
import { getGlossary } from '@/lib/glossary';

const riskCategories = [
  {
    title: 'Assumption Risk',
    description:
      'Confidence in the underlying mathematical hardness assumption.',
    levels: [
      {
        level: 'Low',
        definition:
          'Well-studied assumption with decades of scrutiny and no known sub-exponential attacks (classical or quantum). Examples: Module-LWE at standard parameters.'
      },
      {
        level: 'Medium',
        definition:
          'Assumption is broadly believed to hold, but has less cryptanalytic history or relies on structured variants that narrow the safety margin.'
      },
      {
        level: 'High',
        definition:
          'Assumption is novel, has limited independent analysis, or recent results have weakened confidence in related problems.'
      }
    ]
  },
  {
    title: 'Implementation Risk',
    description:
      'Difficulty of producing a correct, standards-conformant implementation.',
    levels: [
      {
        level: 'Low',
        definition:
          'Straightforward to implement correctly. Reference code is mature, few edge cases, and misuse-resistant API design.'
      },
      {
        level: 'Medium',
        definition:
          'Requires careful attention to parameter encoding, rejection sampling, or key validation. Subtle bugs have appeared in early implementations.'
      },
      {
        level: 'High',
        definition:
          'Complex state management, fragile failure modes, or a history of implementation-level vulnerabilities across multiple libraries.'
      }
    ]
  },
  {
    title: 'Side-Channel Risk',
    description:
      'Susceptibility to timing, power, or electromagnetic side-channel attacks.',
    levels: [
      {
        level: 'Low',
        definition:
          'Core operations are naturally constant-time or trivially hardened. No known exploitable leakage in standard deployment models.'
      },
      {
        level: 'Medium',
        definition:
          'Constant-time implementation is achievable but requires explicit effort (e.g., masked arithmetic, constant-time rejection sampling). Non-hardened code is vulnerable.'
      },
      {
        level: 'High',
        definition:
          'Inherent algorithmic features (e.g., variable-weight operations, secret-dependent branching) make side-channel resistance difficult even for expert implementers.'
      }
    ]
  }
];

export default function MethodologyPage() {
  const glossary = getGlossary();

  return (
    <div>
      <h1 className='mb-2 text-2xl font-semibold tracking-tight'>
        Methodology
      </h1>
      <p className='mb-8 text-sm text-muted-foreground'>
        Risk assessments use a conservative three-tier scale. Definitions are
        intentionally narrow to avoid ambiguity.
      </p>

      <div className='space-y-6'>
        {riskCategories.map(category => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className='text-base'>{category.title}</CardTitle>
              <p className='text-sm text-muted-foreground'>
                {category.description}
              </p>
            </CardHeader>
            <CardContent>
              <dl className='space-y-4'>
                {category.levels.map(item => (
                  <div key={item.level}>
                    <dt className='text-sm font-medium'>{item.level}</dt>
                    <dd className='mt-0.5 text-sm text-muted-foreground'>
                      <LinkedText text={item.definition} glossary={glossary} />
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
