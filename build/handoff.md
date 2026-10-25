# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #300 (`session_01HKxewhB1RAtqYEdUSNXYmh`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #301 **on Bob's primary account**, 2026-10-25 20:35Z. **T51 is OPEN** on `tranche/T51`; fix round 10 is running. **K5183:** the third account is at 99 % of its weekly limit (Bob): every job was told to save and stop; BOB #301 restarts them on the primary account. Read rulings K5177 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (items 87-89 are the newest placements) and `build/plan/audit-r10-1.md`, `-2.md` whole.

## Bob's rulings in force for this round (in `rulings-active.md`)

- **K5175 (governs everything):** "this round must be the last one before the final round that must be the alpha release ... No guessing. No deferrals. No assumptions." Every owed item is a job the day it is found.
- K5171: no cap on concurrent jobs. K5167: refresh past 40 % by `get_session`, never early. K5183: the move to the primary account.

## Open with Bob

Nothing. (Bob starts the primary account's ROOT, below.)

## First, on the primary account (K5183)

Sessions of the third account cannot be reached from the primary. Bob: "Archive sessions once they've saved their state": BOB #300 archives each job once its saved state is on the remote, with its row; its last ruling lists which it archived and which (if any) never saved. So:
1. Take over (§5.1) as usual; steps 5 and 6 (delete BOB #300's timers, archive earlier BOBs) are skipped for the third account's sessions; they write no `BOB-final` row (K4790).
2. For each job of the plan's `Jobs` line (the 14 below), read its record on `origin/job/T51/<module>`: its "Saved at K5183" section names what is done and the next step. If the record's state is not `WAITING ON BOB (K5183 save)`, or no such section exists, the job may have pushed nothing after B<n> (its last CHANGE, "SAVE NOW"): read its branch's last commits and its record whole before restarting. Then create `<MODULE> #<k+1>` on its branch with the fixed prompt (§5.3 (3)), and post a RESUME naming the saved section; record the new address with `mail addjob`. A COMPLETE job is merged by the premerge below, not restarted.
3. Create the sessions of the four STARTs already posted (K5182; branches pushed by `mail jobbranch`): AI-ACCOUNTS #7, INSTANCE-SETUP #36, LINES #7, CAPTURE-REQUESTS #27 (`starts-T51-F10/<module>-k5182.txt`; haiku-5-5), then `mail addjob`.
4. BOB #299 (`session_01UXNYstSsYAwerzew2cNJ2D`, third account) was told to commit its verify-marks worker's result as `build/plan/verify-marks.md`. If that file is not on the tranche, rerun the worker yourself (sonnet, medium): the 105 "mark looks stale" / "met-state UNKNOWN" rows of `audit-r10-2.md`, each id's tests run, MET (BOB strikes) or NOT MET (a job), with the fixture lines of the §4 modules and the eleven residual modules (audit part 1, section 2's last row), one job per module that can be cleared now.

## Saved jobs (third account; addresses in the plan's Jobs line)

**At the stop (100 % of the week, 20:35Z):** saved and archived with rows: control-plane, standards (its tests not run, COMPLETE not posted), screens-wizards, journey-check, screens-daily, screens-inquiry. **Not saved, left unarchived** (their last pushed commits are all there is; read each branch's tip and record whole before restarting): plane, store-request, screens-intake, screens-entry, screens-investigate (BLOCKED), screens-publish (COMPLETE posted before the save: premerge it), screens-action (WAITING ON BOB J32), case-authoring. BOB #300's timers are deleted.

PLANE #62 (Wave B; B95 item 4 study; B97 head-of-line), CONTROL-PLANE #63 (B94-B96: the door cases, `owner-ops.mjs` after plane, the caseratify chain to 11), STORE-REQUEST #4 (**B8 first**: `storeWorld()` seeds the team twice, GROUP_ALREADY_RECORDED; merged alone when COMPLETE, then CHANGE SCREENS-ACTION, -INTAKE, -ENTRY, -DAILY, -INQUIRY to drop `{group: null}`, and re-run interface-shell's 82 reds; then B9), STANDARDS #20 (J6 COMPLETE re B6 but its state read RUNNING at 20:20: merge once COMPLETE; then CHANGE SCREENS-INVESTIGATE its K5178 todos with standards' REPORT of the money/period red), SCREENS-INTAKE #26, SCREENS-ENTRY #12, SCREENS-WIZARDS #7, JOURNEY-CHECK #14 (ANSWER B18), SCREENS-DAILY #23, SCREENS-INQUIRY #30 (B63), SCREENS-INVESTIGATE #16 (B33), SCREENS-PUBLISH #22, SCREENS-ACTION #19, CASE-AUTHORING #45 (RESUME B35: merge, never reset).

## Then, in order

1. Merge each COMPLETE (premerge below); archive each merged session of the primary account with its row; fill new jobs at once. After instance-setup merges: a screens-settings job for R81.
2. When PLANE #62 merges: CHANGE CONTROL-PLANE to delete `owner-ops.mjs`; point answer-envelope's and following's walks at the one remaining root (80 (1), test only); regenerate `rows.mjs` (then SCREENS-INVESTIGATE's K5173 todos become tests, item 84) and every artifact in the manifest's order.
3. The last batch-7 screens job deletes `harness.mjs`'s frame defaults (77 (5)).
4. In the window when the round's jobs have merged: the §5.10 pass (item 33 rewords; items 6, 15 test-support), then 32 (promotion's stamp, last); the words HANDOFF to UX-DESIGN (`fix-round-10-words.md` whole, with item 89's rows); K5063's step 4 (redeploy biosmoke8 with the live checks, items 4, 13 (b), 89's platform runs; the targeted re-walk with 70 (c), 75 (e); the final pass live; the 0.87.0 cut; installer and site deploys; the rehearsal); T51's close (§5.7), where `build/channels.md`'s `BOB` row moves to the primary account (K4790).

## Tools

- Mail tool and checks: civicos-process `main` (`cf957b7`), `--product /home/user/bio --tranche T51`. A full `mail check` takes about 2 minutes: run it in the background. The third account's sessions read in it as whatever their records say; their doorbells cannot be rung from the primary.
- **Premerge (K5171, K5180):** refuse a job whose record's state is not COMPLETE (a WAITING ON BOB on its own COMPLETE entry counts, K5182) or whose `handled B<n>` is behind BOB's newest entry; fetch; base = `git merge-base origin/tranche/T51 origin/job/T51/<m>`; detached worktree; `ownership.mjs <wt> <m> <base> origin/job/T51/<m>`, `architecture.mjs <wt> <m>`, `fixtures.mjs <wt> <m>` FAIL lines vs the tranche's (line numbers stripped); markers added; merge `--no-ff` in `modules.json` order; `architecture.mjs` over the tree, `words.mjs <modules>`; strike marks; push; verify `ls-remote`. A job that proposes requirement lines: BOB writes them at the merge.
- Before creating a job's session: `mail jobbranch --module <m>` (push the tranche first), then post its START. Trigger creation is rate-limited (about ten a minute): ring in batches.
- `modules.json` edited one line at a time (python on the module's line), then `order-build.mjs --check` and `format.mjs`.
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR): a new rule replaces or merges a line. `fix-round-10-T51.md` about 49.2 KB of 51.2 KB: move finished items to `archive/` before it grows.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- My timers (third account; they cannot be deleted from the primary, and they only reach third-account sessions): backstop `trig_01DEXXWF7yKThEX8eU2uzQym` (20:45Z) and WATCH #300 `trig_018XWtSxo6jzZV6ViBhPpN8p` (21:30Z into ROOT #9). BOB #300 deletes both before it ends.
- Lanes nothing new (H43, A41, W4, P26). Channel: UX-DESIGN read through U475; B521 ACK, B522 QUESTION (DEC-432 (b), (c)), B523 HANDOFF (four keys) unanswered. UX-DESIGN is on the primary account already.
