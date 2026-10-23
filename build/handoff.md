# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #258 (`session_015JBWKDY86hatNaHfvPXxCE`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-23 ~02:27 UTC, at 40 % of its window, at a clean point: every merge pushed and ruled, every job entry answered, every reviewed START posted. **T51 is OPEN** on `tranche/T51`; fix round 6. Read `build/rulings-active.md` whole, then **K4659 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0, 3, 7 and the entries G41 (with its "G41 follow-up" bullet above G42) to G47.

## Bob's direction today (in force)

- Alpha as quickly and efficiently as possible; token efficiency (K3269, K4614). No pause at 80 % (K4614).
- K4426 at planning (K4597): `fixplan` 0 before any START; an independent reviewer before a new plan entry is used. Every review this session found real defects (G44: 13, G45-G47: 16, G47's rewrite: 11): never skip it.
- **Nothing is open with Bob.**
- To report to Bob when the round ends (protective bounds, K1881): a CSV over 17 MiB stated refused (K4652); one citation at most 20,000 cells (K4642 (6)); a stored reading row over 1 MiB stated (K4639); a workbook added over ~50,000 cells or over its file bound stated, the safe view's per-sheet cut (K4662, K4665; figures set by the jobs' measures); an ingest's reason 2,000 characters (K4671); a case document over 1.5 MiB stated (K4669); the portal snapshot parse bound (~8 MiB, set by measure, K4669).

## Running (17 sessions; STARTs `build/plan/starts-T51-F6k/`)

| job | for | state |
|---|---|---|
| PLANE #52 `session_019MQdmdBDvLzCM4txninn2N` | G41 proof, then G44 (CHANGE B50) | G41 shape proof done but 8 MB/17 MiB `cellsOf` red by name on EXTRACTION #39, and the >=12 MB first-tick 10 s assertion red by name on G48 |
| FILE-SAFETY #18 `session_016eGP24TnGhJiYfns4RdWuR` | G44 safe view | started 01:57 |
| WORKBOOKS #5 `session_01BnkTWoC5GF8VJe3V4sMRF5` | G44 add bound | started 01:57 |
| SCREENS-INTAKE #20 `session_01S2atqbcekracFHqkp4KjL2` | G44 drawing | **COMPLETE (J34)**; merge right after file-safety, then regenerate setup-words rows; its 5 reds are by name `UNKNOWN_WORD` until then. Its J34 is left unread on purpose |
| EXTRACTION #39 `session_013ZBMsX3r7H8TLywtAcFXZJ` | G41 follow-up (format fallback, ANSWER B43) | working |
| CAPTURE #50 `session_01L1Y9FNxaoQ4v7iZDkLBJWG` | G41 follow-up (multipart upload profile) | started 02:24 |
| CALCULATIONS #8 `session_015P7YZfAbM7iah2fh9UyBGM` | G45 (CHANGE B13); G41 already merged (K4668) | working |
| FOLLOWING #13 `session_01QjU7Wn9EN1hqzzBdD8DJR6` | G46 | started 02:16 |
| CASE-GRAMMAR #20 `session_01Fki6itUmQ4gkEDi9Uhphep` | G47 (optional `sha`, format `/9`) | started 02:24 |
| CASE-TENSIONS #3 `session_01TSmueyvUPtNYuxRUg58uBu` | G47 | started 02:24 |
| PUBLICATION #36 `session_01QheArVvjbWvvMPvEMfwKVF` | G47 (1.5 MiB bound) | started 02:24 |
| PUBLIC-READ #30 `session_01GnvpRhqTuRSK7Kr4FmJwte` | G47 | started 02:24 |
| CASE-CHECKER #16 `session_01RPHamJS9k22iJs3Y7dJ4XG` | G47 (`spec.mjs`, maps) | started 02:24 |
| CASE-DISCLOSURES #17 `session_01JCHNeQistwMeSv51kQxgRA` | G47 (`materialRows` sha) | started 02:24 |
| CASE-INPUTS #8 `session_01QBHmyVdK3F9mLRdReuQNVZ` | G47 (`why` of a refused splice) | started 02:24 |
| CASE-AUTHORING #41 `session_01MN9xdJBsqY5jNetBuRbobY` | G47 (refusal row) | started 02:24 |

