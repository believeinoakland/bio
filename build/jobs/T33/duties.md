# duties (T33)

**Status** · session_019JqprcbLJwV4M5Mw1HNwHn · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings I am building on; each is my best reading and I carry on with it unless you answer otherwise.

1. **Check family.** duties' refusals carry catalogue rows (entities' shape). I need a C-family; I take **C-133** (the next free after record-core's C-132) unless you assign another (other new L5 modules may ask the same). The rows are named `awaiting stamp` in my record (row-census is already an accepted red, K1542).
2. **Response-status vocabulary (R1 `UNKNOWN_REPORTED_STATUS`, R4; my Suggestions' open (3)).** jurisdictions T33-2 did not add one (its Suggestions leave it BOB's). Reading: duties reads the active view's `response_statuses` (`[{status, label, citation, basis}]`); with none held, a `reported_status` entry is refused `UNKNOWN_REPORTED_STATUS`, its detail saying the profile holds no response vocabulary (never a default). Tests use a fictional view. Adding the key to jurisdictions (and validate/combine) is a later jurisdictions entry: I will REPORT it.
3. **Level searched (R11; open (4)).** The derivation names the level `meaning` (observation-log's level vocabulary): matches are read from held events and registered evidence. No observation row is written (reads write nothing).
4. **Uses.** `progressions` dropped (open (6)); `promotion` not needed. Final uses (stated again in COMPLETE): record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, provenance, content, entities, events, lines, local-facts, standards, money, observation-log.
5. **Unbuilt upstreams (events, lines, money; entities' and standards' T33 parts).** duties takes each used module as an injected service (`dutiesOf(host, deps)`, K61) and calls only what their requirements state (`events.readEvent/eventsFor`, `lines.linesOf`, `money.readFact/moneyOf`, `standards.standardRead/inForceAt`, `entities.readEntity/noSuchEntity`). Tests run the real record-core, membership, civil-time, connection-grammar and jurisdictions, and fakes of the unbuilt modules that answer as their requirements say. plane wires the real ones (T33-90).
6. **R12.** Matching is a member's act only in T33; no machine match proposals (open (1)).
7. **R13 `recordTransitions`.** Its transitions are stamped `class:scheduler` (DEC-52) unless the caller passes its own stamp.
8. **R5.** A profile deadline proposes a duty of the office the rule's counterparty names: trigger `{kind: "source", source: <module>}` (R16), time `{basis: "rule", rule, applies_to}` evaluated by civil-time from the source item's date.
9. **Op names (T33-88's).** Provisional: `dutypropose`, `dutyadopt`, `dutydeclare`, `dutyrevise`, `dutywithdraw`, `duty`, `dutiesof`, `dutyoccurrences`, `dutymatch`, `dutytransition`, `dutytransitions`, `powersof`, `dutysetagainst`.
10. **Paths.** Code `bio-plane/src/duties/`, tests `bio-plane/test/m/duties/` (beside entities, local-facts).
