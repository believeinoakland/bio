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
### IC-2 · CONFIRM · 2026-08-03 · COFF-5 (PPTX), from as-built code

The PPTX entry (`bio-plane/src/pptx.mjs`, pinned by `formats-pptx.test.mjs`)
CONFIRMS the accepted envelope exactly as `docx.mjs` carries it — same top-level
`evidentiary` sibling on the `ok:true` structure object, same
`{container, kinds[], items[], undetermined[{part, why}], counts}` carriage,
every item with the required `kind` tag and an IC-1 `source` (here the
`slide-shape` arm) or null, docProps metadata as the same
`{kind:"core-properties", ..., source:null}` item. No variant filed. Its kinds,
from code:

    { kind:"speaker-notes", slide:<1-based | null when the deck order is
      unreadable — stated, never numbered off filenames>, part, text,
      source:<slide-shape ref | null> }   // DEC-5: the notes are routinely
                                          // more candid than the slide
    { kind:"core-properties", ... }       // byte-for-byte the docx item shape

The pageless text degenerate form is likewise CONFIRMED with the per-unit list
named for what the unit IS: `text.slides[]` (`{slide, ref:"slide <n>", part,
text}`) — and one property the DISTINCTION rule of COFF-5 adds on top:
speaker notes are a SEPARATE unit list `text.speakerNotes[]` with their own
refs (`"slide <n> (notes)"`) and their own `counts.notesChars`, never merged
into `document` (the deck as presented) or any slide's text; the suite's
negative control breaks exactly that merge and fails naming it.

### IC-2 · CONFIRM · 2026-08-03 · COFF-7 (PPTX hidden slides) — the kind vocabulary grows, the envelope does not change shape

`pptx.mjs` adds ONE kind to the confirmed envelope: `{ kind:"hidden-slide", slide:<1-based | null when the deck order is unreadable>, part, source:<slide-shape ref | null> }` — the pptx analogue of xlsx's `hidden-sheet` (DEC-5): a slide whose bytes declare `show="0"` (read from BOTH the slide part's `<p:sld>` root, ECMA-376's home for CT_Slide@show, and the `sldIdLst` entry) is invisible in every presented form, still FULLY extracted (text, notes, links), and flagged here and in `text()`'s units, which gain `hidden` on `slides[]`/`speakerNotes[]` exactly as xlsx's `sheets[]` carry it. Same `{container, kinds[], items[], undetermined[], counts}` carriage; no field of the envelope itself changed.

## IC-3 · I3: `NOT_PROBLEMS` → `NOT_INQUIRIES` on `op=dispose` · PROPOSED, ACCEPTED AND CHANGED 2026-08-03 (one act, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-10's type collapse renames
  `op=dispose`'s refusal reason `NOT_PROBLEMS` to `NOT_INQUIRIES` (DATA-MODEL §2.7
  change 13 — the member-facing vocabulary is inquiry now). **This is a RENAME of an
  existing wire string, i.e. breaking for any consumer pinning it**, which is why it
  gets a protocol entry rather than riding an additive bump.
- **Consumers:** UI (dormant). CONDUCT answers on its behalf per step 3, in writing,
  naming that it did so: `AGREE` — measured, not assumed: the UI's dispose path reads
  the refusal's `reason` for display and pins no `NOT_PROBLEMS` literal in a
  conditional; UI-10 (queued, now runnable) is the vocabulary catch-up item and
  carries the rename's surface half. If a pinned literal surfaces when UI-10 runs,
  it is corrected there, never exempted.
- **Version:** I3 1.6.0 → **2.0.0** in `INTERFACES.md` — major, because a renamed
  reason is a break by definition even when the measured consumer impact is nil;
  calling it additive would teach the registry to lie.

## IC-4 · I3: `op=memberlist`'s answer becomes viewer-dependent · PROPOSED, ACCEPTED AND CHANGED 2026-08-03 (one act, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-29/D-157 — a non-administrator
  caller's roster rows no longer carry the `cover` key at all; an administrator's
  view is unchanged. **A field disappearing for a class of callers is a BREAK by
  IC-3's own standard**, whatever the measured impact, so it gets a protocol row.
- **Consumers:** UI (dormant). CONDUCT answers on its behalf per step 3, in writing,
  naming that it did so: `AGREE` — impact MEASURED nil by the implementer
  (`rosterRow` falls through `m.cover || m.name || ""`; `setup.mjs` signs in as the
  administrator, whose view is unchanged). If a pinned `cover` read surfaces in a
  later UI item it is corrected there, never exempted.
- **Version:** I3 2.0.0 → **3.0.0** in `INTERFACES.md` — major, same reasoning as
  IC-3: an additive label here would teach the registry to lie, and this registry's
  honesty is the product.

