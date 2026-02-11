'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/risk-badge';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSizeColumns } from '@/lib/display';
import type { Algorithm } from '@/lib/schema';

interface AlgorithmListProps {
  algorithms: Algorithm[];
  allPrimitives: string[];
  allAssumptions: string[];
  allCapabilities: string[];
}

function FilterRow({
  label,
  items,
  selected,
  onToggle
}: {
  label: string;
  items: string[];
  selected: Set<string>;
  onToggle: (_item: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className='flex items-baseline gap-3'>
      <span className='w-20 shrink-0 text-xs text-muted-foreground'>
        {label}
      </span>
      <div className='flex flex-wrap gap-2'>
        {items.map(item => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={cn(
              'cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              selected.has(item)
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AlgorithmList({
  algorithms,
  allPrimitives,
  allAssumptions,
  allCapabilities
}: AlgorithmListProps) {
  const [selPrimitives, setSelPrimitives] = useState<Set<string>>(new Set());
  const [selAssumptions, setSelAssumptions] = useState<Set<string>>(new Set());
  const [selCaps, setSelCaps] = useState<Set<string>>(new Set());

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    item: string
  ) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const hasFilters =
    selPrimitives.size > 0 || selAssumptions.size > 0 || selCaps.size > 0;

  const clearAll = () => {
    setSelPrimitives(new Set());
    setSelAssumptions(new Set());
    setSelCaps(new Set());
  };

  const filtered = algorithms.filter(a => {
    const matchPrim =
      selPrimitives.size === 0 || selPrimitives.has(a.primitive);
    const matchAssump =
      selAssumptions.size === 0 || selAssumptions.has(a.assumption);
    const matchCap =
      selCaps.size === 0 || a.capabilities.some(c => selCaps.has(c));
    return matchPrim && matchAssump && matchCap;
  });

  return (
    <>
      <div className='mb-6 space-y-3'>
        <FilterRow
          label='Primitive'
          items={allPrimitives}
          selected={selPrimitives}
          onToggle={item => toggle(setSelPrimitives, item)}
        />
        <FilterRow
          label='Assumption'
          items={allAssumptions}
          selected={selAssumptions}
          onToggle={item => toggle(setSelAssumptions, item)}
        />
        <FilterRow
          label='Capability'
          items={allCapabilities}
          selected={selCaps}
          onToggle={item => toggle(setSelCaps, item)}
        />
        {hasFilters && (
          <div className='flex items-baseline gap-3'>
            <span className='w-20 shrink-0' />
            <button
              onClick={clearAll}
              className='cursor-pointer inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground'
            >
              <X className='h-3.5 w-3.5' aria-hidden />
              Clear all
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className='py-8 text-center text-sm text-muted-foreground'>
          No algorithms match the selected filters.
        </p>
      ) : (
        <div className='space-y-4'>
          {filtered.map(algo => {
            const sizeCols = getSizeColumns(algo);

            return (
              <Link
                key={algo.id}
                href={`/algorithms/${algo.id}`}
                className='block'
              >
                <Card className='transition-colors hover:bg-accent/50'>
                  <CardContent className='p-5'>
                    {/* Row 1: Name + primitive */}
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2.5'>
                          <h2 className='text-base font-semibold tracking-tight'>
                            {algo.name}
                          </h2>
                          <Badge variant='secondary' className='text-xs'>
                            {algo.primitive}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className='mt-1 h-4 w-4 shrink-0 text-muted-foreground' />
                    </div>

                    {/* Row 2: Security + Standard */}
                    <dl className='mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs'>
                      <div>
                        <dt className='text-muted-foreground'>Security</dt>
                        <dd className='mt-0.5 font-medium'>
                          {algo.security.assumption}
                          <span className='mx-1 text-muted-foreground'>
                            &middot;
                          </span>
                          {algo.security.security_notion}
                        </dd>
                      </div>
                      <div>
                        <dt className='text-muted-foreground'>Standard</dt>
                        <dd className='mt-0.5 font-medium'>
                          {algo.standardization
                            ? algo.standardization.reference
                            : '—'}
                        </dd>
                      </div>
                    </dl>

                    {/* Row 4: Parameter sets */}
                    <div className='mt-3 overflow-x-auto'>
                      <table className='w-full text-xs'>
                        <thead>
                          <tr className='border-b border-border text-muted-foreground'>
                            <th className='pb-1.5 pr-4 text-left font-medium'>
                              Params
                            </th>
                            <th className='pb-1.5 pr-4 text-left font-medium'>
                              Level
                            </th>
                            {sizeCols.map(col => (
                              <th
                                key={col.key}
                                className='pb-1.5 pr-4 text-right font-medium'
                              >
                                {col.label}
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
                              <td className='py-1.5 pr-4 font-medium'>
                                {ps.name}
                              </td>
                              <td className='py-1.5 pr-4 text-muted-foreground'>
                                {ps.nist_level}
                              </td>
                              {sizeCols.map(col => (
                                <td
                                  key={col.key}
                                  className='py-1.5 pr-4 text-right tabular-nums'
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

                    {/* Row 5: Risk */}
                    <div className='mt-3 flex flex-wrap items-center gap-1.5'>
                      <span className='text-xs text-muted-foreground mr-1'>
                        Risk
                      </span>
                      <RiskBadge
                        level={algo.risk.assumption}
                        label='Assumption'
                      />
                      <RiskBadge
                        level={algo.risk.implementation}
                        label='Implementation'
                      />
                      <RiskBadge
                        level={algo.risk.side_channel}
                        label='Side-channel'
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
