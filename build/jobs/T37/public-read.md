# public-read (T37)

**Status** · session_01EVsuVsSMCLWPNamMbxZHon · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

R23's "never … an archive or container record of it" against R32's archive pool (`#archivePool`, `index.mjs`:1199). The pool reads `published_shas` by ref, across every edition, because `published_shas` has no edition column. So: edition 1 carries material M, a member of archive A, and also carries (or merely does not include) photo P, which A also holds; edition 2 obscures P. At edition 2's commit `case-carriage` R8 registers A for no material, but the pool still finds A, registered under M's ref by edition 1, and edition 2's case file would carry A, which holds P's original.

What I build now, within my Uses: the pool also reads each copy-carried row's ref. Any archive the projection shows holding a copy-carried original (through its `container` record, outward) is carried for no material, is named in `unheld` ("the archive holds a photo this case carries obscured"), and ends the walk. An included row at the original's digest carries nothing of those bytes. This closes the case where some edition registered P's own record. It does not close the case where no edition ever registered P's record (P was never carried whole), because then the published projection does not show that A holds P.

The full fix, which needs a `Uses` change, so it is yours: public-read uses `publication.heldMaterialsOf(case, edition)` (its R57), and the pool keeps only the archives and records this edition's commit held. No other edition can then lend this one an archive. I would add it in this job on your word: about 6 lines and one test.

Second reading, no answer needed unless you read it otherwise: R3's "`publishedbytes` at the original's SHA-256 answers `NO_PUBLISHED_PART`" holds where no edition published the original. An original that an earlier edition carried whole stays served, since editions answer forever (`publication` R24), and only a court order withholds it (R28).

## J2 · REPORT

B2 and B3 applied. I merged tranche/T37 (case-grammar and K2223's Uses line). The archive pool now keeps only what this edition's commit held (`publication.heldMaterialsOf`). I kept the narrower walk, run over every registration, so an archive holding a copy-carried original is still named `why: "the archive holds a photo this case carries obscured"`.

Tests: 153 in public-read, 152 pass. The one red is mine and expected: the K2223 arm (`obscured.test.mjs`, the last test). In it, a photo never carried whole sits in an archive that edition 1 registered under another material's ref. T36's case-carriage still holds that archive at edition 2's commit, because it does not yet know about `obscured` (its R8 as amended). The arm goes green when case-carriage T37-34 merges, which comes before me in L8's order. Please say when it has merged; I merge the tranche, re-run, and post COMPLETE.

Checks: format, architecture, coverage (33 of 33) and ownership: 0 failures each.

## J3 · COMPLETE

T37-42 is done, on `tranche/T37` @ 50f65ce6ac (case-grammar and case-carriage merged in).

**Entries applied**
- **R23, the case file.** `caseFileFacts` (`index.mjs`) answers `obscured`: for each row stating `obscured`, its ref, its copy's SHA-256 and label as signed, and whether the commit registered the copy under that ref (`published_shas`, kind `obscured`, `materials/<sha>`). A row stating `obscured` is never an included material, whatever its `included` says.
  - `buildCaseFile` (`casefile.mjs`) carries the copy as one `obscured` file at `caseFilePath("obscured", ref)`, read from the published bucket by that hash. A copy that is unregistered, or whose bytes miss the digest, is not carried and is named in `unheld` (`what: "obscured"`).
  - Never the original. An included row at a copy-carried original's digest carries nothing of those bytes (`unheld`, `why` = `ORIGINAL_NOT_CARRIED`). An archive the projection shows holding such an original is carried for no material and ends the walk (`unheld`, `why` = `ARCHIVE_HOLDS_ORIGINAL`).
  - K2223 (B2): the archive pool keeps only what this edition's commit held (`publication.heldMaterialsOf`). The narrower walk runs over every registration, as kept.
  - The manifest states `CASE_FILE_FORMAT`, `bio-case-file/3`.
- **R3.** `publishedCase` answers `materials` through `case-grammar.materialsOf`, so a row answers `obscured: {copy, label}` exactly as signed and `obscured: null` without it. The original's hash answers `NO_PUBLISHED_PART`, the same bytes as a hash never published. No code change was needed for R3; tests added.
- **R28 with R23 (own flaw found, fixed here; K2145's reading).** An order naming a photo, by its `document` path under the row's ref or by its original's SHA-256, withholds its obscured copy too (`#editionItems`).

**Deferred:** nothing.

**In other modules:** nothing new beyond J1's cross-edition path, closed by K2223.

**Reading (mechanics §17).** Over 300 KB, so path (3).
- Read whole myself: `public-read.md`; layer 8's row of `layers.md`; `case-grammar`'s public R1–R22; `case-carriage` R1, R8–R13; `publication` R57; `ratification` R39; `casefile.mjs`; `index.mjs`:687–1230 (`publishedCase`, `caseFileFacts`, the archive pool and chain); `archives.test.mjs`, `casefile.test.mjs`, `fixture.mjs`; DEC-180; K2108, K2145, K2171, K2206.
- Two workers read the rest in full: the rest of the code, about 13 KB of summary, and the 31 other test files, about 15 KB. Every statement cites file:line.
- What they left out did not matter. They found nothing that pins `bio-case-file/2`, nothing that counts the case file's kinds, and no new `publication` method reached by a read that `published.test` spies on.

**Tests and checks**
- `node --test bio-plane/test/m/public-read/`: tests 153, pass 153, fail 0. That is the 146 existing tests plus 7 in `obscured.test.mjs` (R3, R23, R28, R32, the K2223 arm).
- I changed no service I provide, so no user module's tests were run. The manifest names no layer tests.
- `format`: 136 modules, 0 failures. `architecture`: 45 product files, 0 failures. `coverage`: 33 of 33 live ids, 0 failures. `ownership`: 4 files, 0 failures.

**P6:** module lines 3,501 (+62 net in src); the START estimated about 3,423.

Size (session_01EVsuVsSMCLWPNamMbxZHon): test runs 8, module lines 3501
