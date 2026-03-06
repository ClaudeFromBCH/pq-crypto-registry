import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LinkedText } from '@/components/linked-text';
import { RiskBadge } from '@/components/risk-badge';
import { getGlossary } from '@/lib/glossary';
import { getAllAlgorithms } from '@/lib/algorithms';

const riskCategories = [
  {
    title: 'Assumption Risk',
    description:
      'Confidence in the underlying mathematical hardness assumption.',
    levels: [
      {
        level: 'low' as const,
        definition:
          'Well-studied assumption with decades of scrutiny and no known sub-exponential attacks (classical or quantum). Examples: Module-LWE at standard parameters.'
      },
      {
        level: 'medium' as const,
        definition:
          'Assumption is broadly believed to hold, but has less cryptanalytic history or relies on structured variants that narrow the safety margin.'
      },
      {
        level: 'high' as const,
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
        level: 'low' as const,
        definition:
          'Straightforward to implement correctly. Reference code is mature, few edge cases, and misuse-resistant API design.'
      },
      {
        level: 'medium' as const,
        definition:
          'Requires careful attention to parameter encoding, rejection sampling, or key validation. Subtle bugs have appeared in early implementations.'
      },
      {
        level: 'high' as const,
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
        level: 'low' as const,
        definition:
          'Core operations are naturally constant-time or trivially hardened. No known exploitable leakage in standard deployment models.'
      },
      {
        level: 'medium' as const,
        definition:
          'Constant-time implementation is achievable but requires explicit effort (e.g., masked arithmetic, constant-time rejection sampling). Non-hardened code is vulnerable.'
      },
      {
        level: 'high' as const,
        definition:
          'Inherent algorithmic features (e.g., variable-weight operations, secret-dependent branching) make side-channel resistance difficult even for expert implementers.'
      }
    ]
  }
];

const standardizationStatuses = [
  {
    status: 'Standard',
    description:
      'Published as a final standard by a recognized body (e.g. NIST FIPS, IETF RFC). Suitable for production deployment.'
  },
  {
    status: 'Draft',
    description:
      'Standard is in development with a designated reference number. The specification is largely stable but may still undergo minor revisions before finalization.'
  },
  {
    status: 'Candidate',
    description:
      'Selected for standardization but the formal specification has not yet been published. Subject to change during the standardization process.'
  },
  {
    status: 'Research',
    description:
      'Active academic proposal or early-stage design. Not yet adopted by a standardization body. Included in the registry for tracking and comparison.'
  }
];

const assumptionFamilies = [
  {
    name: 'Lattice',
    tag: 'lattice',
    description:
      'Security relies on the hardness of problems in high-dimensional lattices, such as finding short vectors (SVP) or distinguishing noisy linear equations (LWE). Offers strong performance and compact keys, with decades of cryptanalytic study.'
  },
  {
    name: 'Hash-based',
    tag: 'hash-based',
    description:
      'Security relies solely on the properties of cryptographic hash functions (collision resistance, preimage resistance). Considered the most conservative assumption family because no structural algebraic assumption is required beyond hash function security.'
  },
  {
    name: 'Code-based',
    tag: 'code-based',
    description:
      'Security relies on the hardness of decoding random linear error-correcting codes. The McEliece cryptosystem (1978) is the oldest post-quantum proposal in this family, providing strong confidence through decades of study.'
  },
  {
    name: 'Isogeny-based',
    tag: 'isogeny-based',
    description:
      'Security relies on the hardness of computing isogenies between elliptic curves. A newer family offering compact key sizes but with less mature cryptanalytic history. The SIDH attack in 2022 demonstrated the importance of ongoing analysis.'
  }
];

const securityProperties = [
  {
    property: 'Hardness Assumption',
    description:
      'The specific mathematical problem that must remain hard for the scheme to be secure (e.g. Module-LWE, QCSD). Distinct from the broader assumption family.'
  },
  {
    property: 'Security Notion',
    description:
      'The formal security guarantee the scheme provides. Digital signatures target EUF-CMA (existential unforgeability under chosen message attack). KEMs target IND-CCA2 (indistinguishability under adaptive chosen ciphertext attack).'
  },
  {
    property: 'Deterministic',
    description:
      'Whether the core operation (signing or encapsulation) produces the same output given the same inputs. Non-deterministic schemes use internal randomness, which can provide hedging against fault attacks but requires a reliable entropy source.'
  },
  {
    property: 'Statefulness',
    description:
      'Whether the signer must maintain state between operations. Stateful schemes (e.g. XMSS) require careful index tracking — reusing state can be catastrophic. Stateless schemes are simpler to deploy but may have larger signatures.'
  }
];

