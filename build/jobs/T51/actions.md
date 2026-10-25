# actions (T51)

**Status** · session_01UPyQp2ZbB7wjPqmg4PELgH · depth 2 · WORKING · handled B9

## Completion (T51-89)

**Entries applied.**
- *Kind id (DEC-329 owed):* `party_participation` is not mine to confirm in code; this module names no kind (R10). Nothing to report beyond the check below: the combined view's vocabulary is `action-grammar`'s and the profile's, so a vocabulary without the id is BOB's to see; REPORTed.
- *R108 (Text: fold):* `actionCorrespond` takes `minutes: {meeting, date, passage: {captureSha, extent}}` (an object or its JSON; `op=actioncorrespond` takes it from the body or `minutes=`), on a `received` entry of a `public_comment` action the combined view names. Order: shape (`BAD_MINUTES`) and the minutes' day (`BAD_DATE`, through `action-records.correspondEntryRefusal`) with the entry's other values; after the action is found, `MINUTES_NOT_PUBLIC_COMMENT` (other direction or kind), then the capture (an unseen one answered as an absent one, `NO_SUCH_BUNDLE`, `target` the capture sha), then content's `checkContentExtent` over `contentContextFor(capture)` (its refusals as content answers them), then the read-back of the flat keys (`BAD_MINUTES`). Kept flat on the entry (K2849): `minutes_meeting`, `minutes_date`, `minutes_capture`, `minutes_extent_<field>` (the leg grammar's flat names, read by content's `citationExtent`). `actionRead` (and the decoration) answers it in `entries[].minutes` as it stands; `Actions.minutesOf(entry)` is the one reader. The write fence (promote) also refuses minutes keys on any entry that is not a received entry of a public comment, or whose minutes day is not a real day, so a revision cannot place them. An entry without minutes writes exactly the bytes it wrote before.
- *T51-89 `holderAt` (lines R11, R24; t33:105 red):* `holder_on_date` answers `{holder: null, undetermined: true, why: {key, vars}, lines}` and passes `lines`' `why` on by key; the module's own branches answer the same shape (`why` = `actions.office_entity_held_addressee`, `actions.why.action_states_date`, `actions.dated_lines_read`, each `vars: {}`); the stale test read a key that never existed and now reads `lines.why.no_line_covers`. `t33.test.mjs`:105 is green.
- *Words (K3949, K3957, K3962, K3986):* the 9 inline findings, the 2 plain ones (one string), the 4 hand-lists, the 3 test copies and the 5 code copies are all converted; `node checks/words.mjs /home/user/bio actions` shows 0 failures, and the thirteen-module L9 run shows no line naming this module. Ids assigned: `actions.index.a_premise_override_is_a`, `.the_teams_contact_for_an`, `.whether_a_body_owes_the`, `.who_spoke_for_the_team`, `.this_action_states_that_the`, `.marking_pressure_directed_at_the` (each a refusal's `detail`), `.minutes_are_the_meeting_one`, `.the_passage_has_a_part` (R108's `BAD_MINUTES`); the copies of existing rows read `word("actions.reply.not_owed", {reason: "{reason}"})` (R99: the placeholder left for the screen, the sentence the same bytes), `word("actions.says.office_entity_found")`, `word("actions.says.action_read_names")`; `MINUTES_NOT_PUBLIC_COMMENT`'s `detail` is `word("screen.action.minutes.notpublic")` (the design's refusal sentence, DEC-341 B335 3). Tests: the foreign codes of two lists are named through the rows action-grammar holds (`fixture.mjs` `mintedIn`), the op list is the module's own arms, `t45`'s moved-codes filter is read from the modules the codes went to, the copies compare with `localize`.
- *New tests:* `t51.test.mjs` (R108 three tests, the `holder_on_date` shape); the fixture's content stand-in answers a capture's context from the real content (`contentContextFor`), overridable per test.

**Deferred.** None.

