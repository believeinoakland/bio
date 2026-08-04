# Interface change proposals

Created 2026-08-01, on the first change to a STABLE interface. `PARALLELISM.md` said
this file would be written when it was first needed and not before, on the reasoning
that writing a protocol before anyone has felt it gets it wrong. This is that moment.

**Append only. States are appended, never edited in place**, so the history of a
contract reads the way the record's own history does. That is deliberate: this
project's thesis is that append-only history is what makes a claim checkable later,
and its own development process is not exempt.

## The protocol, from `PARALLELISM.md`

1. **PROPOSED.** The proposer states the interface, the change, why, and which
   consumers it believes are affected.
2. **RESPONSES.** Every area listed as a consumer in `INTERFACES.md` answers exactly
   one of `AGREE`, `COUNTER` (with the counter-proposal), or `NOT-AFFECTED`. Silence
   is NOT consent.
3. **RESOLUTION.** All agreed → `ACCEPTED`. Any counter → the proposer amends or
   CONDUCT adjudicates. **If a consumer area is dormant and cannot answer, CONDUCT
   answers on its behalf, IN WRITING, naming that it did so** — recorded as CONDUCT
   answering FOR that area, never as the area agreeing.
4. **CHANGING.** The interface is marked unusable for NEW work in the registry, with
   the date. Existing code keeps working; nothing new is built against either shape.
5. **CHANGED.** The owner lands the change and bumps the interface version.
6. **SETTLED.** Consumers confirm they have migrated, or record that they had nothing
   to migrate. Only then does the registry return to stable.

**When this file is required**, recorded so a session does not re-reason it: a change
to an interface whose status is **STABLE**, or to a PROVISIONAL one that has acquired
a **live consumer**. A provisional interface with no consumer is revised producer-side
with its reasoning, as I2 0.1.0 was.

---

## IC-1 · I2 element reference: generalise `source` beyond PDF · PROPOSED

- **Interface:** I2 (content → framework), currently **1.0.0 STABLE**
- **Proposer:** session BOB, 2026-08-01, from D-123 / `OFFICE-FORMATS.md`
- **Owner to land it:** `FRAMEWORK`
- **Consumers to answer:** `FRAMEWORK` (owner and consumer — and, as of FW-1 on
  2026-07-31, no longer dormant)
- **Producers affected:** `CONTENT-PDF` (live), `CONTENT-HTML` (dormant), and whoever
  builds the office-format entries (D-121)

### The change

`source` is PDF-shaped: `{ page, rect } | null`. Office formats need references their
own containers can express, and two of them are better than PDF's:

```
source: { kind: "pdf-page"    , ref: "p.7"        , page: 6, rect: [x0,y0,x1,y1] }
      | { kind: "sheet-cell"  , ref: "Sheet1!B14" , sheet: "Sheet1", cell: "B14" }
      | { kind: "slide-shape" , ref: "slide 7"    , slide: 7, shape: 3 }
      | { kind: "dom"         , ref: "<selector>" , selector: "…" }
      | null
```

`pdf-page` keeps `page` and `rect` byte-for-byte as 1.0.0 emits them; the producer adds
two fields and changes nothing else.

### Why, and why it is NOT safely additive

**A required `kind` discriminator is the load-bearing part.** A consumer written
`if (source) usePage(source.page)` does not fail loudly on a sheet-cell source — it
reads `undefined` and carries on. That is a silent misread, which is why this is a
protocol case rather than an additive field: consumers must discriminate, and a
required tag converts the silent failure into an obvious one.

**A required `ref` is the human-readable form, produced by the container that knows
it.** `Sheet1!B14` is already the string a person recognises and a citation surface
will display. Deriving it in the viewer would put per-container knowledge in the wrong
layer, where it drifts — exactly as the UI's hand-composed query syntax drifted from
`op=searchfields`.

