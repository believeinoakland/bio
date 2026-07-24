# BIO Membership Architecture

**v1.4, July 24, 2026.** First-class architecture document, peer to
BIO_Technical_Architecture_Decisions, BIO_State_Rules_Consistency, and
BIO_Functional_Architecture. Specified by Bob Krause in session, July 24,
2026.

**Relationship to other documents.** This document supersedes one decision
in BIO_Technical_Architecture_Decisions v10 Section 10 (token mechanics),
which states that "per-member tokens are deliberately not used; the group
shares its infrastructure." That decision was made when every caller was a
script, a chat session, or the accelerator daemon. It did not contemplate
members holding browsers. Where this document and that decision disagree,
this document governs, and the earlier text should be annotated rather than
silently left standing.

Everything else in the existing architecture is unchanged. In particular,
the integrity model is untouched: record integrity continues to rest on
store-authoritative semantics (content addressing, base-sha CAS,
append-only history, the gate, signature-gated publication) and not on
identifying callers. Membership adds accountability and access control. It
does not add integrity, and must never be described as though it does.

---

## 1. Why membership exists

Four purposes, in the order they matter.

**1.1 A stable name, possibly anonymous.** A group needs a stable way to refer
to a participant across time without necessarily knowing, recording, or
being able to reveal who that participant is in the world.

**1.2 Attribution of consequential acts.** Specific acts must be
attributable to a specific participant:

- the source of hand-carried material entering the fence, as distinct from
  anonymous material arriving through the doorbell;
- ratification, the act that moves material from the working corpus into
  the published record.

An organization whose product is provenance must be able to account for
its own. Today every write is authored by the string "member," which is no
account at all.

**1.3 Declared expertise.** A group needs to know which participants are
lawyers, CPAs, engineers, administrators. This is operational routing
information: who should look at a franchise-fee question, who can read an
ACFR, who is qualified to judge a Brown Act claim. It parallels the group
profile fields (expertise, credentials) in the Roadmap's Settings
category, moved to the level where the knowledge actually sits.

**1.4 Project participation.** Which participants are working on which
projects, and what they may see and do there.

## 2. What membership is NOT

**Not a security boundary.** The load-bearing fence is between the working
corpus and the published record: two buckets, and the published projection
has never held unratified material. Project visibility is organization,
not secrecy. Any participant credential, if compromised, exposes what that
participant could see. Interfaces must not imply otherwise, because a
member who believes projects are private will put things in the working
record that should not be there.

**Not integrity.** See the preamble. A hostile authenticated member can
corrupt the record no more than an anonymous one can.

**Not a network construct.** Membership is scoped to one group's instance.
An administrator is an administrator of that instance and nothing else.
This is what preserves Design Requirement 1: the network remains
distributed with no hierarchy, no headquarters, and no central authority,
because nothing here crosses a group boundary.

## 3. Cover and handle

Two names, assigned by two different parties, for two different purposes.

**Cover** is assigned by an administrator when the invitation is created.
It distinguishes one participant from another in the administrator's
roster. The word is deliberate: a cover is what an administrator needs to
tell participants apart, and it is explicitly NOT a claim about who
someone is in the world. "Ruth C.", "the CPA from the Tuesday meeting",
and "volunteer-7" are all valid covers. A group operating under pressure
should choose covers that do not resolve to civil identities. The term
was chosen over "identity" precisely because "identity" invites an
administrator to type a legal name, and the field must not invite that.

Cover is **required**. A roster of anonymous handles with no
administrator-held distinguishing label offers no defense against a
participant who accumulates handles, submits garbage evidence, or ratifies
indiscriminately. The administrator must be able to say "these two handles
are the same person" or "this handle is the person we vetted."

**Handle** is chosen by the member at enrolment and must be unique across
the instance. It is what appears in the record: the author of a promotion,
the attestor of a ratification, the source of hand-carried material, the
participant list of a project. Members and the public see handles.

