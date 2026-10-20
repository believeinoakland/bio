# case-import (T51)

**Status** · session_01X57Fb2cus6hqAi1q2mRhhA · depth 2 · COMPLETE · handled B4

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

## J4 · QUESTION

Started on B3 (FR-16), merged tranche/T51, read requirements, draft §2 whole, the pass record and my code whole. Two things need BOB's hand; I carry on in the meantime on my best reading.

1. `uses` edges (modules.json is BOB's). The architecture check fails my files without them:
   - `test-support`: START entries 3 and 4 have my tests call `declaredOpHolds` (bio-plane/test/declared-ops.mjs, owner test-support); the other modules that declare ops list it.
   - `basis-versions`: R30's `NO_SUCH_OWN_FINDING` ("not a finding of this project") and R31 need the project's questions: `basisVersions.projectQuestions({project})` (its R41), the one reader of which inquiries a project draws on. The tests also use its world fixture's `project` and `inquiry` builders.
   Please add both to case-import's `uses`. If a test fixture needs more (project-roster, inquiry) I will say which and why.

2. Reading, no answer needed unless BOB disagrees: the draft's `NO_SUCH_IMPORT` (R29) is answered as this module's existing absent answer `IMPORT_NO_SUCH_EDITION` (R4's "same bytes as no import"), so one condition has one code; the new refusal rows (MACHINE_CANNOT_RERUN, RERUN_ALREADY, NOT_A_RERUN, NO_SUCH_SOURCE_FINDING, NO_SUCH_OWN_FINDING, REGRADE_LENS_UNKNOWN) go in checks.mjs as C-130.17 onward, awaiting promotion's stamp, with their sentences written once by localize; project refusals (NO_SUCH_PROJECT, NOT_THE_PROJECT_OWNER, PROJECT_ACT_NOT_A_PARTICIPANT) are membership's, relayed.

## J5 · COMPLETE

FR-16 (B3, answered by B4): done, all case-import tests green (155 pass). Requirement lines R27 to R33 are written in `build/requirements/case-import.md` itself (not in this record), each marked *(not yet met: T51)*; the ownership check lists that one file, accepted at the merge (B4).

**Entries applied.**
1. **C49 (K4169).** `regradeImported` (`op=importregrade`, R27, R28), `rerunStart` (`op=rerunstart`, R29), `rerunPair` (`op=rerunpair`, R30), `rerunRead` (`op=rerunread`, R31), invariants R32. Two tables, `case_import_reruns` and `case_import_rerun_pairs`, append-only and declared whole to purge. Six refusal rows C-130.17 to .22 (`MACHINE_CANNOT_RERUN`, `RERUN_ALREADY`, `NOT_A_RERUN`, `NO_SUCH_SOURCE_FINDING`, `NO_SUCH_OWN_FINDING`, `REGRADE_LENS_UNKNOWN`), awaiting promotion's stamp, their sentences written once by `localize` (the design list has no `refusal.<CODE>` key for them). Project refusals are membership's, relayed (`NO_SUCH_PROJECT` R78, `PROJECT_ACT_NOT_THE_OWNER` R122, `PROJECT_ACT_NOT_A_PARTICIPANT` R55). `NO_SUCH_IMPORT` is `IMPORT_NO_SUCH_EDITION` (B4).
2. **C51 (DEC-374).** `importacceptwithdraw` already existed with its reason and `IMPORT_NOTHING_ACCEPTED`; confirmed by a new test through the door (`withdraw-op.test.mjs`: withdraws, the import counts for nothing again; not-accepted and no-reason refused). That test passed on first run, as the op was already built; no code change was needed.
3. **K4168 and K4202 (R33).** `DECLARED_OPS` beside `caseImportOps`: the nine ops `caseimport`, `importaccept`, `importacceptwithdraw`, `importflag`, `importwatch`, `importregrade`, `rerunstart`, `rerunpair`, `rerunread`. For the five with hand rows, classes, `mutating`, weight and description are the hand rows' (op-grades' act help, which its R50 requires equal); `refusal` is named for the three reasoned acts. `declared-ops.test.mjs` holds each with test-support's `declaredOpHolds`, and a fresh process registers the rows with `op-declarations.registerDeclaredOps` and `op-grades.registerDeclaredOps`: the five agree, the four new register (control: a changed weight is refused naming the op).

**Readings I took (small, mine to take).**
- `rerunPair` takes an optional `edition` (the ref spells import and finding, not the edition); absent, it is the latest edition of that import the project is declared a rerun of. A non-numeric edition is `NOT_A_RERUN`.
- Within R30 an unreadable `source_finding` is refused `NO_SUCH_SOURCE_FINDING` before `NOT_A_RERUN`, since "no rerun of that edition" cannot be asked of no edition.
- The owner refusal is membership's `PROJECT_ACT_NOT_THE_OWNER`; the draft's `NOT_THE_PROJECT_OWNER` is `publishCase`'s spelling.
- R28's note is true in both situations that give the same answer as `removed`: it says the group's lens holds none of the statements the edition applies (not that the group has no lens).
- The "pair as published" in R27 and R31 is the recorded recreation's pair (as `case-checker.reweigh`'s `as_published` gives it), which equals the frozen published pair for a recreated finding.
- `limit` is always `LENS_LIMIT` (the `case-checker.lens_limit_statement` word), not the stand-in checker's own sentence.
- `#ownLens` now reads the case document through the shared `#documentFront`; behaviour unchanged (R23 tests green).

