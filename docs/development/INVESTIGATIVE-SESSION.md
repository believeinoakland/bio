# The investigative session — proactive AI claim formulation

**Bob, 2026-08-05, session BOB.** Ruled as DEC-60. This document carries the reasoning;
the decision entry carries the verdict. **Rewritten 2026-08-05** when the support/defeat
structure landed (§5); the first draft's framing of claim relationships was wrong and §14
records what was withdrawn and why.

A member with an inquiry presses a button and a **skilled AI session** runs against that
inquiry: it reads the project, finds evidence, and formulates claims and legs — *without
prior human involvement in the formulation*. Everything it writes is a SUGGESTION. The
member evolves, discards or accepts.

The machine/member division does not move. What moves is the assumption that it had to be
enforced as *the machine may not produce the object*. It is enforced as **the machine may
not accept the object**.

---

## 1 · Why — settled, kept short

- **Coverage.** A member constructs the claims they thought of; the ones they did not are
  simply absent, and absence at the meaning level is indistinguishable from nothing having
  been there. `CLAUDE.md` already rules that the searching which grows the document set is
  the same process that produces meaning — ONE process at several altitudes. This is that
  process at the meaning altitude.
- **Members need it (Bob).** The rigor is already past what an average user produces
  unaided. Withholding the tool is not a safeguard; it is **a barrier that selects for
  users who already had the skill, and skill is not good faith.**
- **It strengthens the bad-actor defences (Bob).** A bad actor cannot beat structural
  gates, so the attack that works is NOT LOOKING — motivated omission, which the system
  cannot see (D-194, D-196). A session that formulates from the evidence regardless of what
  the member hoped to find is the first instrument that can see it.

## 2 · The objective

**Formulate claims and legs SUPPORTED BY EVIDENCE. The goal is not to support or disprove
a position.** Bob, 2026-08-05. Positive and therefore testable: a run whose claims only
ever point one way is failing its own objective, visibly, without anyone knowing what the
member wanted.

The session pursues the strongest SET of claims for the inquiry and **does not resolve what
the evidence does not resolve.**

## 3 · What the session sees, and what it may write

Read broad, write narrow — D-199's declared task scope in `scopeFor`'s shape, so it needs
no new credential machinery.

**READS:** the project · the net bias (project + instance) · **all** the project's
inquiries including the subject · all claims with their states distinguishable
(`suggested` / `considering` / `accepted` / `rejected`) · the **current evidence
standard**.

**WRITES:** one endpoint, suggesting changes to the subject inquiry. Everything it writes
is a suggestion. Nothing else.

## 4 · The fence is the endpoint

The session's only write is an endpoint whose sole possible output is a suggestion, so
**the op is the fence** — DEC-55 as ruled. Act refusals stay binary and stay adequate; what
was missing was an act whose only possible product is a proposal. No new primitive. Every
state transition in §9 is a member act the session cannot reach.

---

## 5 · How a claim is supported, and how support is defeated

**This is the core of the architecture and it is what the first draft got wrong.**

A **claim** is a proposition offered as an answer to an inquiry's question. It is not true
or false in isolation — *"what's the question asked in the inquiry?"* (Bob, 2026-08-05) is
prior to everything below, which is why §6 makes the question itself something the session
can act on.

Support is **defeasible**: a leg supports a claim *unless something defeats the link*.
That gives three distinct objects, not one relationship on a scale:

| object | what it attacks | what happens to the thing attacked |
| --- | --- | --- |
| **SUPPORT** | — | a leg supports a claim; grades and grounds as DEC-32/REC-42 already define |
| **UNDERCUT** | the INFERENCE from a leg to a claim | the leg **stays true** and the link goes dead. It contributes nothing |
| **REBUTTAL** | the CLAIM | the claim keeps its support AND acquires opposing support |

**Bob's contract case is an undercut, and reading it correctly is what produced this
section.** Two facts: the award skipped competitive bidding; an emergency exemption was
declared. They do not contradict. The exemption leaves *no competitive bidding was used*
entirely true — under the question *"was the award arrived at using a competitive bidding
process?"* that fact is the whole answer and the exemption is irrelevant to it. What the
exemption defeats is the **inference** from *no competitive bidding* to *the process did
not conform* — which is only in play under the other question.

Three consequences that decide the build:

