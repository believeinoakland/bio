# jurisdictions (T10)

**Status** · session_01SU8wk5poE2iWXhvwJ4DL2R · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Generated artifacts this job made stale (mechanics §14). I have written none of them.

1. **`agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json`** (owner: `agent-worker`). `node --test bio-plane/test/fleetbundles.test.mjs` fails one check: `agent-worker: STALE BUNDLE`, naming `jurisdictions/profiles/oakland-alameda.mjs`. Without my change it passes. Regenerate it at the layer's close: `agent-worker/`, `npm run build`.
2. **`bio-plane/dist/bio-plane.bundled.mjs`** (owner: `not_product`). It also inlines the first profile and is out of date the same way, though the staleness check does not flag it. `bio-plane/`: `npm run build`.

The service I provide is unchanged; only the first profile's data gained a section. Filings, the one module that reads `legal_organisations`, stays green: `bio-plane/test/m/filings/reads.test.mjs` 6/6.

## J2 · COMPLETE

**Entry applied** (plan layer 1, the jurisdictions bullet):
- **N258 (K283 (2), K303) → R36.** The first profile's `legal_organisations` now holds two organisations, each basis `UNMEASURED`:
  - the Howard Jarvis Taxpayers Association: `evaluates` `assessment_challenge` and `taxpayer_action`; contact `web` `https://www.hjta.org`;
  - the First Amendment Coalition: `evaluates` `constitutional_claim`; contact `web` `https://firstamendmentcoalition.org`.
  Neither takes up `consent_decree_motion`. Both websites resolved when I checked, 2026-09-28. The profile's header and its note on the section are updated to match.

**Deferred:** none. **Other modules:** J1 (two stale bundles; filings green).

**Tests:** `node --test jurisdictions/test/` gives tests 44, pass 44, fail 0. R36's test now checks the whole section exactly, that every `evaluates` entry is a Tier 3 kind of the profile, that each contact is an https website, that no organisation takes up `consent_decree_motion`, and that the combined view carries both, tagged with the first profile. No `test.todo` is left. Filings' reads: 6/6.

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 5 product files, 4 relative imports; 0 failures
- coverage: 38 of 38 live requirement ids named by a test; 0 failures
- ownership: 3 files changed by jurisdictions between tranche/T10 and HEAD; 0 failures

Size (session_01SU8wk5poE2iWXhvwJ4DL2R): test runs 5, module lines 2440
