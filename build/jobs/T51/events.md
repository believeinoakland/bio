# events (T51)

**Status** · session_01DQzTUD8weDGve6uNRAcm2V · depth 2 · COMPLETE · handled B4

## Completion (CR-7, events)

**Entries applied.** R54 (1): every `why` events answers undetermined is `{key, vars}` (new `reasons.mjs`: `reason`, `reasonText`): `sequence` (cited orders disagree, precision, zone span, upper bound, placed nowhere), the stale `when_cache` (`events.why.cache_stale`, a `localize` id) in `readEvent`, timeline items, `sequence`; a `civil-time` reason is passed on as given; `readDate`'s `bad` stays a sentence (`reasonText`). R54 (2): the owner's role and link words come from `label.connectionkinds.<kind>` where the list holds one, else events' own rows; no English left in `owner.mjs`. Words: the 5 left findings and the 60 plain findings converted by `localize('events.<file>.<slug>', en, vars)` (braces reworded), plus the other refusal sentences, stored reasons and facet fragments (outcome, "found unmet", "stated reason", "conditions", "expires", whoWasSent words and detail, document source) now read the design's rows. Tests: sentence copies replaced by `word`/`localize` equality; new `reasons.test.mjs` names R54. The two named reds (R31 reads, R51) are green.

**Deferred / for BOB (REPORT).** Strings I judge no member reads, not hidden: `ownerRead`'s `OWNER_HOST_UNKNOWN` / `OWNER_HOST_AMBIGUOUS` whys (wire diagnostics), the `ListenerFailure` message prefix, `Error("events: record-core refused its tables…")`, `checks.mjs` `where`, `NO_EVENT` detail `op=event&id=EVT-…` (wire grammar). No `label.connectionkinds.event_*` rows exist, so events' kinds read its own `events.*` rows (R54 (2)'s fallback). `proceedingStatusAt` still answers its `und()` whys as strings (not in R54's list; `actions` and `following` pass them on as strings). Consumer to check: `screens-investigate/timeline.mjs` and any reader of a timeline item's `why`, which is now `{key, vars}`, not "cache stale".

**Tests and checks.** events: 86 pass, 0 fail. Users of events (30 modules): 2898 tests, 35 fail, the same 35 fail identically on `tranche/T51` (inherited: lines, people, progressions, duties, explore, calculations, op-declarations and others), none from this job. format 0 failures; architecture (events) 0; coverage (events) 54 of 54; ownership 0 failures (17 files); words: no finding in events; `setup-words build --check`: stale-rows note only.

Size (session_016Bd2g2kmHNsaxikJ2F4Zmh): test runs 8, module lines 2778

## J1 · COMPLETE

events CR-7 complete on job/T51/events: R54 keys, owner words from the list, 5+60 words findings and other refusal sentences converted, tests rewritten, R54 test added. Events 86/86; users' 35 reds are identical on tranche/T51 (inherited). All checks 0 failures. REPORT items (diagnostic strings, missing label.connectionkinds.event_* rows, proceedingStatusAt string whys, timeline item why now keyed) are in my record.

## Completion after B2 (CHANGE)

(1) NO_EVENT's detail was already read through `localize("events.index.an_event_is_read_by", …)` (my J1 report wrongly listed it as unconverted). (2) `proceedingStatusAt`'s four `und()` reasons now read through `localize` at their sites with the list's own ids (they stay strings). (3), (4) no act of mine. Merged `tranche/T51`. Events 86 pass, 0 fail; format, architecture, coverage (54 of 54), ownership 0 failures; no words finding in events.

Size (session_016Bd2g2kmHNsaxikJ2F4Zmh): test runs 10, module lines 2778

## J2 · COMPLETE

B2 applied: und() reasons via localize (same ids); NO_EVENT detail was already localized (J1 was wrong on that). tranche/T51 merged. Events 86/86, all checks 0 failures.

## Completion after B3 (START, fix round 2)