**Pairing.** Only administrators see cover and handle together. Whether
a given pairing is published is a per-member decision that either the
member or an administrator may make, which is what allows known and
anonymous members to coexist in the same group without structural
difference.

**Residual risk, stated plainly.** The cover-to-handle table is an
artifact that does not exist under shared tokens, and it lives in
infrastructure subject to legal process. The mitigation is that a cover is
a label rather than a legal name, and it only works if groups actually use
it that way, which is a documentation and interface obligation rather than
a technical guarantee. Naming the field "cover" is the first and cheapest
part of that obligation.

## 4. Administrators

**4.1 A group of one.** The solo participant is the administrator. No
invitation, no handle ceremony, no approval step. Design Requirement 2
requires the system be genuinely useful to one person, so the entire
membership apparatus stays invisible until a second person exists.

**4.2 The second member must be an administrator.** The first invitation a
group issues creates a second administrator. This satisfies Design
Requirement 1 ("administrative access is shared among at least two
individuals and can be transferred") and Design Requirement 14 (no single
point of failure) at the earliest moment it is possible to satisfy them.

**4.3 No ordinary members until there are two administrators.** The group
cannot grow past the two-administrator floor in any other order.

**4.4 Administrator status cannot be taken away.** No administrator may
strip another. This prevents an instance from being captured by whoever
acts first in a dispute.

**4.5 An administrator may resign, but only while more than two exist.**
Resignation is the transfer mechanism: promote the successor, then step
down. The two-administrator floor holds at all times.

**4.6 The root of trust, and the limit of administrator irrevocability.**

Because 4.4 makes administrator status irrevocable, a co-opted, coerced,
or compromised administrator cannot be removed by the other
administrators. The escape hatch is replacing ADMIN_TOKEN in the hosting
dashboard, which returns the instance to an unclaimed state and lets it be
claimed afresh.

That escape hatch cuts both ways, and the document should say so plainly:
whoever can set ADMIN_TOKEN can take the group over. There is no
arrangement in which nobody holds that power, because the instance runs in
somebody's hosting account. **The holders of ADMIN_TOKEN are the root of
trust for that group**, and every other rule in this document sits beneath
them. Membership does not and cannot constrain them.

Two obligations follow. First, holding ADMIN_TOKEN must be a deliberate,
named arrangement rather than an accident of who created the account, and
per Design Requirement 1 it is shared among at least two individuals and
is transferable. Second, no interface may describe the administrator model
as though it bounds this power, because it does not.

**4.7 Adding and removing administrators.** Confirmed July 24, 2026.

**Addition.** The first administrator may add a second administrator
unilaterally, because a group of one has nobody to consult and Design
Requirement 1 wants the second holder to exist as early as possible. Every
subsequent addition requires the consensus of all existing
administrators.

Consensus on addition is the load-bearing half of this rule. Without it, a
captured administrator recruits confederates and manufactures the majority
that then ejects the honest ones. Closing that door is what makes the
removal rule below safe.

**Removal.** A majority of all administrators, counting the target in the
denominator but not permitting them to vote. Ties do not eject. The
arithmetic:

| Administrators | Votes needed | Eligible voters | Effect |
|---|---|---|---|
| 2 | 2 | 1 | impossible, which is correct |
| 3 | 2 | 2 | unanimity of the others |
| 4 | 3 | 3 | unanimity of the others |
| 5 | 3 | 4 | three of four |
| 7 | 4 | 6 | four of six |

Counting the target in the denominator is what makes removal impossible at
two without needing a special case, demands unanimity while the group is
small enough for unanimity to be reasonable, and loosens as the group
grows. A lone captured administrator can never eject anyone. The rule
fails only to a colluding majority, and nothing survives a colluding
majority.

Removals are recorded with the deciding administrators and a reason.

**4.8 Hosting access is separated from administrator status.** Confirmed
July 24, 2026.

