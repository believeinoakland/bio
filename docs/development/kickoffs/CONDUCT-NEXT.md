# CONDUCT-NEXT — the resume prompt for CONDUCT #3

> **WRITTEN AT A CLEAN BOUNDARY, RULED BY BOB #13 RATHER THAN CHOSEN BY ME: zero rows
> `running`, zero live subagents, two waves fully integrated, `plancheck` 0 fail, and every
> claim from 2026-09-17 RELEASED.** Verify all of it yourself before believing this file.
> If anything disagrees, the tree is right.
>
> ```
> git fetch origin && git show origin/main:docs/development/QUEUE.md | grep -cE '^### [A-Z0-9a-z-]+ · running'
> node tools/plancheck.mjs                  # expect 0 fail; read the `stranded work:` note
> git ls-remote --heads origin 'worktree-agent-*' | wc -l   # expect 3, and they are D-397's
> pgrep -f battery.mjs | wc -l              # expect 0
> ListAgents                                # expect no live subagents
> ```
>
> **THE ONE THING TO DO FIRST: ARCHIVE ME.** `node tools/retirable.mjs` (BOB #13's, landed
> `3e9e31b6`) judges it. Closing this session releases **six agent worktrees at ~3.8 GiB**
> that are locked by its app process and nothing else — **and closing me does NOT reclaim
> them; that is a SEPARATE act** (§6).
>
> **THEN START A WAVE. `REC-115` LEADS, ruled by BOB #13.** Not read, not audit, not
> summarise. Flip, gate, push, spawn.

**Written 2026-09-17 by CONDUCT #2**, retiring on BOB #13's ruling at a boundary rather
than on context exhaustion. Read `CLAUDE.md`, then `kickoffs/CONDUCT.md`, then this.

---

## 1. THE MEASURED STATE at `5f70a39f`+ on `origin/main`

| gate | figure |
| --- | --- |
| battery | **213/213 suites · 13,395 assertions**, 0 skipped, 3 fleet manifests, provenance 216/216 |
| coverage | `--strict` exit 0 unpiped · `REGISTER FLOOR` **arms 1148 · classified 204 · corpus 205** · run 167 |
| UI harness | exit 0 from the repo root, unpiped |
| plancheck | **0 fail** |
| queue | **0 running · 20 queued · 5 blocked** |
| remote worker branches | **3, and they are exactly `D-397`'s three unintegrated items** |
| disk | **6.5 GiB free at 97%** — no longer the binding constraint |

**Brief the next wave with 13,395 and EXPECT IT CORRECTED.** Eight workers across two waves
confirmed my figures exactly and four corrected me; a worker correcting you is the system
working, and every one of those corrections was right.

## 2. WHAT LANDED — two waves, nine items

**Wave one:** `M0-49` (D-288 CLOSED in full), `M0-51`, `REC-92`, `REC-96` (D-196 closed),
`REC-107`. **Wave two:** `UI-62`, `REC-112`, `M0-52`, `M0-54`.

**I3 went 18.2.0 → 19.0.0**, one bump carrying IC-110 + IC-112 + IC-114. The MAJOR is
IC-112's alone and was **ruled against both the design and the row, which said minor**:
C-41.10 now refuses a case document lacking its `searched` section, a refusal where none
stood before, and IC-25 settles that as breaking whatever the measured impact.

**THE MEMBER PATH IS OPEN, AND THAT WAS THE POINT OF BOTH WAVES.** Of 23 runnable rows at
the start only TWO were member-facing; `SK-5` was unschedulable and `UI-62` waited on
`REC-92` alone. Wave one led with REC-92 so UI-62 could exist; wave two shipped it. **A
member can now search what captured documents SAY, read a passage carrying the record's own
`ref`, jump to the extent, and cite it onto a question's basis — with the absence statement
naming all four levels in the plane's own words, on a hit as well as a miss.**

## 3. THE FIVE THINGS I WOULD TELL YOU IF I COULD TELL YOU FIVE

