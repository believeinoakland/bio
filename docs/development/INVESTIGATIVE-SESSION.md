# The investigative session — proactive AI claim formulation

**Bob, 2026-08-05, session BOB.** Ruled as DEC-60. This document carries the reasoning;
the decision entry carries the verdict. The transcript-retention ruling is DEC-61; the
pursue/investigate merge is DEC-62 — both were lifted into the register on 2026-08-07,
because a Bob ruling that lives only in a design document reaches only the person who
already knows it.

**Rewritten twice on 2026-08-05.** The second rewrite is the one that matters: an attempt
to give the record a structure for how claims relate to each other was refuted by Bob and
replaced by VERSIONS (§5, §6). §16 records what was withdrawn and why, because both wrong
turns were instructive.

**v3, 2026-08-07 — this document absorbed the consistency sweep** (`IS-SWEEP-2026-08-07.md`,
cited below as SWEEP). The doctrine held; the sweep found the design's nouns wrong in three
places, two of its reads unbuildable today, one door it assumed missing, and fifteen
conflicts with the answered register (SWEEP §6 C1–C15). Every correction is folded in
where it belongs rather than appended. Four decisions the sweep raised were resolved by
session BOB under Bob's 2026-08-07 delegation (SWEEP §4b) and are SETTLED here: versions
attach to the **inquiry's basis**; prune **hides, never deletes**; the capture-request
door is a **`capture_requests` table drained by the daemon**; **CHECK is the first
deployed mode**. The three points that remained Bob's are now resolved inline (SWEEP §4c,
2026-08-07): `[BOB-2 — RULED NO 2026-08-07]` (pruned-alternatives disclosure in the
published case), `[BOB-3 — RULED 2026-08-07: disallows do not bar capture]` (robots.txt
conduct), `[BOB-4 — RULED 2026-08-07, PROVISIONAL pending Bob's confirmation]` (DEC-52's
remaining yes/no).

A member with an inquiry presses a button and a **skilled AI session** runs against that
inquiry: it reads the project, finds evidence, and works out how the legs of the inquiry's
claim come together. **PURSUING EVIDENCE AND INVESTIGATING ARE ONE SESSION, not two**
(Bob, 2026-08-06; ruled as DEC-62) — searching and forming versions interleave in a single
loop under a single skill and a single credential scope. DEC-24 named PURSUE and the other
roles separately; this merges two of them rather than overturning the boundary.
Sub-sessions may still exist as FAN-OUT within one run (§14a), which is parallelism, not a
second role. Everything it produces is a SUGGESTION. The member explores, edits, accepts
or rejects.

The machine/member division does not move. What moves is the assumption that it had to be
enforced as *the machine may not produce the object*. It is enforced as **the machine may
not accept the object**.

---

## 0 · Vocabulary — four words this document had been using loosely (D-226)

The sweep measured vocabulary drift of D-156's class between this design and the register,
and D-226 requires it resolved before IS-1 is scheduled. Fixed here, binding on every
section below and on every IS item's build:

- **VERSION**, unqualified, means a **BASIS VERSION** — IS-1's unit, a complete
  alternative composition of an inquiry's `basis[]` (§6). The word has six senses in this
  repository and every other one is QUALIFIED at use: a **document version** (D-220's
  chain), the **skill version** a run records (§14a), a published case's **edition**
  (DEC-12), an adopted policy's **pinned version** (DEC-54), and an engine's
  **calibration** (D-183). A sentence in which "version" could mean two of these is a
  sentence to rewrite.
- **REPORT** is what a sub-session returns (§14b.1). v2 called it a "finding", which
  collided with the record's unit of truth (DEC-44) and with derived progression findings
  (DEC-9/10) — three senses, and the worst sat in IS-9's acceptance clause, where a search
  hit wore the name of the thing the whole system exists to protect. Renamed throughout.
- **LEG** means the register's leg, whole: axis, relationship (AND/OR per DEC-32),
  grade_source, and — once D-164 lands — extent and extraction method (DEC-23). v2's leg
  was materially thinner, and a builder implementing the thin leg under-builds the
  register's. There is one leg shape and it is the register's.
- **GROUND PARTITION** is the analyst's and schema's term (`inquiry_basis` carries
  `ground` and `role` columns today) and is **never a surface word** — DEC-32's
  elicitation clause 1 bans it from every member-facing surface, tooltips included. This
  document may use it; no screen may.

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

## 2 · The objective — and the first deployed mode

**Formulate claims and legs SUPPORTED BY EVIDENCE. The goal is not to support or disprove
a position.** Bob, 2026-08-05. Positive and therefore testable: a run whose claims only ever
point one way is failing its own objective, visibly, without anyone knowing what the member
wanted. The session pursues the strongest account of the inquiry and **does not resolve
what the evidence does not resolve.**

**CHECK IS THE FIRST DEPLOYED MODE** (decided 2026-08-07, session BOB, SWEEP §4b item 7).
DEC-55's enacted instruction was "sequence the CHECK role first"; DEC-60's momentum said
investigate. They are one build: this session, run with this objective against an
EXISTING conclusion, IS DEC-24's CHECK role — the record read adversarially, by the
machine aimed at self-directed overclaiming, the threat model the doctrine names. Deploying
that mode first satisfies the enacted instruction without a second architecture, and it is
also the safest first deployment, because a run over a concluded inquiry has the smallest
authorisation surface and the clearest ground truth to be measured against.

## 3 · What the session sees, and what it may write

Read broad, write narrow.

**READS:** the project · **all** the project's inquiries including the subject · the
subject inquiry's basis versions with their states · the **launching project's declared
evidence standard — the `required_strength` PAIR** (DEC-17, DEC-21). The standard is
per-project and it is a pair, never a single number, so for a shared inquiry there is no
"the current evidence standard" — the run reads the standard of the project it was
launched under, and only that one. **A projectless inquiry has no CURRENT and no bar** —
legal under DEC-17 — and a run against one states that absence rather than inventing a
default (SWEEP C8).

**AND IT MUST READ DOCUMENT VERSIONS AS VERSIONS (D-220, Bob 2026-08-06).** Sixty captures
of one calendar are sixty document versions of ONE document, not sixty documents. A run
that counts them as sixty has a distorted picture of what the record holds — the
false-coverage hazard `STORE-AS-CACHE.md` names, arriving at the document level, and it
would make an inquiry look far better covered than it is. The record already holds the
chain (`captured_locators` joined to `register`); D-220 exposes it. The session is
consumer (3) on that row.

**THE BIAS IS CARRIED, NEVER STEERED BY — and the three parts have three different
statuses** (SWEEP §1.2):

- **RULED:** the run carries the bias manifest in force when it ran. *"An
  assistant-surfaced focus must carry the bias manifest in force when it was surfaced…
  unlike a member it will not remember. Without the manifest… bias debt cannot be computed
  against it"* (`Content_Framework:1129-1141`) — answered before D-215 asked it, and
  D-215(2) is RULED YES for the bias component.
- **FORBIDDEN:** *"bias never shapes what is captured or monitored, only how conclusions
  are weighed"* (`Content_Framework:1283`). The net bias is legitimate only as the thing
  the run CARRIES and the weighing it DISCLOSES — never as an input to what the session
  searches for. §14 makes this structural: **the search half of the run never receives the
  bias at all.**
- **UNBUILDABLE TODAY:** `object_type: bias` is absent from the check catalogue (D-84);
  `Declared_Bias_v0_1` is a draft with no check and no code. Until D-84 lands, the
  manifest-carrying obligation is dischargeable only as **"no manifest was in force,"
  stated** — an honest absence, never a silent omission. D-84 is a named precondition of
  the bias half of this design (§17).

**THE READ VIEWER IS STATED, because an unstated one crosses D-15.** Every read the run
makes passes the D-15 viewer gate under a named viewer. A member-launched run reads as
**that member** — the narrowest viewer who could accept its output — so nothing it
composes rests on material its accepter cannot see. An org-scoped run reads with
instance-level reach, and the consequence is named rather than discovered: it can compose
versions from projects the accepting member was never invited to, and a narrower member
accepting material they cannot view is exactly the leak D-15 closed. So an org-scoped
run's versions disclose that scope, and the accept surface applies REC-36's stricter rule
— it withholds what the accepting viewer's own gate would withhold. The default, and the
recommended deployment, is the member-scoped viewer.

**WRITES:** one endpoint, adding a new VERSION of the subject inquiry's basis. Everything
it writes is a suggestion. Nothing else.

**WHAT A VERSION IS A VERSION *OF* — decided 2026-08-07 (session BOB, SWEEP §4b item 5).**
A claim is not an object. `OBJECT_TYPES` is `{information, inquiry, project, action}` —
no claim type, no claims table, no claim op — and Case Making ruled that a **claim is a
FIELD of an inquiry**: concluding is the inquiry ADOPTING a claim, carrying the basis and
the falsifier. DEC-32 withheld object identity from claims by the citability test, and a
versioned, named, stateful claim object would rebuild the multiplicity D-127's collapse
removed (SWEEP C13). So **versions attach to the INQUIRY'S BASIS**: the version set is
shared wherever the inquiry is shared (§7), an inquiry carrying two distinct propositions
is split by §8's question-sharpening — machinery this design already has — and the claim
stays a field. The build target is the existing construct: `bundle.md`'s `basis[]` as the
authority, `inquiry_basis` as its projection with ONE write site inside `promote`'s
transaction (`store.mjs:7288`). A directly-written version table would be the
second-place-to-state-a-fact D-21 forbids.