**Found in other modules (REPORT).**
1. `action-grammar` holds no row for `MINUTES_NOT_PUBLIC_COMMENT` (R108 says "a new row of this module's family, next free number"; the row table is action-grammar's, its R9). Until it is added the refusal answers `{ok, reason, detail}` with no `code`, `check` or `translation`. `BAD_MINUTES` (my choice of name, after `BAD_MEDIUM` and `BAD_PARTY`; R108 names no code for the shape refusal) needs a row too, or BOB's ruling on its name.
2. `holder_on_date` changed shape in every undetermined branch (above): `screens-action` reads only `.holder`, so nothing breaks; a screen that draws the reason draws `word(why.key, why.vars)`.
3. Inherited reds, the same set before and after my change (checked with my changes stashed): filings 2, escalation 2, action-holds 2, action-clocks 8, action-plans 1, screens-action 2 failing tests; none touches `actions`' interface changes.

**Tests and checks.**
- `node --test bio-plane/test/m/actions/`: tests 142, pass 142, fail 0.
- Used modules' tests (filings, escalation, action-holds, action-clocks, action-replies, action-plans, plan-work, action-records, screens-action): failures identical before and after (item 3); action-replies, plan-work and action-records pass in full.
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures. `node checks/architecture.mjs /home/user/bio actions`: 19 product files, 99 relative imports; 0 failures. `node checks/coverage.mjs /home/user/bio actions`: 75 of 75 live requirement ids named by a test; 0 failures. `node checks/ownership.mjs /home/user/bio actions tranche/T51 job/T51/actions`: 0 failures.
- `node checks/run.mjs /home/user/bio`: format and architecture 0 failures; the words check shows no finding in `actions`. `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only (no refusal naming this module).

Size (session_01TXuP7EMXudAZjVe2WhZZQT): test runs 11, module lines 3500

## J1 · COMPLETE

T51-89 actions complete on job/T51/actions (a8663cb94e). R108 met (minutes on a received entry of a public comment, flat on the entry, read in entries[].minutes); holderAt's why passed on by key (t33:105 green); words findings all converted (checks/words.mjs actions: 0; the 13-module run names no line of mine). Module tests 142/142; format, architecture, coverage (75/75), ownership 0 failures. REPORT in my record: (1) action-grammar needs a row for MINUTES_NOT_PUBLIC_COMMENT, and a row or your ruling for my BAD_MINUTES; (2) holder_on_date's undetermined branches now answer {undetermined: true, why: {key, vars}}; (3) used modules' reds (filings 2, escalation 2, action-holds 2, action-clocks 8, action-plans 1, screens-action 2) are identical with my change stashed.

## Completion of B2 (CHANGE)

1. R108 worded (K4041): the passage is recorded as content by the author's act: `content.mint` (`mintedBy` the author, at the extent, the capture's own bundle) once every refusal has passed; `minutes.passage` keeps `content_id` beside `captureSha` and `extent` (flat key `minutes_content_id`). Test (`t51`): the stored passage carries the id, the row is minted by the author, and a second reply at the same extent finds the same row (one content row).
2. `t34.test.mjs`:101 already compares with `localize("actions.index.an_action_recorded_for_a_2", …)` by equality (done in the first pass); the conformance run shows no line naming `actions`. `tranche/T51` merged first.

Tests: `node --test bio-plane/test/m/actions/` 142 pass, 0 fail. words (actions and the 13-module run) 0 findings; format, architecture, coverage (75/75) 0 failures; setup-words check: stale-rows note only.

Size (session_01TXuP7EMXudAZjVe2WhZZQT): test runs 14, module lines 3510

## J2 · COMPLETE

B2 applied on job/T51/actions: R108's passage is minted as content by the author (content.mint) and minutes.passage keeps content_id; t51 tests the id and that a second reply at the same extent finds the same row. t34:101 already compares with localize (no finding). Module tests 142/142; words, format, architecture, coverage, ownership 0 failures.

## B3 (CHANGE), part done before action-grammar merges

`DEC-49 REGION is-minutes` is drawn in `actionCorrespond` around the whole minutes act (shape `BAD_MINUTES`, `MINUTES_NOT_PUBLIC_COMMENT`, the day, the passage's refusals, the content mint); both refusals are minted there by `refuse`, which reads the catalogue rows (code, check, translation) through `withRow` as soon as action-grammar's C-117.59 and C-117.60 are on my branch. Module tests 142/142. To do on BOB's word: merge `tranche/T51` after action-grammar merges, assert the rows on both refusals in `t51`, COMPLETE again.

## J3 · REPORT

B3: region is-minutes is drawn in actionCorrespond (pushed); both refusals are minted through refuse/withRow, so the catalogue rows apply once action-grammar's C-117.59/.60 are merged into my branch. Waiting for your word to merge tranche/T51, assert the rows in t51 and COMPLETE again.

## Completion of B3 and B4

`tranche/T51` merged (action-grammar's C-117.59, C-117.60). `DEC-49 REGION is-minutes` is drawn in `actionCorrespond`; both refusals are raised through the rows: `t51` asserts code, check (`C-117.59`, `C-117.60`) and translation on each. Tests: `bio-plane/test/m/actions/` 142 pass, 0 fail; `bio-plane/test/m/action-grammar/` (its census arm, R28, run on this branch) 80 pass, 0 fail. words (actions) 0, architecture 0, coverage 75/75, format 0, ownership 0.

Size (session_01TXuP7EMXudAZjVe2WhZZQT): test runs 17, module lines 3520

## J4 · COMPLETE

B3/B4 done on job/T51/actions: tranche/T51 merged; region is-minutes drawn; MINUTES_NOT_PUBLIC_COMMENT (C-117.59) and BAD_MINUTES (C-117.60) raised through their rows, asserted in t51. actions tests 142/142; action-grammar tests (R28 census arm) 80/80 on my branch; words, architecture, coverage, format, ownership 0 failures.

## Fix round 10, Wave A batch 2 (B5)

**Fixtures published** (`bio-plane/test/m/actions/fixtures.mjs`, tested by `fixtures.test.mjs`): `actionRead` and `actionsForRefusal`, each made by the real module at test time. Note for BOB: the plan's line says `actionRead` answers `NO_SUCH_BUNDLE`/`NOT_AN_ACTION`; since R106 (T50) the real `actionRead` answers all three (unknown, unseen, no action) as R43's `NO_SUCH_ACTION`; `NO_SUCH_BUNDLE`/`NOT_AN_ACTION` come from `addresseeSuggest`. The fixtures publish what the code answers; users hand-building `NO_SUCH_BUNDLE` from `actionRead` (escalation `fixture.mjs`:162-165, `draft.test.mjs`:143) copy a shape the module no longer gives.

**Own lines done (4 of 6, plus the retrieval one):** `fixture.mjs`:111 now takes retrieval's `actionRegistrar` (delegating wrapper that also keeps each registration in `reg`); `t12`, `t18`, `write.test.mjs` take conformance's `determinationRead` fixture (viewer `pat`, as the fixture publishes).
**Left (3 lines in 2 files + 1 inherited):** `t45.test.mjs`:40 and `t50.test.mjs`:27 need determinations with findings' bases (`checked_held`, `accepted` with `matter_stake`, `published`), a compliant outcome, a void determination with causes, and a live superseded one: conformance's `determinationRead` fixture publishes none of these (FIX-E, conformance is earlier; needs a conformance fixture, a product cause for BOB). `t12.test.mjs`:55 is one arm (non-live, no successor, `superseded_by` null) conformance's fixture cannot reach; I kept it as its own test rather than drop it. `t45.test.mjs`:45 is consequences' (not done in this job, as B5 says).
**Markers added:** none (`fixtures-own` 0, `fixtures-generic` 0).

**Checks:** module tests 151/151; fixtures `--list` 4 failures left (above); words 0 failures; format 0; architecture 0; coverage 76/76; ownership 0. `impact.mjs` lists no source change of mine (tests only).

Size (session_01JVxfm6Xv26CMbdeCJgfGt4): test runs 9, module lines 0

## J5 · COMPLETE

COMPLETE (B5). Published fixtures actionRead, actionsForRefusal (fixtures.mjs, tested). Own lines: fixture.mjs:111, t12:16, t18:16, write:153 re-pointed to retrieval/conformance fixtures. Left: t45:40 and t50:27 need conformance fixture variants (finding bases, void, compliant, live-superseded): product cause for BOB; t12:55 one arm (superseded_by null) unreachable by conformance's fixture, kept as own test; t45:45 is consequences'. Note: real actionRead answers NO_SUCH_ACTION (R106), not NO_SUCH_BUNDLE/NOT_AN_ACTION as the plan says; escalation fixture.mjs:162-165 and draft.test.mjs:143 copy a stale shape. No fixtures-own/generic markers added. Tests 151/151; words, format, architecture, coverage, ownership 0 failures. Details in record.

## Completion of B6 (item 1: actioncreate for a member outside the project)

**Cause** (diag2-04 §10), re-read at `index.mjs` (actionCreate's promote): it passed no `actorMemberId`, so promotion R53's participant check (`filer` null) never ran. **Fix:** `actionCreate` now stamps `actorIdentity`, `actorViewer` and `actorMemberId` (`membership.positionalMember(viewer ?? author, author)`, null for a machine credential), as `intent` does. **Met:** actions R47 (with promotion R53).

**Test** `create-participant.test.mjs`: a stranger's `actionCreate` into a project is refused `PROMOTE_NOT_A_PARTICIPANT` and no action is written (red on the earlier code: accepted); controls: a joined member, an invited member and the owner succeed; the machine path (`class:daemon`) is unchanged.

**Why the tests missed it:** promotion's tests drive `promote` with `actorMemberId` stamped, and actions' tests called `actionCreate({document, author})` with only members of no project or with no non-member case, so the unstamped path was never asked.

**Other promote calls** (`#revise` at 615 and its callers, the calls at ~1607, 1943, 2206, 2323, 2406): these revise an action already filed; I left them unstamped. Stamping them would make promotion's R53 refuse a reader who is not in the project from corresponding on a public action, a policy question, not this cause. REPORT for BOB: say if R53 should also fence revisions by non-participants.

**Checks:** actions tests 154/154 (+3); format, architecture, coverage (76/76), words, ownership 0 failures; `fixtures.mjs actions --list` 4 failing lines, the same as before (t12:55, t45:40, t45:45, t50:27); no marker added.

Size (session_019WFFDn8nuGumB6cnvbuWah): test runs 5, module lines 3525

## J6 · COMPLETE

B6 item 1 done: actionCreate now stamps actorIdentity/actorViewer/actorMemberId, so a stranger is refused PROMOTE_NOT_A_PARTICIPANT, nothing written (create-participant.test.mjs; controls: joined, invited, owner, machine). Met: actions R47. Tests 154/154; format, architecture, coverage 76/76, words, ownership 0; fixtures list unchanged (4). REPORT: other promote calls (revisions of filed actions) left unstamped; stamping them would fence non-participant readers from corresponding: BOB's policy call (see record).

## Completion of B7 (item 1: an entry stored overdue keeps the overdue flag)

**Cause** (diag2-11 §5), re-read at `index.mjs`: `actionOverdue` returned false when `actionClockNext` found no pending entry, and judged only the entries dated `next`, so an entry monitoring's recheck had stored `overdue` (R33) dropped out. **Fix:** `actionOverdue` answers true first when any clock entry is stored `overdue` (no zone needed); `actionClockNext` is unchanged. Every reader (`actionRead`, the derivation for the projection, `openItems`' `overdue_replies`, `derived`) goes through `actionOverdue`, so all follow. **Met:** actions R110 (with R12, R33).

