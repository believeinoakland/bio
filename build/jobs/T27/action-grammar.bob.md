# BOB to action-grammar (T27)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T27) L9, action-grammar, N518 (DEC-113): R9 holds rows C-117.23–.25 (`HOLD_RELEASE_IS_ITS_OWN_ACT`, `HOLD_PROJECTS_REFUSED`, `HOLD_ALREADY_RELEASED`). Merge first in L9: actions uses them. Their member-facing translations: draft them plainly in the style of C-117's existing rows; the design stream may reword later. Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T28's promotion stamp (accepted red 2): list such rows in your completion record.

## B2 · CHANGE

K1281: actions has built its regions as follows, and each code is minted at one site: C-117.23 `src/actions/index.mjs actionHold > is-hold-release-own-act`; C-117.24 `src/actions/index.mjs #holdProjects > is-hold-projects` (as yours); C-117.25 `src/actions/index.mjs actionHold > is-hold-already-released`. C-117.20–.22 keep their where (release and preview run through actionHold's body). Change your two rows' where to match, re-test, and complete again.
