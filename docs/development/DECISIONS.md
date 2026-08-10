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

### DEC-71 · open
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

### DEC-70 · open
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


### DEC-31 · deferred
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

