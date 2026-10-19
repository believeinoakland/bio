# membership (T51)

**Status** · session_018652bxpkEPx4gMoCSpbHne · depth 2 · COMPLETE · handled B3

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
