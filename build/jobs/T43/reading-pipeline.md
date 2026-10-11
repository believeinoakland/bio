# reading-pipeline (T43)

**Status** · session_019yQjhXavJgJ8jeJUx1hSuj · depth 2 · COMPLETE · handled B1

## Completion (T43-9)

**Entries applied**
- **T43-9 (N853a; K2611, K2689, K2698), R29's amendment.** `tier4Extend` now answers the paying account's or its limits' refusal as given, in `aiRefusal`, beside `aiNote`, and fills nothing. That covers every non-`ok` object answer from `credentials.accountFor` and every refusal object from `useCheck`. Every other stop is `aiNote` alone, with no `aiRefusal` key: no member's act, no credentials, `accountFor` or `useCheck` throwing, no limits checked, no AI set up, the AI unreachable or declining, no model named, no text returned, no page left. `read`'s answer is unchanged: `aiRefusal` is the caller's to answer (extraction R71), and the basis still names the refusal (`bio-plane/src/reading-pipeline/index.mjs`, `tier4Extend`).
- **Picture captures (format-registry R29, R30; START B1): confirmed, no change.** Through the real `jpeg` and `png` entries, a picture reads as one page carrying `no_text_layer`.
  - Tier 2 is never asked.
  - With no OCR member bound, the page stays unread with the tier-3 note, `tier3_candidate: true`, as a failed reading at tier 1 under the layer chain, with `page_count` 1 and no units.
  - With an OCR member bound, page 0 is asked for. A member that cannot render it (`PAGE_NOT_RENDERABLE`) leaves it unread with its reason, as for a scan.
  - New `test/m/reading-pipeline/picture.test.mjs`.

**Tests added** (`transcribe.test.mjs`, three tests)
- A stub `accountFor` answering `NO_ACCOUNT`, and a stub `useCheck` answering `AI_LIMIT_REACHED` (and its unjudged form). Each gives `aiRefusal` identical to the answer, with nothing filled and the AI not asked.
- Every refusal the real `credentials.accountFor` answers for the act is `aiRefusal` exactly as `accountFor` answers it: `NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `GROUP_KEY_NOTICE_DUE`, `AI_KEPT_AWAY`, `PROJECT_AI_KEPT_AWAY` and `NO_SUCH_PROJECT`. No key leaks, and `read` carries no `aiRefusal`.
- The control (K874): every other stop gives `aiNote` with no `aiRefusal` key, a declining AI among them, and a filled reading carries none.
- Negative control: with the one `aiRefusal` assignment removed, exactly the first two of these fail (12 pass, 2 fail). Restored and green.

**Reading set (mechanics §17, K2700)**
- Read whole: my requirements, my code (`index.mjs`, `readingprov.mjs`, `hooks.mjs`), every test file under my `tests` paths (including the four legacy-path tests), K2611, K2689, K2698, and `draft-T43-cleanup.md` §N853.
- Not read: the binary fixtures (`d460/`, `cpdf20/`, the module's `fixtures/` PDFs).
- The used modules' public parts were read in full by two helper agents in this session, each given my entries, extraction's T43-10 and plane's T43-15, and each writing a digest citing its sections.
  - Helper A read credentials, format-registry, text-chain, record-core, membership, docprofile and doctypes, plus ai-use R3, R13 and plane R36 for `useCheck`.
  - Helper B read jurisdictions, test-support, pdf-reader, pdf-worker, ocr-worker, capture-sources, acquisition and court-doctypes.
- The sources stay binding. I checked the refusal shapes against `credentials/index.mjs` `accountFor` directly.

**Found in other modules (REPORT)**
- **ocr-worker / pdf-pixels (N853b's chain):** ocr-worker is PDF-only (its R5, R7: it renders through `pdf-pixels`, and a refusal there is `PAGE_NOT_RENDERABLE`). A bound OCR member asked for a picture's page 0 can therefore never read it today. The picture stays unread, correctly and with the member's reason, but the call is wasted. A picture route at tier 3 (pdf-pixels' `renderPictureToPixels`, T43-5, inside ocr-worker) would make OCR read photographed pages. That is not in T43's plan, and it is ocr-worker's.
- **extraction R71 (T43-10):** `aiRefusal` is passed exactly as credentials or ai-use answer it. Credentials' requirements name a refusal's row (`code`, `check`, `translation`) but no `status`, so the HTTP status is extraction's to choose ("the status the door gives a refusal").
- **Requirements (BOB's):** R29's `*(not yet met: T43)*` marker can be cleared at merge.

**Deferred:** none.

**Tests and checks run**
- `node --test test/m/reading-pipeline/`: 109 pass, 0 fail.
- `node test/d606-perpage-ocr.test.mjs`: 28 passed, 0 failed.
- `node test/tier2-wire.test.mjs`: 46 pass, 0 fail.
- `node test/system/pdf-worker-binding.test.mjs`: 12 passed, 0 failed.
- `node test/tier-pagewise.probe.mjs`: baseline 0 pages awarded, the same before and after.
- Extraction's tests (my user, merging after me): `node --test test/m/extraction/` gives 150 pass, 0 fail. No reds.
- Checks: format 0 failures; architecture 0 failures; coverage 30 of 30 ids, 0 failures; ownership 0 failures.

**Generated artifacts:** the plane bundle is staled by this change (manifest rule 4 (6)), to be regenerated at L4's close.

Size (session_019yQjhXavJgJ8jeJUx1hSuj): test runs 11, module lines 1661

## J1 · COMPLETE

T43-9 done on job/T43/reading-pipeline: R29's aiRefusal (account or limit refusal answered as given, beside aiNote; every other stop aiNote alone), tested with stub NO_ACCOUNT and AI_LIMIT_REACHED, every real accountFor refusal, and the aiNote-only control. Picture captures confirmed unread at tier 3 with the note, no change (new picture.test.mjs). Module 109/109, legacy-path tests green, extraction 150/150 (no reds). Checks: format, architecture, coverage (30/30), ownership all 0. Report in my record: ocr-worker cannot render a picture page (PAGE_NOT_RENDERABLE), so a bound OCR member never reads a photo (ocr-worker's, N853b chain); aiRefusal carries no status for extraction R71; R29's not-yet-met marker can clear; plane bundle staled. No files outside my paths.
