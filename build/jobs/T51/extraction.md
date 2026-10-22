# extraction (T51)

**Status** · session_01UQSKFgKi97NTLN8hrXppFC · depth 2 · WORKING · handled B29

## J1 · REPORT

Findings in other modules (not mine; for their jobs or BOB):
- `observation-log` `bio-plane/src/observation-log/index.mjs:313` [plain] "document is text and no extraction step stands between them"
- `observation-log` `bio-plane/src/observation-log/vocabulary.mjs:1367` [plain] "the archive fallback became eligible: three failures or fourteen da..."
- The whole `checks/run.mjs` run reports 3905 words failures across the repository. None is in extraction or extractrun.

For BOB (a wording decision, not taken by me):
- The two sentences I localized that say "your team's Civicsmith" keep "team" exactly as they read. K3803 (3) says "group" for "team" in every text a person reads; `words.test.mjs` (DEC-149) asserts "group's Civicsmith" is never in a refusal translation. I left the wording unchanged. Please rule: keep "team" (the DEC-149 form) or change it to "group" through the design stream.

Rows the design stream may want (setup-words `--check` reports rows.mjs stale on these; expected, BOB regenerates at the layer close):
- extraction.index.no_text_provenance_recorded
- extraction.index.no_evidence_store_set_up
- extraction.index.reread_candidates_frontier
- extraction.extractrun.undetermined_ceiling
- extraction.extractrun.position_unreadable

## J2 · COMPLETE

T51-189 (extraction, words) is done. Commits: 6015179aee (the change), cf6e6249a9 (merge of tranche/T51).

Entries applied:
- Part 1, the two test copies: `t44.test.mjs:145` and `t48.test.mjs:112` read the key `ai.refused.projectkeptaway` through WORD, not the sentence. `t44`'s "placeholders kept" assertion now compares with WORD("transcribe.refused") filled with the relayed translation, not a regex on the old sentence.
- Part 2, the seven plain findings: `index.mjs` 982, 1280 and 1485 are `localize` (ids `extraction.index.*`); `extractrun.mjs` 312 and 430 are `word` on rows the list already holds (`extractrun.why.earned_nothing_proposal`, `extractrun.says.machine_credential_marked`); `extractrun.mjs` 351 and 363 are `localize` (ids `extraction.extractrun.*`). Every one is member-readable, so none is listed as unkeyed.
- Bundler R38, `words.mjs`: `WORD_ROWS` is no longer imported; each key has its own literal `word()` call in one table; `say(key)` looks the key up there, so no `word()` call takes a variable key. `rawWords` is replaced by a literal `TRANSCRIBE_WORDS` in `checks.mjs`, its placeholders left as written.
- Also, not in the findings: `words-reads.json` declares nine `extractrun.*` keys for extraction, which the module did not list. The words test was red before this job; `WORD_KEYS` now declares them and it passes.
- A consequence of my own localize: `n26.test.mjs:208` copied the new sentence; it now asserts the fragment "evidence store set up".

Deferred: none.

Other modules (for their jobs or BOB): in REPORT J1.
Decision for BOB: "team" vs "group" in the converted sentences, in REPORT J1.

Tests and checks (the last run after the merge):
- `node --test bio-plane/test/m/extraction/`: 184 tests, 184 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio extraction`: 0 failures.
- `checks/coverage.mjs /home/user/bio extraction`: 52 of 52 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio extraction tranche/T51 job/T51/extraction`: 0 failures (8 files changed by extraction, all inside its paths).
- `checks/run.mjs /home/user/bio`: no finding in extraction or extractrun. The repository's total is 3905 words failures (not mine).
- `setup-words/build.mjs --check`: exit 1, a stale-rows note that names six new localize ids (listed in REPORT J1). It is the expected note, not a refusal; BOB regenerates rows.mjs at the layer close.

Size (session_01AMS17zW7T6NQQhJwzerr6u): test runs 6, module lines 3303 (`wc -l` over `bio-plane/src/extractrun.mjs` and `bio-plane/src/extraction/*.mjs`).

Note on the commit message: it names the session link but not a model identifier, which the system prompt forbids in commit messages.

## J3 · COMPLETE

Answer to B3 (K3988), and the COMPLETE again.

- (1) "team" stays: no change.
- (2) `n26.test.mjs:208` compares its reason with the product's `localize` call by equality (the id `extraction.index.no_evidence_store_set_up` with its en), no substring copy. Commit on job/T51/extraction.
- (3) Code-written ids need no row: noted.
- Merged `tranche/T51` into the job branch (4 files, no changes to extraction files other than this test).

Tests and checks after the merge:
- `node --test bio-plane/test/m/extraction/`: 184 tests, 184 pass, 0 fail.
- `checks/run.mjs /home/user/bio`: no finding in extraction or extractrun.
- `checks/format.mjs`, `architecture.mjs` and `coverage.mjs` for extraction: exit 0. `ownership.mjs` for extraction: 0 failures.
- `setup-words/build.mjs --check`: exit 1 with only the stale-rows note for the six new localize ids (expected; BOB regenerates at the layer close).

Size (session_01AMS17zW7T6NQQhJwzerr6u): test runs 8, module lines 3303.

## J4 · COMPLETE

CR-18 · extraction (R77) is done. Commit a248229e02 on job/T51/extraction.

Entries applied:
- R77: `readingFor`'s answer states `bytes` from provenance's `homeOf(captureSha).bytes`. The module keeps the provenance it is handed (the `provenance` option, previously used only for the testimony slot). `bytes` is absent when the register holds no row for the capture.
- Test: `bio-plane/test/m/extraction/r77.test.mjs` (new), four tests naming R77. A capture with a register row answers its stored size and every other field equals the answer without provenance; a capture with no row answers no `bytes` key; no provenance joined answers no `bytes` key; a viewer the bundle is withheld from receives no `bytes` (and no `text_units`).

