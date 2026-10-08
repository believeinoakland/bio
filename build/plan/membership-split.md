# membership: proposed split boundary (N783; K617, K624, K2186)

This is a helper's proposal for BOB. It is read-only work on `tranche/T38`. Line numbers are for `tranche/T38` as checked out. Paths are relative to `/home/user/bio`.

## (a) membership today

**Files** (`build/modules.json`:38: `paths` = `bio-plane/src/membership/`; `uses` = record-grammar, signatures, record-core, test-support):

| file | lines | holds |
|---|---|---|
| `bio-plane/src/membership/index.mjs` | 3,202 | all code |
| `bio-plane/src/membership/checks.mjs` | 484 | refusal rows: `MEMBERSHIP_CHECKS` 37–213, `MEMBER_ID_CHECKS` 232–241, `CUSTODIAL_CHECKS` 267–329, `PROJECT_AUTHORITY_CHECKS` 342–356, `PROJECT_VISIBILITY_CHECKS` 366–394, `PROJECT_JOIN_REQUEST_CHECKS` 404–459, `CASE_AUTHORITY_CHECKS` 471–484 |
| `bio-plane/src/membership/schema.mjs` | 284 | DDL. Member-side tables: `members` 9–44, `member_expertise` 148–156, `admin_votes` 201–208, `hosting_access` 212–218, `join_doors` 224–236, `group_description` 240–249, `court_notice` 253–258. Project-side tables: `project_visibility` 56–64, `project_sight` 87–91, `project_join_requests` 105–120, `project_participants` 129–143, `project_owner_votes` 162–170, `project_owner_decisions` 174–183, `project_removals` 187–195. Purge lists at 280–284 |
| **total own code** | **3,970** | tests (excluded): 22 files in `test/m/membership/` (4,072 lines) and `test/members.test.mjs` (667 lines) |

**Main groups in `index.mjs`.** Counts are approximate, from the line ranges given:

