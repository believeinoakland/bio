# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #253 (`session_01UWQTVt51zWXJ27dRpghMUf`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~17:00 UTC, at about 53 % of its window (Bob asked "Is it time to refresh?"), at a clean point: every merge pushed, every job entry read and answered. **T51 is OPEN** on `tranche/T51`; fix round 6 runs (first wave nearly merged, wave 2 nearly merged). Read `build/rulings-active.md` whole, then **K4577 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` (its section "G14-G25" is new) whole. `audit-silent-partial-reads-K4571.md` is the evidence behind G14-G25: read a row only when a job cites it.

## Bob's direction today (in force)

- Alpha release deployed as efficiently as possible (K4459, K4460). Weekly meter 53 % (K4516).
- K4565/K4566: the scheduler heals itself unseen; the Worker's cron is a watchdog.
- K4571: never a silent partial read; the audit's 14 rows are G14-G25 of this round (K4578).
- **K4581 (Bob, this session):** AI-DESIGN's A41 "is not for the alpha release. It's beta." Not read into T51; taken up at beta planning.

## State of fix round 6 (merges K4580-K4589; STARTs `starts-T51-F6/`, wave 2 `starts-T51-F6b/`)

**Merged (26):** installer-steps, bundler, strength, case-carriage, review, store-door, acquisition, csv-reader, journey-check, case-authoring, calculations, odf-reader, doctypes, observation-log, office-readers, following, capture, interface-shell, notice-producers, corpus-export, machinery-producers, screens-investigate, plane, screens-intake, reading-pipeline. All archived, rows written.

**Running (6), with what each waits on:**
- **EXTRACTION #34** (G4, G6, G8, G13, G14 owner): CHANGE B27 at 16:58: reading-pipeline merged; conform to its real names, run `round6-pieces` and the G14 seams, workerd L numbers, then COMPLETE. Its merge clears `r80.test.mjs:60`, plane `fix4-seam` R75 R4 and plane `round6-extraction` R87/R89/R90 (accepted red by name until then).
- **CONTROL-PLANE #48** (G2, G5, G7, G14, G18 seam owner): B43-B45 done (J28-J30; `r117-held` root-caused and fixed on its branch: a wall-clock test). Its G2 seam needed plane's `fetch` kind: **plane is now merged**, so CHANGE it to merge the tranche and re-run the G2 seam (and G13 after extraction), then COMPLETE.
- **SCREENS-INQUIRY #21** (COMPLETE J27, not merged): `fr6-seam` G12a (capture merged: should be green) and G13 (waits on extraction). CHANGE B41 sent; merge after extraction. Its module is 6,599 lines: measure its reading set at its next START (K4586).
- **SCREENS-PUBLISH #18** (COMPLETE J28, not merged): waits on control-plane's merge for its door seam (`drafts`); CHANGE it then.
- **SCREENS-DAILY #19** (REPORT J22): waits on control-plane's merge (`projects` forwarding) for `casedrafts-seam`; CHANGE it then.
- **SCREENS-ACTION #15** and **SCREENS-SETTINGS #17** (wave 2, G20 pickers): started 16:17 and 16:40.

**Merge order left:** extraction, control-plane, then screens-inquiry, screens-publish, screens-daily, screens-action, screens-settings (seams green first).

## Do next, in order

1. **Take over** (§5.1): archive BOB #253 once idle (row `BOB-final`, T51); delete its backstop `trig_01WsgKtdo8LsZ79s8ai6dR8P` and WATCH #253 `trig_01C3CcFCpYDHN8rJ6kBdE9NR`; arm yours; `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (`git worktree add --detach`; its `tools/mail.mjs` has `jobbranch`).
2. **Check plane's own suite on the merged tranche** (`node --test --test-force-exit bio-plane/test/m/plane/ bio-plane/test/system/migrate-released.test.mjs`): BOB #253's run was cut by the handoff. Expected: R24 (accepted) and the three `round6-extraction` seams red by name; anything else is plane's or the merge's.
3. **CHANGE CONTROL-PLANE** (plane merged); then merge in the order above as each completes.
4. **Requirement lines owed** (one worker, sonnet medium, as K4580's): reading-pipeline R39-R41, R32; plane R78-R83; corpus-export R14, R15, R10; machinery-producers R2; screens-investigate R58, R52; notice-producers R27; screens-intake (record); capture R73, R77, R104, R105; interface-shell R122-R125, R86, R123, R7, R24; observation-log R7; office-readers R11; following R2, R12, R14; then each remaining job's at its merge. A new id named by another module's test passes coverage wrongly (K874): check each new id is named by its own test (calculations R43 was, by BOB's rename).
5. **The round end** (plan §7): DEC-419 (U455 @ c7f61f61cb) and DEC-418 (U452 @ aed4de301f) are design files whose rows the jobs' stand-ins need: merge the design commit into the tranche (design files only) before regenerating; regenerate in the manifest's order (member-roster, setup-words, `program.mjs`, court-data, wizard-scripts, bundles, newgroup) so the built-in release carries control-plane's `bio-plane-crons/1` literal; then the whole suite. **Accepted reds by name:** promotion `row-census`; file-safety R24, plane R24 (U448 at the close); journey-check R17 (T52); installer `newgroup/test` 14 (R8, R11, R20, R44, R55, R61, R71, `wizard.test.mjs`, `realsize` R33 x6) and journey-check's watchdog seams until the regenerated release; agent-worker R45 (stale bundle); load-only: acquisition `stage-times` R95, screens-intake `t51-fix5` R31, screens-investigate `fix4-seam` C8. Then K4426's check per cause (G1-G25), **one redeploy**, the targeted re-walk (plan §7 (3)), the final pass.
6. After the re-walk's measurements: bring Bob the two speed questions with options (a combined read; where the objects live), plan §2 G12 end. Not before.
7. **T51's close** (§5.7): U448-U455 design commits merged into `main` first (K1177), `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`.

## Lesson (this session)

`mail post`, `mail done` and `mail addjob` commit and push the tranche branch: a merge not yet tested is pushed with them. Merge, test, push, then mail. A local `git reset --hard` is refused by auto mode as irreversible: do not merge before the test can run.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296; not refused at K4423, K4520, K4556); none until round 6's K4426 points are checked.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive. UX design #38 `session_01DvXHQqV1arHFoxUeFp1nmG` (started by BOB #253, K4577) archives #37.

## Open with Bob

- None.

Lanes: AI-DESIGN A41 (beta, K4581), JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P14. UX-DESIGN through U455, read; B485-B487 ours.
