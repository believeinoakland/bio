# case-authoring (T51)

**Status** · session_01SzRDd1oqEEzNixuCz5nhog · depth 2 · COMPLETE · handled B9

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

## J5 · COMPLETE

COMPLETE (T51-161). Words findings fixed (zero in case-authoring), R77 sign-step minutes added with minutes.test.mjs after merging tranche/T51 (case-inputs R19). Module tests 192/192, review+case-check 95/95; format, architecture, coverage 49/49, ownership 0 failures. Record: build/jobs/T51/case-authoring.md, branch job/T51/case-authoring, pushed.

## Completion record for B7 (START, the fix round: C1, C5, C6, K4168, L16, K4202), B8 and B9 (CHANGE)

**Requirement lines.** Written by me in `build/requirements/case-authoring.md` (B8, B9), each marked *(not yet met: T51)*: **R78** (C1), **R79** (C5, C6), **R80** (L16), **R81** (the `DECLARED_OPS` line, which entries 3 and 5 share: the three ops are declared once). R3's first refusal now reads `PUBLISH_NO_FINDING` (was `NO_TARGET` until T51: R80). R78 adds one rule to the entry's text: `targets` and `target` are one field, and `caseId` and `newCase` are one, so a call that sends either of a pair keeps the draft's other out (a call's `target` and a draft's `targets` would otherwise both be read and the call's lost).

