# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #191 (`session_01K1e9EkAmKEfbh9o6Afgf9C`, depth 1, parent ROOT #5 `session_0187SrKsqhqzSTqwDk2hzcXy`, primary account), 2026-10-16 ~13:45 UTC. Read `build/rulings-active.md` whole, then K3517–K3523 (BOB #191's).

## RELEASE ONLY (K3425, K3426)

Only release 0.85.0 work proceeds until T50 opens (Bob's K3425: Saturday 2026-10-17). Bob wants no babysitting (K3450) and no technical steps handed to him (K3466).

## Where things stand

- Fix round 5 is merged and deployed on biosmoke8 (K3510–K3515): `tranche/R085` = `dist/cut-0.85.0` @ 862df779a5; no job running. biosmoke8 serves 0.85.0; `/favicon.ico` 204 (notes `build/plan/walk-085-r5.md`, a blocked note to be replaced).
- **The re-walk is not done.** It was blocked by the environment's admin handle (misspelled; Bob fixed it, K3523). Bob wants the walk run by a worker, never in BOB's own context.
- Models and effort (Bob, K3518; rulings-active §5): every worker spawn names model and effort; the walk worker is sonnet at medium.
- Channel: read through U306 (UX design #24 `session_01He2uMKmm4ZtziW18jtY1BD` writes UX-DESIGN's outbox); BOB posted B253 (ACK) and B254 (K3518 NOTICE). T50's design merge takes `e074feaa46` (U305) or the newest commit the stream names. INVESTIGATION-DESIGN: nothing past H43.

## What comes next, in order

1. **Take over** (§5.1) with `mail bob --tranche R085` (run from a checkout of `tranche/R085`). Archive BOB #191 once idle and write its BOB-final row under T49. Delete its WATCH `trig_01F3YbHdELXDiFFZegzpfbre` and its backstop (any routine into BOB #191). Arm your own WATCH into ROOT #5.
2. **Confirm** without printing it that `JOURNEY_ADMIN_HANDLE` reads `sparky` (`node -e` comparing it). If not, tell Bob in one line and stop.
3. **Start the walk worker** (Agent tool, `general-purpose`, model sonnet, effort medium, in the background). Its prompt: sign in only with `JOURNEY_ADMIN_HANDLE` and `JOURNEY_ADMIN_PASSWORD` exactly as the environment holds them, by variable, never printed; ignore `BIO_INSTANCE`, `BIO_ADMIN_TOKEN` and `BIO_MEMBER_TOKEN` (biosmoke7's); the instance is `https://biosmoke8.believeinoakland.workers.dev`, reached with `--noproxy '*'` / Chromium `--no-proxy-server`; read `build/plan/walk-085-r4.md` and `build/plan/diag-085-r5.md` (on `tranche/R085`) first. **A**: as administrator in "WALK-085 project", upload a fresh `.txt` (new bytes), open a question on it, ask the assistant (check run), wait for its end (poll cheaply), and record PASS/FAIL with evidence: (a) sub-sessions' passage reads return rows; (b) a candidate answer composed, or its drop logged LOOKED_INDETERMINATE naming the names; (c) the question page shows the run running and its ending (1280 screenshot); (d) the dock shows the last ended run on a fresh load; (e) no raw record id in the new proposals' member-facing text; (f) `/favicon.ico` 204; the run's cost. **B**: create member `walker` (or `walker2`) through the product's own invite and join flow (Bob's permission, K3520), a strong random password made locally, written only to `member-sign-in.txt` in the session's primary working folder (add the name to `.git/info/exclude` first; chmod 600; never printed or committed); sign in as it and look at `/` and Home at 1280 and 390. Notes replace `build/plan/walk-085-r5.md`, screenshots under `build/plan/walk-085-r5/`, committed and pushed on `tranche/T49` (never force). Reply under 300 words.
4. Tell Bob, rendered (an Artifact), whether his journey works end to end (K3320's bar), and give him the path of `member-sign-in.txt` so he sets `JOURNEY_MEMBER_HANDLE` and `JOURNEY_MEMBER_PASSWORD`.
5. A defect the walk finds is fix round 6 on the cut (as K3510), or an entry for T50 when it can wait.
6. **T50 opens Saturday** (K3425): the cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273), with the design stream's branch.

## Acts on main or sessions (reviewed acts, §5.8)

- Deploys to biosmoke8 and pushes to `dist/cut-0.85.0`: Bob's standing permission K3466, but auto mode refuses them in session (K3481, K3495, K3504, K3514); each needs his one-line approval in the refusing session (§16); K3482, K3496, K3506 and K3515 were one-off.
- A sign-in by a handle other than the environment's was refused even with Bob's approval (K3523): sign in only by the variables.
- The cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273).

## Open with Bob

- None.
- Left on biosmoke8: "WALK-085 project", INQ-2026-0001 citing INFO-2026-0003, held INFO-2026-0001/0002, runs RUN-56442ec609fca066 and RUN-55795a8154fd58b6, two unaccepted level-empty proposals.
