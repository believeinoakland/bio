# case-authoring (T51)

**Status** · session_019Tn27tqyLrYtV6fEW46e5z · depth 2 · WAITING ON BOB (J4) · handled B5

## Completion record (T51, B1 START)

**Entries applied.** R61's tests (`bio-plane/test/m/case-authoring/standards.test.mjs`, the two R61 tests named at :96 and :140 and the one at :140's neighbour) expected the refusals as `case-checker` R21 names them, without `says`. `case-checker` R26 now gives each departure `says: {key, vars}` (`refusal.<code>`, the departure's own fields). Test-only change: a helper `saidOf` asserts each `says` (key, and vars equal to the departure's fields), removes it, and compares the identifiers as before. The module's source relays `standardsUse.refusals` verbatim (`index.mjs` 1189), so `says` reaches the record and the pre-flight unchanged; no source change was needed for the reds.

**Deferred, and why.** None of the job's own code was changed.

**Found, not changed (for BOB).** `standardsUseWords` (`bio-plane/src/case-authoring/index.mjs` 197–207) draws R61's sentence as inline English keyed by code, beside `says`. R26 intends the ceremony to draw each gate from `word(says.key, says.vars)`. This module is layer 8 and `setup-words` is layer 11, so the words cannot be read here (P4); the test cannot import `setup-words` either (architecture check, undeclared use). The clean path is for the layer-11 screen that draws the pre-flight to read `says`. The sentence's naming of the finding and standard then needs word rows with placeholders, which are the UX stream's to write. Decision for BOB: keep the inline sentence until the screen lands (my recommendation), or ring the UX stream now.

**Found in other modules (not mine, reported).** `checks/run.mjs` shows 23 coverage failures in other modules (for example `installer`, `interface-shell`, `screens-inquiry`, `queue`); none is case-authoring. Architecture across all 3,575 product files: 0 failures.

**Tests and checks.**
- `node --test` over all 30 files of `bio-plane/test/m/case-authoring/`: 190 of 190 pass (after the R61 edit).
- `standards.test.mjs`: 7 of 7 pass; the two previously red R61 tests now pass.
- `node checks/format.mjs /home/user/bio`: 174 modules, 0 failures.
- `node checks/architecture.mjs /home/user/bio case-authoring`: 0 failures.
- `node checks/coverage.mjs /home/user/bio case-authoring`: 48 of 48 live ids named by a test; 0 failures.
- `node checks/ownership.mjs` (run before COMPLETE on the final commit): see the COMPLETE body.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; coverage 23 failures, all in modules other than case-authoring.

**Size (session_01G31x27GuFV84fTJFmbxZNa): test runs 7, module lines 3010** (`bio-plane/src/case-authoring/*.mjs`, all lines; this job changed no source).

## J1 · COMPLETE

R61 tests now read case-checker R26's says shape (test-only; the source relays refusals unchanged). 190 of 190 module tests pass. Format, architecture, coverage and ownership pass for case-authoring (ownership: 2 files, the record and the test). Concern for you, in the record: standardsUseWords (bio-plane/src/case-authoring/index.mjs 197-207) is inline English beside says; the words belong to the layer-11 screen, since setup-words is layer 11. Your decision. run.mjs shows 23 coverage failures in other modules, none case-authoring. Full record: build/jobs/T51/case-authoring.md on job/T51/case-authoring, commit 22472313f0.

## Completion record for B2 (CHANGE, K3912)

