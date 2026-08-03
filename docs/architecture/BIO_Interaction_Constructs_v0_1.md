# BIO interaction constructs — v0.2 (v0.1 derivation retained below)

Written 2026-07-31 (session BOB) at Bob's direction: *"it's important that we define
and create the proper UI constructs… a tasks construct that supports that action-flow
may be something that users will feel familiar with… perhaps there are other such
constructs."*

**NAME COLLISION, stated first.** `docs/architecture/CONSTRUCTS.md` is the CONTENT
framework's inventory (stack handlers, digests, content types). This document is about
INTERACTION constructs — the shapes through which a member acts. They are unrelated
and a session that conflates them will build the wrong thing.

## Revision 0.2, 2026-07-31: the count came down, and here is the tradeoff

Bob, on reading v0.1: *"Are you suggesting that each of these are different
constructs? Maybe they are. But have you considered the tradeoffs between fewer
constructs for users to understand and interact with versus more where each better
suits their desired/expected experience for that action?"*

The challenge lands. v0.1 derived its set from SYSTEM properties — does this have its
own accountability rule, do its refusals share a shape — and then argued "five shapes,
not forty screens" while presenting seven. The argument cut against the answer.

### The conflation that produced too many

**Construct count for the MEMBER is not type count for the MODEL, and v0.1 treated
them as one number.** The system may need to hold proposals and tasks as distinct
types — different accountability, different ageing, different visual treatment — while
the member experiences ONE queue whose items tell them what they want. That is not a
compromise; it is the correct layering. A member learns "my queue"; the model keeps
two types inside it.

Applying that, three of v0.1's seven collapse:

- **BALLOT into the act.** From the member's side, endorsing an administrator and
  disposing of a focus are the same motion: an authored decision with a reason that
  goes on the record. What differs is that the ballot shows a tally and your act may
  not be decisive — that is a STATUS DISPLAY, not a different interaction.
- **PROPOSAL into the queue.** Adopt/defer/dismiss versus do/forward/resolve are
  different verb sets on an item in a list, not different lists. The accountability
  rules survive intact as properties of the type: a proposal must still LOOK derived
  (D-82) and must still age rather than vanish (D-79).
- **SELECTION-SCOPED** was already a modifier in v0.1 and stays one.

### Where FEWER costs something, which is the other half of the tradeoff

Collapsing is not free, and two places it would do real damage:

**1. A member's existing mental model.** This is the test v0.1 lacked, and it is
exactly what Bob's question names. People arrive with a model for SIGNING that is not
"filling in a form": deliberate, ceremonial, hard to do by accident. If ratification
becomes a variation of the act surface, the ceremony is lost — and the ceremony IS the
safeguard. A published hash answers forever; D-114 refused to loosen that fence on one
session's reading of one sentence, and the interface must not be looser than the check.

**2. Weight flattening.** If dismissing a focus and publishing a document are the same
shape with different labels, the member's hand learns one motion and the difference
stops being felt. That is a doctrine failure wearing a usability improvement.

So the answer is not "as few as possible". It is: **collapse where the member's
experience is genuinely the same motion; keep separate where their existing model, or
the weight of the act, would be violated by sameness.**

### The revised set: TWO constructs, one ladder, one primitive

| | what the member learns |
| --- | --- |
| **QUEUE** | *things that want me,* **grouped by the case they belong to.** Items are typed and say what they offer: an obligation I must dispatch (do / forward / resolve), or something the system noticed and nobody has judged yet (adopt / defer / dismiss). Items with no case sit ungrouped. |

**The three classes are DOMAINS, not item types** (Bob, 2026-08-01): a FINDING is the substrate of
case-making (D-127, undesigned — and it is what the system is for); an OBLIGATION is the civic system's own
declared flow, whose delta against the observed flow is the analytic product (D-128); a CONDITION is a signal,
with three dispositions — recorded (never surfaces), noticed (status where the thing lives), actionable (earns
a queue item). So each has its own HOME beyond the queue — a case, a flow model, a signal history — while the
QUEUE stays ONE surface reaching into all three. One thing to learn; three places the work lives.

