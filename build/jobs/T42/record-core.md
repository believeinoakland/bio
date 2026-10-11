# record-core (T42)

**Status** · session_013PmyJwtkkmXmvfs4xFhWb6 · depth 2 · RUNNING until 2026-10-11T00:50:14Z (users' suites (1055 files)) · handled B1

## Completion

**Read.** Reading set measured by START at 247 KB (≤ 300 KB): read whole by me. That is `build/requirements/record-core.md`, the public parts of `record-grammar`, `id-spaces` and `test-support`, layer 2's row of `build/layers.md`, and `bio-plane/src/record-core/` (`index.mjs`, `checks.mjs`, `schema.mjs`). Also read whole: `t33.test.mjs`, K2616, K2617, record-grammar R55, and `ACD`'s `ID_TABLE` row (`record-grammar/ids.mjs`:71–75). A worker of mine read `record-core.test.mjs`, `t35.test.mjs`, `storage.mjs` and `stats-disclosure.test.mjs` in full. Its summary (about 1,400 words, each statement citing file and line) found no pin that ACD breaks. It found one per-prefix table that did not cover ACD: `t35.test.mjs`'s `MINTED`, extended below.

**Entry applied: T42-2a** (RECORD-GRAMMAR #13 J3; K2616, K2617).
- R62: `MINTED_OBJECT` gains `ACD: "case account draft"` (`index.mjs`:106–112). So `mintExhausted("ACD")`'s detail names a case account draft.
- R76: needed no code change. `OPAQUE_PREFIXES` is read from `ID_TABLE` (`index.mjs`:117), and minting follows `form` alone. So `ACD` is minted opaque with a 16-character tail, recorded in the ledger, and its counter is neither read nor stepped. Its four-digit ids minted since T41 stay valid through `idPattern`, and stay spent in the ledger. Comments updated (`index.mjs`:19–22, :114–116).
- Tests:
  - `t33.test.mjs`:69 (R76) and :162 (R62) are re-pinned with `ACD` (plan rule 4 (11)).
  - New test at `t33.test.mjs`:177 (R76 R62, T42), for `ACD` by `allocId`, `allocIdOp` and inside a transaction:
    - it is minted opaque, and a legacy `mintOpaqueId` id is still read and stays spent;
    - a stray `ACD-2026` counter is untouched;
    - 64 hits answer `MINT_EXHAUSTED`, naming a case account draft, and nothing is written;
    - `extra` never replaces the sentence;
    - negative controls `ACDX`, `XACD` and `acd` are minted by the counter and named by no object.
  - `t35.test.mjs`'s `MINTED` (R82 R62) gains `ACD`.
- Negative control (K874): with `ACD` removed from `MINTED_OBJECT`, `t33.test.mjs` went to 32 pass, 2 fail (the R62 test and the new R76 R62 test). Restored, it is 34/34.

**Deferred:** nothing. **Found in other modules:** nothing new; no generated artifact staled beyond rule 4 (10)'s bundles.

**Tests and checks:**
- `node --test test/m/record-core/record-core.test.mjs`: 99 pass, 0 fail
- `t33.test.mjs`: 34 pass, 0 fail
- `t35.test.mjs`: 32 pass, 0 fail
- `node test/stats-disclosure.test.mjs`: 31 pass, 0 fail
- Layer tests: none (manifest).
- Users' suites: every `tests` path of the 94 modules that use record-core (1,055 files, run from the repository root): 7,768 tests, 7,746 pass, 11 fail, 11 todo. Every red is inherited and none is this job's:
  - two are not tests: the runner was handed the fixture data files `test/fixtures/cpdf20/tier2-recorded.json` and `test/fixtures/row-census-1.68.0.jsonl`, which `modules.json` lists among tests paths;
  - rule 4 (5), `MODULE_ORDER` lacks `doorbell` and `case-account`:
    - `membership/module-order.test.mjs`:13 and :107
    - `membership/t9-notice-sight-bounds.test.mjs`:161
    - `progressions/order.test.mjs`:16
    - `promotion/registry.test.mjs`:58
    - `standards/reads.test.mjs`:200
  - rule 4 (6): `answer-envelope/catalogue-end.test.mjs`:17, the pins for `NO_SUCH_PROPOSAL` and `PROPOSAL_NO_RUN`;
  - rule 4 (7): `test/system/migrate-released.test.mjs`, the `ai_ceilings` arm (584 pass, 1 fail);
  - rule 4 (2): `test/system/row-census.test.mjs` R50, 180 rows awaiting stamp, none of them this module's (no C-59, C-102, C-75 or C-132 row moved).
- Checks:
  - `format`: 147 modules, 146 requirements files; 0 failures
  - `architecture`: 8 product files, 16 relative imports; 0 failures
  - `coverage`: 82 of 82 live requirement ids named by a test; 0 failures
  - `ownership`: 4 files changed by record-core between tranche/T42 and HEAD; 0 failures

Size (session_013PmyJwtkkmXmvfs4xFhWb6): test runs 7, module lines 2296
