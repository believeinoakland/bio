# Case-making: the design pass

**A RECORD OF THE PASS.** Opened 2026-08-01 (session BOB) as the D-127 design pass Bob
directed: his framing as he gives it, and the observations and questions it raised.
Nothing here is settled unless it says so.

> **STATUS CORRECTED 2026-08-10 (session BOB). This header read "IN PROGRESS — do not
> build from this file yet", and that instruction is now false and misleading.** The
> collapse it works out — focus, finding and case as one recursive INQUIRY — **HAS
> SHIPPED**: `inquiry`, `conclude`, `citeinquiry`, `inquiryground` and `inquirystrength`
> all exist in the plane with their own suites. A reader taking the old line at face
> value would conclude the built system's central object was still speculative.
>
> **What is authoritative is no longer this file.** It is the plane, and the rulings the
> pass produced — DEC-15 through DEC-32 and the R1–R4 resolutions — which live in
> `docs/development/DECISIONS.md` and are indexed by `node tools/decided.mjs`. Read this
> for WHY the collapse happened and what it had to preserve; read the record for what is
> true today.
>
> Not edited otherwise: a pass is a record of what it concluded, and correcting its body
> in place would hide that the reasoning arrived in this order.

## The frame, in Bob's words

**The purpose.** CivicOS is about telling a story — equivalently, making a case. The
substrate collects the record, extracts meaning rigorously, understands the
legal/regulatory/policy framework, makes connections, and figures out how
{information, money, responsibility, relationships, decisions, power} is SUPPOSED to
flow, how it ACTUALLY flows, and where the system works and where it does not. A
meta-level above all of that: **answer questions, make a case, tell a story, and take
action to affect this living civic system.** Nothing about how CivicOS works is more
important than supporting users along that path.

**The path.** Questioning → exploring → discovering (understanding) → documenting →
impacting. *And* sharing the products of that process with the outside world.

**The member-facing constructs today**, which Bob is explicitly open to changing,
evolving, or replacing: **focuses, projects, actions, and case files.**

**The audiences, and what "sharing" means to each** — the point being that one
substrate serves genuinely different outputs:

| audience | what they are doing |
| --- | --- |
| media | **reporting** |
| activists | **fixing** — and supporting when they can |
| government administrators | **understanding, tracking, adjusting, responding** to the communities they serve |
| lawyers | **supporting a claim, or changing a claim** |
| …and so on | the list is open |

## Observations, offered as input to the pass

> **"Output" is a noun and also a verb** (Bob, 2026-08-01). Worth holding onto through
> this pass: the artifact and the ACT of releasing it are different things, and the
> plane already models the act — ratification is outputting, and it is the boundary
> where a claim stops being ours and starts being answerable. A design that names only
> the noun will end up with a case file nobody had to decide to publish.

### 1. The constructs conflate the WORK with the OUTPUT, and the substrate already has the fence

`focus` / `project` / `action` describe WORK. A case file, as UI-PLAN U12 describes it,
is an OUTPUT: a narrative with interactive story visuals, print as first-class, read
start to finish by a member of the public.

The plane already draws that line and the constructs have not caught up to it: the
**two-bucket fence** separates the working corpus from the published, and
**ratification** is the boundary act — a signed, irreversible statement that this is
what we stand behind. So there is an existing, load-bearing distinction between *what
we are working on* and *what we assert*, and the member-facing vocabulary does not
express it.

A candidate shape, not a decision: a **project** is the investigation, private and
allowed to contain dead ends; a **case** is what leaves, carrying only what it can
stand behind. The dead ends stay in the project, which matters — D-81 already argues
that a recorded dead end is what makes the next member's work cheaper.

### 2. `action` IS the impact substrate, and it exists

A previous session's claim that "impacting has no substrate" was WRONG and is corrected
here. The `action` object type has been in the check catalogue throughout:

- states `planned → active → awaiting_response → resolved | abandoned`
- headings `## Plan`, `## Status`, `## Correspondence`, `## Session Log`, `## Review Notes`
- fields `action_kind`, `risk_tier`, `counterparty`

`awaiting_response`, `## Correspondence` and `counterparty` are unmistakably
**outward-facing**: a records request, a letter to a council member, a complaint, a
demand. That is impact modelled at the object level.

What is missing is not the object but its CONNECTIONS: nothing links an action to the
findings that justified it, to the case it advances, or to the outcome it produced. So
the record can hold "we wrote to the city" and cannot say "because of these three
findings, and here is what came back, and here is what that changed." **The loop from
evidence to action to consequence is the thing that is unbuilt** — and the consequence
half is itself new evidence about how the system responds, which is exactly D-128's
declared-versus-actual flow measured on our own intervention.

### 3. Audience difference is probably RENDERING, and the sharp version is claim strength

The tempting read is four case types. The better read is one case with audience-shaped
renderings, because the underlying structure — what we assert, what it rests on, what
would falsify it — does not change with the reader.

But the sharp form of the difference is not format, it is **the strength a claim must
reach before that audience can use it.** A journalist can publish "records suggest"; a
lawyer needs "the record establishes"; an administrator may act on "worth checking."
So:

- a case carries CLAIMS, each with the evidence it rests on and a derived strength;
- a rendering SELECTS what clears the threshold that audience needs, and says what it
  excluded and why.

That connects directly to work already designed: D-72's connection grades (A–D) are the
input nothing consumes, and a case's strength being **the weakest link along its chain**
is the natural composition rule. It also gives invariant 7 a mechanism rather than an
exhortation: a finding that cuts against the case has the same strength computation as
one that supports it, so it cannot be quietly excluded by a rendering without the
exclusion being visible.

### 4. CORRECTED — the administrator is not an inverted threat model, and the threat is symmetric

This section originally read "the administrator archetype inverts the threat model" and
treated an adversarial default as the given. Bob corrected it on 2026-08-01 and the
correction is doctrine:

> "Whatever happens in the world, there is usually those who are supportive of that
> thing and those that aren't. The potential for threats exist for both ends of that
> continuum and everybody in between. Some people are willing to damage a publisher,
> but there are other times people who make claims that reach far beyond what the
> evidence can support… the goal of CivicOS is to improve outcomes using greater
> understanding, less narrative, and accountability… nowhere in the doctrine is anything
> like 'Stick it to the man!' It's about better government… If we start by assuming that
> at the highest level all stakeholders want better outcomes in the public interest,
> then we're all on the same side. — Even though, there are bad actors among us."

**So an administrator is not an inversion. They are a stakeholder like any other**, and
the question I raised as doctrine dissolves: there is one system serving people who want
better outcomes, and the archetypes differ in what they DO with a case rather than in
whose side they are on.

