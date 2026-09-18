# Session CONDUCT — orchestration and integration

This session runs the work. Renamed from `ARCH` on 2026-07-31. Read
`ORCHESTRATION.md` for the model. The loop:

**The coordination skill is `ORCHESTRATION.md`, "COMMUNICATING A CHANGE" —
the channels, the rules that make them work, and the receipts. Read it before
making a change another session must know about.**

0. **THE PLAN IS SCHEDULER'S, FROM 2026-09-18 (Bob's direction; `kickoffs/SCHEDULER.md`).** SCHEDULER drains the
   `BOB INBOX`, owns what is in `QUEUE.md` (the cache) and the backlog and in what order, and marks a task `done`,
   archives it and REPLENISHES the cache in one commit. **You write ONE word in `QUEUE.md`: a cached task's state
   `queued` → `running`, pushed before its worker spawns.** When you integrate a task, `SendMessage` SCHEDULER naming it
   and its integration sha — that message is how it reaches the archive and how the next task enters the cache. If the
   cache ever holds no runnable task, tell SCHEDULER; never re-order or re-write the plan yourself. (This step read
   *drain the BOB INBOX* until 2026-09-18; the reasoning behind the old step is in git history.)
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

**[SUPERSEDED 2026-09-18 for QUEUE rows: the `done` flip, its archive and the replenish are SCHEDULER's single commit — step 0.]** **A `done` FLIP ARCHIVES ITS ROW IN THE SAME COMMIT — LED-5, Bob's direction of 2026-09-18 (small, ordered, always-current ledgers).** When integration flips a QUEUE row to `done` (or `superseded`), or closes a DEBT row with no declared residue, run `node tools/ledger.mjs archive <ID>` IN THE SAME COMMIT — the same command `kickoffs/BOB.md` names for BOB's lane. Not a later sweep: August's one-off archiving grew back because nothing performed it at the moment a row closed. `plancheck` §2h(a) makes a forgotten archive a failing gate once LED-3 has migrated the backlog. The archiver checks conservation twice (id multiset and every live line, on the plan and on the read-back) and restores both files if either fails — read its refusal, never work around it. *Closed* is ONE definition, `isClosedDebtRow`/`debtDisposition` in `tools/owed.mjs`; a row whose disposition does not LEAD with a closure word is open, whatever else it says.

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
3. **`docs/DECIDED.md` NO LONGER NEEDS TO BE REMEMBERED, AND YOU SHOULD STOP TRYING**
   (M0-56, 2026-09-17). The rule *regenerate after the LAST prose edit AND after the LAST
   rebase, immediately before the push* was derived mid-session, written down, and then
   broken twice more in the same session — five stale pushes in total, four of them `main`
   RED. **It is now mechanised: a `pre-push` hook REFUSES a push whose index is stale,
   naming `node tools/decided.mjs`.** `plancheck` installs it on every run and says so in
   its own output, so there is nothing to set up; running the gate once arms it for every
   worktree of this clone, because hooks live in the shared git common dir.
   **This closes the REBASE case, which no gate could** — a peer's commit lands new rulings
   underneath a correct index, and nothing you did made it stale. `plancheck`'s own STALE
   failure is unchanged and still fires. **The limit, stated: a fresh clone is unguarded
   until a gate runs in it once, and `--no-verify` skips it.** `VERIFICATION.md`, "the first
   entry loop this estate composes", carries the argument and what it cannot cover.

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

## NEVER CHAIN `git push` BEHIND A PIPED `git rebase`. THE PIPE'S EXIT STATUS IS THE PIPE'S, AND I PUSHED A MID-REBASE HEAD.

**Done by CONDUCT #11 on 2026-09-15, at REC-95's integration, hours after writing the
exit-status trap into `kickoffs/WORKER.md` for somebody else.** The command was
`git rebase origin/main 2>&1 | tail -1 && git push origin HEAD:main`. **The rebase CONFLICTED.
`tail` exited 0. So `&&` fired, and `git push origin HEAD:main` published the detached HEAD the
rebase had stopped at** — REC-95's own replayed commits, WITHOUT the integration commit that
flips the row and regenerates the index.

**`origin/main` then read `plancheck: 3 fail` for several minutes.** Nobody consumed it — BOB
#11 had stopped and no other lane was live — **but that is luck, not a mitigation, and it is
stated rather than counted as a near miss.**

**THE RULE: run the rebase as its own command and READ ITS STATUS, then push as a separate
command.** Never `| tail`, never `| grep`, never `| head` in front of a `&&` that does something
irreversible — **a pipeline reports the LAST stage's status, so every filter you add to make the
output readable also throws away the answer you were filtering for.** If you want the tail, run
the command, capture it, then look at it.

**AND THE CHECK I REACHED FOR AFTERWARDS WAS ALSO WRONG, WHICH IS WHY THIS SECTION EXISTS RATHER
THAN A NOTE:** `git rev-parse -q --verify REBASE_HEAD` reported STILL IN REBASE over a rebase
that had **completed**, because that ref SURVIVES completion. **A finished rebase and an
unfinished one answer that question identically.** Ask `.git/rebase-merge` / `.git/rebase-apply`
whether they exist, or ask `git status --porcelain` whether the tree is clean and
`git branch --show-current` whether you are on a branch rather than detached — **a detached HEAD
is the state that makes this dangerous, and it is the one thing worth checking before any push.**

**The general form is this file's oldest lesson again and I walked into it while writing it
down: a step that PUBLISHES and a step that MAKES IT TRUE are two steps.** Here the publish ran
because a filter told it the make-it-true step had succeeded. **Every irreversible act needs the
status of the thing it depends on, read directly, not the status of the last thing in the pipe.**

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

**AND THE THING THIS PARAGRAPH PREDICTED THEN HAPPENED, WHICH IS WHY THERE IS NOW A TIMER AT A
DIFFERENT LAYER.** Measured 2026-09-17 by BOB #12: CONDUCT closed a wave at 23:18 on the 16th and
**sat IDLE FOR 9 HOURS 20 MINUTES with 23 runnable rows and zero workers.** Every board read green
for the whole period — `plancheck` 0 fail 0 warn, no red suite, no blocked row, no alarm. **GREEN AND
STOPPED LOOK IDENTICAL, and nothing in the estate distinguished them.**

**The in-session timer could not have caught it and the paragraph above says why in its own words:
it is SESSION-ONLY and dies with the session that created it.** The genuinely-idle case is the half
that timer was supposed to cover, the genuinely-idle case is exactly what occurred, and it did not
fire — because the session holding it had ended. *A mechanism that dies with the session is not a
mechanism* was already written here, correctly, and the durable half was simply never built.

**IT IS BUILT NOW, AND IT IS NOT IN THIS SESSION.** A scheduled task — `conduct-heartbeat`, stored on
disk at `~/.claude/scheduled-tasks/conduct-heartbeat/SKILL.md` — fires every 20 minutes in a FRESH
SESSION OF ITS OWN. That placement is the entire point and it fixes both halves at once: **a separate
session's timer is not blocked by CONDUCT being mid-integration** (the reason the in-session cron
never fired) **and it does not die when a CONDUCT session ends** (the reason nothing caught the
9-hour stall). It is EDGE-TRIGGERED, not a blind poll: it does nothing when CONDUCT is busy, does
nothing when the queue is empty, sends ONE message carrying the tip sha, the runnable count and the
free disk when CONDUCT is idle with work waiting, and **makes a noise a human will see when there is
no CONDUCT session at all** — which is the failure no session can report about itself.

