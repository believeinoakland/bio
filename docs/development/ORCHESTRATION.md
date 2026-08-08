# How this project runs: CONDUCT, BOB, and the work queue

Established 2026-07-31, when parallel development moved into Claude Code and the
`ARCH` role was renamed `CONDUCT`. `PARALLELISM.md` is the WHY (work parallelises
across stable interfaces). This is the HOW: who runs, how work flows, what the
limits are.

## Roles

- **BOB** — the human, working through a dedicated session (`kickoffs/BOB.md`).
  Where requirements, UX and architecture are decided. Its product is not prose
  but DECOMPOSITION: a decision, its full implications, and the independent
  pieces of work it becomes — each scoped and named with the interface it sits
  behind. BOB hands decompositions to CONDUCT.
- **CONDUCT** — the orchestration/integration session (`kickoffs/CONDUCT.md`),
  the evolution of `ARCH`. Owns the queue, spawns workers, verifies and
  integrates their output on `main`, records claims/delegations/interfaces, and
  escalates ONLY genuine decisions to BOB. Writes no area code itself.
- **Areas** — RECORD, CAPTURE, CONTENT-PDF, DIST, and dormant CONTENT-HTML /
  FRAMEWORK / UI. Each is a body of work with a queue, not a standing agent.

## Workers are ephemeral; the queue persists

A worker is a worktree-isolated sub-session CONDUCT spawns to do ONE queued
piece. It builds, tests, reports, and ends — it does not live on and pull its
own next task. The persistence is in `QUEUE.md`: CONDUCT takes the top runnable
item for an active area, spawns a worker, integrates the result, marks it done,
and spawns the next. A larger plan is a sequence of queued items drained one
worker at a time — which is how CONDUCT "keeps spawning successive tasks"
without a long-lived agent.

## Where the plan lives (2026-07-31)

Three files, split by LIFECYCLE, and an item exists in exactly one of them at a time:

- **`MILESTONES.md`** — the capability ladder. What the work is FOR, what each
  milestone's acceptance is in terms of the record, and where every open piece of work
  is placed. Slow-moving.
- **`QUEUE.md`** — what is RUNNABLE. CONDUCT's, sole writer. Drained.
- **`DEBT.md` / `MEASUREMENTS.md` / the design docs** — knowledge. Append-only, and
  an INPUT to the queue rather than a rival to it.

**Nothing is work until it is in `QUEUE.md`.** `PLAN.md` is closed history.

## The flow

1. BOB reaches a decision and decomposes it into independent pieces, each placed
   under a milestone.
2. CONDUCT enqueues each piece in `QUEUE.md` under its area, with the interface
   it sits behind and its depends-on. **CONDUCT is the GATE:** nothing becomes
   runnable until CONDUCT has confirmed it is genuinely independent (behind a
   stable interface or on non-overlapping paths) or explicitly ordered.
3. CONDUCT keeps the active areas' workers busy from the top of each queue.
4. A worker lands its piece; CONDUCT verifies (`npm run test:battery` — the whole
   battery, every suite reported — plus the item's own `accepts-when:`, plus a
   re-run of the negative control for destructive or security-sensitive changes),
   integrates on `main`, records bookkeeping, and spawns the area's next item.
   `VERIFICATION.md` defines what "done" requires and holds the coverage floor.
4a. **When an area's queue DRAINS**, before promoting the next area, CONDUCT triages
   that area's `UNSCHEDULED` items from `MILESTONES.md` into the queue, or leaves them
   with a reason. Tying the triage to an event that already happens is what keeps the
   plan from falling behind the ledger again.
5. Cross-area needs are DELEGATIONS (`CLAIMS.md`); CONDUCT routes them into the
   owning area's queue.

## COMMUNICATING A CHANGE: the channels, and how to choose one

**This is the skill this ecosystem runs on, and it is the one that has failed most
often.** Established 2026-07-31 after a single session produced four coordination
failures in an afternoon, every one of them a change that was CORRECT and did not
reach the party who needed it. Read this before making a change that another session
must know about.

### The principle everything below derives from

