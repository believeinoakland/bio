# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #189 (`session_01YQ4yT2XcSToaGFfTUtnjeH`, depth 1, parent ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1`), 2026-10-16 ~05:40 UTC, at ~31% context. Read `build/rulings-active.md` whole first, then K3500–K3508 (BOB #189's): they are the release's state.

## RELEASE ONLY (K3425, K3426)

Only release 0.85.0 work proceeds on this account until Bob reports 95%; T50 opens Saturday (2026-10-17) on the other account. Bob wants no babysitting (K3450) and no technical steps handed to him (K3466); an act a session's own safety check refuses is told to him in one line with the approval to type (§16), as K3504–K3506 did.

## Where the release stands

- **Fix round 4 merged and deployed** (K3501–K3506): observation-log R38, ai-runs R85–R86, agent-harness R12, agent-model R20–R21, agent-worker R96–R100, machinery-producers R14, screens-inquiry R46 on `tranche/R085` = `dist/cut-0.85.0` @ ec620042d6. biosmoke8: plane sha `3d77f7d9…`, agent-worker `49957fd4…`, agent-runner unchanged (`b0220ffa…`). No job running; the round's sessions archived with rows in `metrics/R085.csv`. Plan entries R085-14–R085-20 in `build/plan/current.md` on `tranche/R085`; the diagnosis `build/plan/diag-085-r4.md` there.
- **Re-walk** (K3507, `build/plan/walk-085-r4.md`): the check now names and holds the document but every passage read returns 0 rows; no answer composed. Details and the remaining screen defects in K3507.
- **Channel**: read through U304 (DEC-296, a run's cost words, T50; DEC-283 stays in T50, K3505). T50's design merge takes `8d4de6d84c`. Left for T50: N1158, N1166–N1169.

## What comes next, in order

1. **Take over** (§5.1) with `mail bob --tranche R085`; archive BOB #189 and write its BOB-final row under T49. Delete BOB #189's routines: WATCH #189 `trig_01WWt3G9n9tbHHD7ThZYor9d` (into ROOT) and the backstop `trig_01Vx5Mryd62X74eza2K6sgCu` (fired; delete if still listed); arm your own WATCH.
2. **Fix round 5 on the cut** (out of layer under K3466, as K3477/K3489/K3501), packaged by you; confirm each cause in code first (one read-only worker if needed):
   - passage reads with bare words: a sub-session's `meaningrows` call with `rows=passage` and a `q` with no selector finds the document's passages (live: `rows=passage&q=pothole` + ids → 0 rows; `q=passage:pothole` → ¶1). Choose the owning module (agent-worker rewriting `q`, or retrieval's `meaningRows` treating bare words as passage words for that arm).
   - the old capture's `indexed_none`: either re-derive existing captures' index rows (observation-log R38 for rows written before it) or walk with a freshly captured document; decide.
   - agent-worker R100: also split a cited address at `¶`.
   - compose/dedup: log why a candidate is dropped (agent-worker or agent-harness).
   - screens-inquiry and the shell's panel: the question page shows the run, running and ended ("ended with nothing new"); the dock reads past runs on a fresh load (not "No run yet"); older proposals never show a raw record id. Words by key (K3366): use existing keys; a missing key is a REPORT for the design lane.
   - ai-runs: `airunopen`'s project gate for a question in a project (check it is a bug first).
   Tell Bob in one line when the jobs start.
3. **Close the round** as K3504 did (merge, regenerate in the manifest's order, `fleetbundles` red only on K3454's arm, `checks/run.mjs` 0, archive, metrics). After a container restart: `npm ci` in agent-runner (`--ignore-scripts`), sheet-worker and file-scanner (`--ignore-scripts`) before `fleetbundles`.
4. **Push and deploy**: refused by auto mode in any BOB session; tell Bob in one line with the exact approval to type in your session (§16), naming each member. Deploy as K3506 did: `deploy-fleet.mjs <member> --instance biosmoke8` from the repo root, `deploy.mjs biosmoke8 0.85.0 dist/bio-plane.bundled.mjs` from `bio-plane/`; check `CF_ACCT` is the CLAUDE.md account first. A container member's change needs its image digest written in (S11) and dockerd started (S6).
5. **Re-walk** the check live as administrator (a worker, told never to print a token); then tell Bob, rendered, whether his journey works end to end (K3320's bar), with the run's cost.

## Acts on main or sessions (reviewed acts, §5.8)

- Deploys to biosmoke8 and pushes to `dist/cut-0.85.0`: Bob's standing permission K3466, but auto mode refuses them in session (K3481, K3495, K3504); each needs his one-line approval in the refusing session (§16); K3482, K3496 and K3506 were one-off.
- The cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273), with the design stream's branch (now `8d4de6d84c`).

## Open with Bob

- None waiting on him.
- Left on biosmoke8: "WALK-085 project", INQ-2026-0001 citing INFO-2026-0003, held INFO-2026-0001/0002, runs RUN-56442ec609fca066 and RUN-55795a8154fd58b6 (completed), two unaccepted level-empty proposals from the first.
