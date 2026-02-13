## Change type

<!-- Check the one that applies -->

- [ ] New algorithm(s) in `data/algorithms/`
- [ ] Update to existing algorithm data or prose
- [ ] Web / UI change
- [ ] Schema change (allowlists, validation, types)
- [ ] Other

## What

<!-- List exactly what is being added or changed. For new algorithms, list each algorithm id. -->



## Why

<!-- Explain the motivation. Link to relevant standards, papers, or issues. -->



## Checklist (if applicable)

- [ ] Each new algorithm has both a `.yaml` and `.mdx` file in `data/algorithms/`
- [ ] `pnpm --filter web validate` passes locally
- [ ] Any new allowlist values have been added to **both** `web/lib/schema.ts` and `web/scripts/validate-content.mjs`
- [ ] New glossary terms added to `data/glossary.yaml` if applicable
