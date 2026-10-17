# op-declarations (T50)

**Status** · session_013AaS71xBPWBv4QrWrZjCWX · depth 2 · COMPLETE · handled B2

## Completion · T50-24 op-declarations (R73, R74, R75)

**Entries applied.**
- R73: the 15 new ops declared in a new `t50.mjs` (`T50_SHARES`, `T50_FAMILIES`), merged by `index.mjs`' `family()` as `t49.mjs`' are: `following` (`watchitem` own; `secondlook`, `secondlookclear` member), `membership` (`lookedat`), `acquisition` (`opencaptures`), `project-roster` (`projectstakeset` owners; `projectstake`, `projectownersgone`), `retrieval` (`browse`), `capture` (`capturegrade`), `inquiry` (`inquirypartition`), `filings` (`stakeatpreparation`), and two new families, `action-records` (`actionstake`, `actioninquiry`; `author` stamped) and `progressions` (`instances`). `lookedat` and `opencaptures` carry `by` as an extra stamp (reads). Each is in both session sets, `NEEDS` from its kind (15 new family rows; the hand-written rows of `op-capabilities` are untouched, R3's control).
- R74: `inboxpull` and `inboxresolve` join `CAPTURE_VIEWER_ACTIONS` (viewer stamped by the door; their specs unchanged; `inboxpull` stays in `CAPTURE_MEMBER_ACTIONS`, `inboxresolve`'s `by` stays the door's own body stamp). `timeline`'s `captures`, `entitycreate`'s `forum_kind`, `acquire`'s `for`, `airunopen`'s `project` and `airuntick`'s `read` gain no table row; the new `t50.test.mjs` pins each field at its owner's map (query first, then body for `captures`).
- R75: `reauth`, `aliaswithdraw`, `factconfirm`, `projectrequest`, `projectrequestwithdraw`, `projectrequestanswer` leave `ACT_HELP_ABSENT`; the nine R73 reads (`lookedat`, `opencaptures`, `projectstake`, `projectownersgone`, `browse`, `capturegrade`, `inquirypartition`, `instances`, `stakeatpreparation`) enter its read ground, sorted.
- Existing tests re-pinned for the new facts (no test weakened): `t33` (families, `NO_VIEWER` for `lookedat`/`opencaptures`), `t34`/`t37`/`t38`/`t46`/`t47`/`t48` (R21's owed acts: the five T49 left out and `aliaswithdraw` are declared, the installer's four own routes owed with no spec), `t45` (the T50 share in the families' kinds), `t47` (`reauth` out of R54's last-ground list), `t49` (R3's counts: 515 family rows, 865 keys), `tables` (`CAPTURE_VIEWER_ACTIONS`). Words by key (plan rule 6) do not arise: the module holds no member-facing English.

**Accepted red, a dependency not yet built (named).** Four tests in this module are red until `affordances`' T50-19 job merges `ACT_HELP`'s texts for the 12 ops (R64, R65, R66): `t36` "R34 (affordances R48): every op in SESSION_OPS.member …", `t42` "R47, R34 …", and `t50`'s "R73, R34 …" and "R75 …". Checked by simulation: with `ACT_HELP` plus those 12 keys no member op is unnamed or both explained and named. 

**Deferred.** None in this module.

**Found in other modules (REPORT to BOB).**
1. `screens-action`: its R1–R6 test ("each screen's acts are exactly its registry acts") goes red on this merge: the registry's `start-send` screen owes `actionstake`, now a declared op, and the screen offers no send for it (`actioninquiry` is in its entry, N1093; `actionstake` is not named in its START).
2. The registry also owes the installer's four own routes (`installupdate`, `installalongside`, `installremove`, `installremoveconfirm`; K3471, installer R62): no plane op, so no spec here (R6); R21's tests name them. Nothing to declare unless BOB wants them as ops.
3. `progressions` is not in this module's `uses` in `build/modules.json`; `t50.test.mjs` imports `progressionOps` for `instances`' totality (R6) and the architecture check passes (0 failures), but R73's Uses line asks BOB to add the edge: BOB's to record.
4. Inherited reds of modules that use this one, equal with and without my change: admission 1, op-grades 2 (R42), affordances 6, interface-shell 2, answer-envelope 3, control-plane 1, plane 8, store-door 1, screens-daily 1, screens-settings 6, screens-entry 1, screens-wizards 2, screens-inquiry 1, screens-investigate 3, screens-publish 1; wizard-scripts, op-capabilities, queue, screens-intake 0. The one difference is `screens-action` (item 1).

**Tests and checks.**
- `node --test bio-plane/test/m/op-declarations/`: tests 216, pass 212, fail 4 (the four above, all `ACT_HELP` texts). Before this job (baseline on `tranche/T50`): tests 200, pass 191, fail 9 (R6/R21 tests red for the 15 undeclared ops and the registry's owed acts).
- `node checks/run.mjs ../bio` (process repository): format 171 modules, 170 requirements files; 0 failures · architecture 3486 product files, 10855 relative imports; 0 failures · coverage: `op-declarations` 74 of 74 live requirement ids named by a test (25 failures are other modules') · channels 0 failures.
- `node checks/ownership.mjs ../bio op-declarations tranche/T50`: 0 failures.

Size (session_013AaS71xBPWBv4QrWrZjCWX): test runs 24, module lines 3,225

## J1 · COMPLETE

COMPLETE (T50-24 op-declarations; details in my record, "Completion"):
- R73: the 15 new ops declared (t50.mjs, two new families action-records and progressions); R74: inboxpull and inboxresolve viewer-stamped (CAPTURE_VIEWER_ACTIONS), the owners' new fields pinned at their maps, no table row; R75: six ops leave ACT_HELP_ABSENT, nine reads enter its read ground.
- Module tests: 216, 212 pass, 4 red, all waiting on affordances T50-19 merging ACT_HELP's 12 texts (t36 R34 partition, t42 R47/R34, t50 R73/R34 and R75); simulated green with those keys. Baseline was 9 red. Checks: format, architecture, ownership 0 failures; coverage 74 of 74 for this module.
- REPORT: (1) screens-action's R1-R6 test goes red on this merge: the registry's start-send screen owes actionstake, now declared, and its job's START does not name it. (2) The registry owes the installer's four own routes (installupdate, installalongside, installremove, installremoveconfirm): no plane op, no spec; R21's tests name them. (3) progressions is not in my modules.json uses; my t50 test imports progressionOps (architecture passes); the edge is yours to record. (4) Users' tests (admission, op-grades, affordances, interface-shell, answer-envelope, control-plane, plane, store-door, screens-*): same failures with and without my change but screens-action's.

## Completion · B2 CHANGE (wizard-scripts merged)
Merged `tranche/T50`. Added a test in `t50.test.mjs` calling wizard-scripts' `registryActGaps` over `SCREEN_REGISTRY` with the declared ops (the installer's four routes excluded by `INSTALLER_ROUTES`): no gaps; a withdrawn op is found. Module tests: 217, pass 213, fail 4 (the same four, waiting on affordances' `ACT_HELP` texts). Size (session_013AaS71xBPWBv4QrWrZjCWX): test runs 26, module lines 3,225

## J2 · COMPLETE

COMPLETE (B2): merged tranche/T50; t50.test.mjs now calls registryActGaps over SCREEN_REGISTRY (no gaps, installer routes excluded). Module tests 217, 213 pass, 4 red, all waiting on affordances T50-19's ACT_HELP texts. Unchanged otherwise; see my record.

## Completion · B3 CHANGE (screens-investigate K3774)
Merged `tranche/T50` (affordances and queue in). `themeread` added to both session sets (`instances` was already in both, from R73); test added in `t50.test.mjs`. Module tests: 218, pass 218, fail 0 (the four ACT_HELP reds cleared by affordances' merge). format, architecture, coverage (74 of 74) 0 failures. Size (session_013AaS71xBPWBv4QrWrZjCWX): test runs 29, module lines 3,228
