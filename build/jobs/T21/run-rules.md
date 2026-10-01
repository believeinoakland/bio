# run-rules (T21)

**Status** · session_019rgbfwYubuJMAvZL9Yzmt9 · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** N469 (K931), comments only; no behaviour, export or test changed.
- `rules.mjs` (live, re-worded): the gate-before-bounds claim now names `agent-worker/test/harness.test.mjs` A6 alone (`skillsequencing.test.mjs` ARM D4 deleted); the A6b note says what A6b asserts today (the gate's endings against `RUN_ENDINGS`, behaviourally, since N421) instead of "reads THIS FILE as text"; `RUN_STATUS`' partition is pinned by `test/m/run-rules/rules.test.mjs` R1 (was `airun.test.mjs` ARM H3); the shape notes on `RUN_STATUS`, `STANDARD_BASIS` and `RUN_CONTEXTS` name `rules.test.mjs` R1 as what holds each sentence vocabulary to DEC-49's shape (was `check-refusal-codes.mjs` arm E, now named only as history); `projectGate`'s literal-code note names `table.test.mjs` R11 and control-plane's `families.test.mjs` R22. Also found on my re-scan and re-worded: `PLANE_COUNTED_BOUNDS`/`PLANE_DECIDED_BOUNDS` claimed `rec169-consume.test.mjs` ARM C holds the list (deleted in T20) — now `rules.test.mjs` R3 and R13, the census kept as history.
- `checks.mjs` (re-scan): the C-36 note's instruction to run the UI harness (`civicos-ui/test/run.mjs`, whose collision guard was `check-refusal-codes.mjs`) now names `table.test.mjs` R11 for one C-number per condition; the C-33.29 note's present-tense "arm C now grades / no longer judges" made past and marked as the deleted guard's history; the C-22 pure-site invariant ("load-bearing") names `table.test.mjs` R11 as what holds it now.
- `deployment.mjs` (re-scan): "the suite" was `skillsequencing.test.mjs` (deleted): the order-to-`MODES` pairing now names `agent-worker/test/requirements.test.mjs` (its R44, R53), `GATE_ADDRESS` and `verification_recorded` name `deployment.test.mjs` R9; the document look-ups and per-clause measurement are stated as done when written (SK-4), with no module test reading the documents today.
- Provenance kept as BOB listed: `checks.mjs` ARM D3 "failed it", `check-refusal-codes.mjs` "then FAILED all three", the floor "moved in the same turn", `mintid.mjs`; `rules.mjs` :677, :713 ("failed the harness"), `vf4-live-scratch.mjs`.

**Deferred.** None.

**Found in other modules.**
- Generated artifacts staled by this change (comments in bundle inputs): `agent-worker/dist/agent-worker.bundled.mjs` (+ `.bundle.json`) and the plane's `bio-plane/dist/bio-plane.bundled.mjs` (+ `.bundle.json`). Not regenerated (mechanics §14).
- `legacy-ui`/`legacy-tests`: `civicos-ui/test/run.mjs`:88 still runs `../check-refusal-codes.mjs`, deleted in T20, so that harness fails at that step.

**Tests and checks.** `node --test test/m/run-rules/`: tests 16, pass 16, fail 0. `format`: 86 modules, 84 requirements files; 0 failures. `architecture run-rules`: 10 product files, 15 relative imports; 0 failures. `coverage run-rules`: 15 of 15 live requirement ids named by a test; 0 failures. `ownership run-rules tranche/T21`: 4 files changed; 0 failures.

Size (session_019rgbfwYubuJMAvZL9Yzmt9): test runs 1, module lines 1,701

## J1 · REPORT

Generated artifacts staled by my comment-only change (bundle inputs): agent-worker/dist/agent-worker.bundled.mjs (+ .bundle.json) and bio-plane/dist/bio-plane.bundled.mjs (+ .bundle.json); not regenerated. Also found: civicos-ui/test/run.mjs:88 still runs ../check-refusal-codes.mjs, deleted in T20 (legacy-ui/legacy-tests).
