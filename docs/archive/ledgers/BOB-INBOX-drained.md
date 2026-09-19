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

