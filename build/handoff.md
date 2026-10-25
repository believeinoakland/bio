# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #299 (`session_01UXNYstSsYAwerzew2cNJ2D`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #300, 2026-10-25 20:12Z, at about 40 % (own count; `get_session` reads 0 mid-turn). **T51 is OPEN** on `tranche/T51`; **fix round 10 is running**. Read rulings K5177 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (items 87, 88 are this session's placements; §3 items 7-88 the owed list) and `build/plan/audit-r10-1.md`, `-2.md` whole.

## Bob's rulings in force for this round (in `rulings-active.md`)

- **K5175 (governs everything):** "this round must be the last one before the final round that must be the alpha release ... No guessing. No deferrals. No assumptions." Every owed item is a job the day it is found.
- K5171: no cap on concurrent jobs. K5167: refresh past 40 % by `get_session`, never early.

## Open with Bob

Nothing.

## Pending for you, first

1. **Two reading workers of BOB #299 are running.** If `build/plan/verify-marks.md` and `build/plan/open-jobs.md` are on the tranche when you take over (BOB #299 commits each when it returns), read them whole and act; else rerun each yourself (sonnet, medium) with the same brief: (a) the 105 "mark looks stale" / "met-state UNKNOWN" rows of `audit-r10-2.md`: run each id's tests, MET (BOB strikes) or NOT MET (a job); with it the fixture lines of the §4 modules (`fix-round-10-waves.md` §4) and the eleven residual modules (audit part 1, section 2's last row): per line, the clearing change and whether it can be done now; then one job per module that can. (b) the 54 jobs `mail check` lists `OPEN (unread B<k>..B<n>)`: per unread entry APPLIED / HISTORY / NOT APPLIED with evidence; each NOT APPLIED a job the same day.
2. **STORE-REQUEST #4 CHANGE B8 first:** `storeWorld()` seeds the team twice (GROUP_ALREADY_RECORDED); merge that fix alone the moment it is COMPLETE, then CHANGE SCREENS-ACTION #19, SCREENS-INTAKE #26, SCREENS-ENTRY #12, SCREENS-DAILY #23, SCREENS-INQUIRY #30 to drop their `{group: null}` workaround.
3. **SITE #4** J5 COMPLETE: merge once its cursor reads B5 (rung 20:12).
4. **CONTROL-PLANE #63** (RESUME B95) and its findings to place when it confirms them (K5180): monitoring R79 `provenance_chain`; extraction's text/plain copy read `final`; money R105 G61/G63.
5. Undeclared ops `linewithdraw` (lines) and `capturerequests` (capture-requests): read each module's requirements and route map, then a job each (item 87 (3)).

## Running (addresses in the plan's Jobs line)

PLANE #62 (Wave B; B95 item 4 study; B97 head-of-line), CONTROL-PLANE #63, STORE-REQUEST #4, STANDARDS #20, INTERFACE-SHELL #23, ADMISSION #20, CASE-AUTHORING #45, SITE #4 (complete), SCREENS-INTAKE #26, SCREENS-ENTRY #12, SCREENS-WIZARDS #7, JOURNEY-CHECK #14, SCREENS-DAILY #23, SCREENS-INQUIRY #30 (B63 cause 30b), SCREENS-INVESTIGATE #16 (B33), SCREENS-PUBLISH #22, SCREENS-SETTINGS #19 (live, long turns), SCREENS-ACTION #19.

## Then, in order

1. Merge each COMPLETE (premerge below); archive each merged session with its row; fill new jobs at once.
2. When PLANE #62 merges: CHANGE CONTROL-PLANE to delete `owner-ops.mjs`; point answer-envelope's and following's walks at the one remaining root (80 (1), test only); regenerate `rows.mjs` (then SCREENS-INVESTIGATE's K5173 todos become tests, item 84) and every artifact in the manifest's order.
3. When STANDARDS #20 and INTERFACE-SHELL #23 merge: CHANGE SCREENS-INVESTIGATE (its K5178 todos). The last batch-7 screens job deletes `harness.mjs`'s frame defaults (77 (5)).
4. In the window when the round's jobs have merged: the §5.10 pass (item 33 rewords; items 6, 15 test-support), then 32 (promotion's stamp, last); the words HANDOFF to UX-DESIGN (`fix-round-10-words.md` whole); K5063's step 4 (redeploy biosmoke8 with the live checks, items 4, 13 (b); the targeted re-walk with 70 (c), 75 (e); the final pass live; the 0.87.0 cut; installer and site deploys; the rehearsal); T51's close (§5.7).

## Tools

- Mail tool and checks: civicos-process `main` (`cf957b7`, PR #8: `mail check` shows OPEN), `--product /home/user/bio --tranche T51`. A full `mail check` takes about 2 minutes: run it in the background.
- **Premerge (K5171, K5180):** refuse a job whose record's state is not COMPLETE or whose `handled B<n>` is behind BOB's newest entry; then fetch; base = `git merge-base origin/tranche/T51 origin/job/T51/<m>`; detached worktree; `ownership.mjs <wt> <m> <base> origin/job/T51/<m>`, `architecture.mjs <wt> <m>`, `fixtures.mjs <wt> <m>` FAIL lines vs the tranche's (line numbers stripped); markers added; merge `--no-ff` in `modules.json` order; `architecture.mjs` over the tree, `words.mjs <modules>`; strike marks; push; verify `ls-remote`. A job that proposes requirement lines: BOB writes them at the merge.
- Before creating a job's session: `mail jobbranch --module <m>` (push the tranche first), then post its START. STARTs this session: `starts-T51-F10/<module>-k5178.txt`, `-k5179.txt`.
- `modules.json` edited one line at a time (python on the module's line), then `order-build.mjs --check` and `format.mjs`.
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR): a new rule replaces or merges a line. `fix-round-10-T51.md` about 48.6 KB of 51.2 KB: move finished items to `archive/` before it grows.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137); PR #8 merged at K5179.
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- My timers: backstop `trig_01FhmeFStNM46mmg1Y84u6Wd`, WATCH #299 `trig_018iwaCoMEBb8nKdaCqsRe2W`: delete both at takeover.
- Lanes nothing new (H43, A41, W4, P26). Channel: UX-DESIGN read through U475 (DEC-434 merged K5177); B521 ACK, B522 QUESTION (DEC-432 (b), (c)), B523 HANDOFF (four keys) unanswered.
