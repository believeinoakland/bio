# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #247 (`session_01SFX32XpgoLro9Ekfd8qYTr`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~03:00 UTC, at 39 % of its window. **T51 is OPEN** on `tranche/T51`; fix round 4 is merged; **fix round 4b** (Bob's partial-read question) runs. Read `build/rulings-active.md` whole, then **K4483 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-4b-T51.md` whole (and, in `build/plan/audit-partial-reads-T51.md`, any finding a job's question names).

## Bob's direction today (in force)

- "the focus is on getting an alpha-level release deployed as efficiently as possible" (Bob, 2026-10-21; K4459, K4460).
- Bob, 2026-10-22 (K4483): "Are there other file extraction situations where only part of the file is read at a time, possibly causing it to be lost and abandoned the why big PDFs were? We should identify and fix any similar conditions." Answered by round 4b (K4487); told to Bob as done.

## What happened this session (K4483-K4498)

- EXTRACTION #31 and JOURNEY-CHECK #11 merged: round 4 complete; `t51-large-pdfs` green; coverage's parked ids named by `test.todo` (K4484).
- Audit F1-F12 (K4487), twelve jobs started, shapes pinned (K4488-K4493): ledger hook `owedLater`; `subresources` keyed by session; `readHeld({sha,kind})` with `owed`; `failure: transient|final`; `owedRun`/`deliver`; owed render promoted by control-plane's `deliverOwedRender`.
- Merged: STORE-DOOR #15 (R18), SCREENS-INTAKE #16 (R57), ACQUISITION #26 (R100), FILE-SAFETY #17 (R51), TASKS #17 (R25, seam red), CAPTURE #46 (R103), CAUSE-READING-4 #1 (R37, one red sent back).

## Running (6) and their merge order

Merge order (providers first): cause-office-size, provenance, cause-reading-4 (re-merge), pdf-reader, extraction, control-plane, plane.
- **CAUSE-OFFICE-SIZE #1** `session_01SpRHCwf2dQB77nUBTDACXY` (ooxml R35; ODF and UTF-16 csv stated, K4489): running its suites. Ownership with cp-close's checker: `node /home/user/cp-close/checks/ownership.mjs . ooxml,office-readers,odf-reader …`.
- **PROVENANCE #27** `session_01WPxSEtH41UFFdxzG3nBaLz` (R72, D1): RESUME posted at the 02:37 backstop. **At its merge:** re-run tasks' `seam-r25.test.mjs` (strike tasks R25 if green); start the F3 verification worker (plan §2: the common fixture through every F3 caller, `acquisition/unpack.mjs:833` included); a caller still failing gets its own job.
- **CAUSE-READING-4 #1** `session_01Xg9yrTHu7epTQVfzdejX4W`: merged; CHANGE B3 for `memory.test.mjs`'s answer digests (BUD, PER), accepted red by name until it answers; re-merge then.
- **PDF-READER #9** `session_017eqJekosp7BFHFboXDwJNt` (R42, page-count refusal; K4498): started 02:57.
- **EXTRACTION #32** `session_019RcTbWsRRhrZ7k5jcyP7gC` (R82): COMPLETE (J13); merge after cause-reading-4; then run `r82.test.mjs` (expect 12/12; its stand-in used `budget` on `read`, the provider built `unitsBudget`: if red, CHANGE). Write R82 as its J13 proposes.
- **CONTROL-PLANE #46** `session_01Gs7CrCGk5nXUSZpiDu6qAK` (R123): COMPLETE (J23) but has not read B32/B33 (`deliverOwedRender`, K4493); rung 02:59. Merge when it completes again; R123 as its J23 proposes; its `t51-reading-follows` F1 and F2 tests go green with capture (merged) and plane.
- **PLANE #49** `session_018hyuuzAysk4N5zXFHkNnwL` (R77): COMPLETE (J24); merge last, after control-plane; its seam tests then green; R77 as its record proposes.
- Backstop `trig_01R5pQ5dCytwyP6Ci2VD1QJy` (03:20Z); WATCH #247 `trig_012ixQ7UUrKumcaQGucmXbwK` (04:00Z). Lanes: PERFORMANCE P10, JOURNEYS W4, INVESTIGATION-DESIGN H43, AI-DESIGN A40. Channel: UX-DESIGN read through U447; it has not read B473.

## Do next, in order

1. **Take over** (§5.1): archive BOB #247 once idle (row `BOB-final`, T51); delete its backstop and WATCH; arm yours; `node_modules` (K4113); `/home/user/cp-close` at `prep/T51-close-v2` (job branches only by `mail jobbranch`; cause-job ownership by cp-close's checker).
2. **Merge round 4b** as above, each ruling ending with its **Open** list (K4427 (3)); a job never strikes its own mark (two did: harmless, BOB rewrote the line).
3. **After the last merge:** `later-ux.md` rows the jobs named; regenerate in the manifest's order (every bundle stale), verify; `checks/run.mjs` (words 0; coverage only accepted names); the whole suite (`module-tests.mjs`; run `memory.test.mjs`, extraction `c5b-memory` and docprofile R38 alone); K4426's check of every cause of rounds 4 and 4b; **one redeploy** (K4296's route, K4428; scanner image only if `container/` changed); targeted re-walk (old and new records apart) including a large PDF, a 40 MB upload, a pulled knock, a 60-page scan; PERFORMANCE re-measure; one final pass; T51's close (design MERGE first, `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`). At the close audit: journey-check's old `not yet met: T51` marks (R20, R21, R23-R26, R28).

## Accepted reds, by name, until the act named

Promotion `row-census`; file-safety R24 (`rows.test.mjs`, the design's `words-reads.json`); store-door R17 is now green; plane R24 (`screen.objective.purpose`, the design's); journey-check R17 (T52); the held coverage ids (K4417) and round 4b's unmerged ids; tasks `seam-r25` (provenance); control-plane `t51-reading-follows` F1/F2 (plane); plane's seam tests (control-plane); reading-pipeline `memory.test.mjs` BUD/PER digests (CAUSE-READING-4's answer); the stale bundles (regenerated after the last merge).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design stream's MERGE first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (from `/home/user/cp-close`; K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296's approval covers the T51 build; not refused at K4423); none until round 4b is merged and checked (K4426, K4428).

## Open with Bob

- The platform shows `allowed_warning` on the seven-day limit for these sessions: asked Bob for his weekly meter (K2341: once he reports 80 % or more, no new job starts, running jobs finish and merge). No answer yet.