**The threat model is SYMMETRIC, and its more dangerous half is ours.** Someone may
damage a publisher; someone may also make claims far beyond what the evidence supports.
Reading this codebase against that: almost every hard-won rule defends against the
SECOND — `undetermined` is first-class and must be stated, an equality that costs
nothing to produce is not evidence, grade tracks directness and never technique, the
publication fence, the refusal to invent an authority to get past a gate. **The primary
threat model has always been self-directed; the doctrine just made it explicit.**

That reframes claim strength (observation 3) entirely. It is not a convenience for
lawyers. **It is the core defence against this project's own characteristic failure**,
and it is why a rendering must state what it excluded rather than silently omit it.

**Bad actors are real and are identified BY EVIDENCE, never assumed by role.** Corrupt
officials, power-hungry politicians, greedy organisations, people seeking financial
security beyond what the system can afford — all exist. None of that licenses a
structural prior. Concretely, and this binds the entity work in M4: **the subject
registry (D-83) must carry no adversarial attribute**, no suspicion flag, no
category-level prior. An entity is an entity; what is claimed about it is claimed with
evidence attached, or it is not claimed.

### 4a. "Less narrative" is a design constraint, and it cuts against how such tools usually work

Bob has said both *"CivicOS is about telling a story"* and *"less narrative"*, and they
are not in tension once the words are separated:

- a **story** is what the record supports, told so a person can follow it;
- a **narrative** is a frame imposed on the material, which the material then gets
  fitted to.

A case-making tool that makes it easy to build a COMPELLING story is dangerous, because
compellingness and support are different axes and the tool would be optimising the
wrong one. **The tool should make a supported case easy to build and an unsupported one
hard to state.** That is an inversion of how storytelling and case-building tools
normally work, and it should be visible in the surface: strength shown rather than
hidden, exclusions named rather than dropped, and nothing that drafts framing FOR a
member — the same rule as never prefilling a justification, extended from a field to a
whole argument.

### 5. A caution about designing for four audiences at once

Designing for four archetypes simultaneously is the reliable way to build something
that is nobody's. This project's own discipline points the other way: measure the case
you can actually observe — this group, Oakland — and design so that a second audience
costs a RENDERING rather than a rewrite.

That is the framework's §9 cost-table discipline applied to audiences instead of to
formats, and it has the same falsifiable test: when the second archetype arrives, does
it cost a rendering, or does it cost a new case model? If the latter, the decomposition
was wrong.

## Are focus / project / action / case the right constructs? — asked and answered

Bob asked directly, 2026-08-01. **Yes for what they cover; no for completeness**, and
the gap is in one identifiable place.

### The test

The constructs should cover the PATH with no verb unhomed. Mapping them:

| verb | construct | state |
| --- | --- | --- |
| questioning | **focus** — an open question or obstacle | built: `surfaced → elevated / deferred / dismissed` |
| exploring, discovering | **project** — the investigation, carrying an `objective` | built: `forming → investigating → matured → closed` |
| **documenting** | — | **NOTHING** |
| impacting | **action** — outward-facing | built: `planned → active → awaiting_response → resolved / abandoned`, with `counterparty` and `## Correspondence` |
| sharing / outputting | **case** | a UI concept only (`UI-PLAN` U12); not an object type |

Two of the five are unhomed, and the pattern is not random: **the middle of the path
and its end are missing** — precisely the part this design pass exists for.

### What is right, and why each earns its place

- **focus and project are correctly SEPARATE**, and the temptation to merge them should
  be resisted. A question can be tracked without committing an investigation to it,
  which is exactly what D-79's aggregation-and-ageing discipline needs for
  machine-surfaced findings: hundreds of open questions is survivable, hundreds of open
  investigations is not. `elevated_into` already models the promotion.
- **action is right and is UNDERUSED**, not wrong. Its shape is outward-facing and
  correct; what it lacks is connections (observation 2).
- **`information` is the fifth object and is absent from Bob's list of four.** Worth
  naming: it is the evidence unit, and the omission may be deliberate — it is substrate
  the member consumes rather than a construct they drive. But a member does create it,
  so whether it is a process construct is a real question rather than a formality.

### What is missing

**1. THE FINDING — a claim, what it rests on, and its strength. This is the big one.**
Documenting has no object. Today a finding is prose inside a project's `bundle.md`, or
it is implicit in a citation edge. It cannot be pointed at, cited, contradicted,
graded, or composed.

It cannot be folded into an existing type, and the reasons are not stylistic:

- **not a `focus`** — a focus is an open QUESTION, a finding is a provisional ANSWER.
  Opposite polarity, and merging them means the record cannot distinguish "we wonder"
  from "we found", which is the distinction the whole system exists to keep.
- **not `information`** — information is a captured DOCUMENT; a finding is a claim
  DERIVED from documents. Merging them lets a claim inherit a document's provenance
  without having a basis of its own, which is the overclaiming failure this project's
  entire discipline defends against.

**Everything the pass has proposed presupposes it.** Claim strength (observation 3) has
nothing to compute over without it; D-72's connection grades have no consumer;
invariant 7 has nothing to route equally; a case is prose rather than something
composable.

**2. THE CASE AS A RECORD OBJECT.** It is Bob's construct and the right one, and it
exists only as a UI notion. If a case is what LEAVES and what a group stands behind, it
needs states and a gate — because the boundary act already exists and currently
ratifies BUNDLES, not cases.

**3. THE FLOW MODEL** (D-128) — how the institution is supposed to work, declared and
refined over time. Not a focus (not a question), not a project (not an investigation),
not an action. It is a reference model many investigations read, and Bob named evolving
that understanding as a core capability.

### On adding constructs, having just argued for fewer

This is a different axis from the interaction-construct count and the test is different.
An INTERACTION construct earns its place if a member learns a shape once and reuses it.
A RECORD OBJECT TYPE earns its place if **the record must make a distinct kind of claim
about it**. A finding claims something documents do not claim; a case asserts something
a project does not assert. Those pass the test. Adding them does not reopen the
two-construct interaction decision, because all three are things the QUEUE and the ACT
already reach.

## Is a case anything other than a published finding? — Bob, 2026-08-01

The question nearly collapses the object, and it should be recorded that it nearly did.
Three of the four defences fail:

- **Composition fails.** "A case composes several findings" is not a distinction if a
  finding's basis may include other findings. Recursion handles it, and the root
  finding is then the case.
- **Narrative order fails.** A reading order is a property of the RENDERING, not of the
  object. Same answer as audience thresholds.
- **Audience threshold fails**, for the reason already given in observation 3: that is
  rendering.

