# op-declarations (T51)

**Status** · session_017CpAHUqZY2t5XBCS52jgiU · depth 2 · COMPLETE · handled B12

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
