# member-roster (T51)

**Status** · session_013u4GnD6sY4tCk8yKGT2zGx · depth 2 · COMPLETE · handled B3

## Completion (MEMBER-ROSTER #2) · CHANGE B3 (K4036): act phrases keyed, op details to REPORT

**Entries applied (B3 (a)).** Every plain act phrase passed to `notAnAdmin`, and to `#custodialBar`, is now a `localize` id with the English unchanged: `member-roster.index.resigning_administrator_status`, `.setting_a_members_capabilities`, `.endorsing_a_proposed_administrator`, `.withdrawing_an_invitation`, `.describing_the_team`, `.adding_a_member`, `.setting_a_members_status`. The capability refusal detail `capabilities is an array` (`memberCaps`, `#doorCapabilities`) is `member-roster.index.capabilities_is_an_array`. The module holds no capability label: its capability words are identifiers (the vocabulary of R1), and their screen labels are not in `words.json` as rows, so none is keyed here. Tests that copied the act phrase or the capabilities sentence now compare with `localize` by the same ids (`not-an-admin-visibility`, `t34-joining`).

**(b).** `TARGET_NOT_AN_ADMIN`'s and `EXPERTISE_IS_NOT_ASSIGNED`'s details name ops for an API caller. They are left in source and listed in a REPORT to BOB (J3), not keyed.

**Merge.** `tranche/T51` merged into the job branch; no tranche commit touched this module, its tests, or `words-reads.json`.

**Tests.** `node --test test/m/member-roster/*.test.mjs`: 164 pass, 0 fail. **Checks.** `checks/words.mjs /home/user/bio member-roster`: 0 failures (inline 0, testcopy 0, unkeyed 0). `checks/ownership.mjs` 0 failures. `checks/format.mjs` 0 failures.

Size (session_013u4GnD6sY4tCk8yKGT2zGx): test runs 36, module lines 2580

## Completion (MEMBER-ROSTER #2) · words round RW (B2, K4015)

**Entries applied.** The four sentences the words check counted inline in `index.mjs`, each now read through `localize` with a new id and the English unchanged: `member-roster.index.this_member_has_not_declared` (`expertiseConfirm`'s NOT_DECLARED detail), `member-roster.index.a_handle_is_chosen_when_a` (`handleChange`'s HANDLE_FIXED detail), `member-roster.index.an_administrator_is_removed_by` (`memberSet`'s ADMIN_REQUIRES_VOTE detail) and `member-roster.index.choose_the_name_the_team_will` (`joinLinkInvite`'s NO_COVER detail). `node checks/words.mjs /home/user/bio member-roster`: inline 0, unkeyed 0, 0 failures.

**Tests changed (both in this module; no assertion weakened, no sentence copied).**
- `t50-words.test.mjs` (R70). Its reads-list test read `membership`'s `reads` in `words-reads.json`. DEC-345 has since given `member-roster` its own entry, which holds exactly this module's keys (`WORD_KEYS`); R70 says the list is "the reads list for it". The test now reads that entry. The governing-words note (CONSENSUS_REQUIRED, NO_COVER) stays on `membership`'s entry, where the split left it, and the test still reads it there.
- `split.test.mjs` (R75 fixture `fourAdmins`). Flaky, 1 failure in 4 full runs: `activeAdmins()` orders by creation time, then member id (R29). `third` and `fourth` created in the same millisecond sorted `fourth` first. The fixture now waits 2 ms between the two adds, so the order it asserts is the order created.

**Deferred.** None.

**Found outside this module (described, not changed; for BOB).**
1. R13 scope, for BOB to settle. Member-facing strings the checker does not count, left as `words-reads.json` marks them (`unkeyed`): the refusal detail `capabilities is an array` (`memberCaps`, `#doorCapabilities`); the details of `TARGET_NOT_AN_ADMIN` and `EXPERTISE_IS_NOT_ASSIGNED`, which name ops (`op=memberset`, `op=expertisedeclare`), so I judged them wire grammar; and the short act phrases passed to `notAnAdmin` ("setting a member's capabilities", "withdrawing an invitation", and about fifteen more). R13 says every sentence a member reads is bound. If BOB rules that these are converted, that is a follow-up in this module.
2. `bio-plane/src/setup-words/rows.mjs` and `words-unreviewed.json` are stale by the four new ids. `build.mjs --check` reports it, as B2's notes expect. BOB regenerates them at the layer close; this job did not touch them.
3. Still open from MEMBER-ROSTER #1, unchanged here: the `GENERATED_FILES` line for `member-roster/order.mjs` in `setup-words/build.mjs`; CR-4's three `*_CHECKS` exports; the op `adminremovalsopen` for `op-declarations` and `plane`.

