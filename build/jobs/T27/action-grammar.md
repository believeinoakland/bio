# action-grammar (T27)

**Status** · session_01U9Fumb6uphtpXWNehTqT13 · depth 2 · COMPLETE · handled B1

## Completion (ACTION-GRAMMAR #5)

**Entry applied.** N518 (DEC-113; K1251, K1252), R9: `ACTION_CATALOGUE_CHECKS` holds three new rows, last and in this order, each `{check, where, translation}`; translations drafted plainly in C-117's style (the design stream may reword):
- C-117.23 `HOLD_RELEASE_IS_ITS_OWN_ACT`, where `src/actions/index.mjs actionHold > is-hold-release-act`
- C-117.24 `HOLD_PROJECTS_REFUSED`, where `src/actions/index.mjs #holdProjects > is-hold-projects` (one helper, asked by `actionHold` and `projectHolds`)
- C-117.25 `HOLD_ALREADY_RELEASED`, where `src/actions/index.mjs actionHoldRelease > is-hold-released`

The `where`s name regions `actions`' job writes in this layer (REPORT J1). No other row, value, finding or reading changed.

**Awaiting stamp** (accepted red 2, until T28's promotion stamp): C-117.23 `HOLD_RELEASE_IS_ITS_OWN_ACT`, C-117.24 `HOLD_PROJECTS_REFUSED`, C-117.25 `HOLD_ALREADY_RELEASED`.

**Deferred.** None. **Re-scan (N502/N508 kind):** the module's member-facing text was re-read whole; the three new translations name no place, no op, no internal id; nothing else found.

**Found in another module.** `actions` (REPORT J1): its regions must match the three `where`s above; C-117.20 and C-117.21 keep `where` `actionHold > is-hold` although R56's `actionHoldRelease` also raises both, so `actions` should mint them there through the same region (or BOB re-points those `where`s, a change to this module).

**Tests and checks.**
- `node --test bio-plane/test/m/action-grammar/`: tests 25, pass 25, fail 0 (R9 named by the new test and by the census tests, now C-117.1–.4, .6–.25).
- `node --test bio-plane/test/m/actions/`: tests 66, pass 66, fail 0.
- `node --test bio-plane/test/system/row-census.test.mjs`: red as accepted (red 2): `arrived with no record` for C-117.23–.25 (and L8's C-129 rows).
- `format`: 92 modules, 91 requirements files; 0 failures. `architecture`: 7 product files, 13 relative imports; 0 failures. `coverage`: 11 of 11 live requirement ids named by a test; 0 failures. `ownership` (vs `tranche/T27`): 0 failures.

Size (session_01U9Fumb6uphtpXWNehTqT13): test runs 3, module lines 1797

## J1 · REPORT

For actions (L9, N518): the three new rows' wheres name regions actions writes: C-117.23 HOLD_RELEASE_IS_ITS_OWN_ACT at `src/actions/index.mjs actionHold > is-hold-release-act`; C-117.24 HOLD_PROJECTS_REFUSED at `src/actions/index.mjs #holdProjects > is-hold-projects` (one private helper both actionHold and projectHolds ask, the C-73.2 #lawEntries precedent); C-117.25 HOLD_ALREADY_RELEASED at `src/actions/index.mjs actionHoldRelease > is-hold-released`. Also: C-117.20 MACHINE_CANNOT_SET_HOLD and C-117.21 HOLD_REFUSED keep where `actionHold > is-hold`, but R56's actionHoldRelease raises both too; actions should mint them there through that one region (a shared helper), or BOB re-points those wheres here.

## J2 · COMPLETE

N518 applied: R9 holds C-117.23-.25, merged-first ready on job/T27/action-grammar. Module tests 25/25, actions 66/66, format/architecture/coverage/ownership 0 failures. Awaiting stamp (red 2): C-117.23, C-117.24, C-117.25. Record has the details; REPORT J1 names the regions actions must write.