**The repository is the channel. A change is not made when it is written; it is made
when it is COMMITTED AND PUSHED.** Sessions do not share a working tree — one session
per tree, `CONDUCT` holds main, everything else works in a worktree
(`PARALLELISM.md`). A worktree is a checkout of a COMMIT, so an uncommitted file
reaches nobody and an UNTRACKED one cannot even be found.

Two corollaries that are not obvious and have each cost a session:

- **A mechanism that is not in the loop the reader actually runs is not a mechanism.**
  Documenting it is necessary and never sufficient. If you add a step, add it to the
  file whose owner performs it.
- **Verify from the REMOTE, not from your own tree.** "Written" is not "committed" and
  "committed" is not "pushed" — the same discipline `deploy.mjs` applies to bytes.

### The channels

| you need to… | use | shape |
| --- | --- | --- |
| hand a change from BOB to CONDUCT | **`BOB INBOX`**, top of `QUEUE.md` | BOB appends; CONDUCT is sole writer below it and drains as loop step 0 |
| raise a question to the architecture side | **`DECISIONS.md`** | CONDUCT is sole writer of entries; `for: bob` or `for: bob-session`; the BOB session triages |
| tell the NEXT session in your area what you learned | **that area's kickoff** | rewritten at the close of your turn, by you |
| need work inside another area's paths | **DELEGATION in `CLAIMS.md`** | append the need; continue with your own work; never edit their paths |
| change a shape another area builds against | **`INTERFACE-CHANGES.md`** protocol | PROPOSED → RESPONSES → RESOLUTION → CHANGING → CHANGED → SETTLED |
| record a defect, a number, or a design | **`DEBT.md` / `MEASUREMENTS.md` / the design docs** | append-only; knowledge, and an INPUT to the queue, never a rival |
| wake a session that is already mid-run | **a short nudge, pointing at what to re-read** | the ONLY legitimate use of a pasted prompt |

**Choosing badly has a cost in one direction only.** A misfiled entry costs one
reclassification. An unraised one costs the thing going unrecorded. So when in doubt,
raise it — and raise it in a FILE, not in a session window.

### The rules that make the channels work

1. **Disjoint regions, sole writers.** Two parties never write the same region of a
   file. The `BOB INBOX` is BOB's; everything below it is CONDUCT's. This is the
   producer/consumer split D-98 already proved for the task inbox.
2. **A notification, not a second copy.** An entry says what changed, points at where
   the detail lives, and names the items it affects. Restating the content creates a
   copy that immediately starts rotting.
3. **Supersession is never silent.** A superseded item keeps its id, takes status
   `superseded`, and names what replaced it and where any branch work goes. An item
   that vanishes is indistinguishable from one nobody did.
4. **Announce the change; do not reach into the running turn.** Whether to stop a
   worker is CONDUCT's call. The raiser's duty is visibility, not lifecycle.
5. **Never block on an answer.** Every unsettled decision carries a `provisional:`
   saying what runs meanwhile; a deferral carries a `trigger:` that reopens it.
   Bob, 2026-07-31: "never block on getting my answer when you can figure it out
   yourself… productivity is a top priority."
6. **Correct what your change superseded, in the SAME turn, yourself.** This is the
   one licensed exception to "do not write another area's kickoff", because that
   area's next session is precisely who the stale text misleads.
7. **An area may not be ACTIVE without a kickoff naming its paths.** Activating an
   area and writing its kickoff are one act.

### The failure modes, with their receipts

Kept because this project learns from evidence, and every one of these looked like
diligence at the time:

| what happened | why it reached nobody |
| --- | --- |
| a required kickoff was written and left UNTRACKED while three workers ran | a worktree is a checkout of a commit; untracked files are unreachable, permanently |
| the `BOB INBOX` was documented in two places | it was never added to `kickoffs/CONDUCT.md`, so nothing drained it |
| BOB and CONDUCT shared the main checkout | a rule written for ONE coordinating session was inherited by two when `ARCH` split; a claim reserves paths BETWEEN checkouts and does nothing about two sessions in one |
| **the same thing happened AGAIN when DIST split off** — on 2026-08-05 a DIST session committed its handover inside CONDUCT's tree four minutes before CONDUCT committed there, and either could have swept up the other's files | the rule lived in `kickoffs/CONDUCT.md`, `PARALLELISM.md` and **every area kickoff written before the split** — and in neither `kickoffs/DIST.md` nor the `DIST-NEXT.md` resume prompt, which positively instructed the new session into `bio/`. The prompt was written by a CONDUCT session that was holding the DIST role at the time, so "the working directory is `bio/`" was TRUE when written and became false the moment the role split. **A resume prompt is a mechanism, and it inherits nothing.** When a role splits off yours, the split is not done until the new role's own kickoff carries every rule you were relying on being true of yourself — swept for, not recalled |
| `kickoffs/CONTENT-PDF.md` told its next worker to bundle `unpdf` into the plane | the queue was updated and the kickoff was not |
| a coordination question reached Bob's ear instead of the record | `DECISIONS.md` had one destination, so there was nowhere to put something that was not his |
| a debt row named its milestone in PROSE | the token is the sortable part; a check that only says "wrong" makes the reader guess |
| a memory holding a standing instruction never loaded | it existed, correctly written, with no line in the index that loads it |
| **a worker's negative-control harness was OVERWRITTEN MID-TURN by another worker running in parallel** (PL-10, 2026-08-07) | **the scratchpad directory is SHARED between concurrent worker sessions.** Two workers wrote a harness to the same path; the second replaced the first while it was between arming a control and restoring the file. PL-10's controls had already run and its tree was verified, so nothing was lost — **but a harness silently replaced between ARM and RESTORE could report a restore it never performed**, and this project has already met an NC harness that reported a byte-identical restore over a file that had not been restored (UI-38). **THE RULE, and it is now in every brief CONDUCT writes: a worker writes its control harness INSIDE ITS OWN WORKTREE, never to a shared scratchpad — and verifies every restore by CONTENT as well as by hash.** A worktree is the one place a worker owns alone; that is what it is for |

### Before you end a turn

```
node tools/plancheck.mjs
```

It refuses an unpublished or unpushed planning surface, an ACTIVE area with no
kickoff or no register row, an item behind an unregistered interface, an unknown
milestone, an open debt row with no disposition token, an unsettled decision with no
provisional, a deferral with no trigger, an enacted decision naming no document that
carries the reasoning, and a channel that exists while a kickoff never mentions it.

**What it cannot check, and is therefore yours:** whether an entry describes the
change ACCURATELY, whether a kickoff correction is COMPLETE, and whether a
supersession names every affected item. The instrument proves the structure holds; it
cannot prove the prose is true.

## Concurrency: sized to CONDUCT, not to the subscription

CONDUCT integrates serially, so it is the bottleneck; parallelism is sized to
what it can verify-and-land, not to the raw subscription ceiling. Standing
budget: **two active development areas at once**, plus the BOB session and DIST
when a release is being cut. That is about all CONDUCT keeps integrated cleanly;
more workers pile up behind it.

**Refined 2026-07-31: a slot is held by work that CHANGES PLANE BEHAVIOUR.** The limit
exists because verification and integration are serial and expensive, and two kinds of
work are neither:

- **Measurement-only items**, which commit no code and produce a decision input
  (CPDF-1 and CPDF-7 are the pattern). Integration is an append to
  `MEASUREMENTS.md`.
- **Test-estate items** (the M0 lane), which add assertions and change no behaviour.
  A worker either leaves the battery green or does not land.

Both still cost a worker and still get verified; neither occupies one of the two
slots, because the thing the slot rations is CONDUCT's behavioural-verification
attention. Getting this wrong in the other direction has a real cost: measurement work
gates design decisions, so parking it behind a behavioural queue is how a session ends
up building against an assumption it could have measured in one turn.

## Pipelining: dormant areas wait their turn

Areas beyond the two active ones stay DORMANT with their queues pre-seeded. When
an active area's queue empties, a dormant area is promoted into the freed slot.
Define the pipeline ahead of time, run two, let the rest wait in the wings.

## The target is integrated-correct throughput

Not agent busyness. An idle ephemeral worker costs nothing; work that lands
wrong, or piles up unintegrated, costs a lot. Optimise for pieces that land
green and meet every objective, policy and standard — the only throughput that
counts.
