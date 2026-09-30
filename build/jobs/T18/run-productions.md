# run-productions (T18)

**Status** · session_01VFBFEMEmv24uKBA3Qo3CH8 · depth 2 · WORKING · handled B4

## J1 · QUESTION

Read and planned. One point, with my best reading; I carry on on it.

**The ✱ deletion of `SUGGEST_LEVELS` against rule (6).** Two test importers outside my paths read the catalogue's copy: `agent-worker/test/wire-vocabulary.test.mjs`:69 and `agent-worker/test/plane-suggest.mjs`:85 (agent-worker's module tests; the latter also imports `SUGGEST_CHECKS`, which stays). `EXTRACT_PROPOSE_CHECKS` has no importer outside my module. Rule (6) takes a ✱ deletion only after every test importer in the layer has re-pointed; agent-worker's entry re-points these pins to run-productions in its own job, after my early merge (`run-productions/index.mjs` already exports `SUGGEST_LEVELS`).

Best reading: define both in `run-productions/checks.mjs` and delete both catalogue copies in this job (✱ as the entry says); agent-worker's two imports fail at import from my merge until its job re-points them, in this layer, so layer 6 closes green. If you want rule (6) strictly (no red between my merge and agent-worker's), say so: I will then define both here, delete `EXTRACT_PROPOSE_CHECKS` from the catalogue, and leave the catalogue's one-line `SUGGEST_LEVELS` as a copy for T19's layer 1 (named in my record).

## J2 · QUESTION

**Replaces J1** (my best reading changed on measurement).

Deleting the catalogue's `SUGGEST_LEVELS` takes four of agent-worker's module suites down at import, not two lines: `plane-suggest.mjs` (which imports it) is imported by `requirements.test.mjs` (255 pass on the base), `fanout.test.mjs` and `harness.test.mjs`, and `wire-vocabulary.test.mjs` (83 pass) imports it directly. Rule (6): a ✱ deletion is taken only after every test importer in the layer has re-pointed, "otherwise the move is a copy".

Best reading, now applied: `SUGGEST_LEVELS` and C-104 `EXTRACT_PROPOSE_CHECKS` are both **defined** in `run-productions/checks.mjs`; **C-104 is deleted** from the catalogue (no importer outside my paths); the catalogue's one-line **`SUGGEST_LEVELS` is held as a copy** (untouched), named in my record, for the catalogue's next job to delete once agent-worker's job re-points its pins here (its entry already says so; K529's lag, rule (3)). agent-worker's suites stay green through my merge. If you want the deletion now anyway (agent-worker red from my merge to its own), say so and I delete the line.

## J3 · COMPLETE

**Early merge (rule (7)): my provided services are done** (skills and agent-worker may go on after the merge). One entry waits on your CHANGE: the `airun.mjs` re-point to run-rules; I merge `tranche/T18` and apply it then (re-opening this job).

**Entries applied** (layer 6; B1):
- **N155's ready share.** C-104 `EXTRACT_PROPOSE_CHECKS` (twelve rows, C-104.1–C-104.12, byte-identical, `where`s unchanged: each already named this module's regions) and `SUGGEST_LEVELS` are **defined** in `bio-plane/src/run-productions/checks.mjs`, no longer read from the catalogue. **C-104 deleted from the catalogue ✱** (102 lines removed with its header; no importer outside my paths). **`SUGGEST_LEVELS`' one catalogue line is held as a copy** (J2, on rule (6)): agent-worker's `wire-vocabulary.test.mjs` and `plane-suggest.mjs` import it, and through the latter `requirements`, `fanout` and `harness`; the catalogue's next job deletes it once agent-worker re-points (its entry). `SUGGEST_CHECKS` still read from the catalogue (waits for basis-versions). `SUGGEST_LEVELS` is now frozen. Rows **awaiting stamp** (T19 promotion, rule (4)): C-104.1–C-104.12 (departed the catalogue; `ROW_CENSUS` and `CATALOG_VERSION` move with them).
- **N411's share.** `index.mjs` is-suggest-write (the provider-refusal relay, R3) now states its own verdict: `ok: false` and the `reason` and `code` it carries, every other field the provider's unchanged. Measured with the DEC-49 guard (release-only, run for the measure): `inheritedVerdicts` 6 → 5, `run-productions/index.mjs:513` gone from its list.
- **Convert `extractrun`** (run-productions' share, `build/jobs/T17/legacy-tests.md` row 168): `extract.test.mjs` "R10 (convert: extractrun)": NO_SUCH_RUN names the run and says a run begins on a member's act; NOT_AN_EXTRACT_RUN echoes the run's mode (and `(none)` for an unnamed one). Old suite not deleted (K619).
- No `not yet met` mark cleared (R9, R13, R14 marks unchanged by this work).

**Deferred:** the `airun.mjs` re-point to run-rules (waits on your CHANGE, B1).

**Found in other modules** (none changed by me):
1. **agent-worker:** `test/wire-vocabulary.test.mjs`:69 and `test/plane-suggest.mjs`:85 import `SUGGEST_LEVELS` from the catalogue; its job re-points them to `run-productions` (its entry), after which the catalogue's copy can go.
2. **Generated artifacts stale** (manifest §14): agent-worker's bundle (the catalogue is an input; its R45 static and freshness arms fail, 253/2 on my branch, 255/0 on the base) and the plane's `bio-plane/dist/` and `release/`. Not written by me.
3. **control-plane:** `dec49Row`/`CHECK_FAMILIES` must name `run-productions/checks.mjs` for C-104 now that it left the catalogue (already in control-plane's T18 entry: "run-productions'").
4. **Red before and after, not mine:** `test/m/control-plane/doorbell.test.mjs` R36 (N380/K559; N419's), 1 fail, same on the base.

**Tests and checks** (on `job/T18/run-productions`):
- `node --test bio-plane/test/m/run-productions/`: tests 36, pass 36, fail 0.
- `node --test bio-plane/test/m/`: tests 3656, pass 3633, fail 1 (doorbell R36, pre-existing), todo 22.
- agent-worker: `requirements.test.mjs` 253 passed, 2 failed (R45, the stale bundle); `wire-vocabulary.test.mjs` 83 passed, 0 failed.
- No layer tests named in the manifest.
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture run-productions`: 7 product files, 38 relative imports; 0 failures. `coverage run-productions`: 19 of 19 live requirement ids named by a test; 0 failures. `ownership run-productions tranche/T18`: legacy-store 0 added, 0 removed; legacy-checks 0 added, 102 removed; 0 failures.

Size (session_01VFBFEMEmv24uKBA3Qo3CH8): test runs 11, module lines 1146
