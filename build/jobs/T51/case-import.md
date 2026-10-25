# case-import (T51)

**Status** · session_01JD7L1vW9GM6iWcpLj3beF4 · depth 2 · COMPLETE · handled B10

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

## J6 · COMPLETE

B5 (K4259) applied; B6 route taken (stale local branch kept as `stale/case-import-local`), `mail start` done.

**Entry applied.** R31: each finding row of `rerunread` carries `title`, read by `#findingTitle` from the `title` of the imported case file's `findings/<id>/finding.md` front matter through `fileOf` (path from `case-grammar.caseFilePath`); `null` when the file or the title is absent, never the id. No case-level title. Requirement: R31 amended in `build/requirements/case-import.md` itself (no new id), the Status line names it; it stays marked not yet met: T51 as before. Test `R31 each finding row of rerunread carries its title…` in `rerun.test.mjs`, written first and seen failing; control: findings with no title answer null. The fixture's `findingText`/`caseFile` take an optional `titles` (bytes unchanged without it).

**Deferred.** None. **Found in other modules.** Nothing new beyond J5's list. Reds not mine in `checks/run.mjs`: coverage gaps in agent-harness, agent-runner, installer-steps, journey-check, screens-inquiry (R110, R119), screens-intake (R53); words `testcopy` in op-grades `t37.test.mjs:32`. Screens that draw the project page can now read `title`; `setup-words` rows unchanged (no new word id).

**Tests and checks.** `node --test bio-plane/test/m/case-import/`: 156 pass, 0 fail (was 155). format 0 failures; architecture (case-import) 0; coverage (case-import) 33 of 33; words: nothing in case-import; ownership case-import tranche/T51 job/T51/case-import: 1 file changed in the check (requirements file, accepted at the merge, B4), 0 failures. Tranche not merged into my branch (no file I read changed).

Size (session_01Ge3D4wpTN5PSBoW7jivuwt): test runs 4, module lines 2689

## J7 · QUESTION

G50 (B7): test written and pushed (`2bd15e12a9`); one decision is BOB's.

**Finding (B7 note 1).** A `/3` file with a repeated path is refused at `index.mjs:681-683`, never reaching the store at `:736`. `caseFileManifestCheck` flags `path_twice` for every format (`case-grammar/casefile.mjs:248`, inside the files loop, not gated by format). No reader is wrong, so no code changed. Held by the third test (passes today): a `/3` manifest listing one path twice answers `IMPORT_NOT_A_CASE_FILE` with the check's own departures, nothing stored; the control (each path once) imports. R1/R5 do not name `/3` as newest, so neither is amended.

