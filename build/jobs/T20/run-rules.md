# run-rules (T20)

**Status** · session_0112QZ3U15TqSZXGMXDLiA7V · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Job done on `job/T20/run-rules` (pushed, `68a25f397b`). Comments only; no behaviour, export or requirement changed.

**Entry applied** (`build/plan/current.md` L6, B1; K882, K820's share):
- `src/run-rules/rules.mjs` header (:1–3): `src/airun.mjs` is named as the file this was copied from at the split and deleted by ai-runs' T19 job (4079317043), no longer as one "ai-runs' job reduces to a re-export". The account below is marked as provenance (layers.md rule 6).
- `rules.mjs` N49 note (:103–108): the observation-log re-export is kept and its reason re-worded. `airun.mjs` is deleted. The re-export stays for readers that still take those names here (run-rules' Uses), e.g. `agent-worker/test/harness.test.mjs`:113 (`OBSERVATION_LEVELS`, `OBSERVATION_STATES`).
- `checks.mjs` ARM D3 passage (:220–227): the pure check modules and the open's door are named as then (`src/airun.mjs`/`src/skillpack.mjs`; `store.mjs`) and today (this module's `rules.mjs`/`skill-version.mjs`; ai-runs' open).
- Re-scan of my paths: the only live `airun.mjs` claims were those. The rest is provenance and stays: `rules.mjs`:309 and `checks.mjs`:221 name `airun.test.mjs` arms, an old suite deleted at legacy-tests' L11 job (K879). Same file, two related fixes: `checks.mjs`:5 now says ai-runs' copy *was* deleted (past tense), and `rules.mjs`:59 names `#aiRunTerminate` as `ai-runs`' (formerly `store.mjs`'s).

**Deferred:** other `store.mjs` / `queuestate.mjs` mentions in `rules.mjs`' and `checks.mjs`' historical account are left as they are. These are `rules.mjs`:9–14, 40, 161–163, 282, 338, 485 and `checks.mjs`:247–271, 324–331. They describe the tree where each item was measured. Re-pointing each one to its current owner (ai-runs, promotion, extraction) is outside B1's entry. Say if you want it as a CHANGE.

**Found in other modules (REPORT):**
1. **Generated artifact staled:** `agent-worker/dist/agent-worker.bundled.mjs` / `.bundle.json` (owner `agent-worker`). `fleetbundles.test.mjs` names `run-rules/checks.mjs` and `rules.mjs` as STALE. The bundle carries comments, so its bytes move too. The plane bundle (`not_product`) reads the same files. Regenerate both at layer close (`node bio-plane/scripts/bundles.mjs`). I did not write either (§14). The same suite's "153 inputs are all recorded" arm also failed in my run. It lists 13 inputs, observation-log's and run-rules' among them. I did not judge whether it is red on the base.

**Tests and checks run:**
- `node --test bio-plane/test/m/run-rules/`: tests 16, pass 16, fail 0.
- `node --test agent-worker/test/harness.test.mjs` (reads run-rules): pass 1, fail 0.
- `bio-plane/test/system/fleetbundles.test.mjs`: agent-worker staleness arms fail (item 1); ocr-worker and pdf-worker pass.
- Layer tests: none named in the manifest.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … run-rules`: 10 product files, 15 relative imports; 0 failures.
- `node checks/coverage.mjs … run-rules`: 15 of 15 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … run-rules tranche/T20`: 3 files changed by run-rules; 0 failures.

Size (session_0112QZ3U15TqSZXGMXDLiA7V): test runs 3, module lines 1686
