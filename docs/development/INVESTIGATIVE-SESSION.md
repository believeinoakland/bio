# The investigative session — proactive AI claim formulation

**Bob, 2026-08-05, session BOB.** Ruled as DEC-60. This document carries the reasoning;
the decision entry carries the verdict.

A member with an inquiry presses a button and a **skilled AI session** runs against that
inquiry: it reads the project, finds evidence, and formulates claims and legs — *without
prior human involvement in the formulation*. Everything it writes is a SUGGESTION. The
member evolves, discards or accepts.

This is a deliberate widening of the machine/member division. The division does not move;
what moves is the assumption that the division had to be enforced as *the machine may not
produce the object*. It is enforced instead as **the machine may not accept the object**.

---

## 1 · Why — three arguments, and the second is Bob's

**The coverage argument.** A member exploring an inquiry constructs the claims they
thought of. The claims they did not think of are never constructed, never tested and never
falsified — they are simply absent, and absence at the meaning level is indistinguishable
from nothing having been there. `CLAUDE.md` already rules that the searching which grows
the document set is the same process that identifies content and produces meaning — ONE
process at several altitudes. **Proactive claim suggestion is that process running at the
meaning altitude.** It is not a new capability class needing doctrinal permission; a
system that searches documents proactively and refuses to search the claim space is
inconsistent with itself.

**Members need it (Bob, 2026-08-05).** BIO's evidentiary rigor is already past what an
average user can produce unaided — that is the point of it, not a defect. But it means the
system demands a standard of construction most of its intended users cannot meet, and then
withholds the tool that would let them meet it. That is not a safeguard. **It is a barrier
that selects for users who already had the skill, and skill is not good faith.** The
realistic alternative to AI-formulated claims is not member-formulated claims; it is no
claims, or claims that cannot clear the system's own bar.

**It STRENGTHENS the bad-actor safeguards (Bob, 2026-08-05).** A bad actor cannot argue
past BIO's gates — grade tracks directness, undetermined is first-class, an equality that
costs nothing is not evidence, the publication fence sits on the provenance chain. To beat
those you would need evidence that does not exist. So the attack that works is not
argument: **it is not looking.** Motivated omission, which the system cannot see, because
it cannot see a search nobody ran (D-194, D-196).

A session that formulates claims from the evidence **regardless of what the member hoped
to find** is an adversary to motivated omission. "I did not think of it" stops being
available, and the record can show that a counter-claim was surfaced and what became of
it. That is the first instrument in the system capable of detecting the one attack the
current design is blind to — and it exists only once the AI is proactive.

## 2 · The objective, and it is not advocacy

**The session's objective is to formulate claims and legs SUPPORTED BY EVIDENCE. The goal
is not to support or disprove a position.** Bob, 2026-08-05, and it is the load-bearing
sentence in this design.

It is a positive objective, not a negative constraint, and that makes it testable: a run
that only ever produces claims pointing one way is failing its own objective, and that is
visible without knowing what the member wanted. An earlier framing in this session — *the
CHECK role must not be scoped by the member's objective* — was the same idea stated as a
prohibition, and prohibitions of that shape are unenforceable. Superseded by this.

**The session pursues the strongest SET of claims related to the inquiry, even where
claims and legs contradict one another** (Bob). It does not resolve what the evidence does
not resolve.

## 3 · What the session sees, and what it may write

Bob, 2026-08-05. Read broad, write narrow — and this is exactly D-199's declared task
scope in `scopeFor`'s shape, so it needs no new credential machinery.

**READS (the whole project):**

| input | why |
| --- | --- |
| the project itself | the action-plan phase must match the project's identified responsibilities |
| the **net bias** — project and instance combined | see §7; it is the one input with steering potential and the one with the best inverse use |
| **all** existing project inquiries, including the subject | evidence found for one inquiry bears on others; the session needs the neighbourhood |
| existing inquiry claims, **both suggested and accepted**, distinguishable by state | Bob: *"Both must see all existing work, including the distinction between accepted and merely suggested. That's the way we avoid suggestions building on suggestions."* `considering` is visible to the session as distinct from `suggested` |
| the **current evidence standard** | the bar in force informs how far the session must go |

