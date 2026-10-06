# lines (T33)

**Status** · session_01UxA8Yv7kHqsFpTvQSvpR4k · depth 2 · COMPLETE · handled B4


## Completion

**Entries applied.** T33-27 (K1441, K1443, K1453, K1455, K1470) whole, on J1's readings as B2 (K1563) accepted them, then re-pointed at the real modules after B3 (K1574):
- `bio-plane/src/lines/`: `index.mjs` (the acts, reads, bound cache, sight, store gate, owner, ops map), `vocab.mjs` (the closed kinds, capacities, roles and members' words), `schema.mjs` (`lines`, `line_bound_cache`, `line_withdrawals`).
- Every requirement R1–R20 met and tested at the interface. Ops `linerecord`, `linewithdraw`, `line`, `linesof`, `structureat`, `holderat`, `partiesof`, `proceedinglinks`.
- K1563 (1): the factory is `linesOf(host)`, wired by default to that host's real `content`, `entities` and `events`. The owner is registered at load into the default registry; `neighbours` reads the passed `host`'s instance, else the isolate's one, else `OWNER_HOST_AMBIGUOUS`.
- Tests run on the real `entities` and `events` (stand-ins removed); `extraction` is reached only through `content`, so the fixture imports nothing outside the uses.

**For `modules.json` (BOB writes at merge).** `paths` `bio-plane/src/lines/`; `tests` `bio-plane/test/m/lines/`; `uses` record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, provenance, content, entities, events (promotion dropped, content added; J1 (2)).

**Choices made in the job (BOB's to record).**
- Refusals the requirements do not list: `HOLDER_NOT_A_PERSON` (a `holds` line's `from` must be a person, R12), `NO_BY` (an act with no stamped author), `BAD_DIRECTION` (`linesOf`), and the store gate's `LINE_HOLDS_NO_AMOUNT` and `LINE_NO_HYPOTHESIS` (R18).
- An event edge resolves to the event's own date-time `{value, precision, zone}` (a `from` reads from its first instant, a `to` through its last; never a midnight). An event known only "on or before" an instant (events' upper bound) gives no start and that instant as its end. A `when` with no zone resolves nothing.
- `at` given as a day is read in the line's own zone.

**Deferred, with why.**
- The upper-bound edge is exercised only through code, not end to end: building an upper-bound event needs a Legistar posting row through `followedImport`, whose schemes wait on N569.
- K1505 (10)'s `current_through` (an open holder line read as current): R1–R20 hold no such field, so an open-ended `holds` line stays undetermined after its start (tested). A requirement would be needed to add it.
- M-P2's staleness rule for register seats: label only (R5; J1 (7)).

**Found in other modules.**
- `events`' owner answers an unknown host with `OWNER_HOST_UNKNOWN`; K1563 (1) names only `OWNER_HOST_AMBIGUOUS`. `lines` answers `OWNER_HOST_AMBIGUOUS` for both. One code across owners would let `explore` read one refusal.
- The test profile names schemes for persons only; the fixture adds a numeric `test_org` scheme for offices, bodies and institutions as test data (R4, R5), as events' fixture does for Legistar (N569's kind of gap).
- No generated artifact is staled: `lines` is in no bundle's inputs.

**Tests and checks.**
- `node --test bio-plane/test/m/lines/*.test.mjs`: tests 26, pass 26, fail 0.
- Upstreams after the load-time registration: `events`, `entities`, `connection-grammar` tests: pass 152, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `checks/architecture.mjs lines`: 9 product files, 40 relative imports; 0 failures.
- `checks/coverage.mjs lines`: 20 of 20 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs lines tranche/T33`: 10 files; 0 failures.
- architecture and coverage read `modules.json`: run with the `paths`, `tests` and `uses` above applied locally and the file restored (they are empty until BOB writes them).

Size (session_01UxA8Yv7kHqsFpTvQSvpR4k): test runs 16, module lines 878

## Completion after B4 (R21, K1577)

- **R21 met:** `recordCurrentThrough({lineId, day, basis, by})` (op `linecurrentthrough`) holds a member's or a source's own "current as of" statement, with its citation and day, in `line_current_through` (declared explicitly: stored, sight `source`, export `yes`). It takes the same basis forms as a line; the machine may record one only from a system rule (R4). It refuses `NO_SUCH_LINE`, `LINE_WITHDRAWN`, `NOT_A_HOLDS_LINE`, `END_STATED` (a line with a stated end), `BAD_DATE`, the basis refusals, `MACHINE_NEEDS_IDENTIFIERS` and `NO_BY`.
- **How it reads:** an open-ended `holds` line is `in` at a date no later than the latest statement the viewer may see, and `undetermined` after it, never `out`. It is `out` only before its start.
  - `holderAt` and `structureAt` count it so; `neighbours` answers it in with `valid.to` the stated day.
  - `readLine` shows `current_through` with the superseded ones, each kept; a later statement supersedes, nothing is erased.
  - A statement inside a hidden project counts only for those who may see it.
- **Tests and checks:**
  - lines: 29 tests, 29 pass (3 new, naming R21).
  - events and local-facts: 66 pass, 0 fail.
  - format: 0 failures. architecture: 0 failures. coverage: 21 of 21. ownership: 5 files, 0 failures. The `modules.json` row as BOB set it.

Size (session_01UxA8Yv7kHqsFpTvQSvpR4k): test runs 19, module lines 943

## J1 · QUESTION

Seven readings; I am building on each now. Only (1) and (3) could change what I build.

1. **Party roles.** Terms say `party_to` takes a role from the profile's party-role vocabulary (`jurisdictions`); K1505 (10) says party roles are `lines`' closed kinds, and `jurisdictions` holds no such key. Reading: a closed list in `lines`: `plaintiff`, `defendant`, `petitioner`, `respondent`, `appellant`, `appellee`, `cross_complainant`, `cross_defendant`, `intervenor`, `real_party_in_interest`, `amicus`, `applicant`, `protestant`, `complainant`, `interested_party`, `other`. `jurisdictions` stays a use only for the default zone (R3).
2. **Uses.** `content` added: R1's passage refusals (`EXTENT_NOT_IN_CAPTURE`, as `events` R1) need `canonicalExtent`, `checkContentExtent`, `contentContextFor`. `promotion` dropped: no T33 requirement registers a step (EXTRACT proposals are T33-D3). Final uses: record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, provenance, content, entities, events.
3. **Upstreams not yet built.** `entities`' T33 parts (`proceeding`, `identifiersOf`/`entityByIdentifier`) and all of `events` are being built beside me. Reading: `lines` takes `entities` and `events` as injected services coded to their requirements. My fixture uses the real `entities` for what it already serves (`has`, `readEntity`, `resolutionsFor`, `noSuchEntity`) and a contract stand-in for the T33-only parts and for `events` (R15 `onWhenChanged` with `{eventId, before, after}`, R26 `readEvent().when` as `{start, end, precision, zone}`). When each merges into `tranche/T33`, I merge and point the fixture at the real module before COMPLETE, unless you say otherwise.
4. **Basis shapes and grades.** A system rule is `{rule, source, ids?: {from: {scheme, id}, to: {scheme, id}}, system?, recorded_at?}`, where `source` is a capture sha (a register row) or `{profile, entry}`. Assertion: a capture's `provenance.captureGrade`; a profile entry `C` (curated, no capture behind it). Ends: `A` when `ids` resolve through `entities.entityByIdentifier` to the end; a passage end gets the strongest resolution of that entity in the cited capture, or `D` when it is not resolved there (the member's own link); testimony `D`.
5. **Sight (R19).** A testimony basis may name `project` (a project bundle) and is then fenced to it. A line citing a capture follows that capture's home bundle. Everything else is group-wide.
6. **R18 "no second holderAt".** Tested at the export surface: every `bio-plane/src/*/index.mjs` is imported, and none but `lines` exports `holderAt`.
7. **M-P2 staleness.** The plan entry says "with a staleness rule"; R5 and Suggestions Open (1) say label only. I build R5's label only.

## J2 · REPORT

B2 applied (merged tranche/T33 @ 9bc95fbf27; K1563 (1): owner registered at load, neighbours by host, else the one instance, else OWNER_HOST_AMBIGUOUS). lines is built and tested on stand-ins: 25/25 pass; format, architecture, coverage 20/20 and ownership clean with paths bio-plane/src/lines/, tests bio-plane/test/m/lines/ and the uses of J1 (2) applied locally. What is left is re-pointing the fixture at the real entities and events once each merges into tranche/T33; ring me then (a CHANGE or RESUME), and I re-run steps 5–6 and post COMPLETE.

## J3 · COMPLETE

T33-27 complete; re-pointed at the real entities and events (B3, K1574), stand-ins removed. 26/26 tests on the real modules; events, entities and connection-grammar 152/152 after lines' load-time registration. Checks: format 0, architecture 0, coverage 20/20, ownership 0 (with the modules.json row below applied locally). For modules.json: paths bio-plane/src/lines/; tests bio-plane/test/m/lines/; uses record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, provenance, content, entities, events. The record's Completion section lists the refusals added (HOLDER_NOT_A_PERSON, NO_BY, BAD_DIRECTION, LINE_HOLDS_NO_AMOUNT, LINE_NO_HYPOTHESIS), what is deferred (the upper-bound edge end to end, current_through, M-P2's staleness rule), and one finding: events answers an unknown host OWNER_HOST_UNKNOWN where K1563 (1) names OWNER_HOST_AMBIGUOUS.
