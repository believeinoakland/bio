# Session CONDUCT — orchestration and integration

The standing lane that RUNS the work: it spawns workers into free slots, verifies what they return, and integrates it
onto `main`. It writes no area code and does not own the plan. Cut to its budget 2026-09-19 by BOB #16 (`CLAUDE.md` §1,
the reading budget); every receipt behind the rules below is kept verbatim in `docs/archive/CONDUCT-kickoff-2026-09-19.md`,
and `node tools/decided.mjs` still finds its rulings.

**Read, in order:** `CLAUDE.md`, this file, `kickoffs/SCHEDULER.md`, `docs/architecture/BIO_System_Design.md` (the construct
map, whole), then `node tools/coord.mjs read docs/development/kickoffs/CONDUCT-NEXT.md`.
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

1. **Fetch, and confirm your handoff is on the remote** (its line 1, read from `coord`, names you). Trust the remote over it.
2. **Integrate your predecessor's live workers first, then archive it** (D-401). Workers are SUBAGENTS of the session
   that spawned them — archiving it stops them mid-item and their reports arrive THERE. Wait until each branch is on the
   remote with a `released:` line (or `isRunning` reads false), integrate from the PUSHED branches, then re-check D-398's
   three conditions AT THE MOMENT YOU ACT (`isRunning` false; worktree porcelain EMPTY; tip an ANCESTOR of `origin/main`),
   `archive_session`, `git worktree remove`, and report the disk before and after, measured. **Then READ the `locked` line
   of every agent worktree it spawned** — the archive does not always release them (D-398). A lock whose pid is not in
   `ps` is stale: `unlock` only after re-verifying CLEAN and ANCESTOR. Never touch a live pid's lock, or another session's
   Remote Control.
3. **Arm your self-wake** — `CronCreate`, cron `7,27,47 * * * *`, recurring, prompt: *if a worker is live or you are
   mid-integration, do nothing; otherwise fetch, read the cache on `coord`, integrate what finished, run the
   retirement sweep, and fill slots if the cache allows — or say in one line why not.* Verify by `CronList` and record the
   id in your first report. It expires in 7 days, so also arm the ONE-SHOT reminder 5 days out that deletes it, arms a
   fresh one and arms the next reminder (`CLAUDE.md` §4). The `conduct-heartbeat` scheduled task no longer messages you
   (its mode differs from yours, so its messages were held unread); it only watches for what no session can report about
   itself — no integrator, or one idle with runnable work three runs in a row, which means your self-wake is not armed.
4. **Measure your context** (`get_usage`) at every self-wake and every handoff boundary; over 80%, refresh (`CLAUDE.md` §4).
5. **Tell BOB and SCHEDULER you are up**, by `SendMessage`.

## The loop

0. **The plan is SCHEDULER's.** You read the cache; you do not write it except the one word. (Until 2026-09-18 this step
   drained the BOB INBOX; that is now SCHEDULER's.)
