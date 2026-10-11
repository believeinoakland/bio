# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #153 (`session_01M1HKb2JkFH595E438e39Cz`, primary account, depth 1), 2026-10-11 ~09:30 UTC, refreshing at ~55% of its window (547k of 1M) with T43's L4 running and no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2684–K2713.

## Where things stand

- **T42 closed** onto `main` (PR #24, K2696; PR #23 DEC-189/190 merged first, K2695). Archive `plan/archive/T42.md` with Outcome and usage.
- **T43 is open** on `tranche/T43` (plan `build/plan/current.md`; read its rules 1–4 whole: rule 4 lists every accepted red by name, now (1)–(12)). Opened 2026-10-11 ~06:45 UTC (K2697). Bob's meter: not yet given for T43 (asked at the opening).
- **L1, L2, L3 closed** (K2705, K2707, K2711). L4 running: reading-pipeline merged (K2712); **EXTRACTION #20** `session_01PpDwes3iUurs4FGnAcYgt6` working, its J1 answered (B3, K2713), rung 09:28. Merge it, then close L4 (§5.6).
- **Entries added since the opening** (P10, K1249; each in the plan): T43-16 case-carriage (L8), T43-17 affordances, T43-18 op-declarations (L11) (K2704: DEC-189's words broke their tests at T42's close); T43-19 ratification (L8), T43-20 action-clocks (L9) (K2706: fixtures writing a key twice, refused by the stricter door); T43-21 admission (L11; K2708, K2710); T43-22 case-disclosures (L8), T43-23 control-plane (L11, after T43-14) (K2710). T43-11 and T43-13 widened (re-read words from `words.json`).
- **Requirement text** for every layer is folded (K2698, plus K2684 plane R36). STARTs written for L1–L4 in `plan/starts-T43/`; the rest are to write: L6 ai-use; L8 case-carriage, ratification, case-disclosures, case-authoring (case-account wording is folded, no job); L9 action-clocks; L11 affordances, admission, notice-producers, op-declarations, answer-envelope, control-plane, plane. Template: `plan/starts-T43/capture.txt` (a set over 600 KB gets its own workers' digest, K2700; measure with `build/plan/reading-sets.py`). Merge order per the plan's L11 line (modules.json order, plane last; T43-23 after T43-14).
- **Timers:** backstop `BOB #153 backstop` (`trig_01763AeZ1dLXbJM99BpsRhjF`, 09:39) and `WATCH #153: tranche/T43` (`trig_01KJq5kpkourKZDR467SFbst`, into ROOT #5). Delete both at takeover (§5.1 (5)).
- **ROOT #5** (`session_0187SrKsqhqzSTqwDk2hzcXy`): 311k of 1M at 06:10; it stays until 55% (K2679, K2687). Its BOB #153 prompt asked for a new ROOT under the old 300k rule; K2687 answers that.
- **Channel:** UX-DESIGN read to U156, B135 posted. DEC-191 (U153) answered B133/B134; it is on PR #25 (U155 MERGE) and is folded in T44 (N869, K2703).

## Open with Bob

- His weekly meter reading for T43 (asked at the opening).
- UX-DESIGN (`session_014uT5e8EjnRxmEeUDDg2cYa`) waits on Bob's "proceed" before publishing the layouts page.
- ACTIONS-DESIGN #2 (`session_01RukQneSYmxg4FvfJ9aXccd`): HANDOFF read to H15; D12–D16, D18, D19 open with Bob. INVESTIGATION-DESIGN: H43 (done).

## Next steps, in order

1. Take over (§5.1): archive BOB #153 once idle and write its `BOB-final` row under T43; delete its backstop and WATCH; arm your own (WATCH into ROOT #5).
2. Watch L4 (§5.4); merge extraction (§5.5); close L4 (§5.6: regenerate in K1540's order; `npm ci` in agent-runner `--ignore-scripts`, sheet-worker, file-scanner, agent-worker if the container restarted). L5 has no entry; start L6 (ai-use), then L8, L9, L11 as the plan lists.
3. Close T43 (§5.7): (1) PR #25 (UX-DESIGN's MERGE, U155; K945: keep its text in any conflict; a draft is marked ready first, as K1885, K2068, K2169, K2258, K2695), merging `main` into the tranche if it moved; then **run every module's tests** (`.github/scripts/module-tests.mjs`, K2704) as well as `checks/run.mjs`, and fix or accept by name any red; (2) archive the plan `CLOSING`; (3) PR `tranche/T43` → `main`, merged with the GitHub merge tool (method `merge`) on Bob's standing direction in the product's CLAUDE.md (K1177) and the standing list (`mcp__github__merge_pull_request`); no refusal of either merge is recorded; (4) delete timers; (5) report to Bob, ask his meter.
4. Open T44 at once (§5.2) from `next.md`: N849…N870 as each states; new this tranche: N865 (legacy-ui, Bob's), N866 (plane author stamp), N868 (larger photos), N869 (DEC-191, after PR #25), N870 (capture's held fingerprint copy, after T43-21); N859 waits with N869.
5. Commit build state only to the tranche branch; `main` moves only by §5.7.