**Entries applied.** `standardsUseWords` (`bio-plane/src/case-authoring/index.mjs`) no longer holds English. Each sentence is `word(key, vars)` from setup-words, the `case-authoring.text.*` rows that already exist in `rows.mjs`: `case_would_carry` ({sha}, {standard}), `case_quotes_passage` ({content}, {standard}), `rests_benchmarks_binds` ({finding}, {standard}, {word}), `case_use_standards` ({arguments}, the default arm). Each key's placeholders match what the code passes, so nothing needed reporting. `setup-words` is in this module's `uses` (BOB's edge in `build/modules.json`, read after the merge of `tranche/T51`). The `standards.test.mjs` helper `saidOf` now also asserts that each `says.key` is held (`hasWord`) and that `word(says.key, says.vars)` is non-empty; it never copies a sentence.

**Deferred.** None.

**Found in other modules.** The same 23 coverage failures under `checks/run.mjs` as before, none in case-authoring.

**Tests and checks.**
- All 30 files of `bio-plane/test/m/case-authoring/`: 190 of 190 pass.
- `format`: 0 failures. `architecture` (case-authoring): 0 failures; across all product files 0 failures. `coverage` (case-authoring): 48 of 48. `ownership`: 0 failures. `channels`: 0 failures.

**Size (session_01G31x27GuFV84fTJFmbxZNa): test runs 3, module lines 3010**, `bio-plane/src/case-authoring/*.mjs` (all lines).

## J2 · COMPLETE

CHANGE B2 done. Inline English in standardsUseWords replaced by setup-words word(key, vars) over the four case-authoring.text.* keys; their placeholders match what the code passes. The standards test also checks each says key is held and reads non-empty. Module tests 190/190; format, architecture, coverage and ownership pass (ownership: 3 files). run.mjs shows the same 23 coverage failures in other modules. Record: build/jobs/T51/case-authoring.md, branch job/T51/case-authoring, pushed.

## Completion record for B3 (CHANGE, after case-grammar's bio-case-document/8)

**Entries applied.** B2 (above) and B3. case-grammar now authors `bio-case-document/8`. `document.mjs` passes the document's own format where it spells attribution and lens lines: `attributionBodyLines(attributions, CASE_DOCUMENT_FORMAT)` and `lensSectionLines({ ..., format: CASE_DOCUMENT_FORMAT })`. Its R14 comment now names `/8`.

**Tests.** BOB's note said five tests; the run found three test titles failing (carries.test.mjs R14/R55, document.test.mjs R14, tensions.test.mjs R14), each with its `/7` expectation. Each now expects `bio-case-document/8`, and `op=publish writes /8, never /6`. No test copies a sentence.

**Deferred.** None.

**Found in other modules.** None new. `checks/run.mjs` still shows the 23 coverage failures in other modules.

**Tests and checks.**
- All 30 files of `bio-plane/test/m/case-authoring/`: 190 of 190 pass.
- `format`: 0 failures. `architecture` (case-authoring): 0 failures. `coverage` (case-authoring): 48 of 48 live ids named.

**Size (session_01G31x27GuFV84fTJFmbxZNa): test runs 5, module lines 3010**, `bio-plane/src/case-authoring/*.mjs` (all lines).

## J3 · COMPLETE

COMPLETE for B2 and B3. B2: standardsUseWords reads setup-words keys (case-authoring.text.*), no inline English. B3: document and lens/attribution spelled in bio-case-document/8; three R14 tests moved to /8 (BOB's note said five; three titles were failing). Module tests 190/190. format, architecture, coverage and ownership pass for case-authoring (ownership: 7 files, the module, its tests and the record). run.mjs: the same 23 coverage failures in other modules, none case-authoring. Record: build/jobs/T51/case-authoring.md, branch job/T51/case-authoring, pushed.

## J4 · REPORT

REPORT (T51-161, words part done and pushed on job/T51/case-authoring, commit fe21d4aef6; R77 waits for case-inputs' merge).

Done: every finding of build/plan/words-pass/case-authoring.md (the 57, the 13 plain, the 4 code copies) is fixed. node checks/words.mjs shows no finding in case-authoring. Bytes of signed text are unchanged: each localize's en is the old sentence character for character. Module tests 190 of 190. Beyond the check's count I also read through localize the sentences it does not count (refusal details, the sign steps' stated/next/says, the document's Session Log and strength rows, the searched section's detail, the details NOT_CONCLUDED stitched). Ids are case-authoring.<checks|document|index|searched>.<slug>, fixed once. Test copies now compare with word/localize by equality (case-disclosures' and case-grammar's sentences by their own ids; the fixture stub's "a new case" is now an opaque token).

Judged not sentences a member reads, kept as they are (settle them with the design stream, K3944):
1. The sign-step names `photos`, `the account`, `approvals`, `sign` in publishPreflight's steps: tests and screens find a step by its name (code compares them), so identifiers (K3971).
2. The case document's section headings and front-matter keys (`## Scope`, `## Findings In This Case`, `## What Was Searched`, `## Session Log`, `### What they did`, `### What we did` and the rest): the signed grammar other modules locate by exact text (case-inputs' acknowledgement splice, publication's block readers); a signed text changes only as a new version (K1333).
3. Values passed into word rows or written as row values: `(unpinned)`, `(unnamed)`, the role terms LOAD-BEARING / supporting in the findings list, and the `undetermined` / `nowhere` words of a timeline row's `when` (events' own vocabulary).
4. The Symbol description of the pre-flight rollback and the one-word `statement` label: developer-only.

Two details for the design: NO_WHAT_CHANGED and NO_SUCH_WHAT_CHANGED_DRAFT name the argument `(whatChanged: {text})` in braces, so their localize passes `text: "{text}"` as its own fill to keep the braces literal; reword if the design prefers. And a generated artifact is now stale: bio-plane/dist/bio-plane.bundled.mjs (and its manifest) holds this module's source (manifest §14); regenerate at the layer close.

Waiting: R77 (the sign step's minutes) needs case-inputs' minutesComparisonsOn and minutesLine, which are not on tranche/T51 yet. I read the B5 CHANGE: rows carry minutesLine unchanged; an unreadable source answers `minutes: {undetermined: true}` only. Tell me when case-inputs has merged; I then merge tranche/T51, write R77 with its tests, run the checks and COMPLETE.

## Completion record for B4 (START), B5 and B6 (T51-161)

**Entries applied.** (W) The 57 findings, the 13 plain and the 4 code copies of `build/plan/words-pass/case-authoring.md`: each sentence is read through `localize('case-authoring.<checks|document|index|searched>.<slug>', en, vars)` with its old text character for character (the signed document's bytes unchanged); I also converted the member-read sentences the check does not count (refusal details, the sign steps' `stated`/`next`/`says`, the Session Log, strength rows, searched detail, NOT_CONCLUDED's stitched pieces). Test copies compare with `word`/`localize` by equality; the fixture stub's "a new case" is an opaque token. (R77) The sign step answers `minutes`: `case-inputs.minutesComparisonsOn` over the same case and pins as the open requests, each row with `minutesLine` unchanged; an unreadable source, or the case not yet known, answers `{undetermined: true}`, never `[]`; no sentence of its own (B5). New `minutes.test.mjs` (R77, with the control that `ready`, `first`, `blockers` are unchanged). The K3958 civil-time reds do not touch this module (none was red).

**Deferred.** None. Judged not member-read, kept (REPORT J4): the sign step names, the document's headings and front-matter keys, value placeholders, the rollback Symbol.

**Found in other modules.** None new; stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` holds this module's source (manifest §14).

**Tests and checks.** `bio-plane/test/m/case-authoring/`: 192 of 192; `review` and `case-check` (users): 95 of 95. `checks/words.mjs`: no finding in case-authoring. format 0 failures; architecture 0 failures; coverage 49 of 49; channels 0. `setup-words/build.mjs --check`: only the expected stale-rows note.

**Size (session_019Tn27tqyLrYtV6fEW46e5z): test runs 8, module lines 2796** (`bio-plane/src/case-authoring/*.mjs`).
