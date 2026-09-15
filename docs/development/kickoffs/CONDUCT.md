# Session CONDUCT — orchestration and integration

This session runs the work. Renamed from `ARCH` on 2026-07-31. Read
`ORCHESTRATION.md` for the model. The loop:

**The coordination skill is `ORCHESTRATION.md`, "COMMUNICATING A CHANGE" —
the channels, the rules that make them work, and the receipts. Read it before
making a change another session must know about.**

0. **Drain the `BOB INBOX` at the top of `QUEUE.md` FIRST.** It is append-only and BOB
   is its producer; you are the sole writer of everything below it. Enact each entry
   into the queue proper, then delete it. This is what lets an architectural change
   land WITHOUT pausing you (`ORCHESTRATION.md`). An entry may say that a queued or
   in-flight item is superseded — whether to stop a running worker or let it land is
   YOURS to decide; BOB's duty was only to make the supersession visible.
1. **Read `QUEUE.md`.** For each ACTIVE area (max two), if no worker is running
   for it and its top item is runnable (status `queued`, depends-on all `done`),
   spawn a worktree-isolated worker for that ONE item, with a self-contained
   kickoff that points at the area's kickoff doc and names the exact scope.
   **Workers spawn on Opus 5 (`claude-opus-5`), PINNED AT SPAWN** (Bob's
   operational directive, 2026-08-03): `--model claude-opus-5` on a CLI spawn,
   the model parameter on any other spawn surface — set per worker, never left
   to the machine's default. If a specific item proves beyond an Opus 5 worker,
   escalating that ONE worker's model is a tactical call under the never-block
   rule; the default is Opus 5. **EVERY brief must tell the worker to run
   `npm ci` in `bio-plane/` first, INCLUDING UI briefs.** A fresh worktree has
   no `bio-plane/node_modules`, and the UI harness drives plane suites - two UI
   workers on 2026-08-04 each hit `intent-write.test.mjs` failing on a missing
   `miniflare` BEFORE making any edit, and each spent time establishing it was
   not their change. It recurs per worktree, so it belongs in the brief rather
   than in anyone's memory.

   **AND EVERY BRIEF MUST SAY: TAKE IDS WITH `node tools/mintid.mjs <NS>`, NEVER BY
   READING THE FILE AND ADDING ONE.** M0-17, 2026-08-08. **Seven items collided on an
   id in ONE day** — a C-number family (PL-11 vs PL-14 on C-29), two IC numbers (IC-33,
   IC-35) and four D-numbers (D-235 x3, D-237 x2, D-238 x2) — and **in every case both
   workers measured the number free over the real file and BOTH WERE RIGHT WHEN THEY
   LOOKED.** Read-the-file-and-add-one is a check-then-act with no atomicity between the
   check and the act, so it is **a measured property of the concurrency budget, not a run
   of accidents: ONE collision at a budget of two, SEVEN at eight**, and worse at sixteen
   because what collides is PAIRS. **THE VIGILANCE FIX WAS ALREADY TRIED AND IT FAILED —
   every brief for two days told workers to measure first and every one of them DID**, so
   do not write a better warning; write the command. The tool takes each id by an
   exclusive create in the ONE `.git` all sixty worktrees share (the same fact
   `refs/stash` taught this project from the painful side), floored by the namespace's
   own corpus so a lost ledger degrades to today's convention and no further.
   `node tools/mintid.mjs --list` shows all sixteen namespaces it knows —
   C · D · DEC · IC · M · I and the ten queue-item families. **It costs the worker one
   command and costs you nothing per spawn, which is why it is here rather than a
   reserved block you would have to allocate at every spawn** — and it covers the BOB and
   DIST sessions too, which a block of yours would not: D-184 and D-185 both collided
   with BOB-SESSION rows, and BOB is not spawned by you. **What it costs when it fails:
   GAPS.** An id minted and never used is gone, so a number existing no longer implies
   the one below it does. That is the price, and it is one grep against a renumber sweep across
   code, suites, claims and reports — one of which already missed a REGEX LITERAL, where
   `C-29\.` is not the text `C-29.`.

**THE REFILL RULE, AND IT IS STEP 2's LAST ACT — NOT A SEPARATE HABIT.** A slot that has
just been freed by an integration is filled BEFORE the turn ends, in the same turn, from
the area's own column. **Reporting that a slot is free is not the same as filling it, and
CONDUCT has confused the two twice** (2026-08-07 and 2026-08-08, both caught by Bob): the
report named the next item correctly and then stopped. **An idle ephemeral worker costs
nothing; an idle SLOT costs the whole session's throughput, and `ORCHESTRATION.md`'s target
is integrated-correct THROUGHPUT rather than agent busyness.** So: integrate, push, and
spawn — and if a slot cannot be filled, say WHICH blocker holds it and what would clear it,
because "free" with no successor named is the shape of the mistake. **Slot-free lanes
(measurement, test-estate, D-216-class checks) do NOT occupy a slot and are therefore not a
substitute for filling one — run them BESIDE the two, not instead of them.**

**THE BUDGET WAS RAISED 2026-08-08 AND THE RULE CHANGED SHAPE WITH IT — READ
`ORCHESTRATION.md`'s "Concurrency" SECTION RATHER THAN THE NUMBER YOU REMEMBER.** Bob:
*"I have the sense that you're spawning sessions much more slowly than you could."* He was
right. **EIGHT concurrent workers, of which AT MOST FIVE may touch `store.mjs`,
`bio-checks.mjs` or `index.mjs`** (the worker count was raised 2 → 5 → 8 in one
conversation, the first correction still too timid and Bob said so; **the contended-file cap
was then raised 3 → 5 ON MEASURED EVIDENCE** — across thirteen integrations the `store.mjs`
conflicts were ONE trivial import list, while every other conflict was append-only prose in
`CLAIMS.md`/`DEBT.md`. **The cap of 3 was a guess and the guess was costing slots**) — the file contention is the real limit and the count
never was. **A worker runs 30–55 minutes and an integration costs 10–20, so a budget of two
left CONDUCT idle for most of every wave**, waiting on workers rather than being the
bottleneck it was sized to be. Spend the raised budget on items whose PATHS ARE DISJOINT:
the UI, the fleet, the test estate, the docs, the measurement lanes.

**NEVER BRIEF A WORKER TO `git stash`. THE RECIPE CONDUCT HAS BEEN WRITING INTO EVERY
BRIEF IS ITSELF A DELIVERY MECHANISM FOR THE DEFECT IT DEFENDS AGAINST.**

Named by M0-15, 2026-08-08, and confirmed three ways: **`git stash` is REPOSITORY-WIDE,
not per-worktree.** `refs/stash` is not among git's per-worktree refs, so **all sixty
checkouts of this repository share ONE stash stack.** `stash@{0}` does not mean *what I
pushed* — it means *what any of the sixty pushed last*. And `push -u` carries UNTRACKED
files, so a `pop` in worktree B materialises worker A's untracked `.test.mjs` into B's
`test/`, where discovery finds it, runs it, and **counts it into B's baseline** — then it
vanishes the moment B stashes again. That is the whole of the phantom-suite defect, and it
is one mechanism rather than two: the appearance of *another session in my worktree* falls
out of a single interleaved push.

