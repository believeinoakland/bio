# cause-reading-4 (T51)

**Status** · session_01Xg9yrTHu7epTQVfzdejX4W · depth 2 · WORKING · handled B2

## Record

**Root causes (file:line on tranche/T51, before this job).** F4: `reading-pipeline/index.mjs` `bytesOf` (:1434-1455) and the entry-throw branch (:1655) wrote failed readings that said nothing of their cause, so `readHeld` could not tell a store hiccup from the document. F8: `textUnitsFor` (:851) spent the acquire answer's 512 KiB budget on every caller, `readHeld` and re-read included (a 400-page text PDF: 57 of 400 units). F9: `askMemberPerPage` stopped at 24 calls (:330, :348) and the pages left were only named in a note. F10: `bytesOf` loaded any whole up to 256 MiB.

**Why the tests missed it.** No test built a store that throws, a member that answers 5xx, a text PDF whose text exceeds the wire, or a scan longer than 24 pages with the cursor asserted; the memory test measured only three govinfo files.

**What changed (`bio-plane/src/reading-pipeline/index.mjs`).**
- `reading.failure` is `"transient"` or `"final"` on every failed reading (absent on a reading that found text), exported `FAILURE_TRANSIENT` and `FAILURE_FINAL`. Transient: store read error or no store, object or a part not held (or parts that cannot be assembled while no whole is held), the entry throwing, `read` throwing, the PDF/OCR member answering 5xx or unreachable (`tier2Escalate` and `tier3Extend` return `transient`). Final: no digest, a document the entry produces no text from, not read as text, the content type's reader throwing, a member that answered and declined, a whole over the ceiling.
- `textUnitsFor(i2text, {budget})` (also `textUnitsOfText`, `textWordsOfText`, `textWordsFor`); `read(..., {unitsBudget})`. Default is `ACQUIRE_TEXT_UNITS_BUDGET`; `Infinity` charges no wire budget, each unit still cut to `CAPTURE_TEXT_UNIT_CAP`. Pinned with extraction (B2).
- OCR: `askMemberPerPage` and `tier3Extend` take `invocations` (default 24); `tier3Extend` answers `left: {cursor, pages}` (pages not asked, after a throw, or a 5xx page, or all of them when the member was down) and `transient`. `read(..., {ocrInvocations, owe})`: a reading with pages left carries `ocr_left: {cursor, pages: <count>}` (new stored field; B2 said none needed unless I found one is: the count and cursor are what the ledger entry and the page state without re-deriving them from the units) and `owe({kind: "ocr", sha, cursor, pages_left})` is awaited once, a throwing hook never failing the read.
- `WHOLE_READ_MAX` = 24 MiB. `bytesOf` refuses a larger whole, or a capture in parts adding to more, as `final` before loading anything, stating the size (the capture's own, else the store's `head`); new return field `failure`. The sentence is the held row `reading-pipeline.why.capture_bytes_parts` as stand-in with the ceiling as the limit; **row owed (T52):** "the capture is {total} bytes, over the {limit} B this reading can hold in memory, so it was not read".

**Failing-first.** `test/m/reading-pipeline/r37.test.mjs`, 10 tests, titles name R37. Run against the tranche's `index.mjs` (with only the `WHOLE_READ_MAX` export added so the file loads): 0 pass, 10 fail on behaviour, e.g. `evidence.get` throws once: `failure` undefined, expected `transient`; the 60-page scan: `ocr_left` undefined, expected `{cursor: 24, pages: 36}`; the 400-page PDF: 57 units, expected 400. With this job's code: 10 pass.

**Step 0, workerd (local, real sizes, no deploy).** `workerd-ceiling.probe.mjs` bundles `read`, serves it from workerd with the file behind a disk service, and bisects the smallest V8 `--max-old-space-size` in which the read completes. Heap grows with pages, not bytes (about 25 MB + 0.031 MB a page, idle isolate included); the bytes sit beside it:

| synthetic PDF | file | pages | min old space | + bytes |
|---|---|---|---|---|
| mixed 16 | 16.0 MB | 1,039 | 58 MB | ~74 MB |
| mixed 24 | 24.1 MB | 1,558 | 73 MB | ~97 MB |
| mixed 32 | 32.1 MB | 2,077 | 90 MB | ~122 MB |
| mixed 48 | 48.1 MB | 3,116 | 123 MB | ~171 MB |
| text-dense 8 | 11.2 MB | 2,330 | 97 MB | ~108 MB |
| text-dense 16 | 22.3 MB | 4,660 | 171 MB | ~193 MB |
| text-dense 24 | 33.5 MB | 6,991 | 241 MB | ~275 MB |

(mixed = the 20 MB / 1,300-page shape scaled; dense = almost all text.) I chose 24 MiB: mixed files up to it read with ~30 MB left for the plane's own baseline, which is larger than this probe's bundle; the 15.9 MB budget volume (1,354 pages) and the 21 MB BAC packet read. **The ceiling is by bytes because bytes are all that is known before loading.** A text-dense PDF of 12 MB or more (over about 3,000 pages) can still exceed 128 MB inside the ceiling; the pages are known only after pdf-reader parses. The smallest thing that would close it is a page-count refusal in pdf-reader before text extraction (`pages x 0.031 + 25 + bytes > ~100 MB` is `final`, stated with the pages): a pdf-reader job, BOB's to place if wanted. I have not built it (not my module).

**Suites.** reading-pipeline 179 tests, all pass after the fix to `bytesOf`'s head call (pieces.test.mjs "R2 R23" had pinned that only the whole is read; the store is now asked its size only when the document states none); `d606-perpage-ocr`, `tier2-wire` pass; text-chain 104/104; users: extraction, capture, content, events 880 tests, 879 pass; the one red is extraction's `c5b-memory` ("R80 R45 (C5b, L)", 131 MB above idle), red the same way on the tranche's untouched `index.mjs`, extraction's and already BOB's (cause-reading-3 recorded it). `impact.mjs origin/tranche/T51 HEAD`: 108 of 175 modules, 1,633 of 2,269 files by the import graph; I ran the direct users above, not all.

**Checks.** format 0 failures; architecture 0; coverage: reading-pipeline 37 of 37 and text-chain 104 of 104 ids named (the 8 other failures are other jobs' new ids: R100, R103, R82, R51, R35, R72, R18, R25); words: 18,421, 0 failures, no row added; ownership run per module (the combined name `reading-pipeline,text-chain` is "no such module" for the tool here): the only finding for each is this record file, which is mine.

**Proposed requirement lines (BOB writes them).** R37 as written, plus: `read` takes `unitsBudget`, `ocrInvocations` and `owe`; `bytesOf` and `read` state `failure`; `ocr_left`; `WHOLE_READ_MAX` is 24 MiB, measured.

**Found in another module.** extraction: `readHeld` must call `read` with `unitsBudget: Infinity` and replace a reading whose `failure` is `transient` (its R82); `#wantedTheWhole` still matches the three old sentences, which stay unchanged. plane: the `ocr` ledger entry is `{kind: "ocr", sha, cursor, pages_left}`.

**Probe rerun (the committed `workerd-ceiling.probe.mjs`, index path, `unitsBudget: Infinity`):** mixed 24: 74 MB old space, ~98 MB with bytes; mixed 32: 88 MB, ~120 MB; text-dense 8: 98 MB, ~109 MB. The same as the table within 3 MB.

Size (session_01Xg9yrTHu7epTQVfzdejX4W): test runs 14, module lines 2,196
