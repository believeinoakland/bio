# The investigative session — proactive AI claim formulation

**Bob, 2026-08-05, session BOB.** Ruled as DEC-60. This document carries the reasoning;
the decision entry carries the verdict.

**Rewritten twice on 2026-08-05.** The second rewrite is the one that matters: an attempt
to give the record a structure for how claims relate to each other was refuted by Bob and
replaced by VERSIONS (§5, §6). §16 records what was withdrawn and why, because both wrong
turns were instructive.

A member with an inquiry presses a button and a **skilled AI session** runs against that
inquiry: it reads the project, finds evidence, and works out how the legs of each claim come
together. **PURSUING EVIDENCE AND INVESTIGATING ARE ONE SESSION, not two** (Bob, 2026-08-06)
— searching and forming versions interleave in a single loop under a single skill and a single
credential scope. DEC-24 named PURSUE and the other roles separately; this merges two of them
rather than overturning the boundary. Sub-sessions may still exist as FAN-OUT within one run
(§14a), which is parallelism, not a second role. Everything it produces is a SUGGESTION. The member explores, edits, accepts or
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

**AND IT MUST READ DOCUMENT VERSIONS AS VERSIONS (D-220, Bob 2026-08-06).** Sixty captures
of one calendar are sixty versions of ONE document, not sixty documents. A run that counts
them as sixty has a distorted picture of what the record holds — the false-coverage hazard
`STORE-AS-CACHE.md` names, arriving at the document level, and it would make an inquiry look
far better covered than it is. The record already holds the version chain (`captured_locators`
joined to `register`); D-220 exposes it. The session is consumer (2) on that row.

**WRITES:** one endpoint, adding a new VERSION to a claim under the subject inquiry.
Everything it writes is a suggestion. Nothing else.

## 4 · The fence: THE AI HOLDS NO OP THAT ACCEPTS

**Corrected 2026-08-05 by Bob, and the corrected form is stronger than what it replaced.**
The first statement was *the session's only write is one endpoint*. That was wrong as soon as
evidence gathering was designed, because a pursue session works through the plane's existing
machinery — capture, OCR, extraction — and those write.

The accurate statement, which survives the scope growing:

> **The AI holds no op that ACCEPTS anything.** Nothing it can call concludes, accepts,
> publishes, or makes a version current.

Its interactions with the store fall in three groups, and the third is the fence:

1. **It REQUESTS acquisition — it does not perform it.** Bob, 2026-08-05: *"capturing a
   document (with provenance preserved) is something the daemon does (sometimes at the
   suggestion of an AI)."* So the AI does not hold a capture write at all. It asks; the
   daemon captures. **The AI therefore never touches the provenance chain**, which is the
   foundation the entire trust model rests on, and the capture is attributable to the
   instance's ordinary capture path rather than to an agent.
2. **It SUGGESTS** — versions, in `suggested` state (§9).
3. **It ACCEPTS nothing.** Every state change in §6 is a member act it cannot reach.

**AND A CAPTURE IS NOT EVIDENCE.** Bob, 2026-08-05: *"the capture is an entry of a document
to the cache (store), but not an entry of the document into the leg of a claim."* This is
`CLAUDE.md`'s "CONTENT IS THE UNIT, AND A DOCUMENT IS NOT THE ANSWER" appearing one level
down. A run that captures four hundred documents has changed the STORE and changed no CLAIM.
Only a leg inside a version, accepted by a member, moves anything the record asserts.

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
3a. **Versions form a DERIVATION TREE, and accepting one offers to prune its ancestors**
   (Bob, 2026-08-06, answering the review-burden problem — D-217a). Each version records what
   it was derived from, null where a run composed it fresh. Accepting a version OFFERS deletion
   of the ancestors it descends from; the offer is not automatic, because a member may want a
   rejected reading kept as the record of what was considered. **Deletion is a member act** —
   the AI can no more delete a version than accept one.
