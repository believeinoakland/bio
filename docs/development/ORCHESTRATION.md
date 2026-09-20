# How this project runs: the lanes, the work, and how a change reaches the session that needs it

`PARALLELISM.md` is the WHY (work parallelises across stable interfaces). This is the HOW. Cut to the reading budget on
2026-09-19 by BOB #16 (`CLAUDE.md` §1); the full prior text, with every receipt, is archived verbatim at
`docs/archive/ORCHESTRATION-2026-09-19.md` — look a receipt up there by subject, never read it to learn the process.

## Roles

- **Bob** — the architect and the one human. Reached only through the BOB lane (`CLAUDE.md` §3).
- **The five standing lanes**, each a long-lived session in its own worktree, never archived for idleness, refreshed at
  >60% context (`CLAUDE.md` §4):
  - **BOB** (`kickoffs/BOB.md`) — requirements, UX, architecture with Bob. Its product is DECOMPOSITION: a decision, its
    implications, and independent items, each scoped behind the interface it sits behind, handed on through the BOB INBOX.
    The channel for every other lane's question to Bob.
  - **SCHEDULER** (`kickoffs/SCHEDULER.md`) — owns the ORDER of the build plan: drains the BOB INBOX, places every task,
    marks `done`, archives and REPLENISHES the cache.
  - **CONDUCT** (`kickoffs/CONDUCT.md`) — runs the work: fills slots with workers, verifies, integrates on `main`. Writes
    one word of the plan (`queued` → `running`) and no area code.
  - **DIST** (`kickoffs/DIST.md`) — cuts releases from a green `main` and, by Bob's standing permission, deploys them.
  - **FLEET** (`kickoffs/FLEET.md`) — the fleet members the plane calls.
- **Areas** — RECORD, CAPTURE, CONTENT-*, FRAMEWORK, UI, M0 …: each a body of work with a kickoff naming its paths, not a
  standing agent.

## Workers are ephemeral; the plan persists

A worker is a worktree-isolated sub-session CONDUCT spawns to do ONE cached task (`kickoffs/WORKER.md`). It builds, tests,
pushes its branch, reports, and ends. The persistence is in the files (`WORK-PIPELINE.md`): `QUEUE.md` holds the BOB INBOX and the cache of the
next tasks, `BACKLOG.md` every other open task in order, and the archive what is done.
`MILESTONES.md` is the capability ladder every task is placed under. `DEBT.md`, `MEASUREMENTS.md` and the design documents
are knowledge — an INPUT to the plan, never a rival to it. **Nothing is work until it is a row in the plan.**

## The flow

1. BOB reaches a decision, writes it into its HOME design document (`CORPUS-STANDARD.md`), and hands the independent
   items to the BOB INBOX, each with its design pointer, interface, depends-on and milestone.
2. SCHEDULER verifies each item's design at the artifact, resolves its depends-on against `node tools/status.mjs`, places
   it in order, and keeps the cache full.
3. CONDUCT fills free slots from the top of the cache, flipping each row `running` and PUSHING before its worker spawns.
4. A worker lands; CONDUCT verifies from the merged tree (`VERIFICATION.md` defines what "done" requires), integrates,
   and tells SCHEDULER the task and its merge sha; SCHEDULER closes the row and replenishes.
5. Cross-area needs are DELEGATIONS in `CLAIMS.md`; interface changes go through `INTERFACE-CHANGES.md`.

## COMMUNICATING A CHANGE: the channels, and how to choose one

**This is the skill this ecosystem runs on, and the one that has failed most often** — four coordination failures in one
afternoon on 2026-07-31, every one a change that was CORRECT and did not reach the party who needed it. Read this before
making a change another session must know about.

### The principle everything below derives from

**The repository is the channel. A change is made when it is COMMITTED AND PUSHED**, and verified from the REMOTE.
Sessions do not share a working tree; a worktree is a checkout of a COMMIT, so an uncommitted file reaches nobody and an
untracked one cannot even be found. Two corollaries, each paid for:

- **A mechanism that is not in the loop the reader actually runs is not a mechanism.** Documenting it is necessary and
  never sufficient. If you add a step, add it to the file whose owner performs it.
- **Verify from the REMOTE, not from your own tree.** Written is not committed; committed is not pushed.

### The channels