const capabilityDefinitions = [
  {
    capability: 'batch-verification',
    description:
      'Multiple signatures can be verified simultaneously faster than verifying each individually.'
  },
  {
    capability: 'threshold-signatures',
    description:
      'The signing key can be split among multiple parties, requiring a threshold of participants to produce a valid signature.'
  },
  {
    capability: 'aggregation',
    description:
      'Multiple signatures can be combined into a single compact proof of validity.'
  },
  {
    capability: 'hedged-signing',
    description:
      'Signing incorporates both deterministic and randomized components, providing resilience against both fault injection and poor randomness.'
  },
  {
    capability: 'hardware-friendly',
    description:
      'Operations map efficiently to constrained hardware (HSMs, smart cards, embedded devices) without requiring large memory or complex arithmetic.'
  },
  {
    capability: 'hybrid-mode',
    description:
      'Can be deployed alongside a classical algorithm (e.g. ECDSA + ML-DSA) in a hybrid construction for defense-in-depth during migration.'
  },
  {
    capability: 'forward-secrecy',
    description:
      'Compromise of the current key does not allow decryption of past sessions or forgery of past signatures.'
  },
  {
    capability: 'key-agreement',
    description:
      'Can be used to establish a shared secret between two parties for symmetric encryption.'
  },
  {
    capability: 'snark-aggregation',
    description:
      'Signatures are designed for efficient aggregation via STARK/SNARK proofs, enabling scalable on-chain verification.'
  }
];