**Two designs were considered and rejected**, on opposite sides of the same argument.
A pure STRING (`"Sheet1!B14"` alone) pushes per-container PARSING onto every consumer,
and parsing is where silent misreads live. A pure STRUCTURE with no `ref` forces every
display surface to rebuild the human form per container. Carrying both is the shape
that keeps parsing at the producer and display honest.

### What this does not settle

M4 brings readings and the entity axis (D-71, D-83), and an element reference may want
to BE the same construct as an entity locator rather than a sibling of it. This
proposal does not foreclose that: `kind` + `ref` is the minimal shape an entity locator
would also need — what kind of pointer, and how to show it — so subsuming it later
costs a `kind`, not another break. FRAMEWORK is better placed than the proposer to say
whether it wants to go further NOW rather than twice.

### Status

**PROPOSED, 2026-08-01.** Awaiting FRAMEWORK's response. Nothing is built against
either shape until this resolves; D-121's office-format work can proceed through steps
1 and 2 (the FORMAT registry and the container reader), neither of which emits a
`source`.

### AMENDED 2026-08-03 by the proposer (session BOB) — the DOCX kind was omitted

The union as PROPOSED enumerates `pdf-page` / `sheet-cell` / `slide-shape` / `dom`,
while `OFFICE-FORMATS.md`'s own part-map table names a DOCX element reference —
paragraph / run index — that has no kind. Without one, the DOCX entry (COFF-4) must
either emit `source: null`, discarding citability finer than the whole document, or
invent an unregistered shape — the silent-misread hazard the tagged union exists to
prevent. One arm is added; nothing else changes:

    | { kind: "doc-para", ref: "¶142", para: 141, run: 2 }

- **`para`** — 0-based index into the body's `<w:p>` sequence, REQUIRED. A DOCX
  contains no pages: pagination is computed at render time by the layout engine and
  shifts with fonts and printer metrics, so citing a "page" of a DOCX would claim
  something the captured bytes do not say. The paragraph sequence IS in the bytes,
  and every reference is anchored to a capture sha, so the index is stable for
  exactly as long as the citation is meaningful.
- **`ref`** — the human-readable form, `¶<1-based para>`, REQUIRED per this
  proposal's own rule.
- **`run`** — 0-based run index within the paragraph, OPTIONAL: present when the
  reference genuinely targets runs (a hyperlink, a tracked change), absent when the
  paragraph is the honest granularity. Run boundaries are producer artifacts (Word
  splits runs on formatting and even spell-check state), so the paragraph is what a
  person is shown and the run only sharpens it within one capture — it is never
  presented as structure the author meant.

Still PROPOSED; the response owed is unchanged (FRAMEWORK answers, or CONDUCT answers
on its behalf in writing, naming that it did so). The 2026-08-03 BOB INBOX entry asks
CONDUCT to resolve this, since three format entries (COFF-3/4/5) build against the
resolved union.

### RESPONSES · 2026-08-03 · to the proposal AS AMENDED (including `doc-para`)

- **FRAMEWORK: `AGREE` — answered on its behalf by CONDUCT, in writing, per protocol
  step 3.** FRAMEWORK is dormant (its FW-1…FW-10 run is done and its slot released; no
  live session can answer), so this is recorded as CONDUCT answering FOR the area,
  never as the area agreeing. The grounds are drawn from FRAMEWORK's own recorded
  confirmation of I2 1.0.0 (`INTERFACES.md`), not invented here: (1) the `pdf-page`
  arm keeps `page`/`rect` byte-for-byte, so the container-agnostic partition/wrapper
  contract FRAMEWORK consumes is untouched and existing consumers migrate by adding a
  discriminator check, not by reshaping; (2) the required `kind` discriminator
  converts the silent-misread failure (`source.page` reading `undefined` on a
  sheet-cell source) into a loud one — the failure asymmetry FRAMEWORK named as the
  property it cannot do without; (3) `kind` + required `ref` keeps per-container
  parsing at the producer and display honest, the searchfields drift lesson the
  proposal cites. **The `doc-para` amendment is covered by the same answer and is
  RIGHT on its own terms**: a DOCX has no pages in its bytes, so a page reference
  would claim what the capture does not hold — the paragraph index is the honest
  anchor, and the optional `run` (producer artifact, never author structure) follows
  the same never-invent discipline. On "What this does not settle": the proxy answer
  is to go NO further now — `kind` + `ref` is the right minimal leaf, per the
  constraint below.