Merge order: `modules.json` order (plan section 3). After each provider merge post a CHANGE to its users and ring them. New sessions start reading their mailbox themselves; ring every job `mail check` lists RING. A merged job's session is archived at once with its row; CALCULATIONS #8 stays open until G45 merges.

## Do next, in order

1. **Take over** (§5.1): archive BOB #258 once idle (row `BOB-final`, T51); delete its backstop `trig_0111D48E1mHbPPUHm5Uptyjj` and WATCH #258 `trig_01Tm3ASoLLjKsTkHvLy8kwsC`; arm yours; `node_modules` (K4113). Use the process repository's own `mail.mjs` (`/home/user/civicos-process/tools/mail.mjs`): running `cp-close`'s copy was refused by auto mode (K4659); job branches are moved by a plain fast-forward push of `origin/tranche/T51` after `git merge-base --is-ancestor` (never forced). `fixplan` runs from `/home/user/cp-close/checks/fixplan.mjs` (worktree of civicos-process `prep/T51-close-v2`; it ran fine).
2. `mail check`; act on every entry; merge each COMPLETE in order. **Read each check's own failure count** (`checks/run.mjs` prints "1 failure" singular: K4668).
3. **G48** (K4673): plan it from PLANE #52's J36 (the 17 MiB CSV's first tick: whole-text classification 6.8 s in docprofile `readText`/`doctypeFor`, site-profiles `recognise`, roster-reader detectors, doctypes windows; per-unit counts 3.7 s in reading-pipeline and textchain `glyphCount`), in the four fields, by a planning worker; independent review; STARTs. Without it the 12 MB+ CSVs fail the 10 s tick bar; lowering the 17 MiB bound only if it fails (K4670).
4. **The round end** (plan §7): regenerate in the manifest's order (setup-words rows at file-safety's and workbooks' merges; case-checker `program.mjs` after G47; bundles all stale; newgroup last), verify `fleetbundles`, `newgroup-bundle-fresh`, case-checker `program.test.mjs`; the whole suite (`module-tests.mjs` now loads the preload, K4666); update `k4426-check-T51-F6.md` (G41-G48 rows); `fixplan` 0; **one redeploy** (K4296 route); the targeted re-walk (plan §7.3, with the G44 workbooks and the 4 MB CSV preview); the final pass.
5. **T51's close** (§5.7): the design MERGE U458 (DEC-422, K4663) first.

## Accepted reds (by name)

plane `release` R24; plane `l77-size` R77 L (K4608, K4613); file-safety R24; promotion row-census; `fleetbundles` section 10, agent-worker `requirements`, ocr-worker, `newgroup-bundle-fresh` arms (C)/(D) (stale bundles until the round-end regeneration); newgroup R8, R11, R20, R33, R44, R55, R61, R71, `wizard.test.mjs` (K4580); case-authoring R17 `document.test.mjs` (until G47 merges, K4666); case-checker `program.test.mjs` R13 (stale program until the round-end regeneration, K4672). screens-inquiry's R96 reds are cleared (K4672). Heavy files run alone: `reading-pipeline/pdf-pieces`, `memory`, the shape probes, `control-plane` R122.

## Lesson (this session)

A START drafted before a merge carries that day's facts: re-read each START's "providers' state", the preload line and the BOB number just before posting it (K4667 corrected four). And a review's fixes create new owners: every reviewed rewrite of a cause gets its own short review before its new jobs start (K4671, K4672).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGE first (§5.7 (1), K1177; U458 asks it, K4663); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by fast-forward (K4385, K4659); never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause, G41-G48 included, passes K4426's check and `fixplan` reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

Lanes: AI-DESIGN A41, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15 (unchanged). UX-DESIGN through U458 read (MERGE DEC-422 at the close, K4663); B492 ours, unread by it.