**One survives, and it is enough: a case makes a COMPLETENESS CLAIM and a finding does
not.**

- A **finding** claims: *X is true, and here is what it rests on.*
- A **case** claims: *these things, taken together, support this conclusion — and this
  is the material set.*

That second assertion is a different kind of claim, and it is **the most dangerous one
this system can make.** A published finding that is true but selectively chosen is not
a lie at the finding level and IS a lie at the case level. Selection is precisely how
overclaiming happens in case-making, which makes this the case-making face of the
symmetric threat model Bob set out — the half that is ours.

### Why it cannot be a state on a finding

The tempting simplification is `finding.published = true`. It fails on reuse:

**A finding must NOT assert completeness, so that it can be reused across cases. A case
must, so that it can be trusted.** If findings carried a completeness burden they would
become case-specific and stop being reusable units; if cases did not carry it, nothing
would ever be accountable for what was left out. Two different claims, two objects, and
the difference is not publication state.

### What follows for the gate, and it parallels something already built

A system cannot VERIFY completeness — no gate can know what a group did not look at. It
can do what this record does everywhere else with what it cannot establish: make the
claim **visible, attributable and stated**.

So a case's gate is not *"are these findings true"* — that is each finding's own gate,
already inherited. It is **"has the author stated what was excluded, and why."**

That is the release flow's shape exactly (U5: typed acknowledgment and mitigation,
**never prefilled**), raised from a document to an argument. And it gives invariant 7 —
a finding that cuts against the goal is surfaced as prominently as one that supports it
— its enforcement point: the exclusion is an authored field on the case, so leaving
something out is an act with a name on it rather than an absence nobody can see.

### The remaining distinction, smaller but real

**A case is ADDRESSED and a finding is not.** A case is made TO someone FOR something —
reporting to the public, a claim to a court, a fix asked of a body. That is where
`action` connects: the ask is an action, and the case is what justifies it. A finding is
addressed to no one.

**Provisional conclusion of the pass:** case survives as an object, on the completeness
claim alone. If a later session finds a way to make completeness attributable without a
distinct object, the collapse is worth revisiting — but the burden is on that argument,
not on this one.

## THEY COLLAPSE. Focus, finding and case are one recursive object — Bob, 2026-08-01

Bob: *"Really, I'm wondering if focus, finding, and case are all the same thing. More to
the point, I need to see a reason why they're each different and must remain different.
If we can't then they should collapse."*

**I cannot produce a sufficient reason, and the previous two sections of this document
were structure looking for a justification.** Recorded in full, including what failed,
because the failures are the argument.

### Every defence reduces to a STATE or a FIELD, not a type

| defence offered | why it fails |
| --- | --- |
| a focus is a QUESTION, a finding is an ANSWER | that is "does this node have a conclusion yet" — a lifecycle state |
| a finding may not be empty; a focus may | a per-stage requirement, exactly as C-2.7 already makes `content_hash` an entry requirement for `verified` |
| a case asserts COMPLETENESS, a finding does not | a field, and an authored one. It survives the collapse intact — see below |
| a finding is REUSABLE, a case is BOUNDED | the same field, read the other way |
| composition — a case gathers findings | **Bob's point: if a finding may rest on earlier findings, recursion already does this and the root finding IS the case** |
| publication changes what the record owes the world | a stage with heavy semantics. The plane already models exactly this: ratification is irreversible and a published hash answers forever |

So the object is one thing with a recursive basis and a lifecycle:

    an INQUIRY — a question, which may gather evidence and other inquiries,
                 which may reach a conclusion,
                 which may be published as something the group stands behind

`focus` is that object early. `finding` is it once it concludes. `case` is it once it
is published and asserts its own material set. **A conclusion resting on conclusions is
free**, which is what the domain actually looks like: you ask, you gather, you conclude,
and your conclusion becomes an input to a larger question.

### What the collapse BUYS, which is not only tidiness

- **Recursion for nothing.** The layered-argument structure the pass needs stops being a
  feature and becomes the shape of the object.
- **One mental model**, and it matches how research feels. This is the audience rule
  paying out: a member learns *an inquiry* rather than three things and the rules for
  moving between them.
- **D-79 applies uniformly.** A machine-surfaced question and a machine-derived
  conclusion are the same type, so aggregation, ageing, and D-82's must-look-derived
  rule are written once.
- **Claim strength composes naturally** — weakest link along a basis chain, where the
  chain may include other inquiries.

### What must NOT be lost in the collapse

**The completeness assertion stays an explicit AUTHORED ACT at the publication stage.**
It must not become an implicit consequence of a state change. The reasoning from the
previous section survives unchanged and is now a stage requirement rather than a type:
publishing asserts *"this is the material set"*, no gate can verify it, so the record
does what it does with everything it cannot establish — makes it visible, attributable
and stated, with what was EXCLUDED named by its author and never prefilled.

If the collapse quietly turns that into a checkbox, the collapse has cost the one thing
the separate object was protecting.

### What does NOT collapse

- **`information`** — a captured document with provenance and custody. Evidence, not a
  claim about evidence. Merging it would let a claim inherit a document's provenance
  without a basis of its own.
- **`action`** — outward-facing engagement with a `counterparty` and correspondence. An
  inquiry is a thought; an action is a thing done to the world.
- **`project`** — and this one is worth stating because it looked collapsible too. Its
  states resemble the inquiry lifecycle, but its real content is **governance**: owners,
  participants, the three visibility positions (D-15), fork, name uniqueness. A project
  is a CONTAINER WITH MEMBERSHIP AND ACCESS CONTROL; an inquiry is a claim structure.
  Different axis, and merging them would put access control on every question.

**So the member-facing set becomes four: information · inquiry · action · project** —
evidence, claim, engagement, workspace. Down from five, and each answers a different
question: *what did we capture · what do we assert · what did we do · who is working on
this.*

### The god-object risk, WITHDRAWN as stated and narrowed to what is real

Bob: *"changing its name as it evolves doesn't make it god-like."* Correct, and the
risk as I wrote it was over-weighted. Phase naming is vocabulary, not structure, and a
long lifecycle is not itself a hazard — the check catalogue already carries forty-nine
per-state requirements, each with a number and a stated reason, and has not become a
thicket.

What remains, smaller and real: **every stage requirement must name the doctrine it
enforces.** That is the catalogue's existing discipline applied to a new type, not a
new burden. Without it a lifecycle accumulates rules nobody can justify — which is a
risk of any state machine, not of this one.

## Naming: three names for three phases, and the type name question

**RULED by Bob, 2026-08-01: `inquiry` early (NOT `focus`), `finding` once it concludes,
`case` once published.** Same object, different phases, different names.

