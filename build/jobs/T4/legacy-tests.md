# T4 · legacy-tests — job record

**Session** LEGACY-TESTS #2, `session_019sbQinGJRZm3pZkVZqMGvj`, on `job/T4/legacy-tests` (from `tranche/T4` @ `c03f169901`, after layer 3 closed). Process: civicos-process `roles/JOB.md`, mechanics §6, §13, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T4`.

**Status** · IN PROGRESS, 2026-09-27. Baseline battery running.

**Contract** (no requirements file; `build/modules.json`): the old battery (`bio-plane/test/`, `civicos-ui/test/`, minus `bio-plane/test/m/<module>/`) and `civicos-ui/check-refusal-codes.mjs`, `check-semantics.mjs`. Entry: **T4-5** (`build/plan/current.md`, Layer 11): re-anchor or retire every old-battery test layer 3's extractions broke, fleetbundles arm 2a (K115), and LEGACY-CHECKS #1's REPORT 4 list, first the seven that read `host_governor`'s DDL in `schema.mjs` (K72 (3)). Rule, per BOB's first message: a test pinning moved source text is re-anchored on the module's interface or retired with the moved code; a fixture an intended rule now refuses is fixed; no assertion of product behaviour is weakened; a red that looks like a product defect is REPORTed.

**Read whole:** `roles/JOB.md`, mechanics §6, §13, §16, `build/manifest.md`, my entry and the plan's layer-close notes, LEGACY-TESTS #1's record (`build/jobs/T3/legacy-tests.md`), and every T4 job record (legacy-checks, promotion, host-governor, provenance, capture-sources, capture, and the layer-1 ones).

**How to continue from this record** (a successor session): "Families" says what is done; "Open" lists what remains. Suites run from `bio-plane/` as `node test/<name>.test.mjs`; controls one by one with `node <file>`.

## Baseline

Running (all 369 plane suites, 4 at a time, on `c03f169901`).

## Families

(none yet)

## Open

- Everything in T4-5.
