# observation-log (T18)

**Status** · session_01PsaM5ugjCPER1vjNE5prhR · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 5, observation-log):
- **C-22 whole** (K586 BOB-2, R26 as K587): `AI_RUN_CHECKS`' eight rows (C-22.1–C-22.4, C-22.6, C-22.9, C-22.10, C-22.17) are now written in `observation-log/checks.mjs`, codes, numbers, translations and reasons unchanged, exported as `AI_RUN_CHECKS` (with `OBSERVATION_CHECKS` the same object); the module no longer imports the catalogue's. A copy, not ✱: the catalogue keeps its table until T19's layer 1 (`airun.mjs` and run-rules' copy still read it; run-rules re-points to this module's, K649). Two carried pointers corrected (C-22.10's reasons named `src/airun.mjs` for the predicate and `OBSERVATION_REFERENT_FAULTS`; both are in `observation-log/vocabulary.mjs`).
- **Rows moved, `awaiting stamp`** (rule (4), T19's promotion): C-22.1 `AI_LOG_STATE_UNKNOWN`, C-22.2 `AI_LOG_GOVERNED_ABSENCE`, C-22.3 `AI_LOG_SHELL_PRESENT`, C-22.4 `AI_RUN_CONDITION_UNKNOWN`, C-22.6 `AI_LOG_NOT_A_BUNDLE`, C-22.9 `OBS_AUTHORITY_UNNAMED`, C-22.10 `OBS_PRESENT_NO_REFERENT`, C-22.17 `AI_LOG_NEVER_LOOKED_STORED` (each `where` unchanged: it already named this module's site). Held twice for one tranche (rule (3)): the catalogue's copy of all eight.
- **`LEAD_ID_RE`** copied into `observation-log/checks.mjs` (K649) and exported; the catalogue keeps its own for `leadLegFindings` until inquiry takes it (map §4.2). Held twice: `LEAD_ID_RE`.
- **T17's finding (connections R5, R51; this module's R8)**: `attachMeaning({connections})` now registers both the derivation notice (`onDerived`) and the derivation-statement provider (`registerDerivationProvider`) under `observation-log`. `store.mjs`' two `"legacy-store"` registrations and their comment are removed; its one added line, `observationLogOf(ctx).attachMeaning({ connections: connectionsOf(ctx, { env }) })`, calls this module (§12.2; net −4 lines).
- **N242's share**: `AI_LOG_NEVER_LOOKED_STORED` has its mint site (`checkObservation > is-never-looked-stored`, since T10). The DEC-49 guard, run once read-only on this tree, no longer reports it as unminted; it now reports it as a stale `MULTI_SITE_CLOSED` exemption (below, legacy-tests').
- **Converts** (T17 `legacy-tests.md` rows): `d241-derivation-stated` and `observation-meaning` → new `meaning.test.mjs` (R8's three writers in full, the derivation statement and `derivationDocumentsFrom`, and the registration driven through connections' real `derive` and `read`); `airun` → R26 (every C-22 translation ≥ 40 characters, every code's refusal carrying its row, C-22.1's detail); `observation-content` → an end-to-end R6/R7/R8 test through extraction's own `writeReading`; `observation-log` → R24 over every read this module serves. The other shares of those suites are retrieval's, ai-runs' and extraction's.

**Deferred:** none.

**Found in other modules (REPORT):**
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product) and `agent-worker/dist/agent-worker.bundled.mjs` (agent-worker) include `observation-log/checks.mjs` and `index.mjs` (and `store.mjs` for the plane's): made stale by this job; BOB regenerates at the layer close (§14).
- The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`, legacy-tests', release-only, K619) now fails on the eight C-22 rows defined twice (expected while the catalogue's copy stands, rule (3)), on `AI_LOG_NEVER_LOOKED_STORED`'s stale `MULTI_SITE_CLOSED` entry, and on its `families` floor (114 → 115). Legacy-tests re-pins at the release; the duplicates clear with T19's layer-1 deletion.

**Tests and checks:**
- `node --test bio-plane/test/m/observation-log/`: tests 51, pass 51, fail 0. A negative control (the provider registration removed) failed the registration test, as it should. No layer tests (manifest). No service changed.
- `node checks/format.mjs`: 82 modules, 77 requirements files; 0 failures.
- `node checks/architecture.mjs … observation-log`: 11 product files, 34 relative imports; 0 failures.
- `node checks/coverage.mjs … observation-log`: 29 of 29 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … observation-log tranche/T18`: see below (run after commit).

Size (session_01PsaM5ugjCPER1vjNE5prhR): test runs 9, module lines 3052
