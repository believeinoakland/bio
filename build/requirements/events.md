# events — requirements

**Status** · New product module, layer 5, directly after `entities` and before `lines` (plan T33, Rules (2); K1470). Its meaning is the ladders' and the rulings': `BIO_Capability_Ladders_v0_1.md` §2 EVENTS, §5B.4 (L1 at stage 1a, L2 and the duty half of L3 at stage 2a, L3 relations at stage 2b), the reads of §5B.5 that T33 carries (`whoWasSent`, statements in order, edit acts from office metadata), and rulings K1443, K1444, K1462, K1464, K1465, K1467, K1468, K1470, K1487, K1489, K1494. Plan entry T33-26 (B1a.2 whole; B §(d) EVENTS 2a, 2b, 3; scope §1 EVENTS). Measures: `measures-T33/legistar-events.md` M-V1, M-V2, M-V3 (all GO). Every requirement is new and not yet met (T33-26). R38 is CONDITIONAL on `measures-T33/courts-workbooks.md` reading GO (Rule 5). For BOB's review and Bob's approval (a product module, P17).

**Size (P6).** About 2,400–2,900 lines at this scope (constructs-2 §4.1; B §(c)). Under 4,000.

## Public

### Purpose

The things that happen in the world (a meeting held or cancelled, a vote, an adoption, a signing, an award, a payment, an order entered, a statement), held apart from the dates documents state. A **dated fact** is a document's own stated date; an **event** is a happening that one or more records attest. For each event it holds when it happened with its precision and zone, who took part and in what role, what it concerned, which records attest it, and its cited relations to other events. It answers timelines and sequence three-valued, never stores sequence, never holds an amount, an absence or the group's own acts, and never infers a cause. Members see these as the **timeline** (K1462).

### Provides

