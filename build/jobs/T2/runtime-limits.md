# T2 · runtime-limits — job record

Session: `session_019P3M1pLBD1XzdjzkJULhF6` (RUNTIME-LIMITS #1). BOB: `session_01JwTyEmUPSgvwiHEwzCzoxK` (BOB #41).

**Status** · COMPLETE, 2026-09-26. Branch `job/T2/runtime-limits`, from `tranche/T2` @ 61198693. No open question for BOB. One report (below): two generated bundles this change made stale.

## Entries applied

- **T2-4** · Requirement-named tests for every live id: `bio-plane/test/m/runtime-limits/runtime-limits.test.mjs`, 25 tests, one per id R1–R25 (the Errors clauses are checked inside the service's tests), each at the interface: the exported functions and constants, fresh random tokens, an injected `now` for `cpuProbe`, and the denylist `Set` itself for the published cases (a value's hash is added, then removed). No test reads source text. R5's `iterationsPerStep` default is observable only as work, so it is checked by process CPU time against explicit 1, 2 and 4 million-iteration steps (median of three; stable over ten runs).

## Flaws fixed in this module (step 4)

All in `bio-plane/src/cpu.mjs`; each was caught by its test before the fix (R3, R4, R6, R8 failed on the code as it stood).

- **R3** · `report().segments` was a shallow copy: the per-label objects were the meter's own, so a later call changed an earlier report and editing a report changed the meter. It is now copied down to each segment.
- **R4** · `burn` threw for a Symbol (or an object whose `valueOf` throws) as `iterations`. Anything but a number is now zero iterations.
- **R6 / Errors** · A non-callable `checkpoint` was refused only after the first step had burned (and never when no step ran). It is now a `TypeError` before the clock is read; `cpuProbe()` with no argument gives the same refusal.
- **R8** · `MAX_STEP_REACHED` read the clock a further time, so `elapsed_ms` was not the last completed step's. It is now that step's value (the one its checkpoint recorded), and `0` when no step ran (`startStep` already at `maxStep`), my reading of the case the requirement leaves open.

Deferred: none.

## Found in another module (REPORT)

- **pdf-worker, ocr-worker (generated artifacts, manifest §14)** · Both bundles record `bio-plane/src/cpu.mjs` among their inputs, so this change makes `pdf-worker/dist/pdf-worker.bundle.json` and `ocr-worker/dist/ocr-worker.bundle.json` stale: `bio-plane/test/fleetbundles.test.mjs` fails `verifyStatic` for those two members (source now sha256 `4f39d498…`, built from `71ee7af7…`), while its byte-identity arm still passes for both. Not written by this job; to be regenerated at the layer close (`npm run build` in `pdf-worker/` and `ocr-worker/`).
- **legacy-tests** · no new finding: `bio-plane/test/subresources.test.mjs` reads 355 pass, 2 fail before and after this change (the known N15).

## Tests and checks run

- `node --test bio-plane/test/m/runtime-limits/` · tests 25, pass 25, fail 0 (on the code before the fixes: R3, R4, R6, R8 fail).
- `node --test bio-plane/test/m/` · tests 142, pass 142, fail 0 (includes `subresources`, which uses this module).
- Layer tests: none named in `build/manifest.md`.
- Legacy tests that import `cpu.mjs` or `tokens.mjs`, before and after: `claudecascade`, `daemon-token`, `bundles`, `installer`, `d334-monitor-credential`, `d260-resume` pass both times; `subresources` 355/2 both times (N15); `fleetbundles` passes before, fails after (the stale bundles above). The remaining files naming these modules are live probes and measurement scripts, not run.
- `checks/format.mjs` · 61 modules, 19 requirements files; 0 failures.
- `checks/architecture.mjs` · 2 product files, 0 relative imports; 0 failures.
- `checks/coverage.mjs` · 25 of 25 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs` (tranche/T2) · 3 files changed by runtime-limits between tranche/T2 and HEAD; 0 failures.

## Metrics


## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_019P3M1pLBD1XzdjzkJULhF6,job,runtime-limits,2299856,73672,48,25846,24,16,277
```
