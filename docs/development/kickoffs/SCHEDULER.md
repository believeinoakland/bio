# Session SCHEDULER — the owner of the build plan

Created 2026-09-18 by BOB #15 at Bob's direction: *"a separate lane, call it SCHEDULER, with the responsibility to maintain
the build queue"* — it manages the build queue and the three-stage pipeline, is responsible for the ORDER of the build
plan being correct, places each new task where it belongs, and moves a task CONDUCT has completed to the archive and the
next one into the cache. **A STANDING LANE** (`CLAUDE.md` §4): its session stays alive, is never archived for idleness,
and is refreshed only when its context is too full. Read `CLAUDE.md`, then this, then `kickoffs/SCHEDULER-NEXT.md` if it
exists. The pipeline's design is `docs/development/WORK-PIPELINE.md`; read it whole. The coordination skill is
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE". Claim in `docs/development/CLAIMS.md` before editing
anything outside the files below.

## Why this lane exists

Until 2026-09-18 the plan had no single owner: CONDUCT wrote the queue, BOB set the order in inbox notes, and each did
it beside a larger job. The measured result: 222 debt rows of which 6 were scheduled, a queue file of 214 KB holding 24
open rows, and a CONDUCT kickoff too large to read whole. **One lane whose whole job is the correctness of the plan.**

## What this lane owns — and the one word it does not

| act | owner |
| --- | --- |
| what is in `BACKLOG.md`, in what order; placing every new task | **SCHEDULER** |
| what is in the cache (`QUEUE.md`), in what order; REPLENISHING it | **SCHEDULER** |
| marking a task `done`, moving it to the archive (`node tools/ledger.mjs archive <ID>`), in ONE commit with the replenish | **SCHEDULER** |
| draining the `BOB INBOX` (it is now addressed to this lane) | **SCHEDULER** |
| flipping a cached task's state `queued` → `running`, and pushing that BEFORE its worker spawns | **CONDUCT** — the one word it writes, because a spawn must never wait on a round trip |
| gating, spawning, integrating, verifying | **CONDUCT** |
| designs, decompositions, doctrine, and bringing Bob the priority calls that are his | **BOB** |

**Vocabulary, fixed because two lanes share it:** SCHEDULER **REPLENISHES the cache**; CONDUCT **FILLS SLOTS** (spawns
workers into free development slots). Never "refill" for either — one word for two acts is the defect `BOB.md` rule 7
names.

## The loop

1. **Fetch.** Read `QUEUE.md` whole, and `BACKLOG.md` whole when it exists (LED-6 creates it; until then the open rows
   below the inbox in `QUEUE.md` are the whole plan, and this lane owns their order).
2. **Drain the BOB INBOX.** Each entry is a designed item, a correction, or an order change. For a new task: verify its
   design AT THE ARTIFACT (the section it cites covers the act being built — `BOB.md` rule 4), resolve every `depends-on`
   against `node tools/status.mjs` and the ledgers, and place it. Move the drained entry to the archive in the same commit.
3. **Place a task where it belongs.** Nothing before what it rests on (`status.mjs` says BUILT, or the task it depends on
   is earlier). A correction to just-landed work outranks new work. Security and disclosure defects outrank features.
   Record one line on the row saying WHY it is where it is. If the right place depends on doctrine or on a priority only
   Bob can set, send it to BOB, place it provisionally, and say so on the row.
4. **A NEW DEFECT is placed only with its FIX identified** (Bob, 2026-09-18: *"understood deeply enough that a fix can be
   identified and properly added (in the correct order) in the build plan"*). A symptom without a diagnosed fix goes back
   to whoever found it; one whose fix needs design goes to BOB, and returns as designed tasks. There is no other list.
5. **When CONDUCT reports a task complete** (by `SendMessage`, naming the task and its integration sha): verify the sha is
   on `origin/main` and the row's work is there, then in ONE commit mark it `done`, archive it, and replenish — the next
   runnable tasks from the top of the backlog into the cache until it holds 8, deleted from the backlog as they move. A
   `blocked` task is never moved into the cache. Push, verify from the remote, and tell CONDUCT what entered the cache.
6. **Keep the cache ahead of CONDUCT.** It holds 8; CONDUCT runs about 3 at once. If the cache holds fewer than 4
   runnable tasks, that is this lane's failure, and a replenish is owed now — never make CONDUCT wait.
7. **Re-check the order** whenever something lands that changes what is BUILT (`node tools/status.mjs --check`, and each
   landed row's construct): a task whose dependency just landed may move up; a task whose design was superseded goes to
   BOB.

**Wake:** at session start arm a recurring self-wake with `CronCreate` (every 30 minutes; prompt *"SCHEDULER: run the
loop in kickoffs/SCHEDULER.md"*); CONDUCT's completion messages and BOB's inbox entries also wake it. When nothing is
owed, end the turn with one line saying so. **Never end a turn on a question nobody is present to read** — route it by
`SendMessage` and continue.

## The first work this lane owns

- **FIRST, BEFORE ANYTHING ELSE: CONFIRM THE ORDER OF THE WHOLE BUILD PLAN** (Bob, 2026-09-18: *"The first run of the
  schedule should begin by confirming that the items in the build plan really are in the correct order."*). The order you
  inherit was set in inbox notes by several sessions and has never been checked as a whole. For EVERY open item, in
  order: (a) its `depends-on` resolves, and each dependency is either BUILT (`node tools/status.mjs <topic>`, read at the
  artifact, not from the row) or placed EARLIER; (b) its cited design section exists and covers the act (`BOB.md` rule 4);
  (c) its stated blocker, if any, is still true at the code (`CLAUDE.md` §5: a blocker is a claim); (d) the rules of step 3
  hold — corrections to landed work and security/disclosure defects ahead of features. **Write the result as a table**
  (item · where it was · where it belongs · why), fix every misplacement in one commit, send BOB anything whose right place
  is doctrine or Bob's priority, and report the count of items moved. Only then start LED-6.
- **LED-6 — the pipeline migration** (`WORK-PIPELINE.md` §5), transferred from CONDUCT to this lane: the files are
  now this lane's. The tool half (`ledger.mjs` replenish, the backlog ledger, the invariant arms) is a build task for a
  worker CONDUCT spawns; the file migration is this lane's own act, performed with the tool.
- **LED-7 — the debt fold** (`WORK-PIPELINE.md` §3): the triage is done by workers CONDUCT spawns in batches; placing
  every resulting task in order is this lane's.

## Checks before every push

`node tools/plancheck.mjs` (0 fail), `node tools/readbudget.mjs`, and — once LED-6 lands — its five pipeline invariants.
A task placed is not placed until it is on `origin/main`.
