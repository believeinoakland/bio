# sheet-worker (T51)

**Status** · session_0146e1miQoZPGsfEUPCQQNPY · depth 2 · WORKING · handled B2

## J1 · REPORT

The words change stales another module's generated artifact. My change to `sheet-worker/src/contract.mjs` (its refusal sentences now read through `localize`) is an input of bio-plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` no longer matches its source. The fleet gate (`bio-plane/test/system/fleetbundles.test.mjs`) reports `STALE BUNDLE — the source ../sheet-worker/src/contract.mjs has changed`. I did not rebuild it: mechanics §14 says never write another module's artifact. Request: BOB rebuilds bio-plane's bundles (`node bio-plane/scripts/bundles.mjs`) at this layer's close or by a ruling.

The same gate also lists stale bundles that name sources I did not touch (`court-doctypes/common.mjs`, `doctypes/*`, `jurisdictions/index.mjs`, `roster-reader/org-chart.mjs`, `src/civil-time/*`, `src/connection-grammar/*`, `src/idspaces.mjs`, `src/record-grammar/bundle.mjs`, `src/subresources.mjs`, `src/calc-grammar/recipe.mjs`). Those predate this job. The sheet-worker bundle arms all pass.

## J2 · COMPLETE

**Entries applied.** T51-261, the nine `plain` findings in `build/plan/words-pass/sheet-worker.md`, each judged against the words rule. All nine are sentences a member reads, so each is read through `localize` under a `sheet-worker.<file>.<slug>` id, fixed once:
- `contract.mjs`: `store_must_be_named_this` (BAD_STORE), `no_capture_with_that_sha_in` (NOT_FOUND), `the_engine_did_not_load` (ENGINE_ABSENT), `the_workbook_is_larger_than` (OVER_BOUND), `the_workbook_refers_to_other` (EXTERNAL_LINKS), `the_engine_refused_or_failed` (ENGINE_FAILED), `loading_the_workbook_took_longer` (TIME_LIMIT).
- `member.mjs`: `sheet-worker.member.the_engine_refused_the_workbook` and `sheet-worker.member.the_engine_failed_while_evaluating`.
The sentences reach the caller as the refusal's `detail` and `why`, so none is text no member reads, and no REPORT for the `unkeyed` list is needed.

**Test.** One new test in `test/sheet-worker.test.mjs` names all nine ids in its title (K874) and drives each refusal it can reach through the interface. It asserts `hasWord` nowhere: the rows regenerate at the layer close (`localize` answers `en` until then), so the id checks become assertable then.

**Deferred.** Nothing.

**Found in another module.** My change stales `bio-plane`'s bundle; see REPORT J1. No other module's flaw found.

**Commit.** `6ec734b4f7` on `job/T51/sheet-worker`, pushed. No pull request, per the job role.

**Tests and checks** (the process repository, `/home/user/bio` as product):
- `node --test test/` in `sheet-worker`: 37 tests, 37 pass, 0 fail (the suite includes the words test and the committed bundle booted under workerd).
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio sheet-worker`: 0 failures.
- `node checks/coverage.mjs /home/user/bio sheet-worker`: 17 of 17 live requirement ids named by a test, 0 failures.
- `node checks/run.mjs /home/user/bio`: no finding names `sheet-worker` (the words check's plain count for this module went from 9 to 0). The run's other findings are other modules' and predate this job.
- `node checks/ownership.mjs /home/user/bio sheet-worker tranche/T51 job/T51/sheet-worker`: 6 files, 0 failures.
- `bio-plane/test/system/fleetbundles.test.mjs`: fails on the stale bio-plane bundle (REPORT J1); the sheet-worker arms pass.

**Size (session_01QtpnxHgL1z6PkC9WuixPrM): test runs 2, module lines 1901.** Module lines count `sheet-worker/src`, `test` and `scripts` (843 + 935 + 123); the vendored wasm, the Rust engine and the generated bundle are not counted.

## J3 · COMPLETE

**Entries applied.** B2 (the words round RW, K4015/K4018 folded): the one finding `checks/words.mjs sheet-worker` lists at e8ac153 (civicos-process main), `sheet-worker/src/contract.mjs` `REFUSALS.NOT_ENABLED`, a sentence a member answers (`reason: NOT_ENABLED`, with its `detail`), built as a `+` chain of string literals. It is now `localize("sheet-worker.contract.recompute_is_not_enabled_here", en)`, one literal, same wording. The id follows the `sheet-worker.<file stem>.<slug>` rule and is fixed once.

**Test.** The words test in `test/sheet-worker.test.mjs` now names the new id in its title (K874) and asserts the refusal's `detail` equals `REFUSALS.NOT_ENABLED` for an instance with the setting off, read before any bytes are read. No sentence text is copied in the test.

**Bundle.** `sheet-worker/dist/sheet-worker.bundled.mjs` and `.bundle.json` regenerated with `npm run build` in `sheet-worker/` (this module's own artifact). `npm ci` ran there first (the module had no `node_modules`; `miniflare` was missing, so `worker.test.mjs` could not load until then).

**Deferred.** Nothing.

**Found in another module.** `bio-plane/dist/bio-plane.bundled.mjs` inlines `sheet-worker/src/contract.mjs`, so it is stale again with this change (it was already stale from J1's REPORT). Not rebuilt here (mechanics §14). BOB regenerates it at the layer close. `build/plan/...` setup-words' `rows.mjs` is stale by the new word, as expected; not regenerated (never edited by a job).

**Tests and checks** (the process repository at `e8ac153`, `/home/user/bio` as product):
- `node --test test/` in `sheet-worker`: 37 tests, 37 pass, 0 fail (after `npm ci`).
- `node checks/words.mjs /home/user/bio sheet-worker`: 882 string literals read; inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, unkeyed 0; 0 failures (was 1 `plain` at this round's start).
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio sheet-worker`: 36 product files; 0 failures.
- `node checks/coverage.mjs /home/user/bio sheet-worker`: 17 of 17 live requirement ids named by a test; 0 failures.
- `node checks/run.mjs /home/user/bio`: no finding names `sheet-worker`. The run's other findings are other modules' and predate this job.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note names the new word, as expected; no refusal naming `sheet-worker`.
- `node checks/ownership.mjs /home/user/bio sheet-worker tranche/T51 job/T51/sheet-worker`: 5 files changed by sheet-worker, 0 failures.

