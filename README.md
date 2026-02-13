# Post-Quantum Cryptography Registry

A reference site for post-quantum cryptographic algorithms. Each algorithm is described by a structured YAML data file and a free-form MDX prose file. A Next.js web app renders them into a browsable registry with glossary-linked definitions, risk badges, parameter-set tables, and benchmark data.

## Repository structure

```
pq-crypto-registry/
├── data/                        # ← content lives here (what most contributors edit)
│   ├── algorithms/
│   │   ├── ml-kem.yaml          # structured data for ML-KEM
│   │   ├── ml-kem.mdx           # long-form description for ML-KEM
│   │   ├── ml-dsa.yaml
│   │   ├── ml-dsa.mdx
│   │   └── ...
│   └── glossary.yaml            # glossary terms shown across the site
├── web/                         # Next.js app (renders data/ into the site)
│   ├── lib/schema.ts            # Zod schema & allowlists (source of truth)
│   ├── scripts/validate-content.mjs
│   └── ...
├── package.json
└── pnpm-workspace.yaml
```

## Adding a new algorithm

Every algorithm requires **two files** in `data/algorithms/`:

1. **`<id>.yaml`** — structured data (schema-validated)
2. **`<id>.mdx`** — free-form prose (Markdown with JSX support)

The `id` is a URL-safe slug (lowercase, hyphens). It must match the filename and the `id` field inside the YAML.

### Step 1: Create the YAML file

The schema is a **discriminated union on `primitive`**. The two supported primitives are `digital-signature` and `kem`, and each has a slightly different shape.

#### Digital signature example (`data/algorithms/slh-dsa.yaml`)

```yaml
id: slh-dsa
name: SLH-DSA
primitive: digital-signature          # ← determines the schema variant
assumption: hash-based

standardization:                      # optional block
  status: standard
  body: NIST
  reference: FIPS 205

security:
  assumption: Hash functions (SHA2/SHAKE)
  security_notion: EUF-CMA
  deterministic: false
  statefulness: stateless

performance:
  relative:
    keygen: slow                      # qualitative: fast | medium | slow
    sign: slow
    verify: fast
  benchmarks:                         # optional block
    platform: "Intel Core i7-1365U (Alder Lake)"
    source: liboqs 0.10.0
    entries:
      - parameter_set: SLH-DSA-128s
        keygen_us: 5400
        sign_us: 72000               # signature-specific timing fields
        verify_us: 3200

risk:
  assumption: low                     # risk level: low | medium | high
  implementation: low
  side_channel: low

parameter_sets:                       # at least one required
  - name: SLH-DSA-128s
    nist_level: 1
    sizes: { pk_bytes: 32, sk_bytes: 64, sig_bytes: 7856 }

capabilities:                         # list from the allowlist (can be empty)
  - hardware-friendly

implementations:                      # list (can be empty)
  - name: liboqs
    language: C
    href: https://github.com/open-quantum-safe/liboqs
    audited: true

references:                           # optional list of HTTPS URLs
  - https://csrc.nist.gov/pubs/fips/205/final
  - https://sphincs.org

tags:                                 # at least one required, from the allowlist
  - hash-based
  - fips-205
  - digital-signature
```

#### KEM example (`data/algorithms/ml-kem.yaml`)

```yaml
id: ml-kem
name: ML-KEM
primitive: kem                        # ← determines the schema variant
assumption: lattice

standardization:
  status: standard
  body: NIST
  reference: FIPS 203

security:
  assumption: Module-LWE
  security_notion: IND-CCA2
  deterministic: true
  statefulness: stateless

performance:
  relative:
    keygen: fast
    encaps: fast                      # KEM uses encaps/decaps, not sign/verify
    decaps: fast
  benchmarks:
    platform: "Intel Core i7-1365U (Alder Lake)"
    source: liboqs 0.10.0
    entries:
      - parameter_set: ML-KEM-512
        keygen_us: 36
        encaps_us: 46                 # KEM-specific timing fields
        decaps_us: 52

risk:
  assumption: low
  implementation: low
  side_channel: medium

parameter_sets:
  - name: ML-KEM-512
    nist_level: 1
    sizes: { pk_bytes: 800, sk_bytes: 1632, ct_bytes: 768, ss_bytes: 32 }

capabilities:
  - key-agreement
  - forward-secrecy
  - hardware-friendly
  - hybrid-mode

implementations:
  - name: liboqs
    language: C
    href: https://github.com/open-quantum-safe/liboqs
    audited: true

references:
  - https://csrc.nist.gov/pubs/fips/203/final
  - https://pq-crystals.org/kyber/

tags:
  - lattice
  - module-lwe
  - fips-203
  - kem
```

### Key differences between the two primitives