| you need to… | use | shape |
| --- | --- | --- |
| hand a design change or new items to the plan | **`BOB INBOX`**, top of `QUEUE.md` | BOB appends, newest first; SCHEDULER drains it into ordered rows |
| raise a question to the architecture side | **`DECISIONS.md`**, or `SendMessage` to BOB | an entry carries `provisional:`; BOB brings what is Bob's to him |
| tell the NEXT session in your area what you learned | **the area's LAW (`<AREA>.md`) for what pays repeatedly; its `-NEXT.md` for what the next session must DO** | see "which of the two" below; the `-NEXT` is rewritten at the close of your turn, by you |
| need work inside another area's paths | **DELEGATION in `CLAIMS.md`** | append the need; continue with your own work; never edit their paths |
| change a shape another area builds against | **`INTERFACE-CHANGES.md`** protocol | PROPOSED → RESPONSES → RESOLUTION → CHANGING → CHANGED → SETTLED |
| record a defect, a number, or a design | **`DEBT.md` / `MEASUREMENTS.md` / the design docs** | append-only knowledge; a defect goes to SCHEDULER only with its fix named |
| tell a LIVE session something now | **`SendMessage`** to that lane — **NEVER to an UNATTENDED one; it cannot receive** | an ACCELERATOR, pointing at what to re-read; the state in the repository is the authority |

**AN UNATTENDED SESSION CANNOT BE MESSAGED AT ALL, IN EITHER DIRECTION — AND THE LANE EVERY COMPLETION REPORT
FLOWS THROUGH IS ONE** (SCHEDULER #3 and CONDUCT #8, independently, 2026-09-19; M-74). A session stood up by a
SCHEDULED TASK has no inbox and appears in NO peer’s `ListAgents`. A send to its session id is refused —
*“session … is unattended (a scheduled-task run or dispatched session); messages can’t be delivered there”* — and it
cannot send one out either. **The last clause of the row above is what saves the design: the state in the repository
IS the authority.** So what such a lane must know goes onto the ROW it reads from `origin/main`, never only into a
message — and its silence is never agreement.

**AND A NAME IS NOT AN ADDRESS.** SCHEDULER #3’s first send to `CONDUCT #8` returned `success: true` and landed on a
DUPLICATE session holding that title; nothing in the result said so, and only the recipient noticed. **Address a lane
by its session id when it matters, and treat a successful send as delivery to a NAME rather than to a LANE.**

**Choosing badly costs in one direction only**: a misfiled entry costs one reclassification, an unraised one costs the
thing going unrecorded. When in doubt, raise it — in a FILE or a message to the owning lane, never only in a window
nobody watches.

**WHICH OF THE TWO — the area's LAW or its `-NEXT` (FLEET #2, 2026-09-19, correcting BOB #17's instruction).** They are
not the same channel and the choice is not stylistic. **A `-NEXT.md` is CONSUMED ONCE, by one successor, and is
superseded the moment that session writes its own. `<AREA>.md` is the area's law and is READ IN FULL by every session
that ever holds the lane.** So the test is how often the lesson pays: a fact the next session must ACT on once (what is
mid-flight, which branch is live, what is owed right now) belongs in the `-NEXT`; a rule that will pay every time
anyone works this area belongs in the LAW, and belongs there NOW rather than waiting on a refresh that may be far off.
Put it in both when it is both. **The failure this closes:** a durable lesson written only into a handoff is read once
and then dropped — it looks recorded and is not, which is the same shape as a claim the record cannot support.
**AND THE REASON IN ONE SENTENCE, from DIST #2 on 2026-09-19, which is the test to apply when the choice is unclear:
THE SESSION THAT NEEDS THE LESSON WILL NOT BE THE SESSION THAT LEARNED IT.** A `-NEXT` is addressed to one successor
you can picture; the law is addressed to everyone who ever holds the lane, including the session that will meet the
trap for the first time years from now with no idea it was ever paid for. If you cannot name the ONE session the note
is for, it belongs in the law.

### The rules that make the channels work

1. **Disjoint regions, sole writers.** Two parties never write the same region of a file: the BOB INBOX is BOB's to
   write; the plan's rows and order are SCHEDULER's; a row's `running` flip is CONDUCT's.
2. **A notification, not a second copy.** An entry says what changed, points at where the detail lives, and names the
   items it affects. A restated copy starts rotting at once.
