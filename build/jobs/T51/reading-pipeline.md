# reading-pipeline (T51)

**Status** · session_01AG4YHRj238neiSnHE1cvQ4 · depth 2 · WORKING · handled B8

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