| group | lines | where |
|---|---|---|
| Module-level functions most modules import: `GATE_MARK`/`viewerPredicate` R43, `hiddenBundles` R88, `noSuchProject` R78, `notAnAdmin` R84, `notAParticipant` R87, `MODULE_ORDER` R83, `listenerRefusal` R81 | ~216 | 32–247 |
| Plumbing: `migrate`, `declareTables` R59, `counts` R96, the reserved-id audit, `onRevoked` R79, `registerClaimed` R94, `registerPasswordSetter` R95 | ~195 | 249–443 |
| Member facts and small member acts: `memberFacts` R68, `adminResign` R10, `hostingAccess*` R11/R82, pairings R19/R82, `positionalMember` R76, `sessionRights` R92 | ~192 | 445–664 (less 451–478) |
| **Project facts, sight and the fence:** `isProjectOwner`/`isJoinedParticipant` R54, `projectAuthority` R55, `caseAuthority` R56, `inSight` R80, `sight` R44, `visibilityOf` R85, `reindexProjectSight`, `existenceAct` R77, `visibilitySettingRefusal` R47, `ownsAnyProject` R67, `isProjectEditor` R66, `participation` R74, `projectClaimOwner` R31, `rescueRefusal` R75, `ownerMath`/`projectOwnerArithmetic` R38, `projectOwners` R65, `activeParticipants` R69, `projectCreated` R71 | ~506 | 451–478, 666–975, 1024–1042, 1453–1518, 1699–1726, 2002–2056 |
| **Project acts (the working group's own acts):** `projectVisibilitySet` R45, `projectVisibility` R46, `projectDirectory` R48, requests to join R49–R53, `rosterInSight`, `projectInvite` R32/R33, `projectJoin` R34, `projectLeave` R35, `projectRemove` R36/R63, `projectOwnerAdd` R39, `projectOwnerRescue` R41, `projectOwnerRemove` R40, `projectParticipants` R37/R42/R63, the vote helpers | ~803 | 977–1022, 1044–1452, 1520–1697, 1728–1852, 1955–1976, 2057–2079 |
| Expertise R21–R24 | ~100 | 1854–1953 |
| Administrators, invitations, the roster: `CAPABILITIES`/`adminMath` R4/R5, `activeAdmins` R86, `memberCaps` R9, `adminEndorse` R6, `adminRemove` R7/R8, `memberAdd` R12–R14, `inviteLook`/`enroll` R15/R16/R108, `memberList` R17/R18/R105, `memberSet` R20 | ~554 | 1978–2001, 2080–2609 |
| T34: R97 helpers, `inviteWithdraw` R98, the two doors R99–R105, `checkAddressees` R106, court notice R107/R108, group description R109/R110 | ~446 | 2610–3055 |
| `membershipOf` and the ops map `membershipOps` | ~147 | 3056–3202 |

**Who calls what.** 79 modules import membership in code; my script's list is in `scratchpad/imports.txt`. Five more declare the use and reach it another way: `admission`, `attestation`, `law-relations` (`this.k.membership.inSight`, `law-relations/index.mjs`:194), `op-declarations` and `setup-page`.

- **Imported names** across those modules: `membershipOf`, `viewerPredicate`, `GATE_MARK`, `hiddenBundles`, `noSuchProject`, `notAParticipant`, `notAnAdmin`, `listenerRefusal`, `MODULE_ORDER`, `Membership`, `CUSTODIAL_CHECKS` (`promotion/index.mjs`:21), `membershipOps` (`plane/store.mjs`:23), and checks as a namespace (`answer-envelope/families.mjs`:18).
- **Instance methods called from other modules' code** (modules calling each, from a line scan):
  - Sight: `inSight` (~37), `existenceAct` (18), `sight` (16).
  - Members and admins: `isAdministrator` (21), `memberFacts` (17), `activeAdmins` (7).
  - Project facts: `isProjectOwner` (13), `positionalMember` (13), `projectAuthority` (11), `projectOwners` (11), `isJoinedParticipant` (7), `participation` (6).
  - Used by one or two modules:
    - `caseAuthority` (`ratification`).
    - `rescueRefusal` and `Membership.ownerMath` (`affordances/facts.mjs`:144–146).
    - `ownsAnyProject` and `isProjectEditor`.
    - `visibilityOf` and `reindexProjectSight` (`store-door/dispatch.mjs`:167, `store-door/step.mjs`:26).
    - `projectCreated` and `visibilitySettingRefusal` (`promotion/index.mjs`:844, :477).
    - `expertiseList` (`tasks`, `filing-templates`).
    - `checkAddressees` (`tasks/index.mjs`:785).
    - `courtNotice` and `COURT_STATEMENT` (`hypotheses/index.mjs`:406, :419).
    - `groupDescription` (`bias/index.mjs`:688, `publication/index.mjs`:363).
    - `credentials`' seams: `sessionRights`, `onRevoked`, `registerClaimed`, `registerPasswordSetter` (`credentials/index.mjs`:119–121, :439).
- **No other module's code calls any project act or member act** (R32–R53, R6–R20, R98–R105, R109 setters). They are reached only through the ops map (`index.mjs`:3072–3202, spread at `plane/store.mjs`:509). But **tests** in 16 other modules call `projectInvite`/`projectJoin`/`projectLeave`/`projectRemove`/`projectOwnerAdd`/`projectVisibilitySet` on the membership instance as setup: 27 files, listed in C1 below.

**What fixes the boundary: who owns which table.** `viewerPredicate`'s SQL reads `project_participants` and `members` (`index.mjs`:62–68). `sight`/`visibilityOf` read `project_sight` (883–887), and `reindexProjectSight` reads `project_visibility` (929–949). About 70 modules call these, so they and those four tables must stay in membership, the earlier module. A later module may read them only through a stated read contract; record-core R37 is the precedent. Writes from a later module go through membership services, as `promotion` already does through R71 (`index.mjs`:461) and K651 allowed. Moving the sight rule itself, or the member facts (`isAdministrator`, `memberFacts`, `listenerRefusal`, `MODULE_ORDER`), would re-point about 50–70 modules' code. So both candidates leave them where they are.

---

## (b) Two candidate boundaries

In both candidates the new module comes **after** membership (layer 2, directly after `membership` and before `credentials`), because it uses membership and membership never calls it.

### C1 (recommended): the project's working-group acts move to a new module, `project-roster`

**Moves (copy, then delete).**

- `index.mjs`, 840 lines:
  - `projectVisibilitySet` 977–1022, `projectVisibility` 1044–1057, `projectDirectory` with `PROJECT_DIRECTORY_LIMIT` 1059–1152.
  - The whole requests block 1154–1440: `JOIN_REQUEST_ANSWERS`, `#activeMemberRow`, `#requester`, `#joinRequestRefusal`, `#noRequester`, `#noOpenRequest`, `#openJoinRequest`, `#closeJoinRequests`, `#lapseJoinRequests`, `projectRequest*`, `PROJECT_REQUESTS_LIMIT`.
  - `rosterInSight` 1442–1451.
  - `projectInvite` 1520–1547, `projectJoin` 1549–1560, `projectLeave` 1562–1597, `projectRemove` 1599–1638.
  - `projectOwnerAdd` 1640–1697, `projectOwnerRescue` 1728–1782, `projectOwnerRemove` 1784–1852.
  - `projectParticipants` 1955–1976, `#committedOwners` 2058–2062, `#ownerVotes`/`#recordOwnerDecision` 2064–2079.
  - 15 op entries (3121–3130, 3136–3173; `projectclaimowner`, `projectownerarith` and the `expertise*` entries stay).
- `checks.mjs`, 105 lines: C-56.4 and C-56.5 (59–69), C-33.28 and C-33.48 (94–110), C-70.2 (373–379), C-70.4 (388–393), and the whole C-95 family (396–459).
- `schema.mjs`, 65 lines: `project_join_requests` (94–120), `project_owner_votes`, `project_owner_decisions` and `project_removals` (158–195), with their purge declaration.

**Stays in membership:** everything listed in (a) under facts, sight and the fence, plus all member-side code. That includes `projectClaimOwner` R31 (R71 needs it), `ownerMath`/`projectOwnerArithmetic` R38 (affordances reads `ownerMath`), `rescueRefusal` R75 (affordances), `visibilitySettingRefusal` R47 (promotion), `existenceAct` R77, `notAParticipant` R87 and `noSuchProject` R78. The tables `project_participants`, `project_visibility` and `project_sight` stay too.

**Requirement ids that move.** Each is retired in membership as "moved to project-roster R<n>"; the numbering is my suggestion.

- Participation: R32→R1, R33→R2, R34→R3, R35→R4, R36→R5, R63→R6, R37→R7.
- Ownership: R39→R8, R40→R9, R41→R10, R42→R11.
- Visibility and the directory: R45→R12, R46→R13, R48→R14.
- Requests to join: R49→R15, R50→R16, R51→R17, R52→R18, R53→R19.

Four ids straddle the seam. Each is retired and split, following R92's precedent ("was R3's rights half", `requirements/membership.md`:19), with no change of meaning:

- **R82** (`requirements/membership.md`:156): the owner-deciders bound becomes project-roster R20. The `hostingAccess`/`memberPairings` bounds stay as a new membership id.
- **R96** (:162): the `projectOwnerVotes` figure goes to project-roster. The `projectParticipants` figure stays as a new membership id. The wire keys do not change (`record-core/index.mjs`:1815, `test/m/plane/stats.test.mjs`:21). `plane/stats.mjs`:25 registers a second source.
- **R59** (:179): the purge-keyed owner votes and requests (with decisions and removals) go to project-roster. Members, expertise and votes stay exempt, and participation, visibility and the sight index stay keyed.
- **Cross-references re-pointed only:** R60 (:180, "the only project act … R41"), R75 (:139), R84 (:149, R41 in its list), R87 (:106, "R35 here").

**New membership services the moved code needs** (new ids, about 70 lines):

- `participationWrite`: invite, state joined/leaving with comment, remove, owner on (next `owner_order`), owner off, rescue upsert. These are writes only, in the caller's transaction, with no checks of their own. They replace the inline SQL at 1366, 1540, 1557, 1593, 1632, 1690, 1771 and 1845.
- `visibilityRecord`: append to `project_visibility` and reindex. R71's own insert (474–476) and project-roster R12 both use it.
- `memberByHandle(handle)`: today's private `#memberByHandle` (673–675), made a service.
- A stated read contract in record-core R37's form: `members (member_id, handle, status)`, `project_participants (project_id, member_id, state, owner, owner_order, created)` and `project_sight (project_id, setting)`. The moved SQL joins these: the directory 1119–1127, `projectRequests` 1425–1430, `projectParticipants` 1963–1966 and `#ownerVotes` 2068–2072.

project-roster otherwise calls only services that are already public:

- `existenceAct`, `inSight`, `sight` and `SIGHT_*`.
- `isProjectOwner`, `participation`, `projectOwners`, `isAdministrator`, `rescueRefusal`, `ownerMath`.
- `visibilitySettingRefusal`, `viewerPredicate`, `noSuchProject`, `notAParticipant`, `memberFacts`, `ROOT_ADMIN`.
- `core.bundleInfo` and `declarePurge` from record-core.

**Size after the split:**

- **membership** ≈ 3,970 − 1,010 + ~70 (services) + ~20 (N793 helper) ≈ **3,050**.
- **project-roster** ≈ 1,010 + ~80 (header, class, `migrate`/purge, `counts`, `projectRosterOf`, ops map) ≈ **1,090**.

**`uses` edges:**

- New `project-roster`: `["record-grammar", "record-core", "membership", "test-support"]`. It needs `MACHINE_CLASS_PREFIX` from record-grammar (1178).
- `membership` loses nothing; it never used the moved code.
- `plane` and `answer-envelope` gain `project-roster`.

**Code that must be re-pointed (2 modules):**

- `plane`:
  - `plane/store.mjs`:509: spread `projectRosterOps`, and build or migrate it after membership (408).
  - `plane/stats.mjs`:25: add the owner-votes figure source.
- `answer-envelope`: `answer-envelope/families.mjs`:126 needs the new `src/project-roster/checks.mjs` in membership's place. Its `families.test.mjs` holds the list to `modules.json`'s order (line 271).

op-declarations and control-plane key these ops by name (`op-declarations/index.mjs`:510–537, `PROJECT_ACTIONS` 1459–1466), so they do not change.

**Tests that must be re-pointed** (the instance's project acts used as setup; 27 files in 16 modules):

| module | files |
|---|---|
| affordances | `converts.test.mjs` |
| ai-runs | `state.test.mjs`, `tick-close.test.mjs`, `world.mjs` |
| basis-versions | `conclude-project-arm.test.mjs`, `project-discoverable.test.mjs`, `t20-figures.test.mjs` |
| bias | `adopt-manifest.test.mjs`, `debt.test.mjs` |
| capture-sources | `credentials.test.mjs` |
| case-authoring | `fences.test.mjs` |
| citation | `existence.test.mjs` |
| conformance | `determine.test.mjs`, `fixture.mjs`, `reads.test.mjs` |
| consequences | `fixture.mjs` |
| filings | `fixture.mjs`, `sight.test.mjs` |
| network-notices | `post.test.mjs`, `prepare.test.mjs`, `reads.test.mjs` |
| project-stage | `stage.test.mjs` |
| publication | `convert-casesign.test.mjs`, `convert-deliverer.test.mjs` |
| queue | `converts.test.mjs` |
| ratification | `finding-commit.test.mjs` |
| review | `fixture.mjs` |

All files are under `bio-plane/test/m/`. Most of these are fixtures. BOB should check whether the architecture check reads test imports; if it does, those 16 modules' `uses` also gain `project-roster`.

**membership's own tests:**

- Move: `participation.test.mjs`, `ownership.test.mjs`.
- Split by id: `requests-fence-facts.test.mjs`, `sight.test.mjs`, `no-such-project.test.mjs`, `t35-words.test.mjs`, `t14-rows-remedy-order.test.mjs`, `t9-notice-sight-bounds.test.mjs`, `t20-figures.test.mjs`.
- Set up participation through `participationWrite`: `hidden-bundles.test.mjs` and `t19-seam.test.mjs`.

**Risk:** the 27 test files re-pointed by membership's job (T38-4). This is mechanical, mostly fixtures.

**Variant C1′.** Keep the setup acts (R32–R36, R45) in membership, to spare the 27 test files. This needs two new notice slots in membership, in R79's form, because R33 (an invitation closes a request) and R45 (hiding a project lapses requests) write project-roster's requests table, and their answers carry `request: "granted"` and `requests_lapsed`. It leaves membership ≈ 3,300 and project-roster ≈ 800. I don't recommend it: it adds listener plumbing for less headroom.

### C2: the group's two doors and its self-description move to a new module, `group-doors`

**Moves:**

- `index.mjs`, 333 lines: doors 2704–2939, `#dailyCapRefusal`/`#doorCapabilities` 2642–2663, group description 2991–3054, and 11 op entries (3186–3194, 3199–3200).
- `checks.mjs`, 75 lines: C-96.25–.33 (132–184) and C-96.35–.38 (191–212).
- `schema.mjs`, 30 lines: `join_doors` and `group_description` (220–249).

**Requirement ids that move:** R99, R100, R101, R102, R103, R104, R109, R110.

- **Split** (R92 precedent): R105, whose roster fields and "the member a door makes" stay in membership as a new id (`memberList` 2554–2558; `#doorMember` writes `members`, 2838–2843), and R111, whose court-notice half stays.
- **Stay:** R11 stays because R82 binds it to R19. R107 and R108 stay because `enroll` (2489–2490) reads `courtNotice` and cannot call a later module.

**New membership services:**

- A door-member creation service, in place of `#doorMember`.
- R97's expiry judgement made public (`#expiryRefusal`, 2632; C-96.23 keeps one site).
- R9's capability judgement made public, so that `BAD_CAPABILITY` is not minted across modules (2659–2661 against 2178/2184).
- A count of invitations a given actor made since a time (`#doorToday`, 2821–2824).
- `NO_COVER` (C-96.3) stays membership's row; doors import `CUSTODIAL_CHECKS`, as promotion does.

**Size after the split:**

- **membership** ≈ 3,970 − 438 + ~45 + ~20 (N793) ≈ **3,600**.
- **group-doors** ≈ **510**.

**`uses` edges:**

- New `group-doors`: `["record-grammar", "record-core", "membership", "test-support"]`.
- `plane`, `answer-envelope`, `bias`, `publication` and `op-declarations` gain it.

**Code that must be re-pointed (5 modules):**

- `plane/store.mjs`:509
- `answer-envelope/families.mjs`:126
- `op-declarations/index.mjs`:360 (the `membership` family's `owner` and `cite` split into two families)
- `bias/index.mjs`:688
- `publication/index.mjs`:363

Tests: `bias/description-draft.test.mjs`, `publication/t34.test.mjs`, and membership's `t34-joining.test.mjs` (435 lines, which moves) and `t34-settings.test.mjs` (split).

**Weakness:** membership is left at ~3,600, so the next growth (T38's N793 and later jobs) brings it back toward the mark. R105 and R111 straddle the seam, and the purpose ("the doors and the description") is narrow.

### Comparison

| | C1 project-roster | C2 group-doors |
|---|---|---|
| membership after | ~3,050 | ~3,600 |
| new module | ~1,090 | ~510 |
| ids moved / split | 19 moved / 3 split (R59, R82, R96) | 8 moved / 2 split (R105, R111) |
| new membership services | 3 + a read contract | 4 |
| other modules' **code** re-pointed | 2 (plane, answer-envelope) | 5 |
| other modules' **tests** re-pointed | 27 files, 16 modules | 2 files, 2 modules |
| calls from new module into membership | ~18 existing services and 3 new ones; none the other way | ~6, none the other way |

---

## (c) Recommendation: C1, `project-roster`

- **Name:** `project-roster`. Alternatives: `project-governance`, `working-groups`.
- **Purpose (one sentence):** Owns the acts on a project as a working group: inviting, joining, leaving and removing participants, the owners' votes and an administrator's rescue, the owners' visibility setting and the directory, and requests to join, each with its record. What a caller may see of a project, the fence and the participation record itself stay membership's.
- **Place in the order:** layer 2, directly after `membership` and before `credentials`. The order becomes `record-core`, `membership`, `project-roster`, `credentials`, `promotion`. It must come after membership because it uses membership, and nothing in credentials or promotion uses it.
- **`modules.json` entry:** `{"id": "project-roster", "layer": 2, "paths": [], "tests": [], "uses": ["record-grammar", "record-core", "membership", "test-support"]}` at the opening. T38-3 sets `paths` `bio-plane/src/project-roster/` and `tests` `bio-plane/test/m/project-roster/` before its merge (K1347's pattern).

**Why C1:**

- It is the only boundary that leaves real headroom (~3,050) while keeping every widely imported name in membership. Only `plane` and `answer-envelope` re-point code.
- Each side has one clear job: membership is who the members are, what each may see, and the participation record; project-roster is the acts that change a project's group.
- Calls go one way only (project-roster → membership).
- It follows K651's pattern: later-module writes go through stated earlier-module services, as R71 already does for promotion.

**N793 (`NO_SUCH_MEMBER`, C-64).** Member lookup stays in **membership** under either candidate. It owns `members`, every `NO_SUCH_MEMBER` mint inside the module stays there (`index.mjs`:544, 1884, 1915, 2176, 2200, 2252, 2567, 2689), and C1's new `memberByHandle` sits beside it. So T38-4 adds the helper and the row (C-64) to membership. Callers:

- `credentials/index.mjs`:633
- `tasks/index.mjs`:612
- `setup.mjs`:2081–2085 (instance-setup drops its row at `setup.mjs`:276)
- setup-page's mapping (`setup-page/index.mjs`:1845)
- control-plane (`control-plane/index.mjs`:2430–2440 names it)

One note: the comment in `checks.mjs`:264, which says `NO_SUCH_MEMBER` deliberately has no row, must be corrected with it. project-roster does not mint `NO_SUCH_MEMBER`; it answers `NO_SUCH_HANDLE`.

---

## (d) R83 `MODULE_ORDER` re-pin

- **The constant:** `bio-plane/src/membership/index.mjs`:177–203. Add `"project-roster"` after `"membership"` in the layer-2 row (line 183), and add a T38 note to the comment block at 168–176.
- **Tests that pin the order to the file** (red from the opening's `modules.json` edit until T38-4):
  - `bio-plane/test/m/membership/module-order.test.mjs`:16: `deepEqual(MODULE_ORDER, modules.map(id))`.
  - `bio-plane/test/m/membership/module-order.test.mjs`:91–103: "every module … built". Any entry with empty `paths` must be named in `T33_NEW`/`T36_NEW` (43–60). If T38-3 has merged with `paths` set before T38-4 re-pins, nothing needs adding. Otherwise add a `T38_NEW = ["project-roster"]` tolerance. Also add a place pin, `["membership", "project-roster", "credentials"]`, to `SINCE_T33` (52–57) and its layer assertion (69).
  - `bio-plane/test/m/membership/t9-notice-sight-bounds.test.mjs`:188: `deepEqual(MODULE_ORDER, byLayer ids)`. It goes green once the constant is re-pinned.
- **Derived from the file or relative order only, so no edit is needed:**
  - `test/m/plane/store.test.mjs`:85–106; `src/plane/store.mjs`:111–115 (`STEP_ORDER`).
  - `test/m/store-door/record.mjs`:58–64; `test/m/control-plane/record.mjs`:59–63.
  - `test/m/promotion/registry.test.mjs`:42–58; `test/m/progressions/order.test.mjs`:11–23; `test/m/standards/reads.test.mjs`:200–231.
  - The `indexOf` comparisons in about 18 other modules' tests (ai-runs, bias, calibration, connections, content, entities, events, extraction, money, progressions, provenance, reading-pipeline, retrieval).
- **Not an order pin, but must follow:** `test/m/answer-envelope/families.test.mjs`:269–271. It holds `CHECK_FAMILY_FILES` (`answer-envelope/families.mjs`:122ff) in `modules.json` order, so it needs `src/project-roster/checks.mjs` after `src/membership/checks.mjs`. That is answer-envelope's share in C1.
