# case-import (T51)

**Status** · session_01SzkgwmAtqAM8o4CD1HsrkB · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

T51-80 (red #34, N1223, DEC-327, U343, K3729): done, all tests green.

**Applied.** The module reads the three refusal sub-keys the declared list names, by key, where it answers those departures:
- `refusal.IMPORT_NOT_A_CASE_FILE.noparts` when no part is given (`importCaseFile`);
- `refusal.IMPORT_NOT_A_CASE_FILE.notbytes`, with `{n}` counting the part from 1, when a part is not bytes;
- `refusal.IMPORT_NOT_A_CASE_FILE.manifest` when a manifest names no team, case or edition.
`words.mjs` holds the three keys (53 keys in all, equal to the declared list). Commit ef47088dab on job/T51/case-import.

**Test.** `words.test.mjs` appended `caseimport.stake.unreadable` to the declared list, which now names it already; the duplicate is removed. Its placeholder set gains `n` for `notbytes`. A new assertion in its R1 test checks that the noparts and notbytes departures draw the list's words.

**Deferred.** Nothing in my module. The manifest-identity departure (`refusal.IMPORT_NOT_A_CASE_FILE.manifest`) is read by key but unreachable with the real manifest check: `case-grammar` R13 refuses every missing group, case or edition first. Kept as the defensive branch it already was; no control test added for it.

**Found in another module (for BOB).** `bio-plane/dist/bio-plane.bundled.mjs` (a generated artifact, owner `bio-plane`) carries case-import's source and words, so my change stales it. Not regenerated here (manifest §14). Also `agent-worker/dist/agent-worker.bundled.mjs`, if case-import is in its input set: not checked.

**Checks.**
- `node --test test/m/case-import/*.test.mjs` in bio-plane: 126 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files, 0 failures.
- `checks/architecture.mjs /home/user/bio case-import`: 0 failures.
- `checks/coverage.mjs /home/user/bio case-import`: 26 of 26 live ids named by a test.
- `checks/ownership.mjs /home/user/bio case-import tranche/T51 job/T51/case-import`: 4 files, 0 failures.
- `checks/run.mjs /home/user/bio`: format and architecture 0 failures. Its coverage step fails 23 other modules (for example affordances R67, interface-shell R90–R101), none case-import. Not mine; not investigated.

Size (session_01Bph2yYGTh5kCEUU4yTWpfn): test runs 4, module lines 2236.

## J2 · REPORT

Found in another module (P9), not changed by this job:

- `handlist` at `bio-plane/test/m/plane/accepted.test.mjs:154`: the plane test hand-lists case-influence op names (`caseimport`, `caseimportdocument`, `importedcases`, `importedcase`, ...). Plane's job should take the list from its declaration: `CASE_IMPORT_OPS`, exported by `bio-plane/src/case-import/index.mjs` from this job (its ten ops, K3268), or from `caseImportOps`' keys.
- `inline` at `bio-plane/src/queue-producers/index.mjs:2154`: an English sentence in product source ("an unreadable docket is case-import's fact about this copy's latest..."). queue-producers' job should read it through `localize`, or it is a word-pass item for that module.

## J3 · COMPLETE

T51-228 (words, the conversion's findings in `build/plan/words-pass/case-import.md`): done, commit `3331e2deca`, merged with `tranche/T51` @ `c541c23ab9` at `e1078c3d28`; that merge changed none of this module's files.

**Applied.**
- The 21 plain findings are each read through `localize('case-import.index.<slug>', en)` in `bio-plane/src/case-import/index.mjs`: the refusals' details, the RACED detail, the lens fallback and the acceptance and withdrawal sentences. Two concatenated literals are each one literal now. The no-finding-named case is split from the named case into two keyed sentences.
- The handlist finding (`import.test.mjs`) now compares the ops with `CASE_IMPORT_OPS`, a new export of `index.mjs`: the module's own declaration, not a hand-list (K3268). The test set is unchanged.
- Member-read sentences the check did not count (capitals, or under five words; R13 binds them) are also keyed: `index.mjs` 376, 383 (`missing[].why`), 1315 (watch address), 1341, 1344, 1419, 1422, 1439, 1461, 1479 (refusal and docket-entry details).
- Not judged as developer text, so no REPORT for the module's own strings. The `flagRefusal` fragments "the issue" and "the reason for clearing" stay as vars of the keyed sentence `case-import.index.what_is_1_to_words`, as they were.

**Tests and checks.**
- `node --test bio-plane/test/m/case-import/`: 126 pass, 0 fail.
- `checks/run.mjs /home/user/bio` (civicos-process pulled, already current): format 0 failures; architecture 0 failures; words: no finding in case-import; the summary is 2,242 failures repo-wide, none in case-import (two are other modules, in the REPORT).
- `checks/coverage.mjs case-import`: 26 of 26 live ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio case-import tranche/T51 job/T51/case-import`: 0 failures.
- `setup-words/build.mjs --check`: `rows.mjs` is stale, as expected (the `case-import.index.*` ids are new); no refusal names case-import.

**Deferred:** none. **Other modules:** two findings in the REPORT (plane's handlist, queue-producers' inline sentence).

**Choice I made.** The commit has no `Co-Authored-By` model line, because the system rule on model identifiers in commits outranks the attribution note; the session line is kept.

Size (session_01SzkgwmAtqAM8o4CD1HsrkB): test runs 1, module lines 2238.
