# following — requirements

> **DRAFT by a requirements-drafting worker for BOB #114, not reviewed.** 2026-10-05, on `tranche/T32` (P18), for T33's opening (§5.9). Not yet in `build/requirements/`.

**Status** · In force: a new module, reviewed with T33's new modules (K1505; T33-79), a seam beside `monitoring` with no copy (K617): no `monitoring` requirement moved. Following a whole policy portal and a standard's new editions is not here. Last changed T35 (T35-65: R20, R21; K1727, K1740); every requirement met (K2027).

**Size (P6).** Estimated 1,500–2,500 lines (T33-79, est 15 requirements). Under 4,000.

## Public

### Purpose

The group's following of what happens at a body and in a register, on the scheduler's one alarm: a body a member follows is read from its Legistar records so that `events` can write what it did; a document watched per meeting is captured before each meeting by the body's notice period; a public register is re-read or re-rendered on the tick, and one behind a member's account only at that member's act; a member may follow a register query naming a person; a portal's dataset is snapshotted with its changes keyed field by field. Like `monitoring`, it watches and captures; what a change means is never its to say.

### Provides

Terms. A **follow** is a member's standing act naming what is followed and for which period. A **tick** is one scheduled read of one followed subject. A **subject** is `{kind, id}`, `kind` one of `body`, `meeting`, `register`, `person-query`, `portal`. (T35) `policy` is a further kind, a held policy's published copy (R20). The **host** is `monitoring.sweepHost()`'s services (its R65: pause, claim, land, gate). Every refusal names `reason`; one with a catalogue row carries its `check`, `code` and `translation`.

#### Following a body through Legistar (§5B.4; K1443, K1468)

- **R1** `followBody({body, from, until, author, viewer})` records a member's follow of a body for a period. Refusals, in order, each writing nothing: a machine author `MACHINE_CANNOT_FOLLOW`; a body absent or unseen by the viewer `NO_SUCH_BODY` (alike); a body without a Legistar body identifier (an `entities` identifier whose scheme the profile names for Legistar) `NO_LEGISTAR_ID`; `from` absent or after `until` `BAD_PERIOD`. `unfollow({follow, author})` ends it at its author's act. Only a body and period a member follows is read (K1468).
- **R2** A followed body's tick reads its Legistar events, event items, votes and matters for the followed period, each read a capture through `acquisition`, attributed to the follow as its authority, and hands each captured read to `legistar-reader` and to `events.followedImport({captureSha, body, period, by})` (the sibling `events` draft), which write the machine-attributed events, participants and votes and the agenda and minutes posting times (K1443). A read already captured with the same bytes lands nothing new.
- **R3** (§6.4; Choices 17) A matter's enactment record (`MatterEnactmentNumber`, `MatterEnactmentDate`, `MatterStatusName`) whose bytes differ from its last capture is captured as a new version of its Legistar address, so a version notice follows from that capture through the instrument keys (`reevaluation`, X73); this module raises no notice itself and never reads a rendered codifier page.

#### Per meeting (§4.4 TIME L3; K1444, K1445)

- **R4** For each monitored address whose governing frequency is `per_meeting` (`monitoring` R14) and whose watch names its body, one capture is due at each of the body's meetings, at the meeting's start minus the body's notice period. The meetings are the profile's recurrences for that body (expanded by `civil-time`) and its observed meeting events (`events`), an observed meeting governing over the recurrence instance it matches; a meeting whose status is cancelled earns no capture. Times are in the meeting's zone.
- **R5** A `per_meeting` watch with no body named, a body with no recurrence and no observed meeting in the next 24 months, or a notice period the profile does not hold with a primary source (K1445), is `unscheduled` with its reason, stated on R13's answer, never given a guessed time.
- **R6** Each `per_meeting` capture states the alarm's lateness: the instant it was taken less the instant it was due, so a capture taken after the meeting began says so.

#### Following a register (§7.4; K1449)

- **R7** `followRegister({address, render, author, viewer})` records a member switching a watch on for a public register (R-2 C-E1). On the tick, a static register is re-read; one that needs rendering or session cookies is re-rendered through `capture`'s render path when `render` is set; otherwise only its static form is followed and every answer about it says so. Refusals as R1's, with `NO_LOCATOR` for an address that is not a public https locator.
- **R8** (K1449) A register behind an account, or fee-bearing, is never read on the tick: it is refreshed only by `refreshRegister({follow, author})`, the act of the member whose own credential it uses, with the price shown first when fee-bearing, and what it brings is marked not reproducible by the public. A tick that reaches such a register records `member_act_required` and fetches nothing.

