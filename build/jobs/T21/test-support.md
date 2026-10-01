# test-support (T21)

**Status** · session_01Khzr9qLc3B6CdyeggE5ntx · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N469 (B1): every note in my paths that named a file T20 deleted as live is re-worded; provenance notes stay.
- `bio-plane/test/sandbox.mjs`: the `hygiene.test.mjs` sentences (process.exit ending; every Miniflare/mkdtemp suite imports the sandbox) now say the file was deleted at T20 and that no test enforces either rule now; a new paragraph says who runs the suites (`node --test`, bio-plane's `npm test` over `test/m/**`, each package's `npm test`, the `regression` workflow); the orphan-sweep paragraph says a SIGKILLed process's directory stays and nothing sweeps it now, the pid in its name letting a cleanup tell dead from live; the probes paragraph no longer claims probes never import it (some do, e.g. `pdf-worker/test/codecs/jpx-memory.probe.mjs`) and names the deleted `tier1-coverage-probe.mjs` as past; the "battery" sentences at the old :63, :71, :76, :111 re-worded (old runner, a test run, a cleanup). D-186, D-282 and the 2026-09-23 run stay as provenance; the `bio-battery-` prefix stays as a name.
- `bio-plane/test/stdio.mjs`: :9–:11 (`hygiene.test.mjs`, `battery.mjs` spawning with pipes) now past tense, adding that `node --test` also reads each file's output through a pipe and that 31 suites and pdf-worker's `runner()` still end with `process.exit`; :17 the tally line; :60 the reader-side fix "would have fixed the old runner"; :75 the deleted `tally-through-pipe.test.mjs` replaced by the module's own R6 and R8 tests, which drive a flooding child through a real pipe.
- `pdf-worker/test/make-pdf.mjs`: re-scanned, no such note.
No rule needed a new test: none of the unenforced rules is a test-support requirement (R1–R9 are all tested). Comments only; no behaviour change, no service changed.

**Deferred.** Nothing.

**Found in another module (BOB's files, reported in J1).** `build/requirements/test-support.md` Satisfies and `build/layers.md` "Helper modules" (:126) still say the sandbox is shared by "the old battery"; the battery is deleted, so the users are now the workers' tests and the kept suites. Two rules lost their guard with `hygiene.test.mjs` and no module owns them: every suite that builds a Miniflare or mkdtemps imports the sandbox, and suites end with `process.exit`. No generated artifact is staled (test files are not bundle inputs).

**Tests and checks.**
- `node --test test/m/test-support/` (bio-plane): tests 25, pass 25, fail 0. Layer tests: none named in `build/manifest.md`.
- `format: 86 modules, 84 requirements files; 0 failures`
- `architecture: 4 product files, 2 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 9 of 9 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by test-support between tranche/T21 and HEAD; 0 failures`

Size (session_01Khzr9qLc3B6CdyeggE5ntx): test runs 1, module lines 76

## J1 · REPORT

Found outside my module (N469 scan). (1) `build/requirements/test-support.md` Satisfies and `build/layers.md` "Helper modules" (:126) say the sandbox is shared by "the old battery"; the battery runner was deleted at T20, so the users are the workers' tests and the kept suites. (2) Two rules lost their only guard with `hygiene.test.mjs` and no module owns them: every suite that builds a Miniflare or mkdtemps imports the sandbox, and suites end with `process.exit` (31 suites still do). My notes now state both without a guard. No generated artifact staled.

## J2 · COMPLETE

N469 applied: notes in sandbox.mjs and stdio.mjs naming hygiene.test.mjs, scripts/battery.mjs and tally-through-pipe.test.mjs re-worded (what runs the suites now; which rules no test enforces; R6/R8 tests named for the pipe guarantee); make-pdf.mjs had none. Comments only. Tests 25/25 pass; format, architecture, coverage (9/9), ownership all 0 failures. Record: build/jobs/T21/test-support.md.
