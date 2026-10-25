# op-declarations (T51)

**Status** · session_01PfsuZ6j8UCFgigeTRxA37x · depth 2 · COMPLETE · handled B39

## J1 · QUESTION

Best reading, carrying on with it. T51-107's entry line declares more than R77 to R79 name: `versioncompare` (basis-versions R55, served by its map today), `approvedunsent` (filings R53) and `checkpointsdue` (action-plans R17) (no owner arm: the control plane's route serves them, screens-action R30 / K3867), and the `scope` parameter of searchfields/search/meaningrows (retrieval R87). R77 names none of them. Declared as `read` (admin, member, probe; `viewer` stamped; NEEDS null), each in its owner's family; `scope` and `projectlist`'s `after` are request fields, so nothing is declared and a test pins the specs unchanged. Please add the three ops to R77 (or tell me to drop them).
R78/R79 read "classes admin, member, probe ... for a member's session": I declared `holdsdue`, `templatebyhandle`, `rulefields`, `clocksrunning` with the `sessionread` kind (classes admin, member, probe; machineClasses [], so a caller arriving without a member's session is refused). `adminremovalsopen` (K3976) is `ownread` with `by` stamped (as joindoors). `heldat` is `read` with `by` and `viewer` stamped. Say if any should differ.

## J2 · COMPLETE

T51-107 applied (job branch pushed at f5a2b3ec9f; tranche/T51 merged in at 00220bc82a; B2 and B3 applied).

**Entries applied.**
- R76: `BROWSER_ACTS` (rows in the new `t51.mjs`, built on first read like every table, exported): the seven DEC-330 acts, each `{screen, census, registry}`; in no op table, session set, `ACT_GATE`, `REAUTH_ACTS`, act list, family, alias, stamp or ground of `ACT_HELP_ABSENT`. The totality tests (t34:150, t37, t38, t46, t47, t48) take the class through `test/m/op-declarations/browser.mjs`.
- R77/R78/R79 and K3976: 15 ops declared in their owners' families (`t51.mjs`: `T51_SHARES`, and `T51_FAMILIES` for `promotion` and `filing-templates`): `heldat` (read, `by` and `viewer`), `bundlehistory`, `entityidonly`, `subjectsnamed`, `entitysimilar`, `projectinvitations`, `versioncompare`, `approvedunsent`, `checkpointsdue` (read); `holdsdue`, `templatebyhandle`, `rulefields`, `clocksrunning` (`sessionread`: classes admin, member, probe, machineClasses []); `adminremovalsopen` (`ownread`, `by`); `publishedfrozen` (public, no NEEDS row). The 14 session ones are named under the read ground of `ACT_HELP_ABSENT`. `projectlist`'s `after` and `scope` (search, meaningrows) declare nothing; tests pin the specs and that the owners read the field. `holdsOf` and `unofferedFor` ride ops already declared.
- B3 (K4070): `counselpacket`, `holdnoticeprepare`, `noticepost`, `signeradd`, `noticeprepare` and `versionnotice` leave `ACT_HELP_ABSENT`; R34's partition tests read an op as explained by `ACT_HELP` or, for those six, by its `act.<op>.does` word (`test/m/op-declarations/help.mjs`), so they hold before and after affordances merges.
- Words: the two findings left (`reevaluationraise`, `moneydetectorsrun` citations) are now `localize` ids `op-declarations.index.reevaluation_raise_sweep` and `.money_detectors_run_sweep`; the words check shows 0 failures for the module and 0 lines naming it over all modules.
- The 9 inherited reds are cleared: t33:284, t34:149, t37:180, t38:76, t45:219, t46:248, t46:301, t47:289, t48:184. Pins updated for the new ops (family list, public surface, NEEDS counts 529 family rows and 879 keys, 109 exports, the kinds in the T45 and T47 family tests).

**Deferred.** Nothing in my module. Two ops' owner maps are not driven in my tests: `promotion` and `basis-versions` are no `uses` edge of op-declarations (the architecture check refused the imports). BOB may add both edges (R77's Uses allows promotion); a CHANGE then restores the driven stamp checks for `bundlehistory` and `versioncompare`.

**Found in other modules (REPORT).**
1. control-plane `totality.test.mjs`:17 (R2, R41) goes red on my tree: affordances' `unaccounted` lists the 14 new session reads as unpublished (`adminremovalsopen`, `approvedunsent`, `bundlehistory`, `checkpointsdue`, `clocksrunning`, `entityidonly`, `entitysimilar`, `heldat`, `holdsdue`, `projectinvitations`, `rulefields`, `subjectsnamed`, `templatebyhandle`, `versioncompare`): op-grades and affordances must name them. `publishedfrozen` is public and in no set. For every user suite I ran (admission, op-grades, affordances, op-capabilities, queue, control-plane, plane, interface-shell) the failures are the same with and without my change, but for that one.
2. B2 and R77 say `searchfields` takes `scope`; retrieval's arm takes none (it answers `scopes`, retrieval R87): `search` and `meaningrows` take it. No declaration changes.
3. `approvedunsent` and `checkpointsdue` have no owner arm: the control plane's route must serve them (screens-action R30); R6's totality for them rests there.
4. `heldat` is declared a read (R77: BOB's reading, to confirm with op-grades).
5. `rows.mjs` is stale for my two `localize` ids (expected, K3949).

**Tests and checks.** `node --test test/m/op-declarations/`: tests 230, pass 230, fail 0 (12 new in t51.test.mjs naming R76 to R79). format: 176 modules, 175 requirements files; 0 failures. architecture (op-declarations): 33 product files, 249 relative imports; 0 failures. coverage: 78 of 78 live requirement ids named by a test; 0 failures. ownership (tranche/T51 to job/T51/op-declarations): 20 files changed by op-declarations; 0 failures. words (module and all modules): 0 failures. setup-words build --check: the stale-rows note only, no refusal naming my module.

Size (session_01T6nKNiTXDaZwbSfpynQUSn): test runs 16, module lines 3318

## J3 · REPORT

B4 needs no change: the six ops left ACT_HELP_ABSENT at J2 (f5a2b3ec9f), and R34's partition tests run over ops only. Tested on a scratch merge of job/T51/affordances into my branch: op-declarations 230 tests, 230 pass, 0 fail (the partition holds with ACT_HELP holding the six and R69's seven browser acts, which are no ops, R76). Nothing pushed.

## J4 · COMPLETE

B4 and B5 applied (pushed). B5: op-declarations now uses promotion and basis-versions; t51.test.mjs drives bundlehistory (promotion's map) and versioncompare (basis-versions') like the other owners, 12 ops driven. B4: the six ops already left ACT_HELP_ABSENT; the partition runs over ops only, the seven browser acts their own class (R76); tested earlier on a scratch merge with job/T51/affordances: pass. Results: op-declarations tests 230, pass 230, fail 0; format 0 failures; architecture 0 failures; coverage 78 of 78, 0 failures; ownership 0 failures; words 0 failures. Findings in other modules unchanged from J2. Size (session_01T6nKNiTXDaZwbSfpynQUSn): test runs 19, module lines 3318

## J5 · COMPLETE

B6 applied (pushed 1b1edc7c1c; tranche/T51 merged in): bootstrapfacts is named among the store-internal routes with no spec (t47.test.mjs R62/R63/R6). op-declarations tests 230, pass 230, fail 0; ownership 0 failures; architecture 0 failures. B4/B5 as in J4. Size (session_01T6nKNiTXDaZwbSfpynQUSn): test runs 21, module lines 3318

## J6 · COMPLETE

B7 applied (pushed; tranche/T51 merged in at the design 2a64c5ae77). Two of my tests changed, no table did: t51 (R78) no longer pins the exact acts of hold, holdnotice, counsel and grouprules (the registry now adds actionholdrelease on hold: declared, asserted), and t50 (R73/R21) takes the seven browser acts as their own class (R76) in wizard-scripts' registryActGaps, which now lists them as owed gaps. op-declarations tests 230, pass 230, fail 0; architecture, coverage (78 of 78), words, ownership: 0 failures. Size (session_01T6nKNiTXDaZwbSfpynQUSn): test runs 23, module lines 3318

## J7 · COMPLETE

B8 (K4098) applied (pushed 3b7144066b; tranche/T51 merged in).
(1) `actionholdrelease` leaves ACT_HELP_ABSENT's unexplained group; t36, t42 and t50 are green.
(2) affordances R12: `publishedfrozen` was `stale` because op-grades names it a non-act and the door's table gated = has a NEEDS row. It is declared kind `publicread` (classes null, not mutating, nothing stamped, in no session set, a present null NEEDS row, as `handlecheck`): control-plane `totality.test.mjs`:17 is green.
(3) `heldat` is a new kind `readfenced`: classes admin, member, probe, machineClasses ["admin", "probe"], so admission refuses an `ai` credential. I did not put `member` in machineClasses: R2 says no machineClasses names `member` (no member bearer exists, and a test over OPS finds none); the operator's admin and probe bearers reach it, capture refuses `check` without a member session. Tell me if you meant otherwise.
Results: op-declarations tests 230, pass 230, fail 0; control-plane, admission and op-grades suites 508 pass, 0 fail; format, architecture, coverage (78 of 78), words (module and all modules), ownership: 0 failures. NEEDS counts in t49 now 530 family rows, 880 keys. Size (session_01T6nKNiTXDaZwbSfpynQUSn): test runs 26, module lines 3324