**This session's determination on how that is expressed**, since a phase called
"inquiry" on a type called `inquiry` reads badly:

- the TYPE is `inquiry`;
- the STATE values are neutral and machine-facing — `open` → `concluded` → `published`,
  with the existing triage dispositions surviving as exits;
- **`inquiry` / `finding` / `case` are the MEMBER-FACING NAMES for those phases**, which
  is what Bob asked for and what a member reads everywhere.

That keeps the state vocabulary clean and gives the member the three words that
describe what they are looking at.

**The rename cost, stated honestly: this is the concept's SECOND rename.** `problem`
became `focus` in 0.35.0, and the append-only constraint means `problem` is still a
legal alias in existing history and no history row was rewritten. `focus` → `inquiry`
adds a third name for one thing. The precedent handles it exactly — canonical
vocabulary changes everywhere, prior names stay legal where they already exist,
projections normalise — and PLAN.md records the whole shape of that migration. It is
not free, and it is affordable, and it should not happen a third time.

## Division: one inquiry becomes two or more

**RULED by Bob: the lifecycle must include dividing into 2 or more.** Composition came
free with recursion; division does not, and working through it produces four things.

**1. The sub-question case is already free; the genuinely new case is SUPERSESSION.**
Two different things wear the word "split":

- *this question has parts* — B and C are inquiries the parent cites as basis. Recursion
  already does this; nothing new is needed.
- *this question was MALFORMED* — A was one question and is actually two. A does not
  continue. This is the new capability. **CORRECTED 2026-08-01: an earlier version of this line said `supersedes` is already in `REL_VOCAB`, as if the mechanism existed. It does not.** VERIFIED: `supersedes`, `relates_to`, `initiates`, `corroborates` and `elevated_into` have ZERO occurrences in `store.mjs` — no producer and, for four of them, no consumer either; only `cites`, `derived_from` and `links_to` are actually created. `elevated_into` is REQUIRED by C-6.3 and written by no op at all. So membership of `REL_VOCAB` means only that C-6.1 will not refuse the string: division needs its edge BUILT, not merely permitted. The same correction applies to any design that leans on a relation being 'already in the vocabulary'.

**2. Apportioning the basis is an AUTHORED act, never automatic.** If A gathered thirty
documents and four sub-inquiries, dividing means deciding which belong to B, which to C,
and which to both. A machine cannot decide that, and evidence must never be silently
reassigned — the split records who apportioned what.

**3. A PUBLISHED case cannot be divided.** It can only be superseded by new inquiries
that cite it. A published hash answers forever and somebody may already have acted on
it; retraction and revision are different acts, and dividing a case after the world has
relied on it would be revision pretending to be housekeeping.

**4. Weakest-link composition makes division NECESSARY, not merely convenient** — and
this is the part worth keeping. If a case is only as strong as its weakest leg, then an
inquiry mixing one well-supported claim with one thin one is worth exactly the thin one.
Without division a member's only options are to overclaim (publish the mix at the
strong claim's apparent strength) or to stay silent (publish nothing). **Division is the
mechanism by which the strength rule does not force that choice**: separate the thin
leg, publish the strong claim honestly at its own strength, and leave the weak one open
as what it is. That makes division a doctrine requirement rather than a convenience.

**5. A published case is an INPUT, not a terminus** (Bob, 2026-08-01). It cannot be
divided, and it can be cited as basis by another inquiry or taken up by another project.
That is what keeps the record cumulative instead of a series of dead ends: a case
answers a question and becomes evidence for the next one, and because recursion is the
basis mechanism, this needs no new machinery — a later inquiry cites it exactly as it
cites a document. Two consequences worth holding: the citing inquiry inherits the cited
case's STRENGTH as one leg of its own weakest-link chain, so a case built on a case
cannot be stronger than the case beneath it; and a case that is later superseded leaves
everything that cited it needing re-evaluation, which is the same obligation the record
already carries when a capture's basis moves.

**And merging is free**, for symmetry: two members independently opening inquiries into
the same thing is resolved by a parent that cites both. No new mechanism.

## What a CLAIM is, and why it is a field rather than an object — 2026-08-03

Bob, in review: *"So what's a claim? Is it an answer to the question posed in an inquiry?…
Is a claim the object when it doesn't have enough supporting evidence, and a conclusion is
when it does?"* Determined here because the collapse left the word undefined, and an
undefined word in the middle of the design is how *"a claim can rest on another claim"* got
written and had to be corrected.

**An inquiry is a QUESTION and has no truth value. A claim is a PROPOSITION and can be true
or false. Concluding is the inquiry ADOPTING a claim as its answer** — not a third object, but
the relationship between the two, carrying the basis and the falsifier. This is why a leg
attaches to the CLAIM rather than to the conclusion, which is Bob's own correction in the same
review and is right.

**A claim is a FIELD of an inquiry, not an object, and it is not a phase.** Three things follow
and each was a candidate reading that fails:

- **Claim and conclusion are not one object in two states.** The inquiry is the object; the
  claim is what it holds; concluding is the act.
- **They are NOT distinguished by evidential sufficiency, and that reading must be refused.**
  *"Claim = not enough evidence yet, conclusion = enough"* puts a sufficiency threshold in the
  middle of the record, which this project has refused three times: `AUDIENCES.md` §5 forbids a
  per-reader gate, §4 Q2 calls a global strength floor *"its own doctrine problem"*, and DEC-15
  routed around it rather than through it. The deeper reason is that **"enough" is not a
  property of the evidence but of what you intend to do with it** — enough to publish a question
  is not enough to refer to a prosecutor — so a threshold in the object would have to pick one
  purpose and impose it on every other. What discharges the need for one is already built into
  the design: strength is DERIVED and names its weakest legs; the falsifier is REQUIRED; and
  DEC-15's project-declared required strength lets a GROUP declare its own standard, published
  beside what was actually reached. A declaration, not a gate.
- **A conclusion does not silently revert when its evidence weakens.** Strength genuinely can
  fall — a grade regraded down, a leg severed, a capture that proves to be archival rather than
  direct. When it does, DEC-16 already makes that an EVENT propagating to every ancestor, and
  DEC-12 already permits REOPENING as an act with a name and a date. Nothing reverts by itself,
  because a conclusion that un-concludes with nobody accountable is the record changing its mind
  in silence.

### Can one finding hold SEVERAL claims? Not today, and the alternative is already expressible

Bob: *"a finding can have multiple claims. (That's true, right?)"* **It is not true as built, and
the honest answer is that it may not need to be.**