**AND A VERSION CARRIES THE GROUND PARTITION, not only the legs** (SWEEP §1.1).
`inquiry_basis` already has `ground` and `role` columns, and DEC-32's settled arithmetic
runs over the partition and the AND/OR relationship. A version that is a flat leg set
cannot express plurality — the version IS the composition, and the partition is part of
the composition. A version with no relationship field would re-ship the flat-AND basis
REC-42 corrected (SWEEP C5).

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
   foundation the entire trust model rests on.
   **The request mechanism is DECIDED (2026-08-07, session BOB, SWEEP §4b item 1): a
   `capture_requests` table, drained by the daemon.** The door did not exist and could not
   be assumed: `taskenqueue` is absent from the OPS table *deliberately, with the reasoning
   written into the table itself* (`index.mjs:295-299` — no control-plane route may put an
   event in the queue on its own account), `taskEnqueue` refuses any kind outside its one
   registered kind, and DEC-37 scoped the daemon to exactly two verbs, *"widened by
   decision, not by drift."* The policy widening was already Bob's own ruling (the quote
   above), so only the mechanism remained. The table keeps closed the door the OPS comment
   closed — nothing control-plane enqueues — keeps the daemon the sole fetcher, and gives
   DEC-47's conduct rules ONE enforcement point: the drain. The table is scratch-class,
   in `capture_sessions`' family, not record.
2. **It SUGGESTS** — versions, in `suggested` state (§9).
3. **It ACCEPTS nothing.** Every state change in §6 is a member act it cannot reach.

**ATTRIBUTION — CORRECTED (SWEEP C6).** v2 said a requested capture is attributable to the
instance's ordinary capture path *"rather than to an agent."* DEC-27(b) says the opposite
and wins: the record states BOTH — *"the assistant captured this, at Anna's request."*
Here: **the daemon captured this, at the investigative session's request, for the
principal the run acted under.** And per DEC-55 determination 4, the record names the
token identity AND the principal behind it — with one more distinction this design adds:
the **Claude-account principal** (which level of §14a's cascade paid for and ran the
reasoning) and the **plane-credential principal** (whose scope the writes ran under) are
two different principals, and the record names both. Never a token value, which
`tokens.mjs` already denylists.

**AND A CAPTURE IS NOT EVIDENCE.** Bob, 2026-08-05: *"the capture is an entry of a document
to the cache (store), but not an entry of the document into the leg of a claim."* This is
`CLAUDE.md`'s "CONTENT IS THE UNIT, AND A DOCUMENT IS NOT THE ANSWER" appearing one level
down. A run that captures four hundred documents has changed the STORE and changed no
conclusion. Only a leg inside a version, accepted by a member, moves anything the record
asserts. And the run's captures land exactly as the daemon's always have — at `collected`,
never higher; sweep material never ratifies itself (Intake Doctrine; SWEEP §1.7).

---

## 5 · How the legs come together — and why this is not a schema problem

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
> over.** The AI's job is to shape a set of legs so that when the existing calculation runs,
> the result is one the evidence actually supports.

What the record holds is therefore: the legs, their ground partition, and **a written
account of why these legs, arranged this way, tell this story**. Not a taxonomy.

**"ASSIGN STRENGTH VALUES" MEANS COMPOSING, NEVER MINTING — and the apparent tension with
§8.1 dissolves under three standing rulings** (SWEEP §1.3), so no new ruling was needed:

- **A leg's grade is a fact about METHOD** — the source's own identifier (A), an identifier
  matched in content (B), correspondence (C), testimony (D) — and nothing else. The
  ASSISTANT construct already forbids *"a grade asserted rather than earned."*
- **DEC-18: an ungraded leg is INERT, contributes nothing, and every ungraded leg is
  NAMED.** Inert never means invisible.
- **DEC-15: a HUNCH is a member act.** The AI may not propose one.

