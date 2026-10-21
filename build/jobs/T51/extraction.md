# extraction (T51)

**Status** · session_01ALmoG5zY9hNNTsdddSrGb9 · depth 2 · COMPLETE · handled B6

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
