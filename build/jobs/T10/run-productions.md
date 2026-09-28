# run-productions (T10)

**Status** · session_01N19VtRvKJmmaLr694g6DFG · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied**
- **N194.** `interim.mjs` is deleted: its `ai_runs`/`ai_run_bounds` SQL arm had no caller, since the store already hands in `aiRunsOf(ctx, env)`. `runProductionsOf` now reaches ai-runs through its factory, `aiRunsOf(host)`, when none is given (K61), as it does its other uses. A run is read only through ai-runs R28's `runFor`, and a bound through R29's `boundOf` and `consumeBound`. In legacy-store I rewired `store.mjs` under §12.2: the import drops `runProductionsInterim`; the creation passes `{ aiRuns: aiRunsOf(ctx, env) }` only; and `#aiRunInSight` is removed, because its only reader was the interim hand-over. Ownership lists 2 lines added and 5 removed.
- **N201, my share.** New test "R10, R11 (N201)" in `extract.test.mjs`. It covers:
  - `TEXT_CHAIN_STRENGTHENS` returned with text-chain's sentence;
  - `NO_PROPOSALS` with its sentence (it belongs in the run's log), with nothing written on either;
  - at the op, a cap equal to the chain's (C) and a weaker one (D) both land. The step carries the claimed cap, and the chain's cap is computed (D);
  - the listing's `basis` carries the stored chain and its sentence;
  - a production moves only `proposed_readings` and `content`. The fixture now creates extraction's own tables, and `readings`, `reading_refs` and the rest are untouched.

  The `mints` budget ending a run stays untestable until extract deploys (ai-runs R40), as N201 says.
- **N165, my share.** This is the statement N165 asks for. A run's suggested legs pin their capture: each document leg carries `extent_capture` (R9, D-595). It is the capture the leg names, when the record holds that capture for the document (checked through `content.captureFor`); otherwise it is the capture the record presents now. A question leg carries none, and a named capture the record does not hold is `SUGGEST_LEG_UNREACHABLE`. The holder is the question the version is written to: its legs are basis-version legs of that inquiry, written through basis-versions' `appendVersion`, which is where reevaluation R14's raise reads a basis leg's holder. The code and the test "R9: …" already met this on the tranche. **R9's `not yet met: T10` mark can be struck.**
- **Improvement (K313, K316).** The fixture now answers at the plane's shape. `sql.exec` returns a cursor, and it refuses a LIKE/GLOB pattern over 50 bytes. It also records every pattern it runs. New test "R12 (K313)": the ratio's machine-credential pattern stays within the cap. All earlier tests pass on the new fixture.
- K61 test rewritten: "K61, R18 (N194)". A provider not given is ai-runs' own instance (`aiRunsOf`), and it is driven through the real module: an unopened run is `SUGGEST_NO_RUN` and `NO_SUCH_RUN`.

**Deferred:** none.

**For BOB (other modules, requirements)**
- R13's mark ("the rows are C-104 … the job marks the regions they name and drives them") looks met. C-104.1–12 are in the catalogue, each `where` names a region marked in `index.mjs`, and "R16: …" drives every row with its check and translation. The mark can be struck.
- legacy-tests: run-conditions' W6 (the dead `interim.mjs` arm) now has no file to read. It needs re-anchoring or retiring. That is legacy-tests', reported, not touched.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale, because `store.mjs` and `run-productions/` changed. It is reported, not rebuilt.

**Tests and checks**
- `node --test bio-plane/test/m/run-productions/`: tests 35, pass 35, fail 0, todo 0.
- `node --check bio-plane/src/store.mjs`: ok. The store cannot load under plain node because of `cloudflare:` imports.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `checks/architecture.mjs run-productions`: 7 product files, 38 relative imports; 0 failures.
- `checks/coverage.mjs run-productions`: 19 of 19 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs run-productions tranche/T10`: 7 files; legacy-store 2 added, 5 removed; legacy-checks 0/0; 0 failures.

Size (session_01N19VtRvKJmmaLr694g6DFG): test runs 7, module lines 1040
