# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #241 (`session_01CDH1U1Jns5QQnWX7WDQ8yE`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-21 ~14:40 UTC, at 39 % of its window. **T51 is OPEN** on `tranche/T51`, in **fix round 3, wave 1**. Read `build/rulings-active.md` whole (§1 "How debugging runs" K4297 and "Speed" K4354 govern), then **K4347 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-3-T51.md` whole (the round's plan, in force, K4356; additions at K4358, K4363).

## What happened this session

- Took over (K4347); smoke of fix round 2's redeploy green (both roles, both widths).
- Targeted re-walk of round 2 (`walk-T51-rewalk/A.md`, `B.md`): every BLOCKER fixed; ~60 STILL, 9 NEW (K4352, K4355). Suite at the deployed commit: only accepted reds, plus case-checker R13/R25 (manifest regeneration order fixed: `rows.mjs` before `program.mjs`, K4355; clears at the round's regeneration) and a load-dependent doc-clean R4.
- Bob: approved the stale-test text (applied on civicos-process `prep/stale-test-K4349`, K4349); weekly meter 29 % then 30 % (K4349, K4361); opened the **PERFORMANCE** lane (#1 `session_015HB1ABUMedpZ4X94giQAiz`, K4351; its P1–P6 in fix round 3, K4353); speed bar **A** (screen and act ≤ 2 s, web capture ≤ 15 s, K4354).
- Design stream: DEC-401/402 (federal offices A now; B is N1256), DEC-403 (stored logins; testify and contradiction folds), DEC-404 (places in layers after the alpha, N1257) merged into the tranche, design files only, each ACKed; **UX design #37** started (`session_013KihJX63gbyQmh21swQqQs`, K4359). Note: `git pull` is now configured `pull.rebase false` in this checkout; a rebase once flattened a design merge (ancestry restored by an empty merge, K4359): always merge, never rebase, when the tranche holds design merges.
- Fix round 3 planned whole (K4356), requirements written (K4359, K4360, K4363, K4364), STARTs reviewed and fixed (K4360), **wave 1 started** (K4361): 20 jobs + RECORD-CORE #26 in a freed slot (K4365).
- Merged so far (K4365): CAPTURE-SOURCES #15, EXTRACTION #29, CASE-DISCLOSURES #15 (archived, rows written).

## Running jobs (wave 1; addresses in `current.md`'s Jobs line)

FILE-SCANNER #10, CREDENTIALS #25 (COMPLETE J12, crossed by ANSWER B10: merge once it reads B10), PROJECT-ROSTER #14, HOST-GOVERNOR #11, ACQUISITION #22, CAPTURE #43, DOORBELL #6, FILE-SAFETY #14, CAUSE-READING-3 #1, ENTITIES #18, MONEY #6, WIZARD-SCRIPTS #23 (haiku), QUEUE-PRODUCERS #22, PUBLIC-READ #27, CASE-AUTHORING #35 (CHANGE B17: C40's `not_co_attested` facts), REVIEW #21, CAUSE-SHELL-3 #1, RECORD-CORE #26. Answers already given: K4363, K4364.

## Do next, in order

1. **Take over** (§5.1). Archive BOB #241 once idle (row `BOB-final`, T51). Delete its routines: backstop `trig_01VXvVYBoNG5L7s4ByjsmFkq` (14:45Z) and WATCH #241 `trig_013MLvRiFNNWjPETjzMEyxVu`; arm your own backstop (a layer runs) and WATCH. Channel: UX-DESIGN #37, cursor at U439, nothing owed either way. Lanes: PERFORMANCE (its HANDOFF past P6), AI-DESIGN past A5, JOURNEYS past W4, INVESTIGATION-DESIGN past H43.
2. **Watch wave 1** (§5.4): read each job's entries, answer, merge each complete job at once (`checks/ownership.mjs . <module> tranche/T51 origin/job/T51/<module>`; cause jobs list their modules comma-separated), strike its met marks, archive its session and write its row. Merge order where it matters: plan §3 (providers before users). After CAUSE-SHELL-3 merges, control-plane's page tests that expect a nonce are red until CONTROL-PLANE merges in wave 2 (accepted by name, K4360 (5)); journey-check's `pseudo` test is BOB's to make current then (K4297 (2), K4364).
3. **Wave 2** once wave 1 is merged (plan §3): SCREENS-SETTINGS #15, SCREENS-INTAKE #14, SCREENS-DAILY #17, SCREENS-INQUIRY #19, SCREENS-INVESTIGATE #13, SCREENS-PUBLISH #15, SCREENS-ACTION #12, CONTROL-PLANE #44; STARTs ready in `build/plan/starts-T51-F3/` (amended at K4364, K4365: re-read each before posting). No membership job (K4358).
4. **After the round** (plan §9): regenerate in the manifest's order, checks, the scanner image republished (`container-images.yml`, digest by `bundles.mjs --record-image`), redeploy biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}`, targeted re-walk of what changed, the performance lane's re-measure against K4354's bar, the final pass, then T51's close (§5.7): design MERGE first, `main` merged in, every module's tests, the close PR; the process repository's PR carrying `prep/cause-job-K4273`, `prep/words-arms-K4208`, `prep/stale-test-K4349` (M-T51-6).
5. Words: when the jobs name their stand-in keys, send one batch to UX-DESIGN (B458 (3)).

## Accepted reds, by name, until the act named

Plane R24 and screens-settings R39 (T52); journey-check R17 and its walk-dependent local-arm tests; store-door R17; promotion `row-census`; coverage's held ids (K4236); case-checker R13, R25 until the round's regeneration (K4355); control-plane's nonce page tests between CAUSE-SHELL-3's and CONTROL-PLANE's merges (K4360).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design stream's MERGE first (§5.7 (1), K1177); no refusal of either recorded. The process repository's `main` by PR at the close (K4275: its direct push was refused).
- Deploys to biosmoke8: by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); BOB #240's were not refused. If one is, §16: Bob's one-line approval in the refused session.

## Open with Bob

Nothing.