**Test** `t46.test.mjs` (R110): one pending plus one stored overdue gives `clock_next` the pending date and `clock_overdue` true (red on the earlier code: false); only an overdue entry gives `[null, true]`; controls: both pending and the first passed, a met entry (false), a pending entry not yet due (false).

**Why the tests missed it:** `read.test.mjs` tested `clock_overdue` over pending entries only; `t33`/`t46` moved an entry to `overdue` and asserted the write was allowed, never read the flag afterwards.

**For BOB:** escalation's branch order (`clock_overdue` before `!clock_next`) is escalation's own job (its R39), as B7 says.

**Checks:** actions tests 155/155; escalation, action-holds, action-clocks tests 239/239; format 0, architecture 0, coverage 77/77, words 0, ownership 0 failures; `fixtures.mjs actions --list` the same 4 failing lines as before (t12:55, t45:40, t45:45, t50:27); no marker added.

Size (session_01PKkGxxBeG3fsZEM17Gs4pa): test runs 6, module lines 3535

## J7 · COMPLETE

B7 item 1 done: actionOverdue is true when any clock entry is stored overdue; clock_next unchanged. Met: actions R110. t46 test (red before: false; green), controls pending/met/not-yet-due. Actions tests 155/155; escalation, action-holds, action-clocks tests 239/239; format, architecture, coverage 77/77, words, ownership 0 failures; fixtures list unchanged (4 lines). Escalation's branch order is its own job (R39).

