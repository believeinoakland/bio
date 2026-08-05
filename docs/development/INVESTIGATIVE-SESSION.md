# The investigative session — proactive AI claim formulation

**Bob, 2026-08-05, session BOB.** Ruled as DEC-60. This document carries the reasoning;
the decision entry carries the verdict.

**Rewritten twice on 2026-08-05.** The second rewrite is the one that matters: an attempt
to give the record a structure for how claims relate to each other was refuted by Bob and
replaced by VERSIONS (§5, §6). §16 records what was withdrawn and why, because both wrong
turns were instructive.

A member with an inquiry presses a button and a **skilled AI session** runs against that
inquiry: it reads the project, finds evidence, and works out how the legs of each claim come
together. Everything it produces is a SUGGESTION. The member explores, edits, accepts or
rejects.

The machine/member division does not move. What moves is the assumption that it had to be
enforced as *the machine may not produce the object*. It is enforced as **the machine may
not accept the object**.

---

## 1 · Why — settled, kept short

- **Coverage.** A member constructs the claims they thought of; the ones they did not are
  simply absent, and absence at the meaning level is indistinguishable from nothing having
  been there. The searching that grows the document set is the same process that produces
  meaning — one process at several altitudes. This is that process at the top of it.
- **Members need it (Bob).** The rigor is already past what an average user produces
  unaided. Withholding the tool is not a safeguard; it is **a barrier that selects for
  users who already had the skill, and skill is not good faith.**
- **It strengthens the defences against bad actors (Bob).** A bad actor cannot beat
  structural gates, so the attack that works is NOT LOOKING — and the system cannot see a
  search nobody ran. A session that works from the evidence regardless of what the member
  hoped to find is the first instrument that can see that.

## 2 · The objective

**Formulate claims and legs SUPPORTED BY EVIDENCE. The goal is not to support or disprove
a position.** Bob, 2026-08-05. Positive and therefore testable: a run whose claims only ever
point one way is failing its own objective, visibly, without anyone knowing what the member
wanted. The session pursues the strongest set of claims for the inquiry and **does not
resolve what the evidence does not resolve.**

## 3 · What the session sees, and what it may write

Read broad, write narrow.

**READS:** the project · the net bias (project and instance combined) · **all** the
project's inquiries including the subject · all claims and all versions with their states ·
the **current evidence standard**.

**WRITES:** one endpoint, adding a new VERSION to a claim under the subject inquiry.
Everything it writes is a suggestion. Nothing else.

## 4 · The fence is the endpoint

The session's only write is an endpoint whose sole possible output is a suggested version,
so **the op is the fence**. Act refusals stay binary and stay adequate; what was missing was
an act whose only possible product is a proposal. No new primitive is needed. Every state
change in §6 is a member act the session cannot reach.

---

## 5 · How the legs of a claim come together — and why this is not a schema problem

**Bob, 2026-08-05, correcting an attempt to type the relationships:** *"There may be
evidence, even a single sentence of evidence, that supports and undercuts and rebuts a claim
- all in the same sentence."*

That is the whole of it. One sentence — *the emergency was declared two weeks after the
contract was signed* — can at once confirm that a declaration exists, destroy the reasoning
that made it excuse anything, and argue positively that the process was improper. Those are
not three kinds of object to store. They are three things one piece of evidence is doing at
the same time, against different claims.

**So the composition cannot be computed from typed relationships, and the record should not
try.** Bob: *"the only way to make sense of how the various legs of a claim come together is
for an AI to be involved, for it to understand the facts in context and adjust the legs so
that they properly tell the story and assign strength values that when calculated are
supported by the evidence."*

The consequence for the build, and it makes the system SMALLER rather than larger:

> **The calculation stays as simple as it already is. The intelligence goes into how the legs
> are formed and weighted, not into a richer set of relationships for the record to compute
> over.** The AI's job is to shape a set of legs and set their strengths so that when the
> existing calculation runs, the result is one the evidence actually supports.

What the record holds is therefore: the legs, their strengths, and **a written account of
why these legs, weighted this way, tell this story**. Not a taxonomy.

## 6 · VERSIONS — the mechanism

**Bob, 2026-08-05.** A claim supports multiple **versions** of the set of legs beneath it. A
version is a complete alternative account of the claim's support, not a patch to another one.