**NAMING COLLISION, corrected 2026-08-01.** This document called the ladder WEIGHT. The plane already
uses `weight` for something orthogonal and older: `selectionResolve({ …, weight = "report" })` in
`store.mjs:1192` is the SET-APPLICATION mode — `report` proceeds and says what moved, `refuse` stops and
hands over nothing, and `per-item` is the third mode this study added. Two different ideas under one word
in a codebase that has already paid for exactly that (D-8's vocabulary drift, the three copies of one state
machine). So: the LADDER is **rungs** — reversible, reasoned, terminal, attested — and **weight** stays the
plane's set-application mode. An act has a rung; applying it to a set has a weight.

**What may be PUT in the queue is catalogued in `docs/development/NOTIFICATIONS.md`** — about thirty
generators today, sorted into three classes (FINDING, OBLIGATION, CONDITION) rather than a severity
ladder, with the item contract (summary, detail, basis, producer-published options) and the per-item
application semantics. Notification kinds take stable `N-` ids the way checks take `C-` ids, which closes
the ad-hoc-event-strings half of D-68.

**The queue groups by CASE, ruled 2026-08-01 (DEC-10).** All events on one Focus or
Project aggregate into a single standing entry — "three things need attention on the
Sewer Fund project" — and the entry is handled both **at group level and item by
item**. Two reasons this is the right key rather than grouping by finding type:

- **It is the member's own unit of work.** Grouping by kind is a system-shaped bucket
  that crosses cases, so somebody working the sewer fund gets told about parks minutes.
- **It needs no second axis.** The relevance filter that decides an event is worth
  notifying at all is "does this instance connect to a Focus or Project", and the
  aggregation key is that SAME connection. Filter and grouping share one key, and the
  connection is an authored act, so the grouping is derived from something a member
  actually did rather than from a rule the system invented.

Two properties this puts on the construct, both of which are hazards if lost:

- **The entry is standing and accumulating, not a stream.** No digest cadence, no
  notify-every-N-hours job. One live item per (member, case) while it has unhandled
  events; it re-notifies only on a snooze increment or when something new lands after
  the member last looked.
- **A group-level mute is scoped to the kinds present when it was made.** A genuinely
  new kind of event on that case surfaces again, or "mute this case" becomes a
  permanent blindfold — the silent-disappearance failure, one level up from the
  muting-is-personal-dismissing-is-a-record-act rule.

Group-level and item-level acts are the **SELECTION-SCOPED** modifier below, used for
the first time outside the record surfaces — which makes this the first real test that
the modifier generalises.

**RULED 2026-08-02 (DEC-16): once questions NEST, an event reaches EVERY ancestor, and
one member's resolution settles it for all of them.** DEC-10 was ruled when a `focus`
was a leaf. The type collapse made `inquiry` recursive — a basis leg may target another
inquiry — so an event on a document now sits under a chain of questions, and "the case
it belongs to" stopped being one thing.

**The unit of state is the EVENT, not the notification.** It has one state and N homes.
This is what keeps the every-ancestor answer from flooding anybody: the objection to it
assumed N copies each needing separate handling, and there are not N copies. DEC-10's
*one standing entry per (member, case)* is untouched — an event appearing in several
entries does not create several entries.

Four properties follow, and each reuses a rule that already exists:

- **Resolution is attributed and visible, never a deletion.** A member who did not
  resolve it sees *resolved by X on this date*, not a gap. Shared resolution makes the
  muting-is-personal / dismissing-is-a-record-act rule MORE load-bearing, not less,
  because one member's act now clears another's queue — the one case where a silent
  disappearance is indistinguishable from a bug.
- **An act that changes the record is itself an event.** This is what makes shared
  resolution safe despite the resolver often being at a different altitude from the
  member who most needs the news. Resolving by looking and finding nothing changed
  correctly clears it for everyone; resolving by regrading, severing or re-capturing
  clears it and immediately raises its own event, which propagates the same way.
- **Any member who can see the case and holds `contribute` may resolve**, attributed —
  not only the member who authored the connection, whose absence would otherwise strand
  it. A machine credential may not (the act-level refusal, D-151).
- **The ancestor walk inherits R3's depth bound**, and an exhausted walk states that the
  ancestor set is `undetermined` rather than notifying a silently truncated one. A
  truncated notification set is indistinguishable from nobody caring.

