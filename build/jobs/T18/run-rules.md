# run-rules (T18)

**Status** · session_01TcVEvtdrx5ucK3ouUShUnD · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

**Entries applied** (`current.md` layer 6, run-rules; merge early, rule (7)). Code at `job/T18/run-rules` (commit "run-rules: the ai-runs split by copy").
- The split by copy (rule (9), K624 (1)): `airun.mjs` → `bio-plane/src/run-rules/rules.mjs`, `ai-runs/checks.mjs` → `run-rules/checks.mjs`, `deployment.mjs` and `skill-version.mjs` alike, plus `index.mjs` exporting all three faces. `ai-runs`' paths untouched. No `from`, so nothing deleted anywhere.
- The copy's `AI_RUN_CHECKS` now reads observation-log's C-22 rows from `observation-log/checks.mjs`, not the catalogue; the observation-log vocabulary re-exports stay (Uses), from `../observation-log/vocabulary.mjs`.
- Services provided, ready for ai-runs, run-productions, capture-requests, skills and agent-worker: every name in Provides, plus the table's families (`AI_RUN_OWN_CHECKS`, `AI_RUN_ACT_SHAPE_CHECKS`, `AI_RUNS_CONTEXT_CHECKS`, `SURFACE_RUN_CHECKS`, `AI_RUN_OPEN_CHECKS`, new `AI_RUN_PLAN_CHECKS`, and `AI_RUNS_CHECKS`), `SEQUENCING_SOURCE`, `SEQUENCING_ALSO_NAMED_IN`. Import from `src/run-rules/index.mjs`.
- K660: R13 `proposals` after `surfaces` in `RUN_BOUNDS`, plane-counted (`PLANE_COUNTED_BOUNDS` is now mints, surfaces, proposals), with no cap. R14 `order` is check, investigate, extract, plan. `plan` deploys apart through `DEPLOYMENT_SEQUENCE.deploys_apart.plan.deployed` (false). `DEPLOYED_MODES` reads the chain without it and adds it only when that flag is true, so today it is still `["check"]`. R15 adds six rows, C-109.2 to C-109.7 (`AI_RUN_PLAN_REQUIRED`, `_UNEXPECTED`, `_NEEDS_PROJECT`, `_NEEDS_MEMBER`, `_NO_SEARCH`, `AI_RUN_MODE_UNCHECKED`), with `where` set to `src/ai-runs/index.mjs open`, which ai-runs may narrow to a region.
- `not yet met` met: R13, R14, R15 (strike, rule (5)).
- Flaw fixed: `translationOf("__proto__")` (and `constructor`, `toString`) answered `undefined` instead of null. It now uses an own-property test. ai-runs' `airun.mjs` still has the flaw until its job deletes it.

**Readings taken, for BOB to confirm or rule (not blocking):**
(1) C-109.1 `AI_RUN_MODE_NOT_DEPLOYED` stays in this table even though R11's list leaves it out. R9's `enforced_by` names it, and once ai-runs deletes its `checks.mjs` there is no other home for it. ai-runs reads it by key, like the other acts' rows. R11's list could name it.
(2) The planning codes are numbered C-109.2 to C-109.7, in the open's mode family (K107 (3), K385).
(3) `AI_RUN_CHECKS` is observation-log's C-22 rows plus this whole table (R11, read literally). Before, it was C-22 only, so `translationOf` now also answers C-33, C-36, C-66 and C-109 codes.

**Awaiting stamp** (rule (4), for T19's promotion): the rows whose `where` now names `src/run-rules/…`: C-22.5, .7, .8, .11 to .16, and .18. Also the new rows C-109.2 to .7.

**Found in other modules (REPORT):**
- ai-runs, skills, agent-worker: when they re-point to run-rules, their tests that pin the order as check, investigate, extract (`test/m/ai-runs/hidden-notices.test.mjs` R44, `test/m/skills/doctrine.test.mjs`:125) will see `plan` last (R14). Any test holding agent-worker's `MODES` equal to the order in both directions needs `MODES.plan` (not deployed), which is agent-worker's R42/R53. `RUN_BOUNDS` also gains `proposals`. ai-runs' `words.test.mjs` R1 pins the old bound list.
- ai-runs: C-22's `where`s now name run-rules' sites. The six planning rows are ready for its R46/R47.
- legacy-checks: after ai-runs reduces `airun.mjs` to a re-export, the catalogue's C-22 copy may be left with no product importer (K529 or K586 BOB-1, T19).
- Generated artifacts: I made none stale. No bundle takes run-rules yet. agent-worker's bundle will change when it re-points.
- The legacy DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`, run at release only) sees every copied code twice until ai-runs deletes its copy, as K385 describes.

**Deferred:** none.

**Tests and checks:**
- `node --test bio-plane/test/m/run-rules/`: tests 16, pass 16, fail 0 (every R1 to R15 named; each refusal has a negative control; converts: airun's C-22.5 detail, ending sentences and every translation at least 40 characters with `translationOf` for each; skillsequencing's `RUN_ENDINGS` texts; skillpack's R8 note quoting the value). No layer tests are named in the manifest.
- `format`: 82 modules, 0 failures. `architecture run-rules`: 10 files, 15 imports, 0 failures. `coverage run-rules`: 15 of 15, 0 failures. `ownership run-rules tranche/T18`: 11 files, 0 failures.

Size (session_01TcVEvtdrx5ucK3ouUShUnD): test runs 6, module lines 1683

## J2 · COMPLETE

**B2 applied.** Merged `tranche/T18` first. The five `AI_RUN_PLAN_*` rows now have `where` = `src/ai-runs/index.mjs open > is-airun-open-plan, reached from op=airunopen`. `AI_RUN_MODE_UNCHECKED` has `src/ai-runs/index.mjs open > is-airun-open-check, reached from op=airunopen`. These are C-109.2 to C-109.7, still awaiting stamp. R15's test now checks each `where` exactly.

**Tests:** `node --test bio-plane/test/m/run-rules/`: tests 16, pass 16, fail 0.

**Checks:** `format` 0 failures. `architecture run-rules` 0 failures. `coverage run-rules` 15 of 15, 0 failures. `ownership run-rules tranche/T18` 3 files, 0 failures.

Size (session_01TcVEvtdrx5ucK3ouUShUnD): test runs 7, module lines 1683