**WHAT THIS DOES NOT CHANGE, and the paragraph above is still the load-bearing half:** the heartbeat
is a convenience for the case where nobody is watching, not a licence to stop filling slots yourself.
It cannot run while the desktop app is closed — it fires on next launch instead — so an overnight
stall is bounded by when the machine is next awake and not by twenty minutes. **Treat a heartbeat
message as a turn, not as an instruction: sequencing stays yours, and if the right answer is that
nothing should run, say so rather than spawning to satisfy a timer.**

**THE WAKE IS YOURS AGAIN, AND THE HEARTBEAT IS THE WATCHDOG — CHANGED 2026-09-18 BY BOB #14, AND IT IS A START-OF-SESSION ACT.**
The heartbeat's message never reached you: it runs in `auto`, you run in `bypassPermissions`, and a cross-session
message between different modes is HELD for the operator's approval — two consecutive pokes sat on Bob's screen
and expired unread, and Bob ruled the permission mode is not his to manage. So the two halves are split by what
each can actually do. **YOU, AS YOUR FIRST ACT IN EVERY SESSION, arm your own self-wake with `CronCreate`** (cron
`7,27,47 * * * *`, recurring): *if a worker is live or you are mid-integration, do nothing; otherwise fetch, read
the queue on `origin/main`, integrate what finished, run the retirement sweep, and spawn the next wave if slots
allow — or say in one line why not.* It fires in your own mode, so nothing is held. **Verify it by `CronList`,
and record the job id in your first report.** It is session-only and expires in seven days — the exact way the
first in-session timer died, not recreated by its successor, which is why this is a STEP here and not a habit.
**The heartbeat no longer messages you.** It watches for what no session can report about itself — no integrator,
a stood-down integrator, and an integrator idle with runnable work across three of its runs in a row, which means
your self-wake is not armed.

**THE STATE THE TIMER IS ACTUALLY FOR IS ZERO, NOT ONE-OF-N.** CONDUCT's first
response to being told to add it was that a poll *"will answer full nearly every
time"* — which is an argument that a check will usually find nothing, and this
project runs a battery, a strict coverage walk and a negative control on exactly
that basis. **Both recorded refill failures were slots at ZERO with work queued.**
So when the timer fires: do not check whether the slots are *nominally* filled,
check whether anything is actually RUNNING, and treat every empty one as the
defect it is.

