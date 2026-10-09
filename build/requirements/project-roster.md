# project-roster — requirements

**Status** · In force: a new helper module split from membership at T38's opening (N783; K617, K624, K2270); R1–R19 met at PROJECT-ROSTER #1's merge (K2278); R20 added then. Last changed T41 (T41-4: R5 reachable at an administrator's `EXISTENCE` of a hidden project; N822, D54, K2408); marked not yet met (T41).

## Public

### Purpose

Owns the acts on a project's working group that follow its setup: the participants' roster and the removals record, the owners' votes and an administrator's rescue, the visibility history and the directory, and requests to join, each with its record. Inviting, joining, leaving and removing, the visibility setting, what a caller may see of a project, the fence and the participation record itself stay `membership`'s.

### Provides

Terms (`membership`'s, which hold here). *Administrators* are the founder (the root of trust's session, id `admin`, once the instance is claimed) and every member with role `admin` and status `active`. An act's `by` is the actor the control plane stamps, never the caller's claim. *Sight* of a project is `FULL`, `EXISTENCE` or `NONE` (`membership` R44). Every service that names a project answers a caller at `EXISTENCE` with `PROJECT_SEEN_NOT_A_PARTICIPANT` (`membership` R44) and a caller at `NONE` exactly as an id that names nothing, before any other check; a `viewer` never sent (an internal caller) is not asked. Every refusal names its reason; no service throws.

**The roster**
- **R1** (was membership R37) `projectParticipants({projectId, by})` gives a participant, or an administrator at `FULL` sight of the project (`membership` R43), every participant's handle, state, owner flag and comment *(not yet met: T41; D54: an administrator neither invited nor joined to a hidden project is answered as anyone else)*; anyone else is answered `NO_SUCH_PROJECT`.
- **R2** (was membership R63) Every removal a project owner makes stays recorded with who removed whom, when and the owner's reason (`comment`), and every participant of the project can read it.

**Project ownership**
- **R3** (was membership R39) `projectOwnerAdd({projectId, handle, by, viewer})`: `NOT_THE_OWNER`; `NO_SUCH_HANDLE`; `NOT_ACTIVE`; `TARGET_NOT_JOINED` (C-56.5) unless the target has joined; `ALREADY_AN_OWNER`. The sole owner adds a second alone; beyond that every owner's vote is required (`CONSENSUS_REQUIRED` with `have`, `awaiting`).
- **R4** (was membership R40) `projectOwnerRemove({projectId, handle, by, reason, viewer})`: `NOT_THE_OWNER`; `NO_SUCH_HANDLE`; `NOT_AN_OWNER`; `NO_REASON`; `LAST_OWNER` at the floor; `TARGET_CANNOT_VOTE` when n ≥ 3 and `by` is the target; `ALREADY_VOTED`; `VOTES_SHORT`. Refused, naming them, when it would leave only `leaving` owners. Once carried the target loses ownership and stays a participant.
- **R5** *(not yet met: T41)* (was membership R41) `projectOwnerRescue({projectId, handle, by, reason, viewer})`: `NOT_AN_ADMIN` (`membership` R84); `NO_OWNERS` (a project created without an owner); `OWNERS_ARE_ACTIVE`, naming them, unless every owner is inactive; `NO_REASON`; `NO_SUCH_HANDLE`; `NOT_ACTIVE`. Adds the named member as a joined owner and keeps every existing owner's row. (T41; N822, D54; K2408, K2409) It is reachable at an administrator's `EXISTENCE` of a hidden project (one the administrator is neither invited nor joined to, `membership` R44, R60): there it is not refused `PROJECT_SEEN_NOT_A_PARTICIPANT`, and its refusals and its answer name nothing of the project beyond what that `EXISTENCE` shows (its id, name and owners) and the member named, never its contents or its other participants.
- **R6** (was membership R42) Every ownership decision (addition, removal, rescue) stays recorded with the deciders and the reason, and every participant of the project can read it.
- **R7** (was membership R82's owner-deciders half; N70, K285) `projectOwnerAdd`'s and `projectOwnerRemove`'s deciders (R3, R4) read the counted votes joined to the current owners, bounded by the owner count, which cannot cut a counted vote; nothing is published as a bound.

**Visibility history and the directory**
- **R8** (was membership R46) `projectVisibility({projectId, viewer})` gives the setting and its history to a caller at `FULL`, else the absent answer.
- **R9** (was membership R48) `projectDirectory({viewer, limit})`: `PROJECT_DIRECTORY_NEEDS_A_MEMBER` for a viewer naming no member; else the discoverable projects the caller does not see at `FULL`, each `{id, name, request}` where `request` is the caller's own latest request or null, in id order. The cap (`PROJECT_DIRECTORY_LIMIT`, 200) may be lowered, never raised; `truncated` is measured by reading one past the cap.

**Requests to join**
- **R10** (was membership R49) `projectRequest({projectId, comment, by, viewer})`: `PROJECT_REQUEST_NEEDS_A_MEMBER` when `by` and `viewer` do not name one active member (asked first); `NONE` answers as absent; `FULL` is refused `PROJECT_REQUEST_NOT_OUTSIDE`; `PROJECT_REQUEST_ALREADY_OPEN` (at most one open per member per project). Records the request with the name the caller was shown.
- **R11** (was membership R50) `projectRequestWithdraw({projectId, by, viewer})`: `PROJECT_REQUEST_NEEDS_A_MEMBER`; `PROJECT_REQUEST_NONE_OPEN`, the same answer whatever the id names; asks no sight.
- **R12** (was membership R51) `projectRequestAnswer({projectId, handle, answer, comment, by, viewer})`: `PROJECT_REQUEST_ANSWER_NOT_THE_OWNER` (administrators and the founder included); `PROJECT_REQUEST_UNKNOWN_ANSWER` unless `grant` or `decline`; `PROJECT_REQUEST_NONE_OPEN`. A grant is refused `PROJECT_REQUEST_REQUESTER_INACTIVE` or `PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT`, leaving the request open; otherwise it writes the participation `invited` with `invited_by` = `by`, never `joined`.
- **R13** (was membership R52) A request's asking fields are written once, and its closing fields (`granted`, `declined`, `withdrawn`, `lapsed`; who; comment; date) once. A closed request never reopens; the member may ask again.
- **R14** (was membership R53) `projectRequests({projectId, by, viewer, limit})` with no project gives the caller their own requests, each naming the project as shown when asked and never the answering owner; with a project, only its owners and administrators at `FULL` sight of it (`membership` R43) read it *(not yet met: T41; D54)* (`PROJECT_REQUESTS_NOT_VISIBLE` otherwise). Both capped (`PROJECT_REQUESTS_LIMIT`, 200) as R9.
- **R15** (membership R33's other half; N783, K624) At start this module registers once in `membership`'s invitation slot (`membership` R116). Each time it is told of an invitation `{projectId, memberId, by, at}`, an open request to join from that member to that project (R10) is closed `granted`, by `by`, at `at`, as R13 closes one; it answers the number of requests it closed (0 or 1).
- **R16** (membership R45's other half; N783, K624) At start this module registers once in `membership`'s hiding slot (`membership` R117). Each time it is told a project was set `hidden` `{projectId, by, at}`, every open request to join it is closed `lapsed`, recorded with `by` and `at`, as R13 closes one; it answers the number of requests it lapsed.

**Figures**
- **R17** (was membership R96's owner-votes half; K861, plane R10) The module exports a figure source shaped as `record-core` R63's `counts(hid)`, with its key list, for `plane` to register under this module's name: `projectOwnerVotes`, the rows of `project_owner_votes`, less the rows whose `project_id` is in `hid`, a NULL key naming no bundle (so never dropped by `hid`); a null `hid` counts whole. The module registers nothing itself.

## Private

### Uses

- `membership.existenceAct` (R77), `membership.inSight` (R80), `membership.sight` and its `SIGHT_*` constants (R44), `membership.viewerPredicate` (R43; the directory's gate), `membership.visibilityOf` (R85; R7's setting).
- `membership.isProjectOwner` (R54), `membership.participation` (R74), `membership.projectOwners` (R65), `membership.isAdministrator` (R64), `membership.memberFacts` (R68), `membership.ROOT_ADMIN`.
- `membership.ownerMath` (R38), `membership.rescueRefusal` (R75; R5 answers its first three refusals through it), `membership.notAnAdmin` (R84), `membership.noSuchProject` (R78).
- New in `membership` for this module (N783): `membership.participationWrite` (R118; R3–R5 and R12's writes), `membership.memberByHandle` (R119), `membership.onProjectInvited` (R116; R15) and `membership.onProjectHidden` (R117; R16), and `membership`'s read contract (R120): `members`, `project_participants`, `project_sight`, `project_visibility` and `project_removals`, columns as R120 names them.
- `record-core`: `bundleInfo` (R34; a project's type and title), the read contract on `bundles` (R37; the directory's join), `declarePurge` (R21, R46; R18 here).
- `record-grammar`: `MACHINE_CLASS_PREFIX` (R13; R10's "naming a member").
- `test-support` for tests.

### Invariants

- **R18** (was membership R59's project-roster half) Owner votes and requests (with the ownership decisions, R6) are keyed by project and cleared with it.
- **R19** (membership R61, held for this module's acts) Every act naming a project the caller cannot see answers byte for byte as an id that names nothing, and sight is asked before position.
- **R20** (DEC-149, Bob's "S4: B"; membership R112's rule, held for this module's strings; K2278) Every member- or founder-facing string this module answers (each row's `translation`, every refusal's `detail`, `message` and `remedy`) calls the group's own Civicsmith "your group's Civicsmith", or is reworded so it needs no name, and never "copy", "instance", "plane" or "server" for it. Codes, op names, field names and comments are not member-facing.

### Satisfies

- `BIO_Membership_Architecture_v2.md` §7 (7.7 and 7.8 for the roster and its removals; 7.10 for ownership, 7.13 for the rescue; 7.14, the directory and the request to join), §11 item 5 (a removal is an owner's act, recorded).
- Bob's ruling of 2026-09-26 recorded as membership R63 (now R2 here): every removal kept with its reason, readable by every participant.
- `BIO_System_Design.md` §3, construct 1 ("Membership and authority").

### Suggestions

- **What moves from `bio-plane/src/membership/` (line numbers on `tranche/T38`, from the proposal `membership-split.md`, narrowed to C1′).**
  - `index.mjs`: `projectVisibility` 1044–1057; `projectDirectory` with `PROJECT_DIRECTORY_LIMIT` 1059–1152; the requests block 1154–1440 (`JOIN_REQUEST_ANSWERS`, `#activeMemberRow`, `#requester`, `#joinRequestRefusal`, `#noRequester`, `#noOpenRequest`, `#openJoinRequest`, `#closeJoinRequests`, `#lapseJoinRequests`, `projectRequest`/`projectRequestWithdraw`/`projectRequestAnswer`/`projectRequests`, `PROJECT_REQUESTS_LIMIT`); `projectOwnerAdd` 1640–1697, `projectOwnerRescue` 1728–1782, `projectOwnerRemove` 1784–1852; `projectParticipants` 1955–1976; `#ownerVotes` and `#recordOwnerDecision` 2064–2079. Op entries: `projectowneradd`, `projectownerremove`, `projectownerrescue` (3122–3130), `projectvisibility`, `projectdirectory`, `projectparticipants`, `projectrequest`, `projectrequestwithdraw`, `projectrequestanswer`, `projectrequests` (3155–3173), spread in a new `projectRosterOps`.
  - **Stays in membership under C1′:** `projectVisibilitySet` (977–1022), `projectInvite`/`projectJoin`/`projectLeave`/`projectRemove` (1520–1638), `rosterInSight` (1442–1451), `#committedOwners` (2058–2062; R35 still reads it), and their op entries. This module states `rosterInSight`'s rule again over `membership.inSight` (two lines) rather than import it, and computes the committed owners from the read contract for R4.
  - `checks.mjs`: C-56.5 `TARGET_NOT_JOINED` (64–69), C-33.28 `LAST_OWNER` (94–103 with its comment), C-70.4 `PROJECT_DIRECTORY_NEEDS_A_MEMBER` (388–393) and the whole C-95 family `PROJECT_JOIN_REQUEST_CHECKS` (396–459). C-56.4 (R36), C-33.48 (R35) and C-70.2/C-70.3 (R45, R47) stay. `where` strings re-point to `src/project-roster/index.mjs`.
  - `schema.mjs`: `project_join_requests` (94–120), `project_owner_votes` and `project_owner_decisions` (158–183), with their indexes; `MEMBERSHIP_PROJECT_TABLES` (282–284) loses those three, which this module declares through `declarePurge("project-roster", …)` (R18). `project_removals` (185–195) stays with R36, its writer, and this module reads it through `membership` R120.
- **Writes into membership's tables** go only through `membership.participationWrite` (R118): the grant's `invited` row (today inline at 1366), owner on (1690), rescue upsert (1771), owner off (1845). Requests are closed only by this module's own `#closeJoinRequests`, reached from R11, R12 and its two listeners (R15, R16), which replace the calls at 1019 and 1545.
- **Answers keep their keys.** `projectInvite`'s `request: "granted"` and `projectVisibilitySet`'s `requests_lapsed` stay in membership's answers; they are filled from R15's and R16's counts (membership R116, R117).
- **Figures.** `COUNT_KEYS` becomes `["projectOwnerVotes"]` here; `plane/stats.mjs`:25 registers this module as a second source; the wire key does not change (`record-core/index.mjs`:1815, `test/m/plane/stats.test.mjs`:21).
- **Re-pointed code:** `plane/store.mjs`:509 (spread `projectRosterOps`; build and migrate after membership, 408); `answer-envelope/families.mjs`:126 (`src/project-roster/checks.mjs` after membership's, held to `modules.json` order by `families.test.mjs`:269–271). op-declarations and control-plane key these ops by name and do not change.
- **Tests:** `test/m/membership/ownership.test.mjs` moves; `requests-fence-facts.test.mjs`, `sight.test.mjs`, `no-such-project.test.mjs`, `t35-words.test.mjs`, `t14-rows-remedy-order.test.mjs`, `t9-notice-sight-bounds.test.mjs`, `t20-figures.test.mjs` and `participation.test.mjs` (R37 and R63's read; the acts stay) split by id. Under C1′ the 27 test files in 16 other modules that call the setup acts are not re-pointed.
- **Size:** about 800 lines (the proposal's C1′ figure).
