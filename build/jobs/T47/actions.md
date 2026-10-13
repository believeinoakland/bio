# actions (T47)

**Status** · session_011gY15XFsfDazB1rNzzZijc · depth 2 · WORKING · handled B2

## Progress

**Read:** `build/requirements/actions.md` whole; `build/extraction/actions-split.md` whole; my entry T47-38 and the plan's rules at the opening and the L9 entries (`build/plan/current.md`); BOB's START (B1); `action-records`' public part (Purpose, Provides) and `action-clocks`' R19, R21, R22 and its `count.mjs` `actionZone` (the code R100 moves here); `bio-plane/src/actions/index.mjs` (3,721 lines) and `schema.mjs` whole, myself (P20); `test/m/actions/fixture.mjs` (to line 200) and `t34.test.mjs` and `t46.test.mjs`' R98 part myself. The reading set is over 600 KB (B1), so a helper in this session read every file under `test/m/actions/` in full (2,934 lines) and wrote me a digest citing each test by file and line (K2032, mechanics §17 (3)); the files stay binding. Used modules: their Purpose and the services my Uses names, as B1 directs.

**Done before the CHANGE (N960; R100, R12, R25, R51, R68, R92, R98):**
- `actionZone(fm, view)` is now exported by `actions`, the one spelling of an action's clock zone. It answers the zone of the profile that gives the addressed office (role and body in `view.counterparties`) or, with no office, the kind's venue (`view.action_kinds`); else the view's own zone (`zoneOf`); null with none. It never throws.
- `view` is the view R10 reads (`#governing`, exposed as `governingView()`).
- These are now read in `actionZone`:
  - R12 `actionOverdue` / `actionFacts`: a zone string is still read as the zone itself;
  - the facts registered with retrieval;
  - R25's `clock_overdue` and lifecycle day;
  - R51's audit `ctx.zone`;
  - R92's `clock_overdue`;
  - R33/R98's mechanical clock write.
- `place()` and `zoneOf` are unchanged. They are documented as R68's read for modules with no office. `addresseeSuggest`'s "today" keeps the group's zone (no action's clock is read there).
- Tests: new `t47.test.mjs` (5 tests naming R100 with R12, R25, R92, R51, R98, R33). They use two active profiles of different zones, with the one-profile control. Each was checked to fail with the profile lookup disabled. `t34.test.mjs`' three R68 titles and comment are re-stated to R68's words, with an R100 equality arm.
- actions: 126 pass, 0 fail.
- Users (P11):
  - green: action-holds 37/0, action-clocks 70/0, filings 97/0, escalation 85/0, action-plans 79/0, plan-work 45/0, monitoring 137/0, machinery-producers 24/0, action-producers 45/0, queue 142/0;
  - red: action-replies 17/6, affordances 238/7, op-declarations 144/12, control-plane 235/7, plane 218/5. Those 42 failing tests fail identically with my change stashed, so they are inherited reds, not this job's.

**Next:** wait for BOB's CHANGE after T47-37 (action-records) merges. Then: merge `tranche/T47`; delete the copies (split map §2); re-point through a `records` getter (§3); create `action-records` in `actionsOf`; drop the six tables from `ACTIONS_TABLES`; re-tag and move tests (per the digest: acts:81, acts:193, read:122, t33:146, t41:163, t41:185, t45:248, t45:374, t45:398, t45:512, t45:532, t45:548, t46:113, t46:150, t46:185).

## J1 · REPORT

R100 (N960) is done and pushed (2c0477fb82). actions now exports actionZone(fm, view), the one zone an action's clock is read in. R12, R25, R51, R92 and R98 read it; place() and zoneOf stay as R68's read for modules with no office. New t47.test.mjs (5 R100 tests); t34's R68 pin is re-stated. actions passes 126/0. Users' tests (P11): the reds in action-replies, affordances, op-declarations, control-plane and plane (42 failing tests) fail identically without my change. action-clocks (T47-39) can import actionZone from actions once this merges. I am waiting for your CHANGE after T47-37 (action-records) merges before deleting the copies and re-pointing.