3b. **Rewording a CLAIM is USER SELECTABLE — new version, or new claim** (Bob, 2026-08-06,
   D-217b). Not a schema decision but a runtime one, so the schema supports both. A tightened
   wording that leaves the legs meaning what they meant is a version; a rewording that changes
   what the legs are answering is a different claim wearing a similar sentence. §8's
   question-sharpening offers the same choice rather than deciding for the member.
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

## 14a · INTEGRATION — how the AI attaches to the workflow

**Bob, 2026-08-05, answering the four open integration questions.** The model is Claude
Code, and the structural idea it gets right is the one this design adopts:

> **The agent is not inside the product. It is a separate process that acts on the product
> through the same interface a person could use.**

That is what makes it auditable and replaceable, and it is why a misbehaving agent is a
bounded problem rather than a compromised system. It is also DEC-55 already ruled — the AI
is an agent against the plane's endpoint surface — with the rest following.

### Which Claude account — a cascade, and it decides sovereignty too

**Bob:** the instance may have a Claude account whose token the BIO configuration holds;
every project and every member may have a different one. **Resolution order: the MEMBER's
account if they have one, otherwise the PROJECT's, otherwise the INSTANCE's.**

**This answers where the agent RUNS, not only who pays.** If the instance holds a token, the
instance can make the calls, so the agent loop runs in the group's own infrastructure rather
than on anything BIO operates. Sovereignty is preserved at exactly the point it matters
most — the installer's whole promise is a sovereign instance in the group's own account, and
an investigation running on someone else's servers would have put the most consequential
part of a group's work outside it.

**The shape is a FLEET MEMBER** — a separate Worker in the group's own account, as
`pdf-worker` already is (I6). The plane stays a record-keeper: it grows no model runtime, no
inference budget, and no new security posture.

Two obligations that follow:

- **The record names WHICH LEVEL of the cascade was used**, not only that a machine acted.
  D-199's fourth determination already requires the record to name the principal; with three
  possible principals it must say which. Never the token value.
- **When no token resolves at any level the capability is UNAVAILABLE and says so.** An
  honest absence, stated — never a silent no-op, which would be indistinguishable from a run
  that found nothing.

**To MEASURE before building, not assume:** an agent loop spends most of its time waiting on
API responses and Workers bill CPU rather than wall time, so a whole run may sit well inside
the paid ceiling — or may not. It decides whether a fleet member can hold an entire run or
must be structured as many short invocations. → **D-218**

### Running sessions are visible in context — and this is CROSS-CUTTING

**Bob, 2026-08-05, and it is not investigation-specific.** A background session runs in a
CONTEXT and is associated with a claim, an inquiry or a project. Any window focused on any of
those objects shows **an animated indicator that a job is running**; clicking it opens the
**live transcript**. **The state of those objects does not change while the session runs**,
so there is no partial state to reconcile and no "come back later" notice is needed.

**The same applies to the Assistant and to every other AI-based function**, so this is a
GENERAL INTEGRATION SURFACE for AI sessions and should be designed once rather than per
feature — the way the fleet-member pattern was. The investigation session is its first
instance. `ASSISTANT-PILOT.md` carries a pointer to this section.

**TRANSCRIPT RETENTION — RULED, Bob 2026-08-06: DEVICE-LOCAL, with a TTL, AND deleted as part
of the PUBLICATION process. Never in the record store.** Bob's framing is what decides the
shape: these are *"internal notes - like a reporter's notes or internal deliberations… We've so
far not identified any use for them. They need to be protected from subpoenas."*
- **Device-local rather than instance-side, and the reason is the threat.** An instance-side
  cache lives in the group's own Cloudflare account — a third party who can be served
  directly, sometimes without telling the group, and who has no incentive to resist. On the
  member's device a demand must reach the member, who knows about it and can contest it. **The
  price, stated so nobody discovers it later: a teammate watching the running-session indicator
  can see that work is happening and cannot read the reasoning.**
- **Deletion at publication is a ROUTINE trigger and that is what makes it defensible.** The
  governing principle in journalistic practice is that destruction on a schedule set in advance
  and applied without regard to content is defensible; destruction begun once a demand is
  anticipated is spoliation, which is far worse than having kept the material.
