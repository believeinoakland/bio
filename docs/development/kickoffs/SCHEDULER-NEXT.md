# SCHEDULER-NEXT — the resume for the next SCHEDULER (written 2026-09-19 by SCHEDULER #3, refreshed as the day runs)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` — **its "Mechanics learned" section is the practical half** — then this,
then `QUEUE.md` whole. Everything below was measured. It is a POINTER: re-measure before you rest anything on it
(`CLAUDE.md` §1).

## THE ONE THING THAT BLOCKS THIS LANE, AND IT IS NEW AS OF 2026-09-19

**SCHEDULER #3 CANNOT PUSH TO `main`, BUT CAN PUSH A BRANCH — and that distinction is the whole finding.**
`git push origin HEAD:main` is refused by the Claude Code auto-mode classifier, `[Out-of-Place Publication]`.
`git push origin <my branch>` SUCCEEDS. SCHEDULER #2 pushed to `main` all day; I cannot.

**SO THE WORK IS PUBLISHED BUT NOT IN THE PLAN.** Commit `e896e749` sits on `claude/laughing-heisenberg-b64894`,
verified FROM THE REMOTE (43 backlog rows, all five new rows present, D-355 out of `DEBT.md`) — and **no worker reads
it there**, because a worker reads its row from `origin/main`. Until that commit reaches `main` the five rows below
are written and not placed.

**DO NOT ASK A PEER TO PUSH IT FOR YOU.** A peer running a command another session's gate refused launders a
permission decision that belongs to Sparky. It is with them. **And do not record the blocker as a flat law:** BOB-NEXT
records CONDUCT's push succeeding at 20:15:36Z after being refused at ~14:05Z with the same refspec in the same
session, and CONDUCT #8 pushed `ad67ff0a` and `e2c12e01` tonight. The mechanism is UNDETERMINED. **Try the push
yourself before you plan around its absence** — and try the branch shape before concluding you cannot push at all.

## THE SECOND THING, AND IT CHANGES HOW YOU WORK RATHER THAN BLOCKING YOU

**CONDUCT #8 CANNOT BE MESSAGED, IN EITHER DIRECTION.** It runs as the scheduled task `conduct-8`; an unattended
session has no inbox and appears in NO peer's `ListAgents`. Measured three ways (M-74), and CONDUCT measured it
independently the same hour (`CLAIMS.md`, its own DELEGATION). **The repository is the ONLY channel to it**, which
`ORCHESTRATION.md`'s channels table now says where a reader planning a route meets it. Write what CONDUCT must know
onto the ROW it reads from `origin/main`; never conclude from its silence that it agreed.

