# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #187 (`session_017JLE6WEMB3Eybd2JVz8gCH`, depth 1, parent ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1`), 2026-10-16 ~01:30 UTC, at ~33% context. Read `build/rulings-active.md` whole first, then K3475–K3486 (BOB #187's): they are the release's state.

## RELEASE ONLY (K3425, K3426)

Bob's meter was 91% at ~23:20 UTC 2026-10-15 (K3461). Only release 0.85.0 work proceeds on this account until Bob reports 95%; T50 opens Saturday (2026-10-17) on the other account. Bob wants no babysitting (K3450) and no technical steps handed to him (K3466); an act a session's own safety check refuses is told to him in one line with the approval to type (§16), as K3481–K3482 did.

## Where the release stands

- **Fix round 2 merged and deployed** (K3477–K3483): capture R92, control-plane R100, screens-intake R27, screens-inquiry R45, ai-runs R82–R84, agent-worker R91–R92 on `tranche/R085` @ b83e9d83cb = `dist/cut-0.85.0`; biosmoke8's plane (sha `1a9036b8…`) and agent-worker (`SEGMENTS` bound) deployed. No job is running.
- **Re-walk** (K3484): F1 fixed live (capture, read, cite, listed under the question, warned open). F2 partly: the press is answered at once, the run's ticks advance, Stop works; but no proposal.
- **Diagnosis** (K3486): the run is stuck by a bug (continuation refused `SEGMENT_RUNNING`) and produces nothing because sub-session reports overrun 500 characters; Find never sends `passage:`.
- **Member walk** (K3480): a plain member cannot start a project (correct by grant; the form shown to her is N1163, design DEC-286); report `build/plan/walk-085m.md`.

## What comes next, in order

1. **Take over** (§5.1) with `mail bob --tranche R085`; archive BOB #187 and write its BOB-final row under T49. Delete BOB #187's routines: WATCH #187 `trig_018YHK2rYZweqWKj4yihA2pC` (into ROOT) and the backstop `trig_015bSLJJHK8E5riMX4fm2TCQ` (into BOB #187, 01:39 UTC); arm your own WATCH. Read the channel (UX-DESIGN is now `session_01WknFMgak9E4FXrM5GB9gLo`, read through U300).
2. **Fix round 3 on the cut** (K3486, out of layer under K3466 as K3477): write the requirements on `tranche/R085` (next free ids: agent-worker R93, agent-model, agent-harness and screens-daily: read their files), STARTs under `build/plan/starts-R085/`, plan entries in `build/plan/current.md` under a "Fix round 3" heading, then the four jobs: agent-worker (sonnet; `segment_end` after `running` cleared), agent-model (sonnet; the 500-character summary limit stated and `CONDITION_KINDS` as an enum in the sub-session tools), agent-harness (sonnet; an over-bound report handed back once to be rewritten), screens-daily (haiku; Find sends `(<words>) OR passage:(<words>)`). Tell Bob in one line when they start (K1548 read as covered by K3466). K3477's START text is the model.
3. **Close the round** as K3481 did: merge, regenerate artifacts in the manifest's order (`npm ci` in bio-plane, agent-runner `--ignore-scripts`, sheet-worker first; agent-worker has no lock file), `fleetbundles` red only on K3454's accepted arm, `checks/run.mjs` 0, archive the jobs with rows in `build/metrics/R085.csv` (on `tranche/T49`).
4. **Push and deploy:** pushing `tranche/R085` to `dist/cut-0.85.0` and deploying is refused by auto mode in any BOB session ("Production Deploy"); K3482's approval was one-off in BOB #187's session. Tell Bob in one line, with the exact approval to type in your session (§16): `Approved: push tranche/R085 to dist/cut-0.85.0 and deploy biosmoke8's plane and agent-worker from it.` Then `node bio-plane/scripts/deploy-fleet.mjs agent-worker --instance biosmoke8` and, in `bio-plane/`, `CF_TOKEN=proxy-injected CF_ACCT=20b533579290b9b93168345edd3b7f72 node scripts/deploy.mjs biosmoke8 0.85.0 dist/bio-plane.bundled.mjs` (the proxy injects the Cloudflare credential).
5. **Re-walk** F2 and Find live as administrator (a worker, as K3484's): one Ask, watch up to ~40 minutes (three passes), stop it if still running; note the cost (each pass ~$2.50 on Bob's subscription; tell Bob the figure).
6. Then tell Bob, rendered, whether his journey works end to end (K3320's bar).

## Acts on main or sessions (reviewed acts, §5.8)

- Deploys to biosmoke8: Bob's standing permission K3466, but auto mode refuses them in session (K3481); each needs his one-line approval in the refusing session (§16), K3482's was one-off.
- The cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273), with the design stream's branch (newest commit UX-DESIGN names then; now `cc0ff593a5`).

## Open with Bob

- None waiting on him.
- Left on biosmoke8: "WALK-085 project", INQ-2026-0001 citing INFO-2026-0003, held INFO-2026-0001/0002, two cancelled runs.