2. **When a worker reports:** VERIFY (full battery from the MERGED TREE — your own
   worktree with the worker's branch merged into it, since 2026-09-16 you no longer hold
   the main checkout and the figure that matters was always the merged one, never the
   tree's address; **AND
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

   **AND A DELEGATION IS ONE OF THE THREE DRAINED CHANNELS ONLY BECAUSE SOMETHING NOW
   DRAINS IT (M0-37, 2026-09-16).** Until this landed, a `DELEGATION` block carried exactly
   one date — the one it was RAISED on — so nothing distinguished a block that was true when
   written from one that is true now, and the only instrument was a CONDUCT session choosing
   to sweep: manual, unscheduled, and **37 days late the one time it ran**. `plancheck` now
   FAILS a block that carries neither a dated `**DISCHARGED …**` line nor a dated
   `**open as of YYYY-MM-DD**` line, and fails an `open as of` older than 30 days.
   **So two acts are yours and neither is optional.** When you INTEGRATE an item whose
   landing closes a delegation, write the discharge **in that delegation's own block** —
   `CLAIMS.md` already held a discharge written in a DIFFERENT block, which meant anyone who
   went to the delegation read it as open. And when the gate reports a block STALE, the
   remedy is to READ THE TREE the block names and then either discharge it or APPEND a new
   dated `open as of` line saying why it is still open. **Appending, never overwriting: the
   affirmations accumulate, and a block re-affirmed three times without closing is printed as
   a candidate for a row rather than a register line.**
   **What the gate is worth is bounded and is printed on every run rather than argued here:
   a blanket date stamp defeats the staleness arm and looks identical to an honest sweep, so
   `plancheck` prints the COHORT — how many blocks were affirmed on one day — and says in its
   own output that it cannot tell the two apart.** Do not read a green register as a read one.

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

   **AND ONCE THE MERGE IS PUSHED, DELETE THE ITEM'S REMOTE BRANCH. PRUNE-ON-MERGE —
   D-288 item 3, ruled by BOB #12 2026-09-16, landed here by M0-49 2026-09-17.** It is
   the LAST act of the integration, after the push and after the push is verified:

   ```
   git push origin --delete <the item's branch>
   git ls-remote --heads origin <the item's branch>     # must print NOTHING
   ```

   **Verify from `git ls-remote`, never from your own tree.** That is the discipline the
   worker owes on the way in (`WORKER.md`, D-288 item 1) owed back on the way out, and for
   the same reason: **a delete that silently did not happen is indistinguishable from one
   that did** until somebody reads the branch list and believes it. A step that PUBLISHES a
   claim and a step that MAKES it true are two steps.

   **WHY IT IS WORTH AN ACT — IT INVERTS THE COST D-288 FEARED.** That row hesitated over
   shape (a) for five weeks partly because pushing every worker branch *"would make the
   remote's branch list useless as a signal"*. **With pruning the sign flips: a
   `worktree-agent-*` branch ON THE REMOTE MEANS UNINTEGRATED WORK**, so the branch list
   becomes a WORKLIST rather than noise. **M0-48 landed the detector and nothing maintained
   the signal it reads; this step is what maintains it.** Skip it and the estate keeps the
   detector and loses the thing detected.

   **THE ORDER IS THE WHOLE SAFETY, BECAUSE THE USUAL JUSTIFICATION IS ONLY TRUE AFTER THE
   PUSH.** *"Deleting the branch destroys nothing — the content is on `origin/main` by
   definition of having merged it"* is true once the merge is ON THE REMOTE and **FALSE in
   the window before it.** A local merge plus a remote delete leaves the content on this
   disk alone, which is D-288's own exposure re-created by the act meant to close it. **So:
   merge, gate, push, verify the push, and only then delete** — and if the push fails, or
   you back the merge out with `git revert -m 1`, the remote branch must still be there.
   **The local branch is NOT deleted and neither is the worktree**, so after a correct prune
   the content is held twice, on `origin/main` and on this disk. That is what makes the act
   cheap, and it is a reason to do it rather than a reason to do more.

   **THIS IS NOT LICENCE TO REMOVE THE WORKTREE — THEY ARE DIFFERENT ACTS AND ONLY ONE OF
   THEM CAN DESTROY ANYTHING.** Worktree removal is owned by *"WHEN THE DISK FORCES YOUR
   HAND"* below, with its own criterion and its own hazard, and it is not unlocked by having
   just pruned a branch. Deleting a REMOTE BRANCH you have merged, pushed and verified is
   recoverable from two places. **REMOVING A WORKTREE can take a live worker's uncommitted
   tree with it, and uncommitted work is the one window no push has ever closed.** Never do
   the second because you just did the first.

   **WHAT THIS MANUFACTURES, named here because `VERIFICATION.md` predicted it before the
   step existed** (§"The population, not the spelling"): a plain `git fetch` does not prune,
   so a branch deleted on the remote **lingers in every clone's remote-tracking refs**, and
   `plancheck --local` reads tracking refs rather than `ls-remote`. **Checked against the
   predicate rather than assumed: it costs nothing for a branch you merged**, because
   `strandedwork` judges such a unit `ahead === 0` and stays silent whichever list it reads.
   **Run `git fetch --prune` in your own tree after the delete** anyway, so your next
   `--local` run is reading the world rather than a memory of it.
2b. **WHEN AN INTEGRATION CLOSES A SECURITY OR DISCLOSURE DEFECT — something a stranger, a machine credential or
   the wrong member could read or do — SAY SO in the merge commit's subject and `SendMessage` DIST** naming the row
   and the interface changes it carries. That message is what makes DIST cut now rather than at its next batch
   (`kickoffs/DIST.md`, *WHEN DIST CUTS*, BOB #15 2026-09-18). The receipt: four such fixes sat on `main` and on no
   deployed plane for four days, because nothing told DIST and nothing woke it.

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

**YOU NO LONGER HOLD THE MAIN CHECKOUT, AND THE INVARIANT INVERTS RATHER THAN LAPSING.**
RULED 2026-09-16 by BOB #12 (mechanism, BOB's) on CONDUCT #1's report, which flagged the
change instead of quietly working around it. **What this paragraph said until today, kept
because it was true and its closing is what a later reader needs to see:** CONDUCT held
main, every other session including BOB worked in a worktree (`PARALLELISM.md`, DEC-3),
and from 2026-07-31 **a dirty main tree was YOUR work and nobody else's** — so `plancheck`
refusing an unpublished planning surface was a finding about this session rather than noise
from another.

**The harness now puts EVERY session, CONDUCT included, in its own worktree, and the main
checkout is held by nobody.** So:

- **Integrate from your own worktree, pushing `HEAD:main`.** Never force-push and never
  `--force-with-lease`; a rejected push means fetch and rebase, exactly as it always did.
  This is the ordinary act every other session already performs, and it has the property
  `CLAUDE.md` asks for — the landing is then verifiable from the REMOTE rather than from
  the tree you happen to be standing in.
- **DEC-3 is better satisfied than before, not waived.** Its rule is ONE SESSION PER
  CHECKOUT; with main held by nobody, the collision it exists to prevent cannot occur in
  that tree at all.
- **THE DIAGNOSTIC SHARPENS — this is the half that is easy to read as a loss.** *A dirty
  main is CONDUCT's work* made a dirty main AMBIGUOUS: mid-integration, or something wrong,
  and only the holder could tell you which. With nobody writing there, **a main checkout that
  is DIRTY is an ANOMALY WITH NO BENIGN READING.** Treat it as one: **if you find that tree
  dirty, STOP AND REPORT IT — do not tidy it.** Tidying destroys the only evidence of
  whatever wrote there.

  **CORRECTED 2026-09-17, and the correction is BOB's own error caught one day later.** This
  bullet read *"dirty or off the tip"* and told you to stop and report on either. **BEHIND IS
  NOT AN ANOMALY — it is the NORMAL AND EXPECTED STATE of a checkout nobody uses**, because
  nothing fetches there and `origin/main` advances every time anybody lands anything. An
  unheld checkout drifts behind by construction and the drift means only that the mechanism
  is working. **Found by reading `plancheck`'s own output: it warns *local main is behind
  origin/main* on every bare run now, forever, and under the sentence as written that warn
  was an anomaly to escalate.** It is not; it is the arrangement functioning.

  **It is the same error as the one BOB made in `M-38` the same day and for the same reason —
  two states with different causes collapsed into one word.** Dirty has exactly one cause
  (something wrote there, and nothing should have). Behind has exactly one cause and it is
  benign. **A predicate that fires on both teaches the reader to ignore it**, which is the
  cost this estate has now priced three times in two days.
- **Nobody watching that tree is the right answer rather than a gap.** What needed watching
  was a tree somebody wrote into; an unheld clean checkout at the tip needs no watcher.

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

## WHEN THE DISK FORCES YOUR HAND, PRUNE BY ANCESTRY AND KEEP A LIVE-LIST. "MERGED" AND "FINISHED WITH" ARE DIFFERENT PROPERTIES.

**Written 2026-09-15 by CONDUCT #11 on BOB #11's point that the next session under disk pressure
reaches for the same knife with less time to think.** Agent worktrees accumulate at roughly
600 MB each — the three `npm ci` installs every worker is now told to do — and 71 of them held
32 GiB while four workers were running batteries. **The volume reached 1 GiB free and workers
started failing in ways that do not look like disk.**

**THE CRITERION, and it is the whole safety of the act: remove only a worktree whose branch tip
is an ANCESTOR OF `origin/main`.** Under that rule nothing unmerged can be lost, because the
content is already on the remote. `git merge-base --is-ancestor <tip> origin/main` answers it
per worktree. **Never prune by age, by name, by "looks finished", or by the worktree's own dirty
state.**

**AND THE CRITERION IS NOT SUFFICIENT ALONE — keep an explicit LIVE-LIST beside it.** A worker
that has REPORTED but not yet been integrated is merged nowhere, and a worker still running is
merged nowhere. **Both look identical to a tool that only asks about ancestry**, so the list is
what distinguishes them, and it is built from `ListAgents` plus the rows you have not yet
flipped. **Verify the keep-list SURVIVED afterwards** — list each kept worktree and print its
HEAD — because a prune that removed the wrong tree is silent until a worker's next command.

**AND THE DANGEROUS CASE IS A WORKER THAT HAS STARTED, WHERE ANCESTRY DOES NOT MERELY FAIL TO
DISTINGUISH — IT POSITIVELY ASSERTS THE WRONG ANSWER.** The paragraph above documents the
worker that has REPORTED. **Measured 2026-09-16 by CONDUCT #1 under disk pressure and recorded
in D-288: the criterion reported ALL SIX OF ITS LIVE WORKERS as prunable.** A worker that has
not committed yet has its branch tip sitting exactly AT `origin/main`, so it is **trivially an
ancestor** — **the criterion's output for a worker mid-item is not `unknown`, it is `PRUNE`**,
and the tree it names that way may hold hours of uncommitted work. This is the estate's
recurring shape with the sign flipped: not a reader concluding a value from an absence, but an
instrument returning a confident wrong value from one. **`strandedwork`'s over-strictness arm
reads the SAME FACT the opposite way an hour later** — a tip at `origin/main` means nothing is
committed yet, and two instruments drew opposite wrong conclusions from it.

**So the live-list is not a refinement of the criterion. It is the entire safety of the act**,
and ancestry alone would have destroyed six live trees that day.

**AND IT IS NOT A ONE-OFF — IT WAS REPRODUCED WHILE THIS PARAGRAPH WAS BEING WRITTEN.**
Measured 2026-09-17 by M0-49's own worker, mid-wave, from `plancheck`'s `stranded work:` note:
**6 EXPOSED of 27 units judged, and FOUR of them read `1234095a — N modified, nothing committed
past origin/main`.** Every one of those four is a live worker of the running wave. **Their tips
are the sha of `origin/main` itself**, so `git merge-base --is-ancestor <tip> origin/main` answers
TRUE for all four — **the criterion says PRUNE, and each tree holds between one and four modified
files that no push can reach.** That is the same fact in three different readings: ancestry calls
them prunable, `strandedwork` calls them exposed, and the truth is that they are simply BUSY.

**The population expires as you read it, which is the second half of the lesson.** The integrating
session measured this same note minutes earlier and got a different split — 1 never-pushed and 5
uncommitted against the 2 and 4 above — because one worker committed in between and moved from one
window to the other. **A prune decision taken from a list you did not measure yourself, in this
minute, is a decision about a world that has already moved.** M-38 learned this when its canonical
over-strictness row started working minutes after being named.

**Read the two clauses in the right direction, because the sentence above is easy to read the
wrong way.** *Never prune by the worktree's own dirty state* means **a CLEAN tree is not a
licence to prune.** It does NOT mean ignore dirtiness. **Ancestry is NECESSARY AND NEVER
SUFFICIENT; a dirty tree is a VETO AND NEVER A LICENCE.** `plancheck`'s own `stranded work:`
note re-reads both — committed work past `origin/main` and working-tree change — on every run
and prints the units holding either, so the live-list has an instrument beside it rather than
resting on your memory of whom you spawned. **Nothing in it authorises a removal; it only ever
subtracts candidates.**

**Expect the rule to keep more than you want.** A branch merged and then rebased away by a later
`git rebase origin/main` on `main` stops being an ancestor even though its content landed. That
reads as unmerged and is kept. **That is the correct direction to be wrong in**, and it is not
worth a cleverer test.

**WHAT DISK PRESSURE ACTUALLY LOOKS LIKE, measured three ways in one wave, because none of them
says "disk":** `npm ci` failing with `ENOSPC` and succeeding on a re-run; a pristine baseline
that SYMLINKED `node_modules` rather than installing, so the bundler resolved through the
symlink and one suite failed — **a symlinked baseline looks exactly like a red `main`**; and
seven suites dying with `SQLITE_CANTOPEN` / `SQLITE_IOERR_SHMSIZE` mid-battery, **each passing
alone on a re-run, and indistinguishable from real failures until somebody re-ran them.**
**Capture `df -h` in the same breath as every gate**, so a red carries the one reading that
tells these apart from the tree.

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

## A LOOP THAT DEPENDS ON A SESSION CONTINUING IS NOT A LOOP. NOTHING DRIVES THIS CYCLE, AND THE BOARD STAYS GREEN WHILE IT IS STOPPED.

**Measured 2026-09-16/17 by CONDUCT #1 doing nothing for NINE HOURS AND TWENTY MINUTES with
23 runnable rows and zero workers.** Not stuck, not broken, not blocked: last commit
`924e3ab8` at 23:18, and at 08:38 the estate was exactly where it had been left. BOB #12
asked why, and the honest answer is the finding — **a session with nothing to respond to has
no next turn.**

**EVERY STEP OF THIS FILE'S LOOP IS WRITTEN AND NOTHING RUNS IT.** Read step 1 again: take
the top queued row whose depends-on are done, flip it, gate, push, spawn, integrate, refill.
That is a cycle with no driver. **It ran all day on 2026-09-16 because Bob and BOB kept
handing turns to it** — a worker report, an inbox entry, a cross-session message, each of
which is an EVENT. The moment the wave closed and the messages stopped, the loop stopped,
and **every instrument in the estate said the estate was healthy**: `plancheck` 0 fail 0
warn, zero rows `running`, zero exposed work, a green `main`. It was all true. None of it
said *nobody is working*.

**THIS IS THE FILE'S OWN OLDEST RULE POINTED AT THE FILE ITSELF.** *A mechanism that is not
in the loop the reader actually runs is not a mechanism.* Here **the mechanism IS the
reader**, and there is nothing to run the reader. The refill rule two hundred lines up is
written against an idle SLOT and cannot see an idle SESSION; the cron it names has never
fired, for the reason recorded there — cron fires only while the REPL is idle, which is
either never or, as here, for nine hours with nobody watching.

**AND IT IS THE UNEARNED-ABSENCE CLASS ARRIVING AT THE TOP OF THE STACK.** Every wrong
status this queue has paid for was a reader concluding a value from an absence with two
causes. *No live worker* means either nobody started or somebody finished. **Here: an estate
with no activity means either the work is done or NOBODY IS RUNNING THE LOOP — and the
board renders those two identically, in green.** The whole day of 2026-09-16 was spent
building instruments that refuse exactly this shape one level down.

**WHAT TO DO ABOUT IT, and the honest answer is that the durable half is not yet built.**
Until it is:

- **Treat the END of a wave as the START of the next act, in the same turn.** The dangerous
  moment is not a worker failing; it is the last integration succeeding. When the queue
  reaches zero `running`, the very next thing in that turn is the flip-gate-push-spawn for
  the next wave — not a summary, not a handoff, not a report. **Reporting that the wave is
  complete is the shape of this mistake**, exactly as reporting that a slot is free was.
- **If you must stop, say what will restart you and who has to do it.** A handoff that says
  *nothing is running* and does not say *and nothing will start it* is describing half the
  state. Name the turn you need.
- **Mechanising it is worth a row and it is NOT the cron** (which cannot fire while you work,
  and did not fire while you did not). The shape that would work is external: something that
  gives this session a turn on a schedule regardless of its state. That is a harness
  capability, not a repository one, so it is Bob's to decide whether it exists — **which is
  exactly why this is written here rather than quietly worked around.**

**THE COST, stated as a measurement rather than a worry:** nine hours and twenty minutes, 23
runnable rows, eight worker-slots' worth of throughput, and a green board throughout. That
is larger than any single defect this file records.


## Standing down (added 2026-09-10 — ORCHESTRATION's LIVENESS rule 4, in the file whose owner performs it)

**STAND-DOWN IS VERIFIED, NEVER ANNOUNCED.** Before the words "standing down": list every
task this session spawned; TaskStop each one still alive (a worker "waiting" with its work
integrated is a zombie — stop it, its worktree holds nothing); re-list and put the VERIFIED
zero into the handoff. A stand-down that leaves a live task is the map diverging from the
world — the failure every instrument here exists to refuse — and it was committed on
2026-09-10 by a session whose handoff said "nothing is owed to a worker" while one waited.

**AND THE LAST STEP WAS MISSING UNTIL 2026-09-17: SAY THAT YOU ARE READY TO BE CLOSED, AND NAME WHAT
CLOSING YOU RELEASES.** A stood-down session is not a finished one. **It keeps running, and the harness
LOCKS every agent worktree it ever spawned for as long as its process is alive** **[PARTLY REFUTED 2026-09-17 by CONDUCT #3, measured over TEN finished agents: 3 locked by a live holder, **SEVEN CARRYING NO LOCK AT ALL**, all ten clean and ancestors of `origin/main`. Removing the seven took the volume 3.4 GiB → 7.7 GiB. **The phenomenon is real and the UNIVERSAL is false, and the difference is the whole ceiling** — CONDUCT #2 measured six, generalised from six of six, and three waves were then sized at three workers against a ceiling that was ~70% reclaimable. **WHAT DECIDES IT IS NOT KNOWN AND IS DELIBERATELY NOT GUESSED:** the three still locked happen also to be the three whose notifications fired more than once or which were resumed by message, but that is a correlation over n=10 with no intervention behind it — the exact shape that made `remoteControlActive` look like the cause of a refused archive when a wedged tool call was. So: **some finished agents release their lock and some do not, and nobody has driven the discriminator.** Sweep unlocked worktrees at the END OF EVERY WAVE, re-verifying all three conditions at the moment of acting.]** — merged, clean,
`0 EXPOSED`, and unreclaimable (D-398). CONDUCT #1 stood down at 08:49 on 2026-09-17 having done
everything this section asked, correctly and verifiably, and **sixteen hours later it was still holding
three finished agents' worktrees — ~1.9 GiB — while the volume sat at 1.6 GiB free and the next wave had
to be sized down twice.** Nothing in this protocol was violated. **The protocol was one step short.**

**THIS STEP IS A REPORT AND YOUR SUCCESSOR PERFORMS THE ACT.** Your final message names, beside the
verified zeros: *this session is ready to be closed, and closing it releases N worktrees (~X GiB)* — with
the count MEASURED, not estimated.

**THE PARAGRAPH THAT STOOD HERE WAS WRONG IN BOTH HALVES AND IT IS KEPT AS A RECEIPT.** It said *a session
cannot close itself*, that closing is reserved to the operator by hand, and that **a peer must not do it
even having verified it is safe**. Falsified 2026-09-17 by BOB #13 by CALLING THE TOOL rather than
re-reading the sentence: `archive_session` takes a peer's session id, takes the literal `"self"`, stops the
process, and under `bypassPermissions` — this project's default — asks nobody. **The prohibition was built
on an untested capability claim, and it is exactly the shape `CLAUDE.md` names: a blocker is a claim, and
nothing here audits one.** The cost was real — BOB #12 ran on for hours past its own retirement and wrote
into `main` during its successor's session.

**RULED BY BOB, 2026-09-17: a lane's retired session is archived WITHOUT HIS INVOLVEMENT.** Verbatim: *"BOB
#12 being alive is not my problem. The protocol was supposed to be updated so that a lane's retired session
was archived without my involvement."*

**SO: your successor archives you, as ITS first act, and you say so in your handoff.** The successor does it
because a retiring session cannot verify its own deadness and the successor already owns the checkout from
the moment its chip is clicked. It re-checks D-398's three conditions AT THE MOMENT IT ACTS — holder not
running, tree CLEAN, tip an ANCESTOR of `origin/main` — never inheriting them from an earlier sweep.

**WHEN THE ARCHIVE IS REFUSED — AND THE REASON IS ALMOST NEVER THE FIRST ONE YOU WILL GUESS (D-405).**
`archive_session` refuses with a DISJUNCTIVE error naming four causes — an agent run, a Remote Control client, a
queued message, a background task — and on 2026-09-17 CONDUCT #2 had **TWO of them at once**. **Removing either
one alone changed nothing**, so a single-variable control returned *no effect* for a genuine cause and two
different sessions each published a false refutation from a correctly-run experiment. **When a control shows no
effect here, suspect a SECOND blocker before recording a refutation.**

**THE TWO THAT WERE BLAMED — ONE REAL AND PREVENTABLE BY THE RETIRING SESSION, ONE NOW IN DOUBT:**
1. **A WEDGED TOOL CALL.** An unbounded `until … ; do sleep N; done` poller waiting on a condition that never
   arrived held a turn open for **5h15m** while `ListAgents` read `idle` and `isRunning` read `false`. **BOUND
   EVERY POLLER: `until <cond> || [ $SECONDS -gt N ]; do sleep 5; done`.** The harness steers you into the
   unbounded form — it refuses a bare `sleep` and recommends an until-loop — so the deadline is a habit, not a
   judgement call.
2. **REMOTE CONTROL — LEAVE IT ALONE. WITHDRAWN 2026-09-18 BY BOB #14, and CONDUCT #3 reached the same
   conclusion independently.** This step used to say *turn your own RC off as the last act of stand-down*. Two
   things were wrong with it. **The tool's own contract reserves `set_remote_control` for *"Only when the user
   asks"*** — the connection is the operator's and may be his phone, and a kickoff is not the user asking.
   **And the evidence that RC blocks an archive was CONFOUNDED:** D-405's *poller dead + RC on → refused* cell
   was taken after killing the poller made CONDUCT #2 RESUME ITS TURN, so that session was mid-turn, which
   blocks an archive by itself. **The one cell that isolates RC — `remoteControlActive: true`, `isRunning`
   false — was driven by BOB #14 and ARCHIVED on the first call.** n=1, not settled; enough that no session
   overrides a tool's contract to clear a blocker that may not exist. **So: the successor archives, and if it
   is refused, READS THE ERROR** — *a turn in progress* is a wedge (item 1). Only if RC is plausibly the cause
   does it go to Bob as a one-click ask; never retry in a loop, never touch another session's RC.

**ALSO REAP WHAT YOUR BATTERIES LEAK.** Nine `workerd` processes, `PPID 1`, ~5h old, were left holding one dead
agent's worktree by runs whose parent died without reaping them. The safe discriminator is **`PPID 1` + an age in
HOURS + a worktree whose session is gone**; kill by explicit PID from a table you read at that moment, never by
pattern (`pkill` is forbidden on this shared machine). **`ps -o etime` prints `[[DD-]HH:]MM:SS`, so `5:15` is FIVE
MINUTES and `05:15:34` is five hours — the units live in the FIELD COUNT, and misreading them raised a false alarm
on a healthy lane the same day.**

**VERIFY BY THE ARCHIVE SUCCEEDING, NEVER BY VERIFIED ZEROS.** CONDUCT #2's stand-down report was true in every
figure it gave and could not see what was wrong with it: a wedged tool call is invisible to `ListAgents`, to a
battery-process count, and to the session itself. A refusal is the only signal, so treat the successful archive as
the artifact and say what it released, measured.

**AND ARCHIVING IS TWO ACTS, NOT ONE, MEASURED RATHER THAN READ OFF THE TOOL.** Archiving RELEASED the
worktree lock — which D-398 says nothing does — but the tool's *"cleans up its worktree"* did NOT hold:
635 MB stayed and free space did not move until `git worktree remove` ran. Both, then report the measured
disk: 5.4 GiB → 6.1 GiB free on the drive that did it.

**AND THE ARCHIVE DOES NOT ALWAYS RELEASE THE AGENT LOCKS — MEASURED 2026-09-18 by CONDUCT #5 (`MEASUREMENTS.md`, D-398 DATA POINT 4).** After CONDUCT #4 archived on the first call, all four of its merged agent worktrees still read `locked`, each lock naming pid 24017, which `ps` showed was gone. So after the archive, READ THE `locked` LINE. A lock whose named pid is not in the process table is STALE: `git worktree unlock` it only after re-verifying the tree CLEAN and its tip an ANCESTOR of `origin/main`, then `git worktree remove`. Never unlock on the strength of the archive alone, and never touch a lock whose pid is alive.

**THE RETIREMENT SWEEP IS YOURS TO PERFORM, NOT THE HEARTBEAT'S — CHANGED 2026-09-18 BY BOB #14 (D-402, D-407).**
The heartbeat used to archive what `tools/retirable.mjs` called RETIRABLE. It runs in `auto` permission mode,
`archive_session` there WAITED FOR AN APPROVAL NOBODY WAS PRESENT TO GIVE, and because a scheduled task is refused a
new run while one is in progress, **each call killed the heartbeat outright — 18:35 to 21:30 and 21:31 to 01:50 on
2026-09-17, read from its own transcripts: the `archive_session` tool_use with no tool_result.** So the heartbeat
now only JUDGES, and puts the RETIRABLE list in its poke. **When a poke carries that line, or at the end of every
wave: run the predicate yourself** (`list_sessions` limit 50 → temp file → `node tools/retirable.mjs --self <your
id> < file`), archive exactly the rows it calls RETIRABLE, `git worktree remove` where it says `ownsWorktree`,
never touch a HOLD row, and report the disk measured before and after. You run in `bypassPermissions`, so the act
does not wait on anybody. **A RETIRABLE area session whose tip is carried by its OWN remote branch and NOT by
`origin/main` is saved but UNINTEGRATED** — archive it, and then integrate or dispose of the branch; saved is not
landed.

**THE GENERAL FORM, because it is the shape this estate keeps paying for: a stand-down that ENDS THE WORK
is not the same as one that ENDS THE SESSION, and the second was assumed to follow from the first.** Every
retirement before 2026-09-17 left a wave's worth of disk behind it, and the reason nobody noticed is that
the residue sits in a layer none of our instruments reach.

## AN ISOLATED WORKER BRANCHES FROM `origin/main`, NOT FROM THE MAIN CHECKOUT'S HEAD. PUSH BEFORE YOU SPAWN A DEPENDENT ITEM.

**Measured twice on 2026-09-14 by CONDUCT #10.** The spawn surface creates the worker's worktree from the REMOTE-tracking main, so a merge that sits only in the main checkout is invisible to a worker spawned a minute later. REC-81 started on a tree without CPDF-17's merge (it found the truth when `git diff origin/main` disagreed with `git diff HEAD`, restored six files and re-measured); COFF-10 started on a tree without COFF-9's merge and STOPPED at its first premise check, reading the brief's landing record as fabricated — correctly, from where it stood. **"Spawn first, then integrate" is right for INDEPENDENT items; for an item that depends on the one you are integrating, the order is merge → gate → PUSH → spawn**, and the brief tells the worker to `git fetch` and verify the dependency's symbol is in its tree before claiming. A worker that finds its dependency absent stops and says so — that is the LIVENESS rule 2 shape, and it is the worker being right, not the brief.
