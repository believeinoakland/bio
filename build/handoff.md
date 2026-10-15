# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #185 (`session_01KwhJeKYFP6fqgxPgvz2Wtp`, depth 1, parent ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1`), 2026-10-15 ~22:20 UTC, at ~38% context. Read `build/rulings-active.md` whole first; K3436–K3450 are BOB #185's rulings (read them: they are the release's state).

## RELEASE ONLY (K3425, K3426)

Bob's meter was 89% at 19:15 UTC (K3435); not re-read since (ask it). Only the 0.85.0 release proceeds on this account until Bob reports 95%; T50 opens on the other account (Saturday). Bob wants no babysitting (K3450): fix and re-test yourself; come to him only when a fake code is handled right live.

## Where the release stands

- **biosmoke8** is installed by Bob's own installer run (K3445), claimed by Bob (K3446), fleet deployed and bound from the session, `CIVICSMITH_TEST_INSTANCE` set (K3448): `bootstrap` 0.85.0, `test_instance: true`, all six members SERVING 0.85.0.
- **The subscription sign-in fails** (K3449, K3450): agent-runner types `${code}\r` in one write; Claude Code 2.1.289 takes a long code + CR as a paste and never submits. Fix: the code, then "\r" as a second write ~250 ms later (proven on the image's binary here).
- **Running: AGENT-RUNNER #7** (`session_013ZhBfyR3CcF5sxA4qKEy4X`, claude-sonnet-5-5) on `job/R085/agent-runner`, entry R085-2 (N1155), R18 amended *(not yet met: R085)*. Plan `build/plan/current.md` on `tranche/R085` (= `dist/cut-0.85.0` @ e17672ea9f plus the R085-2 commit). Its START: `build/plan/starts-R085/agent-runner.txt`. Backstop `trig_01TPHfow97sVfS9wiqE3iPff` (22:31 UTC, into BOB #185); WATCH #185 `trig_01T3fismaBXiXdEXRs7w1kPi` into ROOT at 22:20 (delete both at takeover; arm your own).

## What comes next, in order

1. **Take over** (§5.1): `mail bob --tranche R085`; archive BOB #185 and write its BOB-final row under T49 (`build/metrics/T49.csv`); read the channel (UX-DESIGN: B240's HANDOFF of Bob's setup-screen review awaits an answer, K3446).
2. **AGENT-RUNNER #7 complete →** ownership check (`checks/ownership.mjs bio agent-runner tranche/R085 origin/job/R085/agent-runner`), merge into `tranche/R085`, strike R18's mark, push `tranche/R085:dist/cut-0.85.0` (fast-forward). That push runs `container-images.yml` (paths `agent-runner/src/**`): read the new `agent-runner@sha256:…` digest from its run summary (GitHub MCP `actions_list`/`get_job_logs`).
3. **Point the cut at the new image:** `agent-runner/fleet-member.json` `image.digest` and `agent-runner/wrangler.jsonc` `containers[0].image` (and `newgroup`'s `RELEASE_CONTAINERS` only at the next signed cut, not now). Commit on the cut.
4. **Deploy** (covered by Bob's K3450 approval): start `dockerd` if `/var/run/docker.sock` is absent (`nohup dockerd &`); from a worktree of the cut with `npm ci` in `bio-plane` and `agent-runner` (`--ignore-scripts`): `node bio-plane/scripts/deploy-fleet.mjs agent-runner --instance biosmoke8`, then `agent-worker` likewise if its binding changed. Account 20b5…7f72 only.
5. **Re-test with the harness, alone:** the harness is `build/plan/signin-harness.py` (copied from BOB #185's scratch; run `python3 build/plan/signin-harness.py <code>` with a fake code of ≥120 characters and a `#` part). Expect `start` 200, then `code` 409 `SIGNIN_REFUSED` "OAuth error … 400" within seconds. A 60 s no-outcome means not fixed. The harness signs in as `bob-test` with `$JOURNEY_ADMIN_PASSWORD` (never printed), does `reauth` and `disclosureshown`, then the two steps, then `signintrace`. A cold instance may miss the first start's 30 s address wait: run again.
6. **Then tell Bob** in one line it is ready for his one real try (open the connect page, the button, paste, press Connect once, wait up to 60 s). Then journey-check R12 live and your own live walk (K3052, K3320) before "ready".

## Acts on main or sessions (reviewed acts, §5.8)

- Deploys and Cloudflare removals each need Bob's approval in the session (K1715). Bob's K3450 approval covers redeploying agent-runner, agent-worker and the biosmoke8 plane from fixes on `dist/cut-0.85.0` until the sign-in works, in BOB #185's session; a successor's session may be refused anyway (§16: then one line to Bob naming the act).
- The cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273), with design `18c2e6fe50` (K3436).
- Out-of-layer jobs need Bob's approval each time (K1548); R085-1 (K3441) and R085-2 (K3450) are approved.

## Open with Bob

- The meter reading (89% at 19:15 UTC).
- The installer's existing-install case, held to Saturday (N1148, K3439): options go to him first.
- Setup-screen review sent to the design stream (K3446, B240).
- The stewards' address (SITE-LAUNCH), translations (N670's R88), the records-request template's reviewer (N858).
