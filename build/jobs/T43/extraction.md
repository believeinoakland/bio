# extraction (T43)

**Status** · session_01PpDwes3iUurs4FGnAcYgt6 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Five readings I am building on (carrying on; none blocks me):
1. R71 (N853a): a relayed `aiRefusal` is answered with its own `status` when it carries a 4xx one, else 403, as the keep-away refusal is relayed today. No requirement names the status (answer-envelope R1–R3 keep the handler's).
2. R71, R27 `{pages}`: the member's page numbers (reading page 0 is "1"), ascending, each once, joined by ", " ("2, 3"). The design stream may later choose runs or "and".
3. R27 `unread_pages`: carried for any reading with a positive `page_count` (a PDF's or, since N853b, a picture's one page), not PDF only; computed as the pages whose index holds no glyph-bearing `pdf-page` unit, a page inside a skipped-over-bound run counted read. Absent when no pages, and absent when the viewer may not see the bundle.
4. R73: in `pageTranscribe`, a detected format whose entry's `structure` answers `ok:false` (e.g. a damaged PDF) is also answered 200 `performed:false` with `why` naming the format and the entry's reason, nothing written, so the row-less 422 at `index.mjs`:1572 is gone. `op=pdfstructure`'s 422 (:1365) stays, R31 being unchanged.
5. R71 `says`: `transcribe.done` only when the pages were filled AND written (absent when the write rolled back); `{pages}` = the pages handed to the AI. `transcribe.none` when the AI path's `transcribe` was called and filled nothing, except an answer `ok:false` with reason AGENT_WORKER_UNBOUND, EVIDENCE_ABSENT or NO_PAGE_RENDERED (no `says`, performed:false with its reason). No `says` when no page was left or the act stopped before the AI path was called.

## Completion (T43-10)

**Entries applied** (all in `bio-plane/src/extraction/index.mjs` and `checks.mjs`)
- **N853b, R73.** `pageTranscribe` reads the format with `format-registry.detectFormat(bytes, null)` over the stored bytes, never the recorded profile, and reads through that entry's `structure`. Tier 3, the chain, `text_container` and provenance `container` all carry that format. A format with no entry or no `structure`, or one whose `structure` refuses the bytes, answers 200 `transcription: {performed: false, written: false, why}`, with `why` naming the format, and writes nothing (J1 (4), K2713). So the row-less 422 at `pageTranscribe` is gone. `op=pdfstructure`'s 422 stays, as R31 is unchanged. R71 now names a picture's one page.
- **N853a, R71.** A `tier4Extend` answer carrying `aiRefusal` is answered as that refusal (`ok: false`, its code, check and translation). The status is the refusal's own 4xx when it carries one, else 403. No catalogue row of these codes gives one (credentials C-29, ai-use C-143), so this follows B3 (1). Nothing is written.
- **N862, R47.** C-51.7's translation is `words.json`'s `transcribe.refused.notdeployed`, read by key from the module's `TRANSCRIBE_WORDS` table (each `en` verbatim, the credentials and membership pattern).
- **N862, R71, K2689.** `transcription.label` is `transcribe.label`.
  - `says` is `transcribe.done` only when the pages were filled and written. `{pages}` is the pages handed to the AI.
  - `says` is `transcribe.none` only when the AI path's `transcribe` was called and filled nothing. `{why}` is `aiNote`.
  - The no-post reasons (`AGENT_WORKER_UNBOUND`, `EVIDENCE_ABSENT`, `NO_PAGE_RENDERED`) answer `performed: false` with the reason and no `says`.
  - `{pages}` is written as "2, 3": the member's numbers, ascending (B3 (2)).
- **N862, R27.** `readingFor` carries `unread_pages` for a reading with a positive `page_count`. These are the pages whose index holds no glyph-bearing page unit; a page inside a run skipped for being over the bound counts as read. It is `[]` when there are none.
  - With unread pages, it also carries `unread_says` (`document.unread.pages`).
  - Both are absent with no pages, and absent for a viewer who may not see the bundle.

**Tests** (`bio-plane/test/m/extraction/`)
- New `t43.test.mjs` (7 tests): R47, R71 (label and `done`; `none` and the no-post reasons; the `aiRefusal` relay), R73 end to end (an uploaded JPEG promoted through the projection, then a stub transcriber asked for page 0: written with container `jpeg`; and a pre-T43 photo profiled `undetermined`, transcribable with no re-read), R73's no-structure case (a zip), and R27.
  - Each has a negative control. The PDF-scan control writes as before, with container `pdf`.
- New `words.mjs`: `WORD(key)` reads `words.json` by key and throws for a key the list lacks.
- `pagetranscribe.test.mjs`, re-pointed:
  - the scripted pdf entry now detects `%PDF-` (R73);
  - the C-51.7 words and the label are read by key;
  - the non-PDF case is the no-structure answer;
  - the account and limit cases moved to `t43.test.mjs` as refusals.
- Mutation check: with the relay line removed, `t43.test.mjs` gives 6 pass, 1 fail; restored and green.

**Reading set (mechanics §17, K2700)**
- Read whole: my requirements, all my code (`index.mjs`, `checks.mjs`, `ops.mjs`, `drift.mjs`, `filemembership.mjs`, `schema.mjs`, `extractrun.mjs`), every file under my tests path, K2611, K2689, K2691, K2698 and the three drafts' sections.
- The used modules' public parts were read in full by two helper agents in this session, each given T43-10 and plane's T43-15, each writing a cited digest:
  - A: reading-pipeline, format-registry, capture, promotion, text-chain, record-core, docprofile, calibration.
  - B: record-grammar, jurisdictions, office-readers, pdf-worker, ocr-worker, membership, capture-sources, provenance, doctypes, answer-envelope, credentials R22–R62, plane R24 and R36, agent-worker R63 and R72–R75.
- Digest A found that no public part defines `tier4Extend`'s or `tier4Pages`' shape, so I read those two functions in `reading-pipeline/index.mjs`. The sources stay binding.

**Found in other modules (REPORT)**
- **Row census** (`bio-plane/test/system/row-census.test.mjs`): red on this branch (green on `tranche/T43`), naming only C-51.7 `TRANSCRIBE_NOT_DEPLOYED` changed with no record. This is R47's re-wording, accepted under rule 4 (2) until T44's stamp.
- **plane T43-15:** after R73, a picture capture reaches the transcriber with `pages: [0]`. Rendering it is plane R36's picture route. Until that lands, the transcriber answers `NO_PAGE_RENDERED`, which extraction answers `performed: false` with no `says`.
- **Requirements (BOB's):** the T43 markers on R27, R47, R71 and R73 can be cleared at merge.

**Deferred:** none.

**Tests and checks run**
- `node --test bio-plane/test/m/extraction/*.test.mjs`: 157 pass, 0 fail.
- Users' tests: every `tests` path of the 29 modules using extraction, about 2,819 tests, on this branch and on `tranche/T43` @ 636be1d04a. Each gives 2,783 pass and 27 fail, the same 27 failures by name, so none is new. These are inherited reds under rule 4: answer-envelope's totality and pin tests (9, 10), op-declarations' and affordances' tests (10), case-disclosures and case-authoring (12), and sources' R4–R7.
- `checks/format.mjs`: 0 failures. `architecture.mjs bio extraction`: 0 failures. `coverage.mjs`: 49 of 49 live ids, 0 failures. `ownership.mjs … tranche/T43`: 0 failures.

Size (session_01PpDwes3iUurs4FGnAcYgt6): test runs 16, module lines 3153

## J2 · COMPLETE

T43-10 complete on job/T43/extraction (record: Completion (T43-10)). R27, R47, R71, R73 met; 157 of 157 module tests pass; users' tests show the 27 inherited reds identically on branch and tranche; the four checks clean. One red named: the row census, C-51.7's re-worded translation, under rule 4 (2). No file outside my paths. Merged tranche/T43 @ its tip.