**Entries applied.**
1. **C1 (R78).** `#withDraft` (index.mjs) takes, for each of the new export `DRAFT_FIELDS` that the draft's `params` hold and the call does not send, the draft's value, when `draft` names a draft the review provider shows the viewer and that belongs to `project`; otherwise the call is left as sent and R9 refuses as before. It is applied in `publishCase`, `publishPreflight`, `tensionsToDisclose` and `calculationsAtPublication` (so the gather of R56 runs over the draft's targets). It writes nothing. `DRAFT_FIELDS` = `AUTHORED_FIELDS` and `ACT_FIELDS` less `viewer`, `author`, `project`, `draft` and `tieAttested`. The ops' `newCase` is now absent (not `false`) when neither query nor body sends it, so a draft's own `newCase` is not overruled by a default.
2. **C5, C6 (R79).** The check found the pre-flight and the publication already judge `tensionsDisclosed` and `selfAttested` through the same `case-disclosures` functions (`tensionsJudged`, `selfAttestedJudged`), so they cannot differ, and an entry without a `reason` is `SELF_ATTESTED_NO_REASON` naming the capture and its place in both. The defect was the draft: the lists the ceremony keeps in a draft were never read (R78). The tests hold both (same refusals, `pre.first` equal to the act's answer; control with a reason).
3. **K4168, K4202 (R81).** `DECLARED_OPS` beside `caseAuthoringOps` for `publish`, `publishpreflight` and `publishtensions`. Classes and `mutating` are the hand rows'; `weight` and `description`: `publish` `terminal` and `act.publish.does`; the two reads `read` and their `NON_ACTS` reasons copied (`localize` ids `case-authoring.declared.*`). `accepts` is built from `AUTHORED_FIELDS` and `ACT_FIELDS` (less the stamps), the same for all three; `requires`: `publish` the project, each of `targets`/`target`/`draft`, `roles`, `statement`, `subjectPosition`, `subjectJustification`, `excluded`, `scope`, `biasAcknowledgement` (each or `draft`) and `tieAttested`; `publishpreflight` the same but `tieAttested` (it reports the confirmation as `first` and never refuses for it); `publishtensions` the project alone. `registerDeclaredOps` of `op-declarations` and of `op-grades` accepts all three (checked: no disagreement; `op-grades` reports them as agreed).
4. **L16 (R80).** The refusal for a case naming no finding is `PUBLISH_NO_FINDING` (`reason` and `code`, the same detail); `refusal.PUBLISH_NO_FINDING` exists in the word list (`hasWord` in the test). I kept the name BOB gave. `refusal.NO_TARGET` is untouched.

**Decided, not asked (P17).** `publishtensions` declares only `project` as required: for no finding it answers `ok` with an empty list (R32), so declaring the finding required would state a refusal it does not make. If BOB wants the read to refuse for no finding, that is a requirement change to R32.

**Deferred.** None.

**Found in other modules (reported in the REPORT).**
- `screens-publish` (`src/screens-publish/ceremony.mjs` 100 and 105) tells the case with no finding by `NO_TARGET`; the plane now answers `PUBLISH_NO_FINDING` (its entry 24, the "Add a finding" door, L16).
- `review` (`REVIEW_DRAFT_FIELDS`, index.mjs 88) keeps its own list of what a draft keeps; its entry C3 reads `DRAFT_FIELDS` from here. `#gates` could pass `draft` instead of the draft's parameters.
- Hand rows that can go once the owner declares them whole: `op-declarations` `OPS` rows `publish`, `publishtensions`, `publishpreflight` (the `NEEDS` row of `publish` and its stamps must then be declared too: add `needs: "publish"` and `stamps: ["viewer","author"]` to the declaration if BOB wants the rows removed); `op-grades` `RUNGS.publish` and the `NON_ACTS` reasons of the two reads (these agree now).
- Reds unchanged by this job, in other modules and already there before it (same counts with my change stashed): `review` 5, `screens-publish` 10, `interface-shell` 18, `op-declarations` 1 (R73), `op-grades` 2 (R42, R46); `checks/run.mjs` coverage 7 modules and words `testcopy` 7 (op-grades), none in case-authoring.

**Tests and checks.**
- New tests, written first and seen failing (R78 with the merge off, R80 with the old code: 7 of 9 red): `bio-plane/test/m/case-authoring/fixround.test.mjs` (R78 x6, R79 x2, R80), `declared-ops.test.mjs` (R81 x4, through `declaredOpHolds`; a mutated `requires` is caught). `fences.test.mjs` R3 now reads `PUBLISH_NO_FINDING`.
- `node --test bio-plane/test/m/case-authoring/`: 205 of 205 pass.
- `node checks/format.mjs /home/user/bio`: 175 modules, 0 failures. `node checks/architecture.mjs /home/user/bio case-authoring`: 0 failures. `node checks/coverage.mjs /home/user/bio case-authoring`: 53 of 53 live ids named by a test, 0 failures. `node checks/run.mjs /home/user/bio`: architecture 0, channels 0, words 0 findings for case-authoring files, coverage and words failures only in other modules. `node checks/ownership.mjs /home/user/bio case-authoring tranche/T51 job/T51/case-authoring`: run again on the final commit (see the COMPLETE body).

**Size (session_01UiW51kYAYDBQ6nmNeZEATc): test runs 14, module lines 2854** (`bio-plane/src/case-authoring/*.mjs`, all lines).

## J6 · REPORT

REPORT (FR-18; findings in other modules, none blocks this job).
1. screens-publish, src/screens-publish/ceremony.mjs lines 100 and 105: the ceremony tells the case with no finding by the code NO_TARGET. The plane now answers PUBLISH_NO_FINDING (case-authoring R80, DEC-384), so the screen's "Add a finding" gate (its entry 24, L16) must read that code and the word refusal.PUBLISH_NO_FINDING.
2. review, REVIEW_DRAFT_FIELDS (src/review/index.mjs:88) is its own list of what a draft keeps; its entry C3 should read case-authoring's exported DRAFT_FIELDS. Its #gates may pass `draft` to publishCase instead of the draft's parameters (R78 reads them).
3. Hand rows that can go once an owner declares them: op-declarations OPS rows publish, publishtensions, publishpreflight (for publish also its NEEDS row and stamps: add `needs: "publish"` and `stamps: ["viewer","author"]` to my declaration if you want the rows removed); op-grades RUNGS.publish and the NON_ACTS reasons of the two reads. All three agree with my declaration now (registerDeclaredOps of both modules accepts them).
4. Reds that were already there and are unchanged (same counts with my change stashed): review 5, screens-publish 10, interface-shell 18, op-declarations 1 (R73), op-grades 2 (R42, R46); checks/run.mjs coverage fails in 7 other modules and words testcopy in op-grades t36/t47/t48.

## J7 · COMPLETE

COMPLETE (FR-18, B7 with B8 and B9). C1: a draft named by `draft` supplies every authored field the call did not send (R78, DRAFT_FIELDS exported for review). C5/C6: the pre-flight and the publication judge the ceremony's lists through the same case-disclosures calls; the real defect was the unread draft (R79, tests hold both). K4168/K4202: DECLARED_OPS for publish, publishpreflight and publishtensions (R81; both registerDeclaredOps accept them). L16: PUBLISH_NO_FINDING with its own word (R80). Requirement lines R78-R81 are written in build/requirements/case-authoring.md (marked not yet met: T51); the ownership check lists that one file, accepted at the merge per B8/B9. Module tests 205/205; format 0, architecture 0, coverage 53/53, words 0 for my files. Decision for the record: publishtensions requires only the project (it answers an empty list for no finding). Record: build/jobs/T51/case-authoring.md, commit 8af3914b6b on job/T51/case-authoring. Size (session_01UiW51kYAYDBQ6nmNeZEATc): test runs 14, module lines 2854.

## Completion record for B10 (CHANGE, K4240)

**Entries applied.** `publishpreflight`'s step three, `not_co_attested`, now lists each capture the case rests on that is not co-attested as `{capture, by, findings}`, built by the private `#notCoAttested` from the case's own capture rows (one row per finding and capture, `disclosureBlocks`). `capture` keeps the id, so a reader that maps `.capture` keeps working. A capture no finding of the case rests on is not listed (it never enters the rows). Only the pre-flight changes; `publish` and its document are unchanged.

**Decided, not asked (P17).**
- `by` is the member `capture` records as capturing the bytes (its R69, `captureAccountsOf(...).actors`): the first member actor by time, with the `member:` tag dropped, the same spelling the capture module gives its own first actor (`memberIdOf`). A machine actor is not a member; with no member actor `by` is `null`. Where two members captured one capture, `by` is the earlier one; the other is not listed. (Rare in the record; BOB may prefer a list, which would change the shape the screen reads.)
- `findings` are the finding ids (each finding's `target`, its bundle id) that rest on the capture in this case, in the case's member order, each once.
- The `capture` module is read through a new lazy getter `capture` (`captureOf(host)`, the same instance case-disclosures reads), which is an edge already in this module's `uses` (`modules.json`); no new edge.
- No requirement in `build/requirements/case-authoring.md` describes this list's shape (R34's step three names the exclusions, searched section, bias, tensions, self-attested documents and sources, not co-attestation). I did not write the line into the file, as B10 asks for it in this COMPLETE.

**Requirement line for BOB** (next free id; proposed R82, amends R34; marked not yet met until BOB writes it in):
> **R82** (T51; K4240; amends R34) The pre-flight's step three, `not_co_attested`, lists each capture the case rests on that is not co-attested, as `{capture, by, findings}`: `by` is the member the capture module records as capturing it (its R69, the first member actor by time, `member:` dropped), `null` when none, and `findings` the findings resting on it in this case, each once. A capture no finding rests on is not listed. Test: a pre-flight over a case resting on a non-co-attested capture answers that entry with its capturer and both findings; control: a capture no finding rests on is not listed, and a case over one finding names only that finding.

**Readers.** I searched the repository for the key `not_co_attested`: its only reader outside this module is none. The literal occurs in `bio-plane/src/case-authoring/index.mjs` alone (the other hits are the generated bundles under `release/` and `bio-plane/dist/`, and the word tables). BOB's note says screens-publish reads the list; if it reads it by a path other than that literal, screens-publish's J9 should confirm it reads `{capture, by, findings}` and not the old string list. I did not change any screen (not this module's).

**Deferred.** None.

**Found in other modules (not mine, not changed).** `checks/run.mjs` on this tranche shows, for other modules only: coverage in `agent-harness` (R17), `agent-runner` (R37, R38, R40), `installer-steps` (R26, R31) and `journey-check` (R19); words `missingkey` in `screens-intake` (its `t51-about-knocker` and `t51-watching` tests); `testcopy` in `op-grades`; `inline strength` in `bio-plane/src/strength/method.mjs:349`. None names case-authoring.

**Tests and checks.**
- New: `bio-plane/test/m/case-authoring/co-attested-list.test.mjs`, three tests, seen failing before the change (the old string list), then passing: the entry with its capturer and both findings, and a co-attested capture not listed; the control (a capture no finding rests on is not listed; a case over Q2 alone names Q2 only); `by: null` with no member actor, and with a machine actor; the pre-flight writes nothing.
- `node --test bio-plane/test/m/case-authoring/`: 208 of 208 pass.
- `node checks/format.mjs /home/user/bio`: 175 modules, 0 failures. `node checks/architecture.mjs /home/user/bio case-authoring`: 0 failures. `node checks/coverage.mjs /home/user/bio case-authoring`: 53 of 53 live ids named by a test, 0 failures. `node checks/words.mjs`: no finding in case-authoring. `node checks/ownership.mjs /home/user/bio case-authoring tranche/T51 job/T51/case-authoring`: 1 file changed by case-authoring (the module's source; the new test file and this record are the job's own paths), 0 failures.
- `node checks/run.mjs /home/user/bio`: no finding in case-authoring (the failures listed above are other modules').

**Size (session_01SzRDd1oqEEzNixuCz5nhog): test runs 4, module lines 2876** (`bio-plane/src/case-authoring/*.mjs`, all lines).

## J8 · COMPLETE

COMPLETE (B10, K4240). `publishpreflight`'s step three now lists `not_co_attested` as `{capture, by, findings}`: `by` is the member the capture module records as capturing it (null when none), `findings` the findings the case rests on through that capture. Tests: `co-attested-list.test.mjs` (3, seen red then green); case-authoring 208/208. format, architecture, coverage 53/53, words, ownership: 0 failures for case-authoring; `run.mjs` shows failures only in other modules.
Requirement line for BOB: proposed R82 (amends R34), in the record's B10 section. Decision for you (P17, recorded): `by` is the first member capturer by time; if two members captured one capture, the second is not listed.
Readers: no reader of the key outside this module in the repository; screens-publish's J9 should confirm it reads the new shape.
