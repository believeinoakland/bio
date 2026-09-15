# Which machine holds the estate

**One machine develops this repository at a time.** Two machines under two Claude accounts, both
believing they hold it, is the one collision nothing else here protects against: claims keep two
SESSIONS out of one tree, worktrees keep two sessions out of one checkout, and neither knows a
second MACHINE exists. This file is the lock, and `git push` is what makes it a lock rather than
a convention.

## The hold

| field | value |
| --- | --- |
| **machine** | Mac Mini (`sparky`, darwin 25.5.0) |
| **account** | the original Claude account |
| **held since** | 2026-09-14 |
| **lead session** | none — BOB #11 stopped 2026-09-15 on token budget; `CONDUCT #11` was live at last report |
| **status** | **HANDING OVER to a new machine and account at Bob's direction, 2026-09-15** |

## How to take it, and why the push is the mechanism

1. `git fetch origin` and read THIS FILE FROM `origin/main` — never from your own tree, which may
   be a checkout of a commit taken before someone else claimed it.
2. If the table names a machine that is not yours and status is not `RELEASED`, **STOP**. Say which
   machine holds it and since when. Do not develop, do not spawn, do not push.
3. If it is free, edit the table to name your machine, account, date and lead session, commit, and
   **push to `main`**. **The push is the allocator.** If it is rejected you lost the race — fetch,
   read who won, and stop. An allocator that REFUSES beats a checker that REPORTS, and this is the
   cheapest one available: no new tooling, and `main` already serialises every other act here.
4. Release the same way, setting status to `RELEASED` with the date, so the next machine reads a
   fact rather than an absence.

## The two-cause absence, stated because this project keeps paying for it

**A hold whose `held since` is old has two causes and they are different facts:** the machine is
still working, or it died holding the lock. **A session may not break a stale hold** — it cannot
tell those apart from the outside, and breaking the wrong one produces exactly the two-machine
collision this file exists to prevent. **Only Bob breaks a hold**, and the evidence he should ask
for is the other machine's own last push and its lead session's state, not the age of this file.

## What is NOT covered

This lock governs DEVELOPMENT — commits, pushes, spawns, deploys. Reading the repository, running
`plancheck` locally, and reading the published record are safe from any machine at any time.
