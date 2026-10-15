# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #186 (`session_01FGmgKV8kyoiWGVhKe6MwQJ`, depth 1, parent ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1`), 2026-10-16 ~00:05 UTC, at ~29% context. Read `build/rulings-active.md` whole first, then K3453–K3474 (BOB #186's): they are the release's state and Bob's new directions.

## RELEASE ONLY (K3425, K3426)

Bob's meter 91% at ~23:20 UTC (K3461). Only release 0.85.0 work proceeds on this account until Bob reports 95%; T50 opens Saturday (2026-10-17) on the other account. Bob wants no babysitting (K3450) and no technical steps handed to him (K3466, his words: standing permission for the steps development needs; the safety rules in CLAUDE.md stand; an act a safety check refuses is told to him in one line).

## Where the release stands

- **Sign-in fixed and proven live** (K3454–K3457): agent-runner R18 (code, then "\r" 250 ms later) merged on `tranche/R085`, cut `dist/cut-0.85.0` @ be10e02db1, image `agent-runner@sha256:e7050ca4…82fc0` deployed to biosmoke8. Bob connected his own subscription (K3459). `tranche/R085` = the cut; its one job layer is closed, no job running.
- **Walk route** (K3467): Bob deleted the environment's "BIO instance reach" network secret, so a browser now walks through the session's network signed in, in sessions started after 23:30 UTC 2026-10-15 (this session predates it: start a walk session, as WALK-085 #1 was). K3246's direct route is replaced for browsers; curl `--noproxy '*'` still works.
- **WALK-085 #1** (K3473; `build/plan/walk-085.md`): as administrator, not usable end to end. FUNCTIONAL blockers F1 (a captured file's words never shown, not citable, not listed under its question) and F2 (the assistant run shows "working" with no progress or result), majors F3–F7, minors F8–F11: N1161. DESIGN D1–D18 sent to UX-DESIGN (B244).

## What comes next, in order

1. **Take over** (§5.1) with `mail bob --tranche R085`; archive BOB #186 and write its BOB-final row under T49. Delete WATCH #186 `trig_018Lb3yqQQvYq1GyQZPfNufn` (into ROOT, 00:15 UTC; move it if it has not fired) and arm your own. No backstop is armed (no job runs). Read the channel (B241–B244 await the design stream).
2. **Diagnose F1 and F2** with a worker (read-only, live and code): the cause of each by module and requirement. If the run from WALK-085 (INQ-2026-0001 on biosmoke8) is still "working", that is F2's live evidence; stop it after reading it.
3. **Fix on the cut** what blocks Bob's journey (K3320: create a project, connect, work on a real investigation): out-of-layer jobs on `tranche/R085` as R085-3… K1548 asks Bob's approval for each; BOB #186 reads K3466 ("all the other steps that you need to do in order for development to continue") as covering it: say so to Bob in one line when one starts. Then push the cut, deploy (K3466), re-walk the failed steps.
4. **The member walk** as `bob-test` (a plain member; it signs in with handle `bob-test` and `$JOURNEY_ADMIN_PASSWORD`, as `build/plan/signin-harness.py` does, while `JOURNEY_ADMIN_HANDLE` is sparky, the administrator) is owed: a walk session, same prompt shape as WALK-085 #1 (its prompt is in this session's transcript; the report's "Plain-member differences" lists what to confirm).
5. Before Saturday's T50 plan: the install register `build/plan/install-situations.md` (K3456, K3458, K3471; N1148, N1157) is read whole by the installer job; T50 carries N1152 and N1158 (approved designs, K3468), N1159 (stewards' email, debugged from Saturday, K3470), N1160 ("team", K3472), N1161, N1156.

## Acts on main or sessions (reviewed acts, §5.8)

- Deploys to biosmoke8 and Cloudflare changes: Bob's standing permission K3466 (replaces asking per act under K1715 for development work in his words; a refusal by a session's safety check is told to him in one line).
- The cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273), with the design stream's branch (K3436).
- ACTIONS-DESIGN #2 (`session_01RukQneSYmxg4FvfJ9aXccd`, primary account) is ended but unreachable from here: leave it (K3469).

## Open with Bob

- None waiting on him. Saturday: T50 on the other account; the installer's existing-install handling is now an install situation, not a question (K3471).
- BOB #186's scratch holds Bob's admin credentials for biosmoke8 (K3461) and his expired code; a successor reads `JOURNEY_ADMIN_*` instead (sparky).
