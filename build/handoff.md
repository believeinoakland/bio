# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #190 (`session_01HqQ2d1HjF7g1iniy8y5mNx`, depth 1, parent ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1`, **secondary account**), 2026-10-16 ~12:45 UTC. **Work on the secondary account is stopped (Bob, K3516)**; the next BOB runs on the **primary** account, started by Bob's ROOT there (manifest: ROOT #5 `session_0187SrKsqhqzSTqwDk2hzcXy`, or a new ROOT Bob starts). Read `build/rulings-active.md` whole first, then K3509–K3516 (BOB #190's): they are the release's state.

## RELEASE ONLY (K3425, K3426)

Only release 0.85.0 work proceeds until T50 opens (Bob's K3425: Saturday 2026-10-17). Bob wants no babysitting (K3450) and no technical steps handed to him (K3466); an act a session's own safety check refuses is told to him in one line with the approval to type (§16).

## Where the release stands

- **Fix round 5 merged and deployed** (K3510–K3515): query-language R31 (bare words under `rows=passage` read as passage words), agent-worker R101–R102 (a dedup drop logged; `¶` ends a cited record id), agent-harness R13 (an empty-level description says "this question"), screens-inquiry R47–R48 (the question page and the dock show the run, running and ended), control-plane R101 (`/favicon.ico` 204) on `tranche/R085` = `dist/cut-0.85.0` @ 862df779a5. biosmoke8: plane sha `ee0fc1e8…`, agent-worker version `6aa8d660…` (rollout unconfirmable, S12), agent-runner unchanged (`b0220ffa…`). No job running; the round's sessions archived with rows in `metrics/R085.csv`. Plan entries R085-21–R085-25 in `build/plan/current.md` on `tranche/R085`; diagnosis `build/plan/diag-085-r5.md` there; the plan names each item left out and why.
- **Not yet done: the re-walk** after round 5.
- **Channel**: read through U304; nothing past it at 07:27 UTC. INVESTIGATION-DESIGN's HANDOFF nothing past H43. T50's design merge takes `8d4de6d84c`. Left for T50: N1158, N1166–N1169, and from round 5 the dock's pass, level and cost (words missing; DEC-296) and a `level-empty` proposal drawn by key.

## What comes next, in order

1. **Take over** (§5.1) on the primary account with `mail bob --tranche R085`. BOB #190 and ROOT #6 are on the secondary account: they cannot be archived or rung from the primary; leave them, with no BOB-final row for BOB #190 (K1897). BOB #190 deleted its own WATCH and backstop. Arm your own WATCH into the primary ROOT. `mail bob` rewrites BOB's Writer line; if it warns the account differs from the registry's `BOB` row, follow its `xwriter` line (the registry row follows the account at the next tranche close, K1428).
2. **Re-walk** biosmoke8 live as administrator (a worker, told never to print a token; reach the instance with `--noproxy '*'`, rulings-active §4): **upload a fresh `.txt` document** (new bytes; the old INFO-2026-0003 capture keeps a stale `indexed_none`, K3510), open a question on it in the project, ask the assistant, and check: sub-sessions' passage reads now return rows; a candidate answer is composed or its drop is logged; the question page shows the run while running and its end; the dock shows the last ended run on a fresh load; no raw record id in new proposals; `/favicon.ico` 204. Record the run's cost. Then tell Bob, rendered, whether his journey works end to end (K3320's bar).
3. A defect the walk finds is a fix round 6 on the cut, as K3510 did, or an entry for T50 when it can wait.
4. **T50 opens Saturday** (K3425): the cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273), with the design stream's branch (`8d4de6d84c`).

## Acts on main or sessions (reviewed acts, §5.8)

- Deploys to biosmoke8 and pushes to `dist/cut-0.85.0`: Bob's standing permission K3466, but auto mode refuses them in session (K3481, K3495, K3504, K3514); each needs his one-line approval in the refusing session (§16); K3482, K3496, K3506 and K3515 were one-off.
- The cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273).

## Open with Bob

- None waiting on him beyond starting the work on the primary account (K3516).
- Left on biosmoke8: "WALK-085 project", INQ-2026-0001 citing INFO-2026-0003, held INFO-2026-0001/0002, runs RUN-56442ec609fca066 and RUN-55795a8154fd58b6 (completed), two unaccepted level-empty proposals from the first.