- **THEREFORE THE PURGE MUST BE SUSPENDABLE — a litigation hold.** Recorded as a build
  requirement rather than a question, because it follows from Bob's own stated purpose and
  getting it wrong inverts the protection into liability: once a group is on notice, both the
  TTL and the publication-deletion must stop for relevant material.
- **Mechanical consequence:** device-local means publication cannot reach another member's
  device. Each device clears on next contact and the TTL is the backstop.
- *(General practice, not advice for this group's situation. California's shield law is among
  the strongest in the country; whether it reaches a civic accountability group rather than a
  newsroom is a question for counsel.)*

So the transcript is **LIVE, LOCAL AND SHORT-LIVED**, with the version's written description
(§6.1) carrying what survives. That is the same split Claude Code runs
on, where the session is the thinking and the commit message is the durable account — which
is why §6.1's description should be held to a commit message's standard: what changed and
why, not what happened.

### The pursue session and the daemon — request, wait, post-process

**Bob, 2026-08-05:** a pursue AI that initiates a capture *"needs to be notified when the
capture is complete and given a reference to the document so that it can post-process it."*

So the cycle is **request → daemon captures → notify with a reference → post-process**, and
each half belongs to whoever already owns it: the AI identifies what is worth having and
what to make of it once it arrives; the store layer does the capturing, the OCR and the
extraction, preserving provenance through the path that already exists.

**The notification is not new machinery.** `NOTIFICATIONS.md` already catalogues *"a capture
the member walked away from has completed"* (D-61) among its ~30 generators, with stable
`N-<n>` ids precisely so that thirty sites do not each invent a wording. A pursue session
waiting on a capture is that generator with a different subscriber — extend the subscriber,
do not invent a channel.

**This substantially de-risks D-218, and is worth saying before the measurement comes back.**
A run has natural suspension points by construction: search → identify → request captures →
**wait on the daemon** → post-process → form versions. The run must be able to stop and
resume whatever the CPU ceiling turns out to be, because it has to wait on work it does not
perform. So "many short invocations carrying state" is **the natural shape of the work rather
than a workaround for a limit** — and the Durable Object with alarms that the plane already
runs is where that state lives. Whichever way the measurement lands, the resumable shape is
the one to build.

**What post-processing may WRITE is not settled here.** Bob: *"it may be the AI that also
scans the captured document for content and connections."* Extracting what a document
literally contains asserts little; identifying a CONNECTION is closer to a constitutive
statement — which is exactly DEC-52's open question, and this design is a reason to answer
it rather than a place to answer it.

### Evidence search may be a SUB-SESSION

**Bob, 2026-08-05:** the search for evidence may itself be a sub-session, or mechanical, and
it may go out to the internet.

This is the ephemeral-worker pattern: a sub-session is spawned for one job, reports to its
parent, and ends. The four levels — meaning, content, documents, the open internet — are the
natural fan-out.

**A search sub-session never touches the record.** It reads, fetches, and reports back to the
parent, which remains the only thing holding a write. So the fence stays ONE endpoint no
matter how many sub-sessions a run spawns, and no sub-session needs a write scope of its own.

