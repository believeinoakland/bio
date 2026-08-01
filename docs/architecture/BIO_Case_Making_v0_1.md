# Case-making: the design pass

**IN PROGRESS.** Opened 2026-08-01 (session BOB) as the D-127 design pass Bob directed.
This is a RECORD OF THE PASS, not a finished design: Bob's framing as he gives it, and
the observations and questions it raises. Nothing here is settled unless it says so.

Do not build from this file yet. Its output will reshape `MILESTONES.md` — case-making
is not a rung appended after the substrate, it is what the other eight rungs serve.

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

## Open questions this pass must answer

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