1. **A HOLD OUTLIVED ITS CONDITION AND COST FOUR COMPLETE WAVES HOURS OF IDLE, AND NOTHING
   IN THE ESTATE COULD SEE IT.** Bob paused me for a network outage; the outage ended; the
   releasing condition existed and nobody applied it. **Compounded by a second failure with
   the same signature: `conduct-heartbeat` had run THIRTEEN times reporting `succeeded` and
   had never poked anybody**, because its step 3 probed `ps aux | grep battery.mjs`
   MACHINE-WIDE and read any session's battery as proof MY workers were alive — so BOB's own
   gate runs suppressed the instrument built to wake me. **A stale hold plus a dead poke,
   with every board green.** Both are fixed (`D-400`). **The lesson is not *check your
   holds*: it is that a hold is a CLAIM, and the only auditable form is one that names its
   releasing condition where a reader will meet it.**
2. **FOUR WORKERS CORRECTED MY BRIEFS AT THE ARTIFACT AND EVERY CORRECTION WAS RIGHT.**
   REC-96 proved its code already published the honest negative my ruling assumed was
   missing; UI-62 found the per-row cause fields I told it to consume are computed and
   DISCARDED by its op; REC-112 showed the index was not the only evidence of intent, so
   deleting it would have broken two live control arms; M0-54 RETRACTED its own headline
   measurement before I could publish it, having read a parent process's idle CPU and
   inferred a starved fleet. **Write briefs that can be falsified and read a refusal as a
   finding.** My ruling to REC-96 was a sound RULE-claim with a WORLD-claim premise I settled
   by reading a report instead of the tree — those are two different questions.
3. **THE FLOOR COLLIDED FOUR WAYS AND NOT ONE INPUT WAS TRUE OF THE MERGE.** M0-51 read arms
   1136, REC-92 1135, REC-96 1134 — each correct from its own green post-commit print. The
   merged tree printed **1147**. **Two of them printed IDENTICAL `classified` and `corpus`
   figures by different arms**, which is why this may NOT be relaxed to
   check-only-when-they-disagree. The deltas happened to sum; **that is recorded as a
   coincidence, not a method.** Re-read from the merged tree's own print, every time.
4. **I PUSHED `main` RED FIVE TIMES ON A STALE `docs/DECIDED.md`** — four pushes and one
   merged-tree battery — **with the correct rule written down MID-SESSION and then broken
   twice more.** Two causes: editing prose after regenerating, and **a rebase landing a
   peer's rulings UNDERNEATH a fresh index, which no amount of care reaches.** Rowed as
   **`M0-56`**; until it lands, **regenerate after the LAST prose edit AND the LAST rebase,
   immediately before the push.**
5. **I COMMITTED A FILE CONTAINING CONFLICT MARKERS.** `git add -A` after a conflicted merge
   staged them because I read only the TAIL of the merge output and the conflict line was
   above my cut. The battery caught it at five suites red. **Run
   `git grep -n '^<<<<<<< '` over the whole tree before every merge commit** — one command,
   and it is the check I skipped. A generated artifact in conflict (the bundle, the index) is
   **REBUILT, never hand-resolved.**

## 4. WHAT IS OUTSTANDING, AND WHO OWNS IT

- **`REC-115` LEADS THE NEXT WAVE, ruled by BOB #13** on the doctrine that a defect making
  the record claim more than it can support is worse than a missing feature. `op=meaningrows`
  means two things by *in scope* in one envelope, so `scope.documents` collapses on any
  passage miss and **the two honest branches of `says` are unreachable by any passage miss at
  all** — a member who searched two indexed documents is told *no document was in scope*.
  **On the surface UI-62 just shipped, reachable today.** Measured as `M-43`.
- **`REC-116` is `blocked` ON BOB, not runnable — do not spawn it.** BOB #13 took the design:
  *the item follows the design, not the other way round.* The construct has **NO HOME
  DOCUMENT** — `BIO_System_Design.md` never mentions the route marker. **`D-404` tracks that
  nothing checks whether a queued item's substrate exists, and MY OWN ROW IS THE RECEIPT: it
  named an authority that does not govern its subject and passed `plancheck`'s row-design
  arm.**
- **`M0-56`** — the stale-index mechanism. Decide the shape and argue it; a gate that
  MUTATES the tree it measures is a property this estate should not grant lightly.
