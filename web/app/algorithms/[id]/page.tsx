import { notFound } from 'next/navigation';
import {
  getAllAlgorithms,
  getAlgorithm,
  getAlgorithmMdx
} from '@/lib/algorithms';
import { getGlossary } from '@/lib/glossary';
import { getMdxComponent } from '@/lib/mdx';
import {
  getSizeColumns,
  getRelativeLabels,
  getBenchmarkColumns
} from '@/lib/display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/risk-badge';
import { LinkedText } from '@/components/linked-text';
import { ExternalLink } from 'lucide-react';

export function generateStaticParams() {
  const algorithms = getAllAlgorithms();
  return algorithms.map(a => ({ id: a.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AlgorithmPage({ params }: Props) {
  const { id } = await params;
  const algo = getAlgorithm(id);
  if (!algo) notFound();

  const glossary = getGlossary();
  const mdxSource = getAlgorithmMdx(id);
  const MdxBody = mdxSource ? await getMdxComponent(mdxSource) : null;

  const sizeCols = getSizeColumns(algo);
  const relativeLabels = getRelativeLabels(algo);
  const benchmarkCols = getBenchmarkColumns(algo);

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className='mb-6'>
        <div className='flex items-center gap-2.5'>
          <h1 className='text-2xl font-semibold tracking-tight'>{algo.name}</h1>
          <Badge variant='secondary'>{algo.primitive}</Badge>
        </div>
      </div>

      {/* ── Standardization ────────────────────────────────────────── */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-base'>Standardization</CardTitle>
        </CardHeader>
        <CardContent>
          {algo.standardization ? (
            <dl className='grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3'>
              <div>
                <dt className='text-muted-foreground'>Body</dt>
                <dd className='mt-0.5 font-medium'>
                  <LinkedText
                    text={algo.standardization.body}
                    glossary={glossary}
                  />
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>Reference</dt>
                <dd className='mt-0.5 font-medium'>
                  <LinkedText
                    text={algo.standardization.reference}
                    glossary={glossary}
                  />
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>Status</dt>
                <dd className='mt-0.5 font-medium capitalize'>
                  {algo.standardization.status}
                </dd>
              </div>
            </dl>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Not yet standardized by any formal body.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Security Properties ────────────────────────────────────── */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-base'>Security Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3'>
            <div>
              <dt className='text-muted-foreground'>Hardness Assumption</dt>
              <dd className='mt-0.5 font-medium'>
                <LinkedText
                  text={algo.security.assumption}
                  glossary={glossary}
                />
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Security Notion</dt>
              <dd className='mt-0.5 font-medium'>
                <LinkedText
                  text={algo.security.security_notion}
                  glossary={glossary}
                />
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Deterministic</dt>
              <dd className='mt-0.5 font-medium'>
                {algo.security.deterministic ? 'Yes' : 'No'}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Statefulness</dt>
              <dd className='mt-0.5 font-medium capitalize'>
                <LinkedText
                  text={algo.security.statefulness}
                  glossary={glossary}
                />
              </dd>
            </div>
          </dl>

          <div className='mt-4'>
            <p className='mb-2 text-sm text-muted-foreground'>Tags</p>
            <div className='flex flex-wrap gap-1.5'>
              {algo.tags.map(t => (
                <Badge key={t} variant='secondary'>
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Parameter Sets & Sizes ─────────────────────────────────── */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-base'>Parameter Sets & Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border text-muted-foreground'>
                  <th className='pb-2 pr-6 text-left font-medium'>Name</th>
                  <th className='pb-2 pr-6 text-left font-medium'>
                    NIST Level
                  </th>
                  {sizeCols.map(col => (
                    <th
                      key={col.key}
                      className='pb-2 pr-6 text-right font-medium'
                    >
                      {col.label} (bytes)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {algo.parameter_sets.map(ps => (
                  <tr
                    key={ps.name}
                    className='border-b border-border/50 last:border-0'
                  >
                    <td className='py-2 pr-6 font-medium'>{ps.name}</td>
                    <td className='py-2 pr-6 text-muted-foreground'>
                      {ps.nist_level}
                    </td>
                    {sizeCols.map(col => (
                      <td
                        key={col.key}
                        className='py-2 pr-6 text-right tabular-nums'
                      >
                        {(ps.sizes as Record<string, number>)[
                          col.key
                        ]?.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Performance ────────────────────────────────────────────── */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-base'>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <p className='mb-2 text-sm text-muted-foreground'>Relative Speed</p>
            <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
              {relativeLabels.map(rl => (
                <div key={rl.key} className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>{rl.label}</span>
                  <span className='font-medium capitalize'>
                    {
                      (algo.performance.relative as Record<string, string>)[
                        rl.key
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          {algo.performance.benchmarks ? (
            <div>
              <p className='mb-1 text-sm text-muted-foreground'>
                Benchmarks ({algo.performance.benchmarks.source})
              </p>
              <p className='mb-3 text-xs text-muted-foreground'>
                {algo.performance.benchmarks.platform} &middot; times in
                microseconds
              </p>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border text-muted-foreground'>
                      <th className='pb-2 pr-6 text-left font-medium'>
                        Params
                      </th>
                      {benchmarkCols.map(col => (
                        <th
                          key={col.key}
                          className='pb-2 pr-6 text-right font-medium'
                        >
                          {col.label} (&micro;s)
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {algo.performance.benchmarks.entries.map(entry => (
                      <tr
                        key={entry.parameter_set}
                        className='border-b border-border/50 last:border-0'
                      >
                        <td className='py-2 pr-6 font-medium'>
                          {entry.parameter_set}
                        </td>
                        {benchmarkCols.map(col => (
                          <td
                            key={col.key}
                            className='py-2 pr-6 text-right tabular-nums'
                          >
                            {(entry as Record<string, string | number>)[
                              col.key
                            ]?.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No benchmarks yet.</p>
          )}
        </CardContent>
      </Card>

      {/* ── Risk Assessment ────────────────────────────────────────── */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-base'>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            <RiskBadge level={algo.risk.assumption} label='Assumption' />
            <RiskBadge
              level={algo.risk.implementation}
              label='Implementation'
            />
            <RiskBadge level={algo.risk.side_channel} label='Side-channel' />
          </div>
        </CardContent>
      </Card>

      {/* ── Capabilities ───────────────────────────────────────────── */}
      {algo.capabilities.length > 0 && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-base'>Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-1.5'>
              {algo.capabilities.map(cap => (
                <Badge key={cap} variant='secondary'>
                  {cap}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Implementations ────────────────────────────────────────── */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='text-base'>Implementations</CardTitle>
        </CardHeader>
        <CardContent>
          {algo.implementations.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border text-muted-foreground'>
                    <th className='pb-2 pr-6 text-left font-medium'>Name</th>
                    <th className='pb-2 pr-6 text-left font-medium'>
                      Language
                    </th>
                    <th className='pb-2 pr-6 text-left font-medium'>Audited</th>
                    <th className='pb-2 text-right font-medium'>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {algo.implementations.map(impl => (
                    <tr
                      key={impl.name}
                      className='border-b border-border/50 last:border-0'
                    >
                      <td className='py-2 pr-6 font-medium'>{impl.name}</td>
                      <td className='py-2 pr-6 text-muted-foreground'>
                        {impl.language}
                      </td>
                      <td className='py-2 pr-6'>
                        {impl.audited ? (
                          <Badge
                            variant='secondary'
                            className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          >
                            Yes
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>No</span>
                        )}
                      </td>
                      <td className='py-2 text-right'>
                        <a
                          href={impl.href}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 text-muted-foreground hover:text-foreground'
                        >
                          <ExternalLink className='h-3.5 w-3.5' />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No known implementations yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── References ─────────────────────────────────────────────── */}
      {algo.references && algo.references.length > 0 && (
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='text-base'>References</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-1.5 text-sm'>
              {algo.references.map(ref => (
                <li key={ref}>
                  <a
                    href={ref}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 text-muted-foreground break-all hover:text-foreground'
                  >
                    <ExternalLink className='h-3.5 w-3.5 shrink-0' />
                    {ref}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── MDX narrative ──────────────────────────────────────────── */}
      {MdxBody && (
        <div className='prose prose-neutral dark:prose-invert max-w-none'>
          <MdxBody />
        </div>
      )}
    </div>
  );
}
