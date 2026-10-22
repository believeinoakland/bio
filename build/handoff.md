# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #248 (`session_017TQQLwm8hoeQQz2s3qAKFe`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~05:25 UTC, at 40 % of its window. **T51 is OPEN** on `tranche/T51`; **fix round 4b is wholly merged** (18 jobs) and every K4426 row is READY; **no job runs.** Read `build/rulings-active.md` whole, then **K4500 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-4b-T51.md` §4 and `build/plan/k4426-check-T51.md` (the table; its NOT READY items are closed by K4513-K4517).

## Bob's direction today (in force)

- "the focus is on getting an alpha-level release deployed as efficiently as possible" (Bob, 2026-10-21; K4459, K4460).
- Bob's partial-read question (K4483) is answered by round 4b (K4487-K4517): every place a file is held, read or deferred in parts was traced and fixed or stated.
- Weekly meter **53 %** (Bob, 2026-10-22; K4516): under K2341's 80 %, work continues.

## What happened this session (K4500-K4517)

- Merged: CAUSE-READING-4 (re-merge), EXTRACTION #32 (R82), CONTROL-PLANE #46 (R123, R124), PLANE #49 (R77, load-order fix, real-owner seams), CAUSE-OFFICE-SIZE #1 (ooxml R35, office-readers R35, odf-reader R48), PDF-READER #9 (R42), PROVENANCE #27 (R72), CAUSE-READING-5 #1 (reading-pipeline R38), CAUSE-WHOLE-ROWS #1 (provenance R73, case-authoring R84, case-disclosures R34, corpus-export R13, ratification R56), CAUSE-WHOLE-ROWS-2 #1 (retrieval-browse R19, machinery-producers R16, retrieval R94), PUBLIC-READ #29 (R43). All archived, rows written.
- Two verification workers drove a 20 MB three-part capture through every F3 caller (`build/plan/audit-partial-reads/f3-verify.md`, `f3-verify-2.md`, probes beside them): all answer as for one held capture now.
- C47's through-the-door seam written (`screens-publish/c47-seam.test.mjs`, green after R43); `c5b-memory` 5/5 alone (K4515); F2's test corrected to D5 (K4517).
- `modules.json`: tasks uses provenance-routes; screens-publish uses record-grammar, publication, case-grammar, case-disclosures (test edges, K4506, K4511; `order.mjs` unchanged).

## Do next, in order

1. **Take over** (§5.1): archive BOB #248 once idle (row `BOB-final`, T51); delete its backstop (the latest `BOB #248 backstop` routine) and WATCH #248 `trig_01WDqsg9TsddX66fJD3jAZVZ`; arm yours; `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (clone it; job branches only by `mail jobbranch`).
2. **Before the redeploy** (fix-round-4b §4; K4426, K4428): regenerate in the manifest's order (every bundle is stale; setup-words rows first, which also clears plane R24 and file-safety R24's stale-row reds if the design rows allow), verify (`fleetbundles`, `newgroup-bundle-fresh`, `--test-force-exit`); `checks/run.mjs` (words 0; coverage only accepted names; the unresolved-key words check, k4426-check's pre-deploy list); the whole suite (`module-tests.mjs`; run `memory.test.mjs`, extraction `c5b-memory` and docprofile R38 alone); file-scanner's clamav tests where clamav is installed; the file-scanner image published and its digests set (its source changed in round 3; `agent-runner-image.yml`-style workflow, K1898).
3. **One redeploy** to biosmoke8 (K4296's route, K4428; each deploy act is Bob's one-line approval in the refused session if auto mode refuses, K1715); then the targeted re-walk (old and new records scored apart) with a large PDF, a 40 MB upload (expect: kept, reading stated `final` with its size), a pulled knock, a 60-page scan (OCR continued by cursor), a multipart document cited and the case published (page shows "Paragraph n"); PERFORMANCE re-measure; one final pass.
4. **After the re-walk, before the close:** the office-readers split (K4507; `build/plan/draft-split-csv-reader.md` option 1; CSV-READER #1 then OFFICE-READERS; plan entry 15).
5. **T51's close** (§5.7): the design MERGE U448 first (DEC-413, `words-reads.json`), `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`. Close audit: journey-check's older `not yet met: T51` marks (R20, R21, R23-R26, R28), case-disclosures R33, corpus-export R11, R12.

## Accepted reds, by name, until the act named

Promotion `row-census`; file-safety R24 and plane R24 (stale word rows: the regeneration, else the design's); journey-check R17 (T52); the held coverage ids (K4417); the stale bundles (regenerated in step 2). Every round-4b red is cleared.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design stream's MERGE first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (from `/home/user/cp-close`; K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296's approval covers the T51 build; not refused at K4423); none until step 2 is done (K4426, K4428).

## Open with Bob

- None.

Lanes unchanged (A40, P10, W4, H43). Channel: UX-DESIGN through U448 (its MERGE, held for the close); it has read B473.
