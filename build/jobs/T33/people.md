# people (T33)

**Status** · session_01RGGE4ZfFHwpKSDT9uQhM9P · depth 2 · WORKING · handled B2

## J1 · QUESTION

Readings I am building on now; answer only where you read it otherwise. Only (2) could change what I build.

1. **Unbuilt upstreams (events, lines, money, duties; entities' T33 parts).** As DUTIES and LINES read it: people takes each used module as an injected service (`peopleOf(ctx, deps)`, K61) and calls only what their requirements state (`lines.linesOf/structureAt`, `events.statementsOf/eventsFor/sequence`, `money.moneyOf`, `duties.dutiesOf`, `entities.readEntity/has/entitiesByAlias/identifiersOf/noSuchEntity/noEntity`). Tests run the real record-core, membership, civil-time, connection-grammar, jurisdictions and entities, and contract fakes for the unbuilt modules answering as their requirements say; I point the tests at each real module as it merges into `tranche/T33`, before COMPLETE where it has merged. plane wires the real ones.
2. **Identity-claim evidence and its dates (R1, R2, R26).** `evidence` is `{a: {captureSha, extent, date?}, b: {captureSha, extent, date?}, identifier?: {scheme, id}, line?: "LIN-…"}`: each end's cited record and the day it states. R2's "valid at both records' cited dates" reads those two dates (`identifier`: the scheme identifier held on both persons, `validAt` not `out` at either date; `corroborated_name`: the cited line on the persons valid at both). A claim's connection validity (R26) runs from the earlier to the later cited date, unstated where either is absent (so a testimony claim is always answered `undetermined`). The alternative (identity timeless, validity always unstated) would make every claim undetermined and the conformance battery's in/out checks unmeetable.
3. **Sight (R31).** A claim, a testimony fact or a check may name `project` (a project bundle id): it is then answered and counted only for a viewer `membership.inSight(project, viewer)` admits. A cited fact follows its capture's home bundle (`provenance.homeOf`). Member ties: their member and administrators; source links: their sight list only.
4. **Refusals.** No catalogue rows of my own: refusals are `{ok:false, reason, detail}`; shared conditions answer through their owners (`noSuchEntity`, `noEntity`, `notAnAdmin`, `listenerRefusal`). No C-family needed.
5. **M-P5.** No response budget is stated: I take `connection-grammar`'s `BOUNDS.time_budget_ms` (10,000 ms) as the person read's ceiling at 50,000 lines (fake lines at that volume until `lines` merges).
6. **M-P6 / R8.** The job's synthetic fixture: 2 same-name officials sharing a name fold with different identifiers, plus 1,000 others; gate ≤ 0.5% (K1504).
7. **Uses, final (stated again at COMPLETE):** record-grammar, jurisdictions (lawful demands, R12; schemes), civil-time, connection-grammar, record-core, membership, provenance, content, sources, entities, events, lines, money, duties. `promotion` dropped (no T33 requirement registers a step); `roster-reader` dropped (plane registers its reader through R19, K1505 (6)).
8. **Paths.** Code `bio-plane/src/people/`, tests `bio-plane/test/m/people/`.