Several propositions — *the transfer happened*, *no resolution authorised it*, *the balance fell
below the statutory floor* — are expressed as SEPARATE INQUIRIES that the larger one rests on.
In that sense a finding does draw on many claims, because **a leg pointing at a concluded
inquiry is a leg pointing at that inquiry's claim.** Composition is what the recursion is for.

**The argument for keeping it a field is the collapse's own test.** A claim with legs is shaped
exactly like an inquiry with legs, so a claim nested inside a finding is an inquiry denied its
own identity — it cannot be cited by anything else, published on its own, or given its own
falsifier. Promoting it rebuilds the multiplicity the collapse removed, which is the argument
that closed focus/finding/case.

**Two things could still force the promotion, and both are open:**

1. **Ergonomics, and it is MEASURABLE rather than arguable.** If every component proposition
   must become a full inquiry with its own falsifier, stating one finding may cost more than a
   volunteer's evening. That is observable once M9 ships and should be measured, not predicted.
2. **CONTRADICTION, which is §4 Q14 and is undesigned.** Two claims that conflict, both held,
   neither abandoned. `role: cuts_against` is one leg's polarity, not a structure for two claims
   contradicting each other. **If a claim ever becomes an object, this is the reason it will** —
   and note the two cases are different: Bob's question is about COMPOSITION, which recursion
   already answers, while Q14 is about CONTRADICTION, which nothing answers.

`inquiry_basis` does not exist in the schema, so all of this is still free.
**CLARIFIED 2026-08-03 by Bob, and the question sharpens rather than closes.** *"I'm not
necessarily suggesting that claims can themselves contain sub-claims. But I wonder if a
finding with multiple claims is appropriate in some situations."* His example, recorded
because it is the best test case the question has: an inquiry asks *"Can a parallel
municipal power utility develop distribution lines separate from those of another utility in
overlapping service territory?"* One claim's legs cite utility regulations that conflict
with parallel distribution; a SECOND claim's legs cite rights enshrined in the state
constitution and the court decisions that clarify them. **Two parallel claims — two
independent bodies of support answering one question — not nesting.** That distinguishes it
from the composition case above (which recursion already answers) and from Q14's
contradiction case (which nothing answers): this is PLURALITY — same conclusion-shape, two
grounds. The two candidate shapes are `0..n` claims on one finding, or two inquiries under a
parent whose published rendering reassembles them; forcing the example into two inquiries
would split an answer a reader needs whole, which is the strongest argument yet against the
field reading. Still OPEN, leaning toward plurality; `inquiry_basis` does not exist, so both
shapes remain cheap.
**RAISED AS DEC-32, 2026-08-03 (session BOB), with a worked recommendation:** plurality shaped
as GROUNDS rather than claim-objects — one finding, one conclusion, `1..n` named grounds, each a
labelled partition of the basis legs the member asserts is INDEPENDENTLY SUFFICIENT; today's
flat basis is the degenerate one-ground case. The consequence that matters: grounds compose
DISJUNCTIVELY — the finding's strength is its strongest sufficient ground, each ground's
strength the weakest leg within it — so the utility example publishes at the constitutional
ground's strength with the regulatory ground beside it, where today's weakest-leg rule would
hold the whole finding down and push the member toward division. A suspended leg suspends its
ground; the finding suspends only when every ground is (DEC-18's pattern, one level up).
Contradiction (§4 Q14) stays separate: grounds agree on the conclusion. Awaiting Bob.
**CLARIFIED AGAIN 2026-08-03 (Bob): "what that really is is multiple claims" — conceded;
each ground IS a claim, the same proposition on a distinct basis. The test that now carries
the design: COUNT THE FALSIFIERS. One proposition, one falsifier, several independent bases
→ plurality inside one finding (DEC-32's shape, whatever the surface calls the parts).
Different propositions → different falsifiers → separate inquiries, composed by recursion,
rendered together. DEC-32 remains open.**


## THE ACTION PLAN — mapped 2026-08-03, not yet in the review document

Bob, 2026-08-03: *"the finding of a project indicate[s] that some government action (or action
by some other person or organization) doesn't conform to the law, policies, regulations, stated
intentions/promises, or other restrictions. In situations like this, an action plan needs to be
constructed. This action plan may differ based on the user type (journalist, activist, lawyer,
etc.) or other very important (strategic, tactical, political, financial, temporal) factors. The
system must include a surface that lays out the set of action options and depicts them together
with the dependencies, deadlines, resources required, and other factors. The system (with support
of AI skills) may suggest an action plan that includes a progressive series of steps with
dependency graphs keyed to possible outcomes of each step."*

This section is the MAP he asked for, before anything is added to the review document.

### 1 · What a plan answers, and why it is not an inquiry

A finding of NONCONFORMITY says conduct departed from a standard — a law, a policy, a
regulation, a stated intention or promise, or another restriction. Note the structure this
already has and needs no new machinery: **such a claim has legs pointing at BOTH the standard
and the conduct**, and both are ordinary evidence.

A plan answers *"what do we do about it?"* — and that is decisively **not a claim about the
world**. It has no truth value, no falsifier, and evidence does not bear on it. So it fails the
inquiry test at the first question, and cannot be modelled as one.

### 2 · The object question, and the argument that settles it

Three candidate shapes:

| shape | why it fails, or does not |
| --- | --- |
| a field on the finding | the plan outlives and outgrows the finding, and may serve several findings at once |
| a set of `action` bundles in a `proposed` state, with edges between them | **the near miss.** It reuses an object that exists and models decline as a state, which the collapse precedent favours. It fails on one thing: an `action` is defined as *"an outward engagement — something SENT to somebody outside the group"*, and an option never taken was never sent |
| **a distinct object holding candidate STEPS** | **recommended** |

**The decisive argument is the options NOT taken.** *"We considered a grand-jury referral and
did not pursue it, because the filing window closes before we can reach the required strength"*
is exactly the kind of authored decision this record exists to hold — it is the same doctrine as
the completeness statement (what you left out, authored, never prefilled) and as invariant 7
(what cuts against travels the same path as what supports). If an option only becomes an object
once chosen, every rejected option vanishes and the plan silently overstates the group's
deliberation. **A plan must be able to hold what it decided against.**

So: a PLAN holds STEPS. A step that is taken produces an `action` (the existing object, unchanged,
still the outward engagement). A step declined keeps its reason and stays visible.

### 3 · Structure — borrow the progression vocabulary, do NOT borrow the progression object

`progression_stages` already carries most of the shape: `stage_no`, `after_stage` (dependency),
`within_interval` (deadline), `required`. A plan's steps want exactly those, plus three things
progressions do not have:

- **outcome-keyed branching.** `after_stage` is linear. Bob asks for *"dependency graphs keyed
  to possible outcomes of each step"* — each step declares its possible OUTCOMES (records
  produced / denied / ignored past the statutory deadline) and later steps hang off a specific
  outcome. This is a decision tree, not a chain, and it is the genuinely new structure.
