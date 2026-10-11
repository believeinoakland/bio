# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #158 (`session_018SZxjQSzi36FgoCRnJaRND`, primary account, depth 1), 2026-10-11 ~23:46 UTC, refreshing at about 47% of its window right after closing T45's L9 and starting L10, no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2845–K2867.

## Where things stand

- **T45 open, L10 just started** (2 jobs: MONITORING #18 `session_0133TTPPm1mQzJwK2WwH5Yij`, FOLLOWING #5 `session_01GFBw9f24M2axfCAsVCYFd3`, created 23:44, STARTs posted B1, addresses recorded; not yet confirmed at handoff). Merge order: monitoring, following. Merged and closed: L1, L2, L5, L6, L8, **L9** (K2866: all twelve merged, artifacts regenerated, checks run, sessions archived, rows written).
- **L11's STARTs** are drafted in `build/plan/starts-T45/` with notes appended by this BOB: plane (K2853 ask/draft doors gated; K2858 project-roster migrated, `actionHoldsOf` in filings' getter), op-grades and affordances (K2857), wizard-scripts (K2851 attributed templates). At L11's START re-measure reading sets (`build/plan/reading-sets.py`), fill installer's ADDRESS line (Bob has not named it: then T45-46 moves to T46 with that hard reason), stewards' family, answer-envelope's set. control-plane joins L11 at T45-45's merge only if its op maps must change (its `r48-routes` R47/R48 reds, K2859).
- **Accepted reds:** plan rule 4 (1)–(15) as written in `current.md`. (6) is open since actions' merge: the plane's `purgeHeld` (fail closed) until T45-47, queue-producers' hold callers until T45-41. (15) holds the template fixtures (wizard-scripts until T45-37) and answer-envelope's decorated-code and families tests until T45-49.
- **Timers:** backstop `trig_017GcyT1qfV14YsxqW1P4Nhg` (23:50) and `WATCH #158` `trig_01YYHusV2Xy1GDyFVhKi8vXj` (00:31, into ROOT #5): delete both at takeover and arm your own.
- **ROOT #5** (`session_0187SrKsqhqzSTqwDk2hzcXy`): 357k of 1M (36%) at 22:25, below Bob's 55% (K2679); a prompt's "start ROOT #7" follows the retired 300k rule (K2813, K2846).
- **Container:** `npm ci` done in agent-runner (`--ignore-scripts`), sheet-worker, file-scanner; a fresh container needs it again (K1980).
- **Channel:** UX-DESIGN read to U164 (B145 ACK posted; U163 MERGE: PR #28 merged at T45's close, step 1). Design lanes: investigation H43, actions H31, nothing new.
- **T46 preparation (P18):** `build/plan/draft-T46-interface.md` (six layer-11 interface modules, entries I1–I15) and `draft-T46-trial.md` (test-instance exception, 0.82.0 runbook, 12 entries) committed; technical points decided (K2854). next.md gained N911–N917.

## Bob's rulings since the last handoff

None. Two questions put to him (below).

## Next steps, in order

1. Take over (§5.1): archive BOB #158 once idle, its `BOB-final` row under T45; delete its two timers; arm yours.
2. Run L10: confirm the two starts, answer questions, merge monitoring then following (ownership, merge, strike marks, ruling). Close L10 (§5.6).
3. L11 from the drafted STARTs (re-measure sets; installer's ADDRESS; stewards' family; answer-envelope's set). New module `action-producers` enters `paths`/`tests` in `modules.json` from its COMPLETE (K1043).
4. T45's close (§5.7): every module's tests (K2704); design PR #28 merged first (U163 MERGE; standing direction K1177, `mcp__github__merge_pull_request`); archive; PR to `main`. Then cut 0.82.0 per `draft-T46-trial.md` §4 (signing per Bob's answer to Q2) and plan T46 from the two drafts, N897 and next.md (N896–N917; split plans N908, N909).

## Open with Bob

- **T46 questions** (artifact https://claude.ai/artifact/GzfBqi8pw4iqLY285osgnN): (1) where a member lands after sign-in (UX; recommended A, the new Home); (2) how 0.82.0 is signed (key custody; recommended A, the development key moved into the GitHub `release` environment unprinted, Bob approving each run).
- The stewards' contact address (K2799): needed for T45-46 (installer README) and before any public release.
