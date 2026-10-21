# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #243 (`session_01LRzJXaPyXDy55wfL6JRmC8`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-21 ~19:20 UTC, at 43 % of its window. **T51 is OPEN** on `tranche/T51`; **every job of fix round 3 is merged** (K4418); the round's after-steps (plan §9) remain. Read `build/rulings-active.md` whole, then **K4401 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-3-T51.md` §9 to §11 whole.

## What happened this session

- Merged: interface-shell (R116; then #15: R117 re-points, R119 the `ready` hook), screens-inquiry, retrieval (R93), screens-intake, entities, op-declarations, jurisdictions (R95, FOIA re-read live), screens-action, control-plane, screens-settings. R118/R119-of-control-plane retired (K4411: no screen gate; `entitycreate` already admits members).
- Stale tests fixed by BOB, test files only (K4414, K4415, K4417): six tests now read the pinned registry fixture; fr4-project's later-module import replaced; testcopy cleared; coverage ids named. `uses` edges: screens-settings and screens-inquiry gain `interface-assets` (K4413, K4414): member-roster's `order.mjs` is stale until regenerated.
- **Bob's nine T52 decisions answered (K4403)**, recorded in his words; folded into N1259/N1260 and rulings-active; T52's plan written and reviewed (`build/plan/draft-T52-plan.md`, K4405: 42 jobs, ~6-7 working days); DEC-411 (U446 @ 0012a09939) redraws registers and explore for K4403, merged into the tranche (design files only) and named by the plan (K4406).
- Channel: UX-DESIGN read through U446; BOB posted B468 NOTICE (K4403), B469 HANDOFF (answered by U446), B470 ACK, **B471 HANDOFF: the round's word batch (plan §11)**, not yet answered.
- Suite at e4a2ae2573 classified (K4414): all reds are accepted by name, stale until regeneration (setup-words rows, the bundles, ocr-worker, agent-worker), or since fixed; doc-clean R4 flakes only under load.

## Running

Nothing. No job session is open. Lanes: PERFORMANCE past P6, AI-DESIGN past A5, JOURNEYS past W4, INVESTIGATION-DESIGN past H43 (nothing new this session).

## Do next, in order

1. **Take over** (§5.1). Archive BOB #243 once idle (row `BOB-final`, T51). Delete its routines: backstop (send_later `trig_01AN6fRjb9VZ9g16bJUJ4T7a`'s successor, ~19:35Z) and WATCH #243 `trig_012Qt3HagLmnxpEDoEnbZMam`; arm your own. Install `node_modules` (K4113). The mail tool's jobbranch command is on civicos-process `prep/jobbranch-K4385` (worktree `/home/user/cp-jb`; recreate if gone).
2. **Plan §9, in order:** regenerate in the manifest's order (member-roster `order.mjs` first: `uses` changed; setup-words `rows.mjs`; `program.mjs`; `court-data.mjs`; wizard-scripts' data; `node bio-plane/scripts/bundles.mjs`; newgroup), verify (`fleetbundles`, `newgroup-bundle-fresh`, `--test-force-exit`), checks (words must read zero after regeneration; op-grades' three `plain` findings were waiting on it, K4384); the scanner image republished (`container-images.yml`, its digest and `source_sha256` into the marker and `wrangler.jsonc`; check §16); redeploy biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296; each deploy act needs Bob's one-line approval in the refused session, rulings-active §2); targeted re-walk (plan §9 (5), with fixtures); the performance lane's re-measure (K4354); one final pass; then T51's close (§5.7): design MERGE first (UX-DESIGN's PR, including DEC-411), `main` merged in, every module's tests, the close PR; the process repository's PR (M-T51-6) carrying `prep/cause-job-K4273`, `prep/words-arms-K4208`, `prep/stale-test-K4349`, `prep/jobbranch-K4385`.
3. **T52** opens the moment T51 closes, from `draft-T52-plan.md` (moved into `next.md`/`current.md`), L11-D on DEC-411 @ 0012a09939.

## Accepted reds, by name, until the act named

Plane R24 and screens-settings R39 (T52); journey-check R17 and its walk-dependent local-arm tests; store-door R17; promotion `row-census`; coverage's six held remote-route ids (agent-harness R17, agent-runner R37 R38, installer-steps R26 R31, journey-check R19; K4417); case-checker R13, R25 and setup-words, bundler `fleetbundles`, ocr-worker R19, agent-worker R45 until the round's regeneration (K4355, K4414); words' op-grades `plain` findings until regeneration (K4384); acquisition `checks.test.mjs` R29 R31 until the design's `refusal.CAPTURE_NOT_KEPT` row lands (K4373); op-declarations `t36:306` (`capturecredentiallist`, completion round, K4381).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design stream's MERGE first (§5.7 (1), K1177); no refusal of either recorded. The process repository's `main` by PR at the close (K4275: its direct push was refused).
- Job branches: only by `mail jobbranch` (K4385); a force-push is never written (refused at K3977, K4384).
- Deploys to biosmoke8: by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296), each approved by Bob in the refused session (K1715 line); none yet this round.

## Open with Bob

Nothing.