- **`D-397`** — the three genuinely unintegrated branches (D-254, UI-43, D-270), never
  merged by M0-54 as its own acceptance required. **The three remote branches ARE these.**
- **`REC-15` and `UI-17`** stay blocked on Bob reopening the case-making thread (DEC-33).
  **Do not wait on it.**
- **Rows I opened:** REC-115, REC-116 (blocked), M0-54 (done), M0-56, D-397, D-404, DIST-5,
  FW-21. **`DIST-5` is NOT runnable by a general slot** — there is no DIST session.

## 5. WHAT M0-54 OVERTURNED, AND WHAT IT DID NOT

**D-288's ruling that a remote `worktree-agent-*` branch MEANS unintegrated work is WRONG
FOR TWO BRANCHES IN EVERY THREE: 6 LANDED / 3 UNINTEGRATED / 0 UNDETERMINED, bimodal with
nothing between 7.8% and 92.3%.** Four landed-but-rebased-away, two landed by effect.
**Its discrimination control is the method to copy:** the liar's check passed 9/9 with no
power, and then arm B showed `CLAIMS.md` survival is **UNCORRELATED** — a provably landed
branch scores 0% on it — so keying on the shared file does not merely lack power, **it
actively misclassifies.**

**WHAT SURVIVES UNTOUCHED is the half that mattered:** D-288's realised cost was REC-91
reaching nobody, and **item 1 — the worker pushing its own branch — fixes that at the only
actor guaranteed alive.** The branch list is an audit trail for a failure item 1 now
prevents, and **pruning keeps it legible: I pruned 21 branches across this session, every one
ancestry-verified, and the remaining three are exactly the rowed ones.** The honest
conclusion is that the estate has a SECOND residue nobody rowed — **the local WORKTREE,
which the harness locks and nothing reclaims** — and that one is the harness's, not ours.

## 6. WHAT CLOSING ME RELEASES, MEASURED — AND IT NEEDS A SEPARATE ACT

**Six agent worktrees, ~3.8 GiB**, locked by this session's app process (pid 24472) and
nothing else. Every one is **merged, clean, and an ancestor of `origin/main`** — verified
per-worktree, not assumed — so they fail only *holder provably dead*.

**BOB #13's CORRECTED RULE, and it cost us both a wrong diagnosis: THE LOCK DOES NOT RELEASE
WHEN THE HOLDER EXITS. It just stops meaning anything.** I armed a watch on a dead holder's
pid expecting the locks to lift; **it fired and the naive conclusion would have been wrong.**
A dead holder leaves a **STALE** lock nothing cleans up — a third state neither of us had:
not alive-and-protecting, not released, but **dead-and-still-refusing.** So:
**unlock only where the holder is PROVABLY DEAD, the tree is CLEAN, and the tip is an
ANCESTOR — re-verified at the moment you act, not from any earlier check.** I refused to
unlock live-held ones and BOB #13 confirmed the predicate agrees: it calls all six
PROTECTED or HOLD, never RETIRABLE.

## 7. STANDING DOWN

Verified, not announced: **zero live subagents** (`ListAgents`), **zero battery processes**,
**zero rows `running` on the remote**, **every 2026-09-17 claim RELEASED** — eight of them
LATE, found by sweeping every block for a missing `released:` line rather than trusting each
had been handled, which is the method to keep — **21 remote branches pruned with three left
that are all rowed**, `plancheck` 0 fail, and my own tree pushed with nothing uncommitted.

**WHAT WILL RESTART YOU AND WHO HAS TO DO IT:** `conduct-heartbeat` fires every 20 minutes
in its own session and now gates solely on your own queue row — **no proxy, after its
machine-wide battery probe was found to have suppressed it thirteen times.** It will give you
a turn when you are idle with runnable work. **Treat a heartbeat as a TURN, not an
instruction: sequencing is yours, and if the right answer is that nothing should run, say so.**

**And the durable half is still the practice, not the timer: treat the END of a wave as the
START of the next act, IN THE SAME TURN.** The dangerous moment is not a worker failing — it
is the last integration succeeding. **Reporting that the wave is complete is the shape of the
mistake.** I did that correctly once, between wave one and wave two, and it is the only
reason two waves landed today.
