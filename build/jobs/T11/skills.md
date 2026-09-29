# skills (T11)

**Status** · session_01WHkeSYJXikezjTzJkizuXW · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.** N289 (this module's share, K349): R25's test (`bio-plane/test/m/skills/version.test.mjs`) reads C-22.7's row through ai-runs (`airun.mjs` `AI_RUN_CHECKS`, and `translationOf` for the code) and never from the catalogue's `AI_RUN_CHECKS`; it holds that `SKILL_CHECKS`' row is that row (no copy), that its code, number and translation are unchanged, and that `checkSkillVersion` mints it. The module's code already named the row by key through ai-runs (`skilldoctrine.mjs` `SKILL_CHECKS`), so no source line changed. Once ai-runs' own table holds the row (its R35), `airun.mjs`'s merge makes ai-runs' row the one read, and the test follows it unchanged.

**Pending on ai-runs.** R25's last clause (the row held in ai-runs' own table with its one minting site, `where` `src/ai-runs/skill-version.mjs checkSkillVersion`) is a `test.todo` naming ai-runs R35 (N289): ai-runs has not yet built it (`job/T11/ai-runs` @ fetch time holds no row). When BOB says ai-runs is merged, I merge `tranche/T11` and turn the todo into a test.

**Deferred.** None of this module's. R10 stays not met in the product: the plane publishes no surfaces or recipes (SK-5, N144).

**Found elsewhere (for BOB).** `build/requirements/skills.md`: R21's `not yet met` mark and the Status line's "Not yet met: … R21" are stale. R21 has held since T7 (the four-level and search-completeness sentences and the four facts cite and are found in `BIO_Content_Framework_v0_10.md` Part II §14.3, `FACTS_SOURCE`); its test passes. The mark is BOB's to strike. No catalogue row added or changed (nothing for promotion R34).

**Tests and checks.**
- `node --test bio-plane/test/m/skills/`: tests 31, pass 30, fail 0, todo 1 (R25's ai-runs-table clause, above).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … skills`: 6 product files, 29 relative imports; 0 failures.
- `node checks/coverage.mjs … skills`: 26 of 26 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … skills tranche/T11`: 1 file changed; legacy-checks 0 added, 0 removed; 0 failures.
- No layer tests are named in `build/manifest.md`.

Size (session_01WHkeSYJXikezjTzJkizuXW): test runs 3, module lines 1496

## J1 · COMPLETE

N289 applied: R25's test reads C-22.7's row through ai-runs (airun.mjs AI_RUN_CHECKS, translationOf), never the catalogue; no source line changed (SKILL_CHECKS already selects it from ai-runs). R25's last clause (row held in ai-runs' own table, where src/ai-runs/skill-version.mjs) is a test.todo naming ai-runs R35: tell me when ai-runs is merged and I merge tranche/T11 and make it a test. Tests 31: 30 pass, 0 fail, 1 todo; format, architecture, coverage (26/26), ownership: 0 failures. Report: R21's not-yet-met mark (bullet and Status line) is stale, met since T7; yours to strike. No catalogue row changed. Record: build/jobs/T11/skills.md on job/T11/skills.

## Completion (B2)

**B2 applied.** Merged `tranche/T11` (ai-runs merged, AI-RUNS #4 J1). R25's `test.todo` is now a test: C-22.7's row, read through ai-runs, has its `where` at ai-runs' minting site (`src/ai-runs/skill-version.mjs checkSkillVersion`, …), and is a distinct object from the catalogue's interim copy (N299), which says the same number and translation (that arm is skipped once T12 removes the copy). No source line changed. R21's stale mark stands reported (J1).

**Tests and checks.**
- `node --test bio-plane/test/m/skills/`: tests 31, pass 31, fail 0, todo 0.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … skills`: 6 product files, 29 relative imports; 0 failures.
- `node checks/coverage.mjs … skills`: 26 of 26 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … skills tranche/T11`: 2 files changed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01WHkeSYJXikezjTzJkizuXW): test runs 5, module lines 1496
