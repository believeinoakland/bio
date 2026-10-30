# events.md: the 13 ambiguities settled against the code (tranche)

Read whole: `build/plan/trims/events.notes.md`, `build/requirements/events.md`, `bio-plane/src/events/index.mjs`, `uses.mjs`, `recorded.mjs`, `time.mjs`, `follow.mjs`, `owner.mjs`, `reasons.mjs`, and `bio-plane/src/content/extent.mjs` (for `canonicalExtent`). Test names were found by grep only and are not cited as evidence. Every old text quoted below occurs exactly once in events.md (checked with `grep -cF`). Where a step says "insert after X", replace X with X followed by the new text.

## 1. `sequence({a, b})` heading misplaced
**Code.** `sequence({a, b, viewer = "class:admin"})` (index.mjs:1385) runs R31 and R51: it answers dated order first (`#datedOrder`, 1364-1369), then cited `precedes` (`#citedOrders`, 1372-1380). It refuses `NO_SUCH_EVENT` when either end does not resolve (1387). R52 is used by `proceedingStatusAt` (1432-1434). R53 is `timeline` (1205-1269).
**Change (three edits).**
- (a) Old: `**sequence({a, b})** (stage 2a)\n- **R52** (T48; K231; K3207; amends R34) R34's `NOT_A_PROCEEDING` is `entities.notAProceeding`'s answer (its R53).\n`. New: empty. Remove the heading and the R52 line.
- (b) Old: `- **R31** `before`, `after` or `undetermined` with why`. New: `**sequence({a, b, viewer})** (stage 2a)\n- **R31** `before`, `after` or `undetermined` with why`. Optionally, also move the R51 line to just after R31, because R51 is `relate`'s `precedes` and `sequence`'s cited answer.
- (c) Insert after `never a default stage.` (end of R34): `\n- **R52** (T48; K231; K3207; amends R34) R34's `NOT_A_PROCEEDING` is `entities.notAProceeding`'s answer (its R53).`
- FINDING F1: `sequence` defaults an absent `viewer` to `"class:admin"` (index.mjs:1385), so an in-process caller with no viewer sees every `precedes` relation. Terms says "Viewer: … absent, fail closed". The ops arm passes `q("viewer")`, which is null and is not defaulted (1565). This is a defect for the job. Do not state the default in the requirements.

## 2. R6 `USE_NEEDS_ITS_ACT` position
**Code.** `createEvent` checks a use kind first, before `#checkCreate` (index.mjs:553-554). The three kinds are in `EVENT_KINDS` (66-68), so `UNKNOWN_EVENT_KIND` can never come first for them. In effect, `USE_NEEDS_ITS_ACT` comes before every other refusal.
**Change.** Old: `` `discretion`, `waiver`, `assessment` get `USE_NEEDS_ITS_ACT` (after `UNKNOWN_EVENT_KIND`; only R43/R44 hold them, with facet)``. New: `` `discretion`, `waiver`, `assessment` get `USE_NEEDS_ITS_ACT` before any other refusal (only R43/R44 hold them, with facet)``.
- FINDING F2 (gap): R7 does not state two refusals inside `#attestationFrom` that `createEvent`, `attest` and `addParticipant` all answer. Machine testimony gets `MEMBER_ACT_ONLY` (index.mjs:476). A testimony `project` that is unheld or unseen gets `membership.noSuchProject` (484-487). Suggested addition to R7, after `Testimony carries the member's statement (`NO_STATEMENT` if blank), grade D.`: ` Testimony is a member's (machine: `MEMBER_ACT_ONLY`); its optional `project` is a held project bundle the member sees (`membership.noSuchProject`).`

## 3. R43 refusal order incomplete
**Code** (uses.mjs:77-113), in this order:
1. `KIND_NOT_DISCRETION` (79-80).
2. `MEMBER_ACT_ONLY` (81).
3. R6's refusals via `checkCreate` (82-83).
4. `PROVISION_MALFORMED` (85).
5. `STATED_REASON_MISSING`, then the reason's extent refusals (86-89).
6. `OUTCOME_UNKNOWN`, then the outcome's extent refusals (90-93).
7. `QUESTION_NOT_HELD` (94-95).
8. Last, for a waiver: `WAIVER_NO_SCOPE`, then the scope's extent refusals, then `NO_EXTENT` if `conditions` is not a list, then each condition's extent refusals, then `BAD_DATE` on `expiry` (97-103). For a discretion: `FIELD_NOT_FOR_KIND` for `scope`, `conditions`, `expiry`, in that order, naming the field (105-106).

