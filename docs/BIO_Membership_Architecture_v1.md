# BIO Membership Architecture

**v1, July 24, 2026.** First-class architecture document, peer to
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

**1.1 Identity, possibly anonymous.** A group needs a stable way to refer
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

## 3. Identity and handle

Two names, assigned by two different parties, for two different purposes.

**Identity** is assigned by an administrator when the invitation is
created. It distinguishes one participant from another in the
administrator's roster. **It is a label, not necessarily a legal name.**
"Ruth C.", "the CPA from the Tuesday meeting", and "volunteer-7" are all
valid identities. A group operating under pressure should choose
identities that do not resolve to civil identities, and the interface
must say so where the field is filled in.

Identity is **required**. A roster of anonymous handles with no
administrator-held distinguishing label offers no defense against a
participant who accumulates handles, submits garbage evidence, or ratifies
indiscriminately. The administrator must be able to say "these two handles
are the same person" or "this handle is that person we vetted."

**Handle** is chosen by the member at enrolment and must be unique across
the instance. It is what appears in the record: the author of a promotion,
the attestor of a ratification, the source of hand-carried material, the
participant list of a project. Members and the public see handles.

**Pairing.** Only administrators see identity and handle together. Whether
a given pairing is published is a per-member decision that either the
member or an administrator may make, which is what allows known and
anonymous members to coexist in the same group without structural
difference.

**Residual risk, stated plainly.** The identity-to-handle table is an
artifact that does not exist under shared tokens, and it lives in
infrastructure subject to legal process. The mitigation is that identity
is a label rather than a legal name; the mitigation only works if groups
actually use it that way, which is a documentation and interface
obligation, not a technical guarantee.

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

**4.6 Open question, recorded not resolved.** Because 4.4 makes
administrator status irrevocable, a co-opted, coerced, or compromised
administrator cannot be removed by the others. Design Requirement 13
assumes active opposition including infiltration and co-option, so this
needs an answer. The only present escape hatch is replacing ADMIN_TOKEN in
the hosting dashboard, which returns the whole instance to an unclaimed
state and is not proportionate. Candidate answers: removal by unanimous
consent of all other administrators; removal by supermajority with a
mandatory waiting period and a recorded reason; or an explicit decision
that the nuclear path is the intended one. **This must be decided before
any group runs with more than a handful of participants.**

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
identity and capabilities are already attached and are not visible to the
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

**7.9 Reach of visibility.** OPEN. Whether being outside a project hides
only the project object and its participants (narrow), or also hides the
information and problem bundles gathered under it (full), is not decided.
Narrow is additive and preserves the record as a corpus shared among the
group's members. Full restructures the privacy model and requires bundles
to belong to projects, which today they do not. This must be settled
before project visibility is implemented.

## 8. Data model sketch

Extends the existing `members` and `signers` tables rather than replacing
them. Concrete DDL belongs with the implementation; the shape is:

- `members`: handle (primary key, unique instance-wide), identity
  (required, administrator-assigned), pairing_published (boolean),
  capabilities (set), expertise (list), status, timestamps.
- `invitations`: code hash, identity, capabilities, created, spent_at.
  Spent rows retain no addressing information.
- `projects`: bundle_id (the PROJ- bundle), owner_handle, created.
- `project_participants`: bundle_id, handle, state (invited, joined,
  leave_requested), comment, timestamps, acted_by.

Handles are the join key everywhere, so the record never stores identity
alongside content.

## 9. What must be true before this ships

1. Section 4.6 answered: how a compromised administrator is removed.
2. Section 7.9 answered: the reach of project visibility.
3. The identity field labelled and documented as a distinguishing label
   rather than a legal name, wherever it appears.
4. BIO_Technical_Architecture_Decisions v10 Section 10 annotated to point
   at this document, so the two do not disagree in silence.
5. The one-person case verified to touch none of this.
