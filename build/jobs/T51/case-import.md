# case-import (T51)

**Status** · session_01XhXogLsaNXvRTwSopMot47 · depth 2 · COMPLETE · handled B18

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

## J11 · COMPLETE

B11 item 1 (C6, diag2-10b): done. R4 met: `importedCases` (per import, the latest edition's) and `importedCase` (the edition shown) answer `scope`, the `case_scope` of the edition's case document (null where none, never the id); each finding of `#editionView` answers `title` from `#findingTitle` (R31's rule; null where none). Product code: `bio-plane/src/case-import/index.mjs` (`#scopeOf`, two answers, one finding field).

**Tests.** New `names.test.mjs` (5 tests, R4): scope and titles on both reads; null scope and null title as controls; latest vs named edition; a non-member answered with no scope; the published fixture. Seen red on the old code (3 of 4 then failed), green after. `reads.test.mjs` pins the list row whole, so its expected row gained `scope: null` (R4's new field, no assertion weakened). `fixture.mjs` `caseFile`/`caseDocText` take `scope`. Published for screens-publish: `importedNamed()` in `fixtures.mjs`, made by the real reads at test time.

**Why the tests missed it.** R4 named no title or scope, so no case-import test asked for one, and screens-publish's fake plane hand-wrote titles the real answer never carried.

**Met ids for BOB to strike:** R4.

**Checks.** case-import suite 166 pass, 0 fail. format 0; architecture 0; coverage case-import 33 of 33; ownership 0; words: no finding names case-import. `fixtures.mjs case-import --list`: the one inherited line (`fixture.mjs:193`, `strength.strengthOf` scripted, FIX-E, waiting on strength's provider); no marker added. `checks/run.mjs`: other modules' coverage and fixture lines only. Declarations unchanged; no new word ids; generated artifacts made stale: `bio-plane/dist/bio-plane.bundled.mjs` (carries this module's source), not regenerated (§14).

**For screens-publish (BOB):** `imported.mjs` should read `c.scope` and `f.title` (diag2-10b C6 item 4); its fake plane should take `importedNamed()`.

Size (session_01JD7L1vW9GM6iWcpLj3beF4): test runs 6, module lines 2700

## J12 · COMPLETE

**Applied (B12, K5195, fix round 10).** `bio-plane/test/m/case-import/fixture.mjs:193` (`NO_ID`): the strength stand-in no longer hand-builds `{ ok: false, reason: "NO_ID" }`. It calls strength's published `strengthOfNoId()` (`bio-plane/test/m/strength/fixtures.mjs:20`), imported at `fixture.mjs:22`. Commit `c0d0c90796` on `job/T51/case-import`, after merging `tranche/T51` (fast-forward to `7915a4d54b`).

**Failing-first.** The line is the one case-import FAIL in the fixtures check (verify-marks, fixture table). I added no test: the reason stays `NO_ID`, so the module's existing suite covers the value. I took the before-state from verify-marks and did not re-run the pre-change tree. After the change the fixtures check reports 0 failures for case-import.

**Markers.** None added (no `fixtures-own` or `fixtures-generic`).

**Requirement marks.** None to strike for case-import in this round.

**Tests.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/case-import/*.test.mjs`: 167 pass, 0 fail, 0 cancelled.
- The seven test files that import `case-import/fixture.mjs` (monitoring/docket, case-authoring, case-disclosures, conformance and others): 70 pass, 0 fail.

**Checks** (product root `/home/user/bio`).
- `checks/fixtures.mjs /home/user/bio case-import --list`: 0 failures.
- `checks/ownership.mjs /home/user/bio case-import <merge-base> HEAD`: 0 failures.
- `checks/run.mjs /home/user/bio`: format 0; architecture 0; coverage 10 failures and words 16 failures repo-wide, none in case-import's files; fixtures 1475 failures repo-wide, none in case-import's own tests.
- `build/plan/impact.mjs tranche/T51 HEAD`: 21 of 178 modules, 160 of 2981 test files. I ran the case-import importers above; the other modules' tests I did not run.

**Found in other modules (REPORT, not changed by this job).** Other modules' tests hand-build case-import's ops (`importedcase`, `importedcases`, `rerunstart`, `rerunpair`, `rerunread`) instead of taking case-import's published op fixture (fixtures check, `answer`/`op-table`):
- `bio-plane/test/m/control-plane/r49-routes.test.mjs:131`, `:143`
- `bio-plane/test/m/screens-inquiry/fixtures.mjs:125`; `fr28-project-rerun.test.mjs:75`; `fr4-project.test.mjs:107`
- `bio-plane/test/m/screens-publish/fr30.test.mjs:41`; `fr30b.test.mjs:188`, `:211`, `:219`

**Deferred.** None.

**Size (session_016Dy5qtXPVX99spYqMEytEP): test runs 2, module lines 2701.**

---
_Generated by [Claude Code](https://claude.ai/code)_

## J13 · COMPLETE

K5175 (fix round 10): done, commit e506345ee2 on job/T51/case-import.

**Entries applied.** The five answers the screens and the door read are now published by case-import's fixtures, each made by the real code when called:
- `importedCasesAnswer()`: `importedcases`
- `importedCaseAnswer({ edition })`: `importedcase`
- `rerunStartAnswer({ twice })`: `rerunstart`; `twice` gives the `RERUN_ALREADY` refusal
- `rerunPairAnswer({ own, withdraw })`: `rerunpair`
- `rerunReadAnswer({ paired })`: `rerunread`

Each is the door's answer (`caseImportOps`) over the module's real methods, over a world built per call. Nothing is stored.

**Files.** `bio-plane/test/m/case-import/fixtures.mjs` (fixtures added); `bio-plane/test/m/case-import/fixtures-answers.test.mjs` (new, 6 tests).

**Failing first.** The importedcase fixture broken on purpose: 1 red, 5 pass. Restored (cmp-verified): 6 of 6 green.

**Markers.** None added. Every user is later in modules.json than case-import, so users import these fixtures with no markers.

**Tests and checks.**
- `node --test bio-plane/test/m/case-import/*.test.mjs`: 173 pass, 0 fail.
- Affected dependents (impact.mjs origin/tranche/T51 HEAD, 143 test files, 21 modules): 1074 pass, 0 fail, exit 0.
- format: 0 failures. architecture (case-import): 0. coverage (case-import): 33 of 33 live ids. fixtures.mjs case-import --list: 0 failures. ownership (merge-base..HEAD): 0 failures.
- checks/run.mjs: no finding in case-import's files; no new words.

**Met ids.** None struck: this job adds no requirement change.

**Found in other modules (REPORT).** These hand-build case-import's answers and are flagged by the fixtures check as `answer` failures. They re-point to these fixtures in their own jobs:
- control-plane `r49-routes.test.mjs:131`, `:143`
- screens-inquiry `fixtures.mjs:125`; `fr28-project-rerun.test.mjs:75`; `fr4-project.test.mjs:107`
- screens-publish `fr30.test.mjs:41`; `fr30b.test.mjs:188`, `:211`, `:219`

**Deferred.** None.

**Size (session_01B62EKqGfnysCFewWNPCJ6q): test runs 8, module lines 2701.**

## J14 · COMPLETE

K5195 (fix round 11, B14): `importregrade` is now published by case-import's fixtures, made by the real code when called.

**Applied.** `bio-plane/test/m/case-import/fixtures.mjs:176` (`importRegradeAnswer({ lens })`, beside the five answers of J13): a world built per call (the source's edition with F1's capture lowered from B to C, the own bar B/C), read through the door (`caseImportOps`) over the real `regradeImported`, under `lens` (default `removed`). Nothing is stored. Commit `b932310ba4` on `job/T51/case-import`, after merging `origin/tranche/T51`.

**Test.** `bio-plane/test/m/case-import/fixtures-answers.test.mjs` (new test, R27 importregrade): it asserts the published answer equals the module's own `regradeImported` answer; under `removed` F1 moves and names `scrutiny-official-statements`; under `as_published` nothing moves; and each call builds its own world.

**Failing first.** The fixture's lens broken on purpose (`lens: "as_published"` in the door call): 1 red, 6 pass. Restored (cmp-verified): 7 of 7 green.

**Markers.** None added (no `fixtures-own` or `fixtures-generic`). Its users are later in the order, so none is needed.

**Met ids.** None struck: this job adds no requirement change; R27 is already named by `regrade.test.mjs`.

**Tests and checks** (product root `/home/user/bio`).
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/case-import/*.test.mjs`: 174 pass, 0 fail, 0 cancelled.
- `checks/fixtures.mjs /home/user/bio case-import --list`: 0 failures.
- `checks/ownership.mjs /home/user/bio case-import <merge-base> HEAD`: 3 files, 0 failures.
- `checks/format.mjs`: 0 failures.
- `checks/run.mjs /home/user/bio`: no finding in case-import's files; words 15 failures repo-wide, none in case-import's files, no new words added.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 21 of 178 modules, 145 of 2966 test files. The seven test files that import `case-import/fixtures.mjs`: 31 pass, 1 fail. The failure is `bio-plane/test/m/screens-inquiry/b22-question.test.mjs`, which dies at store assembly with `DECLARED_OP_DISAGREES: readtranslate description`. That is the OP-GRADES #30 condition B14 names, not this module's; it clears when OP-GRADES #30 merges (I CHANGE).

**Found in other modules (REPORT, unchanged since J13).** The users still hand-build case-import's answers, and the fixtures check still flags them as `answer` failures. They re-point in their own jobs:
- control-plane `r49-routes.test.mjs:131`, `:143`
- screens-inquiry `fixtures.mjs:126`; `fr28-project-rerun.test.mjs:75`; `fr4-project.test.mjs:141`
- screens-publish `fr30.test.mjs:41`; `fr30b.test.mjs:188`, `:211`, `:219`

No other user hand-builds `importregrade`.

**Deferred.** None.

**Size (session_0148qLrnJJ6pkszGEBGzyxN6): test runs 7, module lines 2701.**

---
_Generated by [Claude Code](https://claude.ai/code)_

## J15 · COMPLETE

Round 11 (B14, K5207): `importregrade` is published by case-import's fixtures, made by the real code when called: `bio-plane/test/m/case-import/fixtures.mjs:176` (`importRegradeAnswer`), tested in `fixtures-answers.test.mjs` (failing first: 1 red on purpose, then 7 of 7 green). Commit b932310ba4; record J14.

Module tests: 174 pass, 0 fail. Checks: fixtures 0 failures; ownership 3 files, 0 failures; format 0 failures; run.mjs no finding in case-import's files. Dependents: 31 pass, 1 fail, `b22-question.test.mjs`, which fails at store assembly with DECLARED_OP_DISAGREES: readtranslate description (the OP-GRADES #30 condition; not this module's).

Other modules still hand-build case-import answers (REPORT, unchanged): control-plane r49-routes.test.mjs:131, :143; screens-inquiry fixtures.mjs:126, fr28-project-rerun.test.mjs:75, fr4-project.test.mjs:141; screens-publish fr30.test.mjs:41, fr30b.test.mjs:188, :211, :219.

Size (session_0148qLrnJJ6pkszGEBGzyxN6): test runs 7, module lines 2701.

---
_Generated by [Claude Code](https://claude.ai/code)_

## J16 · COMPLETE

Re B15 (CHANGE, K5209): merged origin/tranche/T51 into job/T51/case-import (merge 613270cbda, no rebase). With OP-GRADES #30 in, nothing in my files changed.

Green: case-import tests 174 pass, 0 fail; the seven test files that import case-import's fixtures 37 pass, 0 fail (b22-question is green now). Fixtures check 0 failures; ownership 3 files, 0 failures; format 0 failures; run.mjs no finding in case-import's files, words count unchanged (15 failures, none in case-import's files).

Still open, reported and not mine: other modules hand-build case-import's answers (control-plane r49-routes.test.mjs:131, :143; screens-inquiry fixtures.mjs:126, fr28-project-rerun.test.mjs:75, fr4-project.test.mjs:141; screens-publish fr30.test.mjs:41, fr30b.test.mjs:188, :211, :219).

Size (session_0148qLrnJJ6pkszGEBGzyxN6): test runs 4, module lines 2701.

---
_Generated by [Claude Code](https://claude.ai/code)_

## J17 · BLOCKED

Round 10 (B16, K5218): `citeimported`'s answer is published by case-import's fixtures. Committed e36b5210b4 on `job/T51/case-import`, pushed.

**Applied.** `bio-plane/test/m/case-import/fixtures.mjs` (`citeimportedAnswer`, R16): case-import's own accepted import (edition 1, F1 accepted), read by citation's real `citeImported` (`citationOps`, the door) over citation's own world (`inquiry: true`, members ann and alice), with case-import's five providers (`findingFacts`, `openFlagsFacts`, `withdrawals`, `moves`, `flagHistoryFacts`) registered on that world's accepted-work service. Nothing stored; each call builds its own worlds. Options: `role`, `note`, `finding` (default F1).

**Test.** `bio-plane/test/m/case-import/fixtures-citeimported.test.mjs` (new; R16 named): the answer is citation's real citation of the import's finding reference at edition 1, the origin is case-import's acceptance (by alice, the recorded reason), nothing flagged; control: an unaccepted finding (F2) is refused `BASIS_REFUSED` / `IMPORTED_NOT_ACCEPTED`.

**Failing first.** Default finding broken to F2 on purpose: 1 red, 1 pass. Restored (cmp-verified identical): 2 of 2 green.

**Markers.** None added. Citation is earlier, so no `fixtures-own` or `fixtures-generic`.

**Met ids.** None struck: this job changes no requirement. R16 is named by the new test.

**NEEDS BOB (one act, the reason I am BLOCKED):** `checks/architecture.mjs` fails on the new import of citation (`bio-plane/test/m/citation/fixture.mjs` and `bio-plane/src/citation/index.mjs`): case-import does not declare `citation` in `uses` (`build/modules.json`, the case-import line). Citation is layer 6, earlier than case-import, so the import is in order; the declaration is the only gap. Every other import the test needs is already declared (accepted-work, inquiry-grammar). Recommendation: add `"citation"` to case-import's `uses` in `build/modules.json`, as BOB's edit (I do not change another module or the uses list). Without it the check reports 2 failures in `fixtures.mjs`. The tests themselves are unaffected.

**Tests and checks** (product root `/home/user/bio`).
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/case-import/*.test.mjs`: 176 pass, 0 fail (was 174; +2).
- Dependents: the 8 test files outside case-import that import its fixtures: 38 pass, 0 fail.
- `checks/format.mjs`: 0 failures.
- `checks/coverage.mjs case-import`: 33 of 33 live ids named.
- `checks/fixtures.mjs case-import --list`: 0 failures.
- `checks/ownership.mjs ... <merge-base> HEAD`: 3 files, 0 failures.
- `checks/architecture.mjs case-import`: 2 failures, the `uses` gap above (BLOCKED).
- `checks/run.mjs /home/user/bio`: no finding in case-import's files except the architecture two. Words: 16 failures repo-wide (15 in J15), none in case-import's files; no word added by me. The +1 I have not traced to a file; it is not in case-import's paths.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 21 of 178 modules, 169 of 2982 test files, all additive (new export, new test file, two imports); the 8 dependents above were run.

**Found in other modules (REPORT, not mine):** citation's `citeimported` answer was dropped from citation's fixtures (e602f8d2a3), so the hand-built answers now in screens-publish `fr30b.test.mjs:232` and `:244` (and screens-inquiry, e.g. `b22-question.test.mjs:90`) can take `citeimportedAnswer` from case-import's fixtures once `uses` carries citation. Those re-points are their jobs.

**Deferred.** None.

**Size (session_01G3wefEYjZyUQh5J8yzoutu): test runs 6, module lines 2701.**

## J18 · COMPLETE

Re B17 (ANSWER, K5220): merged origin/tranche/T51 into job/T51/case-import (merge 83f6e12a0b, no rebase). `uses` now carries `citation`; nothing in my files changed.

**Applied (unchanged from J17).** `bio-plane/test/m/case-import/fixtures.mjs` (`citeimportedAnswer`, R16) and the new `bio-plane/test/m/case-import/fixtures-citeimported.test.mjs` (R16). Failing first, broken to F2 on purpose: 1 red, 1 pass; restored (byte-identical): 2 of 2 green.

**Checks** (product root `/home/user/bio`).
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/case-import/*.test.mjs`: 176 pass, 0 fail.
- `checks/architecture.mjs case-import`: 0 failures (was 2 before K5220).
- `checks/format.mjs`: 0 failures. `checks/coverage.mjs case-import`: 33 of 33 live ids named. `checks/fixtures.mjs case-import --list`: 0 failures. `checks/ownership.mjs ... <merge-base> HEAD`: 3 files, 0 failures.
- Dependents from J17 (the 8 test files outside case-import that import its fixtures) passed 38 of 38 before this merge; not re-run after it.

**Markers.** None added. **Met ids.** None struck: no requirement change.

**Other modules (REPORT, unchanged).** screens-publish `fr30b.test.mjs:232`, `:244` and screens-inquiry still hand-build `citeimported`; they can take `citeimportedAnswer` from case-import's fixtures now that `uses` carries citation.

**Deferred.** None.

**Size (session_01G3wefEYjZyUQh5J8yzoutu): test runs 9, module lines 2701.**

## J19 · COMPLETE

T51 K5222 (fix round 10, plan item 105): citeimported's refusal published beside `citeimportedAnswer()`. Done; tests green.

**Changed.**
- `bio-plane/test/m/case-import/fixtures.mjs:` new export `citeimportedRefusalAnswer()` (end of file), the door's real refusal to citation's `citeimported` for F2, a finding the import never accepted (only F1 is accepted). Made by `citeimportedAnswer({ finding: F2 })` on each call; the answer is `BASIS_REFUSED` carrying `IMPORTED_NOT_ACCEPTED` (check C-21.4), with nothing written. Its own marker is none (no `fixtures-own` or `fixtures-generic` added).
- `bio-plane/test/m/case-import/fixtures-citeimported.test.mjs:` imports the new export; new test "R16 citeimported refusal: ..." checks `ok === false`, `reason === BASIS_REFUSED`, one finding, `check === C-21.4`, `code === IMPORTED_NOT_ACCEPTED`, `ref` equal to the reference case-import builds, and `edition === 1`.
- Commits: `ca7beae0c8` (the change), `0660e9c24f` (merge of `origin/tranche/T51` into the job branch; it touched none of this module's paths). Pushed to `origin/job/T51/case-import`.

**Test, failing first.** Broke the fixture once (`citeimportedRefusalAnswer` built with F1, which is accepted): `fixtures-citeimported.test.mjs` red, 1 failing (the new refusal test), 2 passing. Restored: 3 of 3 green.

**Suites.**
- `fixtures-citeimported.test.mjs`: 3 pass, 0 fail.
- Whole module `test/m/case-import/*.test.mjs` (21 files): 177 pass, 0 fail, both before and after the merge.
- Users of this fixture, whole suites: `case-authoring/*`, `case-disclosures/*`, `conformance/*`, `monitoring/*` 684 pass, 0 fail; the five test files importing it directly (`case-authoring/rests`, `case-disclosures/imported`, `monitoring/docket`, `screens-inquiry/b22-question`, `screens-publish/fr30b`) 60 pass, 0 fail. `screens-publish/fr30b.test.mjs:257` still hand-builds its IMPORTED_NOT_ACCEPTED answer; it is screens-publish's to switch to `citeimportedRefusalAnswer()`. I did not touch it.
- `fixtures.mjs bio case-import --list`: 0 failures.
- `format.mjs`: 178 modules, 0 failures. `architecture.mjs case-import`: 0 failures. `coverage.mjs case-import`: 33 of 33 live ids named by a test, 0 failures.
- `ownership.mjs case-import tranche/T51 job/T51/case-import`: 3 files, 0 failures.
- `impact.mjs origin/tranche/T51 HEAD` (run with the `origin/` ref; the bare `tranche/T51` form fails in this checkout): 21 modules, 170 test files affected. Additive change only; the run above covers every test file that imports this fixture module.
- `run.mjs /home/user/bio`: format and architecture 0 failures, coverage 178 modules 7069 of 7069 ids. Words: 15 failures, all in other modules (`store-assembly` inline strings; no case-import file among them). Failures naming case-import as the answer provider are in other modules' test fixtures (see Found below). None are in this module's files.

**Met ids.** R16 (citeimported: the refusal half; the answer half was already met by J-K5218). Bob may strike the mark.

**Found in another module (for BOB, P9; not changed here).**
1. `bio-plane/test/m/screens-publish/fr30b.test.mjs:257` hand-builds `{ ok: false, code: "IMPORTED_NOT_ACCEPTED", reason: ... }`. The real answer is `BASIS_REFUSED` with `findings[0].code === "IMPORTED_NOT_ACCEPTED"`; the screen's refusal path (`screens-inquiry/question.mjs:1271`) reads the findings list. screens-publish should take `citeimportedRefusalAnswer()` from `case-import/fixtures.mjs`, which is ready now.
2. `run.mjs` op-table failures that name case-import as the provider: `screens-inquiry/fixtures.mjs:126` (`importedcases` hand-built as `{ imports: [], count: 0 }`), `screens-inquiry/fr28-project-rerun.test.mjs:75` (`rerunpair`), `screens-inquiry/fr4-project.test.mjs:141` (`rerunread`). Screens-inquiry should take `importedCasesAnswer()`, `rerunPairAnswer()`, `rerunReadAnswer()` from `case-import/fixtures.mjs`. This was already the case before this job; not investigated further.

**Deferred.** Nothing in my module.

**Generated artifacts.** None made stale: the change is in test files only; `bio-plane/dist/bio-plane.bundled.mjs` bundles src, not tests.

Size (session_01XhXogLsaNXvRTwSopMot47): test runs 5, module lines 7051.