Decision for BOB (lower-level, taken by me, recorded here since the job may not write build/rulings.md): `bytes` is withheld with the bundle, as `text_units` and the unread pages are (R27's "withheld with the bundle"). R77 says only "absent when the register holds no row". A viewer the bundle is withheld from therefore gets no size. Say if you want it always stated.

Deferred: none.

Other modules: none found. The R77 status marker in `build/requirements/extraction.md` still reads "not yet met: T51"; BOB updates it (the job does not write requirements).

Tests and checks:
- `node --test bio-plane/test/m/extraction/`: 188 tests, 188 pass, 0 fail (184 before, plus the four R77 tests).
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio extraction`: 0 failures.
- `checks/coverage.mjs /home/user/bio extraction`: 53 of 53 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio extraction tranche/T51 job/T51/extraction`: 0 failures (3 files changed by extraction, all inside its paths).
- `checks/run.mjs /home/user/bio`: no finding in extraction or extractrun. The repository's words total is 15 failures in other modules (promotion and others), none mine.
- `setup-words/build.mjs --check`: a stale note for `words-unreviewed.json`, no refusal naming extraction. Generated artifacts not touched.
- Packages installed (`npm ci --ignore-scripts`) in each directory with a tracked lockfile before the test run.

Size (session_011WULPoKT4oA92LsPkDR5nx): test runs 2, module lines 3310 (`wc -l` over `bio-plane/src/extractrun.mjs` and `bio-plane/src/extraction/*.mjs`).

## J5 · COMPLETE

CHANGE B5 (R78) is done. Commit 5aa3f5abf1 on job/T51/extraction, pushed. Merged tranche/T51 first.

Entries applied:
- R78: `readingFor`'s answer states `format`, the reading's `capture_format`, absent when the reading holds none (null or empty), and withheld with the bundle as `bytes` is (same `withheld` test as `text_units`).
- Test: `bio-plane/test/m/extraction/r78.test.mjs` (new), three tests naming R78. A reading written with `html` answers `format: "html"`; a reading with no capture format answers no `format` key; a viewer the bundle is withheld from receives no `format`.

Decision for BOB (lower-level, my call, reported here): `format` is withheld on the reading's own bundle, as `text_units` is, while `bytes` (R77) is withheld on the register's home bundle. The two coincide in practice; say if you want one rule for both.

Deferred: none. Other modules: none.

Tests and checks:
- `node --test bio-plane/test/m/extraction/`: 191 tests, 191 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio extraction`: 0 failures.
- `checks/coverage.mjs /home/user/bio extraction`: 54 of 54 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio extraction tranche/T51 job/T51/extraction`: 0 failures (2 files changed by extraction, inside its paths).
- `setup-words/build.mjs --check`: the same stale note for `words-unreviewed.json`, no refusal naming extraction. Generated artifacts not touched.
- The R78 status marker in `build/requirements/extraction.md` still reads "not yet met"; BOB updates it.

Size (session_011WULPoKT4oA92LsPkDR5nx): test runs 2, module lines 3314 (`wc -l` over `bio-plane/src/extractrun.mjs` and `bio-plane/src/extraction/*.mjs`).

## J6 · COMPLETE

C17 (extraction half) is done. Commit: the one after cf6e6249a9's merge of tranche/T51 on job/T51/extraction.

**Entries applied.** A reading written by a re-read states `words_total` and `words_read` as the first reading does (`textWordsFor` of the re-read's text, reading-pipeline R35). Sites: `pdfStructure` (`op=pdfstructure&ocr=1`), `pageTranscribe` (`op=pagetranscribe`), and the N26/N439 docx/pptx migrations, which recompute them when the old reading held them (they already refreshed text_chars and the like). They are stored with the reading and `op=reading` (`readingFor`) answers them; no other change.

**Requirement line for BOB to fold (extraction R34 and R71):** "A reading a re-read or a transcription writes also states `words_total` and `words_read` as reading-pipeline R35 counts them over the text it wrote, so a document read again says how much of it was read; `op=reading` answers both. Test: a re-read answers equal counts when every page was read; control: a re-read with a region below the OCR floor answers fewer read than total, and a document never re-read answers its first reading's counts."

**Tests** (`bio-plane/test/m/extraction/c17.test.mjs`, four tests, seen failing first: three of four fail without the change, the control passes): re-read, equal counts (R34 R35); re-read with a region below the floor, 9 total / 6 read (R34 R35); control, a never re-read document answers its first reading's counts (R35); a transcription's counts (R71 R35).

**Runs.** extraction suite: 197 tests, 0 fail (one earlier run showed 1 failure that did not repeat in two later runs). Direct users of extraction (content, entities, events, connections, observation-log, standards, progressions, duties, retrieval-browse, retrieval, calculations, leg-earning, inquiry, steps, basis-versions, contradiction, run-productions, intent, investigation, case-carriage, case-disclosures, case-account, case-authoring, following, translations, instance-setup, answer-envelope, control-plane): 0 failures each. Failures that are not mine, each reproduced on tranche/T51 without my change: op-declarations 1 (t50 registryActGaps), store-door 1 (declared-ops, "no hand row disagrees with the owner's row", groupdescriptiondraft). plane 1 (R24, screen words, "your group's Civicsmith"): a words test; I did not run it on the bare tranche.
Checks: format 0 failures; architecture 0; words 0; ownership 0; coverage 10 failures, none in extraction (agent-harness R17, agent-runner R37 R38 R40, contradiction R61, control-plane R116, installer-steps R26 R31, interface-shell R111, journey-check R19, screens-inquiry R123–R125, screens-intake R54, screens-publish R70–R72).
Nothing deferred. Nothing found in another module. No generated artifact made stale.

Size (session_01ALmoG5zY9hNNTsdddSrGb9): test runs 14, module lines 3329

## J7 · COMPLETE

Fix round 3, wave 1, cause **C5 (my part: the repair act)**, met by **extraction R80**.

Built: `Extraction.readHeld({sha, storeName?, env?}) → {ok, read, why?, bundle_id?, found?}` in `bio-plane/src/extraction/index.mjs`, an in-process act the door calls (not an op, so no census declaration). When `provenance.homeOf(sha)` names a home, no `readings` row exists, and the evidence store holds an object under the sha (`head`), it reads the stored document (the bundle's `data/provenance.json` entry, else `{capture:{sha256}}` as the migrations do) through `read`, and writes the reading for the home bundle with R19's writer (`composed: true`, `profileFormat` from the document), one transaction with history and index, R24 listeners and R69 after-read run as for any reading. Otherwise it writes nothing and answers `{ok: true, read: false, why}`. It writes no bundle, no register row, no promotion. The `readings` row is looked at again inside the write, so a reading that lands while the bytes are read stands; a second call changes nothing.

Tests (`bio-plane/test/m/extraction/r80.test.mjs`, 10, written first and seen failing with `readHeld is not a function`): a parts-only home gets its reading once the whole is held (`op=reading` answers found, bundle is the home); a second call changes nothing; no bundle written; the OCR re-read (R31, R32) answered 409 `REEXTRACT_NOT_READ` before and runs after; failed reading recorded once (R45); listeners run (R24). Controls: a digest with a reading, a digest with no home, a home with no whole object, a malformed digest, a store with no provenance each write nothing; the three `why` answers differ.

Decision for BOB (record in rulings): `why` is a stable code, not a sentence: `NO_HOME`, `READING_HELD`, `NO_WHOLE_OBJECT`. The door must not show it to a member as is; if a screen needs words, that is a word-table row the design stream writes. No keys needed from me.

Entries for control-plane's R117: call `extraction.readHeld({sha, storeName, env})` and await it; it answers `read: false` (never throws on the cases above); `read` itself never throws. Wave 2 test against the real act now exists on `job/T51/extraction`.

Deferred: none. Found in other modules: none. Provider doubles: none needed (acquisition's keep-whole is not read by this act; it asks only whether the object is held).

Tests and checks:
- `node --test --test-force-exit bio-plane/test/m/extraction/`: 207 tests, 207 pass, 0 fail (before: 197).
- `bio-plane/test/m/control-plane/` (the door's suite, the act's only future caller): 340 pass, 0 fail.
- `build/plan/impact.mjs origin/tranche/T51 HEAD` names 107 modules, because `index.mjs` holds `DECLARED_OPS` (a shared table I did not touch); I ran only extraction and control-plane, the act having no caller yet. BOB may want the rest run at the wave's merge.
- `checks/coverage.mjs extraction`: 56 of 56 live ids named, 0 failures. `checks/architecture.mjs`: 0 failures. words: 0 failures. `checks/ownership.mjs extraction origin/tranche/T51 job/T51/extraction`: 0 failures (3 files, all mine).
- `checks/run.mjs`: format has 1 failure, `build/rulings.md:4346` (K4349 states no standing-list decision), BOB's file and on the tranche tip, not mine.
- Environment: `file-scanner`, `bio-plane/src/journey-check`, `sheet-worker`, `agent-runner`, `site` have a lockfile and no `node_modules` here (K4113); none is an input to extraction's or control-plane's suite, so I did not install them.

Size (session_01RNKFMerseiVz1hP5LfR1JD): test runs 6, module lines 3354

## J8 · QUESTION

STEP-0 REPORT for C5a/P8 (extraction's part: the reading of the 2.5 / 8.8 / 15.9 MB PDFs). No fix code written; I ask you to release or redirect the fix.

Measured on the real govinfo files (BUDGET-2025-BUD 2.39 MiB/188 pages, BUDGET-2025-PER 8.39 MiB/295 pages, BUDGET-2024-APP 15.19 MiB/1354 pages), the reading being tier 1 (`pdf` format entry = `extractPdfStructure`, pure JS, in the plane's object; the PDF_WORKER member is not used for these in the walker's copy: "no pdf-worker member is set up" / tier 1 only).

L (workerd 2026-07-22 under miniflare, the module bundled as a Worker, idle workerd RSS 85 MB; local workerd does not enforce the 128 MB, so the peak is compared to it):
- 2.39 MiB: 1.57 s in the isolate, workerd RSS peak 221 MB (+136 over idle)
- 8.39 MiB: 2.32 s, peak 403 MB (+318)
- 15.19 MiB: 14.40 s, peak 471 MB (+386)
Node, whole `Extraction.read` (reading + text units, the fixture's baseline heap included): 1.5 s / 3.4 s / 20.7 s wall (CPU-bound, cpu = wall); heap + array buffers peak 176 / 329 / 508 MB; RSS peak 328 / 523 / 967 MB. Pages read 188 / 295 / 1354; units 17 / 65 / 58.

Reading it: (1) the reading IS the slow and heavy phase: CPU time 1.5 s, 3.4 s, 14-21 s, so at 15.9 MB it alone is over half the door's 25 s, and the 8.8 MB capture fails at 25-36 s only if acquire (fetch + parts + keep) takes the rest; (2) the cause of the 502 `STORE_DID_NOT_ANSWER` at 2.5 MB (3 of 3) is memory, not time: the reading needs about +136 MB over the idle isolate, past the object's 128 MB, so the object is reset mid-read, which also loses the in-memory stage holder (`timings: {}`) and silences the same object's other calls: hypothesis H, now measured for the memory half; (3) because the memory is what fails, RC-R1's deferral (reading after the answer, by `readHeld` and the plane's alarm) does NOT by itself fix it: the alarm runs the same read in the same object and meets the same 128 MB. Every PDF over about 2 MB would still reset the object, only later.

What would work (the module and what it needs; I write none of it before your release):
 (a) pdf-reader (`extractPdfStructure`) bounded in memory: it brute-force scans every object and every ObjStm and keeps all page content streams decoded; a page-by-page reader that drops each page's decoded stream after reading it would hold the peak near one page's worth. That is `pdf-reader`'s module (wave 0 #1, merged before me), not mine.
 (b) the read of a PDF over a size bound (say 2 MB, RC-R1's own figure) goes to the PDF_WORKER fleet member (tier 2, its own isolate and limits) and the object only stores its answer; `reading-pipeline.read` is `reading-pipeline`'s (cause-reading-3 in wave 1), the object's alarm is `plane`'s.
 (c) extraction, mine: `readHeld` and `readheld` already read what the pipeline reads; once (a) or (b) lands there is nothing further to change in extraction for C5a. Until then `readHeld` of a 21 MB PDF (C5b) meets the same wall: its reading by tier 1 would need about +400 MB.
Please decide: which of (a) or (b), and which job; or hold C5a's fix for the redeploy's phase clock (K4428). My C5b/N5 work (below) is independent of this and proceeds.

## J9 · QUESTION

QUESTION (replaces nothing; J8 is the C5a step-0 report). One cross-module thing `op=readheld` (N5, RC-R3) needs, found by running the impacted suites:

`bio-plane/test/m/op-declarations/t36.test.mjs` (R34, affordances R48) now lists `readheld` among the member ops that have "no text and no ground": every op in SESSION_OPS.member must have an explanation in affordances' `ACT_HELP` or be named in `ACT_HELP_ABSENT`. `readheld` is a member op because extraction declares it (`DECLARED_OPS.readheld`, classes admin and member, `needs: null`, weight undetermined), which RC-R3 requires so a screen can offer it. The same test already fails on the tranche tip for `capturecredentiallist`, so it is red there, not caused by me; mine adds `readheld` to its list.
Smallest thing I need: `affordances` (or whoever BOB names) adds `readheld` to `ACT_HELP` (a sentence such as the press "Read it now" does: the document's record holds it unread, the press reads it) or to `ACT_HELP_ABSENT`. I cannot write another module's file. Until it is written, that one test names `readheld` as well as `capturecredentiallist`.

Also for your information (no answer needed): the op's door route. `control-plane/owner-ops.mjs:103` already maps a store-internal `readheld` to `readHeld({sha, storeName})`; extraction now also exports `extractionOps().readheld` (the member's op: gated by the `viewer` stamp, refused as an absent record, NO_SHA without a digest), spread earlier in `plane/store.mjs:777` and so overridden by the control-plane arm unless control-plane's job drops its arm or passes `viewer` through it. control-plane (wave 0 #6) owns that; I list it in my COMPLETE.

## J10 · COMPLETE

COMPLETE (EXTRACTION #30, fix round 4, wave 0). Commits on job/T51/extraction up to 8ba962b9c2 (tranche/T51 merged at the end). One test is red by name, as B9 ordered, until PDF-READER #8's code merges: `c5b-memory.test.mjs`. It is the only open item.

Entries applied: R80 as amended (RC-R3): `readHeld` replaces a failed reading once; `op=readheld`; B11 (K4440) home found by the held reading's bundle.

C5b (1) Root cause: `readHeld` answered READING_HELD for any readings row (extraction/index.mjs readHeld), a failed one too; the failed reading is `reading-pipeline/index.mjs:1373` bytesOf over 20 MiB with no whole; plus (K4440) a multipart capture is registered by its parts so `homeOf(whole)` is null: readHeld now falls back to the bundle of the readings row. Now `#wantedTheWhole`: found false, its document has `parts`, and its basis is one of reading-pipeline's three want-of-whole sentences (over the size, a part not held, parts not adding up); a reading with text, and a failed reading made from the whole (single capture, or parts with another basis), are not replaced; the replacement is in the same transaction and only if the stored reading is still the one examined, so a second call changes nothing and a replacement that fails again is not read a third time. (2) Test gap: readHeld's tests built a home with no reading. Fix: `r80-failed.test.mjs` builds the failed reading by the real chain (`read` over a 3-part, 21,036,491-byte document with no whole held, then the promote projection, then the whole held). (3) Failing-first, seen red then green: "R80 R45 (C5b) a home promoted with a reading that failed for want of the whole is read by readHeld once..." (red: read false READING_HELD; green: reading has the units, history keeps the failed reading); controls (text not replaced; failed from whole not read again, single and in parts; no whole object; no home) green before and after; the K4440 test (register names nothing for the whole) red before the fallback, green after. The door half (second `acquire` of the address then `op=reading` has text) is control-plane's seam test. (4) L: the memory of the reading. `c5b-memory.test.mjs` (a 20 MB, 1300-page synthetic three-part PDF through the real chain, child process --expose-gc): the read, found and pages assertions pass; the memory assertion is RED BY NAME: 889 MB above idle against the object's 128 MB, until pdf-reader R41 (PDF-READER #8) is on tranche/T51 (not yet at my last merge, 22:1x UTC). P (read-only, smoke copy): INFO-2026-0042-a-pdf-from-www-oaklandca-gov (capture sha 7b7db7d3...) `op=reading` found:false (no reading row now, the copy differs from the walker's 12:xx state); INFO-2026-0080-member-photo-rewalk-jpg (sha f021bf80...) found:false, the N5 premise (stored unread).

N5 (1) Root cause: certain, no door for a record already stored unread. Now `extractionOps().readheld` (the member's act, body or address `sha`; NO_SHA without a digest; `viewer` stamp gates it: a viewer who may not see the home's bundle, or none, is answered `{ok:true, read:false, why:"NO_HOME"}` exactly as for a digest with no home, writing nothing) and `DECLARED_OPS.readheld` (classes admin, member; mutating; needs null; weight undetermined; fields accepts/requires `sha`). (2) The old-data case is now a fixture: a home the register names, whole held, no readings row. (3) "R80 (N5): op=readheld by a member who may see the document reads a record stored unread; a second press changes nothing" red (no arm), green; controls green; `declared-ops.test.mjs` readheld arm green. (4) P: INFO-2026-0080 stored unread (above); the press is walked at the re-walk.

C5a (extraction's part): J8, accepted in B9. Numbers, L (workerd 2026-07-22 under miniflare, tier 1 of the real govinfo files, idle RSS 85 MB): 2.39 MiB 1.6 s peak 221 MB; 8.39 MiB 2.3 s 403 MB; 15.19 MiB 14.4 s 471 MB. Node whole read: 1.5/3.4/20.7 s. Nothing further in extraction.

Requirement ids met: R80 (as amended), R79 (readheld declared), plus all R-ids named as before; coverage 56 of 56.
Suites: extraction 218 tests, 217 pass, 1 fail (the named red). Also run: reading-pipeline 380/380; op-declarations+op-grades+conformance 513, 1 fail (t36 R34, below); plane 283, 2 fail; control-plane 356, 2 fail. Checks: format, architecture, coverage, ownership 0 failures; checks/run.mjs 0 findings for extraction (one sentence moved to key `extraction.index.readheld_no_sha`).
Reds not mine / expected: (a) op-declarations t36 R34 names `readheld` and `capturecredentiallist`: B10, cleared by AFFORDANCES; (b) control-plane `r117-held.test.mjs` "R117 (the door's map)" now answers 403 CLASS_FORBIDDEN where it expects 400 UNKNOWN_OP, since `readheld` is a real op: CONTROL-PLANE #45 updates that test and drops its arm `owner-ops.mjs:103` or passes `viewer` (otherwise that arm overrides mine in plane/store.mjs and is ungated); (c) red on the tranche tip too: plane `release.test.mjs` (screen.objective.purpose), plane `roster.test.mjs` (project-roster R5/R9/R45), control-plane `t47-e2e.test.mjs` (R81 Home).
Words rows to regenerate at the layer close: extraction.declared.readheld, extraction.index.readheld_no_sha (setup-words --check reports rows.mjs stale on them; expected).
QUESTIONs: J8 answered B9, J9 answered B10; none open. Proposed requirement lines: none beyond RC-R3 (K4440's home-by-reading's-bundle is stated by the tests; add to R80 if you want it written).
Size (session_01RnSLEohe5ooQjmP6bd8UAC): test runs 24, module lines 3409

## J11 · COMPLETE

COMPLETE (EXTRACTION #31, fix round 4, R81). Commit on job/T51/extraction: the change and its test (tranche/T51 merged first). No open item.

Cause (as B12 diagnosed, confirmed): `readHeld` found no home for a capture held in parts, because capture's `promoteDocument` registers only the part shas, so `provenance.homeOf(whole)` is null and the K4440 fallback looks in `readings` for the very reading that is owed: every alarm tick answered NO_HOME.

Change: `bio-plane/src/extraction/index.mjs:651-656` (the call in `readHeld`, after the register and the held-reading fallbacks) and `:686-700` (`#homeOfParts(whole)`). It finds the bundle whose `data/provenance.json` states `capture.sha256 = whole` (`files` joined to `bundles`, `instr`, at most 8 candidates), takes the document's `parts`, and accepts the bundle only when `provenance.homeOf(part)` names that same bundle for every part, so a bundle that merely mentions the digest is no home. The viewer gate, the held-reading checks, `bytesOf` (which assembles the parts) and the writer are unchanged. No new use, no provenance change.

Failing-first: `bio-plane/test/m/extraction/r81.test.mjs`. Red before the change (`readHeld` answered read:false, NO_HOME for the promoted two-part capture; second-call test the same); green after: a two-part capture promoted (register names the parts, the bundle's provenance names the whole), whole held, `readHeld` reads it (`read: true`, bundle INFO-1), `op=reading` finds it with units; a second call answers READING_HELD and changes nothing. Controls: unpromoted capture still NO_HOME; a bundle naming the digest whose parts the register does not give it is NO_HOME; a viewer who may not see the bundle is NO_HOME. R81 is now named by a test; its "not yet met" mark is BOB's to lift.

Measurements: `t51-large-pdfs.test.mjs` whole: 1 test, pass, 82.6 s wall. BUD, PER and APP are all read after the alarm (the line that failed, `BUDGET-2025-PER.pdf: found after the alarm: {"found":false}`, passes), 2.5/8.8/15.9 MB answered inside 15 s with the capture kept, the 140 KB IRS file answered with its reading. The test asserts the memory bound itself; I took no separate workerd measurement (the reading's cost stays K4479's 54-57 MB above its bytes in node).

Suites: extraction 223 tests, 223 pass, 0 fail (run alone; `c5b-memory.test.mjs` passes, it read 145 MB and failed only when run beside the 4-minute test, so do not run them together). control-plane + plane whole: 666 tests, 665 pass, 1 fail, which is not mine: plane `release.test.mjs` R24 (`screen.objective.purpose` not in the words list), red on the tranche tip already (named in the J10 record). impact.mjs lists 107 of 175 modules because it reads extraction's `DECLARED_OPS` as a shared table; the users that call `readHeld` are control-plane and plane, run whole above.
Checks: format 0 failures; architecture (extraction) 0; coverage (extraction) 57 of 57 live ids named; ownership (extraction, tranche/T51..job/T51/extraction) 0 failures. `checks/run.mjs` whole: no finding in my files; coverage (agent-harness R17, agent-runner R37 R38, installer-steps R26 R31, journey-check R19) and words (testcopy in screens-publish fix4.test.mjs:97) fail in other modules; the words count is not raised by me (no sentence added).

Found in other modules: none new. Generated artifacts made stale: none (no word added, no bundle input changed).
Size (session_013CUWFqoDsBdasaVpjLFLWT): test runs 9, module lines 3433

## J12 · QUESTION

Three interface shapes my R82 shares with providers that are not merged (cause-reading-4 = reading-pipeline R37; plane R77). Please pin them for both sides; I build on these readings now and adapt if you rule otherwise.

1. **The mark (D4).** A failed reading carries `failure: "transient" | "final"` (string key on the reading; absent on a reading that found text). `readHeld` replaces a stored reading with `found:false` and `failure === "transient"`; a failed reading with no key (stored before R37) is final: R-OLD = new data only. 
2. **Every unit (D5/F8).** `reading-pipeline.read(document, {…, unitsBudget})` and `textUnitsFor(i2text, {budget})`: `budget` defaults to `ACQUIRE_TEXT_UNITS_BUDGET`; `Infinity` charges no wire budget (each unit still cut to `CAPTURE_TEXT_UNIT_CAP`). `readHeld`, the re-read and the transcription pass `Infinity`; extraction's own bound (4,096 units, 2 MiB, R22) stays and states what it skips. (A 400-page fixture within 2 MiB is fully findable; a denser packet is cut at 2 MiB, stated by `skipped`.)
3. **What the ledger calls and reads (D2/F9).** The plane's `ocr` entry calls `readHeld({sha, kind})`. With `kind: "ocr"` and a stored reading with pages still unread, `readHeld` asks the OCR member for the pages the stored units do not hold (R35's seeding is the cursor; no new stored field) and writes the re-read as composed. The answer gains `owed: true` whenever work remains for that digest (pages left, or the new reading is itself `failure: "transient"`); no `owed` key means the entry ends. Plane R77 must keep an entry while `owed` and must not treat `READING_HELD` as ended when `owed` is true.

## J13 · COMPLETE

EXTRACTION #32 · T51-fix-4b entry 7 · R82 done (commit 1ec27147da on job/T51/extraction, pushed). Shapes as pinned in B14 (K4488): `failure`, `budget`, `kind`/`owed`.

**Root causes (file:line before the change).** F4: `extraction/index.mjs:661` replaced a stored reading only when `#wantedTheWhole`; every other failed reading answered `READING_HELD`, which `plane/pending.mjs:74` counts as ended. F8: `readHeld`, `#writeReread` and `#migrateOne` (`:666`, `:1560`, `:1407`) took their units from `textUnitsFor`, whose wire budget (reading-pipeline `index.mjs:855`, 512 KiB) belongs to the acquire answer only; measured here, a 400-page / 0.9 MB PDF indexed 210 pages and named 190 skipped. F9: nothing continued a scan past the pass that read 24 pages: `op=pdfstructure&ocr=1` is the member's act and refuses the door's own call (gates, `reextractBasis` sight check). F12: `#migrate` (`:1362-1370`) moved the cursor `after` past every candidate whatever its skip reason, and `startMigrations` discards `skipped`.
**Why the tests missed it.** R80's tests built only "no reading" and "multipart cap" homes; no fixture had more than a few pages, so no text reached the budget; n26's cutoff test seeded fake digests with no bytes and asserted `done: true`, pinning the pass-by.

**What changed (`bio-plane/src/extraction/index.mjs`).**
- `readHeld` (`:655-701`): replaces a failed reading with `failure: "transient"` (`failedTransiently`, `:372`), same guard (the stored reading must still be the one examined); a reading with text, `final`, or no mark is never replaced (R-OLD: new data only, B14). Calls `read(..., {budget: Infinity})` (`:684`, `read` forwards `budget`); extraction's own bound (R22: 4,096 units, 2 MiB) is unchanged and states what it skips. The answer carries `owed: true` when the reading written failed transiently, or has `tier3_candidate` and an OCR member is bound (`:698`).
- `readHeld({kind:"ocr"})` -> `#continueOcr` (`:706`): when a stored reading has `tier3_candidate`, runs `pdfStructure` ocr=1 ungated (new internal flag `ungated`, `:1503`, `:1523`, `:1674`; the op never passes it, so `op=pdfstructure`'s gates are unchanged), author `plane:pending-work`, asking only the pages the stored units lack (R35's seeding is the cursor). Written: `owed` while pages remain. Nothing written: `owed: true` only when the OCR member was down or answered non-2xx (watched on its `fetch`); pages the member declines in a 200 answer end the entry (`why: OCR_NO_PROGRESS`). Other ends: `NO_READING`, `NO_PAGES_LEFT`, `NO_OCR_MEMBER`, `NO_WHOLE_OBJECT`, `UNREADABLE`.
- Re-read and transcription (`#writeReread`, `:1675`) and the migrations (`:1471`) index with `textUnitsFor(text, {budget: Infinity})`.
- F12 (`#migrate`, `:1394-1440`; `#migrateOne`, `:1451-1454`): a candidate whose bytes are not held (or no evidence store) is queued in `reading_migrations.retry` (additive column, `:83`), tried first at every later run and boot, the cursor still moving; the migration is `done` only when the cursor is exhausted and nothing waits. R-OLD repair: a migration row written before this (`rescan` NULL, additive column) scans again once from the start at the next boot (`#migrationState`), then is marked; a reading already migrated or read after the cutoff costs no read.
- Test edit: `n26.test.mjs` T38 case: its two filler old readings now have bytes held (`n26.test.mjs`, the loop before `first`), since a candidate whose bytes are absent now keeps the migration open (R82 amends R66); the assertions are unchanged.

**Failing-first, through the entry path (`bio-plane/test/m/extraction/r82.test.mjs`, 12 tests).** Red before the change: 9 of 12 failed (the 3 passing were controls): 400-page `readHeld` -> state `partial`, 210 written; re-read of 400 pages -> not all indexed; transient mark -> `READING_HELD`; 60-page scan -> no `owed`, no `kind: ocr`; 503 member -> no `owed`; F12 -> migration `done: true`, `no such column: rescan`. Green after: all 12 with reading-pipeline's two small changes stood in locally (below).
**Seam, red by name until CAUSE-READING-4 merges (R-SEAM; the provider is not merged):** four tests need reading-pipeline R37: "R82 R22 seam ... `budget` option" (two: `read`/`textUnitsFor` take `budget`) and "R82 R80 seam ... R37" (two: the entry-throws and `evidence.get`-throws cases need the `failure: "transient"` mark). With a local stand-in for exactly those two provider changes (`textUnitsFor(i2text, {budget})` and `read(..., {budget})`; `failure: "transient"` on the `evidence.get` throw and on the entry-throw failed reading; applied to the working tree, run, reverted; patch at `/tmp/claude-0/-home-user-bio/13b17a58-63fb-5619-8b90-86628ab199fa/scratchpad/provider-standin.patch`) all 12 pass. The smallest thing I need: CAUSE-READING-4 merged before me, as the plan's order has it, with exactly B14's shapes; then BOB re-runs `node --test --test-force-exit bio-plane/test/m/extraction/r82.test.mjs`, expecting 12/12.

**Measurements (Node, `--expose-gc`, heap + arrayBuffers above idle, the fixture's own text copies included; no workerd run: the index bound R22 is unchanged, so the DO write per `readHeld` is bounded as promote's is; what grows is an array of references into text already held).** 400 pages / 0.9 MB text: default budget 25 MB, 210 written, `partial`; `budget: Infinity` 26 MB, 400 written, `whole`. 5,000 pages / 11.3 MB text: default 123 MB, 210 written; Infinity 129 MB, 889 written, `partial`, 4,111 over the 2 MiB bound, named. (The 21 MB `c5b-memory` test is unchanged by this work; it is flaky near its 128 MB line on the clean tree too: 3 runs on `tranche/T51` gave pass, 138, 130 MB; 4 runs here pass, 129, 131, pass.)

**Suites and checks.** `node --test --test-force-exit bio-plane/test/m/extraction/`: 235 tests, 230 pass, 5 fail (the four seam tests above; `c5b-memory`, the flake above). Users: plane 297 (1 fail: `release.test.mjs` R24, "screen.objective.purpose is held by the words list", words rows stale, not mine), control-plane 369/369, content+retrieval+tasks 452/452. `impact.mjs` names 107 modules because the file carries `DECLARED_OPS` (I changed none of it); I ran the ones that call what I touched (plane's `pending`, control-plane's `readHeld`, content and retrieval's table joins, tasks). `checks/run.mjs`: format 0, architecture 0, words 0 failures (inline 0, plain 0, no new word), coverage fails only on other jobs' unmerged ids (R100, R103, R51, R35, R72, R37, R18, R25); channels 0. `ownership.mjs extraction tranche/T51 job/T51/extraction`: 3 files, 0 failures. extraction coverage 58/58.

**For other jobs (stated in B14 already).** plane R77: keep an entry while `owed`; call `readHeld({sha, kind: "ocr"})` for the `ocr` kind; `READING_HELD` carries `owed` never (a held reading with pages left is the `ocr` entry's, not the `reading` entry's). reading-pipeline R37: the shapes above.

**Requirement lines I propose (BOB writes them).** R82: "(fix round 4b, F4, F8, F9, F12; K4487) A transient failure is read again; nothing read is cut short. `readHeld` replaces a failed reading carrying `failure: "transient"` (reading-pipeline R37), never one marked `final`, unmarked, or with text. It offers every unit of the text to the index, which keeps R22's bound and states what it skips; only the acquire answer carries the wire's budget; the re-read, the transcription and the migrations do the same. `readHeld({sha, kind: "ocr"})` asks the OCR member for the pages the stored units lack and writes the re-read as a composed reading. Its answer carries `owed: true` when work remains: the reading just written failed transiently, pages remain and an OCR member is bound, or a pass read nothing because the member was down; pages the member declines end it. A migration's candidate whose bytes are not held is queued, tried at every later run, and the migration is done only when none waits; a migration that finished before this scans again once." Tests: r82.test.mjs, 12 tests above. Wording: no new sentence (`why` values are codes; the stored page text is the screens' via `unread_says`); rows owed: none.

Size (session_019RcTbWsRRhrZ7k5jcyP7gC): test runs 21, module lines 3497

## J14 · COMPLETE

CHANGE B15 done. Merged tranche/T51 (502edbc26f); `read` (extraction/index.mjs:601) now forwards the provider's name, `unitsBudget`, keeping my own `read(..., {budget})` signature. `r82.test.mjs`: 12/12. Extraction suite: 235 tests, 234 pass; the one fail is `c5b-memory`, the pre-existing flake near its 128 MB line (5 runs here: pass, pass, pass, pass, 132 MB; clean tranche earlier: 138, 130). Ownership 0 failures.

On `owe`: not passed from `read`, and not needed. `readHeld` answers `owed: true` itself whenever the reading written has `tier3_candidate` and an OCR member is bound (or failed transiently), and `kind: "ocr"` passes keep it owed while pages remain; the plane's ledger entry for that digest is kept by that answer. The `owe` hook is for callers with no answer to give (the acquire path), which is the door's and reading-pipeline's seam, not `readHeld`'s.

Size (session_019RcTbWsRRhrZ7k5jcyP7gC): test runs 27, module lines 3497

## J15 · QUESTION

QUESTION (E2, `c5b-memory`): I need pdf-reader's merge before the 100 MB gate can be green.

What is done: `readHeld` now reads with the index's bound (`extraction/index.mjs:699`, `budget: CAPTURE_TEXT_CAPTURE_BOUND`), and `c5b-memory.test.mjs` now fails above 100 MB (GATE_MB).

Measured here (node, same 21 MB / 1,300-page file; heap + array buffers above idle, sampled every 5 ms):
- `readHeld` with `Infinity` (the old code): 126 MB.
- With the index bound (the fix): 112, 124, 129, 130 MB in four runs and 99 MB in one, so it is not stable under 100.
- `pdfstructure.extractPdfStructure` alone on the same bytes: 96 MB. That is pdf-reader's object table, which sits on this branch unchanged (fix round 5 has not merged pdf-reader yet).

So the budget costs only the units' share (about 13-28 MB, inside the noise); the rest is the parse. The test cannot go green under 100 MB from this module.

What I need: the pdf-reader merge (plan E2 (c): the object table bounded). Tell me when `tranche/T51` carries it and I will merge it, run `c5b-memory` alone five times and record the numbers. Until then I complete everything else and name this test red, by name, in my record and COMPLETE (R-NOTMET asks me to ask now rather than defer). If you would rather close this job first, say so and I will post COMPLETE with that one test named red.

## J16 · QUESTION

QUESTION (E2, `c5b-memory` still red after B20; I need a ruling).

Merged `tranche/T51` (pdf-reader, reading-pipeline in). `c5b-memory` alone, five runs, gate 100 MB, peak above idle: 120, 116, 111, 111, 116 MB. All five fail. (Before the pdf-reader merge: 112-130.)

Where it sits (node, `--expose-gc`, heap + array buffers, same 21 MB / 1,300-page file):
- `extractPdfStructure` alone on a copy of the bytes: 94-98 MB (this includes the 21 MB copy).
- `readHeld` on a single-part home, peak reached inside `read` (before any write): 122-127 MB. The three-part test home: 111-120 MB.
- So about 15-30 MB is added between the entry's parse and the finished `read`: reading-pipeline's work over the I2 text (units, word and glyph counts, the joined document, `readText`), not extraction's. My part is already at the index bound (`budget: 2 MiB`, extraction/index.mjs:699), and the write after `read` adds nothing to the peak.

I cannot get under 100 MB from extraction. Smallest thing I need, one of:
(a) READING-PIPELINE shaves the 15-30 MB (a further job on its `readInner`), then I re-run five times; or
(b) you rule the gate at a number the file can meet with margin (the object is 128 MB; today's peaks are 111-127), and I set it and run five times.

Everything else in my entries is done and pushed (E1 repair, E3, E2's budget, `defer=1` B18); I will post COMPLETE as soon as `c5b-memory` is green on five runs.

## J17 · COMPLETE

COMPLETE · EXTRACTION #33 · fix round 5 (E1 repair, E2 units, E3; B18 `defer`, B19, B21). Pushed on job/T51/extraction.

**What changed (`bio-plane/src/extraction/index.mjs`).**
- `readHeld`: E3 `#sizeOf` + over-ceiling skip of the whole check (statement written, `read: true`, from parts' sizes); E1 `#nowDetected` (range get of the first KiB, `detectFormat`; a declared-text UTF-8 head also qualifies) and `notReadAsText` (the "not read as text" sentence, in both causes, read through `localize` with reading-pipeline's own ids): a held `final` reading of that sentence is read again once with the detected format as `profile.format`; a reading that is still that sentence is not written; a document with no profile format is detected the same way at its first read; E2 `budget: CAPTURE_TEXT_CAPTURE_BOUND` (was `Infinity`); B18 `defer` option / `defer=1` query (`READING_PENDING` after every gate, nothing read), `defer` added to the `readheld` declaration's accepts.
- R-OLD: new data only; older records are repaired by the press (E1), no sweep.

**Root causes.** As the plan states (readHeld NO_WHOLE_OBJECT before any read; reading-pipeline `bytesOf` states an over-ceiling capture from sizes; final "not read as text" never replaced). Tests missed them: R80's tests built only small homes and a "no reading" state (no home over the ceiling, none with a final reading); fixed by `round5.test.mjs`.

**Failing-first (`round5.test.mjs`, 11 tests; seen red on the old code, 4 of 9 then, green now).** R84 five-part 41.5 MB home with no whole: statement written, `read: true` (red: NO_WHOLE_OBJECT); a transient reading of a 30 MiB capture replaced by the final one; controls: 22 MiB needs its whole, an outsider gets NO_HOME. R83 600-page text: `words_read < words_total`, index within 2 MiB (red on `Infinity`); control: a short text equal. R85 final "(multipart)" reading replaced once, words in `text_units`, `format` pdf, history keeps the old, a second press changes nothing; controls: undetectable bytes, an over-ceiling final reading. R86 (B18): `defer=1` visible home READING_PENDING and nothing written, hidden home the same refusal as without, a held reading READING_HELD. Not seen red: R86 (written after the code).

**`c5b-memory` (B21).** Gate retired to the object's limit: child `--max-old-space-size=88`, `readHeld` of the 21 MB / 1,300-page file, single-part home and three-part home promoted with the failed reading, must complete with the words in `text_units`; the sampled peak is printed only. Five runs of both: green all five (sampled peaks 60-83 MB). **Red-first not shown, and why:** the same child with `budget: Infinity` also passes at 88; I bracketed it: both variants die at 72 and below and both pass at 78 and above, so the units budget does not move the heap's feasibility (the units are references into text the pipeline holds anyway; the sampled peaks 126 → 112-130 MB earlier were inside noise). The budget stays because it is the plan's fix and R83's test proves it bounds what is offered, but it is not what brings `readHeld` under the object's line; the gate would catch a regression in the parse or the pipeline, not in the budget.

**Suites and checks.** `node --test --test-force-exit bio-plane/test/m/extraction/`: 247 tests, 247 pass. Users: control-plane `r117-held`, `t51-held-failed`, `r123-reading` 18/18; plane `fix4-*`, `fix3-r74`, `l75` 28/28 (before B18; B18 adds an optional flag). `impact.mjs` names 107 modules because `index.mjs` holds `DECLARED_OPS`. `checks/run.mjs`: format 0, architecture 0, coverage 6610 of 6610, channels 0, words 0 failures (no missingkey); ownership 0 failures; `setup-words build.mjs --check`: only the expected stale-rows note.

**Requirement lines I propose (BOB writes them).**
- R83 (fix round 5, E2; amends R82): `readHeld` offers the index the units it keeps: the units budget is the index's bound (R22: 2 MiB), not unlimited; `words_read` counts the units offered, so it falls below `words_total` for a text past the bound. Test: a 600-page text; control: a short text reads whole.
- R84 (E3; amends R80): a home whose capture, by its own document's sizes, is over reading-pipeline's whole ceiling (`WHOLE_READ_MAX`) is read with no whole held: the final statement is written and the answer is `read: true`; a capture at or under the ceiling still needs its whole. A transient reading of such a capture is replaced by the final one.
- R85 (E1; amends R80; new data only): a `final` reading that says the document was not read as text (either cause) is read once more when the first KiB of the held whole detects a format (or is UTF-8 without NUL under a declared text type), the detected format replacing the profile's for that read; a reading with text, or one still not read as text, is never written over it.
- R86 (B18; amends R80): `readHeld` and `op=readheld` take `defer=1`: after every gate (sight, NO_HOME, READING_HELD, NO_WHOLE_OBJECT) they answer `{ok: true, read: false, why: "READING_PENDING"}` and read nothing. R82's "offers every unit" is superseded by R83.

**Other modules.** control-plane's R123 unit tests that script `NO_WHOLE_OBJECT` for a case over the ceiling are theirs to correct. Nothing stale generated by me. Wording owed: none (no new member-read sentence).

Size (session_018SGhEZ3jJD7Da7xorwia8V): test runs 24, module lines 3551

## J18 · QUESTION

QUESTION (EXTRACTION #34, round 6; G13 and its seams). I carry on with G4, G6, G8 and G13's extraction half on my best reading below; I need your answer to 1 and 2 before G13 can go green.

1. **The cursor I code against (reading-pipeline #22's provider).** `reading-pipeline.read(document, {.., unitsBudget, cursor})`: no `cursor` is the first piece (today's read); the answer carries `more` (boolean), `cursor` (opaque string for the next call; refused with a reason, not a reading, when the held bytes no longer match it), `read_through` and `total` (same unit, bytes of text), and each unit's `seq` and extent are global to the capture (a later piece continues the numbering, so extents never repeat across pieces). A piece is what `unitsBudget` allows. Please confirm this shape to reading-pipeline, or give me the real one; I write segments, state and continuation now and wire to the real names when it merges (red by name until then).
2. **`op=reading` `text_units` is capped at 4,096 (R36, R76).** A 12 MB text read a line per unit has about 120,000 units, so "ENDMARKER is in `text_units`" cannot hold under that cap whatever I store. My reading of Bob's K4571 ("read whole, never silently partial"): the whole text is stored and searchable and citable (`capture_text`), `op=reading` states `more`, `read_through`, `total`, and its `text_units` stays the first 4,096 in seq order (stated as "the first N of M", never as the whole). If you want ENDMARKER literally in `text_units`, reading-pipeline's grain for a large text must be coarser (about 3 KB a unit for 12 MB) or R76's cap must page; that is your ruling.
3. **Seams I rely on, no edit asked of anyone:** G8's repair rows are owed through `captureOf(ctx).owedLater` (plane sets it, store.mjs:421), and G13's continuation is `readHeld` answering `owed: true`, which plane's pending.mjs header says it continues at once, one heavy row per tick.
4. **For control-plane's job (G4 changes what `acquireReadingOp` returns):** a failed or silent `extractread` after a kept acquire now returns `{body}` with `reading_pending: true` and `diag`, never `{response}` (502). control-plane's `readUploaded` (index.mjs:2625-2627) builds its answer from `read.body.document` only and would drop `reading_pending` and not owe the row for an upload: it must carry the flag and call `pendSha`. `op=acquire` is unaffected (its `pendReading` reads the flag off the answer).

## J19 · REPORT

REPORT · EXTRACTION #34 · fix round 6 (B22, B23-B25). All four entries and G14/G15 are built and pushed on job/T51/extraction; what waits is named below. Not COMPLETE: the provider (reading-pipeline R40) is unmerged, so two tests are red by name and the platform L numbers are not taken.

**Done (bio-plane/src/extraction/):** G4 ops.mjs acquireReadingOp: a read after a kept acquire that comes back as no answer returns the acquire answer with reading_pending:true and diag {name,message,status,correlation?} and one console.error (event extraction.acquire_read_unanswered), never 502; a store refusal is still relayed. G6 index.mjs readHeld: a part digest resolves to its whole (#wholeOfPart); a digest no stored document names is given the size ev.head states, else NO_DOCUMENT; op=reading of a part answers the whole's reading. G8: registerOwe + migrateRepairs + table reading_repairs + repairable on op=reading. G13: pieces (readHeld continues by the stored cursor, units appended per piece, state columns more/cursor/read_through/total/words_read, answers {more:true,detail} for the ledger), restart of any reading whose index is over its bound, start-up repair of old ones. B23: op=reading takes after, answers next; B25 units_total; B24 G14: completeness {state whole|partial|stated|none, counts, skipped, failure, why}, unreadOf counts skipped as unread, every format owed in pieces (a format the reader refuses with NOT_PIECEWISE ends as stated partial). G15: row-block units index block by block. reading declared in DECLARED_OPS (accepts sha256, after).

**Failing-first, red then green:** relays.test.mjs (R87) and round6.test.mjs (R88-R91) were run against the old code and failed there; green now. Extraction suite: 276 pass, 2 fail: round6-pieces.test.mjs "12,000,060 B text" and its 4,000-line control, red by name until reading-pipeline R40 merges. With R40's files overlaid in a scratch copy both pass (30 ticks, ENDMARKER indexed, whole, paged).

**Step 0 of G4 (cause still unknown):** not reproduced. In-process (real Store, render 400 ms vs 50 ms wait, extractread rejected once) and under workerd/Miniflare through the plane's own door (render 12 s past the 10 s wait, three presses): every press 200, extractread answered, no 502. The cause is only visible on the deploy: the log line and diag name it.

**Needs from others:**
1. PLANE: one line beside capture.owedLater (store.mjs:421): extractionOf(ctx).registerOwe((a) => pending.owedLater(a)). Without it G8's repair and the restart of partial texts owe nothing. (I told you in J18 the rows go through captureOf(ctx).owedLater; extraction cannot reach that instance safely, so it is a registration like R72's.)
2. READING-PIPELINE R40 to merge; its answer shape (pieces:{cursor,maxUnits} -> piece:{more,cursor,chars_through,chars_total,words}, refused:{code}) is what I built to. For G14 on other formats it needs pieces for DOCX/HTML/PDF text; until then those end as stated partial (NOT_PIECEWISE). The 6,000-paragraph DOCX, 300-page PDF and 24 MiB+ PDF cases of G14's seam need that provider and then run here as red by name.
3. After the merge I run the workerd probe (bio-plane/test/m/extraction/round6-l.probe.mjs) for 12 MiB and 24 MiB and record the numbers.
4. CONTROL-PLANE (told by you): readUploaded must carry reading_pending/diag and call pendSha.
5. The plane's seam tests that import the plane cannot live in extraction's tests (architecture); the two I wrote (G4 and G8 and G13 through the real Store, ledger and alarm) are in commit d5bd1f2edc..d319b550dc as round6-plane.test.mjs; they passed there and are available to whoever owns the plane seam.

**Contract changes to tests:** r80.test.mjs homes now store their provenance document; read.test.mjs and relays.test.mjs encode R87 (a silence after a kept acquire is deferred, not 502); the old rule "pages skipped over the bound are not unread" is replaced (G14).

**Checks:** node checks/run.mjs: format, architecture, coverage, channels, words all 0 failures; ownership 0. Users: 26 files that use readingFor/unitsOf/readHeld/acquireReadingOp outside extraction: 176 of 177 pass; the one (plane fix4-seam) failed on a home with no stored document and passes since the size rule; it is green now.

**Words:** no new sentence; diag.message falls back to the code STORE_REPLY_NOT_AN_ANSWER. Stand-in rows owed: none.

**Requirement lines I propose:** in my scratch file req-lines.md; summary: R87 (G4), R88 (G6), R89 (G8: registerOwe, migrateRepairs, reading_repairs, repairable), R90 (G13: pieces, per-piece bound amending R22, state partial while more amending R36), R91 (G14: completeness, units_total, skipped counted unread amending R27), R76 amended (after/next), R79 amended (reading declared). Full text follows.

- **R87** (fix round 6, G4; K4428; amends R1, R64) **A kept capture is never failed by the reading that follows it.** `acquireReadingOp`, handed the acquire answer of a capture that is kept, answers `{body}`, the acquire answer with `reading_pending: true` and `diag` `{name, message, status, correlation?}` (the failed call's error name and message, the reply's status, the store's own correlation id when it gave one; not drawn), and writes one `console.error` line `{event: "extraction.acquire_read_unanswered", sha, name, message, status}`, whenever the store's call comes back as no answer: the stub threw, the reply was no envelope, or it answered with no result. The store's own refusal (`ok: false` below 500) is still relayed with its status, code and sentence (R64). Test: `relays.test.mjs` (each silence, each helper the door hands; the correlation id; the control that an answer and a refusal are as before).
- **R88** (G6; amends R27, R80) **A part's digest is no document.** `readHeld({sha})` of a digest that a document of its home bundle's own provenance document names as one of its parts is `readHeld` of that document's digest (its reading is written for the whole; nothing is written under the part). A digest that no stored document of its home names answers `{ok: true, read: false, why: "NO_DOCUMENT"}` and writes nothing, so the reader is never handed a document that is a digest alone. `readingFor` (`op=reading`) of a part's digest that holds no reading, or a failed one, answers the whole's reading (its `capture_sha` the whole's), withheld as the whole's is. Test: `round6.test.mjs`; controls: a whole's own failed reading answers as itself, a bare digest is `NO_DOCUMENT`, a hidden bundle answers as an absent record.
- **R89** (G8; R-OLD, a repair; amends R85) **An old "not read as text" reading is owed with no press, and states it may be repaired.** The composition hands this module the ledger's registration once, `registerOwe(fn)` (as it hands capture its `owedLater`; a second is `LISTENER_DECLARED`). `migrateRepairs` (run at start on an object, and when the registration arrives) owes `fn({kind: "reading", sha})` once for each stored reading that says the document was not read as text and that no read has tried under this release; a ledger that refuses stops it where it was. `readHeld` of such a reading whose held bytes detect nothing writes `reading_repairs` (the digest, its bundle, the release, `undetected`), after which `readingFor` states no `repairable`; until then `readingFor` answers `repairable: true` for it, and answers no such key for any other reading. `reading_repairs` is a table of this module, keyed to its bundle (R49). Test: `round6.test.mjs`; controls: only that reading is owed; once; a later release tries again.
- **R90** (G13; K4571; amends R22, R36, R76, R82, R83) **A large text is read whole, in pieces, by the ledger, and is never stated complete while more follows.** `readHeld`'s read hands reading-pipeline `pieces: {cursor}` (its R40); the index state of a capture read in pieces (`capture_text_state`: `more`, `cursor`, `read_through`, `total`, `words_read`) holds how far it has been read. `readHeld` of a reading whose state has `more` reads the next piece from the stored cursor, adds its units to the capture's (the bound of R22, 2 MiB and 4,096 units, applying to each piece, never to the capture), moves the state to the cursor the piece answers, and answers `{ok: true, read: true, more: true, detail: {read_through, total}}` while more follows (the ledger goes on at once, plane R77), `{ok: true, read: true}` for the last piece, `{ok: true, read: false, final: true, why}` when the reader refuses the cursor (the entry ends, stated); with `defer=1` it reads nothing (`READING_PENDING`). A piece that lands after the state moved is not added. The reading itself is not rewritten by a piece: `readingFor` answers `more`, `read_through` and `total` for a text read in pieces (`more: false` at the end; absent for every other reading), and its `words_read` as the pieces have read it. The index state of a text read in pieces is `partial` while `more`. A text reading written without pieces (the acquire wire, a promotion) whose units the index holds only in part (`text_container` `text` or `html`) is marked to be read again from its start in pieces, and owed through `registerOwe` once the write commits; `migrateRepairs` owes the same for stored texts of that kind and for texts mid-way, once (R-OLD). A reading that is not a text, or a state it could not read in pieces, is stated as it is, once. Test: `round6.test.mjs` (a scripted provider: the pieces, the bound per piece, the over-bound piece named, the refused cursor, the race, `defer`, the old store's columns), `round6-pieces.test.mjs` (the 12,000,060 B text with the real reader; red by name until reading-pipeline R40 merges).
- **R76 amended** (K4577) `op=reading` answers at most 4,096 `text_units` and takes `after`, a unit's `seq`: it answers the units after it, and `next`, the `seq` to ask after the page, null at the end (absent with the units for a viewer refused the bundle). A malformed `after` asks from the start. `unitsOf(captureSha, {after})` answers the same page and `next` when more follows (R36).
- **R79 amended** `reading` is declared (`DECLARED_OPS`): admin, member, probe; a read; accepts `sha256`, `after`; requires `sha256`.
- **R91** (G14; K4578, K4579; amends R27, R36) op=reading states completeness {state: whole|partial|stated|none, counts, skipped, failure, why} and units_total (the units indexed so far), withheld with the bundle; whole only when nothing is over a bound, skipped or unaddressable and nothing more follows; stated for a reading refused whole (failure final, why); the pages a skipped run covers are unread (unread_pages). A reading of any format whose index is over its bound is read again in pieces through the ledger; a format the reader answers NOT_PIECEWISE ends as stated partial, once.

Size (session_01WXFSyuYPNQSifvTQ2HqNyW): test runs 40, module lines 3857

## J20 · COMPLETE

COMPLETE · EXTRACTION #34 · fix round 6 (B22; B23-B27). Pushed on job/T51/extraction at 50779b5ff9, tranche/T51 merged (reading-pipeline R39/R40/R41, plane registerOwe, capture, acquisition in).

**Conformed to the merged names (B27):** Extraction.read passes `cursor` (null, or the string a piece answered) and `maxUnits` (4,096); the piece's `more`, `cursor`, `read_through`, `total` are top-level and `piece.words` counts; a later piece is units alone; NOT_PIECEWISE / CURSOR_MISMATCH read from `refused`. index.mjs: pieceOf, #continueText, Extraction.read.

**What changed, as J19 (G4 ops.mjs acquireReadingOp; G6 readHeld/#wholeOfPart/readingFor; G8 registerOwe, migrateRepairs, reading_repairs, repairable; G13 pieces, state columns, restart; B23 op=reading after/next; B25 units_total; G14 completeness, skipped counted unread (#unreadOf), every format owed in pieces; G15 row-block units; `reading` declared).** Since J19: a home with no stored document is given the size ev.head states (else NO_DOCUMENT), per B23; the migration's no-document case likewise.

**Failing-first (red then green):** R87 relays.test.mjs, R88-R91 round6.test.mjs (run against the old code, red). With the merged provider: round6-pieces.test.mjs green: the 12,000,060 B text (31 ticks, ENDMARKER indexed, whole, words read = words total); the 4,000-line control complete in one tick; G14 seams: a 6,000-paragraph .docx read in pieces (tail found by search and by paging op=reading, units_total 6,000); a 300-page dense PDF (9 KB a page) read to the last page in pieces, each within the bound; a 41.5 MB capture over the ceiling states `completeness.state stated` with its size (round5 R84). round5's R83 test now follows R90 (first tick `more`, later ticks complete it).

**Platform L (round6-l.probe.mjs: real Durable Object SQLite and text index, R2, the merged reader, under Miniflare/workerd; the harness's own file-building spike let go before the ticks):** 12 MiB text: read to ENDMARKER in 31 ticks, wall per tick max 2.9 s (the first, the reading with its totals), mean 0.4 s. 24 MiB text (the ceiling): 62 ticks, max 4.9 s, mean 0.46 s. workerd's whole-process resident set (no heap cap; V8 does not collect without pressure, so an upper bound): idle 118 MB, with the file held 168 / 196 MB, peak over the ticks +194 / +263 MB over the held file. The isolate's own heap is not reported by process.memoryUsage in workerd. The binding measure is reading-pipeline's bisected one for the read of a piece (its J-record: first piece of 12 MiB completes from 39 MB old space, heap + bytes ~51 of 128); extraction adds at most 4,096 row inserts and their text-index entries per tick, and holds no more than one piece's units. A capped run of the whole tick (--max-old-space-size) is not possible through Miniflare; say if you want it taken with raw workerd.

**G4 step 0:** not reproduced, in-process and under workerd through the plane's own door (render 12 s past the 10 s wait, three presses: every press 200, extractread answered). The cause is the deploy's to name: `diag` and the log line `extraction.acquire_read_unanswered`.

**Suites and checks:** extraction directory 282 tests, 282 pass (c5b-memory included). node checks/run.mjs: format, architecture, coverage (6,632 of 6,632), channels, words 0 failures; ownership 0 failures. Users (26 files using readingFor/unitsOf/readHeld/acquireReadingOp): all passed on my branch before the merge but plane fix4-seam, which passes now. After the merge two of plane/control-plane's tests fail and are not mine to change: (1) plane/round6-extraction.test.mjs "R89 (G8) seam" calls `ex.registerOwe(...)` itself, but the plane now registers it at construction (store.mjs:427), so the second call is LISTENER_DECLARED and the repair had already run before the test's rows existed; it needs the old reading written before the Store is constructed (or to read the ledger after a restart over the same storage). (2) control-plane r117-held "R117 (acquire)" and "(through the door, the real plane)": 18-24 s runs, the plan §4 flaky-under-load one; it does not touch extraction (a stubbed door).

**Requirement lines:** as J19 (R87 G4, R88 G6, R89 G8, R90 G13 amending R22/R36/R82/R83, R91 G14, R76 amended after/next, R79 reading declared), unchanged except: R90 names the cursor as the string the reader answers (not an object), and states that R83 is superseded for every format: a first tick offers the index what it keeps and says `more`; the ledger's ticks read the rest.

**Words:** no new sentence; the diag fallback message is the code STORE_REPLY_NOT_AN_ANSWER. Rows owed: none.

**Others:** control-plane's readUploaded must carry reading_pending/diag and pendSha (told by you); screens-inquiry draws completeness/units_total/repairable/`after`+`next`.

Size (session_01WXFSyuYPNQSifvTQ2HqNyW): test runs 52, module lines 3854

## J21 · COMPLETE

COMPLETE · EXTRACTION #35 · fix round 6, wave 3 · G33 (B28). Branch job/T51/extraction at 3eee7e96a9 (+ this record), tranche/T51 merged.

**Cause (1), file:line.** `readHeld` of the digest the register named for a multipart capture (its lowest-sorting part, capture `REGISTER_FIRST`) found no document and wrote its stub against the part (the old press); nothing ever removed that row, and `#caseCitations` (case-authoring:1960-1963) unions `readings.capture_sha`, so the document counted two captures. R88/R89 (merged earlier) fix new data and owe old "not read" readings, but R89 only owes the part's own entry and leaves its row.

**Cause (2), why the tests missed it.** round6.test.mjs:73-78 seeded the old part-keyed reading only as an answer of `readingFor`, never as a stored row a start-up repair must act on. Gap fixed: g33.test.mjs makes the old state with the real writer (`writeReading` against a part digest, as the old press did), in 0115's shape (register names the five parts, not the whole; 41,502,904 B, over the ceiling, whole not held), and runs the repair and the tick.

**What changed.** `bio-plane/src/extraction/index.mjs`: `PART_MIGRATION` ("g33-part-readings", its own `reading_migrations` row, so a store whose R89 repair finished is still scanned) and `PART_KEPT_IN`; `migratePartReadings()` (after `migrateRepairs`); it is drained by `startMigrations` and by the run `registerOwe` starts. Per `found = 0` reading in digest order: when the reading's bundle holds no document of that digest and a document of the bundle names it as a part (`#storedDocument`, `#wholeOfPart`), the whole is owed to the ledger first (unless it holds a reading, or was owed in this batch), then every row kept against the part is deleted in one transaction. No ledger registered: nothing deleted, undone. A refusing ledger: stops, part kept, next run owes again. The tick is the existing `readHeld(whole)`: over the ceiling it writes the final statement with the size (R84).

**Failing-first.** g33.test.mjs, first run red (the old state persisted; `migratePartReadings` absent), then green: 5 tests: the 5-part/part-4 case (after repair and tick: `readings` holds the whole only, with "41502904" and "5 parts" in its basis; every table empty for the part; `readingFor(part)` answers the whole), whole already read (nothing owed; two parts owe once), controls (a whole's own failed reading, a reading with text under a part digest, a part digest that is also a document of its bundle, another bundle's, a lone digest: all stand), done once / refusing ledger / no ledger, and the object path (handing the ledger in starts it; R89's row done does not skip it).
The case-authoring half ("the document reads `only_capture`") is that module's reading of `readings.capture_sha`; my test asserts its input: the document's one capture holds the one reading.

**Platform (4).** N. P (read-only probe of 0115's provenance) not taken: this session has no probe of the live copy; the repair reads the same stored provenance document shape R81/R88 read (`documents[].parts`), so the first walk after deploy checks it: `readings` rows for 0115's bundle = the whole only.

**Suites and checks.** extraction directory 287 tests, 287 pass; plane fix6-pending + round6-extraction 13 pass (the only users naming migrations/registerOwe). `node checks/run.mjs`: format, architecture, coverage (6,656 of 6,656), channels, words 0 failures (words count unchanged: no sentence added); ownership 0 failures. The impact list names 107 modules through shared tables; I ran the users of what I changed.

**Words.** No new sentence. Rows owed: none.

**Requirement line proposed (BOB writes it; the id R92 is named in my tests):**
- **R92** (fix round 6, G33; K4598; R-OLD, a repair; amends R88, R89) **A reading stored against a part's digest is superseded by the whole's.** `migratePartReadings` (run at start on an object, and when `registerOwe`'s ledger arrives, beside R89's repair, in its own `reading_migrations` row `g33-part-readings` so a store whose R89 repair finished is scanned) takes each failed reading (`found` false) in digest order whose bundle holds no document of that digest and has a document naming it as a part; it owes the whole to the ledger as a `reading` entry (not when the whole holds a reading), then deletes every row this module keeps against the part (`readings`, `reading_history`, `reading_refs`, `reading_ref_terms`, `reading_text_source`, `capture_text`, `capture_text_skipped`, `capture_text_state`, `reading_repairs`); the tick writes the whole's statement (R84, sized). A reading with text, a digest that is also a document of its bundle, and one its bundle does not name as a part are left. With no ledger handed in it deletes nothing and stays undone; a refusing ledger stops it with the part's reading kept. Test: `g33.test.mjs`; controls as listed there.

Size (session_01FmqneErcygihRzzyTS4emY): test runs 8, module lines 3900

## J22 · QUESTION

The paging probe for G38 (my tests may not import plane's harness): please add to `bio-plane/test/m/plane/shape/harness.mjs`, after the `reading` event, a loop that asks `extractionOf(ctx).readingFor(sha, "class:admin", {after: got.next})` until `next` is null, emitting the pages, the units seen and the largest answer's bytes; pass = 1,328 units for BUDGET-2024-APP, every page under 2 MB, the child alive at cap 112. I ran exactly this in an uncommitted copy of the harness: 14 pages, 1,328 units, largest answer 1,121,430 B, child alive at 112 (numbers in my COMPLETE). Best reading: nothing else is needed from you for COMPLETE; I post it next.

## J23 · COMPLETE

T51 fix round 6, wave 6, G38 (EXTRACTION #36, B29). Commit `extraction G38` on `job/T51/extraction` (after the merge of `tranche/T51`).

**Cause (1), file:line.** Three things made `op=reading` too big or too hungry; I measured each.
- (a) `unitsOf` (`extraction/index.mjs`, was :1455-1467) took up to 4,096 units whatever their bytes; BUDGET-2024-APP's 1,328 units are 13.99 MB. Fix: `unitsOf(sha, {after, maxBytes})` reads the units' sizes first (`length(CAST(text AS BLOB))`, 4,097 small rows), keeps units while the page's text stays within `maxBytes` (a first unit over it alone), and loads only the kept units' text; `readingFor` passes `READING_PAGE_BYTES` = 1,048,576 (`index.mjs:51`). `next` is as before. Other in-process callers of `unitsOf` (content, case-carriage, case-disclosures, run-productions) pass no `maxBytes` and are unchanged.
- (b) The CSV's 12,872,074 B answer, measured by part (scratch, deleted): `reading` 11,820,513 B, of which `reading.cells` 11,818,625 B (R70: one object per cell, 18,098 rows x 4); `text_units` 1,049,849 B; every other part under 1 KB. So the stored `reading` returned whole was the cause, as BOB guessed; the units were 8%. Fix: `#readingBounded` (`index.mjs:1469`): SQL's `json_each` names each top-level key of the stored reading over `READING_KEY_BYTES` = 262,144, `json_remove` takes them out in SQL (the 11.8 MB never enters the object), and `readingFor` answers `reading_omitted: [{key, bytes}]` beside `reading`. A reading with every key within the bound is answered as before, with no `reading_omitted`. `readingOf` (R30, retrieval's `cells`, R70) is untouched: the cells are still answered whole to a reader that needs them. No screen reads `reading.cells` from `op=reading` (grep over the screens: open-file and find-in draw their own).
- (c) Found by the probe, not in the plan: after (a) the child still died asking `op=reading` at the real cap 112 (it survived 124 and 136). `#unreadOf` (`index.mjs:1379`) loaded `SELECT extent, text ... extent_kind='pdf-page'` whole, the capture's 14 MB of page text, to count glyphs, on every page of the answer. Fix: it reads them 32 units at a time by `seq`.

**Cause (2), why the tests missed it.** Every `op=reading` test used a small reading and one page; the E3 harness had asked only the first page. Gap fixed: g38.test.mjs builds the 1 MB CSV through the real reader (`readHeld`, as the ledger ticks) and asks `op=reading` through `extractionOps(...).reading()` to its last page; the unit-page tests use 2 MB of units.

**Failing-first (3), run alone.** `g38.test.mjs` (5 tests), on the code before the change (constants inlined so the file loads): 4 red, 1 control green. The red lines: "page 1 holds 2000000 B of unit text"; "a unit over the bound is alone on its page"; "the bulky key is not carried"; "the answer is 12872066 B" (the CSV). On the changed code: 5 of 5 green.
Probe numbers (E3, `g26.probe.mjs` and `g15.probe.mjs` run alone, unedited):
- `g15.probe.mjs 136 0`: `op=reading` answer 8 units, **1,053,493 B** (was 12,872,074 B), 97 ms, peak 91.6 MB (was 130 MB). Under 2 MB. (Cap 127 still dies in the READ tick, before `op=reading`: reading-pipeline and csv-reader memory, diagnosis-R6-shape.md d; not this entry.)
- `g26.probe.mjs 136 124` (first page only, as the probe asks): cap 136: 105 units, 1,118,848 B, next 113; cap 124: the same, peak 123.3 MB; both survive (died today).
- Paged to the end, at the real cap 112, child alive: the probe asks one page only, so I ran a scratch copy of the harness (not committed, deleted) that asks `readingFor` again with `after = next` until `next` is null: **14 pages, 1,328 units, largest answer 1,121,430 B, ~350 ms a page, child survived**, with and without a collection before the first page (heap after the last page 98.9 and 102.7 MB of 112). Before change (c) the same run died on the first page. Steps for the probe BOB adds (QUESTION J22): in `harness.mjs` after the `reading` event, loop `readingFor(sha, "class:admin", {after: got.next})` until `next` is null, emit pages, units seen and the largest answer; pass: units = 1,328, every page under 2 MB, the child alive.

**Platform (4).** L by the probes above (node child at the cap; raw workerd not run). P none.

**Suites and checks.** extraction directory 292 tests, 292 pass (was 287; +5). Users run: content 142, case-carriage 92, case-disclosures 109, run-productions 65, screens-inquiry 509 (all pass); reading-pipeline 211 of 212: `pdf-pieces.test.mjs` "pieces took 32926 ms, over 1.5 parses of the whole (21336 ms)", a timing assertion that failed while two other suites ran at once; it passed alone earlier this session (53 s); not extraction's. The impact list names 107 modules through shared tables; I ran the modules that call my changed services. `checks/run.mjs`: format 0 failures, architecture 0, coverage 6,668 of 6,668, channels 0, words 0 failures (no sentence added, so the count does not rise); ownership 0 failures (3 files).

**Words.** No new sentence. Rows owed: none. `reading_omitted` is data; the Document screen (SCREENS-INQUIRY) may say "this reading's table cells are too many to show here" when it draws it, a row for the design stream if it wants one.

**Requirement lines proposed (BOB writes them):**
- **R93** (fix round 6, G38; K4615; amends R27, R36, R76) **`op=reading`'s page of units is bounded by bytes as well as by units.** `unitsOf(captureSha, {after, maxBytes})` answers units in `seq` order after `after`, at most 4,096, and, when `maxBytes` is a positive integer, ending where the next unit's text would take the page's UTF-8 text past `maxBytes`; a first unit over it is alone on its page; `next` is the last unit's `seq` when more follows, as R76. Without `maxBytes` the page is as R36 states it. `readingFor` passes 1,048,576 (about 1 MiB of unit text). Units a page leaves out are not loaded. Test: `g38.test.mjs`.
- **R94** (fix round 6, G38; K4615; amends R27; R70 holds for `readingOf`) **A bulky part of the stored reading is named, never carried.** A top-level key of the stored reading whose JSON is over 262,144 B is left out of `readingFor`'s `reading` and named in `reading_omitted`, `[{key, bytes}]`, absent when none is; every other key is as stored; `readingOf` (R30) answers the stored reading whole. `unread_pages` (R27) is computed without holding the capture's page text whole. Test: `g38.test.mjs`.

Size (session_01HrxtmpnnxSr8WgbmGib4AF): test runs 16, module lines 3954
