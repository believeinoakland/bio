# T53 R1 · file-scanner · rows

## plan-T53-draft.md

**file-scanner**
- C T52-100 · U5 · the streamed docx: renderer version moves with `plainPackage`
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## carried-T52-R1.md

- T52-100 · U5 (T52-13 settled by FILE-SAFETY #1, K5384) · MAJOR · the pinned LibreOffice 7.4.7.2 cannot load a streamed docx (data-descriptor flag 0x8, 28-byte extras; corpus docgen `alpha-B-6`); `renderer.mjs`'s `plainPackage` already converts it, but a render failed before stays failed because `renderer_version` holds only package versions (`handler.mjs:27`): file-scanner R36 (parked in `req-ahead-T52.md` until this round's START). Test with the streamed docx: refused by the old version, rendered once the version moves. After T52's redeploy (BOB's act 7) the live image is checked to carry `plainPackage` and capture `9dce360a…` renders.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 1 | file-scanner | 0 / 1 | 0 / 1 / 2 (3) |  |

## K5629: layer-1 findings folded (BOB #327)

- T53-520 · reader-container's finding, K5578 · the renderer's LibreOffice profile blocks linked pictures. Detail: as `reader-container` does (`BlockUntrustedRefererLinks`, with a control that shows the installed LibreOffice fetches a document's linked picture without it), the `SafeViewRenderer`'s profile makes a render never fetch an address the document names; test: a docx and an odt whose picture is linked to a local test address fetch nothing, and the same document with the setting off does. `[owed: BOB writes the line (behaviour: a render makes no network call); file-scanner is layer 1 and still open, so this goes to the open job, else a CHANGE]`
- T53-521 · req-ahead-T52, FILE-SAFETY #1 (K5384) · R36 into `build/requirements/file-scanner.md`. Detail: the job (FILE-SCANNER, COMPLETE) meets R36 and reports the text only in `build/plan/req-ahead-T52.md` (line 7, section "file-scanner (completion round; K5384)"), so a live requirement has no line in the requirements file. Copy the line below at the end of "Provides", after the line of R33 (R35 and R36 are the last ids; R36 is free), then remove it from req-ahead-T52.md, and record the Met mark. The exact line, with only its `*(not yet met: T52)*` mark removed:
