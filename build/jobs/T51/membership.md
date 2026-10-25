# membership (T51)

**Status** · session_01PkQWxjvpvMWiosMQuytmKK · depth 2 · COMPLETE · handled B9

## J1 · COMPLETE

**COMPLETE**, T51-11 · membership (commit `7fa9eb1d21` on `job/T51/membership`).

**Entries applied**
1. **N1243 / red #28**: `test/m/membership/t19-enrol-boot.test.mjs` R12 and R57 no longer copy the sentence. The reserved-id finding's `says` is read from `setup-words` by key (`membership.says.member_holds_reserved`, `membership.says.member_enrolled_under`) with `word()`, and `hasWord` confirms the key is held. The test now passes (8/8). The red came from the source sentence reading "has not been renamed" against the test's `/has NOT been renamed/`.
2. **Stale comments restated**:
   - `src/membership/index.mjs` header: requirements named as R4–R152 (was R4–R143).
   - `index.mjs` N793 note: `setup-page` marked retired at T48.
   - `index.mjs` R11 note: the setup act is `screens-entry` R6 and the group's settings `screens-settings` R18.
   - `test/members.test.mjs` line 5: the sign-in's `login()` names `credentials` now (`store.mjs` is gone).
   - `test/members.test.mjs` line 125: `civicos-ui` named as then, retired with T51-126.
   - `test/members.test.mjs` line ~494: "setup page" changed to "setup screen".
   - `test/members.test.mjs` line 444 (`civicos-ui never calls the op`) is a dated 2026-08-05 measurement and is left as recorded. Say if Bob wants it reworded anyway.

**R38 confirmation (K3824, DEC-330 A47)**: `projectOwnerArithmetic` (`op=projectownerarith`) answers the project's owner count as `live.owners`. Whether standing down is possible at that size is `live.possible`. `live.targetMayVote` answers the target's vote. All three are present in the `ownerMath` row (`src/membership/index.mjs` around 1786–1814). Nothing is missing, so no REPORT and no requirement change. For a project the viewer cannot see, the live row reads `ownerMath(0)`, as R38 states.

**Deferred**: none in this module.

**Found in other modules** (not changed; `node checks/run.mjs /home/user/bio` coverage, 6 failures, none in membership): `agent-harness` R17; `agent-runner` R36, R37, R38, R40; `capture` R96; `journey-check` R19; `project-roster` R35, R36; `promotion` R58 are each named by no test. Architecture passes everywhere (0 failures).

**Raw lines of source (M-T51-1)**: `bio-plane/src/membership/`, six files, **4,212** lines at this COMPLETE (4,211 at the draft's START measure, plus one line from the restated R4–R152 header). Per K3809 (1), the split is T52's.

**Checks**, from the process repository:
- `format.mjs /home/user/bio` (all): 0 failures.
- `architecture.mjs /home/user/bio membership`: 0 failures.
- `coverage.mjs /home/user/bio membership`: 112 of 112 live ids named; 0 failures.
- `ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`: 0 failures (4 files changed by membership, all in its paths or its record).
- `run.mjs /home/user/bio`: architecture 0 failures; coverage 6 failures, all in other modules (listed above); channels 0 failures.

**Tests**: `node --test test/m/membership/*.test.mjs test/members.test.mjs` from `bio-plane/`: 267 pass, 0 fail (`module-order` and `t9-notice-sight-bounds` pass). `t19-enrol-boot.test.mjs` alone: 8 pass.

Commit note: the Co-Authored-By line is omitted. The session prompt says no model identifier goes in commit messages.

Size (session_017qPsKctYDpHHE9UBkwHN19): test runs 3, module lines 4212

## J2 · COMPLETE

**COMPLETE** again, for B2 (CHANGE, K3838). Commit `d302aa72fe` on `job/T51/membership`; `tranche/T51` merged in first.

- **R120 contract**: `project_participants` now names `invited_by` (TEXT), the column R118 writes. `t38-seams.test.mjs` (the R120 test) asserts it by type, and `t41-sight-words.test.mjs` (R120) asserts its presence. No column changed.
- **Tests**: `node --test test/m/membership/*.test.mjs test/members.test.mjs` from `bio-plane/`: 267 pass, 0 fail. The two R120 files: 17 pass.
- **Checks** (process repo): format 0 failures; architecture for membership 0 failures; coverage for membership 112 of 112 named; ownership 0 failures (6 files changed by membership, all in its paths or its record); `run.mjs`: architecture 0 failures.
- **Coverage in `run.mjs`**: 10 failures, none in membership. Since the merge, `entities` (R57–R61), `explore` (R26), `people` (R40, R41) and `progressions` (R46) also show ids named by no test, in addition to the six from COMPLETE J1. These came in with the tranche merge and are outside this job.
- **Raw lines of source**: 4,212, unchanged from J1 (test edits only in this change).

Size (session_017qPsKctYDpHHE9UBkwHN19): test runs 6, module lines 4212

## J3 · COMPLETE

**COMPLETE**, CR-4 · membership (B3 START), on `job/T51/membership`; `tranche/T51` merged first.

**Entries applied**
1. **Delegation (R154, new) and the cut.** `membership/index.mjs` is 3,191 → 1,378 lines. `Membership` holds `members` (`member-roster`'s `Members`, built by `membersOf(ctx)` in `membershipOf`, or `new Members({sql})` for a direct construction); each of the 49 moved instance names is a one-line delegate of the same name (`(...a) => this.members.x(...a)`); the class statics (`ROOT_ADMIN`, `CAPABILITIES`, `adminMath`, `HANDLE_*`, `DOOR_WARNING`, `COURT_STATEMENT`, `GROUP_KINDS`, the limits) are aliases. `listenerRefusal`, `notAnAdmin`, `noSuchMember`, `MODULE_ORDER`, `moduleOrderFrom` are re-exported (same objects); `MEMBERSHIP_EXEMPT_TABLES` and `MEMBERSHIP_DECLARED_TABLES` alias `member-roster`'s and `declareTables` declares them under `"membership"`, so `record-core`'s census is unchanged. `migrate()` runs `members.migrate()` first, then the project tables.
2. **Rows (K231, family census).** `checks.mjs` keeps its five own rows and exports `MEMBERSHIP_CHECKS` (the union with `member-roster`'s, every code one row), `MEMBER_ID_CHECKS`, `CUSTODIAL_CHECKS` from `MEMBER_ROSTER_ROWS`, in the same act that deleted the copies; `answer-envelope`'s families test (41) passes. `where` strings of the moved rows name `src/member-roster/index.mjs` (promotion's CR-5 stamp).
3. **Notes 3 (a)–(d).** (a) the three tables as above; (b) `memberList` passes membership's own `projectsOf` (R18); (c) `checkAddressees` (R106) asks `expertiseHolders` and applies `inSight`; (d) `membershipOps` is `{...membersOps(m, …), project ops}` with `m` the `Membership`, so `memberlist` carries the projects and `adminremovalsopen` is answered through membership's ops (`m.adminRemovalsOpen` delegates).
4. **Viewer spelling (R76, R43, R149).** `positionalMember` is `viewerMember`; `viewerPredicate`, `projectViewer` read `viewerMember`, `carriedProject`, `baseViewer` from `member-roster` (R73); the local copies are gone.
5. **Note 4 (K3958).** `words.mjs` no longer reads `word` with a variable key: it re-exports `rowKey`/`rowWord` from `member-roster` and holds only its four keys; `WORD_KEYS` is the union.
6. **Note 5, words findings.** The 22 `plain` findings: 20 were in code that moved (they went with it, converted in `member-roster`); the two left (`rescueRefusal`'s act phrase and the `NO_OWNERS` detail) are `localize('membership.index.adding_an_owner_to_a_project_whose_owners', …)` and `localize('membership.index.this_project_has_no_owner_rows', …)`; `order-build.mjs:59` went with the file. The testcopy findings: `t47-r142` (3) now compare with `localize`; the others lay in tests that moved. `checks/words.mjs membership`: inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0; 0 failures. No string judged unread-by-members is left unlisted.
7. **Retired and deleted.** `order.mjs`, `order-build.mjs` (membership's generated list; `MODULE_ORDER` is `member-roster`'s). The requirements already retire the moved ids; I did not touch `build/`.

**Tests.** The suites that only tested moved ids were deleted (their copies, 26 files, live in `test/m/member-roster/`): `administrators`, `capabilities-arithmetic`, `expertise`, `module-order`, `t34-joining`, `t47-admin-handle`, `t50-status-since`; moved tests were cut from `t14`, `t34-settings`, `t40`, `t46`, `t49`, `t50-roster-mark`, `t48-home-sight`, `not-an-admin-visibility`, `t9-notice-sight-bounds`; project-side tests stay. New `t51-delegation.test.mjs` (R154: seven tests with controls: every name delegated, reads equal over one store, writes read back, re-exports identical, rows unioned and one site per code, ops map, `checkAddressees`/`positionalMember`). `t50-words` and `t47-check-tables` re-pointed (union keys; `where` in either module).

**Deferred**: none.

**Found in other modules / for BOB**
1. **Requirement text.** `membership` R154 says `memberRosterOf(ctx)`; `member-roster` R74 and the code say `membersOf(ctx)` / `Members` (the split map's name changed by K3946). Built to R74. R154 should read `membersOf`.
2. **`member-roster` could export the machine spelling.** `viewerPredicate` must tell a machine credential (`class:admin|member|probe|daemon|ai`, sees every bundle) from a spelling it refuses, and R73's `viewerMember` answers `null` for both, so `membership` keeps one small regex (`MACHINE_VIEWER`) for the machine arm. If R73 gained `isMachineViewer(viewer)` it would go.
3. **Generated artifacts made stale by deleting `membership/order.mjs`**: `setup-words/build.mjs` `GENERATED_FILES` still names `bio-plane/src/membership/order.mjs` (drop it; add `member-roster/order.mjs` if not yet), `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json`, `agent-worker/dist/agent-worker.bundled.mjs` and `.bundle.json`, and the manifest rows for `membership/order.mjs`. BOB's layer-close regeneration; `rows.mjs`/`words-unreviewed.json` also gain the two new `membership.index.*` ids.
4. `connections` has 5 reds (R62, R63, R69) on `tranche/T51` itself; not this job's.
5. `members.test.mjs`:444 (`civicos-ui never calls the op`) is a dated 2026-08-05 measurement, left as recorded (as in J1).

**Raw lines of source (own code)**: `bio-plane/src/membership/` four files: `index.mjs` 1,378, `checks.mjs` 133, `schema.mjs` 102, `words.mjs` 13 = **1,626** (was 4,212; the generated `order.mjs` is gone).

**Checks** (process repository): `format.mjs` 0 failures; `architecture.mjs membership` 36 files, 0 failures; `coverage.mjs membership` 49 of 49 live ids named, 0 failures; `words.mjs membership` 0 failures; `ownership.mjs membership tranche/T51 job/T51/membership` 0 failures; `run.mjs`: architecture 0, format 0, channels 0 (coverage 31 and words failures are other modules').
**Tests run**: `membership` suites 171 pass, 0 fail (`test/m/membership/*.test.mjs`) and `test/members.test.mjs` 98 pass; users: `project-roster` 87, `credentials` 160, `promotion` 147, `answer-envelope` 41, `plane` 260, `ai-accounts` 114, `conformance` 119, `standards` 104, `case-carriage` 88, `control-plane` 302, all pass; `connections` 124 pass, 5 fail (red on the tranche too).

Size (session_018652bxpkEPx4gMoCSpbHne): test runs 14, module lines 1626

## J4 · REPORT

**Addendum.** `bio-plane/test/system/` after CR-4: `fleetbundles` fails (bundles stale from deleting `membership/order.mjs`, red on the tranche before this job too), and `row-census` fails with "CENSUS MOVED: changed with no record" for the moved rows (C-102.11 and the others whose `where` now names `src/member-roster/index.mjs`), plus its `newgroup/dist/newgroup.bundled.mjs` file note. Both are the stamp and regeneration BOB/promotion's CR-5 owns; nothing further in membership.

## J5 · COMPLETE

**COMPLETE** again, for B4 (CHANGE, K3980). `tranche/T51` merged (no conflict). The six test copies now compare with `localize` by id (`t35-words` three, plus the hosting-access act; `t46-handles-doors` the doors act) or carry a non-sentence message (`t19-enrol-boot`). `checks/words.mjs /home/user/bio membership`: 0 failures. `membership` suites 172 pass, 0 fail. Coverage 49 of 49, architecture and ownership 0 failures. No source change; module lines 1626.

Size (session_018652bxpkEPx4gMoCSpbHne): test runs 3, module lines 1626

## J6 · COMPLETE

**COMPLETE**, RW (words, B5), on `job/T51/membership` (commit `058368a0a2`); `tranche/T51` merged first (no conflict).

**Entries applied**
1. **Finding (the one the check lists).** `membership/index.mjs` ~1127: a refusal's `detail` ("the member named holds no participation in this project…") was a two-literal `+` chain, counted as an inline sentence. It now reads `localize("membership.index.the_member_named_holds_no", en)`; the English is unchanged. New id, fixed once. No table key or code was touched.
2. **Other findings:** none. `words.mjs membership` lists 0 findings (before: 1 inline).

**Deferred**: none in this module.

**Inherited red (not this job's, unchanged by it)**: `test/m/membership/t50-words.test.mjs` R151 "the keys it reads are the `reads` list for it in words-reads.json" fails on `tranche/T51` before this job's edit, and fails the same way with the edit reverted. It compares `WORD_KEYS` with the `membership` `reads` list in `docs/development/ux-substrate/screens/words-reads.json`; the design's split of that entry (DEC-345, U373, K3981) is the pending merge that should bring the two into line. Nothing in `membership` changes it, and I did not edit the list.

**Found in other modules** (not changed): `checks/run.mjs` on `/home/user/bio` shows 1,629 words failures and 22 coverage failures, none in `membership`. Architecture 0 failures; format 0 failures; channels 0 failures.

**Setup-words**: `setup-words/build.mjs --check` reports `rows.mjs` stale for the new `membership.index.the_member_named_holds_no` row (expected; BOB regenerates at the layer close). No refusal naming `membership`.

**Checks**, from the process repository:
- `checks/words.mjs /home/user/bio membership`: inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0; 0 failures.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio membership`: 0 failures.
- `checks/ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`: 0 failures (1 file changed by membership, in its paths).
- `checks/run.mjs /home/user/bio`: architecture 0, format 0, channels 0; no finding names `membership`.

**Tests**: `node --test test/m/membership/*.test.mjs test/members.test.mjs` from `bio-plane/`: 171 pass; 1 fail, the inherited R151 reads-list test above (the same test fails with the edit reverted).

**Raw lines of source**: `bio-plane/src/membership/` four files: 1,625 (unchanged by RW).

Size (session_018mYefzYbzbFYsZ9Kx9F2np): test runs 5, module lines 1625

## J7 · BLOCKED

**BLOCKED** (cause: tests), for B6 (CHANGE, K4036: membership's `WORD_KEYS` as its own keys only). Code reverted; the branch is at J6's commit `058368a0a2` plus the merge of `tranche/T51`. Nothing pushed for B6.

**What I did.** `WORD_KEYS` built from membership's own rows (`MEMBERSHIP_CHECKS` minus member-roster's codes, plus the project and case-authority tables) and `SENTENCE_KEYS`, without member-roster's 46 keys. That set is exactly the 15 keys of `membership`'s `reads` list in `words-reads.json`, so R151's reads-list test (`t50-words.test.mjs`:36) passes.

**What stays red with that change.** Four assertions in the R151/R123 tests assert that `WORD_KEYS` contains member-roster's rows too, so no single `WORD_KEYS` passes them unchanged alongside the reads-list test:
1. `t50-words.test.mjs`:26 `WORD_KEYS.length >= 60` (now 15).
2. `t50-words.test.mjs`:60 every refusal row's key is in `WORD_KEYS`; fails on `refusal.BAD_MEMBER_ID`, a member-roster row.
3. `t50-words.test.mjs`:158 every table's code is in `WORD_KEYS`; fails on `MEMBER_ID_RESERVED`.
4. `t41-sight-words.test.mjs`:232 `WORD_KEYS` includes `handle.refused.paused` (`HANDLE_CHECK_PAUSED`, a member-roster row).

So "R151's test passes unchanged, module suite green" cannot hold: the reads-list test needs 15 keys, and tests 1 to 4 need the union. Current suite with the change: 168 pass, 4 fail (the four above); without it, the only red is the inherited reads-list test.

**Ruling needed (BOB).** My proposal: membership's `WORD_KEYS` is its 15 own keys (DEC-345, as B6 says), and tests 1 to 4 are re-pointed, not weakened: each asserts the key is held in the union of `membership`'s `WORD_KEYS` and `member-roster`'s `WORD_KEYS` (the same strength, the member-roster half read from its own declaration, K3268), and test 1's `>= 60` becomes the union's count. The reads-list test stays unchanged. I will make that change on your go, or on a different ruling if you pick one (for example, keep the union and change the design's `reads` entry instead, which is the design stream's and not mine to edit).

**Size**: no change to the module's source from this job; module lines 1625 as at J6.

Size (session_018mYefzYbzbFYsZ9Kx9F2np): test runs 4, module lines 1625

## J8 · COMPLETE

**COMPLETE**, for B7 (ANSWER to J7, K4037), on `job/T51/membership` (commit `0751660c3e`); `tranche/T51` merged first.

**Entries applied**
1. **`WORD_KEYS` is the module's own keys (DEC-345).** `index.mjs`: its own rows (`MEMBERSHIP_CHECKS` minus member-roster's codes; the project and case-authority tables) and `SENTENCE_KEYS`, which is exactly the 15 keys of `membership`'s `words-reads.json` entry. Member-roster's keys stay on member-roster's own `WORD_KEYS`.
2. **Four union assertions re-pointed, not weakened.** `t50-words.test.mjs` (the count bound, the refusal-row loop, the table-codes loop) and `t41-sight-words.test.mjs` (`handle.refused.paused` and the negative control) now check against `HELD = [...WORD_KEYS, ...member-roster's WORD_KEYS]`, read from member-roster's own export (K3268). The count bound is now the union's count (≥ 60). The reads-list test (`t50-words.test.mjs`:36) is unchanged and passes.
3. **Test copy found by `run.mjs`.** `t35-words.test.mjs`:65 held member-roster's sentence "setting a member's capabilities"; it now reads `localize("member-roster.index.setting_a_members_capabilities", …)`, the id member-roster's `index.mjs` uses (K3810). The membership words check (`words.mjs membership`) listed no testcopy for it; `run.mjs` on the tranche did, so I fixed it.

**Deferred**: none.

**Found in other modules** (not changed): none new. `run.mjs` on `/home/user/bio` has no finding naming `membership`.

**Checks**, from the process repository:
- `format.mjs /home/user/bio`: 0 failures.
- `architecture.mjs /home/user/bio membership`: 0 failures.
- `coverage.mjs /home/user/bio membership`: 49 of 49 live ids named; 0 failures.
- `words.mjs /home/user/bio membership`: inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0; 0 failures.
- `ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`: 0 failures (5 files changed by membership, all in its paths or its record).
- `run.mjs /home/user/bio`: no line names `membership`.
- `setup-words/build.mjs --check`: stale-rows note only (expected; BOB regenerates at the layer close).

**Tests**: `node --test test/m/membership/*.test.mjs test/members.test.mjs` from `bio-plane/`: 172 pass, 0 fail (the R151 reads-list test passes unchanged).

**Raw lines of source**: `bio-plane/src/membership/` four files: 1,627 (was 1,625; the import swap and the own-keys block).

Size (session_018mYefzYbzbFYsZ9Kx9F2np): test runs 8, module lines 1627

## J9 · COMPLETE

**COMPLETE**, FR-66 · membership (B8 START), on `job/T51/membership`; `tranche/T51` merged first (no conflict).

**Entries applied**
1. **C80 (member-roster R76).** `t49-founder-handle.test.mjs` no longer asserts `memberFacts("admin")` is null for the claimed founder (the old "R68: she is no members row" line). It asserts her facts, `{cover: null, handle: "steward", role: "admin", status: "active"}`. A new test, "`member-roster` R76 memberFacts(admin)…", covers the unclaimed founder (null), claimed with no handle held (`handle: null`), claimed with one (`steward`), with controls (an unknown id and her handle both null). R68 is retired in `membership.md` (moved to `member-roster` R24) and states no null, so no requirement line changed for this.
2. **R154 (delegation).** `Membership` gained `expertiseWithdraw` (R79), `endorsementsOwed` (R77) and `expertiseAwaitingConfirmation` (R78), each `(...a) => this.members.x(...a)`. `t51-delegation.test.mjs` now asserts the three are public names of `Members`, are `Membership`'s own functions, answer what the module answers (reads for an administrator and a member), and that a write (a withdrawal) through the delegate is read back by the module with its refusal (`NOT_CONFIRMED`) the module's. Both tests were seen failing before the change.
3. **Requirements.** R154's line in `build/requirements/membership.md` now says each public name `member-roster` adds later is a delegate too, naming the three, and its test line says so. Not marked *(not yet met)*: a test names it.

**Deferred**: none.
**Found in other modules**: none. `run.mjs` coverage lists 5 failures and words 16; none names `membership`.

**Checks** (process repo): `format.mjs` 0 failures; `architecture.mjs membership` 0 failures; `coverage.mjs membership` 50 of 50 ids named; `words.mjs membership` 0 failures; `run.mjs /home/user/bio`: no line names membership; `ownership.mjs membership tranche/T51 job/T51/membership`: 1 failure, `build/requirements/membership.md` listed as outside paths (accepted at the merge, per B8).
**Tests**: `node --test test/m/membership/*.test.mjs test/members.test.mjs` from `bio-plane/`: 178 pass, 0 fail.
**Raw lines of source**: `bio-plane/src/membership/` four files: 1,645 (was 1,642 after the merge; three delegates).

Size (session_017s65dDGHCvSe8iRWnSsjCe): test runs 6, module lines 1645

## J10 · COMPLETE

FR-66 done (J9 in the record, pushed): C80 R68's test now follows member-roster R76 (claimed founder answers her facts, unclaimed null, both tested); R154 delegates added for expertiseWithdraw, endorsementsOwed, expertiseAwaitingConfirmation, test green. Membership suites 178 pass, 0 fail; checks 0 failures; ownership lists build/requirements/membership.md only (R154 amended). Module lines 1645.

## J11 · COMPLETE

Fix round 10, Wave A batch 2 (B9; START `build/plan/starts-T51-F10/membership.txt`). Read whole: `build/requirements/membership.md` (both parts), `build/plan/fix-round-10-T51.md`, `build/plan/fix-round-10-waves.md`, the START, `bio-plane/test/m/membership/fixture.mjs`, and promotion's `fixtures.mjs` (its `makeMembership` double). Commit `3d301f571a` pushed to `job/T51/membership`.

**Causes done:** none in this START.

**Published:** `bio-plane/test/m/membership/fixtures.mjs` (new), `projectActRefusals`. The real membership over `world()`, with `ann` the owner of `PRJ-1` (a creation with an owner, discoverable), `bob` invited and joined, `cy` invited and not joined, `dee` neither, `second` an administrator. It returns `membership` (the whole real instance, for a user that needs more than the two answers, the whole `makeMembership` double included), `projectAuthority(p, identity, need, act)` (R55), `visibilitySettingRefusal(v)` at a creation (R47), and `identity`. Its test is `fixtures.test.mjs`: three tests, each naming its requirement (R55 twice, R47), each checking the real answer, the refusal shape included.

**Markers added** (trailing comments; no line moved):
- `fixture.mjs:55`, `fixture.mjs:99`: `fixtures-own: harness`, the founder's claim, a world helper named like an op.
- `t19-enrol-boot.test.mjs:39`: `fixtures-generic: X`, the made-up refusal reason.
- `t45-project-guard.test.mjs:124`: `fixtures-generic: EMPTY_REASON`, the empty reason.
- `t45-project-guard.test.mjs:125`: `fixtures-generic: X`, the made-up refusal reason in an array.
- `t47-check-tables.test.mjs:86`: `fixtures-generic: NO_SUCH_CODE`, the invented code.

**Lines left:** none for membership. `node checks/fixtures.mjs /home/user/bio membership --list`: 0 failures (answer 0, accepted 6: two own, four generic). I ran it with the absolute root: with `.` the check reads no file and reports 0 (K5066).

**Users:** promotion's two lines (`fixtures.mjs:163,166`, judgment) re-point in promotion's own job, not here. `build/plan/impact.mjs origin/tranche/T51 HEAD` names membership alone for this change (32 of its 33 test files), so no other module's tests are named.

**Tests and checks:**
- Membership suite, `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/membership/*.test.mjs`: 180 pass, 0 fail (exit 0). Its three fixture tests are among them.
- `checks/format.mjs /home/user/bio`: 0 failures (178 modules).
- `checks/architecture.mjs /home/user/bio membership`: 0 failures.
- `checks/coverage.mjs /home/user/bio membership`: 50 of 50 live requirement ids named by a test.
- `checks/words.mjs /home/user/bio membership`: 0 failures (6,543 literals; inline 0, testcopy 0, missingkey 0, handlist 0).
- `checks/ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`: 0 failures (7 files changed by membership).

**Note for BOB:** commit `3d301f571a` carries a Co-Authored-By trailer that names the model. The system rule says no model identifier in commit messages, and I missed it when I wrote the message. The commit is pushed, and rewriting it would be a force-push, so I have not amended it. Later commits omit the trailer.

Size (session_01PkQWxjvpvMWiosMQuytmKK): test runs 3, module lines 1645 (`bio-plane/src/membership/*.mjs`, unchanged; this job changes only test-side files).
