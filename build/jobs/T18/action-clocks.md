# action-clocks (T18)

**Status** · session_01UKdcungjhYbWwBjvB2YNNz · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R3 and R5 answer "the action's project". Nothing in my uses states one: record-core's `bundleInfo` (its R34) answers `bundles.project`, but promotion commits every bundle with `project: null` (`promotion/index.mjs`:800), so for an action it is always null today; `actions` states no project on an action (its R46 `plan` link is action-plans', later in the order). queue-producers R15 routes "else its project's owners" on it.

My best reading, which I am building: `project` is record-core's `bundleInfo(action).project`, null where the record holds none (so null today), stated as such; the member who created the action (R3) is the author of its first manifest entry in write order (record-core R15/R16). If the project should come from elsewhere (the determination it rests on, via conformance; or the plan, via a field `actions` exposes in `actionRead`), that is a uses or requirements change for BOB; I will bring R3/R5 in line on your answer. Not blocking: nothing else I build depends on it.

## J2 · COMPLETE

**Entries applied** (layer 9, action-clocks; K617, K624 (1), (3)). Commit `754ee44b38`.
- **N-A20, the split by copy (no `from`).** `bio-plane/src/action-clocks/`: `pendingClocks` with its two bounds (R1, was `actions` R31), `clockPropose` with `computeDeadline` (now exported) and the clock subject of the proposal label (R2, was R32), the `action_clock_proposals` table (`schema.mjs`) and `PENDING_CLOCKS_BAD_BEFORE`'s row (`checks.mjs`, C-117.5, `where` re-pointed to `src/action-clocks/index.mjs pendingClocks > is-pending-before`), comments carried. R1's paging is one helper (`#entryPage`) that R3 shares; R1's behaviour is unchanged (its moved tests pass with their assertions). Tests moved, renamed R31 → R1, R32 → R2 (`clocks.test.mjs`); R35's share is R7's test (`overdue.test.mjs`). Nothing in `actions`' paths was touched; `actions`' job deletes its copy.
- **R3 `overdueClocks`** (the fold's `actions` R50): every `overdue` entry, or `pending` entry dated before the instance clock's UTC day, of visible actions not `resolved`/`abandoned`, with `status` (stored) beside `past` (derived, R7), the action's `project` and `created_by`; paged as R1 over every open action in id order (an `overdue` entry is not in the projection's clock, so no seek narrows it).
- **N-A15, the reminders (R4–R6, R8).** Table `action_reminders` (rid, bundle_id, entry, day, set_by, set_at, answered_at, removed_at); `reminderSet` (`op=reminderset`), `remindersFor`, `remindersDue`, `reminderAnswer` (`op=reminderanswer`); `actionClocksOps(m, url, body)` for the two ops, stamps read from the query only. Refusals `MACHINE_CANNOT_SET_REMINDER` C-123.1, `REMINDER_REFUSED` C-123.2 (with `arm`: entry, on, from, held, bound), `NO_SUCH_REMINDER` C-123.3; `NO_SUCH_ACTION` through `actions.noSuchAction`. No act or read writes an action's document (tested byte-identical).
- **R9.** `actionClocksOf` declares `action_reminders` to purge, and `action_clock_proposals` in a declaration of its own: while `actions` still declares that table, record-core refuses the second declaration (`TABLE_DECLARED`) and `actions`' purge clears it; once `actions`' job drops it, this module's declaration holds it. Tested: both tables purge with the action.

**Marks this work meets (rule (5)), for BOB to strike:** R3, R4, R5, R6, R8, R9 (R9's table now declared here, in effect once `actions`' copy goes).

