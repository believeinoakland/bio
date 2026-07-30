# The evolving set of constructs: an inventory, and what needs reconciling

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

The rule for the plan is that no step is done until something CONSUMES its output.
That is the discipline whose absence produced 1,463 unconsumed lines.

**Step 0. Reconcile the seven overlaps above.** No new capability. One confidence
ladder, one diff, one entry point, contracts declared by content types, an event
catalogue, significance derived once. This is the only step that deletes more than it
adds and it must come first, because every later step would otherwise be built twice.

**Step 1. The plane records the profile.** `op=acquire` calls `identify()` and
`doctypeFor()` and writes the profile record onto the capture: handler, content type,
both confidences, signals, and what was normalised. Consumer: the document page,
which can then say what kind of document the record thinks it holds. Nothing above
this step is trustworthy without it.

**Step 2. The plane computes and stores the three digests.** Consumers: `op=audit`'s
duplicate sweep, which today cannot see a duplicate whose viewstate differs, and the
Add surface's already-held check, which currently fetches both captures and compares
them client-side.

**Step 3. Monitoring adopts the contracts.** Substance for a record, membership for an
index, unmonitorable for a shell, and frequency by kind. Consumer: the daemon.
Confirmations get stored here, which gives the contemporaneity work its raw material.

**Step 4. The connection table lands as data,** with the three-valued `asserted_by`
and the rule/instance split. Consumers: a task that walks the table looking for
connections, and a UI surface that shows and edits it.

**Step 5. Ageing.** Something notices when a temporal expectation comes due.
Consumer: the review queue, or a Focus, which is a decision Bob has not made.

**Step 6. Presentation.** The document page shows referential and temporal
connections apart, because they are understood differently.

**Step 7. Then, and only then, more content types.** Each one measured first, and
each one now cheap because steps 0 through 6 gave it somewhere to land.