**WRITES:** one endpoint, used to suggest changes to the subject inquiry. **All writes are
suggestions.** Nothing else.

## 4 · The fence is the endpoint, and no new primitive is needed

An earlier proposal in this session was a new **state-fence primitive** — the machine may
write but may not transition — on the grounds that the existing `MACHINE_CANNOT_*` act
refusals are binary and cannot express "may produce, may not accept". **That primitive is
not needed and was withdrawn.**

If the session's only write is an endpoint whose sole possible output is a suggestion,
**the op is the fence.** That is DEC-55 working exactly as ruled — the endpoint surface IS
the fence. Act refusals stay binary and stay adequate; what was missing was simply an act
whose only possible product is a proposal.

Consequence: every state transition below is a member act, and the session can reach none
of them.

## 5 · The states, and the strength that rests on them

**States: `suggested` → `considering` → `accepted`, plus `rejected`** (Bob, 2026-08-05;
`rejected` recorded as the likely fourth and not yet final — see §9).

**`considering` is the piece that makes the human gate observable.** The gate Bob names is
evidentiary rigor matching the standard, rational reasoning including falsifying
conditions, and explicit acceptance. The first two are properties of a member's thinking
and no system can witness them — **which is equally true of a member's own unaided claims,
so this is not a standard the AI is being held to and the member is not.** What the member
brings is not witnessed reasoning; it is ACCOUNTABILITY, and the record names the principal
(D-199.4). That survives AI formulation intact, because the principal is whoever accepts.

But `considering` adds something real: it is **a member act with its own trace**. A member
who moved a suggestion into consideration and did not accept it has demonstrably weighed
it. That is the difference between *reviewed and declined* and *never looked*, recorded
rather than inferred — and it is not a checkbox, which is what DEC-46 refused for the bias
acknowledgement.

**Strength (Bob, 2026-08-05):**

- **Effective strength is computed on ACCEPTED legs only.** This is what a finding rests
  on and what the record claims. It is never computed over anything else.
- The strength function **takes an argument naming which states to factor in**, defaulting
  to `accepted` alone. Safe by default: a caller that does not ask for more gets the
  honest number.
- A member may see the value with suggestions and other combinations factored in. **How
  that is presented is a UI matter** (Bob explicitly parked it: differing colour,
  transparency or a modifier key, decided later).
- **The returned value carries the state set that produced it, in the same object.** Not
  for display — because the number travels. Once a what-if value exists it can be quoted,
  exported, or rendered by something that did not compute it, and a strength separated
  from its filter is the misread DEC-40's filtered-rendering rule exists to prevent.
- **A what-if value is a member-facing exploration value and never a record value.**

## 6 · The loop, and what it does to work already accepted

The session iterates: find related evidence → adjust claims and legs in light of what was
found → search again.

**New evidence may bear on claims and legs the member has already ACCEPTED** (Bob).
Accepted claims and legs are never deleted or changed by a run. New legs may be added that
strengthen or weaken, and that may change whether a finding is supportable at the
applicable standard. Every such change is a suggestion; acceptance or denial is recorded.

**The mechanism already exists: this is REGRADE.** DEC-46 named regrade a member
capability on M4 and explicitly recorded the import path as *one caller rather than its
home*. The investigative session is its second caller.

**On published cases — corrected by Bob, 2026-08-05.** An earlier proposal here was that
the system hold a state for "a published finding has unreviewed evidence bearing on it".
That is wrong, and the model behind it was wrong: **a published case is out in the wild and
cannot be affected.** The only thing that can be affected is a different published case —
a new edition of the previous one, or a different published project. The edition mechanism
already handles this correctly, because a completeness statement is scoped to ITS edition,
so later evidence does not make a published edition dishonest. What survives is small and
is a member decision like any other: a run may surface **"this may warrant a new
edition"** as one of its suggestions.

## 7 · The net bias — used against itself

The net bias (project + instance) is the one input with real steering potential, and it
has an inverse use that is better than withholding it.

