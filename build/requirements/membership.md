# membership — requirements

**Status** · DRAFT, reviewed for BOB #40, 2026-09-26; for Bob's approval (a product module, P17). Layer 2. Code today: inside the legacy modules `bio-plane/src/store.mjs` and `schema.mjs` (and the sight predicate in `query.mjs`); the module is extracted from them by its first job. Not yet met: REC-224, REC-226, and seven rules found unbuilt in this review (marked "new").

## Public

### Purpose

Owns who the members are and what each may do: the founder, administrators, invitations and enrolment, sessions and their capabilities, declared expertise, signing keys and AI credentials; and projects as working groups: participation, ownership, visibility, requests to join, what a caller may see of a project, and the fence that says who may act in one. It holds no integrity of the record (Membership v2 §2).

### Provides

Terms. *Administrators* are the founder (the root of trust's session, id `admin`, once the instance is claimed) and every member with role `admin` and status `active`. An act's `by` is the actor the control plane stamps, never the caller's claim. *Sight* of a project is `FULL`, `EXISTENCE` or `NONE` (R44). Every service that names a project answers a caller at `EXISTENCE` with `PROJECT_SEEN_NOT_A_PARTICIPANT` (R44) and a caller at `NONE` exactly as an id that names nothing, before any other check; a `viewer` never sent (an internal caller) is not asked. Every refusal names its reason; no service throws.

**Sign-in and sessions**
- **R1** `claim({password, tokenFp})` sets the founder's password once: `PASSWORD_TOO_SHORT` under 12 characters; `ALREADY_CLAIMED` once claimed, unless `tokenFp` differs from the one recorded at the claim (the bootstrap credential was replaced), which re-arms the claim.
- **R2** `login({role, password, ttlSeconds})` returns `{token, expires}` for a role holding a credential whose password matches and, for `member:<id>`, whose member is `active`. Every other case (no credential, inactive member, wrong password) answers the one refusal `SIGN_IN_REFUSED` with one fixed detail, at the same cost, so a refusal never tells which roles exist.
- **R3** `session(token)` returns `null` for an unknown or expired token, else `{role, expires, capabilities, administer, member, handle, rootOfTrust}` resolved at that call, so a capability change or revocation takes effect on the next request: the founder holds every capability, `administer` and `rootOfTrust`; an active administrator holds every capability and `administer`, whatever their row stores; an active member holds their stored set; a missing or inactive member, or an unrecognised role, holds none.
- **R4** The capability vocabulary is exactly `contribute`, `publish`, `create_projects`. `administer` is never in it.

**Administrators**
- **R5** `adminMath(n)` returns `{administrators: n, votesNeeded: floor(n/2)+1, eligibleVoters: max(0, n-1), possible: votesNeeded <= eligibleVoters}`; `adminArithmetic()` returns the table for n = 1..9 and the live count's row.
- **R6** `adminEndorse({memberId, by})`: `NO_SUCH_MEMBER`; `NOT_PROPOSED` unless the target's status is `proposed`; `NOT_AN_ADMIN` unless `by` is an administrator. Records `by`'s endorsement; while any administrator has not endorsed, answers `CONSENSUS_REQUIRED` with `have` and `awaiting`. When the last endorses, the target becomes `invited` with `status_by` = `by`, and the invitation (R13) is returned once.
- **R7** `adminRemove({memberId, by, reason})`: the founder is refused `ROOT_OF_TRUST`, naming the hosting account as the remedy; `NO_SUCH_MEMBER`; `TARGET_NOT_AN_ADMIN`; `TARGET_CANNOT_VOTE` when `by` is the target; `NOT_AN_ADMIN`; `NO_REASON`; `IMPOSSIBLE_AT_TWO` when `adminMath(administrators).possible` is false; `ALREADY_VOTED`; `VOTES_SHORT` (with `have`, `need`, `deciders`) until the target is excluded and a majority of all administrators has voted.
- **R8** A carried removal sets the target `revoked` (`status_by` = the completing voter), ends every session of theirs and revokes every key registered to them, in one act; the answer names the deciders and reasons and states that rotating the root of trust and reviewing hosting access is the other half of an ejection. Votes and reasons stay recorded.
- **R9** `memberCaps({memberId, capabilities, by})`: `NOT_AN_ADMIN` asked first; `NO_SUCH_MEMBER`; `BAD_CAPABILITY` for a non-array or an unknown word (naming them and the vocabulary); `NOT_A_CAPABILITY_GRANT` for a set containing `administer` or a target who is an administrator. Otherwise replaces the set exactly and names `by`.
- **R10** An administrator (not the founder) may resign while more than two administrators exist, becoming an ordinary member; at two it is refused. *(not yet met: new, §4.5 unbuilt)*
- **R11** When the second administrator is added, the group is asked to record who holds hosting access, and the record keeps the answer. *(not yet met: new, §4.8 unbuilt)*

**Invitations, enrolment and the roster**
- **R12** `memberAdd({memberId, cover, role, capabilities, expertise, by})` is refused `NOT_AN_ADMIN` when `by` names a member who is not an administrator (a machine credential is accepted and recorded as itself). Then, in order: `BAD_MEMBER_ID` (not 2–41 of `a-z0-9-`, starting alphanumeric); `MEMBER_ID_RESERVED` for `admin`; `NO_COVER`; `EXISTS`; `EXPERTISE_IS_NOT_ASSIGNED` for any `expertise`; `ADMINS_FIRST` for an ordinary member while fewer than two administrators exist.
- **R13** An ordinary member, or an administrator while fewer than two administrators exist, is created `invited` with `invited_by` and `status_by` = `by`, capabilities as given (unknown words dropped) or `["contribute"]`, and a one-time invitation returned once and never again (only its hash is kept).
- **R14** An administrator while two or more exist is created `proposed`; `by`'s own endorsement is recorded if `by` is an administrator; the answer is `CONSENSUS_REQUIRED` and no invitation exists until R6 completes.
- **R15** `inviteLook({invite})` returns `{cover, role, capabilities}` for a live invitation and never the member id. A spent invitation and one that never existed answer the identical `NO_SUCH_INVITATION`.
- **R16** `enroll({invite, handle, password})`: `NO_SUCH_INVITATION` as R15; `NO_HANDLE`; `BAD_HANDLE` (R12's pattern); `HANDLE_TAKEN` (exact comparison); `PASSWORD_TOO_SHORT` under 12. Success sets the handle and password, makes the member `active` with `status_by` = the member, and spends the invitation. Cover, role and capabilities are never taken from this call.
- **R17** `memberList({administer})` lists every member with handle, role, status, `status_by`, `invited_by` (each `not recorded` when never stamped), capabilities and expertise as R24 answers it. `cover` is present only when the control plane stamped `administer: true`; otherwise the key is absent.
- **R18** Each row of an administrator's roster lists the projects that member participates in. *(not yet met: new, §7.8)*
- **R19** Whether a member's cover-and-handle pairing is published is a per-member setting either the member or an administrator may change. *(not yet met: new, §3 unbuilt)*
- **R20** `memberSet({memberId, status, by})`: `NOT_AN_ADMIN` as R12; `BAD_STATUS` unless `active` or `revoked`; `NO_SUCH_MEMBER`; `ADMIN_REQUIRES_VOTE` for revoking an administrator. Revocation ends the member's sessions and revokes their keys in the same act. Reactivating a revoked administrator restores an ordinary member (`demoted: true`). `status_by` = `by`.

**Declared and confirmed expertise**
- **R21** `expertiseDeclare({memberId, label})` is the member's own act: `NO_SUCH_MEMBER`, `NOT_ACTIVE`, `NO_LABEL`, `ALREADY_DECLARED` when the label is currently declared or confirmed. Labels are trimmed, whitespace-collapsed, at most 120 characters.
- **R22** `expertiseConfirm({memberId, label, by, withdraw})`: `ADMIN_ONLY`; `NO_SUCH_MEMBER`; `NOT_DECLARED` for a label never declared; `ALREADY_CONFIRMED`; `NOT_CONFIRMED` for withdrawing what is not confirmed. An administrator may confirm for another administrator.
- **R23** Every declaration, confirmation and withdrawal is a new entry; none is overwritten.
- **R24** `expertiseList({memberId})` gives, per label, its current state, who set it and when, and its full history, and states that expertise gates nothing. No capability, sight or act depends on expertise.

**Signing keys**
- **R25** `signerAdd({keyB64, memberId, comment, by})`: `NOT_AN_ADMIN` as R12; `BAD_KEY` unless the base64 field of an SSH public key; `NO_SUCH_MEMBER`; `SIGNER_MEMBER_NOT_ENROLLED` (no handle) or `SIGNER_MEMBER_NOT_ACTIVE`. Registering a known key rebinds it and makes it `active`, never a second row.
- **R26** `signerSet({keyB64, status, by})`: `NOT_AN_ADMIN`; `BAD_STATUS`; `NO_SUCH_KEY`; activating is refused as R25 for the owning member; revoking is never refused.
- **R27** `signerList()` gives each key's `status`, `status_by`, `member_status` and `attests`: true exactly when the key and its member are both `active`. When false, `attests_why` is `key_revoked`, `member_absent` or `member_<status>`. The set of keys the ratification gate accepts is exactly those with `attests` true, from this one predicate.

**AI credentials**
- **R28** `aiCredentialMint({who, tokenId, secretSha, principalKind, principalMember, taskScope, writes, note, confinedTo})`: `AI_CREDENTIAL_MINT_NOT_A_MEMBER` when `who` is absent or a machine; `AI_CREDENTIAL_PRINCIPAL_UNSTATED` unless `principalKind` is `organisation` or `member`; `AI_CREDENTIAL_IDENTITY_TAKEN` for an empty or used `tokenId`. Records the credential with `minted_by` = `who`; never stores a secret, only its hash.
- **R29** A member-scoped credential's principal is `who` itself; naming another member is refused. *(not yet met: new — the principal is taken from `principalMember`)*
- **R30** `aiCredentialRevoke({who, tokenId})`: refuses a machine or absent `who` and an unknown id; revoking twice answers `already: true`. `aiCredentialLook({secretSha})` and `aiCredentials({limit})` never return the secret; the list is capped (default 200, at most 500) with a measured `truncated`.

**Project participation**
- **R31** `projectClaimOwner({projectId, memberId})` makes the member the project's sole initial owner, joined: `NO_SUCH_PROJECT`, `NOT_A_PROJECT`, `OWNED` when an owner exists.
- **R32** `projectInvite({projectId, handle, by, viewer})`: `NOT_THE_OWNER`; `NO_SUCH_HANDLE`; `NOT_ACTIVE`; `ALREADY_A_PARTICIPANT`. Records the member `invited` with `invited_by` = `by`.
- **R33** In the same act, an open request to join from that member (R49) is closed `granted`, by `by`. *(not yet met: REC-226)*
- **R34** `projectJoin({projectId, by, viewer})`: `NOT_INVITED` for a non-participant; otherwise the participant is `joined` (idempotent; it withdraws a request to leave).
- **R35** `projectLeave({projectId, by, comment, viewer})`: `NOT_A_PARTICIPANT`; `NOT_JOINED`; records `leaving` with the comment (at most 280 characters) and removes nobody. An owner is refused `LAST_COMMITTED_OWNER` when no other owner is committed (an owner not `leaving`). *(not yet met: REC-224 — today it counts every owner and answers `LAST_OWNER_CANNOT_LEAVE`)*
- **R36** `projectRemove({projectId, handle, by, comment, viewer})`: `NOT_THE_OWNER` (administrators included); `NO_SUCH_HANDLE`; `NOT_A_PARTICIPANT`; `OWNER` for an owner (R40 first). Removes the participant whether or not they asked to leave.
- **R37** `projectParticipants({projectId, by})` gives a participant or an administrator every participant's handle, state, owner flag and comment; anyone else is answered `NO_SUCH_PROJECT`.

**Project ownership**
- **R38** `ownerMath(n)`: n ≤ 1 impossible (the floor is one owner); n = 2 needs both, the target voting (`targetMayVote: true`); n ≥ 3 is `adminMath`'s majority with the target counted and not voting. `projectOwnerArithmetic({projectId, viewer})` gives the table for 1..9 and the live row, which reads as `ownerMath(0)` for a project the viewer cannot see.
- **R39** `projectOwnerAdd({projectId, handle, by, viewer})`: `NOT_THE_OWNER`; `NO_SUCH_HANDLE`; `NOT_ACTIVE`; `NOT_A_PARTICIPANT` unless the target has joined *(not yet met: new — today an invited target is accepted and marked joined)*; `ALREADY_AN_OWNER`. The sole owner adds a second alone; beyond that every owner's vote is required (`CONSENSUS_REQUIRED` with `have`, `awaiting`).
- **R40** `projectOwnerRemove({projectId, handle, by, reason, viewer})`: `NOT_THE_OWNER`; `NO_SUCH_HANDLE`; `NOT_AN_OWNER`; `NO_REASON`; `LAST_OWNER` at the floor; `TARGET_CANNOT_VOTE` when n ≥ 3 and `by` is the target; `ALREADY_VOTED`; `VOTES_SHORT`. Refused, naming them, when it would leave only `leaving` owners *(not yet met: REC-224)*. Once carried the target loses ownership and stays a participant.
- **R41** `projectOwnerRescue({projectId, handle, by, reason, viewer})`: `ADMIN_ONLY`; `NO_OWNERS` (a project created without an owner); `OWNERS_ARE_ACTIVE`, naming them, unless every owner is inactive; `NO_REASON`; `NO_SUCH_HANDLE`; `NOT_ACTIVE`. Adds the named member as a joined owner and keeps every existing owner's row.
- **R42** Every ownership decision (addition, removal, rescue) stays recorded with the deciders and the reason, and every participant of the project can read it. *(not yet met: new — carried votes are deleted and nothing reads them)*

**Sight and visibility**
- **R43** `viewerPredicate(viewer)` is the one rule of what a viewer may see: a machine credential or the founder's viewer sees every bundle; a `member:<id>` viewer sees every bundle that is not a project, and a project only as a participant (any state) or as an active administrator; any other viewer sees nothing. It also returns the viewer's member id (null for a machine).
- **R44** `sight(projectId, viewer)` is `FULL` when R43 admits the viewer; else `EXISTENCE` only for a project set discoverable, asked by a viewer naming a member; else `NONE`. At `EXISTENCE` an act, and a read naming the project's own id, is refused `PROJECT_SEEN_NOT_A_PARTICIPANT` carrying only the id and name; a read of anything inside the project, and every search, list and reverse edge, is never widened by `EXISTENCE`.
- **R45** `projectVisibilitySet({projectId, setting, reason, by, viewer})`: `NOT_A_PROJECT`; `PROJECT_VISIBILITY_NOT_THE_OWNER` (administrators and the founder included); `PROJECT_VISIBILITY_UNKNOWN_SETTING` unless `discoverable` or `hidden`. Appends a record with `by`, date and reason; the latest record is the setting; a project with none is `hidden`. Setting `hidden` lapses every open request to join it, recorded with `by`.
- **R46** `projectVisibility({projectId, viewer})` gives the setting and its history to a caller at `FULL`, else the absent answer.
- **R47** `visibilitySettingRefusal(value)` answers `PROJECT_VISIBILITY_UNKNOWN_SETTING` for anything but the two settings, so a creation and R45 cannot disagree.
- **R48** `projectDirectory({viewer, limit})`: `PROJECT_DIRECTORY_NEEDS_A_MEMBER` for a viewer naming no member; else the discoverable projects the caller does not see at `FULL`, each `{id, name, request}` where `request` is the caller's own latest request or null, in id order. The cap (`PROJECT_DIRECTORY_LIMIT`, 200) may be lowered, never raised; `truncated` is measured by reading one past the cap.

**Requests to join**
- **R49** `projectRequest({projectId, comment, by, viewer})`: `PROJECT_REQUEST_NEEDS_A_MEMBER` when `by` and `viewer` do not name one active member (asked first); `NONE` answers as absent; `FULL` is refused `PROJECT_REQUEST_NOT_OUTSIDE`; `PROJECT_REQUEST_ALREADY_OPEN` (at most one open per member per project). Records the request with the name the caller was shown.
- **R50** `projectRequestWithdraw({projectId, by, viewer})`: `PROJECT_REQUEST_NEEDS_A_MEMBER`; `PROJECT_REQUEST_NONE_OPEN`, the same answer whatever the id names; asks no sight.
- **R51** `projectRequestAnswer({projectId, handle, answer, comment, by, viewer})`: `PROJECT_REQUEST_ANSWER_NOT_THE_OWNER` (administrators and the founder included); `PROJECT_REQUEST_UNKNOWN_ANSWER` unless `grant` or `decline`; `PROJECT_REQUEST_NONE_OPEN`. A grant is refused `PROJECT_REQUEST_REQUESTER_INACTIVE` or `PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT`, leaving the request open; otherwise it writes the participation `invited` with `invited_by` = `by`, never `joined`.
- **R52** A request's asking fields are written once, and its closing fields (`granted`, `declined`, `withdrawn`, `lapsed`; who; comment; date) once. A closed request never reopens; the member may ask again.
- **R53** `projectRequests({projectId, by, viewer, limit})` with no project gives the caller their own requests, each naming the project as shown when asked and never the answering owner; with a project, only its owners and administrators read it (`PROJECT_REQUESTS_NOT_VISIBLE` otherwise). Both capped (`PROJECT_REQUESTS_LIMIT`, 200) as R48.

**The fence: who may act in a project**
- **R54** `isProjectOwner(projectId, memberId)` is true exactly for a participant with the owner flag; `isJoinedParticipant` for a participant `joined` or `leaving`.
- **R55** `projectAuthority(projectId, identity, need, act)` returns null or a refusal: `need: "owner"` refuses `PROJECT_ACT_NOT_THE_OWNER` to anyone but an owner; `need: "joined"` refuses `PROJECT_ACT_NOT_A_PARTICIPANT` to anyone not joined or leaving. Sight, administrator status and the founder's session confer neither. An identity naming no member (absent, or a machine credential) is not asked.
- **R56** `caseAuthority({project, deliveredBy, signer, act, subject})`: unless `deliveredBy` is the founder, delivery needs `projectAuthority(project, deliveredBy, "joined")`; then the signer must be an owner of the project, else `CASE_SIGNER_NOT_AN_OWNER`, which is also the answer for a production naming no project.

## Private

### Uses

- `record-core`: a bundle's existence, type and title by id, and the project bundles (record-core R34, R35); `declarePurge` (R59).
- `legacy-checks`: the translations of this module's refusals (C-29, C-55, C-56, C-57, C-63, C-70, C-95, C-96) and `isMachineIdentity`, until those checks move here.
- `signatures` is a permitted dependency; nothing in this module's share calls it.

### Invariants

- **R57** A member row is never deleted: deactivation is status `revoked`, and the member's handle and history stay.
- **R58** Every write of a member's status records the actor whose act caused that transition (R6, R8, R13, R16, R20); a row nothing stamped reads `not recorded` and is never back-filled.
- **R59** Members, credentials, sessions, expertise, votes, keys, AI credentials are declared exempt from `purge`; participation, owner votes, visibility, the sight index and requests are keyed by project and cleared with it.
- **R60** An administrator's sight of every project is never a position in one: the only project act an administrator holds is R41.
- **R61** Every act naming a project the caller cannot see answers byte for byte as an id that names nothing, and sight is asked before position.

### Satisfies

- `BIO_Membership_Architecture_v2.md` §1 (1.1–1.4), §2, §3, §4 (4.1–4.9), §5, §6, §7 (opening, 7.1–7.10, 7.13, 7.14; 7.11 and 7.12 through the fence), §9 (the founder as root of trust), §10, §11 items 1, 4, 5, 6.
- `BIO_System_Design.md` §3, construct 1 ("Membership and authority").
- `BIO_State_Rules_Consistency_v1_5.md` §4.3 (the project object, to which membership adds participation only).

### Suggestions

- **Sight moves here.** `viewerPredicate` lives in `query.mjs` (`query-language`, layer 5) but reads this module's tables and is §7.9's rule; it moves here and `query-language` gains a use of `membership`.
- **Fork and export are not this module's.** `forkProject` (store.mjs 37041) writes the clone through `promote`, a later module, so it moves to `promotion` (K31), which asks this module's fence and calls R31; §7.12's rules (joined forker holding `create_projects`, a new name, sole owner, no participants copied, `derived_from` recorded, `forming`, no inherited visibility) go into promotion's file. `exportManifest`/`exportLog` (37180–37257) read `register` and `refs` (K23: provenance and connections), so they move to `publication` with `export_log` (K31, entry N16).
- **Project name uniqueness** (`projectNameKey`, `checkProjectNameUniqueness`, C-77) serves promotion's write path; it goes with fork. Canon §7.1 requires NFC normalisation, not built and in no old-plan row.
- **Capabilities are enforced at the op layer** (the control plane's needs table), not here: `projectfork` needs `create_projects`, and §11 item 8b asks that a capability absent from the interface is also refused there.
- **D-586** is fixed where the scope is judged (`aiReachesAsMember`, `index.mjs` 3454, control-plane): the mint must refuse ops only a session performs. This module records the scope it is handed.
- **Callers' obligations.** `promotion` calls R31 only for a creation stamped with a member, so a machine-created project has no owner (§7.1); it gates deactivation and reactivation (§7.11) on `isProjectOwner`, and every revision of a project's document, citations, stance, conclusion and feed judgements on R55.
- **Stale comments (TRANSITION C8).** `schema.mjs` line 215 and `bio-plane/test/membership.test.mjs`'s header cite `BIO_Membership_Architecture_v1.md`; repoint to v2. Also stale: the `project_participants` comment (store.mjs ~1690) saying removal is administrators' (v1.4 §7.7; §11 item 5 requires correction) and `#isProjectOwner`'s saying 7.13 is not built.
- `memberAdd` still accepts `name` as an alias of `cover`; drop it at extraction.
- `project_sight` is a derived index, rebuilt at boot, at every promotion of a project and at every R45; promotion calls a reindex service here.
