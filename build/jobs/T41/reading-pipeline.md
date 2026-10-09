# reading-pipeline (T41)

**Status** · session_01Y9T6YzfXkrxpdPqzRdWUH4 · depth 2 · WORKING · handled B2

## Completion

**Entries applied** (T41-9, `build/plan/current.md`):
- **Rule 4 (8), K2399, re-measured and cleared.** `convert-chain.test.mjs`:297: the real Legistar packet now decodes whole (60,842 characters, 0 undetermined; pdf-reader R38), so the test states a full decode, and R11's partial-decode statement is now checked on a new one-page fixture with a second font that has no Unicode map (1 `no_tounicode` region). `pieces.test.mjs`:218: the PDF pin is re-measured to `5b1437e6…f17a`. With pdf-reader as it was before K2399 (`9b9fc8e3f7^`), this module's answer still digests to the old pin `3f4eb430…051f`. With the new pdf-reader, every difference is those 45 characters: the counts, the 14 page lengths and digests holding them (+45 in total), the units' text, one entity label ("Code Enforcement’s"), and the basis. The docx pin is unchanged.
- **R29 (D21; K2462, B2).** I built R29 as J1 read it, and BOB confirmed 1–5.
  - `read` takes an optional `transcription = {member, project?, credentials, useCheck, transcribe, at?}`, handed in by the caller acting at a member's request. Without it, `read` is byte-identical to before (the pins in pieces, convert-chain, R27's hooks test and the legacy scripts all hold).
  - New pieces `tier4Pages` and `tier4Extend`, plus the constants `TRANSCRIBE_USE`, `AI_TRANSCRIPTION_SOURCE` and `AI_READING_LABEL`.
  - **Which pages are sent:** pages that still carry a tier-3 selecting marker, or pages that OCR read to no glyph. None when the document is encrypted or has no per-page text.
  - **The checks, in order:**
    1. `credentials.accountFor({member, act: {kind: "transcribe", project?}})`. It covers "no AI" (group, then project), no account, the use switched off, and a project the member cannot see or has not joined.
    2. `useCheck({owner, member, use: "transcribe", at})`. If it is absent or throws, nothing is sent (fail closed).
    3. `transcribe({account, capture_sha, store, pages, use})`. Its answer must name `engine`.
  - **Merge and chain:** pages merge by R6's rule (`mergeTier3Text`: asked-for pages with no glyph; a folio page gets the text appended). The AI's part is `pixels -> ai_transcription(engine, version)`, both `cap: null` with `measured_by` stated. That is text-chain's own R104 shape, slightly fuller than J1's sketch (a bare `ai_transcription` step). It sits beside the settled chain's parts through `mergedChain`, at wired tier 4.
  - **Labelling:** `reading.ai_transcription = {pages, engine, version, label: "the AI's reading"}`, plus a basis sentence and the chain's own label.
  - **Refusals and the key:** every refusal leaves tiers 1–3's reading as it was and names the reason on the basis. The key goes only to `transcribe`.
- **R18 (K2462).** `readingprov.mjs`: a covering `ai_transcription` step is tier 4, named by its engine, member null. It outranks the `pixels` step before it.

**Deferred:** none.

**Design decisions to note:**
- `tier3_candidate` is left as tier 3 computed it. It still says OCR could help even after the AI read the page. This keeps R6's meaning: OCR is a separate, measured route.
- The new tier-4 notes are joined onto the tier-3 note on the basis, with no wording about "instance" or "the plane" (DEC-149). A scan read with no OCR member therefore says both "no OCR engine is installed … nothing is claimed" and, after that, what the AI read. This is accurate, but it reads awkwardly.

**Found in other modules:** no defect. For BOB: R29 has no caller yet. The module that acts at a member's request will have to hand in `transcription`, with its `useCheck` (`ai-use` R3) and the AI path (agent-worker/ai-runs); `extraction`'s re-read is the natural one. A test-bar record for transcription is also needed (`run-rules` R19 names "transcription"). Neither is this module's to write.

