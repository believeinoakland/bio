# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #154 (`session_01EVm8g7mziJQi1eQQrAtbNW`, primary account, depth 1), 2026-10-11 ~12:58 UTC, refreshing at ~52% of its window (524k of 1M) at the T43/T44 boundary, no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2715–K2733.

## Where things stand

- **T43 closed** onto `main` (PR #26, `b9ec6c6eb5`, K2733; PR #25 DEC-191/DEC-192 merged first, K2732). Archive `plan/archive/T43.md` with its Outcome, the reds carried to T44 by name, and usage.
- **T44 is not open.** `build/plan/next.md` is its source; `build/plan/draft-T44.md` (adopted, K2719) holds the requirement text for N868, N869 (with N859) and N870; DEC-192 (now on `main`) amends N869 as N876 states (K2729: its doubts 1–4, 7, 8 are answered by DEC-192; re-word the draft's N869 lines at the opening).
- **Doable in T44** (each states its module and hard reason): N868 (L1 image-codecs then pdf-pixels), N870 (L3 capture), N869+N859+N876 (L4 extraction; L6 ai-use with N871; L11 notice-producers, plane), N872 (L8 case-carriage), N873 (steps), N874 (L11 plane and affordances), N875 (L11 store-door), N877 and N878 (L11 affordances, op-declarations), and promotion's stamp (rule 4 (2): rows T43's L3+ jobs changed; K1680). Left out with their hard reasons as `archive/T43.md` "Left out" lists (N751, N780, N794, N824, N828, N829, N842, N847, N852, N853c, N855, N858, N861, N865, T41's carried rows).
- **Timers:** backstop `BOB #154 backstop` (`trig_01AjuMtHwJgAMyLrGd5KPNmU`) kept until your takeover (§5.8 (3)); delete it at takeover. No WATCH (deleted at T43's close).
- **ROOT #5** (`session_0187SrKsqhqzSTqwDk2hzcXy`): 320k of 1M at 09:31; it stays until 55% (Bob's K2679; K2715 answered the start prompt's old "ROOT #7").
- **Channel:** UX-DESIGN read to U158; B138 (ACK of DEC-192) posted. Design lanes: investigation H43 (done), actions H15 (nothing handed off).
- **Container:** `npm ci` was run here in agent-runner (`--ignore-scripts`), sheet-worker, file-scanner; a fresh container needs it again before `fleetbundles` (K1980).

## Open with Bob

- His weekly meter reading (not given for T43; asked again at its close).
- UX-DESIGN (`session_014uT5e8EjnRxmEeUDDg2cYa`) waits on Bob's "proceed" before publishing the layouts page.
- ACTIONS-DESIGN #2 (`session_01RukQneSYmxg4FvfJ9aXccd`): D12–D16, D18, D19 open with Bob.

## Next steps, in order

1. Take over (§5.1): archive BOB #154 once idle and write its `BOB-final` row under T43; delete its backstop.
2. Open T44 at once (§5.2): write it from `next.md` with its legacy census (legacy-ui stays, K633) and rule 4 from `archive/T43.md`'s carried reds; fold `draft-T44.md` (with DEC-192's re-wordings) into requirements before each layer's START; create `tranche/T44` from `main`; arm the WATCH (into ROOT #5); start L1. Ask Bob for his meter in one line.
3. In STARTs: a job reads its own code and tests whole (P20, mechanics §6 step 2); two T43 jobs skipped it and affordances' whole read then found three flaws (K2726, K2727, K2730): say so in each START.
4. At T44's close: merge `main` if it moved, run every module's tests (`module-tests.mjs`, ~45 min) and the checks; accept or fix every red by name before the PR (K2704, K2732); then PR `tranche/T44` → `main`, merged with the GitHub merge tool (method `merge`, full 40-character head sha) on Bob's standing direction in the product's CLAUDE.md (K1177; standing list `mcp__github__merge_pull_request`); no refusal of it is recorded.
5. Commit build state only to the tranche branch; `main` moves only by §5.7.
