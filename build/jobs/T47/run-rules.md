# run-rules (T47)

**Status** · session_01VsBmbSSGdjn5TmTXq5yUur · depth 2 · COMPLETE · handled B0

## Completion (RUN-RULES #14)

**Read, whole (P20).** My requirements (R1–R32, public and private); the public parts (Purpose, Provides) of `record-grammar` and `observation-log`; layer 6's contract and its split sections in `build/layers.md`; the plan's T47 header, rules at the opening and my entry T47-71; my code (`index.mjs`, `rules.mjs`, `deployment.mjs`, `checks.mjs`, `test-bar.mjs`, `test-set.mjs`, `skill-version.mjs`) and all my tests (`helpers.mjs`, `words.mjs`, `rules`, `deployment`, `state`, `verification`, `ask`, `t41`, `t45`, `t46`, `table`); `words.json` on `main` (identical on `tranche/T47`) for `refusal.MEMBER_RUN_MODE_NOT_ADMITTED` (DEC-198) and R31's three keys. My module reads nothing from `registry.json`, so DEC-198/DEC-199's changes there touch nothing here.

**Applied** (commit 6ed66ab0d3):
- **R32** (T47-71; N992; DEC-198): `RUN_RULES_WORDS` gains `refusal.MEMBER_RUN_MODE_NOT_ADMITTED`, `words.json`'s `en` verbatim; the C-22.30 row's `translation` reads it by key, as R31's rows do. T46's interim sentence is gone. Code, number and `where` are unchanged. Headers in `checks.mjs` and `index.mjs` now say so.
- Tests: `t46.test.mjs`'s R32 test re-pinned to the key, with the interim sentence's absence as its control. R31's test pinned `RUN_RULES_WORDS`' keys to exactly two; it now pins three, R32's last. R31's own assertions are unchanged. This clears my inherited red (rule 5 (7a)).

**Flaws in my module.** None found on the whole read.

**Deferred.** None. R32's changed translation waits for T48's promotion stamp, as R32 says (rule 5 (2)); that is not mine to do.

**Found in other modules.**
1. **`agent-worker`'s generated bundle, staled by this change** (mechanics §14; I did not write it): `agent-worker/test/requirements.test.mjs` R45 ×2, "STALE BUNDLE": `run-rules/checks.mjs` and `index.mjs` are inputs to `dist/agent-worker.bundled.mjs`. To be regenerated at L6's close (`node bio-plane/scripts/bundles.mjs`) or by AGENT-WORKER's job. The plane bundle is staled the same way, which rule 5 (4) already covers.
2. Users, compared with a baseline worktree at this branch's unchanged head: the same failures on both sides, none caused here. ai-use 62/6, ai-runs 92/6, question-explorer 31/1, answer-envelope 32/1, plane 221/2 (the inherited reds of rule 5).

**Tests and checks** (on `job/T47/run-rules`):
- `run-rules`: before the change 59 pass, 1 fail (R32, the inherited red); after it 60 pass, 0 fail.
- Users (P11, a provided row's translation changed): run-productions 58/0, capture-requests 108/0, skills 117/0, case-disclosures 97/0, action-plans 79/0, migrate-released 1/0, agent-harness 33/0; ai-use 62/6, ai-runs 92/6, question-explorer 31/1, answer-envelope 32/1 and plane 221/2 all fail exactly as on the baseline; agent-worker `requirements` 300/2 (R45 ×2, item 1 above).
- `format`: 166 modules, 0 failures. `architecture run-rules`: 18 files, 0 failures. `coverage run-rules`: 32 of 32 live ids named, 0 failures. `ownership run-rules tranche/T47`: 4 files, 0 failures.
- `checks/run.mjs` over the product: format 0 and architecture 0 failures (3071 files); coverage 44 failures, none of them run-rules' (other modules' ids not yet met, rule 5 (1)); channels 0.

Size (session_01VsBmbSSGdjn5TmTXq5yUur): test runs 7, module lines 4221

## J1 · COMPLETE

Complete (commits 6ed66ab0d3, 97a09258c5). R32: refusal.MEMBER_RUN_MODE_NOT_ADMITTED (DEC-198) joins RUN_RULES_WORDS verbatim and the C-22.30 row reads it by key; T46's interim sentence is gone; code, number and where unmoved. t46.test.mjs R32 re-pinned to the key (R31's key-list pin now three). My inherited red is cleared: run-rules 60/0. format, architecture, coverage 32/32 and ownership clean; run.mjs shows no run-rules failure. REPORT: agent-worker's generated bundle is staled by this change (requirements.test.mjs R45 x2, STALE BUNDLE, run-rules being an input). It is regenerated at L6's close or by AGENT-WORKER's job; I did not touch it. The other users fail exactly as on the baseline, so nothing new. My module reads nothing from registry.json. Details in my record.