1. **Defeat is not negative strength and is never subtracted.** An undercut link
   contributes zero however strong its leg is; a rebuttal creates opposing support and
   zeroes nothing. Nothing is netted off against anything. **This is what keeps R2's rule
   intact** — the pressure to express "how much these disagree" as one number disappears,
   because defeat is structural rather than quantitative.
2. **Defeat is a MEMBER DETERMINATION that a link is not live** — a judgement, not a
   measurement. It is exactly the kind of act the doctrine reserves, and it needs no scale.
3. **Where the continuum lives.** Bob, 2026-08-05: confirmation and contradiction are two
   ends of a continuum. It lives in the **configuration** — what a claim's support,
   undercuts and rebuttals jointly are — and in the strength pair on each leg. It is
   READ OFF the structure and never STORED as a position on a line. A stored position is
   the collapse R2 forbids.

**Defeaters are themselves defeasible.** An undercut can be undercut or rebutted in turn;
the emergency declaration can be shown to have been improperly issued. Depth is bounded by
evidence, not by the schema.

**Why this matters for accepted work (§10).** New evidence that *weakens* an accepted claim
does not modify it — it arrives as a suggested undercut or rebuttal. That is the mechanism
behind Bob's rule that accepted claims are never deleted or changed while their
supportability can still move.

## 6 · The inquiry's QUESTION is a first-class object the session can act on

Bob, 2026-08-05, on the same contract: *"Did the process used in the award of the X
contract conform to the contracting process the city is required to follow?"* versus *"Was
the award of the X contract arrived at using a competitive bidding process?"* — *"Though
related questions, the evidence needed to answer each is very different, and answers very
different questions. A properly skilled AI can make those critical distinctions that might
be impossible mechanically."*

So the question an inquiry poses can be **imprecise, or two questions wearing one
sentence**, and that is upstream of every claim under it. Getting it wrong wastes the whole
run and produces claims that look like they conflict when they are answering different
things.

**Therefore the session's highest-leverage output is often not a claim.** It is: *this
inquiry is asking two questions that need different evidence; here they are separated.*
This is a suggestion like any other (§7) and the member accepts, edits or rejects it.

This is a capability a mechanism cannot supply and it is the clearest case in the design
for why the session is a skilled AI rather than a query.

## 7 · What a SUGGESTION is — the taxonomy the endpoint carries

Every kind below is written in state `suggested`, carries its run (§8), and is accepted,
edited or rejected by a member. This list is the endpoint's shape.

| kind | what it proposes |
| --- | --- |
| **sharpen the question** | the inquiry asks two questions; separate them (§6) |
| **add a claim** | a proposition answering the question, with its support |
| **add a leg** | support for an existing claim, suggested or accepted |
| **add an undercut** | this leg does not license this claim, *and here is why* — the leg stands |
| **add a rebuttal** | evidence supporting the contrary of a claim |
| **note a defeater's defeater** | an existing undercut or rebuttal is itself defeated |
| **flag for a new edition** | evidence bearing on a PUBLISHED finding; a published case cannot be changed (§10), so the only act available is a new edition, and it is the member's |

Two things a suggestion is not: it is never an edit to an accepted object, and it never
carries a strength that counts (§9).

## 8 · The RUN is an object

A run is not a batch of writes with no identity. It has one, and every suggestion names it.
That buys three things at essentially no cost:

- **The conditions it was formed under** travel with it — the net bias, the evidence
  standard in force, and the claim set as it stood. Bob: *"everything can change at the drop
  of a hat (bias, standard, claims)"*, so a suggestion is only interpretable against them,
  and a member opening a month-old suggestion can see it was formed under a different bar.
  Same shape DEC-54 uses for a pinned policy. (Proposed; D-215.)
- **The observation log** — where it searched across the four levels, where it stopped and
  why. Search completeness is trained into the skill, which is COMPETENCE; the log is what
  lets anyone else CHECK. D-196's missing half.
- **The instruments in §13** all read per-run and are otherwise not computable.

## 9 · The states, and the strength that rests on them

**`suggested` · `considering` · `accepted` · `rejected`** — Bob, 2026-08-05, with three
properties that are the whole of D-214's answer:

