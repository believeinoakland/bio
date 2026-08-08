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

### IC-11 · RESPONSES · 2026-08-04

- **UI: `AGREE` — answered AND migrated in one act at REC-18's integration.** UI was
  live but between workers at integration time, so CONDUCT (holding main, where the
  guard fired) applied the consumer's own two-line migration: `capture` joins the
  guarded `GRADE_SOURCES` block with a dated comment, and `GRADE_SOURCE_WORD` gains
  the member-facing sentence *"earned from the record's own capture of this
  document"* — value language stating HOW, never how-credible, matching the other
  four entries' register. `check-semantics.mjs` green in both directions after; the
  guard firing and then passing is the mechanism the proposer named, working.
- The `op=earnedbasis` and `repairs` halves are additive and taken without comment.

### IC-11 · RESOLUTION · 2026-08-04 · ACCEPTED AND CHANGED

Landed and migrated in the same integration; SETTLED for the sole consumer (the
migration is the two lines above, asserted by its own guard). Version bumps: **I3
5.3.0 → 5.4.0** (additive: `op=earnedbasis`, the `BASIS_REFUSED` `repairs` field, the
`SUBJECT_REFUSED` refusal) and the catalog version already carries the vocabulary
change (REC-18 bumped it in-code per the REC-14/REC-23 precedent).

---

## IC-12 · I3 `op=cite`: the citing object may be a QUESTION · PROPOSED

- **Interface:** I3 (plane → UI, the op contracts), currently **5.4.0 STABLE**
- **Proposer:** session rec37-agent, 2026-08-04, from `QUEUE.md` REC-37 (UI-20's
  measured gap)
- **Owner to land it:** `RECORD` (I3's owner; the change is landed in this worker)
- **Consumers to answer:** `UI` (live — UI-20 built `op=cite`'s only caller and
  UI-21's finder is next), `DIST` (the installer's served surfaces)

### The change, and it is ADDITIVE AND PERMISSIVE throughout

`op=cite` accepted a PROJECT as the citing object and INFORMATION as every
member. It now also accepts an INQUIRY as the citing object, and on that arm a
member may be information OR another inquiry. Nothing previously admitted is now
refused, and no existing refusal reason is renamed.

- **New optional parameter `role`** — required on the inquiry arm only, one of
  the catalog's `BASIS_ROLES` (`supports`, `cuts_against`). A case-arm caller
  that never heard of it is byte-identical.
- **Six new refusal reasons, all of them on inputs that used to be refused
  earlier by a different arm:** `NOT_CITABLE` (a member on the question arm that
  is neither material nor a question — the case arm keeps `NOT_INFORMATION`
  unchanged), `NO_ROLE`, `BAD_ROLE`, `ROLE_NOT_APPLICABLE`, and — travelling
  back from `op=promote`, where they already lived — `SELF_BASIS` and
  `BASIS_CYCLE`, each naming the FULL path.
- **`NOT_A_PROJECT` KEEPS ITS NAME and fires strictly less often**: only for a
  citing object that is neither a case nor a question. Its `detail` is rewritten
  to say so. Renaming it was considered and rejected — see below.
- **New success fields on the inquiry arm only:** `citingObjectType`, `role`,
  `legs[]` (target, role, grade, grade_axis, grade_source, why), `gradesFilled`,
  `gradesUndetermined`. A reader that ignores them sees the prior shape.
- **`op=affordances`**: `cite` is published for `["information","project",
  "inquiry"]`, its label becomes type-neutral (*"Cite material into a case or a
  question"*), and `VOCABULARIES` gains `basis_roles`, imported from the catalog
  function that enforces the set.
- **No capability change.** `cite` still needs `contribute`; no new token.
- **No I5 change.** No table, no column, no index. The leg lands on
  `inquiry_basis` only as REC-11's promote-projection of the document.

### Why the two reason codes did NOT move

`RECONCILED.md` §3.1 (UI-20) says plainly that "`NOT_INFORMATION` is the wrong
check now", and the obvious reading is a rename. It was rejected on three
grounds, and the judgement is CONDUCT's to overturn cheaply (one string per arm
plus the suites that pin them):

1. **Measured consumer impact of keeping them: nil.** No consumer matches on
   either literal anywhere — the only occurrences in `civicos-ui` are prose in
   comments, and `cite-act.test.mjs` asserts that the surface names no refusal
   code of its own.
2. **A renamed wire string is a BREAK by this registry's own definition**, and
   I3 2.0.0 is the precedent that recorded exactly that for `NOT_PROBLEMS`. A
   breaking bump would make every consumer re-verify a contract that is
   otherwise purely permissive.
3. **What a member reads is `detail`**, and DEC-8 makes the plane's sentence the
   thing the surface renders. Both sentences are rewritten to say precisely what
   is now refused, so the honesty budget is spent where it is met.

The one place a rename WOULD have been dishonest to avoid is the question arm's
member check — a refusal named `NOT_INFORMATION` firing where an inquiry IS
admissible would be the refusal lying about itself — so that arm gets its own
new reason, `NOT_CITABLE`, rather than reusing it.

### What UI must migrate, and it is NOT a break

REC-37 landed with **no edit to `app.html`**, which is the item's own acceptance
clause, and `civicos-ui/test/cite-act.test.mjs` was driven against the widened
plane to prove it. That run MEASURED two places where the surface has not caught
up. Neither is a defect in what landed and neither breaks anything that worked:

1. **`citeCandidates()` filters the record's `object_type` to `project`**
   (`app.html` ~:5474), so a question is never OFFERED as a citing object even
   though the plane now publishes `cite` on it. The comment above it — "the ONE
   thing this surface knows that the plane does not publish" — is now stale in
   its reasoning: `op=affordances` publishes `cite` on all three types and still
   does not separate the two ENDS of the act, so the filter is still doing real
   work for the information end; what it must stop excluding is the inquiry end.
2. **The cite flow sends no `role`**, so a cite driven onto a question reaches
   the plane and is refused `NO_ROLE`. The refusal renders in the plane's own
   words and the harness asserts it, so DEC-8 holds and nothing is silently
   broken — but a member cannot complete the act from the surface until the flow
   offers the two published roles. The vocabulary is published
   (`vocabularies.basis_roles`); no surface-side copy is needed or permitted.

And the standing note from IC-11 applies again here, in the other direction: the
flow must FILL the leg from `op=earnedbasis` and must NOT offer a grade control.
The plane already fills it — `op=cite` returns `legs[]` with the grade the record
earned and `null` where it earned nothing — so the surface renders what it
received.

### Consumer responses

- `UI`: *pending.* **Silence is not consent** (step 2). The two migration items
  above are named precisely and are additive.
- `DIST`: expected NOT-AFFECTED — no served surface calls `op=cite`.
- Every other area: NOT-AFFECTED.

### Version, when CONDUCT resolves it

I3 5.4.0 → **5.5.0** (additive: one optional parameter, six new refusal reasons
on newly-legal inputs, new success fields, a widened published act and one new
published vocabulary; `NOT_A_PROJECT` narrows permissively and keeps its name).
I5 unchanged — no schema change of any kind. RECORD does not bump
`INTERFACES.md` itself: this entry is the proposal, and the registry edit is
CONDUCT's at integration.

### IC-12 · RESPONSES · 2026-08-04

- **UI: `AGREE` — answered by CONDUCT for the area** (its one live session, UI-16,
  runs on the project-workspace region and does not own the cite surface; the
  IC-1/IC-11 step-3 mechanics, named as proxy). Grounds: purely additive on the wire
  (new arm, new refusals, no renamed string — the worker's own NOT_A_PROJECT
  restraint is the I3 2.0.0 standard applied); UI-20's surface consumed the widened
  act with zero edits, byte-identical app.html, which is the acceptance measured
  rather than promised. The two additive surface items ride UI-21's scope.

### IC-12 · RESOLUTION · 2026-08-04 · ACCEPTED AND CHANGED

Landed at integration; I3 5.4.0 → **5.5.0**. The reason-code judgement (keep the old
names, add NOT_CITABLE where reuse would lie) stands with its recorded one-string
reversal if a later reader wants RECONCILED §3.1's rename literally.

## IC-13 · I3: the intent vocabularies published · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-35 — `vocabularies` gains
  `entity_kinds`, `relation_kinds`, `stage_requiredness` (each the enforcement's own
  array, one place). No existing shape or string changed.
- **Consumers:** UI. CONDUCT answers per the IC-12 mechanics, naming the proxy: `AGREE`
  — the consumer was written for the published form (UI-13) and took it with zero
  executable-byte change, measured.
- **Version:** I3 5.5.0 → **5.6.0** in `INTERFACES.md`.

## IC-14 · I3: the action loop's surface · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-24 — op=actionmove and
  op=actioncorrespond (contribute; machine refused by shape), the derived `action`
  block on op=projection's single-bundle answer (basis, correspondence, clock_next,
  clock_overdue + clock_overdue_cached, as_of, consequence, responses), and the new
  refusals (RESPONDS_TO_REFUSED, MACHINE_CANNOT_MOVE_ACTION/CORRESPOND, the
  request_for_comment specificity refusal). Additive; no existing string changed.
