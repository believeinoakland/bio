# Which machine holds the estate

**One machine develops this repository at a time.** Two machines under two Claude accounts, both
believing they hold it, is the one collision nothing else here protects against: claims keep two
SESSIONS out of one tree, worktrees keep two sessions out of one checkout, and neither knows a
second MACHINE exists.

## The hold

| field | value |
| --- | --- |
| **machine** | Mac Mini (`sparky`, darwin 25.5.0) |
| **account** | the original Claude account |
| **status** | **RELEASED 2026-09-16** |
| **held through** | — (released; a new machine may claim it) |
| **evidence for the release** | `origin/main` last moved at `93ecbd5`, *"work suspended at the operator's direction"*, **16 hours** before the release; **zero rows read `running`**; no session on this machine is running; BOB #11 stopped 2026-09-15 and CONDUCT #11 was suspended at Bob's direction with six of seven integrated. |

## How to take it, and why the push is the mechanism

1. `git fetch origin` and read THIS FILE FROM `origin/main` — never from your own tree, which may
   be a checkout of a commit taken before someone else claimed it.
2. **The hold is free if `status` is `RELEASED`, or if `held through` is in the past.** Otherwise
   STOP: say which machine holds it and through when. Do not develop, spawn or push.
3. To claim it: set `machine`, `account`, `status: HELD`, and **`held through` = now + 48 hours**,
   commit, and **push to `main`**. **The push is the allocator.** A rejected push means you lost the
   race — fetch, read who won, and stop. An allocator that REFUSES beats a checker that REPORTS.
4. **REFRESH IT AS PART OF AN ACT YOU ALREADY PERFORM, never as a separate chore**: the lead extends
   `held through` whenever it pushes a planning surface, and the integrator does the same at each
   integration. A mechanism that is not in the loop the reader actually runs is not a mechanism.
5. **Release explicitly at stand-down** — set `status: RELEASED` with the date and the evidence, so
   the next machine reads a fact rather than an absence.

## Why `held through` and not `held since` — this file's own first failure

**The first version of this file was released by nobody and it failed within hours, exactly as the
class predicts.** It carried `held since` and instructed a session to release at stand-down, which
made the release a VOLUNTARY ACT BY A SESSION THAT MIGHT NOT SURVIVE TO PERFORM IT. The integrator
was then suspended mid-flight at Bob's own direction, never reached the stand-down the instruction
named, and **the hold outlived the condition it was holding for** — the machine stopped developing
and the file went on saying it held. That is the third of `CLAUDE.md`'s six doors, reproduced in a
new file hours after being written down.

**`held since` makes staleness a JUDGEMENT with two causes** — still working, or died holding it —
which is why the first version had to end *"only Bob breaks a hold"*, putting the human back in the
common case. **`held through` makes expiry a FACT**: a hold past its date is expired whatever the
reason, no adjudication, no escalation. The two-cause absence disappears because nothing has to be
inferred from silence.

**The 48 hours is a bound, not a measurement**, and it is deliberately generous: the cost of an
over-long window is a new machine waiting, and the cost of a short one is a working machine losing
its lock. If a real window is ever wanted, measure the longest legitimate gap between pushes across
a wave and set it from that.

## What is NOT covered

This lock governs DEVELOPMENT — commits, pushes, spawns, deploys. Reading the repository, running
`plancheck` locally, and reading the published record are safe from any machine at any time.