An in-app removal cannot reach someone who controls the machine. An
ejected administrator who holds the hosting account simply sets
ADMIN_TOKEN, reclaims the instance, and bans everyone else. Governance
decides who runs this copy; it cannot decide who runs the machine, and no
interface may imply otherwise.

Therefore hosting-account access and administrator status are separate
things held by different people wherever a group can manage it. The
hosting account must never be a single person's personal login; the
platform supports multiple account members and a group uses that.

**When this is enforced.** Not at install, because Design Requirement 2
demands the system be genuinely useful to one person, and a solo
participant is necessarily both the hosting holder and the administrator.
The obligation activates at the moment a group stops being one person:
when the second administrator is added, the group is required to record
who holds hosting access and prompted to make that a different person or,
at minimum, a second account member. That is the first moment the question
is meaningful and the last moment the group is paying attention to setup.

**Ejection is a two-part act.** Removing an administrator in the
application is half of it. The other half is rotating ADMIN_TOKEN and
reviewing hosting-account membership. The interface states this at the
moment of ejection rather than leaving a group to discover it after the
fact.

## 5. Capabilities

Capabilities are set by an administrator when the invitation is created
and are editable afterward by an administrator. A capability a member does
not hold is absent from their interface, not present and refused.

- **contribute** — create and revise bundles in the working corpus.
- **publish** — ratify, which additionally requires a registered signing
  key. The capability governs the surface; the key governs the authority.
- **create projects**.
- **administer** — the roster, capabilities, key approval, and project
  participation, subject to Section 4.

Declared expertise (Section 1.3) is metadata, not capability. It informs
humans; it gates nothing.

## 6. Invitations

An invitation produces a **burner URL** carrying a one-time code. The
administrator transmits it to the prospective member by whatever channel
they judge appropriate; the system takes no position on that channel and
keeps no record of it.

The URL is spent on use. After enrolment it resolves to nothing and
carries no record of what it formerly addressed, so a leaked or archived
link is inert and reveals neither the group nor the invitee.

At enrolment the member chooses a handle, which the system enforces as
unique across the instance, and a password. The administrator-assigned
cover and capabilities are already attached and are not visible to the
member as editable fields.

## 7. Projects

A project in BIO is a record object (BIO_State_Rules_Consistency Section
4.3): a bundle with an objective, an analysis record, a work-product
readiness ladder, recorded evaluations, and a lifecycle of forming,
investigating, matured, closed. The Roadmap's "Projects" category is the
workspace view onto that object. This document adds participation to it
and changes nothing about the object itself.

**7.1 Creation.** A member with the create-projects capability creates a
project and is its owner.

**7.2 Invitation.** The owner invites other members by handle.

**7.3 Visibility.** A member sees only the projects they have been invited
to, whether or not they have accepted. Administrators see all projects and
all participant lists.

**7.4 Joining.** An invited member joins by selecting the checkbox beside
the project. There is no acceptance ceremony beyond that.

**7.5 Participation rights.** An invited member who has not joined has
view rights only. A joined member has the working rights their
capabilities allow.

**7.6 Requesting to leave.** A joined member unchecks the same checkbox.
This does not remove them; it greys the checkmark to record a request to
leave. The member may attach a short explanatory comment.

**7.7 Removal.** Only an administrator removes a participant from a
project, whether or not a request to leave is outstanding. The removing
administrator may attach a short explanatory comment. Project owners
invite; they do not remove. This keeps authority over people with the
custodial role rather than distributing it into content work, consistent
with Design Requirement 1.

**7.8 Participant lists.** Every participant of a project can see the
handles of all other participants of that project. Administrators see all
of them, and every entry in the administrator's roster lists the projects
that member participates in.

**7.9 Containment, and what non-participants see. RESOLVED.**

The containment hierarchy, expressed in the closed relationship
vocabulary of BIO_State_Rules_Consistency Section 5.1:

- Information is the raw material and refers to nothing above it.
- A Problem `cites` zero or more pieces of Information, not necessarily
  uniquely: the same Information may be cited by many Problems.
