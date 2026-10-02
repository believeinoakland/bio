# actions (T27)

**Status** · session_015hujGgkB8skFWudt1A18AM · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

The `where` of the three new rows (action-grammar R9, C-117.23–.25), so the row and my region agree. My reading, which I am building on: each code is minted at one site, and C-117.20–.22 keep their `where` unchanged (`actionHold > is-hold`, `actionHold > is-hold-legal-mark`): `actionHoldRelease` (R56) and `holdReleasePreview` (R57) run through `actionHold`'s own body under an internal mode (a Symbol no request can carry), so MACHINE_CANNOT_SET_HOLD, HOLD_REFUSED and HOLD_NO_LEGAL_MARK are still minted only in those regions. The new rows' `where`, for ACTION-GRAMMAR #5:
- C-117.23 `HOLD_RELEASE_IS_ITS_OWN_ACT`: `src/actions/index.mjs actionHold > is-hold-release-own-act`
- C-117.24 `HOLD_PROJECTS_REFUSED`: `src/actions/index.mjs #holdProjects > is-hold-projects` (one helper, asked by `actionHold` (R52) and `projectHolds` (R58))
- C-117.25 `HOLD_ALREADY_RELEASED`: `src/actions/index.mjs actionHold > is-hold-already-released`
If action-grammar has chosen others, tell me and I will rename my regions to match.

Also, decided as mine unless you say otherwise: R58's "a read it cannot complete is a refusal" answers `{ok: false, reason: "HOLDS_UNREADABLE"}` (no catalogue row; R58 names no code).

## J2 · REPORT

A test in another module that my change makes red (no fault of affordances' code): `bio-plane/test/m/affordances/backing.test.mjs:182` ("R19 R2: actionhold, graded `reasoned`") calls `actionHold({hold: "released", reason: ""})` and expects `HOLD_REFUSED`, then `actionHold({hold: "released", reason: "…"})` and expects it to land. Under amended R52 a release through `actionhold` is refused `HOLD_RELEASE_IS_ITS_OWN_ACT` (C-117.23) before the reason is judged; a release is `actionHoldRelease` (R56, `op=actionholdrelease`, rung `terminal`). It goes red when actions merges and stays red until affordances' L11 job (its R33) re-points it: drive only `in_place` through `actionhold` for R19, and the release through `actionHoldRelease`. On `tranche/T27` it passes today; on my branch: 147 pass, 1 fail (this one).
Other users' tests on my branch: queue 97/0, queue-producers 70/0, op-declarations 35/0, action-clocks 32/0, filings 60/0, escalation 52/0, action-plans 53/0, monitoring 99/0, capture 116/0; control-plane 127/1, its R22 (accepted red 4, the same on the tranche).
Status: all entries built and pushed (`job/T27/actions` @ HEAD); my own tests pass except the two assertions that read action-grammar's C-117.23 and C-117.25 rows, which wait for its merge. I complete after your CHANGE.

## J3 · COMPLETE

**Entries applied.** N518 (DEC-113's server side; K1252, K1253, K1262): R36, R52, R56–R60, on `job/T27/actions` merged with `tranche/T27` after action-grammar (K1282).
- R52: `actionHold` records each `in_place` statement's projects (the action's own, from `record-core`'s `bundleInfo`, and up to 50 named; table `action_hold_projects`, keyed by `bundle_id`); a hold covers every `in_place` statement's projects since its last release; refusals in R52's order, with `HOLD_RELEASE_IS_ITS_OWN_ACT` (C-117.23), `HOLD_PROJECTS_REFUSED` (C-117.24), then `existenceAct` / `noSuchProject` for the first named project not seen at FULL. Answers and the read (R25, now passed the viewer by retrieval's decoration and `actionRead`) show only projects the viewer sees; a release's statement shows its `restarted`.
- R56 `actionHoldRelease` (`op=actionholdrelease`), R57 `holdReleasePreview` (`op=actionholdpreview`): run through `actionHold`'s body under a Symbol mode, so C-117.20–.22 stay minted at their regions; `HOLD_ALREADY_RELEASED` (C-117.25); `restarted` computed and written in one `record.transact` with the statement.
- R58 `projectHolds` (`op=projectholds`; list, JSON or comma-separated ids); a failed read answers `HOLDS_UNREADABLE` (K1281).
- R59 `holdsReleased` (cursor `<action>#<ord>#<seq>`; `placers`, viewer-filtered `restarted`). R60 `purgeHeld` (synchronous; true when unreadable; never throws).
- R36: `action_hold_projects` in `ACTIONS_TABLES`, declared to the purge.

**Deferred.** None.

**Catalogue rows added by this job.** None (C-117.23–.25 are action-grammar's, merged with my `where`s; they read `awaiting stamp` until T28, accepted red 2).

**Found in other modules.** `affordances` `test/m/affordances/backing.test.mjs:182` (its R19) releases through `actionhold`: red from this merge until affordances' L11 job re-points it (J2). `control-plane` R22: accepted red 4, unchanged. Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale by this module's source; BOB regenerates at the layer close.

**Tests and checks** (on the merge with `tranche/T27` @ K1282):
- `node --test test/m/actions/`: tests 74, pass 74, fail 0. `test/m/action-grammar/`: pass 25, fail 0.
- Users: queue 97/0, queue-producers 70/0, op-declarations 35/0, action-clocks 32/0, filings 60/0, escalation 52/0, action-plans 53/0, monitoring 99/0, capture 116/0; affordances 147/1 (above); control-plane 127/1 (accepted red 4).
- `format`: 0 failures. `architecture actions`: 0 failures. `coverage actions`: 48 of 48 live ids named by a test, 0 failures. `ownership actions tranche/T27`: 0 failures.

Size (session_015hujGgkB8skFWudt1A18AM): test runs 14, module lines 2884
