# office-readers (T33)

**Status** · session_01QtEmE6Gh2wQSGswWajw28K · depth 2 · WORKING · handled B2

## Completion

**Entries applied.** T33-10 (C:A-3; B §(d) EVENTS 3), on J1's four readings as K1513 settled them.
- R30: `xlsxEntry.text()` and `csvEntry.text()` give each sheet `cells`: `[{source, value, type, declared, cached, formula}]`, in row then column order. For xlsx, the type comes only from `t` (absent or `n` number; `s`, `str`, `inlineStr` text; `b` boolean; `d` date; `e` error). `value` is the stored lexical value (`<v>`, the inline string, or the resolved shared string), and `formula`/`cached` are R10's pair. An unresolved shared string has `value: null` and stays undetermined. An unknown `t` gives `type: null`, the token in `declared`, and a `cell_type_unknown` marker. A cell with no address has `source: null`. An unreadable sheet has `cells: null`. Over the guard `sheets` stays `[]`. For csv every non-empty field is `text` with `declared: null`, and a field the encoding cannot read has `value: null`. The text streams are unchanged.
- R31: `metadata` `{author, lastModifiedBy, created, modified, source:"docProps/core.xml"}` on docx, pptx and xlsx `text()`, built by one builder (`coreMetadata`/`withMetadata` in `docx.mjs`, imported by `pptx.mjs` and `formats-xlsx.mjs`). It is also given over the size guard. It is `null` when there is no readable core part: an unreadable part adds `{reason:"metadata_unreadable", part, why}` to `undetermined` and counts it, and an absent part adds nothing. csv's `metadata` is always `null`.

**Tests.** New `typed-cells.test.mjs`, with two R30 xlsx tests, one R30 guard test, one R30 csv test and two R31 tests. Every type, out-of-order input, the styled number not taken as a date, the formula with no cached value and R10 parity, the unresolved string, the unknown token, the cell with no address, an empty sheet, an unreadable sheet, both guards, csv under an undetermined encoding, metadata on all three formats with R10 parity, sparse, absent, unreadable and unparseable core parts, metadata over the guard, and csv `null`. Two R11 tests in `text.test.mjs` now leave out the new `cells` field from their whole-sheet comparisons (nothing in them is weakened), and the unread-sheet comparison also expects `cells: null`.

**Deferred.** None.

**Found in other modules.**
- Generated artifact made stale (§14): `bio-plane/dist/bio-plane.bundled.mjs` (it embeds the four changed source files). REPORT in COMPLETE.
- `odf-reader` R46 (T33-11) reads this contract field for field. This module does not export `typedCell`, because the `.ods` grammar differs, so odf-reader builds its own `cells` to this shape.

**Uses (final).** subresources, ooxml (unchanged).

**Tests and checks run** (on 511ed550e0, after merging `tranche/T33`):
- `node --test bio-plane/test/m/office-readers/`: pass 89, fail 0.
- Users present in the tree, odf-reader and format-registry: pass 84, fail 0 (173/0 with office-readers).
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture office-readers`: 13 product files, 45 relative imports; 0 failures. `coverage office-readers`: 31 of 31 live requirement ids named by a test; 0 failures. `ownership office-readers tranche/T33`: 7 files changed; 0 failures.

Size (session_01QtEmE6Gh2wQSGswWajw28K): test runs 9, module lines 3609

## J1 · QUESTION

Four readings of R30/R31 I am building on; I carry on with them unless you answer otherwise.

1. **R30 over the guard.** R30 says `cells` is `null` over the guard (R12, R13), but over the guard xlsx and csv `text()` already give `sheets: []` (R11/R12 as built and tested), so no sheet carries `cells`. My reading: `sheets` stays `[]` over the guard. The `null` rule then applies to every sheet entry whose cells were not walked: an xlsx sheet whose part could not be read gets `cells: null`, never `[]`.
2. **R31 "the reason is in undetermined".** If `docProps/core.xml` is present but unreadable, `metadata` is `null` and `text().undetermined` gets `{reason:"metadata_unreadable", part:"docProps/core.xml", why}`, counted in `counts.undetermined`. If the part is absent, `metadata` is `null` with no marker, because absence is normal OPC (ooxml R19). A marker there would raise the decode count that reading-pipeline and docprofile read for every file without core properties. `metadata` is also given over the size guard, since the core part is read whatever the guard says.
3. **R30 value and type.** For xlsx, `value` is the raw `<v>` (a boolean stays `"1"`/`"0"`; the text stream keeps `TRUE`/`FALSE`). A `t` token outside the format's list gets `type: null` and `declared` set to the token as written, with an undetermined marker `{sheet, cell, reason:"cell_type_unknown"}` (R22).
4. **A cell with no `r` attribute** gets `source: null`, as R10's formula item does. It is ordered after the cell before it.
