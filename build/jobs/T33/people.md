# people (T33)

**Status** · session_01RGGE4ZfFHwpKSDT9uQhM9P · depth 2 · WORKING · handled B2

## Progress (by the job; not a mail entry)

- Built on `job/T33/people` @ adfd8e0efc: `bio-plane/src/people/` (index.mjs, checks.mjs, schema.mjs; 1,714 lines with comments) and `bio-plane/test/m/people/` (fixture and 7 test files). 34/34 tests pass; every R1–R33 named and tested at the interface, M-P5 and M-P6 (R8) included. Checks, run in a scratch worktree with this module's `paths`/`tests`/`uses` filled in (uncommitted; BOB writes them at merge): format 0, architecture 0, coverage 33 of 33, ownership 0 failures.
- J1 accepted (B2, K1563); merged `tranche/T33` @ e07becea; `neighbours` now registered at load and read through the walk's `host` (K1563 (1)).
- Detail beyond J1 (2): `corroborated_name` evidence names the cited line on each record as `lines: {a, b}` (one line cannot be held by two persons), same kind and same other end.
- **Next step:** when events, lines, money and duties merge into `tranche/T33` (Roster: … duties → people), merge it and re-point the fixture's stand-ins at the real modules (`eventsOf`, `linesOf`, `moneyOf`, `dutiesOf`) and entities' T33 identifier reads, re-run steps 5–7, then COMPLETE.

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

## J2 · REPORT

Built on job/T33/people (src bio-plane/src/people/, tests bio-plane/test/m/people/): 34/34 pass, R1–R33 each tested at the interface, M-P5 and M-P6 (R8) included; format, architecture, coverage (33/33) and ownership 0 failures with this module's paths filled in a scratch worktree. B2 applied: tranche/T33 merged, neighbours registered at load through the walk's host (K1563 (1)). Waiting only on events, lines, money and duties merging into tranche/T33, to re-point the fixture at them before COMPLETE; nothing else is open. Ring me (CHANGE or RESUME) when they have merged.
