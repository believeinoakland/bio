# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #246 (`session_01PX2Wb5KabWVruAwzKTDm3i`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~01:40 UTC, at 46 % of its window. **T51 is OPEN** on `tranche/T51`; **fix round 4 is nearly done**: 2 jobs run. Read `build/rulings-active.md` whole, then **K4464 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-4-T51.md` whole (section 3's table: every job, the rows added this session at its end).

## Bob's direction today (in force)

- "the focus is on getting an alpha-level release deployed as efficiently as possible" (Bob, 2026-10-21). Applied (K4459, K4460): before starting or keeping a job, ask whether a member's operation fails without it; a red test alone is not that; wording waits for T52 (K4269; rows owed go to `build/plan/later-ux.md`).

## What happened this session (K4464-K4481)

- Merged and archived: OP-GRADES (the plane starts again), AFFORDANCES, SCREENS-SETTINGS, CASE-AUTHORING, REVIEW (C48's `editions.case`), DOCPROFILE, CAUSE-SHELL-4, SCREENS-INTAKE, SCREENS-ACTION, SCREENS-DAILY, INSTANCE-SETUP (`profiles().view` carries `records_laws`), SCREENS-INQUIRY, DOCTYPES #8 and #9, SCREENS-PUBLISH, SCREENS-INVESTIGATE, JURISDICTIONS #17 (Oakland's `fiscal_year`), CAUSE-READING-3 (the large-PDF reading's memory: work under 64 MB above its bytes, under 96 MB with them, K4478, K4479). Every screens job and every cause job of the round is merged.
- Green on the tranche now: extraction `c5b-memory`, control-plane `t51-bootstrap` (R122), screens-action's instance-setup seam.
- `uses` edges added for seam tests (K4464-K4473); test titles naming new ids and one stale settings test fixed by BOB (test files only, K4297 (2)).

## Running (2)

- **EXTRACTION #31** (`session_013CUWFqoDsBdasaVpjLFLWT`, sonnet; START `starts-T51-F4/extraction-2.txt`): the round's last blocker. control-plane `t51-large-pdfs` (R120, R121) fails because `readHeld` answers `NO_HOME` for a multipart capture (registered only by its parts): R81 (K4481). It runs `t51-large-pdfs` whole before COMPLETE. At its merge: re-run `t51-large-pdfs` yourself; strike extraction R81 and control-plane R120, R121 if green.
- **JOURNEY-CHECK #11** (`session_013CXae57CSmbZXAkv1DtdMS`): local-arm runs; answered J8 (K4473). Merge when COMPLETE.
- Backstop `trig_01WQab7S21Yx1DtK4Bke9ynX` (01:55Z); WATCH #246 `trig_0176kFDup7Whvet9TqGhtT8e` (02:40Z). Lanes: PERFORMANCE P10, JOURNEYS W4, INVESTIGATION-DESIGN H43, AI-DESIGN A40 (A38-A40 recorded in K4464; the lane's hand-over waits for Bob's word). Channel: UX-DESIGN read through U447; it has not yet read B473.

## Do next, in order

1. **Take over** (§5.1): archive BOB #246 once idle (row `BOB-final`, T51); delete its backstop and WATCH; arm yours; `node_modules` (K4113); the process worktree `/home/user/cp-close` at `prep/T51-close-v2` (K4385: job branches only by `mail jobbranch`).
2. **Merge EXTRACTION #31 and JOURNEY-CHECK #11** as they complete (§5.5), each ruling ending with its **Open** list (K4427 (3)).
3. **Word batch:** none needed for T51 (every stand-in is a held row or readable; the owed rows are in `later-ux.md` for T52).
4. **After the last merge:** regenerate in the manifest's order (every bundle is stale: plane, pdf-worker, agent-worker, review, entities, file-scanner, case-checker `program.mjs`, `rows.mjs`), verify; `checks/run.mjs` (words must read 0; coverage's remaining failures are agent-harness R17, agent-runner R37 R38, installer-steps R26 R31, journey-check R19: see whether each is real or a missing test name); the whole suite (`module-tests.mjs`; docprofile's R38 memory test reads red beside other suites and green alone: run it alone); then K4426's check of every cause by BOB; **one redeploy** (K4296's route, K4428; the scanner image only if `container/` changed: it did not); targeted re-walk scoring old and new records apart (the smoke copy was reset: INFO-2026-0080 and -0042 are now small images, so N5 and C5b are re-walked on fresh captures); the performance re-measure with `Server-Timing`; one final pass; T51's close (design MERGE first, `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`).

## Accepted reds, by name, until the act named

Promotion `row-census`; acquisition `checks.test.mjs` R29 R31 and file-safety R24 (N1261, T52); store-door R17; plane R24 (`screen.objective.purpose`, the design's); journey-check R17 and pseudo R29 (its running job); the held coverage ids (K4417); control-plane `t51-large-pdfs` R120 R121 (EXTRACTION #31); agent-worker R45 and the other stale bundles (regenerated after the last merge).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design stream's MERGE first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (from `/home/user/cp-close`; K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296's approval covers the T51 build; not refused at K4423); none until round 4 is merged and checked (K4426, K4428).

## Open with Bob

Nothing.
