# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #159 (`session_01YBBtNsZa9wzk8pBdgu8C8o`, primary account, depth 1), 2026-10-12 ~02:30 UTC, refreshing at about 53% of its window right after T45's close, no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2869–K2907.

## Where things stand

- **T45 is closed** (K2907): PR #29 merged to `main` (@ 8e5f57fad0); `archive/T45.md` holds its Outcome. Every T45 job session is archived and its row written. No tranche is open; no layer runs; no timer of this BOB is armed (WATCH deleted, no backstop).
- **`main`** carries PR #28 (the design stream: DEC-193 to DEC-197) and PR #29. The build state commits between tranches go on `tranche/T45` (rulings-active §2), as K2907 did.
- **T45's report to Bob** was given in this BOB's last turn; his weekly meter was asked for then (§5.7 (5)).
- **ROOT #5** (`session_0187SrKsqhqzSTqwDk2hzcXy`) is below 55% (37% at this BOB's takeover; K2679, K2869): ring it, not a ROOT #7.
- **Container:** `npm ci` done in agent-runner (`--ignore-scripts`), sheet-worker, file-scanner; a fresh container needs it again (K1980).
- **Channel:** UX-DESIGN (now `session_018JqYSTCQoQF5SPAXFQxvDD`) read to U169; B148 ACK posted. It awaits T46's HANDOFF (registry corrections, `SCREEN_WORDS` keys, the sign-in refusals, the test-instance words, the front doors; `draft-T46-plan.md` "BOB's acts"). Design lanes: investigation H43, actions H31, nothing new. N933 (a stake per matter) is for the actions lane.

## Bob's rulings since the last handoff

- K2892: "2. B (member's account)": a member's own Claude sign-in runs check and plan for that member only (N919; ai-runs R18 and a control-plane door in T46).
- K2893: "3. Home, the development key": a member lands on the new Home after sign-in; 0.82.0 is signed with the development key moved into the GitHub `release` environment (unprinted; Bob approves the signing run).
- Through the design stream: DEC-195 → DEC-196 → DEC-197 (handles fixed at joining, never changed or reused, "for the time being"); owed: N934 (membership refuses `handlechange` with `HANDLE_FIXED`, BOB's choice, K2903).

## Next steps, in order

1. Take over (§5.1): archive BOB #159 once idle, its `BOB-final` row under T45.
2. **Release 0.82.0** from `tranche/T45` before T46 opens (K1501, K2273; `draft-T46-trial.md` §4 steps 0–14): cut on `dist/cut-0.82.0`; sign through `release-sign.yml` with the development key piped into the `release` environment unprinted (K2893), Bob approving that run; images by the GHCR workflow, copied for `biosmoke7` (K2816 (4)). Every deploy act and every signature verify control is refused as Production Deploy and approved by Bob in session each time (rulings-active §2: K1715, K1716, K1717, K1905, K1910, K1915); never on the standing list. Name each act to Bob with plain steps. Surface failures found at the live checks join T46 at its opening.
3. **Open T46** (§5.2) from `build/plan/draft-T46-plan.md` (reviewed K2872, Bob's answers folded K2892, K2893, study K2873) and `next.md` N896–N938: re-test every left-out row (doubt 8: `archive/T41.md`), settle doubts 4, 5, 7, 11, 13 against what T45's close left (PR #28 is on `main`: N886, N913 and N937 are now foldable; N934 joins membership's job), fold N919 (K2892) into ai-runs and control-plane, N920 for N881's report, N921–N938 into their owners' entries. Create `tranche/T46` from `main`, WATCH, backstop, L1.
4. Post T46's HANDOFF to UX-DESIGN (one entry, `draft-T46-plan.md` "BOB's acts").

## Open with Bob

- The stewards' contact address (K2799): needed for T46's installer job (N923), for deploying the stewards' service (with its Email Routing verification, `NOTIFY_FROM` and secrets), and before any public release.
- His weekly meter reading (asked at T45's close).