**AND A NAME IS NOT AN ADDRESS.** My first send to `CONDUCT #8` returned `success: true` and landed on a DUPLICATE
session holding that title (BOB #17 filed a second CONDUCT chip six minutes after the lane was occupied). Only the
recipient noticed. Address by session id when it matters.

## The plan, measured on my branch at `e896e749`

- **Cache (8), unchanged from SCHEDULER #2:** LED-7, MK-3, D-158, **D-136 (running)**, D-432, **M0-78, D-414, D-433
  (running)**. CONDUCT #8 spawned TWO workers at `ad67ff0a` — D-136 alone, and the instrument cluster as ONE worker.
- **Backlog (43), in order:** D-355, D-254, M0-79, D-339, REC-154, D-116, LED-8, LED-9, REC-155, UI-73, M0-80,
  COFF-13, then MK-5 and the rest as SCHEDULER #1 left them.
- **`node tools/ledger.mjs invariants`:** P1–P5 PASS, 0 armed FAIL. `plancheck` bare: 0 fail, 4 warn. `readbudget`: 0
  failing, 2 pre-existing warns (`RECORD.md` — that is REC-154 — and `CONTENT-PDF.md`).
- **DEBT.md: 201 open** (202 at my opening; D-355 out by the placement door, none deleted). Count `^| D-` as LINES.
- **The gate ran GREEN, class DOCS: 39/39 suites green · 2498 assertions passing.** `npm ci` in `bio-plane/` costs
  **210 MB** and is required first — the 574 MB figure in my own chip covers all three packages, not this one. Disk
  read **5.7 GiB free at 98%** afterwards.

## What I placed, and the premise that did not survive

CONDUCT #7's four routed items were on no list but this page. All four are now rows, each verified AT THE ARTIFACT:
**REC-155** (seven verbs whose `OPS` row admits a session class and which no session reaches — `design: MISSING`,
routed to BOB), **M0-79** (the DEC-49 floors still slack), **UI-73** (eleven sites still reading a raw `detail`),
**M0-80** (four codes pinned green BY ABSENCE). **D-355** is placed FIRST and archived from `DEBT` as PLACED.

**ITEM 2'S FIGURES DID NOT REPRODUCE AND THIS IS THE LESSON TO CARRY.** CONDUCT #7 measured *"695 region lines and 10
families of slack"*. D-270's landing moved nine floors in its own turn — `regionLines` 2215 → 2952, which IS that 695.
The finding SURVIVED in a sharper form: four floors are still slack and they are exactly the four D-270 did not touch,
corpus counts no item grows on purpose. **A figure is a claim about the moment it was written, exactly as a blocker
is.** Table in `MEASUREMENTS.md` M-73.

## Owed acts, in order

1. **GET `e896e749` ONTO `main`.** Everything below is downstream of it. Try the push yourself first.
2. **Drain the BOB INBOX.** BOB #18 said two entries were landing: **D-434** (owner UI, TWO PARTS — *place part 1
   only*; part 2 must be sized before it is placed) and **the filing act's OCCUPANCY check** (before a chip is filed,
   `list_sessions` and refuse if a live session already holds the lane — it would have refused tonight's duplicate
   CONDUCT #8). **Neither was on `origin/main` when I last fetched**; BOB may be hitting the same push refusal.
3. **NOT OWED, AND CHECK BEFORE YOU ACT ON A ROUTED ITEM:** CONDUCT #7's row correction to D-270 (*the codeless
   set is THREE, not six*) is **ALREADY DISCHARGED** — SCHEDULER #2 folded both corrections into D-270's archived row
   at its close, and `MEASUREMENTS.md` reads *"SIX in the row, THREE on `main`, ZERO now"*. It survives as OWED in
   `CLAIMS.md` and `CONDUCT-NEXT.md` because both are POINTERS written before it was done. **A routed item is a claim
   about the moment it was routed, and two records repeating it is one source copied.** I nearly re-did it.
4. **When CONDUCT's REC-151 push clears, close REC-151 AND place D-432 in the SAME commit.** D-432 cannot be placed
   first: naming a `D-` id in prose before its row exists fails `mintid.test`'s prose-floor arm.
5. **LED-7 continues.** The closable rows are gone from the top and the survivors are DESIGN-BOUND, so throughput is
   gated on BOB's rulings, not on your reading. Sharpen each survivor to a single stated question, then batch three or
   four to BOB — context is BOB's binding constraint the way disk is CONDUCT's.

**Awaiting BOB's ruling, routed and NOT placed:** D-134 (placeable the moment D-136 lands, not before — §4.7), D-226,
D-306, D-52 with D-126, D-55, D-80, D-195, D-148 with D-149, and now REC-155's seven ops.

**Carried with their next act named:** D-60, D-92, D-199, D-235 (its (b) survives; its `op=basisversions` finding has
NO owner), D-177, D-182.

## Your first acts

`git fetch origin`; confirm `origin/main:kickoffs/SCHEDULER.md` line 1. Arm the self-wake (every 30 min) and its 5-day
renewal (`CLAUDE.md` §4). Archive your predecessor under D-398's three conditions re-checked AT THE MOMENT YOU ACT —
**and expect the harness to refuse it**: two refusals happened tonight (SCHEDULER #2 and BOB #17) on sessions that
satisfied all three, so the cause is UNDETERMINED and it is with Sparky. **Send the predecessor a `CronDelete`
request for its own self-wake anyway** — a retired session that can still wake and edit a ledger the live lane owns is
worse than an unreclaimed worktree. Then run `node tools/ledger.mjs invariants`, and take owed act 1.
