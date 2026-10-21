# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #240 (`session_01CSYE5AY6ezQWUcLQeekq3D`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-21 ~11:50 UTC, at 52 % of its window. **T51 is OPEN** on `tranche/T51`. **Fix round 2 is finished:** every job merged (K4323–K4342), artifacts regenerated (K4343), checks clean (K4344), **the redeploy is running** (K4345). Read `build/rulings-active.md` whole (§1 "How debugging runs", K4297, governs order), then **K4323 to the last line** of `build/rulings.md` whole.

## What happened this session

- Took over (K4323). Merged every remaining fix-round-2 job and the ones placed during it (46 job sessions in the round in all; this session: CAUSE-CAPTURE, EXTRACTION, SCREENS-ACTION, CONTRADICTION, WIZARD-SCRIPTS ×2, READING-PIPELINE, SCREENS-DAILY, PROVENANCE, CONTROL-PLANE, OP-GRADES, SCREENS-PUBLISH, CAPTURE ×2, SCREENS-INTAKE (four merges), SCREENS-INVESTIGATE, DOORBELL, SCREENS-SETTINGS ×2, SCREENS-INQUIRY, INTERFACE-SHELL, ENTITIES). All archived with rows; no job session runs.
- Design stream: DEC-395 to DEC-400 (U430–U435) merged into the tranche, design files only, each ACKed; the word rows they mint for already-merged modules are in `build/plan/later-ux.md` for T52 (K4270).
- Stale tests fixed by BOB, test files only (K4297): affordances `register-owners.mjs` and `plane.test.mjs` R19 (K4326, K4329), control-plane `t51-acquire-timings` (K4334), screens-publish drafts tests name R73 (K4344).
- Container images published from the tranche (`container-images.yml`, run 39591403237, not refused); digests written by `bundles.mjs --record-image` (scanner `33dae268…`, the C84 fix) (K4341, K4343).
- Regeneration in the manifest's order; `fleetbundles` and `newgroup-bundle-fresh` green, no skip; plane bundle 30.42 MiB (K4343). `checks/run.mjs`: format, architecture, channels, words 0; coverage only the held ids (K4344).
- Redeploy: tip `e1367d2a2c` pushed to `deploy-test/biosmoke8/dry-run` (run 39594324262, green) and `deploy-test/biosmoke8/deploy` (run **39594486416**, green in 6m16s, 11:54Z). Neither push was refused.

## Do next, in order

1. **Take over** (§5.1). Archive BOB #240 once idle (row `BOB-final`, T51). Delete its routines: WATCH #240 `trig_01KPrp9YcR4vtoR5Pj2q6Tj1` (12:45Z); no backstop is armed (no job runs). Arm your WATCH. Channel: UX-DESIGN #36 (`session_01N188yDWfxJHtvptW5hirUW`), cursor at U435, nothing owed either way.
2. **The deploy run 39594486416 is green** (every member and the plane deployed, 6m16s); go straight to the smoke.
3. **Smoke** biosmoke8 (`build/plan/walk-T51-build/smoke.mjs`, `SMOKE.md`; rulings-active §4 for reaching the copy, `JOURNEY_ADMIN_*`/`JOURNEY_MEMBER_*`): `/`, sign in as administrator and as member, each screen loads.
4. **Targeted re-walk** (rulings-active §1 (3), K4162): every cause's findings (the Findings lines of `walk-T51-build/CAUSES.md`; `BRIEF.md` is the walkers' brief; sonnet medium walkers, at most two suites at once), plus: INFO-2026-0042 re-captured (parts-only copies are not repaired, CAUSE-CAPTURE), a live `op=capture` of a 21 MB PDF (C5: the whole object kept, read by reading-pipeline R2), CA24 (the founder's reply, C52), notice-producers' duplicate notices (C69, K4308), the scanner signing state (C83/C84: `POST /mirror` once, `/version` `signatures.last_error`, waiting files scan on the next tick), C13 and C18's live measures. Each defect found is grouped by cause and fixed in one round (K4297 (3)); wording-only goes to `later-ux.md` (K4269, K4270).
5. **The whole suite beside the walk** (K4297 (1), never a gate): `.github/scripts/module-tests.mjs` from a worktree at the deployed commit, `node_modules` linked or installed (K4113). BOB #240's run was on a pre-merge snapshot and is lost with its container; its partial result: every module green but generator reds (setup-words, fleetbundles: cleared by K4343) and control-plane's two timeout tests (fixed by K4334).
6. **Then the final pass**, and T51's close (§5.7): design MERGE first (§5.7 (1), K1177), `main` merged in, every module's tests (K2704), the close PR.

## Accepted reds, by name, until the act named

Plane R24 and screens-settings R39 (T52); journey-check R17 and its walk-dependent tests (local-arm walks time out on the installer's Cloudflare step in a container); store-door R17 (`groupdescriptiondraft` hand row); promotion `row-census`; coverage's held ids (K4236: agent-harness R17, agent-runner R37, R38, R40, installer-steps R26, R31, journey-check R19); `plane/r42-entry.mjs` listed as a test by `impact.mjs` (a helper, not a test).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), with the design stream's MERGE first (§5.7 (1), K1177); no refusal of either recorded.
- Deploys to biosmoke8: by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); this session's were not refused. If one is refused, it is §16: Bob's one-line approval in the refused session (rulings-active §2, K1715).

## Open with Bob

- The exact P7 / mechanics §6b / §11 text for K4297 (stale tests fixed by BOB; red tests never gate a test-copy deploy), rendered: https://claude.ai/artifact/VTF21FrrPStmqXr4CSEoT8 (file `build/plan/proposed-stale-test-rule.html`); on his "I approve the stale-test text", apply it on civicos-process (a branch and PR at T51's close, as K4275) and record a K.
- Federal offices (C64): the design lane put it to Bob directly; its ANSWER follows his reply.
- The account showed a seven-day usage warning this session; Bob's 80 % rule (rulings-active §1, K2341) applies when he reports it.

## Open for BOB (not Bob's), for the close

- The inbox list hand-declared `inbox` but routed `inboxlist` (plane R71 refused doorbell's declaration): alias it (K4332).
- wizard-scripts' `wizards` declares `state` though its arm reads it from the query (K4230). case-authoring R77's not-reached minutes shape; `impact.mjs` lists `plane/r42-entry.mjs` as a test (K4320).
- Registry account labels to secondary at T51's close (K4251); `prep/cause-job-K4273` and `prep/words-arms-K4208` to the process repository's `main` by PR at the close (K4275). The cause-form ownership check lives on `prep/cause-job-K4273` (a worktree: `git -C /home/user/civicos-process worktree add /home/user/cp-prep origin/prep/cause-job-K4273` after fetching that ref).
- A safe view of an inbox knock before the pull needs a drawing first (`later-ux.md`, K4332).