- **resources.** What a step costs: money, member hours, expertise the group may not hold,
  standing to bring it.
- **disposition.** chosen · declined-with-reason · done · blocked.

**AND THEY MUST NOT SHARE AN OBJECT, for a doctrinal reason rather than a technical one.** A
progression models what SOMEBODY ELSE is supposed to do, and its entire purpose is to make a gap
DETECTABLE and raise it as a finding about the world. A plan models what WE intend to do. If the
two shared machinery, **our own missed deadline would surface as a finding about the record** —
converting a management fact into evidence, which is precisely the overclaiming this project's
threat model is pointed at. Same shape, opposite subject, separate objects.

### 4 · Variation by user type is already expressible, and lands in the right place

The plan varies by journalist / activist / lawyer, and by strategic, tactical, political,
financial and temporal factors. This needs no new axis: **capabilities, journeys and surfaces
vary by USER TYPE** (`AUDIENCES.md` §0, unchanged), and the action repertoire is part of the
journey. The seven `action_kind` values already shipped — `cpra_request`, `grand_jury`,
`controller_referral`, `public_comment`, `media`, `litigation_support`, `other` — with
`risk_tier` 1–3, are that repertoire's first draft.

The plan therefore belongs to a PROJECT + FINDING, never to a person: a lawyer's project and a
journalist's project may build different plans from the SAME finding, and each project already
declares the evidentiary strength its work requires (DEC-17). **A step may be blocked because
the finding has not reached the project's declared strength** — which is the first place that
declaration does mechanical work rather than only being disclosed.

### 5 · Where the machine helps, within DEC-24's boundary and adding no exception to it

- **SUGGEST a plan** (PURSUE): propose steps, sequencing, contingencies. Under DEC-24 rule 1 a
  suggested plan is a set of CANDIDATES; the member adopts, edits or declines each, with a
  reason. The machine never adopts a step.
- **CHECK a plan** (CHECK): an unreachable deadline; a step depending on a resource the group
  does not have; **an unhandled branch — an outcome with no next step**, which is the most
  valuable check because it is the one a person misses; a step whose finding is below the
  project's declared strength; a deadline now passed.
- Rule 4 holds unchanged: a checker RAISES into a queue, never edits the plan.

### 6 · The surface — S11, and the journey gains a stage

Ten surfaces are specified today; this is an eleventh. S10 THE ACTION PAGE holds ONE outward
engagement. **S11 THE ACTION PLAN holds the graph**: options, dependencies, deadlines, resources,
branches keyed to outcomes, and the declined options with their reasons.

The journey inserts cleanly and the existing edges are unchanged:

    finding → S11 PLAN → S10 individual actions → consequence → back in as evidence

`impacting` is currently the stage with *no working process whatsoever*, so nothing is being
retrofitted.

### 6a · PLANNING FROM WHAT IS NOT YET ESTABLISHED — agreed, and it is not a concession

Bob, 2026-08-03: *"the process of building up an understanding of what's needed to justify an
action isn't the same as claiming that the action is justified. Not at all! Agreed?"*

**Agreed, and the design already contains the principle — this applies it one level up.** A
HUNCH is a connection asserted ahead of its evidence so a line of thought can be followed
(DEC-15). An UNSUPPORTED CLAIM is a standing objective the system can pursue (DEC-22). Both
were ruled legitimate on the same reasoning: investigation must be free, and what is gated is
PUBLICATION. Planning from an unestablished finding is the identical move, and refusing it
would contradict two rulings already made.

**The argument that matters most is what refusal would COST.** An investigator will do this
reasoning regardless — in a notebook, in their head, in an email thread. Refusing to hold it
does not make the record more honest; it makes the record LESS COMPLETE, and pushes the actual
shape of the investigation into exactly the places this system exists to replace. A record that
cannot say *"we were working toward this"* cannot show how a case was really built.

**THE PRINCIPLE, stated so no build session re-litigates it: the gate belongs at the ACT, not
at the reasoning.** A plan may rest on premises not yet established. An act that reaches outside
the group may not be taken on them. That is the same line publication already draws.

#### Two directions of exploration, and both are first-class

- **FORWARD, from a hypothesis.** *"If this finding held, what action options would open up?"*
  Asserts nothing about whether the finding holds. It maps consequence.
- **BACKWARD, from an action.** *"Given what this project has already established, what
  additional findings or claims would ALSO need to be true for action X to be a credible option
  worth considering?"*

**The backward question is the more valuable of the two, and it is the objectives engine
pointed at a new target.** Its output is not prose — it is a WORK LIST: the specific findings
that do not yet exist or are not yet established, each of which becomes an objective under
DEC-22, pursued by the member and by the machine together. This is how investigators actually
build cases, and it is the single most productive thing the system could compute.

#### The safeguard is LABELLING, not refusal — and Bob named it first

*"A property of action plans that are presented is which elements of the plan are currently
supported by the evidence."* Every element of a plan carries its **support status**, and it is
never absent or implied:

| status | meaning |
| --- | --- |
| **established** | rests on findings that have reached the project's declared required strength |
| **short of the standard** | rests on real findings that have not yet reached that strength — the gap named, per leg |
| **hypothetical** | rests on a finding that does not yet exist, held as an explicit premise |

**Rendering rule, and it is the whole safeguard:** a plan element's support status is displayed
wherever the element is, in the same treatment everywhere, exactly as `undetermined` is. A plan
that showed its steps without their support status would be the overclaiming failure — not
because it planned from a hypothesis, but because it hid that it had.

**Consequences for the build:**
- A hypothetical premise in a plan is DECLARED, and it is **HUNCH DEBT** — so nothing
  resting on it can be published while it stands, which needs no new gate. *(Read "bias
  debt of the hunch kind" 2026-08-05; corrected per D-188 / DEC-46 (d), because the
  general term names the class that does NOT block and the hunch is the one that does.)*
- An outward act's pre-flight REFUSES when its step is not `established`, naming the premise
  and the shortfall. This is where the project's declared required strength (DEC-17) does
  mechanical work.
- The backward question's output is objectives (DEC-22), not commentary.

### 6b · THE TWO HARD PARTS, SCOPED DOWN — 2026-08-03

Both were named as blockers on specifying S11. Bob dispositioned both, and neither is a blocker
any more.

#### Resources: an ATTACHED LIST, not a model