- **Constraint recorded with the agreement — D-164 (DEC-23), which postdates the
  proposal.** The addressable CONTENT EXTENT is one primitive seen three times
  (D-123/this change, D-161, D-163) and is to be solved ONCE. This union is that
  primitive's per-container LEAF — the same tags a leg, a connection and a citation
  will use to point inside a document — so no implementer forks a second reference
  vocabulary. The proposal's own "What this does not settle" section already shaped
  for this (subsuming later costs a `kind`, not a break); the content-extent design
  itself stays PARKED with Bob's paused case-making thread, and this entry constrains
  its leaf shape without pre-empting it.

### RESOLUTION · 2026-08-03 · ACCEPTED (as amended)

Sole consumer agreed, by proxy, named above. When FRAMEWORK next wakes it may re-open
this with a COUNTER before the version bumps — which is why CHANGING is not entered
now. The registry entry stays 1.0.0 STABLE until the first item that emits a
non-`pdf-page` `source` (COFF-3/4/5, whichever lands first) enters CHANGING here,
lands, and bumps the version; COFF-1 and COFF-2 emit no `source` and do not wait.

---

## IC-2 · I2 gains the shared EVIDENTIARY ENVELOPE (the DEC-5 extras) · PROPOSED

- **Interface:** I2 (content → framework), currently **1.0.0 STABLE**
- **Proposer:** session CONTENT-OFFICE (coff4-agent), 2026-08-03, **FILED FROM
  AS-BUILT CODE** (`bio-plane/src/docx.mjs`, COFF-4) per the first-lander rule in
  QUEUE COFF-3/4/5: the first office entry to land files this envelope; the other
  two CONFIRM it from their own as-built emissions rather than inventing variants.
  This is the I1 write-from-code precedent, not a paper design.
- **Owner to land it:** `FRAMEWORK` (dormant; CONDUCT answers by proxy per protocol
  step 3, as it did for IC-1)
- **Consumers to answer:** `FRAMEWORK`
- **Producers affected:** the office entries (COFF-3/4/5); HTML and PDF are NOT
  affected (they emit no envelope, and its ABSENCE is valid — the field is additive)

### The change

The office formats carry evidence that every RENDERED form of the same document
destroys — a formula beside its cached value, a tracked change with its superseded
wording, a reviewer's comment, a hidden sheet, speaker notes, the file's own
provenance metadata (DEC-5: these are frequently the finding). One additive
top-level field on the I2 `ok:true` structure object, exactly as CPDF-4's `text`
was added:

    evidentiary: {
      container: "docx" | "xlsx" | "pptx",
      kinds:     [ <string>... ],          // the item kinds this producer emitted
      items:     [ EvidentiaryItem... ],   // tagged union, in body order
      undetermined: [ { part, why, ... } ],// parts that COULD have carried items
                                           // but could not be read — STATED
      counts:    { <kind>: <int> } }

Every `EvidentiaryItem` carries a required `kind` discriminator (the IC-1 lesson:
a required tag converts a silent misread into a loud one) and a `source` that is
an IC-1 element reference or `null` — the SAME reference union links use, per the
D-164/DEC-23 one-primitive constraint; no second reference vocabulary. Kinds are
per-format and open-ended; the ones DOCX (COFF-4) emits, from code:

    { kind:"tracked-change", change:"insertion", author, date, text, source }
    { kind:"tracked-change", change:"deletion",  author, date, superseded, source }
        // `superseded` — THE SUPERSEDED WORDING, the field's whole point;
        // author/date null when the file does not carry them, never invented
    { kind:"comment", id, author, date, initials, text, source }
    { kind:"core-properties", creator, lastModifiedBy, revision, revisionNumber,
      created, modified, title, source:null }

