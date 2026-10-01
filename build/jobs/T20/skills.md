# skills (T20)

**Status** · session_01GnYeqvTWL2RPqooQrRRMCS · depth 2 · COMPLETE · handled B3

## Completion

**Entry applied** (`build/plan/current.md` T20 L6, skills; K882, N452, K867; B1, B3): after merging `tranche/T20` at K897, `bio-plane/src/skilldoctrine.mjs` imports `INQUIRY_GRAMMAR_CHECKS` from `./inquiry-grammar/index.mjs` (was :90) and reads `INQUIRY_GRAMMAR_CHECKS.MACHINE_CANNOT_GROUND.check` for `C.cannot_ground` (was :253); `bio-plane/test/m/skills/fixture.mjs` imports `INQUIRY_GRAMMAR_CHECKS` (was :12) and names it in `owners` directly, the family alias and its comment dropped (was :19–21). No other read of `INQUIRY_GRAMMAR_ROWS` remains in this module's paths or tests, so inquiry-grammar may drop its alias for skills (control-plane's `families.mjs`:93–94 still reads it; that is control-plane's, N452's deletion in T21). Behaviour unchanged: the binding is the same frozen object. No requirement changed; no old suite deleted (K619).

**Deferred:** nothing.

**Found in another module, for BOB:** (1) Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`.bundle.json`, owned by `not_product`) bundles `skilldoctrine.mjs` (its `cannot_ground` line, bundle :96105, reads `INQUIRY_GRAMMAR_ROWS`); BOB regenerates it at the layer close. `agent-worker`'s bundle does not read skills (no skills input since T18 L6, K683; `skilldoctrine` appears 0 times in it). (2) `control-plane/families.mjs`:93–94 still names `INQUIRY_GRAMMAR_ROWS` and builds the family alias `INQUIRY_GRAMMAR_CHECKS` from it; with the export now named so, the alias is redundant (control-plane's job, already in K882's T21 list as N452's alias deletion).

**Tests and checks** (on `job/T20/skills` after the merge of `tranche/T20` at K897):
- `node --test bio-plane/test/m/skills/`: baseline before the change `tests 39, pass 39, fail 0`; after: `tests 39, pass 39, fail 0`.
- No layer tests are named in `build/manifest.md`; no service changed, so no user's tests run.
- `checks/format.mjs`: `format: 84 modules, 82 requirements files; 0 failures`
- `checks/architecture.mjs skills`: `architecture: 7 product files, 43 relative imports (0 naming no tracked file, not judged); 0 failures`
- `checks/coverage.mjs skills`: `coverage: 1 modules, 29 of 29 live requirement ids named by a test; 0 failures`
- `checks/ownership.mjs skills tranche/T20`: `ownership: 3 files changed by skills between tranche/T20 and HEAD; 0 failures`

Size (session_01GnYeqvTWL2RPqooQrRRMCS): test runs 2, module lines 1703

## J1 · QUESTION

inquiry-grammar's rename (INQUIRY_GRAMMAR_ROWS → INQUIRY_GRAMMAR_CHECKS) is not on tranche/T20 at 7d7570f07b. My reading: I wait for your word that it has merged, then merge tranche/T20 and re-point skilldoctrine.mjs:90, :253 and test/m/skills/fixture.mjs:12, :21 (dropping the fixture's family alias). Meanwhile I read my requirements, code and tests whole and run the baseline.

## J2 · COMPLETE

B3 applied: tranche/T20 (K897) merged; skilldoctrine.mjs (import, C.cannot_ground) and test/m/skills/fixture.mjs (import; owners names INQUIRY_GRAMMAR_CHECKS directly, alias dropped) re-pointed. No INQUIRY_GRAMMAR_ROWS read remains in skills; inquiry-grammar may drop the alias for skills (control-plane families.mjs:93-94 still reads it). Tests 39/39 pass before and after; format, architecture, coverage (29/29), ownership all 0 failures. Stale artifact: bio-plane/dist/bio-plane.bundled.mjs (plane bundle carries skilldoctrine); agent-worker's bundle does not read skills. Details in the record's Completion section.
