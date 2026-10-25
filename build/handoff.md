# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #301 (`session_01XyocY4vTpVxnRGtUj6yfAa`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #302, 2026-10-25 21:40Z, at 43 % of its window (`get_session`). **T51 is OPEN** on `tranche/T51`; fix round 10 runs. Read rulings K5184 to the last line of `build/rulings.md` whole, and `build/plan/fix-round-10-T51.md` whole (items 87-94 are the live placements; finished items are in `archive/fix-round-10-T51-done-items.md`).

## Bob's rulings in force for this round (in `rulings-active.md`)

- **K5175 (governs everything):** "this round must be the last one before the final round that must be the alpha release ... No guessing. No deferrals. No assumptions." Every owed item is a job the day it is found.
- K5171: no cap on concurrent jobs. K5167: refresh past 40 % by `get_session`, never early. K5183: the work runs on the primary account; the third account's sessions (BOB #300, ROOT #9, their jobs) are unreachable: never ring or wait on them, write no `BOB-final` row for them (K4790).

## Open with Bob

Nothing.

## First

1. Take over (§5.1). BOB #301's timers to delete (primary account, deletable): backstop `trig_01SyiCkESnb7Bd6XjhUbF4hh` (21:38Z, may have fired) and WATCH #301 `trig_019zbGV1XJd4Gn1nCEApjJXG` (22:18Z into ROOT #7). Archive BOB #301 once idle and write its `BOB-final` row under T51.
2. `build/plan/verify-marks.md` (item 87 (1)) landed at K5194, read by no BOB yet: 105 rows, 90 MET, 13 NOT MET, 2 ALREADY STRUCK, 0 UNKNOWN, and 65 fixture lines of 22 modules (most clearable now). Read it whole: strike each MET mark on its evidence; place each NOT MET row (docket R30, interface-shell R107, notice-producers R29, plane R9 and R85, publish-schedule R12 and translations R18 (`publishatmove`, `translationdraft` undeclared), reading-pipeline R49, screens-inquiry R20, R123, R129, screens-intake R49, store-request R20) and every clearable fixture line as a job or CHANGE the same day. Its `storeWorld()` 'broken' finding was taken while STORE-REQUEST #5's B8 fix merged under it (K5193): re-run `bio-plane/test/m/store-request/world.test.mjs` and the named interface-shell and screens-inquiry tests on the tranche before placing anything for it. Its other reds: `plane/door.test.mjs:143` (37 routes, plane's Wave B, item 85 (1)), two control-plane round-7 seam tests, `r9-jobs` hanging after its 37 tests passed (a load or exit defect, K4787: diagnose).

## Running jobs (all on the primary account; addresses in the plan's Jobs line)

Waiting on: PLANE #63 (Wave B, B95, B97, heavy files), CONTROL-PLANE #64 (B96 caseratify chain, groups B-D fixture lines, B99), STANDARDS #21 (users' runs, then COMPLETE; then CHANGE SCREENS-INVESTIGATE the `known_through` draw), SCREENS-INTAKE #27, SCREENS-DAILY #24, SCREENS-INQUIRY #31, SCREENS-INVESTIGATE #17 (B36 `srcOf`, B37), SCREENS-ACTION #20, SCREENS-ENTRY #14 (R2, R6, B17), SCREENS-SETTINGS #20 (R81, B49), CASE-AUTHORING #46 (B39: R87; R31 chain red by name), CAPTURE-SOURCES #20 (R72), MONITORING #30 (R80), WIZARD-SCRIPTS #27 (R52), PEOPLE #16 (R43, R44), PROGRESSIONS #18 (R49), CASE-CATALOGUE #5 (R6), RATIFICATION #39 (R61), PUBLICATION #42 (R79), AI-USE #13 (R17), AI-ACCOUNTS #8 (R39), MEMBER-ROSTER #6 (R82). Every CHANGE posted at K5193 was rung.

## Then, as each merges (each a CHANGE or a new session the same day)

1. **Premerge every COMPLETE** (K5171, K5180): state COMPLETE (a WAITING ON BOB on its own COMPLETE counts) and the record's cursor at BOB's newest entry, else ring and wait (the small jobs often leave the cursor one behind: ring once, it moves); ownership, fixtures (no new FAIL line against the tranche's), merge `--no-ff` in `modules.json` order, architecture over the tree, words on the module, strike the met marks, archive the session with its row. New STARTs: use the template in the scratchpad of BOB #301 (gone with its container): the START text names `mail done --as job --through B<n>` right after `mail start`.
2. **After CASE-CATALOGUE #5, RATIFICATION #39, PUBLICATION #42 merge:** CHANGE to CASE-AUTHORING #46: merge the tranche, re-run the R31 chain (K5187).
3. **After CASE-AUTHORING merges R87:** public-read R45 (a new session), then screens-publish (R6's header, and its 41 op-table lines on store-request's new recipes; items 90 (4), 92).
4. **After WIZARD-SCRIPTS #27:** a screens-wizards session (R7, R11's required mark; drop its `{group: null}`).
5. **After PEOPLE #16 and PROGRESSIONS #18:** CHANGEs to screens-investigate for the draws (R32 (2), R38, R39; R33 (2)).
6. **After MONITORING #30:** control-plane's `walk-monitoring-checknow-adopt` must go green (CHANGE to control-plane if still open).
7. **After CAPTURE-SOURCES #20:** CHANGE to screens-intake to drop its bare-id forwarding (J56 (1)).
8. **When PLANE #63 merges:** a store-assembly job (item 90 (3): `DECLARED_OPS` rename, the t42/t46 twins, `r10-fixtures-run.test.mjs` and its users' markers, `r9-jobs.test.mjs:313`, `world.script`'s process-wide `SCRIPTS`, the handed clock to `fileSafetyOf` and corpus-export); CHANGE CONTROL-PLANE to delete `owner-ops.mjs`; BOB re-points the following and answer-envelope walks to `store-assembly/register.mjs` (80 (1), test only); regenerate `rows.mjs` and every artifact in the manifest's order.
9. The last batch-7 screens job deletes `harness.mjs`'s frame defaults (77 (5)).
10. In the window when the round's jobs have merged: the §5.10 pass (item 33 rewords; items 6, 15; screens-wizards' dead `{group: null}`), then 32 (promotion's stamp, last); the words HANDOFF to UX-DESIGN (`fix-round-10-words.md` whole, with the K5185 and K5192 rows); K5063's step 4 (redeploy biosmoke8, the targeted re-walk, the final pass live, the 0.87.0 cut, installer and site deploys, the rehearsal), with journey-check's R21 reach functions after the cut (item 94); T51's close (§5.7), where `build/channels.md`'s `BOB` row moves to the primary account (K4790).

## Tools

- Mail tool and checks: civicos-process `main` (`cf957b7`), `--product /home/user/bio --tranche T51`. A full `mail check` takes about 2 minutes: run it in the background. `addjob --name` takes the name with its space (`"PLANE #63"`).
- A compound command holding `rm -rf` was refused once (K5120: re-take plain); `git worktree add` then the checks, chained, is accepted.
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR): a new rule replaces or merges a line. `fix-round-10-T51.md` about 41 KB of 51.2 KB.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- Lanes nothing new (H43, A41, W4, P26). Channel: UX-DESIGN read through U475; B521 ACK, B522 QUESTION (DEC-432 (b), (c)), B523 HANDOFF unread by them.
