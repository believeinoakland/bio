<!-- UNREVIEWED: written by a drafting worker for BOB #38 on 2026-09-26 (P18 preparation) and never reviewed; the membership draft's worker was stopped mid-run when P3 stopped product work. BOB reviews it before it becomes build/requirements/<module>.md. -->
# membership — requirements

**Status** · DRAFT, worker session, 2026-09-26, for BOB's T1 extraction of `membership` from
`bio-plane/src/store.mjs` (54,618 lines) and `bio-plane/src/schema.mjs` (4,287 lines). Layer 2, "Record and
authority." Every requirement below is measured against the code on `tranche/T1` as of this draft; three are
marked `(not yet met: …)` against open old-plan rows, and the extraction map, the checks taken as invariants
and the open questions for BOB are in this worker's report, not here.

## Public

### Purpose

The member: a stable name administrators and handles record separately (cover and handle); administrators and
the two-administrator floor; what a session's capabilities are; burner-URL invitations and enrolment; declared
and confirmed expertise; registered signing keys bound to an enrolled member; projects as membership's scope —
participation, ownership, visibility, requests to join, and fork; the fence that says who may act on a project
regardless of who may see it; project name uniqueness; and secure verified export. It attributes every
authored act in the system to a member (or states that none stands behind a machine credential), and holds no
integrity of its own: the record's integrity rests on storage-authoritative semantics, unaffected by anything
here.

### Provides

**Sessions and capabilities (§5)**

