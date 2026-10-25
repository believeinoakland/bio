# member-roster (T51)

**Status** · session_017ZmLdEK9H7TnpXz4LEe9eG · depth 2 · COMPLETE · handled B8

## Completion (MEMBER-ROSTER #4) · FR-07 (B4; K4165, K4168, K4169, K4202, K4204)

**Requirement lines.** Written by me in `build/requirements/member-roster.md` (B5/B6), each marked *(not yet met: T51)*: R76 (C80), R77, R78 (C62's two reads, from the draft §4.3), R79 (`expertisewithdraw`, DEC-386; C79's behaviour), R80 (the declaration of `adminendorse`, `expertiseconfirm`, `expertisedeclare`, `memberpairingset` and the new `expertisewithdraw`), R81 (the census ops). R72 gained the founder; no other existing line changed.

**Entries applied.**
1. **C80 (R76).** Claimed, `memberFacts("admin")` answers `{cover: null, handle, role: "admin", status: "active"}` (`handle` her held one or null), `expertiseDeclare` and `expertiseConfirm` accept `memberId: "admin"`, `expertiseList` reads it, and `expertiseHolders` lists her (merged in member-id order). Unclaimed: `null` and `NO_SUCH_MEMBER`. A members row holding `admin` is read as before. Tests `t51-founder-member.test.mjs`; `t49-founder-handle.test.mjs` (R59) now expects her facts instead of `null`.
2. **C62 (R77, R78).** `endorsementsOwed({by})` and `expertiseAwaitingConfirmation({by})` as the draft states them. Answer is the plain list; `truncated` is a non-enumerable property of it, so a caller who is not an administrator gets the plain `[]`. Tests `t51-owed-reads.test.mjs`.
3. **C79 (R79).** The arm already gave "the confirmation and the declaration taken back together" for `expertiseList` (the label reads `withdrawn`, neither declared nor confirmed; `expertiseHolders` and R78 do not list it; the member may declare again), asserted in a test. One flaw found and fixed: a withdrawn label could be **confirmed again** without the member declaring it (the arm refused only a never-declared label); now `NOT_DECLARED` until she declares again.
4. **DEC-386 (R79).** `expertiseWithdraw({memberId, label, reason, by})` / `op=expertisewithdraw`: `NOT_AN_ADMIN`, `NO_SUCH_MEMBER`, `NO_REASON`, `NOT_DECLARED`, `NOT_CONFIRMED`; one `withdrawn` entry with `by` and the reason (new nullable column `member_expertise.reason`, added at boot to an older store, `schema.mjs`); history entries carry `reason` for a withdrawal only. `expertiseconfirm` keeps its `withdraw` field and answers as before (declared as accepted, R80). Tests `t51-expertise-withdraw.test.mjs`.
5. **DECLARED_OPS (R80, R81).** 20 ops, rows copied from the hand rows (`classes`, `machineClasses`, `mutating`, weight = the rung or ground, description = the `NON_ACTS` reason else the `RUNG_ABSENT` sentence, each `localize("member-roster.declared.<op>", ...)` with the English unchanged), fields read from the arms. `expertisewithdraw`: reasoned, `refusal: "NO_REASON"`, description the design's key `act.owed_expertisewithdraw.does`, `stamps: ["viewer", "by"]`, `needs: null`, classes as `expertiseconfirm`'s. Test `declared-ops.test.mjs`: `declaredOpHolds` through the ops map for each (21 tests); I also showed in a scratch run that a wrong declaration (a field required that is not, a field read that is not accepted) is rejected. Agreement checked in a scratch run: `op-grades`' and `op-declarations`' `registerDeclaredOps({"member-roster": DECLARED_OPS})` both accept it (18 agreed, `expertisewithdraw` and `invitelook` registered by op-grades).

