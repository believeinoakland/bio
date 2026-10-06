# jurisdictions (T34)

**Status** · session_01YTvAT51C3xVL8xjXQASm1A · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied (T34-2; N561, N569, N574, N613; K1563 (8), K1574, K1592, K1682, K1690, K1729).**
- R3: spaces `body`, `office` and (K1729) `institution` known and judged as every space.
- R58: `vocabulary.vote_values` `[{value, label, citation, basis}]` and `response_statuses` `[{status, label, citation, basis}]`: data keys, not patterns; `value`/`status` `^[a-z][a-z0-9_]*$`, none twice, label and citation non-empty, else VALUE_INVALID; unioned in combine; no default list anywhere.
- R59: a counterparty's `ids` `{office?, body?}`, `within` `{label, kind, ids: [...]}` and `organisation`; each identifier `{scheme, id}` with a scheme of the profile whose `entity_kinds` include what it identifies and a non-empty id, else SCHEME_INVALID naming the field; `organisation` a key the body-variant map names, other faults VALUE_INVALID; each one value per role and body in combine.
- R60 (with K1729): `vocabulary.member_types` `[{member_type, capacity, organisation?, basis}]`; a type once per body-variant key and once for all bodies; `capacity` `elected` or `appointed`; one value per type and body in combine.
- R61: the first profile's `body` and `office` spaces (numeric forms), schemes `legistar_body_id` and `legistar_office_record_id` beside `legistar_person_id`, all issued by `oakland.legistar`; the Controller ("Finance Department", BodyId 171), City Council (BodyId 1, `organisation: city_council`) and City Auditor ("Office Of The City Auditor", BodyId 16), each `within` the City of Oakland (an `institution`, no identifier measured); `member_types` `Member` and `Chair` on `city_council`, `elected` (Charter §200). Every Legistar fact is tested against legistar-reader's captured rows (2026-10-05): every BodyId, OfficeRecordId and PersonId reads in its scheme's form; the two renamed bodies are named as the capture names them; every holder on a `city_council` body sits on BodyId 1. No institution scheme in the first profile (K1729; N632).
- R62: the test profile holds both vocabulary keys, `member_types` (one entry for one body), a counterparty (Selectboard) with `ids`, `within` and `organisation`, and schemes `ellery_body`, `ellery_seat`, `port_ellery_registry` in the `body`, `office` and `institution` spaces.

**Not held, on purpose.** No `vote_values` in the first profile: the two captured roll calls show only Aye and Excused, so a partial list would make events refuse a value it does not list (R58: none given, none supplied). No `ids.office` on any counterparty: no measured office record is a counterparty's.

**Deferred.** None.

**Found in other modules (J2, to BOB).** Red from this data, each a test pinning the old profiles: entities `t33.test.mjs:102` R43 (the test profile's scheme list); events `participants.test.mjs:9` R11 (its default view now carries vote values), `follow.test.mjs:33` R22 and `:189` R41, and following `body.test.mjs:71` R2 (the fixture's own body scheme in space `object` now follows the test profile's `ellery_body`). Stale generated artifacts: `newgroup/dist/newgroup.bundled.mjs` (installer's `newgroup-bundle-fresh` (C)) and the plane bundle. Not this job's: scheduler R12 (K1708), reading-pipeline `tier2-recorded.json` (red on `tranche/T34` too), and calculations R4/R19, which fail intermittently on the opaque `CALC` ids (T34-1).

**Tests and checks run** (on the commit below):
- `node --test jurisdictions/test/`: tests 91, pass 91, fail 0.
- Every user of jurisdictions (38 modules from `modules.json`): all green except the reds named above.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture jurisdictions`: 8 product files, 11 relative imports; 0 failures. `coverage jurisdictions`: 62 of 62 live ids named by a test; 0 failures. `ownership jurisdictions tranche/T34`: 7 files; 0 failures.

Size (session_01YTvAT51C3xVL8xjXQASm1A): test runs 10, module lines 5426

## J1 · QUESTION

Two readings to rule (BOB's, P17). I build on both meanwhile.

(1) N574, the institution scheme's space. No R3 space fits an institution. Proposal: R3 gains a twelfth space, `institution` ("an institution's number in a registry, one form per institution scheme", referent `reading`), as `person` holds one form per person scheme. id-spaces takes it at N-next (unknown spaces are ignored by `idspaces.mjs` today, so nothing reddens). Test profile: scheme `port_ellery_registry` (`entity_kinds: ["institution"]`, space `institution`, basis TEST). First profile: the repository holds no measurement of any institution registry, so R61's "absent, never invented" and "each held profile holds one" conflict for Oakland. Best reading: you rule one scheme and its form, and the ruling (K<n>) is its basis, as R2 allows. Proposed: `ror_id`, the Research Organization Registry ID (`entity_kinds: ["institution"]`, form `ror`: `^0[a-hj-km-np-tv-z0-9]{6}\d{2}$` after stripping an `https://ror.org/` prefix; no system, ROR is no system of this profile). Until you answer, the first profile holds no institution scheme and its R61 test for that part stays red.

