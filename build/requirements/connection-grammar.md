# connection-grammar — requirements

**Status** · DRAFT by a requirements worker for BOB #114, 2026-10-05, on `tranche/T32`, before T33 opens (§5.9), for BOB's review. New module (K1469, K1470; scope §2), layer 1 directly after `calc-grammar`. Plan entry T33-5 (B1a.1; the owner registry by option (ii), entries B §(b)). Every id is not yet met.

**Size (P6).** About 400–700 lines (entries B §(c)).

## Public

### Purpose

The one shape every relationship the record holds is presented in, the registry of who owns each kind of relationship and what members call it, and the bounds and rules of walking them. Every owner at any layer registers its kinds and its `neighbours` read here, so `explore` walks one registry. It holds no relationship and walks nothing itself.

### Provides

**The shape.** A *connection* is `{id, from, to, kind, owner, valid: {from, to, precision, zone}, evidence, grade: {assertion, ends: [from_grade, to_grade]}, derived}`. `from` and `to` are record ids of `record-grammar`'s id grammar. `valid` is `civil-time`'s validity value. Grades are letters of `record-grammar`'s `BASIS_GRADES`.

**checkConnection(c) → `{ok}` or `{ok: false, errors}`**
- **R1** Accepts a connection only when every field above is present and well formed, `kind` is registered to `owner` (R4), and: an `evidentiary` kind carries `evidence` naming at least one cited source; a `derived` kind carries `derived: {method, inputs}` and an `id` equal to `derivedId` (R11); a `declared` kind carries the label "declared, not evidenced" and `grade.assertion` the lowest grade; a `hunch` kind carries the label `hunch` and no grade. Each error names the field. Never throws. *(not yet met: T33-5)*

**registerOwner({owner, kinds, neighbours})**. `kinds` is a list of `{kind, word, class}`; `neighbours` is the owner's read (R6).
- **R2** Registers an owner once. `class` is one of `evidentiary`, `derived`, `declared`, `hunch`. `word` is the members' word for the kind (K1486), non-empty. Refused, nothing registered: `OWNER_DUPLICATE` (the owner is registered), `KIND_TAKEN` (a kind another owner holds, naming it), `CLASS_UNKNOWN`, `WORD_MISSING`, `NEIGHBOURS_MISSING`. *(not yet met: T33-5)*
- **R3** A `word` containing "knows", "network", "conflict", "suspicious" or "most connected" (any case) is refused `WORD_FORBIDDEN` (K1486). *(not yet met: T33-5)*

**owners() → `[{owner, kinds}]`; kindOf(kind) → `{owner, word, class}` or `null`**
- **R4** `owners` lists every registered owner and its kinds, in registration order; `kindOf` answers the registered entry for a kind, or `null` for one no owner holds. Neither throws. *(not yet met: T33-5)*
- **R5** The registry is per instance of the registry (`createRegistry()`), plus one default the plane wires; registering in one never changes another, so tests run in isolation. *(not yet met: T33-5)*

**The `neighbours` contract** an owner registers: `neighbours({node, kinds, at, page, viewer, scope}) → {items, next?, truncated?, hub?}`. `viewer` is the member reading; `scope` is the working inquiry the walk runs in, or `null`. A caller of the registry passes both to every owner unchanged.
- **R6** `items` are connections in R1's shape, of the owner's own kinds within `kinds`, with `node` at one end; each is evaluated at `at` by `civil-time.validAt`, and one `out` at `at` is not returned, one `undetermined` is returned marked so. At most `BOUNDS.fanout` items per page; `next` continues; a node whose set exceeds `BOUNDS.hub` is answered `hub: {set_size, why}` with no items, never a partial set shown as whole. The read writes nothing and records no one's reading (D68). *(not yet met: T33-5)*
- **R7** Sight: an item is returned only when `viewer` may see it under the owner's own visibility (K1489: a hidden project's testimony, identity claims, interest checks and hypotheses fenced; member ties and the source↔person link at their own narrowest visibility); an item `viewer` may not see is neither returned nor counted in `hub.set_size`, `truncated` or paging, so its existence does not show. A `viewer` absent is refused `VIEWER_MISSING`, never read as an administrator or as public. *(not yet met: T33-5)*
- **R8** Scope: a `hunch` item is returned only when `scope` names the working inquiry that holds it; with `scope` `null` no hunch item is returned. Items of other classes do not depend on `scope` (K1467, K1487). *(not yet met: T33-5)*