`capabilitiesFor(role) → {capabilities, administer, member, handle, rootOfTrust}`
- **R1** The founder's role resolves to every capability in `CAPABILITIES`, `administer: true`, `rootOfTrust:
  true`, and a `member` of the reserved id (§4.6: the holders of the root of trust are not capability-bounded,
  and no answer may imply otherwise).
- **R2** A `member:<id>` role resolves from the roster: an administrator's role resolves to every capability in
  `CAPABILITIES` regardless of what is stored on their row; an ordinary member's resolves to their own stored
  set. Neither is ever read from a stored value for an administrator — an administrator's capabilities are not
  a field anyone, including themselves, can edit (§5, §4.4).
- **R3** A role naming a member row that is gone, or whose status is not `active`, resolves to no capabilities
  (`capabilities: []`), never to a default. An unrecognised role resolves the same way.
- **R4** `CAPABILITIES` is exactly `["contribute", "publish", "create_projects"]`. `administer` is never a
  member of it: it is granted and revoked only by the administrator process (§4), never by editing a
  capability set.
- Errors: never throws; every input resolves to some answer, including the empty one.

**Administrators (§4)**

`administratorArithmetic(n) → {administrators, votesNeeded, eligibleVoters, possible}`
- **R5** `votesNeeded = floor(n/2) + 1`; `eligibleVoters = max(0, n - 1)` (the target is counted, not voting);
  `possible` is `votesNeeded <= eligibleVoters`. At `n = 2` this is `false` and stays `false` at no size below
  it (§4.7: removal at two is impossible by design, not a special case).
- **R6** The live table (`n = 1..9`) and the group's current count are both exposed, so an interface can state
  what a removal would take before anyone starts one.

`administratorEndorse(memberId, by) → {ok: true, memberId, invite, endorsedBy} | refusal`
- **R7** Refuses a target not in status `proposed` (`NOT_PROPOSED`) and a caller who is not an active
  administrator (`NOT_AN_ADMIN`).
- **R8** An addition past the second requires every existing administrator's own endorsement
  (`CONSENSUS_REQUIRED`, naming who has endorsed and who is still awaited); a proposer's own act at
  `administratorAdd` already counts as their endorsement and is never asked twice (§4.7, BOB #22).
- **R9** Once every administrator has endorsed, a burner invitation is minted (§6) and returned exactly once,
  and the member's status moves to `invited`. The actor recorded for that transition is the administrator
  whose endorsement completed the consensus, never the original proposer.

`administratorRemove(memberId, by, reason) → {ok: true, memberId, removed: true, …} | refusal`
- **R10** Refuses the reserved founder's id outright (`ROOT_OF_TRUST`): the founder cannot be removed by the
  membership model at all (§4.6), and the answer says so and names the actual remedy (rotate the credential
  that is the root of trust).
- **R11** Refuses a target who does not hold the administrator role (`TARGET_NOT_AN_ADMIN`) — a fact about the
  target, kept apart from the caller not being one (`NOT_AN_ADMIN`).
- **R12** The target is counted in the denominator and may not vote (`TARGET_CANNOT_VOTE` if they try); an
  empty or missing reason is refused (`NO_REASON`); a caller who already voted is told so idempotently
  (`ALREADY_VOTED`) rather than double-counted.
- **R13** At exactly two administrators the removal is refused as impossible (`IMPOSSIBLE_AT_TWO`) rather than
  silently short of votes, and the answer states this is the rule working as intended.
- **R14** Once a majority of all administrators (the target excluded from the count of voters, §4.7's table) has
  voted to remove, the target's status moves to `revoked`, every one of their live sessions ends, and every
  signing key registered to them moves to `revoked` in the same act. The actor recorded for all three is the
  administrator whose vote completed the majority.
- **R15** The answer names that removal in the application is half of an ejection, and that rotating the root
  of trust and reviewing hosting-account membership is the other half (§4.8) — never implying the first is
  sufficient.

`memberCapabilities(memberId, capabilities, by) → {ok: true, memberId, capabilities} | refusal`
- **R16** Refuses a caller who is not an active administrator (`NOT_AN_ADMIN`), asked **before** the member is
  looked up, so a non-administrator cannot use this call to learn whether a member id exists.
- **R17** Refuses a set containing `"administer"`, and refuses touching an administrator's own row at all
  (`NOT_A_CAPABILITY_GRANT`): administrator status is granted and removed only by §4's process, never by this
  edit (§4.4, §5).
- **R18** Refuses a value that is not an array, or that names anything outside `CAPABILITIES`
  (`BAD_CAPABILITY`, naming what was unrecognised and the known vocabulary).
- **R19** On success the member's capability set is replaced with exactly what was asked (not merged), and the
  acting administrator is named in the answer.

**Invitations and enrolment (§6)**

`memberAdd({memberId, cover, role, capabilities, expertise, by}) → {ok: true, memberId, invite, role,
capabilities, invited_by} | refusal`
- **R20** Refused before anything else to a caller who is not an active administrator or the operator's bearer
  credential (§4.9's custodial acts reach both).
- **R21** A member id is 2–41 lowercase letters, digits and dashes (`BAD_MEMBER_ID`); the reserved id (the
  founder's) is refused by name before the existence check (`MEMBER_ID_RESERVED`) — no member may ever be
  enrolled under it, whoever asks; an id already on the roster is refused (`EXISTS`), naming no other member.
- **R22** A cover is required (`NO_COVER`) and is never a claim about who someone is in the world (§3): it is
  the label only an administrator sees paired with the handle the member later chooses.
- **R23** `expertise` is refused if supplied at all (`EXPERTISE_IS_NOT_ASSIGNED`): expertise is declared by the
  member and confirmed by an administrator (§1.3), and an administrator who could set it at invitation would be
  assigning it under a confirmation's name.
- **R24** The second member added to a group of one administrator must be an administrator
  (`ADMINS_FIRST` otherwise): no ordinary member exists until two administrators do (§4.2, §4.3).
- **R25** Adding a third or later administrator requires the same consensus `administratorEndorse` requires
  (`CONSENSUS_REQUIRED`), and the proposer's own act counts as their endorsement; no invitation is issued until
  every existing administrator has endorsed it.
- **R26** On success a one-time burner invitation is minted, returned exactly once as plaintext, and never
  again; the member's status is `invited`, capabilities default to `["contribute"]` when none are given
  (filtered to the known vocabulary otherwise), and the inviter is recorded (`invited_by`).

`invitationLook(invite) → {ok: true, cover, role, capabilities, expertise} | miss`
- **R27** Unauthenticated by necessity. A spent invitation and one that never existed answer byte-identically
  (`NO_SUCH_INVITATION`) — the whole security property of a burner URL, so a leaked or archived link discloses
  nothing about whether it once addressed anyone (§6).
- **R28** Never discloses the member id: only the cover, role, capabilities and expertise the invitee is being
  asked to join as.

`enroll({invite, handle, password}) → {ok: true, memberId, handle} | refusal`
- **R29** A spent or unrecognised invitation answers `NO_SUCH_INVITATION` byte-identically to `invitationLook`.
- **R30** The handle is the member's own choice, required, 2–41 lowercase letters/digits/dashes
  (`NO_HANDLE`/`BAD_HANDLE`), and unique across the instance (`HANDLE_TAKEN`) — a plain unique index, so two
  handles differing only in case are two handles.
- **R31** A password under 12 characters is refused (`PASSWORD_TOO_SHORT`).
- **R32** Cover, capabilities and role are never taken from this call even if the caller supplies them: they
  are the administrator's, attached at invitation, and are silently ignored rather than refused (§6: "already
  attached, not editable").
- **R33** On success the member's status moves to `active`, the invite hash is cleared so the URL is inert
  afterwards, and the actor recorded for the status transition is the enrolling member themselves, never the
  inviter (D-610).

**The roster (§3, §4.9)**

`memberList(administer) → {members: […]}`
- **R34** A caller who administers sees every member's `cover` and `handle` together (the one place the two
  are ever paired, §3: "Only administrators see cover and handle together"). Any other caller's rows omit
  `cover` entirely — the key is absent, never present-and-blank.
- **R35** Every row states `status`, `status_by` (the actor whose act caused the *current* status, or the
  literal `not recorded` when nothing stamped it, D-610), `invited_by` (or `not recorded`, D-134/BOB#35),
  capabilities, and the member's expertise as `expertiseList` would answer for them (never a second, unrefreshed
  copy).

`memberSet({memberId, status, by}) → {ok: true, memberId, status, by, demoted?} | refusal`
- **R36** Refuses a caller who is not an active administrator or the operator's bearer (custodial acts).
- **R37** `status` is exactly `active` or `revoked` (`BAD_STATUS` otherwise).
- **R38** Revoking an administrator through this call is refused (`ADMIN_REQUIRES_VOTE`): that is what §4.7's
  vote is for, and no administrator may strip another unilaterally (§4.4).
- **R39** Reactivating a formerly-removed administrator restores them as an ordinary member, never as an
  administrator (`demoted: true`): the office is restored only through §4.7's addition process, never by a
  single administrator's reactivation.
- **R40** Revocation is immediate: every live session under the member's role ends and every signing key
  registered to them moves to `revoked`, in the same act, stamped with the acting administrator.

**Declared and confirmed expertise (§1.3)**

`expertiseDeclare({memberId, label}) → {ok: true, memberId, label, state: "declared", confirmed: false} | refusal`
- **R41** Only the member's own row may declare (asked by the caller's own id in the extraction's interface);
  refuses an inactive or absent member and an empty label. A label already declared or confirmed is refused
  (`ALREADY_DECLARED`), never silently re-recorded.
- **R42** Declaring costs nothing: the answer states plainly that an unconfirmed entry carries the same
  capabilities, visibility and access as a confirmed one (§1.3: confirmation gates nothing).

`expertiseConfirm({memberId, label, by, withdraw}) → {ok: true, memberId, label, state, confirmed, by} | refusal`
- **R43** Only an active administrator may confirm or withdraw (`ADMIN_ONLY`), including for another
  administrator — vouching is the same act whoever holds the license (§1.3, §4.9).
- **R44** Refuses confirming a label the member never declared (`NOT_DECLARED`): an administrator can never
  introduce a label, which would make this an assignment rather than a confirmation.
- **R45** Refuses confirming an already-confirmed label, and refuses withdrawing one that is not currently
  confirmed (`ALREADY_CONFIRMED` / `NOT_CONFIRMED`).
- **R46** A withdrawal supersedes rather than overwrites: the prior confirmation stays readable in the entry's
  history (§1.3).

`expertiseList(memberId) → {ok: true, memberId, expertise: […]}`
- **R47** For each label ever declared, states its current state (`declared`, `confirmed` or `withdrawn`), who
  set it and when, and the full history of events for that label — both the current answer and the record
  behind it are visible in one read, because seeing that a confirmation was once given and later withdrawn is
  strictly more informative than seeing only today's answer (§1.3).
- Errors (all four services): never throw; every refusal names its kind, never a bare `false`.

**Signers: registered keys bound to an enrolled member (§6 binding, §10 sketch)**

`signerAdd({keyB64, memberId, comment, by}) → {ok: true, keyB64, memberId, by} | refusal`
- **R48** Refuses a caller who is not an active administrator or the operator's bearer.
- **R49** Refuses a value that is not the base64 field of an `ssh-ed25519` public key (`BAD_KEY`).
- **R50** Refuses registering a key to a member who has never enrolled (`SIGNER_MEMBER_NOT_ENROLLED`, no handle
  chosen) or whose membership is not `active` (`SIGNER_MEMBER_NOT_ACTIVE`) — never widened at the gate side: a
  signature must never attest in the name of a roster slot no person has taken up.
- **R51** Registering the same key again updates its owning member, comment and status to `active` rather than
  creating a duplicate row (keyed on the key's own bytes).

`signerList() → {signers: […]}`
- **R52** Each row states the key's own `status` (the administrator's revocation switch, untouched by anything
  else), the member's own `status` (`member_status`), and `attests` — whether a signature from this key would
  be accepted for ratification **right now**, computed from the *same* predicate the ratification gate itself
  weighs (never a second copy of that rule).
- **R53** Where `attests` is false, `attests_why` names which fact made it so (`key_revoked`, `member_absent`,
  `member_<status>`), never leaving a caller to guess; nothing is hidden by omitting a disagreeing row.

`signerSet({keyB64, status, by}) → {ok: true, keyB64, status, by} | refusal`
- **R54** Refuses a caller who is not an active administrator or the operator's bearer.
- **R55** `status` is exactly `active` or `revoked`. Revoking is never barred; **activating** a key is refused
  under the same enrolment/active-membership conditions as `signerAdd` (R50) — closing the route by which an
  administrator could re-activate a key a member-revocation cascade had just revoked.

**Project participation (§7.1–§7.9)**

`projectClaimOwner({projectId, memberId}) → {ok: true, projectId, owner: memberId} | refusal`
- **R56** Records the sole initial owner of a project at its creation, when created by an identified member. A
  project already carrying an owner row is refused (`OWNED`); a project created with no identified member (a
  machine credential) records no owner at all, rather than inventing one (§7.1: "a project created by a
  machine credential has no owner").

`projectInvite({projectId, handle, by, viewer}) → {ok: true, projectId, handle, state: "invited"} | refusal`
- **R57** Only an owner of the project may invite (`NOT_THE_OWNER`); an administrator's sight of every project
  is not a position in any of them (§4.9, §7.2 — REVERSED from a prior architecture that gave invitation and
  removal to administrators).
- **R58** Refuses an unknown handle, an inactive target, or a handle that already names a participant of the
  project (`NO_SUCH_HANDLE` / `NOT_ACTIVE` / `ALREADY_A_PARTICIPANT`).
- **R59** Records the invited participant in state `invited`, not an owner, with the inviting owner recorded
  (`invited_by`).

`projectJoin({projectId, by, viewer}) → {ok: true, projectId, state: "joined"} | refusal`
- **R60** Only a participant already in state `invited` may join (`NOT_INVITED`); there is no acceptance
  ceremony beyond the act itself (§7.4).

`projectLeave({projectId, by, comment, viewer}) → {ok: true, projectId, state: "leaving", …} | refusal`
- **R61** Only a `joined` participant may ask to leave (`NOT_A_PARTICIPANT` / `NOT_JOINED` otherwise); the act
  records the request (state `leaving`) and removes nobody — §7.6 is a request, and only an owner's removal
  (§7.7) or the member's own ownership process ends participation.
- **R62** A project's *only* committed owner may not ask to leave (`LAST_OWNER_CANNOT_LEAVE`): the request
  could never be honoured, since one owner is the floor (§7.10), and the answer names the remedy (add another
  owner, or deactivate the project). *(not yet met: REC-224 — the floor this refusal asks must count only
  COMMITTED owners, those not themselves already `leaving`; today it counts every owner row regardless of that
  state, so two owners who have both asked to leave can strand the project when the first is honoured, and
  `projectOwnerRemove` (R70) can carry a removal that leaves only `leaving` owners behind.)*

`projectRemove({projectId, handle, by, comment, viewer}) → {ok: true, projectId, handle, removed: true} |
refusal`
- **R63** Only an owner of the project may remove a participant (`NOT_THE_OWNER`), whether or not a request to
  leave is outstanding — this REVERSES an earlier architecture that gave removal to administrators alone
  (§7.7, v2's change table row).
- **R64** Refuses removing a participant who does not exist, and refuses removing an owner by this route at all
  (`NOT_A_PARTICIPANT` / `OWNER`): an owner is removed from the project only after their ownership ends by
  §7.10's process.

`projectParticipants({projectId, by}) → {ok: true, projectId, participants: […]} | refusal`
- **R65** Every participant of a project (or an administrator) may read the handles of every other participant
  and which of them are owners (§7.8); anyone else is answered exactly as for a project that does not exist
  (§7.9: a non-participant is told nothing, not even that refusal differs from absence).

**Project ownership (§7.10, §7.13)**

`ownerArithmetic(n) → {owners, votesNeeded, eligibleVoters, targetMayVote, possible, why}`
- **R66** `n ≤ 1`: impossible — one owner is the floor. `n = 2`: both owners must agree, the departing one
  included (`targetMayVote: true`) — a resignation with the other's assent, and the only removal this permits
  at two is one the target agreed to. `n ≥ 3`: a majority of all owners, the target counted in the denominator
  and never voting, exactly §4.7's formula. This is deliberately **not** the same function as
  `administratorArithmetic`: the two diverge at exactly `n = 2`, and sharing an implementation would get the
  one row a shared implementation is most likely to get wrong.
- **R67** The live count for a named project is asked only through the sight the caller holds: a project the
  caller cannot see answers the same table entry an id naming nothing would (`ownerArithmetic(0)`), never a
  refusal that would itself disclose existence (§7.9).

`projectOwnerAdd({projectId, handle, by, viewer}) → {ok: true, projectId, handle, owner: true, owners: […]} |
refusal`
- **R68** Only an existing owner may propose another (`NOT_THE_OWNER`); the target must already be an active,
  joined participant (`NOT_A_PARTICIPANT` / `NOT_ACTIVE`), and not already an owner (`ALREADY_AN_OWNER`).
- **R69** The sole owner may add a second unilaterally; every addition past that needs every existing owner's
  own vote (`CONSENSUS_REQUIRED`, naming who has voted and who is awaited) — §7.10's mirror of §4.7's
  addition rule, for the same reason: without it, one owner recruits confederates and manufactures the
  majority that then ejects the honest ones.

`projectOwnerRemove({projectId, handle, by, reason, viewer}) → {ok: true, projectId, handle, owner: false,
stillAParticipant: true, …} | refusal`
- **R70** Only an existing owner may vote (`NOT_THE_OWNER`); the target must actually be an owner
  (`NOT_AN_OWNER`); a missing reason is refused (`NO_REASON`); the floor of one owner is enforced
  (`LAST_OWNER`, `ownerArithmetic`'s `possible: false`); at exactly two owners the target must vote too
  (`TARGET_CANNOT_VOTE` if they try to abstain, mirroring R66's `targetMayVote`); a repeat vote from the same
  caller is answered idempotently (`ALREADY_VOTED`).
- **R71** Once carried, the target loses the owner flag but **stays a participant** — 7.10 removes ownership,
  not membership in the project; removing them entirely is then `projectRemove` (R63), and only an owner may
  do that.

`projectOwnerRescue({projectId, handle, by, reason, viewer}) → {ok: true, projectId, handle, owner: true,
owners: […], addedNotReplaced: true} | refusal`
- **R72** The single exception to administrators holding no authority over projects (§7.13, §4.9). Refuses a
  caller who is not an active administrator (`ADMIN_ONLY`); refuses a project with no owner rows at all
  (`NO_OWNERS`) — that is a machine-created project, not a stranded one; refuses unless **every** existing
  owner is inactive (`OWNERS_ARE_ACTIVE`, naming the active ones) — the condition cannot be manufactured by
  deactivating one owner at a time. Refuses an empty reason (`NO_REASON`), an unknown handle
  (`NO_SUCH_HANDLE`), and an inactive target (`NOT_ACTIVE`).
- **R73** The rescue **adds** the new owner; it never strips the inactive owners' rows, so a later reactivation
  restores them as an owner alongside the rescued one, and removing anyone from ownership after that is the
  ordinary §7.10 process.

**Fork (§7.12)**

`forkProject({projectId, title, by, viewer, visibility}) → {ok: true, projectId, newId, title, origin, rel:
"derived_from", owner, participantsCopied: 0, …} | refusal`
- **R74** Only a **joined** participant of the origin may fork (`NOT_A_PARTICIPANT` / `NOT_JOINED` for an
  invited-not-joined caller): an invited member sees the origin's skeleton only, and forking from that view
  would either leak material they cannot read or silently narrow what a fork means (§7.12).
- **R75** The clone's name must differ from the origin's and be unique across the instance under the same rule
  every project name follows (`NO_TITLE` / `NAME_TAKEN`, §7.1).
- **R76** The forker becomes the clone's **sole** owner regardless of who owned or held rights on the origin.
- **R77** The clone carries **no** other participants — copying the origin's roster would let a forker
  manufacture visibility for people the origin's owners chose, defeating §7.3 with a button.
- **R78** The clone's origin is recorded as a `derived_from` reference, written into the clone's own document
  and not merely reported back.
- **R79** The clone starts at the beginning of its lifecycle regardless of where the origin had reached, and
  does not inherit the origin's visibility setting — a fork is a creation under §7.14, and the forker chooses
  (or leaves it, defaulting to hidden, per R91).
- Errors: a caller who cannot see the origin project at all is answered exactly as for a project that does
  not exist (§7.9); a caller who can see it but has not joined is refused positionally, never told the project
  does not exist. *(not yet met: REC-226 — an owner's `projectInvite` (R57–R59) of a member whose request to
  join (R84) is currently open must close that request as `granted`, recorded under the inviting owner, in the
  same act; today the invitation is written and the request is left open, so the record shows an unanswered
  request the owner has in fact answered.)*

**Project visibility, directory and requests to join (§7.14)**

`projectVisibilitySet({projectId, setting, reason, by, viewer}) → {ok: true, projectId, setting, set_by,
reason, at, requests_lapsed?} | refusal`
- **R80** A project is `discoverable` or `hidden`, and nothing else (`PROJECT_VISIBILITY_UNKNOWN_SETTING` for
  any other value). A project with no recorded setting reads `hidden` — every project that exists before this
  rule reads that way, and no migration writes a row for it (§7.14).
- **R81** Sight is asked before position: a caller who cannot see the project at all is answered as for one
  that does not exist; a caller who can see only its existence (below) is refused positionally
  (`PROJECT_SEEN_NOT_A_PARTICIPANT`) rather than told it does not exist. Only then is ownership asked
  (`PROJECT_VISIBILITY_NOT_THE_OWNER` for anyone but an owner — administrators and the founder included).
- **R82** The setting is append-only: every act is a row naming the owner, the date and an optional reason, and
  the *current* setting is always the latest row — never overwritten.
- **R83** Setting a project `hidden` lapses every open request to join it (recorded, with the owner who hid it)
  — a request does not silently survive a project it can no longer see.

`sightOf(projectId, viewer) → SIGHT_NONE | SIGHT_EXISTENCE | SIGHT_FULL`
- **R84** `SIGHT_FULL` is the participant/administrator/founder/machine-credential visibility every other
  record read already compiles (unchanged by this rule): asked first, and alone, before anything below.
- **R85** `SIGHT_EXISTENCE` is returned only for a project that is (a) not `SIGHT_FULL` to this viewer, (b) a
  project bundle, (c) marked `discoverable`, and (d) asked by a viewer that names a member session — never for
  a machine credential or an unrecognised viewer, both of which stay `SIGHT_NONE`.
- **R86** Every act that names a project asks this before its "does not exist" answer, so `SIGHT_NONE` still
  reaches that byte-identical absent answer and `SIGHT_EXISTENCE` reaches a positional refusal that carries
  only the project's id and name and nothing else — never a description of its contents, its participants, or
  its lifecycle state (§7.9's "not its existence" extended to the one thing a discoverable project *does*
  disclose).
- **R87** Record reads that return contents (search, citation lists, reverse edges, run reports) are **never**
  widened by `SIGHT_EXISTENCE`: existence reaches an outside viewer through exactly the directory (below) and
  the positional refusal, and nowhere else.

`projectDirectory({viewer, limit}) → {ok: true, projects: [{id, name, request}], count, limit, truncated} |
refusal`
- **R88** Refuses a caller whose viewer names no member (`PROJECT_DIRECTORY_NEEDS_A_MEMBER`) — an empty list
  would falsely say the caller is outside no discoverable project.
- **R89** Lists exactly the `discoverable` projects the caller is not already a full participant of (owner,
  invited, joined, administrator or founder — none of those are listed as "to ask to join"), each with its id,
  its name, and the state of the caller's **own** latest request to it (`null` only if they have never asked).
- **R90** Bounded by a published cap (`PROJECT_DIRECTORY_LIMIT`) the caller may lower and never raise; when more
  exist than the cap allows, `truncated: true` is *measured* by reading one row past the cap, never derived
  from the page returned, so a full page and a truncated one can never read alike.

`projectVisibility({projectId, viewer}) → {ok: true, projectId, setting, recorded, history} | refusal`
- **R91** Answers only a caller with `SIGHT_FULL` (a participant, an administrator, the founder); anyone else
  reads the absent answer, since this is a read and reads never widen (R87).

`projectRequest({projectId, comment, by, viewer}) → {ok: true, projectId, name, state: "open", …} | refusal`
- **R92** Refuses a caller with no active member behind their credential (`PROJECT_REQUEST_NEEDS_A_MEMBER`),
  asked before any project is looked at.
- **R93** A project the caller cannot see at all (hidden, or absent) answers the absent answer; one the caller
  already has `SIGHT_FULL` of is refused (`PROJECT_REQUEST_NOT_OUTSIDE`) — there is nothing to ask when you can
  already see it. Only a `SIGHT_EXISTENCE` caller may ask.
- **R94** At most one **open** request per member per project (`PROJECT_REQUEST_ALREADY_OPEN` otherwise,
  naming when the existing one was asked).

`projectRequestWithdraw({projectId, by, viewer}) → {ok: true, projectId, state: "withdrawn", closed} | refusal`
- **R95** The requester's own act on their own record: asks no sight of the project at all. A caller with no
  open request to that id is answered one way (`PROJECT_REQUEST_NONE_OPEN`) whether the project is
  discoverable, hidden, or absent.

`projectRequestAnswer({projectId, handle, answer, comment, by, viewer}) → {ok: true, projectId, handle, state:
"granted"|"declined", …} | refusal`
- **R96** Only an owner may answer (`PROJECT_REQUEST_ANSWER_NOT_THE_OWNER`) — administrators and the founder
  see requests and answer none (§7.14). `answer` is exactly `grant` or `decline`
  (`PROJECT_REQUEST_UNKNOWN_ANSWER` otherwise).
- **R97** A **grant** writes the participation `invited` with `invited_by` the granting owner — the identical
  row an ordinary invitation (R57–R59) writes — and **never** `joined`: joining stays the member's own act
  (§7.4). A grant to a requester who is no longer active, or who is already a participant, is refused
  (`PROJECT_REQUEST_REQUESTER_INACTIVE` / `PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT`) and the request
  is left open for the owner to decline or the requester to withdraw.
- **R98** A **decline** is recorded with the owner's optional comment; either answer closes the request for
  good — a requester may ask again afterward.

`projectRequests({projectId, by, viewer, limit}) → {ok: true, own: bool, requests: […], count, limit,
truncated} | refusal`
- **R99** With no `projectId`: the caller's own requests to every project they have asked, each naming the
  project by the id and name they were shown at the time of asking — including a request lapsed by the project
  going hidden since — and never naming the answering owner (§7.14: who owns a project is contents).
- **R100** With a `projectId`: refuses anyone but the project's owners and administrators
  (`PROJECT_REQUESTS_NOT_VISIBLE`) — a pending requester is not a participant (§7.8) and is not shown the list.
- **R101** Both forms are bounded by a published cap (`PROJECT_REQUESTS_LIMIT`) with the same measured
  `truncated` discipline as the directory (R90).

**The fence: who may act on a project, regardless of who may see it (§7, "Sight is not authority")**

`projectAuthority(projectId, identity, need, act) → null | refusal`
- **R102** Asks the actor's own **position** in the named project — never what the actor may see. `need:
  "owner"` is refused (`PROJECT_ACT_NOT_THE_OWNER`) to anyone but a current owner; `need: "joined"` is refused
  (`PROJECT_ACT_NOT_A_PARTICIPANT`) to anyone not currently `joined` or `leaving` — an administrator's or the
  founder's sight of every project is never itself a position in any of them (§4.9, §7).
- **R103** An absent `identity` (an internal caller with no session behind it) is not asked at all and this
  answers `null` unconditionally — the same population `need`'s callers already exempted before this fence
  existed.
- **R104** Every module that writes a change to a project's document, its citation edges, its stance, its
  conclusion or its feed judgements, and every module that adopts a bias set into a project's scope, asks this
  before writing (§7's "Sight is not authority" applies at every such act); `projectOwnerRescue` (R72) is the
  one act that is **not** behind this fence, because it is itself the exception §7.13 records.

`caseAuthority({project, deliveredBy, signer, act, subject}) → null | refusal`
- **R105** Two questions, in order, for a production made in a project's name: (1) **delivery is carriage, not
  direction** — a joined participant of the project may deliver it, and so may the founder (as the interim
  route until a member-facing publishing ceremony exists); an enrolled administrator with no role in the
  project may **not** (`projectAuthority`'s `need: "joined"` refusal, R102); (2) **the authority is the
  signature**, and it must be an **owner** of the project (`CASE_SIGNER_NOT_AN_OWNER` otherwise) — being a
  registered signer of the instance is not authority over a project.
- **R106** A production naming no project has no owner to sign it and is refused by the same rule as one
  naming a project whose signer is not an owner — a project-less production is never treated as one with no
  publisher.

`isProjectOwner(projectId, memberId) → boolean` / `isJoinedParticipant(projectId, memberId) → boolean`
- **R107** `isProjectOwner` is true exactly for a participation row with the owner flag set; `isJoinedParticipant`
  is true for a row in state `joined` **or** `leaving` — a request to leave does not remove the working
  position (§7.5, §7.6). Both are read from the **one** participation table; nothing that asks "is this member
  an owner" or "has this member joined" may keep a second copy of either rule.

**Project name uniqueness (§7.1, §11 item 8)**

`projectNameKey(title) → string`
- **R108** Trims the title, lower-cases it, and collapses runs of whitespace to one space. The **same function
  object** is used at the write path's collision check and at the corpus-level check below — never two
  functions that merely agree on a fixture.

`checkProjectNameUniqueness(corpus) → {pass, findings, projects, judged}`
- **R109** Judges a **handed** corpus (an export, a migration, another instance) rather than the live record:
  every pair of project bundles whose `projectNameKey` collides is named as its own finding, by bundle id and
  title, deactivated projects included (uniqueness holds across every lifecycle state, §7.1).
- **R110** A bundle this check cannot judge (unreadable `bundle.md`, or a project with no title) is named as its
  own finding rather than silently skipped, and the check's overall result states plainly that it judged only
  the part of the corpus it could read.

**Secure verified export (§8.1)**

`exportManifest(note) → {ok: true, at, scope: "working-corpus", bundles, counts, register, recorded, verify}`
- **R111** Every file of every bundle is hashed as it is emitted, alongside the chain of promotions and
  snapshots that link them, so a receiving side can re-derive the whole chain and trust nothing this manifest
  asserts about itself (§8, "what verified must mean").
- **R112** The export is recorded in an append-only log in the same act, before anything is returned: a
  full working-corpus export can never happen silently (§8.1).
- Errors: **who** may call this is enforced by the credential class that reached it (the root-of-trust
  credential, never in-app administrator status alone), which is outside this module's own paths — stated
  under Suggestions.

`exportLog(limit) → {ok: true, exports: […], limit, truncated}`
- **R113** Readable by every in-app administrator, who cannot themselves run an export (§8.1: they can *see*
  that one happened and never *cause* one). Bounded by a published, caller-lowerable cap with the same
  measured `truncated` discipline as R90.

## Private

### Uses

- `legacy-checks`: every check named above by its C-number, until the catalogue's own extraction retires them
  from that file.
- `record-core` (named here as this worker understands it; confirmed against `record-core`'s own requirements
  when they exist): a bundle's identity and type (`bundle_id`, `object_type`, `title`) and its base visibility
  predicate — the compiled rule that answers, for any bundle, whether an administrator, the founder, a
  participant or a machine credential may see it at all (today `viewerPredicate`/`#inSight`), which
  `sightOf` (R84–R87) layers its three project-specific levels on top of; opaque id minting for a newly
  created project's id, so that a minted id discloses no count of how many gated objects exist (Membership
  Architecture v2 §7, "A minted id carries no count") — membership states the rule that a project id must be
  minted this way and never itself allocates one.

