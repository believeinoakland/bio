# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #288 (`session_01P9Byx3dToVW1MoxtEv8MLt`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #289, 2026-10-25 ~08:55 UTC, at 40 % context (`get_session`, 395,592 of 1,000,000). **T51 is OPEN** on `tranche/T51`; fix round 10 is fully prepared and **not yet opened**: no job session runs. Read rulings K5049 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole and `build/plan/fix-round-10-waves.md` whole.

## Open with Bob

- Nothing.

## Done this session (K5049-K5063)

- Took over (K5049); LOAD-REDS #2's §11 placed as fix-round-10 entry 4, a study for `plane` (K5050).
- **All four re-walk-9 diagnoses placed** (K5053 G2/G3, K5055 G1/G7, K5056 G4/G6, K5057 G5): each verified line by line by a reading worker, the cited root-cause lines read by BOB; owners and rulings in `fix-round-10-T51.md` §1. None was Bob's (R30 is his DEC-32, R33 his DEC-97).
- **Two new modules** after `signin-door`: `store-assembly` (plane's composition body, 98 ids + R100) and `store-request` (control-plane's whole store-request construction, the test world's door; 24 ids); requirements reviewed independently and merged (K5052, K5054, K5058); plane R10's standing part restored as store-assembly R100 (K5059); retired-id citations re-pointed (K5059).
- **Every requirement amendment of the round written** on the tranche, each `not yet met: T51` (K5059).
- **Fixtures check V3** on civicos-process `main` (PR #6, `b5531c09f8`; 2,936 to 2,816 findings), second audit `fixtures-T51/part-5.md` (K5060); markers `fixtures-own`/`fixtures-generic` are listed in each COMPLETE and read by BOB at the merge.
- **123 STARTs adopted** (`build/plan/starts-T51-F10/`, K5062), seven batches in `fix-round-10-waves.md`.
- Words and layout sent to UX-DESIGN as one HANDOFF, B517 (K5061).

## Running

- **SUITE #2** `session_01UBk4hBz99SH8oVMCQ4s9RH` (`prep/suite-2`, `build/plan/suite-T51-r9.md`): two 2-hour windows ended without `plane` finishing (control-plane passed 680/680); since 07:28Z a third background run times plane one file at a time (40-minute cap each) plus installer-steps, installer, site, stewards, journey-check. It wakes on its end. When it writes, read its classed reds whole: stale tests are BOB's (test files only, K4297 (2)); a plane file that hangs or is slow is a cause for `plane`'s fix-round-10 job (CHANGE, K4787 no load-dependent tests). Archive it with its row (`study-suite`) when done.
- Lanes nothing past H43, A41, W4, P26; channel nothing past U471; B517 sent. INVESTIGATION #4 (secondary) unreachable: leave it.
- My timers: backstop `trig_01BuvvUnkjw1bdGhzQj7QrrV` (08:56Z, re-armed each check), WATCH #288 `trig_015vw215LijDYMdRPSAkquYi` (09:36Z): delete both at takeover.
- The mail tool: run from a local merge of civicos-process `main` and `prep/jobbranch-K4385` (`git worktree add <dir> origin/main && git merge origin/prep/jobbranch-K4385`; the conflict is in `tools/test/mail.test.mjs` only; `mail.mjs` merges clean). Fetch civicos-process with `+refs/heads/prep/*:refs/remotes/origin/prep/*` (the clone is single-branch).

## Then, in order

1. **Open fix round 10** (P19: now): batch 1 of `fix-round-10-waves.md`, at most 20 job sessions (K4215), each per §5.3: push `job/T51/<module>` with `mail jobbranch --module <m>` (K4385), post its START from `build/plan/starts-T51-F10/<module>.txt` (check its depth line names BOB #289), `create_session` titled `<MODULE> #<k>` (k = the module's next number: read the plan's `Jobs` line and `build/jobs/T51/` records) with the fixed prompt and the model the waves doc names (K3518), `mail addjob`, confirm each start. Arm the backstop. Fill each slot as a job merges (§5.5: ownership check, every `fixtures-own`/`fixtures-generic` marker read, strike the met marks, the merge ruling with context %). `store-assembly` waits for batch 1's merges; `store-request` for `store-assembly`; the screens for `store-request`; `interface-assets` for UX-DESIGN's scroll rule on `main` (it may come only with the design MERGE at the close: then it runs in the completion round). `plane`'s START begins with entry 4's study.
2. **REPORTs owed by STARTs** (the jobs report; BOB does them): translations' and signin-door's row deletions in `control-plane/owner-ops.mjs` (K5052 (4)); R29's class rows; R27a's `session`/`reauthdue` fold; R39b's `selftest` arm; pdf-pixels' fixtures file added to its `tests` at its COMPLETE (K5051). Each is a CHANGE to the running owner, or an entry in its START if not yet started (P9, P10).
3. **After batches 1-7:** the §5.10 mechanical pass for the eleven modules K5062 names; the fixtures check must read zero for every module (or each remaining line accepted by name with its reason).
4. **After the round:** one redeploy of biosmoke8 at the tranche tip (K4841) carrying the live checks owed (R5's parted half and the deferred small picture, R11c's container stderr, R13a/R13b's live reading, R24 (d)'s arrival log, entry 4's alarm-sweep request), a targeted re-walk (K4782, K4783; the next brief's corrections: file before polling, D1b "past by more than one stretch", D4 the work figure, `last_mem` NULL on workerd, the 250,001-cell xlsx by the default recipe, the device choice and request times), the final pass (K4781), the 0.87.0 cut (its `dist/cut-*` push needs Bob's one-line approval in the refused session, K3542), Bob signs (G90); then re-embed the installer and deploy `newgroup` and the site with `--var INSTALLER_ADDRESS:https://newgroup.believeinoakland.workers.dev` (K4935, K5037, K5039), and BOB's rehearsal of a new team on the throwaway account (K4942) before telling Bob anything is ready.
5. T51's close (§5.7): the design MERGE first (K1177), `main` merged in, module tests and checks (K2704), the PR merged with the GitHub merge tool; civicos-process's `prep/jobbranch-K4385` and `prep/T51-close-v2` merged by PR.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3); CLAUDE.md's standing direction), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- civicos-process `main`: a text that changes no principle is BOB's (K5036), merged by PR with the GitHub merge tool (standing list, K1177); PR #5 (K5045) and PR #6 (K5060) merged so; no refusal recorded.
- biosmoke deployments: K4841 (standing list: not added). `civicsmith-site` and `newgroup` deploys: ordered by K4935 (item 4a) and Bob's words at K5037; K1715 made each Bob's approval in session; a later deploy cites the ruling that orders it. Account `…7f72` only, plus the rehearsal account (K4942).
- Job branches only by `mail jobbranch`; never a force-push. Sessions: archive each at its merge (K4219); refused acts never taken to Bob nor rephrased (K3466, K4696).