- A Project stands above zero or more Problems (the Problem carries the
  `elevated_into` edge; the reverse is derived by the index and never
  hand-maintained) and `cites` zero or more pieces of Information
  directly.
- A Project `initiates` zero or more Actions.

Nothing in this hierarchy is exclusive. An Information cited by one
Project may be cited by another, and by Problems under neither.

**Three positions, not two.** Visibility depends on which of three
positions a member occupies with respect to a project:

- **Uninvited.** The project is not visible at all. Not its existence, not
  its name, not its references, not its participants.
- **Invited, not joined.** The project's SKELETON is visible: the Problems
  it stands above, the Information it cites, and the Actions it initiates.
  View rights only.
- **Joined.** Everything, subject to the member's capabilities.

Administrators see all projects and all participant lists.

**What the skeleton excludes**, for the invited: the project's own
content, its analysis record, its work product, its evaluations, its
session log, and its participant list.

**The interest graph does not leak, and this is a property of the edge
model rather than a concession.** Per BIO_State_Rules_Consistency Section
5.2, `cites` lives on the citing object, so a Project's interest in a
piece of Information is a property of the Project. The Information carries
no record of who cites it. A member who cannot see a project therefore
cannot see what it cites, and cannot recover it by inspecting the
Information either.

The one place the graph could escape is the index, which derives the
reverse-edge graph (Section 5.3). Because the index is regenerable,
per-group, and explicitly never authoritative, **derived reverse edges
into projects MUST be filtered by the viewer's position**. This is an
implementation obligation, not a design tradeoff, and it costs nothing
doctrinally. An unfiltered index would leak the interest graph to every
member and would be a defect.

**Why the evidence corpus stays shared.** Information and Problems remain
visible to the group's members generally. Compartmenting the evidence
would fracture the thing the record exists to be, and would mean a member
working on one project could not see material another project had already
gathered. What project participation scopes is the group's thinking:
where an argument has got to, what has been ruled out, what is being
prepared. That is the material with strategic and tactical value before
publication.

## 8. Secure verified export

Scheduled July 24, 2026. Export is the only real answer to a captured root
of trust, because a group that cannot leave is a group that can be held.
It is also, and this is the whole difficulty, exactly the capability an
attacker wants most.

**The tension, stated before the design.** A full export of the working
corpus is the group's entire unpublished position: what it has found, what
it is preparing, what it has ruled out. If any administrator can take
that, then a single captured administrator exfiltrates everything, and
the export feature becomes the most efficient attack in the system. An
export capability that is safe to leave lying around is not an export
capability worth having.

**Two paths, because there are two situations.**

**8.1 Full working-corpus export requires the root of trust.** Not
in-app administrator status: the ADMIN_TOKEN-class credential. The
export is recorded in the append-only history, so it can never happen
silently, and every administrator is notified. This is the path for a
group deliberately moving hosts, splitting, or dissolving. A captured
in-app administrator cannot use it.

**8.2 Published-record reconstruction requires nothing at all.** Published
material is content-addressed, and its hashes are public and verifiable by
anyone with `ssh-keygen` and the doorbell. Any member, or any stranger,
can rebuild and independently verify the published record without the
cooperation, permission, or continued existence of the instance it came
from. Nothing can be withheld here, by construction, because withholding
it was never possible.

**The honest limit.** If the root of trust itself is captured, the
remaining members leave with everything published and lose the unpublished
thinking. That is a real loss and it should be stated to groups plainly
rather than glossed. It is also the correct trade: the unpublished
material is precisely what must not be extractable by whoever acquired a
credential. A group worried about this holds its own local copies through
normal use, which the bundle format already supports.

**What "verified" must mean.** An export carries its own manifest and is
checked on both sides: every file hashed on the way out, every bundle's
history chain and base links re-derived on the way in, every registered
capture byte-compared. The receiving instance trusts nothing the sending
instance asserts. The migration tooling already demonstrates a full
verified transfer of the real record, so this is a productization of a
proven path rather than new ground.

