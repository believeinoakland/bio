# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #155 (`session_017fXJJy4Fp2h84wRcexJoGg`, primary account, depth 1), 2026-10-11 ~16:22 UTC, refreshing at 55% of its window (548k of 1M) inside T44's last layer, no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2734–K2776.

## Where things stand

- **T44 is open, in L11, its last layer** (`plan/current.md`). Merged: L1–L8 (every job), and in L11 affordances, notice-producers, op-declarations, store-door (K2771, K2773). **PLANE #32** (`session_01Dwre5v9yYZxVWPCf2yNy66`) completed once (J2) and was sent B3 (CHANGE: merge `tranche/T44`, re-run its tests, release suite and extraction's `pageTranscribe` tests, complete again); it merges last. The other four L11 sessions are kept until L11 closes (archive them then, rows from their `Size` lines: affordances 14/2351, notice-producers 11/1418, op-declarations 7/3433, store-door 2/2217).
- **Accepted reds (rule 4):** (1) coverage marks only until merges (none left but plane's R6, R36); (2) row census: C-143.5, C-143.6 re-worded (T44-7) until T45's stamp; (3) the UI's DEC-88 tests; (4) legacy-ui's three; (5) bundles at each close. Rule 4 (6) is cleared.
- **Timers:** backstop `trig_016kprccgruYj6pj96QXJf32` (next 16:39) and `WATCH #155` `trig_01TWT1t8y6a2d9kgq5oqsD7o` (into ROOT #5): delete both at takeover and arm your own.
- **ROOT #5** (`session_0187SrKsqhqzSTqwDk2hzcXy`): about 330k of 1M at 13:00, below Bob's 55% (K2679). The start prompt's "ROOT #7" is the retired 300k rule (K2715, K2734).
- **Channel:** UX-DESIGN read to U158; B139 (QUESTION: words for agent-worker's R72 refusals after the post, N886) unread by it. Investigation lane: H43, done. **Actions lane: H31, canon approved by Bob (K2775)**; its `REQUIREMENTS-HANDOFF.md` is the T45 input.
- **Container:** `npm ci` was run in agent-runner (`--ignore-scripts`), sheet-worker, file-scanner; a fresh container needs it again (K1980).

## Next steps, in order

1. Take over (§5.1): archive BOB #155 once idle, its `BOB-final` row under T44; delete its two timers; arm yours.
2. Finish T44: when PLANE #32 completes again, ownership check, merge, strike plane's marks; close L11 (§5.6: regenerate in K1540's order, `fleetbundles` and `newgroup-bundle-fresh`, checks; archive the five L11 sessions with rows).
3. Close T44 (§5.7): `main` has not moved (b9ec6c6eb5) and the design stream asked no MERGE; run every module's tests (`node .github/scripts/module-tests.mjs`, ~45 min; K2704) and accept or fix each red by name; archive the plan as `archive/T44.md` with its Outcome and usage; PR `tranche/T44` → `main`, merged with the GitHub merge tool (method `merge`, full head sha) on Bob's standing direction (CLAUDE.md, K1177; standing list `mcp__github__merge_pull_request`; no refusal recorded); delete the WATCH; report to Bob.
4. Open T45 at once (§5.2), from `next.md`: first the actions canon placement and K readings (K2775), then fold the lane's `REQUIREMENTS-HANDOFF.md` module by module into requirements (BOB's wording, P5; read it and `BIO_Action_v0_2.md` whole); with it N888 (case-grammar), N891 (op-grades, then affordances), the promotion stamp (rule 4 (2)), and the wording note on op-declarations R47's T42 sentence (history). N886 waits on B139, N889 on the design stream's keys.

## Open with Bob

- UX-DESIGN (`session_014uT5e8EjnRxmEeUDDg2cYa`) waits on Bob's "proceed" before publishing the layouts page.
- Civicsmith's terms of use (Actions D28 (e)): a later question for Bob.
