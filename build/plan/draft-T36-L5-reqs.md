# Draft: T36 L5 requirement wordings (T36-14 … T36-18)

Drafted for BOB #135 from `plan/current.md` T36-14–T36-18 and their rulings (K1941, K1973, K2021, K1988, K1430, K1972, K1991, K2063, K2079, K31), N715, N724, N725, N728, N729, N736, DEC-164 (4), U108–U114. Each line is ready to paste; ids continue after each file's highest. The shared recorded-by read shape is stated once, in `events` R49, and the other three cite it (each already uses `events`).

## events (T36-14) — highest today R48

Under a new heading after R48:

**recordedBy({captureSha, extent?, limit?, viewer})** (T36; N715, DEC-164 (4): who recorded something from this passage)
- **R49** The one shape of a read by capture and extent naming who recorded each matching row; `standards` R49, `money` R24, `people` R36 and every read `retrieval` R76 registers answer in it. It answers `{ok: true, module, capture_sha, items, truncated}`, each item `{module, record, kind, field, extent, relation, by, at, withdrawn}` for one row this module holds that cites an extent of the capture: `record` the row's id, `kind` the kind of row, `field` the field that cites it, `extent` that extent in `content`'s canonical form (a citation naming no part is read as `document`, `content` R5), `by` who recorded it as the control plane stamped it (a member, or `class:<cls>` for the machine, DEC-52), `at` this module's instant of the write, and `withdrawn` true when this module shows the row withdrawn, superseded or corrected (it stays recorded), else false. With `extent`, only rows for which `content.extentRelation(extent, row's extent)` answers `same`, `narrower` or `wider` are items, `relation` that answer; without it every row citing the capture is an item, `relation` null. Items are in the order of their canonical extent, then `record`, then `field`; `limit` is clamped to 1–500 (default 100), `truncated` by reading one past. A row is answered only to a viewer who may see it under this module's sight (R40), and a hidden row is neither answered nor counted; a capture not held or not visible answers `items: []`, as an absent one. Refusals, each writing nothing: `VIEWER_MISSING` (no viewer stamp), `NO_SHA`, `EXTENT_MALFORMED` (an `extent` `content.canonicalExtent` cannot read). It writes nothing, never throws, and is an in-process read, not an arm of R36. Here the rows are: dated facts (R1; `kind: "dated_fact"`, `field: "extent"`); attestations citing a capture extent (R7; `kind: "attestation"`, `record` the event id, an alias answering its kept event, `by` the act that added the attestation); and the extents a use cites (R43, R44; `kind` the event's kind, `field` one of `stated_reason`, `outcome`, `scope`, `conditions`, `unmet`; `withdrawn` per R45). Testimony cites no capture and is never an item. (N715; DEC-164 (4); K1941, K2063) *(not yet met: T36)*

**Uses changes.** `content`: `extentRelation` (its R6) and `canonicalExtent` (its R2), for R49 (an existing edge).

**Suggestions.**
- (CONNECTION-GRAMMAR #3 J1, K2079) The connection owner (R35) judges a hub per kind with `connection-grammar.hubBoundOf(kind)` (its R6 as amended in T36-40), never the whole set against `BOUNDS.hub`: no new R (R35 already reads `connection-grammar`'s bounds); the test is a node with 1,500 `event_voted` connections answered in pages, and one with 1,500 of another kind answered `hub`.
- Tests for R49: a dated fact recorded from a found extent named with its member; a machine import named `class:<cls>`; a withdrawn use marked; an attestation inside a hidden project neither answered nor counted; an `extent` filter answering `narrower` and `wider` and leaving a disjoint row out; `VIEWER_MISSING`.

## standards (T36-15) — highest today R48

**R38, appended** (N725): (T36; N725, K1973) Each capture's address and retrieval instant are read from `provenance.receiptsOfCapture` (its R60) for that capture alone; `version_basis` never reads every receipt (`receipts`, its R16) and answers exactly as before. *(not yet met: T36)*

New heading after R48:

*Found, and who recorded it* (T36; N715, DEC-164 (4))
- **R49** `recordedBy({captureSha, extent?, limit?, viewer})` answers in `events` R49's shape, over the rows of this module that cite an extent of the capture, a content id read as its row's capture and extent (`content`'s read contract, its R45): a standard's `text` (R2, R47), `portion` (R18), `requires` (R19), `cited_by` and the `search` captures (R34), `copy_claimed` (R36), `version_basis` (R38, each capture read as `document`), `force_source` (R38) and `target`'s `metric` and `definition` (R42), each `kind: "standard"`; a force's `citation` and `criteria` (R35, `kind: "force"`); an adoption's `citation` (R40, `kind: "adoption"`); an imposition's `citation` (R43, `kind: "imposition"`); a record's `source` (R50, `kind: "in_force_through"`). `by` is the act's `author`; `withdrawn` is true for a superseded standard (R6) and a withdrawn force or record. A proposal (R9) is never an item. Sight is R14's and R37's: a standard held with a bundle's sight is answered only to a viewer who may see that bundle. No item carries a standard's text (R41). (N715; DEC-164 (4); K1941, K2063) *(not yet met: T36)*

*Known in force through a date* (T36; N736; civil-time R22)
- **R50** `inForceThroughRecord({standard, through, source, reason, author, viewer})` (`op=standardinforcethrough`) records, by a member's act, that one version is known to be in force through the date `through` (`YYYY-MM-DD`), from `source`, `{captureSha, extent}`, a held capture extent of the source checked that day (an official or codifier copy, a portal page, an office's reply). Refusals in order, each writing nothing: `MACHINE_CANNOT_DECLARE_STANDARD` (R1's); `NO_SUCH_STANDARD` (R17); `FORCE_TEXT_NOT_HELD` (not held `text`, R34); `THROUGH_INVALID` (not a calendar date, `civil-time.isCalendarDate`, or before the version's stated `from`); `THROUGH_NO_SOURCE` (no source, or `content`'s extent refusals, a capture not held and one not visible answered alike); `THROUGH_AFTER_CHECK` (`through` later than the local day, in the active profiles' zone, of the source capture's latest retrieval, `provenance.receiptsOfCapture` R60's `last_retrieved`); `STANDARD_NO_REASON`. A source with no receipt (a member's upload) keeps `through` as the member states it, answered `checked: "stated"`; otherwise `checked: "retrieved"` with that day. Records are append-only, with who, when and why, and take the standard's sight (R14, R37). `inForceThroughWithdraw({record, reason, author, viewer})` withdraws one (`NO_SUCH_RECORD`, `STANDARD_NO_REASON`; a repeat answers `already: true`), kept with who, when and why. `inForceThroughOf({standard, viewer})` answers every record, standing and withdrawn, with its source, `checked`, author and time; R5 answers the standing ones. (N736; K2021) *(not yet met: T36)*
- **R51** (amends R20) R20 reads the latest `through` among a version's standing records (R50). Where the version's end is not stated (a null `to`, or an end event with no `when`), a `date` that `civil-time.validAt` finds `in` the period `{from, to: through}` answers `in_force`, its `why` naming the record ("known in force through <through>, from <source>, recorded by <author>"); any other date answers as before (after `through`, `undetermined`, "no end is stated", never `not_in_force`). R20's other rules decide first: an override in force answers `overridden` (R38); two versions covering the date, or none deciding it, `undetermined`; a codifier copy's `current_through` before the date with no later version held `undetermined` (codifier lag); a stated end decides as before, the record answered beside it. R7 and `bindsAt` (R43) read R20 so, and `bindsAt` answers `binds` up to `through` where its answer rests on R20; `conformance` R27 then refuses only where nothing is recorded. (N736; K2021; civil-time R22) *(not yet met: T36)*

**Uses changes.** `provenance` (L3): `receiptsOfCapture` (its R60) for R38 and R50, in place of `receipts` (an existing edge). `content`: `extentRelation`, `canonicalExtent` (R49). `civil-time`: `isCalendarDate`, `localDay` (R50). `events`: R49's shape (an existing edge).

**Suggestions.**
- Op names `standardinforcethrough`, `standardinforcethroughwithdraw`, `inforcethroughof` and the refusal codes are this fold's; `op-declarations` declares them and `promotion` stamps their rows (T37). The design stream has no words yet for "known in force through"; R45 gains them when it gives them.
- Tests: R38 reading only the named captures' receipts (a store with many receipts at other addresses answers the same); R50 each refusal, `THROUGH_AFTER_CHECK` one day past the capture's retrieval, an upload answered `checked: "stated"`; R51 a version with a null `to` answering `in_force` on `through` and `undetermined` the day after, an override still `overridden`, a codifier lag still `undetermined`, a withdrawn record no longer counted; `bindsAt` answering `binds` through the record; R49 a force citation and a superseded standard marked.
- **P6:** 2,938 lines at T36's opening; R49–R51 are estimated at +250 to +400. The job reports if it would pass about 4,000.

## money (T36-16) — highest today R23

New heading after R23:

**recordedBy({captureSha, extent?, limit?, viewer})** (T36; N715)
- **R24** Answers in `events` R49's shape over the money facts whose `source` is an extent of the capture (R2): `kind: "money_fact"`, `field: "source"`, `by` the fact's `by`, `withdrawn` per R7. A fact whose source is another fact cites no extent and is not an item. Sight is R21's. (N715; DEC-164 (4); K1941, K2063) *(not yet met: T36)*

**The money trail** (T36; N728; U108, U110–U114)
- **R25** (amends R13) `readSet` of a set of purpose `trail` answers beside each included fact (and each open proposal's fact) its trail row: `from` and `to`, each the party as the source states it with its grade (`grade.parties`), or `{stated: false, says: "not stated in this source"}` when the fact holds none, never filled from another fact, an event's participants or an entity's role; `moved`, read from the events the fact `concerns` (`events.readEvent`): for phase `actual`, `{state: "dated", when, event, attestation}`, the concerned event's `when` at its own precision and zone and the attestation that dates it (with several concerned events, the one of kind `payment` or `transfer` when exactly one is), else `{state: "undetermined", why}` (no event concerned, its `when` null or undetermined, or several that do not single one out, naming them), never placed by the fact's `period`; for any other phase `{state: "did_not_move", phase, when}`, `when` the concerned event's (such as an adoption) where one dates it, else null; `compared`, for a fact of phase `proposed`, `adopted` or `adjusted`, each included `actual` fact sharing a `concerns` id with it, with `reconcile`'s answer (R11), never summed or merged into it, and `budget_only: true` when there is none; the fact's adjustments (R7) beside it, never netted; and `gaps`, each of `from`, `to`, `moved` and `basis` answered not stated or undetermined, so a view can offer the acts that add evidence. It writes nothing. A fact or event recorded later changes what the trail answers beside a fact, never that fact's own fields or figure. (N728; U108, U110–U114; K1988, K1430) *(not yet met: T36)*

**Uses changes.** `events`: `readEvent` (its R26: kind, `when`, the governing attestation) for R25, and R49's shape for R24 (an existing edge). `content`: `extentRelation`, `canonicalExtent` (R24).

**Suggestions.**
- R25 is data only; the money screen, its sorting (U110), column explanations (U112) and the "Where more evidence would help" words (U115) are the new screens' (N672, left out). Tests: a fact with no `to` answered "not stated in this source"; an actual fact dated from its payment event at day precision; an adopted figure "did not move" with its adoption's date; a fact concerning no event `undetermined`, its period unused; a budget figure beside the paid figure with `reconcile`'s dimensions and no sum; an adjustment beside, not netted; recording an event later changing `moved` and no field of the fact.

## people (T36-17) — highest today R35

New heading after R35:

**recordedBy({captureSha, extent?, limit?, viewer})** (T36; N715)
- **R36** Answers in `events` R49's shape over: person facts whose citation is an extent of the capture (R9; `kind: "person_fact"`, `field: "citation"`, `withdrawn` per R11), and identity claims whose evidence cites one (R1; `kind: "identity_claim"`, `field: "evidence"`, `withdrawn` per R4). Sight is R31's, an `address` or `contact` fact answered only as R10 admits (the item carries no value). Never an item: an expunged row (R12), a member's tie (R20), the protected source link (R21: this read answers exactly as if none were held), an interest-check result (R23). (N715; DEC-164 (4); K1941, K2063) *(not yet met: T36)*

**Uses changes.** `events`: R49's shape (an existing edge). `content`: `extentRelation`, `canonicalExtent` (R36).

**Suggestions.** Tests: a person fact recorded from a found extent named with its member; a fact inside a hidden project neither answered nor counted; a source link held on the same extent absent from every answer; an expunged fact absent.

## retrieval (T36-18) — highest today R75

**R73, appended** (N715): (T36; N715, DEC-164 (4); K1941, K2063) Each match also carries `recorded`: the items (`events` R49's shape) that each recording module's read answers for the match's capture under the same viewer and whose extent stands to the match's (a table item's `table.extent`) as `same`, `narrower` or `wider` (`content.extentRelation`), each with its `module`, `record`, `kind`, `field`, `relation`, `by`, `at` and `withdrawn`, so a result already recorded shows who recorded it; `recorded: []` when none. The reads are `events.recordedBy`, `standards.recordedBy`, `money.recordedBy` and `people.recordedBy`, then each read R76 registers, in the modules' total order (R83), each called once per capture the call reads, with `limit` 500. The answer carries `recorded_read` (the modules whose reads answered) and `recorded_not_read` (each read that refused or threw, with why, and while no later module is registered `{module: null, why: "no later module's records were read: none registered"}`), so an empty `recorded` is never read as "nobody recorded this" beyond `recorded_read`; a match of a capture whose read answered `truncated` carries `recorded_truncated: true`. Reading them writes nothing. *(not yet met: T36)*

**R74, appended** (N724): (T36; N724; K1972) A `.docx` table held as cells in the reading (`office-readers` R11 as amended, carried by `extraction`) is a held table: its date or amount column is one item as above, `table.extent` the table's extent and `rows` its row count, never one item per row or cell. *(not yet met: T36)*

New lines after R75:

**registerRecordedBy(module, fn)** (T36; N715; K31's pattern, as R52, R62)
- **R76** A later module registers once at start the read R73 calls for it, `fn({captureSha, extent?, limit, viewer})`, answering in `events` R49's shape. A malformed registration, or a second by the same module, is refused through `membership`'s `listenerRefusal` (its R81: `LISTENER_MALFORMED`, `LISTENER_DECLARED`); registered reads run in the modules' total order (`MODULE_ORDER`, R83), after the four R73 names. A read that throws, rejects, refuses or answers another shape is named in `recorded_not_read` with why and changes nothing else in the answer. (`citation` registers, T36-21.) (N715; K31, K2063) *(not yet met: T36)*

**selectionRead({handle, viewer, owner})** (T36; N729)
- **R77** Answers what `selectionResolve` (R19) answers at `weight: "report"` (R20): the members re-resolved under the current viewer, with the drift, and `NO_SUCH_SELECTION` (C-33.20) for an unknown, released or expired handle, `NOT_YOURS` for another owner's. It writes nothing: it does not extend the selection's life, does not run R22's sweep, and changes no column of any selection row, so an expired selection not yet swept answers `NO_SUCH_SELECTION` and stays as it was. Never throws. Not an op: `answers` R28 reads a selection through it at set time, so a refusal there writes nothing. (N729; K1991) *(not yet met: T36)*

**Uses changes.** `events`, `money` (existing edges): `recordedBy` (events R49, money R24). **New edges (rule 4):** `standards.recordedBy` (standards R49) and `people.recordedBy` (people R36); both precede `retrieval` in `modules.json` (layer 5: standards 55, people 60, retrieval 64). `content`: `extentRelation` (its R6), for R73. `office-readers` needs no edge: the cells reach R74 through `extraction`'s readings.

**Suggestions.**
- `recorded` adds no table. Tests: a dated fact recorded from a found passage, then the same find naming its member; a withdrawn record marked; a record in a hidden project not shown and not counted; `recorded_not_read` with nothing registered, and with a registered read that throws; a `.docx` fixture's amount column one item (`table.extent`, its rows); `selectionRead` leaving `expires` and the selection rows byte-identical, and an expired handle refused.
- **P6:** 3,267 lines at T36's opening; R73–R77 are estimated at +250 to +350, about 3,600. The job reports if it would pass about 4,000.

## Choices made

1. The four recording modules come before `retrieval` (`modules.json` 49, 55, 57, 60 < 64), so retrieval calls their reads by use; `registerRecordedBy` is only for later modules (`citation`, L6), as the entry and K2063 (1) say. No earlier module registers (P4).
2. The shape is stated once, in `events` R49 (events is used by standards, money, people and retrieval); the other three cite it.
3. "By capture and extent" matches through `content.extentRelation`: `same`, `narrower` and `wider` are answered with the relation; a disjoint row is not.
4. Withdrawn, superseded and corrected rows are answered marked `withdrawn` (correct forward, nothing deleted); expunged values, member ties, the protected source link and proposals never are.
5. The four reads are in-process reads, not ops: members see them through `findIn` (R73), which already gates.
6. N728's trail read is a new `money` R25 that amends R13 (`readSet`), as `events` R47 amends R37. With several concerned events, "When it moved" takes the single `payment` or `transfer` one, else undetermined. A budget figure is compared with included `actual` facts sharing a `concerns` id.
7. N736: `through` may not pass the source capture's latest retrieval day where a receipt states one (this reuses T36-9's read); it applies only where no end is stated; codifier lag, overrides and a stated end still decide first; only a standard held `text` (R34).
8. N729's read neither extends the life nor sweeps. `findIn`'s `{selection}` scope (R73, "resolved as R19 resolves it") is left unchanged, since the entry does not name it.

## For Bob

None. Each point follows from a cited ruling or is a detail that is BOB's (P17). K2021 found N736 not Bob's: it follows from civil-time R22.

## Against the sources (for BOB)

- `retrieval` R73 says `findIn` "writes nothing", but its `{selection}` scope resolves "as R19 resolves it", and R19 extends the selection's life. This is the same defect N729 fixes for `answers` R28. R77 could serve `findIn` too, but the entry does not re-point it.
- `retrieval`'s Uses already list `standards` and `people` for R68's read contracts, but `modules.json` has neither edge; rule 4 adds them.
