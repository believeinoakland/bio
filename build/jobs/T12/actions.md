# actions (T12)

**Status** · session_01CzFMjecNnKwWk2jgMUJbg6 · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

**Entries applied** (on `job/T12/actions` @ 049df16153, tranche/T12 @ 3c430934d4 merged in):
- **N311 · R31.** `pendingClocks` pages by entry, in (action id, entry position) order after `after`. `after` is a previous page's `cursor` (`<action>#<position>`, resuming after that entry) or an action id (read as after all that action's entries). A page reads at most 500 actions and may end inside one. `cursor` is the last entry answered when `truncated`, else null, so an action with more pending entries than a page is read whole across pages. `cut_inside` is retired (K380). One guard beyond the wording: if a page ends on the 500-action bound past an action whose document holds no qualifying entry (its projection row behind it), `cursor` is that action's end (`<action>#<last position>`). Otherwise such a page could not move on.
- **N312 · R8.** A breach action resting only on superseded determinations answers conformance's `determinationSuperseded(id, superseded_by)` (its R20) for the first superseded leg. Conformance has not built R20 yet (no `determinationSuperseded` on tranche/T12 or `job/T12/conformance` at 10:5x UTC). So a local stub in R20's wording answers until then: `{ok:false, reason, code: "DETERMINATION_SUPERSEDED", check: null, translation: null, determination, superseded_by, detail}`. It mints no row; the code's row is conformance's. The module is read through `import * as`, so the real helper takes over with no change here once it merges.

**Marks my work meets** (for you to strike): R31's `*(not yet met: N311)*`. R8's `*(not yet met: N312)*` is met once conformance's helper lands. Until then the test naming it is a `test.todo` naming that cause (`t12.test.mjs`). On your CHANGE I will merge and run it against the real helper.

**Deferred:** none.

**Found in other modules and artifacts:**
- **Stale bundle (not rebuilt).** `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` are stale from this change (actions is in the plane): `fleetbundles.test.mjs` bio-plane arms FAIL (4), as publication J3 also reports. The agent-worker 143-input pin was already red (legacy-tests', CAPTURE #6).
- **Monitoring** (`src/monitoring/index.mjs`:1955, `deadlineRecheck`) reads only the first page of `pendingClocks` and never its cursor. It is unaffected by the cursor's shape. An action with more than 500 past entries is now marked across successive rechecks instead of being cut. Nothing to change there.
- **Legacy suites:** `derivation-bounds.test.mjs` stays 75/0. I kept R31's `truncated` in the spelling its in-memory reader grades (a first spelling was unreadable to it and turned it red; fixed here, nothing to report). `bounds.test.mjs`, `d470-catalog-census.control.mjs` and `machinefences-dec49.test.mjs` fail 1 each, the same on tranche/T12 without this change.
- **UI and affordances:** grep of `civicos-ui/` and `bio-plane/src/affordances/` for `cut_inside`, `actions_limit`, `DETERMINATION_SUPERSEDED`, `pendingclocks`: no hits. No check row was added, changed or retired here (nothing for N318). `DETERMINATION_SUPERSEDED`'s row is conformance's.

**Tests and checks:**
- actions: 40 tests, 39 pass, 0 fail, 1 todo (R8's real-helper arm, above). New `test/m/actions/t12.test.mjs`: R31 at the page bound and across it, every page size 1–6, an action of 501 entries across pages, an action of exactly 500 on one page, an action id as `after`; R8's refusal fields, a successor not named, the first superseded leg, one fixed detail, a live leg beside a superseded one. `t11.test.mjs`: the cursor assertions now expect `<action>#<position>`/null, and the cut-inside test is removed (K380 retires it).
- Suites of the modules that use actions: filings 34/0, escalation 28/0, monitoring 51/0/6 todo, affordances 74/0/1 todo, queue 10/0 (instance-setup and control-plane have no tests yet).
- 23 legacy suites naming actions, each run with and without this change: identical results.
- `format: 69 modules, 64 requirements files; 0 failures` · `architecture: 9 product files, 34 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 43 of 43 live requirement ids named by a test; 0 failures` · `ownership: 4 files changed by actions between tranche/T12 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures`

Size (session_01CzFMjecNnKwWk2jgMUJbg6): test runs 62, module lines 3508

## J2 · COMPLETE

**B2 applied** (on `job/T12/actions` @ 03478838e7, tranche/T12 merged in with K400):
- R8 imports conformance's `determinationSuperseded` and calls it directly: `import { conformanceOf, determinationSuperseded } from "../conformance/index.mjs"`. The local stub is gone. `superseded_by` is the successor as `determinationRead` answered it to the author's viewer (null when it names none). `noSuchDetermination` is not imported: no act or read of this module answers that condition.
- `t12.test.mjs`: the todo is now a test. R8's refusal deep-equals `determinationSuperseded(D2, D1)`, with conformance's check and translation.

Everything else in J1 stands: N311 as built, nothing deferred, same findings. The bio-plane bundle is still stale and still reported. Marks are yours.

**Tests and checks** (on the merged tree):
- actions: 40 tests, 40 pass, 0 fail, 0 todo.
- Suites of the modules that use actions: filings 34/0, escalation 28/0, monitoring 51/0/6 todo, affordances 74/0/1 todo, queue 10/0. Conformance's own suite: 36/0.
- Legacy: derivation-bounds, conformance, shadowed-refusals, refusal-wire, check-firing and action-loop fail 0. `machinefences-dec49` fails 1 (ARM A4, the doctrine pack), identically on tranche/T12 without this job.
- `format: 69 modules, 64 requirements files; 0 failures` · `architecture: 9 product files, 34 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 43 of 43 live requirement ids named by a test; 0 failures` · `ownership: 4 files changed by actions between tranche/T12 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures`

Size (session_01CzFMjecNnKwWk2jgMUJbg6): test runs 78, module lines 3499
