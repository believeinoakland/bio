# Task summary · T53 · events

This summary stands for the events job's reading set (SESSIONS §6.3): `build/requirements/events.md` (both parts); the Purpose of `record-grammar`, `jurisdictions`, `civil-time`, `connection-grammar`, `legistar-reader`, `court-doctypes`, `record-core`, `membership`, `promotion`, `provenance`, `reading-pipeline`, `extraction`, `content`, `entities`, `setup-words`, `test-support` (each `build/requirements/<name>.md`) with the named service blocks; `build/plan/current.md`'s `**events**` block (Layer 5); `build/plan/T53-R1/events.md`; `build/plan/trims/events.settle.md` (K5809). The sources stay binding; read any cited section in full when the work touches it. Lines marked "(verbatim)" keep every word of the source.

## events (own requirements)

Status: in force, a new product module (K1505; T33-26). No events requirement is marked not yet met; none is retired. Purpose: what happens in the world (meeting held or cancelled, vote, adoption, signing, award, payment, order entered, statement), apart from the dates documents state. A dated fact is a document's own stated date; an event is a happening records attest, with when (precision, zone), who took part in what role, what it concerned, its attestations and cited relations. Timelines and sequence are three-valued; sequence is never stored; no amount, absence or group act is held; no cause inferred. Members see the timeline (K1462).

