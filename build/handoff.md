# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #280 (`session_01Q4YjftsGvdaWxKZHBaPDXW`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #281, 2026-10-24 ~14:30 UTC, at about 40 % of its window (BOB's estimate; `get_session` reports 0). **T51 is OPEN** on `tranche/T51`. **Fix round 9, batch D running.** Read `build/rulings-active.md` whole, then **K4933 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-9-T51.md` §0, §2c (with "Section 2c items added by BOB #277"), §2e, §2f, §3, §3a, §3b, §3c (rows 56-78), §6, §7 whole (items 1a, 3a, 4a, 4b are new), and the last two sections of `build/plan/k4426-check-T51-F9.md` (BOB #279's review; BOB #280's 15 cells).

## Bob's direction since BOB #279 (each in rulings-active)

- K4935 the alpha carries an up-to-date civicsmith.org, installer and release; BOB rehearses the new-team journey first (plan §7 item 4a). K4937 the installer makes the founder's account ready (item 4b; R84). K4951, K4952 a founder with no Cloudflare account is walked through from the start; never a token or account id (R85). K4942, K4949, K4956 the throwaway rehearsal account: reached only from the **"Default" environment** (`env_01QdP3jGSnJEPzBNMcDTNhkd`; the BIO environment's proxy injects `…7f72`'s credential over any other), variables `CS_TEST_CF_TOKEN`, `CS_TEST_CF_ACCOUNT_ID`, CLAUDE.md's account rule names it. K4934 BOB claims biosmoke8's new room itself (§7 item 3a). K4953: tell Bob only what he must do now.
- **Nothing is open with Bob.** His next act (name it only when due, K4953): upgrade the rehearsal account to Workers Paid, after the Free-plan states are rehearsed; then 0.87.0's signature.

## Running (all depth 2)

- **CONTROL-PLANE #56** `session_01QFTaUWP2RH4XUurB8ppEkF` (job 38; RESUME B74, CHANGE B75 = K4958's placements). Restart rule as #55 (BLOCKED context with notes).
- **SCREENS-INQUIRY #25** `session_01BwSTa3XEaYc7PpV5c1Q8ZD` (job 36).
- Opened 14:26 (K4958), confirm their starts (`mail check` UNCONFIRMED past 15 min: restart): **PLANE #58** `session_01Di3H5CJCeTUBedG79gEybu` (74), **CAPTURE #55** `session_01TcCgd312RDvc5erHPTSkhN` (75), **ACQUISITION #35** `session_01XzAj5EuQc3hnH5xNiPDvpB` (76, quotes 78's rows), **READING-PIPELINE #34** `session_014igErSz97aUKTLk1N4yExr` (77), **RUNTIME-LIMITS #15** `session_01KNBHkxJ8mc4TazP5cEK4wj` (78).
- **ACCOUNT-MEASURE #2** `session_01Jzmp3Y69oLChhc1vYgyRkT` (Default environment; started 14:23): pushes `build/plan/measure-R9-account-shapes.md` on `prep/account-measure-2`. Read it; if its identity gate passed, fold the measured codes into installer's `newgroup/src/ready.mjs` table and installer-steps' fixtures (10042, 10000/403, 409, 100328 are "documented shape" stand-ins today, K4946, K4947) as a CHANGE-sized job or a test-only fix; archive it with a `study-account-measure` row. If it failed again, read why before anything else.
- Lanes nothing past H43, A41, W4, P26; channel: UX-DESIGN has not read B511-B514 (K4935 NOTICE, K4937 NOTICE, K4951 HANDOFF, K4957 HANDOFF with the installer's 63 keys); U469's MERGE still stands.
- Timers: backstop `trig_01GkbtXmeBcQtarh5A77cu1u` (into me, 14:34), WATCH #280 `trig_015Z7iikJUiAdzuNfsbjxo1X` (into ROOT #9, 15:14): delete both at takeover, then arm your own.
- Tools: `mail jobbranch` from `/home/user/cp-jobbranch` (civicos-process `prep/jobbranch-K4385`), `fixplan` from `/home/user/cp-close` (`checks/fixplan.mjs .`); recreate either: `git -C /home/user/civicos-process fetch --depth 5 origin <branch>:refs/remotes/origin/<branch> && git -C /home/user/civicos-process worktree add <dir> origin/<branch>`. Merge in a worktree; **link node_modules into a worktree only as untracked links and check `git ls-files | grep -cE '(^|/)node_modules$'` is 0 before every push** (K4939: BOB #280 once committed seven links).

## Do next, in order

1. **Take over** (§5.1): Status line; archive BOB #280 (row `BOB-final`); delete its backstop and WATCH; arm yours.
2. **Merge each job as it completes** (ownership, worktree, its suites, strike marks, wording from its proposals, words rows to `later-ux.md`, archive with its row). Job 43 (control-plane-2) opens last, after 34-38 (34, 35, 37 merged; 36, 38 running).
3. **Reds accepted by name** (each placed): plane `release` R24, `l77-size` R77 L (K4731, K4855), `g54-l` fragile, BOB's test-only fix owed (K4941); control-plane `t51-visitor-copy`, `r117-held:50`, `t51-reading-follows` F2, round5 E3, round6 G7, round-8 seam A1/A1 control/A1b, the round-9 seam sections of §2f (job 38/43 and jobs 74-78); screens-intake `t51-seam-g126h` 1 (job 38); file-safety `rows.test` R24 (K4731); agent-worker R45 (stale bundle); journey-check R17 (T52), `live` R9, the local arm's install (0.87.0, K4875); installer-steps R36 R40, words `missingkey` 5 (U469's MERGE); installer R84/R85 tests and `missingkey` 12 (the design's 63 rows, K4957); the installer's sixteen inherited reds (R8, R11, R20, R44, R55, R61, R71, t48, wizard, realsize six: G90 and the round end). Words total about 31.
4. Then the round end of §7: the mechanical pass (1a, no job running), the two still-MISSING K4426 cells by the corpus R set (K4940), regenerate every artifact (plane, agent-worker, ocr-worker, pdf-worker bundles, newgroup, setup-words rows: stale), the whole suite, the one redeploy (K4841) with `--store-generation 2`, BOB's claim of the new room (3a), the P list, the re-walk; then §7 items 4a/4b (site, installer with the design's rows, the rehearsal Free then Paid), the final pass (K4781), 0.87.0 (G90), T51's close (§5.7; the design MERGE first, K1177).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGE first (§5.7 (1), K1177); no refusal recorded. CLAUDE.md's account line (K4949) reaches `main` with it.
- Job branches only by `mail jobbranch` or a job merging the tranche; never a force-push.
- biosmoke deployments: any act, K4841 (standing list: not added); account `…7f72` only, plus the rehearsal account from the Default environment only (K4949, K4956); the live copy only through the proxy (K4733).
- Refused acts in jobs are never taken to Bob nor rephrased (K3466, K4696).
- Sessions: archive each job at its merge (K4219); a restart archives the old session first (§5.4); INVESTIGATION #4 (secondary, `mail check`'s NEEDS BOB) and UX-DESIGN #39 (primary) are not reachable: leave them.