## J8 · QUESTION

Best reading, carrying on with it (R80 and R81 are written, marked not yet met). Section 3 of the plan lists a row as `{classes, machineClasses?, mutating, weight, description, fields}`, but START B9 also says the registration must agree on stamps and merge the op's `NEEDS` row, and neither is in that list. I added two optional row keys: `stamps` (a list from OP_STAMPS' closed set; default `["viewer"]`, none for a public op) and `needs` (null or a capability; required of a mutating op with no hand row, null for a read). `weight` and `description` are op-grades' and are not read here. Spelling: `registerDeclaredOps(rows)`, rows being `{owner: DECLARED_OPS}` or a list of `[owner, DECLARED_OPS]` pairs, called once before the first read; `declaredFields(op)` answers the frozen `{accepts, requires}` or `undefined`. A registered op is merged into OPS, OP_STAMPS, NEEDS and both session sets (not in them if public); it gains no family, so a registered op is not listed in OP_FAMILIES. Please tell me if wave 2 should read it differently, and say whether op-grades' `registerDeclaredOps` shares the same name (I use the name in this module; the plane calls both).

## J9 · COMPLETE

FR-04 applied (K4168), pushed; tranche/T51 merged in (it brought the registry with DEC-381's controls).

**Requirement lines for BOB to write (ownership refuses the file in my diff, so the branch carries none).** START B9 says to write R80 and R81 first, but `checks/ownership.mjs` refuses `build/requirements/op-declarations.md` as outside my paths, tests and record: please add these two lines after R79 and mark them not yet met (T51); my tests name R80 and R81, and coverage shows 78 of 78 live ids until they are in (80 of 80 with them):

- **R80** *(not yet met: T51)* (K4168; R69's lazy form; `op-grades` R49) **An op's declaration is taken from its owner when the owner makes one, its fields kept beside it.** `registerDeclaredOps(rows)` is exported (a plain function, built by nothing): `rows` is the owners' `DECLARED_OPS`, an object `{owner: {op: row}}` or a list of `[owner, {op: row}]` pairs. A row is `{classes, machineClasses?, mutating, weight, description, fields?: {accepts, requires}, stamps?, needs?}`: `classes` is `null` (public) or a list of `admin`, `member`, `probe`, `daemon`; `machineClasses`, where given, a list of the same; `mutating` a boolean; `stamps`, where given, a list of the stamp keys `OP_STAMPS` holds (`viewer` when absent, none for a public op); `needs`, where given, `null` or a capability, and required of a mutating op that has no hand row (a read's is `null`, a public op's absent); `weight` and `description` are `op-grades`' (R49 there) and are not read here; `fields.accepts` is a list of field names and `fields.requires` a list of names or of lists of alternatives, any one of which satisfies it. A malformed row is refused naming the op. Nothing is built by the call and nothing at import (R69): the first read of any export builds once, and `build()` merges each op the hand tables do not hold into `OPS` (its `classes`, `machineClasses`, `mutating`), `OP_STAMPS`, `NEEDS` and, unless public, both `SESSION_OPS` sets; every table stays frozen (R5). `declaredFields(op)` answers the frozen `{accepts, requires}` an owner declared for the op (also for an op with a hand row), and `undefined` for an op with none; nothing else about the routing of an op changes (family, aliases, act lists, `REAUTH_ACTS`, the grounds of `ACT_HELP_ABSENT`). The hand rows stay until each owner next declares its own (K4168). Test: `op-declarations`'s tests with fixture owner rows: a new op with an owner row only is in `OPS`, in both session sets, has its stamps and `NEEDS` row and its fields read back; a public one is in neither set; an op with no fields answers `undefined`; with no registration, or with only new ops registered, every other entry of every export is byte-identical (control).
- **R81** *(not yet met: T51)* (K4168; `op-grades` R50) **An owner's row and a hand row for one op agree, or the registration is refused.** For an op the hand tables hold (family, alias or `OPS` row), the owner's `classes`, `machineClasses` (absent and `[]` differ), `mutating` and, where the owner gives them, `stamps` (as sets) and `needs` equal the hand row's, else the registration is refused naming the op and the field, and nothing is registered. An op in two owner rows is refused naming the op and both owners. A registration after the first read of any export, and a second registration, throw naming the first op; a refused registration leaves the module as it was and a later valid one is accepted until the first read. Test: an owner row that disagrees with the hand row of `heldat` (a real op) on each field in turn is refused naming `heldat`; an agreeing one is accepted, its fields kept (control); a late registration, a second one, and a duplicate each throw naming the op.

**Entry applied.** `registerDeclaredOps(rows)` and `declaredFields(op)` (new `declared.mjs`; `index.mjs` merges the registered rows in `build()` before the tables freeze; B10's contract). No hand row removed; with no registration every export is byte-identical (control test). Public surface: 111 exports (two functions added).

**Flaws found in my own module and fixed (P8).** The seven R21/R52/R54/R65/R76 totality tests were red at the start (inherited reds listed as none): the registry now owes `casedetails*`, `importregrade`, `rerun*`, `taskdecide` (K4169) and DEC-381's `capturecredential*`, `declareorigin`, `projectclose`, which the tests did not name; the tests name them as still owed (`OWED_BY_FIX_ROUND` in `test/m/op-declarations/browser.mjs`, read as class (c) of R21 until the plane registers the owners' declarations), and two count pins (`>= 88` function acts) no longer pin a count.

**Found in other modules.** (1) `affordances` R57/R61 (ACT_HELP spelling) and `op-grades` R42 and R46 (MARKS over the registry's rungless acts) are red with and without my change; the op-grades pair is Wave 1's FR-03. (2) `build/modules.json` names `bio-plane/test/declared-ops.mjs` for `test-support`, which does not exist yet: `checks/format.mjs` shows 1 failure until FR-01 merges. (3) `checks/coverage.mjs` over all modules lists 7 other modules with unnamed live ids (agent-harness R17, agent-runner R36 R37 R38 R40, citation R16 to R18, installer-steps R26 R31, journey-check R19, link-sweep R13 to R15, monitoring R75 to R77): not mine.

**Tests and checks.** `node --test test/m/op-declarations/`: tests 242, pass 242, fail 0 (12 new, `declared.test.mjs`, naming R80 and R81, seen failing first). admission and op-capabilities suites: 0 fail. architecture (op-declarations): 36 product files, 255 relative imports; 0 failures. coverage (op-declarations): 78 of 78; 0 failures. ownership (tranche/T51 to job/T51/op-declarations): 0 failures. words (all modules): 0 failures. format: 1 failure, test-support's missing file above.

Size (session_01Wn8nVUduH4GbFBXsW5fYy7): test runs 12, module lines 3452

## J10 · COMPLETE

B11 applied (pushed; tranche/T51 merged in): DEC-382's six owed acts (citeimported, withdrawimported, namedrequests, namedrequestset, sweepset, sweepratify) are in OWED_BY_FIX_ROUND. op-declarations tests 242, pass 242, fail 0; architecture, coverage (op-declarations ids all named), words, ownership: 0 failures. R80 and R81 lines are still BOB's to add (J9). Size (session_01Wn8nVUduH4GbFBXsW5fYy7): test runs 14, module lines 3452

## J11 · COMPLETE

B12 applied (pushed; tranche/T51 merged in). OWED_BY_FIX_ROUND (test/m/op-declarations/browser.mjs) is now derived from the registry's own owed rows: every owed act that is no op, no browser act (R76) and no installer route, so no hand list; an act leaves it when it becomes an op. t50's R73 gap check reads it (the gaps are the browser acts plus that list). op-declarations tests 242, pass 242, fail 0; architecture, coverage, words (all modules), ownership, format: 0 failures. Size (session_01Wn8nVUduH4GbFBXsW5fYy7): test runs 17, module lines 3452

## J12 · REPORT

Found in another module (citation), not worked here (never change another module).

`citation`'s `DECLARED_OPS.citeimported` (bio-plane/src/citation/index.mjs, line ~1134, T51 FR-35) is a mutating op with no `needs`, so `registerDeclaredOps` refuses it: `op-declarations: citeimported: NEEDS_MISSING (R80)`. R80 requires `needs` on a mutating op that has no hand row, and `citeimported` has none (it is declared-only). Reproduce: `registerDeclaredOps` over every owner's `DECLARED_OPS` (the collector `declaredOpsOf`, test-support R16) throws on this row.

Effect today: the plane cannot register every owner's declarations at start-up, and no test can register all of them. My tests register only case-import's and member-roster's rows (`test/m/op-declarations/register-owners.mjs`), so this does not block op-declarations' suite (242 tests pass).

Proposed fix for citation's job (the act is a member's own contribution; its sibling member acts declare `needs: "contribute"`): add `needs` to `citeimported` (likely `"contribute"`, to be confirmed against citation R-lines and NEEDS), keeping `classes`, `machineClasses`, `mutating` and `stamps` as declared. BOB to route it to citation.

Other owners' rows were not checked beyond the first refusal; registration stops at the first.

## J13 · COMPLETE

FR-68 (op-declarations, T51 fix round): entries applied.

**Entry 1 (K3268): done.** Hand lists of case-import's ops in my tests now read the owner's `DECLARED_OPS` (registered by `test/m/op-declarations/register-owners.mjs`, R80), not a hand list:
- `t28.test.mjs` "R14, R6": the served set is the hand R14 ops, the watch ops and case-import's declared ops; a declared op no act list names is stamped by its declaration (`OP_STAMPS`); the act lists name the rest. Control added: an op in no table and no declaration (`importnosuchop`) is no spec, no session set, gate `machine`.
- `t31.test.mjs` "R16, R6": same reading for the act and BY lists (declared-only ops excluded, their stamps read from the declaration).
Both failed before (`importregrade: no spec`, the list diffs); they pass with the four new ops (importregrade, rerunstart, rerunpair, rerunread).

**Entry 2 (R73, R21): done.** `registryActGaps` in t50 "R73, R21": `expertisewithdraw` is declared by member-roster (R79, merged), so it is no gap. t50 now reads the owed acts its registered owners declare (`OWED_NOW`) instead of the registry's owed list. Same cause in t33 "R19, R6" and t46 "R51, R6" (`membership: expertisewithdraw has no spec`), which now register member-roster's rows; t33 "R19, R4, R5, R30" and t46 "R52" read the declared ops as declared (their hand expectations are unchanged).

**Requirement line** (K4210): `build/requirements/op-declarations.md` Status line amended (no requirement's meaning changed). Ownership reports that file as outside my paths; B13 accepts that at my merge.

**Deferred / found elsewhere**
- citation: `citeimported`'s declared row has no `needs` and R80 refuses it, so the plane cannot register every owner's declarations. Reported in a separate REPORT; not worked here. My tests register only case-import's and member-roster's rows until it is fixed, and the owner-wide collector (test-support `declaredOpsOf`) is not used in my tests for that reason.
- Process-check findings in other modules (not mine): coverage (agent-harness R17, agent-runner R37/R38/R40, installer-steps R26/R31, journey-check R19, link-sweep R13–R15); words (op-grades testcopy, strength inline). None in op-declarations.

**Tests and checks run**
- `node --test test/m/op-declarations/*.test.mjs` (bio-plane): 242 tests, 242 pass (before the fix: 5 failing).
- `node checks/format.mjs` (via checks/run.mjs): 175 modules, 0 failures.
- `node checks/run.mjs /home/user/bio`: architecture 0 failures; words: 16 failures, none in op-declarations (op-grades, strength); coverage: 6235 of 6245 ids named, 5 failures, none in op-declarations.
- `node checks/ownership.mjs /home/user/bio op-declarations tranche/T51 job/T51/op-declarations`: 8 files changed; 1 failure, the requirements file (accepted at merge per B13).

Commit `9747460e05` pushed to `job/T51/op-declarations`.

Size (session_017CpAHUqZY2t5XBCS52jgiU): test runs 7, module lines 3452

## J14 · BLOCKED

Cause: context (reading). Stopping before any change; nothing is edited or committed beyond the start.

**Done so far (this session, depth 2)**
- Attached civicos-process; read roles/JOB.md whole. Merged `origin/tranche/T51` into `job/T51/op-declarations` (the prior job head `e158183a040` is kept in its history); `mail start` recorded (`fdefb24683`).
- Installed `node_modules` for every tracked lockfile directory that lacked one (K4113).
- Baseline, `node --test test/m/op-declarations/*.test.mjs`: two reds, both caused by owners that now declare ops my tests do not register:
  - `t23.test.mjs` "R10, R6 (N506, K1207)": link-sweep's map serves `sweepset` and `sweepratify`, which link-sweep now declares (`link-sweep/index.mjs` ~98–102) but which have no spec here.
  - `t33.test.mjs` "R19, R6": `tasks: taskdecide has no spec`. tasks declares `taskdecide` (`tasks/index.mjs` ~1275), not registered in my tests.

**Findings for B14 (register every owner)**
- `declaredOpsOf` (test-support, `bio-plane/test/declared-ops.mjs`) collects 378 ops across all owners, no duplicates.
- Registering all of them is refused by one owner: `link-sweep`, `sweepset: NEEDS_MISSING (R80)`. A probe that registers each owner alone found no other refusal. This is link-sweep's defect (a mutating op with no `needs`); it goes to BOB as a REPORT, not worked here.
- Plan for the next session: `register-owners.mjs` registers every owner except link-sweep (via `declaredOpsOf`, root `../../../..` from the test directory); `t23`'s R10 test reads link-sweep's served list from its map and treats an op with no spec as owed (`OWED_BY_FIX_ROUND` from `browser.mjs`) rather than hand-listing `["sweeps"]`. Check whether the architecture check accepts the test importing test-support (B14: REPORT to add `test-support` to uses if not).

**Finding for B15 (standardinforce)**
- `standardinforce` has a hand row at `src/op-declarations/index.mjs:1211` (classes admin, member, probe; not mutating). `standards` also declares it (`standards/index.mjs` ~2827). Neither `SESSION_OPS.member` nor `SESSION_OPS.admin` holds it. Registration does not merge a hand-held op (R80), so the fix is a hand entry in both session lists beside its siblings, with a control test. The `STANDARDS_READS` list is at `index.mjs:1968`, and the session composition starts around `index.mjs:2182`.

**Reading disclosure (the reason for this BLOCKED)**
- `build/requirements/op-declarations.md`: read lines 1–176 of 375 only (the Read tool truncated the page). Lines 177–375 are unread.
- `src/op-declarations/index.mjs` (2,919 lines): read by excerpt only (grep and targeted ranges). Not read whole.
- `t23.test.mjs`: read in part. `t33.test.mjs`: read in part.
- Under JOB.md I may not act on partial reads, so the next session reads these whole before editing.

**Next step:** a fresh job session reads requirements, `index.mjs` and the two tests whole, then applies B14 (register owners, link-sweep excluded and reported) and B15 (both session sets, with control), reruns the suite, checks, and posts COMPLETE.

Size: not yet measured; no module code changed.

## J15 · REPORT

Three things in other modules, found while doing B14, B15 and B17 (op-declarations #30):

1. **Architecture edge (B14).** `register-owners.mjs` now registers every owner through test-support's `declaredOpsOf`; the architecture check refuses it: `bio-plane/test/m/op-declarations/register-owners.mjs imports bio-plane/test/declared-ops.mjs of test-support, which op-declarations does not declare in uses`. Please add `test-support` to op-declarations' `uses` in `build/modules.json` (the requirements' Uses line already names it, tests only). Every owner registers without a refusal (link-sweep's `needs: "contribute"` is merged); no owner is excluded.
2. **B17 (`export` in `SESSION_OPS.admin`) turns admission's tests red, and it does not yet let the founder take a copy.** Admission answers a session's call to `export` `ROOT_OF_TRUST_REQUIRED` (C-38.4) before it reads the session sets. Its tests pin that: `admission.test.mjs` R8 (:42, :48), the order test (:66–70, :209), R14 and `invariants.test.mjs` (:22, :26) use `export` as the op a session cannot reach; `control-plane` R28 (the gates' order) goes red with it. Admission's job must change its gate and re-pin those tests (use `purge` or `instancegroupseed` as the unreachable op); I changed only the tables, as B17 says. Without the change in admission the founder's button is drawn and the call is refused.
3. **screens-investigate R51 (standardinforce).** With B15 the shell now draws `standardinforce`, but `test/m/screens-investigate/standard.test.mjs:89` ("a date sends standardinforce with the declared fields") fails on a field `op: 'standardinforce'` in the sent fields, which is that module's own test and drawing, not a table of mine. The 12 reds in `interface-shell`, the others in `screens-*` and the 20 in `control-plane`/8 in `plane` are the same with and without my changes (checked by reverting `index.mjs`), apart from item 2.

## J16 · COMPLETE

**Entries applied (OP-DECLARATIONS #30; B13 entries 1 and 2, B14, B15, B17; B16 sets the order).**

1. **K3268 / B14: every owner registered, no hand list.** `test/m/op-declarations/register-owners.mjs` now registers every owner's `DECLARED_OPS` through test-support's `declaredOpsOf` (378 ops, no duplicate, link-sweep included, none excluded). Because registration is asynchronous, `browser.mjs` (which reads `OPS` as it is evaluated) imports it first. `t23`'s R10 test reads link-sweep's served list from its map (`sweeps` is R10's hand row, `sweepset` and `sweepratify` its declarations). The totality tests (`t34`, `t46`, `t47`, `t48`) read the owed acts an owner declares as served, from `browser.mjs`' `OWED_SERVED_BY_OWNERS` (derived from the registry file and the registered declarations, never listed); `t48`'s fresh-process count compares the child's ops with this process's and requires the difference to be declarations. `t28`'s two tests (case-import's four new ops `importregrade`, `rerunstart`, `rerunpair`, `rerunread`) are green, with the control that an op in no table and no declaration is refused.
2. **R73 (R21) `registryActGaps` on `expertisewithdraw`:** green by the declaration (member-roster R79 merged and registered); no change needed.
3. **B15 / R82:** `standardinforce` is in `SESSION_OPS.member` and `SESSION_OPS.admin` (a hand entry beside its siblings, since a hand-held op keeps its hand row, R80; its spec, stamps and `NEEDS` row are what standards declares, and a test reads them from the declaration); named in `ACT_HELP_ABSENT`'s read ground until `ACT_HELP` holds a text (R34). Test and controls: `t51` R82 (written first, seen failing).
4. **B17 / R83:** `export` is in `SESSION_OPS.admin` only. A session reaches a mutating op, so it needs a `NEEDS` row: `null`, composed as a third part of the table (`composeNeeds(hand, family, founderRows)`, refusing an overlap; `FOUNDER_SESSION_NEEDS`), which `op-capabilities` could hold instead if BOB prefers (its module, not touched). Test and controls: `t51` R83 (written first, seen failing); `tables.test.mjs` R3 and `t49` pins updated (the founder's set adds `export`; 881 NEEDS keys).

**Requirement lines for BOB (written in `build/requirements/op-declarations.md`, the ownership listing of that file accepted at the merge):** the Status line; **R82** (`standardinforce`, amends R18); **R83** (`export`, amends R3, with a sentence in R3's third part); a Uses line for `test-support` (`declaredOpsOf`, tests only; a new `modules.json` edge, BOB's, see the REPORT).

**Deferred / found in other modules:** see the REPORT (the architecture edge for `test-support`; admission's gate and tests for `export`; screens-investigate's R51 test).

**Tests and checks run**
- `node --test test/m/op-declarations/*.test.mjs` (bio-plane): tests 244, pass 244, fail 0 (before: 2 red at START; B14's registration first turned 6 red until the totality tests read the declarations).
- Dependent modules, same with and without my changes except `export`: `affordances` 280/280, `corpus-export` 27/27; `admission` 55/58 (the 3 are B17's `export`, REPORT 2); `control-plane` 303/324 (20 are the tranche's, 1 is B17's R28); `plane` 258/266 (the tranche's); `interface-shell` 223/235 (the tranche's).
- From the process repository: `node checks/format.mjs /home/user/bio`: 175 modules, 0 failures. `checks/coverage.mjs /home/user/bio op-declarations`: 82 of 82 live requirement ids named, 0 failures. `checks/words.mjs /home/user/bio op-declarations`: 0 failures (the product-wide run shows 27 words failures, all in op-grades, strength). `checks/architecture.mjs /home/user/bio op-declarations`: 1 failure, the missing `test-support` edge (REPORT 1). `checks/ownership.mjs /home/user/bio op-declarations tranche/T51 job/T51/op-declarations`: 14 files changed, 1 failure, the requirements file (accepted at the merge, B13).

Size (session_01FT9GgSLGmUqkGFtMCTxFqA): test runs 24, module lines 3458

## J17 · BLOCKED

BLOCKED. Cause: context (reading). Stopping before any change; nothing is edited.

**Done this session (depth 2, session_01EXU2JECeQbjRAzyd8tuBGX)**
- Attached civicos-process; read roles/JOB.md whole; read the job record and the inbox. The remote record was ahead of my local copy (J16, handled B17); B18 was the only unread entry.
- Checked out `job/T51/op-declarations` at its remote head and merged `tranche/T51` into it (a fast-forward to `1f82676f5d`). Recorded the start with `mail start` (`0248aae58a`).
- Located the code for B18, by grep only (not yet read whole):
  - `ACT_HELP_ABSENT`: `src/op-declarations/index.mjs:2643`; `strengthbarset` is named at `:2649`, and the 69 design ops are named in the same groups.
  - `OP_ALIASES`: `src/op-declarations/index.mjs:94`; `strengthbarset: "strengthbar"` at `:99`.
  - The R34 partition test: `test/m/op-declarations/t36.test.mjs:299`. It already reads `explained()` from `test/m/op-declarations/help.mjs`, which reads affordances' `ACT_HELP`; the hand list is the `ACT_HELP_ABSENT` groups.
  - Affordances' `T51_DESIGN_OPS` is at `bio-plane/src/affordances/act-help.mjs:42`, and `ACT_HELP` at `:230`.
- Read whole: `build/requirements/op-declarations.md` lines 1–175 of 380.

**Not yet read whole (the reason for this BLOCKED)**
- `build/requirements/op-declarations.md` lines 176–380 (includes R21's alias list and R34's text).
- `src/op-declarations/index.mjs` (about 2,900 lines; I have only grepped it).
- `src/affordances/act-help.mjs` (231 lines), `test/m/op-declarations/t34.test.mjs` (R21 alias tests), `test/m/op-declarations/t36.test.mjs` (R34 partition test).
My context is past the half-window line; reading these now would not fit, so I stop here (JOB.md, step 1).

**Next step for a fresh session**
1. Read whole: requirements 176–380; `index.mjs`; `act-help.mjs`; `t34.test.mjs`; `t36.test.mjs`.
2. Install `node_modules` where a tracked lockfile lacks one (K4113).
3. Entry 1 (B18 (1)): drop from `ACT_HELP_ABSENT`'s grounds the 69 ops affordances now holds in `ACT_HELP` (its `T51_DESIGN_OPS`, plus `accountdrafts` and `accountpropose`). Make the partition test read affordances' `ACT_HELP` (the `explained()` path), never a hand list. Write the test first and see it fail.
4. Entry 2 (B18 (2)): remove `strengthbarset` from `OP_ALIASES` and from R21's list (26 aliases). A test with a control.
5. Run the suite, `checks/run.mjs`, the ownership check; post COMPLETE with the requirement lines for BOB (R21 and R34 amended).

No requirement line has been written yet. The record's cursor is B17; B18 is not yet handled.

## J18 · COMPLETE

COMPLETE (OP-DECLARATIONS #32, session_01GykvWFgopputGrmd98pLi2, depth 2; B18 and B19 applied). Branch `job/T51/op-declarations` at `16fdb2832e`, tranche/T51 merged in (`7fa81cd685`).

**Entries applied**
1. R34 partition (B18 (1)): `ACT_HELP_ABSENT` no longer names the 53 ops affordances' `ACT_HELP` holds (its `T51_DESIGN_OPS`, `accountdrafts`, `accountpropose`, and `standardinforce`, `sweeps` it already held; B18 said 69, 16 of those were in no ground here). `test/m/op-declarations/help.mjs` reads `ACT_HELP` alone: the K4070 word fallback is gone. A new t36 test reads affordances' exported `T51_DESIGN_OPS` and its `ACT_HELP` (no hand list, K3268) and fails if any op both explained and named; its control is `projectownervotes`, still named. The five R34 reds (t36, t41, t42, t50 R75, t51 R82) are cleared; t46 and t50's controls now use `stepcreate`, an op still unexplained (the old controls were ops affordances now explains).
2. R21 (B18 (2)): `strengthbarset` is out of `OP_ALIASES` (26 aliases) and out of the alias ground. Nothing else changed in the table. A new t34 test pins the 26, the op served by strength's own declaration, its spec, `NEEDS` (`publish`), stamps (`author`, `viewer`; `identity` by the act list) and the grounds.

**Why strengthbarset is a family op here (a judgement, B18 did not say it).** Without the alias, R80 refused strength's registration of `strengthbarset` (`NEEDS_MISSING`: a mutating op with no hand row must carry `needs`, and strength's `DECLARED_OPS` row gives none; `op-capabilities` holds a hand row for `strengthbar` only). To keep what the alias gave it (capability `publish`, the `author` stamp, `DECLARATION_ACTIONS`) I put it in a `strength` family with the existing kind `publishgate` and added it to `DECLARATION_ACTIONS`. When strength's row gives `needs: "publish"` this family entry can go (R81 will then compare the two).

**Requirement lines for BOB**
- R21: add "(T51 K4254) `strengthbarset` is no alias: strength declares it itself (`reasoned`); the alias table holds 26 aliases." Test: the alias count and the op's spec, `NEEDS` and stamps; control: the remaining aliases stay aliases.
- R34: add "(T51 K4254) R34 is read against `ACT_HELP` as affordances' T51 job holds it: the 53 ops of its `T51_DESIGN_OPS`, `accountdrafts`, `accountpropose` (and `standardinforce`, `sweeps`) leave their grounds; the partition tests read `ACT_HELP`, not a list. `strengthbarset` is named under the last ground until `ACT_HELP` holds it."
- R3 (counts only): the family part of `NEEDS` is 531 rows, aliases 26, hand 323, founder 1: still 881.

**Deferred:** none.

**Found in other modules (REPORT)**
1. `strength` (src/strength/index.mjs:1683): its ops map serves the arm `strengthbar`, not `strengthbarset`, while `DECLARED_OPS` names `strengthbarset` and `screens-settings` sends it. With the alias gone no arm of strength serves `strengthbarset`, so R6 (no spec without a handler) is not met until strength serves it (an arm calling `strengthBarSet` with `author: q("author")`). I cannot see the door's routing from my module; control-plane/plane should be told if it routed the alias to the `strengthbar` arm.
2. `strength` DECLARED_OPS `strengthbarset` gives no `needs` (see above); it should say `"publish"`.
3. `affordances` (src/affordances/act-help.mjs:196): the text is held under `strengthbar` keyed `act.strengthbarset.does`; `strengthbarset` itself has no `ACT_HELP` entry, so it sits under `ACT_HELP_ABSENT.unexplained` here. Holding it under `strengthbarset` (the word exists) lets it leave.
4. The L11-wide run shows one words failure naming op-grades (`test/m/op-grades/t37.test.mjs:32` testcopy), none naming mine. Other coverage failures in the run belong to agent-harness, agent-runner, installer-steps, journey-check, screens-inquiry.

**Tests and checks** (from `bio-plane`): `node --test test/m/op-declarations/*.test.mjs`: tests 246, pass 246, fail 0 (before: 244 tests, 5 failing). Process repo: `format.mjs`: 175 modules, 0 failures; `architecture.mjs op-declarations`: 0 failures; `coverage.mjs op-declarations`: 82 of 82 live ids named; `words.mjs op-declarations`: 0 failures; `ownership.mjs ... tranche/T51 job/T51/op-declarations`: 9 files changed, 0 failures; `run.mjs` format and architecture 0 failures, no finding in my module; `setup-words/build.mjs --check`: "words-unreviewed.json is stale or absent" (expected; no refusal naming my module). My layer's tests (manifest) are not named beyond the module's suite.

Size (session_01GykvWFgopputGrmd98pLi2): test runs 9, module lines 3464

## J19 · COMPLETE

COMPLETE for B20 (K4262), with B21 read (route taken; job started at depth 2 under session session_01Uihot6oAdmTPVZ9YVwa3Rs).

**Entries applied.** B20: `strengthbarset` leaves the unexplained ground in `ACT_HELP_ABSENT`; `strengthbar` takes it (the design gives it no text and no screen sends it). Header comment of the table records it (K4262, B20).

**Test changed.** `t34.test.mjs` R21 test (K4254) asserted `strengthbarset` sits under `unexplained`; that is superseded by B20. It now asserts `strengthbarset` is explained by `ACT_HELP` (through `help.mjs`) and under no ground, and `strengthbar` is explained by none and under `unexplained`. This is the test that went red after the entry, and it is the same check, not a weakened one.

**Reds before the fix (seen):** R34 member partition; R34 `T51_DESIGN_OPS` check; R47/R34 N862; R75. **After:** 246 of 246 pass.

**Requirement lines.** None changed. R21 (line 99) and R34 do not name the ground of `strengthbarset`, so no BOB line is needed.

**Deferred.** None.

**Other modules (P9), found by the checks, not in this job's files:**
- coverage: agent-harness R17; agent-runner R37, R38, R40; installer-steps R26, R31; journey-check R19; screens-inquiry R110, R119; screens-intake R53 are named by no test.
- words: op-grades `bio-plane/test/m/op-grades/t37.test.mjs:32` (testcopy, translation-directed).

**Checks run.**
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0; words 1 failure (op-grades, not this module); coverage 6 failures (other modules, listed above). Op-declarations files: 0 findings.
- `node checks/ownership.mjs /home/user/bio op-declarations tranche/T51 job/T51/op-declarations`: 3 files changed by op-declarations, 0 failures.
- Suite: `node --test "test/m/op-declarations/**/*.test.mjs"` in `bio-plane`: 246 pass, 0 fail.

**Git.** The B21 route kept the stale commit on `stale/op-declarations-local`. Pushed as `12dabe5943` on `job/T51/op-declarations`.

**Size (session_01Uihot6oAdmTPVZ9YVwa3Rs): test runs 4, module lines 3466.**

## J20 · REPORT

Cause 1 (moneysets) is done and committed on job/T51/op-declarations (f94ce2b1b1). Two things in other modules, reported:

1. `affordances` test `bio-plane/test/m/affordances/t33.test.mjs:189` (R12, R24) is red on the tranche with my change. Its line 195 asserts `unaccounted(table)` has no `unpublished` op, and `moneysets` (a money read, now declared by money's family) is reported as unpublished. The affordances' table is affordances' own file, so I changed nothing there. Needs the affordances owner: publish `moneysets` in its read table, or ground it there.

2. `op=inbox` is still served (control-plane DO_PATH maps it to `inboxlist`); the `inbox` hand row stays as it is on tranche/T51. See my QUESTION on cause 2.

## J21 · QUESTION

Cause 2 (the inbox list): I did not make the rename in BOB's START, because it breaks the route and two invariants. Best reading and what I did:

What I tried: rename my hand row `inbox` to `inboxlist`, add `inbox → inboxlist` to OP_ALIASES, and rename the session-set names to match.
What broke, seen in the suites and checks:
- `op=inbox` answered UNKNOWN_OP (control-plane inbox-door tests, 2 failing). The plane checks the op name against OPS before its DO_PATH maps it, so the hand row (or an alias) must keep the name `inbox`.
- Six alias tests (op-declarations t34, t37, t46, t52, t54, t65) require every alias to be a registry function act (R21). The registry has no `inbox` act, only the screen `inbox`, so the alias fails them.
- Renaming the hand row to `inboxlist` with no alias makes doorbell's test ops.test.mjs:25 a `handlist` red in the words check, because `inboxlist` is then an op of this module's hand table and not doorbell's.

What is on tranche/T51 now (my branch leaves it as it was): the `inbox` hand row and the `inbox` session-set names, unchanged. Doorbell's `inboxlist` declaration is an owner declaration and still joins OPS.

Options:
(a) Keep as is (recommended). The route works, every check is clean, and doorbell's `inboxlist` stays its own declaration. Cost: the name `inbox` stays a hand row, not a doorbell declaration.
(b) Rename to `inboxlist` and add `inbox → inboxlist` as an alias. That needs R21 amended to say the plane's route aliases may name a route rather than a registry act, a requirement change for BOB to write, and the words red in doorbell's test to be resolved there.

Please answer (a) or (b). I will not change cause 2 until then.

## J22 · QUESTION

Re B24 (scanmirror) and B25 (remindersfor): I merged tranche/T51 and did NOT spec them, because the owners' own declarations conflict with a family spec, and I need your call. Nothing is committed for them.

What I found:
- file-safety declares `scanmirror` (DECLARED_OPS) as classes admin and member, mutating, stamps viewer. A family entry (`scanmirror: "admin"`, as `securitytooladd` has) fails R81: "file-safety's row differs from the hand row on stamps". Its declared row also reads admin and member, though your entry says an administrator's act.
- action-clocks declares `remindersfor` as classes admin and member, a read, with no probe. A family read gives admin, member and probe, so R81 fails on classes.
- Both ops are served by their owners, so the owners' declarations are the spec (R80). Only the hand-listed tests (t36:136, which expects 23 file-safety ops, and t45:221) need them, and they are red on tranche/T51 too.
- Under a full registration (the plane's start-up), 22 member ops have no affordances text and no ACT_HELP_ABSENT ground (R34), among them scanmirror and remindersfor. Grounding them here would hide a gap in affordances' explanations, so I did not do it. The list: expertisewithdraw declareorigin origins capturecredentialsupply capturecredentialwithdraw inboxlist scanmirror transcriptions progressions citeimported withdrawimported contradictionflag projectclose importregrade rerunstart rerunpair rerunread casedetailsset casedetails remindersfor namedrequestset namedrequests sweepset sweepratify taskdecide. Also `capturecredentiallist` is in the member set with no spec, which looks like a defect of its own.

Options for scanmirror (file-safety):
(a) Keep the owner's declaration as it is, and have the tests register owners (`register-owners.mjs`) so the spec comes from file-safety. Recommended. Cost: the registered partition (R34) then shows the 22 gaps above.
(b) Amend file-safety's declaration to admin only, then add the family entry. This is a file-safety change, so it goes to file-safety's owner.

Options for remindersfor (action-clocks):
(a) The same as (a) above (register owners). Recommended.
(b) Amend action-clocks' declaration to admin, member and probe, then add the family read.

Please pick (a) or (b) for each. I will not change either until then. `inboxlist` (cause 2) is still waiting on your answer to my first QUESTION.

## J23 · BLOCKED

Cause: tests. Stopping after three attempts on the reds below (JOB: BLOCKED, cause tests).

Done since B26 (ANSWER to J21: cause 2 dropped, kept as is; COMPLETE says so):
- scanmirror (file-safety) and remindersfor (action-clocks) are specced by their owners' declarations (R80). Nothing of mine is needed for the spec itself: the family entry I tried fails R81 (see J22).
- Full op-declarations suite: 240 of 242 pass. The two reds are both about the owners' ops being in the test world:
  1. `t36.test.mjs:135` (R32, R6): file-safety now serves 24 ops, not 23, and the test hand-lists the 23 with their sets and stamps. Adding scanmirror to that list moved the failure to `t36:149` (R32, R2–R4 spec) and `t36:192` (stamps: 19 driven, not 18). Both assume an op outside the family is an op the hand list can state, which scanmirror's owner row does not match.
  2. `t45.test.mjs:221` (R49, R6): `action-clocks: remindersfor has no spec`. The test is not registration-aware. Registering owners (`register-owners.mjs`) fixes it, but then `t36.test.mjs:303` (R34, the affordances partition) lists 22 member ops with no affordances text and no ACT_HELP_ABSENT ground: expertisewithdraw, declareorigin, origins, capturecredentialsupply, capturecredentiallist, capturecredentialwithdraw, inboxlist, scanmirror, transcriptions, progressions, citeimported, withdrawimported, contradictionflag, projectclose, importregrade, rerunstart, rerunpair, rerunread, casedetailsset, casedetails, remindersfor, namedrequestset, namedrequests, sweepset, sweepratify, taskdecide.

What is left, and needs BOB's direction (a test-policy call, P17 for you to rule):
- Ground those 22 under `unexplained` (the mechanism for ops the design has not yet explained) and name the affordances job for their text, or
- Leave them red until affordances explains them.
- Accept scanmirror's owner row (admin and member) as the test's model, and let t36's R32 table, stamps and family check follow it.
I did not choose: each is a visible policy change, and I will not hide 22 gaps by grounding them without your word.

Also still open: `capturecredentiallist` is in the member set with no spec under registration (a defect of its own, not in my list of grounds). Pending CHANGEs: officeconfirm (entities) and captureseenin (capture R101) when you tell me they merge.

Current state on job/T51/op-declarations: no uncommitted changes; tranche merged at 83c57d7; checks format, architecture, words clean; coverage: 6502 of 6514 ids named (the 8 failing modules are other modules). Waiting on BOB.

## J24 · COMPLETE

COMPLETE for the causes open now (fix round 3, op-declarations). Branch job/T51/op-declarations at 856fc95a97, tranche/T51 merged at 83c57d7.

Met:
- Cause 1, `moneysets` (MONEY #6; R17, R19, R20): money's family read; spec, NEEDS null, both session sets; test fix3.test.mjs names R17, R19, R20 (negative control: moneyrecord needs contribute); t49's NEEDS counts moved by one.
- Cause 3, the owners' declarations (K4208, K4371, K4372): `scanmirror` (file-safety R49) and `remindersfor` (action-clocks R26) are specced by their owners' rows (R80). No family entry for either (B27). t36 and t45 read the registered owners (R80, K3268): t36's file-safety expectation includes scanmirror (both sets, no family, admin and member); t45 needs nothing more.
Not made:
- Cause 2, the inbox rename: dropped as B26 answered (keep the `inbox` hand row and its session-set names; R21 unchanged).

Reports and deferred (not changed here):
- The 22 member ops with no affordances text and no ACT_HELP_ABSENT ground (t36:306, R34 partition under registration): affordances' gap, going to AFFORDANCES #41 (B27); not grounded here. This is the one red in the suite: t36.test.mjs:306.
- `capturecredentiallist` is in the member set with no spec under registration; its owner is capture-sources (ops.mjs). REPORT to BOB: the spec belongs to capture-sources.
- affordances' t33 R12 R24 (moneysets unpublished): reported in J20; BOB sent it to an AFFORDANCES job.

Waiting: `officeconfirm` (entities) and `captureseenin` (capture R101, B23) — specced when their owners merge into tranche/T51 and BOB says so.

Tests and checks at 856fc95a97:
- node --test bio-plane/test/m/op-declarations/: 247 tests, 246 pass, 1 fail (t36:306, affordances' gap above).
- checks/run.mjs: format 0, architecture 0, words 0 (handlist 0), coverage for this module 82 of 82 ids; ownership: 4 files between tranche/T51 and HEAD, 0 failures.

Size (session_01G3X5QPGSsvGq7xCMfaNpTz): test runs 22, module lines 3466

## J25 · REPORT

capturecredentiallist is in the member session set with no spec under registration; its owner is capture-sources (src/capture-sources/ops.mjs declares it). Not grounded or specced here; the spec belongs to capture-sources (B27: REPORT and you place it).

## J26 · QUESTION

Re B28 (K4378). Items 1, 3 and 4 are in place: t36 and t45 register the owners (856fc95a97); the 22 ops stay red, named at t36.test.mjs:303 for AFFORDANCES #41; capturecredentiallist is named in my COMPLETE and REPORT (served by capture-sources; capture-sources declares it at src/capture-sources/ops.mjs:30). Item 2 is NOT done. t36's R32 table is still a hand list: the op names and each op's sets, stamps and needs are written out (not counted), so the spec comparison is not read from the owners' rows for the family's ops. Only scanmirror's row is read from file-safety's declaration.

The family ops have no declared row; their shape is the family's kind (READ, SIGHT, ADMIN_ACT, WAKE). Two options, my reading is (a):
(a) Derive the op names from keysOf(fileSafetyOps) and the family kinds from OP_FAMILIES['file-safety'], and read each declared op's row from its owner's DECLARED_OPS. The kind shapes (READ, SIGHT, ADMIN_ACT) remain in the test as the model of each kind, not as a list of ops. This is about a day of test rewrite across four tests.
(b) Keep the per-op table and say so in the ruling: a hand list of the family's op names is the test's own model of R32, and K3268 does not cover op names owned by this module's family table.
I will not start the rewrite until you pick (a) or (b).

## J27 · REPORT

Re B29: capturecredentiallist has its spec under registration; my earlier 'no spec' was a misreading. Checked under register-owners: OPS holds it (classes admin and member, machineClasses [], mutating false), SESSION_OPS.member and .admin hold it, NEEDS is null. What is missing is affordances' text: it is not in ACT_HELP and in no ACT_HELP_ABSENT ground, so it is one of the 22 in t36.test.mjs:303 (the R34 partition), which B28 holds for AFFORDANCES #41. Nothing for this module to fix; the owner's declaration (capture-sources/ops.mjs:30) is correct. The t42 'named, no spec' result I saw earlier came from my own grounding of it in an unregistered test world, which I reverted.

## J28 · REPORT

Re B31: merged tranche/T51 with AFFORDANCES #41 (51d3838b3c). t36.test.mjs:306 now names capturecredentiallist only (the partition's one op with no text and no ground); not grounded. One change in my module: moneysets leaves my ACT_HELP_ABSENT read ground, since affordances now explains it (the t36:332 and t50 checks named it). Suite: 233 tests, 232 pass, 1 fail (t36:306). Checks: format, architecture, words clean; ownership 0 failures.

## J29 · REPORT

Re B32: merged tranche/T51 (43975005c1, pushed). captureseenin is declared by capture's DECLARED_OPS and needs no spec here; my tests read it as they read scanmirror's. Nothing to change in this module.

My suite, 247 tests: 241 pass, 6 fail. Tip (origin/tranche/T51, without my branch) fails 8 of 246: t33:290, t34:177, t36:135, t45:221, t46:303, t47:292, t48:186, t50:391. My branch fixes t33:290, t36:135 and t45:221 and fails none that the tip does not. The six on my branch: t34:177, t46:303, t47:292, t48:186, t50:391 (R21 and R52–R73 registry-act tests, red on tip; registerimport and the registry's acts, not this module's table) and t36:306 (capturecredentiallist, the one partition op with no text and no ground, per B31).

Checks: format clean; ownership 0 failures; words: 3 failures, all in op-grades (t33.mjs:214, t51.mjs:41 and :45: moneysets' and scanmirror's descriptions copied into op-grades as plain text), not op-declarations; architecture: plane t47.test.mjs imports screens-wizards, which plane does not declare (not this module); coverage: 8 modules red (not op-declarations, which is 82 of 82 per the last run).

Waiting on officeconfirm (ENTITIES) to merge.

## J30 · QUESTION

Re B33 (K4394): the five registry tests (t34:177, t46:303, t47:292, t48:186, t50:391) now read the pinned registry (78fe6f5757): a fixture copied from 43379a1a44, its sha256 checked against SCREEN_REGISTRY_SOURCE (bef84cf1…). Their hand claims cannot stay unchanged under it. Each test lists the same nine acts that the pinned registry does not hold: alertconnect, registerask, registerlist, registermatch, registerrowcite, registersearch, registerwatch, registerwatchpropose and registerwatchstop. They come from the registers screen (DEC-406/407), which is in the live registry and not at 43379a1a44. Under the pinned registry those five tests are red by exactly those nine names (t50 too).

Two options. My recommendation is (a).
(a) Take the nine names out of the five claim lists, since the product serves the pinned registry and does not serve the registers screen yet. Their claims about the pinned registry then hold. The live design re-adds them when wizard-scripts re-pins.
(b) Keep the claims and read the live file. This is what B33 asked me to stop doing; it reddens on every design merge.
I will not change the claim lists until you pick. Current state: 233 tests, 227 pass, 6 red: those five, and t36:306 (capturecredentiallist, per B31).

## J31 · COMPLETE

COMPLETE (the causes open now; officeconfirm still to come). Branch job/T51/op-declarations at 85497751a9; tranche/T51 merged at 1bf20ebc72 (B32).

Met since the last COMPLETE:
- B32 (captureseenin): declared by capture's own declarations; my tests read it as scanmirror's. No spec here.
- B33/B34 (K4394, K4399): every test that read the design's live docs/development/ux-substrate/screens/registry.json now reads the pinned registry: test/m/op-declarations/fixtures/registry-43379a1a44.json (sha256 bef84cf1…, the one wizard-scripts pins). Read by browser.mjs, t34, t37, t38, t46, t47, t48, t51. The nine register acts the live registry adds (DEC-406/407) are out of the claim lists.

Deferred / reports:
- t36.test.mjs:306 (R34 partition): capturecredentiallist has no affordances text and no ground. Its spec is capture-sources' declaration (ops.mjs:30), correct. Named as accepted in B28, for AFFORDANCES #41, which does not yet hold it (B31). Not grounded here.
- Not this module, reported earlier: op-grades words findings (t33.mjs:214, t51.mjs:41 and :45); plane t47.test.mjs architecture (screens-wizards); eight modules' coverage on the tranche tip.

Tests and checks at 85497751a9:
- node --test bio-plane/test/m/op-declarations/: 240 tests, 239 pass, 1 fail (t36:306 above). The test count moved between runs (233 to 247); I have not confirmed the loader reads the same set each time.
- checks: format 0; architecture: the plane's t47 (not this module); words: op-grades' three, not this module; coverage for this module: 82 of 82; ownership: 0 failures.

Size (session_01G3X5QPGSsvGq7xCMfaNpTz): test runs 30, module lines 3466

## J32 · COMPLETE

COMPLETE (officeconfirm, B35). Branch job/T51/op-declarations at 46ef08d518; tranche/T51 merged (46ef08d518).

- officeconfirm (entities R62/R64; ENTITIES #18): specced from its owner's declaration (entities DECLARED_OPS), as scanmirror was (K4376). Under registration: classes admin, member, probe; not machine; mutating; stamps viewer and by; NEEDS null; both session sets. No spec or table row in this module. No test change.
- capturecredentiallist: stays red by name at t36.test.mjs:306 (K4381), accepted.

Tests: node --test bio-plane/test/m/op-declarations/: 247 tests, 246 pass, 1 fail (t36:306).
Checks: coverage 82 of 82 for this module; ownership 0 failures; format clean; words and architecture findings are in other modules (op-grades; plane t47), as before.

Note for BOB: owner-declared mutating ops officeconfirm and scanmirror carry NEEDS null (the owner's needs: null). This is the owner's declaration, taken as is (R80); flagging only.

Size (session_01G3X5QPGSsvGq7xCMfaNpTz): test runs 34, module lines 3466

## J33 · COMPLETE

Applied B36 (the R34 partition red, found by BOB's whole-suite run). Pushed at 1993156d7b; tranche/T51 merged in first.

**Change.**
- `bio-plane/src/op-declarations/index.mjs:2679`: `owedwork` added to the `read` ground's list, between `overridesof` and `partiesof` (sorted).
- `bio-plane/src/op-declarations/index.mjs:2649-2651`: one sentence in that block's comment naming it (T51 fix round 4b, plane R77, K4524).
- `bio-plane/test/m/op-declarations/t42.test.mjs:1`: `import "./register-owners.mjs";` before the module import. Reason: R47 (t42) requires every named op to be held by OPS. `owedwork` is plane's declared op (plane `declared.mjs:16`), which reaches OPS only through the owners' registration; t42 did not register the owners, so the newly named op had no spec there. The other suites that check the partition (t23, t31, t36, ...) already import register-owners. This adds the registration; no assertion was loosened.

**Red then green.**
- Before the change: `node --test --test-force-exit bio-plane/test/m/op-declarations/` failed on t36, "member ops with no text and no ground: owedwork".
- After the ground change alone: t42 R47 failed, "owedwork: named, no spec" (the registration gap above).
- After the t42 import: 247 tests, 247 pass, 0 fail.

**Checks.**
- `node /home/user/civicos-process/checks/run.mjs /home/user/bio`: format 176 modules, 0 failures; architecture 0 failures; coverage 6605 of 6605 live ids, 0 failures; channels 0 failures; words 0 failures (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0).
- `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio op-declarations tranche/T51 job/T51/op-declarations`: 3 files changed by op-declarations (index.mjs, t42.test.mjs, the record), 0 failures.

**Deferred.** Nothing.

**Found in other modules.** None.

**Notes.** My first `mail start` pull hit a rebase conflict on the record: my local commit carried a stale status line (`handled B12`). I skipped that local commit (it was never pushed), then re-ran `mail start`, which recorded this session at `handled B35`. The branch was fast-forwarded to origin before my work.

Size (session_01UtphkgeNiefrhZDFoSHZ1a): test runs 3, module lines 3468

## G53 · fix round 6 (START B37; OP-DECLARATIONS #36)

Entry G53 (`build/plan/fix-round-6-T51.md`), owner op-declarations. tranche/T51 merged in first. No op's accepted keys changed; no src file changed.

**Change (tests only).**
- `bio-plane/test/m/op-declarations/fixtures/registry-f72b2f8a4c.json`: new, byte-equal to `docs/development/ux-substrate/screens/registry.json` at `f72b2f8a4c` and on the tranche. The old fixture `registry-43379a1a44.json` stays.
- `browser.mjs:29-47`: the derivation reads both fixtures through one function (`owedActs`, `notBuilt`): `OWED_BY_FIX_ROUND` is now derived from the new fixture (read by t50 R73, which runs over `SCREEN_REGISTRY`); `OWED_BY_FIX_ROUND_AT_43379A1A44` keeps the old derivation (empty today) for the tests written against the old registry. Never a hand list (K3268).
- t34, t37, t38, t46, t47, t48, t51: import `OWED_BY_FIX_ROUND_AT_43379A1A44` (they read the old fixture). Why: with the new list alone, their R21/R76 totality tests went red (7 reds: they subtract `OWED_BY_FIX_ROUND` from registries that do not hold the T52 acts); named per BOB's note 2.

**The derived `OWED_BY_FIX_ROUND` gains exactly the T52 acts, 19 distinct names on 31 owed rows (BOB's "31" counts rows):** alertconnect, exploreall, explorecontinue, explorepath, exploreshorter, followfrom (7 rows), installcheck, registerask, registerdelta, registerfilter, registerlist, registermatch, registerpreread, registerpropose, registerrowcite, registersearch (7 rows), registerwatch, registerwatchpropose, registerwatchstop. None is in `OPS` as built; none is a browser act or installer route (the derivation's own filter would have dropped it).

**Red then green (t50 R73).** In a scratch regeneration (never committed; `registry.json` copied over `wizard-scripts/source/registry.json`, `SOURCES.registry.commit` set to `f72b2f8a4c`, `build-data.mjs` run; reverted after each run): before my change t50 R73 red, "gaps" listing installcheck, followfrom, registersearch and the others; after: t50 18 of 18 pass, and the whole suite per file 247 of 247 pass against the re-taken registry. (A single whole-directory run in the scratch tree stopped at 232 tests with no failure and no error, a runner quirk; per-file runs total 247.)

**On this branch, until wizard-scripts (44a) merges:** the generated `screen-registry.mjs` is still at `43379a1a44`, so t50 R73 is red by name here ("R73, R21 ... every act of the registry has a declaration": the T52 acts are not yet in `SCREEN_REGISTRY`); the other 246 pass. It goes green when wizard-scripts' re-take merges (verified in the scratch tree).

**Checks.** `checks/run.mjs`: format 0, architecture 0, coverage 6686 of 6686, channels 0; words 1 failure, the accepted `inline 1` at `case-checker/spec.mjs:11` (none in op-declarations). `checks/ownership.mjs op-declarations tranche/T51 job/T51/op-declarations`: 0 failures.

**Deferred.** Nothing. **Found in other modules.** None.

Size (session_015mbjCf96bpaBuNz4yP3orh): test runs 9, module lines 3468

## J34 · COMPLETE

Entry G53 (`build/plan/fix-round-6-T51.md`), owner op-declarations. tranche/T51 merged in first. No op's accepted keys changed; no src file changed.

**Change (tests only).**
- `bio-plane/test/m/op-declarations/fixtures/registry-f72b2f8a4c.json`: new, byte-equal to `docs/development/ux-substrate/screens/registry.json` at `f72b2f8a4c` and on the tranche. The old fixture `registry-43379a1a44.json` stays.
- `browser.mjs:29-47`: the derivation reads both fixtures through one function (`owedActs`, `notBuilt`): `OWED_BY_FIX_ROUND` is now derived from the new fixture (read by t50 R73, which runs over `SCREEN_REGISTRY`); `OWED_BY_FIX_ROUND_AT_43379A1A44` keeps the old derivation (empty today) for the tests written against the old registry. Never a hand list (K3268).
- t34, t37, t38, t46, t47, t48, t51: import `OWED_BY_FIX_ROUND_AT_43379A1A44` (they read the old fixture). Why: with the new list alone, their R21/R76 totality tests went red (7 reds: they subtract `OWED_BY_FIX_ROUND` from registries that do not hold the T52 acts); named per BOB's note 2.

**The derived `OWED_BY_FIX_ROUND` gains exactly the T52 acts, 19 distinct names on 31 owed rows (BOB's "31" counts rows):** alertconnect, exploreall, explorecontinue, explorepath, exploreshorter, followfrom (7 rows), installcheck, registerask, registerdelta, registerfilter, registerlist, registermatch, registerpreread, registerpropose, registerrowcite, registersearch (7 rows), registerwatch, registerwatchpropose, registerwatchstop. None is in `OPS` as built; none is a browser act or installer route (the derivation's own filter would have dropped it).

**Red then green (t50 R73).** In a scratch regeneration (never committed; `registry.json` copied over `wizard-scripts/source/registry.json`, `SOURCES.registry.commit` set to `f72b2f8a4c`, `build-data.mjs` run; reverted after each run): before my change t50 R73 red, "gaps" listing installcheck, followfrom, registersearch and the others; after: t50 18 of 18 pass, and the whole suite per file 247 of 247 pass against the re-taken registry. (A single whole-directory run in the scratch tree stopped at 232 tests with no failure and no error, a runner quirk; per-file runs total 247.)

**On this branch, until wizard-scripts (44a) merges:** the generated `screen-registry.mjs` is still at `43379a1a44`, so t50 R73 is red by name here ("R73, R21 ... every act of the registry has a declaration": the T52 acts are not yet in `SCREEN_REGISTRY`); the other 246 pass. It goes green when wizard-scripts' re-take merges (verified in the scratch tree).

**Checks.** `checks/run.mjs`: format 0, architecture 0, coverage 6686 of 6686, channels 0; words 1 failure, the accepted `inline 1` at `case-checker/spec.mjs:11` (none in op-declarations). `checks/ownership.mjs op-declarations tranche/T51 job/T51/op-declarations`: 0 failures.

**Deferred.** Nothing. **Found in other modules.** None.

Size (session_015mbjCf96bpaBuNz4yP3orh): test runs 9, module lines 3468

## G55 · fix round 6 (CHANGE B38; OP-DECLARATIONS #36)

Entry G55 (`build/plan/fix-round-6-T51.md`), my part: the declaration of `moneyingestread`. tranche/T51 merged in first.

**Change.**
- `bio-plane/src/op-declarations/index.mjs` calculations family (beside `moneyingest`, :301): `moneyingestread: "read"`. Its spec is the family's read (admin, member, probe; not mutating), NEEDS a present null, in both session sets, the viewer stamped from the query (the family's actor); `ingest`, `kind`, `after` and `limit` are request fields the door passes as given, no stamp.
- **Which list:** `moneyingest` is named at :2718 in `ACT_HELP_ABSENT.unexplained` (an act with no explanation). A read joins the `read` ground of the same table, as `owedwork` did (alphabetical, between `moneydetectors` and `moneyjunction`); I added one sentence to the block's comment naming it. `moneyingest` stays under `unexplained`.
- `t49.test.mjs`: the counted totals gain the one row (family rows 533, NEEDS keys 882).
- `t51.test.mjs`: new test "R19, R2, R3, R4, R34 (T51 fix round 6, G55; K4208)" for the op and controls.
- **No other op changes its keys or spec** (K4208): `moneyingest` and every other op unchanged.

**Seam, red by name until calculations merges:** `t33.test.mjs:290` (R19, R6) fails with `calculations: moneyingestread` served by no owner map, because calculations' ops map does not serve it yet. In a scratch edit (reverted) adding `moneyingestread` to calculations' map made R6 pass; the same scratch showed R4 needs the owner to read `viewer` from the query, as the plan says the act's visibility does. Also red by name: `t50.test.mjs` R73 (G53, until wizard-scripts merges, as in the section above). `declared.test.mjs`, the R3/R4 tests of t33, t34, t36, t42, t45, t49 and t51 pass; there is no `owners.test.mjs`.

**Checks.** `checks/run.mjs`: format 0, architecture 0, coverage 6686 of 6686 (0), channels 0; words 1 failure, the accepted `inline 1` at `case-checker/spec.mjs:11`. `checks/ownership.mjs op-declarations tranche/T51 job/T51/op-declarations`: 0 failures. Suite per file: every file passes but t33 (the seam above) and t50 (G53).

**Deferred.** Nothing. **Found in other modules.** None. Op-grades must grade `moneyingestread` (the plan names it).

Size (session_015mbjCf96bpaBuNz4yP3orh): test runs 14, module lines 3470

## J35 · COMPLETE

Entry G55 (`build/plan/fix-round-6-T51.md`), my part: the declaration of `moneyingestread`. tranche/T51 merged in first.

**Change.**
- `bio-plane/src/op-declarations/index.mjs` calculations family (beside `moneyingest`, :301): `moneyingestread: "read"`. Its spec is the family's read (admin, member, probe; not mutating), NEEDS a present null, in both session sets, the viewer stamped from the query (the family's actor); `ingest`, `kind`, `after` and `limit` are request fields the door passes as given, no stamp.
- **Which list:** `moneyingest` is named at :2718 in `ACT_HELP_ABSENT.unexplained` (an act with no explanation). A read joins the `read` ground of the same table, as `owedwork` did (alphabetical, between `moneydetectors` and `moneyjunction`); I added one sentence to the block's comment naming it. `moneyingest` stays under `unexplained`.
- `t49.test.mjs`: the counted totals gain the one row (family rows 533, NEEDS keys 882).
- `t51.test.mjs`: new test "R19, R2, R3, R4, R34 (T51 fix round 6, G55; K4208)" for the op and controls.
- **No other op changes its keys or spec** (K4208): `moneyingest` and every other op unchanged.

**Seam, red by name until calculations merges:** `t33.test.mjs:290` (R19, R6) fails with `calculations: moneyingestread` served by no owner map, because calculations' ops map does not serve it yet. In a scratch edit (reverted) adding `moneyingestread` to calculations' map made R6 pass; the same scratch showed R4 needs the owner to read `viewer` from the query, as the plan says the act's visibility does. Also red by name: `t50.test.mjs` R73 (G53, until wizard-scripts merges, as in the section above). `declared.test.mjs`, the R3/R4 tests of t33, t34, t36, t42, t45, t49 and t51 pass; there is no `owners.test.mjs`.

**Checks.** `checks/run.mjs`: format 0, architecture 0, coverage 6686 of 6686 (0), channels 0; words 1 failure, the accepted `inline 1` at `case-checker/spec.mjs:11`. `checks/ownership.mjs op-declarations tranche/T51 job/T51/op-declarations`: 0 failures. Suite per file: every file passes but t33 (the seam above) and t50 (G53).

**Deferred.** Nothing. **Found in other modules.** None. Op-grades must grade `moneyingestread` (the plan names it).

Size (session_015mbjCf96bpaBuNz4yP3orh): test runs 14, module lines 3470

## G54 seam · CHANGE B39 (OP-DECLARATIONS #36)

tranche/T51 merged. `t33.test.mjs:99`: `recordcasefile` (publication R15, G54; a store-internal hop reachable from no op) joins `IN_PROCESS.publication` beside `recordcasemanifest`. t33 R19/R6 now fails only on `calculations: moneyingestread`, served by no owner map until CALCULATIONS #9 merges (red by name). No src change; no op's keys change.

Size (session_015mbjCf96bpaBuNz4yP3orh): test runs 3, module lines 0 (tests only)

## J36 · COMPLETE

tranche/T51 merged. `t33.test.mjs:99`: `recordcasefile` (publication R15, G54; a store-internal hop reachable from no op) joins `IN_PROCESS.publication` beside `recordcasemanifest`. t33 R19/R6 now fails only on `calculations: moneyingestread`, served by no owner map until CALCULATIONS #9 merges (red by name). No src change; no op's keys change.

Size (session_015mbjCf96bpaBuNz4yP3orh): test runs 3, module lines 0 (tests only)

## J37 · REPORT

Fix round 10 (B40), op-declarations: two of the three tranche reds are fixed in my module; the remaining two are in affordances' ACT_HELP, which is not mine.

**Cause 1, `t33.test.mjs:290` (R19, R6).** The family check treated every op an owner's map serves as a family op. answers serves `ruleservicesstate` from its own DECLARED_OPS row (R80, ANSWERS #15), so it is an owner-declared op, served by its own row, and no family op. Fixed in the test: the check excludes the owner's registered declarations. The same test also had three stale SERVED_ELSEWHERE entries, `capturerequestplatformmark`, `capturerequestplatformunmark` and `capturerequestplatformhosts`; capture-requests now serves all three from its own map (`src/capture-requests/index.mjs:1923-1925`) and control-plane has no arm for them, so I dropped them. Test-only change; no source change.
Why the tests missed it: the declaration is new this round (R80, ANSWERS #15), so no test had yet seen an owner-declared op on a new module's map. The check also stops at its first failing assertion, so the stale entries below it were not reached until the answers line passed.
Ruled out: a family kind for `ruleservicesstate`. `read` (admin, member, probe) disagrees with the owner's classes; `ownread` disagrees on `machineClasses` (the owner's row has no such key). A declared op needs no family kind, so the family edit is reverted.

**Cause 2, `t36.test.mjs:306` (R34) and `t42.test.mjs:129` (R47, R34).** The member ops `authority` (provenance R80) and `ruleservicesstate` (answers) have no ACT_HELP text and are in no ACT_HELP_ABSENT ground. op-declarations derives both correctly: an owner's declared op joins the session sets as its row says (R80). The gap is in affordances' tables, which I have not touched. Fix: AFFORDANCES #48 (the CHANGE already posted). Once it merges, merge `tranche/T51` and re-run.
Why the tests missed it: R34 reads affordances' tables; nothing in op-declarations can see the unexplained ops, only affordances' own check can.

**Result.** Module suite 246 of 248 pass; the two reds are cause 2 and nothing else. format, architecture, coverage, words, fixtures and ownership: 0 failures. Commit `c5b53c6757`, pushed.

Found in another module: affordances `ACT_HELP` / `ACT_HELP_ABSENT` lack `authority` and `ruleservicesstate` (above).

---
_Generated by [Claude Code](https://claude.ai/code)_

## J38 · BLOCKED

Blocked on tests. Two tests are red and their cause is in affordances (see the REPORT above): `t36.test.mjs:306` and `t42.test.mjs:129`, both on `authority` and `ruleservicesstate` with no ACT_HELP text and no ACT_HELP_ABSENT ground. Everything in op-declarations is done. Suite 246 of 248; checks clean.

Waiting on AFFORDANCES #48 to merge. Then I merge `tranche/T51`, re-run the module suite (expect 248 of 248), and post COMPLETE with the Size line: test runs 8, module lines 7 (session session_01PfsuZ6j8UCFgigeTRxA37x).

---
_Generated by [Claude Code](https://claude.ai/code)_