- **`rejected` is BOTH an act AND a state of a suggested leg.** The leg stays a suggestion;
  `rejected` is a state it is in, not a deletion and not a separate object, so it remains
  readable with its basis intact. The rejection ACT is recorded in its own right, which is
  what makes a pattern over rejections queryable — and that pattern is where §1's third
  argument lives.
- **`considering` and `rejected` are both REVERSIBLE.** A rejected leg that new evidence
  revives is un-rejected. Nothing is terminal, so nothing is lost by rejecting early.
- **The states are NOT a one-way ladder.** IS-1 authors the transition table rather than
  assuming it, and a reversal is itself a recorded member act — an un-rejection is evidence
  about a member's attention exactly as the rejection was.

**`considering` is what makes the human gate observable.** A member who moved a suggestion
into consideration and did not accept it has demonstrably weighed it — *reviewed and
declined* distinguished from *never looked*, recorded rather than inferred, and not a
checkbox (DEC-46's rule).

**Strength:**

- **Effective strength is computed on ACCEPTED support only**, with undercuts and rebuttals
  that are themselves accepted taken into account per §5. This is what a finding rests on.
- The strength function **takes an argument naming which states to factor in**, defaulting
  to `accepted`. Safe by default.
- **The return carries the state set that produced it**, in the same object — a number
  travels, and a strength separated from its filter is the misread DEC-40's rule exists to
  prevent.
- A what-if value is member-facing exploration and **never a record value**. Its
  presentation is UI (Bob parked it: colour, transparency or a modifier key).

## 10 · The loop, and work already accepted

Find evidence → adjust claims and legs → search again.

New evidence may bear on claims and legs **already accepted** (Bob). Accepted objects are
never deleted or changed by a run; what arrives is a suggested leg, undercut or rebuttal
(§5), and that may change whether a finding is supportable at the standard. **The mechanism
already exists: this is REGRADE**, which DEC-46 named a member capability on M4 with the
import path recorded as *one caller rather than its home*. This is its second caller.

**Published cases (Bob's correction).** A published case is out in the wild and cannot be
affected. Only a different published case can be — a new edition, or a different published
project. The edition mechanism already handles this, because a completeness statement is
scoped to ITS edition. The only thing a run produces here is the §7 flag.

## 11 · Bias — a requirement ON THE SKILL

**Bob, 2026-08-05: the AI skill's requirements include MINIMISING these effects.** The
session is given the net bias, and the answer is to constrain the skill at the source rather
than to bolt a report onto the output. Recorded as a skill requirement, not a mechanism.

What still stands from the doctrine side: DEC-46's rule that a lens may be PRESERVED and
may not be APPLIED is the standard the skill is written against.

## 12 · What is NOT settled

1. **Leads for other inquiries have no home.** The session reads all of a project's
   inquiries and writes only to the subject one, so evidence bearing on inquiry B is
   dropped by construction — D-194's authored frontier with a producer generating them at
   volume. → **D-213**
2. **Whether a suggestion carries the conditions it was formed under** (§8, first bullet).
   → **D-215**
3. **What remains of the claim-relationship question after §5.** Defeat covers the case
   that motivated it and needs no scale. What is not yet settled is whether two members
   reading the same sharp question and the same evidence can disagree in a way the record
   should hold — and if so, in what reduced form. → **D-212, rewritten**

## 13 · Instruments — measure from the first run

- **Does a run ever come back with nothing supportable?** If it never returns empty it is
  manufacturing. The cheapest single signal that any of this works.
- **Accepted-to-suggested ratio over time.** If suggestions outrun review, an inquiry is
  accumulating structure nobody authored — every piece correctly labelled, the whole
  unexamined.
- **The rejection record read as a pattern** (§9), which is the §1 safeguard's evidence.
- **Undercuts proposed per run.** A session that only ever adds support is not doing §2's
  job, and this is the sharpest available test of it.
- **Where the run stopped and why** — the observation log (§8).

## 14 · Positions taken in this session and WITHDRAWN

Kept legible on DEC-55's precedent.

| withdrawn | why it fell |
| --- | --- |
| *If the AI proposes claim, evidence, reasoning and falsifiers, nothing is left for the member to author that is expensive to fake.* | Collapses **suggesting / authoring / committing** (Bob). Critique is authorship. |
| *A proposed leg may not rest on an unaccepted claim.* | A prohibition on STRUCTURE where the concern was arithmetic. Hiding a basis makes review shallower, and BIO **labels and discloses** rather than prohibiting and hiding. |
| *A session that knows the bar can optimise toward clearing it.* | Only if the evidence supports it, which it cannot. |
| *The system should hold a state for a published finding with unreviewed evidence against it.* | A published case cannot be affected (§10). |
| *A new state-fence primitive is required.* | The endpoint is the fence (§4). |
| **The first draft's whole framing of claim relationships** — claims recorded as agreeing or disagreeing along a range, with the hazard being a collapsed number. | **Wrong at the root.** Bob's contract pair does not disagree: together they narrate what happened, and whether either is even relevant depends on the question the inquiry asks. The real structure is DEFEAT, and specifically the undercut — the leg stays true and the inference dies (§5). The scale that worried me is not needed at all, because defeat is structural rather than quantitative. |

**The pattern behind the first four, named so it is not repeated:** the same worry — *the AI
might produce something the evidence does not support* — was re-derived against each new
input in turn. It is excluded by the objective and the structural gates, not by vigilance.
**And the pattern behind the fifth, which is different and worse:** the session was doing
safety engineering where the question was epistemology, converting *what does this evidence
establish* into *what could go wrong and what detects it*. §5 exists because that stopped.

## 15 · Decomposition — a first cut

**NOT HANDED TO CONDUCT.** Bob, 2026-08-05: hold the handover until the investigative
session is more fully architected. The `BOB INBOX` says so and instructs CONDUCT not to
schedule any of it.

| piece | what it is | interface | depends on |
| --- | --- | --- | --- |
| **IS-1** | The **state machine**: the four states, every transition a member act, machine identity refused on all. Transitions are NOT one-way (§9), so the table is authored and reversals are recorded. NC: an `ai` credential refused BY NAME on each transition. | I3 | none |
| **IS-2** | **SUPPORT, UNDERCUT and REBUTTAL** as distinct objects (§5); defeaters themselves defeasible. The structural spine — IS-3's taxonomy and IS-6's arithmetic are both defined over it. | I3 | none |
| **IS-3** | The **suggest endpoint** — §7's taxonomy, sole possible output `suggested`, carrying its run. | I1 | IS-1, IS-2 |
| **IS-4** | The **`ai` credential's investigative scope**: reads across the project, writes only IS-3, declared in the record per D-199.2. | I1 | IS-3 |
| **IS-5** | The **run object and its observation log** (§8). D-196's missing half. | I3 | none |
| **IS-6** | **Strength with defeat**: undercut links contribute zero, rebuttals oppose, nothing is subtracted; the state-set argument and the state set on the return (§9). | I3 | IS-2 |
| **IS-7** | The **question-sharpening suggestion** (§6) — the inquiry's question as something a suggestion can act on. | I3 | IS-2, IS-3 |

**Sequencing:** IS-2 is the spine and is independent of IS-1 — both are runnable in the
first wave, and IS-5 is a third with no dependency at all. Everything else follows from
IS-2. Note this is the reverse of the first cut, which had a single spine and a blocked
tail; §5 turned the blocked piece into the foundation.

## 16 · Relationship to what is already ruled

- **DEC-55 / D-199** — the `ai` class. This is its second consumer and the first with a
  mutating op; the five determinations hold and IS-4 extends the scope vocabulary.
- **ASSISTANT-PILOT.md** — the pilot stays READ-ONLY; this is a sibling, not a widening.
- **DEC-52** (open) — sharpened, not answered: the question is now *may a machine perform
  these AS ACCEPTED*, since performing them as suggestions is what §4 licenses.
- **DEC-24** — the machine proposes, the member authors. This is its fullest expression.
- **DEC-32 / REC-42 / D-195** — grounds, OR-max and weakest-leg are unchanged; §5 adds
  defeat above them. D-195's independence check is the live question for §10's loop, since
  a run whose iterations find correlated evidence produces a claim set that looks broadly
  supported when it is one source refracted.
- **DEC-46** — regrade's home, and the lens-preserved-not-applied rule §11 is written
  against.
- **DEC-40 / R2** — the pair, not the scalar. §5's defeat-is-not-a-quantity is what keeps
  this design from re-opening it.
- **D-164 / DEC-23** — content is the unit the record points at. A leg, an undercut and a
  rebuttal all need to point at content, so this design is a consumer of that primitive.
