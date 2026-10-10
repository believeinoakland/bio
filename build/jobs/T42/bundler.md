# bundler (T42)

**Status** · session_01X5bkceFD2GHGbfimdSRiKL · depth 2 · COMPLETE · handled B1

## Completion (BUNDLER #14)

**Reading set** (mechanics §17): measured at the START as 226 KB, under 300 KB. Read whole: `build/requirements/bundler.md`; `build/manifest.md` (with "Generated artifacts"); the plan's entry T42-2 and its rule 4; K2513, K2520, K2547, K2607; `layers.md`'s "Helper modules"; `bio-plane/scripts/fleet-bundle.mjs` (the whole file the entries change); `bio-plane/test/system/fleetbundles.test.mjs` (the whole suite the entries change); the head of `test/fleetbundles.control.mjs` (its baseline is read at run time, so it pins no tally this job moves). The release, deploy and version scripts and their suites are untouched by T42-2 (no service of theirs changed). I read them only as far as their run, not whole; I state this rather than claim the full module was read.

**Entries applied (T42-2).**
- **N836** (K2520 (a); clears plan rule 4 (8)). The `fleetbundles.test.mjs` pin (was line 243) is re-pinned 23 → 25 from the committed manifest `agent-worker/dist/agent-worker.bundle.json`. The two arrivals, run-rules' `test-bar.mjs` and `test-set.mjs`, are named in the re-pin note. The test keeps its purpose: a census of the member's build inputs, by name. Green.
- **N840, R31** (K2547). `fleet-bundle.mjs` gains `BUDGET` (`sizeWarn` 32 MiB, `sizeFail` 48 MiB, `startWarnMs` 500), `MIB`, `sizeVerdict`, `startVerdict`, `measureStart` and `budgetReport`. `fleetbundles` section 9 runs `budgetReport` on every guarded member and on the plane, prints one line per member (bytes, MiB, global-scope ms, verdicts) and prints each warning as `WARN`. Only a size past 48 MiB, or a size or start-up left unmeasured, fails.
  - **How start-up is measured.** A fresh import in the test process (`?r31-fresh=` URL; Node `module.registerHooks`, registered for the one import and then removed). `cloudflare:*` imports are answered by a stub that exports the names the artifact imports. Upload parts (wasm, data) are compiled or read before the clock starts and handed in as the platform hands them. Every member, the plane included, imports in Node, so all of them are measured and nothing is left to a "warn-only" arm. The timed window covers load, parse, link and global-scope evaluation. Node is not workerd, so the time is a warning and never a failure.
  - **R31 tests**, each with its own title: the budget values; a check that every member and the plane are measured; and section 9a, the negative control (K874) on synthetic artifacts. In 9a: past the fail budget fails, naming the member, size and budget; warn-only warns; within both budgets passes; the boundaries are strict (48 MiB exactly warns, +1 B fails; 32 MiB passes, +1 B warns); a slow global scope warns but never fails; the stubs and parts reach the global scope; every measurement is fresh (the global scope re-runs); the hooks are removed afterwards; a throwing artifact and a missing one both fail as unmeasured.
- No bundle was rebuilt or committed.

**Figures at this job** (one run on this container):

| member | artifact | global scope |
| --- | --- | --- |
| agent-runner | 60,742 B | 4 ms |
| agent-worker | 260,281 B | 12 ms |
| file-scanner | 176,410 B | 8 ms |
| ocr-worker | 301,738 B | 20 ms |
| pdf-worker | 2,465,783 B | 56 ms |
| sheet-worker | 26,160 B | 2 ms |
| **bio-plane** | 15,864,823 B (15.1 MiB) | **743 ms: WARN** |

Across six runs the plane read 441–1,359 ms, the spread coming from machine load. A CPU profile puts about 380 ms of each import in compiling the 15 MiB source (`compileSourceTextModule`) and about 60 ms in evaluating the global scope.

**Deferred.** None.

**Found (REPORT J1).** The plane's start-up is past R31's 500 ms warning on this container, and some runs pass the platform's 1 s. Compiling its size dominates, not its global scope. K2547 makes splitting the plane Bob's architecture question; this is BOB's to weigh with the size watch. One caveat: Cloudflare measures start-up in workerd, not Node, so the platform's own figure may differ. A `wrangler deploy --dry-run` measurement is the next release's (plan T42-2).

**Ran.**
- `node --test bio-plane/test/system/fleetbundles.test.mjs` (after `npm ci` in agent-runner `--ignore-scripts`, sheet-worker, and file-scanner `--ignore-scripts`): `fleetbundles: 149 pass, 0 fail`, no SKIP.
- `node --test bio-plane/test/m/bundler/*.test.mjs bio-plane/test/system/{bundle,deploybindings,resolveversion}.test.mjs`: tests 94, pass 94, fail 0.
- No layer tests are named in the manifest. No provided service changed for an existing user: the additions are new exports, and fleetbundles is their only caller.
- Checks: `format` 0 failures; `architecture` bundler 0 failures; `coverage` bundler 31 of 31; `ownership` 0 failures (after the commit; see the commit).

Size (session_01X5bkceFD2GHGbfimdSRiKL): test runs 4, module lines 3441

## J1 · REPORT

R31 finding (K2547's watch): the plane's global scope measures past R31's 500 ms warning here: 743 ms in the recorded run, 441-1,359 ms across six runs, some past the platform's 1 s. A CPU profile puts ~380 ms per import in compiling the 15 MiB source and ~60 ms in evaluating it, so size drives it. Measured in Node, not workerd; the platform's own figure is the next release's (wrangler --dry-run). Splitting the plane is Bob's question (K2547); yours to weigh. Every other member is under 70 ms and 2.5 MiB.
