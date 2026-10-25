# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #298 (`session_01DoH6r6K3Qn2McroXSPVwYH`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #299, 2026-10-25 19:20Z, at 40 % by `get_session` (Bob asked for the refresh). **T51 is OPEN** on `tranche/T51`; **fix round 10 is running**. Read rulings K5167 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (§3 items 7-86 are the owed list) and `build/plan/fix-round-10-waves.md` whole.

## Bob's rulings this session (in `rulings-active.md`)

- **K5167:** BOB watches its context by `get_session` (`context_usage`, window 1,000,000) and refreshes past 40 %, never early; `context.py` is retired.
- **K5171:** no cap on concurrent job sessions.
- **K5175 (governs everything now):** "this round must be the last one before the final round that must be the alpha release. So every (every!) effort must be made to identify and resolve every bug, failure, and broken feature so that everything identified in the alpha requirements is resolved and fixed. Be smart. No guessing. No deferrals. No assumptions. Do the job you're designed to do, and get this alpha release out today."

## Open with Bob

Nothing.

## Pending for you, first

1. **The audit (K5175):** a reading worker of BOB #298 checked every §3 item and every `not yet met: T51` line against the tranche; BOB #298 commits its output as `build/plan/audit-r10.md` when it returns. Read it whole; every item NOT DONE or UNKNOWN becomes a job (or a CHANGE to a running job) the same day, with its cause read in the cited code first (K4849). If the file is absent when you take over, rerun the audit yourself (same scope) with a sonnet worker.
2. **UX-DESIGN U475 MERGE** (unread): merge its commit into `tranche/T51` as at K5168 (`61ea84d268`, keep its text), then CHANGE SCREENS-INVESTIGATE #16 to turn its K5173 `test.todo`s into tests if the 22 keys of HANDOFF B520 are in it. `rows.mjs` regenerates only after plane's Wave B (77 (6)).
3. **STORE-ASSEMBLY #3** J8, J9 (unread) after CHANGE B10 (the dead `next_page` reading); when merged, start **plane's Wave B** (handoff of K5166's item 2: 12, 23, credentials' six `credentialsOf(ctx)` sites with `now`, instance-setup's `now` (82 (2)), 77 (4), monitoring's run line, 80 (1), 85 (1) `selftestmigrations` in `door.test.mjs`), then CHANGE CONTROL-PLANE to delete `owner-ops.mjs`.
4. **SCREENS-ACTION #19** J31 (unread, WAITING ON BOB).
5. **CONTENT #23**: QUIET by its record since 17:40 but in long live turns (control-plane suite at 18:53Z); if still silent, check its events, then restart per §5.4.

## Running (addresses in the plan's Jobs line)

CONTENT #23, STORE-ASSEMBLY #3, SCREENS-ACTION #19, CONTROL-PLANE #62 (Wave B; `innerRequest` switch B92; link-sweep un-name B93), SCREENS-INQUIRY #30 (op tables), STORE-REQUEST #3 (world recipes), SCREENS-INVESTIGATE #16, SCREENS-PUBLISH #22, SCREENS-SETTINGS #19 (R80), SCREENS-DAILY #22, ADMISSION #19 (R33).

## Then, in order

1. Merge each COMPLETE (premerge below); archive each merged session with its row; fill new jobs at once, no cap (K5171).
2. Owed still: 13, 15, 33 (the §5.10 pass, when no job runs), 32 (promotion's stamp, last), 83 (`mail check` OPEN state, civicos-process PR after a dry run), 85 (2), 86 (3)-(4); the last batch-7 screens job deletes `harness.mjs`'s frame defaults (77 (5)).
3. After the round: generated artifacts (manifest order), the words HANDOFF to UX-DESIGN (`fix-round-10-words.md` whole plus items 81 (4), 82 (3), 86 (3)-(4)), then K5063's step 4 (redeploy biosmoke8 with the owed live checks, the targeted re-walk with items 70 and 75's asks, the final pass live, the 0.87.0 cut, installer and site deploys, the rehearsal), then T51's close (§5.7).

## Tools

- Mail tool and checks: civicos-process `main` (`e54912f`), `--product /home/user/bio --tranche T51`.
- **Premerge (K5171):** refuse a job whose record's `handled B<n>` is behind BOB's newest entry in its `.bob.md`; then fetch; base = `git merge-base origin/tranche/T51 origin/job/T51/<m>`; detached worktree; `ownership.mjs <wt> <m> <base> origin/job/T51/<m>`, `architecture.mjs <wt> <m>`, `fixtures.mjs <wt> <m>` FAIL lines vs the tranche's (line numbers stripped); added `fixtures-(own|generic|contract|run)` markers; merge `--no-ff` in `modules.json` order; `architecture.mjs` over the tree, `words.mjs <modules>`; strike marks; push; verify `ls-remote`.
- Before creating a job's session: `mail jobbranch --module <m>`, then post its START; check the job's cursor so it reads only live entries (a note entry marks earlier STARTs as history, K5170).
- `modules.json` edited one line at a time (python on the module's line), then `order-build.mjs --check` and `format.mjs`.
- STARTs: `python3 build/plan/mkstart.py <jobs.json>`; files `*-k5169`, `*-k5170`, `*-k5175` this session.
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR): a new rule replaces or merges a line.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- My timers: backstop `trig_01P4zBDhrX33mYB37Md8B5zq`, WATCH #298 `trig_01PiRP3uDjAFmm9sJW8dhpz4`: delete both at takeover.
- Lanes nothing new (H43, A41, W4, P26); channel: UX-DESIGN read through U474, U475 MERGE unread; B519 ACK, B520 HANDOFF read by them.
