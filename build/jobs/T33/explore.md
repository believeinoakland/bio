# explore (T33)

**Status** · session_019tmdRWuokxq2rwBpT9RPKW · depth 2 · COMPLETE · handled B4

## Completion

**Entries applied.** T33-37 (B2b.1; K1442, K1470, K1486, K1487) whole, on BOB's answers B2 (K1563) and B4 (K1580): a new module, code **`bio-plane/src/explore/`** (9 files, 719 lines), tests **`bio-plane/test/m/explore/`** (5 test files and `fixtures/owners.mjs`). Final **`uses`: civil-time, connection-grammar, observation-log, events, money** (the only imports; events and money are `exploreOf(host)`'s defaults for R13). The other owners (entities, lines, standards, progressions, duties, people, connections) are reached at run time through `connection-grammar`'s registry, never imported; `record-grammar` through `connection-grammar.isRecordId` (J1 (4)).
- `exploreOf(host, deps)` (K1563 (1)): `explore` (R1–R9), `presets`/`chain`/`flowsFrom`/`relationsOf`/`pathBetween` (R10), `overlaps` (R11), `rederive` (R12), `timelineOver` (R13), each passing `host` to every owner's `neighbours`; `deps` may give `registry`, `events`, `money`, `now`, `budget_ms` (lowered, never raised). `exploreOps(explore, url, body)`: arms `explore`, `explorepreset`, `exploreverify`, `exploretimeline`, reads only, the viewer from the query string only (R14).
- The walk: breadth-first, one node per owner call through `registry.neighbours`; each node is reached by its shortest paths, one path per step into it after the best path to its parent (paths are bounded by the steps read, never exponential); with `to`, the walk stops at the level that reaches it. Grade `chainGrade`, label `chainLabel` (a lead with its sentence), order `orderPaths` (with `sortBy`, the quantity the path's last step states in `quantities`; `UNKNOWN_QUANTITY` when no step states it). Bounds: fan-out per kind (the first 1,000, named), an owner's `truncated`, hubs named "too common to walk" and not expanded, 5,000 nodes, the time budget checked before every owner call (`exhausted`). A path through an undetermined step is `at_date: undetermined`. Absence (R8): level `meaning`, `LOOKED_ABSENT` only when the walk was complete, else `LOOKED_INDETERMINATE`, with how far it searched and each owner's optional `unread` (J1 (1)). Owners' refusals are listed in `owner_refusals` and make the walk incomplete.
- Presets, rules over the registry read on every call: `chain` lines' `line:part_of`, `line:reports_to`, `line:oversees`, `line:appoints`, `line:funds` and duties' `holds_power` (K1563 (8)); `flowsFrom` every money kind (today `money_flow`), payer to payee only, as of `period` when given; `relationsOf` events' `event_authorises`, `event_answers`, `event_amends`, `event_reverses`, `event_stated_cause`, `event_within`; `pathBetween` every kind, with `to`. The kind strings are the merged owners' own (`lines` R14, `events` R35).
- `overlaps`: one-step reach of both persons, the same kind to the same record; the two steps' shared span, judged three-valued at `at` or within `period` through `civil-time.bounds`/`compare`; the shared set counted from the owner's answer (held, not settled), a hub by its set size.
- `rederive`: the owner's read as of `as_of` (a day read in UTC), `derivedId` recomputed, the held item matched by kind, ends, method and `as_of`, else `matches: false` with the reason; `rests_on` gives the class of each input that is a connection at either end.
- `timelineOver`: the real `events.timeline` answered as it is (lanes `world` and `ours`); for each world event (dated or placed nowhere), the real `money.moneyOf({entity: EVT-…})`'s facts with payer, payee, source and citation (K1563 (5)).

**M-X1a** (`mx1a.test.mjs`; seeded; ~151,000 connections: 30,000 lines, 32,000 events with participants, a 5,000-employee employer, a fund paying 2,000 vendors). Bob's seven-hop chain donor → committee → councilmember → vote → award → contract → vendor ← fund, as of the year 2025, is found in 3.3 s of the 10 s budget (614 nodes, 4,327 owner calls, each one node). A dense walk stops at the 5,000-node bound in 4.0 s, naming the employer (5,000) and the fund (2,001) as hubs. With more than 1,000 council votes in the year, the member is a hub and the chain is not found (`LOOKED_INDETERMINATE`; N566). Most of the time is `civil-time`'s `offsetAt` (N565).

**Deferred.** None.

**Found in other modules** (J2, answered B3/K1566): civil-time `offsetAt` cost (N565); the hub bound against real council volumes (N566); wiring and the four ops (plane, control-plane, op-declarations STARTs). New here: `duties` is not merged, so `chain`'s `holds_power` is K1563 (8)'s name, not yet checked against duties' registration; if duties registers another string, `chain` misses it until this rule is changed. No generated artifact is stale: nothing imports explore yet.

**Tests and checks run** (on the branch after merging `tranche/T33` at K1580):
- `node --test bio-plane/test/m/explore/`: tests 24, pass 24, fail 0 (R13 and `real-owners.test.mjs` on the real entities, events, lines and money, through money's test world).
- `node --test bio-plane/test/m/connection-grammar/`: 26 pass, 0 fail (unchanged; run once, earlier).
- With `paths`, `tests` and the final `uses` set in a local, uncommitted `modules.json`: `format` 126 modules, 125 requirements files, 0 failures; `architecture explore` 15 product files, 50 relative imports, 0 failures; `coverage explore` 18 of 18 live ids named by a test, 0 failures; `ownership explore tranche/T33` 16 files changed, 0 failures.

Size (session_019tmdRWuokxq2rwBpT9RPKW): test runs 17, module lines 719

## J1 · QUESTION

Four points; I carry on with each best reading.

1. **R8, "held as a table, not read".** `connection-grammar`'s `neighbours` contract has no field for it. Best reading: an owner may add an optional `unread: [{what, why}]` to a `neighbours` answer (the registry's `answerFailures` already passes extra top-level fields); explore collects them per visited node and lists them with the owner's name. No owner is required to send it. If you want it in connection-grammar's contract, that is a requirement change for that module, not mine.

2. **R10, preset kind sets.** The registry holds `{kind, word, class}` per kind, no family, and the owners' kind strings are theirs. Best reading, as rules over (owner, kind), evaluated against the registry on each call so a later kind joins with no change here: `chain` = owner `lines` kinds `part_of`, `reports_to`, `oversees`, `appoints`, `funds`, plus owner `duties` kinds whose name contains `power`; `flowsFrom` = every kind owned by `money`; `relationsOf` = owner `events` kinds among its relation kinds (`authorises`, `answers`, `amends`, `reverses`, `stated_cause`, `within`); `pathBetween` = every registered kind. Please confirm duties' power kind name (or tell duties to register it as `power…`).

3. **R13, money facts concerning an event.** `money` R9's `moneyOf({entity, …})` answers facts "which concern it"; `concerns` names events. Best reading: explore calls `moneyOf({entity: <event id>, viewer})` for each event on the timeline and takes `from`/`to` of each fact. (Money's `neighbours` cannot carry these: a fact's edge is payer→payee, with the event at neither end.) If money provides a different read for facts by event, name it.

4. **Uses.** I import `isRecordId` from `connection-grammar` (built on `record-grammar.idPattern`) rather than `record-grammar` directly, so record-grammar need not be an edge. Final `uses` stated in COMPLETE.

## J2 · REPORT

EXPLORE #1, built and tested on B2/K1563 (23/23; format, architecture, coverage 18/18, ownership 15 files: 0 failures, with `paths` set locally only). Per K1563 (1) I hold COMPLETE until `events` and `money` merge and R13's test is re-pointed at them; tell me (CHANGE) when they have. Code `bio-plane/src/explore/`, tests `bio-plane/test/m/explore/`, final uses civil-time, connection-grammar, observation-log. Findings outside my module:

1. **civil-time, efficiency.** `offsetAt` (`zone.mjs:28`) calls `Intl.DateTimeFormat.formatToParts` on every call, about 0.13 ms per `validAt`. In M-X1a it is most of the walk's time, and every item is judged twice: by its owner and again by `connection-grammar`'s `answerFailures` (`reads.mjs`). An offset cache per zone (keyed by the hour, or by the zone's transitions) would cut this a lot. That is civil-time's to decide.
2. **M-X1a, for the hub bound (K1470).** Bob's seven-hop chain spans several dates, so it can only be walked as of a period (the year), not a day. Over a year, a councilmember who votes more than 1,000 times is a hub on `events`' kinds (the 1,000 bound counts every vote in the window), so the chain is cut there and the answer is `LOOKED_INDETERMINATE`. With 600 votes the chain is found in 3.3 s. Real council volumes decide which case holds; a hub bound per kind, or a narrower window, would change it. That is a question of the bound, not of this module.
3. **Wiring, not mine:** `plane` builds `exploreOf(host, {events: eventsOf(host), money: moneyOf(host)})` once those modules exist; `control-plane` and `op-declarations` route and declare the four ops `explore`, `explorepreset`, `exploreverify` and `exploretimeline` (reads, viewer stamped). No generated artifact is stale: nothing imports explore yet.
4. **connection-grammar (N560 already notes it):** `unread` is read as optional; no family on a kind, so the presets name kinds (R10).
