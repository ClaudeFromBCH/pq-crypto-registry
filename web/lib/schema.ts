import { z } from 'zod';

// ── Allowlists ──────────────────────────────────────────────────────
// Add new values here when the registry expands.
// Keep in sync with scripts/validate-content.mjs.

export const ALLOWED_ASSUMPTIONS = [
  'lattice',
  'hash-based',
  'code-based',
  'isogeny-based'
] as const;

export const ALLOWED_TAGS = [
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
  'stateless'
] as const;

export const ALLOWED_CAPABILITIES = [
  'batch-verification',
  'threshold-signatures',
  'aggregation',
  'hedged-signing',
  'hardware-friendly',
  'hybrid-mode',
  'forward-secrecy',
  'key-agreement'
] as const;

// ── Shared enums ────────────────────────────────────────────────────

const riskLevel = z.enum(['low', 'medium', 'high']);
const qualitative = z.enum(['fast', 'medium', 'slow']);
const assumption = z.enum(ALLOWED_ASSUMPTIONS);
const tag = z.enum(ALLOWED_TAGS);
const capability = z.enum(ALLOWED_CAPABILITIES);

// ── Implementations ─────────────────────────────────────────────────

const implementationSchema = z.object({
  name: z.string(),
  language: z.string(),
  href: z
    .string()
    .url()
    .refine(u => u.startsWith('https:'), 'implementation link must use https'),
  audited: z.boolean()
});

// ── Standardization (optional) ──────────────────────────────────────

const standardizationSchema = z.object({
  status: z.string(),
  body: z.string(),
  reference: z.string()
});

// ── Performance ─────────────────────────────────────────────────────

const benchmarkEntry = z.object({
  parameter_set: z.string(),
  keygen_us: z.number()
});

const benchmarksSchema = z.object({
  platform: z.string(),
  source: z.string(),
  entries: z.array(benchmarkEntry).min(1)
});

// ── Parameter sets (typed per-primitive) ─────────────────────────────

const signatureSizes = z.object({
  pk_bytes: z.number(),
  sk_bytes: z.number(),
  sig_bytes: z.number()
});

const kemSizes = z.object({
  pk_bytes: z.number(),
  sk_bytes: z.number(),
  ct_bytes: z.number(),
  ss_bytes: z.number()
});

const signatureParamSet = z.object({
  name: z.string(),
  nist_level: z.number(),
  sizes: signatureSizes
});

const kemParamSet = z.object({
  name: z.string(),
  nist_level: z.number(),
  sizes: kemSizes
});

// Benchmark entries add primitive-specific timing fields
const signatureBenchmarkEntry = benchmarkEntry.extend({
  sign_us: z.number(),
  verify_us: z.number()
});

const kemBenchmarkEntry = benchmarkEntry.extend({
  encaps_us: z.number(),
  decaps_us: z.number()
});

// ── Algorithm schema (discriminated union on primitive) ──────────────

const referenceSchema = z
  .string()
  .url()
  .refine(u => u.startsWith('https:'), 'reference link must use https');

const baseFields = {
  id: z.string(),
  name: z.string(),
  assumption: assumption,
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

const signatureSchema = z.object({
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
});

const kemSchema = z.object({
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
});

export const algorithmSchema = z.discriminatedUnion('primitive', [
  signatureSchema,
  kemSchema
]);

export type Algorithm = z.infer<typeof algorithmSchema>;
export type SignatureAlgorithm = z.infer<typeof signatureSchema>;
export type KemAlgorithm = z.infer<typeof kemSchema>;
export type Implementation = z.infer<typeof implementationSchema>;
