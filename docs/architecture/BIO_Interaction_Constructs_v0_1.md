# BIO interaction constructs v0.1

Written 2026-07-31 (session BOB) at Bob's direction: *"it's important that we define
and create the proper UI constructs… a tasks construct that supports that action-flow
may be something that users will feel familiar with… perhaps there are other such
constructs."*

**NAME COLLISION, stated first.** `docs/architecture/CONSTRUCTS.md` is the CONTENT
framework's inventory (stack handlers, digests, content types). This document is about
INTERACTION constructs — the shapes through which a member acts. They are unrelated
and a session that conflates them will build the wrong thing.

## Why constructs rather than surfaces

The measured gap (`UI-PLAN.md`, 2026-07-31) is 18 of 63 member-reachable ops. The
tempting response is forty screens, one per capability. That fails the governing rule:
the audience is non-technical, and the workflow exists to remove members from
logistics so they operate at a higher level. **Forty screens is forty things to learn.
Five constructs is five, and each new capability then arrives already familiar.**

A construct earns its place by three tests:

1. **It carries several capabilities**, not one dressed up.
2. **It has its own accountability rule** — something about what the record may claim
   that is true of every instance of it and false of the others.
3. **Its refusals are the same shape**, so a member who has met one refusal
   understands the next.

## The attention layer is not a peer of the acts

Bob named tasks and grouped ratification, authority assignment and membership steps
under them. That grouping is right, and it points at something worth making explicit:

**TASK is the ATTENTION layer — how work reaches a person. It is not one of the acts.**
A task says *this needs you*; it then points at the act, which is one of the four
below. Keeping them separate is what stops the inbox becoming a second, parallel
application: a task is a pointer with a lifecycle, and resolving it happens in the act's
own surface, where the context is.

    TASK ──points at──> BALLOT | PROPOSAL | JUSTIFIED TRANSITION | ATTESTATION
                        (and a SELECTION-SCOPED ACTION is how any of them goes bulk)

## T · TASK — an obligation with an assignee, and sometimes a clock

**Already half-built in the plane** (D-98, 0.49.0): `tasks`, `taskforward`,
`taskresolve`, routing through `member_expertise` to the project manager falling back
to a group admin, forwardable, deduped on `(refers_to, kind)` across live tasks. It has
no surface at all, which is M8's sharpest gap: the record can be obliged to ask a person
something and has nowhere to ask.

**Carries:** authority determination on an undetermined capture (the RULED case) ·
"you owe an endorsement" on a pending consensus · an expertise confirmation awaiting an
administrator · a ratification request · a review of an assistant-surfaced focus · a
temporal expectation that has come due · bias debt owed after a lens change.

**The clock half is already argued for.** D-86 records that bias debt and temporal
expectations are the same shape — *an obligation with a clock, attached to an object,
blocking a state transition, settleable in batches* — and that two schedulers would be
two sets of bugs about one thing. That description IS this construct. Building the task
object without the clock would split it again.

