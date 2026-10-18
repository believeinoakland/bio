# people (T51)

**Status** · session_016nx6W8cHCnGj3NUy1ARzAe · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two questions; R40 and R41 are built and tested on my best readings (committed on my branch), and I carry on with the record meanwhile.

1. **people's `uses` lacks `setup-words`** (your file, `build/modules.json`). K3810/R13 have my tests assert keys with `hasWord`/`word` from `setup-words`; `checks/architecture.mjs` fails 2 files (`identity.test.mjs`, `reads.test.mjs`, now also `why.test.mjs`) with "imports setup-words, which people does not declare in uses". Best reading: add `setup-words` to people's uses (it is layer 1 and "uses nothing"). Until you do, I cannot reach 0 architecture failures. The module code itself imports nothing from it.

2. **R40's "hub answer (R26)" breaks connection-grammar's `neighbours` contract.** R40 says the hub answer's `why` is `{key: people.why.person_end_identity, vars: {hub}}` and an item's `undetermined.why` is a key too. But connection-grammar's `reads.mjs` (R6/R20) judges `hub.why` and `item.undetermined.why` by `filled()`, i.e. a non-empty STRING, and the registry then refuses people's answer `OWNER_NONCONFORMING` ("hub: a hub is answered {set_size, why}"; I reproduced it with a person with more than BOUNDS.hub claims). I built it as R40 states (keys). Best reading: connection-grammar's entry accepts `{key, vars}` for those two `why`s (its module's change, not mine). If instead the contract stays a string, tell me and I put the strings back at those two sites (hub, and a claim's `undetermined`).

## J2 · REPORT

Found in other modules while meeting R40 (I passed each reason on exactly as its owner answers it, never flattened):
1. **civil-time** (`validAt`, `undetermined(why)`, `values.mjs`) answers every `why` as English ("no end is stated", "no start is stated", "... overlaps the start ... at the precision held", zone and date refusals). Against R40's "a reason an owner answers is its own key and fills" it answers a sentence; its entry should key them. people passes it through, so a personAt item built on an open-ended `holds` line still shows civil-time's English in `undetermined.why`.
2. **lines** answers `valid: {undetermined: true, why: "cache stale"}` and `{state: "undetermined", why}` as English strings (`index.mjs` around 350-359, 599, 793).
3. **events** `sequence` answers `why` as `word(...)` English (`events.why.cited_orders_disagree`, `events.why.precision_held_settle`), not `{key, vars}`, so a pair statementsOf cannot order shows events' sentence.
4. **duties** `in_force.why`: people passes it through when given, else `people.why.whether_source_force`.
5. **screens-investigate** (`person.mjs`:90) reads `String(f.undetermined.why)`: `why` is now `{key, vars}` and (at the contract sites) a string beside `why_key`; its draw of `screen.person.facts.undetermined` as `{reason}` should take `word(key, vars)`. Also `people.mjs`:88 offers only the `both`, `people`, `organisations` choices; R41's `show` has six more values (`screen.people.show.*`).
6. Inherited, not mine: 32 failures in `notice-producers`, `op-declarations`, `affordances`, `case-authoring`, `retrieval/words`, `screens-investigate/{explore,person}` are identical on `tranche/T51` without my commit.