**ownerConformance({owner, neighbours, kinds, fixture}) → `{ok, failures: [{check, why}]}`**. The fixture names two viewers (one who may see a fenced item, one who may not) and, for an owner of hunch kinds, a working inquiry.
- **R9** The battery each owner runs in its own job (B §(b) option (ii)): over the owner's fixture it checks R1's shape on every item, kinds limited to the owner's, the `at` rule of R6 (one connection in, one out, one undetermined), R7's sight (the fenced item returned to one viewer, absent and uncounted for the other, a missing viewer refused), R8's scope (a hunch item only within its inquiry), paging stable and complete (pages joined equal the unpaged set), the fan-out and hub rules, `derivedId` on every derived item, the `declared` and `hunch` labels, and that two identical calls give identical answers. *(not yet met: T33-5)*

**BOUNDS**
- **R10** `BOUNDS` is frozen: `depth_default` 8, `depth_max` 10, `fanout` 1,000 per hop, `nodes` 5,000 visited, `hub` 1,000 members, and `time_budget_ms`, a default every walk may lower (K1470; legistar-events §6). `depthOf(requested)` answers 8 for none, the requested depth from 1 to 10, and refuses `DEPTH_OVER_MAX` above 10. *(not yet met: T33-5)*

**derivedId({kind, from, to, as_of, method}) → 64 hex characters**
- **R11** The SHA-256 of the canonical JSON of the five fields; the same five give the same id, so a leg can cite a derived connection and a checker re-derive it (K1447). *(not yet met: T33-5)*

**Walk semantics**, as pure reads over a path (a list of connections from start to end):
- **R12** `chainGrade(path)` is the weakest `grade.assertion` and the weakest end grade over the path's hops; a declared hop gives the lowest grade; the weakest hop governs, never an average or a score (K1442). *(not yet met: T33-5)*
- **R13** `chainLabel(path)` is `lead` when any hop is `declared` or `hunch`, naming those hops; otherwise `evidenced`. A `lead` is never a basis for a finding (K1467, K1487). *(not yet met: T33-5)*
- **R14** `orderPaths(paths, {by?})` orders by hop count, then by the earliest `valid.from` (compared by `civil-time.compare`, undetermined last), then by the hops' ids; with `by`, a stated numeric quantity carried on the path, descending, ties in that order. No other order or score is offered (K1471). *(not yet met: T33-5)*
- **R15** `exhausted({visited, reason})` answers `{truncated: true, undetermined: true, why, visited}`, `reason` one of `depth`, `nodes`, `fanout`, `hub`, `time`; a walk that stops at a bound answers this shape and never a partial path presented as complete (K1442, K1470). *(not yet met: T33-5)*

## Private

### Uses

- `record-grammar`: the id grammar (`ID_TABLE`, `idPattern`, T33-1) for `from` and `to`; `BASIS_GRADES` for grades.
- `civil-time`: `validAt` (R6, R9), `compare` (R14).

### Invariants

- **R16** Pure: no store, no network, no clock; the registry is in memory. No walker and no stored path exists in this module (ladders §2 CONNECTIONS). *(not yet met: T33-5)*
- **R17** No kind, class, word or bound offers a measure of how connected a node is, a centrality, or a score across mixed kinds (K1471, K1473). *(not yet met: T33-5)*
- **R18** Every refusal and every undetermined answer says which kind of no and why. *(not yet met: T33-5)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2, CONNECTIONS (one shape; owners' `neighbours`; derived ids; bounds and hubs; what a walk passes through), §2 "Cross-cutting rulings", Exploration; §5A.5 (hubs named by measured set size).
- Rulings K1442, K1447, K1467, K1469, K1470, K1486, K1487, K1489 (BOB #114: the contract carries `viewer` and `scope`).

### Suggestions

- **For each owner** (lines, events, money, duties, people, connections, standards, progressions, entities, contradiction, hypotheses): register at load, run R9 in its own job over its own fixture, and index both ends with validity (ladders §2 CONNECTIONS). Those obligations belong in each owner's requirements.
- **For `explore`**: the walk, its time budget against the instance's one thread, and the absence level from `observation-log` are its; it builds on R10–R15 and adds no second semantics.
- `time_budget_ms`: 10,000 as the default is a starting value; explore's synthetic test (M-X1a) sets it, and M-X1b tunes it after the first populated deploy.
- The hub threshold 1,000 and a warn band of 250–1,000 are legistar-events §6's initial proposal; the co-mention hub (more than 32 documents, X110) is `connections`' own.
- SHA-256 computed synchronously in-module, as in `calc-grammar`.
