# explore (T33)

**Status** · session_019tmdRWuokxq2rwBpT9RPKW · depth 2 · WORKING · handled B3

## Completion

**Entries applied.** T33-37 (B2b.1; K1442, K1470, K1486, K1487) whole, on BOB's answers B2 / K1563: a new module, code `bio-plane/src/explore/` (9 files, 713 lines), tests `bio-plane/test/m/explore/` (4 test files and `fixtures/owners.mjs`). Final `uses`: **civil-time, connection-grammar, observation-log** (the only imports). The owners (entities, events, lines, standards, progressions, money, duties, people, connections) are reached at run time through `connection-grammar`'s registry, and `events`/`money` (R13) through `exploreOf(host, deps)`'s `deps`, which `plane` wires; none is an import edge. `record-grammar` is reached through `connection-grammar.isRecordId` (J1 (4), accepted).
- `exploreOf(host, deps)` (K1563 (1)): `explore` (R1–R9), `presets`/`chain`/`flowsFrom`/`relationsOf`/`pathBetween` (R10), `overlaps` (R11), `rederive` (R12), `timelineOver` (R13); `exploreOps(explore, url, body)` with arms `explore`, `explorepreset`, `exploreverify`, `exploretimeline`, viewer from the query string only (R14).
- The walk: breadth-first, one node per owner call through `registry.neighbours` with `viewer`, `scope` and `host` unchanged; each node is reached by its shortest paths, one path per step into it after the best path to its parent (so paths are bounded by the steps read, never exponential); `to` stops the walk at the level that reaches it. Grade `chainGrade`, label `chainLabel`, order `orderPaths` (with `sortBy`, the quantity the path's last step states in `quantities`). Bounds: fan-out per kind (first 1,000, named), an owner's `truncated`, hubs named "too common to walk" and not expanded, 5,000 nodes, the time budget checked before every owner call (`exhausted`). A path through an undetermined step is `at_date: undetermined`. Absence (R8): level `meaning`, `LOOKED_ABSENT` only when the walk was complete, else `LOOKED_INDETERMINATE`, with how far it searched and each owner's optional `unread` (J1 (1)).
- Presets as rules over the registry read on every call (J1 (2)): `chain` lines' five structure kinds and duties' `holds_power`; `flowsFrom` every money kind, payer to payee only, as of `period` when given; `relationsOf` events' six relation kinds; `pathBetween` every kind with `to`.
- `overlaps`: one-step reach of both persons, same kind to the same record, the two steps' shared span judged three-valued at `at` or within `period` through `civil-time.bounds`/`compare`; the shared set counted from the owner's answer (held, not settled), a hub by its set size.
- `rederive`: the owner's read as of `as_of` (a day read in UTC), `derivedId` recomputed, the held item found by kind, ends, method and `as_of`; `matches: false` with the reason otherwise; `rests_on` classes each input that is a connection at either end.

**M-X1a** (in `mx1a.test.mjs`; seeded, ~151,000 connections: 30,000 lines, 32,000 events with participants, a 5,000-employee employer, a fund paying 2,000 vendors): Bob's seven-hop chain donor → committee → councilmember → vote → award → contract → vendor ← fund, as of the year 2025, is found in 3.3 s of the 10 s budget (614 nodes visited, 4,327 owner calls, each one node). A dense walk stops at the 5,000-node bound in 4.0 s, inside the budget, naming the employer (5,000) and the fund (2,001) as hubs. With more than 1,000 council votes in the year, the councilmember is a hub on `events`' kinds: the chain is not found, the absence is `LOOKED_INDETERMINATE` (REPORT J2 (2)). Most of the time is `civil-time`'s `offsetAt` (REPORT J2 (1)), not the walk.

**Deferred.** None of the module's own work. Before COMPLETE (K1563 (1)): R13's test re-pointed at the real `events` and `money` once they merge (both upstream in the Roster).

**Found in other modules.** REPORT J2.

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
