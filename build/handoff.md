# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #192 (`session_01PsqvgyoB1fJsGCazEA2bQZ`, depth 1, parent ROOT #5 `session_0187SrKsqhqzSTqwDk2hzcXy`, primary account), 2026-10-16 ~16:20 UTC. Read `build/rulings-active.md` whole, then K3524–K3539 (BOB #192's).

## RELEASE ONLY (K3425, K3426)

Only release 0.85.0 work, and the lanes' studies and walks, proceed until T50 opens (Bob's K3425: Saturday 2026-10-17).

## Where things stand

- **Fix round 6 is merged** on `tranche/R085` @ be46ca9d2e (R085-26–R085-35: retrieval R79, query-language R32, agent-model R22, agent-harness R14–R15, agent-worker R103–R105 (R106 retired), capture R93, screens-intake R28, wizard-scripts R40, plane R57, agent-runner R33 `standard-1`); every mark struck; `checks/run.mjs` 0 failures; the plane bundle rebuilt (be46ca9d2e); fleetbundles 148 pass, 1 fail ("agent-worker's 28 inputs", N1156's known hand list). Job sessions of round 6 still live: RETRIEVAL #18, QUERY-LANGUAGE #9, AGENT-MODEL #11, AGENT-HARNESS #8, AGENT-WORKER #29, CAPTURE #34, SCREENS-INTAKE #6, WIZARD-SCRIPTS #11, AGENT-RUNNER #10, PLANE #39 (ids in `build/plan/current.md`'s Jobs line on `tranche/R085`); archive each and write its row under R085's metrics (or T49's, as earlier R085 rows) at the close.
- **Round 6's close is not done.** `module-tests.mjs` stalled after 50 modules. Reds seen on the new head: plane `store.test.mjs` "R2, R10", screens-daily "R1–R13", screens-wizards "R1 every refusal…" and "R8 the path Settings › Wizards" (all red on `dist/cut-0.85.0` too); not yet compared with the base: bundler 1, membership 6, ai-accounts 1, promotion 2, row-census (R39/R45/R46 MODULE_ORDER), R83/R140/R145 MODULE_ORDER, R79 listeners order, refusal keys R10/R14/R11/R22/R12. Suspect: BOB #192 rewrote `build/modules.json` with `json.dumps` when adding the edge plane → interface-shell (K3531), reformatting the whole file; check whether a test reads it textually.
- **The setup script** is Bob's guarded block (K3534); new sessions start. Whether Chromium now trusts the egress CA is unknown until a walk tries.
- **Lanes (manifest):** ASSISTANT-HOSTING #1 `session_01YE7nwvJxdhu4Xc9nnb77MX` (the assistant lane, K3538, K3539; its S1, S2 read; S1's two questions put to Bob, open), JOURNEYS #1 `session_01FL4s5VPpJ8jsCWyMjj1Rih` (K3539; writing its walk plan). Both wait for BOB's word that round 6 is deployed. Read both `HANDOFF.md`s at takeover and each backstop check.
- `member-sign-in.txt` sits in BOB #192's container only; Bob has set `JOURNEY_MEMBER_*` (K3526), which new sessions read.
- Channel: read through U308; nothing owed. INVESTIGATION-DESIGN: nothing past H43.

## What comes next, in order

1. **Take over** (§5.1) with `mail bob --tranche R085` (from a checkout of `tranche/R085`). Archive BOB #192 once idle and write its BOB-final row under T49. Delete its routines: backstop `trig_01MZrmWnjgcmWiPitLNToXxR`, WATCH `trig_01MVW4iYXCRcpPNwJvAGMqcn`, and any other into it. Arm your own WATCH into ROOT #5 and a backstop.
2. **Triage the reds** with one worker (sonnet, medium, K3518): run each red test file listed above on `dist/cut-0.85.0` (with `npm ci` where needed) and on `tranche/R085`; any red only on R085 is this round's, fixed by its module's job (restart it, one model up if it blocks) or by BOB if it is `modules.json` formatting (restore the file's original layout with only the one `uses` edge added); then let `module-tests.mjs` finish (run it in the background, never stopped midway, K1994). Record the outcome; accept a base red only by name (§5.5).
3. **Merge `tranche/R085` into `dist/cut-0.85.0` and deploy to biosmoke8** (fleet, plane, installer as the round needs): Bob's standing permission K3466, but auto mode refuses each in session (K3481, K3495, K3504, K3514); ask Bob for his one-line approval in your session, naming the act, then act. Confirm biosmoke8 serves the round (`/favicon.ico` 204; a fresh `op=airunopen` uses `standard-1`).
4. **Tell both lanes it is deployed** (`send_message` to each). JOURNEYS walks; the assistant lane runs its baseline walk. Funnel their findings: each defect an entry (a fix round on the cut when it blocks the release, else `next.md` for T50).
5. Tell Bob, rendered, whether his journey works end to end (K3320's bar), with the lanes' first findings.
6. **T50 opens Saturday** (K3425): the cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273), with the design stream's branch (`e074feaa46` or newer, U305). `next.md` gained N1170 (the release descriptor's instance type, K3535).

## Acts on main or sessions (reviewed acts, §5.8)

- Deploys to biosmoke8 and pushes to `dist/cut-0.85.0`: Bob's standing permission K3466, but auto mode refuses them in session (K3481, K3495, K3504, K3514); each needs his one-line approval in the refusing session (§16).
- A sign-in by a handle other than the environment's was refused even with Bob's approval (K3523): sign in only by the variables.
- Deleting branch `draft/r085-r6` was refused (HTTP 403 at the proxy, K3528): leave it.
- The cut reaches `main` only by its merge into `tranche/T50` at T50's opening (K2273).

## Open with Bob

- The assistant lane's S1: the 14 criteria and four contexts, and the comparison method (A recommended), on https://claude.ai/artifact/APQkn9goZZkxyi9kkt7VK4 ; and whether to ask Anthropic for approval under AT-19 (listed, not recommended).
- His walk page: https://claude.ai/artifact/WuVghhRHhkrcHF1z1QjDL6 (BOB #192's; update or replace).