#### A register query for a person (K1484, C2 row 11)

- **R9** `followPersonQuery({register, scheme, value, person, author, viewer})` follows a register's own query for one identifier a member names (a filer id, a licence number), the `scheme` one the profile lists for that register. A query by name alone, a query across registers, or a scheme the profile does not list for that register is refused `PERSON_QUERY_NOT_NAMED`, writing nothing. Each tick reads only that query's answer; it follows no link out of it and never searches for the person elsewhere. A fee-bearing or account-gated register falls under R8.

#### Portal snapshots (§8.5)

- **R10** `followPortal({address, query, key, author, viewer})` follows a portal's dataset, keyed to its query (the address with its query parameters, normalised), with a declared key field. Each tick captures the dataset's answer as a snapshot, a capture like any other, and records it as a vintage whose validity is the capture instant (`civil-time` `validAt`).
- **R11** `snapshotDiff({follow, from, to})` answers, between two snapshots of one portal follow, the rows `added` and `removed` by key and, for a key in both, each `changed` field `{key, field, before, after}`. A key missing or repeated in either snapshot makes that row `undetermined` with its reason, never matched by position. It writes nothing; a difference is never a finding.

#### For `scheduler`: followDue(now), followWake(now), followTick(now, rank?), onFollowed(module, fn)

- **R12** Due while any follow (R1, R7, R9, R10) is due by its cadence or any `per_meeting` capture (R4) is due; wake is the earliest instant one falls due, or null when none is. A body, register, person query or portal follow is due daily from its last read unless the follow names a longer cadence.
- **R13** A tick reads at most 50 due subjects, oldest due first (or in the rank's order when `scheduler` passes one, as `monitoring` R19), each claimed under the host's epoch so a retry never reads a subject twice (`monitoring` R21), and answers `{configured, at, epoch, read, captured, unscheduled, member_act_required, failed, paused}`. When the host is paused (`monitoring` R30) it reads nothing and says so.
- **R19** (K1666) `onFollowed(module, fn)`: one registration per module; after a follow is recorded, ended, or its next due instant changes (R1, R4, R7, R9, R10), `fn({follow, due})` is called once, after the act's transaction, with that follow's id and its next due instant (null when none), so `scheduler` re-arms its wake. A throwing `fn` never undoes the act.
- **R14** `follows({viewer})` answers every follow the viewer may see with its subject, author, period, cadence, last read, next due, and its `unscheduled` reason if any, so a follow that is not being read is visible without waiting for a tick.

#### Watching the policies a group holds (§6B.4 L5; K1727)

- **R20** (K1727, K1740) Every policy the group holds is watched with no member act: for each standard `standards` holds as a policy (its `family` a policy family, T35-31) whose text is held from a capture of a public https address, this module holds one watch of that address (subject kind `policy`), made when the text is first held and ended when the policy is superseded or withdrawn. A watch is due every 7 days from its last read (R12), read on the tick (R13) under the host as any follow, and each read is a capture through `acquisition` attributed to the watch. A read whose bytes equal the last capture of that address lands nothing new; one whose bytes differ is kept as a new capture of the address, beside every earlier one and never replacing it, so every version seen is kept, and is handed to `standards` as a version of the policy from captures (T35-31), whose text it never edits. Each capture takes the sight of the policy it watches, so a policy kept from the public keeps its watch's captures there too (K1740). An address behind an account or a fee is never read on the tick (R8, R15): the watch records `member_act_required`. An address that does not answer is recorded `failed` with its reason and stays watched; R14 lists each watch with its last read and next due, its author stated as none (the group's standing watch, K1727), and R19's listeners are told when a watch is made, ended or its next due changes, as for any follow.
- **R21** (K1727; DEC-145 (5)) `policyChanges({after?, limit?, viewer})` answers `{changes: [{watch, standard, address, before: {capture, at}, after: {capture, at}, amendment_held}], cursor}`: one entry per kept capture of R20 whose bytes differ from the capture before it, in order of the later capture's instant after `after`, at most `limit` (default 200, clamped to 1–200), `cursor` the last answered when more follow, else null. `amendment_held` is `true` when `standards` holds an amendment or a superseding version of that policy with an effective date between the two captures, else `false`. A change in a policy the viewer may not see is left out whole. It writes nothing; a change is never a finding and never says what changed means (R16). It is the read `notice-producers` (T35-67) shows as a "Noticed" item for a member to review, in DEC-145 (5)'s words.

