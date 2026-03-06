/* eslint-disable no-console */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

// ── Allowlists ──────────────────────────────────────────────────────
// These MUST stay in sync with lib/schema.ts.

const ALLOWED_ASSUMPTIONS = [
  'lattice',
  'hash-based',
  'code-based',
  'isogeny-based'
];

const ALLOWED_TAGS = [
  'lattice',
  'module-lwe',
  'ring-lwe',
  'hash-based',
  'code-based',
  'isogeny-based',
  'fips-203',
  'fips-204',
  'fips-205',
  'kem',
  'digital-signature',
  'stateful',
  'stateless',
  'ntru',
  'qcsd',
  'bitcoin',
  'ethereum'
];

const ALLOWED_CAPABILITIES = [
  'batch-verification',
  'threshold-signatures',
  'aggregation',
  'hedged-signing',
  'hardware-friendly',
  'hybrid-mode',
  'forward-secrecy',
  'key-agreement',
  'snark-aggregation'
];

// ── Schema ──────────────────────────────────────────────────────────

const riskLevel = z.enum(['low', 'medium', 'high']);
const qualitative = z.enum(['fast', 'medium', 'slow']);
const assumptionEnum = z.enum(ALLOWED_ASSUMPTIONS);
const tag = z.enum(ALLOWED_TAGS);
const capability = z.enum(ALLOWED_CAPABILITIES);

const implementationSchema = z.object({
  name: z.string(),
  language: z.string(),
  href: z
    .string()
    .url()
    .refine(u => u.startsWith('https:'), 'implementation link must use https'),
  audited: z.boolean()
});

const standardizationSchema = z.object({
  status: z.string(),
  body: z.string(),
  reference: z.string()
});

const benchmarkEntry = z.object({
  parameter_set: z.string(),
  keygen_us: z.number()
});

const benchmarksSchema = z.object({
  platform: z.string(),
  source: z.string(),
  entries: z.array(benchmarkEntry).min(1)
});

const signatureParamSet = z.object({
  name: z.string(),
  nist_level: z.number(),
  sizes: z.object({
    pk_bytes: z.number(),
    sk_bytes: z.number(),
    sig_bytes: z.number()
  })
});

const kemParamSet = z.object({
  name: z.string(),
  nist_level: z.number(),
  sizes: z.object({
    pk_bytes: z.number(),
    sk_bytes: z.number(),
    ct_bytes: z.number(),
    ss_bytes: z.number()
  })
});

const signatureBenchmarkEntry = benchmarkEntry.extend({
  sign_us: z.number(),
  verify_us: z.number()
});

const kemBenchmarkEntry = benchmarkEntry.extend({
  encaps_us: z.number(),
  decaps_us: z.number()
});

const referenceSchema = z
  .string()
  .url()
  .refine(u => u.startsWith('https:'), 'reference link must use https');

const baseFields = {
  id: z.string(),
  name: z.string(),
  assumption: assumptionEnum,
  standardization: standardizationSchema.optional(),
  security: z.object({
    assumption: z.string(),
    security_notion: z.string(),
    deterministic: z.boolean(),
    statefulness: z.string()
  }),
  risk: z.object({
    assumption: riskLevel,
    implementation: riskLevel,
    side_channel: riskLevel
  }),
  implementations: z.array(implementationSchema).default([]),
  tags: z.array(tag).min(1),
  capabilities: z.array(capability).default([]),
  references: z.array(referenceSchema).optional()
};

const algorithmSchema = z.discriminatedUnion('primitive', [
  z.object({
    ...baseFields,
    primitive: z.literal('digital-signature'),
    performance: z.object({
      relative: z.object({
        keygen: qualitative,
        sign: qualitative,
        verify: qualitative
      }),
      benchmarks: benchmarksSchema
        .extend({ entries: z.array(signatureBenchmarkEntry).min(1) })
        .optional()
    }),
    parameter_sets: z.array(signatureParamSet).min(1)
  }),
  z.object({
    ...baseFields,
    primitive: z.literal('kem'),
    performance: z.object({
      relative: z.object({
        keygen: qualitative,
        encaps: qualitative,
        decaps: qualitative
      }),
      benchmarks: benchmarksSchema
        .extend({ entries: z.array(kemBenchmarkEntry).min(1) })
        .optional()
    }),
    parameter_sets: z.array(kemParamSet).min(1)
  })
]);

// ── Validate ────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(__dirname, '../content/algorithms');

if (!existsSync(contentDir)) {
  console.error(`Error: ${contentDir} not found. Run sync-content first.`);
  process.exit(1);
}

const files = readdirSync(contentDir).filter(f => f.endsWith('.yaml'));

if (files.length === 0) {
  console.error('Error: No .yaml files found in content/algorithms/');
  process.exit(1);
}

let failed = false;

for (const file of files) {
  const raw = readFileSync(resolve(contentDir, file), 'utf-8');
  const data = parseYaml(raw);
  const result = algorithmSchema.safeParse(data);

  if (!result.success) {
    failed = true;
    console.error(`\n✗ ${file}`);
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
  } else {
    const mdxFile = file.replace(/\.yaml$/, '.mdx');
    if (!existsSync(resolve(contentDir, mdxFile))) {
      failed = true;
      console.error(`\n✗ ${file}: missing corresponding ${mdxFile}`);
    } else {
      console.log(`✓ ${file}`);
    }
  }
}

if (failed) {
  console.error('\nValidation failed. Fix the errors above and retry.');
  process.exit(1);
}

console.log(`\nAll ${files.length} algorithm(s) valid.\n`);
