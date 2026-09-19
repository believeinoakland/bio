# SCHEDULER-NEXT — the resume for the next SCHEDULER (written 2026-09-19 by SCHEDULER #2, refreshed as the day runs)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` — **its "Mechanics learned" section is the practical half and it grew
four entries today** — then this, then `QUEUE.md` whole. Everything below was measured on `origin/main`. It is a
POINTER: re-measure before you rest anything on it (`CLAUDE.md` §1).

## The one thing that is not this lane's and blocks two others

**CONDUCT AND DIST CANNOT PUSH.** Both sessions' `git push` is refused by the Claude Code auto-mode classifier —
`[Data Exfiltration]` for a plain branch push, `[Production Deploy]` for a branch-to-main. It is the harness's gate,
not the repo's: no `ask` rule exists on push and `CLAUDE.md` §4 records that pushing is not gated. DIST's began
mid-session, after earlier pushes of the same branch succeeded. **SCHEDULER can push** — every commit below landed.

Consequences you inherit: REC-151 is FINISHED on `worktree-agent-a59a4cdfa1b3d4dd3` and cannot land; **D-432 cannot be
placed until it does** (its DEBT row rides that branch, and naming a `D-` id before its row exists fails `mintid.test`'s
prose-floor arm); 0.66.0 is cut, signed, deployed and live-verified but `main`'s `release/` still reads 0.65.0; and
CONDUCT is spawning NO workers, because a worker inherits its parent's gate and would strand its branch on this disk.

**Neither lane asked anyone to push for them, and you must not.** A peer's blocked push performed by another session
routes around a permission decision that belongs to the user. Sparky has been told; it is theirs to clear.

## The plan, measured

- **Cache (8):** REC-151 `running` (CONDUCT's, real WIP, not stale), then UI-67, UI-72, LED-7, REC-135, MK-3, REC-146,
  D-158. Seven runnable — well above the four the kickoff requires, so no replenish is owed.
- **Backlog (38), in order:** D-270, D-136, M0-78, D-254, D-116, LED-8, COFF-13, then MK-5 and the rest unchanged from
  SCHEDULER #1's order. **Every one of the first seven was placed today and each `order:` line says why it is there.**
- **`node tools/ledger.mjs invariants`:** P1–P5 PASS, 0 armed FAIL. `plancheck` bare: 0 fail, 4 warn.
- **DEBT.md: 208 open** (218 at the start of 2026-09-19). Count `^| D-` as **LINES, not unique ids** — unique-counting
  hides the two registered id collisions, which is how they were found.

## Owed acts, in order

1. **When CONDUCT's push clears, close REC-151 AND place D-432 in the SAME commit.** CONDUCT sends the merge sha; verify
   it is an ancestor of `origin/main`, mark done, archive, refill, and write D-432's row in the same act.
2. **LED-7 continues.** Batches 2–7 landed today: 218 → 208, every exit named, nothing deleted. **The character of the
   work has changed and this is the most useful thing on this page:** the closable rows are gone from the top of the
   file and the survivors are design-bound. Across batches 5–7, eleven rows measured and two closed. **So throughput is
   now gated on BOB's rulings, not on your reading** — the useful act is sharpening each survivor until its decision is
   a single stated question, then routing it. Do not mistake a low close-count for a slow batch.
3. **Awaiting BOB's ruling, routed and NOT placed:** D-134 (placeable the moment D-136 lands, and not before — §4.7),
   D-226, D-306, D-52 with D-126 (rule together; D-126 is D-52's parent), D-55, D-80, D-195, D-148 with D-149.
4. **Carried with their next act named:** D-60 (one trace: does monitoring/dedup/contemporaneity read the NORMALISED
   digest or the raw one), D-92 (a bounded live probe of `op=file` under sequential load), D-199 (walk all five DEC-55
   points; two verified built), D-235 (its (b) survives; and its delegated `op=basisversions` finding has NO owner),
   D-177 and D-182 (both name their own trigger).

## What this session got wrong, because you will be offered the same moves

- **I read a datum backwards.** LED-8's scope said to repair the id collisions "against freshly minted ids"; I cited
  D-124's *"renumbered from a colliding D-122"* as proof the repair must be done all at once, when it actually shows
  **renumbering is the move that already failed**. BOB ruled it: DISAMBIGUATE, never renumber an id anything cites.
- **I forwarded a row's premise without measuring it** (D-55) and marked it triaged. `CLAUDE.md` §5 binds a DISPOSITION
  that inherits a claim exactly as it binds the row.
- **I counted text and called it behaviour** (D-203): a grep over a file that is half commentary answers a question
  about text. Stripping comments gave 0 live hits and the row was closable. Both mechanics are now in `SCHEDULER.md`.
- **The tool refused me twice on one row and was right both times** (D-359). `archive` rejects a disposition declaring
  residue — including residue words inside a PRIOR disposition you appended. The fix is the documented one: move the
  prior disposition VERBATIM into the description cell, and row the real residue under its own id first.

## Your first acts

`git fetch origin`; confirm `origin/main:docs/development/kickoffs/SCHEDULER.md` line 1. Arm the self-wake (every 30
minutes) and its 5-day renewal (`CLAUDE.md` §4). Tell CONDUCT and BOB you are up. Run `node tools/ledger.mjs
invariants`. Then take owed act 1 if CONDUCT can push, and LED-7 if it cannot.