**Readings I took (a QUESTION posted for them; change by CHANGE if you read otherwise).** (a) `expertisedeclare`: the plane stamps `memberId` into the body (control-plane/index.mjs:2879), so the declaration accepts and requires `label` only. (b) `handlecheck` requires `invite` (the only screen that sends it is the join page; a member's own check rides her `viewer` stamp). (c) `memberadd` does not accept `expertise` (the arm reads it only to refuse it, `EXPERTISE_IS_NOT_ASSIGNED`). (d) `invitelook` has no `op-grades` row: weight `read` by K4204's rule, description mine ("read: what a live invitation offers the invitee … never the member's id"). (e) `memberpairingset` requires `memberId` only (`published` absent reads false). (f) `memberFacts("admin")` has `cover: null` (she holds none). (g) `expertiseHolders` lists the founder (R76), which `membership`'s `checkAddressees` will then apply its sight rule to. (h) `adminremove` carries `refusal: "NO_REASON"`.

**Deferred.** None.

**Found in other modules (also a REPORT).**
- `membership` (composes this module since CR-4): two of its tests are red from my change, both its own to settle: `t49-founder-handle.test.mjs:33` (R68) asserts `memberFacts("admin")` is `null`; `t51-delegation.test.mjs:19` (R154) wants a same-name delegate on `Membership` for every public name of `Members`, and `expertiseWithdraw`, `endorsementsOwed`, `expertiseAwaitingConfirmation` are new. The consumers of `memberFacts` (tasks `#routeTask`, bias, credentials, actions) now see the founder as an active member when claimed: tasks routes a project she owns to her, as intended by C80, but `tasks` R1's note "earliest active administrator is the first after the founder" and its tests should be read again by that job.
- `op-grades` tests: `t41.test.mjs:24`, `t46.test.mjs:195` (handlecheck's sentence) and `t49.test.mjs:27` (founderhandleset's) copy a sentence that my `localize` calls now hold, so the words check's `testcopy` arm fails on them; they read it through `declaredSentence` (K4206's way). I may not edit them.
- Generated artifact stale: `bio-plane/src/setup-words/rows.mjs` (and `words-unreviewed.json`) gain 19 `member-roster.declared.*` ids, `member-roster.index.withdrawing_a_members_confirmed_expertise` and `member-roster.index.a_withdrawal_is_recorded_with_a`; `setup-words/build.mjs --check` was already stale from other modules.
- Hand rows that can now go (they agree with `DECLARED_OPS`): the `op-declarations` and `op-grades` rows of `adminendorse`, `adminremove`, `courtnoticeset`, `enroll`, `expertiseconfirm`, `expertisedeclare`, `founderhandleset`, `groupdescriptionset`, `handlecheck`, `hostingaccessset`, `invitewithdraw`, `joinlinkenable`, `joinlinkinvite`, `memberadd`, `membercaps`, `memberpairingset`, `memberset`, `websitekeycreate`; `invitelook` has none in `op-grades`. The routing of `expertisewithdraw` (a reason-stamped door) comes from its row alone.
- The 16 other `run.mjs` failures (coverage of `monitoring` and others, `testcopy` in `op-grades` t36/t47/t48) are not this module's.

**Tests.** `node --test bio-plane/test/m/member-roster/*.test.mjs`: 206 pass, 0 fail (29 test files; the four new files hold 42 tests; the suite held 164 before). `membership` tests 174 of 176 (the two above), `queue-producers` 117 of 117. **Checks** from the process repository: `format` 0 failures; `architecture member-roster` 0; `coverage member-roster` 81 of 81 ids named, 0 failures; `words member-roster` 0 (inline 0, testcopy 0, marker 0, missingkey 0, unkeyed 0); `ownership member-roster tranche/T51 job/T51/member-roster` 0 failures.

Size (session_01WzR28gkdxHayrjWwZ6pTwS): test runs 24, module lines 2923

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

## J4 · COMPLETE

member-roster, CHANGE B3 complete. Record: build/jobs/T51/member-roster.md, section "Completion (MEMBER-ROSTER #2) · CHANGE B3" on job/T51/member-roster at b1b70b1721.

