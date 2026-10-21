# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #237 (`session_01XWYkfQwcGngVDWPFWmqomf`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, **secondary** account), 2026-10-21 ~03:00 UTC, at 40 % of its window. **T51 is OPEN** on `tranche/T51`; **the fix round's planned jobs are all merged and no job runs.** Read `build/rulings-active.md` whole (its §1 lines for K4269/K4270 and its §4 lines for K4268, K4272 are new), then **K4268 to the last line** of `build/rulings.md` whole, then `build/plan/redeploy-walk-T51.md` whole: it is the checklist for everything that follows.

## What changed this session (Bob's, and BOB's after his questions)

- **Bob's bar for T51 (K4269, K4270):** a design change enters T51 only for an operation that does not work or a required screen nothing reaches; misused words and improper renderings are recorded in `build/plan/later-ux.md` for T52 and never hold the deployment or the release debugging (unless one stops a member completing an operation). "Group" for "team" and the words check's arms are T52. The design lane is told (B438, B439).
- **Job results are read by a haiku worker** (K4269): BOB hears success or not and why, the requirement lines owed, reports about other modules.
- **The redeploy is a milestone** (K4269): after it, the thorough walk of rendering, every journey and the whole flow (finding documents, capture, evidence, connections, conclusions, action). The checklist's §4 maps it.
- **Cause jobs (K4271, K4273, K4275; P8, mechanics §6a):** one job may hold every module one cause touches. Certified by D16. On the process repository's branch `prep/cause-job-K4273` only (its push to `main` was refused by auto mode, K4275): a cause job's START tells it to read §6a there, and BOB runs `ownership.mjs <product> <m1>,<m2> …` from a checkout of that branch (`git -C /home/user/civicos-process checkout prep/cause-job-K4273`). It reaches `main` by pull request at T51's close. Two ran: CAUSE-TESTS-T51 (four modules, K4280) and CAUSE-TOTALITY-T51 (two, K4282).
- **Tests by impact, two tiers (K4272):** `node build/plan/impact.mjs <base> <head>` lists the suites a change reaches; run only those at a merge; the exhaustive and wording sweeps once per batch and before the redeploy; **at most two suites at once** on the 4-core container (six at once made load flakes, K4276). A changed shared table (word rows, `DECLARED_OPS`) reaches its readers: run them (BOB #237 skipped this for DEC-393's rows and it cost a round, K4282).

## Open now (do first)

1. **New reds since 639fa02cf3 (K4282, K4283).** affordances 7 (N345's, T23's, case-inputs', case-import's, actionhold's, wizard-scripts' ops; publishat R36) and op-grades words R44 (37 !== 11) were green at 639fa02cf3 and red at the tip. The whole-suite run (container-local, partial to ~152 of 175 modules) also shows single reds in **bundler R25** (fleet members' Durable Objects), **ai-accounts R7** (`accountFor`), **capture-sources R55** (refusals carry check and translation), **following R1** (C-137 family rows); they may share the cause. **The bisect answered: K4284** (affordances' 7 are CAUSE-TOTALITY-T51's own unmigrated sibling tests; op-grades R44 a stale count after DEC-393's reads). Place one cause job (haiku) holding affordances and op-grades, tests only, as K4284 says; confirm the four single reds' cause (DEC-393's rows first) and place them by cause.
2. Then follow `build/plan/redeploy-walk-T51.md` from §1: regenerate (rehearsed clean, K4277), the whole suite (`node .github/scripts/module-tests.mjs` in a separate worktree with artifacts regenerated first; serial by module), the redeploy by `deploy-test.yml` (dry run first; a refused dispatch is recorded and approved by Bob in that session, never rerouted), smoke, the live re-reads, then the walk.

## Accepted reds, by name, until the act named

plane R24 (four `screen.<id>.purpose` rows) and screens-settings R39 (`screen.bias.adoptfor.label`): T52, `later-ux.md` (K4276, K4278). Coverage's held ids (K4236): agent-harness R17, agent-runner R37 R38 R40, installer-steps R26 R31, journey-check R19. promotion `row-census` until its stamp (K4205). doc-clean R4 only if it fails alone (K4149). ocr-worker's suite and every stale generated artifact until the regeneration (handoff of BOB #236). The new reds of item 1 until their fix merges.

## Running

Nothing of the round. The design lane (UX design #36, `session_01N188yDWfxJHtvptW5hirUW`, this account) has nothing open; last merged DEC-393 (U428, ACK B440). Lanes' HANDOFFs unchanged (H43, A5, W4).

## Open with Bob

- None.

## Open for BOB (not Bob's)

- wizard-scripts' `wizards` declares `state` though its arm reads it from the query (K4230).
- HANDOFF to the design: where on `explore` a member takes back an attached source (`stepsourcewithdraw`, K4267), only if the walk shows a member cannot complete it (K4269).
- Registry account labels to secondary at T51's close (K4251); `prep/cause-job-K4273` and `prep/words-arms-K4208` to the process repository's `main` by PR at the close (K4275).
