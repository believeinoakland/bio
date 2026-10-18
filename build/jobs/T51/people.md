# people (T51)

**Status** · session_016nx6W8cHCnGj3NUy1ARzAe · depth 2 · COMPLETE · handled B2

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

## J3 · COMPLETE

**People (T51-38): R40 and R41 met; every test of the module green; checks clean for people.**

**Entries applied**
- R40: every undetermined `why` is `{key, vars}`. Sites: `personAt` items (`undetermined.why`, also posts, facts, duties and the `undetermined` lists of staffing/credentials/interests that share `#judge`), the identity cluster (`identityOf` and each read's `cluster.why`: `people.identity_cluster_cache`, `people.identity_cluster_cache_differs`, `people.why.claim_joins_two` with `{apart}` the claim ids), a pair `statementsOf` cannot order (`people.why.record_settle_order`), `people.why.validity_stated`, `people.why.owner_settle_validity`, `people.why.whether_source_force`, `lines.why.stated_current_through` (`{why, day}`). A reason an owner answers is passed on exactly. At connection-grammar's two string-judged sites (the hub answer and a hop's `undetermined`) `why` is the sentence `word(key, vars)` reads and `why_key` stands beside it (B2, K3865).
- R41: `peopleDirectory`'s `show` gains `offices`, `ordinances`, `contracts`, `funds` (fund and program), `sources`, `everything` (every kind but proceeding); `both` stays the default; an office row answers `holders` (at most 5 `{entity, label}`, persons whose `holds` line civil-time does not rule out today, by entity id); the `office` filter still keeps persons only; `today` for another kind is its note as R38 states.

**Tests** (named R40, R41): new `why.test.mjs` (7), `kinds.test.mjs` (3); converted for K3810 the existing assertions that copied a sentence (identity, reads, facts: they now assert the key or the owner's own answer); `directory.test.mjs` no longer calls `offices` malformed (it is a value now; `parcels` is the control).
- `node --test test/m/people/*.test.mjs`: tests 66, pass 66, fail 0.
- Users of people (retrieval, calculations, strength, answers, corpus-export, ratification, case-disclosures, case-authoring, consequences, scheduler, affordances, notice-producers, op-declarations, control-plane, plane, screens-investigate, explore): 2599 tests, 32 fail; the same 32 fail on `tranche/T51` without my commit (inherited).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage for people 41 of 41 (the 21 coverage failures are other modules'); channels 0.
- `node checks/ownership.mjs /home/user/bio people tranche/T51 job/T51/people`: 8 files, 0 failures.

**Deferred**: nothing. One judgement recorded: `people.why.owner_settle_validity` also answers when civil-time throws or answers no reason (no key exists for a bare "undetermined"); `#validity`'s refusal details for a bad bound stay English in the refusal `detail` (a refusal is not an undetermined answer; the keys `people.why.precision`, `bound_gives_value`, `event_bound_names`, `bound_date_value` are held for a screen, not emitted).

**Found in other modules**: see the REPORT (J2): civil-time, lines and events answer English reasons; screens-investigate reads `String(why)` and offers three `show` values.

Size (session_016nx6W8cHCnGj3NUy1ARzAe): test runs 14, module lines 2238
