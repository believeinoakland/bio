# CONDUCT-NEXT — the resume prompt for CONDUCT #12

**Written 2026-09-15 by CONDUCT #11, at a CLEAN WAVE BOUNDARY rather than at a replacement:
zero rows read `running`, zero workers live, `origin/main` green.**

That boundary is why this file is shorter than the one before it and why it carries no live
state. CONDUCT #10 was replaced with six workers running and had to hand them over as state.
Nothing is in flight here. **Verify that yourself before you believe it** — `git fetch origin`,
then `grep -c '· running' docs/development/QUEUE.md` on `origin/main` and `ListAgents`. If
either disagrees with this file, this file is wrong and the tree is right.

Read `CLAUDE.md`, then `kickoffs/CONDUCT.md` (your loop — it gained four sections from this
session, listed in §4), then this.

---

## 1. THE MEASURED STATE at `8d9e068` on `origin/main`, 2026-09-15

| gate | figure |
| --- | --- |
| battery | **205/205 suites · 12,769 assertions**, exit 0 |
| coverage | `--strict` exit 0, `REGISTER_FLOOR` **1087 / 196 / 197 EXACT** |
| UI harness | exit 0, from the repo root |
| plancheck | **0 fail, 0 warn — BARE**, publication half included |
| corpus | 50 governed documents, 0 front-matter failures |
| queue | **0 running · 28 queued** |

**The baseline every worker of this wave measured independently was 201/201 · 12,467**, against
briefs that said 12,466. Eight workers, eight pristine measurements, one figure. Brief the next
wave with 12,769 and expect it to be corrected again — **and treat a worker correcting your
figure as the system working, not as a worker being difficult.**

## 2. WHAT LANDED, 2026-09-15

Twenty items integrated across two waves, all eight of the second wave under the FULL gate on
their own merged trees. The second wave: **REC-99** (the bounds census GRADED — a removed SQL
`LIMIT` now fails by name), **M0-34** (the ruling index stopped minting rulings out of its own
filename; 49 phantom rows adjudicated pointer by pointer), **REC-98** (the per-page tier rule
WIRED, proven by the bundle growing 5,140 bytes), **COFF-11** (the office inner bounds emitted,
with the capacity-not-used-range decision), **FW-18** (three measured content types, and a reader
that had been calling every set of minutes an agenda), **REC-94** (the content level of the
observation log), **REC-90** (the `content:` search arm), **REC-88** (DEC-4 enforced on the
capture axis).

Interfaces moved: **I2 → 2.2.0** (IC-100), **I3 → 15.3.0 → 15.4.0 → 16.0.0** (IC-95, IC-98,
IC-96 — additive before breaking, deliberately, so the major landed last).

## 3. WHAT IS QUEUED AND WHAT IS ACTUALLY RUNNABLE

**Twenty-eight rows read `queued` and most of them are NOT runnable** — read the `depends-on`
line, never the status alone. The cheapest and highest-value runnable row is **COFF-12**: three
lines in `index.mjs` plus two stale sentences, and it makes COFF-11's inner bounds — already
built and already paid for — actually fire. **Its remedy is already MEASURED**: the COFF-11
worker applied the passthrough as a temporary arm, recorded exactly which three assertions flip,
and restored the file byte-identically. That row inherits a verified fix, not a suggestion.

Also runnable and independent: **M0-38, M0-39, M0-40, M0-41** (the background lane holds no slot,
so they wait on nobody), **REC-103**, **REC-105**, **REC-91**, **REC-95**.

**M0-41 is the one I would read before the others even if you never run it**, because its answer
changes how you read the rest of this file. It asks which of this project's instruments are
REQUIRED and which merely EXIST. The case behind it: `mintid` allocates correctly, and four
workers of one wave still collided on one id, because calling it is OPTIONAL and the audit
cannot see a bypass. **Absence is the rare failure here; optional-and-unaudited is the common
one**, and it is invisible precisely because the tool is right.

Queued behind something: REC-100 (waits REC-95), REC-102, REC-104 (waits REC-91), FW-20 (waits
CPDF-19), REC-86/REC-87 (wait REC-97 + UI-61).

## 4. WHAT THE LOOP FILE GAINED, and why each one cost something to learn

`kickoffs/CONDUCT.md` gained four sections this session. Read them; each is a bill somebody paid.

