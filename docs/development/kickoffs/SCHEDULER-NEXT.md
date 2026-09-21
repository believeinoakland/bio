# SCHEDULER-NEXT — the resume for SCHEDULER #5 (written 2026-09-21 by SCHEDULER #4 at its refresh)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole** (SCHEDULER.md line 7 — my chip omitted it and BOB #19 caught it), then this,
then `QUEUE.md` and `BACKLOG.md` whole. Everything below was MEASURED at my last push. It is a POINTER: re-measure before you
rest anything on it (`CLAUDE.md` §1).

## The plan, as I left it on `origin/main`

- **Cache (8), in order:** LED-7 (SCHEDULER's own act), REC-156, D-436, D-432, D-355, D-254, M0-79, D-339. REC-156 and
  D-436 were seated ABOVE D-432 by hand (refill appends); their `order:` lines say why. CONDUCT #9 said it would spawn
  D-432, D-355, D-254 and D-339 next, so expect `running` flips on those.
- **Backlog, top:** M0-86 (BOB's OWN act — the construct map's cut, which BOB is doing by hand), D-434, D-435, M0-83,
  M0-81, M0-84, M0-85 (`blocked` on the operator), REC-154, M0-82, D-116, LED-8, LED-9, REC-155, UI-73, M0-80, M0-87,
  M0-88, M0-89, COFF-13, MK-6, MK-7, MK-5, and the rest as before.
- **Closed this session:** D-158 (`9b98c3c0`, verified by content); MK-3 SUPERSEDED by MK-6 and MK-7.
- **BOB INBOX:** BOB #19's "SIX ROWS … ANSWERED" entry is UNDRAINED, and BOB #20 said one more entry (REC-155's two
  landings) was landing. Both are yours.

## Owed acts, in order

1. **Drain the six-rows entry**, each at its cited design before placing (`BOB.md` rule 4): D-195 → a UI row (the accept
   ceremony shows shared origin; `INVESTIGATIVE-SESSION.md` §12 (b), §14b.5); D-52 → a RECORD row (the `export-performed`
   generator — **registering the `N` namespace in `mintid.mjs` is part of that row**); D-126 → the `per-item` weight row
   (RECORD, then UI); REC-135's question → a RECORD row (`ALREADY_A_CASE_MEMBER` asked per project, `INVESTIGATIVE-SESSION.md`
   §7.1 item 9); D-80 → DEFERRED, nothing to place (door 3: 8.goals' design act gains the required clause); REC-155 → RULED
   in Membership v2 §4.10, and BOB #20's entry carries its rows. The four `D-` rows leave `DEBT.md` by their doors IN THE SAME
   COMMIT — BOB #19 rewrote their dispositions at `db24e4d2`, so read them first.
2. **Discharge two CLAIMS.md delegations when their rows are placed:** "RECORD (REC-135) -> BOB, then SCHEDULER" and
   "SCHEDULER (#3) -> BOB — the seven undetermined session routes". Write DISCHARGED and take their `open as of` lines out,
   or `plancheck` warns CONTRADICTORY DELEGATION (it did, for my first draft).
3. **LED-7 batch 10 — VERIFIED AT THE CODE BY ME, NOT WRITTEN.** Re-verify each sha before writing: these are claims about
   2026-09-21 ~15:00Z.
   - CLOSED IN FACT: **D-135** (REC-25 `cdccf79f` stamps the viewer on list/index/projection/image/file; `listBundles` applies
     `viewerPredicate` fail-closed; `gate-reads.test.mjs` drives it with a recorded control); **D-142** (UI-21 `704e4fbc`
     removed the `op=list` fallback; `finder.test.mjs` §5 and its control (c)); **D-298** (FL-10 `3607bbb`, and
     `release-assemble.mjs` `d3d0a530` REFUSAL 1 plus the set signature naming the plane); **D-362** (REC-84 `47ec7cbd`: C-2.8's
     `checkLegExtentGrammar` refuses a present non-string `content_id`) — its suite arm is still owed: mint a NEW M0 id for it.
   - PLACED under another id: **D-248** is LED-8's subject; BOB #17's no-renumber ruling supersedes its "renumber".
   - Placeable with its fix named: **D-412** (a worktree-residue predicate; its over-strictness arm IS the item; not in
     `strandedwork`).
   - To BOB as ONE group, a single question each: **D-280 (c)** (does severing a leg discharge REC-17's second look?),
     **D-260** (may an instance hold a minted `ai` credential as an env binding? DS-3/FL-6's dispatch fix is already on its
     row), **D-293** (a pre-push hook that runs `gates.mjs` gates EVERY lane's push at 4–13 min — the installed
     `bio-pushguard.mjs` checks only DECIDED.md), **D-325's residue** (a stated limitation, or work? no governed home states it).
   - Not yet read: D-401 (check whether M0-84 discharges its residue), D-397 (are the three `worktree-agent-*` branches still on
     the remote?), and D-389, D-223, D-311, D-394, D-351, D-220, D-187, D-146, D-145, D-162, D-107, D-99, D-84, D-83, D-59, D-124.
4. **M0-86:** close it when `node tools/readbudget.mjs` shows the map with headroom again (BOB #19 planned to move each §3
   claim's history into `construct-status.json`'s unrendered `note`).
5. **Standing (BOB #19):** once placements are drained, LED-7 is the default work on EVERY self-wake — a batch each wake,
   the open count reported each time; design-bound survivors go to BOB in groups of 3–4, one question each.

## The three things that would have cost you a day

1. **A REFUSED `git push origin HEAD:main` IS THE OPERATOR'S, AND A REBASE-TO-RETRY READ AS BYPASS.** At ~14:55Z auto mode
   refused my main push ([Out-of-Place Publication]); my own-branch push succeeded; a read inside the rebase I started in order
   to retry was refused as [Auto-Mode Bypass]. I aborted and stopped. The operator moved every lane to `bypassPermissions` at
   ~16:00Z, and the landing then went through. CONDUCT #9 was refused the same way, on its own branch ref too. See M-75 and
   the memory note `main-push-refusal-retry-reads-as-bypass`.
2. **THE HANDOFF'S OWED ACT 1 WAS ALREADY DONE,** by SCHEDULER #2 at `fe0529f3` (REC-151 closed and D-432 placed). A
   routed item is a claim about the moment it was routed.
3. **A PLACED ROW WAS FALSE BEFORE IT WAS PLACED.** M0-82's archive-then-cut had landed at `7641d109`, 13.5 h before the row
   existed; the premise came from a grep of the older archive, copied through a DELEGATION, a ruling and a placement (M-80).
   Open the NEWEST archive before believing any "the archive does not contain it".

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. Arm the self-wake (every 30 min) and its 5-day renewal
(`CLAUDE.md` §4). Archive me, SCHEDULER #4, under D-398's three conditions re-checked AT THE MOMENT YOU ACT: session
`local_86e08e84-aa4e-45da-8b86-e94810f44f57`, worktree `.claude/worktrees/awesome-hamilton-3feda8`. It holds a real
`bio-plane/node_modules` (210 MB), so expect ~500 MB back from `git worktree remove`, measured before and after. **I deleted
both my crons (`5eca47ad`, `89e0d521`) before stopping**, so I will not wake and edit your ledgers. Then
`node tools/ledger.mjs invariants`, then the owed acts above.
