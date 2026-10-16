# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #195 (`session_013anj6KeQTxLYyS2AbYP2Qb`, depth 1, parent ROOT #5 `session_0187SrKsqhqzSTqwDk2hzcXy`, primary account), 2026-10-16 ~21:25 UTC, at 43% context. Read `build/rulings-active.md` whole, then, whole with the Read tool, rulings K3590–K3604 (all of BOB #195's; about 20 KB), and Bob's rulings on the assistant's hosting K3538, K3558, K3574, K3585, K3595, K3600, K3602 whole (K3588).

## Read in full at takeover, besides the usual set

- `build/plan/draft-T50-plan.md` whole (its last two sections are BOB #195's review: what R085 and the lanes add, V4, K3602), and `build/plan/next.md` (N1148–N1195 are the newest).
- `build/plan/study-assistant-hosting/HANDOFF.md` S11–S17 and `COMPARISON.md` §6.
- `build/plan/lane-journeys/browser/HANDOFF.md` V4 and `browser/FINDINGS.md` B-27 to the end.
If any session must read part of a document it acts on, it stops and tells Bob first (K3586).

## Standing tonight

- **No approvals asked of Bob** (K3600, rulings-active §1): a safety-check refusal is never worked around; a different legitimate route if one exists (K3599's sign-in by the environment's `JOURNEY_MEMBER_*`), else recorded as a blocker and reported as a fact.
- Overage and fix-round rulings (K3549, K3551) bind until T50 opens; then their rulings-active lines are pruned (reviewed at this handoff: nothing else is out of force).
- The assistant is investigated, not passed (K3574); remote first (K3585); Team or Enterprise plans not required before 1.0 (K3595); live progress, answers only after their check (K3602, "Choice A").

## Where things stand

- **R085 closed** (rounds 7, 8). `dist/cut-0.85.0` @ b29f55bb22 on biosmoke8. agent-runner's container application is back at standard-1 (v6, read back 21:07Z; rollouts are the way to change its size, K3595).
- **ASSISTANT-HOSTING #2** `session_01LRYEjmorgB3AX1wXhH7hjA` (sonnet, ~42% context): remote series closed (S11–S17, K3603): cloud session 3–18 s to first answer, 3 s per message to a live one, 7 at once fine, full dialogue (211 KB in, 62 KB out) proven by the repository route; local runner ≈41 s before the CLI's first call (warm, both sizes), 83.5 s cold, cause unknown (a stage log is T50's, N1189). Told to fold S11–S17 into COMPARISON §6 and end its turn; its next step (scoring, charter step 4) waits for you after the reset. Consider a fresh #3 for scoring (its context).
- **Bob's report** published: https://claude.ai/artifact/BHeW9qRzLwNecSQYArAfHg (remote and local, layer by layer). Bob has not yet answered it; nothing is asked of him in it.
- **JOURNEYS #3** archived (row under T49). V4 funnelled to T50 (K3598).
- **Channel:** read through U310; posted B257 (walk findings, doors first), B258 (V4), B259 (ACK), B260 (NOTICE of K3602). UX-DESIGN answers after the reset.
- **Spend limit:** every session stopped at 19:59 UTC on the org's monthly spend limit; running again since 20:46 (K3594).

## What comes next, in order

1. **Take over** (§5.1) with `mail bob --tranche R085`. Archive BOB #195 once idle (BOB-final row under T49). Delete its routines: backstop "BOB #195 backstop" (`trig_01LtbSEfjdhQBQZmukfzM3ZX`, 21:35), WATCH #195 `trig_019N5z6SuumMH7gg4GrYFgi6`. Arm your WATCH into ROOT #5; a backstop only while a lane works.
2. **T50 opens at 11:00 UTC, 2026-10-17** (K3551): adopt `draft-T50-plan.md` with BOB #195's review as `current.md` (fold the review into the entries; settle each "owner at the fold"); opening act: `tranche/T50` from `main`, merge `dist/cut-0.85.0`, then the design branch on its MERGE (K2273, §13.1 (5)); move R085's plan, `diag-085-*`, `walk-085*`, `starts-R085/` to `build/plan/archive/` and prune K3549/K3551 from rulings-active (K3559); ask Bob his meter reading (§5.2 (3)); if near 80%, the "meter" rows of the review stay out.
3. Fold UX-DESIGN's DECs for B257, B258, B260 as they arrive (N1180–N1184, N1190, N1192, N1195).
4. Assistant study: scoring under method A (charter step 4) once the lane is restarted.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T50's close PR (§5.7 (3), K2273); the cut reaches `main` only by its merge into `tranche/T50` at the opening.
- Cloudflare acts on biosmoke8 and deploys are under Bob's standing permission (K3466, K3600); a safety-check refusal is handled as rulings-active §1 says, never worked around, never asked of Bob.
- The stray branches `job/R085/agent-runner-r8`, `job/R085/screens-daily-r7` (deletes refused by the proxy) and `study/probe-dialogue` (evidence, keep) are left.

## Open with Bob

None.
