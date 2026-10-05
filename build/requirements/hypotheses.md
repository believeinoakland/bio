# hypotheses — requirements

**Status** · DRAFT by a requirements-drafting worker for BOB #114, 2026-10-05, on `tranche/T32`, for T33 (§5.9); for BOB's review and Bob's approval (a new product module, P17). Layer 6, directly after `inquiry` (plan Rules (2), Choices 5; scope §2). Meaning from the capability ladders §2 CONNECTIONS and "Cross-cutting rulings" (exploration), §10 rows "Hypotheses have a place, never in findings" and "Cause is stated, never inferred", and rulings K1467, K1473, K1487, K1489; entry B1a.13 (`draft-T33-entries-B.md`), plan entry T33-46. Code today: none. Not yet met: every requirement (T33-46).

**Size (P6).** New. Expected 500–700 lines. It is not added to `inquiry` (3,903 lines, P6).

## Public

### Purpose

A member's hunches and hypotheses, held as labelled rows of the working inquiry (K1467): never facts, never legs, never moving a grade or a finding. In an exploration they may be hops of that inquiry, and any chain through one is a lead. This module also holds the store-side check that keeps a hypothesis out of a leg.

### Provides

Terms. A **hypothesis** is `HYP-` (`record-grammar`; `isHypothesisId`). A **viewer** is the control plane's stamp; it fails closed when absent. Every refusal is `{ok: false, reason, detail}`; one with a catalogue row carries `code`, `check` and `translation`.

**hold({inquiry, kind, statement, about, by}), revise({hypothesisId, statement?, about?, reason, by}), withdraw({hypothesisId, reason, by}), hypothesesOf({inquiry, viewer}), read({hypothesisId, viewer})** (`op=hypothesishold`, `op=hypothesisrevise`, `op=hypothesiswithdraw`, `op=hypotheses`)
- **R1** `hold` records one `HYP-` in an inquiry, of kind `cause`, `identity`, `relation`, `flow` or `other`, with the member's statement and the nodes it is about (each an id `record-grammar` knows; for `relation`, `cause` and `identity`, exactly two, `from` and `to`). Refusals, in order: `NO_SUCH_BUNDLE` (an absent or invisible inquiry, one answer), `NOT_AN_INQUIRY`, `MACHINE_CANNOT_HYPOTHESISE` (the stamp is a machine's: only a member holds a hypothesis, K1473), `UNKNOWN_HYPOTHESIS_KIND` (naming the five), `NO_STATEMENT`, `BAD_ABOUT` (naming the node). It answers `{ok, hypothesis_id, kind, label: "hypothesis", at}`. *(not yet met: T33-46)*
- **R2** A hypothesis is never edited in place: `revise` appends a revision and `withdraw` marks it withdrawn, each with who, when and why (`NO_REASON`, `NO_SUCH_HYPOTHESIS`); every read shows its history. *(not yet met: T33-46)*
- **R3** Every read answers a hypothesis labelled as a hypothesis, the member's, never a fact, with no grade. A hypothesis in an inquiry the viewer may not see answers exactly as an absent one and is counted nowhere (K1489). *(not yet met: T33-46)*

**neighbours({node, kinds, at, page, viewer, scope})** (registered with `connection-grammar`)
- **R4** At start the module registers as the owner of the kind `hunch` of class `hunch` (`connection-grammar.registerOwner`). `neighbours` answers a hop for each live hypothesis with a `from` and `to` of which `node` is one only when `scope.inquiry` is the inquiry holding it and the viewer may see that inquiry; outside that scope it answers none. Each hop is in `connection-grammar`'s shape, labelled `hunch` with no grade (its R1), with the hypothesis as its evidence. It passes `connection-grammar`'s owner-conformance battery. *(not yet met: T33-46)*

**The leg check** (registered with `promotion`, its R39; K1467, K1487)
- **R5** A registered check of every promotion of an inquiry refuses, inside `BASIS_REFUSED`, a leg whose target is a hypothesis id (`HYPOTHESIS_NOT_A_LEG`), naming the leg. *(not yet met: T33-46)*
- **R6** The same check refuses a leg whose target is a derived connection id, or a calculation leg whose inputs name one, when `explore.rederive` answers that its chain carries a declared or hunch hop (`LEAD_NOT_A_LEG`, naming the hop), or cannot re-derive it (refused, never passed). *(not yet met: T33-46)*

**The ops map**
- **R7** The module publishes `hypothesesOps(hypotheses, url, body)`, route arms for the ops above. *(not yet met: T33-46)*

## Private

### Uses

- `record-grammar`: `ID_TABLE` (`HYP-`), `idPattern`, `isHypothesisId`.
- `record-core`: `allocId`, `transact`, `declareTable`.
- `membership`: `viewerPredicate`, `inSight`.
- `promotion`: `registerStep` (R5, R6). *(an edge beyond plan Rule 3's list)*
- `connection-grammar`: `registerOwner`, the shape, the battery (R4).
- `explore`: `rederive` (R6). *(an edge beyond plan Rule 3's list)*
- `inquiry`: the inquiry's existence, type and visibility (R1, R3).

### Invariants

- **R8** Never a fact: no hypothesis moves a grade, a strength pair, a basis or a finding; this module writes nothing to any other module's table (K1467). *(not yet met: T33-46)*
- **R9** A hypothesised cause stays a hypothesis: nothing here records a cause as an event relation (`stated_cause` is a source's claim, `events`') (DEC-84 (10), K1461). *(not yet met: T33-46)*
- **R10** Table declaration (`record-core`): `hypotheses` and their revisions keyed by the inquiry's `bundle_id`, purged with it, sight the inquiry's, export `yes`. No place is named in behaviour or outward text. *(not yet met: T33-46)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 CONNECTIONS (item (4) of "What it passes through"), "Cross-cutting rulings" (exploration); §10 rows "Hypotheses have a place, never in findings", "Cause is stated, never inferred", "Machine signals live in the hypothesis layer".
- Bob's rulings K1467, K1473, K1487, K1489; BOB's K1470 (constructs-2 §4.2 (h), as narrowed by K1487).
- DEC-15, DEC-20, DEC-84 (10).

### Suggestions

- **Callers' obligations.** The other store-side refusals of a hypothesis id are the earlier modules' own, through `record-grammar.isHypothesisId`: a total (`calculations` R4), a check (`people` R22), an absence level (`observation-log`, owed). This module cannot be called by them (P4).
- **A signal taken up.** A member may hold a hypothesis from a "Noticed" item (K1473); the item's id may be one of `about`'s nodes.
- **Tests.** R4 inside and outside scope; R5 and R6 with negative controls (a leg on an ordinary connection id passes); R3 a hidden inquiry.

## Open for Bob

None: the meaning is the ladders' and Bob's rulings. Open technical points for BOB are in the drafting report.