3. **Supersession is never silent.** A superseded item keeps its id, takes `superseded`, and names what replaced it.
4. **Announce the change; do not reach into the running turn.** Whether to stop a worker is CONDUCT's call. A
   correction to a running row is written ON THE ROW as an act owed at integration (`kickoffs/CONDUCT.md`).
5. **Never block on an answer.** Every unsettled decision carries a `provisional:`; a deferral carries a `trigger:`.
   Bob, 2026-07-31: *"never block on getting my answer when you can figure it out yourself."*
6. **Correct what your change superseded, in the SAME turn, yourself** — the one licensed exception to "do not write
   another area's kickoff", because that area's next session is who the stale text misleads.
7. **An area may not be ACTIVE without a kickoff naming its paths.** Activating an area and writing its kickoff are one act.
8. **When a role splits off yours, the split is not done until the new role's kickoff carries every rule you relied on
   being true of yourself** — swept for, not recalled. A resume prompt is a mechanism and inherits nothing.

### The failure modes, with their receipts

One line each; the full rows are in the archive.

| what happened | why it reached nobody | the rule it produced |
| --- | --- | --- |
| a kickoff written and left UNTRACKED while three workers ran | a worktree is a checkout of a commit | commit and push before anyone depends on it |
| the BOB INBOX documented in two places and drained by neither | it was not in the drainer's own kickoff | a mechanism lives in its owner's loop |
| two sessions in one checkout (ARCH's split, then DIST's, 2026-08-05) | a claim reserves paths between checkouts, not within one | one session per checkout (DEC-3); rule 8 |
| a kickoff told its worker to bundle a library the queue had moved | the queue was updated and the kickoff was not | rule 6 |
| a worker's control harness OVERWRITTEN mid-turn by another (PL-10, UI-38) | the scratchpad was shared between concurrent workers | **a worker writes its harness INSIDE ITS OWN WORKTREE and verifies every restore by CONTENT as well as by hash** |
| another worker's untracked suite ran in a worker's battery (REC-68, M0-15) | `git stash` is REPOSITORY-WIDE: every worktree shares one stack | never stash (below); the battery names any suite not in a commit |
| SEVEN id collisions in one day, every worker having measured the number free (2026-08-08) | read-the-file-and-add-one is check-then-act with no atomicity | mint every id (below) |

### TAKING AN ID: MINT IT, DO NOT READ THE FILE AND ADD ONE (M0-17)

    node tools/mintid.mjs <NAMESPACE> [--count N]      # take
    node tools/mintid.mjs --list                       # what exists, and where each floor comes from

It takes an id by exclusive create in the ONE `.git` every worktree of this clone shares. The corpus floor keeps it from
going below what exists, so losing the ledger degrades to the old convention and no further. **Its only failure is a GAP,
never a WRONG id.** **Never write an id-shaped example in a file that is a corpus** — an instrument cannot tell a number
in a sentence from a number in a row, and one such example moved a floor within minutes of landing. `--audit --base
origin/main` after a merge finds collisions the merge created (`kickoffs/CONDUCT.md`).

### RE-MEASURING A TRUE BASELINE (M0-15)

**Never park work with `git stash`** — the stack is shared, so `pop` is a race another worker can win. In order:
(1) **do not park at all** — the battery reports each suite's provenance, so a dirty-tree baseline can be read honestly;
(2) if you need a clean tree, **`git worktree add` a scratch checkout** of HEAD inside your own worktree; (3) if you stash
anyway, `git stash push -u -m <your-id>`, capture the stash SHA at once, restore with `git stash apply <SHA>` — never
`pop`, never `stash@{0}` — and read what came back.

### Before you end a turn

`node tools/plancheck.mjs` — 0 fail. It refuses an unpushed planning surface, an ACTIVE area with no kickoff, an item
behind an unregistered interface, an unknown milestone, a debt row with no disposition, an unsettled decision with no
provisional, a stale `DECIDED.md`, a governed design with stale front matter, and a kickoff over its reading budget.
**What it cannot check is yours:** whether an entry describes the change ACCURATELY, whether a correction is COMPLETE,
and whether a supersession names every affected item. The instrument proves the structure; it cannot prove the prose.

## Concurrency: sized to CONDUCT, not to the subscription