Bob: *"That depends on the action, right? But the complexity of figuring out the resources
needed for every action is maybe too big and uncertain at this point. I would simply suggest
that there being a means of collecting and presenting associated resource[s] be a part of the
action plan. (a collapsable list?)"*

**Adopted, and the reasoning is worth keeping because it is a general lesson about this design.**
A typed resource model would have to decide, in advance and for every action kind, what
categories exist — money, hours, expertise, standing, political capital, someone's willingness
to be named — and the enumeration would be wrong for the first group that used it. **An open
list attached to a step is honest about the uncertainty in a way a premature schema is not**,
and it does not foreclose the schema later: real lists from real groups are the evidence a
schema would need, and none exists yet. This is the same instinct as `MEASUREMENTS.md` — do not
write a constant nobody measured.

So: a step carries a **RESOURCES list**, free-form entries, collapsed by default and expandable.
No enumerated categories, no required fields, no arithmetic over it. What it buys is that the
question *"what would this cost us?"* has somewhere to live at the moment a group is deciding.

#### Action preconditions: DEFERRED, with the derivation path named

Bob: *"Knowing what each kind of action requires before it's worth attempting may also [be] too
difficult to take on now. But what we do know is that it could be figured out through some
combination of supporting evidence already gathered, mechanical means, and AI support."*

**Deferred, and the second sentence is the part to keep**, because it converts an open-ended
research problem into a bounded one with three named inputs:

- **supporting evidence already gathered** — what this project has established is itself part of
  the answer; the gap is relative to a corpus that exists, not to an abstract standard;
- **mechanical means** — some preconditions are structural and checkable without judgement (a
  filing window against a date, a standing requirement against who the group is, an exhaustion
  requirement against actions already recorded);
- **AI support** — for the procedural knowledge that is neither in the corpus nor mechanical.

**What this changes for the build: the BACKWARD question is deferred; the plan is not.** A plan
can be authored, ordered, branched, costed and labelled with support status today, with the
member supplying what an action requires. What waits is the system ANSWERING *"what else would
have to be true for X to be credible?"* on its own. That is a capability added later to a
structure that already exists, not a prerequisite for it. Recorded as D-165.

#### Consequence for S11

With resources scoped to an attached list and preconditions deferred, **S11 is specifiable
now** for everything except the backward question. Its state inventory can be drawn: the plan
with its steps, dependencies, deadlines, branches keyed to outcomes, declined options with
reasons, resources collapsed, and each element's support status. Only the *tell me what is
missing* affordance waits on D-165.

### 7 · ONE QUESTION THIS MAP DOES NOT ANSWER, and it is Bob's

**What, if any, of a plan is PUBLISHED?** A group's strategic deliberation — *we considered
litigation and cannot afford it*, *we are timing this before a council vote* — is plausibly the
most sensitive material the system will ever hold, and precisely what an opponent would most
want. It is also the material most likely to be sought under legal process.

Running provisionally, and the conservative branch: **the plan is WORKING material and is never
published.** What legitimately crosses into publication is already covered elsewhere — an
action's OUTCOME can become evidence (DEC-14 governs impact claims), and the group's declared
position on contacting the subject is published by DEC-13. Neither requires publishing the
deliberation. **Recommendation: keep it that way, explicitly, and make the two-bucket fence's
default cover plans by construction rather than by a permission check.** Raised as DEC-25.

## Resolutions forced by the adversarial pass, 2026-08-01

The critique found 10 doctrine hits, 13 correctness, 3 usability. Four are contradictions
in THIS design rather than in the code, so they are resolved here. All four were verified
against the source before deciding.

### R1 · An UNDETERMINED leg leaves the chain UNRATED. It does not floor it and is never ignored.

The three storyboards gave three different answers, and the code they proposed reusing
gives a fourth: `#weakerGrade` (`store.mjs:3444-3446`) ranks an unknown grade with
`|| 0`, i.e. **below grade D** — weaker than the worst grade there is.

Decided, and the reasoning is doctrinal rather than aesthetic:

- **Ignoring it launders.** A chain whose weakest leg is invisible is exactly the
  overclaiming this project's threat model calls the more dangerous half.
- **Flooring it below D punishes honesty.** It would make recording `undetermined`
  expensive, pressuring a member to invent a determination to keep a grade — which is
  precisely the pressure D-97 removed at the intake gate and D-114 refused to recreate at
  the publication gate. Moving that pressure into strength would reintroduce it a third
  time.
- **UNRATED states the truth.** The chain has no computed strength, and says which leg is
  why. A case may still publish with strength stated as UNRATED pending that leg —
  honest, publishable, and impossible to hide.

**THE WORD IS `UNRATED`, NOT `SUSPEND`, and the rename is not cosmetic.** The
reconciliation pass found that `SUSPEND` already means something ELSE in `SB-OUTPUT`
section 5.1, and that `BUILD-ORDER`'s REC-12 says "ship SUSPEND" citing that file — so a
worker following the build order in good faith would have built the behaviour R1
forbids, while every document appeared to agree. A word two designs use differently is
worse than a word neither has, because the disagreement is invisible until it ships.

**Consequence for the build: `#weakerGrade` MUST NOT be reused unchanged.** A null grade
is not a weak grade; it is the absence of one, and the two must not share a rank.

**AMENDED 2026-08-02 by Bob (DEC-18) — an ungraded leg is INERT, and UNRATED becomes the
boundary case rather than the rule.** *"An ungraded leg doesn't contribute to a conclusion,
but if there are other graded legs, then it doesn't suspend the conclusion either."*

This is not the behaviour R1 forbade, and the distinction is the whole amendment. R1's
first bullet refused grading on the determined legs **while the ungraded leg still counted
as part of what the conclusion rested on** — support drawn from a leg that paid nothing
toward strength. The amendment removes the support as well as the cost:

- **An ungraded leg contributes NOTHING.** Not weighed, not averaged, does not floor, does
  not unrate. It sits in the basis, named and visible, as a leg that is present and **not
  yet load-bearing**.
- **The conclusion is graded on its load-bearing legs**, which is honest because those are
  the only legs it rests on.
- **UNRATED survives as the boundary case.** If EVERY leg is ungraded there are no
  load-bearing legs, the conclusion rests on nothing established, and it is UNRATED.