**Change.** Old: `` `QUESTION_NOT_HELD` as R1. A `waiver` needs `scope` (`WAIVER_NO_SCOPE`), an extent stating what is waived for whom; `conditions`, extents, empty "no conditions stated"; `expiry`, a `civil-time` date-time or null "no expiry stated" (`BAD_DATE` as R1); on `discretion` these are `FIELD_NOT_FOR_KIND`, named.``
New: `` `QUESTION_NOT_HELD` as R1; last, in this order, a `waiver` needs `scope` (`WAIVER_NO_SCOPE`, then R1's extent refusals), an extent stating what is waived for whom; `conditions`, a list of extents (not a list: `NO_EXTENT`), empty "no conditions stated"; `expiry`, a `civil-time` date-time or null "no expiry stated" (`BAD_DATE` as R1); on `discretion` these are `FIELD_NOT_FOR_KIND`, named, in that order.``

## 4. R44 refusal order unstated
**Code** (uses.mjs:118-146), in this order:
1. `MEMBER_ACT_ONLY` (119).
2. R6's refusals (120-121).
3. `PROVISION_MALFORMED` for `provision` (122-123).
4. `PROVISION_MALFORMED` if `unmet` is given and is not a list (124).
5. For each item: `PROVISION_MALFORMED` (128-129), then `UNMET_NOT_CITED` (131), then the citation's R1 extent refusals (132-133), then `EXTENT_NOT_IN_CAPTURE` if the item's capture does not attest the assessment (125, 134-135).
6. `QUESTION_NOT_HELD` (138-139).

There is no `KIND_NOT_DISCRETION`.
**Change.** Old: `` `MEMBER_ACT_ONLY`, `QUESTION_NOT_HELD` as R43.``. New: `Refusals write nothing, in order: `MEMBER_ACT_ONLY` (as R43), R6's, `provision`'s, each `unmet` item's (`PROVISION_MALFORMED`, `UNMET_NOT_CITED`, R1's extent refusals), `QUESTION_NOT_HELD` as R1.`
- FINDING F3: no requirement asks that an `unmet` item be cited in a capture attesting the assessment (`EXTENT_NOT_IN_CAPTURE`, uses.mjs:125, 134-135). BOB decides. If it is intended, add to R44 after "the capture extent stating it": `, in a capture attesting the assessment (else `EXTENT_NOT_IN_CAPTURE`)`. If not, the job removes the check.

## 5. R58 cites "R7's `sameAttestation`"; R7 names none
**Code.** `attest` answers `{ok: true, already: true, event_id, attestation_id}`, writing nothing, when the event already holds an equal attestation (index.mjs:622-623). "Equal" means the same `form`, `dated_fact_id`, `capture_sha`, `extent`, `source_row`, `statement`, `value` and `bundle_id` (`#sameAttestation`, 630-636). `followedRegister` and `followedImport` reuse it through `rowAttestation` (follow.mjs:85).
**Change (two edits).**
- R7: insert after `Testimony carries the member's statement (`NO_STATEMENT` if blank), grade D.`: ` `attest` of an attestation the event already holds (same form, fact, capture, extent, source row, statement, date) answers `already: true`, writing nothing.` If F2 is also taken, put this sentence after F2's.
- R58. Old: ``never repeated (R7's `sameAttestation`)``. New: `never repeated (R7's repeat)`.
- FINDING F4 (gap): R7 did not state the repeat behaviour, although the code has it and R58 relies on it. The R7 edit closes the gap.

## 6. `followedRegister` has no service heading
**Code.** `followedRegister({captureSha, proceeding, by = MACHINE})` (follow.mjs:310) is exposed as the instance method (index.mjs:1503) and as the R36 arm `registerimport` (1555). It refuses, in order:
1. `NO_ENTITY` when `proceeding` is blank (311).
2. `NO_SUCH_ENTITY` (312).
3. `NO_SHA` (313).
4. `CAPTURE_NOT_HELD` (315).
5. `NOT_A_REGISTER` (317).

**Change (two edits).**
- Old: `**A register row as an event**\n- **R38** A court register row`. New: `**followedRegister({captureSha, proceeding, by})** (a register row as an event; the machine's writes)\n- **R38** Refuses, in order: `NO_ENTITY`, `NO_SUCH_ENTITY` (the proceeding), `NO_SHA`, `CAPTURE_NOT_HELD`, `NOT_A_REGISTER` (R58). A court register row`.
- R58. Old: ``**One register entry, one event.** `followedRegister({captureSha, proceeding, by})` takes``. New: ``**One register entry, one event.** `followedRegister` takes``.
- FINDING F5: R38 says "only for a followed proceeding". The code checks only that the proceeding is a registered entity (follow.mjs:311-312). It does not check that it is followed, and does not check that its kind is `proceeding`. R22 has the same gap: it checks only the shape of `NO_BODY`/`NO_PERIOD`, then `NO_SUCH_ENTITY` on the body after `NOT_LEGISTAR` (follow.mjs:119-128), and that last refusal is not in R22's list. BOB decides whether the caller (`following`) holds this duty, and then rewords R38/R22 or routes a fix.

## 7. R49's refusal shape differs from Terms
**Code.** `refused(code, why)` answers `{ok: false, refused: code, code, reason: code, why}`, with no `detail` and no catalogue row (recorded.mjs:18-19). Only `VIEWER_MISSING` (35-36) and `EXTENT_MALFORMED` (40-41) use it. `NO_SHA` is `extraction.noSha`, which is Terms' shape (37).
**Change.** Old: ``` `VIEWER_MISSING` and `EXTENT_MALFORMED` answer `{ok: false, refused, code, reason, why}`, no catalogue row``` . New: ``` `VIEWER_MISSING` and `EXTENT_MALFORMED` answer `{ok: false, refused, code, reason, why}` (the first three each the code) in place of Terms' shape, no catalogue row```.
- FINDING F6: on any internal throw, `recordedBy` answers `RECORDED_BY_UNREADABLE` in Terms' shape (recorded.mjs:120-122). That code is not among R49's refusals. Either name it in R49 ("a read that fails answers `RECORDED_BY_UNREADABLE`, never a throw") or the job drops it. BOB decides.

## 8. R49's two definitions of `EXTENT_MALFORMED`
**Code.** The refusal is given only when the extent is not an object whose `kind` is a key of `CONTENT_EXTENT_KINDS` (recorded.mjs:22, 39-41). `content.canonicalExtent` never refuses; it always gives a string (extent.mjs:2 "nothing here throws", 114-126). So "an extent `canonicalExtent` cannot read" is empty, and the K2114 definition is the only one in force.
**No change.** The trimmed R49 already states only the K2114 definition: "(not an object of a `content` `CONTENT_EXTENT_KINDS` kind)". An extent of a known kind with bad fields is not refused; it is related by `extentRelation`, and its answer for such an extent was not read (`extent-core.mjs` unread).

## 9. R61 silent on withdrawn events in `timeline`
**Code.** `withdrawEvent` sets `withdrawn_*` on the row (index.mjs:991-992). No read filters on it:
- `#itemsFor` keeps withdrawn events, listed and counted, each with `withdrawn: {by, at, reason}` or null (1148, 1155, 1166). This covers `eventsFor` (1195), `statementsOf` (1419), the `timeline` world lane (1222, 1230) and its count.
- `readEvent` answers `withdrawn` (1115).

**Change.** Old: ``The event stays, shown withdrawn (who, when, why) by `readEvent` and `timeline` (`withdrawn`); nothing deleted``. New: ``The event stays, listed and counted as before by `readEvent`, `eventsFor`, `statementsOf` and `timeline`, each answering `withdrawn` `{by, at, reason}` (null when not); nothing deleted``.
- FINDING F7: `usesOf` filters only `event_uses.withdrawn` (uses.mjs:228). A use event withdrawn by `withdrawEvent` (R61) is still answered in R46's population, while R46 says "Unwithdrawn". A defect for the job, or BOB states which withdrawal R46 means.

## 10. R60's "no refusal names which captures exist" not in R53
**Code.** `timeline` refuses only `NO_SET`, `AUDIENCE_UNKNOWN`, `TOO_MANY_CAPTURES` (by count only) and `BAD_DATE` (index.mjs:1209-1215, 1234, 1265). An unheld capture and a hidden one add no rows, alike (`#datedLane` 1277-1278; `#eventsCiting` 1345-1346).
**Change (two edits).**
- R53. Old: `unheld and hidden captures add nothing, alike.` New: `unheld and hidden captures add nothing, alike, and no refusal names which captures exist.`
- R60. Old: `An unknown capture adds nothing, as a hidden one (no refusal names which exist).` New: `An unknown capture adds nothing, as a hidden one (R53).`
- FINDING F8 (gap): `timeline`, `eventsFor`, `statementsOf` and `usesOf` refuse `BAD_DATE` for an unreadable `from`/`to` (index.mjs:1176-1182, 1196, 1234, 1265, 1421; uses.mjs:239). R27-R29, R33, R46 and R53 do not list it. Suggest adding to R29: ``; an unreadable `from`/`to` is `BAD_DATE` (R1), nothing read`` (R27, R33, R46, R53 inherit it through "as R29"/"as R27").

## 11. R55-R57 under `### Suggestions`
**Code.** All three are built and named by tests:
- R55: `DECLARED_OPS` is exported beside the ops map (index.mjs:1577-1586). Tests: `declared-ops.test.mjs` "R55 …".
- R56: `SLICE = 50` bound values per statement (owner.mjs:63-69). It is used by every multi-id read (index.mjs:657, 676, 738, 1146, 1276, 1296, 1343), and by `SLICE/2` where a part is bound twice (1295, 1308-1311). Tests: `binds.test.mjs` "R56 …".
- R57: `relations: [{kind, other, withdrawn}]` on each world item, in recorded order, on both ends, `[]` if none, filtered by sight (index.mjs:1310-1323, 1327). Tests: `binds.test.mjs` "R57 …".

They bind in fact. **Change (moves; the wording is unchanged):**
- Delete the three lines `- **R55** …`, `- **R56** …`, `- **R57** …` (and the blank line before R55) from `### Suggestions`.
- Insert R55's line after `Credentials per op are `op-declarations`' and `control-plane`'s.` (end of R36).
- Insert R57's line after `never a `word`-made string.` (end of R50, the timeline item's fields).
- Insert R56's line after `tests on the fictional test profile.` (end of R42, under `### Invariants`).

## 12. Empty `eventId` to `addParticipant`
**Code.** `#resolve` answers null for an empty or blank id (index.mjs:440-441), so `addParticipant` answers `NO_SUCH_EVENT` (758-760). `attest`, `chooseGoverning`, `aliasAct`, `splitEvent` and `withdrawEvent` do the same. Only `readEvent` has `NO_EVENT` for an empty id (1123). R26 and R11 belong to different services, so they do not contradict each other.
**Change.** Old: ``- **R11** Refuses, in order: `NO_SUCH_EVENT`;``. New: ``- **R11** Refuses, in order: `NO_SUCH_EVENT` (an empty id too);``.
- FINDING F9 (gap): R11's list leaves out some refusals that `addParticipant` answers:
  - `HYPOTHESIS_ID` between `NO_ENTITY` and `NO_SUCH_ENTITY` (516; R39 holds the rule).
  - After the vote checks, `NO_SUCH_ATTESTATION` for an attestation id the event does not hold (764-766).
  - Then R7's refusals for an attestation given inline (769-770).

  Suggested addition to R11, after `(naming the values)`: ``; then the attestation: an id the event does not hold `NO_SUCH_ATTESTATION`, else R7's``.
- FINDING F10: `vote_value_checked` is worked out at read time from today's profile (`#voteValues() !== null`, index.mjs:1069). It is not recorded at write time. A value held unchecked while no profile existed reads `vote_value_checked: true`, with no `why`, once a profile is added, although it was never checked. This contradicts R11 ("kept as written, `vote_value_checked: false` with why"). A defect for the job.

## 13. R27 vs R33 on order
**Code.** `eventsFor` and `statementsOf` both go through `#bounded` → `orderByWhen` (index.mjs:1183-1189, 1197, 1422; time.mjs:85-101). That is the same ordering `timeline` uses. Order is start, then end, then id. Each item carries `order: {undetermined, with, band}`. Items with no `when` go apart in `placed_nowhere`.
**Change (two edits).**
- R27. Old: ``R31's order, with roles;``. New: ``with roles, ordered as R29 (undetermined orders shown, bands with bounds; no `when`: `placed_nowhere`, apart);``.
- R33. Old: ``R31's order, undetermined shown, bounded as R27.``. New: ``ordered and bounded as R27.``.
- FINDING F11: with `from` or `to` given, `eventsFor` and `statementsOf` drop every item without a `when`. `#range` keeps only `i.when` items (index.mjs:1181), and it is called on the whole list (1195, 1420). `timeline` (1232-1235) and `usesOf` (uses.mjs:238-240) keep those items apart. The R27 wording above deliberately does not state "dropped". This is a defect for the job, so that R29's "never one without `when`" holds here too.
- FINDING F12: `orderByWhen` compares each item only with its 25 neighbours on each side (time.mjs:92). An undetermined order with an item further away in the start order (for example, a wide band) is not marked. That falls short of "undetermined orders shown" (R29, and R27/R33 above). A defect for the job, or BOB bounds the rule in R29.

DONE events-settle 12 12