This is what makes the whole design work, and the reason is §5: if a set of legs is a
composition that tells a story, then **the composition is the unit of meaning, so the
composition is the unit of change.** Versioning individual legs would recreate exactly the
problem — one leg altered in isolation may not make sense against the others.

It also resolves cleanly the thing that had no answer before: when new evidence means an
already-accepted leg should be weaker or narrower, nothing accepted is ever altered. A new
reading arrives as a whole alternative account and the accepted one stays exactly as it was.

**The rules:**

1. **Every version carries a textual description** of that set of legs. This is
   load-bearing, not a convenience — see §10, where it is what survives a conversation that
   is deliberately not kept.
2. **Every version has a unique NAME within its claim.** The AI names the versions it adds;
   a member may rename. (Uniqueness is per claim — global uniqueness would make naming
   absurd, and a member forced to invent a name for every small edit stops editing.)
3. **A version is frozen once written. Editing produces a new version** derived from it.
   Otherwise two members exploring the same version collide, and comparison stops meaning
   anything because the thing being compared shifts underneath.
4. **Each version has its own state: `suggested` · `considering` · `accepted` ·
   `rejected`.** As everywhere else in this design, `considering` and `rejected` are
   reversible, the states are not a one-way ladder, and every transition is a member act.
5. **Exactly one accepted version is CURRENT.** Current implies accepted.
   - **Accepted is a historical fact** — this version was accepted, on this date, by this
     member. A version that stops being current stays accepted, because it honestly was.
     That keeps the history with no extra state.
   - **Current is where the claim stands now**, and it is what the effective strength is
     computed over.
   - A version accepted in error is REJECTED, which is a different and rarer act than being
     superseded by a better account.
6. **Exploring an unaccepted version is done by CALCULATING OVER IT, never by making it
   current.** This closes a tension in the first sketch, which had an unaccepted version
   temporarily designated current: once current is shared with a team (§7), that would move
   everyone's ground so one member could examine a hunch. The mechanism already exists — the
   strength function takes an argument naming which states to include.
7. **A member may edit the version they are working from**, provided the changes match the
   evidence, or any leg that does not is **marked as a hunch**.
8. **A background run adds its output as a new version only if it differs from every
   existing version** (Bob).

## 7 · CURRENT belongs to the project's relationship with the inquiry

An inquiry can be shared across projects, and everyone working in a project works as a team.
So one team's decision must never silently move another team's stance — Bob's point, and it
is right.

**Verified in the plane before answering it:** linking a bundle to a project creates an
EDGE, so an inquiry genuinely can sit beneath several projects at once; and a project
already overrides settings in its own project file, including the required strength pair.
There is precedent for a project holding its own position over shared material.

**So Current is a property of the PROJECT'S relationship to the inquiry, not of the inquiry
itself.** The inquiry, its claims and all its versions stay shared and keep accumulating.
Each project points at the version it stands on. Team A moves to version 3; Team B stays on
version 1 until it decides otherwise; both keep receiving every new version and every new
piece of evidence.

The alternative considered and rejected was CLONING the inquiry on divergence (Bob's first
instinct). It was dropped because it duplicates the whole evidence trail and the two copies
immediately drift — new evidence found under one never reaches the other — so the shared
investigation stops being shared, which is the reason sharing exists. It is also triggered
by the wrong act: adding a version harms nobody, and only choosing which one is current
moves a stance.

**What survives from the cloning instinct is the NOTIFICATION, and it is required.** When a
member changes what their project stands on, they are told the inquiry is used by other
projects and that their change does not move those projects. When a new version arrives from
another team's work on the shared inquiry, that is surfaced too.

**Open verification:** if sharing turns out to mean something stronger in the data model than
the edge-based association found here — one stance that every referencing project must
share — then cloning is the only honest answer and this section is wrong. That check belongs
to whoever builds it. → **D-216**

## 8 · The inquiry's QUESTION is a first-class object

Bob's contract case: *"Did the process used in the award of the X contract conform to the
contracting process the city is required to follow?"* is a different question from *"Was the
award of the X contract arrived at using a competitive bidding process?"* — *"Though related
questions, the evidence needed to answer each is very different, and answers very different
questions. A properly skilled AI can make those critical distinctions that might be
impossible mechanically."*

