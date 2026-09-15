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

*(RESOLVED 2026-09-10 by CONDUCT #9 at the backlog pass — ADDITIVE, collapsed into I3 10.4.0 / the I5 catch-up note in `INTERFACES.md`; see "THE 2026-09-10 BACKLOG RESOLUTION" at the foot of this file.)*


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

*(RESOLVED 2026-09-10 by CONDUCT #9 at the backlog pass — ADDITIVE, collapsed into I3 10.4.0 / the I5 catch-up note in `INTERFACES.md`; see "THE 2026-09-10 BACKLOG RESOLUTION" at the foot of this file.)*


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

*(RESOLVED 2026-09-10 by CONDUCT #9 at the backlog pass — ADDITIVE, collapsed into I3 10.4.0 / the I5 catch-up note in `INTERFACES.md`; see "THE 2026-09-10 BACKLOG RESOLUTION" at the foot of this file.)*


## IC-32 · NEW INTERFACE I8 — `plane ↔ agent-worker`, the second fleet service binding · PROPOSED 2026-08-08 (FL-2 / VF-3) — the version bump and the RESOLUTION are CONDUCT's

### 1 · PROPOSED

**WHY THIS IS AN IC AT ALL, since a NEW interface changes nothing that exists.** It is
filed because `PARALLELISM.md` requires the registry entry to exist BEFORE anything is
built against it, and because one interface's ground genuinely moves: **I6's fleet
pattern gains a second instance and a second DIRECTION.** A change proposal is the
channel this project uses to tell a consumer that something it builds against has moved,
and DIST builds against the fleet's shape.

**WHAT IS ADDED.** `docs/development/INTERFACES.md` gains **I8**, PROVISIONAL, owner
`FLEET`, registered before the first commit of the worker's code (I6's precedent). Its
shape is in the registry and is not restated here.

**WHAT IS *NOT* CHANGED, and this is the load-bearing half.**

- **`I3` IS NOT BUMPED.** FL-2 adds **no op**, no `OPS` row, no table, no column and no
  check family. The member is a CONSUMER of I3's existing read surface under PL-11's
  credential; a consumer arriving is not an interface change, and bumping I3 for it
  would make the version number mean something it does not.
- **`I6` IS NOT CHANGED.** `pdf-worker`'s shape, bindings and behaviour are untouched;
  `pdf-worker/**` is not edited by this item at all. I8 COPIES I6's pattern rather than
  generalising it, deliberately: a shared abstraction over two members, the first of
  which is a pure function and the second of which calls back, would be an abstraction
  invented at n=2 over two things that are not the same shape.
- **`I1` and `I5` are untouched.** The member holds no R2 binding and no store binding,
  so it consumes neither.

**THE ONE THING I6's CONSUMERS SHOULD READ.** I8 gives its member a **`GET /version`**
endpoint, and I6's does not. Fleet rule 4 — *"a verification must establish which build
ANSWERED, for the member as well as the plane"* — is unverifiable for `pdf-worker`
today, because nothing on the wire names its build. That is a gap in I6 rather than a
gain in I8, it is filed as a DELEGATION to `CONTENT-PDF` in `CLAIMS.md`, and it is named
here so DIST's DS-4 rollout gate does not discover it at deploy time.

**MEASURED CONSUMER IMPACT.** `civicos-ui` reaches none of this (UI harness exit 0, no
new act, no floor moved in the DEC-49 guard — MEASURED, not predicted). `newgroup` and
`docprofile` reach none of it. `bio-plane/src/**` is not edited. The single plane-side
change is ONE `services` entry in `bio-plane/wrangler.jsonc` (`AGENT_WORKER`), which is
inert until DIST deploys the member — the same posture `PDF_WORKER` shipped in.

**VF-3 RIDES THIS PROPOSAL AND IS WHY THE FLEET FIGURE MOVES.** `coverage.mjs --strict`
enumerates the new member's SURFACE table in the same turn, and the instrument gains
four gates it did not have: a fleet FLOOR (members and surface ops), an
accounted-for-Workers cross-check (a directory carrying a `wrangler.jsonc` must either
be the plane, be explicitly named as not-a-member, or declare a `fleet-member.json` —
so HIDING a manifest now FAILS `--strict` instead of quietly shrinking the fleet), a
gate on a member whose SURFACE table cannot be found or is empty, and a gate on fleet
rule 2 (a member declaring a `mutating: true` surface op has left the fleet contract).

### 2 · RESPONSES

*(Awaiting. FLEET is the owner of the new entry. `DIST` is the affected consumer — DS-1
installs the fleet and DS-4 deploys it; the DELEGATIONS are in `CLAIMS.md`.
`CONTENT-PDF` is affected only by the `/version` gap named above, which is a DELEGATION
and not a required migration: nothing it has built stops working.)*

### 3 · RESOLUTION — CONDUCT, 2026-08-08

**ACCEPTED AS PROPOSED, and the load-bearing half is the half that changes nothing.**

- **I3 IS NOT BUMPED, and the proposal is right about why.** FL-2 adds no op, no `OPS`
  row, no table, no column and no check family — it is a CONSUMER of I3's existing read
  surface under PL-11's credential. **A consumer arriving is not an interface change**,
  and bumping I3 for it would make the version number mean something it does not. Seven
  bumps have gone through this file in two days (I3 is at 10.4.0); the discipline that
  keeps that number readable is refusing the ones that are not owed.
- **I6 IS NOT CHANGED**, and I8 COPIES its pattern rather than generalising it. That is
  the right call and it is worth recording as precedent: **a shared abstraction invented
  at n=2, over one member that is a pure function of bytes and one that calls back, would
  be an abstraction over two things that are not the same shape.** The direction of trust
  differs, and that is exactly what a separate entry is for.
- **I8 REGISTERED at 0.1.0, PROVISIONAL** — and it STAYS provisional. The registry entry
  schedules its own re-read rather than promising one, **because I6 sat PROVISIONAL for a
  week after its worker shipped.** FL-3 fills the `run` endpoint and re-reads the shape
  from the code that exists; that is when it becomes 1.0.0 and STABLE. **Nothing about
  this member is live-verified**: `wrangler deploy` was not run, the plane's
  `AGENT_WORKER` binding is inert, and D-108's rollout gate is untested for it. Marking
  it STABLE today would claim a verification nobody performed.

**THE `/version` GAP IS THE FINDING IN THIS PROPOSAL AND IT IS RECORDED AS I6's, NOT
I8's.** Fleet rule 4 — *a verification must establish which build ANSWERED, for the
member as well as the plane* — **is unverifiable for `pdf-worker` today**, because
nothing on its wire names its build. I8 has the endpoint; I6 does not. That is a gap in
the older interface surfaced by the newer one, delegated to `CONTENT-PDF`, and named here
so **DS-4's rollout gate does not discover it at deploy time** — which is precisely the
class `CLAUDE.md` records as *a deploy verified is not a build serving*.

### 4 · CHANGED / 5 · SETTLED — CONDUCT, 2026-08-08

**SETTLED.** `INTERFACES.md` carries I8 at 0.1.0 PROVISIONAL, owner FLEET, with its
re-read scheduled on FL-3. `I3` unchanged at 10.4.0; `I6` unchanged; `I1` and `I5`
untouched. Measured consumer impact confirmed at integration rather than taken on report:
UI harness exit 0, **the DEC-49 guard's output byte-identical to baseline** (no floor
moved and none owed — no member receives this Worker's codes), and `bio-plane/src/**` not
edited. The single plane-side change is one `services` entry in `bio-plane/wrangler.jsonc`,
inert until DIST deploys the member — **the same posture `PDF_WORKER` shipped in.**

---

## IC-33 · I8: `POST /run` gains the IS-9 control-flow table, and the "calls no mutating op" fence is CORRECTED to a pinned set · PROPOSED 2026-08-08 (FL-3 / IS-9) — the version bump and the RESOLUTION are CONDUCT's

### 1 · PROPOSED — FLEET, 2026-08-08

**Interface:** I8 (`plane ↔ agent-worker`), owner FLEET, at 0.1.0 PROVISIONAL. **I3 IS
NOT CHANGED — this item adds no op, no table and no check family.** It CONSUMES ops that
PL-3, PL-4, PL-5, PL-9 and PL-12 already landed.

**The change, in two parts.**

**(a) `POST /run`'s shape.** In: two optional fields, `judgements[]` (one per JUDGED row
of the control-flow table, consumed in order) and `max_steps` (a ceiling on table rows
walked in one invocation, ≤ 400). Out: nine additive fields — `trace[]`, `mode`,
`passes`, `resumed_from`, `logged`, `submitted`, `adjusted`, `refusals[]`,
`verbatim_resubmits`, `budget[]`, `ended` — plus `judgement_source`. **One field CHANGES
VALUE rather than being added: `stage` moves from `"round-trip"` to `"harness"`.**
`turns_run` stays `0`. Nothing is removed: FL-2's own DELEGATION to this item said *"do
not delete those two fields — replace their values"*, and `"round-trip"` had become a
false statement about what ran.

**(b) THE FENCE, AND THIS IS THE PART THAT NEEDS A DECISION RATHER THAN A NOTE.** I8's
registry entry and `agent-worker/src/index.mjs` both say **"it calls no mutating op."**
FL-3's acceptance cannot be reached under that sentence: *a budget exhaustion writes
`runtime-ceiling-reached`* needs `op=airuntick`, and *a refusal is followed by an ADJUSTED
submission in the trace* needs `op=suggest`. The sentence is replaced by its true shape:

- **an EXACT PINNED SET** of nine ops (`harness.mjs PLANE_OPS`), floor and ceiling both;
- **every MUTATING member of that set must be one PL-11's `AI_RUN_ACTIONS` declares**,
  asserted against `bio-plane/src/index.mjs`'s own source rather than a list kept in the
  member — so the record's declaration of what an agent's task scope may cover is the
  authority, and the plane's list shrinking fails the member's suite;
- **no scope, no class and no allow-list in the member.** D-199 (2) is untouched: naming
  an op the credential does not declare earns the plane's `AI_BEYOND_TASK_SCOPE`, passed
  through verbatim.

**Why the old sentence was tighter than the rule it enforced.** The FLEET plan row says
*"writes nothing DIRECTLY"*; PARALLELISM's fleet rule 2 says a member *"returns derived
output and writes nothing: no register row, no provenance, no capture"*; and PL-11's `ai`
credential class is specified as *"writes ONLY PL-3's endpoint and PL-4's table"* — **a
scope with no consumer if the member holding the credential may never name those ops.**
FL-2 made one read and could honestly promise the stronger sentence; FL-3 is the item
where that promise stops describing the design. The property FL-2 was protecting is
untouched and re-asserted: ONE binding, no store binding, no R2, no credential of its
own, no provenance this member writes, and a refused call still leaves the record
byte-identical.

**The alternative that was considered and rejected on a measurement.** The member could
return an ordered PLAN OF ACTS and let the plane perform every write — which is fleet rule
2 read at its most literal. **It is unbuildable from this item and would be wrong
anyway.** Unbuildable: the plane's calling side is `RECORD`'s, `bio-plane/src/**` reads
`env.AGENT_WORKER` nowhere, and FL-3 cannot edit those paths without breaking its own
claim. Wrong: it moves the loop into the plane, and the FLEET track's stated intent is
that *"the plane grows no model runtime"*.

**Consumers affected, and each answers for itself below:** `RECORD` (owns the calling
side — **not yet implemented**, so nothing to migrate), `DIST` (DS-1 installs, DS-4
deploys — **shape only, no deploy in this item**), `FLEET` (owns the code; FL-5 and FL-6
build on this table).

### 2 · RESPONSES

- **FLEET — AGREE.** It owns both halves and files the change.
- **RECORD — NOT-AFFECTED, and it is a measurement rather than a courtesy.** `grep -a
  AGENT_WORKER bio-plane/src/` returns nothing: the binding is declared in
  `bio-plane/wrangler.jsonc` and read by no code. No plane source is edited by this item,
  no op is added, no check family is minted, and no floor moves. There is nothing to
  migrate because nothing on the plane's side calls this member yet.
- **DIST — NOT-AFFECTED TODAY, WITH ONE THING TO CARRY.** No deploy, no version bump, no
  tag. DS-4's rollout gate gains no new subject. What DS-1 must carry is unchanged from
  FL-2's delegation: the member's `PLANE` binding must be TEMPLATED from the instance
  slug, because an installed instance's plane worker name is per instance (D-102).
- **`CONTENT-PDF` — NOT A CONSUMER of I8.** Named only because the `/version` gap
  delegated at IC-32 is still open for `pdf-worker`.

### 3 · RESOLUTION — **CONDUCT's, and the version bump is CONDUCT's**

FLEET's recommendation: **accept (a) and (b), and KEEP I8 at 0.1.0 PROVISIONAL.** The
re-read this entry's registry section scheduled on FL-3 was performed and its verdict is
recorded in `INTERFACES.md` under "The FL-3 re-read": the shape moved in this same item,
two of the three open-before-STABLE conditions are still open (FL-6's cascade, DS-4's
deploy), and **the interface has one implemented end.** An entry whose central prohibition
was rewritten this week is not a settled contract, and marking it STABLE would claim a
verification nobody performed — which is the same reasoning IC-32 used to refuse STABLE
at registration, applied to itself one item later.

**If CONDUCT prefers 1.0.0 now**, the shape in `INTERFACES.md` is written from the code as
it stands and needs no further reading; the disagreement would be about what STABLE means
here, not about what the code does.

**CONDUCT, 2026-08-08 — ACCEPTED IN FULL, AND I8 STAYS AT 0.1.0 PROVISIONAL. There is no
disagreement to resolve, and FL-3's third reason is the one that settles it:
`grep -a AGENT_WORKER bio-plane/src/` RETURNS NOTHING. The plane's calling side does not
exist.** An interface whose entire reason for being separate from I6 is that trust runs in
BOTH directions has **one implemented end** — so STABLE would not be a slightly generous
reading, it would be a claim about a direction no code takes. **That is precisely the
generous-direction failure this project keeps meeting** (`coverage.mjs` crediting a member's
surface from a source read while its suite ran nowhere; a fleet figure holding still while a
component went dark), and refusing it here costs nothing.

**AND THE FENCE CORRECTION IS THE LOAD-BEARING HALF OF THIS IC — ACCEPTED, with the reasoning
recorded because it is a lesson about how a fence gets written.** FL-2's
`"it calls no mutating op"` was **TIGHTER THAN THE RULE IT ENFORCED.** The plan row says the
member *"writes nothing DIRECTLY"*; PL-11's `ai` class is specified as writing *"ONLY PL-3's
endpoint and PL-4's table"* — **so FL-2's fence made PL-11's declared scope a scope with no
consumer, and FL-3's acceptance unreachable.** Two correct items, each right alone, meeting
at a reach nobody chose — the same shape DEC-65 records one layer over. **The fix is a
PINNED SET OF NINE OPS where every mutating member must be one PL-11's `AI_RUN_ACTIONS`
declares, READ FROM THE PLANE'S OWN SOURCE** rather than listed here, so the two cannot
drift. **The rejected alternative is recorded with its measurement rather than its taste:**
having the member return a plan for the plane to write is architecturally purer and is
**unbuildable from here** — `RECORD` owns the calling side, which does not exist — and it
moves the loop into the plane against the FLEET track's stated intent.

**A FENCE THAT IS TIGHTER THAN ITS RULE IS NOT A SAFER FENCE.** It is an undeclared
interface change wearing the costume of caution, and it is invisible until the item that
needs the reach arrives — one wave later, in this case. Worth carrying forward: when you
write a fence, pin it to the RULE's own text or to a set the rule's owner exports, never to
a stricter sentence of your own.

### 4 · CHANGED / 5 · SETTLED — CONDUCT, 2026-08-08

**SETTLED.** `INTERFACES.md` carries I8 at **0.1.0 PROVISIONAL** with FL-3's re-read and its
close-out checklist; the fence is the pinned nine-op set read from `AI_RUN_ACTIONS`. `I3` is
NOT bumped — no op, table or check family was added — and `I6` is untouched. Measured at
integration rather than taken on report: battery **123 suites / 122 green + 1 named skip at
7,659**, `--strict` exit 0 with the fleet at 2 members / 3 ops and `agent-worker` now
carrying two suites, UI harness exit 0, and **the DEC-49 guard unmoved because the guard
walks `bio-plane/src` and `checks` and this item touched neither.**

## IC-34 · I6 GAINS `GET /version` — the gap IC-32 named, closed · PROPOSED 2026-08-08 (CPDF-9) — the version bump and the RESOLUTION are CONDUCT's

**RENUMBERED FROM IC-33 AT INTEGRATION 2026-08-08 by CONDUCT.** FL-3 and CPDF-9 ran in
parallel, each measured IC-33 as the next free number over the real file, **and each was
right when it looked.** FL-3 merged first so its number stands and this one moves — the
same rule and the same direction as the C-29/C-30 family collision and the D-232 debt-row
collision, both earlier the same day. **Three collisions of one shape in one day is not
three accidents; it is what a raised concurrency budget costs, and the cost is paid by the
integrator rather than by the worker, which is the correct place for it.** CPDF-9's report
and claim name IC-33, and that is recorded rather than silently corrected.



### 1 · PROPOSED

**WHAT CHANGES, AND IT IS PURELY ADDITIVE.** `pdf-worker` gains one endpoint:

    GET /version  ->  200 { ok: true, name: "pdf-worker", version: <env.VERSION> }

and one row in its `SURFACE` table (`version: { method: "GET", mutating: false }`),
which is the table `scripts/coverage.mjs` reads to hold a fleet member to the plane's
own surfaces. Nothing existing moves: `POST /structure` keeps its request shape, its
response shape and its refusals byte for byte. The only other observable difference is
the 404 detail string on an unknown path, which now reads `POST /structure or GET
/version only` — a human-readable `detail`, not a code, and nothing parses it.

**WHY IT IS OWED.** Fleet rule 4 — *"a verification must establish which build ANSWERED,
for the member as well as the plane"* — **was unverifiable for this member**, because
nothing on its wire named its build. IC-32 §1 named exactly this gap when I8 shipped
with the endpoint I6 lacked, and CONDUCT's RESOLUTION recorded it as **I6's gap, not
I8's gain**, delegated to CONTENT-PDF. This closes it.

**THE EVIDENCE THAT IT IS NOT COSMETIC.** `CLAUDE.md`: *a deploy verified is not a build
serving.* Rollout is per-isolate and NOT atomic — seconds after a byte-identical
verification of 0.52.0, `/version` answered 0.51.0 and a probe answered by the old build
looked exactly like a security defect in the new one (D-108). The plane has an endpoint
that answers that question about itself; `pdf-worker` deploys and versions SEPARATELY,
so the same window exists for it and there was no way to ask. **DS-4's rollout gate
would have discovered that at deploy time**, which is the worst moment to discover it.

**THE VALUE COMES FROM THE BINDING, NOT FROM A CONSTANT.** It reads `env.VERSION`, which
`pdf-worker/wrangler.jsonc` has carried in `vars` since the member was written and which
NO handler read until now. A version endpoint reporting a compiled-in string would answer
the same thing whichever build was serving — an equality that costs nothing to produce.
The suite asserts the answer tracks the binding (bound to `9.9.9-probe`, answered
`9.9.9-probe`) and separately that the DEPLOYED binding is a real version rather than the
`0.0.0` fallback.

**IT IS THE SAME THREE LINES AS I8's, DELIBERATELY.** Copied from `agent-worker`, not
generalised: two members answering one question two ways is what makes a rollout gate
special-case its fleet. Same path, same method, same body keys (`ok`, `name`, `version`).

**WHAT IS *NOT* CHANGED.** No new binding, no new var, no `wrangler.jsonc` edit at all.
`agent-worker/**` is not touched. `bio-plane/src/**` is not touched — the plane does not
call `/version` today, and this proposal does not ask it to; DS-4's gate is the first
consumer. I1, I3, I5 and I8 are untouched.

**MEASURED CONSUMER IMPACT.** `civicos-ui` reaches none of this (UI harness exit 0, no
act, no refusal code — the member has no member-facing surface and `check-refusal-codes`
does not walk the fleet). `newgroup` and `docprofile` reach none of it. The one
instrument figure that MOVES is the fleet floor: `coverage.mjs`'s `FLEET_FLOOR.surfaceOps`
goes **3 -> 4**, taken from the figure the instrument PRINTED on a green run
(`FLEET 2 members beside the plane · 4/4 surface ops reached`), never by adding one to
the previous number.

**THE VERSION BUMP IS NOT TAKEN HERE.** I6 sits at 0.1.0 PROVISIONAL. This is additive,
so it is a MINOR under this file's own rules, but CPDF-9 does not write `INTERFACES.md`
and does not bump it — **CONDUCT takes the bump at integration**, exactly as IC-32's
resolution took I8's registration.

### 2 · RESPONSES

*(Awaiting. `CONTENT-PDF` owns the code and proposes. `DIST` is the affected consumer —
DS-4's rollout gate is the first caller of this endpoint and DS-1 installs the member;
the DELEGATION is in `CLAIMS.md`. `RECORD` owns the plane's calling side of I6 and is
unaffected: `op=pdfstructure` still calls `POST /structure` and nothing else.)*

### 3 · RESOLUTION

*(CONDUCT's.)*

## IC-35 · I3: `op=connect` bounds the DERIVATION and publishes what it bounded · PROPOSED 2026-08-08 (REC-66 / D-224, D-225's class one step earlier) — the version bump and the RESOLUTION are CONDUCT's

### 1 · PROPOSED

**WHAT MOVES.** `op=connect` (`store.mjs deriveConnections`) accepts a `limit` — from the POST
body or from `&limit=` — and its success answer gains four keys:

    limit             the PAIR bound APPLIED, after clamping (default 500, ceiling 5,000)
    document_limit    the DOCUMENT bound derived from it (32 at the default, 100 at the ceiling)
    documents         (EXISTING KEY, NARROWED) the documents the derivation actually READ
    resolution_rows   the rows the bounded scan returned
    truncated         whether the DERIVATION was cut — not whether an array was sliced

**THIS IS NOT REC-57's ENVELOPE ARRIVING LATE, AND THE DIFFERENCE IS THE ITEM.** IC-25 gave
three meaning-layer READS a bound on what they ANSWER. This op did **unbounded WORK**: it read
the entity's resolutions with no `LIMIT` and wrote one row per PAIR — k(k−1)/2 — so a cap on
the array it returned would have left the scan and the write exactly where they were. The
bound is therefore on the SCAN, and the answer's bound is a consequence of it. The document
bound is the INVERSE of the quadratic taken from the pair bound (`#maxEndsForPairs`), so the
two figures cannot disagree.

**THE BREAKING HALF, STATED PLAINLY.** For a subject with more than 32 documents (or 100 at
the ceiling), `op=connect` now derives and persists FEWER connections than it used to, and
says so. `count` and `documents` may be smaller than before for exactly those subjects; every
row it does write is unchanged, byte for byte, in grade, ordering, basis and `asserted_by`.
Below 32 documents **nothing moves at all** — the answer is the old answer plus four keys.

**THE FIGURES ARE MEASURED, NOT CHOSEN.** D-224 asked for a measurement before any cap and had
never had one. `bio-plane/test/connections-growth.measure.mjs` (2026-08-08, in
`MEASUREMENTS.md`): the row count is exactly k(k−1)/2 at every level, ~798 bytes per row, and
**one subject at k=1,000 is 499,500 rows, 398 MB and 10.3 s inside one synchronous
transaction — ~4% of the 10 GB per-object ceiling D-190 records as a vendor claim.** At the
5,000-pair ceiling the same instrument measures ~4 MB and ~65 ms. The pair 500/5,000 is
`#MEANING_LIMIT_DEFAULT`/`#MEANING_LIMIT_MAX`, REC-60's, so no figure is minted here.

**MEASURED CONSUMER IMPACT — RUN, NOT PREDICTED.**

- **`civicos-ui/` reaches this op at ONE site**: `connectGo()` in `app.html` (~12,258), which
  POSTs `{ entityId }` and renders `r.count` (falling back to `r.connections.length`). Both
  keys are unmoved, and it sends no `limit`, so it is answered at the default. **`node
  civicos-ui/test/run.mjs` from the repo root: exit 0**, all harnesses green, and its op probe
  reports `connect` among the 68 ops it exercises — so the change is measured through the
  surface's own mocks rather than argued about.
- **WHAT THE UI DOES NOT YET SAY, delegated rather than reached into (CLAIMS.md):** the receipt
  reads *"The record derived N connections…"* with no room for *"…among the first 32 of the 40
  documents that concern this subject"*. UI-48 already surfaces `op=connections`' bound; this is
  its sibling and it is UI's to write.
- **`newgroup/` and `docprofile/` reach none of it** (grep: no `connect` call site). `pdf-worker`
  and `agent-worker` do not call the plane's meaning layer.
- **INSTRUMENT FIGURES THAT MOVE, from what each PRINTED on a green run:**
  `bounds.test.mjs`'s capped-op roster **25 → 26**; `meaning-bounds.test.mjs`'s bare-collection
  ratchet **39 → 38**, ceiling and floor in one edit. No refusal code is added, so
  `check-refusal-codes --strict`'s floors are BYTE-IDENTICAL before and after (59 sites / 60
  lines / 46 regions / 1,263 region lines / 115 codes) and no governed DEC-49 region is touched.

**I5 IS UNTOUCHED.** No schema change: no table, no column, no index. The `connections` table,
its key and its `purge` membership are exactly as they were.

**WHAT IS DELIBERATELY NOT SHIPPED, so the next reader does not think it was missed.** The op
does NOT REFUSE a subject too large to derive whole, which is the other honest posture and is
`op=suggest`'s (a WRITE over its cap is turned away naming the bound). It is recorded as a
decision for Bob in `CLAIMS.md` with the reasoning; the short form is that a refusal would
leave the MOST IMPORTANT subject with no connections at all and would leave the alarm-driven
sweep refusing the same entity every tick, while a bounded derivation writes only true rows,
states that it was cut, and is resumable by asking for a wider bound. The gap it leaves —
`op=connections` cannot see that the derivation behind its rows was bounded — is raised as
**D-237** in the same turn rather than left implicit.

**THE VERSION BUMP IS NOT TAKEN HERE.** This is a change to what an existing op ANSWERS for
large subjects, so it is I3's to rule; REC-66 does not write `INTERFACES.md` and does not bump
it. **CONDUCT takes the bump and the RESOLUTION**, as IC-28's and IC-29's rows say.

### 2 · RESPONSES

*(Awaiting. `RECORD` owns the plane's meaning layer and proposes. `UI` is the one measured
consumer — one call site, no key it reads is moved; the receipt wording is delegated in
`CLAIMS.md`.)*

### 3 · RESOLUTION

*(CONDUCT's.)*

---

## IC-36 · I3: `op=list` and `op=audit` gain an additive `route` block, and ONE new op (`op=provenanceroute`) · I5: one new table · PROPOSED 2026-08-08 (REC-63 / DEC-56) — the version bump and the RESOLUTION are CONDUCT's

**NUMBER MEASURED, NOT ASSUMED.** IC-34 was the highest in this file when REC-63 looked.
Four parallel items collided on an id in one day (IC-33/IC-34, the C-29/C-30 family, a
debt row), so a renumber at integration is expected and is the integrator's call rather
than an error here.

### 1 · PROPOSED

**WHAT CHANGES, AND ALL OF IT IS ADDITIVE.**

- **`op=provenanceroute`** (new, mutating, classes `admin`/`member`/`probe`, NOT `daemon`
  — `op=provenancechain`'s own line). Takes `bundleId`; the viewer and author are stamped
  by the control plane. It assesses whether a document's provenance ROUTE can be shown and
  records what it found. It writes NOTHING into the bundle: no state moves, no file
  changes, no `bundle_sha` changes, and the suite asserts all three across a marking.
- **`op=list`** — every row gains `route`. Both arms, the bare and the paged.
- **`op=audit`** — the answer gains `route: { tally, marked[], markedTotal, markedShown,
  means, note }`. `ok`, `clean`, `withErrors`, `tally`, `tallyDetail`, `limit`, `cursor`
  and `total` do NOT move, and the suite pins that they do not.
- **`op=provenancechain`** — both its report arm and its `EVIDENCE_INSUFFICIENT` refusal
  gain `route`, and the refusal's `detail` now names the honest route (D-204).
- **`op=stats`** gains `routeMarks`, a count and nothing else.
- **I5**: one new table, `provenance_route_marks`, before the `host_governor` block, in
  `purge`'s `TABLES` list so BOTH arms clear it.

**THE SHAPE OF `route`, and it is the interface's whole point.** It is NEVER ABSENT and
never null on these reads. `finding` is D-129's vocabulary taken LIVE from
`src/airun.mjs`'s `OBSERVATION_STATES` rather than a fifth private spelling of absence:

| `finding` | what a consumer may conclude |
| --- | --- |
| `NEVER_LOOKED` | **nobody looked.** No assessment has run. NOT a finding about the route |
| `LOOKED_INDETERMINATE` | **the marker.** We looked and the route cannot be shown |
| `PRESENT` | we looked and every document in the register can show its route |
| `applies: false` | not a captured document, so no route to show or to doubt |

`LOOKED_ABSENT` is deliberately unreachable: it would assert the bytes have NO route, and
every captured byte came from somewhere. What is absent is OUR EVIDENCE.

**WHY THE INTERFACE MOVES AT ALL, rather than a new read being added beside it.** DEC-56's
acceptance is that the doubt is CARRIED IN THE OPEN. A marker only reachable by asking a
dedicated op is REC-74's defect one field over — a condition written by one op and
published by none — so it travels on the reads a member already uses. `op=list` is the
most-called bundle read in `app.html` (14 call sites).

**WHAT IT COSTS A CONSUMER: NOTHING TODAY.** No existing key changes type, moves or
disappears. A consumer that ignores `route` is byte-identical in behaviour. `civicos-ui`
reaches none of it yet (UI harness exit 0), which is the DELEGATION filed in `CLAIMS.md`:
the surface half is not this item's to write.

**MEASURED INSTRUMENT IMPACT, every figure read off a GREEN RUN and never added to the
number that was there.** `check-refusal-codes.mjs`: families 13 -> 14, rows 145 -> 149,
census 406 -> 410, reach 200 -> 204, governedSites 59 -> 60, regions 46 -> 47, regionLines
1263 -> 1289, codesChecked 115 -> 119. **`reachGap` DOES NOT MOVE (42)** — all four new
codes arrive translated, so this item neither closes nor widens REC-64's named gap.
`scripts/coverage.mjs`: `REGISTER_FLOOR` arms 471 -> 480, classified 119 -> 121, corpus
120 -> 122. OPS 158 -> 159, all reached. CHECKS 201 -> 205, all named.

## IC-37 · I3: `op=readingname` gates and orders its two PARTIAL correspondence tiers by MEASURED SELECTIVITY, publishes `selectivity` per candidate and `names_uninformative` on the answer · PROPOSED 2026-08-08 (REC-77 / M-4) — the version bump and the RESOLUTION are CONDUCT's

**A RENUMBER IS NOT AN ERROR HERE.** Three items collided on an IC number in one day; the
highest number in this file when this was written was IC-36. If CONDUCT renumbers this, the
content is what matters.

### PROPOSED

**WHAT MOVES.** `op=readingname`'s answer, in three additive ways and one behavioural one:

| change | shape | kind |
| --- | --- | --- |
| every candidate gains `selectivity` | `null` on a WHOLE correspondence; on a PARTIAL one `{ source, reaches, corpus, value }` where `value` is `null` when `corpus <= 1` | ADDITIVE key |
| the answer gains `names_uninformative` | `[{ alias, source, reaches, corpus }]`, always present, usually empty | ADDITIVE key |
| a partial candidate's `detail` gains a trailing clause | `…; that name reaches N of the M references this reader can see at this source` | wording, appended |
| **a PARTIAL candidate whose alias reaches EVERY reference in the visible corpus at that source is WITHHELD** | fewer `documents` rows for a vacuous alias; none for a whole match, ever | **BEHAVIOURAL** |
| **the two partial tiers are ordered by measured selectivity rather than by `#CORRESPONDENCE_RANK` position** | `documents` may come back in a different order; the WHOLE tiers keep their positions above every partial | **BEHAVIOURAL** |

**WHY.** M-4 measured that `#CORRESPONDENCE_RANK` offers the LEAST selective evidence
FIRST: a term of a reference reaches 67.5% of the reference corpus against 8.3% of labels,
**8.1x less selective**, and `name_in_reference` is ranked ABOVE `name_in_label`. The
sharpest figure is that the alias `"legislation"` reaches **41 of 41** references and **0
of 41** labels — a member who registered `Legislation` as an alias of the *Rules &
Legislation Committee* would be offered EVERY reference in the document, first. That is the
record offering more than it can support, which `CLAUDE.md` ranks above a missing feature.

**A RANK SWAP IS NOT THE FIX AND M-4 SAID SO.** The class is BIMODAL: `"legislation
26-0844"` reaches **1 of 41** — the source's own identifier respelled around a punctuation
mark `#normAlias` does not fold, the best correspondence in the corpus in substance — and
`"legislation"` reaches 41 of 41 and corresponds to nothing. **Both are
`name_in_reference`**, so swapping the two ranks demotes the good one with the bad. What
separates them is selectivity, and it is measurable at read time.

**THE RULE IS CORPUS-RELATIVE AND PINS NOTHING.** `Store.#isUninformative(reach, corpus)`
is `corpus > 1 && reach >= corpus` — no percentage, no threshold, no figure carried from
M-4's document. `corpus > 1` is not a threshold: it is the condition for the question to
have an answer, and with one reference selectivity is UNDEFINED and the candidate is
OFFERED. **Fail-open is deliberate** — a false offer costs a member a click, a suppressed
real correspondence costs them a document they will never learn existed.

**THE NO-GRADE POSTURE IS UNTOUCHED.** REC-40's third tier still ranks below every whole
match and still carries no grade; `grade_if_resolved` comes from `#recogniseTier` exactly
as before and no whole tier is gated on any corpus statistic.

### MEASURED CONSUMER IMPACT

**Instrument: `grep -rn` over `civicos-ui/`, `newgroup/`, `agent-worker/`, `pdf-worker/`,
2026-08-08, followed by `node civicos-ui/test/run.mjs` from the repo root.**

- **`op=readingname` has exactly ONE non-test consumer: `civicos-ui/app.html`.**
  `loadResolveCandidates` at `app.html:12062`. `newgroup/`, `agent-worker/` and
  `pdf-worker/` never call it (0 hits).
- **NEITHER NEW KEY IS READ.** `app.html:12151` reads `ans.names_unusable`; nothing reads
  `names_uninformative`. Nothing reads `selectivity`. The renderer at `app.html:12178-12182`
  switches on `d.correspondence`, whose five values are UNCHANGED. `app.html`'s bound
  sentence reads `limit`/`truncated`, both unchanged.
- **THE ORDERING IS READ, AND THAT IS THE ONE THING TO SAY OUT LOUD.**
  `app.html:12073` is `for(const d of (ans.documents||[])) if(!seen.has(d.capture_sha)) seen.set(...)`
  — **first-wins on the capture**, and the comment above it at `app.html:12063` states the
  contract it relies on in so many words: *"ordered with the stronger correspondence first,
  so first-wins on the capture leaves each document showing the strongest way it
  corresponded."* That contract still HOLDS and is strictly better served: whole
  correspondences still sort above every partial, so a document with a whole match still
  shows it; and where a document is reached only at partial tiers, first-wins now picks the
  MORE SELECTIVE of them instead of the tier-positional one.
- **UI HARNESS: `node civicos-ui/test/run.mjs` from the REPO ROOT, exit read unpiped, `0`,
  all harnesses green**, with `readingname` among the 68 distinct ops arm B observed. No UI
  assertion moved.

**So the measured impact on the shipped surface is: no key it reads changes, no wording it
composes changes, and the one ordering contract it depends on is honoured.** What a MEMBER
sees changes — that is the point of the item — and it changes in the direction of being
offered fewer things that correspond to nothing.

### WHAT A CONSUMER MUST NOT CONCLUDE

`selectivity` is **corpus-relative and VIEWER-relative**. Its numerator and denominator are
both taken over the references THAT READER can see, so two members with different project
membership take different figures for the same alias on the same document. That is required
rather than incidental: a figure computed over the whole store would publish, as an integer,
the size of a corpus the D-15 gate exists to hide. `readingname.test.mjs` asserts it —
dave's reach is 1 where carol's is 2 for the same name on the same document, because the
capture he cannot see also carries that name. **A consumer must not compare one viewer's
`selectivity` with another's, and must not read `corpus` as the size of the store.**

### VERSION

I3. **The bump is CONDUCT's**, per the item's brief. The behavioural half (rows withheld,
order changed) is not additive, so this is not a PATCH; RECORD's view is that it is a MINOR
at most on the shape and CONDUCT should weigh the withheld rows.

## IC-38 · I3: `op=affordances` publishes the RUNG LADDER, and every act's rung is now either a ladder value or a STATED absence · PROPOSED 2026-08-08 (FW-14 / DEC-19 as amended) — the version bump and the RESOLUTION are CONDUCT's

### WHAT CHANGES, AND IT IS ADDITIVE IN SHAPE

Three new keys under `vocabularies`, and one new key on every act object:

- `vocabularies.rung_ladder` — the ladder itself, an ORDERED array low to high:
  `["reversible", "reasoned", "terminal", "attested", "irreversible"]`. A surface that renders a
  rung needs to know where it sits, and the alternative is every surface holding its own copy of
  the order — the DEC-8 drift class `op=affordances` exists to close.
- `vocabularies.rung_correction_path` — the sentence DEC-19 requires to travel with the top rung.
  Published rather than left to a client because **"irreversible" alone is the half that
  overclaims**: a member told an act cannot be undone, and not told that correction moves FORWARD
  (a further edition, a withdrawal as another attested act, both standing), has been misled by the
  surface. This is the accountability rule the A-construct already states, made mechanical.
- `vocabularies.rung_absence_grounds` — `{ ground: why }` for the five grounds on which an act
  carries no rung, so a surface can render *why* instead of composing the sentence itself.
- **`rung_absence` on every act** (in `catalog[]`, in a target-shaped `acts[]`, in `capture_acts[]`,
  and in `op=queue`'s `options[]`, because all of them go through the same `decorateAct`) — the
  ground where the act has no rung, `null` where it has one.

### THE BEHAVIOURAL CHANGE A CONSUMER MUST NOT MISS

**`rung` VALUES MOVED.** Until this item most acts published `rung: null` because REC-19's rule was
that a rung comes from a DOCUMENT and only seven had one. FW-14's rule is that a rung comes from
what the plane ENFORCES. Of the acts a surface actually sees:

- `cite` was `null` and is now **`reversible`** — C-7's answer, backed by `sever` accepting the
  status `cite` writes. UI-20 rendered the rung as ABSENT and said so explicitly at the time
  (*"cite publishes rung null — C-7 derives reversible but FW-14 assigns"*); that surface copy is
  now stale in the safe direction (it renders nothing where a rung exists).
- `conclude`, `reopen`, `inquirydivide`, `inquiryground`, `actionmove` were `null` and are now
  **`reasoned`** — each is refused without an authored account by the store.
- `publish` was `null` and is now **`irreversible`** — DEC-19 as amended names it, and it is the
  one op that carries the top rung. **This is the UI-17a rider**: that surface's entry-point
  section states irreversibility as its own copy, and can now read it off the act.
- `retire` is unchanged at `terminal`; `release`, `sever`, `reinstate`, `dispose` unchanged at
  `reasoned`; `attest`, `ratify` unchanged at `attested`.

**`rung: null` NOW MEANS SOMETHING NARROWER.** It used to mean "nobody classified this". It now
means "classified as having none, on a stated ground" — because the classification is asserted
TOTAL over the dispatch table's mutating set in both directions, so an unclassified op cannot
reach a caller. A consumer that treated null as "unknown" is not broken; it is now under-reading.

### WHAT A CONSUMER MUST NOT CONCLUDE

**`reversible` does not mean erasable.** `op=cite` is reversible because `op=sever` takes the
citation back — and severing leaves the edge in the record carrying `status: "severed"` and the
member's reason. A surface must never render `reversible` as "this can be undone with no trace".

**A rung is not a permission.** `needs` gates the call; the rung says what performing it costs to
undo. `op=adminremove` carries `reasoned` and is roster governance no member sees on an act strip.

**The absence grounds are not a severity order.** Four of the five (`substrate`, `credential`,
`caller-owned`, `observational`) mean the ladder does not reach that act at all; only
`undetermined` means "a real act on the record with no rung yet". They must not be flattened.

### VERSION

I3, and **the bump is CONDUCT's**. Every key is ADDITIVE and no key was removed or renamed, so
RECORD's/FRAMEWORK's view is MINOR — but the `rung` VALUES moved on six acts a surface can already
read, which is a semantic change inside an existing field, and CONDUCT should weigh that rather
than take "additive keys" as the whole answer.

---

## IC-43 · I8: `agent-worker`'s `POST /run` publishes the SPAWN CONTRACT each sub-session was handed, and NAMES every return that broke the REPORT contract · PROPOSED 2026-08-09 (FL-5) — the version bump and the RESOLUTION are CONDUCT's

**The number was MINTED** with `node tools/mintid.mjs IC`. **IC-44 was minted by the same item in a
double invocation of the tool and is UNUSED — it is burned, not free**, and it is named here so
nobody spends an afternoon proving the ledger wrong about it.

### PROPOSED

**WHAT MOVES.** Four ADDITIVE keys on `POST /run`'s success answer. Nothing is removed, renamed or
re-valued.

| change | shape | kind |
| --- | --- | --- |
| the answer gains `fanout` | `{ of_pass, levels[], scope[], contracts[] }` — `contracts` is exactly the frozen brief each sub-session was handed, one per level | ADDITIVE key |
| the answer gains `reports_taken` | integer: returns that honoured the REPORT contract | ADDITIVE key |
| the answer gains `reports_refused` | `[{ level, code, detail, fields? }]` — NAMED, never a count alone | ADDITIVE key |
| the answer gains `citations_reread` | integer: citations the PARENT resolved by address | ADDITIVE key |
| a NEW refusal shape on this surface | 502 `SPAWN_PAYLOAD_CARRIES_LENS` / `SPAWN_PAYLOAD_MISSING`, with `level` | ADDITIVE refusal |

**WHY THE CONTRACTS THEMSELVES GO ON THE WIRE, and it is the finding rather than a preference.**
FL-3 asserted §14's fence from inside this member by computing `manifest_field_present` into a
local that never reached the wire, and checking it by grepping a trace note that never carries the
phrase. **MEASURED at FL-5 rather than argued: with the plane mock's SEARCH-half payload made to
carry a full bias block, `harness.test.mjs` stayed 194 pass / 0 fail and that arm PASSED.** A fence
whose only witness cannot fail is not a witness. Publishing the brief makes the property READABLE
FROM OUTSIDE — the party protected by the fence can be checked without trusting the member's
summary of itself — and FL-5's suite then asserts on the manifest's own `statements_sha` bytes,
which no spelling can dodge.

### CONSUMER IMPACT — MEASURED, and it is ZERO

`grep -a AGENT_WORKER bio-plane/src/` returns NOTHING: the plane's binding is still inert and this
member has exactly one caller, which does not exist yet. No surface, no suite outside
`agent-worker/test/` and no installer path reads this answer. So the impact is not "small", it is
**nil, and measured** — every key is additive besides.

### VERSION

**I8, and the bump is CONDUCT's. FL-5's own verdict is that I8 STAYS PROVISIONAL at 0.1.0**, for
FL-3's reason unchanged and re-measured here: the interface exists to describe trust running BOTH
ways, and it still has ONE implemented end. Nothing about this member is live-verified, nothing
deployed, and a registry entry promoted on the strength of a richer response body would be a claim
about a direction no code takes. `I3` is NOT bumped — this item adds no op and changes none; it
CONSUMES `op=meaningrows`' existing `ids` restriction, which PL-9 already published.

---

## IC-47 · I3: THE THREE RUN VERBS GAIN A REFUSAL CONDITION (C-22.8, project participation) AND AN ADDITIVE `projectGate` FIELD ON SUCCESS · PROPOSED 2026-08-09 (PL-18, enacting DEC-63) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I3 (the op contracts). **The op NAMES, ARGUMENTS and ANSWER SHAPES are unchanged.**
  What changes is (a) WHICH CALLERS ARE REFUSED and (b) two additive fields.
- **Proposer:** PL-18, 2026-08-09, worktree `agent-a4e2eff5ca09197e2`.
- **Owner of the producer:** PLANE. **Consumers measured below.**

### WHAT CHANGES

1. **A NEW REFUSAL CONDITION on `op=airunopen`, `op=airuntick`, `op=airunclose`.** Bob ruled
   2026-08-09 (DEC-63) that an investigation is started by ANY MEMBER OF THE PROJECT: the gate is
   participation in the project the inquiry belongs to. A SESSION whose member has joined none of
   the projects that draw on the run's context is now refused with **`code: "AI_RUN_NOT_PROJECT_MEMBER"`,
   `check: "C-22.8"`**, its canned translation and a composed `detail`. `contribute` stays in `NEEDS`
   as the FLOOR and refuses in its own separate words (`reason: "NOT_CAPABLE"`, carrying `needs`) —
   **the two are deliberately NOT one refusal**, which is the item's whole content.
2. **`projectGate` ON THE SUCCESS ANSWER of `airunopen` and `airuntick`** — `{ applied, ground, why,
   projects }`. ADDITIVE, and it exists because DEC-17 says *"an inquiry outside any project has no
   bar and inherits none"*: such a run is PERMITTED, and a permission nobody can see is
   indistinguishable from a gate that never ran.
3. **The refusal shapes reuse each op's OWN vocabulary** rather than introducing a fourth:
   `started: false` at the open, `ticked: false` at the tick, `terminated: false`/`found: true` at
   the close (`#aiRunTerminate`'s own shape).

### MEASURED CONSUMER IMPACT

**`agent-worker` — ZERO, and it is measured rather than assumed.** It is the only non-test consumer
of these three ops (`src/index.mjs` calls `airuntick` and `airunclose`; `src/harness.mjs` declares
all three). It authenticates with the **`ai` credential class**, which is a MACHINE credential:
`index.mjs` computes `viaSession` false for every machine class, so `actor` is stamped EMPTY and the
gate is NOT APPLIED — the ground `NO_MEMBER_BEHIND_CALLER`. **This is the same population the
CAPABILITY floor already had** (`NEEDS` is enforced only `if (viaSession)`), so the gate is exactly
as wide as the floor beneath it and no machine caller changes behaviour. Driven for a machine
credential by ARM M of `bio-plane/test/airun-projectgate.test.mjs`; the `ai` class differs from it
only in the `principal` stamp and not in `viaSession`. **The four fleet suites are green in the
battery below and none moved.**

**`civicos-ui` — NO CONSUMER TODAY, stated by the surface itself.** `app.html:16239`: *"`op=airunopen`
has no UI consumer either, so this application never learns a…"*. The new code IS in the DEC-49
guard's REACH count (218) because it is a family row; whether the surface should branch on it is a
DELEGATION filed in `CLAIMS.md`, not an edit made here.

**No schema change, no migration, no new op, no argument added or removed.**

## IC-41 · AN UNDECLARED CROSS-AREA COUPLING, NAMED BECAUSE IT BROKE: `bio-plane/test/airun.test.mjs` LIFTS `civicos-ui/app.html`'s RUNNING-SESSION RENDERERS BY FUNCTION NAME · PROPOSED 2026-08-08 (UI-38) — the RESOLUTION and any registration are CONDUCT's

- **Interface:** **NONE — and that is the row.** `INTERFACES.md` registers I1–I8; not one of them
  covers this. The coupling is real, it is checked on every battery run, and nothing declares it.
- **Proposer:** UI-38, 2026-08-08.
- **Owner of the consumer:** PLANE-TEST (`bio-plane/test/**`). Owner of the producer: UI.

### WHAT THE COUPLING IS

IS-6's ARM U in `bio-plane/test/airun.test.mjs` reads `civicos-ui/app.html`, slices the
`__AI_SESSION_START__`/`__AI_SESSION_END__` block, evaluates it in a `vm` context, and exports
named functions out of it:

    vm.runInContext(block[1] + ";globalThis.__A={aiSessionInContext,aiSessionIndicatorHtml,…};", ctx);

That is a good arm and it is why UI-38's renderers were ever driven against the record's real
shape. **But the export list makes the block's INTERNAL FUNCTION NAMES a contract another area's
battery holds**, and a name that vanishes is not a failing assertion — it is a `ReferenceError`
inside the `vm`, which ends the module. `airun.test.mjs` then reports **`assertions unknown`**,
which is the shape WORKER.md warns about: a tally that reads clean while the suite never reached
its foot.

### MEASURED CONSUMER IMPACT

UI-38 collapsed three field-named renderers — `aiSessionBudgetHtml`, `aiSessionPrincipalHtml`,
`aiSessionConditionHtml` — into one field-name-blind `aiSessionBlockHtml`, because that list of
three is exactly why `op=airun`'s BIAS BLOCK rendered nowhere. Consumers found by grep over the
whole repository (`bio-plane/`, `agent-worker/`, `civicos-ui/`, `docprofile/`, `pdf-worker/`,
`tools/`, `newgroup/`), and the reach is stated: the matcher finds the names as literal text, so
it sees every source and test file and would NOT see a name built at runtime.

| consumer | how it couples | impact |
| --- | --- | --- |
| `civicos-ui/test/ai-session-wire.test.mjs` | same `vm` export list | UI's own — corrected in the same turn |
| `civicos-ui/test/surface-registry.test.mjs` | same `vm` export list, 6 call sites | UI's own — corrected in the same turn |
| **`bio-plane/test/airun.test.mjs`** | **`vm` export list, 4 call sites** | **BROKE THE PLANE BATTERY: `ReferenceError: aiSessionBudgetHtml is not defined`, 131/133 with `assertions unknown`** |
| everything else | — | none found |

### WHAT UI-38 DID, AND WHY IT DID NOT JUST DELEGATE

The consumer was **corrected in the same turn**, cross-area, because the alternative was landing a
red `main` and filing a note about it. Every claim ARM U made (U3, U3b, U4, U5, U5b, U5c, U6, U7)
is re-made through the replacement rather than dropped, and **ARM U9/U9b/U9c/U9d are ADDED** for
the condition that was invisible. `airun.test.mjs` moves 103 → 107 assertions, green.

**PLANE-TEST is asked to review the edit, not to re-do it** — see the DELEGATION in `CLAIMS.md`.

### THE DECISION THAT IS CONDUCT'S

Should this coupling be REGISTERED (a ninth interface, or a clause on I3), or should ARM U reach
the block through something that is not a list of internal names? **UI-38 recommends registering
it rather than removing it.** ARM U is the only place in the repository where the plane's real
answer meets the surface's real renderer, and D-173's nine instances are what a mock would cost.
What is wrong today is not the coupling; it is that the coupling is invisible until it breaks.

### VERSION

None to bump — no op shape, no schema, no service binding moved. This is a registration question.

## IC-40 · I3: `op=suggest`'s success answer publishes THE RECORD'S bytes for every fact about the version, and NAMES THE SOURCE OF EVERY FIELD; `op=basisversions` stops publishing a blank part label · PROPOSED 2026-08-08 (D-235a, REC-75's residual) — the version bump and the RESOLUTION are CONDUCT's

**The number was MINTED** with `node tools/mintid.mjs IC` (floor IC-38, one id already held and
stepped over), so this one is not a read-the-file-and-add-one allocation.

### PROPOSED

**WHAT MOVES.** `op=suggest`'s success answer, and one field of `op=basisversions`:

| change | shape | kind |
| --- | --- | --- |
| the answer gains `fields_of` | `{ <every field name>: "record" \| "derived" \| "call" \| "label" }`, always present | ADDITIVE key |
| the answer gains `read_back` | boolean; `true` on every reachable path | ADDITIVE key |
| **`version` publishes the name the RECORD holds** | was the submitted `name`; differs only when `#fmSafe` folded it | **BEHAVIOURAL** |
| **`grounds` publishes the part labels the RECORD holds** | was the raw declared set; differs only when `#fmSafe` folded a label | **BEHAVIOURAL** |
| **`legs` are the projection's own rows** | each leg gains `ord`; the candidate's legs never carried one | **BEHAVIOURAL** |
| `kind`, `run`, `state`, `author`, `at`, `count`, `ground_count`, `composition`, `target` re-sourced to the same read-back | same values on every measured path | re-sourced, no measured value change |
| `truncated` is derived from the read rather than written as `false` | same value: the write cap is 120 and the read cap 500 | re-sourced |
| `composition_of` may read `"unread"` | only if the projection read comes back empty — unreachable through the op today | ADDITIVE value |
| **`op=basisversions`' `grounds` no longer contains `""`** | a leg naming no part contributed an empty-string "declared part" | **BEHAVIOURAL** |

**WHY.** REC-75 settled that `composition` publishes the record's bytes and labelled it
`composition_of: "record"` — and raised D-235 at its own landing because everything else on that
answer was still caller- or candidate-derived and unlabelled. **One answer with two sources and
only one of them named is REC-74's shape — two readers of one row — arriving inside a single
answer instead of across two ops.** A consumer could not tell which bytes were the record's.

**TWO OF THE THREE BEHAVIOURAL CHANGES CLOSE A LIVE DIVERGENCE, MEASURED BY DRIVING THE PLANE
BEFORE THE FIX AND NOT READ OFF THE SOURCE.** `#fmSafe` folds `[\r\n]+` to a SPACE, and a space is
the one character it produces that `VERSION_NAME_RE` and `GROUND_LABEL_RE` both admit:

- a reading submitted as `the folded<newline>reading name` is stored as `the folded reading
  name`, and the answer said the former. **That field is the record's own ADDRESS** — `derived_from`
  reads by name — so a caller feeding it straight back named a reading that does not exist;
- a part declared as `paper<newline>trail` is stored as `paper trail`, and the answer said the
  former. `op=suggest`'s CHECK 2 cannot see this and that is not a hole in CHECK 2: it compares the
  DECLARED set against the USED set and both sides are raw, so the two agree with each other and
  neither agrees with the document.

**THE THIRD IS A SHAPE DISAGREEMENT BETWEEN TWO READERS OF ONE ROW.** `op=suggest` published the
candidate's legs, which carry no `ord`; `op=basisversions` published the projection's, which do. A
consumer joining the two had to know which op it had asked.

**AND `op=basisversions`' BLANK LABEL, DRIVEN END TO END.** `basisVersionsOf` writes `ground: ""`
for a leg that names no part, and the read op published that empty string in `grounds` — a list of
*the parts this reading declares* containing a part nobody declared. **`op=suggest` cannot produce
one** (C-25.5 refuses it at `promote`, measured: `BASIS_VERSION_REFUSED`) **— but the shape arm is
`!pkg.replay`**, so a replayed document may carry one, which is the path that exists precisely so
the record can hold its own past. The filter drops the LABEL and never the LEG.

### MEASURED CONSUMER IMPACT

**Inside this repository: ZERO behavioural change for any consumer, measured rather than asserted.**

- `civicos-ui/**` — **no consumer of either answer's changed fields**: `grep -rn` for `op=suggest`,
  `composition_of`, `ground_count`, `shared_origins`, `origins_complete` over `civicos-ui/`,
  `agent-worker/`, `newgroup/`, `docprofile/` and `pdf-worker/` returns **0 hits** outside
  `civicos-ui/check-refusal-codes.mjs`, which reads REFUSAL codes and never a success answer.
- `agent-worker/src/index.mjs` is the one real consumer of both ops and reads **`answer.wrote`,
  `answer.repeated`, `answer.repeats`, `answer.code`, `answer.reason`** off `op=suggest` and
  **`versions[].name`** off `op=basisversions`. **Not one of those moves.** It never reads
  `version`, `legs`, `grounds`, `count` or `composition`.
- Two suites pinned values that pass unchanged and were re-run: `bounds.test.mjs`
  (`SUGGEST_OK.count === 0`, `truncated === false`) and `aicredential.test.mjs`
  (`sug.author === "token:ai"`).

**Outside this repository**, a caller comparing `version` or `grounds` against its own submission
now sees the record's spelling. **That is the point**, and it is the same reasoning REC-75 recorded
for `composition`: echoing the caller publishes a value nothing else in the plane will ever produce
again, and makes two ops disagree about one row.

### WHAT A CONSUMER MUST NOT CONCLUDE

**`fields_of` is not a schema.** It says where the bytes on THIS answer came from, not what type
they are. A field labelled `record` may still be `null` — that is `read_back: false`, and it means
the projection read came back empty, which is UNDETERMINED STATED rather than a value.

**`derived` does not mean untrustworthy.** The strength pair and the independence trace are
published on the passing path deliberately (DERIVED INFORMS), so the member at §12's accept
ceremony affirms independence against what the record can see. The label says the RECORD DOES NOT
HOLD THEM, which is a different claim from doubting them.

**A field's absence from `fields_of` is impossible, not permitted.** The map is COMPUTED from the
groups the answer is assembled out of and `suggest.test.mjs` asserts it is total over the answer's
own keys, so a consumer may treat a missing entry as a plane defect rather than as a default.

### VERSION

I3, and **the bump is CONDUCT's**. Two additive keys, but three fields a consumer can already read
now carry different bytes on the folded and legged paths, so this is **not** a pure MINOR by the
`composition_of` precedent — REC-75 filed no IC for exactly this shape and flagged it for CONDUCT
to disagree cheaply; this item files one instead, because three fields moved rather than one and
one of them is an ADDRESS. Reversing it is: drop `fields_of`/`read_back`, and put `version`,
`grounds`, `legs` and `count` back on `name`, `declaredLabels`, `candidate.legs` and
`legsIn.length` — the shape `suggest.control.mjs`'s (D-235a) and (D-235b) arms hold open.

## IC-39 — CPDF-10: `reading.text_source` becomes a CHAIN, not a token

- **Interface:** I2 (the content → framework structure contract) at the reading boundary — the
  field `op=acquire` stamps on a capture's `reading`, which `op=promote` persists and
  `op=reading` projects.
- **Owner:** FRAMEWORK (dormant). **Producer:** CONTENT-PDF (this change).
  **Consumers:** the `readings` projection, `op=reading`, an exported bundle's
  `data/provenance.json`, and any surface rendering where a document's text came from.
- **Status:** PROPOSED. **The version bump is CONDUCT's** (I2 is at 1.1.0).
- **Raised by:** CPDF-10, 2026-08-08.

### WHAT CHANGED

`reading.text_source` was the STRING `"layer"` (FW-15, carrying D-152's provenance
discriminator). It is now an ORDERED ARRAY of steps, each naming what performed it:

```
[ { step: "pixels", cap: "C", measured_by: "…" },
  { step: "ocr", engine: "tesseract", version: "5.3.4-fast", cap: "C", measured_by: "…" } ]
```

`step` is one of `layer · pixels · ocr · ai · attested` (`textchain.mjs`'s `STEP_KINDS`, which is
the only place the vocabulary lives). `text_tier` and `text_container` are **UNCHANGED** — a
consumer reading only those is unaffected.

### WHY IT COULD NOT STAY A TOKEN, and this is the substance rather than a preference

A single label loses **which engine**, and an engine is what a calibration is OF (CPDF-13) and
what a re-run would need. It also cannot express a SEQUENCE, and the sequence is where the danger
is: CPDF-11 measured Moondream producing 16–20 minted digits per run in prose "structurally
perfect and indistinguishable from a clean run". Once an AI clean-up step exists, `"ocr"` and
`"ocr then rewritten by a model"` are the same string and the record cannot tell a reader which
it holds.

The chain also carries the rule that a token cannot: **every derivation step may only weaken the
claim, never strengthen it**, enforced by `appendStep` rather than by convention.

### THE CONSEQUENCE A CONSUMER MUST TAKE, and it is a real one

**A TEXT LAYER IS NOW A DERIVATION STEP, so `transcribed` is TRUE for text-layer documents too.**
That is not a widening for tidiness: `pdfstructure.mjs` decodes a layer through the FILE'S OWN
`/ToUnicode` map, so we faithfully reproduce somebody else's transcription — and CPDF-9 measured
that 3 of 14 recent Legistar attachments name ABBYY FineReader in their producer metadata, which
means the Clerk's certified enacted resolutions carry machine OCR overlays the record has been
reading as authored text. A consumer wanting "was this OCR'd BY US" must ask `terminal_step` or
`engines`, not `transcribed`.

**`cap` is `null` for a text layer**, and null means UNDETERMINED, STATED. No measurement exists
for a text layer's fidelity because it is not one population. A consumer must not read null as
"fine".

### MIGRATION, and what it costs

**Nothing in the repository reads `text_source` as a string** — measured, not assumed: the only
producer was `index.mjs`'s acquire assembly (changed here) and the only assertion was one line in
`reading-wire.test.mjs`, CORRECTED in the same turn with the reason at the site rather than
exempted. Stored readings from before this change keep their string and are refused by
`checkChain` rather than misread: `reading_text_source` writes no row for them, and an absent row
reads as "provenance was never recorded", which is exactly what is true of them.

### NEW OPS THAT COME WITH IT

`op=textprovenance` (which documents' text a machine produced — the INDEX half),
`op=textattest` (the attestations over a capture, and what a leg citing a region may claim), and
`op=attesttext` (the member act). The first two are reads on `READING_READS`' terms; the third is
`mutating: true`, carries `contribute`, and is refused to a machine credential at BOTH the
control plane and the store (C-35.10).

### AMENDED 2026-08-09 (D-252) — A DERIVATION STEP MAY NAME THE PAGES IT COVERS

**Amended in place rather than raised as a second IC**, because this row is still `PROPOSED`, its
producer is this same area, and the shape it describes has never been released: splitting one
unreleased shape across two rows would make a consumer read both to learn what one field is.

**WHAT IS ADDED.** One OPTIONAL field on a DERIVATION step:

```
{ step: "ocr", engine: "…", version: "…", cap: "C", measured_by: "…",
  extent: { kind: "pages", pages: [1, 2, 3] } }        // 0-based, ABSENT = the whole document
```

**ABSENT means the whole document**, so every chain the shape above describes means exactly what it
meant. The field appears only on a MIXED document — one whose pages have different provenance, a
text-layer report with scanned exhibits stapled to the back — where the chain is the concatenation
of its parts and the alternative was to pick one part's chain and let it stand for pages it did not
describe. An extent this record cannot parse covers NOTHING (`extentCovers`' own direction, applied
to the other half of the module).

**THE CONSEQUENCE A CONSUMER MUST TAKE, and it is the reason this is an amendment and not a note:
`derivation_cap` is `null` — UNDETERMINED — for a mixed document, even though one of its parts
carries a measured letter.** A text layer's fidelity is `null` and an OCR pass is a measured `C`;
letting the `C` stand for the document would RESOLVE THAT NULL INTO A LETTER for pages nobody
measured, and `gradeCeiling` reads the two differently — null as *"undetermined, which is a
statement, not a permission"*, a letter as permission up to it. A consumer that needs a usable
answer asks per page: `derivationCap(chain, {page})`, which `op=textattest` already does with the
target a leg cites, and which answers `C` for the OCR'd exhibit and `null` for the text-layer
report.

**MEASURED CONSUMER IMPACT: ZERO EXISTING RECORDS.** A multi-part chain can only be produced by the
Tier-3 branch, which requires an `OCR_WORKER` binding that exists in no configuration in this
repository (grepped: the only occurrences are the wire's own call and one test stub), so no stored
reading anywhere carries an `extent` or a mixed cap. `text_tier` and `text_container` are still
UNCHANGED — and what that now costs is written down rather than left to be discovered: **D-284**.

---

## IC-54 · I3: EVERY REFUSAL AT THE ADMISSION GATE NOW CARRIES A CODE, A C-NUMBER AND A CANNED TRANSLATION — four of them carried NO CODE AT ALL · PROPOSED 2026-08-09 (REC-79, enacting DEC-49) — the version bump and the RESOLUTION are CONDUCT's

**The number was MINTED** with `node tools/mintid.mjs IC` (floor IC-46, seven ids already held and
stepped over: 47–53).

- **Interface:** I3 (the plane's op surface), **STABLE**.
- **Proposer:** REC-79, 2026-08-09, enacting **DEC-49** and closing PL-18's finding.
- **Owner to land it:** `RECORD` / `VERIFY` (landed here).

### PROPOSED

**WHAT MOVES.** Six refusals in `index.mjs`'s admission gate — the refusals every caller meets
BEFORE their op runs — gain `reason`, `code`, `check` and `translation`. **Nothing is removed and
nothing is renamed.**

| refusal | before | after | kind |
| --- | --- | --- | --- |
| no credential (401) | `{ ok:false, error:"unauthenticated" }` | `+ reason:"NOT_AUTHENTICATED", code, check:"C-38.1", translation` | **ADDITIVE keys** |
| wrong token class (403) | `{ ok:false, error:"forbidden for token class", op, cls }` | `+ reason:"CLASS_FORBIDDEN", C-38.2, translation` | **ADDITIVE keys** |
| session on a machine-only op (403) | `{ ok:false, error:"this operation requires…", op }` | `+ reason:"MACHINE_CREDENTIAL_REQUIRED", C-38.3, translation` | **ADDITIVE keys** |
| session on `op=export` (403) | `{ ok:false, reason:"ROOT_OF_TRUST_REQUIRED", op, detail }` | `+ code, check:"C-38.4", translation` | **ADDITIVE keys** |
| capability gate (403) | `{ ok:false, reason:"NOT_CAPABLE", op, needs, held, detail }` | `+ code, check:"C-38.5", translation` | **ADDITIVE keys** |
| out-of-namespace scope (403) | `{ ok:false, error:<sentence>, tokenClass }` | `+ reason:"SCOPE_REFUSED", C-38.6, translation` | **ADDITIVE keys** |

**THE `error` FIELD OF ALL FOUR CODELESS REFUSALS IS KEPT BYTE-IDENTICAL.** That is the whole
reason this is additive rather than breaking, and it is asserted in
`bio-plane/test/admission-gate.test.mjs` so a later tidy-up cannot quietly turn it into a
removal.

**WHY.** DEC-49 requires every refusable condition to carry a code with a canned translation.
**Four of these six carried no code at all** — a bare `error:` sentence with nothing a surface could
key on. That made them invisible to DEC-49's guard AND absent from its census, because **a census of
CODES cannot count a refusal that has none**: the gate every caller passes through, including every
unauthenticated one, sat outside the rule governing everything behind it. It also closes PL-18's
finding, where `civicos-ui/app.html` had invented capture-specific wording for the plane-wide
`NOT_CAPABLE` — so a member refused for `create_projects` was told about contributing.

**CONSUMER IMPACT, MEASURED RATHER THAN ASSERTED.**

- **`bio-plane/test/**` — 52 assertions read these three sentences** (`"unauthenticated"` 31,
  `"forbidden for token class"` 15, the machine-credential sentence 6). **NONE had to move**, because
  the `error` field they read is unchanged byte for byte. Measured by running the whole battery, not
  by reading the diff.
- **`civicos-ui/**` — no consumer reads these strings as data.** The two matches are prose inside
  suite headers. `node civicos-ui/test/run.mjs` from the repo root, exit read UNPIPED: `0` before
  and after.
- **`newgroup/**` — the single match is a substring inside a bundled SQL literal in
  `newgroup/src/release.mjs`, not a consumer of this shape.** Named rather than silently discounted.
- **`civicos-ui/check-refusal-codes.mjs`** gains 5 codes in its census and 6 in its reach, and its
  `reachGap` ceiling FALLS 41 → 40. Every floor it invalidates was moved in the same turn from the
  figures it PRINTED.

**WHAT A CONSUMER SHOULD DO WITH IT.** Key on `reason`/`code` and render `translation` VERBATIM —
which is what DEC-49 licensed and what DEC-8 still requires (the code must be RECEIVED, never
inferred). **Do not key on the `error` sentence**: it is kept for compatibility with what already
reads it, and it is the field with no rule behind it. `app.html`'s `acquireWhy` now renders
`a.translation` generally rather than per-code, so a surface adopting this needs no per-code edit.

### RESPONSES

_(awaiting: `UI`, `DIST`. `FRAMEWORK`, `CAPTURE` and `CONTENT-*` are not consumers of this shape.)_

---

## IC-45 · I3: `op=affordances` publishes ONE ADDITIVE VOCABULARY — `sufficiency_claim_states`, the three states of a sufficiency `asserted_by` with the sentence a member reads instead of each · PROPOSED 2026-08-09 (PL-17, enacting DEC-65) — the version bump and the RESOLUTION are CONDUCT's

**The number was MINTED** with `node tools/mintid.mjs IC` (floor IC-41, four ids already held and
stepped over). **AND THE TOOL WAS INVOKED TWICE BY THIS SESSION IN ERROR, so `IC-46` IS ALSO HELD
BY THIS WORKTREE AND IS UNUSED** — named here rather than left as a silent gap, because an id that
nobody can account for is exactly what the allocator exists to prevent.

- **Interface:** I3 (the plane's op surface), **STABLE**.
- **Proposer:** PL-17, 2026-08-09, enacting **DEC-65** (answered 2026-08-09 by session BOB under
  Bob's standing delegation: *"the third `asserted_by` state minted FIRST"*).
- **Owner to land it:** `RECORD` (landed here).

### PROPOSED

**WHAT MOVES.** One key on `op=affordances`' answer, and nothing else:

| change | shape | kind |
| --- | --- | --- |
| `vocabularies` gains `sufficiency_claim_states` | `{ claimed, unclaimed, unstated, machine_stamped }` → a member-facing sentence each | **ADDITIVE key** |

**No key is removed, no key is renamed, and no VALUE of an existing key moves.** Every other
vocabulary this op publishes is unchanged, byte for byte.

**WHY.** DEC-65 mints a third legal value for a sufficiency `asserted_by` — an explicit *no
independent-sufficiency claim was made* — so the field can hold something that is neither a
member's affirmative claim nor a silence. **A surface that renders that field verbatim would then
print a machine word at a member**, and one already does: `civicos-ui/app.html`'s grounding receipt
renders `Asserted by ${g.asserted_by}` directly. Publishing the states with their words is what
stops every surface inventing its own name for a state the record now distinguishes — the DEC-8
drift class `affordances.mjs` exists to close — and it is DEC-49's rule that a term a member meets
carries the sentence they read instead of it.

**CONSUMER IMPACT, MEASURED RATHER THAN ASSERTED.** `grep -rn "vocabularies" civicos-ui/` finds the
consumers: `app.html` reads the whole `vocabularies` object into `ACT_SOURCE.vocab` and indexes it
BY KEY, and three UI test fixtures build `vocabularies: {}` or a one-key object. **An additive key
is read by none of them and breaks none of them — measured, not assumed: `node
civicos-ui/test/run.mjs` from the repo root, exit read UNPIPED, `0` before and after.**
`civicos-ui/check-refusal-codes.mjs` arm E does NOT reach this vocabulary either, and that was
measured rather than assumed — see the DELEGATION to UI in `CLAIMS.md`, which carries the figures
and the reason adding the module to that walk would make the guard over-strict on correct code.

**WHAT A CONSUMER SHOULD DO WITH IT, since a published vocabulary nobody renders is a promise
nothing keeps:** read the field through the plane's `sufficiencyClaimState()` rather than matching
the stored literal. A surface that keys on `none:independent-sufficiency` itself has rebuilt the
predicate, and will be wrong the day a fourth state is minted.

### RESPONSES

_(awaiting: `UI`. `FRAMEWORK`, `CAPTURE`, `CONTENT-*` and `DIST` are not consumers of this key.)_

---

## IC-42 · I3: one NEW read op `op=airuns&contextType=&contextId=` — WHICH RUNS ARE IN THIS CONTEXT · PROPOSED 2026-08-08 (REC-69, UI-49's delegation), ADDITIVE

**RENUMBERED from IC-35 to IC-42 by CONDUCT 2026-08-08** — REC-66 had taken IC-35 the same day for `op=connect`'s derivation bound, and it is already on `main`, so it keeps the number. REC-69's own note below is exactly right and is the reason this is a renumber rather than a reprimand: **IC-35 was MEASURED as the next free number over the real file** (the maximum allocated
was IC-34) rather than assumed. Three items collided on an IC number earlier the same
day; if CONDUCT renumbers this at integration, the report, the claim and
`test/airuns.test.mjs`'s header all name IC-35 and that is recorded rather than silently
corrected.

### 1 · PROPOSED

**WHAT CHANGES, AND IT IS PURELY ADDITIVE.** One new op, reachable by the `admin`,
`member` and `probe` classes and non-mutating:

    op=airuns&contextType=<inquiry|project>&contextId=<bundle id>[&limit=N]
      ->  { ok: true,
            context: { type, id },              // the caller's own words, normalised
            runs: [ <op=airun's `session` block>, ... ],
            count: <length of what was SENT>,
            limit: <the cap AFTER clamping>,
            truncated: <was anything cut> }

Nothing existing moves. `op=airun`, `op=airunlog` and `op=airunspawn` keep their request
shapes, their response shapes and their refusals byte for byte — asserted by a zero-delta
battery, with `airun.test.mjs` unmoved at 103 assertions.

**WHY IT IS OWED, AND IT IS A GAP RATHER THAN A GAIN.** `INVESTIGATIVE-SESSION.md` §14a:
*"A background session runs in a CONTEXT and is associated with an inquiry or a project.
Any window focused on any of those objects shows an animated indicator that a job is
running."* UI-47 measured that the indicator had no call site at all. UI-49 built one —
and measured, while building it, that **the plane could not be asked the question**:
`op=airun`, `op=airunlog` and `op=airunspawn` are all keyed by RUN ID, `ai_runs` is
queried by `run` at all 14 sites, and `op=airunopen` has no UI consumer, so the browser
never learns a run id by opening one. UI-49's seam therefore feeds on the only source
that existed — the run addresses THIS DEVICE has already opened — which is honest, is
pinned, and **reaches only the member who already started the run on that machine. A
second member's run in the same inquiry is invisible to them, and §14a's promise is about
exactly that teammate.**

**THE SHAPE IS NOT NEW, AND THAT IS THE POINT.** Every row is `op=airun`'s own `session`
block, produced by calling `aiRunRead` per run rather than by a second composer, and the
suite asserts the two answers are BYTE-IDENTICAL for the same run. §14a's surface renders
a run through field-name-blind renderers, so "the same shape" is load-bearing rather than
tidy — and a second composer would be a hand copy, which this repository has measured
five times agrees with its author at zero cost.

**ENVELOPED, per IC-25/IC-26/IC-27/IC-28/IC-29/IC-30.** `limit` is the bound APPLIED
after clamping — never the number the caller asked for — and `truncated` is the
completeness signal in the spelling its three siblings already use, rather than a fifth
word beside the plane's four (REC-55's declined-second-copy rule). Both are published on
the EMPTY answer too. The 200/1000 pair is `op=versionchain`'s, which `op=basisversions`
already reused: this is the same KIND of read, a KEYED lookup whose answer is a list.
`op=airunlog`'s 200/5000 is deliberately NOT borrowed — it bounds one run's observations,
which grow per tick, and this bounds the runs in a context, which grow per investigation.

**GATED, AND THE GATE IS THE FEATURE'S WHOLE SECURITY POSTURE.** `#bundleGate` on
`context_id` — the same predicate compiled at the same one point (D-15) as its three
siblings, with NO second predicate written. A run-id read is a poor leak (a caller must
already hold the id); a context-keyed list takes an id a member can see on their own
screen and answers with everything hanging off it. The posture is WITHHOLD THE ROW
(REC-36), so a run over a project the viewer was never invited to is absent
byte-identically to one that does not exist, and **no count of the withheld is
published** — that count is the disclosure that somebody is investigating something you
cannot see. **The bound is applied BEHIND the gate**, because a `truncated` computed over
rows the viewer may not see would be that count arriving as a boolean.

**RENUMBERED C-34 → C-36 on 2026-08-09 at this item's REPLAY onto `main`, with
`node tools/mintid.mjs C` (floor C-35) rather than by reading the file and adding one.**
REC-63's `ROUTE_MARK_CHECKS` took C-34.1-4 the same day and is already on `main`, so it
keeps the number. **REC-69 measured C-34 free when it looked and was right when it looked**
— the same shape as this file's own IC-35 → IC-42 renumber above, and the same shape as the
seven items that collided on an id in one day. **THE COLLISION WAS INVISIBLE TO THE BATTERY:
139/139 green with two families claiming C-34.1-3, and only `node civicos-ui/test/run.mjs`
caught it** — *"Two conditions behind one C-number are one condition as far as `op=audit`
can see."* That is the fourth cross-item ratchet this pair fired and the reason the UI
harness is run even by an item that opened no UI file.

**THREE REFUSALS, C-36.1-3, in a new `AI_RUNS_CONTEXT_CHECKS` family**, each with a
canned translation read from ONE row (DEC-49), each fired inside the
`DEC-49 REGION is-airuns-context` span, each naming its code as a STRING LITERAL so the
guard's arm C compares all three. What is refused is the malformed QUESTION — no kind, an
unrecognised kind, no id — and never the invisible answer: a real context holding no
visible runs answers an ordinary empty list.

**ONE THING A CALLER MUST KNOW AND CANNOT INFER, stated rather than left to be
discovered:** the WRITE is not fenced by the same vocabulary. `aiRunOpen` stores
`contextType` verbatim, so a run may be opened on a kind this read refuses to be asked
about. The read matches case-blind so the ordinary mismatch (`Inquiry` vs `inquiry`) does
not manufacture a false "nothing is running", and the asymmetry is delegated rather than
closed from inside a read's item.

### 2 · RESPONSES

*(CONDUCT's, per IC-1's precedent for dormant areas.)* **RECORD's own position: ADDITIVE
and safe to accept.** No consumer exists to break — the op is new — and the one consumer
that WILL exist, UI-49's seam, was built with this shape in mind: exactly one function
changes on the surface.

### 3 · RESOLUTION

*(RESOLVED 2026-09-10 by CONDUCT #9 at the backlog pass — ADDITIVE, collapsed into I3 10.4.0; see "THE 2026-09-10 BACKLOG RESOLUTION" at the foot of this file.)*

---

## IC-50 · I3: `op=inquirystrength` / `op=versionstrength` — the WORDS of `pair.<axis>.detail` change for a STRUCTURED basis · PROPOSED 2026-08-09 (D-269, enacting DEC-32 clause 1) — the version bump and the RESOLUTION are CONDUCT's

**The number was MINTED** with `node tools/mintid.mjs IC` (floor IC-46; three ids — 47, 48, 49 —
already held by other worktrees and stepped over).

- **Interface:** I3 (the plane's op surface), **STABLE**.
- **Proposer:** D-269, 2026-08-09, on UI-43's delegation.
- **Owner to land it:** `RECORD` (landed here).
- **Kind:** **PROSE ONLY.** No key is added, removed or renamed; no key's TYPE moves; no number,
  state, grade or id changes. Every arithmetic value this op publishes is byte-identical.

### PROPOSED

**WHAT MOVES.** The words of ONE free-prose field, and only on the branches that describe a
STRUCTURED basis:

| where | was | is |
| --- | --- | --- |
| graded, when a set of reasons sets the grade | `the STRONGEST of the N independently sufficient grounds this conclusion rests on, … no stronger than the weakest capture WITHIN that ground` | `the STRONGEST of the N sets of reasons that each carry this conclusion on their own, … no stronger than the weakest capture WITHIN that set` |
| graded, when a shared leg caps it | `That leg is needed by every ground, so no ground can be stronger than it.` | `That leg is needed by every one of those sets, so no set can be stronger than it.` |
| graded, an unfinished set beside a graded one | `N further ground(s) is/are UNDETERMINED` | `N further set(s) is/are UNDETERMINED` |
| undetermined, structured | `EVERY one of the N grounds it rests on is undetermined` / `a leg every ground needs is undetermined` | `EVERY one of the N sets of reasons it rests on is undetermined` / `a leg every one of those sets needs is undetermined` |
| unrated, structured | `…on any of the N grounds` | `…on any of the N sets of reasons` |

**THE FLAT (UNSTRUCTURED) SENTENCES ARE UNCHANGED TO THE BYTE**, and that is a correctness
requirement rather than a courtesy: DEC-32's anti-gaming keystone is that a basis nobody structured
reads exactly as it did before, and `grounds.test.mjs` asserts it.

**WHY.** DEC-32 clause 1 forbids that vocabulary on any member-facing surface, and this field is
rendered VERBATIM at five channels — `axisPanel` on the inquiry page, the SAME panel inside the
published signed case, the undetermined pane, `legConsequence` beside the weakest leg, and a leg's
`why`, into which `#strengthWalk` embeds the whole sentence. `#freezeStrength` also writes it into
`bundle.md`'s frozen frontmatter. It was live, and it fired exactly when a member had used UI-27's
elicitation. See D-269.

**CONSUMER IMPACT, MEASURED RATHER THAN ASSERTED.**

| consumer | reads `detail` how | impact | measured |
| --- | --- | --- | --- |
| `civicos-ui/app.html` (4 sites) | renders it VERBATIM through `esc()`; parses nothing, matches nothing | **NONE** | `node civicos-ui/test/run.mjs` from the repo root, exit read UNPIPED, `0` before and after; app.html is not edited by this item |
| `bio-plane/test/grounds.test.mjs` | four assertions MATCHED the retired words | **FOUR, all corrected in the same commit with a dated reason, none exempted** | the battery |
| `bio-plane/test/strengthpair.test.mjs` | one assertion matches `/STRONGEST/` | **NONE — and this row is the reason the change is MINIMAL.** An intermediate wording of this correction also lowercased `STRONGEST` and `WITHIN`, which broke it for nothing: those two words are emphasis, not the vocabulary DEC-32 bans. The landed change moves ONLY the forbidden nouns and this consumer never sees it | the battery, which failed on the wider edit and is green on the narrow one |
| UI fixtures in `inquiry-page` / `conclude-act` / `publication-entry` / `publishedcase` / `elicitation` `.test.mjs` | build FLAT `detail` strings | **NONE** — the flat sentences did not move | the UI harness, green |
| `agent-worker/**` | its `.detail` uses are REFUSAL details, never an axis's | **NONE** | grep over `agent-worker/src` |
| a case ALREADY PUBLISHED | carries the OLD sentence in its signed bytes | **NONE, AND DELIBERATELY SO** | see below |

**THE PUBLISHED-BYTES CONSEQUENCE, STATED RATHER THAN GLOSSED.** A case published before today
carries the retired sentence inside signed frontmatter and will carry it for ever. That is CORRECT
— the record is append-only and rewriting a signed artifact to improve its wording is the one thing
this project must never do — but it means **the vocabulary DEC-32 forbids survives in already-published
cases, and no future item should read that as a regression.** Nothing in this change reaches back.

**A NOTE FOR THE NEXT CONSUMER, because the measurement above has a trap in it.** D-269's own
consumer-impact grep searched for the sentence as the SOURCE spells it and found THREE pinning
assertions; the battery found a FOURTH, spelled a hair differently. **A grep over prose is a hint,
not a consumer census** — the same failure, one layer up, that made the first measurement of D-269
itself read 2 of 3. If you consume `detail`, do not match its words: it is free prose and IC-50 is
the proof that it moves.

### RESPONSES

_(awaiting: `UI` — the only measured consumer. `FRAMEWORK`, `CAPTURE`, `CONTENT-*`, `FLEET` and
`DIST` are not consumers of this field.)_

## IC-48 · I3: EVERY refusal leaving the control plane now carries its DEC-49 row — `code`, `check`, `translation` — attached at ONE chokepoint · PROPOSED 2026-08-09 (D-262), ADDITIVE

**The number was MINTED** with `node tools/mintid.mjs IC` (floor IC-46, one id already held and
stepped over, so IC-47 belongs to another worktree).

### 1 · PROPOSED

**INTERFACE: I3, the op contracts. THE CHANGE: a refusal answer gains up to three keys.** When a
response leaving `json()` in `bio-plane/src/index.mjs` carries `ok: false` and a `reason`/`code` that
resolves to a row in a DEC-49 family (`*_CHECKS` in `checks/bio-checks.mjs`), the answer gains
`code`, `check` and `translation` from that row. This applies at the top level (the control plane's
own refusals) and one level under `result` (the Durable Object's, forwarded).

**WHY. Eleven of the twelve `MACHINE_CANNOT_*` fences put NEITHER their C-number NOR their canned
translation on the wire** (D-262, measured 2026-08-09), and the same was true of any other refusal
whose site built its object by hand. DEC-49's whole protection is that a surface renders a sentence
it RECEIVED rather than one it invented; a refusal that arrives bare leaves the surface nothing to
render. **The one consumer built since DEC-49 deliberately holds no catalogue** — `agent-worker`
passes a plane refusal through unchanged, by design — so "the consumer can look the code up" is
false for the consumer that exists.

**WHAT IT IS NOT.** No field is removed, renamed or re-typed. No existing key of any existing
refusal changes value: the attach **never overwrites**, so a site that already sends `translation`
is byte-identical, and a code with no catalogue row is left exactly as it was. Success answers are
untouched (`ok: false` is required, not inferred). No code is minted, so DEC-49's guard, its reach
and its ratchets do not move.

**MEASURED CONSUMER IMPACT — inside the repository, and it is a measurement rather than a survey.**

- **`civicos-ui`** — the surface reads NO `.translation` off a response today (measured: zero
  `.translation` reads in `app.html`'s script; the five occurrences are comments). `node
  civicos-ui/test/run.mjs` from the repo root, exit **0**, with the DEC-49 guard's REACH unmoved at
  **220** and its `reachGap` CEILING unmoved at **41**. `check-mock-envelope` green. The harness
  observed **3,569 op answers across 72 distinct ops** under this change with no assertion moving.
- **`agent-worker`** — passes a plane refusal through as `plane: answer`, unchanged. It GAINS the
  translation it was already documented as carrying. Fleet suites green in the battery.
- **`newgroup`** — reads no refusal translation (measured: no occurrence in `setup.mjs`).
- **The battery** — 143/143 suites green, and no suite that compares a refusal object had to change.

**THE ONE THING A CONSUMER MUST KNOW AND CANNOT INFER:** the attach is keyed on the DEC-49 catalogue,
so a refusal whose code has no row still arrives bare. That set is REC-64's remaining sweep and is
printed as a census by `bio-plane/test/refusal-wire.test.mjs` on every run — **30 such codes
observed** in the 2026-08-09 drive. A consumer must therefore treat `translation` as PRESENT-OR-NOT
rather than guaranteed, and must not synthesise one when it is absent (DEC-8).

### 2 · RESPONSES

*(To be answered by the consumer areas. RECORD's own position: **ADDITIVE and safe to accept** —
the change can only add keys, never alter or remove one, and the three keys it adds are the three
DEC-49 already licenses and that one refusal in this family already carried.)*

### 3 · RESOLUTION

*(RESOLVED 2026-09-10 by CONDUCT #9 at the backlog pass — ADDITIVE, collapsed into I3 10.4.0; see "THE 2026-09-10 BACKLOG RESOLUTION" at the foot of this file.)*

## IC-53 · I3: every `op=queue` ITEM gains ONE ADDITIVE FIELD — `disposition`, the identity the disposition act is keyed on · PROPOSED 2026-08-09 (PL-13, answering UI-45's handed-over plane question) — the version bump and the RESOLUTION are CONDUCT's

### 1 · PROPOSED

**The interface:** I3, the control plane. **The op:** `op=queue`. **The change: ONE new
object on every item in `items[]`, and nothing removed, renamed, reordered or
re-typed.**

```
disposition: {
  available:   boolean,              // can this item be adopted / deferred / dismissed at all
  op:          "proposedispose"|null,// the act, when there is one
  keyed_on:    ["progression_key","stage_key"],   // ALWAYS present: what the act is keyed on
  key:         "<progression>::<stage>"|null,     // the key itself, ready to send
  progression_key, stage_key,        // present only when available
  reason:      "<slug>"|undefined,   // present only when NOT available
  instead:     "taskresolve"|"queuemute"|null,    // the act that DOES apply, by class
  detail:      "<sentence>"          // always
}
```

**WHY, and it is a defect that was LIVE rather than a tidiness.** `op=proposedispose`
is keyed on `(progression_key, stage_key)` — that pair is `proposal_dispositions`'
primary key — and it refuses a pair that is not a real stage of a defined progression.
Only the two kinds `proposalsFeed` produces carry it. **UI-45 found the surface drawing
Adopt / Defer / Dismiss on EVERY FINDING**, so on PL-15's `out-of-inquiry-lead` — whose
basis carries neither key by design — all three controls could only ever have been
refused, and the act dialog they fed was built from two nulls.

UI-45 fixed the surface correctly and by the right method (*ask what identity the act is
keyed on; do not ask what kind it is*), **but it had to answer the question by reaching
into the item's `basis` and testing for two FIELD NAMES it had learned from reading the
plane's producers.** That is a copy of the act's key living in a renderer — DEC-8's drift
class exactly. The moment a second disposition identity exists, or one producer spells
the pair on `subject` while another spells it on `basis`, the surface is wrong and
nothing fails. **The act's key is the act's own business, so the plane answers it.**

**Derived ONCE, at the mint** (`#dispositionOf`, called in `queueFeed`'s minting loop
beside the class checks), so six producers cannot hold six copies of the act's key. It is
deliberately OUTSIDE the `DEC-49 REGION is-queue-mint` markers: it mints no refusal code,
and a `where` that swallowed it would claim a span whose refusal set the guard would then
have to account for.

**WHAT IT DOES NOT DO, stated so nobody reads the field as more than it is.** It does not
widen the act, does not change `proposal_dispositions`, and mints no new refusal. It says
*this item has an identity the act can be keyed on* — the act still checks that identity
against the definition tables, and those are different claims. Widening the act to a
second identity is a doctrine question about what declining means for a finding
recomputed on every read (D-222's grain problem) and is open as **D-266**.

**MEASURED CONSUMER IMPACT — ONE FUNCTION, in one file, and it was already the seam.**
`grep -a "disposition" civicos-ui/app.html` before this change: the only consumer of the
concept is `notifDispositionKeyed`, UI-45's own predicate, called from exactly two sites
(`queueEntryControlsHtml`'s FINDING branch and `queueItemHtml`'s grade line). Its body now
reads `it.disposition.available` **and keeps the old basis-shape read as a NAMED
fallback** — not dead code: this surface is deployed against whatever plane an instance is
running, and a plane built before PL-13 publishes no such field. Falling back there gives
that plane's own answer rather than a silent "no" that would withdraw a control a member
legitimately has. No other consumer exists in `civicos-ui/**`, `agent-worker/**`,
`pdf-worker/**` or `newgroup/**` — checked over all four.

**Additive, so nothing that reads `op=queue` today can break**: a consumer that ignores
the field sees the answer it saw yesterday.

### 2 · RESPONSES

*(PL-13's own position, for the areas it can answer for.)* **RECORD: ADDITIVE and safe.**
**UI: NOT-AFFECTED IN THE BREAKING SENSE and MIGRATED IN THE SAME COMMIT** — the one
consumer is `notifDispositionKeyed` and it is updated here, with `notifications.test.mjs`
green. UI-43 is live on `app.html` and this touches one function body inside UI-45's
`__NOTIFICATIONS__` region, disjoint from the four transition acts.

### 3 · RESOLUTION

*(RESOLVED 2026-09-10 by CONDUCT #9 at the backlog pass — ADDITIVE, collapsed into I3 10.4.0; see the foot of this file.)*

## IC-52 · I3: `op=versionaccept` GAINS AN `affirmed` ARGUMENT AND A REFUSAL (C-25.33); `op=versionstrength` AND `op=basisversions` EACH GAIN ONE ADDITIVE FIELD · PROPOSED 2026-08-09 (D-271, enacting DEC-32 clause 4 and completing D-195) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I3 (the op contracts). No op is added or removed and no existing field
  changes shape or meaning. What changes is (a) ONE new argument, (b) ONE new refusal
  condition on ONE of the six version acts, and (c) TWO additive published fields.
- **Proposer:** D-271, 2026-08-09, worktree `agent-a8660daae0e0fa392`.
- **Owner of the producer:** PLANE. **Consumers measured below, including one that is
  UNMERGED and is the reason this row matters today.**

### WHAT CHANGES

1. **`op=versionaccept` TAKES `affirmed`** — the separately sufficient parts the member
   affirms would each carry the answer on their own. Array or comma-separated string, in
   the body or the query string. The other five version acts are UNCHANGED and do not read it.
2. **A NEW REFUSAL, `VERSION_AFFIRMATION_INCOMPLETE` / `C-25.33`**, on `op=versionaccept`
   ALONE and **only where the reading declares MORE THAN ONE part.** It fires when the
   naming is absent, partial, or names a part the reading does not rest on. DEC-32 clause 4:
   independent sufficiency *"can never happen by omission, by default, or by a member simply
   not understanding the question."*
3. **`op=basisversions` publishes `affirmed`** per version — the part names, or `null`.
   `null` means NOBODY WAS ASKED and is load-bearing: it is what every version accepted
   before this existed reads, and it is a different fact from an affirmation naming nothing,
   which the act cannot write.
4. **`op=versionstrength` publishes `independence`** — `{ checked, parts, shared[], complete,
   limit }`, **recomputed at read time** through the same `#independenceOf` that CHECK 4
   refuses on. This is D-195's derivation arriving on a READ for the first time.
5. **NO published field is removed.** `shared_origins`/`origins_complete` stay on
   `op=suggest`'s answer with their values unchanged, even though this item MEASURED them to
   be constants on the pass path. Removing them would break consumers for no gain; the
   comment at the site now says what they do and do not carry.
6. **Schema:** ONE additive nullable column, `inquiry_basis_versions.affirmed_parts`, through
   `#migrate`'s existing additive-column list. No table, no backfill — backfilling any value
   would manufacture the affirmation the clause requires be affirmatively claimed.

### MEASURED CONSUMER IMPACT

**THE FENCE IS EXACTLY AS WIDE AS ITS RULE, AND THAT IS THE MEASUREMENT THAT MATTERS.**
The refusal fires only on readings declaring more than one separately sufficient part.
**Every accept in the battery today is of a single-part reading**, so the whole existing
corpus is unaffected — measured by running it: `versionstate.test.mjs` went 71 → 83
assertions with zero pre-existing arms moving, and the over-strictness arm (a one-part
reading accepting with no affirmation at all) is in the suite for exactly this reason.

**`civicos-ui/app.html` on `main` — ZERO.** Six call sites of `op=basisversions`, none of
`op=versionstrength`, none of `op=versionaccept`. Both new published fields are additive and
no renderer enumerates keys.

**`agent-worker` — ZERO, and structurally so.** One non-test consumer:
`src/index.mjs:586` reads `op=basisversions` for DEDUP. The field is additive. It cannot be
affected by the refusal at all: it authenticates with a MACHINE credential and
`MACHINE_CANNOT_MOVE_VERSION` (C-25.24) already refuses every version act to machines, which
is §4's rule and not this item's.

**`newgroup` — ZERO.** No reference to any of the three ops.

**UI-43's ACCEPT CEREMONY — THE ONE REAL CONSUMER, AND IT IS UNMERGED.** Measured against
`worktree-agent-a9e7e017d06799858` at `fd1e2ae`, which is NOT on `main`: that surface calls
`op=versionaccept` at one site and `op=versionstrength` at four. **It already gates on the
affirmation and already holds the value** — its ceremony state carries `affirmed:{label:true}` —
and its own comment says *"there is no field on any of the six acts for the affirmation itself."*
**There now is.** The coupling is therefore ONE LINE (send what it already has), not a redesign,
and the two items were designed against the same clause from opposite sides. **CONDUCT MUST
SEQUENCE THESE:** if this lands and UI-43's ceremony merges unchanged, its accept of a
multi-part reading will be refused by C-25.33 — correctly, but the surface will not have sent
what it is holding. `op=versionstrength`'s new `independence` also replaces the sentence UI-43
had to put on the page saying the derivation was NOT PUBLISHED; that sentence is now false and
is UI's to correct, not this item's.

**Nothing else in the plane reads these three ops.**
---

## IC-57 · I3: `op=queue`'s ENVELOPE gains TWO ADDITIVE BLOCKS — `disposed` (the aged decisions) and `unattributed_readings` (the counted silence) · PROPOSED 2026-08-09 (D-266) — the version bump and the RESOLUTION are CONDUCT's

### 1 · PROPOSED

**The interface:** I3, the control plane. **The op:** `op=queue`. **The change: TWO new
objects on the ANSWER'S ENVELOPE, beside `mute` and `counts`. Nothing is removed,
renamed, reordered or re-typed, and NO ITEM'S SHAPE CHANGES AT ALL.**

```
disposed: {
  personal:  false,                  // ALWAYS false: a disposition is a record act, not a preference
  findings:  [ { id, key, progression_key, stage_key,
                 state, reason, decided_by, at } ],
  count:     <published>,            // how many are in `findings`
  recorded:  <held>,                 // how many the read knows of
  bound:     64,                     // QUEUE_DISPOSED_MAX
  truncated: boolean,
  detail:    "<sentence>"
}
unattributed_readings: {
  count:      <n>,                   // readings of a shared question this read could not attribute
  inquiries:  [ "<bundle_id>", … ],  // which questions to go and look at. NO reading is named
  detail:     "<sentence>"
}
```

**WHY THE FIRST ONE, and it is a LIVE defect rather than an enrichment.** `proposalsFeed`
has always kept both halves of D-79 — a disposed proposal leaves `proposals[]` and is
RETURNED in `dispositions[]`, because *a finding that disappears is indistinguishable from
one that was never made*. **`op=queue` read that feed, inherited the AGEING, and published
none of the ageing.** So on the one feed a member opens by habit, a finding they had
dismissed simply stopped being in the answer, with nothing anywhere saying so —
indistinguishable from a finding the record never derived. That is the sparse-level
failure `CLAUDE.md` makes a first-class obligation, pointed at the queue.

**The surface had already noticed and had done the only thing it could.**
`civicos-ui/app.html`'s `notifRememberDisposition` / `notifDisposedHtml` keep a
**page-local `Map` of the dispositions THAT PAGE performed** and render them under the
queue. It is honest and it is a second place a fact is stated (D-21 / DEC-8) which
survives **neither a reload nor a second member**. The record holds the fact; this op now
publishes it.

**WHY THE SECOND ONE.** D-266 folds in a smaller gap:
`#findingsVersionFromAnotherTeam` mints NOTHING for a reading of a shared question whose
authoring team the record cannot read — composed by hand, or by a run whose context is not
one of the projects named. **That silence is correct and does not change here**: the source
team is a run's stored context or it is nothing, and guessing one would manufacture the
connection the notification claims attention for. What changes is that a member can now
tell *no reading arrived from another team* from *readings arrived and this record cannot
say whose they are*. **The count is published; the attribution still is not**, and the
answer says why the two ways of being unattributable are not told apart (it would take
projecting a stored column of `ai_runs`, which REC-74's declared role for that reader
forbids).

**WHAT NEITHER BLOCK DOES.** No new op, no new refusal code, no table, no migration, no
change to `proposeDispose`, and **no claim about whether a disposed finding's underlying
gap still fires** — the decision stands until it is re-triaged either way (D-79), and
`op=proposals` is named in the answer as the op that answers that question.

**MEASURED CONSUMER IMPACT — ZERO CONSUMERS TO MIGRATE, and the near-collision is named
rather than left to be met.** Checked over `civicos-ui/**`, `agent-worker/**`,
`pdf-worker/**` and `newgroup/**`: nothing reads `op=queue`'s answer for either name.
**`app.html` line 9948 does read `res.disposed`, and it is a DIFFERENT OP** — `op=dispose`'s
receipt, where `disposed` is an ARRAY of bundle ids. The two never meet (one is a bundle
act's answer, the other is the queue's envelope) but a future helper written across both
would meet them, so it is on the record here. The four `NOTIF_DISPOSED` references in
`app.html` are the page-local shadow described above; they keep working untouched and are
now replaceable by a read, which is filed as a DELEGATION to UI rather than done here —
**UI-43 is live on that file.**

**Additive, so nothing that reads `op=queue` today can break**: a consumer that ignores
both blocks sees the answer it saw yesterday, item for item.

### 2 · RESPONSES

*(D-266's own position, for the area it can answer for.)* **RECORD: ADDITIVE and safe** —
no item shape changes, and the two blocks are derived from a read `queueFeed` already
performs. **UI: NOT-AFFECTED IN THE BREAKING SENSE and NOT MIGRATED HERE, deliberately.**
The surface renders correctly today from its page-local shadow; replacing that shadow with
the published block is a real improvement and it is UI's to make, in a file UI-43 is live
in. The delegation names the two functions.

### 3 · RESOLUTION

*(RESOLVED 2026-09-10 by CONDUCT #9 at the backlog pass — ADDITIVE, collapsed into I3 10.4.0; see the foot of this file.)*

---

## IC-58 · I2: the text shape gains ONE ADDITIVE FIELD — `producer`, WHO MADE THE TEXT LAYER, and `reading.text_source` may now carry a SECOND step naming that engine · PROPOSED 2026-08-10 (D-251) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-08-10 by CONDUCT at integration.** Additive, and the measured consumer impact is the reason it is accepted rather than merely allowed: zero readers break (grepped across seven trees — nothing enumerates the text shape's keys and nothing read `producer`), no schema change was needed because CPDF-10's `reading_text_source` index already existed with nothing to distinguish, and `op=textprovenance&step=ocr` starts answering as a consequence rather than as a new surface. FRAMEWORK is DORMANT, so CONDUCT answers on its behalf in writing, which is the protocol's step 3 and the same route IC-1 took on 2026-08-03.

- **Interface:** I2 (content → framework), currently **1.1.0 STABLE**
- **Proposer:** CONTENT-PDF, session `cpdf-d251`, 2026-08-10, enacting `DEBT.md` D-251
- **Owner to land the version bump:** `FRAMEWORK` (dormant — CONDUCT answers for it, in writing,
  per the protocol's step 3)
- **Consumers to answer:** `FRAMEWORK` (owner and consumer); and in practice the surfaces that
  read a reading's provenance — the `readings` projection, `op=reading`, `op=textprovenance`,
  `op=textattest`, and an exported bundle's `data/provenance.json`
- **Producers affected:** `CONTENT-PDF` (this change), `CONTENT-OFFICE` (NOT-AFFECTED by
  construction — see MIGRATION), `CONTENT-HTML` (dormant)
- **Status:** PROPOSED, and **ADDITIVE**

### WHAT CHANGED

**One optional field on I2's text shape**, emitted by `extractPdfStructure`'s `text`:

```
text.producer = {
  producer:      <string>|null,       // the trailer's /Info /Producer, verbatim
  creator:       <string>|null,       // the trailer's /Info /Creator, verbatim
  determination: "ocr" | "undetermined",
  ocr:           { engine, field, marker } | null,
  why:           "no_producer_metadata" | "no_ocr_marker_in_producer_metadata"
                 | "encrypted" | "info_unreadable" | null
}
```

**And one consequence at the reading boundary, inside the shape IC-39 already
established**: when `determination` is `"ocr"`, `reading.text_source` — already a CHAIN since
IC-39 — carries a SECOND step, so the provenance reads `layer -> ocr(<product>)`:

```
[ { step: "layer", tier: 1, container: "pdf", cap: null, measured_by: "…" },
  { step: "ocr", engine: "ABBYY FineReader Engine 11", version: null,
    field: "creator", marker: "abbyy", cap: null, measured_by: "…" } ]
```

`text_tier` and `text_container` are **UNCHANGED**. A document with no marker carries the ONE
`layer` step it has always carried, byte for byte.

### WHY THE DEFAULT IS THE DESIGN, AND WHY THERE IS NO "authored"

**`determination` has exactly two values and "authored" is not one of them.** It cannot become
one: `PRODUCER_DETERMINATIONS` is a frozen array and the suite asserts its membership by name.
That is the whole item rather than a detail of it. A producer string can establish that OCR
software touched the layer; **nothing in an ABSENT marker can establish that a human typed the
text** — a file may carry no `/Info`, may have been re-saved by a tool that overwrote it, or may
name a product nobody has heard of. So the classification may only ever make the claim WEAKER,
and it is built so that it structurally cannot do otherwise: the composition in `index.mjs` only
ever APPENDS through `appendStep` (the function that already refuses a step claiming a stronger
cap), and the marker table is a DETECTOR whose absence of a hit is the status quo ante.

**The named engine's `cap` is `null` — UNDETERMINED, STATED.** It is somebody else's engine, run
at a quality nobody here measured. What the chain gained is not a letter; it is the ENGINE'S
NAME, which is what a calibration is OF (CPDF-13) and what a reader would need to re-run the
claim. **A consumer must not read that null as "fine"**, which is IC-39's existing clause and is
restated here because a second null now appears on a second step.

### MEASURED CONSUMER IMPACT

**Measured, not estimated, and it has three parts.**

**(a) ZERO STORED READINGS CHANGE, and zero readers break.** `text.producer` is a NEW key on an
object every existing consumer reads by key: grepped across `bio-plane/src`, `bio-plane/test`,
`civicos-ui`, `pdf-worker`, `agent-worker`, `docprofile` and `newgroup`, **no reader enumerates
the text shape's keys and none reads `producer`** — the only consumer of the whole object is
`docprofile`'s `readText`, which takes `document`/`pages`/`undetermined`. A `text` from an office
container or from the Tier-2 member simply has no `producer` key, and an absent key reads as an
absence, which is what it is.

**(b) THE CHAIN LENGTHENS FOR ONE CLASS, AND THE INDEX THAT WAS BUILT FOR IT STARTS ANSWERING.**
`reading_text_source` already carries `terminal_step` and an `engines` JSON array, and is indexed
on `(transcribed, terminal_step)` — CPDF-10 built that index and until now it had nothing to
distinguish, because every PDF's terminal step was `layer` and every `engines` array was empty.
**`op=textprovenance&step=ocr` answered NOTHING for a store holding machine-transcribed certified
resolutions.** It now returns them, naming the engine. **No schema change is required and none was
made** — the column existed and was empty. This is asserted through the op in
`producer-provenance.test.mjs`, not argued here.

**(c) ON THE LIVE RECORD, MEASURED THE SAME DAY** (MEASUREMENTS.md 2026-08-10): the three
attachments CPDF-9 named — Oakland's enacted certified resolutions **89484, 89498 and 89518
CMS** — were re-fetched from Legistar and read by this extractor. All three now read
`layer -> ocr(ABBYY FineReader Engine 11)`. **The other 8 attachments on those same three
matters** (Acrobat Distiller, Word for Office 365, Quartz PDFContext, PScript5, Aspose, and three
encrypted reports) **all read `undetermined` — zero false positives**, and the encrypted ones name
`encrypted` rather than being matched against ciphertext.

### WHAT A CONSUMER MUST DO

**Nothing, to keep working.** To BENEFIT: ask `terminal_step`/`engines` (or the chain's steps)
rather than treating "this document has a text layer" as one population — it never was one, and
IC-39 already said so. `derivationCap` is unchanged and still answers `null` for these documents,
because naming the engine did not measure it.

### 1 · PROPOSED — 2026-08-10, CONTENT-PDF

Landed on the area's own branch, green, with the three negative-control arms run and recorded.

### 2 · RESPONSES

*(FRAMEWORK is dormant. CONDUCT answers on its behalf, in writing, naming that it did so.)*

### 3 · RESOLUTION

*(CONDUCT's. The I2 version bump is CONDUCT's — IC-39's precedent, which is the row this one
extends and which is itself still PROPOSED at I2 1.1.0.)*
## IC-60 · I3 + I5: `op=proposedispose` GAINS A SECOND KEY SHAPE — `(project, finding)` — FOR THE STANCE-SCOPED FINDING KINDS, and `op=queue`'s per-item `disposition` block gains `scope` / `finding` / `projects` / `requires` · PROPOSED 2026-08-10 (D-266, enacting the 2026-08-10 scoping ruling) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-08-10 by CONDUCT at integration.** The second key shape is additive and the old shape is bridged BY NAME rather than left to fail obscurely — a `key` whose first segment is a catalogued FINDING kind is refused `NO_PROJECT_SCOPE` naming what to send, instead of the true-and-useless `NO_SUCH_PROGRESSION`. The one live consumer is `civicos-ui/app.html`, which will draw the three controls and send `key` with no `project`; it renders that refusal, so the failure mode during the gap is a stated refusal and never a silent no-op. **The UI half is DELEGATED and not folded in here** — `disposition.requires`/`projects` must be read and the project CHOSEN, never defaulted where an item has several homes, because defaulting would pick whose judgment the record carries.

### 1 · PROPOSED

**The interfaces:** I3 (the control plane) and I5 (the store schema). **The ops:**
`op=proposedispose` (a second accepted key shape) and `op=queue` (four additive fields
inside the per-item `disposition` object IC-53 introduced). **Nothing is removed,
renamed, reordered or re-typed. The instance-wide key shape is UNCHANGED and the
instance-wide behaviour is UNCHANGED.**

**THE RULING THIS ENACTS, and it was not Bob's because the repository already answered
it (D-266's row, 2026-08-10): A DISMISSAL IS SCOPED TO THE KEY'S OWN SUBJECT.** DEC-16's
instance-wide clearing is instance-wide *because its subject is* — a progression-stage
finding is a fact about the SHARED record, so one act clearing it everywhere is dedup and
not judgment-suppression. A stance is expressly one project's own property (§7, D-216), a
dismissal is a judgment-layer act, and R5 makes forks at the judgment layer legitimate —
so **one team's dismissal of a stance-scoped finding governs THAT TEAM'S feed and nothing
else**, which is exactly the boundary `#findingsStanceDiverged` already enforces by
refusing to offer `op=versioncurrent` across projects.

### The change, in two halves

**(a) `op=proposedispose` — a SECOND key shape, chosen by which one the caller sends.**

```
# UNCHANGED — the shared record. One act, every case, instance-wide (DEC-16).
{ key: "<progression>::<stage>" | progressionKey + stageKey, to, reason }
    -> proposal_dispositions  PRIMARY KEY (progression_key, stage_key)

# NEW — the judgment layer. One team's feed and nobody else's (§7 / D-216 / R5).
{ project: "<PROJ bundle id>", finding: "<the item's own id>", to, reason }
    -> finding_dispositions   PRIMARY KEY (project_id, finding_id)
```

New refusal codes, all fail-closed and all naming what is missing:
`NO_PROJECT_SCOPE` (a stance-scoped finding named with no project),
`NO_SUCH_PROJECT` (the project is not a project bundle this viewer can see),
`NO_FINDING` (a project named with no finding). `NOT_A_DISPOSITION`, `NO_REASON`,
`BAD_REASON` and `NO_DECIDER` apply to BOTH shapes, unchanged and re-used rather than
re-spelled.

**(b) `op=queue`'s per-item `disposition` (IC-53) gains FOUR fields.** `available`,
`op`, `keyed_on`, `key`, `reason`, `instead` and `detail` keep their names, their types
and — for the two shared-record kinds — their exact values.

```
disposition: {
  available: true,
  op:        "proposedispose",
  scope:     "instance" | "project",   // NEW. WHICH SUBJECT the act's key is about
  keyed_on:  ["progression_key","stage_key"] | ["project","finding"],
  key:       "<prog>::<stage>" | null, // null when the ACTING project is the caller's to name
  finding:   "<the item's own id>",    // NEW. present on the project-scoped shape
  projects:  [ "<PROJ id>", … ],       // NEW. the project homes this act may be recorded under
  requires:  ["project","finding"],    // NEW. what the caller must send beyond to+reason
  detail:    "<sentence>"
}
```

**WHICH KINDS MOVE, AND IT IS A PROPERTY RATHER THAN A LIST OF SLUGS** — the lesson
UI-45 wrote and PL-13 kept: a FINDING that carries the `(progression_key, stage_key)`
pair is instance-wide; a FINDING that carries none is project-scoped, keyed on the
project homes it is filed under. Today that property selects exactly the three kinds
D-266's row names — PL-15's `out-of-inquiry-lead` and PL-13's
`stance-changed-here-not-elsewhere` and `new-version-arrived-from-another-team` — and a
fourth non-derived finding minted next wave is covered without this contract moving
again. A project-scoped finding filed under NO project home at all reports
`available: false` with `reason: "no_project_scope"`, which is an honest third answer and
not a silent no.

**WHAT THE FEED DOES WITH IT.** A project-scoped disposition removes the disposing
project from that item's `case.ancestors` and declares the removal; the item leaves the
open list only when EVERY project home has disposed it, and it is then reported in the
envelope's `disposed` block (IC-57) with its project. A shared-record disposition is
untouched: one act, every case, instance-wide.

**NOTHING TO MIGRATE IN THE STORE, which is why this is cheap now and would not be
later.** `finding_dispositions` is a NEW table; `proposal_dispositions` is not altered,
so no row moves and no `#migrate` step is owed. **No disposition has ever been recorded
for these kinds** — the row says so and the table's emptiness is the proof.

### MEASURED CONSUMER IMPACT

Measured 2026-08-10 over `civicos-ui/**`, `agent-worker/**`, `pdf-worker/**`,
`docprofile/**`, `newgroup/**` and `tools/**` by grep, not by recall.

| consumer | reads | impact |
| --- | --- | --- |
| `civicos-ui/app.html` | 11 `proposedispose` sites; `notifDispositionKeyed` reads `disposition.available`; `queueFindingKey` composes the key from the ITEM ID; `doProposalDispose` sends `{key,to,reason}` | **THE ONE LIVE IMPACT, and it is stated rather than discovered.** When `available` turns `true` for a stance-scoped item the deployed page draws Adopt / Defer / Dismiss and sends `key` with **no `project`** — so the act is REFUSED `NO_PROJECT_SCOPE`. The dialog RENDERS the plane's refusal (`PROP_ACT.refusal = out`, measured at `app.html`'s `doProposalDispose`), so a member sees the record's own words naming exactly what is missing rather than a dead click. **DELEGATED to UI in `CLAIMS.md`**: read `disposition.requires` / `disposition.projects` and send `project` + `finding`. |
| `civicos-ui/test/notifications.test.mjs` (7), `act-proposal.test.mjs` (10), `notifications.control.mjs` (2), `conclude-act.test.mjs` (1) | hand-built page-local fixtures | **ZERO assertions move.** Measured: the `LEAD(...)` fixture carries **no `disposition` field at all**, so `notifDispositionKeyed` takes its NAMED fallback and still answers `false`; and its `CASE_B` homes are of type `inquiry`, so it would answer `false` under the new rule too. The suites are surface tests over literals, not over a plane answer. |
| `agent-worker/**`, `pdf-worker/**`, `docprofile/**`, `tools/**` | — | **NOT-AFFECTED.** No reference to `proposedispose` or to a `disposition` field anywhere in any of them. |
| `newgroup/**` | `src/release.mjs` / `dist/newgroup.bundled.mjs` contain the string | **NOT a consumer.** They are an EMBEDDED SNAPSHOT of the plane's own source in the installer artifact, regenerated by DIST at release. Named so a later reader does not read the grep hit as a contract dependency. |

**Consumers to answer:** `UI` (the one live impact above). **Producers affected:** none
outside `RECORD`'s own paths.

### 2 · RESPONSES

*(awaiting)*

---

## IC-61 · I3: `op=strengthbarof` (and `op=publish`'s stamped `required` block) STOP COUNTING A CITING PROJECT THAT WITHDREW; `restson` gains an additive `status` per dependent · PROPOSED 2026-08-10 (D-280) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-08-10 by CONDUCT at integration, AND THE CONSEQUENCE IS ROUTED RATHER THAN ABSORBED.** The shape change is accepted on its measured impact — zero UI consumers today, so nothing is rendering the old answer and the change cannot surprise a surface. **But this IC's own sentence is the reason it is not merely accepted: it LOOSENS A PUBLICATION FENCE, and a fence that moves outward through a defect fix is the class `CLAUDE.md` names as Bob's** — *"Publishing would then be permitted for material we cannot attribute" is his call.* Attribution is untouched here and the bar is about required STRENGTH, so it is not that sentence; it is that SHAPE. Raised as **DEC-71**, running under the shipped fix as its provisional, because the defect being corrected points the same way: a withdrawn project was enforcing a requirement it no longer asserts.

- **Interface:** I3 (plane → UI, the op contracts)
- **Proposer:** RECORD, session `record-d280`, 2026-08-10, enacting `DEBT.md` D-280 site (a) and (b)/(d)
- **Consumers to answer:** `UI` — and see MEASURED IMPACT: it has none today
- **Status:** PROPOSED. **NO KEY IS ADDED OR REMOVED ON `op=strengthbarof`. THE ANSWER'S VALUE
  MOVES FOR ONE INPUT CLASS**, which is the same kind of change IC-4 and IC-5 were filed for
  (an op's answer becoming viewer-dependent added no key either), so it is filed rather than
  argued to be exempt.

### WHAT CHANGES, precisely

**1. `op=strengthbarof&target=<id>` — the value, for one input class only.** Today
`#requiredStrengthFor` walks `refs WHERE target_id=?` and counts every citing PROJECT that
declares a `required_strength`, WITHOUT reading whether that project's own reference entry
says `status: severed`. `refs` is a projection of `references[]` that carries the RELATION and
DROPS the STATUS (D-21, D-267), so a project that WITHDREW keeps its row and keeps setting the
bar on the document it left. After this change a citing project counts only while at least one
of its reference edges to the target is LIVE.

    before, target cited ONLY by a withdrawn project:
      { declared: true,  source: "project", projects: ["PROJ-…-withdrawn"], capture: "A", connection: "A", detail: "required by PROJ-…" }
    after:
      { declared: true,  source: "group",   capture: <group default>, … }        // if the group declares one
      { declared: false, source: "none",    capture: null, connection: null, … } // if it does not

**A target with no withdrawn citer answers BYTE FOR BYTE what it answers today.**

**2. `op=publish`'s `findings[].required` block, which is the SAME read.** `publishCase` calls
`#requiredStrengthFor` directly, so an edition published while the only bar-setting citer has
withdrawn now stamps `declared: false, source: "none"` into the SIGNED bytes instead of naming
a project that left. **Editions already signed are not touched and are not recomputed.**

**3. `restson` — ADDITIVE, and it is not a control-plane op.** `restingOn` reads
`inquiry_basis WHERE target_id=?` and returns the dependent legs. Each dependent row gains
`status: "confirmed" | "severed"`, read from the dependent's own document through the ONE
predicate. **Nothing is dropped** — this is `op=backlinks`' posture, which publishes the status
rather than filtering on it, because the historical edge is a fact the record keeps.

**4. `#routeTask`'s citing-project arm** changes which member a drained task is ADDRESSED to
when the first citing project by id has withdrawn: it falls through to the next live citing
project, then to the RULED group-admin fallback, then to `unassigned`. **No shape moves**; the
routing chain and every one of its `basis` strings already existed.

### THE CONSEQUENCE SOMEBODY SHOULD CHOOSE RATHER THAN INHERIT, stated in the open

**This LOOSENS a publication fence.** DEC-17's bar is what REC-15's preflight measures a case
against. A case whose only bar came from a project that has since withdrawn will, after this,
be measured against the group default or against nothing. That is the item's intent and the
queue row names it — a bar is *"the group's own declaration about its own work"*, and a project
that recorded the decision to stop drawing on a question is not declaring anything about it any
more. The opposite reading (a bar, once set, outlives the declarer's withdrawal) is coherent and
is NOT what this lands; if CONDUCT or Bob prefers it, reversing costs one predicate call.

**It cannot loosen SILENTLY.** `declared: false` prints the standing sentence *"An absent bar is
not a bar of zero, and this case makes no claim to have cleared any standard"* — so the record
says what it is doing rather than quietly passing a case.

### MEASURED CONSUMER IMPACT, and it is measured rather than asserted

- **`civicos-ui`: ZERO.** `grep -rl strengthbarof civicos-ui` → no files. `grep -rl restson
  civicos-ui` → no files. Nothing in the UI tree reads `required_strength` or a `.bar` field.
- **Across `civicos-ui`, `newgroup`, `agent-worker`, `pdf-worker`, `docprofile`, `tools`:** the
  only hits are BUILT ARTIFACTS — `release/bio-plane.bundled.mjs` and
  `newgroup/dist/newgroup.bundled.mjs` — which are compiled copies of `bio-plane/src` and are
  regenerated by DIST, not hand-maintained consumers.
- **In-tree readers of the moved value:** `bio-plane/test/publish.test.mjs` (§4's DEC-17 block
  and §5's edition-2 stamp), `bio-plane/test/gate-reads.test.mjs` (REC-30's redaction arms),
  `bio-plane/test/d216-sharing.probe.mjs`, `bio-plane/test/machine-fences.test.mjs`. **Every one
  of those fixtures cites its target with `status: confirmed` or with no severed edge at all, so
  every one of them is in the unchanged class** — predicted before the run and CONFIRMED by the
  battery afterwards (161/161 → 162/162, delta attributable to the new suite alone).
- **No schema change.** `refs` is NOT taught a `status` column — that would move a shape twelve
  readers and the export manifest build against, for a fact only the document is authoritative
  about (D-21). This is D-267's ruling, re-applied rather than re-decided.

### MIGRATION

None for any consumer. A UI that starts reading the bar reads the same keys it would have read
before; it simply gets the answer of the projects that still stand behind it.

---

## IC-62 · I3: `RUN_ENDINGS` GAINS ONE ADDITIVE TERM — `mode-not-deployed`, so a launch the deployment gate REFUSED stops saying a member cancelled it · PROPOSED 2026-08-10 (FL-7, enacting SK-4's DELEGATION) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-08-10 by CONDUCT at integration.** Additive, and accepted on a MEASURED basis rather than a permissive one: ten files read `RUN_ENDINGS`, nine derive from `Object.keys` or look up by key and absorbed the third term with no edit, and exactly one carried a hand-written exhaustive expectation — which was corrected, not exempted. **`civicos-ui`'s impact is zero and STRUCTURALLY so**, because its own ARM V1 asserts the UI holds no copy of this vocabulary, so the change stayed two-area rather than three; that is the drift defence paying for itself at the moment a vocabulary moved. **The residue this row NAMES rather than fixes is now FL-8**: a gate-refused run still records status `finished`, which is the same misdescription one vocabulary over. Naming it here instead of reaching into `RUN_STATUS` mid-item was the right call — a third vocabulary is not a place to arrive by accident.

- **Interface:** I3 (the plane's published run vocabulary — `RUN_BOUNDS` / `RUN_ENDINGS`,
  reaching members through `op=affordances`' pack body and through a run's own stopped record)
- **Proposer:** FLEET, session `fl7-gate-ending`, 2026-08-10, from QUEUE FL-7
- **Owner to land it:** FLEET (the declaration is `bio-plane/src/airun.mjs`; the producer is
  `agent-worker/src/harness.mjs`)

### 1 · PROPOSED

### WHAT CHANGES, precisely

`bio-plane/src/airun.mjs`'s `RUN_ENDINGS` goes from two terms to three:

    completed          "the run finished its work"
    cancelled          "a member stopped it"
  + mode-not-deployed  "the deployment gate refused this launch before it spent anything: the
                        mode it asked for is not deployed yet, and no member and no budget was
                        involved"

`agent-worker/src/harness.mjs`'s `gate-mode` branch closes on that term instead of on
`cancelled`. **Nothing is renamed, nothing is removed, and no existing value changes meaning.**
This is purely ADDITIVE: every run already closed under `completed` or `cancelled` still reads
exactly as it did, and `checkBound` (C-22.5) accepts a strict superset of what it accepted
before.

### WHY — AND THE HALF THAT MAKES IT AN ERROR RATHER THAN A PREFERENCE

FL-3's mode gate closes a refused run with `bound: "cancelled"`. The plane's own vocabulary
defines `cancelled` as **"a member stopped it"**. A member did not: the gate refused a launch
before anything was spent. **So the run's own ending currently attributes a machine refusal to
a member act** — a record claiming more than it can support, in the one field that says why a
run stopped, and this project ranks that class worst.

`RUN_ENDINGS`' own header already contains this argument, one value over: *"'the member asked
for it to stop' and 'the budget ran out' are different facts, and collapsing them would put
this item on the wrong side of its own doctrine two lines after stating it."* A gate refusal
is a THIRD such fact, and the same sentence decides it.

### WHY NOT THE OTHER READING — correcting the comment — AND IT WAS A REAL OPTION

FL-7 could have closed by editing `harness.mjs`'s header to say the gate terminates on
`cancelled`, making the two agree at zero cost and adding nothing to a published vocabulary.
**That was rejected because it closes the cheap half and cements the expensive one.** The
disagreement between the header and the code is the SYMPTOM; the misattribution is the defect.
A comment correction would leave a gate-refused run permanently on record as a member act and
would have made the header's accuracy the reason the misattribution became permanent.

**The precedent that looks like it argues the other way, and why it does not.** `harness.mjs`'s
own header quotes §14b.6: *"the record already has the word and lacks the writer —
`runtime-ceiling-reached` exists in the condition vocabulary with NO producer — IS-9(d) builds
that producer rather than minting a new kind."* That ruling is CONDITIONAL on the word existing.
**Measured here: it does not.** `mode-not-deployed` appears exactly once in the entire
repository — in the comment that promises it — and is in neither `RUN_ENDINGS` nor `RUN_BOUNDS`.
Applied honestly the precedent points the other way: there was no word, both existing endings
are FALSE of this run, and minting is what the case actually calls for. The name is kept as
`mode-not-deployed` deliberately, so the header FL-3 already wrote becomes TRUE rather than
requiring both sides to move to a third spelling.

**Why an ENDING and not a BOUND.** `RUN_ENDINGS` is declared as "the conditions a run may end
on that are NOT a bound being reached". No bound was reached — the gate fires before any bound
is consulted, which `harness.test.mjs` A6 and `skillsequencing.test.mjs` ARM D4 both already
measure. It is an ending.

### MEASURED CONSUMER IMPACT, and it is measured rather than asserted

`grep -rln RUN_ENDINGS` across every tree, `node_modules` excluded — 10 files, and each is
classified by how it READS the object rather than by which area owns it:

- **DERIVED, absorbs the new term with NO EDIT (7 files).** `bio-plane/src/skillpack.mjs:394`
  publishes `endings: RUN_ENDINGS` by import (declared `"imported"` at line 208), so the pack
  gains the term with no authorship. `bio-plane/src/store.mjs:22405/23103/23635` renders
  `RUN_ENDINGS[bound]` by lookup. `bio-plane/test/skillpack.test.mjs:302` and
  `bio-plane/test/skilldoctrine.test.mjs:639` build term sets with
  `...Object.keys(RUN_ENDINGS)`. `civicos-ui/check-refusal-codes.mjs` arm E harvests
  vocabularies **BY SHAPE**, so the new term is guarded the moment it lands — its text is
  written to clear that guard's real floor (a PHRASE of ≥3 words, not restating its key).
  `civicos-ui/test/refusal-codes.test.mjs` drives that arm.
- **`civicos-ui/test/ai-session-wire.test.mjs`: ZERO, AND STRUCTURALLY SO.** Its ARM V1 asserts
  the running-session block holds **NO COPY** of this vocabulary and prints what arrived. So a
  new term is not merely tolerated by the UI — the UI is asserted not to know it. Its ARM V2
  polarity fixture reads `Object.keys(RUN_ENDINGS)[0]`, which is `completed` and stays
  `completed` because the term is APPENDED. **No `civicos-ui` edit is owed by this IC**, which
  is why it is a two-area change and not three.
- **EXHAUSTIVE, and it is the ONE assertion that must move: `bio-plane/test/airun.test.mjs:155`**
  (ARM V6), `Object.keys(RUN_ENDINGS).sort()` against the literal `["cancelled", "completed"]`.
  It goes RED on this change **by design** — it is the guard that stops an ending being added
  without a reason — and FL-7 corrects it in the same commit with a dated note, never exempts
  it. `airun.test.mjs:135` prints the count and follows.
- **The tripwire that was BUILT to go red: `bio-plane/test/skillsequencing.test.mjs` ARM D5**,
  SK-4's named tripwire on this exact finding, whose own text instructs the fixing area to
  update it. ARM D4 and the absent/nonsense-mode assertion above it name `cancelled` too and
  move with it.
- **`agent-worker/`: the producer.** `harness.mjs`'s gate branch and header,
  `harness.test.mjs` arm A6's three ending assertions.
- **NO SCHEMA CHANGE.** `ai_runs.stopped_bound` is a text column that already stores whatever
  `checkBound` admits; no table, no column, no migration.
- **Built artifacts are not consumers.** `release/bio-plane.bundled.mjs` and
  `newgroup/dist/newgroup.bundled.mjs` are compiled copies regenerated by DIST.

### THE CONSEQUENCE SOMEBODY SHOULD CHOOSE RATHER THAN INHERIT, stated in the open

**A run refused by the gate is recorded with status `finished`, not `stopped`** — because
`#aiRunTerminate` keys that on whether the ending is a BOUND, and an ending is not. That is
UNCHANGED by this IC: `cancelled` already had exactly that property, so a member-cancelled run
reads `finished` today. **FL-7 does not alter it, and names it here rather than fixing it
quietly**, because whether "refused at the gate" and "ran to completion" should share a status
word is the same question one level up, it reaches `RUN_STATUS` (a third vocabulary), and it is
not what this item was scoped to decide. Raised in FL-7's report for CONDUCT.

### MIGRATION

None for any consumer. A consumer that switches on the ending gains a case it did not have; a
consumer that looks the term up in the published vocabulary — which is every in-tree reader but
one — gets a sentence for it automatically.

### 2 · RESPONSES

_(awaiting: RECORD owns `airun.mjs`'s declaration; UI is measured NOT-AFFECTED above with the
evidence, and CONDUCT may answer for a dormant area in writing per the protocol.)_

### 3 · RESOLUTION

_(CONDUCT's.)_
## IC-63 · I5 + I3: THE CASE OBJECT — a new `cases` table binding a case identity to the PROJECT whose production it is, two additive columns on `published_case_members` (`version_sha`, `role`), and three additive fields plus one statement on `op=publishedmanifest` · PROPOSED 2026-08-10 (CASE-1, enacting DEC-72) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-08-10 by CONDUCT at integration.** Additive only — no key removed, no value moved — and the measured consumer impact is ZERO: the single hand-maintained reader names `case_id`, `edition`, `ord`, `bundle_id`, none of which move, and every other hit is a built copy DIST regenerates. **The `production` statement is the part worth keeping in view:** three different facts arrive as null on a pre-DEC-72 case, and `undetermined` must be STATED rather than inferred from a null — that is this record's rule applied at the moment a model changed underneath existing rows.

- **Interface:** **I5** (the store schema) — the change this item is filed for — and **I3** (the op
  contracts) for the additive half that carries it to a caller.
- **Proposer:** RECORD, session `case1-case-object` (worktree `agent-a1af1f1e654822176`), 2026-08-10,
  enacting `docs/development/CASE-AS-PRODUCTION.md`'s CASE-1 bullet under **DEC-72**.
- **Owner to land it:** `RECORD` (owns I3 and I5).
- **Consumers to answer:** `UI` — and see MEASURED IMPACT: it has none.
- **Status:** PROPOSED. **NOTHING IS REMOVED AND NO VALUE MOVES.** Filed rather than argued to be
  exempt because I5's rules are not style and because a schema is where DEC-72's model either
  becomes structural or quietly does not.

### The change

**1. I5 — one new table, `cases`.** The case IDENTITY and the project whose production it is.

    CREATE TABLE IF NOT EXISTS cases (
      case_id    TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      opened     TEXT NOT NULL
    );

**Keyed on `case_id` alone, and that is the load-bearing decision.** `published_cases` is keyed
`(case_id, edition)`, so a `project_id` column THERE would be a project per EDITION — permitting
edition 1 to be project A's production and edition 2 to be project B's. Under DEC-72 that is not a
case with two editions, it is two productions wearing one identity, and because **the bar is read
from the publishing project at act time** it is also a case whose standard of evidence can change
without anyone authoring the change. One row per case makes that unrepresentable rather than
discouraged.

**`project_id` is NOT NULL, and a pre-DEC-72 case is stated by having NO ROW.** DEC-72 removes the
project-less publication path outright, so a row naming no project would be exactly the shape the
ruling deletes. Cases already in `published_cases` genuinely have no owning project; they get no
row here, and "undetermined" is carried by the absence rather than by a NULL that would read as an
owner the record lost. Backfilling one would be inventing an attribution to get past a gate.

**2. I5 — two additive nullable columns on `published_case_members`.** The design's member is
`(finding id, version hash, role load-bearing|supporting, ordinal)`; before this item the first and
the last were present and the middle two were not.

    version_sha TEXT   -- the member finding's pinned bundle_sha (clause 3, publication pins like a commit)
    role        TEXT   -- 'load_bearing' | 'supporting' (clause 4, AUTHORED by the publisher)

**Both nullable with NO DEFAULT, and that is deliberate rather than lax.** A default on `role` would
mean a member could be designated by OMISSION — `supporting` would have the record assert a group
presented evidence as not load-bearing, `load_bearing` that it asserted the evidence met a bar
nobody claimed. Clause 4's designation is authored by the publisher; a designation that can happen
without an act is not authored. CASE-2 makes both REQUIRED AT THE DOOR, where a refusal can name
what is missing. Added to `#migrate`'s additive `ALTER TABLE … ADD COLUMN` ladder, so an existing
store gets them without a rebuild — `published_case_members` is the published projection and may
never be dropped and recreated.

**Spelling: `load_bearing` / `supporting`**, snake_case like every other closed vocabulary in this
schema (`cuts_against` is the exact precedent — a hyphenated English term stored with an
underscore). Fixed here so CASE-2 and CASE-6 do not each invent a third.

**3. I3 — `op=publishedmanifest` gains three fields and one statement. ADDITIVE, no key removed.**

    cases[].project_id        the owning project, or null
    caseMembers[].version_sha the pinned version, or null
    caseMembers[].role        the authored designation, or null
    production                a STATEMENT saying what each of those three nulls means

`cases[]` is now `published_cases LEFT JOIN cases`. **The join is LEFT and that is not a detail:** an
inner join would DELETE every pre-DEC-72 case from the public index the moment this table landed —
the record losing published material because it gained a column. The suite's negative control arm
(c) drives exactly that and it is invisible over an empty store.

`production` exists because **"undetermined is first-class and must be STATED" is not satisfied by a
null.** Three different facts arrive as null — no project recorded, no designation authored, no
version pinned — and a reader cannot tell them apart without the sentence.

### What is NOT in this change

**No index on `cases(project_id)`.** "Which cases does this project own" is DEC-72 clause 6's query
and it belongs in the commit that brings its reader; an index declared before any statement filters
its leading column is REC-69's own class. **No writer.** Nothing writes `cases` until CASE-2, which
is where `publishCase` first takes a publishing project and an owner-only fence. **No change to
`publishCase`, `publish`, `#caseEditionState`, `publishedCase` or `#requiredStrengthFor`** — all
CASE-2/CASE-3/CASE-5 ground.

### MEASURED CONSUMER IMPACT, measured rather than asserted

- **`civicos-ui`: ZERO.** The one hand-maintained reader is `civicos-ui/app.html:15667`
  (`const members = r.caseMembers || []`), which uses `case_id`, `edition`, `ord` and `bundle_id`
  from a member row and `case_id`, `edition`, `manifest_sha` from a case row. Every one of those is
  untouched; the three new fields are ignored by a consumer that does not name them.
  `civicos-ui/test/publishedcase.test.mjs` and `civicos-ui/test/preauth-vocabulary.test.mjs` BUILD
  `caseMembers` fixtures rather than reading them, so an added key cannot reach them.
- **Across `newgroup`, `agent-worker`, `pdf-worker`, `docprofile`, `tools`:** the only hits for
  `caseMembers` / `published_case_members` are BUILT ARTIFACTS — `release/bio-plane.bundled.mjs`,
  `bio-plane/dist/bio-plane.bundled.mjs`, `newgroup/dist/newgroup.bundled.mjs` and
  `newgroup/src/release.mjs`, which is a compiled copy of `bio-plane/src` regenerated by DIST and
  never a hand-maintained consumer.
- **In-tree readers of the moved shape:** `bio-plane/test/multifinding.test.mjs` is the only suite
  that reads `idx.caseMembers`. **Predicted unchanged before the run and CONFIRMED after it: 74 pass,
  0 fail**, the same figure it reported on the baseline.
- **`bio-plane/test/hygiene.test.mjs`** gains ONE key in its purge `EXEMPT` map for `cases`. That is
  a correction, not an exemption of a rule: `cases` takes the same judgement `published_cases`,
  `published_case_members`, `published_bundles` and `published_shas` already carry — it is the
  published projection, nothing else holds the case-to-project binding until CASE-5's artifact flip,
  and a case once published answers forever. The reasoning is at the site, together with the one
  condition that would reverse it: **if a later item lets a case exist as a DRAFT before it is
  published, this exemption must be revisited**, because a draft case is working data and working
  data surviving a purge is D-113 pointed the other way.
- **No shape any area builds against loses a key, and no value moves for any input.** A consumer
  written against yesterday's answer reads the same bytes it read yesterday for every case in the
  store today, because nothing writes a non-null into any of the three new fields until CASE-2.

### MIGRATION

None for any consumer. A UI that starts reading `project_id`, `role` or `version_sha` gets `null`
until CASE-2 and CASE-3 land, and `production` says in words what that null means, so a surface can
be built against the final shape today without rendering a claim the record cannot support.

## IC-64 · I3: `op=publishedcase`'s member rows GAIN `version_sha` (the pinned version), and the FOUR version acts that MOVE A READING'S STATE now REFUSE on a published finding (`PUBLISHED_CANNOT_MOVE_VERSION`, C-25.34) · PROPOSED 2026-08-10 (CASE-3, enacting DEC-72 clause 3) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-08-10 by CONDUCT at integration.** Measured impact: the four version-act ops have **no rendering consumer** — only four rows in `surface-registry.test.mjs` marking them owed by UI-43 — and `version_sha` has zero consumers outside the plane. **So the behaviour change lands BEFORE its surface exists, which is the cheap direction and is worth naming:** UI-43 will build against a fence that is already true, rather than against one that arrives later and quietly invalidates what it drew. The refusal ships with its sentence — the untranslated-in-reach ratchet did not move.

- **Interface:** **I3** (the op contracts). **NOT I5** — and that is worth stating rather than
  leaving to be noticed: CASE-1 already landed `published_case_members.version_sha`, so this item
  adds no column, no table and no migration row. It FILLS a column that shipped empty.
- **Proposer:** RECORD, session `case3-version-pinning` (worktree `agent-a36b6782b06f5a651`),
  2026-08-10, enacting `docs/development/CASE-AS-PRODUCTION.md`'s CASE-3 bullet under **DEC-72**.
- **Owner to land it:** `RECORD` (owns I3).
- **Consumers to answer:** `UI`. See MEASURED IMPACT — one registry row set, no rendering consumer.
- **Status:** PROPOSED. **ONE HALF IS PURELY ADDITIVE; THE OTHER HALF IS A BEHAVIOUR CHANGE AND IS
  FILED AS ONE.** A field appearing is not an interface event worth an IC on its own; four ops that
  used to SUCCEED now refusing in a state they previously accepted is, and burying that under the
  additive half is how a loosened or tightened fence reaches a release note instead of a review.

### The change

**1. I3 — `op=publishedcase`'s `findings[]` entries gain `version_sha`.** The hash the case FROZE
that member at, written at ratification from the RATIFIED BYTES — it is the member's own
`bundle_sha`, which is the hash the member SIGNED, so the roster row names a version by the same
identity the signature covers. `null` keeps its CASE-1 meaning exactly: rostered, and no version
pinned. The same value already travels on `op=publishedmanifest`'s `caseMembers[]` rows, which
CASE-1 published; this item is what puts a value in it.

**It is served BESIDE `bundle_sha` and is not a second spelling of it.** `bundle_sha` is what the
published row HOLDS; `version_sha` is what the case COMMITTED TO. Today they agree, because a
member's edition is still slaved to its case's — **the moment they can diverge is CASE-5's**, and
this item deliberately does not move the resolution predicate that would make them diverge.

**2. I3 — a behaviour change on four ops.** `op=versionaccept`, `op=versionreject`,
`op=versionconsider` and `op=versionrevert` now REFUSE when the inquiry is `published`:

    reason: "PUBLISHED_CANNOT_MOVE_VERSION"   check: C-25.34
    (a DEC-49 canned translation ships with it, in VERSION_ACT_CHECKS)

**This closes a hole rather than adding a policy, and the precedent is in the two doors either side
of it.** `op=inquirydivide` has always answered `PUBLISHED_CANNOT_DIVIDE` and `op=inquiryground`
`PUBLISHED_CANNOT_RESTRUCTURE` — the latter in words that describe this door exactly: *"a published
case's composed strength and its per-group breakdown are inside signed, ratified bytes. Re-cutting
the structure underneath them would leave this document composing to something the edition on the
record contradicts."* Moving which READING a finding stands on re-cuts that structure by the other
route. DEC-72 clause 3 makes it explicit — Bob: *"Once published, the act of changing the findings
(or any claims of any of the findings) results in the changed version becoming a new version."*

**`op=versionhide` and `op=versioncurrent` are DELIBERATELY UNFENCED, and the line is the catalog's
own rather than a judgement.** It is `VERSION_ACT_TO`, which already maps exactly the state-moving
acts to a state and these two to `null`. `hide` is the prune flag and D-214 / DEC-29(b) rule that
pruning HIDES AND NEVER DELETES, so nothing the published bytes assert has moved; `current` is §7's
PROJECT stance, whose second write lands on the project and which requires `from === "accepted"`
anyway. **A fence tighter than its rule is an undeclared interface change wearing the costume of
caution**, so the over-strictness case is armed as its own negative control (arm (d)) rather than
asserted to be fine.

### What a caller must do

**For the additive half: nothing.** A consumer that ignores `version_sha` is unaffected.

**For the refusal: a surface that offers accept / reject / consider / revert on a finding must stop
offering them once it is `published`, and offer REOPEN instead.** The refusal names the route in
both its `detail` and its canned translation, so a surface that simply renders the translation is
already correct — but a surface that renders the four controls unconditionally will now show a
member four buttons that cannot work, which is the DEC-69 shape (never a control that refuses when
it could be a control that is not there).

### Measured impact

**One registry row set, and no rendering consumer.** Measured 2026-08-10 across `civicos-ui/` and
`newgroup/`: the only hits for the four op names are four rows in
`civicos-ui/test/surface-registry.test.mjs` recording them as **published-by-PL-2, OWED-BY UI-43**
— i.e. the ceremony surface is not built yet, so there is no screen today that offers these acts
and none that can be made wrong by the refusal. `version_sha` has **zero** consumers outside the
plane and the docs. Every other hit is `newgroup/src/release.mjs`, a BUILT COPY of the plane source
that DIST regenerates and nobody edits.

**So the honest reading is that this lands before its consumer exists, which is the cheap moment to
land it** — and the note UI-43 needs is above, in "What a caller must do", rather than in a handoff
nobody re-reads.
---

## IC-65 · I3: `op=publish` REQUIRES A PUBLISHING PROJECT AND AN AUTHORED LOAD-BEARING PARTITION, `op=strengthbarof`'s `target=` ARM IS WITHDRAWN FOR A `project=` ARM, AND THE STAMPED `required_strength` BLOCK STOPS COMPOSING ACROSS CITERS · PROPOSED 2026-08-10 (CASE-2, enacting DEC-72) — the version bump and the RESOLUTION are CONDUCT's

**RENUMBERED FROM IC-64 TO IC-65 AT INTEGRATION, 2026-08-10 by CONDUCT — the established collision protocol: the LATER allocation moves.** CASE-2 and CASE-3 ran in parallel and both minted `IC-64`, because `mintid` derives its floor from ids MENTIONED IN PROSE and **neither branch could see the other's file**: each read a corpus whose highest IC was 63 and each was right about the corpus it could read. CASE-3's IC-64 merged first and is already RESOLVED, so this one moves — the same reasoning DEC-50 was renumbered under, that the id other documents will already be citing is the one that stays. **Caught by `mintid --audit`'s duplicate arm in the battery, not by review**, which is the argument for that arm existing: two correct workers, one number, and nothing in either branch could have detected it. **A parallel wave should mint shared-namespace ids at SPAWN rather than in the worker** — recorded here because it is CONDUCT's lesson, not the workers'.

**RESOLUTION: ACCEPTED 2026-08-10 by CONDUCT at integration.** Measured impact ZERO and asserted rather than surveyed: `op=publish` has no UI consumer BY ASSERTION (DEC-33 defers the ceremony and `publication-entry.test.mjs` pins that it is never reached on the wire), `op=strengthbarof` has none at all, and `required_strength`'s one consumer reads four fields none of which move. One stale mock fixture is named for CASE-6.

- **Interface:** **I3** (the op contracts). I5 is NOT filed against: this item adds no table and
  no column — CASE-1 built `cases`, `published_case_members.role` and `.version_sha` under IC-63,
  and CASE-2 is the item that first WRITES two of them.
- **Proposer:** RECORD, session `case2-publication-production` (worktree `agent-a819c7ac95b78cff1`),
  2026-08-10, enacting `docs/development/CASE-AS-PRODUCTION.md`'s CASE-2 bullet under **DEC-72**.
- **Owner to land it:** `RECORD` (owns I3).
- **Consumers to answer:** `UI` — and see MEASURED IMPACT: it is ZERO on every moving field.
- **Status:** PROPOSED. **THIS ONE IS NOT ADDITIVE AND IS NOT PRETENDING TO BE.** A required
  argument appears on a mutating op, an argument arm of a read op is WITHDRAWN, and a value the
  stamped bar could previously carry (`source: "group"`) can no longer occur. Filed BEFORE any code
  was written, because a contract that NARROWS is exactly the case the protocol exists for.

### Why this is a contract change and not a defect fix

Bob ruled DEC-72 on 2026-08-10: **a case is a production of a project**, and *"the bar — that is,
the standard of evidence — is a property of a project, not an inquiry or claim."* Three consequences
land on I3 at once, and the design doc's supersession table names each of them as REMOVED rather
than deprecated:

| what DEC-72 removes | where it is reachable today |
| --- | --- |
| the project-less publication path (`publishCase` with no project) | `op=publish` accepts `targets` and no project |
| **the group default AS A PUBLICATION BAR** (its surviving role is SEEDING new projects — DEC-17's other half STANDS) | `#requiredStrengthFor`'s group fallback, stamped as `source: "group"` |
| DEC-17's strictest-across-citers composition | `#requiredStrengthFor`, reachable as `op=strengthbarof&target=` |

### The change

**1. `op=publish` gains two REQUIRED arguments and nine refusals.**

    project   the PUBLISHING PROJECT's bundle id.  REQUIRED.
    roles     { "<finding id>": "load_bearing" | "supporting" } — one entry per member. REQUIRED.

Both arrive in the BODY (`roles` is a map, which a query string cannot express honestly — REC-14's
own reasoning); `project` is additionally accepted on the search params as the one-line form a probe
can reach, exactly as `targets=a,b` already is. Refusals, each naming what is missing:

    NO_PUBLISHING_PROJECT        publishing is a production of a PROJECT (DEC-72 clause 2)
    NO_SUCH_PROJECT              the id answers to no bundle this viewer can see
    NOT_A_PROJECT                the id names something that is not a project
    NOT_THE_PROJECT_OWNER        only a project OWNER publishes (DEC-72 clause 5; "manager" IS the
                                 existing owner role — no third role is minted)
    NO_MEMBER_ROLE               a member carries no authored designation, NAMED
    BAD_MEMBER_ROLE              a designation outside the schema's two-term vocabulary, NAMED
    NO_LOAD_BEARING_MEMBER       zero load-bearing members (DEC-72's second ruled default)
    CASE_BELONGS_TO_ANOTHER_PROJECT   a later edition may not change whose production a case is
    BELOW_PROJECT_STRENGTH       a LOAD-BEARING member's derived strength is under the project's bar,
                                 naming the member, the axis, the bar, and what it reached

**The four authority refusals fire FIRST, beside `MACHINE_CANNOT_PUBLISH`, and that DEPARTS from
this method's own stated convention** — its comments say twice that a new refusal goes LAST *"so an
existing caller's diagnosis does not change under them."* That rule protects a caller who is still
making a LEGAL call while learning about a new authored field. A project-less caller is not making a
legal call any more; telling them to write a bias acknowledgement before telling them the act is not
theirs to perform is wasted work on a request that can never succeed. The reasoning is written at the
site rather than left here.

**2. `BELOW_PROJECT_STRENGTH` gates LOAD-BEARING members ONLY — and this is the one that is easy to
get backwards, so it is stated in the contract.** Bob's DEC-71 input, verbatim: *"that standard
doesn't require that every piece of evidence must meet that standard. Rather, it means that the
overall findings in that project must meet the standard — even if some evidence cited is below the
necessary grade."* A supporting member below the bar is **ACCEPTED and MARKED**, never refused. That
pair — one refusal and one acceptance over the same grade — is the whole shape of this item.

**3. `op=strengthbarof`: the `target=` arm is WITHDRAWN; a `project=` arm replaces it; `group=` is
UNCHANGED.**

    op=strengthbarof&target=<finding>    -> REFUSED, reason BAR_IS_A_PROJECT_PROPERTY
    op=strengthbarof&project=<project>   -> { ok:true, project, bar }        (NEW)
    op=strengthbarof&group=<group>       -> { ok:true, group, bar }          (UNCHANGED — DEC-17's
                                            group default still SEEDS new projects)

A refusal rather than a silently different answer: under DEC-72 no bar attaches to a finding at all,
so any value returned for a `target` would be a fact the record does not hold. The refusal detail
names DEC-72 and points at the `project=` arm — informed at the act, once (DEC-69).

**REC-30's leak on this op DISSOLVES rather than being re-gated.** Its residual was stated honestly
when it was written: *"`source: "project"` on a target only invisible projects cite still says that
SOME project declares a bar on it."* With no cross-citer walk there is no `projects[]`, no
interpolated ids and no residual. The `#bundleRedactor` filtering on this path is REMOVED because
what it filtered no longer exists — not because the exposure was judged acceptable.

**4. The stamped `required_strength` block: one value withdrawn, one field added.**

    source: "group"      NO LONGER OCCURS — the group default is not a publication bar (DEC-72)
    source: "project"    now means THE PUBLISHING PROJECT, alone, read at act time
    projects: [...]      REMOVED — nothing composes across citers
    project: "<id>"      ADDED — which project's bar this case was held to
    declared / capture / connection / detail   UNCHANGED in name, type and meaning

The block is now computed ONCE per case rather than once per member, which is the design's own
correction: the bar is the CASE's property (clause 2), and reading it per member was an artifact of
the model in which a bar attached to a finding.

**5. Two new frontmatter keys in a published finding's signed bytes**, written by `op=publish` and
required on `published` by C-2.8:

    case_project: <project id>              whose production this case is
    case_roles:                             the AUTHORED partition, covering exactly the roster
      - target: <finding id>
        role: load_bearing | supporting

**Why the WHOLE partition is in EVERY member's bytes** — it restates the roster, so it is argued
rather than assumed. REC-44 already writes `case_findings` into every member for the stated reason
that *"a stranger holding one of them must be able to read which case it was published in … and what
else the case rests on — without contacting this instance."* A stranger holding a SUPPORTING finding
must equally be able to see that it was not presented as load-bearing, and that the case had a
load-bearing member at all — neither is answerable from a per-member `role` scalar. The restatement
is not TRUSTED: the ratify committer refuses `CASE_ROLES_DIVERGED` when the partition does not cover
the roster, or when two members signed different partitions — exactly the treatment `case_findings`
and `bias_acknowledgement` already get. DEC-32's discipline names it a PARTITION someone asserts, so
BOTH halves are named; a `case_load_bearing` subset with `supporting` derived by complement was
considered and rejected on that ground.

**6. `cases` and `published_case_members.role` are WRITTEN, by the RATIFY committer, out of the
SIGNED bytes and nothing else.** `op=publish` writes neither row. This follows `published_cases`' own
doctrine at the same site, and it keeps CASE-1's purge exemption honest: CASE-1 exempted `cases` from
`purge` with the stated reversal condition *"if a later item lets a case exist as a DRAFT before
publication, revisit."* Writing at ratify creates no such draft state, so the condition is not
triggered and `purge` is untouched.

### MEASURED consumer impact — ZERO, each half measured separately

- **`op=publish` has NO UI consumer, by design AND by assertion.** DEC-33 defers the publication
  ceremony; `civicos-ui/test/publication-entry.test.mjs` asserts ON THE WIRE that `op=publish` is
  never reached from the surface — *"op=publish was never reached while rendering the page"* and
  *"op=publish is still unreached after driving the act"*. So the two required arguments reach no
  caller that exists. **The only callers are plane suites, which this item corrects.**
- **`op=strengthbarof` has NO UI consumer.** `grep` over `civicos-ui/**`: zero hits. Its callers are
  five plane suites (`publish`, `d280-strengthbar`, `gate-reads`, `d216-sharing.probe`,
  `machine-fences`), and `machine-fences`' call is the `group=` arm, which does not move.
- **`required_strength` DOES have a UI consumer, and it reads FOUR FIELDS, none of which move.**
  `civicos-ui/app.html`'s `pubBarHtml` reads `declared`, `capture`, `connection`, `detail`; the
  per-member row on the case page reads the same three. **`source` is read by NOTHING in the UI**,
  and neither are `projects`, `declared_by` or `declared_at`. Measured by grep over the whole file,
  not inferred from one function.
- **One MOCK FIXTURE will look stale, and is named so it is not mistaken for a consumer:**
  `civicos-ui/test/publishedcase.test.mjs`'s `BAR_DECLARED` carries `source:"group"`, `declared_by`
  and `declared_at`. It is a fixture the suite CONSTRUCTS, not a field the surface READS, and
  nothing asserts on `source`. **CASE-6 is where that fixture should be re-shaped**; it is recorded
  here rather than reached into from this area.
- **`case_findings` / `case_scope` / the new `case_roles` / `case_project`**: the UI reads none of
  them. They are frontmatter of a signed bundle; the surface reads the plane's `op=publishedcase`
  projection.

### The alternative considered and rejected

**Keep `#requiredStrengthFor` alive for `op=strengthbarof` and use the project bar only inside
`publishCase`.** That would have made this purely additive with no withdrawn arm. Rejected: it leaves
the superseded composition running behind a read op, so the record answers one bar to a reader and
holds a case to another — the two-authorities-for-one-fact shape this repository keeps paying for —
and the supersession table names the FUNCTION as removed rather than as bypassed.

### MIGRATION

**For the UI: nothing.** Every field it reads keeps its name, type and meaning.

**For any caller of `op=publish`:** add `project` and `roles`. There is no compatibility window and
none is offered, because the old shape is the shape DEC-72 deletes — a publication with no project
is not a thing this record can honestly hold, and accepting one for a transition period would mean
minting cases whose standard of evidence nobody declared.

**For any caller of `op=strengthbarof&target=`:** ask the publishing project instead. The refusal
says so by name.

## IC-67 · I3: `RUN_STATUS` GAINS ONE TERM — `never-started` — AND THE STATUS KEYING MOVES OUT OF `#aiRunTerminate` INTO ONE DECLARED FUNCTION, so a launch the deployment gate REFUSED stops being recorded as a run that FINISHED · PROPOSED 2026-09-10 (FL-8, enacting QUEUE FL-8, the residue IC-62 named) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-09-10 by CONDUCT at integration.** Accepted on a measured basis, and the row's own restraint is why: unlike IC-62, **the UI genuinely READS this vocabulary**, so "zero UI edits" here is a measured result rather than a structural impossibility — three UI tests derive from `Object.keys`, `check-refusal-codes.mjs` arm E excludes it BY SHAPE, and the one CSS selector pins `running`, which does not move. **The row states the harder half plainly: this is ADDITIVE IN THE VOCABULARY BUT A MOVE IN THE DATA**, and it says why there is no backfill instead of leaving the reader to notice. Pre-existing `ai_runs` rows keep `status='finished'`; that disposition lives in the row's MIGRATION section rather than a DEBT row, which is the right place for a fact about one interface change.

- **Interface:** I3 (the plane's published run vocabulary. `RUN_STATUS` reaches members through
  `op=airun`'s and `op=airuns`' `session.status`, through `op=airunlog`'s `status`, and through
  `op=airunclose`'s own return — and it reaches a member's EYES verbatim, because
  `civicos-ui/app.html`'s indicator prints the record's status word and carries it into
  `data-status`)
- **Proposer:** FLEET, session `fl8-run-status`, 2026-09-10, from QUEUE FL-8
- **Owner to land it:** FLEET (the declaration is `bio-plane/src/airun.mjs`; the writer is
  `bio-plane/src/store.mjs` `#aiRunTerminate`)
- **The id is PRE-ALLOCATED BY CONDUCT, not minted in this worker.** On 2026-08-10 two parallel
  workers each minted `IC-64` because `mintid` derives its floor from ids MENTIONED IN PROSE and
  neither branch could see the other's file. `IC-67` was handed to this item at spawn.

### 1 · PROPOSED

### WHAT CHANGES, precisely

`bio-plane/src/airun.mjs`'s `RUN_STATUS` goes from three terms to four:

    running        the run is under way
    finished       it ran, and it ended without a bound stopping it
    stopped        it ran, and a bound stopped it
  + never-started  the launch was refused before the first step ran

and the keying that CHOOSES between them moves out of `store.mjs` into one exported function
beside the vocabulary:

    export const RUN_NEVER_STARTED = { "mode-not-deployed": 1 };
    export function runStatusFor(bound) { ... }

`#aiRunTerminate` calls it in the two places it previously wrote
`stoppedByBound ? "stopped" : "finished"` inline (the `UPDATE` and the returned object).
**No status is renamed, none is removed, and `running`, `finished` and `stopped` keep exactly the
meanings their producers already gave them.**

### THIS IS NOT PURELY ADDITIVE AND SAYING SO IS THE POINT

IC-62 was additive in both senses: a term was added and no run's recorded ending moved. **This one
is additive in the VOCABULARY and a MOVE in the DATA.** One class of run — a launch the deployment
gate refused, closed on `mode-not-deployed` — stops reading `finished` and starts reading
`never-started`. A consumer that treats `finished` as "every run that ended without a bound" will
see one fewer row under that word.

Measured in-tree: **no such consumer exists.** Nothing in `bio-plane/src`, `agent-worker/src` or
`civicos-ui` compares a run's status to `finished` at all; the UI carries whatever arrived into an
attribute and prints it. The one hand-written `finished` expectation in the battery
(`airun.test.mjs` ARM C4) is about a MEMBER CANCELLATION and is deliberately left standing — see
the over-strictness section below. It is stated as a MOVE anyway, because "nobody in this tree
reads it" is not "nobody reads it": a group runs its own instance, and `op=airun` is published.

### WHY — AND WHY IT IS AN ERROR RATHER THAN A PREFERENCE

`#aiRunTerminate` keys the status on whether the ending is a BOUND. A gate refusal reaches no
bound, so it falls through to `finished`. **A launch the gate refused did not finish; it never
started.** The record's own field for "what became of this run" says it ran to its end, about a run
that never took a step, spent nothing, and was refused before any bound was consulted.

This is the same misdescription FL-7 closed one vocabulary over, and it is the same class: **a
record claiming more than it can support, in a terminal fact.** `RUN_ENDINGS`' own header carries
the deciding sentence — *"'the member asked for it to stop' and 'the budget ran out' are different
facts, and collapsing them would put this item on the wrong side of its own doctrine two lines
after stating it."* "It never started" is a THIRD such fact at the status level, and the same
sentence decides it.

### THE MEASUREMENT §14b.6 REQUIRES, RUN BEFORE ANYTHING WAS MINTED

§14b.6's standing rule, quoted in `harness.mjs`'s own header, is *"the record already has the word
and lacks the writer — build that producer rather than minting a new kind"*, and FL-7 established
that **it is conditional on the word EXISTING**. So the question was asked first, of `RUN_STATUS`'s
three terms, and the answer is measured rather than asserted:

- **`running`** — false of a terminated run. Not a candidate.
- **`finished`** — the defect itself. Its only producer is a run that reached its own end.
- **`stopped`** — the only real candidate, and it FAILS on measurement. Its sole producer in the
  whole plane is `stoppedByBound`, and every sentence the record renders beside it says a bound was
  reached: `#aiRunTerminate` writes *"the run stopped because the '<bound>' bound was reached"*,
  `aiRunRead` renders `RUN_BOUNDS[stopped_bound]` next to it, and `NOT_OUR_BOUNDS.lease` says *"a
  run that stopped heartbeating DIED rather than finished"*. Putting a never-started run under
  `stopped` would hand a consumer a status whose entire established meaning is bound-exhaustion,
  about a run that consulted no bound — which is the collapse this file refused one vocabulary over.

**And the deeper half of the measurement: all three existing terms PRESUPPOSE THE RUN STARTED.**
`running` is under way; `finished` and `stopped` are two ways of having run. There is no term in
`RUN_STATUS` for a launch that was refused, and there was none anywhere else either — a sweep of
`airun.mjs`, `queuestate.mjs` (`QUEUE_CONDITION_KINDS`, `QUEUE_OBLIGATION_KINDS`) and the wider tree
for `never-started` / `not-started` / an unstarted-run word returned NOTHING for a run's lifecycle.
So §14b.6's condition fails here exactly as it failed for FL-7, and for the same reason: applied
honestly, the precedent points at minting.

**`node tools/decided.mjs` finds no ruling on the subject** ("run status finished stopped", "a run
that never started" — both return the floor's no-ruling answer; "RUN_STATUS" returns two UI items
about the indicator's animation and nothing about the vocabulary's members). **The class ruling is
FL-7's own** — a run's recorded terminal facts must name what actually happened — which is why this
was enqueued as an ITEM and not routed to Bob as a decision.

### WHY THE SPELLING IS `never-started`

It says what happened rather than who did it. `refused` was the obvious alternative and was rejected
on two measurements: the plane already uses `refused` as a state word in two unrelated families
(`capture_requests.state`, `subresources` `LINK_TYPES`), and — the stronger reason — it names the
MACHINE'S ACT, so a second way for a run never to start would not fit under it. `never-started`
names the RUN's condition, which is what a status is. The hyphenated multiword form matches the
plane's own habit (`mode-not-deployed`, `runtime-ceiling-reached`, `context-has-no-project`) and
reads as English to a member, which matters here because the UI prints this word verbatim.

### WHY THE KEYING MOVES, AND IT IS HALF THE ITEM

The status rule lived as an inline ternary written TWICE inside `#aiRunTerminate` (once for the
`UPDATE`, once for the returned object) and a THIRD time as a hand-written copy in
`agent-worker/test/harness.test.mjs`'s plane mock. **That third copy is measurably WRONG TODAY:** it
reads `bound === "completed" || bound === "cancelled" ? "finished" : "stopped"`, so it has been
answering `stopped` for `mode-not-deployed` since FL-7 landed the ending, while the real plane
answered `finished`. Nothing caught it, because nothing compared the two. That is this repository's
parallel-path class, and it is why the rule becomes ONE exported function that the plane calls and
the mock is BUILT FROM rather than agreeing with by hand.

### MEASURED CONSUMER IMPACT, and it is measured rather than asserted

`grep -arn RUN_STATUS` across every tree, `node_modules` and built artifacts excluded — 6 files,
classified by HOW each reads it rather than by which area owns it:

- **`bio-plane/src/airun.mjs`** — the declaration. This item's own site.
- **DERIVED, absorbs the new term with NO EDIT (3 files, all `civicos-ui`).**
  `civicos-ui/test/ai-session-wire.test.mjs:862` builds its vocabulary walk with
  `...Object.keys(RUN_STATUS)`. `civicos-ui/test/ai-session-context.test.mjs:463` takes
  `Object.keys(RUN_STATUS)` for ARM P: its REACH floor is `>= 3` (four passes), P1 counts CSS
  selectors and not statuses, P2 asks whether the selector's word is IN the vocabulary (it is —
  `running`, unmoved), and P5's polarity fixture reads `statuses[0]`, which is `running` and stays
  `running` because the term is APPENDED. `civicos-ui/test/connections-sidebar.test.mjs:111` names
  it only in a comment describing the pattern.
- **`civicos-ui/check-refusal-codes.mjs`: ZERO, AND STRUCTURALLY SO — its own header says why.**
  Arm E harvests member-facing vocabularies BY SHAPE (*"an exported plain object whose values are
  ALL strings"*) and records `RUN_STATUS = { running: 1, … }` as *"excluded by that shape rather
  than by an exception"*. The added term keeps that shape (`"never-started": 1`), and so does the
  new `RUN_NEVER_STARTED` set, so the guard's surface is exactly where it was. **This is a
  DIFFERENCE from IC-62 worth stating rather than inheriting: the UI's zero impact there was
  structural in the strong sense (ARM V1 asserts the UI holds NO COPY of `RUN_ENDINGS`), while here
  the UI genuinely READS `RUN_STATUS` and the zero is by DERIVATION.** Derived is enough, and it is
  a weaker claim than FL-7's, so it is written as the weaker claim.
- **`civicos-ui/app.html`: ONE CSS SELECTOR, and it does not move.**
  `.ai-run .dot[data-status="running"]` is the single place this application writes a status word,
  and `running` is untouched. The failure direction was already declared safe by UI-49: *"an
  unrecognised status renders a still dot, never a false pulse"* — so a `never-started` run renders
  a STILL dot and the word beside it, which is the right answer with no UI edit at all. **No
  `civicos-ui` edit is owed by this IC**; it is a two-area change (plane + the fleet member's suite)
  and not three.
- **HAND-WRITTEN STATUS EXPECTATIONS IN THE BATTERY — four, and NOT ONE OF THEM MOVES.** Each was
  read before this was written rather than after it failed: `airun.test.mjs` ARM C4 (`finished`, a
  member cancellation — see below), ARM K6 (`stopped`, a lease lapse), `scheduler.test.mjs:568`
  (`stopped`, a lease lapse), `harness.test.mjs:756` (`stopped`, the runtime ceiling). Every one
  names a bound-stop or the member's ending, and `runStatusFor` answers all four exactly as the
  ternary did.
- **THE ONE HAND COPY THAT IS CORRECTED: `agent-worker/test/harness.test.mjs`'s plane mock**, whose
  `airunclose` branch reproduced the plane's keying by hand and has disagreed with it since FL-7.
  It is BUILT from `runStatusFor` over the plane's live vocabularies and interpolated into the mock
  worker source, so it cannot drift again. Corrected, never exempted.
- **NO EXHAUSTIVE PIN EXISTED ON `RUN_STATUS` AT ALL, and that is a finding rather than a
  convenience.** `RUN_ENDINGS` has one (`airun.test.mjs` ARM V6, the guard that made FL-7 supply a
  reason) and `RUN_BOUNDS` has one (ARM V5). The status vocabulary had none, so a fourth term could
  have been added with no reason and nothing would have asked. This item adds ARM V9 in that
  family — asserted as a SET, so a FIFTH cannot slip in unnoticed either.
- **NO SCHEMA CHANGE.** `ai_runs.status` is `TEXT NOT NULL DEFAULT 'running'` with no CHECK
  constraint and no enum. No table, no column, no migration, and `hygiene.test.mjs`'s
  `host_governor` rule is not in play.
- **NO NEW OP AND NO NEW REFUSAL.** The status is DERIVED from a bound `checkBound` (C-22.5) has
  already admitted, so there is nothing new for the check catalogue to refuse and no C-number moves.
- **`bio-plane/src/skillpack.mjs`: NOT A CONSUMER, measured.** The pack publishes `bounds:
  RUN_BOUNDS` and `endings: RUN_ENDINGS` by import and has never published `RUN_STATUS`, so
  `op=affordances`' pack body is byte-identical across this change.
- **Built artifacts are not consumers.** `release/bio-plane.bundled.mjs` and
  `newgroup/dist/newgroup.bundled.mjs` are compiled copies DIST regenerates.

### THE OVER-STRICTNESS HALF, DECIDED IN THE ITEM AND NOT INHERITED

**A member-cancelled run keeps reading `finished`, and that is a decision rather than an oversight.**
`cancelled` is an ending, so it falls on the same side of the keying as `completed`, and one could
argue a run a member stopped did not "finish" either. **It is deliberately out of scope and left
exactly as it is:** the member's ending is not a misdescription of the same kind — that run RAN,
which is precisely what `finished` and `stopped` both presuppose and what `never-started` denies.
Moving it would be a second value-move in the same commit, decided on a weaker argument, in a class
the queue row explicitly protects with its second negative control. `airun.test.mjs` ARM C4 states
it and stays green; ARM H3 pins the whole partition — a completed run `finished`, a member
cancellation `finished`, a bound-stop `stopped` — so a later tidy-up cannot sweep them together.

### MIGRATION

**None, and no backfill — stated rather than left to be discovered.** A run closed on
`mode-not-deployed` before this change keeps `status = 'finished'` in the row it was written into.
Rewriting a terminal fact recorded at termination time to match a later vocabulary is the opposite
of what this record does everywhere else, and the pair a reader actually has — `status` beside
`stopped_bound`, which still names `mode-not-deployed` — stays unambiguous for those rows. The
affected population is bounded and small (only launches refused by the mode gate, only since FL-7
landed the ending), and `ai_runs` is declared SCRATCH-class with an expiry rather than RECORD, so a
stale status there is not a claim the record is making about the world. **Not opened as a DEBT row,
because the alternative — an `UPDATE ai_runs SET status = …` migration rewriting recorded terminal
facts — is worse than the thing it would fix, and that is a disposition rather than a deferral.**

A consumer that switches on the status gains a case it did not have. A consumer that prints the
status — which is every in-tree reader — prints the new word with no edit.

### 2 · RESPONSES

_(awaiting: RECORD owns `airun.mjs`'s declaration and `store.mjs`'s writer; UI is measured
NOT-AFFECTED above with the evidence — three derived readers, one CSS selector that does not move —
and CONDUCT may answer for a dormant area in writing per the protocol.)_

### 3 · RESOLUTION

_(CONDUCT's.)_
## IC-66 · I3 + I5: THE ARTIFACT FLIP — A CASE MEMBER IS RESOLVED BY ITS PINNED VERSION AND NO LONGER BY THE CASE'S EDITION NUMBER; a finding's `edition` becomes ITS OWN and the case's moves to `case_edition`; the CASE CONTAINER goes to `bio-case-container/4` carrying `version_sha`, `role`, the member's own edition, the producing project and the case's BAR · PROPOSED 2026-09-10 (CASE-5, enacting DEC-72) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-09-10 by CONDUCT at integration.** Accepted, and **its measured impact is NOT zero, which is why this row is more useful than the two before it.** One file, one function, three lines — and the failure it names is SILENT: a diverged member reads as awaiting ratification forever, with a blank pair and a blank bar, and appears a second time in the not-in-any-case list. **A consumer that breaks loudly is a consumer somebody fixes; this one would have been read as an empty record.** Enqueued as **UI-56** rather than left as a delegation in `CLAIMS.md`, because a notice is not an item. The row also carries the remaining half of CASE-5's bullet into **CASE-5b**: finding bytes still name a case, and they cannot stop until a case-level signing ceremony exists for those facts to move to.

- **Interface:** **I3** (the op contracts: `op=publish`, `op=ratify`, `op=publishedcase`,
  `op=publishedmanifest`, `op=publishededitions`, `op=publishedlist`) **and I5** (one additive
  column, `published_cases.bar`).
- **Proposer:** RECORD, session `case5-artifact-flip` (worktree `agent-a279f7840e26862b0`),
  2026-09-10, enacting `docs/development/CASE-AS-PRODUCTION.md`'s CASE-5 bullet under **DEC-72**.
- **Owner to land it:** `RECORD` (owns I3 and I5).
- **Consumers to answer:** `UI` — and **MEASURED IMPACT IS NOT ZERO HERE**, unlike IC-63/64/65.
  See the measurement below; a DELEGATION is filed in `CLAIMS.md`.
- **Status:** PROPOSED. **Additive on the wire, NOT additive in MEANING** — no key is removed and
  no key changes type, but `findings[].edition` and `caseMembers[].edition` stop being guaranteed
  equal to the case's edition, and a consumer that JOINED ON THAT EQUALITY silently loses rows.
  Filed BEFORE any code was written, because a silent-join-break is exactly the case the protocol
  exists for.

### Why this is a contract change and not a defect fix

The design doc names it as the largest mechanical piece of DEC-72: *"The signed-artifact direction
FLIPS. Today each published finding's bytes name its case (one-case-per-finding baked into the
format). Now the CASE artifact freezes its members — content by hash, version, per-member strength
pair, role, the bar, the exclusions — and a finding's bytes stop naming any case."*

`schema.mjs`'s own `version_sha` comment, written by CASE-1 before this item existed, names the
defect this closes in terms: *"It also names the conflation the artifact flip removes: today
`#caseEditionState` reads `published_bundles` at the CASE'S edition number, which is only correct
while one case owns one finding."* CASE-3 landed the pin and handed the predicate on: *"resolving a
member BY THE PIN instead of by the CASE'S edition number is NOT done."*

### The change

**1. A FINDING'S `edition` IS NOW ITS OWN, AND THE CASE'S EDITION IS `case_edition`.**

`op=publish` stamps into each member's frontmatter:

    edition:       the MEMBER'S own next edition, off its own published chain   (WAS: the case's)
    case_edition:  the CASE's next edition                                       (NEW)

`op=ratify` reads both out of the RATIFIED BYTES and out of nothing else, exactly as it already
reads `case_id`, `case_scope`, `case_project`, `case_roles` and the bias acknowledgement. The
member's edition keys `published_bundles` (and its `EDITION_EXISTS` / `EDITION_NOT_INCREMENTED`
refusals, which are now genuinely per-finding); the case's edition keys `published_cases` and
`published_case_members`.

**WHY BOTH NUMBERS ARE NEEDED AND ONE WILL NOT DO.** They were never the same fact. An edition of a
CASE is a separate document a reader was handed (DEC-12 as DEC-44 rehomes it); an edition of a
FINDING is a version on that finding's own chain. While every member re-published at every case
edition the two agreed by accident, and that accident is what baked one-case-per-finding into the
format: a finding already published at edition 1 could not join a second case, because the second
case's edition 1 would demand bytes at a number that finding had already spent. New refusal:

    CASE_NAMES_NO_EDITION   a member's signed bytes name a case and no case edition

**2. A MEMBER IS RESOLVED BY ITS PIN.** `#caseEditionState` resolved each member with
`SELECT … FROM published_bundles WHERE bundle_id=? AND edition=?` at the CASE's edition. It now
resolves on `version_sha` — the hash the member SIGNED, written by CASE-3 — and falls back to the
old predicate ONLY for a roster row whose pin is NULL, which is every row written before CASE-3.
Same treatment in `#caseOf`, which decides which case a published finding belongs to.

Consequence on the wire: `op=publishedcase`'s `findings[]` entries gain

    edition       the MEMBER'S OWN edition        (NEW — previously the case's, and implicit)
    role          'load_bearing' | 'supporting'   (NEW on this surface; IC-63 put it in the schema)

**3. THE CASE'S BAR IS FROZEN CASE-SIDE.** New column `published_cases.bar TEXT`, committed at
ratification FROM THE SIGNED BYTES under the same `CASE_ASSERTION_DIVERGED` refusal that already
holds scope, completeness and the bias acknowledgement. The bar was reachable only per member, off
`published_bundles.required` — and because it is read from the publishing project AT ACT TIME while
members ratify at different times, a project whose bar moved between two ratifications gave one case
two standards with nothing noticing. It is a case property (DEC-72 clause 2) and it is now stored,
served and refused as one. `op=publishedcase` and `op=publishedmanifest`'s `cases[]` gain `bar`;
`op=publishedcase` gains `project`.

**4. THE CONTAINER GOES TO `bio-case-container/4`.** The version moves for REC-47's stated reason —
a stranger holding a `/3` zip that lacks a pin and a `/4` zip whose pin was withheld must not be
indistinguishable. What `/4` adds, and every one of them is the design's own list of what the CASE
artifact freezes:

    project                  whose production the case is (DEC-72 clause 2)
    bar                      the standard of evidence, as the CASE's property
    findings[].version_sha   the pin — the version the case COMMITTED TO
    findings[].role          the AUTHORED designation (clause 4)
    findings[].edition       the MEMBER'S OWN edition  (WAS: `cs.edition`, the case's — a
                             statement that was wrong in the artifact and is corrected here)

`exclusions` are NOT added: they are already frozen case-side inside `completeness.excluded`, and a
second copy would be a second authority for one fact.

### MEASURED CONSUMER IMPACT — NOT ZERO, and the measurement names the sites

Measured 2026-09-10 by grep over `civicos-ui/`, `newgroup/`, `docprofile/`, `pdf-worker/`,
`tools/`, `agent-worker/` and `release/`, built copies excluded.

**`civicos-ui/app.html`, ONE function (`pubIndex`), THREE join sites, all the same defect:** the
public index joins a roster row to its ratified row on `bundle_id + "@" + <the CASE's edition>`.

    ~15673  inCase   = new Set(members.map((m) => m.bundle_id + "@" + m.edition))
    ~15680  waiting  = roster.filter((m) => !byId.has(m.bundle_id + "@" + cs.edition))
    ~15701  row      = byId.get(m.bundle_id + "@" + cs.edition)

For a member whose own edition differs from its case's, all three miss: the member reads as
**AWAITING RATIFICATION FOREVER**, its pair and bar render blank, and its ratified row also appears
a second time in the not-in-any-case list below. **The fix is one line each and the data is already
on the wire** — IC-63 published `caseMembers[].version_sha` and `published[].bundle_sha`, so the
join becomes pin-to-sha. A DELEGATION → UI carrying exactly this is filed in `CLAIMS.md`.

Everywhere else measured ZERO: `op=publishedcase`'s `c.edition` reads are the CASE's edition and are
unmoved; `serves[].edition` already named a target finding's own edition; `newgroup/` and
`bio-plane/dist/` carry BUILT COPIES DIST regenerates; `docprofile/`, `pdf-worker/`, `tools/`,
`agent-worker/` and `release/` read none of the moving fields.

### WHAT THIS ITEM DOES **NOT** DO, STATED IN THE CONTRACT RATHER THAN DISCOVERED BY THE NEXT READER

**A finding's bytes still carry `case_id`, `case_findings`, `case_roles`, `case_scope`,
`bias_acknowledgement` and `required_strength`.** The CASE-5 bullet says finding bytes stop naming a
case, and this item removes the deepest half of that — the `edition` conflation, which is the half
that actually baked one-case-per-finding into the FORMAT — and stops there deliberately.

The reason is doctrinal and is measured, not judged. Every case fact this plane commits is committed
FROM THE SIGNED BYTES AND FROM NOTHING ELSE (`#publishEdges`' doctrine, restated at seven sites in
`publish()`), because *"a case identity, a scope statement or a roster that is not inside the hash
the member signed is one this plane would be asserting on their behalf."* There is today **no
signature over a case** — the container manifest says so in its own words: *"The signature is per
finding because the FINDING is the unit of truth … a case-level signature would be a signature over
something nobody reviewed."* So removing the case facts from member bytes without first minting a
case-level signing ceremony would leave the plane committing a group's case assertions from an
UNSIGNED REQUEST, which is the attribution class this record refuses everywhere else. That ceremony
is a second publication ceremony — a case document, its gate, its checks, its ratify path — and it
is larger than the rest of CASE-5 combined. **Raised to CONDUCT as the remaining half rather than
half-built here.**

---

## IC-68 · I4 + I6: EVERY FLEET MEMBER GAINS A COMMITTED, HASHED, GUARDED BUNDLE — `dist/<member>.bundled.mjs` BESIDE `dist/<member>.bundle.json`, each ONE asset with ONE sha256, so an installer that cannot bundle has something to fetch and verify · PROPOSED 2026-09-10 (FL-9, enacting BOB's 2026-09-10 answer to DIST's DELEGATION) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-09-10 by CONDUCT at integration.** Accepted, and the row earns it by opening every reader BY NAME rather than grepping and concluding: five programs and four suites read `fleet-member.json`, **none enumerates keys**, so `bundle` is additive IN FACT and not merely in intent. The `main` move is named as the ONE behavioural change with its reason — **two recipes for one artifact is the defect being closed** — rather than being folded in as incidental. **The row also carries NEW KNOWLEDGE I6 should absorb at 1.0.0: three of `pdf-worker`'s six build inputs live in `bio-plane/src/`, so a PLANE change stales a FLEET member's artifact.** That cross-tree input surface was not a property anyone had written down, and it is the kind of fact an interface record exists to hold.

- **Interfaces:** **I4** (plane → installer, the release artifact), **1.0.0 STABLE**, owner `DIST`;
  and **I6** (plane → pdf-worker, the fleet service binding), **0.1.0 PROVISIONAL** with a live
  consumer, owner `CONTENT-PDF` for the code and `DIST` to release it.
- **Proposer:** FL-9 (session `fl9-fleet-bundle-guard`), 2026-09-10.
- **Id PRE-ALLOCATED BY CONDUCT at spawn**, not minted here — the IC-64 lesson enacted rather than
  remembered: on 2026-08-10 two parallel workers each minted `IC-64` because `mintid` derives its
  floor from ids MENTIONED IN PROSE and neither branch could see the other's file.
- **Owner to land the RELEASE half:** `DIST` (D-297). **This item lands the BUILD half only** and
  deliberately builds nothing against the release format.
- **Consumers to answer:** `DIST` (owner of I4 and of the release ceremony), `CONTENT-PDF`
  (owner of I6's code), `FLEET` (proposer and owner of both members).

### The change, in one sentence

Each fleet member now commits **one self-contained ES module** plus **one JSON manifest** stating
that module's `sha256`, its byte length, the exact build recipe and the sha256 of every input —
and a gate in the plane's battery asserts the committed module is **byte-identical to a fresh
build of its source**, so a stale artifact FAILS instead of shipping.

    agent-worker/dist/agent-worker.bundled.mjs      48,392 B   sha256 af14b9e7…
    agent-worker/dist/agent-worker.bundle.json      the manifest
    pdf-worker/dist/pdf-worker.bundled.mjs       2,427,807 B   sha256 642a9b78…
    pdf-worker/dist/pdf-worker.bundle.json          the manifest

### Why, and why it is not a reversal of FLEET's anti-drift ruling

`agent-worker/wrangler.jsonc` said *"The SOURCE deploys, not a bundle"*, because a committed bundle
is *"a second place its version lives and a committed artifact that can drift from its source
(D-106's class)"*. **That objection is answered rather than overruled.** The instrument is the one
this record always reaches for — a hash-verified copy of exact bytes, never a second codebase
(`newgroup/scripts/embed-release.mjs`, `bio-plane/scripts/embed-signpage.mjs`) — and the shape is
`check-versions`': equality, in both directions, refusing rather than preferring the newer side.
The ruling named its own reversal condition (*"FL-3 adds the build step in the turn it adds the
first dependency"*); BOB reversed it on 2026-09-10 under the standing delegation, as MECHANISM, and
the reversal is recorded at the site it was written.

**The forcing fact is DIST's, measured 2026-09-10:** `newgroup` is a Worker. It cannot run
`wrangler` and it cannot bundle. `agent-worker` is three modules, so a one-part script upload could
not resolve them — and a one-part upload is all an installer has.

### MEASURED CONSUMER IMPACT, taken before building rather than after

**(1) `fleet-member.json` gains one additive key, `bundle`. Every reader was opened and none breaks.**
Five programs and four suites read this file; the measurement is `grep`, not judgement:

| reader | what it reads | affected? |
| --- | --- | --- |
| `bio-plane/scripts/battery.mjs` | `name`, `testDir` | NO |
| `bio-plane/scripts/coverage.mjs` | `name`, `entry`, `surface`, `testDir` | NO |
| `tools/deploy-fleet.mjs` | EXISTENCE only (membership test) | NO |
| `agent-worker/test/agent-worker.test.mjs` | asserts the four keys **by name**, `[meta.name, meta.entry, meta.surface, meta.testDir]` — **not the key SET** | NO |
| `bio-plane/test/{battery,coverage}-provenance.test.mjs`, `owed-controls.test.mjs` | build fixtures of `{name}` only | NO |

No reader enumerates keys and no reader asserts an exact shape, so the key is additive in fact and
not merely in intent. **Measured, because an additive field that some reader validates strictly is
how an "additive" change breaks a consumer.**

**(2) `agent-worker`'s `wrangler.jsonc` `main` moves from `src/index.mjs` to the committed bundle.**
This is the only behavioural change to a deployed thing, and it is deliberate: if `wrangler` kept
bundling from source, the bytes Cloudflare runs and the bytes an installer uploads would be produced
by two different recipes, and **two sources of truth for one artifact is the defect this item
exists to close, not a side effect to tolerate.** `pdf-worker` has already pointed `main` at its
bundle since 2026-07-31, so this makes the two members the same shape rather than inventing one.
`tools/deploy-fleet.mjs` is UNCHANGED and still works — wrangler deploys a pre-bundled entry
happily — but **its header now argues from a reversed ruling and is STALE**; raised as a DELEGATION
to DIST rather than edited, because the file is DIST's.

**(3) A FLEET MEMBER'S BUNDLE DEPENDS ON PLANE SOURCE, AND THAT WAS NOT WRITTEN DOWN ANYWHERE.**
Measured from esbuild's own metafile: `pdf-worker/dist/pdf-worker.bundled.mjs` has **six** inputs,
and three of them are the PLANE's — `bio-plane/src/pdfstructure.mjs`, `bio-plane/src/subresources.mjs`,
`bio-plane/src/cpu.mjs` — reached through `pdf-worker/src/index.mjs`'s
`import { extractPdfStructure } from "../../bio-plane/src/pdfstructure.mjs"`. **So a change to the
PLANE stales a fleet member's artifact**, silently, from a directory whose author has no reason to
think about `pdf-worker`. The manifest therefore records inputs by REPOSITORY-relative path and
hashes the cross-tree ones exactly like the member's own. This is new knowledge about I6's real
dependency surface and it belongs in the registry when I6 goes to 1.0.0.

**(4) What I4 will need, stated so DIST can land it and NOT built against here.** `release/RELEASE.json`
carries one asset today (`asset`, `sha256`, `sig`, `signer`). The members are ready to be carried as
peers of it — each is ONE file with ONE hash — and nothing in this item writes to `release/**`,
`newgroup/**`, or `RELEASE.json`'s shape. **The MULTI-PART alternative (a signature over a SET)
stays REFUSED** (BOB, 2026-09-10) and this item reports that the refusal **cost nothing**: both
members bundle to one file, so one-asset-one-hash is available for each of them.

### What is NOT changing

- **No op, no check, no table, no schema.** I3 and I5 are untouched.
- **I6's request/response shape is untouched** — `{ capture_sha, store }` in, the I2 structure out.
- **`release/RELEASE.json` is untouched**, and no version is bumped, signed, tagged or deployed by
  this item; that is DIST's, and this repository is explicit about it.
- **No member gains a dependency.** `agent-worker` still imports nothing from npm; its build
  resolves `esbuild` from the plane's install, the same way `newgroup`'s embed step already expects
  "the sibling ../bio-plane tree with its devDependencies installed".

### The one thing a reviewer should check hardest, named rather than buried

**A guard that compares a build to an artifact can agree with itself for free**, and this one nearly
did. esbuild writes its input paths into the output as comments **relative to the process working
directory**, so the identical source built from `bio-plane/` and from `pdf-worker/` differs by 30
bytes — a FALSE STALE that would have made the gate cry wolf on the first run from an unexpected
cwd. The recipe therefore pins `absWorkingDir` to the member directory, the pin is RECORDED in the
committed manifest, and the gate asserts the pin as well as the bytes. Measured, at
`MEASUREMENTS.md` 2026-09-10.

### Status

**PROPOSED, 2026-09-10.** The build half is landed on `worktree-agent-abe10acbf93247266`; the
release half is DIST's and nothing is built against it. **The version bump and the RESOLUTION are
CONDUCT's**, per the standing arrangement for worker-raised ICs. `I6` should absorb finding (3) —
its real input surface crosses into `bio-plane/src/` — in the same turn it goes to 1.0.0.
## IC-69 · I3 + I5: `published` LEAVES THE INQUIRY STATE MACHINE — a finding's lifecycle ends at `concluded` and publication becomes THE CASE RELATION; `op=publish` stops moving state and refuses `NOT_CONCLUDED`; `REOPENABLE_FROM` loses `published`; `op=affordances` gains `case_member`; one new table (`case_revision_flags`) and one new op (`op=caseflags`) carry the set-but-never-clear revision flag · PROPOSED 2026-09-10 (CASE-4, enacting DEC-72) — the version bump and the RESOLUTION are CONDUCT's

**RESOLUTION: ACCEPTED 2026-09-10 by CONDUCT at integration.** A shape moved — a vocabulary term REMOVED, which is the direction that breaks readers — so the measured impact matters more here than on an additive row, and it is **not zero**: `civicos-ui/` held a **HAND COPY of the state machine this item changed**, and **its own harness caught it**. That is the drift defence working at the moment a vocabulary moved, and it is worth naming as the reason the copy was survivable at all. Every other tree measured zero. **The authored-rendering half stays DELEGATED and is not folded in** — the UI still labels a published case a "Finding", which is a wording question in UI-56's neighbourhood rather than a consequence of this shape change, and folding it in would have mixed a fence with a sentence.

- **Interface:** **I3** (the op contracts: `op=publish`, `op=reopen`, `op=affordances`,
  `op=ratify`, plus the new `op=caseflags`) **and I5** (one new table, `case_revision_flags`).
- **Proposer:** RECORD, session `case4-lifecycle-flag` (worktree `agent-a2cabbd5225deffd5`),
  2026-09-10, enacting `docs/development/CASE-AS-PRODUCTION.md`'s CASE-4 bullet under **DEC-72**.
  **IC-69 was PRE-ALLOCATED BY CONDUCT AT SPAWN** — the IC-64 lesson enacted rather than
  remembered, since `mintid` reads its floor from ids mentioned in prose and two parallel
  branches cannot see each other's files.
- **Owner to land it:** `RECORD` (owns I3 and I5).
- **Consumers to answer:** `UI` — and **MEASURED IMPACT IS NOT ZERO.** See the measurement
  below; a DELEGATION is filed in `CLAIMS.md`.
- **Status:** PROPOSED. **A VOCABULARY TERM IS REMOVED, which is the strongest form this
  protocol handles.** `published` stops being a value `current_state` can take on a newly
  published finding. Filed BEFORE any code was written.

### Why this is a contract change and not a defect fix

`CASE-AS-PRODUCTION.md`'s supersession table rules on it by name:

> **`published` as an inquiry lifecycle state** (State Rules per-type machine;
> `ILLEGAL_TRANSITION` publishing-only-from-concluded) | The precondition survives as *"only a
> CONCLUDED finding may be a case member"*; the state itself becomes the case relation.

and the design's own clause: *"A finding's lifecycle ends at `concluded`; publication is the case
relation. Reopening a finding is unchanged and never edits published bytes."*

### The change

**1. `STATES.inquiry` LOSES `published` FROM `legal` AND FROM `concluded`'s EDGE LIST.**

    legal:   [open, deferred, dismissed, surfaced, concluded, divided]        (published REMOVED)
    legacy:  [published]                                                      (NEW key)
    edges.concluded:  [open, surfaced, deferred, dismissed, divided]          (published REMOVED)
    edges.published:  [open, surfaced]                                        (KEPT — see below)

**`legacy` IS A NEW KEY ON THE TABLE AND IT IS NOT A HEDGE.** Ratified bytes are immutable and a
store that has published anything holds documents whose frontmatter says `current_state:
published` — bytes whose hash a stranger may already be verifying against. Rewriting them would
break every pin that names them and would be this record editing what it already signed. So the
word stays VALID and stops being REACHABLE: nothing in `edges` names it as a destination, which is
what "removed from the state machine" means for a machine that cannot rewrite its own history.
`checkStateLegality` reads `legal ∪ legacy`; **every other reader — the affordance derivation, the
transition guards, `edgesFrom` — sees only `legal`**, because they ask what the machine can DO.

**2. `op=publish` STOPS MOVING STATE, AND THE PRECONDITION BECOMES A NAMED REFUSAL.**

    WAS:  ILLEGAL_TRANSITION  (to: "published")   — derived from edges.concluded
    NOW:  NOT_CONCLUDED       (from: <the state>) — an explicit test on `concluded`

The old expression carried TWO facts on one array entry: that publishing moves the document to a
new state (deleted by DEC-72), and that publishing is reachable from `concluded` AND FROM NOWHERE
ELSE (untouched by DEC-72). Removing the entry removes both, so the second is now a line of its
own. `op=publish` no longer appends a `state_history` transition, no longer sets `prior_state`, and
no longer writes `current_state: published`; `UNSPLICEABLE_STATE_HISTORY` is unreachable from this
act. **`op=publish`'s answer loses `to: "published"`** and its `findings[]` rows lose `from`/`to`,
gaining `state` (the state the act did not move), `case_id` and `case_edition`.

**3. `REOPENABLE_FROM` LOSES `published`, AND `op=reopen`'s GATE BECOMES A DISJUNCTION.**

    WAS:  REOPENABLE_FROM.includes(current_state)
    NOW:  REOPENABLE_FROM.includes(current_state)  ||  <this finding is a case member>

A naive removal damages this in both directions at once: dropping `published` alone refuses
reopening to every published case (a member now sits at `concluded`, which the refusal names BY
NAME), and widening to `concluded` destroys REC-31's rule that a conclusion nobody published may
not revert to open still wearing its conclusion. The rule was never about the word — it was that
reopening is refused where something would be ERASED WITH NO RECORD and permitted where an
immutable signed edition means there is nothing to erase. `NOT_SET_DOWN`'s detail is reworded
accordingly; the refusal's `reopenable:` payload still carries `REOPENABLE_FROM`, because the case
relation is not a state and does not belong in a list of states.

**4. `op=reopen` CLEARS `case_edition` FROM THE WORKING DOCUMENT.** `case_id` STAYS (publish
re-derives the case identity from it and must never take an identity from a caller). Membership as
the bytes assert it is the PAIR, so clearing the edition claim is what ends it.

**5. FIVE GUARDS AND TWO AFFORDANCES RE-KEY ONTO THE CASE RELATION.** Names, details and remedies
are UNCHANGED; only the question is asked differently. `PUBLISHED_CANNOT_DIVIDE`,
`PUBLISHED_CANNOT_RESTRUCTURE`, `PUBLISHED_CANNOT_MOVE_VERSION` (CASE-3's, C-25.34), the
frozen/working split in `#restsOnLive`, and `op=ratify`'s `isCase` derivation. Left keyed on the
state word, every one of them would have become unreachable with the suite green.

**6. `op=affordances` GAINS ONE FACT: `case_member` (boolean).** It has to exist because a document
that is a member of a signed case now wears no word that says so, and two acts derived themselves
from that word. `publish` applies at `concluded && !case_member`; `inquiryground` at
`!case_member && current_state !== "divided"`.

**7. C-2.8's PUBLISHED ENTRY REQUIREMENTS RE-KEY ONTO THE CASE RELATION IN THE BYTES.** Not one
requirement moves. The condition was `fm.current_state === 'published'` and is now
`isCaseMemberBytes(fm)` — `case_id` AND `case_edition`, the pair, both inside the hash the member
signs. A new arm refuses `case_edition` with no `case_id` beside it, which is where REC-44's
`case_id` requirement survives. The 17 refusal texts reading *"published state requires …"* now
read *"a case member requires …"*.

**8. NEW TABLE `case_revision_flags` (I5) AND NEW OP `op=caseflags` (I3).** The design: *"When a
member finding is later revised (new version minted), the containing cases are FLAGGED, never
silently updated and never automatically re-published … New editions are each owning project's
deliberate act."* The flag is RAISED in `promote()` — the one write that mints a version — when
the sha being replaced is one a case roster pinned, and it is DISCHARGED by a ratified new edition
of that case. **No row is ever deleted and no flag is ever unset**: the discharge is ADDED to the
row (`acted_at`, `acted_by`, `acted_edition`). `op=caseflags` is ungated on `op=publishedcase`'s
own reasoning — every fact in the answer is already on the public surface.

### The measurement — CONSUMER IMPACT, and it is NOT zero

Measured 2026-09-10 by grep over `civicos-ui/`, `newgroup/`, `pdf-worker/`, `agent-worker/`,
`docprofile/`, `tools/` and `release/`, built copies excluded.

**`newgroup`, `pdf-worker`, `agent-worker`, `docprofile`, `tools`, `release`: ZERO.** None of them
reads a state vocabulary.

**`civicos-ui/app.html`: FOUR SITES, and the first is a HAND COPY OF THE MACHINE THIS ITEM
CHANGES.**

| where | what | what breaks |
| --- | --- | --- |
| ~1636-1646, `STATE_EDGES.inquiry` | a mirror of `STATES.inquiry.edges`, with `concluded:[…,"published",…]` and `published:["open","surfaced"]` | the disposition pre-flight offers a move the store now refuses `NOT_CONCLUDED` — DEC-8's headline failure |
| ~1670, `PHASE` | `published:"case"` | a member of a published case now sits at `concluded`, so the page calls a CASE a "Finding" |
| ~1767, the SPACE vocabulary | `published: {label:"published record", …}` | unaffected — this is the published-record SPACE, not the inquiry state, and the word is correct there |
| ~1794-1797, the state seal vocabulary | a `published` row with chip, mark, `next:["open"]` and two `forbids` | a case renders with no seal and no forbids; the two forbids are still TRUE and now hang off the case relation |

**The honest shape of the UI fix is NOT a find-and-replace**, which is why it is a delegation and
not a footnote: the page has to render a CASE MEMBER, and there is no longer a state word to
render it from. `op=affordances` now serves `case_member` for exactly that, and `op=caseflags`
serves the revision flags a case page should show. Enqueued in `CLAIMS.md` as a DELEGATION.

### Reversal cost

**Low and it does not rise.** The table and the op are additive and nothing reads them yet. The
lifecycle half reverses by restoring `published` to `legal` and to `concluded`'s edges and putting
the three state writes back in `publishCase()` — but **any document published while this is in
force sits at `concluded` with a case relation and no `published` in its history**, so a reversal
does not un-publish them and must keep the case-relation predicate as the reader for those. That
is a one-way door on DATA and a two-way door on CODE, and it is stated here rather than discovered.

## IC-70 · I4 (+I6 context): THE PLANE'S OWN COMMITTED BUNDLE GAINS FL-9's GUARD — `dist/bio-plane.bundle.json` beside `dist/bio-plane.bundled.mjs`, and a stale plane artifact FAILS instead of shipping · PROPOSED 2026-09-10 (FL-10, enacting BOB's D-298 routing) — the RESOLUTION is CONDUCT's

- **Interfaces:** **I4** (plane → installer, the release artifact), **1.0.0 STABLE**, owner `DIST`.
  I6 is named on FL-10's row for continuity with IC-68 and gains only knowledge, no shape: no fleet
  member changes here at all.
- **Proposer:** FL-10 (the FLEET area session), 2026-09-10.
- **Id PRE-MINTED BY CONDUCT at the FL-10 mint** — the IC-64 lesson enacted; not minted in this worktree.
- **Owner to land the RELEASE half:** `DIST` (D-297, D-298's clause 2 — the assembler that REFUSES
  an incoherent release). **This item lands the plane's GUARD half only** and builds nothing
  against the release format.
- **Consumers to answer:** `DIST` (owner of I4 and the release ceremony), `FLEET` (proposer).

### The change, in one sentence

`bio-plane` commits the SAME guarded-bundle shape IC-68 gave every fleet member — the existing
`dist/bio-plane.bundled.mjs` gains `dist/bio-plane.bundle.json` (its sha256, byte length, exact
recipe, and the sha256 of every input) and the FL-9 gate asserts the committed module is
byte-identical to a fresh build of `src` — so D-298's defect class (114 commits of silent drift,
a battery green on an artifact nobody ships from) FAILS instead of shipping.

### MEASURED CONSUMER IMPACT, taken before building rather than after

| reader | what it reads | affected? |
| --- | --- | --- |
| **`dist/bio-plane.bundle.json` (NEW)** | — | **ZERO readers today, measured by grep over the repo.** DIST's release half (D-297/D-298(2)) is its intended first consumer. Additive in fact. |
| `bio-plane/test/bundle.test.mjs` | loads `dist/bio-plane.bundled.mjs` under miniflare | path unchanged; the REBUILT artifact is today's battery-green source. The battery proves it, not this row. |
| `newgroup/scripts/embed-release.mjs` | runs `npm run build` in the plane, then reads the artifact | command name and artifact path unchanged; the build now ALSO writes the manifest (additive output). It rebuilds before reading, so it never sees a half-state. |
| `bio-plane/package.json "build"` | the recipe | moves from an inline esbuild CLI line to `scripts/fleet-bundle.mjs`'s ONE expression via a thin `scripts/build-plane.mjs` caller (agent-worker's pattern). **Byte-identity of CLI-built vs library-built output is MEASURED before landing and recorded in the landed report.** |
| `agent-worker/scripts/build.mjs`, `pdf-worker/scripts/build.mjs`, `test/fleetbundles.test.mjs` | `fleet-bundle.mjs` exports | existing exports keep their shapes; the plane arrives as a NEW exported descriptor, not via `discoverMembers` — deliberately, because a `bio-plane/fleet-member.json` would enrol the plane in `coverage.mjs`'s FLEET rules (no mutating surface ops), which the plane necessarily violates. |
| `bio-plane/scripts/embed-signpage.mjs` | run by `npm run embed:sign` only (measured) | gains an exported renderer + an import-guard on main; CLI behaviour unchanged. Closes the generated-input loop: the gate can assert committed `src/signpage.mjs` IS the deterministic render of `tools/sign-release.html` without writing. |
| `release/**` | the released 0.56.0 asset | UNTOUCHED. `dist` and `release/` intentionally diverge after the rebuild — that divergence is D-298's truthful state (114 commits of unreleased work), and making the release coherent again is the separate gated cut D-298 already names as DIST's. |

**PROPOSED, 2026-09-10.** The guard half is FL-10's to land; the release half is DIST's and
nothing here builds against it. **The version bump and the RESOLUTION are CONDUCT's.**

### RESOLUTION — ACCEPTED, **I4 1.0.0 → 1.1.0**, 2026-09-10 by CONDUCT #9

Additive in fact, on the row's own measured table: the new manifest has ZERO readers today,
the artifact path and build command are unchanged, and `embed-release.mjs` rebuilds before
reading so it never sees a half-state. Resolved by CONDUCT per FL-10's row assignment rather
than answered FOR the consumers: FLEET is the proposer, and DIST — I4's owner — is the party
whose own 2026-09-10 DELEGATION asked for exactly this guard pattern (BOB's answer routed it),
so its agreement is on the record in substance; its release half (D-297, D-298 clause 2) is
untouched, remains DIST's, and an objection from DIST reopens this row rather than being
overridden by it. `INTERFACES.md` bumped in the same act.

---

## IC-72 · I5: THREE NEW TABLES — `calibrations`, `calibration_subjects`, `calibration_signals` — one ADDITIVE column on the DERIVED `reading_text_source` projection, and FIVE new ops · PROPOSED 2026-09-10 (CPDF-13, closing D-183 and D-253's join) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I5 (the store schema), currently **1.8.0**
- **Proposer:** CONTENT-PDF, worker `agent-ab1e3df0de5e3b8ec`, 2026-09-10, from QUEUE CPDF-13
- **Owner to land it:** `RECORD` (I5's owner). The tables are declared in
  `bio-plane/src/schema.mjs`, the ops in `bio-plane/src/store.mjs` and
  `bio-plane/src/index.mjs`, and the construct in `bio-plane/src/calibration.mjs`.
- **Consumers to answer:** `RECORD` (owner), and every area that reads the schema.
- **The id was MINTED with `node tools/mintid.mjs IC`** (floor IC-71 from QUEUE.md),
  never measured free by hand: seven items collided on a hand-measured id in one day.

### 1 · PROPOSED

### WHAT CHANGES, precisely

**(a) THREE NEW TABLES, all declared BEFORE the `host_governor` block** (the
`hygiene.test.mjs` rule), with no backticks and no semicolon inside any inline
`--` comment (the `#migrate` split rule, PL-1 — and the backtick trap was PAID
FOR again here: the first draft of this block carried six and `node --check`
reported the SyntaxError at the schema literal):

```
calibrations         calibration_id PK (CAL-<n>, minted by the store), engine, version,
                     at, at_ms, cap, probe_id, probe_inputs, scores, measured_by,
                     superseded_by, drift, note
                     + INDEX (engine, version, at_ms) and (drift, superseded_by)
calibration_subjects engine PK, version, probe_id, registered_at, last_probe_ms, enabled
calibration_signals  signal_id PK, engine, source, observed_at, probe_by_ms, detail,
                     consumed_at  + INDEX (engine, consumed_at, probe_by_ms)
```

`replaced_by` and `drift` are the ONLY mutable columns and are set ONCE, when a
later probe of the same engine lands. Nothing else is ever updated: a calibration
records a measurement that was taken, and a measurement does not change after the
fact.

**THE COLUMN IS `replaced_by` AND NOT `superseded_by`, AND A REVIEWER SHOULD KNOW
WHY BEFORE CONCLUDING THE AUTHOR DID NOT KNOW THE USUAL WORD.** D-221's
version-chain pin (`test/versionchain.test.mjs` section 2) sweeps the WHOLE schema
for any stored pointer from one version to another — `supersede[sd]?`,
`superseded_by`, `predecessor`, `previous_version` and their family — because the
thesis of that item is that a document's version history is DERIVED from captures
and is never an edge somebody wrote down. **That pin is total on purpose and this
column set it off.** The pin was NOT narrowed: a calibration is a measurement of an
ENGINE rather than a version of a DOCUMENT, so the two constructs are unrelated —
but loosening a total sweep to admit a lookalike is how a guard stops being total,
and the next real stored pointer would arrive through the hole this one made. The
word moved instead, with the reasoning at the column. **The WIRE field on
`op=calibrations` is still `superseded_by`**, which is the word a reader wants;
only the stored column carries the constraint.

**(b) ONE ADDITIVE, NULLABLE COLUMN** on `reading_text_source`:
`calibrations TEXT` (a JSON array of the calibration ids the chain's steps name),
plus its index. Carried onto an existing store by `#migrate`'s additive-column
list. **It needs no backfill reasoning of the kind `published_case_members`'
columns needed, and that is a fact about the column rather than an omission:**
every column on `reading_text_source` is DERIVED from the stored chain and
rebuilt with it, so a migrated store fills this in on each reading's next
projection and cannot disagree with the chain meanwhile. A chain written before
calibrations existed names none, which is exactly what NULL says and exactly what
is true of it.

**(c) FIVE NEW OPS.** Two reads (`calibrations`, `calibrationdrift`) and three
writes (`calibrate`, `calibrationsubject`, `calibrationsignal`). All five admit
`admin`, `member` and `probe`. `calibrationdrift` takes the REC-30 viewer stamp
because its rows name the bundle each affected capture is filed in;
`calibrations` does not, because it answers about ENGINES and names no bundle.

**`calibrate` IS OPEN TO `probe` AND `attesttext` BESIDE IT IS NOT, which looks
inconsistent and is the considered answer.** Attesting is TESTIMONY — a person
says they compared this text against the image, and there is no version of that a
token can perform. Calibrating is MEASURING — a probe ran over stated inputs and
produced stated scores, and a machine is the right thing to do that; the
scheduled re-probe this item builds is a machine act by construction. The fence
that matters is therefore not about who may measure but that a measurement may
never move a GRADE, and that is enforced structurally (`CAL_CANNOT_REGRADE`, and
the drift handler writing nothing at all). Admitting the machine and refusing the
grade move is the honest shape; refusing the machine while letting the grade move
would be the fence in the wrong place.

**(d) THE PURGE DISPOSITION IS EXEMPTION, NOT INCLUSION, AND IT IS THE ONE
DECISION IN THIS ROW A REVIEWER SHOULD CHECK HARDEST.** D-113's rule is that a
DERIVED table must be added to `purge`. These three are not derived from the
corpus: **a calibration is a measurement of an ENGINE, not of a document.** No
`bundle_id` appears in any of them, nothing in them is recomputable from captured
bytes, and a probe that ran on a past date cannot be re-run retroactively. They
therefore sit in `runtime_observations`' family and are EXEMPTED in
`hygiene.test.mjs` with that reason stated at the site. The damage of clearing
them is the argument: **the published projection's transcription grades rest on
these measurements, so a whole-store purge that dropped them would leave
published findings whose fidelity ceiling points at a measurement nobody holds** —
the overclaim class, produced by a reset. The DERIVED half of this item,
`reading_text_source.calibrations`, IS purged, with its table, as it should be.

### CONSUMER IMPACT, MEASURED RATHER THAN ASSERTED

- **`civicos-ui/**`: ZERO edits.** Measured, not argued: `grep -rn "calibration"
  civicos-ui/` returns **0 hits** and a grep for the five op names returns **0**.
  No existing op's answer gains or loses a field and no existing table gains a
  column the UI reads. `node civicos-ui/test/run.mjs` green.
- **`newgroup/**`: ZERO edits.** `grep -rn "calibration" newgroup/` returns **0**.
  The installer ships the schema literal; a new `CREATE TABLE IF NOT EXISTS`
  before `host_governor` is what every I5 bump since 1.1.0 has been.
- **SIX EXISTING SUITES CAUGHT THIS CHANGE AND EVERY ONE WAS CORRECTED AT ITS
  SITE, NEVER EXEMPTED.** This is the measured consumer impact and it is not
  zero: `scheduler.test.mjs` (registry totality, ten consumers → eleven),
  `airun.test.mjs` (the same count as a pinned DELTA, 10→11 — corrected rather
  than loosened to a floor, for the reason its own comment already gives),
  `hygiene.test.mjs` (D-113's purge-or-exempt census), `rung-ladder.test.mjs`
  (every mutating op carries a rung or a stated absence — it named all three
  writes), `gate-reads.test.mjs` (every read is gated or ungated-for-a-reason —
  it named both reads), and `versionchain.test.mjs` (D-221's total
  version-edge sweep, which produced the `replaced_by` naming constraint above).
- **AND TWO RATCHETS CAUGHT REAL UNBOUNDED WORK IN THE FIRST DRAFT, WHICH WAS
  FIXED RATHER THAN CEILING-MOVED — NO FLOOR OR CEILING IN THIS ITEM MOVED AT
  ALL.** `derivation-bounds.test.mjs` named a method amplifying over an unbounded
  scan (`#calDriftFor` walked `reading_text_source` with no LIMIT, and
  `#mintCalibrationId` read every row to take a max); `meaning-bounds.test.mjs`
  named a read publishing a bare collection off an unbounded row source
  (`op=calibrations`). Both now carry the plane's own `limit`/`truncated` pair,
  the max is taken in SQL, and **the drift read publishes its truncation rather
  than swallowing it** — an obligation list that silently stopped short would be
  the record UNDERSTATING a blast radius, the one direction this item must never
  fail in. `airuns.test.mjs`' index sweep additionally scored
  `calibrations_drift` as an index nobody filters on, because the predicate had
  been assembled into a `where` variable and interpolated; the two statements are
  now written out, which makes the true fact visible to the instrument whose job
  is to notice its absence.

### MIGRATION

Nothing migrates and nothing is backfilled. An existing store gains three empty
tables and one NULL column; with no `calibration_subjects` row it registers no
wake, holds no alarm, and behaves exactly as it did before this row existed.

### RESOLUTION — ACCEPTED, **I5 1.8.0 → 1.9.0**, 2026-09-10 by CONDUCT #9

Additive: three new tables, one nullable column on a derived projection, five new ops; no
existing column changed and the migration section above is a no-op for every existing store.
CONDUCT answers in writing on dormant RECORD's behalf (protocol step 3), recorded as CONDUCT
answering FOR the area and never as the area agreeing. The `replaced_by` naming stands as
argued — D-221's total pin was met, not narrowed. Landed as-built with CPDF-13 (`4a0c248`);
`INTERFACES.md` bumped in the same act.

---

## IC-73 · I2: A DERIVATION STEP IN `text_source`'s CHAIN MAY NAME THE CALIBRATION ITS `cap` RESTS ON — one OPTIONAL field, and a refusal for a reference that is present and UNREADABLE · PROPOSED 2026-09-10 (CPDF-13, closing D-253) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I2 (content → framework), currently **1.1.0 STABLE**
- **Proposer:** CONTENT-PDF, worker `agent-ab1e3df0de5e3b8ec`, 2026-09-10, from QUEUE CPDF-13
- **Owner to land it:** `FRAMEWORK` (currently dormant — CONDUCT answers on its
  behalf IN WRITING per the protocol's step 3, recorded as CONDUCT answering FOR
  the area and never as the area agreeing)
- **Producers affected:** `CONTENT-PDF` (live — `src/index.mjs`'s two chain composers)
- **The id was MINTED with `node tools/mintid.mjs IC`** (floor IC-71).

### 1 · PROPOSED

### WHAT CHANGES, precisely

A derivation step in `text_source` may carry one more field:

```
{ step: "ocr", engine: "…", version: "…", cap: "C",
  measured_by: "<free string, unchanged>",
+ calibration: "CAL-7" | absent }
```

That is the whole shape change. `checkChain` gains ONE refusal,
`TEXT_CHAIN_CAL_REF` (C-35.12), and `textchain.mjs` gains one reader,
`calibrationsOf(chain)`.

### WHY, AND IT IS D-253 IN ONE SENTENCE

The chain records the ENGINE; the grade rests on a MEASUREMENT; the join between
them is a SENTENCE. `measured_by` is a free string — today
`"MEASUREMENTS.md 2026-08-03 (CPDF-9)"` — a pointer a HUMAN can follow, which
nothing checks, nothing notices going stale, and nothing can invert. No query can
answer *"which transcriptions rest on a measurement that has been superseded"*,
which is the question the asymmetric drift handler exists to ask. `calibration`
is the machine-followable half of the same pointer. **`measured_by` is UNCHANGED
and is not withdrawn**: it says where a human reads the measurement, and the two
are not redundant.

### THE FIELD IS OPTIONAL, AND THAT IS THE DECISION, NOT A CONCESSION

**Every chain this record has ever written carries a `cap` and no calibration.** A
required field would have refused the entire existing store on migration, and a
fence tighter than its rule is not a safer fence — it is an undeclared interface
change wearing the costume of caution. So an ABSENT reference stays legal and
means exactly what it always meant. What IS refused is a reference that is
**present and unreadable**, because an unresolvable pointer is strictly worse than
an absent one: it looks like a binding and joins to nothing.

The over-strictness direction is asserted in `test/textchain.test.mjs` by name
(*"a step with a cap and NO calibration is LEGAL — the pre-CPDF-13 shape"*), and
`test/calibration.control.mjs`'s `overstrict` arm measures that such an assertion
is load-bearing rather than decorative.

### CONSUMER IMPACT, MEASURED

- **A consumer reading `step.engine`, `step.version`, `step.cap` or
  `step.measured_by` is UNAFFECTED** — no field is renamed, reshaped or removed,
  and no step kind is added. This is IC-39's shape exactly: a new sibling key.
- **`civicos-ui/**`: ZERO edits, measured** — `grep -rn "calibration" civicos-ui/`
  returns **0 hits**, and the UI does not read chain steps field-by-field.
- **`test/textchain.test.mjs` was CORRECTED at its site, never exempted.** Its
  DEC-49 family-totality assertion caught the new refusal row immediately — the
  hand-written `codesUsed` list was wrong the moment the refusal landed — and the
  correction carries a dated reason at the line, with an arm driving the new code.
  That suite went 189 → 196 assertions, 0 failed.
- **FRAMEWORK's reader:** the chain reaches FRAMEWORK through FW-15's wire and is
  consumed whole; an additive per-step key is inert there. CONDUCT should confirm
  that on the merged tree rather than take it from this branch.

### WHO FILLS IT IN TODAY, STATED PLAINLY BECAUSE IT IS A NARROW ANSWER

`src/index.mjs`'s Tier-3 composer (`ocrTextFromMember`) takes the reference as a
PARAMETER — it is not looked up there, for `cap`'s own reason: a measurement must
not acquire a second home. The acquire path joins the member's
`(engine, version)` to the LIVE calibration for it, one store read, on a branch
that already makes a network call — so an instance with no OCR member (every
instance today) pays nothing for this on the capture path. It **fails open to
NULL, never to a guess**: a store that does not answer, an engine with no
calibration, or a superseded one all produce the pre-CPDF-13 chain. A
transcription that cannot name its measurement says so by not naming one; it
never names the nearest available number.

**`layerChainFor` DELIBERATELY DOES NOT, and it is a closure rather than an
oversight.** A text layer's cap is `null` by measurement (CPDF-10: a layer is
authored text and third-party OCR mixed together, and nobody has separated them),
and D-251's named-engine step is `null` too — somebody else's engine, run at a
quality nobody here measured. **A calibration reference on a step whose cap is
`null` would point at a measurement the step does not rest on.** Adding a
per-acquire store read to attach one would be paying for a join that says
nothing. When a probe measures a text layer's fidelity, that step gains its
reference the same way the OCR step does.

### RESOLUTION — ACCEPTED, **I2 1.1.0 → 1.2.0**, 2026-09-10 by CONDUCT #9

Additive: one OPTIONAL field on a chain step and one refusal for a reference that is present
and unreadable; a reader ignoring the field sees 1.1.0. CONDUCT answers in writing on dormant
FRAMEWORK's behalf (protocol step 3), recorded as CONDUCT answering FOR the area and never as
the area agreeing. The text-layer closure stands as stated (no calibration reference on a step
whose cap is null by measurement — a reference must point at a measurement the step rests on).
Landed as-built with CPDF-13 (`4a0c248`); `INTERFACES.md` bumped in the same act.

---

## IC-71 · I3 + I5: THE CASE-LEVEL SIGNING CEREMONY — a CASE DOCUMENT a member reviews and signs (`op=casedocument` + `op=caseratify`, one new table `case_documents`, catalog family C-41), and then the DELETION it was the precondition for: a finding's bytes STOP NAMING A CASE (`case_id`, `case_edition`, `case_project`, `case_scope`, `case_findings`, `case_roles`, `bias_acknowledgement`, `required_strength` all leave member frontmatter); container to `bio-case-container/5` · PROPOSED 2026-09-10 (CASE-5b, enacting DEC-72) — the version bump and the RESOLUTION are CONDUCT's

- **Interfaces:** **I3** (op contracts) and **I5** (schema), owner `RECORD`.
- **Proposer:** CASE-5b (session `case5b-case-signing`), 2026-09-10.
- **Id PRE-MINTED BY CONDUCT at the CASE-5b spawn** — not minted in this worktree. The
  IC-64 lesson enacted rather than remembered: on 2026-08-10 two parallel workers each
  minted `IC-64` because `mintid` derives its floor from ids MENTIONED IN PROSE and
  neither branch could see the other's file.
- **Consumers to answer:** `UI` (the published case page and the finding view), `DIST`
  (the container format travels in a release), `CONDUCT` (the version bump).

### The change, in one sentence

A case's own assertions are committed from a CASE DOCUMENT that a member reviews and
signs, instead of from N copies stamped into N members' signed bytes — so a finding's
bytes stop naming a case, which is the half of the CASE-5 bullet that CASE-5 could not
reach.

### WHY THE ORDER IS CEREMONY-FIRST-DELETION-SECOND, because the shape of this row is the argument

CASE-5 measured the wall and stated it rather than working around it: *every case fact
this plane commits is committed FROM THE SIGNED BYTES AND FROM NOTHING ELSE*
(`#publishEdges`' doctrine, restated at seven sites in `publish()`), **and there was no
signature over a case for those facts to move to.** Deleting the keys first would have
left the plane committing a group's case assertions from an UNSIGNED REQUEST — the
attribution class this record refuses everywhere.

The container manifest already stated the constraint that shaped the answer, in its own
words: *"a case-level signature would be a signature over something nobody reviewed."*
So the thing signed is **not** a synthesised summary of the roster. It is the publisher's
own authored assertions — the scope, the completeness statement, each exclusion with its
reason, the subject position and its justification, the bias acknowledgement, the
load-bearing partition, the bar — every one of them an argument a member typed at
`op=publish`, assembled into a document with a frontmatter half the gate reads and a
prose half a person reads. Nothing in it is composed, summarised or inferred by this
plane, and the suite asserts that by reconstructing the document's every authored
sentence from the arguments the act was given.

### The acts, in order

| act | what it does | who |
| --- | --- | --- |
| `op=publish` | AUTHORS the case document (and commits **nothing** case-side). Promotes each member to a new version and PINS every one of them, by hash, in that one document. | project owner |
| `op=casedocument` | reads it back whole, with the exact statement to sign. **Ungated**, on `op=publishedcase`'s reasoning. | anyone |
| `op=caseratify` | verifies the SSHSIG, runs the catalog (C-41), and commits `cases`, `published_cases` and `published_case_members` **from the signed document**. | a member with `publish` |
| `op=ratify` | unchanged in shape: each member signs its OWN bytes, because the finding is the unit of truth. | each member |

**THE ORDERING IS NEW AND IT REMOVES AN INVENTION.** The roster used to be written by
whichever member ratified FIRST — at which moment the other members had signed nothing,
which is exactly why CASE-3 had to pin one member at a time and said so at the site:
*"writing all N pins there would mean inventing N-1."* The case document names all N
pins in one authored statement, so clause 3's freeze (*"publication pins versions, like
a commit"*) is now a single act rather than N assembled over time.

### MEASURED CONSUMER IMPACT, taken BEFORE building rather than after

Grep over `bio-plane/src`, `bio-plane/test`, `bio-plane/checks`, `bio-plane/scripts`,
`civicos-ui`, `newgroup`, `docprofile`, `pdf-worker`, `agent-worker`, `tools`; built
copies (`**/dist/**`) and `release/**` excluded structurally.

| reader | what it reads | affected? |
| --- | --- | --- |
| `civicos-ui/app.html` (`pubIndex`, `pubBarHtml`) | `cs.case_id`, `m.case_id`, `row.required` | **WIRE FIELDS, NOT FRONTMATTER — and they do NOT move.** `cases[].case_id` and `caseMembers[].case_id` come from `published_cases`/`published_case_members`, which are still written, just from a different signature. `published_bundles.required` is still written and still carries the same block — sourced now from `published_cases.bar` (itself committed from the signed case document) instead of from the member's own stamp. **NO UI CODE CHANGE IS OWED BY THIS ROW.** |
| `civicos-ui/app.html` comments at ~15086 and ~15708 | prose: *"`required_strength` is frozen into the finding's own bytes and two findings of one case may have been held to different standards"* | **STALE PROSE, and it was already half-stale after CASE-5.** DEC-72 clause 2 removed the possibility those sentences describe. **DELEGATED to CASE-6**, which owns the published case page and is where the per-finding bar should become the CASE's bar on the surface. Filed in `CLAIMS.md`. |
| `newgroup/src/release.mjs` | every one of the eight keys | **BUILT COPY — the embedded plane source. ZERO hand-maintained readers.** DIST regenerates it. |
| `bio-plane/checks/bio-checks.mjs` | `isCaseMemberBytes`, `caseEditionClaimed`, `checkPublishedExtension`'s six case arms | **CORRECTED IN THIS ITEM, never exempted.** The predicate's own comment named this item as where the change would arrive, and it arrives there. The six arms are REHOMED to `checkCaseDocument` (C-41), not deleted — asserted by NAME on both sides of the move, because moving a check is the shape a lost check wears. |
| `bio-plane/src/index.mjs` `op=ratify` | eight case reads out of the ratified frontmatter | removed; the relation comes off the PIN. |
| `bio-plane/src/store.mjs` `publish()` | eight case parameters | removed from the SIGNATURE rather than ignored — an argument a caller can still pass is one a caller will eventually believe is read. |
| the CASE CONTAINER | `bio-case-container/4` | **→ `/5`, and this bump is load-bearing in a way the others were not.** `/4`'s case fields were a convenience over material the reader could verify inside each member's signed bundle.md. After this item that material is not there, so a `/4`-shaped manifest built today would carry the same fields with NOTHING BEHIND THEM. `/5` carries `case_document` — the bytes, the hash, and the armored signature — so the stranger is back where they were: holding bytes somebody signed. Without the bump a reader could not tell a `/4` whose case facts were signed from a `/4` whose case facts were nobody's. |
| `bio-plane/test/*` (9 suites driving `op=publish` then `op=ratify`) | the ceremony is a new step between them | one shared fixture, `test/caseceremony.mjs`, on `publishingproject.mjs`'s precedent and for its reason (nine inline copies of one ceremony is the shape this repo keeps paying for). **CASE-5b's own suite does NOT use it** and signs inline, so helper and subject share no code path. |
| `docprofile/`, `pdf-worker/`, `tools/`, `agent-worker/`, `release/` | none of the moving fields | **ZERO.** |

### The schema half (I5)

ONE new table, `case_documents (case_id, edition, doc_sha, text, authored_at, authored_by,
sig_armored, attestor_key, attestor_member, gate_version, ratified_at)`, placed beside its
`cases` sibling and BEFORE the `host_governor` block. No existing table changes shape.

**`purge` IS TOUCHED, AND IT IS CASE-1'S OWN REVERSAL CONDITION ARRIVING RATHER THAN A NEW
JUDGEMENT.** CASE-1 exempted `cases` and wrote the condition that would reverse it at the
site: *"if a later item lets a case exist as a DRAFT before publication, revisit, because
draft data surviving a purge is D-113 pointed the other way."* **This is that later item** —
a case document is authored unsigned and stays that way until `op=caseratify`. So the split
is BY SIGNATURE and not by table: the whole-store purge clears UNRATIFIED case documents
(working data) and leaves RATIFIED ones standing (the signed bytes `published_cases` was
committed from, which nothing else holds). `cases` keeps its exemption unchanged, because it
is still written only at ratification and no draft ever reaches it. **Stated plainly because
the D-113 check cannot see it:** hygiene's structural pass matches `DELETE FROM
case_documents` and scores the table covered without reading the WHERE clause, so the suite
DRIVES the split instead of asserting it.

### What is REFUSED, by name

- **`CASE_UNSIGNED`** — the arm this item exists for. A commit of a case assertion that
  arrives with no armored signature and no attestor key is refused by name. A silent skip
  would be indistinguishable from a case that had nothing to write.
- **`CASE_RATIFY_STALE`** — the document moved since it was reviewed.
- **`CASE_EDITION_ALREADY_RATIFIED`** — a second, different attestation over one edition.
- **`CASE_PRODUCTION_DIVERGED`** — kept from CASE-2, asked once instead of per member.
- **`CASE_ASSERTION_DIVERGED`** — **KEPT AND RE-AIMED.** It now compares what the CASE's
  signer asserted against what THIS member's own signed bytes froze. That is a real
  disagreement between two signers.
- `CASE_MEMBERSHIP_DIVERGED`, `CASE_ROLES_DIVERGED` and `CASE_ROSTER_EXCLUDES_SELF`
  **are withdrawn, and the reason is not that a fence was lowered.** All three existed to
  notice that N COPIES OF ONE FACT had stopped agreeing. There is one copy now and it
  cannot disagree with itself: the shapes they refused are unrepresentable rather than
  refused, which is the outcome this record reaches for everywhere else.

**PROPOSED, 2026-09-10.** The version bump and the RESOLUTION are CONDUCT's.
### RESOLUTION — ACCEPTED, **I3 10.4.0 → 11.0.0** and **I5 1.9.0 → 1.10.0**, 2026-09-10 by CONDUCT #9

I3 MAJOR on IC-3's settled reasoning: four divergence refusal reasons are REMOVED wire
strings, eight keys leave the published artifact's member frontmatter, and the container
format moves to `bio-case-container/5` — breaks by definition whatever the measured impact
(which is: zero `civicos-ui` code, its reads being wire fields off `published_cases`/
`published_case_members` that do not move; `newgroup/src/release.mjs` a built copy DIST
regenerates). I5 MINOR: one new table, `purge` covered, nothing existing changed. UI's two
stale comments stay DELEGATED to CASE-6 as filed. CONDUCT answers for the consumers named:
UI's measured impact is zero and its catch-up surface IS CASE-6 (queued, dependency now met);
DIST's container-format exposure travels with its own release cut, which already waits on
DIST's lane — an objection from either reopens this row. `INTERFACES.md` bumped in the same
act, and the missing 10.4.0 chain entry found while bumping is RECORDED there rather than
repaired blind.

---

## THE 2026-09-10 BACKLOG RESOLUTION — CONDUCT #9, every row that still said "the bump is CONDUCT's"

Thirteen landed-and-unversioned rows plus two late breaks, settled in one pass so the
registry stops carrying debts as marginalia. `INTERFACES.md` carries every number moved,
each entry saying it was resolved late and that sequence position is resolution order.

- **ADDITIVE, collapsed into I3 10.4.0** (one bump covers several — I2 1.1.0's own
  precedent, chosen because no consumer ever saw individual numbers): IC-29 (whose PL-1
  integration moved the I3 head to 10.4.0 without a chain entry — found by `git -S`),
  IC-30, IC-31, IC-35, IC-36, IC-37, IC-38, IC-40, IC-42, IC-48, IC-53, IC-57. The I5
  halves of IC-29/30/31/36 are recorded as a CATCH-UP note in I5's chain, subsumed in the
  numbers since.
- **BREAKING, resolved late as I3 12.0.0**: IC-47 — the run verbs' C-22.8 participation
  refusal (DEC-63). A previously-admitted session is now refused; IC-25's rule versions
  the behaviour change as MAJOR at zero measured impact.
- **BREAKING, resolved late as I3 13.0.0**: IC-52 — `op=versionaccept`'s `affirmed`
  argument and C-25.33 (DEC-32 clause 4); the refusal on previously-succeeding
  multi-part accepts is the break.
- **ADDITIVE, resolved late as I2 1.3.0**: IC-58 — the `producer` field and the second
  chain step; zero readers break, measured at filing.
- **BREAKING, resolved late as I2 2.0.0**: IC-39 — `text_source` string → ordered chain,
  AS-BUILT and long live (`textchain.mjs` refuses the bare string by name); the entry
  records a break no chain entry ever had.
- **I8 rows (IC-32, IC-33, IC-43): RESOLVED WITH NO NUMBER MOVED.** I8 is PROVISIONAL at
  0.1.0 by FL-5's own recorded verdict; a provisional interface versions when it
  CONFIRMS, and nothing here confirms it. The rows stand accepted as-built.
- **Header-stale rows needing nothing**: IC-1 (settled inside I2 1.1.0's entry as
  amended), IC-20 (I3 6.0.0), IC-25/26/27/28 (I3 10.0.0..10.3.0) — their bodies already
  carry CHANGED/SETTLED; no action beyond this line naming them.

Every resolution here is CONDUCT answering FOR a dormant consumer (or recording an
as-built fact), per protocol step 3 — never the area agreeing. An objection from any
owner reopens the specific row, not this section.

---

## IC-75 · I3: `op=affordances` STOPS OFFERING `publish` TO A CALLER WHO HOLDS THE OWNER POSITION ON NO PROJECT — the act set NARROWS for a class of callers, and the store's `NOT_THE_PROJECT_OWNER` refusal and the published act finally answer the same question · PROPOSED 2026-09-10 (D-310, closing the DEC-8 disagreement CASE-6 found) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I3 (plane → UI, the op contracts), currently **13.0.0 STABLE**
- **Proposer:** `RECORD`, session `d310-publish-position`, 2026-09-10, from `DEBT.md`'s D-310 row
- **Owner to land it:** `RECORD`
- **Consumers to answer:** `UI`, `DIST` (the installer's served surfaces), every content area
- **Filed BEFORE the code was written**, because the SET of acts `op=affordances` publishes is
  something consumers build against: narrowing it for a class of callers is a behaviour change
  whether or not a field moves, and this one is measured to remove a whole section from a page.

### The change

`op=affordances?target=<concluded inquiry>` publishes the `publish` act on

```
    ty === "inquiry" && f.current_state === "concluded" && !f.case_member
```

with NO condition on WHO is asking. `Store.publishCase()` refuses a caller who is not an owner
of the named project BY NAME — `NOT_THE_PROJECT_OWNER`, the DEC-72 clause 5 fence CASE-2 built
(*"Only a project OWNER publishes"*). So a member who owns no project is told, on every
concluded finding, that publication is an act available here, and is refused at the act.

Two things move, and only these two:

1. **`affordanceFacts()` states ONE new FACT**, beside `case_member` and on its pattern exactly
   — a fact the store states, never a rule the act layer re-derives:

   ```
   project_owner: true   the viewer holds the OWNER position on at least one project
                  false  the viewer is a positional identity holding it on none
                  null   the viewer is not a positional identity (a machine class
                         credential), so the question is not asked of it
   ```

   It is DO-internal: `affordancefacts` is the store's own dispatch path and **no op on the
   control plane reaches it**, so this field crosses no wire. (That correction is D-310's own,
   recorded because the row first gave the opposite reason.)

2. **The `publish` act's `applies` predicate gains one clause**, `f.project_owner !== false`.

Nothing else changes: no op renamed, no refusal reason added or reworded, no success shape
touched, no other act's predicate moved, and the act catalogue's membership is unchanged —
`publish` is still published, still `weight: "single"`, still rung `irreversible`.

### Why `!== false` and not `=== true`, which is the whole of the shape

**Undetermined is first-class and is STATED.** A machine-class credential holds no roster
position — `project_participants` is keyed on a member id and a `class:` credential has none —
so `false` would assert that a machine was asked the question and holds nothing, which is not
what the store knows. It answers `null`, and a null does not narrow. That is also what keeps a
machine credential's affordance answer **byte-unchanged** by this item, which is asserted as an
over-strictness arm rather than hoped for: machine credentials are refused publication by a
DIFFERENT rule at a different level (`MACHINE_CANNOT_PUBLISH`, DEC-49's fence, which fires
first in `publishCase()`), and folding two rules into one gate would make this fence tighter
than its rule.

### Why the fact is "owner of SOME project" and not "owner of THIS project"

Because the project is a **PARAMETER of the act**, not the target of it. `op=publish` takes
`project=<id>` from the caller; `op=affordances` is asked about an INQUIRY and cannot know
which project a caller will name. `caseproduction.test.mjs` §3 already measures the distinction
in the store — *"pilar owns one project and publishes as another she merely joined — refused,
because the fence is keyed on the PAIR"* — and that arm is untouched and must stay green.

So the published act says what every other act here says, in the file's own words: *publishing
the act says the record permits the move, not that this caller's parameters will pass.* What it
stops saying is that publication is available to somebody for whom **no parameter exists** that
could make it succeed. That is exactly the class the disagreement lived in, and the narrowing
is the weakest one that closes it.

### MEASURED consumer impact

Measured by reading the consuming code, not inferred. **`UI` is affected in two places and the
second is the one that matters:**

1. **`civicos-ui/app.html`, `publicationEntryHtml()` (~:5873)** — `const act = (r && r.ok) ?
   actNamed(r.acts, "publish") : null; if(!act) return "";`. The **whole "Publishing this case"
   section** — five paragraphs, including the `data-pubwho` paragraph that states DEC-72 clause
   5 in words (*"A case is published BY A PROJECT, and only by an owner of it"*) — is rendered
   **only where the act is published**. After this change it disappears for exactly the readers
   the paragraph was written for. **CASE-6 put that sentence there so the fence would not be
   learned by silence, and this change makes it unreachable for the class that meets the
   fence.** That is a real product consequence and it is DELEGATED to `UI` rather than fixed
   here (`CLAIMS.md`, D-310 → UI): the gate is a proxy for "the record offers publication on
   this OBJECT", and the act's presence stops being that proxy the moment it is per-credential.
   The surface's own header already forbids the alternative — *"NO PER-CREDENTIAL VARIANT … it
   would also be the surface composing a position rule out of facts"* — so the fix is to gate
   the STATEMENT on the object, not to branch it on the reader.
2. **`civicos-ui/app.html` (~:6223)** — `actBarHtml(…, pubEntry ? { elsewhere:["publish"] } :
   undefined)`. With `publish` absent from `acts`, the act bar's "The record also publishes
   **Publish (author the case)** … It has a section of its own further up this page" line does
   not render either. No control disappears, because **no control ever existed**: DEC-33 defers
   the member-facing ceremony and the page wires none.
3. **`SURFACES.inquiry.acts` (~:2072) still names `publish` and is still CORRECT** — the act is
   published, for owners, on this surface. The surface-registry totality arm does not move.
4. **`op=queue`'s `options[]`** (`store.mjs #queueOptions`, the same `deriveActs` over the same
   facts, by construction) narrows identically for a non-owner. That is the intended behaviour
   and not a second change: the two answers are one derivation and must not be able to disagree.
5. **`DIST`** serves these surfaces and builds against no act id of its own: expected
   `NOT-AFFECTED`, to be answered rather than assumed.
6. **Content areas** consume I3 reads and no act set: expected `NOT-AFFECTED`.

**Inside the plane, the battery's own act-list pins move**, and every one is CORRECTED at its
site with a dated reason and never exempted. The set is measured from the delta rather than
guessed, and is named in this row's amendment when it is known.

### What this does NOT settle

**The seven roster acts stay `NON_ACTS`, "position-enforced by the store", and that is DECIDED
rather than deferred** — the argument is at their own table in `affordances.mjs` and the item is
`D-311`. In short: they need a DIFFERENT fact (`#isProjectOwner(TARGET, viewer)`, a per-pair
question) because their subject IS the project, and deriving them from this item's "owner
somewhere" fact would offer `projectinvite` on every project to anyone who owns any — the very
confusion the store refuses. Folding them in is an ADDITION to the published set, which is a
separate I3 change with its own consumers to measure.

**And it does not touch the machine fence.** `MACHINE_CANNOT_PUBLISH` is still a refusal
`op=affordances` does not front, which is the same CLASS of disagreement one rule over. It is
named in `D-311`'s row so it is not lost, and it is deliberately not closed here: closing it
would change a machine credential's published act set, which is a second, opposite behaviour
change that this row does not propose and no consumer has been asked about.

### Status

**PROPOSED, 2026-09-10.** Awaiting `DIST`. The version bump and the RESOLUTION are
CONDUCT's, per the standing shape of every row since IC-62.

**`UI` ANSWERS 2026-09-10 (UI-57) — AFFECTED AT SITE 1, ABSORBED; SITES 2, 3 CONFIRMED BY
MEASUREMENT.** The delegation was taken as an item and landed, and the measured impact was
right about the consequence and one degree wrong about the mechanism, which is worth the
row:

- **Site 1 (`publicationEntryHtml`) — ABSORBED, and no new field was needed.** The fix is the
  one this row's own prose names: the gate goes back on the OBJECT. It required nothing new of
  the plane — `op=affordances` already publishes `object_type` and `current_state` beside
  `acts`, and `actsFor()` in `app.html` already returned both — so the section's condition is
  now the publish act's OWN object-side clauses (`ty === "inquiry" && current_state ===
  "concluded"`) read verbatim from `affordances.mjs` and minus the per-credential one this row
  added. **This row said the gate was "a proxy for the record offers publication on this
  OBJECT"; the correction is that the object was answerable all along and only the surface's
  reading of it was the proxy.** One clause stays gated on the act's presence: the record's own
  published LABEL, which a surface may not invent. MEASURED: an owner's rendering of the section
  is BYTE-IDENTICAL to its pre-item self (3,258 B, sha256 `731d288d48b75859…`, and 3,357 B with
  a prompt riding the act), and the non-owner's goes 0 B → 3,216 B.
- **Site 2 (`elsewhere:["publish"]`) — NOT AFFECTED, and the reason is a measurement rather
  than a judgement.** The call site is unchanged. `actBarHtml` intersects `elsewhere` with the
  acts the record actually published, so a reader offered no `publish` act has nothing for the
  strip to route and the "section of its own further up this page" line is absent for them by
  the same fact that removed the control — asserted, not assumed.
- **Sites 3 and 4 — CONFIRMED.** `SURFACES.inquiry.acts` still names `publish` and the registry
  totality arm did not move; `op=queue`'s `options[]` is untouched by UI.
- **NOTHING ON I3 MOVES FOR THIS**, which is why UI-57 was filed as I3 CONSUMPTION with no IC
  of its own.

### RESOLUTION — ACCEPTED, **I3 13.0.0 → 14.0.0**, 2026-09-10 by CONDUCT #9

MAJOR on IC-25's and IC-47's own rule: the SET of published acts is something consumers build
against, and narrowing it for a caller class is a behaviour break whatever the measured impact.
The measured impact is exactly one consumer surface, named in this row's own table, delegated as
UI-57 and LANDED in the same integration wave — the publishing section now renders on the OBJECT
and the act gates only the record's own label, so the owner rule stays stated for the readers the
narrowing removed the act from. Machine-credential answers byte-identical, measured by the item's
own probe. UI has answered as consumer on this row; RECORD is dormant and CONDUCT answers for it,
protocol step 3. D-311 (the seven roster acts, decided to stay; the machine fence) is the recorded
residue and reopens nothing here. `INTERFACES.md` bumped in the same act.


## IC-74 · I3: **A FINDING MAY SERVE MANY CASES** — `FINDING_IN_ANOTHER_CASE` and `FINDINGS_IN_DIFFERENT_CASES` are DELETED, one new refusal `CASE_IDENTITY_AMBIGUOUS` (C-44) is minted in their place, and every read op that answers "which case is this finding in" becomes SET-VALUED · PROPOSED 2026-09-10 (D-309, enacting DEC-72 clause 6) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I3 (the plane's wire surface), STABLE
- **Proposer:** worker D-309, worktree `agent-a26bce57cd13e5ea5`
- **Owner to land it:** RECORD (the plane)
- **Filed BEFORE any code was written**, as the queue row requires.

### What is being changed, and why it is not optional

DEC-72 clause 6: *"A project can span many cases; a finding can serve many cases
— across projects and within one."* Bob's reason, from `CASE-AS-PRODUCTION.md`:
*"A finding is mined, often involving hard work. So once resolved, the finding
should have lasting value."* CASE-5's artifact flip made the shape representable
in the FORMAT; the plane still refuses it. This closes that.

### THE WIRE CHANGES, AND EVERY ONE IS MEASURED RATHER THAN PREDICTED

**1. Two refusals are DELETED from `op=publish`.** A consumer that branches on
either code will stop seeing it. Neither is replaced by a synonym, because the
rule each enforced is the rule DEC-72 clause 6 overturns.

- `FINDING_IN_ANOTHER_CASE` — *"A finding belongs to one case."* Gone.
- `FINDINGS_IN_DIFFERENT_CASES` — *"publishing it into a second would make 'which
  edition does this leg cite' unanswerable, since editions are over the CASE."*
  Gone, and the stated reason is ALSO answered rather than merely overruled:
  CASE-5's pin resolves a member by HASH, so a leg naming an edition of a case
  resolves without needing the finding to have only one case.

**2. One refusal is MINTED: `CASE_IDENTITY_AMBIGUOUS` (C-44).** `op=publish`
called with NO `caseId` over members that already belong to one or more published
cases. Before clause 6 the derivation was determinate — membership named exactly
one case, so deriving it was reading a fact. After clause 6 the same derivation is
a GUESS between two real intentions: a further edition of a case these findings
are already in, or a NEW case resting on the same mined findings. The act refuses
and names every candidate, so the publisher answers the question instead of the
plane answering it for them. REC-44's own comment already names the route out:
*"A caller may NAME an existing case (this is how a second edition, or a finding
joining a case, is published)."* It carries a canned DEC-49 translation.

**3. FIVE READ OPS CHANGE ANSWER SHAPE, and this is the measured consumer
impact the queue row asks for.** In every one the rule is the same and it is
stated once: **a new `cases` ARRAY is authoritative and is always present; the
pre-existing scalar `case_id` / `case_edition` fields are KEPT and are the sole
membership when there is exactly one, and NULL when the question has no answer or
more than one.** A consumer that goes on reading the scalar therefore never
receives a guess — it receives `null`, which it already handles, because a
finding in no case has always answered `null` there. **That is the whole design of
this migration: the old field can only become MORE null, never WRONG.**

| op | field(s) | before | after |
| --- | --- | --- | --- |
| `op=publishedlist` | per finding row | `case_id`, `case_edition` | + `cases: [{case_id, edition}]` |
| `op=publishededitions` | per edition | `case_id`, `case_edition` | + `cases: [{case_id, edition}]` |
| `op=publishedcase` | a served basis leg | `case_id`, `case_edition`, `manifest_sha` | + `cases: [{case_id, edition, manifest_sha}]` |
| `op=ratify` | the answer | `caseId`, `caseEdition`, `case` | + `cases: [{caseId, caseEdition}]` |
| `op=publishedcase` | RESOLUTION by a FINDING id or a HASH | resolved to one case | refuses `FINDING_IN_SEVERAL_CASES` naming them, when several |

The last row is the only one that can refuse where it did not before, and it is
the method's OWN doctrine applied rather than a new rule — `publishedCase()`
already says in its header that *"the surface resolves without deciding on the
reader's behalf what they meant."* A stranger holding one finding id that serves
two cases is told both and picks; answering with one would attribute a finding's
support to a case the reader did not ask about.

### Consumer impact, MEASURED

- **`civicos-ui/`** — grepped for `case_id` / `case_edition` outside `test/`:
  **the only hit is `check-mock-envelope.mjs`'s alias-stripping comment**, which
  is about SQL column aliases and not about this shape. The published case page's
  multi-membership renderer `pubOtherCasesHtml` **already reads the whole
  `caseMembers` table from `op=publishedmanifest` and is correct for any n** —
  CASE-6 built it that way on purpose so this item's landing would not move the
  surface. **So the surface half needs NO migration, and that is a measurement,
  not a hope.** The UI harness is run from the repo root as a gate regardless.
- **`newgroup/`** — out of bounds and not a consumer of these ops.
- **The check catalog** — `checkCompletenessFreshness` was the one consumer of
  `publishedCaseRegistry`'s resolved case and CASE-5b already retired it; the
  registry is plumbed and not read at that key. `publishedRegistryFor`'s
  per-edition `case_id` is not read by any catalog check (grepped).
- **`bio-plane/dist/bio-plane.bundled.mjs`** is a BUILD ARTIFACT and is DIST's;
  it is not edited here.

### The interface risk this does NOT take

**A case with several OWNING PROJECTS stays unrepresentable** — `cases` is keyed
on `case_id` alone, CASE-1's sharpest call, so a case does not change hands
between its editions. That is a separate limit, it is not this item's, and it is
deliberately **not widened**. `caselifecycle.test.mjs` block 7 goes on proving
"several owning projects means several cases" and its assertions do not move; only
the comment's *reason* changes, because it cited this fence.

### State

**PROPOSED 2026-09-10.** RECORD is the owner and is the proposer's own area.
CONTENT, FRAMEWORK, RETRIEVAL and DIST are not consumers of I3's case-membership
shape (measured above). **CONDUCT takes the version bump and the RESOLUTION.**

---

## IC-78 · A NEW INTERFACE, I9: plane → ocr-worker, the THIRD fleet service binding — the Tier-3 OCR path arrives as a member, and it is the first fleet member that is NOT a one-part upload · PROPOSED 2026-09-12 (CPDF-10, enacting DEC-35's default on CPDF-15's GO) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** **I9, NEW** — registered PROVISIONAL at 0.1.0 in `INTERFACES.md`
- **Proposer:** CONTENT-PDF, worker `agent-accf1711f80abb70c`, 2026-09-12, from QUEUE CPDF-10
- **Owner to land it:** `CONTENT-PDF` (the code); `DIST` releases it
- **Consumers affected:** the plane (`RECORD` owns the calling side — **the call site
  ALREADY EXISTS and is unchanged by this**); `DIST` (DS-1 installs the fleet, DS-4
  deploys it — **and this member asks DIST for something neither sibling did**)
- **The ids were MINTED with `node tools/mintid.mjs IC --count 2`** (floor IC-75).

### 1 · PROPOSED

### WHAT CHANGES, AND THE SURPRISING ANSWER IS: NOT THE SHAPE

**No shape moves.** `bio-plane/src/index.mjs`'s `ocrTextFromMember` has stated the
producer contract in full since CPDF-10 built the consumer against a stub; D-252 added
the page-wise merge and CPDF-13 (IC-73) added the calibration join. This item builds the
PRODUCER and consumes that contract exactly. **Zero lines of `bio-plane/src/` changed,
which is the measured evidence the contract did not have to bend to fit its first
implementation** — and a contract that moves to fit its first implementation is not one.

What is new is that the relationship now EXISTS and therefore needs a registry entry
(`PARALLELISM.md`: an interface that is not here does not exist). The entry is I9 rather
than a paragraph under I6 for I8's own reason: the direction of trust is different, and
here it is different by being NARROWER. `pdf-worker` is a pure function of bytes;
`agent-worker` calls back; this one is handed a sha and a page list, answers, and holds
no route to the record at all.

### THE ONE THING THAT ASKS SOMETHING OF ANOTHER AREA

**This member is a THREE-PART UPLOAD and neither sibling is.** Workers FORBID compiling
wasm at runtime — CPDF-15 measured that by being refused on a deployed Worker — so
`tesseract-core.wasm` (1,839,004 B) must arrive as a module the platform compiled at
upload time. `eng.traineddata` (4,113,088 B) rides the same way rather than being fetched
from R2, so the model's exact bytes are hashed by the same guard that hashes the source:
the `cap` this member reports is a measurement OF those bytes, and a model fetched at
runtime is bytes nothing pins.

**MEASURED CONSUMER IMPACT, and it is one area and one thing:**

- **`RECORD` / the plane: ZERO.** The call site, the merge, the chain composition, the
  refusals and the calibration join all pre-date this member and are untouched.
  `bio-plane/wrangler.jsonc` gains ONE service-binding line, INERT until DIST deploys —
  exactly how `PDF_WORKER` and `AGENT_WORKER` shipped. An instance without the binding
  behaves exactly as it does today: the document is NAMED as wanting OCR and stays
  honestly unread (D-115). **Driven, not asserted**: `ocr-member-e2e.test.mjs` runs the
  same real page through a plane with NO member bound and pins that answer.
- **`FRAMEWORK`: ZERO.** The I2 text shape a Tier-3 producer emits is the shape Tier 1
  and Tier 2 emit; no fourth text shape exists (D-164's rule, and CPDF-10 said so when
  it wrote the seam).
- **`DIST`: ONE THING, and it is a real ask.** `newgroup` must learn to upload a fleet
  member as MORE THAN ONE PART — an `ESModule`, a `CompiledWasm` and a `Data` part,
  named by the specifiers the committed bundle imports. `ocr-worker/wrangler.jsonc`
  carries the `rules` that express it for `wrangler`; the installer is a Worker and
  cannot run `wrangler`, which is the same forcing fact that produced FL-9's committed
  bundles in the first place. **DELEGATED to DIST** (D-115/D-116, DS-1/DS-4). Until it
  lands, the member is landed, guarded, tested and undeployed — which is where I6 and I8
  each sat, and is stated here rather than discovered later.

### WHAT A CONSUMER MUST NOT ASSUME, stated because both are new

- **`source.space` IS ON THE WIRE AND MUST BE READ.** Region rects are `"image-px"` —
  pixels of the frame that was OCR'd, the space they are VERIFIABLE in against
  `source.image.pixels_sha256`. `extentCovers` does containment and does NOT read
  `space`, so an attestation over a region must be made in the space the region was
  reported in. A consumer that mixes spaces gets a containment answer that is wrong and
  looks right.
- **`grain` IS ON THE WIRE AND IT IS `line`.** The plane composes a page's text by
  joining region texts with a NEWLINE, so a region's grain IS a line's grain in the
  record. MEASURED 2026-09-12: at `word` grain every OCR'd document becomes one word per
  line, which makes `meeting-agenda`'s definitive signal (a file number ALONE ON A LINE)
  trivially satisfiable by any number-shaped word and its phrase signals unreachable. A
  consumer doing a line-anchored read of OCR'd text should check `grain`.

### 2 · RESPONSES

*(awaited — `RECORD` and `DIST`; `FRAMEWORK` is dormant and CONDUCT answers on its
behalf IN WRITING per the protocol's step 3)*

---

## IC-79 · THE FLEET BUNDLE MANIFEST GAINS AN `assets` ARM — a member's UPLOAD PARTS are hashed by the same guard that hashes its source, and a swapped language model is STALENESS · PROPOSED 2026-09-12 (CPDF-10, extending FL-9/IC-68) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I4 (plane → installer, the release artifact) + I6/I8/I9 context — the
  same surface IC-68 and IC-70 extended
- **Proposer:** CONTENT-PDF, worker `agent-accf1711f80abb70c`, 2026-09-12, from QUEUE CPDF-10
- **Owner to land it:** `CONTENT-PDF` for the arm; `FLEET` owns `fleet-bundle.mjs`'s
  area and is dormant — CONDUCT answers on its behalf IN WRITING per step 3
- **Consumers affected:** `DIST` (`newgroup` fetches and verifies per-member assets);
  `FLEET` (the guard's own file)

### 1 · PROPOSED

### WHAT CHANGES, precisely

`dist/<member>.bundle.json` gains ONE optional key, and only for a member that declares
`bundle.assets` in its `fleet-member.json`:

```
{ member, artifact, sha256, bytes, recipe, inputs, vendoredInputs,
+ assets: [ { path: "assets/tesseract-core.wasm", bytes: 1839004, sha256: "3822dc6e…" },
+           { path: "assets/eng.traineddata",     bytes: 4113088, sha256: "7d4322bd…" } ],
  lock }
```

`verifyStatic` gains three findings over it: a declared asset whose bytes MOVED, a
declared asset that is MISSING, and — the asymmetric one — an asset the member DECLARES
that the manifest does not RECORD, plus its mirror.

### WHY, AND IT IS FL-9's OWN DEFECT ONE DIRECTORY OVER

An upload part is declared `bundle.external`, which means **esbuild never sees it and it
appears in NO input list**. Without this arm the staleness guard would cover every line
of `ocr-worker`'s source and NONE of the 5.95 MB that decides what its output says — and
that member's stated transcription fidelity is a measurement OF those exact bytes, so a
model swapped underneath it makes a `cap` already written into the record a claim about
something else. FL-9's sentence is *"a stale artifact FAILS instead of shipping"*; this
is the same sentence about the parts an artifact cannot swallow.

The MISSING case is treated as staleness rather than tolerated, and that differs
deliberately from a vendored dependency: a vendored input is legitimately absent in a
fresh checkout, and an upload part is COMMITTED, so absent means the member cannot be
installed or reproduced.

### MEASURED CONSUMER IMPACT

- **`pdf-worker` and `agent-worker`: ZERO, and it is asserted rather than assumed.** The
  key is emitted ONLY for a member that declares assets, so both committed manifests are
  BYTE-UNCHANGED — `fleetbundles.test.mjs` asserts `assets === undefined` for both, and
  the byte-identity arm for both members passes untouched.
- **`DIST`: the installer gains a list it can act on.** The parts a member needs, with a
  sha256 each, in the file the installer already reads to verify the bundle. That is
  strictly more than it had; nothing it reads today moved.
- **The guard's own arms:** four new ones on a SYNTHETIC member in a temp directory
  (swap / vanish / declared-but-unrecorded / recorded-but-undeclared), each armed and
  each required to go RED, with restores verified by content and sha256 — the section-4
  discipline this suite already applies to every other arm.

### 2 · RESPONSES

**FLEET · 2026-09-12 · ACCEPT, answering for itself — the "dormant" line above is a stale
premise, corrected here rather than left to mislead the resolver: FLEET has been a STANDING
AREA SESSION since 2026-09-10 (kickoffs/FLEET.md, BOB's spawn), and it ran FL-10 and FL-6 in
the two days this item was in flight.** The acceptance is the owner's and it is MEASURED,
not extended as courtesy:

- **The arm was re-run in FLEET's own worktree on the merged tree before this response was
  written: `fleetbundles.test.mjs` 87 pass / 0 fail, exit 0 read unpiped**, three members
  discovered, both prior manifests byte-unchanged exactly as §MEASURED CONSUMER IMPACT
  asserts, and the comment-only/tree-shake pair holding on `ocr-worker` too.
- **The design follows the guard's own law rather than adding a second one:** `assetsOf` is
  ONE function read by the build step, the manifest and the gate (the recipe's own rule);
  the key is emitted only where declared, so absence stays free; and MISSING-is-staleness
  is the right asymmetry against `vendoredInputs` for precisely the stated reason — an
  upload part is COMMITTED, so absent is never the fresh-checkout condition, it is a member
  nobody can install or reproduce.
- **This closes a real hole in FL-9's sentence and FLEET says so plainly:** the guard
  covered every line of a member's source and none of the bytes that decide what
  `ocr-worker`'s output says. "A stale artifact FAILS instead of shipping" now covers the
  parts an artifact cannot swallow. The extension is welcome ON the pattern, and the
  precedent it sets — a non-FLEET area extending the guard through the IC protocol with
  measured impact and its own arms — is the process working, not a boundary crossed.
- **One forward obligation FLEET takes from this, not asks of the proposer:** `newgroup`'s
  fetch-and-verify of per-member assets (DIST's half, D-297/D-298 lineage) should treat an
  asset hash mismatch exactly as it treats a bundle hash mismatch — refusal, never a
  partial install. FLEET will hold that line when the installer half lands.

*(awaited — `DIST`)*

### RESOLUTION — ACCEPTED, **I4 1.1.0 → 1.2.0**, 2026-09-14 by CONDUCT #9

Additive on the member manifest (the `assets` block, emitted only where declared, so absence
stays free), with the owner's answer on the row (FLEET, `99c0513`: the extension is welcome ON
the pattern — the process working, not a boundary crossed) and two production successes since
landing (it forced DS-3's manifest refresh and correctly passed `f5872c7`). DIST's awaited
answer is CONVERTED to the named forward obligation its own lineage already carries (D-297/
D-298: `newgroup` treats an asset-hash mismatch exactly as a bundle-hash mismatch — refusal,
never a partial install; FLEET holds that line when the installer half lands) — nothing is
asked of DIST today, and an objection from DIST reopens this row rather than being overridden.
`INTERFACES.md` bumped in the same act.

## IC-82 · I4: THE RELEASE MANIFEST LEARNS HOW EACH MEMBER IS UPLOADED — per-member `compat` (date + flags) and per-part module `type` enter `RELEASE.json` AND the signed fleet statement (`NS_FLEET/2`), so the installer can install the fleet without guessing a single runtime fact · PROPOSED 2026-09-14 (DIST #2, D-297 / DS-1's installer half) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** **I4** (plane → installer, the release artifact), **1.0.0 STABLE**, owner `DIST`.
- **Proposer:** DIST #2 (session worktree `dist-ds2`), 2026-09-14. Id minted through
  `tools/mintid.mjs` (IC-82), the shared-ledger allocator — the IC-64 lesson's instrument.
- **Consumers to answer:** `FLEET` (owner of the members and their configs — the truth this
  change copies into the manifest), `CONTENT-PDF` (owner of I6's code; ocr-worker's parts are
  the forcing case), `DIST` (owner, proposing). CONDUCT resolves.

### The change, in one sentence

Each `fleet[]` entry in `RELEASE.json` gains `compat: { date, flags }` copied from the member's
own `wrangler.jsonc`, each `parts[]` entry gains `type` (`CompiledWasm` / `Data` / …) copied from
the member's module rules, and `fleetStatement` moves `bio-release-fleet/1` → `/2` to carry both —
so everything an installer must know to upload a member is stated by the release and covered by
`fleetSig`, never inferred.

### The forcing measurement, 2026-09-14

The members do NOT share one upload shape: `agent-worker` and `pdf-worker` carry
`nodejs_compat`, **`ocr-worker` carries no flags at all**, and its two upload parts need the
`CompiledWasm` / `Data` module types whose absence was exactly the deploy defect `3607b5c` fixed
three days ago ("its own rule left wasm with NO loader at all"). An installer that infers compat
from a shared constant or part types from file extensions re-creates that defect class inside
every group's account — a flipped flag or a mistyped part changes runtime behaviour, which is why
both belong INSIDE the signed statement, not beside it.

### What the installer half then builds against this (stated so consumers see the whole move)

`newgroup` fetches each member asset (+ parts) from the same release channel it already uses,
verifies each `sha256` AND `fleetSig` over the statement REBUILT from the manifest (the
producer/verifier agreement `fleetStatement` exists for), uploads each member with its `services`
templated from the instance slug (the `selfBinding` shape, D-292's rule), and **degrades
per-member the way `noSelf` degrades**: an install is never refused over a member it can add
later, and what was left out is SAID. `bindings: []` on the installer itself is untouched.

### The one open question, with the proposer's recommendation

Enrich the manifest **in place at 0.57.0** (every asset byte-identical, statement `/2`, re-signed)
rather than cutting 0.58.0: a version is a promise about BYTES and no byte changes; the statement
version distinguishes the formats; and the change is additive IN FACT for the one live consumer —
the deployed installer reads `version` / `sha256` / `asset` / `sig` and touches neither `fleet[]`
nor `fleetSig` (measured at `newgroup/src/index.mjs`, `fetchRepoManifest`/`fetchRepoAsset`).
COUNTER with 0.58.0 if a manifest re-signed at the same version reads as two promises under one
number to any consumer this proposer cannot see.

### RESPONSES

**FLEET · 2026-09-14 · AGREE — on both halves, and the agreement is MEASURED against the
configs this change copies, which are FLEET's files and FLEET's truth:**

- **The forcing measurement reproduces in the owner's own tree.** `agent-worker` and
  `pdf-worker` both carry `nodejs_compat`; `ocr-worker` carries `compatibility_date` and NO
  flags — **and that absence is DELIBERATE and commented at the config itself** ("the engine
  glue references nothing from node (measured)"), so `flags: []` in the manifest is a TRUE
  FACT about that member, not an omission for anyone to "fix" into `nodejs_compat` later.
  The `CompiledWasm`/`Data` rules and the `3607b5c` defect they answer are exactly as the
  entry states, receipt in `ocr-worker/wrangler.jsonc`'s own comments.
- **Both facts belong INSIDE the signed statement, and FLEET wants them there:** a flipped
  flag or a mistyped part changes runtime behaviour in a group's own account, which is the
  attribution-grade consequence the fleet signature exists to cover. This completes the
  chain the guard half already built — FL-9/FL-10 prove the BYTES fresh, IC-79 proves the
  PARTS fresh, and IC-82 makes the UPLOAD FACTS part of the same signed promise.
- **One condition, stated as the owner of the copied truth: COPY, NEVER DEFAULT.** The
  assembler must copy `compat` and `type` from the member's own config at cut time and
  REFUSE assembly for a member whose config does not state them — a default supplied at
  assembly is the installer-guessing defect moved one layer up, wearing the signature it
  should have been refused by. (`ocr-worker`'s empty `flags` is a stated `[]` in its
  config's own terms, not an absence — the refusal is for a missing `compatibility_date`
  class of gap, not for an empty list.) DIST never editing the member configs is already
  the entry's own rule; FLEET holds it.
- **In-place at 0.57.0: AGREE, verified independently rather than taken from the entry.**
  The deployed installer's own source consumes `version` / `asset` / `sha256` / `sig` and
  touches neither `fleet[]` nor `fleetSig` (`fetchRepoManifest` / `fetchRepoAsset`, read
  2026-09-14), every asset stays byte-identical, and `bio-release-fleet/1 → /2` is what
  distinguishes the two manifest formats for the consumer being built. A version is a
  promise about bytes and no byte moves; FLEET sees no consumer the proposer cannot.

**CONTENT-PDF — AGREE, ANSWERED FOR BY CONDUCT (the area is dormant; protocol step 3,
recorded as CONDUCT answering FOR the area and never as the area agreeing), on a
measurement taken before answering:** zero CONTENT-PDF code reads `RELEASE.json`, the
fleet statement, or `fleetSig` (grepped over both members' `src/` and `scripts/`), so the
area has no reader to break; and both member configs ALREADY STATE every truth the
manifest will copy — `ocr-worker/wrangler.jsonc` carries `compatibility_date` and the
explicit `CompiledWasm`/`Data` module rules (the very rules whose absence was `3607b5c`'s
deploy defect), `pdf-worker`'s carries date and flags. The copy-never-default condition
FLEET attached is precisely what protects this area: a member whose config went silent is
refused at assembly rather than guessed at inside a group's account. The forcing case is
welcome — ocr-worker's parts are exactly why the types belong inside the signature.

### RESOLUTION — ACCEPTED, **I4 1.2.0 → 2.0.0**, 2026-09-14 by CONDUCT #9

MAJOR, deliberately, on IC-3's settled reasoning even at measured-nil impact: the signed
fleet statement moves `bio-release-fleet/1 → /2`, and a signed statement's format is a
wire contract — a /1 verifier meeting a /2 release is a break by definition, whatever the
measured population (which is: zero — FLEET independently verified the deployed installer
consumes `version`/`asset`/`sha256`/`sig` and touches neither `fleet[]` nor `fleetSig`,
so the /2 statement's first verifier is the consumer D-297 now builds). The manifest keys
themselves are additive; the statement bump is what gets versioned. All three consumers
are on the row: DIST proposing, FLEET's AGREE with the copy-never-default condition
(`0b704cf`), CONTENT-PDF answered for above with its measurement. `INTERFACES.md` bumped
in the same act. D-297's build is UNGATED by this resolution.

### IC-82 ADDENDUM · 2026-09-14, DIST #2, AT ENACTMENT — **THE IN-PLACE PREMISE WAS FALSIFIED BY THE FIRST DRY-RUN, AND THE ENACTMENT MOVES TO THE ALTERNATIVE THE ENTRY NAMED**

The accepted recommendation ("in place at 0.57.0, every asset byte-identical") rested on a
premise the assembler's own freshness guard falsified the moment it ran: **`agent-worker`'s
committed bundle has moved since the 0.57.0 cut** (manifest: `5464ec8a…`, 53,258 B; tree,
proved fresh: `bce5043b…`, 57,379 B — FL-6's cascade landed into the member after `ba05e9c`).
Re-signing at 0.57.0 would therefore publish a SECOND, DIFFERENT 0.57.0 for that member —
the immutability class `VERSION_ALREADY_RELEASED` refuses for the plane, arriving one asset
over — and keeping the OLD bundle in the manifest would refuse the freshness guard instead,
correctly. So the format change rides a REAL version: **0.58.0, the full release ceremony**,
which the entry offered as the COUNTER shape and nobody preferred only on cost. The format
halves of the ACCEPTED change are untouched; this addendum changes only the vehicle. The
premise's failure is recorded here rather than worked around because a record that quietly
adjusts its own accepted reasoning is the drift class this file exists to prevent.

## IC-83 · I5: THE CONTENT ROW — a first-class `content` table, minted lazily on first edge, content-addressed, so a leg can point at a PART of a document · PROPOSED 2026-09-14 (BOB #10, enacting DEC-23 / D-164 under Bob's rulings of 2026-09-14) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I5 (the store schema), currently **1.10.0 STABLE**
- **Proposer:** session BOB #10, 2026-09-14, from `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6
  (the mechanism, option (c)) under the doctrine Bob ruled the same day (§5.1–5.8), the design
  being `BIO_Content_Framework_v0_10.md` Part II §18 piece 1
- **Owner to land it:** `RECORD`
- **Consumers to answer:** `RECORD` (owner), `UI` (the composer emits the extent; the leg display
  shows it), `FRAMEWORK` (dormant — CONDUCT answers for it in writing; the extent grammar is IC-1's
  union, FRAMEWORK's), `SKILL` (the assistant will mint rows later, 5.7)
- **Change class:** ADDITIVE — one new table, one new index, one nullable column on two existing
  tables, populated by the writer; nothing existing changes shape → MINOR bump (1.11.0)

**What.** A table `content`, placed BEFORE the `host_governor` block and added to `op=purge` in
BOTH arms (it carries `bundle_id`), rows FIRST-CLASS (an edge depends on them: never rewritten by
re-promotion, marked `stale` when the capture's chain moves, never deleted):

    content_id      TEXT PRIMARY KEY   -- hash(capture_sha, canonical extent, chain) — content-addressed:
                                       --   two citers of one passage get ONE row by construction; no allocator
    capture_sha     TEXT NOT NULL      -- the document (the register's trust root)
    bundle_id       TEXT NOT NULL      -- purge + the compiler's join
    extent_kind     TEXT NOT NULL      -- document | pdf-page | sheet-cell | slide-shape | doc-para
                                       --   (IC-1's union unified with attestation's document|page|region;
                                       --    `dom` REFUSED by name until CONTENT-HTML produces it)
    extent          TEXT NOT NULL      -- the per-arm fields as JSON (page+rect · sheet+cell · slide+shape · para+run)
    ref             TEXT NOT NULL      -- IC-1's REQUIRED human form ("page 14, top half"; "Sheet2!B7")
    chain           TEXT               -- the transcription chain covering the extent, as it stood at mint
    derivation_cap  TEXT               -- min over the chain's derivation steps over this extent; NULL = undetermined, STATED
    minted_by       TEXT NOT NULL      -- a member id, 'plane' (extraction at promote), or a machine credential (5.7)
    at              TEXT NOT NULL
    stale           INTEGER NOT NULL DEFAULT 0   -- the capture's chain moved since mint; the row and its edges resolve, and say so

plus `inquiry_basis.content_id TEXT` and `inquiry_basis_version_legs.content_id TEXT` (nullable
during CHANGING, NOT NULL at SETTLED), each a foreign key by convention to `content.content_id`.
The bundle-grain `target_id` columns stay: the content row is the leg's REFERENT, the bundle its
CONTAINER, and the compiler joins through `bundle_id` as it does everywhere (D-222 rule).

**Rules the writer enforces (each a refusal in the catalogue and a control in the suite):**
an extent outside its capture's page set is refused by name (needs the page count I2 already
carries at acquire — stored on mint); an extent with no extraction chain is refused; an unknown or
unparseable kind covers nothing and mints nothing; `dom` refused while no producer exists; a
whole-document leg mints a `document`-extent row — so EVERY leg targets content and there is one
target vocabulary (5.3: no `unstated`; a citation with no stated part means the whole document);
a legacy leg is backfilled to its `document` row on first read, deterministically, because the id is
a hash; re-extraction marks the row `stale`, never deletes it; a machine credential may mint
(EXTRACT) and may never attest (C-35.10 unchanged); purge clears in both arms.

**What a leg may now claim (5.1, portion-scoped).** `earnedBasisRegistry` keys by content row;
the transcription ceiling is `gradeCeiling(chain, extent)` — an attestation covering the extent
raises it to B, a page attestation does not cover a document-extent row; the CONNECTION grade of a
non-`document` row is UNDETERMINED and stated until readings carry position (I2), never borrowed
from the whole document; the leg's capture grade ≤ `captureBound` as today.

**Why.** DEC-23 (content is the unit; a whole document its widest extent); D-164 (every edge
addresses a bundle or a capture; the address IC-1 emits is consumed by no edge); `schema.mjs`'s own
stated rule that the extent column arrives with its writer. Bob's rulings of 2026-09-14 fix the
open doctrine: a portion citation refers only to its portion; no `unstated`; the connection carries
the reference pair; the assistant may mint. The alternatives and why (c): the study's §2 and §6.

**Consumers, and what changes for each.** RECORD: the table, the writer on `checkInquiryBasis`/
promote, the reader `earnedBasisRegistry`, purge, hygiene, the catalogue. UI: the frontmatter
composer emits `extent` per leg and the display shows `ref` and jumps the viewer to the page or
cell (UI's item). FRAMEWORK: nothing moves on I2 for this IC; the position-in-reading change
(`reading_refs` gains WHERE) is a LATER IC on I2 that 5.4's determining pair and content-grain
connections depend on. SKILL: none until the machine-mint item.

**Lands first, by design:** the `pdf-page` and `document` arms on the basis leg (writer) and the
earned-basis reads (reader) — `checkAnchor`, `extentCovers`, `derivationCap(target)` and
`gradeCeiling` already exist for `pdf-page`, and DEC-4 already requires an OCR citation to carry
page and rectangle. The other three arms' `covers` follow. D-225's caps precede any content-grain
QUERY arm (D-222 stage C), not this IC.

### RESPONSES — 2026-09-14, recorded by CONDUCT #10

- **RECORD** (owner): AGREE — no live RECORD session; CONDUCT, as the integrating session that holds RECORD's queue, agrees on the owner's behalf and lands it through REC-82..REC-85 (rows in `QUEUE.md`).
- **UI**: AGREE, answered FOR by CONDUCT in writing (no live UI session): measured 2026-09-14 — `civicos-ui/app.html` drives `op=promote` (10 sites) and `op=earnedbasis` (2) and reads no `inquiry_basis` column directly; the composer and display migration is UI-61, and until it lands a leg with no `extent` is a `document` leg, so nothing shipped breaks.
- **FRAMEWORK** (dormant): NOT-AFFECTED for this IC, answered FOR by CONDUCT in writing per the protocol's step 3 — I2 does not move (the extent grammar is IC-1's union, unchanged); the position-in-reading change is its own later IC on I2 (FW-17).
- **SKILL**: NOT-AFFECTED until the machine-mint item (SK-7), answered FOR by CONDUCT — the investigative run's suggested legs default to `document` (REC-84).

### RESOLUTION — ACCEPTED, **I5 1.10.0 → 1.11.0**, 2026-09-14 by CONDUCT #10

MINOR, as proposed: one new table, one index, one nullable column on two tables, populated by the writer; nothing existing reshaped. The registry is marked CHANGING now (step 4) and returns to STABLE at SETTLED when REC-82 (the table and the writer on the `pdf-page` and `document` arms) and REC-83 (the reads) have landed and the two nullable columns are NOT NULL — the IC's own SETTLED condition. `INTERFACES.md` bumped in the same act. Every consumer is on the row above; the two answered-for are named as such. REC-82 is UNGATED by anything but this resolution and is spawned at this drain.

### AMENDED at REC-82's landing — 2026-09-14 by CONDUCT #10 (two facts the landing established; the version stays 1.11.0, still CHANGING)

1. **`page_count INTEGER` is a column of `content`.** IC-83's Rules prose required it ("the page count I2 already carries at acquire — stored on mint") and its column list omitted it; the worker implemented the sentence and flagged the omission rather than widening. Recorded here as the column list's correction, not a change of shape. Its source is complete only where a reading persists a page count — D-345 / CAP-9.
2. **A leg whose target is an INQUIRY has no capture and no part to point at (DEC-21), and a leg whose target information object the record holds no bytes of has nothing to address: `content_id` is legitimately NULL in both cases, STATED as which, and a leg naming a PART of an inquiry is refused.** IC-83's "every leg targets content" was written about the information arm; this is the rule for the other, decided by CONDUCT as mechanism (reversal costs one refusal arm). The reads (REC-83) state which NULL, never collapse them.

## IC-84 · I3: THE BASIS LEG NAMES ITS EXTENT — frontmatter and the target grammar admit a PART of a document, and two reads answer at content grain · PROPOSED 2026-09-14 (BOB #10, the op half of IC-83) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I3 (plane → UI, the op contracts), currently **14.0.0 STABLE**
- **Proposer:** session BOB #10, 2026-09-14, with IC-83
- **Owner to land it:** `RECORD`
- **Consumers to answer:** `UI` (the composer and the leg display), `DIST` (served surfaces —
  NOT-AFFECTED expected), `SKILL` (the investigative run writes suggested legs — its legs gain an
  extent or default to `document`), `RECORD`
- **Change class:** ADDITIVE → MINOR bump

**What.** (1) `bundle.md` frontmatter: a basis leg gains an optional `extent` — one of IC-1's arms
(`{kind: pdf-page, page, rect, ref}` etc.) or `{kind: document}`; absent = `document` (5.3). C-2.8
and C-25.10 keep the bundle-id target grammar and ADD the extent grammar (one checker, one `covers`
per arm, called from the op and the store); a content id whose row does not exist is refused.
(2) `op=promote`: mints or finds the content row per leg (the writer of IC-83). (3) `op=earnedbasis`
answers the per-extent ceiling and states UNDETERMINED for the connection axis of a portion leg.
(4) a NEW fixed-key read op named `content` (not yet in the dispatch table — it enters `PLANNED_OPS` with the item that builds it;, by `content_id`; member and read classes): the row, its
`ref`, its chain and cap, its `stale` flag, and the attestations covering it — no predicate, no
paging (D-222's fixed-key rule; the query arm is stage C, later). (5) `op=attesttext` unchanged;
its read-back already emits the `pdf-page` form.

**Two authored acts Bob ruled that are NOT in this IC and get their own:** NARROW (5.3 — a member
makes an existing citation more specific: a new basis version against a narrower content row, the
old retained) and TRANSCRIBE (5.2 — a member selects a portion and types its text: a new step kind
`member(handle)` with cap undetermined, attestable by a second member, refused to the transcriber's
own attestation). Both need the composer's selection surface first (UI), so they are decomposed
behind IC-83/IC-84 rather than folded in.

**Why the same day as IC-83:** the column arrives with its writer, and the writer is the op.

### RESPONSES — 2026-09-14, recorded by CONDUCT #10

- **RECORD** (owner): AGREE — as for IC-83; lands through REC-83 (the reads and `content read`) and REC-84 (the frontmatter and version legs).
- **UI**: AGREE, answered FOR by CONDUCT — the composer emits `extent` per leg and the display shows `ref` in UI-61; absent `extent` = `document`, so the shipped composer keeps working through CHANGING.
- **DIST**: NOT-AFFECTED, answered FOR by CONDUCT on a measurement (DIST #2 is idle): `newgroup/src/release.mjs` mentions the basis only inside the embedded plane copy that regenerates at the next cut; no served surface reads a leg.
- **SKILL**: AGREE, answered FOR by CONDUCT — the investigative run's suggested legs default to `document` (REC-84); the machine-mint act is SK-7 with its own IC.

### RESOLUTION — ACCEPTED, **I3 14.0.0 → 14.1.0**, 2026-09-14 by CONDUCT #10

MINOR, as proposed: an optional `extent` on a basis leg (absent = `document`), a new fixed-key read `content read`, `op=earnedbasis` answering per extent and stating UNDETERMINED for a portion leg's connection axis, `op=attesttext` unchanged. CHANGING now; SETTLED when REC-83 and REC-84 land and UI-61 confirms its migration. `INTERFACES.md` bumped in the same act. NARROW and TRANSCRIBE are deliberately NOT in this IC and carry their own (REC-86, REC-87).

### AMENDED 2026-09-14 by CONDUCT #11 at REC-83's landing — the READ half is BUILT; still CHANGING

REC-83 landed at `cc8187d`: `op=earnedbasis` per extent, the fixed-key `op=content`, `earnedBasisRegistry` at content grain, `ensureLegContent` wired. Two facts the text above did not state and the landing did: (1) the two legitimate NULL `content_id` cases are carried as CODES on the leg (`INQUIRY_TARGET`, `NO_BYTES_HELD`), decided in `ensureLegContent` and never re-derived by a reader; (2) the leg read is UNCAPPED, deliberately — it enumerates exactly the population the existing `asked` read enumerates uncapped, and capping one and not the other would publish two populations in one answer. **What this IC's own sentence about the capture axis inherits from IC-83 is now known to be aspirational: `captureBound` has no caller (D-349), so a leg's capture grade is NOT today bounded by transcription fidelity; that enforcement is REC-88 under its own IC on I3, not a widening of this one.** Status stays CHANGING until REC-84 (the writer half) lands and UI-61 confirms the composer emits `extent`; SETTLED is CONDUCT's to write then.

### AMENDED 2026-09-14 by CONDUCT #11 at REC-84's landing — the WRITE half is BUILT; the grammar column gains the field its own refusal presupposed; still CHANGING

REC-84 landed at `7087905`: the leg grammar at both grains (C-2.8, C-25.10, one checker), the version-leg `content_id` writer, `version_content[]` on `op=promote`, C-45.5/C-45.6. **Amendment to (1):** a basis leg — like a version leg — may carry an optional `content_id` (64 lowercase hex, the minter's own shape) naming an already-minted part outright, as an alternative to the flattened `extent_*` fields; (1)'s sentence "a content id whose row does not exist is refused" presupposed the field and the column of the grammar did not list it. CONDUCT reads the IC as having required it and states it here rather than treating the worker's landing as a widening. **Not moved, and named as debt:** no READ op serves a version leg's referent (`op=basisversions` was not widened because this IC does not name it) — D-350, RECORD's, with its interim law. Status stays CHANGING until UI-61 confirms the composer emits `extent`; SETTLED is CONDUCT's to write then, together with IC-83's NOT NULL move for the two `content_id` columns once the backfill has run (not yet rowed — rowed when UI-61 lands).
---

## IC-85 · I1: A **DIRECT** CAPTURE MAY NOW HAVE TWO ADDRESSES AND TWO HOPS — the Google Drive export enters as `via:"direct"` with the Drive link as the DOCUMENT address, the composed export address as the RETRIEVAL locator, and a second hop carrying the export address, the export format and Google as producer · PROPOSED 2026-09-14 (CAP-8, enacting Bob's Google Drive ruling of 2026-09-14) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I1 (bytes → content), currently **1.3.0 STABLE**
- **Proposer:** CAPTURE, worker `agent-ac12c46e7df4b4d96`, 2026-09-14, from QUEUE CAP-8
- **Owner to land it:** `CAPTURE` (owner and proposer)
- **Consumers to answer:** `CONTENT-HTML` (dormant), `CONTENT-PDF` (dormant),
  `FRAMEWORK` (dormant) — all three dormant, so CONDUCT answers on their behalf
  IN WRITING per the protocol's step 3, recorded as CONDUCT answering FOR each
  area and never as the area agreeing.
- **The id was MINTED with `node tools/mintid.mjs IC`** (floor IC-84).

### WHY THIS IS AN IC AT ALL, STATED FIRST BECAUSE IT IS THE CLOSE CALL

**No field is renamed, reshaped or removed, and nothing a consumer reads today
answers differently for any capture it has ever seen.** The honest reason this is
filed rather than waved through is that I1 states two INVARIANTS in prose which
this change makes false, and both of them are in the two places the registry's
own "what you may NOT change without the protocol" paragraph names — §4's
frontmatter field value domains and §5's `captured_locators`:

1. **§4b** describes the chain as one hop, with *"An archive capture appends a
   second, weaker hop"* as the sole exception. After CAP-8 a `via:"direct"`
   capture may carry two hops. A consumer reading `chain.length === 1` as *"this
   is a direct capture and the locator is the document address"* is now wrong.
2. **§5** says of `retrieval_locator`: *"for a direct capture they are equal"*.
   For a Drive capture they are not: `address`/`address_norm` hold the Drive link
   and `retrieval_locator` holds the composed export address, with `via` still
   `direct`. `schema.mjs`'s own column comment carries the same sentence and is
   corrected in the same commit.
3. **§4** says of `document.locator`: *"For an archive capture this is the replay
   URL"*. It is now also the export address for a Drive capture.

An invariant a consumer may reasonably have keyed on is a shape, whether or not it
was ever a field. **A fence tighter than its rule is not a safer fence; a contract
looser than its text is not a safe contract either.**

### WHAT CHANGES, precisely

**(a) `document.provenance_chain` may carry a second hop on a `via:"direct"`
capture.** Hop 0 is unchanged, byte for byte. The second hop is built by
`driveHop` in the new `bio-plane/src/drive.mjs`:

```
{ who:      "Google Drive (Google Drive export)",
  asserts:  "these bytes are Google's ODT conversion, made at export time, of the
             Drive document <id>, served for <export address> at <retrieved>. The
             document itself lives at <drive address>, which is the address the
             record keeps.",
  evidence: "export address …; export format odt (application/vnd.oasis.opendocument.text);
             producer Google Drive export; the export address was COMPOSED BY THIS
             INSTANCE from the file id and the kind carried in <drive address>, and no
             part of it was read from the request (D-112); …; confirmed from the bytes: …",
  bound:    false,
  unsigned_reason: "…the bytes are not the original file: they are Google's conversion
                    performed at fetch time…",
  via:      "direct",
+ export_address:  "<https://docs.google.com/document/d/<id>/export?format=odt>",
+ export_format:   "odt" | "ods" | "odp",
+ producer:        "Google Drive export",
+ drive_file_id:   "<id>",
+ drive_kind:      "document" | "spreadsheet" | "presentation",
+ document_address:"<the Drive link, verbatim>",
+ export_format_confirmed: true | false | null }
```

**THE THREE FACTS THE ITEM OWES — export address, export format, producer — ARE
THE FIRST THREE NAMED KEYS.** They are in `asserts`/`evidence` as prose because a
hop is read by people, and as fields because a consumer must not have to parse
prose to answer *"what format is this and who produced it"*. **Extra keys on a hop
are precedented, not novel:** `archiveHop` has carried `unsigned_reason` beyond
I1 §4b's five fields since 0.52.0 and no consumer noticed.

**(b) `captured_locators` for a Drive capture:** `address` = the Drive link
**exactly as the caller supplied it**, `address_norm` = that link through
`normalizeAddress`, `retrieval_locator` = the composed export address, `via` =
`direct`. **The KEY `(address_norm, capture_sha, via)` is untouched.**

**(c) `document.locator`** = the export address (what was fetched). Unchanged in
meaning; newly reachable for a second reason.

**That is the whole shape change.** `document.capture.*` — `sha256`, `bytes`,
`content_type`, `method`, `grade`, `actor_class`, `transport` — is untouched.
`profile`, `reading`, `authority_state`, `authority_basis`, `via`, `origin`,
`parts`, `renditions` are untouched. **The register (§1) and `op=capture` (§3)
are untouched.**

### WHY, AND IT IS BOB'S RULING IN ONE SENTENCE

*"A link to a Google Drive file should keep the link and export an OpenDocument
version that the content is extracted from."* (2026-09-14, framework Part II §16.)
Keeping the link and harvesting the export IS a two-address capture. D-96 already
built that shape for the archive; CAP-8 uses it for a second reason rather than
inventing a second mechanism, which is why the diff is small enough to argue about.

### `via` DOES NOT GAIN A TERM, AND THAT IS A DECISION

The obvious alternative was `via: "google-drive"`, which would have made every
existing consumer's `via === "direct"` test skip Drive captures silently. **That
is worse in the direction this project cares about**: the fetch IS direct — we
asked Google and Google answered us, with no party in between — so a third term
would assert a directness difference that did not happen, and the identity/bracket
arm (`store.mjs resolveLinks`, `WHERE via = 'direct'`) would stop seeing Drive
captures with nothing saying why. Grade tracks DIRECTNESS, never technique; the
conversion is technique and it is disclosed on the hop. **`via` stays the closed
two-term set it was.**

### CONSUMER IMPACT, MEASURED ON THIS TREE

- **`retrieval_locator` HAS NO READER — measured.** `grep -rn "retrieval_locator\|retrievalLocator"`
  over `bio-plane/src`, `bio-plane/checks` and `civicos-ui` returns **9 hits, every
  one a WRITE, a column declaration or a comment**. The identity/bracket arm that
  §5 warns about (`resolveLinks`, `store.mjs`) selects `capture_sha,
  first_retrieved, last_retrieved, observations` and **not** `retrieval_locator`,
  so the split is invisible to it — and correctly so: two Drive exports of one
  document hashing equal across an interval is a genuine bracket.
- **`C-18.9`'s chain walk is UNAFFECTED.** It requires each hop to be an object
  with a non-empty `who` and reads no other field; the Drive hop satisfies it.
  Extra keys are ignored, exactly as `unsigned_reason` has been.
- **`civicos-ui/**`: ZERO edits, measured** — `grep -rn "provenance_chain" civicos-ui/`
  returns **0 hits**; the UI does not read chain hops field-by-field. `node
  civicos-ui/test/run.mjs` from the repo root, exit 0, unchanged.
- **Every existing battery assertion over the chain stays true**, including
  `acquire.test.mjs`'s `provenance_chain.length === 1` (its locator is not a Drive
  address) and `daemon-token.test.mjs`'s `=== 2` for the archive arm. **Nothing was
  exempted and nothing was corrected**, because nothing became wrong.
- **`pdf-worker/`, `ocr-worker/`, `newgroup/`: 0 hits** for `provenance_chain` or
  `retrieval_locator`.

### WHAT A CONSUMER MUST STOP ASSUMING, stated as the migration

One sentence, and it is the whole migration: **a capture's DOCUMENT address is
`captured_locators.address` (or the chain's `document_address`), never
`document.locator`, and `via` does not tell you whether the two are equal.** A
consumer that wants "the address this capture answers to" already had to read it
from `captured_locators` to be right about archive captures; CAP-8 adds a second
case to a rule it already had to follow.

### THE ALTERNATIVE THAT WAS REJECTED, AND WHAT REVERSING THIS COSTS

The alternative was to keep the Drive link as `document.locator` and put the
export address only on the hop — no §5 change, no IC. **It was rejected because it
would make `document.locator` a lie**: I1 defines it as the retrieval locator,
what was actually fetched, and we did not fetch the Drive link. A record that
names an address it did not fetch is the record claiming more than it can support,
which `CLAUDE.md` ranks worse than a missing feature.

**Reversing this costs:** deleting `src/drive.mjs`, two regions in `index.mjs`'s
acquire path, one family in the check catalogue and two suites. No schema
migration, no stored data reshaped, no other area's code. The captures already
filed stay valid and stay readable; they would simply stop being produced.

### RESPONSES — 2026-09-14, recorded by CONDUCT #11 at CAP-8's integration

- **CAPTURE** (owner and proposer): AGREE — landed on `worktree-agent-ac12c46e7df4b4d96` (e310c51 + db66cfc + cd67364), integrated by CONDUCT #11.
- **CONTENT-HTML** (dormant): NOT-AFFECTED, answered FOR by CONDUCT on the proposal's own measurement — `provenance_chain` has no field-by-field reader in the plane's HTML path; the published (`/d/e/<id>/pub`) Drive shape stays on the ordinary HTML path untouched.
- **CONTENT-PDF** (dormant): NOT-AFFECTED, answered FOR by CONDUCT — `pdf-worker/` and the PDF entries read bytes and the chain's `who`; a Drive export is ODF, which the office entries (COFF-10) read, never the PDF path.
- **FRAMEWORK** (active for FW-17 only): AGREE, answered FOR by CONDUCT in writing — I2 is unchanged; the Drive hop is I1's, and Part II §16's three falsified sentences are corrected at this integration under the §4.3 same-landing fold.
- **DIST**: NOT-AFFECTED, answered FOR by CONDUCT on a measurement (DIST #2 idle) — `newgroup/` has 0 hits for `provenance_chain` or `retrieval_locator` outside the embedded plane copy that regenerates at the next cut.

### RESOLUTION — ACCEPTED, **I1 1.3.0 → 1.4.0**, 2026-09-14 by CONDUCT #11

MINOR, as proposed: a `via:"direct"` capture may carry a second hop (the Drive export hop, its facts DERIVED at acquire and refused from a caller by C-48.1), and `retrieval_locator` may differ from the document address on a direct capture — `captured_locators.address` (or the chain's `document_address`) is the document address, never `document.locator`, and `via` does not say whether the two are equal (the migration sentence, verbatim from the proposal). No field is renamed, reshaped or removed; no existing assertion over the chain became false (measured: `acquire.test.mjs`'s `length === 1` and `daemon-token.test.mjs`'s `=== 2` both hold). `via` gains NO term — a conversion is technique, disclosed on the hop, and the closed set stays closed (the proposal's own ruling, kept). **Two corrections to I1's registry text land with the bump:** §4b's "one hop, the archive capture the sole exception" and §5's "for a direct capture they are equal" are struck for the two-hop, two-address direct case; and **an inaccuracy CAP-8 found and pinned but did not correct** — I1 §4 lists `via` as a TOP-LEVEL field of the acquire document, and the plane has never emitted one there (it lives on the hop; pinned by an assertion in `drive.test.mjs`) — the row is corrected to say where `via` actually lives. CHANGING until the registry text is corrected in the same commit (it is: `INTERFACES.md` I1 1.4.0); SETTLED when the next DIST deploy serves the handler live (VF-7's class — a live probe of the export path on the project instance, which CAP-8 could not run because nothing was deployed).
---

## IC-86 · I2: readings carry POSITION — `parse()` entities and `reading_refs` gain WHERE a reference was read, in IC-1's extent vocabulary · PROPOSED 2026-09-14 (FW-17)

- **Interface:** I2 (content → framework, structure), currently **2.0.0 STABLE**
- **Proposer:** session FW-17, 2026-09-14, from `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md`
  §1.9 (the hard dependency) and §5.1/§5.4 as Bob ruled them, the design being
  `BIO_Content_Framework_v0_10.md` Part I §7 (what `parse()` emits) and §8.1 (connection grade),
  and Part II §18 piece 1's closing paragraph — *"content-grain connections are impossible until
  readings record WHERE a reference was read, which is a change to the structure interface (I2)
  on the framework's side."* This is that change.
- **Owner to land it:** `FRAMEWORK` (the interface's owner and, for `parse()`, its producer of
  readers — re-activated for FW-17)
- **Consumers to answer:** `RECORD` (the `reading_refs` projection and everything derived from
  it — resolutions, connections, the terms index), `CONTENT-PDF` (dormant), `CONTENT-OFFICE`
  (dormant), `CONTENT-HTML` (dormant). CONDUCT answers for the dormant three in writing at
  this item's integration, protocol step 3.
- **Change class:** ADDITIVE → **MINOR bump (2.0.0 → 2.1.0)**. One optional field on an entity;
  one optional field on the context a reader is given. A reader that emits neither, and a
  consumer that reads neither, sees 2.0.0 exactly.

### What

**(1) An entity a content type emits MAY carry `source`, and it is IC-1's union unchanged.**

    entity: { key, kind, label, facts, source? }

    source: { kind: "pdf-page"   , ref: "p.7"       , page: 6, rect: [x0,y0,x1,y1]|null }
          | { kind: "sheet-cell" , ref: "Sheet1!B14", sheet: "Sheet1", cell: "B14" }
          | { kind: "slide-shape", ref: "slide 7"   , slide: 7, shape: 3 }
          | { kind: "doc-para"   , ref: "¶142"      , para: 141, run: <int>|null }
          | null

No sixth arm, no new spelling, and `dom` stays refused while no producer emits it — IC-1's
constraint recorded with its acceptance is that this union is D-164's per-container LEAF and
*"no implementer forks a second reference vocabulary"*. `source` is OPTIONAL and `null` is a
legal, meaningful value: **a reading without position still writes, and the absence is STATED
rather than inferred.** A consumer may NEVER read an absent `source` as "the whole document was
meant" — that is D-129's somevalue/novalue split and `schema.mjs`'s own rule at §1.6 of the
study, and it is the whole reason the field is nullable rather than defaulted to `document`.

**(2) A reader is GIVEN what it needs to answer, and cannot invent it.** `readText()` already
flattens I2's `text.pages[]` / `text.paragraphs[]` into one string before a reader sees it, which
DESTROYS the only position information the producer emitted. So the flatten keeps a SEGMENT MAP —
each segment's `[start, end)` in the flat string and the IC-1 `source` of the container part it
came from — and `readText` puts one function on the reader's `ctx`:

    ctx.locate(offset) -> an IC-1 source | null

`locate` is TOTAL and never throws: an offset outside every segment, a producer that emitted only
`text.document` (no itemisation at all), or a bare string all return `null`, which the reader
passes through as `source: null`. **A reader may only emit a `source` `locate` gave it**, which is
the structural form of "never invent": the reader knows WHERE IN THE TEXT it read something; only
the producer knows what part of the container that text came from.

**(3) `rect` is `null` on every `pdf-page` source a reading produces, and that is honest rather
than lazy.** I2's own Status section says it: Tier-1 text is a flat per-page string with no
table or row geometry, and *"asserting layout the extractor cannot support would be exactly the
invented-structure this project forbids."* The PAGE is in the bytes the producer emitted; the
RECTANGLE is not. The union already admits `rect: null` on the link side (`source: {page, rect:
[…]|null}`), so this is the arm as it stands and not a widening. A consumer that requires page+rect
— `checkAnchor`, which takes ONLY `pdf-page` with both as a transcription anchor — is unaffected:
it refuses a rect-less source today and goes on refusing it, and a reading's position is not
offered as a transcription anchor.

**(4) The projection: `reading_refs` gains three nullable columns**, written by the same
`op=promote` projection that writes the row, from the entity's own `source`:

    pos_kind TEXT   -- IC-1's discriminator, or NULL: this reading cannot say where
    pos      TEXT   -- the per-arm fields as canonical JSON, or NULL
    pos_ref  TEXT   -- IC-1's REQUIRED human form, or NULL

All three move together — a row has all three or none — so a partially-written position can
never read as a whole one. This is the I5 consequence of the I2 change and is described here
because the column arrives with its writer; **the I5 registry bump it implies is CONDUCT's to
take, and FW-17 names it as an owed act rather than assuming it.**

### Why

**D-161 and content-grain connections are blocked on exactly this and nothing else.** The study
states it as the hard dependency (§1.9): `reading_refs` carries no position and `parse()` entities
carry `key/kind/label/facts` only, so *"a content-grain connection is impossible under ANY option
until readings carry WHERE a reference was read."* Bob ruled on 2026-09-14 (§5.4) that the
connection points at the specific reference in each document, and on §5.1 that a citation into a
portion refers ONLY to that portion — so until this lands, a portion leg's connection grade is
UNDETERMINED and must be stated as such, which is what REC-83 states today. This change is what
makes it computable, and computable is not the same as computed: a connection whose pair carries
no position still reads UNDETERMINED for a portion leg, per pair, never assumed.

**The alternative, and why not.** A reader could be handed the itemised `pages[]`/`paragraphs[]`
and left to find its own position. That forks the flatten: every reader would re-implement
offset-to-page, and the per-container knowledge would sit in the reader instead of at the seam —
the same drift IC-1 rejected when it refused the pure-string form. One `locate` at the one entry
point keeps per-container knowledge where the container is known.

### Consumers, and what changes for each

- **RECORD.** The three `reading_refs` columns and their migration; `#writeReadings` writes them
  from the entity's `source`. Nothing existing reshapes — every current read of `reading_refs`
  (`op=readingref`, the resolution join, the terms projection, the compiler's MEANING arm) names
  its columns and is unaffected by three more. The `connections` determining pair is RECORD's
  consumption of this change and lands in the same item (FW-17's second half), because a pair
  the schema can hold and nothing writes would be the same false precision this change exists to
  avoid.
- **CONTENT-PDF** (dormant). NOT-AFFECTED as a producer: `text.pages[]` already carries the
  0-based page index this maps from, and no PDF extractor changes. It is affected only if it later
  wants to emit rects with per-page text, which is a further ADDITIVE change on its own.
- **CONTENT-OFFICE** (dormant). NOT-AFFECTED as a producer: `text.paragraphs[]` already carries
  `{para, ref}` and the mapping uses the producer's OWN `ref`, never a re-derived one. The
  `sheet-cell` and `slide-shape` arms have no per-cell/per-shape text itemisation in the text
  shape today, so a reading over an xlsx or pptx honestly answers `null` — named here so the
  absence is a stated gap rather than an oversight.
- **CONTENT-HTML** (dormant). NOT-AFFECTED: `dom` has no producer and stays refused by name.
- **The readers themselves** (FRAMEWORK's own, and the sharp edge of this proposal): a reader
  that cannot say where MUST say so IN ITS OWN HEADER rather than silently emitting `null`. That
  is a documentation obligation this change creates and it is stated as part of the interface,
  because a reader's silence and a reader's honest `null` are indistinguishable at the wire.

### Status

**PROPOSED, 2026-09-14.** FW-17 builds against this text and says so; CONDUCT resolves it at
integration, answering in writing for the three dormant producers (protocol step 3). Any
amendment building forced is written into this entry in the same commit, naming what moved.

### RESPONSES — 2026-09-14, recorded by CONDUCT #11 at FW-17's integration

- **FRAMEWORK** (owner and proposer): AGREE — landed on `worktree-agent-a531b903306a7ed5d` (5b46c43 + ba52bf7), built against the text as proposed with no amendment forced.
- **RECORD**: AGREE — the three `reading_refs` columns and their writer, `op=readingref`, the `connections` determining pair and `connectionGradeForContent` landed in the same item (the column arrives with its writer); the I5 bump those columns imply is taken below.
- **CONTENT-PDF** (dormant): NOT-AFFECTED as a producer, answered FOR by CONDUCT on the proposal's own measurement — `text.pages[]` already carries the page a span came from; the segment map is laid over only on a byte-for-byte match of the documented `text.document` join, so a producer composing it any other way gets no map and a stated reason, never a wrong position.
- **CONTENT-OFFICE** (dormant): NOT-AFFECTED as a producer, answered FOR by CONDUCT — `text.paragraphs[]` carries the part; the same earned-map rule applies.
- **CONTENT-HTML** (dormant): NOT-AFFECTED, answered FOR by CONDUCT — `dom` has no producer and stays refused by name.
- **UI**: NOT-AFFECTED as a consumer of I2, answered FOR by CONDUCT — `civicos-ui/app.html`'s flattened docprofile embed is a GENERATED artifact of `docprofile/` (`tools/bundle-docprofile.mjs`) and was regenerated by FW-17 as the change that made it stale; CONDUCT rules the boundary the worker raised: whoever changes `docprofile/` regenerates the embed in the same commit (FL-10's shape), and that is not a UI edit.

### RESOLUTION — ACCEPTED, **I2 2.0.0 → 2.1.0**, 2026-09-14 by CONDUCT #11

MINOR, as proposed: one optional IC-1 `source` on a `parse()` entity and one total `ctx.locate(offset)` on the reader's context; a reader emitting neither and a consumer reading neither see 2.0.0 exactly. The constraint recorded with the acceptance stands as written: an ABSENT `source` means "this reading cannot say where" and NEVER "the whole document" — the whole document is a MEMBER's citation act (Bob's 5.3), not a reader's silence — and a reader may emit only a source `locate` gave it (never-invent, structural). Of the three registered readers one places (`meeting_agenda`, page with `rect` null), two declare in their own headers that they cannot and why, and the suite asserts the declaration against the source. **The I5 bump these columns imply is taken here as I5 1.11.0 → 1.12.0, ADDITIVE:** `reading_refs.pos_kind`/`pos`/`pos_ref` (nullable, all three together or none, re-normalised at the store) with `op=readingref` as their reader, and `connections`' eight determining-pair columns with `#connectionView`'s `determining_pair` and `connectionGradeForContent` (`op=connections&content=`) — C-49.1/.2/.3 the refusals. SETTLED when REC-86/REC-87 (the authored acts that consume the pair) confirm, or at the next I2 producer landing that emits `source` from a real page — whichever comes first; CONDUCT writes it.

## IC-87 · I1: THE PERSISTED READING CARRIES THE PAGE COUNT I2 ALREADY REPORTS — `document.reading.page_count`, so the content row's out-of-range refusal reaches every PDF and not only a mixed document · PROPOSED 2026-09-14 (CAP-9, enacting IC-83's Rules and closing D-345) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I1 (bytes → content), currently **1.4.0 STABLE** (1.4.0 came from IC-85, CAP-8, the same day)
- **Proposer:** CAPTURE, worker `agent-aaa4d22253c340546`, 2026-09-14, from QUEUE CAP-9
- **Owner to land it:** `CAPTURE` (owner and proposer)
- **Consumers to answer:** `CONTENT-HTML` (dormant), `CONTENT-PDF` (dormant),
  `FRAMEWORK` (ACTIVE — FW-17 is live on `reading_refs`, and this touches no column
  of it), `RECORD` (the consumer that MATTERS: `Store#contentContextFor` reads the
  new field and `mintContent` stores it as `content.page_count`)
- **Change class:** ADDITIVE — one new optional key inside an existing object; no
  field renamed, reshaped or removed; every consumer that ignores it reads exactly
  what it read before → MINOR bump (**1.5.0**)
- **The id was MINTED with `node tools/mintid.mjs IC`** (floor IC-86; IC-86 already
  held and stepped over).

### WHY THIS IS AN IC AT ALL, STATED FIRST BECAUSE IT IS THE CLOSE CALL

`document.reading` is a field I1's §4 table **does not list**. It was added by FW-5
and its shape has been versioned on I2 ever since (`reading.text_source` is I2 1.2.0,
1.3.0 and the 2.0.0 break), so a reader could argue this belongs to I2 and that I1
never covered it. Filed on I1 anyway, for three reasons:

1. **I1's own version history is four consecutive ADDITIVE MINOR bumps for exactly
   this act** — 1.1.0 `document.profile` (FW-3), 1.2.0 `document.profile.digests`
   (FW-4), 1.3.0 `document.profile.format` (COFF-1), 1.4.0 the Drive hop (IC-85).
   A new key the acquire document carries is filed here and has been four times.
2. **The acquire document IS `bundle.md`'s frontmatter**, and I1's "what freezing
   this costs you" names *"the frontmatter field names and value domains in §4"* as
   protocol-bound. A key inside an object the frontmatter carries is inside that.
3. **I2 does not move and must not be made to look as though it did.**
   `pdfstructure.mjs` has returned `pages: <int>` on the structure object since I2
   1.0.0 — it is in the registry's own "The shape, as CONTENT-PDF emits it today"
   block. This item consumes that field; it asks no producer for anything new. Filing
   it on I2 would put a bump on an interface whose producers are unchanged, which is
   the opposite error from not filing at all.

**A REGISTRY GAP, NAMED RATHER THAN FIXED HERE:** I1 §4's "document top level" table
lists `profile` and not `reading`, so the acquire document has carried an undocumented
field since FW-5. This IC's registry edit is the place to close that, and CONDUCT
takes it with the bump — CAP-9 states it rather than widening its own claim to
`INTERFACES.md`'s §4 table.

### WHAT CHANGES, precisely

**One optional key on `document.reading`:**

```
  reading: {
    content_type, reader_version, read_from_text, found, entities[], facts, at, basis,
    text_source, text_tier, text_container,          // unchanged
+   page_count: <positive integer> | null            // ABSENT when the format wire never ran
  }
```

| value | what it means | when |
| --- | --- | --- |
| a positive integer | the number of pages I2 reported for this document, verbatim (`structure().pages`, which is `doc.pageCount`) | a PDF the FORMAT wire read |
| `null` (key PRESENT) | the wire RAN and the producer reported no count — the page tree could not be ordered, or the container has no pages | a container whose entry produces text but no page count; a PDF with no orderable pages |
| key ABSENT | nothing ever tried to count this document's pages | an HTML page (read as text at intake, no wire), a multipart or unreadable primary |

**The two absences are different facts and the record states which.** That is the
sparse-at-every-level rule and the same distinction `#writeTextSource` already makes
one field over, where *no row* and `transcribed: 0` may not stand in for one another.
**And it is never a zero**: a zero would assert the document HAS no pages, which is a
third fact and one nothing here established.

**Value domain:** a positive integer or `null`. Never `0`, never a string, never a
guess. It is READ from I2 and never re-derived — counting `text.pages[]` here would be
a second opinion about one number three lines from the first.

### WHY — and what it is worth

IC-83's Rules mint a content row against *"the page count I2 already carries at
acquire — stored on mint"*, and **nothing persisted one** (D-345, filed by REC-82 and
delegated to CAPTURE because `op=acquire` is CAPTURE's path). `Store#pageSetForCapture`
could therefore answer only from the pages a D-252 SCOPED derivation step or an
attestation happened to name — which is a MIXED document (a text-layer report with
scanned exhibits) and nothing else. **Every wholly text-layer and every wholly scanned
PDF, which is the common case, had no page set at all**, so C-45.1 could not fire on it
and a member could record a citation to page 9,000 of a three-page document with
nothing saying so. With this field the refusal reaches every PDF the plane has read.

### CONSUMERS, and what changes for each

- **RECORD** — the one consumer that reads it. `Store#contentContextFor` prefers the
  stored figure and falls back to the existing derived union; `mintContent` is
  untouched and simply gets a better answer for `ctx.pageCount`, which it already
  writes to `content.page_count`. **No RECORD code changed for this item**, which is
  the measurement that makes this additive rather than a claim that it is.
- **CONTENT-HTML / CONTENT-PDF** (dormant) — NOT-AFFECTED. They produce structure;
  this consumes a field CONTENT-PDF has emitted since I2 1.0.0.
- **FRAMEWORK** (ACTIVE) — NOT-AFFECTED. `readings`' COLUMNS do not move: the count
  rides `readings.reading`, the JSON blob the table already stores. FW-17 is live on
  `reading_refs` and shares no ground with this.
- **UI** — NOT-AFFECTED; measured: `civicos-ui` reads no `reading` field.

### THE ALTERNATIVE CONSIDERED AND REJECTED, because the brief expected it

**A `readings.page_count` COLUMN, which would also have been an I5 change.** Rejected:
`readings.reading` already holds the whole reading as JSON, `readings` is keyed by
`capture_sha`, and the single reader looks up by exactly that key — so a column would
be a projection nothing filters, counts or asks for. `#writeTextSource`'s columns exist
because the chain had to be *filterable*; this number does not. It also keeps the item
off a table I5's ownership list assigns to FRAMEWORK, and off I5 entirely. **Reversing
this costs one `ALTER TABLE ... ADD COLUMN` in the existing idempotent migration list
and one line in `#writeReadings`** — the value is on the reading either way, so no data
is lost by having chosen the read.

### IMPACT, MEASURED RATHER THAN ASSERTED

- Whole battery **193/193 suites · 11,962 assertions · exit 0** on the landing branch,
  against this worktree's own pristine baseline **192/192 · 11,936** at `980a9e5`,
  attributed per suite by DIFFING the two runs and never by subtraction: `+22`
  `capture-pagecount.test.mjs` (new), `+3` `hygiene.test.mjs` (712→715, its per-suite
  scans gaining a suite), `+1` `planning-hygiene.test.mjs` (279→280, this IC row and
  the debt row). 188 suites unchanged, **none fell**. **No existing suite was edited**:
  the only suites that could have broken are the ones that drive `op=acquire` and
  compare the whole acquire document, and `conformance.test.mjs` (C-18.1) tolerates the
  extra key exactly as I1's 1.2.0 entry records it doing for `digests`.
- On the project's own instance, `op=reading` answers `found:false` for all 88
  captures in the register and `op=textprovenance` returns `count: 0` over the whole
  store, so **no live reading changes shape**; the field appears on the next acquire.

### RESPONSES — 2026-09-14, recorded by CONDUCT #11 at CAP-9's integration

- **CAPTURE** (owner and proposer): AGREE — landed on `worktree-agent-aaa4d22253c340546` (c597217 + 5e3ff57), integrated by CONDUCT #11.
- **RECORD** (the one consumer that reads it): AGREE — `Store#contentContextFor` prefers the stored count over the derived union (a stored COUNT beats an observed FLOOR: preferring the larger would let a step naming a page the file lacks widen the bound), landed in the same item as the reader's change; D-356 (the backfill, population measured at zero) is RECORD's row.
- **CONTENT-HTML / CONTENT-PDF** (dormant): NOT-AFFECTED, answered FOR by CONDUCT on the proposal's own statement — they PRODUCE structure; I2's `pages` has been emitted since 1.0.0 and this item consumes it.
- **FRAMEWORK** (active): NOT-AFFECTED, answered FOR by CONDUCT — `readings`' COLUMNS do not move; the count rides the JSON the table already holds, keyed by the `capture_sha` the one reader looks up by, so I5 is untouched and no schema edit exists.

### RESOLUTION — ACCEPTED, **I1 1.4.0 → 1.5.0**, 2026-09-14 by CONDUCT #11

MINOR, as proposed: `document.reading.page_count` — one new optional key inside an existing object, present-and-null when the wire ran and the producer answered nothing, ABSENT when nothing ever counted; no absence stands in for another and it is never a zero. Carried at ONE site in `op=acquire`'s FW-15 reading wire covering all three reading branches; a consumer that never reads it sees 1.4.0 exactly. **The registry gap this IC names is closed with the bump:** I1 §4's document-level table had never listed `reading` at all (undocumented since FW-5) — the row is added. CAP-12 (the container extents — sheets with dimensions, paragraph count, slides with shape lists, D-354) rides this entry's shape and is expected to AMEND it rather than mint anew. SETTLED when CAP-12 lands and the three office arms' C-45.1 is fed, or at the next DIST deploy serving the count live — whichever first; CONDUCT writes it.
---

## IC-88 · I5/I3: WHO MARKED THIS PASSAGE — a machine credential may MINT a content row, every projection of one carries the plane's own MINT LABEL, and `op=attesttext`'s attestor stops being caller-supplied · PROPOSED 2026-09-14 (SK-7, enacting framework Part II §14.4's 5.7 under Bob's rulings of 2026-09-14) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I5 (the store schema) at **1.11.0** after IC-83, and I3 (the plane's op surface) at **14.1.0** after IC-84
- **Proposer:** the SK-7 worker, 2026-09-14, from `BIO_Content_Framework_v0_10.md` Part II §14.4 —
  Bob's ruling of 2026-09-14, folded there as 5.7: *"The assistant may mark passages as citable on
  its own, every such row labelled as machine work, never attested by it, and part of a finding only
  when a member cites it."* IC-83 already put `minted_by` on the row and named this item in its own
  consumer list (*"SKILL — the assistant will mint rows later, 5.7"*).
- **Owner to land it:** `SKILL` + `RECORD` (landed on `worktree-agent-ad8d378ba5fed22ee`)
- **Consumers to answer:** `RECORD` (owner of I5/I3 and of the content region), `SKILL` (owner of the
  assistant), `UI` (MEASURED: renders no content row today — `op=content` landed with REC-83 and has
  no consumer in `civicos-ui/app.html`; and calls `op=attesttext` nowhere, so the second half below
  is NOT-AFFECTED by measurement rather than by assumption), `CONTENT-PDF` (dormant — owner of
  CPDF-10's attestation path, which the second half changes; CONDUCT answers for it in writing),
  `FLEET`/`DIST` (MEASURED: no caller of `op=attesttext` in `agent-worker/` or `newgroup/`)
- **Change class:** **TWO CHANGES, ONE ADDITIVE AND ONE BREAKING**, stated apart because collapsing
  them would hide the second behind the first.
  - **(1) ADDITIVE → MINOR.** One new op, one new value class on an existing column, one new field on
    every content-row projection. Nothing existing changes shape.
  - **(2) BREAKING for one op's request shape → MAJOR on I3 if CONDUCT judges the measured consumer
    set to make it so, and the measurement is below.** `op=attesttext` no longer reads `member` from
    the request body.

**What (1) — THE MINT, AND THE LABEL.**

A new op `contentmint` (classes `admin`/`member`/`probe`, mutating, `NEEDS` = `contribute`, in
`SESSION_OPS` for member and admin). It takes `{ bundleId, extent, at? }` and mints or finds the
content row addressing that part of that document, returning the row through `contentRow` so the
answer is labelled by the same helper every other surface labels it with. `minted_by` is STAMPED
SERVER-SIDE from the credential that authenticated and the body's is never read:

    a session                 -> the signed-in member's id            ("ruth")
    an `ai` credential        -> `class:ai/<tokenId>`                 ("class:ai/extractor")
    any other machine class   -> `class:<cls>`                        ("class:member", "class:admin")

The `ai` class reaches it exactly as FL-6's cascade already provides: `aiReachesAsMember` admits it
because the row carries `member`, and a MUTATING op additionally has to be named in the `writes` the
minting member declared — driven, refused by name (`AI_BEYOND_TASK_SCOPE`, C-29.x) when it is not.
**THE STAMP IS THE CLASS AND NEVER THE PRINCIPAL:** a member-scoped credential's principal is
`member:<id>`, which is NOT a machine identity by `isMachineIdentity`, so stamping it would label
the assistant's own row as a member's.

Every projection of a content row gains ONE new field, `mint`, composed in one place
(`Store.#mintLabel`) and carried by all four surfaces that emit a row — `op=contentmint`,
`op=content`, `earned.content` on `op=earnedbasis`, and `op=promote`'s `content[]` array:

    mint: { by: <the stored minted_by>, state, machine_work: <boolean>, says: <the published sentence> }

`state` is one of four, total over every possible `minted_by`, classified by `contentMintState` in
`checks/bio-checks.mjs`: `plane` · `machine` · `member` · `unstated`. The four sentences are
published through `vocabularies.content_mint_states` on `op=affordances`, so a surface renders
`says` and invents no wording — `sufficiency_claim_states` (PL-17 / DEC-65) one field over, for its
reason exactly, and the reason is measurable: `civicos-ui/app.html` renders `Asserted by
${g.asserted_by}` VERBATIM today, so a column that can hold `class:ai/extractor` and no vocabulary is
a surface printing a machine word at a member.

**`plane` IS NOT `machine`, and that is the load-bearing distinction.** A row minted at
`op=promote` is the mechanical referent of a citation A MEMBER AUTHORED; calling it machine work
would label a member's own citation as the assistant's. `CONTENT_MINTED_BY_PLANE` is now the one
literal for that value and `mintContent` defaults to it.

Nothing about 5.7's third clause needed building: `earnedBasisRegistry` answers `earned.content`
only over the content ids a CALLER names, and the callers that name them are bases of legs members
authored — so a machine-minted row nobody cited is absent from every finding by construction, and
the moment a member's leg names the same passage `mintContent`'s INSERT OR IGNORE finds THAT row
(the id is `hash(capture, extent, chain)`) and the label travels into the finding with it. Both
directions are driven, and the arm that widens the registry is one of this item's five controls.

**What (2) — THE ATTESTOR, AND IT IS A CORRECTION RATHER THAN A DESIGN.**

`op=attesttext` read its attestor from the request body. C-35.10 refuses a MACHINE IDENTITY, so the
fence fired only when a caller VOLUNTEERED a machine-shaped name — which is the one thing a caller
that wants to attest never does. **MEASURED through a real minted `ai` credential on `origin/main`
at `3f92e5c`, not reasoned about:**

    member: "class:ai"     -> refused, C-35.10          (the one spelling every suite drove)
    member: "ruth"         -> ATTESTATION LANDED, attributed to ruth, who had said nothing
    member: "member:ruth"  -> LANDED, at an attestor string no member has
    and the MEMBER_TOKEN and ADMIN_TOKEN machine credentials did the same.

CPDF-10 wrote *"TWO FENCES ON PURPOSE"* and `SESSION_OPS` carries `attesttext` with the reasoning
*"the only route that produces a name the store will accept is a session"* — true of a session, and
never enforced against a machine credential, because `SESSION_OPS` gates sessions only.
`content-extent.test.mjs` recorded the belief that an op-level arm was impossible here; it was
measured with a token that was not a credential at all, and that comment is corrected in this
landing.

So the attestor is now stamped server-side exactly as `op=lease`'s actor, `op=cite`'s `by` and the
queue's `member` already are — `sessMember` for a session, `class:<cls>` for any machine credential —
and the DO route reads it from the query string the control plane wrote, never from the body.
C-35.10 is UNCHANGED and is now REACHED by every machine credential rather than only by one that
incriminates itself.

**MEASURED CONSUMER IMPACT of (2), by census rather than by belief:**

| consumer | calls `op=attesttext`? | effect |
| --- | --- | --- |
| `civicos-ui/app.html` | **no** (0 occurrences) | none. The act is on `ACTS_AWAITING_SURFACE` with `owed_by: "UI"` and has no surface yet |
| `agent-worker/` (the fleet) | **no** (0) | none |
| `newgroup/` (the installer) | **no** — only the embedded plane bundle, which is a build artifact of these same sources | none; DIST rebuilds at its next cut |
| `bio-plane/test/` | **yes, 4 suites** | ALL FOUR CORRECTED IN THIS COMMIT, never exempted: `textchain`, `ocr-member-e2e`, `content-reads` (each grew a real session for the act that must LAND, and their machine-credential arms now drive the credential instead of a body string) and `content-extent` (its stale comment) |

**The honest summary of (2):** every caller in this repository that the change breaks was a TEST
DRIVING THE HOLE. There is no product caller to migrate, which is why the correction is landable now
rather than owed a deprecation window — and it is also why nobody noticed: the only thing exercising
the op was exercising it wrongly.

**RESPONSES**

- `UI` — **NOT-AFFECTED, by measurement.** 0 occurrences of `op=attesttext` and no content-row
  renderer in `app.html`. When UI builds the transcription-check surface (`ACTS_AWAITING_SURFACE`,
  `owed_by: "UI"`, since 2026-08-08) it must NOT send `member` in the body; the plane stamps it.
  When UI builds a content-row surface it renders `mint.says` verbatim and never `minted_by`.
- `RECORD`, `SKILL`, `CONTENT-PDF`, `FLEET`, `DIST` — **to answer.** `CONTENT-PDF` is dormant and
  CONDUCT answers for it in writing.

### IC-88 ADDENDUM · 2026-09-14, THE SK-7 RESPAWN, BEFORE THE ROW LANDED — **ONE PREMISE OF THIS PROPOSAL WAS FALSIFIED BY A LANDING THAT ARRIVED WHILE ITS AUTHOR WAS GONE, AND THE HALF IT MADE MISSING IS BUILT IN THE SAME COMMIT**

This IC was written on a tree cut at `3f92e5c`. Its author died on the operator's session limit
before the item was reported, and by the time the respawn read it `origin/main` had moved through
REC-84, REC-85, CAP-8, CAP-9, FW-17 and **UI-61**. Three of its statements are corrected here rather
than edited above, so a reader of the original text can see what was true when.

**1. THE UI PREMISE IS NOW FALSE, AND IT IS THE ONE THAT MATTERED.** The proposal's consumer list
and its `UI` response both rest on *"MEASURED: renders no content row today — `op=content` landed
with REC-83 and has no consumer in `civicos-ui/app.html`"*. That measurement was correct on
`3f92e5c`. **UI-61 landed the consumer** (`legReferentHtml` in `civicos-ui/app.html`, driven by
`civicos-ui/test/content-extent.test.mjs`): the leg display reads a content row's `standing` — the
very object `#contentStanding` composes — and renders its `ref` and, when stale, its `says`. So from
UI-61 there IS a surface showing a content row to a member, and this item's `mint` field was reaching
it and being dropped. **A label that exists on the wire and on no screen does not satisfy *labelled
everywhere it is shown*.**

Corrected by BUILDING it, not by re-wording the IC. `legMintLabelHtml` in `civicos-ui/app.html`
renders `mint.says` VERBATIM under a `MARKED BY A MACHINE` heading, gated on the plane's own
`mint.machine_work` predicate and never on the `minted_by` string — the RESPONSES line above told UI
to do exactly this, and the surface it was told to wait for already existed. **Only `machine_marked`
is labelled**; `plane_minted`, `member_marked` and `unstated` render exactly as before, which is what
keeps UI-61's own over-strictness digest (§7, pinned at `ce6e7cf`) byte-identical. Nine arms in
`civicos-ui/test/content-extent.test.mjs` §8 drive it, including the one that only a surface reading
the plane's predicate passes: a `machine_work: false` beside a machine-shaped `by`.

So `UI` is **AFFECTED and ANSWERED IN THIS COMMIT** on the label half, and stays NOT-AFFECTED on the
`op=attesttext` half — re-measured on the merged tree, `op=attesttext` still appears **0 times** in
`civicos-ui/app.html` and **0 times** in `agent-worker/`. The transcription-check surface is still
owed (`ACTS_AWAITING_SURFACE`, `owed_by: "UI"`) and must not send `member` in the body.

**2. THE INTERFACE BASELINE MOVED.** The header reads *"I5 at 1.11.0 after IC-83"*. I5 is at
**1.12.0** since IC-86's resolution (FW-17, reading position and the determining pair). I3 is
unmoved at 14.1.0. The change class is unaffected — this item adds no column; `minted_by` is IC-83's
and what is new is the VALUE CLASS it may now hold — but CONDUCT bumps from 1.12.0, not from 1.11.0.

**3. THE CHANGE (2) MEASUREMENT WAS RE-TAKEN AND STILL HOLDS.** `op=attesttext` still reads its
attestor from the request body on `origin/main` today (`store.mjs`'s `attestText` takes `pkg.member`;
`SESSION_OPS`' *"the only route that produces a name the store will accept is a session"* comment and
`index.mjs`'s *"TWO FENCES ON PURPOSE"* are both still there, and both are still true only of a
session). **Nothing that landed between the two measurements closed it.** The
correction in this commit is therefore against live behaviour and not against a tree that has since
moved.

### RESOLUTION — ACCEPTED, **I3 14.1.0 → 15.0.0 (MAJOR)** and **I5 1.12.0 → 1.13.0 (MINOR)**, 2026-09-14 by CONDUCT #11

**The two changes are ruled apart, as the proposal states them.**

**(1) the mint and the label — MINOR on I5 (1.12.0 → 1.13.0), ACCEPTED as proposed.** One new op, one new value class on an existing column, one new `mint` field on every content-row projection, composed in ONE place and published as a vocabulary so a surface renders `says` and invents no wording — `sufficiency_claim_states` one field over, for its reason exactly. The `plane` / `machine` distinction is accepted as load-bearing and is the part a later reader is most likely to get wrong: a row minted at `op=promote` is the mechanical referent of a citation A MEMBER AUTHORED, and labelling it machine work would tell a member their own citation was the assistant's.

**(2) `op=attesttext`'s attestor stops being caller-supplied — MAJOR on I3 (14.1.0 → 15.0.0).** The proposal offered the judgement to CONDUCT on the measured consumer set, and the measurement is exemplary: zero product callers (`civicos-ui` 0 occurrences, `agent-worker` 0, `newgroup` only the embedded build artifact), four test suites that were **driving the hole**, all four corrected in the same commit and none exempted. **CONDUCT rules it MAJOR anyway, and the reason is the rule rather than the count: a version is a CONTRACT IDENTITY, not a measure of how much pain a change caused.** A request field that was read and is now ignored is a break in the shape a future consumer would build against from the registry text, and I3's number is what a consumer reads to know whether its assumptions survive. The measured zero is why **no deprecation window is owed and the correction lands now** — it is not why the break is not a break. Recording it as MINOR because it happened to hurt nobody is the shape IC-3 already refuses (*"a break recorded as additive teaches the registry to lie"*), one severity down.

**RESPONSES, recorded by CONDUCT #11 at integration:** `RECORD` AGREE (owner of I5/I3 and the content region — the stamp and the label land in its ground and its four totality guards were answered at their sites). `SKILL` AGREE (owner and proposer). `UI` NOT-AFFECTED by measurement, **with one act owed and named**: when UI builds the transcription-check surface (`ACTS_AWAITING_SURFACE`, `owed_by: "UI"`, since 2026-08-08) it must NOT send `member` in the body — the plane stamps it — and a content-row surface renders `mint.says` verbatim and never `minted_by`; the respawn already built the label into UI-61's landed renderer, so the surface that exists is correct today. `CONTENT-PDF` NOT-AFFECTED, answered FOR by CONDUCT in writing (dormant; it produces structure and calls neither op). `FLEET` and `DIST` NOT-AFFECTED by measurement (no caller; DIST's embedded bundle regenerates at the next cut).

SETTLED when a product caller exists for either op — the assistant's EXTRACT act (blocked: D-358) or UI's transcription-check surface — and confirms the shape live; CONDUCT writes it.

### AMENDED at CAP-12's landing — 2026-09-14 (the second key this entry was written to carry; the version stays **1.5.0** and the class stays ADDITIVE, and CONDUCT confirms or moves it at integration)

**This is the amendment this IC's own RESOLUTION anticipated** — *"CAP-12 … rides this entry's shape and is expected to AMEND it rather than mint anew"* — so no new IC is minted. It is recorded here, PROPOSED by CAPTURE, with every consumer named; the bump and the RESOLUTION are CONDUCT's, as always.

**A SECOND optional key on `document.reading`, under the SAME three-state absence rule:**

```
  reading: {
    …, page_count,                                   // IC-87 as resolved
+   container_extent: {                              // ABSENT when the format wire never ran
+     container: <the I2 container token> | null,    //   what the entry said it read
+     levels:    ["sheets"|"paragraphs"|"slides", …] //   the levels THIS container itemises at all
+     sheets:     [{ name, rows, cols }] | null,
+     paragraphs: <positive integer>      | null,
+     slides:     [{ shapes }]            | null,
+   } | null                                         // NULL when the wire ran and no entry itemised a container
  }
```

| value | what it means | when |
| --- | --- | --- |
| an object | an office entry answered; `levels` names what this container itemises and each named level is the figure or NULL | an XLSX, DOCX, PPTX, ODS, ODT or ODP the FORMAT wire read |
| `null` (key PRESENT) | the wire RAN and no entry itemised a container at all | a PDF (whose I2 text carries no sheet, paragraph or slide list); a primary the wire could not read |
| key ABSENT | nothing ever tried to itemise a container | an HTML page read as text at intake — the wire never ran |

**Value domains, and each is the rule rather than a preference.** `sheets` is a non-empty array or NULL, each entry `{name, rows, cols}` with `rows`/`cols` **NULL today** (no entry emits them — D-359). `paragraphs` is a POSITIVE INTEGER or NULL, **never 0**: every entry's over-the-size-bound branch returns an empty list with its guard marker beside it, and reading that as *"this document holds no paragraphs"* would be the record asserting a fact nobody established. `slides` is a non-empty array or NULL, each entry `{shapes}` with `shapes` **NULL today** for the same reason as `rows`/`cols`. `levels` is the discriminator that keeps a level a container has NO NOTION OF from being reported as a gap in it — a workbook has no paragraph count and never will, which is a different fact from a workbook whose sheets the record does not hold.

**It is READ from I2 and never re-derived.** The six office entries already return the per-unit list named for what the unit IS (`sheets[]`, `paragraphs[]`, `slides[]`); this item counts and copies them. Recognition is by KEY PRESENCE on the I2 text shape rather than by a list of container names, so a seventh entry landing in the same shape is carried with no edit.

**WHY IT IS STILL I1 AND NOT I2**, which is the same close call IC-87 argued and the same answer: no producer is asked for anything new, and filing it on I2 would bump an interface whose producers are unchanged. **I5 does not move**: no column, no table — the field rides `readings.reading`, the JSON the table already stores.

### CONSUMERS, and what changes for each — all four MEASURED, not asserted

- **RECORD** — the one consumer that reads it. `Store#containerExtentForCapture` gains the `reading` argument `#pageSetForCapture` already takes and answers from the stored figure; **its ANSWER SHAPE does not move** (`{sheets, paragraphs, slides, held, empty_level, why}`), so `checkContentExtent` and the three `covers` predicates are UNTOUCHED — exactly what D-354 predicted (*"Nothing on the RECORD side moves when it arrives"*). No `covers` arm, no `mintContent`, no check and no catalogue row changed.
- **CONTENT-OFFICE** (dormant) — NOT-AFFECTED by this item, and it is the owner of the residue: the entries emit no sheet dimensions and no per-slide shape count, so the INNER half of two arms stays undetermined (**D-359**, filed with its actor). This item consumes what they already return and asks them for nothing.
- **CONTENT-HTML / CONTENT-PDF** (dormant) — NOT-AFFECTED. A PDF's reading gains the key present-and-NULL and nothing else; pinned by a digest taken on a PRISTINE `173bc66` checkout.
- **FRAMEWORK** (ACTIVE) — NOT-AFFECTED. `readings`' COLUMNS do not move; the extent rides the JSON blob the table already stores, and FW-17's `reading_refs` shares no ground with it.
- **UI** — NOT-AFFECTED; measured: `civicos-ui` reads no `reading` field (the same measurement IC-87 took).

### IMPACT, MEASURED RATHER THAN ASSERTED

- The HTML acquire document's whole `reading` is **byte-identical** to this entry's own landing at `173bc66`, and a PDF's is byte-identical once the one new key is removed — both pinned in the suite by a sha256 taken on a pristine checkout with `test/cap12-pin.probe.mjs`, not by a hand-written list of expected strings.
- Battery, coverage, UI harness and control figures are in `CLAIMS.md`'s CAP-12 release line.
- On the project's own instance nothing changes shape: `op=reading` answers `found:false` for all 88 captures (D-356's measurement, taken the same day), so the field appears on the next acquire.
## IC-90 · I3: `op=cite` CARRIES THE EXTENT — the one act that writes a basis leg stops dropping an `extent_kind` sent beside its seven parameters, and splices the flattened extent scalars (or a `content_id`) onto the leg · PROPOSED 2026-09-14 (REC-97, closing UI-61's DELEGATION and unblocking IC-84's SETTLED) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I3 (plane → UI, the op contracts). **MEASURED AT THIS ITEM'S BASE `173bc66`
  as 14.1.0 CHANGING (IC-84); by the time this branch was finished `origin/main` had moved
  to `65d61c2` and I3 reads 15.0.0 — IC-88 (SK-7) landed BREAKING on `op=attesttext` and
  additively added a new content-mint op (`contentmint`, named WITHOUT the `op=` spelling on
  purpose: it does not exist in THIS tree, and `op-claims.test.mjs` correctly refuses prose
  naming an op the dispatch table does not hold — the guard caught this sentence and it is
  corrected rather than exempted) and the `mint` label. This item was built on 173bc66,
  touches neither `op=attesttext` nor that op, and is additive over either number;
  the bump CONDUCT takes is 15.0.0 → 15.1.0 rather than 14.1.0 → 14.2.0, and it is stated
  here rather than left for the resolver to notice.**
- **Proposer:** RECORD, worker `agent-a39cfbab2c77ec9e4`, 2026-09-14, from QUEUE REC-97
- **Owner to land it:** `RECORD` (owner and proposer)
- **Consumers to answer:** `UI` (the composer is the only production caller), `SKILL`
  (the investigative run writes suggested legs — through `op=promote`, not through this
  act), `DIST` (served surfaces), `RECORD`
- **Change class:** ADDITIVE → MINOR bump
- **The id was MINTED with `node tools/mintid.mjs IC`** (floor IC-87; 88, 89 and 90 were
  already held, and this worker took 90). **IC-91 was also taken by this worker and is
  BURNED AND UNUSED** — a doubled `mintid` invocation while reading its output. A gap
  costs nothing and the tool says so; it is named here rather than left as a silent hole.

### WHAT IS WRONG TODAY, MEASURED BY UI-61 AND RE-MEASURED HERE

`op=cite` is the ONE act that writes a basis leg. Its store handler destructured exactly
seven named parameters — `project`, `handle`, `viewer`, `owner`, `note`, `author`, `role` —
and **an `extent_kind` sent beside them was DROPPED IN SILENCE.** A member who chose a page
got a leg resting on the WHOLE DOCUMENT, with nothing on the leg, in the receipt or in the
record saying the choice went nowhere. That is the class of defect this project holds to be
worse than a missing feature: the record holding something other than what a member did.

Two consequences, both already written down by other items rather than argued here: UI-61
could not build the composer's extent picker (a control whose value is silently discarded is
present-and-refused wearing a worse costume), and **IC-84 cannot SETTLE**, because its
RESOLUTION records UI as answering *"the composer emits `extent` per leg"* and the composer
could not.

### WHAT CHANGES

**One op, additively.** `op=cite` accepts, beside its seven parameters, the flattened extent
scalars REC-84's leg grammar already defines — `extent_kind`, `extent_page`, `extent_rect`,
`extent_ref`, `extent_sheet`, `extent_cell`, `extent_slide`, `extent_shape`, `extent_para`,
`extent_run` — **or** a `content_id` naming an already-minted part outright (IC-84's own
AMENDMENT at REC-84's landing). They are spliced onto the leg it writes, so
`checkLegExtentGrammar` judges them exactly as it judges a frontmatter-authored leg.

**They arrive as a BAG and not as named scalars, and that is the interface's own shape
rather than an implementation detail.** Adding an eighth, ninth and tenth `get()` would close
today's spelling and leave the mechanism: a parameter nobody reads is a parameter nobody can
refuse, so the eleventh field a surface sends would be dropped exactly the same way. Every
parameter the extent grammar could own reaches the act whole, and **a field the act does not
carry is REFUSED BY NAME** rather than ignored.

**Four new refusals, all in the existing C-45 family** (REC-84's rule: a `*_CHECKS` family is
a floor in the DEC-49 guard, and this family's subject is *the ways the record could come to
point at nothing*): `UNKNOWN_EXTENT_FIELD` (C-45.7), `EXTENT_NOT_APPLICABLE` (C-45.8 — an
extent on a CASE's citation edge, which has no leg to scope, refused exactly as `role` is),
`EXTENT_ON_MANY` (C-45.9 — one extent across a selection that would write several legs: a
part of a document is a part of ONE document, and writing one member's one page onto each
would put claims in the record nobody made), `BAD_EXTENT_VALUE` (C-45.10 — a value the
restricted frontmatter grammar cannot carry; BAD_NOTE's rule one field down). No new
`mintid.mjs C` id: these are sub-numbers of an allocated family.

**The grammar's own verdict rides `BASIS_REFUSED`**, `op=promote`'s name for exactly that
verdict, on `suggest`'s recorded precedent — *"one function answering twice should not answer
under two names."*

**Additive per leg on the response:** a leg in `cite`'s receipt carries `extent` (and
`content_id` where one was named) ONLY where the act wrote one. Absent, never null and never
`"document"`, so a caller predating this change reads byte-identical JSON.

### WHAT DOES NOT CHANGE, AND IT IS MEASURED RATHER THAN ASSERTED

**A cite that names no part is BYTE-IDENTICAL.** Measured by digest on a pristine worktree of
`173bc66` and on this branch, over the `bundle.md` the act wrote with its two authored
timestamps and the random selection handle normalised: **1290 bytes, sha256
`0e034ff91db0f9d103896eada9ad82d928058d90090964df0c3ec2f74b8b8d6e` on BOTH trees.** The
instrument is `bio-plane/test/rec97-noextent-digest.mjs`, a NON-suite so it can run against a
tree that does not contain this item, and the figure is pinned in
`test/cite-extent.test.mjs` section 8 so it is re-measured every run. An absent extent IS the
whole document (Bob's 5.3, §14.4, no `unstated`).

### CONSUMER IMPACT, MEASURED

`grep -rn 'op=cite\|"cite"' civicos-ui agent-worker bio-plane/src`, 2026-09-14:

- **`civicos-ui/app.html` — THE ONLY PRODUCTION CALLER**, one call site (`actAsk("cite",
  params)`), sending `project`, `handle`, `note` and — on the question arm — `role`. It sends
  no extent today and is unaffected; the composer's stated sentence is CORRECTED by this
  landing (the act now carries an extent; the PAGE PICKER is still absent and that is a UI
  item, delegated back).
- **`agent-worker` — ZERO callers.** Forty-seven matches for the string `cite`, none of them
  an op call; the investigative run writes suggested legs through `op=promote`, which REC-84
  already carried.
- **`bio-plane/src/skilldoctrine.mjs`, `affordances.mjs`, `schema.mjs`** — prose only; the
  `cite` row in `affordances.mjs` publishes the act's label and weight and names no
  parameters.
- **Suites:** `civicos-ui/test/cite-act.test.mjs` and `finder.test.mjs` drive the act with no
  extent and are unaffected (both green). `civicos-ui/test/content-extent.test.mjs` carried
  UI-61's deliberate pin *"`op=cite` still carries NO extent"* with the instruction to
  revisit the day it did — **CORRECTED, never exempted**, and inverted to assert the new
  behaviour plus the still-absent picker.

### RESPONSES — awaited

- **RECORD** (owner and proposer): AGREE.
- **UI**, **SKILL**, **DIST**: not yet answered. CONDUCT resolves.

### WHAT THIS DOES NOT DO, STATED SO THE FRONTIER IS NOT MISTAKEN FOR COMPLETENESS

**THE COMPOSER DOES NOT YET EMIT AN EXTENT.** This IC widens the ACT end to end; no UI
surface sends one, because the picker UI-61 did not build still does not exist and building
it is a UI item rather than a line (a page set to choose from, and a page canvas for a
rectangle — UI-61's own second finding). It is a DELEGATION to UI in `CLAIMS.md`, not a note.
So IC-84's SETTLED, which CONDUCT writes, rests on this landing **plus** that UI item —
and the honest sentence today is *the act carries it, the surface does not yet send it*.

### RESOLUTION — ACCEPTED, **I3 15.0.0 → 15.1.0**, MINOR, 2026-09-14 by CONDUCT #11 — **recorded LATE, and the lateness is recorded with it**

ADDITIVE, as proposed: `op=cite` accepts the flattened extent scalars or a `content_id` as a BAG beside its seven parameters and splices them onto the leg it writes, routing the composed leg through REC-84's ONE grammar checker rather than owning a second; a field the act does not carry is REFUSED BY NAME, which is the whole point — **the defect this closes was a SILENT DROP, and a control whose value is silently discarded is worse than an absent one.** Four refusals in the existing C-45 family, no new C id. Measured consumer census: one production caller (`app.html`), zero in `agent-worker`.

**THE LATENESS IS PART OF THE RECORD.** REC-97's row was flipped `done` and its landing pushed before this RESOLUTION was written, so `origin/main` carried the built change for several commits while the registry still read 15.0.0 — and what caught it was not a gate but **the version line's own GAP**: writing IC-93's bump produced 15.0.0 → 15.2.0, and a missing 15.1.0 in a sequence is visible in a way a missing paragraph is not. That is worth more than the correction: **an IC resolution is owed in the SAME turn as the row flip that reports its landing**, because the row says the change is in the tree and the registry is what a consumer reads to know it. Nothing was built on the wrong number in between — the item's own consumer is UI, which sends no extent yet.

**RESPONSES, recorded by CONDUCT #11:** `UI` AGREE with an act owed and named — the composer STATES the whole-document default today and does not yet emit an extent, because the picker needs a page CANVAS `app.html` does not have (NOT persistence: `page_count` is the stored page set, landed by CAP-9, and saying otherwise would be a blocker stated too wide). `SKILL` NOT-AFFECTED, answered FOR by CONDUCT — the assistant's productions mint through `op=contentmint`, not through the citation act. `RECORD` AGREE (owner).

**IC-84 therefore stays CHANGING and is NOT settled by this**, which is the honest reading of its own RESOLUTION: that text records UI as answering *"the composer emits `extent` per leg"*, and the act now CAN carry one while the surface still sends none. SETTLED when UI-62 or a successor emits an extent from the composer end to end; CONDUCT writes it then.

## IC-92 · I5: THE OBSERVATION LOG — one `observations` table every level writes to, and `ai_run_log` FOLDS INTO IT · PROPOSED 2026-09-14 (REC-93, building `OBSERVATION-LOG-DESIGN.md` §8 row 1) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I5 (the store schema), currently **1.12.0 STABLE** (1.12.0 came from IC-86's resolution, FW-17, the same day)
- **Proposer:** RECORD, worker `agent-a239cb7601fee3669`, 2026-09-14, from QUEUE REC-93
- **Owner to land it:** `RECORD` (owner and proposer)
- **Consumers to answer:** `RECORD` itself (the writers and both reads), `CAPTURE`
  (`recordCapturedLocator` is in its acquire path and its answer gains three keys —
  additive), `UI` (nothing consumes `op=frontier` yet; the member-facing surface is
  Program B's and is explicitly NOT rowed in the design)
- **Change class:** **ADDITIVE at the schema** — one new table and three indexes,
  placed BEFORE the `host_governor` block, cleared by the whole-store purge arm and
  deliberately LEFT by the per-bundle arm → MINOR bump (**1.13.0**)
- **The id was MINTED with `node tools/mintid.mjs IC`** (floor IC-87; IC-88..IC-91
  already held and stepped over).

### I3 IS UNCHANGED IN SHAPE, AND THAT NON-CHANGE IS MEASURED RATHER THAN ASSERTED

REC-93's row says *"I3 unchanged in shape and RECORDED as such"*, so it is recorded
here with its evidence rather than as a sentence.

`op=airunlog` now reads `observations` instead of `ai_run_log`. Its envelope does not
move — same keys, same bound, same vocabularies travelling with the answer — and,
more to the point, **its VALUES do not move either**. That was the real risk and it
is not hypothetical: §3 makes `seq` STORE-WIDE, while `op=airunlog` has always
published 1, 2, 3… per run. An unchanged envelope carrying changed numbers is the
worst shape an interface change can take, because no consumer's schema check would
ever catch it. The read therefore re-derives the ordinal within the authority.

**The proof is a before/after comparison against the PRE-ITEM BUILD, not a digest
this item computed and pinned against itself.** `bio-plane/test/rec93-fold-digest.mjs`
boots the checkout at `f38af22` and this one from the same fixture, drives the same
run through `op=airunopen` / `op=airuntick`, and compares the raw response text:

    3,120 bytes · sha256 10bf6e28346b652793d7cd64d9ca56f5c09cea5a5da830641ea5f24be74a4a1a
    IDENTICAL — before and after the fold

A digest computed after the change proves only that the answer stopped moving; this
one is the OLD behaviour's own answer. The suite re-checks the pin every run and
also asserts it is not `e3b0c442…`, the sha256 of the empty string, which has been
recorded twice in this repository as a "byte-identical" result over nothing.

**The NEW op is `op=frontier`**, and a new op is additive to the OPS table rather
than a change to an existing contract, so it does not move I3 by itself. It is
gated on the same viewer stamp as `op=airun`/`op=airunlog`, for the reason §6 gives:
a frontier subject discloses a project's interest, so REC-36's withholding applies
row-whole across the fence.

### WHAT THE TABLE IS, AND THE ONE RULE THAT MAKES IT WORTH A SCHEMA CHANGE

`STORE-AS-CACHE.md` settles the architecture: THE RECORD AND THE OBSERVATION LOG ARE
SEPARATE, WITH DIFFERENT LIFECYCLES. The record is write-once, content-addressed and
never evicts, so folding a failed look into it makes every failed look either a
phantom capture or nothing at all. This table is what lets **absence be RECORDED
rather than retried away**, at the cost of one row and zero record bytes.

**ONE TABLE FOR ALL FOUR LEVELS**, because a log per level is the D-164 failure
(built three times, drifts) arriving in the coverage record. REC-94 (content),
REC-95 (meaning) and REC-96 (the completeness statement) write into THIS table at
THIS vocabulary — which is why REC-93 is the foundation item and why the append site
is deliberately ONE function.

### THE SCHEMA, AND THE THREE RULES I5's OWN ENTRY IMPOSES

All three are honoured and each is asserted in `test/observation-log.test.mjs` §A:

1. **BEFORE the `host_governor` block** — asserted by POSITION, not by eye.
2. **No backtick in the literal** — asserted over this block specifically. A
   balanced stray pair still parses, so `node --check` cannot see it.
3. **Named in `op=purge`** — and here the two arms do OPPOSITE things on purpose,
   which is the one place this row departs from the pattern every previous I5
   addition followed. §7: *"Purge of a bundle LEAVES its observations. They are the
   coverage record, not derived from the bundle."* The whole-store arm clears it
   (D-113 applies as to every table); the per-bundle arm deliberately does not, and
   a `result_ref` to a capture that purge removed is ANNOTATED at read time as
   purged and never rewritten. Erasing the record of a look because its result went
   is how a store forgets that it ever searched.

Columns are §3's, verbatim, with **two deviations that are stated rather than
smuggled** and both reported as DESIGN GAPs in REC-93's report:

- **`subject` is NULLABLE** where §3 writes `NOT NULL`. §4.4 requires `ai_run_log`'s
  rows to fold in and read back unchanged, and that table has always permitted a row
  with no subject. A `NOT NULL` would force the fold to INVENT one.
- **`subject_kind` gains a sixth value, `unstated`**, not in §3's list. `ai_run_log`
  never recorded a subject's KIND, so every folded row would otherwise have to be
  assigned one by DERIVING it from the level — a fact about rows already written,
  invented after the fact. `unstated` says the true thing.

### TWO NEW REFUSALS, C-22.9 AND C-22.10, IN THE EXISTING FAMILY

The C-22 family CHANGED SUBJECT rather than merely growing: C-22.1, C-22.2, C-22.3
and C-22.6 stopped being THE RUN's refusals and became THE TABLE's, enforced at the
one append site every level writes through. They are in this family and not a new
one because a new `*_CHECKS` family is a floor in `civicos-ui/check-refusal-codes.mjs`
that buys slack for everybody else's walk. The family header's count was corrected
in place from EIGHT to TEN, and `airun.test.mjs` ARM D1 — which pins that number and
has now fired on three consecutive items — was CORRECTED, never exempted.

- **C-22.9 `OBS_AUTHORITY_UNNAMED`** — a look the record cannot say WHY it made is
  not recorded. RFC 2308's rule as `STORE-AS-CACHE.md` carries it. **It is also the
  single place §4.6's provisional is ENFORCED**: a member's ad hoc search is never an
  observation, and what stops it is not a missing writer (any later item could add
  one without noticing the doctrine) but that there is NO `authority_kind` a member's
  search could take. The alternative §4.6 declines (`authority_kind = member`) is
  absent from the vocabulary on purpose, so reversing the provisional costs one line
  and no schema change — exactly what §4.6 says reversal should cost.
- **C-22.10 `OBS_PRESENT_NO_REFERENT`** — a `PRESENT` that names nothing it found is
  a coverage claim with no evidence under it (the WARC lesson). **It does not fire on
  `authority_kind = run`**, and that carve-out is a measured conflict between §3 and
  §4.4 rather than a convenience: `ai_run_log` has no `result_ref` column, so no row
  ever written to it can satisfy the rule, and `op=airuntick` accepts a
  caller-supplied `PRESENT` today. Enforcing it over `run` would drop rows out of a
  coverage record or force the fold to invent a referent. It is a DEBT row (D-366),
  not a permanent shape, and closes when REC-95's writers carry referents.

### WHAT A CONSUMER MUST DO

**Nothing.** Every existing op answers as it did; `op=frontier` is new and optional;
`recordCapturedLocator`'s answer gains three keys (`observation`,
`observation_written`, `observation_refused`) and loses none.

### WHAT REVERSING COSTS

The table and its indexes drop cleanly and nothing else depends on them yet. The
expensive half is the FOLD: `ai_run_log` is dropped after `#migrate` copies its rows
across, so reverting after a store has booted on this build means re-deriving that
table from `observations` where `authority_kind = 'run'` — mechanical, and lossless
except for `subject_kind`, which the old table never held. **Reverting after REC-94,
REC-95 or REC-96 have landed is a different question and should be assumed
expensive**: they are three more writers into this vocabulary, which is the whole
reason this item was sequenced first.

### RESOLUTION — ACCEPTED, **I5 1.12.0 → 1.13.0**, 2026-09-14 by CONDUCT #11 — **and the table is `observation_log`, renamed in the integration commit**

ADDITIVE, as proposed: one new table and three indexes, every level writing through ONE append site with its refusals read out of the map, the frontier view and its bounded read, and `ai_run_log` FOLDED so `op=airunlog` reads through unchanged. **The fold is the part that needed proving and was proved twice against the real pre-item build**, because `seq` moved from per-run to store-wide and an unchanged envelope could have carried changed numbers invisibly: a before/after digest (3,120 bytes, identical) and a migration probe that re-opens a store the OLD build wrote, with every row migrated, the NULL subject PRESERVED rather than invented, and idempotence on re-boot. I3 is therefore unchanged in VALUE and not merely in shape, and that distinction is recorded because it is the one a reader would otherwise have to take on trust.

**THE TABLE IS NAMED `observation_log`, NOT `observations`** — BOB #11's correction (`524427a`), paid by CONDUCT inside the merge commit because the worker was already running when it landed and no channel reaches a subagent mid-run. The argument is the one this record makes everywhere else: `runtime_observations` is a fact about what WE cost and `captured_locators.observations` is a per-address fetch counter, so a third thing under that word would put ONE WORD ON THREE UNRELATED THINGS — and `ai_run_log`, the table this one generalises, is the naming precedent rather than an invention. **The WIRE KEY `observations` on `op=stats` is deliberately unchanged**: it is a count of observations, it reads correctly, and moving it would have been an I3 change nobody owed.

**RESPONSES, recorded by CONDUCT #11 at integration:** `RECORD` AGREE (owner; the writers and both reads land in its ground and its own gates fired on the item six times). `CAPTURE` NOT-AFFECTED, answered FOR by CONDUCT — the acquire-time writer is additive and the capture path's shape does not move. `SKILL` NOT-AFFECTED, answered FOR by CONDUCT — `op=airunlog` reads through unchanged, proved by digest rather than asserted. `UI` NOT-AFFECTED, answered FOR by CONDUCT, and its harness earned the answer rather than being waved through: it caught a vocabulary value that was a TOKEN rather than a PHRASE while the whole plane battery was green.

**Two things are recorded as owed rather than settled here**, because an IC that hides them would be the registry lying by omission: **§3 and §4.4 of the design cannot both hold** (a `subject NOT NULL` rule against a folded table that permits a NULL subject and has no `result_ref` column), resolved conservatively at every site with the document's reconciliation owed to the design; and **D-366 is open** — a run can still record *we looked and it is there* with nothing to point at. SETTLED when REC-94, REC-95 and REC-96 have written into this table at the other two levels and the design's §3/§4.4 contradiction is reconciled; CONDUCT writes it.
---

## IC-93 · PROPOSED · 2026-09-14 · SK-8 — THE EXTRACT RUN'S PRODUCTIONS: two ops on I3, one table on I5, and the first producer of a step I2 has carried since CPDF-10

**Interfaces: I3 (op contracts, RECORD's) and I5 (the store schema, RECORD's). ADDITIVE on both.
I2 IS NOT CHANGED and is CONFIRMED instead — see the `IC-2 · CONFIRMED` entry below, which is an
AMENDMENT to an existing IC rather than a new one, per SK-8's queue row.**

**WHAT THIS IS.** `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3 answered D-358 on 2026-09-14: the
EXTRACT role runs in DEC-62's RUN, with **no new runtime, no new credential class and no new fence**.
SK-8 builds `EXTRACTION-BREADTH-DESIGN.md` §4's third production — a proposed reading — inside that
run. Nothing existing is reshaped.

**THE CHANGE, stated as what a consumer would see.**

- **I3, two new ops.** `op=extractpropose` (mutating; an act of a run — named in `AI_RUN_ACTIONS`,
  refused by the STORE without a live EXTRACT run) and `op=extractproposals` (read; scoped to a run
  or a document, refusing an unscoped listing by name). Both take the `contentmint` class cut and the
  `contribute` capability, and both are gated on the server-side `viewer` stamp. `proposedBy` is
  stamped server-side on `mintedBy`'s exact rule and a caller-supplied one is never read.
- **I3, one field added to an existing answer, and it is the only one worth a consumer's attention:**
  nothing else moves. No existing op's request or response shape changes.
- **I5, one new table**, `proposed_readings`, before the `host_governor` block, in both purge arms
  and counted in `op=stats` as `proposedReadings`. **No existing table gains or loses a column.**
- **One new term in an existing published vocabulary:** `RUN_BOUNDS` gains `mints`. It is a ROW in a
  table that already stores `allowed` and `consumed` per bound, which is what §7.3 (5) meant by *no
  schema, no new vocabulary* — UI-38's field-name-blind renderer shows it with no edit.

**MEASURED CONSUMER IMPACT — the census, taken 2026-09-14 on this tree and not recalled.**

- `civicos-ui/**`: **0** occurrences of `extractpropose`, `extractproposals` or `proposed_readings`.
  Nothing renders a proposed reading and none is invented. **NOT-AFFECTED, and this is a measurement
  with a shelf life** — SK-7's own claim that "no surface renders a content row" was correct when
  measured and FALSE within a day, so this is dated rather than asserted.
- `agent-worker/**`: **0**. The fleet member calls neither op. **NOT-AFFECTED, with one act owed and
  named below.**
- `newgroup/**`: not examined for callers — it embeds a built plane artifact and calls no op by name.
- Inside `bio-plane/`: the ops' only callers are SK-8's own suite and its control harness.
- **`RUN_BOUNDS`'s consumers were measured rather than assumed**, because a bound roster is read in
  five places: `airun.test.mjs` ARM V5 pins the SET EXACTLY and **goes RED by design** on any
  addition (corrected in this landing, never exempted — FL-7's ARM V6 precedent, which went red the
  same way when a third ENDING landed); `agent-worker/test/harness.test.mjs` asserts every bound the
  harness names is one the plane declares, which a NEW plane bound cannot break; `skillpack.test.mjs`
  and `skilldoctrine.test.mjs` harvest the keys into a copied-term corpus, and `mints` appears as a
  string literal in neither module; `civicos-ui/check-refusal-codes.mjs` arm E reads it as a
  DEC-49-shaped vocabulary and `mints` carries its sentence like every other row.

**THE CHANGE CLASS.** ADDITIVE on I3 (two ops, no existing shape touched) and ADDITIVE on I5 (one
table, no existing column touched) — **MINOR on both** by the registry's own rule. A consumer that
ignores all of it sees the interface it saw yesterday.

**CONSUMERS TO ANSWER:** `RECORD` (owner of I3 and I5), `UI` (not affected by measurement; the
surface on which a run is requested and its productions reviewed is Program B's, §7.3 (7)), `FLEET`
(not affected by measurement, **one act owed: an `extract` row in `agent-worker/src/harness.mjs`'s
`MODES` is what would let a fleet member DRIVE such a run, and adding one is a deployment act in
FLEET's lane pinned by SK-4's `skillsequencing.test.mjs` ARM B4 — SK-8 did not reach into it**),
`DIST` (not affected), `CONTENT-PDF` and `FRAMEWORK` (not affected; both dormant — CONDUCT
answers-for in writing).

**CONDUCT takes the version bumps and the RESOLUTION.**

### IC-2 · CONFIRMED by SK-8 (the `ai(function, version)` step's FIRST PRODUCER) · 2026-09-14

**AN AMENDMENT TO IC-2, NOT A NEW IC, and SK-8's queue row says so explicitly** — the interface line
reads *"I2 — the `ai(function)` step is DESIGNED (textchain's chain grammar); its first producer
confirms at IC-2"*. This is the COFF-3 / COFF-5 pattern, run on a step kind instead of on the
extraction envelope: a producer confirms a designed shape from its own as-built code, inventing no
variant, and a drift would be a COUNTER here rather than a silent fork.

**WHAT IS CONFIRMED, from as-built code.** `STEP_KINDS.ai` has been in `bio-plane/src/textchain.mjs`
since CPDF-10, classified `derivation`, with `checkChain` refusing an `ai` step that names no
performer (`TEXT_CHAIN_STEP_UNNAMED`) and `describeChain` rendering `engine (version)`. **Nothing
emitted one until 2026-09-14.** `op=extractpropose` now does, through `appendStep`, and the shape it
emits is the designed shape unchanged: `{ step: "ai", engine: <function>, version, cap }`.

**THE ONE THING A READER WOULD OTHERWISE GET WRONG, stated rather than left to be discovered.** The
design writes the step as `ai(function, version)` and the landed grammar carries the performer in
**`engine`**, shared with the `ocr` step. **The producer uses `engine` and I2 is NOT reshaped** — a
second field spelled `function` would be a shape change to an interface for a producer's
convenience, which is what confirming rather than amending means. So `I2 STAYS AT 1.5.0` and this
entry adds no version.

**AND ONE INEXACTNESS IS RAISED RATHER THAN EDITED, because the word is I2's and I2 is FRAMEWORK's.**
`STEP_KINDS.ai.label` reads *"a model rewrote the text"*, and a proposed reading rewrites nothing —
it reads text the record already holds and proposes what that text NAMES. So `describeChain` over a
proposal's basis says a model rewrote text that no model touched. **The direction is conservative**
(it can only weaken what a reader believes about the text, never strengthen it), which is why it is
not urgent and why SK-8 did not reach into another area's vocabulary to fix it. It is reported as a
**DESIGN GAP** against `textchain.mjs`'s `STEP_KINDS` and is CONDUCT's to route: either the label
widens to cover a model that READ rather than rewrote, or the `ai` kind splits, and both are I2
decisions.

### RESOLUTION — ACCEPTED, **I3 15.1.0 → 15.2.0** and **I5 1.14.0 → 1.15.0**, both MINOR, 2026-09-14 by CONDUCT #11

ADDITIVE on both, as proposed and as the registry's own rule scores it: two new ops and one new table, with no existing column touched and no existing answer reshaped — a consumer that calls neither op sees the versions it saw before. **I2 IS NOT CHANGED AND IS CONFIRMED INSTEAD**, which is the part worth stating rather than passing over: the `ai(function, version)` step has been in I2's chain grammar since CPDF-10 and carried by every version since, and this item is its FIRST PRODUCER — so what the registry records is a producer arriving for a shape that was already contracted, not a shape changing. **A confirmation is not a bump**, and recording it as one would teach the registry that the contract moved when only the world did.

**RESPONSES, recorded by CONDUCT #11 at integration:** `SKILL` AGREE (owner and proposer). `RECORD` AGREE — the run, its bounds table and the content rows the productions mint are its ground, and its own totality guards fired ten times on this item and were answered at their sites. `FRAMEWORK` NOT-AFFECTED as an interface owner and answered FOR by CONDUCT in writing: I2 is confirmed, not changed. `UI` NOT-AFFECTED, answered FOR by CONDUCT — no surface renders a proposal yet, and the member-facing surface on which a run is requested and its productions reviewed is Program B's by §7.3 (7).

**ONE THING THIS RESOLUTION FIXES RATHER THAN RECORDS, because it was a leak and not a shape:** the proposal's own minted-to-cited ratio — the instrument §7.3 (6) put there to catch a machine manufacturing work nobody asked for — counted content rows with NO BUNDLE PREDICATE when scoped by run, making the anti-manufacturing instrument an oracle for projects the caller was never invited to. It was found by this item's own `gate-reads` guard, because classifying a new read means writing what its answer ranges over and that sentence could not be written truthfully. The denominator is the scope's own documents through `#viewerSees`, capped and published. **A guard that forces a sentence to be written is how a leak gets found before a member does.**

**RAISED ON IC-2 RATHER THAN EDITED, and left for FRAMEWORK:** `textchain.mjs`'s `STEP_KINDS.ai.label` reads *"a model rewrote the text"*, and a proposed reading rewrites nothing — conservative in direction (it claims more transformation than occurred, not less) but inexact. SETTLED when a model actually runs behind `op=extractpropose` and the step's first real chain is inspected live; CONDUCT writes it.

## IC-100 · I2: THE OFFICE ENTRIES' `text()` RETURNS THE CONTAINER'S **INNER** EXTENT — a sheet's bound and used range, a slide's shape count · PROPOSED 2026-09-15 (COFF-11, closing D-359's producer half) — the version bump and the RESOLUTION are CONDUCT's

- **Interface:** I2 (what `structure()`/`text()` must emit), the TEXT shape only. `structure()`
  is not touched by this item and neither is I7 (an entry's slot contract is unchanged — this
  is what one entry RETURNS, not how it is registered).
- **Proposer:** CONTENT-OFFICE, worker `agent-a173c7a4a6b96b92e`, 2026-09-15, from QUEUE COFF-11.
  The area is dormant and CONDUCT answers-for on the row.
- **Owner to land it:** `CONTENT-OFFICE` (owner and proposer) for the producer half;
  **the consumer half is CAPTURE's and is DELEGATED** — see the measured impact below, which
  is the part of this row that matters most.
- **Consumers to answer:** `CAPTURE` (`op=acquire`'s FW-15 wire, `src/index.mjs`), `RECORD`
  (`#containerExtentForCapture` in `src/store.mjs` and the three `covers` predicates in
  `checks/bio-checks.mjs` — **all three already read these keys and none needs an edit**).
- **Change class:** **ADDITIVE.** Six keys are added and none is removed, renamed or
  re-typed; every existing key on every existing unit is byte-identical, which the three
  format suites pin by whole-object comparison → MINOR bump (**CONDUCT's to take**).
- **The id was MINTED with `node tools/mintid.mjs IC`** (floor IC-93; IC-94..IC-99 already held
  and stepped over).

### THE SHAPE

`text()` on the two SPREADSHEET entries (`xlsxText`, `odsText`) — each `sheets[]` unit gains:

    rows      : <int> | null     the BOUND — the grid this format makes ADDRESSABLE
    cols      : <int> | null     (the figure `coversSheetCell` compares an address against)
    usedRows  : <int> | null     the USED range — how far this workbook's cells actually reach
    usedCols  : <int> | null

`text()` on the two DECK entries (`pptxText`, `odpText`) — each `slides[]` unit gains:

    shapes    : <int> | null     the slide's shape count, 0-based references 0..shapes-1

The two WORD-PROCESSING entries (`docxText`, `odtText`) are **UNCHANGED**: `paragraphs[]`'s
LENGTH is already the count, which is why that arm has been fully fed since CAP-12.

### THE DECISION THIS ROW CARRIES, AND IT IS NOT A DETAIL OF THE SHAPE

**THE BOUND IS THE CONTAINER'S CAPACITY — what the format makes it POSSIBLE to address — and
never what the capture happened to FILL.**

For a SLIDE the two coincide and there is no decision: a shape list is EXHAUSTIVE, there is no
empty shape that exists, so shape 9,999 of a four-shape slide is not an empty shape, it is no
shape. Refusing past the count refuses only the impossible.

For a SHEET they do not coincide, and choosing the used range would have been a defect.
`Summary!D500` on a sheet filled to row 12 names a cell that EXISTS in the workbook and was
EMPTY at capture — and in this product an empty cell is routinely the finding ("the
disclosure's Schedule B was left blank"). Refusing it is the record refusing a TRUE statement,
and it does not stop the member citing: it pushes them up to the WHOLE DOCUMENT, which claims
MORE and not less. That is the reason already ruled twice in this plane, at
`#pageSetForCapture` and at `#containerExtentForCapture`, applied one construct further in.

So `rows`/`cols` is the grid and `usedRows`/`usedCols` is emitted BESIDE it under its own name,
because they are two different facts and a later reader must be able to tell "empty at capture"
from "outside the grid" without either figure pretending to be the other.

**AND A BOUND IS EMITTED ONLY WHERE THE FORMAT FIXES ONE.** OOXML fixes the grid and it was
MEASURED rather than cited (`MEASUREMENTS.md` M-21: LibreOffice 26.8.0.3 kept `XFD1048576` and
dropped `A1048577`, `XFE1` and `ZZ9999999` on an xlsx round-trip — the last being D-354's own
example address, so the bound refuses something real). **OpenDocument fixes no maximum table
size at all** — the grid is the producing application's and the file does not record it — so
`.ods` emits `rows: null, cols: null` with its used range beside them. Undetermined is
first-class and STATED; borrowing OOXML's figure would be this reader inventing a bound the
format never fixed, and the `odsborrowsgrid` control arm exists to stop a later session doing
it quietly.

### THE CONSUMER IMPACT, **MEASURED**, AND IT FALSIFIES THE PREMISE THE ROW WAS WRITTEN ON

COFF-11's brief, D-359's "CLOSING IT TAKES" and this item's QUEUE row all say the same thing:
that `op=acquire`'s wire *"reads the I2 shape BY KEY PRESENCE, so a producer that starts
returning a field is fed with no edit to the wire"* and *"CAP-12's wire then carries them with
no edit — it reads `sheets[].rows`/`cols` and `slides[].shapes` already"*.

**Measured on `origin/main` at `dc697b5`, that is TRUE of the LEVELS and FALSE of these six
keys.** `src/index.mjs`'s FW-15 projection reads which LEVELS a container itemises by key
presence — `const has = (k) => Array.isArray(i2text[k])` — and then builds the stored object
with the inner figures as **literals**:

    sheets: sh ? sh.map((s) => ({ name: …, rows: null, cols: null })) : null,
    slides: sl ? sl.map(() => ({ shapes: null })) : null,

`slides` does not even bind its element. So a producer emitting these keys is **not read**.

The other two consumers were checked the same way and are genuinely ready:
`#containerExtentForCapture` already tests `Number.isInteger(s.rows)` / `s.shapes`, and
`coversSheetCell` / `coversSlideShape` already compare against them. **One file needs three
lines and it is the one file this row's scope forbids**, so it is DELEGATED rather than taken
(`CLAIMS.md`, 2026-09-15).

**The sufficiency of that delegation is MEASURED, not predicted.** The three-line passthrough
was applied as a temporary arm, the end-to-end suite run, and the file restored byte-identically
(545,806 B, sha256 `991c44d1d87f…`, verified by sha256 AND `cmp`; `git status` clean on it).
Under the arm exactly three assertions flipped and nothing else:

- `A1048577` — one row past the measured grid — went from MINT to **refused C-45.1 BY NAME**:
  *"sheet 'Summary' of this capture holds 1048576 row(s) (1-1048576) and the extent names row 1048577"*
- shape 9,999 of a two-shape slide likewise: *"slide 1 of this capture holds 2 shape(s) (0-1) and the extent names shape 9999"*
- and the suite's own "the RECORD still holds NULL for both" assertion, which exists to make
  that state visible.

`ZZ999999` (row 999,999) kept minting under the arm, which is the decision behaving exactly as
designed: that cell is inside the grid, so it exists and was empty at capture.

### WHAT A CONSUMER MUST NOT ASSUME, stated because the shape invites it

- **A slide unit list is not positionally aligned with slide numbers.** `pptxText` pushes only
  slides whose part could be READ, so an unreadable slide shortens the array while the surviving
  units keep their true `slide` number. The existing wire maps positionally
  (`sl.map(() => …)`); anything reading `shapes` should key on the unit's own `slide`.
  Pre-existing and not introduced here, named so the delegated edit does not inherit it.
- **`null` and `0` are different.** An UNREAD sheet emits its bound (it is still an XLSX sheet)
  and a NULL used range (nothing walked it). A sheet with no cells emits a MEASURED `0`.
- **`usedRows`/`usedCols` bound nothing.** No consumer should refuse against them; that is the
  decision above, and `usedrangeasbound` is the control arm that breaks the suite if a later
  session wires them in as a fence.

### VERIFICATION AT THE PROPOSAL

Battery green own-baseline (201/201 · 12,467 pristine → the same suites green after), the four
suites pinned by whole-object comparison where the shape could regress, and **seven negative
control arms plus a baseline, all AS DECLARED** (`bio-plane/test/nc-coff11.mjs`, results in each
suite's `NEGATIVE CONTROL:` line), two of which arm the DECISION itself rather than the patch.
