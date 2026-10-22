# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #252 (`session_01T8rYkDXW3CsEsgBMqu8Zce`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~15:30 UTC, at about 37 % of its window, at a clean point (every job entry answered, every merge committed, fix round 6's 20 jobs started). **T51 is OPEN** on `tranche/T51`; fix round 6 runs. Read `build/rulings-active.md` whole, then **K4567 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` and `build/plan/audit-silent-partial-reads-K4571.md`, whole.

## Bob's direction today (in force)

- Alpha release deployed as efficiently as possible (K4459, K4460). Weekly meter 53 % (K4516).
- K4565/K4566: the scheduler heals itself unseen; the Worker's cron is a watchdog, efficient and bulletproof.
- **K4571: never a silent partial read** ("silent scanning is death!"): a large text is read whole in the background; every other silent partial read the audit finds is fixed in this round; a bound that must stay is stated to the member.

## What happened this session (K4567-K4575)

- Merged: filings, docket, screens-action (E9 closed offline, K4567-K4569), scheduler (spent alarm, heal, heartbeat, health, watch; R28, R29; K4574).
- Four diagnoses (`build/plan/diagnosis-R6-watchdog.md`, `-capture.md`, `-screens.md`, `-speed.md`); the watchdog placed (K4570); fix round 6 planned whole and started (K4573): 20 jobs, sonnet; the audit reported 14 SILENT rows (K4575).
- DEC-415 (U450) placed as N1265 for T52 (K4572). Channel: B479 (K4571 NOTICE), B480 (ACK U450), B481 (HANDOFF: round 6's words). UX-DESIGN through U450, nothing unread.

## Running jobs (all started 15:13-15:14Z; START bodies `build/plan/starts-T51-F6/`; confirm each start with `mail check`, §5.3 (5))

bundler #26, acquisition #28, capture #48, reading-pipeline #22, extraction #34, strength #21, case-carriage #14, case-authoring #38, review #24, notice-producers #15, store-door #16, interface-shell #17, screens-intake #18 (+ CHANGE B30: three suite reds to run alone), screens-daily #19, screens-inquiry #21, screens-publish #18, control-plane #48, plane #51 (+ CHANGE B41: scheduler merged), installer-steps #6, journey-check #12. Session ids in the plan's Jobs line. Merge order: plan section 3.

## Do next, in order

1. **Take over** (§5.1): archive BOB #252 once idle (row `BOB-final`, T51); delete its backstop (newest "BOB #252 backstop") and WATCH #252 `trig_01D44rwKwFxD7Ugs2z3YeabF`; arm yours; `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (`git worktree add --detach`; its `tools/mail.mjs` has `jobbranch`). Note: a `node --test` whose file argument comes out empty runs every test in the repository, agent-worker's mutating negative controls included (BOB #252's own slip, stopped and restored from HEAD at 15:30): check the path before running; restore from HEAD after any such run (K1994); never commit those edits.
2. **Place the audit's 14 SILENT rows** (K4575) as causes G14 onward in `fix-round-6-T51.md` with the four fields: by CHANGE to a running job that owns the module (extraction, reading-pipeline, screens-inquiry, capture, acquisition, control-plane are running), else STARTs for a second wave (search/find-in/finder screens, legistar, promotion, corpus-export, doctypes, calculations), at most 20 at once. The shared fix (the reading states its completeness; Document, Capture, Search and "looked" screens draw it) serves S1, S2, S4, S6. Words to UX-DESIGN as a HANDOFF.
3. **Watch and merge** in plan section 3's order, R-lines from each COMPLETE; heavy tests alone five runs (plan §7 (1)).
4. Then regenerate (manifest order), the whole suite (reds known: setup-words R10/R16/R17 and `fleetbundles` stale artifacts; test-support R2 environmental in a /tmp worktree; reading-pipeline BUDGET-2024-APP memory test timed out under load (re-run alone; a run alone was cut by the handoff); screens-investigate `fix4-seam` C8 load-dependent (K4550); promotion row-census, file-safety R24, plane R24 accepted), K4426's check per cause, **one redeploy**, targeted re-walk (plan §7 (3)), final pass.
5. After the re-walk's measurements: bring Bob the two speed questions with options (a combined read; where the objects live), plan §2 G12 end. Not before.
6. **T51's close** (§5.7): U448, U449, U450 (and DEC-416 when posted) merged into `main` first, `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`. Close audit as K4540's handoff named.

## Accepted reds, by name, until the act named

Promotion `row-census`; file-safety R24 and plane R24 `release.test.mjs` (stale design rows: U448's merge at the close); journey-check R17 (T52).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296; not refused at K4423, K4520, K4556); none until round 6's K4426 points are checked.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

## Open with Bob

- None.

Lanes: AI-DESIGN A40, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P14 unchanged.