An inquiry's question can be imprecise, or two questions wearing one sentence, and that is
upstream of every claim under it. So one of the session's highest-value outputs is often not
a claim at all: *this inquiry is asking two questions that need different evidence; here they
are separated.* This is a suggestion like any other and the member accepts, edits or rejects
it.

## 9 · What a SUGGESTION is

Everything below is written in state `suggested`, carries its run (§11), and is accepted,
edited or rejected by a member.

| kind | what it proposes |
| --- | --- |
| **a new version of a claim's legs** | the main output — a complete alternative account with its description (§6) |
| **sharpen the question** | the inquiry asks two questions; separate them (§8) |
| **a new claim** | a proposition answering the question, with its first version of legs |
| **flag for a new edition** | evidence bearing on a PUBLISHED finding. A published case cannot be changed, so the only act available is a new edition, and it is the member's |

## 10 · The two modes — one piece of work, two ways in

**Bob, 2026-08-05.** The investigative AI runs either way:

- **As a background job.** It runs unattended and leaves its output as new versions for
  later review.
- **As an interactive session**, offered once the analysis for that session is complete. The
  member walks the evidence trail, asks why a leg is weighted as it is, sees how the legs
  relate, and reaches conclusions the evidence supports. **The interactive session may ask
  any applicable question**, including ones that send it looking for more evidence.

These are not two analyses. They are two ways into **one completed piece of work**, which is
why the run has to be a durable, addressable object with its evidence trail intact (§11)
rather than just the suggestions it emitted.

**"Export" means the AI adds a new version to the claim being investigated** (Bob). So both
modes use ONE write path — nothing the interactive mode can do lies outside what the
background job could do, and the fence needs no second design.

**The conversation is NOT part of the permanent record** (Bob). The member's decisions are;
the discussion that produced them is not. **This is exactly why §6's requirement that every
version carry a written description is load-bearing:** the reasoning behind a version would
otherwise evaporate with the conversation. The description is the durable account.

**The skill under which the interactive session runs must enforce evidence-based
conclusions** (Bob).

## 11 · The RUN is an object

Every version names the run that produced it. That buys:

- **The conditions it was formed under** — the net bias, the evidence standard in force, and
  the claim set as it stood. Bob: *"everything can change at the drop of a hat (bias,
  standard, claims)"*, so a version is only interpretable against them. (Proposed; D-215.)
- **The observation log** — where it searched across the four levels, where it stopped and
  why. Search completeness is trained into the skill, which is COMPETENCE; the log is what
  lets anyone else CHECK.
- **The interactive mode's subject** (§10), which needs the evidence trail intact.
- **The instruments in §15**, which are otherwise not computable.

## 12 · Strength

- **Effective strength is computed over the CURRENT version's accepted legs.**
- The strength function **takes an argument naming which states to factor in**, defaulting
  to accepted. Safe by default, and it is also how §6.6's exploration works.
- **The return carries the state set that produced it**, in the same object — a number
  travels, and a strength separated from its filter is a misread waiting to happen.
- A what-if value is member-facing exploration and **never a record value**. Its
  presentation is UI (Bob parked it: colour, transparency, a modifier key).
- **A leg marked as a HUNCH** (§6.7) is visible as such and does not count as evidence.

## 13 · Published cases

A published case is out in the wild and cannot be affected. Only a different published case
can be — a new edition, or a different published project.

**The published bundle carries only the CURRENT version** (Bob): the leg configuration, so
it can be reproduced in BIO, and the text description, so a person can read it.

**It also carries the version's NAME and identity.** Current moves on afterwards and the
published case can never be changed, so without the name a later reader has no way to tell
which account was published. With it, the published case points at exactly the reading it
stood on.

## 14 · Bias — a requirement ON THE SKILL

**Bob, 2026-08-05: the skill's requirements include MINIMISING these effects.** Constrain the
skill at the source rather than bolting a report onto the output. The standard the skill is
written against is the existing rule that a lens may be preserved and may not be applied.

## 15 · Instruments — measure from the first run

- **Does a run ever come back with nothing supportable?** If it never returns empty it is
  manufacturing. The cheapest single signal that any of this works.