- **THE SPAWN SENTENCE CARRIES A FALSIFICATION CLAUSE, AND THE CLAUSE MUST NOT ASK A READER TO
  CONCLUDE A VALUE FROM AN ABSENCE.** The clause I wrote onto ten rows said *"if none does, this
  row reads `queued`"* — which reads an absence with two opposite causes as one fact, and invites
  a respawn of work already sitting on a branch. **The general form is the part that matters: a
  falsification rule you write for someone else is an INFERENCE RULE, and one that turns "I see
  nothing" into a definite value is a defect however careful the rest of the row is.**
- **A RED `main` IS REPAIRED BY WHOEVER SEES IT WHEN THE REPAIR IS DETERMINISTIC, AND ROUTED TO
  THE PUSHER WHEN IT NEEDS JUDGEMENT.** Mirrored as LIVENESS rule 7 in `ORCHESTRATION.md`.
- **KILL THE TREE, NOT THE LEAF.** A reap that failed by killing children reports identically to
  a reap nobody attempted; only elapsed time tells them apart. Check a reap by AGE.
- **A CORRECTION TO A RUNNING ROW IS YOURS TO PAY AT INTEGRATION**, and this session confirmed
  there is no channel to a live subagent in this harness. A ruling landed on COFF-11's own
  question minutes after it spawned; it went onto the row, and the worker reached the same
  answer independently.

`kickoffs/WORKER.md` gained one: **a log file under `/tmp` with a generic name is not yours, and
its `provenance:` line is the only thing that says so.**

## 5. THE FIVE THINGS THIS SESSION WOULD TELL YOU IF IT COULD TELL YOU ONLY FIVE

1. **THE MERGED PRINT IS THE ONLY FIGURE EVER TRUE OF THE MERGED TREE.** Four of eight branches
   honestly moved `REGISTER_FLOOR` on their own trees — 1065, 1066, 1068, 1087 — every reading
   correct where taken, not one true of the result. Adding deltas would have given 1074 and
   installed permanent slack in a ratchet whose whole purpose is to have none. **The same is now
   true of `SCANNING_MEASURED` in `derivation-bounds.test.mjs`** — REC-99 made it a merged-tree
   property and it moved 103 → 104 the first time it bit.
2. **KEEP-BOTH IS NOT THE DEFAULT; IT IS A JUDGEMENT.** Three times a branch carried the ledger
   row it had branched from while `main` carried the disposition CLOSING it. A blind keep-both
   leaves two copies of one debt row, one claiming a closed debt is open. **Read what the two
   sides SAY before deciding they are both additions.**
3. **AN UNEARNED ABSENCE IS THE SHAPE THIS PROJECT KEEPS PAYING FOR.** BOB #11's sentence, and it
   unified five separate arrivals on one day: a row that outlived its work, a row that outlived
   its worker, a hold that outlived its condition, a delegation that outlived its discharge, and
   a clause reading "no worker" as "no work". **When you conclude something from a query that
   returned nothing, ask what it COST that query to return nothing.**
4. **SWEEP THE `CLAIMS.md` REGISTER; NOTHING ELSE DRAINS IT.** Nine delegations carried no
   discharge. Eight were closed in the tree and said so nowhere; one had been open five weeks
   with a live population. That sweep is manual and was five weeks late — **which is a finding
   about the instrument, and it is rowed as M0-37.**
5. **THE GATE REFUSING YOUR OWN ROW IS THE GATE WORKING.** `plancheck` refused a row I wrote
   because I had copied a worker's scheduling remark into a milestone claim. The refusal was
   right and the row moved to the lane it belonged in. Do not reach for the exemption.

## 6. OUTSTANDING, AND WHO OWNS IT

- **Nothing is owed by me to BOB or by BOB to me.** The BOB INBOX is fully drained; its last
  entry closed by a CORRECTION rather than by an act (act 7 asked for a patch already in the
  tree, and my drain then recorded a HOLD on it — kept and annotated, not deleted).
- **Two questions sit with Bob and only Bob**: DEC-33's second re-entry clause, and the
  case-making thread. REC-15 and UI-17 stay `blocked` until he rules.
- **D-374** is filed and deliberately NOT rowed — it crosses a service boundary and three areas
  and wants a decomposition, not a row. Route it to BOB when the office axis next moves.
- **`IC-101` and `REC-101` are burned ids**, named here rather than left as puzzles.

## 7. STANDING DOWN

Stand down VERIFIED: list your tasks, `TaskStop` each, re-list, confirm zero — and **write this
file before you do it, not after.** After stand-down the main checkout belongs to your successor;
never run `git` in `bio/` again, and relay any late worker report by message instead.