**Accountability rule:** a task is never silently dropped. Unactioned, it AGES with a
recorded reason (D-79); it does not vanish, because a finding that disappears is
indistinguishable from one never made. And a task is addressed to somebody or honestly
`unassigned` — never to a phantom (D-98's third under-specification, resolved that way).

**Refusal shape:** "this is not yours to resolve, and here is who it is with."

## B · BALLOT — a multi-party act with computed arithmetic

**Carries:** administrator addition past the second (consensus) · administrator removal
(majority of all administrators, counting the target in the denominator without letting
them vote) · project owner addition and removal, which DIVERGES from the admin rule at
exactly two owners · owner rescue when every owner is inactive.

**The arithmetic already exists as an op precisely so it is computed rather than
transcribed** (`adminarith`, `projectownerarith`). The construct's job is to show the
tally, who must still act, what carries, and what happens at the boundary — never to
restate the rule in the interface, where it would drift from the plane.

**Accountability rule:** a ballot shows the DENOMINATOR. "2 of 3 endorsements" is a
fact a member can check; "pending approval" is not. And the divergence at two owners is
displayed, not hidden, because that row is the one a shared implementation gets wrong.

**Distinct from a task** because the outcome depends on other people. A task is mine; a
ballot is ours. They compose: the task says *you owe an endorsement*, the ballot is
where it is given.

## P · PROPOSAL — a derived finding awaiting an authored act

**Carries:** an assistant-surfaced focus · a connection the system inferred, with its
grade · a missing predecessor in a progression · the gap list derived from an
objective's satisfaction condition · a decayed bias measure.

**Its charter is already doctrine.** D-90, invariant 8: *derived things inform and
authored acts bind.* A proposal reports; it never decides, never blocks, and never
edits the thing it is about. The path from a proposal to a binding change runs through
a person: the measure reports, a member amends, that amendment is authored.

**Accountability rule, and it is the reason this is NOT a task:** a proposal must be
visibly one. D-82 — an assistant-surfaced focus must LOOK like one, not to discount it,
because a good question stands on its merits whoever asked it, but because **what a
member needs to know is that nobody has yet judged it worth asking.** Collapsing
proposals into tasks would present machine findings as obligations, which is exactly
the drowning failure D-79 warns of: one check across 58 contracts is ONE proposal with
58 instances, never 58 tasks.

**Three affordances, and only three:** adopt (into an objective, a focus, a problem),
defer with a recorded reason, dismiss with a recorded reason. Nothing is adopted
automatically and nothing disappears silently.

## J · JUSTIFIED TRANSITION — a state change carrying authored text that becomes evidence

**Carries:** release, `collected → verified`, with acknowledgment and mitigation ·
disposition of a focus to deferred or dismissed, which C-2.8 requires a reason for ·
severing and reinstating a citation, both requiring a reason · retirement,
`verified → retired`, terminal.

**Already built once and the pattern generalises.** U5 shipped release this way:
capability-shaped, typed acknowledgment and mitigation, **never prefilled**, refusals
rendered verbatim with their offenders.

**Accountability rule, and it is absolute: the system must never put words in a
member's mouth.** The text becomes part of the record and is read later as that
member's own act, so a prefilled or suggested justification is a fabricated attribution
in a system whose entire product is that claims carry their author. No templates, no
"suggested reason", no LLM-drafted default.

**Refusal shape:** the plane's own words, with the offenders NAMED, and nothing
written. `SEVERED_EDGE`, `NOT_INFORMATION`, `CITATION_TOO_LARGE` and the retire-refuses-
cited-Information case all already answer this way; the surface renders them rather
than paraphrasing.

## A · ATTESTATION — the irreversible signed act

**Carries:** ratification · co-attestation on crucial material · signing a release
artifact.

**Separate from a justified transition because it cannot be undone.** A published hash
answers forever by design. That is why D-114 refused to loosen the publication fence on
one session's reading of one sentence, and the interface must carry the same weight: a
considered act, not a button in a row of buttons.

**Accountability rule:** the surface states what is about to become permanent and what
it will and will not claim. What a published hash asserts is bytes, address, date and
route — **not** that the document is an authentic municipal record. A member who thinks
they are certifying authenticity has been misled by the surface, whatever the record
says underneath.

## S · SELECTION-SCOPED ACTION — how any act goes bulk, safely

Not a fifth act but a MODIFIER on the others, and the plane already implements its hard
part: a selection is a server-side lease with published expiry, drift detected exactly
and classified from the manifest's `writer` and `operation`, never absorbed.

**The construct's whole job is to make the plane's two weights FELT.** `report`-weight
actions proceed on drift and say what moved; `refuse`-weight actions stop and hand over
nothing, so they cannot half-run. A member must be able to tell, before acting, which
kind they are about to perform — and the surface should show what the action will
REFUSE and why before it runs, not after.

**Accountability rule:** an action lands on the set the operator saw. Auto-updating a
selection is rejected doctrine (D-35): a selection records INTENT, and an action landing
on rows the operator never saw is an accountability failure in a record whose purpose is
attribution. Visibility may only ever SHRINK a selection.

## U · UNDETERMINED — a display primitive, not an act

Not a construct a member operates; a shape the interface must render **identically
everywhere**, because it appears in at least six unrelated places: authority state, link
verdict, contemporaneity, PDF text, capture completeness, and reuse `not_attempted`.

**The standing ruling is that `undetermined` is first-class and must be STATED**, never
invented past and never dressed as an error. If it looks like a failure in one surface
and a shrug in another, members learn to ignore it — and the honest gap is precisely
what this record's trustworthiness rests on. One visual treatment, one voice: *what we
do not know, and why we do not know it.*

## What this changes about how M8 is built

**Build the constructs, then the capabilities arrive cheaply.** The order that follows:

1. **T, the task construct**, first — it is the attention layer, it is the sharpest
   measured gap, and its plane half already ships. Nothing else routes work to a person.
2. **J, justified transition**, second — U5 already built one instance, so this is
   generalising working code rather than new ground, and it unlocks dispose, sever,
   reinstate and retire together.
3. **B, ballot**, third — it makes the entire S-12 governance surface reachable, which
   is seven releases of enforced-but-unusable rules.
4. **S, selection-scoped**, alongside J, since the bulk forms of those transitions are
   where the weights matter.
5. **P, proposal**, when the framework produces findings to propose (M4). Building it
   earlier would be a surface with nothing to show.
6. **A, attestation**, on the crucial path (U10), against the plane's attest/ratify ops.
7. **U** is not scheduled — it is a rule every rung obeys, and the suite's existing
   member-facing vocabulary guard is where it gets enforced.

**The test of whether this document was worth writing:** when the next capability
lands — bias statements, aspirations, progressions — it should need a place in an
existing construct rather than a new screen. If it needs a seventh construct, that is a
real finding about the domain and not a failure here; if it needs a *fourteenth*, this
decomposition was wrong.