## IC-5 · I3: fifteen read ops become viewer-dependent (the D-15 sweep) · PROPOSED, ACCEPTED AND CHANGED 2026-08-03 (one act, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-30 — op=dangling, tasks, queue,
  reading, readingref, resolutions, concerns, connections, instance, exceptions,
  audit, searchindexcheck, projectownerarith, strengthbarof (and excludedby, gated at
  REC-14's own landing) now answer by the viewer's position: subject rows about
  invisible bundles are withheld without a count; back-references are redacted to
  null while the row's record facts stand. The DO envelope's `ms` field is REMOVED.
  For machine credentials, administrators and participants the answers are
  byte-identical; **the break is for a member session reading about a project it was
  never invited to — which was the leak.**
- **Consumers:** UI (dormant). CONDUCT answers per step 3, in writing, naming that it
  did so: `AGREE` — the UI reads these answers for display and rebuilds no gated
  join; the one UI-side walk this class feeds (reverseRefs) is already scheduled for
  deletion by UI-21 against op=backlinks. Nothing read `ms` (measured across five
  trees).
- **Version:** I3 3.0.0 → **4.0.0** in `INTERFACES.md` — major, the IC-3/IC-4
  standard: answers changing for a class of callers is a break however desirable.

## IC-6 · I3: `op=inquirydivide` + the act shape's `prompt` field · PROPOSED, ACCEPTED AND CHANGED 2026-08-03 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-16 adds one mutating op
  (`op=inquirydivide`) and one additive field on the affordances act shape —
  `prompt`, the plane-published divide wording (DEC-29(b): the disclosure sentence
  travels WITH the control, so no surface authors its own copy). No field removed,
  no wire string renamed; a consumer ignoring `prompt` sees the prior shape.
- **Consumers:** UI (dormant). CONDUCT answers per step 3, in writing, naming that
  it did so: `AGREE` — additive by inspection, and the prompt mechanism is DEC-8's
  own pattern (plane-sourced wording) extended to pre-act disclosure.
- **Version:** I3 4.0.0 → **4.1.0** in `INTERFACES.md` — minor, genuinely additive.

## IC-7 · I3: the task verbs refuse machine credentials · PROPOSED, ACCEPTED AND CHANGED 2026-08-03 (one act, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-28/D-151 — `probe` is removed
  from `taskforward`/`taskresolve`'s classes, and two new named refusals
  (`MACHINE_CANNOT_FORWARD`, `MACHINE_CANNOT_RESOLVE`) now refuse every
  machine-credential actor (`token:*`) on both verbs, including `MEMBER_TOKEN` and
  `ADMIN_TOKEN` calls that were previously admitted. **BREAKING for machine
  callers**; no session is affected.
- **Consumers:** UI (dormant). CONDUCT answers per step 3, in writing, naming that
  it did so: `AGREE` — measured nil (`app.html` drives both verbs from a signed-in
  session only; `setup.mjs` calls neither).
- **Version:** I3 4.1.0 → **5.0.0** in `INTERFACES.md` — major, the IC-3 standard.

## IC-8 · I3: `op=reevaluations` + the acts' `reevaluation.raised` echo · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-17 adds one gated read
  (`op=reevaluations`) and an additive `reevaluation` block on four acts' answers
  (dispose-defer, reopen, inquirydivide, publish) echoing the obligation each act
  just raised. `op=dispose` and `op=inquirydivide` additionally gain the `CITED`
  refusal on a cited inquiry — a NEW refusal on existing ops, but one no landed
  consumer could trigger (no fixture or surface disposes a cited inquiry), so
  recorded additive with that measurement stated rather than assumed.
- **Consumers:** UI (dormant). CONDUCT answers per step 3, in writing, naming that
  it did so: `AGREE` — additive by inspection plus the measured nil on CITED.
- **Version:** I3 5.0.0 → **5.1.0** in `INTERFACES.md`.

## IC-9 · I3: the credential-free published read (`op=publishedcase`, `op=publishedbytes`, the container zip) · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-22 adds two `classes: null`
  read ops serving the PUBLISHED PROJECTION ONLY (by id/edition/hash; bytes by hash
  gated on `published_shas`; the deterministic container zip addressed by the
  manifest's own sha, `format=zip`), plus `bio-case-container/1` gaining capture
  bytes in the file manifest (additive; moves manifest_sha for capture-bearing
  cases only — no consumer outside this item yet, UI-18 is first).
- **Consumers:** UI (dormant). CONDUCT answers per step 3, in writing, naming that
  it did so: `AGREE` — additive; the public surface UI-18 renders is exactly this.
- **Version:** I3 5.1.0 → **5.2.0** in `INTERFACES.md`.

## IC-10 · I3: `op=inquirystrength` · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-34 adds one gated read
  (admin/member/probe) returning the derived pair as two axis objects verbatim from
  the derivation, with REC-30's postures plus a prose sweep. Additive; no existing
  op changed.
- **Consumers:** UI (dormant). CONDUCT answers per step 3, in writing, naming that
  it did so: `AGREE` — UI-11's `inquiryPair()` seam was written for exactly this
  answer and consumes it with no reshape; UI-12 is its next consumer.
- **Version:** I3 5.2.0 → **5.3.0** in `INTERFACES.md`.

---

## IC-11 · I3/I5: `GRADE_SOURCES` gains `capture`, and `op=earnedbasis` · PROPOSED 2026-08-04 (REC-18)

- **Interfaces:** I3 (plane → UI) and I5 (the store schema).
- **Proposer:** `rec18-agent` (RECORD), 2026-08-04, from REC-18 / DATA-MODEL D1(b).
- **Owner to land it:** `RECORD` (landed in the worktree; CONDUCT integrates).
- **Consumers to answer:** `UI` — and it is **NOT dormant**: UI-12 is running
  concurrently on `civicos-ui` ground as this is written. That is why this entry is
  PROPOSED and not recorded post-hoc as accepted, unlike IC-3..IC-10.

### The change, in three parts

**1. `GRADE_SOURCES` gains a fifth member, `capture`** (`bio-checks.mjs`). This is the
one part that is NOT safely additive, and the guard that says so is `civicos-ui`'s own:
`check-semantics.mjs` mirrors the catalog's five leg vocabularies into `app.html` and
fails in BOTH directions, so as of this change it reports, correctly:

```
FAIL: GRADE_SOURCES has drifted from the catalog.
       catalog:  ["resolution","testimony","hunch","inherited","capture"]
       app.html: ["resolution","testimony","hunch","inherited"]
FAIL: GRADE_SOURCE_WORD has no member-facing word for 'capture', which the catalog declares
```

**That failure is the mechanism working**, not a defect: the guard exists precisely so a
new grade source cannot reach a member surface as a blank sentence. The migration is two
lines in `app.html` — the array, and a `GRADE_SOURCE_WORD` entry — and it is UI's to
make, not RECORD's.

**2. `op=earnedbasis`**, a new gated read (admin/member/probe, non-mutating). Additive;
no existing op's shape changed. It answers, for one inquiry, what each candidate basis
target EARNS: `{ subject_entity, subject_label, earned: { connection: {...}, capture:
{...} } }`.

**3. `bundles.inquiry_subject_entity`** (I5), one nullable projection column, plus the
optional `subject_entity` frontmatter scalar on an inquiry. Additive; no table added, no
table re-keyed, nothing in `schema.mjs`'s literal touched.

### Why `capture` is required rather than convenient

Before it, all four sources were sources for a CONNECTION grade, and the capture axis
had no honest name to give. A graded leg must state a `grade_source` (REC-11), so a
capture-axis leg had to borrow a connection word — and nothing checked its value against
the record. The measured consequence: a member could type capture grade **A** beside a
document, against the landed doctrine that grade A needs a chain-of-custody web archive
this plane cannot produce and does not claim (`CAPTURE-FIDELITY.md`; RECONCILED R2-e /
R2-g). REC-18's own `accepts-when` requires that "a leg's capture grade comes from the
capture record and is never authored", and that sentence has no enforcement point
without a source name that means *earned from the capture record*.

### What UI must do, and what it must NOT

- **Do:** add `"capture"` to `GRADE_SOURCES` in `app.html` and give it a
  `GRADE_SOURCE_WORD`. The word should say what the grade IS — a fact about how the
  bytes reached us, held by the record — and must not read as a member's assertion, or
  it collapses into `testimony`'s meaning. A suggestion, not a ruling, since the
  member-facing wording is UI's: *"from the capture record"*.
- **Do NOT** render `capture` and `resolution` as one "earned" badge. They are earned
  from two different things over two different populations, and DEC-21 is that the axes
  are never composed. A surface that showed one word for both would be R2-e's defect
  wearing new clothes.

### Consumer responses

- `UI`: *pending.* **Silence is not consent** (step 2). UI-12 is live and can answer.
- Every other area: NOT-AFFECTED — no other consumer reads the leg vocabularies.

### Version, when CONDUCT resolves it

I3 5.3.0 → **5.4.0** (additive op + a widened published vocabulary); I5 gains one
nullable column, so its version moves by its own additive rule. RECORD does not bump
`INTERFACES.md` itself: this entry is the proposal, and the registry edit is CONDUCT's
at integration.