**The bitter part, and the reason this paragraph exists rather than a note in a debt row:
the practice this project relies on to defeat stale figures — MEASURE YOUR OWN BASELINE,
which has caught a stale brief on ten consecutive items — is delivered by telling workers
to park their changes, and parking is the vector.** M0-15's own words: *change the brief,
not the workers.* At least four workers used the stash recipe on 2026-08-08 because
CONDUCT told them to.

**So the brief says, in this order:** (1) **do not park at all** — the battery now prints a
provenance line, so a dirty-tree baseline is readable; (2) if a clean tree is genuinely
needed, **`git worktree add` a scratch checkout**; (3) if you stash anyway,
`git stash push -u -m <agent-id>`, **capture the stash SHA immediately**, and `git stash
apply <SHA>` — **never `pop`, never `stash@{0}`.**

**THE ORDERING IS REVERSED AS OF 2026-08-08, AND THE FIRST VERSION OF THIS PARAGRAPH IS
THE MISTAKE IT NOW WARNS ABOUT. SPAWN FIRST. THEN INTEGRATE.**

CONDUCT wrote *integrate before spawning* earlier the same day, reasoning that a worker
branched from a tree missing a landed item creates merge work. **That reasoning was correct
and the conclusion was still wrong, because it priced only one side.** Measured on
2026-08-08, over thirteen integrations:

- **An integration costs CONDUCT 10–20 minutes of wall clock** — battery ~110 s, coverage,
  the UI harness, conflict resolution, the ledger entry, the push. **Every one of those
  minutes is a minute the freed slot sits empty**, and with eight slots and items landing
  in clusters that is the largest single source of idle capacity in the loop.
- **The merge cost it was avoiding is near zero. ALL THIRTEEN merges conflicted anyway**,
  and the conflicts were overwhelmingly in `CLAIMS.md` and `DEBT.md` — append-only prose,
  resolved mechanically, content never lost. **A worker branched one integration behind
  produces the same conflict as one branched level**, because the conflicting files are the
  ones every worker appends to regardless.

**KEEP-BOTH ON PROSE IS SAFE AGAINST LOSS AND NOT AGAINST CONTRADICTION, AND THE
DISTINCTION HAS TEETH. Measured 2026-08-08 on the very first merge pair of the rebuild.**
The standing wording — *append-only prose, resolved mechanically, content never lost* — is
true and is not the whole rule. Two branches did not APPEND two different rows; they each
EDITED THE SAME THREE ROWS, and keep-both kept both versions. The result was `D-240`,
`D-242` and `D-243` each appearing TWICE in `DEBT.md`, **one copy current and one stale, and
in every pair one said `open` while the other said `closed`.** Nothing was lost; the file
simply asserted a row's status and its contradiction, four lines apart.

**It was caught by D-243's duplicate-id check in `plancheck`, which had landed ten minutes
earlier in the merge immediately before** — before that instrument existed this would have
been invisible, and the honest reading is that earlier keep-both merges were never verified
against this failure rather than known to be free of it.

**So: after any keep-both resolution, run `node tools/plancheck.mjs` BEFORE you commit the
merge, and resolve a duplicated row by keeping the version from the branch that actually
CLOSED or NARROWED it** — not the longer one, and never both. `git diff` will not help you;
compare the STATUS field of each copy.