- **Every ungraded leg is named, one or many** (Bob, same review: *"more than one leg may
  have no established grade, in which case every such leg will be named."*). This is what
  keeps INERT from meaning INVISIBLE, and it is the clause the build must not drop.

The consequence for `#weakerGrade` is UNCHANGED and if anything sharpened: a null grade
still must not share a rank with a real one, because the comparator must now EXCLUDE the
null leg from the population rather than rank it anywhere in it.

**The residual hazard, named because the amendment creates it.** An ungraded leg costs the
conclusion nothing, so leaving a leg ungraded is now the cheapest way to keep an
inconvenient one out of the reckoning — a laundering path in the opposite direction from
the one R1 closed. Three things already stand against it and they are named here so no
build session assumes a fourth is needed: every ungraded leg is NAMED on the case and in
the index row; the completeness statement is authored and must say what the case leaves
out; and invariant 7 makes a leg that cuts against travel the same path as one that
supports. Whether that is sufficient is D-159, and it is a question for use rather than for
argument.

### R2 · Capture grade and connection grade are TWO scales and must never be composed into one number

Both run A–D and they measure different things. `CAPTURE-FIDELITY.md:40` records that
Grade A is out of a Worker's reach, and the Intake Doctrine rules that **neither axis
substitutes for the other**. Weakest-link across a mixed chain substitutes them by
construction — a category error this design introduced by saying "strength composes as
the weakest link" without asking *the weakest link of what*.

**REFINED 2026-08-01 after reading the code's own stated intent, which R2's first
version talked past.** `store.mjs:3441-3443` says, deliberately: *"Reuses the resolution
grade rank so the two axes cannot drift."* That is an argument FOR sharing a scale, made
by the person who built it, and it deserves an answer rather than an override. Reading
the fuller comment at 3434-3439, the pair it composes is a connection's TWO ENDS — how
each end resolved to the shared entity — and both are section 8.1 grades. **That
composition is sound and R2 does not forbid it.**

What R2 forbids is narrower and must be named precisely, because the first version did
not: **CAPTURE grade must never be composed with CONNECTION grade.** Capture grade
measures directness of acquisition (A is a WACZ chain of custody and is out of a Worker's
reach; B is a direct fetch; C is via an archive). Connection grade measures what would be
needed to check an inference. They answer different questions and the Intake Doctrine
rules neither substitutes for the other — but they share the letters A–D, which is what
makes the error easy and invisible.

Decided: **a chain's strength is a PAIR, never a scalar.** A chain carries the weakest CAPTURE
grade among its evidentiary legs and the weakest CONNECTION grade among its inferential
legs, and nothing averages, mixes or collapses them. A rendering may show both; no
rendering may reduce them to one letter.

Two smaller consequences: **no surface may display Grade A for a direct capture** (the
suite already has a negative control on this), and a case resting on one capture and one
inference has two strengths, which is more honest than any single number would be.

**AMENDED 2026-08-02 by Bob (DEC-21) — the CONCLUSION above stands; the MECHANISM below it
was wrong.** Bob: *"A capture is the act of reading a document in. A connection is an edge
between 2 or more pieces of information… They're different things. So why are those grades
combined?"*

They are not combined, and the word **PAIR** invited the reading that they are one two-part
score. What does not survive is R2's account of which legs carry which axis:

- a **CAPTURE** grade is a property of an INFORMATION object — how the bytes were read in;
- a **CONNECTION** grade is a property of an EDGE between pieces of information.

A leg of a basis IS an edge pointing at a target. So the leg has a connection grade of its
own, and if its target is a document, that document has a capture grade. **One document leg
carries BOTH** — which R2's own corrected example already showed (*"capture ⟨B⟩ … connection
⟨A⟩"*). "Evidentiary legs versus inferential legs" cannot survive its own worked example.

Corrected: a conclusion reports **two independent measurements over two different
POPULATIONS**, not one measurement over two kinds of leg.

| | ranges over | answers |
| --- | --- | --- |
| **CAPTURE** | every DOCUMENT the conclusion reaches | *how well do we know these are the bytes the body published?* |
| **CONNECTION** | every EDGE the conclusion rests on | *how well established are the relationships this reasoning uses?* |

Reported side by side because a reader needs both. Side by side is not composition.

**Unchanged and not to be re-opened:** a connection's OWN grade is composed from its two
ends (`connections.a_grade`, `b_grade` — how each end resolved to the shared entity), and
that composition is legitimate because both ends measure the same kind of thing. The schema
carries exactly this shape.

### R3 · The collapse deletes the system's only cycle guard, and must replace it explicitly

Verified: `store.mjs:2092-2104` refuses a citation whose members are not `information`,
and its comment names the side effect — *"this also catches a Project citing itself,
which is a cycle with nothing to mean."* The only cycle protection in the record is an
accident of a type check.

Under the collapse an inquiry citing an inquiry is the POINT, so that type check goes and
takes the guard with it — while strength becomes an unbounded recursive derive-on-read.
A self-citing or cyclic basis graph would not merely be meaningless, it would not
terminate.

Decided: the basis graph is a DAG, enforced at write. An inquiry may not cite itself
transitively, the refusal names the cycle it found, and derivation carries a depth bound
whose exhaustion is reported as `undetermined` (R1) rather than as a failure.

### R4 · Division must cost at least what severance costs

The critique's sharpest finding, and it inverts an argument this document makes. Division
was justified as the mechanism that stops weakest-link forcing a member to overclaim or
stay silent. The abuse is the same mechanism: **dividing is a cheaper way to shed a
finding that cuts against you than severing it**, and a published child currently
discloses neither its parent nor its siblings. Invariant 7 — a finding that cuts against
the case is surfaced as prominently as one that supports it — is defeated by a
housekeeping operation.

Decided: division carries severance's friction and then some. It requires an authored
reason; the divided parent RECORDS where every leg went, including legs that cut against;
and **a published child names its parent and its siblings.** A reader who can see one half
of a divided inquiry can see that the other half exists. Without that, division is a
laundering path with a tidy name.

## Open questions this pass must answer## Open questions this pass must answer

1. Do `focus` / `project` / `action` / `case file` survive, evolve, or get replaced?
   Bob is explicitly open on this and it is the first question.
2. Is a case ONE object with audience renderings, or several? (Observation 3 argues
   one, and names the falsifiable test.)
3. How does a claim state what it rests on and what would falsify it?
4. How is a case's strength derived, and does the weakest-link rule hold?
5. How do contradicting findings live inside one case? (D-80 rules contradiction is a
   thing to FIND rather than prevent — so a case must be able to hold tension without
   resolving it.)
6. What closes the loop from action to consequence, and how does a consequence become
   evidence about the system's own responsiveness?
7. ~~Is the government-administrator archetype in scope?~~ **ANSWERED 2026-08-01: yes,
   and the question was malformed.** All stakeholders are assumed to want better
   outcomes; archetypes differ in what they DO with a case, not in whose side they are
   on. What remains open is narrower and real: an administrator's instance holds the
   body's own material, so what does the two-bucket fence protect there, and from whom?
8. What does the ladder look like once case-making is at the top rather than appended?