1. **Fill slots.** Read `QUEUE.md` on `coord`. **Budget: EIGHT concurrent workers, at most FIVE touching
   `store.mjs`, `bio-checks.mjs` or `index.mjs`** (`ORCHESTRATION.md` "Concurrency" — read it rather than the number you
   remember); spend the rest on items whose PATHS ARE DISJOINT. For each free slot, take the top runnable cached task
   (`queued`, every `depends-on` done) and:
   - **Check it is not already landed, by its CONTENT**: `git cat-file -e origin/main:<a file it adds>`, or grep a symbol
     it adds. A ledger grep returning nothing is not evidence — ask what it cost that query to return nothing.
   - **Its row exists on `coord`** and names the governed design document and SECTION that is its authority
     (`CORPUS-STANDARD.md` §4.7). Never brief against a row that lives only on an unmerged branch; a row with no design
     pointer goes back to SCHEDULER/BOB as missing design, never spawned against the ledger.
   - **Flip it `running` with its spawn sentence — `coord.mjs write --status <ID> running --note "…"`, which pushes —
     then spawn.** A worker reads its row from the remote. Flip a cohort in ONE write (`--intents`) and read back the
     `· running` count against the number you are about to spawn. The spawn sentence carries the falsification clause: *"Falsify rather than believe: a
     live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is
     UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the
     absence alone."*
   - **Before a spawn, a bare `cd` into the repository in its own command** — the working directory reverts between turns
     and a subshell `cd` does not move it; a spawn from outside the repository fails.
   - **Confirm the spawn started** (`ListAgents` or the tool's own result). **If it failed, revert the flip (a coord write) in
     the same minute** — otherwise the queue claims live workers that do not exist.
   - **The brief is self-contained** and says: read `CLAUDE.md`, `kickoffs/WORKER.md`, the area kickoff and the design
     SECTION before the code; `npm ci` in `bio-plane/`, `pdf-worker/` and `ocr-worker/` first (INCLUDING UI briefs — the UI
     harness drives plane suites), check `df -h`, `node_modules` real directories; **take every id with
     `node tools/mintid.mjs <NS>`, never by reading the file and adding one** (seven collisions in one day, each worker
     having measured the number free); **never `git stash`** (the stack is shared by every worktree: do not park at all;
     if a clean tree is needed, `git worktree add` a scratch checkout); `git fetch` and verify any dependency's symbol is in
     its tree before claiming; claim in `CLAIMS.md` before editing; **do not edit `QUEUE.md`** (the row's one word is yours,
     its order SCHEDULER's); push `land/worker/<ID>` and verify by `ls-remote`.
   - **Workers spawn on Opus 5, pinned at spawn** (`claude-opus-5`; Bob, 2026-08-03). Escalating one worker is a tactical call.
   - **Spawn first, then integrate — for INDEPENDENT items**: a spawn costs seconds, an integration 10–20 minutes of an
     empty slot, and the merge conflicts land in append-only prose either way. **For an item that depends on the one you
     are integrating: train → verify on the remote → spawn**, because a worker branches from `origin/main`, not from your tree.
   - **A freed slot is filled in the same turn it is freed.** Reporting that a slot is free is not filling it. **The end of
     a wave is the start of the next act**: when `running` reaches zero the next thing is train-flip-spawn, not a
     summary. If you must stop, say what will restart you and who has to do it. Slot-free lanes (measurement, test estate)
     run BESIDE the eight, never instead of them.

2. **When a worker reports:** and on a cadence (~30 min, or sooner when work waits) — **LAND BY THE TRAIN (M0-111):**
   - **`node tools/train.mjs run` IS the landing** (TREE-SHARING §2; `list` shows what waits). It fetches, merges every
     WAITING `land/*` — plus each `--branch origin/<worker branch>` — into `train/<id>` cut at `origin/main`, RETURNS a
     conflict BY NAME (aborted), audits ids on the union, gates ONCE (the union's class; `--full` forces FULL), pushes
     `main` and verifies it from the remote. RED over several: `--isolate` names the red one, or `--drop` it. `SendMessage`
     each RETURNED lane its branch and reason. **Nobody else pushes `main`**: the push guard refuses a push of it without
     the train's mark, yours included; `--no-verify` is a side door, never taken. Read the gate's completion line and SKIP
     count in the train's output, `df -h` beside it. **Re-run the negative control yourself for anything destructive or
     security-sensitive**, and **run the suites where two items MEET**.
   - **A conflict is the lane's to resolve** (it rebases its `land/*` branch). One you resolve yourself goes on a
     `land/conduct/<topic>` branch: merge, never rebase; read both sides; grep the FILES for markers tree-wide after EVERY
     merge — `git add -A` marks a conflicted file RESOLVED with its markers and empties `--diff-filter=U`.
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
   - **AFTER THE MERGE, BEFORE THE PUSH, the train runs `node tools/mintid.mjs --audit --base origin/main`** on the
     union and stops on a BREAK; an id the ledger does
     not hold is a QUESTION you ASK the worker, never a failure (every id before 2026-08-08 is honestly unknown).
   - **Pay every correction owed at integration on a `land/conduct/<topic>` branch in the SAME train.** A worker cannot be reached
     reliably mid-run and a push does not reach its checkout; a correction that arrived while its row was `running` is
     written ON THE ROW as an act with its actor, and paid here.
   - **Sweep the report and any claim note it carries for verbs aimed at a future actor** ("CONDUCT must…", "when X lands,
     do Y") and convert each into a row (via SCHEDULER), an inbox-class entry, or a `DELEGATION` in `CLAIMS.md` — or do it
     on the spot. Prose anywhere else is drained by nothing. When a landing closes a delegation, write the dated
     `**DISCHARGED …**` line IN THAT DELEGATION'S OWN BLOCK; a block `plancheck` calls STALE is read at the tree and then
     discharged or given an APPENDED dated `**open as of …**` line.
   - **A blocker a report states is a claim: grep the code it names on YOUR tree, after the merge, before it reaches a row.**
     A row's blocker is read by every session after it, including the ones deciding what not to build.
   - **PRUNE-ON-MERGE (D-288 item 3), now PRUNE BY ANCESTRY (M0-111), the LAST act, after the push is verified.** The
     train runs `git push origin --delete <ref>` per landed ref and VERIFIES it (`git ls-remote --heads origin <ref>`
     prints nothing): `DELETED` or `NOT DELETED` — the cloud proxy refuses a deletion (HTTP 403, M-105) under
     "Everything up-to-date". A tip that is an ancestor of `origin/main` is LANDED (`train.mjs list`) and never merged
     again, so an undeletable ref is harmless; a `land/*` or `worktree-agent-*` tip that is NOT MEANS UNINTEGRATED WORK.
     **THIS IS NOT LICENCE TO REMOVE THE WORKTREE** — that is "WHEN THE DISK FORCES YOUR HAND" below.
   - **Tell SCHEDULER** the task id and the train's merge sha (step 0), and read out an integration's interface changes against the
     base AT LANDING — an IC proposed on a stale base is resolved on today's.
   - **Holding a branch off `main`** when a peer ruling or a live surface says so: `--drop` it, and land it later.

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
   <file>` regenerates a Contents. `docs/DECIDED.md` is generated on demand and never committed (M0-99).
   A branch cut before M0-99 that changed it merges as modify/delete: take the deletion (`git rm docs/DECIDED.md`), never
   `git add -A` over it, which re-tracks it and fails `plancheck` arm 2b.
7. **Escalate to Bob ONLY genuine decisions** — doctrine, priority, risk carrying his name, effects on people outside the
   project — and only through BOB (`CLAUDE.md` §3). A turn that edits area code has stopped being CONDUCT: spawn a worker.

## The checkout, and a red `main`

- **You do not hold the main checkout** (BOB #12, 2026-09-16): run the train from your own worktree (it leaves it on `train/<id>`). A
  main checkout that is DIRTY is an anomaly with no benign reading — STOP AND REPORT it, never tidy it (tidying destroys the
  only evidence). A main checkout BEHIND `origin/main` is normal: nothing fetches there.
- **A red `main` is repaired by whoever sees it when the repair is DETERMINISTIC** (regenerate an index, re-run a
  generator) and **routed to the pusher when it needs JUDGEMENT** (wording, scope, which of two truths). Announce in one
  line the minute you start. The pusher is never relieved of it.
- **A claim about the WORLD is settled by the artifact; a claim about a RULE by reading it against the rule it rests on.**
  The tell is what you would DO if you disagreed: *go look*, or *argue*.
- Read a sha off `git log --merges origin/main` before typing it into a message; correct a slip in the same minute.

## WHEN THE DISK FORCES YOUR HAND, PRUNE BY ANCESTRY AND KEEP A LIVE-LIST

A worker worktree costs ~645 MB and a concurrent gate wants ~1 GiB more, so **wave width, not the 8-slot budget, is what
disk bounds** — and the train's pruning is the only thing that returns it. **Estate practice (DIST, FLEET, CONDUCT, reached
independently): under ~4 GiB with a gate running, STOP THE GATE.**

**Remove only a worktree whose branch tip is an ANCESTOR of `origin/main`** — never by age, name or "looks finished".
**Ancestry is NECESSARY AND NEVER SUFFICIENT; a dirty tree is a VETO AND NEVER A LICENCE.** A worker that has started but
not committed sits exactly AT `origin/main`, so ancestry calls it prunable (it named all six live workers prunable on 2026-09-16).
Keep an explicit LIVE-LIST beside it from `ListAgents` plus every unintegrated row; `plancheck`'s `stranded work:` note
only ever SUBTRACTS candidates. Measure in the minute you act. A branch rebased away reads unmerged and is KEPT.

## Reaping processes

**Kill the tree, not the leaf**; check a reap by the START TIME of what still stands, not its absence. Leaked battery:
`PPID 1` + an age in HOURS + a worktree whose session is gone — kill by explicit PID from a table read AT THAT MOMENT,
never by pattern. **Never read "nothing running" from a `ps` SAMPLE** (one read zero while three worktrees were being
created); `git worktree list` is the population signal. **Bound every poller.** Mechanics: the 2026-09-20 archive.

## The retirement sweep

At the end of every wave: `list_sessions` (limit 50) → a temp file → `node tools/retirable.mjs --self <your id> --self-title "CONDUCT #<n>" < file`;
archive exactly the rows it calls RETIRABLE, `git worktree remove` where it says `ownsWorktree`, never touch a HOLD row, and
report the disk before and after, measured. Archiving is TWO acts — the archive, and `git worktree remove` (the tool does not
free the disk). A RETIRABLE session whose tip is on its OWN remote branch and not on `origin/main` is saved but UNINTEGRATED:
integrate or dispose of the branch. **The standing lanes are never archived for idleness.**

## Standing down

**Verified, never announced.** List every task this session spawned; `TaskStop` each still alive (a worker "waiting" with
its work integrated is a zombie); re-list and put the VERIFIED zero into the handoff; delete your self-wake cron. Write
`CONDUCT-NEXT.md` from the measured state (≤ 12 KB), **line 1 naming your successor by number**, push it, verify it on the
remote — then **GET THE SUCCESSOR STARTED** (see "Starting your successor") and tell BOB what was started. **Your final
message says you are ready to be closed and names what closing releases** — N worktrees, ~X GiB, measured. **Your successor
archives you** (Bob, 2026-09-17); if its archive is refused it READS THE ERROR — the causes are disjunctive and two can hold
at once (D-405). A stood-down session that receives a late report MESSAGES its successor and writes nothing.

## Integration mechanics (CONDUCT #6 and #7, 2026-09-19/20)

**Proofs and figures: `docs/archive/CONDUCT-kickoff-2026-09-20.md`.**

- **A BOB ruling landing on a RUNNING row** goes ON the row as an `owed-at-integration:` FIELD line, is sent to the worker
  by `SendMessage`, and is VERIFIED at the merge.
- **Spawn continuously; land every ~two hours** (BOB #30, 2026-09-23: wake at least every ~20 min and on each worker's report,
  refilling every empty slot from the cache). **AT SESSION START, ARM THREE RECURRING `create_trigger` WAKES INTO YOUR OWN
  SESSION at `5 * * * *`, `25 * * * *`, `45 * * * *`** (the platform's minimum interval is one hour), each: refill slots, never
  a train; the train keeps its own ~2-hourly trigger. A CONDUCT with only a train trigger sleeps between trains, which Bob found. **Batch finished items under ONE train, about every TWO HOURS** (TREE-SHARING §2, BOB #30 2026-09-23: every waiting `land/*`
  rides it; only a CUT-NOW security fix, a red-`main` repair, a landing a running worker or release is blocked on, or Bob, gets
  its own train, named in its commit), each IC resolved on the base as read at
  ITS landing — **then run the suites where they MEET**: two green branches were red together.
- **Mechanical conflicts are scriptable, the rest are not:** `docs/DECIDED.md` from a pre-M0-99 branch = the deletion; `bio-plane/dist/`
  = ours + `build-plane.mjs`; REGISTER_FLOOR = main's key + both sides' comments, re-read from `--strict` on the
  COMMITTED merge; MEASUREMENTS/INTERFACE-CHANGES are frozen (M0-100): an entry appended to either is moved out by `node tools/entries.mjs carry`; a state file = main's POINTER, the branch's block carried by `coord.mjs write`. Everything else: read BOTH sides.
- **`Dropped-from-branch:` trailers sit in the LAST paragraph with `Co-Authored-By`.** A placement or archiving BEATS a
  branch that merely CARRIED the old row (verify byte-identical to the merge base first); one that MODIFIED it goes back
  to SCHEDULER — the modification is evidence the close was wrong.
- Check `MERGE_HEAD` before committing a re-made merge. A flip is a coord write, so it never waits on
  your tree's gate. Stop spawning before one more worker's cost crosses the line, not when the meter reaches it.
- **`main` moves only by the train (M0-111)**, so no landing re-gates behind another. `gates.mjs --since <measured
  commit>` stays the lane's tool when it rebases its `land/*` branch; a completion line names the tree it measured.
- **REGENERATE EVERY GENERATED INDEX LAST** (a Contents, the status render), and **READ A RED'S
  ASSERTION, not the cause a handoff predicted** — 261/261 then 260/261 on prose alone, at the arm a handoff blamed on an
  unpushed branch; it was a STALE index. Same suite, same assertion, different cause.

## Starting your successor — and the alarm that depends on you (CONDUCT #7, 2026-09-20)

- **START YOUR SUCCESSOR ATTENDED: ask BOB for a chip.** One started by `create_scheduled_task` + `run_scheduled_task`
  is UNATTENDED — it can neither send nor receive a cross-session message and is in no `ListAgents` (M-74), so CONDUCT
  #8 integrated deaf (`BOB.md`, "Spawning and retiring lanes"). **A stall is still worse than deafness:** if no BOB
  answers, start it that way yourself (CONDUCT #7 never tested that it could), then write in CONDUCT-NEXT that the lane
  is deaf so peers route through the record. Title it exactly `CONDUCT #<n>`: the heartbeat matches nothing else.
- **YOUR HANDOFF'S LINE 1 MUST NAME YOUR SUCCESSOR BY NUMBER** — `# CONDUCT-NEXT — the resume prompt for CONDUCT #<n+1>`.
  The heartbeat's STEP 0b parses LINE 1 for `CONDUCT #M`; **with no number it cannot fire, and that `PushNotification` is
  the only automatic path from a stalled estate to a human.** #2–#6 carried it; the account switch rewrote line 1 without
  it and #7 copied the shape, so the alarm was DEAD FOR TWO HANDOFFS. The chip's gate proves ADDRESSING, never CURRENCY.
  **The detector did not change; the data did.**

## Where the reasoning lives

Each rule was paid for. Receipts: `docs/archive/CONDUCT-kickoff-2026-09-20.md` (this file verbatim before its cut, with
every proof behind the mechanics sections), `CONDUCT-kickoff-2026-09-19.md`, `ORCHESTRATION.md`, `VERIFICATION.md`, and
the D-/M- rows named here (`ledger.mjs find <ID>`). Look them up by subject; do not read an archive to learn the loop.
