# Decisions for Bob: the return channel

Established 2026-07-31 at Bob's direction. `QUEUE.md`'s `BOB INBOX` carries changes
DOWN from the BOB session to CONDUCT. **This file carries questions UP.** Without it
the channel ran one way: a worker or CONDUCT raising something architectural had to
put it in CONDUCT's own session window, which is the wrong room to discuss it in and
leaves the reasoning in a transcript rather than in the record.

## How it flows

1. **A worker or CONDUCT raises a decision item** at the close of its turn, in the
   shape `kickoffs/README.md` defines. CONDUCT is the SOLE WRITER of new entries here
   — it lifts a worker's item in at integration, applying the three tests first, so an
   item that the repository already answers never reaches this file.
2. **The BOB session surfaces every `open` entry** at the start of its turn and again
   at the close. Bob discusses it there, where the architecture context is.
3. **The BOB session writes `response:` and `decided:`** and sets the entry to
   `answered`. It does not enact.
4. **CONDUCT drains `answered` entries** as part of its loop, exactly as it drains the
   inbox: it enacts the answer, records `enacted:` with the commit AND the document
   that now carries the REASONING, and the entry stays forever as the record of why.

An entry is never deleted. This file is append-only and the status line is the one
thing that changes, on the `DEBT.md` precedent — the history of what was asked is
worth as much as the record of what was answered.

## Two rules that keep this from becoming a bottleneck

**AN OPEN DECISION NEVER BLOCKS WORK.** Bob's standing instruction, 2026-07-31: never
block on getting his answer when the work can proceed. So every `open` entry MUST
carry a `provisional:` line saying what is running in the meantime — and if the
honest answer is that nothing is blocked, it says that. An entry with no provisional
is a session that stopped, and `plancheck` refuses it.

The corollary from `kickoffs/README.md` still governs: **ship a provisional only when
it is cheap to reverse.** If the provisional would be expensive to undo, the right
move is not to run it and ask — it is to run the CHEAP alternative and say so.

**ONLY WHAT IS ACTUALLY BOB'S GETS IN.** Apply the three tests before writing an
entry, not after: it is not a decision if the repository or a standing ruling already
answers it; it is not a decision if the raising session is better placed to make it;
and it is not a decision item if it cannot be acted on without reading the diff.
Activation order, sequencing, mechanism, scoping and which item runs next are NOT his
— ruled explicitly on 2026-07-31. What is his: **doctrine** (what the record means and
may claim), **risk carrying his name** (legal, the City), **effects on people outside
the project**, and the gated mechanical acts.

An empty file is the healthy state.

## Entry format

    ### DEC-<n> · <open | answered | deferred | enacted>
    raised:       <date> · <who>
    for:          <bob | bob-session>   see "Who an entry is FOR", below
    question:     <one line, in the terms of the RECORD, not the code>
    why it is Bob's: <doctrine | risk he carries | outside effects | a gated act>
    provisional:  <what is running NOW — REQUIRED; "nothing is blocked" is valid>
    blocks:       <queue item ids, or none>
    alternative:  <the other option, stated fairly enough that choosing it is easy>
    recommendation: <the raising session owes a view>
    reversal cost: <and whether it rises once data exists under the current choice>
    trigger:      <REQUIRED if deferred: the condition that reopens it>
    response:     <the answer — written by the BOB session>
    decided:      <date>
    enacted:      <commit · and the document that now carries the reasoning>

## Who an entry is FOR, and why CONDUCT does not have to get that right

Added 2026-07-31, within an hour of the file existing, because CONDUCT immediately
raised something real that was NOT Bob's: two sessions sharing one working tree. It
went to Bob's ear because this file only had one destination.

So an entry names `for:`.

- **`for: bob-session`** — architectural or process questions this session resolves
  ITSELF. Coordination mechanism, interface shape, sequencing, how areas are carved.
  These are surfaced to Bob as a LINE, not a question: decided, here is why.
- **`for: bob`** — doctrine, risk carrying his name, effects on people outside the
  project, and the gated acts. Only these are put to him.

**CONDUCT should raise it either way and let this session triage.** Applying the three
tests is the BOB session's job, not a bar CONDUCT must clear before speaking. A
mis-filed entry costs one reclassification; an unraised one costs the thing going
unrecorded, which is what happened here.

---

## Open

> **Answered and enacted entries from 2026-08-04 to 2026-08-10 were rolled to
> `docs/archive/ledgers/DECISIONS-2026-08.md` on 2026-08-10** — the settled history had
> grown to 400 KB against 0 KB of open entries, and this file's job is the open list.
> Nothing was edited. `node tools/decided.mjs "<subject>"` still answers from every
> rolled ruling. Kept live: the rules, deferred entries, entries whose enactment is
> still owed, and the byte-read entries: DEC-39 (`affordances.test.mjs`) and DEC-32/DEC-33
> (`civicos-ui/test/analyst-vocabulary.mjs` derives the banned-vocabulary atoms from
> DEC-32's own sentence, anchored by DEC-33's heading).

### DEC-69 · answered
raised: 2026-08-10 · session BOB, recording a ruling Bob made in conversation — the
  register's founding rule (DEC-62's own precedent): a Bob ruling lives HERE, not in a
  transcript.
for: bob (his own ruling, recorded)
question: How far may the workflow go in reminding members of their responsibilities in
  the investigation process before it stops respecting them?
response: **THE WORKFLOW MUST NOT NAG OR SECOND-GUESS MEMBERS. RESPECT FOR MEMBERS AND
  THEIR JUDGMENT IS A REQUIREMENT, AND ANYTHING SHORT OF IT IS A FLAW.** Bob, 2026-08-10,
  verbatim: *"There's a point after which the workflow isn't properly respecting group
  members. Yeah, it's important that users understand their responsibilities in the
  investigation process. But to be (really) clear, the workflow must not be nagging or
  second-guessing users. The workflow needs to respect users and their judgment. Anything
  short of that is a flaw."*
  **The boundary, worked with him and consistent with what the register already holds:**
  - **INFORMING AT THE ACT, ONCE, IS RESPECT** — the fence sentence that states what an
    act means (DEC-39), the grade note at capture (DEC-51), a refusal's honest reason
    (DEC-49). Members understanding their responsibilities is served by the record
    stating what an act IS, at the act, one time.
  - **REPEATING, RE-CONFIRMING, OR MEASURING is the flaw** — asking a member to affirm
    what they already decided, "are you sure" on acts the rung ladder classes as
    reversible or reasoned, responsibility reminders detached from any act, and grading
    or counting a member's attention (DEC-68: the approval IS the act).
  - **THE RUNG LADDER'S CEREMONIES ARE NOT SECOND-GUESSING** — a terminal, attested or
    irreversible act carries deliberate weight because of what the ACT is, not because
    the member is doubted. The ladder stays as designed; nothing below those rungs
    earns ceremony.
  - **Bulk approval is the same act over a set** (DEC-52, Bob 2026-08-06) — forcing
    per-item clicks where a member has reviewed a list is the wear-them-down shape of
    this same flaw.
  **AMENDED 2026-08-10, same day, Bob — THE OPERATIVE WORD IN THE DEC-52 QUOTE IS
  "FORCED", AND IT CUTS BOTH WAYS.** Verbatim: *"a user needs to understand their
  responsibilities, but the system needs to provide the proper opportunities for the
  user to execute on their judgment correctly and efficiently. No, they shouldn't be
  forced to make decisions in bulk. But they should be enabled to when appropriate."*
  So the rule is about COMPULSION, not about which mode is better: wherever a set of
  decisions arises, the member is ENABLED to act singly or in bulk and is FORCED into
  neither. A surface that only offers bulk is the same flaw as one that only offers
  forty clicks — both take the mode of judgment out of the member's hands. DEC-52's
  sidebar mechanism already carries this shape ("approve them individually and in
  bulk"); this amendment makes it doctrine rather than a feature of one surface.
  - The failure asymmetry ("when uncertain, be noisy") is a rule about the RECORD'S OWN
    CLAIMS, and licenses no noise directed at members.
decided: 2026-08-10 · Bob
enacted: 2026-08-10 · session BOB, same turn — the doctrine is recorded here and the
  audit it implies is handed to CONDUCT through the BOB INBOX (QUEUE.md): sweep the
  member-facing flows for the flaw's three shapes (re-confirmation of decided acts,
  repeated or act-detached responsibility prompts, and any surviving diligence
  measurement), each finding corrected or brought back as its own item. Reasoning in
  this entry.

### DEC-68 · answered
raised: 2026-08-10 · CONDUCT (lifted from VF-6's report at integration — the worker raised it
  rather than writing here, correctly: this file names CONDUCT as the sole writer of new
  entries, and the worker's brief said otherwise. **The brief was wrong and the worker was
  right to treat it as a pointer rather than an authority.**)
for: bob
question: **Should the record retain a READ EVENT for `op=readingname`, so DEC-53's watch
  item can be kept at all?** VF-6 measured the accepts-without-reading rate and the answer
  is a stated `undetermined` — not because the instrument is weak, but because the quantity
  is not in the record. All four candidate proxies were probed and all four are ABSENT:
  `op=readingname` is `mutating: false` and writes no row, so there is no read event to
  subtract from; detail-expanded is never stored; `at` dates the accept and not the reading;
  and the sharpest one, accepting a null-`grade_if_resolved` candidate, **writes nothing at
  all — so the act that would BE the signal is the one act that leaves no trace**, and
  counting rows returns exactly zero however many members do it. Keeping DEC-53's watch
  number therefore requires a new write on a deliberately non-mutating op.
why it is Bob's: **logging what a member LOOKED AT is a doctrine question about surveilling
  members, not a schema convenience.** DEC-53's concern was the record overclaiming through
  convenience; answering it with a member-reading log would trade one doctrine risk for a
  larger one, and that trade is not measurement's to make.
provisional: **nothing is recorded and nothing is blocked.** VF-6's answer is `undetermined`
  and is PUBLISHED as such in `MEASUREMENTS.md` with what the instrument cannot observe stated
  beside it. The watch item stays open and unmeasurable rather than being quietly dropped.
alternative: leave it unmeasurable and close DEC-53's watch item as UNKEEPABLE, which is
  honest and costs nothing — as against building read retention and getting the number.
recommendation: **do not build it on measurement's say-so.** VF-6's own report names the
  asymmetry that matters: the instrument cannot see out-of-band reading, so a member who read
  the source last week is indistinguishable from one who accepted blind — **every available
  proxy is wrong in the direction that manufactures a scandal.** A number built on read
  retention would be both invasive AND biased toward the alarming answer, which is the worst
  of the four possible outcomes. If the watch item matters enough to pay for, the honest
  instrument is asking members, not logging them.
reversal cost: **rises once read events exist**, and that asymmetry is the argument for
  deciding before building rather than after: deleting a retained-reads table is a different
  act, with different obligations to members, from never having kept one.
prior art: `node tools/decided.mjs` finds no ruling; a corpus grep finds none either. So this
  is genuinely open rather than re-asked.
response: **NO — AND THE PREMISE FALLS WITH IT.** Bob, 2026-08-10: *"Why do we want to count
  the number of times that a user approves a candidate? If the user approves it, then it's
  approved."* Nothing is built and the watch item itself is WITHDRAWN as premise-rejected,
  not merely unmeasurable. The reasoning, worked with him: the count guarded against member
  approval becoming a laundering formality over machine composition — a boundary DEC-52's
  ruling dissolved (a machine act stands attributed AS machine; a member act binds AS the
  member's), and counting attention here would be the record's one anomaly, since no other
  member act (citing, ratifying) is graded on diligence. Authored acts bind; the approval IS
  the act.
decided: 2026-08-10 · Bob
enacted: 2026-08-10 · session BOB, same turn — nothing to build and nothing to remove:
  `op=readingname` stays non-mutating by design, VF-6's published `undetermined` in
  `MEASUREMENTS.md` stands as the honest record of what was probed, and DEC-53's watch
  item (carried in the 2026-08-10 BOB INBOX entry) is closed as withdrawn. Reasoning in
  this entry.

### DEC-72 · answered
raised: 2026-08-10 · session BOB, recording a design ruling Bob converged in conversation
  (the brainstorm brake was his: "nothing we discuss should change anything until we zero
  in on the truth" — this entry is the zeroing-in, recorded on his explicit go).
for: bob (his own ruling, recorded)
question: What is a published case — a phase of a finding, or its own object — and whose
  standard of evidence governs publication?
response: **A CASE IS A PRODUCTION OF A PROJECT: ITS OWN OBJECT — A SET OF FINDING-VERSIONS
  PLUS THE PUBLISHING PROJECT — AND THE BAR IS THE PROJECT'S, TOLD TO THE PUBLISHING ACT.**
  Bob, 2026-08-10, the four propositions and the answers that closed them, verbatim where
  it matters:
  (1) *"The bar — that is, the standard of evidence — is a property of a project, not an
  inquiry or claim."* Nothing composes across projects: the same finding may clear a
  journalist project's bar and fall short of a lawyer project's, and both facts stand.
  (2) *"Only findings that are part of a project can be published"* — publishing is
  *"something that's done as a production of the project."* The project-less publication
  path is removed.
  (3) Publication pins versions like a commit: *"Once published, the act of changing the
  findings (or any claims of any of the findings) results in the changed version becoming
  a new version."*
  (4) *"All load-bearing findings of a case being published must meet the necessary bar.
  Other findings/claims that don't meet the bar can be a part of the published work,
  though they aren't presented as load-bearing."* The designation is authored by the
  publisher; each claim's own strength is displayed beside the case's standard, because
  *"a claim could be even stronger than required for that case."*
  (5) *"The publisher of a project … must be a manager of the project"* — ruled with the
  default that MANAGER IS THE EXISTING PROJECT OWNER ROLE, no third role minted.
  (6) A finding has lasting value and serves many cases, across projects and within one:
  *"A finding is mined, often involving hard work. So once resolved, the finding should
  have lasting value."* A project may span several published cases (an investigative
  series), and *"a case is a different object, not just a different phase of a finding."*
  Second ruled default: A CASE REQUIRES AT LEAST ONE LOAD-BEARING MEMBER.
decided: 2026-08-10 · Bob
enacted: 2026-08-10 · session BOB, same turn — the design with every implication worked
  (revision flags on containing cases, the artifact-flip, the lifecycle change, the
  honest-absent-bar posture) is `docs/archive/CASE-AS-PRODUCTION.md`; the
  decomposition (CASE-1 … CASE-6, all M10, interfaces I3/I5 via the IC protocol) is in
  the BOB INBOX; M10's milestone entry is amended; `BIO_Case_Making_v0_1.md`'s
  three-phases naming section carries a dated amendment note. SUPERSEDES: DEC-71
  (dissolved — bars never attach to findings, so none can linger), DEC-17's
  strictest-across-citers composition (the group-default-seeds-projects half of DEC-17
  STANDS), D-280's fix (moot — the composed read is removed), the project-less
  publication path, REC-44's finding-side case stamping (the stranger-verification
  property is preserved case-side), and `published` as an inquiry lifecycle state
  (only-CONCLUDED-may-be-a-member survives as the precondition). DEC-44 is NOT
  superseded; its one-finding degenerate case stays legal. Reasoning in this entry and
  CASE-AS-PRODUCTION.md.

### DEC-71 · answered
raised: 2026-08-10 · CONDUCT (at D-280's integration — the worker filed IC-61 stating the
  consequence in the open rather than letting it land quietly, and this entry is CONDUCT
  routing it to the person whose call it is)
for: bob
question: **D-280 LOOSENS A PUBLICATION FENCE. Is that the right direction?** A citing
  project whose reference edges are all `status: severed` no longer sets a required-strength
  bar: a document whose only citer withdrew moves from `declared: true` to `declared: false`,
  and one cited LIVE at B/B and SEVERED at A/A moves from A/A to B/B. **So material that was
  refused publication yesterday may be publishable today.**
why it is Bob's: `CLAUDE.md` names this exact class as his, in these words — *"Publishing
  would then be permitted for material we cannot attribute" is his call.* This is not that
  sentence (attribution is untouched; the bar is about required STRENGTH), but it is that
  SHAPE: a fence moved outward, reached through a defect fix rather than through a decision
  about publication.
provisional: **the fix is SHIPPED and running**, because the defect it corrects is real and
  points the same way: a project that withdrew was TIGHTENING a bar on a document it had
  left, which is the record enforcing a requirement nobody currently asserts. Under this
  record's own standard — derived things inform, authored acts bind — a withdrawn citer has
  performed the authored act of leaving, and honouring its old bar makes the fence rest on
  an assertion that has been retracted.
alternative: keep counting severed citers for the BAR while excluding them everywhere else,
  on the reasoning that a publication fence should ratchet only tighter and never looser
  without an explicit decision. That is coherent and it is the conservative direction; it
  costs one predicate call to restore.
recommendation: **leave it as shipped.** A bar that rests on a retracted assertion is the
  record claiming a requirement its own evidence no longer supports — the same overclaim
  class as a chain nobody recorded, pointed at a fence instead of at a document. But the
  DIRECTION is worth your eye rather than my preference, because a loosened publication fence
  is not a thing to discover later in a release note.
reversal cost: **low now, and it does not rise** — one predicate call at the driven site,
  plus the arms that pin it. Nothing is written to the record either way, so no data has to
  be migrated whichever direction this goes.
prior art: `node tools/decided.mjs` finds no ruling on severed citers and publication bars;
  IC-61 records the same consequence at the interface layer with measured consumer impact
  (zero UI consumers today, so nothing is rendering the old answer).

**INPUT ADDED 2026-08-10 · session BOB, from Bob — A CLARIFICATION OF WHAT THE BAR IS,
recorded so this entry cannot be read as a per-document evidence gate.** Bob, verbatim:
*"Yes, every project has a standard of evidence. But that standard doesn't require that
every piece of evidence must meet that standard. Rather, it means that the overall
findings in that project must meet the standard — even if some evidence cited is below
the necessary grade. … While the draft agenda may not meet the grade to contribute
conclusively to the findings, it can still be included in the report because it really
was in the draft agenda that really was found on the city website, even if it wasn't in
the final version nor meeting minutes. The citation doesn't have to be severed."*
Verified against the shipped machinery, which already implements this: the bar is
declared per CASE by citing projects and compared at publication against the finding's
DERIVED strength (DEC-32's arithmetic — strongest branch governs across OR), so a weak
corroborating leg never drags a finding below the bar and never needs severing; the
axes stay separate (the draft agenda is STRONG on capture and weak on connection, and
the record states both). **Consequence for this entry:** since weak evidence never
requires severance, a severed citation means a project genuinely LEFT — which narrows
the question to its clean form (does a departed project's declared bar still govern?)
and strengthens the shipped direction, because the leftover bar cannot be defended as
protecting evidence quality.
response: **SUPERSEDED BY DEC-72 — THE QUESTION DISSOLVES.** Bob's 2026-08-10 ruling makes
  the bar a property of the PROJECT, told to the publishing act at act time; no bar ever
  attaches to a finding, so no departed project's bar can linger and nothing composes
  across citers. D-280's fix becomes moot rather than wrong (the composed read it
  corrected is removed by CASE-2), and its direction — a fence must rest on a live
  assertion — is the same instinct DEC-72 makes structural.
decided: 2026-08-10 · Bob, via DEC-72
enacted: 2026-08-10 · session BOB, same turn — carried entirely by DEC-72's enactment:
  `docs/archive/CASE-AS-PRODUCTION.md` (design and supersession table) and the CASE-2
  decomposition item in the BOB INBOX. Reasoning in DEC-72 and this entry.

### DEC-70 · answered
raised: 2026-08-10 · CONDUCT (lifted from D-280's report — the worker raised it and did NOT
  write here, correctly: this file names CONDUCT as sole writer of new entries)
for: bob
question: **Does SEVERING a basis leg discharge REC-17's re-evaluation obligation, or is that
  obligation about what the record ONCE rested on?** D-280 fixed the severed-citer defect at
  three sites and deliberately left `reevaluations` alone, because the two readings are both
  coherent and the choice is doctrine rather than plumbing.
why it is Bob's: it decides what a re-evaluation obligation IS. If severance discharges it,
  the obligation tracks the record's CURRENT shape; if it does not, the obligation attaches to
  what a case ever rested on and survives the withdrawal — which is much closer to D-79's
  *age rather than vanish*, and to the reason a dismissed finding is not deleted.
provisional: **unchanged — `reevaluations` still counts severed legs**, the conservative
  direction, and the site is PINNED by an assertion so a later session must move a test rather
  than drift into either answer.
alternative: filter `reevaluations` through `#refEdgeSevered` exactly as sites (a) and (b)
  now are, making the three consistent.
recommendation: **leave it until you rule.** Consistency across the three sites is an
  attractive argument and it is not a reason: the sites answer different questions, and
  D-280's own (e) shows the same predicate giving the WRONG answer one site over — reading a
  severed-only leg as `absent` would print *looked for and not there* about a document that
  was there.
reversal cost: one predicate call either way, plus its arms.
prior art: `node tools/decided.mjs` returned nothing on this subject — a floor, not a ceiling.
response: **READING B — THE OBLIGATION ATTACHES TO WHAT A FINDING EVER RESTED ON, AND THE
  FORMULATION IS: SEVERANCE DISCHARGES SUPPORT, NEVER CONNECTION.** Bob, 2026-09-10,
  verbatim: *"The basis on which a finding rests can/does change for any number of
  reasons. A change may strengthen the finding, or weaken it. The important thing to
  remember is that there may be several basis of a case that relate to the finding,
  though seemingly don't contribute materially to the finding at that moment. But if
  some underlying evidence of that basis or others moves, the relative contributions
  could shift as well. So keeping evidence connected has value over the lifetime."*
  The reasoning worked with him: relative contributions shift under DEC-32's own
  arithmetic — when a strong branch later weakens, a severed corroborating leg's
  relevance shifts at that moment, and discharging the connection would silently drop
  the one thread then needed. What the ruling does NOT move: a severed leg still
  contributes nothing to strength, gates nothing, and counts toward no bar — every
  D-280 site stands as fixed. The connection INFORMS, never binds: `op=reevaluations`
  is a pull-read today, so no member is prompted (DEC-69 untouched); if this feed ever
  becomes a pushed notification, it tells ONCE, is dispositionable, and ages (D-79,
  D-266's machinery) — never a recurring nag.
decided: 2026-09-10 · Bob
  (enactment is CONDUCT's drain: the shipped provisional IS this ruling, so nothing in
  the plane moves — the site's `provisional` comment becomes `ruled DEC-70` and the
  pinning assertion stands as the ruling's pin.)
enacted: 2026-09-10 · CONDUCT — **NOTHING IN THE PLANE MOVED, AND THAT IS THE WHOLE POINT: the
  shipped provisional IS the ruling.** `reevaluations` still counts a severed leg, every other
  D-280 site still refuses one, and `d280-strengthbar.test.mjs` is unchanged in SUBJECT — 34/0.
  **What changed is the assertion's STANDING, and flipping it is the enactment rather than a
  tidy-up.** SITE (c)'s pin read *"a doctrine question... a ruling is raised rather than taken"*;
  a comment that still says a question is open when it is closed is the stale-instruction class
  this project keeps paying for — the same shape as a resume prompt describing a solved problem.
  It now reads as DEC-70's own pin and carries Bob's reasoning at the site: **relative
  contributions SHIFT under DEC-32's arithmetic, so when a strong branch later weakens the severed
  corroborating leg is exactly the thread then needed** — discharging the connection would
  silently drop it. The boundary is carried too, because it is the half a later reader would
  otherwise over-apply: **a severed leg still contributes NOTHING to strength, gates nothing, and
  counts toward NO bar. The connection INFORMS, never binds.** DEC-69 is untouched — `op=reevaluations`
  is a pull-read, so no member is prompted; the ruling's own note on what a future PUSHED feed
  would owe (tells ONCE, dispositionable, ages) is left in this entry rather than built, since
  nothing pushes it today. Reasoning in this entry and at `d280-strengthbar.test.mjs` SITE (c).

### DEC-2 · deferred
raised: 2026-07-31 · BOB (seeded from DEBT D-1)
question: What should a ROOT OF TRUST be for a BIO group — who holds it, how does it
  survive a person leaving, and what does losing it cost?
why it is Bob's: doctrine, of the same weight as the membership model. Three parts of
  that model lean on it.
provisional: `ADMIN_TOKEN` is the root of trust, and it became one by accident — it is
  a bootstrap credential acting as a proxy for hosting access, with no custody model
  (no m-of-n, no split custody), no audit trail, and no rotation that does not return
  the instance to unclaimed. Section 8's verified export already requires it rather
  than in-app administrator status, on the reasoning that an export any administrator
  can run is the most efficient attack in the system.
blocks: none today. It bounds how much weight the membership guarantees can carry.
alternative: leave it as the bootstrap credential and document the limit honestly,
  which is what is happening by default.
recommendation: do not design this in the abstract. The useful next step is one
  question answered from the field — what a real group can actually hold — because a
  custody model that assumes a hardware key or two reliable officers is a model that
  fails silently in the group it was built for.
reversal cost: low now, high later. Every governance rule written on top of the
  current root inherits its weakness, and migrating a root of trust after instances
  exist means re-establishing trust rather than editing a field.
response: DEFERRED, deliberately and with a trigger. Bob, 2026-07-31: "At this time I'm
  not sure what the correct answer to this (recurring) question is. I again suggest
  that it be deferred until we have a greater understanding from a running BIO instance
  with multiple members." The word "again" is the useful part: this has been re-raised
  more than once and re-answered the same way, which is waste. It now has a NAMED
  TRIGGER so no session re-asks before the trigger and none forgets after it.
trigger: a BIO instance running with MULTIPLE MEMBERS, from which what a real group can
  actually hold in custody can be observed rather than assumed. Until then any custody
  model is a guess about people, and a guess about people is the part of a security
  design that fails silently.
decided: 2026-07-31 · Bob
reasoning recorded in: DEBT D-1, whose disposition becomes DEFERRED with this trigger.
for CONDUCT to enact: update D-1's disposition to name the trigger, so a future session
  reads "deferred until X" rather than "open doctrine" and does not re-raise it.
enacted: 2026-07-31 · CONDUCT — D-1's disposition set to DEFERRED with the named trigger (a BIO instance running with multiple members) in DEBT.md.

### DEC-25 · deferred
raised: 2026-08-03 · session BOB, from Bob's action-plan ruling
for: bob
question: What, if any, part of an ACTION PLAN is published?
why it is Bob's: doctrine, risk carrying his name, and effects on people outside the project. A
  plan holds the group's strategic deliberation, which is both the most sensitive material the
  system will hold and the most likely to be sought under legal process.
provisional: **THE PLAN IS WORKING MATERIAL AND IS NEVER PUBLISHED** — the conservative branch,
  and it blocks nothing. The two-bucket fence already keeps working material off the public read
  path by construction, so this is the default rather than a new mechanism.
blocks: nothing. S11 is unbuilt and `impacting` has no working process at all.
alternative: publish some of it — most plausibly the steps actually TAKEN and their outcomes, on
  the argument that a reader judging a case should see what the group did about it.
recommendation: KEEP IT UNPUBLISHED, and make that structural rather than a permission check.
  What legitimately reaches the public is already covered without touching the plan: an action's
  OUTCOME can become evidence (DEC-14 governs claims about our own impact), and the group's
  declared position on contacting the subject is published under DEC-13.
reversal cost: low while nothing is built; high once plans exist and groups have written
  candidly in them under one rule.
trigger: **a group asks to include any part of a plan in a published case**, or a published
  case's account of what the group did is materially incomplete without it — whichever comes
  first. Until then the never-published default costs nothing and is the safe branch.
response: **DEFERRED.** Bob, 2026-08-03: *"I also need to defer DEC-25 for now."*
  **AND THE DEFERRAL CARRIES ONE CONSEQUENCE A LATER SESSION MUST NOT MISS, because deferring
  this is not neutral the way deferring most questions is.** The provisional is not merely a
  placeholder: groups will write in their plans candidly BECAUSE the plans are private. Every
  day the default runs, more material accumulates that was authored under a promise. **So if
  this is ever answered the other way, it can only apply PROSPECTIVELY** — to plans written
  after the change, with the group told before they write. Retroactively publishing deliberation
  that was recorded under a privacy assumption would be a betrayal of the members who wrote it,
  and it is the kind of harm this project's stance exists to refuse. Enact the deferral with
  that constraint attached, not as a bare "not now".
decided: 2026-08-03 · Bob
enacted: 2026-08-03 · CONDUCT — the deferral stands with its constraint ATTACHED, not bare: the never-published provisional runs; if ever answered the other way it applies PROSPECTIVELY only (plans are written under a privacy promise, and retroactive publication would betray it). S11 stays parked with Bob's thread; the trigger is in this entry. Reasoning in this entry.


### DEC-31 · answered
raised: 2026-08-03 · session BOB (RECONCILED §4 Q14 third bullet; AUDIENCES rows 13–14)
for: bob
question: What is ADDRESSED NON-PUBLIC DELIVERY — a case sent to one recipient (a confidential
  referral, a pre-publication briefing) — and when does a persistent RENDERING someone acted on
  become a record?
why it is Bob's: effects on people outside the project (a recipient relies on it), risk
  carrying his name, and it sits on neither side of the two-bucket fence — DEC-25's
  neighbourhood.
provisional: nothing is blocked. Both are modelled provisionally as an ACTION — the member
  performs the delivery outside the system and records having done it — and the two-bucket
  fence stays intact: nothing non-public leaves the instance by any system path.
blocks: none.
alternative: design the third bucket now — a delivery construct with recipient identity,
  hashing, and re-serving.
recommendation: DEFER with a named trigger, and bind ONE constraint now. AUDIENCES' own line —
  *"settled by the first lawyer, not by argument"* — is right: designing confidential delivery
  before any group needs one is designing custody in the abstract, the mistake DEC-2 exists to
  refuse. Trigger: **the first group that asks to send a case to a named recipient without
  publishing it.** The constraint that must NOT wait, because it is retroactively unfixable in
  exactly the way DEC-25's is: any rendering that leaves the instance addressed to someone
  carries its hash, its date, its author and both threshold floors IN-BAND (H4's rule, extended
  from published renderings to addressed ones) — so that if the recipient acts on it, what they
  acted on is checkable later. A rendering sent outward without those is an unverifiable claim
  wearing the group's name; recording them costs nothing at the moment of sending and cannot be
  done after.
reversal cost: the deferral costs nothing (the action-model provisional blocks nothing); the
  in-band constraint is a rendering rule, cheap now, impossible retroactively.
response: **DEFERRED, per the recommendation.** Bob, 2026-08-03: *"I'll follow your
  recommendation to defer."* The recommendation was defer-plus-bind, so BOTH halves are in
  force: the delivery construct waits for its trigger, and the in-band rule binds NOW — any
  rendering that leaves the instance addressed to someone carries its hash, date, author and
  both threshold floors inside itself. The rule costs nothing before the construct exists and
  cannot be applied retroactively after.
trigger: the first group that asks to send a case to a named recipient without publishing it.
decided: 2026-08-03 · Bob
reasoning recorded in: this entry; the in-band extension belongs beside H4 in AUDIENCES.md.
for CONDUCT to enact: record the H4 extension (addressed renderings carry hash, date, author
  and both floors in-band) in AUDIENCES.md §8's rule, so the first session to build any
  outward rendering inherits it. RECONCILED §4 Q14's delivery bullet marked deferred by this
  entry.
enacted: 2026-08-03 · CONDUCT — 5318b53: deferred on its trigger (first group asking for addressed non-public delivery), and the BOUND rule is recorded now — addressed renderings carry hash, date, author and both floors in-band — on UI-18's scope beside H4 (the AUDIENCES.md header pointer names it). Reasoning in this entry and QUEUE.md (UI-18).


response: **ANSWERED 2026-09-17 by Bob, and the deferral's own trigger is what fired: he named the need rather than the abstraction.** Bob, verbatim: *"a member will sometimes want to hand a case to one person or internal group. It seems to me that that action should stand beside the publish act, maybe even an option of publishing... it's important that the product of that act clearly indicate that it's a pre-publish version. Also, it should be as complete as a published work as possible, though those pieces that a fully published work requires that are missing from the pre-published version should be clearly indicated. We also need to think about what actions can be done on a pre-published work - comment (certainly), edit (?)."*

  **THE DOCTRINE IS RULED AND THE MECHANISM IS THE ARCHITECT'S. Bob's ruling: the act stands BESIDE publish, is marked, is as complete as a full publication can be, and NAMES WHAT IS MISSING.** The scope determination below is BOB #12's under standing delegation, and the first line of it is the one that must not be skipped.

  **1 · IT IS UNLISTED, NOT CONFIDENTIAL, AND THAT DISTINCTION IS DOCTRINE RATHER THAN MECHANISM.** The two-bucket fence is STRUCTURAL: the private bucket is member-scope and never leaves the Durable Object, and the set of components that can reach it is small and named (`PARALLELISM.md`). **A review copy that leaves the instance has left the fence — there is no third bucket that is outside the instance and also private.** So the recommendation is that a review copy is PUBLISHED, at an unguessable address, unlisted and marked — which is why Bob's *"maybe even an option of publishing"* is exactly right, and why it costs nothing structurally. **The consequence must be stated ON THE ARTIFACT AND TO THE MEMBER AT THE ACT: anyone holding the link can read it.** A member who needs genuine confidentiality is not served by this and must be told so rather than sold an unlisted URL as secrecy — the *never invent an attribution to get past a gate* rule, pointed at privacy. **If Bob wants true confidential delivery, that is a different and much larger act and is NOT what this entry answers.**

  **2 · THE ARTIFACT IS IMMUTABLE AND VERSIONED, WHICH ANSWERS THE SECOND HALF OF THE ORIGINAL QUESTION.** This entry asked *when does a persistent RENDERING someone acted on become a record?* If a review copy cannot be edited in place and an edit produces a NEW marked version, the question dissolves: what the recipient acted on still exists, unchanged, addressable, and the difference from what came later is derivable. **So on Bob's open question — comment yes, EDIT NO.** Editing in place is the one act that would recreate the problem the deferral was protecting against.

  **3 · COMPLETENESS IS ALREADY EXPRESSIBLE AND SHOULD BE REUSED, NOT INVENTED.** *As complete as possible, with what is missing clearly indicated* is the vocabulary this record already has — the `searched` section (IC-112, which now REFUSES a case document that omits it), undetermined-is-first-class, the strength walk naming its weakest legs, and the frontier's absence vocabulary. **A review copy states its own gaps in the same words a published case does**, and a gate that pressured a member into filling them would be a bug in the gate (DEC-69).

**CORRECTED 2026-09-17 BY BOB, SAME DAY, AND HE OVERRULED THE TWO DETERMINATIONS THAT MATTERED.** Bob: *"An
  'advance copy' or 'review copy' (both valid names) is mutable. Only a real publish is not. An editor must be able to
  edit, right? (Mind you, the editor must have project permissions to do so.) Agreed that a review copy never leaves
  the instance."*

  **§1 IS REVERSED AND HIS BRANCH IS THE BETTER ONE. A review copy NEVER LEAVES THE INSTANCE.** I reasoned that since
  the two-bucket fence is structural and there is no third bucket both outside the instance and private, a review copy
  must therefore be PUBLISHED-BUT-UNLISTED. **That took the fence as fixed and moved the artifact. Bob took the
  artifact as fixed and kept it behind the fence**, which costs nothing doctrinally and gives up only reach.

  **§2 IS REVERSED AND IT FOLLOWS FROM §1 RATHER THAN CONTRADICTING IT — which is what makes his design coherent and
  mine merely consistent.** I ruled the artifact IMMUTABLE because an unlisted copy in someone's hands cannot be
  recalled, so versioning was the only honest answer to *when does a rendering someone acted on become a record*.
  **If it never leaves, there is no copy to go stale, so mutability costs nothing and editing is exactly right** —
  gated on project permissions, as he says. **Only a real publish is immutable**, which is also the cleaner rule: one
  irreversible act, not two.

  **THE ONE QUESTION HIS RULING OPENS, and it is mechanism rather than doctrine, so it is mine: HOW DOES THE RECIPIENT
  REACH IT?** A copy that never leaves the instance must be read inside the instance, so the recipient needs a way in
  — a scoped, revocable, read-and-comment grant against one production, which is nearer to the existing gate and
  capability vocabulary than to publication. **And the original question SURVIVES IN A NARROWER FORM rather than
  dissolving: the moment a member exports a PDF and emails it, a rendering someone acts on is loose again.** That is
  outside the fence by the member's own act and the record can only say what it holds; worth stating on the surface
  rather than designing against.

decided: 2026-09-17 · Bob · reasoning in this entry; the mechanism decomposed to CONDUCT through the BOB INBOX the same day. **NAMING IS PUT BACK TO BOB and is not settled here:** *pre-publish for review* is descriptive but ASSERTS A FUTURE THAT MAY NOT HAPPEN — a confidential referral may never be published — and this record does not name acts for what they precede. `advance copy` and `review copy` are the recommendations, both terms of art a member already understands; the choice is Bob's because it is member-facing vocabulary (DEC-8).

### DEC-32 · answered
raised: 2026-08-03 · session BOB (Bob's overlapping-utility example,
  BIO_Case_Making_v0_1.md, clarified by him 2026-08-03)
for: bob
question: May one finding hold SEVERAL PARALLEL CLAIMS — two independent bodies of support
  answering one question — or must the utility example split into two inquiries whose published
  rendering reassembles them?
why it is Bob's: doctrine — what a finding IS and what its stated strength may claim. The
  example is his and the lean toward plurality is his.
provisional: nothing is blocked; `inquiry_basis` does not exist, so both shapes remain cheap.
blocks: none.
alternative: two inquiries under a parent whose rendering reassembles them — already weakened
  in the doc's own analysis, because it splits an answer a reader needs whole.
recommendation: ADOPT PLURALITY, shaped as GROUNDS rather than claim-objects: one finding, ONE
  conclusion, `1..n` named GROUNDS, each ground a labelled partition of the basis legs that the
  member asserts is INDEPENDENTLY SUFFICIENT. Today's flat basis is the degenerate case — one
  implicit ground — so nothing existing changes shape. This keeps the collapse intact: a ground
  has no identity, no falsifier of its own, and cannot be cited alone, so nothing nested
  rebuilds the multiplicity the collapse removed. And it carries the consequence that is the
  real payoff, because it changes the strength arithmetic: **grounds compose DISJUNCTIVELY —
  the finding's strength is its strongest sufficient ground, and a ground's strength is the
  weakest leg within it.** A conclusion established at B on the constitutional ground is
  established at B, full stop; the regulatory ground offered beside it at C weakens nothing —
  where today the weakest-leg rule holds the whole finding to C and pushes the member toward
  division. So plurality removes one of the two honest pressures behind DEC-29's divide prompt,
  and it is not an overclaim, because "independently sufficient" is the member's authored
  judgment, per ground, with their name on it — the same accountability shape as the conclusion
  itself. R1 composes cleanly: a suspended leg suspends its GROUND; the finding suspends only
  when EVERY ground is suspended (DEC-18's pattern, one level up). Q14's contradiction case
  stays separate and stays undesigned — grounds agree on the conclusion; contradiction is two
  conclusions disagreeing.
reversal cost: low now, while `inquiry_basis` is unbuilt. Rising after: once grounds exist,
  renderings and citations will hang off their labels.
CLARIFIED 2026-08-03 by Bob, twice, and the entry stays OPEN pending his read of the answers:
  (1) *"You talk about grounds, but what that really is is multiple claims."* **CONCEDED —
  semantically each ground IS a claim: the same proposition asserted on a distinct basis.**
  What the grounds shape refuses is not claim-plurality; it is separate OBJECT IDENTITY for
  each claim inside the finding. The sharpened test this exchange produced, which is the
  useful residue: **count the falsifiers.** If the parallel supports assert the SAME
  proposition, they share ONE falsifier — that is plurality inside one finding, whatever the
  surface vocabulary calls it (calling them "claims" on screen is fine). If they assert
  DIFFERENT propositions (*the regulations do not forbid it* vs *the constitution
  affirmatively grants it*), each has its OWN falsifier — and a thing with its own falsifier
  is an inquiry, so that case is composition (recursion, already answered), with the
  published rendering free to present the family together.
  (2) He asked for the weakest-leg rule to be justified by example — answered in session with
  the conjunctive/disjunctive distinction: weakest-leg is right when every leg is
  load-bearing (the reader must be able to check every link the claim NEEDS, so the claim's
  checkability is its least-checkable necessary link); his utility example is the case where
  legs are NOT all necessary (independent sufficient bases), which is exactly why the flat
  model needs this decision. One rule, two shapes: min over necessary legs, max over
  independently sufficient bases.
RULED IN PART 2026-08-03 by Bob — THE ARITHMETIC IS SETTLED: *"The simple truth is that
  sometimes the weakest is the claim's strength, and other times it's not. The difference is
  really whether the relationship between legs is AND or OR."* So a claim's basis carries the
  RELATIONSHIP, not just the legs: strength is the MINIMUM over AND-related legs and the
  MAXIMUM over OR-related branches (minimum within each branch, since a branch is itself an
  AND). What remains open is only the OBJECT SHAPE — whether the OR-branches are claims
  inside one finding (one proposition, one falsifier) with separate inquiries reserved for
  distinct propositions (the falsifier-count test), which awaits Bob's confirmation. Any
  build touching REC-12's strength derivation must model the AND/OR relationship from the
  start; a flat implicit-AND basis is now known to be wrong.
RECOMMENDATION SHARPENED 2026-08-04, at Bob's request ("you're more tuned into the place
  of falsifiers — what's your recommendation, and why?"). **ADOPT THE FALSIFIER-COUNT TEST,
  and the reason is that it is not a second rule beside the AND/OR arithmetic — it IS that
  arithmetic, read from the other side.** Strength composes: MIN over AND legs, MAX over OR
  branches (Bob's ruling). Refutation composes DUALLY: to refute an AND chain you break ANY
  ONE necessary link; to refute an OR set you must break EVERY branch. Those are De Morgan
  duals, so the falsifier count is not an extra judgment a member must make — it is entailed
  by the AND/OR relationship they have already declared. One rule, two faces.
  **AND THAT DISSOLVES THE APPARENT PROBLEM WITH BOB'S OWN EXAMPLE.** The clarification
  worried that "the regulations do not forbid it" and "the constitution affirmatively grants
  it" are different propositions with different falsifiers, which would route the utility
  example to separate inquiries — the outcome the example was raised to resist. Under the
  dual, it does not: an OR-composed finding has ONE falsifier, and it is COMPOUND —
  *every ground fails*. Compound is not plural. It is finite, checkable, and each branch is
  nameable, which is exactly what a falsifier has to be. So the utility example is ONE
  finding, as Bob leaned, and the falsifier test agrees rather than overriding him.
  **THE OPERATIONAL TEST, stated so a member can apply it without this reasoning:** *would
  refuting this ground alone change the conclusion?* If NO — the other ground still carries
  it — the grounds are OR-related and live inside one finding. If YES, the leg was necessary
  (AND) all along. **And the test for separate OBJECT IDENTITY is CITABILITY: does anything
  need to cite this part ALONE?** Identity exists so a thing can be referenced; a ground no
  leg will ever cite by itself does not need an id, and giving it one rebuilds the
  multiplicity D-127's collapse removed. When a member genuinely needs to cite *the
  constitution grants it* on its own — in another inquiry, for another conclusion — that is
  the signal it was always its own inquiry, and recursion (already answered) composes it.
  **THE HAZARD TO NAME, because the ruling creates it:** OR takes the MAX, so a member has a
  standing incentive to bundle a weak ground beside a strong one and publish at the strong
  one's grade. Three things already contain it and no new machinery is needed: *independently
  sufficient* is an AUTHORED judgment carrying the member's name (the same accountability
  shape as the conclusion itself); the compound falsifier is the check, because a member who
  cannot state a falsifier requiring EVERY branch to fail has not got OR-related branches;
  and each ground's legs stay visible, so a reader tests sufficiency rather than taking it.
  What I would NOT do: mint a separate falsifier per ground. It reads as more honest and is
  less — it converts one checkable compound falsifier into several partial ones, none of
  which refutes the finding, and a reader who breaks one would reasonably believe they had.
BOB'S CONSTRAINT, 2026-08-04, and it governs the BUILD rather than the meaning: *"the
  average CivicOS [member] doesn't have a philosophy degree. So the nuances of multiple
  claims and falsifiers will be lost on the average user. So the system needs to support the
  user through the experience so that what they end up with is correct and proper. The flip
  side… we don't want a user to be able to game the system by packaging the legs across
  different claims to beneficially raise or lower the strength to match their bias."*
  **BOTH HALVES ARE SATISFIED BY ONE MOVE: the member is never asked for the STRUCTURE,
  only for CONSEQUENCES, and the structure is derived from their answers.** The elicitation
  design, decided by this session as mechanism (Bob's 2026-07-31 delegation) and binding on
  REC-11/REC-12 and the UI-11/UI-12 surfaces:
  1. **NEVER show AND / OR / disjunction / grounds — not even as tooltips.** The vocabulary
     is the analyst's, not the member's, and a member who must learn it to state a finding
     will state a worse finding.
  2. **ASK ONE CONSEQUENCE QUESTION PER LEG, in the member's own terms:** *"If this turned
     out to be wrong, would your answer still hold?"* Anyone can answer that about their own
     reasoning without vocabulary. "No, my answer falls" → the leg is NECESSARY (AND). "Yes,
     because of these others" → it is INDEPENDENTLY SUFFICIENT with them (an OR branch).
     The relationship Bob ruled is ENTAILED by the answers; it is never asked for.
  3. **SHOW THE DERIVED FALSIFIER BACK, in plain words, and let them correct it.** *"Your
     answer fails only if ALL of these fail: …"* versus *"…fails if ANY of these fails: …"*.
     **Reading a falsifier is enormously easier than authoring a structure**, and it is the
     one check that catches a mis-elicited structure: a member who reads it and says "no,
     that's not right" has just corrected the model without knowing the model exists.
  4. **THE DEFAULT IS AND, AND THAT IS THE ANTI-GAMING KEYSTONE.** An unstructured basis
     stays implicit-AND — weakest leg — which is the CONSERVATIVE direction. Independent
     sufficiency must be affirmatively claimed, per branch. So strengthening a finding by
     repackaging requires an ACT that carries the member's name; it can never happen by
     omission, by default, or by a member simply not understanding the question.
  5. **THE STRUCTURE IS AUTHORED BEFORE THE STRENGTH IS SHOWN.** This is the ordering rule
     and it is the difference between a design that resists bias and one that invites it: a
     member shown the grade first will reorganise legs against it, exactly as a prefilled
     justification invites a rationalisation (the J-construct's never-prefill rule, one
     construct over). Consequence first, arithmetic second.
  6. **RESTRUCTURING AFTER SEEING THE STRENGTH IS LEGAL, RECORDED AND ATTRIBUTED** — never
     blocked. A member may legitimately realise their structure was wrong. The defence is
     visibility, not prohibition: it is a revision with an authored reason, and the system
     may NOTICE the pattern (a weak leg moved into its own branch immediately after a
     strength drop) and surface it to the member and the reader. Derived informs, authored
     binds (D-90) — a machine may not refuse the act and must not hide it.
  7. **AND THE READER IS THE FINAL CHECK, which is what makes this safe to ship**: the
     published case shows each branch and its legs, so "these were independently sufficient"
     is a claim ANY reader can test against the legs themselves. Bias survives a private
     judgment; it does not survive a published structure with the member's name on it.
  **Falsifiable, per the constructs doctrine:** if members routinely answer the consequence
  question one way and then correct the derived falsifier, the elicitation is wrong and the
  question needs rewording — measure it on the first real inquiries rather than predicting it.
response: **ADOPTED IN FULL.** Bob, 2026-08-04: *"Your recommendation is good. Do that."*
  So: **plurality lives INSIDE one finding** — one conclusion, one compound falsifier,
  parallel claims each resting on a distinct basis, related by the AND/OR relationship Bob
  ruled. Separate OBJECT IDENTITY is reserved for distinct propositions, and the test for
  it is CITABILITY: a part nothing will ever cite alone does not need an id, and giving it
  one rebuilds the multiplicity D-127's collapse removed. The falsifier-count test carries
  the design, entailed by the arithmetic rather than added beside it. The elicitation design
  above is binding — members are asked for CONSEQUENCES, never for structure, and the
  derived falsifier is shown back in plain words for correction.
decided: 2026-08-04 · Bob
reasoning recorded in: this entry (the dual-composition argument, the operational test, the
  citability test for identity, the anti-gaming keystone and the elicitation design) and
  `BIO_Case_Making_v0_1.md`'s DEC-32 thread, which CONDUCT updates on enactment.
RESEARCH FINDING AGAINST THIS ENTRY, 2026-08-04 (same day, from the search-completeness
  research): **the OR-max rule is sound only if branches are INDEPENDENT, and this entry
  makes independence an authored judgment with nothing testing it — which is the exact
  failure mode that defeats every professional verification methodology surveyed.** The NYT
  Iraq post-mortem (defectors and the officials confirming them were the same pipeline),
  Buttry's fourteen honest eyewitnesses who were all wrong the same way, and the Berkeley
  Protocol naming CIRCULAR REPORTING as a hazard while supplying no test for it, are three
  independent demonstrations. **The arithmetic is not wrong; the missing piece is the
  independence check**, and BIO can build what no newsroom could: provenance is
  content-addressed, so the system can DERIVE that two branches' legs share an upstream
  origin and surface it — derived informs, authored binds. Recorded as D-195; it changes
  REC-12's scope, not this ruling.
for CONDUCT to enact: **REC-11 and REC-12 are the load-bearing pair.** REC-12's strength
  derivation models the AND/OR relationship from the start — a flat implicit-AND basis is
  now known WRONG — computing MIN over AND legs and MAX over OR branches (min within a
  branch). REC-11's `inquiry_basis` carries the relationship, not just the legs. **The
  DEFAULT IS AND and that is a correctness requirement, not a preference**: an unstructured
  basis stays weakest-leg, so independent sufficiency is only ever reached by an
  affirmative, attributed act. R1 composes one level up (a suspended leg suspends its
  branch; the finding suspends only when every branch is — DEC-18's pattern). UI-11/UI-12
  take the elicitation design: no AND/OR vocabulary on any surface, the consequence question
  per leg, the derived falsifier shown back, structure authored BEFORE strength is shown,
  and restructuring-after-seeing-strength recorded and attributed rather than blocked.
  Q14's contradiction case stays SEPARATE and stays undesigned — grounds agree on the
  conclusion; contradiction is two conclusions disagreeing.
enacted: 2026-08-04 · CONDUCT — REC-42 queued to CORRECT the shipped flat-AND basis (the relationship on inquiry_basis; MIN over AND legs / MAX over OR branches per axis; the AND default as a correctness requirement so independent sufficiency needs an affirmative attributed act; R1 composing one level up; every flat-shape pin corrected with dates and REC-14 freezing the structured result) and UI-27's sibling elicitation half folded into the UI wave's scope note — no AND/OR vocabulary on any surface, the consequence question per leg, the derived falsifier shown back, structure authored BEFORE strength is shown, restructuring-after-seeing recorded and attributed rather than blocked. Q14's contradiction case recorded as SEPARATE and UNDESIGNED. Reasoning in this entry and QUEUE.md (REC-42).

> **AMENDMENT, 2026-08-04 (CONDUCT, the D-160 pattern — a dated note where the words
> live, never a rewrite): this entry states R1's branch composition with the RETIRED
> word.** `UNRATED` is canonical; the retired word means the OPPOSITE in `SB-OUTPUT`
> §5.1 and is swept out of `app.html` by the drift guard. As built (REC-42): a branch
> the walk could not finish reads `undetermined`; a branch with nothing established
> reads UNRATED. The ruling's substance is unaffected — the translation is written at
> `#groundResult` in `store.mjs`, and it cost REC-42's worker time, which is why this
> note exists rather than a silent correction.

> **AMENDMENT, 2026-08-04 (CONDUCT, at UI-27's landing — the D-160 shape: the rule did
> not move, the WORD did).** This entry states the operational test with a word its own
> clause 1 forbids on ANY surface, so rendering the entry verbatim would break the
> ruling it enacts — found by UI-27 while building the elicitation, and REC-45's act and
> prompt had already avoided the same word independently. **The surface spelling is
> "Would refuting this alone change your conclusion?"** — same test, same reasoning,
> no forbidden vocabulary. The entry's original wording is kept above rather than
> rewritten, because a ruling that had to be re-spelled to be sayable is worth seeing.

### DEC-33 · answered
raised: 2026-08-03 · Bob, in session (on S8, the publication ceremony)
for: bob
question: When is the publication ceremony — the five-step member-facing process — built?
why it is Bob's: priority, on the heaviest act in the system.
provisional: publishing exists only in the operator's page; no member-facing process.
blocks: nothing — the deferral IS the answer.
alternative: build the ceremony on the existing chain order (REC-14 → REC-22 → UI-18, with
  UI-17 the ceremony surface).
recommendation: n/a — raised already answered.
reversal cost: none; deferring surface work is the cheap branch by construction.
response: **THE PROCESS IS DEFERRED; A PLACEHOLDER SURFACE SHIPS IN ITS PLACE.** Bob,
  2026-08-03: *"The publication process is very involved. Defer anything related to the
  process, though create a placeholder surface."*
  THIS SESSION'S SCOPE DETERMINATION, which is tactical and mine: "the process" is the
  MEMBER-FACING CEREMONY and its process-specific supports — **UI-17 (the five-step ceremony)
  and REC-15 (`op=publishpreflight`, the ceremony's dry-run) are deferred.** The PLANE's
  publication machinery is NOT the process and stays queued: REC-14 (publish + editions)
  carries DEC-12/DEC-19 doctrine, REC-22 is the public read path, and UI-18 is the READER's
  page — all needed by S9 whatever the ceremony looks like, and all reachable today through
  the operator's page, which remains the publishing route in the meantime. The PLACEHOLDER:
  S8 exists as an entry point that states what publication is, that the ceremony is coming,
  and that publishing currently runs through the group's operator — honest narration of an
  absent capability, surface-scoped, exactly the Q12 rule.
  RE-ENTRY CONDITION, named so nobody re-raises early: the chain through UI-18 has landed and
  a group needs to publish without its operator.
decided: 2026-08-03 · Bob
reasoning recorded in: this entry.
for CONDUCT to enact: UI-17 and REC-15 move to DEFERRED with this entry as the reason; a
  small UI item for the S8 placeholder is added where UI-17 sat; REC-14/REC-22/UI-18 are
  unaffected. Kickoffs naming UI-17 as next-up must be corrected in the same pass.
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-15 and UI-17 moved to blocked with this ruling as the reason and Bob-reopens-the-thread as the trigger; UI-17a queued in UI-17's place (entry point stating what publication is, operator-run for now, Q12 narration); REC-14, REC-22 and UI-18 stay queued — they are not the process. No kickoff names UI-17 as next-up (checked). Reasoning in QUEUE.md (REC-15/UI-17/UI-17a).
  RE-ENTRY CONDITION READ 2026-09-14 by BOB #11, at Bob's delegation, as the tactical call it
  is: the first clause (UI-18 landed) is met; the second ("a group needs to publish without
  its operator") is not, by measurement — the only instances the record names are the
  project's own and the smoke instance, both operator-run. So the ceremony is designed
  inside Program B when Bob turns to the member surfaces, and REC-15 / UI-17 reopen then or
  when a sovereign group is installed, whichever comes first. No further ruling is needed;
  folded into `BIO_Publication_v0_1.md` §5 and §9.
  CONFIRMED BY BOB 2026-09-18, and the reason is the one that governs everything above it: *"DEC-33
  is another case of my saying 'we need a solid substrate before building on top of it.'"* The
  ceremony waits on the substrate beneath it, not on a further answer from him. **A sentence
  claiming this re-entry was "put to him 2026-09-14, unanswered" was copied through `kickoffs/BOB.md`
  and `QUEUE.md` for four days while this entry said the opposite; BOB #14 surfaced it to Bob as
  pending on 2026-09-18 without reading this entry, and he corrected it. It is not pending.**

### DEC-39 · answered
raised: 2026-08-04 · CONDUCT (lifted from REC-38's report)
for: bob
question: The co-attestation honesty fence — "a co-attestation raises Grade B toward
  evidentiary weight; it never reaches Grade A" — is member-facing wording that is a
  CLAIM ABOUT WHAT THE RECORD ASSERTS, and it currently lives only in the surface's
  own sentence. Should the plane publish fence wording for the attest act (the
  DEC-29(b) prompt treatment — the sentence travels WITH the control), and if so,
  what does it say?
why it is Bob's: the sentence states what an attestation is worth, which is grade
  doctrine — the R2/DEC-4 neighbourhood — and a wrong sentence here overclaims or
  underclaims on every capture a member co-attests.
provisional: the surface keeps its current sentence (unchanged since UI-2's era);
  the plane publishes the attest LABEL (REC-38) and no fence wording; UI-24's rider
  renders the published label and deliberately does NOT invent fence wording.
alternative: let the surface keep authoring it indefinitely — rejected as the
  provisional's end-state because it is the last member-facing claim about the
  record's semantics that the record does not own.
recommendation: publish it via the prompt mechanism REC-16 built (one act publishes
  a prompt today; the machinery exists), with wording Bob confirms — the current
  surface sentence is a reasonable draft but it is a doctrine statement and should
  be his.
reversal cost: nil before publication; after, the usual wording-migration (the
  drift guard names it).
response: **PUBLISH IT, AND IT MUST STATE THE QUESTION CO-ATTESTATION ANSWERS.** Bob,
  2026-08-04: *"Yes, it must report the question it answers."* The plane owns the fence
  wording and publishes it with the act, via the prompt mechanism REC-16 built.
  **WHAT THE RULING CORRECTS, and it came out of Bob's own trial example**: he asked
  whether a coroner's courtroom testimony — held in the record only as a NEWSPAPER
  ACCOUNT, with a member who was present and a court transcript not yet published — was
  the co-attestation case. It is NOT, and the fact that it READ like one is the argument
  for publishing the sentence. The existing wording says what co-attestation DOES ("raises
  Grade B toward evidentiary weight") and what it CANNOT do ("never reaches Grade A") and
  never says WHAT QUESTION IT ANSWERS — so a reader reaches for it to solve a DIRECTNESS
  problem it has nothing to do with. If the project's own architect reaches for it that
  way, a volunteer certainly will.
  the wording is MINE to draft under this ruling and Bob amends it if it is wrong; drafted
  here so it is in the record rather than invented at a keyboard later:
  > **What co-attestation answers:** *when did these bytes exist?* It asks an independent
  > timestamp authority to record that this capture's exact bytes existed no later than a
  > fixed instant.
  > **What it does not answer:** whether the document is TRUE, whether its source is
  > authoritative, or how close it stands to the fact you are citing it for. A secondhand
  > report that is co-attested is still a secondhand report.
  > **What it is worth:** it strengthens a Grade B capture toward evidentiary weight. It
  > never reaches Grade A — that needs a chain-of-custody web archive this surface cannot
  > produce.
  The three-part shape is deliberate and each part earns its place: the first line is what
  the old sentence omitted, the second is the misreading Bob's example exposed, the third
  is the existing honesty fence unchanged.
decided: 2026-08-04 · Bob
reasoning recorded in: this entry; the wording ships in the plane's published prompt, and
  `BIO_Intake_Doctrine_v1_1.md`'s co-attestation section takes the pointer.
for CONDUCT to enact: publish the fence wording with the attest act through REC-16's
  prompt mechanism (one act publishes a prompt today — the machinery exists). **The UI
  stops authoring it**: `civicos-ui/app.html`'s `ATTEST_YIELDS_GRADE` constant and its
  hand-written honesty block render the PUBLISHED wording instead, and UI-24's rider is
  widened from "renders the published label" to "renders the published label AND the
  published fence, inventing neither." Keep the UI's negative control and RETARGET it: it
  must still fail if any surface claims Grade A, now sourced from the published wording
  rather than a local constant (correct the assertion, never exempt it). **AND SEE D-184**,
  which Bob's example surfaced and which this wording does not fix: a member's FIRSTHAND
  observation has no home as a basis leg, so the likely failure is a member citing the
  newspaper for a fact they personally witnessed.
enacted: 2026-08-04 · CONDUCT — REC-43 queued (publish the fence with the attest act through REC-16's prompt mechanism, imported from where the rule is enforced, the drafted wording verbatim — CORRECTED 2026-08-04 at REC-43's landing: this line first said "Bob's sentence verbatim", which this entry's own words contradict. The wording is CONDUCT's draft under Bob's ruling, which he amends if it is wrong. A record that misattributes a sentence is the overclaim this project refuses, so it is corrected here rather than left standing) and UI-28 queued (the surface stops authoring it: ATTEST_YIELDS_GRADE and the hand-written block render the publication; the existing negative control RETARGETED, never exempted, so it still fails on any Grade A claim). D-184's firsthand-observation gap noted as NOT fixed by the wording and left on its row. Reasoning in this entry and QUEUE.md (REC-43/UI-28).
### DEC-43 · answered
raised: 2026-08-04 · CONDUCT (lifted from REC-33's report)
for: bob
question: When does `#monitorToken()`'s ADMIN_TOKEN fallback retire, and what tells us
  it is safe to? The fallback is what stops installed instances breaking when the
  plane learns the daemon class before any installer binds it (DEC-37's own
  sequencing). It is also a silent, permanent licence for root-of-trust monitoring:
  an instance that never binds DAEMON_TOKEN keeps spending ADMIN_TOKEN forever and
  NOTHING reports it except an operator reading op=selftest.
why it is Bob's: it decides whether DEC-37's containment is real in the field or
  advisory. The fleet-visibility half is D-116's version-authority problem wearing a
  credential, and the posture is his.
provisional: the fallback stays (nothing breaks, containment is opt-in per instance).
alternative: (a) sunset it when DIST-2 lands and instances have had one update cycle;
  (b) keep it but make the fleet visible — a report of which instances still run on
  the fallback, so the gap is a number rather than a hope; (c) leave it indefinitely
  and accept the ruling is advisory in the field.
recommendation: (b) then (a) — measure who is still on the fallback before removing
  it, because removing it blind re-inerts monitoring on any instance that missed the
  update, which is the failure DIST-1's constraint exists to prevent, arriving from
  the other side.
reversal cost: low either way while the fallback stands; high if it is removed before
  the fleet is visible.
response: **(b) THEN (a), AS RECOMMENDED — and the sequencing makes it tactical rather than
  doctrinal.** The record already rules the halves: MEASURE, DO NOT ASSUME (CLAUDE.md) makes
  the fleet-visibility report the precondition of any removal, and DIST-1's own constraint
  names blind removal as the failure it exists to prevent. What was genuinely Bob's — is
  DEC-37's containment advisory or real? — resolves itself under (b): once the count of
  fallback-running instances is a number, the posture is enforced by evidence rather than
  hope, which is this record's standard mechanism. The fallback stays until DIST-2 has
  landed, one update cycle has passed, and the measured count is zero or its remainder is
  knowingly accepted.
decided: 2026-08-10 · session BOB, from standing doctrine, under the standing delegation.
  The fleet-visibility work item is handed to CONDUCT through the BOB INBOX.
enacted: 2026-08-10 · CONDUCT — **DIST-4 queued**, and placed in DIST rather than in CONDUCT's
  own lane because the report is fleet/instance ground and DIST runs as its own session. The
  ruling's ORDER is carried onto the row as the row's own constraint and is explicitly not
  CONDUCT's to compress: the fallback stays until DIST-2 has landed, one update cycle has
  passed, and the measured count is zero **or its remainder is KNOWINGLY ACCEPTED** — a stated
  act, never a silence. The row's first negative control is the one this decision was raised
  about: a fallback-running instance that reads as clean. Two constraints added at enactment
  that the response implies rather than states — the answer must derive from what each instance
  REPORTS rather than from what the installer intended to bind (an intent is not a measurement,
  the same rule that makes `deploy.mjs` read the bytes back), and no token VALUE may appear in
  the output, since `tokens.mjs`'s publication-revokes rule makes a report a publication.
  Reasoning in this entry and QUEUE.md (DIST-4).

### DEC-53 · answered
raised: 2026-08-04 · CONDUCT (lifted from REC-40's report)
for: bob
question: How far may the MACHINE propose toward an ESTABLISHED record? Until REC-40,
  every candidate this control could offer was Grade C — `needs_confirmation`, a
  proposal the member had to affirm. REC-40 makes the identifier tiers reachable in
  one call, so the same list can now offer Grade A and B candidates, and `#isEstablished`
  treats A and B as ESTABLISHED. **So a member is now one click from an established
  resolution off a machine-composed list.** Nothing invents anything — the candidate is
  a real correspondence the record found, and `op=resolve` is still the only thing that
  grades — but the ceiling on what a machine may put in front of a member has moved.
why it is Bob's: this is "less narrative" as a constraint on US, which CLAUDE.md names as
  the primary threat model — the risk that the record claims more than the evidence
  supports, arriving through convenience rather than through error. Whether a machine may
  propose something the member can accept AS ESTABLISHED in one act is a doctrine question
  about how the record gets built, not a UI affordance.
provisional: as shipped — A and B candidates are offered, ranked, and each carries
  `grade_if_resolved` saying exactly what resolving it WOULD mint, null where the name
  merely sits inside a longer string or a stronger identifier would resolve first. The
  conditional is honest and the surface composes none of it.
alternative: cap what the list may OFFER at C regardless of what the tier would mint, so
  every machine-composed candidate stays a proposal the member must affirm as a
  proposal — the stronger candidates would still be found, just never pre-graded.
recommendation: ship as-is, and revisit if a real group ever resolves in bulk. An A-tier
  correspondence — the reference IS the subject's registered identifier — is not a guess
  the machine made; refusing to say so would be its own kind of dishonesty, and the member
  still performs the act. But the number to watch is how often a member accepts without
  reading, and nobody is measuring that today.
what reversing costs: one predicate at the read, and the ranking already exists — cheap
  now, and cheaper than it will ever be again once resolutions exist in volume.

**NOTE 2026-08-07:** this entry's revisit trigger — bulk resolution — FIRED via DEC-52's
2026-08-06 bulk-approval mechanism; re-put before the sidebar is built. *(Note added by
session BOB.)*
response: **ANSWERED BY DEC-52's RULING, which arrived after this was raised and covers a
  strictly stronger act.** Bob, 2026-08-07, on DEC-52: "allowing the machine to rule doesn't
  go against doctrine. So it can rule" — a machine credential may declare, resolve and
  thread DIRECTLY into the record, machine-attributed. Offering a ranked, honestly-graded
  candidate that a MEMBER must still accept is strictly weaker than what that ruling
  licenses, so the cap-at-C alternative would fence a proposal while the record permits the
  act itself. The guardrails that make it safe are already pinned by DEC-52's enactment:
  the record names the machine principal, a machine statement is visibly machine-attributed
  (D-82), grades stay EARNED (`op=resolve` is the only grader, `grade_if_resolved` is
  conditional and honest). Bulk acceptance is the same act over a set (Bob, 2026-08-06).
decided: 2026-08-10 · session BOB, resting on DEC-52 (Bob, 2026-08-07) — recorded under the
  standing delegation to close from the corpus what the corpus already answers.
  **WATCH ITEM carried, not dropped:** the number to watch remains how often a member
  accepts without reading; nobody measures it today. Named in the BOB INBOX so measurement
  is scheduled deliberately rather than remembered.
enacted: 2026-08-10 · CONDUCT — **VF-6 queued** in the M0 background lane, out of band the way
  COFF-6 and CPDF-9 ran, since a measurement holds no slot. The carried watch item is the whole
  of it: *the number to watch is how often a member accepts without reading, and nobody is
  measuring that today.* **One obligation added at enactment, because without it the item would
  produce its own failure mode:** "read" is not directly observable, so the item must STATE what
  its proxy measures and what it would MISS before shipping a figure — a proxy presented as the
  thing itself is this record's overclaim class arriving in an instrument, the same defect as a
  self-reported confidence thresholded as calibrated, one altitude up. A stated `undetermined`
  is a legitimate result and is pinned as one: if the surfaces cannot distinguish read from
  unread, that ABSENCE is the finding, and an absent signal must never read as a measured zero.
  Reasoning in this entry and QUEUE.md (VF-6).

### DEC-51 · answered
raised: 2026-08-04 · CONDUCT (lifted from UI-32's report, on REC-48's own written instruction)
for: bob
question: Should `op=acquire`'s grade note reach a MEMBER, or only the caller it was
  written for? REC-48 wrote at `acquireGradeNote` that the note is a receipt handed to a
  caller deciding nothing — and that if a later reading found the receipt is where members
  actually form the belief, that would be "a ruling about which surface owns the fence, not
  an edit to make here quietly." UI-32 is that later reading. `addCapture` receives the note
  on every member capture and DISCARDS it, so a member's only account of what a capture is
  worth arrives on the document page after the fact.
why it is Bob's: DEC-39 was exactly this kind of ruling — where a doctrine sentence stands
  and who owns it. This asks whether a second account stands at the moment of capture, which
  is where the belief is actually formed. It also decides whether someone who has NOT been
  offered co-attestation is told what it would be worth.
provisional: as shipped — the note is received and not rendered. UI-32 removed the grade
  letter from that surface entirely, so nothing there overclaims today; the member simply
  gets no account of capture strength until afterwards.
alternative: render it at the moment of capture. It would be the one place the record's own
  words about capture strength reach the member while they are deciding — and it would put a
  second, shorter account of co-attestation in front of someone who has not been offered the
  act, which is the risk UI-32 names.
recommendation: render the part that describes THIS capture's standing and not the
  co-attestation clause, because the clause describes an act unavailable at that surface —
  but that is a splitting question I did not settle unilaterally, since DEC-39's three-part
  shape was deliberate and UI-28 measured that the parts reassemble character for character.
  If you want it whole or not at all, say so and both are one item.
what reversing costs: one surface change either way; nothing in the plane moves.
response: **RENDER IT — WHOLE — AT THE MOMENT OF CAPTURE.** DEC-39 already rules the
  substance: the plane owns the fence wording and PUBLISHES IT WITH THE ACT, and the act
  here is the capture itself; a surface that receives the record's own account and
  discards it is withholding at exactly the moment the member forms the belief, which the
  failure asymmetry forbids (when uncertain, be noisy). WHOLE, not split: DEC-39's
  three-part shape was deliberate, its ruling requires the sentence to state the question
  co-attestation answers precisely so a reader does not misapply it, and UI-28 measured
  the parts reassemble character-for-character — the clause describing an act unavailable
  at this surface is exactly the sentence that stops a member reaching for co-attestation
  to solve a problem it does not address.
decided: 2026-08-10 · session BOB, resting on DEC-39 (Bob, 2026-08-04) and DEC-49's
  translation discipline, under the standing delegation. The one surface change is handed
  to CONDUCT through the BOB INBOX.
enacted: 2026-08-10 · CONDUCT — **UI-54 queued.** The row carries the ruling's two load-bearing
  halves rather than only its verdict: the note is rendered AT THE MOMENT OF CAPTURE (DEC-39's
  publish-the-fence-with-the-act, and the act here is the capture itself), and it is rendered
  **WHOLE — the co-attestation clause SHIPS.** The row states why, because that clause is what a
  tidying worker would strip as irrelevant to a surface that cannot offer the act: it is exactly
  the sentence that stops a member reaching for co-attestation to solve a problem it does not
  address, and UI-28 measured that the three parts reassemble character-for-character. Its first
  negative control is therefore the dropped clause — a rendering that is merely *most* of the
  note is the split Bob refused. VERBATIM under DEC-49, asserted against the plane's own export
  and never a harness literal (a hand copy agrees at zero cost; this project has measured that
  five times on five subjects). **UI-32's removal of the surface-COMPUTED grade letter stands
  and is pinned as an over-strictness arm** — this item renders the plane's sentence, never a
  letter the surface derived. Reasoning in this entry and QUEUE.md (UI-54). **LANDED 2026-08-10 at
  `a63c1b5`**, merged on `main`: the note renders at the moment of capture and the
  CO-ATTESTATION CLAUSE SHIPS, asserted three ways — present by name, per-clause, and
  string-for-string against the plane's own recomposed export. **The whole-not-split arm is
  the one this ruling turns on, and armed alone it goes RED while NOTHING ELSE in either tree
  notices** — which is exactly what earns the assertion, since a rendering that is merely most
  of the note would otherwise ship green. UI-32's grade-letter removal is unmoved and pinned.

### DEC-50 · answered
raised: 2026-08-04 · CONDUCT (lifted from REC-45's report; **renumbered TWICE** — first from a colliding DEC-46, then from a colliding DEC-47, both allocated by the BOB session within hours. The BOB entries keep both numbers; this one moves, because the architect's numbers are the ones other documents will already be citing)
for: bob
question: A GROUPED question cannot take a new leg. Once a basis names grounds,
  REC-42's total-or-absent rule refuses `op=cite` — every leg must belong to a ground,
  and a citing member is not asserting where the new leg belongs. Should a new leg
  instead default to NECESSARY (unlabelled, i.e. AND, i.e. weakest-leg), or should
  citing stay refused until the member ungroups, cites, and regroups with a reason?
why it is Bob's: it decides whether adding evidence to a structured case is a
  friction the member walks around or a moment the record makes them account for, and
  DEC-32's whole containment is that independent sufficiency needs an affirmative act.
provisional: as shipped — refused, with the route through REC-45's act (ungroup with
  a reason → cite → regroup). Nothing is blocked; the route exists and is attributed.
alternative: a new leg lands unlabelled and NECESSARY, which is REC-42's own default
  and is equally conservative on the arithmetic (AND takes the weakest, so a new leg
  can only weaken or leave unchanged) — but it lets a structured basis grow without
  anyone saying where the evidence belongs.
recommendation: leaning to the shipped refusal, because the whole point of the
  partition is that someone asserted it; a leg that arrives outside every ground makes
  the assertion quietly incomplete. But the friction is real and lands on the member
  doing the most work, so it is worth his eye rather than my preference.
reversal cost: low either way — one predicate at the cite path plus the suites that
  pin it.
response: **THE SHIPPED REFUSAL STANDS.** DEC-32's containment already answers it: the
  partition of a grouped question is an ASSERTION someone made, and independent
  sufficiency needs an affirmative act — a leg that lands outside every ground makes the
  assertion quietly incomplete, which is the overclaim class this record refuses
  ("derived things inform, authored acts bind"). The route through REC-45's act
  (ungroup with a reason → cite → regroup) keeps the member's account attributed, and the
  friction lands exactly where the accounting belongs: on the person changing a structured
  case's shape.
decided: 2026-08-10 · session BOB, resting on DEC-32 (Bob's ruled arithmetic and
  containment), under the standing delegation. Nothing to enact; the suites already pin
  the refusal.
enacted: 2026-08-10 · CONDUCT — **NO CHANGE, and the no-change is the enactment.** The shipped
  refusal stands: `op=cite` against a GROUPED question stays refused, and the route through
  REC-45's attributed act (ungroup with a reason → cite → regroup) stays the only way a
  structured basis grows. No queue item is owed, no code moves, and the suites that pin the
  refusal are unchanged — **so the thing this line exists to prevent is a later session reading
  an unenacted ruling as unfinished work and "fixing" it by relaxing the predicate.** It is not
  unfinished. Recorded here rather than left to inference because a decided-and-not-enacted
  entry is indistinguishable, from outside, from one nobody got to. Reasoning in this entry and
  DEBT.md is not involved; the doctrine is DEC-32's containment, quoted in this entry's response.

### DEC-48 · answered
raised: 2026-08-04 · CONDUCT (lifted from REC-44's report)
for: bob
question: A NON-CASE ratification no longer produces a container. REC-44 separated the
  altitudes, and DEC-34's container is the PUBLISHED CASE's — an information bundle is
  not a case, so manufacturing a container for one was D-187's conflation a level down.
  Should a group be able to get a portable, hash-verifiable zip of a single captured
  DOCUMENT (not a case)?
why it is Bob's: it is a capability question about what a group can carry out of the
  system — the sovereignty promise's neighbourhood — not a refactor.
provisional: as shipped — no container for a non-case ratification. The bytes stay
  answerable BY HASH, and op=publishedcase still answers for such a bundle as what it
  is (caseId: null, no scope, no completeness), so nothing is lost except the zip.
alternative: name a document-container capability deliberately (its own manifest
  format and its own header rules), rather than keeping one as a side effect of a
  shape that turned out to be wrong.
recommendation: leave it out until a group asks. A container that exists because a
  code path used to make one is exactly the kind of artifact whose rules nobody has
  thought through — and DEC-34's header rules are written for a CASE.
reversal cost: low; it is a capability to add, not one to unwind.
response: **AS RECOMMENDED — no container until a group asks.** The corpus already rules
  this class: "a capability that does not serve the path is not obviously worth building"
  (CLAUDE.md, Bob 2026-08-01), and DEC-34's header rules are written for a CASE, so a
  document container kept as a side effect would be an artifact whose rules nobody thought
  through. Nothing is lost meanwhile — the bytes stay answerable BY HASH and
  op=publishedcase answers honestly for a non-case bundle.
decided: 2026-08-10 · session BOB, applying Bob's own stated capability doctrine, under the
  standing delegation. Nothing to enact; the shipped behaviour stands.
enacted: 2026-08-10 · CONDUCT — **NO CHANGE, and the no-change is the enactment.** No container
  for a non-case ratification, and none is built until a group asks — `CLAUDE.md`'s capability
  doctrine (*a capability that does not serve the path is not obviously worth building*), and
  DEC-34's header rules are written for a CASE, so a document container kept as a side effect
  of a shape that turned out to be wrong would be an artifact whose rules nobody thought
  through. Nothing is lost meanwhile and that is checkable rather than asserted: the bytes stay
  answerable BY HASH, and `op=publishedcase` still answers honestly for such a bundle as what it
  is (`caseId: null`, no scope, no completeness). **No queue item is owed** — recorded explicitly
  so the absence of one is not later read as an oversight. The reversal cost stays low by
  construction: this is a capability to ADD when a group asks, never one to unwind. Reasoning in
  this entry.


### DEC-73 · answered · enacted
raised: 2026-09-10 · CONDUCT #9 (lifted from CPDF-14's report at integration)
enacted: 2026-09-11 · CONDUCT #9, and the enactment is NIL-ACTION by the answer's own
  terms — the status quo IS the decision, so nothing is built, configured, or unwound;
  the provisional (commits continue with the current identity) simply stops being
  provisional. The reasoning lives in this entry's own `response:` (Bob's measured
  ruling: 1,170 commits, metadata only, the record identifies signers by key and
  namespace, never by email). Recorded in the enacting commit on `main`.
for: bob
response: "So using my neo address for git commits is fine. This is a non-issue."
  (Bob, 2026-09-11, to BOB after the exposure was measured for him: the address
  appears ONLY in git commit metadata — 1,170 commits on `main`, not the 30 the
  entry spot-checked — and NOWHERE the record touches: zero occurrences in tracked
  content (the sole match is this entry quoting it), none in the plane, installer
  or UI, and a published case identifies its signer by SSH key and namespace, never
  by email. The exposure is development-history bookkeeping; the record is clean.)
decided: commits continue with the current identity — the status quo IS the decision,
  not a provisional awaiting a better one. No repo-local `user.email` override, no
  history change. Nothing to enact; the entry closes on the answer alone.
question: Every commit on `main` — the whole visible history, 30 of 30 checked — is
  authored `Bob Krause <neobobkrause@gmail.com>`, the NEO persona's email, on the BIO
  project's public GitHub repository (`believeinoakland/bio`, the biobobkrause persona).
  The standing rule ("the machine defaults to the neo persona which must not be used")
  has been enforced for push credentials and the Cloudflare account, but the git AUTHOR
  identity was never covered, and `~/.gitconfig` supplies the neo email to every commit.
  Should commits going forward carry a bio-persona author identity, and if so which
  name/email — and does the existing history stand as-is?
why it is Bob's: it is his public identity linkage, not a mechanism. The two personas
  exist to be separable, and the author field on a public repo links them for anyone who
  looks; only Bob can weigh whether that linkage matters and what identity should appear.
  Rewriting history is NOT proposed under any answer (never force-push).
provisional: commits continue with the current identity — CONDUCT choosing a new public
  author identity for Bob unilaterally would be worse than one more day of the status
  quo, and 30 commits already carry it, so marginal exposure per commit is nil.
alternative: a repo-local `git config user.email <bio address>` (one command, this
  checkout and each worktree created after it), which stops the linkage growing without
  touching history.
recommendation: set the repo-local identity to the bio persona's address once Bob names
  it; leave history alone.
what reversing costs: nothing — a repo-local config is one line to set or unset.

### DEC-74 · answered
raised: 2026-09-10 · CONDUCT #9 (CPDF-14's verdict at integration)
for: bob
question: CPDF-14 measured the composed shape (detect → crop → transcribe) and the
  verdict is NO-GO on the non-negotiable: the image-region ANCHOR itself does not
  reproduce (1/8 pages returned the same box count across three detect runs on identical
  bytes; half the boxes have no counterpart at IoU≥0.5), transcription reproducibility is
  worse than the default path, and the invention band moved DOWN the ladder (R1 minted 7
  digits composed where the default path minted 0). That exhausts DEC-35's in-account
  candidates for Tier-3 OCR — Moondream default NO-GO (CPDF-12), Moondream composed NO-GO
  (CPDF-14) — leaving tesseract-as-fleet-member (DEC-42's CPU question, unmeasured on the
  runtime, D-245) and the EXTERNAL tier (Azure DI Read primary), which DEC-35 rules is
  never funded without your word. Fund the external tier, direct the tesseract runtime
  probe first, or accept that image-only documents (13 of 1,458 censused Oakland pages)
  have no Tier-3 text path for now?
why it is Bob's: funding a vendor account is his risk and his money (DEC-35 said NOTHING
  FUNDED in so many words), and accepting a capability gap on the record's reach is a
  product-priority call, not a mechanism.
provisional: CPDF-10 is BLOCKED and nothing is built or funded; the measured incidence
  (13 image-only pages of 1,458, concentrated in two documents) says the gap is real and
  small, so nothing degrades meanwhile that was working before.
alternative: the tesseract runtime probe (DEC-42's line) is in-account and unfunded —
  it could run as a measurement item first and might make the funding question moot in
  either direction.
recommendation: run the tesseract runtime probe before funding anything — it is the
  cheap measurement standing between you and a vendor account, and CPDF-14's instrument
  discipline (comparability guard, blank/noise controls) is reusable on it as-is.
what reversing costs: funding later costs only the days waited; funding now and finding
  tesseract sufficed costs an external dependency the D-115 class exists to avoid.
response: **NOT FUNDED — AND THE QUESTION IS NARROWER THAN RAISED.** Decided by BOB #11 at
  Bob's delegation of 2026-09-14 ("low level issues you should figure out yourself"). Since
  the item was raised its own recommendation was taken: CPDF-10 measured tesseract-wasm GO on
  the deployed runtime and shipped it as the `ocr-worker` member at 0.58.0, chain
  `pixels → ocr(tesseract-wasm 0.11.0)`, cap C (Part II §16). So image-only pages HAVE a
  tier-3 text path, and the only question left is a tier ABOVE C — which nothing measured
  needs: 13 image-only pages of 1,458, in two documents, and no case rests on them. The
  external tier is reconsidered when an image-only document is LOAD-BEARING in a real case
  and C is below that project's bar; that is a funding request with a document and a bar
  attached, brought to Bob then — DEC-35's word still governs spending.
decided: 2026-09-14 · BOB #11, delegated by Bob the same day
enacted: 2026-09-14 · session BOB #11, same turn — nothing to build and nothing to fund: the
  reasoning is folded into `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6 and
  `BIO_Content_Framework_v0_10.md` Part II §18 row 4; no row opens.

### DEC-75 · enacted
raised: 2026-09-14 · CONDUCT #11 (CAP-8's provisional at integration; `node tools/decided.mjs "conversion"` and `"direct fetch grade"` answer nothing — no ruling carrying a marker touches this)
for: bob
question: A Google Drive export is Google's CONVERSION of the document, performed at fetch
  time and not reproducible (D-351: three exports of one unchanged document, three distinct
  `capture_sha`). CAP-8 files it as a direct fetch at capture grade B, with the conversion
  disclosed as TECHNIQUE on the hop (`via` stays "direct"; no third term). Should a
  CONVERSION cap the capture axis BELOW a direct capture of the publisher's original bytes —
  a letter for "the bytes are a rendering the record cannot re-derive" — or is capture
  grade about the fetch path alone, with conversion belonging to the fidelity axis
  (DEC-4's "no third scale")?
why it is Bob's: it is a capture-axis doctrine VALUE (REC-50's precedent: the grade
  vocabulary is Bob's), and it decides what the record claims about hundreds of the city's
  Drive-linked documents (CAP-7: 50 links in the 3.6% sample) — an overclaim in the
  direction CLAUDE.md names as worse than a missing feature, if B is too strong.
provisional: CAP-8 as landed — grade B, the conversion on the hop's `asserts`/`evidence`
  in words, `unsigned_reason` stating the bytes are not the original file, D-351 open on
  the byte-instability. Reversal cost: one letter at `driveHop`'s site plus a re-grade of
  every Drive capture then in the record (a migration the size of REC-88's), and nothing
  else moves — the hop's facts are already the ones a re-grade would read.
alternative: fold it into REC-88 (the fidelity bound on the capture axis, DEC-4 enforced),
  reading "conversion at fetch time" as a fidelity step with a cap, which reaches the same
  letter without a new capture-axis value — CONDUCT's recommendation if Bob wants no new
  vocabulary: it keeps "no third scale" literally true.
response: **CAPTURE GRADE IS ABOUT THE FETCH PATH; A CONVERSION IS A DERIVATION STEP IN THE
  CHAIN, AND THE RECORD ALREADY RULES HOW THOSE COMPOSE.** Decided by BOB #11 at Bob's
  delegation of 2026-09-14 — the question is DEC-4 applied, not a new value. No third scale
  and no new capture-axis letter: the hop stays `direct`, grade B (the bytes came from the
  address the record reasons about, at that time, by our own fetch). What Google did to the
  document is a TRANSFORMATION OF THE TEXT, and Part I's chain rules already say what a
  transformation is worth: every derivation step weakens, and a step whose fidelity was never
  measured has cap UNDETERMINED, stated, never a letter. So the export's chain carries a
  `convert(google-export, <format>)` step ahead of `layer`, with cap undetermined; REC-88's
  `captureBound` then bounds any leg on a Drive export by that weakest link — the leg claims
  UNDETERMINED on the capture axis, stated, until the step is CALIBRATED (Part II §14.3's
  content-axis staleness rule): a measurement of the export's TEXT stability and fidelity
  across fetches, which D-351 already half-took (`.ods` `content.xml` byte-identical across
  three exports; `.odt` differs by a style name). This claims LESS than CAP-8's provisional,
  which is the direction CLAUDE.md prefers, and a calibration row raises it later without a
  migration — the reverse (a letter now, lowered later under authored legs) is the move
  Bob's 5.8 forbids.
decided: 2026-09-14 · BOB #11, delegated by Bob the same day
reasoning recorded in: this entry; folded into `BIO_Content_Framework_v0_10.md` Part II §16 (the
  Drive paragraph).
for CONDUCT to enact: the `convert(producer, format)` step kind on I2 (its own IC, minted at
  spawn — FRAMEWORK dormant, answer-for), emitted by CAP-8's `driveHop` path ahead of `layer`
  with cap null; REC-88's `captureBound` reads it as any other step (no code beyond the kind);
  one measurement item — the export step's calibration over the census's Drive targets, text
  stability and fidelity, recorded per format; D-351 keeps its own row (byte instability is a
  trust-root problem, not a grade one). Nothing in CAP-8 as landed is undone.
enacted: 2026-09-14 · CONDUCT #11 at the drain — the three acts are ROWS: CAP-10 (the `convert(producer, format)` step kind on I2, its IC minted at spawn, emitted by `driveHop` ahead of `layer` with cap null), CAP-11 (the export step's calibration measurement over the census's Drive targets), and REC-88's scope note (`captureBound` reads the step as any other — no code beyond the kind). The reasoning lives in this entry and in `BIO_Content_Framework_v0_10.md` Part II §16 (BOB #11's fold, 37ee338). CAP-8 as landed is not undone; its provisional (grade B, conversion disclosed on the hop) runs until CAP-10 lands, which claims LESS.

### DEC-76 · answered
raised: 2026-09-29 · a design session with Bob (the UX canon's open question: how a contradiction is presented to a member, and what resolving one looks like)
for: bob
question: Is a contradiction binary (two things the record holds that cannot both be true), and how do PRESENT and RESOLVE treat the cases where silent assumptions make two assertions only APPEAR to conflict, where two applicable rules direct contrary acts, and where an obligation and the government's act diverge?
why it is Bob's: doctrine (what a contradiction IS), architecture (which object holds its resolution) and requirements (the resolution vocabulary, and a publication rule).
provisional: nothing is blocked. IDENTIFY is built (`contradiction` module, R1–R16); nothing shows a candidate to a member.
alternative: keep the canon's reading (a RECORD contradiction is two held things that cannot both be so), design PRESENT and RESOLVE as a new workflow with its own object, and leave the irreconcilable pair waiting on the claim object.
recommendation: the four rulings below, as recommended in the session.
reversal cost: low until PRESENT and RESOLVE are designed; nothing is built on either reading.
response: **Bob agreed with all four recommendations, 2026-09-29.**
  1. DOCTRINE. A contradiction is CONDITIONAL: two assertions that cannot both hold IN THE SAME RESPECT (the same subject, time or occasion, scope, meaning of terms, observer or method, accurate capture, and for rules the same applicability). A candidate is an apparent conflict whose shared coordinates are assumed. Resolving it is finding the respect in which the sides differ, finding the side that is wrong, or recording that the conflict is genuine. A coordinate offered to dissolve a conflict is itself a claim that needs evidence; until it has it, the conflict is hypothetically dissolved, not resolved. The machine may PROPOSE which coordinates differ, labelled as machine work; it never picks one (DEC-24).
  2. ARCHITECTURE. A candidate a member takes up becomes an INQUIRY (the one recursive object): its question is how both sides can be held or which is wrong, both sides are its legs, each assumption explored is a sub-inquiry, and resolving it is the inquiry's conclusion, which records its KIND. The IRRECONCILABLE PAIR is expressed without a claim object: an inquiry that concludes both sides are well supported and the record keeps both without choosing, or that stays open while evidence builds.
  3. REQUIREMENTS. Resolution kinds fall in three families. DISSOLVED (a coordinate differed: subject, time or occasion, scope, meaning, observer or method, precision; also a difference of opinion, two attributed opinions): both sides stay, each gains the distinguishing qualifier, evidenced or marked hypothesis; a wrong subject match also reports a defect in `entities`. CORRECTED (misquote, transcription or reading error, a superseded version): the wrong side goes `stale` with its reason and is never deleted; this discharges the RECORD case's duty. GENUINE: double-speak or reversal by a subject PROMOTES into a finding; OBLIGATION AGAINST ACT routes into `conformance` (its determination rows are exactly that shape), so contradiction is a source of determinations and never a second compliance mechanism; a CONFLICT OF NORMS is explored by the canons that reconcile rules (higher over lower, later over earlier through `standards`' periods and `supersedes`, specific over general, and harmonization, which is the dissolved family applied to rules), and a conflict none of them reconciles is itself a finding that may support an `unclear` determination and an action; IRRECONCILABLE, both held, no choice made. WORLD candidates carry no duty and reach a member as leads to take up or dismiss with a reason (the dismissals feed the over-strictness measurement); RECORD candidates carry the duty, wait in a member's queue until resolved, and mark each side "in tension" wherever it is shown.
  4. DOCTRINE. A finding whose basis holds an unresolved RECORD contradiction may be published, and the contradiction is disclosed in the published record, stated and attributed (the pattern of `NO_FALSIFIER`'s override; the gate belongs at publication, and it discloses rather than blocks).
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Case_Making_v0_1.md` §CONTRADICTION (the RULED 2026-09-29 subsection).
owed: a level-2 PRESENT and RESOLVE design on these terms (continuing `CONTRADICTION-IDENTIFY-DESIGN.md` §9 item 4), then the requirement changes it implies in `contradiction`, `inquiry`, `conformance` and `publication` for Bob's approval, then a tranche entry; and the UX substrate's in-flux entry for contradictions updated.

### DEC-77 · answered
raised: 2026-09-29 · the same design session with Bob, following DEC-76
for: bob
question: How are contradictions presented in the member UX (a dedicated screen, or inline where the conflicting points already sit), which presentation forms are used, and may context the system holds shape defaults, appearance and recommendations without directing a member into an incorrect choice?
why it is Bob's: UX, and doctrine: it narrows the member screens' standing reading of DEC-24 that nothing is preselected and that adopting a machine proposal is not an act the record has.
provisional: nothing is blocked; nothing shows a candidate to a member.
alternative: a dedicated contradiction screen as the norm, and the strict reading kept (nothing filled in, no act of accepting a proposal).
recommendation: the three rulings below, as recommended in the session.
reversal cost: low until PRESENT and RESOLVE are designed and built.
response: **Bob agreed, 2026-09-29.**
  1. INLINE BY DEFAULT. Wherever two conflicting points already appear together (an inquiry's supporting and cutting-against legs, alternative basis versions, a determination's disagreement or its two standards, cases that disagree, a subject two sources describe differently, a newer capture that no longer holds a cited passage, a machine proposal beside a member's list, two projects' conclusions on one inquiry), a tension mark opens a short clarifier asking HOW DO THESE DIFFER, with DEC-76's coordinates as multi-select choices (different time or occasion, part or scope, meaning, observer or method, not the same subject), plus one of them is wrong, they really conflict, and not sure. A differs choice records a stated explanation: resolved in one act when its evidence is on the screen, otherwise marked explained, not yet shown, and the tension mark softens without clearing. One of them is wrong asks which and a required reason, and that side goes stale. They really conflict and not sure open the contradiction inquiry, the dedicated screen, which is the escalation and never the norm. Closing a RECORD tension names its reason and its member; a WORLD lead dismisses in one act. Aspirations are excluded: they are in contact, never in contradiction (Content Framework).
  2. SIX PRESENTATION FORMS, one per purpose: both sides in the record's own words with source, date, doctype and why they were paired (the compare view; seeing it); a timeline for a reversal (understanding it); an assumptions checklist, the Key Assumptions Check, as the contradiction inquiry's working view (clarifying it); a competing-hypotheses matrix for a conflict that will not dissolve and for a conflict of norms, its columns the canons that reconcile rules (weighing it); Criteria, Condition, Cause, Effect and Recommendation (the government auditing standard's elements of a finding) as the published form of an obligation-against-act finding, which adds CAUSE, held today by no requirement (pointing the finger); and an in-place tension marker wherever either side of an unresolved RECORD contradiction is shown, published as an attributed sentence (signalling it).
  3. CONTEXT SUPPORTS, NEVER SILENTLY DECIDES. (a) A FACT the record holds is filled in with its source (two dates that differ, one issuing body): it directs no one, and the member still judges whether it explains the conflict. (b) A JUDGEMENT is RECOMMENDED with its reason, labelled machine work, shown first, and accepted in one act; the record keeps whether the member chose unaided or accepted a recommendation, and which one. This is a new act, ACCEPTING A PROPOSAL, attributed like any other, introduced for contradictions first; governing laws and risk tiers are reconsidered under it separately, not changed by this ruling. (c) Nothing is silently preselected: a value a member never saw does not enter the record under their name. Context also sets the choices offered and their order (obligation against act first in a determination; kinds of document change first on a changed capture), the weight (a RECORD duty against a dismissible WORLD lead) and the appearance (a quiet mark inside an inquiry, a disclosed notice on a published case). The guard against steering is measured: the acceptance rate of recommendations, per kind, is reported, and a rate near all is the signal that recommendations have become decisions and are reviewed, as the detector's false-conflict rate is.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Case_Making_v0_1.md` §CONTRADICTION beside DEC-76.
owed: carried into the level-2 PRESENT and RESOLVE design DEC-76 owes, and into the UX redesign's substrate (`docs/development/ux-substrate/`); the act of accepting a proposal needs its requirement (an attributed act naming the proposal accepted) in the modules that carry it.

### DEC-78 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 2)
for: bob
question: How does a knock become part of the record: what does pulling commit a member to, and how does the capture it becomes state its provenance?
why it is Bob's: intake doctrine (whether pulling vouches, and how an anonymous source is stated) and the knocker's experience (UX).
provisional: nothing is blocked; `pulled` is a status only (capture R32) and creates no capture.
alternative: pulling is the member vouching and becoming the source (Membership v2 §1.2 forbids it); or `pulled` stays a status and the member uploads the material separately, the link to the knock kept by hand.
recommendation: pulling admits the material with the doorbell as its stated provenance, and vouching stays with release.
reversal cost: low; nothing is built.
response: **As recommended, with two corrections of Bob's, 2026-09-29.**
  1. Pulling ADMITS the knock's material as a capture at `collected`, carrying the knock's receipt (its id, digest, byte count and time received), and commits the member to nothing more. Vouching stays with release.
  2. A KNOCK HAS A SOURCE. Bob: "A whistleblower is still a source, though unnamed." The record names the source as an unnamed knocker identified by the knock's receipt, never as unattributed or unknown; Intake Doctrine §2a's "NO attributed source" is corrected in place. The same holds for hand-carried material: its source is the person who handed it over, named or unnamed. In both, the member who pulled or brought the material in is on the capture too, as its capturing actor, and is never recorded as its source (Membership v2 §1.2).
  3. A KNOCKER MAY PROVE CONTINUITY. Bob's proposal: the knocker supplies the same identifier with every knock, proving to the system that the same person submitted them. Recorded with the safeguards that make it hold: the identifier is a SECRET the knocker keeps (an identifier others can see would let them impersonate); the record shows a pseudonym derived from it and states continuity as possession of the same secret, never as identity; it is optional, and a knocker may knock unlinked or with a fresh secret; it is held only as a keyed digest under an instance key, so no row or leak reveals it and the same secret at two groups does not link them; and the doorbell can generate a strong one and show it once on the receipt. The mechanism is BOB's.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §2a (the pulling paragraph, and the corrected sentence).
  4. THE NOTE AND THE CONTACT (Bob, 2026-09-29, as recommended; he also confirmed item 3's four safeguards): the note travels with the capture as the source's own words, labelled as the knocker's and never as evidence of its truth; the contact stays in the doorbell inbox, readable by members and never in the record or any publication, so a whistleblower's way of being reached cannot be published by accident; a member who needs it reads it there.
  5. A SOURCE'S IDENTITY EVOLVES (Bob, 2026-09-29, returning to question 2): "The system should support the evolution of an unknown source to a publicly known source." A confidential source may come to be known more widely: revealing themself to the group or in public, parts of their identity (an occupation, say) revealed in a whistleblower filing, or their identity found and exposed by forces hostile to their evidence. The record holds a source's identity as a history of disclosures, each dated and attributed, never as one field overwritten, and a capture keeps the source as it stood when received. Each disclosure records what was revealed (a link to a pseudonym, an attribute such as occupation, employer or role, a name), how it became known (the source themself, an official filing, a third party, a hostile exposure), who now knows it (a member, the group, the public) and its evidence; linking a revealed person to earlier knocks is itself a claim with evidence, the strongest being the person presenting the same knocker secret. It may be shown as a ladder in DEC-79's manner: unknown; the same knocker, proved by the secret; partly known; known to the group; publicly known, each rung with who knows and how. **Bob agreed to all five points, 2026-09-29, as recommended:**
     (a) The group is never the first to make a source more public: the record publishes an identity detail only with the source's consent to that audience, or where it is already public elsewhere, cited.
     (b) A hostile exposure is recorded as the exposer's claim ("named by X on date; not confirmed by the group"); confirming it is itself a disclosure and needs the source's consent.
     (c) "Known to the group, not recorded" is a first-class state, because a stored name can be breached or subpoenaed; a group that records one restricts its sight to named members and every read is logged (the mechanism is BOB's).
     (d) Consent to go public is asked at the moment of publishing, stated as permanent; a source may withdraw consent for future publications, and what is published stays published.
     (e) When a source's identity firms up (a filing confirms their role, say), the change in their material's weight reaches every finding resting on it as a re-evaluation notice, never a silent regrade.
owed: capture's requirements (a doorbell provenance with the knock's receipt; the pull act creating the capture; the knocker secret, its pseudonym and its keyed digest), and a home for a source and its disclosure history (item 5: the requirements of whichever module BOB places it in, with publication's consent check and reevaluation's notice), for Bob's approval; the UX page's open question 2 marked ruled.

### DEC-79 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 3)
for: bob
question: How does a project show its stage and its work products' readiness?
why it is Bob's: UX.
provisional: nothing is blocked; the stage is in canon only (N300, T12).
alternative: a text label or chip for the stage.
recommendation: the page's own: all four stages shown, `forming`, `investigating` and `matured` computed and `closed` the owner's reasoned act, with the readiness ladder shown only for rungs the record can earn, each unearned rung stated rather than hidden.
reversal cost: low; nothing is built.
response: **As recommended (which K362 and K364, recorded by BOB #61 the same day, already carry), and Bob set the display, 2026-09-29.** The stage is shown as coloured bars that build on top of each other as the project advances into each new stage, one bar per stage reached, giving a quick, space-efficient sense of where the project stands. Mousing over the bars discloses more; clicking them opens a larger display showing more about each stage and what is still needed to reach the next. Recorded with three conditions that follow from standing rules: what is still needed is stated from the same rule that computes the stage, so the display can never promise a stage the computation would not give; hover has a focus or tap equivalent, since phones and keyboards have no hover (UI-KICKOFF, devices); and `closed` shows its reason and never reads as a finished stack (an abandoned project is not a completed one), with each bar carrying its stage's name so colour is never the only signal.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.3.
owed: carried into N300's wording (T12) and the UX redesign; the UX page's open question 3 marked ruled.

### DEC-80 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 4)
for: bob
question: Does the publication ceremony still need to remain a placeholder, or can it be built now; and if built, how does an owner sign from the browser?
why it is Bob's: DEC-33 is his deferral; how a member signs is architecture and UX.
provisional: members reach a placeholder; the founder's session delivers signatures (D-421).
alternative: keep the placeholder and design the five steps on paper only; for signing, keep command-line `ssh-keygen` signing, or build a separate signing app.
recommendation: retire the placeholder; design and build the ceremony in the redesign; sign with a browser-held key.
reversal cost: low until built.
response: **As recommended, with browser signing (option b), Bob, 2026-09-29.**
  1. DEC-33's trigger has fired: Publication §5 reopens the ceremony "when Bob turns to the member surfaces", and the UX redesign is that. The ceremony (UI-17) and its pre-flight (REC-15) are designed and built in the redesign, and no placeholder of any sort remains.
  2. Its five steps (what becomes permanent; what this rests on; what you are leaving out; the edition this creates; sign) are re-derived for DEC-72, and step three carries today's rulings: any unresolved RECORD contradiction disclosed (DEC-76) and consent for any source identity the case reveals (DEC-78 item 5).
  3. The plane's pre-flight runs the real refusals, without writing, before the first screen; the uncleared-hunch refusal (case-authoring R12) lands with it.
  4. An owner signs in the browser with a browser-held key registered as their attesting key, producing the same `sshsig` signature the plane verifies, so strangers verify with `ssh-keygen` as before; the act is confirmed by passphrase or device unlock; a lost key is revoked and replaced as keys already are; founder delivery (D-421) stays as a fallback.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Publication_v0_1.md` §5.
owed: the ceremony's requirements (the pre-flight read, R12's refusal, the browser key's registration and signing) in `case-authoring`, `ratification`, `membership`, `affordances` and the interface, for Bob's approval; a tranche entry; the UX page's open question 4 marked ruled.

### DEC-81 · answered
raised: 2026-09-29 · the same design session with Bob (from the measures map: "no route builds a Grade A capture yet")
for: bob
question: Intake Doctrine §3 required Grade A before external distribution of any work product resting on a document, but no requirement enforces it and no route can produce A (the plane is a Worker: no browser, no raw exchange, no WARC writer). With the ceremony undeferred (DEC-80), what grade is enough to publish, and do we pursue A?
why it is Bob's: doctrine (what the published record may rest on).
provisional: no case has been published by a member; the rule was unenforced.
alternative: keep the rule and build an A route before the first publication.
recommendation: a co-attested B is enough to publish, disclosed on the case; research and measure a route to A in parallel.
reversal cost: low before the first member publication; afterwards a case published under the amended rule stays published, so a stricter rule applies only to later editions.
response: **As recommended, Bob, 2026-09-29.**
  1. A CO-ATTESTED Grade B (a trusted RFC 3161 timestamp over the capture's digest and a third-party co-archive of its locator, as capture R20 and provenance R32–R33 already produce) is sufficient to publish a work product resting on the document. The published case discloses each document's capture grade and whether it is co-attested. Grade A stays the ceiling for adversarial or legal use. Intake Doctrine §3's "required before external distribution" is corrected in place.
  2. WHETHER AND HOW TO SUPPORT GRADE A is researched now: what a credible WARC/WACZ capture must contain, the candidate routes (a hosted headless browser in the group's own Cloudflare account writing WACZ with Webrecorder's open-source tools; Browsertrix run elsewhere; hosted services), their fidelity, cost, sovereignty and verifiability, and a measurement plan on real city pages. The findings come back to Bob.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3 (Grades A and B).
  3. A LOAD-BEARING GRADE B WHOSE CO-ATTESTATION FAILED (a site that refuses the co-archive, a timestamp authority that did not answer) may be published, deliberately, visibly and repairably (Bob, 2026-09-29, as recommended): (a) the ceremony's pre-flight first retries: a timestamp obtained now over the same digest proves the bytes existed by now (weaker than at capture, and stated so), and a fresh co-archive whose bytes still match the digest corroborates the copy; (b) if still missing, the owner proceeds only by an attributed acknowledgement with a stated reason, in the pattern of `NO_FALSIFIER`'s override; (c) the case marks that document "self-attested only" in its disclosure, and the capturing member may add a signed account of when and how they captured it; (d) it is never refused outright, because some sources can never be co-archived and a refusal would push groups to drop evidence rather than disclose its limits. Why it matters, stated for readers: without co-attestation an outsider can verify the copy has not changed since capture and can follow the reasoning, but cannot independently verify that the source served those bytes, or when.
  4. GRADE A AND FURTHER CO-WITNESSES ARE DEFERRED (Bob, 2026-09-29): "there are potentially credible options for adding Grade A and co-attestation support. Those options should be fully documented in the repo. However I don't see the need for this support as being high enough a priority for us to be working on it now." The options are documented in full in `docs/development/GRADE-A-CAPTURE.md` (an in-plane browser recorder writing signed WACZ; Scoop or Browsertrix in a container; a member's own browser; hosted witnesses such as Perma.cc), with its three decisions and its measurement plan, and nothing is built. Co-attestation of Grade B (the RFC 3161 timestamp and the Internet Archive co-archive) is already built and is not deferred; what waits is the rest. Trigger: a group's published case is challenged on a document's authenticity; a group needs evidence for legal or adversarial use; the share of load-bearing documents published "self-attested only" becomes material (oaklandca.gov already refuses the Internet Archive's crawler); or Bob asks.
owed: the case document's per-document grade and co-attestation disclosure, the pre-flight's retry and the owner's acknowledgement (case-authoring, publication, capture), for Bob's approval. The Grade A research report is DONE (2026-09-29; documented in the repo at `docs/development/GRADE-A-CAPTURE.md`, rendered at https://claude.ai/artifact/1DdR6uNS7pyLuP7V6CWuZs): Grade A is reachable through the plane's existing Browser Rendering binding and CDP driver (`browserrender.mjs`) plus a hand-written WARC/WACZ writer, an instance ECDSA P-384 signature and an RFC 3161 token, earned per source class only after a measurement on seven Oakland source types; its three decisions (the Grade A rule text, a member-recorded WACZ's grade, whether an evidentiary capture observes `robots.txt`) are with Bob.

### DEC-82 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 5, which Bob reframed: before deciding how strength shows, members need a mental map of every scale)
for: bob
question: How does a member come to understand the many scales (grades, strength, stage, capture, connection, act weight) individually, in relation to each other, and in the system as a whole?
why it is Bob's: UX.
provisional: nothing is built; each scale is defined in its own canon document and no page relates them.
alternative: explain each scale where it appears, with no shared frame.
recommendation: one frame, five principles and a one-page map, reviewed and revised by Bob.
reversal cost: low; nothing is built.
response: **Approved by Bob, 2026-09-29, after one revision.** The frame: letters grade evidence, bars show progress, weights mark acts. The principles: one visual form per scale, used everywhere and for nothing else; every mark opens to its plain question; one unifying idea (an answer is only as strong as the weakest thing it depends on); state what grades never measure (a grade tells you how easily someone else could check it, never whether it is true); teach in context. Bob's calls on the first draft: colour marks the scale, never the value; a descriptive icon per scale; the same badge shape for every scale; one shared A–D scale, never disjoint letters; "Undetermined" and "Nobody looked" written alike as named terms; hover on every bar step, and a click on a reached step shows how it was reached.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; the approved page at `docs/development/ux-substrate/measures-map.html` (rendered at https://claude.ai/artifact/TfqcXNaJQ86SZzUA8Xn6Ni); folded into `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §M.
  QUESTION 5 ITSELF, decided against the map (Bob, 2026-09-29, as recommended): the project workspace SHOWS strength. Each question in the list shows its two strength badges (capture and connection, in the map's colours and icons, with a testimony badge beside them when an account is part of the answer), one plain phrase against the project's bar ("Meets the bar", "Short on connection", "Short on capture", or "Unrated": rests on nothing yet), and "Undetermined" named with its reason, never a blank; e.g. `[capture B] [connection C]  Short on connection · bar B/B`. It never shows one combined badge or score (DEC-44). Hovering a badge names the weakest document or link and how to raise it; a click opens the question's page with that leg highlighted. The old interface's grade-free workspace (UI-16's note) was an interface choice, not canon, and is superseded.
amended: 2026-10-05 by Bob through the development process (K1473, the second constructs study's C12 (a)): a combined measure with a stated formula is a computed fact, and a score standing for a judgment is a machine signal held only in the hypothesis layer (members see a "hint", DEC-131), with its method, inputs, each input's contribution and its measured false-alarm rate; never a grade, never cited by a claim, never moving a finding. The measures map's rule "never one combined score" stands for grades. Folded into the capability ladders §10 by BOB; the UX substrate's ruled entry for question 7 (as DEC-89's) cites it.
owed: the redesign's workspace and display primitives aligned to the map; the UX page's open question 5 marked ruled.

### DEC-83 · answered
raised: 2026-09-29 · BOB #65 (N327: four admin-only refusals converging on membership's `notAnAdmin`, K275)
for: bob
question: When refusals of one condition converge on one code, what does a member read: the shared general sentence, or each act's own specific sentence?
why it is Bob's: UX (the words a member reads).
provisional: four codes (`ADMIN_ONLY`, `AI_CREDENTIAL_ORG_NOT_ADMIN`, `GROUP_ASPIRATION_NOT_ADMIN`, `BIAS_ADOPTION_NOT_AN_ADMINISTRATOR`) each with its own sentence.
alternative: keep each code and its sentence (K275's exception for different conditions).
answer: The message is the standard one, followed by a specific recommendation of what to do next or instead. The shared row's translation is shown first; the act's own fixed remedy sentence is shown after it, as part of what the member reads, never a hidden field. BOB reads this as the pattern for every refusal converged under K275, not only these four.
decided: 2026-09-29 · Bob
owed: N327 carried in T14 with membership R84 worded to match; the redesign shows the remedy line after the translation.

### DEC-84 · answered
raised: 2026-09-29 · BOB #66 (N344: the open points of `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §15; the page https://claude.ai/artifact/Y9mN5sYyoMjyhsfLshVZj8)
for: bob
question: The thirteen points DEC-76 and DEC-77 leave open for PRESENT and RESOLVE (§15 points 1–5, 7, 10–14, 16, 17).
why it is Bob's: doctrine, requirements and UX.
answer: **All as recommended (Bob, 2026-09-29), with two revised in discussion.** (1) an undetermined candidate is a lead, never a duty; (2) a RECORD duty is an unmutable OBLIGATION for the joined members of every project drawing on either side, leaving only by resolution; (3) REVISED: two projects' different conclusions from different arguments are plurality, each attributed; conclusions that cannot both hold in the same respect carry a tension mark, and the clarifier asks how they differ: a named difference (scope, time, standard, evidence set, a weighing each owns) is recorded on both and clears it; none found makes it a duty on both projects; neither is made to adopt the other's answer; other places outside the detector's keys get a quiet mark with no duty; (4) the question's own conclusion resolves a contradiction inquiry, never one project's stance; (5) the machine recommends only which respects may differ, never which side is wrong nor a GENUINE kind; (7) a stale mark moves nothing by itself: holders get a re-evaluation notice and the mark shows wherever the side does; (10) REVISED: Criteria and Condition are filled as facts from the two sides; Cause is member-authored and published only when evidenced, a hypothesized cause stays in the working inquiry and never contributes to the determination (a hypothesis is a placeholder), published as "cause not established"; Effect from `consequences`; Recommendation limited to a proposed action, never a policy position; (11) an irreconcilable conclusion is disclosed at publication, stated as held irreconcilable, reopened by new evidence; (12) the disclosure reaches one level (the finding's claim and each leg's referent at the pinned bytes), stated as such; (13) a tension found after publication leaves the signed edition as it is, the owning project gets a re-evaluation notice, a later edition discloses or resolves it; publication DISCLOSES, never blocks (DEC-76 item 4 confirmed): an undisclosed open RECORD tension refuses the case, a disclosed one does not; (14) accepting records the proposal accepted, the machine's reason stays the machine's, the member's own words optional and never filled from it; (16) the quick "one of them is wrong" act requires which side and a written reason (a kept decision is always reasoned) and does not ask the error's category; (17) a dismissal gives one fixed reason (same fact at different precision; not about the same matter; a real conflict, not pursued now) with optional words; only the first two count as false conflicts.
decided: 2026-09-29 · Bob
owed: N345's requirement changes drafted from the design and these answers, brought to Bob for approval; the design's §15 marked ruled.

### DEC-85 · answered
raised: 2026-09-29 · BOB #66 (N345's approval page, https://claude.ai/artifact/Akg15anRTeDGacDeec2VSQ; the design's §4 against §10)
for: bob
question: A conflict whose other side is in a project the member cannot see: how is it surfaced, resolved and published without breaking sight?
why it is Bob's: doctrine (sight) and UX.
answer: (Bob, 2026-09-29, replacing BOB's recommendation.) The members of each conflicting project are notified that there is a conflict, and where it is in THEIR project, without being shown the other project. Each notice carries a checkbox by which that project tells the other project(s) it would like to resolve the conflict. When the conflicting projects have both indicated that interest, their members can communicate to resolve it. If the conflict remains at publication, the ceremony says so and tells the publishing member that the conflict will be highlighted in the publication. N345's requirement changes are APPROVED with this.
BOB's reading (P17, said to Bob): the notice names only the member's own side; the other project, its members and its side stay unseen until both projects opt in, and opting in reveals the two projects to each other's members only; the communication is as Bob clarified the same day: each project's members respond to the conflict notifications they receive, and parts of a response are included in the next notification the other project(s) receive; a response may include, at the responder's choice, their cover (Membership v2 §3) or even their email address; none of it is required, and nothing the responder did not choose is shared; there is no discussion thread and no general messaging; the publication's highlight states that the finding rests on a side in conflict with a record not shown, never naming the hidden project or its content.
decided: 2026-09-29 · Bob
owed: N345's draft amended (contradiction, queue, case-authoring, publication, affordances); the requirement files folded when a tranche carries N345.

### DEC-86 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 6)
for: bob
question: What is the one visual treatment and voice of "Undetermined", and how does it differ from "Withheld", "Unrated", "Nobody looked" and "Refused"?
why it is Bob's: UX (Interaction Constructs §U sets the principle; its treatment was open).
provisional: the old interface used one tinted badge for both undetermined and no-grade-yet, so the two looked alike.
alternative: one neutral "gap" family with a colour-free text label per kind (calmer, but the differences rest on reading and are easier to miss).
recommendation: one Undetermined component that always carries its reason, and four visibly different neighbours with fixed wording.
reversal cost: low; nothing is built.
response: **As recommended, Bob, 2026-09-29.** "Undetermined" is one component with a fixed mark and a mandatory "because…" line. "Withheld", "Unrated", "Nobody looked" and "Refused" each have their own visibly distinct treatment and one fixed sentence pattern, never shared. None is dressed as an error; all are written as named terms (DEC-82). The exact marks and wording are the redesign's, within this rule.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §U.
owed: the five treatments and sentence patterns in the redesign; the UX page's open question 6 marked ruled.

### DEC-87 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 7)
for: bob
question: How does the rung ladder look and feel, so a member senses an act's weight before acting, especially the attested and irreversible rungs?
why it is Bob's: UX, within Interaction Constructs revision 0.2 and K356.
provisional: the old interface showed one dialog with a five-rung ladder and the act's rung lit.
alternative: the same dialog for every act, the rung highlighted (read, not felt: the flattening revision 0.2 warns against).
recommendation: escalating friction by rung, the rung's name on the button, an undetermined rung treated as reasoned until assigned.
reversal cost: low; nothing is built.
response: **As recommended, Bob, 2026-09-29, with the principle stated in his words.** Friction is kept as low as possible so the tool fades and the work stays in focus, while members still appreciate the weight of their work and the finality of some steps: information-rich cues convey state, relationships, context, progression and available actions; elements are self-evident to newcomers (quietly showing how to understand more) and intuitive to experienced members; and visual tools slow a member down, even for a moment, before a heavier act. The rule: reversible acts inline; reasoned acts a reason field in place; terminal and attested acts a full dialog stating what ends or cannot be silently undone, and who signs; irreversible acts only through the ceremony (DEC-80). Every act's button carries its rung's name and weight mark (DEC-82's pips). An act with an undetermined rung is treated as reasoned until BOB assigns it.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §F.
owed: the act surfaces in the redesign; BOB's assignment of the acts still graded undetermined (affordances R27); the UX page's open question 7 marked ruled.

### DEC-88 · answered
raised: 2026-09-29 · the same design session with Bob (following DEC-87: the acts whose rung is undetermined)
for: bob
question: Can the 57 acts graded `undetermined` in `affordances.RUNG_ABSENT` be given rungs from the principles already ruled (affordances R27; DEC-87)?
why it is Bob's: the banding logic is UX and doctrine (how heavy an act feels); assigning each act is BOB's detail (P17), put to Bob here at his request.
provisional: each is treated as reasoned (DEC-87).
alternative: leave them to BOB one by one.
recommendation: three bands, with six judgement calls named.
reversal cost: low; nothing is built.
response: **As recommended, Bob, 2026-09-29, with his note on the six: "The 6 judgment calls are heavyweight, so the friction should be appropriately high. That said, workobjective is probably not the heaviest weight of the 6."**
  1. REVERSIBLE (26), proposals that bind nothing and working moves nobody relies on yet: `suggest`, `extractpropose`, `contradictionpropose`, `themepropose`, `standardpropose`, `comparisonpropose`, `theorypropose`, `actionriskpropose`, `actionlawspropose`, `filingprepare`, `contentmint`, `casedraft`, `reviewcomment`, `inboxresolve` (while it only sets a status), `taskforward`, `taskresolve`, `thread`, `connectionchoose`, `themedeclare`, `themeplace`, `entityalias`, `goallink`, `versionkeep`, `airunopen`, `airunclose`, `projectfork`.
  2. REASONED (29), a member's own claim others may rely on, corrected only forward: `testify`, `lead`, `leadlook`, `leadshare`, `transcribe`, `transcriptionattest`, `attesttext`, `resolve`, `resolvetestify`, `entitycreate`, `versionadopt`, `progressiondefine`, `goaldeclare`, `aspirationdeclare`, `aspirationdeadend`, `objectivecondition`, `biasadopt`, `strengthbar`, `standarddeclare`, `standardadopt`, `consequencerecord`, `actioncorrespond`, `filingsent`, `escalationopen`, `escalationattach`, `counselpacket`, `attribute`, `statementack`, `workobjective`.
  3. TERMINAL (2), ending what cannot be reopened: `escalationend`, `filingapprove`.
  4. THE SIX JUDGEMENT CALLS CARRY HIGH FRICTION. Their rung names stay honest (a heavy consequence is not a new rung, R27), and friction follows consequence in the world (Interaction Constructs §F): `attribute` (a name that becomes permanent at publication), `leadshare` (a disclosure that cannot be un-read), `entitycreate` (a person named in the registry) and `strengthbar` (a gate on the whole group) open the full dialog stating that effect; `filingapprove` is terminal and has it already. `workobjective` is the lightest of the six: its reason field opens in place with the run's budget and scope shown beside it, heavier than a plain reasoned act and lighter than the full dialog.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §F.
owed (BOB's): move the 57 from `RUNG_ABSENT` into `RUNGS` in `bio-plane/src/affordances.mjs` and update affordances R27's text (which says 56; the code holds 57); add a required reason to each reasoned act whose requirement does not yet require one (an act whose own authored words serve as its reason counts); publish the consequence statement for the six; regrade `inboxresolve` to reasoned when DEC-78's pull admits material.

### DEC-89 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 8)
for: bob
question: Where does a member record why a noncompliant finding is, or is not, significant enough to escalate, given that no significance, severity, priority or score may be stored?
why it is Bob's: it changes the escalation and conformance requirements and touches Operational Principle 1 (significance is the members' judgement, K12).
provisional: reasons are recorded once an escalation exists; deciding NOT to escalate leaves no trace, and opening one records no why.
alternative: record the reasoning in the unbuilt, never-published action plan (S11); or leave it to discussion outside the record.
recommendation: a required reason when opening an escalation, and a reasoned "decline to escalate" act, both prose only.
reversal cost: low; nothing is built.
response: **As recommended, Bob, 2026-09-29.** (1) Opening an escalation (`escalationopen`, reasoned in DEC-88) requires a written reason: why this breach is worth pursuing. (2) A new act, DECLINE TO ESCALATE, on a live noncompliant determination records, in the member's own words, why the group is not pursuing it now; reasoned, attributed and dated; corrected forward only (a later escalation, opened with its own reason, supersedes it, and both stay readable). Both are PROSE ONLY: no field, value or vocabulary for significance, severity, priority, urgency or rank exists anywhere (conformance R8, escalation R19), so the judgement is kept without becoming a score. Any joined member who may open an escalation may decline one.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry.
amended: 2026-10-05 by Bob through the development process (K1473; K1471): significance may be expressed only as a machine signal in the hypothesis layer (a "hint" to members, DEC-131), labelled, with its method and measured false-alarm rate, never as a field or value on a determination, an escalation or a plan; a ranking by a stated, measured quantity is analysis and allowed. The rest of this entry stands (the judgement to pursue lives in acts and reasons). Folded into the UX substrate (question 8's ruled entry; the action surfaces' rules).
owed: the requirement changes in `escalation` (the required opening reason; the decline act and its read) and `conformance` (a determination shows whether it was escalated, declined or neither), with the decline act's rung (reasoned) in `affordances`, for Bob's approval; the UX page's open question 8 marked ruled.

### DEC-90 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 10)
for: bob
question: What does the assistant dialog look like on each surface, and how is "the machine did the looking, you do the concluding" made felt?
why it is Bob's: UX, within DEC-24, DEC-27 and ASSISTANT-PILOT.
provisional: the pilot flow and wizard are unbuilt; only CHECK runs are deployed.
alternative: a modal dialog that navigates away and returns (simple on phones, but it hides the surface the member is meant to act on).
recommendation: a side panel docked beside the owning surface, with one visible "machine work" treatment shared with every other machine output, and acts always performed on the real surface.
reversal cost: low; nothing is built.
response: **As recommended, Bob, 2026-09-29.** The assistant is a panel docked beside the surface it serves. Its text carries the one "machine work" treatment every machine output shares, with attribution ("the assistant did this, at <member>'s request"). A wizard step highlights the real control and never fills it or presses it; every act is performed by the member on the real surface. Bob asked whether it may float; its downsides (it can cover the control a wizard step highlights, come loose from the surface it serves, crowd a phone, trap or lose keyboard focus, and get lost off-screen) led him instead to two refinements, as recommended the same day: (1) EXPANDABLE: a draggable divider and an "expand" control let the panel take most of the window for a long answer or a table of results; some of the member's surface always stays visible; when a wizard step needs the member to act, the panel shrinks back by itself so the highlighted control is in view; its size is remembered per member and one click restores the default. (2) DOCK EDGE BY SCREEN SHAPE: the side by default on wide screens (height is the scarcer space, the member's work scrolls vertically, and very wide lines read slowly) and the bottom on narrow ones (phones, tablets held upright); a member may switch edges and the choice is remembered. The panel does not float.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry.
owed: the assistant panel in the redesign; the UX page's open question 10 marked ruled.

### DEC-91 · deferred
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 11)
for: bob
question: What does a newcomer learn first, and how do starter materials and onboarding fit a first session (Design Requirement 11: usable within one session)?
why it is Bob's: what a newcomer must learn first, and whether the starter kit is part of the product or the group's website, is a requirement and a UX principle.
provisional: no onboarding path or starter kit exists; the measures map (DEC-82) already rules that a newcomer meets strength against the bar and "Undetermined" first, everything else taught at the act.
alternative: decide the onboarding path now, before the redesign exists.
recommendation (not taken now): a short guided first-session path, with teaching at the act everywhere else, and local guides kept in jurisdiction profiles rather than in the product.
reversal cost: none; nothing is built.
response: **DEFERRED by Bob, 2026-09-29:** "this needs to be deferred until the new UX is in place and stabilized." Onboarding is designed against the product members will actually use, so it waits for the redesign.
trigger: the redesigned member surfaces are built and have been stable in use (no major layout changes) for a period BOB judges sufficient; or Bob asks.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry.
owed: the UX page's open question 11 marked deferred, with this trigger.

### DEC-92 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 12)
for: bob
question: How are the Roadmap's five trust levels (our work, independently verified, meets standards, not yet evaluated, flagged) shown on information from other groups?
why it is Bob's: the trust hierarchy is mission doctrine (Roadmap §11); revising it and adding an acceptance act are requirements.
provisional: no module produces the levels; nothing records that a group verified or accepted another group's work.
alternative: build the five levels as written, with a compliance evaluator of incoming work; or drop the indicator and rely on grades and provenance.
recommendation: derive the levels from recorded facts, shown as an origin mark rather than a trust ladder.
reversal cost: low; nothing is built.
response: **As recommended, Bob, 2026-09-29, "but there's still more to decide later."** Earlier rulings already settle how checkable evidence is (DEC-82), what we don't know (DEC-86), who a source is (DEC-78 item 5), whether our copies are co-attested (DEC-81), and that citing another group's edition inherits the fact of publication, never the credibility of its content (AUTHORITY-AND-TRUST, 2026-07-30; inquiry R7). What this adds: the five levels become an ORIGIN MARK in the same family as the "Machine work" label, answering who made this: **Ours**; **Another group's** (a published edition, signature verified); **Accepted by our group** (a new reasoned act, attributed, with a reason); **"Not yet evaluated"**; **"Flagged"** only when a member's recorded evaluation names specific issues, never a machine's. "Meets standards" is deferred until an evaluator of incoming work exists. The mark is ambient; a hover shows the fact behind it (who produced it, which edition, who accepted it and why). It is never composed with grades or strength into one trust score.
still open (Bob's, later): the rest of question 12, which Bob will take up later; known candidates: what accepting another group's work commits the group to and whether it can be withdrawn; how a flag is raised, answered and cleared; whether "meets standards" returns and what evaluates it; how the mark travels when a group republishes work it accepted.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry; folded into `docs/architecture/BIO_Complete_Roadmap_v5.md` §11.
amended: 2026-10-05 by Bob through the development process (K1473): a composed measure is allowed only as a declared formula (a computed fact) or as a labelled machine signal in the hypothesis layer, never as a trust score on the origin mark or a grade; the origin mark itself is unchanged.
owed: the acceptance act and the origin mark's requirements (inquiry, publication, affordances), for Bob's approval; the UX page's open question 12 marked partly ruled.

### DEC-93 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 9)
for: bob
question: What does the action plan surface (S11) look like: options, dependencies, deadlines, resources, outcome branches, declined options, and support status on every element?
why it is Bob's: a plan needs requirements and a module; scope and tranche are his.
provisional: the plan surface is undesigned and unbuilt.
alternative: decide it in this design session.
recommendation: none taken here.
reversal cost: none.
response: **MOVED by Bob, 2026-09-29:** "I've started a separate session that will be used for work related to Actions." Question 9 stays open and is decided in that session, which was given the rulings that bear on Actions (DEC-81, DEC-87, DEC-88, DEC-89).
decided: 2026-09-29 · Bob
reasoning recorded in: this entry.
owed: nothing here; the Actions session owns question 9.

### DEC-94 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 14)
for: bob
question: How does the queue avoid nagging (DEC-69) while making sure obligations with clocks are not missed?
why it is Bob's: where respect ends and a deadline duty begins is doctrine (DEC-69 is his).
provisional: the queue keeps one standing entry per member and case, re-notifying only on a snooze increment or when something new lands (DEC-10); overdue is to be marked (monitoring R34).
alternative: treat a clock crossing a threshold such as "due within 3 days" as new; or add an outside channel (email or push).
recommendation: thresholds as new events in the product; an outside channel left for later.
reversal cost: low; nothing is built.
response: **Ruled by Bob, 2026-09-29, refining the recommendation.**
  1. A DEADLINE REMINDER IS THE MEMBER'S OWN REQUEST, never the system's nagging. It is set up when the action is chosen in the action plan, perhaps by a default the member sees and can change at that moment (nothing preselected unseen, DEC-77); a further reminder is also one the member accepts, perhaps at the system's suggestion. A reminder the member asked for is informing at the act they set it at (DEC-69), and it fires as asked.
  2. As a deadline nears, the item's POSITION, COLOUR or WORDING may change, as appropriate. That is display, not a notification.
  3. There remains NO WAY to reach a member who has not opened the product: no email, push or other outside channel.
  4. OVERDUE is new, and re-notifies once (DEC-10's "something new"). "Due within N days" is NOT new unless the member requested that reminder.
decided: 2026-09-29 · Bob
reasoning recorded in: this entry.
owed: the reminder as a member-set part of choosing an action (actions or the action-plan module, with the Actions session), the queue's display change as a clock nears and the overdue re-notification (queue, monitoring R34), for Bob's approval; the UX page's open question 14 marked ruled.

### DEC-95 · answered
raised: 2026-09-29 · the same design session with Bob (the UX canon's open question 13, which Bob extended to what happens to captures afterwards)
for: bob
question: How is a member told a capture's grade at the moment of capture, and, as Bob added, how are the many captures nobody has yet released or set aside handled, and may the system suggest that a held capture relates to a member's work?
why it is Bob's: UX; the suggestion touches DEC-77's rule that context supports and never silently decides, and DEC-94's rule against nagging.
provisional: DEC-51 and DEC-39 settle the substance (the whole grade note at completion; co-attestation answers "when did these bytes exist?").
alternative: no backlog view and no suggestions; or suggestions pushed as notifications.
recommendation: as below.
reversal cost: low; nothing is built.
response: **Bob, 2026-09-29: items 1 and 3 as recommended; item 2 not ruled.**
  1. THE GRADE NOTE: shown whole, once, when a capture completes (DEC-51); for a capture that completes later and unattended (a bulk capture, or one the assistant requested), the note is attached to the completed capture and to its queue item.
  2. NOT RULED (Bob, 2026-09-29, correcting this entry the same day): the held-captures list with bulk triage was proposed but not approved; it stays open (a list of captures still at "collected", per member and per project, sortable, age shown never notified, triaged several at a time).
  3. SUGGESTING THAT A HELD CAPTURE RELATES TO A MEMBER'S WORK, under six guards: (a) it appears where the member already works, never as a notification (e.g. one quiet line on a question's page, "3 held captures may bear on this question", opened by a click); (b) it is labelled "Machine work" and states its reason (e.g. "names the same ordinance number"), and linking or releasing stays the member's act; (c) a dismissal is remembered, and the same capture is not suggested for the same question again unless something new connects them; (d) it never appears during a heavy act such as the ceremony or a signing dialog; (e) a member may turn it off for themselves; (f) its acceptance rate is measured (DEC-77).
decided: 2026-09-29 · Bob
reasoning recorded in: this entry.
owed: the relevance suggestion as labelled machine work with its dismissal memory and per-member switch (run-productions or retrieval, as BOB places it), and the unattended grade note (capture, queue), for Bob's approval; the UX page's open question 13 marked ruled.

### DEC-96 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 12: the four points DEC-92 left for later)
for: bob
question: What does "Accepted by our group" commit a group to, is it public, and how is it withdrawn; how is a "Flagged" mark raised, answered and cleared, and who sees it; does "Meets standards" return; and what does a reader of the group's own case see when it rests on work the group accepted or flagged?
why it is Bob's: doctrine (inherited trust: the fact of publication, never the credibility of the content) and UX.
provisional: DEC-92 set the origin mark and its five labels; acceptance is "a new reasoned act, attributed, with a reason"; "Flagged" comes only from a member's recorded evaluation.
alternative: (B) a public, signed list of acceptances and flags published beside the group's cases; (C) acceptance as full vouching, the accepted work graded afresh as the group's own; (D) defer until a second group publishes.
recommendation: (A) a reasoned stance, made public when the group's own case relies on it.
reversal cost: low; nothing is built.
response: **As recommended (Bob, 2026-10-01): option A.**
  1. ACCEPTING: "Accept into our work" is a reasoned act. It asks what was checked and records who, when and why. It names one edition: a newer edition of the same work reads "Another group's" until someone accepts it. Acceptance changes no grade: the cited edition's grades stand as published, and a cited case can never be stronger than its frozen edition (the inherited-trust rule of 2026-07-30 holds). Withdrawing an acceptance is a reasoned act too, corrected forward like every act, and sends re-evaluation notices to the work that rests on it.
  2. FLAGGING: a flag is a member's recorded evaluation naming the specific issue, never a machine's. It stays inside the group, seen by those who may see the work that cites the flagged edition, and a member clears it with a reason.
  3. "MEETS STANDARDS" stays deferred until an evaluator of incoming work exists; if it returns, it is labelled machine work and never acts as a trust level.
  4. WHAT A READER SEES: when the group's published case relies on another group's work, the case states the acceptance (who accepted which edition, and why), and it must disclose any open flag on that work, as it must disclose an open contradiction: disclosed, never blocked (DEC-84 (13)).
  Next step, when triggered: a public list of the group's acceptances and flags (option B) is built on these same recorded acts when a second group asks to see who accepted or flagged its work.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 12.
owed: the accept, withdraw, flag and clear acts (reasoned), the case's statement of acceptance, and the publication check that open flags on relied-on work are disclosed, as requirements for Bob's approval (BOB places them); the UX page's open question 12 marked ruled.

### DEC-97 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 13: DEC-95 item 2, not ruled then)
for: bob
question: Is there a list of held captures (collected, not yet released or set aside), and may a member act on several at once from it; and is anything beyond crucial material barred from a batch?
why it is Bob's: UX, and doctrine (Intake Doctrine §4's batch rule and what "contested" means).
provisional: batch release is allowed for large, uniform collections, each document with its own entry and the member's recorded acknowledgement; crucial or contested material is never batched (Intake Doctrine §4, 2026-07-27); the bulk release act is built, all or nothing (ratification R20-R27, K583).
alternative: (B) the list for seeing, every act one document at a time; (C) no list, held captures shown only in search and through DEC-95's guarded suggestions.
recommendation: (A) the held list with bulk handling.
reversal cost: low; no screen is built.
response: **Bob, 2026-10-01: A.**
  1. THE LIST: a "Held captures" view, per member and per project, showing only what the viewer may see; sortable by age, source and project; each row shows its age; nothing about held captures is notified (DEC-69, DEC-94).
  2. ACTING ON SEVERAL: the member ticks several (nothing pre-ticked) and chooses one of three acts: vouch for them together as one batch release (Intake Doctrine §4: each document its own release entry, the member's recorded acknowledgement of homogeneity and of what was sampled and checked); set them aside together with one reason (each stays held with that reason, never deleted); or link them to a question.
  3. WHAT IS NOT ELIGIBLE: crucial documents, and documents caught in an unresolved contradiction (which fills the doctrine's word "contested"), are shown as not eligible, with the reason, before the member acts, so the all-or-nothing batch act never refuses unseen.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 13; Intake Doctrine §4.
owed: the held-captures list and the bulk set-aside and bulk link acts (no set-aside act exists today), and the batch eligibility check's "contested" arm (a document in an unresolved contradiction), as requirements for Bob's approval (BOB places them); the UX page's open question 13 marked ruled.

### DEC-98 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 15)
for: bob
question: What do screens say while empty, loading, failed or waiting (renders held back, capture requests hours away, legal clocks of days): one shared vocabulary or screen by screen; must every wait say what, from whom and by when; may an empty screen offer a next step?
why it is Bob's: UX; it extends DEC-86's rule (state what is not known, never as an error) to the ordinary states, and touches DEC-69 (no nagging).
provisional: DEC-86 (Undetermined and its four neighbours); DEC-94 item 2 (a nearing deadline changes display only); instance-setup R20 and Publication §7 (a page that cannot read says so, never that none is recorded).
alternative: (A) the shared vocabulary without next steps; (B) each screen designed on its own.
recommendation: (C) A, plus a next step on something just created.
reversal cost: low; nothing is built.
response: **Bob, 2026-10-01: C, as recommended.**
  1. ONE VOCABULARY, everywhere, each state with its own fixed look and none dressed as an error: "Nothing here" (truly empty); "Still loading"; "Could not read this, because…" (the screen's own request failed); and the record's "Undetermined, because…" (DEC-86). A screen that cannot tell "could not read" from "none" says "could not read".
  2. EVERY WAIT SAYS WHAT, FROM WHOM AND BY WHEN: one line naming what is awaited, from whom, and the expected or legal date where one exists, or that no date is set.
  3. A NEXT STEP ONLY ON SOMETHING JUST CREATED: an empty screen for something the member has just created (a new project, a new plan) shows one plain next step ("Nothing here yet. Add the first question."); nowhere else.
  Exact wording and looks are the redesign's.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 15; Interaction Constructs §U.
owed: each screen's reads distinguish empty, still loading and could-not-read (a check in each screen's build, BOB's to place); the redesign's patterns; the UX page's open question 15 marked ruled.

### DEC-99 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 16)
for: bob
question: What accessibility standard must the member screens and the published case meet, which languages, and may a group issue a translated version of a published case?
why it is Bob's: requirements and UX (a standing requirement every screen is built to; who signs a translation is doctrine).
provisional: no standard named anywhere; DEC-79, DEC-82 and DEC-90 already require colour never to be the only signal, focus and tap equivalents to hover, and a docked assistant panel; product code names no place (K1); jurisdictions R37 (locale is the language of the jurisdiction's publications).
alternative: (B) A plus the interface in a profile's local languages and translated cases now; (C) defer both.
recommendation: (A) WCAG 2.2 AA now for everything; English first, built for translation; a translated case's principle recorded now, its design later.
reversal cost: low now; high once screens are built without it.
response: **As recommended (Bob, 2026-10-01): A.**
  1. THE STANDARD: WCAG 2.2 at level AA for every member screen of the redesign and for the published case page, print and file; each new screen is checked against it before it is accepted.
  2. LANGUAGE: English for now, the interface built so its words live in one place and another language can be added without rebuilding screens; a published case appears in the language its group wrote it in. The interface in a place's languages is a later decision.
  3. TRANSLATED CASES: principle now, design later. A translation is never presented as the signed case: it is marked as an unofficial translation and names the signed original. Whether and how a group issues one through CivicOS is decided when a group asks to publish one.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 16; Interaction Constructs §L.
owed: the standard as a requirement every member screen and the published case meets, with its acceptance check, and the interface's words held in one place (BOB places them, for Bob's approval); the UX page's open question 16 marked ruled.

### DEC-100 · answered in part
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 36, after publication: a case's docket and withdrawing a case; Bob's discussion of how the CPUC curates a docket)
for: bob
question: In a published case's docket, who has standing to have a response listed; does the docket support confidential (sealed) entries or redacted public versions; and must the group disclose its off-the-record contacts with the subject after publication, as CPUC ex parte notices do?
why it is Bob's: doctrine (the subject's right of reply, DEC-13; publication's openness) and UX.
provisional: the subject's right of reply is a declaration, not a gate (Publication §3 rule 6, DEC-13); the CPUC model offered three imports: party-like standing, filing under seal with a redacted public version, and ex parte disclosure.
alternative: as discussed with Bob, 2026-10-01 (the CPUC comparison in this session).
recommendation: the named subject gets party-like standing; sealed and redacted entries and an ex parte rule were offered for decision.
reversal cost: low; nothing is built.
response: **Bob, 2026-10-01, three points; the rest of question 36 stays open.**
  1. STANDING: the subject named in a case has party-like standing (its responses that reach the group are listed on the public docket). Anyone else may still submit a response; whether it is added to the publicly visible docket is at the group's discretion. In Bob's words: "an unapproved subject can still submit, though it's at the group's discretion as to whether it gets added to the publically visible docket."
  2. NO CONFIDENTIAL OR REDACTED ENTRIES: "Given CivicOS's foundational principals, I don't believe it's appropriate to support confidential filings or redacted versions." The docket has no sealed entries and no redacted public versions: an entry is public whole, or it is not on the public docket (it may still be held in the group's record).
  3. NO DISCLOSURE RULE FOR OFF-THE-RECORD CONTACTS: "I don't think that our principals necessitate that off-the-record contacts be disclosed." The group's contacts with the subject after publication are not required to be noted on the docket.
  AMENDED the same day (Bob, 2026-10-01):
  4. STANDING MAY BE GRANTED: Bob confirmed the reading of "unapproved subject": a group may grant standing to others besides the named subject (as the CPUC grants party status); anyone without standing may still submit, listed publicly at the group's discretion. What a grant gives, and whether it can be withdrawn, stays open.
  5. REDACTION IS THE SUBMITTER'S ALONE (refining item 2): "The submitter of a decoration of some type can submit a re[d]acted version. What I'm suggesting is that the system won't allow the host group to further redact content submitted by others. That said, I think that it should be possible for the group to decline the posting of a submittal - even by a named subject - if the submitted material includes redactions. I'm thinking that this will in practice discourage re[d]actions." The group never redacts what others submit; a submitter may send its own redacted version; the group may decline to post any submission that contains redactions, even the named subject's (an exception to item 1's listing).
decided: 2026-10-01 · Bob (in part)
reasoning recorded in: this entry; the UX substrate's brief for question 36.
owed: nothing to build yet; the docket's design (question 36's other points: the docket itself, the required core, how entries are signed and travel, outside responses, withdrawal) awaits Bob's ruling. The UX page's question 36 marked settled in part.

### DEC-101 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 18: how a correction reaches people who relied on an earlier edition; its newer-edition notice is in question 36)
for: bob
question: Must every new edition carry a written "What changed in this edition, and why" statement; may the system generate it or a computed list of differences; and how do other groups that cite a case learn of a new edition?
why it is Bob's: doctrine (publication's forward-only correction, the member's act versus machine work) and UX.
provisional: a published case is revised as a new edition and supersession is surfaced, not followed (Publication §2, DEC-12); the exclusion statement is authored fresh per edition (C-21.1).
alternative: the brief's options: a required written statement; a computed list of differences only; both; banner and editions list only.
recommendation: both, the written statement leading with a computed list beneath.
reversal cost: low; nothing is built.
response: **Bob, 2026-10-01, in his own terms:**
  1. A SYSTEM DRAFT IS WELCOME: "there's always tension between members inappropriately delegating to the system and the system facilitating (enabling!) member's understanding, capabilities, efficiency/productivity, rigor, and so on. In that light, I have no problem with the system generating an initial, perhaps partial, description of the changes in a new edition. To the extent possible, this generated text should not amount to a diff, but provide a detailed, high level description of changes and, to the extent that the system can determine, and explanation for the motivation for the revision." The draft is labelled machine work until a member adopts or rewrites it; the signed statement is the group's, and the record keeps that it began as a machine draft (the existing machine-work rule, DEC-84 (14)).
  2. REQUIRED IN EVERY REVISION: "The what changed statement should be required in all revisions of a publication." Every edition after the first carries it; a new edition cannot be signed without it.
  3. WATCHING OTHER GROUPS' EDITIONS: "Just as an instance can be configured to proactively look for updates of documents, it should similarly be able to monitor and respond to new editions of published case from other groups." A copy may watch the cases of other groups it cites or follows and respond to a new edition by telling the members whose work rests on the cited edition (re-evaluation notices, the queue); nothing is pushed between groups.
  Not adopted: a separate computed list of differences (the brief's option C); the aid is the high-level description above.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 18; Publication §5A.
owed: the statement as a required part of a new edition's signing (publication, case-authoring); the assistant's draft of it, labelled machine work, with its origin kept; watching other groups' published cases for new editions, as standing intent or monitoring, with its re-evaluation and queue responses (BOB places them, for Bob's approval); the UX page's question 18 marked ruled.

### DEC-102 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 19: how members choose how they are credited)
for: bob
question: Confirm that a case edition cannot be signed while a member whose observation it uses has not chosen a credit level, and that "by name" publishes the member's handle, never a legal name; approve where the member is asked and how the levels appear; and, as Bob raised, should the credit level a member chooses change the weight of their testimony?
why it is Bob's: doctrine (members' control of their own words and identity; how testimony is weighed) and UX.
provisional: four credit levels chosen by the member (Publication §3 rule 7); testimony keeps its D grade at every credit level (MEMBER-KNOWLEDGE-DESIGN §3); unchosen blocks signing and "name" needs a handle, both built and approved "for now" (K102).
alternative: the brief's options: (B) credit the group if no choice is made; (C) "by name" means a typed legal name; (D) a standing preference the member can override.
recommendation: (A) keep both built rules; ask in the member's queue and show the state on the draft; every level shown publicly in one neutral style with the grade beside it.
reversal cost: low for the display; the testimony rule changes a designed (MEMBER-KNOWLEDGE-DESIGN §3) and partly built rule.
response: **Bob, 2026-10-01: A, and testimony weighed by identity.**
  1. ANONYMOUS MEMBER TESTIMONY IS LIKE AN ANONYMOUS TIP: "I'm wondering whether a member's anonymously provided testimony and evidence should be treated like an anonymous tip - only potentially weaker. I suggest weaker because a member might have a vested interest in a published finding. The opportunities for abuse are manifold. Anonymous testimony and evidence must be corroborated based on journalistic and legal standards."
  2. IDENTITY BUYS STRENGTH: "In order for testimony or evidence to have greater strength, the member must identify themselves according identity levels already used elsewhere in the system." Read by the design session as the credit levels: the group and the project are anonymous; cover and name identify, in that order; a change of level reaches the findings resting on the testimony as re-evaluation notices (as DEC-78 item 5 (e) does for a source). This replaces MEMBER-KNOWLEDGE-DESIGN §3's rule that testimony keeps one grade at every credit level.
  3. "A": both built rules confirmed (an edition is not signed while a member whose observation it uses has not chosen a credit level, the owner's way forward being to drop the finding resting on it; "by name" publishes the member's handle, never a legal name); the member is asked by a to-do in their own queue, the state shown on the case draft; every level appears publicly in one neutral style with the grade beside it, so the weight shows through the grade, never through a stigmatizing look.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 19; MEMBER-KNOWLEDGE-DESIGN §3 (amended); Publication §3 rule 7 (amended).
owed: how each identity level maps to the testimony grade and how anonymous testimony counts in strength (it cannot alone carry a finding until corroborated), what counts as corroboration to journalistic and legal standards, the re-evaluation notice on a change of level (strength, ratification, reevaluation; BOB drafts for Bob's approval); "for now" lifted from ratification R2/R18 and publication R17; the UX page's question 19 marked ruled.

### DEC-103 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 20: how a group's declared bias appears to the public)
for: bob
question: Do public readers see the lens's actual statements with their justifications, or only the publisher's acknowledgement and a reference to the lens; are the statements printed into the signed case; and is the full form required on the page or may it open as a summary?
why it is Bob's: doctrine (the two-audience choice: a lens that is weighable, not a weapon) and UX.
provisional: the lens is public and accompanies every published case (DEC-20); the acknowledgement is the publisher's own words at publication (DEC-46 (2)); the signed case carries only the manifest (set names, revisions, fingerprint), not the statements (case-authoring R14).
alternative: (B) the full lens on the page only, read live and checked against the fingerprint; (C) a summary first; (D) the acknowledgement and manifest only.
recommendation: (A) the full lens printed into the signed case, reasons attached.
reversal cost: moderate once cases are signed in the new format.
response: **As recommended (Bob, 2026-10-01): A.** At publication every statement in force is printed into the signed case (kind in plain words, subject, text, justification and evidence), citing only public material and counting what is withheld. The page shows "The lens this case was produced under": the acknowledgement first, then each statement with its reasons beneath, then two lines on why groups declare bias; collapsed on screen to one line per statement with its justification, full in print. The publisher sees exactly what will be printed before signing. Earlier cases keep only the fingerprint.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 20; Declared Bias, "RULED 2026-10-01".
owed: a new signed case format carrying the statements with their justifications and evidence, the withheld-citation count, the public page's lens section and its print form, the pre-signing preview (case-authoring, publication, public-read; BOB drafts for Bob's approval); the UX page's question 20 marked ruled.

### DEC-104 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 21: what a hunch's grade does, and clearing hunches before publishing)
for: bob
question: Confirm that a hunch never counts in any strength reading and correct the doctrine sentence that says it "composes normally"; decide what the hunch's letter is for once strength ignores it; and approve a standing "hunches to clear" list.
why it is Bob's: doctrine (DEC-15's hunch, DEC-20's publication block) and UX.
provisional: a hunch counts for nothing in strength and is always named, approved "for now" (strength R5, K102, K187); Declared Bias still said a hunch "composes normally" while open.
alternative: (B) two strength readings while investigating, with and without hunches; (C) hunches carry no letter.
recommendation: (A) the letter stays on the link; strength ignores it.
reversal cost: low.
response: **As recommended (Bob, 2026-10-01): A.** A hunch counts for nothing in any strength reading, and strength says how many hunches it left out ("for now" lifted from strength R5). The hunch's letter appears only on the link itself, in the hunch style, as the member's stated confidence when the guess was made, beside "not counted". A "Hunches to clear" list sits on the question and project pages, as status where the work lives and never a notification, and the check before publishing lists them again. Declared Bias's "composes normally" is corrected: a hunch links evidence while open but never lifts strength.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 21; Declared Bias (corrected).
owed: "for now" lifted from strength R5; strength's count of hunches left out; the "Hunches to clear" list on question and project pages (BOB places them); the UX page's question 21 marked ruled.

### DEC-105 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 22: standards of proof by audience, the project's bar)
for: bob
question: Ship the project's bar setting now with plain meanings and an honest note that no audience guidance exists, or hold it; what form audience guidance takes when it comes; and whether its research is commissioned now or on a trigger.
why it is Bob's: requirements and UX (what the product tells a group about standards of proof).
provisional: the bar belongs to a project and never combines across projects (DEC-72); co-attested Grade B suffices to publish (DEC-81); for actions each venue's standard is a sourced profile fact, never refusing (K597 (3), K600 (b)); the audience catalogue is owed (Publication §7).
alternative: (B) audience standards as sourced profile facts now; (C) research first, the screen waits.
recommendation: (A) letters now with an honest note, B named as the form guidance takes, the research on a trigger.
reversal cost: low.
response: **As recommended (Bob, 2026-10-01): A.** The owner sets a letter per axis, or none, each with its one-line meaning from the measures map, under the line "CivicOS has no guidance yet on what particular audiences expect. Readers see the bar you set in these words." When guidance comes it takes the venue form (B): sourced audience standards in the jurisdiction profile beside the choice, "Undetermined" where unresearched, never preselected or defaulted. The research waits for its trigger: a group asks what bar suits an audience, or a case is challenged as below its audience's standard.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 22; Publication §7.
owed: the bar screen's honest note (strength, project settings; BOB places it); later, on the trigger, audience standards as profile facts (jurisdictions); the UX page's question 22 marked ruled.

### DEC-106 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 24: always knowing which side of the privacy fence you are on)
for: bob
question: Are members taught two spaces (working and published, with review copies and outgoing drafts as marked items on the working side) or three (with "shared for review" its own); and does each document and case carry a path-to-publication marker?
why it is Bob's: UX principle (UI-KICKOFF's law that working and published material never share an ambiguous screen).
provisional: a review copy never leaves the group's copy and is marked as what it is (Publication §6A); publishing is the only irreversible act, through the ceremony (DEC-19, DEC-80); the steps toward it are the path to publication (K356).
alternative: (A) two spaces with banded in-between items; (B) three named spaces; (D) leave it to Design.
recommendation: (C) two spaces plus a path marker on each item.
reversal cost: low; nothing is built.
response: **As recommended (Bob, 2026-10-01): C.** Two spaces with distinct frames, the working record and the published record; review copies and outgoing drafts appear inside the working frame with a band saying what they are and who can see them; each document and case carries a small path-to-publication marker. Frames, colours, bands and the marker's look are Design's.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 24; Interaction Constructs §W.
owed: nothing new to build beyond the redesign's screens (the plainer definition of a review copy, "never shown to anyone outside the group except through a review link you issue", in the redesign's words); the UX page's question 24 marked ruled.

### DEC-107 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 25: the word members see for the queue's to-do class, the part the Action answers left to Bob)
for: bob
question: What word do members see on the queue's to-do class (internal code OBLIGATION), given Bob's 1 August ruling that "obligation" means a public body's duty, and is "obligation" kept, in everything members and readers see, for a public body's duty only?
why it is Bob's: member vocabulary, as "Noticed" was (K356).
provisional: NOTIFICATIONS.md "What the three classes actually ARE" (2026-08-01): obligations are the civic system's own flows, a member's task is downstream of them; a plan's checkpoints are the group's own (action-plans R23, UX-ANSWERS, K608 (4)); FINDING is shown as "Noticed" (K356).
alternative: (B) "Obligation" with the owner named ("Obligation · ours"); (C) "Obligation" as now.
recommendation: (A) "To do" for members, the internal code unchanged.
reversal cost: low.
response: **As recommended (Bob, 2026-10-01): A.** Members see "To do" wherever they saw "Obligation"; the internal code is unchanged, as with "Noticed". "Obligation" is used on members' and readers' screens only for a public body's duty. Each item's sentence still names whose step it is where that matters ("our plan", "the city's deadline"); the mapping is recorded once and in the glossary members can open from the queue.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 25; NOTIFICATIONS.md (RULED 2026-10-01).
owed: member-facing text that says "Obligation" for the to-do class re-worded to "To do" (queue, queue-producers, the redesign; BOB places it, as K899 (1) placed "record"); the UX page's question 25 marked ruled.

### DEC-108 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 26: when the doorbell's limit is hit, what the sender and the group are told; Bob widened it to the doorbell's inbox, its limits, a gatekeeper and a discard archive)
for: bob
question: What the doorbell's inbox looks like and how it is sorted; whether the limits (12 per source and 300 in total in any 10 minutes) suffice; what a would-be knocker is told when a limit holds; whether spam and denial-of-service floods can be screened; what happens to discarded knocks; and whether a count-only tally of refused knocks is kept.
why it is Bob's: UX, and doctrine (the doorbell is the one route in for people who cannot join).
provisional: Intake Doctrine §2a (the limit is a bound, published with its method; a refused knock stores nothing); DEC-78 (pulling a knock).
alternative: the brief's options on the tally: (A) record nothing, fix the refusal text; (B) a count-only status on the inbox page; (C) B plus one queue item when the doorbell stays full.
recommendation: (B) for the tally.
reversal cost: low; the limits are constants.
response: **Bob, 2026-10-01, in his words:**
  1. THE INBOX: "I imagine the doorbell experience to be like an email inbox, with unhandled entries highlighted, but handled entries still visible."
  2. SORTING: "Knocks can be sorted in the list chronologically, by status, knocker identity (secret) or not, project affected, etc."
  3. LOWER LIMITS, AND THE KNOCKER TOLD: "I don't think that the current limits (at most 12 from one sender and 300 in total in any 10 minutes) is sufficient. I think those limits should be 5 and 10, and potential knockers being aware when a limit is in affect so that they don't think that they've knocked when they haven't." Read as: at most 5 knocks from one source and 10 in total in any 10 minutes.
  4. A GATEKEEPER: "It should also be possible to enable a gatekeeper function able to identify and dismiss obvious spam and DOS submissions." Read as: optional per group, labelled machine work, its dismissals going to the discard archive below.
  5. A DISCARD ARCHIVE: "The system may want to archive the discards, just in case a gem comes in buried in the morass. But perhaps the archive is automatically cleared on a tight schedule (a week after receipt?)." Recorded as: discards are archived and cleared automatically one week after receipt, Bob's suggested figure.
  6. THE TALLY (Bob, later the same day, "YES" to the brief's remaining question, as recommended, B): the system keeps a count-only tally of knocks it turned away (a daily total for the whole doorbell, how many times the whole-doorbell limit was reached, and when last; no addresses, fingerprints, times of individual knocks or content), shown to members as status on the inbox page, never a queue item or notification; the sender's refusal text says, truthfully, that the group can see how often its doorbell turns people away.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 26; Intake Doctrine §2a.
owed: the limits lowered to 5 and 10 with the published sentence; the knock page telling a would-be knocker when a limit holds; the inbox's highlighting and sorting; the optional gatekeeper (machine work) and the discard archive with its one-week clearing (capture, the doorbell's page, the inbox; BOB drafts for Bob's approval); the count-only tally as status on the inbox page and the refusal text's truthful sentence (with BOB's privacy check of the tally before it is built); how a litigation hold (question 31) affects the archive's clearing; the UX page's question 26 marked ruled.

### DEC-109 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 27: what the founder is told about who really controls the group's copy)
for: bob
question: Does the claim page tell the founder the whole truth about the hosting account's power; does the explanation stay visible in administrator settings with who holds hosting access; and must anyone record that they read it? (Custody itself stays deferred, DEC-2.)
why it is Bob's: doctrine (the root of trust, Membership v2 §4.6, §4.8) and UX.
provisional: the claim page shows a reassurance-only card (the hosting account is a way back in); membership R11 records who holds hosting access when a second administrator joins.
alternative: (A) the whole truth at claim only; (C) B plus a recorded acknowledgement; (D) the wording as it is.
recommendation: (B) the whole truth at claim, plus a standing card for administrators.
reversal cost: low; wording.
response: **As recommended (Bob, 2026-10-01): B.** The claim page and the wizard's last screen replace the reassurance-only card with a short plain block, shown before the founder chooses a password: whoever can sign in to the hosting account controls the copy (can replace the one-time password, claim the copy again, read everything, lock everyone out, and no administrators' vote can stop them); use a group account, not a personal login; add at least one other trusted person; where possible let someone other than the administrators hold it; the same account is the way back in if the password is lost. Administrator settings carry a standing "Who controls this copy" card with the same explanation, who the group recorded as holding hosting access and when, and the date the copy was last claimed or re-claimed where the copy can show it. No acknowledgement act.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 27; Membership v2 §4.8.
owed: the claim page's and wizard's wording (instance-setup), the administrator settings card (the redesign), and whether the copy can show its last claim date (BOB confirms); the UX page's question 27 marked ruled.

### DEC-110 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU; the development process runs on his secondary account) (the UX canon's open question 28: the queue's three kinds of item, their names and treatment)
for: bob
question: The three names members see ("To do", "Noticed", and "Signal" or "Status" for the third, replacing "Condition"), and whether each kind is shown differently, with its own icon, wording, buttons and a link to its home, while the queue stays one list in its present order.
why it is Bob's: member vocabulary and UX (Bob's 1 August ruling: one queue, three kinds treated differently).
provisional: NOTIFICATIONS.md "Presented and treated differently — decided"; queue R6's order (to-dos, noticed, signals), R12, R16, R19; "To do" (DEC-107) and "Noticed" (K356).
alternative: (B) rename the chips only; (C) three separate sections or tabs.
recommendation: (A) three plain names, three treatments, links home, "Signal" for the third.
reversal cost: low.
response: **Bob, 2026-10-01: as recommended (A, "Signal"), with re-sorting and folding:**
  1. "It's my sense that the queue should be re-sortable based on time added, time due, case, type."
  2. "When sorted by case or type, the queue should be collapsable (by case or type) so that a member can focus."
  3. "otherwise, as recommended": members see "To do", "Noticed" and "Signal"; each kind has its own icon, wording, buttons and an "Open…" link to its home (until the flow model and signal history exist, the link goes to the thing the item concerns); the queue stays one list, its default order grouped by case with to-dos, then noticed items, then signals. The internal "noticed" disposition clash is the architecture session's to rename.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 28; NOTIFICATIONS.md (RULED 2026-10-01).
amended: 2026-10-05 by the design session under Bob's delegation (DEC-131): the third kind is shown as "Status", not "Signal", since K1473 uses "signal" for the machine's judgment scores (members see a "hint"); its future home is the status history.
owed: "Condition" re-worded to "Signal" in member-facing text; the queue read able to sort by time added, time due, case and kind (queue; BOB places it); the redesign's three item styles, sorting and collapsible groups; the UX page's question 28 marked ruled.

### DEC-111 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01EhPoUTrVCgAqw2ktRyKjCU, then session_01TNeXM2Qvi7zMXT6BntbENE from 2026-10-01; the development process runs on his secondary account) (the UX canon's open question 29: the network's directory, forum and 'working on' signals)
for: bob
question: Whether CivicOS connects to the network's directory, forum and 'working on' signals; if 'working on' signals come inside CivicOS, how they are kept honest so that "catfish groups" cannot discourage other groups with empty claims, and what "anonymous-compatible" means.
why it is Bob's: scope and doctrine (Roadmap §11 "Inter-group awareness"; Design Requirements 9, 10, 13, 14), member-facing outward acts, and, as holder of the network's domains, the network site's policy.
provisional: Roadmap §11 ("Lightweight directory entries. Optional, anonymous-compatible, no ownership implied"; "No group owns an issue"); Design Requirement 10 (believeinoakland.org as directory: no pre-approval, compliance status, visible community flags, downloadable mirror); Publication §3 rule 10 and §7 (credential-free public index; public identity is the slug); the outward-act warning (DR-13, the tell discipline).
alternative: (B) CivicOS submits listings and shows directory status; (C) a 'working on' act, optionally anonymous; (D) out of scope.
recommendation: (A) the three stay outside CivicOS, with links out and a prefilled directory submission; extended in discussion with Bob into project-backed, signed 'working on' notices published at the group's own address and read by the directory.
reversal cost: medium (a new outward act, a public notice format, weekly sealed timestamps, and the network site's policy).
response: **Bob, 2026-10-01: A, extended, confirmed after discussion:**
  1. "I've registered believeincities.org, believeincities.com, believein.city. So every city could have a url redirect like believeincities.org/oakland or whatever. I think that we have to be careful in this decision to make sure that "catfish groups" don't pepper the local landscape with claims that they're working on this and that, and 10 other issues - thus discouraging other groups from taking up those causes. There needs to be some sort of feedback loop that creates clarity and fosters appropriate levels of collaboration, while not spooking other motivated groups."
  2. "What if the CivicOS instance of a group claiming to be working on an issue got involved in the process of keeping a group honest? Maybe claims written by hand show as weaker than claims made by and communicated through a group's CivicOS instance provide more clarity about what's really going on."
  3. "The draft [says] nothing about the group's instance inserting evidence-based description of the group's work on the issue. What I'm suggesting is that there must be a project defined as working on the issue. Only a project owner can ask their instance to submit a reference to the project to the believeincities.org/<place> directory. The posting must include a date, but the submitting owner can set the date to be later than when the project was created - but not earlier. The code that generates the posting, which is signed the way a published case is signed, gives an indicator (1 to 10?) indicating how active the work on the project is."
  4. "I agree with your safeguards." (only members' own work counts, never the assistant's; weeks with work, not volume; a trailing 90 days re-signed monthly; a published method). Asked whether modified code can reach a signed posting: yes, and an owner's key can sign any statement by hand; prevention would need a central host, so fakes are made detectable, attributable and unable to rise past "Reported".
  5. "a. five worded steps"; "b. every group has an identifiable 'slug'." (no anonymous notices); "c. whether they're interested in collaborating" (the only optional extra).
  6. "confirmed", on the full text: CivicOS: (1) a 'working on' notice comes only from a project defined as working on the issue, posted only by that project's owner, after a warning that the public, including anyone being examined, will see it and that stopping later won't unsay it; (2) it carries the group's slug (never members' names), the owner's wording (optionally naming the public body and the matter), "Working on this since" (no earlier than the project's creation, no later than today), the date posted, the activity level in five steps, "Interested in collaborating" only if the owner chooses, and links to any case the project published, and nothing else from the project's private work; (3) the activity level counts weeks in the last 13 with real work by members (never the assistant's, never volume) by a published method, re-signed monthly while the project is open; (4) each counted week gets an independent timestamp on a sealed summary of that week's work, and at publication the group opens the seals that relate to the case; (5) the notice is signed by a project owner as a published case is signed, published at the group's own public address, and the group's public page lists its owners' public signing keys, without names; (6) stopping or closing says so, with an optional handoff note, and a notice Dormant for a further month lapses into the group's record unless renewed or stopped; (7) no anonymous notices; (8) links out to the directory and forum, and a prefilled directory submission after publication. For the network site (Bob's direction as holder of the domains): (9) the directory lives at believeincities.org/<place>, believein.city the short form, believeinoakland.org redirecting to believeincities.org/oakland, each notice filed under the public body it examines and shown on every place page that body touches; (10) it reads notices at each group's address, records when it first saw each notice and each signing key, and keeps every notice; (11) notices show as Stated (typed by hand, no project; lapses after 60 days), Reported (signed by the group's copy) or Proven (seals opened at publication); (12) each group's record is facts, never a score; notices on the same matter side by side, each saying "others welcome"; never the word "claim" on public pages; impossible combinations flagged automatically; community flags stay visible; (13) a group with no published work has at most two open notices.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 29 and its handoff §5; BIO_Publication_v0_1.md §5B (RULED 2026-10-01); BIO_Complete_Roadmap_v5.md §11 "Inter-group awareness" (RULED 2026-10-01); BIO_Design_Requirements_v2.md §10 (RULED 2026-10-01).
owed: the "tell the network" act on a project (owner only, outward-act warning, the since-date bounds) and its stop, handoff and lapse; the notice format, signed by an owner's key as a case is (a new statement namespace), in the group's public index; the activity level's published method (five steps over 13 weeks; cut-offs proposed 10–13, 7–9, 4–6, 1–3, 0, tunable within the principles) and monthly re-signing; the weekly independent timestamp on a sealed summary of the week's work and its selective opening at publication; the project reference a later case carries; the owners' public signing keys on the group's public page (this also closes the silence on how a stranger trusts a case's attestor key); links out and the prefilled directory submission; the network site's display and policy (Bob's direction, outside CivicOS); the UX page's question 29 marked ruled.

### DEC-112 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the UX canon's open question 30: how a published case explains its strength to the public, on screen and in print)
for: bob
question: (1) Whether each finding on the public page opens with one line naming its role and the project's bar, above its two grades; (2) whether the printed edition carries every layer in full, with no length limit. Widened by Bob to the forms a published case takes, what its archive must hold, and how another group's copy imports and confirms it.
why it is Bob's: the public face of a case and the doctrine of verifiability (UI-KICKOFF refinements 2026-07-28: print is first-class and carries the full narrative; Publication §3 rule 10: anyone can rebuild and verify without the instance), member-facing acts (import, acceptance) and a new publication refusal.
provisional: the measures map (DEC-82): each mark opens to its plain question, colour marks the scale, never the value, no combined score; the August rulings (archived ledger): DEC-34 (the zip for whoever verifies, the PDFs for whoever reads), DEC-40 (the case renders whole, always), DEC-41 (the container carries its rendering; without it, import-only), DEC-45 (import does not exist; the source's bar does not travel as a bar), DEC-46 (3) (import lands in a new project per source lens); DEC-96 (acceptance names one edition, changes no grade); Publication §3 rules 2, 7, 10, 16.
alternative: (B) grades only, no line; (C) a shorter print with full detail online.
recommendation: (A) a line naming role and bar, then grades, then detail; print carries every layer with contents and glossary, no length limit.
reversal cost: medium (a new publication refusal, a specified case-file format, a standalone checker, and import).
response: **Bob, 2026-10-01: as recommended on the page; the forms reframed, confirmed after discussion:**
  1. "There are forms a published case comes in * a printable version * an archive version that a CivicOS instance can confirm to the point that it creates a read-only project with everything on which the case (made by another group) was made from. Once imported and reviewed, the conclusions of an imported archive can be confirmed, potentially accepted by the importing group, and used as one basis of further work do[ne] by the importing group. Yes, the "printed" version can end up being quite long. But it's important to point out that the printed version may never be printed. The important use case is that ANYBODY can review, and even recreate, the case for themselves without using a CivicOS instance to do so."
  2. "Your draft ruling says that members confirm findings one-by-one. I believe that the system confirms the findings according to the structured case file. That's what a case file is - a complete structured archive that is rich and conformant enough that the results can be recreated."
  3. "a. Everything on which the case's conclusions are based must be presentable. b. Again, there are standards for using and valuing off-the-record sources. While the identi[t]y of the source may be less than standard, there are other attestations that go along with the source's data - including the trust of the group, project, and attesting member. c. as recommended"
  4. "confirmed", on the full text: (1) the public page: each finding opens with one line naming its role and the project's bar ("Relied on · meets this project's bar (capture B, connection C)"), never a bare "meets", then its two grades, then detail; the strength section opens "a case has two strengths, never one"; (2) the complete edition: a self-contained file anyone can read, check and use to recreate the case without CivicOS, no length limit, ordered so a reader can stop early, with the grading method and "How to check this case yourself", every page carrying the identifying notice; printing is incidental; (3) the case file: the complete structured record in a published, versioned format rich and conformant enough that the results can be recreated: the complete edition, every document and observation a conclusion rests on (whole, with its extracted text), the findings' chains, attestations and signatures, and the version of the method and checks inside the signed case; split into parts, never trimmed; an open specification and a standalone open checker let anyone recreate a case without CivicOS; (4) everything a conclusion rests on must be presentable: publication is refused while a relied-on finding rests on material that cannot travel whole; material only under supporting findings may travel as fingerprint, origin and archived copy, labelled; the publishing warning says the case republishes these documents and that judging whether they may be republished is the group's; (5) off-the-record sources: their material travels whole with its attestations (the attesting member's, the project's and the group's); only the identity is withheld, labelled "Withheld" with its reason; their grades recreate like any other; (6) import: a CivicOS copy imports a case file into a new, read-only project; the system confirms each finding by recreating it from the case file (Recreated; Recreated in part, naming what is missing; Did not recreate, naming what differs) and shows each against the importing group's own bar; recreating is not endorsing; the group may accept an edition by its reasoned act only for findings recreated, or recreated in part with the gaps stated; an accepted finding may support the group's own work, marked as another group's.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 30; BIO_Publication_v0_1.md §5C (RULED 2026-10-01); BIO_Complete_Roadmap_v5.md §11 (RULED 2026-10-01, import before acceptance).
amended: 2026-10-02 by Bob through the development process, recorded here at BOB's request (B12, B13): K1254 and K1263 replace response item (5) on off-the-record sources. Anonymity cannot carry a case: "Anonymous sources can lead investigators to other sources, but they can't be the case of a CivicOS case, because CivicOS is based solely on evidence - not narrative." Material whose only attestation is an off-the-record source is a lead, never a basis: no relied-on finding may rest on it, publication is refused where one does, and it never appears in the published case or the case file; it stays in the project as a lead (K1263 (a)). The rule is about anonymity: a named member's own uncorroborated capture may still carry a case with a stated reason (DEC-81; K1263 (b)). Folded into BIO_Publication_v0_1.md §5C (amended 2026-10-02). **Reversed the same day by Bob: see DEC-119, which restores item (5) and withdraws K1254 and K1263.**
owed: the public page's first line per finding and the strength section's opening (the redesign); the complete edition (a rendering inside the case file, closing DEC-41's import-only gap) with "How to check this case yourself" and the grading method; the case file's published, versioned specification (documents and observations relied on, whole, with their extracted text; chains; attestations; signatures; parts when large); the method and checks version moved inside the signed case document; a standalone open checker; the publication refusal for relied-on material that cannot travel whole, and the warning's republication sentence; off-the-record material carried with its attestations, the identity withheld; import into a new read-only project with recreation per finding (three results) and the importing group's bar; acceptance (DEC-96) offered only on recreated findings; the UX page's question 30 marked ruled.

### DEC-113 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the UX canon's open question 31: the litigation hold, what placing it stops, how far it reaches, and what it blocks)
for: bob
question: (1) Whether recording "hold in place" itself stops both scheduled deletions of assistant transcripts on members' devices (at the time limit and at publication), once those deletions are built; (2) how far it reaches; (3) who may place and release it, and whether releasing is heavier than placing; (4) what members see while a hold is in place; (5) whether the operator's wipe of the real record is refused while any hold is in place.
why it is Bob's: doctrine on preservation and spoliation (DEC-61: "THEREFORE THE PURGE MUST BE SUSPENDABLE … once a group is on notice, both the TTL and the publication-deletion must stop for relevant material"), member-facing acts and their weight, and a refusal of the operator's wipe.
provisional: K899 (7) (the hold as a member's named, reasoned statement, "in place" or "released", the latest standing; the reminder's only way out); K901 (any member who can see the action; the reminder to administrators and the marker); K918 (the act graded reasoned); actions R52 ("Nothing here suspends a purge"); K1019 (through the development process: the doorbell archive's one-week clearing pauses while any hold is in place).
alternative: (B) any hold stops all scheduled deletion in the group; (C) the hold stays a statement only; (D) defer, keeping device deletion unbuilt.
recommendation: (A) "hold in place" stops deletion for the threatened project, others named by choice.
reversal cost: medium (a device check before every deletion, a project list on the statement, a heavier release, a wipe refusal).
response: **Bob, 2026-10-01: "Q#31: as recommended"** (A): once devices store assistant transcripts, recording "hold in place" stops both scheduled deletions (at the time limit and at publication), on every member's device, for assistant sessions in the threatened action's project, filled in automatically, and any other projects the member names, kept with the statement; projects may be added by a further statement at any time. A device checks for a hold before deleting and deletes nothing if it cannot check. Placing stays light and open to any member who can see the action, as built. "Hold released" is heavier: it restarts deletion, so its form states what will be deleted ("transcripts for 2 projects past the time limit will be deleted on each member's device when it is next opened. This cannot be undone."), and the administrators and whoever placed the hold are told once. While a hold is in place, members who can see a held project see a strip on it ("Litigation hold in place since 2 Oct 2026, recorded by Paula Reyes. Assistant transcripts for this project stay on your device: they are not deleted after the usual time or at publication. Please do not clear them yourself."); members who cannot see the project see nothing (DEC-36). While any hold is in place, the operator's wipe of the real record is refused (the test store is unaffected). Counsel's review of these defaults before a group relies on them is advised.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 31; INVESTIGATIVE-SESSION.md "TRANSCRIPT RETENTION" (RULED 2026-10-01); BIO_Assistant_and_AI_Roles_v0_1.md item 6.
owed: the hold statement's list of projects (the threatened action's project filled in; further projects by a later statement); the device transcript store's check for a hold before either scheduled deletion, failing closed (deleting nothing when it cannot check); "hold released" made heavier than reasoned, its form stating what will be deleted, the administrators and the placer told once; the held-project strip, shown only to members who can see the project; the control plane's wipe of a real record refused while any hold is in place (actions R52's "Nothing here suspends a purge" superseded); the UX page's question 31 marked ruled.

### DEC-114 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the UX canon's open question 34: what a plan is about, 'Subjects' or 'Matters')
for: bob
question: The word members see for the things an action plan addresses, used everywhere they appear (the plan page's heading and buttons, the preview when an action starts, queue items, the glossary), given that 'Subject' already names an entity (a person in a public role, office, place, law or thing) on the Subjects screen.
why it is Bob's: member vocabulary (P17: UX).
provisional: the approved plan-page sketch's 'Subjects' heading (K608 (4)); the Action canon's prose, which calls them matters (K590 (4); BIO_Action_v0_1.md §3); action-plans Terms and R6 (the internal term 'subject').
alternative: (B) keep 'Subjects', with a glossary warning; (C) 'Issues' or 'Concerns'.
recommendation: (A) 'Matters'.
reversal cost: low (one word, before any plan screen is built).
response: **Bob, 2026-10-01: "Q#34: matters"** (A): every member-facing use of what a plan addresses reads "matter" / "Matters": the plan page's section heading and add button, the options' tags, the preview when an action starts, queue items and the glossary. The approved plan-page sketch changes in that one word. "Subject" keeps its one member-facing meaning (an entity on the Subjects screen). The internal term in the requirements stays "subject" (BOB's). The matter page of question 35 is named consistently with it.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 34; BIO_Action_v0_1.md §7 item 7 (RULED 2026-10-01).
owed: "Matters"/"matter" in every member-facing string for a plan's subjects (action-plans' labels, the start preview, queue-producers' item wording, the glossary; the plan-page sketch's heading); the UX page's question 34 marked ruled.

### DEC-115 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the UX canon's open question 35: the other three Action sketches, fixed as the reference or left to Design)
for: bob
question: For each of the Action design's three remaining sketches (starting and sending an action; the matter page; the sheet of standards, filings and queue items), whether it binds the interface redesign as the approved plan page does (its content, the order of its steps and its wording; look and layout stay Design's) or stays an example the designer may rework; optionally fixing only part of a sketch.
why it is Bob's: UX (P17); the plan page's approval (K608 (4)) set the precedent.
provisional: K608 (4) (the plan page approved); build/plan/action-design/HANDOFF.md ("the plan-page view is approved"); UX-ANSWERS.md OQ-9 (layout remains Design's).
alternative: (A) fix all three; (B) fix starting and sending only; (D) fix none.
recommendation: (C) fix starting and sending, plus the tier 2 filing draft and tier 3 counsel packet panels of the third sheet; the matter page, the standards list and the queue items stay examples.
reversal cost: low (no screen is built from them yet).
response: **Bob, 2026-10-01: "Q#35: as recommended"** (C): `start-and-send.html` binds the redesign's content, step order and wording (the refusal visible before anything runs, the reason asked in place, approving kept separate from recording the sending), as the plan page does; in `surfaces.html`, the tier 2 filing draft and tier 3 counsel packet panels bind likewise; the standards list and the queue items in that sheet, and `matter-page.html`, stay examples the designer may rework within the requirements. Look and layout stay Design's throughout. Where a bound sketch predates a later ruling, the ruling wins: "Matters" for a plan's subjects (DEC-114) and the filing-template rules (K921, K924: a template is the basis of a group's own filing or a briefing to counsel; every approved version offered, the latest by default; a filing may be written without one).
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; the UX substrate's brief for question 35; BIO_Action_v0_1.md §7 item 8 (RULED 2026-10-01).
owed: the action-design HANDOFF's approval line extended to start-and-send and the two filing panels (build/plan/action-design, BOB's); the redesign's start-and-send flow and filing panels held to them; the matter page and queue items designed within the requirements (rulings since the sketches: DEC-110's queue kinds, DEC-113's hold strip, DEC-114's "Matters"); the UX page's question 35 marked ruled.

### DEC-116 · answered
raised: 2026-10-01 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the UX canon's open question 36, its rest after DEC-100: a case's docket, outside responses, and withdrawing a case; it absorbs question 17 and answers N470, deferred from T21 by K943 and BOB's B2)
for: bob
question: (1) The docket's shape and required core, including whether the subject's public statements elsewhere count as required; (2) the path for outside responses; (3) a subject's unredacted reply that names a private person; (4) what a grant of standing gives and whether it can be withdrawn; (5) who adds and takes back entries, how they are signed, how the docket travels, and withdrawal of a published case.
why it is Bob's: publication doctrine (DEC-12, DEC-19: publication is one-way; acts are corrected by further acts), member-facing outward acts, standing (DEC-100), and N470 (K943: no withdrawal act for a ratified edition until this work answers it).
provisional: DEC-100 (party-like standing for the named subject; standing granted to others; no confidential entries; only the submitter redacts; no required disclosure of off-the-record contacts); Bob's direction of 1 October (outside responses captured and promoted, some public, some record only); DEC-101 (a new edition's "What changed" statement; watching other groups' editions); State Rules §5.4 and reevaluation R16 (a retraction sends re-evaluation notices; no trigger since K943); Design Requirements v2 §6; Publication §2, §3 rules 1, 2, 6.
alternative: (B) only what the subject sends is required; (C) a subject's reply always listed whole; (D) the docket now, withdrawal designed later.
recommendation: (A) a shelved docket with a strict core; withdrawal as a signed, final notice.
reversal cost: medium (a second signed public object beside every case; withdrawal final).
response: **Bob, 2026-10-01: "Q#36: as recommended"** (A):
  1. The docket: dated entries beside each case, each naming the edition it concerns, growing while the signed editions never change. Three shelves: what the group stands behind as accurately listed (vouching that each is what it says, not agreeing with it); "Reactions elsewhere", labelled "Listed by the group. Not evidence. Not endorsed."; and "In our record only", seen by members, never published. Checks are on form, never merit: every entry is dated, attributed, names its edition and has a captured copy with its origin. A docket entry never makes anything evidence: to affect a finding, material is captured, read, made to support it, and a new edition follows.
  2. The required core of the first shelf, each a To-do for the project's manager until done: every response the subject sends; any public statement by the subject the group has captured and linked to the case (a press release counts); a newer edition (quoting its "What changed" statement); a withdrawal; anything the case would have had to disclose at signing, such as an open conflict on a load-bearing finding. Outcomes are optional. Responses from those granted standing join the core.
  3. Outside responses: found by a member pasting a link, by standing watches over known sources, or by the assistant's labelled suggestion under the six guards (DEC-95 (3)); captured with grade and co-archive; linked as responding to a named edition; then a member chooses, with a reason, record only, public, or both. In the record, a contesting response prompts a re-evaluation notice, may become a plan checkpoint, and a threat takes a pressure mark. A public "Reactions elsewhere" entry shows date, source, links to the original and the independent archive's copy, and a short summary marked as the group's words, never the article whole.
  4. A subject's reply naming a private person is listed as received, by date, without its text and with the reason, and the subject is asked to resend it without the name; the resent version is listed whole (the redaction is the subject's own, which the group may accept or decline, DEC-100).
  5. Standing granted to others is a signed docket entry with a reason, giving exactly the named subject's rights; it is permanent for what the holder has already submitted, and a later withdrawal of standing covers only future submissions.
  6. Any member files to the record; only the project's manager places an entry in public, signing with their registered key in a short step. An entry is taken back by a later entry with a reason, never deleted.
  7. Withdrawal (N470): the manager's signed docket entry naming one edition or all, with a published reason. The edition stays readable under a stamp linked to the notice; the withdrawal is never lifted, and standing behind the case again needs a new edition. It sends re-evaluation notices to everything resting on it (the trigger reevaluation R16 lacked since K943). It never erases: a legally compelled removal has no path here and would be a separate question.
  8. The docket travels by pull: the public page, a feed per case (a page at a fixed address that a reader's own software checks, with no list of readers kept), citing groups' copies turning entries into notices (DEC-101), and the directory reading feeds (DEC-111). Nothing is pushed; CivicOS sends no email. A citing copy that cannot reach the docket says "Could not read the publisher's docket", never that nothing changed. The docket shows its last entry's date.
decided: 2026-10-01 · Bob
reasoning recorded in: this entry; DEC-100; the UX substrate's brief for question 36; BIO_Publication_v0_1.md §5D (RULED 2026-10-01).
amended: 2026-10-05 by Bob through the development process (K1480, B18; K1493, C10): item 7's "a legally compelled removal has no path here" is answered. An order addressed to the group is complied with openly, never silently: the order is captured, a signed docket entry names it, and the edition is stamped; a sealing order is complied with openly and an unsealing order captured and named before the material is used. A personal fact is otherwise removed, leaving a marker, only when unlawful to hold, confidential, under a recorded court order, or under a lawful demand the jurisdiction profile lists (an official's home address or phone number, Gov. Code 7928.215); removal reaches this copy, future exports and future editions, past editions stay as published, and a later edition states the correction. Folded into the UX substrate (question 36's ruled entry); BOB carries the compliance path in the capability ladders (COURTS, PEOPLE).
owed: the docket as a signed public object beside each case (shelves, entries naming an edition, form checks, take-back by a later entry); the required core as manager To-dos; the outside-response path (paste, watch, labelled suggestion; capture and co-archive; link to an edition; the reasoned record/public/both choice; re-evaluation, checkpoint and pressure prompts in the record); the private-name receipt entry and the resubmission invitation; the signed grant of standing; the manager's signing step for public entries; the withdrawal act (signed, final, naming one edition or all; the stamp; reevaluation R16's trigger; answers N470 and BOB's B2); the per-case feed and "Could not read the publisher's docket"; the UX page's question 36 marked ruled.

### DEC-117 · answered
raised: 2026-10-02 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (DEC-103's owed lines: BOB's draft of the two sentences on why groups declare a lens, sent for the design session's confirmation in B5, K1019, K1025)
for: bob
question: The two sentences that close "The lens this case was produced under" on every published case, telling readers why groups declare a lens; BOB's draft: "Every group works under some lens, and an undeclared lens is the most dangerous kind." / "This group declares its lens, with its reasons and its evidence, so that you can weigh its findings knowing how it looked at the material."
why it is Bob's: public-facing words that state doctrine (DEC-103; Declared Bias: "the most dangerous bias is the denied one").
provisional: case-grammar R9 carries BOB's draft verbatim, "to be confirmed by the design session".
alternative: BOB's draft as written.
recommendation: keep the second sentence; change the first so that a public reader meets the word "lens" defined, and so that it is universal rather than about other groups.
reversal cost: low (words in a requirement, before the format is built).
response: **Bob, 2026-10-02: "your edit"**. The two sentences, verbatim: "Everyone who investigates looks through a lens: what they care about and expect to find. An undeclared lens is the most dangerous kind." and "This group declares its lens, with its reasons and its evidence, so that you can weigh its findings knowing how it looked at the material."
decided: 2026-10-02 · Bob
reasoning recorded in: this entry; BIO_Declared_Bias_v0_1.md, "RULED 2026-10-01 by Bob (DEC-103)" (the sentences added 2026-10-02).
owed: case-grammar R9's first sentence replaced and "to be confirmed by the design session" struck (BOB).

### DEC-118 · answered
raised: 2026-10-02 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the design phase's brand architecture: how the group, CivicOS and Believe in Cities relate)
for: bob
question: Which of the three names leads where: the group (for example "Lakeshore Tenants"), CivicOS (the software), Believe in Cities (the network, believeincities.org).
why it is Bob's: brand (P17: UX), resting on doctrine (Design Requirements v2 §1, §9, §14: no central authority, no single platform essential; K1: no jurisdiction in the product, outward text names the product and the group).
provisional: K1; DEC-111 (the network at believeincities.org/<place>); Publication §7 (the group's public identity: its slug, display name and verified domain).
alternative: (B) CivicOS leads as a product brand on every case; (C) Believe in Cities leads, with CivicOS as its tool.
recommendation: (A) the group leads.
reversal cost: medium once screens and published cases are drawn.
response: **Bob, 2026-10-02: "A"**. The group leads everywhere it acts. A published case is headed by the group as publisher and signer ("Lakeshore Tenants · The Coliseum lease · Edition 2"), with "Made with CivicOS" in small type at the foot of the page, in the complete edition and in the case file. A member's workspace carries the group's name at the top, with CivicOS small in a corner. CivicOS is the tool, credited quietly and never presented as the publisher. Believe in Cities is the network: its directory and forum live on their own sites, and CivicOS only links to them (DEC-29's links out, DEC-111).
decided: 2026-10-02 · Bob
reasoning recorded in: this entry; BIO_Publication_v0_1.md §7 (RULED 2026-10-02).
owed: the design phase's brand and voice work, visual language and screens built on it (the design session); the public page's, complete edition's and case file's credit line and masthead (publication, public-read; once drawn).

### DEC-119 · answered
raised: 2026-10-02 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (Bob's reconsideration of K1254 and K1263, which had amended DEC-112 (5) through the development process the same day)
for: bob
question: Whether off-the-record source material may support a published case, as DEC-112 (5) ruled on 2026-10-01, or only lead an investigation, as K1254 and K1263 ruled on 2026-10-02; and how the guard against a corrupt group publishing on anonymous attestation is stated.
why it is Bob's: publication doctrine (evidence, attribution and anonymity; Publication §3 rule 7; DEC-102; DEC-112).
provisional: DEC-112 (5) (off-the-record material travels whole with its attestations; only the identity withheld); DEC-102 (a member's testimony or evidence credited at the group or project level is anonymous, treated like an anonymous tip and weaker, and "must be corroborated based on journalistic and legal standards"); K1031 (1) (ratification R35 refuses signing where a relied-on finding rests on group- or project-level testimony with no independent corroborating leg); K1254, K1263 (off-the-record material a lead only, never in the published case).
alternative: keep K1254 and K1263.
recommendation: return to the 1 October rulings, stating explicitly that the corroboration rule for anonymous members also covers an off-the-record source attested by an anonymous member.
reversal cost: low (K1254 and K1263 were queued for T28's opening, N519, and not yet folded into any requirement).
response: **Bob, 2026-10-02: "I think I was confused. The old decisions made a few days ago about anonymity should stand. Not all anonymity is the same. We do want to make sure that corrupt groups aren't able to publish faulty cases, but I believe the old rulings protected against that."** Confirmed ("confirmed") on this text: return to the 1 October rulings on anonymity; the 2 October change (K1254, K1263) is withdrawn. (1) Off-the-record source material may support a case: it travels whole in the published case and the case file, with the attesting member's, the project's and the group's attestations; only the source's identity is withheld, labelled "Withheld" with its reason, and its grade reflects an unnamed source. (2) The guard against abuse stands as ruled: testimony or evidence from a member credited only at the group or project level counts as anonymous, and a relied-on finding resting on it cannot be signed without an independent corroborating leg (DEC-102; K1031 (1)). (3) This applies equally when such an anonymous member is the one attesting an off-the-record source. (4) A named member's own capture may still carry a case with a stated reason (DEC-81).
decided: 2026-10-02 · Bob
reasoning recorded in: this entry; DEC-112 (5) and its amended: line; BIO_Publication_v0_1.md §5C ("Off-the-record sources", restored 2026-10-02).
owed: K1254 and K1263 withdrawn and N519's DEC-112 (5) share re-cut to DEC-112 (5) as ruled on 2026-10-01 (BOB records the K); ratification R35's refusal extended to a relied-on finding resting on an off-the-record source attested by a member credited only at the group or project level, with no independent corroborating leg (point 3); K1134 Q6 (which record holds a project's and a group's attestation of off-the-record material) back with BOB; the UX page's question 30 card restored.

### DEC-120 · answered
raised: 2026-10-02 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the design phase's principles page, gaps G4 and G5, after Bob asked whether wizards were sufficiently developed)
for: bob
question: (G4) Whether guided flows (wizards) run from authored scripts without the AI assistant, the assistant adding free-form planning where a group has set a key; (G5) whether a wizard may place a labelled draft in a field for the member to adopt, as DEC-101 and K1019 already allow for the "what changed" statement and the escalation reason, the member alone pressing the act's button; and what the authored step lists are called.
why it is Bob's: UX and the assistant's boundary (DEC-24, DEC-27, DEC-90); the wizard's no-fill rule (ASSISTANT-PILOT §3) was Bob's.
provisional: DEC-27 and DEC-90 (the wizard opens the real surface, never fills a field or presses a button); ASSISTANT-PILOT §2–§3 (the wizard as something the assistant presents; recipes authored as data and checked at build); skills R9–R10 (the recipe layer, empty; Bob's, N144).
alternative: (G4) wizards only through the assistant; (G5) the wizard only shows text beside a field for the member to copy.
recommendation: G4 yes; G5 yes.
reversal cost: low (nothing built).
response: **Bob, 2026-10-02: "G4: yes", "G5: yes", and "wizard scripts and recipes are the same? Let's just call them wizard scripts then."** Any multi-step journey can be walked as a guided flow. (1) A guided flow runs from a wizard script (the authored step list formerly called a recipe) for every group, with no AI and no key needed; where a group has set a key, the assistant may also plan a flow on the fly from what the member asks. Either way the member works on the real screens, with the guide in the docked panel (DEC-90); the guide opens each step's screen, says what to do there and why, checks the step is done, and advances; abandoning it is a non-event. (2) A step may place a labelled draft in a field (machine work, or a script's or template's text, labelled as such) for the member to edit and adopt; the member alone presses the act's button, and every act still runs its own checks, reason and receipt. "Wizard script" is the name in the design and in what members see; "recipe" is retired from the design's vocabulary.
decided: 2026-10-02 · Bob
amended: 2026-10-03 by Bob, on the design-principles page: "Let's call guided flows wizards". "Wizard" is the member-facing and design name for a guided flow, here and in DEC-121; "wizard script" stays the name of its authored step list.
reasoning recorded in: this entry; the design-principles page (principle 6.6; G4, G5); BIO_Interaction_Constructs_v0_1.md §P "THE WIZARD" (RULED 2026-10-02).
owed: wizard scripts runnable without the assistant (a script runner beside the assistant's own planning); the skill pack's recipe layer renamed and fed from the governed script library once its design is ruled; the wizard's draft-in-field step (labelled, adopted by the member) replacing ASSISTANT-PILOT §3's no-prefill rule; who authors and approves scripts, still open with Bob.

### DEC-121 · answered
raised: 2026-10-03 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (who authors and approves wizard scripts, left open by DEC-120)
for: bob
question: How wizard scripts are authored, checked, approved, found, kept working, and shared; whether members author their own; and when the design phase identifies and writes them.
why it is Bob's: UX, member acts and their governance (P17); the content of the shipped library is Bob's (skills R10, N144).
provisional: DEC-120 (guided flows; wizard scripts run without the AI; labelled drafts in fields); the filing-template library's governance (K921, K924; filing-templates R1–R14) as the model; ASSISTANT-PILOT §2 (scripts authored as data and checked at build).
alternative: scripts authored only by the development process and shipped with releases; authoring only through the assistant; a list page as the only way to find flows.
recommendation: two libraries; recording and the assistant as everyday authoring; an advanced editor by grant; required and optional flows; a standard mark where flows begin; sharing between groups.
reversal cost: medium (a governed library, a recorder, a mark on every screen where flows begin).
response: **Bob, 2026-10-03, on the design session's revised draft: "3. agreed", "4a. agreed", "4b. agreed", "4c. & 6: agreed"; earlier, on the first draft: "5. agreed", "7. agreed", "I like the notion of groups sharing scripts!"; and his refinements: "'Write or edit one directly' sounds like super-user function"; "the assistant must be an expert script author, knowing the good, bad, and best practices"; "scripts that start in a particular place in the UI should have a standard appearance … and standard location. Mousing over or clicking gives more info about it. Users could start authoring a new script by clicking at the script starting point"; "Maybe some scripts being judged as non-function is a fatal error (required scripts) but other times not"; "the smooth use of the system may rest on some scripts working properly (onboarding members, the publishing ceremony, etc)."** As confirmed:
  1. Two libraries. The CivicOS library is shipped with releases, its content approved by Bob. Each group's own library is governed like filing templates: versioned, never edited; approved by a project owner, widened group-wide by an administrator; a machine never approves; retired, never deleted.
  2. Authoring. Any member makes a script by recording a walk-through (the screens and acts used, never the values typed) or by asking the assistant; they may reword, delete or reorder its steps, and use their own draft privately before approval. Building a script from a blank page or adding steps by hand is an advanced editor, granted by an administrator, absent for everyone else.
  3. The assistant is an expert script author: it knows the good, the bad and the best practices, the checks, the group's existing scripts and where members struggle; it drafts to the checks, critiques recorded scripts, and explains refusals in plain words.
  4. Checks. A script is refused if it names screens or acts that do not exist, has a step without its "why", or tells a member what to conclude (a script says what to do, never what to conclude). It is warned if it is trivial (one step) or duplicates another.
  5. Required and optional flows. Required flows (setting up and claiming a group's copy, onboarding a member, the publication ceremony) are in the CivicOS library; groups cannot edit or retire them; a failing required flow blocks the release, and each is tested as its screens are accepted. The publication ceremony is also mandatory (the only way to publish); onboarding must work but may be left. An optional flow that stops matching the screens is withdrawn from members until fixed, never shown broken, and its owner is told why.
  6. Finding flows. Wherever flows begin, a standard mark sits in a standard place on the screen (its look decided in the visual language; not a gear). Hover or tap shows the flows that start there, each with its name, steps, approver and how often members finish it; a click starts one, or records a new one from there. A library page serves owners and administrators. The system suggests candidate flows from where members abandon or are refused, and shows each script's owner its use (started, finished, where abandoned). Flows are offered, never pushed.
  7. Running. Guided flows always run on the real screens, the guide in the docked panel, whether from a script or planned by the assistant (DEC-120).
  8. Sharing. A group may share an approved script as a signed file or through the network directory; an importing group receives it as "Another group's" and applies its own checks and approval before any member sees it. Designed now, built later.
  9. Timing. Candidate flows are identified in the design phase's step 3 (journeys) and scripts written in step 5 (screens), walked through the mockups as a usability test, and finalized as the screens are built.
decided: 2026-10-03 · Bob
reasoning recorded in: this entry; BIO_Interaction_Constructs_v0_1.md §P "THE WIZARD" (RULED 2026-10-03); the design-principles page (6.6, 6.7).
owed: a governed wizard-script library per group (versions, review, approval, widening, retirement; machine never approves), mirroring filing-templates; the walk-through recorder (screens and acts only); the step touch-up and the advanced editor behind an administrator's grant; the checks (refusals and warnings) as code; the assistant's script-authoring guidance in its instruction pack; required flows in the CivicOS library, their failure blocking the release; optional flows withdrawn when broken, with the owner's notice; the starting-point mark and its hover, click and record-from-here; candidate suggestions and per-script use counts; sharing as a signed file and import with approval (later); the design session's step-3 candidate list and step-5 scripts.

### DEC-122 · answered
raised: 2026-10-03 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the design phase's principles page, gaps G1, G2 and G3)
for: bob
question: (G1) What a phone can do; (G2) whether member screens come in light and dark; (G3) whether everything the interface needs ships inside the group's own copy, with no outside fonts, analytics or trackers.
why it is Bob's: UX and the privacy doctrine (Refinements 2026-07-28 on devices; DEC-31 and K597 (5): nothing non-public leaves by a system path; Design Requirements 9, 14: no platform essential).
provisional: the first release supports phones, "acceptably as a viewing MVP" (Refinements 2026-07-28); UI-PLAN keeps release a desktop act; no ruling on dark mode; `civicos-ui/tokens.css` asks for no runtime font loading while the old interface loads Google Fonts.
alternative: (G1) B, every act on a phone; C, a phone reads only; (G2) light only; (G3) allow well-known services.
recommendation: G1 A; G2 yes; G3 yes.
reversal cost: low now; higher once screens are drawn.
response: **Bob, 2026-10-03: "Agreed with all"** (G1 A, G2 yes, G3 yes, as recommended). (1) On a phone a member reads everything and does everyday acts (reversible and reasoned), including capturing a document; terminal, attested and irreversible acts (signing, publishing, sending) happen on a larger screen for now, and the phone says where to finish. (2) Member screens come in light and dark, following the device's setting, with a choice in settings; the public case follows the reader's setting on screen; print and the complete edition are always light; every colour is checked for contrast in both. (3) Everything the interface needs (typefaces, icons, scripts) ships inside the group's own copy; no outside fonts, analytics or trackers on member screens or the public case.
decided: 2026-10-03 · Bob
reasoning recorded in: this entry; the design-principles page (8.6, 8.8, 9.6); BIO_Interaction_Constructs_v0_1.md §L (RULED 2026-10-03).
owed: the phone's act set (reversible and reasoned only, for now) and its "finish on a larger screen" handoff; light and dark themes with contrast checked in both; the interface's typefaces, icons and scripts bundled in the release, the old interface's Google Fonts load removed, and no outside requests from member screens or the public case.

### DEC-123 · answered
raised: 2026-10-03 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE; the development process runs on his secondary account) (the design phase's step 1: the design principles)
for: bob
question: Whether the design-principles page, every UX principle Bob has ruled stated once in plain words, with his comments of 2–3 October folded in and gaps G1–G5 ruled (DEC-120, DEC-122), is the yardstick every screen of the redesign is checked against.
why it is Bob's: UX (P17).
provisional: the principles' sources: Bob's UX principles and refinements of 2026-07-28 (UI-KICKOFF), the interface brief's standing constraints, DEC-24 to DEC-122, K1.
alternative: none offered; the page invited edits to any principle.
recommendation: approve.
reversal cost: low (each principle remains individually amendable by a later ruling).
response: **Bob, 2026-10-03: "principals accepted"** (principles accepted). `docs/development/ux-substrate/design-principles.html` (57 principles in nine families, with Bob's five comments folded in: professional members, zooming out, imported work, confirmed versus unconfirmed findings, "wizard") is APPROVED as the design phase's yardstick: every screen and wizard script in steps 2 to 5 is checked against it before it comes to Bob.
decided: 2026-10-03 · Bob
reasoning recorded in: this entry; the page itself (status line: APPROVED 2026-10-03); BIO_Interaction_Constructs_v0_1.md (pointer under §L).
owed: none to the build directly (each principle's own ruling carries its owed work); the design session checks every step 2–5 deliverable against the page.

### DEC-124 · answered
raised: 2026-10-03 · the UX design session with Bob on his primary account (session_01JZtUsAKpStQoiwF6rzqsyJ; the development process runs on his secondary account) (Bob's direction at the session's takeover: the name CivicOS must change, because several other projects, in related and unrelated fields, already use it)
for: bob
question: The product's new name, replacing CivicOS in every text people read.
why it is Bob's: brand and member-facing vocabulary (UX, P17): the name is how members, readers, journalists and officials know the tool.
provisional: CivicOS (K1: outward text names CivicOS and the group; DEC-118: "Made with CivicOS").
alternative: first round: Plumb (recommended, then withdrawn on finding at least five software products of that name), Assay, Steadfact, Standing, Heedwork, Stet; second round, under Bob's test of how someone who hears the name finds the tool: Heedwork, Factstand, Casesmith, Heedfast, Casestead; Bob's own suggestions Civicworks, Civicwatch, Civicfacts, Civication, Civicize and Civiceyes, each already in use nearby or flawed. About 150 names screened for free addresses, 27 searched for every existing use.
recommendation: Civicsmith (Bob's suggestion): the only candidate passing all four finding steps (one spelling from hearing; nothing else uses it, so search results can be the project's; civicsmith.com, .org, .app and .net free; no software of that name), with Heedwork as runner-up.
reversal cost: low now (text only); rising once the addresses, signed records and published cases carry it.
response: **Bob, 2026-10-03: "Yes, smith implies expert. Not as welcoming for newcomers, but definitely pointing at the destination we're offering - expert civic accountability tools. So you're right, we have to make sure that the "path to success" is wide enough and inclusive enough for all audiences." Then: "Civicsmith it is. I'll get the domains. You coordinate with BOB to start the process of converting from CivicOS".** The product is named **Civicsmith**: one word with only its first letter capital (never "CivicSmith", "Civic Smith" or "the Civicsmith"); "civicsmith" in lower case only in addresses and identifiers. Every text people read says Civicsmith where it said CivicOS: "Made with Civicsmith", "your group's copy of Civicsmith". It is software, never a publisher, a person or a firm. The name names the destination, skilled civic accountability work; the journeys make the path to it wide and inclusive for every audience. Records already signed keep their old labels. Bob registers the addresses (civicsmith.org, .com, .app, .net). BIO and Believe in Oakland are unchanged.
decided: 2026-10-03 · Bob
reasoning recorded in: this entry; docs/development/ux-substrate/new-name.html (both rounds, the four finding steps, every name set aside and why, the brand check by audience); BIO_Publication_v0_1.md §7 (RULED passage).
owed: (design session, done with this entry) the text rename in the canon documents and the design-phase pages; brand and voice revised for the name; (design session, later) the journeys (step 3) keep the path wide for newcomers. (BOB, by HANDOFF U36) member- and public-facing strings in requirements and code (K1's wording, installer R22, signatures R32, the "Made with" credit); the code identifiers (`civicos-ui`, `civicosUserAgent`, the workers.dev address, the `civicos-process` repository name, the type labels written into new signed records such as `civicos-working-on-attestation`), records already signed keeping their labels and still verifying; CLAUDE.md and the process documents; the move to civicsmith.org once Bob holds it.

### DEC-125 · answered
raised: 2026-10-03 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE, the page's author; carried to its answer by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process runs on his secondary account) (the design phase's step 2: brand and voice, and its questions V2 and V3)
for: bob
question: Whether the brand-and-voice page (who speaks, how the names are written, Civicsmith's voice, tone by moment, words to use and avoid) is approved; V2, whether a group may show its own logo; V3, whether the assistant says "I" in conversation.
why it is Bob's: brand and member-facing voice (UX, P17).
provisional: DEC-118 (the group leads; the tool credited quietly), DEC-124 (Civicsmith), DEC-90 (machine work labelled with who asked), the Roadmap's values and operational principles.
alternative: (V2) no logos, the group's public identity staying its name, short name and verified address; (V3) never "I", the assistant speaking only in the third person.
recommendation: approve; V2 yes, optional; V3 yes, in conversation only.
reversal cost: low (wording and one optional upload; nothing built yet).
response: **Bob, 2026-10-04: "The brand and voice is mostly approved, as are the measures. But for the brand question... V1: Explain the wordmark and smybol [symbol] options more clearly. Show me. V2: Yes, optional V3: Yes"**. (1) Sections 1 to 5 of `docs/development/ux-substrate/brand-and-voice.html` are APPROVED as the voice standard: two voices never mixed (the group's "we", Civicsmith's interface words); seven traits (plain, exact, calm, honest about limits, respectful, neutral on policy, disciplined output); tone by moment; the words to use and avoid. (2) V2: an administrator may add the group's logo; it appears beside the group's name on its public face and in its workspace, stored inside the group's copy; the name always appears in words too; never required. (3) V3: in conversation the assistant says "I"; in every label and record it is "the assistant", with who asked; it never says "we". V1 (wordmark alone or with a symbol) is redrawn for Bob as options A, B (a hallmark, recommended) and C; V4 (translation) is a draft ruling built on his direction of 2026-10-04; both await him.
decided: 2026-10-04 · Bob
reasoning recorded in: this entry; the page itself (status line); BIO_Publication_v0_1.md §7 (V2); BIO_Assistant_and_AI_Roles_v0_1.md §5 (V3); BIO_Interaction_Constructs_v0_1.md (pointer beside DEC-123's).
amended: 2026-10-05 by Bob through the development process, folded by the design session at BOB's NOTICEs B30–B32 (no second ruling): (1) K1483 and K1485 (C2 row 8): "never name an individual except in official role" binds only Civicsmith's own voice and published surfaces; members' screens show people as the record holds them; published naming follows Design Requirement 6 as amended (a person materially involved named by name, title or role, with a recorded basis). Actions stay addressed to offices, showing the holder that day (K1484 row 5). (2) K1486 (C3): the words members see for connections, events and timeline, money and people; the words avoided ("knows", "network", "conflict", "suspicious", "most connected", "ledger", "diverted", "misused"). (3) K1488: "claimed the same person, grade B, because …". (4) DEC-131: "Status" and "hint". Folded into brand-and-voice.html §5 (Words; Addressing people) and its status line.
owed: (BOB) the group logo: an administrator's upload, stored in the group's copy, shown beside the name on the public face and workspace, with the name always in words (V2); the assistant's conversational wording in first person and "the assistant" in every label and record (V3). (Design session) the voice applied to every screen and wizard script in steps 3 to 5; V1 and V4 when Bob answers.

### DEC-126 · answered
raised: 2026-10-03 · the UX design session with Bob on his primary account (session_01TNeXM2Qvi7zMXT6BntbENE, V1's author; carried to its answer by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process runs on his secondary account) (the brand-and-voice page's V1: Civicsmith's mark)
for: bob
question: Whether Civicsmith is shown by its wordmark alone or by the wordmark with a symbol, and which symbol.
why it is Bob's: brand (UX, P17).
provisional: the old interface's typed wordmark; DEC-118 (the tool credited quietly); DEC-124 (Civicsmith).
alternative: (A) the wordmark alone, a plain "C" where there is no room; (B) a hallmark, a stamp holding "Cs" (recommended until D; its letters fail at browser-tab size); (C) an anvil (reads as hammering at government).
recommendation: D, the plumb bob: legible at every size, saying "measured against a true standard".
reversal cost: low now (no screen built); rising once releases, icons and published cases carry it.
response: **Bob, 2026-10-04**, after asking for the options to be shown ("V1: Explain the wordmark and smybol [symbol] options more clearly. Show me."), commissioning a better symbol than the anvil from another model, and bringing back its plumb-bob board, which this session traced: **"That's okay, I'm happy with the version you now have in the brand document. Let's go with that."** Civicsmith's mark is the wordmark with a plumb bob (option D): a peg, a collar whose lower edge comes to a point, a V-shaped upper band and two long lower facets, in one colour, as drawn on the page and kept in `docs/development/ux-substrate/marks/civicsmith-plumb-bob.svg`. The plumb bob stands alone in the browser tab and as the phone icon, and sits before the word in the credit ("Made with [mark] Civicsmith") and on the setup page. The peg, collar and band stay in every version (without them it reads as a gem, a pin or an arrowhead). Step 4 sets type, colour and proportions around it.
decided: 2026-10-04 · Bob
reasoning recorded in: this entry; the brand-and-voice page (V1, options A to D shown in four places each); BIO_Publication_v0_1.md §7.
owed: (design session) the mark carried into step 4 (type, colour, small-size version) and the screens of step 5; (BOB) the mark as the product's browser icon, phone icon and credit mark when the interface is built, from the source file; (Bob) the mark included in the trademark clearance search with the name.

### DEC-127 · answered
amended: 2026-10-06 · DEC-157: who may translate, the assistant's first cut as the second opinion, protected words, and local words.
raised: 2026-10-04 · the UX design session with Bob on his primary account (session_01JZtUsAKpStQoiwF6rzqsyJ; the development process runs on his secondary account) (the brand-and-voice page's V4, recast as a draft ruling from Bob's direction on translation)
for: bob
question: Whether groups may change the interface's words, and how a group supports members who speak different languages.
why it is Bob's: member-facing language and access (UX, P17); it amends principle 8.5 and DEC-99's "Language".
provisional: DEC-99 (words in one place, English first; a translated case never presented as the signed case); DEC-120 and DEC-121 (labelled drafts the member adopts; groups' libraries and later sharing); DEC-90 (machine work labelled).
alternative: (A) Civicsmith's words only, translations with releases (the page's first recommendation); (B) groups may rename labels within a language.
recommendation: the draft below, built on Bob's direction.
reversal cost: low now (nothing built); moderate once groups hold translations.
response: **Bob, 2026-10-04: "V4: agreed"**, to the draft built on his direction of the same day: "A group should be able to translate their words too - and thus support multi-lingual usages across their membership. But a surface or feature of the assistant may be needed to support the group in this way." Ruled: (1) each member chooses their language; screens show in it wherever a translation exists and in English otherwise, word by word, never blank. (2) A group may translate the interface for its members: Civicsmith's own translations come with releases; a group may add a language its members need, or improve a translation, in its own copy; the fixed terms (the grades, "Undetermined", the queue's kinds, the acts' names) each carry a note on what they mean, so every language says the same thing; renaming words within a language stays out (option A), so cases read the same from group to group. (3) The group's own writing (notes, questions, findings, notices) can be read in a member's language on request: the assistant drafts the translation, labelled "Machine translation · original in English", the original one tap away; a translation never replaces the original, and a member's own words stay theirs. (4) Signed and published records stay in the language they were signed in; a translation of a published case is labelled unofficial and links the signed original (principle 8.5). (5) A translation workspace: administrators, or members given the grant, see every interface word in English beside the group's language, gaps marked; the assistant drafts the missing words as labelled drafts and a member who knows the language checks and adopts each; without the assistant, members type them. (6) Later: a group may offer its translation to Civicsmith's library, reviewed before it reaches every group, as wizard scripts are shared.
decided: 2026-10-04 · Bob
reasoning recorded in: this entry; the brand-and-voice page (V4, with its example); BIO_Interaction_Constructs_v0_1.md §L; the design principles (8.5).
amended: 2026-10-05 by Bob through the development process (K1502): the assistant runs only on a member's own Claude account, so a translation draft or a machine translation uses the account of the member who asks; a member without one types translations in or reads the original. Noted on brand-and-voice.html under V4.
owed: (BOB) the member's language setting; the group's translation layer over the interface's words, stored in its copy, with each fixed term's meaning note; the translation workspace and its grant; the assistant's translation drafts (interface words and the group's writing), labelled machine work, adopted only by a member; "read in my language" on notes, questions, findings and notices, the original one tap away; signed records unchanged. (Design session) the translation workspace and the "read in my language" control drawn in step 5; the word list carries meaning notes for the fixed terms.

### DEC-128 · answered
raised: 2026-10-04 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (the design phase's step 3, journeys: question J1, who we design for)
for: bob
question: Whether the audiences gathered from the requirements (twenty) and the original brief (five) are reconciled into three rings: members inside the group (newcomer, experienced investigator, professional member, project owner, administrator, the group's future members); people invited in (an outside reviewer, the group's lawyer); people outside the group (someone handing over material, the public reader, journalists, partner groups, government offices and officials, oversight bodies); with the installer and founder kept as moments of the administrator's role, project participant and member outside a project as states, the assistant as an actor and residents addressed by an action as the people an action speaks to.
why it is Bob's: who the product is designed for (UX, P17).
provisional: the UI-KICKOFF's five audiences; the twenty in `ux-experience.json`.
alternative: keep twenty separate audiences, or the brief's five in order of use.
recommendation: three rings; the newcomer member the centre of gravity; members who read another language, screen-reader and keyboard users and phone users across every ring.
reversal cost: low (a grouping; no requirement rests on it).
response: **Bob, 2026-10-04: "J1: yes"** (recorded on the journeys page and in HANDOFF.md by session_01JZtUsAKpStQoiwF6rzqsyJ); **confirmed for the record 2026-10-05: "Record my answers to J1, J2 and J5 as DECs".** Kinds of group (professional; issue-specific; neighbourhood or community; catch-all) are described beside the rings, with the note that a public body may itself run a copy (an inside auditor), so the design never assumes the group stands outside government.
decided: 2026-10-04 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/journeys.html` §1; BIO_Interaction_Constructs_v0_1.md §R (new); `ux-experience.json` audiences (each with its ring), rendered on the UX substrate page.
amended: 2026-10-05 by Bob, on reading the journeys page: "The journeys document list journalists only as outsiders, but newsroom groups are a core audience." Newsroom staff (reporters, editors, researchers and fact-checkers running their own group's copy) join the members ring as a core audience; journalists outside the group stay in the outside ring. Consequences carried by the design session: the editor as the owner who signs, legal review as a review copy, source protection, deadlines (the eighth wide-path rule), collaboration between newsrooms (sharing packs), and a new gap, releasing a case when its story runs. Folded into journeys.html §1 and §6, `ux-experience.json` (a new audience), BIO_Interaction_Constructs_v0_1.md §R.
owed: nothing to BOB (a design grouping). (Design session) every later journey, screen and wizard checked against the rings.

### DEC-129 · answered
raised: 2026-10-04 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (step 3: question J2, the wide path)
for: bob
question: Whether eight rules, drawn from Bob's words of 3 October that the path to success must be "wide enough and inclusive enough for all audiences", become the test every journey and screen passes, alongside the design principles.
why it is Bob's: UX standard every screen is checked against (P17).
provisional: the approved design principles (DEC-123), brand and voice (DEC-125).
alternative: fold the rules into the principles page as new principles; or leave them as guidance.
recommendation: adopt them as a test beside the principles, each journey and screen checked against both.
reversal cost: low.
response: **Bob, 2026-10-04: "J2: yes"** (recorded on the journeys page and in HANDOFF.md by session_01JZtUsAKpStQoiwF6rzqsyJ, after his three comments that shaped rules 4, 6 and 7); **confirmed for the record 2026-10-05: "Record my answers to J1, J2 and J5 as DECs".** The eight rules: (1) a front door in every journey, a first step a newcomer can take alone, the screen showing where it starts; (2) wizards on the main roads, never gates, and leaving one at any step is a non-event; (3) you can always see where you are: each journey shows its stage and what comes next; (4) explained where it appears, and findable again: a term explained the first time a member meets it, never pushed again, its explanation one hover, focus or tap away and in one list of every term; (5) heavier steps slow you down: friction rises with an act's weight; (6) any order, and pick up where you left off: steps in whatever order the work allows, only a step that truly needs another waiting for it, unfinished work found exactly as left and listed where the member will see it; (7) many front doors: a member starts from whatever drew them in, most often a problem they live with, and no journey assumes everyone starts from a question; (8) fast for those who know: search, keyboard, acting on many items at once, no repeated teaching.
decided: 2026-10-04 · Bob
reasoning recorded in: this entry; `journeys.html` §2; BIO_Interaction_Constructs_v0_1.md §R (new).
owed: nothing new to BOB; rule 4's term list and rule 6's list of unfinished work are screens of step 5. (Design session) every journey, screen and wizard script checked against the eight rules.

### DEC-130 · answered
raised: 2026-10-04 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (step 3: question J5, which wizards are written now)
for: bob
question: Whether every outlined wizard is written in step 5, rather than only the three required ones (set up and claim, welcome a new member, the publication ceremony).
why it is Bob's: scope of the design work and of the wizard module's test (P17).
provisional: DEC-120, DEC-121 (wizards and wizard scripts; three required).
alternative: write the three required wizards now and the optional ones later.
recommendation: write the required three first, the rest after.
reversal cost: low.
response: **Bob, 2026-10-04: why delay the optional ones? Writing them tests whether the wizard module can meet real-world needs** (his answer as recorded on the journeys page and in HANDOFF.md, "J5 (write every wizard now; writing them tests the wizard module)"); **confirmed for the record 2026-10-05: "Record my answers to J1, J2 and J5 as DECs".** Every wizard the journeys outline is written as a wizard script in step 5 and walked through the mockups; any limit the scripts hit in the wizard module goes to the development process. The welcome wizard is written too; only its final words wait for the redesign to settle, as DEC-91 ruled for onboarding.
decided: 2026-10-04 · Bob
reasoning recorded in: this entry; `journeys.html` §5 and J5; BIO_Interaction_Constructs_v0_1.md §P (beside DEC-121).
owed: (BOB) any wizard-module limit the written scripts reveal, as a HANDOFF when found. (Design session) every wizard script written and walked in step 5.

### DEC-131 · answered
raised: 2026-10-05 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (BOB's B39: the queue's "Signal" collides with K1473's machine signals)
for: bob
question: The members' words for two things now both called "signal": the queue's third kind of item (DEC-110, the CONDITION class: an overdue reply, an unreachable source, a capture about to expire, a limit reached) and the machine's judgment signals (K1473: a score standing for importance, suspicion, significance or a possible cause, held only in the hypothesis layer).
why it is Bob's: member vocabulary (UX); delegated by Bob to the design session (P17).
provisional: DEC-110 ("Signal"); K1473 ("signal"); queue R48, queue-producers R24.
alternative: keep "Signal" for the queue and give the machine's signals another word; or the reverse.
recommendation: the queue's third kind is "Status" (Bob's alternative when he chose "Signal" in DEC-110; it names what these items are, a state of something the member is following); the machine's judgment signal is a "hint" (beside a member's "hunch" and a "hypothesis"; it says plainly that it is not evidence). "Signal" leaves member text; internal codes and the canon's word "signal" are unchanged.
reversal cost: low (labels; queue R48's label and queue-producers R24's sentences).
response: **Bob, 2026-10-05: "The word "Signal": the queue's "Signal" label collides with K1473's machine signals. Choose members' words for both."** Chosen by the design session as recommended: **"Status"** for the queue's third kind and **"hint"** for a machine signal. A queue item reads "Status · The city's reply to “Demand to rescind” was due 9 October; no reply recorded". A hint reads with its machine-work label, method, inputs and measured false-alarm rate, for example "Hint · machine work · 41% of Public Works' payments in FY2024 went to one vendor · method · false alarms 12%"; a member may take it up as a hunch. "Noticed" items the machine raises under K1491 carry the same "Hint" mark.
decided: 2026-10-05 · the design session, under Bob's delegation
reasoning recorded in: this entry; NOTIFICATIONS.md (beside DEC-110); BIO_Interaction_Constructs_v0_1.md §revised set (QUEUE); brand-and-voice.html §5; `ux-experience.json` question 28's ruled entry; `ux-substrate-v2.json` (CONDITION's member word).
owed: (BOB) queue R48's `QUEUE_CLASS_LABELS` CONDITION "Signal" → "Status", and queue-producers R24's member-facing word "signal" → "status" (codes unchanged); the hint's member-facing label wherever K1473's signals and K1491's machine checks reach a member.

### DEC-132 · answered
raised: 2026-10-04 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (the design phase's step 3, journeys: question J7, journey 2 "The group says who it is and why", from Bob's suggestion of 2026-10-04)
for: bob
question: Whether a group may record what kind of group it is and why it exists, so that Civicsmith's welcome fits it; and who sees it.
why it is Bob's: a new requirement (what a group's copy holds) and what the public may see about a group (P17).
provisional: a group's copy holds its short name, display name and verified web address only (instance-setup R10, R11); a group with a stake discloses it in its declared bias (Declared Bias, instance level; Action §1).
alternative: (B) a members-only purpose statement, no kinds and nothing tailored; (C) nothing, every group welcomed alike.
recommendation: (A) as drafted in journey 2, members-only by default.
reversal cost: low (optional fields; nothing rests on them but the order of what is offered).
response: **Bob, 2026-10-05: "J7: A"**, after the brief on the journeys page (the issue, today, an example, options A to C, the risk). Ruled: (1) optional, offered as a side trip at the end of setup and from the group's settings at any time, never required, changeable at any time; (2) the group picks one or more kinds (professional; issue-specific; neighbourhood or community; catch-all; or describes its own), names its focus (issues, places, offices or agencies it watches) and writes why it exists in its own words; (3) seen by members only, unless the group chooses to show it also on its public page and the network directory, which is an outward act with its warning at that moment (principle 4.5): the people the group examines will see what it is watching; (4) it shapes only what is offered first ("What brought you here?" offers the group's focus first; standards and wizards matching its kind are suggested first) and never locks or hides anything a member's capabilities allow; (5) where the group has a stake in what it investigates, its declared bias can start from what it wrote, still the group's own act.
decided: 2026-10-05 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/journeys.html` (journey 2; J7's brief); BIO_Publication_v0_1.md §7 (the public side); BIO_Interaction_Constructs_v0_1.md §R (the welcome).
owed: (BOB) the group's self-description held in its copy (kinds from a closed list plus an "other" text, focus, purpose text, visibility members-only or public, history of changes, administrator's act); the public page and network-directory display when chosen, behind the outward-act warning; the welcome and the first-question wizard reading it to order what is offered first; the declared bias offering it as a starting draft. (Design session) the screens and the "Say who your group is" wizard script in step 5.

### DEC-133 · answered
raised: 2026-10-04 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (the design phase's step 3, journeys: question J8, joining through the group's own website, from Bob's direction of 2026-10-04 that requests to join belong to the group's website)
for: bob
question: How a group's own website brings people in: whether Civicsmith gives the website a way to obtain invitation links, with what limits, and whether a group may also post one reusable join link.
why it is Bob's: a new requirement and a security boundary (an outside system admitting members to a group that may face people trying to get inside) (P17).
provisional: invitations are made by an administrator, or a machine credential acting for one, one person at a time; each is a one-time burner link with no expiry (membership R12–R16; Membership v2 §6); Civicsmith has no request-to-join screen for the group (Bob, 2026-10-04).
alternative: (B) the website asks and an administrator approves inside Civicsmith; (C) administrators only.
recommendation: the draft ruling on the journeys page (a website key with limits); the reusable join link left out for now.
reversal cost: low before building; a key or link once issued is switched off at once.
response: **Bob, 2026-10-05**, first his direction: "J8: The workflow I imagine a group's website having are something along these lines... * Anybody can ask to become a member using a form they fill out, which uses a civicsmith API call to create an invite as a link that user can use to join. * A user can apply to join, which sends a request (email?) to an administrator (or somebody else in the organization) who denies the request or uses the same civicsmith API to generate a link that sent to the user." Then, to the draft ruling: **"agree, including adding the reusable join link that an administrator can enable (and use in the webpage) or not."** Ruled: (1) **a website key**: an administrator may create a key with which the group's website asks the group's copy for a one-time invitation link for one person, giving the cover name the group will know them by and, where a person approved them, that person's name as the website reports it; the same call serves Bob's open workflow (immediately) and his apply workflow (after someone in the organisation approves on the website); Civicsmith never learns which, and still has no request-to-join screen; (2) **its limits**: it invites only ordinary members, never an administrator, with the capabilities the administrator chose for it (contribute by default); its links work once and expire after seven days unless the administrator chooses otherwise; it makes at most a daily number of invitations the administrator sets; (3) **seen and stoppable**: every invitation it makes is listed for the administrators, marked "through the website"; an administrator can withdraw an unused invitation and switch the key off at once; (4) the key stays on the website's server, never in the page the public sees; the setup screen says so and shows how (a form service for a website that cannot keep a secret); (5) **Civicsmith sends no email**: the website, or the person who approved, sends the link; (6) **a reusable join link, optional**: an administrator may enable one link the group posts on its webpage (or anywhere), which anyone can use to join, choosing on the join page the name the group will know them by; the same limits apply (ordinary members, the chosen capabilities, the daily cap, every join listed "through the join link"); the administrator can switch it off at once or replace it with a new one, the old one then dead; it is off unless an administrator enables it; (7) creating a website key or enabling the join link shows once: "Anyone your website lets through can join and see your group's shared work, including people you are looking into. Keep sensitive work in hidden projects."
decided: 2026-10-05 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/journeys.html` (J8's draft ruling; journeys 2 and 3); BIO_Membership_Architecture_v2.md §6.
owed: (BOB) the website key (an administrator's act to create, scope, cap and revoke; the call that returns a one-time link for one cover name with an optional approver name; the record "through the website"); invitation expiry (seven days by default, the administrator's choice); withdrawing an unused invitation; the reusable join link (enable, replace, switch off; the join page asking the cover name; each join recorded "through the join link"); the daily cap for both; the warning at creation or enabling; nothing emailed by Civicsmith. (Design session) the administrator's screens for the key and the link, the join page, and the "Invite a member" wizard's website branch, in step 5.

### DEC-134 · answered
raised: 2026-10-04 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (the design phase's step 3, journeys: question J9, whether a group can run with one administrator)
for: bob
question: Whether the two-administrator floor (no ordinary members until two administrators exist; no stepping down at two) stays a gate on a group's own copy, or becomes a recommendation.
why it is Bob's: governance policy and the meaning of Design Requirements 1 and 14 as applied to a group's copy (P17).
provisional: Membership v2 §4.2, §4.3, §4.5; membership R10–R14 (`ADMINS_FIRST`; resignation refused at two; R11's hosting-access record asked when the second administrator is added).
alternative: (B) keep the floor; (C) one administrator plus a recorded recovery contact only.
recommendation: (A) one administrator is enough, with (C)'s recorded hosting-account holder asked at setup.
reversal cost: low before building; once groups run with one administrator, restoring the floor would block them until they add a second.
response: **Bob, 2026-10-05: "J9: as recommended"**, after the brief on the journeys page. Ruled: (1) a group may run with one administrator and invite ordinary members from the start; (2) setup recommends a second administrator once, saying why (so the group is never stuck if one person is away, and no one person holds everything), and never again; (3) setup asks who holds the hosting account and records the answer, so recovery has a named path (R11's record, moved to setup); (4) only the last administrator is stopped from stepping down; (5) adding an administrator once two or more exist still needs every administrator's endorsement, and removing one still needs a vote of the others, unchanged; (6) the setup screen says once that a group with one administrator depends on that person and on the hosting account; (7) Design Requirement 1's "shared among at least two individuals" and Design Requirement 14, applied to a group's own copy, are a recommendation Civicsmith makes, not a gate; the network's own infrastructure is unchanged.
decided: 2026-10-05 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/journeys.html` (J9's brief; journeys 1 and 27); BIO_Membership_Architecture_v2.md §4; BIO_Design_Requirements_v2.md §1 (annotation).
owed: (BOB) membership: `ADMINS_FIRST` removed (R12), so an ordinary member may be invited while one administrator exists (R13); resignation refused only for the last administrator (R10); the hosting-access record asked at setup rather than at the second administrator (R11, instance-setup); the setup's one-time recommendation and its statement of dependence. (Design session) the setup wizard's wording in step 5.

### DEC-135 · answered
raised: 2026-10-05 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (the design phase's step 3, journeys: question J13, journey 16 "A professional lends expertise", found inside J4 when Bob asked which questions were really his)
for: bob
question: Whether a project owner can ask for a check by expertise (a request reaching every member who declared that expertise), rather than having to know and assign a person.
why it is Bob's: a new capability (a new act and a new kind of task) (P17).
provisional: members declare expertise and an administrator may confirm it, which gates nothing (Membership v2 §1.3; membership R21–R24); a task can be assigned to one member (tasks R3); a second member's check on a calculation is recorded and shown (T33-42).
alternative: (B) a roster filter by expertise, the owner then assigning an ordinary task to a person; (C) nothing new.
recommendation: (A) "Ask for a check" by expertise.
reversal cost: low.
response: **Bob, 2026-10-05: "J13: A"**, after the brief on the journeys page. Ruled: (1) a new act, "Ask for a check", by a project owner on a finding (or a calculation, a passage or a determination it rests on), naming an expertise label and optionally a note; (2) the request reaches every member who declared that expertise and can see the thing to be checked, as a To do; it never reaches anyone who cannot see it; (3) the first to take it owns it; the others' To do closes, saying who took it; (4) the checker records a check or a reasoned concern, and the check shows the checker's handle and declared expertise, marked confirmed or self-declared, wherever the finding shows (and on the published case where the checker allows their handle, else as the group); (5) expertise still gates nothing: anyone may check, and the request only addresses; (6) a request no one takes stays open, and the owner sees that no one has taken it and may ask a named member instead.
decided: 2026-10-05 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/journeys.html` (J13's brief; journey 16); BIO_Membership_Architecture_v2.md §1.3; BIO_Interaction_Constructs_v0_1.md §T.
owed: (BOB) the "Ask for a check" act (owner; target; expertise label; note); a task kind for a check request addressed by expertise and sight, taken by the first who accepts; the check record carrying the checker's declared expertise and its confirmation state; the owner's read of an untaken request. (Design session) the act's screen and the check's display in step 5.

### DEC-136 · answered
amended: 2026-10-06 · DEC-149: the court sentence reads "Your group's Civicsmith keeps this from the public…" (Bob's S4: B).
raised: 2026-10-04 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (the design phase's step 3, journeys: question J11, where a member's first words go, widened by Bob to what a court can reach)
for: bob
question: Whether members may keep notes only they can see; and how Civicsmith tells members that a court order the group cannot defeat can expose anything in the group's copy that is not public.
why it is Bob's: doctrine (what the record holds and who sees it) and what members are told about legal risk (P17).
provisional: everything a member writes is shared in the record (observations, hunches); a standing question is the one object private to its author (K1481); nothing in the design tells members what a court can reach (the capability ladders list "the group as defendant or subpoenaed" at L0).
alternative: observations only (no notes); notes kept only on the member's own device; the court-order statement told to every member at joining (the first draft).
recommendation: the redrawn draft on the journeys page.
reversal cost: low (an option, a sentence and a member-private object; nothing built).
response: **Bob, 2026-10-05:** (1) "Everybody needs to understand that groups doing serious work is at risk of a court order that they can't defeat exposing their non-public records. The system is set up to protect members identify (if they so choose), private sources and other information that to that point wasn't public. They need to act accordingly." (2) On the first draft: "Again, some groups are doing "light" work that they don't believe will ever result in a court order of the type we're discussing now. Journalists, lawyers, auditors, and others may enjoy further protections that others do not. So those groups doing "heavy" work that could result in a court order should understand the risks. But I'm not sure that it requires an explicit disclosure in the welcoming sequence. I'd again leave that as an option for the administrator to select." (3) **On the redrawn draft (2026-10-06): "J11: agreed".** Ruled: (1) **the administrator chooses whether members are told**: at setup, and in the group's settings at any time, an administrator reads a short explanation (some work is unlikely ever to draw a court order; journalists, lawyers and auditors may have protections others lack, such as shield laws or privilege; a group doing work that could draw one should make sure its members understand the risk) and chooses "tell our members" or "don't", nothing preselected; when chosen, members are told once at joining and once at the first time they record each kind of non-public thing (a note, an observation, a source's identity, a hidden project, their own ties): "Your group's copy keeps this from the public and the people the group looks into. A court order your group can't defeat could still require it to be shown. Write accordingly."; (2) **always**: what Civicsmith protects, and from whom, is explained one hover away wherever something is marked not public and in the list of terms; Civicsmith never claims more protection than there is ("not public", "only you can see this", never "secret" or "confidential"); it holds as little as it can (no legal names for members, sources' identities in their own narrowest place, home addresses and phone numbers never published); (3) **members may keep their own notes**, seen only by them in the group, never cited, published or counted, turned into an observation, a hunch or a question when they choose; a note says "Only you can see this in your group", with the court sentence the first time where the administrator chose to tell members; (4) journey 6 asks a member to describe the problem in their own words, without urging them to write how they feel.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/journeys.html` (J11; journey 6); design-principles.html (principle 3.11, new); brand-and-voice.html §5 (words avoided); BIO_Interaction_Constructs_v0_1.md §R.
owed: (BOB) the group setting "tell our members what a court can reach" (an administrator's act, nothing preselected, changeable) and the first-time statements it drives; a member's own notes (a member-private object: never cited, published, counted or exported to others; converted by the member's act into an observation, hunch or question; reachable like everything in the copy); the explanation of protection in the list of terms. (Design session) the wording on every "not public" mark and the setup screen in step 5.

### DEC-137 · answered
raised: 2026-10-05 · the UX design session with Bob on his primary account (session_011wdWGoa6RAbZiRU4Bn3Rng, carrying the journeys page drafted by session_01JZtUsAKpStQoiwF6rzqsyJ; the development process also runs on his primary account since K1428) (the design phase's step 3: J3, J4, J6 and J10, which Bob agreed on 2026-10-05 are design detail beneath his rulings, not his to decide)
for: bob-session
question: J3 one action journey or two; J4 the journeys as listed; J6 where members start; J10 whether the page keeps a list of gaps.
why it is Bob's: it is not: Bob asked "How many of these journey questions really belong to me, as opposed to those that you can decide on?" and, shown these four as design detail beneath his earlier rulings (the approved plan page; his rulings of 2026-10-05; his direction after the auditor's forum), did not object; decided by the design session and reported (P17).
provisional: the journeys page draft.
alternative: J3 keep two journeys; J4 any journey changed; J6 a different order of ways in; J10 no gaps list.
recommendation: as stated on the page.
reversal cost: low.
response: **Decided by the design session, 2026-10-06, as recommended:** (J3) the older "acting on a finding" is folded into the plan journey (journey 22), one path from suspicion to outcome, as the approved plan page already works; (J4) the twenty-seven journeys as listed, ten new for Bob's rulings of 2026-10-05, answering J12; (J6) where members start as drawn: problems members live with first, then a person, a payment or contract, and the documents that draw them in; "What brought you here?" on the home; every kind of document handled alike; (J10) section 6, the gaps to close, stays on the page and is carried into each later step until each gap closes or Bob sets it aside.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/journeys.html` (settled 2026-10-06).
owed: nothing to BOB beyond each journey's own owed items in DEC-128 to DEC-136. (Design session) the journeys walked in step 5.
### DEC-138 · answered
amended: 2026-10-06 · DEC-140: the wizard's ring is drawn again whenever the member asks ("Show me where", Alt+Shift+W).
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (the design phase's step 4, the visual language, which Bob asked the session on 2026-10-06 to carry out, deciding everything beneath his rulings and bringing him only what is his)
for: bob-session
question: One visual language for every member screen and the published case, replacing the three conflicting looks (`civicos-ui/tokens.css`, whose source `BIO_Design_Language_v0_2.md` is missing; the action-design sketches; the measures map's placeholder colours): type, colour, shape, motion, light and dark, icons, and the marks (grades, weights, origin, the five gaps and the ordinary states, the queue's To do / Noticed / Status, the hint, the hold strip, the wizard mark), built on the plumb-bob mark, shipped inside the group's copy, WCAG 2.2 AA.
why it is Bob's: it is not: design detail beneath his rulings (the 58 approved principles, DEC-123; brand and voice, DEC-125 to DEC-127; the measures map, DEC-82, whose colours, icons and textures were placeholders "until the visual language"; light and dark, phones and nothing from outside, DEC-122; WCAG 2.2 AA, DEC-99; the marks, DEC-86, DEC-90, DEC-92, DEC-94, DEC-98, DEC-106, DEC-110, DEC-121, DEC-131). Bob, 2026-10-06: "Bring me only the questions that are mine … and decide the rest yourself, recording it and reporting it as done." Decided by the design session and reported (P17); open to his comments on the page.
provisional: `civicos-ui/tokens.css` (the old design language's tokens); `build/plan/action-design/*.html` (the sketches' look; their content and wording stay bound, K608 (4), DEC-113 to DEC-115); `measures-map.html` (placeholder colours).
alternative: keep the old design language's tokens unchanged (no dark theme, no marks for the gaps, origins, queue or wizards; mono for every fact); adopt the action-design sketches' look (a second family of faces loaded from outside; purple for machine work beside the evidence hues); start afresh with a new family.
recommendation: as decided below.
reversal cost: low now (nothing built on it yet); rising once step 5's screens and BOB's builds use it.
response: **Decided by the design session, 2026-10-06:** (1) **Colour always means something.** Verdigris (the patina on a brass plumb bob) is the one colour for acting and for Civicsmith itself; rust is attention only (a clock, a changed source, a refusal, something visible outside the group); one hue per evidence scale, re-chosen to be told apart by people who see colour differently (capture blue, connection plum, testimony ochre, subject match olive); machine work and another group's work carry no hue, told apart by edge (dotted; double rule), mark and word. Working ground is faint green paper, the published case a near-white sheet. (2) **Three voices in type** from one open-licensed family (Source Serif 4, Source Sans 3, Source Code Pro, SIL OFL 1.1), shipped inside the group's copy (Latin, Latin Extended and Vietnamese; about 0.8 MB): serif for words people wrote, sans for Civicsmith's own words, mono only for identifiers a machine checks; 16 px working default and in every field; tabular figures. (3) **Lines before shadows**, 2 px corners on controls, square sheets, no pill; a shadow only on a dialog, a menu and the hold strip. (4) **Still until the member is needed**: 120–200 ms state changes, no bounce; the wizard's ring drawn once; nothing under reduced motion. (5) **Never colour alone**: every colour with a word or icon; 58 colour pairings checked at WCAG 2.2 AA (4.5:1 text, 3:1 marks) in light and dark by `check_contrast.py`. (6) **Light and dark** drawn separately, following the device, with a setting; print and the complete edition always light (DEC-122 G2). (7) **Icons**: one set of 46, a 16-unit grid and one line weight, one meaning each, always beside a word; the wizard mark is a walked path, never a gear. (8) **The marks**, one form each: grades (one shape, the scale's hue and icon, the letter) and strength (two grades and a phrase against the bar); the five gaps (Undetermined: half-filled circle, dashed outline, mandatory "because"; Withheld: a redaction bar; Unrated: an empty grade; Nobody looked: a dotted lens; Refused: a rust rule that teaches); the ordinary states; the origin family (Machine work, Another group's, Not yet evaluated, Accepted by our group, Flagged) as tags and an edge, ours unmarked; recreation status; the queue's three kinds by icon and word; the hint (machine work's dotted tag) and the hunch (the member's, dotted underline); due dates turning rust as they near and "Overdue" said once; changed and in-tension marks; the ladders' hues and textures (solid, striped, dotted, dashed for not yet evaluated); the hold strip; the wizard guide and its ring; a labelled draft's dashed field. (9) **Acts**: every button carries its weight's pips and name; primary acts verdigris whatever their weight; outward acts tagged in rust; friction per DEC-87. (10) **Frames**: working (paper, masthead, standing band), review (the working frame with a rust band naming who outside can read it), imported (another group's band with a double rule), published (the sheet, the group's name large, the credit at the foot); the path-to-publication marker. (11) The wordmark: "Civicsmith" in the sans at semibold beside the plumb bob, one colour; a group's logo at most 24 px beside its name. The measures map's rules are unchanged; its specimens are redrawn in this look when next republished.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/visual-language.html` (published at https://claude.ai/artifact/QuvX7DzX7XbxS6SQG4MtT1); `docs/development/ux-substrate/visual-language/` (the source); `BIO_Interaction_Constructs_v0_1.md` §V (new).
owed: (BOB) when the new member screens are built: `docs/development/ux-substrate/visual-language/civicsmith.css`, `faces.css`, `fonts/` (with their OFL licences) and `icons.svg` replace `civicos-ui/tokens.css` as the screens' one stylesheet, served from the group's copy, never from outside (principle 9.6); `check_contrast.py` runs whenever a colour changes (placement of the files and the check is BOB's). (Design session) step 5's layouts and key screens drawn in it; the measures map's specimens redrawn.

### DEC-139 · answered
amended: 2026-10-06 · DEC-148: the library approved by Bob (S2); DEC-147 adds the ceremony's set-time step.
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (the design phase's step 5, layouts and key screens, which Bob asked the session on 2026-10-06 to carry out, every wizard written and walked through the mockups and every journey also drawn for a member without the assistant)
for: bob-session
question: The design detail of step 5: the frames, grid and phone and desktop layouts; the assistant panel; the screens the journeys walk; the screen registry and the Civicsmith wizard library in the form `wizard-scripts` sets; the rules of the product without the assistant (K1547 left that path to design, B44).
why it is Bob's: it is not, except two items asked separately on the layouts page: S1 (releasing a case at a set time, a new capability) and S2 (approving the Civicsmith library, his by DEC-121 (1)). The rest is detail beneath his rulings (the principles; brand and voice; the journeys, DEC-128 to DEC-137; wizards, DEC-120, DEC-121, DEC-130; phones, DEC-122; the approved plan page and the bound start-and-send and filing sketches, K608 (4), DEC-113 to DEC-115; K1547). Bob, 2026-10-06: "decide the rest yourself, recording it and reporting it as done." Decided by the design session and reported (P17).
provisional: journeys.html (the journeys and wizard outlines); `build/plan/action-design/` (the bound sketches); `wizard-scripts` R13's empty screen registry and library.
alternative: draw only key screens without data (pictures BOB cannot build the library from); leave the no-assistant path to the development process.
recommendation: as decided below.
reversal cost: low (design files; nothing built on them yet).
response: **Decided by the design session, 2026-10-06:** (1) **The working frame**: masthead with the group's name, a standing band (working; shared for review; another group's case), a seven-place rail (Home, Queue, Find, Add, Projects, People, Settings), one column of work, the dock on the right for the assistant panel or a wizard's guide; on a phone, five tabs (Home, Queue, Add, Find, More) and the dock as a sheet above them. Setup, invitations and the doorbell use a plain frame; the published case its own. (2) **Acts sit under what they act on**, each carrying its weight; every mockup button carries its op and weight. (3) **Home** opens with "What brought you here?" and five front doors, a problem first. (4) **The wizard guide** docks where the assistant does, says step, what and why, rings the real control once, and returns from a side trip to the step left. (5) **The screen registry**: 42 screens and their 192 acts (`screens/registry.json`); every act is an op the requirements declare (111), a requirement function whose op is declared by its lowercased name (69), or owed by a named ruling (12). (6) **The Civicsmith library written**: 17 scripts, 105 steps, three required, in `wizard-scripts` R1/R2 form (`screens/library.json`), with no place, law or venue in their words (K1); drafts only from the group's own templates; checked by `screens/check_library.py` and walked by `screens/check_walk.mjs` (393 steps, every control found; every screen draws exactly its registered acts). Ships only on Bob's approval (S2). (7) **Without the assistant**: absent, not greyed; "Ask" becomes "Find and count"; drafts from the group's templates; a standing question still runs and its new matches reach the queue once, as a list, unread by any machine; wizards the same; what such a member cannot do each has a member's own way. (8) The approved plan page and the bound start-and-send flow drawn as approved, in the visual language (DEC-138).
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (published at https://claude.ai/artifact/WE1RL6GUUZX4dLeSzbFrbv); `docs/development/ux-substrate/screens/`; `BIO_Interaction_Constructs_v0_1.md` §P (the library written) and §R (the rules without the assistant).
owed: (BOB) the screen registry as the registry `wizard-scripts` R13 registers, declaring the ops of its 69 requirement functions by their lowercased names; the Civicsmith library as its data file once Bob approves it (S2); `wizard-scripts` R2 gains an optional `via` (a side trip into another wizard, returning to the step left); `answers` (the standing question) runs for a member with no account of their own, its new matches reaching the queue once as a list, unread. (Design session) S1 and S2 brought to Bob; the screens revised for his comments.

### DEC-140 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the visual-language page, rule 4, "Still until the member is needed")
for: bob-session
question: Bob, 2026-10-06: "What do you think about a gesture or key of some kind that a user can use to say, "Hey, I missed that indicator of what you want me to do. Do it again.""
why it is Bob's: it is not: design detail beneath principle 7.2 (motion only when action is needed) and DEC-120/DEC-121 (the wizard points, the member presses), suggested by Bob and decided by the design session (P17).
provisional: DEC-138 rule 4 (the one movement: a wizard's ring drawn once onto the control its step names).
alternative: no replay (the ring stays on the control for the whole step, so a member can scroll to it); a replay by gesture only.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06, at Bob's suggestion:** the wizard guide carries **"Show me where"** on every step that names a control, with the keyboard shortcut **Alt+Shift+W** (changeable in the member's settings; a modified key, so WCAG 2.2's character-key rule is met). Asking scrolls the control into view, draws the ring again, and moves the keyboard focus to it, so a screen-reader user hears the control named; it works as often as the member asks. On a phone the button sits in the guide's sheet. Under reduced motion the ring is not animated: the control is scrolled to and focused, and the ring stays as drawn. Member-initiated movement is consistent with principle 7.2. DEC-138 rule 4 and DEC-139's guide read accordingly.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `visual-language.html` (rule 4, motion, the wizard marks); `layouts.html` (the guide, live in every walked step); `visual-language/components.css` (`.cs-target.again`, `.cs-kbd`).
owed: (BOB) when the wizard runner is built (the interface's, wizard-scripts "It runs no wizard"): the guide's "Show me where" and its shortcut, as drawn. Nothing in a requirement changes.

### DEC-141 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (BOB's B49, asking the design stream for the screen decisions beneath Bob's ruling K1618)
for: bob-session
question: How the screens carry K1618 (Bob, 2026-10-06, through BOB): a document captured for one member's question and set aside by another is never silent; the reviewer sees the question and asker; a set-aside a question waits on takes a reason; the asker sees it as a wait on the question, not a notification; either may restore with a reason; no veto or quorum.
why it is Bob's: the policy is, and is already ruled (K1618, cited, not ruled again); the screens beneath it are design detail, decided by the design session (P17), as B49 asks.
provisional: capture R77 (the held list), R79 (set aside), R81 (restore); capture-requests R8, R10 (the request's target and principal); DEC-97, DEC-98, DEC-94; principle 3.10.
alternative: a queue item for the asker (refused by K1618 and DEC-94); the asker's name withheld from the reviewer.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06, beneath K1618:** (1) **Context for the reviewer:** each row of the held-captures list, and the set-aside act, shows "for <asker>'s question “<title>”"; a question the viewer may not see is withheld whole: "Captured for a question you may not see", no title, no asker, no count (principle 3.10). (2) **A reason when it matters:** setting aside a document an open question waits on opens the reason field in place (reasoned), headed "<Asker>'s question is waiting for <document>. Your reason is kept on the record and shown to <asker> on their question."; in a batch set-aside, each such document's waiting question is listed and the one reason applies to each. (3) **The asker sees it on the question:** a wait line in DEC-98's form at the head of the question, under its strength: "Waiting: the 2024 budget PDF was set aside by Ben: “wrong year”", with the date; the project's list of questions shows the same wait mark; no queue item, no notification (DEC-94). (4) **Disagreement stays visible:** beside the wait, "Restore it, with a reason" (R81) and "Find another source" (search, or the Get a record wizard); each set-aside and restore stays in the question's history, in order, with its reason; no veto, quorum or count. Drawn on the held-captures and question screens of layouts.html.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `BIO_Intake_Doctrine_v1_1.md` (after DEC-97's held-captures list); `layouts.html` (held captures; question); `screens/registry.src.py` (question gains `heldrestore` and `search`).
owed: (BOB, N587) capture R77 and R79 answer, per held document, the question it was captured for and its asker (from capture-requests R8, R10) when the viewer may see the question, else that it is withheld; R79 requires a reason when an open question waits on the document and records the question; inquiry gains the wait "a document it waits on was set aside", read on the question and its project's list, never raised as a queue item; R81's restore records its reason in the same history.

### DEC-142 · answered
amended: 2026-10-06 · DEC-143: the expunge's button shows the Irreversible weight.
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (BOB's B51, from AFFORDANCES #20, K1686)
for: bob-session
question: Should `personexpunge` (people R12: removes a person's recorded value; cannot be undone), graded reasoned by affordances R27, be a named exception that opens the full dialog stating its consequence, as DEC-113 made of `actionholdrelease`?
why it is Bob's: it is not: Bob already ruled that an act whose effect cannot be taken back opens the full dialog stating that effect, whatever its rung, and that the rung's name stays honest (DEC-88; principle 4.4). Applying that rule to one act is design detail, decided by the design session (P17).
provisional: affordances R27 (reasoned, from the owner's NO_REASON); DEC-113 (the hold release's consequence statement).
alternative: a reason field in place only (the reasoned rung's ordinary friction).
recommendation: as BOB recommends: yes, DEC-113's tier.
reversal cost: low.
response: **Decided by the design session, 2026-10-06, applying DEC-88:** an expunge opens the full dialog, as DEC-113's hold release does. It states what value is removed and from where (the person's page, every question that cited it, every export); that it cannot be undone, by the member or anyone; that a marker stays in its place ("Removed where the law requires, <date>, by <member>"); and that published cases change only through the docket. The member confirms with a reason naming the law or order that requires it ("Remove it for good, with this reason"). The rung stays as affordances grades it (reasoned), its name honest; the button shows it. Drawn on the person screen of layouts.html; the screen registry now names the op `personexpunge`.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `BIO_Interaction_Constructs_v0_1.md` §F; `layouts.html` (person); `screens/registry.src.py`.
owed: (BOB) affordances: `personexpunge` a named exception beside DEC-113's `actionholdrelease`, with its consequence statement as above; the screen registry's person screen names `personexpunge` (was the function `expunge`).

### DEC-143 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the layouts page, the installer's short-name button)
for: bob-session
question: Bob, 2026-10-06: "The group's short name isn't just reasoned - it's irreversable."
why it is Bob's: it is not: the weight a button shows is design detail beneath DEC-87 (every act's button carries its weight) and DEC-88 (friction follows consequence in the world, the name kept honest); Bob's comment corrects a mockup, decided by the design session (P17).
provisional: DEC-139's mockups (the short name shown as reasoned); DEC-142 (the expunge's rung kept as affordances grades it, reasoned).
alternative: keep showing the rung affordances assigns.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06, on Bob's comment:** an act that can never be undone shows the **Irreversible** weight (five pips) on its button, whatever rung it is otherwise given, so the button tells the member the truth. Two such acts lie outside the publication ceremony: the installer's choice of the group's short name (in every address and beside every signature, never changed without starting a new copy) and `personexpunge` (DEC-142). Neither is a publication, so each opens the full dialog stating that it is permanent, in place of the ceremony; DEC-87's rule that publishing goes only through the ceremony is unchanged. DEC-142 amended.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `layouts.html` (install; person); `visual-language.html` (acts); `BIO_Interaction_Constructs_v0_1.md` §F.
owed: (BOB) affordances shows `personexpunge`'s weight as irreversible (with DEC-142's consequence dialog); the installer's short-name step carries the irreversible weight and its permanence statement (installer, instance-setup).

### DEC-144 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (BOB's B55)
for: bob-session
question: DEC-136 (3), members' own notes: may a member revise or delete their own note? (BOB worded hypotheses R11–R15, K1751, with neither.)
why it is Bob's: it is not: detail beneath DEC-136, whose second point (Civicsmith holds as little as it can) answers it; decided by the design session (P17), as BOB recommends.
provisional: hypotheses R11–R15 (write, read by its owner, turn).
alternative: notes kept as written (no revise, no delete).
recommendation: allow both.
reversal cost: low.
response: **Decided by the design session, 2026-10-06, beneath DEC-136:** a member may **revise** their own note in place (it is theirs, never part of the record; no history is kept) and **delete** it for good, leaving no marker. Only the note's own member can do either; turning a note into an observation, hunch or question does not delete it (the member may then delete it). Drawn on the notes screen of layouts.html ("Revise", "Delete" beside each kept note).
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `BIO_Interaction_Constructs_v0_1.md` §R; `layouts.html` (notes); the screen registry (`owed:noterevise`, `owed:notedelete`).
owed: (BOB) hypotheses gains a member's own revise and delete of their note (no history, no marker; only its member); the registry's owed acts take the ops BOB names.

### DEC-145 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (BOB's B54: the words owed by Bob's rulings on policies and standards, K1713, K1722–K1724, K1727, K1739, K1740)
for: bob-session
question: The words members see for a provision's force; a benchmark beside a binding standard; "cited, not seen" and "not found"; a policy kept from the public by its source; a silent change noticed; a standard's access; a use of discretion with its reason; with care for "policy" (already the group's own, DEC-54) and "practice" (two meanings). And the journeys page's claim that policies are built.
why it is Bob's: it is not: member words beneath his rulings, as DEC-131's were; decided by the design session (P17) and open to his comment on the brand page.
provisional: Capability Ladders §6B POLICIES, §6C STANDARDS (tranche/T34); journeys.html §6 and journey 6.
alternative: the canon's terms as written (requirement, recommendation, permission, mandatory, discretionary, benchmark, cited-not-seen, not-found).
recommendation: as decided below.
reversal cost: low (words held in one place, DEC-99).
response: **Decided by the design session, 2026-10-06:** (1) **Force**, always beside the document's own words: "Requires", "Recommends", "Allows"; for a policy, "Required" or "At the discretion of <office>", with "criteria stated" or "no criteria stated". (2) **Binding or not:** "Standard · binds <body>" beside "Benchmark · not binding on <body>"; a finding against a benchmark says "slower than", "below", never "violated" or "nonconforming" (K1723). (3) **"Cited, not seen"** (who cited it, and where) and **"Looked for, not found"** (the searches made), each beside but never borrowing the look of "Nobody looked" (DEC-86). (4) **A policy kept from the public** (K1740): "Not public", with whose it is to release; never "confidential" (principle 3.11's words). (5) **A silent change** (K1727): a Noticed item, "Changed without notice: the text differs from the copy captured on <date>, and no amendment was announced". (6) **Access** (K1739): "Free to read", "Reading room only", "Behind a paywall". (7) **Discretion** (K1713): "Discretion used by <office>, <date>", with "stated reason: …" or "no reason stated"; patterns across uses are "a pattern in how discretion is used". (8) **"Policy"** always carries its owner ("Public Works policy", "the hauler's policy"); the group's own is "our group's policy". **"Practice"** is not used in Civicsmith's own words: "what the office does", or the pattern above. (9) journeys.html corrected: laws and codes are held section by section (built); policies and standards as kinds of their own are ruled and planned for a later stage.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `brand-and-voice.html` §5 (Use, Avoid); `journeys.html` (journey 6; §6's code row).
owed: (BOB) these words as the member-facing labels of §6B and §6C's constructs when they are built (T35); the queue's Noticed wording for a silent change.

### DEC-146 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the layouts page's installer, on "Free software for civic groups": "'and other organizations'? What's the right description here?")
for: bob-session
question: The one line that says what Civicsmith is, on the installer and on the page "Made with Civicsmith" links to; "civic groups" leaves out newsrooms, professional associations and a public office checking its own work, all of whom DEC-128 names.
why it is Bob's: it is not: words beneath his ruling on who Civicsmith is for (DEC-128, amended for newsrooms); decided by the design session (P17) and open to his comment.
provisional: "Free software for civic groups" (brand-and-voice.html §2's credit; the installer mockup).
alternative: "civic groups and other organisations" (names no one, and "organisations" reads as firms); a list of kinds alone (names who, not what for); "groups that hold government to account" (takes a side, and misfits an office checking itself).
recommendation: as decided below.
reversal cost: low (one line, held in one place, DEC-99).
response: **Decided by the design session, 2026-10-06:** (1) Civicsmith is described by what a group does with it, not by what kind of group it is: **"Free software for groups that check whether government keeps its own rules and promises."** "Rules and promises" covers what journey 6 calls the standards government set itself (an ordinance, a policy, a budget promise, a contract term, a service target); "check" stays neutral on policy and fits a public office auditing itself (DEC-128). (2) Where there is room for a second line, it names who: **"Neighbourhood and issue groups, newsrooms, professional associations, and public offices checking their own work."** (3) The line is used on the installer, on the page the "Made with Civicsmith" credit links to, and wherever Civicsmith says in one line what it is; never "civic groups" alone, never "and other organisations".
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `brand-and-voice.html` §2 (the credit); the layouts page's installer (`screens/mock-screens.js`); BIO_Interaction_Constructs_v0_1.md §L (brand and voice).
owed: (BOB) the line as the installer's and the credit page's description when they are built (installer, public-read).

### DEC-147 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (the layouts page's question S1; the gap "publishing at a set time" in journeys.html §6, from DEC-128's amendment for newsrooms)
for: bob
question: May a group sign a case now and have it published later, at a time it sets, so a newsroom's case goes public when the story citing it runs?
why it is Bob's: a new capability, and it changes when publishing happens (today the moment an owner signs; DEC-19, DEC-80) (P17).
provisional: a case is public when its owner signs; an embargoed advance copy is a review copy that never leaves the group's Civicsmith (Publication §6A); signing needs a laptop or desktop (DEC-122).
alternative: A, keep publishing at signing (a newsroom publishes early or someone is at a laptop at the hour); C, sign beforehand and release with one tap on a phone at the hour (someone must still act; widens what a phone may do beyond DEC-122).
recommendation: B.
reversal cost: medium (a new waiting state of a signed edition, its check and its notices).
response: **Bob, 2026-10-06: "S1: B".** Ruled: (1) the publication ceremony's last step offers "Publish now" or "Publish at…" a date and local time the owner sets; (2) the signed edition waits in the group's Civicsmith, not public, and is shown as "Signed · publishes <date, time>" on the case and in the owner's queue; (3) at that time Civicsmith checks again, as at signing; if anything changed since signing (a source the case rests on, a publishing member's confirmation of no undeclared tie, a hold), it does not publish and tells the owner once; (4) until then the owner can cancel or move the time; (5) when it goes public the owner's queue says so once, and the public page shows when the edition was signed and when it was published. **Design session's details (P17), Bob may change any:** the time is the group's local time (civil-time); the set time is weighted Irreversible like publishing itself.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (the Publication ceremony screen and wizard; section 7); `journeys.html` (journey 15, the ceremony wizard, §6); BIO_Interaction_Constructs_v0_1.md §A.
owed: (BOB) a requirement for publication (the scheduled edition: its state, the check at the set time, cancel and move, the two dates on the public page) and its queue items; the op the ceremony's set-time act names (`owed:publishat` in the screen registry).

### DEC-148 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (the layouts page's question S2)
for: bob
question: Whether the seventeen wizard scripts of DEC-139 are the first Civicsmith library.
why it is Bob's: the library Civicsmith ships with every release is approved by Bob; groups add their own but cannot change it (DEC-121 (1)) (P17).
provisional: the scripts as data (`docs/development/ux-substrate/screens/library.json`), walked through the mockups (DEC-139).
alternative: approve some and send the rest back.
recommendation: approve, the welcome wizard as a first version.
reversal cost: low (a script is revised as a new version, wizard-scripts R1).
response: **Bob, 2026-10-06: "S2: approved".** The seventeen scripts as they stand on 6 October, including the day's changes from his comments (the group's two names, the one-time password saved and where it comes from, publishing at a set time, DEC-147), are the first Civicsmith library; the three required ones are Set up and claim, Welcome a new member and the Publication ceremony; the welcome wizard is approved as a first version, its final words revised once the new screens are in use (DEC-91).
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `screens/library.json` (its note); `layouts.html` section 7; BIO_Interaction_Constructs_v0_1.md §P.
owed: (BOB) the library as the Civicsmith library wizard-scripts ships (origin `civicsmith`), with its owed acts declared as ops (the screen registry's `owed:` lines).

### DEC-149 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comments on the layouts page: "Is 'copy' the right word to use when referring to a group's instance?"; question S4)
for: bob
question: What members and founders call one group's own Civicsmith (an instance), in place of "your group's copy".
why it is Bob's: the word is in the voice standard he approved (DEC-125, brand-and-voice §2.2) and in a sentence he approved word for word (DEC-136's court notice).
provisional: "your group's copy (of Civicsmith)" (DEC-124, DEC-109, brand-and-voice §2.2).
alternative: A, keep "copy" (it also means a review copy and, to a newsroom, a story's text); C, "workspace" (sounds hosted by a company; already names the working screens); D, "installation", "server" or "instance" (technical).
recommendation: B, "your group's Civicsmith".
reversal cost: low (words held in one place, DEC-99).
response: **Bob, 2026-10-06: "S4: B".** Ruled: members and founders say **"your group's Civicsmith"** (as people say "our Slack"); "installation" only where the hosting is the subject (the installer, who holds the hosting account); never "copy", "instance", "plane" or "server" for it. "Copy" keeps only its other meanings: a review copy, a copy of a document. Where "Civicsmith" could mean the software or one group's installation, the sentence is reworded. DEC-136's court sentence reads: "Your group's Civicsmith keeps this from the public and the people the group looks into. A court order your group can't defeat could still require it to be shown. Write accordingly."
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; brand-and-voice.html §2.2 and §5; every design page and the screens, wizards and registry in `docs/development/ux-substrate/`; BIO_Interaction_Constructs_v0_1.md §L.
owed: (BOB) every member-facing string that says "copy" for the group's Civicsmith, in the requirements and the code (instance-setup's claim page, installer's last screen, membership's and credentials' messages, the court sentence of DEC-136's owed setting); the term entry: "Your group's Civicsmith: Civicsmith installed in a Cloudflare account your group controls. Your group's records are held there and nowhere else."

### DEC-150 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the layouts page's setup screen, "Offices and seats, filled in for you")
for: bob
question: What a group whose place Civicsmith holds no rules for meets at setup, where the offices and seats would be filled in, and whether it is told when its place arrives.
why it is Bob's: a new thing Civicsmith does (recording a place it does not hold and telling administrators when an update brings it) (P17); Bob directed it.
provisional: instance-setup R12–R15 (the places are chosen among held profiles, none preselected; choosing none is allowed and stated); officesseed fills offices only from a held place.
alternative: an empty list with no explanation; asking for the place outside the group (S5's C, an outward act).
recommendation: as Bob directed.
reversal cost: low.
response: **Bob, 2026-10-06:** "If the user just specified a unique place civicsmith doesn't know anything about, then this list of offices and seats won't be populated yet. So there should be some fallback text that explains that and tells the new administrator that they'll received a notification once the system has this information for them to select from." Ruled as he directs. **Design session's details (P17), Bob may change any:** (1) under Places, a group whose place is not listed may name it (free text, optional), kept in its own Civicsmith, seen by administrators, never sent anywhere; (2) the offices section then says nothing is filled in because Civicsmith does not hold that place yet, and offers adding the group's offices itself (`entitycreate`), each marked as added by the group; (3) when an update brings a place matching the name, administrators are told once in their queue (Status) and can choose it under Places; offices the group added stay. Whether a group may write its own place's rules is S5, still with Bob.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (the setup screen; S5); `journeys.html` (journey 1).
owed: (BOB) instance-setup: the named place (an administrator's act, held locally, never exported to the network) and the queue item when an installed update brings a held profile covering it; the op behind the registry's `owed:placewanted DEC-150`.

### DEC-151 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (the layouts page's question S5, from Bob's comment "They can type in a different location, right?")
for: bob
question: May a group outside the places Civicsmith ships rules for write its own place's rules?
why it is Bob's: a new capability, and it decides who may write the rules a group's due dates rest on (P17).
provisional: places are chosen among held, researched profiles only (instance-setup R12–R15; jurisdictions R1, R44); choosing none is allowed; DEC-150 lets a group name its place and be told when an update brings it.
alternative: B, a group writes its own place's rules now; C, a group asks the makers for its place (an outward act).
recommendation: A for this release; B as the next requirement once a group outside Oakland asks.
reversal cost: low (A changes nothing built).
response: **Bob, 2026-10-06: "S5: A for now, but the B capabilities should be recorded as something to be done after the first public release goes out."** Ruled: (1) **now**: only the places Civicsmith ships, researched with their sources; a group elsewhere chooses none, names its place and is told when an update brings it (DEC-150); (2) **after the first public release**: a group may write its own place's rules inside its own Civicsmith (its records and open-meeting laws and their deadlines, holidays, office hours and time zone, offices, where records are published), each with its source, marked as the group's own research and never as Civicsmith's, serving only that group, and offerable later for a release.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (section 7, S5); `journeys.html` §6 (the gap list).
owed: (BOB) (2) recorded as work for after the first public release, wherever BOB keeps such work, to be worded as a requirement then; nothing for the release now.

### DEC-152 · answered
amended: 2026-10-06 · DEC-153: the same help wherever members write in their own words.
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the layouts page's "Who your group is" screen)
for: bob
question: Whether an administrator may ask the assistant to help write the group's focus and reasons for existing (DEC-132), which the group gives in its own words.
why it is Bob's: what the assistant may do (P17); Bob directed it.
provisional: the assistant drafts only translations (DEC-127) and the drafts wizard-scripts R13 lists; DEC-132 asks for the group's own words; K1364: a draft is labelled until the member keeps it.
alternative: no assistant help on this screen.
recommendation: as Bob directed.
reversal cost: low.
response: **Bob, 2026-10-06:** "Can the administrator use the assistant to help compose the text asked for on this screen? I hope so." Ruled as he directs. **Design session's details (P17), Bob may change any:** where a member reaches the assistant, "Who your group is" offers "Ask the assistant to help write this"; it asks the administrator a few questions, then drafts the focus and the reasons into their fields, each labelled "Draft · the assistant's, asked by <handle>"; nothing is saved until the administrator edits and keeps it, and once kept the words are the group's (K1364); without the assistant the screen is unchanged. It runs on the account that serves the administrator (K1755) and within its daily limit.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (the "Who your group is" screen).
owed: (BOB) the assistant's draft for the group's description (an op behind the registry's `owed:groupdescriptiondraft DEC-152`, a machine draft per wizard-scripts R13 and the assistant's roles), labelled and kept only by the administrator's act.

### DEC-153 · answered
amended: 2026-10-06 · K1841 (Bob, through the development process, on K1837's two points), folded by the design session `session_01NWPmrrYZbbF8Wkrvp5Y2vx`: (1) never in a field stating a member's reason for an act (the Roles canon's rule 1), so detail (1) drops "a reason" and the held list's "Why set it aside?" loses the help; (2) with the member's suggestions switch off the help works only from what the member typed, with it on it may also draw on what the group holds (rule 7), which narrows detail (2). The refused acts in (4) are the assistant's refusals (affordances R7) and every signed or irreversible act, including publishing at a set time (B69).
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (the design session's question on the layouts page, after DEC-152: "should the same help be offered wherever someone writes in their own words (a records request, an observation, a case's statement)? It would never apply where the assistant is refused: concluding, signing, publishing.")
for: bob
question: Whether the assistant's help with writing (DEC-152) is offered wherever members write in their own words.
why it is Bob's: what the assistant may do (P17).
provisional: DEC-152 (the group's description only); translations (DEC-127); the drafts wizard-scripts R13 lists.
alternative: only on "Who your group is".
recommendation: everywhere members write in their own words, never on an act the assistant is refused.
reversal cost: low.
response: **Bob, 2026-10-06: "Yes, offer it wherever members write in their own words".** Ruled, within the limits of the question he answered: never where the assistant is refused (concluding, signing, publishing). **Design session's details (P17), Bob may change any:** (1) wherever a field takes a member's own words (a note, an observation, a request, a case's scope, what changed; never a reason, K1841), "Help me write this" sits under it when the assistant is reachable for that member (K1755); (2) the help works only from what the member tells it and what the group holds, and never adds a fact; for a firsthand observation it only helps word what the member saw (testimony stays the witness's); (3) its words arrive in the field labelled "Draft · the assistant's, asked by <handle>"; nothing is saved until the member edits and keeps them (K1364), and kept words are the member's; (4) never on an act the assistant is refused or an irreversible one: vouching (release), concluding and withdrawing or reopening a conclusion, signing (caseratify), publishing, the expunge, the installer's short name; not where a labelled draft already fills the field; the group's own description keeps its guided draft (DEC-152); (5) without the assistant nothing appears.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (section 2; the notes, capture, held and case-editor screens); `screens/mock-kit.js` (the rule as code: `writeHelp`); BIO_Interaction_Constructs_v0_1.md §P.
owed: (BOB) the assistant's writing help as an act (the op behind the registry's `owed:writinghelp DEC-153`): a machine draft into a member's own-words field, labelled, kept only by the member's act, refused on the acts named in (4), the facts it may use limited as in (2); the assistant's roles amended to allow it.

### DEC-154 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment while reviewing the layouts page)
for: bob
question: Whether every screen shows its own name and where it sits, in the same place.
why it is Bob's: UX (P17); Bob directed it.
provisional: some screens carried breadcrumbs, others none; headings named the thing shown, not the screen.
alternative: headings only.
recommendation: as Bob directed.
reversal cost: low.
response: **Bob, 2026-10-06:** "I'm noticing that screens don't show their names. For example, 'The roster' doesn't say the roster. I think it would be orientating for users to see a screen name in the same place on every screen. Indeed, I think that every screen should show it's 'path' (People>Roster)." Ruled as he directs. **Design session's details (P17), Bob may change any:** (1) every screen, in every frame (working, setup, public, published), opens its main area with its path, at the same place: from the rail's section (or, outside the workspace, the group's name or "Civicsmith") to the screen's own name, always last, in the ink colour and semibold, marked as the current page; earlier steps are links; (2) the heading below names the thing shown (a question's words, a person's name), so the path names the screen and the heading the thing; (3) the group's own members stay under Settings ("Settings › Members"), because "People" names the people the record is about, never the group's members (brand and voice §5); (4) a phone shows the same path above the heading.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (every screen); `screens/mock-shell.js` (`PATH`, `pathNav`); BIO_Interaction_Constructs_v0_1.md §V.
owed: (BOB) the path on every member screen and public page when the screens are built (each screen's path as in `screens/mock-shell.js` `PATH`).

### DEC-155 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the layouts page's rail)
for: bob-session
question: The rail's width.
why it is Bob's: it is not: layout beneath his direction; decided by the design session (P17) on his comment.
provisional: a fixed rail of 232px (DEC-138's shell, `--rail`).
alternative: a fixed narrower rail; a collapse toggle only.
recommendation: as decided below.
reversal cost: low.
response: **Bob, 2026-10-06:** "The width of the rail should adjustable, and the default should be set to include enough whitespace but not eat up precious screen real estate." **Decided by the design session:** (1) the rail is 184px by default, room for every section's name, its count and whitespace; (2) each member sets its width, kept for them on that device: drag its edge, or focus the edge (a separator, named "Width of the sections list") and use the arrow keys in 16px steps; double-click or Home resets it; (3) from 64px to 320px; narrower than 120px it becomes icons only, each section named on hover and focus, and its counts hidden; (4) phones keep the tab bar, unchanged.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/visual-language/components.css` and `tokens.head.css` (`--rail`, `.cs-grip`, `.rail-icons`); `layouts.html`; BIO_Interaction_Constructs_v0_1.md §V.
owed: (BOB) the rail's width as a per-member, per-device setting when the shell is built (held on the device, never in the record).

### DEC-156 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the connect screen: "It's completely unrealistic to ask a nontechnical member to open a terminal window! How do we fix this?"; question S6 on the layouts page)
for: bob
question: How a member connects their own Claude subscription without a command line.
why it is Bob's: how Civicsmith is built and its relation to Anthropic's terms (P17).
provisional: the member runs `claude setup-token` on their own computer and pastes the token (K1547, K1755; AT-22).
alternative: A, keep the command line with plain steps; B, ask Anthropic first (the open points of U-7, answerable by Anthropic, AT-25); C, build the hosted sign-in without asking.
recommendation: B (ask Anthropic first).
reversal cost: medium.
response: **Bob, 2026-10-06:** "S6: build the process that includes a link to the Claude page a member can use to authorize civicsmith to use of their CC account. I assume that this process will produce a token that the user can paste into a field in the civicsmith screen." And: "The questions you have about using this process relate to your not being certain that it will work. You're not concerned that asking a user to do this is in some way open to abuse or misuse. Once you add this process to real civicsmith screens I'll use the process to authorize my CC subscription to be used by my member account." Ruled: Civicsmith offers a member a link to Anthropic's sign-in page, where the member authorizes the use of their own Claude subscription; the page gives the member something to paste into a field on the Civicsmith screen, which connects the subscription to that member's account. **Design session's details (P17), Bob may change any:** the connect screen offers the subscription first ("sign in on Anthropic's page"), then an API key, then skip; four plain steps (open Anthropic's sign-in page in a new tab; sign in and approve; copy the code Anthropic's page shows; paste it and connect); the field is labelled "The code from Anthropic's page"; Civicsmith never sees the member's Claude password; it serves only that member and can be disconnected at any time; Pro or Max, and Workers Paid. **Recorded beside the ruling (K1762 (2), (3)):** what the page gives the member is, per Anthropic's own documentation, a login code entered at the hosted Claude Code's prompt (AT-26), not the one-year token `claude setup-token` prints (AT-22); and the four points the terms leave open (U-7 (a)–(d): taking the code in a Civicsmith field and passing it on, AT-17; a Civicsmith button starting Claude sign-in, AT-16 and AT-18; the binary's stored sign-in in the group's container, AT-17; who agrees to the Commercial Terms, AT-14) remain open: Bob's decision is to build, not a reading that the terms allow it.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (the connect screen and its wizard; S6); `journeys.html` (journey 4, the wizard card, §6); U81 (the register entries AT-26, AT-27, U-7).
owed: (BOB) the subscription sign-in: the group's hosted, unmodified Claude Code's own sign-in started for the member (AT-14), Anthropic's sign-in address given to the member to open in their own browser, the code they paste delivered to that sign-in, the member's subscription then serving only that member (K1547, K1755); the op behind the registry's `owed:subscriptionsignin DEC-156`; the register's U-7 kept open; and Anthropic's Commercial Terms condition on running Claude Code in a product (AT-14), whoever must agree to it. Bob will use it to connect his own subscription to his member account once it is in real screens.

### DEC-157 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the layouts page's Translations screen: "Is any member able to provide translations? I have some concerns about this being open to abuse. What are the proper limits and proper process to have?"; question S7)
for: bob
question: The limits and process for a group translating Civicsmith's words, and how local words are handled.
why it is Bob's: who may change what other members read (policy, P17).
provisional: DEC-127 (5): administrators or members given the grant; the assistant drafts; a member who knows the language checks and adopts each word, shown at once to every member reading that language.
alternative: A, as DEC-127; C, administrators only.
recommendation: B, as below.
reversal cost: low.
response: **Bob, 2026-10-06:** first "S7: If the/a administrator has assistant capabilities, couldn't the first cut of a translation be done by the assistant? In that case, the task left to an administrator or member who speaks the language would be reduced to identifying any errors. But another situation that may need to be dealt with is the translation of local words."; then, to the redrawn S7, **"S7: as you've just described"**. Ruled: (1) an administrator gives the grant to named members for a named language; (2) where the translator can reach the assistant, it drafts every missing word ("Draft · the assistant's"); a granted speaker reads each against the English and keeps or corrects it; without the assistant, the granted member types them; (3) ordinary words show once kept; (4) protected words (the fixed terms, the weights, every warning and dialog before an outward, signed or irreversible act, the court notice, every "who can see this" notice): kept as the assistant drafted them, they show once one speaker keeps them; changed from the draft, or typed without one, they show only after a second granted speaker confirms them, or an administrator confirms them after reading the assistant's translation of them back into English; until then members see the English; (5) every adopted word records who adopted it, when and what it replaced, and an administrator can undo it in one act; the English is one hover away for every word; any member can mark a word "this translation looks wrong", listed for the granted members and administrators; (6) local words: official names of offices, laws, programs and places stay as they are, with an explanation in the member's language beside them on first use and on hover; where the place publishes an official translation of a name, it is used with its source, held with the place's researched rules and arriving with releases; what goes to an office (a request, a letter, a filing) goes in the office's language, with a labelled translation beside it for the member; the group's own local words are its to translate as ordinary words.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (the Translations screen and wizard; S7); `journeys.html` (the wizard card); `brand-and-voice.html` (V4); BIO_Interaction_Constructs_v0_1.md §L.
owed: (BOB) the translation layer's grant per language and member; the protected-word set and its second check (a second granted speaker, or an administrator with the assistant's back-translation); the record of each adopted word with one-act undo; members' "looks wrong" marks; local names held with their explanations and official translations in the place's rules (jurisdictions), never translated as ordinary words; outward communications in the office's language with a labelled translation for the member; the ops behind the registry's `owed:translationgrant`, `owed:translationconfirm` and `owed:translationrevert DEC-157`.

### DEC-158 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comment on the layouts page's Wizards screen: "Can/does it make sense for an existing wizard to be duplicated and modified?")
for: bob-session
question: Whether a group may copy a wizard, its own or Civicsmith's, and change the copy.
why it is Bob's: it is not: design detail beneath DEC-121 (groups add their own wizards and cannot change Civicsmith's) and wizard-scripts R3 (a draft `from` an approved version the author may see, "a derivative"); decided by the design session (P17) and reported.
provisional: wizard-scripts R3's `from`; DEC-121 (1), (9); DEC-148.
alternative: no copying (a group re-records from nothing).
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06:** (1) yes: on the Wizards screen, "Copy a wizard to change it" starts a draft from any approved wizard the member may see, Civicsmith's or the group's; (2) the copy is the group's own wizard (`origin: group`), a draft until approved like any wizard the group writes, under the same editor grant and checks; (3) the original is unchanged and still offered; a required Civicsmith wizard stays the required one, and a group's copy never replaces it; (4) the copy shows what it is based on ("based on Civicsmith's 'Get a record'"); when the original gets a newer approved version, the group's wizard editors are told once and can see what changed and bring it across.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (the Wizards screen).
owed: (BOB) confirm that R3's derivative of a Civicsmith script creates a new script with `origin: group` (never a version of the Civicsmith script), recording what it was based on; a notice to the group's wizard editors when the base gets a newer approved version.

### DEC-159 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob, 2026-10-06: "when going through the screens, I'm not seeing any mouseovers or other elements that support members and increase information density.")
for: bob-session
question: How the screens carry the explanations Bob's rulings already require (DEC-129 rule 4: explained where it appears, and findable again; DEC-82: every grade and bar step opens its meaning on hover, focus or tap, and a strength's hover names its weakest leg), which the mockups had not drawn.
why it is Bob's: it is not: carrying out his rulings; decided by the design session (P17) and reported.
provisional: the measures map (DEC-82); the wide path (DEC-129); the visual language's marks (DEC-138).
alternative: a help page only; printed explanations under every mark (loses density).
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06:** (1) every mark explains itself on hover, keyboard focus or tap: grades (the scale, what A and D mean, "a grade never says whether something is true"), strengths (the weakest-thing rule, and the weakest part here with what would raise it), the five gaps, origin tags, the queue's kinds, due dates, hints and hunches, the outward tag, each button's weight, and each step of the path and the ladders; (2) names of people, offices and documents carry a dotted underline and open a card (who or what, where it came from, how much the group holds about it); (3) one explanation at a time, beside the thing and never over it, closed by Escape or moving away, announced to screen readers as the element's description; (4) the visual language gains the tip and the card (`.cs-tip`, `.cs-card`); (5) the mockups carry it on every screen (438 marks across 42, each with its text, checked).
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `visual-language/components.css` and `visual-language.html` §6a; `layouts.html` (every screen, and its "Explained where it appears" section); BIO_Interaction_Constructs_v0_1.md §V.
owed: (BOB) the explanations as interface words (held with the translation layer, DEC-127, DEC-157), the tip and card on every member screen when built, and each card's facts from the record (an office's holder today, a person's position and source, a document's capture and citations).

### DEC-160 · answered
amended: 2026-10-06 · Bob: "far more elements should be mouseovers and clickovers … Look EVERYWHERE in all screens. Make smart decisions about what the user will benefit from if we properly increase the info density using invisible and appropriately lightweight elements". Every screen swept: references attach anywhere in a screen's text, every occurrence, including section headings (the queue's project names); things named on many screens share one card (`GLOBAL_REFS`); each screen's own references, with why each matters there, are in `screens/mock-refs.js` (287 entries); about 425 on the 42 screens, each attaching, each opening a real screen, checked.
amended: 2026-10-06 · Bob: "What I'm suggesting is that a lot of references be hoverable. Hover over the name of a document, content, connection, etc, see a summary and it's importance to the context of that screen. Click on it and the member to taken to it." Every card now carries what the item is and a "Here:" line saying why it matters on that screen; references declared per screen (`screens/mock-shell.js` `REFS`). A hint opens in place: what was matched (each item a link), how it was found, how far to trust it (its measured false-alarm rate), what it is not, and its acts (open a question, dismiss with a reason, stop this kind for the project).
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's comments on the layouts page's queue: "Can the user click here to see the document or citation, as appropriate?" on "the 2024 lease amendment"; "Can the member go to the demand document by clicking here?" on "Demand to rescind")
for: bob-session
question: Whether everything the record holds that a screen names can be opened from where it is named.
why it is Bob's: it is not: navigation beneath his rulings (DEC-82's "a click on a grade opens that scale's ladder"; DEC-159's cards); decided by the design session (P17) and reported.
provisional: names drawn as plain text in the mockups.
alternative: links only on detail screens.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06:** (1) anything the record holds that a screen names (a document, a cited passage, a person, an office, an action and what it sent, a filing, a money item, an event, a question, a case) is a link: a click opens it where it is shown, a cited passage opening its document at that passage and a superseded version opening both versions side by side; (2) its card (DEC-159) shows on hover or focus first, so a member can see what it is without leaving; (3) links are underlined in the action colour, distinct from the dotted underline of a name that only opens a card; (4) on the public page the same holds for what the case discloses, a citation opening the evidence layer.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (the queue, the timeline, the exploration chain, the question's citation; `screens/mock-kit.js` `ref`).
owed: (BOB) every reference on a member screen and the public page as a link to the item it names (with the passage or version where one is meant), with its card.

### DEC-161 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob, 2026-10-06, on the explanations of DEC-159 and DEC-160)
for: bob
question: How long an explanation waits before it appears on hover, and how it closes.
why it is Bob's: he set it: "I suggest we start with a 1/2 second delay, but if you can find best practices that give us a proven value then we can start there."
provisional: the mockups showed explanations at once on hover.
alternative: Nielsen Norman Group's lower bound, 0.3 s.
recommendation: 0.5 s, the upper end of Nielsen Norman Group's range, matching Bob's suggestion.
reversal cost: low (one value).
response: **Bob, 2026-10-06:** "Properly done, mouseovers cost nothing visually. One aspect of a mouseover that must be set properly is the delay between when the mouse is over the element and when the mouseover appears. Too short (as they are now in your screens document, and the user is left feeling that they even move the mouse around on the screen without one mouseover after another popping up. Not cool. I suggest we start with a 1/2 second delay, but if you can find best practices that give us a proven value then we can start there." Ruled as he suggests; the proven range agrees. **Evidence:** Nielsen Norman Group, "Timing Guidelines for Exposing Hidden Content" (https://www.nngroup.com/articles/timing-exposing-content): on hover, wait 0.3–0.5 s, show if the cursor stays, and keep the content until the cursor has left the target and the content for longer than 0.5 s; W3C, Understanding WCAG 2.2 SC 1.4.13 Content on Hover or Focus (https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus): such content is dismissible, hoverable and persistent. **Design session's details (P17), Bob may change any:** (1) on hover an explanation or card shows only after the pointer has rested 0.5 s on the thing; (2) it stays while the pointer is on the thing or on the explanation itself; (3) it closes 0.5 s after the pointer has left both; (4) keyboard focus and a tap show it at once; (5) Escape closes it; (6) one at a time.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `visual-language/components.css` and `visual-language.html` §6a; `layouts.html` (the viewer's explanations).
owed: (BOB) the timings and the three WCAG 1.4.13 conditions in the shell's explanation behaviour when the screens are built.

### DEC-162 · answered
amended: 2026-10-07 · DEC-175 (Bob, "S16: as recommended"): the lighter level makes guidance wait 1.5 s instead of hiding it.
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob's suggestion: "Maybe every element should have a 'information level'. Level 1s are always active, but those in other levels only when the user has selected an information level that includes them. The information level could be set in the member's settings, but maybe there's also a shortcut key, context menu option, or tag in the heading that they can use to easily switch info levels. Just brainstorming."; question S8)
for: bob
question: Whether explanations come in levels a member chooses, and how many.
why it is Bob's: how Civicsmith teaches (UX) and a new member setting (P17).
provisional: DEC-159 to DEC-161 (every mark and name explains itself after a 0.5 s rest); screen headings and rail entries gained guidance on 6 October.
alternative: A, no levels; C, three levels adding "Teach me" (explanations in place, without hovering).
recommendation: B.
reversal cost: low.
response: **Bob, 2026-10-06: "S8: B".** Ruled: (1) two levels: **Marks and names**, always on (every mark's meaning, every reference's card); **Guidance**, adding what each screen, section and rail entry is and what a member can do there; (2) a new member starts with guidance on; after their first month Civicsmith asks once whether to keep it; (3) a member switches with a control in the masthead showing the current level (one click), with Alt+Shift+I, or in Settings › Your account › Explanations; (4) a third level ("Teach me") may be added later if newcomers ask.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (the masthead control, the account setting, the viewer's switch; section 7, S8); `screens/mock-refs.js` (`SCREEN_HELP`, `RAIL_HELP`, level 2).
owed: (BOB) the member's explanation level (a per-member setting, default Guidance, the one-month question); the masthead control and Alt+Shift+I; each element's level (marks and references 1, screen, section and rail guidance 2); the guidance texts as interface words (translation layer, DEC-157); the op behind the registry's `owed:infolevelset DEC-162`.

### DEC-163 · answered
amended: 2026-10-07 · DEC-174 (Bob's direction): every act's button explains itself, at the guidance level; the exception for a button's label is withdrawn.
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01SEmEip2dMnNBFgsXF9Tids; the development process also runs on his primary account since K1428) (Bob: "why doesn't, for example, a mouseover of 'Lakeshore Tenants' show? … go through EVERY type of element, every context, and ask 'Why shouldn't there be a mouseover and/or clickover for this?'")
for: bob-session
question: Which types of element explain themselves or open something, at which information level (DEC-162), and why the rest do not.
why it is Bob's: it is not: carrying out his direction and DEC-159 to DEC-162; decided by the design session (P17) and reported.
provisional: explanations and references only in a screen's main area.
alternative: everything explains itself (no reasons for exceptions).
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06**, element type by element type, the table on the layouts page ("Explained where it appears"): yes, at marks-and-names level, for the group's name (masthead and public page head, opening "Who your group is"), the queue count and the member's initial (opening their screens), the band, the path's steps (links with their cards), named things in any text, shared names, every mark and a button's weight pips, the public page's signature and credit; yes, at guidance level, for search, the assistant button and the guidance switch, the rail and phone tabs, the screen heading, row icons (what kind of thing), wizard marks and the steps of a set-up or ceremony; no, with the reason stated, for labelling section headings (the content is beneath), a button's label (label and pips say it; heavy acts open a dialog), field labels (help printed beneath), list options (browsers cannot), plain dates and counts (deadlines and data counts are already marks or names), the words of quotations and members' own words (evidence stays untouched; names in them still get cards), and the assistant panel and wizard guide (they are explanations). On the 42 screens, 1,663 elements explain themselves.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` ("Explained where it appears"); `screens/mock-shell.js` (`decorate`).
owed: (BOB) the shell's elements as listed, at their levels, when the screens are built; the exceptions kept as stated.

### DEC-164 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process also runs on his primary account since K1428) (Bob, 6 October: "Where in the UX does a member create content or ask for content to be identified in a document, set of documents, project, and so on?")
for: bob-session
question: Where a member asks for content to be found in a document, a set of documents or a project, and how a result becomes content.
why it is Bob's: it is not: design detail beneath K1468 (extraction is targeted, at a member's request, tied to a basis or claim), K1627 (the machine proposes, a member accepts) and the assistant's roles (rules 3 and 4); decided by the design session (P17) and reported.
provisional: creating spread across the type screens, by hand; finding through Find (search, hold together, see where nobody looked), Ask or Find and count, standing questions and hints; no single find on a document, a held set or a project.
alternative: a find on each type screen separately (people on Person, figures on Money trail), which scatters one need over six screens.
recommendation: as decided below.
reversal cost: low (one owed act; every recording act already exists).
response: **Decided by the design session, 2026-10-06.** (1) One control, "Find in this", the same on a document (Document), on the documents a member holds together (Find's hold strip, "Find in these") and on a project ("Find in this project"); its screen's "Look in" shows the scope, set by where it was opened. (2) The member picks what to find: people and offices the group already follows (by their held names), money figures, dates and deadlines, requirements (what someone shall or must do), events in minutes and agendas (the doctype readers' catalogue), a name or term. (3) Each result shows its words as written and its passage, labelled "Found by search" (a new origin mark, neutral, beside machine work and accepted); a table's date or amount columns are one result naming the table, counted through a calculation and never read in row by row (K1468); a kind with no result says "Nothing here" (DEC-98). (4) Finding records nothing. A result becomes content only by the act that already makes that kind of content, from that passage, by a member, at that act's weight: "Add a fact from this passage" (a person fact), "Record a dated fact", "Read into a money fact", "Hold this as a standard", "Cite in the question", "Declare the table"; a result already recorded shows who recorded it. (5) An optional "For which question" is kept with what is recorded from there, so others see why it was looked for (K1468's basis or claim). (6) "Keep finding this as documents arrive" is a standing question over the scope; new matches reach the queue once, as a list. (7) A name the group does not follow yet is found only as a word; the member adds the person from the passage. (8) The assistant's proposals of people, events and money figures that search cannot match are drawn as later ("Not in the first release"): switched on once measured (the capability ladders' extract rung), at a member's request for a question they name, labelled machine work, graded no higher than the method earns, accepted only by a member's act. (9) Walked in journeys 6 (on a document) and 10 (on a project); drawn with and without the assistant.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` ("Making content, and finding it in what you hold"; the screen "Find in this"); `screens/mock-screens.js` (`SCR['find-in']`); `BIO_Interaction_Constructs_v0_1.md` §S.
owed: (BOB) the act behind the registry's `owed:findin DEC-164`: a find over a scope (a capture, a selection or enumerated set, a project's holdings, within the viewer's gate) by kind, returning each match with its extent and nothing recorded; `op=search` has no scope today and no recogniser for amounts, dates or requirement words in free text, so those matchers are new, deterministic, and held per language (DEC-99); names through `readingname` (entities R17); events through the doctype readers. A standing question over the same scope. Each recording act accepting the found extent as its citation (people R9, events R1, money R2, standards, `cite`), with the optional question kept beside it. The "Found by search" origin mark (`components.css`).

### DEC-165 · answered
amended: 2026-10-06 · DEC-166 (Bob, "S9: B"): counts by country for refused and blocked requests; never a member's own address.
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process also runs on his primary account since K1428) (Bob's direction through the development process, K1875: "Perhaps there should be a screen admins can go to to see a map of some kind indicating the level of 'attack' the instance experiences during a selectable quantum of time"; K1874 (Q5): notices only when risk is heightened; B74 hands the drawing to the design stream)
for: bob-session
question: How the administrators' security screen and its notice are drawn.
why it is Bob's: it is not, except where marked: design detail beneath K1875 and K1874; decided by the design session (P17) and reported. Whether the screen may show where attempts come from is Bob's (who may see what) and is open as S9 on the layouts page.
provisional: no screen; the security review proposed a daily count, which Bob declined (K1874).
alternative: a geographic map of sources (held for S9).
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06.** (1) Settings › Security, seen only by administrators. (2) A period: the last hour, 24 hours, 7 days, 30 days, or set dates. (3) The level in a word, Ordinary, Raised or High, against the group's own usual (its median for the same hour over the four weeks before), with one plain sentence saying what happened and whether anything got through; Raised means well above the usual at some point and nothing got through; High means still going on, or something unusual got through. A new mark (`cs-risk`): rust outline for Raised, filled for High, a word always. (4) A grid of kinds by hour (by six hours or a day for longer periods): refused sign-ins; refused keys and links (an expired invitation, a wrong website key, a revoked agent credential); requests turned away for coming too fast; requests Cloudflare blocked, where the plan reports it; refused hand-overs at the doorbell. Each square names its count and the usual on hover, focus or tap; four steps (at or below the usual, up to 5 times, 5 to 50, over 50), the last textured as well as coloured (`cs-heat`). (5) Totals: the period's count, the usual, the busiest hour. (6) Counts only: nothing names who tried or where from (S9 open). (7) Administrators are told in their queue once, as "Noticed", when the level becomes high, and not again while it lasts; the notice opens the screen at that period (K1874). (8) What a member or administrator can do is named with links: change a password, turn off the join link or the group's key, tighten Cloudflare's settings in the hosting account.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (screen "Security"; section 6; S9 in section 7); `screens/mock-screens.js` (`SCR.security`); `visual-language/components.css` (`cs-risk`, `cs-heat`); `BIO_Interaction_Constructs_v0_1.md` §R.
owed: (BOB, N703) the act behind `owed:securitymap K1875`: counts by kind and hour for a period, the group's usual, the level and its threshold, kept as counts only (no address, no handle) unless S9 rules otherwise; records of refused sign-ins and refused credentials (security review F9); Cloudflare's blocked-request counts where the plan supplies them (the study, K1875); the administrators' notice, once per episode, only when the level is high.

### DEC-166 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process also runs on his primary account since K1428) (S9 on the layouts page, after DEC-165)
for: bob
question: Whether the administrators' security screen may show where attempts come from.
why it is Bob's: who may see what: the record that places an attacker would also place the group's members.
provisional: DEC-165, counts only.
alternative: A, counts only; C, addresses and the handles tried, kept 30 days.
recommendation: B, countries for refused and blocked requests, addresses never kept, a member's own sign-in never placed.
reversal cost: low (counts by country can be dropped; nothing personal is kept).
response: **Bob, 2026-10-06: "S9: B - but never the member's own address".** Ruled: (1) refused and blocked requests are counted by country, per hour, and shown for the chosen period as a ranked list with bars (the "where from" of the security screen), with the words "A country is not proof of who is behind an attempt"; (2) no request's address is ever kept or shown, a member's least of all: a member's address and anything derived from it (country, network) never appear on the screen or in a record; (3) so a refused sign-in for a member's handle that the member follows within an hour with their own successful sign-in is counted without a place, and a member's successful sign-ins are never counted by place; (4) countries come from Cloudflare's own label for the request, read and counted at once, the address discarded. Bob's words "never the member's own address" are read as covering both the member's network address and the whereabouts it reveals; he may narrow or widen that.
decided: 2026-10-06 · Bob
reasoning recorded in: this entry; S9 on `docs/development/ux-substrate/layouts.html`; `screens/mock-screens.js` (`SCR.security`, "Where from"); `BIO_Interaction_Constructs_v0_1.md` §R.
owed: (BOB, N703) counts by country and hour for refused and blocked requests, from Cloudflare's country label, the address never stored; the one-hour rule that keeps a member's own refused sign-in followed by their sign-in from being placed; a member's successful sign-ins never counted by place.

### DEC-167 · answered
raised: 2026-10-06 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process also runs on his primary account since K1428) (B72: K1852's surfaces, "the archive's listing with each file's state (filed, or not filed and why), and files held for review beside their archive")
for: bob-session
question: How a captured archive and its files are shown to members.
why it is Bob's: it is not: design detail beneath K1852 (Bob, "as recommended") and Intake §3 and §4; decided by the design session (P17) and reported.
provisional: no surface for archives; the held list shows single captures.
alternative: list an archive's files only on the held list, mixed with other captures (loses which archive each came from and why some were not filed).
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-06.** (1) A captured archive has its own screen (Add › Held captures › the archive), with its grade and fingerprint, its entry count and size. (2) A summary line of what was found when it opened on capture: filed and held for review beside it, already held, not filed, folders. (3) Every entry listed with its state: filed and held for review, with the archive's capture grade (never stronger, never weaker); already held (the same bytes captured directly, kept as a second sighting, one home); a folder, listed; two entries sharing a name, each filed by its number; or not filed, with the reason named in plain words (locked by a password; over the limit for one file, with what to do instead; and the other refusals the development process names). (4) Names, folders and dates exactly as the archive states them, in the face for identifiers, never used as a place to write. (5) Members pick files and vouch for them or set them aside with one reason (the held list's acts); a filter shows only those not filed. (6) "A higher grade for one file" says a file earns one only by its own capture, landing beside the first; nothing is regraded. (7) An archive that cannot be opened unambiguously is refused whole, says why in one sentence, stays captured as it arrived, and can still show what it lists. (8) Held captures shows the archive as one row with its files waiting beside it; Add says a ZIP is opened as it is captured.
decided: 2026-10-06 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (screen "Archive"; section 6); `screens/mock-screens.js` (`SCR.archive`); `BIO_Interaction_Constructs_v0_1.md` §S.
owed: (BOB, N688) the read behind `owed:archivelist K1852`: an archive's entries with each one's state and, when not filed, the refusal by name, in member words held for translation; the held list grouping an archive's files beside it; vouching and setting aside across an archive's picked files (the existing acts).

### DEC-168 · answered
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process runs on his secondary account since K1891) (the four questions of meaning in the development process's study of security tools, `build/plan/study-security-tools-N710.md` §8 Q1–Q4 on tranche/T35, open since K1932; brought to Bob here at his offer as S10–S13)
for: bob
question: Under K1929 (3) (no file to a service that shares submitted samples): (S10) a vendor that keeps malicious samples for its own research without passing them on; (S11) a service that shares by default but has a private mode; (S12) whether the rule covers web addresses; (S13) what happens when an address check says a site is bad.
why it is Bob's: who may see what, and what the record must do (P17); the development process's own questions of meaning.
provisional: such services held in the study's "hold" column; address checks undecided; acquisition's answer to a bad reputation undecided.
alternative: S10 refuse both vendors; S11 refuse any default-sharing service; S12 addresses are public, any check; S13 refuse the fetch, or ask each time.
recommendation: S10 allow, keeping stated; S11 allow in forced, checked private mode except ANY.RUN; S12 yes; S13 capture as high risk.
reversal cost: low.
response: **Bob, 2026-10-07: "S10: as recommended / S11: as recommended / S12: as recommended / S13: as recommended".** Ruled: (S10) a service that keeps files it judges malicious for its own research, passing them to no one (Sophos Intelix, Palo Alto WildFire), may be added; its keeping is stated plainly before an administrator turns it on, and the administrator confirms it. (S11) A service that shares by default is offered only in its private mode, which the adapter turns on and verifies on every call; when it cannot confirm private mode, nothing is sent. Not offered where the vendor's own terms say submissions are not confidential unless stated (ANY.RUN). (S12) K1929 (3) covers web addresses: an address check never sends the full address to a new party; only checks that send a hash prefix, or Cloudflare's own lookup (the group's host already carries its traffic). (S13) On a bad-reputation answer the document is still captured, graded high risk (file-safety's threat), opens only in the safe view, carries the check's answer as a note, and the member is told.
decided: 2026-10-07 · Bob
reasoning recorded in: this entry; S10–S13 on `docs/development/ux-substrate/layouts.html`; Settings › Security in `screens/mock-screens.js`; `BIO_Interaction_Constructs_v0_1.md` §R.
owed: (BOB, N710) the catalogue as ruled: Sophos Intelix and WildFire from "hold" to the catalogue with their keeping stated and confirmed; MetaDefender Cloud and Falcon in forced private mode, verified per call, refused when unconfirmed; ANY.RUN not offered; web reputation by hash prefix or Cloudflare's lookup only (Google Web Risk's Update API, not Lookup); acquisition captures a bad-reputation address into the high-risk grade with the answer noted (file-safety R6 gains a reason, e.g. `bad_reputation`), and the member told.

### DEC-169 · answered
amended: 2026-10-07 · K1949 (Bob, "as recommended", B80), folded by the design session: added outside tools run only when a member asks (a deeper check), except a tool on the organization's own servers, which may check every file; the deeper check runs every outside tool added and needs one clean verdict from an engine other than ClamAV; only a hold found by ClamAV alone is released by a second, different engine, an outside engine's finding by two members; a tool whose vendor does not state its sample sharing is not offered; the safe view opens without a deeper check. Drawn in "Opening a file" (the held state now an outside engine's finding) and Security tools ("When it runs").
amended: 2026-10-07 · DEC-173 (Bob, "S15: as recommended"): a high-risk original may be opened after warnings, without a deeper check, unless a scanner flagged it.
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process runs on his secondary account since K1891) (K1929: "the screens are the design stream's"; the virus package's later users name "the warning before opening, the safe view's label and its one click to the original")
for: bob-session
question: How a member meets a file's risk, the safe view, the deeper check and a scan hold, and how an administrator adds security tools.
why it is Bob's: it is not: design detail beneath K1888, K1890, K1892, K1895, K1913, K1928, K1929 and DEC-168; decided by the design session (P17) and reported.
provisional: no screens.
alternative: warnings as dialogs on every open (more friction for low-risk files, which are most).
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-07.** (1) "Opening a file" states the risk in a word, Low risk or High risk (the `cs-risk` mark), with its reasons in one plain line (handed in, not fetched; contains a macro; from an archive not fetched by the group; …). (2) Low risk: "Open the original"; the checks listed as notes (tool, engine, version, date); a line that it is checked weekly and before first opening. (3) High risk: "Read the safe view" first; the safe view labelled "Derived · a safe copy of the original" with the rule that citations point at the original; "Ask for a deeper check"; "Open the original" appears only once a deeper check passes (a member cannot do it before, so it is not shown, principle 1.4), and opens it to any member for 24 hours. (4) Held after a finding: "Held" (filled), the finding's name and date; the one notice to members who can see the file, naming no one; the safe view (a spreadsheet's figures as data); the notes; release by a reason from each of two members, or by a second, different scanner's clean check with the file read whole; "the machine never can". (5) "Who opens which file is never recorded" is said where a member opens one. (6) Settings › Security › Security tools: the built-in scanner and safe view, each added tool with what it is sent, who receives it, how long it keeps files, whether it shares; Add a tool shows the same as a table, a confirmation where a vendor keeps files (DEC-168 S10), a test with a harmless test file, then Turn it on; the services not offered and why; address checks and bad sites as DEC-168 S12, S13; counts only to a log service. (7) Setup: an optional step for the organization's own tools, "or later in Settings › Security". (8) Add: a site known for malware is still captured, as high risk.
decided: 2026-10-07 · the design session (P17)
reasoning recorded in: this entry; `docs/development/ux-substrate/layouts.html` (screens "Opening a file", "Security", "Set up", "Add"; section 6); `screens/mock-screens.js`; `BIO_Interaction_Constructs_v0_1.md` §R.
owed: (BOB, N706, N707, N710) the ops behind `owed:openoriginal K1888`, `owed:safeview K1888`, `owed:deepercheck K1888`, `owed:releasescanhold K1892` (file-safety R8, R11, R13, R17) and `owed:securitytooladd`, `owed:securitytooltest`, `owed:securitytoolremove K1929` (N710's provider registry and its data-handling statement); the reasons of file-safety R6 in member words held for translation; `originalState` driving whether "Open the original" is drawn; the installer's optional security-tools step. A scanner finding is explained where it appears (Bob's comment, 7 October): its name is a card splitting it into parts (the file kind, the kind of threat, the scanner's variant label), and a "What this is" panel says in plain words what that kind of threat does and that scanners report resemblance, not certainty; owed: a table of finding kinds (downloader, dropper, trojan, macro, exploit, phishing, potentially unwanted, heuristic or suspicious, and others), each with plain words held for translation, and "Civicsmith has no plain description of this name" when none matches.

### DEC-170 · answered
amended: 2026-10-08 · DEC-181: every act the Irreversible weight marks (not only `personexpunge`) is read on a phone and done on a larger screen.
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process runs on his secondary account since K1891) (B79, BOB's question on K1943: does `personexpunge` belong in the larger-screen set?)
for: bob-session
question: Whether removing a fact where the law requires it (`personexpunge`) is offered on a phone.
why it is Bob's: it is not: design detail beneath DEC-122 (signing, publishing and sending finish on a larger screen), DEC-142 and DEC-143; decided by the design session (P17) and reported.
provisional: BOB's default, not in the larger-screen set.
alternative: offered on a phone, its dialog carrying the weight.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-07.** Yes: `personexpunge` is not offered on a phone. It is graded Irreversible (DEC-143), and affordances R36 already gives every act of that rung `phone: false`, as DEC-122 puts signing, publishing and sending on a larger screen; no entry in `LARGER_SCREEN_ACTS` is needed while its rung is irreversible (add one only if its rung is ever graded otherwise). The reason is the act's, not the dialog's: it cannot be undone by anyone, it cites a court order or law the member should read beside the fact it removes, and an order's deadline is days, not minutes. On a phone the dialog can be read, with "finish on a larger screen"; nothing refuses by device.
decided: 2026-10-07 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (the person screen's dialog).
owed: (BOB) `personexpunge` carries `phone: false` (by its Irreversible rung under affordances R36).

### DEC-171 · answered
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process runs on his secondary account since K1891) (Bob's comment on the layouts page, 7 October: "I wonder if the title of this panel should be reduced to simply 'The assistant'")
for: bob-session
question: The name of the settings screen where a member connects the assistant (the registry's `connect`).
why it is Bob's: member words; Bob's suggestion, taken by the design session (P17).
provisional: "The assistant and your account".
alternative: keep the longer name.
recommendation: "The assistant".
reversal cost: low.
response: **Taken, 2026-10-07: Settings › The assistant.** The heading, the path (DEC-154) and the registry's screen name read "The assistant". The screen still says whose account serves the member (their own, the group's key, or none). The docked panel keeps its own label, "The assistant", beside the work; the path tells the two apart (Settings › The assistant is the settings screen).
decided: 2026-10-07 · the design session, on Bob's suggestion
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.connect`), `mock-shell.js` (`PATH`), `registry.src.py`.
owed: (BOB) the screen's name as an interface word: "The assistant" under Settings.

### DEC-172 · answered
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process runs on his secondary account since K1891) (Bob's comments on the layouts page, 7 October, on Settings › The assistant: "Why does this situation offer no opportunity for a member choosing to add assistant capabilities using their own account?" and, on the states "a group using only its own key" and "a group without the assistant", "These configurations ... don't allow the user to add their own account. Perhaps they should."; S14 revised, draft B)
for: bob
question: Whether a group may stop its members from connecting their own Claude account.
why it is Bob's: who may send the group's material where (P17); it changes K1757's wording of K1755 (setup's four-way choice).
provisional: K1757: setup offers the group's key, members' own accounts, both, or none; under "the group's key" or "none" a member cannot connect their own.
alternative: A, members may always connect their own, no exception; the first S14 options (keep the administrators' four-way choice and explain it).
recommendation: B, members may always connect their own unless the group keeps its material away from AI.
reversal cost: low (a setting and its wording; nothing recorded changes).
response: **Bob, 2026-10-07: "I agree that a group should be able to keep their information away from AIs. But in those situations when administrators have asked for that, that should be explained to members."** Ruled as draft B: (1) a member may always connect their own Claude subscription or API key, which serves only them, whatever the group pays for; (2) the group's settings are two separate choices: whether the group pays (its API key, nothing preselected), and "keep our material away from AI", off by default; (3) an administrator turns it on only with a reason; while it is on, no assistant may be used in the group, the group's key or a member's own; (4) every member is told, on Settings › The assistant, that the group keeps its material away from AI, who turned it on and when, and the reason in the administrator's words, with "if you think this should change, ask an administrator"; (5) "the group's key only" no longer exists; a group that does not pay lets members bring their own; (6) everything else works without the assistant, as before (K1547).
decided: 2026-10-07 · Bob
reasoning recorded in: this entry; S14 on `docs/development/ux-substrate/layouts.html`; `screens/mock-screens.js` (setup, Members, Settings › The assistant); the setup wizard's step (`library.src.py`); `BIO_Interaction_Constructs_v0_1.md` §R.
owed: (BOB) instance-setup R59 restated: setup offers whether the group pays (its key) and the keep-away setting, separately, nothing preselected; the act behind `owed:aikeepaway DEC-172` (on with a required reason, off, by an active administrator; recorded with who and when); account resolution (agent-model `accountFor`, ai-runs, agent-worker) refusing every account, the group's and members' own, while keep-away is on, by a named refusal carrying the reason; a member's own account always accepted otherwise (credentials, admission); the reason, who and when readable by every member; the AI-only acts and drafts absent while it is on, as for a member reached by no account.

### DEC-173 · answered
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process runs on his secondary account since K1891) (Bob's comment on "Opening a file", 7 October: "Should there be an opportunity for members to open a file labeled as high risk without a deeper check (with the proper warnings they must accept)?"; S15)
for: bob
question: Whether a member may open a high-risk original without a passing deeper check, after warnings.
why it is Bob's: it changes his ruling K1888 (3) ("the original needs a fresh deep check before a member may override") and what a member may open.
provisional: K1888 (3), K1949 (Q6): the original only after a deeper check with a clean engine other than ClamAV; a group with no outside scanner can never open a high-risk original.
alternative: A, keep the ruling; C, only when an administrator opens that one file up, with a recorded reason.
recommendation: B.
reversal cost: low.
response: **Bob, 2026-10-07: "S15: as recommended".** Ruled (B): (1) for a high-risk file no scanner has flagged (no scan hold) and that the built-in scanner checked within `RESCAN_INTERVAL_MS` (a week), a member may open the original without a deeper check; (2) first the screen states why the file is high risk (its reasons, in member words) and what opening it risks (the file on their device, their device's protections and their sign-in to the group), and the member confirms "I will open it on my own device, not a shared one" and "I will not enable macros or editing"; (3) never for a file under a scan hold, which still needs its release (K1949 (Q7)); (4) who opened it, and who confirmed, is not recorded (K1892); (5) a passing deeper check still opens the original for every member for 24 hours.
decided: 2026-10-07 · Bob
reasoning recorded in: this entry; S15 on `docs/development/ux-substrate/layouts.html`; "Opening a file" in `screens/mock-screens.js`; `BIO_Interaction_Constructs_v0_1.md` §R.
owed: (BOB, with N707) file-safety R8's `override` gains a warned path: `openOriginal` with the member's two confirmations opens a high-risk original when no scan hold applies and a ClamAV `clean` note is newer than `RESCAN_INTERVAL_MS`, refused otherwise by name (`SCAN_HOLD`, `NOT_SCANNED`, a stale-check refusal); `originalState` says which path is open; the act behind `owed:openwithwarning DEC-173`; no record of who opened or confirmed (R10).

### DEC-174 · answered
amended: 2026-10-07 by the design session, on Bob's comment ("mouseovers of buttons that describe what Reasoned or Reversible means, but say nothing about what the button will actually do"): (2) is replaced. A button has one explanation wherever the pointer rests on it: what the act does always first, its weight after in lighter type; resting on the weight dots shows it at a mark's pace (DEC-175). Where an act's general explanation would be vague in context, the button says what it does there ("Searches every document in Sewer fund transfers for where the $310,000 overhead charge went…"). NOTICE U117.
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process runs on his secondary account since K1891) (Bob, 7 October, on the Document screen's buttons: "Noticing the lack of explanation for these actions provides us with the opportunity to go through all such actions in all screens to add those mouseovers that should be there to help members understand what the action would do and how it fits into the larger context.")
for: bob-session
question: Whether every act's button explains itself, and what it says.
why it is Bob's: it is not: carrying out his direction and DEC-162; it withdraws the design session's own exception in DEC-163; decided by the design session (P17) and reported.
provisional: DEC-163: a button's label and pips explain it; heavy acts open a dialog.
alternative: explain only heavy acts.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-07, on Bob's direction.** (1) Every act's button, on every screen, explains itself on hover, focus or tap, at the guidance level (DEC-162): its name, then what the act does and how it fits the larger work (what it leads to or rests on, who sees it, whether it can be undone), in one or two plain sentences. (2) The pips keep their own explanation of the act's weight; an act that sends, signs or cannot be undone still opens its dialog. (3) One explanation per act, the same wherever the act appears (207 acts; 277 buttons on the 46 screens); held in `screens/mock-acts.js` as `ACT_HELP`, keyed by op.
decided: 2026-10-07 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-acts.js`; `screens/mock-kit.js` (`btn`); `layouts.html` ("Explained where it appears").
owed: (BOB) each act's explanation as interface words held for translation (DEC-99), shown on the act's control at the guidance level; the texts in `mock-acts.js` as the design's statement of what each act does.

### DEC-175 · answered
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01NWPmrrYZbbF8Wkrvp5Y2vx; the development process runs on his secondary account since K1891) (Bob, 7 October: "whether the less detailed level should really disable mouseovers or just increase the delay before a mouseover appears. This way, a member always has access to all descriptive and contextual information while giving them a means to reduce the amount that appears when they're moving actively through the visual elements on the screen."; S16)
for: bob
question: Whether the lighter explanation level hides guidance or only makes it wait longer.
why it is Bob's: it changes his ruling DEC-162 ("S8: B").
provisional: DEC-162: at "Marks and names", guidance does not appear.
alternative: B, the same with 2 seconds; C, keep DEC-162.
recommendation: A, 1.5 seconds.
reversal cost: low.
response: **Bob, 2026-10-07: "S16: as recommended".** Ruled: (1) nothing is ever hidden; (2) two settings, named for what they do: "Explain promptly" (every explanation after the pointer rests 0.5 s; DEC-161) and "On a longer pause" (marks and names after 0.5 s; guidance, meaning what screens, sections, rail entries and acts are, after 1.5 s); (3) keyboard focus and a tap show every explanation at once in both, and Escape closes it (WCAG 2.2 1.4.13); (4) the "why we ask" panels still start folded at "On a longer pause"; (5) the switch, the default for new members and the question after a month stay as DEC-162 set them.
decided: 2026-10-07 · Bob
reasoning recorded in: this entry; S16 on `docs/development/ux-substrate/layouts.html`; `screens/page.src.html` (the tip timing, `LONG_MS`); `mock-shell.js` (the masthead switch); Settings › Your account; `BIO_Interaction_Constructs_v0_1.md` §V.
owed: (BOB) the per-member setting's two values renamed ("Explain promptly", "On a longer pause"); guidance-level explanations shown after 1.5 s of rest at the second value instead of withheld; focus and tap immediate in both; the interface words held for translation.

### DEC-176 · answered
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01XZRZG4F5h3eL54heRZyusj; the development process runs on his secondary account since K1891) (Bob, 7 October, on the money trail: "I'm not happy about how members acting on lines in the table currently do so by scrolling down to elsewhere in the panel to find references to the item. This is completely unworkable for tables with more than the few shown in the example. The UX should somehow be more direct.")
for: bob-session
question: How a member acts on one row, or several rows, of a table.
why it is Bob's: it is not: carrying out his direction; the pattern is design detail beneath DEC-99 and §V, decided by the design session (P17) and reported.
provisional: acts on a row's uncertain items gathered in a section below the table (U114).
alternative: a menu of acts on each row; a separate page per row.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-07, on Bob's direction.** (1) A row of a table is acted on where it is. Each row opens, with its name or by keyboard, a panel directly beneath it: where the row came from (its source and passage), what is undetermined about it and what evidence would help (U115's words), and every act on that one row. Opening it never moves the member elsewhere on the screen. (2) An undetermined cell is itself a control: pressing it opens the same panel at that item, with the keyboard on its first act. (3) Ticking rows brings the hold strip (§S) with the acts that apply to all of them, its count, and "Unpick all". (4) A filter above the table keeps only the rows with something undetermined, with their count, so a member can work through them in turn. (5) Sorting keeps each open panel with its row (U110). (6) On a phone each row reads as a card, every value labelled with its column's name, the headings above as sort buttons. (7) A wizard pointing into a row opens that row. (8) Acts on the screen as a whole (reading a new figure, starting a trail) stay above the table; no row's acts are anywhere but in its panel and the hold strip.
decided: 2026-10-07 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.money`, `mrow`, `gapcell`); `screens/mock-shell.js` (`decorate`, `ring`); `screens/page.src.html` (the panel, card and filter); `layouts.html` (section 6); `BIO_Interaction_Constructs_v0_1.md` §V.
owed: (BOB) every table of rows in the member screens follows (1)–(8); each row's panel lists the row's undetermined or absent dimensions with the acts that add evidence (U114); the words held for translation.

### DEC-177 · answered
raised: 2026-10-07 · the UX design session with Bob on his primary account (session_01XZRZG4F5h3eL54heRZyusj; the development process runs on his secondary account since K1891) (Bob, 7 October, on the Calculation screen's title "Reports closed within seven days, FY2025": "I'm seeing similar lack of context in mouseovers on panel titles … I think a check needs to be done to make sure that there aren't ANY visual elements that have more than one mouseover. Mouseovers should never compete for visibility.")
for: bob-session
question: How a screen's title explains itself, and what happens when one explaining element holds another.
why it is Bob's: it is not: carrying out his direction, beneath DEC-159, DEC-163 and DEC-175; decided by the design session (P17) and reported.
provisional: a title explained the kind of screen only; marks, buttons and step lists could hold names and grades that explained themselves separately (148 such pairs over the 46 screens).
alternative: drop the inner explanations; drop the outer ones.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-07, on Bob's direction.** (1) One visual element, one explanation: no element that explains itself sits inside another that does. (2) Where one holds others: a control (a button or a link), or a mark with no label of its own (a strength, a step, a path or ladder step), absorbs theirs, said after its own in lighter type and without their own click hints; a mark with a label (its icon and bold word, such as "Undetermined") gives its explanation to that label, so names in its reason keep their own cards beside it, never inside it. (3) A screen's title that names a particular thing explains that thing first, as a name's card does, at the level of names: "Reports closed within seven days, FY2025: a fact your group worked out from the Public Works work orders for fiscal year 2025: 812 of 903 pothole reports (89.9%) were marked closed within seven calendar days…"; what the screen is for follows in lighter type. A title that names no particular thing ("Members", "Your queue") says what the screen is for. (4) The screens' walk check (`check_walk.mjs`) fails on any nesting, on every screen, with and without the assistant, on desktop and phone, with every row panel open: 7,994 explaining elements checked, none inside another.
decided: 2026-10-07 · the design session (P17)
reasoning recorded in: this entry; `screens/page.src.html` (`untangle`); `screens/mock-refs.js` (`TITLE_HELP`, 26 titles); `screens/mock-shell.js`; `screens/check_walk.mjs`; `layouts.html` (the element table); `BIO_Interaction_Constructs_v0_1.md` §V.
owed: (BOB) no explaining element inside another in the member screens, with (2)'s rule where one holds others; a title that names a particular thing explains it (its card) before the screen's purpose; a test that fails on any nesting; the words held for translation.

### DEC-178 · answered
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B91, on U119: the data share holds a visit's photo as an optional exhibit citation, so the screen can require it or not)
for: bob-session
question: Whether a spot-check visit must carry a photo.
why it is Bob's: it is not: screen detail beneath testimony's rule (a member's own account is grade D and never discounted) and U119; decided by the design session (P17) and reported. Who may appear in such a photo is Bob's, brought as S17.
provisional: U119's wording, "each visit `testify`, with a photo", read as required.
alternative: require a photo for every visit.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-08.** (1) A visit does not need a photo: the member's account of what they saw is the testimony and counts on its own, under their name. (2) The visit asks for a photo where one can be taken and records plainly when there is none; the estimate counts every visit in the draw, photo or not. (3) Requiring one would turn away members without a camera, visits where photographing is unwise, and accounts of what could not be photographed, and would press members to photograph people, which is S17's question.
decided: 2026-10-08 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (the calculation's spot-check, the help page, the testify act's text); `screens/library.src.py` (Check a claim, step 8); `journeys.html` (journey 9, the dumping row); `layouts.html` (section 6).
owed: (BOB) the visit's photo optional, the testimony standing without it; "no photo" shown plainly; the estimate counting every drawn visit.

### DEC-179 · answered
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B90: the interface's word list for translation, with the stable key each word is known by, needed by N669 and N670)
for: bob-session
question: What the interface's word list holds, how its words are keyed, and which are protected.
why it is Bob's: it is not: member words beneath DEC-127 and DEC-157 (4); decided by the design session (P17) and reported.
provisional: none; the words lived only in the mockups.
alternative: wait until every screen is built and key every string then.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-08.** (1) `docs/development/ux-substrate/screens/words.json`, built by `build_words.mjs` from the mockups' own sources (the act texts, the marks' explanations, the kit, the shell, the screens' purposes and columns, the registry, the wizard library), so it cannot drift from them; it fails on a duplicate key, on a hand-named phrase no longer in its source, and on an internal code in member words. (2) 923 words and phrases: weights (11), marks (55), the ordinary states (4), labelled drafts (4), the rail and tabs (16), explanation levels (2), the wizard guide (6), each screen's name and purpose (94), each act's name on each screen and what it does (461), table columns (33), and Civicsmith's seventeen wizard scripts (237). (3) Keys are dotted and stable (`weight.reasoned.name`, `mark.gap.undetermined.means`, `act.publish.label.ceremony`, `act.publish.does`, `screen.money.purpose`, `wizard.<id>.step3.why`); a word keeps its key when its English changes; `{name}` marks a placeholder. (4) Protected, as DEC-157 (4) sets: the weights, every mark, "Undetermined, because…", every act's name, and what an act does where it is signed, terminal, irreversible or outward (its explanation is the warning before it): 345. (5) A sentence that carries a screen's data (a name, a count, a date) is keyed when that screen is built, as `screen.<id>.<part>` with placeholders, and is protected when it is a warning or dialog before an outward, signed or irreversible act, the court notice, or says who can see something.
decided: 2026-10-08 · the design session (P17)
reasoning recorded in: this entry; `screens/build_words.mjs`; `screens/words.json`; `layouts.html` (section 6).
owed: (BOB, N669, N670) the translation layer's word set from `words.json`, its keys and protected marks; screen sentences keyed as (5) when each screen is built; the one tip that carried an internal code ("(DEC-157)" on the Protected tag) no longer does.

### DEC-180 · answered
amended: 2026-10-08 · DEC-185 (beneath Bob's K2248, camera details never published): the obscured copy's label reads "Faces, plates and camera details removed for publication; the group holds the original"; every other published photo is labelled "Camera details removed for publication; the group holds the original".
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B91, second question: what a group is told about photographing people at a site who are not its subject; question S17)
for: bob
question: What happens to people, and number plates, that appear in a photo but are not what it is about, inside the group and in a published case.
why it is Bob's: who may see what, and a private person's exposure in a published case (doctrine, P17; K1483's rule on people outside any official role).
provisional: nothing; a photo is kept whole and travels whole with a case that relies on it (K1483).
alternative: A, remind members and publish as taken; C, never publish such a photo, the case showing the member's account and "photo held by the group".
recommendation: B, as below.
reversal cost: low before the screens are built.
response: **Bob, 2026-10-08, through the development process (K2108, B95): "agreed"**, to recommendation B. Ruled: (1) wherever a member takes or adds a photo, one reminder: frame what you are checking, and leave out people's faces and number plates where you can; (2) inside the group every photo stays as taken; (3) before a case is signed, the publication ceremony's Photos step lists each photo the case relies on, and a member marks anyone in it who is not part of a finding, and any number plate; (4) the copy the published case carries shows the marked areas obscured, labelled "Faces and plates obscured for publication; the group holds the original"; the original stays inside the group; (5) city staff at work are part of what a case is about, so one is obscured only with a reason. Design detail beneath it, answering B97: the member marks the areas and Civicsmith obscures them itself (solid cover over each marked area); no AI vision runs over the group's photos, so keep-away (DEC-172) is untouched and nothing is paid per photo. Should an assistant's proposal of areas be wanted later, a member would still accept each one, and its cost and keep-away make it Bob's, brought by BOB with options.
decided: 2026-10-08 · Bob (K2108)
reasoning recorded in: this entry; `screens/question.html` (S17); `screens/mock-screens.js` (the reminder on Add, the ceremony's Photos step); `screens/library.src.py` (Publication ceremony, the photos step); `screens/registry.src.py` (`owed:obscuremark DEC-180`); `layouts.html`; BIO_Interaction_Constructs_v0_1.md §V.
owed: (BOB, N757) the reminder where a photo is taken or added; the ceremony's Photos step listing every photo the case relies on; marks of who and what to obscure, recorded with the member who made each; the obscured copy, derived from the original and labelled, carried by the published case in the original's place; the original kept inside the group; the act `obscuremark`; the words held for translation (protected: it says who can see something).

### DEC-181 · answered
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B96, question 2: `standardrelease` carries the Irreversible weight (DEC-143) and stays offered on a phone; should it join `personexpunge` (DEC-170) in finishing on a larger screen?)
for: bob-session
question: Which acts a phone shows but does not do.
why it is Bob's: it is not: beneath DEC-122 G1 (signing, publishing and sending finish on a larger screen) and DEC-170; decided by the design session (P17) and reported.
provisional: DEC-170: `personexpunge` alone, beside the signing, publishing and sending acts.
alternative: keep the list act by act.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-08.** Every act that can never be undone (every op the Irreversible weight marks, DEC-143: today `publish`, `publishat`, `publishatmove`, `personexpunge`, `standardrelease`) is read on a phone and done on a larger screen, where its whole consequence is in view; the phone says where to finish. With DEC-122 G1, a phone also does not sign, publish or send. One rule replaces DEC-170's single act.
decided: 2026-10-08 · the design session (P17)
reasoning recorded in: this entry; `layouts.html` (section 1's phone cell, section 6).
owed: (BOB) the phone rule read from the Irreversible weight's set, not a list of ops.

### DEC-182 · answered
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B96, questions 1 and 3, and B99: five act texts naming no op the product serves, an alias with two texts, the retired `assistantset` still on the setup screen and in its required wizard, the act texts still owed, and the security-tools step's words before Settings › Security exists)
for: bob-session
question: Which served op each of the design's acts means, and which act texts the design stream owes.
why it is Bob's: it is not: the design's own act names and words, beneath DEC-172 and DEC-174; decided by the design session (P17) and reported.
provisional: PR #13's registry and `mock-acts.js`.
alternative: drop the five texts.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-08.** (1) Re-pointed to served ops, each button keeping its words and, where the op's general text would be vague, a text of its own on that screen: "Start a project" is `promote` (a project starts by promotion, admission R11, membership R71); the Find screen's "Count" is `calculationcreate` (a count with its method shown is a calculation, K1471); "Register the proceeding" is `entitycreate` (a proceeding is an entity of that kind, entities' Terms); "Work it out again" on a due date is `clockpropose` (it proposes; `clockadopt` confirms). The texts `projectcreated`, `countask`, `registerproceeding` and `deadlinecompute` are withdrawn; `clockpropose` has its own; `entitycreate`'s general text now covers every kind. (2) The same-person claim is one op, `identityclaim`: the person screen's button points at it and `claimidentity`'s text is withdrawn. (3) `assistantset` is gone: the setup screen's "Does the group pay?" choice and its button are removed; the required Set up and claim wizard's step points at keeping material away from AI (`aikeepaway`, DEC-172) and its next step at the group's optional key (`groupkeyset`), "leave it empty and members bring their own". (4) A member changing their own password while signed in is owed (`owed:setpassword`, the op credentials R3 names; T36 serves no member path to it). (5) The texts the design stream owes: one for every act a member screen offers, written when the screen offering it is drawn; an op no member screen offers needs none. When op-declarations finds member-session ops a screen offers without a text, BOB names them in one QUESTION and the stream writes them in its next pull request. (6) The setup page's security-tools step, until Settings › Security exists: "Civicsmith scans every file it captures with its own scanner and opens risky ones in a safe view. If your organization already uses a file scanner, a safe-copy maker or a log service, you can add it here, now or later." Once the screen exists: the same, ending "you can add it now, or later in Settings › Security."
decided: 2026-10-08 · the design session (P17)
reasoning recorded in: this entry; `screens/registry.src.py`; `screens/mock-acts.js`; `screens/mock-kit.js`; `screens/mock-screens.js` (home, setup, account, find, person, proceeding, due date); `screens/library.src.py` (Set up and claim, Follow a proceeding); `screens/mock-journeys.js` (journeys 8 and 10); `screens/words.json`.
owed: (BOB) `ACT_HELP` from PR #14's `mock-acts.js` (re-pointed as above; `clockpropose` and `owed_obscuremark` added); the setup step and wizard step on `aikeepaway` and `groupkeyset`; a member's own password change (`setpassword`); the security-tools step's two wordings as (6).

### DEC-183 · answered
amended: 2026-10-08 · DEC-187: the gate covers every photo the case carries; any member who may see a photo may withdraw a mark on it; the withdrawal's refusals and the after-signing words.
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B102, B103 and B104, folding DEC-180 in T37 and the password text)
for: bob-session
question: Whether the ceremony's Photos step stops signing; whether a mark can be withdrawn; what a member sees when a photo cannot be covered or its marks change; and what changing a password does to other sessions.
why it is Bob's: it is not: screen detail beneath DEC-180 (K2108) and credentials R3 (K1881); decided by the design session (P17) and reported.
provisional: B102's defaults (not a gate; marks append-only); the password text of DEC-182.
alternative: B102's defaults.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-08.** (1) The Photos step is a gate: signing is refused while any photo the case relies on is unchecked, and checking costs one act ("nothing to obscure", or the marks), so no one is published by oversight. (2) A mark is withdrawn by a later act with a reason (`obscuremarkwithdraw`, reasoned), by its maker or any member who may act on the case; the withdrawal is recorded beside the mark, never erased, and the copy follows the marks that stand; "nothing to obscure" never removes a mark. (3) BOB's B103 (b) holds: a marked photo in a format the cover cannot handle refuses the publication, naming the photo; the screen says "This photo's format can't be obscured: {photo}. Capture it again as an ordinary photo, or stop relying on it." (4) A mark made or withdrawn after the case is prepared: "A mark changed after this case was prepared. Prepare it again before signing." (5) The Photos step says that text read from a photo, such as a number plate, is never published with it, while a passage a member quotes in the case still is. (6) The copy's label, the reminder and the step's words are in the word list, protected. (7) Changing a password ends every other session signed in as that member (credentials R3, K1881); the act's text now says so.
decided: 2026-10-08 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (the ceremony's Photos step); `screens/mock-acts.js`; `screens/registry.src.py` (`owed:obscuremarkwithdraw DEC-183`); `screens/build_words.mjs`, `screens/words.json` (`photo.*`); `layouts.html` (section 6).
owed: (BOB, T37 L8 and L11) signing refused while a relied-on photo is unchecked (a code naming the photo); `obscuremarkwithdraw` with its reason, recorded beside the mark, the copy following standing marks; the refusals' words as (3) and (4); the `photo.*` words from `words.json`; the password text as (7).

### DEC-184 · answered
amended: 2026-10-08 · DEC-186 (Bob, S18: B): a handle may be changed until the member's work first appears in a published case; the screens say so.
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (Bob's comment on the layouts page's joining screen, field "Your handle": "I assume that the system is enforcing the restriction that every handle be unique within a group. The user should be getting visual feedback saying whether the handle they're choosing is unique or not.")
for: bob-session
question: What a member sees while choosing a handle.
why it is Bob's: it is not: screen detail beneath membership R12 and R16 (a handle's characters; `HANDLE_TAKEN` at enrolment); decided by the design session (P17) on his direction. Whether a handle may be changed after joining is his, brought as S18.
provisional: the field showed nothing until enrolment refused a taken handle; the screens said a handle could be changed later, which no op allows.
alternative: report a taken handle only when the member presses Join.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-08, on Bob's comment.** (1) Yes, a handle is unique in the group: enrolment refuses a taken one (membership R16, exact comparison over R12's characters: lower-case letters, digits and hyphens, 2 to 41, starting with a letter or digit). (2) As a member types, the field says one of three things: "{handle} is free in {group}"; "{handle} is already taken in {group}. Try another, such as {suggestion}."; or that a handle uses only lower-case letters, digits and hyphens, naming what doesn't fit. (3) The check answers only free or taken, never who has a handle, and only while the invitation is live (`owed:handlecheck DEC-184`, a read). (4) The help under the field states the characters and that a handle can't be changed after joining; the invitation's id field and the Invite a member wizard step no longer call the administrator's id the member's handle; the sample handle is "mai-k" (a full stop is not allowed).
decided: 2026-10-08 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (joining, members, your account); `screens/mock-refs.js`; `screens/library.src.py` (Invite a member, step 1); `screens/registry.src.py`; `journeys.html` (journeys 3 and the Invite a member card); `screens/words.json` (`handle.*`); `layouts.html`.
owed: (BOB) a read `handlecheck({invite, handle})` answering free, taken or not allowed (never who), refused without a live invitation and counted against R38-style abuse limits; the field's three messages, held for translation.

### DEC-185 · answered
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B108–B110: Bob ruled, K2248, "for photo metadata: the group keeps it, but published photos do not"; "any screen words for it are yours")
for: bob-session
question: What a published photo's label says, and what the Photos step tells the member, now that every published photo goes out without its camera details.
why it is Bob's: it is not: the words beneath his ruling K2248 and DEC-180; decided by the design session (P17) and reported.
provisional: DEC-180's label for an obscured copy only; nothing for an unmarked photo.
alternative: one note for all photos on the published case instead of a label on each.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-08.** (1) Every photo a published case carries is labelled. An unmarked photo: "Camera details removed for publication; the group holds the original." A photo with obscured areas: "Faces, plates and camera details removed for publication; the group holds the original." That replaces DEC-180's "Faces and plates obscured for publication; the group holds the original", under the same key `photo.obscured.label`. (2) The ceremony's Photos step says that every photo a published case carries goes out without its camera details (where and when it was taken, and on which device), and the group keeps the original.
decided: 2026-10-08 · the design session (P17), beneath Bob's K2248
reasoning recorded in: this entry; `screens/mock-screens.js` (the Photos step); `screens/question.html` (S17's record); `screens/words.json` (`photo.obscured.label`, `photo.published.label`).
owed: (BOB, N779 in T38) the two labels on published photos, read by key; the Photos step's sentence.

### DEC-186 · answered
amended: 2026-10-12 by DEC-195 (Bob, S19 point 1: reserved five years), itself replaced the same day by DEC-196 (Bob: a handle is never reused); then replaced in its rule by DEC-197 (Bob, "for the time being"): a handle is fixed at joining and never changed.
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (found answering Bob's comment on the handle field, DEC-184: no op changes a handle after joining, while the screens had said it could be; question S18)
for: bob
question: Whether a member may change their handle after joining, and until when.
why it is Bob's: what Civicsmith must do (a requirement), and how a member appears on published, signed work (P17).
provisional: membership as built: a handle is set once, at enrolment (R16), and never changed.
alternative: A, fixed at joining; C, changeable any time, published cases keeping the handle they were signed with.
recommendation: B, as below.
reversal cost: low before the screens are built.
response: **Bob, 2026-10-08: "S18: B".** Ruled: (1) a member may change their own handle until their work first appears in a published case; from then on it is fixed, because published cases are signed and permanent; (2) inside the group members see the earlier handle beside the new one ("formerly mai-k"), so a change never hides earlier work; (3) the new handle must be free in the group and follow a handle's characters, checked as the member types (DEC-184).
decided: 2026-10-08 · Bob
reasoning recorded in: this entry; `screens/question.html` (S18); `screens/mock-screens.js` (joining's help, Your account's "Your handle", Members' "formerly"); `screens/mock-refs.js`; `screens/registry.src.py` (`owed:handlechange DEC-186`); `journeys.html` (journey 3); `screens/words.json` (`handle.*`); BIO_Interaction_Constructs_v0_1.md §V.
owed: (BOB) a requirement in membership: `handlechange` for a member's own handle, refused once any of their work is in a published case (a code naming the case) and refused for a handle taken or not allowed (R12, R16); the earlier handles kept and shown to members as "formerly"; published cases keep the handle they were signed with; the words held for translation.

### DEC-187 · answered
raised: 2026-10-08 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B115 and B116, for T38's L8 case-disclosures, case-carriage and case-grammar)
for: bob-session
question: Which photos the Photos step's gate covers; whether an unmarked published photo is labelled; who may withdraw a mark and the words for its refusals; what a member sees when marks change after signing.
why it is Bob's: it is not: screen detail beneath DEC-180 (K2108) and K2248, and the design session's own DEC-183 and DEC-185; decided by the design session (P17) and reported.
provisional: BOB's readings in B115 (every photo any chain reaches; no label; any member who may see the photo; BOB's draft words) and B116 (the words verbatim).
alternative: only photos a load-bearing chain reaches block signing.
recommendation: as decided below.
reversal cost: low.
response: **Decided by the design session, 2026-10-08.** (1) BOB's reading holds: the gate covers every photo the case carries, every photo any member's chain reaches, including one that only supports a finding, because every carried photo is published and DEC-180 lets no one be published by oversight. The words say "carries" instead of "relies on": "Signing waits until every photo in the case is checked, including one that only supports a finding: {photo}." (2) Already answered by DEC-185 (PR believeinoakland/bio#15): an unmarked published photo is labelled "Camera details removed for publication; the group holds the original" (`photo.published.label`); the marked label is `photo.obscured.label`. (3) BOB's reading holds and corrects DEC-183's wording: marks are kept per photo, so any member who may see the photo may withdraw a mark, as for marking; only a member, never the machine. The refusals: "Only a member can withdraw a mark; the machine never can."; "There is no such mark on {photo}. Open the photo again to see the marks that stand."; "{member} already withdrew this mark on {date}."; "Say why you are withdrawing this mark. Your reason is kept beside it." (4) A mark changed after signing, met at the commit or a scheduled stop: "This case wasn't published: a mark on {photo} changed after it was prepared. Prepare it again, and sign it again." (`photo.refused.changed.signed`); `photo.refused.changed` stays for the moment before signing.
decided: 2026-10-08 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (the ceremony's Photos step, the photo reminder); `screens/build_words.mjs`, `screens/words.json` (`photo.*`); `layouts.html` (section 6).
owed: (BOB, T38 L8 or T39) the gate over every carried photo; `obscuremarkwithdraw` open to any member who may see the photo, refused to a machine; the four withdrawal refusals and `photo.refused.changed.signed` read by key from `words.json`.

### DEC-188 · answered
amended: 2026-10-11 by DEC-189 (B123–B126): (1) and (8)'s wording of exploring's limit, (6)'s label for members who don't own the account, (7)'s fills keyed, (8)'s acts re-pointed to the served ops
raised: 2026-10-09 · the UX design session with Bob on his secondary account (session_01SCHPX2mpSDpBNA9wprUm5H; the development process runs on the same account since K1891) (BOB's B119, B120 and B121, for T40's N797, N799, N811, N812 and N814)
for: bob-session
question: The words and screens T40 owes: AI accounts for the group, a project and a member (N812); the handle check and change; the published labels and refusals; a question a project draws on; and one product word that named a jurisdiction.
why it is Bob's: it is not: screen detail beneath Bob's K2350, K2352, K2353 (N812), DEC-184 to DEC-187 and K2371; decided by the design session (P17) and reported. Two points of DEC-186's meaning are Bob's, brought as S19 (B121; BOB's own §Z1, §Z2).
provisional: BOB's drafts in `build/plan/draft-T40-reqs.md` and `draft-T40-N812.md`; the old assistant screens (a member's daily limit in dollars capped by the administrator's; the group's spending shown by member).
alternative: a separate screen per level.
recommendation: as decided below.
reversal cost: low before the screens are built.
response: **Decided by the design session, 2026-10-09.**
(1) One AI account panel, drawn the same for the group's key (Settings › Members), a project's account (a new screen, AI for this project, reached from the project) and a member's own (Settings › The assistant). It shows: what the account pays for (asking, drafting, runs, standing questions, suggestions; exploring No, Ask every day or Yes, the last at group and project level only, since a member's exploring scope waits on D36); its limits in a table, with one form to set or remove one (overall, a use, or each member's use for group and project accounts; dollars, estimated, on an API key only, else tokens or calls; a day or a month; for a use, part of the overall limit or on top of it); this month's use per use, summed, naming no member; and the changes, with who and when.
(2) Every level states once who pays: the project's account in a project that has one, else the member's own, else the group's key; the account chosen is the one used, so a limit or a switched-off use stops the act and never moves it to another account.
(3) A project's account: its own API key, or the acting owner's own sign-in while they are its only member. When a second member joins, the sign-in stops serving and the owners are told in their queue; the screen says what serves instead. Any one owner sets the settings; every owner sees the changes. A member who is not an owner sees what pays and, once, the project key's disclosure.
(4) Material limits ("keep away from AI") at group and project level take every use or chosen ones, with a reason every member sees, and bind every account.
(5) Owners' use is summed, naming no member (K1450; N812 B8). The Members screen's spending by member and the disclosure "Administrators see how much you spend" are corrected: they see the key's use in total, never what was asked or who asked. A member sees their own use across every payer.
(6) The queue: a limit reached (Noticed, told once to the account's owners, naming no member), the project's sign-in suspended (Noticed), and the daily exploring ask (Noticed, with "Explore today"; BOB's §Z4 reading confirmed: no fourth class). What exploring finds is labelled "Machine work · found while exploring · enabled by {owner}".
(7) Words (`words.json`): `ai.*` (31) for the cascade, the uses, the refusals `AI_LIMIT_REACHED` (by scope, naming whose, never a cost), `AI_USE_SWITCHED_OFF`, `PROJECT_AI_KEPT_AWAY`, `PROJECT_NOT_SOLE_MEMBER`, `PROJECT_KEY_NOTICE_DUE` with the disclosure, `SWITCH_VALUE_INVALID`, `SIGNIN_NOT_CONNECTED`, `AI_LIMIT_INVALID`, `LIMIT_UNIT_UNAVAILABLE`, `EXPLORE_NOT_ENABLED`, the three queue items and the label; `handle.refused.unchecked` (re-wording BOB's draft), `handle.refused.paused`, `handle.refused.notmember`; `document.cleaned.label`, `document.refused.changed`, `document.refused.clean`, `document.refused.pending` (BOB's T39 drafts, adopted as written); `question.refused.drawnon` for `DRAWN_ON_BY_A_PROJECT`, naming no project. ACT_HELP for every new act; `owed_aikeepaway` and `groupkeyset` re-worded for the cascade.
(8) Acts: `aiceilingset`, `aicopyceilingset`, `accountswitchset` and `groupswitchset` leave the screens and wizard steps for `owed:ailimitset DEC-188` and `owed:accountusesset DEC-188`; new owed acts `projectkeyset`, `projectsigninset`, `projectaccountswitch`, `projectaccountremove`, `projectkeynoticeseen`, `projectaikeepaway`, `exploreapprove`.
(9) B119: `column.money.period.shows` no longer names a city's fiscal year: "The accounting period the source counts the amount in, such as a fiscal year, which need not match the calendar year."
(10) BOB's §Z3 reading (a signed-in member's own handle check needs no invitation) is the design: Your account checks the new handle as it is typed.
decided: 2026-10-09 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (the AI panel, Members, The assistant, AI for this project, Your queue, the project, setup); `screens/mock-acts.js`; `screens/mock-kit.js`; `screens/mock-refs.js`; `screens/registry.src.py` (`projectai`); `screens/library.src.py` (Connect your Claude account); `screens/build_words.mjs`, `screens/words.json` (`ai.*`, `handle.*`, `document.*`, `question.*`); `screens/question.html` (S19); `layouts.html`.
owed: (BOB, T40) the ops behind (8); the panel's reads (`projectAccountState`, `aiUsage`, `aiUsageMine`, the limits with their use in the period); the refusals and queue items read by key from `words.json`; the change history of each account's settings answered to its owners.

### DEC-189 · answered
raised: 2026-10-11 · the UX design session with Bob on his primary account (session_014uT5e8EjnRxmEeUDDg2cYa; the development process also runs on his primary account since K2511) (BOB's B123, B124 and B126, for T41's K2484, K2486, K2516, K2586)
for: bob-session
question: Four wording points on DEC-188's words (B123), the keys for the fills ai-use writes in its own words (B124), and the words notice-producers R16 and R17 still lack (B126).
why it is Bob's: it is not: word and screen detail beneath Bob's K2350, K2352, K2353, K2400 (A5) and D64, amending DEC-188; decided by the design session (P17) and reported.
provisional: DEC-188's words; ai-use's `LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL`, `LIMIT_FIELD_FILL`; notice-producers' own sentences for R17.
alternative: leave the fills in each module's own words.
recommendation: as decided below.
reversal cost: low; words read by key.
response: **Decided by the design session, 2026-10-11.**
(1) `ai.refused.explorenotenabled` reads "Exploring is off on {whose} account. Its owners can switch it on." An exploring limit is never required (ai-use R3, Bob's A5): with none set, the overall limit judges exploring. The AI panel's help for Exploring says the same ("within this account's overall limit, and within an exploring limit if its owners set one"). This amends DEC-188 (1).
(2) A find made while exploring shows `ai.label.explored` ("… enabled by {owner}") only to the paying account's owners; every other member sees `ai.label.explored.member`, "Machine work · found while exploring", naming no account and no person (question-explorer R5, D64). The project screen's suggested questions now draw it as a member sees it. Answers B126 (1).
(3) Acts re-pointed: the 37 owed acts whose ops `main` now serves (among them `accountusesset`, `ailimitset`, `projectkeyset`, `projectsigninset`, `projectaccountswitch`, `projectaccountremove`, `projectkeynoticeseen`, `exploreapprove`, `aikeepaway`, `handlechange`, `handlecheck`, `obscuremark`, `obscuremarkwithdraw`, the file-safety, translation and security-tool acts, `setpassword`, `startfrom`, `writinghelp`) name the served op; their `ACT_HELP` and `WEIGHT` keys drop `owed_`, so `words.json` holds `act.<op>.*`. Three stay owed, as `check_library.py` lists: `subscriptionsignin`, `infolevelset` and `projectaikeepaway`.
(4) The retired acts' texts are removed: `aiceilingset`, `aicopyceilingset`, `accountswitchset`, `groupswitchset` from `ACT_HELP`, and their `WEIGHT` entries.
(5) Fills keyed (B124, B126 (3)): `ai.period.day|month`; `ai.when.day` ("tomorrow"), `ai.when.month` ("on {month} 1") with `date.month.*`; `ai.limitfield.*` for `AI_LIMIT_INVALID`'s `{field}` (owner, scope, unit, period, amount, inclusive, use, count; ai-use's own wording kept but for owner and use); `ai.use.*.inline` for `{use}` inside a sentence (`ai.use.*.name` at a sentence's start); `ai.account.group|project|own` and their `.inline` forms for `{account}`; `ai.scope.group` ("your group's work") and `ai.scope.own` ("your own questions") for the exploring ask. When a limit can't be judged (R3 failing closed), the member reads `ai.refused.limit.unjudged` instead of a reached limit, since nothing was reached: "The assistant stopped here: Civicsmith couldn't check the use of {whose} account just now, and it spends nothing it can't count. Try again in a moment. Everything else works as usual."
(6) The limit-reached queue item has one sentence per scope, like the refusals: `ai.queue.limitreached` (a use: "{account} reached its {period} limit for {use} on {date}. It pauses {use} until {when}; its other uses go on."), `ai.queue.limitreached.overall` and `ai.queue.limitreached.member` (naming no member). `{for_use}` and `{Uses}` are gone.
(7) notice-producers R17's kinds each have `queue.<kind>.summary` and `queue.<kind>.detail` (B126 (2)): question-find, step-later-found, step-date-due, step-reminder, step-cost-shared, step-cost-message, milestone-overdue, milestone-reminder, project-quiet, review-comment-left-out; each says what happened, who else is told, and what the member can do.
decided: 2026-10-11 · the design session (P17)
reasoning recorded in: this entry; `docs/architecture/BIO_Interaction_Constructs_v0_1.md` (who pays, RULED 2026-10-11); `screens/build_words.mjs`, `screens/words.json` (1,064 words, 392 protected); `screens/mock-screens.js`; `screens/mock-acts.js`; `screens/mock-kit.js`; `screens/registry.src.py`; `screens/library.src.py`; `screens/mock-journeys.js`; `screens/check_walk.mjs`; `layouts.html`.
owed: (BOB) ai-use reads its fills by key (`ai.period.*`, `ai.when.*`, `date.month.*`, `ai.limitfield.*`, `ai.refused.limit.unjudged`); notice-producers reads R16's and R17's words by key (`ai.queue.limitreached*`, `ai.account.*`, `ai.use.*.inline`, `ai.scope.*`, `ai.label.explored.member`, `queue.*`); the B123 wording in ai-use's `AI_USE_WORDS`.

### DEC-190 · answered
amended: 2026-10-11 (T42 closed onto `main`): `op=pagetranscribe` is served; the act names the served op, so its words are `act.pagetranscribe.*`
raised: 2026-10-11 · the UX design session with Bob on his primary account (session_014uT5e8EjnRxmEeUDDg2cYa; the development process also runs on his primary account since K2511) (BOB's B128 and B129, for T42's N832, K2611, K2613)
for: bob-session
question: Where a member is offered the assistant's reading of page pictures (`pagetranscribe`), and its words: its help, its refusal C-51.7 `TRANSCRIBE_NOT_DEPLOYED`, its label and its answers.
why it is Bob's: it is not: screen and word detail beneath Bob's D21 (the transcription tier) and K2484; decided by the design session (P17) and reported.
provisional: BOB's draft refusal in `build/plan/draft-T42-transcribe.md` §3.
alternative: offering it beside a capture on the Add screen.
recommendation: as decided below.
reversal cost: low; words read by key, the act owed until T42 serves it.
response: **Decided by the design session, 2026-10-11.**
(1) Placement: a reading act, never a capture act. The Document screen gains a section, "Pages Civicsmith couldn't read", shown only when the reading has such pages: it names them, says their words can't be found or cited yet and that the page images are kept, and offers "Have the assistant read pages …" (with the assistant) and "Type a page's words yourself" (`transcribe`, always, so the product works without the assistant). Capture comes before any reading, so the Add screen has nothing to offer it on.
(2) Words: `act.owed_pagetranscribe.does` (up to 8 pages; the account that pays for the member's acts there pays, within its limits; labelled as the assistant's reading; undetermined until a member checks a passage against the page); `act.transcribe.does`; `transcribe.refused.notdeployed` (replacing BOB's draft: nothing read or sent; not switched on yet; each part is switched on only after it passes Civicsmith's test investigations; type a page's words yourself meanwhile; names no account); `transcribe.label`; `transcribe.done` and `transcribe.none` for the answer; `document.unread.pages`.
(3) The AI panel lists the use: `ai.use.transcribe.name` "Reading page pictures" (and `.inline`), so owners can switch it and set a limit on it like any other use; the keep-away choices cover it.
decided: 2026-10-11 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (Document; the AI panel's uses); `screens/mock-acts.js`; `screens/mock-kit.js`; `screens/registry.src.py`; `screens/check_walk.mjs`; `screens/build_words.mjs`, `screens/words.json` (1,075 words, 395 protected); `layouts.html`.
owed: (BOB, T42) `op=pagetranscribe` served (the act then re-pointed from `owed:pagetranscribe K2611`); C-51.7's translation read by key `transcribe.refused.notdeployed`; the answer's sentences read by key; the Document read answering which pages its reading could not make out.

### DEC-191 · answered
raised: 2026-10-11 · the UX design session with Bob on his primary account (session_014uT5e8EjnRxmEeUDDg2cYa; the development process also runs on his primary account since K2511) (BOB's B133 and B134, for T43's folds of DEC-189 and DEC-190, N853b, N859, K2691)
for: bob-session
question: The word keys T43 needs: exploring's two refusals; the uses `enquire`, `read` and `account`; the queue's date; the transcription's outcomes when nothing was sent; a photographed page.
why it is Bob's: it is not: word detail beneath DEC-188 to DEC-190; decided by the design session (P17) and reported.
provisional: BOB's bracketed readings in B133 and B134.
alternative: as BOB's readings.
recommendation: as decided below.
reversal cost: low; words read by key.
response: **Decided by the design session, 2026-10-11.**
(1) `ai.refused.exploreoutofscope` (C-143.5): "The assistant can't explore this question on {whose} account: it lies outside what the account's owners chose to explore."; `ai.refused.exploreaskinvalid` (C-143.6): ai-use's sentence kept.
(2) The uses gain `ai.use.enquire` ("Interviews and planning"), `ai.use.read` ("Reading inside documents") and `ai.use.account` ("A case's account"), each with `.inline`; the AI panel lists them, on by default. `ai.use.suggestions` stays: it names the `suggestions` switch (credentials' `USE_SWITCHES`, K1479), which is not a kind of use but is switched alongside them.
(3) `date.daymonth`, "{day} {month}" with `date.month.*`, is the one format for a local day in a sentence, the queue's `{date}` included.
(4) `transcribe.none` is only for the assistant asked and reading nothing. When nothing was sent: `transcribe.notsent` ("Nothing was sent to the assistant: {why}. The pages are as they were.") with `transcribe.why.unbound`, `.evidenceabsent`, `.norender`; when a refusal came back: `transcribe.refused` with the refusal's own sentence.
(5) A photographed page (B134): `transcribe.picture.unprepared` with `transcribe.picture.why.progressive` and `.toolarge`; `capture.picture.unread`.
decided: 2026-10-11 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (the AI panel's uses); `screens/build_words.mjs`, `screens/words.json` (1,093 words, 395 protected); `layouts.html`.
owed: (BOB, T43) the keys read by ai-use (C-143.5, C-143.6), credentials and the panel's reads (the three uses), notice-producers and queue (`date.daymonth`), extraction (`transcribe.*`) and capture (`capture.picture.unread`).

### DEC-192 · answered
raised: 2026-10-11 · the UX design session with Bob on his primary account (session_014uT5e8EjnRxmEeUDDg2cYa; the development process also runs on his primary account since K2511) (BOB's B136 and B137, from T44's draft fold of DEC-191 and NOTICE-PRODUCERS #7)
for: bob-session
question: Six word points on DEC-189 and DEC-191's keys: a relayed refusal inside `transcribe.refused`; a reading that fails after the pages were sent; a date in another year; the order of day and month in `ai.when.month`; `{when}` after "until"; who says `capture.picture.unread`.
why it is Bob's: it is not: word detail beneath DEC-189 to DEC-191; decided by the design session (P17) and reported.
provisional: BOB's readings in B136 and B137.
alternative: as BOB's readings.
recommendation: as decided below.
reversal cost: low; words read by key.
response: **Decided by the design session, 2026-10-11.**
(1) `transcribe.refused` is "The assistant didn't read these pages. {reason}": the relayed refusal is a sentence of its own, so its capital stands, and its own placeholders are filled by the screen from the fields relayed beside it (BOB's reading).
(2) After the pages were sent: `transcribe.failed` ("The pages were sent to the assistant, but no reading came back: {why}. Nothing was written; you can try again.") with `transcribe.why.silent` (`AGENT_WORKER_SILENT`) and `transcribe.why.ended` (a provider ending). A refusal from the worker after the post reads `transcribe.refused`.
(3) `date.daymonthyear`, "{day} {month} {year}", for a day not in the current year; `date.daymonth` otherwise.
(4) `ai.when.month` is "on 1 {month}", day before month as everywhere.
(5) `{when}` after "until" has its own keys: `ai.until.day` ("tomorrow") and `ai.until.month` ("1 {month}"), read by `ai.queue.limitreached*`: "… pause until 1 November". The refusals keep `ai.when.*` ("It works again on 1 November").
(6) `capture.picture.unread` is the reading's fact, said by extraction (R27), never by capture's upload answer (BOB's reading).
decided: 2026-10-11 · the design session (P17)
reasoning recorded in: this entry; `screens/build_words.mjs`, `screens/words.json` (1,099 words, 395 protected).
owed: (BOB, T44) the keys read as named: extraction (`transcribe.refused`, `transcribe.failed`, `transcribe.why.*`), ai-use (`ai.when.month`), notice-producers (`ai.until.*`), the screens' dates (`date.daymonthyear`).

### DEC-193 · answered
raised: 2026-10-11 · the UX design session with Bob on his primary account (session_014uT5e8EjnRxmEeUDDg2cYa; the development process also runs on his primary account since K2511) (BOB's B139, for T45's N886)
for: bob-session
question: The `{reason}` of `transcribe.refused` for agent-worker R72's refusals after the pages are posted.
why it is Bob's: it is not: word detail beneath DEC-192 (2); decided by the design session (P17) and reported.
provisional: nothing shown (200, performed false, no sentence).
alternative: one sentence for every code.
recommendation: as decided below.
reversal cost: low; words read by key.
response: **Decided by the design session, 2026-10-11.** Each fills `transcribe.refused`'s `{reason}` as a sentence of its own: `transcribe.reason.requestfault` for `BAD_BODY`, `BAD_SHA` and `BAD_PAGES` (Civicsmith's own fault, said so; try again, then tell an administrator); `transcribe.reason.noaccount` (`NO_ACCOUNT`: where to connect an account); `transcribe.reason.badaccount` (`BAD_ACCOUNT`: its owners can check it); `transcribe.reason.needsapikey` (`TRANSCRIBE_NEEDS_API_KEY`: an API key is needed, a sign-in can't; type the words meanwhile).
decided: 2026-10-11 · the design session (P17)
reasoning recorded in: this entry; `screens/build_words.mjs`, `screens/words.json` (1,103 words, 395 protected).
owed: (BOB, T45, N886) extraction fills `{reason}` from these keys by the worker's code.

### DEC-194 · answered
raised: 2026-10-11 · the UX design session with Bob on his primary account (session_014uT5e8EjnRxmEeUDDg2cYa; the development process also runs on his primary account since K2511) (BOB's B140, for T45's actions fold of `BIO_Action_v0_2.md`, K2780, N893)
for: bob-session
question: The member words T45 owes for the Action layer (the "Owed to UX" list of `build/plan/current.md` on `tranche/T45`); five wizard scripts; `@communication`'s step in Start and send; whether a pending second approval needs a screen; which new acts open a consequence dialog; the reason fields kept out of writing help.
why it is Bob's: it is not: words, scripts and screen detail beneath Bob's rulings on the Action layer (the canon `BIO_Action_v0_2.md`, K2780) and his approval of the wizard library (DEC-148); decided by the design session (P17) and reported.
provisional: BOB's draft translations (kept where they already said what happened, then what to do; re-worded where not), code fallbacks, and S1 §C 14's stage questions.
alternative: BOB's drafts as written.
recommendation: as decided below.
reversal cost: low; words read by key, scripts adopted under wizard-scripts R22.
response: **Decided by the design session, 2026-10-11.**
(1) Words: 290 entries in `screens/words-actions.src.py` (read by `build_words.mjs` into `words.json`): canon's own words recorded by key; the matter states, project scopes, second-approval setting, group-rule states, the professional's statement prompt, `reads_as` and bearing names; every listed refusal as `refusal.<CODE>` (`NO_SUCH_RULE` as `NO_SUCH_GROUP_RULE`, K2811; `FINDING_NOT_PUBLISHED`, `SCENARIO_OUT_OF_RANGE` and `NOT_OPEN` re-worded as asked); the L8 keys (signing, case checks, outcomes, docket, advocacy); conformance and consequences (the cure link's form, the success sentences, the harm-addressed labels: Remedied, Mitigated, Compensated, Acknowledged, Can't be undone); the actions keys and every label set; the filings pointers, "For the group" / "As myself", the recognition reminder, the plan's prompts and standing offers ("Document what happened", "Give them a chance to fix it"), "No reply owed", "Stopped pursuing, {date}", the escalation stages as questions (S1 §C 14's, adopted), the scenario comparison; monitoring, following, the queue items' summary and detail, and the door labels. A cure is said to members as "corrected by the office".
(2) Acts: `ACT_HELP` text for each of the 42 new ops (served names; the four drawn on screens before T45 serves them as `owed:<op> K2780`).
(3) A pending second approval needs no queue item (BOB's upper doubt 11: nobody assigns anybody). The filing on Start and send shows it: `filings.secondapproval.waiting` ("Waiting for a second member's approval. Any member of this project other than {approver} can give it.") with the act "Give the second approval"; `filings.secondapproval.given` once given.
(4) `@communication` (upper doubt 12, option a): Start and send's step 4 names no template; it says to start from the group's template for this kind of action if it has one, or write it. The script is no longer withheld for want of a generic template.
(5) Five scripts, written for the library (required: false; adopted by BOB under wizard-scripts R22): "Comment for the group" (public comment, with "For the group" / "As myself" and positions pointed out), "Demand a correction" (the Tier 2 advisory, the window previewed, own-benefit asks rewritten), "Take an escalation to its next stage" (stages as questions; stop pursuing), "Refer it to an oversight body" (asks, never asserts; no reply owed; confidential where set; outcomes in the body's own terms), "Pick up a plan" (where it stands, the status report, take up an item). None places a template by handle; each says to start from the group's own template where it has one. "Get a record" is unchanged.
(6) Consequence dialogs (weight 3, protected words): stopping pursuit of an escalation, making an action confidential or not, carrying an outcome into a case, the second approval, a joint signatory.
(7) Reason fields kept out of writing help: all eight BOB lists (the override's reason, the "it only asks" words, the contradicted-send reason, the stop-pursuing reason, the scenario set-aside reason, the plan pause reason, the scope reasons, the harm-addressed statement), as every reason field already is (DEC-153).
decided: 2026-10-11 · the design session (P17)
reasoning recorded in: this entry; `screens/words-actions.src.py`, `screens/words-actions.json`; `screens/build_words.mjs`, `screens/words.json` (1,504 words, 550 protected); `screens/mock-acts.js`; `screens/mock-kit.js`; `screens/mock-screens.js` (Plan, Start and send, Action, Matter); `screens/registry.src.py`; `screens/library.src.py` (22 scripts); `layouts.html`.
owed: (BOB, T45) each key read by its module; the five scripts adopted under R22 and Start and send's re-pointed step; the owed acts re-pointed once served.

### DEC-195 · answered
amended: 2026-10-12 by DEC-196 (Bob): replaced whole; a handle is never reused. Nothing of DEC-195 stands, and its owed work is withdrawn.
raised: 2026-10-12 · the UX design session with Bob on his primary account (session_018JqYSTCQoQF5SPAXFQxvDD; the development process also runs on his primary account since K2511) (question S19, point 1, from BOB's B121 §Z1 on DEC-186)
for: bob
question: Whether another member may take a handle a member gave up (S19, point 1).
why it is Bob's: the meaning of his own ruling (DEC-186): what "formerly" promises members about who a name refers to (P17).
provisional: 1A, membership as built at T40 (R124: an earlier handle stays taken for every other member for good).
alternative: 1A, reserved for good; 1B, freed after a waiting period such as 90 days.
recommendation: 1A.
reversal cost: low; one clause of membership R124 and one word.
response: **Bob, 2026-10-12: "S19: No reuse for 5 years or more".** Ruled: (1) a handle a member gives up stays reserved for five years from the day they change it: it is taken for every other member (at joining, at a change and in the handle check, which still says only "taken"), and the member who gave it up may take it back; (2) after five years it is free for any member. The design session reads "or more" as the floor and uses five years. (3) Design's detail beneath it: once a reservation has ended, members see that earlier handle with the year it was given up, "formerly mai-k, until 2026" (`handle.formerly.until`), so two members' histories are never confused; while it is reserved, "formerly mai-k" as before. Point 2 of S19 (what makes a handle fixed: shown in a published case, 2A, or any work carried, 2B) stays open with Bob.
decided: 2026-10-12 · Bob
reasoning recorded in: this entry; `screens/question.html` (S19); `screens/mock-screens.js` (Your account's "Your handle"); `screens/mock-acts.js` (`handlechange`); `screens/build_words.mjs`, `screens/words.json` (`handle.formerly.until`); BIO_Interaction_Constructs_v0_1.md §V.
owed: (BOB) membership R124's "Earlier handles" clause: an earlier handle stays taken for every other member for five years from its change, then is free (R16, R124 and the handle check alike); R17's `formerly` entries carry the date each was given up, so the screen can show `handle.formerly.until` once the five years have passed.

### DEC-196 · answered
amended: 2026-10-12 by DEC-197 (Bob): with handles fixed at joining, S19's point 2 is settled too; this entry's "point 2 stays open" no longer holds.
raised: 2026-10-12 · the UX design session with Bob on his primary account (session_018JqYSTCQoQF5SPAXFQxvDD; the development process also runs on his primary account since K2511) (question S19, after DEC-195)
for: bob
question: Whether another member may take a handle a member gave up (S19, point 1), asked again after DEC-195.
why it is Bob's: the meaning of his own ruling (DEC-186): what "formerly" promises members about who a name refers to (P17).
provisional: DEC-195 (reserved five years, then free).
alternative: 1B, freed after a waiting period (DEC-195's five years).
recommendation: 1A.
reversal cost: none; membership as built at T40 (R124) already reserves earlier handles for good.
response: **Bob, 2026-10-12: "For S19: Handles just shouldn't ever be reused. There's too many risks of confusion if they every [ever] are. This is for both the first and second parts of S19."** Ruled: a handle a member gives up is never taken by another member (at joining, at a change, and in the handle check, which answers only "taken"); its holder may take it back. This is S19's 1A, as membership R124 is built; DEC-195 is replaced whole and `handle.formerly.until` withdrawn. Point 2 (when a member's own handle stops being changeable: when a published case shows it, 2A, or when any of their work is carried, 2B) is not a question of reuse, since under this ruling no handle passes to another member either way; it stays open with Bob, re-briefed in that light, and the development process keeps building on 2A.
decided: 2026-10-12 · Bob
reasoning recorded in: this entry; `screens/question.html` (S19); `screens/mock-screens.js` (Your account's "Your handle"); `screens/mock-acts.js` (`handlechange`); `screens/build_words.mjs`, `screens/words.json`; BIO_Interaction_Constructs_v0_1.md §V.
owed: (BOB) nothing new: N934 (DEC-195's change) is withdrawn; membership R124's "Earlier handles" clause stands as built.

### DEC-197 · answered
raised: 2026-10-12 · the UX design session with Bob on his primary account (session_018JqYSTCQoQF5SPAXFQxvDD; the development process also runs on his primary account since K2511) (question S19, point 2, after DEC-196)
for: bob
question: When a member's own handle stops being changeable (S19, point 2: when a published case shows it, 2A, or when any of their work is carried, 2B).
why it is Bob's: the meaning of his own ruling (DEC-186) and what Civicsmith must do (a requirement): how a member appears on the group's work (P17).
provisional: 2A, membership as built at T40 (R124).
alternative: 2A; 2B; or, as Bob chose, no change at all (S18's option A).
recommendation: 2A.
reversal cost: low; `handlechange` is served but no screen draws it.
response: **Bob, 2026-10-12: "Again, for the time being I think that members' handles should stay stable... Nobody can reuse a handle, and the same member can't just change their handle."** Ruled, for the time being: (1) a member's handle is chosen when they join and is never changed, by the member or anyone; this replaces DEC-186's rule (S18: B) and returns to S18's option A; (2) no handle is ever reused (DEC-196), including the handle of a member who has left; (3) with no change, there is no "formerly" and no moment a handle becomes fixed, so S19 is settled whole. Design's detail: joining's handle field says "Choose it with care: it can't be changed after you join, and no one else can ever take it"; Your account shows the handle without a change act ("Your handle is fixed: it names your work in the group and in published cases, and no one else can ever take it"); Members shows no "formerly"; the handle card says "chosen when you join and never changed". "For the time being": Bob may reopen changing a handle later; S18's brief and DEC-186 are kept for that.
decided: 2026-10-12 · Bob
reasoning recorded in: this entry; `screens/question.html` (S19, S18); `screens/page.src.html` (status, decided table); `screens/mock-screens.js` (joining, Members, Your account); `screens/mock-refs.js` (the handle card); `screens/registry.src.py` (Your account's acts: `handlechange` removed); `screens/build_words.mjs`, `screens/words.json` (`act.handlechange.label.account` removed; `handle.changeable`, `handle.formerly` and the `handle.refused.*` and `handle.fixed` keys kept while built code reads them); BIO_Interaction_Constructs_v0_1.md §V.
owed: (BOB) membership: retire R124 (`op=handlechange`: refuse every change, or remove the op and its door, op-declarations' and affordances' rows, ACT_HELP's copy; BOB's choice), and R17's `formerly` with it; confirm R16 keeps a departed member's handle taken. Once the op is retired, the design session removes `handle.changeable`, `handle.formerly`, `handle.fixed`, `handle.refused.notmember`, `handle.refused.unchecked`, and `handlechange`'s `ACT_HELP` and `WEIGHT` entries.

### DEC-198 · answered
amended: 2026-10-12 by DEC-199 (B154): `signing.openrequest.nowindow` replaced by whole sentences; four returned refusals re-worded.
raised: 2026-10-12 · the UX design session with Bob on his primary account (session_018JqYSTCQoQF5SPAXFQxvDD; the development process also runs on his primary account since K2511) (BOB's B149, T46's HANDOFF: `build/plan/current.md` on `tranche/T46`, "The channel"; `draft-T46-interface.md` §3, `draft-T46-trial.md`)
for: bob-session
question: T46's registry corrections and the words T46 owes: the sign-in refusals, the test-instance label, notice and parts, `DISCLOSURE_DUE`, the cards' "Here:" lines, the front doors, `HANDLE_FIXED`, the status report's assistant, a run on a member's own sign-in, the website key's and join link's settings read (N654), notice-producers' unkeyed sentences (N889), the unused `DRAFT_NEEDS_GRANT`, the library's stale `connect` step, and the screens' own sentences.
why it is Bob's: it is not: registry, words and screen detail beneath Bob's K2816 (the layouts page built as the real interface), K2892 (a member's own sign-in runs check and plan for that member), K2893 (Home after sign-in), D52 (K2407: one front door, "What happened?"), DEC-148, DEC-160, DEC-179 and DEC-197; decided by the design session (P17) and reported.
provisional: the drafts' interim meanings (`draft-T46-interface.md` §2.3 R5, `draft-T46-trial.md` §1.2, §3.2); the mockups' English at `0ceb3240af`.
alternative: keying every screen sentence now, ahead of the screen modules.
recommendation: as decided below.
reversal cost: low; words read by key, registry and library re-taken by wizard-scripts R13 and R22.
response: **Decided by the design session, 2026-10-12.**
(1) Registry: `capture`'s "Capture a file or photo" is `captureupload`; `connect` gains `subscriptiondisconnect` ("Disconnect your subscription") beside `accountreferenceremove` ("Disconnect your API key"), a subscription's code is sent by `subscriptionsignin` ("Connect with this code") and `accountreferenceset` connects an API key only; `answers`' "Ask" is `ask` (assistant only) and `ruleanswer` is "Show how this was counted", drawn with and without the assistant; `matter` gains `escalationreopen` ("Reopen where it stopped"); the owed acts re-pointed to their served names (`itemtakeup`, `actionscope`, `filingsecondapprove`, `escalationstoppursuing`, `infolevelset`, `subscriptionsignin`), with their `ACT_HELP` and `WEIGHT` keys. `handlechange` stays off every screen (DEC-197). `check_library.py` counts `ask`, `subscriptionsignin` and `infolevelset` as served through doors, as B149 states.
(2) The library's "Connect your Claude account": step 4 sends the code by `subscriptionsignin`; a step for an API key instead; the last step disconnects by `subscriptiondisconnect`, naming both.
(3) Words: 92 entries in `screens/words-t46.src.py`, read by `build_words.mjs` into `words.json`: the sign-in refusals (`refusal.NO_SIGNIN_WAITING`, `SIGNIN_REFUSED`, `SIGNIN_UNAVAILABLE`, `SIGNIN_ADDRESS_UNEXPECTED`, `AGENT_WORKER_UNBOUND`, `DISCLOSURE_DUE`; `ai.refused.signinabsent` for the runner not installed; `ai.refused.keptaway`, `noaccount`, `notdeployed`); the test instance (`ai.label.untested`, `instance.test.notice`, each part present, absent or unknown, `instance.scanner.absent.step`, `refusal.SCANNER_ABSENT`, `RENDERER_ABSENT`); `refusal.HANDLE_FIXED` and `handle.fixed` in DEC-197's words; the status report's assistant (`refusal.ASSISTANT_DRAFT_UNAVAILABLE`, `statusreport.assist.label`, `statusreportassist`'s help); a run on a member's own sign-in (`ai.run.ownsignin`, `refusal.MEMBER_RUN_MODE_NOT_ADMITTED` (K2920), the door op's help under its provisional name `airundispatch`); the website key's and join link's settings and history (`members.websitekey.*`, `members.joinlink.*`, `members.join.*`, `label.joinchange.*`); notice-producers' R5, R6, R13–R15 items (`queue.temporal-expectation-due.*`, `queue.inquiry-recheck-due.*`, `queue.policy-changed-noticed.*` in DEC-145 (5)'s exact sentence, `queue.scan-found.*`, `queue.security-tool-off.*`). `refusal.DRAFT_NEEDS_GRANT` is removed (no module mints it).
(4) The front doors (wizard-scripts R23 `doors`): Home's door is "What happened?" (canon BIO_Investigation §7, Bob's D52), replacing "What brought you here?"; by hand it offers five guided starts, each naming offered library scripts (`library.json` `doors`): a problem I live with (Your first question, Get a record, Check a claim); a person (Your first question, Follow the money, Build a timeline); a payment or contract (Follow the money, Get a record); something I read (Check a claim, Follow a proceeding, Use another group's case); a tip or documents (Check a claim, Build a timeline); words `door.front.*`, with existing work that matches and a blank start.
(5) The cards' "Here:" lines (DEC-160): a card says why a thing matters on this screen only from a relation the screen knows (`ref.here.*`, 26 patterns: waiting on you, held and why, set aside and by whom, cited for or against, the standard tested, a calculation's rerun or changed input, a check, testimony, a search match, an answer's source, a reply's next step, machine work, the doorbell, a newer version, a person not yet followed); with no known relation it draws no Here: line, never a generic one.
(6) The screens' own sentences are keyed by each screen module as it is built (`SCREEN_WORDS`, `screen.<id>.<part>`, K2854's T7), from the mockups' English at this PR's merge; the design session adopts them into `words.json` once those modules are on `main`, re-wording where needed, so no key is invented twice.
(7) (B150, K2917) Member-facing words name the instance "your group's Civicsmith" (membership R112, K1821): `refusal.PROJECT_GUARD_UNCHECKED`, `refusal.SUCCESS_CAUSE_UNCHECKABLE`, `signing.openrequest.unread`, `case.check.undetermined` and `ai.refused.limit.unjudged` re-worded so; `handle.refused.notmember` and `handle.refused.unchecked` dropped (membership no longer reads them, DEC-197).
(8) (B151, K2919) `transcribe.reason.requestfault` names "your group's Civicsmith" (DEC-149); `refusal.PROMISE_DATE_UNREAD` now matches duties R30, which refuses and writes nothing: "…so no duty was proposed. Nothing was written. Quote it in a note, or ask the body for a date and propose the duty from its answer."
decided: 2026-10-12 · the design session (P17)
reasoning recorded in: this entry; `screens/words-t46.src.py`, `screens/words-t46.json`; `screens/build_words.mjs`, `screens/words.json` (1,601 words, 567 protected); `screens/words-actions.src.py`; `screens/registry.src.py`, `screens/library.src.py`, `screens/check_library.py` (`registry.json`, `library.json` with `doors`); `screens/mock-screens.js` (Home, The assistant, Add, Ask, Matter); `screens/mock-acts.js`; `screens/mock-kit.js`; `screens/mock-journeys.js`; `screens/check_walk.mjs`; `layouts.html`.
owed: (BOB, T46) `registry.json` and `library.json` re-taken (wizard-scripts R13, R22, R23's `doors`); `words.json` re-taken (setup-words R1, R2) and each key read by its module (connect's sign-in refusals, the dock, setup-page R30, R31, R33, file-safety R42, plan-work's assistant arm, the door, membership's settings read, notice-producers R5, R6, R13–R15); the screen modules' `SCREEN_WORDS` rows sent (or left on `main`) for adoption.

### DEC-199 · answered
raised: 2026-10-12 · the UX design session with Bob on his primary account (session_018JqYSTCQoQF5SPAXFQxvDD; the development process also runs on his primary account since K2511) (BOB's B154, T46's hand-off; K2949, K2953, K2983, K2986; N962, N963)
for: bob-session
question: The sentences T46's jobs returned as untrue for one of their arms, a missing refusal, and help for T46's new reads; and B154's restatement of B149.
why it is Bob's: it is not: words beneath DEC-83 (a refusal says what happened, then what to do), DEC-149 and DEC-194; decided by the design session (P17) and reported.
provisional: the modules' own rows, kept in T46.
alternative: a distinct code for each arm (K231), BOB's to mint.
recommendation: one sentence true of every arm, as below.
reversal cost: low; words read by key.
response: **Decided by the design session, 2026-10-12.**
(1) Re-worded so each is true of every arm its code covers: `refusal.DOCKET_OUTCOME_UNREADABLE` (an outcome stated on another kind of entry included; "no later than the day it is filed"); `refusal.BAD_CARRIED_OUTCOME` (a field missing or malformed: one line, no quotation marks or backslash, at most 2,000 characters; "{field} is missing or isn't in that form"); `refusal.BEARING_REFUSED` (from 1 to 50 claims; `{item}` the item named); `refusal.DOCUMENT_FIRST_NO_REASON` (an absent or a malformed reason alike, N963).
(2) The sign step's open requests: `signing.openrequest.nowindow` (a fragment) is replaced by whole sentences, `signing.openrequest.nowindow.line` and `.nowindow.noreply`; and the sentence true whether or not a reply came, for a row with no claims laid out and `replied` true or absent (case-authoring R73), `signing.openrequest.notlaidout` and `.nowindow.notlaidout` ("no reply laid out claim by claim is recorded"). `signing.openrequest.unread` was re-worded by DEC-198 (7).
(3) Escalation (N962): `refusal.ESCALATION_BY_ACT_ONLY` names every act, stop pursuing and reopen included; `refusal.ALREADY_ATTACHED` new, naming no escalation.
(4) `refusal.SIGNIN_ADDRESS_UNEXPECTED` names "your group's Civicsmith" (DEC-149), as DEC-198 (7) did for others.
(5) Help: `clockproposals` and `joindoors` (`ACT_HELP`, read by affordances and op-declarations as their other rows are). `textcheck`'s was given under DEC-194.
(6) B154's other items are DEC-198's, now on `main` (PR #30): the registry corrections (`escalationreopen`, `infolevelset` re-pointed; `infolevel` is a read and no registry act), the assistant's and test instance's words, `refusal.HANDLE_FIXED`, `statusreportassist`, the member-run door, N889's sentences, `refusal.DRAFT_NEEDS_GRANT` dropped, the library's `connect` step, the front doors, the "Here:" lines, and the screens' own sentences (adopted from the modules' `SCREEN_WORDS` once they merge, DEC-198 (6)).
decided: 2026-10-12 · the design session (P17)
reasoning recorded in: this entry; `screens/words-actions.src.py`, `screens/words-t46.src.py`; `screens/mock-acts.js`; `screens/words.json` (1,608 words, 570 protected).
owed: (BOB) docket, case-authoring (R73's sentences, the no-window and not-laid-out rows by key), action-replies, action-plans (R47, C-124.63), escalation (C-116.41, C-116.14) read these by key once on `main`; affordances and op-declarations take the two helps.

### DEC-200 · answered
raised: 2026-10-12 · the UX design session with Bob on his primary account (session_018JqYSTCQoQF5SPAXFQxvDD; the development process also runs on his primary account since K2511) (BOB's B156 and B157, T47's opening and its L11 fold; K3027, K3041; N971, N976, N978, N984, N997)
for: bob-session
question: Words T47 returned as untrue (`attest`, `monitor`, the project's bar, the scanner's name), four registry corrections, and the refusals and help T47's new ops need.
why it is Bob's: it is not: words and registry detail beneath DEC-83, DEC-149, DEC-169 and Bob's rulings on evidence strength (DEC-72, DEC-17); decided by the design session (P17) and reported.
provisional: each module's own rows and interface-shell R28's re-points.
alternative: none needed.
recommendation: as decided below.
reversal cost: low; words read by key, registry re-taken.
response: **Decided by the design session, 2026-10-12.**
(1) `attest`'s help says what it is: an independent timestamp over the copy's fingerprint, adding no signature of the member's and saying nothing of whether the copy is true (N978).
(2) Watching: `monitor` checks once ("Check it now"; on a document "Check for a new version now"); `monitorset` turns watching on or off and sets how often ("Watch this address", "Watch for changes") on `capture` and `document` (N978, B157 1).
(3) Bars: the project screen's act is `projectbarset` ("Set this project's bar", reasoned; its help says it never changes the group's bar and holds nothing back); `strengthbarset`'s help names the group's bar, for the group settings screen that will draw it (N976, B157 2).
(4) `project` gains `drawquestion` ("Draw on a question from elsewhere") after `promote` (B157 3); `calculation` gains `spotcheckvisit` ("Count it for the drawn report") after `testify` ("Record what you saw at a report") (B157 4).
(5) One term for members: "file scanner" (the security screen: "a file scanner (ClamAV, which looks for viruses and other harmful code…)"); and "safe view", never "safe-view maker". file-safety R42's rows take these words (N971).
(6) Words (`screens/words-t47.src.py`): `refusal.MACHINE_CANNOT_SET_MONITORING`, `MONITOR_SET_REFUSED` ({field}), `PROJECT_BAR_NO_REASON`, `RENDER_QUEUE_UNREADABLE`, `SETTING_INVALID`, `SETTING_NOT_JSON`, `AI_RUN_CREDENTIAL_MALFORMED`; `ai.label.untested.writinghelp` (N984). Help (`mock-acts.js`): `monitorset`, `projectbarset`, `drawquestion`, `spotcheckvisit`, and the reads `projectquestions`, `projectlist`. T47's other new ops (sever and reinstate on a question's own leg, the set-aside list, a knock's source) take their help once their ops are named.
(7) `check_library.py` consults the newest `origin/tranche/T<n>` for acts `main` does not yet serve, marking each `onTranche`.
(8) N997, drawn: Settings › Places and offices (`places`: the places whose rules apply, `profilesset`; the place wanted, `placewanted`, with who set it and when; offices and seats with their origin, `officesseed` and `entitycreate`) and Settings › Recovery codes (`recovery`: the administrator's own codes held, how many unused and when issued, `recoverycodesstate`; `recoverycodesissue`, shown once, spending earlier codes; whether a second administrator holds codes, `adminrecoverystep`), both administrators only and linked from Members' new "More for administrators". The help screen (`help`) was already drawn and needs only its module. `monitorset` and `recoverycodesissue` weigh Reversible.
decided: 2026-10-12 · the design session (P17)
reasoning recorded in: this entry; `screens/registry.src.py`, `screens/mock-screens.js` (Add, Document, Project, Calculation, Security, Members, Places and offices, Recovery codes), `screens/mock-shell.js`, `screens/mock-refs.js`, `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/words-t47.src.py`, `screens/build_words.mjs`, `screens/words.json` (1,636 words, 580 protected), `screens/check_library.py`, `layouts.html`.
owed: (BOB, T47 or T48) `registry.json` (50 screens) and `words.json` re-taken; screens for `places` and `recovery` (N997); the new rows and helps read by key (monitoring, strength, file-safety, record-core, credentials, screens-settings, affordances, op-declarations); file-safety R42 re-worded to "file scanner" and "safe view".

### DEC-201 · answered
amended: 2026-10-12 by DEC-202 (Bob's answers K3060, K3061): the front door is the group's own page (D2); sign-in lasts as D3 rules; members hold recovery codes too (D4); the walk-through is offered to anyone (D7).
raised: 2026-10-12 · the UX design session with Bob on his primary account (session_018JqYSTCQoQF5SPAXFQxvDD; the development process also runs on his primary account since K2511) (BOB's B158 and B159; Bob's K3052, K3053; BOB's review K3051 and design audit `build/plan/draft-T47-design-audit.md`)
for: bob-session
question: The way into Civicsmith, drawn whole: the front door, signing in and out, an ended sign-in, a forgotten password, the founder's link and every installer step, the hand-over to setup, setup's recovery codes and finish, joining by invitation and by join link and a dead link, a new member's first visit, group settings, the Projects list, the Settings index, the outside reviewer's view, the update page, and the states for an address that can't be opened; then one walked journey from the founder's link to a new member's first work.
why it is Bob's: it is not: screens beneath Bob's K3052 (real users; no old interface; the top-level screen exactly right) and K3053 (the whole founder-to-member journey seamless), decided by the design session (P17) and reported. Five parts follow the recommendation of a question Bob has not yet answered on BOB's review page (K3059: https://claude.ai/artifact/PBPQJXA99HiP6UyKUhV24H) and change with his answer, named in (10).
provisional: none drawn; the old setup page and the installer's own page.
alternative: wait for Bob's answers before drawing.
recommendation: draw now on the recommendations, so building can start the day he answers.
reversal cost: low: mockups and words.
response: **Decided by the design session, 2026-10-12.**
(1) **The front door** (`front`, the group's address for anyone not signed in): the group's name and its public purpose; "Your handle" and "Password" (the founder's handle is admin, said in the field's help); "On this device: keep me signed in for 30 days, or sign me out when I close the browser"; "Sign in" (`login`); "Forgot your password?"; "Not a member yet? Members join by invitation…"; and for everyone, the group's published cases and "Hand material to the group" (the doorbell). States: refused, paused (with the time it ends), just signed out, and a sign-in that ended on its own (why, and that signing in returns to the page the member was on).
(2) **Forgotten password** (`forgot`): an administrator sets a new password with a recovery code (`recover`; refused in one sentence for every arm); a member asks an administrator for a reset link (Members gains "Make a reset link", `owed:passwordresetlink DEC-201`: one-time, seven days, sent by the administrator, ending the member's other sign-ins); if every administrator is locked out, the hosting account's holder sets a new one-time password.
(3) **Signing out**: Your account gains "Sign out on this device" (`signout`) and "Sign out everywhere" (`signouteverywhere`); the masthead menu's "Sign out" lands on the front door's signed-out state.
(4) **Create your group** (`install`, from the founder's link to the hand-over): the founder's link page ("Create your new Civicsmith group": what Civicsmith is, what you need, the permanent short name, the group's places); before Cloudflare (what Cloudflare will ask to allow, in plain words, and who controls the account); the progress, one plain line per step; a stop (one example, an account already holding a Civicsmith, and the others named: the free plan, no payment method, permission not granted, a log recording who opens which file), each saying nothing was created; finished (the checks, the one-time password shown once, the address, a probe key behind "most groups never need it", and "Continue to your group's Civicsmith: become its first administrator"). No member key (installer R16). Places are chosen here, as built (installer R21), and setup shows them as changeable.
(5) **Setup**: recovery codes shown once right after the claim (`recoverycodesissue`); a "Finished" step with "Open your group's Civicsmith"; "Administrators see spending by member" corrected to the key's use summed over members (DEC-188 (5)); "safe-copy maker" reworded.
(6) **Joining**: the reusable join link's first step (the name the group will know you by, `joinlinkinvite`); a dead link ("This link no longer works", one sentence for used, expired, withdrawn or switched off); "Already a member? Sign in"; after joining the member is signed in and Home opens.
(7) **Home**: a new member's first visit offers to continue the guided welcome (the wizard "Welcome a new member"); a new group's founder sees "Nothing is here yet" with inviting members and saying who the group is.
(8) **New screens**: Your group (`group`: name and logo, website, languages, the court notice, the hosting account's holder, the group's bar), Settings (`settings`, every setting in one list, the member's own then the group's), Projects (`projects`), Can't open this (`unavailable`: nothing here, not yours, out of reach and retrying), A review copy from outside (`review-outside`: what an outside reviewer sees, `reviewcomment`), and Update (`update`). Members links "More for administrators".
(9) **Journey 28**, "From the founder's link to a new member's first work", walked: link page, Cloudflare, progress, finished, claim, recovery codes, setup's finish, a new group's Home, Mai's invitation, joining, her first visit, her account, "What happened?", her first testimony, signing out on a shared computer, and signing in the next morning on her own phone. 474 steps walk clean across 28 journeys and 58 screens.
(10) **Following a recommendation of a question Bob has not yet answered** (BOB's page): the front door shows sign-in with the published cases and doorbell (A3); a member's lost password goes through an administrator's reset link (B1); a sign-in lasts 30 days on one's own device or ends with the browser (C2); the installer requires Workers Paid, as built (D1; it contradicts the earlier "the free plan works", now removed); the founder's link page is the installer's first page (E2); the welcome is offered on Home (Q1 A). Each changes with his answer.
(11) **Not yet drawn**: People (Q2, Bob's), the browser signing hand-over at publishing (Q4, Bob's), and joining while sign-in is paused (it says what the front door's paused state says). The journeys page (5 October, frozen on the secondary account) still says the free plan works and that a handle can change: republished from this account when it next changes.
(13) Empty states drawn: Queue with nothing waiting ("You are up to date"), Find with no results (what search covers and "Capture it"), and a new project with no questions (how to start one, or draw one in). Other screens' empty reads draw the kit's "Nothing here" until given their own.
(12) Words (`screens/words-t47.src.py`): `refusal.SIGN_IN_REFUSED`, `SIGN_IN_PAUSED` ({time}), `RECOVERY_REFUSED`, `NOT_SIGNED_IN`, `PASSWORD_TOO_SHORT`, `CURRENT_PASSWORD_WRONG`, `ALREADY_CLAIMED`, `NO_SUCH_INVITATION`, `NO_SUCH_JOIN_LINK`, `JOIN_LINK_DAILY_CAP`, `NO_COVER`; `session.signedout`, `session.ended`, `session.keep`, `session.shared`, `signin.founderhint`; help for `login`, `recover`, `signout`, `signouteverywhere`, `joinlinkinvite`, `owed:passwordresetlink`, and `bootstrap` re-worded.
decided: 2026-10-12 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (install, update, front, forgot, setup, join, home, members, account, group, settings, projects, unavailable, review-outside), `screens/mock-journeys.js` (journey 28), `screens/mock-shell.js`, `screens/mock-refs.js`, `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/registry.src.py` (58 screens), `screens/words-t47.src.py`, `screens/words.json` (1,690 words, 596 protected), `screens/page.src.html`, `layouts.html`.
owed: (BOB, T47's L11, N999, N1002, N1003, N1005) build the front door at `/` with sign-in, signing out and an ended sign-in, the forgotten password, the installer's pages as drawn, the hand-over into setup, setup's codes and finish, joining's states, Home's first-visit and new-group states, and the eight new screens; a requirement and op for the member's reset link (`owed:passwordresetlink`, once Bob answers B); sign-in length per Bob's C; registry.json and words.json re-taken.

### DEC-202 · answered
raised: 2026-10-12 · the UX design session with Bob on his primary account (session_018JqYSTCQoQF5SPAXFQxvDD; the development process also runs on his primary account since K2511) (Bob's answers to BOB's D1–D15, K3060 and K3061, folded into DEC-201's drawings)
amended: 2026-10-13 by DEC-203: (5)'s People is drawn as BOB decided it (D8, K3061).
for: bob-session
question: How Bob's answers of 12 October change the way in drawn by DEC-201.
why it is Bob's: the rulings are his (K3060, K3061, given through BOB, cited here, not ruled again); the drawing beneath them is the design session's (P17).
provisional: DEC-201 (10)'s recommendations.
alternative: none.
recommendation: as below.
reversal cost: low: mockups and words.
response: **Bob's rulings through BOB (K3060, K3061), drawn by the design session, 2026-10-12.**
(1) D2: the front door (`front`, now "Your group's page") presents as the group's own page, not Civicsmith's: the group's logo and name as a masthead, its purpose, what it has published (with each case's edition, date, signer and one line), "Have something for us?" (the doorbell), "How we work" (with the walk-through), and members' sign-in as a panel beside them; "Lakeshore Tenants uses Civicsmith" at the foot.
(2) D3: "This device is: my own (keep me signed in; it locks after 30 minutes away, you sign in again after 12 hours) or shared or public (signed out after 15 minutes away)". New state: locked ("Welcome back, Mai… Enter your password to go on where you were; nothing was lost", "Unlock"); the ended state says the member was signed out after a while away. Words `session.keep`, `session.shared`, `session.ended` re-worded; `session.locked`, `session.reauth` new (signing or publishing a case, changing administrators and connecting Claude always ask for the password again).
(3) D4 (B3): every member holds recovery codes, ten, shown once on joining; Recovery codes is each member's own screen (Settings › Yours); Forgot your password offers a code to anyone, then an administrator's reset link for one without codes.
(4) D7: "See how it works, step by step" on the group's page offers the walk-through to anyone, before joining or being invited; Home's first-visit offer stays for members.
(5) Not yet drawn, for the successor on the secondary account (HANDOFF §0): People as BOB decided (D8); the founding journey from civicsmith.org (D6) and the signing ceremony from the principles (D9), both after the refresh.
decided: 2026-10-12 · Bob (K3060, K3061), drawn by the design session
reasoning recorded in: this entry; `screens/mock-screens.js` (front, forgot, recovery, join, settings, members), `screens/page.src.html`, `screens/registry.src.py`, `screens/mock-shell.js`, `screens/mock-refs.js`, `screens/words-t47.src.py`, `screens/words.json` (1,692 words, 597 protected), `layouts.html`.
owed: (BOB) the group's page at `/` as drawn; sessions per D3 (idle sign-out, lock, re-asking the password for the four acts); recovery codes for every member at joining (credentials R46 widened beyond administrators) and the member's reset link (`owed:passwordresetlink`); the walk-through reachable before joining.

### DEC-203 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (BOB's decision under Bob's delegation, D8, K3061; N1008)
for: bob-session
question: What a member sees on People, drawn as BOB decided it under Bob's delegation.
why it is Bob's: it is not: Bob delegated D8 ("What do you think members should see when they click on the People group? Do that."), BOB decided its content (K3061), and the drawing beneath it is the design session's (P17), reported as done.
provisional: interface-shell R29 (T47): People opens Find over the people and organisation kinds.
alternative: R29 as written, a search with no list until the member types.
recommendation: as K3061 decided: a directory a member can scan before knowing a name.
reversal cost: low: a mockup and its words.
response: **Decided by BOB under Bob's delegation (K3061), drawn by the design session, 2026-10-13.**
(1) **People** (`people`, the rail's People and the phone's More): "The people and organisations your group's record follows: officials, staff, companies and public bodies", saying in the same sentence that the group's own members are not listed and are under Settings › Members (a link). Offices are not rows: an office is a post, shown as the role on its holder's row and as a filter.
(2) **Search and filters** (all `search`, with `type` set to the person and organisation kinds): a search box ("Name or office": a name, a name they are also known by, or an office), then four filters in one row (two on a phone): Show (people and organisations, people, organisations); Holding an office in (any body, or one body); Named in (any project, your projects, or one project); Named recently (at any time, the last 30 or 90 days, the last year: named in something the group added in that time).
(3) **Order**: "In your projects" first (named in the documents or questions of a project the member works on), then "Everyone else the record follows"; within each, the newest added first. A line above says how many the record follows and how many are in the member's projects, and what each row counts.
(4) **Each row**: the kind's mark (a person or an organisation); the name, which opens their page (`person`) and whose card says who they are; who they are today (role and office, or for an organisation what it is); "named in 14 documents, 2 questions and 1 project · newest added 2 October" (counting only what the member may see; "in no question or project yet" when so); and "Explore connections" (`explore`), starting from them. The person's own page gains the same "Explore connections".
(5) **Adding**: "Add someone the record follows" (`entitycreate`: the name, person or organisation, and the member's note on who they are and why the group follows them).
(6) **Empty states**: a record that follows no one yet ("A person or organisation comes in one of two ways: a member ties a name in a captured document to them, on the document under 'People it names', or adds them here with a note…", with "Add someone the record follows" and "Capture a document"); and a search that finds no one ("No one the record follows matches 'Alvarez'… Someone appears here only once your group follows them", with adding and "Look for 'Alvarez' in documents", which opens Find).
(7) **Journeys**: journey 10 now finds L. Chen on People before opening his page; journey 13 starts "Explore connections" from J. Ortega's row on People. 476 steps walk clean across 28 journeys and 59 screens.
decided: 2026-10-13 · BOB under Bob's delegation (K3061), drawn by the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (people, person), `screens/mock-journeys.js` (journeys 10 and 13), `screens/mock-shell.js`, `screens/mock-refs.js`, `screens/registry.src.py` (59 screens), `screens/words.json` (1,698 words, 601 protected), `layouts.html`.
owed: (BOB, L11, N1008) People built as drawn, replacing interface-shell R29: a read answering the people and organisations the record follows with, per row, who they are today, the counts of documents, questions and projects naming them among those the viewer may see, and when the newest was added, ordered the member's projects first and newest added first, with the four filters; "Explore connections" on each row and on the person's page; `entitycreate` for a person or organisation from People; the two empty states; registry.json and words.json re-taken.

### DEC-204 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (Bob's direction in chat, 13 October)
for: bob-session
question: Where the journeys page's material lives, now that Bob reviews only Civicsmith Screens.
why it is Bob's: the direction is his ("The material in the Journey's document should be integrated into the comprehensive CivicSmith Screens that has been the working document for the UX design … Once integrated, I'm not going to refer to the Journeys document."); how it is folded is the design session's (P17, DEC-137's journey organisation).
provisional: two pages, the journeys page (step 3) and the screens page (step 5).
alternative: none.
recommendation: as below.
reversal cost: low: one page's sections.
response: **Bob, 2026-10-13: "The material in the Journey's document should be integrated into the comprehensive CivicSmith Screens that has been the working document for the UX design. https://claude.ai/artifact/4FjPjGmCVppDnMYfM7xkCw … Once integrated, I'm not going to refer to the Journeys document."** Folded by the design session:
(1) **The working page** is https://claude.ai/artifact/4FjPjGmCVppDnMYfM7xkCw (built from `layouts.html`); the copy published earlier the same day (https://claude.ai/artifact/ExhZXk6f9DD7kXyWWj3NyP) now only points to it.
(2) **New section "Who the screens are for"**, before section 1: who we design for (the three rings, what is folded in, newsrooms as a core audience, every ring's readers in other languages and on phones, kinds of group), the wide path's eight rules, and where members start (problems they live with, the other ways in, what it means for the design), updated where later rulings overtook it: publishing at a set time (DEC-147), Home's "What happened?" (DEC-198), the assistant on a member's own account or the group's key (K1755).
(3) **Each journey in the viewer** shows its purpose and front door under its title, beside who takes it; journeys 1, 6, 10, 13 and 17's front doors are updated (the installer from the founder's link, "What happened?", People, the group's key), and journey 28 gains its own. The walked steps are the journey's steps; the journeys page's step lists are not carried, so no two lists compete.
(4) **"What the journeys can't do yet"** beside the journeys: the five gaps still open by ruling or stage (places not held, DEC-151; plain-words reading of a rule; public registers and outside alerts; the assistant proposing people, events and money; sharing packs). Gaps since closed are dropped.
(5) **Section 6** lists step 3's questions J1 to J13, all answered (DEC-128 to DEC-137); and its Home row now says "What happened?".
(6) **Not carried:** each journey card's "what changed", "built now" and "still to come" (a record of 5–6 October against T33, overtaken by the tranches since); the seventeen wizard outlines (the wizard library holds each wizard written in full, DEC-148).
(7) **The journeys page** (https://claude.ai/artifact/SbK4jAc8ZptpE9swYMkF1R, `journeys.html`) opens with a note that it is folded into Civicsmith Screens and no longer updated.
decided: 2026-10-13 · Bob's direction, folded by the design session (P17)
reasoning recorded in: this entry; `screens/page.src.html` (section "Who the screens are for", the viewer's journey brief, the gaps, section 6), `screens/mock-journeys.js` (`JBRIEF`), `screens/mock-refs.js`, `layouts.html`, `journeys.html`.
owed: nothing to BOB: the page's reading sections build nothing; the build reads `registry.json`, `library.json` and `words.json`, unchanged by this entry.

### DEC-205 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (BOB's B162, from its way-in draft, K3064)
for: bob-session
question: Five drawing points BOB raised against DEC-201 and DEC-202.
why it is Bob's: it is not: screen detail beneath Bob's K3052, K3053, K3060 and K3061, decided by the design session (P17) and reported.
provisional: DEC-201 and DEC-202 as drawn.
alternative: none.
recommendation: as below.
reversal cost: low: mockups and words.
response: **Decided by the design session, 2026-10-13.**
(1) **A group's languages are their own act** on Your group (`group`): "Save the languages" (`owed:grouplanguagesset DEC-205`, the name BOB may change when it serves it): sets the languages the group's members use, leaving the places unchanged; `profilesset` stays setup's act for places and languages together.
(2) **The logo**: "Change the logo" (`owed:grouplogoset DEC-205`, BOB's `grouplogoset`), beside "Save the name"; help: it replaces the logo beside the group's name on its page, its masthead and its published cases; a logo is optional.
(3) **`hostingaccessset`**, not the read `hostingaccess`, on `setup`, `group` and the wizard "Set up and claim" (step 14); its help and weight re-keyed.
(4) **`recover`'s help** says it serves any member: "Sets a new password with one of your recovery codes, for any member. The code is spent, and every other sign-in of yours ends." (DEC-202 (3)).
(5) **Two new screens.** `reset`, "Choose a new password": the administrator's one-time reset link opens it for one member (who made it, for whom, until when); "Set my new password" (`owed:passwordreset DEC-205`); the handle and work kept, every other sign-in ended, recovery codes still working; states: set ("Sign in"), and a link used, expired or withdrawn ("Ask an administrator for a new one. Nothing was changed."). `tour`, "How we work, step by step": the walk-through for anyone from the group's page (Bob's D7), six steps (what we look into; every finding shows its source; how strong the evidence is; what we publish and who signs it; have something for us?; taking part), Back, Next and "Stop here" back to the group's page, no account and nothing recorded; the group's page's "See how it works, step by step" now opens it, where it opened Home. People (B161) is DEC-203.
decided: 2026-10-13 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (group, setup, tour, reset, front), `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/mock-refs.js`, `screens/mock-shell.js`, `screens/registry.src.py` (61 screens), `screens/library.src.py`, `screens/words.json` (1,707 words, 603 protected), `layouts.html`.
owed: (BOB, L11) the ops `grouplanguagesset` (or BOB's name), `grouplogoset` and the member's act on a reset link (`passwordreset`, or BOB's name), then the buttons re-pointed from their `owed:` names; the screens `tour` and `reset` built as drawn; registry.json, library.json and words.json re-taken.

### DEC-206 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (Bob's D6, K3060; BOB's B161 (3))
for: bob-session
question: The founding journey, starting on civicsmith.org.
why it is Bob's: the ruling is his (D6: "The founding journey should now start on the website we need to develop at civicsmith.org"); the drawing beneath it is the design session's (P17).
provisional: DEC-201 (4): the founder's link page as the installer's first page (E2).
alternative: keep the installer's first page as the founder's start.
recommendation: as below.
reversal cost: low: two screens and a journey's first steps.
response: **Bob's D6 (K3060), drawn by the design session, 2026-10-13.**
(1) **civicsmith.org** (`site`), Civicsmith's own site, kept by its stewards: "Hold your government to its own word" over installer R42's two lines, exactly; "Start your group" and "See groups at work"; what a group gets (its own Civicsmith in a Cloudflare account it controls, nobody else holding its work; findings anyone can check; wizards for people who have never done this, the assistant optional; free software, Cloudflare's $5 a month the only cost); one group's published case, opened as any reader does; "Already a member?" (members sign in at their own group's address; civicsmith.org holds no accounts); questions to the stewards' address (a marked placeholder until Bob gives it, D14).
(2) **"Start your group"**: whether Civicsmith fits; what is needed (Workers Paid with a payment method, an account belonging to the group, twenty minutes, no Claude account); decide first who holds the Cloudflare account (and add a second trusted person); what the group will choose, in the installer and then in setup; "Create your group" opens the installer.
(3) **"Groups at work"**: the groups that chose to be listed (DEC-132's choice of the network directory), each with its place, purpose and published cases, linking to the group's own page; a group kept to its members is not listed.
(4) **The installer's first page** (`install`) now asks only its two choices (short name, places), with "What you need, on civicsmith.org"; what Civicsmith is and what is needed moved to the site, so neither page repeats the other.
(5) **Journey 28** is now "From civicsmith.org to a new member's first work" (two new first steps: the site, then "Start your group"); journeys 1 and 28 name civicsmith.org as their front door. 480 steps walk clean across 28 journeys and 62 screens.
decided: 2026-10-13 · Bob (D6, K3060), drawn by the design session
reasoning recorded in: this entry; `screens/mock-screens.js` (site, install), `screens/mock-journeys.js` (journey 28, JBRIEF), `screens/mock-shell.js`, `screens/mock-refs.js`, `screens/registry.src.py` (62 screens), `screens/words.json` (1,709 words), `layouts.html`.
owed: (BOB) civicsmith.org built as drawn (a static site the stewards keep, holding no accounts), with "Create your group" opening the installer; the groups listed only from the network directory's opt-in (DEC-132); the stewards' address once Bob gives it (D14; installer R48); the installer's first page reduced to its two choices; registry.json and words.json re-taken.

### DEC-207 · answered
amended: 2026-10-13 by DEC-208 (BOB's B164, what the signing service provides): one sitting for all of a case's signatures, drawn on S21's recommendation A; labels follow the acts.
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (Bob's D9, K3060; BOB's Q4, N1006; B161 (4))
for: bob-session
question: The signing ceremony and its related questions, worked out from the principles: where signing happens in the new interface (Q4: paste-back through `/sign`, or a signer inside the interface), how the member proves it is them, and what happens without a key, on a phone, or for a member who is not an owner.
why it is Bob's: the direction is his (D9: "The signing ceremony is a key journey… Answering this and other related questions is a piece of the work you need to be completed (based on principles)"); the answers are the design session's, from the principles, reported as done (P17).
provisional: the ceremony's single "Sign with your key" button beside "Publish at…" and "Publish now"; Q4 open.
alternative: paste-back through `/sign` (signatures R30, R31): the member copies a statement to a separate page, signs there and pastes the signature back.
recommendation: as below. Paste-back fails principle 4.1 (the tool fades) and K3052's real-users test.
reversal cost: low: the ceremony's last step and its words.
response: **Bob's D9 (K3060), worked out from the principles by the design session, 2026-10-13.**
(1) **Signing happens inside the ceremony** (Q4: the in-interface signer), never on a separate page or by pasting a signature back (principle 4.1).
(2) **One choice of when, one button.** "When it becomes public" (now, or a set time); then "Sign and publish at 6:00 on 19 November" (`publishat`) or "Sign and publish now" (`caseratify`): both sign the same statement (ratification R39). The three buttons drawn before ("Sign", "Publish at", "Publish now") are gone.
(3) **The act says what it does** (4.4, 4.5, 9.3): outward mark; "You sign as Dev, an owner of The Coliseum lease. The public page will read 'Published by Lakeshore Tenants · signed by Dev'. Once public, anyone can read it and check your signature without asking the group; it can be corrected by a new edition, never removed."
(4) **Proving it is you** (1.5, 1.6; D3; K509 (2)): the password asked again in the dialog (`session.reauth`); then the member's own device confirms the use of the signing key (passphrase, fingerprint or device PIN), the key never leaving the device and Civicsmith never seeing it. A cancelled or failed confirmation signs and publishes nothing, and returns to the last step unchanged (`signing.ceremony.declined`).
(5) **After signing:** signed and waiting ("Move the time", `publishatmove`; "Cancel publishing", `publishatcancel`), or signed and published (open the public page).
(6) **No key in this browser** (ratification R18's `NO_ATTESTING_KEY`): "Register a signing key in this browser" (`signerregisterown`) as a side trip from the step, returning to it with nothing lost; a key on another computer can sign from there.
(7) **On a phone** (8.6): everything reads; signing and publishing finish on a larger screen, where the ceremony is where the member left it.
(8) **A member who is not an owner** (`CASE_SIGNER_NOT_AN_OWNER`): names the owners who can sign; what was prepared stays; "Ask an owner to sign" (`owed:signrequest DEC-207`) puts it ready in the owners' queues.
(9) **Ties:** every member who signs confirms their own (case-disclosures R27), said beside the confirmation.
(10) Words (`screens/words-t47.src.py`, protected): `signing.ceremony.who`, `.device`, `.declined`, `.signedat`, `.signednow`, `.nokey`, `.notowner`, `.phone`. The wizard "Publication ceremony"'s last two steps re-worded to match.
decided: 2026-10-13 · Bob's direction (D9), worked out by the design session from the principles
reasoning recorded in: this entry; `screens/mock-screens.js` (ceremony), `screens/library.src.py`, `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/mock-shell.js`, `screens/registry.src.py`, `screens/words-t47.src.py`, `screens/words.json` (1,724 words, 615 protected), `screens/page.src.html`, `layouts.html`.
owed: (BOB, T47-63 or later) the ceremony's last step as drawn: the in-interface signer with the browser-held key (credentials R9; membership's note on the browser-held key), the password re-asked (D3), the device's confirmation, the two buttons, the signed and published states, the side trip to register a key, the phone and not-an-owner states; the op `signrequest` (or BOB's name) putting a prepared edition in the owners' queues; registry.json, library.json and words.json re-taken. BOB may send what the signing service provides (B161 (4)); a difference from this drawing comes back as an entry.

### DEC-208 · answered
amended: 2026-10-13 by DEC-210 (BOB's K3079): the key stays on the device only when the member chooses "Keep this key on this device".
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (BOB's B164: what the signing service provides, `build/plan/draft-signing-service.md` on `tranche/T47`; Bob's D9, K3060, K3075)
for: bob-session
question: How the ceremony of DEC-207 meets what signing provides today: a case needs 1 + one per finding + one per piece of evidence signatures (ratification R4, R5); `publish` only prepares (with the tie attestation, T47-32) while `caseratify` signs and publishes; the key is a blob today, the on-device key not yet built. And one question that is Bob's (S21): whether one confirmation may cover all of a case's signatures, given his ruling that each use of the key is confirmed (K509 (2)).
why it is Bob's: S21 asks the meaning of his ruling K509 (2); the rest is the design session's (P17).
provisional: DEC-207 as drawn (one signature shown).
alternative: S21's B (a confirmation per signature) or C (fewer signatures, a doctrine change BOB would bring).
recommendation: S21: A, one confirmation for the ceremony, signing exactly the listed statements and nothing else.
reversal cost: low: the ceremony's last step and two words.
response: **Bob, 2026-10-13, through the development process: "S21 A" (K3080, cited here, not ruled again): one confirmation of the member's own device key signs, in one ceremony, exactly the listed statements, each its own signature. The rest decided by the design session, 2026-10-13.**
(1) **One sitting.** The sign step says "One confirmation signs all 8: the edition, its 2 findings, and the 5 pieces of evidence they rest on", with "What your key signs, exactly": each statement line (`bio-ratify-case CASE-2026-0012 2 3b9f…c210`, `bio-ratify FND-… …`, one per piece of evidence), built from the same statements that are signed. The device's window names the 8; the signed state lists the edition, the findings and the evidence as signed, each drawn only on its answer (screens-publish R10).
(2) **Labels follow the acts** (B164 gap 5): `publish` is "Confirm your ties and prepare the edition for signing" (the Ties step gains "Confirm, and prepare Edition 2 for signing", recording the confirmation inside the edition); `caseratify` "Sign and publish now"; `publishat` "Sign now and publish at a set time". One signer per edition (as today); the note says the member who signs confirms their ties, the confirmation part of what they sign.
(3) **Where the key comes from:** made on the device inside the interface (K509 (2)) and kept there across visits; "Use a key file you already have" for a key from the signer page; no hand-off to `/sign`. Keeping a non-extractable key across visits is BOB's to rule against screens-publish R11 (B164 §5).
(4) **A lost key:** withdrawn under Settings › Your account and a new one made in the ceremony; cases it already signed can still be checked (credentials R10).
(5) **S21** briefed on the page's section 7 (issue, example, options A, B, C, recommendation A and its risk, "S21: A/B/C"); the page's status says one question is open. S20 stays reserved for the dashboards.
decided: 2026-10-13 · Bob (S21: A, K3080) and the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (ceremony), `screens/registry.src.py`, `screens/library.src.py`, `screens/mock-acts.js`, `screens/question.html`, `screens/page.src.html`, `layouts.html`.
owed: (BOB) the in-interface signer signing the edition, each finding and each piece of evidence under one confirmation (on S21: A; otherwise as Bob answers); the statements shown before signing; the key made and kept on the device (BOB's ruling on screens-publish R11), a key file accepted; the labels as above; registry.json and library.json re-taken.

### DEC-209 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (Bob's D13, K3060: "research the CPRA's requirements and NextRequest together, to generate the template"; N858, N1008)
for: bob-session
question: The records-request template, from the California Public Records Act's requirements and how Oakland's NextRequest portal handles a request.
why it is Bob's: the direction is his (D13); the research and the drawing are the design session's (P17). Offering the template to members waits on the template process (filing-templates R15: a named writer, sources, a professional review), which is BOB's.
provisional: the request screen's placeholder text ("Under the public records act named in your group's profile…").
alternative: none.
recommendation: as below.
reversal cost: low: a template, a screen's fields and a help page.
response: **Researched and drawn by the design session, 2026-10-13.**
(1) **What the law requires** (Government Code, FindLaw, current as of 1 January 2026): an answer within 10 days, with the reasons and when records will be ready (§ 7922.535(a)); longer only by written notice, for listed unusual circumstances, never more than 14 days (§ 7922.535(b), (c)); help to focus a request (§ 7922.600); the reasonably segregable rest released (§ 7922.525(b)); a refusal in writing naming who decided (§ 7922.540); electronic records electronically, in a format kept (§ 7922.570); only the direct cost of duplication (§ 7922.530(a)), of producing the copy for electronic records unless data must be compiled, extracted or programmed (§ 7922.575), and photographing with one's own equipment free (§ 7922.530(b)); no limit because of a request's purpose (§ 7921.300). Oakland's Immediate Disclosure Request: three business days (Oakland Municipal Code § 2.20.230, as the group's places measured it in T33).
(2) **What the portal does** (oaklandca.nextrequest.com, read 13 October 2026): requests go through a form (description, attachments, department, optional contact details); each request's page shows its full text to anyone, with its dates, department and the city's point of contact; the page read did not show the requester's name, which the design does not promise; without contact details there are no updates and the records can be collected only if posted publicly or by contacting the department; past releases are searchable (118,632 requests listed).
(3) **The template** (the request screen, `request`): addressed to the office; the CPRA named with its citation; the records, the period and the form asked for; electronic format (§ 7922.570); release the rest and refuse in writing naming who decided (§§ 7922.525(b), 7922.540); help us focus it (§ 7922.600); the 10-day answer (§ 7922.535); tell us first above a cost limit, the direct-cost rule for electronic copies (§ 7922.575); signed by the member for the group. It asks for records, never the reason: "Describe the records, not why you want them. The law doesn't let the office limit access because of why you ask (§ 7921.300), and the city's portal shows this text to anyone." The request screen gains the period, the form and the cost limit as fields filling the template.
(4) **Sending through the portal:** "How to send it" (Make request; paste the approved text; choose the department; contact details optional, with what is lost without them; note the request number); the outward warning widened: the portal shows the request's text to anyone, so whatever it says about the group's work becomes public; the portal's request number recorded with the sending.
(5) **A help page**, "How a records request works" (`help-records`), from the request screen: what the office must do, the faster request in Oakland, the city's portal, and what Civicsmith does with the due date; its sources listed.
(6) The Immediate Disclosure Request template is the same text headed "Immediate Disclosure Request", citing Oakland Municipal Code § 2.20.230 and asking for the answer within three business days; whether the ordinance requires that heading was not confirmed from its text, and is the professional review's to check.
decided: 2026-10-13 · Bob's direction (D13), researched and drawn by the design session
reasoning recorded in: this entry; `screens/mock-screens.js` (request, help-records), `screens/mock-kit.js`, `screens/mock-refs.js`, `screens/mock-shell.js`, `screens/registry.src.py` (63 screens), `screens/words.json` (1,726 words), `layouts.html`.
owed: (BOB, N858) the two templates ("Records request" and "Records request with immediate disclosure") into the California and Oakland profiles under the template process (filing-templates R15: a named writer, the sources above, a professional review before any member is offered them), with the period, form and cost-limit fields; the portal's request number recorded with the sending (`filingrecordsent`); the channel's words (the portal shows the text to anyone) on the profile's NextRequest venue; the help page from the profile's facts; registry.json and words.json re-taken.

### DEC-210 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (BOB's B165, K3079)
for: bob-session
question: How a member's signing key is kept, now that BOB allows a non-extractable key to persist in the member's browser only when she chooses it (screens-publish R11 amended, K3079).
why it is Bob's: it is not: BOB's ruling on its own requirement, drawn by the design session (P17).
provisional: DEC-208 (3): the key kept on the device across visits.
alternative: none.
recommendation: as below.
reversal cost: low: one choice and one word.
response: **Drawn by the design session, 2026-10-13.** The ceremony's "no signing key in this browser" step offers, before "Register a signing key in this browser", the member's own choice: "Keep this key on this device, so you can sign here again without loading it. Leave this unticked on a computer others use: you then load your key file each time you sign." (`signing.ceremony.keepkey`, protected); unticked, the key is saved as a key file protected by a passphrase the member chooses, and "Use a key file you already have" loads it. The served op is `signerregisterown` (K3079 (6)), as the registry already names it.
decided: 2026-10-13 · the design session (P17), on BOB's K3079
reasoning recorded in: this entry; `screens/mock-screens.js` (ceremony), `screens/words-t47.src.py`, `screens/words.json` (1,727 words, 616 protected), `layouts.html`.
owed: (BOB) the choice as drawn, the key persisted only when ticked; words.json re-taken.

### DEC-211 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (BOB's B167 after Bob's K3082)
for: bob-session
question: May the design session ring BOB's session (a one-time routine into it) when it posts something BOB must act on, against its standing rule of never messaging the development process's sessions?
why it is Bob's: it changes his own standing rule for this session.
provisional: outbox only; BOB reads it at its own checks.
alternative: outbox only.
recommendation: allow a content-free "check the channel" ring only, the entry itself staying on the mail branch.
reversal cost: none.
response: **Bob, 2026-10-13: "yes, you can ring BOB - when you and BOB are both running under the same account. But sometimes you're running under different accounts. So pay attention."** Recorded: the design session rings BOB's session when it posts an entry BOB must act on, only while both run under the same account. The test, each time: BOB's current session id (its latest outbox entry or Writer line) resolves with `get_session` from this session; if it does not, they are on different accounts, and the outbox alone carries the entry. The ring is a one-time routine into BOB's session (`create_trigger`, `persistent_session_id` BOB's, `run_once_at` a minute ahead) whose only words are "MAIL from UX-DESIGN: check the channel: U<n>."; it carries no content and no instruction beyond reading the channel. Everything else of the standing rule holds: never start, steer or message BOB's or its jobs' sessions otherwise.
decided: 2026-10-13 · Bob
reasoning recorded in: this entry; HANDOFF §0.
owed: (BOB) nothing to build; BOB records the ruling as it records K3082's.

### DEC-212 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (Bob's question: "Are all UX design tasks defined so far completed at this point?")
for: bob-session
question: The design work still owed from earlier handoffs, found in answering Bob: the reminder for a wizard draft left unsent (K1364; journeys page journey 19, step 9; HANDOFF §4's list of 6 October), and two loose ends in the mockups' sample data.
why it is Bob's: it is not: detail beneath K1364 and the wide path's sixth rule (DEC-129), decided by the design session (P17).
provisional: undrawn; the sample data inconsistent.
alternative: none.
recommendation: as below.
reversal cost: low.
response: **Decided by the design session, 2026-10-13.**
(1) **A request left unsent** (K1364; wide path rule 6, "their unfinished work listed where they will see it"): Your queue, under its project, a Status item: "You left a records request unsent: inspection logs for pothole reports closed in FY2025 · Get a record · approved on 9 October, not yet sent · nothing has gone to the office", with "Pick up where you left off" (opens the request at its step), "Keep it for later" (`queuesnooze`) and "Drop the request, with a reason" (`actionmove` to `abandoned`, actions R7's resolutions; nothing was sent, so the office never sees it). The queue now lists 10 items.
(2) **Edition 2's date:** the published case read "published 14 November" while the ceremony scheduled the same edition for 19 November; every page now says it was published on 19 November, at the time Dev set when signing.
(3) **The work orders' grade:** two cards said capture A where the record and the calculation say B; both now say B ("captured by Dev from the city's open-data portal").
(4) **Checked and not a loose end:** "Ben" is the group's sixth member (Lakeshore Tenants has 6 members); the queue's dates read consistently.
decided: 2026-10-13 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (queue, site, published), `screens/mock-refs.js`, `screens/mock-shell.js`, `screens/registry.src.py`, `screens/words.json` (1,728 words), `layouts.html`.
owed: (BOB) the queue's item for an action prepared through a wizard and left unsent (a producer naming the wizard, the step and the date), with its three acts; registry.json and words.json re-taken.

### DEC-213 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (BOB's B168, from its review of T47's L11 fold)
for: bob-session
question: Four points from BOB's fold review: the wizard "Set up and claim"'s first step; the installer's first page while civicsmith.org does not serve; the setup page's surfaces with no screen; the wizard's runner and the walk-through op.
why it is Bob's: it is not: detail beneath Bob's D5, D6 and K509, decided by the design session (P17).
provisional: as BOB's review describes.
alternative: none.
recommendation: as below.
reversal cost: low.
response: **Decided by the design session, 2026-10-13.**
(1) "Set up and claim", step 1, corrected: "Check you have what is needed: a Cloudflare account on the Workers Paid plan ($5 a month, with a payment method) and about twenty minutes." Why: "Civicsmith uses parts of Cloudflare that only the paid plan includes. No Claude account is needed to set up." (Bob's D5; installer R6.)
(2) The installer's first page while civicsmith.org is not online (installer R23 kept): drawn as its own state, the two choices with "What you need" in one block (Workers Paid with a payment method, an account belonging to the group, twenty minutes, no Claude account); once civicsmith.org serves, the block gives way to the link (DEC-206 (4)). Acceptable as BOB proposes.
(3) The setup page's surfaces with no screen: the intake form and the bundle history need none (Add, the doorbell and each document's page serve them); an administrator registering a key for a member (`signeradd`) stays undrawn, since a member's key is made only by that member on their own device (K509 (2)); an administrator withdrawing a member's key (`signerset`, credentials R7) is drawn on Members: "Withdraw Teo's signing key", for a lost or stolen device, the key stopping at once and what it signed still checkable.
(4) Confirmed: "Set up and claim" has no runner in the setup frame (the setup screen's parts are its steps; the wizard is offered by the installer's hand-over), and `tour` is static, so the way-in draft's `walkthrough` op is not needed.
(5) Served ops re-pointed (B163; K3079): `grouplanguagesset`, `grouplogoset`, `passwordreset`, `signrequest` lose their `owed:` names; `passwordresetlink` and `projectaikeepaway` stay owed until declared.
decided: 2026-10-13 · the design session (P17)
reasoning recorded in: this entry; `screens/library.src.py`, `screens/mock-screens.js` (install, members), `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/registry.src.py`, `screens/words.json` (1,730 words, 618 protected), `layouts.html`.
owed: (BOB) the installer's interim block until civicsmith.org serves; `signerset` on Members as drawn; library.json, registry.json and words.json re-taken.

### DEC-214 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01Hcg5e3ZdVsyLUxGwEcZsPS; the design work moved to the secondary account by K3060 D1) (Bob's direction in chat, 13 October: the plumb bob as reassurance on every screen; more visual elements that convey status, size, activity and next steps; mockups of dashboard treatments and arrangements, his direction of 11 October, K2803)
for: bob-session
question: (1) Whether Civicsmith's working screens show a small plumb bob so a member knows they are in a known place. (2) What visual elements the screens gain to convey meaning, status, purpose and interest at a glance. (3) Whether enough is known to draw the dashboards as treatments to compare, and the drawings.
why it is Bob's: (1) and (2) are his direction, drawn as design detail beneath DEC-138 and principle 9.3 and reported (P17); (3)'s choice of arrangement stays his (S20, after he has used the test instance); the treatments are drawn so he can compare on real screens.
provisional: the group's name alone in the masthead; lists without measures; Home and the queue as drawn by DEC-198 and DEC-201.
alternative: (1) no mark (the group's name alone, principle 9.3 read strictly); (2) charts in place of the elements below.
recommendation: as below.
reversal cost: low: mockups and a masthead element.
response: **Bob's direction, drawn by the design session, 2026-10-13.**
(1) **The mark.** Every working screen's masthead opens with a small plumb bob (20 px, in the accent) before the group's name; its explanation: "the plumb bob is Civicsmith's mark. Wherever you see it, you are in your group's own Civicsmith, and the name beside it says whose." The group still leads (9.3): the mark is small and quiet, and the public frame keeps its credit line.
(2) **What reads at a glance**, each drawn once in the visual language (one hue per scale, a word beside every colour, thin marks, nothing explained twice): a **reading** (a label, a number, its change over a named period in words, optionally eight weeks of bars); **activity** as eight weeks of bars in the stage hue, the newest week darker, with the word the bars say (busy, steady, quiet); **the people** on something as initials (at most four, then the count); a project's **stage** as its ladder; **the next steps** in a context as a numbered path, the one to take now marked, each step the act itself; **the story so far** as a timeline in brief, what they did above the line and what we did below it, undated things never placed, "Open the timeline" beside it; **the status strip**, at most four readings that cross areas and can't wait, each opening its list, the same on every screen, one chip on a phone.
(3) **The Projects table** (`projects`) gains those columns: stage, members, activity over eight weeks, last change, with a line under each project's name.
(4) **Dashboards drawn as treatments for S20**, on the research's rules (three tiers: status, what needs you, everything else; whose move it is on every action item; the five-second and three-step tests): `dash-home`, Home in three arrangements as states, C ("what needs you" as the home with the strip, needs the group, the record at a glance, the projects, the five areas one step away), A (one home with a card per area, no status elsewhere), B (an area dashboard under the strip with no home, the rail becoming the areas); `dash-action` (clocks running, our move, their move, replies to read; needs you; every action with whose move it is and its clock as a sentence); `dash-project` (the next steps here, the project at a glance, the story so far, who works on it and how busy it is). A new section of the screens page, "Dashboards: first treatments, to compare", shows the five with "Open in the viewer".
(5) Not decided here: the arrangement (S20, Bob's, after the test instance; the recommendation stays C with the strip kept to four readings); whether Publication is its own area and the email digest (S20's side questions).
decided: 2026-10-13 · Bob's direction, drawn by the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (spark, people, tile, strip, nextpath, tlstrip; projects, dash-home, dash-action, dash-project), `screens/mock-shell.js` (the mark), `screens/mock-refs.js`, `screens/registry.src.py` (66 screens), `screens/page.src.html` (the elements' styles, the section), `screens/words.json` (1,749 words, 631 protected), `layouts.html`.
owed: (BOB) nothing until S20 is answered, except the mark in the working masthead (interface-shell's masthead; the visual language's components when BOB folds it) and the Projects table's columns (project-roster: members, acts per week over eight weeks, last change); the dashboards' reads follow S20.
amended: 2026-10-13 · DEC-216 (Bob's direction of the evening: the home is a nerve centre, complete; the rail stays on every dashboard): the treatments A and B as first drawn in (4) are withdrawn and the three are redrawn as three orders of one complete home; the "areas" grid of doors is gone.

### DEC-215 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk; the design work on the secondary account by K3060 D1) (Bob's direction in chat late on 13 October, to the predecessor session_01Hcg5e3ZdVsyLUxGwEcZsPS and handed on in HANDOFF §0: use and cost over time on the assistant's panels; a graph members click to make a thing central and follow its ties, with colours for the kinds of connection "if done well")
for: bob-session
question: (1) How an AI account's use and cost over time are shown on its panel. (2) How connections are drawn as a graph a member reads and clicks, on Explore connections, a person's page and a money trail: the kinds, their colours and line styles, the lead, the limit, re-centring.
why it is Bob's: his direction, drawn as design detail beneath DEC-138 (the visual language), DEC-188 (the panels) and his rulings K1469, K1486 and K1487 (connections, their words, what exploring may pass through), and reported (P17).
provisional: a month table alone on each panel (DEC-188); chains as rows on Explore connections; no graph anywhere.
alternative: (1) a line per use, or a cost per answer (never: K1450). (2) a force-directed graph every node of which can be dragged; colour alone for the kinds; five coloured kinds (the first candidates, in blue, amber, teal, purple and pink, failed the colour-blindness check and took reserved hues: blue is capture's and the stage ladder's, amber testimony's, pink sits by connection's and the identity ladder's).
recommendation: as below.
reversal cost: low: mockups, and three tokens in the visual language.
response: **Bob's direction, drawn by the design session, 2026-10-13.**
(1) **Use and cost over time**, on every AI account panel (Members, for the group's key; AI for this project; The assistant, for the member's own use): beside the month table, the last thirty days as bars of estimated dollars a day, one series in the stage hue (as every activity bar since DEC-214), the newest day darker, each bar's date, calls and dollars on hover, focus or tap, the first and last day under the run, and one line summing the thirty days and naming the busiest day; and a meter of the period's use against the limit (this month for the group's key and a project's account, with a project's exploring allowance beside its overall limit; today for a member's two daily limits, their share of the group's key and their own account), accent until four fifths of the limit and rust from there, with a mark at four fifths; "no limit" where none is set. Every number is computed from one series per account (the month's bars sum to the table's total; calls follow the dollars), summed over everyone the account serves, naming no one (K1450). The words are `ai.usage.*` in `words.json`.
(2) **The connection graph**, one component (`graph()` in `mock-screens.js`, inline SVG): the centre in the middle, what the record joins it to around it, and one ring further out; each line in its kind's colour **and** line style, with the step's word on it and its connection grade as the letter in the scale's chip (a same-person claim carries the subject-match chip); a legend under the graph, always shown, each entry explaining its kind. The kinds: Position or membership (ink, solid); Took part (cyan, dotted); Money (violet, a double line like a ledger's rule, the amount on it); Mentioned together (pink, dash-dot); Same person? (thin ink with an equals sign); Declared or hunch (muted grey, dashed, "a lead", at the lowest grade, K1487). Where exploring stopped, the thing carries a dashed ring and "stopped at the limit", and its card says what lies beyond is undetermined, not absent (K1469). Clicking a thing, or pressing Enter on it, makes it the centre and adds it to the trail above the graph ("J. Ortega → Bayline Properties"); a trail entry walks back. Things are drawn by kind: a circle for a person, a rounded box for an office, organisation or fund, a document shape, a diamond for a payment, a dashed circle for what the source does not state. It sits on Explore connections above the chains (from J. Ortega); on a person's page as "Connections", first (L. Chen, with "Explore connections" beside it; the section's card says why no money line is drawn); and on the money trail (Sewer Fund 3100; amounts, stage and date on the lines; "Not stated" for the payee the report does not give; Ana's hunch as a lead). On a phone the canvas keeps its size and scrolls sideways.
(3) **The kinds' colours** are three new tokens of the visual language, reserved for the kinds and nothing else (`kind-money` #773AC1 light, #A473FF dark; `kind-part` #0092C3, #007BAA; `kind-mention` #DF407F, #D5305F), apart from every scale's, ladder's and state's hue (DEC-138 rule 1), each at least 3:1 on the surface in both themes (`check_contrast.py`). They pass the dataviz validator in both themes on every pair, not only adjacent ones (light: the worst pair under simulated colour blindness ΔE 12.9, in normal vision 22.7; dark: 12.9 and 21.6). No set of four or five hues could pass while staying apart from the reserved hues (blue, magenta, amber, olive, verdigris, rust, the ladders' blue, green and rose, the origins' indigo and grey), so three kinds carry colour, structure is drawn in ink and leads in grey, and colour is never the only signal (principle 8.2): every kind has its own line style and its word. The colours were found by search over the hue circle against the reserved hues, then validated, not picked by eye.
decided: 2026-10-13 · Bob's direction, drawn by the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (USAGE_WORDS, aiDays, usageBars, meter, aiUsage; KINDS, GRAPH_WORDS, NODE_KIND, GRAPHS, graphInner, graph, CS_GRAPH; the three panels; explore, person, money), `screens/page.src.html` (the styles; the section's note), `visual-language/palette.json` and `civicsmith.css` (the tokens and their graphic pairs), `screens/build_words.mjs` (4i), `screens/words.json` (1,786 words, 650 protected), `layouts.html`.
owed: (BOB) when the panels and these screens are built: ai-accounts' use read per day over thirty days and per period against each limit, summed, naming no member; a connections read answering a centre's neighbours two rings out, each step with its kind, word, grade and citation, and where the limit stopped (the exploration read of K1469); the three tokens when the visual language is folded. Nothing before the screens' tranche.

### DEC-216 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk) (Bob's direction in chat on the evening of 13 October, reviewing the dashboards page: "The home dashboard needs to be a real home, not just a set of buttons to the other dashboards. It has to have a nerve-center like completeness"; "The dashboard screens should have the rail like all the other screens, though it might be collapsed")
for: bob-session
question: What every dashboard treatment must have before S20 chooses among them: whether the home is complete in itself, and whether the rail stays.
why it is Bob's: his direction on UX; the arrangement stays his to choose (S20, after the test instance); the drawing is design detail (P17).
provisional: DEC-214 (4): A as five cards that were doors to the areas; B as no home, the rail replaced by the areas; C with "the areas" as a grid of doors.
alternative: keep A and B as first drawn among the choices.
recommendation: as below.
reversal cost: low: mockups and the research page.
response: **Bob's direction, drawn by the design session, 2026-10-13.** Two rules for every treatment. (1) **The home is a nerve centre**, complete in itself: what needs you; what needs the group; every area's state (a chip saying what needs you there, two to four readings, a line of what changed, the area's name opening its dashboard); the projects table; and what members did since you last looked. An area's dashboard is one step away for the detail; nothing is found only by going there. (2) **Every dashboard keeps the rail** every other screen has; where a dashboard wants the room, the rail collapses to icons, as any member can already make it (DEC-155); it never becomes the list of areas. So the three arrangements are three orders of the same complete home, drawn as states of `dash-home`: C (recommended to try first), what needs you first, then each area at a glance; A, each area first, complete, with what needs you inside it, each item with its act; B, the instrument panel, ten readings in the same places every day (a zero still shows), then the lists, under the collapsed rail. The first drawings of A (cards as doors) and B (no home) are withdrawn, and the "areas" grid of doors is gone; the strip (DEC-214) stays on every one; Needs you now carries the letter to approve. The dashboards page says the same under "Your two points of 13 October, evening", its sketches, table and recommendation redrawn. S20 stays open for Bob after the test instance: which order a member meets first.
decided: 2026-10-13 · Bob's direction, drawn by the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (AREA_TIPS, ablock, abitem, AREA_ROWS, AREA_BLOCKS, RECENT, CLUSTER, dash-home), `screens/page.src.html` (the styles; the dashboards section's captions and intro), `screens/registry.src.py` (dash-home), `dashboards.html`, `layouts.html`.
owed: (BOB) nothing until S20 is answered; the home's reads follow it.

### DEC-217 · answered
raised: 2026-10-13 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk) (BOB #168's HANDOFF B172, from its audit of L11 against PR #33, K3137: three registry points for the design stream)
for: bob-session
question: (1) Which op the locked state's "Unlock" on the group's page is. (2) How the reader's link for a review copy is drawn and worded. (3) Whether `projectaikeepaway` still carries its owed mark.
why it is Bob's: registry housekeeping under his rulings (DEC-201's way in, D3; journey 21's review copy; DEC-188's keep-away), decided as design detail and reported (P17).
provisional: `front`'s locked state used `login`; the review-copy screen named the readers but never showed the link; `owed:projectaikeepaway DEC-188` on AI for this project.
alternative: leave `login` and let interface-shell re-point it; show the link once per reader row.
recommendation: as below.
reversal cost: low: registry rows and one section.
response: **Answered to BOB, 2026-10-13 (U203).** (1) The locked state's "Unlock" is the op `unlock` (credentials R71), listed on `front` beside `login`; its explanation: it unlocks this device with the password after it locked while the member was away and takes them back to where they were; a wrong password counts as a refused sign-in. (2) The reader's link is drawn once on `review-copy`, in its own section after "Share with a named reader": `https://<the group's address>/app/review#grant=<secret>` for the reader just named, "works until 20 October, or until you stop sharing", and, in bold, "Civicsmith sends no email: copy the link and send it to her yourself", with a plain "Copy the link" control; its card says it opens the draft as it stands for that reader, that anyone holding it can read so it goes to that reader only, and that it carries a secret, not the reader's name, so it works only while the sharing stands (screens-publish R2). (3) `projectaikeepaway` is declared and served (op-declarations R41): the owed mark is off, the button on AI for this project carries the served op, and `check_library.py` reads it as served by name, as it reads `ask`, `subscriptionsignin` and `infolevelset`. The only act still owed is `passwordresetlink` (DEC-201).
decided: 2026-10-13 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/registry.src.py` (`front`, `projectai`), `screens/mock-screens.js` (`front`'s locked state; `review-copy`; `projectai`), `screens/mock-acts.js` (`unlock`, `projectaikeepaway`), `screens/mock-kit.js`, `screens/check_library.py`, `screens/page.src.html` (`.mk-readerlink`), `screens/words.json` (1,788 words, 651 protected), `layouts.html`.
owed: (BOB) nothing new: interface-shell R38's re-point of `unlock` can stand down once the registry row is read; screens-publish R2 draws the link as here.

### DEC-218 · answered
raised: 2026-10-14 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk) (question S20, the home's arrangement, after the three treatments of DEC-214 and DEC-216; Bob opened it himself in chat on 14 October, before using the test instance: "I like arrangement C. Is it possible to support all 3, selectable by the member?")
for: bob-session
question: Which arrangement of the complete home members meet, and whether a member may choose among the three.
why it is Bob's: UX: the first screen of every day, and whether the group shares one picture of itself (P17).
provisional: three treatments drawn as states of one screen (DEC-214 (4), DEC-216); the recommendation C with the strip kept to four readings.
alternative: B: C as the default and a member may choose A or B (three homes to keep coherent and to explain; members of one group see different homes). C: C for everyone plus one switch showing the instrument panel's ten readings above what needs you.
recommendation: A: one home for everyone, arrangement C, the member's choice held in reserve: a group talks about its home and one shared picture helps that; the choice can be added later at no reversal cost, since the three are the same blocks in three orders.
reversal cost: low: a per-member setting beside the explanation level, kept per member and device as the rail's width is (DEC-155), if the test instance shows members missing another order.
response: "Okay, one home for everyone, arrangement C" (Bob, 2026-10-14, to the brief in chat: S20: A). Folded: the Home screen (`home`) is arrangement C for everyone: the strip, what needs you, what needs the group, each area at a glance (what needs you in it, two to four readings, a line of what changed, the area's name opening its dashboard), the projects, what changed since you last looked, and "What happened?", the door to a first step (DEC-198); a new member's first visit keeps its guided welcome above the same home, and a new group's home shows every block in its written empty state, each naming the first step that fills it. The treatments screen is retired (65 screens); the areas-first and instrument-panel arrangements are set aside on the dashboards page as the comparison that was made; every dashboard keeps the rail (DEC-216). The side questions stay Bob's, when he wants them: an email digest of what needs a member; whether Publication is its own area.
decided: 2026-10-14 · Bob (S20: A)
reasoning recorded in: this entry; the dashboards page (`dashboards.html`, decided); `screens/mock-screens.js` (`home`, `AREA_BLOCKS`, `AREA_BLOCKS_EMPTY`, `RECENT`, `STRIP`, `NEEDS_YOU`, `NEEDS_GROUP`), `screens/registry.src.py` (`home`), `screens/mock-refs.js`, `screens/mock-shell.js`, `screens/page.src.html` (the section, decided), `layouts.html`.
owed: (BOB) the home's reads, for the screens tranche: what needs the member and what needs the group (the queue's items by kind and whose move, with their acts); each area's readings (documents, questions and the bar, people followed; clocks running and whose move; cases, editions, drafts shared, waiting to sign; members, administrators, invitations, expertise; the release, the security level, the places and languages, the group's key's use against its limit); what members did since the viewer last looked. DEC-216's folding (K3127's N1028 note) now has its answer.

### DEC-219 · answered
raised: 2026-10-14 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk) (the dashboards page's two side questions, put to Bob with S20's recording, and his direction on the Home's empty states, all answered in chat on 14 October)
for: bob-session
question: (1) Whether Civicsmith emails members a digest of what needs them. (2) Whether Publication is its own area. (3) What a member with little going on sees on the Home.
why it is Bob's: (1) what Civicsmith does outside the app, policy; (2) the areas, UX structure he set on 11 October (K2803); (3) UX direction, drawn as design detail (P17).
provisional: (1) left open by the research (an email digest "would be yours to decide"); (2) five areas, Publication added by the design session's reading of "and so forth"; (3) DEC-218's new-group home showed every block in a written empty state, with readings at zero.
alternative: (1) a daily or weekly digest; (2) five areas; (3) empty blocks that say what fills them.
recommendation: none offered on (1) and (2) beyond the research; (3) as drawn in DEC-218.
reversal cost: low.
response: "No, CivicSmith does NOT email members." "Is Publication its own area? I didn't initially list it as one, but an earlier UX session added it. I'd say no." "A new member that doesn't yet have much going on in the system should see a fairly empty Home, right? I mean, there's no reason to include a tile that lists the number of actions if that number is zero, the number of projects they've joined if it's zero, and so on." (Bob, 2026-10-14.) Folded: (1) **Civicsmith sends no email to members**, ever: no digest; what needs a member waits on the home, and a reminder exists only because a member asked for it (principle 1.3). The screens already say "Civicsmith sends no email" wherever a link is handed over. (2) **Four areas**: Investigation, Action, Members, Administration. A case's state (in review, waiting to be signed, published) sits under Investigation, as what an investigation produces; the Publication block is gone from the home and the dashboards page's table and models say four. (3) **The home never shows a reading at zero or a block with nothing in it** (`rd` and `ablock` return nothing for them): on the busy home "0 waiting to sign" is gone; a new member's first visit shows the welcome, the group's strip (its items only, none the member's), what needs the group, the areas at a glance, the projects, and the door, with no "Needs you" and no "Since you last looked"; a new group's home shows that it is ready, its first steps, and "What happened?", nothing else.
decided: 2026-10-14 · Bob
reasoning recorded in: this entry; `dashboards.html`; `screens/mock-screens.js` (`rd`, `ablock`, `AREA_TIPS`, `AREA_GO`, `AREA_BLOCKS`, `STRIP_NEW`, `home`), `screens/page.src.html`, `screens/question.html` (S20, S22), `layouts.html`.
owed: (BOB) nothing new beyond DEC-218's reads: no digest to build; the home's reads leave out zeros; the areas are four wherever a requirement counts them.

### DEC-220 · answered
raised: 2026-10-14 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk) (BOB #168's HANDOFFs B174, K3143, and B175, K3144: words L11's jobs need, and the installer's "Run the checks again")
for: bob-session
question: (1) The keyed words for the request left unsent (DEC-212). (2) The people read's help text. (3) The words of the refusal when a sign-in trace is asked of a group's Civicsmith that is not a test instance. (4) Whether `hostingaccess` is retired. (5) What the installer's finished panel does about running the checks again.
why it is Bob's: words and registry detail beneath his rulings (DEC-212, DEC-203, DEC-201), decided as design detail and reported (P17).
provisional: the jobs' interim sentences (B174); `selftest` listed and drawn on `install` (DEC-201).
alternative: keep "Run the checks again" and have the copy serve it to the installer after hand-over (B175 says it cannot).
recommendation: as below.
reversal cost: low.
response: **Answered to BOB, 2026-10-14 (U206).** (1) `queue.request-unsent.summary` "You left a request unsent: {what}" (to the member who approved it), `queue.request-unsent.summary.others` "A request was left unsent: {what}", `queue.request-unsent.detail` "Approved on {date}, not yet sent: nothing has gone to the office."; {what} names the request as the wizard named it; the queue draws it as DEC-212 drew it. (2) `peopledirectory`: "Lists the people and organisations your group's record follows: each with its role or office, how many documents, questions and projects name it and when the newest was added, those your projects touch first. A read: it changes nothing." (3) `refusal.SIGNINTRACE_NOT_TEST`: "This group's Civicsmith keeps a trace of sign-ins only while it runs as a test instance, and this one does not. Nothing was read or changed." (4) `hostingaccess` is not in the registry: retired, `hostingaccessset` on Your group is the act (DEC-205). (5) "Run the checks again" is dropped from the installer's finished panel, the registry, journey 28 and the wizard "Set up and claim" (its step says the copy tests itself as part of installing): the installer keeps nothing of the copy once it hands over, so the checks are the installation's own, shown once with their results. If the copy serves its checks to administrators, the place for "Run Civicsmith's checks" is Security; drawn when BOB says the copy serves it.
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/build_words.mjs` (4c''''), `screens/mock-acts.js`, `screens/words-t47.src.py`, `screens/registry.src.py` (`install`), `screens/library.src.py`, `screens/mock-journeys.js`, `screens/mock-screens.js` (`install`), `screens/words.json`, `layouts.html`.
owed: (BOB) nothing new: the keys are read from `words.json`; wizard-scripts R36 adopts the newest "Set up and claim".

### DEC-221 · answered
raised: 2026-10-14 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk) (Bob's comment on the working page, 14 October, on civicsmith.org's opening: "There's no mention of laws or court decisions. Neighborhood is spelled wrong. The second sentence doesn't say anything.")
for: bob-session
question: (1) What civicsmith.org's opening says Civicsmith is for. (2) Which English Civicsmith's own words are written in. (3) What the opening's second sentence says.
why it is Bob's: the public face's first words (brand and voice, DEC-125; the site, DEC-206) and the voice's spelling, never ruled before; (1) and (3) drawn as design detail under his comment (P17).
provisional: "Free software for groups that check whether government keeps its own rules and promises." and "Neighbourhood and issue groups, newsrooms, professional associations, and public offices checking their own work."; British spellings in most of the member words (organisation, colour, centre, labelled, licence, grey), American in some.
alternative: keep British English (no group of Civicsmith's is British; the mix was never chosen).
recommendation: as below.
reversal cost: low: words only.
response: Bob's comment, folded. (1) The opening now names what a government's own word is: "Free software for groups that check whether a government keeps its own word: the laws it passed, the court decisions that bind it, the rules it set itself, the promises it made." The same sentence serves the credit line's card and the wordmark's, so no two explanations compete. (2) **Civicsmith's own words are American English.** The member-facing sources (the mockups, the registry, the wizard library, the word lists, the screens page, the visual language and the dashboards page) were swept once: organization, organize, recognize, summarize, authorize, color, favor, behavior, honor, neighbor, center, license, judgment, gray, labeled, canceled, modeled, traveling, analyze, practice, defense, program; the word keys in `words.json` follow (for example `connection.graph.center.means`). The design-phase documents (principles, brand and voice, the folded journeys) keep their text as approved; new text in them is American. (3) The second sentence now says who the groups are and what they do: "A neighborhood group, a newsroom, a professional association or an office checking its own work: capture the records, ask the questions, grade the evidence, and publish a case anyone can check without taking your word for it."
decided: 2026-10-14 · Bob (his comment), drawn by the design session
reasoning recorded in: this entry; `screens/mock-screens.js` (SITE_LINE1, SITE_LINE2), `screens/mock-shell.js` (the credit and wordmark cards), the swept sources, `screens/words.json`, `layouts.html`.
owed: (BOB) the swept words reach the jobs by key at the next merge of this branch into the tranche (affordances' `ACT_HELP` and setup-words' counts are re-taken then, K3143); nothing else.
amended: 2026-10-14 · Bob's three further comments on the site, the same night: "all laws", not only those the government passed (the opening and the credit line now say "the laws it must obey"); "its own copy of Civicsmith", said so; and a section "What Civicsmith is" at the top of the site, before "What a group gets", defining the words the site uses (the record, a question, evidence, a finding, a case, the assistant), so no term appears before its meaning.

### DEC-222 · answered
raised: 2026-10-14 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk) (BOB #168's B177, K3148: the help page's purpose names a place; and B178, K3149: the escalation screen's stage names differ from the code's)
for: bob-session
question: (1) How the records-request help page's purpose is worded in the registry. (2) Which names and order the escalation ladder's stages carry.
why it is Bob's: (1) wording beneath wizard-scripts R20 and interface-shell R23 (the interface names no place in outward text), decided as design detail (P17); (2) Bob's Design Requirement 7 as he amended it on 26 September names the seven stages; the screen must follow it.
provisional: the purpose named the California Public Records Act and Oakland's faster request; the ladder named stages 4 to 7 "Public, Formal, Political, Legal".
alternative: keep the design's four names and ask Bob to amend the requirement.
recommendation: as below.
reversal cost: low: words.
response: **Answered to BOB, 2026-10-14 (U208).** (1) The purpose now reads "What your state's public records law requires of the office, your city's faster request where it has one, what the city's portal shows, and what Civicsmith does with a request; the place's own facts come from the group's places." The page's body keeps Oakland's facts as sample data drawn from the places, as DEC-209 drew it. (2) The code is right and the design was wrong: Design Requirement 7 names the seven stages Discovery and Documentation, Notification, Clock Starts, Response Evaluation, Escalation to Legal Tools, Sustained Attention, Political Accountability, in that order; the escalation screen's ladder now reads "1 Documentation, 2 Notification, 3 Clock starts, 4 Response evaluation, 5 Legal tools, 6 Sustained attention, 7 Political accountability". The names "Public, Formal, Political, Legal" came from no ruling and are withdrawn.
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/registry.src.py` (`help-records`), `screens/mock-screens.js` (the escalation ladder), `screens/words.json`, `layouts.html`.
owed: (BOB) nothing: the stage names on the screen follow escalation's own terms.

### DEC-223 · answered
raised: 2026-10-14 · the UX design session with Bob on his secondary account (session_01DyYKz1UJZVqVzz1E8F4Cyk) (Bob in chat, 14 October: civicsmith.org "seems that there are 3 different versions. Which do users see first and how are they connected? Is there a tab users select from?"; and "the sentence structure of all 3 pages is rather sloppy. It needs to be written for the audience, which is primarily people who don't know what Civicsmith is", and for "a group member who's already decided that it's time that they create a copy for themselves")
for: bob-session
question: How civicsmith.org's pages are joined and what each says, for its reader.
why it is Bob's: the public face's words and structure (DEC-125, DEC-206); drawn as design detail under his direction (P17).
provisional: three states of one screen with no menu between them, reading as three versions; text that named terms before defining them and spoke to no particular reader.
alternative: one long page.
recommendation: as below.
reversal cost: low: words and one menu.
response: **Bob's direction, drawn by the design session, 2026-10-14.** civicsmith.org is one website of three pages, joined by one menu at the top of every page (What Civicsmith is · Start a group · Groups at work, the current page marked), the front page first; its two buttons lead to the other two, and the menu leads anywhere. Each page is written for its reader. **The front page**, for someone who has never heard of Civicsmith: what it is in two sentences (free software for a group that wants to know whether its government is doing what it must: the laws that bind it, the court decisions it is subject to, its own rules, its promises); how a group uses it, in five steps that define each word as it is first needed (gather the records, ask a question, weigh the evidence, reach a finding, publish a case); what a group gets; what Civicsmith does not do (no side on policy, no legal advice, nothing published unsigned, no email); one group's published case; where members sign in; where to write. **Start a group**, for a member who has decided: whether it fits and what it is not for; what is needed (a Cloudflare account on Workers Paid, twenty minutes, nothing else, no technical knowledge); who should hold the Cloudflare account and why it matters; what happens step by step, from the short name and places to inviting members; what it costs and to whom; then "Create your group". **Groups at work**: the groups that chose to be listed. The mockup's control now says "the page of civicsmith.org" so the three read as pages, not versions.
decided: 2026-10-14 · Bob's direction, drawn by the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`site`, SITE_LINE1, SITE_LINE2), `screens/page.src.html` (`.mk-sitenav`), `screens/registry.src.py` (`site`), `layouts.html`.
owed: (BOB) nothing: the site is Bob's DNS and a Left-out row (N1011); installer R42's two lines follow SITE_LINE1 and SITE_LINE2 when it is built.

### DEC-224 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_013WPLBoMoEqgg3wdk3KMaPa; given to UX design #11, session_01DyYKz1UJZVqVzz1E8F4Cyk, in chat at 01:10 UTC: "the cursor changes to a question mark whenever there's mouseover info. The cursor shouldn't change like that. Not in Civicsmith, and not on the civicsmith.org website or anywhere else.")
for: bob-session
question: Whether the pointer may change over an element that explains itself on hover.
why it is Bob's: UX: a rule of the visual language (DEC-138) beneath his rulings on explanations (DEC-129 rule 4, DEC-159, DEC-161).
provisional: `cursor: help` (the question mark) on every element carrying an explanation (`[data-tip]`, the grade chip, the masthead's plumb bob, the usage bars, the trail's key, the graph's edges and legend, the reader's link) and on the measures map's marks and bars; `cursor: pointer` (the hand) on a name that opens a card.
alternative: keep the question mark as the hint that there is something to hover.
recommendation: none needed: Bob's direction.
reversal cost: low: one stylesheet rule and nine others.
response: **Bob's direction, 2026-10-14.** The cursor never announces an explanation. No help or hand cursor on a mark, a name or any element that explains itself on hover, in Civicsmith, on civicsmith.org or on any design page; the cursor changes only over a control (a button, a link, a node in the connection graph, a resize grip). An explanation still opens on hover, on focus and on tap, as DEC-159 and DEC-161 say; the dotted underline stays the sign that a name opens a card.
decided: 2026-10-14 · Bob's direction, recorded by the design session (P17)
reasoning recorded in: this entry; `visual-language/components.css` (the explanations block's rule; `.cs-grade`, `[data-tip]`, `.cs-card`), `visual-language/civicsmith.css`, `visual-language/page.src.html` (Explanations; Keyboard, focus and touch), `screens/page.src.html` (`.cs-mast .cs-mark`, `.mk-bars .run i`, `.mk-trail .k`, `.mk-graph .edge`, `.mk-glegend .li`, `.mk-readerlink`), `measures-map.html` (`.mark`, `.bar`), `layouts.html`, `visual-language.html`.
owed: (BOB) interface-shell folds the stylesheet when it next takes the visual language: `civicsmith.css` with no `cursor: help` anywhere and `.cs-card` without `cursor: pointer`; nothing before.

### DEC-225 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_013WPLBoMoEqgg3wdk3KMaPa) (B180 / K3160: Bob, 14 October: "the search for records can go far beyond the city's website ... It goes to the state and federal government and private firms for records related to regulations, court decisions, business press releases, and so on.")
for: bob-session
question: What civicsmith.org says about where a group's record comes from.
why it is Bob's: the public face's words (DEC-125, DEC-206, DEC-223) and the meaning of his ruling K3160; drawn as design detail (P17).
provisional: "Gather the records. Members collect what the government publishes: minutes, budgets, contracts, reports, letters. Civicsmith keeps each one exactly as the office published it, with where and when it came from."
alternative: name the sources in a sentence of their own on the front page's second line.
recommendation: as below.
reversal cost: low: words.
response: **Bob's ruling K3160, drawn by the design session, 2026-10-14.** The bullet now reads: "Gather the records. Members collect the records that bear on the question, from wherever they were published: the city's minutes, budgets, contracts and letters; state and federal regulations and reports; court decisions; the press releases and filings of private firms. Civicsmith keeps each one exactly as its source published it, with where and when it came from. Together these are the group's record." The other opening sentences agree with it: the front page's first line names the laws that bind the government and the court decisions it is subject to (DEC-221, DEC-223); its second says only that the group gathers the records; the evidence bullet's "a copy fetched straight from the office" means whichever source published the passage. No other sentence on the three pages names a source. No requirement changes (K3160: capture fetches any public source, K1880; the record holds law, court and organization sources).
decided: 2026-10-14 · Bob's ruling (K3160), drawn by the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`site`, "How a group uses it"), `layouts.html`.
owed: (BOB) nothing: K3160 changes no requirement; installer R42's lines follow SITE_LINE1 and SITE_LINE2, which did not change.

### DEC-226 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_013WPLBoMoEqgg3wdk3KMaPa) (B179 / K3158: Bob, 14 October: "The Civicsmith system should automatically check for update releases and notify admins when one is ready, say what the differences are (aka, release notes), and allow the admin to decide whether to update or not. Use secure best practices when designing this feature, and make the UX be consistent with the rest of the admin experience.")
for: bob-session
question: How an administrator learns of a new release, reads what changes and decides, on the screens.
why it is Bob's: his ruling K3158; the screens and words are design detail beneath it (P17), drawn to BOB's mechanics (`build/plan/draft-updates.md` on `tranche/T47`: a signed notice carrying the notes, a daily check that sends nothing, signature and no-downgrade checks, text-only notes, no self-update power, the update applied only through the installer).
provisional: none: the installer's update page existed (DEC-201) with no way to reach it from inside Civicsmith and no notice of a release.
alternative: a banner on every administrator's home until the update is applied; or an email. Rejected: a banner nags and the home is the group's nerve center (DEC-216); Civicsmith sends no email (DEC-219).
recommendation: as below.
reversal cost: low until N1047 is built: one screen, one to-do, three acts, one wizard.
response: **Bob's ruling K3158, drawn by the design session, 2026-10-14.** (1) **The to-do.** A verified newer release is one To do for every administrator, in the queue under "Your group's Civicsmith" and in the home's Needs you: "An update is ready: release 0.84.0, 11 October", with the security mark (the risk mark, "Security fix", explained on hover) when present; its acts are See what changes (to Settings › Updates) and Not now. When one administrator acts, the item leaves every queue. (2) **Settings › Updates** (screen `updates`, administrators only, in the Settings menu after Security): Running now (the release running, when it was installed and who allowed it; the last daily check, which sends nothing about the group); Ready to install (the release, its date, the security mark, "signed by Civicsmith · signature checked", the release notes as plain text in three parts: For members, For administrators, What an administrator must do; a note that the notes are signed with the release and can carry no link, picture or script); the acts Update (primary, outward: opens the installer's update page set to that release and no other), Not now (aside for every administrator; back in two weeks, the next day for a security fix, at once when a newer release replaces it) and, under a disclosure, Skip this version, a reasoned act whose reason every administrator sees; Earlier releases (each release offered: installed, with the date and who allowed it, or skipped, with the reason). When nothing is ready: "Nothing to install". (3) **The hand-off.** An administrator who does not hold the group's Cloudflare account (Settings › Your group records who does) sees no Update button but "Pass it to whoever holds your Cloudflare account": the link to copy, in the reader's-link shape, naming the holder; the link carries no credential; Civicsmith sends no email. (4) **The installer's update page** names the release chosen in Settings › Updates and says it installs that release and no other, with the release running beside it, and now has its states: updating (the versions before and after, the steps as they run), a stop (Cloudflare refused the upload: the group's Civicsmith runs as before; Try again) and finished (the release running; the to-do leaves every queue on its own). (5) **A wizard**, "Update your group's Civicsmith" (read what changes; Update, or pass the link; allow it in Cloudflare), and two steps in journey 19, the daily queue. The three acts are owed to K3158: `updatestart`, `updatelater`, `updateskip`.
decided: 2026-10-14 · Bob's ruling (K3158), drawn by the design session (P17)
reasoning recorded in: this entry; `screens/registry.src.py` (`updates`, `queue`, `update`), `screens/library.src.py` (the wizard), `screens/mock-screens.js` (`updates`, `update`, the queue, NEEDS_YOU, the Settings menu), `screens/mock-journeys.js` (journey 19), `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/mock-refs.js`, `screens/mock-shell.js`, `screens/words.json` (1,803 words, 652 protected), `layouts.html`.
owed: (BOB) in T48 with N1047: the three acts (`updatestart` opens the installer's `/update` with the release; `updatelater` with its spans, the design's two weeks and the next day for a security fix being BOB's to set; `updateskip`, reasoned, recorded with who and when); the to-do's producer for every administrator, leaving every queue when one acts (queue-producers); the Updates page's reads (the release running and who allowed it, the last check, the release ready with its signed notes, the releases installed and skipped); the hand-off link, carrying no credential, at the installer's own address (the mockup writes civicsmith.org/update); the installer's `/update` states (R17, R51, R52, R54); the home's Needs you row and the queue's count. Nothing before T48.

### DEC-227 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_013WPLBoMoEqgg3wdk3KMaPa) (B185 / K3183 / N847: BOB's question on wizard-scripts R23's 'elsewhere' route: the panel, its words, a pointer's fields, the no-pointer case)
for: bob-session
question: What a member sees when what they need is not Civicsmith's work: where, in what words, from what data, and when the place lists nothing.
why it is Bob's: design detail beneath his rulings (DEC-129 (7); D52 through K2407, one door "What happened?"; the doctrine that Civicsmith gives legal information, never legal advice; Action rule 11: jurisdiction lives in data); decided by the design session (P17).
provisional: R23's sixth route answers `pointer: null` and the member sees nothing; no door, word, panel or profile field exists.
alternative: (a) the assistant alone points elsewhere (it proposes only projects and leads, and the member without it would see nothing); (b) a dialog at the door naming places in Civicsmith's own words (no place, law or venue may appear in Civicsmith's own text).
recommendation: as below.
reversal cost: low until N847 is built: one screen, one door, one guide line, a profile section.
response: **The design session, 2026-10-14, under Bob's rulings.** (1) **Where.** Two ways in, both to one screen. Home's door "What happened?" gets a sixth choice, "Help for my own situation" ("A notice, a bill, a repair, a deadline that's yours alone: not Civicsmith's work, but it knows where to send you"): R23's sixth route. And the guide of every script a door offers (DOORS: Your first question, Get a record, Check a claim, Follow the money, Build a timeline, Follow a proceeding, Use another group's case) carries one quiet line on every step, "For your own situation rather than the government's word: where else to go", since a step cannot route (R2, R3). Both open the screen **Where else to go** (`elsewhere`, working frame, under Home); opening it records nothing and tells nobody (R23: a non-event). The assistant keeps proposing only projects and leads; its refusal of advice may name the same screen when BOB builds answers (not owed). Administrators see on Places and offices how many places their place lists and a link to the screen; the group neither chooses nor edits them. (2) **Words.** Heading "Where else to go"; the sentence: "Civicsmith is for a group checking whether its government keeps its word. It gives legal information, never legal advice, and it can't act for you in a matter that is yours alone. The places below can; your group's place lists them, each with where that came from." Each pointer sits under its kind's heading, named by its own name, then what it does in one or two sentences (the needs it serves, in plain words), how to reach it (phone, web, email, address, mail, hours), and "From {source}, read {date}". The six kinds, in this order: Legal help you can afford (`legalaid`), The courts' own self-help (`selfhelp`), The city's service line (`service`), A state agency for your kind of problem (`agency`), Your elected representative's office (`representative`), A newsroom that takes tips (`tipline`); each heading explains its kind on hover, and the service line's and the representative's say when the need is the group's question after all. All words are keyed in `words-t48.src.py` (`elsewhere.*`, `door.front.elsewhere.*`, `wizard.guide.elsewhere*`, `places.elsewhere.*`); none names a place. (3) **What a pointer holds**: a `pointers` section of the place profile, researched per place like the rest, never a member's data: `{kind, name, does, contacts: [{how, value}], hours?, languages?, source, status, basis}`. `kind` is one of the six; `name` the body's own name; `does` what it does and for whom, one or two sentences, in the profile's words; `contacts` as `legal_organisations` R32 has them (`how` one of `web`, `email`, `phone`, `mail`, `address`); `hours` as R42; `languages` the languages it serves, optional; `source` the address or citation read; `status: researched` with a dated measurement `basis` (R44's rule: a fact without a source is not written). BOB's "address or phone" becomes `contacts`, "what they do" `does`, "source and date read" `source` and `basis`; `representative` is added to BOB's five kinds (constituent services are the commonest own-matter route to a city), and a state agency carries its subject in `does`. A profile may hold several pointers of one kind and none of another; the screen shows only kinds with a pointer. (4) **No pointer.** The screen says: "Your group's place lists nothing here yet. Civicsmith names a place only from its place's rules, with where that came from, and {place} has none for this yet. Your group's administrators can ask for the place in Settings › Places and offices; when an update brings its rules, this page fills in.", with "If you are in danger now, call your local emergency number" (naming no number); a group following no place's rules reads `elsewhere.none.noplace`. The sixth door and the guide's line show regardless, so the way out is always visible. Also folded here: DEC-226's words, keyed in the same file (`updates.*`, `queue.update.*`, `home.update.*`, `installer.update.*`).
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/registry.src.py` (`elsewhere`), `screens/mock-screens.js` (`elsewhere`, `ptr`; Home's sixth door; Places and offices), `screens/mock-shell.js` (`DOOR_WIZ`, the guide's line, PATH), `screens/mock-refs.js`, `screens/words-t48.src.py` and `words.json` (1,895 words), `screens/build_words.mjs` (4j), `layouts.html`.
owed: (BOB) with N847 in T48: the `pointers` section in `jurisdictions` (the shape above; Oakland's profile researched with a basis per pointer); `pointer(viewer)` answering the active place's pointers, or none; R23's sixth door `elsewhere` in `library.json`'s doors and `words.json`'s `door.front.elsewhere.*`; the screen where Home's door is built, reading `pointer`; the guide's line in the interface's wizard guide for door-offered scripts; the count on Places and offices. Nothing before T48.

### DEC-228 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_013WPLBoMoEqgg3wdk3KMaPa) (B187 / K3190: BOB's legacy-ui census, `build/plan/draft-T48-legacy-census.md` on `tranche/T47`: 28 things the old interface serves that no /app screen draws, two drawn, 26 to draw or rule out, each by its census id)
for: bob-session
question: Which of the 26 undrawn census items are already served or ruled out, which are to be drawn, where, and in what order.
why it is Bob's: design detail beneath his rulings (K3052: no member meets an old interface; DEC-213 (3), the model for ruling an item out); the triage and the drawings are the design session's (P17). Nothing here changes a requirement; one item (D6) is handed to BOB as a requirement question.
provisional: legacy-ui stays in T48 under the plan's one hard reason until each item is drawn or ruled out (K3190).
alternative: draw all 26 as they were in legacy-ui. Rejected: several are served by screens drawn since, and three would contradict rulings.
recommendation: as below.
reversal cost: low: a triage; each drawing is its own DEC.
response: **The design session, 2026-10-14, under Bob's rulings.** For each census id: *drawn* (already on the page), *served* (another drawn screen does the job, cited), *ruled out* (with the ruling), or *to draw* (with the screen, the size and the order). **Drawn:** P1 (the public page's evidence by full hash and "Download the complete edition"; its free "Verify any hash" panel is to draw, small: on `published`, a field "Check a file you hold: paste its SHA-256", answering whether this edition holds it and for which finding), Q1 (mute a kind for a case). **Served or ruled out:** P2, the reader's floor picker: ruled out; both floors are in-band on every page (DEC-31, DEC-34) and each finding shows whether it meets the group's bar (screens-publish R6); a reader applies a stricter floor by reading, and a picker that hides signed findings would show a case other than the one signed. F2, corpus-wide passage and meaning search: served by Find (`finder`, screens-daily R4; DEC-164 (1)), whose one box answers documents, passages (retrieval R10, R11) and people and organizations (entities R15) in one list; the mock's result list is checked to draw all three kinds (tiny). F3, holding a query, what moved, citing over a held set: served; a held query is a standing question ("Keep asking this", `answers`, journey 18) and what moved is its queue item; a citation is one passage with its grade, made over the held set through "Find in these" (DEC-164 (1)); no batch citation. S1, subject pages for offices, ordinances and sources: ruled out as separate pages; an office is a post on its holder's row and a filter (DEC-203 (1)); an ordinance or rule is `standard` (a requirement the city set itself; laws live in the place profile, Action rule 11) or `proceeding`; a source is the document's provenance line and, as a publisher, an organization in People. M1, the administrators' arithmetic: ruled out; Members' count and the one-administrator note serve it (DEC-134; screens-settings R1) and `adminarith` has no requirement in /app. D6, defer or dismiss a question: ruled out for now; no requirement in /app serves `dispose`, and a question not pursued is kept as a hunch (`hypothesishold`) or concluded; if `dispose` is to survive it needs a requirement first (BOB's). C1, exporting a review copy to a file: ruled out; a review copy is read through the reader's link, revocable (DEC-217); a file is the loose rendering DEC-31 chose to state rather than design for; the complete edition is downloadable once published (P1). **To draw, in this order, each its own DEC:** (1) `document`: D1 "Read it", the captured text by page, a selected passage offering "Cite this", the original through `open-file`; D2 "Links this page carries", each outward with the one-line warning; D4 "Versions" with dates, the changed mark and "Compare" with the version you cited (DEC-213 (3) assumed it served; nothing drew it); D5 the people, organizations and connections it carries and the determining mention chosen on a point (`connectionchoose`). (2) `person` and an organization's page: S2 "What the group says about them": another name (`entityalias`), a relation (`relationdeclare`), the same as (`resolve`), a member's own knowledge (`resolvetestify`, a person's word), connect to a document (`connect`). (3) `question`: V1 the elicitation as DEC-32's consequence question per cited passage ("If this turned out to be wrong, would the finding still stand?"), grouping what stands or falls together, no AND/OR words; V2, V3, V4 together, the version section: which version each citation reads, a newer one marked changed, accept, keep, consider or revert with the strength the pair gives, and the project's stance (`versioncurrent`), the queue's adopt/keep staying the quick path (DEC-131); V5 "What relies on this" (`backlinks`; K960's `out_of_view`). (4) `project`: R1 Members' acts: leave; remove (owner, reasoned); make an owner or stand down (the sole owner adds a second alone; beyond that every owner's vote, drawn as a request each owner answers); fork; the administrator's rescue only when every owner is unreachable and never for a hidden project (K2782, K2578); R2 visibility at "Start a project" and on the project's page (changed with a reason, with its history); and the links BOB asked about: the project's page to its plan, timeline, money trail, calculations, proceedings and standards, the question's to its case editor, review copy, ceremony and docket, imported from Projects. (5) `finder`: F1 Find with no words is the browse: everything the group holds by kind (documents, questions, actions, people and organizations, plans) and state (new since you last looked, flagged for a second look, watched by you), newest first; Questions, Actions, Watched and Needs a second look are its kinds and states (Actions also `dash-action`, DEC-214 (4)). (6) `action`: A1 the risk tier with "Revise, with a reason"; A2 the law it goes under with "Propose another law" and the proposals; A3 on "no reply recorded", "Open a question from this". (7) Small: Q2 a "Muted" line at the foot of the queue, each kind or case with "Turn back on" (the `queuemute` unmute form; the help text corrected from "in your settings"); D3 on Add, "Unfinished: a capture waits for its attachments · Finish it"; C2 on `review-outside`, "I have read what this copy leaves out" (`statementack` by the link's secret); S4 a theme as a reasoned tag on a question's and a document's page and a filter on Projects and Find; S3 a progression on `timeline` (steps defined once, documents threaded to them, a step discharged by its document); the "Machine translation" labels (N670); the test-instance band across the working frame (N1049). Nothing in this list is Bob's to rule; D6 goes to BOB.
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `HANDOFF.md` §0 (the drawing order); the census (`build/plan/draft-T48-legacy-census.md`, BOB's).
owed: (BOB) the census's §2 table updated from this entry: P2, M1, C1 and (for now) D6 "dropped, with its reason", F2, F3 and S1 "served", the rest "to draw" with the DEC that draws each as it lands; a requirement for `dispose` if it is to survive (D6). (design) the drawings, DEC-229 onward, in the order above, each with a NOTICE.

### DEC-229 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_018wYsHFkiS5mNbyuRzpFoDX) (DEC-228 (1), the census's first batch, B187 / K3190: the document page's D1 "Read it", D2 "Links this page carries", D4 "Versions", D5 the people, organizations and connections it carries)
for: bob-session
question: How the document page shows the captured words by page and lets a member cite from them and open the original; how it shows the links the page carries; how it shows the versions the record holds and sets this copy beside the version the member's question cites; and how it shows the people and organizations it names, with the mention that counts.
why it is Bob's: design detail beneath his rulings (DEC-139, the screens; DEC-160, anything the record holds that a screen names is a link; DEC-131, the queue's adopt or keep is the quick path; DEC-213 (3), the document's page serves the version history; K3052, no member meets an old interface); decided by the design session (P17). Nothing here changes a requirement: four acts join the document's registry entry, each already declared or a requirement function (connections R14 `connectionchoose`; `explore`; reevaluation R15 `adoptVersion` and `keepVersion`).
provisional: the page drew two passages with "Cite this passage", the unread pages, one named person and the copy's acts; no body text, no links, no versions, no connections; `open-file` was reached from nowhere on it.
alternative: (a) the legacy panels as they were (a diff toggle, a "knows" panel, a links list with no warning): rejected, they predate the rulings above; (b) a separate reader screen: rejected, the words of the copy are the page's first business and a second screen would split citing from reading; (c) adopt or keep only from the queue: rejected, where a member compares is where they decide; the queue stays the quick path (DEC-131).
recommendation: as below.
reversal cost: low: one screen's sections, four registry acts, forty keyed words.
response: **The design session, 2026-10-14, under Bob's rulings.** (1) **Read it** (D1). A section "Read it" with two tabs, "By page" and "Beside the version your question cites". By page: a page bar ("Page 3 of 12", Previous page, Next page, "Select any words to cite them." and "Open the original file", a reference link to `open-file` whose card names the file's kind and size and that it opens after Civicsmith's file check, screens-intake R5, file-safety R8); the page's words as paragraphs, read from the capture (extraction R27 `reading`, one text unit per page, reading-pipeline R15); a selection carries "Cite this" (`cite`, its help on the selection: the citation points at this copy, this page and these words; citation R1); the pages the reading could not make out stay at the reader's foot with "Have the assistant read pages 7–9" (`pagetranscribe`, assistant only) and "Type a page's words yourself" (`transcribe`), as before. (2) **Beside the version your question cites** (D4's "Compare"). The second tab sets two columns side by side: the version the member's question cites (captured 14 September by Mai) and this copy (captured 2 October by Dev), each dated, the cited passage in both, the changed words marked in the newer; a line in plain words says which passage reads the same, letter for letter, and which changed (content R29 to R31's grades said in words, never as a mark), and that citations stay on the version cited until moved; then "Move my citations to this copy" (`adoptversion`) and "Keep citing the version I cited" (`keepversion`), reevaluation R15: the queue's adopt or keep stays the quick path (DEC-131), this is the considered one. A journey step reaches it with `v: 'compare'`. (3) **Versions** (D4). A section listing every copy the record holds of this document's address, newest first (provenance R17 `versionChain`), each "Captured {date} by {who}"; this copy marked "this copy"; the one the member's question cites "The version your question cites"; a copy newer than the cited one carries the changed mark, "Changed since the version your question cites", whose explanation says to compare, then move or keep, with "Compare them" switching the reader to its second tab and scrolling to it; a copy that reads the same says so. "Check for a new version now" (`monitor`) and "Watch for changes" (`monitorset`) move here from "This copy" (screens-inquiry R15 holds). A newer copy never replaces an older one. (4) **Links this page carries** (D2). A section with one line first: "{n} links on this page; {held} point at documents the group holds. An outward link opens the site as it is today, in a new window, which may differ from what was captured; it takes you outside Civicsmith. The site's own navigation links are left out." (capture R27, R28; the warning, said once, protected). Each link: one whose target the group holds opens that document (connections R24's `links_to` edge; "held · captured {date}"); the rest are plain outward controls carrying the outward mark and the address they point at, no act. (5) **People and organizations it names** (D5). A sheet of everyone the record follows that the copy names: the kind's mark, the name (a link to `person` or the organization's page), "{n} mentions · the mention that counts: page {page}, chosen by the record (strongest grade)" or "chosen by {who} on {date}: "{why}"" (connections R4 `on_point`, R6 the method, R16 a new choice supersedes), with "Choose the mention that counts" (`connectionchoose`, Reversible, op-grades R1; its help: which mention the record reads as the one that connects them, the strongest-graded until a member chooses, dated and attributed, replaceable; refusals C-74) and, on a person's row, "Say this is a person we follow…" (`identityclaim`, as before); then "Explore connections" (`explore`), starting the graph from this document. An empty state for a copy that names no one. (6) **The rest.** The facts, "Find in this", "This copy" (`release`, `attest`, `retire`) and the assistant's note stay. Words keyed `document.*` in `words-t48.src.py` (forty entries, two protected: the changed mark's words and the links' warning); `build_words.mjs` 4j now takes each entry's DEC from its note. `acquire`'s weight is Reversible (B194 (2), U218). The registry's `document` purpose rewritten; `SCREEN_HELP.document` likewise.
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/registry.src.py` (`document`, fifteen acts), `screens/mock-screens.js` (`SCR.document`), `screens/mock-acts.js` (`connectionchoose`), `screens/mock-kit.js` (`WEIGHT`), `screens/mock-refs.js` (`SCREEN_HELP.document`), `screens/page.src.html` (`.mk-pagebar`, `.mk-pagetext`, `.mk-compare`, `.mk-versions`, `.mk-outlinks`), `screens/words-t48.src.py` and `words.json` (1,940 words), `screens/build_words.mjs` (4j), `layouts.html`.
owed: (BOB) screens-inquiry R3's act list for `document` gains `adoptversion`, `keepversion`, `connectionchoose` and `explore` (fifteen acts), and its reads the capture's `links` (capture R57), the `links_to` edges (connections R24) and each named entity's `on_point` (connections R4); the words above read by key (K3269, N1075); the census's §2 table: D1, D2, D4, D5 "drawn, DEC-229". Nothing before T48's L11. (design) the next batch, DEC-230: `person` and an organization's page, S2.

### DEC-230 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_018wYsHFkiS5mNbyuRzpFoDX) (B196 / B197 / K3265, K3277, N1072: the founder chooses their own handle; BOB's draft `build/plan/draft-T49-N1072-founder-handle.md` on `tranche/T48`, screens-entry R12 to R14 and its open doubts 5, 9 and 11)
for: bob-session
question: The words and screens Bob's ruling "B" (K3265: the founder chooses their own handle when setting up the group; `admin` an internal id only, never typed at sign-in or shown) leaves to the design stream: the claim step's handle field, the sign-in and recovery fields' help, the claimed line, the refusals, the step a founder who claimed before T49 sees, and how a founder with no handle is shown.
why it is Bob's: design detail beneath his ruling K3265 (and DEC-197: handles never change; DEC-201: the setup frame); decided by the design session (P17). The draft's doubt 9 (where an older founder is asked) and doubt 11 (how a founder with no handle is shown) are drawn here as detail of K3265; doubt 10 (whether members may invite the founder by handle) is a requirement question and stays BOB's to bring to Bob.
provisional: the front door's handle field and the recovery page's say "Did you set this group up? Your handle is admin." (`signin.founderhint`, DEC-201); the claim asks only passwords and signs in as `admin`.
alternative: for an older founder, (a) a blocking step (retires `admin` at once, but can keep a founder from Home until they choose); (b) an item on Home only (easily ignored, so `admin` lingers). Rejected for (c), below, BOB's recommendation too.
recommendation: as below.
reversal cost: low until T49: a field, a step, sixteen keyed words.
response: **The design session, 2026-10-14, under Bob's ruling K3265.** (1) **The claim** (screens-entry R13). Between the one-time password and the founder's own password, a field "Choose your handle" (`screen.setup.handle`), its help the join step's own: the record shows it on your work and on every case you sign, it can't be changed and no one else can take it, it needn't be your legal name, the characters allowed (`screen.setup.handle.help`). The password's help now says "From now on you sign in with your handle and this". The claim's refusals draw by key: `refusal.NO_HANDLE`, `refusal.BAD_HANDLE`, `refusal.HANDLE_TAKEN` (new keys, shared with joining) and `refusal.HANDLE_FIXED`, re-worded to fit anyone, the founder included: "Your handle is already chosen, and a handle never changes in Civicsmith: it names your work for good, and no one else can ever take it. Nothing was changed." After the claim, `screen.setup.claimed`: "Claimed. {group} is yours, and you're signed in as {handle} on this device." (2) **Sign-in and recovery** (R12). `signin.founderhint` is withdrawn from `words.json`; the front door's handle field says "The name the group knows you by: chosen when you joined, or when you set the group up." (`signin.handle.help`), the recovery page's "The handle you sign in with: the name the group knows you by." (`forgot.handle.help`); neither names a handle. (3) **A founder who claimed before T49** (R14; doubt 9, option (c)). After such a sign-in, before Home, a step in the setup frame: "Choose your handle"; "Until now you've signed in as admin, a name every Civicsmith group's founder shared. Choose the handle you'll sign in with from now on: the record shows it on your work and on every case you sign. You choose it once; it can't be changed."; the handle field with the claim's help; "Choose this handle" (`founderhandleset`, owed to K3265 until T49 declares it); "Later", which opens Home and says so: "You still sign in as admin until you choose, and this step comes back at your next sign-in." On success: "From now on you sign in as {handle}; admin no longer works." then Home. Only the trial instances claimed before T49 meet this step; on them `admin` keeps working until the founder chooses, the one place the ruling's "never typed" waits on the founder. (4) **Before a handle is chosen** (doubt 11). Wherever the founder's name would be, "The group's founder" (`member.founder.unnamed`), explained as "The person who set up this group's Civicsmith, who hasn't chosen a handle yet. Their work will show it once they do."; never `admin`. All words are keyed in `words-t48.src.py` under DEC-230 (T49 builds them; no separate T49 file).
decided: 2026-10-14 · the design session, under Bob's ruling K3265 (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.setup`, states a and b with `v: 'founderhandle'`; `SCR.front`, `SCR.forgot` field help), `screens/registry.src.py` (`setup`: `owed:founderhandleset K3265`), `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/words-t46.src.py` (`refusal.HANDLE_FIXED`), `screens/words-t47.src.py` (`signin.founderhint` withdrawn), `screens/words-t48.src.py` and `words.json` (1,957 words), `layouts.html`.
owed: (BOB) with N1072 in T49: screens-entry R12 to R14 read these keys (`screen.setup.handle` and `.help`, `screen.setup.claimed`, `signin.handle.help`, `forgot.handle.help`, the four refusals, `founder.handle.*`), `founderhandleset` declared (op-declarations), `member.founder.unnamed` wherever project-roster R29's `founder: true, handle: null` reaches a reader; doubt 10 brought to Bob if pursued. Nothing before T49.

### DEC-231 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_018wYsHFkiS5mNbyuRzpFoDX) (B191 / K3230, "N933: B": a stake per matter; BOB's draft `build/plan/draft-N933-stake-per-matter.md` on `tranche/T48`, project-roster R29, R30, action-records R17, filings R60 to R62)
for: bob-session
question: Where the group's stake for one matter is set and shown, and where and in what words a member preparing a higher-stakes action is asked whether the group has a stake in this matter beyond its usual one.
why it is Bob's: design detail beneath his ruling K3230 (a group-wide stake, instance-setup R77, plus an optional stake per matter, beside it, only on what is sent or published for that matter, dated and attributed; the question a prompt, never a gate, D28); decided by the design session (P17).
provisional: no screen drew even the group-wide stake (`declaredstakeset` had help text and no control); nothing asked at preparation.
alternative: (a) the question as a step that must be answered before approval: rejected, K3230 and D28 make it a prompt, never a gate; (b) the per-matter stake only on the action: rejected, K3230 makes the project the matter by default.
recommendation: as below.
reversal cost: low until T49: three sections, three owed acts, twenty-four keyed words.
response: **The design session, 2026-10-14, under Bob's ruling K3230.** (1) **The group's statement** (Settings › Your group, administrators): a section "What the group has at stake", a field "The group's statement" in the group's own words (`declaredstakeset`, "Save the statement"), its help saying it goes beside the group's name on everything it sends or publishes and that a project or an action can add a stake beside it, never in its place; "Set by {who} on {date} · {n} earlier statements". (2) **The project's stake** (the project's page, above Members): "What the group has at stake here", the group's statement shown read-only for context, then "This project's stake (optional)" (`projectstakeset`, owed to K3230 until T49 declares it), its help: only what this matter adds, beside the group's statement on what this project sends or publishes, settable by a member of the project or an administrator, each change dated and kept, empty meaning the group's statement alone; "Set by {who} on {date}". (3) **The question at preparation** (start-and-send, when `stakeatpreparation` answers `higher_stakes`, filings R62: Tier 2 or 3, or undetermined): a section above the approval, "Does the group have a stake in this matter beyond its usual one?", saying in plain words that {kind} puts the group's own interest on the record, that the group's statement goes with the action already, giving examples (a member who is a party, a decision that changes your rent), and "You can approve either way."; an undetermined tier adds "Civicsmith can't tell how much is at stake in this action, so it asks."; then "This action's stake (optional)" (`actionstake`, owed to K3230) with "Save this action's stake"; the heading's explanation: it never stops you, nothing waits on your answer, and no answer is recorded unless you save a stake (draft doubt 5). (4) **Shown beside the stamp**: on every preparation, above the approval, "Sent with: {group} · {group's statement}" and "In this matter: {stake} · this project's stake (or this action's own stake), set by {who} on {date}", or "None stated beyond the group's"; an unreadable stake says "Civicsmith can't read this stake right now; it is not left out.", never none. The assistant's writing help is offered on the three fields like any member's own words. Words keyed `stake.*` in `words-t48.src.py` under DEC-231.
decided: 2026-10-14 · the design session, under Bob's ruling K3230 (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.group`, `SCR.project`, `SCR['start-send']` states a and b with `v: 'higher'`), `screens/registry.src.py` (`group`: `declaredstakeset`; `project`: `owed:projectstakeset K3230`; `start-send`: `owed:actionstake K3230`; `writinghelp` on all three), `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/words-t48.src.py` and `words.json` (1,989 words), `layouts.html`.
owed: (BOB) with N933 in T49: screens-settings draws `declaredstakeset` on `group` (instance-setup R77 has had no screen); the project page draws R29/R30; screens-action draws the question from `stakeatpreparation` and the "Sent with / In this matter" lines from filings R60 on every preparation; these keys read; op-declarations and op-grades for `projectstakeset`, `actionstake` (Reversible, as `declaredstakeset`). Nothing before T49.

### DEC-232 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_018wYsHFkiS5mNbyuRzpFoDX) (B188, B189, B190, B193, B194 / K3195, K3203, K3214, K3254: the words, help texts, refusals and registry items T48 and T49 build with BOB's interim text until the design stream keys them)
for: bob-session
question: The member-facing words for each key BOB asked for, the help for thirteen acts and reads, the two registry re-points, the sixth door in the library's doors, and whether `proceeding` gets a dates lane.
why it is Bob's: member words and design detail beneath his rulings (DEC-149's form for keyed words; K3269, every member word read by key from this stream's file; DEC-227 (1), the sixth door; DEC-124 onward, American English); decided by the design session (P17).
provisional: BOB's interim sentences, read by key; `optionpropose` and `connectionassert` drawn where `planask` and `stepsource` are the acts; the doors carried as frozen data.
alternative: none weighed: each is a wording or a re-point the requirements already name.
recommendation: as below.
reversal cost: low: words by key.
response: **The design session, 2026-10-14.** Sixty-four keys in `words-t48.src.py` under DEC-232, each with its source in the note, BOB's interim text kept where it was already plain and corrected where it named a mechanism. (1) **B188**: `signing.openrequest.noquote` ("{whom}'s reply asks not to be quoted, so the case says what it says without quoting its words.", protected as its siblings, DEC-194); the reading control "Read in my language" with its label "Machine translation · original in {language}" (protected), its help, "Show the original" / "Show the translation", and on a published case "Unofficial machine translation · the signed original is in {language}" with "Read the signed original"; `refusal.LANGUAGE_NOT_SET`; action-replies' three refusals (`MACHINE_CANNOT_RECORD_QUOTING`, `QUOTING_NOT_RFC`, `QUOTING_REFUSED`); **yes, `proceeding` gets a dates lane**: a section "Dates" with two lanes, "The proceeding" and "Our deadlines on it", "Now: {stage}", and its help (a body's own deadline is never in the group's lane; nothing says anyone is late), drawn with DEC-228's small batch; `refusal.NO_FINDINGS` naming the three kinds of finding; a pointer's hours (day names, "{days}, {open} to {close}", "{first} to {last}", "Closed other days") and "Languages: {list}"; Places and offices' section help and its two empty sentences (no pointers, no place). (2) **B189, B193**: the six `duty.reason.*` sentences, each naming no date form, zone or ruling; `connection.kind.step_source.name` "Stated in a source" (protected, with its meaning). (3) **B190**: help (`ACT_HELP`, so `act.<op>.does`) for `actionreplyquoting`, `proceedingdates`, `readtranslate`, `planask`, `stepsource`, `stepsourcewithdraw`, `updatenotice`, `aiuseovertime`, `exploregraph`, `standardproposals`, `filingread`, `pressurefor`, `lookedsince`; `refusal.UPDATE_NOT_READY`, `refusal.UPDATE_SKIP_NO_REASON`; Home's block headings in R17's order (`home.welcome.title`, `home.ready.title`, `home.needsyou.title`, `home.needsgroup.title`, `home.areas.title`, `home.projects.title`, `home.since.title`; "What happened?" stays `door.front.head`); `published.download`. **Re-points**: on `plan`, "Ask the assistant for options" is `planask` (the tray's "Suggest more" too, assistant only); on `explore`, "Attach a source to a declared step" is `stepsource` (journey 14's step too). (4) **B194**: `shell.band.working`, `shell.group.unnamed` "Your group", `wizard.marks.chip` / `.one`, `wizard.mark.recommended` "Recommended for everyone", `queue.source-modified.one` / `.many`, `queue.source-removed.one` / `.many`, `queue.source.detail` (adding that the copies the group holds are unchanged), `queue.source.untitled`, `home.first.name`, `settings.set.setup`. (5) **The sixth door** (B188 (6)): `library.json`'s `doors` now carries `{door: "elsewhere", scripts: [], opens: "elsewhere"}` after the five (wizard-scripts R37), so the frozen copy can go.
decided: 2026-10-14 · the design session (P17)
reasoning recorded in: this entry; `screens/words-t48.src.py` and `words.json` (2,066 words), `screens/mock-acts.js` (thirteen help texts), `screens/mock-kit.js`, `screens/registry.src.py` and `mock-screens.js` and `mock-journeys.js` (the re-points), `screens/library.src.py`, `check_library.py` and `library.json` (the sixth door), `screens/check_walk.mjs` (`planask` assistant only), `layouts.html`.
owed: (BOB) each module reads these keys at its START in place of its interim text (K3269); op-declarations moves the thirteen ops out of `ACT_HELP_ABSENT`; interface-shell R55's admission of the two re-points can end, since the registry lists them; wizard-scripts reads the sixth door from `library.json`. (design) the "read in my language" control and the `proceeding` dates lane drawn with DEC-228's small batch.

### DEC-233 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_018wYsHFkiS5mNbyuRzpFoDX) (DEC-228 (2), the census's S2, B187 / K3190: what the group says about a person or an organization: `entityalias`, `relationdeclare`, `resolve`, `resolvetestify`, `connect`)
for: bob-session
question: Where and how a member adds another name for someone the record follows, declares a tie, matches or vouches for a document's mention of them, and connects the documents that name them; and what an organization's page is.
why it is Bob's: design detail beneath his rulings (K1486, the connection words: "member of", "stands in for", "overlaps", never "knows"; DEC-203, People; DEC-119 and the ladders: a member's own word is grade D; DEC-160, names are links); decided by the design session (P17).
provisional: the person page drew positions, career, "Same person?" and a correction; none of the five acts; no organization page (People's organization rows had nowhere to open).
alternative: (a) a separate "registry" screen for names and ties: rejected, a member looks for what the group says about someone on that someone's page; (b) a separate organization screen: rejected, the same screen serves both kinds, as the directory does.
recommendation: as below.
reversal cost: low: one section, one state, five acts, thirty-three keyed words.
response: **The design session, 2026-10-14, under Bob's rulings.** (1) On the person's page, after what the records say and before "Same person?", a section **"What the group says about them"** (its explanation: what members have said that no single document states; each line shows who said it and when), in three parts. **Other names**: each name with where it came from ("the name on the city roster", "added by {who} on {date}"), "Withdraw…" with a reason on a member's name; the field "Another name they go by" (its help: a short form, a former name, a title used as a name; Civicsmith then looks for it; a shared name never decides which one a document means) and "Add the name" (`entityalias`, entities R2, R8). **Ties a member declared**: each tie in K1486's words ("Member of" the city's Capital Improvement Committee), with "declared by {who} on {date}, citing {where} · declared, not evidenced" and grade D; the form: "Their tie" (Member of, Stands in for, Overlaps with, each explained), "With", "Why you say so", "Where it is said" (required) and "Declare the tie" (`relationdeclare`, entities R3, R47). **Documents that may name them**: the candidates found by their names (entities R17, only what the viewer may see, R18), each with the passage, "page {page} · by the name {alias}", "Match it" (`resolve`: Civicsmith matches by identifier or name and grades it, a grade never falls) and "I know this is them…" (`resolvetestify`, with "How you know": recorded as the member's word, grade D, never established alone and never lowering a stronger match); then "Connect the documents that name them" (`connect`, connections R1). (2) **An organization's page** is the same screen in its organization form (state b, `v: 'org'`, title "Organization"): its name and what it is, "Explore connections", "Offices in it" (each office with its holder), and "What the group says about it" with the same three parts in its words. People's organization rows open it. Words keyed `entity.*` in `words-t48.src.py` under DEC-233.
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.person`, states a and b), `screens/registry.src.py` (`person`: five acts and `writinghelp`; purpose), `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/page.src.html` (`.mk-h3`), `screens/words-t48.src.py` and `words.json` (2,110 words), `layouts.html`.
owed: (BOB) screens-investigate R1's act list for `person` gains `entityalias`, `relationdeclare`, `resolve`, `resolvetestify`, `connect`, and its reads `readEntity` (aliases, relations, R5) and `namingDocuments` (R17); the organization form of `person` for an organization kind (`institution`, `body`, `movement`), opened from People's organization rows; these keys read; the census's §2 table: S2 "drawn, DEC-233".

### DEC-234 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_018wYsHFkiS5mNbyuRzpFoDX) (B200 / K3293, B201 / K3295: further keys T48's L11 jobs hold inline until keyed)
for: bob-session
question: The member words for the keys B200 and B201 ask that DEC-232 had not already keyed, and the two keys that move out of `words.json`.
why it is Bob's: member words beneath his rulings (K3269: every member word read by key from this stream's file); decided by the design session (P17).
provisional: each job's inline text.
alternative: none weighed.
recommendation: as below.
reversal cost: low: words by key.
response: **The design session, 2026-10-14.** Twenty keys in `words-t48.src.py` under DEC-234: `installer.update.chosen.nodate` (the update page without a date); `screen.review-copy.until.nozone` ("Set your group's time zone first: a review link's end date is counted in it. Then share."); `shell.card.plan`, `.timeline`, `.money`, `.calculation`, `.case-editor`, `.review-copy`, `.ceremony`, `.docket`, each saying what the linked screen holds in one sentence; Home's four area names (`home.area.investigation`, `.action`, `.members`, `.administration`) and `home.move.ours` "our move", `home.move.theirs` "their move"; `screen.forgot.done.last` (after the last recovery code: get ten new ones in Settings › Recovery codes; never "you have 0 left"); `screen.setup.security.field`, read as the claim's one-time password field, filled from the installer and never typed ("One-time password · filled in for you from the installer's last page"), BOB to correct the reading if it meant another field; `connection.thing.entity` "a person or organization" (American English); `screen.held.empty` naming no first step. `rfc.quoting` and `refusal.RFC_QUOTING_MISSING` are withdrawn from `words-actions.src.py` and so from `words.json` (filing-templates R33 owns them). Already keyed by DEC-232 and not repeated: `wizard.marks.chip`, `.chip.one`, `wizard.mark.recommended`, the `queue.source-*` keys, `home.first.name`, and Home's block headings. **Corrected on B202 (UX design #14, 2026-10-14):** BOB meant a fill-only row, so `screen.setup.security.field` is now `{field}` (a security tool's own field names are record data and draw through `cs.field` on setup's security step); the one-time password line is kept under `screen.setup.otp.field`.
decided: 2026-10-14 · the design session (P17)
reasoning recorded in: this entry; `screens/words-t48.src.py`, `screens/words-actions.src.py`, `words.json` (2,128 words).
owed: (BOB) each job reads these keys at its START in place of its inline text; setup-words drops its copy of the two withdrawn keys; the reading of `screen.setup.security.field` corrected by B202 (done).

### DEC-235 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01Mbk3ejwX9p2JnHFTA6C8mh; the development process also runs on his primary account since K1428) (DEC-228 (3): the census's V1 to V5, the question page)
for: bob-session
question: How the question page draws the consequence question per cited passage (V1), the readings with their acts and the one a project stands on (V2 to V4), and what relies on the question (V5).
why it is Bob's: design detail beneath his rulings (DEC-32, DEC-40, DEC-228; K960); decided by the design session (P17). No requirement changes in meaning; screens-inquiry R2's act and read lists grow (owed below).
provisional: the question page as drawn before (no consequence question, no readings, no backlinks).
alternative: draw V1 only in the moment of citing. Rejected: DEC-32 clause 3 wants the answer read back where the member works, and clause 6 wants a change after the strength recorded there.
recommendation: as below.
reversal cost: low: a mock screen, its acts and words.
response: **The design session, 2026-10-14, under Bob's rulings.** **A correction to DEC-228 (3) first:** its "versions" in V2 to V4 are a question's *readings* (basis-versions: complete, named, frozen accounts of the support, with six acts), not a document's copies; "which version each citation reads, a newer one marked changed" and "keep" belong to the document page (DEC-229: `adoptversion`, `keepversion`), which already draws them. On `question` (a mock control shows two states): **(1) Under each cited passage** the answer to DEC-32's question in its words, "If this turned out to be wrong: your answer falls" or "…your answer still holds, because of {others}". **(2) "What your answer rests on"** reads the answers back in DEC-32 clause 3's two shapes, "Your answer fails if any one of these fails:" and, for passages that hold it up together, "here your answer fails only if all of them fail"; a line for a shared origin (`partitionindependence`: "Shared origin: the count and the audit both come from the Public Works repair log, so one error there could undo both."); "Set by {who} before the strength was shown"; "Change what a passage carries…" (`inquiryground`, a reason once the strength shows, the strength before and after kept, clause 6). **(3) State b, the question asked per passage** (clause 2, before the strength, clause 5): "The strength shows once each passage has an answer", each passage with "If this turned out to be wrong, would your answer still hold?" ("No, my answer falls" / "Yes, because of others I cite", then "Which ones would still hold it up?"), the read-back, "Save the answers". Until answered each passage counts as one the answer can't do without (clause 4). No AND, OR or the words strength R28 forbids appear. **(4) Readings:** a "Reading shown" chooser over Supports (the census's rotating, V2); a section "Readings", each with its name, description, state ("Accepted by {who}, {date}", "Suggested by {who} · not yet weighed", the assistant's marked as machine work and drawn only with the assistant on), its strength (`versionstrength`; a reading not accepted shows "its strength if it were accepted · a what-if", DEC-40), "{project} stands on this one" for the project's current reading, and its acts: Accept, Weigh it…, Reject…, Undo the decision…, Stand on this one for {project}…, Hide; "{rejected} rejected and {hidden} hidden · Show them". The queue's adopt or keep for a document's new copy stays the quick path (DEC-131), on the document page. **(5) "What relies on this"** (`backlinks`): each project, question and case that cites it, a project with the reading it stands on, and, when `out_of_view` is true, "Other work you can't see also relies on this question." (K960; it says nothing of what or how many). Seven acts join `question`; thirty-six words are keyed under DEC-235.
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.question`, states a and b, `v: 'ask'`; `SCR.assistant` reuses it), `screens/registry.src.py` (`question`: seven acts; purpose), `screens/mock-acts.js`, `screens/mock-kit.js` (`checks` takes a radio group), `screens/words-t48.src.py`, `words.json` (2,178 words), `layouts.html`.
owed: (BOB) screens-inquiry R2's act list for `question` gains `inquiryground`, the six reading acts and its reads `basisversions`, `versionstrength`, `partitionindependence`, `backlinks` (with `out_of_view`); basis-versions' heading spells each act's `op=` (`versionreject`, `versionconsider`, `versionrevert`, `versioncurrent` are written `owed:… DEC-235` only because the heading reads "`op=versionaccept` … `op=versionhide`"); these keys read; the census's §2 table: V1 to V5 "drawn, DEC-235". (design) none.

### DEC-236 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01Mbk3ejwX9p2JnHFTA6C8mh; the development process also runs on his primary account since K1428) (B203 / K3297, B204 / K3302: keys, styles and two drawings T48's L11 jobs hold inline)
for: bob-session
question: The words B203 and B204 ask for; a design class or drawing for each style the shell keeps as its own; the list of imported cases (N1087); a word for an unnamed node and a group for `step_source` in the connection graph (N1086).
why it is Bob's: member words and drawing detail beneath his rulings (K3269); decided by the design session (P17).
provisional: each job's inline words and styles.
alternative: leave the shell's styles as the shell's. Rejected: K3250's rule is that the shell draws with the design's classes, so each gets a design class.
recommendation: as below.
reversal cost: low: words by key and design classes.
response: **The design session, 2026-10-14.** **(B203)** `act.planask.does` is already keyed (DEC-232, from the design's act help: "Asks the assistant for options on this plan. It opens one planning run; the options it finds wait in the tray, labeled as its work, until a member adopts one. Nothing in the plan changes by asking."): screens-action R13 names it rather than `act.optionpropose.does`. New: `screen.members.count` ("Active members: {members} · Administrators: {administrators}"), `screen.connect.way.field` ("How do you want to connect the assistant?"), `.subscription` ("My Claude subscription (Pro or Max)"), `.apikey` ("My own Claude API key"), `.later` ("Not now"), `screen.updates.admins` ("Only your group's administrators install updates. If something needs updating, ask one of them."). `settings.set.setup` is DEC-232's. `screen.updates.skip.noreason` is not keyed: it would say what `refusal.UPDATE_SKIP_NO_REASON` already says, and two explanations never compete; the screen reads the refusal's key. **(B204 (1))** `shell.band.working` and `shell.group.unnamed` are DEC-232's (B194), unchanged; new `shell.unread` ("This could not be read. Try again in a moment."); `shell.level` retired, nothing owed. The shell's own styles become design classes in `page.src.html` (so in `shell.css`), same rules: `.mk-menuwrap`, `.mk-menu` (a `.cs-dialog` placed under the avatar), `.mk-actwrap`, `.mk-slot`, `.mk-rowname`, `.mk-scrim` (behind a blocking dialog), `.mk-image`, `.mk-imgareas` and `.mk-imgarea` (areas marked on an image; Home's `.mk-areas` is unrelated), `button.mk-avatar`, and `.mk-grp` now keeps the group's name on one line with an ellipsis. The frame's fixed height is already the design's (`.mk-page`, `.cs-frame` in `shell.css`); `body.cs`'s height stays the shell's page setting. `cs-testband` waits for N1049's band, drawn in DEC-228's small batch, which names its class. **(B204 (2))** `imported` gains the list (states b and c): "Imported cases", what they are, a row per case ("{group} · Edition {edition} · imported by {who}, {date} · {recreated} of {findings} findings recreated", "{n} in part"), "Import a case", and the empty state ("No case imported yet. Choose a case file to import the first."); Projects' link reads "Imported cases" (`screen.imported.list`) and opens the list; the crumb is "Imported cases". **(B204 (3))** an unnamed node reads "Not yet named" with its kind's icon and the card "The record holds this {kind} but no name for it yet. Open it to see the documents that mention it." (`connection.node.unnamed`, `.tip`); never its id. `step_source` gets its own group, "Stated in a source", drawn as a bold line: it is neither "Mentioned together" (the weakest tie, nothing more; affordances R59 put it there) nor a position (the job's assumption), but a declared step a member backed with a passage, graded like that document; its words move from DEC-232's lines into the graph's `KINDS`, unchanged but the drawing sentence.
decided: 2026-10-14 · the design session (P17)
reasoning recorded in: this entry; `screens/words-t48.src.py` (DEC-236), `screens/mock-screens.js` (`SCR.imported` states a to c, `v: 'list'`, `'none'`; `SCR.projects`; `KINDS.step_source`), `screens/mock-shell.js`, `screens/page.src.html` (the design classes, `.e-step_source`), `words.json` (2,193 words), `layouts.html`.
owed: (BOB) each job reads these keys at its START; screens-action R13 names `act.planask.does`; screens-settings draws `refusal.UPDATE_SKIP_NO_REASON` for a skip without a reason; interface-shell uses the design classes above in place of its own (R56) and drops them from `STYLE`; screens-daily R20's link reads `screen.imported.list` and opens the list; screens-publish's `imported` draws the list with these keys (its interim rows go); affordances R59 groups `step_source` as its own group `step_source` (the filter gains it); screens-investigate draws `connection.node.unnamed` for a node with no name. (design) N1049's band and class with DEC-228's small batch.

### DEC-237 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01Mbk3ejwX9p2JnHFTA6C8mh; the development process also runs on his primary account since K1428) (DEC-228 (4): the census's R1 and R2, and the links screens-inquiry R18 names)
for: bob-session
question: How the project page draws its members' acts, who can find a project (at its start and after), the administrator's rescue, and the links to the project's other pages and from a question to its case.
why it is Bob's: design detail beneath his rulings (K2578, K2782, K3195); decided by the design session (P17). No requirement changes.
provisional: Members as one line with invite and join; no visibility anywhere; no links.
alternative: draw the owners' ballot as a request in each owner's queue. Rejected for now: no requirement lists open ballots to owners; each owner agrees by sending the same act (project-roster R3, R7), so the page shows what waits and on whom.
recommendation: as below.
reversal cost: low: a mock screen, its acts and words.
response: **The design session, 2026-10-14, under Bob's rulings.** **Corrections to DEC-228 (4), from the requirements:** the rescue is offered at a hidden project too (it is the one act an administrator has there, K2578; project-roster R5) and is never offered for a member's own project, scope `own` (K2782, R22), not "never for a hidden project"; the owners' "ballot" is each owner making the same change (R3, R7), shown as a line waiting on named owners, not a request; a removal's reason is asked and shown but, as membership R36 has it, not refused when empty. **On `project`:** (1) "This project's work": links to its action plan, timeline, money trail, calculations, proceedings and standards, each with its reference card (`shell.card.*`; `proceeding` and `standard` keyed here); a kind the project has none of is not listed. (2) "Who can find it": "Findable: every member of the group sees it in Projects and can ask to join." or "Hidden: only its members know it exists.", its history ("Made findable by Dev, 4 October: “…” · started hidden, 3 October"), "Change who can find it…" (`projectvisibilityset`, an owner only, a reason kept in its history; a project that is a member's own or kept for counsel stays hidden). (3) Members, one row each with role and date: an owner's "Stand down as owner…" (`projectownerremove`, reasoned); a member's "Make an owner" (`projectowneradd`) and "Remove from the project…" (`projectremove`); a change waiting on owners ("Making Ben an owner · proposed by Ana, 12 October · agreed: Ana · waiting for: Dev" with "Agree: make Ben an owner"); the rule in one line ("With one owner, that owner can add a second. After that, every owner agrees…"); "Invite a member to the project", "Join", "Ask to leave this project" (`projectleave`), "Start a project from this one…" (`projectfork`, written `owed:projectfork DEC-237`: its requirement is the function `forkProject`, promotion R41, with no `op=`). (4) State c, an administrator at a hidden project whose owners are all gone: "Every owner of this project has been gone since {date}", what she sees and what taking over means, "Why", "Become its owner" (`projectownerrescue`), and the line that a member's own project is never taken over. **On `projects`:** "Start a project" opens a form: "What it is about", "Who can find it" (hidden preselected, as promotion R19's default), "You can change this later, with a reason.", "Start the project" (`promote`). **On `question`:** Concluding links the case being prepared, review copies, publishing and the published case's record. Thirty-one words keyed under DEC-237.
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.project` states a to c, `v: 'rescue'`; `SCR.projects`; `SCR.question`), `screens/registry.src.py` (`project`: seven acts), `screens/mock-acts.js`, `screens/words-t48.src.py`, `words.json` (2,238 words), `layouts.html`.
owed: (BOB) screens-inquiry's `project` act list gains `projectvisibilityset`, `projectownerremove`, `projectowneradd`, `projectremove`, `projectleave`, `projectfork`, `projectownerrescue` and its reads `projectVisibility`, `projectOwnerArithmetic`; promotion R41 spells `op=projectfork`; screens-daily R1's "Start a project" takes the title and the visibility (promotion R19); R18's links read these keys and cards; the census's §2 table: R1, R2 "drawn, DEC-237". (design) none.

### DEC-238 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01Mbk3ejwX9p2JnHFTA6C8mh; the development process also runs on his primary account since K1428) (DEC-228 (5): the census's F1, and F2's check)
for: bob-session
question: How Find draws its browse with no words, by kind and state, and how its one result list names the three kinds of result.
why it is Bob's: design detail beneath his rulings (K3052: no member meets an old interface; DEC-164 (1)); decided by the design session (P17). Who sees a watch is put to Bob as S23 (below); he answered A.
provisional: Find draws only a search with words; its list shows documents, with a passage inside a document's line.
alternative: a separate Browse screen. Rejected: DEC-164 (1) gives Find one box; with no words it is the browse.
recommendation: as below.
reversal cost: low: a mock screen, two owed acts and words.
response: **The design session, 2026-10-14, under Bob's rulings.** **F2:** each result names its kind ("Document", "Passage", "Person", "Organization", and in the browse "Question", "Action", "Plan"); the passage is its own row with the matched words marked, and a person is drawn (L. Chen, "named in 14 documents"). **F1, state c of `finder`:** the box reads "Words to find, or leave it empty to browse"; "Show" (Everything, Documents, Questions, Actions, People and organizations, Plans) and "Only" (Anything, New since you last looked, Flagged for a second look, Watched by you); "With no words, Find lists everything your group holds, newest first. New since you last looked counts from your last visit to Home; looking here does not move it."; rows marked "new since you last looked", "watched by you", "flagged for a second look by {who}, {date}: “{note}”"; the hold strip offers "Watch" and "Flag for a second look…" for what is picked. Neither act has a requirement (the census's legacy lists, F1), so both are written `owed:watchitem DEC-238` and `owed:secondlook DEC-238`; "Actions" stays also `dash-action` (DEC-214 (4)). **S23, Bob, 2026-10-14: "S23: A".** A watch is seen only by the member who set it ("Watched by you" lists the viewer's own, never another member's); a flag for a second look is seen by the group, since it asks the group, and names the member who raised it, with the date and note; any member may clear it once checked, and the clearing is recorded with who and when. The drawing and its words were already A's; nothing on the screen changes. Twenty-six words keyed under DEC-238.
decided: 2026-10-14 · the design session, under Bob's rulings (P17); S23 answered by Bob, 2026-10-14 (A)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.finder` states a to c, `v: 'browse'`), `screens/registry.src.py` (`finder`: two owed acts; purpose), `screens/mock-acts.js`, `screens/words-t48.src.py`, `words.json` (2,268 words), `layouts.html`.
owed: (BOB) requirements carrying the census's F1 into /app: a browse read over everything the viewer may see, by kind and newest first (a group-wide list of questions has no op today); a read of "new since you last looked" that does not move the mark (`lookedsince` moves it, membership R143); `watchitem` (a member's watch of an item, its changes reaching the member's queue) and `secondlook` (a flag with a note, cleared by a member), each declared and graded; screens-daily R4 gains the browse; the census's §2 table: F1 "drawn, DEC-238", F2 "served, checked, DEC-238". (design) S23's answer: folded 2026-10-14 (UX design #15, session_01PwANoKDTqJWnX1qaYSADz5); for BOB, `watchitem` reads back only to its member and `secondlook` to every member of the group, its clearing recorded.

### DEC-239 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01Mbk3ejwX9p2JnHFTA6C8mh; the development process also runs on his primary account since K1428) (DEC-228 (6): the census's A1 to A3)
for: bob-session
question: How the action page draws its risk tier, the law it goes under with the proposals beside it, and the moment a reply's date passes with none recorded.
why it is Bob's: design detail beneath his rulings (Action v0.2 rule 11; DEC-88; DEC-228); decided by the design session (P17). No requirement changes in meaning.
provisional: the action page draws neither tier nor law, and "no reply recorded" has no act; several screens called a missing reply "overdue".
alternative: the tier and the law only at authoring (`request`). Rejected: both are revised during the action's life (actions R18, R23), and the census found that the old interface's act had no home.
recommendation: as below.
reversal cost: low: a mock screen, one owed act and words.
response: **The design session, 2026-10-14, under Bob's rulings.** On `action`: (1) **"The law it goes under"**: the chosen law by level ("State · California Public Records Act, Gov. Code § 7922.535 · 10 days to reply"), "Stated by {who}, {date}", "Change the law…" (`actionlaws`); "Proposed, not chosen:" each proposal with "not the law it goes under until a member chooses it", and "Propose another law…" (`actionlawspropose`). (2) **"Its risk"**: "Tier 2 · file with caution", "Set by {who}, {date}: “{reason}” · was not assessed", "Revise, with a reason…" (`actionrisktier`, reasoned); the assistant's proposal, only with the assistant on, under "Proposed, not set:" (`actionriskpropose`'s answer, shown apart, actions R25). The tier words are keyed from the plane's `RISK_TIERS` (1 file freely, 2 file with caution, 3 do not file without counsel, not assessed). (3) **State b, the date passed**: "No reply recorded by 14 October", what that means, and "Open a question from this" (written `owed:actioninquiry DEC-239`: no requirement opens a question with an action as its reference; the old interface's act carried it so, the question left for the member to write, the action never a leg). **Everywhere**, a missing reply is "no reply recorded", never "overdue" (screens-action R5, action-producers R1): nine places on Home, Action's dashboard, the queue and the timeline strip are corrected. Twenty-four words keyed under DEC-239.
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.action` states a and b, `v: 'noreply'`; the "overdue" sweep), `screens/registry.src.py` (`action`: four acts; purpose), `screens/mock-acts.js`, `screens/words-t48.src.py`, `words.json` (2,299 words), `layouts.html`.
owed: (BOB) screens-action's `action` act list gains `actionrisktier`, `actionlaws`, `actionlawspropose` and the reads of the proposals (action-records R1, R2); a requirement for `actioninquiry` (a question opened with an action as its reference, not a leg), declared and graded; the tier and law keys read in place of `RISK_TIERS`' English; the census's §2 table: A1 to A3 "drawn, DEC-239". (design) none.

### DEC-240 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01Mbk3ejwX9p2JnHFTA6C8mh; the development process also runs on his primary account since K1428) (DEC-228 (7), the small batch, and P1's panel)
for: bob-session
question: How seven of the small items are drawn: Q2 the Muted list, P1 checking a file by its fingerprint, D3 finishing a capture, C2 acknowledging what a case does not cover, N670 the reading control, the proceeding's dates, N1049 the test-instance band.
why it is Bob's: design detail beneath his rulings (DEC-228; DEC-232's keys); decided by the design session (P17). S4 (themes) and S3 (progressions) are not small (each a set of acts on several screens) and are left to the next session, each its own DEC.
provisional: none of them drawn.
alternative: none weighed.
recommendation: as below.
reversal cost: low: mock screens, two owed reads, one owed act and words.
response: **The design session, 2026-10-14.** (Q2) the queue's foot, "Muted": each muted kind in a project, or a whole project, with "muted by you, {date}" and "Turn back on" (`queuemute` with `unmute`); `queuemute`'s help no longer says "in your settings". (P1) on `published`, "Check a file you hold": "Its SHA-256", "Check it" (`verify`), and the two answers, "This edition holds it: the evidence for finding {n}, “{finding}”." and "This edition holds no file with that fingerprint. It may be a different copy, or not part of this case."; the file never leaves the reader's computer. (D3) on Add, "Unfinished: your capture of “{title}” waits for {n} of its attachments · started {ago}" with "Finish it" (`acquire` with `continue`); the list of a member's open captures needs a read (owed). (C2) on `review-outside`, "What the case says it does not cover", the group's statement, "Your note" (required) and "Acknowledge it" (`statementack`, reasoned). (N670) on `question`, "Read in my language" (written `owed:readtranslate DEC-240`: op-declarations lists it but no requirement spells `op=readtranslate`), with DEC-232's label and "Show the original"; R50's kinds are a note, a question, a finding and a notice, so no document or passage control is drawn. (Proceeding) "Dates" in two lanes, "The proceeding" and "Our deadlines on it", "Now: {stage}", with DEC-232's help. (N1049) the visual language gains `.cs-band[data-band="test"]`, machine work's tint with a dashed rule (contrast checked in both themes), drawn on the visual-language page above the masthead with "Test Civicsmith" and `instance.test.notice`; the shell's `cs-testband` gives way to it. Twenty-two words keyed under DEC-240.
decided: 2026-10-14 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.queue`, `SCR.published`, `SCR.capture`, `SCR['review-outside']`, `SCR.question`, `SCR.proceeding`), `screens/registry.src.py`, `screens/mock-acts.js`, `screens/words-t48.src.py`, `visual-language/components.css`, `civicsmith.css`, `visual-language/page.src.html`, `visual-language.html`, `words.json` (2,324 words), `layouts.html`.
owed: (BOB) screens-daily draws the Muted list from `queue`'s `mute` (R14); screens-publish R19's panel is drawn (`verify`, `publishedCase` for the finding); a member's open captures as a read for D3 (capture R46's `liveCaptureSessions` feeds only the queue); `review-outside` gains `statementack`; plane R50 or op-declarations spells `op=readtranslate`; the proceeding draws `proceedingdates` with DEC-232's keys; interface-shell R53 draws `.cs-band[data-band="test"]` with `instance.test.band` and drops `cs-testband`; the census's §2 table: Q2, P1's panel, D3, C2, N670 "drawn, DEC-240". (design) S4 and S3, next session.

### DEC-241 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01PwANoKDTqJWnX1qaYSADz5; the development process also runs on his primary account since K1428) (WALK-084 #2, `build/plan/draft-T48-live-vs-design.md` line 53 on `tranche/T48`: the phone's More page is live in 0.84.0 but neither drawn nor registered; interface-shell R63, K3250, K3254)
for: bob-session
question: How the phone's More page is drawn, so the release can be walked against a drawing (K3296).
why it is Bob's: design detail beneath his rulings (K3296: the release renders as designed; R63 already says what the page lists); decided by the design session (P17), reported to Bob as done.
provisional: no drawing; the More tab lit for Projects, People and Settings, and the live page judged against nothing.
alternative: a sheet that slides up over the current screen. Rejected: R63 and the live product make it a page at `/app/more`, and a page keeps the path ("More") and the back step the other screens have.
recommendation: as below.
reversal cost: low: a mock screen, three derived words.
response: **The design session, 2026-10-14, under Bob's rulings.** `SCR.more` (registry `more`, frame `working`, no acts): the heading "More" with "The places the tabs below do not hold."; one row per rail place the tabs do not hold (Projects, People, Settings, in the rail's order, computed from `RAIL` and `TABS` so a place added to the rail appears here), each row its icon and name as the reference to that place (its explanation the rail's own, `rail.<k>.holds`), and beneath it a line saying what the place holds: `rail.<k>.line`, the rail's explanation after its name, derived by `build_words.mjs` so the two never drift ("Your group's investigations, their questions, plans and cases."; "The people and organizations the record follows. Your own group's members are under Settings."; "Your account, your group's members, the assistant, translations, wizards and updates."). Rows are separated by hairlines, the name in the medium size, the line in the small size and the second ink, indented under the name. The More tab is lit. On a desktop the rail shows these places; the page still opens there by its path. Never a bare list (R63's control).
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`RAIL_LINE`, `SCR.more`), `screens/registry.src.py` (`more`), `screens/mock-shell.js` (`PATH.more`), `screens/mock-refs.js` (`SCREEN_HELP.more`), `screens/page.src.html` (`.mk-morerows`, `.mk-morerow`), `screens/build_words.mjs` (`rail.<k>.line`), `words-t48.src.py` (`screen.more.sub`), `words.json` (2,330 words), `layouts.html` (68 screens).
owed: (BOB) interface-shell R63 reads `rail.<k>.line` beneath each name (not `rail.<k>.holds`, which repeats the name) and `screen.more.sub` for its heading line; `.mk-morerows`/`.mk-morerow` join the design classes `shell.css` takes from `page.src.html` (K3250); journey-check's walk compares `/app/more` at 390 px with `more`.

### DEC-242 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01PwANoKDTqJWnX1qaYSADz5; the development process also runs on his primary account since K1428) (DEC-228 (7)'s remainder, S4: themes; connections R39 to R46 on `tranche/T48`, Framework §8.4, K3)
for: bob-session
question: How themes are drawn: declaring one, placing and proposing documents and passages, taking out and rejecting with a reason, and reading them, on the screens where a member meets them.
why it is Bob's: design detail beneath his rulings and the requirements (who may act is K3's, who sees what is R42, R44, R45's); decided by the design session (P17), reported to Bob as done.
provisional: no drawing; the census read S4 as "a reasoned tag on a question's and a document's page and a filter on Projects and Find".
alternative: the census's reading, taken literally. Set aside where the requirements differ: a theme's targets are documents and passages, never a question or a project (R40), so a question shows the themes its passages are in, and Projects shows the themes beside its list rather than filtering projects by a theme they are not in; the reason is required where something is taken out (R43), optional as a note when it is placed (R40).
recommendation: as below.
reversal cost: low: a mock screen, sections on four screens, words.
response: **The design session, 2026-10-14, under Bob's rulings and connections R39 to R46.** One line explains every theme section: "A theme gathers documents and passages so members can see them together. It is never evidence: a finding cites the document or passage itself." (R39, R46). **A new screen, `theme`** (rail Projects, path Projects › Themes): state a, "Themes": every theme newest first, searchable by "Words in a theme's name or test" (`themeread` R42), each with "Belongs when:" its test, its counts placed and hunches, and "declared by {who}, {date}"; "Declare a theme" with "Its name" and "Belongs when" (`themedeclare` R39). State b, one theme: its test and declarer; "Placed in it", each with "Placed by {who}, {date}: “{note}”" (a confirmed hunch says so and keeps its proposer) and "Take it out…" for the placer or an administrator; "Hunches: not yet placed", kept apart (R44), "A hunch is not membership. It counts for nothing until a member places it.", each with "It belongs" (`themeplace` at a hunch) and "Reject…" for any member; "Taken out", each withdrawn or rejected placement with who, when and the reason (`themewithdraw`, reason required, R43). Names are handles only (R45). **The document page:** a "Themes" section after the people it names: its placements and hunches, "Place it in a theme…" (this document or the selected passage, with an optional note) and "Propose it for a theme…" (a hunch). **The question page:** "Themes its passages are in", each with how many of its passages, and "Place a passage in a theme…". **Projects:** a "Themes" section under the list ("Themes cut across projects: one gathers documents and passages from any of them."), each theme with its counts, and "Every theme". **Find:** a third filter, "Theme" (Any theme, then each theme), read by `themeread` with the theme's id: what was placed, then its hunches apart. Thirty-two words keyed under DEC-242; five acts explained, `themewithdraw` Reasoned and the rest Reversible (op-grades).
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`THEMES`, `themeRef`, `SCR.theme` states a and b; `SCR.document`, `SCR.question`, `SCR.projects`, `SCR.finder`), `screens/registry.src.py` (`theme`; acts on `projects`, `document`, `question`, `finder`), `screens/mock-acts.js`, `screens/mock-kit.js` (weights), `screens/mock-shell.js` (`PATH.theme`), `screens/mock-refs.js` (`SCREEN_HELP.theme`), `screens/words-t48.src.py`, `words.json` (2,379 words), `layouts.html` (69 screens).
owed: (BOB) a requirement drawing the theme screens in /app (screens-inquiry or screens-investigate, BOB's choice) over connections R39 to R46: the `theme` screen's two states, the sections on the document, question and Projects pages, and Find's theme filter; a count of a theme's members and hunches for the list (R42 returns themes without counts today), or the list without counts; a question's themes read through its cited passages (no op today: owed to BOB's choice, or drawn from `themeread` per theme); Find's words and a theme together (no op narrows a search by a theme).

### DEC-243 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01PwANoKDTqJWnX1qaYSADz5; the development process also runs on his primary account since K1428) (DEC-228 (7)'s remainder, S3: progressions on `timeline`; progressions R1 to R43 on `tranche/T48`, K102)
for: bob-session
question: How progressions are drawn: the matters a project follows through one, one matter's steps with its documents and findings, a progression's steps and basis, and where a document shows the steps it is threaded to.
why it is Bob's: design detail beneath his rulings and the requirements; decided by the design session (P17), reported to Bob as done. The wording of an overdue finding follows DEC-239's sweep (no "overdue" for what the record lacks) and R25 (a finding never decides).
provisional: no drawing; the old interface's "Progressions" screen is retired (K3052).
alternative: a separate Progressions screen. Rejected: the census places it on `timeline`, where a matter's dates already live, and a member reaches a matter from its project.
recommendation: as below.
reversal cost: low: three states of a mock screen, a section on the document page, words.
response: **The design session, 2026-10-14, under Bob's rulings and progressions R1 to R43.** `timeline` gains states. State a, the two lanes as before, plus "Progressions it follows": each matter with its progression, the steps threaded and its findings (`instance`). State b, one matter, "Our request for the lease amendments", followed through "A public records request", version 2: "A finding reports what the record holds and never decides: it says which step has no document, never that anyone is late."; "Its steps" in order, each with whether it is required ("required", "usually present", "sometimes present", "required unless a lawful exception applies"), its documents with their own dates and who threaded them; a step with no document says "No document threaded. The progression expects one within 10 days of step 1, by 2 October." (with no own date on the earlier step's document, only the capture date bounds it, R16, R37), with "Thread a document…" (`thread`), "Record a lawful skip…" (`discharge`, reason and citation) and "Set this finding aside…" (`proposedispose`); "How sure the chain is" (not determined below two placed steps, R9; then its weakest link); "Findings", each listed until set aside. State c, a progression: "Steps" (what comes before, how soon, required, how many documents), "Its basis" (California Government Code § 7922.535 in the sample: the 10-day determination and one extension of up to 14 days) with every version, "Revise the steps…" (a new version, a citation required, R2) and "Define a progression" (`progressiondefine`). **The document page:** "Steps it is threaded to" (`captureprogressions` R19) with "Thread it to a step…". Twenty-six words keyed under DEC-243; six acts explained; `progressiondefine` and `discharge` Reasoned, `thread` Reversible (op-grades).
decided: 2026-10-14 · the design session, under Bob's rulings (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`REQ_WORD`, `PRA_STEPS`, `TL_ST`, `SCR.timeline` states a to c; `SCR.document`), `screens/registry.src.py` (`timeline`, `document`), `screens/mock-acts.js`, `screens/mock-kit.js`, `screens/words-t48.src.py`, `words.json` (2,419 words), `layouts.html`.
owed: (BOB) a requirement drawing progressions in /app (the timeline's three states and the document's section) over progressions R1 to R43; a read of the matters a project follows through progressions (no op lists instances by project today); `overdue_successor`'s words on screen are "No document threaded. The progression expects one within {interval} of step {n}, by {date}." and never "overdue" or "late" (DEC-239's sweep, R25).

### DEC-244 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01PwANoKDTqJWnX1qaYSADz5; the development process also runs on his primary account since K1428) (the loose ends HANDOFF §0 carried: the mockups' sample dates and counts disagreed between screens)
for: bob-session
question: One sample day and one set of counts across the mockups, so a walk of the release against them (K3296) compares like with like.
why it is Bob's: page housekeeping (P17); decided by the design session, reported to Bob as done.
provisional: Edition 2 "published 19 November" on eight screens while the ceremony signed it for that date and Home said 18 September; an order of 20 November captured before the mockups' today (13 October); the queue's heading 11 items, the rail and masthead 4, Home's needs-you two to-dos the queue lacked; the assistant's limit reached "14 October"; the page's own counts (46 screens, 242 acts, seventeen wizards) stale.
alternative: move the sample day to 20 November. Rejected: the usage bars, the queue's due dates, the review copy and the proceeding's dates all already agree on 13 October.
recommendation: as below.
reversal cost: low: sample text.
response: **The design session, 2026-10-14.** The sample day is Tuesday 13 October 2026 (`MOCK_TODAY`). Edition 2 of The Coliseum lease was published 18 September 2026 (Home's own line) on the front page, the site, the published case, the docket and every reference card; the ceremony prepares and signs **Edition 3**, the draft shared for review until 20 October, to become public Thursday 19 November at 6:00 (what "Prepare Edition 3" already opened); the court's order sealing exhibit 4 is of 2 October. The queue holds every to-do Home shows (vouching for the Seminary Avenue photos, approving Rosa's letter, both under Pothole repairs): 13 items, 5 to do, 5 noticed, 3 status, in the queue's heading, the rail, the masthead's count and its explanation; Pothole repairs' card says 6 items. The assistant's account reached its monthly limit on 12 October. The page's own counts: 69 screens, 281 acts, twenty-three wizards (three required); the explanation count is stated as what the walk checks rather than a number that goes stale.
decided: 2026-10-14 · the design session (P17)
reasoning recorded in: this entry; `screens/mock-screens.js`, `screens/mock-shell.js`, `screens/mock-refs.js`, `screens/page.src.html`, `screens/registry.src.py` (`queue` gains `release`, `filingapprove`), `screens/build_words.mjs` (the limit's date), `words.json`, `layouts.html`.
owed: (BOB) nothing new; the walk of a release against the design (journey-check R6) compares against these sample texts.

### DEC-245 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01PwANoKDTqJWnX1qaYSADz5; the development process also runs on his primary account since K1428) (K3320, B207: T49 is planned from the journey install, claim, sign in, create a project, connect an assistant, capture into a question, run the assistant, the question to a conclusion; a check of the mockups found its middle and end undrawn)
for: bob-session
question: Draw every screen and state on K3320's journey that the mockups lacked, and walk it end to end, so T49 builds from drawings.
why it is Bob's: design detail beneath his ruling K3320 (P17); decided by the design session, reported to Bob as done.
provisional: "Open a question" a bare button with no field for the question's words; no new, empty question; no way from a question to capturing for it; no state for the assistant at work, its proposal, or its limit; "Conclude" a bare button, and no concluded question; no empty Projects; no walked journey from install to a conclusion.
alternative: none weighed; each gap follows the requirements already on T48 (screens-inquiry R1, R11; citation R14; ai-runs; run-productions R4; basis-versions R12, R16 to R20; ai-use R3, R13).
recommendation: as below.
reversal cost: low: mock states, words, one journey.
response: **The design session, 2026-10-14, under K3320.** **Projects**, state b: "No projects yet. A project is one problem the group wants to get to the bottom of…" with "Start a project" below. **A new project** (state b): "Your first question" field before "Open a question" (`promote`, then `drawquestion`, R11). **The question**, five new states: c, new and empty: "Nothing cited yet" with three ways in, "Capture a document for it" (to `capture`, which gains "For which question"), "Find one the group already holds" ("Find another source", `search`, R1) and "Ask the assistant to look" (`airunopen`); d, "The assistant is working on this question" (machine work, "You can leave this page…", "Stop it", `airunclose`); e, "What the assistant proposes": a reading and the passages it rests on, marked machine work, "Accept this reading" (`versionaccept`) or "Decline…"; f, the limit reached, in `ai.refused.limit`'s terms, naming no cost, with where an administrator changes it; g, "Concluded by Dev, 13 October:" the reading's own words, "What would change it", its strength, "Withdraw the conclusion…" and "Plan what to do". **Concluding** in state a is a form: "The reading you conclude on", "What would change it" (required, or "Nothing could change it", R16), "Commentary" (not evidence), "Conclude" (a member, never the assistant). **Journey 29**, "From installing to a first conclusion", walks install, claim, the group's key (with the assistant), the new group's Home, Projects, the new project, the new question, the assistant at work or a search, capture, vouch, cite, accept the proposal (with the assistant), conclude, concluded: 514 steps walked across 29 journeys. Thirty-five words keyed under DEC-245.
decided: 2026-10-14 · the design session, under K3320 (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`Q_ST`, `SCR.question` states c to g and the concluding form; `SCR.project` b; `SCR.projects` b; `SCR.capture`), `screens/registry.src.py` (`question` gains `search`, `airunopen`, `airunclose`, `versionaccept`, `owed:versionreject DEC-235`, `planopen`), `screens/mock-journeys.js` (journey 29, its brief), `screens/words-t48.src.py`, `words.json` (2,457 words), `layouts.html`.
owed: (BOB) T49 draws these on K3320's path: Projects' empty state; the first question's words on a new project (R11); the question's states c to g and the concluding form; capture's "For which question" (capture R86 has no field; `capturerequest`'s `lead_inquiry` is the nearest input, BOB's choice), opening the vouched capture beside that question; journey-check walks journey 29 live against these drawings (R6).

### DEC-246 · answered
raised: 2026-10-14 · the UX design session with Bob on his primary account (session_01PwANoKDTqJWnX1qaYSADz5; the development process also runs on his primary account since K1428) (K3320; a check of screens-entry, screens-settings, screens-inquiry, screens-intake and interface-shell on `tranche/T48` against the mockups found 21 member-facing elements on the path undrawn)
for: bob-session
question: Draw the refusals and states K3320's path requires that the mockups lacked, path items first.
why it is Bob's: design detail beneath K3320 and the requirements (P17); decided by the design session, reported to Bob as done.
provisional: the recovery codes a button only; no "already claimed"; connect's words not R30's, and no sign-in refusal drawn; the question's assistant limit the only refusal drawn; capture's refusals undrawn; the dock's registry entry saying it runs only on the member's own account.
alternative: none weighed; each follows its requirement.
recommendation: as below.
reversal cost: low: mock states and words.
response: **The design session, 2026-10-14, under K3320.** **Setup:** the ten codes shown once with "Copy them" and "Save them as a file" (screens-entry R6); state c, "Already claimed" with `refusal.ALREADY_CLAIMED`'s words and "Sign in" (R15). **Connect:** R30's words ("How do you want to connect the assistant?", "My Claude subscription (Pro or Max)", "My own Claude API key", "Not now"); beside the code, the sign-in's refusals in their keyed words (`NO_SIGNIN_WAITING`, `SIGNIN_REFUSED`, `SIGNIN_UNAVAILABLE`, `SIGNIN_ADDRESS_UNEXPECTED`, `AGENT_WORKER_UNBOUND`) and `instance.part.signin.absent` (screens-settings R5, R13, R24), each with "Reference: {ref}" (interface-shell R39). **The question:** "Stop the run" (the registry's label); state f gives the limit in `ai.refused.limit.overall`'s shape and, under "Other reasons the assistant can't work here", switched off, kept away from AI, no account, not installed, and whose account serves the member (screens-inquiry R4); the proposal names `ai.label.untested` on a test instance (R7). **Capture:** beside the address, `BAD_LOCATOR`, `SOURCE_REFUSED`, `FETCH_FAILED`, `EMPTY`, `TOO_LARGE`, each its own sentence, and the empty-field refusal (screens-intake R1, R2). **The registry's dock** runs on whichever account serves the member and says which. Sixteen words keyed under DEC-246.
decided: 2026-10-14 · the design session, under K3320 (P17)
reasoning recorded in: this entry; `screens/mock-screens.js` (`SCR.setup` codes and state c; `SCR.connect`; `SCR.question` d to f; `SCR.capture` a), `screens/registry.src.py` (`assistant`), `screens/words-t48.src.py`, `words.json` (2,473 words), `layouts.html`.
owed: (BOB) screens-entry R6 has the founder sign in as `admin` with no handle field; Bob's K3265 and DEC-230 give the founder a chosen handle at the claim: R6 is to follow them. (design, next session, in this order) the dock's dispatch answers and whose account in the dock itself (screens-inquiry R6, R13), the dock's bars (R17); connect drawing only the chosen path (screens-settings R30); setup's skip on every part and a second administrator (screens-entry R6); the re-confirm password dialog (interface-shell R34); the test-instance band in the frame (R36, R53, R58); "Draw on a question from elsewhere" with its choice and refusals (screens-inquiry R11, R16); the document's backlinks (R3); capture's writing help and draft label on "What I saw or heard" (screens-intake R3, R10); held's "Set aside" list and restore (R13); watching an address once captured, with its frequency (R14, R18); then off the path: the member menu with Sign out (interface-shell R4), the first month's question (R17), "set at setup" in history (screens-settings R33), the join link's daily cap (screens-entry R7), and four smaller (settings R7, inquiry R10, R20, intake R7).
