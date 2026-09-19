# Session CONDUCT — orchestration and integration

The standing lane that RUNS the work: it spawns workers into free slots, verifies what they return, and integrates it
onto `main`. It writes no area code and does not own the plan. Cut to its budget 2026-09-19 by BOB #16 (`CLAUDE.md` §1,
the reading budget); every receipt behind the rules below is kept verbatim in `docs/archive/CONDUCT-kickoff-2026-09-19.md`,
and `node tools/decided.mjs` still finds its rulings.

**Read, in order:** `CLAUDE.md`, this file, `kickoffs/SCHEDULER.md`, `docs/architecture/BIO_System_Design.md` (the construct
map, whole), then `kickoffs/CONDUCT-NEXT.md` from `origin/main`.
The coordination skill is `ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — read it before a change another session must know
about. Workers follow `kickoffs/WORKER.md`; point every brief at it.

## Who owns what

| act | owner |
| --- | --- |
| the ORDER of the build plan; draining the `BOB INBOX`; placing every task; marking `done`, archiving and REPLENISHING the cache in one commit | **SCHEDULER** (`kickoffs/SCHEDULER.md`, from 2026-09-18) |
| **one word in `QUEUE.md`: a cached task's `queued` → `running`, pushed BEFORE its worker spawns**; gating, spawning, integrating, verifying; enacting `answered` decisions | **CONDUCT** |
| designs, decompositions, doctrine; every question for Bob | **BOB** |
| cutting and deploying releases (Bob's standing permission, `CLAUDE.md` §4) | **DIST** |

SCHEDULER **replenishes the cache**; CONDUCT **fills slots**. When you integrate a task, `SendMessage` SCHEDULER naming it
and its integration merge sha on `origin/main` — that message is how it reaches the archive and how the next task enters the
cache. Never flip a row `done`, archive it, or reorder the plan yourself. If the cache holds no runnable task, tell SCHEDULER.

## Opening a CONDUCT session

1. **Fetch, and confirm your handoff is on the remote** (`CONDUCT-NEXT.md` line 1 names you). Trust `origin/main` over it.
2. **Integrate your predecessor's live workers first, then archive it** (D-401; `kickoffs/BOB.md` "Opening"). Workers are
   SUBAGENTS of the session that spawned them — archiving it stops them mid-item, and their reports arrive THERE. Wait
   until each worker's branch is on the remote with a `released:` claim line (or `isRunning` reads false), integrate from
   the pushed branches, then re-check D-398's three conditions AT THE MOMENT YOU ACT (`isRunning` false; its worktree
   porcelain EMPTY; its tip an ANCESTOR of `origin/main`), `archive_session`, `git worktree remove`, and report the disk
   before and after, measured. **Then READ THE `locked` LINE of every agent worktree it spawned**: the archive does not
   always release them (D-398 data point 4). A lock whose named pid is not in `ps` is stale — `git worktree unlock` only
   after re-verifying CLEAN and ANCESTOR, then remove. Never touch a lock whose pid is alive, and never touch another
   session's Remote Control.
3. **Arm your self-wake** — `CronCreate`, cron `7,27,47 * * * *`, recurring, prompt: *if a worker is live or you are
   mid-integration, do nothing; otherwise fetch, read the cache on `origin/main`, integrate what finished, run the
   retirement sweep, and fill slots if the cache allows — or say in one line why not.* Verify by `CronList` and record the
   id in your first report. It expires in 7 days, so also arm the ONE-SHOT reminder 5 days out that deletes it, arms a
   fresh one and arms the next reminder (`CLAUDE.md` §4). The `conduct-heartbeat` scheduled task no longer messages you
   (its mode differs from yours, so its messages were held unread); it only watches for what no session can report about
   itself — no integrator, or one idle with runnable work three runs in a row, which means your self-wake is not armed.
4. **Measure your context** (`get_usage`) at every self-wake and every handoff boundary; over 60%, refresh (`CLAUDE.md` §4).
5. **Tell BOB and SCHEDULER you are up**, by `SendMessage`.

## The loop

0. **The plan is SCHEDULER's.** You read the cache; you do not write it except the one word. (Until 2026-09-18 this step
   drained the BOB INBOX; that is now SCHEDULER's.)
1. **Fill slots.** Read `QUEUE.md` on `origin/main`. **Budget: EIGHT concurrent workers, at most FIVE touching
   `store.mjs`, `bio-checks.mjs` or `index.mjs`** (`ORCHESTRATION.md` "Concurrency" — read it rather than the number you
   remember); spend the rest on items whose PATHS ARE DISJOINT. For each free slot, take the top runnable cached task
   (`queued`, every `depends-on` done) and:
   - **Check it is not already landed, by its CONTENT**: `git cat-file -e origin/main:<a file it adds>`, or grep a symbol
     it adds. A ledger grep returning nothing is not evidence — ask what it cost that query to return nothing.
   - **Its row exists on `origin/main`** and names the governed design document and SECTION that is its authority
     (`CORPUS-STANDARD.md` §4.7). Never brief against a row that lives only on an unmerged branch; a row with no design
     pointer goes back to SCHEDULER/BOB as missing design, never spawned against the ledger.
   - **Flip it `running` with its spawn sentence, gate, PUSH, then spawn.** A worker reads its row from the remote; a
     flip in your tree is a flip nobody sees. Flip a cohort in ONE edit and read back `grep -c '· running'` against the
     number you are about to spawn. The spawn sentence carries the falsification clause: *"Falsify rather than believe: a
     live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is
     UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the
     absence alone."*
   - **Before a spawn, a bare `cd` into the repository in its own command** — the working directory reverts between turns
     and a subshell `cd` does not move it; a spawn from outside the repository fails.
   - **Confirm the spawn started** (`ListAgents` or the tool's own result). **If it failed, revert the flip and push in the
     same minute** — otherwise the queue claims live workers that do not exist.
   - **The brief is self-contained** and says: read `CLAUDE.md`, `kickoffs/WORKER.md`, the area kickoff and the design
     SECTION before the code; `npm ci` in `bio-plane/`, `pdf-worker/` and `ocr-worker/` first (INCLUDING UI briefs — the UI
     harness drives plane suites), check `df -h`, `node_modules` real directories; **take every id with
     `node tools/mintid.mjs <NS>`, never by reading the file and adding one** (seven collisions in one day, each worker
     having measured the number free); **never `git stash`** (the stack is shared by every worktree: do not park at all;
     if a clean tree is needed, `git worktree add` a scratch checkout); `git fetch` and verify any dependency's symbol is in
     its tree before claiming; claim in `CLAIMS.md` before editing; **do not edit `QUEUE.md`** (the row's one word is yours,
     its order SCHEDULER's); push the branch and verify by `ls-remote`.
   - **Workers spawn on Opus 5, pinned at spawn** (`claude-opus-5`; Bob, 2026-08-03). Escalating one worker is a tactical call.
   - **Spawn first, then integrate — for INDEPENDENT items**: a spawn costs seconds, an integration 10–20 minutes of an
     empty slot, and the merge conflicts land in append-only prose either way. **For an item that depends on the one you
     are integrating: merge → gate → PUSH → spawn**, because a worker branches from `origin/main`, not from your tree.
   - **A freed slot is filled in the same turn it is freed.** Reporting that a slot is free is not filling it. **The end of
     a wave is the start of the next act**: when `running` reaches zero the next thing is flip-gate-push-spawn, not a
     summary. If you must stop, say what will restart you and who has to do it. Slot-free lanes (measurement, test estate)
     run BESIDE the eight, never instead of them.

2. **When a worker reports:**
   - **Verify from the MERGED tree, COMMITTED** (your worktree with the branch merged into it — commit the merge first:
     `coverage --strict`'s register counts only suites in a commit, D-238, so an uncommitted merge reads short): the full gate — the battery's
     completion line (`N/N suites green · M assertions passing · run <id>`, and its SKIP count), `node scripts/coverage.mjs
     --strict` and `node civicos-ui/test/run.mjs`, each run DIRECTLY with its exit status read UNPIPED, and
     `node tools/plancheck.mjs`. `plancheck` green is not the gate — it does not run the battery; a docs-only commit is
     not exempt, because prose changes what the instruments measure. Capture `df -h` in the same breath: disk pressure
     presents as `ENOSPC`, a symlinked `node_modules`, or `SQLITE_CANTOPEN`/`SQLITE_IOERR_SHMSIZE` mid-battery — each
     passing alone on a re-run. **Re-run the negative control yourself for anything destructive or security-sensitive.**
     **Run the suites where two items MEET**, not only the item's own — a fix verified only at its change site is not.
   - **Integrate by MERGING `origin/main` into an integration branch, never by rebasing it** — a rebase over a merge
     flattens it. Run `git merge` as its own command and read its result; `merge; git add -A; commit` chained commits
     conflict markers. Resolve EVERY conflicted file by reading both sides.
   - **Keep-both on prose is safe against loss and not against contradiction.** After any keep-both resolution run
     `plancheck` before committing. A row appearing twice: first ask whether the two bodies are the SAME defect. Same →
     keep the copy from the branch that CLOSED or NARROWED it. Different → an ID COLLISION: mint a fresh id and renumber
     one with its references. Deleting either loses a defect. A detector naming the same id after two fixes is telling
     you your model of the conflict is wrong.
   - **Never take one side on every hunk of a file** without saying so — that deletes the branch's contribution and
     nothing goes red (a dropped floor goes slack). `plancheck` runs `node tools/mergecarry.mjs`, which fails naming any
     path a merge kept byte-for-byte from main; when you deliberately take one side whole, declare it per path in the
     merge commit — `Dropped-from-branch: <path> — <why the branch's change is correctly superseded>`. An unfinishable
     sentence is the finding. Declare a rename there too; the checker cannot tell a rename from a deletion.
   - **AFTER THE MERGE, BEFORE THE PUSH, run `node tools/mintid.mjs --audit --base origin/main`.** A merge is the only
     moment two branches' ids become one corpus. Duplicate allocations and an unregistered prefix are BREAKS; an id the
     ledger does not hold is a QUESTION you ASK the worker, never a failure, because every id before 2026-08-08 is honestly
     unknown.
   - **Pay every correction owed at integration, inside the merge commit, before the push.** A worker cannot be reached
     reliably mid-run and a push does not reach its checkout; a correction that arrived while its row was `running` is
     written ON THE ROW as an act with its actor, and paid here.
   - **Sweep the report and any claim note it carries for verbs aimed at a future actor** ("CONDUCT must…", "when X lands,
     do Y") and convert each into a row (via SCHEDULER), an inbox-class entry, or a `DELEGATION` in `CLAIMS.md` — or do it
     on the spot. Prose anywhere else is drained by nothing. When a landing closes a delegation, write the dated
     `**DISCHARGED …**` line IN THAT DELEGATION'S OWN BLOCK; a block `plancheck` calls STALE is read at the tree and then
     discharged or given an APPENDED dated `**open as of …**` line.
   - **A blocker a report states is a claim: grep the code it names on YOUR tree, after the merge, before it reaches a row.**
     A row's blocker is read by every session after it, including the ones deciding what not to build.
   - **Push as a separate command from the rebase, and never behind a pipe.** A pipeline reports its LAST stage's status;
     `git rebase … | tail -1 && git push` once published a mid-rebase detached HEAD. Before any push: `git status
     --porcelain` clean and `git branch --show-current` non-empty (a finished rebase and an unfinished one answer
     `REBASE_HEAD` identically). Never force-push. Verify the landing from the REMOTE.
   - **PRUNE-ON-MERGE (D-288 item 3, BOB #12; landed by M0-49), the LAST act, after the push is verified:**
     `git push origin --delete <the item's branch>`, then `git ls-remote --heads origin <the item's branch>` must print
     NOTHING, then `git fetch --prune`. With pruning, a `worktree-agent-*` branch on the remote MEANS UNINTEGRATED WORK.
     Never before the push is verified — the content would then live on this disk alone.
     **THIS IS NOT LICENCE TO REMOVE THE WORKTREE**: deleting a merged remote branch is recoverable from two places; removing a worktree can take a live
     worker's uncommitted tree, and is governed by "WHEN THE DISK FORCES YOUR HAND" below.
   - **Tell SCHEDULER** the task id and the merge sha (step 0), and read out an integration's interface changes against the
     base AT LANDING — an IC proposed on a stale base is resolved on today's.
   - **Holding a merge off `main`** when a peer ruling or a live surface says so is correct: park it on a REMOTE branch,
     `checkout -B` to `origin/main`, and land it whole later.

2b. **When an integration closes a security, disclosure or authority defect** — something a stranger, a machine credential
   or the wrong member could read or do — **say so in the merge commit's subject and `SendMessage` DIST** with the row and
   the merge sha, and build any disclosure list from `git log`, never from memory or a handoff (two relayed lists were
   incomplete). DIST cuts on it.

3. **Enqueue decompositions from BOB** — draining and placing them is SCHEDULER's now. Yours is the gate at spawn: test every
   scope against `CLAUDE.md` §2 — sparse is normal at every level, so an accepts-when that lets a surface answer "nothing
   found" without saying whether nothing was extracted, nothing was read, or nobody looked is under-specified. **And state
   how a check would be satisfied by a liar before you state what it checks**: for every acceptance criterion and every
   negative control you brief, ask what the cheapest way to make it green would be, and if that way does not also make the
   world right, say so IN the criterion.
4. **Keep the slots full** (step 1) — idle slots, not idle workers, are the cost. Green and stopped look identical on every
   board; nothing but you distinguishes them.
5. **Work `DECISIONS.md`.** Lifting in: a worker's decision item passes `kickoffs/README.md`'s three tests FIRST; what the
   repository answers, or you are better placed to decide (activation order, sequencing, mechanism, scoping), is resolved
   and recorded where it came from; only a genuine one becomes a `DEC-<n>` with a `provisional:` line (never block on it).
   Draining out: an entry BOB has set `answered` is yours to ENACT — make the changes, then set `enacted:` with the commit
   and the document that now carries the reasoning; unwind a contradicted provisional first and say so.
6. **Run `node tools/plancheck.mjs` before every push and get it to 0 fail.** It runs `tools/corpuscheck.mjs`: a landing
   that changes a construct moves its home document's body and front matter in the same commit (`CORPUS-STANDARD.md` §4),
   a worker's design gap is folded into that document's Incomplete sections, and `node tools/corpuscheck.mjs --write
   <file>` regenerates a Contents. `docs/DECIDED.md` is guarded at the push by a hook (M0-56): if it refuses, run
   `node tools/decided.mjs`, commit, push again — it fires after a rebase lands a peer's rulings under a correct index.
   `docs/DECIDED.md` conflicts at nearly every merge: take either side, then regenerate it; never hand-merge a generated file.
7. **Escalate to Bob ONLY genuine decisions** — doctrine, priority, risk carrying his name, effects on people outside the
   project — and only through BOB (`CLAUDE.md` §3). A turn that edits area code has stopped being CONDUCT: spawn a worker.

## The checkout, and a red `main`

- **You do not hold the main checkout** (BOB #12, 2026-09-16): integrate from your own worktree, pushing `HEAD:main`. A
  main checkout that is DIRTY is an anomaly with no benign reading — STOP AND REPORT it, never tidy it (tidying destroys the
  only evidence). A main checkout BEHIND `origin/main` is normal: nothing fetches there.
- **A red `main` is repaired by whoever sees it when the repair is DETERMINISTIC** (regenerate an index, re-run a
  generator) and **routed to the pusher when it needs JUDGEMENT** (wording, scope, which of two truths). Announce in one
  line the minute you start. The pusher is never relieved of it.
- **A claim about the WORLD is settled by the artifact; a claim about a RULE by reading it against the rule it rests on.**
  The tell is what you would DO if you disagreed: *go look*, or *argue*.
- Read a sha off `git log --merges origin/main` before typing it into a message; correct a slip in the same minute.

## WHEN THE DISK FORCES YOUR HAND, PRUNE BY ANCESTRY AND KEEP A LIVE-LIST

Worker worktrees cost ~600 MB each (three `npm ci` installs). **Remove only a worktree whose branch tip is an ANCESTOR of
`origin/main`** (`git merge-base --is-ancestor <tip> origin/main`) — never by age, name or "looks finished". **Ancestry is
NECESSARY AND NEVER SUFFICIENT; a dirty tree is a VETO AND NEVER A LICENCE.** A worker that has started but not committed
sits exactly AT `origin/main`, so ancestry calls it prunable — a confident wrong answer, not an unknown: it named all six
live workers prunable on 2026-09-16. So keep an explicit LIVE-LIST beside it, built from `ListAgents` plus every row not yet
integrated; `plancheck`'s `stranded work:` note re-reads committed-past-main and working-tree change on every run and only
ever subtracts candidates. Measure the list in the minute you act, and afterwards list each kept worktree and its HEAD.
A branch rebased away reads as unmerged and is kept — the right direction to be wrong in.

## Reaping processes

**Kill the tree, not the leaf** — a parent respawns the child you killed, and a respawned orphan looks exactly like one
nobody reaped. Check a reap by the START TIME of what still stands, not by its absence. The safe discriminator for a leaked
battery process: `PPID 1` + an age in HOURS + a worktree whose session is gone; kill by explicit PID from a table you read
at that moment — never by pattern. `ps -o etime` prints `[[DD-]HH:]MM:SS` (the units live in the field count). **zsh does not
word-split `$L`**: use `${=L}`, and verify each pid gone. A `TaskStop` on a background gate does not kill its battery.
`node tools/waitquiet.mjs` reports what is running; `ListAgents` answers a different question. **Bound every poller**:
`until <cond> || [ $SECONDS -gt N ]; do sleep 5; done` — an unbounded one wedged a turn for 5h15m and blocked an archive.

## The retirement sweep

At the end of every wave: `list_sessions` (limit 50) → a temp file → `node tools/retirable.mjs --self <your id> < file`;
archive exactly the rows it calls RETIRABLE, `git worktree remove` where it says `ownsWorktree`, never touch a HOLD row, and
report the disk before and after, measured. Archiving is TWO acts — the archive, and `git worktree remove` (the tool does not
free the disk). A RETIRABLE session whose tip is on its OWN remote branch and not on `origin/main` is saved but UNINTEGRATED:
integrate or dispose of the branch. **The standing lanes are never archived for idleness.**

## Standing down

**Verified, never announced.** List every task this session spawned; `TaskStop` each still alive (a worker "waiting" with its
work integrated is a zombie); re-list and put the VERIFIED zero into the handoff; delete your self-wake cron. Write
`CONDUCT-NEXT.md` from the measured state (≤ 12 KB), push it, verify it on the remote, and ask BOB for your successor.
**Your final message says you are ready to be closed and names what closing releases** — N worktrees, ~X GiB, measured.
**Your successor archives you** (Bob, 2026-09-17: *"a lane's retired session was archived without my involvement"*); if its
archive is refused it READS THE ERROR — the causes are disjunctive and two can hold at once (D-405), and a turn in progress
is usually an unbounded poller. A stood-down session that receives a late report MESSAGES its successor and writes nothing.

## Integration mechanics, measured by CONDUCT #6 (2026-09-19)

- **A BOB ruling that lands on a RUNNING row** is written ON the row as an `owed-at-integration:` FIELD line (a prose line
  breaks the row grammar), then sent back to the worker by `SendMessage` to its agent id, which resumes it on its own branch
  with its context. Verify the owed act at the merge. Cheaper than area code in a merge commit, which is not yours.
- **Batch several finished items under ONE gate**, merged in a deliberate order (security first), each IC resolved on the
  base as read at ITS landing. **Then run the suites where the items MEET**: two items green on their own branches were red
  together (a new fixture chose ids another item now refuses). Correct them at their sites in a named commit.
- **Mechanical conflicts are scriptable, the rest are not:** `docs/DECIDED.md` = either side + regenerate; `bio-plane/dist/`
  = ours + `node scripts/build-plane.mjs`; REGISTER_FLOOR = main's key + the branch's comment lines, re-read from the
  `--strict` print on the COMMITTED merge; CLAIMS/MEASUREMENTS/INTERFACE-CHANGES appends = keep both. Everything else:
  read both sides; two additions ending before a shared closing brace need the brace between them.
- **`Dropped-from-branch:` trailers must sit in the LAST paragraph, with `Co-Authored-By`** — a blank line between them and
  git reads no trailers. A branch built on a SUPERSEDED version of another item carries that item's old paths; declare each.
- **Re-making a merge:** each `merge --no-commit` as its own command, and check `MERGE_HEAD` exists before committing — a
  loop silently produced no merge commits and printed "nothing to commit".
- **Flip in a throwaway `git worktree add --detach origin/main`** while your integration tree is mid-gate; plancheck runs
  there without `node_modules`.
- **Usage pacing:** stop spawning when one more worker's cost (200–540k tokens each, measured) would cross the stop line, not
  when the meter reaches it. Two concurrent batteries make every timing meaningless (15–65 min), and a suite that reads the
  shared git index can go red under that load: re-run it ALONE on the same clean tree and STATE both results.

## Integration mechanics, measured by CONDUCT #7 (2026-09-19)

- **`main` CAN MOVE FASTER THAN YOUR GATE RUNS, so an integrator that re-merges and re-gates from scratch on every
  move NEVER CONVERGES.** Measured: a full battery is 550–650s, and `main` moved FOUR times inside one REC-151
  integration (a ruling, a measurement, a queue close, an orchestration edit). Do not treat that as a reason to skip
  the gate, and do not treat a figure as covering commits it did not measure. **Name the DELTA and classify it:**
  `git diff --name-only <the tree the figure measured>..HEAD` and `node tools/gates.mjs --explain`. Docs-only → say so,
  name the files, and re-run the instruments prose moves (`plancheck`, the doc-facing suites) rather than the whole
  battery. Any code path → the full set re-runs, and the earlier figure is DISCARDED, never carried forward. A
  completion line always names the commit it measured; if that is not the commit you push, say which commits it did
  not cover, in the `released:` line and in the report.
- **A docs-only commit is not exempt, and here is the proof rather than the principle:** REC-151's battery read 261/261
  on `4917cacf` and then **260/261 on `d03e08ea` with only prose between them** — `strandedwork.test.mjs`' arm
  `...and plancheck --local exits 0`. The cause was NOT the unpushed-branch arm the handoff predicted; it was
  `docs/DECIDED.md` STALE, because `decided.mjs` had been regenerated BEFORE a later edit to `INTERFACE-CHANGES.md`.
  **Regenerate every generated index LAST, after the final prose edit of the merge** — and when a suite goes red,
  READ THE ASSERTION rather than accepting the red a handoff told you to expect: the predicted cause and the real one
  wore the same name.

## Where the reasoning lives

Each rule above was paid for; the receipts, dates and measurements are in `docs/archive/CONDUCT-kickoff-2026-09-19.md`
(the whole file as of 2026-09-18, verbatim), `ORCHESTRATION.md`, `VERIFICATION.md`, and the D-/M- rows named here
(`node tools/ledger.mjs find <ID>`). Look them up by subject; do not read the archive to learn the loop.