**Commit.** `a618b5f20d` on `job/T51/sheet-worker`, pushed (fast-forward from `cc6f19a2a2`). No pull request, per the job role.

**Size (session_01G7yjQ7EPaZVj42HQyis376): test runs 4, module lines 1904.** Module lines count `sheet-worker/src`, `test` and `scripts` (the vendored wasm, the Rust engine and the generated bundle are not counted).

## Fix round 9 (T51) · job 44 · G124 quotes · SHEET-WORKER #5

**Entry applied.** R14 (amended by BOB, K4840): `MAX_UNZIPPED_BYTES`, `MAX_CELLS` and `TIME_BUDGET_MS` in `sheet-worker/src/contract.mjs` are now `boundOf("sheet_worker", "bytes")`, `boundOf("sheet_worker", "cells")` and `boundOf("sheet_worker", "ms")`; no numeric literal of the three remains in the member. The three rows already existed in `bio-plane/src/read-bounds.mjs` (kind `sheet_worker`, names `bytes`, `cells`, `ms`; keys `limit.sheet_worker.bytes|cells|ms`; figures 9,000,000 / 250,000 / 120,000, all three columns equal; the bytes row's standard and protective are 52,428,800 (K4845)). `/version`'s `bounds` still reports them through `member.mjs`. Refusal behaviour is unchanged. The sheet-worker module takes a `uses` edge to runtime-limits (already in `modules.json`). The member's configuration still declares `cpu_ms=300000`.

**Failing first.** New test `R14: the three bounds are the READ_BOUNDS rows of the sheet worker, read through boundOf, typed nowhere else in the member, and reported by /version` (equals the table through `boundOf`; greps `src` comment-stripped for the three literals; `/version` bounds; control: exactly 250,000 cells is not `OVER_BOUND`, 250,001 is, naming 250001 and 250000).
- RED: `AssertionError [ERR_ASSERTION]: contract.mjs types a literal matching /\b9[_,]?000[_,]?000\b/`
- GREEN after the change: `node --test --test-force-exit test/` in `sheet-worker/`: tests 38, pass 38, fail 0, skipped 0.

**Deferred.** Nothing. **Words.** No new sentence; nothing owed to T52.

**Found in another module.** Stale generated artifacts from this change (BOB regenerates, not rebuilt here): `sheet-worker/dist/sheet-worker.bundled.mjs` and `.bundle.json` (the bundle now inlines `bio-plane/src/read-bounds.mjs`; the member's bundle inputs may need that file listed by bundler), and `bio-plane/dist/bio-plane.bundled.mjs` (inlines `contract.mjs`). `workerd` tests in `worker.test.mjs` ran against the committed bundle and passed.

**Checks** (process repo, product `/home/user/bio`): `node --test` as above; `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 46 of 176, workbooks 9/9, sheet-worker 3/3 (control-plane 83/96 and plane 65/81 are the round's carried reds); `format`: 0 failures; `architecture sheet-worker`: 0 failures; `coverage sheet-worker`: 17 of 17, 0 failures; `ownership sheet-worker tranche/T51`: 3 files changed, 0 failures; `checks/run.mjs`: no finding names `sheet-worker` (the failures are other modules'); `setup-words build.mjs --check`: stale-rows note only.

Size (session_015vsvGpKy672zBH3KSU5T3u): test runs 3, module lines 1930

## J4 · COMPLETE

R14 applied: the three bounds are boundOf('sheet_worker','bytes'|'cells'|'ms') in contract.mjs, no literal left. Red seen then green (38/38). Impact: workbooks 9/9. format, architecture, coverage, ownership 0 failures. Stale for BOB to regenerate: sheet-worker bundle (now inlines bio-plane/src/read-bounds.mjs; check bundler's input list) and the plane bundle. No new files outside paths. Record: build/jobs/T51/sheet-worker.md.
