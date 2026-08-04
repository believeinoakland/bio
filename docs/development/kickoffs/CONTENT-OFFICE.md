# Session CONTENT-OFFICE — the office-format axis

Activated 2026-08-03 by CONDUCT, from BOB's office-formats decomposition (QUEUE inbox,
2026-08-03, drained the same day). Read `CLAUDE.md` first, then this, then your item in
`QUEUE.md`. Before making a change another session must know about, read
`ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — the coordination skill this ecosystem
runs on. Design sources, in authority order: `OFFICE-FORMATS.md` (the research),
`INTERFACES.md` I7 (the registry-entry contract, PROVISIONAL — written from design;
the code wins on drift, and COFF-1 CONFIRMS it from as-built code) and I2 (what
structure/text must emit), `INTERFACE-CHANGES.md` IC-1 (RESOLVED as amended — the
element-reference union: `pdf-page` / `sheet-cell` / `slide-shape` / `doc-para` /
`dom`).

## Paths this area owns

- `bio-plane/src/formats.mjs` (COFF-1 creates it — the FORMAT registry)
- `bio-plane/src/ooxml.mjs` (COFF-2 creates it — the container reader)
- the per-format entry modules and their tests (`bio-plane/test/formats*.test.mjs`,
  `bio-plane/test/ooxml*.test.mjs`, and the fixtures they need)
- COFF-1 ALSO moves two dispatch touchpoints it must NAME in its `CLAIMS.md` claim:
  `index.mjs`'s acquire-time `HTML_CT` site (~`:1836`) and the read-time
  `op=pdfstructure` dispatch (~`:1417`). CAPTURE and CONTENT-PDF are dormant, so this
  is a claim with a note, not a live delegation. Existing outputs are PINNED: the
  battery's HTML and PDF suites must pass byte-identical.

## The rules that bite here

- **Never invent structure.** A part that cannot be read yields a stated
  `undetermined`, never a partial silently presented as whole. Over the size bound →
  `text-undetermined` with the reason. The bound is a NAMED PROVISIONAL constant until
  COFF-6 measures it.
- **Magic bytes first, content type second.** A renamed plain ZIP is not a `.docx`.
- **DEC-5: the evidentiary extras are IN scope** — formulas beside cached values,
  tracked changes with author/date/superseded wording, speaker notes, hidden sheets,
  `docProps` metadata. They are frequently the finding.
- **The extras land under ONE shared I2 extension envelope**: the FIRST of COFF-3/4/5
  to land files it against I2 as IC-2 from as-built code; the other two CONFIRM
  rather than invent variants.
- Element references per IC-1 as resolved; `undetermined` stays first-class on the
  new forms (an unresolvable reference is carried with a stated `why`, never
  invented).
- Registry entries: `detect(bytes, contentType)` / `parts` / `structure` / `text`
  per I7.

## Verification

The standing gate (`VERIFICATION.md`): `cd bio-plane && npm run test:battery` — every
suite; your item's `accepts-when:`; the negative control RUN and recorded in the
suite's `NEGATIVE CONTROL:` line; `npm run test:coverage` --strict with no new
unreached surface. Report ends with what landed, what you learned, and any decision
item (CONDUCT lifts it into `DECISIONS.md` — do not write there yourself).
