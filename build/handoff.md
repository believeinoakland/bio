# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #193 (`session_01KHqxV8EgzsJHt2ehAsdqHK`, depth 1, parent ROOT #5 `session_0187SrKsqhqzSTqwDk2hzcXy`, primary account), 2026-10-16 ~18:05 UTC, at 40% context. Read `build/rulings-active.md` whole (brought current today, K3559), then, whole with the Read tool, rulings K3549, K3551, K3557, K3558, K3561–K3563.

## Standing tonight (rulings-active §1)

- **Overage** (K3549): the primary account's weekly limit is spent; work continues on overage (4× cost) until Bob says stop. Cheapest able model everywhere; no speculative workers; one deploy per fix round.
- **Fix rounds only for the focus journey** (K3551): a finding enters a round on the 0.85.0 cut only if it blocks K3320's journey and is fixable there; all else to `next.md` for T50, which opens at the weekly reset, **2026-10-17 11:00 UTC**.
- **Bottom up** (K3558): the assistant is not walked end to end again until each layer below is proven live (the nine-step ladder in K3558).

## Where things stand

- **Fix round 6 is deployed** to biosmoke8 (K3543): cut `dist/cut-0.85.0` @ 84317f9bc4; plane sha256 `99b30d0f…`; agent-runner `standard-1`. Every module red on its head is red on the base (K3543, K3557, accepted by name; N1171 for T50).
- **Fix round 7 runs on `tranche/R085`** (plan `build/plan/current.md` R085-36–R085-42; Jobs line holds the addresses):
  - merged: R085-36 screens-daily R24; R085-38 agent-harness R16; R085-40 screens-inquiry R49.
  - running: R085-37 SKILLS #1 (R50); R085-41 RUN-RULES #1 (R34, `nothing-written` ending; started 17:58, unconfirmed at 18:00); R085-39 AGENT-WORKER #30 (R107, R108 applied, J12 read; waits for BOB's CHANGE that skills and run-rules are merged, then merges the tranche, fixes its R11 key-list test, rebuilds its bundle last); R085-42 SCREENS-DAILY #6 re-opened on CHANGE B5 (R38, R39: Find in from a document; results draw the cite act).
- **Lanes:** JOURNEYS #1 and #2 and ASSISTANT-HOSTING #1 are archived (rows under T49). Their files: `build/plan/lane-journeys/` (J-1–J-11), `lane-journeys/browser/` (B-1–B-26), `study-assistant-hosting/` (S1–S4, `walk-r6.md`). Funnelled: N1172–N1184 in `next.md` (K3545–K3562).
- **Channel:** read through U309; B256 ACK posted. INVESTIGATION-DESIGN: nothing past H43.
- **Format check:** one old failure, K3441 lacks its standing-list statement (rulings are not edited; a new line naming it may state it).
- Worktrees in BOB #193's container only; nothing to carry.

## What comes next, in order

1. **Take over** (§5.1) with `mail bob --tranche R085`. Archive BOB #193 once idle (its BOB-final row under T49). Delete its routines: backstop (the newest "BOB #193 backstop", fires ~18:18), WATCH `trig_01BUxXzBHhnE5PsiRHMXp4KT`. Arm your WATCH into ROOT #5 and a backstop (jobs run).
2. **Merge each round-7 job when COMPLETE** (§5.5), striking its marks. When SKILLS #1 and RUN-RULES #1 are merged, post AGENT-WORKER #30 a CHANGE (merge the tranche, rebuild its bundle last), then merge it.
3. **Close round 7:** regenerate artifacts in the manifest's order (the plane bundle is stale from screens-inquiry R49, skills, run-rules); `fleetbundles`, `checks/run.mjs`; archive the round's job sessions with their rows under R085.
4. **Deploy** (Bob's one-line approval in your session, §16, as K3542): push `tranche/R085` to `dist/cut-0.85.0`; plane by `deploy.mjs`, agent-worker by `deploy-fleet.mjs` (start `dockerd` first if agent-runner changes; it does not this round). Reach the instance directly (rulings-active §4).
5. **Start ASSISTANT-HOSTING #2 on sonnet** (K3553) to climb K3558's ladder from step 1, stopping at the first failing layer; its files are its handoff. Check N2 (another project's records cited) as a member at the ladder's step 9.
6. Tell Bob, rendered, where the ladder stands and whether his journey works.
7. **T50 opens at 11:00 UTC Saturday** (K3551, K3425): cut merged into `tranche/T50` at its opening (K2273), with the design stream's branch (`e074feaa46` or newer, U305); plan from `next.md` (N1170–N1184 among it).

## Pruning done at this handoff (K3559)

rulings-active brought current (17 rules added, 11 stale lines fixed); 166 finished drafts, starts and notes through T48 moved to `build/plan/archive/`. Still to prune at the next handoff: rulings-active is 105 lines (over its ~80 guide); R085's finished diagnoses (`diag-085-*`, `walk-085*`) move to the archive once R085 closes.

## Acts on main or sessions (reviewed acts, §5.8)

- Deploys and pushes to `dist/cut-0.85.0`: refused by auto mode despite K3466; Bob's one-line approval in the refused session each time (K3542, rulings-active §2).
- biosmoke8 holds nothing secret (K3556): its credentials' exposure is not raised.
- The cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273).

## Open with Bob

None.