## J8 · REPORT

Two of my four fixture lines stay red. Each needs a fixture that conformance publishes, which is outside this module's paths. Cleared or changed in this job: t45:45 (consequences' published successRecordRead), t12:55 (removed, item 3), and a product defect (see COMPLETE).

1. **t45.test.mjs:41 (the determinations).** Conformance's published fixtures split the states t45 reads, and none gives all of them. determinationRead gives a live noncompliant determination on a published finding, a superseded one with its successor, and an unclear one. determinationVariants gives a checked_held one, an accepted one, a compliant one, and a superseded/live pair. voidDetermination gives a void one with a recorded noncompliant outcome. The missing state is one determination that carries a checked_held and an accepted basis together (t45's NC, which R75's disclosures read as one action with two bases). Splitting NC across fixtures would drop that case, so I did not compose them. Needed from conformance: a published determination with both bases.
2. **t50.test.mjs:27 (matter stake).** Needed: a published accepted basis that carries matter_stake (set at import; conformance's read answers it), one with none, and one whose matter stake reads "undetermined". No conformance fixture publishes a matter stake.
3. **t12.test.mjs:55 (non-live determination with superseded_by null): removed, since conformance cannot produce it.** The only writer of determination_supersessions is conformance/index.mjs:1147, which sets superseded_by to the new determination's id. The schema makes it NOT NULL (conformance/schema.mjs:109). determinationRead sets live = !row and superseded_by from that row (index.mjs:1394). The null-successor branch of determinationSuperseded stays in actions' code and is no longer tested by this file.
4. **consequences:** its published successRecordRead gives only a live record. t45 (e) builds the superseded read by changing the published answer's live and superseded_by in the test. Please have consequences publish a superseded record's read (its R20).

Found in other modules: nothing beyond items 1, 2 and 4.

## J9 · COMPLETE

Fix round 10, plan item 95 (B8). Commit 551d96cce3 on job/T51/actions (after the merge of tranche/T51).

**Entries applied**
- Fixture lines: t45.test.mjs:45 cleared (consequences' successRecordRead, t45.test.mjs:15 and :46). t12.test.mjs:55 removed (REPORT item 3). t45.test.mjs:41 and t50.test.mjs:27 stay open (REPORT items 1 and 2), both needing conformance fixtures.
- Product defect, surfaced by the published read's shape: `#successRecord` (src/actions/index.mjs:1287-1295) read `superseded_by` and `live` at the top level. consequences answers both under `success` (its R20; a superseded record is ok with live false), so a superseded success record passed as a rests_on basis (R8 (e)) and as a recognition basis (R93). Now only a live record passes. Failing-first: t45 "R8 (T45) (e) a success record consequences reads superseded ..." (t45.test.mjs:97), red on the earlier code (accepted, reason undefined), green after the fix. Why the tests missed it: the stand-in read answered the shape the module assumed, so the stand-in agreed with the bug.
- Met: R8 (e) and R93, as tested. BOB to check the marks.
- Markers added: none.

**Tests and checks**
- actions suite 155 of 155 (one case removed, one added), run without --test-force-exit; with affordances/t45-backing 162 of 162.
- Consumer modules that call the write and read paths (filings, escalation, action-plans, action-holds, action-clocks, action-replies, plan-work): 593 of 593.
- `fixtures.mjs actions --list`: 2 failing lines (t45.test.mjs:41, t50.test.mjs:27), per REPORT items 1 and 2. Was 4.
- format 0 failures; architecture 0; coverage 77 of 77; ownership 0 failures (4 files changed by actions).
- `checks/run.mjs`: no finding in actions' files; its failures are in store-assembly, plane, test-support and others, none of which this job touches. No sentence added, so the words count did not rise from my change.
- impact.mjs names 43 modules, because the actions index file is a shared declared-ops table, and this commit does not change DECLARED_OPS. I ran the seven modules above, which call the paths I changed.

Size (session_015KaatnqWiEo9goK9sy5KDU): test runs 7, module lines 3533

## J10 · COMPLETE

Fix round 10, item 97 (2) (K5198): the two fixtures lines in actions' tests. Commit 96f508a24f on job/T51/actions (after the merge of tranche/T51, 61ae2a7123).

**Entries applied**
- `bio-plane/test/m/actions/t50.test.mjs:9-25`: the hand-built `determinationRead` stand-in is removed. The determinations are conformance's published `matterStakeBases()` (`conformance/fixtures.mjs:84`), read through its real `determinationRead` as the participant who sees them (`F.viewer`). Assertions unchanged; `matter_stake` is compared with conformance's own `matterStake`.
- `bio-plane/test/m/actions/t45.test.mjs:1-38`: the stand-in `DETS` and its `NONCOMPLIANT`/`COMPLIANT` imports are removed. The states come from conformance's published fixtures: `voidDetermination()` (VO, the void one, and PUB, the published-finding control), `determinationVariants()` (CO compliant, SU superseded, NC live), `determinationRead()` only as the refusal fallback for an id no fixture holds. A reader routes each id to the fixture it is made in (`conf`, line 38).
- `t45.test.mjs:46-52` (`grounded`): accepts a conformance and an id list, default the five states above.
- `t45.test.mjs:145-160` (R75): grounds its own both-basis determination (`determinationBothBases()`, `REAL.both`) beside PUB. Its disclosure expectations are conformance's own basis: the accepted edition was imported without identity or stake, so it reads `identity: null`, `edition_date: null`, `stake` and `matter_stake` `"undetermined"`, and the checked_held `checked_at` is the scene clock. I checked actions' disclosures against the raw `determinationRead` findings: they match field for field, so actions relays exactly what conformance answers.

**Why the t45 states are split across two fixtures.** Each fixture numbers its determinations from `CONF-2026-0001-determination`, so the ids collide across fixtures (`both`, `voided`, `held`, `live` all share 0001). One actions world cannot hold two determinations with one id. So the default set takes ids unique within it: VO and PUB from the void fixture (0001, 0002), CO, SU and NC from the variants fixture (0003, 0004, 0005). R75 alone needs the both-basis one (0001), so it has its own world with PUB (0002). Every state is conformance's real answer; no field is written by hand.

**Tests and checks**
- Failing first: `fixtures.mjs actions --list` was red before the change (2 failures: `t45.test.mjs:42` the `conf` refusal, `t50.test.mjs:27`); it is at 0 after. The module's tests were green before and after. The first t45 run after the swap had four failures (R8 (a), R8 (d), R75, R76), all from the id collision; after the id split one remained (R75's expected values, which were the stand-in's); after updating those to conformance's values, all 30 pass.
- actions suite: 155 of 155 (`node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/actions/*.test.mjs`), run without `--test-force-exit`; the run exits by itself.
- `checks/format.mjs /home/user/bio`: 178 modules, 0 failures. `checks/architecture.mjs /home/user/bio actions`: 0 failures. `checks/coverage.mjs /home/user/bio actions`: 77 of 77 live requirement ids named by a test. `checks/ownership.mjs /home/user/bio actions <merge-base> HEAD`: 0 failures.
- `checks/fixtures.mjs /home/user/bio actions --list`: 0 failures (0 answers, 0 stubs, 0 codes).
- `checks/run.mjs /home/user/bio`: no finding in actions' files; its 16 failures are in store-assembly, plane and others this job does not touch. The two files I changed add no string literal to product source, so the words count did not rise.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 1 of 178 (actions), affected test files 2 of 2994.

**Met ids**: none change. The two files name the same ids as before (`R8`, `R74`, `R75`, `R76`, `R105`, `R106`, `R107`, plus the t45 and t50 ids in their titles). No requirement was edited.

**Markers added**: none. No `fixtures-own` or `fixtures-generic`.

**Deferred**: none.

**Found in other modules**: none new. This closes REPORT items 1 and 2 of my earlier record (J8), now that conformance (#28) publishes these states. One note for BOB, not a defect: conformance's fixtures each number their determinations from 0001, so a test cannot put two of its states in one world. A single published fixture holding NC (both bases), CO, VO, SU and PUB with distinct ids would let t45 ground all five in one world without the split above.

Size (session_01UPyQp2ZbB7wjPqmg4PELgH): test runs 8, module lines 3533
