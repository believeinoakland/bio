# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #279 (`session_017Wibc4JnfRvixfP2PQLgcC`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #280, 2026-10-24 ~13:12 UTC, at about 40 % of its window (BOB's estimate; `get_session` reports 0). **T51 is OPEN** on `tranche/T51`. **Fix round 9, batch D running.** Read `build/rulings-active.md` whole, then **K4915 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-9-T51.md` §0, §2c (with "Section 2c items added by BOB #277"), §3, §3a, §3b, §3c (rows 56-69), §6, §7 whole, and the section "BOB #279's review of the folded cells" at the end of `build/plan/k4426-check-T51-F9.md`.

## Bob's direction (in force; each in rulings-active)

- K4849 (read the cited code before placing a cause; a worker's "probable" is re-read), K4841 (biosmoke deployments: any act approved), K4831, K4812, K4798, K4781-K4787, K4790, K4426 as before.
- **Nothing is open with Bob.** He returned at 13:01 and was given a plain status report (alpha: finish the round's jobs, one redeploy and re-walk, his claim of biosmoke8's new room, the final pass, his signature of 0.87.0). His coming acts: the claim of biosmoke8's new room; 0.87.0's signature.

## Merged by BOB #279 (K4917-K4931)

Jobs 40 (again), 29 (three times), 63, 64, 62, 61, 41, 67, 68, 65, 30, 31, 69, 66; archived with rows (and BOB #278's `BOB-final`). K4926 sent job 65 back once (its in-memory join), merged after B41. K4920 reviewed the folded K4426 cells (G124b reopened as job 65, merged; G140 and G123b proven by BOB's test-only runs).

## Running (all depth 2)

- **PLANE #57** `session_01U3Cn7msFQfwLaBjAPpmVKZ` (job 37): B84 (K4912: `transcribe.mjs:55` literal; `g41-shape` R84 asserts fields; `r8-heal-door`), B85 (K4916: R107 `jobrow` route; R76 the awaited `deferReading`), B86 RESUME; `RUNNING until 13:35` (its suite). Strike plane R102, R107, R76's mark when merged.
- **CONTROL-PLANE #55** `session_01VD67hh1SX47rST5KvEiAHp` (job 38): BLOCKED on context (J51, with RESUME NOTES); B73 asked it to push its workers' files as WIP and post BLOCKED again (it pushed `5a3e791ded`, `8b51406800`). **When it posts or is idle with nothing uncommitted: archive it (row) and start CONTROL-PLANE #56** on `job/T51/control-plane` with the fixed prompt (§5.4 restart); its START is B-entries B70 (J50's answer), B71, B72 (round-8 seam A1, A1 control, A1b, section 19), B73. Its TODO list is J51's.
- **SCREENS-INTAKE #23** `session_01L76ARMq955JWkNCZQMCV7F` (job 35): J46-J48 answered (K4922, K4930: `provenance` edge added).
- **WORKBOOKS #6** `session_011euAAFYAD76GYT6xKMDMLz` (job 32) and **NOTICE-PRODUCERS #17** `session_01EzbeHquecfUvWe3Ss9yqdi` (job 34): started 13:07; confirm their starts (`mail check` UNCONFIRMED past 15 min: restart per §5.4).
- Lanes nothing past H43, A41, W4, P26 (not re-read by BOB #279: read them at takeover); channel nothing past U469.
- Timers: backstop `trig_01TUqZJhrFhaedWB7hGuDL6k` (into me, 13:26), WATCH #279 `trig_01QFKqVPZ6s391Cg1A7gMjBW` (into ROOT #9, 14:06): delete both at takeover, then arm your own.
- Tools: `mail jobbranch` from the worktree `/home/user/cp-jobbranch` (civicos-process `prep/jobbranch-K4385`; recreate: `git -C /home/user/civicos-process fetch --depth 5 origin prep/jobbranch-K4385:refs/remotes/origin/prep/jobbranch-K4385 && git -C /home/user/civicos-process worktree add /home/user/cp-jobbranch origin/prep/jobbranch-K4385`); `fixplan` from `/home/user/cp-close` (`prep/T51-close-v2`, same recipe). Plane tests from `bio-plane/` with `node --import ./test/platform-sqlite.mjs --test --test-force-exit`. `node_modules` per K4113. I merge in the worktree `/home/user/bio-merge` (branch `merge-279`, `node_modules` symlinked), then fast-forward the main checkout.

## Do next, in order

1. **Take over** (§5.1): Status line; archive BOB #279, its `BOB-final` row; delete its backstop and WATCH #279; arm yours.
2. **Restart control-plane** as above (item under Running).
3. **Merge each job as it completes** (ownership, worktree, its suites, strike marks, wording from its proposals, words rows to `later-ux.md`, archive with its row). A job branch that re-applied tranche commits is merged taking only its own paths and record (K1976; done for calculations, K4930). Then open per §3's "after" column: **36 screens-inquiry** after 35; **43 control-plane-2** last (after 34-38).
4. **Reds accepted by name** (each placed): plane `release` R24, `l77-size` (K4731, K4855); plane `g41-shape` xlsx, `r8-heal-door` (B84); control-plane `t51-visitor-copy`, `r117-held:50`, `t51-reading-follows` F2, round5 E3, round6 G7, round-8 seam A1/A1 control/A1b (job 38); workbooks `g44-large` idle-heap (32); file-safety `rows.test` R24 (K4731); agent-worker R45 (stale bundle); journey-check R17 (T52), `live` R9, the local arm's install (0.87.0, K4875); installer-steps R36 R40, words `missingkey` 5 and `inline` 14 (U469's MERGE at the close, K4883). Words total 19.
5. Then, as before: the 15 MISSING cells of the K4426 check closed from their records (K4920); G135d's `rows.mjs` row; the round end of §7 (regenerate every artifact: plane, agent-worker, ocr-worker, pdf-worker bundles and setup-words rows are stale) and one redeploy (K4841) with the P list (K4884 `caseratify`; a 150 MB parted upload through the proxy, K4899); the room (K4752), the final pass, 0.87.0 (G90), T51's close (§5.7; the design MERGE U469 first, K1177).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- Job branches only by `mail jobbranch` or a job merging the tranche into its own; never a force-push.
- biosmoke deployments: any act, K4841 (standing list: not added). Account `20b533579290b9b93168345edd3b7f72` only; the live copy only through the proxy (K4733).
- Refused acts in jobs are never taken to Bob nor rephrased (K3466, K4696).
- Sessions: archive each job at its merge (K4219); a restart archives the old session first (§5.4); the secondary account's sessions, INVESTIGATION #4 (`mail check`'s NEEDS BOB, K4370) and UX-DESIGN #39 (primary) are not reachable: leave them.
