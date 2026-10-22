# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #249 (`session_01Kzq9tCna4TdS89rTtjzqKT`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~08:20 UTC, at about 37 % of its window, at a clean point (fix round 5 drafted, not reviewed; no job runs). **T51 is OPEN** on `tranche/T51`. Read `build/rulings-active.md` whole, then **K4519 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-5-T51.md` whole (45 KB: the review is your first act).

## Bob's direction today (in force)

- "the focus is on getting an alpha-level release deployed as efficiently as possible" (Bob, 2026-10-21; K4459, K4460). Weekly meter 53 % (K4516).

## What happened this session (K4519-K4528)

- Round 4b regenerated, checked (all 0), redeployed to biosmoke8 at 86792d1179 (runs 39729043113 dry, 39729170252 deploy; K4520). One stale test fixed (civil-time R21).
- The office-readers split done: CSV-READER #1 and OFFICE-READERS #13 merged (K4522, K4523); office-readers 3,310 lines; bundles regenerated after (7cb5927ff6, `fleetbundles` 153/0).
- The whole suite: OP-DECLARATIONS #35 merged (`owedwork`'s ground, K4525). Reds that fail alone, all in round 5: control-plane R100 (alone, BOB's run: "the store was asked to read", actual undefined; the planner could not reproduce it: re-run and settle), R117 and screens-inquiry R129 (stale per the planner, §4: BOB fixes, test files only, K4297 (2)), doc-clean R4, extraction `c5b-memory` (defects, E2). journey-check 104/105 (R17, accepted, T52).
- Re-walk 4 (two walkers, K4527): `build/plan/walk-T51-rewalk4/A.md`, `B.md`. BLOCKERs: multipart PDFs never read live; a reload before signing publishes a 0-finding edition. PERFORMANCE re-measured (P11-P14).
- Channel: U449 MERGE (DEC-414) held with U448 for the close; its owed work N1263 (T52); ACK B475 (K4526).

## Do next, in order

1. **Take over** (§5.1): archive BOB #249 once idle (row `BOB-final`, T51); delete its WATCH #249 `trig_01TkNWkcphbLdaja4TjPTfFR` and any backstop into it; arm yours; `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2`.
2. **Review fix round 5** (`build/plan/fix-round-5-T51.md`, a planning worker's, sonnet medium; not yet reviewed). Caveats: (a) the worker read `build/plan/lane-performance/HANDOFF.md` only in part (P8, P11-P14 and its header): read the rest whole yourself and add what it misses; (b) its E2, E6, E8, E9, E10 start with a step 0 on biosmoke8 (`op=owedwork` read-only; a Chromium request log for "Finish it"; the member's participation row for the template): do the reads yourself or by a worker before the STARTs so the jobs start from causes; (c) §6 holds two conditional questions for Bob (a capture bar for large files; who may keep a template): raise one only if its step 0 makes it real, with options and a recommendation. Then write the STARTs (`build/plan/starts-T51-F5/`; the op-declarations one there is done) and start the 11 jobs (all sonnet, §3's merge order), and fix §4's stale tests yourself.
3. Merge each job as it completes (K4427's Open list), then regenerate, verify, checks, the whole suite (it takes over 2 h: run it in two halves, each under the 2 h background limit), K4426's four points per cause, **one redeploy** (K4296's route: push to `deploy-test/biosmoke8/dry-run`, then `deploy`), a targeted re-walk (brief like `walk-T51-rewalk4/BRIEF.md`), PERFORMANCE re-measure, one final pass.
4. **T51's close** (§5.7): U448 then U449 merged into `main` first, `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`. Close audit: journey-check's older `not yet met: T51` marks (R20, R21, R23-R26, R28), case-disclosures R33, corpus-export R11, R12.

## Accepted reds, by name, until the act named

Promotion `row-census`; file-safety R24 and plane R24 (stale design rows: U448's merge at the close); journey-check R17 (T52); round 5's reds above until their jobs merge.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs U448 and U449 first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296's approval covers the T51 build; not refused at K4423 or K4520); none until round 5's K4426 points are checked (K4426, K4428).
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

## Open with Bob

- None.

Lanes: AI-DESIGN A40, JOURNEYS W4, INVESTIGATION-DESIGN H43 unchanged; PERFORMANCE through P14. Channel: UX-DESIGN through U449, which has B475 to read.