CONDUCT integrates serially, so the budget rations its VERIFICATION ATTENTION, not agent count (Bob, 2026-08-08: *"I
have the sense that you're spawning sessions much more slowly than you could"*). **Up to EIGHT concurrent workers, of
which AT MOST FIVE may touch `bio-plane/src/store.mjs`, `bio-plane/checks/bio-checks.mjs` or `bio-plane/src/index.mjs`**
— raised 2 → 5 → 8, and the contended-file cap 3 → 5, on measured integration and conflict costs, not nerve. Conflict
cost scales with workers in ONE file, not with workers, so spend the budget on DISJOINT paths: the UI, the fleet, the
test estate, the docs, measurement lanes. Append-only prose (`CLAIMS.md`, `DEBT.md`) conflicts on every merge and is
resolved by reading both sides; it is never a reason for fewer workers. **Measurement-only and test-estate items hold no
slot**: they change no plane behaviour, still cost a worker, and still get verified. **Spawn first, then integrate** for
independent items; for a dependent one, merge → gate → push → spawn.

## Dormant areas wait their turn

An area with no cached task is dormant; its kickoff stays current so it can be woken by the next task SCHEDULER places.

## The target is integrated-correct throughput

Not agent busyness. An idle ephemeral worker costs nothing; work that lands wrong, or piles up unintegrated, costs a lot.
Green and stopped look identical on every board, so a lane with nothing running and runnable work waiting is a defect,
not a quiet day.

### Why integration is a ROLE and not a queue-flip

**A class of true statements exists that no branch can make and only the merge can** — the shared floor's post-merge
value, an artifact built against a sibling's build, a ledger row a sibling closed. Receipt (2026-09-15): a shared floor
conflicted three times with four honest readings, every one correct on its own tree, and the merged figure was a fifth
number none could have known. **A fact about the union is not discoverable from any member of it — by default.** The
exception is a SHARED, ATOMIC ALLOCATOR that is actually USED: four workers took `M-21` while `mintid` covered `M`,
because each read the floor by hand. So put a union fact to four questions: **is an allocator possible, does it exist,
is it USED at the moment of allocation, and can the audit see a bypass?** Where it is, use it; where it cannot be, that
is why the integrator exists.

## LIVENESS: STATE DRIVES, SIGNALS ONLY ACCELERATE

Added 2026-09-10 after three hangs in one day that were one defect. The plane's own law (Tech Arch §10.7): recover by
RE-DERIVING outstanding conditions from durable state on every tick; a delivered signal is only an accelerator.

1. **Every inter-session dependency is STATE IN THE REPOSITORY** — a file at a sha, a row, a landed commit — and the
   dependent session re-derives readiness from it at every turn start and every wake. A message saying "ready" is an
   accelerator; the state is the authority.
2. **A guard that finds its precondition absent says what state it is waiting on**, in the record or its report, so the
   leading session can re-drive it. Stopping silently converts a guard into a hang.
3. **Every wait is bounded and world-checked** (`kickoffs/WORKER.md`): at every poll and at timeout check the PROCESS,
   not the signal — an absent process is a completed wait wearing silence. `until <cond> || [ $SECONDS -gt N ]`.
4. **Standing down is VERIFIED, never announced**: a session's last act lists its own spawned tasks and stops every one,
   and its handoff states the verified count. It then says it is ready to be closed and what closing releases; its
   successor archives it (`kickoffs/BOB.md`, "Opening").
5. **The leading session owns the reconciliation tick** — each standing lane arms its own self-wake (`CronCreate`, with
   the 5-day renewal, `CLAUDE.md` §4) and at each wake re-derives from the record, not from memory.
6. **A hung TURN is a hang the other rules cannot see, so silence must itself alarm.** A message to a session mid-turn
   only queues. The lead runs a no-progress alarm (`origin/main` unmoved for hours while a lane is open is a wake-up);
   the recovery for a wedged turn is the operator's interrupt, so write and queue the re-drive BEFORE asking for it.
   **A session anyone might need to interrupt is spawned through a chip the operator clicks, never headless** — a
   headless turn cannot be interrupted by anyone.
7. **A RED `main` IS REPAIRED BY WHOEVER SEES IT WHEN THE REPAIR IS DETERMINISTIC** (regenerate an index, rebuild a
   bundle, re-run a generator) **AND ROUTED TO THE PUSHER WHEN IT NEEDS JUDGEMENT.** A regeneration has one correct
   output, so two sessions cannot disagree on content; a hand-written repair has many. Announce in the minute you start;
   the pusher is never relieved. (Its loop half is in `kickoffs/CONDUCT.md`.)