**REACHING THE OPEN INTERNET IS ANSWERED — DEC-47, Bob 2026-08-06: the inquiry and the session
launch ARE the authorisation, for *"areas that anybody can go through."*** No per-fetch or
per-batch dialog. The prior recommendation (acquire only on an authored act, plans proposing in
bulk) was refuted: a member asked to approve forty URLs has not done the research and cannot
judge them, so the approval would add paperwork without judgement — and asking permission to
use the internet asks a member to re-authorise what opening the inquiry already authorised.
**What remains is CONDUCT, not authorisation, and it is build-time work:** where "public" stops
(logins, paywalls, `robots.txt` disallows, a private individual's site), and how the instance
behaves out there (rate, volume, identifying honestly — we do not disguise requests). The
structural gate costs nothing and stays: the AI never fetches, it REQUESTS, and the daemon
captures.

### What Claude Code's model maps onto, in one table

| Claude Code | the investigative AI |
| --- | --- |
| runs on your machine, not inside the forge | a fleet member in the group's own account |
| `settings.json` — routine pre-approved, consequential gated | the credential's declared scope: reads ungated, one write that can only suggest |
| gated acts interrupt a human | **stronger here** — accept and make-current have no op the AI can call |
| `CLAUDE.md` loaded every session, versioned in the repo | the skill's doctrine layer, and **the run records which version it ran under** |
| one session per worktree; sessions share no state | one run; runs share no state |
| an uncommitted change reaches nobody | a version reaches people because it is written; the conversation does not |
| the commit message | the version's description (§6.1) |
| review the diff | rotate between versions; comparison IS the diff |
| interactive, scheduled, or CI — one agent, three triggers | one agent, two modes (§10) |
| subagents for broad search, composed by the parent | evidence-search sub-sessions over the four levels |
| refusals surfaced verbatim, never worked around | answers name their level; absence at one level is not absence at the next |

## 14b · THE RUN'S ARCHITECTURE — derived from Claude Code, grounded in what exists

**Bob, 2026-08-06: build the best-of-breed architecture, learning from Claude Code.** This
section is the result of a rigorous pass over the repo. Three findings change the design
materially; the rest is Claude Code's structure mapped onto machinery BIO already has.

### 1 · CONTEXT ECONOMY — the largest gap in the design as written, and it was absent

Everything above says the session "reads the project." **A run cannot hold a project.** A
project with forty inquiries, hundreds of claims and thousands of captured documents exceeds
any context window, and a design that does not say how it copes will discover this on its
first real corpus.

Claude Code's answer is three mechanisms, and all three transfer:

- **Sub-sessions return CONCLUSIONS, not their reading.** A search sub-session reads widely
  in its own context and hands back what it found — never the documents. This is why §14a's
  fan-out is not merely a speed optimisation: **it is the memory model.** Without it a run
  drowns in its own evidence.
- **Query, never load.** The run holds the inquiry, its claims and its working set. Everything
  else it reaches by asking. The store is the memory; the context is the workspace.
- **Progressive disclosure.** The skill's doctrine layer is always resident; its recipes,
  vocabularies and per-format knowledge load when the run reaches work that needs them.

**The consequence for the fan-out is a rule, not a preference: a sub-session that returns
documents rather than findings has defeated the architecture.** Its contract is a finding with
a citation, and the parent re-reads by address if it needs the bytes.

### 2 · THE READ SURFACE HAS A HOLE, and it is exactly where the session lives

Measured in `STORE-AS-CACHE.md` and re-verified here: BIO has **two retrieval routes**, and
the session needs both while only one has a query surface.

- **Route 1, the query compiler** (`query.mjs`): **34 filterable fields, 5 FTS columns**
  (`title`, `body`, `meta`, `locator`, `authority`).
- **Route 2, the meaning tables**: `readings`, `reading_refs`, `resolutions`, `connections`,
  `inquiry_basis` — **none of them reachable by the query compiler.**

**And the projection makes the hole invisible, which is worse than the hole.** Route 1 carries
SCALAR SUMMARIES of the meaning layer onto the bundle row — `capture` →
`inquiry_capture_strength`, `legs` → `inquiry_basis_count`, and so on. So a caller can filter
by a finding's strength and never reach the legs that produced it. `STORE-AS-CACHE.md` names
this exactly: **the projection creates a false sense of coverage — the meaning layer is
visible as a number and unreachable as a structure.**

**The investigative session is the first consumer that genuinely needs route 2**, because
forming a version of a claim's legs is meaning-layer work. As written, §3's read scope is not
achievable: the session can see that a claim scores 0.7 and cannot see what it rests on.

**So a meaning-layer read surface is a PRECONDITION of this design, not an enhancement.**
Recorded as **D-222**. Whether it becomes an extension of the query compiler or a second
addressable surface is a build decision; that it must exist before the session can do its job
is not.

**And D-220's version join belongs to the same gap**: sixty versions read as sixty documents
is the identical false-coverage failure one axis over.

### 3 · RESUMABILITY IS ALREADY BUILT, and joining it is a documented step

§14a established that a run must suspend and resume — it waits on the daemon for captures it
requested, whatever the CPU ceiling turns out to be. **The mechanism exists and the repo tells
the next consumer how to join it.**

`SCHEDULER.md` records the decision: ONE reconciling Durable Object alarm with a consumer
registry, `#schedConsumers(probe)`, each entry `{ name, due(now), wake(now), tick(now) }`.
Three properties matter here and all three are already proven:

- **No starvation** — the reconcile keeps EVERY active consumer's wake, not only the one that
  just ran, so a fast consumer cannot shut out a slow one.
- **Self-termination** — an idle instance carries no timer and spends nothing, which the
  sovereign-instance distribution model needs since most instances sit on the Free tier.
- **Locality** — the consumer runs beside the DO's own SQLite, which is where a run's state
  lives anyway.

The file's own instruction is explicit: *"To add the monitoring / eligibility / cadence /
ageing consumers: append an entry to `#schedConsumers`… Do NOT add a second alarm or a cron;
that is the decision this file records."* **The investigative run is such a consumer.** It
needs no new scheduling machinery, and building one would violate a recorded decision.

### 4 · WHAT IS SCRIPTED AND WHAT IS JUDGED

Claude Code's clearest structural lesson: **do not let the model decide control flow that
should be guaranteed.** Loops, fan-out and gates are deterministic; judgement happens inside a
step.

| deterministic — code, not skill | the model's judgement |
| --- | --- |
| how many search passes, and when the loop stops | what to search for |
| the fan-out across the four levels | what each level's findings mean |
| a version is written in `suggested` and no other state | what the version says |
| dedup against existing versions before writing | whether this reading differs in substance |
| the observation log is written whether or not the run succeeds | where it stopped and why |
| every machine fence | — |

**The gates must not depend on the skill behaving well.** A skill is instructions; a fence is
code. Where this design says the AI "may not" do something, that must be a refusal in the
plane, not a sentence in a prompt — which is DEC-55's endpoint-is-the-fence, restated as a
build rule.

### 5 · THE RUN VERIFIES ITS OWN WORK BEFORE PROPOSING

Claude Code runs the tests and reads the output rather than declaring success. The session's
equivalent is deterministic and cheap, and it runs on every version before it is written:

- every leg cites something that **exists** and is reachable at the address given;
- the strengths **compute** — the version's own arithmetic runs and produces a result;
- the version **differs in substance** from every existing version (Bob's rule), which is the
  same check that prevents duplicate churn;
- nothing in it is in a state the session may not write.

A version failing any of these is not proposed. This is a check, not a judgement, so it
belongs in code beside the endpoint rather than in the skill.

### 6 · A RUN IS BOUNDED, AND THE BOUND IS RECORDED

An unbounded run over a large project is the failure mode a background job invites. A run
carries a budget — fetches requested, sub-sessions spawned, wall time across resumptions — and
**when a bound stops a run, the observation log says which bound and where it stopped.** That
is the same discipline `heldMatch` learned the hard way: *not found* and *did not finish
looking* are different facts, and only one of them is a licence to conclude anything.

### 7 · PARTIAL RESULTS SURVIVE

A run that dies halfway must not lose what it found. Versions are written as they are formed
rather than in one batch at the end, and the observation log is appended as the run goes.
A resumed run reads its own log and continues rather than restarting — the same property that
makes Claude Code's workflow resume cheap, and the reason §7's version identity (frozen,
uniquely named) matters operationally as well as conceptually.

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

1. ~~Leads for other inquiries have no home.~~ **ANSWERED 2026-08-06 by Bob: discovered
   evidence not related to the current inquiry is CAPTURED and recorded as an ACTIONABLE
   NOTIFICATION the member can act on later.** Needs no new machinery — `NOTIFICATIONS.md`
   already catalogues ~30 generators with stable `N-` ids so that thirty sites do not each
   invent a wording, and the QUEUE construct defines what a member learns. It also sits
   correctly against §4: the document is CAPTURED (entry to the store, not to any claim) and
   the observation becomes the notification. → **D-213, closed**
2. **Whether a version carries the conditions it was formed under** (§11). → **D-215**
3. **Whether sharing is stronger in the data model than the edge association found**, which
   would force cloning after all (§7). → **D-216**
3a. **Whether a fleet member can hold a whole run** inside the paid CPU ceiling (§14a).
   → **D-218**
3b. **Egress** — a run reaching a host no member named is DEC-47's act (§14a), still open.
4. **Review burden.** A claim with eleven unreviewed versions is the pile-up problem in a new
   shape. Deduplication helps; it is not an answer. → **D-217**
5. **Whether a reworded CLAIM is a new version or a new claim.** Kept out of §6 deliberately
   so versions do not nest. → **D-217**

## 18 · Decomposition — a first cut, NOT HANDED OVER

**Bob, 2026-08-05: hold the handover until the integration architecture is finished.** The
`BOB INBOX` says so and instructs CONDUCT not to schedule any of it.

| piece | what it is | acceptance ALSO carries (§14b) | depends on |
| --- | --- | --- | --- |
| **IS-1** | **Versions**: a claim carries many; frozen once written; unique name per claim; description required; derivation tree with prune-on-accept; reword user-selectable (§6). | version identity survives a run's death (§14b.7) | none |
| **IS-2** | The **state machine** over versions — four states, reversible, every transition a member act, machine identity refused on each. NC: an `ai` credential refused BY NAME on every transition. | **every fence is CODE, never a line in the skill** (§14b.4) | IS-1 |
| **IS-3** | **CURRENT as a project-to-inquiry property** (§7), with the notification when other projects reference the inquiry. | — | IS-1, D-216 |
| **IS-4** | The **suggest endpoint** — §9's kinds, sole possible output a suggested version, carrying its run. One write path for both modes. | **the pre-write checks of §14b.5** — legs cite something reachable, strengths compute, the version differs in substance, nothing in a state it may not write | IS-1, IS-2 |
| **IS-5** | The **`ai` credential's investigative scope**: reads across the project, writes only IS-4. | — | IS-4 |
| **IS-6** | The **run object and its observation log** (§11). | the log is written **whether or not the run succeeds** and **names the bound that stopped it** (§14b.6) | none |
| **IS-7** | **Strength over the current version**, the state-set argument, the state set on the return, hunches excluded (§12). | — | IS-1 |
| **IS-8** | **Published bundle carries the current version** — leg configuration, description, and the version name (§13). | — | IS-1, IS-3 |
| **IS-9** | **THE RUN HARNESS — added 2026-08-06, and absent from this table until then.** The run's execution model: fan-out to evidence sub-sessions, resumption, budget. | **(a)** a sub-session returns FINDINGS, not documents (§14b.1), enforced at its return contract rather than trusted; **(b)** the run **queries and never loads** the project; **(c)** it joins `#schedConsumers` per `SCHEDULER.md` and adds **no second alarm and no cron**; **(d)** it carries a budget and exhausting one is RECORDED, never silent; **(e)** versions are written as formed, never batched at the end | IS-1, IS-6 |

**Cross-cutting, belonging to no single item and checked on all of them (§14b.4):** control
flow is deterministic and judgement is the model's; a gate is code and never a sentence in a
prompt; and **a sub-session that returns documents rather than findings has defeated the
architecture** — a review criterion, not a preference.

**PRECONDITION ON THE WHOLE SET: D-222.** The session's read scope is not achievable until
the meaning layer has a read surface, and D-220's version join is the same gap one axis over.

IS-1 is the spine. IS-6 is independent of everything and is what makes the instruments
computable; IS-9 is what makes a run survive contact with a real project.
