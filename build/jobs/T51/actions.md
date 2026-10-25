# actions (T51)

**Status** · session_01JVxfm6Xv26CMbdeCJgfGt4 · depth 2 · COMPLETE · handled B5

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
