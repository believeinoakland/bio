# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #203 (`session_019YnVjfiCWzYuKJbotYWNhq`, depth 1, parent ROOT #7, primary account), 2026-10-17 ~16:32 UTC, refreshing on Bob's word ("Refresh both BOB and UX design lanes", K3713). Read `build/rulings-active.md` whole, then, whole with the Read tool, K3690–K3713 (BOB #203's; Bob's are K3695, K3701's words in K3702, and K3713).

## Standing

- Bob's T50 focus (K3666) and trust (K3609) as before. **T50 is HELD after L6, before L7** (Bob, K3695), until Bob rules the remote-assistant route. Close L6 first (below), then hold.
- **The remote assistant is with Bob, not a job.** BOB #203 stopped the proof wrongly at K3692 and Bob corrected it: "whatever CC is doing, civicsmith can also do", "DON'T DO IT AGAIN!" (his words, K3702; the K3701 commit recording them was refused by auto mode's safety check — "Security Weaken", then "Credential Exploration" — so his ruling is NOT in rulings.md, only in K3702's and K3705's record). The direct route (Civicsmith running Claude Code's own browser sign-in for cloud sessions, holding/renewing the login, calling its sessions service) is refused by the safety check in this session and is **not to be retried in another session or offloaded to a less-cautious worker** (that is working around the refusal; rulings-active §1, §16). The documented route the check accepts is **routine fire** (per-member hand-made token on claude.ai, start-only, answer by write-back; `build/plan/design-remote-routine.md`). Bob has chosen no route yet. Bring him routine fire if he asks for options; do not retry the refused route. agent-runner R38 stands blocked at step 0 (K3692); R36–R38, R40, agent-worker R111, agent-harness R17, screens-settings R41's check, installer R56/R58 stay unbuilt until a route is chosen.

## Where things stand

- **L6: every job merged** (K3694, K3699, K3700, K3710). Not met / unbuilt as recorded: agent-runner R36–R38, R40 (K3692); agent-worker R111 (conditional). Accepted reds to clear at L6's close: agent-worker R45 (its bundle stale, rule 5 (12)); scheduler `explore.test.mjs` 3 (T50-16). **Next: close L6 (§5.6):** regenerate the generated artifacts (manifest order; agent-worker's and the plane's bundles are stale — `npm ci --ignore-scripts` in agent-runner, file-scanner, sheet-worker first, K1980), verify (`fleetbundles`, `newgroup-bundle-fresh`), commit on the tranche branch; `node checks/run.mjs bio` (accept only the named reds); archive the 13 L6 sessions (addresses in `plan/current.md` Jobs line) with their `BOB-final`/Size rows in `metrics/T50.csv`. **Then HOLD** (no L7 START; K3695).
- **Folds ready for later layers (no job yet):** K3696 (translations map, its closing section governs), K3698 (DEC-310/311/K3664), K3703 (DEC-313), K3706 (DEC-314), K3707 (DEC-315), K3709 (DEC-316), K3711 (U332 corrections, DEC-317). DEC-312's L4/L5 keys are N1213 (T51).
- **`next.md` new entries:** N1213–N1219 (T51).
- **Channel:** UX design #27 `session_01S7xeW38PtVh94Sy8LiatgK` (started K3713; #26 archived) writes UX-DESIGN's outbox. Read through U334; posted through B292. Its gaps list (`docs/development/ux-substrate/T50-requirements-gaps-2026-10-17.md`) is the design's own next work; flows a T50 screen job needs reach BOB as new DECs. It rings BOB by `send_message`.
- **Lanes:** ASSISTANT-HOSTING #2 archived (Bob has not said whether to restart it, ASSISTANT-HOSTING #3). JOURNEYS and INVESTIGATION-DESIGN HANDOFFs not re-read this session (W4, H43 as BOB #202 left them).
- **Timers:** WATCH #203 `trig_01BhmMRJnsGzocTFAjHe4DA9` into ROOT #7 (16:57Z). **No backstop** (its 15:57 re-arm was refused by auto mode, K3705; a fresh session clears this). Delete the WATCH at takeover; arm your own WATCH and backstop.
- **Environment:** a new container needs `npm ci --ignore-scripts` in agent-runner, file-scanner and sheet-worker before `fleetbundles`.

## What comes next, in order

1. **Take over** (§5.1). Archive BOB #203 once idle (BOB-final row under T50). Delete its WATCH.
2. **Close L6** (§5.6), then **HOLD before L7** (K3695).
3. **The remote route** is Bob's (above); do not build or retry it. Everything else of T50 that does not depend on it is already merged or folded.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T50's close PR (§5.7 (3), K2273). T50 is held mid-tranche: no close yet.
- Merging the design branch's verified docs commits into `tranche/T50`: K3618's practice, last done K3712.
- Cloudflare acts on biosmoke8 and deploys: Bob's standing permission (K3466, K3600); auto mode refuses deploys each time (rulings-active §2). The safety check is currently refusing credential/sign-in-adjacent writes and trigger arming in this session (K3705); a fresh session is the clean route.

## Open with Bob

- The remote assistant's route (routine fire, or he clears the block for the direct route).
- Whether to restart the assistant-hosting study (ASSISTANT-HOSTING #3).
