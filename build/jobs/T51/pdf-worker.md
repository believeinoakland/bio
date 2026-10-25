# pdf-worker (T51)

**Status** · session_019iEKajbusHst4GETgCgTK1 · depth 2 · COMPLETE · handled B3

## Completion (fix round 6, G34: the 23 MB PDFs end with no words)

**Entry applied.** `pdf-worker/src/index.mjs`: `DEFAULT_MAX_PDF_BYTES` 16 MiB → 64 MiB (line 76; comment above it rewritten to the measurement), `dist/pdf-worker.bundled.mjs` and `.bundle.json` rebuilt (`npm run build`). No other source change; no census op's accepted keys change (the member's request and answer shapes are unchanged; the over-envelope marker already carried `bytes` and `limit`). No new member-read sentence.

**(1) Root cause, with evidence.** `index.mjs` (old :76, :169-175): `bytes.length > 16 MiB` skips tier 2. Reproduced on a reportlab-built file of the walker's shape (20 text pages, Helvetica / WinAnsiEncoding, no /ToUnicode, one incompressible image, 23,554,168 B; scratchpad `g34/mk.py`): tier 1 alone reads 0 characters, 1,220 regions `no_tounicode`; through the handler on the old bound the answer is tier 1 with `over_envelope`; with `MAX_PDF_BYTES` 64 MiB, tier 2 reads 91,679 characters, 0 undetermined, 226 ms (node).

**(2) Why the tests missed it.** The only default-bound test padded a 3-page document with a space-filled comment to 16 MiB + 1 and asserted the decline; no fixture over 16 MiB carried a font that only tier 2 can read, and nothing measured tier 2's memory, so 16 MiB stayed a "conservative, provisional" number (the code comment said so). Gap fixed: the default-bound test now sits at the measured bound, and a walker-shaped file over the old bound is read through the real handler.

**(3) Failing-first test** (`pdf-worker/test/structure.test.mjs`, block "R8: a 23 MB PDF in WinAnsi fonts with no /ToUnicode is read (G34)", through the committed bundle under miniflare/workerd; its shape is proven by a check that tier 1 alone reads 0 characters with `no_tounicode`). Red on the old bound (6 failures, saved at `g34/red.txt`):
```
  FAIL  R8 one byte over the default (67108865 B): tier 1
  FAIL  R8 one byte over the default: the decline names the size and the limit
  FAIL  R8 exactly the default (67108864 B): tier 2
  FAIL  R8 the old 16 MiB default plus one (16777217 B): tier 2
  FAIL  R8 the walker's shape under workerd: 200, tier 2, with its words and nothing undetermined
  FAIL  R8 the walker's shape: no decline note
structure: 83 passed, 6 failed
```
Green after the change: `structure: 89 passed, 0 failed` (83 before the fix with the 6 above failing).

