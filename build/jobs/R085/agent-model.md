# agent-model (R085)

**Status** · session_01QxtF2G4H6Q337jE4Ti6TBN · depth 2 · WORKING · handled B2

## Completion

**Entries applied** · R085-10: R17 (`report` description states summary, citations and address bounds; `condition` an enum of `returns.conditions` when given), R18 (`converse` `checkFinal`, one hand-back, both paths; helper `finalRefusal` in outcome.mjs), R19 (`role: "subsession"` → claude-sonnet-5-5 at `low`, else `MODEL_FOR_MODE` = claude-opus-5-5 at `medium`; `output_config.effort` on apikey, `effort` on the signin conversation request, also read from a `modelCall` body's `output_config.effort`; neither `thinking` nor `budget_tokens` sent; `MODEL_PRICES` holds both models, source line dated 2026-10-16). Existing R13 tests re-based on Opus 5.5's rates.

**Deferred** · none.

**Found in another module** · `agent-worker/dist/agent-worker.bundled.mjs` (agent-worker's generated artifact) inlines agent-model's source and is now stale: `agent-worker/test/requirements.test.mjs` fails R45 ("static check", "fresh build byte-identical") until agent-worker's `npm run build` is re-run. Not rebuilt here (REPORT). The manifest row for agent-worker's bundle does not list agent-model among its inputs. Also: callers must pass `role: "subsession"` for a check's sub-sessions (agent-worker's job) and the signin `effort` needs agent-runner R32.

**Tests and checks** ·
- `node --test agent-model/test/agent-model.test.mjs`: pass 28, fail 0 (new: R17, R18 ×2 paths, R19)
- `node --test agent-worker/test/` (users of the service): 20 of 21 files pass; `requirements.test.mjs` fails only R45 (the stale bundle above; passes on the unchanged branch)
- format: 170 modules, 169 requirements files; 0 failures
- architecture: 5 product files, 6 relative imports; 0 failures
- coverage: 19 of 19 live requirement ids named by a test; 0 failures
- ownership: 0 failures (re-run after commit below)

Size (session_01Y4GLtKssDutAsJcKsAGcWf): test runs 6, module lines 1000

## J1 · COMPLETE

R17, R18, R19 applied and pushed on job/R085/agent-model. agent-model tests 28 pass; format, architecture, coverage, ownership all 0 failures. REPORT: agent-worker/dist/agent-worker.bundled.mjs inlines agent-model and is now stale (agent-worker requirements.test.mjs R45 static and fresh-build checks fail until agent-worker's npm run build is re-run; I rebuilt nothing). Callers must pass role: "subsession" for check sub-sessions; signin effort needs agent-runner R32. Details in my record.
