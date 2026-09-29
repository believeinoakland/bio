# ai-runs (T11)

**Status** · session_01Fj3xWyfWu9ZrTwzLXShJSv · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

ai-runs T11 is complete on `job/T11/ai-runs` @ 26201811bd (code and tests), with `tranche/T11` @ b14df13df5 merged in before any change.

**Entries applied**
- **N293 (R45, C-22.18).** `AI_RUN_STATE_MAX_BYTES` = 262,144 is exported from `src/airun.mjs` and re-exported from `src/ai-runs/index.mjs`, for agent-worker R49.
  - `checkRunState(state)` in `airun.mjs` is the one minting site. It measures the UTF-8 length of the state's JSON and refuses a larger state with `AI_RUN_STATE_TOO_LARGE`, naming `bytes` and `limit`. An absent or null state is not measured.
  - The open relays it after R3 over `bounds`: before the lens is computed, the id is asked or the re-run is judged. The tick relays it after R3 over `consume`. Nothing is written in either case: no log entry, no figure, no lease extension, no tick.
  - The row is C-22.18 in the module's own table (`src/ai-runs/checks.mjs`), with `where` `src/airun.mjs checkRunState, called from src/ai-runs/index.mjs open and tick`.
- **N289 (R35, R8).** C-22.7's row (`AI_RUN_SKILL_VERSION_UNNAMED`) is in `AI_RUN_OWN_CHECKS`, with its reasons and translation unchanged. Its `where` is `src/ai-runs/skill-version.mjs checkSkillVersion, called from src/ai-runs/index.mjs open`.
  - `checkSkillVersion` builds its refusal from that row, not the catalogue's. This row wins in `airun.mjs`' spread, so `AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED` is it, and skills' `SKILL_CHECKS` (by key through `airun.mjs`) now resolves to it.
  - The words.test R35 arm now checks my own table: the row, its `where`, the refusal built from it, and the spread. It no longer asserts the catalogue's copy, either present or absent (N299, T12).
  - Stale `skillpack.mjs` references in `index.mjs` comments now name `skill-version.mjs`.
- **N284 (R30).** The work-product source's `read(run)` now answers `registered`: the run's `created`, the open's instant to the second. It is null when the stored instant cannot be read, and never filled in.
  - The R30 test checks it for every run. It also drives bias's own `biasDebtSweep` with a rank and sees each product offered as `{kind: "bundle", id, waitingSince}` with that instant.

**Requirement marks my work meets (for you to strike; a job does not edit `build/requirements/`)**
- R30: *(not yet met: N284; the source answers no `registered`)*.
- R45: *(not yet met: N293)*.
- R35: *(not yet met: N289, N293; …)*. C-22.7 is held here beside its minting site, and C-22.18 is allocated and held. The catalogue's interim copy of C-22.7 is legacy-checks' and leaves in T12 (N299), so strike this mark or narrow it to that.
- The header's "Not yet met: R17 (N39, K71), R30 (K82 (3)), R36 (K75 (2), K80), R37 (K31), R40 (K102)" is stale apart from R30. R17, R36, R37 and R40 each have a passing requirement-named test here.

**Found in other modules**
- **promotion (R34):** I added one check row, C-22.18, and changed C-22.7's `where`. Both are for `CATALOG_VERSION` to stamp.
- **skills:** `test/m/skills/version.test.mjs:66` (R25) pins the catalogue's row as it was (`where: src/skillpack.mjs …`). It now gets ai-runs' row, as N289 intends. That is 1 fail on my branch and 0 on the tranche; it is SKILLS #3's N289 share (R25's test reads the row through ai-runs).
- **legacy-checks:** the catalogue's C-22.7 copy still names `src/skillpack.mjs checkSkillVersion, called from store.mjs aiRunOpen`. That `where` is its N289 share, and the copy leaves in T12 (N299).
- **legacy-tests, re-anchor needed (`civicos-ui/check-refusal-codes.mjs`, 63 → 72 failures against a baseline worktree of this branch's start):**
  - C-22.7 is claimed by both `AI_RUN_CHECKS` (the catalogue's copy) and `SKILL_CHECKS` (skills' by-key view, now my own row), with identical translations. That is the K350 interim state, and it clears when N299 removes the copy.
  - The ratchet floors each moved by the new row and site: census +1, codesChecked +2, families +1, governedSites +2, outcomeReturns +1, reach +1, refusalsJudged +3 over the baseline's own +1, rows +2.
  - The legacy suites that read C-22 or the run (14 files: rec172-bounds, rec168, rec165, observation-log, d470-catalog-census, bounds, owed-controls, suggest, aicredential, case-opened, lead, project-disclosure, observation-content, leadslug) match the baseline. `d470-catalog-census` and `bounds` are red on both.
- **Generated artifacts, stale and not rebuilt:**
  - `agent-worker/dist/agent-worker.bundled.mjs`: agent-worker's R45 test is 1 fail, and so is `bio-plane/test/fleetbundles.test.mjs`.
  - `bio-plane/dist/bio-plane.bundled.mjs`: `fleetbundles` again.
  - Both are stale from `src/airun.mjs`, `src/ai-runs/checks.mjs`, `index.mjs` and `skill-version.mjs`. `fleetbundles` goes 1/0 on the baseline to 0/1 here.

**Deferred:** nothing.

**Tests and checks**
- ai-runs: 49 pass, 0 fail, 0 todo (46 at the start).
  - New `state.test.mjs` has three R45 tests: the pure check (ceiling, UTF-8 not UTF-16, bytes and limit), the open (order, nothing written, no listener, stored whole at the ceiling), and the tick (order, nothing written, null not measured, replaced at the ceiling, an ended run's no-op).
  - R9 and R11 gained their R45 arm. R30 and R35 are rewritten as above, and R39 reads `checkRunState`'s detail.
- The tests of the modules that use ai-runs, before and after my change:
  - unchanged: run-productions 35/0, capture-requests 61/0, intent 35/0, scheduler 46/0 (6 todo), queue 10/0, bias 48/0 (1 todo).
  - skills 30/0 → 29/1 (above). agent-worker 7/0 → 6/1, the stale bundle only.
- format: 0 failures. architecture: 0 failures (15 product files, 60 relative imports). coverage: 45 of 45 live ids named. ownership: 0 failures (legacy-store and legacy-checks 0 added, 0 removed).

Size (session_01Fj3xWyfWu9ZrTwzLXShJSv): test runs 14, module lines 4204
