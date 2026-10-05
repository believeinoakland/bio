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