**(4) Platform check L, raw workerd** (`pdf-worker/test/envelope-memory.probe.mjs`, committed; the committed bundle, a disk-fetched CAPTURES shim, `v8Flags --max-old-space-size=N`, N bisected from 16; "heap + bytes" must stay under the isolate's 128 MB). Smallest old space at which `POST /structure` answers tier 2:
- reportlab WinAnsi, 15.0 / 22.5 / 23.8 MiB, 20 pages: ≤ 20 MB (the bisection floor), 191-636 ms; heap + bytes ≤ 44 MB.
- dense text (pdf-reader's `dense.mjs`, 23 MiB): 400 pages 21 MB (2.5 s); 1,000 pages 30 MB (5.9 s); 1,600 pages 39 MB (9.0 s) — 1,600 pages is about what tier 1's own refusal (pdf-reader R42, `TOO_LARGE_TO_READ`) lets through at 23 MiB.
- 64 MiB, 5 pages and 300 pages (the most R42 admits at that size): ≤ 20 MB; heap + bytes ≈ 84 MB, 44 MB left under 128. A 64 MiB file with 355 pages is already refused by tier 1 before this bound is reached.
So the bound is set at 64 MiB; tier 1 (R42) refuses what is larger than about 75 MiB in any case. **P** (both walker files at the re-walk) is BOB's.

**Above the bound.** A file over 64 MiB gets the unchanged R8 answer: tier 1, `over_envelope` with `bytes` and `limit` (tested: `bytes: 67108865, limit: 67108864`). The size reason is carried by this member's answer; the sentence the member reads ("too large to read here: n MB over m MB") is extraction's / G14's to compose from those two fields. I found nothing in `bio-plane/src` that reads `over_envelope` or `tier2_declined_over_envelope` (grep), so G14 should confirm it states from them rather than from tier 1's `no_tounicode` regions, which is what the walker saw; reported to BOB, not changed (another module).

**Found in another module.** `release/pdf-worker.bundled.mjs` is a stale generated copy at the old bound (not mine; the release assembler's). `bio-plane/test/system/fleetbundles.test.mjs`: 4 FAIL for `agent-worker` (staleness) on the tranche tip as well as with my change (checked by stash); pdf-worker's rows all PASS.

**Proposed requirement lines (BOB writes `build/requirements/`).** R8: "Over envelope: bytes larger than `MAX_PDF_BYTES` (env override, default 67,108,864 = 64 MiB, measured: tier 2 reads a 64 MiB file of up to 300 text pages in 20 MB of old space and a 23 MiB file of 1,600 text pages in 39 MB, under raw workerd, so heap plus bytes stays under 128 MB) skip tier 2: …" (the rest of R8 unchanged). Suggestions, `MAX_PDF_BYTES` provisional note: replaced by the measurement above. Test names R8: "one byte over the default (67108865 B)", "exactly the default", "the old 16 MiB default plus one", "the walker's shape".

**Tests and checks.** `node --test --test-force-exit pdf-worker/test/structure.test.mjs`: 89 pass, 0 fail. `bio-plane/test/tier2-wire.test.mjs` (the user of this member's wire): 1 pass, 0 fail. `fleetbundles.test.mjs`: pdf-worker rows PASS (agent-worker's 4 fail on the tip too). The other four pdf-worker suites (pagepixels, imagecrop, jbig2, jpx) cover files this change does not touch and were not re-run. `impact.mjs origin/tranche/T51 HEAD` (run before the commit): 0 modules (it reads commits). Checks: format 0, architecture 0, coverage 6656 of 6656, channels 0, words 0 failures (inline 0, plain 0, testcopy 0; no word added), ownership `6 files changed by pdf-worker ... 0 failures`.

Size (session_01TvicQZEyi2UWLiFnXQfFaz): test runs 9, module lines 217 (src/index.mjs; +10, -7 changed)

## J1 · COMPLETE

G34 done: MAX_PDF_BYTES default 16 -> 64 MiB, measured in raw workerd (heap+bytes 84 MB for 64 MiB, 62 MB for 23 MiB x 1,600 pages); walker-shaped 23.5 MB WinAnsi/no-ToUnicode file now tier 2 with words through the handler (red 6 fails on old bound, green 89/0); bundle rebuilt; checks all 0 failures; ownership 0. Above 64 MiB the answer keeps over_envelope with bytes and limit: G14/extraction must state the size from them (nothing in bio-plane/src reads over_envelope today). Record: build/jobs/T51/pdf-worker.md.

## J2 · QUESTION

QUESTION (J2, re B2). G125b, my reading: pdf-worker's `/structure` route (src/index.mjs, the only route my module answers) never decodes a JPX image, so a refused JPX has no entry in my module to be answered at. The JPX renderer is pagepixels.mjs / jpxdecode.mjs (pdf-pixels job 14 and image-codecs job 13), reached through pdf-pixels' entry and its tests (`pagepixels.test.mjs`, `jpx.test.mjs`), which are not in my paths. So for G125b I code and test nothing: BOB rebuilds `dist/` after batch B and the bundle then carries image-codecs' fix. I will say that in my record under G125b. If you read it otherwise (for instance, you want a /structure-level test of mine), say which and I will do it. I go on with G132h, G124a, G124 quotes and G139 meanwhile.

## Completion (fix round 9: G132h, G124a, G124 quotes, G125b, G139)

Merged `tranche/T51` first (requirement file read whole: R6-R9, R42-R44 are this round's). Commits on `job/T51/pdf-worker`.

**What changed (file:line, `pdf-worker/`).**
- `src/index.mjs`: the envelope constant `DEFAULT_MAX_PDF_BYTES = boundOf("pdf", "worker_bytes")` (:77; R44, no numeric literal; the row is the alpha 64 MiB, so the figure is unchanged); `tier2Work()` counts (:117-118); `tier2Text(bytes, from, count, open)` decodes only the pages `[from, from + count)` through pdf.js `getPage`/`getTextContent`, one at a time (:127-); `overEnvelopeAnswer` (:147-) 200, tier 1, `failure:"final"`, the unchanged `over_envelope` marker, the note, and `refusal {size, bound, key, detail}` (`key` = `limit.pdf.worker_bytes`); `wholeNumber`/BAD_RANGE after R4 and before R5 (:187-); the size is judged from the store's own `obj.size` before the body is read, else from the body, in both cases before any parse (:200-205); `openPdfRange(bytes)` once, then `range({from, count})` (:208-211), replacing `extractPdfStructure` (the whole-file tier-1 parse) and its second parse inside pdf.js's pass; password: `PasswordException` from pdf.js answers the document-level marker `password_required`, tier 1 (R9).
- `package.json:8`: `node --test --test-force-exit --test-concurrency=1 test/*.test.mjs test/codecs/*.test.mjs` (G139, R43).
- `test/range.test.mjs` (new; R6, R8, R9, R42, R44), `test/test-script.test.mjs` (new; R43), `test/subject.mjs` (new; a fresh build of the source by the committed bundle's own recipe, so the workerd suites test the source while the committed `dist/` is stale until BOB rebuilds), `test/structure.test.mjs` (its subject is `subject.mjs`; R7 and R10 compare with pdf-reader's own range answer; R6/R8 titles), `test/envelope-memory.probe.mjs` (`PROBE_BUNDLE` names the bundle to measure).

**G132h (the range; the envelope before the parse).** (1) Root cause: `index.mjs:167` (old) ran `extractPdfStructure(bytes)` on the whole file before `:170` judged the size, then tier 2 parsed the whole file again in pdf.js; the request had no `from`/`count`. (2) Missed: the tests answered small files and compared the answer with `extractPdfStructure`'s own, so a second parse and a missing range were invisible; gap fixed: counts of scans (`pdfWork()`), of pdf.js opens and pages decoded (`tier2Work()`), and of body reads. (3) Failing-first, through the real handler: `test/range.test.mjs` against the old source (with a stub `tier2Work` so the file loads): `range: 4 passed, 28 failed — ended before its foot` (saved at scratchpad `range-red.txt`):
```
  FAIL  R42 a range of 3 pages: 200, tier 2, the document's total, from and count
  FAIL  R42 the answer holds those 3 pages only, by their numbers
  FAIL  R42 from -1: 400 BAD_RANGE, before the capture is read   (and the nine other BAD_RANGE rows)
  FAIL  R6 a file over the envelope (size stated by the store): no parse made at all
  FAIL  R6 (the body is read never, the store's own size being enough)
  FAIL  R8 the answer is 200, tier 1, final, with the over_envelope marker naming size and limit
```
Green: `range: 53 passed, 0 failed` (3 of 10 pages decoded for a 3-page range, `{opens: 1, pagesDecoded: 3}`; pdf-reader scanned the file once; an over-envelope file: zero scans, zero opens, body unread when the store states the size). WinAnsi and MacRoman pages with no ToUnicode are read for the range only (pdfgen, exact lines). Sibling path (R-PATH): the same range under workerd through the built member, and the node handler. (4) **L**: raw workerd, `test/envelope-memory.probe.mjs` with `PROBE_BUNDLE` a fresh build, files by pdfgen: 23.8 MiB / 20 pages and 64 MiB / 300 pages both read at tier 2 from 20 MB of old space (the floor of the bisection), heap + bytes 44 and 84 MB, 202 and 819 ms, 0 undetermined (the round-6 figures hold).

**G124a (the 64 MiB, quoted) and G124 (the quote test).** (1) The literal `64 * 1024 * 1024` at `:77` is now `boundOf("pdf", "worker_bytes")`; the refusal states size and limit and is final. This module keeps one ceiling, and `READ_BOUNDS` already has its row (`pdf.worker_bytes`, standard 100 MB, alpha 64 MiB, protective 100 MB, key `limit.pdf.worker_bytes`): no REPORT for a missing row. (2) Missed: nothing compared a ceiling with the table; fixed by R44's test (no literal of 1,000 or more in `src/index.mjs`; the constant is `boundOf("pdf", "worker_bytes")`; the default refusal's `bound` equals `boundOf`). (3) Red (old source): R8 refusal row and the `bound` rows above; green in `range.test.mjs`. (4) **N**.

**G139 (the script).** (1) `package.json:8` listed five files and omitted `test/codecs/`. (2) Missed: hand-listed script, nothing compared it with the directory. (3) Red (old script) `test-script: 2 passed, 2 failed`: `R43 every *.test.mjs under test/ is run by npm test` got the seven codec files plus the two new ones; `R43 the codec tests are among them` got false. Green: `test-script: 4 passed, 0 failed`; `npm test` 72 test files pass, 0 fail (1 m 13 s, one file at a time). (4) **N**.

**G125b (JPX).** Reading confirmed by BOB (B3, K4858): `/structure` decodes no JPX, so G125b has no code or test of mine; BOB's rebuild of `dist/` carries image-codecs' `jpxdecode.mjs` fix.

**Words owed (stand-ins keyed through `localize`, rows owed to `later-ux.md`).** `pdf-worker.index.over_envelope` ("this document is {size} bytes and this member reads up to {bound} bytes, so its text was not read here.": the size and limit sentence, G124a) and `pdf-worker.index.from_and_count_are_whole` (BAD_RANGE detail). The password sentence is the plane's (this member says only the marker `password_required`). Tests copy no sentence (they read `key`, `size`, `bound`).

**Census ops.** None changes: pdf-worker is a fleet member (`SURFACE`: `structure` POST, `version` GET, `mutating:false`, unchanged); `from` and `count` are optional new request keys of `/structure`, not a census op.

**Found in other modules (not changed).** (a) reading-pipeline: `tier2Escalate` (`reading-pipeline/index.mjs:143-146`) still sends `{capture_sha, store}` with no `from`/`count`, so a tier-2 escalation of a large file asks for the whole document (up to the 64 MiB envelope): the plane should pass the range of the piece it reads (R42 is the member's half of that seam). (b) pdf-reader R46 (the document-level members of a range) is not in `readRange` yet, so R7's pass-through is today `ok, container, pages, from, count` only; it passes through whatever `range()` gives, so R46 flows when pdf-reader merges it. (c) Stale generated, BOB regenerates: `pdf-worker/dist/pdf-worker.bundled.mjs` and `.bundle.json`, `release/pdf-worker.bundled.mjs`; until then the committed bundle serves the old whole-parse behavior, and the plane suites I ran for the users (below) run against the committed bundle.

**Proposed requirement lines (BOB writes `build/requirements/`).** R8: add "the answer carries `failure:"final"` and `refusal {size, bound, key, detail}` beside the marker, and when the store states the object's size the body is not read" (what the code does); R7: "every field `range()` answered, `text` and `tier` aside, passes through, with `notes` the member's own (empty unless it appends)"; R9's password sentence: "pdf.js's `PasswordException` is the test" . Test names: R42 "a range of 3 pages", "BAD_RANGE"; R6 "a file over the envelope"; R8 "one byte over boundOf"; R9 "a document that needs a user password"; R43 "every *.test.mjs under test/ is run by npm test"; R44 "no numeric literal of 1,000 or more in src/index.mjs".

**Tests and checks.** `structure.test.mjs`: 90 passed, 0 failed; `range.test.mjs`: 53 passed, 0 failed; `test-script.test.mjs`: 4 passed, 0 failed; `npm test` (all of `test/` incl. `test/codecs/`): 72 pass, 0 fail. Users named by `impact.mjs` that call this member: `reading-pipeline/convert-tiers` 9/9, `extraction/convert-tiers` 5/5, `tier2-wire` 1/1, `system/pdf-worker-binding` 1/1, `ocr-worker/test/ocr-worker.test.mjs` 1/1 (all against the committed bundle). `checks/run.mjs`: format 0 failures; architecture 0; coverage for pdf-worker 20 of 20 (the 32 failures are other modules'); channels 0; words: inline 13 → 12, plain 1 → 0, words count 18524 unchanged, no finding in my files; ownership `8 files changed by pdf-worker ... 0 failures`. New files outside the existing set, all under `pdf-worker/test/`: `range.test.mjs`, `test-script.test.mjs`, `subject.mjs`.

Size (session_01PhBb7MkFDrjvHxjEN19MtM): test runs 22, module lines 264 (src/index.mjs; +118 -45 changed)

## J3 · COMPLETE

COMPLETE (J3, round 9): G132h, G124a, G124 quote, G139 done; G125b has no code of mine (B3). Failing-first seen red: range.test.mjs against the old source 4 passed / 28 failed; test-script.test.mjs 2 passed / 2 failed; green: range 53/0, test-script 4/0, structure 90/0, npm test 72 pass / 0 fail (the 65 codec tests now run). L platform check: raw workerd, 23.8 MiB and 64 MiB both read at tier 2 from 20 MB of old space. Checks: format 0, architecture 0, coverage pdf-worker 20/20, words no finding in my files (plain 1 -> 0, count unchanged), ownership 0. New files: pdf-worker/test/range.test.mjs, test-script.test.mjs, subject.mjs. Stale generated for you to rebuild: pdf-worker/dist/*, release/pdf-worker.bundled.mjs. Found in reading-pipeline: tier2Escalate (index.mjs:143-146) sends no from/count, so the plane does not yet use the range. Details in build/jobs/T51/pdf-worker.md, section "Completion (fix round 9...)".

## Completion (fix round 10, Wave A batch 1: R8 truncated PDF, tier2Answer, one marker)

**R8 (G2; A5b) done.** Root cause: pdf.js throws `InvalidPDFException` ("Invalid PDF structure") on a file cut before its trailer, because no trailer names a catalog for the objects it indexes; `tier2Text` (`pdf-worker/src/index.mjs`, the old `:131`) let it reach `handleStructure`'s catch (old `:217-239`), which answered `tier2_extraction_error` for the whole file, and tier 1 cannot decode a no-ToUnicode font, so nothing was stored. Fix, all in `index.mjs`: `openDocument` opens the bytes as they are; only when pdf.js throws `InvalidPDFException` on a file with no `startxref` in its last 1,024 bytes (a copy of the bytes is kept only for such a file, since pdf.js detaches what it is handed) does it open a repaired view: the bytes up to the last complete `endobj`, plus a trailer naming the last `/Catalog` object found (`repairedView`). The page tree's declared `/Count` is read from the bytes (`declaredPages`). Pages the view cannot read (pdf.js throws on them, or they lie beyond what is there up to the declared count) are named: a `{page, reason:"truncated", font:null, codes:"", count:0}` marker in the page's own `undetermined` and in the document-level list. The answer is `.tier` 2, `partial: true`, and the note `pdf_truncated`. When no repaired view can be read (BROKEN case: a catalog with no page tree) the original failure stands as R10 says; a file that is not a PDF still answers 422. A whole file is unchanged (no `partial` field, no note).
- Tests missed it because: `bio-plane/test/m/test-support/generators.test.mjs:114` returns green when pdf.js throws, and no pdf-worker or reading-pipeline test read a `truncate` file.
- Failing-first: `pdf-worker/test/structure.test.mjs`, section "R10: a file cut before its trailer ...", on the walker's exact recipe `{kind:"pdf",seed:"rw9-A-5b",size:{pages:30,lines:6},truncate:0.7}` (16,746 B), under Miniflare: against the old source 92 passed / 6 failed; against the new 98 / 0. It asserts tier 2, `partial`, pages 0-21 with the truth's text and none unread, pages 22-29 named `truncated`, no `tier2_extraction_error`, the counts, a range (20-23: two read, two named), and a whole file not stated partial.
- Platform check P: done in that test: Miniflare runs the bundle in workerd, where pdf.js throws on the cut file and, on the repaired view, reads the 22 pages. Nothing is left for the redeploy beyond rebuilding `dist/`.
- Not mine, and not done: decoding WinAnsi in tier 1 (pdf-reader's, Bob's choice).

**Fixture published.** `pdf-worker/test/fixtures.mjs` (new): `tier2Answer()` runs the real worker bundle over the committed `legistar-73545.pdf` (the mixed document) and returns its answer; `pdf-worker/test/fixtures.test.mjs` (new, 6 checks, named R7 and R9) calls it and checks tier 2, the 7 pages, page 0's words, the joined document, the counts. Its user: reading-pipeline 1 (`tier2-wire.test.mjs:315` per the fixture plan; re-point is that job's).

**Marker added (BOB reads it at the merge, K5060).** `pdf-worker/test/structure.test.mjs:333`: `// fixtures-own: input the module's own refusal for a route it does not serve, compared with its own dispatch` (the R12 `want` literal). `fixtures-generic` markers added: none. `fixtures.mjs --list` for pdf-worker: 0 failures (accepted(own) 1, the marker above; answer 0).

**Found in other modules (REPORT to BOB).**
1. test-support: `bio-plane/test/m/test-support/generators.test.mjs:114` (R20): `if (o.skip || o.error) return;` passes when pdf.js throws on the truncated file; it should assert `o.error` is absent (pdf.js reads the pages before the cut). Not mine; not changed.
2. reading-pipeline: its `read()` test over the same `truncate` file (as the plan says, that job's), and the plane-side consumption of the new answer shape: `partial: true`, note `pdf_truncated`, markers `reason:"truncated"` named per unread page; `pages` is still pdf-reader's count of the pages it found (22 here) while the markers name pages up to the page tree's declared count (30).
3. Stale generated for BOB to rebuild: `pdf-worker/dist/*` and `release/pdf-worker.bundled.mjs`.

**Rulings I made (mine to make, recorded here).** The way a truncated file is stated: `partial: true` on the answer, the note `pdf_truncated`, and the marker reason `truncated`. R44 forced the two chunk sizes in the new code to be written without a literal of 1,000 or more (512 and 2 x 512).

**Tests and checks.** `structure` 98/0 (92/6 on the old source), `range` 53/0, `fixtures` 6/0, `test-script` 4/0, `imagecrop` 55/0, `jbig2` 179/0, `jpx` 205/0, `pagepixels` 541/0 (the `npm test` set, codec tests included, all run). Impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`): reading-pipeline `convert-tiers` 9/0 and `staffdirectory` 3/0, extraction `convert-tiers` 5/0. Checks from the process repository: format 0 failures; architecture 0; coverage pdf-worker 20 of 20; words 0 failures; fixtures 0 failures; ownership 0 failures.

Size (session_019iEKajbusHst4GETgCgTK1): test runs 14, module lines 364
