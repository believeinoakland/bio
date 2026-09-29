# basis-versions (T12)

**Status** · session_01Q76EbqkwaV8V5uqXQMJ8ct · depth 2 · COMPLETE · handled B1

## Completion

**Applied** (on `tranche/T12` at 89107afbe8):
- **N300, R41** `projectQuestions({project, after, limit}) → {items: [{inquiry, legs, stance}], cursor}` (`src/basis-versions/index.mjs`). The inquiries a project draws on by R13's own test (its document's `cites` references not marked `severed`), restricted to targets the record holds as an inquiry (`object_type` `inquiry` or a legacy alias), read in one bounded statement in id order after `after`, one past the page; `cursor` is the last answered only when more follow. `legs` is `inquiry.basisFor(id, {limit: 1})` holding a leg; `stance` is R22's reading of the same document (`concluded`, `withdrawn`, `undetermined`, or `none`). Viewer-free; an empty, absent or non-project id, or a project with no document, answers `items: []`; writes nothing; never throws. Exported `PROJECT_QUESTIONS_MAX` (500). Reading taken for the clamp (R41 says "defaults to 500, clamped to 1–500"): absent, zero or not a number reads 500, a negative number 1, as connections R42 states for its own limit.
- **N316, R39** an interface test: an authored observation 64 legs from its root is reached, one 65 legs away is not, the chain running through a version leg then basis legs; the 65-leg chain's observation is reached from one leg further in (the guard, not the chain, stops it); a cycle terminates. Negative controls, each alone and restored (`cmp`): the walk's guard at `DEPTH + 1` and at `DEPTH - 1` both turn the test red (1 fail each).
- **Improvements in my module.** R13's draws-on test had three inline copies (`versionCurrent`, `conclude`, `projectsDrawingOn`); it is now one function, `drawsOn`, read by R13, R17, R37 and R41. R22's reading of a project's `conclusions[]` is one private static, `#recordIn`, shared by `conclusionRecordOf` (after its sight test) and R41, so the two cannot read a row differently. `basisVersionsOf`'s `deps.inquiry` takes `basisFor` too (inquiry R16); a caller passing only the three services it always passed creates inquiry's instance no earlier than before (on R41's first use). Comment labels fixed (the testimony walk is R39, not R38).

**Strike.** R41's `(not yet met: N300)` is met by this work, and with it the status line's "R41 … not yet met". R37's mark is not mine to strike (it names `#projectsDrawingOn` in `legacy-store`; the method here already meets R37 and is tested).

**Deferred.** None.

**Found (reported to BOB).**
1. Generated artifacts stale, not rebuilt (§14): `agent-worker/dist/agent-worker.bundled.mjs` (fleetbundles: "STALE BUNDLE — the source ../bio-plane/src/basis-versions/index.mjs has changed") and `bio-plane/dist/bio-plane.bundled.mjs` (its manifest lists `src/basis-versions/` inputs). `fleetbundles.test.mjs` 2a's pinned agent-worker input list lacks `capture/checks.mjs`, `capture/ops.mjs` (already on the plan for legacy-tests).
2. DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`), this commit against its parent: 26 `FAIL` lines before and after, the same ones; one floor moves: `regionLines` 5480 → 5477 (`conclude > is-conclude-claim` 54L → 51L, the inline draws-on test replaced by `drawsOn`). No code added, renamed or moved between sites.
3. Legacy suites touching this module (97 files under `bio-plane/test/` naming its ops or reads): 94 pass; `derivation-bounds`, `machinefences-dec49`, `meaning-bounds` fail identically on the parent (failure lines compared, hashes masked); `airun` failed once under concurrency and passes alone before and after.

**Tests and checks.**
- `node --test bio-plane/test/m/basis-versions/`: tests 47, pass 47, fail 0 (new: "R39 (N316) …", "R41: projectQuestions …", "R41: limit is clamped to 500 …").
- Modules using basis-versions (`strength` 44, `contradiction` 28, `run-productions` 35, `reevaluation` 49, `publication` 61, `ratification` 67, `case-authoring` 39, `review` 29, `affordances` 74, `queue` 10): 436 pass, 0 fail; `test/projection-noproject.test.mjs` 1 pass.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … basis-versions`: 11 product files, 42 relative imports; 0 failures.
- `node checks/coverage.mjs … basis-versions`: 41 of 41 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … basis-versions tranche/T12`: 4 files; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01Q76EbqkwaV8V5uqXQMJ8ct): test runs 14, module lines 2041

## J1 · REPORT

Found beyond my module (record, Completion 'Found'): (1) Stale, not rebuilt: agent-worker and bio-plane bundles (both list src/basis-versions inputs). (2) DEC-49 guard: 26 FAIL lines before and after, the same; floor regionLines 5480 -> 5477 (conclude > is-conclude-claim 54L -> 51L). (3) Legacy suites naming this module's ops/reads: 94 of 97 pass; derivation-bounds, machinefences-dec49, meaning-bounds fail identically on the parent; airun flaked once under concurrency, passes alone.

## J2 · COMPLETE

N300: R41 projectQuestions({project, after, limit}) -> {items: [{inquiry, legs, stance}], cursor}, viewer-free, one bounded read, legs via inquiry.basisFor(limit 1), stance by R22; clamp reading: absent/zero/non-number 500, negative 1 (connections R42's convention). N316: R39 interface test, depth 64 reached and 65 not (negative controls at DEPTH+1 and DEPTH-1 both red). Also: R13's draws-on test one site (drawsOn) for R13, R17, R37, R41; R22's record reading shared. Strike R41's 'not yet met: N300'. Tests 47/47; users' m-tests 436 pass 0 fail; format, architecture, coverage 41/41, ownership: 0 failures. Record: build/jobs/T12/basis-versions.md, Completion.
