import { getAllAlgorithms } from '@/lib/algorithms';
import { ALLOWED_ASSUMPTIONS } from '@/lib/schema';
import { AlgorithmList } from '@/components/algorithm-list';

export default function HomePage() {
  const algorithms = getAllAlgorithms();

  const allPrimitives = Array.from(
    new Set(algorithms.map(a => a.primitive))
  ).sort();

  const allAssumptions = ALLOWED_ASSUMPTIONS.filter(a =>
    algorithms.some(algo => algo.assumption === a)
  );

  const allCapabilities = Array.from(
    new Set(algorithms.flatMap(a => a.capabilities))
  ).sort();

  return (
    <div>
      <h1 className='mb-2 text-2xl font-semibold tracking-tight'>Algorithms</h1>
      <p className='mb-8 text-sm text-muted-foreground'>
        Post-quantum cryptographic algorithms evaluated for practical
        deployment.
      </p>
      <AlgorithmList
        algorithms={algorithms}
        allPrimitives={allPrimitives}
        allAssumptions={allAssumptions}
        allCapabilities={allCapabilities}
      />
    </div>
  );
}