Terms (Provides). date-time: civil-time's instant or band with `precision` (day, minute, second, EDTF level-1 band) and `zone`, default the governing zone `jurisdictions.governingZone(<active profiles>, <record-core's team_time_zone>)` (K5292): team's stated zone, else the profiles', else none; a day value is never midnight. Closed lists: dated-fact kinds (`meeting`, `adopted`, `effective`, `signed`, `entered`, `issued`, `published`, `received`, `hearing`, `period_covered`, `edited`); event kinds (`meeting`, `vote`, `adoption`, `enactment`, `signing`, `award`, `payment`, `transfer`, `filing`, `order`, `hearing`, `issuance`, `publication`, `statement`, `communication`, `appointment`, `departure`, `inspection`, `other`; T35 `discretion`, `waiver`, `assessment`); statuses (schema.org `EventScheduled`, `EventCancelled`, `EventPostponed`, `EventRescheduled`, `EventMovedOnline`; a cancelled meeting is one event); roles (`actor`, `organizer`, `mover`, `seconder`, `voted`, `present`, `speaker`, `sender`, `recipient`, `copied`, `signatory`, `decider`, `author`, `implementer`, `party`, `subject`; no payer or payee); relation kinds (`authorises`, `answers`, `amends`, `reverses`, `stated_cause`, `within`; T48 `precedes`). Provision key `{standard, portion?}`, opaque, shape checked only (non-blank, at most 200 characters). Question: a held bundle id whose `object_type` is `inquiry`. Attestation: a dated fact, a capture extent with no date (participants or concerns only), or a member's testimony.
Viewer (verbatim): **Viewer**: the control plane's stamp via `membership.viewerPredicate`; absent, fail closed.
Refusal: `{ok: false, reason, detail}`, plus `code`, `check`, `translation` when catalogued. `by`: the control plane's stamp, a member or `class:<cls>` (machine, DEC-52), never a caller's field.

**recordDatedFact**
- R1 · Refuses in order `NO_SHA`; `CAPTURE_NOT_HELD` (absent or unseen alike); `NO_EXTENT`, `EXTENT_NOT_IN_CAPTURE`; `UNKNOWN_DATED_KIND`; `BAD_DATE` (`civil-time.isCalendarDate`); `NO_METHOD`; `QUESTION_NOT_HELD` (R48). Else holds `{dated_fact_id, capture_sha, extent, kind, value, method, grade, by, at}`; repeat (capture, extent, kind, value) `already: true`, nothing written; a found extent cited like any other.
- R2 · `grade` is the extent's capture grade, never the caller's; a machine-read date carries its method, never graded above its source.
- R3 · Dated facts arise only from a member's act or R4, never a sweep of all readings.
- R4 · Registers once on `reading-pipeline.onRead` for opt-in capture classes; after commit holds each date the reader states, the reader's method; the set starts empty, changed only by a member's recorded act.
- R5 · On request an office capture's author, created, modified values are held as `edited`/`issued` dated facts, method naming the field.

**createEvent, attest, chooseGoverning**
- R6 · `createEvent` refuses in order `UNKNOWN_EVENT_KIND`, `UNKNOWN_STATUS`, `NO_ATTESTATION`, each attestation's (R7), each `concerns` end's `NO_SUCH_ENTITY`/`NO_SUCH_EVENT`, each participant's (R11); `discretion`, `waiver`, `assessment` get `USE_NEEDS_ITS_ACT` before any other refusal. Else allocates `EVT-<year>-<tail>`, writing event, attestations, participants in one transaction; `status` default `EventScheduled`.
- R7 · A document attestation cites a held dated fact (`NO_SUCH_DATED_FACT`) or capture extent (R1's refusals), never copying a date. Testimony: statement (`NO_STATEMENT`), grade D, a member's (`MEMBER_ACT_ONLY`), optional `project` a held project bundle the member sees (`membership.noSuchProject`). `attest` of an attestation already held (same form, fact, capture, extent, source row, statement, date) answers `already: true`, writing nothing.
- R8 · The first dated attestation governs until a member's `chooseGoverning` (`NO_SUCH_ATTESTATION`, `ATTESTATION_UNDATED`), each choice kept with who, when, why.
- R9 · `when` derives only from the governing attestation, held in `when_cache` `{start, end, precision, zone}`, rebuilt in the transaction of any attestation, choice, merge or split; undated: `when: null`, "placed nowhere", never a default.
- R10 · A `when_cache` differing from its rebuild fails closed: `when: undetermined`, why `events.why.cache_stale` (R54), never the stale value.

**addParticipant, correctParticipant**
- R11 · (verbatim) Refuses, in order: `NO_SUCH_EVENT` (an empty id too); `NO_ENTITY`, `HYPOTHESIS_ID` (R39), `NO_SUCH_ENTITY` (`entities.noEntity`, `noSuchEntity`); `UNKNOWN_ROLE` (naming the list; detail: payer/payee is on the money fact); `NO_ATTESTATION` (never from office holding, R-3 H-10); for `voted`, `NO_VOTE_VALUE` / `UNKNOWN_VOTE_VALUE` (naming the values); then the attestation: an id the event does not hold `NO_SUCH_ATTESTATION`, else R7's. Values: the active profiles' `vote_values` (`jurisdictions` R58) on `value`; an imported value (R22) matching no `value` is matched exactly on `label` (Legistar's `Aye`, `Excused`), the `value` held (K1788); no own list. With no profile values, a `voted` value is kept as written, `vote_value_checked: false` with why, never checked against a default (T33). A repeat (event, entity, role, attestation) answers `already: true`.
- R12 · Each participant answers its entity's resolution grade in the attesting capture (`entities.resolutionsFor`, strongest) beside its attestation's grade, never combined.
- R13 · `correctParticipant` refuses `NO_REASON`, `NO_SUCH_PARTICIPANT`; old row superseded (who, when, why), new keeps role and attestation, R16 told `participant_re_resolved`; nothing deleted.

**mergeEvents, splitEvent**
- R14 · Member only (`MEMBER_ACT_ONLY`); `NO_REASON`, absent event refused. Merge moves attestations, participants, relations to `keep`, `absorb` its alias; split moves named attestations to a new event; kept with who, when, why; rebuilds touched `when_cache`s; tells R15.

**onWhenChanged, onEventChanged**
- R15 · Register once (`membership.listenerRefusal`); listeners run in `MODULE_ORDER` inside the transaction changing a `when_cache`, given `{eventId, before, after}`; a throw fails the write.
- R16 · `onEventChanged` runs after commit for `when_moved`, `participant_re_resolved`, with event id, change and `at` (one stamped instant for all listeners).

**relate, withdrawRelation**
- R17 · `relate` refuses in order `UNKNOWN_RELATION`, `NO_ENDS`, `SELF_RELATION`, `NO_SUCH_EVENT` (naming the end), `NO_ATTESTATION`; held with two grades (its attestation's, its ends' governing attestations').
- R18 · `stated_cause` only a named source's claim: capture-extent attested (`CAUSE_NEEDS_SOURCE`), never machine (`CAUSE_NOT_MACHINE`), read "<source> states"; a member's hypothesised cause is not held.
- R19 · `within` puts a sub-event in a larger one; a loop is `WITHIN_CYCLE`.
- R20 · `withdrawRelation` refuses `NO_REASON`, `NO_SUCH_RELATION`; repeat `already: true`; the relation remains, shown withdrawn (who, when, why).

**aliasAct, eventForAct**
- R21 · `aliasAct` refuses `NO_ACT`, `NO_SUCH_EVENT`, then `ACT_ALIASED`; `eventForAct` answers the event or `found: false`, never throws.

**followedImport** (Legistar following, the machine's writes)
- R22 · Refuses `NO_BODY`, `NO_PERIOD`, `CAPTURE_NOT_HELD`, `NOT_LEGISTAR`, then `NO_SUCH_ENTITY` (body). Writes only rows with source ids at both ends: events by `EventId` (meeting), `EventItemId` (votes `within` it); participants whose `PersonId` resolves by scheme identifier (grade A), the rest in `unresolved`. Each meeting one `concerns` end, `body`. Machine rows cite their capture, correctable by R13, R14, R20.
- R23 · A meeting starts at the source's day and local time joined by `civil-time.joinLocal` in the governing zone, minute precision; a row stating cancellation is the one event, `EventCancelled`.
- R24 · A posting time is a `publication` `within` its meeting, `when` only an upper bound ("on or before" the first instant the record saw it).
- R25 · Import idempotent by source id: a held row changes in place only on a changed source value, recorded, R15/R16 told.

**readEvent, datedFactsFor, eventsFor**
- R26 · `readEvent`: empty id `NO_EVENT`, absent `found: false`, alias its kept event; answers kind, status, `when` (R9, R10), where, concerns, `within`, attestations with grades, participants (R12) superseded marked, relations in and out, merges and splits.
- R27 · (verbatim) `eventsFor`: events the entity takes part in or that concern it, with roles, ordered as R29 (undetermined orders shown, bands with bounds; no `when`: `placed_nowhere`, apart); `limit` clamped to 1–500 (default 100), `truncated` by one past. `datedFactsFor`: a capture's dated facts in extent order.

**timeline, registerEventSource** (stage 2a)
- R28 · Takes explicit entity or event ids (`NO_SET`, R53), never a project or inquiry; answers the world's events ("what they did") and, never interleaved, each source's items. `audience` `"public"` or absent, else `AUDIENCE_UNKNOWN` (after `NO_SET`); `"public"` leaves the world lane unchanged, each source lane its source's answer (R30).
- R29 · (verbatim) (K2810) Lanes follow R31; undetermined orders shown, bands with bounds. `from`/`to` bound placed items only, never one without `when`: listed apart as "placed nowhere" in the world lane, kept in a source lane marked `placed_nowhere: true` (read by `case-authoring`, `filings`). `limit` as R27, per lane; an unreadable `from`/`to` is `BAD_DATE` (R1), nothing read.
- R30 · Later modules register once; `fn({set, from, to, limit, viewer, audience})` answers own acts `{at, label, ref, kind}`, `viewer`/`audience` passed as received; a lane `truncated` if its source says so or `limit` cut it; a throwing source answered `{source, error}`, others kept.
- R50 · World-lane items also answer `participants` (as R26, superseded omitted, at most 50, `participants_total`, `participants_truncated`) and `grade` (governing attestation's, or `null` with `grade_why` when placed nowhere); only what the viewer may see answered or counted (R40); every `why` `{key, vars}`, never a `word`-made string.
- R57 · Each `timeline` event carries `relations: [{kind, other, withdrawn}]`, recorded order, on both events, `[]` if none.
- R51 · `relate` takes `precedes` only for a pair R31 answers `undetermined` at the act, else `ORDER_ALREADY_DATED`; cited by extent or testimony (D), machine `MEMBER_ACT_ONLY`. While undetermined, `sequence` answers from a standing visible `precedes` directly joining the pair (`basis: "cited"`, its id, two grades); both ways: `undetermined`, why disagreement (R54); no chains. Once dates order the pair they govern, the relation beside, `agrees` true/false.
- R53 · `timeline` takes `captures` (at most 200, else `TOO_MANY_CAPTURES` after `AUDIENCE_UNKNOWN`); `NO_SET` only when `set` and `captures` both empty. (1) `dated` `{items, placed_nowhere, limit, truncated}`: dated facts as `datedFactsFor` gives them, ordered and bounded as R29 by stated date, no event made; a fact counts only for a viewer seeing its capture's bundle (R40); unheld and hidden captures add nothing, alike, and no refusal names which captures exist; omitted under `audience: "public"`. (2) The world lane adds events attested on one of `captures` (R40, R30's audience, R27's limit), none repeated from `set`.
- R54 · Keys, not words: every `undetermined` `why` is `{key, vars}` (`events.why.cited_orders_disagree`, `precision_held_settle`, `placed_nowhere_event`, the stale cache's, `civil-time.compare`'s unflattened); R35's role and link words read DEC-253's `label.<set>.<value>` keys, each `word` non-empty. Tests assert keys, never sentences.

**sequence({a, b, viewer})** (stage 2a)
- R31 · (verbatim) `before`, `after` or `undetermined` with why, from the `when`s by `civil-time.compare`: unsettled by band or coarser precision, or equal at precision, is `undetermined`, never guessed; no `when`: `undetermined`, `events.why.placed_nowhere_event` (R54). Computed per read, never stored.

**whoWasSent, statementsOf** (stage 3)
- R32 · `whoWasSent`: a `communication`, `issuance` or `meeting` event's `sender`, `recipient`, `copied`, `present` with attestations, worded "sent to", "copied", "present", never "knew" or "saw".
- R33 · (verbatim) `statementsOf`: `statement` and `communication` events where the entity is `speaker`, `sender`, `author` or `actor`, ordered and bounded as R27.

**proceedingStatusAt**
- R34 · Refuses `NO_ENTITY`, `NO_SUCH_ENTITY`, `NOT_A_PROCEEDING`; answers the stage of the profile's flow its held events reach on `at` (`civil-time.validAt`, R31); `undetermined` with why when no flow, undetermined order or no event; never a default stage.
- R52 · R34's `NOT_A_PROCEEDING` is `entities.notAProceeding`'s answer.

**neighbours**
- R35 · Registers once via `connection-grammar.registerOwner` (took part per role, `concerns`, `within`, the event links); answers in its shape, valid at `at`, paged by its bounds; passes `ownerConformance`.

**Ops, read contract**
- R36 · `eventsOps(events, url, body)`: one arm per act and read, stamps from `url`, arguments from body, one append site, control-plane stamped.
- R55 · `DECLARED_OPS` frozen, for `recorddatedfact`, `createevent`, `addparticipant`, `relate`, each `{classes, machineClasses?, mutating, weight, description, fields: {accepts, requires}}`; `declaredOpHolds` passes with requires only, fails without each or with a field outside accepts.
- R37 · `events`, `event_when_cache`, `event_participants`, `event_attestations` (named columns) are a read contract on record-core R37's terms; writes stay here.
- R47 · `event_uses` and `event_unmet` join R37's contract (`standards`, `duties`, `calculations` may join).

**followedRegister({captureSha, proceeding, by})**
- R38 · Refuses in order `NO_ENTITY`, `NO_SUCH_ENTITY`, `NO_SHA`, `CAPTURE_NOT_HELD`, `NOT_A_REGISTER` (R58). A court register row with a source entry id becomes a `filing`/`order` event of the proceeding, written as R22; which proceedings are followed is `following`'s (K5809); this module checks only that the proceeding is a registered entity.
- R58 · One register entry, one event: takes `courtlistener_api` beside `courtlistener_docket`, `cpuc_proceeding`, `ecourt_roa`, others `NOT_A_REGISTER`. (1) Key `register:<system>:<proceeding>:<entry id>`, never the content type; no entry id: `skipped`. (2) Another reading adds its capture as one attestation (R7's repeat), in `readings_added`, no new event; same date and text: `unchanged`. (3) First kind stands, `when` from the governing attestation; another kind or date goes in `disagreements`, shown wherever the event is, never failing the tick, a member settles it. (4) Each attestation keeps its capture's grade; `provisional: true` shown. (5) Old `register:<content type>:...` keys re-keyed in the transaction. A hidden capture adds no attestation for a viewer who may not see it.
- R59 · A second reading is no change and mints no event, not R25's update; R41's absence rule stands; no event deleted.

**recordDiscretion, recordAssessment, usesOf** (T35)
- R43 · One use of a power as `discretion`/`waiver`, created as R6, `decider`, `subject`. Refusals in order: `KIND_NOT_DISCRETION`, `MEMBER_ACT_ONLY` (before R6's), then `PROVISION_MALFORMED`, `STATED_REASON_MISSING` (an extent or `"none"`), `OUTCOME_UNKNOWN` (`granted`, `denied`, `partly_granted`, `other`), `QUESTION_NOT_HELD`; last a waiver's `scope` (`WAIVER_NO_SCOPE`), `conditions` (not a list `NO_EXTENT`), `expiry` (`BAD_DATE`); on `discretion` these are `FIELD_NOT_FOR_KIND`.
- R44 · An `assessment` event as R6; `provision` and `unmet` items each cited in a capture attesting the assessment; refusals in order `MEMBER_ACT_ONLY`, R6's, `provision`'s, each `unmet` item's (`PROVISION_MALFORMED`, `UNMET_NOT_CITED`, R1's extent, `EXTENT_NOT_IN_CAPTURE`), `QUESTION_NOT_HELD`; empty `unmet` reads "no standard found unmet", never "met".
- R45 · Reads answering an event give its facet (`provision`, `stated_reason`, `outcome`, waiver's `scope`, `conditions`, `expiry`, assessment's `unmet`, `says`). Facets never edited; `withdrawUse({eventId, reason, by})` refuses `NO_REASON`, `NO_SUCH_EVENT`, `KIND_NOT_DISCRETION` (not R43–R44's kinds), repeat `already: true`, leaving the event readable, shown withdrawn (who, when, why), out of R46.
- R46 · (verbatim) Unwithdrawn `discretion`, `waiver`, `assessment` events (`kinds` narrows; other: `KIND_NOT_DISCRETION`), filtered by `provision` (no `portion`: every portion of that standard), `decider`, `subject` (entity ids), `from`/`to` on `when` (R29: placed-nowhere apart, never dropped). Items: R45's event with participants (R12), R31's order, `after` (event id) pages, `limit` clamped to 1–500 (default 100), `truncated` by one past, `count`, the number answered; the answer says these are the held uses this viewer may see, a population, not a census (§6B.5). Sight R40; writes nothing, never throws.
- R48 · A question given to R1, R43, R44 stays beside its row, answered by every read to viewers who may see the inquiry's bundle, absent otherwise; none `question: null`; R1 repeated with another question keeps the first.

**recordedBy({captureSha, extent?, limit?, viewer})**
- R49 · The one shape naming who recorded each row citing a capture: `{ok: true, module, capture_sha, items, truncated}`, item `{module, record, kind, field, extent, relation, by, at, withdrawn}`; `extent` filtered by `content.extentRelation`; ordered by canonical string, `record`, `field`; `limit` 1–500; sight R40; refusals `VIEWER_MISSING`, `NO_SHA`, `EXTENT_MALFORMED` (the first and last in `{ok: false, refused, code, reason, why}`), an internal failure `RECORDED_BY_UNREADABLE`; never throws; not an R36 arm; testimony never an item.

**withdrawEvent and the timeline over captures (T53; JOURNEYS W7)**
- R60 · (verbatim) (T53; JOURNEYS R-84, D2 events R?1; K5786; amends R28) **Many captures answer.** `timeline` given a standard page's `captures` (its walked fixture; 200) answers `ok: true` with their events and dated facts within the act's time class, never a server error, gateway timeout or 502 (cause the job's to find; PLATFORM told the limit). An unknown capture adds nothing, as a hidden one (R53). `set` alone unchanged.
- R61 · (verbatim) (T53; JOURNEYS R-83 owner half, D2 events R?2; K5476; in R20's form) **`withdrawEvent({eventId, reason, by})`.** Refuses in order, writing nothing: `NO_REASON` (blank or absent), `NO_SUCH_EVENT` (absent or unseen, alike); repeat `already: true`. The event stays, listed and counted as before by `readEvent`, `eventsFor`, `statementsOf` and `timeline`, each answering `withdrawn` `{by, at, reason}` (null when not); nothing deleted, attestations and relations readable. Dating and correcting stay with `attest`, `recordDatedFact`.

**Private: Invariants** (Uses lists the services below; Satisfies and Suggestions not summarized)
- R39 · Checked at the store's gate: no amount on an event, attestation or participant row; no payer/payee; no `HYP-` id in an id field; every `when_cache` equals its rebuild.
- R40 · Sight: an event, dated fact or relation is answered only through attestations whose capture the viewer may see; none visible: neither answered nor counted; testimony in a hidden project fenced, uncounted; tables declared via `record-core.declareTable`.
- R41 · Absence is never an event; sequence never stored; no event minted only to join two readings; no machine row infers a cause, a relation but `within`, or a participant from office holding.
- R42 · No place in behaviour, defaults or outward text; values and flows from the profile, the governing zone; tests on the fictional test profile.
- R56 · Each store statement binds at most 99 parameters; longer id lists go in parts joined in the service's order (`timeline` answers 200 captures as 20).

## Used services

record-grammar (`build/requirements/record-grammar.md`): the record's shared grammar (ids and types, front-matter parser, canonical JSON, actor identity, grades, public-locator test, SHA-256); no store, network or clock. events uses `ID_TABLE`, `isHypothesisId`, the refusal grammar.

jurisdictions (`build/requirements/jurisdictions.md`): holds the jurisdiction profiles, every local fact as data with its measurement; lists, returns, validates, combines them; no other module names a place. events uses `governingZone`, vote values, `proceeding_flows`.

civil-time (`build/requirements/civil-time.md`): the one pure engine for civil time (local days, date-times with precision and zone, EDTF bands, three-valued comparison, rules, due dates, recurrences, fiscal periods, `validAt`); "now" is its caller's; local facts from the view it is given.
- civil-time R5 · `compare(a, b)`: `before` only when all of `a` lies before all of `b` (`bounds(a).latest ≤ bounds(b).earliest`), `after` mirrored, else `undetermined` naming the overlap; an open or unknown EDTF end makes any comparison it could decide `undetermined`; a day is never its midnight; the one sequence read.
- civil-time R22 · `validAt`: `out` wholly before `from` or after `to`, `in` wholly within both stated bounds, else `undetermined`; a null bound is "not stated", never "always" (why "no end is stated"); compared as R5.
- civil-time R23 · A bound `{event, edge, at?}` without `at` is undetermined ("the bounding event is not resolved"); value and event both: `BOUND_BOTH`; zone defaults to the view's `time_zone`.

connection-grammar (`build/requirements/connection-grammar.md`): the one shape of every relationship, the registry of owners and their kinds and words, the bounds and rules of walking; every owner registers its `neighbours` here; it holds and walks nothing.

legistar-reader (`build/requirements/legistar-reader.md`): reads captured Legistar Web API JSON (bodies, persons, office records, events, items, votes, enactment fields) with source ids at both ends, a system-rule assertion the machine may write (DEC-52; K1443), "as recorded by Legistar"; drops contact fields.

court-doctypes (`build/requirements/court-doctypes.md`): reads a proceeding's register from CourtListener, CPUC and eCourt captures: number, caption, status and rows, each keyed as its register allows; `assess` compares two readings row by row; registers no proceeding, writes no event.

record-core (`build/requirements/record-core.md`): owns the record's storage (id allocation, leases, append-only history and manifest, purge); holds no member, fence or promotion write path; every storing module writes through it.
- record-core R25 · `getSetting(name)` returns the value last set, or `null` when none; settings recorded with who and when, exempt from `purge`; `setSetting` refuses in order `SETTING_NAME_REQUIRED`, `SETTING_BY_REQUIRED`, `SETTING_VALUE_REQUIRED`, `SETTING_INVALID`.
- record-core R83 · `getSetting(name, {strict: true})`: `null` never set, `SETTING_UNREADABLE` (identity) for a non-JSON value, else the value; without strict an unreadable value reads `null`; never throws.
- record-core R84 · `setSetting` refuses `SETTING_NOT_JSON` for a value that does not round-trip through JSON (after `SETTING_VALUE_REQUIRED`, before `SETTING_INVALID`).
- record-core R85 · `DECLARED_OPS` declares `allocid` (accepts and requires prefix and year).
- record-core R86 · `allocIdOp` refuses `ALLOCID_PREFIX_REQUIRED`, `ALLOCID_YEAR_REQUIRED`, allocating nothing.
- record-core R87 · `evidenceStore().putFromParts(digest, partDigests)` writes one object from held parts, completing only on a matching SHA-256, else writing nothing.
- record-core R88 · `evidenceStore().get(key, {range})` answers only those bytes.
- record-core R89 · One write counter rises for every row written, never on a read, never falls.
- record-core R90 · `writeCount()` answers R89's counter, writing nothing.
- record-core R26 · The active jurisdiction profiles are the setting `jurisdiction_profiles`, an ordered id list passed to `jurisdictions.combine`.
- record-core R32 · `transact(fn)` runs `fn` as one transaction over the whole store: on a throw or a refusal (`ok:false`) every row written inside, in any module's tables, is rolled back and no id allocated inside is spent; a nested call joins the outer as a savepoint (its own writes and ids rolled back on throw or refusal; the outer decides the rest); rethrows after rollback.

membership (`build/requirements/membership.md`): owns who the members are and what each may do (founder, administrators, enrolment, capabilities, expertise) and projects at setup (participants, visibility, what a caller may see of a project, the fence for acting in one); no record integrity, no credential. events uses `viewerPredicate`, `listenerRefusal`, `MODULE_ORDER`, question sight.

promotion (`build/requirements/promotion.md`): the one write path by which a bundle enters or changes (compare-and-swap, append-only history, the document's own bytes as the record's word; a failed rule refuses the whole promotion); also runs the check catalogue at ratification and reopens a set-down inquiry.
- promotion R39 · `registerStep(module, {check?, project?})`: once at start; `check` before the write, `project`ion after it, both inside the promotion's one `record-core.transact`; a check's refusal refuses the promotion with its own `reason`; registered twice by one module: `STEP_DECLARED`; order: promotion's own refusals, registered checks in the modules' total order, `commit`, projections in order; a projection answers `null` or an object whose keys are added, never replacing promotion's own.
- promotion R40 · `registerFact`/`fact(name, ...)`: no provider `FACT_UNAVAILABLE`, a throwing provider `FACT_FAILED`; never read as false; never throws.

provenance (`build/requirements/provenance.md`): the trust root: the register (one home of each captured byte sequence), the plane's acquisition receipts, a capture's route grade, a member's firsthand observation; a hop attests bytes, address and time, never content credibility. events uses whether a capture is held.

reading-pipeline (`build/requirements/reading-pipeline.md`): produces a capture's reading from stored bytes through the tier ladder (plane, `pdf-worker`, `ocr-worker`), with its provenance and text units; pure, holds nothing, fetches nothing. events uses `onRead` (R4).

extraction (`build/requirements/extraction.md`): makes and records readings (provenance, references as they appear, text units), keeps every distinct reading, re-reads on request; mints no content, resolves no entity, writes no bundle. events uses stated dates, references, `noSha`.

content (`build/requirements/content.md`): the unit the record points at, a part of a captured document: extent grammar, content address `hash(capture, extent, chain)`, content rows, typed transcriptions; never moves a reference. events uses extents, capture grade, office metadata, `extentRelation`, `canonicalExtent`.

entities (`build/requirements/entities.md`): the entity axis and subject registry (Framework §13): entities with aliases and member-declared relations; resolves a reading's references with the §8.1 grade (A, B, C recogniser; D testimony); answers which documents concern or name an entity; judges shared identifiers (§8.3); derives no connection.
- entities R5 · `readEntity`: empty id `NO_ENTITY`; absent `{ok: true, found: false}`; carries aliases (canonical first) and every relation it is an end of, with `direction`, oldest first.
- entities R6 · `entitiesByAlias`: every entity holding the alias's fold, id order, ambiguity kept; folds to nothing `count: 0`. `readRelation`: empty id `NO_RELATION`; absent `found: false`.
- entities R7 · `has(entityId)` whether the registry holds the id; `kinds()`, `relationKinds()` the closed lists.
- entities R8 · `withdrawAlias`, `withdrawRelation` refuse `NO_REASON`, `NO_SUCH_ALIAS`/`NO_SUCH_RELATION`, repeat `already: true`; withdrawn kept and shown with who, when, why; nothing deleted.
- entities R14 · `resolutionsFor` refuses `NO_SHA`; a capture's resolutions by reference then entity, each with grade, method, basis, `resolved_by`, `at`, reports; `limit` default 500, max 5,000, `truncated`; also `unresolved: [{ref, label, page}]`.
- entities R15 · `concerns` refuses `NO_ENTITY`; one entry per capture resolving to the entity with its strongest resolution; `found`, `count`, `resolution_count`, `limit`, `truncated`.
- entities R16 · `strongestByCapture` the same per-capture collapse, unbounded.
- entities R36 · `noSuchEntity(entityId, extra?)`: the one answer `{ok: false, reason: "NO_SUCH_ENTITY", code, check, translation, entity_id, detail}`, `extra` adding fields, never replacing; every module answers this condition through it; never throws.
- entities R37 · `noEntity(detail?)`: the one answer when no entity id is named, `{ok: false, reason: "NO_ENTITY", code, check, translation, detail}`; never throws.

setup-words (`build/requirements/setup-words.md`): the interface's word list as frozen data (key, English, note, meaning, protected mark) from the design stream's `words.json`; imports, reads and writes nothing. events uses `word(key, vars)` for every member-facing sentence.

test-support (`build/requirements/test-support.md`): a test's temporary-file sandbox and tally-safe output, in-memory ZIPs (conforming or hostile), and the shared generators, ZIP64 writer, loopback origin, alarm double and job registrar stub of fix round 9.

## This task

The entries of `build/plan/current.md`'s `**events**` block:
- T53-624 · R60 · the independent audit (K5794): R60's test uses the walked standard's fixture and 200 captures, as its Test says (register.test.mjs uses synthetic captures only).
- K5809 F1 · R31 (Terms: Viewer) · `sequence` treats an absent viewer as an administrator (`viewer = "class:admin"`, index.mjs:1385), so an in-process caller with no viewer sees every `precedes` relation; Terms: fail closed. The ops arm passes `q("viewer")`, null, not defaulted (1565). The default is not stated in the requirements (settle §1).
- K5809 F7 · R46, R61 · `usesOf` filters only `event_uses.withdrawn` (uses.mjs:228), so a use event withdrawn by `withdrawEvent` (R61) is still answered; R46 says "Unwithdrawn" (settle §9).
- K5809 F10 · R11 · `vote_value_checked` is worked out at read time from today's profile (`#voteValues() !== null`, index.mjs:1069), not recorded when written; a value held unchecked while no profile existed reads `true`, no `why`, once a profile is added. R11: recorded as checked or not when written (settle §12).
- K5809 F11 · R27, R29, R33 · with `from`/`to`, `eventsFor` and `statementsOf` drop items without a `when` (`#range`, index.mjs:1181, called on the whole list at 1195, 1420); `timeline` (1232-1235) and `usesOf` (uses.mjs:238-240) keep them apart. R27, R29: listed apart (settle §13).
- K5809 F12 · R29, R27, R33 · `orderByWhen` compares each item only with 25 neighbours each side (time.mjs:92), so an undetermined order with an item further away in start order (a wide band) is not marked; R29: every undetermined order shown (settle §13).

Code context from settle §9, §13 (no entry): `eventsFor`, `statementsOf` go through `#bounded` then `orderByWhen` (index.mjs:1183-1189, 1197, 1422; time.mjs:85-101), the ordering `timeline` uses (start, end, id; each item `order: {undetermined, with, band}`; no-`when` items in `placed_nowhere`). `#itemsFor` keeps withdrawn events with `withdrawn` (1148, 1155, 1166).

The rows file `build/plan/T53-R1/events.md` gives the plan rows behind the module's T53 lines, already folded into the requirements: N1259 for R58, R59; JOURNEYS R-84 (the 502, LANE: PLATFORM) for R60; R-83 owner half for R61; R-68's dating half MERGE T52-74 (journey 11/22 steps 4 and 8 walk test); T53-530 (K5629) for R38, R58; and K5565's English-in-tests entry (events' census: literal A/B files 0/0, regex A/B/C sites 1/0/7 in 4 files; each assertion reads the key the product reads, a C site kept as input data or removed with its reason; every test the job touches converted with it; the words check refuses English in a new or changed test).