### Invariants

- **R114** Membership is not a security boundary and is not integrity (§2): every fence above governs
  organisation and access, never the record's trustworthiness, which rests on content addressing, append-only
  history and signature-gated publication regardless of anything here.
- **R115** Membership is scoped to one instance: an administrator is an administrator of this instance and
  nothing else; nothing here crosses an instance boundary (§2).
- **R116** Every act that changes `members.status` writes the actor whose act caused **that** transition, never
  a stale or inherited stamp: the inviter or the completing voter at an invitation or a §4.7 decision, the
  enrolling member at enrolment, the deciding administrator at a custodial revocation (D-610). A row changed
  before this was tracked reads `not recorded`, stated, and is never back-filled with an invented value.
- **R117** Cover and handle are two names for two purposes, assigned by two different parties, and only an
  administrator's read ever pairs them (§3); a handle is unique across the instance and a cover is never a
  claim about civil identity.
- **R118** A capability a member does not hold is absent from what a session is told it may do, never present
  and refused (§5) — `capabilitiesFor` (R1–R4) is the one place that is decided, and nothing else may keep a
  second copy of it.
- **R119** Ownership of a project and administrator status of the instance are governed by two independently
  correct arithmetics (R5, R66) that agree only where the rules coincide (n ≥ 3) and diverge exactly at n = 2,
  where their divergence is the one place a shared implementation is dangerous.
