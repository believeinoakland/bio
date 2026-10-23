# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #259 (`session_01D6tzT1sfFkRzsLoBFom349`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-23 ~03:10 UTC, at 42 % of its window, at a clean point: every merge pushed and ruled, every job entry answered, every reviewed START posted. **T51 is OPEN** on `tranche/T51`; fix round 6. Read `build/rulings-active.md` whole, then **K4675 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0, 3, 7 and the entries G47t, G48, G49 (all three are before `### K4597`).

## Bob's direction today (in force)

- Alpha as quickly and efficiently as possible; token efficiency (K3269, K4614). No pause at 80 % (K4614).
- K4426 at planning (K4597): `fixplan` 0 before any START; an independent reviewer before a new plan entry is used, and a short second review of each reviewed rewrite. Every review today found real defects (G47t: 1 defect + gaps; G48: 2 defects, then 7 more points): never skip it.
- **Nothing is open with Bob.**
- To report to Bob when the round ends (protective bounds, K1881): a CSV over 17 MiB stated refused (K4652); one citation at most 20,000 cells (K4642 (6)); a stored reading row over 1 MiB stated (K4639); a case document over 1.5 MiB stated (K4676); an ingest's reason 2,000 characters (K4671); the portal parse bound **4 MiB** (the 8 MiB candidate failed at the real shape, K4678); the 64 KiB upload head (K4678); the safe view's 1,000 cells a sheet, 20 sheets, 5,000 cells, ODS 8 MiB declared (K4680); **workbooks: 50,000 cells / 9 MiB cell JSON / 20 MiB file, refusing 44 of 269 readable corpus workbooks (16 %) as workbooks** (they stay held and read whole as documents; larger workbooks are N1267's beta design, K4662, K4680).

## Running (9 sessions; STARTs `build/plan/starts-T51-F6k/`)

| job | for | state |
|---|---|---|
| CASE-CHECKER #16 `session_01RPHamJS9k22iJs3Y7dJ4XG` | G47 | CHANGE B6 (merge the tranche, seam green) |
| PUBLIC-READ #30 `session_01GnvpRhqTuRSK7Kr4FmJwte` | G47, G47t | CHANGE B20 (R23 rows `sha: null`); all providers merged |
| CASE-AUTHORING #41 `session_01MN9xdJBsqY5jNetBuRbobY` | G47 (merges last of G47) | CHANGE B28 (R55's three rows `sha: null`; R17 green once case-checker merges) |
| CALCULATIONS #8 `session_015P7YZfAbM7iah2fh9UyBGM` | G45 | RESUME B14 (quiet 25 min, idle session, context ~40 %); rung twice. If still quiet at the next check: restart it (§5.4) as CALCULATIONS #9 |
| PLANE #52 `session_019MQdmdBDvLzCM4txninn2N` | G41 proof, G44 proof, G48 proof (CHANGE B55) | working |
| DOCPROFILE #7 `session_0175TpeWdCZgsPcC8Xw3BtqV` | G48 | started 02:55 |
| READING-PIPELINE #27 `session_01W98XYqXUDoRUH9ZDCth2kK` | G48 | started 02:55 |
| AFFORDANCES #44 `session_015vmccEdn9WywiaxqonRTPj` | G49 | started 03:03 |

Merge order: `modules.json` order (plan section 3). Merged today: extraction #39, publication #36 (twice), case-disclosures #17, capture #50, case-carriage #15, case-inputs #8, following #13, file-safety #18, case-grammar #20, workbooks #5, screens-intake #20, text-chain #10, case-tensions #3 (all archived, rows written).

## Do next, in order

1. **Take over** (§5.1): archive BOB #259 once idle (row `BOB-final`, T51); delete its backstop (the newest "BOB #259 backstop", `trig_0182pMj4Lv934maCzjUWnQz5`) and WATCH #259 `trig_011djXTbGyJtc6W2BNtm9v8s`; arm yours; `node_modules` (K4113). Use the process repository's own `mail.mjs`; `fixplan` runs from a worktree of civicos-process `prep/T51-close-v2` (`git -C /home/user/civicos-process fetch --depth 50 origin prep/T51-close-v2 && git -C /home/user/civicos-process worktree add /home/user/cp-close FETCH_HEAD`). Job branches move only by a plain fast-forward push after `git merge-base --is-ancestor` (never forced); a branch carrying only an old record's commits gets the tranche merged into it (K4679's text-chain).
2. `mail check`; act on every entry; merge each COMPLETE in order. **Read each check's own failure count.** **Lesson (today): `mail post` and `mail done` push the whole local tranche branch**, so a local merge whose suites are still running reaches the remote with the next mail act: post or move cursors only after the merge is verified, or merge in a worktree.
3. **public-read's `originalOf`** (PUBLIC-READ #30 J19 "Deferred"): `#editionItems` keys a copied material's original by `ref` (two copied captures of one `ref` keep the last), and the case file gives them one path (`caseFilePath("obscured", ref)`). Diagnose (a worker, sonnet medium): is it reachable by a member, and whose is it (case-grammar's path, case-disclosures, public-read)? If a cause, plan it in the four fields, review, START this round (P10: nothing waits).
4. **G48's merges:** docprofile, reading-pipeline, then PLANE #52's proof (the 17 MiB first tick at most 8 s; the 10 s bar kept; a miss comes back to BOB with the stage profile, never a lowered bar).
5. **The round end** (plan §7): regenerate in the manifest's order (setup-words rows after every merge that adds words; case-checker `program.mjs` after G47, clearing case-checker R13 and R25; bundles all stale; newgroup last), verify `fleetbundles`, `newgroup-bundle-fresh`, case-checker `program.test.mjs`; the whole suite; update `k4426-check-T51-F6.md` (G41-G49 rows); `fixplan` 0; **one redeploy** (K4296 route); the targeted re-walk (plan §7.3, with G44's workbooks and 4 MB CSV preview, G46's 1.5 MB portal, G45's 18,098-row ingest, the act help on Capture requests and Case drafts); the final pass.
6. **T51's close** (§5.7): the design MERGEs U458 (DEC-422) and U459 (DEC-423) first (K4663, K4675); UX-DESIGN's branch must also carry B494 (case-checker's spec text in the unkeyed list), else the words check reads `inline 1` after case-checker merges.

## Accepted reds (by name)

plane `release` R24; plane `l77-size` R77 L (K4608, K4613); file-safety R24; promotion row-census; `fleetbundles` section 10, agent-worker `requirements`, ocr-worker, `newgroup-bundle-fresh` arms (C)/(D) (stale bundles until the round-end regeneration); newgroup R8, R11, R20, R33, R44, R55, R61, R71, `wizard.test.mjs` (K4580); case-checker R13, R25 (stale `program.mjs` until the round-end regeneration, K4680); case-authoring R17 and R55 x3 (`carries.test.mjs`), public-read R23 (until their jobs merge, K4680); affordances t36 ACT_HELP, R62 R65 keys, B12 (until AFFORDANCES #44 merges, K4680); words `inline 1` for case-checker's spec once it merges (until UX-DESIGN's B494 lands, K4677). Heavy files run alone: `reading-pipeline/pdf-pieces`, `memory`, the shape probes, `control-plane` R122.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177; U458, U459 ask them, K4663, K4675); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by fast-forward or by merging the tranche into them (K4385, K4659, K4679); never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause, G41-G49 included, passes K4426's check and `fixplan` reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

Lanes: AI-DESIGN A41, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15 (unchanged). UX-DESIGN through U459 read (MERGE DEC-422, DEC-423 at the close); B493, B494 ours, unread by it.
