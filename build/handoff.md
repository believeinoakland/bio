# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #263 (`session_01ShbQJxwUwpBJkphgZg3w99`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-23 ~11:05 UTC, at about 37 % of its window (`get_session`), at a clean point: every job merged and archived, the round's one redeploy done (K4730, green, `/` 200). **T51 is OPEN** on `tranche/T51`; fix round 6, at its targeted re-walk. Read `build/rulings-active.md` whole, then **K4723 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0 and 7 and the G54-G57 entries (before `### K4597`), and `build/plan/k4426-check-T51-F6.md` whole (its live checks are the re-walk's list).

## Bob's direction today (in force)

- Alpha as quickly and efficiently as possible; token efficiency (K3269, K4614). Bob, 04:22: "Keep going, but be smart."
- K4426 at planning (K4597): `fixplan` 0 before any START; an independent reviewer before a plan entry is used, and a short second review of each rewrite.
- **Nothing is open with Bob.**
- To report to Bob when the round ends (protective bounds, K1881): K4683's list, the 100,000-row ingest and 2,000-character reason (K4687), the 2 MiB classification threshold and 1.5 MiB view (K4685), G56's 100 pages / 1.3 MB a PDF piece, G55's `INGEST_INLINE_ROWS` 10,000 and `INGEST_CACHE_MAX` 10,000 and slices of 20,000 rows / 2,000 facts / 3 attempts (K4717), G54's sweep bounds 2 editions / 400 files / 16 MiB a tick (K4720; G57's heal counts against them, K4727) and the 4,000-file case-file bound; `limits.cpu_ms` unset.

## State

Every cause of round 6 (G1-G57) is merged (G57: K4724, K4727, K4729). K4426's check table reads READY 16, READY-P 55, NOT READY 0. Generated artifacts regenerated and verified (K4728); HANDOFF B495 to UX-DESIGN posted (the round's owed rows; it clears words `inline 6` and `missingkey 5` once that branch lands at the close). **No job session is running.** The redeploy: `6351c8fb14`, dry run 39942301128 and deploy 39942472116 both green, `/` 200 (K4730). The whole suite was still running at the handoff in BOB #263's container; re-run it (step 2).

## Do next, in order

1. **Take over** (§5.1): archive BOB #263 once idle (row `BOB-final`, T51); delete its backstop and WATCH #263 `trig_01CdAWF9GqsLHLdY21x8JMtH` (no other routine into it); arm yours (the backstop only while a job runs); `node_modules` (K4113); `cp-close` worktree of civicos-process `prep/T51-close-v2` for `mail`; merges in `/home/user/mwt` on `merge-T51`. **Read each check's failure count before every push** (K4668).
2. **The whole suite** (`module-tests.mjs`) ran beside the deploy (K4297 (1), never a gate): BOB #263's run was in its own container; re-run it in yours from the tip (a tracked background task), then re-check every red: interface-shell `frame.test.mjs:195` R26 and screens-intake `t51-fix5.test.mjs:189` R31 (load-dependent before, never accepted), plane `g41-shape` R84 (heavy: passes alone), workerd files (`g54-l`, `g57-l`, `g55-alarm-l`, `g57-heal`) one at a time alone; and the memory and timing reds BOB #263's loaded run showed: docprofile R38 (13.6 M character `readText` under 16 MB), reading-pipeline R40 R36 (G26, BUDGET-2024-APP pieces), five runs each alone (plan §4, §7.1). Promotion row-census and file-safety R24 are accepted. A red not in the accepted list below that shows a member's operation failing is a cause for round 7.
3. **The targeted re-walk** (plan §7.3, the live checks of `k4426-check-T51-F6.md` and every row's **P**): write `build/plan/walk-T51-rewalk6/BRIEF.md` from `walk-T51-rewalk5/BRIEF.md`'s shape; walkers A and B (sonnet, medium) on biosmoke8; the ledger read first and last; plus 4783 and 6227 built by the sweep, every complete edition's member findings 200 by `publishedbytes` (G57), the 18,098-row ingest timed, the 23.2 MB PDF's first tick, the biosmoke8 settings show `observability.enabled: true` and the `casefile_attempt` lines appear in the telemetry. PERFORMANCE re-times on a quiet copy after the walkers.
4. **The final pass** (K4297 (3)); then T51's close (§5.7): the design MERGEs U458, U459, U460 and B494/B495's answers first (K4663, K4675, K4685); words must read 0; expect wizard-scripts' commit-equality test (R50) to go red if the design's merge moves `registry.json`: re-take the registry then (a wizard-scripts job), never accept it. Report to Bob (§5.7 (5)) with the bounds above.

## Accepted reds (by name)

plane `release` R24 and `l77-size` R77 L (two); newgroup R8, R11, R20, R33 (six), R44, R55, R61, R71, `wizard.test.mjs` (inherited), R36, R40 and the G54 note test (until the row `installer.fleet.logsunconfirmed` exists); agent-worker `requirements`; journey-check `group`, `journey`, `live`, `account-installer`, `plane-cron`, `pseudo` (environment, identical on the base); words `inline 6` and `missingkey 5` (K4710 (5), B495). case-checker R13, R25 and screens-publish's `rows.mjs` reds are cleared by K4728's regeneration (re-check in step 2).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by `mail jobbranch` or by merging the tranche into them; never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296: Bob's approval covers the T51 build to biosmoke8; standing list: not added); none refused through K4730. The next is only after round 7's causes, if any, pass K4426's check and `fixplan` reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

Lanes: AI-DESIGN A41, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15 (unchanged). UX-DESIGN through U460 read; B495 unread by them.
