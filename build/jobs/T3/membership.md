# T3 · membership — job record

Session: `session_01LSy7nZpkVyvEV81G4a5SYA` (MEMBERSHIP #1)

**Status** · COMPLETE, 2026-09-26. Job for module `membership`, tranche T3, branch `job/T3/membership`, merged with `tranche/T3` @ 91933d7587 (record-core merged). Entries T3-2, N18, R62, R63, K57, REC-224, REC-226 and R74 (K68) applied. Q1 answered (K61, K63). Nothing deferred.

## Entries applied

- **T3-2** · the module is extracted from `legacy-store` per `build/extraction/membership.md` and the requirements. New files: `bio-plane/src/membership/index.mjs` (class `Membership({ sql, core })`, `viewerPredicate` and `GATE_MARK`, `membershipOf(host)`, `membershipOps(m, url, body, env)`) and `bio-plane/src/membership/schema.mjs` (the module's DDL, additive columns, and its exempt and project-keyed table lists). Moved out of `store.mjs`: every method, static and private helper the map's §1 lists (sign-in and sessions, administrators, the roster, expertise, signing keys, AI credentials, participation, ownership, sight, visibility, the directory, requests to join, the fence), `#viewerSees` merged into `inSight`, `#positionalMember`, the 41 op-map entries (now `membershipOps`, spread into the store's map), the `members.name`→`cover` rename, the membership entries of `ADDITIVE_COLUMNS` and the five tables the constructor created. Moved out of `schema.mjs`: `credentials`, `sessions`, `bootstrap`, `members`, `signers`, `ai_credentials`, `project_visibility`, `project_sight`, `project_join_requests`. `store.mjs` keeps each public method and every private one the rest of the store still calls as a one-line delegation (`membershipOf(this).…`), and its public statics as aliases, so every op and every legacy caller answers as before; its boot calls `membershipOf(this).migrate()` after the schema pass. Kept in `store.mjs` as the map says: `PROJECT_NAMING_READS`/`#existenceRead` (the dispatcher's), `#joinedCitingProjectOf` and the two beside it (affordances'), `forkProject`, export, `gateFacts`, the group-identity cluster (C-64, K57), and small copies membership also holds (`#enc`, `#rand`, `#noSuchProject`).
- **K57** · R2's inactive-member refusal moved from the dispatcher's `login` arm into `login()` (same cost, same words); R15 `inviteLook` returns `expertise` from `member_expertise` (R24's form), and the vestigial `members.expertise` column is dropped at boot; `memberAdd` no longer reads `name` as an alias of `cover`; R64–R73 stated and built (`isAdministrator` now counts the founder only once claimed; `memberFacts`, `activeParticipants`, `attestingKeys`, `projectCreated`); `viewerPredicate` and `GATE_MARK` are membership's. legacy-store's two gate readers (`caseDocumentFacts`, `gateFacts`) call `attestingKeys()` instead of splicing the predicate. Project titles are asked of record-core's `bundleInfo` (R34); membership's SQL joins `bundles` only on `bundle_id`/`object_type` (record-core R37).
- **N18** · R10 `adminResign` (op `adminresign`); R11 the second administrator's `memberAdd` answer carries the hosting-access question, recorded by `hostingAccessSet`/`hostingAccess` (ops `hostingaccessset`, `hostingaccess`, table `hosting_access`); R18 an administrator's roster rows carry `projects`; R19 `memberPairingSet`/`memberPairings` (ops `memberpairingset`, `memberpairings`, column `members.pairing_published`); R29 a member-scoped credential naming another principal is refused `AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER`; R39 an owner is added only from joined participants (no longer marks an invited target joined); R42 every carried addition, removal and rescue is kept in `project_owner_decisions` and read by every participant (`projectParticipants.ownership`).
- **R62** · an organisation-scoped AI credential by a non-administrator is refused `AI_CREDENTIAL_ORG_NOT_ADMIN`.
- **R63** · every owner's removal is kept in `project_removals` and read by every participant (`projectParticipants.removals`).
- **REC-224** · R35 `LAST_COMMITTED_OWNER` (an owner may ask to leave only while another owner is committed, not `leaving`); R40 a removal that would leave only `leaving` owners is refused, naming them.
- **REC-226** · R33 an invitation closes the invitee's open request `granted`, by the inviting owner.
- **R65** · owners are listed in the order they became owners, by a per-project counter `project_participants.owner_order` (a timestamp tied within a millisecond). legacy-store's `#owners` keeps its sorted order (`#draftPublisher` reads its first).
- **R59** · membership declares its seven project-keyed tables to record-core's `declarePurge` in R46's keyed form (`project_id`) and its nine identity tables as exempt; the five entries legacy-store declared for it (record-core's REPORT 4) are removed. The first form named the exempt tables twice, which record-core refused (`TABLE_DECLARED`) and I had not read the answer: found by the old `projects.test.mjs` after the merge, fixed, the refusal now thrown, and tested against the real record-core (negative control: both R59 tests fail with the defect restored).
- **R74** (K68) · `participation` answers `{state, owner}` with `owner` a boolean, or null.
- Stale comments (Suggestions): `members`' DDL comment repointed to Architecture v2; the `project_participants` comment says an owner removes; the fence's comment says 7.13 is built.

## Decisions made in the job (for BOB to record if he wishes)

- The module's shape is K61's: `membershipOf(ctx, { record })` answers the one instance per Durable Object storage and reaches record-core by `recordOf(ctx)`; legacy-store calls `membershipOf(this.ctx)`. A test passes its own record-core as `record`. The project-keyed tables are declared in record-core R46's form, `{ name, keys: ["project_id"] }`.
- R19: the roster keeps R17 exactly (cover only under the administer stamp); the published pairings are their own read, `memberPairings`, so R17 and R19 cannot disagree.
- R11: "asked" is the second administrator's `memberAdd` answer carrying `hostingAccess: {asked, question}`; the answer is an append-only record any administrator writes.
- R10: the founder is refused `ROOT_OF_TRUST`; a non-administrator `NOT_AN_ADMIN`; two or fewer administrators `RESIGN_AT_TWO`. Capabilities are left as last set.
- R40's new refusal reuses R35's code `LAST_COMMITTED_OWNER`, with `leaving` naming the owners left.
- R29 and R62's refusals carry `check: "membership.R29"`/`"membership.R62"` and their sentence as `translation`: `legacy-checks`' `AI_CREDENTIAL_CHECKS` has no row for them and is not mine to edit.
- R71 `projectCreated` records the creation visibility with reason "chosen at creation" and `set_by` = `by`, else the owner.
- `project_owner_votes` keeps the rescue's vote row, as before; add and remove votes are still cleared once carried, after being copied into the decision.

## Deferred

None of my entries. The legacy integration of project names waits on record-core (below).

## Found in other modules (REPORT)

- **affordances** (`bio-plane/src/affordances.mjs`, layer 11): its leave affordance still counts every owner (`ownerMath` over all owners), so it OFFERS `projectleave` to an owner whom R35 (REC-224) now refuses `LAST_COMMITTED_OWNER` (the other owners all `leaving`). `d311-roster-affordances.test.mjs`: "pam@PC: offered true, LAST_COMMITTED_OWNER". The affordance should ask membership's rule (an owner may leave while another owner is committed).
- **control-plane / legacy-index** (`index.mjs`): the new ops `adminresign`, `hostingaccessset`, `hostingaccess`, `memberpairingset`, `memberpairings` (R10, R11, R19) need rows in the op table (classes, the `by` stamp) before a caller can reach them.
- **legacy-checks**: `AI_CREDENTIAL_CHECKS` has no rows for `AI_CREDENTIAL_ORG_NOT_ADMIN` (R62) and `AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER` (R29); `PROJECT_JOIN_REQUEST`/custodial catalogues none for `LAST_COMMITTED_OWNER`, `RESIGN_AT_TWO`, `NO_HOLDERS`, `PAIRING_NOT_YOURS`. They answer `check: "membership.R<n>"` meanwhile.
- **query-language** (N37, K63): `query.mjs` keeps its own `viewerPredicate`/`GATE_MARK`; make them re-exports of membership's.
- **promotion** (K62): `promote()` still writes the owner row and the creation visibility itself (store.mjs, `INSERT OR REPLACE INTO project_participants`, `INSERT INTO project_visibility`); `projectCreated` (R71) is ready for it. Note that a promotion-created owner row carries no `owner_order` and so orders first in R65 until `projectCreated` writes it.
- **legacy-tests** (the old battery, 211 suites run on the new tranche base and on this branch): 18 suites differ. None is a fault of the module; each is one of:
  - *source-anchored* (reads `store.mjs`/`schema.mjs` text, or assumes `src/` has no subdirectories), to re-anchor or retire with the legacy code (mechanics §12.3): `adminvote` (memberadd relay shape), `affordances` (2, `#isProjectOwner`/`#positionalMember` in the facts region), `aicredential` (7 of 9: schema text, method spans), `bounds` (op walk, the `PROJECT_DIRECTORY_LIMIT` literal), `d311-roster-affordances` (1, `#rescueRefusal`), `founder-sight` (legacy-build anchor; its ENOENT is N32), `hygiene` (9 more than base: exemptions looked for in `schema.mjs`, the flat-`src/` assumption), `meaning-bounds` (`#sessionRights` return), `mk7-attribution` (anchors), `project-discoverable` (DDL anchors; ENOENT N32), `project-join-request` (2, the `PROJECT_REQUESTS_LIMIT` literal), `project-sight` (1, the op-map names now in `membershipOps`), `rung-ladder` (`reasoned` backing read from store text), `shadowed-refusals` (refusals read from store text), `signer-enrolment` (the three-reader pin, now `attestingKeys`, as K57 said), `statusby` (the writer census).
  - *asserting the behaviour an entry changes*: `rec-186-leave-join` and `d311-roster-affordances` (`LAST_OWNER_CANNOT_LEAVE` → `LAST_COMMITTED_OWNER`, REC-224); `project-join-request` 6c/6d (an invitation now closes the request, REC-226); `aicredential` (2) and `airun-contextkind` (4): a member minting a credential for ANOTHER member (`principalMember: "vera"` by ruth) is now refused (R29), so their fixtures must mint as the principal.
  - One improved: `capturerequests` 137/2 → 138/1.
- **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; BOB regenerates at the close): the plane's sources changed and `src/membership/` is new input.

## Tests and checks run

- `node --test bio-plane/test/m/membership/` (my module, over node:sqlite with a stub record-core, and two R59 tests over the real record-core): `tests 73, pass 73, fail 0`. About 45 runs in the job; failures on the way were my own test wording, node:sqlite's null-prototype rows, a same-millisecond tie in R65 (fixed by an owner counter), and R59 (above).
- With record-core: `node --test bio-plane/test/m/record-core/` passes beside mine (105 together before R59's extra test).
- Old battery on this branch against `tranche/T3` @ 91933d7587, 211 suites touching this module: as reported above; `membership.test.mjs` 97/0, `members` 96/0, `projects` 115/0, `project-authority` 63/0, `gate-reads` 115/0, `bootstrap` 18/0.
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs .` — `format: 62 modules, 24 requirements files; 0 failures`
- `node checks/architecture.mjs . membership` — `architecture: 11 product files, 23 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs . membership` — `coverage: 1 modules, 74 of 74 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs . membership tranche/T3` (civicos-process @ 55b90bb) — `ownership: 14 files changed by membership between tranche/T3 and HEAD; legacy-store: 118 line(s) added, 3013 removed; 0 failures`

## Lines added to legacy-store (ownership check, ADDED)

```
ADDED bio-plane/src/store.mjs:223  import { Membership, membershipOf, membershipOps } from "./membership/index.mjs";
ADDED bio-plane/src/store.mjs:1404  membershipOf(this.ctx).migrate();   /* membership's tables (R57–R59), after the schema pass: nothing in the schema text names them */
ADDED bio-plane/src/store.mjs:10257  signers: membershipOf(this.ctx).attestingKeys(),   /* membership R70: the ONE predicate (D-158) */
ADDED bio-plane/src/store.mjs:17188  #viewerSees(...a) { return membershipOf(this.ctx).inSight(...a); }
ADDED bio-plane/src/store.mjs:22679  #positionalMember(...a) { return membershipOf(this.ctx).positionalMember(...a); }
ADDED bio-plane/src/store.mjs:33582  bootstrapState(...a) { return membershipOf(this.ctx).bootstrapState(...a); }
ADDED bio-plane/src/store.mjs:33583  
ADDED bio-plane/src/store.mjs:33584  claim(...a) { return membershipOf(this.ctx).claim(...a); }
ADDED bio-plane/src/store.mjs:33585  
ADDED bio-plane/src/store.mjs:33586  setPassword(...a) { return membershipOf(this.ctx).setPassword(...a); }
ADDED bio-plane/src/store.mjs:34043  static LOGIN_REFUSAL_DETAIL = Membership.LOGIN_REFUSAL_DETAIL;
ADDED bio-plane/src/store.mjs:34044  
ADDED bio-plane/src/store.mjs:34045  login(...a) { return membershipOf(this.ctx).login(...a); }
ADDED bio-plane/src/store.mjs:34046  
ADDED bio-plane/src/store.mjs:34047  session(...a) { return membershipOf(this.ctx).session(...a); }
ADDED bio-plane/src/store.mjs:34136  #isProjectOwner(...a) { return membershipOf(this.ctx).isProjectOwner(...a); }
ADDED bio-plane/src/store.mjs:34137  #isJoinedParticipant(...a) { return membershipOf(this.ctx).isJoinedParticipant(...a); }
ADDED bio-plane/src/store.mjs:34229  #projectAuthority(...a) { return membershipOf(this.ctx).projectAuthority(...a); }
ADDED bio-plane/src/store.mjs:34231  #caseAuthority(...a) { return membershipOf(this.ctx).caseAuthority(...a); }
ADDED bio-plane/src/store.mjs:34233  #inSight(...a) { return membershipOf(this.ctx).inSight(...a); }
ADDED bio-plane/src/store.mjs:34234  static SIGHT_NONE = Membership.SIGHT_NONE;
ADDED bio-plane/src/store.mjs:34235  static SIGHT_EXISTENCE = Membership.SIGHT_EXISTENCE;
ADDED bio-plane/src/store.mjs:34236  static SIGHT_FULL = Membership.SIGHT_FULL;
ADDED bio-plane/src/store.mjs:34237  #visibilityOf(...a) { return membershipOf(this.ctx).visibilityOf(...a); }
ADDED bio-plane/src/store.mjs:34238  #reindexProjectSight(...a) { return membershipOf(this.ctx).reindexProjectSight(...a); }
ADDED bio-plane/src/store.mjs:34239  #existenceAct(...a) { return membershipOf(this.ctx).existenceAct(...a); }
ADDED bio-plane/src/store.mjs:34312  projectVisibilitySet(...a) { return membershipOf(this.ctx).projectVisibilitySet(...a); }
ADDED bio-plane/src/store.mjs:34314  #visibilitySettingRefusal(...a) { return membershipOf(this.ctx).visibilitySettingRefusal(...a); }
ADDED bio-plane/src/store.mjs:34316  projectVisibility(...a) { return membershipOf(this.ctx).projectVisibility(...a); }
ADDED bio-plane/src/store.mjs:34317  
ADDED bio-plane/src/store.mjs:34318  projectDirectory(...a) { return membershipOf(this.ctx).projectDirectory(...a); }
ADDED bio-plane/src/store.mjs:34319  static PROJECT_DIRECTORY_LIMIT = Membership.PROJECT_DIRECTORY_LIMIT;
ADDED bio-plane/src/store.mjs:34320  
ADDED bio-plane/src/store.mjs:34321  static JOIN_REQUEST_ANSWERS = Membership.JOIN_REQUEST_ANSWERS;
ADDED bio-plane/src/store.mjs:34322  
ADDED bio-plane/src/store.mjs:34323  projectRequest(...a) { return membershipOf(this.ctx).projectRequest(...a); }
ADDED bio-plane/src/store.mjs:34324  
ADDED bio-plane/src/store.mjs:34325  projectRequestWithdraw(...a) { return membershipOf(this.ctx).projectRequestWithdraw(...a); }
ADDED bio-plane/src/store.mjs:34326  
ADDED bio-plane/src/store.mjs:34327  projectRequestAnswer(...a) { return membershipOf(this.ctx).projectRequestAnswer(...a); }
ADDED bio-plane/src/store.mjs:34328  
ADDED bio-plane/src/store.mjs:34329  projectRequests(...a) { return membershipOf(this.ctx).projectRequests(...a); }
ADDED bio-plane/src/store.mjs:34330  static PROJECT_REQUESTS_LIMIT = Membership.PROJECT_REQUESTS_LIMIT;
ADDED bio-plane/src/store.mjs:34331  #rosterInSight(...a) { return membershipOf(this.ctx).rosterInSight(...a); }
ADDED bio-plane/src/store.mjs:34539  #ownsAnyProject(...a) { return membershipOf(this.ctx).ownsAnyProject(...a); }
ADDED bio-plane/src/store.mjs:34541  #isProjectEditor(...a) { return membershipOf(this.ctx).isProjectEditor(...a); }
ADDED bio-plane/src/store.mjs:34543  #participation(...a) { return membershipOf(this.ctx).participation(...a); }
ADDED bio-plane/src/store.mjs:34544  #isAdminMember(...a) { return membershipOf(this.ctx).isAdministrator(...a); }
ADDED bio-plane/src/store.mjs:34546  projectClaimOwner(...a) { return membershipOf(this.ctx).projectClaimOwner(...a); }
ADDED bio-plane/src/store.mjs:34548  projectInvite(...a) { return membershipOf(this.ctx).projectInvite(...a); }
ADDED bio-plane/src/store.mjs:34549  
ADDED bio-plane/src/store.mjs:34550  projectJoin(...a) { return membershipOf(this.ctx).projectJoin(...a); }
ADDED bio-plane/src/store.mjs:34551  
ADDED bio-plane/src/store.mjs:34552  projectLeave(...a) { return membershipOf(this.ctx).projectLeave(...a); }
ADDED bio-plane/src/store.mjs:34553  
ADDED bio-plane/src/store.mjs:34554  projectRemove(...a) { return membershipOf(this.ctx).projectRemove(...a); }
ADDED bio-plane/src/store.mjs:34555  
ADDED bio-plane/src/store.mjs:34556  projectOwnerAdd(...a) { return membershipOf(this.ctx).projectOwnerAdd(...a); }
ADDED bio-plane/src/store.mjs:34557  
ADDED bio-plane/src/store.mjs:34558  #rescueRefusal(...a) { return membershipOf(this.ctx).rescueRefusal(...a); }
ADDED bio-plane/src/store.mjs:34559  
ADDED bio-plane/src/store.mjs:34560  projectOwnerRescue(...a) { return membershipOf(this.ctx).projectOwnerRescue(...a); }
ADDED bio-plane/src/store.mjs:34561  
ADDED bio-plane/src/store.mjs:34562  projectOwnerRemove(...a) { return membershipOf(this.ctx).projectOwnerRemove(...a); }
ADDED bio-plane/src/store.mjs:34948  expertiseDeclare(...a) { return membershipOf(this.ctx).expertiseDeclare(...a); }
ADDED bio-plane/src/store.mjs:34950  expertiseConfirm(...a) { return membershipOf(this.ctx).expertiseConfirm(...a); }
ADDED bio-plane/src/store.mjs:34952  expertiseList(...a) { return membershipOf(this.ctx).expertiseList(...a); }
ADDED bio-plane/src/store.mjs:34954  projectParticipants(...a) { return membershipOf(this.ctx).projectParticipants(...a); }
ADDED bio-plane/src/store.mjs:34956  static CAPABILITIES = Membership.CAPABILITIES;
ADDED bio-plane/src/store.mjs:34958  static adminMath = Membership.adminMath;
ADDED bio-plane/src/store.mjs:34960  static ownerMath = Membership.ownerMath;
ADDED bio-plane/src/store.mjs:34961  
ADDED bio-plane/src/store.mjs:34962  projectOwnerArithmetic(...a) { return membershipOf(this.ctx).projectOwnerArithmetic(...a); }
ADDED bio-plane/src/store.mjs:34963  
ADDED bio-plane/src/store.mjs:34964  #owners(...a) { return membershipOf(this.ctx).projectOwners(...a).sort(); }
ADDED bio-plane/src/store.mjs:34965  
ADDED bio-plane/src/store.mjs:34966  adminArithmetic(...a) { return membershipOf(this.ctx).adminArithmetic(...a); }
ADDED bio-plane/src/store.mjs:34967  
ADDED bio-plane/src/store.mjs:34968  static ROOT_ADMIN = Membership.ROOT_ADMIN;
ADDED bio-plane/src/store.mjs:34969  
ADDED bio-plane/src/store.mjs:34970  #activeAdmins(...a) { return membershipOf(this.ctx).activeAdmins(...a); }
ADDED bio-plane/src/store.mjs:34971  
ADDED bio-plane/src/store.mjs:34972  
ADDED bio-plane/src/store.mjs:34973  
ADDED bio-plane/src/store.mjs:34974  
ADDED bio-plane/src/store.mjs:34975  
ADDED bio-plane/src/store.mjs:34976  memberCaps(...a) { return membershipOf(this.ctx).memberCaps(...a); }
ADDED bio-plane/src/store.mjs:34977  
ADDED bio-plane/src/store.mjs:34978  adminEndorse(...a) { return membershipOf(this.ctx).adminEndorse(...a); }
ADDED bio-plane/src/store.mjs:34979  
ADDED bio-plane/src/store.mjs:34980  adminRemove(...a) { return membershipOf(this.ctx).adminRemove(...a); }
ADDED bio-plane/src/store.mjs:34981  
ADDED bio-plane/src/store.mjs:34982  memberAdd(...a) { return membershipOf(this.ctx).memberAdd(...a); }
ADDED bio-plane/src/store.mjs:34983  
ADDED bio-plane/src/store.mjs:34984  
ADDED bio-plane/src/store.mjs:34985  
ADDED bio-plane/src/store.mjs:34986  inviteLook(...a) { return membershipOf(this.ctx).inviteLook(...a); }
ADDED bio-plane/src/store.mjs:34987  
ADDED bio-plane/src/store.mjs:34988  enroll(...a) { return membershipOf(this.ctx).enroll(...a); }
ADDED bio-plane/src/store.mjs:34989  
ADDED bio-plane/src/store.mjs:34990  memberList(...a) { return membershipOf(this.ctx).memberList(...a); }
ADDED bio-plane/src/store.mjs:34991  
ADDED bio-plane/src/store.mjs:34992  memberSet(...a) { return membershipOf(this.ctx).memberSet(...a); }
ADDED bio-plane/src/store.mjs:34993  
ADDED bio-plane/src/store.mjs:34994  static SIGNER_ATTESTS = Membership.SIGNER_ATTESTS;
ADDED bio-plane/src/store.mjs:34995  
ADDED bio-plane/src/store.mjs:34996  
ADDED bio-plane/src/store.mjs:34997  signerAdd(...a) { return membershipOf(this.ctx).signerAdd(...a); }
ADDED bio-plane/src/store.mjs:34998  
ADDED bio-plane/src/store.mjs:34999  signerList(...a) { return membershipOf(this.ctx).signerList(...a); }
ADDED bio-plane/src/store.mjs:35000  
ADDED bio-plane/src/store.mjs:35001  signerSet(...a) { return membershipOf(this.ctx).signerSet(...a); }
ADDED bio-plane/src/store.mjs:35050  signers: membershipOf(this.ctx).attestingKeys(),   /* membership R70: the ONE predicate (D-158) */
ADDED bio-plane/src/store.mjs:42168  aiCredentialMint(...a) { return membershipOf(this.ctx).aiCredentialMint(...a); }
ADDED bio-plane/src/store.mjs:42170  aiCredentialRevoke(...a) { return membershipOf(this.ctx).aiCredentialRevoke(...a); }
ADDED bio-plane/src/store.mjs:42172  aiCredentialLook(...a) { return membershipOf(this.ctx).aiCredentialLook(...a); }
ADDED bio-plane/src/store.mjs:42174  aiCredentials(...a) { return membershipOf(this.ctx).aiCredentials(...a); }
ADDED bio-plane/src/store.mjs:49699  ...membershipOps(membershipOf(this.ctx), url, body, this.env),
 14 files changed by membership between tranche/T3 and HEAD; legacy-store: 118 line(s) added, 3013 removed; 0 failures
```

## Questions

### Q1 · how membership reaches record-core, and the parts of the extraction outside my paths (ANSWERED by BOB: K61, K63)

1. **record-core's shape.** record-core's Provides name services (`bundleInfo`, `listByType`, `declarePurge`, `transact`) but no module shape, and its job has pushed nothing yet. **Best reading, on which I build:** `bio-plane/src/membership/index.mjs` exports a class `Membership`, constructed with `{ sql, core }`: `sql` the store's SqlStorage, `core` an object carrying record-core's Provides as methods of those names. The legacy store builds one per Store instance and passes itself as `core` (so record-core's job's delegating methods on `Store`, e.g. `store.bundleInfo`, reach it); membership joins only `bundles.bundle_id`/`object_type` in its own SQL (R37) and reads a title through `core.bundleInfo`. Its tests run against a stub `core` implementing record-core's Provides over the same database. If record-core exposes a different shape, I adapt at the merge.
2. **`viewerPredicate` in `query.mjs` (query-language, layer 5).** I cannot edit `query.mjs`. Membership gets its own `viewerPredicate` and `GATE_MARK` (R43, K57); `query.mjs` keeps its copy until query-language's job makes it a re-export of membership's. legacy-store keeps importing it from `query.mjs` (changing that import line would add a line to an import of a module not mine). For BOB to route: a `query-language` entry.
3. **The old battery** (`bio-plane/test/*.test.mjs`, legacy-tests) keeps reaching this code through legacy-store's methods and ops, which delegate to membership; I change no old test.

**BOB's answer (K61, K63), applied at `60930e3fd0`:** the factory shape above; `viewerPredicate`/`GATE_MARK` are membership's and `query.mjs` keeps its copy until N37; no old battery test changes. K62: `promote()`/`reopen()` are promotion's; I did not edit them.

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01LSy7nZpkVyvEV81G4a5SYA,job,membership,62055247,414333,402,158828,196,45,3416
```
