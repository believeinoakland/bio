# op-grades (T48)

**Status** · session_01KLNvRCntjSGjnv8fXdTbHq · depth 1 · COMPLETE · handled B2

## J1 · COMPLETE

**Read (whole):** `build/requirements/op-grades.md`; `build/plan/current.md`'s T48-56 entries and L11 merge order; `build/plan/draft-T48-L11-design-fold.md` §C9; `bio-plane/src/op-grades/index.mjs` (the NON_ACTS body skimmed from line 999 to 1560 as data; its tables and `phoneOf` read), `t37.mjs`, `t47.mjs`; `t45.mjs`'s `actionreplybearing` and `itemtakeup` rows; the T47 and affected tests (ladder, pins, owners, t35, t37). Of the owners, only the requirement lines my entries touch (following R29–R30, plane R50, ai-use R14, explore R21, standards R57, filings R59, action-holds R16, instance-setup R88–R90, connections R68, membership R143, action-replies R10, action-plans R51, affordances R58, op-declarations). The design kit `mock-kit.js` and `registry.json` at `4664e8efd4` (identical to the working tree).

**Entries applied (R38–R42):**
- R38: `actionreplyquoting` `reversible` (an ACTS row: no NON_ACTS row, `MACHINE_REFUSALS` → `MACHINE_CANNOT_RECORD_QUOTING`); `proceedingdates` a read; `readtranslate` a `draft: …`; `followregister`, `reviewgrant` unchanged.
- R39: `translationdraft` `undetermined` → `caller-owned` (edited in `t37.mjs`); `groupdescriptiondraft`, `securitymap` given `caller-owned` rows; NON_ACTS unchanged.
- R40: `updateskip` `reasoned` (`UPDATE_SKIP_NO_REASON` joins the family), `updatelater`, `updatestart` `reversible`, the one release-directed sentence, `updatenotice` a read.
- R41: five reads (`aiuseovertime`, `exploregraph`, `standardproposals`, `filingread`, `pressurefor`); `planask` `reversible` (ACTS row, `MACHINE_CANNOT_PLAN`); `stepsource` `reasoned` (`STEP_SOURCE_NO_BASIS` joins), `stepsourcewithdraw` `reasoned`; `lookedsince` `caller-owned`.
- R42: `MARKS` and `MARK_SOURCES` (new `marks.mjs`, 112 ops: the registry's rungless acts, weight names from the kit's `WEIGHT`, 22 defaulting to Reasoned, `acquire` Reversible by K3284). The two maps are frozen; `MARKS` is op → weight name, `MARK_SOURCES` each entry's source (my reading of "each entry names its source"). Both exported from `index.mjs`.
- K3284, K3278, K3280, K3282 are the entries above (acquire in MARKS; `planask`; `pressurefor`, `filingread`; `actionreplyquoting`).

**Deferred:** none.

**Reading choices:** (1) The weight source is the kit at `4664e8efd4` (`ASSETS_COMMIT` per `interface-assets` R5), not `3f40899950`: `login` has its weight only in the later kit, and R42's test says `login` is reversible. (2) `MARKS` covers ops no table here grades (`login`, `search`, `bootstrap`, `verify`, `frontier`, `invitelook`, `publishedcase`) too, since R42's test needs `login`; they are in no op-grades grade table. (3) `securitymap` and `groupdescriptiondraft` are given `RUNG_ABSENT` rows though they write nothing, as R39 words it.

**Found in other modules (REPORT to BOB):**
- `affordances`: its tests, held against this module's tables, now fail in three places that are its own to update (it merges after me): (a) `t34.test.mjs` "groupdescriptiondraft and writinghelp are no act …": `unaccounted` reports `groupdescriptiondraft` as stale, since the control plane's table carries it non-mutating and R39 gives it a `RUNG_ABSENT` row; R12's totality needs to accept a `RUNG_ABSENT` row on a non-mutating op named by R39 (`securitymap` likewise); (b) "R1 R20 R52: … MACHINE_REFUSALS holds only ACTS": `actionreplyquoting` and `planask` are not yet ACTS rows (its R58, R51); (c) "R19: … every op RUNGS grades `reasoned`" needs drives for `updateskip`, `stepsource`, `stepsourcewithdraw`.
- Four `affordances` tests were already red before my change (R1 R12 layer-9 maps, R12 new-module maps, two R48 ACT_HELP tests): not mine.
- `wizard-scripts` re-take of the registry (T48-55) will change nothing in MARKS if it carries `4664e8efd4`; if the design stream's registry or kit moves on `main`, R42's totality test (it reads both files) names each op to add.

**Tests and checks:**
- `node --test bio-plane/test/m/op-grades/*.test.mjs`: 107 tests, 107 pass, 0 fail (new `t48.test.mjs`: 14 tests naming R38–R42, each with a control; ladder, pins, owners, t35, t37 re-pinned to R39's `undetermined` count and the new rungs and machine refusals).
- `node checks/format.mjs .`: 168 modules, 167 requirements files; 0 failures. `architecture.mjs . op-grades`: 24 product files; 0 failures. `coverage.mjs . op-grades`: 42 of 42 live requirement ids named by a test; 0 failures. `ownership.mjs . op-grades tranche/T48`: 0 failures. `checks/run.mjs .`: op-grades none of its failures (the others are other jobs' unmet ids).
- `affordances` tests (a user of this module): 250 tests, 243 pass, 7 fail: the 4 inherited and the 3 above.

Size (session_01KLNvRCntjSGjnv8fXdTbHq): test runs 5, module lines 3286

## J2 · COMPLETE

**B2 (K3297) applied.** `planask` stays `reversible`; it is dropped from `MACHINE_REFUSALS` and, being a plan act, takes the NON_ACTS row "plan-directed: keyed by a plan; a member asks the assistant for options on it, opening one planning run whose proposals reach the member's tray; writes no option and moves no bundle" (as `optionpropose`'s). `t48.test.mjs` now tests that it has no MACHINE_REFUSALS row and the plan-directed sentence; `ladder.test.mjs`' machine map no longer holds it. `actionreplyquoting` stays an ACTS row with its refusal. R41's "where affordances R51 makes it an ACTS row" is thus unmet by design.

Tests: op-grades 107 pass, 0 fail. Checks: format, architecture, coverage (42 of 42), ownership 0 failures.

Size (session_01KLNvRCntjSGjnv8fXdTbHq): test runs 7, module lines 3289
