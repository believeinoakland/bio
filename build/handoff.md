# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #287 (`session_01FDDiXf9dfugBc6xKNVUEgV`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #288, 2026-10-25 ~07:00 UTC, at 33 % context (`get_session`), handing off early: the work next is reading four diagnoses and writing a large round's STARTs, which does not fit before 40 %. **T51 is OPEN** on `tranche/T51`, between fix round 9's round end and fix round 10. Read rulings K5041 to the last line of `build/rulings.md` whole, and `build/plan/fix-round-10-T51.md` whole.

## Open with Bob

- Nothing.

## Done this session (K5041-K5047)

- Took over (K5041); site and installer design differences placed as next.md N1275 (K5043).
- **The fixture round planned** (K5042-K5046): the audit of 1,379 findings (`build/plan/fixtures-T51/part-1.md` to `part-4.md`), the check's rules settled (K5044) and built into civicos-process `main` by PR #5 (`250046c6e9`; now 2,936 findings, 2,014 of them the screens' scripted op tables); the op tables' design (`fixtures-T51/op-tables.md`) adopted as a new module **`store-assembly`** taking plane's composition body and control-plane's `owner-ops.mjs`, publishing `storeWorld()` (K5046); the round's waves are `fix-round-10-T51.md` §2.
- **Re-walk 9 ended** (K5047): five records merged and the walkers archived with rows; 39 causes grouped in `fix-round-10-T51.md` §1.

## Running (each writes on its own branch; read the record whole, K3588)

- **DIAG-R10-A #1** `session_01TaCy26ZRsV2Xe7cLqSVTQc` (G1, G7), **-B #1** `session_01NRXiuDhXcVArrpkXqWw2rm` (G2, G3), **-C #1** `session_019ewa6gzkVSBBdeNKFwginS` (G4, G6), **-D #1** `session_01KNHjbKgspoP2cSYf94exET` (G5): brief `build/plan/diag-R10-BRIEF.md`; each writes `build/plan/diagnosis-R10-<a-d>.md` on `prep/diag-r10-<a-d>`, sonnet, depth 2, started 06:54Z.
- **SUITE #2** `session_01UBk4hBz99SH8oVMCQ4s9RH` (`prep/suite-2`, `build/plan/suite-T51-r9.md`): its first run stopped at its 2-hour bound after 169 of 176 modules; it runs the last seven (control-plane, plane, installer-steps, installer, site, stewards, journey-check) as its own background task since 05:28Z and wakes on its end. If its branch has not moved by 08:30Z, read its session's events, then ring it.
- **LOAD-REDS #2** `session_01BhjwfEquJ5G3x14STBdhB4` (`prep/load-reds-2`): idle, its §11 written (LOAD-RED 5 (1): not reproduced, no cause established). Read §11 whole, merge its branch (its diagnosis file only), archive it with its row (`study-load`).
- Lanes nothing past H43, A41, W4, P26; channel nothing past U471 (UX-DESIGN's MERGE `c752a602da` at the close). INVESTIGATION #4 (secondary) unreachable: leave it.
- My timers: backstop `trig_01Hmw87MSC6A3RwNAqCWRRXa` (07:15Z), WATCH #287 `trig_01U9HxVVR1Atg82YJVCcv81X` (08:00Z): delete both at takeover. Worktree `/home/user/cp-fixtures` (civicos-process, merged) needs nothing.
- This container saw the auto-mode classifier give no verdict for about 40 minutes (06:06-06:49Z): a fault of the check, not a refusal; the commits waited and were pushed at 06:49Z (K273: a session that keeps showing it is replaced, not approved in).

## Then, in order

1. As each DIAG-R10 session ends: read its file whole, read every cited line yourself (K4849), and place each cause in `fix-round-10-T51.md` §1 with its owning job (one job per cause, K4427), merging causes the diagnoses find share a root; wording and layout to UX-DESIGN as one HANDOFF (K3462, K4269). Archive each with its row (`study-diag`). The same for SUITE #2's classed reds (stale tests BOB's, test files only, K4297 (2)) and LOAD-REDS #2's §11.
2. While they run (P18): draft `build/requirements/store-assembly.md` (its Provides: `assembleStore`, the door function of K5046 (b), `storeWorld()`) and the requirement changes K5046 owes to plane, control-plane, interface-shell, wizard-scripts, translations and signin-door; the `modules.json` entry (after `signin-door`, empty `paths`/`tests` until its job's COMPLETE, a `MODULE_ORDER` entry, K1185); and the round's STARTs. Open fix round 10 as one round the moment its entries are placed (P19): §1's cause jobs and §2's Wave A together, then Wave B; STARTs from the plan (§0's rules of round 8/9 hold), at most 20 job sessions at once (K4215).
3. After the round: one redeploy of biosmoke8 at the tranche tip (K4841), a targeted re-walk (K4782, K4783), the final pass (K4781), the 0.87.0 cut (its `dist/cut-*` push needs Bob's one-line approval in the refused session, K3542), Bob signs (G90); then re-embed the installer and deploy `newgroup` and the site again with `--var INSTALLER_ADDRESS:https://newgroup.believeinoakland.workers.dev` (K4935, K5037, K5039), and BOB's rehearsal of a new team on the throwaway account (K4942) before telling Bob anything is ready.
4. T51's close (§5.7): the design MERGE first (K1177), `main` merged in, module tests and checks (K2704), the PR merged with the GitHub merge tool; civicos-process's `prep/jobbranch-K4385` and `prep/T51-close-v2` merged by PR.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3); CLAUDE.md's standing direction), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- civicos-process `main`: a text that changes no principle is BOB's (K5036), merged by PR with the GitHub merge tool (standing list, K1177); PR #5 merged so (K5045); no refusal recorded.
- biosmoke deployments: K4841 (standing list: not added). `civicsmith-site` and `newgroup` deploys: ordered by K4935 (item 4a) and Bob's words at K5037; K1715 made each Bob's approval in session; a later deploy cites the ruling that orders it. Account `…7f72` only, plus the rehearsal account (K4942).
- Job branches only by `mail jobbranch`; never a force-push. Sessions: archive each at its merge (K4219); refused acts never taken to Bob nor rephrased (K3466, K4696).