**Reading set (mechanics §17; B1):** I measured it at 456 KB of tests plus 90 KB of code, which is over 300 KB.
- **Read whole myself:** my requirements; layer 4's row of `build/layers.md`; `index.mjs` and `readingprov.mjs` (the code this entry changes); `convert-chain.test.mjs`, `pieces.test.mjs` and `fixture.mjs` (the tests it changes); the services named in my Uses that R29 touches: text-chain's `STEP_KINDS` (R104), `checkChain`, `appendStep`, `mergedChain`, `derivationCap`, `captureBound`, `describeChain`; credentials' `accountFor`/`#resolve`, `aiKeptAway`, `accountUsesSet`, `aiKeepAwaySet`, `projectAiKeepAwaySet`, `projectKeySet`, `projectKeyNoticeSeen`.
- **Read by a worker in full and summarised (about 11 KB, each statement citing file:line):** `hooks.mjs`; `readingprov.mjs`; the other 9 module tests; `d606-perpage-ocr`, `tier2-wire`, `tier-pagewise.probe`, `system/pdf-worker-binding`.
- **What the summary flagged:** readingprov would credit `[pixels, ai_transcription]` to tier 3 / ocr-worker (fixed); the pinned shapes `read` must keep without `transcription`; DEC-149's wording rule. Nothing it left out mattered.

**Tests and checks** (on the branch after merging `tranche/T41`):
- `node --test bio-plane/test/m/reading-pipeline/`: 99 pass, 0 fail. This includes `transcribe.test.mjs`, 6 tests over the real record-core, membership and credentials: the positive case on the member's own account; the project's key; the negative controls (no account, use switched off, the group's "no AI", the project's, a project the member cannot see, limit reached, no limits checked, no member's act, no credentials), with a group limit on another use as the positive beside them; no-act byte identity; and the pieces.
- Legacy scripts: `d606-perpage-ocr` 28/0, `tier2-wire` 46/0, `system/pdf-worker-binding` 12/0.
- User's suite: `test/m/extraction/` 136/0.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs reading-pipeline`: 26 files, 84 imports, 0 failures. `checks/coverage.mjs reading-pipeline`: 29 of 29 ids, 0 failures. `checks/ownership.mjs reading-pipeline tranche/T41`: 0 failures.

Size (session_01Y9T6YzfXkrxpdPqzRdWUH4): test runs 22, module lines 1,623

## J1 · QUESTION

R29's seam. The module is layer 4 and pure; the account (credentials R56, layer 2), the limits (`ai-use` R3 `useCheck`, layer 6) and the model call (layer 6) are not all reachable by an edge. My best reading, which I am building now:

1. A new piece beside `read`, `tier4Extend` (R23's list gains it), and an optional `transcription` argument to `read`: `{member, project?, credentials, useCheck, transcribe, at?}`, all handed in by the caller that acts at a member's request (as `evidence` and `liveCalibration` are), so no import edge. Without `transcription`, `read` is byte for byte as now (R2/R15's pins hold).
2. Order: pages the plane could not read (still carrying `no_text_layer`/`image_content_unread` after tier 3, or OCR'd to no glyph) → none: nothing asked, no account read. Else `credentials.accountFor({member, act: {kind: "transcribe", project}})` (it refuses kept-away first, group's or project's, then no account, use switched off, not a participant); any refusal → not transcribed, the note names its code. Then `useCheck({owner, member, use: "transcribe", at})` with `owner` from the account's level (`member:<id>`, `project:<id>`, `group`); a refusal, or no `useCheck` handed in, → not transcribed (fail closed). Then `transcribe({account, capture_sha, store, pages, use: "transcribe"})`, which must name its `engine` (the model); its pages are merged by R6's rule (asked-for pages with no glyph; a folio page appended), under a part `[{step: "ai_transcription", engine, version, cap: null, measured_by}]` (text-chain R104), wired tier 4. The key never reaches the reading or a note.
3. "Labelled as the AI's reading": the chain step (its label), a basis sentence, and `reading.ai_transcription: {pages, engine, version}`.
4. R18 (`readingprov.mjs`): a page a covering `ai_transcription` step produced is tier 4 naming its engine, member null (R18's map is 1–3). Proposed wording for R18: "...(a covering `pixels` step is 3, naming the next `ocr` step's engine; a covering `ai_transcription` step is 4, naming its engine; else ...)". Say if you want a member name for tier 4 instead.
5. Tests drive the real `credentials` over a real SQLite world (record-core, membership, credentials, as `capture-sources/credentials.test.mjs` does) for the negative controls (no account, use off, kept away group and project): that needs `credentials` and `record-core` in my `uses` (both earlier; tests only). Please add them, or tell me to test against a stub of `accountFor`'s answers instead.