**Deferred.** None in my module.

**Found in other modules (for BOB).**
1. **Three neighbour tests hand-list case-import's ops and fail on the four new ops** (they are not mine to change): `op-declarations/t28.test.mjs` "R14, R6" and its "R16, R6" (every op of case-import's map has a spec and is in the act lists); `control-plane` "R49, R2, R26" (each of case-import's eight ops is routed); `plane/accepted.test.mjs:155` "R17, R5" (case-import's map holds only ops op-declarations declares). They need the registration of `DECLARED_OPS` (`registerDeclaredOps`, op-declarations R80 and op-grades R49) to be called where the plane starts, or their lists to be taken from `CASE_IMPORT_OPS`/`DECLARED_OPS` (K3268). The four ops also need a route in control-plane's door and the plane's route map. Same shape as `projectclose` (investigation #R25).
2. `op-grades/test/m/op-grades/owners.test.mjs:84` copies the sentence `import-directed: keyed by an imported case (...)`, which now also stands in case-import's `localize` (one literal, `case-import.declared.import_directed`, the hand rows' act help that op-grades' R50 requires a declaration equal). The words check reports it as `testcopy` (op-grades, not case-import). The hand rows of the five ops can now go (K4168) once BOB removes them from op-grades' and op-declarations' tables; then that test copy goes with them. Ops whose hand row can go: `caseimport`, `importaccept`, `importacceptwithdraw`, `importflag`, `importwatch` (their `classes`, `machineClasses`, `mutating` and weight are in `DECLARED_OPS`).
3. Generated artifact stale: `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), owner `bio-plane`, carries case-import's source; `agent-worker`'s bundle not checked (it does not read case-import by manifest). Not regenerated here.
4. `op-grades/marks.mjs` lists `projectclose` as a mark; the four new ops need none (two are reads, two reversible rungs by `registerDeclaredOps`), but `MARKS`'s totality (op-grades R42, R46) was already red before this job.
5. Pre-existing reds not mine: `op-declarations` R73, `op-grades` R42 and R46, 18 in `interface-shell`, `plane` R24, and 7 other modules' coverage gaps in `checks/run.mjs` (agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring), plus the `testcopy` lines of op-grades listed by the words check.

**Tests and checks.**
- `node --test bio-plane/test/m/case-import/`: 155 pass, 0 fail (was 126).
- Neighbours run: monitoring, case-disclosures, queue-producers, conformance, accepted-work, reevaluation, membership, basis-versions, strength, bias, test-support, op-capabilities: 0 fail.
- `checks/format.mjs`: 175 modules, 175 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio case-import`: 0 failures.
- `checks/coverage.mjs /home/user/bio case-import`: 33 of 33 live ids named by a test.
- `checks/words.mjs`: no finding in case-import (inline 0, plain 0).
- `checks/ownership.mjs /home/user/bio case-import tranche/T51`: one failure, `build/requirements/case-import.md` (accepted at the merge, B4).
- `setup-words/build.mjs --check`: rows stale, as expected (new ids); no refusal names case-import.

Size (session_01X57Fb2cus6hqAi1q2mRhhA): test runs 14, module lines 2680
