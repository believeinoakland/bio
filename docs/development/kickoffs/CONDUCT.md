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