**AND THAT RULE HAS A MISSING HALF THAT COST A ROW THE SAME DAY IT WAS WRITTEN. FIRST ASK
WHETHER THE TWO ROWS ARE THE SAME DEFECT AT ALL.** Comparing STATUS fields silently assumes
they are, and on 2026-08-08 CONDUCT applied it to a `D-236` pair, kept the `closed` copy,
dropped the `open` one — **and the dropped row was a DIFFERENT DEFECT that merely shared the
number.** It was restored from the branch only because the detector reported `D-236` a THIRD
time after two resolutions had each looked complete. **Three distinct defects had been filed
as `D-236` in one day** (REC-64/REC-76's arm-C blindness, REC-68's dead `atom.phrase` field,
UI-50's unreachable-backwards fix), every author having measured the number free and every
one right when they looked — the exact failure `tools/mintid.mjs` exists to prevent, arriving
in the ROW rather than in the code.

So the resolution splits in two, and the order matters:

1. **Read both bodies. Do they describe the SAME defect?**
2. **Same defect →** keep the version from the branch that closed or narrowed it; drop the
   stale copy. This is the merge-duplicate case.
3. **Different defects →** it is an ID COLLISION. **Mint a fresh id with
   `node tools/mintid.mjs <NS>` and RENUMBER one, updating its references.** Deleting either
   row loses a defect, and the one you delete is the one nobody will miss, because the id
   still resolves to something plausible.

**A detector that keeps naming the same id after you have fixed it twice is not flaky — it
is telling you your model of the conflict is wrong.**

## PLANCHECK GREEN IS NOT THE GATE. I PUSHED `main` RED BEHIND IT.

**2026-08-09, and it is the previous CONDUCT's failure inverted.** That session pushed a
conflict marker behind a green BATTERY, because the battery does not read
`scripts/coverage.mjs`. I pushed a red BATTERY behind a green PLANCHECK, because plancheck
does not run the battery. **Same shape, opposite instrument: one gate answered, and I read it
as the gate.**

The commit was documentation-only — a note recording a lesson — and that is precisely why I
skipped the two minutes. **A docs-only commit is not a safe commit here**, because the
planning surfaces ARE a corpus: `planning-hygiene` asserts per debt row, `mintid` reads its
floors out of prose, `hygiene` walks the estate. Prose changes what the instruments measure.

**And the content of that commit was the defect it described.** It recorded *a queue row
without a register row beneath it drives the floor off prose* — and wrote the token
`Spawned as D-277` into `QUEUE.md` with no `D-277` register row, driving D's floor to 277
against a highest real allocation of 271. `mintid.test.mjs` went red on `main` and stayed
red until a worker measured its own baseline, found it already failing, and reported it
rather than assuming the tree was fine.

**Two rules, and the second is the one I actually needed:**

1. **Run the FULL gate before every push — battery, `--strict` unpiped, UI harness, plancheck
   — including on docs-only commits.** There is no commit here small enough to skip it.
2. **A lesson written down is not yet a habit.** I wrote this one, and then broke it inside
   the same commit. Where a rule can be mechanised, mechanise it: `plancheck` already reads
   the ledger, and an id with a queue row, no register row and no commit is a WARN it could
   raise on its own.

## A ROW NAMES THE DESIGN IT BUILDS FROM (added 2026-09-14 — `CORPUS-STANDARD.md` §4.7, in the file whose owner performs it)

**Every row you write or spawn names the governed design document and SECTION that is its
scope's authority** — `BIO_Content_Framework_v0_10.md` Part II §18 piece 1 and IC-83 for the
content row; `BIO_Membership_Architecture_v2.md` §7 for a project act — and the brief tells the
worker to read that section BEFORE the code. Bob, 2026-09-14, after the content construct sat
undesigned for six weeks while its document existed: the design corpus is the authority, the
ledgers record that something was decided, and code built from a ledger entry or a brief alone
leaves the construct's document never learning what was built. Two consequences at integration:
when a worker's report names a design gap, fold it into that document's **Incomplete sections**
in the same integration (the front matter's date moves with it, or `corpuscheck` says so); when
a landing changes what a construct IS, the home document's body and front matter move in the
same commit (`CORPUS-STANDARD.md` §4.1). A row with no design pointer is a row you cannot brief
honestly — find the section, or route the gap to BOB as the missing design, never spawn against
the ledger.

## YOU ARE THE SECOND LINK IN THE BLOCKER CHAIN, AND THE ONLY CHEAP PLACE TO BREAK IT.

**`CLAUDE.md` now carries the rule** (2026-09-14, *"a blocker is a claim, and nothing here
audits one"*): every instrument in this repository is pointed at the record claiming MORE than
it has, and a statement of what we CANNOT do passes all of them untouched — costing real work
in the direction that leaves no trace, because the work never happens and nobody audits a
reason for not building something. **This section is the loop's half: WHERE that claim passes
through you, and what it costs at each step.**

**The chain is three sessions long and only the last step is expensive:**

1. **A worker states a blocker in its report.** Honest, usually right, and written from ONE
   tree at ONE moment — often a tree that is already behind, since `origin/main` moves while it
   runs. Cost to correct here: zero, and the worker often corrects itself.
2. **YOU carry it onto a row** — into the `landed:` line, into a new row's `depends-on`, into a
   `blocked` status. Cost to correct here: **one edit, in the turn you are already taking.**
3. **BOB rests a design on the row**, or a future CONDUCT declines to spawn against it. Cost to
   correct here: a design document, its decomposition table, every row drawn from it, and the
   weeks nobody spent on work that was never actually blocked.

**So the rule for this loop, and it is one command: before a blocker reaches a row, GREP THE
CODE IT NAMES, on the tree you are on.** Not the tree the worker measured — yours, after the
merge. The same check the content rule below demands before a SPAWN, run in the other
direction and at the other end.

**Both of the day's receipts came through step 2 and were caught there:**

- **REC-89's row rested on a debt row that had been stale for 38 days.** D-225's caps landed at
  REC-60 on 2026-08-07; the row stayed `open`; a design written five weeks later cited it as an
  unmet precondition, and CONDUCT rowed the design's line. The worker found its own subject
  already built, declined to mint an IC for a change that does not exist, and corrected the
  design in place. **The lesson that generalises is the one its report named: a debt row is a
  claim about the day it was written, and a remedy ships without the row closing.**
- **A report named PERSISTENCE as the blocker on the extent picker; the real blocker was one
  missing CANVAS.** `page_count` had been persisted at acquire hours earlier by CAP-9 and
  `schema.mjs` says so in so many words. Carried unexamined, that sentence would have sent
  someone to build a plane item nobody owed — and the narrower truth is a surface a UI worker
  can actually build. It was caught because BOB asked whether it was still true, which is the
  check this section makes routine rather than lucky.

**And the asymmetry that makes this yours rather than shared:** a worker's overstated blocker
is one report; a row's overstated blocker is READ BY EVERY SESSION AFTER IT, including the ones
that decide what not to build. You are the last reader who can still check it for one command.

## A CORRECTION TO A RUNNING ROW IS YOURS TO PAY AT INTEGRATION. THE WORKER CANNOT BE REACHED, AND PUSHING DOES NOT REACH IT EITHER.

**Measured 2026-09-14, and the pair of us found the two halves of it in one exchange.** BOB
renamed a table in a design while the worker building that table was mid-run — `observations`
to `observation_log`, because `runtime_observations` and a `captured_locators.observations`
counter already existed and a third thing under one word is how three statements about
different things read as three confirmations of one. The ask was *"get it to that worker
now"*, and the answer is that **you cannot**:

- **A worker is a SUBAGENT, not a session.** The session-to-session channel reaches BOB, DIST
  and FLEET; nothing reaches a subagent mid-run. There is no inbox on the other side.
- **PUSHING DOES NOT REACH IT EITHER, and this is the part that looks like it should.** A
  worktree is a checkout of a COMMIT the worker started from. A correction pushed to `main`
  after the spawn is invisible to it until it fetches, and it has no reason to.
- **Killing the run to deliver one edit is the wrong trade** — a worker is 30–55 minutes and
  the edit is minutes at the merge.

**So: a correction that arrives while a row is `running` is written ON THE ROW as an ACT WITH
ITS ACTOR — CONDUCT, at integration — and then PAID there.** Not as a notification, which
reads as already-handled; not held in your head, because this session can be replaced
mid-flight and **a rename owed by a session that ends is a rename nobody performs.**

**Pay it INSIDE the integration commit, before the merge is pushed**, so the corrected thing
never reaches a reader, a release or another worker in its wrong form. The receipt: the table
above was renamed in the merge commit itself — by SQL SHAPE rather than by token, which is what
kept the two same-named things that must NOT move — and the suite it belongs to was renamed with
it and driven green before the push. **Declare a rename in the merge trailer**: `mergecarry`
cannot tell a rename from a deletion, so an undeclared one reads as a lost suite forever after.

**And the general form, which is worth more than the instance:** the window between a spawn and
its integration is a window in which the WORLD may correct the BRIEF, and the brief cannot be
recalled. Everything you learn in that window about work already running is an integration act.
That is the same shape as the release-note sweep two sections down — an owed act must land in
a place that is DRAINED, and the row you are about to flip is drained by you, this turn.

## THE FLIP IS NOT DONE UNTIL THE SPAWN SUCCEEDS. VERIFY IT, AND REVERT THE FLIP IF IT FAILS.

**Measured 2026-09-15 by CONDUCT #11, on the wave immediately after the section below was
followed correctly.** The rule above is right and was obeyed: seven rows flipped in one edit,
gated, pushed, count read back — and then **all four spawns in the first batch FAILED**, because
the session's working directory was the WRAPPER rather than the repository and the harness
cannot create a worktree outside a git repository. **`origin/main` then carried seven rows
claiming live workers that did not exist.**

**It lasted about a minute and the fix was one `cd`. The ordering that produced it is the part
worth keeping**, because the section below optimises for the opposite failure — a worker reading
a stale `queued` row and stopping — and says nothing about the flip outliving a spawn that never
happened.

**So the rule has a second half: after spawning, CONFIRM the spawns started** (`ListAgents`, or
the tool's own result — a failure is loud, but only if you read it). **If a spawn fails, revert
the flip in the same minute and push, or the queue is lying about the world.** Do not leave it
for the report.

**AND THE CAUSE IS A STANDING HAZARD IN THIS HARNESS RATHER THAN A ONE-OFF SLIP: THE SESSION'S
WORKING DIRECTORY REVERTS ON ITS OWN BETWEEN TURNS.** It drifted from the repository to the
wrapper, was set back with a bare `cd`, and drifted again two turns later. **A `cd` inside a
subshell — `(cd … && …)`, which is the safe form for everything else — does NOT set it**, so a
session can run a hundred correct commands through subshells and still be outside the repository
when the spawn tool asks. **Before a spawn, run a bare `cd` into the repository in its own
command and let the environment line confirm it.** It costs one call and it is the difference
between a wave starting and a queue lying.

**The general form, and it is this file's oldest lesson in new clothes: a step that PUBLISHES a
claim and a step that MAKES it true are two steps, and the gap between them is where every wrong
status in this queue has lived.** Flipping before the spawn closed one direction of that gap. It
opened the other, and this section is the other half.

## THE ROW'S STATUS IS PART OF THE ROW. FLIP IT TO `running` AND **PUSH** BEFORE THE SPAWN, NOT AFTER.

**Measured 2026-09-14 by CONDUCT #11, and it cost eight spawns.** The section above fixed
*"the row does not exist"*. This is its residue: I drained an inbox into **twenty-two new rows
in one commit**, wrote the spawn state on exactly ONE of them (CAP-12, because its flip was
scripted with its predecessor's bookkeeping), pushed, and then spawned eight workers whose
briefs told them — correctly — to STOP if their row read `queued`. Seven read `queued`. Two had
already stopped and reported before I noticed; both diagnosed it from the remote precisely, one
adding the distinction I had missed: **the flip was never WRITTEN, not merely unpushed**, since
the same commit that added the row as `queued` added CAP-12's as `running`.

**The rule, and it is one line:** a row you are about to spawn is flipped to `running` **with
its spawn sentence**, gated and **pushed**, and only then does the worker start — the same
merge → gate → PUSH → spawn order the section below demands for a dependency, applied to the
row's own status. A worker reads its row from `origin/main`; a flip in your tree is a flip
nobody can see, which is this file's oldest lesson wearing a new hat.

**Why a new wave makes it likely rather than unlucky.** Flipping is per-row hand editing, and it
is reliable while you flip one row beside one spawn. It fails the first time you author a COHORT:
the rows all land in one commit, the flips are a second pass, and a second pass over twenty-two
rows is exactly the check-then-act with no atomicity that `mintid` exists to refuse. **So the
defence is not vigilance.** Until it is mechanised, flip the whole cohort in ONE edit before the
gate, and read back `grep -c '· running'` against the number of workers you are about to spawn —
the count is the check, and it is one command.

**Mechanising it is worth a row when M0 has a free lane** (a worker reported it and it is
recorded here rather than left in a report): `plancheck` cannot know what you spawned, but it
CAN fail a row that names a live `agent-*` worktree while reading `queued`, and the spawn surface
could write the status itself. Both are the same fix as `tools/mintid.mjs` — write the command,
not a better warning.

**What it cost, stated honestly, because it was not nothing and it was not much:** two workers
spent a few minutes each establishing the stop and reported it well; six others hit the same gate;
no tree was edited, no claim was taken, no id was minted, and the wave restarted on one push. The
practice held exactly where it was designed to — **a brief that tells a worker to falsify its own
premise is what turned a silent eight-way no-op into a five-minute correction.**

## THE SPAWN SENTENCE CARRIES A FALSIFICATION CLAUSE, AND THE CLAUSE MUST NOT ASK A READER TO CONCLUDE A VALUE FROM AN ABSENCE.

**Corrected 2026-09-15 by CONDUCT #11 on BOB #11's argument, after the clause had been
copied onto ten rows.** A status is a claim about the world, so every `running` row you
write carries a clause telling the next reader how to CHECK it. The clause as first
written said: *"a live worker holds an `agent-*` worktree with a claim on the paths its
scope names; if none does, this row reads `queued`."* The first half is right and is the
reason the clause exists. **The second half is wrong, and it is wrong in the expensive
direction.**

**An absence has two causes that are opposite facts.** Nobody ever started, so no work
exists — or the worker FINISHED, committed and released, so the work exists on a branch
and is waiting on you. A reader applying the old clause in the second case concludes the
work was never done and respawns an item that is already built. **That is D-129 in this
queue's own vocabulary** — *"`undetermined` conflates two different claims: WE DO NOT
KNOW, and THERE IS POSITIVELY NONE"* — and `CLAUDE.md`'s standing rule is that
undetermined is first-class and must be STATED, not resolved by whichever guess is
convenient.

**The clause to write from now on, and it is the row's own sentence rather than a pointer
to this file:** *"Falsify rather than believe: a live worker holds an `agent-*` worktree
with a claim on the paths its scope names; **if none does, this row is UNDETERMINED
between `queued` and done-awaiting-integration — READ THE BRANCH (the preamble's
falsification rule), and never conclude `queued` from the absence alone.**"* The
preamble of `QUEUE.md` carries what to read and in what order: a `worktree-agent-*` branch
with commits naming the item means the work exists; a `released:` line in the item's
`CLAIMS.md` block means the worker finished on purpose; an OPEN claim beside a branch with
commits is a THIRD state — it died mid-item, so take the branch rather than respawning
from zero; and only with no branch and no claim does the row fall back to `queued`.

**No fifth status was minted and that was decided rather than missed.** The window between
a worker finishing and your merge is real and nothing occupies it. A word for it is
arguable, but the clause was wrong in a way a new word would not have fixed — a reader
applying a bad inference rule reaches a wrong answer whatever vocabulary is on hand — and
this queue has just finished paying for a preamble that named two statuses while the loop
ran on four. Revisit it when there is a second reason.

**The general form, which is why this section is in the loop file and not only in the
queue:** a falsification rule you write for someone else is an INFERENCE RULE, and an
inference rule that turns "I see nothing" into a definite value is a defect no matter how
carefully the rest of the row is worded. Check every such clause for what it says when the
evidence is missing.

**And the sharper statement of it, BOB #11's, added 2026-09-15 after the same general form
found this defect inside `OBSERVATION-LOG-DESIGN.md` §3 within the hour:** treating an
EMPTY SET as a positive finding is *"an equality that costs nothing to produce is not
evidence"* **inverted** — an absence that took no work to produce, reported as a fact about
the world. This project's instruments catch the OUTCOME that cost nothing. **They do not
catch the ABSENCE that cost nothing**, and an unearned absence is what every wrong-status
arrival of 2026-09-15 had in common: a row that outlived its work, a row that outlived its
worker, a hold that outlived its condition, a delegation that outlived its discharge, and a
clause that read "no worker" as "no work". **When you find yourself concluding something
from a query that returned nothing, ask what it COST that query to return nothing.**

## A SPAWN BRIEF IS NOT A QUEUE ROW, AND AN ID IN THE LEDGER IS NOT AN ITEM.

**Measured 2026-08-09: of eight items I spawned in one wave, SIX had no `QUEUE.md` row.** The id was
minted, the worker was briefed, the work was real — and the item existed nowhere any other session
could see it. *Nothing is work until it is in `QUEUE.md`* is this loop's own step 2 and I skipped it
six times in an afternoon, because minting an id **feels** like registering the item and the ledger
answers when you ask it.

**It reached a worker as a false premise within hours.** D-265's brief told it to *"read that row in
`DEBT.md`; it is the authority"* — and no such row existed on `main`: the raising item had written it
on an unmerged branch. The worker measured, found the premise false, and correctly **minted its own
ids rather than squatting on numbers another tree held**. The ledger had handed out `D/265` and
`M0/18` to worktrees whose rows were never committed, so `mintid` knew about items the repository did
not.

**Three rules, and the third is the one that generalises:**

1. **Write the queue row BEFORE you spawn, not after the worker reports.** It costs a minute and it is
   the only artifact anyone but you can read.
2. **Never brief a worker against a row that lives only on an unmerged branch.** Either land the row
   first, or PASTE its content into the brief and say plainly it is not on `main` yet.
3. **`plancheck` cannot catch this** — it validates rows that exist, and says nothing about work that
   has none. So this is a discipline, not a gate, which is exactly the shape this project distrusts.
   **If it recurs, mechanise it**: every id in `.git/bio-idalloc` older than an hour with no row and
   no commit is either an abandoned mint or an unregistered item, and both are worth a WARN.

## BEFORE YOU SPAWN, CHECK FOR THE CONTENT. A LEDGER GREP RETURNING NOTHING IS NOT EVIDENCE.

**Measured 2026-08-09: I spawned a worker onto PL-2, which had ALREADY LANDED — implementation
`3ab1392`, merge `f86515d`, integration `b303cc8`, all ancestors of `origin/main` before the spawn.**

The cause was one command. I ran `grep -c "PL-2\*\* —" QUEUE.md`, got **0**, and read that as *the item
has not landed* rather than as *my matcher found nothing*. The pattern depends on an em-dash and an
exact bold spelling in a 4,000-line prose file; it matched for other ids and not this one. **A grep's
silence was treated as a measurement.** That is the same shape as inferring a merge from the absence
of the word CONFLICT, and as a floor that never fails because it is slack — and it happened one hour
after I wrote the content-check rule immediately below, which would have answered it outright:

```
git cat-file -e origin/main:<a file the item added>          # does its code exist?
grep -c '<a symbol it added>' <a file it changed>            # does its symbol exist?
```

**So: before spawning, verify the item is NOT landed by looking for its CONTENT** — the op, the
table, the suite, the export it was supposed to add. The queue row is bookkeeping and lags; the tree
is the fact. This is the same asymmetry the `--is-ancestor` note below turns the other way.

**What it cost, stated honestly, because the answer is not "nothing":** the worker measured the tree,
found its brief stale, and turned the turn into independent verification — which found a real DEC-49
defect (one code answering two conditions, telling a member who supplied a reason that they had not)
and a three-layer control that **could no longer arm**, because a later item had landed a line between
its anchor and the next. Both are worth having. **But that was the worker's recovery, not my
scheduling**, and a brief that is wrong about the tree is a brief that can send someone to rebuild
something that exists.

## AFTER EVERY MERGE, COMPARE THE FILE SET IT CARRIED AGAINST THE FILE SET THE BRANCH CHANGED.

```
comm -23 <(git diff --name-only <fork-point> <branch-tip> | sort) \
         <(git diff --name-only HEAD^ HEAD | sort)
```

**Anything it prints is a file the merge DROPPED WHOLE.** Measured on 2026-08-08 and found
days later by accident: REC-69's branch changed **12** files, my merge carried **11**, and the
missing one was `civicos-ui/check-refusal-codes.mjs` holding **70 lines of floor moves**.

**THE CAUSE WAS MY OWN RESOLUTION AND IT WAS A REASONED ONE.** That file conflicted in six
hunks, all of them floor figures, and I took OURS on every hunk — with a stated plan to re-read
the floors from the merged green run afterwards. Taking one side on EVERY hunk of a file is
identical to discarding the branch's whole contribution to it: the file ends byte-equal to
main, git records no change, and the merge diff simply does not mention it. My re-read then
moved `REGISTER_FLOOR` in `coverage.mjs` and never touched that file's eleven floors at all.

**NOTHING WENT RED, AND NOTHING COULD HAVE.** A dropped floor move goes SLACK, not broken.
Eleven floors sat stale with the battery green, `--strict` at exit 0 and the UI harness at exit
0. `--is-ancestor` passed. `git revert -m 1` could not remove what was never there.

Two rules fall out, and the second is the general one:

- **If you find yourself taking one side on every hunk of a file, stop.** That is not a
  resolution, it is a deletion of that file's contribution, and it should be a deliberate
  decision stated in the commit message — not the accumulated result of six hunk-by-hunk calls.
- **A floor you promise to re-read later is a floor you have not moved.** Re-reading
  `coverage.mjs`'s printed figures does not touch any OTHER file's floors, and a stale floor is
  invisible by construction because slack never fails.

Mechanising this is **M0-20**. Until it lands, run the command.

## `--is-ancestor` PROVES A MERGE HAPPENED. IT DOES NOT PROVE THE CONTENT SURVIVED.

**Measured 2026-08-08, and it is the ancestry rule's own blind spot.** The rule
*"after every merge, assert `git merge-base --is-ancestor <branch> HEAD`"* exists because the
previous CONDUCT inferred merges from the absence of the word CONFLICT and ledgered four items
that never landed. It is the right rule and it has a second edge:

**A REVERTED MERGE STILL PASSES IT.** REC-69 was merged, its conflicts hand-resolved, the merged
tree failed two ratchets, and it was backed out with `git revert -m 1`. `--is-ancestor` answers
TRUE for `worktree-agent-a5723f4c87dfd5bd0` against `origin/main` **and every line of its code is
gone** — `airuns.test.mjs` absent, `RUN_CONTEXTS` absent, `aiRuns` absent.

So a future session auditing "did REC-69 land?" with the ancestry check alone gets **YES**, which
is the same false green the rule was written to prevent, reached from the other direction.

**When it matters — an audit, a handoff, any claim that an item IS in the tree — check for the
CONTENT, not the ancestry:**

```
git cat-file -e origin/main:<a file the item added>
git show origin/main:<a file it changed> | grep -c '<a symbol it added>'
```

Ancestry is the right check at the moment of merging (it catches a merge that silently did
nothing). Content is the right check for "is it in the tree now". **They answer different
questions and this session needed both.**

**So the rule is: the moment a worker reports, SPAWN ITS REPLACEMENT BEFORE YOU MERGE
ANYTHING.** Spawning is one tool call and costs seconds; integration costs twenty minutes.
Doing the cheap thing first is free, and doing it second has now cost this project two
stretches of idle slots that Bob had to notice himself.

**And do not wait for the timer to catch it.** A one-minute cron was added at Bob's
instruction and **it has never fired, because cron jobs only fire while the REPL is IDLE and
CONDUCT is never idle while integrating** — the exact condition under which slots go empty
is the exact condition under which the timer cannot run. **That is not a reason to remove
it** (it catches the genuinely idle case, which is the other half) **but it is the reason
this paragraph, and not the timer, is the mechanism.** A mechanism that is not in the loop
the reader actually runs is not a mechanism — and a timer that cannot fire during the work
is not in the loop. **The refill now also runs on a one-minute timer** (Bob's instruction, same
conversation) — **but the timer is SESSION-ONLY and expires in seven days, so this rule is
the durable half and the timer is the convenience.** A mechanism that dies with the session
is not a mechanism; do not let its existence excuse not filling a slot yourself.

**THE STATE THE TIMER IS ACTUALLY FOR IS ZERO, NOT ONE-OF-N.** CONDUCT's first
response to being told to add it was that a poll *"will answer full nearly every
time"* — which is an argument that a check will usually find nothing, and this
project runs a battery, a strict coverage walk and a negative control on exactly
that basis. **Both recorded refill failures were slots at ZERO with work queued.**
So when the timer fires: do not check whether the slots are *nominally* filled,
check whether anything is actually RUNNING, and treat every empty one as the
defect it is.

2. **When a worker reports:** VERIFY (full battery from the main checkout; **AND
   `node civicos-ui/test/run.mjs`, exit read UNPIPED — on 2026-08-08 CONDUCT pushed
   `origin/main` with that harness RED at 32 failures, having verified the battery and
   coverage and not it, and the integration note claimed green. Three workers found it
   independently before CONDUCT did**;

   re-run the negative control yourself for anything touching destructive or
   security-sensitive code; and run `node scripts/coverage.mjs --strict`
   DIRECTLY, reading `$?` with nothing piped after it — `cmd | tail` reports
   tail's status, so a failed strict run reads as exit 0, which is how CONDUCT
   recorded a false `exit 0` on 2026-08-04 before REC-49 caught it; and
   `npm run test:coverage --strict` does not pass the flag at all, npm swallows
   it), then INTEGRATE on `main` (fetch-rebase; resolve
   `CLAIMS.md` / queue collisions; never force-push), record bookkeeping (release
   claims, route delegations into queues, register/annotate interfaces and DEBT),
   push, and spawn the area's next item.

   **A RELEASE NOTE MAY NOT CARRY AN OWED ACT (added 2026-09-14 — the note-is-not-an-item
   class's FIFTH arrival, and the first to cost a measured >3h false stall).** FL-10's
   handoff line — the act of flipping its own queue row — sat in a CLAIMS release note,
   which nothing drains: not this loop's step 0 (the inbox), not step 5 (DECISIONS), not
   plancheck (it validates rows that exist). An owed act is a ROW in this file, an INBOX
   entry, or a DELEGATION in CLAIMS.md's claim region — those three are drained; prose
   anywhere else is not. **So at every integration, sweep the report and any release/
   claim note it carries for verbs aimed at a future actor** ("CONDUCT must…", "left for
   you", "when X lands, do Y") **and convert each one to a row or an inbox-class entry in
   the same turn — or do it on the spot.** The four prior arrivals of this class are at
   2026-08-05 (the undrained pilot), 2026-08-10 ×2 (the drain rule's own restatements),
   and 2026-09-10 (the CASE-14 re-scope that lived a month in a landed line); each was
   written down and the class recurred anyway, which is why this is now a NAMED SWEEP in
   the integration step rather than a lesson.

   **AND AFTER THE MERGE, BEFORE THE PUSH, RUN `node tools/mintid.mjs --audit --base origin/main`.**
   D-243, closed 2026-08-08. **A merge is the only moment two branches' ids become one
   corpus, so a collision that existed in NEITHER branch appears at your hands and
   nowhere earlier** — which is why this is your step and not a worker's. It answers four
   questions and they do not have equal standing: **duplicate allocations and an
   unregistered prefix are BREAKS** (definitive, in the commit, no ledger needed, and
   `plancheck` fails on both as well so you cannot push past them); **an id the ledger
   does not hold is a QUESTION you ASK the worker, never a failure**, because every id
   allocated before 2026-08-08 is honestly `unknown` and a gate answering unknown over
   the whole corpus is the shape `VERIFICATION.md` refuses.
   **WHAT IT FOUND THE DAY IT WAS WRITTEN, over `origin/main`, is why it exists: SIX id
   collisions already sitting in the repository and known to nobody** — `D-121`, `D-124`,
   `IC-30`, `CPDF-9`, `FW-15`, `M0-16`. Three of the six are in **YOUR file**, `QUEUE.md`,
   and `D-124` had already been renumbered once, ONTO a second collision. They are
   registered in `KNOWN_COLLISIONS` with a reason each and **owed as a renumber under
   D-248** — a seventh fails, and a registered one that gets renumbered fails too, so the
   register cannot outlive its reason.
   **What it CANNOT see, so you do not read a clean run as more than it is:** an un-minted
   id that has not collided yet and sits below its namespace's watermark; a collision
   inside `C` or `M` (both NAMED as ungradable in its own output rather than scored
   clean); and a collision between two branches nobody has merged — which is exactly the
   one your merge creates, and therefore exactly why you run it AFTER merging.
3. **Enqueue decompositions from BOB** — you are the GATE that confirms each
   piece is genuinely independent before it becomes runnable. **And test every
   scope you write against CLAUDE.md's "CONTENT IS THE UNIT" section** (added by
   BOB 2026-08-04, because the point had to be re-made session after session):
   a capability that does not serve the path of questioning, exploring,
   discovering, documenting and impacting is not obviously worth building; a
   search that returns DOCUMENTS has not finished; the lower levels are never
   assumed complete; and **sparse is normal at every level, so which level was
   empty is a first-class obligation to STATE, not a diagnostic detail.** An
   item whose accepts-when lets a surface answer "nothing found" without saying
   whether nothing was extracted, nothing was read, or nobody looked, is
   under-specified — that is the same rule as "undetermined is first-class",
   one altitude down, and it is CONDUCT that writes the accepts-when.
4. **Keep two development areas busy;** promote a dormant area when a queue
   empties.
5. **Work `DECISIONS.md`, both directions.** It is the return channel — `QUEUE.md`'s
   `BOB INBOX` carries changes DOWN to you, this carries questions UP.
   - **Lifting in:** when a worker closes a turn with a decision item, apply the three
     tests in `kickoffs/README.md` FIRST and then write it into `DECISIONS.md` as a
     `DEC-<n>`. You are its sole writer. An item the repository already answers, or
     that you are better placed to decide, never reaches the file — resolve it and
     record where the answer came from. Activation order, sequencing, mechanism and
     scoping are YOURS, ruled 2026-07-31.
   - **Never block on it.** Every `open` entry carries a `provisional:` saying what is
     running meanwhile; if a worker would otherwise stop, run the cheap-to-reverse
     alternative and say so. `plancheck` refuses an open entry with no provisional.
   - **Draining out:** an entry the BOB session has set to `answered` is yours to
     ENACT — make the queue and document changes it implies, then set `enacted:` with
     the commit AND the document that now carries the REASONING. If the answer
     contradicts what was running provisionally, unwind that first and say so in the
     entry. A verdict with no reasoning in the record is a transcript.
6. **Run `node tools/plancheck.mjs` before you push, and get it green.** It is the
   integration-side half of the same discipline: an ACTIVE area with no kickoff, an
   item behind an unregistered interface, an unknown milestone, an open debt row with
   no disposition, or a planning surface you have not published. It catches a BOB
   session's handoff mistakes as well as your own, which is the point — the check is
   on the repository's state, not on who last touched it.

   **AND SINCE M0-20 IT ALSO ANSWERS THE QUESTION THE SECTION ABOVE MAKES YOU ASK BY
   HAND: DID THE MERGE CARRY WHAT THE BRANCH CHANGED?** It compares, for every merge in
   `origin/main..HEAD`, the file set the merge carried against the file set its branch
   changed, and FAILS naming any path where the merge kept main's version byte for byte.
   `node tools/mergecarry.mjs --commit <sha>` runs it on one merge, `--verbose` prints
   every class. **This is the instrument for *"`--is-ancestor` PROVES A MERGE HAPPENED,
   IT DOES NOT PROVE THE CONTENT SURVIVED"* — that paragraph tells you to check for the
   content by hand, naming a file and a symbol you have to think of yourself, and the
   file you must think of is precisely the one you did not.** REC-69's merge carried 11
   of its branch's 12 files, the missing one held 70 lines of floor moves, and it went
   unseen for days behind a green battery, `--strict` exit 0 and a green UI harness.

   **IT CANNOT TELL A CORRECT HAND-RESOLUTION FROM A FORGOTTEN ONE — THE TREES ARE
   IDENTICAL — SO WHEN YOU DELIBERATELY TAKE ONE SIDE WHOLE, SAY SO IN A TRAILER:**

       Dropped-from-branch: <path> — <why the branch's change is correctly superseded>

   Per path, exact. **Prose in the merge body is NOT the declaration, deliberately.**
   REC-69's merge message named `check-refusal-codes.mjs`, described taking main's side,
   and promised the figures would be re-read from a green run — and the promise was never
   kept. The trailer costs a line and puts you at the keystroke where you have to finish
   the sentence *"the branch's 70 lines are correctly superseded because…"*. **An
   unfinishable sentence is the finding.**

   **AND SINCE 2026-09-14 IT RUNS `tools/corpuscheck.mjs`: every design document in
   `docs/architecture/` (and every design listed in `CORPUS-STANDARD.md` §5) must carry
   current front matter — Status with `as of YYYY-MM-DD` no earlier than the file's last
   commit, Place in the system, an explicit Incomplete sections list, and a generated
   Contents that matches the headings.** When an integration lands a change to a construct,
   its home document's front matter moves in the same commit (`CORPUS-STANDARD.md` §4);
   when a worker's diff touches a governed document's headings, `node tools/corpuscheck.mjs
   --write <file>` regenerates the Contents. A red here is not noise to wave through: it is
   a document about to answer the next session with last month's completeness.
7. **Escalate to Bob ONLY genuine decisions** (doctrine, priority, risk he
   carries, effects on people outside the project). You write no area code; a
   turn that edits an area's code has stopped being CONDUCT — enqueue it and
   spawn a worker instead.

**You hold the MAIN checkout and every other session, including BOB, works in a
worktree** (`PARALLELISM.md`, DEC-3). From 2026-07-31 a dirty main tree is YOUR work
and nobody else's, so `plancheck` refusing an unpublished planning surface is a
finding about this session rather than noise from another.

Credentials are in `.env`; git is configured to push as the bio persona (see the
recalled memory). Reserve gated actions — deploying the plane or the installer —
for BOB.

## A RED `main` IS REPAIRED BY WHOEVER SEES IT WHEN THE REPAIR IS DETERMINISTIC, AND ROUTED TO THE PUSHER WHEN IT NEEDS JUDGEMENT.

**Decided 2026-09-15 by CONDUCT #11 (mechanism, mine), on BOB #11's question after we both
repaired the same red index in the same minute.** BOB asked for one rule and offered two:
fix on sight, or route to the pusher. **Neither alone is right, and the case that produced
the question says why.** Both of us regenerated `docs/DECIDED.md`; git dropped BOB's as a
DUPLICATE PATCH during rebase and nothing was lost. That was not luck. **A regeneration has
exactly ONE correct output, so two sessions producing it cannot disagree on content — only
on ordering, and ordering is the one thing git resolves by itself.**

**A hand-written repair has many correct outputs.** Two sessions writing different prose
into the same region of a red tree produce a REAL conflict, on a tree that is already
broken, while eight workers wait. So the line is not who saw it first and not who pushed
it; it is whether the repair is a command or a judgement.

- **Deterministic — regenerate an index, rebuild a bundle, re-run a generator, register a
  historical drop whose row is dictated by the instrument's own output: REPAIR ON SIGHT,
  whoever you are.** BOB's cost argument is correct and decides this half: a red `main`
  charges every live worker a full gate run on a defect none of them caused, and waiting to
  route is the expensive option.
- **Judgement — a fix that chooses wording, scope, a threshold, or which of two truths to
  keep: ROUTE TO THE PUSHER**, who has the context that produced it, and say so in one line
  so nobody else starts.
- **Either way, announce in the same minute you start**, one line, before the gate. The
  duplicate we paid for cost one skipped cherry-pick; a duplicate on a judgement call costs
  a conflict resolution nobody wanted.
- **The pusher is never RELIEVED of it.** "Whoever sees it" is permission, not transfer: if
  nobody else has taken it, it is the pusher's, and a pusher who leaves a red `main` for
  someone else to notice has pushed a cost onto sessions that cannot see where it came from.

## A CLAIM ABOUT THE WORLD IS CORRECTED BY GOING TO THE ARTIFACT. A CLAIM ABOUT A RULE IS CORRECTED BY READING IT AGAINST THE RULE IT RESTS ON.

**BOB #11's correction of a generalisation I had made too strong, 2026-09-15 — and the way it
arrived is the best argument for it, because BOB checked the record instead of its memory of a
day we had both just lived through.**

I had written that every correction landing that day came from someone going to the artifact,
and that not one came from reading more carefully. **That is false, and two of the day's
corrections are the counter-examples.** The falsification-clause defect was found by reading the
clause and recognising D-129's shape in it — an absence with two causes that are opposite facts
— with nothing run and nothing measured, because **there was no measurement available to take:
the defect was in the INFERENCE.** The attribution hazard was found by reading a commit subject
and noticing that one phrase has two true readings with different consequences in this corpus —
again a convention checked against a convention, not a fact checked against the world.

**So the useful rule is two rules, and knowing which one you are holding is the whole of it.**

- **A claim about the WORLD** — this figure, this file's contents, this tool's behaviour, this
  row's status, whether a delegation was discharged — **is settled by the artifact and by
  nothing else.** Re-reading will never catch a stale debt row, and several documents agreeing
  is not evidence (`CLAUDE.md`).
- **A claim about a RULE** — an inference, a convention, an attribution, a definition, what a
  status MEANS — **is settled by reading it against the rule it rests on.** No measurement will
  ever catch a bad inference rule, because the rule is wrong in every world.

**Confusing them costs in both directions, and the cheap tell is what you would DO if you
disagreed.** If the answer is *go look*, it is a world-claim. If the answer is *argue*, it is a
rule-claim, and going to look will produce a number that settles nothing.

**This session's own error is the clean illustration of both halves in one place.** The premise
that `mintid` does not allocate `M` was a WORLD-claim and only the tool could settle it —
reading the sentence again, in any of the six places it appeared, would have confirmed it every
time. The clause that premise produced, telling a reader to conclude a value from an absence,
was a RULE-claim and only reading could settle it — no run of anything would have flagged it.

## STATE HOW THE CHECK WOULD BE SATISFIED BY A LIAR BEFORE YOU STATE WHAT IT CHECKS.

**BOB #11's formulation, 2026-09-15, after three checks written in one day were each designed
against their own defeat — and it is the transferable practice from that day, so it is in the
loop file rather than in three rows.** You write the `accepts-when` on every row. That line is
where this rule bites, and it costs one sentence.

**The three, and what each one's defeat looked like.** M0-37's register arm: *the mechanism
cannot be satisfied by DOING NOTHING* — a `DELEGATION` block gains either a discharge or an
explicit `open as of`, so silence is no longer a passing answer. M0-39's duplicate-id arm: the
acceptance names the blanket date stamp, because carrying nine live blocks to green without
reading the tree is that row's own defect one layer up. M0-39's attribution arm: acceptance is
the arm PASSING over a corpus where both forms are correctly used and FAILING over one where the
two have been swapped — **because a checker that cannot tell "all correct" from "all uniformly
wrong" is measuring its own bookkeeping.**

**The rule, in one line: for every acceptance criterion you write, ask what the cheapest way to
make it green would be, and if that way does not also make the world right, say so IN the
criterion.** Not in the report, not in a follow-up — in the criterion, where the worker meets it
before starting and where the next reader meets it when judging whether it was met.

**It applies to a worker's NEGATIVE CONTROLS in the same shape and for the same reason**
(`kickoffs/WORKER.md` carries the arm-that-did-not-arm rule): an arm is a check on a check, and
an arm that can be satisfied without arming is the identical defect one level up. This session
saw a control come back GREEN over a subject that could never have honoured it, because the
fixture had no version legs at all — the arm was not wrong, it was answering a question nobody
had made askable.

**Why it belongs to CONDUCT specifically.** A worker discovers the cheap defeat by running into
it, which costs a run. You can name it while writing the row, which costs a sentence — and the
worker then builds against a criterion that already knows how it could be faked. That is the
same economics as flipping a row before the spawn: **do the cheap thing while you are the one
who knows.**

## KILL THE TREE, NOT THE LEAF — OR THE LEAF COMES BACK AND THE NEXT READER MEASURES A FRESH ORPHAN RATHER THAN A SURVIVOR.

**Measured 2026-09-14 by CONDUCT #11, found 3.5 hours later by BOB #11, and recorded here
because it existed nowhere but a transcript.** A worker wave left processes running past
their agents. I reaped them by killing the CHILD processes I could see. Each parent
respawned its child, so the reap looked successful at the moment I checked and the estate
was fully repopulated by the time anybody looked again. **The fix is one word of ordering:
kill the PARENT first, then anything it left behind.**

**The part worth keeping is not the ordering — it is what the mistake hides.** An orphan
that respawns is INDISTINGUISHABLE from an orphan nobody reaped: same command, same shape,
same parent-less look. The only thing that separates them is ELAPSED TIME, which is the
one property a `ps` snapshot does not carry. So a reap that failed this way reports as a
reap that was never attempted, and the evidence of the attempt is destroyed by the
attempt's own failure.

**Check a reap by its age, not by its absence.** After killing, re-list and read the START
TIME of anything still standing: a process younger than your kill is a respawn and your
kill hit a leaf; a process older than your kill survived and needs a harder signal. A
count of zero is good evidence; a count that recovered to the same number is the failure
wearing success's clothes, and it is the same shape as every other wrong status this file
records — two different facts that present identically, told apart only by the one reading
nobody takes.

**`node tools/waitquiet.mjs` reports what is running and is the honest instrument here**;
`ListAgents` tells you which of your own agents the harness still considers live, which is
a different question from which processes exist and should be asked as well as, never
instead of.

## Standing down (added 2026-09-10 — ORCHESTRATION's LIVENESS rule 4, in the file whose owner performs it)

**STAND-DOWN IS VERIFIED, NEVER ANNOUNCED.** Before the words "standing down": list every
task this session spawned; TaskStop each one still alive (a worker "waiting" with its work
integrated is a zombie — stop it, its worktree holds nothing); re-list and put the VERIFIED
zero into the handoff. A stand-down that leaves a live task is the map diverging from the
world — the failure every instrument here exists to refuse — and it was committed on
2026-09-10 by a session whose handoff said "nothing is owed to a worker" while one waited.

## AN ISOLATED WORKER BRANCHES FROM `origin/main`, NOT FROM THE MAIN CHECKOUT'S HEAD. PUSH BEFORE YOU SPAWN A DEPENDENT ITEM.

**Measured twice on 2026-09-14 by CONDUCT #10.** The spawn surface creates the worker's worktree from the REMOTE-tracking main, so a merge that sits only in the main checkout is invisible to a worker spawned a minute later. REC-81 started on a tree without CPDF-17's merge (it found the truth when `git diff origin/main` disagreed with `git diff HEAD`, restored six files and re-measured); COFF-10 started on a tree without COFF-9's merge and STOPPED at its first premise check, reading the brief's landing record as fabricated — correctly, from where it stood. **"Spawn first, then integrate" is right for INDEPENDENT items; for an item that depends on the one you are integrating, the order is merge → gate → PUSH → spawn**, and the brief tells the worker to `git fetch` and verify the dependency's symbol is in its tree before claiming. A worker that finds its dependency absent stops and says so — that is the LIVENESS rule 2 shape, and it is the worker being right, not the brief.
