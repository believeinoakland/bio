# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #274 (`session_01N66tu1ThrWqZd51TygSkj4`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #275, 2026-10-24 ~04:40 UTC, at 54 % of its window (`get_session`; it passed 40 % during merges: hand off at once). **T51 is OPEN** on `tranche/T51`. **Fix round 9:** batch A merged (K4855); **batch B** mostly merged (K4860-K4866); batch C begun (case-carriage, doc-clean #5). Read `build/rulings-active.md` whole, then **K4855 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-9-T51.md` §0, §2c, §3, §3a, §3b, §6, §7 whole.

## Bob's direction (in force; each in rulings-active)

- K4849: open issues understood at their roots from the code; BOB reads the cited code itself before placing a cause; the round aims at the alpha (0.87.0, G90).
- K4841 (biosmoke deployments: any act approved), K4831, K4812, K4798, K4781-K4787, K4790, K4426 as before.
- **Nothing is open with Bob.** His coming acts: the claim of biosmoke8's new room; 0.87.0's signature.

## Merged in round 9 (archived, rows written)

Batch A: test-support, runtime-limits #7, plane-1. Batch B: sheet-worker, subresources, installer-steps (no code; its row is UX-DESIGN's, HANDOFF B509, K4859), image-cover, doc-clean #4, pdf-worker, runtime-limits #8 (rows 1-22; open for more rows by CHANGE), text-chain, image-codecs, file-scanner, ooxml, site-profiles, docprofile (open: CHANGE B9, its `g48-answers` R38 R19 pin), pdf-pixels, pdf-reader #15 (R49 `pageSource`), odf-reader.

## Running (all third account, sonnet; addresses in the plan's Jobs line)

- **CSV-READER #5** `session_017pSg8G4No9aLcVtFV4dsxE`: finishing; it will REPORT a 50 MiB CSV read surviving 144 MB of old space but not 128 MB (diagnose by K4849 before placing) and four reading-pipeline G48 controls pinning its old dialect sentences (job 27's START).
- **OFFICE-READERS #16** `session_01Pv6M4ffDmqfEt4kYWWRrfK`: CHANGE B17: remove `decodePart`'s local decoder (`office-xml.mjs:308-312`, K4858 (1)); at its merge **add `bio-plane/src/office-xml.mjs` to its `paths`** (K4842 (2)) before the ownership check.
- **FORMAT-REGISTRY #5** `session_019Jfv3mJzeNs65nwh7mC8TQ`: waits only on csv-reader's merge (`isDelimitedText`), then a CHANGE.
- **DOCPROFILE #9** `session_01PUj465a1Wdq4EoDMWhQ3Ga` (merged; CHANGE B9 re-records its pin), **DOCTYPES #11** `session_01TmVLRbU29kGrf79yMGm5rX` (CHANGE B11: charge `ctx.work`, re-record `bounded.test.mjs:163, 183`; its two R37 reds are accepted until it merges), **OCR-WORKER #10** `session_013TN9a2nLFBoZdJj1D23BjD`, **RUNTIME-LIMITS #8** `session_01XfNoWiwyETDV2uHxVRHPQy` (open for rows), **JOURNEY-CHECK #13** `session_01USyGMZHTJG6V897tNLHTHH` (job 47).
- Batch C: **CASE-CARRIAGE #16** `session_01VyoeUd2RteSyDN2p9gjFYw` (job 45), **DOC-CLEAN #5** `session_01GLQmY1ex7pDodDcbS94kDg` (maps ooxml's `OFFICE_ENTRIES_MAX` to `TOO_MANY_ENTRIES`, K4866).
- **PERFORMANCE #3** `session_01Vp7GZTN9bpooZud5Wd2CuC` idle after P26. No other lane moved (A41, H43, W4); channel: UX-DESIGN has not read B508-B509.
- Timers: backstop `trig_011cXe64sEPbANWY6BukF3rk` (into me, 04:50), WATCH #274 `trig_019YTg59JPQCxcXNNdC6aKcV` (into ROOT #9, 05:30): delete both at takeover, then arm your own.

## Do next, in order

1. **Take over** (§5.1): Status line (`mail bob`); archive BOB #274 and write its `BOB-final` row; `node_modules` (K4113); a worktree of civicos-process `prep/T51-close-v2` for `mail` and the checks. **Deepen the clone first** (`git fetch --deepen 4000 origin tranche/T51` and each job branch): a shallow clone makes `mail jobbranch` and `ownership` read every branch as diverged (K4856). Merge in a separate worktree; after a merge, rerun the suites of every module that consumes what merged (K4866: doc-clean was missed after ooxml). Workers can run merge mechanics (K4864, K4865: ownership, merge, tests, report; BOB reads, rules, strikes and pushes); a long merge pushes after `git merge origin/tranche/T51`, resolving `rulings.md` and `metrics/T51.csv` by keeping both sides in order.
2. Merge the rest of batch B as each completes, providers first: csv-reader, then format-registry (CHANGE), office-readers (after B17; `office-xml.mjs` into its paths), doctypes, ocr-worker, journey-check, docprofile again. **Reds accepted by name** (K4864-K4866): reading-pipeline's eight pins and `pdf-pieces` (job 27's START), file-safety R24 (K4731), doctypes R37 two (until DOCTYPES #11), docprofile `g48-answers` (until B9), doc-clean R3 R12 (until DOC-CLEAN #5), ocr-worker R19 (manifest stale), installer-steps R36 R40 and the five `missingkey` (until UX-DESIGN's row, K4859), words inline 12 (K4731's six and test-support's six, K4855).
3. **Before batch C proper:** rebuild the pdf-worker and ocr-worker bundles once ocr-worker merges (§6 (8)); then open batch C per §3's "after" column (job 52 **monitoring** may open now, site-profiles being merged; START `monitoring.txt`, session number from its record). STARTs gained "Added by BOB #274" paragraphs (K4855, K4861, K4863, K4865): reading-pipeline (job 27, four items), extraction (job 28), control-plane (job 38: P24 logging, P25 R124), screens-intake (35), plane-2 (37: R84 split, bars), docprofile done.
4. Then, as before: after jobs 49 and 50, measure `caseratify` (K4850); G135d's `rows.mjs` row after job 40 (K4846); the round end of §7 and one redeploy (K4841); the room (K4752), the final pass, 0.87.0 (G90), T51's close (§5.7; the design MERGE U467 first, K1177).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded.
- Job branches only by `mail jobbranch` or a job merging the tranche into its own; never a force-push.
- biosmoke deployments: any act, K4841 (standing list: not added). Account `20b533579290b9b93168345edd3b7f72` only; the live copy only through the proxy (K4733).
- Refused acts in jobs are never taken to Bob nor rephrased (K3466, K4696): K4859, K4861 gave routes that need none.
- Sessions: archive each job at its merge (K4219); the secondary account's sessions and UX-DESIGN #39 (primary) are not reachable: leave them.