| | `digital-signature` | `kem` |
|---|---|---|
| `performance.relative` fields | `keygen`, `sign`, `verify` | `keygen`, `encaps`, `decaps` |
| Benchmark timing fields | `keygen_us`, `sign_us`, `verify_us` | `keygen_us`, `encaps_us`, `decaps_us` |
| `parameter_sets[].sizes` | `pk_bytes`, `sk_bytes`, `sig_bytes` | `pk_bytes`, `sk_bytes`, `ct_bytes`, `ss_bytes` |

### Step 2: Create the MDX file

Create a matching `<id>.mdx` alongside the YAML file. This is free-form Markdown rendered on the algorithm's detail page. At minimum it should have an `## Overview` section.

```mdx
## Overview

...

## Security basis

...

## Considerations

...
```

### Step 3: Validate

From the repo root:

```sh
pnpm install            # first time only
pnpm --filter web validate
```

This syncs `data/` into `web/content/` and runs the Zod schema validator against every YAML file. It also checks that every `.yaml` has a corresponding `.mdx`. Fix any errors before opening a PR.

## Schema reference

### Allowed values

Several fields are restricted to an allowlist. The canonical source for these lists is `web/lib/schema.ts`.

#### `assumption` (top-level)

The hardness-assumption family the algorithm belongs to.

| Value | Description |
|---|---|
| `lattice` | Lattice-based (LWE, MLWE, SIS, etc.) |
| `hash-based` | Security relies on hash functions |
| `code-based` | Based on error-correcting codes |
| `isogeny-based` | Based on elliptic-curve isogenies |

#### `tags` (at least one required)

Freeform-ish labels used for filtering and categorization.

| Value | | Value |
|---|---|---|
| `lattice` | | `fips-203` |
| `module-lwe` | | `fips-204` |
| `ring-lwe` | | `fips-205` |
| `hash-based` | | `kem` |
| `code-based` | | `digital-signature` |
| `isogeny-based` | | `stateful` |
| | | `stateless` |

#### `capabilities`

Optional features the algorithm supports.

| Value | Description |
|---|---|
| `batch-verification` | Multiple signatures verified at once |
| `threshold-signatures` | Distributed signing across parties |
| `aggregation` | Multiple signatures compressed into one |
| `hedged-signing` | Signing mixes in additional randomness |
| `hardware-friendly` | Suitable for constrained devices / HSMs |
| `hybrid-mode` | Can be combined with classical algorithms |
| `forward-secrecy` | Past sessions stay secure if long-term key is compromised |
| `key-agreement` | Produces a shared secret between two parties |

#### `risk` levels

Each of `risk.assumption`, `risk.implementation`, and `risk.side_channel` accepts: **`low`**, **`medium`**, or **`high`**.

#### `performance.relative` ratings

Each qualitative performance field accepts: **`fast`**, **`medium`**, or **`slow`**.

### Adding new allowed values

If a new algorithm needs a value that isn't in the allowlists above, add it to **both** of these files (they must stay in sync):

1. **`web/lib/schema.ts`** — update the relevant `ALLOWED_*` array
2. **`web/scripts/validate-content.mjs`** — update the matching array

For example, to add a new assumption `multivariate`:

```ts
// web/lib/schema.ts
export const ALLOWED_ASSUMPTIONS = [
  'lattice',
  'hash-based',
  'code-based',
  'isogeny-based',
  'multivariate'           // ← add here
] as const;
```

```js
// web/scripts/validate-content.mjs
const ALLOWED_ASSUMPTIONS = [
  'lattice',
  'hash-based',
  'code-based',
  'isogeny-based',
  'multivariate'           // ← and here
];
```

The same pattern applies to `ALLOWED_TAGS` and `ALLOWED_CAPABILITIES`.

### Optional vs required fields

| Field | Required? |
|---|---|
| `id`, `name`, `primitive`, `assumption` | Yes |
| `security`, `performance`, `risk` | Yes |
| `parameter_sets` | Yes (at least one) |
| `tags` | Yes (at least one) |
| `standardization` | No |
| `performance.benchmarks` | No |
| `capabilities` | No (defaults to `[]`) |
| `implementations` | No (defaults to `[]`) |
| `references` | No |

### Implementation entries

Each entry in `implementations` requires:

| Field | Type | Notes |
|---|---|---|
| `name` | string | Library or project name |
| `language` | string | Primary language (e.g. `C`, `Rust`, `Go`) |
| `href` | string | HTTPS URL to the project |
| `audited` | boolean | Whether the implementation has been independently audited |

## Glossary

`data/glossary.yaml` contains terms that are automatically highlighted and linked across the site. Add entries when introducing new terminology:

```yaml
- term: SLH-DSA
  slug: slh-dsa
  definition: >-
    Stateless Hash-Based Digital Signature Algorithm. A post-quantum
    signature scheme standardised in FIPS 205, formerly known as SPHINCS+.
```

## Development

```sh
pnpm install
pnpm dev                  # starts Next.js dev server with content sync + validation
pnpm build                # production build (runs sync + validate automatically)
```
