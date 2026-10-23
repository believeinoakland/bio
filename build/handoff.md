# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #262 (`session_015g69m7nH71q4qqQYkHacUj`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-23 ~09:05 UTC, at about 40 % of its window (estimated; `get_session` reads 0), at a clean point: every merge pushed and ruled, every job entry answered. **T51 is OPEN** on `tranche/T51`; fix round 6. Read `build/rulings-active.md` whole, then **K4707 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0, 3 and 7 and the entries G54 to G57 (all before `### K4597`).

## Bob's direction today (in force)

- Alpha as quickly and efficiently as possible; token efficiency (K3269, K4614). Bob, 04:22: "Keep going, but be smart."
- K4426 at planning (K4597): `fixplan` 0 before any START; an independent reviewer before a plan entry is used, and a short second review of each rewrite.
- **Nothing is open with Bob.** He asked at ~06:30 whether we are on track to meet all requirements; answered yes, with the open items and risks below.
- To report to Bob when the round ends (protective bounds, K1881): K4683's list, the 100,000-row ingest and 2,000-character reason (K4687), the 2 MiB classification threshold and 1.5 MiB view (K4685), G56's 100 pages / 1.3 MB a PDF piece, G55's `INGEST_INLINE_ROWS` 10,000 and `INGEST_CACHE_MAX` 10,000 and slices of 20,000 rows / 2,000 facts / 3 attempts (K4717), G54's sweep bounds 2 editions / 400 files / 16 MiB a tick (provisional, K4720) and the 4,000-file case-file bound; `limits.cpu_ms` unset.

## State

Merged this session (K4709-K4721): G50 closed (public-read, case-checker, case-import, case-disclosures); G52 closed (screens-action); G53 closed (wizard-scripts, op-declarations, interface-shell); G55 closed in code (money tier 2, calculations, scheduler, notice-producers, op-grades, op-declarations); G54 merged but for plane (publication, publish-schedule, bundler, public-read, ratification, screens-publish, installer-steps, installer). Every merged session archived, its row written.

**Running:** PLANE #52 `session_019MQdmdBDvLzCM4txninn2N` only (CHANGE B62: register `casefile-sweep`, `g54-sweep.test.mjs` green, its Miniflare L; then one COMPLETE for G41, G44, G48, G54, G56 proofs). Its `uses` gained case-grammar, csv-reader, reading-pipeline (K4714). When it merges, write its R85 (G44, its J40) and its G54 line from its record, and archive it.

## Do next, in order

1. **Take over** (§5.1): archive BOB #262 once idle (row `BOB-final`, T51); delete its backstop (newest "BOB #262 backstop") and WATCH #262 `trig_019fk8BFvPRSFKpy5VBhfd8W`; arm yours; `node_modules` (K4113); `cp-close` worktree of civicos-process `prep/T51-close-v2` for `mail`; merge in `/home/user/mwt` on `merge-T51`, push `merge-T51:tranche/T51` only once verified. **Read each check's failure count before every push** (K4668; K4719 is the miss this session made).
2. **G57** (K4720; plan entry added): plan it with K4426's four fields (a planning worker, sonnet medium; then an independent review and a short second review), `fixplan` 0, then STARTs for record-core (provider: the ratified image of a finding at its pin) and ratification (the sweep re-copies a missing finding's bytes). Merge order record-core first.
3. Merge PLANE #52 when COMPLETE (its impact set; the accepted reds below).
4. **The round end** (plan §7): regenerate in the manifest's order (member-roster, setup-words rows, case-checker `program.mjs`, court-data, wizard-scripts' data, bundles, newgroup last), verify (`fleetbundles`, `newgroup-bundle-fresh` with `--test-force-exit`); the whole suite (`module-tests.mjs`), re-checking interface-shell `frame.test.mjs:195` R26 and screens-intake `t51-fix5.test.mjs:189` R31 (load-dependent in K4718's run, passed alone twice; never accepted); fold `build/plan/k4426-rows-G41-G56-draft.md` (a reading worker's draft rows, checked at K4710: G43 and G44 not yet READY, see its verdicts) into `k4426-check-T51-F6.md` with G54-G57 rows; `fixplan` 0; update `diagnosis-R6-g55-measure.md` from calculations' check L (K4717); **one redeploy** (K4296 route, carrying G54's logging); the targeted re-walk (plan §7.3, plus 4783 and 6227 built by the sweep, the 18,098-row ingest timed, the 23.2 MB PDF's first tick); the final pass.
5. **One HANDOFF to UX-DESIGN at the round end**, owed: the stand-ins of K4685, K4687, K4697; K4702's 13 case-file sentences (now in `public-read/casefile-words.mjs`); installer-steps' refusal row `installer-steps.plane.observability` and the note `installer.fleet.logsunconfirmed` (K4710 (5); it clears `missingkey 5`); case-checker's five new `/4` specification strings in `spec.mjs` for the unkeyed list with `:11` (it clears `inline 6`); screens-action's five keys (K4716); calculations' six `calculations.ingest.*` and notice-producers' two `notice-producers.ingest.*` stand-ins (K4717); money's `money.ingest.partial`; C-136.9 (B491).
6. **T51's close** (§5.7): the design MERGEs U458, U459, U460 first (K4663, K4675, K4685); then words clears. Expect wizard-scripts' commit-equality test (R50) to go red if the design's merge moves `registry.json`: re-take the registry then (a wizard-scripts job), never accept it.

## Accepted reds (by name)

case-checker `program.test.mjs` R13, R25 (until the round-end regeneration); plane `release` R24 and `l77-size` R77 L; screens-publish `common.test` R24 and `g54-page` "thirteen keys are words" (until `rows.mjs` is regenerated); newgroup R8, R11, R20, R33 (six), R44, R55, R61, R71, `wizard.test.mjs` (inherited), R36, R40 and the G54 note test (until the row `installer.fleet.logsunconfirmed` exists); agent-worker `requirements`; journey-check `group`, `journey`, `live`, `account-installer`, `plane-cron` (environment, identical on the base); words `inline 6` and `missingkey 5` (K4710 (5)).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by `mail jobbranch` or by merging the tranche into them; never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause, G41-G57 included, passes K4426's check and `fixplan` reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

Lanes: AI-DESIGN A41, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15 (unchanged). UX-DESIGN through U460 read.