| **ACT** | *doing something to a record or a set.* One motion: choose, see what it will refuse and why BEFORE it runs, author the reason, get a receipt. Ballots are acts whose status shows a tally; bulk is the same act scoped to a selection. |
| **THE RUNG LADDER** (renamed from "weight" 2026-08-01 — see the collision note below) | not a construct — a property of every act, visible and escalating, learned once and read everywhere: **reversible** · **reasoned** (a justification is required and never prefilled) · **terminal** (internal, cannot be walked back) · **attested** (irreversible, public, requires a key). Orthogonal to it, an act applied to a SET carries one of three application modes: `refuse` (all-or-nothing), `report` (proceeds, says what moved), or `per-item` (each succeeds independently or is RETAINED WITH A REASON). See `NOTIFICATIONS.md`. |
| **UNDETERMINED** | a display primitive, identical in all six places it appears. |

**Attestation stays distinguishable — as the top rung of the ladder, not a separate
construct.** That is the compromise the tradeoff actually supports: a member does not
learn a new shape, but the act does not feel like the others either, because the top
rung carries its own ceremony (what becomes permanent, what it does and does not
claim, an explicit key act). One thing to learn, two things to feel.

**Everything v0.1 wrote about ACCOUNTABILITY survives unchanged**, and that is the
point of the collapse: those rules attach to the TYPE, not to a separate construct.
The system still must not prefill a justification, still must show the denominator on
a ballot, still must make a proposal look derived, still must render `undetermined`
identically. Nothing is lost by the member meeting them through two doors instead of
five.

### RULED 2026-08-01: the pre-flight is plane-sourced — publication by default, dry-run when the refusal needs unseen state

The ACT construct's defining property is *see what it will refuse and why BEFORE it runs.*
This says how that is produced, because v0.2 did not, and two readings were live with
different costs (DEC-8, raised by UI from the first act built).

**The rule: a surface may RENDER a refusal it received from the plane. It may never
COMPUTE one.** There are exactly two mechanisms and the choice between them is not taste:

1. **PUBLICATION — the default.** The plane publishes the refusal contract and the surface
   renders it: the `NEEDS` map, the legal-edge table EXPORTED from the check catalogue (not
   copied), the set-application weight, `SESSION_OPS` membership, the rung, and the object
   vocabularies. This is `op=affordances`, and it mints no new pattern — `whoami` already
   publishes capabilities and `op=searchfields` already publishes the query language.
   Publication is not a mirror: there is one authority, and the surface holds no second copy
   of it.
2. **DRY RUN — when a refusal turns on state the surface cannot see.** A non-mutating op
   that runs the real act's refusal checks, writes nothing, and returns the named refusals in
   the store's own order. `op=publishpreflight` is the first: publication's refusals depend on
   the gate, the signer set and R2 object state, none of which a browser can evaluate — and
   one of which (`NO_SIGNERS`) is today discovered LAST, after the member has already signed.

**Why the obvious test — "is this refusal client-knowable?" — is the wrong one.** A refusal
is client-knowable exactly when the surface HOLDS A COPY of the rule. So the test licenses
the drift class `INTERFACES.md` names, and licenses it in proportion to how much the surface
has already copied: it gets easier to satisfy the worse the problem gets.

**And the copy's one defence was measured false.** The first act's mirrored `LEGAL` table
was defended as *"already guarded by `check-semantics.mjs`"*. D-138, verified 2026-08-01:
that file reads `app.html` and `store.mjs` and never reads `bio-checks.mjs` — it binds two
copies to each other and leaves the AUTHORITY unchecked, while a comment in `app.html`
claims otherwise. A drift in the catalogue passes silently. The mirror was defended by a
guard that does not guard.

**The standing test for a new act**, so this is not re-argued per surface: *can the surface
state this refusal without holding a rule the plane also holds?* If yes, it came from
`op=affordances`. If no, the act needs a dry-run op, and building the surface first is
building a mirror it cannot honour.

**Why this belongs in the doctrine and not only in a build item.** A surface that tells a
member what will be refused, on its own authority, is a surface claiming more than it can
support — the failure this product is organised against, appearing in the interface layer.
An act whose pre-flight is a good guess is worse than an act with no pre-flight, because the
member learns to trust it.

### What would falsify this

If the first three capabilities built into the ACT construct each need a bespoke
surface anyway, the collapse was wrong and v0.1's finer split was right. If they
arrive as a type and a weight, it was right. **Build T (the queue) and one act, then
re-read this** — the answer is cheap to get from two rungs of evidence and expensive
to argue further in the abstract.

The sections below are v0.1's derivation. They are kept because the accountability
rules in them are unchanged and load-bearing; read them as the TYPES inside the two
constructs above, not as seven peers.

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

