# CONDUCT-NEXT — the resume prompt for CONDUCT #2

> **WRITTEN AT A CLEAN BOUNDARY, ON PURPOSE AND WITH ROOM TO WRITE IT WELL: zero rows
> `running`, zero live workers, zero live batteries, `origin/main` green, and — the witness
> my predecessor did not have — `plancheck`'s own stranded-work arm reading `0 EXPOSED`.**
> Verify all four yourself before believing this file. If any disagrees, the tree is right.
>
> ```
> git fetch origin && git show origin/main:docs/development/QUEUE.md | grep -cE '^### [A-Z0-9-]+ · running'
> node tools/plancheck.mjs                  # expect 0 fail, and read the `stranded work:` note
> pgrep -f battery.mjs | wc -l              # expect 0
> ListAgents                                # expect no live subagents
> ```
>
> **THE ONE THING TO DO FIRST, because the estate has no driver otherwise: START A WAVE.**
> Not read, not audit, not summarise. Flip, gate, push, spawn. §5 says which rows and why.

**Written 2026-09-17 by CONDUCT #1**, retiring on context budget at a boundary rather than
under replacement. Read `CLAUDE.md`, then `kickoffs/CONDUCT.md` (which gained one section
from this session — §6 below), then this.

---

## 1. THE MEASURED STATE at `29363c98` on `origin/main`

| gate | figure |
| --- | --- |
| battery | **210/210 suites · 13,184 assertions**, 0 skipped, 3 fleet manifests |
| coverage | `--strict` exit 0 unpiped · `REGISTER_FLOOR` **1129 / 201 / 202 EXACT** · `run` 164 · 177 ops declared / 177 reached / 0 unreached |
| UI harness | exit 0 from the repo root |
| plancheck | **0 fail** bare · `stranded work: 0 EXPOSED` |
| queue | **0 running · 23 queued · 289 done · 11 superseded · 4 blocked** |
| disk | **7.4 GiB free at 97%** — the binding constraint on wave size, not the worker budget |

Brief the next wave with **13,184** and expect it corrected. Eight workers confirmed my
figures exactly yesterday and one corrected me; a worker correcting you is the system working.

## 2. WHAT LANDED, 2026-09-16 — thirteen items

REC-91 (the stranded text index, recovered), M0-42, REC-103, M0-36, M0-37, REC-102, M0-43,
REC-111, REC-108, REC-109, M0-48, M0-40, and FLEET's rescued `280f8a5f`. **REC-100 is
`blocked`, not `done`** — see §4.

Interfaces: **I5 → 1.16.0**, **I1 → 1.4.0**, **I3 → 18.2.0** across IC-104, IC-105, IC-108,
IC-109. Three of those proposals named a STALE base; read a version off the tree, never off
a row.

## 3. THE FIVE THINGS I WOULD TELL YOU IF I COULD TELL YOU FIVE

1. **SEVEN FLOOR COLLISIONS AND NOT ONCE WAS EITHER INPUT TRUE OF THE MERGE.**
   `1094 vs 1093 → 1100 · 1097 vs 1100 → 1104 · 1109 vs 1104 → 1109 · 1098 vs 1109 → 1114 ·
   1114 vs 1114 → 1119 · 1108/1111 vs 1119 → 1129`. **The fifth is why you may NOT relax this
   to "check only when they disagree": two branches printed the SAME NUMBER, reached by
   different arms, and the merged truth was neither.** Adding deltas is wrong too — M0-40
   measured that the bounds class and the census ratchet cannot move independently. Re-read
   from the merged tree's own POST-COMMIT print, every time, and expect a `Dropped-from-branch:`
   trailer to be owed.
2. **A RUNNING SUBAGENT CAN BE REACHED, and two kickoff files still imply otherwise.**
   `SendMessage` to a live subagent queues for its next tool round. It paid for itself twice:
   one worker resumed from a stopped state with uncommitted work, and four stranded-work
   exposures were cleared by asking. **BOB's narrowing holds and I adopt it: a RESUME is
   measured; a running worker APPLYING a mid-run design correction is NOT.** Use it as a
   RESCUE; keep paying corrections at integration with an actor named.
3. **THE PRUNE CRITERION IN `CONDUCT.md` ASSERTS THE WRONG ANSWER ABOUT LIVE WORKERS.** Under
   disk pressure it called **all six of my live workers "prunable"**, because a worker that
   has not committed yet still has its tip at `origin/main`. **The fix arrived as D-288's arm:
   `0 EXPOSED` certifies the precondition DIRECTLY — no worktree holds work that exists only
   on this disk — which is the question ancestry cannot answer.** With that, plus a live-list
   and the harness LOCK (which refuses a removal even under `--force`), pruning is safe: six
   worktrees came out for **+3.8 GiB**. Three remain locked and you inherit them.
4. **`gates: GREEN` DOES NOT IMPLY BARE `plancheck` GREEN, in BOTH directions.**
   `corpuscheck`'s date arm cannot fire before the commit, so a governed document's Status
   date must move in the SAME EDIT as its body. And I once had `--local` pass on a state line I
   had written and never STAGED — the instrument read my working tree and the commit did not
   contain it. **The tree you edited and the commit you pushed are different objects.** Run
   bare `plancheck` AFTER committing, and remember the instrument itself reads LOCAL files: I
   nearly announced a red `main` that BOB had already fixed, because I was one commit behind.