Reasoning **with** the bias applies the lens silently — the thing DEC-46 forbade for
import, where a travelling manifest may PRESERVE a lens and may not APPLY it. Reasoning
**about** the bias lets the session state its own congeniality: *this claim aligns with the
declared lens; here is what I looked for that would have cut against it, and what I
found.*

Same input, opposite effect, and it is the piece that makes this a bad-actor safeguard
rather than a laundering path — a run that can name when it is agreeing with the house is
doing something no member reviewing alone can do for themselves. **Proposed in this
session and not yet ruled** (§9).

## 8 · Where the record is honest about volatility

Bob, 2026-08-05: *"everything can change at the drop of a hat (bias, standard, claims)."*
Each of the session's context inputs is volatile, and a suggestion formed under them is
only interpretable against them. Rather than three provenance concerns this is one object
— **the run's declared context, carried by every suggestion it produces**: the net bias it
reasoned about, the evidence standard in force, and the claim set as it stood.

A member reviewing a month-old suggestion can then see it was formed under a different
bar, or before three claims were accepted, or under a lens the project has since revised.
Without it, a stale suggestion is indistinguishable from a current one. Same shape DEC-54
already uses for a pinned policy (source, date, hash; cases name the version). **Proposed
in this session and not yet ruled** (§9).

## 9 · What is NOT settled

1. **The bearing relation between claims.** Bob, 2026-08-05: *"Confirmation and
   contradiction are 2 ends of a continuum… conclusions (findings) aren't uni-directional
   either. I would even argue that there is no direction at all. There's just evidence and
   rich analysis that supports some elements in some regards and runs counter in others."*
   And: the relationship between claims must be capturable and expressible in all its
   richness and subtlety. **The representation is open.** The shape that fits is D-164's —
   an edge that points at a PART — since a claim-level flag flattens exactly the subtlety
   being protected. Whether a DEGREE can be expressed without re-introducing a collapsing
   scalar is unresolved and is the R2 trap DEC-40 and the strength-bar pair both hit.
   → **D-212**
2. **Leads for other inquiries have no home.** The session reads all project inquiries and
   writes only to the subject one, so evidence it finds bearing on inquiry B must be
   dropped. That is D-194's authored frontier with a producer generating them at volume.
   → **D-213**
3. **Whether `rejected` is a state or an act attached to a suggestion.** Changes what a
   later run reads. The rejection record is where the anti-omission safeguard lives.
   → **D-214**
4. **§7 (congeniality self-report) and §8 (declared context)** — proposed here, not ruled.
   → **D-215**

## 10 · Instruments — measure from the first run

Named here because a design whose failure is invisible has no failure. None needs new
machinery.

- **Does a run ever come back with nothing supportable?** If it never returns empty, it is
  manufacturing. The cheapest single signal that any of this is working.
- **Accepted-to-suggested ratio over time.** If suggestions outrun review, the inquiry is
  accumulating structure nobody authored — every piece correctly labelled, and the whole
  unexamined. DEC-53 already noted that "accepts without reading" is unmeasured.
- **The rejection record**, read as a pattern. A member who rejects every proposal running
  against their thesis is visible in a way nothing in the system can currently see.
- **Where the run stopped and why** — the observation log (D-196). Search completeness is
  trained into the skill (Bob), which addresses COMPETENCE; the log is what lets anyone
  else CHECK. Different artifacts, and only one of them is a skill concern.

## 11 · Positions taken in this session and WITHDRAWN, kept visible

