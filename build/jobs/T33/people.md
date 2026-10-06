# people (T33)

**Status** · session_01HWob318ogqK3NFAgoHW3po · depth 2 · WORKING · handled B3

## Progress (by the job; not a mail entry)

- Built on `job/T33/people` @ adfd8e0efc: `bio-plane/src/people/` (index.mjs, checks.mjs, schema.mjs; 1,714 lines with comments) and `bio-plane/test/m/people/` (fixture and 7 test files). 34/34 tests pass; every R1–R33 named and tested at the interface, M-P5 and M-P6 (R8) included. Checks, run in a scratch worktree with this module's `paths`/`tests`/`uses` filled in (uncommitted; BOB writes them at merge): format 0, architecture 0, coverage 33 of 33, ownership 0 failures.
- J1 accepted (B2, K1563); merged `tranche/T33` @ e07becea; `neighbours` now registered at load and read through the walk's `host` (K1563 (1)).
- Detail beyond J1 (2): `corroborated_name` evidence names the cited line on each record as `lines: {a, b}` (one line cannot be held by two persons), same kind and same other end.
- **B3 (CHANGE, K1585): done by PEOPLE #2** (session_01HWob318ogqK3NFAgoHW3po), on `tranche/T33` merged again @ 8f8c1d78fa. See Completion below.

## Completion (PEOPLE #2)

**Entries applied.** T33-36 whole (B1b.1, 2b, 3): R1–R33, M-P5 and M-P6 in the job, as J2 reported; then B3:
- `peopleOf(ctx, deps)` defaults every used module to the real one on the same host, reached on first use (duties' pattern; a dep given as a function is a thunk): `record`, `membership`, `entities`, `provenance`, `content`, `sources`, `events`, `lines`, `money`, `duties`.
- Real answer shapes: content's `checkContentExtent` (a module function, with `canonicalExtent`) over `content.contentContextFor`; lines' `valid: {undetermined, why}` (stale cache, lines R7) answered undetermined with its owner's reason, and lines R21's `current_through` honoured (in on or before the day, undetermined after it) in `personAt`, `credentialsOf`, `interestsOf`, `staffingAt` and the identity grade; events' `placed_nowhere` read beside `events`/`statements` (reads and checks), `sequence`'s `{answer}`; money's `facts` with `{entity, fund, as_written}` parties, each answered with its citation; duties' `dutiesOf`: a withdrawn duty or one `not_in_force` at the date binds nothing, an unsettled in-force answer is listed undetermined with its reason (R14); entities R44's `{undetermined, candidates}` takes every candidate (R7); sources R9's `rungOf` asked as the linking member (a machine viewer is answered `NO_SUCH_SOURCE`).
- R2 tightened: an identifier's stated validity and a corroborating line must be `in` at the record's date; undetermined earns nothing (it was only `out` that failed).
- Tests rebuilt on the real modules (`test/m/people/fixture.mjs` over duties' world: real record-core, membership, promotion, provenance, content, entities, events, lines, money, duties, standards). `sources` stays a stand-in (layer 3; its sources are knockers' acts). M-P5 seeds 50,000 lines by cloning one recorded `holds` and one `part_of` row (with their bound cache) in SQL. One test added: the default wiring, current-through and a stale cache through `personAt`.

**Deferred.** None.

**Found in other modules** (in J4 to BOB):
1. `lines`: a line holds no title as written, so people R15's "title as written" in `careerOf` is always `null`. Against people R15 / lines Terms (a `holds` line's `{… capacity?}` has no title field).
2. Profile data (`jurisdictions`): no held profile has an identifier scheme for an institution (test-port-ellery's and oakland-alameda's schemes identify persons only), so R15's issuer identifier of a `credentialed_by` line cannot be held through entities R43 today. The R15 test lays entities' `identifiersOf` over the real registry for that one issuer.
3. `build/modules.json` and people's Uses: `promotion` and `roster-reader` are listed; the code uses neither (J1 (7)). Final uses below.

**Tests and checks** (run on `job/T33/people` @ 9957f5f6be; checks in a scratch worktree with people's `paths`/`tests`/`uses` filled in `modules.json`, uncommitted):
- `node --test bio-plane/test/m/people/`: tests 35, pass 35, fail 0 (about 8 s; M-P5 about 0.6 s, budget 10,000 ms; M-P6 0 false merges among the agreeing candidates).
- `format`: 126 modules, 125 requirements files; 0 failures.
- `architecture`: 11 product files, 39 relative imports; 0 failures.
- `coverage`: 33 of 33 live requirement ids named by a test; 0 failures.
- `ownership` (against `origin/tranche/T33`): 12 files changed by people; 0 failures.

**For the merge.** paths `bio-plane/src/people/`; tests `bio-plane/test/m/people/`; uses `record-grammar`, `jurisdictions`, `civil-time`, `connection-grammar`, `record-core`, `membership`, `provenance`, `content`, `sources`, `entities`, `events`, `lines`, `money`, `duties`.

Size (session_01HWob318ogqK3NFAgoHW3po): test runs 5, module lines 1788

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

## J3 · BLOCKED

Cause: context (497k of 1M used, past half the window). B3 started: tranche/T33 merged (373c705428); nothing re-pointed yet. The next step is written in my record's Progress section (wire real defaults in peopleOf, adapt to the real answer shapes listed there, rebuild the fixture on the real modules as duties' fixture does, re-run, COMPLETE). Please restart PEOPLE.