**Merge.** `tranche/T51` (fa2770b9f6) merged into `job/T51/member-roster` (a merge, not a rebase). It changed no file of this module.

**Tests.** `node --test test/m/member-roster/*.test.mjs` in `bio-plane`: 164 tests, 164 pass. Four consecutive full runs after the fixture change, and one run on the merged tree.

**Checks.** Run from the process repository (main `e8ac153`, which carries `d424c32`):
- `checks/run.mjs /home/user/bio` (before the merge): format 0 failures; architecture 0 failures; channels 0 failures; coverage 22 failures, none in `member-roster`; words 1,626 failures, none in `member-roster`.
- After the merge: `checks/format.mjs /home/user/bio` 0 failures; `checks/words.mjs /home/user/bio member-roster` 0 failures; `checks/ownership.mjs /home/user/bio member-roster tranche/T51 job/T51/member-roster` 4 files, 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only, naming the four new ids (expected), no refusal naming this module.

Size (session_013u4GnD6sY4tCk8yKGT2zGx): test runs 30, module lines 2580

## Completion (MEMBER-ROSTER #1)

**Entries applied.** T51-145: `bio-plane/src/member-roster/` built by copy from `membership` as the split map (`build/extraction/membership-split-T51.md`) and `build/requirements/member-roster.md` say, with no edit to any `membership` file. `index.mjs` (class `Members`, `membersOf(ctx)`, `membersOps(m, url, body, env)`, the module-level `notAnAdmin`, `noSuchMember`, `listenerRefusal`, `MODULE_ORDER`, `moduleOrderFrom`, `ROOT_ADMIN`, `CAPABILITIES`, `adminMath`, and the pure viewer functions `viewerMember`, `carriedProject`, `baseViewer`), `schema.mjs` (the 11 tables, the additive columns, `MEMBER_EXEMPT_TABLES`, `MEMBER_DECLARED_TABLES`), `checks.mjs` (27 + 1 + 8 rows), `words.mjs`, `order-build.mjs` and the generated `order.mjs` (regenerated here from `modules.json`; `--check` passes). Seams as the map cuts them: (1) `reservedIdFinding()` public, no `this.core`; (2) tables, exempt list and declared rows exported from `schema.mjs`, declared by nobody here; (3) `viewerMember`/`carriedProject`/`baseViewer` pure (R73), `#insider` and `memberPairings` read them; (4) `memberList({administer, viewer, projectsOf})` (R71: called only on an administrator's roster, once per row, the founder's too; anything but a list, or a throw, reads `[]`); (5) `expertiseHolders(label)` (R72). All 75 ids R1–R75 are met; R75 `adminRemovalsOpen({by})` and its op `adminremovalsopen` (`by` the stamp) are built here, over `admin_votes`.

**`modules.json` row** (B1 note 2; K1043): set in the commit that creates the module, `paths` `["bio-plane/src/member-roster/"]`, `tests` `["bio-plane/test/m/member-roster/"]`, `uses` `["setup-words", "record-grammar"]` and nothing else in the file. `architecture` needs no further `uses` (checked with the row set).

