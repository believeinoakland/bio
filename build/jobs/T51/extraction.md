# extraction (T51)

**Status** · session_019RcTbWsRRhrZ7k5jcyP7gC · depth 2 · WORKING · handled B14

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