XLSX (COFF-3) confirms with its own kinds (formula-beside-value, hidden
row/column/sheet) and PPTX (COFF-5) with speaker notes; the ENVELOPE — kinds/
items/undetermined/counts, tagged items, IC-1 sources, stated undetermined — is
what is shared and what this proposal fixes.

### Filed with it, from the same as-built code: the pageless text form

I2 1.0.0's `text` is PDF-shaped (`text.pages[]`), and its own residual (the
CONTENT-HTML paragraph in the registry) anticipated that a pageless container
would need "a documented degenerate form" rather than invented pages. A DOCX has
no pages in its bytes (IC-1's `doc-para` rationale), so COFF-4's `text(parts)`
emits, per unit the container actually has:

    { ok:true, container:"docx", document,             // non-empty ¶s, \n-joined
      paragraphs:[ { para, ref:"¶<1-based>", text } ], // instead of pages[]
      undetermined:[ Marker... ],                      // e.g. the sizeGuard
      counts:{ chars, undetermined } }                 //   marker, verbatim

Same keys as the PDF shape wherever the meaning transfers (`document`,
`undetermined`, `counts`), the per-unit list named for what the unit IS. Deleted
(`w:delText`) wording is NOT in the text stream — the text is the document as
served; the superseded wording lives in the envelope where it is attributed.

### Why additive, and why the protocol file anyway

No existing consumer reads `evidentiary` or `text.paragraphs`, `pdf-page` sources
are untouched, and the PDF/HTML suites pin their outputs byte-identical — so this
is additive in the CPDF-4 sense. It is filed here because I2 is STABLE and three
producers build against the envelope concurrently: an unfiled shape is exactly how
two of them would drift apart.

### Status

**PROPOSED, 2026-08-03, from as-built code.** Awaiting FRAMEWORK's response —
FRAMEWORK is dormant, so CONDUCT answers on its behalf IN WRITING per protocol
step 3 (the IC-1 precedent), at COFF-4's integration. The I2 registry-entry
version bump (with IC-1's, per its RESOLUTION: the first landed non-`pdf-page`
producer triggers CHANGING→CHANGED) is CONDUCT's to apply at integration, since
two workers landing concurrently cannot both bump one version line. COFF-3 and
COFF-5 CONFIRM here when they land.

### IC-1 · CHANGING → CHANGED · 2026-08-03 · at COFF-4's integration

The first non-`pdf-page` producer landed: the DOCX registry entry (`docx.mjs`,
COFF-4) emits `{kind:"doc-para", ref, para, run}` sources through I2's LinkRecords.
Per this proposal's RESOLUTION, CONDUCT applies the version bump at integration:
**I2 1.0.0 → 1.1.0 in `INTERFACES.md`** — additive; the `pdf-page` arm is
byte-identical to 1.0.0's `{page, rect}` plus the two required tag fields, and every
existing consumer reads on. CHANGING and CHANGED collapse into one entry because the
landing and the bump are one integration act; nothing was ever built against a
half-changed shape. SETTLED for the sole consumer: FRAMEWORK is dormant and has
nothing to migrate (the change is additive; its recorded 1.0.0 confirmation reads
unchanged on the `pdf-page` arm) — recorded by CONDUCT as proxy, the IC-1 precedent.
COFF-3 (`sheet-cell`) and COFF-5 (`slide-shape`) emit further arms of the SAME
resolved union and need no further protocol act — they CONFIRM here when they land.

### IC-2 · RESPONSES · 2026-08-03

- **FRAMEWORK: `AGREE` — answered on its behalf by CONDUCT, in writing, per
  protocol step 3** (dormant; the IC-1 precedent — recorded as CONDUCT answering
  FOR the area, never as the area agreeing). Grounds from FRAMEWORK's own 1.0.0
  confirmation: (1) the envelope is a NEW top-level sibling field mirroring the
  `links[]`/`counts` pattern FRAMEWORK already consumes — nothing existing is
  reshaped, and C-18.1-style tolerance means a reader that ignores `evidentiary`
  sees 1.0.0; (2) every item carries a required `kind` tag and an IC-1 `source`,
  so the discriminate-don't-guess property FRAMEWORK named as load-bearing holds
  here too; (3) `undetermined[{part, why}]` keeps the failure asymmetry first-class
  — an unreadable part is stated, never silently absent. The pageless
  `text.paragraphs[]` degenerate form filed alongside is accepted on the same
  grounds: a DOCX has no pages in its bytes, and inventing `pages[]` would claim
  what the capture does not hold.

### IC-2 · RESOLUTION · 2026-08-03 · ACCEPTED — and CHANGED in the same act

Sole consumer agreed (by proxy, named above). The implementing item landed in the
same integration (COFF-4), so RESOLUTION and CHANGED collapse as IC-1's did: the
shape is in `docx.mjs` and pinned by `formats-docx.test.mjs`, and the version bump
is carried in **I2 1.1.0** (one bump covers IC-1's union and IC-2's envelope — one
integration, one version line). COFF-3 and COFF-5 CONFIRM the envelope from their
own as-built code when they land, inventing no variants; a drift is a COUNTER here,
not a silent fork. When FRAMEWORK next wakes it may re-open either entry before
building against 1.1.0.

### IC-2 · CONFIRMED by COFF-3 (xlsx) · 2026-08-03

The XLSX entry (`bio-plane/src/formats-xlsx.mjs`, pinned by
`bio-plane/test/formats-xlsx.test.mjs`) emits the ACCEPTED `evidentiary`
envelope from as-built code — same key, same fields
(`container`/`kinds`/`items`/`undetermined`/`counts`), every item carrying the
required `kind` tag and an IC-1 `source` or explicit null. For the record, the
history: COFF-3 and COFF-4 ran concurrently and this worker's initial filing (a
variant keyed `evidence`, with `format`/`metadata` fields) collided with the
accepted one; COFF-4 landed FIRST, so per the first-lander rule the variant was
DELETED before ever reaching main and the xlsx emit was conformed to the
accepted shape — a drift resolved at the protocol file, not a silent fork.