(2) R60/R61, Oakland's `member_types`. Measured on legistar-reader's captured `officerecords` (2026-10-05, 1,262 rows): MemberType `Member` 1,135, `Chair` 126, null 1. Neither maps to one capacity: on the same types sit councilmembers (elected, Charter §200) and others who are not: Port commissioners on the City/Port Liaison Committee (BodyId 272), OUSD board members on the Education Partnership Committee (25, 258, 265), county supervisors (252), and non-councilmembers on the Council's own committees (e.g. BodyId 9, 10, 12). R60 maps a type to a capacity with no body. Best reading: the first profile holds no `member_types` entry (a type it does not list maps to no capacity, undetermined, R27), and the measurement goes in my record; instance-setup's seats stay undetermined. If you want seats seeded, R60 would need a body qualifier (e.g. an optional `organisation`, the body-variant key: `Member` on `city_council` is `elected`, Charter §200); that is a requirement change, yours to word. The test profile supplies `member_types` (R62).

## J2 · REPORT

Work built and pushed on `job/T34/jurisdictions` on my readings of J1 (90/91 green; the one red is R61's Oakland institution scheme, waiting on J1 (1)). Running every user's tests against it shows reds in other modules that R61/R62's data causes. None is a fault in those modules' code; each test pins the profiles' old contents:

1. **entities** `t33.test.mjs:102` (R43): asserts UNKNOWN_SCHEME's `schemes` equal the test profile's old list `["ellery_person", "marlow_bar"]`. The test profile now also holds `ellery_body`, `ellery_seat`, `marlow_registry` (R62).
2. **events** `participants.test.mjs:9` (R11): its "no vote values in the view" case uses the default `testView()`, which now carries the test profile's `vocabulary.vote_values` (R62). Its T34-17 job (N561, user side) is where this changes.
3. **events** `follow.test.mjs:33` (R22) and `:189` (R41), and **following** `body.test.mjs:71` (R2): the fixture's `testView({legistar: true})` adds its own `legistar_body` scheme (entity_kinds body, space `object`), but the test profile now holds a body scheme of its own (`ellery_body`, space `body`) ahead of it, so Legistar BodyIds no longer resolve through the first body scheme. They should switch to the real `body` space and schemes (N569), the events T34-17 work.
4. **Generated artifacts made stale** (mechanics §14): `newgroup/dist/newgroup.bundled.mjs` (installer's `newgroup-bundle-fresh` (C) fails: the bundle includes jurisdictions), and presumably the plane bundle. Yours to regenerate at the close.
5. Not mine: scheduler R12 (inherited, K1708) and reading-pipeline's `tier2-recorded.json` (red on `tranche/T34` too).

Also, for **action-clocks**: R61 renames two counterparty bodies to Legistar's forms ("Finance Department", "Office Of The City Auditor"; K1690). action-clocks' `calendar.test.mjs:81–95` still writes the old names inside its own fixtures and stays green, but any data or test keyed on the old body names now finds no office.

Oakland holds no `vote_values` either: the two captured roll calls show only Aye and Excused, not the whole set. A partial list would make events refuse an unlisted value, so none is held (R58: a profile that gives none supplies none).

## J3 · COMPLETE

T34-2 applied with K1729 (R3, R58–R62). jurisdictions 91/91; format, architecture, coverage (62/62), ownership: 0 failures. Branch job/T34/jurisdictions @ 813268441c. The other modules' reds this data causes are J2's (entities R43; events R11, R22, R41; following R2; stale newgroup and plane bundles); the record's Completion has the details.