Terms.
- A **date-time** is `civil-time`'s value: an instant or band with its `precision` (day, minute, second, or an EDTF level-1 band) and its `zone`; the zone defaults to the jurisdiction's from the active profile (K1444 (iii), K1464). A day-precision value is never read as midnight.
- **Dated-fact kinds** (closed): `meeting`, `adopted`, `effective`, `signed`, `entered`, `issued`, `published`, `received`, `hearing`, `period_covered`, `edited`.
- **Event kinds** (closed): `meeting`, `vote`, `adoption`, `enactment`, `signing`, `award`, `payment`, `transfer`, `filing`, `order`, `hearing`, `issuance`, `publication`, `statement`, `communication`, `appointment`, `departure`, `inspection`, `other`.
- **Statuses** (closed, schema.org's `EventStatusType`): `EventScheduled`, `EventCancelled`, `EventPostponed`, `EventRescheduled`, `EventMovedOnline`. A cancelled meeting is one event with status `EventCancelled`, never a missing one.
- **Roles** (closed): `actor`, `organizer`, `mover`, `seconder`, `voted` (with the vote value the profile names), `present`, `speaker`, `sender`, `recipient`, `copied`, `signatory`, `decider`, `author`, `implementer`, `party`, `subject` (K1465). There is no payer or payee role.
- **Relation kinds** (closed): `authorises`, `answers`, `amends`, `reverses`, `stated_cause`, `within`.
- An **attestation** is one of: a dated fact (a captured document's statement), a capture extent with no date of its own (it attests participants or concerns only), or a member's **testimony** (their own account, E4).
- The **viewer** is the control plane's stamp, read through `membership.viewerPredicate`; absent, it fails closed.
- Every refusal is `{ok: false, reason, detail}`; one with a catalogue row also carries `code`, `check` and `translation`. Every act's author (`by`) is the control plane's stamp, a member or `class:<cls>` for the machine (DEC-52); a caller's own field is never read.

**recordDatedFact({captureSha, extent, kind, value, method, by})** — a document's own date
- **R1** Refusals, in order: `NO_SHA`; `CAPTURE_NOT_HELD` (the record holds no such capture, or the viewer may not see it, answered alike); `NO_EXTENT`, `EXTENT_NOT_IN_CAPTURE`; `UNKNOWN_DATED_KIND` (naming the closed list); `BAD_DATE` (`civil-time.isCalendarDate`: 2026-02-31 is refused); `NO_METHOD`. Otherwise one dated fact is held `{dated_fact_id, capture_sha, extent, kind, value, method, grade, by, at}`, and a repeat of the same (capture, extent, kind, value) answers `already: true` and writes nothing.
- **R2** A dated fact's `grade` is its extent's own capture grade, never the caller's, and a date read by a machine (a reader, OCR, office metadata) carries that method and is never graded above its source.
- **R3** Dated facts are materialised only by a member's act (above) or by the after-read hook (R4), never by a sweep of every reading (K1468).
- **R4** The module registers once on `reading-pipeline.onRead`, for the capture classes in its opt-in set only. For a capture so read, it holds each date the reader states (with the reader's method) as a dated fact, after commit. The set is empty by default and changes only by a member's recorded act; a capture outside the set gets nothing.
- **R5** Edit acts from office metadata (EVENTS stage 3): for a captured office document, the author, created and modified values its reader exposes are held, on request, as dated facts of kind `edited` or `issued`, the method naming the metadata field. They are what the file states about itself, never a finding.

**createEvent({kind, status?, where?, concerns?, attestations, participants?, by}), attest({eventId, attestation, by}), chooseGoverning({eventId, attestationId, by})**
- **R6** `createEvent` refuses, in order: `UNKNOWN_EVENT_KIND`, `UNKNOWN_STATUS`, `NO_ATTESTATION` (an event is held only with at least one), each attestation's own refusal (R7), each `concerns` end `NO_SUCH_ENTITY` (`entities.noSuchEntity`) or `NO_SUCH_EVENT`, and each participant's refusal (R11). Otherwise it allocates `EVT-<year>-<tail>` (`record-core`'s opaque allocator, `ID_TABLE`), and writes the event, its attestations and participants in one transaction. `status` defaults to `EventScheduled`.
- **R7** An attestation from a captured document cites a held dated fact (`NO_SUCH_DATED_FACT`) or a capture extent (R1's capture and extent refusals); it never copies a date (R-3 H-1). A testimony attestation carries the member's statement (`NO_STATEMENT` when blank) and is graded D.
- **R8** The first dated attestation governs until a member chooses another with `chooseGoverning` (`NO_SUCH_ATTESTATION`, `ATTESTATION_UNDATED`). Each choice is recorded with who, when and why, and none is erased.
- **R9** `when` is derived only from the governing attestation and held in a `when_cache` `{start, end, precision, zone}`, rebuilt in the same transaction as any attestation, choice, merge or split (R14). An event with no dated attestation has `when: null`, read as "placed nowhere", never as a default date.
- **R10** A read of an event whose `when_cache` differs from its rebuild fails closed: it answers the event with `when: undetermined` and `why: "cache stale"`, never the stale value (`record-core`'s derived-cache convention).

**addParticipant({eventId, entityId, role, attestation, voteValue?, by}), correctParticipant({participantId, entityId, reason, by})**
- **R11** `addParticipant` refuses, in order: `NO_SUCH_EVENT`, `NO_ENTITY`/`NO_SUCH_ENTITY` (`entities.noEntity`, `noSuchEntity`), `UNKNOWN_ROLE` (naming the closed list; the detail says a payer or payee lives on the money fact), `NO_ATTESTATION` (a participant is what a document states or a member testifies; it is never filled from who held an office, R-3 H-10), then `NO_VOTE_VALUE` / `UNKNOWN_VOTE_VALUE` for `voted` (the profile's values). A repeat of (event, entity, role, attestation) answers `already: true`.
- **R12** Each participant answers its entity's resolution grade in the attesting capture (`entities.resolutionsFor`, the strongest for that entity) beside its attestation's grade, two axes, never one combined grade.
- **R13** `correctParticipant` refuses `NO_REASON` and `NO_SUCH_PARTICIPANT`. The corrected row stays, marked superseded with who, when and why; the new row carries the same role and attestation; and R16's listeners are told `participant_re_resolved` in the same transaction. Nothing is deleted.

**mergeEvents({keep, absorb, reason, by}), splitEvent({eventId, attestations, reason, by})**
- **R14** Only a member merges or splits (a machine stamp is refused `MEMBER_ACT_ONLY`); each refuses `NO_REASON` and an absent event. A merge moves every attestation, participant and relation of `absorb` onto `keep` and leaves `absorb` as an alias resolving to `keep`; a split moves the named attestations to a new event. Each is recorded with who, when and why, rebuilds the `when_cache` of every event it touches, and tells R15's listeners.

**onWhenChanged(module, fn), onEventChanged(module, fn)**
- **R15** `onWhenChanged`: a later module registers once; a malformed or second registration is refused through `membership.listenerRefusal`; listeners run in `MODULE_ORDER`, inside the transaction that changes an event's `when_cache`, with `{eventId, before, after}`, so each owner of event-bounded rows moves its `bound_cache` in that transaction (R-3 I-1). A listener that throws fails the write.
- **R16** `onEventChanged` (same registration rules) runs, after commit, for `when_moved` and `participant_re_resolved`, with the event id and what changed, so dependants are noticed (`reevaluation`'s `event_changed`).

**relate({from, to, kind, attestation, by}), withdrawRelation({relationId, reason, by})**
- **R17** `relate` refuses, in order: `UNKNOWN_RELATION` (the closed list), `NO_ENDS`, `SELF_RELATION`, `NO_SUCH_EVENT` naming the end, `NO_ATTESTATION` (every relation is cited). Otherwise it holds the relation with two grades: the assertion's (its attestation's) and its ends' (the governing attestations' grades).
- **R18** `stated_cause` is held only as a named source's claim: its attestation must be a capture extent (testimony is refused `CAUSE_NEEDS_SOURCE`), and every read answers it as "<source> states", never as a cause the record asserts. A machine stamp is refused for `stated_cause` (`CAUSE_NOT_MACHINE`). A member's hypothesised cause is not held here (K1467).
- **R19** `within` holds a sub-event in a larger one (a vote within a meeting). A `within` chain that would loop is refused `WITHIN_CYCLE`.
- **R20** `withdrawRelation` refuses `NO_REASON`, `NO_SUCH_RELATION`; a repeat answers `already: true`. A withdrawn relation remains, shown withdrawn with who, when and why.

**aliasAct({actId, eventId, by}), eventForAct(actId)** (`ACT-` ids become aliases of events)
- **R21** `aliasAct` refuses `NO_ACT` (not an `ACT-` id), `NO_SUCH_EVENT`, then `ACT_ALIASED` when the act already names another event. `eventForAct` answers the event an `ACT-` id names, or `found: false`; it never throws.

**followedImport({captureSha, body, period, by})** (Legistar following: the machine's writes, K1443 as BOB extended it, K1468)
- **R22** It refuses `NO_BODY` and `NO_PERIOD` (the member's scope: one body and one period a member follows; K1468), `CAPTURE_NOT_HELD`, then `NOT_LEGISTAR` (the capture is not one `legistar-reader` reads). It writes only what the reader's rows identify at both ends by source-native ids: events by `EventId` (meeting) and `EventItemId` (item votes, `within` their meeting), and participants whose `PersonId` resolves to a registered entity through its scheme identifier (`entities`, grade A). A participant whose id resolves to none is not written; it is answered in `unresolved` with its source row. Each row is stamped as the machine's, cites its capture, and is correctable by R13, R14 and R20.
- **R23** A meeting's start is the source's day and its separate local time joined in the profile's zone by `civil-time.joinLocal` (M-V2: no `EventDate` carries a zone), at minute precision. A source row that states cancellation (in its status or body name, M-V2 (2)) is written as the one event with status `EventCancelled`.
- **R24** A posting time (`EventAgendaLastPublishedUTC`, `EventMinutesLastPublishedUTC`) is a `publication` event of the agenda or minutes, `within` its meeting, whose `when` is an upper bound only: "on or before" the first instant the record observed that value (M-V2 (3)), never the time of first posting.
- **R25** An import is idempotent by source id: a row already held under its id is updated in place only by a changed source value, with the change recorded and R15/R16 told; a row never held is added.

**readEvent({eventId, viewer}), datedFactsFor({captureSha, viewer}), eventsFor({entity, kinds?, from?, to?, limit, viewer})**
- **R26** `readEvent` answers `NO_EVENT` for an empty id and `found: false` for an absent one (an alias answers its kept event). It answers kind, status, `when` (R9, R10), where, concerns, `within`, each attestation with its grade, each participant (R12) with superseded rows marked, each relation in and out, and the merges and splits it took part in.
- **R27** `eventsFor` answers the events in which the entity takes part or which concern it, ordered by `when` (R31's order), each with its roles; `limit` is clamped to 1–500 (default 100), with `truncated` by reading one past. `datedFactsFor` answers a capture's dated facts in extent order.

**timeline({set, from?, to?, lanes?, limit, viewer}), registerEventSource(module, fn)** (stage 2a)
- **R28** `timeline` takes an explicit set of entity ids or event ids (`NO_SET` when empty), never a project or inquiry scope, which the caller resolves (R-3 I-6). It answers the world's events concerning or involving the set ("what they did") and, apart, each registered source's items for the set ("what we did"); the two lanes are never interleaved into one list.
- **R29** Within a lane, items are ordered by R31; items whose order is undetermined are shown so, each band with its bounds, and items with no `when` are listed apart as "placed nowhere". `limit` as R27, per lane.
- **R30** `registerEventSource(module, fn)`: later modules (actions, docket, escalation) register once each (`membership.listenerRefusal`); `fn({set, from, to, limit})` answers that module's own acts as items `{at, label, ref, kind}`. A source that throws is answered as `{source, error}` beside the lane, never dropping the other sources.

**sequence({a, b})** (stage 2a)
- **R31** Answers `before`, `after` or `undetermined` with why, comparing the two events' `when` through `civil-time.compare`: a band or a coarser precision that does not settle the order is `undetermined`, never a guess. Equal values at their precision are `undetermined`. An event with no `when` is `undetermined: "placed nowhere"`. Sequence is computed on each read and never stored.

**whoWasSent({eventId, viewer}), statementsOf({entity, from?, to?, limit, viewer})** (stage 3)
- **R32** `whoWasSent` answers the participants of a `communication`, `issuance` or `meeting` event in the roles `sender`, `recipient`, `copied` and `present`, each with its attestation, in the words "sent to", "copied", "present"; never "knew" or "saw".
- **R33** `statementsOf` answers the `statement` and `communication` events in which the entity is `speaker`, `sender`, `author` or `actor`, in R31's order with undetermined orders shown, bounded as R27.

**proceedingStatusAt({proceeding, at, viewer})** (scope §1 COURTS; plan Choices 21)
- **R34** Refuses `NO_ENTITY`, `NO_SUCH_ENTITY`, then `NOT_A_PROCEEDING` (an entity not of kind `proceeding`). It answers the stage of the profile's flow for the proceeding's kind (`jurisdictions`' `proceeding_flows`) that the proceeding's held events reach on `at`, with the events it rests on, judged through `civil-time.validAt` and R31. It answers `undetermined` with why when the flow is not held for that kind, when the order of the deciding events is undetermined, or when no held event bears on it; never a stage by default.

**neighbours({node, kinds, at, page})** (the connection owner; K1469, K1470)
- **R35** The module registers once through `connection-grammar.registerOwner`, owner `events`, kinds: took part (one per role), `concerns`, `within`, and the five event links. `neighbours` answers, for an entity or event node, its connections in `connection-grammar`'s shape (each with its evidence and both grade axes), valid as of `at`, paged by `connection-grammar`'s bounds, from the indexes `event_participants (entity)` and `event_relations (from)`, `(to)`. It passes `connection-grammar.ownerConformance`.

**The ops map**
- **R36** The module publishes `eventsOps(events, url, body)`, an object of route arms keyed by op name, one arm for each act and read above, reading parameters from `url` (the control plane's stamps among them) and the act's arguments from the body. Every write goes through one append site, stamped by the control plane. Which credential reaches each op is `op-declarations`' and `control-plane`'s.

**The read contract**
- **R37** The tables of events (`event_id`, `kind`, `status`), the `when_cache` (`event_id`, `start`, `end`, `precision`, `zone`) `event_participants` (`event_id`, `entity_id`, `role`) and `event_attestations` (`event_id`, `capture_sha`: each capture an attestation of the event cites, K1563) are a stated read contract on the terms of `record-core` R37: a later module may join them in its own SQL, and every write to them stays this module's.

**A register row as an event (CONDITIONAL on courts-workbooks GO)**
- **R38** A court register row read by the court doctypes, with an entry id the source assigns, becomes a `filing` or `order` event of the proceeding, written as R22 writes, only for a proceeding a member follows. *(not yet met: T33-26, CONDITIONAL)*

## Private

### Uses

- `record-grammar`: `ID_TABLE` and `isHypothesisId` (R6, R39); the shared refusal grammar.
- `jurisdictions`: the active profile's zone, vote values, `proceeding_flows` (R23, R11, R34).
- `civil-time`: date-time values, calendar validation, three-way comparison, `validAt`, the zone-less day-and-time join (R1, R9, R23, R31, R34).
- `connection-grammar`: the connection shape, the owner registry and its battery, the bounds (R35).
- `record-core`: `transact`, the opaque id allocator, `declareTable` and the derived-cache convention (R6, R10, R40).
- `membership`: `viewerPredicate`, `listenerRefusal`, `MODULE_ORDER` (R15, R16, R30, R40).
- `promotion`: `registerStep`, for events projected from a capture's reading.
- `provenance`: whether a capture is held (R1, R22).
- `reading-pipeline`: `onRead` (R4).
- `extraction`: the reading's stated dates and references (R4); `noSha` (R1).
- `content`: extents and their capture grade; office metadata through the content of an office capture (R2, R5).
- `entities`: `noEntity`, `noSuchEntity`, `has`, `resolutionsFor`, scheme identifiers (R11, R12, R22, R34).
- `legistar-reader`: its rows of bodies, persons, events, items, votes and posting times (R22–R25).
- `court-doctypes` (CONDITIONAL, only on GO; L1): register rows with entry ids (R38).

### Invariants

- **R39** One home per fact, checked at the store's gate: no event, attestation or participant row holds an amount; no role is payer or payee; no `HYP-` id is accepted in any field naming an id (`isHypothesisId`; K1467); every `when_cache` equals its rebuild.
- **R40** Sight (K1489): an event, dated fact or relation is answered to a viewer only through attestations whose capture the viewer may see; one with none visible is not answered and not counted; testimony inside a hidden project stays fenced and uncounted. The tables are declared through `record-core.declareTable` with their purge, export and sight classes, the `when_cache` as derived-rebuildable.
- **R41** Absence is never an event, sequence is never stored, and no event is minted only to join two readings of an aggregate (R-3 S-5). No machine-written row infers a cause, a relation other than `within`, or a participant from office holding.
- **R42** No place is named in this module's behaviour, defaults or outward text; zones, vote values and flows come from the profile, and tests run against the fictional test profile.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 EVENTS (two objects; `when_cache`; participants; relations; absence; sequence; no aggregate events), §2 TIME (precision and zone; `onWhenChanged`), §2 CONNECTIONS (owner, `neighbours`, indexes), §2 "Cross-cutting rulings" (sight; the published timeline's lanes), §5B.4 (L1 core, L2, L3 relations), §5B.5 L4 (`whoWasSent`, statements in order, edit acts), §7 COURTS (proceeding status; register rows, conditional), §10 (cause is stated never inferred; world date-times carry precision and zone; extraction is targeted; one home per fact; hypotheses never in findings; one id grammar).
- Bob's rulings K1462 (events, timeline), K1464 (zone), K1465 (deciders, authors, signers, implementers), K1467 (hypotheses), K1468 (targeted extraction), K1489 (sight), K1494 (lanes); BOB's K1443 extension and K1470 (the event model), K1444 (iii).

### Suggestions

- Factory `eventsOf(ctx)`, one instance per store, reaching its uses through theirs (K61). Tables: `dated_facts`, `events`, `event_attestations`, `event_participants`, `event_relations`, `event_when_cache`, `event_aliases` (`ACT-` and merge aliases), `event_choices`.
- Op names are BOB's (T33-88), for example `datedfact`, `eventcreate`, `eventattest`, `eventgovern`, `participantadd`, `participantcorrect`, `eventmerge`, `eventsplit`, `eventrelate`, `eventrelationwithdraw`, `actalias`, `eventimport`, `event`, `eventsfor`, `timeline`, `sequence`, `whowassent`, `statementsof`, `proceedingstatus`. Catalogue rows are new; promotion's stamp of them is T34's (K1504).
- Open (BOB's): (1) who holds R4's opt-in set (an administrator's setting is proposed) and which capture classes it names; (2) R5 reads office metadata through `content`, or `events` gains an edge to `office-readers` (L1) — the plan names neither; (3) the profile's body-variant → body map that R22/R23 need (M-P2 (a)) is not in T33-2's list as written; (4) R34's stage semantics rest on `proceeding_flows`, whose shape T33-2 fixes; (5) whether R14's merge may join a machine-written row (proposed: yes, the member's act).
- Tests: the 50-event gold set (M-V3) as R23's fixture (DST both offsets); a cancelled-body row (R23); a supplemental republish not moving R24's bound; R31 across a day band and a minute value; a stale `when_cache` (R10); a listener that throws (R15); an outsider seeing no testimony (R39).