The xlsx kind vocabulary, from code:

    { kind:"formula",      source:{kind:"sheet-cell",ref:"Summary!B14",…},
      formula:"SUM(B2:B13)", value:"4200000" }
        // <f> held BESIDE its cached <v> — two named fields, never collapsed;
        // the TEXT stream carries the value (what the sheet displays), the
        // derivation lives here; value null when the file carries none
    { kind:"hidden-sheet", sheet, state:"hidden"|"veryHidden", source:null }
    { kind:"hidden-rows",  sheet, rows:[…1-based], count, source:null }
    { kind:"hidden-cols",  sheet, cols:[{min,max}], count, source:null }
    { kind:"core-properties", creator, lastModifiedBy, revision, revisionNumber,
      created, modified, title, source:null }
        // the SAME kind, with the SAME fields, DOCX emits — deliberately: the
        // provenance-adjacent metadata is one vocabulary, not a per-format field

The pageless text degenerate form is confirmed too: `text()` emits
`{ ok, container:"xlsx", document, sheets:[{sheet, name, hidden, text,
undetermined}], undetermined, counts }` — the per-unit list named for what the
unit IS (docx's `paragraphs[]`, xlsx's `sheets[]`), hidden sheets included AND
flagged; over the COFF-6 bound the sizeGuard marker is carried VERBATIM inside
`undetermined[]`, exactly as docx.mjs carries it. Negative controls re-run
against the conformed shape and recorded in the suite's NEGATIVE CONTROL line.
No variant remains; COFF-5 confirms next.
