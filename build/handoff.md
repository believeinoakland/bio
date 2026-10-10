# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #149 (`session_01EyAmJMZV2GNzEmkDJkdcik`, primary account), 2026-10-10 ~19:10 UTC, for BOB #150, refreshing past 55% of its window (§2, §5.8). Read `build/rulings-active.md` first; this BOB's rulings are K2511–K2555.

## Open with Bob

- **UX-DESIGN session waits on Bob** (`session_014uT5e8EjnRxmEeUDDg2cYa`, started by BOB #149 on Bob's direction, K2521): it paused its takeover asking Bob to reply "proceed" before publishing the layouts page. Bob's act, told to him; not BOB's to steer (K945). Its outbox Writer line still names the old session; B123–B125 are unread by it.
- **ACTIONS-DESIGN #2** (`session_01RukQneSYmxg4FvfJ9aXccd`, K2521): page https://claude.ai/artifact/JH9AK7rgmxRNR9QjPL3s5d; twelve decisions (D6, D8–D16, D18, D19) open with Bob there. HANDOFF read to H10.
- **Pause after T41 (K2456)** stands: T41 runs to its close through §5.7 step 5; T42 does not open until Bob resumes. Bob's meter (primary) 2% at 16:36 UTC (K2521).
- ROOT #5 (`session_0187SrKsqhqzSTqwDk2hzcXy`, primary) was ~250k at resumption; Bob replaces it at 300k (manifest).

## Where things stand (T41 on `tranche/T41`)

- **L1–L8 merged and closed** (L6 K2522, L7 K2526, L8 K2551). Plane bundle 14.8 MiB at L8's close (K2547's watch: report to Bob past 32 MiB; N840).
- **L9 running, 7 jobs** (addresses in the plan's Jobs line; STARTs `build/plan/starts-T41/`):
  - COMPLETE, read, not yet merged: filing-templates (J1; uses action-grammar), filings (J1; uses actions, filing-templates), consequences (J1; uses conformance), action-plans (J1; uses conformance, actions, filings).
  - Working: conformance, action-grammar (B2 then B3: K2553's `facts.stages` shape and C-94.5 re-word), actions (B2, then B3 CHANGE to K2553's shape; R70/R71 wire when action-grammar merges: send it a CHANGE then).
  - Merge order: `modules.json` order (conformance, consequences, action-grammar, actions, filings, filing-templates?, action-plans as their uses require: each after its unmerged same-layer providers). Strike marks; strike nothing a job does not name.
- **L10:** monitoring (T41-49a, added K2524; START written) and scheduler (START carries K2534, K2543's boot re-point first, rule 4 (20)). Merge order monitoring, scheduler.
- **L11:** STARTs carry many routed items (K2514, K2525, K2529, K2532, K2538, K2544, K2554). Before L11's START: fill each `TO FIX AT L11 START` line (op-grades, answer-envelope, plane, op-declarations, control-plane, affordances: investigation's ops, review's `approvalruleset`/`caseapprove`, ai-runs R74 `openMany`) from the merged code, and re-take each START's marked ids.
- Rule 4 (accepted reds) runs to item 20; `next.md` holds N827–N840.

## Next steps, in order

1. Take over (§5.1): Status line; delete BOB #149's backstop and any routine into it; archive BOB #149 once idle and write its `BOB-final` row under T41; move `WATCH #149` (`trig_01FzksbFW2zXRj5pdK7R6C1b`) out: delete it and create `WATCH #150`.
2. Run L9 to merge and close (§5.6: regenerate in K1540's order, checks, archive, rows, plane size), then L10, then L11.
3. Close T41 by §5.7 steps 1–5: channel MERGE U147 (PR #21, design stream) merged into `main` first; PR `tranche/T41` → `main` with the GitHub merge tool (authority: Bob's standing direction in the product `CLAUDE.md`, K1177; standing list `mcp__github__merge_pull_request`; no refusal since K2273); at the close move `build/channels.md`'s BOB row to `primary` (K1428). Then stop (K2456): report to Bob, ask his meter, open nothing.

## Process notes

- The Writer line keeps the registry's `secondary` account until the close (K2511).
- Routine creation is rate-limited (~8 in a burst): ring the rest a minute later (K1825).
- When a job is COMPLETE before a CHANGE reaches it, it re-completes; merge only on the latest COMPLETE with `mail check` showing nothing owed.
