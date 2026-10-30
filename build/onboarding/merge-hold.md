# The seed merge and the paused tranche T53

**Recorded** · the onboarding session (`session_01RAN5enDmeZrZ7DWruQ5vgK`), 29 Oct 2026, before opening the seed pull request (ONBOARDING §2, step 8); decided by Bob 30 Oct.

**What is running.** Tranche T53 of the product is open: `tranche/T53` @ `122605e5` holds 2,030 commits not on `main`; its plan (`build/plan/current.md` there) reads **Status · OPEN**, round R1, layers 1-4 closed, layers 5-11 open, twenty jobs named. Its handoff (BOB #334 to BOB #335, `db686dc2`) says product work is stopped by Bob (K5791: "Don't start the next layer. The development process needs to be fixed first."), so the tranche is paused, not closed; its own plan resumes it under the new process (its R4).

**First, held.** The seed was opened on 29 Oct and held for T53's close, so that the process would not change under a running tranche (P12).

**Bob's decision, 30 Oct.** Asked to choose between (A) closing T53 under the old process before the seed merges, and (B) merging the seed now, while T53 is paused and nothing runs, and resuming T53 under the new process, Bob answered: **"Go with B"**. The seed merged on 30 Oct with `main` unmoved since T53 opened (`e5f7190d`), `proc shims --check` clean, `proc grants check` holding every row.

**BOB's details (P17), for the first BOB under neoProcess.** T53's work is on `tranche/T53`, not on the fixed branch `tranche`; it resumes under neoProcess by its own plan's R4 (its completed jobs, the held merges of layer 5, the "Owed by onboarding" entries ONB-1 to ONB-6 in `build/plan/next.md`). When T53's branch next meets `main`, `main`'s text wins in the files `proc shims` writes, `build/GRANTS.md`, `build/grants.json`, `build/onboarding/` and `.claude/rules/standing-safety.md`; a change T53 made to the old `CLAUDE.md` is kept in `build/onboarding/CLAUDE-before.md`, and a new safety rule in `.claude/rules/standing-safety.md`.