- **Consumers:** UI. CONDUCT answers per the IC-12 mechanics, naming the proxy:
  `AGREE` — UI-19 is the written consumer and renders unproven as STATED, never a
  grade (DEC-14's clause riding the item).
- **Version:** I3 5.6.0 → **5.7.0** in `INTERFACES.md`.

## IC-15 · I3: `capture_acts` + two vocabularies · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-38 — op=affordances gains a
  top-level `capture_acts` block (label/needs/mode/rung for the capture-directed
  acts, decorated by the same one function; `weight: null` stated), and
  `vocabularies` gains `action_basis_kinds` + `correspondence_directions` by import.
  Additive; nothing existing renamed or reshaped.
- **Consumers:** UI. CONDUCT answers per the IC-12 mechanics, naming the proxy:
  `AGREE` — UI-19's consumers verified lighting up off the real export with no UI
  edit; UI-24's rider consumes the attest label next.
- **Version:** I3 5.7.0 → **5.8.0** in `INTERFACES.md`.

## IC-16 · I3: `op=readingname` · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-36 — one new member-class read
  (`op=readingname`, entity= → the documents naming that subject through the
  term-normalised alias join), gated in the stronger row-withheld posture. Additive.
- **Consumers:** UI. CONDUCT answers per the IC-12 mechanics, naming the proxy:
  `AGREE` — UI-26 is the written consumer (queued); UI-13's stated limit narrows
  honestly when it lands.
- **Version:** I3 5.8.0 → **5.9.0** in `INTERFACES.md`.

## IC-17 · I3: login `detail` sentences + `vocabularies.resolutions` · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-39 — both login refusals gain
  `detail` from one constant (codes untouched; the NO_SUCH_ROLE sentence is
  deliberately arm-ambiguous so revocation stays unannounced), and `vocabularies`
  gains `resolutions` by export-from-the-catalog (three readers, one array).
  Additive.
- **Consumers:** UI. CONDUCT answers per the IC-12 mechanics, naming the proxy:
  `AGREE` — `teach()` renders the new sentences with no edit; the two suite riders
  ride UI-25's batch.
- **Version:** I3 5.9.0 → **5.10.0** in `INTERFACES.md`.

## IC-18 · I3: the `daemon` class + `op=acquire`'s arm confinement · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-33/DEC-37 — a fourth credential
  class (`daemon`, from DAEMON_TOKEN) admitted to exactly `op=monitor` and
  `op=acquire`'s archive arm, with a new named refusal `NOT_PERMITTED` when a daemon
  credential reaches acquire's DIRECT arm. Additive for every existing caller: no
  class loses reach, no string is renamed, and the ADMIN_TOKEN fallback keeps every
  installed instance working.
- **Consumers:** UI. CONDUCT answers per the IC-12 mechanics, naming the proxy:
  `AGREE` — no surface authenticates as a daemon; the class is the unattended path.
- **Version:** I3 5.10.0 → **5.11.0** in `INTERFACES.md`.

## IC-19 · I3: `op=inquiryground` · PROPOSED, ACCEPTED AND CHANGED 2026-08-04 (one act, additive, recorded post-hoc from as-built code)

- **Interface:** I3 (plane → UI). **The change:** REC-45 — one new mutating op
  (`op=inquiryground`, contribute; authors/edits the grounds partition with
  `asserted_by`/`at` server-stamped and caller values discarded), published as a
  thirteenth act, and the **second** act to carry a `prompt` (REC-16's mechanism).
  Additive; nothing renamed or reshaped.
- **Consumers:** UI. CONDUCT answers per the IC-12 mechanics, naming the proxy:
  `AGREE` — UI-27 is the written consumer and builds its elicitation against this act
  rather than hand-writing frontmatter, which is why it was sequenced first.
- **Version:** I3 5.11.0 → **5.12.0** in `INTERFACES.md`.

---

## IC-21 · I3: `op=publish` requires an authored bias acknowledgement · PROPOSED, RESPONSES, ACCEPTED, CHANGING, CHANGED AND SETTLED 2026-08-04 (REC-47)

- **Interface:** I3 (plane → UI), **6.0.0 STABLE** → **7.0.0**
- **Proposer and owner to land it:** `RECORD` (session rec47-agent), from REC-47 / DEC-46 (a)
- **Consumers to answer per `INTERFACES.md`:** `UI`, `DIST`, and every content area
  that needs its work reachable

**PROPOSED.** `op=publish` gains a REQUIRED parameter — the authored bias acknowledgement
the case was produced under — plus two named refusals, `NO_BIAS_ACKNOWLEDGEMENT` and
`BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD`, and extends `CASE_ASSERTION_DIVERGED`. It is a
BREAK by definition: a caller that publishes today is refused tomorrow. I5 is additive
(one column on `published_cases`, beside scope and completeness); the container format
moves `bio-case-container/2` → `/3` so a reader can tell "declared nothing" from
"predates the field".

**RESPONSES.** UI is DORMANT for this change and **CONDUCT ANSWERED ON ITS BEHALF, IN
WRITING, NAMING THAT IT DID SO** (the protocol's step 3, not a formality). The proxy
answer is ACCEPT, on three grounds. (i) DEC-46 (a) is a ruling already made and this is
its enactment, not a proposal to weigh. (ii) The measured impact on the surface is a
publish path that must now collect one authored sentence per edition — real work, but
work the completeness statement's own path already does beside it, so no new shape is
imposed on the UI. (iii) Refusing it would leave a published case unable to carry the
bias it was produced under, which DEC-20 requires to TRAVEL with every published case.
CONDUCT is not the UI area and this answer is a proxy: a UI item that finds the surface
cost materially higher than stated should say so and reopen, and that is not a
concession — it is the reason the proxy is recorded rather than assumed.

**RESOLUTION: ACCEPTED.** MAJOR, on IC-3's settled reasoning that recording a break as
additive because nobody happened to be reading it would teach this registry to lie.

**CHANGING → CHANGED → SETTLED 2026-08-04**, landed on `main` by CONDUCT with the battery
at 98/98 (5567), hygiene 650, `--strict` exit 0 at 130/130 ops and 272 arms.

## IC-20 · I3: `op=bootstrap` stops answering `roles`, and `op=login`'s two refusal codes become one · PROPOSED, RESPONSES, ACCEPTED, CHANGING, CHANGED AND SETTLED 2026-08-05 (REC-41)

- **Interface:** I3 (plane → UI), **5.12.0 STABLE**
- **Proposer and owner to land it:** `RECORD` (session rec41-agent), from REC-41 / D-188
- **Consumers to answer per `INTERFACES.md`:** `UI`, `DIST`, and every content area
  that needs its work reachable

### 1 · PROPOSED

**Two changes, and they travel together because closing the first is what forces
the second. Both are BREAKING.**

**(a) `op=bootstrap` stops publishing `roles`.** The op is `classes: null` — no
token, no session, any caller on the internet. It exists to answer whether the
instance has been claimed and whether a live bootstrap credential exists to claim
it with; `gate-reads.test.mjs` has always described it in exactly those words. It
ALSO answered `roles`: every role holding a credential, each with the date its
password was last set. That is a roster plus a set of per-person dates, handed to
a stranger in one request. The field is REMOVED — not blanked, not emptied, not
gated: the `SELECT` against `credentials` is gone, so there is no roster in the
answer for a later refactor to re-expose, and a caller cannot tell from the shape
that one was ever computed. Remaining keys: `ok`, `service`, `version`,
`bootstrapConfigured`, `claimed`, `rearmed`, `consumedAt`.

`consumedAt` STAYS and the distinction is stated so it is not swept away next
time: it is the instant this INSTANCE was claimed — one fact about this copy of
the software, naming nobody, and there is one of it however many members the
group has. It is not a per-person password date.

**(b) `op=login`'s `NO_SUCH_ROLE` and `BAD_PASSWORD` are replaced by one code,
`SIGN_IN_REFUSED`, carrying one sentence.** REC-39 kept the two distinguishable
on ONE recorded ground: that `op=bootstrap` already handed any stranger the whole
roster, "more completely and more cheaply than login probing could ever assemble
it", so collapsing them would defend nothing. Change (a) destroys that ground. The
decision was therefore re-made rather than inherited, in the same turn, and
reversed. Two wire strings a caller may match on are gone.

### 2 · WHY, AND THE MEASUREMENTS IT RESTS ON

**The consumer impact of (a) is NIL, and it was RE-MEASURED for this proposal
rather than taken from the queue item** (a claim in an item is a claim, not a
measurement). As of 2026-08-05, against source:

| Caller | Calls `op=bootstrap`? | Reads `roles`? |
| --- | --- | --- |
| `bio-plane/src/setup.mjs` | yes, three times | **no** — `version`, `claimed`, `bootstrapConfigured`, `rearmed`, `consumedAt` |
| `newgroup/src/index.mjs` | yes, twice (`:364` `verifyUpdate`, `:631` the pre-update version probe) | **no** — `version` only |
| `civicos-ui/**` | **no** — `grep -rani bootstrap civicos-ui` returns one line of prose in `NEXT_SESSION_PROMPT.md` | n/a |
| the battery | `bootstrap.test.mjs`, `installer.test.mjs`, `browse.test.mjs` | **no** — no assertion anywhere named the field |

**ONE CORRECTION TO THE ITEM'S PREMISE, recorded because the register should not
carry an inaccuracy even a harmless one:** REC-41 and D-188 both say "not
`newgroup`". `newgroup` IS a consumer of `op=bootstrap` — it is the installer's
version probe and it calls the op twice. It is not a consumer of `roles`. The
premise is right about the field and loose about the op, and the distinction
matters here because (a) leaves every one of `newgroup`'s reads untouched.

**A near-consumer worth naming, because it is the shape that would have made this
look consumed:** `setup.mjs`'s panel carried a row labelled "Roles with
passwords" whose value has always been filled from the SIGNED-IN role, never from
this field. A label describing `roles` over a value that never came from it.
Corrected to "Signed in as" in the same turn rather than deleted — a member
seeing which identity the session holds is the point of the row.

**Why (b) follows, measured rather than preferred:**

1. `op=login` is `classes: null` and carries **no rate limit of any kind**. The
   only unauthenticated op in this plane that meters a caller is `op=knock`. With
   distinct codes, "does this role hold a credential" is an unmetered anonymous
   oracle answering one guess per request, forever. Closing the wholesale route
   and leaving that open would disclose the same set of facts more slowly, and
   let this register record a closure the plane does not deliver.
2. **This plane already decided this question three times and always the other
   way.** `#INVITE_MISS`: a spent invitation and one that never existed answer
   byte-identically, "the security property and not tidiness". `NOT_PUBLISHED`:
   never-published, no-such-edition and never-existed are "one answer here".
   And `NO_SUCH_ROLE` already collapsed its OWN two arms — revoked, and never
   registered. Login was the last unauthenticated identity probe still
   separating its outcomes, and only because of a disclosure that no longer
   exists.
3. **The distinction had exactly one consumer and the consumer was part of the
   defect.** `setup.mjs` branched on `NO_SUCH_ROLE` to render "No member by that
   name has set a password on this copy yet" — a paraphrase stating the
   disclosure more plainly than the plane did, to an anonymous visitor, on the
   instance's own front door. It now renders the plane's `detail` (DEC-8).
   `civicos-ui` does not branch on the code: `signIn` hands the refusal to
   `teach()`, so **no UI edit is owed by this change**.

**AND A THIRD THING THE PROPOSAL FOUND WHILE BUILDING IT, which is part of (b)
rather than extra scope:** identical words are not an identical answer if one
arrives in a millisecond and the other in a hundred. The arms that refuse without
checking a password returned immediately while a wrong password ran PBKDF2 at
100,000 iterations. Measured: **6.7 ms versus 0.6 ms, an eleven-fold gap** — so
the live roster was enumerable with a stopwatch and any password at all, which is
exactly what (a) removes. Every such arm now pays an equivalent derivation
first. Stated without overclaim: this equalises the dominant cost and is **not**
a proof of constant time.

**WHAT IS NOT CLAIMED BY EITHER CHANGE**, because overclaiming a fix is the
failure this project exists to refuse. Member identity is not secret after this.
`op=publishedcase` is `classes: null` and publishes `attestor.member` on every
ratified finding, deliberately — a signature that does not name its signer is not
a signature. What closes is the general oracle over everyone who holds a
credential, including the members who have never published anything and whom
nothing else names.

### 3 · RESPONSES

- **`UI`: `AGREE` — answered on its behalf by CONDUCT, IN WRITING, per protocol
  step 3, and recorded as CONDUCT answering FOR the area and never as the area
  agreeing.** UI is DORMANT for this purpose: the live `civicos-ui` session is
  UI-29, whose claim is scoped to the published-case rendering surface and which
  cannot answer for the interface. The grounds are drawn from the measurement
  above rather than invented: `civicos-ui` **never calls `op=bootstrap`**, so (a)
  cannot reach it; and its sign-in gate renders the plane's refusal through
  `teach()` rather than matching on a reason string (UI-23's seam, DEC-8), so (b)
  reaches it as different prose in an element that already displays whatever the
  plane sent. Nothing in the UI migrates.
- **`DIST`: `NOT-AFFECTED`, answered on its behalf by CONDUCT, in writing, same
  standing.** The installer's served surfaces read `version` from this op and
  nothing else. ONE THING DIST MUST KNOW AND IT IS NOT A MIGRATION: the signed
  artifact at `newgroup/src/release.mjs` embeds a BUNDLED COPY of the previous
  `setup.mjs`, including the `NO_SUCH_ROLE` branch and the old panel label. It is
  regenerated at the next release cut and was deliberately NOT hand-edited by
  this item — a signed artifact is not patched in place.
- **Content areas: `NOT-AFFECTED`**, answered on their behalf by CONDUCT in
  writing. No content area reaches either op; both are pre-auth surfaces.

### 4 · RESOLUTION

**ACCEPTED 2026-08-05.** All responses AGREE or NOT-AFFECTED; no counter. The
proxy answers were given by CONDUCT for dormant/unavailable areas and are named
as such above.

### 5 · CHANGING → CHANGED

Landed by `RECORD` in one turn with the measurements above. **I3 5.12.0 →
6.0.0.**

**IT IS A MAJOR BUMP AND THE NIL CONSUMER IMPACT DOES NOT MAKE IT A MINOR ONE.**
Removing a published field from an op's answer is a break by definition, and so
is retiring two refusal reason codes. IC-3 settled this reasoning for a single
renamed wire string with impact equally nil: recording it as additive because
nobody happened to be reading it "would teach this registry to lie". A registry
whose version numbers track who complained rather than what changed cannot be
used to reason about compatibility at all.

### 6 · SETTLED

- **`UI`** — nothing to migrate; measured, not assumed (no call site for
  `op=bootstrap`; no reason-code match in the sign-in gate).
- **`DIST`** — nothing to migrate; the embedded `setup.mjs` refreshes at the next
  release cut.
- **Content areas** — nothing to migrate.
- **The battery** — `members.test.mjs` carries the structural sweep over the
  whole unauthenticated response and the four-arm refusal equality;
  `bootstrap.test.mjs`'s `BAD_PASSWORD` pin is corrected with a dated reason
  rather than exempted. Three negative controls RUN and recorded in
  `members.test.mjs`'s own `NEGATIVE CONTROL:` line.

**Returns to STABLE at 6.0.0.**

## IC-22 · I3: `op=publishedcase` stops answering `opened` · PROPOSED, RESPONSES, ACCEPTED, CHANGING, CHANGED AND SETTLED 2026-08-05 (UI-40)

- **Interface:** I3 (plane → UI), **7.0.0 STABLE**
- **Proposer:** `UI` (session ui40-agent), from QUEUE.md UI-40, routed out of UI-35's sweep
- **Owner of I3:** `RECORD`. The change is ONE key in one return and is landed with this
  proposal because UI-40 routes it that way; nothing else inside `bio-plane/**` is opened.
- **Consumers to answer per `INTERFACES.md`:** `UI`, `DIST`, and every content area
  that needs its work reachable

### 1 · PROPOSED

**`op=publishedcase` stops publishing the top-level `opened`.** It was the
instant the case edition was OPENED, taken from `published_cases.opened`. It is
REMOVED — not blanked, not emptied, not gated: the key is gone from
`Store.publishedCase()`'s success return, so there is nothing in the answer for a
later refactor to re-expose and a caller cannot tell from the shape that one was
ever computed. That is REC-41's own form of removal and it is deliberate.

Remaining top-level keys: `ok`, `caseId`, `edition`, `scope`,
`bias_acknowledgement`, `completeness`, `ratified_at`, `complete`, `awaiting`,
`asked` (when a finding id was the thing asked for), `findings`, `manifest_sha`,
`manifest`, `files`, `editions`, `edition_index`, `latest_edition`,
`case_detail`, `graph_detail`, and `verification` (added by the control plane).

**`ratified_at` STAYS and the distinction is stated so it is not swept away next
time.** `ratified_at` is the instant the LAST member finding landed — the instant
the edition became a thing the group had signed, and the only one of the two the
published record can stand behind. `opened` is the instant somebody started work.
The published projection answers for what was PUBLISHED; when a case was opened
is a fact about the working record, which this op deliberately cannot see.

**WHAT IS EXPLICITLY NOT CLAIMED, because overclaiming a removal is the failure
this project exists to refuse.** This is **not** a disclosure fix. Nothing about
`opened` was sensitive, no D-number records it as a leak, and removing it closes
no oracle — the ground here is that it is an UNCONSUMED PUBLICATION and nothing
else. It is stated plainly so that a later reader does not infer a security
motive the measurement never supported.

**`#caseEditionState` KEEPS `opened`, and that is scoping rather than an
oversight.** ~~`op=publishcase` returns it to the member who has just published
(`case: caseState`).~~ That is a different op, a different token class and a
different question, and this proposal measured a need on neither. Sweeping it
because the field has the same name would be changing a shape this proposal did
not examine. It is reported as a follow-on instead.

> **CORRECTION appended 2026-08-05 by CONDUCT — the struck sentence above is
> FALSE, and it is corrected rather than deleted because an entire queue item was
> spent on it.** `op=publishcase` does **not** return `opened` and never did: it
> dispatches to `Store.publishCase()`, which computes no `opened`, reads none and
> returns none — the only occurrence of those letters in that method's whole body
> is the word *"reopened"* inside a refusal sentence, so a scanner that does not
> blank string bodies reports the field present and agrees with the sentence.
> `#caseEditionState`'s `opened` reaches `Store.publish()` (ratification) as an
> **internal DO hop**, and the control plane then builds `op=ratify`'s answer by
> naming five fields, of which `opened` is not one. `op=publish` is additionally
> an **alias**: `DO_PATH` maps it to `publishcase`, so the op whose name matches
> the spreading method is routed away from it.
>
> **The field was right and the OP was wrong — REC-41's exact lesson for the
> third time**, and this sentence is how it propagated: REC-58 was queued on it
> as its premise, and CONDUCT copied it into that item's scope without
> re-measuring. The follow-on it promised was therefore a real item spent
> establishing that there was nothing there. Nothing in IC-22's own change is
> affected — the removal from `op=publishedcase` was measured correctly and
> stands SETTLED. **What is corrected is a claim about a NEIGHBOURING op that the
> proposal did not examine and should not have described.**
>
> REC-58 keeps the field (there is no publication to retire), pins all three
> control-plane picks, and holds the state as a RELATION — computed here AND
> published nowhere — which both deleting the computation and publishing the
> field fail. The mechanical defence is queued as **M0-12**.

### 2 · WHY, AND THE MEASUREMENT IT RESTS ON

**The consumer impact is NIL, and it was RE-MEASURED FOR THIS PROPOSAL rather
than taken from the queue item** — a claim in an item is a claim, not a
measurement, and REC-41 is the precedent for why: its own item asserted no
consumer for its OP and was wrong about the op while right about the field.

Measured 2026-08-05 against source, over the WHOLE repository — 225 files,
7,689,165 characters, comments blanked and line numbers preserved:

| Caller | Reads `.opened` / `["opened"]`? |
| --- | --- |
| `civicos-ui/**` (the surface) | **no** — it renders `ratified_at` |
| `newgroup/**` (the installer) | **no** |
| `docprofile/**`, `pdf-worker/**`, `tools/**` | **no** |
| `bio-plane/test/**` (the battery) | **no** — not one assertion named the field |
| `bio-plane/src/store.mjs` | **yes, twice — and both are the PRODUCER reading its own SQL row** (`c.opened` in `#caseEditionState`, `state.opened` in `publishedCase`) |

**THE TWO COUNTING TRAPS, INHERITED RATHER THAN REDISCOVERED, and the second one
is not the one the item named:**

1. `newgroup/src/release.mjs` embeds the whole bundled plane AS A STRING, so a
   naive walk counts the plane as its own consumer and every key looks consumed.
   It is a 3-line file whose second line is 1,737,506 characters.
2. **`release/bio-plane.bundled.mjs` is a SECOND generated embed of the same
   bytes (1,681,700 characters), and UI-40's brief named only the first.** A walk
   that excluded the file it was warned about would still have counted the plane
   as its own consumer, through a different file. Both are now excluded
   STRUCTURALLY — by the generator's own banner and by the bundler's — never by
   filename.

**THE SPREAD, which is why a walk over `index.mjs` proves nothing here.** The
control plane answers `json({ ok: true, ...c, findings, verification })`. The
field reaches the wire WITHOUT `index.mjs` EVER NAMING IT, so grepping the
control plane for `opened` returns nothing while the field ships. This is why the
assertion that the field is gone is written THROUGH THE OP, over the real control
plane, and not against the source.

**ONE CORRECTION TO THE ITEM'S PREMISE, recorded because the register should not
carry an inaccuracy even a harmless one.** UI-40 says the surface "already
renders" `serves[]`, `names[]` and `unresolved[]`. It rendered **none of them**:
zero reads of `.serves`, zero of `.names`, and the only two reads of
`.unresolved` in `civicos-ui` belong to the subresource and reference surfaces.
What it rendered was `division` (the plane's own derivation of `names[]`) and
each basis leg's `served` flag (the control plane's derivation). That is not a
finding about `opened` and it changes nothing in this proposal; it is recorded
because the same item carries both halves.

### 3 · RESPONSES

- **`UI`: `AGREE`**, answered by the area itself — `ui40-agent` IS the live UI
  session and holds the claim on the published-case renderer. Measured, not
  assumed: `civicos-ui` contains no read of the field on any path, and the two
  fixtures that CARRIED it (`publishedcase.test.mjs`, and
  `preauth-vocabulary.test.mjs` — a second UI suite UI-35's table did not name)
  are corrected in the same commit, because a fixture answering a key the plane
  does not publish is the D-173 class that let a dead branch render as alive here
  once already. Nothing in the UI migrates.
- **`DIST`: `NOT-AFFECTED`, answered on its behalf by CONDUCT's standing
  practice, IN WRITING, per protocol step 3, and recorded as answered FOR the
  area and never as the area agreeing.** DIST is not live. The installer reads
  `version` from `op=bootstrap` and does not call `op=publishedcase` at all. ONE
  THING DIST MUST KNOW AND IT IS NOT A MIGRATION: both `newgroup/src/release.mjs`
  and `release/bio-plane.bundled.mjs` embed a BUNDLED COPY of the previous
  `store.mjs`, `opened` included. They are regenerated at the next release cut
  and were deliberately NOT hand-edited — a signed artifact is not patched in
  place, which is IC-20's own recorded position on the same two files.
- **Content areas: `NOT-AFFECTED`**, answered in writing on the same standing.
  No content area reaches this op; it is a pre-auth read surface.

### 4 · RESOLUTION

**ACCEPTED 2026-08-05.** All responses AGREE or NOT-AFFECTED; no counter.

### 5 · CHANGING → CHANGED

Landed by `UI` (ui40-agent) in one turn with the measurement above.
**I3 7.0.0 → 8.0.0.**

**IT IS A MAJOR BUMP AND THE NIL CONSUMER IMPACT DOES NOT MAKE IT A MINOR ONE.**
Removing a published field from an op's answer is a break by definition. IC-3
settled this reasoning for a single renamed wire string with impact equally nil:
recording it as additive because nobody happened to be reading it "would teach
this registry to lie", and IC-20 applied it again three items ago. A registry
whose version numbers track who complained rather than what changed cannot be
used to reason about compatibility at all.

### 6 · SETTLED

- **`UI`** — nothing to migrate; measured, not assumed. Two fixtures corrected
  with a dated reason rather than exempted.
- **`DIST`** — nothing to migrate; both embedded copies refresh at the next
  release cut.
- **Content areas** — nothing to migrate.
- **The battery** — `publishedcase.test.mjs` asserts THROUGH THE OP that the key
  is ABSENT from the answer (`"opened" in c` is false), which distinguishes
  REMOVED from BLANKED where a value comparison could not. The negative control
  is RUN and recorded in that suite's own `NEGATIVE CONTROL:` line.

**Returns to STABLE at 8.0.0.**
## IC-23 · I3: every capped op publishes the bound it applied and whether it truncated · PROPOSED, ACCEPTED AND CHANGED 2026-08-05 (REC-57, one act, additive, recorded from as-built code)

- **Interface:** I3 (plane → UI), **8.0.0 STABLE** → **8.1.0**
- **Proposer and owner to land it:** `RECORD` (session rec57-agent), from REC-57 —
  which is UI-39's delegation, filed in `CLAIMS.md` on 2026-08-05.
- **Consumers to answer:** `UI`, `DIST`, the content areas.
- **Renumbered at integration:** filed as IC-22 against a worktree based on 6f14a0d; UI-40 took
  that number and moved I3 to 8.0.0 while this was in flight. Renumbered rather than
  reused, and the base skew is recorded rather than smoothed.

### The change

Eleven ops apply a numeric cap. The roster was READ OFF `store.mjs` by
`test/bounds.test.mjs`'s walk rather than listed by hand, and it is nine ops wider
than the two UI-39 could see. Each gains **`limit`** — the cap ACTUALLY APPLIED,
after clamping, never the number the caller asked for. Three that published no
truncation signal at all gain one in the vocabulary their own siblings already use:

| op | added | already published, UNTOUCHED |
| --- | --- | --- |
| `readingname` | `limit`, `truncated`, a truncation clause in `detail` | — |
| `tasks` | `limit`, `truncated` | `counts` (which answers a different question) |
| `exportlog` | `limit`, `truncated`, an OPTIONAL `limit` parameter | — |
| `reindexnames` | `limit`, `remaining` | `indexed`, `examined` |
| `searchindexcheck` | `limit`, `orphans_limit`, `orphans_truncated` | `cursor` |
| `queue` | `limit` | `truncated` |
| `audit` | `limit` | `cursor`, `total` |
| `list` | `limit` (paged arm only) | `cursor`, `total` |
| `taskdrain` | `limit` | `remaining` |
| `reproject` | `limit` | `remaining` |
| `search` | nothing — it was already right, and is the model | `limit`, `offset`, `total`, `truncated` |

**Additive for every existing caller.** No key is removed, renamed or reshaped; no
refusal reason, class, gate or ordering moves; every existing key is byte-identical
for every input. `op=exportlog` with no `limit` answers exactly as before.

### Why, and why it is not cosmetic

**The consumer is a COMPLETENESS CLAIM in every case.** A count of what was SENT and
a count of what EXISTS are different claims, and a producer that published only the
first has asserted the second. UI-25's whole item existed because a member with more
than 500 hits could cite only the first 500 into a case. `op=audit` published `ok`
over ONE PAGE. `op=exportlog` showed an administrator the newest 200 rows of a log
the export manifest describes to them as append-only and complete — on a store past
200 exports, the row being looked for is the one that has fallen off.

**Two ops on one surface answered the same question in two shapes.** `op=queue`
published `truncated` and `op=tasks` did not, so a consumer that read one correctly
read the other wrongly — and UI-39 had to INFER the bound from `counts` arithmetic
and word it as the inference it was. The same defect turned up a second time between
two BACKFILLS: `reproject` published `remaining` and `reindexnames` published only
`examined`, the count of what it TOOK, which equals the cap on exactly the run where
more is left.

### Why `truncated` is NOT added everywhere — the REC-55 rule, applied

The plane answers "is this all of it" in four spellings, each giving the caller
something a bare flag would not: `truncated`, `cursor` (non-null means *more, and
resume HERE*), `remaining` (*run me again, this many left*), and `total` beside
`limit`/`offset`. **Where an op already published the fact, a second spelling was
NOT added** — REC-55 declined exactly that, and two spellings of one fact is the
drift this project has measured repeatedly. `test/bounds.test.mjs` therefore asserts
the PROPERTY (a caller can tell *this is all of it* from *this is the first N*) and
reads each op in its own vocabulary, with an over-strictness arm proving the reader
accepts honest shapes it did not write.

### Responses

- **`UI`: `AGREE`** — answered on its behalf by CONDUCT per protocol step 3 and the
  IC-12 mechanics, recorded as CONDUCT answering FOR the area. UI-39 is the area's
  own written request for exactly these two fields on exactly these two ops, filed as
  a DELEGATION in `CLAIMS.md`; the change grants it and extends it. Every field is
  additive, so no surface breaks by ignoring it, and `heldMatch`/`loadResolveCandidates`
  can now quote the record's own figure instead of authoring one. A UI-10-class
  follow-on may replace the surface-authored bound sentences with the published ones.
- **`DIST`: `NOT-AFFECTED`** — the installer reads `version` and the bootstrap fields;
  it calls none of the eleven.
- **Content areas: `NOT-AFFECTED`** — none consumes a capped read's envelope.

### Version

I3 8.0.0 → **8.1.0** in `INTERFACES.md`. I5 is NOT touched: no table, column or index,
and no `purge` change.

---

## IC-24 · I3: `op=projection`'s capped corpus arms answer with a BARE ARRAY, which can carry no bound · PROPOSED 2026-08-05 (REC-57), then RESPONSES, ACCEPTED, CHANGING, CHANGED AND SETTLED 2026-08-07 (REC-59) — the one IC here whose steps were taken by two different sessions on two different days, which was the point of filing it rather than landing it

- **Interface:** I3 (plane → UI), **8.1.0 STABLE** after IC-23
- **Proposer:** `RECORD` (session rec57-agent), 2026-08-05, from REC-57's sweep.
  **Filed and NOT landed**, deliberately — see below.
- **Consumers to answer:** `UI`, `DIST`, the content areas.

### The finding

`op=projection` is on REC-57's roster and is the one member of it that **could not be
fixed additively.** Its single-bundle arm (`&id=`) returns one object and applies no
cap. Its two CORPUS arms — the bare enumeration and the `jsonPath`/`jsonEquals` filter
— return **a bare JSON array**, capped at 200. An array carries no keys, so there is
no additive way to publish either the bound or whether it bit; and the dispatch does
not forward `limit` from the wire at all, so a caller cannot even ask for more. It is
the worst instance of the class on the roster and the only one still open.

That this bound is invisible has already cost a reader: `test/disposition.test.mjs`
carries the comment *"Ask for the ONE bundle rather than scanning the projection:
op=projection caps…"* — a test author who had to learn the cap from the source
because the answer would not say it.

### The change proposed

The corpus arms return an envelope, matching `op=list`'s paged arm, which already
solved this exact problem for the same kind of answer:

    { bundles: [ … ], limit: <cap applied>, cursor: <id|null>, total: <gated count> }

and the dispatch forwards `limit` and `after`. The `&id=` arm is UNCHANGED.

### Why it is filed rather than landed

**It is not additive**, so it cannot be landed in the turn it is proposed: protocol
steps 4–6 (CHANGING, CHANGED, SETTLED) exist precisely for a shape another area may
be building against. The measured consumer impact inside this repository is **nil** —
every one of the nine call sites found (`queue-conditions`, `queue-state`,
`publishedcase`, `action-loop`, `inquirystrength`, `fence`, `gate-reads`,
`disposition`, and the UI's `elicitation` fixture comment) uses the `&id=` arm, which
does not move. But "nobody in this tree reads it" is not the same as "no consumer",
and IC-3's settled reasoning applies: recording a break as additive because nobody
happened to be reading it would teach the registry to lie.

Until it resolves, `test/bounds.test.mjs` PINS the exception rather than exempting it:
it MEASURES that `op=projection`'s capped arm really does answer with an array, and
asserts the array-shaped set is **exactly one op wide**. A second op answering this
way fails the suite rather than quietly joining a growing exception list.

### Status

**PROPOSED, 2026-08-05.** Awaiting responses. Nothing is built against either shape.
A separate queue item should land it; this session did not, and says so rather than
leaving the roster looking complete.
### RESPONSES, 2026-08-07 (REC-59, session rec59-agent)

Protocol step 2. The proposal named `UI`, `DIST` and the content areas as consumers to
answer. All three are dormant for this interface today, so **CONDUCT answers on their
behalf, IN WRITING, on the IC-1 precedent** — recorded as CONDUCT answering FOR each
area and never as the area agreeing. What is new here is that the answers are
**EVIDENCED BY A RE-MEASUREMENT rather than by the proposal's own count**, because the
proposal's count turned out to be wrong.

- **`UI` — NOT-AFFECTED (answered by CONDUCT).** Measured, not asserted: `civicos-ui`
  reaches this op through exactly one helper, `getProjection(id)` at `app.html:1048`,
  which passes an id and therefore takes the `&id=` arm that does not move. The
  corpus-arm consumer the surface once had — `reverseRefs`, which walked the projection
  of every inquiry and project and unioned it with `op=list` — **was deleted by UI-21
  on 2026-08-05** in favour of `op=backlinks`, and its removal is documented in place
  with the three reasons. So the one surface that would have broken had already stopped
  reading this arm two days before the break landed, for unrelated reasons. This is
  asserted in `bounds.test.mjs` as its own arm, so NOT-AFFECTED stays a measurement.
- **`DIST` — NOT-AFFECTED (answered by CONDUCT).** No call site in `newgroup/**`,
  `docprofile/**`, `pdf-worker/**` or `tools/**`, on either arm, in any of the four
  invocation forms the walk recognises.
- **The content areas — NOT-AFFECTED (answered by CONDUCT).** No call site.

### THE RE-MEASUREMENT, AND IT CONTRADICTS THIS PROPOSAL'S OWN COUNT

The proposal says: *"every one of the nine call sites found … uses the `&id=` arm, which
does not move."* **Re-measured 2026-08-07 across 228 files and 7,843,070 characters:
there are 38 call sites, and NINE OF THEM TARGET THE CORPUS ARMS.**

| arm | sites | what they do with the answer |
| --- | --- | --- |
| `&id=` (unchanged) | 29 | read one row |
| corpus, bare enumeration | 7 | `.find()` / `.map()` over the array |
| corpus, `jsonPath`/`jsonEquals` | 2 | `.map()` over the array |

The nine, named: `test/projects.test.mjs` ×5 (`.find()` over the enumeration, at 220,
221, 335, 368, 419), `test/gate-reads.test.mjs`:238 (`.map()` over the enumeration —
the D-15 arm proving an uninvited member sees only the shared corpus),
`test/projection.test.mjs`:192 (`.map()` over the filter arm),
`test/bounds.test.mjs`:465 (the pin itself), and `test/fence.test.mjs`:99 (a corpus-arm
request that is refused `unauthenticated` before any shape is reached).

**THE COINCIDENCE IS THE HAZARD AND IS RECORDED AS SUCH.** The proposal's figure was
NINE and the number of corpus-arm sites is also NINE. A reader re-deriving the count and
comparing totals would have found "nine" against "nine" and concluded the measurement
was confirmed. It was a count of a different population. This is REC-41's lesson for the
fourth time — right about one thing, wrong about which thing — and it is the whole
argument for the queue item's instruction to re-measure rather than inherit.

**WHAT THE PROPOSAL GOT RIGHT, and it is the part that decides:** the conclusion holds
even though its arithmetic did not. The `&id=` arm is 29 of 38 sites and is untouched;
every corpus-arm consumer is inside this repository's own battery, so the migration is
one commit rather than a coordination problem; and no consumer outside this tree is
known. The break is worth taking, and taking it through the protocol rather than around
it is what made the wrong count visible before it landed rather than after.

**THE WALK'S OWN LIMIT, STATED:** it reads request-forming string literals. A caller
that composes its query from a variable, or reaches the op through a helper the walk
does not know, is invisible to it. So the figure is a FLOOR, not a census — which is why
every migrated consumer is additionally asserted THROUGH THE OP in its own suite rather
than trusted to the walk.

### RESOLUTION, 2026-08-07

Protocol step 3. All consumer answers are NOT-AFFECTED (CONDUCT answering for three
dormant areas, named above), and no counter was raised. **ACCEPTED.**

The amendment forced by the re-measurement is to the proposal's IMPACT STATEMENT, not to
its SHAPE: the change is exactly as proposed, and "measured consumer impact is nil" is
corrected to "nine in-tree call sites, all inside the battery, all migrated in the
landing commit". The proposal's decision to record this as a BREAK per IC-3's reasoning
is now doubly right — it was recorded as a break when it was believed to be unconsumed,
and it turned out to be consumed.

### CHANGING → CHANGED, 2026-08-07

Steps 4 and 5, taken in one commit because every affected consumer is in this repository
and this session migrated all of them; there is no window in which a second shape could
be built against. **I3 8.1.0 → 9.0.0**, MAJOR, in `INTERFACES.md`.

What landed, in `store.mjs`'s `projection()`:

    // before — both corpus arms
    return this.#rows(`SELECT … LIMIT ?`, …, limit);        // a bare JSON array, capped 200

    // after
    { bundles: […], limit: <cap applied>, cursor: <bundle_id|null>, total: <gated count> }

- **The `&id=` arm is UNCHANGED**, byte for byte, including REC-24's derived `action`
  block. Only the two corpus arms move.
- **The envelope is `op=list`'s**, deliberately, and not a twelfth spelling: the same
  rows of the same table already answer in that shape when `op=list` pages, and minting a
  second vocabulary for one producer is REC-55's declined-second-copy rule at the level
  of shape. This is also why the completeness signal is `cursor` and not a new
  `truncated` — `op=list` already settles the question that way.
- **The dispatch now forwards `limit` and `after`**, which it did not carry at all. The
  two halves of the defect were that the caller could not see the cut AND could not ask
  for more; publishing the bound without accepting one would have fixed the smaller half.
- **The cap is UNCONDITIONAL, unlike `op=list`'s.** `op=list` pages only on request, so
  its bare arm applies no bound and has none to publish. Here the 200 has always bitten,
  so an envelope that appeared only when asked for would publish nothing in exactly the
  case that was lying.
- **`limit` is the bound AFTER clamping** (default 200, ceiling 5000 — `op=list`'s
  ceiling, reused rather than duplicated), never the number asked for. **`total` is
  gated**, counting only what the viewer may see, and on the filter arm it counts what
  the FILTER matched rather than the corpus searched — both asserted, the second against
  a corpus deliberately larger than the match.
- The bound is now NAMED (`Store.PROJECTION_LIMIT_DEFAULT` / `_MAX`) rather than a bare
  literal, so the roster walk finds it by name the way REC-57 made `op=exportlog`'s
  findable.

### SETTLED, 2026-08-07

Step 6. Every consumer has migrated or has recorded that it had nothing to migrate:

- **`UI`, `DIST`, the content areas** — nothing to migrate (measured above; asserted
  in-suite for `civicos-ui`).
- **`RECORD`'s own battery** — all nine corpus-arm sites migrated in the landing commit.
  `projects.test.mjs` reads through one `projRows()` helper so the shape is stated once;
  `gate-reads.test.mjs` and `projection.test.mjs` read `.bundles`. **Each is CORRECTED
  with a dated reason at the site and none is exempted**, and two of them gained arms the
  old shape could not carry: that `total` is viewer-dependent while `limit` is not
  (`gate-reads`, the D-15 suite, where that distinction belongs), and that the filter
  arm's `total` is the filter's rather than the corpus's (`projection`).
- **The one-op pin is KEPT ALIVE AND INVERTED.** `bounds.test.mjs` pinned this at
  exactly one array-shaped op rather than exempting it. That pin now reads **ZERO**, and
  in the course of this item it was found to be **weaker than it looked**: it compared a
  hand-written `Set(["projection"])` against its own `.size`, which was true because the
  literal had one element and would have stayed true whatever any op answered. It is now
  PRODUCED by driving every op on the roster and inspecting the answer, with a guard
  proving the reader can still see an array when one is present. A second bare-array
  capped op now fails the build with no list to join.

I5 is NOT touched: no table, column, index or `purge` change.

---

## IC-25 · I3: three meaning-layer reads apply a bound where they applied none — `op=resolutions`, `op=concerns`, `op=connections` · PROPOSED, RESPONSES, RESOLUTION, CHANGING, CHANGED AND SETTLED 2026-08-07 (REC-60, D-225)

### 1 · PROPOSED

**Interface:** I3 (the op contracts), owned by RECORD, currently 9.0.0. **I5 is NOT touched** — no table, column, index or `purge` change.

**The change, on three read ops.** Each previously returned **every matching row**, with no bound, no paging and no truncation marker. Each now:

- applies a bound — **default 500, ceiling 5000** — and accepts an OPTIONAL `limit` parameter it previously ignored;
- publishes `limit`, the cap **AFTER clamping** (never the number the caller asked for), and `truncated`, whether it bit.

Neither figure is new: **500** is `op=readingname`'s ceiling and `query.mjs`'s `LIMIT_MAX`; **5000** is `op=list`'s ceiling, which `op=projection` reused at REC-59 rather than inventing a second. Neither is the spelling new: `limit` beside `truncated` is `op=readingname`'s pair — the closest sibling, a keyed read over the same meaning layer — under REC-55's declined-second-copy rule. **No key is removed, renamed or reshaped**; `count`, `resolution_count`, `entity`, `found`, every refusal, every class, the D-15 gate and every ordering are unchanged, and the bound is **viewer-independent** (asserted).

On `op=concerns` one thing is stated rather than left to be inferred: **the bound is over the RESOLUTION ROWS the join reads**, not over `documents`. That op collapses rows to distinct captures, so a bound over the collapsed set could only be applied after an unbounded scan — which is the defect. `resolution_count` is what it always was, the rows read; `count` is what they collapsed to and may be far smaller.

### 2 · WHY, AND WHY IT IS A BREAK RATHER THAN ADDITIVE

The keys are additive. **The bound is not**: a caller that received everything today receives the first 500 tomorrow. It is filed as a break for IC-3's settled reason — recording a break as additive because the impact looks small would teach this registry to lie.

**D-225's defect is BOUNDEDNESS, not honesty, and the two are different.** REC-57's discipline is *a bound APPLIED must be PUBLISHED*; these three applied none, so they published none and told no lie. What they did was **grow without limit** — and `op=connections` grows on D-224's **k(k−1)/2** curve, so a hundred documents about one subject is 4,950 rows in one answer and **the most important entity produces the largest response**. Fixing boundedness is what forces the REC-57 envelope: once a bound exists it must be published.

**WHY REC-57'S SWEEP DID NOT CATCH THEM, which is the part worth carrying:** its roster enumerated ops **WITH ENVELOPES**, built by finding methods that CARRY A CAP. **An op with no envelope at all was invisible to the instrument that would have flagged it.** REC-60's walk therefore starts from **RETURN SHAPES** — what a method PUBLISHES, not what it clamps — and reads two shapes, an object with an array-valued key and a **bare array returned as the whole answer**, the second because a return-object-only reader carries REC-57's blind spot in a new costume.

### 3 · CONSUMER IMPACT, MEASURED IN THIS TREE AND NOT INHERITED

Walked over the repository, excluding the four generated copies of the plane structurally (byte 0 / `dist/` as a directory skip) and keeping the generator in:

- **`civicos-ui` — AFFECTED, and it is a member-facing overclaim rather than a red build.** `civicos-ui/app.html:11542` tells a member in words: *"Documents already resolved to this subject are added separately and are not capped."* That sentence rested on `op=concerns` being uncapped, and it is pinned at `civicos-ui/test/bound-sweep.test.mjs:557`. **Nothing in the UI battery fails**, because that suite drives a fixture and not the plane — so this will not announce itself. Delegated to UI in `CLAIMS.md` 2026-08-07 with the exact site and the exact fix, which is small because UI-41 already built the read-it-off-the-wire mechanism for `op=readingname` on the same screen.
- **`newgroup`, `docprofile`, `pdf-worker`, `tools` — NOT-AFFECTED**, no call site.
- **The battery — 12 assertions across 4 suites reference these ops and NONE broke**: every existing consumer asks for fewer rows than the default 500, so the bound does not bite them. That is a measurement, not a claim of nil impact: the impact is real and lands on any record with more than 500 resolutions on one subject.

**RECORD'S POSITION, stated with the proposal rather than after it:** capping is right even though it makes a live UI sentence falsifiable. Before this change the truth was available to NOBODY; after it the truth is on the wire and the only defect left is a consumer not yet reading it. That is strictly better, and it is a defect with a named owner and a named fix.

### 4 · WHAT IS NOT CLAIMED

**No cursor is minted**, so a caller cut at the CEILING has no way past it — reachable on the quadratic read with about a hundred documents on one subject. That is the honest bound rather than the complete answer, and the complete answer needs the query surface D-222/REC-62 is for. Stated here rather than discovered later.

### 5 · CONSUMER RESPONSES

Awaited. **RECORD does not answer on UI's behalf** — CONDUCT holds the IC-1/IC-24 precedent for answering for a dormant area, and this consumer is not dormant but AFFECTED, which is a different answer requiring a different act.

### 6 · STATUS

**PROPOSED, with the code landed on REC-60's branch and the RESOLUTION routed to CONDUCT at integration.** REC-57's precedent — do not land a non-additive I3 change in the turn it is proposed — is deliberately weighed rather than ignored: its reasoning was that the consumers had not been measured in that turn, and here they HAVE been, with one real consumer found and delegated. REC-62 is a hard precondition of the whole investigative-session set and depends on this item, so stalling the cap into a second item stalls the chain. CONDUCT holds the choice the precedent protects: accept at integration, as it did for REC-59, or hold the item. **The I3 version bump is NOT taken by this session** — the registry entry is CONDUCT's to move at resolution.


### 2 · RESPONSES

**CONDUCT answered for the consuming areas 2026-08-07 at REC-60's integration** (the IC-1 precedent: CONDUCT answers in writing for an area that cannot answer for itself; here UI is ACTIVE but its consumer was found by the producing item rather than by UI).

- **RECORD (producer)** — AGREE. The bound is the item's subject and the figures are reused rather than invented.
- **UI — AFFECTED, and this is the response that decides the version.** REC-60's own sweep found a **LIVE member-facing sentence that rests on `op=concerns` being uncapped**: `civicos-ui/app.html:11857` and `:11858` each end *"(Documents already resolved to this subject are added separately and are not capped.)"*, on BOTH branches, and it is pinned at `civicos-ui/test/bound-sweep.test.mjs:557` **against a fixture, so no suite fails.** That is a consumer whose correctness depended on the absence of a bound. Routed as **UI-42**, first in the UI queue.
- **DIST, CAPTURE, CONTENT-\*, FRAMEWORK** — NOT AFFECTED; none reaches these three reads.

### 3 · RESOLUTION — ACCEPTED, and recorded as **MAJOR** rather than additive

**The shape change is additive; the BEHAVIOUR change is a break, and the break is what gets versioned.** Three reads that returned every matching row now return at most 500. **A caller that required completeness is now silently incomplete unless it reads `truncated`** — and REC-60 measured that exactly such a caller exists and is member-facing.

Recorded as MAJOR on **IC-3's settled reasoning**, which this project has now applied at IC-20, IC-22 and IC-24: *recording a break as additive because nobody happened to be reading it would teach this registry to lie.* Here it is stronger than at those three, because the impact is **not** nil — it is measured, live, and in front of a member.

**What is NOT claimed:** this closes no oracle and fixes no disclosure. The ground is unbounded growth (D-225) and nothing else. **And the honest cost is stated rather than buried:** no cursor is minted, so a caller cut at the 5,000 ceiling has no way past it — reachable at roughly a hundred documents on one subject. That is deliberate (REC-55's declined-second-copy rule; the complete answer is what D-222/REC-62 exists to provide), and it is Bob's to revisit if it bites before REC-62 lands.

### 4 · CHANGING / CHANGED

Landed with REC-60 (worker `1f5f95f`, merged on `main`). `resolutionsForCapture`, `documentsConcerning` and `connectionsFor` each clamp to **default 500 / ceiling 5000** and publish `limit` **after clamping** beside `truncated` — `op=readingname`'s pair, the closest sibling on the same layer. `count`, `resolution_count`, every refusal, class, ordering and the D-15 gate are **byte-unchanged**, and `limit` is asserted **viewer-independent**. `index.mjs` needed no edit. **`op=concerns` states at the site that its bound is over the RESOLUTION ROWS the join reads, not over `documents`** — it collapses to captures, and a bound over the collapsed set would need an unbounded scan first, which is the defect.

The three joined REC-57's roster in `bounds.test.mjs`, whose `OPS.size` pin **failed at 11 on a clean tree and was corrected 11 → 14 with a dated reason** rather than exempted, with all three driven there.

### 5 · SETTLED

**I3 8.1.0 → 9.0.0 → 10.0.0.** I5 NOT touched: no table, column, index or `purge` change. Recorded by CONDUCT 2026-08-07. **Open against it: UI-42** (the live sentence), and **D-227** — CONDUCT measured at integration that these suites pin the PUBLISHED ENVELOPE and not the SQL BOUND, so a regression removing `LIMIT ?` while leaving the slice and the envelope passes both green.


---

## IC-26 · I3: one NEW read op `op=meaningrows` — the meaning layer answered at MEANING GRAIN · PROPOSED, RESPONSES, RESOLUTION, CHANGING, CHANGED AND SETTLED 2026-08-07 (PL-9, D-222 option C), ADDITIVE

- **Interface:** I3 (plane → UI), **10.0.0 STABLE** → proposed **10.1.0**
- **Proposer and owner to land it:** `RECORD` (session is-wave-w3a-pl9), from
  `IS-BUILD-PLAN.md` PL-9 — D-222 option C, the second half of §14c's recommendation D.
- **Consumers to answer:** `UI`, `DIST`, the content areas.
- **Filed even though I3 says adding an op needs no protocol**, on **IC-3's settled
  reasoning**: recording a change as needing no record because it happens to break
  nothing *"would teach this registry to lie."* §14c asks for the entry by name.
- **Version bump and RESOLUTION are CONDUCT's.** This session files the entry and does
  not touch `INTERFACES.md`.

### The change

One new read op. Nothing existing is renamed, reshaped, removed, re-fenced or reordered.

    op=meaningrows&rows=<leg|resolves|concerns>&q=<query>&limit=&offset=

| | |
| --- | --- |
| classes | `admin`, `member`, `probe` — **op=search's fence exactly** |
| mutating | `false` |
| session reach | yes, via `RETRIEVAL_READS` (op=search's own list, not a new one) |
| `viewer` | **stamped server-side** beside op=search's, never taken from the caller |
| answer | `{ ok, arm, table, grain, identity, query, gate, rows[], count, limit, offset, total }` |
| refusals | `MEANING_ROWS_NO_ARM` (C-23.1), `MEANING_ROWS_UNKNOWN_ARM` (C-23.2) |

**`q` IS PL-8'S LANGUAGE VERBATIM.** There is no second selector vocabulary and no
second query path: the op adds exactly ONE argument, `rows`, which names WHICH meaning
table to answer at grain from. Every operator, negation, parenthesis, `has:` test and
meaning arm the compiler already had selects the bundles this returns rows for.

**What it publishes, and the grain is the point:**

- `rows[]` — one row per MEANING-TABLE ROW. For `rows=leg`: one LEG of one inquiry's
  basis, carrying `bundle_id`, `bundle_type`, `ord`, `target_id`, `target_type`,
  `role`, `grade`, `grade_axis`, `grade_source`, `ground`, `note`, `at`, and
  `target_id_present`. For `rows=resolves|concerns`: one RESOLUTION, carrying
  `capture_sha`, `ref`, `entity_id`, `grade`, `method`, `basis`, `established`,
  `raised_from`, `resolved_by`, `at`.
- `grain` and `identity` — **the grain in words and as columns**, so a consumer
  cannot read a leg as a bundle. `identity` is the meaning table's own PRIMARY KEY
  (`(bundle_id, ord)`; `(capture_sha, ref, entity_id)`), asserted in the suite
  against `schema.mjs`'s `CREATE TABLE` rather than typed.
- `limit`, `offset`, `total` — **op=search's own envelope**, because this IS a
  statement of op=search's compiler. `limit` is the cap APPLIED after clamping
  (default 200, ceiling 1000), never the number asked for; `total` is the
  viewer-gated count of matching rows; `offset + count < total` is how a caller tells
  *this is all of it* from *this is the first N*. **No twelfth spelling is minted**
  (REC-55's declined-second-copy rule).
- `op=searchfields` gains, per arm, a `rows: { grain, identity, columns, refs }`
  block — **additive**, derived from the compiler's own registry, so a surface builds
  its controls from the plane rather than from a copy that drifts.

**THE GRAIN INVERTS PL-8'S, DELIBERATELY, AND THE TWO COMPOSE.** PL-8's arms compile to
an `IN` subquery so an inquiry with four hunch legs appears ONCE; this shape is a JOIN
and that inquiry appears FOUR TIMES, because the legs are the answer. `leg:hunch` +
`rows=leg` is §14c's option D in one request: *which inquiries carry hunch debt* and
*what those bases actually rest on*. Both grains are correct and neither is a spelling
of the other; the suite asserts the relationship over one corpus rather than either
side alone.

**A BASIS IS RETURNED WHOLE, not filtered to the arm's own predicate.** `leg:hunch` +
`rows=leg` answers with EVERY leg of every inquiry carrying a hunch leg, not only the
hunch legs. This is doctrine rather than convenience: a basis returned in part reads as
a basis, and handing a consumer two legs out of five lets it conclude things about a
basis it has not seen — a record claiming more than it can support, which `CLAUDE.md`
ranks worse than a missing feature. Every row carries the columns the arm filters on,
so a caller that wants only the hunch legs can take them and still knows what it did
not take.

### Additive for every existing caller

No key removed, renamed or reshaped anywhere. `op=search`, `op=resolutions`,
`op=concerns`, `op=connections` and every other op answer byte-identically for every
input. `compile()`'s six existing statement builders are untouched and the seventh is
INERT unless `rows` is named, so every existing caller of the compiler gets exactly
what it got before. `viewerPredicate` is unchanged, and **the count of gate-mint sites
in `query.mjs` is still THREE** — PL-8's pin, kept alive and asserted here.

### Why it is not a second query path (D-15), and why that was not a free choice

`query.mjs`'s own note at the `ids` arm says a set resolved by another route *"would be
the second query path this design exists to prevent"*, and D-15 gives visibility exactly
ONE compilation point, enforced by a THROW in `Store#runQuery` rather than by a
convention. So D-222 option B was closed by a standing ruling. This is option C: a
SEVENTH STATEMENT SHAPE registered in `compile()` beside `page`/`count`/`ids`/
`snapshot`/`facets`/`facetScan`, off the same `scope` CTE, with the same predicate from
the same call to `viewerPredicate`, executed by the same guarded executor.
`Store#meaningRows` assembles NO SQL — asserted structurally, because writing the
statement somewhere else is the other way to build a second path.

### REC-36's stricter rule, and one stated departure

§14c: a meaning-layer answer is a CANDIDATE LIST, so *"most reads redact a
back-reference; a candidate list withholds the whole row, because even a nameless
candidate discloses that something mentioning the subject sits in a project the viewer
was not invited to."* Two clauses carry it, and a third is the honest limit:

1. **The owning bundle.** A row whose bundle the viewer may not see is ABSENT, never
   present with `bundle_id` nulled. `total` is counted through the same joins and the
   same predicate, so a total larger than the reachable rows cannot arise, and **no
   count of what was withheld is published** — that count is the leak.
2. **A column naming another bundle** (`inquiry_basis.target_id`). If that bundle
   EXISTS and the viewer may not see it, the whole row is withheld.
3. **A DEPARTURE from `Store#bundleGate`, stated rather than discovered.** That helper
   is fail-closed on a DANGLING reference: a row naming a bundle that is GONE is
   withheld. Here a leg whose target the record no longer holds is **RETURNED**, with
   `target_id_present` saying so. On a candidate list a dangling pointer is nothing to
   act on; on a BASIS a leg pointing at a withdrawn document IS THE DEBT, and hiding it
   under-reports — the silently narrowed answer this whole surface exists to remove.
   Visibility and existence are different questions and only the first is a disclosure.
   `Store#purge`'s own comment is the authority: *"legs elsewhere that TARGET it stay,
   honestly unresolvable."*

### Measured, not asserted

`node scripts/battery.mjs meaningread` green at 106; the full battery **109/109 at
6,387** from a baseline of **108/108 at 6,270** measured in this worktree before any
edit, with the +117 attributed per suite (meaningread +106 new, bounds +8, hygiene +3)
and **every other suite byte-identical**. `node scripts/coverage.mjs --strict` run
directly with `$?` unpiped, **exit 0**: OPS 136 → **137, all reached through the control
plane**; CHECKS 59 → **61, all named**.

**The op joined REC-59's bare-array roster, and closing that gap found another one.**
`bounds.test.mjs`'s walk enumerates methods that carry a cap IN THEIR OWN BODY; this
op's cap lives in `query.mjs`, so it would have been invisible — and so, it turns out,
was **`op=search`**, the op REC-57's header calls *"the model the rest were brought
to"*. A fifth cap shape (`compiler-cap`: a method that publishes a bound taken off a
compiled plan) was added to the walk; the roster pin was corrected **14 → 16** with a
dated reason, never exempted, and both ops are now DRIVEN there. Negative control (4)
confirms the pin bites: making `op=meaningrows` answer a bare array fails
*"PIN: ZERO capped ops answer with a bare array"* with `got ["meaningrows"]`.

### What is NOT claimed

- **The SCAN's bound is not measured** — D-227's subject. The suite asserts the
  statement carries `LIMIT ?` and that the cap published is the cap applied, which is
  the honesty half. An unbounded derivation feeding a bounded answer would pass, and
  the suite says so at the site.
- **No cursor is minted**, on IC-25's reasoning: `offset` over a total ORDER BY on the
  grain's own identity is what pages this shape, and the suite drives the whole set
  page by page and asserts each row appears exactly once.
- **No oracle is closed and no disclosure is fixed.** The ground is a meaning layer
  that was visible as a number and unreachable as a structure, and nothing else.
- **I5 is NOT touched**: no table, column, index or `purge` change.

### RESPONSES — awaited

- **UI** — nothing to migrate: no existing shape moves. The new op is available and
  unconsumed.
- **DIST, CAPTURE, CONTENT-\*, FRAMEWORK** — expected NOT-AFFECTED; none reaches it.


### RESPONSES · RESOLUTION · SETTLED — recorded by CONDUCT 2026-08-07

**RESPONSES.** CONDUCT answered for the consuming areas (the IC-1 precedent). **RECORD (producer)** — AGREE. **UI — NOT AFFECTED and asserted so: the op is available and UNCONSUMED**, and no existing shape moves, so no UI edit is owed; PL-9 said so explicitly rather than leaving it inferred. **DIST, CAPTURE, CONTENT-\*, FRAMEWORK** — NOT AFFECTED.

**RESOLUTION — ACCEPTED as ADDITIVE, and the reasoning is the mirror of IC-25's.** Nothing existing is renamed, reshaped or withdrawn: one new op, one new argument on it, and `op=searchfields` gains a `rows:` block. **A caller that ignores it sees exactly what it saw before**, which is the test IC-3's line of reasoning applies — and unlike IC-25, no caller's correctness depended on the absence of this.

**What settles it as SOUND rather than merely additive**, and each was measured rather than asserted: it is **one compilation point** (the mint-site COUNT is pinned in two suites, and a second point fails them both); the **viewer gate is the same call** and dropping it makes the op REFUSE at D-15 rather than answer ungated; **`total` is gated WITH the rows**, so an uninvited member is not told there are two where they reach one; and **REC-36's withhold rule is staged LIVE**, against a row a real uninvited member genuinely cannot see — which was only possible because PL-9 measured that a project bundle CAN carry resolution rows, correcting a false sentence in PL-8's header on the way.

**THE ONE STATED DEPARTURE, recorded because it is a departure and not an oversight:** a leg whose target the record no longer holds is **RETURNED**, with `target_id_present` false, rather than withheld by `#bundleGate`'s usual rule. **On a basis, a dangling leg IS the debt, and hiding it UNDER-REPORTS** — `Store#purge`'s own comment is the authority, and the population is real because `purge` produces such legs by design while `promote` refuses to write one (D-168).

**SETTLED. I3 10.0.0 → 10.1.0.** I5 NOT touched. Open against it: nothing. **Related and NOT closed by it: D-227** — these suites assert the statement carries its `LIMIT` and that the published cap is the applied cap, which is the HONESTY half; **an unbounded derivation feeding a bounded answer would still pass**, and that is D-227's subject, riding REC-66. PL-9 states that limit in its own suite rather than leaving it to be discovered.



## IC-27 · I3: one NEW read op `op=versionchain` — every version at a document ADDRESS, in date order, with its bundle · PROPOSED, RESPONSES, RESOLUTION, CHANGING, CHANGED AND SETTLED 2026-08-07 (PL-10, D-220 + D-221), ADDITIVE

- **Interface:** I3 (plane → UI), **10.1.0 STABLE** → proposed **10.2.0**
- **Proposer and owner to land it:** `RECORD` (session is-wave-w4b-pl10), from
  `IS-BUILD-PLAN.md` PL-10 — D-220's op, discharging D-221 at the same join.
- **Consumers to answer:** `UI` (and UI is the one with work to do — see the DELEGATION
  below), `DIST`, the content areas.
- **Filed even though I3 says adding an op needs no protocol**, on **IC-3's settled
  reasoning**, which IC-26 restated: recording a change as needing no record because it
  happens to break nothing *"would teach this registry to lie."*
- **Version bump and RESOLUTION are CONDUCT's.** This session files the entry and does
  not touch `INTERFACES.md`.

### The change

One new read op. Nothing existing is renamed, reshaped, removed, re-fenced or reordered.

    op=versionchain&address=<url>&at=<capture sha256>&limit=&offset=

| | |
| --- | --- |
| classes | `admin`, `member`, `probe` — **op=links' and op=search's fence** |
| mutating | `false` |
| session reach | yes, through the ordinary read route |
| `address` | **NORMALISED SERVER-SIDE** by `normalizeAddress`, the same function `recordCapturedLocator` wrote the row with |
| `viewer` | **stamped server-side**, never taken from the caller; an absent stamp compiles to the deny predicate |
| answer | `{ ok, address_norm, documents, versions[], count, total, limit, offset, truncated, at, at_index, predecessor }` |
| refusals | `VERSION_CHAIN_NO_ADDRESS` (C-24.1), `VERSION_CHAIN_NO_SUCH_VERSION` (C-24.2), `VERSION_CHAIN_BAD_ANCHOR` (C-24.3) |

**NO SCHEMA MOVES, AND THAT IS THE ITEM RATHER THAN A FOOTNOTE.** Bob ruled that
versions of one document must be *"linked"* and *"indexed by the same url"* — and the
index he described **already existed**: `captured_locators` is keyed
`(address_norm, capture_sha, via)` with `captured_locators_addr ON (address_norm,
first_retrieved)`, and `register` maps `capture_sha` to `bundle_id` on its primary key.
So *"every version at this address, in date order, with its bundle"* is ONE INDEXED JOIN
over two tables the record has always held. **The link Bob asked for is the join,
EXPOSED.** An explicit `supersedes` relation would be a SECOND COPY of a fact the record
already holds — D-164's solve-it-once, D-138's guard that guarded nothing — so there is
no new table, no new column, no new index, and no new write. **I5 is NOT touched.**

**What it publishes:**

- `versions[]` — one row per VERSION, and **one version is one `capture_sha`**. The
  primary key carries `via` because an archive sighting of the same bytes is a different
  FACT from a direct one (D-96); it is not a different VERSION, so the rows are grouped
  on the sha and the `via` values are reported (`via[]`, `sightings`) rather than
  flattened away. Each row carries `bundle_id`, `first_retrieved`, `last_retrieved`,
  `observations`, `address`, and the register's own `path`/`encoding`/`bytes`/
  `registered`, so a consumer walking a history needs no second call per version.
- `documents` — **1 when the chain is non-empty, 0 when it is empty.** Sixty rows here
  are sixty versions of ONE document, and the answer says so in a field rather than
  leaving a consumer to infer it from a count. Reading them as sixty documents is the
  false-coverage failure `STORE-AS-CACHE.md` names, arriving at the document level.
- `at` / `at_index` / `predecessor` — present only when `at=` is given. **`predecessor`
  is the row immediately before the anchor in date order at the SAME address.** A null
  predecessor at `at_index` 0 is the oldest version saying so: an honest absence, not a
  lookup that failed.
- `limit` (the cap **APPLIED**, after clamping, never the number asked for), `offset`,
  `count`, `total` and `truncated` — REC-57/59/60's envelope in the plane's existing
  spelling (`op=readingname`'s `limit` beside `truncated`, the closest sibling: a KEYED
  read whose answer is a list). Default 200, ceiling 1000. It joins REC-59's roster, and
  `bounds.test.mjs`'s roster pin moves **16 → 17** with a dated reason.

**ORDER IS `first_retrieved`, never `last_retrieved`** — the latter moves every time the
target holds still and would reorder a settled history as a side effect of re-checking
it. `capture_sha` is the tiebreak, so the order is TOTAL and `offset` paging can neither
repeat nor skip a version.

**GATED at `register.bundle_id`** through the plane's one `#bundleGate`, and `total` is
counted through the SAME join and the SAME predicate as the rows, so a total larger than
the pages can reach — the way hidden stops being identical to absent — cannot arise. A
withheld version is withheld WHOLE (REC-36), an anchor naming one refuses IDENTICALLY to
an anchor naming a capture the record does not hold at all, and nothing publishes how
many were withheld, because that count is the leak.

### D-221 is discharged by the SHAPE, not by a patch

`heldMatch` (`civicos-ui/app.html`) finds prior captures with `locator:"<url>"`.
`locator` is FTS-indexed, a fielded query on an `fts` field compiles to a TEXT ATOM, a
text atom creates a rank arm, and the default order is therefore RELEVANCE. Every
capture at one address carries identical URL text, the bm25 scores tie, and the declared
tiebreak `bundle_id ASC` decides — so the *"changed from"* sentence written permanently
into a new bundle can name a snapshot twelve months old.

**That is not a description here, it is a MEASUREMENT.** `versionchain.test.mjs` drives
both routes over a sixty-version fixture and records what each returns: the FTS route
puts **the OLDEST version first**, exactly as D-221 predicted; the join returns the
fifty-ninth, which is the true predecessor computed in JavaScript from the fixture and
never read back out of the op. Negative control (3) re-breaks the derivation to name the
oldest again and the suite fails **naming the predecessor it should have picked**.

### DELEGATION — RECORD → UI (the consumer this IC exists for)

**`civicos-ui/app.html` is UI's path and was not opened.** What is owed there:
`heldMatch` (~`app.html:13614`) should ask `op=versionchain&address=<url>&at=<this
capture's sha>` and take `predecessor`, instead of running `locator:"<url>"` through the
search compiler and returning on the first comparable row. The sentence written at
~`app.html:13485` is **permanent in the bundle it is written into**, so every day this
runs on the search is another bundle carrying a wrong predecessor. The join answers the
exact question the search was approximating, so this is a replacement rather than a
patch, and D-220's row calls it consumer (1) for that reason.

### Measured, not asserted

`node scripts/battery.mjs versionchain` green at 91; the full battery **110/110 at
6,486** from a baseline of **109/109 at 6,387** measured in this worktree before any
edit (and measured twice), with the **+99 attributed per suite** (versionchain +91 new,
bounds +5, hygiene +3 — the three per-suite hygiene arms every new suite file earns) and
**every other suite byte-identical**. `node scripts/coverage.mjs --strict` run directly
with `$?` unpiped, **exit 0**: OPS 137 → **138, all reached through the control plane**;
CHECKS 61 → **64, all named**.

### What is NOT claimed

- **The join's COST is not measured.** The suite asserts the seek column is the one the
  existing index is built on and that the SQL is an equality rather than a scan; it runs
  no timing, and a correct query that happened to be slow would pass. Said plainly.
- **No consumer is wired.** D-220 names six; this item builds the surface and delegates
  consumer (1) to UI. **Consumer (2), MONITORING PER ADDRESS, is the largest and is NOT
  addressed here** — `#monitorCadencePlan`/`#monitorCadenceTick` still select PER BUNDLE,
  so sixty versions of one calendar remain sixty independent monitor subjects fetching
  one address on sixty schedules. That is a behaviour change with its own blast radius
  and belongs in its own item.
- **No `supersedes` edge, and no derived version table.** Asserted structurally, in both
  directions: the readers are re-run over a source that DOES carry the forbidden thing
  and must find it.
- **I5 is NOT touched**: no table, column, index or `purge` change.

### RESPONSES — awaited

- **UI** — **AFFECTED, with a DELEGATION above.** Nothing existing moves and nothing
  breaks; what is owed is the `heldMatch` replacement that closes D-221 at the site.
- **DIST, CAPTURE, CONTENT-\*, FRAMEWORK** — expected NOT-AFFECTED; none reaches it.
---

## IC-28 · I3: `op=airunlog` applies a bound where it applied none, and publishes it · PROPOSED, RESPONSES, RESOLUTION, CHANGING, CHANGED AND SETTLED 2026-08-07 (REC-70) — the RESOLUTION and the version bump are CONDUCT's

> **RENUMBERED IC-27 → IC-28 at integration, 2026-08-07 by CONDUCT.** PL-10 and REC-70 ran in parallel slots and **each filed an IC-27**, neither able to see the other — PL-10's is `op=versionchain` and merged first, so under the established collision protocol its number stands and the later allocation moves. Nothing in this entry's substance changes. Recorded rather than silently swapped, because the worker's report, its claim and its suite header all name IC-27.

### 1 · PROPOSED

**Interface:** I3 (the op contracts), owned by RECORD, currently 10.1.0. **I5 is NOT touched** — no table, column, index or `purge` change.

**The change, on one read op.** `op=airunlog` previously returned **every row of a run's append-only observation log**, with no bound, no paging and no truncation marker. It now:

- applies a bound — **default 200, ceiling 5000** — and accepts an OPTIONAL `limit` parameter it previously ignored;
- publishes `limit`, the cap **AFTER clamping** (never the number the caller asked for), and `truncated`, whether it bit;
- publishes both keys **on the not-found answer as well**, because REC-30's rule is that an unknown run and an unviewable one must read identically, and an envelope present on one and absent from the other is a difference a caller can measure.

**Nothing else moves.** `run`, `found`, `status`, `entries` and their fields, `stopped`, and the four `vocabulary` sets are byte-unchanged; the `ORDER BY seq` ASCENDING ordering is unchanged; the `#bundleGate` on `context_id` is unchanged; the bound is asserted **viewer-independent**; the vocabularies are **not** truncated with the entries, because they describe the rows rather than being rows.

**NEITHER FIGURE IS NEW, and the PAIR is deliberately not copied whole from either sibling** — this log has two readers with opposite needs and no existing pair serves both:

- **200** is `op=exportlog`'s default (`EXPORT_LOG_LIMIT_DEFAULT`, REC-57), the plane's **only other append-only, `seq`-ordered log read**. The default belongs to the reader who is CHECKING a run (§11: *"the log is what lets anyone else CHECK"*), and a checker wants a page.
- **5000** is `op=list`'s ceiling, which `op=projection` reused at REC-59 and the meaning layer reused at REC-60 rather than minting a second. The ceiling belongs to the OTHER reader — **§14b.7's RESUMED run**, which reads its own log to continue rather than restart, and for which a cut it cannot see is work silently redone. `op=exportlog`'s 1000 was sized for an administrator scrolling exports; the meaning layer's 500 default is sized for a member exploring a graph that grows on D-224's quadratic curve. A run log is neither.

**ONE ORDERING DECISION IS STATED RATHER THAN INHERITED.** `op=exportlog` orders `seq DESC` — an administrator wants the newest export. This op keeps ASCENDING order, so **the cut falls at the END**. Reusing the sibling's ordering along with its default would have handed §14b.7's resumed run the END of its own history and called it the beginning.

### 2 · WHY, AND WHY IT IS A BREAK RATHER THAN ADDITIVE

The keys are additive. **The bound is not**: a caller that received every observation today receives the first 200 tomorrow. Filed as a break for IC-3's settled reason, applied at IC-20, IC-22, IC-24 and IC-25 — *recording a break as additive because nobody happened to be reading it would teach this registry to lie.*

The defect is **BOUNDEDNESS, not honesty** (REC-60's distinction). The op applied no bound, so it published none and told no lie; what it did was **grow without limit**. A run's log grows **one row per tick and nothing caps the tick count** — `RUN_BOUNDS` bounds fetches, sub-sessions and wall time, never observations.

### 3 · WHAT THIS IC IS ACTUALLY ABOUT, AND IT IS NOT THE OP

**REC-70's subject is that the ratchet built to catch exactly this class did not see it.** `test/meaning-bounds.test.mjs` exists to fail the build when a new read publishes a collection off an unbounded row source. `op=airunlog` appeared in **none of its three buckets**, so nothing went red; it was found by hand, by CONDUCT, at UI-49's integration.

**THE CAUSE, NAMED:** that walk graded only return objects containing the literal **`ok: true`**, and this method's success answer says **`found: true`**. One success spelling was hard-coded as if it were the only one — four lines after the same file wrote its bound and completeness keys as SETS *"because the plane answers the second in five spellings on purpose"*. The instrument avoided the one-vocabulary mistake in its leaves and committed it at its root.

**MEASURED 2026-08-07, and it was never one op.** `store.mjs` dispatches **156** ops; the walk graded **55**. **27 dispatched ops answer success without `ok: true`** — `found: true` (`op=airunlog`, `op=airun`, `op=airuntick`) or **no marker at all** (`op=signerlist` → `{ signers }`, `op=publishedlist` → `{ bundles, cases }`, `op=inboxlist` → `{ inbox }`, `op=memberlist`, `op=verify`, `op=index`, `op=thread`, …). **Fourteen of them were BARE all along.** The walk now grades every return that does not DECLARE ITSELF A REFUSAL (`ok: false`), reaching **82 of 156**, and its bare-roster ratchet is corrected **27 → 40** with a dated reason. **The old 27 was never a smaller problem; it was a smaller measurement.**

**AND THE FIX IS NOT `ok: true` ON THIS METHOD.** Adding the marker would have bought a green walk and left the blindness for the next op that spells success a third way. `aiRunLog` keeps `found: true` deliberately, which is what makes the corrected walk's verdict on it evidence rather than a coincidence.

### 4 · CONSUMER IMPACT, MEASURED IN THIS TREE AND NOT INHERITED

Walked over the repository (`grep -a`, excluding `node_modules`, `dist/`, `.git`):

- **NO CALLER ANYWHERE REACHES `op=airunlog`.** `civicos-ui` mentions it only in prose and **pins that it does NOT call it** — `surface-registry.test.mjs` ARM X5 and ARM Y14 both assert the `__AI_SESSION__` block asks `op=airun` *"and nothing else"*. UI-49 decided the observation log is a separate surface and did not build it.
- **`newgroup`, `docprofile`, `pdf-worker`, `tools` — NOT AFFECTED**, no call site.
- **The battery:** `airun.test.mjs` drives `op=airunlog` at 6 sites, none asking for more than 200 rows, and **none broke**.

**ONE STALE REASON CREATED BY THIS CHANGE, and it is a UI path this session does not edit.** `civicos-ui/app.html` (UI-49's `__AI_SESSION__` block) gives four numbered reasons for keeping the log a separate surface, and **reason 4 is *"AND IT PUBLISHES AN UNBOUNDED COLLECTION… a surface with a bound it cannot state"***. That reason is now false. **Reasons 1–3 are untouched and the decision stands** — this does not reopen it, it removes one of its supports. Delegated to UI in `CLAIMS.md` 2026-08-07. No suite fails; nothing announces it, which is why it is written here.

### 5 · WHAT IS NOT CLAIMED

**No cursor is minted** (REC-55's declined-second-copy rule), so **a caller cut at the 5000 ceiling has no way past it** — a run emitting more than 5000 observations cannot replay its log whole through this op. Stated here rather than discovered later. **This closes no oracle and fixes no disclosure**; the ground is unbounded growth and nothing else.

**And D-227 is open and applies here.** The corrected walk grades what a method PUBLISHES, so an envelope left honest over a scan whose `LIMIT ?` was removed still reads as bounded — CONDUCT measured that at REC-60's integration, and REC-70's negative control **(1b) reproduces it on this op**. This op's SQL bound is therefore pinned **directly, off its own comment-stripped segment**, rather than inferred from its answer. That closes the gap for `op=airunlog`; **it does not close D-227**, which still holds for the three ops (`op=readingname`, `op=queue`, `op=audit`) the walk grades BOUNDED while they carry an unbounded scan beside the bounded one.

### 6 · CONSUMER RESPONSES

Awaited. RECORD does not answer on UI's behalf; the one UI impact is a stale comment, delegated with its exact site.

### 7 · STATUS

**PROPOSED, with the code landed on REC-70's branch.** **The I3 version bump and the RESOLUTION are NOT taken by this session** — the registry entry is CONDUCT's to move at integration, per IC-25's precedent. RECORD's position: the bound is right. Before this change the truth was available to nobody; after it the truth is on the wire and there is no consumer to break.


### RESPONSES · RESOLUTION · SETTLED — recorded by CONDUCT 2026-08-07 for IC-27 AND IC-28 together

**They are settled in one act because they landed in one integration and collided twice** — see the note at IC-28's head — but they are **two separate changes and are versioned as two.**

**RESPONSES.** CONDUCT answered for the consuming areas (the IC-1 precedent). **RECORD** — AGREE, producer of both. **UI — AFFECTED BY IC-27 AND IT IS THE REASON THAT ONE MATTERS**: `heldMatch` composes a *"changed from"* sentence off an FTS lookup that PL-10 measured returns **the oldest version at the address**, and that sentence is **written permanently into the bundle** — routed as **UI-50**. UI is NOT affected by IC-28: **no caller anywhere reaches `op=airunlog`, and the UI positively pins that it does not.** **DIST, CAPTURE, CONTENT-\*, FRAMEWORK** — NOT AFFECTED by either.

**RESOLUTION — BOTH ACCEPTED as ADDITIVE.** IC-27 adds one new read op and removes nothing. IC-28 gives an existing op a bound it never had, publishing the applied cap and truncation state — **and unlike IC-25 the impact is nil and MEASURED so**, because the op has no consumer at all.

**What settles IC-27 as SOUND rather than merely additive, and it is the trap it was built around:** *the link Bob asked for is the JOIN, EXPOSED* — the index already existed, and **no edge was added, proved rather than promised**. `schema.mjs` is unmodified, the diff carries zero deletions, and the suite asserts over comment-stripped real sources that no supersedes/predecessor/version-edge name exists, that both tables carry exactly their original columns and indexes, and that `captured_locators` has exactly one writer — **with every reader run a second time over a source that DOES carry the forbidden thing and required to find it.** Its assumption sweep **THROWS** if the pre-existing indexes are absent from both real sources, **because PL-8's probe — which reported a 97% saving from an index that already existed — is why that is a throw and not an assertion.**

**What settles IC-28, and it is a finding about our instruments rather than about the op:** the bound is right, but the op reached this roster only because REC-70 corrected a walk that **graded 55 of 156 dispatched ops while reading as a complete sweep.** The ratchet moves 27 → 40, **and a FLOOR is added — because a ceiling passes trivially over nothing, so REC-60's ratchet could only ever have failed from a reader that GAINED sight, never from one that LOST it.**

**SETTLED. I3 10.1.0 → 10.2.0 (IC-27) → 10.3.0 (IC-28).** I5 NOT touched by either. **Open against IC-28: D-227 is reproduced and closed FOR THIS OP by a direct SQL pin, and still holds for `op=readingname`, `op=queue` and `op=audit`** — which the walk grades BOUNDED while an unbounded scan sits beside the bounded one. Riding REC-66.


---

## IC-29 · I3: `op=basisversions`, the version set of an inquiry's basis · I5: two new projection tables · PROPOSED, RESPONSES, RESOLUTION, CHANGING, CHANGED AND SETTLED 2026-08-07 (PL-1 / IS-1) — the version bump and the RESOLUTION are CONDUCT's

### 1 · PROPOSED

**Interfaces:** **I3** (the op contracts), owned by RECORD, currently 10.3.0 — **ADDITIVE**. **I5** (the store schema), **TOUCHED**: two new tables, two new index pairs, two new `purge` entries, two new `op=stats` counts.

**The change, in one sentence:** an inquiry's basis now carries **named, frozen, alternative VERSIONS** — each a complete account of the support for the question, with its ground partition, the AND/OR relationship it states, the `derived_from` edge it came along, the run that proposed it and a hide-only prune flag — authored in `bundle.md` and read back through one new op, `op=basisversions`.

**ADDITIVE FOR EVERY EXISTING CALLER, and the shape of that claim matters more than usual here.** No op is renamed. No refusal reason, class, gate or ordering moves. No existing key is removed, renamed or reshaped. `inquiry_basis` is **untouched** — not a column, not an index, not the projection that writes it — so `op=inquirystrength`, `op=earnedbasis`, `op=meaningrows` and every strength derivation answer byte-identically for every input. An inquiry with no version block behaves exactly as it did, and **every inquiry in the record today has none**.

**THE ONE NEW REFUSAL SURFACE ON AN EXISTING OP.** `op=promote` gains three refusal reasons — `BASIS_VERSION_REFUSED`, `VERSION_LEG_UNRESOLVED`, `VERSION_FROZEN` — reachable **only** by a document that carries a `basis_versions[]` block. A caller that promotes today is not refused tomorrow. Each carries a C-number (C-25.1 … C-25.18), a DEC-49 wire `code` and a **canned translation**, read from ONE row in `checks/bio-checks.mjs` (`BASIS_VERSION_CHECKS`), with **no second copy anywhere** — asserted, and the C-numbers counted over comment-stripped source so a second literal fails.

**THE NEW OP.** `op=basisversions&id=<INQ-…>` · classes `admin`/`member`/`probe` · `mutating: false`. Answers `{ ok, inquiry, inquiry_present?, versions[], count, total, limit, offset, truncated }`, enveloped in **`op=versionchain`'s own vocabulary** (`limit` after clamping beside `truncated`, with `offset`) — reused rather than a thirteenth spelling minted, because it is the same KIND of read: a keyed lookup whose answer is a list. Its 200/1000 pair is `op=versionchain`'s. Each version carries `name`, `description`, `relationship`, `grounds[]`, `state`, `derived_from`, `hidden`, `claim`, `run`, `author`, `at`, `regroup`, `composition`, `leg_count`, `legs_complete` and `legs[]`.

**THERE IS DELIBERATELY NO WRITE OP, and that is the item rather than an omission.** Versions are a **projection of `bundle.md`**, written delete-then-insert inside `op=promote`'s single transaction beside `inquiry_basis`. A version table an op could append to directly would be a second authority for a fact the document already holds — **the second-place-to-state-a-fact D-21 forbids**. It is PINNED rather than promised: the suite counts write sites over comment-stripped real source (exactly one per table, both inside `promote`'s own body), counts the tables in `schema.mjs` (exactly two), and **re-runs both walks over a source that DOES carry a second write site and a third table and requires them to find it**.

**I5's TWO TABLES,** `inquiry_basis_versions` and `inquiry_basis_version_legs`, placed **before the `host_governor` block** and added to **`purge`'s `TABLES` list (D-113)** and to `op=stats`, with the D-113 consequence proved through the op rather than asserted.

**THREE SHAPE DECISIONS worth a reader's attention:**

- **`relationship` is a FIELD and not derived from the partition.** The partition alone implies the arithmetic, so a field that could only ever agree would be a checkbox and a second statement of one fact. It is here because it **can disagree**, and the disagreement is REFUSED (C-25.4): DEC-32's keystone is that the structure is authored before the strength is shown, an AI-composed version arrives structure-and-strength together, and the stated relationship is what a member affirms at the accept ceremony. Its **absence** is refused outright (C-25.3) rather than defaulted to `and` — §3: *a version with no relationship field would re-ship the flat-AND basis REC-42 corrected*.
- **`composition` is the canonical composition ITSELF, not a digest of it.** `op=promote` is synchronous and this plane's sha256 is `crypto.subtle`'s, which is not; a hand-rolled synchronous hash would put a collision argument underneath the freeze. A byte comparison also **names which field moved**, and the refusal does.
- **`run` has no foreign key and `op=promote` does not resolve it** — a **stated departure** from the resolve-or-refuse posture `subject_entity`, `action_basis` and `supersedes` all take. §14b.7: *a version survives the death of the run that proposed it — identity is not the run's.* Requiring resolution would make version identity a child of a scratch row's lifetime, and §14b.7's resumed run is exactly that case.

**MEASURED CONSUMER IMPACT: NIL, and re-measured rather than inherited.** `civicos-ui`, `newgroup`, `docprofile`, `pdf-worker` and `tools` reach neither the new op nor the new frontmatter keys — the op did not exist before this commit. UI-42 and UI-45 are the intended consumers and are UI's to schedule; they DEPEND on this item and were not built against an earlier shape.

**NOT CLAIMED.** No oracle is closed and no disclosure fixed. The D-15 gate on the new read is applied through the one compilation point every read uses, and **what it actually buys is the fail-closed arm**: `viewerPredicate` filters PROJECT bundles and nothing else, and an inquiry is not a project, so the participation arm cannot bite on this subject today. That is stated at the site, in `gate-reads.test.mjs`'s classification, and here — a classification that overstates what a gate buys is worse for the next reader than none.

### 2 · RESPONSES

*(Awaiting. RECORD is the owner. UI is the only listed consumer of I3 that this reaches, and it has nothing to migrate: the op is new and unconsumed.)*

### 3 · RESOLUTION

*(CONDUCT's. The version bump is CONDUCT's — IC-25's precedent.)*


### RESPONSES · RESOLUTION · SETTLED — recorded by CONDUCT 2026-08-08

**RESPONSES.** CONDUCT answered for the consuming areas (the IC-1 precedent). **RECORD** — AGREE, producer. **UI** — NOT BLOCKED and it gains something: `op=basisversions` is live, and **hidden versions are RETURNED AND FLAGGED, never filtered — the display shrinks, the query still answers**, which is the right side of that line for UI-42/UI-45 to build against. **DIST, CAPTURE, CONTENT-\*, FRAMEWORK** — NOT AFFECTED.

**RESOLUTION — ACCEPTED. I3 ADDITIVE; I5 IS TOUCHED and that is the part worth stating.** I3 gains one read op and three refusal reasons **reachable only by a document that carries a version block**, so nothing existing is renamed, reshaped or newly refused. **I5 gains two projection tables, two index pairs, two `purge` entries and two `op=stats` counts** — declared here rather than left to be discovered, because I5 is the store schema and a table that exists without a `purge` entry makes a whole-store purge report scope ALL and silently leave rows (D-113). Both are in `purge` and the control proves it: **remove one and hygiene names the table.**

**What settles it as sound rather than merely additive**, each measured rather than asserted:
- **There is no second version table**, pinned over comment-stripped real source and **re-run over a source that DOES carry one and required to find it.**
- **Freezing is a byte-compared canonical composition rather than a digest** — chosen because `promote` is synchronous and this plane's sha256 is not, and **a hand-rolled synchronous hash would put a collision argument underneath the one rule that says two members comparing a version are comparing the same thing.** The refusal names WHICH field moved.
- **A version survives the death of the run that proposed it**, demonstrated by deleting the run's rows and reading the version back byte-identically — **enforced by the ABSENCE of a join**, which is the honest way to enforce an independence.

**THE STATED LIMIT, recorded rather than glossed:** the D-15 gate on this read buys only its **fail-closed** arm, because `viewerPredicate` filters PROJECT bundles and an inquiry is not a project. **A classification that overstates what a gate buys is worse for the next reader than none** — so it is written at the site, in the gate classification, and here.

**SETTLED. I3 10.3.0 → 10.4.0; I5 gains its tables.** Open against it: **PL-2 owns wiring the transitive basis-cycle check at the accept path** — self-reference is refused here, but a leg naming an inquiry that transitively rests on this one is refused only when a version's legs BECOME the basis, and **that path is IS-2's and is not built.** Recorded rather than half-built, because a second cycle walk would drift from the first.

---
## IC-30 · PL-12 / D-84 — the BIAS OBJECT: four new ops, two new tables, and a new bundle type

**PROPOSED 2026-08-07 by `is-wave-pl12` (RECORD); RENUMBERED IC-29 → IC-30 at the rebase, 2026-08-08.** PL-1 landed on `main` while this item was running and its entry took IC-29, which is now SETTLED above. Neither session could see the other; under the collision protocol the earlier merge keeps its number and this one moves. **The same collision moved this item's check family from C-25.x to C-26.x** — see the note at `BIAS_CHECKS` in `bio-checks.mjs`.

The I3 version bump and the RESOLUTION are **NOT** taken by this session — the registry entry is CONDUCT's to move at integration, per IC-25's precedent. **I3 stands at 10.4.0 as this is filed** (IC-29 took it from 10.3.0), and I5 has just been touched by IC-29 as well: this item's two tables are the third and fourth to land in that window.

### 1 · WHAT MOVES

**A NEW CANONICAL OBJECT TYPE.** `bias` joins `OBJECT_TYPES` as a fifth canonical type with the `BIAS-` id prefix, the heading set `## Statements · ## Adoption · ## What This Does Not Enforce · ## Session Log · ## Review Notes`, the state machine `draft → proposed → adopted → retired`, and the schema stamp `bias@1`. Ten C-numbers are allocated (**C-26.1 … C-26.10**), each with a DEC-49 error code and a canned translation read from ONE place. **RENUMBERED FROM C-25.x at integration, 2026-08-08**: PL-1 landed on `main` while this item was running and allocated C-25.1–C-25.18 for the basis-version family. Neither session could see the other; under the collision protocol PL-1 merged first, so its numbers stand and this later allocation moves. C-26 was verified free on `main` before the move — the only `C-26` strings in `store.mjs` name item REC-26, not a check.

**FOUR NEW OPS, all additive; nothing is removed and no existing shape moves.**

| op | mutating | what it answers |
| --- | --- | --- |
| `op=biasmanifest` | no | the EFFECTIVE SET in force for a scope, its `statements_sha`, the bundles-and-revisions in force with their pins, the RESIDUE, and any lock violations. Enveloped: `limit`/`offset`/`count`/`total`/`truncated`. Gated. |
| `op=biasadopt` | yes | the AUTHORED, ATTRIBUTED adoption and its PIN (DEC-54 c, d). `author` is server-stamped from the session; a machine credential is refused C-26.9. |
| `op=biasinhale` | **no** | reads an external policy and PROPOSES. Splits BARS from bias statements (DEC-54 a) and publishes the unenforceable RESIDUE at the same rank as the extraction (DEC-54 b). |
| `op=airunspawn` | no | the run's spawn payload per half. §14's FENCE, as an object an assertion can read. |

**ONE PUBLISHED SHAPE GAINS A FIELD.** `op=airun`'s `session` gains a `bias` block: `{ in_force, stated, manifest, now, moved }`. **It is ADDITIVE — no existing key moves, is renamed, or changes type.**

**TWO NEW TABLES** (I5): `bias_statements` (a projection of the bundle's own `statements[]`, D-21) and `bias_adoptions` (the authored act and its pin). Both are in `purge`'s `TABLES` list, and a project-scoped adoption also clears on `scope_id`.

### 2 · WHY THE `op=airun` FIELD IS NOT A BREAKING CHANGE, AND WHY IT MATTERS ANYWAY

**MEASURED, not assumed:** before this change `op=airun` published **no bias field of any kind**. `ai_runs.bias_manifest` was written by `op=airunopen` and read by nothing. So `INVESTIGATIVE-SESSION.md` §3's honest absence — *"no manifest was in force," STATED* — was **stated nowhere a reader could see it**. The run held a column and the answer was silent, which is DEC-56/57/58's ruling exactly: an unstated limit reads as completeness.

The field is therefore new rather than changed, and **the run now distinguishes three answers where it published none**: no manifest was in force · the lens the run carried is the lens the record holds · **the lens has MOVED since, so the run's output owes a re-run** — which is ordinary BIAS DEBT, disclosed, travelling, blocking nothing (DEC-20, D-188).

### 3 · WHO CONSUMES IT

**`op=airun`'s only consumer is `civicos-ui`'s running-session indicator (UI-49)**, whose renderers are FIELD-NAME-BLIND: they print published name/value pairs verbatim in publication order and know no field names. A new key is therefore rendered rather than ignored, and nothing breaks. **The three bias ops have no consumer at all** — the surfaces that would read them are D-189's, which is open and explicitly sequenced behind D-84.

### 4 · WHAT IS NOT CLAIMED

**No cursor is minted** on `op=biasmanifest` (REC-55's declined-second-copy rule), so a caller cut at the 2000 ceiling pages with `offset` and nothing else. **`statements_sha` covers the WHOLE set before any bound is applied** and is stated as doing so, because a manifest hash that moved with `limit` would make two runs under one identical lens cite two different manifests.

**The malformedness and bar predicates are NARROW and are not claimed to be complete.** The doctrine's own safeguard 5 says why: *pattern statements and artful language are not fully machine-judgeable, and the design does not pretend otherwise.* What is guaranteed is that nothing on a shared subject is QUIET.

**No lens DIFF op is minted.** PL-12 makes the diff COMPUTABLE — two scopes, two manifests, two hashes, statements addressable by `(bundle_id, statement_id)` — and the accept ceremony that renders it is a later item.

### 5 · STATUS

**PROPOSED, with the code landed on this session's branch and REBASED onto `a24f2b0` (PL-1) on 2026-08-08.**

**Measured against `main` AFTER the rebase, which is the only baseline that means anything now:** battery **111/111 at 6,607 → 112/112 at 6,746**, the **+139 fully attributed** (bias +127 new, bounds +9, hygiene +3), **no other suite moved**. The baseline was measured in this worktree by checking `a24f2b0` out over `bio-plane/` and removing this item's two new files, then restoring and verifying by sha256 **and** by 23 content markers. `node scripts/coverage.mjs --strict` run DIRECTLY with `$?` read UNPIPED: **exit 0**, OPS 139 → 143 all reached, CHECKS 82 → 93 all named. **THIRTEEN negative-control arms RUN** after the rebase, every restore verified by content as well as by hash.

**The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`, VF-2) exits 1 at 32 failures BOTH WITH AND WITHOUT this item** — the offending-code sets are byte-identical, diffed rather than eyeballed, so **PL-12 contributes zero**. The one code it found that WAS ours is fixed: `BIAS_REFUSED`, the ENVELOPE of the write-path refusal, whose `findings[]` each carried a translation while the envelope carried none — now **C-26.11**, with negative-control arm 7 over it. The remaining 32 are `promote`'s pre-existing refusals brought under the guard by PL-1's `where`, and are DELEGATED to CONDUCT rather than absorbed here.

**Earlier figures, superseded and kept because the delta they describe is still this item's:** before the rebase, 110/110 at 6,521 → 111/111 at 6,659, +138 attributed the same three ways.


## IC-30 · I3: SIX new act ops — the sixth state machine over an inquiry's basis versions · I5: three additive nullable columns · PROPOSED 2026-08-08 (PL-2 / IS-2) — the version bump and the RESOLUTION are CONDUCT's

### 1 · PROPOSED

**WHAT CHANGES, and it is additive in both interfaces.**

**I3 gains SIX mutating ops** — `op=versionaccept`, `op=versionreject`, `op=versionconsider`, `op=versionrevert`, `op=versioncurrent`, `op=versionhide`. They are the member acts of **the SIXTH state machine in this plane**, and INVESTIGATIVE-SESSION.md §6 rule 4 says so in those words. Each takes `target=<INQ-…>` and `version=<name>`; `reason` may arrive in the POST body because it is prose; `versioncurrent` additionally takes `project=<PROJ-…>`; `preview=1` runs every guard and writes nothing. All six are `contribute`-gated, `author` and `viewer` are server-stamped, and a machine credential REACHES all six and is refused `MACHINE_CANNOT_MOVE_VERSION` by the store rather than being absent from the table — conclude's fail-closed posture.

**I3's existing `op=basisversions` gains two additive fields and one optional argument.** Each version now carries `moved: { by, at, reason } | null` — who moved this reading, when and why, null on one nobody has moved. And an optional `project=<PROJ-…>` argument adds a top-level `current: { project, version, at, by } | null`; **absent the argument the field is absent entirely**, because §7 makes current a property of the PROJECT's relationship to the inquiry and a default project would be one team's stance read as everybody's.

**I3 gains TWELVE refusal codes** (`C-25.20`–`C-25.31`), every one with a DEC-49 canned translation, all reachable only by a caller of the six new ops. **The catalog gains one** (`C-25.19`, `VERSION_DISPOSITION_UNATTRIBUTED`) reachable only by a document that carries a version block already claiming a state §6 rule 4 requires a reason for.

**I5 is TOUCHED: three additive NULLABLE columns** on PL-1's `inquiry_basis_versions` — `state_by`, `state_at`, `state_reason`. **No new table** (PL-1 pinned the count at exactly two and it stands), no index change, no `purge` change, no `op=stats` change. A version projected before this item reads NULL on all three, which is exactly true of it: nobody had moved it, so there is nobody to name and nothing to explain. A non-null default would have invented an act.

**WHAT IS PUBLISHED, and §6 rule 4 requires it.** `op=affordances` now carries the machine itself — `version_states`, `version_edges`, `version_reason_required` — and the six acts, derived over the question's REAL version states. *"The machine publishes the new machine through op=affordances, or every surface showing version states holds a second copy of the rule — the drift class DEC-8 closed."* The tables are IMPORTED from the catalog that defines them and the store that enforces them; there is no copy.

**WHAT IS NOT CLAIMED.** No oracle is closed. The six acts are published only where the question's own readings make the move legal, so a question holding none publishes none — but that is DEC-8 hygiene rather than a disclosure property. `versioncurrent` writes §7's dated pointer onto the PROJECT's own `bundle.md` and mints **no settings row, no notification slug and no projection table**: the slugs, the shared-inquiry semantics and D-216's model check remain PL-13's, and this item does not pre-empt them.

**MEASURED CONSUMER IMPACT: ONE, and it is real.** `civicos-ui/test/surface-registry.test.mjs` ARM A4 requires every act the plane publishes to be hosted by a described surface, and **the six have no surface yet** — UI-42 (version review), UI-43 (the accept ceremony) and UI-45 (notifications) are the items that build them and all three list PL-2 as a dependency. The arm is correctly red and says something true. `newgroup`, `docprofile`, `pdf-worker` and `tools` reach none of this.

### 2 · RESPONSES

*(Awaiting. RECORD is the owner. UI is the affected consumer — see the DELEGATION in `CLAIMS.md`.)*

### 3 · RESOLUTION

*(CONDUCT's. The version bump is CONDUCT's — IC-25's precedent.)*


## IC-31 · I3: ONE new write op — the investigative session's suggest endpoint · I5: one additive nullable column and one scratch table · PROPOSED 2026-08-08 (PL-3 / IS-4) — the version bump and the RESOLUTION are CONDUCT's

### 1 · PROPOSED

**WHAT CHANGES, and it is additive in both interfaces.**

**I3 gains ONE mutating op: `op=suggest`.** It is the investigative session's ONE write — §4 group 2, *"It SUGGESTS — versions, in `suggested` state"* — and it is ONE endpoint for BOTH modes because §10 rules that *"Export means the AI adds a new version to the inquiry being investigated"*, so nothing the interactive mode can do lies outside what the background job could do. The composition arrives in the POST body (a description is prose held to a commit message's standard and a legs array is a structure; both would be truncated by the first proxy with an opinion about URL length — `op=biasinhale`'s recorded reasoning). `target`, `kind` and `run` may arrive either way. `author` and `viewer` are SERVER-STAMPED and never taken from the caller.

**THE SOLE POSSIBLE OUTPUT IS A `suggested` VERSION CARRYING ITS RUN**, and that is written as a LITERAL with no parameter behind it — §4's fence expressed as the absence of a variable rather than as a check on one. **All five of §9's kinds** — `basis-version`, `sharpen-question`, `new-inquiry`, `level-empty`, `new-edition` — write that one object; the kind is a FIELD on it and not a second endpoint, because five write paths would be five fences.

**I3 gains SEVENTEEN refusal codes** (`C-27.1`–`C-27.17`), every one with a DEC-49 canned translation. Sixteen are reachable only by a caller of the new op; **one (`C-27.15`, `VERSION_KIND_UNKNOWN`) is reachable by any DOCUMENT** carrying a version with a kind outside the closed set, and fires at `op=promote` and at the gate through `basisVersionFindings`.

**EVERY ROW NAMES A REGION AND NOT A WHOLE FUNCTION** (REC-71) — `is-suggest-shape`, `is-suggest-checks`, `is-suggest-write`, delimited by `DEC-49 REGION` markers. That is the rule applied at allocation time rather than paid for at integration, which is what PL-1's two whole-function `where`s cost.

**I5 is TOUCHED in two ways.** (a) ONE additive NULLABLE column `kind` on PL-1's `inquiry_basis_versions` — NULL on every version a member composed by hand, which is exactly true of it. **It is inside the frozen canonical composition and EMITTED ONLY WHEN PRESENT**: an unconditional line would change the composition of every version already in any record and the next promotion of any of them would fail PL-1's freeze. That is DRIVEN in the suite, not reasoned about. (b) ONE new SCRATCH-class table `suggest_refusals`, in `capture_sessions`' and `ai_runs`' family — F10's stored refusal, in `purge` in both arms and counted by `op=stats` (D-113). **Its name deliberately carries no `version` substring**, because PL-1 pinned the tables carrying versions of a basis at exactly two and this carries refusals.

**F10 IS A WIRE-VISIBLE PROPERTY, so consumers must know it.** A verbatim resubmit of a refused submission returns the STORED refusal with `evaluated: false`, `repeated: true`, `wrote: false` and a `repeats` counter, WITHOUT a second evaluation and without touching the record. The submission's identity includes the inquiry's `bundle_sha`, so the key cannot go stale into a false refusal: the moment the question moves, the same bytes are re-evaluated.

**THE ANSWER IS ENVELOPED** per IC-25/26/27/28/29/30: `limit` is the bound APPLIED, `truncated` is published on the empty answer too, and the bound REFUSES rather than truncates — a read cut at its cap must say so or a caller believes it saw everything; a write over its cap is turned away naming the bound. It also publishes `pair` (per axis, never composed), `shared_origins` (D-195's derivation, `[]` meaning the plane LOOKED) and `origins_complete`.

**WHAT IS NOT CLAIMED, and it is the honest half.** `op=suggest` is **NOT an ACT** and is a named `NON_ACTS` row: no member takes it, so no surface owes it and it adds nothing to UI-52's act register. It mints **no notification slug** — §9's kinds are FINDING-class slugs and the vocabulary, its subscriber and the shared-inquiry semantics stay PL-13's and PL-4's. It writes **no capture request** (PL-4's table) and **no credential class** (PL-11's, which will NARROW this op's classes from `admin/member/probe` to include `ai`; widening later is the safe direction).

**MEASURED CONSUMER IMPACT: ZERO surfaces, ONE product bound worth a consumer's attention.** `civicos-ui` reaches none of this (the harness is exit 0 with the floors moved and no new act on the register); `newgroup`, `docprofile`, `pdf-worker` and `tools` reach none of it. **The bound: a submission that RESTS on documents requires a NAMED MEMBER**, because PL-1's C-25.5 makes a version's partition total and C-25.15 requires every declared part to be asserted by a member. A machine credential can therefore write `level-empty` and cannot write a legged reading — refused BY NAME as C-27.13 rather than discovered at the write. See the DELEGATION in `CLAIMS.md`: this is a real product consequence and it is raised rather than engineered around.

### 2 · RESPONSES

*(Awaiting. RECORD is the owner. No consumer is affected today; FLEET is the consumer that arrives with FL-3.)*

### 3 · RESOLUTION

*(CONDUCT's. The version bump is CONDUCT's — IC-25's precedent.)*
