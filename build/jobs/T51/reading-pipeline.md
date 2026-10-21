# reading-pipeline (T51)

**Status** · session_01Ff44xuNBVDnvzJCTR8DH73 · depth 2 · COMPLETE · handled B5

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
