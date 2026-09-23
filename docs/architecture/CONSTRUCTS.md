# The evolving set of constructs: an inventory, and what needs reconciling

**Status** · A dated inventory of the document-profile and content constructs — where each lives, what consumes it, eight overlaps and conflicts, the connection-table brief, and a ten-step consumer-driven plan. "Written 2026-07-30, at Bob's direction, after he asked whether the development work had become too diffused"; "It is not a design document. It is the inventory that has to exist before a design document can be written honestly." One RULED marker (Bob, 2026-07-30, Step 0's scope). Completeness: an inventory at a date — the tables are the 2026-07-30 measurement and were not re-measured as the FW steps landed; read the plan section's BUILT markers, not the tables, for what is true. Step 5a's measurement was taken once on 2026-09-23 (D-74, M-117); nothing it feeds is built. as of 2026-09-23.

**Place in the system** · The evidence beneath construct 5 of `BIO_System_Design.md` §3 (document profile and extraction substrate): "The FRAMEWORK it argues for is `BIO_Content_Framework_v0_10.md`", and since 2026-09-15 it names v0.11 and Part II as the content inventory beside its own. Its steps are the FW-series build ids in `docs/development/MILESTONES.md`; Step 4 is the shared subject registry with `BIO_Declared_Bias_v0_1.md`.

**Incomplete sections** ·
- §Inventory — a 2026-07-30 snapshot; verified changed since: `profileRecord` is now stamped at acquire, `TYPE_CONFIDENCE` is gone, and `docprofile/monitoring.mjs` no longer exists. Other rows not re-audited.
- §What overlaps or conflicts — items 1–8 were Step 0's scope and are BUILT (FW-2); the section carries no resolution marks.
- §The connection table — "deliberately NOT being coded yet"; the sketch is history, because connections are BUILT (construct 6, `node tools/status.mjs 6`: each keeps its determining reference pair, D-161).
- §The plan — the steps marked UNSCHEDULED on 2026-07-31 were re-read at the code on 2026-09-21 (BOB #24, D-69). Step 1 is BUILT: `op=acquire` spreads `profileRecord` onto the capture. Step 5's progression and connection tables are BUILT (construct 6). Step 5a's MEASUREMENT was taken once on 2026-09-23 (D-74, `measurements/M-117.md`: a first sample from the record, three classes seen in two Oakland systems, contract/PO and APN UNDETERMINED); the identifier-space construct it would feed stays ABSENT, and Step 6 is D-65, an open DEBT row placed as the backlog allows. Steps 8–8b are Framework §12's intent layer (D-75, D-76, D-79, D-81, D-82, all open). Step 9's content types are ordered in `EXTRACTION-BREADTH-DESIGN.md` §2, where Bob's named types are built or placed (FW-20) and the budget-or-dataset type is OWED, measured first. Step 7's "a Focus, which Bob has not ruled on" predates DEC-10; Step 8b's focus/problem vocabulary predates the inquiry collapse.

**Contents**
- [Purpose of this document](#purpose-of-this-document)
- [Inventory](#inventory)
  - [Layer 1 constructs: how a document was built](#layer-1-constructs-how-a-document-was-built)
  - [Layer 2/3 constructs: whether and how much a document differs](#layer-23-constructs-whether-and-how-much-a-document-differs)
  - [Layer 4/5 constructs: what a document is and what its changes mean](#layer-45-constructs-what-a-document-is-and-what-its-changes-mean)
  - [Layer 6 constructs: meaning across content and across time](#layer-6-constructs-meaning-across-content-and-across-time)
  - [Monitoring constructs](#monitoring-constructs)
  - [Plane-side constructs these must eventually meet](#plane-side-constructs-these-must-eventually-meet)
- [What overlaps or conflicts, and must be reconciled before more is built](#what-overlaps-or-conflicts-and-must-be-reconciled-before-more-is-built)
- [The connection table](#the-connection-table)
- [The plan: bottom up, and each step has a consumer](#the-plan-bottom-up-and-each-step-has-a-consumer)

---

Written 2026-07-30, at Bob's direction, after he asked whether the development work
had become too diffused. It had. The evidence, measured rather than felt:

- **1,463 lines of `docprofile/` are consumed by zero plane files.** Stack handlers,
  three digests, monitoring contracts, content types, the layered pipeline and
  connections all run only in the UI's flattened copy. The plane still compares raw
  hashes on every kind of document alike.
- **11 of the 35 open debt items were opened on 2026-07-30.** Nearly a third of all
  outstanding debt, in one day.
- **Seven exported vocabularies were invented in one day**, two of which are the
  same concept duplicated.
- **Two same-day reworks.** `volatile.mjs` was written and deleted within hours.
  Membership monitoring shipped with a false positive that the content-type work
  fixed the same evening, and the fix moved `kind()` off the stack handler,
  invalidating part of a design shipped hours earlier.

The cause is not carelessness. Designing while discovering was correct and it
produced knowledge nothing else would have: the Legistar viewstate measurement, the
WordPress byte-identity, the relative calendar window. What went wrong is that
discovery mode did its job and was never exited. This document exits it.

**This document is the CONSTRUCT inventory and the evidence. The FRAMEWORK it argues for is
`BIO_Content_Framework_v0_10.md` — now at **v0.11** (2026-09-15; the file keeps its `v0_10`
name so every `framework:LINE` citation stays exact), Part I written 2026-07-30 after Bob
corrected the framing of this one: it is not that discovery has finished, but that discovery
will continue for a long time and the framework's job is to make each new surprise cheap.
Part I's section 9 states the cost of absorbing each kind of new thing, and that table is its
actual specification. **Part II (§§14–19) is the CONTENT inventory that sits beside this
construct inventory** — content's role and model, the forms it takes, the extraction process
as built, how it is organized and reached, and the central gap stated once — every construct
there marked BUILT / DESIGNED-not-built / GESTURED / ABSENT and cited at `51d128a`.**
*(Framework-version and Part II pointer recorded 2026-09-15 by CONDUCT, answering FOR the
dormant FRAMEWORK area in writing per the dormant-owner rule — the 2026-09-15 inbox's act 3.)*

## Purpose of this document

To name every construct now in play, say where it lives, say whether anything
consumes it, and identify the ones that OVERLAP or CONFLICT. It is not a design
document. It is the inventory that has to exist before a design document can be
written honestly, because seven vocabularies invented in one day are unlikely to be
seven distinct ideas.

---

## Inventory

### Layer 1 constructs: how a document was built

| Construct | Lives in | Consumed by | Status |
| --- | --- | --- | --- |
| stack handler (`detect`/`rules`/`boundary`/`renderCritical`/`ignorable`/`members`) | `docprofile/handlers/*` | UI only | 4 written, 3 measured |
| `CONFIDENCE` (certain / likely / possible / none) | `docprofile/index.mjs` | UI only | in use |
| `REGION` (evidentiary / presentational / mechanical) | `docprofile/index.mjs` | UI only | in use |
| pattern rule vs boundary rule | `docprofile/index.mjs` | UI only | boundary preferred, measured |
| `profileRecord` | `docprofile/index.mjs` | **nothing** | never written to a capture |

### Layer 2/3 constructs: whether and how much a document differs

| Construct | Lives in | Consumed by | Status |
| --- | --- | --- | --- |
| three digests (identity / rendition / evidentiary) | `docprofile/index.mjs` | UI only | validated both directions |
| `compare` verdicts (identical / unchanged / restyled / changed / undetermined) | `docprofile/index.mjs` | UI `heldMatch` | in use |
| `fidelity` levels (faithful / degraded / insufficient) | `docprofile/index.mjs` | UI banner | in use |

### Layer 4/5 constructs: what a document is and what its changes mean

| Construct | Lives in | Consumed by | Status |
| --- | --- | --- | --- |
| content type (`detect`/`parse`/`assess`/`connections`) | `docprofile/doctypes/*` | UI only | 1 written, 1 measured |
| `TYPE_CONFIDENCE` | `docprofile/doctypes/index.mjs` | UI only | **duplicates `CONFIDENCE`** |
| `entity` (key + kind + label + facts) | `docprofile/doctypes/index.mjs` | UI only | in use |
| `diffEntities` (gone / appeared / altered-by-fact) | `docprofile/doctypes/index.mjs` | UI only | in use |
| `SIGNIFICANCE` (event / notice / routine) | `docprofile/monitoring.mjs` | UI only | in use |
| event types (`delisted`, `cancelled`, `minutes_replaced`, ...) | inside `meeting-calendar.mjs` | UI only | **ad hoc strings, no registry** |

### Layer 6 constructs: meaning across content and across time

| Construct | Lives in | Consumed by | Status |
| --- | --- | --- | --- |
| `CONNECTION` (referential / temporal) | `docprofile/doctypes/index.mjs` | **nothing** | emitted, discarded |
| `referential()` / `temporal()` + `expected_by` | same | **nothing** | emitted, discarded |
| the connection table Bob asked for | **does not exist** | — | needs design |

### Monitoring constructs

| Construct | Lives in | Consumed by | Status |
| --- | --- | --- | --- |
| `CONTRACT` (substance / membership / unmonitorable) | `docprofile/monitoring.mjs` | UI only | **partly superseded** |
| `diffMembers` | `docprofile/monitoring.mjs` | UI only | **superseded by `diffEntities`** |
| `monitor()` | `docprofile/monitoring.mjs` | UI only | **superseded by `assess()`** |
| `LAYER` + `assess()` + trail | `docprofile/pipeline.mjs` | UI only | current |
| confirmation (identical_bytes / same_substance / intact counts) | pipeline + content type | **nothing** | computed, discarded |
| monitor frequency by kind | **does not exist** | — | D-65 |

### Plane-side constructs these must eventually meet

`captured_locators`, `links` with its two keys, `REL_VOCAB` / `links_to` with
`asserted_by: source`, `site_assets` reuse, the register, `op=audit`'s sweep,
C-18.3's ring-once rule, the gathering queue, capture sessions.

---

## What overlaps or conflicts, and must be reconciled before more is built

**1. `CONFIDENCE` and `TYPE_CONFIDENCE` are one idea.** Both answer "how sure is this
recogniser". They exist twice because the content axis was split off from the stack
axis after the stack axis already had a confidence ladder. One ladder, used by both
registries.

**2. `monitor()`, `compare()` and `assess()` are three entry points to one question.**
`assess()` is the current and most complete one; `monitor()` predates the layers and
duplicates L2/L3 with a different vocabulary; `compare()` is the layer-3 primitive
`assess()` already calls. Two of the three should stop being public.

**3. `diffMembers` and `diffEntities` are the same function written twice.**
`diffMembers` came first with a flat digest per row; `diffEntities` came hours later
with named facts, which is strictly better because it can say WHICH fact moved.
`diffMembers` should go.

**4. `CONTRACT` and content type overlap.** The contract (substance / membership /
unmonitorable) is derived from the document kind, and the kind is now the content
type's business rather than the stack handler's. `CONTRACT` should be a property a
content type declares, not a function of a stack handler.

**5. Event types are ad hoc strings with no registry.** `delisted`, `cancelled`,
`minutes_replaced` and the rest are invented inside one content type. The moment a
second type exists, either it invents its own overlapping set or there is a shared
catalogue. This is the same lesson the check catalogue already taught the plane.

**6. `SIGNIFICANCE` and `meaningful` say the same thing twice.** `meaningful` is
`events.some(e => e.significance === "event")`. Keep the grade, derive the boolean.

**7. Nothing writes the profile onto a capture.** This is the ordering constraint that
governs the whole plan below: until `op=acquire` records which handler and which
content type spoke, and how sure each was, no verdict computed later can be
re-evaluated when a handler turns out to have been wrong. Every construct above is
downstream of this one and it is 20 lines of work.

**8. Confirmations are computed and discarded.** Three places produce them
(identical bytes, same substance, intact entity counts) and nothing stores them,
which means the primary contemporaneity route has no raw material despite the
machinery to generate it existing.

---

## The connection table

Bob's request, 2026-07-30: a table mapping the connections to look for between
content, used by tasks actively looking for connections, and in a form where the set
can be viewed and edited through a UI surface. His example: a scheduled meeting to
an agenda, to a list of attendees, and to notes or a transcript after the meeting has
occurred.

This is deliberately NOT being coded yet, and the reason is the point of this whole
document: it would be the eighth vocabulary invented before the seven above are
reconciled. What it needs first is three decisions, all of them recorded here rather
than guessed at:

- **It is DATA, not code.** Editable through a UI means rows in the record, not
  cases in a `switch`. That makes it a schema question, and the schema has to
  distinguish an expectation the system was told to look for from an inference the
  system drew.
- **`asserted_by` needs a third value.** `links_to` carries `asserted_by: source`,
  meaning the document said so. A connection from this table is asserted by the
  SYSTEM, on the strength of a rule a member can edit. A member can also assert one
  directly. Three kinds of author, with different evidentiary weight, and today the
  vocabulary has one.
- **A temporal expectation is a row with a clock.** "Minutes follow a meeting within
  N days" is a rule; "the minutes for meeting 1428383 have not appeared and were due
  on 8/18" is an instance of that rule that has come due. The table holds the rule;
  something else has to age the instances. Which thing is a plan question.

Shape sketch only, to be settled in the architecture pass:

    from_kind    to_kind      relation                  connection   timing
    meeting      agenda       has_agenda                referential  before the meeting
    meeting      attendees    has_attendance            referential  after
    meeting      minutes      has_minutes               temporal     after, within N days
    meeting      transcript   has_transcript            temporal     after, within N days
    meeting      body         held_by                   referential  -
    agenda_item  regulation   proposes_amendment_to     referential  -
    person       body         serves_on                 referential  -

---

## The plan: bottom up, and each step has a consumer

Status per item, against QUEUE.md and MILESTONES.md (`BUILT` / `QUEUED <ID>` /
`UNSCHEDULED` / `BLOCKED`), verified 2026-07-31. Steps 0–2 are FW-2/FW-3/FW-4
(landed); Step 3 is FW-5 (queued); Steps 4 onward are M4+ and not yet scheduled.

The rule for the plan is that no step is done until something CONSUMES its output.
That is the discipline whose absence produced 1,463 unconsumed lines.

The plan below predates the framework document and its Step 0 is unchanged: the
reconciliation is exactly what §4 of the framework requires, since one recogniser
shape and one confidence ladder is what removes the duplication.

**Step 0 — BUILT (FW-2). Implement §4 of the framework, not merely deduplicate.** RULED by Bob,
2026-07-30: "we must do the work upfront in order to end up with the results we
need." So this is the full version, not the narrow one. One recogniser interface and
one registry helper, with both existing axes rewritten onto them; one confidence
ladder; one entity diff; `assess()` the only public entry point; `CONTRACT` declared
by the content type; a shared event catalogue; significance graded once and the
boolean derived. This step should shrink the codebase, and the test of whether it
worked is that Step 4 costs a registry.

**Step 1 — BUILT (FW-3). The plane records the profile.** `op=acquire` calls `identify()` and
`doctypeFor()` and writes the profile onto the capture: handler, content type, both
confidences, signals, versions, and what was normalised. Roughly twenty lines.
Consumer: the document page says what kind of document the record thinks it holds.
Nothing above this is trustworthy without it, because a judgment whose author and
version are unrecorded cannot be revised when the author turns out to be wrong.

**Step 2 — BUILT (FW-4). The plane computes and stores the three digests.** Consumers: `op=audit`'s
duplicate sweep, which today cannot see a duplicate whose viewstate differs; and the
Add surface's already-held check, which currently fetches both captures and compares
them in the browser.

**Step 3 — BUILT (FW-5). Readings are PERSISTED.** Today `parse()` output is transient, which is
the quiet blocker on everything Bob's purpose statement asks for: entities cannot be
resolved across documents if no document's entities are stored. Persist readings and
index them by entity reference. Consumer: Step 4.

**Step 4 — QUEUED FW-6. The ENTITY axis, which must also be the bias doctrine's SUBJECT REGISTRY**
(D-83). Aliases and member-declared relations are first-class, justified and citable,
because safeguard 4 of `BIO_Declared_Bias_v0_1.md` depends on them and an entity model
that only derives identity from source identifiers cannot express them. A declared
relation is constitutive rather than evidentiary and sits outside the connection grade. The third registry, and the first real test of whether
§4's claim is true. Entity recognisers resolve a reference in a reading to an entity
and declare how: by a source-assigned identifier, by an exact identifier match, or by
correspondence such as a name. That method IS the connection grade (framework §8.1).
Consumers: the reverse index, "every document that concerns this ordinance", which is
the single largest piece of manual work the framework can remove.

**Step 5 — UNSCHEDULED. The PROGRESSION table lands as data,** of which the connection table is the
two-stage case. Stages with `after`, cardinality, interval and required-ness; exception
documents that discharge a legitimate skip; junction checks as rules; the three-valued
`asserted_by`; and a grade on every connection, with a progression instance inheriting
the weakest grade along its chain. Consumers: a task that walks the table looking for
connections, and a UI surface that shows and edits it. Meeting-to-minutes and
need-to-signed-contract must both be expressible as rows, or the generalisation has
not been made.

**Step 5a — UNSCHEDULED. Measure Oakland's shared identifiers.** Empirical work, exactly like
measuring a host stack, and cheap: which identifiers does the city reuse across
Legistar, its procurement portal and its finance system? A contract number, a project
number, a resolution number, an APN, a fund code. Each one found in two systems
converts a whole progression from Grade C to Grade B, which makes this the highest
value-per-hour measurement available. Consumer: Step 4's entity recognisers.
*Measured once, 2026-09-23 (D-74, `docs/development/measurements/M-117.md`)*: from the record's own
captures (no Oakland host was reachable), a project number is shared by the budget and Legistar
(7 values), a fund code by the budget and Legistar (3), a C.M.S. number by the Auditor and
Legistar (1); contract/PO numbers and APNs are UNDETERMINED because their issuing systems were
not read. A first sample, not a census; M-117 names the four measurements still owed.

**Step 6 — UNSCHEDULED. Monitoring adopts the contracts,** with frequency by document kind, and
stores confirmations. Consumer: the daemon. This is where the negative result finally
lands somewhere.

**Step 7 — BUILT (REC-8). Ageing.** Something notices when a temporal expectation comes due.
Consumer: the review queue, or a Focus, which Bob has not ruled on.

**Step 8 — UNSCHEDULED. Presentation.** The document page and the case file show referential and
temporal connections apart, each with its grade, and show which links in a case are
the weak ones.

**Step 8a — UNSCHEDULED. Satisfaction conditions, on projects AND on bias statements.** One
evaluator, two consumers (D-88). On a project it derives progress against an objective;
on a `pattern` bias statement it derives a standing measure of how far the evidence
still bears the statement out, which is the inverse of bias debt and the thing that
stops a bias outliving its justification unremarked (D-87). The measure never edits the
statement and its scope is registry-defined rather than hand-picked. An objective states what would
satisfy it in the framework's own vocabulary, so progress is computed from the record
rather than reported by whoever is doing the work. Smaller than it sounds: the
catalogue already gives a `project` an `objective` field, and this adds a machine-
readable condition beside it plus the evaluator that measures the record against it.
Consumers: the project page, which shows derived progress and the gap list; and the
review queue, which gets its work from the gaps. Aspiration and goal, the two object
types §12 says do not exist yet, come with it.

**Step 8b — UNSCHEDULED. The discovery loop, with unattended surfacing.** An assistant may open a
focus or a problem at `surfaced` without a member, per Bob's ruling, because those are
advisory and commit nobody; elevation, adoption and dismissal stay member acts. Fix
`surfaced_by` in both writers first (D-78), since an assistant-surfaced focus that
claims a human author is a false attribution in a system built on claims carrying
their author. Then the two disciplines unattended surfacing needs: aggregation, so one
check across 58 contracts is one focus with 58 instances, and ageing, so an unactioned
machine finding moves to `deferred` with its reason rather than vanishing. And the
display half (D-82): an assistant-surfaced focus must LOOK like one, not to discount
it but because a member needs to know nobody has yet judged it worth asking. A finding becomes a PROPOSAL with its grade and
basis; a member adopts it into an objective, files it as a focus or a problem, or
defers it with a recorded reason. Nothing is adopted automatically and nothing
disappears silently, because a finding that vanishes is indistinguishable from one
that was never made. This is where invariant 7 is enforced in practice: a finding that
cuts against the goal takes exactly the same path as one that supports it.

**Step 9 — UNSCHEDULED. Then more content types and more stacks,** each measured first, and each
now cheap because Steps 0 through 8 gave it somewhere to land.

Steps 3 and 4 moved up from the tail of the v1 plan. They were sequenced late because
they looked like new capability; Bob's restatement of BIO's purpose makes them the
capability the rest exists to serve.