**Rows `awaiting stamp` (rule (4)):** C-117.5 `PENDING_CLOCKS_BAD_BEFORE` (copied, `where` changed; `actions`' copy deleted by its job), and new C-123.1, C-123.2, C-123.3. C-123 is the next family after the highest I find on `tranche/T18` (C-122); if another T18 job has taken C-123, renumber mine.

**My readings of details the requirements leave open (BOB's to overrule; recorded here once):**
1. R3/R5 `project` is record-core's `bundleInfo(action).project` (null today: J1 asks); `created_by` is the author of the action's first manifest entry in write order.
2. R4's bound of 50 counts *standing* reminders (neither answered nor removed); "held" likewise. A change at the bound is not a 51st; a removal or an answer frees a place.
3. R5's order is (action, entry, day, member) so it is total; its cursor is `<action>#<entry>#<day>#<member>`, and `after` also takes an action id (after all its reminders).
4. R6 answers every due, unanswered reminder of the author's on that entry at once; `answered` is the list of their days. Answering onto a day already held keeps one reminder there. `on` must be a real date after the instance clock's UTC day.
5. A date is a real calendar day (`2026-02-30` refused), for `on` and for an entry R4 accepts.
6. `remindersFor` lists standing and answered reminders (removed ones are gone), at most 500 with `truncated`.

**Deferred.** None.

**Found in other modules** (also posted as REPORT):
- `promotion`: commits every bundle with `project: null` (`promotion/index.mjs`:800), so `bundleInfo().project` holds no project for an action (J1).
- `actions` (its job, next): delete the copy (`pendingClocks` and bounds, `clockPropose`, `computeDeadline`, the `clock` subject of `proposalLabelFor`/`PROPOSAL_SAYS`, `action_clock_proposals` in schema and `ACTIONS_TABLES`, row C-117.5, tests R31/R32). After that, record-core's purge counts `action_clock_proposals` under action-clocks.
- `legacy-store` (layer 10, K671): spread `actionClocksOps` in its dispatch and construct `actionClocksOf`. `op-declarations`: specs for `reminderset` and `reminderanswer` (both mutate; a member's act; `MACHINE_CANNOT_SET_REMINDER` refuses machines at the module). `control-plane`: `ACTION_CLOCK_CHECKS` in `CHECK_FAMILIES`.
- No generated artifact made stale (nothing imports the module yet).

**Tests and checks.**
- `node --test bio-plane/test/m/action-clocks/`: tests 19, pass 19, fail 0. With `test/m/actions/`: tests 66, pass 66, fail 0.
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture action-clocks`: 7 product files, 26 relative imports; 0 failures. `coverage action-clocks`: 9 of 9 live requirement ids named by a test; 0 failures. `ownership action-clocks tranche/T18`: 8 files changed; 0 failures.

Size (session_01UKdcungjhYbWwBjvB2YNNz): test runs 7, module lines 638

## J3 · REPORT

Other modules, from J2: (1) promotion commits every bundle with project: null (promotion/index.mjs:800), so record-core's bundleInfo().project is null for every action (see J1). (2) actions' job: delete the clock copy as J2 lists; after it, action_clock_proposals purges under action-clocks' declaration. (3) legacy-store (K671): construct actionClocksOf and spread actionClocksOps; op-declarations: specs for reminderset and reminderanswer (mutating, a member's act); control-plane: ACTION_CLOCK_CHECKS in CHECK_FAMILIES. (4) Catalogue family C-123 taken for the reminders' rows; renumber if another T18 job took it.

## J4 · COMPLETE · re J1

**B2 applied (K702).** Merged `tranche/T18` (`d0f6b0776b`); commit `604cd9cf1a`. R3 and R5 now answer the action's `project` as the project of the first determination among its `rests_on` legs, in the document's order, read through `conformance.determinationRead` with the read's viewer; a leg naming no determination, or a determination the viewer may not see, is passed over (my reading of "first": the first one readable to the viewer); null when it rests on none. `created_by` unchanged (first manifest entry's author). `conformance` is reached through `conformanceOf(host)` unless given (a test passes a stand-in); where it cannot be created, every project reads null. `bundleInfo` is no longer used. J2's reading 1 is replaced by this; its other readings stand.

**Tests and checks.** New test "R3 R5 the action's project … (K702)" (an `advances` leg, a document leg and an unseen determination passed over; the first the viewer sees; null with none; through both reads). `node --test bio-plane/test/m/action-clocks/ bio-plane/test/m/actions/`: tests 81, pass 81, fail 0 (action-clocks 20). `format`: 0 failures; `architecture action-clocks`: 7 product files, 27 relative imports, 0 failures; `coverage action-clocks`: 9 of 9, 0 failures; `ownership action-clocks tranche/T18`: 8 files, 0 failures.

Size (session_01UKdcungjhYbWwBjvB2YNNz): test runs 9, module lines 660