**For BOB at the merge (generated artifacts and an earlier module's file).** (a) `setup-words/build.mjs`'s `GENERATED_FILES` gains `bio-plane/src/member-roster/order.mjs` (BOB's line, not made here). (b) `rows.mjs` and `words-unreviewed.json` are stale by this module's new `localize` ids (`member-roster.index.*`, `member-roster.order-build.*`, about 30; the ids the moved code already carried, `membership.index.*`, are kept with the same English): `build.mjs --check` reports the stale rows, as the START said to expect, and three `setup-words` tests that hold the tree to the generated list (R10, R16, R17) fail until BOB regenerates them. `setup-words` R13 and R2 and `fleetbundles` (agent-worker's bundle stale against `membership/order.mjs`) fail on `tranche/T51` without this branch too. (c) Every `membership/order.mjs`-derived bundle is unchanged by this job: `modules.json`'s ids are as they were.

**Tests.** `bio-plane/test/m/member-roster/`, 26 files, 164 tests, all pass. Moved by copy from `membership`'s (re-pointed to the module, ids renumbered to this file's, project-side arms cut): `administrators`, `capabilities-arithmetic`, `expertise`, `module-order`, `t14-rows-remedy-order`, `t19-seam` (R30/R31 only), `t34-joining`, `t34-settings`, `t40-handles`, `t46-handles-doors`, `t47-admin-handle`, `t47-r142` (part 1 = R69), `t49-founder-handle`, `t50-roster-mark`, `t50-status-since`, `not-an-admin-visibility`, `t19-enrol-boot`, `t35-words`, `t50-words`, `t47-check-tables`, `t48-home-sight`; and, beyond the map's list because ids R9–R15, R25, R26, R47 and R49 are named nowhere else: `roster` (the member-side arms of `membership`'s file, R9–R15), `t9-notice-bounds` (R25 the revocation notice and its order, R26, R47) and `t38-no-such-member` (R49). New: `split.test.mjs` (R71, R73, R74, R67, R75, each with controls). Fixture of its own (`node:sqlite`, `membersOf`, no `bundles` table, the three stand-ins). Every test that held a sentence's text now compares with `localize`/`word` (K3810); the cuts: whatever needed `bundles`, `project*`, `sight`, `inSight`, `viewerPredicate`, `positionalMember`, `notTheOwner`, `notAParticipant`, `noSuchProject`, `caseAuthority`, `projectAuthority`, `joinedParticipants`, `rescueRefusal` stays in `membership`'s suites (including `membership` R106's `checkAddressees`, which CR-4 rewrites over R72, and R85/R44/R77's arms of the moved files).

**One code, one site (read first, as the START said).** The enforcing test is `answer-envelope`'s `families.test.mjs`: it imports every file under every module's `paths` and requires every exported `*_CHECKS` table to be reached by `CHECK_FAMILY_FILES`; with my rows exported six `answer-envelope` tests failed. So `checks.mjs` exports no `*_CHECKS` name: the three tables are held together as `MEMBER_ROSTER_ROWS` (a name no census reads), `index.mjs` re-exports none, and nothing registers them; `t47-check-tables` holds that. Each row's `where` names `src/member-roster/index.mjs`. **CR-4 must** export `MEMBERSHIP_CHECKS`, `MEMBER_ID_CHECKS` and `CUSTODIAL_CHECKS` from `membership` as the union of its rows and `MEMBER_ROSTER_ROWS`' (in the same act that deletes its copies), and promotion's CR-5 stamp takes the `where` change. `conformance`, `promotion`, `file-safety`, `answer-envelope`, `translations`, `plane`, `standards`, `following`, `store-door`, `bundler` and `membership` suites pass with this branch.

**Findings for BOB (requirements are BOB's).**
1. `member-roster.md` R65 (and R43, R50's text) say "your group's Civicsmith"; the words list and the code since K3811 say "your team's Civicsmith", and the moved tests assert the key's words, so they hold. The rule R65 states is the same; its example sentences are stale.
2. R70 names `membership.remedy.*`; this module reads only `membership.remedy.active_administrator_group_confirm` (the other is `rescueRefusal`'s, `membership`'s). `WORD_KEYS` lists what is read. `words-reads.json` has no `member-roster` entry yet (the keys are on `membership`'s `reads` list); a test holds every key read to be on that list.
3. R75: the op name is `adminremovalsopen`, `by` the control plane's stamp, administrators only (a machine credential refused). `op-declarations` (T51-107) and `plane` (T51-125) must declare/route exactly that name. A removal entry needs a target whose row has role `admin` and a status other than `revoked`; a vote cast by someone who is no longer an administrator is not among `voters` or `have` (R4's own count).
4. R14/R71: `membersOps`' `memberlist` is given no `projectsOf` (this module reads no project); `membership`'s own map must replace it, as the requirement says `membership`'s `memberList` passes its own.
5. R68's phrase "exports its tables" is held back as above; if the families test is meant to see these rows from the start, the swap is CR-4's alone.
6. `answer-envelope`, `setup-words`, `fleetbundles`, `progressions` (three calendar tests) have reds on `tranche/T51` itself; none is this job's.

**Deferred.** None. Strings left in source that the words check does not count and `words-reads.json` marks `unkeyed` (a refusal's `detail`, never drawn): the short act phrases handed to `notAnAdmin` ("adding a member", "setting a member's status", ...) and the stitched details of `EXPERTISE_IS_NOT_ASSIGNED`, `TARGET_NOT_AN_ADMIN`, `NOT_DECLARED`, `ADMIN_REQUIRES_VOTE`, the join-link `NO_COVER` and `handleChange`, as in `membership`; the words check shows no finding in this module.

**Another module.** None stale or changed. `membership` is untouched (CR-4 swaps it); no bundle imports this module.

**Checks run** (process repository, pulled): `format` 175 modules, 174 requirements files, 0 failures; `architecture member-roster` 29 product files, 85 relative imports, 0 failures; `coverage member-roster` 75 of 75 live ids named by a test, 0 failures; `ownership member-roster tranche/T51 job/T51/member-roster` 34 files changed, **1 failure: `build/modules.json: outside member-roster's paths, tests and job record`**, which is the row B1's note 2 told me to set in this commit ("your row's `paths`, `tests` and `uses` and nothing else in that file"; the diff of that file is that one row); the check does not know that allowance, and every other file is the module's or its record. Drop the row from the merge if you prefer to fill it yourself (K1043), as earlier jobs left it; `node checks/run.mjs` over the repository: architecture 0 failures, format 0, channels 0, coverage 32 failures all in other modules, words 4,312 failures and none in `member-roster` (`node checks/words.mjs . member-roster`: inline 0, plain 0, testcopy 0, handlist 0, marker 0). `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note naming `member-roster.index.a_cover_is_the_label_you`, expected. `order-build.mjs --check` (both modules): matches.

Size (session_01EB1J86R5ynxpn1PTeCzuok): test runs 70, module lines 2586

## J1 · COMPLETE

member-roster T51-145 is complete: R1–R75 met, `membership` untouched. Record: build/jobs/T51/member-roster.md on job/T51/member-roster (read its Completion section: findings 1–6 and the notes for your merge).

Tests: bio-plane/test/m/member-roster/, 26 files, 164 tests, 0 fail. Checks: format 0 failures; architecture member-roster 0; coverage 75 of 75 ids named; words check 0 findings in member-roster; `setup-words build.mjs --check` shows the expected stale-rows note (new localize ids; setup-words R10, R16, R17 stay red until you regenerate; R13/R2 and fleetbundles are red on tranche/T51 already). Ownership: 1 finding, `build/modules.json`, which is the row your START note 2 told me to set (paths ["bio-plane/src/member-roster/"], tests ["bio-plane/test/m/member-roster/"], uses ["setup-words","record-grammar"]); drop it if you would rather fill it yourself. Everything else is the module's or its record.

For you at the merge: (a) setup-words/build.mjs GENERATED_FILES gains bio-plane/src/member-roster/order.mjs; (b) rows.mjs and words-unreviewed.json to regenerate; (c) op `adminremovalsopen` (R75) for op-declarations/plane; (d) CR-4 must export the three *_CHECKS tables from membership as the union with this module's MEMBER_ROSTER_ROWS: answer-envelope's families test reaches every exported *_CHECKS table of every module, so checks.mjs exports none under that name (one code, one site).

## J2 · COMPLETE

member-roster, words round RW (B2) complete. Record: build/jobs/T51/member-roster.md, section "Completion (MEMBER-ROSTER #2)" on job/T51/member-roster at ffc56dba41.

Applied: the four sentences the words check counted inline are now localize ids with the English unchanged: member-roster.index.this_member_has_not_declared, .a_handle_is_chosen_when_a, .an_administrator_is_removed_by, .choose_the_name_the_team_will. words.mjs member-roster: 0 failures.

Tests changed (mine): t50-words R70 now reads member-roster's own reads entry in words-reads.json (DEC-345 gave it one; R70 says "the reads list for it"); split.test.mjs R75 fixture waits 2 ms between admins (flaky: activeAdmins ties broken by member id). Module suite: 164 pass.

Checks: format 0; architecture 0; ownership 0 (4 files); words 0 in member-roster; run.mjs coverage 22 and words 1626, none in member-roster; setup-words build --check shows only the expected stale-rows note for the four new ids.

Merged tranche/T51 (fa2770b9f6) into the job branch. It changed nothing in this module.

For BOB: (1) R13 scope: unkeyed member-facing strings the checker does not count (capabilities is an array; op-naming details of TARGET_NOT_AN_ADMIN and EXPERTISE_IS_NOT_ASSIGNED; ~15 short act phrases to notAnAdmin). I left them as words-reads marks them; please rule. (2) rows.mjs and words-unreviewed.json to regenerate at the layer close. (3) MEMBER-ROSTER #1's open items stand (GENERATED_FILES line for order.mjs; CR-4 exports; op adminremovalsopen).

## J3 · REPORT

B3 (b): two details left in source, not keyed; each names an op for an API caller, and I judge that no member reads it. Please settle them with the design stream (K3944) and send them to the unkeyed list if so.

1. TARGET_NOT_AN_ADMIN (memberRemove's refusal; index.mjs, adminRemove): "this member is not an administrator, so there is no administrator to remove; an ordinary member is deactivated with op=memberset". Why: it answers an administrator's own vote to remove a target who is not an administrator, a case the removal screen never sends; the sentence tells the caller which op to call, so it reads as wire grammar.

2. EXPERTISE_IS_NOT_ASSIGNED (memberAdd, when expertise is passed): "expertise is declared by the member and then confirmed by an administrator (section 1.3). It is not set when the invitation is created, ... Use op=expertisedeclare and op=expertiseconfirm." Why: the invitation screens never pass expertise (section 1.3 forbids it), so only a direct API caller reaches this refusal; its last sentence names two ops, which is wire grammar.

Both refusals keep their codes and rows. Their detail is one fixed string, so keying would change nothing a member sees.
