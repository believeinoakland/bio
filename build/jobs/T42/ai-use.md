# ai-use (T42)

**Status** · session_01AMQaBZVH3bFkd2cy8mBiz3 · depth 2 · RUNNING until 2026-10-11T02:49:25Z (migrate-released system suite; reader worker) · handled B0

## Completion (T42-17; N848, N831; K2592, K2620; B1)

**Read whole (the reading set is 367 KB, over 300 KB; K2304):** `requirements/ai-use.md`; layer 6's row of `layers.md`; `plan/current.md`'s T42-17 and rule 4; K2592, K2620 (and K2608); `draft-T42-reqs.md` N831 and N848; credentials R62 and its code (`accountUsesOf`, `#usesAnswer`); `migrate-released.test.mjs`'s shape arms; the code this entry changes (`index.mjs`, whole; `schema.mjs`) and the tests it builds on (`fixture.mjs`, `limits.test.mjs`, `explore.test.mjs`). One worker read the rest in full and wrote a summary citing file and line (about 7 KB, over 263 KB read): `checks.mjs`, `counting.test.mjs`, `reads.test.mjs` and the Public parts of the seven other used modules. It found nothing that depends on `ai_ceilings` after migration or on the old explore read.

**Applied:**
1. **R2 (N848):** `#carryCeilings` carries once, as before, and then runs `DROP TABLE IF EXISTS ai_ceilings` every time `migrate()` runs (`index.mjs`, `#carryCeilings` / `#carryCeilingsOnce`). The table is dropped in the same migration as the carry. A store whose carry already ran drops it at its next migration and carries nothing again. Idempotent. `ai_ceilings` was never declared to record-core, so no declaration changes.
2. **R3, R6, R9 (N831, K2620):** `#exploreOf` reads `credentials.accountUsesOf({owner})` with no viewer. It no longer calls `accountUses` as `projectOwners()[0]` or `activeAdmins()[0]`. It reads `held === true` (and not `unreadable`) before `uses.explore`, and any other value fails closed to `no`.

**Tests:** `t42.test.mjs` has 5 tests, each named R2 or R3:
- **R2, drop after carry:** after the carry, the table set equals a fresh store's. Control: a table ai-use does not own is kept.
- **R2, already carried:** a store whose carry already ran drops the table and carries nothing again. A second migration changes nothing.
- **R3, the call:** a spy on credentials shows `accountUsesOf({owner})` for group, project and member, and `accountUses` never. Control: a use other than `explore` reads no explore value.
- **R3, fail closed:** each of these reads as `EXPLORE_NOT_ENABLED` through `useCheck`, `exploreAllowed` and `exploreAsk`: held false with `uses` still yes, unreadable, another value, no `uses`, a read that throws. Control: held at yes or ask passes.
- **R3, real credentials:** a group explore set while its key is not held reads as `no` (K2620's shape asserted first), as does a revoked member's account. Controls: held, each passes.

**Negative control (K874):** with `index.mjs` reverted, 4 of the 5 fail. The fifth (the real-credentials one) passes on the old read too, which already checked `held` for these two cases; it stands as a behaviour test.

**Deferred, with why (own module, outside T42-17's entry; the worker's findings, file:line in `checks.mjs`):**
1. `EXPLORE_OUT_OF_SCOPE` (C-143.5, :94–99) and `EXPLORE_ASK_INVALID` (C-143.6, :102–106) are minted but not listed in R8. Their sentences are written in `checks.mjs` with no `words.json` key, against R13's "read by key, never a fallback sentence". `AI_USE_WORDS` (:19–42) is a literal copy of `words.json` sentences, held equal by `reads.test.mjs`:145. Fixing this needs words keys (the design stream's) and R8/R13 text (BOB's). Reported.
2. Sample-only tests in `counting.test.mjs`, left so as not to widen T42-17: :153 (purge checks 3 of 7 tables); :172 (`where` checked by form only); :181 (a count of words). Same for `reads.test.mjs`:201–205 (fail-closed path, two cases).

**Found in other modules:** none caused by this job. The plane bundle is staled by any source change (rule 4 (10)). No `modules.json` edges added.

**Tests and checks** (on `tranche/T42` @ fadb0f8ff1 merged):
- ai-use (`test/m/ai-use/`): `tests 54, pass 54, fail 0`.
- Users (P11): ai-runs 81/0, question-explorer 27/0, answers 58/0, notice-producers 90/0, op-declarations 128/0, store-door 43/0, control-plane 216/0, plane 166/0. answer-envelope 28/1: `catalogue-end.test.mjs`:27 (pins for `NO_SUCH_PROPOSAL`, `PROPOSAL_NO_RUN`). That one is the inherited rule 4 (6), red without this change too.
- `system/migrate-released`: `migrate-released: 585 pass, 0 fail`. "born on 0.80.0: and no table a fresh store lacks" now PASSes, which clears rule 4 (7).
- `format: 147 modules, 146 requirements files; 0 failures`
- `architecture: 8 product files, 26 relative imports; 0 failures`
- `coverage: 1 modules, 13 of 13 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by ai-use between tranche/T42 and HEAD; 0 failures`

Size (session_01AMQaBZVH3bFkd2cy8mBiz3): test runs 16, module lines 1139