**Why this belongs in this document.** Exit is what makes every other rule
here enforceable. Consensus on adding administrators, majority on removing
them, and separation of hosting access all assume that a group which loses
those arguments can still walk away with its work. Requirement 3 says
groups form and dissolve freely; Requirement 13 says compromising one
group must not compromise the network. Applied inward, a captured instance
is a captured group, and the prescribed response is to fork away from it.

## 9. Architecture debt: the root of trust is unmodelled

Recorded July 24, 2026 as debt, deliberately not resolved.

This document leans on "the root of trust" in three places: as the
backstop when an administrator is captured (4.6), as the reason hosting
access must be separated from administrator status (4.8), and as the
credential that gates full working-corpus export (8.1). In each case the
concept does real load-bearing work.

**The system has no first-class representation of it.** What exists is
ADMIN_TOKEN, a bootstrap credential living in the Worker's own settings,
which was designed for a different job: to be spent once when a group
claims its instance, and to serve as the recovery path when a password is
lost. It became the root of trust by accident of being the only thing that
can reclaim an instance.

Four consequences, all of them debt rather than defects:

1. **It is a proxy, not the thing itself.** Anyone with hosting access can
   read or replace ADMIN_TOKEN. So gating export on ADMIN_TOKEN really
   gates it on hosting access, which is the correct effect reached by an
   unmodelled route. Section 4.8 asks groups to separate hosting access
   from administrator status, and the software cannot verify that they
   did, cannot show them whether they did, and cannot behave differently
   if they did not.

2. **It has no custody model.** There is one string. There is no m-of-n,
   no split custody, no way for a group to require two of its three
   trusted holders to act together. For the single most consequential
   power in a group's instance, that is thin.

3. **It is not auditable.** A change of ADMIN_TOKEN happens in a hosting
   dashboard and leaves no trace in the record. The instance can observe
   that its bootstrap credential no longer matches what it saw before, and
   in fact does exactly that to offer re-claiming, but a group cannot ask
   the record who held the root of trust and when that changed.

4. **It cannot be rotated without ceremony.** Replacing it returns the
   instance to unclaimed, which is appropriate for recovery and much too
   heavy for hygiene. So in practice it will not be rotated, and a
   credential that is never rotated accumulates exposure.

**Why this is recorded rather than fixed.** Doing it properly means
deciding what the root of trust IS for a BIO group: a set of named key
holders, a threshold policy, an out-of-band recovery instrument, or
something that deliberately lives outside the software. That is a doctrine
question of the same weight as the membership model itself, and it
deserves its own analysis rather than being settled as a footnote to this
one. Until then, every claim in this document about the root of trust
should be read as "whoever controls the hosting account," because that is
what it actually means today.

## 10. Data model sketch

Extends the existing `members` and `signers` tables rather than replacing
them. Concrete DDL belongs with the implementation; the shape is:

- `members`: handle (primary key, unique instance-wide), cover
  (required, administrator-assigned), pairing_published (boolean),
  capabilities (set), expertise (list), status, timestamps.
- `invitations`: code hash, cover, capabilities, created, spent_at.
  Spent rows retain no addressing information.
- `projects`: bundle_id (the PROJ- bundle), owner_handle, created.
- `project_participants`: bundle_id, handle, state (invited, joined,
  leave_requested), comment, timestamps, acted_by.

Handles are the join key everywhere, so the record never stores a cover
alongside content.

## 11. What must be true before this ships

1. The index MUST filter derived reverse edges by the viewer's position
   with respect to each project. An unfiltered index leaks the interest
   graph and is a defect, not a tradeoff.
2. The cover field labelled and documented as a distinguishing label
   rather than a legal name, wherever it appears.
3. BIO_Technical_Architecture_Decisions v10 Section 10 annotated to point
   at this document, so the two do not disagree in silence.
4. The one-person case verified to touch none of this.