export default function MethodologyPage() {
  const glossary = getGlossary();
  const algorithms = getAllAlgorithms();

  const sigCount = algorithms.filter(
    a => a.primitive === 'digital-signature'
  ).length;
  const kemCount = algorithms.filter(a => a.primitive === 'kem').length;

  const assumptionCounts = assumptionFamilies.map(family => ({
    ...family,
    count: algorithms.filter(a => a.assumption === family.tag).length
  }));

  return (
    <div>
      <h1 className='mb-2 text-2xl font-semibold tracking-tight'>
        Methodology
      </h1>
      <p className='mb-8 text-sm text-muted-foreground'>
        How the registry evaluates post-quantum cryptographic algorithms. Each
        algorithm is assessed across standardization maturity, security
        properties, risk profile, performance, and implementation readiness.
      </p>

      {/* ── Scope ──────────────────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>Scope</h2>
        <p className='mb-3 text-sm text-muted-foreground'>
          The registry tracks post-quantum cryptographic algorithms relevant to
          practical deployment. Algorithms are included based on standardization
          progress, adoption potential, or significance to specific ecosystems
          (e.g. blockchain).
        </p>
        <div className='flex gap-3'>
          <div className='flex-1 rounded-lg border border-border bg-card px-4 py-3'>
            <p className='text-2xl font-semibold tabular-nums'>{sigCount}</p>
            <p className='text-sm text-muted-foreground'>
              Digital signature schemes
            </p>
          </div>
          <div className='flex-1 rounded-lg border border-border bg-card px-4 py-3'>
            <p className='text-2xl font-semibold tabular-nums'>{kemCount}</p>
            <p className='text-sm text-muted-foreground'>
              Key encapsulation mechanisms
            </p>
          </div>
        </div>
      </section>

      {/* ── Assumption Families ─────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Assumption Families
        </h2>
        <p className='mb-4 text-sm text-muted-foreground'>
          Every algorithm is classified by the mathematical hardness assumption
          it relies on. This determines the algorithm&apos;s fundamental
          security posture and informs the assumption risk rating.
        </p>
        <div className='space-y-3'>
          {assumptionCounts.map(family => (
            <div
              key={family.tag}
              className='rounded-lg border border-border bg-card px-4 py-3'
            >
              <div className='mb-1 flex items-center gap-2'>
                <span className='text-sm font-medium'>{family.name}</span>
                <Badge variant='secondary' className='text-xs'>
                  {family.count} algorithm{family.count !== 1 ? 's' : ''}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>
                <LinkedText text={family.description} glossary={glossary} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Standardization ─────────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Standardization Status
        </h2>
        <p className='mb-4 text-sm text-muted-foreground'>
          The registry records standardization progress from recognized bodies
          including NIST, IETF, and relevant ecosystem organizations. Each
          algorithm&apos;s status reflects the maturity of its formal
          specification.
        </p>
        <Card>
          <CardContent className='pt-6'>
            <dl className='space-y-4'>
              {standardizationStatuses.map(item => (
                <div key={item.status}>
                  <dt className='text-sm font-medium'>{item.status}</dt>
                  <dd className='mt-0.5 text-sm text-muted-foreground'>
                    {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>

      {/* ── Security Properties ─────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Security Properties
        </h2>
        <p className='mb-4 text-sm text-muted-foreground'>
          Each algorithm is characterized by four security properties that
          describe its formal guarantees and operational requirements.
        </p>
        <Card>
          <CardContent className='pt-6'>
            <dl className='space-y-4'>
              {securityProperties.map(item => (
                <div key={item.property}>
                  <dt className='text-sm font-medium'>{item.property}</dt>
                  <dd className='mt-0.5 text-sm text-muted-foreground'>
                    <LinkedText
                      text={item.description}
                      glossary={glossary}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>

      {/* ── Risk Assessment ─────────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Risk Assessment
        </h2>
        <p className='mb-4 text-sm text-muted-foreground'>
          Risk assessments use a conservative three-tier scale across three
          independent dimensions. Definitions are intentionally narrow to avoid
          ambiguity. Ratings are assigned based on published cryptanalysis,
          implementation track record, and inherent algorithmic properties.
        </p>
        <div className='space-y-4'>
          {riskCategories.map(category => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle className='text-base'>{category.title}</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {category.description}
                </p>
              </CardHeader>
              <CardContent>
                <dl className='space-y-3'>
                  {category.levels.map(item => (
                    <div key={item.level} className='flex gap-3'>
                      <div className='shrink-0 pt-0.5'>
                        <RiskBadge level={item.level} />
                      </div>
                      <dd className='text-sm text-muted-foreground'>
                        <LinkedText
                          text={item.definition}
                          glossary={glossary}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Performance ─────────────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Performance Evaluation
        </h2>
        <p className='mb-4 text-sm text-muted-foreground'>
          Performance is captured at two levels of detail. All algorithms
          receive qualitative relative ratings. When available, quantitative
          benchmarks are included with platform and source attribution.
        </p>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Relative Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='mb-3 text-sm text-muted-foreground'>
                Each core operation is rated on a three-point scale relative to
                other algorithms of the same primitive type.
              </p>
              <div className='space-y-2'>
                {[
                  {
                    rating: 'Fast',
                    definition:
                      'Completes in time comparable to or better than classical counterparts for typical parameter sets.'
                  },
                  {
                    rating: 'Medium',
                    definition:
                      'Noticeably slower than classical counterparts but acceptable for most deployments.'
                  },
                  {
                    rating: 'Slow',
                    definition:
                      'Significantly slower than classical counterparts. May require architectural consideration for latency-sensitive applications.'
                  }
                ].map(item => (
                  <div key={item.rating} className='flex gap-3'>
                    <dt className='w-16 shrink-0 text-sm font-medium'>
                      {item.rating}
                    </dt>
                    <dd className='text-sm text-muted-foreground'>
                      {item.definition}
                    </dd>
                  </div>
                ))}
              </div>
              <div className='mt-4 rounded-md bg-muted/50 px-3 py-2'>
                <p className='text-xs text-muted-foreground'>
                  Digital signatures are rated on{' '}
                  <span className='font-medium text-foreground'>keygen</span>,{' '}
                  <span className='font-medium text-foreground'>sign</span>, and{' '}
                  <span className='font-medium text-foreground'>verify</span>.
                  KEMs are rated on{' '}
                  <span className='font-medium text-foreground'>keygen</span>,{' '}
                  <span className='font-medium text-foreground'>encaps</span>,
                  and{' '}
                  <span className='font-medium text-foreground'>decaps</span>.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                When available, quantitative benchmarks report wall-clock
                timing in microseconds for each operation and parameter set.
                Each benchmark entry includes the hardware platform and source
                implementation to ensure reproducibility. Benchmarks are not
                available for all algorithms.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Parameter Sets ──────────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Parameter Sets & Sizes
        </h2>
        <p className='mb-4 text-sm text-muted-foreground'>
          Each algorithm defines one or more parameter sets at different NIST
          security levels. The registry records the concrete byte sizes for all
          cryptographic artifacts.
        </p>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>NIST Security Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='mb-3 text-sm text-muted-foreground'>
                <LinkedText
                  text='NIST security level classifications define the minimum computational effort required to break a scheme, benchmarked against symmetric primitives.'
                  glossary={glossary}
                />
              </p>
              <div className='space-y-2'>
                {[
                  { level: 1, target: 'AES-128 key recovery' },
                  { level: 2, target: 'SHA-256 collision' },
                  { level: 3, target: 'AES-192 key recovery' },
                  { level: 4, target: 'SHA-384 collision' },
                  { level: 5, target: 'AES-256 key recovery' }
                ].map(item => (
                  <div key={item.level} className='flex gap-3 text-sm'>
                    <span className='w-16 shrink-0 font-medium'>
                      Level {item.level}
                    </span>
                    <span className='text-muted-foreground'>
                      At least as hard to break as {item.target}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Tracked Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='mb-2 font-medium'>Digital Signatures</p>
                  <ul className='space-y-1 text-muted-foreground'>
                    <li>Public key (pk_bytes)</li>
                    <li>Secret key (sk_bytes)</li>
                    <li>Signature (sig_bytes)</li>
                  </ul>
                </div>
                <div>
                  <p className='mb-2 font-medium'>KEMs</p>
                  <ul className='space-y-1 text-muted-foreground'>
                    <li>Public key (pk_bytes)</li>
                    <li>Secret key (sk_bytes)</li>
                    <li>Ciphertext (ct_bytes)</li>
                    <li>Shared secret (ss_bytes)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Capabilities ────────────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Capabilities
        </h2>
        <p className='mb-4 text-sm text-muted-foreground'>
          Capabilities describe functional properties beyond core
          cryptographic operations. These help identify algorithms suited to
          specific deployment scenarios.
        </p>
        <Card>
          <CardContent className='pt-6'>
            <dl className='space-y-3'>
              {capabilityDefinitions.map(item => (
                <div key={item.capability}>
                  <dt className='text-sm'>
                    <Badge variant='secondary'>{item.capability}</Badge>
                  </dt>
                  <dd className='mt-1 text-sm text-muted-foreground'>
                    <LinkedText
                      text={item.description}
                      glossary={glossary}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>

      {/* ── Implementations ─────────────────────────────────────────── */}
      <section className='mb-10'>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Implementation Tracking
        </h2>
        <p className='mb-4 text-sm text-muted-foreground'>
          The registry catalogs known implementations for each algorithm,
          recording the implementation name, language, source link, and
          whether the code has undergone a formal security audit.
        </p>
        <Card>
          <CardContent className='pt-6'>
            <dl className='space-y-3'>
              <div>
                <dt className='text-sm font-medium'>Audited</dt>
                <dd className='mt-0.5 text-sm text-muted-foreground'>
                  The implementation has been reviewed by an independent
                  security auditor. This does not guarantee the absence of
                  vulnerabilities, but indicates a higher level of scrutiny.
                </dd>
              </div>
              <div>
                <dt className='text-sm font-medium'>Unaudited</dt>
                <dd className='mt-0.5 text-sm text-muted-foreground'>
                  No known formal audit. The implementation may still be
                  high quality, but has not been independently verified.
                  Exercise additional caution for production use.
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      {/* ── Contributing ────────────────────────────────────────────── */}
      <section>
        <h2 className='mb-3 text-lg font-semibold tracking-tight'>
          Contributing
        </h2>
        <p className='text-sm text-muted-foreground'>
          The PQ Crypto Registry is open source. Algorithm data, risk
          assessments, and methodology are maintained in structured YAML files
          with automated validation. Contributions are welcome via{' '}
          <a
            href='https://github.com/p-11/pq-crypto-registry'
            target='_blank'
            rel='noopener noreferrer'
            className='underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-foreground transition-colors'
          >
            pull request
          </a>
          .
        </p>
      </section>
    </div>
  );
}