**Therefore the session COMPOSES legs and the grades arrive from the record** — from the
resolutions the legs rest on (`earnedBasisRegistry`, `store.mjs:8808`), exactly as
`op=cite` already fills them. Where the record has earned nothing, the leg is ungraded,
inert, and named as such in the version's description. "Assign strength values" means
composing legs whose EARNED grades produce a supported calculation — not minting numbers.
**This also reconciles DEC-24 rule 3** (*"a machine-proposed connection is a HUNCH… until
earned or attested"*), which read literally would make every AI-composed version
publication-disqualifying under DEC-20 (SWEEP C3/C4): a machine-composed LEG is never a
hunch, because it either carries a grade the record earned or it is absent-and-named — a
hunch is a member's own marking (DEC-15), and the machine has no path to one. The register
carries reconciliation notes on DEC-24 and DEC-27 so a builder reading it alone gets this
instruction and not the superseded one. And §10's safe-to-be-wrong property — which
recogniser, which document version, what confidence, what signals — now has a path onto
every machine-suggested leg, because every grade traces to a resolution that records it.

## 6 · VERSIONS — the mechanism

**Bob, 2026-08-05.** An inquiry's basis supports multiple **versions** — each a complete
alternative account of the support for the inquiry's claim, not a patch to another one.

This is what makes the whole design work, and the reason is §5: if a set of legs is a
composition that tells a story, then **the composition is the unit of meaning, so the
composition is the unit of change.** Versioning individual legs would recreate exactly the
problem — one leg altered in isolation may not make sense against the others.

It also resolves cleanly the thing that had no answer before: when new evidence means an
already-accepted leg should be weaker or narrower, nothing accepted is ever altered. A new
reading arrives as a whole alternative account and the accepted one stays exactly as it was.

**The rules:**

1. **Every version carries a textual description** of that composition. This is
   load-bearing, not a convenience — see §10, where it is what survives a conversation that
   is deliberately not kept. It is held to a commit message's standard: what changed and
   why. Under §5 it also carries the naming of every ungraded leg.
2. **Every version has a unique NAME within its inquiry.** The AI names the versions it
   adds; a member may rename. (Uniqueness is per inquiry — global uniqueness would make
   naming absurd, and a member forced to invent a name for every small edit stops editing.)
3. **A version is frozen once written. Editing produces a new version** derived from it.
   Otherwise two members exploring the same version collide, and comparison stops meaning
   anything because the thing being compared shifts underneath. **The derivation edge IS
   `derived_from`** — already in the closed relationship vocabulary (State Rules v1.5),
   with zero producers anywhere in `store.mjs` today; IS-1 becomes its first real producer
   rather than minting a synonym (SWEEP §1.7).
3a. **Versions form a DERIVATION TREE, and accepting one offers to PRUNE its ancestors**
   (Bob, 2026-08-06, answering the review-burden problem — D-217a). Each version records
   what it was derived from, null where a run composed it fresh. **PRUNE HIDES; IT NEVER
   DELETES** (decided 2026-08-07, session BOB, SWEEP §4b item 6). The collision the sweep
   found (C1) was real: D-214 rules that the rejection PATTERN is queryable only if the
   acts persist — *"a member who rejects every suggestion running against their thesis is
   visible only if the acts persist"* — and prune-on-accept as first written deleted
   exactly the suggestions that ran against them. DEC-16/DEC-19's never-vanishes-silently
   posture forces the same answer: "delete" at the UI altitude means the DISPLAY shrinks
   while the acts remain queryable. Both rulings survive whole. The offer is not automatic
   — a member may want a rejected reading visible as the record of what was considered —
   and per DEC-29(b) **the offer's wording states what hiding does**: hidden versions stay
   in the record and stay queryable. Hiding is a member act; the AI can no more hide a
   version than accept one. What a PUBLISHED case says about pruned alternatives is
   `[BOB-2 — RULED NO 2026-08-07: current version only, no disclosure of hidden
   alternatives]` — §13.
3b. **Rewording the inquiry's CLAIM is USER SELECTABLE — new version, or new inquiry**
   (Bob, 2026-08-06, D-217b, restated under §3's basis ruling). Not a schema decision but
   a runtime one, so the schema supports both. A tightened wording that leaves the legs
   meaning what they meant is a version; a rewording that changes what the legs are
   answering is a different proposition with its own falsifier — and a thing with its own
   falsifier is an inquiry (DEC-32's falsifier-count test). §8's question-sharpening
   offers the same choice rather than deciding for the member.
4. **Each version has its own state: `suggested` · `considering` · `accepted` ·
   `rejected`.** `considering` and `rejected` are reversible, the states are not a one-way
   ladder, and every transition is a member act. **This is a SIXTH state machine and the
   design says so** — `STATES` holds five (`bio-checks.mjs:127`; MEASUREMENTS.md
   2026-08-07), task states and proposal dispositions are different vocabularies, and
   nothing existing is this machine (SWEEP §1.4). Three consequences the first draft
   missed:
   - **A machine-written version is a PROPOSAL and inherits the interaction-construct's
     proposal rules**, which are already written: it is adopted, deferred WITH a recorded
     reason, or dismissed WITH a recorded reason; proposals **AGGREGATE, never multiply**;
     they **AGE rather than vanish**; and they must visibly **LOOK derived** (D-82).
     D-78 records that both existing writers hardcode `surfaced_by: human` and the fixing
     step (8b) is UNSCHEDULED — the field this design relies on is broken today, and IS-2
     depends on that fix being real.
   - **The member-side transitions are ACTS and owe the four beats** — choose · see what
     will be refused BEFORE it runs · author the reason · receipt. Accept, reject and
     make-current are not bare state flips. **Rejection at minimum carries an authored
     reason** — the rejection record is the anti-omission instrument, and it is worthless
     without one.
   - **The machine publishes the new machine through `op=affordances`** (a NEEDS/NON_ACTS
     row), or every surface showing version states holds a second copy of the rule — the
     drift class DEC-8 closed.
5. **Exactly one accepted version is CURRENT per project.** Current implies accepted.
   - **Accepted is a historical fact** — this version was accepted, on this date, by this
     member. A version that stops being current stays accepted, because it honestly was.
     That keeps the history with no extra state.
   - **Current is where the project's stance stands now** (§7), and it is what the
     effective strength pair is computed over.
   - A version accepted in error is REJECTED, which is a different and rarer act than being
     superseded by a better account.
6. **Exploring an unaccepted version is done by CALCULATING OVER IT, never by making it
   current.** This closes a tension in the first sketch, which had an unaccepted version
   temporarily designated current: once current is shared with a team (§7), that would move
   everyone's ground so one member could examine a possibility. The mechanism already
   exists — the strength function takes an argument naming which states to include.
7. **A member may edit the version they are working from**, provided the changes match the
   evidence, or any leg that does not is **marked as a hunch** — a marking only a member
   can make. **And the edit path does not bypass DEC-50** (SWEEP §6): an edit that
   regroups the ground partition is the attributed regroup act REC-45 built — ungroup with
   a reason, cite, regroup — surfacing through the derived version's record of who and
   why. §6.7 licenses no unattributed structural edit.
8. **A background run adds its output as a new version only if it differs in substance
   from every existing version** (Bob). That is the write gate; the review-burden answer
   is rule 4's aggregation and ageing, not dedup alone.

## 7 · CURRENT belongs to the project's relationship with the inquiry

An inquiry can be shared across projects, and everyone working in a project works as a team.
So one team's decision must never silently move another team's stance — Bob's point, and it
is right.

**Verified in the plane before answering it:** linking a bundle to a project creates an
EDGE (a `refs` edge — many projects may cite one inquiry), so an inquiry genuinely can sit
beneath several projects at once; and a project already overrides settings in its own
project file — its `bundle.md` frontmatter carries `required_strength`, read by
`#requiredStrengthFor` (`store.mjs:5154`) with strictest-wins. There is precedent for a
project holding its own position over shared material.

**So Current is a property of the PROJECT'S relationship to the inquiry, not of the inquiry
itself.** The inquiry, its claim and all its versions stay shared and keep accumulating.
Each project points at the version it stands on. Team A moves to version 3; Team B stays on
version 1 until it decides otherwise; both keep receiving every new version and every new
piece of evidence. **The pointer is a project-authored, DATED frontmatter field beside
`required_strength` — never a settings row** (SWEEP §1.7): DEC-17's reasoning transplanted
by D-199's second determination, because a settings row *"would be a way to change the
standard with nothing to read afterwards,"* and what a project stands on is exactly the
kind of fact that must move only as an authored, dated, on-the-record act.

The alternative considered and rejected was CLONING the inquiry on divergence (Bob's first
instinct). It was dropped because it duplicates the whole evidence trail and the two copies
immediately drift — new evidence found under one never reaches the other — so the shared
investigation stops being shared, which is the reason sharing exists. It is also triggered
by the wrong act: adding a version harms nobody, and only choosing which one is current
moves a stance.

**What survives from the cloning instinct is the NOTIFICATION, and it is required.** When a
member changes what their project stands on, they are told the inquiry is used by other
projects and that their change does not move those projects. When a new version arrives from
another team's work on the shared inquiry, that is surfaced too. **Both are FINDING-class
slugs in `queuestate.mjs`'s vocabulary, not `N-<n>` ids** — verified: no N-number exists
anywhere in source; the live vocabulary is slugs (`QUEUE_FINDING_KINDS`), `classOfKind` is
the fence, and the store refuses unknown kinds at the mint (D-213's corrected close
condition). FINDING, not CONDITION, deliberately: a condition is personally mutable, and
one member could silently mute what a team must see.

**Open verification:** if sharing turns out to mean something stronger in the data model than
the edge-based association found here — one stance that every referencing project must
share — then cloning is the only honest answer and this section is wrong. That check belongs
to whoever builds IS-3. → **D-216**

## 8 · The inquiry's QUESTION is a first-class object

Bob's contract case: *"Did the process used in the award of the X contract conform to the
contracting process the city is required to follow?"* is a different question from *"Was the
award of the X contract arrived at using a competitive bidding process?"* — *"Though related
questions, the evidence needed to answer each is very different, and answers very different
questions. A properly skilled AI can make those critical distinctions that might be
impossible mechanically."*

An inquiry's question can be imprecise, or two questions wearing one sentence, and that is
upstream of every version under it. So one of the session's highest-value outputs is often
not a version at all: *this inquiry is asking two questions that need different evidence;
here they are separated.* This is a suggestion like any other and the member accepts, edits
or rejects it. Under §3's basis ruling it is also the splitting machinery: an inquiry
carrying two distinct propositions — two falsifiers — becomes two inquiries here, not two
claim objects.

## 9 · What a SUGGESTION is

Everything below is written in state `suggested`, carries its run (§11), and is accepted,
edited or rejected by a member. Every kind is a FINDING-class slug in `queuestate.mjs`'s
vocabulary (see §7 — slugs, never N-ids; FINDING so no one member can mute it for a team).

| kind | what it proposes |
| --- | --- |
| **a new version of the inquiry's basis** | the main output — a complete alternative composition with its ground partition and description (§6) |
| **sharpen the question** | the inquiry asks two questions; separate them (§8) |
| **a new inquiry** | a proposition answering the question, with the first version of its basis |
| **this level is empty** | *we looked at this level — meaning, content, documents, or the open internet — and it is empty*, with the observation-log address of the search that establishes it. `CLAUDE.md` makes saying WHICH absence a first-class obligation, and §15's empty-run instrument needs an object to count — without this kind, a run that honestly found nothing supportable is indistinguishable from a run that emitted nothing (SWEEP §6) |
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

**"Export" means the AI adds a new version to the inquiry being investigated** (Bob). So
both modes use ONE write path — nothing the interactive mode can do lies outside what the
background job could do, and the fence needs no second design.

**The conversation is NOT part of the permanent record** (Bob; ruled as DEC-61 — §14a). The
member's decisions are; the discussion that produced them is not. **This is exactly why
§6's requirement that every version carry a written description is load-bearing:** the
reasoning behind a version would otherwise evaporate with the conversation. The description
is the durable account.

**The skill under which the interactive session runs must enforce evidence-based
conclusions** (Bob) — and where "enforce" means refusing, the refusal is code, not skill
(§14b.4).

## 11 · The RUN is an object

Every version names the run that produced it. **The proven model is `capture_sessions`
(`schema.mjs:358`)** — *"SCRATCH, not record… a work list with an expiry"*: ticks, an
expiry, opaque state, resumable across invocations. IS-6 and IS-9 extend that shape rather
than inventing one, and **the observation log cannot live in `bundle.md`, which is written
only on success** — the log's whole value is the failure path. The run buys:

- **The conditions it was formed under** — the bias manifest in force (RULED — §3; until
  D-84 lands, "no manifest was in force," stated), the launching project's declared
  standard pair, the claim and version set as it stood, and the SKILL VERSION it ran under
  (§14a). Bob: *"everything can change at the drop of a hat (bias, standard, claims)"*, so
  a version is only interpretable against them. (D-215 — answered.)
- **The observation log** — where it searched across the four levels, where it stopped and
  why. Search completeness is trained into the skill, which is COMPETENCE; the log is what
  lets anyone else CHECK. Three rules the log inherits from the record it serves:
  - **Absence uses D-129's vocabulary** — `NEVER_LOOKED / LOOKED_ABSENT /
    LOOKED_INDETERMINATE / PRESENT`, plus `partial`. Which absence is a stated fact, never
    a diagnostic detail.
  - **"Source unreachable" and "our governor held us" are different facts** (D-104), and
    `source-unreachable-governed` exists in the condition vocabulary to keep them apart. A
    log that writes the first when the second is true manufactures a false absence.
  - **A client-rendered shell capture is `LOOKED_INDETERMINATE`, never `PRESENT`** —
    `client-rendered-shell` is catalogued with NO producer, and an evidentially empty
    capture that reads as coverage is the false-coverage hazard again (SWEEP §3).
- **The interactive mode's subject** (§10), which needs the evidence trail intact.
- **The instruments in §15**, which are otherwise not computable.

## 12 · Strength

- **STRENGTH IS A PAIR, AND THIS SECTION'S v2 SINGULAR WAS THE REFUSED NUMBER** (SWEEP
  C5). DEC-21/DEC-44 refuse the composition four ways: strength is a pair over two
  populations — the capture axis and the connection axis — never composed into one value.
  Everything below is computed and returned PER AXIS.
- **The pair is computed over the CURRENT version's accepted legs, with DEC-32's settled
  arithmetic: MIN over AND-related legs, MAX over OR-related branches, MIN within a
  branch.** That is why §3 requires the version to carry the ground partition and the
  relationship — the arithmetic's input is the composition, and a version without it
  re-ships the flat implicit-AND basis REC-42 corrected. The default is AND, the
  conservative direction.
- **The anti-gaming keystone survives machine composition, and two mechanisms carry it**
  (SWEEP C2). DEC-32's keystone is that independent sufficiency is affirmatively claimed
  per branch and *"the structure is authored BEFORE the strength is shown"* — but an
  AI-composed version arrives structure-and-strength together, and one accept could carry
  the member's name over OR-branches they never claimed. So: **(a)** D-195's independence
  check joins the pre-write checks (§14b.5) — provenance is content-addressed, so shared
  upstream origin between branches is DERIVED and surfaced; derived informs, authored
  binds. **(b)** The ACCEPT ceremony shows the derived falsifier back in plain words —
  *"your answer fails only if ALL of these fail"* — and the member AFFIRMS independent
  sufficiency per branch before their name lands over it. The machine's OR is a proposal;
  the member's affirmation is the authored act. No AND/OR vocabulary reaches any surface
  (DEC-32's elicitation, unchanged).
- **An ungraded leg is INERT AND NAMED** (DEC-18) — it contributes nothing, suspends
  nothing while graded legs remain, and is always named. A suspended leg suspends its
  branch; the conclusion suspends only when every branch is (DEC-18's pattern one level
  up, per DEC-32).
- **A frozen version freezes the COMPOSITION and the grade-REFERENCES — not the grades.**
  Regrade does not exist as an op (SWEEP §1.7): grades move only by minting better
  resolutions and re-writing basis through cite/promote. So the effective calculation
  always uses the CURRENT earned grades behind the version's references, a frozen
  version's displayed arithmetic can honestly move beneath it, and the description records
  what was true at composition. "Regrade is the second caller" in DEC-46's thread is a
  design intent, not a mechanism, until an op exists.
- The strength function **takes an argument naming which states to factor in**, defaulting
  to accepted. Safe by default, and it is also how §6.6's exploration works.
- **The return carries the state set that produced it**, in the same object — a pair
  travels, and a strength separated from its filter is a misread waiting to happen.
- **A what-if value is member-facing exploration and never a record value — and its
  presentation is IN-BAND** (SWEEP C10). v2 parked it as colour or transparency; DEC-40
  rules that a filtered rendering states its filter in the artifact itself, and its
  negative control (strip the filter line, the harness fails) applies here unchanged. A
  what-if pair carries its state-set line wherever it renders; colour may decorate the
  line and may never BE it.
- **A leg marked as a HUNCH** (§6.7 — a member marking, always) is visible as such and
  does not count as evidence.

## 13 · Published cases

A published case is out in the wild and cannot be affected. Only a different published case
can be — a new edition, or a different published project.

**THE ARITY, PER DEC-44 (SWEEP C9): a case is a CONTAINER over ONE OR MORE findings.** v2's
singular "the published bundle carries the current version" was DEC-44's corrected arity
error re-entering. Each included finding is a concluded inquiry with its claim, its basis,
and — after this design — its versions, of which the PUBLISHING PROJECT'S current one is
what publication freezes. So:

- **The published container carries, for EVERY included finding, the version that
  project's stance stood on** (Bob's rule, applied per finding): the leg configuration
  with its ground partition, so it can be reproduced in BIO, and the text description, so
  a person can read it. No case-level strength exists — that is R2's refused composition
  at case altitude (DEC-44's own negative control).
- **It carries each version's NAME and identity, and the name joins DEC-34's per-page
  header list.** Current moves on afterwards and the published case can never be changed,
  so without the name a later reader cannot tell which account was published. DEC-34's
  brazening already puts case id, edition, authors, declared bias, both floors, hash and
  the verification pointer on every page; the basis-version name is one field wider, for
  the same reason the filter line was (DEC-40): a page separated from its document still
  names exactly what it renders.
- **The case carries DEC-54's policy pin** (SWEEP C14). Versions do not carry conditions —
  the run does (§11) — but a case published under an adopted external policy names the
  policy VERSION it was held to (source, retrieval date, content hash), because the policy
  moves and the case must remain checkable after it moves. Reconcilable and now stated:
  the pin lives at the case, not on the version.
- **Editions stay over the container** (DEC-12): adding, removing or revising a finding —
  or moving which version a finding stands on — is a new edition, and prior editions keep
  answering.

**`[BOB-2 — RULED NO 2026-08-07 (SWEEP §4c)]` — WHAT THE PUBLISHED CASE SAYS ABOUT PRUNED
ALTERNATIVES.** R4's division rule
is that a published child names its parent and its siblings, because division without
disclosure is *"a laundering path with a tidy name"* — and a published case that discloses
nothing about alternative accounts considered and hidden is structurally the same hazard
(SWEEP §1.6). The existing idiom is the exclusion statement (`inquiry_exclusions`,
completeness statements scoped to an edition); the recommendation on file is one authored
sentence per edition in the same shape. Reversal is impossible for editions already
published, which is the argument for deciding before IS-8 builds. **RULED NO, 2026-08-07:
the published case carries the current version only and states nothing about hidden
alternatives — prune already only hides, so the record itself loses nothing.**

## 14 · Bias — a FENCE first, and a requirement on the skill second

**The lens rule is STRUCTURAL, and v2 demoting it to a skill requirement was the defect
§14b.4 itself names** (SWEEP C7): *a skill is instructions; a fence is code.* The standing
rule — a lens may be preserved and may not be applied — is enforced by construction:

- **The search half of the run never receives the bias.** The spawn contract for search
  sub-sessions and search passes omits the manifest by construction — there is no field to
  read. *"Bias never shapes what is captured or monitored, only how conclusions are
  weighed"* (`Content_Framework:1283`) — the coupling is forbidden, not discouraged.
- **The composing half CARRIES the manifest** (§3, ruled) for disclosure and for the
  weighing it discloses — never as a search input.
- **The cross-project boundary is where the fence earns its keep**: Team B accepting a
  version composed under Team A's bias, with none of the four things DEC-46 required at
  exactly this boundary. Every version's run names its manifest (§11), so the lens diff is
  COMPUTABLE at the accept surface — and DEC-46(3) explicitly rejected a
  notification-grade answer, so the surface shows the diff in the ceremony, not a toast.

**Bob, 2026-08-05: the skill's requirements include MINIMISING these effects.** That
stands — on top of the fence, never instead of it. Constrain the skill at the source
rather than bolting a report onto the output.

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

Obligations that follow:

- **The record names WHICH LEVEL of the cascade was used**, not only that a machine acted —
  and per §4's correction, that Claude-account principal is named BESIDE the
  plane-credential principal, because they are two different principals and an act must
  say both (DEC-27(b), DEC-55.4). Never the token value.
- **When no token resolves at any level the capability is UNAVAILABLE and says so.** An
  honest absence, stated — never a silent no-op, which would be indistinguishable from a run
  that found nothing.
- **On a fallback instance the stakes rise, and DEC-43 should be read before deployment
  there** (SWEEP §6): AI-directed open-internet fetching under a root credential is the
  configuration that ruling exists to constrain.

**To MEASURE before building, not assume:** an agent loop spends most of its time waiting on
API responses and Workers bill CPU rather than wall time, so a whole run may sit well inside
the paid ceiling — or may not. It decides whether a fleet member can hold an entire run or
must be structured as many short invocations. → **D-218**

### Running sessions are visible in context — and this is CROSS-CUTTING

**Bob, 2026-08-05, and it is not investigation-specific.** A background session runs in a
CONTEXT and is associated with an inquiry or a project. Any window focused on any of
those objects shows **an animated indicator that a job is running**; clicking it opens the
**live transcript**. **The state of those objects does not change while the session runs**,
so there is no partial state to reconcile and no "come back later" notice is needed.

**The same applies to the Assistant and to every other AI-based function**, so this is a
GENERAL INTEGRATION SURFACE for AI sessions and should be designed once rather than per
feature — the way the fleet-member pattern was. The investigation session is its first
instance; DEC-52's approval sidebar (below) is its second consumer. `ASSISTANT-PILOT.md`
carries a pointer to this section, and **UI-38's scope should absorb this surface** or two
AI features will grow two surfaces (SWEEP §5a).

**TRANSCRIPT RETENTION — RULED, Bob 2026-08-06, now DEC-61 in the register: DEVICE-LOCAL,
with a TTL, AND deleted as part of the PUBLICATION process. Never in the record store.**
Bob's framing is what decides the shape: these are *"internal notes - like a reporter's
notes or internal deliberations… We've so far not identified any use for them. They need to
be protected from subpoenas."*
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
(§6.1) carrying what survives. That is the same split Claude Code runs on, where the session
is the thinking and the commit message is the durable account — which is why §6.1's
description is held to a commit message's standard: what changed and why, not what happened.

### The pursue session and the daemon — request, wait, post-process

**Bob, 2026-08-05:** a pursue AI that initiates a capture *"needs to be notified when the
capture is complete and given a reference to the document so that it can post-process it."*

So the cycle is **request → daemon captures → notify with a reference → post-process**, and
each half belongs to whoever already owns it: the AI identifies what is worth having and
what to make of it once it arrives; the store layer does the capturing, the OCR and the
extraction, preserving provenance through the path that already exists. **The request half
is §4's `capture_requests` table** — the AI's endpoint writes a row, the daemon drains it,
and DEC-47's conduct rules are enforced once, at the drain.

**The notification is not new machinery — and the id scheme v2 cited was wrong.**
`NOTIFICATIONS.md` catalogues *"a capture the member walked away from has completed"*
(D-61) among its ~30 generators, and proposes `N-<n>` ids — but no N-number exists
anywhere in source; the live vocabulary is FINDING-class slugs in `queuestate.mjs`, and
that is what this generator is (§7). A pursue session waiting on a capture is that
generator with a different subscriber — extend the subscriber, do not invent a channel.

**This substantially de-risks D-218, and is worth saying before the measurement comes back.**
A run has natural suspension points by construction: search → identify → request captures →
**wait on the daemon** → post-process → form versions. The run must be able to stop and
resume whatever the CPU ceiling turns out to be, because it has to wait on work it does not
perform. So "many short invocations carrying state" is **the natural shape of the work rather
than a workaround for a limit** — and the Durable Object with alarms that the plane already
runs is where that state lives. Whichever way the measurement lands, the resumable shape is
the one to build.

**What post-processing may WRITE: the MECHANISM is ruled; the yes/no is `[BOB-4 — RULED
2026-08-07, PROVISIONAL: Bob's mechanical-standing principle is recorded on DEC-52, pending
his confirmation; the sidebar approval (identify → present → member approves) remains the
act of record for the constitutive fields]`.** Bob:
*"it may be the AI that also scans the captured document for content and connections."*
Extracting what a document literally contains asserts little; identifying a CONNECTION is
closer to a constitutive statement — DEC-52's open question. Bob ruled the mechanism
2026-08-06: *"The AI should identify the connections it finds and present them in a sidebar
of the session… with the capabilities for users to approve them individually and in bulk"*
— the sidebar IS the running-session surface above, and bulk approval is the same act over
a set, not a weaker act. **What remains open is DEC-52's underlying rule** — may a machine
credential write the six constitutive fields AS ACCEPTED at all (the derived/constitutive
split preserved: `resolve` is derived and cheap to leave open; testimony and the
entity/alias/relation/progression/threading acts, the expertise pair hardest, are where
the fences go). This design is a reason to answer it, not a place to answer it.

### Evidence search may be a SUB-SESSION

**Bob, 2026-08-05:** the search for evidence may itself be a sub-session, or mechanical, and
it may go out to the internet.

This is the ephemeral-worker pattern: a sub-session is spawned for one job, reports to its
parent, and ends. The four levels — meaning, content, documents, the open internet — are the
natural fan-out.

**A search sub-session never touches the record — and never holds the bias.** It reads,
fetches through the request door, and reports back to the parent, which remains the only
thing holding a write and the only thing holding the manifest (§14). So the fence stays ONE
endpoint no matter how many sub-sessions a run spawns, and no sub-session needs a write
scope — or a lens — of its own.

**REACHING THE OPEN INTERNET IS ANSWERED — DEC-47, Bob 2026-08-06: the inquiry and the session
launch ARE the authorisation, for *"areas that anybody can go through."*** No per-fetch or
per-batch dialog. The prior recommendation (acquire only on an authored act, plans proposing in
bulk) was refuted: a member asked to approve forty URLs has not done the research and cannot
judge them, so the approval would add paperwork without judgement — and asking permission to
use the internet asks a member to re-authorise what opening the inquiry already authorised.
**What remains is CONDUCT, not authorisation, and it is enforced at the `capture_requests`
drain:** where "public" stops (logins, paywalls, a private individual's site), and how the
instance behaves out there (rate, volume, identifying honestly — the UA's contact URL is
MEASURED, not stylistic: removing it flips admission 200→403 uniformly, and `purpose`
distinguishes capture from monitoring, so an investigation fetch introduces or reuses a
purpose token deliberately — `SOURCE-ACCESS.md:133-169`). The structural gate costs nothing
and stays: the AI never fetches, it REQUESTS, and the daemon captures.

**`[BOB-3 — RULED 2026-08-07 (SWEEP §4c)]` — robots.txt and "areas anybody can go
through."** Measured: Oakland's
robots.txt carries 82 Disallow rules of which **63 are Public Ethics Commission
publications**, including sixteen years of annual reports. On this instance's most relevant
corpus, the conduct rule DEC-47 deferred decides whether the session can reach transparency
publications at all. This is doctrine — posture toward sources, and what "public" means —
not build detail. Nothing is built; no fetch happens. **RULED, 2026-08-07: robots.txt
disallows do not bar capture of publicly available documents, and the member-browser UA
from inquiry creation is permitted for these fetches (DEC-52; SOURCE-ACCESS.md amended).**

### What Claude Code's model maps onto, in one table

| Claude Code | the investigative AI |
| --- | --- |
| runs on your machine, not inside the forge | a fleet member in the group's own account |
| `settings.json` — routine pre-approved, consequential gated | the credential's declared scope: reads ungated, one write that can only suggest |
| gated acts interrupt a human | **stronger here** — accept and make-current have no op the AI can call |
| `CLAUDE.md` loaded every session, versioned in the repo | the skill's doctrine layer, and **the run records which skill version it ran under** |
| one session per worktree; sessions share no state | one run; runs share no state |
| an uncommitted change reaches nobody | a version reaches people because it is written; the conversation does not |
| the commit message | the version's description (§6.1) |
| review the diff | rotate between versions; comparison IS the diff |
| interactive, scheduled, or CI — one agent, three triggers | one agent, two modes (§10) |
| subagents for broad search, composed by the parent | evidence-search sub-sessions over the four levels, returning REPORTS |
| refusals surfaced verbatim, never worked around | refusals carry codes with canned translations (DEC-49); absence at one level is not absence at the next |

## 14b · THE RUN'S ARCHITECTURE — derived from Claude Code, grounded in what exists

**Bob, 2026-08-06: build the best-of-breed architecture, learning from Claude Code.** This
section is the result of a rigorous pass over the repo. Three findings change the design
materially; the rest is Claude Code's structure mapped onto machinery BIO already has.

### 1 · CONTEXT ECONOMY — the largest gap in the design as written, and it was absent

Everything above says the session "reads the project." **A run cannot hold a project.** A
project with forty inquiries and thousands of captured documents exceeds any context
window, and a design that does not say how it copes will discover this on its first real
corpus.

Claude Code's answer is three mechanisms, and all three transfer:

- **Sub-sessions return REPORTS, not their reading.** A search sub-session reads widely
  in its own context and hands back what it found — never the documents. This is why §14a's
  fan-out is not merely a speed optimisation: **it is the memory model.** Without it a run
  drowns in its own evidence.
- **Query, never load.** The run holds the inquiry, its versions and its working set.
  Everything else it reaches by asking. The store is the memory; the context is the
  workspace.
- **Progressive disclosure.** The skill's doctrine layer is always resident; its recipes,
  vocabularies and per-format knowledge load when the run reaches work that needs them.

**The consequence for the fan-out is a rule, not a preference: a sub-session that returns
documents rather than reports has defeated the architecture.** Its contract is a REPORT with
a citation, and the parent re-reads by address if it needs the bytes. The same contract is
where §14's fence lands: the spawn payload carries no bias manifest, by construction.

### 2 · THE READ SURFACE HAS A HOLE, and it is exactly where the session lives

Measured in `STORE-AS-CACHE.md` and re-verified by the sweep (MEASUREMENTS.md, 2026-08-07):
BIO has **two retrieval routes**, and the session needs both while only one has a query
surface.

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
forming a version of an inquiry's basis is meaning-layer work. As written, §3's read scope is
not achievable: the session can see that a conclusion scores 0.7 and cannot see what it rests
on.

**So a meaning-layer read surface is a PRECONDITION of this design, not an enhancement.**
Recorded as **D-222**. Whether it becomes an extension of the query compiler or a second
addressable surface is graded in §14c; that it must exist before the session can do its job
is not open.

**AND D-164 IS THE SECOND PRECONDITION, DECLARED RATHER THAN DISCOVERED** (SWEEP C15).
Legs are DOCUMENT-GRAIN today: every edge in the system — legs, citations, connections —
addresses a whole capture or bundle, and DEC-23 requires extent and extraction method on
every content leg, which nothing can yet express. Until D-164's content-extent primitive
lands, this design says so honestly: **versions compose document-grain legs, the passage
lives in the version's description, and the record cannot yet cite the sentence.** A
version written before D-164 does not overclaim — its legs say "this document," not "this
passage" — and the description carries what the leg cannot. (Beside it, D-168: `op=cite`
is type-only, so RETIRED information is citable — which is why §14b.5's reachability check
checks the address, not just the type.)

**And D-220's version join belongs to the same gap**: sixty document versions read as sixty
documents is the identical false-coverage failure one axis over.

### 3 · RESUMABILITY IS ALREADY BUILT, and joining it is a documented step

§14a established that a run must suspend and resume — it waits on the daemon for captures it
requested, whatever the CPU ceiling turns out to be. **The mechanism exists and the repo tells
the next consumer how to join it.**

`SCHEDULER.md` records the decision: ONE reconciling Durable Object alarm with a consumer
registry, `#schedConsumers(probe)`, each entry `{ name, due(now), wake(now), tick(now) }` —
**SEVEN live consumers today** (`store.mjs:1452`), ticks may be async and are awaited.
Three properties matter here and all three are already proven:

- **No starvation** — the reconcile keeps EVERY active consumer's wake, not only the one that
  just ran, so a fast consumer cannot shut out a slow one.
- **Self-termination** — an idle instance carries no timer and spends nothing, which the
  sovereign-instance distribution model needs since most instances sit on the Free tier.
- **Locality** — the consumer runs beside the DO's own SQLite, which is where a run's state
  lives anyway (§11's `capture_sessions` shape).

The file's own instruction is explicit: *"To add the monitoring / eligibility / cadence /
ageing consumers: append an entry to `#schedConsumers`… Do NOT add a second alarm or a cron;
that is the decision this file records."* **The investigative run is one appended entry.** It
needs no new scheduling machinery, and building one would violate a recorded decision.

### 4 · WHAT IS SCRIPTED AND WHAT IS JUDGED

Claude Code's clearest structural lesson: **do not let the model decide control flow that
should be guaranteed.** Loops, fan-out and gates are deterministic; judgement happens inside a
step. (The evidential case is measured, not stylistic: TREC 2011 found searchers estimating
their own recall erred by up to +95/−87 points and terminated review prematurely on a false
belief of high recall — the model never decides when the loop stops.)

| deterministic — code, not skill | the model's judgement |
| --- | --- |
| how many search passes, and when the loop stops | what to search for |
| the fan-out across the four levels | what each level's reports mean |
| a version is written in `suggested` and no other state | what the version says |
| dedup against existing versions before writing | whether this reading differs in substance |
| the observation log is written whether or not the run succeeds | where it stopped and why |
| every machine fence | — |

**The gates must not depend on the skill behaving well.** A skill is instructions; a fence is
code. Where this design says the AI "may not" do something, that must be a refusal in the
plane, not a sentence in a prompt — which is DEC-55's endpoint-is-the-fence, restated as a
build rule. **And every refusal this design promises "BY NAME" is a C-number in the check
catalogue** — the IS work allocated none in v2, and each IS item now allocates its
C-numbers at build, same as every other gate (§18).

**The skill's own prohibition set comes from the practice survey and is not restated by
each build session** (SWEEP §3): no generated justification anywhere — a generated one is a
fabricated attribution; the one permitted auto-composition is assembling the member's OWN
prior words; no single confidence score; no connection-density ranking; machine-proposed
connections never presented as connections.

### 5 · THE RUN VERIFIES ITS OWN WORK BEFORE PROPOSING — and the checks are the PLANE'S

Claude Code runs the tests and reads the output rather than declaring success. The session's
equivalent is deterministic and cheap, and it runs on every version before it is written.
**The checks run PLANE-SIDE** (SWEEP C11): if the fleet member computed them it would hold
a copy of the plane's rules — the drift class DEC-8 closed — so they live in code beside
the endpoint, and the fleet member merely receives their verdicts. **Each carries a NAMED
ERROR CODE with a canned translation, and an untranslated code fails the harness** —
DEC-49's guard, not optional; the design mints new member-facing conditions and every one
ships with its code. The checks:

- every leg cites something that **exists and is reachable at the address given** — beyond
  type, because `op=cite` is type-only today and a type-only check would pass RETIRED
  information (D-168);
- the strengths **compute** — the version's arithmetic runs PER AXIS over its declared
  ground partition and produces a pair;
- the version **differs in substance** from every existing version (Bob's rule), which is
  the same check that prevents duplicate churn;
- **OR-branches pass the independence check** (D-195) — content-addressed provenance lets
  the plane DERIVE that two branches' legs share an upstream origin, and surface it. An AI
  composing OR-branches at volume is *"the Judith Miller error with arithmetic behind
  it"*; derived informs, authored binds — the check surfaces, the member decides at §12's
  accept ceremony;
- **nothing in it is boilerplate** — a version whose description or reason field is
  placeholder text is not proposed. The placeholder defect is already measured at human
  speed (`counterparty: to be named` satisfying a non-empty check, `PROCESS-INVENTORY`);
  an AI filling required fields to clear a gate is the same defect at machine scale;
- nothing in it is in a state the session may not write.

A version failing any of these is not proposed, and the refusal is by C-number. This is a
check, not a judgement, so it belongs in code beside the endpoint rather than in the skill.

### 6 · A RUN IS BOUNDED, AND THE BOUND IS RECORDED

An unbounded run over a large project is the failure mode a background job invites. A run
carries a budget — fetches requested, sub-sessions spawned, wall time across resumptions — and
**when a bound stops a run, the observation log says which bound and where it stopped.** That
is the same discipline `heldMatch` learned the hard way: *not found* and *did not finish
looking* are different facts, and only one of them is a licence to conclude anything.
**The record already has the word and lacks the writer**: `runtime-ceiling-reached` exists
in the condition vocabulary with NO producer (`queuestate.mjs:82`) — IS-9(d) builds that
producer rather than minting a new kind.

### 7 · PARTIAL RESULTS SURVIVE

A run that dies halfway must not lose what it found. Versions are written as they are formed
rather than in one batch at the end, and the observation log is appended as the run goes.
A resumed run reads its own log and continues rather than restarting — the same property that
makes Claude Code's workflow resume cheap, and the reason §6's version identity (frozen,
uniquely named) matters operationally as well as conceptually.

## 14c · D-222 — THE OPTIONS, GRADED

**Researched 2026-08-06 across four parallel sub-sessions** (query compiler, meaning-layer
tables, versioning surfaces, op/interface conventions). Every option below was re-confirmed
against source rather than reasoned about; the constraints each must clear are measured, not
asserted. The counts (34 fields, 5 FTS columns, six statement builders) were re-verified by
the sweep and recorded in `MEASUREMENTS.md` (2026-08-07, the consistency sweep); the
compound ceiling and the facet timings are pinned as MEASURED comments at their source
(`query.mjs:588`, `:155`).

### What must hold, whichever option wins

| constraint | why, and where it is enforced |
| --- | --- |
| **ONE compilation point for visibility (D-15)** | `viewerPredicate` (`query.mjs:189`) is the only one, and `Store#runQuery` **throws** if a statement reaches the store without `GATE_MARK`. Not a convention |
| The gate is a **WHERE predicate, not a CTE** | measured: 283 ms against 5 ms for a facet sidebar at 20,000 bundles (`query.mjs:155`) |
| **A meaning-layer answer is a CANDIDATE LIST**, so REC-36's stricter rule applies | most reads redact a back-reference; a candidate list **withholds the whole row**, because even a nameless candidate discloses that something mentioning the subject sits in a project the viewer was not invited to |
| **Envelope, never a bare array** | `bounds.test.mjs` pins the bare-array exception at **exactly one op**; a second one fails the suite (IC-24, proposed not landed) |
| `limit` means the cap **actually applied**, and truncation is said in the op's existing vocabulary | REC-57 / IC-23, roster read off the source by a walk rather than listed by hand |
| Hidden and absent answer **identically**; a published `total` is gated with the rows | *"a total larger than the pages says something is hidden"* |
| **MAX_COMPOUND = 4** | workerd's compound-SELECT ceiling is **FIVE**, not SQLite's documented 500 — found by the 2026-07-25 scale bench, pinned as the MEASURED comment at `query.mjs:588`; six ordinary filters already reach it |
| Every arm keys on `fts_id` | a bundle not text-indexed is invisible to every arm; a new arm must join back through `bundles.fts_id` or it will not compose |

### The options

**A · A new SET-ALGEBRA ARM in the compiler** — e.g. `leg:hunch`, `resolves:>=B`, `concerns:ENT-1`.
*Viability CONFIRMED*: `setSql` dispatches on node type and every leaf returns `{sql,args,compound}`; **all five meaning tables carry `bundle_id` with an index**, so the join exists. The `ids` arm is the precedent for adding a whole CTE arm, and its comment is the argument for doing it here: *"an ARM of the query, not a filter applied after it… it passes the viewer gate, it obeys the sort, and it is executed by the one guarded executor."*
- **For:** composes with every existing operator, sort, paging and facets for free; no new gate; no new answer shape; `op=search` simply gains vocabulary; **discharges D-223 immediately** (*which inquiries carry a hunch leg*).
- **Against:** **grain collapse** — it selects BUNDLES, so you learn which inquiries, never which legs; each arm spends one of only four compound terms; grade columns are **unindexed**, so a grade predicate scans until an index is added.

**B · A SECOND ADDRESSABLE SURFACE beside the compiler.**
*Viability: possible, and it costs a ruling.* `query.mjs:701-705` says a selection resolved by another route *"would be the second query path this design exists to prevent"*, and D-15 gives visibility exactly one compilation point enforced by a throw. A second surface either duplicates the gate — forbidden in spirit and the one place the graph could escape — or imports `viewerPredicate`, at which point it is not separate.
- **For:** preserves grain natively; no compound-term pressure.
- **Against:** contradicts two standing decisions; ~24 ops to reconcile. **Not recommended.**

**C · A new STATEMENT SHAPE on the SAME compiler, returning meaning-grain rows.**
*Viability CONFIRMED*: `compile()` already returns six statement builders registered in one place (`{page, count, ids, snapshot, facets, facetScan}`, `query.mjs:827`; MEASUREMENTS.md 2026-08-07). A seventh projects the meaning rows belonging to the bundles already in `scope`, using the `ranked` CTE as the template for per-row payload.
- **For:** **preserves grain** — returns the legs and resolutions themselves; same compiler, same gate, same executor, so it is *not* a second query path; scope stays bundle-shaped, which is exactly what keeps gating correct.
- **Against:** more work than A; needs one new op to expose it (additive to I3).

**D · HYBRID — A for SELECTION, C for GRAIN.** The arm chooses the set; the statement shape returns the meaning rows in it. Together they answer *"every hunch leg in this project, with its role and its partition."*

**E · MORE PER-QUESTION OPS, following the existing pattern.**
- **For:** cheapest; matches a coherent house pattern (one op per question, single key, derived on read, `{ok, key, count, rows[]}`); zero compiler risk.
- **Against, and it is decisive here:** the pattern's defect *is* that the ops do not compose, and **the investigative session's questions are not knowable in advance** — which is what distinguishes it from every existing consumer. Enumerating ops for an agent that formulates its own questions is a category error. It also grows a 131-entry table (MEASUREMENTS.md 2026-08-07) one question at a time.

### RECOMMENDATION — **D, staged as A then C**

1. **A first.** Small, composable, no new answer shape, and it discharges D-223 — the enumeration of hunch debt that the schema calls publication-disqualifying — at inquiry grain, which is the grain a group asking *"what is our exposure?"* actually wants. Add the missing index on any grade column the arm filters, or measure and record why not.
2. **C second**, when the session needs the legs themselves rather than the inquiries carrying them. This is the half the investigative session genuinely blocks on.
3. **Not B.** It buys grain at the price of two standing decisions, and C buys the same grain without them.

**Related finding, now a debt row (D-225):** the existing meaning-layer reads — `concerns`, `resolutions`, `connections` — are **uncapped**, which is why they never appeared on REC-57's bounded-ops roster. Whatever lands here must bring them onto the same footing BEFORE a capped new surface lands beside unbounded siblings — an uncapped legacy read next to a capped new one is the inconsistency a caller will build against.

**Interface work:** I3 (RECORD's) — additive, minor bump, IC entry recorded even though I3 says adding an op needs no protocol, because IC-3's settled reasoning is that recording a break as additive *"would teach this registry to lie"*. I5 is untouched unless the grade index lands, which is a schema change.

## 15 · Instruments — measure from the first run

- **Does a run ever come back with nothing supportable?** If it never returns empty it is
  manufacturing. The cheapest single signal that any of this works — and it now has an
  OBJECT: §9's *this level is empty* kind is what an honest empty-handed run emits, so an
  empty run and a silent failure are distinguishable. This instrument is also acceptance
  on IS-9, and its negative control is §18's seventh.
- **Accepted-to-suggested ratio over time.** If versions outrun review, an inquiry is
  accumulating accounts nobody has read — each correctly labelled, the whole unexamined.
- **The rejection record read as a pattern**, which is §1's third argument's evidence —
  and the reason prune HIDES (§6.3a): the pattern is computable only because the acts
  persist.
- **Where the run stopped and why** — the observation log, including which bound (§14b.6).

## 16 · Positions taken and WITHDRAWN

| withdrawn | why it fell |
| --- | --- |
| *If the AI proposes claim, evidence, reasoning and falsifiers, nothing is left for the member to author that is expensive to fake.* | Collapses **suggesting / authoring / committing** (Bob). Critique is authorship. |
| *A proposed leg may not rest on an unaccepted claim.* | A prohibition on structure where the concern was arithmetic. Hiding a basis makes review shallower, and BIO **labels and discloses** rather than prohibiting and hiding. |
| *A session that knows the bar can optimise toward clearing it.* | Only if the evidence supports it, which it cannot. |
| *A state for a published finding with unreviewed evidence against it.* | A published case cannot be affected. |
| *A new state-fence primitive is required.* | The endpoint is the fence. |
| *Claims recorded as agreeing or disagreeing along a range.* | Bob's contract pair does not disagree — together they narrate, and relevance depends on the question asked. |
| *SUPPORT / UNDERCUT / REBUTTAL as three stored objects.* | **Reductionist** (Bob): one sentence can do all three at once against different claims. Roles are not types. Replaced by §5 — the AI shapes the legs; the record holds no relationship taxonomy. |
| *Recording that a run reproduced an existing version, as corroboration.* | **Withdrawn by this session.** Two runs of the same skill over overlapping evidence are heavily correlated, so their agreement is weak evidence, and recording it as corroboration would dress up something that is not one. |
| *Versions belong to a CLAIM object.* (v2, withdrawn by the sweep) | A claim has no object identity — DEC-32's citability test withheld it and Case Making ruled claim = a field of an inquiry. A versioned, named, stateful claim object rebuilds the multiplicity D-127's collapse removed. Versions attach to the inquiry's basis (§3). |
| *A requested capture is attributable to the instance's ordinary path "rather than to an agent".* (v2 §4.1) | DEC-27(b) requires the record to state BOTH — the agent and the principal — and DEC-55.4 adds the token identity. They could not both be true; DEC-27(b) wins (§4). |
| *"Effective strength" as one number over the current version.* (v2 §12) | The refused single number — DEC-21/DEC-44's four refusals: a PAIR over two populations, never composed; and stating the calculation without DEC-32's MIN/MAX re-shipped the flat-AND basis REC-42 corrected. |
| *Prune DELETES ancestor versions.* (v2 §6.3a) | Collided with D-214's the-acts-must-persist and DEC-16/19's never-vanishes-silently. Prune hides; display shrinks, acts remain (§6.3a). |
| *Bias handled as a requirement on the skill.* (v2 §14) | The design's own §14b.4 rule: a skill is instructions, a fence is code. The lens rule is structural — the search half never receives the bias. |
| *Notifications carry stable `N-<n>` ids.* (v2 §14a, §17) | No N-number exists anywhere in source; the live vocabulary is FINDING-class slugs in `queuestate.mjs`, fenced by `classOfKind`. |
| *Sub-sessions return "findings".* (v2 §14b) | Three senses of the record's unit of truth (D-226). A sub-session returns a REPORT. |

**The pattern behind the first five:** the same worry — *the AI might produce something the
evidence does not support* — re-derived against each new input. Excluded by the objective and
the structural gates, not by vigilance. **The pattern behind the next two, which is worse:**
the session was doing safety engineering where the question was epistemology, and then
schema design where the question was judgement. Both times the answer was that the
intelligence belongs in the AI's work, not in a structure the record computes over.
**The pattern behind the v3 rows, and it is the sweep's one-line verdict:** the design
re-derived nouns and rules the register already held, and every re-derivation drifted —
the correction each time was to CITE the ruling, not to reconstruct it.

## 17 · What is NOT settled — and what was settled since v2

1. ~~Leads for other inquiries have no home.~~ **ANSWERED 2026-08-06 by Bob: discovered
   evidence not related to the current inquiry is CAPTURED and recorded as an ACTIONABLE
   NOTIFICATION the member can act on later.** A FINDING-class slug with a producer, a real
   `basis`, and `options[]` — whose natural options are inquiry-grain acts that do not yet
   exist, the D-222 grain problem one surface over; its `case` set derives from inquiry
   B's ancestors, not A's. It composes correctly with §4: the document is CAPTURED (entry
   to the store, not to any basis) and the observation becomes the notification.
   → **D-213, answered; closes when the slug lands**
2. ~~Whether a version carries the conditions it was formed under.~~ **ANSWERED — ruled
   for the bias component before it was asked** (`Content_Framework:1129-1141`; SWEEP
   §1.2), and the run object carries the rest by construction (§11). → **D-215, closed**
3. **Whether sharing is stronger in the data model than the edge association found**, which
   would force cloning after all (§7). A check against the model for IS-3's builder, not a
   decision. → **D-216**
3a. **Whether a fleet member can hold a whole run** inside the paid CPU ceiling (§14a).
   De-risked — the resumable shape is the one to build either way — so the measurement
   sizes the work rather than deciding its shape. → **D-218**
3b. ~~Egress~~ **ANSWERED — DEC-47, 2026-08-06** (§14a): the inquiry and the session launch
   are the authorisation for public sources. What remains of conduct is enforced at the
   `capture_requests` drain — except **robots.txt, which is `[BOB-3 — RULED 2026-08-07:
   disallows do not bar capture of public documents]`** (§14a).
4. ~~Review burden.~~ **ANSWERED** — D-217a's derivation tree with the prune offer (§6.3a,
   prune hides per SWEEP §4b), plus the proposal rules: aggregate never multiply, age
   never vanish, reasons on deferral and dismissal (§6.4). → **D-217, answered**
5. ~~Whether a reworded claim is a new version or a new claim.~~ **ANSWERED** — user
   selectable, D-217b (§6.3b).
6. ~~Pruned-alternatives disclosure.~~ **`[BOB-2 — RULED NO 2026-08-07]`** — the published
   case carries the current version only, no disclosure of hidden alternatives (§13).
7. **`[BOB-4 — RULED 2026-08-07, PROVISIONAL]`** — DEC-52's remaining yes/no: Bob's
   mechanical-standing principle recorded on DEC-52, pending his confirmation; the sidebar
   approval remains the act of record for the constitutive fields (§14a).
8. **D-84** — the bias object type, now named as the second unbuildable read's precondition
   (§3): until it lands, "no manifest was in force," stated, is the only discharge.
9. **D-222 / D-164** — the two declared preconditions (§14b.2).

## 18 · Decomposition — HANDED OVER 2026-08-07 and ENACTED

**~~Bob, 2026-08-05: hold the handover until the integration architecture is finished. The
`BOB INBOX` says so and instructs CONDUCT not to schedule any of it.~~ SUPERSEDED — the hold
was LIFTED by Bob 2026-08-07 and CONDUCT drained the entry and enacted this section the same
day. Corrected here in the same turn rather than left standing, because §18 is exactly what
an IS worker reads and the struck sentence would have told them to stop.** The items are in
`QUEUE.md` under RECORD, keeping their `IS-` ids so each traces back to this section by name
— placed there rather than in a new area because a second area would contend for `store.mjs`
with RECORD, which is the one thing a `CLAIMS.md` claim cannot protect against. Preconditions
queued ahead of them: REC-60 (D-225's caps), REC-61 (D-220's join), REC-62 (D-222 staged A
then C), and REC-59 before any new IS op. Milestones per the
2026-08-07 placement (MILESTONES.md M9 note): **IS-1/2/4/7 are M9; IS-5/6/9 are M9
substrate; IS-3 and the running-session surface are M8 (UI-38 should absorb the latter);
IS-8 is M10.** Sequencing per §2: the CHECK mode deploys first; REC-59 lands before any
new IS op (the bare-array pin allows exactly one exception — the op REC-59 fixes); D-225's
caps land before D-222's new surface. **Every IS item allocates its C-numbers at build**
— every refusal below that says "refused" is a named check in the catalogue with a DEC-49
error code and canned translation.

| piece | what it is | acceptance ALSO carries (§14b) | depends on |
| --- | --- | --- | --- |
| **IS-1** | **Versions of the inquiry's basis**: an inquiry carries many; frozen once written; unique name per inquiry; description required; ground partition + AND/OR relationship carried (§3, §12); derivation tree via `derived_from` (its first real producer) with the HIDE-only prune offer; reword user-selectable (§6). Builds on `basis[]`/`inquiry_basis` through `promote`'s one write site — no second version table. | version identity survives a run's death (§14b.7); D-226's vocabulary resolved before scheduling | none |
| **IS-2** | The **state machine** over versions — the SIXTH machine, stated as such; four states, reversible, every transition a member act with the four beats, reasons on rejection/deferral/dismissal, machine identity refused on each; proposals aggregate and age (§6.4); publishes through `op=affordances`. **NC, corrected 2026-08-07 — the first draft would have passed VACUOUSLY** (`VERIFICATION.md` rule 3a: a rule enforced in N places carries an assertion at EACH place, and an `ai` credential refused at the CREDENTIAL layer absorbs the control before the transition refusal ever runs). The fence lives in three layers — credential scope (IS-5), endpoint (IS-4), transition (IS-2) — so the control breaks EACH layer with the others held open and requires THAT layer's own assertion to fail. | **every fence is CODE, never a line in the skill** (§14b.4); depends on D-78's `surfaced_by` fix being real | IS-1 |
| **IS-3** | **CURRENT as a project-to-inquiry property** (§7) — a dated frontmatter field beside `required_strength`, never a settings row — with the shared-inquiry notifications as FINDING-class slugs. | — | IS-1, D-216 |
| **IS-4** | The **suggest endpoint** — §9's kinds including *this level is empty*, sole possible output a suggested version, carrying its run. One write path for both modes. | **the pre-write checks of §14b.5, PLANE-side**: reachable-at-address legs, per-axis computation over the partition, differs-in-substance, D-195 independence over OR-branches, no boilerplate, no unwritable state — each with a C-number, an error code and a canned translation (DEC-49); **NC: remove any ONE refusal and its suite fails** (owed control 6) | IS-1, IS-2 |
| **IS-5** | The **`ai` credential's investigative scope**: reads across the project under a STATED viewer (§3), writes only IS-4 and `capture_requests`. | **NC: DEC-55.5 whole** — mint an `ai`-class credential, assert every `MACHINE_CANNOT_*` refusal fires BY NAME, **and that removing the predicate makes them all pass** (owed control 1 — the second half was never run) | IS-4 |
| **IS-6** | The **run object and its observation log** (§11), on the `capture_sessions` shape — scratch, ticks, expiry, resumable; log never in `bundle.md`; D-129 vocabulary, D-104's governed/unreachable split, shell captures `LOOKED_INDETERMINATE`. | the log is written **whether or not the run succeeds** and **names the bound that stopped it** (§14b.6); **NC: a run KILLED mid-flight whose log must exist and name the bound** — the failure path is the only one that matters | none |
| **IS-7** | **The strength PAIR over the current version** — per axis, MIN/MAX per DEC-32, the state-set argument, the state set on the return, ungraded legs inert-and-named, hunches excluded, what-if in-band (§12). | **NC: DEC-40's** — produce a what-if rendering, strip its filter/state-set line, the harness fails (owed control 3) | IS-1 |
| **IS-8** | **The published case per §13** — the container carries each included finding's current version with its ground partition, description, NAME in DEC-34's header, and DEC-54's policy pin; `[BOB-2 — RULED NO 2026-08-07: current version only, no disclosure of hidden alternatives]` — resolved. | **NC: DEC-44's** — publish a case of two findings with differing strength pairs; the harness fails if any surface presents a single case-level strength (owed control 2); **NC: DEC-34's** — a page rendered without the header, now including the version name, fails (owed control 4); **NC: DEC-46(a)'s** — a carried-forward bias acknowledgement fails (owed control 5) | IS-1, IS-3, D-187, DEC-59's elements, the DEC-33-blocked ceremony |
| **IS-9** | **THE RUN HARNESS — the run's execution model**: fan-out to evidence sub-sessions, resumption, budget; the CHECK mode is its first deployment (§2). | **(a)** a sub-session returns REPORTS, not documents (§14b.1), ENFORCED at its return contract — **NC: neuter the check and a document-returning sub-session must fail an assertion**; **(b)** the run **queries and never loads** the project; **(c)** it joins `#schedConsumers` per `SCHEDULER.md` as ONE appended entry — **no second alarm and no cron**; **(d)** it builds the `runtime-ceiling-reached` producer and exhausting a budget is RECORDED, never silent; **(e)** versions are written as formed, never batched; **(f)** the spawn contract carries no bias manifest (§14); **NC, the objective's own (owed control 7): feed a run an inquiry the evidence does not support and assert it proposes nothing — an empty-handed run emits §9's empty-level kind and no version** | IS-1, IS-6 |

**Cross-cutting, belonging to no single item and checked on all of them (§14b.4):** control
flow is deterministic and judgement is the model's; a gate is code and never a sentence in a
prompt; every refusal carries a C-number and a DEC-49 code; and **a sub-session that returns
documents rather than reports has defeated the architecture** — a review criterion, not a
preference.

**THE SEVEN OWED NEGATIVE CONTROLS (named 2026-08-07, from the sweep — the battery's
register is 105/105 declaring, MEASUREMENTS.md 2026-08-07, and undeclared suites would be
its first regression), each placed on its owner above:** (1) DEC-55.5's second half →
IS-5; (2) DEC-44's two-finding case → IS-8; (3) DEC-40's strip-the-filter-line → IS-7;
(4) DEC-34's page-without-header → IS-8; (5) DEC-46(a)'s carried-forward acknowledgement →
IS-8; (6) the pre-write checks, one refusal at a time → IS-4; (7) the objective's own
control → IS-9. Every IS item ships a `NEGATIVE CONTROL:` line; any new op carries a
control-plane assertion in the same turn.

**PRECONDITIONS ON THE WHOLE SET: D-222 AND D-164** (§14b.2) — the meaning layer must be
readable and, until D-164 lands, versions compose document-grain legs and say so. **D-84**
preconditions the bias half (§3). D-225's caps land before D-222's surface.

IS-1 is the spine. IS-6 is independent of everything, is the one unblocked start (it
discharges D-196 and makes §15's instruments computable), and IS-9 is what makes a run
survive contact with a real project.

## 19 · The final Claude Code comparison (2026-08-07)

**Session BOB, against the fourteen practices Claude Code actually integrates by.** Read
under DEC-52's final ruling: the machine may rule — constitutive acts machine-writable and
machine-attributed, the sidebar review, not a gate; the §4 version fence is untouched.

| # | Claude Code practice | verdict | where / what is missing |
| --- | --- | --- | --- |
| 1 | separate process, same interface as a person, no privileged hooks | **CONFORMS** | §14a — fleet member in the group's account; the plane grows no model runtime; DEC-55's endpoint surface |
| 2 | permission tiers; the gate is the HARNESS, never model self-restraint; denied = adjust, never retry verbatim | **GAP (partial)** | the gate half CONFORMS and is stronger (§4 — no accept op exists; §14b.4 — a fence is code; IS-2's three-layer NC). Missing: (a) §14a's `[BOB-4]` tier text is stale against DEC-52's final ruling (F9); (b) no denied-adjust rule — nothing tells the run what it must do after a plane refusal, so a verbatim-retry loop is caught only by the budget (F10) |
| 3 | context economy: sub-agents return conclusions, query-never-load, progressive disclosure | **CONFORMS** | §14b.1 — all three, verbatim; a document-returning sub-session fails IS-9(a)'s NC |
| 4 | versioned doctrine loaded every session; the run records which version | **CONFORMS** | §14a table; §11 — the run records the skill version it ran under |
| 5 | deterministic policy enforcement outside the model at lifecycle points, unskippable | **CONFORMS** | §14b.5 pre-write checks PLANE-side at the one endpoint; conduct enforced at the `capture_requests` drain (§4); the log written by code whether or not the run succeeds (IS-6) |
| 6 | tools small, orthogonal, typed; refusals as structured data | **CONFORMS** | §14c option D — composable vocabulary over per-question ops; every refusal a C-number with a DEC-49 code and canned translation (§14b.5) |
| 7 | verification loop: run it, READ it, never declare success unverified | **CONFORMS** | §14b.5 — the run verifies before proposing; a failing version is not proposed |
| 8 | resumable sessions; local transcripts; compaction without losing working state | **CONFORMS** | §14b.3/§14b.7 — `#schedConsumers`, resumed run reads its own log; transcripts device-local with TTL (DEC-61, §14a); the store is the memory, the description the durable summary |
| 9 | isolation: parallel workers, one session per tree, merge through one channel | **CONFORMS** | §14a fan-out — sub-sessions hold no write and no lens; one write path for both modes (§10) |
| 10 | background tasks notify on completion, never polled | **CONFORMS** | §14a — request → daemon → FINDING-slug notify → post-process; extend the subscriber, not a channel |
| 11 | plan mode: propose-before-act; the human approves the plan, not each keystroke | **CONFORMS** | approval sits at the launch (DEC-47 — the inquiry IS the authorisation) and at acceptance (§4); per-plan bulk URL approval was considered and REFUTED by ruling, and the accept gate is stronger than plan mode |
| 12 | machine work stamped as machine work, never the human's | **CONFORMS** | §4 — daemon-at-the-session's-request, both principals named (DEC-27(b), DEC-55.4); D-82's look-derived (§6.4); DEC-52's ruling itself carries machine attribution |
| 13 | escalation discipline: ask only the human's own; provisional over blocking; report failures faithfully | **CONFORMS** | §9's empty-level kind, §11's failure-path log, honest absences stated (§3, §14a); SWEEP §4b — four of seven resolved without blocking on Bob |
| 14 | cost/budget visibility: effort bounded, the bound visible | **GAP (partial)** | bounded and recorded CONFORMS (§14b.6; IS-9(d) — `runtime-ceiling-reached` gets its producer). Missing: the bound is visible only in the log after the fact — no member-facing budget at launch and no live spend on the running-session surface (F11) |

Twelve of fourteen conform, several by construction stronger than the practice they mirror
(no accept op beats a permission prompt). The two partials name three narrow gaps.
**F9** — §14a's `[BOB-4]` provisional is superseded by DEC-52's decided entry; rewrite the
paragraph to the register (machine may rule; sidebar review, not gate; version fence
unchanged). **F10** — the design specifies how the plane refuses, never how the run must
respond: IS-9 needs the denied-means-adjust rule as a deterministic-table row, and IS-4's
refusal should make a verbatim resubmit a structural no-op rather than churn. **F11** —
§14b.6's budget is recorded, never shown: the running-session surface (UI-38's absorbed
scope) should carry the budget and its live consumption, since which account pays is
already named on the record. Nothing found contradicts a standing ruling; no N-A rows.