- **Accepted-to-suggested ratio over time.** If versions outrun review, a claim is
  accumulating accounts nobody has read — each correctly labelled, the whole unexamined.
- **The rejection record read as a pattern**, which is §1's third argument's evidence.
- **Where the run stopped and why** — the observation log.

## 16 · Positions taken and WITHDRAWN

| withdrawn | why it fell |
| --- | --- |
| *If the AI proposes claim, evidence, reasoning and falsifiers, nothing is left for the member to author that is expensive to fake.* | Collapses **suggesting / authoring / committing** (Bob). Critique is authorship. |
| *A proposed leg may not rest on an unaccepted claim.* | A prohibition on structure where the concern was arithmetic. Hiding a basis makes review shallower, and BIO **labels and discloses** rather than prohibiting and hiding. |
| *A session that knows the bar can optimise toward clearing it.* | Only if the evidence supports it, which it cannot. |
| *A state for a published finding with unreviewed evidence against it.* | A published case cannot be affected. |
| *A new state-fence primitive is required.* | The endpoint is the fence. |
| *Claims recorded as agreeing or disagreeing along a range.* | Bob's contract pair does not disagree — together they narrate, and relevance depends on the question asked. |
| *SUPPORT / UNDERCUT / REBUTTAL as three stored objects.* | **Reductionist** (Bob): one sentence can do all three at once against different claims. Roles are not types. Replaced by §5 — the AI shapes the legs and their strengths; the record holds no relationship taxonomy. |
| *Recording that a run reproduced an existing version, as corroboration.* | **Withdrawn by this session.** Two runs of the same skill over overlapping evidence are heavily correlated, so their agreement is weak evidence, and recording it as corroboration would dress up something that is not one. |

**The pattern behind the first five:** the same worry — *the AI might produce something the
evidence does not support* — re-derived against each new input. Excluded by the objective and
the structural gates, not by vigilance. **The pattern behind the next two, which is worse:**
the session was doing safety engineering where the question was epistemology, and then
schema design where the question was judgement. Both times the answer was that the
intelligence belongs in the AI's work, not in a structure the record computes over.

## 17 · What is NOT settled

1. **Leads for other inquiries have no home.** The session reads all of a project's
   inquiries and writes only to the subject one. → **D-213**
2. **Whether a version carries the conditions it was formed under** (§11). → **D-215**
3. **Whether sharing is stronger in the data model than the edge association found**, which
   would force cloning after all (§7). → **D-216**
4. **Review burden.** A claim with eleven unreviewed versions is the pile-up problem in a new
   shape. Deduplication helps; it is not an answer. → **D-217**
5. **Whether a reworded CLAIM is a new version or a new claim.** Kept out of §6 deliberately
   so versions do not nest. → **D-217**

## 18 · Decomposition — a first cut, NOT HANDED OVER

**Bob, 2026-08-05: hold the handover until the integration architecture is finished.** The
`BOB INBOX` says so and instructs CONDUCT not to schedule any of it.

| piece | what it is | depends on |
| --- | --- | --- |
| **IS-1** | **Versions**: a claim carries many; frozen once written; unique name per claim; a description required. The spine. | none |
| **IS-2** | The **state machine** over versions — four states, reversible, every transition a member act, machine identity refused on each. NC: an `ai` credential refused BY NAME on every transition. | IS-1 |
| **IS-3** | **CURRENT as a project-to-inquiry property** (§7), with the notification when other projects reference the inquiry. | IS-1, D-216 |
| **IS-4** | The **suggest endpoint** — §9's kinds, sole possible output a suggested version, carrying its run. One write path for both modes. | IS-1, IS-2 |
| **IS-5** | The **`ai` credential's investigative scope**: reads across the project, writes only IS-4. | IS-4 |
| **IS-6** | The **run object and its observation log** (§11). | none |
| **IS-7** | **Strength over the current version**, the state-set argument, the state set on the return, hunches excluded (§12). | IS-1 |
| **IS-8** | **Published bundle carries the current version** — leg configuration, description, and the version name (§13). | IS-1, IS-3 |

IS-1 is the spine; IS-6 is independent of everything and is what makes the instruments
computable.