Recorded because this project keeps withdrawn recommendations legible (DEC-55's precedent),
and because each was wrong for a reason worth not repeating.

| withdrawn | why it fell |
| --- | --- |
| *If the AI proposes claim, evidence, reasoning and falsifiers, nothing is left for the member to author that is expensive to fake.* | Collapses **suggesting / authoring / committing** (Bob). Critique is authorship: a member who deletes two falsifiers, rewrites a third and says why the claim survives has authored something expensive to fake, and none of it is origination. |
| *A proposed leg may not rest on an unaccepted claim.* | A prohibition on STRUCTURE where the concern was ARITHMETIC. Hiding the basis makes review shallower, and it violates the house method — BIO **labels and discloses**, it does not prohibit and hide. Bob: it is important that the user and the AI see the basis of a suggested claim. What survives is the DEC-53 idiom: a suggested claim shows its full basis and its strength is stated conditionally on what beneath it is unaccepted. |
| *A session that knows the bar can optimise toward clearing it.* | Only if the evidence supports it, which it cannot. The objective (§2) is not bar-shaped, and the evidence gate is structural. |
| *The system should hold a state for a published finding with unreviewed evidence against it.* | A published case cannot be affected (§6). |
| *A new state-fence primitive is required.* | The endpoint is the fence (§4). |

**The pattern behind four of the five, named so it is not repeated:** the same worry —
*the AI might produce something the evidence does not support* — was re-derived against
each new input in turn (bias, bar, suggestions-as-input). It is excluded by construction
via the objective and the structural gates, not by vigilance, and re-raising it per input
is one error repeated, not four findings.

## 12 · Decomposition — the independent pieces

Handed to CONDUCT via the `BOB INBOX`. Interfaces per `INTERFACES.md`; CONDUCT is the gate
on independence and ordering.

| piece | what it is | interface | depends on |
| --- | --- | --- | --- |
| **IS-1** | The claim/leg **state machine**: `suggested` / `considering` / `accepted` / `rejected`, every transition a member act, machine identity refused on all of them. Negative control: an `ai`-class credential is refused BY NAME on each transition. | I3 (store) | D-214 settled |
| **IS-2** | The **strength function's state argument**, defaulting to `accepted`; the return carries the state set that produced it. Effective strength unchanged for every existing caller. | I3 | IS-1 |
| **IS-3** | The **suggest endpoint** — the session's single write, whose only possible output is a `suggested` object. Carries the run's declared context if D-215 lands. | I1 (plane ops) | IS-1 |
| **IS-4** | The **`ai` credential's investigative scope**: reads across the project, writes only IS-3, declared in the record per D-199.2. Extends D-199 rather than replacing it. | I1 | IS-3 |
| **IS-5** | The **observation log** for a run — where it searched, where it stopped, why. D-196's missing half. | I3 | none |
| **IS-6** | The **instruments** of §10 as assertions, not dashboards: empty-run reachable, accepted/suggested ratio computable, rejection pattern queryable. | I3 | IS-1, IS-5 |
| **IS-7** | The **bearing relation** between claims. **NOT RUNNABLE** — blocked on D-212. | I3 | D-212 settled |

**Sequencing note:** IS-1 is the spine and everything except IS-5 waits on it. IS-5 is
independent today and is the piece that makes any of the rest measurable, so it is the
natural first slot alongside IS-1. IS-7 must not be started before D-212 is settled — a
representation chosen under deadline is exactly how a collapsing scalar gets shipped.

## 13 · Relationship to what is already ruled

- **DEC-55 / D-199** — the `ai` credential class and its declared task scope. This design
  is its second consumer and the first with a mutating op. D-199's five points hold
  unchanged; IS-4 extends the scope vocabulary rather than revising it.
- **ASSISTANT-PILOT.md** — the assistant pilot remains READ-ONLY and its exclusions stand.
  The investigative session is a SIBLING with its own scope, not a widening of the pilot.
  Do not infer from the pilot that the `ai` class is read-only as a class.
- **DEC-52** (open) — whether a machine credential may declare a relation, resolve a
  reference or thread a progression. This design does not answer it, and it sharpens the
  frame: the question is now clearly *may a machine perform these AS ACCEPTED*, since
  performing them as suggestions is what §4 already licenses.
- **DEC-24** — the machine proposes, the member authors. Unchanged, and this is the fullest
  expression of it the system has had.
- **DEC-32 / D-195** — the OR-max independence check. The run is itself a searcher: if
  successive iterations find evidence correlated with what they already found, the claim
  set looks broadly supported when it is one source refracted. One mechanism serves both.
- **DEC-46** — regrade's home, and the lens-preserved-not-applied rule §7 builds on.
- **DEC-40** — the filtered rendering states its filter; §5's return-carries-its-state-set
  is that rule applied to a value rather than a screen.
