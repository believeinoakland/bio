# reading-pipeline (T50)

**Status** · session_01DB7ELQWnxgiNPnS5DJJeY9 · depth 2 · COMPLETE · handled B1

## Completion record (T50-58)

**Entries applied.**
- **R33 (lines).** `textUnitsOfText` (`bio-plane/src/reading-pipeline/index.mjs`): a text that is not HTML, holds no blank line (the same blank-line test R32 splits on, so a leading or trailing blank line counts as one) and has at least two non-empty lines is one `doc-para` unit per non-empty line, trimmed, `para` counting the non-empty lines from 0. A blank line anywhere keeps R32's paragraphs; a one-line text and an HTML page read as before. R15's bound, cap, `truncated` and named gaps apply unchanged (test).
- **R34 (title).** `titleOfHtml` (first `<title>`, else first `h1`–`h6` in document order; comments, `script`, `style` and `template` dropped, an unclosed one to the end), `titleOfMetadata` (R28's `metadata.title`), one cleaning rule (markup removed, references decoded as R32 decodes them, whitespace collapsed, trimmed, at most 200 code points, no glyph is none). The R1 reading carries `title` (HTML's, else null); a determined R2 reading carries the metadata's, else null. The key is absent on every failed reading (no store, no digest, bytes not held, not read as text, an entry producing no text or throwing, a reader that throws). Units, counts and provenance unchanged.
- **R4 (picture).** No code change: T43's `jpeg` and `png` entries (format-registry R29, R30) already make a picture a one-page document marked `no_text_layer`, so tier 3 selects page 0 by the existing rule, tier 2 is never asked, and ocr-worker R23 (merged in L1) transcribes it. `picture.test.mjs` already named R4; I added the chain (`pixels → ocr`) and the one text unit to its filled-picture arm.

**Measure (M-T50-4).** V4's walked file `shelter-log.txt` is not in the repository (it lived on the walked instance); I rebuilt its words from `build/plan/lane-journeys/browser/shots/v4-doc-shelter-1280.png` as a title line and four sentence lines (the screen shows one passage). `textUnitsOfText` before the change: single `\n` breaks 1 unit, `\r\n` breaks 1 unit, one line 1 unit, a blank line after the title 2 units. After: single `\n` or `\r\n` breaks 5 units (one per line), one line 1, a blank line after the title 2 as before. The exact bytes of the walked file are not known, so the shape (single breaks, no blank line) is the reading V4's "a single passage" supports, not a re-measurement of the file itself.

**Readings taken (BOB may CHANGE).**
1. R34 "a failed reading carries none": I took a failed reading to be one built by `failed()` or the R2 undetermined branch. An R1 reading whose reader finds no entities (found false, read_from_text true) is not failed and carries its title: most HTML pages have no entities and a title is wanted for them (screens-intake). A reader that throws is failed and carries none. A type with no reader (read_from_text false, "says so") carries `title` like any R1 reading.
2. R34 "else its first heading": a `<title>` element whose text has no glyph is none, so the heading is read in its place.
3. R34 for an entry's metadata: the cleaning rule (collapse, trim, 200) is applied to `metadata.title` too.

**Deferred.** None.

**Found in other modules.** The committed plane bundle `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`, BOB regenerates at layer close) is stale by this change. `extraction`'s tests have 4 reds that predate this job (the same 4 with my change stashed: R71 R72 R47 (C-51.7), R47 (T43, N862), R71 (T44; N869), R75; transcribe-words rows). `extraction` stores a reading whole, so `title` reaches `reading.title` for screens-intake with no change on its side; I did not read `extraction` and do not claim it stores the key.

**Tests.** `node --test test/m/reading-pipeline/` 133 pass, 0 fail (was 123; 10 new, in `text-units.test.mjs`, plus two arms changed: `pieces.test.mjs` pins every other byte beside R34's key, `picture.test.mjs` adds the chain and the unit). The module's other tests (`d606-perpage-ocr`, `tier2-wire`, `system/pdf-worker-binding`): 3 pass. `test/m/extraction/` (users): 169 pass, 4 fail, the same 4 without my change. Every new id R33 and R34 is named in titles.

**Checks** (from the process repository): `checks/format.mjs` 171 modules, 169 requirements files; 0 failures. `checks/architecture.mjs reading-pipeline` 28 product files, 93 relative imports; 0 failures. `checks/coverage.mjs reading-pipeline` 34 of 34 live requirement ids named by a test; 0 failures. `checks/ownership.mjs reading-pipeline tranche/T50` 5 files changed (the module's source, three tests, this record); 0 failures. `checks/run.mjs` over the product: architecture 0 failures for all 3,431 files; coverage 22 failures, none in reading-pipeline (other modules' not-yet-met ids, rule 5's inherited reds).

Size (session_01DB7ELQWnxgiNPnS5DJJeY9): test runs 9, module lines 1795

## J1 · COMPLETE

T50-58 reading-pipeline complete on job/T50/reading-pipeline (pushed). R33 (a text with no blank line split at its line breaks) and R34 (title: HTML <title>, else first heading; a determined entry reading carries its metadata title, else null; absent on a failed reading) are met in code and tests. R4's picture arm needed no code: the jpeg/png entries already make a picture a tier-3 candidate for page 0; its test now also checks the chain pixels -> ocr and the one unit.

M-T50-4 measure: V4's walked file is not in the repository; I rebuilt its words from the V4 screenshot (a title line and four sentence lines). textUnitsOfText before: single-break text 1 unit (\n and \r\n alike), one line 1, a blank line after the title 2. After: single-break text 5 units, one line 1, blank line after the title 2 as before. The shape is what V4's "a single passage" supports, not a re-measurement of the file's bytes.

Readings I took (CHANGE me if wrong): (1) a reading whose reader finds no entities is not "failed" and carries its title (most HTML pages find none; a reader that throws is failed and carries none); (2) a <title> with no glyph falls through to the first heading; (3) the 200-character cleaning applies to metadata.title too.

Tests: reading-pipeline 133 pass (123 before); module's other tests 3 pass; extraction's tests 169 pass, 4 fail, the same 4 without my change. Checks: format, architecture, coverage (34 of 34), ownership 0 failures; checks/run.mjs architecture 0 failures. Report: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (owner not_product) is stale by this change; regenerate at layer close. Details in build/jobs/T50/reading-pipeline.md.
