# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #278 (`session_017yBV9xWBLct2WNZvFNpVhc`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #279, 2026-10-24 ~12:10 UTC, at about 37 % of its window (BOB's estimate; `get_session` reports 0). **T51 is OPEN** on `tranche/T51`. **Fix round 9, batch D running.** Read `build/rulings-active.md` whole, then **K4908 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-9-T51.md` §0, §2c (with "Section 2c items added by BOB #277", items 8 and 9), §3, §3a, §3b, §3c (rows 56-63), §6, §7 whole.

## Bob's direction (in force; each in rulings-active)

- K4849 (read the cited code before placing a cause; a worker's "probable" is re-read), K4841 (biosmoke deployments: any act approved), K4831, K4812, K4798, K4781-K4787, K4790, K4426 as before.
- **Nothing is open with Bob.** His coming acts: the claim of biosmoke8's new room; 0.87.0's signature.

## Merged by BOB #278

READING-PIPELINE #33 job 40 and EXTRACTION #41 job 28 (K4909), PLANE #57 job 37 and CAPTURE #54 job 60 (K4912). Archived with rows: BOB #277, EXTRACTION #41, CAPTURE #54. **Kept open (not archived) for a re-merge:** READING-PIPELINE #33 and PLANE #57 (each merged, then CHANGEd).

## Running (all depth 2)

- **READING-PIPELINE #33** `session_015XBRHPUV281zekgBFSdDuV` (job 40, merged): B46 done (J41); still owes **B47** (K4911, `reading.piece_chain`) and **B48** (restate its own `d606-perpage-ocr`, K4909); merge again when COMPLETE.
- **PLANE #57** `session_01U3Cn7msFQfwLaBjAPpmVKZ` (job 37, merged): **B84** (K4912): drop `transcribe.mjs:55`'s 2 MiB literal; `g41-shape` R84 xlsx asserts fields not the sentence; `r8-heal-door` red 1 of 2 alone (fragile or a race, K4787). Strike plane R102 when (3) closes; merge again.
- **CONTENT #20** `session_01K9HMgas2XJZzhRzt7oMHQn` (job 29). J8 answered (K4910, `doc-part` extent in content R1), J9 answered (K4914, `unitsOf` fields); tests needing jobs 41 and 63 red by name.
- **EXTRACTION #42** `session_0199QuHbCg4jYiyYnZT5rvKP` (job 41, opus). J36 S25 placed (K4911), J37 answered (K4913, text-chain job 63), K4914's `unitsOf` fields are its to build.
- **CONTROL-PLANE #55** `session_01VD67hh1SX47rST5KvEiAHp` (job 38), **RECORD-CORE #30** `session_01G8uVdUQZSoht46TsaZdEWE` (job 61, R91), **SCHEDULER #44** `session_0113Q34uGoEBKcg4P8s4Pabg` (job 62, G91's `r8-headofline`, diagnosis first), **TEXT-CHAIN #12** `session_017axPWY6DHbvZpqTGuJogoE` (job 63, R97/R98): started 12:03; confirm their starts (`mail check` UNCONFIRMED past 15 min: restart per §5.4).
- Lanes nothing past H43, A41, W4, P26; channel nothing past U469.
- Timers: backstop `trig_01JpjRnCDqhSTqtW5sQaQAGE` (into me, 12:26), WATCH #278 `trig_01KVZnwpRJy83kYdzmXiuGVM` (into ROOT #9, 13:07): delete both at takeover, then arm your own.
- Tools: `mail jobbranch` from a worktree of civicos-process `prep/jobbranch-K4385` (recreate: `git -C /home/user/civicos-process fetch --depth 5 origin prep/jobbranch-K4385:refs/remotes/origin/prep/jobbranch-K4385 && git -C /home/user/civicos-process worktree add /home/user/cp-jobbranch origin/prep/jobbranch-K4385`). Plane tests from `bio-plane/` with `node --import ./test/platform-sqlite.mjs --test --test-force-exit`. `node_modules` per K4113 (all nine installed fresh at my takeover). I merge in a worktree with the `node_modules` symlinked from the main checkout.

## Do next, in order

1. **Take over** (§5.1): Status line; archive BOB #278, its `BOB-final` row; delete its backstop and WATCH #278; arm yours.
2. **Review the K4426 cell drafts** (K4903, K4915): `build/plan/k4426-check-T51-F9-cells-A.md` (jobs 1-22, 39, 44-47) and `-cells-B.md` (jobs 7, 20, 23-27, and the rows of 28, 33, 40, 56-59 merged since the draft), written by two sonnet workers from pre-merge runs; read each whole (or by a reading worker, K3676) and fold the cells into `k4426-check-T51-F9.md`. **Reopen as entries of this round** (P10; BOB reads the code first, K4849) each cause shown NOT RED or partly red: **G124b / acquisition R115** (`r9-multipart-memory` passes vacuously on the old code; a second whole-sized copy at `acquisition/index.mjs:1576` the test cannot see: a real defect, job for acquisition), G127b / capture R108 (record says no cause in capture), G123b (harness at `harness.mjs:254-255`, not shown red alone), G124e, G126d, the ooxml and office-readers quote rows, G132i (the caller's, ocr-worker), G140 site-profiles (red only by time, 130 s vs 0.4 s: a test that asserts a count is owed), and the partly red G136c, G128e, G140 (2); G128i (3 cells) has no job-23 item: find its owner. Workers' scratch dirs: `/home/user/k4426-b` (two helper scripts; its `rm -rf` was refused, not retried).
3. **Merge each job as it completes** (ownership, worktree, its suites, strike marks, wording from its proposals, words rows to `later-ux.md`, archive with its row). Then open per §3's "after" column: **30 retrieval**, **31 calculations**, **32 workbooks** after 29 (31 also after 4); **34** after 29, 30; **35** after 21, 29; **36** after 29, 30, 35; **43** last (after 34-38). When 63 merges, CHANGE content (29) and extraction (41); when 41 merges, CHANGE content (its four seam tests) and give `s25-pieces-chain` its real reader once READING-PIPELINE #33's B47 merges.
4. **Reds accepted by name** (each placed): plane `release` R24, `l77-size` (K4731, K4855); plane `r8-headofline` R80 G91 (job 62), `r8-heal-door`, `g41-shape` xlsx (B84); control-plane `t51-visitor-copy:58`, `r117-held:50` (38); retrieval R94 (30); workbooks `g44-large` (32); file-safety `rows.test` R24 (K4731); journey-check R17 (T52), `live` R9, the local arm's install (0.87.0, K4875); installer-steps R36 R40, words `missingkey` 5 and `inline` 14 (case-checker 6, test-support 6, pdf-reader 2; U469's MERGE at the close, K4883); coverage gaps of unstarted jobs' new ids. Words total 19 after job 60.
5. Then, as before: G135d's `rows.mjs` row; the round end of §7 (regenerate every artifact: plane, agent-worker, ocr-worker, pdf-worker bundles and setup-words rows are stale) and one redeploy (K4841) with the P list (K4884 `caseratify`; a 150 MB parted upload through the proxy, K4899); the room (K4752), the final pass, 0.87.0 (G90), T51's close (§5.7; the design MERGE U469 first, K1177).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- Job branches only by `mail jobbranch` or a job merging the tranche into its own; never a force-push.
- biosmoke deployments: any act, K4841 (standing list: not added). Account `20b533579290b9b93168345edd3b7f72` only; the live copy only through the proxy (K4733).
- Refused acts in jobs are never taken to Bob nor rephrased (K3466, K4696). Worker B's refused `rm -rf /home/user/k4426-b` was not retried.
- Sessions: archive each job at its merge (K4219), except one kept open for a CHANGE after its merge (READING-PIPELINE #33, PLANE #57) until re-merged; the secondary account's sessions, INVESTIGATION #4 (`mail check`'s NEEDS BOB, K4370) and UX-DESIGN #39 (primary) are not reachable: leave them.
