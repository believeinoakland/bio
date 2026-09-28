# jurisdictions (T10)

**Status** · session_01SU8wk5poE2iWXhvwJ4DL2R · depth 2 · WORKING · handled B1

## J1 · REPORT

Generated artifacts this job made stale (mechanics §14). I have written none of them.

1. **`agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json`** (owner: `agent-worker`). `node --test bio-plane/test/fleetbundles.test.mjs` fails one check: `agent-worker: STALE BUNDLE`, naming `jurisdictions/profiles/oakland-alameda.mjs`. Without my change it passes. Regenerate it at the layer's close: `agent-worker/`, `npm run build`.
2. **`bio-plane/dist/bio-plane.bundled.mjs`** (owner: `not_product`). It also inlines the first profile and is out of date the same way, though the staleness check does not flag it. `bio-plane/`: `npm run build`.

The service I provide is unchanged; only the first profile's data gained a section. Filings, the one module that reads `legal_organisations`, stays green: `bio-plane/test/m/filings/reads.test.mjs` 6/6.