**THE BOUNDARY OF THE PREFILL RULE, drawn 2026-08-01** (`PRACTICE-SURVEY.md`, and it
is the one auto-composition in that whole survey BIO could take unchanged). Zotero's
"Add Note from Annotations" assembles a member's OWN prior highlights into a note, each
carrying its citation and a jump back to the source page. **That is permissible and
useful. Generating NEW words is what is forbidden.**

The line is precise and worth stating because without it a session builds no compose
step at all, over-applying the rule: **assembling what a member already wrote is not a
fabricated attribution; drafting a justification for them is.** A surface may gather a
member's own authored notes, excerpts and prior reasons into one place for them to work
from. It may not draft, suggest, template, or complete.

**Accountability rule, and it is absolute: the system must never put words in a
member's mouth.** The text becomes part of the record and is read later as that
member's own act, so a prefilled or suggested justification is a fabricated attribution
in a system whose entire product is that claims carry their author. No templates, no
"suggested reason", no LLM-drafted default.

**Refusal shape:** the plane's own words, with the offenders NAMED, and nothing
written. `SEVERED_EDGE`, `NOT_INFORMATION`, `CITATION_TOO_LARGE` and the retire-refuses-
cited-Information case all already answer this way; the surface renders them rather
than paraphrasing.

## A · ATTESTATION — the signed act that cannot be undone SILENTLY

**Carries:** ratification · co-attestation on crucial material · signing a release
artifact.

**CORRECTED 2026-08-02 by Bob (DEC-19). This construct was called "the irreversible signed
act" and that was wrong.** *"People make mistakes or misinterpret. An attestation must be
reversible to correct mistakes. (Though there may be a record of the attestation and reversal
in the record.)"*

**Reversal is not erasure, and the parenthesis is the mechanism.** The attestation happened,
and a record whose purpose is attribution cannot un-happen it. Reversing one is a FURTHER
attested act — dated, attributed, signed — that retracts the first, with **both** standing in
the record. The published bytes stay answerable, so a reader who relied on the original can
still see exactly what they relied on and can now also see it was withdrawn.

**So what separates this rung is not that the act cannot be undone. It is that it cannot be
undone SILENTLY** — every correction is itself an act on the record with a name and a date on
it. That is a stronger guarantee than irreversibility, and it is the one this project wants:
irreversibility protects the reader from the publisher, while non-silent correction protects
the reader from the publisher AND lets the publisher be honest about having been wrong.

**This also makes `terminal` stale, and it had been stale since 2026-08-01 without anyone
noticing.** DEC-12 ruled that a published case may be revised as a new edition and that a
closed finding may be REOPENED, so a rung defined as *"cannot be walked back"* no longer
describes anything in the system. The ladder's top two rungs are distinguished by the WEIGHT
and VISIBILITY of the correction they require, not by the absence of one.

**Separate from a justified transition because of that weight.** A published hash
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

## P · THE ASSISTANT — one way in, on every surface

**Carries:** free natural-language input (typed or spoken) on every surface, expanding from a
persistent tag into a dialog. RULED 2026-08-03 by Bob (DEC-27).

**Both a construct and a surface.** The tag instantiates everywhere, like the ACT; the expanded
dialog is S12, with its own states.

**Three request kinds, three levels of ceremony**, because one rule cannot cover them: FIND is a
read and needs none; CREATE proposes objects and needs confirmation; ACT changes the record.

**The rule that protects everything else: the assistant may INITIATE an act, and the act still
runs its four beats.** It is never a shortcut past the pre-flight, the authored reason, or the
receipt. An assistant that could commit directly would be a back door around every safeguard
here, and the most convenient control in the product -- which is precisely why it must not exist.

**Accountability rule:** the member's words stay the member's. When prose becomes a claim, the
member authored it -- the machine chose the shape, not the content, which is transcription and
routing rather than generation. Three limits keep it there: it never commits, only proposes and
shows what it understood; it structures only what was SAID, and asks rather than asserts when it
thinks something further is implied; and it may propose project defaults from a
self-identification but never set them silently, because a project's required evidentiary
strength is a DECLARATION (DEC-17) and an inferred declaration is not one.

**Voice:** transcribed speech is machine-produced text. A mis-transcription that reaches an
authored field corrupts the member's own testimony, so transcription is always shown for
correction before it becomes anything, and that it was transcribed is recorded.

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