(a) Act phrases passed to notAnAdmin and #custodialBar, and the capabilities refusal's detail, are localize ids with the English unchanged. The module holds no capability label: its capability words are identifiers, and their labels are not words.json rows, so none is keyed here. Tests that copied these sentences now compare with localize by the same ids.
(b) Two op-naming details are in a REPORT (J3), not keyed.

Tests 164 pass. words.mjs member-roster 0 failures (testcopy 0). ownership 0. format 0. Merged tranche/T51 (no tranche commit touched this module).

## J5 · QUESTION

FR-07 (B4): eight readings of mine where the rows or the arm leave a choice; I have adopted each and finished the job on it. Say CHANGE if you read any other way. Full text: build/jobs/T51/member-roster.md, "Completion (MEMBER-ROSTER #4)", "Readings I took".
(a) expertisedeclare accepts and requires `label` only: the plane stamps `memberId` into the body. (b) handlecheck requires `invite` (the join page is its only sender; a member's own check rides her viewer stamp). (c) memberadd does not accept `expertise` (the arm only refuses it). (d) invitelook has no op-grades row: weight `read` by K4204, description mine. (e) memberpairingset requires `memberId` only. (f) memberFacts("admin") answers `cover: null`. (g) expertiseHolders lists the founder once claimed, so membership's checkAddressees will apply its sight rule to `admin`. (h) the shape of C62's reads: a plain list with a non-enumerable `truncated`, `[]` for a non-administrator.

## J6 · REPORT

FR-07 found in other modules (details in my record, "Found in other modules"):
1. membership (composes this module since CR-4): t49-founder-handle.test.mjs:33 (R68) asserts memberFacts("admin") is null, now her facts; t51-delegation.test.mjs:19 (R154) wants a delegate on Membership for each new public name: expertiseWithdraw, endorsementsOwed, expertiseAwaitingConfirmation. Its other tests pass (174 of 176). Consumers of memberFacts (tasks #routeTask, bias, credentials, actions) now see the claimed founder as an active member (C80's intent); tasks R1's "earliest active administrator is the first after the founder" should be read again by that job.
2. op-grades tests t41:24, t46:195 (handlecheck) and t49:27 (founderhandleset) copy a sentence my localize calls now hold; the words check's testcopy arm fails on them. They should read it through declaredSentence (K4206).
3. Generated, stale: setup-words rows.mjs and words-unreviewed.json (19 member-roster.declared.* ids plus two member-roster.index ids); regenerate at the layer close.
4. Hand rows that can go, op-declarations and op-grades, for the 18 ops that agree: adminendorse adminremove courtnoticeset enroll expertiseconfirm expertisedeclare founderhandleset groupdescriptionset handlecheck hostingaccessset invitewithdraw joinlinkenable joinlinkinvite memberadd membercaps memberpairingset memberset websitekeycreate. expertisewithdraw and invitelook have no hand row in op-grades; expertisewithdraw has none in op-declarations either, so its routing comes from DECLARED_OPS (stamps viewer, by).

## J7 · COMPLETE

member-roster FR-07 (B4) complete. Record: build/jobs/T51/member-roster.md, section "Completion (MEMBER-ROSTER #4)" on job/T51/member-roster. Requirement lines R76 to R81 are written in build/requirements/member-roster.md, marked not yet met: T51 (B5/B6).
Applied: C80 founder is a member once claimed (R76: memberFacts, expertiseDeclare, expertiseConfirm, expertiseHolders); C62 endorsementsOwed and expertiseAwaitingConfirmation (R77, R78); C79 the withdrawal reads as DEC-376 states, plus one flaw fixed (a withdrawn label could be confirmed without a new declaration; R79); DEC-386 expertiseWithdraw / op=expertisewithdraw with the reason kept (R79); DECLARED_OPS for 20 ops, each held true by declaredOpHolds through the ops map (R80, R81).
Tests: bio-plane/test/m/member-roster, 29 files, 206 pass, 0 fail (42 new). Checks: format 0; architecture 0; coverage 81 of 81; words 0; ownership 0 failures. QUESTION J5 lists eight readings; REPORT J6 the findings in membership, op-grades and the generated rows.

## Completion (MEMBER-ROSTER #5) · fix round 10, Wave A batch 4 (START; K5044 (2), (4), (5), K5060)

**Fixtures published (provider).** New `bio-plane/test/m/member-roster/fixtures.mjs`, two named exports, each made by this module's real code when called (nothing stored):
- `expertiseWithdrawn()`: the real `expertiseWithdraw` (R79, DEC-386) on a label that `ann` declared and the administrator confirmed; answers `ok`, state `withdrawn`, the reason and `by`. Users now: screens-settings 1 (re-point in its own job).
- `listenerRefusals()`: the real `registerPasswordSetter` (R81, N202) through the module's `listenerRefusal`: `registered` ok; `declared` LISTENER_DECLARED naming the holder; `malformed` LISTENER_MALFORMED for a non-function. Each whole, with its row's `check` and `translation`. Users now: credentials 1 (re-point in its own job; the findings list names 2, the START names 1, both are its own lines to re-point).
- `fixtures.test.mjs` (new) calls both and checks each real answer (R79, R81; 2 tests).

**Markers owed (each a line comment, read by the check):**
- `fixture.mjs:36`: `// fixtures-own: harness …`. Why: the world helper `claim()` is named like the op `claim`; it records the test's fact (`creds.claimed`) and no store answers it.
- `t19-enrol-boot.test.mjs:40`: `// fixtures-generic: X`. Why: the R32 negative control's setter answers `{ok:false, reason:"X"}`, a made-up refusal the setter gives on purpose.
- `t47-check-tables.test.mjs:89`: `// fixtures-generic: NO_SUCH_CODE`. Why: the R-check negative control forges a code with no row, on purpose.

**Lines.** The three live findings in the list (`checks/fixtures.mjs /home/user/bio member-roster --list`) are now accepted (own, generic, generic); the list reports 0 failures. The t9-notice-bounds:184 line in the audit (part-1) is not live in V3 and was not touched.

**Entries applied.** The two fixtures and their tests; the three markers. No change to any source file; no other module's file changed.

**Tests.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/member-roster/*.test.mjs`: 208 pass, 0 fail (the 206 of FR-07 plus the two new). User suites named by `impact.mjs origin/tranche/T51 HEAD` that test this module's answers: `membership` 180/180, `credentials` 189/189, `interface-shell` 369/369, `screens-settings` 265 of 266. The one red, `screens-settings/contract.test.mjs:72` (R39 words by key), asserts that `act.captureuploadabort.does` is a key the module reads; it is not this job's: no file of this job is read by that test, and the key is another module's (`screens-intake`, `capture`, `control-plane` hold it). Not verified against the base branch. The other impact users were not run (their tests cannot see a change that is test-only here; BOB's merge run covers them).

**Checks** (process repository, absolute root `/home/user/bio`): `format` 178 modules, 0 failures; `architecture member-roster` 0; `coverage member-roster` 81 of 81 ids named, 0 failures; `words member-roster` 0 failures (inline 0, plain 0, testcopy 0, unkeyed 0); `ownership member-roster tranche/T51 job/T51/member-roster` 0 failures (5 files: 3 edited, 2 new, all in `paths` and `tests`); `fixtures member-roster` 0 failures.

**Deferred.** None.

**Found outside this module.** None new. (The stale rows and the membership, op-grades and screens-settings items of FR-07 stand as in Completion (MEMBER-ROSTER #4).)

**Waiting for BOB at the merge.** Nothing new beyond the three markers above (listed for BOB's read, K5060): `fixture.mjs:36` (own, harness), `t19-enrol-boot.test.mjs:40` (generic X), `t47-check-tables.test.mjs:89` (generic NO_SUCH_CODE).

Size (session_017ZmLdEK9H7TnpXz4LEe9eG): test runs 7, module lines 2926
