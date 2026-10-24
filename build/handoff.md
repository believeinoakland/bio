# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #281 (`session_012TgTH2SPDb4Z5JugbefPnt`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #282, 2026-10-24 ~17:55 UTC, at about 40 % of its window (BOB's estimate; `get_session` reports 0). **T51 is OPEN** on `tranche/T51`. **Fix round 9, batch D, last jobs running.** Read `build/rulings-active.md` whole (its load line, K4966, and §4's dropped-container line, K4976, are new), then **K4960 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-9-T51.md` §0, §2c (items 1-10), §2e (with G157, G158), §2f, §2g (new), §3, §3c (rows 56-88), §6, §7 whole (items 1a, 1b, 1c, 3a, 4a, 4b, 6), and `build/plan/diagnosis-R9-seam-reds.md`.

## Bob's direction since BOB #280 (each in rulings-active or rulings)

- **K4966** a red under load is reproduced consistently under a named load and instrumented until its timing cause is known, never passed alone. **K4977** that diagnosis runs apart from the round; its fixes enter T51's next fix round.
- **K4976** (approved text) `RUNNING until` at most 30 minutes ahead; a job idle or disconnected while its record says WORKING/RUNNING is QUIET at once. Tool on civicos-process `prep/running-cap-K4976` (merged to its `main` at T51's close, plan §7 item 6): **run `mail check` and every mail command from `/home/user/cp-cap`** (recreate as for jobbranch). At every backstop also `get_session` each running job.
- The rehearsal account: variables `CS_TEST_CF_TOKEN`, `CS_TEST_CF_ACCOUNT_ID` set in "Default", network allows `api.cloudflare.com` and `*.workers.dev` (K4964, K4967). Measured shapes: `build/plan/measure-R9-account-shapes.md` (K4970). **Nothing is open with Bob.** His next act (name it only when due, K4953): upgrade the rehearsal account to Workers Paid after the Free states are rehearsed (§7 item 4a); then 0.87.0's signature.

## Running (all depth 2; started 17:35-17:50)

- **CONTROL-PLANE #57** `session_01K2vEyUPxRbubW3XvPDPizm` (job 43: seam sections 10-13, 16-18; START B78 with BOB #281's addendum; CHANGE B79 = K4980's G160 delivery, G162 `promoteFiled`, two seam corrections). When jobs 84 and 86 merge, CHANGE it to merge the tranche.
- **PLANE #59** `session_01AWoVVqkqd48jwuoT2GtVPZ` (job 84: R109 arm after commit, R110 `stampUnit`, R97 `failed_why`), **SCHEDULER #45** `session_01D72GnkQD2sSzFN9m6WNunZ` (85: R28 heal), **ACQUISITION #36** `session_01GRvfGdeJxS5azaPFdT5hLD` (86: R39, R116), **READING-PIPELINE #35** `session_01BnUjLxV46WcRESH2NN5cWw` (87: R59), **EXTRACTION #43** `session_017P5Gk2MeNj4hZRwdEWXaSA` (88: R109). Confirm starts (`mail check` UNCONFIRMED past 15 min: restart).
- **LOAD-REDS #1** `session_013sstgydyYcTuNDSMFwMfyi` (own container, branch `prep/load-reds`; K4979): tests 6 and 7, the whole touched suites under load, the four product findings in K4426's fields. When it ends, place its fixes and causes in T51's next fix round (K4977) and archive it with a `study-load-reds` row.
- Lanes nothing past H43, A41, W4, P26; channel: UX-DESIGN read through B515 (B516 its ACK); U471's MERGE (`c752a602da`, DEC-431, merged into the tranche at K4968) still to reach `main` at the close.
- Timers: backstop `trig_01RUPnobf1Y6ewWpq4XU8HYr` (into me, 18:01), WATCH #281 `trig_01XNBeDMPTeAtCGh5qseMxgd` (into ROOT #9, 18:41): delete both at takeover, then arm your own.
- Tools: `/home/user/cp-jobbranch` (`mail jobbranch`), `/home/user/cp-close` (`checks/fixplan.mjs .`), `/home/user/cp-cap` (the mail tool with K4976): recreate with `git -C /home/user/civicos-process fetch --depth 5 origin <branch>:refs/remotes/origin/<branch> && git -C /home/user/civicos-process worktree add <dir> origin/<branch>` (branches `prep/jobbranch-K4385`, `prep/T51-close-v2`, `prep/running-cap-K4976`). Merge on the tranche checkout only after the job's suite passes there; check `git ls-files | grep -cE '(^|/)node_modules$'` is 0 before every push (K4939).

## Do next, in order

1. **Take over** (§5.1): Status line; archive BOB #281 (row `BOB-final`); delete its backstop and WATCH; arm yours.
2. **Merge each job as it completes** (ownership, its suite on the merged tree, strike marks, its proposed wording adopted as BOB's, words rows to `later-ux.md`, archive with its row). Job 43 merges last.
3. **Reds accepted by name** (each placed): plane `release` R24, `l77-size` R77 L; the seven load reds (K4965, K4969: acquisition `stage-times` R95, capture `g127f-plane` R113 ×3, reading-pipeline `r7-contention` G82 L, plane `g41-shape` R84 G41, plane `g54-l`, screens-inquiry `fr5` R129 N5, control-plane `t51-round7-seam` G61 twin) until LOAD-REDS places them; the seam's §5, §6 A1/A12, §9 and round 8's §19 until jobs 84-88 and 43 merge; §14 until the mechanical pass; screens-intake `t51-seam-g126h` R61 until job 43; file-safety `rows.test` R24 (K4731); agent-worker R45 (stale bundle); journey-check R17, `live` R9, the browser files (K4847); installer's fifteen inherited (R8, R11, R20, R44, R55, R61, R71, G54/t48, wizard, R33 six); tasks R25 (K4488) and queue R55 to check in the whole suite. Words check: 0.
4. Then the round end of §7: 1a the mechanical pass (no job running; includes job 79's and job 81's re-points), 1c control-plane's proposed wording, the two K4426 cells by the corpus R set (K4940), regenerate every artifact (bundles, newgroup, setup-words: stale), the whole suite in its own session (K4787), the one redeploy (K4841) with `--store-generation 2`, BOB's claim of the new room (3a), the P list, the re-walk; then §7 items 4a/4b (site, installer, the rehearsal Free then Paid on the rehearsal account), the final pass (K4781), 0.87.0 (G90), T51's close (§5.7; the design MERGE first, K1177; the three civicos-process prep branches merged).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGE first (§5.7 (1), K1177); no refusal recorded. CLAUDE.md's account line (K4949) reaches `main` with it.
- civicos-process `main` gains `prep/running-cap-K4976`, `prep/stale-test-K4349`, `prep/jobbranch-K4385` at T51's close (K4976, K4349, K4385).
- Job branches only by `mail jobbranch` or a job merging the tranche; never a force-push.
- biosmoke deployments: any act, K4841 (standing list: not added); account `…7f72` only, plus the rehearsal account from the Default environment only (K4949, K4956); the live copy only through the proxy (K4733).
- Refused acts in jobs are never taken to Bob nor rephrased (K3466, K4696).
- Sessions: archive each job at its merge (K4219); a restart archives the old session first (§5.4); INVESTIGATION #4 (secondary) and UX-DESIGN #39 (primary) are not reachable: leave them.