- **R120** Every "no" this module gives names which kind of no: refused for shape, refused for standing,
  refused for consensus not yet reached, or answered as absence because the caller cannot see the thing at
  all — never a bare failure with no reason, and never "not found" where the true state is "outside your
  reach" or "not yet decided" (§7.9, §7.14).

### Satisfies

- `BIO_Membership_Architecture_v2.md` — the whole document; sections cited individually above.
- `docs/architecture/BIO_System_Design.md` §3, construct 1 ("Membership and authority") and §4 (membership
  attributes every act; publication is owner-gated).
- `docs/development/AUTHORITY-AND-TRUST.md` — cited by System Design as a level-2 design for construct 1, but
  its RULED sections (mechanical determination of a **capture's** authority, undetermined authority as a task)
  concern who supplied captured bytes, a layer-3 (intake and provenance) question; this worker found no
  membership requirement it supports and flags the citation for BOB in its report.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.3 (the project object membership adds
  participation to, without changing) and §5.1–§5.3 (the closed relationship vocabulary — `derived_from` for a
  fork, R78 — and edge ownership, which is why the interest graph a project's citations form is never
  disclosed by a reverse edge to someone outside it).

### Suggestions

- **For `record-core`.** Membership needs, at minimum: (a) a bundle's `object_type` and `title` by id; (b) the
  base (non-project-specific) visibility predicate for a bundle, given a viewer; (c) opaque, uncounted id
  minting for a project's id at creation. This worker names these rather than assuming their shape, per this
  extraction's own instruction, since `record-core`'s requirements are being drafted in parallel.
- **For `promotion`.** `forkProject` (R74–R79) today calls `Store#promote` directly to write the clone's bundle
  — a call from membership into the write path, which is backwards given `promotion` is declared to use
  `membership` and not the reverse (`modules.json`). At extraction, either promotion's own `op=projectfork`
  handler calls membership to validate and prepare the fork (name, origin edge, no-copy-participants,
  ownership) and then writes the bundle itself through its own `promote`, or membership exposes only the
  *preparation* (the validated document text and the origin edge) and never calls `promote`. This worker
  flags the choice for BOB rather than deciding it, since it is an ordering question the current code does
  not answer cleanly. The same inversion applies to a **new** project's id-minting and visibility-on-creation
  rule (R80's `hidden`-by-default, and the `PROJECT_VISIBILITY_NO_OWNER` / `PROJECT_VISIBILITY_NOT_A_CREATION`
  refusals), which today live inside `Store#promote` itself: this worker recommends they become a validation
  membership exposes and promotion's write path calls, so that a project's creation-time visibility rule has
  one home.
- **For `signatures`.** Membership's signer projection (`signerList`, R52–R53) states whether a key *would*
  attest; the actual SSHSIG verification at ratification is performed by the control plane calling
  `signatures.verifySshsig` directly today, with membership supplying only the active-signer set. Membership's
  own paths do not call `signatures` today; this worker did not add a dependency membership does not use.
- **For the caller (whichever module ends up serving `op=whoami`).** `capabilitiesFor`'s answer for a machine
  credential is `null`, never an empty array: there is no member behind a token class, and reporting `[]`
  would invent a member with no capabilities rather than stating that none is being asked about.