5. **FOUR WORKERS REFUSED WHAT THEIR ROW ASKED FOR AND EACH REFUSAL WAS THE RESULT.** REC-100
   would not delete the carve-out (it deadlocks run closure); M0-40 found the classifier
   cannot follow a local binding because **21 of 35 memberships rest on a false credit**;
   M0-35 found a blocker false for 39 days and that the hazard is **miniflare quoted as
   deployed**; REC-111 found both existing bounds were ACCIDENTS. **Write rows that can be
   refused, and read a refusal as a finding.**

## 4. WHAT IS OUTSTANDING, AND WHO OWNS IT

- **D-288 is CLOSED** (BOB #12, `b89dd42e`, all three windows driven live). **Item 3 —
  prune-on-merge, `M0-49` — is UNBUILT** and BOB ruled explicitly that it does not hold the
  row open: it maintains a signal rather than protecting work.
- **`REC-100` is `blocked`, not done**, on a design ruling that is not a worker's: what a
  terminal entry's referent IS, or the grounds for exempting a ROLLUP. Routed to BOB. Its
  read half is `REC-113` and is buildable today.
- **`REC-15` and `UI-17`** stay blocked on Bob reopening the case-making thread (DEC-33).
  BOB has put the priority question to him. **Do not wait on it** — it changes which wave
  comes after, not whether this one runs.
- **`CPDF-3`'s blocker is environmental no longer:** BOB measured that this machine reaches
  `api.cloudflare.com` and the token witnesses the pinned account. **Whether to cut a release
  is DIST's gate and Bob's authorisation — not yours and not mine.**
- **Rows I opened from worker reports:** REC-109/110/112/113/114, M0-51, D-383/384/385/386/
  388/389/390/392. **`M0-51` is the one I would read**: `hasDriver` measures a NAMING
  CONVENTION, and twelve control drivers are invisible to the register. I refused the
  one-file spot-fix on purpose — one of the twelve was work I had merged an hour earlier, and
  renaming the instance you introduced is the most tempting and least honest fix available.
- **Three agent worktrees are LOCKED** (`a46502db`, `a4fe7194`, `af799694`) and refuse removal
  even under `--force`. ~1.9 GB. Not a failure; the lock is a guard.

## 5. THE WAVE I WOULD RUN, AND THE ARGUMENT YOU MAY OVERTURN

I flipped these six, gated, pushed, spawned three — and then reverted all six when I was
directed to stand down. **The rows carry that reversal in their own words. The reasoning
survives it:**

**Of 23 runnable rows, only TWO are member-facing.** `SK-5` is not schedulable (its surface
registry is unbuilt). **`UI-62` — where a member READS a passage — waits on exactly one thing,
`REC-92`**, which became runnable only because REC-91 landed yesterday after being stranded
on a machine nobody could reach. `CLAUDE.md`'s opening doctrine is that all of this is
SUBSTRATE for the member's path. **A wave of pure substrate is defensible; a wave containing
none of the path is worth a sentence of justification.** So: **REC-92 first.**

Then **REC-96** (the completeness statement, PUBLISHED with the case — the overclaim class in
its purest form), **REC-107** (one-sided evidence: the record unable to say which level was
empty), **M0-44** (unblocked by M0-40 yesterday), **M0-49** (D-288 item 3), **REC-112** (the
index serving no reader). Four touch the contended plane files, under the cap of five.

**Size to the DISK, not to the budget.** A worker worktree costs ~634 MB measured. At 7.4 GiB
free, six is comfortable and eight is not.

## 6. WHAT `kickoffs/CONDUCT.md` GAINED, AND IT IS THE FINDING OF THIS SESSION

**A LOOP THAT DEPENDS ON A SESSION CONTINUING IS NOT A LOOP.** I did nothing for **nine hours
and twenty minutes** with 23 runnable rows and zero workers. Not stuck, not blocked: a session
with nothing to respond to has no next turn. Every step of that file's loop is written and
**nothing runs it** — it ran all of 2026-09-16 because Bob and BOB kept handing it EVENTS.

**And every instrument said healthy throughout.** plancheck 0 fail 0 warn, zero rows running,
zero exposed work, green `main`. All true. **None of it said nobody is working.** That is the
unearned-absence class at the top of the stack: no activity means either the work is done or
nobody is running the loop, **and the board renders those identically, in green.**

The practice: **treat the END of a wave as the START of the next act, in the same turn. The
dangerous moment is not a worker failing — it is the last integration succeeding**, and
*reporting that the wave is complete* is the shape of the mistake, exactly as *reporting that
a slot is free* was. BOB has now built the durable half as a heartbeat in its own session; it
will alarm loudly if BIO has no integrator. **That alarm is the mechanism working, not a
defect to suppress.**

## 7. STANDING DOWN

Verified, not announced: three workers `TaskStop`ped and confirmed (all were at SETUP — none
had committed, claimed a path, or minted an id), six flips reverted and pushed, **0 running on
the remote**, 0 live batteries, `plancheck` 0 fail, and the estate's only exposure is BOB's
own unpushed heartbeat commit, which is BOB's to push and it has been told.

**Do not leave an unpushed branch anywhere.** This session spent its first hours proving what
that costs.
