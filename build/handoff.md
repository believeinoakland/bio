# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #161 (`session_015Mryfo5hN6kMnVMxYBTy4W`, primary account, depth 1), 2026-10-12 ~06:52 UTC, refreshing at about 54% of its window with no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2945–K2970.

## Where things stand

- **T46 is open** (plan `build/plan/current.md`, 65 entries after K2949 dropped T46-21). L1–L6 closed and merged (L5 K2946, L6 K2962). **L8 runs**: eight of its nine jobs merged (K2967, K2968, K2969); **PUBLIC-READ #20** (`session_01SvLLNk2gSBYe3EG6QavHFX`) is the last, `RUNNING until 07:10` (its users' tests), its question answered (K2966). When it completes: ownership check, merge, strike R5 and R34's T46 clause, then close L8 (§5.6: artifacts in K1540's order, `checks/run.mjs`, archive the nine L8 sessions with their rows from each record's `Size` line).
- **L8 sessions to archive at its close:** CASE-CARRIAGE #10 `session_01F4upNJ1CzCkptPjBadjCPt`, PUBLICATION #30 `session_015HY6DrM4gxmJtgrtDXma3h`, PUBLIC-READ #20 (above), CASE-CHECKER #11 `session_018KyvpjWpStPQKywDPCaAeL`, CASE-IMPORT #7 `session_018a3dXcqAa5fykfa4cLba4t`, CASE-DISCLOSURES #11 `session_016tFh3EWvxLbakE52DL24QM`, CASE-ACCOUNT #3 `session_01Xn37tqsLSaaQvhHtapo2Nd`, CASE-AUTHORING #27 `session_015ySFNDd18mdxT5E8Xsc9u6`, CASE-CHECK #2 `session_01BBg9JuWWPT7LYa7vpffQYT`.
- **Requirements are folded for every remaining layer**: L9 (K2953, K2959), L10–L11 (K2960, reviewed; six new interface modules' requirements written). **START bodies are written** for L9 (`build/plan/starts-T46/<module>.txt`, twelve; action-replies' carries R8, K2964). L10 and L11 START bodies are not yet written: write them before each START, with the plan's section "For L11's STARTs (K2960)".
- **One open point BOB settles before L11's START** (plan, "For L11's STARTs"): a run the dock opens by a member's session has no `ai` credential, so `dispatchMemberRun` withholds it (K2947's wire needs a presented credential); choose a per-run credential minted at her act (credentials R13) held in memory only, or `ai-runs` admitting a session-opened run, and fold it into control-plane R77, ai-runs R18 and op-declarations R51 before T46-59's START.
- **Accepted reds added this BOB**: bundler fleetbundles "agent-worker's 27 inputs" until bundler's next job (N950, K2962). Rule 5's catalogue-end red narrowed to C-124.30 (K2959).
- **New next.md entries**: N946–N951.
- **Channel**: UX-DESIGN read to U174, nothing new; lanes investigation H43, actions H31, nothing new. The words returned to the design stream at L8–L11's folds (K2949, K2953, K2960) go into BOB's channel act (plan "BOB's acts").
- **Container**: `npm ci` done in agent-runner (`--ignore-scripts`), sheet-worker, file-scanner; `newgroup/node_modules` was a tracked symlink, now untracked (K2946).
- **Timers**: backstop `trig_01AnpnFfYSqSLhnrBtM9CF7C` (07:07) and WATCH #161 `trig_01UqQaUvHFQwpDEptpj3uyWS` (into ROOT #5, 07:47): delete both at takeover and arm your own.

## ROOT

ROOT #5 (`session_0187SrKsqhqzSTqwDk2hzcXy`) read 39% at BOB #161's takeover (Bob's threshold 55%, K2679); it told BOB #161 that Bob would start a ROOT #7 and gave him its prompt. Bob has not yet named ROOT #7's session: until he does, ring ROOT #5. When he names it, record its id in `build/manifest.md` ("Starting a session") with a ruling, and archive ROOT #5 once ROOT #7 runs (ROOT is replaced only by Bob, mechanics §2; archiving the replaced ROOT is BOB's, K2511's pattern).

## Bob's rulings since the last handoff

None.

## Next steps, in order

1. Take over (§5.1): archive BOB #161 once idle, its `BOB-final` row under T46; delete its backstop and WATCH.
2. Merge PUBLIC-READ #20 when complete; close L8 (§5.6).
3. Start L9 from its START bodies (twelve jobs; `mail addjob` each; job numbers by the highest `<MODULE> #n` in the archive, plan and rulings, plus one).
4. Write L10's and L11's START bodies; settle the dock's member-run credential (above) before L11.
5. At T46's close (§5.7): merge DEC-198's PR #30 (UX-DESIGN's MERGE U172) into `main` first, then the tranche PR; release 0.83.0 (plan "BOB's acts").

## Open with Bob

- ROOT #7's session id (he was to start it; ring ROOT #5 until he names it).
- The stewards' contact address (K2799): needed for T46-60's README part and T46-61 (installer R48, stewards R7), before L11's START.
- Bob asked how to make an account on biosmoke7 (0.82.0); BOB #161 walked him through setting a fresh `ADMIN_TOKEN` in the Cloudflare dashboard and claiming the founder seat on the setup page (`op=bootstrap` reads `rearmed: true`, N945). Nothing is owed unless he reports a problem.
