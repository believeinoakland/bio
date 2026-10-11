# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #152 (`session_01LmewcofcJp9zTHjyQosCGw`, primary account, depth 1), 2026-10-11 ~06:02 UTC, refreshing at ~60% of its window (604k of 1M) with T42's L11 just started and no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2640–K2682.

## Where things stand

- **T42 is open** on `tranche/T42` (plan `build/plan/current.md`: rules 3 and 4, every entry). Bob's meter 26% weekly during L9 (K2677; 18% at the opening). Development runs (K2605); the 80% pause (K2341) stands.
- **L1–L9 closed and merged** (L5 K2646, L6 K2666, L7 K2669, L8 K2676, L9 K2682). L10 has no entry. Artifacts regenerated at each close; `fleetbundles` is red only on rule 4 (15).
- **L11 running** (STARTed ~06:00 UTC, sessions created, addresses written): OP-GRADES #6 `session_015JYSkqkTmdKAbSMNiSw1fb`, AFFORDANCES #27 `session_01PxX2Bm2JD3fpmmPKa3jkr5`, OP-DECLARATIONS #17 `session_01Wu8uik71zHTxjU6oJ3EtBz`, ANSWER-ENVELOPE #7 `session_01GfbfuPey5USVmCuUZXmE4L`, STORE-DOOR #5 `session_019dgq3DdRUfHkp8bBr7TPbY`, CONTROL-PLANE #29 `session_017Td7k1YMLLrLUpRB4yBYq4`, PLANE #30 `session_019KPdWXgGFwpp8DJJjNuRry`. Merge in `modules.json` order, the plane last. Their text is K2656 (`plan/draft-T42-l11.md`): each job adds its own `uses` edges in `modules.json` and names them in its COMPLETE (K2670); `pagetranscribe` takes `sha256`/`project` from the address through plane's gated hook (K2656 doubt 1).
- **Accepted reds at the close** (rule 4): (2) row census to T43's stamp; (3), (4) carried; (6) clears with T42-27; (9) doorbell R25's ownership arm until capture's delete; (10) bundles; (15) `fleetbundles` 25-input pin until N860; (17) action-clocks `overdue.test.mjs`:151 and action-plans `invariants.test.mjs`:50 until N864.
- **Timers:** backstop `BOB #152 backstop` (`trig_01QQ1RMqRu8yTDyXDx2XebEQ`, 06:20) and `WATCH #152: tranche/T42` (`trig_01WVgLBdK6ofvYYPyDL6odAJ`, into ROOT #5). Delete both at takeover (§5.1 (5)).
- **ROOT #5** stays until its context passes 55% of its window (Bob, K2679; mechanics §2 and `roles/ROOT.md` changed on his approval, K2681). It was at ~299k of 1M.

## Open with Bob

- UX-DESIGN (`session_014uT5e8EjnRxmEeUDDg2cYa`) waits on Bob's "proceed" before publishing the layouts page. Channel: read to U152, B132 posted (ACKs, NOTICE of N843's codes).
- ACTIONS-DESIGN #2 (`session_01RukQneSYmxg4FvfJ9aXccd`): HANDOFF read to H15 (D6, D8–D11 ruled → N855, N858, N861, folded with the lane's requirements hand-off); open with Bob: D12–D16, D18, D19. INVESTIGATION-DESIGN: H43 (done).

## Next steps, in order

1. Take over (§5.1): archive BOB #152 once idle and write its `BOB-final` row under T42; delete its backstop and WATCH; arm your own (WATCH into ROOT #5).
2. Watch L11 (§5.4); merge each job (§5.5: ownership; check each `uses` edge it names; strike marks); close L11 (§5.6: regenerate in K1540's order; `npm ci` in agent-runner `--ignore-scripts`, sheet-worker, file-scanner if the container restarted).
3. Close T42 (§5.7): (1) PR #23 (UX-DESIGN's MERGE, U151; K945: keep its text in any conflict), merging `main` into the tranche if it moved, checks again; (2) archive the plan `CLOSING`; (3) PR `tranche/T42` → `main`, merged with the GitHub merge tool (method `merge`; CLAUDE.md's standing direction, K1177; standing list); (4) delete timers; (5) report to Bob, ask his meter.
4. Open T43 at once (§5.2) from `next.md` (N751…N864): new since T42 opened: N855, N858, N861 (actions lane, wait on its hand-off), N856, N859, N862 (DEC-189/190 words, after PR #23 is on `main`), N857, N860, N863, N864, plus N849–N854. The STARTs' template is `plan/starts-T42/*.txt`.
5. Commit build state only to the tranche branch; `main` moves only by §5.7.
