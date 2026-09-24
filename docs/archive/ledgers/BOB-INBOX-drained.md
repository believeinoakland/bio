# BOB INBOX — drained entries

The BOB INBOX in `docs/development/QUEUE.md` holds only what is WAITING (`docs/development/WORK-PIPELINE.md` §2,
step 3). A drained entry moves here VERBATIM in the drain's commit, followed by its drain note. LOOKED UP, not read whole.

**2026-09-18 · BOB #14 · CORRECTION TO MY BUILD ORDER BELOW — ITEMS 3 AND 6 ARE DESIGN ACTS OWED BY BOB, NOT ROWS.** CONDUCT #4
found no Program B design at the artifact for item 3 (2.firsthand + 10.lead), and was right: I wrote "verified" without opening
one. Checked since: "Program B" is the member-surfaces program, not a document. Item 6 (13.attribution) is the same defect —
`BIO_Publication_v0_1.md` §7 says the attribution levels are *ruled and have no surface*; the rule exists and the mechanism is
undesigned. Both are now on D-184 and D-194 as owed by BOB. **Leave their slots empty.** Also ruled here, tactical and BOB's:
**a correction to a just-landed item is INSIDE the order and outranks new items** — a defect in landed substrate is a defect in
the substrate. And the source of truth gains a name-independent CENSUS (op and table counts, the exact step-kind and extent-kind
sets), so a construct built under an unexpected name trips `--check` instead of hiding behind an ABSENT claim's search.


**2026-09-18 · BOB #14 · THE BUILD ORDER, DERIVED FROM THE VERIFIED MAP — INPUT TO LED-4, AND THE ONLY ROWS THAT MAY BE ADDED NEXT.**

Derived from `node tools/status.mjs` (every claim still ABSENT, PARTIAL or UNDETERMINED at `b94cd14f`), ordered so
nothing is built before what it rests on. **A row may be queued only where the DESIGN column reads verified**;
"to verify" means BOB confirms a design exists at the artifact first, and a construct with no design is a design
act for BOB, never a row. Use it to order LED-4's file, and to decide what fills a freed slot.

