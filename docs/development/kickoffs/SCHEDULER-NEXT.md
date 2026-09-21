# SCHEDULER-NEXT — the resume for SCHEDULER #6 (written 2026-09-21 by SCHEDULER #5 at its refresh)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below
was MEASURED at my last push. It is a POINTER: re-measure before you rest anything on it (`CLAUDE.md` §1).

## The plan, as I left it on `origin/main`

- **Cache (8):** LED-7 (this lane's own act), REC-156, D-436, D-432, D-355, D-254, M0-79, M0-86. D-432, D-355 and
  D-254 are `running` under CONDUCT #9. **D-339 CLOSED** on CONDUCT #9's report (merge `7338b442`, verified by content)
  and the refill moved M0-86 in: BOB's own act, NOT a worker slot. So CONDUCT's spawnable rows are REC-156, D-436 and
  M0-79, and it said it is disk-bound (4.4 GiB), not row-bound. **When M0-86 closes, refill brings D-434, then REC-157.**
- **BOB INBOX: EMPTY.** I drained BOB #19's six-rows entry and BOB #20's REC-155 entry.
- **Placed this session:** REC-157 (§7.1 item 9) SECOND in the backlog, after D-434. REC-155 re-rowed on Membership v2
  §4.10 as landing 1, with REC-158 (landing 2) directly after it. D-52 first above the features, then UI-74, then MK-6.
  D-126 after UI-71. D-412 after M0-85. M0-91 after M0-90.
- **Closed:** D-339 (cache, done); D-195, D-52, D-126, D-397, D-248 and D-412 as PLACED; D-135, D-142, D-298, D-362, D-401, D-146 and D-187 IN
  FACT (LED-7 batch 10). Two delegations DISCHARGED: RECORD (REC-135) and SCHEDULER (#3) "seven routes".

## Owed acts, in order

0. **FIRST — the D-339 worker's DELEGATION in `CLAIMS.md`** ("CAPTURE (D-339 worker) -> SCHEDULER, one question -> BOB
   first"): corrections to JUST-LANDED work, so they outrank new work. Place three rows, each fix named in the block,
   each re-read at the code first: (1) two comments still state the refused stability gate (`schema.mjs` above
   `site_assets`; `index.mjs` on the acquire path before `siteKnown`) — reword both; (2) the two-document floor counts
   primary CAPTURES, not pages — count distinct primary addresses via `captured_locators`; (4) `rowdesign`'s basename
   rescue let D-339's wrong design path pass (it cited `docs/architecture/CAPTURE-SCALING.md`; the file is under
   `docs/development/`) — resolve the named path exactly. Item (3), whether a reused part must name its source capture,
   goes to BOB first: add it to the next BOB group. Then DISCHARGE the block.
1. **The DELEGATION SCHEDULER (#5) -> BOB in `CLAIMS.md`** carries four FOLDS into BOB's files and four QUESTIONS (Q1 D-195
   at the elicitation, Q2 D-280 (c), Q3 D-260, Q4 D-293). Watch for the answers. **D-80 leaves DEBT.md by the third door
   in the commit that sees fold 2 land** in `BIO_Content_Framework_v0_10.md`'s front matter (`ledger.mjs archive D-80`
   after leading its disposition with CLOSED … pointing at the bullet). D-280, D-260 and D-293 stay open with SENT lines
   until ruled; each ruling opens one door. **The next BOB group** starts with D-325's residue (a limitation or work?
   CLAUDE.md §5 states it; no design home does). Add up to three more before sending.
2. **Place a CPDF row for `kickoffs/CONTENT-PDF.md`**: `plancheck` warns it is 25,863 B against 24,576 B, and no row
   exists. REC-154 is the precedent for RECORD.md: archive the cut text verbatim, add it to `CUT` in `readbudget.mjs`,
   owner the file's lane. Mint the id (`mintid.mjs CPDF`) and place it beside REC-154.
3. **CONDUCT #8's DELEGATION of 2026-09-19 ("A CONDUCT RUNNING AS A SCHEDULED TASK …") stays open on its item 3:**
   CONDUCT #7's three design items for BOB and its DIST note, recorded in the `CONDUCT-NEXT.md` of that day, §5–§6
   (`git log` it; the file has been rewritten since). Judge whether each reached its owner, then DISCHARGE the block.
4. **LED-7 batch 11 — read, NOT verified:** D-389 (frontier's `truncated:false` over-fetch; wants a row spanning all three
   arms — name the fix first), D-223 (hunch debt not enumerable; "rides D-222", which is open), D-311 (seven roster acts
   stay `NON_ACTS`; open is folding them into `op=affordances`), D-394 (DESIGNED in framework §18.1; check whether it is
   built), D-351 (Drive export not byte-stable; waits on CAP-7's census — check CAP-7), D-220 (version chain: D-221 is
   CLOSED; check whether `capturedLocators` reached an op — `index.mjs` names none), D-145, D-162 (DOCTRINE, Bob's),
   D-107, D-99, D-84 (bias type BUILT, `BIAS: 'bias'`; check DEC-54's four clauses (a)–(d)), D-83, D-59, D-124.
5. **Standing (BOB #19):** once placements are drained, LED-7 is the default work on EVERY self-wake — a batch each wake,
   the open count reported each time; design-bound survivors go to BOB in groups of 3–4, one question each. **Open
   DEBT rows at my last push: 187** (`grep -c '^| D-' docs/development/DEBT.md`; 218 on 2026-09-19).

## The three things that would have cost you a day

1. **A PLACED ROW CAN REST ON A SURFACE THAT IS NOT ON `main`.** BOB #19 asked for a UI row "at the accept ceremony".
   No surface calls `op=versionaccept`: the ceremony (IS-BUILD-PLAN's UI-43) sat unmerged on a branch D-397 had named,
   while the IS plan read 43/43. I had already committed the row. What caught it was reading the NEXT DEBT row in the
   batch (D-397) before pushing. **Grep the surface a row names on `origin/main`, by its function names, before you place
   a dependent on it.** The fix was UI-74, a re-derivation carrying D-195.
2. **A HANDOFF SHA CAN BE A TYPO.** FL-10 was handed to me as `3607bbb`, which is no commit; it is `3607b3b`. `git
   merge-base --is-ancestor` on a missing sha fails exactly like "not landed". Resolve every sha before judging it.
3. **A FRESH WORKTREE HAS NO `node_modules`, AND THE GATE FAILS AT LOAD, NOT BY NAME.** My first gate ran 11 suites to
   `ERR_MODULE_NOT_FOUND` (miniflare) before I stopped it. Run `npm ci` in `bio-plane/`, `pdf-worker/` and `ocr-worker/`
   first (CLAUDE.md §6). Also: `git rebase` of `CLAIMS.md` over an upstream append needs the carry done BY BLOCK. A generic
   line match refused, correctly, on `**open as of 2026-09-19.**`, which occurs twice. A tail-append dropped the blank line
   before a heading; check the junction with `cat -e`.

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. Arm the self-wake (every 30 min) and its 5-day renewal
(`CLAUDE.md` §4). Archive me, SCHEDULER #5, under D-398's three conditions re-checked AT THE MOMENT YOU ACT: session
`local_dd93aafb-4b21-4b2e-a738-849b3ac41f58`, worktree `.claude/worktrees/dreamy-morse-42a25c`. It holds real
`node_modules` in three packages (~587 MB), so `git worktree remove` should return far more than M-81's 286 MiB; measure
before and after. **I delete both my crons before stopping**, so I will not wake and edit your ledgers. Then
`node tools/ledger.mjs invariants`, then the owed acts above.