**Tests** (`test/m/case-import/g50-import.test.mjs`, case file made by public-read's real `buildCaseFile` over two held captures of one ref): (1) a `/4` file imports and `case_import_files` holds every listed path, each capture's bytes read back; (2) the same file with its format edited to `/3` is refused; (3) the repeated-path finding above. 1 and 2 are red by name today (the writer still emits `/3`; `format` is not `/4`), until case-grammar, public-read and case-checker merge. My other 156 tests pass.

**QUESTION (BOB's, `modules.json`).** The test imports `public-read` (`src/public-read/casefile.mjs`, `src/container.mjs`), which case-import does not declare in `uses`, so `checks/architecture.mjs case-import` fails on 2 imports. My best reading: add `public-read` to case-import's `uses` (an edge to an earlier module, 112 < 118; used by tests only; the module's source calls nothing in it). I added a matching line to my requirements' Uses. Alternatives: your own test-only declaration, or I drop the real `buildCaseFile` for a hand-written zip (it would not follow R-SEAM). I carry on on this reading; the check turns green once the edge is in.

## J8 · COMPLETE

G50 done as far as it can be before the providers merge. Tranche merged at K4691 (`public-read` edge in `uses`); pushed.

**Finding.** A `/3` file with a repeated path is refused at `index.mjs:681-683` by `caseFileManifestCheck` (`path_twice`, every format); it never reaches the store at `:736`. No reader is wrong; no code changed. R1/R5 do not name `/3` as newest: not amended. Requirements: one Uses line added for `public-read` (tests only).

**Tests** `test/m/case-import/g50-import.test.mjs`: (1) a `/4` file of two held captures of one ref (public-read's real `buildCaseFile`) imports, every listed path stored, each capture's bytes read back; RED by name today (`format` is still `/3`: the writer is unmerged). (2) the same file edited to `/3` is refused `IMPORT_NOT_A_CASE_FILE`; RED by name for the same cause. (3) a `/3` manifest listing a path twice is refused with the check's departures, nothing stored; control imports: passes.
Both red turn green when case-grammar, public-read and case-checker merge; I have not seen them green.

**Declarations:** G50 changes no op; `DECLARED_OPS` unchanged. No new words ids. Generated artifacts made stale: none by this job.

**Checks.** Module tests 156 pass, 2 fail (the two reds above). format 0 failures; architecture (case-import) 0; coverage 33 of 33; words: nothing in case-import (the case-checker `spec.mjs:11` inline is inherited); ownership: 1 failure, `build/requirements/case-import.md` (accepted at the merge, B4/K4210); setup-words `--check`: no refusal names case-import.

Size (session_01Y65ywSzJiY7GTSetJFTW7y): test runs 20, module lines 2689

## J9 · COMPLETE

B9 (K4711) applied: tranche/T51 merged (case-grammar, public-read G50, case-checker), pushed.

**G50 seam tests are green** (3 of 3) against the merged providers. One fix in my test: the writer spells a several-ref `ref`'s files by the `capture` that `caseFileFacts` states per row, and my hand-built facts lacked it, so it still wrote `/3`. The facts now carry each row's `capture` (the shape `caseFileFacts` documents); the header says so. The full seam from the member's acts is case-disclosures' G50 test. No module code changed; the earlier finding stands (a `/3` repeated path is refused at `index.mjs:681-683`).

**Checks.** case-import suite: 158 pass, 0 fail (all 17 files). format 0; architecture (case-import) 0; coverage 33 of 33; words: no failure names case-import (the failures are other modules', inline 6 / missingkey 5 among them, installer-steps and case-checker); ownership: 1 failure, `build/requirements/case-import.md` (accepted at the merge, B4). Declarations: no op changed. No new word ids.

Size (session_01Y65ywSzJiY7GTSetJFTW7y): test runs 36, module lines 2689

## J10 · COMPLETE

B10 (fix round 10, Wave A batch 2): three fixtures published in `bio-plane/test/m/case-import/fixtures.mjs` (new), each made by the module's real code at test time, never stored; commit pushed on job/T51/case-import (tranche/T51 merged first).

**Causes / lines done.**
- `importedWorld({imports})`: real `importCaseFile`, `acceptImported`, `flagImported`, `clearFlag`, `withdrawAcceptance` over seeded editions; answers `{w, ci, imports:[{group, case, import, editions:{n:{flags}}}]}`. Replaces the users' hand-built `imports` (case-disclosures, case-authoring, conformance).
- `openFlagsUnread()`: the real `openFlagsOn` and `acceptanceOf` over a store that cannot be read (the world's database closed): `{flags:[],complete:false}` and `null`. (No code NO_SUCH_IMPORT exists; `openFlagsOn` never refuses.)
- `watchedImports({publishers, unwatched})`: real `watchImport` on one import per publisher, `watchedImports` pages, the real `recordDocketRead` refusal IMPORT_NOT_WATCHED for an unwatched import, and `watchItems` with nothing read.
- Test `r10-fixtures.test.mjs` (3 tests) calls each and checks the real answer, with controls (cleared flag not open; withdrawn acceptance reads null; readable store complete; no publishers: no watches).

**Lines left.** FIX-E 1 (`fixture.mjs:192`, `strength.strengthOf` scripted): waits for strength's provider; arrives as a CHANGE. Users re-point in their own jobs.

**Markers added.** `fixtures-own`: 0. `fixtures-generic`: 0.

**Product code changed.** None. Declarations unchanged. No new word ids. Generated artifacts made stale: none.

**Checks.** case-import suite: 162 pass, 0 fail (was 158 + 3 new + 1 earlier). format 0 failures; architecture 0; coverage 33 of 33; words 0 failures (dev 1, inherited); fixtures: 1 failure, the FIX-E line above; ownership 0 failures; `impact.mjs origin/tranche/T51 HEAD`: 0 modules affected (test-only files).

Size (session_01NT1x92ZN1kdow5LA1zD2mQ): test runs 3, module lines 2689