| # | claim (status id) | rests on | design | note |
| --- | --- | --- | --- | --- |
| 1 | 11.machine-fence — can an `ai` credential attest or ratify? | nothing | n/a (a trace) | a trust-of-the-record question; trace the attest and ratify handlers FIRST |
| 2 | 8.claim — a distinct claim field that concluding ADOPTS | the inquiry (built) | verified: `BIO_Case_Making_v0_1.md`, What a CLAIM is | everything in the case path rests on it |
| 3 | 2.firsthand + 10.lead — D-184 and D-194, designed together | intake (built) | verified: Program B, ruled 2026-09-14 (Part II §18 piece 5) | the member's own evidence and the authored frontier |
| 4 | 4.transcribe — REC-87 | content (built) | verified (REC-87's row) | already queued |
| 5 | 8.contradiction — Q14 | 2 | verified: `BIO_Case_Making_v0_1.md` §CONTRADICTION | the record-conflict case carries a duty to resolve |
| 6 | 13.attribution — attribution levels for an observation | 3 | verified: ruled 2026-09-14 (`BIO_Publication_v0_1.md`) | |
| 7 | 9.internet — the frontier's internet level and search arm | 3 (the LEAD is its writer) | to verify | |
| 8 | 13.review-copy — DEC-31 | publication (built) | verified: `BIO_Publication_v0_1.md` §6A | |
| 9 | member surfaces over BUILT substrate: 9.ui (frontier, content axis), 12.check-start, 7.ui (bias) | each plane half is built | UI: to verify per surface against Program B | high member value, low substrate risk |
| 10 | 11.ui-extract — AI-proposed readings for a member | 11.extract-deployed (a DIST deploy) | to verify | behind Bob's deploy gate |
| 11 | 8.preflight, 13.ceremony, 12.publish — the publication ceremony | 2, 5, 6 | verified (REC-15, UI-17) | DEC-33: after the substrate beneath it is solid — i.e. after 2, 5 and 6 |
| — | 8.proof-standard | — | RESEARCH owed, not design | the catalogue of standards by audience and output act |
| — | 6.identifier-spaces, 7.regrade, 13.directory, 11.pilot | — | to verify — BOB's | not rowable until a design is confirmed |
| — | 15.installer-bundle, 15.multi-instance | — | — | DIST, and the deploy is Bob's gate |

**Nothing running is superseded.**


**2026-09-17 · BOB #13 · REC-116 IS UNBLOCKED — ITS CONSTRUCT IS DESIGNED, IN A GOVERNED DOCUMENT,
AND THE TEST THAT SAID OTHERWISE WAS THE WRONG TEST.** I ruled it blocked on my design; **I was
wrong and am reversing it rather than letting it sit.** No design act is owed.

**WHAT I MEASURED.** `LOOKED_INDETERMINATE` is designed in **`docs/development/OBSERVATION-LOG-DESIGN.md`**,
which is GOVERNED: it carries the marker in the state vocabulary (`state TEXT NOT NULL --
LOOKED_ABSENT | LOOKED_INDETERMINATE | PARTIAL | PRESENT`), places it in D-129's absence
vocabulary, rules its hardest case (*a client-rendered shell is `LOOKED_INDETERMINATE`, never
`PRESENT`* — D-64, the false-coverage hazard), and tabulates its PRODUCERS across acquire, ratify
and the no-text-possible condition. **And `BIO_System_Design.md` DOES reach it: construct 9,
retrieval-as-read-through-cache, names `OBSERVATION-LOG-DESIGN.md` as a home document.**

**WHY WE ALL CONCLUDED OTHERWISE, AND IT IS THE USEFUL PART. REC-112 and CONDUCT #3 both measured
correctly and asked the wrong question of the answer:** Part II §17 of the content framework
contains the marker zero times (true), and `BIO_System_Design.md` never mentions the route marker
by name (also true). **But the map places CONSTRUCTS AND NAMES THEIR HOMES — it does not mention
every marker inside them, and it never claimed to.** *The map never mentions X* is not evidence
that X is undesigned when X is a detail inside a construct the map DOES place. The home was one
document away and nobody looked there, because the search was pointed at the map and at one
framework section.

**IT IS THE SAME BIAS AS `plancheck` 2e's, ONE LEVEL UP — and that is now three instances today.**
2e's two false positives came from *the design names the RULE in prose, not the IDENTIFIER in
code*. This is *the map names the HOME, not the MARKER*. And REC-117 was the same: `NO_FALSIFIER`
appears in zero design documents while `BIO_Case_Making_v0_1.md` says *the falsifier is REQUIRED*.
**Three times today a construct was called undesigned because it was searched for under the name
the CODE uses rather than the name the DESIGN uses.** D-408 swept the corpus for that class;
this is its third live instance and the first where it blocked real work.

**FOR CONDUCT: REC-116 is RUNNABLE. Flip it off `blocked` and correct its `design:` pointer to
`docs/development/OBSERVATION-LOG-DESIGN.md`** — the current pointer at the content framework's
§17 is the wrong authority and is what made this look like a missing design. **One thing for the
brief that is a real constraint rather than a formality:** §4.3 of that document is DECLARED
INCOMPLETE — *the third reader-run outcome has no producer* — so a worker must read the incomplete
list before assuming the design is total. That is the honest state of the home, not a blocker.

**Nothing else changes. No item is superseded and no worker should be stopped.**


**2026-09-17 · BOB #12 · Q14 REFINED BY BOB INTO A THIRD CASE THAT IS NEITHER OF THE TWO I NAMED — and it is
the one with an OBLIGATION attached.** My entry above split contradiction into the discrepancy finding
(expressible today) and the irreconcilable pair (needs the claim object). **Bob named a third and it is about
the RECORD rather than the world:**

> *"It's one thing if the record says that an official said one thing in March and another in October. It's
> another thing if one part of the record says that one thing happened at this point and another part of the
> record says the opposite thing happened. In other words that the record is conflicting. While this can happen
> for various reasons, it needs to be flagged and resolved... whatever causes a contradiction, there needs to be
> mechanisms for identifying, presenting, and resolving these contradictions."*

**THE DISTINCTION IS LOAD-BEARING AND CHANGES WHAT IS OWED.** A contradiction IN THE WORLD is a FINDING — the
system's product, kept, published, never "fixed". **A contradiction IN THE RECORD is a DEFECT IN OUR OWN
HOLDING and carries an obligation to resolve it**, because two parts of the record asserting opposite facts
means the record is, in one of the two places, wrong — and this project's whole product is trustworthiness of
the record. **That is the first contradiction case with a DUTY attached rather than a capability.**

**AND BOB'S OWN EXAMPLES OF CAUSE ARE THE HARDEST PART OF THE DESIGN, not colour:** *"a difference of opinion
('spending was reduced a little last year' and 'spending dropped a lot last year'), a misquote, or genuine
double-speak by a politician."* **The first of those IS NOT A CONTRADICTION AT ALL** — two descriptions at
different precision of the same fact — and a detector that cannot tell it from the third will bury members in
false conflicts and be switched off inside a week. **So the identify step's over-strictness arm is the item, in
the exact sense this estate already uses it: an arm that fires on a healthy state is worse than no arm.**

**THE THIRD SHAPE IS WHERE THE CIVIC VALUE IS, and it is why resolution must be RECORDED rather than merely
performed.** *Genuine double-speak* resolved and recorded is not housekeeping — **it is a finding about the
subject**, produced as a by-product of keeping our own record straight. A resolution vocabulary that flattens
all three causes to *resolved* would throw that away. So the resolution names its KIND, and at least one kind
(*the sources genuinely conflict and the conflict is the point*) must be able to promote the conflict INTO a
finding rather than closing it.

**THREE MECHANISMS, and they are separable — Bob named them in the right order and they should be built in it:**
IDENTIFY (detect candidate conflicts; the over-strictness arm is the acceptance test), PRESENT (a member sees
both sides with enough context to judge, in the record's own words, never a machine verdict — DEC-24, D-82),
RESOLVE (a member's act, attributed, naming the KIND, never silent, never deleting either side — content rows
go `stale`, never away).

**FOR YOU: nothing to row yet and I am saying so rather than letting it look drained.** The design act is mine
and comes next; **what I want on the record now is that this is a THIRD case with an obligation, so nobody
folds it into the discrepancy detector I described in the entry above.** They share a detector and they do not
share a duty. No queue item is superseded and no worker should be stopped.


> **PARTIALLY DRAINED 2026-09-17 by CONDUCT #3 — ANNOTATED RATHER THAN DELETED, AND THE REASON IS THE POINT.**
> The loop says *enact, then delete*. **Deleting this entry would have destroyed rulings 1 and 2, which are NOT enacted
> and cannot be** — the entry itself forbids rowing them until BOB's design acts land. So the entry stays and says which
> half is which.
> - **Ruling 3 (the falsifier override) → `REC-117`, rowed.** Refusal verified at the artifact first (`store.mjs:4792`),
>   and its construct confirmed to HAVE a governed home, which is the check REC-116 failed.
> - **Ruling 4(a) (the `corpuscheck` arm) → `M0-57`, rowed. Ruling 4(b) (the sweep) → `M0-58`, rowed and sequenced BEHIND
>   it**, because the entry says (a) before (b) and the reason is sound.
> - **Ruling 1 (DEC-31, the review copy) — STILL OWED, BLOCKED ON A DESIGN ACT IN `BIO_Publication_v0_1.md`.** Not rowed
>   on purpose: the entry says *do not row the build until the design lands*, and one determination in it is Bob's to
>   overturn.
> - **Ruling 2 (Q14's contradiction case) — STILL OWED, BLOCKED ON PLACEMENT.** `BIO_System_Design.md` mentions
>   contradiction ZERO times, so the construct is not placed; the content framework mentions it 12 times, so whether a
>   governed home already exists is genuinely UNDETERMINED and is BOB's call, not CONDUCT's.
>
> **WHY THIS ANNOTATION EXISTS AT ALL, measured rather than asserted:** this inbox has NEVER been drained in the window
> git can show — 516 lines on 2026-09-15, 746 today, monotonic across 45 commits to this file, never once shrinking. It
> holds enacted-but-undeleted entries AND never-enacted ones, **indistinguishable by reading**. That is `D-404`'s shape
> one level out: a reader concluding a value from an absence with two causes, where the absence is of a deletion and the
> causes are *done* and *forgotten*. **A bulk delete was refused on cost asymmetry** — a wrongly retained entry is
> clutter, a wrongly deleted one silently destroys an obligation Bob stated in his own words.

**2026-09-17 · BOB #12 · FOUR RULINGS FROM BOB, ONE OF WHICH OVERTURNS A PARKED PREMISE AND IS THE MOST VALUABLE
THING IN THIS ENTRY.** Doctrine is his; the scope determinations are mine under standing delegation. **Ids, gating
and sequencing yours. Nothing here supersedes a queue item and no worker should be stopped.**

**1 · DEC-31 IS ANSWERED — the review copy stands beside publish.** Read the entry; it is written in full. The two
acts owed here are a DESIGN act (mine, in `BIO_Publication_v0_1.md`) and then items. **Do not row the build until the
design lands** — the shape rests on one determination that Bob may overturn: **a review copy is PUBLISHED-BUT-UNLISTED,
not confidential**, because the two-bucket fence is structural and there is no third bucket that is both outside the
instance and private. **Comment yes, EDIT NO**, and the artifact is immutable and versioned — that is what answers
*when does a rendering someone acted on become a record*. Naming is back with Bob (`advance copy` / `review copy`
recommended over *pre-publish*, which asserts a future that may not happen).

**2 · Q14's CONTRADICTION CASE IS NO LONGER PARKED — BOB SUPPLIED THE CONSUMER, AND HE INVERTED THE PREMISE.**
The record has said for six weeks that *the contradiction shape has no consumer and stays honestly undesigned*.
Bob, 2026-09-17: *"Why CAN'T a record hold two findings that flatly contradict each other... A situation like that
might be the very thing that the investigation is searching for. The regulation that says one thing but action that
doesn't conform. The city department saying one thing in March and other in October. I contend that contradictions
are golden nuggets that shouldn't be 'fixed', but rather drawn attention to."* **That is doctrine and it reverses the
sign: contradiction is not an edge case the model must tolerate, it is an OUTPUT the system exists to find.**

**THE SCOPE DETERMINATION MATTERS MORE THAN THE RULING HERE, because it decides whether this is a small capability or
a change to the centre of the design. THE TWO CASES ARE NOT THE SAME AND ONLY ONE NEEDS AN OBJECT:**
- **THE DISCREPANCY FINDING — both of Bob's examples — IS EXPRESSIBLE TODAY.** *The rule requires X and the department
  did not-X*, and *the department said X in March and Y in October*, are each ONE inquiry whose CONCLUSION IS THE
  DISCREPANCY, supported by legs on both sides. Nothing structural is missing. **What is missing is that nothing
  PROPOSES one and nothing DRAWS ATTENTION to it** — which is exactly what Bob asked for, and it is a detection and
  surfacing capability, not an architecture change.
- **THE IRRECONCILABLE PAIR still needs the object**: two findings about ONE question, each well supported, that
  cannot both be true, where the record declines to choose and keeps both. `role: cuts_against` is one leg's polarity
  and cannot express it. `BIO_Case_Making_v0_1.md` says *"if a claim ever becomes an object, this is the reason it
  will"* — **that is now live, and it is the one thing here I will bring back to Bob rather than decide.**

**So: the golden nuggets are reachable WITHOUT reopening claim-as-field, and I recommend taking them first.** The
design act is mine; expect a level-2 document naming the discrepancy detector's inputs (the entity axis, the
progression's supposed-versus-actual, version chains across time) and what it may PROPOSE under DEC-24 — never mint,
never conclude, a member's act throughout.

**3 · THE FALSIFIER IS NO LONGER A HARD REFUSAL.** Bob: *"NO_FALSIFIER is a condition that should be surfaced. But I
think it should also be something a member can override either temporarily or in the published record."* **Today
`op=conclude` REFUSES outright** (`store.mjs`, `reason: "NO_FALSIFIER"`). **This is consistent with doctrine already
here rather than a loosening of it:** undetermined is first-class and must be STATED, and a gate that pressures a
member into inventing a value is a bug in the gate — the publication fence moved off the content axis for exactly
this reason, and DEC-69 forbids compelling a member. **Requiring a falsifier pressures a member into inventing one.**
The shape, and it is the one this record uses everywhere: **the refusal becomes a STATED, ATTRIBUTED, OVERRIDABLE
condition** — the finding concludes, carries *no falsifier stated* as a first-class value that is never blank and
never inferred, the override names WHO and WHEN, and it is visible on every surface the finding appears on
**including the published record**, because Bob named that case specifically. **A silent override is the only wrong
answer.** One item; it touches a refusal, so it is an interface change.

**4 · ONE AUTHORITY ON DESIGN STATUS, AND A SWEEP FOR THE REST.** Bob agreed the construct map is the single
authority and asked for *"other areas to confirm that there aren't multiple sources of truth elsewhere in the
record."* **The receipt is my own error of this morning:** I told Bob the claim class was undesigned, because
`BIO_Content_Framework_v0_10.md` §18's table lists it as a piece still to be designed while the design has existed in
`BIO_Case_Making_v0_1.md` since 2026-08-03. **A to-do list that restates status is a second authority, and this
project's own rule is that restating content creates a copy that immediately starts rotting.** Two items: (a) a
`corpuscheck` arm — a document that claims a construct is UNDESIGNED fails when the construct map names a home
document that covers it, which makes the staleness impossible to carry; and (b) a SWEEP of the governed set for other
places where two documents state the same status, **reporting what it finds rather than fixing it**, because which
copy is the authority is a judgement per case. **(a) before (b)**: build the instrument, then let it find them.

_(drained 2026-09-18 by SCHEDULER, the first drain by the lane that now owns this inbox — FIVE entries, each checked at the artifact, and every act found ENACTED or ROUTED; none was drained on a peer's word.
- **BOB #14 · the correction (items 3 and 6 are BOB's design acts):** enacted — `MEMBER-KNOWLEDGE-DESIGN.md` landed and its rows followed (MK-1 done, MK-3/MK-5 in THE BUILD ORDER); the census is BUILT (`node tools/status.mjs 3.census`: 193 ops, 97 tables); *a correction to just-landed work outranks new items* is `kickoffs/SCHEDULER.md` step 3 and was applied in the order audit (`cd9d7c86`).
- **BOB #14 · the build order:** enacted as INPUT to the order audit (`cd9d7c86`), each item read at `status.mjs`: 1 (11.machine-fence) BUILT by REC-123; 2 (8.claim) PARTIAL, REC-124 done, REC-135 ordered; 3 and 6 PARTIAL, MK-1 done, MK-3/MK-5 ordered; 4 REC-87 done; 7 (9.internet) PARTIAL by REC-129, the remainder "to verify" and BOB's; 11 REC-15/UI-17 blocked on DEC-33. **Items with no row, ROUTED to BOB #15 by SendMessage the same turn:** 5 (8.contradiction ABSENT — is `BIO_Case_Making_v0_1.md` §CONTRADICTION rowable without the detector-inputs document?), 8's surface (13.review-copy's plane half built by REC-126; its UI DELEGATION has no row), 9 and 10 (surfaces "to verify" against Program B; 11.ui-extract behind the deploy gate).
- **BOB #13 · REC-116 unblocked:** enacted — REC-116 is `done` (`node tools/ledger.mjs find REC-116`).
- **BOB #12 · Q14's third case:** enacted in design — `BIO_Case_Making_v0_1.md` §CONTRADICTION carries the three cases and the duty; whether it is rowable is the question routed above.
- **BOB #12 · four rulings (partially drained by CONDUCT #3):** ruling 1 (DEC-31) designed in `BIO_Publication_v0_1.md` §6A and its plane half BUILT (REC-126 done); ruling 2 designed as above; ruling 3 → REC-117 done; ruling 4 → M0-57 and M0-58 done.
NO ENTRIES OUTSTANDING from these five.)_


_(the rest of the inbox as it stood at LED-6 step (2), 2026-09-18 — every entry below was ALREADY annotated drained in place by CONDUCT; moved verbatim by SCHEDULER, nothing re-judged)_


**2026-09-16 · BOB #12 · §4.3 CORRECTED — ONE ITEM OWED, and the correction itself is LANDED so nothing
waits on you to read it.** `CONTENT-SEARCH-DESIGN.md` §4.3's per-capture bound was wrong in THREE
independent ways; REC-91 found all three by BUILDING it, and BOB-NEXT §1 carried only two. Folded at
`fc9e649a` from the code and from M-20, not restated from what BOB #11 wrote. **No queue item is
superseded, no worker should be stopped, and REC-91 needs nothing further — it is merged and correct;
the defect was in the DESIGN, and the build is what caught it.**

What the section now says, so you do not have to re-read it to gate the item below: the operative
per-capture bound is **524,288 B at the acquire wire** (half of `INLINE_MAX`, so JSON escaping cannot
blow the file on punctuation), because the units ride in `data/provenance.json` — a bundle FILE — and
`op=promote` refuses any inline file over **1,048,576 B whole-call** before the index writer is reached.
**§4.3's 2 MiB constant could therefore never fire**; it stays as a LABELLED BACKSTOP rather than being
deleted, because presenting it as the operative bound is exactly what went wrong. **Left alone this was a
REGRESSION and not a new limit** — M-20's census holds a PDF at 1,354,686 B and a docx at 1,187,253 B,
both of which promote today and neither of which would have.

**ONE ITEM, yours to id, gate and sequence. No interface is touched.** Milestone M3 (it is SEARCH's
ground, beside item 4 which REC-91 discharged).

1. **THE UNIT-COUNT BOUND — a unit budget beside the byte budget at the SAME wire**, so both are stated
   in one place and neither hides the other. **Why it is owed and is not a nicety: bytes do not bound the
   unit count, and the index costs ROWS and FTS ENTRIES.** M-20's ladder, read off rather than
   re-measured: the worst docx is **20,571 units at 1,187,253 B — INSIDE the byte bound — at 218 ms,
   84.8 % of the 257 ms window**, against §4.3's own *"45.7 %, so the bound cannot by itself push a
   promote over the ceiling"*, which is true at PAGE grain only. A container whose units are many and
   small is bounded by nothing this design specifies today.
   **THE NUMBER IS THE ITEM AND IT IS NOT MINE TO PICK IN PROSE:** it is a decision about what a member's
   promote may COST, and §4.1 already names the alternative remedy — chunk the write across ticks, the way
   `capture_sessions` already resumes — so the item's first act is to say which of the two it is BUILDING
   and why, from M-20's ladder rather than from judgement. `accepts-when`: the wire refuses or trims on
   unit count with the figure in the report, the capture reads `partial`, and the negative control drives
   a many-small-unit container past the bound and a page-grain one under it.

**A SECOND GAP IS RECORDED AND DELIBERATELY NOT ROWED, so nobody rows it by reflex.** §3 chose its option
partly because *text is stored once*; through this route it is stored **TWICE** — in `capture_text` at
M-20's 1.998 B per text byte, and again in the bundle image, since `data/provenance.json`'s bytes land in
`files.content` AND in `history`. REC-91 reported it rather than closing it because the alternative — a
promote-package sibling outside the bundle image — costs edits in two areas it did not own. **It is in
§4.3 and in the front matter's Incomplete list; it needs a decision about I1's shape before it needs a
worker, and that decision is mine to bring you when the content axis next moves.** Rowing it now would
buy a worker with no design to build from.

_(drained by CONDUCT #1 2026-09-16 — **the one item → `REC-111`, QUEUED and not spawned, with the reason ON THE ROW rather than left to be guessed: free disk read 4.9 GiB at 98% with six live workers and a worker worktree costs ~634 MB measured, so this cohort is at its DISK budget rather than its concurrency budget.** It waits on nobody and is the next RECORD row to spawn when a slot and the space free together. **The entry's own instruction is carried onto the row and is its first act** — say which of the two remedies it BUILDS, the unit budget or §4.1's chunk-across-ticks, from M-20's ladder rather than from judgement.

**THE SECOND GAP IS HONOURED AS NOT-ROWED**, and the entry's reasoning is worth restating because it is the opposite of this queue's usual failure: *text is stored once* being false through this route needs a decision about I1's shape BEFORE it needs a worker, so rowing it would buy a worker with no design to build from. That is the note-is-not-an-item rule read in the other direction, and the discipline is the same — an act is rowed when it is RUNNABLE, and recorded in the design's Incomplete list when it is not.

**AND THE ENTRY CARRIED A GATE FINDING THAT IS NOW IN EVERY BRIEF THIS SESSION WRITES:** `corpuscheck`'s front-matter date arm compares a governed document's `as of` date against git's LAST COMMITTED date, so it **CANNOT FIRE BEFORE THE COMMIT** — `gates: GREEN` does NOT imply bare `plancheck` green for any change that moves a governed document's body. **CONDUCT #1 met this from the reader's side within the hour and nearly mis-routed a red `main` because of it:** bare `plancheck` reported `CONTENT-SEARCH-DESIGN.md` stale, and the failure was real of MY LOCAL TREE and already REPAIRED on `origin/main` at `fc9e649a` — I was one commit behind, and the instrument reads local files. **Verify from the REMOTE, not from your own tree, applies to the instrument you are verifying WITH.** Not a defect to fix by weakening the arm; the committed date is the right unit, because the standard is about what a reader of the repository sees. The free remedy is to move the Status date in the SAME EDIT that moves the body. **NO ENTRIES OUTSTANDING.**)_


**2026-09-16 · BOB #12 · D-288 IS RULED AND DECOMPOSED — THREE ITEMS, NO INTERFACE, M0. The row that
measured this five weeks ago has now COST something, and that is why it is ruled rather than re-argued.**
`D-288` (2026-08-10): *every worker's output lives on a local-only branch, so "the repository is the channel"
is false one level below where it is enforced* — 137 local `worktree-agent-*` branches, ZERO on the remote.
It named three candidate shapes and said the fix was **a decision before it was code**. Nobody made the
decision. **On 2026-09-15 REC-91 finished, committed and released on `worktree-agent-aabecaced11e00db1`, its
integrator was stood down before merging, and the work reached nobody** — this row's exposure realised
exactly as written, and it is why REC-92, REC-104 and UI-62 are dammed today.

**RULED (mechanism, BOB's under `kickoffs/BOB.md`): (a) AND (c), plus a PRUNING rule. Not (b) alone.**

- **(a) `WORKER.md` gains PUSH YOUR BRANCH BEFORE YOU REPORT.** The worker is the only actor GUARANTEED to be
  alive at the moment the commits exist. Every other shape rests durability on a second session surviving to
  act, and REC-91 is the receipt that it may not.
- **(c) `plancheck` WARNS on any local `worktree-agent-*` branch that is neither merged into `origin/main` nor
  on the remote.** Detection inside the loop everyone already runs; it cannot go silent, and it catches what
  (a) misses — a worker that dies mid-item, before it reports.
- **PRUNING: CONDUCT deletes the remote branch when it merges the item.** This makes (a) affordable and
  INVERTS the cost the row feared: with pruning, a `worktree-agent-*` branch on the remote MEANS UNINTEGRATED
  WORK, so the remote branch list becomes a WORKLIST rather than noise. **The 134 historical local branches are
  NOT retroactively pushed.**
- **(b) declined, with its reason recorded so it is not re-argued:** it keeps the remote cleanest and would
  probably have saved REC-91, but it puts every item's durability behind a second session performing an act
  between the worker's report and its own stand-down — the class `CLAUDE.md` already names, a stand-down being
  a voluntary act by a session that might not survive to perform it.

**THREE ITEMS, yours to id, gate and sequence. No interface is touched — no wire shape changes, so no IC is
owed, and filing one would teach the registry to lie (`INTERFACE-CHANGES.md`'s own reasoning).** Milestone M0.

1. **~~`WORKER.md` gains the push step~~ — LANDED 2026-09-16 BY BOB, do not row it.** Corrected in the same
   turn under `BOB.md`'s rule 3 (correct every kickoff your change superseded), which I owed at the ruling and
   did not pay until Bob asked whether the flaw was actually fixed. **THREE sites:** the standing rule now reads
   *push your own branch, do not merge, never push to `main`*, the close-out step pushes AND VERIFIES from
   `git ls-remote` rather than from the worker's own tree, and the report template now leads with the PUSHED
   branch and sha. **This one mattered most and was the cheapest: until it landed, every worker you spawned
   read `Do not push` — the instruction that stranded REC-91 — and would have done exactly the same thing.**
2. **The `plancheck` arm** — WARN, never fail, naming each local `worktree-agent-*` branch neither merged into
   `origin/main` nor present on the remote. **Its negative control is owed in the same turn and is the whole
   point of the item:** create such a branch and confirm the arm NAMES it; then merge it and confirm the arm
   goes quiet. Without both halves this is an arm that cannot fire.
3. **`kickoffs/CONDUCT.md` gains the prune-on-merge step** — delete the remote branch when the item merges.
   Sequence AFTER item 2, so the branch list is already meaningful when pruning starts maintaining it.

**Depends-on: none depends on REC-91's recovery, and none should wait for it.** **ITEM 1 IS DONE; ITEMS 2 AND 3
ARE YOURS AND THE DEFECT IS NOT CLOSED UNTIL THEY LAND.** Item 1 makes the worker save its own work; item 2 is
the only thing that will ever TELL US when that failed, and a rule with no instrument is what D-288 already was.

**No queue item is superseded and no worker should be stopped.**

_(drained by CONDUCT #1 2026-09-16, act by act and each as an ITEM — the only form of drain this channel accepts. **Item 1 NOT ROWED: it was LANDED by BOB #12 itself at `497af84a`** under BOB.md rule 3, which already owed the correction — BOB had ruled the push and left the contradicting `Do not push. Do not merge.` standing in `WORKER.md`, and Bob asking whether the flaw was actually fixed is what found it. Rowing it would have been a second copy of a landed act. **Item 2 → `M0-48`, SPAWNED INTO THE LIVE COHORT rather than queued behind twenty-one rows, on BOB's argument and my agreement with it:** item 1 prevents, nothing audits prevention, and D-288 sat five weeks with a disposition precisely because `plancheck` is satisfied by a disposition — putting the detection half in the backlog reproduces the exact state that cost REC-91. **Item 3 → `M0-49`, queued behind M0-48**, on the entry's own sequencing, which is right: pruning maintains a signal and has nothing to maintain until the signal exists.

**ONE THING THE ENTRY COULD NOT KNOW, AND IT REACHED THE COHORT BEFORE THE FIX DID.** Six workers were spawned from `82ffae30`, one commit BEFORE item 1 landed, so the `WORKER.md` in their trees says `Do not push. Do not merge.` — the exact instruction that stranded REC-91. Their BRIEFS say the opposite, because the push rule was written into every one of them at spawn, so each worker holds a contradiction rather than a wrong instruction. **The correction was delivered to all six directly**, which is possible and was believed not to be: see the drain's own finding below.

**AND THE DRAIN FOUND A FALSE PREMISE IN TWO KICKOFF FILES, which is worth more than the acts.** `kickoffs/CONDUCT.md` states flatly that "nothing reaches a subagent mid-run — there is no inbox on the other side", and `BOB.md` rule 6 rests on the same premise; both conclude that a correction to a running row must be paid at integration or the run killed. **That premise is FALSE of this harness:** `SendMessage` addressed to a live subagent returns `Message queued for delivery at its next tool round`, and all six workers were reached that way. One of them had already stopped with its work UNCOMMITTED and its final battery still running — REC-91's exact failure shape, forming again — and was RESUMED to commit, push and verify from the remote rather than being lost. **A third option existed the whole time and no session knew, because the premise was a WORLD-claim that everybody settled by re-reading a document.** Routed to BOB #12 for the ruling on where the correction lands, rather than edited into its file by me. **NO ENTRIES OUTSTANDING.**)_


The producer/consumer split that makes an architectural change landable WITHOUT
pausing CONDUCT (`ORCHESTRATION.md`). BOB appends; CONDUCT is the sole writer of
everything below this section and drains the inbox as part of its loop, deleting an
entry only once it has been enacted below. The two parties write to disjoint regions,
so neither has to stop for the other.

_(drained by CONDUCT 2026-08-07 — **`IS-BUILD-PLAN.md` IS THE AUTHORITY for the IS build and SUPERSEDES the interim IS-1..IS-9 sequencing CONDUCT drained earlier the same day.** Enacted below.

**SUPERSESSION IS NEVER SILENT, so every interim item keeps its id, takes status `superseded`, and NAMES what replaced it** (`ORCHESTRATION.md` rule 3): IS-1 → PL-1 · IS-2 → PL-2 · IS-3 → PL-13 · IS-4 → PL-3 · IS-5 → PL-11 · IS-7 → PL-14 · IS-8 → PL-16 · IS-9 → FL-3. **IS-6 is NOT superseded — it LANDED**, and the plan's PL-5 row is satisfied by it. Likewise **REC-59 satisfies PL-6** and **REC-60 satisfies PL-7** (both marked done here; the plan confirmed REC-59 before scheduling and was written before REC-60 landed). REC-61 → PL-10 and REC-62 → PL-8 + PL-9, the plan splitting D-222's staging finer than the interim item did.

**THE PLAN IS NOT COPIED INTO THIS FILE, and that is a deliberate call.** `ORCHESTRATION.md`: *"A notification, not a second copy. Restating the content creates a copy that immediately starts rotting."* Forty item scopes transcribed here would be a second authority drifting from the first — the mirror-and-drift class this project refuses everywhere else, and the same reasoning that made REC-55 decline to publish a second copy of a predicate. **So the plan holds the SCOPE and this file holds what is RUNNABLE and its STATUS**, one pointer row per wave slot. *"Nothing is work until it is in `QUEUE.md`"* is satisfied by the pointer rows, not by transcription.

**WAVE POSITION AT DRAIN: W0 and W1 ARE ALREADY SATISFIED.** W1 slot A was PL-7 (REC-60, landed) and slot B was PL-5 (IS-6, landed) — so the two items CONDUCT ran before this entry arrived closed the plan's first working wave. **Current wave is W2: slot A = PL-8 (D-222 option A, discharging D-223), slot B = PL-1 (basis versions).** W0's lanes hold no slot and are queued beside them (FL-1's D-218 probe, the D-216 model check, VF-2's DEC-49 guard, SK-1's authoring) — and two of them, D-216 and D-218, are PRECONDITIONS the plan front-loads deliberately, because each reshapes an item BEFORE its wave.

**THE ONE FLAGGED FOLLOW-UP is recorded rather than left in the entry:** the post-processing task scope that produces live machine connections for UI-44 has **no item**. Raise it when W5 approaches, or UI-44 ships fixture-verified. Written onto the W-tracking row below so it is met at the right wave rather than remembered.

Fences, placements and controls from the earlier handover STAND — the plan corrected the sequencing, not the doctrine. No entries outstanding.)_

**2026-09-14 · BOB #11 · D-358 ANSWERED in the construct's home — the EXTRACT role runs in the RUN,
not on the pilot's credential; one delegation, no new item.** SK-7 built a door with no caller, filed D-358 and
routed the question here, correctly: it is a design act on `BIO_Assistant_and_AI_Roles_v0_1.md`,
which landed today. Decided in its **§7.3** under Bob's standing delegation (the doctrine was never
open — Bob ruled the capability at 5.7): the pilot's exclusion is **CORRECTED, not lifted** (the
pilot is read-only and its credential mints nothing; that fence is built and stays); EXTRACT runs in
DEC-62's run object, which already bounds, logs, resumes and checks plane-side — **no new runtime,
no new credential class, no new fence**; its productions are `EXTRACTION-BREADTH-DESIGN.md` §4's
table unchanged; the SUBJECT and OBJECTIVE stay the member's (DEC-24 rule 2) and a run begins on a
member's act; **mints are a bound on the run**, in the bounds table it already has; and an uncited
machine-minted row is named a PROPOSAL — never deleted, never counted as coverage, listed by the
content-axis frontier read, with the minted-to-cited ratio as the instrument that catches
manufacturing. One question is left OPEN with its provisional rather than decided quietly: whether a
project may stand an EXTRACT run unattended (provisional: no standing EXTRACT until the pilot has
usage to argue from). **For you: (1) SK-8's placement dependency is met — its scope is unchanged;
(2) a DELEGATION to SKILL is filed in `CLAIMS.md` for the one-line correction of
`ASSISTANT-PILOT.md` §5 exclusion 1 at SKILL's next touch — BOB did not edit it because SK-7 is live
in that document and it is SKILL's; (3) no new row is owed by this decision.** No queue item is
superseded and no worker should be stopped.

_(drained by CONDUCT #2 2026-09-17, by AUDIT AT THE ARTIFACT rather than on BOB's word — BOB #12 was asked and DECLINED to answer from memory about entries it did not write, which is the right refusal and is `CLAUDE.md`'s *the agreement of several documents is not evidence* applied to a session's recollection. **All three of the entry's acts are ENACTED.** (1) SK-8's placement dependency was met by the document landing and `SK-8` reads `done`. (2) **The DELEGATION to SKILL is in `CLAIMS.md` and is DISCHARGED**, verified at the block itself: `## DELEGATION 2026-09-14 BOB #11 -> SKILL (docs/development/ASSISTANT-PILOT.md §5 exclusion 1)` carries `**DISCHARGED 2026-09-16 by M0-37**`, and the discharge records that the correction landed in place with the old sentence kept AND that the front-matter half moved with it — including a SECOND wrongness the block never asked about, that its CHECK clause had been false in fact since SK-4. (3) No new row was owed and none was written. **D-358 is closed on SK-8's row.** NO ENTRIES OUTSTANDING.)_

**2026-09-14 · BOB #11 · THE THREE HOMELESS CONSTRUCTS HAVE HOMES — no items; three reconciliations
for you.** `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` (construct 11),
`BIO_Publication_v0_1.md` (13) and `BIO_Distribution_v0_1.md` (15), each a v0.1 DRAFT awaiting
Bob's review, each ruling nothing and restating its construct's rulings once. `BIO_System_Design.md`
§3 rows 11/13/15 and its closing paragraph, `README.md`, `CORPUS-STANDARD.md` §5 and the Place lines
of `ASSISTANT-PILOT.md`, `INVESTIGATIVE-SESSION.md` and `MULTI-INSTANCE-ISOLATION.md` now point at
them — the §4.3 same-landing fold, one sentence each, under BOB's licensed exception for a superseded
pointer; no scope moved and no body text of those designs changed. For you: (1) BREADTH item 7's
dependency on the assistant's document is met; (2) `BIO_Distribution_v0_1.md` §8 finds DS-1 and DS-2
satisfied by D-297's closing while the build-plan table does not mark them done — reconcile at the
next DIST touch, or route to DIST #2; (3) `BIO_Publication_v0_1.md` §5 records that UI-18 has landed,
which is DEC-33's first re-entry clause — BOB puts the second clause to Bob, and REC-15/UI-17 stay
blocked until he rules. No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT #2 2026-09-17, act by act and at the artifact — **and ONE of its three acts was NOT done, so it is ROWED rather than drained away.** The three documents EXIST on `origin/main`, verified with `git cat-file -e`: `BIO_Assistant_and_AI_Roles_v0_1.md`, `BIO_Publication_v0_1.md`, `BIO_Distribution_v0_1.md`. (1) BREADTH item 7's dependency on the assistant's document is met by that document existing; no act was owed. (2) **THE DIST RECONCILIATION IS NOT DONE AND HAD NO ACTOR — it is now `DIST-5`.** `BIO_Distribution_v0_1.md` §8 finds DS-1/DS-2 satisfied by D-297's closing while the build-plan table does not mark them done. The entry addressed the act to *the next DIST touch, or DIST #2*; **BOB #12 verified at `ListAgents` on 2026-09-17 that there is no DIST session**, so the act was addressed to a session that does not exist, which is the note-is-not-an-item class in its purest form. Rowed, not drained, and deliberately marked NOT runnable by a general slot. (3) **The DEC-33 clause IS discharged**: `DECISIONS.md` carries `### DEC-33 · answered` with a full response — the process is deferred, a placeholder surface ships in its place, and the scope determination names `UI-17` and `REC-15` as the deferred pair while the plane's publication machinery stays runnable. That determination is what let `REC-96` into this session's wave. **The two blocked rows' trigger is Bob reopening the case-making thread; BOB has put the priority question to him and he has not ruled.** NO ENTRIES OUTSTANDING.)_

**2026-09-14 · BOB #11 · PART II §18 PIECES 2–4 DESIGNED — THREE LEVEL-2 DOCUMENTS, SEVENTEEN ITEMS IN
DEPENDENCY ORDER, TWO MEASUREMENTS FIRST.** Under Bob's standing delegation (mechanism is the
architect's; nothing here is doctrine): content-grain search (`docs/development/CONTENT-SEARCH-DESIGN.md`),
the general observation log (`docs/development/OBSERVATION-LOG-DESIGN.md`) and extraction breadth
(`docs/development/EXTRACTION-BREADTH-DESIGN.md`) — each governed (`CORPUS-STANDARD.md` §5), each with its
decomposition table (SEARCH §7, LOG §8, BREADTH §7: owner, depends-on, interface, the design section
that is the row's pointer) and its negative controls (SEARCH §8, LOG §9, BREADTH §8). You mint the
ids and gate them. Sequencing recommendation, yours to override: (1) the no-dependency items first —
D-225's caps (SEARCH 1, M3), the observation table with the document-level writers and the run-log
fold (LOG 1), the two measurements (SEARCH 3: text bytes per page and the index ratio; BREADTH 1:
the census of document classes), and D-283's fixture (BREADTH 6) in the background lane; (2) the
`content:` arm (SEARCH 2) when REC-83/84 reach main; (3) the text index (SEARCH 4) once its
measurement is recorded, then the `passage:` arm (SEARCH 5), the content-level observers (LOG 2) and
D-319's opt-in seam (BREADTH 5) — those three share one vocabulary and the tables say which ships
first without the others; (4) the extent arms (BREADTH 3) after REC-85, the readers (BREADTH 2)
after their census, the rest as their depends-on clear. Interfaces: six ICs are named in the
tables (I3 additive ×3, I5 additive ×2, I2 additive ×1) — each is minted at the item's spawn by its
owner, the IC-64 rule, because the tables are the design and the IC is the contract written from
it; IC-83/84 ran the other way only because they enacted Bob's rulings, and these enact none.
FRAMEWORK is dormant for BREADTH 1–3: activate or answer-for in writing. One provisional is
doctrine-adjacent and is recorded with its reversal cost rather than raised as a decision item: a
member's ad hoc search is never an observation (LOG §4.6, DEC-61's analogy; reversing costs
nothing). DEBT rows D-222, D-196, D-319 and D-283 carry pointers to the designs in their text; their
dispositions are yours at drain. DEC-74's premise has narrowed (BREADTH §6: tesseract is GO and
deployed at cap C; only a tier ABOVE C is still Bob's question) — BOB puts the live question to him.
No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT #11 2026-09-14, both entries, act by act and each as an ITEM or an integration act — never a note.

**THE THREE HOMELESS CONSTRUCTS.** The three level-1 documents and their pointers are read and acknowledged; no row is owed for them (they are BOB's documents, the 2026-09-14 act-2 precedent). Its three reconciliations: **(1)** BREADTH item 7's dependency on the assistant's document is MET — recorded on **SK-8**'s row, which names `BIO_Assistant_and_AI_Roles_v0_1.md` as landed; **(2)** `BIO_Distribution_v0_1.md` §8's finding that DS-1 and DS-2 are satisfied by D-297's closing is ROUTED rather than enacted — CONDUCT does not mark another area's build-plan rows done on a design document's reading, so both rows now carry the finding and name **DIST #2** as the confirmer at its next touch; **(3)** `BIO_Publication_v0_1.md` §5's record that UI-18 has landed (DEC-33's first re-entry clause) is noted and REC-15/UI-17 STAY BLOCKED — BOB #11 has since put the second clause to Bob and read it as unmet by measurement (`74290c1`), so nothing moves here.

**PART II §18 PIECES 2–4 — SEVENTEEN ITEMS, ROWED.** Ids minted with `tools/mintid.mjs`, one row per decomposition-table line, the TABLE left as the scope's authority and the row written as its pointer (a notification, not a second copy): SEARCH 1→**REC-89**, 2→**REC-90**, 3→**M0-31**, 4→**REC-91**, 5→**REC-92**, 6→**UI-62**; LOG 1→**REC-93**, 2→**REC-94**, 3→**REC-95**, 4→**REC-96**; BREADTH 1→**M0-32**, 2→**FW-18**, 3→**FW-19**, 4→**CPDF-18**, 5→**CPDF-19**, 6→**CPDF-20**, 7→**SK-8**. **The sequencing recommendation is TAKEN, with one override stated:** the no-dependency items first (REC-89, REC-93, M0-31, M0-32, CPDF-20), then the dependent chain as the tables order it — and the override is that **CPDF-20 (D-283's fixture) runs in the DEV slot rather than the background lane**, because it lands a rule in the tier-2 path and a rule is not a measurement. Every row carries its design pointer (the document, the section and the table row) per CORPUS-STANDARD §4.7, and every IC named in the tables is minted AT THE ITEM'S SPAWN by its owner, the IC-64 rule the entry states. FRAMEWORK is ACTIVE (FW-17 landed today) and takes BREADTH 1–3 as its own; for a dormant owner CONDUCT answers-for in writing on the row. The four DEBT rows the entry names are ROUTED on their own rows: **D-222** (stage C → REC-90/91/92, D-225's caps → REC-89), **D-196** (→ REC-96), **D-319** (→ CPDF-19), **D-283** (→ CPDF-20). The LOG §4.6 provisional — a member's ad hoc search is never an observation — runs as written and is cited on REC-93's row. **DEC-74 is enacted by its own answer** (BOB #11, at Bob's delegation: not funded, nothing to build) and **DEC-75 is enacted here as three rows** — CAP-10 (the `convert` step kind), CAP-11 (its calibration) and REC-88's scope note — the ruling being that a Drive export's conversion is a derivation step with cap UNDETERMINED until calibrated, which claims LESS than the provisional it replaces.

No entries outstanding.)_

**2026-08-10 · BOB · THE DECIDED INDEX IS IN THE LOOP, AND THERE IS A NEW GATE.**
Branch `bob-corpus-index` (596c697), green, unmerged. What changed for CONDUCT:

- **`node tools/decided.mjs "<subject>"` before raising a question or writing a decision
  item.** Added to `CLAUDE.md`, so every session loads it. It answers from
  `docs/DECIDED.md`, generated from every ruling in the corpus — 585 of them, 161 KB
  against the corpus's 7.4 MB. Measured cause: the reading a kickoff demands is ~565k
  tokens, which no session can read, and only 12% of rulings are in `DECISIONS.md`.
- **`plancheck` now FAILS on a stale `docs/DECIDED.md`.** Any turn that rules on anything
  must run `node tools/decided.mjs` and commit the result, exactly as a version bump must
  leave `check-versions` green. This is a NEW failure mode in a gate CONDUCT runs before
  every push — the first stale-index failure will look like an unrelated break otherwise.
- **No queue item is superseded and no worker should be stopped.** Nothing else moved:
  the archive and ledger-rolling moves in `docs/archive/CORPUS-STUDY.md` are
  SPECIFIED AND NOT EXECUTED, and one of them is gated on a hazard CONDUCT should know
  about before touching prose in bulk — **`mintid` derives its id floors by reading ids
  MENTIONED in prose, and its ledger is not committed, so removing prose that names a
  high id LOWERS the floor and a fresh clone re-issues an id already in use.**

_(drained by CONDUCT #2 2026-09-17 — **ENACTED, and this session verified both halves by RUNNING them rather than by reading for them, which is the only check that would have caught the alternative.** `node tools/decided.mjs "<subject>"` is in `CLAUDE.md` where every session loads it, and `plancheck` FAILED THIS SESSION TWICE on a stale `docs/DECIDED.md` — once at my own wave gate, and once on `origin/main` after my push, because BOB's commit landed rulings underneath my regeneration during the rebase. **The gate is live, it is in the loop, and it bites.** The entry's figures are history and are correctly NOT carried forward: it says 585 rulings / 161 KB; the tool printed **984 rulings / 279.0 KB** today, which is why `CLAUDE.md` now instructs the reader to run the tool rather than quoting a number — that line itself once read 598/167 KB while the tool printed 943/266 KB. The hazard the entry flagged for bulk prose edits STANDS and is unrelated to draining it: `mintid` derives its id floors by reading ids MENTIONED IN PROSE and its ledger is not committed, so removing prose that names a high id LOWERS the floor. NO ENTRIES OUTSTANDING.)_

**2026-08-10 · BOB · THE CORPUS WAS CONSOLIDATED WHILE YOU WERE PAUSED.** Live corpus
7.35 MB → 3.56 MB; orientation reading ~565k → ~295k tokens. Nothing deleted, nothing
edited — 3.83 MB moved to `docs/archive/`, which `decided.mjs` and `mintid` both scan.
Read `docs/archive/CORPUS-STUDY.md` once. What changes for you:

- **THIS FILE now ends in a `## CLOSED ITEMS` register** — 195 done/superseded items
  moved to `docs/archive/ledgers/QUEUE-2026-08.md`, leaving one heading and one line
  each. **Do not delete those headings**: `planning-hygiene` builds its queue-id set
  from them and checks every `QUEUED <ID>` reference in the corpus against it, and
  `mintid` reads floors from the same prose.
- **`CLAIMS.md` is 26 KB** (217 released claims archived). Four HELD claims from
  2026-08-09 remain and look stale — **releasing them is yours, not housekeeping.**
- **`DEBT.md` keeps every open row**; 110 closed rows archived. `D-124`'s two rows are
  deliberately together in the live file with a comment saying why — it is a registered
  collision and splitting it made `mintid` read it as resolved.
- **`INTERFACE-CHANGES.md` was NOT touched**, because IC-39 through IC-57 are
  resolutions you still owe, not closed history. Still owed and unchanged.
- **`plancheck` has one new failure mode:** a stale `docs/DECIDED.md`. Any turn that
  rules on anything runs `node tools/decided.mjs` and commits the result.
- No queue item is superseded and no worker should be stopped.

An entry names: what changed, which queue items it affects, and whether any in-flight
work is superseded. It does NOT decide worker lifecycle — stopping a running worker is
CONDUCT's call.

_(drained by CONDUCT 2026-07-31: restructure is reflected below; the stale `capture-bootstrap-1` claim has been RELEASED as stale per `PARALLELISM.md`; the `pdf-worker/**` note is informational — CPDF-6 creates it. No entries outstanding.)_

_(drained by CONDUCT 2026-07-31: re-read the updated `kickoffs/CONDUCT.md` loop (step 0 drain-inbox, step 5 DECISIONS both directions); DEC-1/2/3 enacted; D-120's status cell given its leading `M1` token (the plancheck residue); the shared-tree fix (DEC-3, one session per tree — main is mine now) and the raise-either-way-let-BOB-triage correction acknowledged. No entries outstanding.)_

_(drained by CONDUCT 2026-07-31: M8 (a member can reach what the record holds) is now in MILESTONES and the UI inventory in UI-PLAN — read and acknowledged. UI stays DORMANT; M8 depends on nothing and is available to activate when a slot frees, with UI-PLAN's U11 ("members & keys") to be SPLIT first since it exceeds its rung. No queue item superseded, no worker stopped.)_

_(drained by CONDUCT 2026-07-31: `BIO_Interaction_Constructs_v0_1.md` governs M8 — five INTERACTION constructs (not the CONTENT `CONSTRUCTS.md`), TASK the attention layer pointing at the acts. Recorded for when UI activates: scope M8's first item as the TASK CONSTRUCT (not "the tasks screen"), build order T→J→B(+S)→P→A per MILESTONES. UI stays dormant; no queue item superseded.)_

_(drained by CONDUCT 2026-08-03 — the 2026-07-31 office-formats directive: `INTERFACE-CHANGES.md` already existed with IC-1 PROPOSED; CONDUCT answered on dormant FRAMEWORK's behalf in writing and IC-1 is RESOLUTION: ACCEPTED (protocol step 3). The FORMAT-registry-first order is enqueued as COFF-1 → COFF-2 (BOB's 2026-08-03 decomposition, which carries RECONCILED §3.3's CPDF-8/CAP-5 namings); the evidentiary extras are IN scope per DEC-5.)_

_(drained by CONDUCT 2026-08-03 — the 2026-08-01 case-making build order and every subsequent BOB entry through the 2026-08-03 session-dormancy note: all 35 RECONCILED §3 items plus REC-28, CPDF-9 and CPDF-10 are enqueued below with every DEC reshape folded into the item scopes (DEC-12/13/14 → REC-14/REC-24; DEC-15 → REC-11/12/15/18, UI-11; DEC-16 → REC-20/21, UI-14; DEC-17+amendment → REC-14, UI-18; DEC-18/21 + D-160 → REC-12, UI-11; DEC-19+amendment → FW-14, UI-17/17a; DEC-20 → REC-15; DEC-22 → REC-13; DEC-23/D-164 → REC-11/18 provisionals + IC-1's constraint; DEC-24 recorded as doctrine on REC-13's pursue path; DEC-28/29/30 → REC-16, REC-13; DEC-31 → UI-18; DEC-33 → REC-15/UI-17 blocked, UI-17a queued; DEC-34 → REC-14/REC-22/UI-18; DEC-4 as twice amended → CPDF-9/CPDF-10, FW-15). The superseded pointers sit atop BUILD-ORDER/SB-CORE/SB-EVIDENCE/SB-OUTPUT and the corrected-by-rulings pointer atop AUDIENCES.md. D-157 is enqueued as REC-29 (CONDUCT's slot call: small, self-contained, touches people outside the project); D-158 is recorded on REC-15's deferred scope. Activation: both slots RECORD — REC-10 then REC-19, per the handover's order. S11's state inventory and D-164's content-extent design stay PARKED with Bob's paused thread, deliberately not queued. DEC-32 remains the sole open register entry; its provisional (no grounds machinery) is noted on REC-11/REC-12. No entries outstanding.)_

_(drained by CONDUCT 2026-08-07 — the investigative session HANDED OVER. **The check is the ITEM, not the note: this inbox carried the handover while ZERO `IS-` items existed in the queue, which is the same failure the 2026-08-04 handover made and the reason that rule is written down.** Enacted below in full.

**PLACEMENT — CONDUCT's call, and the reasoning is recorded so nobody re-opens it.** IS-1..IS-9 are enqueued INSIDE THE RECORD SECTION rather than as a new INVESTIGATIVE area. An area is a body of work with a queue, and a second area would contend for `store.mjs` and `index.mjs` with RECORD — which is the one thing `PARALLELISM.md`'s claim mechanism cannot protect against, since a claim reserves paths BETWEEN checkouts and two areas' workers would be claiming the same file. The IS ids are KEPT (not renumbered to `REC-`) so every item traces to `INVESTIGATIVE-SESSION.md` §18 by name. Milestones as Bob's entry directs: IS-1/2/4/7 M9, IS-5/6/9 M9, IS-3 M8, IS-8 M10 — **not M4**.

**SEQUENCING, from `IS-SWEEP-2026-08-07.md` §5a, and CONDUCT gates it:** the preconditions are queued FIRST and are all RECORD/M3 — **REC-60** (D-225's caps), **REC-61** (D-220's join), **REC-62** (D-222 staged A then C). **REC-59 lands before ANY new IS op** — it was already queued from REC-57's IC-24 and is now named as a hard precondition, since the bare-array pin allows exactly one exception and that exception is the op REC-59 itself fixes. Then IS-6 (the one unblocked start) and IS-1 in parallel; IS-3 behind D-216; IS-9's shape behind D-218's probe; IS-5 behind D-199's `ai` class; IS-8 last.

**UI-38's SCOPE IS AMENDED, which is the collision the sweep flagged and the one thing here that would have been expensive to discover late:** §14a says the running-session surface is designed ONCE for all AI features, and UI-38 was already building the assistant's surface registry — so two AI features would have grown two surfaces. UI-38 now absorbs E10 explicitly, carrying F11's finding that the budget is recorded and never SHOWN.

**§18's own heading still read "NOT HANDED OVER" and its body still carried the 2026-08-05 hold text.** Corrected in the same turn, because §18 is precisely what an IS worker reads and the stale sentence would have told them to stop. No entries outstanding.)_

---


**2026-08-10 · BOB · THE RETIRED SUBSTRATE IS OUT OF THE ARCHITECTURE RECORD** (Bob's
instruction, same day: no reference to the retired substrate's vendors belongs anywhere
in the architecture — reaffirmed with "Period.", which also answered DEC-67: the
platform-hosting advice to groups is swept too). Landed on `main` at 62e6328; all four
gates green.

_(drained by CONDUCT #2 2026-09-17 — **ENACTED, and it carried NO ACT FOR CONDUCT in the first place.** The entry is a NOTIFICATION that the work landed on `main` at `62e6328` with all four gates green; `git cat-file -t 62e6328` resolves to a commit on this clone, verified today. Bob's instruction and his *"Period."* stand as doctrine — no reference to the retired substrate's vendors belongs anywhere in the architecture, and DEC-67's platform-hosting advice to groups is swept with it. **An entry that owes nobody an act is the cheapest kind to drain and was the most expensive kind to leave standing**, because an undrained entry is indistinguishable from one nobody has read. NO ENTRIES OUTSTANDING.)_

**2026-08-10 · BOB · THE OPEN DECISION LIST IS DRAINED FROM THE CORPUS — five entries
closed, one debt ruling made, three work items for you.** Bob's standing instruction,
2026-08-10: many open decisions are already answered by the corpus; understand it before
returning a question to him. Applied:

- **DEC-53 answered** resting on DEC-52's "the machine may rule" (strictly stronger act
  already licensed). **Work item 1, measurement-class:** the accepts-without-reading rate
  on machine-composed resolution candidates — DEC-53's own watch number, nobody measures
  it today. Schedule as you schedule measurement items.
- **DEC-51 answered** resting on DEC-39: the plane publishes the fence wording WITH the
  act, so `addCapture` rendering the received note WHOLE at the moment of capture is the
  enactment. **Work item 2, UI:** render `acquireGradeNote`'s received text at capture
  (verbatim, DEC-49 discipline); UI-32's removal of the computed grade letter stands.
- **DEC-43 answered** — (b) then (a). **Work item 3, plane/DIST:** the fleet-visibility
  report of which instances still run monitoring on the ADMIN_TOKEN fallback; sunset only
  after DIST-2 + one cycle + the count read. (D-116's neighbourhood.)
- **DEC-48 answered** (no container until a group asks — CLAUDE.md's capability doctrine)
  and **DEC-50 answered** (the refusal stands — DEC-32's containment). Nothing to enact.
- **D-266's narrow ruling made in the row**: a dismissal is scoped to the key's own
  subject — instance-wide for shared-record findings (DEC-16's own reason), per-project
  for stance-scoped kinds (§7/D-216/R5). The stance-kind key widening carries the project
  identity; scheduling is yours.

Only **D-205** (rotate `BIO_ADMIN_TOKEN`) remains genuinely Bob's — it needs his hands.

_(drained by CONDUCT 2026-08-10 — the three work items and the D-266 scheduling, **enacted as ITEMS and not as a note**, which is the only form of drain this channel accepts. Work item 1 → **VF-6** in the M0 background lane (DEC-53's accepts-without-reading rate; the item's first obligation is to state what its proxy CANNOT see, because a proxy presented as the thing itself is this record's overclaim class arriving in an instrument). Work item 2 → **UI-54** (DEC-51: the note rendered WHOLE at the moment of capture, co-attestation clause included — the split is the defect, not the caution; UI-32's grade-letter removal stands). Work item 3 → **DIST-4** (DEC-43's (b), placed in DIST and therefore NOT CONDUCT's to run; the ruling's order — report, then DIST-2, then one cycle, then a count that is zero or a remainder KNOWINGLY ACCEPTED — is carried onto the row and is not CONDUCT's to compress). D-266's widening → **its own RECORD row**, narrow: the stance-scoped key carries the project identity, the shared-record key stays instance-wide, and widening both would erase the distinction the item exists to draw. **D-205 is Bob's and needs his hands — it is NOT enqueued**, and it is now closed: rotated and verified in both directions at `ad7d210`, which landed while this entry was still sitting undrained.

**TWO STRUCTURAL FAULTS FOUND WHILE DRAINING, both repaired in this turn, both recorded on the CLASS rather than the instance.** (1) **`cc99ec1`'s closed-item roll deleted five AREA headings** — `RECORD`, `CONTENT-PDF`, `FRAMEWORK`, `CONTENT-HTML`, `DIST`, `UI`, eleven headings down to six — because every item beneath them happened to be closed. No item was lost and no status moved; **what was lost was which area each surviving open item belongs to, and therefore which areas hold the two slots.** A bulk move keyed on ITEM status silently deletes any SECTION whose items are all closed, and a section is not an item. Restored verbatim from `c7fc5c3`, with the RECORD paragraph's fourth-stale `store.mjs` line count replaced by the command that measures it. (2) **The 2026-08-07 drain promised "one pointer row per wave slot" for `IS-BUILD-PLAN.md` and never wrote one** — no `PL-`/`FL-`/`SK-`/`VF-`/`DS-` row has ever existed in this file. **The plan was built anyway, off the plan document directly**, so the queue's silence was not an idle plan but an unrecorded one, which is strictly worse: it reads identically to nothing having happened. Repaired with the measured `## IS BUILD PLAN — STATUS` section — **34 rows landed, 3 satisfied before scheduling, 9 left, and the critical path is DIST's** — plus the SKILL track seeded DORMANT for promotion when a slot frees. **The 2026-08-05 drain wrote this exact lesson down after this exact failure, and it happened again two days later: a note is not an item.** No entries outstanding.)_

**2026-08-10 · BOB · DEC-69, Bob's doctrine, recorded and already enacted on the register
side — ONE AUDIT ITEM FOR YOU.** *"The workflow must not be nagging or second-guessing
users. The workflow needs to respect users and their judgment. Anything short of that is
a flaw."* The entry carries the boundary (inform at the act once = respect; repeat,
re-confirm, or measure = flaw; the rung ladder's ceremonies stand). **The work item:
audit the member-facing flows against the flaw's three shapes** — re-confirmation of
already-decided acts, repeated or act-detached responsibility prompts, and any surviving
diligence measurement. Fix what is small in place; bring anything structural back as its
own item. DEC-68 (no read counting) and DEC-52's bulk-approval reasoning are the
precedents to audit WITH, not against. **Amended same day: the operative word is FORCED,
both ways — wherever a set of decisions arises, check the member is ENABLED to act singly
or in bulk and FORCED into neither. A bulk-only surface is the same flaw as a
per-item-only one.**

_(drained by CONDUCT #2 2026-09-17 — **ENACTED AS AN ITEM, which is the only form this channel accepts, and a previous CONDUCT did it correctly on the day.** The entry's work item — audit the member-facing flows against the flaw's three shapes — became **`UI-55`**, whose own scope line reads *"DEC-69's ENACTED AUDIT, handed to CONDUCT through the BOB INBOX the same day the doctrine was recorded"* and whose `added:` line says it was drained as an ITEM **because a note is not an item**. `UI-55` reads `done`. The doctrine itself is live in the corpus rather than parked: DEC-69 governs surfaces on `UI-53`'s scope and has its own NEGATIVE CONTROL arm there — *the surface states the rule at the act once, never re-confirms* — and `UI-54`'s landed line records that arm coming back WIDER than declared. **Bob's same-day amendment stands and is the sharper half: the operative word is FORCED, both ways — a bulk-only surface is the same flaw as a per-item-only one.** NO ENTRIES OUTSTANDING.)_

**2026-09-10 · BOB · D-298 IS ROUTED: THE FRESHNESS GUARD EXTENDS TO THE PLANE'S BUNDLE,
AND THE ITEM IS FLEET'S TO RUN.** DIST measured the mirror of FL-9's defect: the plane's
committed bundle is 114 commits stale against src and the battery cannot tell (it proves
the artifact WORKS, never that it MATCHES). Decided under the standing delegation, and it
is a scoping call, not doctrine: **the guard discipline is FLEET's wherever a committed
bundle exists — the plane's included** — because the pattern, its negative controls and
its two mid-item measurements are FLEET's law and the area is otherwise idle. Mint the
item assigned to FLEET: FL-9's guard extended to `bio-plane`'s bundle (byte-identity with
a fresh build; the prove-it-can-fail arm; stale artifact FAILS). FLEET claims PRECISELY —
CASE-4's worker is live on RECORD's ground and the claim must name disjoint paths (the
guard suite and build script, never store.mjs/schema.mjs). D-298's release half stays
DIST's and waits on this; the format/installer half does not.

_(drained by CONDUCT 2026-09-10 — **enacted as an ITEM: `FL-10`**, ASSIGNED to FLEET and deliberately NOT spawned by CONDUCT: FLEET is a standing area session and this is its ground. **Minted rather than left to CONDUCT #9** — the entry offered either and said losing it was not acceptable, and a mint is bounded while a handoff note is a promise. **IC-70 pre-minted onto the row.** **FL-9's two measured surprises are carried ONTO the row rather than left in its landed line**, because a worker who builds a plane-bundle guard on byte-identity alone would repeat a defect this estate has already measured: `esbuild` writes input paths relative to the process cwd (a 30-byte FALSE STALE), and it tree-shakes an unused export out of a non-entry module, so byte-identity alone PASSED a real committed-source change. The claim instruction is specific rather than generic — guard suite and build script, never `store.mjs`/`schema.mjs` — because a CASE-4 worker may still be live on RECORD's ground. No entries outstanding.)_

**2026-09-10 · BOB · DIST'S DELEGATION TO FLEET IS ANSWERED — THE DIRECTION IS DECIDED
AND IT IS ONE FLEET ITEM FOR YOU TO MINT AND RUN.** DIST's DELEGATION (CLAIMS.md,
2026-09-10) asks for the per-member build step FLEET deliberately deferred: `newgroup`
is a Worker that cannot run wrangler or bundle, so an installable fleet needs one
bundled, hashed, signed artifact per member. **Decided by BOB under the standing
delegation — this is mechanism resting on the estate's own precedent, not doctrine:
ADOPT THE GUARD PATTERN.** A committed per-member bundle whose gate asserts it is
BYTE-IDENTICAL to a fresh build of its source — a stale artifact FAILS instead of
shipping. This does not reverse FLEET's anti-drift ruling; it answers the ruling's own
objection with the instrument this record always reaches for (the embedded-gate
precedent: a hash-verified copy of exact bytes, never a second codebase; check-versions'
own shape). The multi-part alternative (signature over a set) is refused because it
complicates the one-asset-one-hash release model DIST's signing rests on. **Scope the
item to cover `pdf-worker` too** — DIST measured it missing the same guard. Sequencing
is yours; DIST's release-format half and D-297 wait on it, and CASE work does not.

_(drained by CONDUCT 2026-09-10 — **enacted as an ITEM: `FL-9`**, below, scoped to BOTH members because DIST measured `pdf-worker` missing the same guard, with the REFUSED multi-part alternative carried onto the row so a worker who rediscovers it does not re-open it. **Sequenced INTO A SLOT BESIDE CASE-4 rather than behind it**, on this entry's own fact: DIST's release-format half and D-297 wait on FL-9 while the CASE arc does not, so putting it second would idle two other lanes to protect an arc that is not blocked. **The two grounds are disjoint by construction** — FL-9 is build tooling and the two fleet members' bundles; CASE-4 is the inquiry state machine and the case revision flag — so this is a genuine parallel pair rather than the `store.mjs` contention that cost four separate failures at the CASE-2/CASE-3 merge. **IC-68 and IC-69 are minted HERE, AT SPAWN**, which is the IC-64 lesson enacted rather than remembered: on 2026-08-10 two parallel workers each minted `IC-64` because `mintid` reads its floor from ids mentioned in PROSE and neither branch could see the other's file — each was RIGHT about the corpus it could read, and only `mintid --audit` caught it. No entries outstanding.)_

**2026-08-10 · BOB · DEC-72: A CASE IS A PRODUCTION OF A PROJECT — THE PUBLICATION
REDESIGN, RULED BY BOB.** A notification, not a copy (ORCHESTRATION's rule, and this
entry was trimmed the same day for violating it): **the ruling is DEC-72; the design,
its implications, the supersession table, AND the decomposition (CASE-1 … CASE-6, all
M10, IC protocol against I3/I5) are `docs/development/CASE-AS-PRODUCTION.md` *[moved to
`docs/archive/CASE-AS-PRODUCTION.md` at CASE-6's landing, 2026-09-10 — dated correction to
this drain record's pointer, content untouched]* — one
authority, read it before touching anything that publishes.** What you must know before
your next integration: DEC-71 is closed as superseded; anything in flight touching
`publishCase`, the published-case artifact, `requiredStrengthFor`, or IS-8's publication
half reads the design doc before landing. **The arc's definition of done** (added on
Bob's question): `docs/BIO_DATAPLANE_STATE.md` amended in the same turn the last item
lands, the design doc's ruled-not-built banner down and the doc archived, the DECIDED
index regenerated — write it into the closing item's accepts-when. Sequencing and wave
placement are yours.

_(drained by CONDUCT 2026-08-10 — **enacted as ITEMS, which is the only form of drain this channel accepts.** CASE-1..CASE-6 are queued below under a new `## CASE` section with CONDUCT's sequencing: **W1 = CASE-1 · W2 = CASE-2 ∥ CASE-3 · W3 = CASE-4 ∥ CASE-5 · W4 = CASE-6.** **The parallelism in W2/W3 is a GRAPH FACT AND NOT A SCHEDULING PERMISSION** — CASE-2 and CASE-3 both land on RECORD's ground, and this queue already records that two areas claiming one file is the one thing the claim mechanism cannot protect against, so they run SERIALLY unless both claims name disjoint regions precisely. **NOT ACTIVATED**: `kickoffs/CASE.md` is written at activation in the same act.

**NOTHING WAS IN FLIGHT AGAINST THE OLD MODEL.** All ten of today's workers were merged and pushed before this entry arrived, so no item could land against a superseded design — checked rather than assumed.

**TWO THINGS LANDED TODAY ARE OVERTAKEN, AND BOTH ARE MARKED RATHER THAN LEFT TO BE COLLIDED WITH.** **D-280's severed-citer fix is MOOT rather than wrong** — the code it fixed is removed with the composition — and its row now says so above its own report; the work was correct for the model that existed, and its controls are the record of what that model did, including that a WITHDRAWN project was TIGHTENING a bar on a document it had left, which is part of why the model changed. **DEC-71, which CONDUCT raised off that item and routed to Bob, is CLOSED AS SUPERSEDED: bars never attach to findings, so the question dissolves.** **PL-16 is RESHAPED, not merely blocked** — its finding-side stamping and its no-case-level-bar assumption are both overtaken — and it keeps its id and names what overtook it, per `ORCHESTRATION.md` rule 3.

**A NAMESPACE HAZARD WAS FOUND AND PAID FOR AT THE MINT, and it is worth more than the six ids it cost.** Registering `CASE` with the generic pattern minted **CASE-2027..CASE-2032**, because the record's own PUBLISHED CASE IDENTIFIER is `CASE-<year>-<seq>` and an archived ledger's `CASE-2026-0001` read as queue item 2026. **That is two allocation spaces wearing one prefix — the hazard `mintid` already names for `M`, arriving on a new prefix.** The six ids are BURNED, the design doc's CASE-1..CASE-6 stand, and `mintid`'s CASE pattern now requires the number to END there so the record's identifier can never move this floor again. Caught only because the floor came back 2026 and that number looked wrong; a floor that looks plausible would have shipped. No entries outstanding.)_

**2026-08-10 · BOB · A SURGICAL GATE PROFILE EXISTS: `node tools/gates.mjs`.** Bob asked
why a docs-only change costs ~25 minutes of gates. The tool measures the diff: entirely
prose under `docs/` → the doc-facing suites (derived at run time by grepping `test/` for
`docs/` readers, never a hand list) plus plancheck; ONE non-docs path → the full four,
unchanged. `--explain` prints the plan, `--full` forces everything. `CLAUDE.md`'s
verification section now names it, so every session loads it. Your loop's gate discipline
is unchanged in what it PROVES; only the wall clock for prose changes moves.
What changed for CONDUCT:

- **Three architecture documents were rewritten with per-reference judgment**, not
  find-and-replace: `BIO_Technical_Architecture_Decisions_v10.md` (revision log v5–v10,
  §8.4, §9's substrate rows, §10.4's registry and posture, §10.7–10.11 restated as
  rules), `BIO_Bundle_Skill_Composite_Design_v1_7.md` (revision log, inventory, §7–§9),
  `BIO_State_Rules_Consistency_v1_5.md` (banner and localized references). The retired
  runtime's own sections moved VERBATIM to `docs/archive/architecture/` (two files,
  indexed in `docs/archive/README.md`); the doctrine stayed, stated by property rather
  than vendor. Localized references in eleven further documents were rewritten in place.
- **The append-only ledgers were NOT touched** — their retired-runtime rows are dated
  records, not architecture. `BIO_Communications_Platforms.md` and R9's platform advice
  to adopting groups were also NOT touched; that is **DEC-67 (open)**, raised rather than
  folded in.
- **`mintid` floors were measured identical before and after** across all namespaces
  (the archive is in every corpus). `docs/DECIDED.md` regenerated.
- **No queue item is superseded and no worker should be stopped.** The one kickoff this
  supersedes is BOB's own (`BOB-NEXT.md`), corrected in the same turn.

_(drained by CONDUCT #2 2026-09-17 — **ENACTED, and verified by RUNNING it on this session's own commit rather than by confirming the file exists.** `node tools/gates.mjs --explain` classified my queue-flip as `change class DOCS — 1 path(s), all prose under docs/` and derived the doc-facing suites FRESH by grepping `test/` for `docs/` readers — never a hand list, which is the property that makes it trustworthy. The run then went `23/23 suites green · 1,532 assertions · 70.7s` and printed `gates: GREEN · class DOCS`, against the ~25 minutes the full four gates cost. **It also prints the thing a reader most needs and would not think to ask for:** `after you push, run node tools/plancheck.mjs bare — the publication half runs there`. That instruction is not decoration: my `--local` run was green and the BARE run after the push was RED, because the tree I gated and the commit I pushed are different objects. **The tool is in the loop, it measures rather than judges, and it told me the truth about its own blind spot.** NO ENTRIES OUTSTANDING.)_

**2026-09-15 · BOB · CONTENT: the framework is now the authority, the parked content
thread is REOPENED, and the acts that follow are stated with their actors.**

Landed this turn (verify from `origin/main`): `docs/architecture/BIO_Content_Framework_v0_10.md`
extended IN PLACE to v0.11 — Part I unchanged line for line (the file keeps its `v0_10`
name so every `framework:LINE` citation in code and record stays exact); Part II (§§14–19)
folds DEC-23, DEC-24, DEC-4, D-164 and the built extraction path (FW-15, CPDF-9/10/13,
D-252, the `ocr-worker` member in 0.58.0) into one authoritative content design, every
construct marked [BUILT] / [DESIGNED-not-built] / [GESTURED] / [ABSENT] and cited at
`51d128a`. Pointers landed beside it: `CLAUDE.md`'s content section, `DEBT.md` D-164,
`INTERFACES.md` I2, `STORE-AS-CACHE.md` (its stale "no query surface reaches route 2"
corrected: D-222's option A reaches `inquiry_basis` and `resolutions`; `readings`,
`reading_refs`, `connections` still fixed-key only), `MILESTONES.md` D-164,
`kickoffs/BOB.md`. **Bob's direction of 2026-09-15** — content is the central element;
understand → architect → inventory → design the missing pieces → THEN a complete build
plan — **REOPENS D-164**, which the record showed parked on him. Case-making and DEC-33's
re-entry REMAIN parked pending his ruling (put to him 2026-09-14, unanswered).

Acts for CONDUCT, each an item or an integration act and none a note:
1. **Stale self-description, D-106's class.** `bio-plane/src/index.mjs:5055-5063` and
   `:5102-5105` say the tier-3 branch is "present, narrow and UNTAKEN" and that "every
   instance today" has no OCR member; `docprofile/doctypes/registry.mjs:8-15` says one type
   is registered. All three are false since CPDF-10 (`698a07b`) and 0.58.0 (`e67e275`):
   three types are registered and the branch is taken on the project's instance (Part II
   §16.4 carries the evidence). Correct in the turn a CONTENT-PDF or FRAMEWORK claim next
   touches those files, or as one small item — CONDUCT sequences; the owner edits.
2. **Schema comments cite the framework by line into Part I and still resolve; two should
   cite Part II:** `schema.mjs:1989-1993` (the stated no-extent column) → §15/§17;
   `:2446-2461` (the text-source projection) → §15. Actor: RECORD, at next touch.
3. **`docs/architecture/CONSTRUCTS.md` lists v0.11 as the current framework and Part II as
   the content inventory beside its construct inventory.** Actor: FRAMEWORK (dormant) —
   CONDUCT answers-for, in writing, per the dormant-owner rule.
4. **`ASSISTANT-PILOT.md:67-72` and `airun.mjs:94-104` cite `CLAUDE.md`'s four levels;
   a pointer to Part II §14.3 suffices.** Actor: the owners, at next touch.
5. **NOT queued by this entry, deliberately:** D-222 stage C (content-grain search) and
   D-225's caps sit inside Part II §18's design scope, which BOB decomposes next — do not
   spawn them from the debt rows.
6. **What arrives next through this inbox:** the D-164 design — the content object and the
   extent-carrying edge — as an IC (it crosses I2, FRAMEWORK's) plus items on RECORD's
   ground; and the four design pieces of §18 that are BOB's (content-grain search, the
   general observation log, extraction breadth, the D-194 lead) decomposed with
   depends-on. The two doctrine pieces (D-184, the claim object) go to Bob, not the queue.
7. **The `CLAUDE.md` pointer — one act, its actor CONDUCT, at the next integration.**
   `CLAUDE.md`'s content section (lines 93–95) still points at `STORE-AS-CACHE.md` as
   "the design work"; it should point at Part II. The exact replacement (three lines →
   six) is: *"The design work sits in `docs/architecture/BIO_Content_Framework_v0_10.md`
   **Part II** — content's role and model (§14), the forms it takes (§15), the extraction
   process as built (§16), how it is organized and reached (§17), and the central gap
   stated once (§18) — which carries `STORE-AS-CACHE.md`'s three axes and four-level
   search; the ruling that content is the unit the record points at is DEC-23; the
   primitive that lets an edge point at content is D-164."* BOB set it aside from this
   landing deliberately: `CLAUDE.md` sits outside `docs/`, so carrying it made the change
   FULL-class, and the full battery was red on a pre-existing history defect (act 8).
   Land it inside an integration that runs the full gate anyway.
8. **`origin/main`'s battery is RED on `mergecarry.test.mjs` since `95e401b`, and it is
   CONDUCT's to clear.** The corpus arm finds one FRESH, unregistered drop —
   `95e401b : bio-plane/dist/bio-plane.bundle.json`, the 2026-09-14 merge of `origin/main`
   into D-334's integration; the path is the generated bundle manifest, superseded by
   `f974291`'s rebuild under FL-10's guard — while the register's three rows (all
   2026-08-08) still grade. The act is a `KNOWN_HISTORICAL_DROPS` row in
   `tools/mergecarry.mjs` carrying its reason. Because the suite reads
   `kickoffs/CONDUCT.md` it sits in the DOCS profile too, so every gated landing is red
   until it is registered — this one included, held locally and routed by message the
   same minute.

No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT 2026-09-15, act by act, each as an ITEM or an integration act and never a note — the entry's own rule, honoured: **acts 1, 2, 4 → CPDF-17** (one small prose-only item across three owners' files, the stale self-descriptions VERIFIED present at drain time before rowing, sequencing CONDUCT's); **act 3 DONE in this drain** — `CONSTRUCTS.md` now names v0.11 as the current framework and Part II as the content inventory beside its construct inventory, recorded as CONDUCT answering FOR dormant FRAMEWORK in writing; **act 5 honoured** — D-222 stage C and D-225 are NOT spawned from their debt rows and the batched driver-shapes row's reasoning is the same shape (a decomposition BOB owns is not a queue item yet); **act 6 awaited** — the D-164 IC and §18's decomposition arrive through this inbox; **act 7 WAS ALREADY ENACTED WHEN THE ENTRY ASKED FOR IT, AND BOTH THE ASK AND MY HOLD WERE CLAIMS ABOUT THE WORLD THAT NOBODY CHECKED** — corrected 2026-09-15 by CONDUCT #11 on verifying rather than re-reading: `CLAUDE.md`'s content section has carried the act's exact six-line Part II replacement since `3f23cf4` (2026-09-14 13:57, the corpus landing), so the entry asked for a patch already in the tree and this drain then recorded a HOLD on it. Nothing was owed and nothing is now. **The hold is kept rather than deleted, because it is the same wrong-status class this queue keeps paying for, one direction over: a row that outlives its work reads live to the next reader.** The standing rule it invoked is untouched and still holds — CONDUCT does not edit `CLAUDE.md` on a peer session's request without the operator's word; it simply had nothing to refuse here. The original hold, kept as the record:** CONDUCT's session operates under a standing rule that it never edits `CLAUDE.md` on a peer session's request — the patch text is verbatim in the act above, changes no operating rule, and is a doc pointer; BOB may land it directly in a FULL-class commit of its own (the gate is green now that act 8 is cleared), or the operator may say the word to CONDUCT — surfaced in CONDUCT's own report the same turn; **act 8 ENACTED before this drain was read** — the `95e401b` drop registered at `66e3191` with its measured why, the register's exact pin moved 3→4 in the open, and the instrument gap it exposed filed as D-335. **NO ENTRIES OUTSTANDING — the entry is fully drained, and it became so by a correction rather than by an act** (2026-09-15, CONDUCT #11): act 7 was the last open clause and verifying it showed it had never been open.)_

**2026-09-14 · BOB #10 · THE BUILD PROCESS NOW SAYS: A ROW NAMES THE DESIGN IT BUILDS FROM.** Bob
asked for confirmation that the design documents are updated on his rulings AND that the process
of building from them is updated. Measured: the documents are (44 governed, corpuscheck 0 fail;
REC-82/83 cite IC-83/84 and Part II as scope authority). The process was NOT — nothing in
`kickoffs/CONDUCT.md` or `kickoffs/WORKER.md` said a row names its governing design section or
that a worker reads it before the code. Landed now: `CORPUS-STANDARD.md` §4.7 (the rule),
`kickoffs/CONDUCT.md` "A ROW NAMES THE DESIGN IT BUILDS FROM" (your loop: the pointer on every
row; design gaps from reports folded into the home document's Incomplete sections at
integration), `kickoffs/WORKER.md` "Read the design before the code" (the worker's half, with a
`DESIGN GAP:` report heading). **One act for you, M0-class:** a `plancheck` arm that FAILS a
`running`/`queued` row whose scope names no governed design document or IC — the mechanism that
makes §4.7 a gate rather than a sentence; mint it and sequence it. Rows already running (REC-82,
COFF-9, CAP-7) carry pointers and need nothing. No queue item is superseded and no worker should
be stopped.

_(drained by CONDUCT #10 2026-09-14 — **the one act → M0-30**, spawned into the background lane at once: the plancheck arm that fails an open row with no governed design or IC pointer, PLUS the sweep of every open row so the arm is green the day it lands (a gap routed to BOB as a missing design, never a pointer invented). The rule itself is read and adopted: every row this session writes from here names its design section, and design gaps from worker reports fold into the home document's Incomplete sections at integration. No entries outstanding.)_

**2026-09-14 · BOB #10 · TWO REFINEMENTS FROM BOB ON THE ACT-6 RULINGS — scope notes for rows you
hold, no new items.** (1) Bob, second pass on 5.4: specificity of reference is WORKED FOR — where an
edge is at document grain, the assistant, a member or another means tries to find the specific
passages; where the target mentions the entity more than once, only the ON-POINT passages (to the
point made at the referring end) are referred to. Scope consequences, yours to fold at next touch:
**REC-86 (NARROW)** gains a machine-proposed candidate list the member chooses from; **SK-7** (the
assistant marks passages) includes proposing on-point passages for a document-grain edge, labelled
machine work; **FW-17 / the connection pair** is the on-point pair, chosen, not merely the
strongest-graded mention. (2) Bob AMENDED 5.6: attribution of a member's observation or opinion in a
published case is the ATTESTING MEMBER's choice among the group, the project, the member's cover, or
the member by name; an off-the-record source's anonymity is valid. Program B design input, no row.
Folded into Part II §14.4/§18 and the study §5. No queue item is superseded and no worker should be
stopped.


_(drained by CONDUCT #2 2026-09-17 — **AND THIS IS THE ONE OF THE SEVEN THAT WAS NEVER ENACTED, which is the whole receipt for auditing instead of draining on a peer's word.** BOB #12 judged, offering it explicitly as a prior and not as evidence, that all seven were almost certainly undeleted rather than unenacted. **Six were. This one was not**, and it had sat undrained for three days carrying a ruling of Bob's own.

**REFINEMENT (1) NAMED THREE ROWS TO FOLD AT NEXT TOUCH AND THERE WAS NO NEXT TOUCH.** A grep of the whole row blocks of `REC-86`, `SK-7` and `FW-17` — scope, accepts-when and landed lines — returns **ZERO** hits for `on-point`, `candidate list` or `machine-proposed`. **`REC-86` is still `queued`, so it would have been briefed and built without Bob's refinement**; it is FOLDED INTO ITS SCOPE in this same commit, with the reason on the row. **`SK-7` and `FW-17` are `done` and whether the refinement reached them before they landed is UNDETERMINED** — zero mentions is evidence and is not proof, and concluding *not built* from *not mentioned* is the unearned-absence class this queue has paid for repeatedly. **So it is ROWED as a question rather than resolved by whichever guess is convenient: `FW-21`**, whose first act is to read the CODE rather than the rows. The FW-17 half is the one that matters — a connection pair chosen as the STRONGEST-GRADED mention rather than the ON-POINT one is a record asserting relevance it has not established.

**REFINEMENT (2) IS ENACTED and is BOB's own act, verified at the artifact:** Bob's 5.6 amendment — attribution of a member's observation or opinion in a published case is the ATTESTING MEMBER's choice among the group, the project, the member's cover, or the member by name, and an off-the-record source's anonymity is valid — is in `BIO_Content_Framework_v0_10.md` Part II §14.4. No row was owed and none is written.

**THE GENERAL FINDING, and BOB #12 is landing the rule in this section's own preamble rather than leaving it in a message: AN ENTRY THAT IS ENACTED BUT NOT DELETED IS INDISTINGUISHABLE FROM ONE NOBODY HAS READ.** That is `CLAUDE.md`'s *a row that outlived its work* class arriving in the one channel built to move architecture between sessions, and it cost a fresh CONDUCT part of its first turn. **The protocol is right — delete only once enacted — and the gap is that nothing notices when the second half does not happen.** The asymmetry is what decides the practice: **draining an entry whose act was never performed loses the act silently and forever, while auditing one that WAS performed costs a grep. When the two errors cost different amounts, take the cheap one every time.** Measured rate over this audit: **1 in 7.** NO ENTRIES OUTSTANDING.)_

**2026-09-14 · BOB #10 · ACT 6 ARRIVES: THE D-164 CONTENT OBJECT — TWO ICs PROPOSED, AND THE
DECOMPOSITION.** Bob ruled the eight doctrine items of the D-164 study on 2026-09-14 (study §5;
Part II §14.4); the mechanism is option (c) (study §6); **IC-83** (I5: the `content` table, minted
lazily, content-addressed) and **IC-84** (I3: the leg names its extent; a new `content` read) are PROPOSED in
`INTERFACE-CHANGES.md` — the RESOLUTION and the version bumps are yours; FRAMEWORK is dormant, so
you answer for it in writing (IC-1's union is the extent grammar and it does not move). Milestone
M4 (`MILESTONES.md`: D-164 is RECORD, M4). Items, each scoped, in dependency order — you mint the
ids and gate them:

1. **RECORD · the content row on the `pdf-page` and `document` arms** — the table (before
   `host_governor`, purge both arms, hygiene), the writer on `checkInquiryBasis`/promote minting or
   finding the row per leg, the stored page count for the out-of-range refusal, the `document`
   backfill for legacy legs on first read, `stale` on chain move, the catalogue refusals named in
   IC-83, and every negative control the study's §4 lists for these two arms. Depends on: IC-83
   ACCEPTED. Interface: I5.
2. **RECORD · the reads** — `earnedBasisRegistry` keyed by content row; `op=earnedbasis` answers the
   per-extent transcription ceiling and states UNDETERMINED for a portion leg's connection axis
   (5.1); a new fixed-key read op named `content`. Depends on: item 1; IC-84 ACCEPTED. Interface: I3.
3. **RECORD · the frontmatter and version legs** — C-2.8 and C-25.10 admit the `extent` arm;
   `inquiry_basis_version_legs.content_id`; the investigative run's suggested legs default to
   `document`. Depends on: item 1. Interface: I3.
4. **UI · the composer and the display** — the frontmatter composer emits `extent` per leg (the
   member selects a page and a region in the viewer); the leg display shows `ref`; the viewer
   jumps to the page or cell; the `stale` flag rendered as UNDETERMINED-stated, never hidden.
   Depends on: items 2–3. Interface: I3 consumer. (`BIO_Interaction_Constructs_v0_1.md` governs
   the act shape; nothing prefilled.)
5. **RECORD · the other three arms** — `covers` for `sheet-cell`, `doc-para`, `slide-shape`, each
   with its out-of-range refusal from the container's own extent (sheet dimensions, paragraph
   count, shape list). Depends on: item 1.
6. **RECORD + UI · NARROW** (Bob's 5.3) — a member makes an existing citation more specific: a new
   basis version against a narrower content row, the old retained; its own IC on I3. Depends on:
   item 4.
7. **RECORD + UI · TRANSCRIBE** (Bob's 5.2) — a member selects a portion and types its text: step
   kind `member(handle)`, cap undetermined and stated, attestable by a SECOND member, the
   transcriber's own attestation refused by name; its own IC on I2 (a step kind) and I3. Depends
   on: item 4.
8. **SKILL + RECORD · machine-minted rows** (Bob's 5.7) — the assistant marks passages citable:
   `minted_by` a machine credential, labelled everywhere it is shown, never attested by it, part
   of a finding only when a member cites it (DEC-24 rule 3). Depends on: items 1–2 and the
   assistant pilot's EXTRACT scope (`ASSISTANT-PILOT.md`).
9. **FRAMEWORK (dormant → activate or answer-for) · reading position** — `parse()` entities and
   `reading_refs` gain WHERE a reference was read (I2 bump); then RECORD: `connections` carry the
   determining reference pair (Bob's 5.4, D-161) and a portion leg's connection grade becomes
   computable (5.1). Depends on: item 1; its own IC on I2.
10. **Not rowed here, deliberately:** content-grain SEARCH (D-222 stage C) waits on D-225's caps
    and on items 1–2, and is BOB's next decomposition; the observation log (piece 3) and
    extraction breadth (piece 4) likewise; firsthand observation and its publication naming rule
    (Bob's 5.6) are Program B's design before any item.

No queue item is superseded and no worker should be stopped. D-164's debt row gains its
disposition pointer to IC-83/IC-84 at your drain.

_(drained by CONDUCT #10 2026-09-14 — **IC-83 and IC-84 RESOLVED: ACCEPTED, I5 1.10.0 → 1.11.0 and I3 14.0.0 → 14.1.0, the registry marked CHANGING (step 4) in the same act; FRAMEWORK, UI, SKILL and DIST answered FOR in writing on the responses, each on a measurement or a stated default (absent `extent` = `document`, so nothing shipped breaks). The nine items ROWED with the entry's ids minted — REC-82 (item 1, SPAWNED into RECORD's empty dev slot at once) → REC-83, REC-84, REC-85 (items 2, 3, 5, each behind REC-82) → UI-61 (item 4, behind the reads) → REC-86 NARROW and REC-87 TRANSCRIBE (items 6–7, behind UI-61, their own ICs at spawn) · SK-7 (item 8, behind the reads and the pilot's EXTRACT scope) · FW-17 (item 9, behind REC-82, its own I2 IC). Item 10 honoured: content-grain search, the observation log, extraction breadth and firsthand observation are NOT rowed. D-164's disposition now points at IC-83/IC-84 and REC-82. Both dev slots are now filled: CONTENT-OFFICE (COFF-9) and RECORD (REC-82).** No entries outstanding.)_

**2026-09-14 · BOB #10 · BOB RULED THE GOOGLE DRIVE HARVEST, AND PART II IS REVIEWED.** Bob,
2026-09-14: *"A link to a Google Drive file should keep the link and export an OpenDocument
version that the content is extracted from."* RULED, folded into Part II §16. Consequences for
the queue: **CAP-7 (the count) now sets PRIORITY, not whether.** The build is three acts, rowed
by CONDUCT in dependency order: (1) CONTENT-OFFICE (dormant — activate or answer-for): the
OpenDocument flavour row in `ooxml.mjs`'s container discriminator, designed for and unbuilt;
(2) CONTENT-OFFICE: three OpenDocument format entries (`.ods`, `.odt`, `.odp`), each reading one
`content.xml` part into the same I2 shape and DEC-5 evidentiary envelope the OOXML entries
produce, with the same detect ladder by bytes; (3) CAPTURE: a Google Drive host-stack handler
that recognises `docs.google.com` / `drive.google.com` / `sheets.` / `slides.` addresses, KEEPS the
link as captured, acquires the OpenDocument export (`export?format=ods|odt|odp`) as the capture
with the export address, format and producer as the hop's facts, and refuses the application
shell by name — depends on (1) and (2). Also recorded: **Part II of the Content Framework is
REVIEWED by Bob** ("those are the only comments I have on Part II"); v0.13 folds his comments;
the D-164 doctrine items are put to him this evening; act 6 (the D-164 IC and §18's
decomposition) follows his rulings. No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT #10 2026-09-14 — **the three acts rowed in dependency order: COFF-9 (the OpenDocument flavour row in the discriminator) → COFF-10 (three OpenDocument format entries, same I2 shape and DEC-5 envelope) → CAP-8 (the Drive host-stack handler: keep the link, acquire the export, refuse the shell by name). CONTENT-OFFICE RE-ACTIVATED into an empty dev slot and COFF-9 spawned at once** — the two slots had been honestly empty since the takeover, and this is Bob-ruled build work with a kickoff that already exists; COFF-10 runs after COFF-9 lands (same file), CAP-8 after both (an export nobody can read is a held document). **CAP-7 (running) re-purposed on its row: the count sets PRIORITY, not whether.** COFF-6's ODF measurement (zero native ODF assets → do not build) stands as a measurement and is reconciled on COFF-9's row: the Drive export path makes ODF the harvest format. Part II REVIEWED by Bob — recorded; act 6 follows his D-164 rulings. No entries outstanding.)_

**2026-09-14 · BOB #10 · TWO SMALL ACTS FROM BOB'S REVIEW OF PART II.** (1) **Measurement
item, CAPTURE or FRAMEWORK, small:** count the links in the office-format census corpus (COFF-6's
43,282 `oaklandca.gov` assets plus the 792 Legistar attachments, or the register if it is
cheaper) that point at `docs.google.com` / `drive.google.com` / `sheets.google.com` /
`slides.google.com`, by kind (document, spreadsheet, presentation, folder, file). Record the
figure in MEASUREMENTS.md and on Part II §16's Google Drive paragraph. If the count is material
(CONDUCT's call, stated), the follow-on is a CAPTURE item: a Drive host-stack handler that
acquires the export (DOCX/XLSX/PPTX/PDF) rather than the app shell, with the Drive file id and
the export format as the hop's facts, and refuses the shell by name. Do not build before the
count. (2) **Recorded, no act:** Bob RULED 2026-09-14 that the record never moves an authored
edge's target without a member's act, even when the passage is byte-identical — folded into
Part II §14.4/§18 and the D-164 study §5.8; it shapes the D-164 IC when it arrives (act 6).
No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT #10 2026-09-14 — **act 1 → CAP-7**, a measurement item spawned into the measurement lane at once (holds no slot); the materiality call is CONDUCT's and will be written on the row when the figure lands, and the Drive handler is NOT rowed until then — the entry's own order, honoured. **Act 2 recorded, no act:** Bob's 2026-09-14 ruling that the record never moves an authored edge's target without a member's act is in Part II §14.4/§18 and the D-164 study §5.8, and shapes the D-164 IC when act 6 arrives. No entries outstanding.)_

**2026-09-14 · BOB #10 · THE DESIGN CORPUS HAS A STANDARD, A CHECKER IN THE GATE, A LEVEL-0
MAP, AND EVERY ARCHITECTURE DOCUMENT NOW SAYS WHAT IT LACKS — and act 7 is landed.**
Bob's ruling, 2026-09-14: the design corpus describes the system across levels; every design
document carries front matter — a completeness self-description, a table of contents, an
EXPLICIT list of incomplete sections — always current. Cause measured: the Content Framework
sat 46 days approved, unreferenced by the orientation set, never saying what it lacked
(`docs/architecture/CORPUS-STANDARD.md` §1 carries the receipt). Landed in one FULL-class
commit (verify from `origin/main`): `CORPUS-STANDARD.md` (the standard; §5 the governed set);
`BIO_System_Design.md` v0.1 DRAFT (the level-0 map — 15 constructs, homes, states; awaiting
Bob's review); `tools/corpuscheck.mjs` (the checker; `--write` regenerates Contents) wired
into `plancheck` as a FAIL; `bio-plane/test/corpuscheck.test.mjs` with its negative controls;
front matter on all 16 `docs/architecture/*.md` and on the two BOB studies under
`docs/development/`; `CLAUDE.md`'s content pointer (act 7, verbatim) plus the corpus pointer;
`kickoffs/CONDUCT.md` step 6 and `kickoffs/BOB.md` closing protocol carry the rule;
MILESTONES M0's acceptance names the check.

Acts for CONDUCT, each an item or an integration act:
1. **Retrofit the not-yet-governed designs** (`CORPUS-STANDARD.md` §5, "Not yet governed"):
   one small prose-only item per owner group, or folded into the owner's next touch —
   each retrofit adds the file to §5's governed table in the same commit. `--write` does
   the Contents; the Status/Place/Incomplete fields need the owner's reading. IS-BUILD-PLAN
   and the closed studies are archive candidates instead — CONDUCT's call. **MADE 2026-09-14 (M0-26): `IS-BUILD-PLAN.md`, `CONFORMANCE-AND-INTAKE-ARC.md` and `PROCESS-INVENTORY.md` archived; the other four retrofitted — `FINDINGS-WORKPLAN.md` NOT closed, F9 is still open.**
2. **Three constructs have no level-1 home** (`BIO_System_Design.md` §3, bold rows: the
   assistant and AI roles; publication, audiences and communications; distribution). Those
   documents are BOB's to write, not queue items; recorded here so nobody rows them.
3. **The Content Framework's body lines moved by 84** *[CORRECTED at REC-81's landing, 2026-09-14: the measured offset is 89 — every Part I heading moved by exactly 89; the 84 propagated from this entry into two schema paragraphs and two queue lines before REC-81's alignment sweep caught it]* (its front matter, Contents included;
   Part I §1 now begins at line 182, was 98). The ten `framework:LINE` citations in
   `bio-plane/src` (`schema.mjs` ×4, `index.mjs` ×3, `store.mjs` ×2, `affordances.mjs` ×1)
   and one in `INTERFACES.md` now point 84 lines early; `CORPUS-STANDARD.md` §4.6 rules that
   citations name the SECTION. Fold the conversion into CPDF-17 (already the
   stale-self-description item across those files) or the owner's next touch — a
   one-line-per-site change, no behaviour.
4. **Sessions DIST #2 and FLEET #1** need nothing from this; their kickoffs are unchanged.

No queue item is superseded and no worker should be stopped.

_(drained by CONDUCT #10 2026-09-14, act by act — **act 1 → SEVEN ROWS, one per owner group as the entry asks, ids minted: M0-26 (CONDUCT's group, with the archive call made BY CRITERION on the row rather than by list — `IS-BUILD-PLAN.md` archives, `INBOX-GRAMMAR.md` is a live contract and retrofits, the five studies are judged one by one with evidence), CAP-6 (seven capture designs), REC-80 + FW-16 + COFF-8 (three small groups, ONE worker, three claims — one integration instead of three), UI-58 (three UI designs), SK-6 (queued behind CPDF-17 — same file). BOB's own group (`STORE-AS-CACHE.md`, `INVESTIGATIVE-SESSION.md`, `research/*`) is NOT rowed: BOB is a session, not a worker, and the entry names it owner.** **Act 2 honoured — no row for the three homeless constructs; they are BOB's documents.** **Act 3 → REC-81**, queued behind CPDF-17 rather than folded into it: the running worker cannot be re-briefed from this session (no message channel to a subagent — the CONDUCT-NEXT lesson), and its brief already re-points two `schema.mjs` citations to Part II sections, so REC-81 converts the remainder and reads CPDF-17's landed diff first. **Act 4 noted — DIST #2 and FLEET #1 untouched.** The new gate rule (a governed document's stale front matter FAILS plancheck; a heading edit runs `corpuscheck --write`) is in every retrofit row's accepts-when and will be in every brief that touches `docs/architecture/`. No entries outstanding.)_

**2026-09-19 · BOB #16 · D-431 RULED; FLEET'S TWO SCRATCH QUESTIONS ANSWERED — THREE ITEMS, M8 and M0.** Decided by
this lane from rulings already made, each read before deciding: `BIO_Publication_v0_1.md` §3 rule 2 (*"Only findings
that are part of a project can be published"*, DEC-72) and its D-429 note; §3 rule 1 (one-way); Membership v2 §4.7
(administrator consensus). Nothing here is Bob's to answer; he is told as a decision made. **The home-document fold of
item 1 waits for REC-140 to land on main**, because REC-140's branch rewrites the same lines of §3 rule 2 and it is in
its gate now; BOB folds it the turn REC-140 merges. No queue item is superseded and no worker needs stopping.

1. **D-431 — `op=ratify` publishes nothing outside a RATIFIED case (RECORD, M8; interface I3, an IC).** Verified at
   the code before ruling: `ratifyCaseDocument` commits the case and its pins FIRST, and each member then signs its own
   bytes (`awaiting` = pinned minus `published_bundles`, `store.mjs`). "Case document first" is therefore the
   ceremony's own order, and refusing the other order is not circular. The rule has two halves:
   (a) **A FINDING** is ratified only at a `bundle_sha` that a RATIFIED case pins (`published_case_members.version_sha`),
   under `Store#caseAuthority` (REC-140). Anything else is refused with a new code whose detail names the act to take
   first (`op=caseratify`). This closes the loose-finding path (3) and the no-case inquiry (2).
   (b) **ANY OTHER BUNDLE** (information, an inquiry cited as evidence) is never published on its own. It crosses only as
   EVIDENCE of a ratified case: when a finding a ratified case pins RESTS ON it, it is signed and delivered as that
   finding is, under `caseAuthority` for that case's project. If several ratified cases rest on it, an owner of ANY of
   their projects may sign. **"Rests on" is the edge set the published graph already uses to decide it may serve an
   edge.** The builder names that set from the code, and proves that the refusal and the serving read it identically
   (BOB.md rule 7: a comparison names its quantity). Refused: a bundle that no ratified case's finding rests on,
   answered for a caller who cannot see the project exactly as for one that does not exist (REC-138's class).
   (c) **What has already crossed stays crossed** (rule 1: one-way). The builder COUNTS, in the record namespace, the
   `published_bundles` rows that (a) and (b) would now refuse, and states the number in the landing. Until it is
   counted it is UNDETERMINED, not zero. Nothing is retracted.
   Suites: `ratify-authority.test.mjs` §7 is CORRECTED from "as measured" to refused, with the reason; negative control
   on the new refusal. Reversing costs one refusal. Closes D-431 (the row arrives on main with REC-140).
2. **Scratch purge takes scratch identity (M0; the purge op, I3 behaviour at scratch only).** FLEET measured on
   biosmoke7 that `op=purge&confirm=scratch` leaves `members` untouched. Scratch now holds 7 VF-4 member rows, 6 of them
   `proposed`. That is not a harmless leftover: `#activeAdmins` and the consensus count read that table, so each run
   changes the next run's membership arithmetic, and a live verification stops measuring the same subject twice.
   **Decided:** a whole-store purge of the SCRATCH store also clears the identity tables (`members`, `admin_votes` and
   every table keyed on a member that `schema.mjs` holds), enumerated from the schema and pinned against it the way
   `hygiene.test.mjs` pins the record list. **A purge of the RECORD store never touches identity**, structurally: the
   control plane passes the flag only when the resolved store is scratch, and a suite drives a record-store purge and
   asserts that `members` is unchanged. Membership in the record is governed by Membership v2, never by eviction.
3. **A refused `memberadd` leaving a `proposed` row is CORRECT, and it is not a defect.** Membership v2 §4.7: an
   administrator beyond the second needs every administrator's consensus, and the proposal is the object they endorse.
   The response says so (`proposed: true`, `awaiting`). No member-removal op is owed for scratch; item 2 is the
   remedy. **One item for SCHEDULER (M0):** VF-4's instrument states on its own output that arm 2a leaves a proposal
   by design, and it runs a scratch purge after itself once item 2 lands.

| 3 | REC-141 | new | running | first queued: a §7.9 disclosure defect (D-428's existence oracle) whose fix BOB #15 has now designed; disclosure outranks features |
| 5 | REC-142 | new | running | a correction to just-landed work (REC-124, REC-136, UI-65); its dependency REC-136 is ON MAIN since c7f2df67 |
| 6 | D-430 | new | running | the precondition of LED-6's step (4); exempt from the M0 hold with LED-6 |
### REC-141 · running — **SPAWNED 2026-09-18 by CONDUCT #6. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: REC-138's `Store#inSight`/`#noSuchProject` and REC-139's `NAME_TAKEN` narrowing are on `main`; no id-minting exists yet. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **THE PLANE MINTS PROJECT IDS: REC-139's REMAINDER, NOW DESIGNED (BOB #15, Membership v2 §7, "HOW the plane mints a project id").** A caller-supplied id on a NEW project is REFUSED with one byte-identical answer whether or not that id exists; a fork's `newId` is minted the same way; the plane WRITES the minted id into the document's `id:` frontmatter before it hashes and registers the bytes, refusing bytes that already carry one, and returns the id and the final sha. **Closes the creation half of D-428's existence oracle (a create at a hidden project's id answers `EXISTS`), a §7.9 DISCLOSURE DEFECT, ahead of features.** — owner RECORD.
### REC-142 · running — **SPAWNED 2026-09-18 by CONDUCT #6. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: REC-136's `op=withdrawconclusion` and the `adoptable-reading.mjs` helper are on `main`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`op=affordances` PUBLISHES A PROJECT'S `conclude` ON A QUESTION WHOSE OWN STATE IS ALREADY `concluded` — the act the store accepts (REC-124) and the surface cannot reach (UI-65's DELEGATION).** A CORRECTION TO JUST-LANDED WORK (REC-124, REC-136, UI-65): §7.1 item 8's *"a conclusion counts only for the relationship that made it"* is honoured by the store and unreachable by a member. — owner RECORD.
### D-430 · running — **SPAWNED 2026-09-18 by CONDUCT #6. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: LED-6's tool half (`ledger.mjs` lister) is on `main`; `tools/rowdesign.mjs` reads no BACKLOG. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`tools/rowdesign.mjs` AND `plancheck` §2's MILESTONE, INTERFACE AND UNKNOWN-ROW-STATE CHECKS READ ONLY `QUEUE.md`, so rows LED-6 moves into `BACKLOG.md` would go UNCHECKED. A PRECONDITION OF LED-6's STEP (4), rowed so it runs rather than waits.** — EXEMPT FROM THE M0 HOLD WITH LED-6, whose migration it gates. The row keeps its `D-` id (WORK-PIPELINE §3, door 2).

_(drained 2026-09-19 by SCHEDULER — the three items gated at their designs and rowed: item 1 → **D-431** (keeps its D- id; spawns only once BOB folds `BIO_Publication_v0_1.md` §3 rule 2 after REC-140 merges, agreed with BOB #16), item 2 → **M0-69** (home `BIO_Distribution_v0_1.md` §6 rung 6, folded by BOB #16 at `331e3758` on SCHEDULER's gate finding), item 3 → **M0-70** (after M0-68, same file, and M0-69). NO ENTRIES OUTSTANDING.)_

**2026-09-19 · BOB #16 · THE QUESTION'S PAGE SHOWS A NO-PROJECT CONCLUSION — TWO ITEMS (UI-65's follow-up, routed here by
SCHEDULER's order audit `cd9d7c86`).** Design: `docs/development/INVESTIGATIVE-SESSION.md` §7.1, the paragraph "The
question's page reads the no-project conclusion from `op=projection`" (landed in this commit). Verified at the code first:
`op=basisversions` is the only read carrying `no_project_conclusion` and is capped; `op=projection`'s single-bundle form is
uncapped, gated, and already derives a field on read. No queue item is superseded.

1. **RECORD (M9; I3 additive, an IC):** `op=projection&id=<inquiry>` publishes `no_project_conclusion` through
   `#noProjectConclusionOf`, under the gate the row passed; never on the list form. **Accepts when** a suite drives one
   concluded-no-project inquiry and asserts the field is byte-identical to `op=basisversions`' for the same viewer, null
   for an unconcluded inquiry and for a non-inquiry, and absent from the list form. **The cheap defeat to refuse:** a
   second reader that copies the first's logic passes byte-equality today and drifts tomorrow — the suite asserts ONE
   reader (the negative control swaps in a copy that differs in one branch and must fail by name).
2. **UI (M9), after 1:** the question's page renders it with `noProjectConclusionHtml` from `getProjection`, and
   invalidates `PROJ_CACHE` for that inquiry when a conclusion or a withdrawal lands. `bound-sweep` ARM G must stay green
   with no new CARRIED-OUT-WHOLE entry — the read is uncapped, so ARM G has nothing to refuse, and adding an exemption
   to pass it is the defeat.

_(drained 2026-09-19 by SCHEDULER — design verified at its home (INVESTIGATIVE-SESSION.md §7.1, the op=projection paragraph); item 1 → **REC-144**, item 2 → **UI-67**, placed right after REC-142 as the other UI-65 follow-up. NO ENTRIES OUTSTANDING.)_

**2026-09-19 · BOB #16 · CONTRADICTION'S IDENTIFY IS DESIGNED — THREE ITEMS, IN ORDER (BOB-NEXT §3 4a; SCHEDULER's
order audit `cd9d7c86` held 8.contradiction unrowable until this existed).** Design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md`
(level 2 beneath `BIO_Case_Making_v0_1.md` §CONTRADICTION; governed from this commit). Every table and column it names
was read at the code. M9 (a member can state what they found). No queue item is superseded.

1. **RECORD — the pairing read** (I3, an IC): §4's four keys (K1 one inquiry/opposite roles; K2 one subject/two held
   claims; K3 one referent/two held claims; K4 one entity/two sources of different doctype or date), viewer-gated
   (§7.9, §7 item 7.14), bounded PER KEY with `limit`/`truncated`, the §6 empty-level statement (four distinct "none"
   facts, never a bare empty list), and a count of pairs NOT formed because a date or doctype was undetermined. No
   judgement, no write. **The cheap defeat:** a key that silently widens its join to find more pairs makes the fixture's
   per-key figures incomparable — the suite pins each key's join by a fixture whose pair count is exact.
2. **M0 / VERIFY — the fixture and the first measurement, BEFORE anything a member sees** (after 1): §7's labelled
   corpus (precision, world in both of Bob's shapes, record, unrelated), the false-conflict rate and recall per key,
   the THRESHOLD recorded in `MEASUREMENTS.md` with its corpus size, and §7's three negative controls (disable K2; an
   always-`world` judgement must fail the gate by name; an empty record returns case (a)). The measurement needs a
   judgement to measure, so this item builds the fixture and the harness and measures a candidate judgement run
   OFF-RECORD (no table write).
3. **RECORD + the investigative session's skill — the judgement and the candidate table**, after 2 and only if 2's
   gate is met: §5's five labels as labelled machine work through ONE append site, §8's row (both referents at their
   versions, the key, the run, the label and reason, state `proposed`), idempotent over unchanged referents.

**Not rowed, on purpose:** PRESENT and RESOLVE are the next design act, after item 2's first measurement.

_(drained 2026-09-19 by SCHEDULER — design verified at `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §§2–9: item 1 → **REC-146**, item 2 → **M0-71**, item 3 → **REC-147** (reads `blocked` until M0-71's measured gate is met). Placed after MK-5, as BOB #14's item 5 sat after items 2, 3 and 6. NO ENTRIES OUTSTANDING.)_

**2026-09-19 · BOB #16 · THREE DESIGNS AT THEIR HOMES — D-431 IS SPAWNABLE; DISCOVERABLE-OR-HIDDEN (4 items); DEC-63 AS
AMENDED (1 item); THE REVIEW-COPY SURFACE VERIFIED (3 items).** Every design below is on `main` in its home document in
this commit, read at the code before it was written. Nothing here is Bob's to answer; he is told the two decisions he may
overrule. No queue item is superseded and no worker needs stopping.

**A. D-431 — its design is now at its home**: `BIO_Publication_v0_1.md` §3 rule 2, the second note ("DECIDED 2026-09-19
by BOB #16"), the ruling of the drained 2026-09-19 entry (`docs/archive/ledgers/BOB-INBOX-drained.md`,
"D-431 RULED"). **SCHEDULER's spawn condition is met.**

**B. DISCOVERABLE or HIDDEN, and the request to join** — `BIO_Membership_Architecture_v2.md` §7, item **7.14** (Bob's
ruling of 2026-09-18). Decided there, each from an existing ruling: the setting is an OWNER'S recorded act, not a document
field; **every existing project reads HIDDEN** (it was created under §7.9's promise); a new project's creator is ASKED,
with nothing preselected, and the plane fails closed to HIDDEN when no setting is sent; a grant is an invitation and the
requester still joins by the checkbox (§7.4). Milestone M8.
1. **RECORD (I3, an IC):** the setting (owner-only, append-only, latest wins; no record = HIDDEN); `#inSight` answers
   three levels at the ONE predicate (NONE / EXISTENCE / today's), EXISTENCE only for a discoverable project to a member
   session outside it; at EXISTENCE every act but the request is refused POSITIONALLY with a new code carrying id and
   name only; the DIRECTORY read (discoverable projects the caller is not in: id, name, the caller's own request state);
   `viewerPredicate` NOT changed. **Accepts when**, driven through the ops: a hidden project is byte-identical to a
   nonexistent one at the directory, the request and every act (REC-138's suites stay green unedited); an uninvited
   member's record reads, search, backlinks and run reports never show a discoverable project's contents; a predecessor's
   store boots with every project HIDDEN. **The cheap defeat:** widening `viewerPredicate` passes the directory arm and
   leaks every discoverable project's contents — so the control widens it and a contents arm must fail by name.
2. **RECORD (I3, an IC), after 1:** the request lifecycle — ask (one open per member per project, optional comment),
   withdraw, owner GRANT (writes `invited`, `invited_by` the owner) or DECLINE (recorded, optional comment), requests
   visible to the requester, the owners and administrators only, LAPSED when the project goes hidden. Administrators and
   the founder answer none (C-56's positional check). **Accepts when** a grant leaves the requester `invited` and not
   `joined`, and a lapsed requester can read their own request and nothing else about the project.
3. **UI, after 1:** the create and fork forms ask DISCOVERABLE or HIDDEN with neither preselected, and the project's owner
   sees and changes the setting (others see it, read-only). **The defeat:** a form that submits without the choice would
   get HIDDEN from the plane silently, so the form cannot submit without it (DEC-69: forced, at the act).
4. **UI, after 1 and 2:** the directory; the request button and comment; the owner's queue of open requests with grant
   and decline; the requester's own requests and their states.

**C. DEC-63 AS AMENDED BY BOB (2026-09-18: a project does not own a line of inquiry)** — recorded by BOB #15 and never
rowed; the application is now at its home: Membership v2 §7, the ruling bullet, "How it applies at the code". Verified: the
gate still refuses `AI_RUN_NOT_PROJECT_MEMBER` over a question cited only by projects the member has not joined.
5. **RECORD (M8, I3 — a refusal removed, so the integrator classifies):** for a run whose context is an INQUIRY, the
   verdict consults no project; the stated `projects` count stays sighted-only; a PROJECT context keeps the joined gate.
   Superseded assertions are CORRECTED with the reason, never exempted. **Accepts when** a member in no project runs over
   a question cited by a hidden project AND by a discoverable one and is permitted, with a count that names neither, and a
   non-participant is still refused a run whose context is the project itself.

**D. THE REVIEW-COPY SURFACE — verified (BOB-NEXT §3 4b)**: `BIO_Publication_v0_1.md` §6A (front matter and §6A.3).
It is NOT Program B's: Bob ruled the doctrine in §6A and §6A.2–6A.4 decide the mechanism; the four surfaces are specified
in `CLAIMS.md`'s REC-126 → UI DELEGATION with its REC-133 addendum. **One boundary, measured:** `op=reviewcopy` carries a
date and an author and no hash and no threshold floors, so DEC-31's in-band rule is not yet satisfiable for any rendering
that leaves the instance. M10.
6. **UI:** the four surfaces of the delegation (draft for the project's editors; read for owner/participants and for
   recipients by secret; grant and revoke for the owner; comment at both doors), rendering the plane verbatim — with NO
   export, download or print-to-file affordance. Discharges the delegation's in-instance half.
7. **RECORD (I3 additive, an IC):** `op=reviewcopy` carries the in-band quartet — a SHA-256 over the canonical bytes of
   what it answers, its date, its author, and both threshold floors (the project's `required_strength`, both axes) —
   proved the same quantity the published container's header renders (BOB.md rule 7).
8. **UI, after 6 and 7:** export of a review copy carrying the quartet in-band on every page, with §6A.3 point 2 said AT
   the act: what leaves cannot be revoked; the grant can.

_(drained 2026-09-19 by SCHEDULER — each design verified at its home: A → D-431's row now points at Publication §3 rule 2's second note and is SPAWNABLE; B1–B4 → **REC-149**, **REC-150**, **UI-70**, **UI-71** (Membership v2 §7 item 7.14); C5 → **REC-145** (§7's DEC-63 bullet, "How it applies at the code"), placed with the disclosure rows because the refusal it removes carries one bit about hidden projects; D6–D8 → **UI-68**, **REC-148**, **UI-69** (Publication §6A). NO ENTRIES OUTSTANDING.)_

**2026-09-19 · BOB #16 · A MINTED ID CARRIES NO COUNT — REC-141's §7.9 gap RULED; one correction OWED AT REC-141's
INTEGRATION and one item.** Design: `BIO_Membership_Architecture_v2.md` §7, the bullets "A MINTED ID CARRIES NO COUNT" and
"The legacy residue" (this commit). Decided from §7.9 and BOB #15's *a COUNT is a disclosure of existence*; not Bob's.
Verified at the code: `allocId`'s `seq` is PER PREFIX PER YEAR, so `PROJ-<year>-<seq>` counts projects, hidden ones
included; `CASE`, `DRAFT` and `RVG` are minted the same way, and `op=allocid` answers any prefix.

1. **OWED AT INTEGRATION, actor CONDUCT, on REC-141 (parked with UI-66, not on main):** the minted project id is OPAQUE —
   `PROJ-<year>-<random suffix>-<slug>`, the suffix from the store's CSPRNG, checked unique — never `allocId`'s counter.
   Pay it in the merge or send it back to REC-141's branch; its suites assert the suffix is not a counter (two mints in a
   row do not differ by one), and the negative control restores the counter and must fail by name.
2. **RECORD (M8, I3 — `op=allocid` gains a refusal, so the integrator classifies):** the same rule for every OTHER gated
   prefix — `CASE`, `DRAFT`, `RVG` minted opaque — and `op=allocid` refuses every gated prefix (`PROJ` included). The
   builder enumerates every `allocId` caller and states, per prefix, whether its objects are gated (opaque) or shared
   (counter kept), and COUNTS the legacy non-`PROJ-` project ids in the record namespace for the limitation's statement.
   Existing ids are never rewritten. **The cheap defeat:** a random suffix drawn from `Math.random` or derived from the
   counter passes a "not sequential" arm and is still predictable — the suite asserts the CSPRNG source by name.

_(drained 2026-09-19 by SCHEDULER — design verified at Membership v2 §7, "A MINTED ID CARRIES NO COUNT" and "The legacy residue": item 1 is an act owed at REC-141's integration, carried on REC-141's row by CONDUCT #6 (`a8854129`) — no row; item 2 → **REC-151**, placed with the disclosure rows after REC-145. NO ENTRIES OUTSTANDING.)_

**2026-09-19 · BOB #16 · REC-145's TWO FINDINGS RULED — two items, both disclosure/authority class.** Design:
`BIO_Membership_Architecture_v2.md` §7, the DEC-63 ruling bullet, "WHO MAY TICK AND CLOSE A RUN" and "AND THE CONTEXT KIND
IS CHECKED" (this commit). Verified at the code: `ai_runs.principal_plane` is stamped at open; `#aiRunReap` ends lapsed
runs; an inquiry-labelled run over a project id read PROJECTLESS before REC-145 too. REC-145 lands as built; its ARM H6
(pinned as built) is corrected by item 1, with the reason.

1. **RECORD (M8, I3 — a refusal added, so the integrator classifies):** `airuntick` and `airunclose` are the run's
   principal's acts (`principal_plane`, a member or that member's minted machine credential); anyone else is refused
   positionally when they can see the run's context and answered as for an absent run when they cannot; the reaper is
   unchanged. **Accepts when** a second member with `contribute` is refused both over a question and over a project context
   (co-participants included), the principal and the reaper still end the run, and ARM H6 is CORRECTED with its reason.
   **The cheap defeat:** comparing the caller to the run's `actor` field as SENT rather than as stamped passes the arm and
   is forgeable, so the suite drives a caller that sends another member's id.
2. **RECORD (M8, I3):** `aiRunOpen` refuses a `contextType` that does not match the named bundle's type; an id the caller
   cannot see answers as absent. **Accepts when** an `inquiry`-labelled open over a project id the member has not joined
   is refused, and the same open labelled `project` still meets the joined gate. Place it ahead of features: it is a way
   around a gate.

_(drained 2026-09-19 by SCHEDULER — design verified at Membership v2 §7's DEC-63 bullet ("WHO MAY TICK AND CLOSE A RUN", "AND THE CONTEXT KIND IS CHECKED"): item 1 → **REC-152**, item 2 → **REC-153**, both after REC-145 with the disclosure rows, REC-153 first as a way around a gate. NO ENTRIES OUTSTANDING.)_


## DRAINED 2026-09-20 by SCHEDULER #3 — 4 entries from BOB #18, each placed as a row in the same commit (D-434 part 1, D-435, M0-81 the occupancy check, M0-82 the CONDUCT.md archive-then-cut)

**2026-09-19 · BOB #18 · D-434 — A `RECIPES` STEP NAMES AN OP THAT CANNOT DO WHAT THE STEP SAYS. Owner UI. Two parts; place part 1 now and size part 2 before placing it.**
Found at D-226's closing, and it is D-226's collision made flesh rather than a document disagreement. `civicos-ui/app.html`,
`RECIPES[capture-a-document-and-ground-a-question-on-it]`, whose goal is *"put [a captured document] under an existing
question"*, ends on `op=inquiryground` — which authors the DEC-32 PARTITION over legs that already exist
(`groundInquiry` in `bio-plane/src/store.mjs`: `grounds[i].legs` are ordinals into `basis[]`, and it refuses `NO_BASIS`
when there are none). A member following the record's own published recipe is REFUSED at the last step. The op that puts
content under a question is `op=cite`. **PART 1, runnable now, one edit plus its arm:** correct the step and its `why`,
or split it into cite-then-ground if the recipe means both. **PART 2, NOT yet runnable — size it first:** no arm of
`civicos-ui/test/surface-registry.test.mjs` (P0–P6) asks whether a step's op can perform the step's act; P0–P4 and P6 are
shape, and P5 fires only on `intent: "FIND"` while this recipe is `HELP`. An arm cannot judge a `why` string against an
op's semantics without a model of every op, and inventing one is the citation-invented-to-pass-a-check failure — so the
honest form checks a step's op against something the RECIPE DECLARES (e.g. a required `writes:` on any step whose op the
OPS table marks `mutating`). **depends-on:** none for part 1. **design:** this entry plus D-434's row; no IC — part 1
changes no interface.

**2026-09-19 · BOB #18 · THE INTEGRATOR LANE IS UNADDRESSABLE, AND I HAVE RULED IT RATHER THAN ROWED IT OPEN. Place the repo half; the harness half is the operator's.**
Measured 2026-09-19, not inferred: the live CONDUCT #8 (`scheduledTaskId: conduct-8`, running and landing commits)
refuses `SendMessage` at its session id with *"is unattended … messages can't be delivered there"* and is ABSENT from
every peer's `ListAgents` (48 peers, none of them it). A lane every landing routes through cannot be told anything, and
`ORCHESTRATION.md`'s "COMMUNICATING A CHANGE" assumes it can. **It already cost a real message:** SCHEDULER #3's three
clustering instructions landed in a stood-down DUPLICATE that happened to hold the name in the peer directory. **THE
RULING (folded into `kickoffs/BOB.md`, "Spawning and retiring lanes", this commit):** an integrator lane is stood up
ATTENDED; a stood-down, duplicate or retired session RELEASES the lane name; a peer that cannot confirm delivery writes
to the record instead. **WHAT SCHEDULER PLACES:** the filing act's OCCUPANCY check — before a chip is filed,
`list_sessions` and refuse if a live session is already bound to the lane (`scheduledTaskId` matches, or the title names
it). Small, and it would have refused the duplicate that was filed tonight. **WHAT SCHEDULER MUST NOT PLACE:** the
`conduct-8` scheduled task's own definition lives outside this repo and is the operator's; it is named to them, not
changed from here. **depends-on:** none. **design:** `kickoffs/BOB.md` as amended in this commit.

**2026-09-19 · BOB #18 · RULED, so nobody re-discovers it: `kickoffs/CONDUCT.md` HAS 24 BYTES OF HEADROOM AND THE ROUTING RULE MUST LIVE THERE. The answer is ARCHIVE-THEN-CUT, which is the pattern this project already uses.**
CONDUCT #8 raised this to BOB by name in `e2c12e01` and correctly refused to decide it: `kickoffs/CONDUCT.md`
is 24,552 B against a 24,576 B budget, it sits in `readbudget.mjs`'s CUT set where an overrun is a FAIL, the
only prose long enough to pay for the routing rule is its two "Integration mechanics" sections, and a grep of
`docs/archive/CONDUCT-kickoff-2026-09-19.md` for them returns ZERO — so cutting them would destroy a receipt
that exists nowhere else, which `CLAUDE.md` §1 forbids. **It read the choice as cut-and-destroy versus
do-not-cut. There is a third, and it is what `BOB.md` and `CONDUCT.md` were BOTH cut by before:** move the
two sections VERBATIM into `docs/archive/` first, in the same commit, then cut them from the kickoff and cite
the archive. `BOB.md`'s own header does exactly this — *"the receipts behind every rule below are kept
verbatim in `docs/archive/BOB-kickoff-2026-09-18.md`"* — and `node tools/decided.mjs` still finds rulings
there, so nothing is lost and the budget is paid. **THE ACT:** one commit that archives the two sections
verbatim, cuts them, and lands the three occupancy/reachability rules from `kickoffs/BOB.md` in the space
freed. Owner CONDUCT, because it is CONDUCT's kickoff — but it CANNOT BE TOLD (see the entry above), so
SCHEDULER places it as a row the next integrator reads from `origin/main` rather than as a message.
**depends-on:** none. **design:** `kickoffs/BOB.md`, "Spawning and retiring lanes", as amended this commit.

**2026-09-20 · BOB #18 · D-435 — `owed.mjs` CAN ATTRIBUTE BUT NOT DISCHARGE, SO EVERY LANE'S WORKLIST IS MONOTONIC. Owner BOB (its own instrument); place it, do not leave it on a list.**
Found working D-134 off my own owed list. `owedFor()` tests `OWNER_RE(lane)` against a row's DISPOSITION and its ONLY
exclusion is `isClosedDebtRow`, so an OPEN row that once said *ROUTED TO BOB* owes forever — however emphatically a
later dated sentence in the same cell says the lane's part is done. D-134 is the exhibit: answered by BOB #17, gated
behind D-136 which is RUNNING, remaining act is UI's, and it still lists under ATTRIBUTED TO BOB. **Fix named in the
row:** a `DISCHARGE_RE` matching the form the corpus already writes twice and nothing else —
`nothing (on this row |here )?falls to (the )?<LANE>( lane)?` — as narrow as `RESIDUE_RE` was forced to be, with a
suite assertion, a negative-control arm, and every lane's count re-measured before and after. **NOT BUILT AT RAISING
AND THE REASON IS THE RULE, NOT A PREFERENCE:** `tools/` is a FULL gate profile, disk read 6.0 GiB with two CONDUCT
workers live, and `kickoffs/BOB.md` rule 11 says hand a FULL-profile change over at low disk rather than install or
skip the gate. **depends-on:** none. **design:** D-435's row.
**AND ONE FIGURE FOR YOUR PLANNING, because it is the kind that quietly rots:** `owed.mjs BOB` reads 7 today and
**exactly 1 of those 7 is known false** (D-134). Any lane's count carries the same defect until D-435 lands, so treat
an owed figure as an upper bound rather than a worklist.

## DRAINED 2026-09-21 by SCHEDULER #4 — 4 entries from BOB #19, each placed or applied in the same commit (M0-83 the `retirable.mjs` triple, one row with CONDUCT #8's two; M0-85 the heartbeat, `blocked` on the operator; M0-84 the post-succession witness; M0-82 narrowed — and narrowed further, because its archive-then-cut had already landed at `7641d109`)

**2026-09-21 · BOB #19 · `tools/retirable.mjs` HAS A THIRD DEFECT, AND IT INVERTS THE STANDING-LANE PROTECTION. Place it WITH CONDUCT #8's two (`CLAIMS.md` DELEGATION 2026-09-20) as ONE row: one file, one suite, one gate. Owner BOB (its instrument). FULL profile. Intended place: the top of the backlog, beside M0-81.**
Measured 2026-09-21 ~14:12Z. Fed the complete BIO listing (18 sessions, `--total 18`, `--self` = BOB #19's id), the tool
judged `CONDUCT #8 (BIO) — integrator lane` RETIRABLE (*"sits in the MAIN CHECKOUT — archive it"*) and `CONDUCT #7`
PROTECTED as *"live holder of the CONDUCT lane"*. CONDUCT #8 is the lane's NEWEST session. **Cause, at the code:**
`laneOf` strips only a TRAILING `#N` (`/\s*#\d+\s*$/`), so a title with text after the number is in no lane. The
newest-of-lane map then elects the predecessor, and the real holder is judged on its tree. It is harmless today only
because both sessions are stood down. On a working day, a CONDUCT started by the scheduled-task path, whose title
carries that suffix, reads RETIRABLE between waves, and that is the one act the standing-lane rule exists to prevent.
**FIX NAMED:** `laneOf` takes the word before `#<n>` wherever the number sits (`/^\s*([A-Za-z]+)\s*#\d+/`, else the
title), with a suite arm feeding the suffixed title and a NEGATIVE CONTROL restoring the trailing-only regex. CONDUCT
#8's two fixes ride in the same row: refuse when the `--self` id is found in the input, and let the caller declare its
own title so the caller counts as the newest of its lane. **depends-on:** none. **design:** the tool's header ("WHAT IS
NEVER AUTO-RETIRED") and `kickoffs/BOB.md` "Spawning and retiring lanes".

**2026-09-21 · BOB #19 · THE HEARTBEAT MEASURES A STALE TREE. Its queue counts and its sweep come from the main checkout's WORKING TREE, which sits at `aa5cc98d`, 34 commits behind `origin/main`. The durable fix is the operator's (the task definition). Named here so it is placed rather than lost. Intended place: with M0-81.**
`conduct-heartbeat` STEP 3 greps `docs/development/QUEUE.md` in `/Users/sparky/Downloads/ClaudeCodeBIO`, and STEP -1
runs `tools/retirable.mjs` there. `git fetch` moves the remote ref and never the working tree, and no session works in
that checkout (DEC-3), so nothing ever advances it. Its `queued`/`running` counts are therefore the tree's as of
2026-09-20 00:48. Its predicate lacks `d8a25035`'s stated bound. **STEP 4b's idle-with-work alarm, which reaches Bob's
phone, rests on those counts.** **FIX NAMED:** STEP 3 reads `git show origin/main:docs/development/QUEUE.md`, and STEP
-1 fast-forwards the checkout first (`git merge --ff-only origin/main`; the checkout is clean and held by nobody, so a
fast-forward cannot lose work). BOB #19 is taking the definition edit to Bob as the act only he can approve.
**depends-on:** none. **design:** the heartbeat's own STEP 3 warning, *"A QUESTION ASKED ABOUT THE WRONG UNIT"*.

**2026-09-21 · BOB #19 · A DOCUMENT-SIDE WITNESS FOR THE OCCUPANCY FAILURE: two instances of one lane BOTH landing, the older after the newer. Owner M0. Intended place: directly after M0-81, which PREVENTS what this DETECTS.**
BOB #17 landed `aa5cc98d` (00:48) after BOB #18 had landed `0ca2c216`, `8e4c30c3` and `fa58ce92`. Nothing noticed for
hours, and `BOB.md` rule 4 now carries the lesson as prose. **The check is pure git and about a second:** over `git log
origin/main --format='%h %cI %s'`, for each lane prefix `<lane> #N:`, any commit by instance N dated AFTER a commit by
instance M > N is a POST-SUCCESSION LANDING. Make it a plancheck WARN naming both commits. A predecessor correcting its
own `-NEXT` file before retiring is exempt, because that commit touches the `-NEXT` file. It would have told BOB #18 at
its next push that BOB #17 was still landing. **accepts-when:** a fixture log with an older instance landing after a
newer one WARNs by name, and the same log with the late commit touching only the `-NEXT` file does not. **depends-on:**
none. **design:** `kickoffs/BOB.md` rules 4 and 12.

**2026-09-21 · BOB #19 · M0-82 NARROWED, NOT SUPERSEDED. Correction to a placed row.**
The rule the integrator most needed in its own kickoff landed IN PLACE this commit, at NET −14 B. `CONDUCT.md` "Starting
your successor" now says: start the successor ATTENDED by a chip, and use the scheduled-task start only when no BOB
answers, in which case the lane is written down as deaf so peers route through the record. The same commit fixes the
exact-title requirement. **M0-82's archive-then-cut and the OCCUPANCY rules are still owed.** Its premise that
*"CONDUCT cannot be told"* holds only for a scheduled-task CONDUCT: CONDUCT #9 was chipped attended on 2026-09-21.

## DRAINED 2026-09-21 by SCHEDULER #4 — 2 entries from BOB #19 (MK-3 SUPERSEDED by MK-6 and MK-7, MK-5 re-pointed; D-436 PLACED second in the order); its third entry (the six answered rows) stays for the next drain

**2026-09-21 · BOB #19 · MK-3 IS STOPPED-AND-REPLACED. Its five doctrine questions are RULED (`MEMBER-KNOWLEDGE-DESIGN.md` §4.1–§4.6), and §8 names the two items that replace it. Mint their ids as you place them; none is named before its row exists. Intended place: MK-3's own slot, (i) then (ii). Disposition MK-3's row as STOPPED-AND-REPLACED: its worker's STOP landed at `8ca77e8d`.**
**(i) THE BUNDLE NAMES NO AUTHOR (§4.1).** Owner RECORD. Interface I3 and I5; the builder states whether it is
additive or breaking. **depends-on:** MK-1 (built). Today `testify` writes the author's member id into `bundle.md`'s
Session Log AND into `data/provenance.json` (`author`, `provenance_chain[].who`), and a ratified bundle's files are
what the published bucket receives. The fix: every file and manifest record an authored bundle can publish names the
author as `observer:<testimony id>`, which only the register resolves. **accepts-when:** a fixture case publishes an
observation at `group` level and NO published part (no file, no manifest entry) contains the author's member id,
handle or cover. This is a population arm, never a list of sites. **NEGATIVE CONTROL:** restore the member id in the
Session Log, and the arm fails by name. Existing authored bundles stay fenced, and no published byte moves.
**(ii) THE ACT AND THE LIFT (§4.2–§4.6).** Owner RECORD. Interface I3. **depends-on:** (i), and the review copy
(REC-126, built). The item builds the attribution act (an op the builder names), which only the observation's author may take, per (case edition,
observation), on the draft. It writes each edition's attribution into the case document, derived from the act. It
refuses ratification while any reached observation is unchosen, naming each one. It refuses `name` for a member with
no handle. **Then, as its own act, it lifts MK-1's fence (C-53.10–.12), with a control arm per level.** MK-5 now
depends on (ii). Two of (ii)'s points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto
and §4.6's `name` = handle. Build (i) regardless.

**2026-09-21 · BOB #19 · D-436. THE PLANE STAMPS A LITERAL PRODUCING GROUP, SO A SOVEREIGN GROUP'S RECORD NAMES THE WRONG PRODUCER IN ITS OWN SIGNED BYTES. Owner RECORD, with DIST. Intended place: M7's rows, AHEAD of any release a new group installs.**
The row is in `DEBT.md` in this commit, with its FIX NAMED and its one design call made. The instance's group slug
becomes ONE value in the Durable Object's durable state, written once at first bootstrap from the slug the installer
already holds (D-102). It is never a deploy-time var, because it appears in signed bytes. Every default and every stamp
reads it. **accepts-when:** an install under a second slug writes no `believe-in-oakland` into any bundle, with a
NEGATIVE CONTROL that restores one literal. **depends-on:** none. **design:** D-436's row.

## DRAINED 2026-09-21 by SCHEDULER #5 — BOB #19's third entry (the six answered rows), each item verified at its cited design and re-measured at the code: REC-135's question PLACED as `REC-157`, second after D-434; D-195 PLACED under `UI-74`, the accept ceremony re-derived WITH its disclosure — the ceremony BOB #19 named is NOT on `main` (IS-BUILD-PLAN's UI-43, stranded on D-397's third branch), so UI-74 carries both and D-397 closes as placed; D-52 PLACED under its own id, first above the features (RECORD), with Membership v2 §8.1's superseded "no channel" paragraph sent to BOB #20 to fold; D-126 PLACED under its own id after UI-71, ONE row (RECORD, then UI) as BOB #19 decomposed it; D-80 stays in `DEBT.md`, its deferral sent to BOB #20 to be stated in `BIO_Content_Framework_v0_10.md`'s front matter (the third door); REC-155 — nothing placed: §4.10 is not on `origin/main` at `cfa6659c`, and BOB #20's entry carries its rows. D-195, D-52 and D-126 leave `DEBT.md` as PLACED in this commit.

**2026-09-21 · BOB #19 · SIX ROWS THAT WERE "WAITING ON BOB" ARE ANSWERED, AND FOUR OF THEM HAD ALREADY BEEN ANSWERED BY THEIR OWN DESIGNS. Each is now either a BUILD row to place or a stated deferral. Every disposition is written ON ITS ROW, dated, with the evidence at the code. Mint ids for new rows as you place them.**
- **D-195 → one UI row: THE ACCEPT CEREMONY SHOWS SHARED ORIGIN.** The plane half is BUILT (`Store#independenceOf`; the
  C-27.11 write gate; `op=versionstrength`'s `independence`). `civicos-ui/app.html` neither calls that op nor reads the
  field, so a member affirms "separately sufficient" against nothing. **design:** `INVESTIGATIVE-SESSION.md` §12 (b)
  and §14b.5. **accepts-when:** a fixture whose two parts share a capture shows that shared origin at the ceremony
  BEFORE the affirmation, and a NEGATIVE CONTROL hides the field and fails by name. Owner UI.
- **D-52 → one RECORD row: THE `export-performed` GENERATOR, in-app.** The channel is the queue, which is built, and
  the kind is already catalogued (`queuestate.mjs`). A new `export_log` row raises the FINDING to every administrator,
  with its `basis` naming that row. **design:** Membership v2 §8.1 with `NOTIFICATIONS.md` §The item contract. Under
  the catalogue's own rule it is the first generator to take an `N-<n>`. The `N` namespace is NOT among the 19 that
  `mintid` registers, so registering it is part of this row. Email transport stays Bob's (D-98) and blocks nothing here.
- **D-126 → one row: THE `per-item` WEIGHT** (`NOTIFICATIONS.md` §Applying a handler to a selection). Each item succeeds
  or is RETAINED WITH ITS REASON. UI-55's ARM 4d is the alarm that flips when an act accepts a set. Owner RECORD (the
  affordance and the acts), then UI. The 26 unbuilt generators stay under their own rows.
- **REC-135's question → one RECORD row: `ALREADY_A_CASE_MEMBER` ASKS FOR A PROJECT** (`INVESTIGATIVE-SESSION.md` §7.1
  item 9, written this commit). A new edition is warranted when the publishing project's latest conclusion is not the
  one the pinned edition recorded, whether or not `bundle_sha` moved. `op=reopen` does not change. **accepts-when:**
  REC-135's own probe path (conclude, publish, withdraw, conclude on another claim, publish) reaches a second edition,
  and publishing unchanged refuses as before.
- **D-80 → DEFERRED, nothing to place.** Its subject, the aspiration as an object, is ABSENT (`status.mjs 8.goals`).
  The specification of contact becomes a required clause of 8.goals' design act.
- **REC-155's seven routes → RULED in `BIO_Membership_Architecture_v2.md` §4.10**, landing after D-158 (which touches
  that file) so the two do not collide. It yields two landings: session reach for five ops plus `UNATTENDED_BY_DECISION`
  entries for two, then the bearer-write fence on the provenance pair. The rows follow in that entry.
**STILL WITH BOB, unchanged:** D-148 and D-149, with provisionals stated on both.

## DRAINED 2026-09-21 by SCHEDULER #5 — BOB #20's entry (REC-155 IS DESIGNED), verified at `BIO_Membership_Architecture_v2.md` §4.10 and at the code (the seven OPS rows, the UNDETERMINED header at `index.mjs`, REC-65's pin at `identity-claims.test.mjs` (e)): REC-155 re-rowed on §4.10 as LANDING 1 where it stood; LANDING 2 PLACED as `REC-158` directly after it, `depends-on` REC-155 DRIVEN; the SCHEDULER (#3) → BOB delegation (the seven undetermined session routes) DISCHARGED.

**2026-09-21 · BOB #20 · REC-155 IS DESIGNED: `BIO_Membership_Architecture_v2.md` §4.10 rules all seven session routes. It builds as TWO landings, and the second needs a NEW row whose id SCHEDULER mints. Owner RECORD. Intended place: REC-155 where it stands, the new row directly after it.**
REC-155's row still reads *"design: MISSING — routed to BOB"*. Its design is now §4.10: BOB #19 ruled it, and BOB #20
landed it after re-reading every citation at the code. **LANDING 1 is REC-155 itself.** `provenancechain`,
`provenanceroute`, `calibrate`, `calibrationsubject` and `calibrationsignal` join BOTH `SESSION_OPS` sets, each with an
arm DRIVEN through the plane from a signed-in session. `livefire` and `reproject` join `UNATTENDED_BY_DECISION`, each
with the citation §4.10 quotes. The header comment that calls the seven UNDETERMINED is corrected in the same commit. No
class list moves, so nobody loses reach, and I3 gains a MINOR IC. **LANDING 2 is a new row:** the provenance pair's
BEARER WRITE is refused BY NAME, on the D-421/D-136 pattern. That covers `provenancechain`'s `apply=1` arm (its REPORT
arm stays open to every class) and `provenanceroute` whole. It comes with a new C-number, REC-65's known-open pin in
`identity-claims.test.mjs` corrected with a comment saying why, and a MAJOR IC on I3. **depends-on:** landing 2 waits
for landing 1 to be DRIVEN, so D-200's chain-absent population keeps a route to repair. **accepts-when (1):** each of the
five answers a member session and an administrator session with the op's own result, and the two unattended ops answer
every session `MACHINE_CREDENTIAL_REQUIRED` with `recorded` citing §4.10's artifact. **(2):** a bearer `apply=1` and a
bearer `provenanceroute` are refused by name; a session's succeed, and its author is the session's member, never
`token:<class>`. **How a liar passes it:** an arm that calls the store directly. The session gate lives in `index.mjs`,
so only a request through the plane reaches it.

## DRAINED 2026-09-21 by SCHEDULER #7 — BOB #22's six entries (`3b904ea7`), each verified at its cited design and at the code on `origin/main` @ `2bd24da7`: (1) PLACED as `M0-97` directly after D-435, first among the instruments, with D-341 (the same file) PLACED after it; (2) PLACED as `REC-160` after D-389, its design `BIO_State_Rules_Consistency_v1_5.md` §5.4 with DEC-70, whose fold into a governed home is asked of BOB (`DECISIONS.md` is not governed); (3) APPLIED to M0-83 as item (4), the row rewritten to hold four items inside its budget; (4) D-260 PLACED under its own id after UI-71, both halves on its row; (5) D-293 PLACED under its own id after LED-9, this entry carrying the refusal's design; (6) PLACED as `REC-161` then `UI-75` directly after UI-74

**2026-09-21 · BOB #22 · `tools/decided.mjs` CANNOT SEE MOST OF BOB'S ANSWERED DECISIONS, AND IT HAS COST A RE-ASK (M-85).**
Design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header, which calls the index a
FLOOR. Verified at the code: `MARKER` in `tools/decided.mjs` is an uppercase-only word list, while `DECISIONS.md` records
an answer in a lowercase `decided:` field, so an entry whose `response:` carries no uppercase marker word is not indexed.
13 of 19 entries are not filed under their own id, 11 of them answered or enacted; `decided.mjs "severance"` returns
DEC-29 and DEC-72, not DEC-70, which rules exactly that. SCHEDULER #5 sent D-280 (c) to BOB eleven days after Bob ruled
it, and BOB #22 was one step from ruling the opposite. `CLAUDE.md` §1 names this tool the one source for what has been
decided, so place it first among the instruments. Sequence with D-341 (same file): one file, one suite, one gate.

1. **M0 (FULL GATE PROFILE):** a `DECISIONS.md` entry that carries a `decided:` line is indexed as ONE ruling under its own
   `DEC-n` (text from `response:`, date from `decided:`), beside the prose `MARKER` scan and never replacing it; an `open`
   or `deferred` entry is not indexed as a ruling. **Accepts when** every answered or enacted `### DEC-n` heading is
   returned by `decided.mjs "DEC-n"` (a printed count equality against the file's own headings), `decided.mjs
   "severance"` returns DEC-70, and a deferred entry is not returned. **The cheap defeat to refuse:** lower-casing
   `MARKER`, which floods the index with every prose *decided*, so an arm asserts the index grows only by the entries it
   did not already file and files none twice. NEGATIVE CONTROL: drop the field arm, and the equality fails naming DEC-70.

**2026-09-21 · BOB #22 · `op=reevaluations` SAYS A SEVERED LEG *RESTS ON* ITS TARGET AND PUBLISHES NO STATUS — the gap
DEC-70 leaves at its own pin.** Design: `docs/development/DECISIONS.md` DEC-70 (Bob, 2026-09-10): *severance discharges
SUPPORT, never CONNECTION*, and *the connection INFORMS, never binds*. Verified at the code: `Store#reevaluations` reads
legs from `inquiry_basis`, which drops `status`, and its edition cause says *"this leg rests on edition N"* for every
leg; nothing in the answer says a leg was withdrawn. `#refEdgeSevered` is the one predicate, and `restingOn` already
publishes a status from it. D-280 closed this commit; nothing is superseded.

1. **RECORD (M9; I3 additive, the integrator mints the IC):** each obligation leg carries `status` (`severed` |
   `confirmed`) from `#refEdgeSevered(bundle, target)`, and a severed leg's edition detail says the withdrawn leg NAMED
   edition N rather than resting on it. The obligation still fires (DEC-70) and derives nothing from strength. **Accepts
   when** a drive through the op shows a severed leg `status: "severed"` with wording that claims no support, and a
   confirmed leg unchanged. **The cheap defeat to refuse:** filtering the severed leg out, which reverses DEC-70, so
   `d280-strengthbar.test.mjs` SITE (c) stays green; an unrecorded or unrecognised `status` reads `confirmed`. NEGATIVE
   CONTROL: drop the status, and the severed-leg arm fails by name.

**2026-09-21 · BOB #22 · M0-83 GAINS ITEM (4): `tools/retirable.mjs` JUDGES OTHER REPOSITORIES' SESSIONS AGAINST BIO'S
REMOTES** (measured by BOB #21, BOB-NEXT §3.4). Design: M0-83's own. Fed the account's whole `list_sessions`, it called
24 Supervisor sessions RETIRABLE (their cwd no longer exists) and 15 Alpha-Pipeline sessions HOLD; BOB #22's sweep fed
BIO sessions only, by hand, which is this fix done manually. Amends M0-83's scope; supersedes nothing.

1. **M0-83 item (4) (owner BOB; FULL GATE PROFILE):** judge only sessions whose `cwd` resolves inside this repository (the
   primary checkout or `.claude/worktrees/*`) and report the rest OUT OF SCOPE, never RETIRABLE, HOLD or PROTECTED, with
   their count printed. **Accepts when** an input mixing a BIO session, another repository's and a vanished cwd judges the
   first and names the other two out of scope. **The cheap defeat to refuse:** a prefix match on the path, so an arm feeds
   a sibling directory sharing the prefix and asserts it is out of scope. NEGATIVE CONTROL: drop the scope test, and the
   other-repository arm fails by name.

**2026-09-21 · BOB #22 · D-260 RULED — AN INSTANCE MAY HOLD ONE ORGANISATION-PRINCIPAL `ai` CREDENTIAL AND RESUMES ONLY
THE RUNS IT OPENED (SCHEDULER (#5)'s Q3).** Design: `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6, the D-260
paragraph (this commit); the deploy half is `BIO_Distribution_v0_1.md` §6's bullet. Verified at the code: a run's
principal is stamped `principal/tokenId` at the open (`index.mjs`, D-199 (4)); only that principal ticks or closes it
(REC-152, C-22.12); a machine credential stamps an empty actor, so an organisation key may open a run within its scope;
`AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`. Place D-260 under its own id with the dispatch fix
on its row; a member-principal run's non-resumption is the stated limitation in that paragraph.

1. **RECORD with FLEET (M9; I8, which leaves PROVISIONAL when this lands):** FL-4's wake dispatches a woken run to
   `agent-worker` with the instance's organisation credential ONLY when that credential's stamped principal equals the
   run's `principal_plane`, and otherwise logs that it did not; the dispatch hands `claude_accounts` its instance level.
   **Accepts when** a run the instance credential opened resumes after its capture completes, and a member's run is not
   dispatched and says so. **The cheap defeat to refuse:** dispatching every woken run and leaning on REC-152 to refuse
   the tick, so the arm asserts the member's run is never DISPATCHED.
2. **DIST, after 1:** install and update carry that credential as a secret the way `DAEMON_TOKEN` is carried, never in the
   record, denylisted by `tokens.mjs` on publication.

**2026-09-21 · BOB #22 · D-293 RULED — THE PUSH GUARD NEVER RUNS `tools/gates.mjs`, AND IS TO REFUSE A TREE WHOSE
RECORDED VERDICT IS RED, WHICH IS NOT BUILT (SCHEDULER (#5)'s Q4).** Design: `docs/development/VERIFICATION.md`, the push-guard section, which
already states the first half: the hook *"runs `decided.mjs --check` and REFUSES a stale push"*, nothing more. THIS ENTRY
CARRIES THE SECOND HALF until it is built, because that file is at its reading budget (24,567 of 24,576 B) and its
register block is quoted by `register-grammar.control.mjs`'s arms, so a cut there is its owner's act: the builder adds
the refusal's one line in the landing that builds it. Measured (M-85): a full gate takes ~25 minutes and `main` took 48
first-parent commits from 13:00Z on 2026-09-21, 46 of 47 gaps under 25 minutes, so a push-time gate would rebase and
re-gate without converging. Place D-293 under its own id, owner M0.

1. **M0 (FULL GATE PROFILE):** `gates.mjs` records its verdict and class keyed by the tree it measured, only when that tree
   was CLEAN, untracked under the git common dir; the guard refuses a push whose tip tree carries a RED record, naming it,
   and says nothing when none exists. **Accepts when** a RED gate then a push of that tree is refused by name, and a GREEN,
   an unrecorded and a changed tree each pass. **The cheap defeat to refuse:** keying on the commit sha, which an amend of
   the message alone evades, so the arm amends and asserts the refusal holds. NEGATIVE CONTROL: drop the guard's lookup,
   and the RED-then-push arm fails by name.

**2026-09-21 · BOB #22 · D-195'S SHARED-ORIGIN DISCLOSURE AT THE MEMBER'S OWN ELICITATION — TWO ITEMS, IN ORDER (SCHEDULER
(#5)'s Q1, RULED).** Design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c) (this commit). Verified at the
code: UI-27's read-back (`elicFalsifier`) prints *"Your answer fails only if ALL of these fail"* and reads no
independence (`versionstrength` and `independence` occur 0 times in `civicos-ui/app.html`); `Store#independenceOf` has
two consumers, `op=suggest`'s check and `op=versionstrength`'s read of a STORED version. Place after UI-74, which shows
the same fact at the accept ceremony; whichever lands second reuses the first's rendering.

1. **RECORD (M9; I3 additive, an IC):** a read returning `#independenceOf` for a PROPOSED partition over an inquiry's
   existing legs, gated as `op=versionstrength` is, writing nothing, `checked`/`complete` as they already are. **Accepts
   when** two parts sharing a capture read as sharing an origin, independent parts read clean, a one-part partition reads
   `checked: false`, and the answer equals `op=versionstrength`'s once the partition is written. **The cheap defeat to
   refuse:** a second derivation that agrees today, so a control swaps in a copy differing in one branch and fails by name.
2. **UI (M9), after 1:** the read-back names each shared origin between the parts it lists, once (DEC-69), before the
   answers are written; it prefills nothing, refuses nothing, shows no strength and no AND/OR word. **Accepts when** two
   correlated reasons show their origin and the member's answers are written unchanged. **The cheap defeat to refuse:**
   blocking or reordering the answers on a shared origin, which turns an informing fact into a gate.

## DRAINED 2026-09-21 by SCHEDULER #7 — BOB #23's entry (`c31b8f60`), verified at `BIO_Membership_Architecture_v2.md` §4.9 and at the code (the five founder-only ops; `index.mjs`' two `governorconfig` comments): PLACED as `REC-162`, back to back after REC-159; the REC-156 DELEGATION DISCHARGED

**2026-09-21 · BOB #23 · `op=governorconfig` IS THE OPERATOR'S, AND ITS REFUSAL CALLS AN ENROLLED ADMINISTRATOR A
NON-ADMINISTRATOR (the REC-156 DELEGATION's item 3, RULED).** Design: `docs/architecture/BIO_Membership_Architecture_v2.md`
§4.9, the paragraph *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (this commit). Verified at the code: exactly five ops sit
in `SESSION_OPS.admin` and not in `SESSION_OPS.member` (`governorconfig`, `memberadd`, `memberset`, `signeradd`,
`signerset`, re-derived from `index.mjs` and pinned by `d270-refusal-truth.test.mjs`'s ROLE literal); a member-kind
session refused one gets `SESSION_ROLE_CANNOT_REACH_OP`, whose sentence says the op *"is reserved to an administrator of
this group"* and that the session's role is `member` — false of an ENROLLED administrator, whose `kind` is `member` by
D-136's measurement. `Store#governorAdmit` ranks a host's configured appetite above the hosting account's
`GOVERNOR_APPETITE_PER_MIN`, which is the ruling's reason. Supersedes nothing; the DELEGATION's item 2 is REC-159.

1. **RECORD (M8; I3, the integrator classifies it in IC-55's family):** the (b) refusal says WHICH session reaches the op,
   derived from the set that reaches it, so it cannot go false when an op moves: an op only `SESSION_OPS.admin` reaches is
   *reserved to the founder's session* (the operator's sign-in, Membership v2 §4.9), and the sentence neither calls it an
   administrator's nor says the caller's role is not one. It is TRUE TODAY of all five, so it may land alone; it touches
   the two suites REC-159 does, so sequence the two back to back and let the second re-read the first's pins. In the same
   landing, correct `index.mjs`' two `governorconfig` comments (the OPS row's *"the same line memberset and signerset
   draw"*, the NEEDS entry's *"the same as the roster ops above"*): its line is §4.8's, not §4.9's. **Accepts when** an
   enrolled administrator and an ordinary member, each refused `governorconfig`, read the founder's-session sentence, and
   the founder's session and the ADMIN_TOKEN bearer still set an appetite. **The cheap defeat to refuse:** moving
   `governorconfig` into both session sets, which reverses the ruling, so an arm asserts the enrolled administrator is
   still REFUSED. `d270-refusal-truth`'s `/administrator/` assertion on every ROLE op is corrected with a dated reason,
   never exempted. NEGATIVE CONTROL: restore the administrator sentence for a founder-only op, and the arm fails by name.

## DRAINED 2026-09-21 by SCHEDULER #8 — BOB #23's entry (`bb83b37e`), verified at `ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER" (rules 1–4, landed in that commit): PLACED as D-293 (moved up, item 1 folded beside it), M0-98, M0-99, M0-100 and M0-101, heading the backlog in the ruling's order

**2026-09-21 · BOB #23 · THE RECORD IS PARTITIONED BY WRITER, AND A REBASE RE-CHECKS ONLY WHAT BOTH SIDES TOUCHED — FOUR
ITEMS, IN ORDER (Bob's direction: *"This 'fake' conflict has significantly slowed down development recently"*, via CONDUCT
#10; and *"there's no need to run excessively more tests than is needed"*).** Design: `docs/development/ORCHESTRATION.md`,
*THE RECORD IS PARTITIONED BY WRITER* (this commit), whose measurements are the reason; the gate half is CARRIED HERE,
because `VERIFICATION.md` is at its reading budget. Place at the head of the instrument cluster: it is the estate's
throughput. Supersedes nothing; item 1 builds on D-293 in the same file.

1. **M0 (FULL GATE PROFILE), with D-293 — one file, one suite, one gate:** `gates.mjs` records its verdict keyed by the
   tree (D-293); a TARGETED class — a diff touching no `bio-plane/src|checks`, `civicos-ui/`, fleet, installer or
   package/config file runs the suites that import, spawn or MENTION a changed path (derived at run time and printed, as
   DOCS is), `coverage --strict` when a test file changed, and plancheck; and `--since`, which after a rebase reads the
   recorded verdict and re-runs only suites whose inputs intersect files changed on BOTH sides, plus plancheck. **Accepts
   when** a tools-only diff selects its importers and the register gate, a `src/` edit alongside reads FULL, and a rebase
   over disjoint docs commits re-runs only plancheck. **The cheap defeat to refuse:** selecting by exact import alone, which
   misses a suite reading through a computed path, so selection is by MENTION. NEGATIVE CONTROL: stage a `src/` edit with a
   tools edit, and the class must read FULL.
2. **M0 (FULL GATE PROFILE): `docs/DECIDED.md` stops being committed.** Untracked and ignored; `decided.mjs` writes it on
   demand and the seven tools that read it read through one freshness call; the push guard's and plancheck's staleness
   arms retire, their suites corrected with dated reasons, never exempted. **Accepts when** a ruling edited on two branches
   merges with no `DECIDED.md` conflict and `decided.mjs "<subject>"` answers from the merged corpus. **The cheap defeat
   to refuse:** keeping it committed under `merge=ours`, which hides staleness, so an arm asserts it is untracked.
3. **M0 (FULL GATE PROFILE): one file per NEW CLAIM, DELEGATION, measurement and interface-change entry**, the old files
   frozen history plus the state lines of their open blocks; ONE reader module yields both for every reader (`plancheck`,
   `delegations`, `owed`, `ledger`, `decided`, `mintid` …); `CLAUDE.md` §4's claim sentence and the kickoffs corrected
   in the landing. **Accepts when** two lanes adding entries concurrently merge with no conflict, a line one lane adds to
   its own block beside another lane's new entry stays in its block, and every reader's counts over the frozen history are
   unchanged. **The cheap defeat to refuse:** `merge=union`, which makes CONDUCT's detached-line case SILENT, so an arm
   reproduces that case and asserts the line stays in its block.
4. **M0 with CONDUCT, after 3: `running` leaves SCHEDULER's rows** for a CONDUCT-owned per-row record written at spawn and
   removed at integration; `ledger.mjs` and `refill` read it. **Accepts when** CONDUCT writes no line of `QUEUE.md` and a
   running row still reads `running`. **The cheap defeat to refuse:** writing both places, so an arm asserts one.

## DRAINED 2026-09-21 by SCHEDULER #9 — BOB #23's entry (`8d2ba50f`), verified at `BIO_Content_Framework_v0_10.md` §8.4 (Bob's ruling, its four fences) and at the code on `origin/main` @ `c05d71c8` (`ENTITY_KINDS` holds ten named-entity kinds and no theme; `bio-plane/src` names no theme; C-54.1 refuses a lead by name): item 1 PLACED as `D-162` (RECORD, M4) under its own id, with the meaning-layer features after D-394; item 2 PLACED as `UI-76` (UI, M8) directly after it (`node tools/mintid.mjs UI`); D-162 left DEBT by the second door. The backlog was over its 150 KiB budget, so ten rows at the foot were cut to their fields (`QUEUE-cut-2026-09-21.md`).

**2026-09-21 · BOB #23 · D-162 RULED BY BOB — THEMES: A CONNECTION THROUGH AN IDEA, DECLARED UNDER A COVER, NEVER A BASIS.**
Design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4 (this commit), Bob's ruling with the four fences. Verified
at the code: `ENTITY_KINDS` holds ten named-entity kinds and no theme; a lead is refused BY NAME as a basis leg
(`LEAD_NOT_EVIDENCE`), the pattern fence 4 reuses. D-162 leaves DEBT by the second door under its own id. Place with
the meaning-layer features (M4), after the instrument cluster.

1. **RECORD (M4; I3 additive, the integrator mints the IC):** a theme object declared by a member session under its
   cover, with a required TEST; an attributed act placing a document or content row in it; a machine proposal stored as
   a HUNCH that never counts as membership until a member confirms; and every basis, version and action-basis leg
   resting on a theme refused BY NAME. **Accepts when** a member declares a theme with a test and places two documents
   sharing no entity in it, a proposal reads as a hunch, and a leg citing the theme is refused by name. **The cheap
   defeat to refuse:** a theme as an eleventh entity kind, which makes it a named thing and a citable one, so an arm
   asserts it is not in `ENTITY_KINDS` and cannot be a leg.
2. **UI (M8), after 1:** declare, test and place from the member surface, the cover shown on every theme.

## DRAINED 2026-09-21 by SCHEDULER #9 — BOB #24's entry (`710b574d`), verified at `EXTRACTION-BREADTH-DESIGN.md` §3.2 (`{part}` is a container member only) and `CLIENT-RENDERED.md` "DESIGNED 2026-09-21", and at the code on `origin/main` @ `313f00ca` (`coversImage` refuses nothing when a capture holds no image list, and has no `{page, rect}` branch; acquire records a PDF's `container_extent` as null): item 1 PLACED as `D-440` (RECORD, M4) after D-57 with the claims the record cannot support, and D-420 (CAPTURE with RECORD, M4) placed directly after it by LED-7, one worker for both; both left DEBT by the second door. Item 2: D-64 stays in DEBT for LED-7, its four questions to come to BOB before its build is placed. Item 3: nothing owed.

**2026-09-21 · BOB #24 · D-55 CLOSED BY DESIGN: AUTHORITY STAYS AT DOCUMENT GRAIN; D-64 IS NO LONGER BLOCKED ON IT; ONE FENCE, D-440, TO PLACE.**
Design: `docs/development/CLIENT-RENDERED.md`, §What must be recorded, "DESIGNED 2026-09-21" (this commit), folded into
`AUTHORITY-AND-TRUST.md` §What D-55 becomes. Traced at the code first (`c05d71c8`): no third party's script output can enter
a capture today, and third-party images and media are never fetched; a content row's document is always a registered capture; and the `image` arm's `{part}` form mints
UNJOINED on any capture that is not an office container. D-55 left DEBT closed by design, archived in this commit.
SCHEDULER (#8)'s Q4 is answered.

1. **RECORD (M4): D-440, the `{part}` fence.** Place it beside D-420: same function (`coversImage`), and one worker can
   take both. **Accepts when** a `{part}` on an HTML capture is refused by name, pointing at acquiring the image as its
   own document; a container capture still mints; an office capture with no persisted image list is still admitted as
   undetermined, stated; and a negative control removes the refusal and fails by name.
2. **D-64 (M2) stays in DEBT for LED-7's triage; its disposition no longer names D-55.** Its build carries the design's
   item 3: a rendered capture is `determined` as the host only when the host alone supplied data and ran code, and
   otherwise `undetermined`, naming each other origin, with a suite and a negative control. Its four open questions for
   ratification (`CLIENT-RENDERED.md`) come to BOB for design before it is placed as a build: route them here when M2
   reaches it.
3. **Nothing else is owed.** Registering a held subresource as its own document (the design's item 2) is not built and
   is not owed until a member needs it. Attribution of a rendered page's regions is deferred, with its trigger named.

## DRAINED 2026-09-21 by SCHEDULER #9 — BOB #24's answers to SCHEDULER #9's group of four (`26de0439`), each verified at its document: D-36 CLOSED BY THE THIRD DOOR (`RETRIEVAL-SUBSTRATE.md`'s front matter), D-56 CLOSED BY THE THIRD DOOR (`CLIENT-RENDERED.md`), D-69 CLOSED IN FACT (`CONSTRUCTS.md`'s front matter), D-66 NARROWED to its owed budget-or-dataset measurement and left in DEBT; MILESTONES' placement rows for D-36 and D-69 updated. Item 1: REC-163 and UI-77 AMENDED to `BIO_Publication_v0_1.md` §7 (the slug is public; `op=instancegroup` gains the public class). Items 2 and 3: PLACED as `REC-164` (the display name and verified domain) and `UI-78` after UI-75, the first features after DEC-24's member half. Seven foot rows cut to their fields for room.

**2026-09-21 · BOB #24 · SCHEDULER #9's GROUP OF FOUR ANSWERED: THREE FOLDS, AND THE PUBLISHING GROUP'S PUBLIC IDENTITY DESIGNED.**
Q1: both workerd ceilings and `npm run probe:limits` are a stated limitation in `RETRIEVAL-SUBSTRATE.md`'s front matter,
so D-36 leaves by the third door. Q2: the 2026-07-29 measurement and the 1102 watch are in `CLIENT-RENDERED.md` (§What
Workers Paid actually buys), so D-56 leaves by the third door. Q3: CONSTRUCTS' front matter states every step, so D-69
closes in fact. The budget-or-dataset type is OWED, measured first (`EXTRACTION-BREADTH-DESIGN.md` §2 row 5), so D-66
stays open, narrowed to that measurement. Q4: `BIO_Publication_v0_1.md` §7 (this commit).

1. **REC-163 and UI-77 (M7), a CHANGE TO THE PLACED ROWS:** the public surfaces show the recorded slug, or say that none
   is recorded, instead of a neutral label. `op=instancegroup` admits the public class (I3 additive; the integrator mints
   the IC). Amend both rows' scope and accepts-when: signed out, the setup page and the public header render the recorded
   slug.
2. **RECORD (M7), after REC-163: the display name and the verified domain.** Two values in the store's durable state,
   each set by an administrator's session act with `by` stamped by the server and a dated history. The domain gets a
   verifier that fetches a well-known file on it, through the per-host governor, naming this instance's address and slug,
   records `verified`, `absent` or `mismatched` with a date, and re-checks on the reconciling alarm. A public read returns
   the display name and a domain only while it is verified. **Accepts when** a bearer and a caller-supplied `by` are
   refused; an unverified domain never appears in a public read; a well-known file naming another instance reads
   `mismatched`; and the display name appears in no signed bytes.
3. **UI (M7), after 2:** the public header shows the display name WITH the slug, never instead of it, and a domain only
   while verified; members see the domain claim and its verdict.

## DRAINED 2026-09-21 by SCHEDULER #10 — BOB #25's answers to SCHEDULER #10's group of three (`37367611`), each verified at its document: D-75, D-76, D-77, D-79, D-81, D-87, D-88 and D-120 CLOSED BY THE THIRD DOOR (the Framework's front matter, §12 and §13.1; `SOURCE-ACCESS.md` item 2); item 1 PLACED as REC-165 after UI-77, verified at the code (`op=suggest` and `op=extractpropose` never apply `runPrincipalGate`); items 2 and 3 PLACED as D-85 after REC-165, keeping its id.

**2026-09-21 · BOB #25 · SCHEDULER #10's GROUP OF THREE ANSWERED: TWO STATED DEFERRALS, D-85 NARROWED, AND A DEFECT
FOUND WHILE TRACING IT.** Q1: the intent layer's objects are a stated deferral with its trigger in the Framework's
front matter (Incomplete sections, §12), which also corrects the focus/problem sentence: D-75, D-76, D-81 and D-77 leave
by the third door; D-79 is BUILT for derived findings (REC-6, REC-7) and its assistant half is fenced by item 2, its
aggregation and ageing deferred to the first role whose output is a new inquiry (third door). Q2: D-85 is carried by the
RUN (`INVESTIGATIVE-SESSION.md` §3) and stays open NARROWED to items 2 and 3, keeping its id (door 2); D-87 and D-88
are deferred with §12's evaluator (third door). Q3: D-120 is a stated deferral in `SOURCE-ACCESS.md` item 2, trigger
named (third door). All three items are designed in `INVESTIGATIVE-SESSION.md` §11 item 5.

1. **RECORD (M9), a DEFECT in built work, FIRST of the three: a production can name a run its caller does not hold.**
   At `ae4f42d0` `op=suggest` resolves `run` for existence alone and `op=extractpropose` checks running and mode, not
   whose run it is; `runPrincipalGate` guards only tick and close, and `index.mjs` stamps the caller's `principal`
   only on the three run verbs. So a version is read against another member's lens, bar, skill version and principal.
   **Fix** (rule 1): REC-152's stamp on both ops, both apply `runPrincipalGate`, and `suggest` refuses a run that is
   not running, as `extractpropose` already does. I3: two ops refuse what they accepted (the integrator mints the IC).
   **Accepts when** another principal's running run is refused `AI_RUN_NOT_PRINCIPAL` on both ops, the caller's
   closed run is refused on `suggest`, and the caller's own running run lands from a session AND from a machine
   credential that member minted. How a liar passes: gating one caller kind only, so both arms run. NEGATIVE CONTROL:
   drop the gate in `suggest`, and the other-principal arm fails by name.
2. **RECORD (M4), D-85 narrowed, after 1: an assistant opens a question only inside a run it holds** (rule 2). An `ai`
   credential's creation of an inquiry names a running run whose principal it is; the plane records the link in an
   instance row keyed by the new inquiry (cleared by `purge`'s whole-store and per-bundle arms), never in the signed
   bytes, and counts it against a declared `surfaces` bound, refused when none is declared. The single-bundle
   `op=projection` states the inquiry's run and that run's lens block; one surfaced earlier reads `not recorded`.
   **Accepts when** a creation outside a run, in another principal's run, or past the bound is refused by name; one
   inside lands with its row and reads the run's lens and `moved`; a member session's creation is untouched. NEGATIVE
   CONTROL: drop the run check, and the outside-a-run arm fails by name.
3. **RECORD (M4), D-85 narrowed, with 2: the run records the lens in force when it opened** (rule 3). `aiRunOpen` also
   stores the effective set's `statements_sha` for the run's context, computed by the plane at the open, and the run's
   read distinguishes `moved` (the in-force set changed since) from a handed manifest that differed at the open.
   **Accepts when** a run handed a stale manifest reads the second and not `moved`, and a run handed the current one
   reads `moved: false` until a statement changes and `moved: true` after.

## DRAINED 2026-09-22 by SCHEDULER #11 — BOB #25's D-293 design-gap entry (`5a807b8a`), verified at the code on `origin/main` @ `06832aff` (`tools/gates.mjs` records a verdict only when the tree was clean at the start, `CLEAN_AT_START`, and `--since` needs a GREEN record of the old tree; `VERIFICATION.md` is 24,572 B and in `readbudget.mjs`'s `CUT` set): item 1 PLACED as `M0-104`, FIRST of the queued rows, where D-293 stood — a correction to just-landed work, and the record `--since` needs on the commonest landing shape; item 2 PLACED as `M0-105` directly after it, the cut that folds item 1's line. Both at the head of the backlog, so the next refill moves them into the cache; nine rows at the foot cut to their fields for the room (`docs/archive/ledgers/QUEUE-cut-2026-09-22.md`).

**2026-09-21 · BOB #25 · D-293's DESIGN GAP RULED: A DIRTY RUN IS RECORDED UNDER THE TREE `git add -A` WOULD COMMIT —
AND `VERIFICATION.md` NEEDS A CUT, BECAUSE ITS RULINGS NO LONGER FIT IN IT.** BOB #22 keyed the record by the tree
measured *"only when that tree was CLEAN"*; the D-293 worker built exactly that and sent the gap (CLAIMS.md, DELEGATION
2026-09-21 M0 (D-293/M0-98 worker) -> BOB, DESIGN GAP). So the shape that opened D-293 — a gate on a dirty tree, then
`git add -A && git commit && git push` — still pushes a RED tree unrefused. **RULED: take the worker's fix, with one
condition.** A dirty run is keyed by the tree a TEMPORARY index writes (`GIT_INDEX_FILE=<temp> git add -A && git
write-tree`), which is byte for byte the tree that commit publishes; the live index is never touched. The key is taken at
the run's START and again at its END, and the verdict is recorded only when the two agree: a tree that changed under the
gate measured a tree that never existed (`CLAUDE.md` §6), so the run records nothing and says so. **Why widening is
sound:** the key is the exact tree a commit publishes, so a RED record refuses exactly those bytes and a GREEN one licenses
`--since`'s narrower re-check of exactly those bytes; a commit of PART of a dirty tree finds no record and falls back to
the ordinary gate and a silent guard — BOB #22's *"says nothing when none exists"*, never a pass it vouches for. The
design is CARRIED here, as BOB #22's was, because `VERIFICATION.md` stands at 24,572 of its 24,576 B.

1. **M0 (FULL GATE PROFILE), after D-293 (on `main` at `ab34197b`): the dirty-tree key.** `gates.mjs` computes the
   temporary-index tree at the run's start and end and records a dirty run's verdict under it when they agree; nothing
   else about the record or the guard moves. **Accepts when** a RED gate on a dirty tree, then `git add -A && git
   commit` and a push, is refused by name; a dirty run whose tree changes mid-run records nothing and says so; a GREEN
   dirty run then that commit passes; and a commit of part of the dirty tree passes with no record. How a liar passes:
   keying by the LIVE index, which stages the member's files as a side effect, so an arm asserts the index is byte
   identical before and after. NEGATIVE CONTROL: drop the dirty arm, and the RED-dirty-then-commit arm fails by name.
2. **M0 (DOCS PROFILE), before any further ruling is folded there: cut `VERIFICATION.md` to about 22 KB.** It is in
   `readbudget.mjs`'s `CUT` set, so a fold past 24,576 B FAILS, and rulings about verification are now being carried in
   inbox entries that drain to an archive nobody reads whole — item 1's line, and M0-97's second specimen kind when it
   integrates. Move history and receipts verbatim to `docs/archive/`, keep every rule, and move the arms of
   `register-grammar.control.mjs` that quote its register block with the block; then fold item 1's line. **Accepts when**
   the file is at most 22,528 B, every sentence the cut removes is in the archive file verbatim (moved, never lost),
   and the register-grammar suite and its control pass.

## DRAINED 2026-09-22 by SCHEDULER #11 — BOB #25's REC-157 ruling (`032d1ce1`), verified at `INVESTIGATIVE-SESSION.md` §7 (*A PROJECT'S MAKE-CURRENT WRITES NOTHING ON THE SHARED QUESTION*, its Incomplete bullet NOT BUILT) and at the code on `032d1ce1` (the make-current path writes `last_updated` and the Session Log line into the INQUIRY and promotes it before the project's pointer, `store.mjs`): item 1 PLACED as `REC-166`, first of the product corrections, `depends-on` REC-157; item 2 APPLIED to `M0-105`, whose scope gains M0-97's second specimen and whose `depends-on` gains M0-97.

**2026-09-22 · BOB #25 · REC-157'S DELEGATION RULED: A PROJECT'S MAKE-CURRENT WRITES NOTHING ON THE SHARED QUESTION — AND
M0-97'S SECOND SPECIMEN JOINS `VERIFICATION.md`'S CUT.** The delegation sits on `conduct11/batch2` and reaches `main` with
CONDUCT #12's landing of it; the ruling is in `INVESTIGATIVE-SESSION.md` §7 (this commit).

1. **RECORD (M10), after REC-157 lands: `op=versioncurrent`'s project arm writes only the project.** Its receipt — the
   `last_updated` and the Session Log line *reading '<v>' is what P stands on* — moves into the promotion that writes P's
   pointer, and the inquiry is not promoted by it. Accept, reject, hide and their siblings still promote the inquiry.
   **Accepts when**, after a project-arm make-current, the inquiry's `bundle_sha` is unchanged, `op=caseflags` names no
   case for it, a published case pinning the finding keeps CASE-4's fences, and P's Session Log carries the line; and
   `op=versionaccept` still moves the inquiry. How a liar passes: dropping the receipt with the promotion, so an arm
   asserts the line in P's bytes. NEGATIVE CONTROL: restore the inquiry promotion, and the `bundle_sha`-unchanged arm
   fails by name.
2. **An amendment to the cut placed as item 2 of BOB #25's D-293 entry (still undrained above):** with the cut, fold
   M0-97's second specimen into `VERIFICATION.md`'s section *DOES THE CITATION RESOLVE TO THE ACTOR THE SENTENCE NAMES?*
   — since M0-97 a quoted register entry (a `### DEC-n` heading followed by a `decided:` line) is filed as a ruling from
   ANY corpus file, so a quote of one outside `DECISIONS.md` is a phantom-ruling specimen beside the marker words, and
   M0-97's suite already fails such a row by name.

## DRAINED 2026-09-22 by SCHEDULER #11 — BOB #25's cut-the-work entry (`032d1ce1`), verified at the code on `032d1ce1` (`kickoffs/DIST.md` step 1 still calls merged `main` *a tree nobody has tested*; 57 `timeout:` sites in 43 suites, and neither `gates.mjs` nor `battery.mjs` names a timeout outcome): item 1 PLACED as `M0-106` (DIST's own kickoff) and item 2 as `M0-107`, both where M0-103 stood; M0-103 SUPERSEDED by M0-107, which takes its fix to its class and names its two spawns as the first site.

**2026-09-22 · BOB #25 · GATES RUN FAR MORE THAN THEY NEED TO, ON A MACHINE THAT SWAPS — CUT THE WORK, DO NOT QUEUE IT
(Bob, 2026-09-22: lanes must not back up behind long runs, and massive suite sets run only when necessary).** Measured
2026-09-22 ~12:30Z: this machine has 8 GiB of RAM with 4.96 of 6 GiB swap in use and a load average near 5.5 while
several sessions and batteries run, so a gate runs 4-10x slow — DIST #4's FULL release gate took about 2.5 hours for a
battery that runs in roughly 16 minutes, SCHEDULER #10's DOCS gate 1h27m, BOB #25's 853.9 s against 234.0 s. Load also
FALSIFIES: DIST #4's gate read RED on `owed-controls` A13/A13b beside a concurrent battery (M0-103), and since D-293 a
false RED is recorded and refuses the push. Making every gate wait for quiet was considered and REFUSED: it queues the
same work behind the longest run, which is the backup Bob named. Two items, before M0-103, which becomes item 2's first
instance:

1. **DIST (a `kickoffs/DIST.md` change, this lane's to rule and DIST's to write): step 1 re-runs the entire battery on
   merged `main` because *"main after a merge is a tree nobody has tested"* — false wherever `main`'s exact tree already
   carries a GREEN FULL record (D-293 keys the record by tree).** Step 1 becomes: a GREEN FULL record for the tree being
   released, or `gates.mjs --since <the newest commit whose tree carries one>` (M0-98), and the entire battery only when
   neither exists; the version bump's own check stays. **Accepts when** a release from a tree with a GREEN FULL record
   runs no battery and names the record it relied on, and a release from an unrecorded tree runs the battery as today.
2. **M0 (FULL GATE PROFILE): load makes a gate SLOWER, never WRONG — M0-103's fix taken to its class.** Every suite whose
   subprocess or wall-clock budget can expire reads the expiry as ONE named timeout assertion, never as a finding, and a
   run whose only failures are timeouts records NOT MEASURED instead of RED, so the push guard does not refuse on it.
   **Accepts when** a sweep of the battery names every `timeout:` and budget site and each has its outcome check; a run
   killed only by timeouts writes no RED record. How a liar passes: raising every timeout, which hides a real hang, so
   an arm plants a hang and asserts it is still named. NEGATIVE CONTROL: a 1 ms budget on one swept site fails its
   timeout assertion by name and no finding assertion.

## DRAINED 2026-09-22 by SCHEDULER #12 — BOB #26's entry (`7c967f09`), verified at `BIO_Content_Framework_v0_10.md` §14.4 and §18, `BIO_Intake_Doctrine_v1_1.md` §8 and `NOTIFICATIONS.md` "MARKED AS HANDLED", and at the code on `7c967f09`: D-152 and D-164 CLOSED IN FACT (door 1); item 1 PLACED as D-179 and item 2 as D-125 (door 2, each keeping its id), their DEBT rows archived as placed. The digest-level cross-bundle duplicate the entry names as not reached is not rowed here.

**2026-09-22 · BOB #26 · SCHEDULER #11's GROUP OF FOUR ANSWERED — TWO CLOSED IN FACT, TWO BUILD ITEMS.** Each traced at
the code on `48aab56b` and ruled in its home document. **Q1, D-152 — door 1, CLOSED IN FACT:** DEC-4's *an OCR citation
carries its image region* is met at the leg by a CAP, never a refusal (`BIO_Content_Framework_v0_10.md` §14.4); evidence:
`checkEarnedLeg` bounds a leg's capture letter by `captureBound` (C-2.8, REC-88), `gradeCeiling` lets only a covering
attestation raise a content row and `extentCovers` gives a rect-less target no region's (`textchain.mjs`), the text index
carries `chain_kind`, and the rest SCHEDULER #11 verified on `06832aff`. A refusal would press a member to invent a region.
**Q2, D-164 — door 1, CLOSED IN FACT:** Bob's reopening condition of 2026-09-15 is met (Framework §18): Part II reviewed by
Bob on 2026-09-14, the six pieces designed in their homes, the primitive BUILT (`node tools/status.mjs 4`); what remains
is REC-122, D-394 and the TRANSCRIBE surface. `BIO_System_Design.md` §5's M4 cell, `INVESTIGATIVE-SESSION.md` and
`STORE-AS-CACHE.md` are marked; `MILESTONES.md`'s D-164 row is SCHEDULER's to move. **Q3, D-125, and Q4, D-179 — door 2,
each keeping its id:** items 2 and 1. Both are product corrections and neither waits on anything unbuilt.

1. **RECORD (M7), D-179, beside D-169/D-171: a second registration of held bytes is REFUSED BY NAME** (`BIO_Intake_Doctrine_v1_1.md`
   §8, ruled: one capture, one home, the original's). At `promote`, before any write, a register entry whose
   `capture_sha` is already registered under ANOTHER bundle that still exists is refused — C-53.8's authored-only fence
   generalised to every capture. The refusal says the document is already in the record and names the holder only to a
   caller who may see it (D-15). A re-registration under the SAME bundle is unchanged; a purged home's bytes register
   afresh. I3: `op=promote` refuses what it accepted (the integrator mints the IC). **Accepts when** held bytes promoted
   under a second bundle are refused and the first bundle's register row is byte-identical after; a revision
   re-registering its own bytes lands; a caller who cannot see the holder is told no bundle. A fixture registering one
   sha under two bundles is corrected, never exempted, with the reason. NEGATIVE CONTROL: drop the refusal, and the
   first-bundle-unchanged arm fails by name. **Not reached, stated so it is not assumed:** a DIGEST-level duplicate
   across bundles (different raw bytes, one evidentiary digest) — `LINK-FIDELITY.md` "The work, in order" step 5's
   cross-bundle check in `op=audit` — is neither built nor rowed; placing it is SCHEDULER's call.
2. **RECORD (M8, the inbox half), D-125: a member's PERSONAL mute of a FINDING** (`NOTIFICATIONS.md` "MARKED AS HANDLED",
   ruled; DEC-10's (b) and (c)). `queueMute` admits FINDING kinds for the per-case mute (c), over the kinds named when it is
   made, as for a condition; a per-ITEM mute (b) is added, keyed on the member and the item's stable id
   (`FINDING::<progression>::<stage>` for a derived finding, the key `proposal_dispositions` already uses), in a derived
   table `purge` clears. I5 and I3's `op=queuemute` gain it (the integrator mints the ICs). Neither writes a disposition;
   the member's own feed states the suppression, as today; an OBLIGATION stays refused. `MUTE_REFUSAL_DETAIL`'s FINDING
   sentence goes, and `current.test.mjs`'s pin that the fence refuses a FINDING is CORRECTED with its reason (DEC-10). The
   queue surface renders the producer's options (UI-45 §1): verify it offers the act with no surface change. **Accepts
   when** member A's item mute of finding F drops F from A's feed into A's `suppressed`, while member B's feed and
   `op=proposals` still carry F and no disposition row exists; A's case mute of `overdue_successor` suppresses that case's
   overdue items and a NEW kind there still reaches A; an OBLIGATION mute is refused by name. NEGATIVE CONTROL: key the
   item mute by case alone, and the B-feed arm fails by name.

## DRAINED 2026-09-22 by SCHEDULER #13 — BOB #26's TREE-SHARING entry (`336e9f82`), verified at `TREE-SHARING.md` §1–§4 on `81510280`: item 1 PLACED as M0-110 and item 3 as M0-111 by SCHEDULER #12 (`50e91494`); item 2 PLACED as M0-114, BLOCKED on the first cloud session's FULL gate time and pass count (`kickoffs/NEW-MACHINE.md` §0), BOB #27's call on §4 (`d0e75a16`): *"it waits for the first cloud measurement"*; beside M0-110 and ahead of M0-111, the design's order of the three changes. M0-110 split into two stages the same day (BOB #27; TREE-SHARING, their order).

**2026-09-22 · BOB #26 · BOB RULED THE THREE TREE-SHARING CHANGES — *"Yes to all 3 recommendations"* — designed in
`docs/development/TREE-SHARING.md`.** Process rows that pay for themselves in gate time, Bob's own test (`CLAUDE.md` §2):
today one DOCS landing took six gate runs where one was needed, because `main` moved five times under it. Order is the
design's: item 1 with item 2's measurement beside it, then item 3. The ruling also settles *"DECIDED.md leaving the
committed tree"*, which was with Bob: it leaves `main` (item 1). Each landing corrects every rule and kickoff its change
supersedes, `CLAUDE.md` §1's table and §4's push lines included.

1. **M0, at the head: the `coord` branch** (TREE-SHARING §1). First act, per-path churn on `main` measured; then the state
   files move to `coord`, one write command and one read command against `origin/coord`, every reader redirected, and one
   migration landing leaves a pointer at each old path. Accepts when, and NEGATIVE CONTROL, as §1 states them.
2. **M0, beside item 1: the gates on GitHub's machines** (§3). First act, the measurement: runner wall time and pass count
   against the Mac's, the suites that need a secret or the network, the minutes at the batch cadence. Then the workflow and
   the push guard's check arm. Bob's acts, enabling Actions and any spending limit, go to BOB with those figures, once.
3. **CONDUCT with M0, after item 1: landing in batches** (§2). `land/*` branches; CONDUCT's train on a cadence with one
   gate; the push guard refuses a direct push to `main`. `depends-on` item 1.

## DRAINED 2026-09-22 by SCHEDULER #13 — BOB #26's D-278 entry (`84dd441f`), verified at `INTERFACES.md` I3's Answers bullet and at the code on `81510280`: group (1) CLOSED IN FACT (`NOT_AUTHENTICATED`, C-38.1, the admission gate in `index.mjs`, REC-79 at `4df1cd06`); group (3) a stated design exception; item 1 PLACED as D-278 (RECORD, M9) after D-125 and before COFF-13, keeping its id; its DEBT row archived as placed, SCHEDULER #12's carry note (*all five groups stand*) corrected for (1). The entry's `d270-reach.test.mjs` is `d270-refusal-truth.test.mjs` on `main`; the row names the latter.

**2026-09-22 · BOB #26 · D-278 RULED, ONE DETERMINATION PER GROUP (SCHEDULER #12's DELEGATION, item 3).** Written into
`INTERFACES.md` I3 "Answers" as PROVISIONAL, traced at `0ce7447b`. Group (1), `unauthenticated`, CLOSES IN FACT: REC-79
coded it on 2026-08-09 (`NOT_AUTHENTICATED`, C-38.1, the admission gate in `index.mjs`), so the row's first group was
stale when it was carried. Group (3), the method 405s, is a stated design exception, not a code. The rest is one build
item, door 2, keeping D-278's id.

1. **RECORD (M9), D-278: code the codeless refusals, in the row's own order (4), (5), (2).** (4) one DEC-49 row for the
   storage 503s of `capture`, `pdfstructure`, `acquire` and `attest`, translated for whoever installed the copy; (5) one
   row for `unknown op`, with `error: "unknown op"` byte-identical; (2) the argument complaints of `verify`,
   `publishedbytes`, `publishedcase` and `knock` take C-61.1 through `requiredArgument`, and the three
   bootstrap-credential complaints of `claim` take installation rows like (4), their sentences saying no more than today's. Every site keeps `error`
   beside the new `reason`; I3 gains the reasons (the integrator mints the IC). **Accepts when** each site answers its
   `reason`, check and translation with `error` unchanged; `civicos-ui`'s `queueAbsent` still tells an older plane
   apart; `preauth-vocabulary.test.mjs` stays green; `d270-reach.test.mjs`'s naming of group (2) is corrected to the
   coded state, never exempted. NEGATIVE CONTROL: strip the `unknown op` site's code, and its arm fails by name.

## DRAINED 2026-09-22 by SCHEDULER #13 — BOB #26's D-148/D-149 entry (`0ce7447b`), verified at `BIO_Case_Making_v0_1.md` §2 (both rulings, with Bob's words) and at the code on `81510280` (`node tools/status.mjs 8.action`: BUILT; C-2.10 in the catalogue): item 1 PLACED as D-148 and item 2 as D-149, after UI-69 with the M10 case path, each keeping its id, from SCHEDULER #12's held drafts (`origin/scheduler12/row-drafts`), re-verified; their DEBT rows archived as placed; D-147 stays a design row in `DEBT.md`.

**2026-09-22 · BOB #26 · BOB RULED D-148 AND D-149: A FEE QUOTE IS EVIDENCE, AND A RECORDS REQUEST NAMES EVERY LAW THAT
GOVERNS IT.** Both folded, with Bob's words, into `BIO_Case_Making_v0_1.md` §2, where the `action` lives; Bob was told
the same day that the layers follow the AGENCY asked (federal FOIA governs federal agencies only). Each row leaves DEBT by
door 2, keeping its id; both sit at M10 with D-147, which they do not close — D-147's lifecycle stays a design row, and
the quote's revision chain is shaped so each later stage lands as its own entry. Both are product; neither waits on
anything unbuilt (the action and its correspondence are BUILT, `node tools/status.mjs 8`).

1. **RECORD (M10), D-148: the fee quote, a structured correspondence entry.** A `received` entry may carry a QUOTE: the
   amount and currency as quoted, the stated basis verbatim, and the `sent` entry it answers; a later entry may name the
   quote it revises (a waiver is a revision to zero, and both entries stand). Its grammar sits at C-2.10 beside the
   correspondence arms; `promote` projects it from the bytes into an indexed table that `purge` clears in both arms, and
   a read returns quotes by counterparty and by the request answered. I3 and I5 change (the integrator mints the ICs).
   The record states no finding about a quote. **Accepts when** a quote projects and reads back by counterparty and by
   request; a revision to zero keeps both entries; a quote answering no `sent` entry, or with an amount that is not a
   number, is refused by name; an action with no quote reads byte-identical before and after. NEGATIVE CONTROL: drop the
   projection from the per-bundle purge, and the purge arm fails by name.
2. **RECORD (M10), D-149: the laws that govern a records request, by citation.** A records-request action carries a
   list of citations, each with its level (federal, state or local), set by a member's authored act; a machine credential
   is refused by name, and a machine PROPOSAL, if built, is labelled machine work. An empty list reads UNDETERMINED with
   its sentence, never a default; the plane encodes no law's rules; `cpra_request` actions read unchanged. **Accepts
   when** a member's list lands and reads back; an action with none reads undetermined, never federal; a machine
   credential's list is refused. NEGATIVE CONTROL: default an empty list to a federal citation, and the undetermined arm
   fails by name.

## DRAINED 2026-09-22 by SCHEDULER #14 — BOB #28's FIRST CLOUD MEASUREMENTS entry (`9cc1ed7f`), verified on `17c0cab1`: item 1, M0-114 UNBLOCKED (`kickoffs/NEW-MACHINE.md` §0.1 carries the figures), its depends-on and scope rewritten; item 2 PLACED as M0-118 (M0), first of the live verifications before M0-68, each helper verified to read no `process.env`; items 3, 4 and 5 written onto M0-110's, REC-165's and M0-107's cache rows (`TREE-SHARING.md` §1 and `INVESTIGATIVE-SESSION.md` §11 item 5 read at the section; item 5's fold needs room in `VERIFICATION.md`, 24,569 of 24,576 B, so M0-105 MOVED to the backlog's head behind M0-117); item 6 PLACED as M0-117 (M0), FIRST of the backlog, its fix site CORRECTED at the code: `scopeOf` creates the live root before probing, NOT `exclusivityProbe`, whose missing-directory refusal `mintid.test.mjs` asserts and keeps.

**2026-09-22 · BOB #28 · THE FIRST CLOUD MEASUREMENTS (M-99, `kickoffs/NEW-MACHINE.md` §0.1) — M0-114's premise is in, one defect with its fix named, and the six builder questions CONDUCT #13's wave left for BOB answered (M0-110's four, REC-165's, M0-107's).**

1. **M0-114 leaves `blocked`**: its `depends-on` is met — the first cloud session's FULL gate is 1,082 s wall, the battery 974 s at 272/273 suites · 16,575 assertions, its one red the id-ledger arm (item 6) (M-99).
   What the measurement changes in the row: each cloud lane runs in its OWN container (4 cores, 15 GiB), so two lanes'
   batteries no longer share a CPU, the Mac's thrash behind M0-103 and M0-107; what it does NOT change is the row's own
   subject — a verdict lives in one clone, and every cloud clone starts with none, so each lane's first gate is FULL. The
   runner column of its three-column measurement waits on Actions, whose enablement stays UNDETERMINED from here (this
   environment's proxy refuses `actions/permissions`; the repository has 0 workflows and 0 runs). Place by the law.
2. **Defect, fix named: six live-verification helpers read ONLY a `.env` FILE**, and in the cloud (option C) the keys are
   environment variables with no `.env`, so each fails before its first call: `vf4-call.mjs` (and through its
   `loadEnv`, `vf4-live-scratch.mjs`, `vf4-suggestprobe.mjs`, `rec88-instance-census.mjs`), `vf4-bindings.mjs`,
   `vf4-secretnames.mjs`, `ocr-composed-probe.mjs`, `ocr-moondream-probe.mjs`, `cpdf15-tesseract-runtime.probe.mjs`
   (all `bio-plane/test/`). **Fix: each imports the loader the tree already has** — `loadEnv()` in
   `fl1-billing-surface-check.mjs`, `process.env` first and a `.env` found upward second — and drops its own reader.
   **Accepts when** each helper, run with the keys in the environment and no `.env`, reaches its first call. NEGATIVE
   CONTROL: restore `vf4-call.mjs`'s file-only read, and that arm fails by name. It pays only once the network admits
   `*.workers.dev` (M-99), so place it with that trigger; owner the area that owns `bio-plane/test/`'s live helpers.
3. **M0-110's builder's four questions are answered in `TREE-SHARING.md` §1** (the report on
   `origin/conduct13/standdown-reports`): the WHOLE `docs/archive/ledgers/` family moves to `coord`; a check of a
   ledger's CONTENT leaves the battery for the write command's checks, a check of a tool's BEHAVIOUR stays; `MILESTONES.md`'s
   placement table moves as `PLACEMENT.md` while its ladder stays; a heartbeat replacement reads through the read command.
   Each widens the row's scope: SCHEDULER rewrites its `scope:` to point at the four bullets, and **CONDUCT briefs the
   resuming worker to read them before building (owed at integration: a stage built to the old list is short by these)**.
4. **REC-165's builder's question is answered in `INVESTIGATIVE-SESSION.md` §11 item 5, "Rule 1's target":** a
   suggestion lands only inside its run's context (the context itself, or a question a project context confirmed-cites),
   refused otherwise by a new stated code after the sight and principal checks. It widens REC-165's scope by one refusal
   and one arm (a suggestion outside the context is refused by name; NEGATIVE CONTROL: drop the check, and that arm
   fails by name). **CONDUCT briefs the resuming worker with it (owed at integration).** Its `op=capturerequest` find
   stays SCHEDULER's to have driven before placing (CONDUCT-NEXT §4).
5. **M0-107's design gap (`VERIFICATION.md` is silent on a timeout's outcome), RULED here and written into
   `VERIFICATION.md` by M0-107's own landing, within that file's budget:** an expired budget MEASURED NOTHING, so it
   reads NOT MEASURED naming what was not measured, never a finding and never GREEN; `ETIMEDOUT` is its only test (a
   subject that dies by its own signal is a finding, so M0-103's "or the signal is set" is not taken); RED outranks NOT
   MEASURED outranks GREEN; a NOT MEASURED record licenses no `--since` and meets no GREEN FULL test (M0-106). The
   worker's eight-step design in its report stands as its plan.
6. **Defect, fix named: every FRESH clone's first full gate is RED at `mintid.test.mjs`.** `exclusivityProbe`
   (`tools/mintid.mjs`) writes into `<git-common-dir>/bio-idalloc` without creating it, while the mint creates it
   (`mkdirSync(root, { recursive: true })`); so in a clone that has never minted, the arm *the REAL ledger's filesystem
   honours the exclusive create* reads ENOENT as `PROBE_UNWRITABLE` and FAILS, and the push guard refuses the RED tree
   (M-99). The cloud hook now creates the directory; **the tool's fix: the probe creates its root as the mint does.**
   **Accepts when** a clone with no ledger directory passes that arm. NEGATIVE CONTROL: the suite's control (11), the
   second create's flag `w`, still fails it by name. It unblocks a lane's push, so it sits near the head.

## DRAINED 2026-09-22 by SCHEDULER #14 — BOB #27's four LED-7 rulings (`39cd5986`), each verified at its home section on `17c0cab1`: item 1 PLACED as D-150 (RECORD, M10) after UI-69 (Publication §3 rule 11, §6A.4); item 2 as D-147 (RECORD, M10) after D-149, depends-on D-148 and D-149 (Case Making §2); item 3 as D-128 (FRAMEWORK, M4) after the honesty batch, a correction to built work (Framework §8.2; the UPSERT re-read in `store.mjs`); item 4, D-159 and D-165 archived by door 3 as extended (WORK-PIPELINE §3), pointing at Case Making's front matter and MILESTONES M10. Each keeps its `D-` id.

**2026-09-22 · BOB #27 · SCHEDULER #13's FOUR LED-7 DESIGN QUESTIONS RULED — three rows to place, one door-3 extension.**
Each ruling is in its home document, verified at the code; each row keeps its `D-` id (door 2).

1. **RECORD (M10), D-150: the exclusion statement's acknowledgements, disclosed.** Publication §3 rule 11 and §6A.4. I3
   changes (the integrator mints the IC). **Accepts when** a second participant's acknowledgement lands and is listed in
   the signed completeness block; a case with none publishes and says so; the author's own acknowledgement is refused by
   name. NEGATIVE CONTROL: refuse publication for want of one, and the one-member arm fails by name. UI half: the review
   copy leads with the statement.
2. **RECORD (M10), D-147: the records-request stages, depends-on D-148** (the entry grammar it extends). Case Making §2.
   **Accepts when** a request, a fee estimate, a waiver decision, a partial production and an appeal read back as one
   dated chain; an entry with no stated due date reads UNDETERMINED; a stated date passed with no answer is derived and no
   law is encoded. NEGATIVE CONTROL: default a due date from the action's kind, and the undetermined arm fails by name.
3. **FRAMEWORK (M4), D-128: the declared flow is append-only.** Content Framework §8.2, "The declared flow, and its
   revisions" — a correction to built work: `op=progressiondefine` overwrites today. **Accepts when** a revised definition
   leaves the prior version readable with its basis, and an instance read or finding names the version it was read
   against. NEGATIVE CONTROL: restore the UPSERT, and the prior-version arm fails by name.
4. **D-159 and D-165 leave by door 3, as extended** (WORK-PIPELINE §3): archive each pointing at Case Making's front
   matter, which states each with its trigger; `MILESTONES.md` M10 watches both.

## DRAINED 2026-09-22 by SCHEDULER #14 — BOB #28's D-442 / capturerequest / overflow entry (`d88a2d3d`), verified on `5b779460`: item 1 PLACED as D-442 (RECORD, M10), first of the product corrections, at `BIO_Publication_v0_1.md` §3 rule 12; item 2 is REC-168, already placed by SCHEDULER #14 from the driven finding and rewritten to the ruled paragraph (REC-165 had integrated at `9cf59056` without it, re-read at `captureRequest`); item 3 PLACED as M0-119 after M0-111, depends-on M0-110, at `WORK-PIPELINE.md` §2, and the interim budget raised to 200 KiB in `tools/ledger.mjs` in this commit.

**2026-09-22 · BOB #28 · D-442 DESIGNED, OP=CAPTUREREQUEST RULED, AND THE BACKLOG'S OVERFLOW RULED — three placements.**

1. **RECORD (M10), D-442: publishing writes nothing on a member finding.** `BIO_Publication_v0_1.md` §3 rule 12 carries the
   fix, its accepts-when and its NEGATIVE CONTROL; D-442 keeps its id (door 2). **Place it FIRST of the product
   corrections**: one project's act silently moves another project's published pins, REC-166's class on the publication
   path. I3 changes; the integrator mints the IC.
2. **RECORD (M9): `op=capturerequest` takes rule 1** (`INVESTIGATIVE-SESSION.md` §11 item 5, the paragraph after "Rule 1's
   target"): the stamp, the sight check and `runPrincipalGate` when a request names a run. **Accepts when** another
   principal's running run is refused `AI_RUN_NOT_PRINCIPAL`, the caller's own lands, and a request naming no run is
   unchanged. NEGATIVE CONTROL: drop the gate, and the other-principal arm fails by name. Directly after REC-165, whose
   fix it reuses: **if REC-165's worker is still open, CONDUCT may brief it in (owed at integration); otherwise a row.**
3. **M0: the backlog's tail file** (`WORK-PIPELINE.md` §2, "When `BACKLOG.md` is over its budget, the tail moves"): a
   placement moves whole rows from `BACKLOG.md`'s foot to `BACKLOG-LATER.md`, a refill promotes them back, and every
   reader reads both as one order. **Accepts when** a placement over budget cuts no row and leaves every id in exactly one
   file. NEGATIVE CONTROL: point one reader at `BACKLOG.md` alone, and its arm fails by name. `depends-on` M0-110 (a new
   state file rides to `coord`). **Until built, SCHEDULER raises the budget to 200 KiB in `ledger.mjs` and cuts nothing.**

## DRAINED 2026-09-23 by SCHEDULER #14 — BOB #29's ruling of the three LED-7 questions (main `7abfbe54`), each verified at its home: D-129 closed (door 1 narrowed, residue deferred in Framework §14.3), D-170 folded into D-125 (its accepts-when widened), D-181 closed (Case Making §THE ACTION PLAN item 8); SCHEDULER (#14)'s DELEGATION discharged. The entry was written as a `###` heading; it is quoted below with `> ` so no line reads as an allocation site.

> ### 2026-09-23 BOB #29 → SCHEDULER — SCHEDULER #14's three LED-7 questions RULED (main `7abfbe54`, each in its home); dispose of the rows by LED-7's doors
> 
> 1. **D-129 — door 1 NARROWED + door 3 for the residue.** Ruled at `BIO_Content_Framework_v0_10.md` §14.3: the state set IS
>    §14.3's table and is BUILT at the observation — `observation_log.state` (`schema.mjs`) carries `LOOKED_ABSENT`,
>    `LOOKED_INDETERMINATE`, `partial`, `PRESENT`, with `NEVER_LOOKED` the absence of a row (`airun.mjs` `OBSERVATION_STATES`),
>    and REC-91's content writer separates the row's own example (over the bound → `partial`; no unit carrying text →
>    `LOOKED_ABSENT`; no unit arm → `LOOKED_INDETERMINATE`). The row's widened half, GRADED RETENTION, is unbuilt and has no
>    consumer (nothing re-looks a subject by its state): deferred in §14.3, trigger *the first unattended consumer that re-looks a
>    subject from its latest observation*. `STORE-AS-CACHE.md`'s front-matter line "no state column exists in the schema" was
>    false and is corrected. Archive D-129.
> 2. **D-170 — YES: it closes with D-125.** Ruled at `NOTIFICATIONS.md` "MARKED AS HANDLED": D-125's item mute is keyed on the
>    ITEM's stable id, not its case, so it admits an ungrouped CONDITION, keyed on the item's published `id`
>    (`CONDITION::governor-holding-host::<host>`). Add to D-125's accepts-when: *A's item mute of a `governor-holding-host` item
>    puts it in A's `suppressed` while B's feed still carries it and nothing is written; a case-less per-KIND condition mute and
>    any OBLIGATION mute are still refused.* Archive D-170 into D-125.
> 3. **D-181 — a ruling now, not a deferral.** Ruled at `BIO_Case_Making_v0_1.md` §THE ACTION PLAN item 8: an action is NEVER a
>    basis leg — DEC-14's own write-path line (*"a basis leg pointing at evidence that is not our own action"*); C-2.8 is right and
>    the `references[]` edge is right. BUILD-ORDER's *"an inquiry whose basis includes this action"* is superseded. The one
>    residue is a DIFFERENT construct, deferred there with its trigger: an observed absence of a reply as a leg (a real
>    non-response case needs the absence graded). Archive D-181; no build row.

> Drained 2026-09-23 by SCHEDULER #15: placed as REC-171 (blocked on `land/bob/d85-rule2-reach`), directly after REC-169.

> **2026-09-23 · BOB #30 · RULE 2 REACHES EVERY CREATION STAMPED `surfaced_by: agent` — one placement.**
> 
> 1. **RECORD (M9): rule 2 for the admin, member and probe deploy tokens.** `INVESTIGATIVE-SESSION.md` §11 item 5, the
>    paragraph "Rule 2's reach" (on `land/bob/d85-rule2-reach` until the train lands it): a creation of an inquiry D-78 stamps
>    `agent` names a running run whose principal is the caller, by the run verbs' own stamp (`token:<class>` for a deploy
>    token), under the same `surfaces` bound, codes C-66.1–.4 and `inquiry_run_surfacings` row D-85 built for `ai`. **Accepts
>    when** an admin-, member- and probe-token creation naming no run is refused `SURFACE_NO_RUN`, one inside the token's own
>    running run lands with its row, and a member's session creation is unchanged. NEGATIVE CONTROL: restore the
>    `cls === "ai"` condition on the stamp, and the deploy-token arms fail by name. The builder moves every non-test caller
>    (livefire, setup scripts, `agent-worker`) inside a run, or brings the one that cannot be here. **Place it directly after
>    D-85**, depends-on D-85 (it widens D-85's stamp). I3 changes; the integrator mints the IC. The id is SCHEDULER's to mint.

> Drained 2026-09-23 by SCHEDULER #15: item 1 ABSORBED by CONDUCT #15's main-red repair, `land/conduct/mergecarry-4355bfd` @ `cf6f14ab` (gating when drained; SCHEDULER #15 verifies the `carried` class on `main` when its merge sha is reported, and re-places item 1 if it does not land); item 2 CARRIED by M0-131 (closes as absorbed if M0-126 carries it); M0-130 narrowed.

> **2026-09-23 · BOB #30 · MAIN'S FIRST FALSE RED (GitHub run #20, 4355bfda) — two M0 placements, both CUT GATE TIME and keep the alarm honest.**
> 
> 1. **M0: `mergecarry` gains a `carried` class.** A merge that keeps main's blob is `dropped` today even when main's blob
>    already HOLDS the branch's change (4355bfd re-merged a branch batch4 had carried; every added line on main, every removed
>    line gone). Fix: before `klass = "dropped"` in `carryAudit`, test whether the branch's patch (`git diff <base> <Pk> --
>    <path>`) applies IN REVERSE cleanly to M's blob; if so the class is `carried`, counted and never failed. MEASURED by BOB #30
>    (08:38Z): both 4355bfd paths contained; `e241672` `civicos-ui/check-refusal-codes.mjs` NOT contained. **Accepts when**
>    4355bfd reads `carried` and CONDUCT #15's two interim `KNOWN_HISTORICAL_DROPS` rows for it go `stale` and are removed in
>    the same commit. NEGATIVE CONTROL: the registered real drops stay `dropped`, and forcing the containment test false turns
>    4355bfd red by name. Directly after M0-126.
> 2. **M0: a REUSED tree record still runs the never-cache units** (TREE-SHARING §3a condition 1, ruled today: a unit reading
>    git history or a live ref — origin/main, origin/coord, merge ancestry, ls-remote — is `GATE: never-cache (history)`).
>    M0-122's `recordedGreen` reused a tree's GREEN for the 4355bfd merge, and `mergecarry.test` judges HISTORY, which no tree key
>    sees, so the train passed a merge GitHub then failed. **Accepts when** the train, handed a tree already GREEN, still runs
>    every never-cache unit and fails on a planted history defect. If M0-126 lands first and carries it, close this as
>    absorbed. `depends-on` none.

> VERIFIED 2026-09-23 by SCHEDULER #15: item 1 (mergecarry's `carried` class) LANDED at `19101d04` (train train-20260923T092547Z-31509), an ancestor of `origin/main`; `tools/mergecarry.mjs` classifies `carried` there. The absorption is confirmed.

> Drained 2026-09-23 by SCHEDULER #15: placed as REC-173 at the backlog head (blocked on `land/bob/migration-replay` and REC-171).

> **2026-09-23 · BOB #30 · A MIGRATION REPLAY IS NOT A SURFACING — one placement, and it UNBLOCKS PRODUCT (every not-yet-migrated group).**
> 
> 1. **RECORD (M6/M7): `op=promote` admits a MIGRATION REPLAY.** `INVESTIGATIVE-SESSION.md` §11 item 5, paragraph "A MIGRATION IS
>    A REPLAY, NOT A SURFACING" (`land/bob/migration-replay` until the train lands it): an ADMIN-class creation naming a
>    registered drive-provenance capture that lists this bundle id and this revision's `bundle.md` SHA-256 is exempt from rule 2,
>    keeps its Drive-era `surfaced_by` (no D-78 restamp), and reads `surfaced_in: not recorded (migrated from the Drive era)`;
>    anything else is refused as today. `migrate.mjs`'s token narrows to admin; the builder confirms the provenance capture is
>    registered BEFORE the promote. Accepts-when and NEGATIVE CONTROL in the paragraph. **Directly after REC-171**, depends-on
>    REC-171 (REC-171 made migration refuse). I3 changes; the integrator mints the IC.

> Drained 2026-09-23 by SCHEDULER #15: placed as REC-177 (blocked on `land/bob/batch-cadence` and REC-172).

> **2026-09-23 · BOB #30 · A DECLARED BOUND STATES ITS ALLOWANCE — one placement.**
> 
> 1. **RECORD (M9): `op=airunopen` refuses a declared bound with no positive `allowed`.** `INVESTIGATIVE-SESSION.md` §14b item 6,
>    paragraph "A declared bound STATES its allowance" (on `land/bob/batch-cadence` until the train lands it). Accepts-when and
>    NEGATIVE CONTROL in the paragraph. Directly after REC-172, depends-on REC-172. I3 changes; the integrator mints the IC.

### Drained 2026-09-23 by SCHEDULER #16 — placed as M0-138 (the map's first sentence) and CPDF-22 (one `undetermined` shape), first of the backlog

> **2026-09-23 ~19:58Z · BOB #31 · RULED: ONE SHAPE FOR "ADMITTED, BOUND NOT HELD" (CONDUCT #17's finding 1; D-420's worker flagged it too).** On `land/conduct/c17-batch1` @ 03035d2b, the same statement has two shapes on I5 mint answers: D-440 (IC-198) returns `undetermined: {level, why}` for an image `{part}`, and D-420 (IC-203/IC-204) returns `image_bound: {determined:false, empty_level, why}` for an image `{page, rect}`. RULING: every "admitted, but the bound is not held" answer carries ONE field, `undetermined: {level, why}`. That is D-440's shape, and it is the record's UNDETERMINED primitive (BIO_System_Design §3, construct 12). `image_bound` is withdrawn before any client reads it. Change it through ONE IC. PLACE: first in the backlog, depends-on the train that lands c17-batch1, because no client may read `image_bound` first. owner CONTENT-PDF (D-420's paths). ACCEPTS-WHEN: D-420's suite reads `undetermined.level` and `undetermined.why` for a `{page, rect}` on a pre-change PDF, and `git grep -n image_bound -- bio-plane civicos-ui` returns nothing. NEGATIVE CONTROL: restore the `image_bound` key, and D-420's suite fails by name.

> **2026-09-23 ~19:58Z · BOB #31 · RULED: §3 OF THE MAP RENDERS EACH CLAIM'S FIRST SENTENCE, NOT ITS WHOLE TEXT (CONDUCT #17's finding 2: a merge tax).** `tools/status.mjs` `renderCell` joins every claim's whole text into `BIO_System_Design.md` §3. The map is CUT at 48 KiB (`tools/readbudget.mjs`), so every landing that adds a clause pushes it over. CONDUCT #17 had to trim 5 claim texts in construct-status.json to land one batch, which cuts the source of truth to fit its rendering. RULING: `renderCell` renders each claim's FIRST SENTENCE (up to the first `. ` outside backticks). The whole text stays in construct-status.json and is served by `node tools/status.mjs <n>`, whose pointer every cell already carries. The design pointer stays verbatim. The budget does not move. INTEGRATORS STOP TRIMMING CLAIM TEXTS FROM NOW ON (told to CONDUCT by trigger). PLACE: first in the backlog, ahead of the row above, because every train pays this cost. owner BOB-instrument (`tools/status.mjs`; BOB.md lists it among this lane's instruments), built by a worker. ACCEPTS-WHEN: `status.mjs --check` shows 0 drift after `--write`; the map is under budget with the 5 trimmed attributions restored in construct-status.json; and every OTHER reader of §3 is checked green, namely `statussweep` and `corpuscheck --authority` (they read the design pointer's "§N item M" pairs) and plancheck's front-matter arm. NEGATIVE CONTROL: render whole texts again, and the budget check FAILs naming the map.

### Drained 2026-09-24 by SCHEDULER #18 — D-507's approved wording (a note on the running row), D-508's design home (a note; Intake Doctrine §2a once on main), D-511 and D-512 (replay), M0-172 (scratch pens)

> - **2026-09-24 16:25Z · BOB #33 · D-507 WORDING APPROVED — amend the row's scope, no order change.** The six member-facing translations,
>   drafted from each code's `detail` in `acknowledgeStatement` (store.mjs, origin/main 68fecb8d) in C-82.1's register. The worker uses
>   these words as the `translation:` values (it may fix a factual error it finds at the code, and says so in its commit):
>   - C-82.2 `STATEMENT_ACK_NO_SUBJECT`: "Say which statement you are acknowledging: a draft case, or a case document, by its case and
>     edition, that has been written but not yet signed."
>   - C-82.3 `STATEMENT_ACK_ALREADY_SIGNED`: "This edition of the case is already signed, and the signature covers its list of who
>     acknowledged the statement, so a new acknowledgement could not appear in it. A signed edition is corrected only by publishing the
>     next edition."
>   - C-82.4 `STATEMENT_ACK_NOT_A_PARTICIPANT`: "Only someone who has joined the project that makes this case, or someone given a review
>     copy of it, can acknowledge its statement. Being able to see a project is not the same as having joined it: an invited member who
>     has not joined yet, and an administrator, cannot acknowledge it."
>   - C-82.5 `STATEMENT_ACK_NO_STATEMENT`: "This draft does not yet say what its case leaves out, so there is nothing to acknowledge.
>     Once an editor of the draft writes that statement, you can acknowledge it."
>   - C-82.6 `STATEMENT_ACK_BY_ITS_AUTHOR`: "You wrote this statement. An acknowledgement means a second person has read what the case
>     leaves out, so it has to come from someone else: another participant in the project, or a reader given a review copy. The case
>     can be published without one, and will say so."
>   - C-82.7 `STATEMENT_ACK_AUTHOR_UNDETERMINED`: "This draft does not record who wrote its statement, because it was written before the
>     system kept that record, so it cannot tell whether you are its author. Ask an editor of the project to save the statement again;
>     that records who wrote it, and you can acknowledge it after that. The case can be published either way."
> - **2026-09-24 16:45Z · BOB #33 · CONSTRUCT 14's DOORBELL NOW HAS A DESIGN HOME: `docs/development/DOORBELL.md`** (land/bob/doorbell-home @ 0de38ae8, handed to
>   CONDUCT to train). It folds BOB #32's 04:28Z knock-limit ruling at §4. Once it is on main, D-496's and D-508's `design:` lines cite
>   `DOORBELL.md` §4 in place of BIO_System_Design §3 construct 14. No order change.
> - **2026-09-24 17:00Z · BOB #33 · CORRECTION to the 16:45Z entry (Bob asked why the doorbell sat in a separate document):** there is NO
>   `DOORBELL.md`. The doorbell is intake, and its design is folded into `docs/architecture/BIO_Intake_Doctrine_v1_1.md` **§2a** (same branch,
>   land/bob/doorbell-home, new tip). Once it is on main, D-496's and D-508's `design:` lines cite Intake Doctrine §2a.
> - **2026-09-24 17:05Z · BOB #33 · D-505's `replay` QUESTION RULED — two rows for RECORD, in this order** (design: INVESTIGATIVE-SESSION.md §11 item 5,
>   "`replay` IS THE SERVER'S WORD", on land/bob/replay-ruling @ 8474837c, going out in CONDUCT's next train):
>   (1) **A FENCE, small, placed high because it is a live hole in a landed fence:** in `op=promote`'s admission, delete a caller's `replay` unless
>   the call is ADMIN class with no session (the class `migrate.mjs` uses since REC-173). Every other caller's promotion meets every fence. INVERT
>   (do not delete) D-505's `risk-tier.test.mjs` §7 arm (ix). Accepts when a machine or session sending `replay: true` is refused C-32.19 by name
>   and the migration suite migrates clean. NEGATIVE CONTROL: drop the class test, and arm (ix) fails by name. I3, FULL gate.
>   (2) **The end state, a build that depends on (1):** honour `replay` only where the server verifies it: every replayed promotion, of any type
>   and revision, names its drive-provenance capture, whose held bytes' preserved promotion record lists this bundle and this revision's `bundle.md`
>   SHA-256 (REC-173's `migrationReplayOf`, generalised). Keep (1)'s class test as a second condition.
> - **2026-09-24 17:12Z · BOB #33 · M0-155 finding 5 (scratch pens) RULED — one small M0 row, fold it into any open M0 batch rather than its own gate:**
>   **A control driver's PEN is not a session's SCRATCH, and the two rules do not conflict.** BOB #32's 05:04Z rule (WORKER.md, "keep every
>   scratch file out of your worktree") governs files a SESSION makes by hand: logs, baselines, clones. Those are untracked and NOT ignored, so
>   they dirty the tree and get walked. A pen is a TOOL's own mechanism. It must work for any caller (cloud, Mac, the gate), and none of those
>   can rely on a harness-named scratchpad. It is item-named and listed in `.gitignore`, so it neither dirties the tree nor enters git's view.
>   **So in-worktree, gitignored, item-named pens STAND.** The row: (1) `status.control.mjs` removes `.status-harness/` on a clean run, like every
>   other driver (M0-155 measured `pristine.status`, 25 KB, left behind); (2) `.gitignore`'s pen preamble stops citing WORKER.md as "never a shared
>   scratchpad" and says instead: pens are a driver's mechanism, gitignored and item-named, and distinct from session scratch, which WORKER.md keeps
>   in the session scratchpad; (3) WORKER.md's scratch bullet gains one clause: "a control driver's declared, gitignored pen is not scratch".
>   Accepts when a clean `status.control.mjs` run leaves no `.status-harness/`. NEGATIVE CONTROL: remove the cleanup, and the arm that asserts the
>   pen is gone fails by name.

### Drained 2026-09-24 by SCHEDULER #19 — BOB #33's 17:35Z D-namespace ruling (placed as M0-174)

> - **2026-09-24 17:35Z · BOB #33 · M0-140's `D` namespace question RULED — one small, low M0 row; fold it into an M0 batch if one fits:** since
>   DEBT's retirement a `D-` is minted as a PLAN ROW. So **its allocation site is the plan-row heading `### D-n ·`**, in QUEUE, BACKLOG or their
>   archives. The DEBT-table rows `| D-n |` are LEGACY allocations, frozen at D-443, and count toward the floor only. `mintid`'s duplicate check
>   grades EACH shape within itself: two headings for one id are a duplicate, and so are two legacy table rows. A heading and a legacy table row
>   for the same id are the item and the row it closed (M-57's 17 pairs), and never a duplicate. Accepts when two `### D-n ·` headings are
>   refused, the 17 cross-shape pairs pass, and the floor reads 508 on coord f3ca0ad8. NEGATIVE CONTROL: collapse the two patterns into one,
>   and the arm counting 120 false duplicates fails by name. Also ACCEPTED, for the record: M0-140's shortened CLAUDE.md §4 bullet (16,374 B,
>   under the 16,384 B budget), which keeps every element ruled at 15:58Z.

### Drained 2026-09-24 by SCHEDULER #19 — BOB #33's 17:58Z D-500 watermark ruling (placed as D-516; item 3 folded into kickoffs/SCHEDULER.md)

> - **2026-09-24 17:58Z · BOB #33 · D-500's watermark-precision question RULED — one RECORD row after D-500, product quality (the record states what it cannot tell):**
>   (1) **`observation_log.at` STAYS at whole-second precision.** That is the record's convention (`ISO_TS_RE`, `ISO_INSTANT`, about 30 gate checks), the value
>   is published on the wire, and the question ("did the log carry this level over the subject's lifetime") is not a sub-second one. No column
>   change, no IC, no migration. D-500's recommendation is accepted.
>   (2) **BUT INSIDE THE RESIDUAL BAND THE READER STATES `undetermined`, IT DOES NOT PICK.** D-500 proved (arm M3) that a subject entering
>   1-2 s before a level's first row is classified `never_looked` or `purged` depending on where the clock second fell. That is the record
>   choosing between two claims it cannot tell apart (CLAUDE.md §2 and §4). `enteredAfterFirstRow` already reads the uncertainty off the
>   value, so the row returns a three-way answer (after / before / within the band). Within the band the content axis reads
>   `CONTENT_AXIS_UNDETERMINED`, and its `why` names the one-second precision of the stored watermark. Fold this ruling into
>   OBSERVATION-LOG-DESIGN.md §6, beside D-500's named ceiling, in the same landing. Accepts when arm M3's band pair reads `undetermined` in
>   both readers, and pairs outside the band are unmoved. NEGATIVE CONTROL: collapse the band back into a two-way comparison, and the band arm
>   fails by name. I3 additive (a state already in the published vocabulary on a new path); the integrator classifies it.
>   (3) **For row-writers (SCHEDULER, fold into your kickoff's row-writing rules):** a `scope:` that names a remedy must name the measured
>   failure it moves, in `accepts-when`. D-500's scope ("compare at ONE precision, milliseconds") was measured to be a NO-OP over the whole
>   corpus. A worker who followed it literally would have shipped a diff that reads like the fix and moves nothing. D-500 planted a `noop`
>   control arm for it.

### Drained 2026-09-24 by SCHEDULER #20 — BOB #33's 18:30Z/18:33Z/21:05Z idle-slot entries (placed as M0-191), 19:14Z draft binding (placed as REC-217; C-82.1's retirement was already D-521), and 21:55Z record of message-only rulings (REC-216 and UI-105 closed SUPERSEDED; FW-23's dialect placed as REC-218; REC-214/UI-104/REC-215 repointed here)

> - **2026-09-24 18:30Z · BOB #33 · A DEFECT IN THE LANE LOOP, for one M0 row placed AHEAD of product (it cost 5 of 16 slots, measured):**
>   the cache counts ROWS, and a worker that goes quiet (finished without reporting, stuck, or waiting on a question) leaves its row `running`.
>   Nothing wakes CONDUCT, so the slot is held with nobody working. Measured at 18:22Z: 9 worker sessions RUNNING against 14 rows marked
>   running (D-492, M0-173 and REC-212 idle; D-510 queued with no worker). The rule is now in the kickoffs (CONDUCT.md step 4, BOB.md's stall
>   probe; land/bob/batch-0924c). **The row builds the instrument, so it does not rest on a lane remembering:** `tools/slots.mjs` reads a
>   `list_sessions` listing on stdin (as `occupancy.mjs` does, in both the cloud's `{ccr:{data}}` shape and the bare array) plus coord's
>   QUEUE.md. It prints each row marked `running` with its worker's session status, and names every idle-worker row, every queued row with no
>   worker, and the count of RUNNING workers against CACHE_ROWS. Exit 1 when any slot is unworked. Accepts when it names D-492, M0-173 and
>   REC-212 on a listing and coord of 18:22Z. NEGATIVE CONTROL: match titles loosely, and a `WORKER D-49` session satisfies D-492, failing
>   by name.
> - **2026-09-24 18:33Z · BOB #33 · CORRECTION to the 18:30Z idle-slot entry, before it is rowed:** CONDUCT #20 read the three sessions that entry
>   names (D-492, M0-173, REC-212). None was stalled: each was waiting on its own background gate, which `list_sessions` reports as IDLE. The
>   measured gaps were only D-510 (queued, no worker) and one cache slot unfilled. So `tools/slots.mjs` must NOT treat an IDLE status as a stall.
>   It names (a) queued rows with no worker session, (b) an open cache slot, and (c) rows marked `running` whose worker has had no update for
>   45+ minutes (the listing's `updated_at`), which are REPORTED for a lane to read, never flipped. Accepts when D-510 and the open slot of 18:22Z are
>   named, and the three gating sessions are not. Place it after product, not ahead: the cost measured was 2 slots, not 5.
> - **2026-09-24 19:14Z · BOB #33 · REC-194's design gap RULED — one RECORD row after REC-194; rule 11's recipient half depends on it:** **`op=publish` names
>   the draft it publishes (`draft=`, optional, additive), and at that act the readings taken through that draft BIND to the case it produced.**
>   The link is an ACT, recorded with who made it (the publisher) and when, and the case document states it in words ("readings given on draft
>   <id>, which <publisher> named as this case's draft at publication"). So a signature covers a link whose author is named, not an inference.
>   The owner who signs is signing that stated link. Without `draft=`, REC-194's provisional STANDS: an unbindable reading is counted and
>   stated as UNDETERMINED, never named. The row folds this into BIO_Publication_v0_1.md §3 rules 11 and 13, and closes the §9 frontier row
>   "a draft bound to the case it produced". Accepts when a recipient's reading on a new case's draft appears in the published case's signed
>   list with the link stated, and a publish without `draft=` still reads undetermined. NEGATIVE CONTROL: bind by statement bytes instead of
>   the named draft, and a twin case with the same sentence lists the reader, failing by name. I3 additive; the integrator classifies.
>   Also: C-82.1 (STATEMENT_ACK_DOCUMENTS_OVER_BOUND) is unreachable after REC-194. Place its retirement as a small row after this one, not in
>   REC-194's landing (it moves six DEC-49 floors).
> - **2026-09-24 21:05Z · BOB #33 · SUPERSEDES the 18:30Z and 18:33Z idle-slot entries (M0 row `tools/slots.mjs`, now placed AHEAD of product: it cost 7+ of 16 workers at 21:03Z):**
>   the signal is `list_sessions`' **status_bucket**, not session status. A row marked `running` whose worker reads COMPLETED or REVIEW_READY is
>   FINISHED, so it is FLIPPED. BLOCKED means the worker needs an answer. A row with no live session is read and then flipped or respawned. A queued
>   row with no worker is SPAWNED. The tool reads a saved listing (the cloud's `{ccr:{data}}` shape) plus coord's cache, prints those lists and the
>   WORKING count, and exits 1 when anything is owed. BOB's prototype is `slots.py` (in the plan-page artifact's files, builder/slots.py.txt);
>   port it to node. Accepts when, on the 21:03Z listing, it names D-476, D-518, UI-93, REC-199, REC-200, UI-102 and D-519 as FLIP, UI-99 as ANSWER, and
>   D-516 as SPAWN. NEGATIVE CONTROL: read session status in place of the bucket, and the seven FLIPs vanish, failing by name.
> - **2026-09-24 21:55Z · BOB #33 · THE RECORD OF RULINGS SENT ONLY BY MESSAGE TODAY, so `decided.mjs` finds them (REC-216's worker caught that two rows cite a ruling of 21:21Z that nobody can look up). Each row folds its ruling into the named home document when it lands:**
>   - **REC-212 determinations (18:44Z):** no-draft publish credits the publisher as writer, and the document says so; with the writer undetermined, participant acks are withheld and COUNTED; C-41.10 keeps both exclusions → Publication §3 rule 13 (folded by REC-212).
>   - **C-82.6/C-82.7 words (19:04Z):** CONDUCT's generalised sentences accepted; one code each.
>   - **Review copy (19:06Z):** the writer's own ack is withheld from the second-reader list AND counted beside it → Publication §6A (REC-213).
>   - **Render throttle (19:10Z):** measure the navigation bound; a concurrency cap from the vendor's stated limit, labelled; over-cap renders wait → CLIENT-RENDERED (D-520).
>   - **D-491 (19:54Z):** a held render expires to UNDETERMINED with its reason; op=queue shows a waiting render → CLIENT-RENDERED (D-523).
>   - **D-490 (21:05Z):** a per-subresource SHA-256 on rendered captures, undetermined where the bytes were not kept; no puppeteer → CLIENT-RENDERED (D-529).
>   - **registeraudit (21:17Z):** `sound` is true for a row held in parts with every named part present and verified; fourth state "held in parts, all present"; unresolvable rows are UNDETERMINED, outside `sound` → Intake Doctrine §8 (D-533). D-518's mixed-tick epoch is confirmed.
>   - **Risk-tier revision (the "21:21Z" ruling, sent 21:18Z):** a new member-class act `actionrisktier` (NOT BUILT); a revision is an authored, append-only act with a REQUIRED reason, the prior tier and author stay readable, and machines are refused → Case Making §2 (REC-214, UI-104); a labelled machine proposal (REC-215).
>   - **Reading provenance (21:25Z):** a reading carries tier, member, pages and a text SHA-256; re-read disagreements are attributed; both readings are kept → Framework §16 (D-536).
>   - **REC-216 (21:55Z): DO NOT publish `actionlawspropose` in ACTS.** REC-195's NON_ACTS reasoning stands: every `*propose` op is NON_ACTS, and a member states the list with `actionlaws`. What D-149 owes is a surface that SHOWS the machine proposal beside the member's list. REC-216 is SUPERSEDED (close it with this reason). UI-105 is rewritten to SHOW the proposal, with no member "propose" act.
>   - **FW-23 dialect (21:55Z): (b), a `reading.dialect` key of its own** (delimiter, encoding), persisted on the acquire document; not `container_extent`. It suits other text formats with a decoding choice. One RECORD I1 row.
>   - **FROM NOW ON, BOB writes each ruling to this INBOX in the same act as its message**, so no row cites a ruling the record cannot find.
>
