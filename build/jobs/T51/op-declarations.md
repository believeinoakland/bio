# op-declarations (T51)

**Status** · session_01T6nKNiTXDaZwbSfpynQUSn · depth 2 · COMPLETE · handled B8

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
