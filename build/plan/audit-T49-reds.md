# T49 reds audit (before L11 closes)

Run: every module's tests from `build/modules.json` (the `module-tests.mjs` method, spec reporter, one `node --test` per module) over `tranche/T49` while it moved from `d3cc9c3861` to `8e54420656` (K3384–K3391), 2026-10-15. agent-runner, sheet-worker and journey-check got `npm ci --ignore-scripts` first. The tree was left clean.
**Totals:** 170 modules, 143 green and 27 red, with 51 failing tests. Of those, 30 are accepted by name, 21 are not (12 causes). The `capture-requests`, `agent-worker` REC100 and `control-plane` reds of rule 5 (7) (A) and K3382 are now green.
"Since" was found by running the tests in a worktree at each first-parent merge.

| module | test file | test (short) | accepted by | since | cause | fix owner | T49 job? |
|---|---|---|---|---|---|---|---|
| bundler | system/fleetbundles | agent-worker's 28 inputs pin; plane bundle staleness (4 arms) | rule 5 (9) K3353 (N1107); rule 5 (5) | K3353; any merge | pin; stale bundle | bundler; layer close | no; — |
| membership | module-order (×5) | R83 ×3, R140, R145 MODULE_ORDER | rule 5 (10) K3368 (N1115) | 53e43fa722 | setup-words moved first in L11; MODULE_ORDER is a hand copy | membership | no (L2 closed) |
| membership | t9-notice-sight-bounds | R79 listeners in MODULE_ORDER | NOT by name (same cause as 5 (10)) | 53e43fa722 | same | membership (N1115) | no |
| promotion | m/promotion/registry | R39/R45/R46 total order | NOT by name (same cause) | 53e43fa722 | same | membership (N1115) | no |
| promotion | system/row-census | R50 pin (23 admission rows C-29/32/38/64/78) | rule 5 (2) | admission merges | L11 rows await T50's stamp | promotion | T50 stamp |
| store-door | promotion-step | R5 rank (wizard-scripts before the step) | NOT by name (same cause) | 53e43fa722 | `STEP_ORDER` is built from the stale MODULE_ORDER | membership (N1115) | no |
| plane | store.test | R2/R10 step rank | K3380 (rule 5 (10)) | 53e43fa722 | same | membership (N1115) | — |
| store-door | routes | R15 `reauthdue` | **NOT** | 576bcd9fe1 (credentials T49-3) | test's `login({password})` sends no handle; R75 no longer reads `role`, so SIGN_IN_REFUSED | store-door (test only) | no |
| project-roster | owner-votes | R30 pending-change order | **NOT** | intermittent (1 of the full run, 0 of 30 alone) | `ORDER BY MIN(created), kind` ties within one ms, so `add` sorts before `remove` | project-roster (order by insertion/rowid) | no (L2 closed) |
| ai-accounts | t41 | R10… negative control GROUP_KEY_NOTICE_DUE | **NOT** | 18ebe893ae (K3374, DEC-260) | DEC-260 keyed `refusal.GROUP_KEY_NOTICE_DUE` with the row's text; the "not in words.json" control is stale | ai-accounts | no |
| local-facts | t46 | R16 C-126 rows by key | **NOT** | 18ebe893ae | DEC-260 keyed 7 more C-126 refusals; the module and test still pin the old split | local-facts | no |
| standards | t46 | R55 control MACHINE_CANNOT_DECLARE_STANDARD | **NOT** | 18ebe893ae | same (DEC-260 keyed it) | standards | no |
| reading-guides | t46-words | R14 GUIDE_CARRIES_CONDUCT | **NOT** | 18ebe893ae | same | reading-guides | no |
| case-account | t46 | R16 ACCOUNT_CITES_COUNSEL_MATTER | **NOT** | 18ebe893ae | same | case-account | no |
| action-grammar | t46-words | R26 C-117.58 MACHINE_CANNOT_SET_COPIED | **NOT** | 18ebe893ae | same | action-grammar | no |
| action-replies | t46 | R7 AROSE_FROM_REFUSED | **NOT** | 18ebe893ae | same | action-replies | no |
| filings | t46 | R52 `filings.review_copy.no_embargo` | **NOT** | 18ebe893ae | same (filings key now in words.json) | filings | no |
| action-plans | t46 | R47 C-124 rows by key | **NOT** | 18ebe893ae | same | action-plans | no |
| filing-templates | r33 | R33 RFC_QUOTING_MISSING withdrawn | K3381 (N1130) | 18ebe893ae | DEC-260 re-holds the key | filing-templates | no |
| notice-producers | duties (2), investigation, words (2) | R20 R5 overdue, R22 undetermined, R17 milestone-overdue, R16/R17, R20 verbatim | **NOT** | 1100a91b10 (PR #39 fa3c8b7e8e; DEC-247–258); duties R20 R5 since 152ffcd0d9 (DEC-268–270) | its verbatim copies of words lag words.json ("Possibly overdue"→"Its date may have passed", "Overdue"→"Past its date"), so **members see the old wording** (the K3350 duties pattern) | notice-producers (L11) | no |
| affordances | t36 | R48 ACT_HELP = design @f498560a37 | **NOT** | b4ffe43e7b/c08bfce43d (rows after DEC-263–267) | DEC-263 re-worded `act.plansubjectadd.does` ("subject"→"matter"); the test still pins the f498560a37 text | affordances (re-pin) | **yes** (AFFORDANCES #34) |
| affordances | t36 | R62 design reads list | **NOT** | cea7683708 (DEC-263–267) | `words-reads.json` gives affordances 60 `act.*.name`/prompt keys (DEC-264); ACT_HELP reads `.does` only | affordances (N1125) | yes (DEC-264 itself is N1125, T50) |
| op-declarations | t46, t48 | R52, R65 R21 registry function acts | **NOT** | cea7683708 (DEC-263–267) | the live registry has 120 function acts, pinned 119; re-pinned to 120 both pass (verified) | op-declarations | **yes** (OP-DECLARATIONS #24) |
| instance-setup | recovery | R66 `recover({role})` | K3337/K3338 (N1103) | 576bcd9fe1 | R75 reads no role | instance-setup | no |
| scheduler | plane | R12 expiry wake | K3363/K3364 (N1113) | before T49 | instance-setup's tick clock | instance-setup | no |
| answer-envelope | families; catalogue-end (2) | R15; R7/R13 pins | K3379; K3382 (N1128) | admission's merge | admission refusals moved | answer-envelope | no |
| screens-daily | contract | R1–R13 Projects' `themeread` | K3380/K3383 (N1101) | d224e61b41 | act in the shell's interim RE_POINTS | screens-daily | — |
| screens-wizards | library | R1, R8 | K3383 (N1131) | 475a408934 | shell draws a refusal by key | screens-wizards | no |
| legacy-ui | civicos-ui ×8 | group-identity-surface, group-surface, meaning-arms, review-copy, several-cases-choice, statement-ack, progression-revision, queue-recipients | rule 5 (4) (N794, N865, N1057) | T47 | each fails at the `{role}` sign-in; the 8 are exactly N1057's 8 and include the three named files | legacy-ui | no |
| installer | newgroup-bundle-fresh; newgroup t47 R53 | committed bundle stale; R53 "civicsmith.css" in bundle | rule 5 (5) (bundle regenerated at close) | 1defbce5ee (interface-assets merge) | `dist/newgroup.bundled.mjs` lags interface-assets' new stylesheet | layer close | — |
| journey-check | journey R1 (a) | local arm step 07 "setup: claim" | **NOT** | 1f0db0e719 (screens-entry merge) | the walk's claim fills no `su-handle`; screens-entry R17/R18 now requires it (`refusal.NO_HANDLE`) | journey-check (its walk) | **yes** (JOURNEY-CHECK #4, B8 open) |

## NOT accepted: recommended action

1. **op-declarations t46 R52 and t48 R65 (count 119→120):** CHANGE to OP-DECLARATIONS #24. Re-pin both at the current registry and name the new function act. This is test only.
2. **affordances t36 R48 and R62:** CHANGE to AFFORDANCES #34. For R48, re-pin at the current design commit (or read DEC-263's word). For R62, either restrict to `.does` keys or accept R62 by name until N1125 (DEC-264, T50).
3. **journey-check local step 07:** CHANGE to JOURNEY-CHECK #4 (add to B8). The claim step fills `su-handle` with the founder's handle. This is a walk defect, not a product defect.
4. **MODULE_ORDER family (membership t9 R79, promotion registry R39, store-door promotion-step R5):** accept each by name under rule 5 (10) until N1115 (T50). Same cause as the named membership test and as plane store.test (K3380).
5. **The nine stale "words.json holds none" pins from DEC-260 (K3374)** in ai-accounts, local-facts, standards, reading-guides, case-account, action-grammar, action-replies, filings and action-plans: accept by name with a new T50 entry. Each module reads the DEC-260-keyed refusals by key and drops the stale negative controls. Fold this into N1116 ("move all the strings", which has DEC-260's keys as input). None of these modules has a T49 job.
6. **notice-producers (5): a member-visible wording drift.** Accept by name with a new T50 entry: notice-producers reads its words through setup-words' `word(key)` (N1115/N1116), as K3350 did for duties. Alternative: BOB adds an L11 notice-producers job (Haiku, wording only) if the release must show DEC-247/DEC-268 wording.
7. **store-door routes R15:** accept by name with a new T50 entry. Store-door's test signs in as `login({handle:"admin", password})` (credentials R75's transition). Test only. It could join N1084's store-door re-point.
8. **project-roster owner-votes R30 (intermittent):** accept by name with a new T50 entry. `projectOwnerVotes` orders ties of `MIN(created)` by insertion (rowid) rather than by `kind`. This is a real ordering defect within one millisecond, seen only under load.
