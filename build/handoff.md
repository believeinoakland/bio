# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #157 (`session_01WVgWUVdGVxirrZA8mzQf8G`, primary account, depth 1), 2026-10-11 ~22:17 UTC, refreshing at about 52% of its window right after starting T45's L9, no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2813–K2844.

## Where things stand

- **T45 open, L9 just started** (12 jobs, all twelve confirmed started by 22:19; FILING-TEMPLATES J1 and ESCALATION J1 answered, K2844: escalation R31 moved to T46, N910). Merged and closed: L1, L2, L5 (K2818), L6 (K2828), L8 (K2840). L10's and L11's STARTs are drafted in `build/plan/starts-T45/` with notes appended for later rulings; L11 gained **T45-49 answer-envelope** (K2834, START drafted, reading set to measure at posting).
- **L9 merge order:** conformance, consequences, action-grammar, action-holds (copy; registers nothing until actions deletes, reconciliation R19), actions (deletes after action-holds' CHANGE), action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work. Each START names the same-layer modules it uses; send each a CHANGE when a provider merges.
- **Accepted reds:** plan rule 4 (1)–(14) as written in `current.md` (4 (6) opens at actions' merge, K2815; 4 (12) ops reds until T45-45/38/39; 4 (13) fleetbundles' agent-worker pin until N900; 4 (14) answer-envelope families until T45-49).
- **Reserved families:** C-148 case-check (used), C-149 action-holds, C-150 action-replies, C-151 plan-work, C-152 action-producers, C-153 case-account (used, K2829). stewards: a family BOB opens at its START.
- **Timers:** backstop `trig_01H4Qb42UpT4d3MRuav633gM` (22:40) and `WATCH #157` `trig_01H67dkVnR5MMnrtrehWQZQd` (22:59, into ROOT #5): delete both at takeover and arm your own.
- **ROOT #5** (`session_0187SrKsqhqzSTqwDk2hzcXy`): ~349k of 1M (35%) at 20:05, below Bob's 55% (K2679); a prompt's "start ROOT #7" follows the retired 300k rule (K2813).
- **Container:** `npm ci` done in agent-runner (`--ignore-scripts`), sheet-worker, file-scanner; a fresh container needs it again (K1980).
- **Channel:** UX-DESIGN read to U160; B143 (ACK), B144 (Bob's "Proceed" for the layouts page, K2838, also sent by message) posted. Design lanes: investigation H43, actions H31, nothing new.
- **Usage:** two L8 sessions and this one show the platform's seven-day `allowed_warning`; Bob asked for his meter (K2841). Pause at 80% stands (K2341).

## Bob's rulings since the last handoff

- **K2816** trial: "1. B 2. B 3. A 4. C 5. A" (designed screens as the interface; test-instance AI exception; his own sign-in; images by copy; biosmoke7 in place) → N897.
- **K2819** stewards: "1. C 2. A 3. A 4. A 5. A", folded into `stewards` R3, R5, R13, R15, R22, R23.
- **K2838** "Tell the UX design session to Proceed for the layouts page" (relayed).

## Next steps, in order

1. Take over (§5.1): archive BOB #157 once idle, its `BOB-final` row under T45; delete its two timers; arm yours.
2. Run L9: confirm starts, answer questions, forward CHANGEs as providers merge, merge in order (ownership, merge, strike marks, ruling). For new modules (action-holds, action-replies, plan-work) enter their `paths`/`tests` in `modules.json` from the COMPLETE before the ownership check (K1043; edit the one line with `sed`, never rewrite the JSON, K2829's lesson). Close L9 (§5.6: regenerate in K1540's order, checks, archive, rows).
3. L10 then L11 from the drafted STARTs; at L11's START re-measure reading sets (`/tmp` script lost: regenerate from `build/plan/reading-sets.py`), fill installer's ADDRESS line (Bob has not named it: then T45-46 moves to T46 with that hard reason), stewards' family, answer-envelope's set.
4. T45's close (§5.7): every module's tests (K2704), archive, PR to `main` (standing direction K1177; `mcp__github__merge_pull_request`); design PR #28 merged first if UX-DESIGN has posted `MERGE`. Then plan T46 from `draft-T46-usable.md`, N897 and next.md (N896–N909, among them split plans for case-authoring N908 and publication N909).

## Open with Bob

- The stewards' contact address (K2799): needed for T45-46 (installer README) and before any public release.
- (answered: 51%, K2843)
