# reading-pipeline (T51)

**Status** · session_01AG4YHRj238neiSnHE1cvQ4 · depth 2 · COMPLETE · handled B12

## J1 · COMPLETE

COMPLETE: T51-133 (reading-pipeline, K3820's red).

**The red does not reproduce.** On this job branch (its start, `d6b3ec9a9a`) every test under reading-pipeline's `tests` paths passes: `test/m/reading-pipeline/*` and `test/m/extraction/read.test.mjs` 140 of 140 before my edits, 137 of 137 after (the set without the three files of d606, tier2-wire and the system test, which I ran separately and which pass: d606 and pdf-worker-binding 12/12, tier2-wire 46/46, the tier-pagewise probe exits 0). No test of mine reads a file under `docs/`: the only design-file readers in the module's paths are none; the `word` import in `transcribe.test.mjs` reads the regenerated `setup-words/rows.mjs`, which the design merge did not change. `tranche/T51` (`0ca61ae1b2`) differs from this branch only outside this module (content, the records), so the red is not on the tranche either. I could not find which test K3820 saw red; it may have been cleared by the team pass (`d29bbd1848`) that this branch already holds. BOB, please confirm against your run if you saw it on a different branch.

**Entry applied (K3810's rule, met while working):** the tests that copied the tier-2 and no-OCR sentences now read them from the word table by key, with the module source unchanged (the rows hold the same text):
- `read.test.mjs`: the three tier-2 failure notes read `reading-pipeline.tier_read_essentially`, `_nothing` and `_nothing_document`; the unbound-tier-2 basis reads `tier_read_essentially`.
- `convert-chain.test.mjs`: the tier-2 note reads `tier_read_essentially`.
- `picture.test.mjs` and `dec149.test.mjs`: the whole-sentence constants `NO_OCR` (`document_text_layer`) and `NO_TIER2` (`tier_read_essentially`) are read by key.

**Deferred, and why:** sentences the module says that have no key in the word table yet are still literals in tests and in source: the no-evidence-store refusal (`your team's Civicsmith has no evidence store set up, so the capture's bytes cannot be read`, in `dec149.test.mjs` and `src/reading-pipeline/index.mjs`), and the fragment assertions on `no OCR engine is installed` (`convert-ocr`, `pieces`, `read.test.mjs` line 183) and `no pdf-worker member is set up` (`staffdirectory.test.mjs`) that have no whole-sentence key to read. These need keys from the design lane; I did not change the source to add them.

**Found in another module:** none.

**Tests and checks run (job branch, summary lines):**
- `node --test test/m/reading-pipeline/*.test.mjs test/m/extraction/read.test.mjs`: `tests 137, pass 137, fail 0`.
- Earlier run of the same set plus d606, tier2-wire, pdf-worker-binding: exit 0, `tier2-wire: 46 pass, 0 fail`, `pdf-worker-binding: 12 passed, 0 failed`.
- `node checks/format.mjs /home/user/bio`: `174 modules, 172 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio reading-pipeline`: `28 product files, 98 relative imports ... 0 failures`.
- `node checks/coverage.mjs /home/user/bio reading-pipeline`: `1 modules, 34 of 34 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio reading-pipeline tranche/T51 job/T51/reading-pipeline`: `0 failures`.
- `node checks/run.mjs /home/user/bio` (before the edits): architecture and format 0 failures; coverage's 13 failures are in other modules (agent-harness, agent-runner, agent-steps, agent-worker, basis-versions, case-grammar, entities, explore, journey-check, people, progressions, retrieval-browse, retrieval), none reading-pipeline.

**Choices I made:**
- Commit message: no model identifier, as the system prompt asks; the attribution reminder asked for a Co-Authored-By line naming the model, which I left out for that reason. Say if you want it added.

Size (session_01UF9sUjrAaCC7RhZToJezwo): test runs 3, module lines 1795

## J2 · BLOCKED

BLOCKED, cause: reading (K3678).

Job T51-190 (words pass, 11 findings + 10 plain + 4 test copies). I have made no change to any file.

Why I stopped: step 2 requires reading the module's code whole, and the words fixes touch
- bio-plane/src/reading-pipeline/index.mjs (1,435 lines), of which I have read only the regions around the findings (about 300 lines);
- bio-plane/src/reading-pipeline/readingprov.mjs (260 lines), of which I have read only lines 165-256;
- the finding-holding tests origin.test.mjs, convert-tiers.test.mjs, read.test.mjs (586 lines), text-units.test.mjs (435 lines), and dec149.test.mjs (its NO_STORE copy changes with the key below).
Reading those whole is about 80k tokens in this session, past the half-window point (mechanics §6.1), so I cannot finish the reads in this window either. I am not editing from partial reads.

What the fixes need from BOB, decided before I start:
1. reading-pipeline.no_evidence_store already holds a row ("Your team's Civicsmith has no evidence store set up, so the capture's bytes cannot be read." - capital Y, final period). The source sentence is lowercase with no period. Plan: use word("reading-pipeline.no_evidence_store"), which changes the member-facing casing and adds a period. OK to change the wording this way? (Alternative: a new localize id with the current text, leaving the reserved key unused.)
2. Fragments with no row (the "reported characters" count, "no reference carries where it was read: this document was read as one undivided string", and the test copies of the `origin` register sentences): plan to add localize('reading-pipeline.index.<slug>', en) at the site, with no test copying the text. OK?
3. Every other finding maps to an existing row (for example why.ocr_member_name, why.ocr_member_reported, why.ocr_member_returned, reader_parse_text, read_reader_tier, reader_found_entities, text_layer_read, document_text_layer, already_text_kept, text_read_back, text_carries_per, says.read_classified_different, says.read_classified_different_text, reader_say). Plan: word() at each site; no rows.mjs edit.

Next step on your word (or on reading the whole files if you prefer I continue in a fresh window): I will read index.mjs, readingprov.mjs and the five test files whole, make the edits, and run the module's tests and checks.

Session: session_01GJErmRTWWrhmqcKEnHY1X6. Branch: job/T51/reading-pipeline at its origin head.

## J3 · COMPLETE

COMPLETE: T51-190 (reading-pipeline words pass), applied on B3's answer (K3987).

**Entries applied.** All 11 findings, 10 plain findings and 4 test copies of `build/plan/words-pass/reading-pipeline.md`; `checks/words.mjs` for the module: `inline 0, plain 0, testcopy 0, missingkey 0; 0 failures`.
- `index.mjs`: `word()` at each site whose sentence has a row (`reader_say`, `reader_parse_text`, `read_reader_tier`, `reader_found_entities`, `already_text_kept`, `text_layer_read`, `document_text_layer`, `why.ocr_member_declined`, `_name`, `_reported`, `_returned`, `no_evidence_store`, `text_read_back`). Also, beyond the list, two sentences with rows: `page_left_civicsmith`, `answer_name_model`. `localize()` for three fragments with no row: `reading-pipeline.index.reported_characters`, `.decoded_glyphs`, `.read_one_undivided_string`.
- `readingprov.mjs`: `text_carries_per`, `says.read_classified_different`, `says.read_classified_different_text`, `why.text_surface_answered`.
- Tests: `convert-tiers` (`scanned()` / `keptClause()` built from the rows), `read` (equality with `why.content_type_declares`), `text-units` (`tier_read_essentially_nothing`), `dec149` (`NO_STORE` by key), `origin` (probe signals are now identifiers, not sentences; the full `checks/run.mjs` flagged them as copies of court-doctypes' sentences).

**Member-facing wording changes (the list wins, K3930):** the no-evidence-store basis now reads "Your team's Civicsmith … cannot be read." (capital, period; B3 approved); `provenance.pages_why` spells "itemized". The latter changed the pinned docx digest in `pieces.test.mjs`; I re-pinned once, after confirming that replacing "itemized" back with "itemised" reproduces the old digest.

**Deferred / for BOB (not changed):** sentences the check does not count and that I left as literals: `tier3LoopNote`'s not-asked sentence, `the AI declined (…)`, and the failed-reading basis strings in `read` / `readInner` (`the document names no capture digest…`, `the capture's bytes are not held…`, `the reading could not be composed…`, `the {fmt} entry produced no text…`, `…could not read these bytes…`, `the document was not read as text…`), `images_why` in `containerExtentOf`. They are member-readable; BOB decides whether the design stream gets them as rows (I would not add ids unasked). `LAYER_FIDELITY_SOURCE`, `NAMED_ENGINE_SOURCE`, `AI_TRANSCRIPTION_SOURCE` are stored chain text (signed-record grammar, K1333): left as is. `readingprov.mjs` `compareProvenance`'s undetermined sentence stays a `localize` with its own id; a row `says.reading_provenance_whether` exists with different text.

**Found in another module:** none. `rows.mjs` is stale for the three new `reading-pipeline.index.*` ids (expected; `build.mjs --check` names them, no refusal).

**Tests and checks:** `node --test test/m/reading-pipeline/*.test.mjs test/m/extraction/read.test.mjs`: `tests 137, pass 137, fail 0`; d606, tier2-wire, pdf-worker-binding each `pass 1, fail 0`; tier-pagewise probe exit 0. `format`: `0 failures`; `architecture`: `0 failures`; `coverage`: `34 of 34 live requirement ids named; 0 failures`; `ownership`: `0 failures`; `checks/run.mjs`: no line naming reading-pipeline.

Size (session_01Lok5rc1LRdKaFhnhJxw8j2): test runs 6, module lines 1795

## J4 · COMPLETE

COMPLETE (B4, K3989): the member-readable literals are keyed. `tranche/T51` merged into the branch.

`localize` ids added in `index.mjs`: `reading-pipeline.index.pages_not_asked_request` (tier3LoopNote's not-asked sentence, with count, pages, limit), `.ai_declined`, `.ai_reading_label` (the exported `AI_READING_LABEL`, English unchanged), `.placement_not_read` (`images_why`), `.reading_not_composed`, `.no_capture_digest`, `.bytes_not_held`, `.entry_no_text`, `.entry_not_read_bytes`, `.document_not_read_text` with `.multipart` and `.non_textual_large` for its reason. English unchanged. No test held these sentences, so no test changed. Left as is: `LAYER_FIDELITY_SOURCE`, `NAMED_ENGINE_SOURCE`, `AI_TRANSCRIPTION_SOURCE` (stored chain text, signed grammar, K1333), `refused` fallback in `refusalSays` (a code, not a sentence).

Checks: `checks/words.mjs` for the module `inline 0, plain 0, testcopy 0, unkeyed 0; 0 failures`; module tests `tests 137, pass 137, fail 0`; d606, tier2-wire, pdf-worker-binding `pass 1, fail 0` each; probe exit 0; format, architecture, coverage (34 of 34), ownership `0 failures`; `checks/run.mjs` names nothing in reading-pipeline. `rows.mjs` is stale for the new `reading-pipeline.index.*` ids (expected).

Size (session_01Lok5rc1LRdKaFhnhJxw8j2): test runs 9, module lines 1800

## J5 · COMPLETE

COMPLETE (B5, FR-65, L6, K4194): the reading of a captured web page is its content.

**Entry applied.** `visibleTextOfHtml` (`bio-plane/src/reading-pipeline/index.mjs`) now drops, before tags are stripped: any `nav` and any element with `role="navigation"` (first role token, case-insensitive) with its contents, counted by the element's own name so a nested one does not end it early; skip links (an `a` whose `href` begins `#` and whose text, markup removed, begins "Skip to"); and, after references are decoded, the tokens `{digits}`, `{identifier}` and `##LOC[...]##`. Everything else visible is kept; a page with no landmark keeps all its text. R32 is amended in `build/requirements/reading-pipeline.md` with that line (and the Status line), as B5 asked; no id is marked not yet met, because R32 is named by tests.

**Choice made (my ruling, in scope of the entry):** an element with no end tag is not guessed at: its tag goes and its words stay (dropping to the end of the page would lose the article). Noted in R32.

**Tests (`test/m/reading-pipeline/text-units.test.mjs`), written first and seen failing:** the furniture page yields units for the article only, and text_chars and provenance digest are over the whole page as before; each landmark alone; controls: a `nav` inside the article is dropped with its contents and the words around it stay, nesting by name (a sibling after a nested role=navigation div is kept), case-insensitive names, an unclosed nav keeps its words; a page with no landmarks keeps everything; other roles, `#` links not beginning Skip to, a Skip to link that is not a `#` link, and braces that are not a token are kept; plain text is untouched; two readings are identical.

**Found in another module / stale generated artifacts (not edited):** `bio-plane/dist/bio-plane.bundled.mjs`, `agent-worker/dist/agent-worker.bundled.mjs` and the two `release/*.bundled.mjs` hold the old `visibleTextOfHtml`; they are stale until rebuilt. `rows.mjs` is stale for ai-accounts (`build.mjs --check` names `ai-accounts.declared.accountusesset`, not mine). One run of the wider set (extraction, acquisition, answers, query-language) showed 1 failure of 490 that I could not catch again: three further runs and the run before my change were 0 failures; I did not identify the test.

**Tests and checks:**
- `node --test bio-plane/test/m/reading-pipeline/*.test.mjs bio-plane/test/m/extraction/read.test.mjs`: `tests 141, pass 141, fail 0`.
- `node --test` over extraction, acquisition, answers, query-language: `tests 490, pass 490, fail 0` (three runs).
- `checks/format.mjs`: `0 failures`; `architecture.mjs reading-pipeline`: `0 failures`; `coverage.mjs reading-pipeline`: `34 of 34 live requirement ids named by a test; 0 failures`; `words.mjs reading-pipeline`: `inline 0, plain 0, testcopy 0 ... 0 failures`; `ownership.mjs`: `0 failures`.
- `checks/run.mjs /home/user/bio`: no line names reading-pipeline; its 7 coverage and 7 words failures are other modules' (inherited).

Size (session_01Ff44xuNBVDnvzJCTR8DH73): test runs 12, module lines 1790

## J6 · COMPLETE

COMPLETE (B6, fix round 2, C5's reading half, K4323): the reader reads the whole object held under the document's fingerprint first. `tranche/T51` merged into the branch.

**Entry applied.** `bytesOf` (`bio-plane/src/reading-pipeline/index.mjs`) for a multipart document now asks `evidence.get(capture.sha256)` first and returns that object whole; it assembles parts, under MULTIPART_READ_MAX, only when no whole object is held (a failing read of the whole falls through to the parts). A document with neither is refused as before (parts over the bound: the same `why`; a missing part: the same `why`).

**Proposed R2 wording, for BOB to write:** append to R2: "(T51 fix round 2, C5; K4323; capture R86, acquisition R10, R11) **The whole object first.** A multi-part capture whose whole object is held under the document's fingerprint is read from that object; its parts are assembled, within MULTIPART_READ_MAX, only when no whole object is held, and a document with neither is a failed reading saying so. Test: a 21 MiB three-part capture whose whole object is held is read whole, the parts never fetched; control: the same parts with no whole object held, over the bound, still refuse as before." Also the R23 line for `bytesOf` could say "(R2: the whole object first)".

**Test** (`test/m/reading-pipeline/pieces.test.mjs`, "R2 R23: bytesOf reads the whole object held ..."), seen failing first on the unchanged code (`pass 8, fail 1`), then passing; its control is inside it: parts only, 21 MiB, refuses with the over-the-bound sentence; with the whole held only that key is fetched and the bytes equal the whole; a small multipart with no whole still assembles.

**Deferred / found elsewhere:** nothing deferred. `bio-plane/dist/bio-plane.bundled.mjs` (and the other bundles holding `bytesOf`) are stale until rebuilt, not edited. Callers of `bytesOf` in other modules (extraction's re-read, `index.mjs` line 1337 here) are unchanged and get the new behaviour. No census op is owned by this change.

**Tests and checks:**
- module + d606, tier2-wire, pdf-worker-binding: `tests 153, pass 153, fail 0`.
- users (`modules.json` uses): extraction + events `tests 290, pass 290, fail 0`; content `tests 142, pass 142, fail 0`. (`impact.mjs origin/tranche/T51 HEAD` names 108 modules, 1686 files; I ran the three direct users.)
- `format.mjs`: 0 failures; `architecture.mjs reading-pipeline`: 0 failures; `coverage.mjs reading-pipeline`: `35 of 35 live requirement ids named by a test; 0 failures`; `words.mjs reading-pipeline`: 0 failures; `ownership.mjs reading-pipeline tranche/T51`: `3 files changed ...; 0 failures`.

Size (session_016qGyozq8Rczq8BoW6LAp4C): test runs 8, module lines 1860

## J7 · COMPLETE · re B7

COMPLETE (B7, fix round 5, E1; E2's half stated below with the one thing it needs). `tranche/T51` merged into the branch first. Pushed at the branch tip.

**E1 root cause, confirmed in the code (file:line, `bio-plane/src/reading-pipeline/index.mjs`):** `readInner` took the format from the recorded profile alone (was :1537, `fmt = profile.format.format`). An upload held in parts is profiled from no byte, so that format is `undetermined`; `entry` was null, `wireable` false, and `textRead` required `!multipart`, so a multipart document always reached the last branch and was written `final` "not read as text (multipart)". Why the tests missed it: every multipart case in this module's tests carried a recorded `pdf`/`html` format or a stub entry, and none asserted words in `text_units` for an upload recorded `undetermined`.

**Change.** `readInner` (:1546, :1566-1574): after the bytes are held, a recorded format that is `undetermined` or none is detected again with `detectFormat(bytes, profile.source_content_type || ct)` (the recorded profile is never trusted over bytes held; a single part recorded `undetermined` is re-detected too). New helpers at :1528-1533 (`TEXT_TYPE`, the same text types acquisition's `profilesAsText` judges, and `utf8TextOf`): a multipart document whose format is still `undetermined`, whose profile's `source_content_type` is a text type, and whose bytes are strict UTF-8 without a NUL, is read as text (R32's path, R1's reader, units, chain, words). `bytesOf` and the R37 ceiling are untouched: a 30 MB document is still stated `final` with its size before any byte is loaded.

**Failing-first** (`test/m/reading-pipeline/undetermined.test.mjs`, new, 7 tests; each asserts the words are in `text_units`, R-STOP; run on the unchanged code: `tests 7, pass 3, fail 4`; the 4 red were the E1 cases, the 3 green were controls):
- red→green: a 10 MB text-layer PDF in two parts, recorded `undetermined`: read through the pdf entry (40 pages, tier 1, units hold the PDF's words). The same with no recorded format at all. A 12 MB UTF-8 text file declared `text/plain` in two parts: read as text, its first unit holds the first sentence, `text_container` "text". A single-part PDF recorded `undetermined`: read, units equal the same PDF recorded `pdf`.
- controls (green before and after): a 30 MB PDF recorded `undetermined` still states the ceiling, `failure: "final"`, basis equal to `word("reading-pipeline.why.capture_bytes_parts", ...)` with its size and 24 MiB; prose declared no type, and a NUL-bearing file declared `text/plain`, in parts, are still not read as text; two reads of the same upload are identical.
After the change: `tests 7, pass 7, fail 0`.

**Platform (rule 4), local workerd, `workerd-ceiling.probe.mjs`** (now takes `PROBE_BUDGET=<bytes>`, default unchanged; the units budget given to `read`; here the index bound 2,097,152). Smallest V8 old space in which `read` completes, plus the file's bytes (object limit 128):
| file | pages | MB | old space | heap + bytes |
|---|---|---|---|---|
| BUDGET-2025-BUD | 188 | 2.4 | 33 | 35 |
| BUDGET-2025-PER | 295 | 8.4 | 42 | 50 |
| BUDGET-2024-APP | 1,354 | 15.2 | 83 | 98 |
| synthetic text pages, 120 lines | 1,000 | 4.8 | 56 | 61 |
| synthetic text pages, 120 lines | 2,000 | 9.6 | 88 | 98 |
| synthetic, 21 MB | 1,300 | 20.1 | 65 | 85 |
| synthetic, 22 MiB (E1's size, one object) | 300 | 22.0 | 37 | 59 |
A 22 MiB upload held in parts adds the assembled copy beside its parts (about +22 MB), so about 81 MB at worst, under 128. No deploy.

**E2 (R42 re-measured at the index bound): the table above is the baseline on the tranche's pdf-reader as of now (the rule's recorded figures 35/50/98 and 66/98 for the same files stand within 5 MB at the 2 MiB bound, so the index bound costs this module nothing it did not already cost). pdf-reader (merge 1) is still WORKING and has not merged, so the numbers after its object-table bound cannot exist yet.** The smallest thing I need: tell me by CHANGE when pdf-reader has merged into `tranche/T51`; I merge it, re-run the same seven files at `PROBE_BUDGET=2097152` and post the table. Nothing else of E2 is mine (`pdfstructure.mjs` R42's constants are pdf-reader's; `readHeld`'s budget is extraction's).

**Requirement lines I propose, for BOB to write in `build/requirements/reading-pipeline.md`:**
- append to R2: "(T51 fix round 5, E1; K4530) **Bytes over the recorded profile.** A capture whose recorded format is `undetermined`, or none, has its format detected again from the bytes the reader holds (`format-registry.detectFormat`, the declared type only where the bytes say nothing) before the format is chosen; a capture held in parts, profiled from no byte, is read through the entry that detection finds. Test: a 10 MB text-layer PDF in two parts recorded `undetermined` is read, its words in `text_units`; control: a 30 MB PDF still states R37's ceiling."
- append to R32: "(T51 fix round 5, E1) A capture held in parts whose format stays `undetermined`, whose profile's `source_content_type` is a text type and whose bytes are UTF-8 without a NUL is read as text, as a single part is. Test: a 12 MB file declared `text/plain` in two parts has text units; controls: no declared type, or a NUL, is not read as text."
- the R32 text "(R1: a textual type, a single part, within the profile's text bound)" now also covers this multipart case.

**Tests and checks (all on the job branch tip):**
- `node --test --test-force-exit test/m/reading-pipeline/*.test.mjs test/d606-perpage-ocr.test.mjs test/tier2-wire.test.mjs test/system/pdf-worker-binding.test.mjs`: `tests 193, pass 193, fail 0`; `test/tier-pagewise.probe.mjs` exit 0.
- users: `test/m/extraction/` + `test/m/content/`: `tests 377, pass 376, fail 1`: the one is `c5b-memory` (E2's, extraction's job; red with the other suites running beside it, passes alone: `pass 1, fail 0`; the plan lists it as a margin-bound defect on the tranche tip, not caused by this change); `test/m/events/`: `tests 93, pass 93, fail 0`.
- `checks/run.mjs`: format `176 modules, 176 requirements files; 0 failures`; architecture `4160 product files, 14216 relative imports; 0 failures`; coverage `6605 of 6605 live requirement ids named by a test; 0 failures`; channels 0 failures; words `0 failures` (reading-pipeline: `0 failures`, inline/plain/testcopy/missingkey 0).
- `checks/ownership.mjs /home/user/bio reading-pipeline tranche/T51 job/T51/reading-pipeline`: `4 files changed by reading-pipeline ...; 0 failures`.

**Found elsewhere / stale artifacts:** none in another module. `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundles `read`) is stale until BOB rebuilds it at the layer close; not edited. No census op owned. R-OLD: this fixes new reads; an older stored "(multipart)" reading is repaired by extraction's `readHeld` replacing it once (extraction's entry in the plan), not here.

Size (session_01SnD31Lo4LuZRr5JLS6rug9): test runs 11, module lines 2183

## J8 · COMPLETE · re B8

COMPLETE (B8, E2: R42 re-measured at the index bound with the merged reader). `tranche/T51` merged into the branch (pdf-reader's d071cdc9ec: object table bound, ASCII85/Hex, R42 density term `READ_BASE_DENSE_MB` 29 / `READ_PAGE_DENSE_MB` 0.001). E1 stands as posted in J7.

Local workerd, `workerd-ceiling.probe.mjs` with `PROBE_BUDGET=2097152` (the index bound), smallest V8 old space in which `read` completes, plus the file's bytes (object limit 128), before the merge (J7) and after it:
| file | pages | MB | old space before / after | heap + bytes before / after |
|---|---|---|---|---|
| BUDGET-2025-BUD | 188 | 2.4 | 33 / 33 | 35 / 35 |
| BUDGET-2025-PER | 295 | 8.4 | 42 / 42 | 50 / 50 |
| BUDGET-2024-APP | 1,354 | 15.2 | 83 / 83 | 98 / 98 |
| text pages, 120 lines | 1,000 | 4.8 | 56 / 56 | 61 / 61 |
| text pages, 120 lines | 2,000 | 9.6 | 88 / 88 | 98 / 98 |
| synthetic 21 MB | 1,300 | 20.1 | 65 / 65 | 85 / 85 |
| synthetic 22 MiB | 300 | 22.0 | 37 / 37 | 59 / 59 |
| text pages, 120 lines | 3,500 | 17.6 | refused by R42 (`TOO_LARGE_TO_READ`), as before; the probe prints "does not complete" for a refusal |
So the merged reader changes none of these seven figures: the index bound and the object-table bound cost this module's read nothing more, and R42's rule (needs 61 / 97 / 150 for 1,000 / 2,000 / 3,500 text pages; 33 / 43 / 82 for the govinfo volumes) still sits within 16 MB of the measured need (the largest gap: BUDGET-2024-APP, rule 82 against 98 measured, as pdf-reader's R42 text already states). Whether the rule's constants move for dense pages is pdf-reader's (its density term was measured on its own files); nothing here argues for a change.

Tests after the merge: module + d606 + tier2-wire + pdf-worker-binding `tests 193, pass 193, fail 0`; `checks/ownership.mjs ... job/T51/reading-pipeline`: `0 failures`. No file changed in this entry other than the merge.

Size (session_01SnD31Lo4LuZRr5JLS6rug9): test runs 12, module lines 2183

## J9 · QUESTION

QUESTION (G6, R39; best reading given; I carry on with it)

`read` now refuses a bare digest stub (no parts, no `capture.bytes`, no `retrieved`, no profile) with `{refused: {code: "BARE_DIGEST", why}}` and NO `reading` key (R39). Failing-first seen red, then green.

**This breaks one consumer test outside my module, by design of the entry:** `bio-plane/test/m/extraction/r80.test.mjs:60` ("R80 R31 R32: after the repair the OCR re-read ... runs"): `readHeld` of a WHOLE digest registered by parts only finds no stored document (`#storedDocument`, index.mjs:679) and hands `read` the stub `{capture:{sha256: digest}}`; `read` now refuses, and `writeReading` (index.mjs:871) throws on `out.reading` undefined. The same stub is built at extraction/index.mjs:1506. `read` cannot tell a part digest from a whole one (the 8 MiB part and a real 8 MiB whole look alike), so a stub can only be refused.

**What extraction's G6 job must therefore do (my reading of "extraction: resolve a part digest to its document or refuse, write nothing for a bare part"):** (a) never hand `read` a stub: for a WHOLE it reads, build the document with at least `capture.bytes` (the size `ev.head` answers, or the register's `total`), so it is no stub; (b) treat `out.refused` as "write nothing" (`left("BARE_DIGEST")`), never reach `writeReading` with no reading; (c) r80.test.mjs:60 and any test that reads a whole through a stub change with it. Until that job merges, extraction's R80 repair test is red on my branch; this is the only red I found in the direct users (extraction 35 files, content, events): 474 of 475.

Contract extraction can rely on (to be R39): a stub answers exactly `{refused: {code: "BARE_DIGEST", why}}`; `refused` is absent from every other answer except R40's.

If you want a different contract (for example the refusal also carrying a failed `reading` marked `transient` so an old caller never crashes), say so; I would then add it. Waiting on nothing: I continue with G13.

## J10 · QUESTION

QUESTION (G15, sheet row blocks; best reading given; I carry on with it)

Splitting a sheet into row-range units needs each text line's ROW NUMBER, and no reader emits it: a sheet's `text` is its non-empty rows tab-joined, one line each, EMPTY ROWS SKIPPED (`csv-reader/index.mjs:769` `if (vals.length) lines.push(...)`; xlsx and ods the same), and a streamed CSV (the large case) has `cells: null`, so the line index is not the row. I cannot name a true A1 range from the text.

**Smallest thing I need:** csv-reader, formats-xlsx (`formats-xlsx.mjs:1038`) and odf (`odf.mjs:1858`) each emit on every sheet `lineRows`: an array, one 1-based row number per line of `sheet.text`, same length as its lines (a few hundred KB for a 1 MB CSV; optional, absent = unknown). Owners of those modules would add it in this round.

**What I build now regardless:** a sheet whose text is over the 128 Ki unit cap is split into blocks of whole lines, each unit's text = the sheet's first line (header) repeated + the block's lines; with `lineRows` the extent is `sheet-range` `A{first}:{lastcol}{last}` of the block's data rows; WITHOUT `lineRows` the extent is the sheet's whole used range (honest, ambiguous but each block is a distinct searchable unit with its own seq, and NONE is cut). A long line/paragraph of a text is split into runs (`doc-para` extent `run: 0,1,..`), never cut. pdf-page and slide units over the cap (a page of > 128 Ki characters) keep today's cut, flagged `truncated`, because their extents have no run to name.

**G13 cursor, as BOB #253 gave it:** `cursor` option string (opaque), answer top-level `more`, `cursor`, `read_through`, `total` (bytes of text); mode is on whenever the `cursor` key is passed (null = first piece); without the key `read` is today's. I also answer `piece: {units, words, units_total}` (units_total on the first piece only).

## J11 · COMPLETE

COMPLETE: G6 (provider), G13 (provider), G14 (provider), G15 (owner), fix round 6, reading-pipeline #22. Pushed on job/T51/reading-pipeline (tranche/T51 merged in).

**What changed** (`bio-plane/src/reading-pipeline/index.mjs`, 1792 -> 2117 lines)
- **G6 / R39.** `isBareStub` and the refusal at the top of `read` (new section "A reading in pieces", ~:1190-1400; `read` ~:1795). Root cause: extraction `readHeld` substitutes `{capture:{sha256}}` for a part digest (extraction:679, :1506), and `readInner` (old :1770-1773, :1444) read the 8 MiB part as a whole: "non-textual or too large", no size, `at: null`, stored `final`. A document with no parts, no `capture.bytes`, no `retrieved` and no profile answers exactly `{refused: {code: "BARE_DIGEST", why}}`, no `reading` key, before anything is loaded. Missed because fixtures register one part and every fixture document carried a size. Contract as BOB #253 accepted (K4577).
- **G13 / R40, G14.** `read(document, {cursor, unitsBudget, maxUnits})`. Mode is on when the `cursor` key is passed (`null` = first piece); without it `read` is as before. Answer adds top-level `more`, `cursor` (opaque string, null when `more` is false), `read_through`, `total` (bytes of text), and `piece: {units, words, units_total (first piece only)}`. `seq` and `para` are global to the capture. The first piece is the reading with its units and the whole text's `words_total`; a later piece is `{text_units, more, cursor, read_through, total, piece}` with no `reading`, and for a text it skips the recognisers and parse (a 12 MB continuation costs ~70 ms). **Every format:** a capture read through a format entry (PDF, DOCX, sheets, slides) is paged by unit index with a cursor naming digest and unit count (`pieceUnitsOf`, `listPiece`); a continuation re-runs the entry (and tiers 2-3 for a PDF, which is deterministic) and answers units alone. A cursor that fits neither the digest, the shape nor the bytes in hand answers `{refused: {code: "CURSOR_MISMATCH"}}`; a cursor for a capture that cannot be read in pieces `NOT_PIECEWISE`. A piece holds at least one unit.
- **G14, unclosed head** (`dropHead`, before `visibleTextOfHtml`). My reading of the HTML parsing rules: `<head>` is implicitly closed by the first start tag that is not head content (title, meta, link, base, style, script, noscript, template) or by the first non-whitespace text, so an unclosed head drops only up to there and the body's text is read. An unclosed `script`, `style` or `template` is raw text to the end of the document (the script data state), so those drop to the end as before; BOB's "only if no later text exists" is the same thing. Old data: new reads only.
- **G15 / R41** (in pieces mode). A line or paragraph over `CAPTURE_TEXT_UNIT_CAP` is carried whole as consecutive `doc-para` units, extent `run` 0, 1, ... (split at the last space in the final eighth), never cut. A sheet whose text is over the cap is carried as blocks of whole lines, the first line (header) repeated at the head of each later block; with the reader's `lineRows` (B12, wave 2) the extent is `sheet-range` `A{first}:{lastcol}{last}`, without it the sheet's whole range, none cut. A pdf-page or slide unit over the cap stays cut and is flagged `truncated` (observation-log counts it partial in wave 2). No-cursor reads cut as before.
- No census op is owned (pure module). R-OLD: nothing stored is touched; new reads only.

**Failing-first, seen red then green**
- `bare-stub.test.mjs` (R39), before the code: 3 of 4 red ("a stub is not read: no reading is composed", actual: the old "non-textual or too large" failed reading); after: 4 of 4.
- `text-pieces.test.mjs` (R40, R41), before the code: 6 of 7 red (the first at "1 pieces": no cursor support); after: green. The 12,000,060 B text (120,000 lines of 100 B, last line ENDMARKER) read in 30 pieces equals the whole read once (sha of the units' JSON equal), every line once, last piece `more:false` and `cursor:null`, ENDMARKER in `text_units`, `words_total` equal; held only in parts the same; 7 cursor mismatches refused; controls: a text that fits is one piece with the units of today's read, paragraphs/HTML/one line unchanged, a tiny budget still moves, no cursor cuts and names as before.
- `pieces-formats.test.mjs` (R40 every format, R41 sheets, R32 head): a 6,000-paragraph document (cut with its tail named today; in pieces its tail reaches `text_units`), a 300-page dense PDF, a 9,000-row sheet in blocks with and without `lineRows`, and the head cases: green. Written with the code, not seen red separately.

**Platform L** (`text-pieces.probe.mjs`, local workerd with the bytes behind a disk service, V8 old-space bisected; wall time outside the isolate): 12 MB text (12,582,912 B): first piece completes from 39 MB old space (heap + bytes ~51 MB of 128), 1.7 s wall incl. workerd start; a middle and a last piece from 35 MB (~47 MB), 70 ms. 24 MiB (25,165,824 B, the ceiling): first piece from 49 MB (~73 MB), 3.4 s; middle and last from 46 MB (~70 MB), 120 ms. One piece per tick is well inside the object. Not measured: the 300-page PDF's continuation in workerd (it re-reads the PDF; R36's memory test covers the read itself).

**Suites.** reading-pipeline `test/m/reading-pipeline/*.test.mjs` + `extraction/read.test.mjs`: 211 of 211; d606, tier2-wire, pdf-worker-binding and `tier-pagewise.probe` pass. Memory test "R2 R11 R15 R36 BUDGET-2024-APP under 64 MB" alone: 4 of 4 pass (63 s). Users (`impact.mjs`, 1,669 files, two at a time): 12,355 of 12,381 test cases pass at the first run; the 12 reds, against `tranche/T51` run the same way: 8 are red there too (journey-check `pseudo` R29 x7, plane `release` R24); `R31 (E8)` passes alone (load); the other three are mine and named: (1) `extraction/r80.test.mjs:60` and (2) `plane/fix4-seam.test.mjs:41` (R75 R4 seam): extraction's `readHeld` reads a whole through a stub, refused by R39; accepted by name until EXTRACTION #34 merges (K4577); (3) `agent-worker/test/requirements.test.mjs` R45: `bio-plane/src/reading-pipeline/index.mjs` is in agent-worker's bundle and its committed bundle is now stale; regenerate at the round's close (manifest order).
**Checks.** `checks/run.mjs`: format 0, architecture 0, coverage 6632 of 6632, words 18421 -> 18421 (no row added), 0 failures; ownership 6 files, 0 failures.

**Words (stand-ins, rows owed for UX-DESIGN).** The three refusal sentences use held rows: `reading-pipeline.index.bytes_not_held` (BARE_DIGEST, CURSOR_MISMATCH) and `.non_textual_large` (NOT_PIECEWISE). Owed: `reading-pipeline.index.bare_digest`, `.cursor_mismatch`, `.not_piecewise`. The code is the answer; the sentence is for the log.

**Requirement lines I propose** (BOB writes `build/requirements/reading-pipeline.md`; the tests name R39-R41):
- **R39** (fix round 6, G6; K4570, K4577) A document that states nothing of its object but a digest (no `parts`, no finite `capture.bytes`, no `retrieved`, no profile) is no document: `read` answers exactly `{refused: {code: "BARE_DIGEST", why}}`, loads nothing and composes no reading. `refused` is absent from every other answer except R40's. A document with no digest stays a failed reading (R24).
- **R40** (fix round 6, G13, G14; K4571, K4577, K4578) A reading is read whole in pieces by a cursor. With `cursor` passed to `read` (null: the first piece), the answer carries `more`, `cursor` (an opaque string, null when `more` is false), `read_through` and `total` (bytes of text) and `piece = {units, words, units_total?}`; `seq` and `para` continue across pieces; a piece holds the units `unitsBudget` bytes and `maxUnits` (default 4096) allow, and at least one. It applies to a capture read as text (R32, R33: line, paragraph or HTML grain unchanged) and to a capture read through a format entry. The first piece is the reading with its units and the whole text's words; a later piece is its units alone. The units of all pieces are the units of one read with no bound, each once; no piece names skipped units. A cursor that does not fit the digest, the shape or the bytes in hand answers `{refused: {code: "CURSOR_MISMATCH"}}`, one for a capture that cannot be read in pieces `NOT_PIECEWISE`. Without `cursor`, `read` is as R15 states.
- **R41** (fix round 6, G15; K4578) With `cursor` passed, a line or paragraph over `CAPTURE_TEXT_UNIT_CAP` is carried whole as consecutive `doc-para` units with `run` 0, 1, ...; a sheet whose text is over the cap is carried as blocks of whole lines, its first line repeated at the head of each later block, the extent `sheet-range` naming the block's rows when the sheet states `lineRows` (one 1-based row per line of its text), else the sheet's range. Nothing is cut; a page or slide over the cap is cut and flagged `truncated` as R15 states.
- **R32** amended (G14): an unclosed `<head>` ends at the first start tag that is not head content or the first text; the body's text is read; an unclosed script, style or template is raw text to the end.

Size (session_01AG4YHRj238neiSnHE1cvQ4): test runs 31, module lines 2117