## Private

### Uses

Rule 3's list: `monitoring` (`sweepHost`, its R65; R14's frequencies), `capture` (the render path, R7), `acquisition` (captures, R2, R8, R9, R10), `events` (observed meetings, R4; the Legistar following write, R2), `legistar-reader` (R2, R3), `jurisdictions` (the profile's recurrences, notice periods, identifier schemes), `civil-time` (recurrence expansion, zones, `validAt`).
(T35) `standards`: the held policies with their source address and family, and a version from captures (T35-31), for R20; its amendments and supersessions, for R21's `amendment_held`. A `modules.json` edge, BOB's (P17).
**Not in Rule 3, needed by this draft (open):** `entities` (R1's body identifier), `membership` (sight and the machine-author test), `record-core` (`declareTable`, `transact`), `promotion` (if a landing promotes outside the host's `land`).

### Invariants

- **R15** (K1449; `monitoring` R36) Nothing is fetched unattended that a member's credential or a fee would pay for, and no daemon path uses a member's credential or a group-level paid account.
- **R16** (Intake Doctrine §4, §6; `monitoring` R37) Following is mechanical: a tick captures and records, and never states what a change means; what lands is never verified (a member's act).
- **R17** (S0-3) Its tables (follows, per-meeting schedule, snapshot vintages) are declared with their classes; a person query's follow takes the narrowest sight of its author's project.
- **R18** No place is named in this module's behaviour or outward text: bodies, schemes, notice periods and Legistar's client name come from the profile or site data.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §4.4 (TIME L3: `per_meeting` at the meeting time minus the notice period, the alarm's lateness stated), §5B.4 (Legistar following for a body and period a member follows), §6.4 (watching on Legistar enactments), §7.4 ("Following a register"), §8.5 (portal snapshots keyed to their query with keyed field-level diffs; dataset vintages as `validAt` values), §2 "Cross-cutting rulings" (lookup conduct), §10 row "People are tracked…" (C2 row 11: a watch may follow a register query a member names for a person, never an unattended crawl).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §4, §6; `docs/development/SCHEDULER.md` (one alarm; how a consumer joins).
- K1443, K1444, K1445, K1449, K1468, K1484 (row 11); D13, D201.
- `BIO_Capability_Ladders_v0_1.md` §6B.4 L5 (PO16: every held policy's published copy watched, every version kept, a change "Noticed"), §6C.4 L5; K1727, K1740; DEC-145 (5): R20, R21 (N652).

### Suggestions

- **Open for BOB.**
  1. **Uses** beyond Rule 3 (above).
  2. **`per_meeting` naming its body.** `monitoring`'s watch (the gathering grammar or the document's frequency) has no body field today; R4 needs one. Either the gathering grammar gains `body` (monitoring's job, a grammar change) or this module holds the link per watched address (`perMeetingBody({address, body, author})`). The draft assumes the second keeps monitoring untouched (P6).
  3. **Who owns `per_meeting`'s captures.** R4 takes them off `monitoring`'s plan; `monitoring` R16 keeps listing them `unscheduled` (no interval). A one-line `monitoring` rewording ("scheduled by `following`") avoids two answers.
  4. **`events`' Legistar write.** R2 uses `followedImport` as the sibling `events` draft names it (T33-26); its `by` is the follow.
  5. **Cadence words.** R12's daily default and "a longer cadence" follow `monitoring` R14's list; BOB may prefer one shared word list.
  6. **The court register path**: a court register is a register under R7–R8; a row becoming a `filing`/`order` event is `events`' (T33-26).
  7. Refusal codes are this draft's.
- **T35-65 (open technical details, BOB's).** R20's 7-day cadence is BOB's (a protective choice under K1881: a policy page changes seldom and the fleet's fetch volume stays low); a member may not shorten it in T35. The watch may be a row of the follows table with subject kind `policy` and the `per_meeting` columns null. Which standards are policies is `standards`' family read (T35-31); if its name differs, the job follows it.
- **The host.** Running every tick under `monitoring.sweepHost()` (claim, land, pause, gate) is `link-sweep`'s precedent (N506) and gives one pause and one idempotence key.
- **Tests against captured JSON.** Fixtures of Legistar `Events`, `EventItems`, `Votes`, `Matters` for a fictional body under the test profile; a zone-less `EventDate` normalised from site data; a `- CANCELLED` meeting earning no `per_meeting` capture.
