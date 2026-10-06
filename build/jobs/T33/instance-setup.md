# instance-setup (T33)

**Status** · session_01RowoPV5ZyJHusShpyq9FEj · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Read whole: my requirements, the plan's T33-87 and Rules, K1504–K1506, K1563; the Provides of entities, lines, people, legistar-reader, credentials, jurisdictions (R24, R52), membership R84; my code and tests. B1's two reds are fixed on my branch (keys stub `declareTable`; identity R9 re-pinned to "no probe armed", K1668).

QUESTION (decides how R50–R52 are built; I carry on with R53–R55, the fleet bindings and table declarations meanwhile).

The bridge and the seats need profile data the held profiles do not carry, and lines R4 refuses a machine line unless both ends are held by scheme identifiers (`MACHINE_NEEDS_IDENTIFIERS`, checked through `entities.entityByIdentifier`):
(a) No counterparty (jurisdictions R24) carries an identifier, nor the organisation its body is "within" (R50's `part_of`). The only `identifier_schemes` are `legistar_person_id` (Oakland) and `ellery_person`/`marlow_bar` (test), all `entity_kinds: ["person"]`.
(b) No scheme holds a Legistar `BodyId` (R51 adds it to the body entity: `UNKNOWN_SCHEME` today), and none can identify a seat's office (Legistar has no seat id; M-P2 (b)).
(c) No map from `MemberType` to capacity (R52). And lines' closed capacities have no `undetermined` (R1 `UNKNOWN_CAPACITY`), so R52's "else `undetermined`" cannot be written as a `holds` capacity.
(d) R51 matches a profile body to a Legistar body through the body-variant map, whose keys are organisation keys (`city_council`, …) and whose patterns match Legistar's names, not the profile's ("Oakland City Council" matches none), so the Council does not bridge by the map as held.

My best reading, for JURISDICTIONS by CHANGE (profile data, K1505 (10)) and for me:
1. A counterparty may carry `ids: {office: {scheme, id}, body: {scheme, id}}` and `within: {label, kind, ids: {scheme, id}}`, each scheme one of the profile's `identifier_schemes`; an entry without them is answered by R50 as "could not be seeded", naming the missing identifier, and seeds nothing (never a name match).
2. `identifier_schemes` gain `legistar_body_id` (`entity_kinds: ["body"]`) and `legistar_office_record_id` (`entity_kinds: ["office"]`), with their id-spaces forms. A seat's office is one per `OfficeRecordId` (person × body × dates, the source's own key), `seat_on` to the body, the holder's `holds` to it with the record's start and end.
3. A Legistar body is "matched" when its marker-stripped, folded name (legistar-reader's `readBodyName`, then extraction's term fold) equals a profile body's fold, or when the body-variant map names its organisation and a counterparty's `within`/`body` carries that organisation key as `organisation` (a new optional counterparty field); the Council and committees then bridge by the map. Several `BodyId`s of one organisation are all held as identifiers of the one body entity.
4. `member_types: [{member_type, capacity, basis}]` under the Legistar vocabulary; a `MemberType` it does not map seeds the seat and the person, records no `holds` line, and the answer states the seat's holder as undetermined with why (no capacity is invented).
5. Seeding is its own administrator's act after boot (`officesSeed`, and `seatsSeed({captures, by})` over held captures), not inside setup's transaction; at setup R50 runs once after R13 when profiles are recorded (the boot's own call, machine-stamped `class:admin`, DEC-52).
6. `ASSISTANT_OFF`, `assistantset`/`assistantstate`/`disclosureshown`/`disclosureof` and `officesseed`/`seatsseed` as op names; the plane passes `assistantState` to `answers` (I do not gate `answers` directly; it is earlier in the order).
Which of 1–4 should I build against, and does JURISDICTIONS get the CHANGE?
