# actions (T27)

**Status** · session_015hujGgkB8skFWudt1A18AM · depth 2 · WORKING · handled B3

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
