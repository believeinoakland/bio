# SCHEDULER-NEXT — the resume for SCHEDULER #7 (written 2026-09-21 by SCHEDULER #6 at its refresh)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below
was MEASURED at `origin/main` `e50f5c75` (~19:46Z), with CONDUCT #10's landing report of `b83e705c` added. It is a POINTER: re-measure before you rest anything on it.

## The plan, as I left it

- **Cache (8), all four `running` rows now LANDED:** CONDUCT #10 integrated REC-156, D-432, D-355 and D-254 at
  `b83e705c` (one FULL gate on `db6ab1b6`: 267/267 suites green, 16247 assertions): **D-432 -> `19fdcd95`** (IC-170),
  **D-355 -> `0e80aa8c`**, **D-254 -> `cac06ae7`**, **REC-156 -> `f84bcd47`** (IC-171 MAJOR). None is closed yet: that
  is your first act. The rest of the cache is LED-7, D-436 (waits on disk), M0-79 (runnable now D-254 landed) and D-434;
  CONDUCT fills D-436, M0-79 and D-434 next.
- **Backlog (72), top:** REC-157, **D-435**, M0-83, M0-81, M0-84, M0-85 (blocked).
- **DEBT.md: 167 open rows** (187 when I opened; 223 when the fold began).

## Owed acts, in order

0. **CLOSE THE FOUR, in ONE commit with the refill:** verify each merge sha above is an ancestor of `origin/main` and its
   row's work is there BY CONTENT, mark it `done`, `ledger.mjs archive` each. **D-435 MAY NOT MOVE:** BOB #22 is building
   it from the backlog and archives it itself; it asked that nobody move or edit that row until its landing is on
   `main`. `refill` cannot skip a row (REC-157 first, D-435 second), so until that landing is on `main`, refill ONE slot
   (REC-157) and say so on the commit. Tell CONDUCT what entered.
1. **Place what CONDUCT #10 routed at its landing, each only with its fix named:** (a) D-355's five routes (CONDUCT-NEXT
   §2): pen-on-exit for `nc-rec95`, `nc-rec129` and 32 end-only drivers; two signal-handler drivers that run children
   synchronously; `delegations.control.mjs` RED on `main` (a DELEGATION with two `open as of` lines at `CLAIMS.md:196`);
   the census's UNCLASSIFIED gating gap; and its DESIGN GAP (three driver rules `VERIFICATION.md` lacks), which is BOB's.
   (b) D-437, D-438 and D-439, D-254's DEBT rows, now in `DEBT.md`. (c) REC-156's DELEGATION: enrolled administrators
   cannot reach `memberadd`, `memberset`, `signeradd`, `signerset` or `governorconfig` from their own session. Fix: D-136's
   shape; CONDUCT put the `governorconfig` question to BOB #22. (d) The DISCHARGED line D-254's worker asks for on the
   archived D-240 DELEGATION in `docs/archive/ledgers/CLAIMS-2026-08.md`, which the lane's standing claim covers.
2. **Drain the BOB INBOX: six entries from BOB #22** (`3b904ea7`). (1) `decided.mjs` cannot see 11 of Bob's 17 answered DEC
   entries (M-85); asked to go FIRST among the instruments, sequenced with D-341 (same file). (2) reevaluations' wording
   and status gap under DEC-70. (3) M0-83 item (4): the retirement tool judges other projects' sessions; it amends M0-83.
   (4) D-260 RULED, placed under its own id. (5) D-293 RULED, likewise; its fix's design is CARRIED IN THE ENTRY because
   `VERIFICATION.md` is at budget. Read what `rowdesign` admits before citing it. (6) D-195 at the elicitation, two items
   after UI-74. Verify each at its cited section, mint ids with `mintid.mjs`, and move each drained entry to the archive
   in the same commit.
3. **DELEGATION SCHEDULER (#6) -> BOB is open on Q3 only** (Bob's own: may a NO-PROJECT conclusion admit a case?). The
   ruling opens one door; nothing to do until it arrives. **The next BOB group starts with D-145**: bundle ids are per
   instance, so nothing addressed by id survives leaving the instance. The row lists candidate shapes, none free; the
   opaque ids of Membership v2 §7 answer enumeration, not cross-instance addressing. Add up to three more before sending.
4. **LED-7, the standing default:** one batch per wake, the open count reported each time. Not yet verified from SCHEDULER
   #5's list: D-162, D-99, D-59, D-124. D-124 is a COLLIDED id, one of LED-8's six: carry it until LED-8 lands. Then take
   the rest oldest first, security and disclosure first.

## Done this session (all verified on the remote)

Placed CAP-13, M0-92, CPDF-21, D-84 (narrowed), D-207, D-92, D-220 (narrowed), D-394, D-389, D-351, D-311, D-107,
CAP-14 and D-182. Closed in fact: D-144, D-143, D-199, D-184, D-223 and D-83. Replenished D-434 after BOB #21 closed
M0-86. Discharged the D-339 worker's DELEGATION and CONDUCT #8's of 2026-09-19. **Bob's plain-language build plan**, 91
entries at `3b904ea7`, is published at https://claude.ai/artifact/9mGEYAHcbGU7GA2hioFn8u; to update it from a new
session, pass that URL as `url`. Its draft and generator are in my scratchpad, which dies with me: rebuild from
`QUEUE.md` and `BACKLOG.md` if Bob asks again.

## The four things that would have cost you an hour

1. **A GIT NON-FAST-FORWARD ON THE MAIN PUSH IS A RACE, NOT A REFUSAL.** Another lane pushed between my fetch and my
   push. Fetch, look at what landed, rebase, regenerate `docs/DECIDED.md`, check the carry, then push under a NEW branch
   name (`scheduler-6/b`, never forcing `/a`) and `HEAD:main`. The memory about auto-mode refusals is a different case.
2. **YOUR OWN CLOSING TEXT CAN TRIP `RESIDUE_RE`.** I wrote "verified still open" in a CLOSED disposition, and
   `isClosedDebtRow` would have read the row OPEN. The read-back assertion in my script caught it before anything was
   written. Run `isClosedDebtRow(debtDisposition(next))` on every row before saving.
3. **OTHER LANES CLOSE ROWS TOO:** BOB closed M0-86, D-353, D-325, D-80 and D-280, and is building D-435. A close from
   another lane leaves a replenish owed and nobody tells you, so count the cache at every wake.
4. **`planning-hygiene.test.mjs` asserts once per open DEBT row**, so the DOCS gate's assertion total falls by exactly
   the number of rows archived. Attribute the delta with a per-suite diff between runs; do not chase it.

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. Arm the self-wake (every 30 min) and its 5-day renewal.
Archive me, SCHEDULER #6, under D-398's three conditions re-checked AT THE MOMENT YOU ACT: session
`local_dbf83dd3-3275-4f40-8167-87c883ff3005`, worktree `.claude/worktrees/scheduler-6` (branch `scheduler-6/b`; remote
`scheduler-6/a` holds a pre-rebase duplicate of work already on `main`). The tree holds real `node_modules` in three
packages, about 660 MiB with the checkout; measure the disk before and after. **I delete both my crons before stopping.**
Then `node tools/ledger.mjs invariants`, then the owed acts above.
