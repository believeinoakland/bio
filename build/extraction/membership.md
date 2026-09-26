<!-- The membership extraction survey, written for BOB #41 on 2026-09-26 on tranche/T2; its §3–§5 open points are settled by BOB before T3 opens, and superseded where they disagree with build/requirements/membership.md. -->
# membership — extraction map

**Status** · Measured 2026-09-26 on `tranche/T2` by a drafting worker for BOB (P18). Line ranges are `grep -an`-verified in `bio-plane/src/store.mjs` (54,618 lines), `schema.mjs` (4,287) and `query.mjs` (2,665) at that date; the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/membership.md` (R1–R61); K23 and K31 apply. Note: `#rows`/`#one` are now at 16182–16183, not 16179–16180 as `record-core.md` states, so that map's ranges have drifted by about 3 lines on this branch.

## 1. What moves to `membership`

All in `store.mjs` unless named otherwise.

| what | where today | lines | moves |
| --- | --- | --- | --- |
| `static #enc`, `static async #derive` (PBKDF2), `static #rand` | store.mjs | 34669, 34671–34677, 34679–34682 | yes. `#derive` is used only by membership. `#rand` is generic (fork also uses it), so membership keeps its own copy |
| `static #TIMING_SALT`, `static async #payLoginCost` | | 34704, 34706–34708 | yes (R2, the same cost on every path) |
| `bootstrapState(tokenFp)` | | 34743–34760 | yes. No R-id for it (§3.9) |
| `claim`, `setPassword` | | 34764–34776, 34778–34787 | yes (R1). `setPassword` has its own op with no R-id (§3.9) |
| `static LOGIN_REFUSAL_DETAIL` | | 35358–35367 (its comment starts at 35243) | yes (R2) |
| `login`, `session`, `#sessionRights` | | 35373–35397, 35399–35405, 35434–35449 | yes (R2–R4) |
| `#memberByHandle` | | 35544–35546 | yes |
| `#isProjectOwner`, `#isJoinedParticipant` | | 35561–35564, 35572–35575 | yes (R54) |
| `#projectAuthority`, `#caseAuthority` | | 35700–35721, 35748–35767 | yes (R55, R56) |
| `#inSight`, `SIGHT_NONE/EXISTENCE/FULL`, `#sight`, `#visibilityOf` | | 35794–35797, 35814–35816, 35817–35823, 35832–35835 | yes (R43, R44) |
| `#viewerSees` (a second copy of `#inSight`) | | 17466–17471 | yes, merged into `#inSight` |
| `#positionalMember` (the member id from the predicate) | | 22972–22976 | yes (R43's `member`) |
| `#reindexProjectSight` | | 35876–35896 | yes (the Suggestions' reindex service; boot calls it at 1832, `promote` at 19391) |
| `#existenceAct`, `#existenceOnly` (C-70.1) | | 35902–35905, 35908–35920 | yes (R44, R61) |
| `PROJECT_NAMING_READS`, `…_NOT`, `#existenceRead` | | 35942–35953, 35954–35975, 35976–35991 | only the check itself moves. The list of ops stays with the dispatcher (§3.6) |
| `projectVisibilitySet`, `#visibilitySettingRefusal`, `projectVisibility` | | 35999–36038, 36044–36058, 36063–36073 | yes (R45–R47) |
| `projectDirectory`, `PROJECT_DIRECTORY_LIMIT` | | 36084–36158, 36167 | yes (R48) |
| join requests: `JOIN_REQUEST_ANSWERS`, `#activeMemberRow` … `#requestComment`, `projectRequest`, `projectRequestWithdraw`, `projectRequestAnswer`, `projectRequests`, `PROJECT_REQUESTS_LIMIT`, `#rosterInSight` | | 36188, 36191–36259, 36265–36303, 36308–36321, 36328–36381, 36391–36439, 36443, 36452–36454 | yes (R49–R53) |
| `static #noSuchProject` | | 36657–36661 | yes (a copy; promotion's code uses it too) |
| `#ownsAnyProject`, `#isProjectEditor`, `#participation`, `#isAdminMember` | | 36685–36688, 36701–36705, 36707–36710, 36711–36715 | yes. None of the four is in Provides (§3.8) |
| `projectClaimOwner`, `projectInvite`, `projectJoin`, `projectLeave`, `projectRemove` | | 36720–36731, 36737–36757, 36760–36770, 36775–36801, 36809–36826 | yes (R31–R36) |
| `projectOwnerAdd`, `#rescueRefusal`, `projectOwnerRescue`, `projectOwnerRemove` | | 36834–36875, 36882–36902, 36925–36956, 36961–37017 | yes (R39–R41) |
| `#normLabel`, `#expertiseState`, `expertiseDeclare`, `expertiseConfirm`, `expertiseList` | | 37417–37491 | yes (R21–R24) |
| `projectParticipants` | | 37497–37507 | yes (R37) |
| `CAPABILITIES`, `adminMath`, `ownerMath`, `projectOwnerArithmetic`, `#owners`, `adminArithmetic`, `ROOT_ADMIN`, `#activeAdmins` | | 37517, 37527–37531, 37550–37562, 37572–37579, 37581–37584, 37589–37593, 37610, 37612–37617 | yes (R4, R5, R38) |
| `#custodialBar`, `#custodialRefusal`, `#statusBy`, `#capsOf` | | 37630–37659 | yes (C-96, R58) |
| `memberCaps`, `adminEndorse`, `adminRemove`, `memberAdd` | | 37679–37703, 37709–37733, 37736–37798, 37800–37910 | yes (R6–R9, R12–R14) |
| `#INVITE_MISS`, `#invited`, `inviteLook`, `enroll`, `memberList`, `memberSet` | | 37925–37927, 37929–37937, 37941–37950, 37952–37984, 37986–38032, 38034–38086 | yes (R15–R17, R20) |
| `SIGNER_ATTESTS`, `#signerMemberBar`, `signerAdd`, `signerList`, `signerSet` | | 38110, 38134–38154, 38156–38177, 38202–38218, 38220–38238 | yes (R25–R27) |
| `aiCredentialMint`, `aiCredentialRevoke`, `aiCredentialLook`, `aiCredentials`, `#aiCredentialWrites`, `#aiCredentialPublic` | | 45440–45513, 45517–45557, 45567–45578, 45593–45602, 45604–45607, 45612–45626 | yes (R28–R30) |
| `viewerPredicate` | `query.mjs` | 1113–1182 (its comments from 973) | yes (R43). This needs `GATE_MARK` (query.mjs 1018), see §3.4 |
| op dispatch `bootstrap`, `claim`, `login` (with its member-active arm), `memberadd`, `enroll`, `invitelook`, `memberlist`, `memberset` | store.mjs `fetch` | 54209–54211, 54212, 54228–54259, 54266–54269, 54271 | yes. The `login` arm's logic moves into `login()` (§3.1) |
| op dispatch `membercaps`, `adminendorse`, `adminremove`, `adminarith`, `projectclaimowner`, `projectowneradd/remove/rescue/arith` | | 54299–54303, 54305–54315 | yes |
| op dispatch `expertisedeclare/confirm/list` | | 54492–54494 | yes |
| op dispatch `projectinvite`, `projectjoin`, `projectleave`, `projectremove`, `projectvisibilityset`, `projectvisibility`, `projectdirectory`, `projectparticipants`, `projectrequest`, `…withdraw`, `…answer`, `projectrequests` | | 54505–54507, 54509–54516, 54519–54542 | yes |
| op dispatch `signeradd/list/set`, `setpassword`, `session` | | 54546–54548, 54600, 54601 | yes |
| op dispatch `aicredentialmint/revoke`, `aicredentials`, `aicredentiallook` | | 53893–53900, 53905 | yes |
| schema migrations: `members.name`→`cover` rename; additive columns `members.handle/capabilities/expertise/status_by/invited_by`, `signers.status_by`, `ai_credentials.confined_to` | store.mjs constructor | 957–960; 993, 999, 1002, 1325, 1326, 1332, 1363 (entries of `ADDITIVE_COLUMNS`, 986) | yes. `members.expertise` is vestigial (§3.10) |
| DDL built in the constructor: `members_handle` index; `project_participants` and `pp_member`; `member_expertise` and `mx_member`; `project_owner_votes`; `admin_votes` | store.mjs | 1673; 1697–1709; 1723–1732; 1749–1758; 1760–1768 | yes |

**Tables membership owns** (`schema.mjs` unless noted): `credentials` (154–160), `sessions` (164–170 with its index), `bootstrap` (173–177), `members` (208–222), `signers` (227–233), `ai_credentials` (2840–2869 with its indexes), `project_visibility` (3916–3924), `project_sight` (3947–3951, a derived index), `project_join_requests` (3965–3979), plus the five tables `store.mjs` creates (above). Under R59, the exempt tables are `credentials`, `sessions`, `bootstrap`, `members`, `signers`, `ai_credentials`, `member_expertise` and `admin_votes`. The project-keyed tables are `project_participants`, `project_owner_votes`, `project_visibility`, `project_sight` and `project_join_requests`. `purge` clears the project-keyed tables inline today (per bundle 34240–34249; whole store 34368–34376), and under K23 membership declares them instead. It touches none of the exempt ones, which matches R59.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | lines | owner |
| --- | --- | --- |
| Producing group and group identity: `GROUP_SLUG_RE` … `groupIdentity`, `#stampGroup`; tables `instance_group` (schema 193–199), `group_identity_history` (3883–3890), `group_domain_checks` (3897–3905); ops 54215–54227 | 34831–35153, 35234–35242 | **Not membership.** Its checks, C-64 (`INSTANCE_GROUP_CHECKS`), are not in membership's list, and `promotion.md` R13 reads the group. See §3.7. Undetermined: the stored value is an instance setting (record-core, K23), but `#checkGroupDomain` uses `host-governor` (layer 3) and `#armScheduler` (layer 10), which record-core may not use |
| `#fileDigestOf`, `#digestFiles`, `digestCensus`, `registerAudit`, `#partsNamedFor`, `snapKeyCensus`, `homeCensus`, `registerHolds`, `#manifestFiles`, `#samePromotion`, `#promoteAbsent` | 35161–35225, 35485–35535, 36460–36656 | record-core, provenance or promotion (they read `files`/`history`/`manifest`/`register`). They sit between membership's methods but are not its code |
| `#joinedCitingProjectOf`, `#concludedForJoinedProjectOf`, `#editionWarrantedForJoinedProjectOf` | 35595–35665 | `affordances` (their only caller is `affordanceFacts`). They combine R54 with `#citesInto` (connections) and `#caseRelationOf` (publication) |
| `forkProject`, `projectNameKey` (static at 37158) | 37041–37153 | `promotion` (K31) |
| `exportManifest`, `exportLog`, `export_log` DDL (store.mjs 1737–1745), `EXPORT_LOG_LIMIT_*` (28880–28881) | 37180–37247 | `publication` (K31, N16) |
| `publishedManifest` | 37259–37399 | `publication` |
| `gateFacts` | 38260–38316 | `promotion`/`publication` (runGate facts). It reads `SIGNER_ATTESTS`, which must become a membership service (§3.5) |
| `#testimonyFence` | 22265–22374 | `provenance` (it reads `register`, K23). `promotion`'s extraction map §3 lists it as membership's, which is wrong |
| `promote()`'s inline membership writes: `INSERT INTO project_visibility` + reindex (19389–19391); owner row `INSERT OR REPLACE INTO project_participants` (19990) | | stay in `promotion`, rewired to call membership (§3.3) |
| `purge`'s project-table deletes | 34240–34249, 34368–34376 | stay in record-core's purge as membership's `declarePurge` (R59) |

**Direct SQL on membership's tables from code that is not membership's.** Each of these sites must call a membership service instead:
- `caseDocumentFacts` 10357 (`signers`⋈`members`)
- `auditPass` 16406 (`members`, the founder)
- `#attributionStatements` 22030, `attributeObservation` 22180 and `#themePerson` 23258 (`members` cover/handle/status)
- `#leadReach` 22955, `leadShare` 22988 and `leadRead` 23168 (`project_participants`)
- `#biasDebtRecipients` 49878–49882 (owners and active status)
- `#routeTask` 51077 and 51111, and `taskForward` 51412 (`project_participants`, `members`)
- the `login` dispatch arm, 54244

**Private calls into membership from later code:**
- `#viewerSees` (23 call sites), `#inSight` (17) and `#existenceAct` (23)
- `#isProjectOwner` (19), `#positionalMember` (10) and `#projectAuthority` (9)
- `#caseAuthority` (`publish` ×2, `ratifyCaseDocument`)
- `#isAdminMember` and `#activeAdmins` (`#findingsExportPerformed`, `#refuseNotYours`)
- `#owners` (`#draftPublisher`, `affordanceFacts`), `#isProjectEditor` (`#caseDraft`) and `#ownsAnyProject` (`affordanceFacts`)
- `viewerPredicate`: 98 sites in store.mjs, plus index.mjs and 37 test files

## 3. Private calls that leave membership, and conflicts with the requirements

Calls from the moved code that land in code membership does not own:
- `#one`/`#rows` (16182–16183): record-core's map left this undetermined.
- `Store.#sha256` (40440; used by `adminEndorse` and `#invited`): a generic helper, so membership takes a copy.
- `isMachineIdentity` and `MACHINE_CLASS_PREFIX` (bio-checks 1787, 1771), and the check families `AI_CREDENTIAL_CHECKS` (C-29), `MEMBER_ID_CHECKS` (C-55), `PROJECT_AUTHORITY_CHECKS` (C-56), `CASE_AUTHORITY_CHECKS` (C-57), `SIGNER_ENROLMENT_CHECKS` (C-63), `PROJECT_VISIBILITY_CHECKS` (C-70), `PROJECT_JOIN_REQUEST_CHECKS` (C-95) and `CUSTODIAL_CHECKS` (C-96). All of these are `legacy-checks`, which is allowed, and the families match the requirements' Uses exactly.
- Record-core's `bundles` table, read directly in about 17 moved methods. That is where the conflicts below start.

1. **R2 vs today.** The rule "an inactive `member:<id>` is refused at the same cost" lives in the `login` dispatch arm (54228–54259), not in `login()`. Extracting `login()` alone would not meet R2, so the arm's check moves into `login()`.
2. **Uses (record-core R34/R35) is not enough.** `viewerPredicate` returns a SQL fragment over the alias `b` of record-core's `bundles` (`b.object_type`, `b.bundle_id`) that its callers splice into their own statements. `#reindexProjectSight` and `projectDirectory` join `bundles` × `project_sight` × `project_join_requests` in SQL. `listBundles({project})` filters by a bundle's project, not by type, so no record-core service lists the projects. Two options, both BOB's (P17): record-core adds a by-type listing and makes `bundles`' `bundle_id`/`object_type` a stated read contract that membership's SQL may join, or the directory and reindex are rewritten over `listBundles`, which gives up the SQL-bounded cap D-497 built.
3. **`promote()` writes membership's rows itself.** It writes the owner row at 19990 instead of calling R31 (whose only caller today is the op), and it writes creation visibility at 19389 with no R-id behind it. Membership needs a stated service for "record creation visibility + reindex", or R31 grows a `visibility` argument. The reindex service is named only in Suggestions and has no R-id.
4. **`GATE_MARK` is in `query-language` (layer 5).** Moving `viewerPredicate` to membership (layer 2) moves `GATE_MARK` with it, and query-language re-exports it. `build/modules.json` still lists no `membership` in query-language's `uses`; the Suggestions ask for it, so modules.json needs amending.
5. **R27's "one predicate" has three readers.** `signerList`, `gateFacts` (38287–38290) and `caseDocumentFacts` (10356–10359) each splice `Store.SIGNER_ATTESTS`, and `signer-enrolment.test.mjs` pins the reader count at three. Membership needs a stated `attestingKeys()` (or equivalent) for the two gate readers, and the pinned test changes with it.
6. **`PROJECT_NAMING_READS` names later layers' ops** (`reevaluations`, `airuns`, `casedrafts`, …). If membership held that list it would know about layers 5–8. Recommendation: the list stays with the dispatcher (legacy-store `fetch` 54606, then control-plane), which calls membership's `existenceAct` (R44).
7. **`promotion`'s extraction map §3 is partly wrong.** It assigns `#producingGroup`, `#groupUndetermined` and `#testimonyFence` to membership. None is in `membership.md`: the group cluster is C-64 (§2) and the fence is provenance's.
8. **Services later code needs that Provides lacks:**
   - `isAdministrator(memberId)`, with the founder counted
   - the owners of a project
   - `isProjectEditor`: owner or `joined`, which is a different set from R54's joined-or-leaving
   - `ownsAnyProject`
   - a member's cover/handle/status by id
   - the active participants of a project, for task routing

   Either the owning modules get these through R37/R17, or membership states them. I recommend stating them, since they are membership facts.
9. **Ops with no R-id:** `bootstrap` (`bootstrapState`) and `setpassword` (`setPassword`). Both are membership's share. They need R-ids, or a ruling that `setpassword` retires (enrolment and claim already set passwords).
10. **R15 and `members.expertise`.** `inviteLook` also returns `expertise` (37949), and R15 names only `{cover, role, capabilities}`. `memberAdd` refuses any `expertise` (37844) yet still writes `expertise ?? null` into the `members.expertise` column (37881, 37905). The column is vestigial next to `member_expertise`; drop it at extraction.
11. **Confirmed "not yet met" items:**
    - R35: `LAST_OWNER_CANNOT_LEAVE` at 36791
    - R39: an invited target is marked `joined` at 36870
    - R42: carried votes are deleted at 36872 and 37013
    - R29: `principalMember ?? who` at 45481
    - R12's `name` alias: in the signature at 37800

## 4. Undetermined (stated, not guessed)

- The owner of the group-identity cluster and its three tables (§2, §3.7).
- The shape of the `bundles` read contract (§3.2).
- Whether `#rows`/`#one` become a shared helper (as in record-core's map §4).
- Tests were not mapped. The candidates by name are `members`, `membership`, `adminvote`, `aicredential`, `bootstrap`, `d134-custodial-refusals`, `founder-sight`, `project-*`, `projects`, `rec-186-leave-join`, `signer-enrolment` and `setup-signeradd` (`*.test.mjs` and `*.control.mjs` under `bio-plane/test/`). The job sorts them.
