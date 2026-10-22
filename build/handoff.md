# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #256 (`session_017e2HR6BjGC2vhYAH5g2PyN`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~23:25 UTC, at 41 % of its window (K4617), at a clean point: every merge pushed and ruled, every job entry answered, the tree clean. **T51 is OPEN** on `tranche/T51`; fix round 6: every G1-G40 job merged; G41 waits on Bob. Read `build/rulings-active.md` whole (new lines: K4628 the beta's file standard, K4630 large files read never failed, K4632 adding is not interpreting), then **K4619 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0, 7 and "G37-G38" to "G41", `build/plan/diagnosis-R6-g40.md` and `diagnosis-R6-g41.md` (whole: G41 rests on them).

## Bob's direction today (in force)

- Alpha release as quickly and efficiently as possible; token efficiency (K3269, K4614). No pause at 80 % (K4614).
- K4426 enforced at planning (K4597): `fixplan` 0 before any START; an independent reviewer before a new plan entry is used. Both reviews this session corrected real errors (K4622, K4631): never skip it.
- Large files within the standard are read, never failed (K4630). Adding a document is not interpreting all of it (K4632).

## Open with Bob (two questions, asked in BOB #256's session, K4633)

1. **Adding versus reading whole (K4632 vs K4571):** A (recommended) every document held whole and searchable whole, structured data (typed cells, figures, entities) interpreted selectively per investigation, the document page stating what is interpreted and for which investigation; B selective search too; C every cell interpreted at intake (K4631's design).
2. **The record's architecture (volumetric limits):** a team's record is ONE Durable Object (10 GB, 2 MB per value, 128 MB memory, 30 s CPU). A (recommended now) one object per team plus a measured storage gauge with stated warnings; B (recommended direction for the beta, after a capacity study) the record split across objects with bulk tables in R2; C no change.
When he answers: record his words as a K ruling (rulings-active updated), and plan accordingly. Under Q1 = A, G41 becomes: a sheet's reading row no longer stores every typed cell (the row under 1 MiB by K4631 (1)'s row rule), every row's text indexed in pieces as today, cells interpreted for a range from the held file when a member opens or cites it (`cellsOf` over the held bytes), stated on the document page; re-plan G41 from `diagnosis-R6-g41.md` with that, independent review, then STARTs. Under C, the held drafts apply: `build/plan/draft-G41-K4631-held.diff` and `build/plan/draft-G41-K4631-held-starts/` (seven STARTs, unreviewed against code). Q2 = A adds a gauge entry this round; B goes to `next.md` with the capacity study.

## Running (1 job)

- **TEST-SUPPORT #9** (`session_01NsoiLyHMoVNrYC5YG4oMt4`, START B6, `starts-T51-F6g/test-support.txt`): `bio-plane/test/platform-sqlite.mjs`, a preload refusing a bound value or row over 2,098,176 B (SQLITE_TOOBIG) in every suite; then the full run under it, each new red classed (product write over the limit, or fixture unlike the platform), and calculations' `calc_ingests` and following's `portal_snapshots.rows` measured. At its merge: add `bio-plane/test/platform-sqlite.mjs` to test-support's `paths` (K1043), then wire the preload into `.github/scripts/module-tests.mjs` and the E3 harness child (`bio-plane/test/m/plane/shape/harness.mjs`) as BOB's tooling; each red it lists is a G41 item.

## Do next, in order

1. **Take over** (§5.1): archive BOB #256 once idle (row `BOB-final`, T51); delete its backstop `trig_01VpDZHA2DrCXCF9ALkyL6X5` and WATCH #256 `trig_01Fb1u1nSW5NkVrNJwWsp1jw`; arm yours; `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (`git fetch origin +refs/heads/prep/T51-close-v2:refs/remotes/origin/prep/T51-close-v2`, then `git worktree add --detach`).
2. `mail check`; merge TEST-SUPPORT #9 at its COMPLETE.
3. Bob's two answers (above): record, plan G41, review, START.
4. **The round end** (plan §7): design files are already at DEC-419 and setup-words rows regenerated (done, K4622); after G41 merges: regenerate the bundles in the manifest's order (G39's ASCII pass moves all seven, newgroup last), verify `fleetbundles` and `newgroup-bundle-fresh`; the whole suite (BOB #256's partial run, 102 of 176 modules before the handoff, bundles not yet regenerated: reds in setup-words 2, bundler 1, docprofile 1, ocr-worker 1, promotion 1 (row-census, accepted), file-safety 1 (R24, accepted), reading-pipeline 1: read each against the accepted list); update `k4426-check-T51-F6.md` (G37-G40 rows added; G41 to add); `fixplan` 0; **one redeploy** (K4296 route); the targeted re-walk (plan §7.3, plus the 1 MB CSV stored and found, `last_mem`); the final pass.
5. **T51's close** (§5.7).

## Accepted reds (by name)

plane `release` R24 (stale words, regenerated at the round end); plane `l77-size` R77 L (wrong gate, K4608, K4613); file-safety R24; promotion row-census; `fleetbundles` section 10, agent-worker `requirements`, ocr-worker, `newgroup-bundle-fresh` arms (C)/(D) (stale bundles, until regeneration, K4620, K4621); newgroup R8, R11, R20, R33, R44, R55, R61, R71, `wizard.test.mjs` (the embedded 0.86.0 release, K4580). Heavy files run alone: `reading-pipeline/pdf-pieces`, `memory`, the shape probes.

## Lesson (this session)

I idled behind a measurement worker while work that did not depend on it waited (Bob noticed). Before ending any turn "waiting", start every step whose inputs are already in hand. And measure the platform's real limits, not only memory: the 2.1 MB value limit (G41) was invisible to every node test and found only by a run in Miniflare's real SQLite.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by `mail jobbranch` (K4385); never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause, G41 included, passes K4426's check and `fixplan` reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

Lanes: AI-DESIGN A41 (beta), JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15. UX-DESIGN through U457 read (DEC-420, DEC-421: the beta's AI screens, K4623); B489 ours, unread by it.
