# membership → members — split map (T51-145, CR-4)

**Status** · Draft by a planning worker for BOB #215, 2026-10-18; T51-145 (new module) and CR-4 (membership); C57, P6, K624, K657, K1043, K3268. Read in full: `requirements/membership.md`, `extraction/retrieval-browse.md` (the format), the six files of `bio-plane/src/membership/`, `build/modules.json` (layers 1 and 2). Read in part: the 38 test files' import lines and `fixture.mjs`, the greps for users. Not read: the test that enforces "one site per code" (risk 3). Measured on `tranche/T51` at `d51e826e42`.

**Why.** `wc -l` over membership's `paths`: `index.mjs` 3,239, `checks.mjs` 398, `schema.mjs` 298, `order.mjs` 179, `order-build.mjs` 68, `words.mjs` 30 = **4,212** (the plan's figure). `order.mjs` is generated (setup-words' `GENERATED_FILES` names it), so P6's own-code count is **4,033**. Either way it is at the ~4,000 mark, and CR-4 adds a read.

## 0. The answer

**The cut is the members half: everything about who the members are, with the tables it owns. Projects, sight and the fence stay in `membership`.** The direction is forced by P4. The new module must precede `membership`, and the project half cannot: `viewerPredicate`, `sight` and the participation reads join `members` (role, status) and `bundles`, so a project module placed first would read a later module's tables. The members half reads neither `bundles` nor any project table, so it can come first. The T38 Purpose text already divides this way.

| | lines (P6, own code) |
|---|---|
| `membership` before | **4,033** (4,212 with the generated list) |
| `membership` after | about **1,700**: `index.mjs` about 1,440, `checks.mjs` about 125, `schema.mjs` about 105, `words.mjs` about 12 |
| `members` (new) | about **2,600**: `index.mjs` about 2,010, `checks.mjs` about 300, `schema.mjs` about 200, `order-build.mjs` 68, `words.mjs` 30; `order.mjs` 179 on top (generated, not counted) |

The 4,300 total is 255 over 4,033: about 100 of delegation, about 90 of shell, about 60 of repeated headers. Nothing is held twice once CR-4 has merged.

## 1. The new module

| | `members` |
|---|---|
| name | `members` (short, lowercase, unused in `modules.json`; the names `member-roll` and `member-register` are free if BOB fears confusion with `membership`) |
| purpose | Who the members are and what each may do: the founder, administrators and their votes, invitations and enrolment, the two doors, handles, capabilities, expertise, hosting-access record, the group's settings and description, the Home mark, the viewer's spelling, the one list of module order, the refusals and listener slots every later module registers through. Reads no bundle and no project. |
| layer, place | 2, **first** (K624): index 34, directly before `record-core`. Row empty (K1043) and `MODULE_ORDER` entry in the same act (K657) |
| `paths` | `["bio-plane/src/members/"]`, set by T51-145 in the commit that creates it |
| `tests` | `["bio-plane/test/m/members/"]`, likewise |
| `uses` | `["setup-words", "record-grammar"]` (indexes 0 and 1; proof in §3). No `record-core`: it is later than a first-in-layer module, and nothing here needs it (§3) |
| entry points | `membersOf(ctx)` (K61: one instance per storage, over `ctx.storage.sql`), class `Members`, `membersOps(m, url, body, env)` |

## 2. What moves (by copy)

`index.mjs` line ranges are of the file as it stands.

| moved | from | lines |
|---|---|---|
| `notAnAdmin` (R84), `noSuchMember` (R121) | `index.mjs` 198–229, 254–275 | 54 |
| `MODULE_ORDER`, `moduleOrderFrom` (R83, R140, R145, R146); `order.mjs` and `order-build.mjs` whole | 310–324; 179 and 68 | 15 + 247 |
| `listenerRefusal` (R81) | 326–367 | 42 |
| the reserved-id finding's body, as `reservedIdFinding()` (registration stays, §4) | 456–480 | 25 |
| listeners R79, R94, R95, `isAdministrator`, `memberFacts`, `memberStatusSince` | 482–585 | 104 |
| `adminResign`, hosting access, `memberPairingSet`, `memberPairings` | 616–716 | 101 |
| `#sha256`, `#rand`, `positionalMember` (as the pure `viewerMember`, §3) | 737–763 | 27 |
| `sessionRights` (R92), `memberByHandle` (R119) | 765–814, 823–831 | 59 |
| expertise (R21–R24); `CAPABILITIES`, `adminMath` | 1645–1743, 1745–1767 | 122 |
| `adminArithmetic`, `ROOT_ADMIN`, `activeAdmins`, `memberCaps`, `adminEndorse`, `adminRemove`, `memberAdd`, invitations, `enroll`, `memberList`, the handle block (R123, R129, R144), `memberSet` | 1831–2579 | 749 |
| invitation expiry, the two doors, `joinDoors`, `inviteWithdraw`, `checkAddressees` (the read of holders only), court notice, the Home mark, group description | 2581–3101 | 521 |
| the member lines of `membershipOps` | 3121–3237 | about 95 |
| pure viewer parse, copied: the `admin`/`member:`/class regex of `viewerPredicate` (88–94), `CARRIED`, `carriedProject`, `baseViewer` (120–137) | | about 25 |
| tables `members`, `member_expertise`, `admin_votes`, `hosting_access`, `join_doors`, `group_description`, `handle_history`, `handle_check_window`, `home_looks`, `founder_handle`, `court_notice`; the `members` additive columns; the exempt list; `MEMBERSHIP_DECLARED_TABLES` | `schema.mjs` 4–45, 123–134, 148–249, 252–265, 273–295 | about 200 |
| rows: all of `CUSTODIAL_CHECKS` and `MEMBER_ID_CHECKS`; of `MEMBERSHIP_CHECKS` every row but `NO_SUCH_PROJECT`, `NOT_A_PARTICIPANT`, `TARGET_NOT_A_PARTICIPANT`, `LAST_COMMITTED_OWNER`, `PROJECT_GUARD_UNCHECKED` | `checks.mjs` | about 300 |
| 18 member word keys (`handle.*`, `membership.door_warning`, `.also_do`, `.handle_check_stated`, `.remedy.*`, `.says.*`, `court.statement`); `keyed`, `rowKey`, `rowWord` | `words.mjs` | 30 |

**Stays:** `viewerPredicate`, `projectViewer`, `projectGate`, `hiddenBundles` (R43, R149, R88); `noSuchProject`, `notAParticipant`, `notTheOwner`; the project tables and their rows; `counts` (R114); R116, R117, R128, R150 slots; the fence, `sight`, `inSight`, the visibility acts, participation acts, `participationWrite`, `projectCreated`, `rescueRefusal`, `ownerMath`, `projectOwners`, `existenceAct`; `membershipOf`, the project ops; `migrate` and `declareTables` (§4).

## 3. Imports of the moved code, and the P4 proof

| moved code imports | module (index) | earlier than 34? |
|---|---|---|
| `MACHINE_CLASS_PREFIX`, `MACHINE_STAMP_PREFIXES`, `sha256HexSync` | `record-grammar` (1) | yes |
| `word` (and `hasWord` in tests) | `setup-words` (0) | yes |
| `./checks.mjs`, `./schema.mjs`, `./words.mjs`, `./order.mjs` | its own | n/a |

It never imports `membership`, `record-core` or anything later; a grep of the moved ranges for `this.core`, `bundles`, `project_`, `inSight`, `sight(`, `viewerPredicate`, `visibilityOf`, `participation`, `recordOf` finds exactly these seams, each cut as shown:

1. **`this.core` (lines 464–465):** the audit finding is registered with record-core; `members` exposes `reservedIdFinding()` and `membership` registers it.
2. **`declarePurge` / `declareTable`:** `members` exports its tables, exempt list and declared rows; `membership.declareTables` declares all of them under the name `"membership"` as today, so record-core's census is unchanged.
3. **`viewerPredicate(...)` and `baseViewer` (705, 754, 2425, 3076–3077):** only the viewer's spelling is asked (scope, member id), not SQL. `members` owns that parse as `viewerMember(viewer, identity)` and `carriedProject`/`baseViewer`; `viewerPredicate` calls it once CR-4 has merged (until then it holds its copy).
4. **`#projectsOf` (2317, 2329):** `memberList` takes `projectsOf(memberId, viewer)` as a function argument; `membership`'s `memberList` passes its own. Without one, `projects` is `[]`.
5. **`inSight` (2966):** `checkAddressees` is cut in two: `members` answers `expertiseHolders(label)` (the SQL, 2961–2965); `membership` keeps `checkAddressees` (R106) and applies `inSight`.

Reverse edges (`membership` → `members`) are allowed: `isAdministrator`, `notAnAdmin`, `noSuchMember`, `listenerRefusal`, `MODULE_ORDER`, `memberByHandle`, `memberFacts`, `founderHandle`, `ROOT_ADMIN`, and a SQL read of `members` (member_id, role, status) by `viewerPredicate`, `sight`, `activeParticipants` (stated as `members` R67).

## 4. How `membership` delegates (K3268: no user re-points)

- `Membership`'s constructor takes `members: membersOf(ctx)`. Each of about 50 moved public methods becomes a one-line delegate, in the same name and shape, so `membershipOf(ctx).isAdministrator(...)` and the 14 files that use the class do not change.
- `membership/index.mjs` re-exports `listenerRefusal`, `notAnAdmin`, `noSuchMember`, `MODULE_ORDER`, `moduleOrderFrom`, `CUSTODIAL_CHECKS`, `MEMBER_ID_CHECKS` and `MEMBERSHIP_CHECKS` (the union of its rows and `members`' row objects, so each code still has one row). It also keeps `Membership.ROOT_ADMIN`, `CAPABILITIES`, `adminMath` and the other statics as aliases. Callers: `listenerRefusal` 42 files, `MODULE_ORDER` 21, `notAnAdmin` 19, `noSuchMember` 3.
- `migrate()` runs `members`' migration first, then the project tables, then `reindexProjectSight` (it reads `bundles`). `membershipOps` becomes `{...membersOps(m.members, ...), ...project ops}`, so `plane` re-points nothing.
- `membership`'s `words.mjs` imports `keyed`, `rowWord` from `members`; it keeps 3 keys (`membership.why.*`).
- **CR-4's read.** `admin_votes` moves to `members`, so CR-4's read of removals under way (target, each voter and day, who has not voted) cannot be written by `membership`'s job in `members`' files. Best reading: `members` states the read contract for `admin_votes` (kind, target, voter, reason, created: R67); CR-4 writes the read in `membership` over that contract, as `project-roster` reads `project_participants` through R120. If BOB prefers it in `members`, CR-4 gets a `members` entry. Doubt 2.

## 5. Requirement ids

**Moved, `membership` old → `members` new** (monotone; 64 ids). Retired in `membership` as "moved to `members` R<n> (T51, K624)" by CR-4. Meaning unchanged.

| old (`membership`) | new (`members`) |
|---|---|
| R4–R17 | R1–R14 |
| R19, R20, R21–R24 | R15, R16, R17–R20 |
| R57, R58, R64, R68 | R21, R22, R23, R24 |
| R79, R81, R83, R84, R86 | R25, R26, R27, R28, R29 |
| R92, R94, R95, R97, R98 | R30, R31, R32, R33, R34 |
| R99–R105 | R35–R41 |
| R107–R111, R113, R119, R121 | R42–R46, R47, R48, R49 |
| R123, R125, R126, R129, R130, R131 | R50, R51, R52, R53, R54, R55 |
| R140, R141, R143, R144, R145, R146, R147, R148, R152 | R56, R57, R58, R59, R60, R61, R62, R63, R64 |

Never reused. R83, R140, R145, R146 are all `MODULE_ORDER`; their long "directly after" histories are copied whole.

**Stay in `membership` (their code does):** R18 (the roster's projects), R31–R36, R38, R43–R45, R47, R54–R56, R60, R61, R65–R67, R69, R71, R74–R78, R80, R85, R87, R88, R106 (reworded: asks `members` R72 `expertiseHolders` and applies R80), R114, R116–R118, R120 (project tables), R122, R127, R128, R132, R149, R150.

**Copied and reworded (the rule is the same, stated for each module's own part):**

| `membership` | `members` | what |
|---|---|---|
| R112, R151 | R65, R70 | member-facing words by key, over each module's keys |
| R115 | R66 | exemption: members, expertise, votes, doors, settings, handle tables |
| R120 (the `members` row) | R67 | read contract: `members` (member_id, handle, **role**, status) and `admin_votes` (kind, target, voter, reason, created); `role` is a field added, no meaning changed (R120's own precedent for `invited_by`) |
| R133 | R68 | the member `*_CHECKS` tables, frozen |
| R142 (1) | R69 | a member's own handles taken (parts 2 and 3 stay) |

**New (unmet, T51), in `members`:** R71 (`memberList` takes `projectsOf`), R72 (`expertiseHolders(label)`), R73 (`viewerMember`, `carriedProject`, `baseViewer`: the spelling of a viewer, pure), R74 (`membersOf(ctx)`, `membersOps`, deps: `sql` only). In `membership`: R153 (the delegation: each moved name answers what `members` answers; its test holds CR-4), and R76 reworded to delegate to R73. CR-4's read of the removals takes the next free id in whichever module BOB names (doubt 2).

## 6. Tests (7,152 lines today in `test/m/membership/` and `test/members.test.mjs`)

`fixture.mjs` imports `record-core`, so a test of `members` cannot use it. `members` gets a fixture of its own: `node:sqlite`, `membersOf`, the three stand-ins (`claimed`, password setter, revocation listener), no `bundles` table.

- **Copied to `bio-plane/test/m/members/` (about 2,900 lines):** `administrators` 225, `capabilities-arithmetic` 21, `expertise` 69, `module-order` 155, `t14-rows-remedy-order` 194, `t19-seam` 209 (the R79/R94/R95 parts), `t34-joining` 446, `t34-settings` 224, `t40-handles` 311, `t46-handles-doors` 304, `t47-admin-handle` 52, `t49-founder-handle` 237, `t50-roster-mark` 118, `t50-status-since` 53, the member arms of `not-an-admin-visibility` 148, `t19-enrol-boot` 154, `t35-words` 223, `t50-words` 158, `t47-check-tables` 87, `t48-home-sight` 116, `t47-r142` (1) 122. Mixed files are cut by the job: whatever needs `bundles`, `project*`, or `sight` stays.
- **New:** R71 (a stand-in `projectsOf`, and none), R72, R73 (every spelling the regex admits, with `@project`), R74 (a store with no `bundles` table boots and answers), R67 (the contract's columns exist).
- **Stay in `membership`:** `hidden-bundles`, `no-such-project`, `ownership`, `participation`, `requests-fence-facts`, `roster`, `sight`, `t38-seams`, `t41-sight-words`, `t42-hold-reach`, `t45-project-guard`, `t50-project-viewer`, `t9-notice-sight-bounds`, `t20-figures`, `converts`, and `members.test.mjs` (R132, a Miniflare run, uses `test-support`), plus R153's delegation test.

## 7. Users

| user | uses today | re-points | by |
|---|---|---|---|
| about 100 modules (`membershipOf`, `viewerPredicate`, `listenerRefusal`, `MODULE_ORDER`, `notAnAdmin`, `noSuchMember`, `GATE_MARK`, the class) | `membership/index.mjs` | nothing: re-exports and delegates (R153) | each entry when it next touches the line (K3268) |
| `plane` (4 files) | `membershipOps`, `membershipOf` | nothing | — |
| `setup-words/build.mjs` | `GENERATED_FILES` names `bio-plane/src/membership/order.mjs` | adds `bio-plane/src/members/order.mjs`; drops the old when CR-4 deletes it | T51-145 (one line, an earlier module's file: BOB's call) |
| `modules.json` | | membership's `uses` gains `members` | CR-4 |
| `layers.md`, `build/requirements/members.md` | | new | T51-145 and BOB's act |

## 8. Risks

1. **Copy and delete.** Between T51-145 and CR-4 each moved function exists twice; nothing composes `members` until CR-4 builds it in `Membership`'s constructor. `members`' own tests are the only runner.
2. **Two generated lists.** `membership/order.mjs` and `members/order.mjs` both come from `modules.json`; both are stale-checked, so any `modules.json` edit between the two merges regenerates both (`order-build.mjs` exists twice until CR-4).
3. **One literal site per code (DEC-49 regions).** Each moved row's `where` and region marker names a function in `index.mjs`; for the copy window each code is minted at two sites. I did not read the test that enforces one site per code, so the job reads it first. Best reading: the new rows are not exported (or registered) until CR-4 swaps the exports, so the row census (`promotion` R39, `answer-envelope`) sees one row per code throughout. `where` strings change from `src/membership/index.mjs` to `src/members/index.mjs`: a row change for promotion's stamp (K3844: promotion's second stamp is last in L2, CR-5; add this).
4. **Record-core's census** keeps the declarer name `"membership"` (§3, 2); the test stand-ins for `declarePurge` assert it.
5. **R2 order.** `members` is first in R2, then `membership`; every user's test re-run is BOB's (P11), since nearly all of them build a `Membership`.
6. **Class statics.** `Membership.HANDLE_CHECK_STATED`, `DOOR_WARNING`, `COURT_STATEMENT` are `word()` calls at class definition; they become `members`' and `membership` aliases them, so `setup-words` must load first (it is index 0).
7. **Size.** `members` has 1,400 lines of margin and `membership` 2,300; later growth (CR-4's read, the removal arithmetic) has room in either.

## 9. T51 job sequence

1. **T51-145 MEMBERS (R2, first):** create the directory, copy §2, fixture and tests (§6), `requirements/members.md`, set `paths`, `tests`, `uses` (§1) in its own `modules.json` row (K1043), add the `setup-words` line (§7). Merges early.
2. **CR-4 MEMBERSHIP (R2, after):** delegate (§4), delete the copies, re-export, retire the ids (§5), add R153, read the removals under way, set `uses`, report the size (about 1,700).

## 10. Doubts for BOB (best reading in each)

1. **The direction and the name.** Members out, projects stay (§0), named `members`. The reverse is impossible under P4; a smaller cut is impossible too, since every member-side cluster (doors, settings, handles) writes or reads `members`.
2. **CR-4's read lives in `membership`** over `members`' stated contract (§4), not in `members`. The alternative adds a `members` entry to CR-4.
3. **R112, R115, R120, R133, R142, R151 are copied, not moved** (§5): each is one rule over both halves.
4. **R18 and R106 stay** though R17 and R24 move: they ask sight, which only `membership` has.
5. **The `setup-words` line** edits a layer-1 file from a layer-2 job; BOB may prefer to make it in the opening act.

## 11. Decided by BOB (for rulings)

The cut and the name (§0, §1); `paths`, `tests`, `uses`, place first in layer 2 (§1); the ids moved, copied and new (§5); the five seams (§3); CR-4's read in `membership` (§4); the doubts' best readings (§10). To be recorded once in `build/rulings.md` and reported to Bob as done.