**Causes met.** C54, C6 (events R53 as amended by K4310, "Events found by the captures they cite"): `timeline` given `captures` also answers, in the world lane, the live events holding an event attestation (a capture extent or a dated fact) that cites one of the captures, under R40's sight (an attestation whose capture the viewer may not see is neither read nor counted, answered as a capture not held), R30's audience (the world lane answered as without it) and R27's limit; an event the set already found is not repeated (its `of` stays the set's; one found only by a capture has `of: []`); `NO_SET` only when both are empty (as before). New `#eventsCiting` in `index.mjs`; no op, schema or declaration changed. Tests (written first, seen failing): `timelinedated.test.mjs`, three tests naming R53: an event with one capture attestation and no `concerns` answered with no set (extent and dated-fact forms, placed nowhere and dated, a merge answered once); controls (other capture's event, testimony event, not-held capture, already-found event not repeated; hidden capture absent and uncounted, `truncated` not set by it, hidden and not-held alike, no viewer, the limit cuts, `audience: "public"` leaves the world lane as without it). One existing assertion changed with the requirement: R53's "a set of no entity asks no source" test held `alone.world.items == []`; K4310 makes that event the world's, so it now asserts the event once.

**Reported / deferred.** Nothing in another module. Readers of the timeline item: an item found only by a capture carries `of: []`; SCREENS-INVESTIGATE-2 and CAUSE-ACTION-T51 read the world lane for these.

**Tests and checks.** events 93 pass, 0 fail. Users reading the timeline, same on `tranche/T51` and here: explore 59/59, filings 155/155, actions 148/148, docket 82/82. `checks/run.mjs`: format 0, architecture 0, words 0; coverage failures are other modules' (none in events: 55 of 55); ownership 0 failures.

Size (session_011EKDRCfuAzrqpjUU7nEv36): test runs 9, module lines 2795

## J3 · COMPLETE

EVENTS #10 B3 complete on job/T51/events: C54, C6 met, events R53 as amended by K4310. timeline({captures}) now answers in the world lane the events whose event attestation (extent or dated fact) cites one of the captures, under R40 sight, R30 audience, R27 limit; set-found events not repeated; items found only by a capture carry of: []. Three tests naming R53 (written first, seen failing), controls included; one old R53 assertion (alone.world.items == []) changed with the requirement. events 93/93; explore, filings, actions, docket green as on base; op-declarations t50 has 1 inherited red identical on tranche/T51. checks/run.mjs: events 0 failures; ownership 0. Nothing to report in other modules. SCREENS-INVESTIGATE-2 and CAUSE-ACTION-T51 may read it after your merge.

## Completion after B4 (START, fix round 10, Wave A batch 3)

**Fixtures published** (`bio-plane/test/m/events/fixtures.mjs`, made by events' real code at call time over a fresh `world()`, never stored; each checked by a test naming a requirement in `fixtures.test.mjs`): `recordedByMalformedExtent` (R49, EXTENT_MALFORMED), `sequenceUndetermined` (R31/R51: `withWhy`, `withoutWhy` = the real answer with `why` taken off, `disagree` = cited orders disagree), `timelineAnswer` (R28, empty world), `timelineRefusal` (R28: NO_SET, BAD_DATE), `usesOf` (R46: one discretion, waiver and assessment through the real acts; `refused` = KIND_NOT_DISCRETION).

**Own line done.** fixture.mjs:48 `promotionStub` removed; `world()` takes `promotionOver({record, membership, host})` from `../promotion/fixtures.mjs` (promotion's real code). `fixtures.mjs --list` for events: 0 failures. Markers added: no `fixtures-own`, no `fixtures-generic`, no `fixtures-contract`. Lines left: none.

**Needs BOB.** `checks/architecture.mjs` fails one file: `bio-plane/test/m/events/fixture.mjs` imports promotion's fixtures, which `events` does not list in `uses` in `build/modules.json`. The line is BOB's, not mine: add `"promotion"` to events' `uses`. Nothing else in architecture fails for events.

**Tests and checks.** events: 98 pass, 0 fail (93 before, 5 new). format 0 failures; fixtures 0 failures; words: no events finding; coverage: no events failure (other modules' ids listed unnamed are not mine); ownership 0 failures; `impact.mjs origin/tranche/T51 HEAD`: 0 affected modules (test files only).

Size (session_01DAv9PSDWrsm3wEZhdCb73f): test runs 4, module lines 2807

## J4 · COMPLETE

EVENTS #12 B4 complete on job/T51/events: five fixtures published in bio-plane/test/m/events/fixtures.mjs (recordedByMalformedExtent, sequenceUndetermined, timelineAnswer, timelineRefusal, usesOf), each with a test naming its requirement; own line fixture.mjs:48 re-pointed to promotion's promotionOver. fixtures check for events at 0; events 98/98; format, words, ownership 0 failures; no fixtures-own/generic/contract markers added. NEEDS BOB: architecture fails 1 file (events/fixture.mjs imports promotion's fixtures; add "promotion" to events' uses in build/modules.json, your file). Record: build/jobs/T51/events.md.

## Fix round 10 · cause 1 (B5; events R50)

**Applied.** `grade_why` (timeline items placed nowhere) and the event view's `why` for an event with no dated attestation are now `{key, vars}` via `reason()` (`events.why.grade_placed_nowhere`, `events.why.grade_time_unread`, `events.why.placed_nowhere_attestation`), not `word()` strings; `reasons.mjs` `reasonText` carries all three keys so English callers still get the sentence. R50 is met; the mark may be struck.

**Tests (red on old source, green now).** `drawn.test.mjs` R50 and `reasons.test.mjs` R54 assert `{key, vars}` (and `reasonText` English); `events.test.mjs` R9 asserts the view's `why`; new fixture `timelineUndated` in `fixtures.mjs` (made by the real code) with `fixtures.test.mjs` R50 test, for screens-investigate's timeline test.

**Why the tests missed it.** Each half was green against its own stub: events asserted the finished string and screens-investigate a hand-made `{key, vars}`; no test drew the screen over events' real answer. The published fixture now closes that.

**Found, not changed.** `#eventView` still gives `word("events.why.dated_attestation_see")` as a string `why` (index.mjs:1065, event with a dated attestation the viewer cannot see); R54 says no `why` is a string. No key is named in R50/R54 for it, so left for BOB. Also `following/checks.test.mjs` R1 C-137 fails identically with and without my change (pre-existing, not events').

**Ran.** events tests 99 pass 0 fail; screens-investigate + following 377 tests, 376 pass, the 1 above pre-existing. format 0, architecture 0, coverage 55/55, words 0 failures, ownership 0, fixtures --list 0 failures (no marker added).

Size (session_014vh9swNghbuHGzUzM6v8bp): test runs 6, module lines 2809

## J5 · COMPLETE

EVENTS #13 B5 complete on job/T51/events: cause 1 done. R50 met (grade_why and the undated event view's why are {key, vars}; strike the mark). Fixture timelineUndated published for screens-investigate. Module tests 99/99; format, architecture, coverage, words, ownership, fixtures 0 failures. Found: #eventView still gives string why events.why.dated_attestation_see (index.mjs:1065), no key named in R50/R54, left for BOB. following/checks.test.mjs R1 C-137 fails without my change too. Record: build/jobs/T51/events.md.

## Completion after B6 (START, fix round 10, cause 1 of EVENTS #14)

**Causes met.** R50 (K5152 extension): `#eventView`'s `why` for a dated attestation the viewer cannot see is `reason("events.why.dated_attestation_see")`, `{key, vars}`, not `word(...)` (index.mjs:1065). The vote-value reason `vote_value_why` in the participant view (index.mjs:1047) is also `{key, vars}`, since it is a `why` the event view answers (R50: "every other `why` the event view answers"); `reasons.mjs` keeps English for both keys. Strike the R50 mark.

**Failing first.** `drawn.test.mjs` R50 (new): the view for an outsider whose governing dated attestation is hidden has `when` null and `why` `{key: "events.why.dated_attestation_see", vars: {}}`; control: the member's view has no `why`. Seen red on the old code ("no dated attestation you can see governs this event"), green after. `participants.test.mjs` R54-era assertion on `vote_value_why` changed from the word to `{key, vars}`; that assertion was a string by construction, so it could not hold on the new form and was not run red separately.

**Fixture published.** `timelineDatedHidden()` in `fixtures.mjs`: the real `readEvent` view for the outsider and the member, made by events' real code; `fixtures.test.mjs` R50 test checks both.

**Why the tests missed it.** The R50 drawn test asserted the timeline's items (`grade_why`), never the event view's own `why` for the same hidden dated attestation; `timelineUndated` covered only the undated (placed nowhere) view. No test drew the view for a dated event the viewer cannot see, so the string went unseen.

**Other `word(` whys, grepped (`bio-plane/src/events`).** Not changed, and not views' `why`: `follow.mjs` import reports (`unresolved`/`skipped` `why`, lines 100–295: the import's own diagnostic sentences, read by the import screen, not an event view); `index.mjs:377,379` `afterRead`'s `why` (the capture-class opt-in answer, not `undetermined`, not an event view); `checks.mjs` refusal `translation`s (refusal sentences, R54 names no key for them). Deferred to BOB as a REPORT if these should follow R54: the import reports.

**Tests and checks.** events: 101 pass, 0 fail (99 before, 2 new). `checks/format.mjs`: 0 failures; `architecture.mjs events`: 0; `coverage.mjs events`: 55 of 55, 0 failures; `words.mjs events`: 0 failures; `fixtures.mjs events --list`: 0 failures, no marker added; `ownership.mjs events tranche/T51`: 0 failures (run before this commit; rerun at COMPLETE).

Size (session_01DQzTUD8weDGve6uNRAcm2V): test runs 7, module lines 2812
