# actions (T27)

**Status** · session_015hujGgkB8skFWudt1A18AM · depth 2 · WORKING · handled B1

## J1 · QUESTION

The `where` of the three new rows (action-grammar R9, C-117.23–.25), so the row and my region agree. My reading, which I am building on: each code is minted at one site, and C-117.20–.22 keep their `where` unchanged (`actionHold > is-hold`, `actionHold > is-hold-legal-mark`): `actionHoldRelease` (R56) and `holdReleasePreview` (R57) run through `actionHold`'s own body under an internal mode (a Symbol no request can carry), so MACHINE_CANNOT_SET_HOLD, HOLD_REFUSED and HOLD_NO_LEGAL_MARK are still minted only in those regions. The new rows' `where`, for ACTION-GRAMMAR #5:
- C-117.23 `HOLD_RELEASE_IS_ITS_OWN_ACT`: `src/actions/index.mjs actionHold > is-hold-release-own-act`
- C-117.24 `HOLD_PROJECTS_REFUSED`: `src/actions/index.mjs #holdProjects > is-hold-projects` (one helper, asked by `actionHold` (R52) and `projectHolds` (R58))
- C-117.25 `HOLD_ALREADY_RELEASED`: `src/actions/index.mjs actionHold > is-hold-already-released`
If action-grammar has chosen others, tell me and I will rename my regions to match.

Also, decided as mine unless you say otherwise: R58's "a read it cannot complete is a refusal" answers `{ok: false, reason: "HOLDS_UNREADABLE"}` (no catalogue row; R58 names no code).
