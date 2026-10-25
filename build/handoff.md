# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #297 (`session_01JQbsLg3X7i3h2LpiDNEBK1`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #298, 2026-10-25, at 37 % measured (`python3 build/plan/context.py`, K5158; refresh unasked at 40 %). **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5161 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (§3 items 7-80 are the owed list; 78-80 are this session's) and `build/plan/fix-round-10-waves.md` whole.

## Bob's rulings this session

None. Nothing was asked of him.

## Open with Bob

Nothing.

## Running (addresses in the plan's Jobs line; 15 of 20 slots)

CONTENT #23 (CHANGE B22: content's side of reading-pipeline R63), ACQUISITION #41, INTENT #19 (CHANGE B6: `SELECTION_NOT_YOURS` stand-ins), STORE-ASSEMBLY #3 (restart, K5162; reads B5-B7 past its cursor B4), ACTION-PRODUCERS #6 (R26), STORE-REQUEST #2 (R25, 77 (3), and CHANGE B4: the four door ops `agentpack`, `airundispatch`, `textcheck`, `readtranslate` copied in), AFFORDANCES #48 (77 (2), and CHANGE B25: `ACT_HELP` for `authority`, `ruleservicesstate`), CREDENTIALS #28 and INSTANCE-SETUP #34 (71 (3): each takes a handed clock and REPORTs the line store-assembly adds to hand it `nowMs`: a CHANGE to store-assembly then), QUEUE #38 (R95, `project-leave`), CONTROL-PLANE #61 (Wave B: 8, 42, 69, 71 (4), 72 (3), 73 (6), 75, 78 (6); every door case a job REPORTs goes to it as a CHANGE), SCREENS-INQUIRY #28, SCREENS-ACTION #18 (item 75's screen causes and their op tables), OP-DECLARATIONS #37 (80 (2)).

**Held:** `job/T51/queue-producers` (QUEUE-PRODUCERS #29 J22, R54, archived) merges together with QUEUE #38, queue-producers first, then strike queue-producers R54 (78 (1)).

## Then, in order

1. Merge each COMPLETE as it comes (premerge below); archive each merged session with its row (K4219); keep 20 slots full, providers first.
2. Fill the five free slots now, each START from its plan items and diagnosis sections (K4849: read the cited lines): screens-investigate and screens-publish (item 70's lists: `diag2-07.md` §1, §3, §8, §9; `diag2-08.md` C2-C4, C6-C9, C11, R70.12's draw; 05 §5, §6's draw; 59; screens-publish 10A §2, 10B C5, C10, C6's draw, follow-up 54, and 72 (4)'s R24/R22 reds), screens-settings (batch 7's 03b §18, item 34's reds); each re-points its op tables to `storeWorld()` (K5054) if its last batch-7 START did not. After QUEUE #38 merges: screens-daily (03b §4, §17, 06 §19 (d), the `project-leave` words and draw, R95's draw). After STORE-ASSEMBLY #3 merges: plane's Wave B (12, 23, credentials' six `credentialsOf(ctx)` sites, 77 (4), monitoring's run line kept, and 80 (1): the walks re-pointed at the one root left). The last batch-7 screens job deletes `harness.mjs`'s four frame defaults (77 (5)).
3. Owed still: 13, 15 and 33 (the §5.10 pass, no job running), 32 (promotion's stamp, last), 72 (4)'s remaining reds diagnosed, item 76 (the context figure in `mail check`, civicos-process PR after a dry run).
4. After the round: generated artifacts (manifest order; the plane bundle is stale), the words HANDOFF to UX-DESIGN (`fix-round-10-words.md` whole, its last section K5157's), then K5063's step 4 (redeploy biosmoke8 with the owed live checks, the targeted re-walk with items 70 and 75's asks, the final pass live, the 0.87.0 cut, installer and site deploys, the rehearsal), then T51's close (§5.7).

## Tools

- Mail tool and checks: civicos-process `main` (`e54912f`), `--product /home/user/bio --tranche T51`. `addjob --name` needs the name quoted; a `while read` loop needs `IFS='|'`.
- Premerge (one script): fetch the job branch; base = `git merge-base origin/tranche/T51 origin/job/T51/<m>`; a fresh detached worktree; `ownership.mjs <wt> <m> <base> origin/job/T51/<m>`, `architecture.mjs <wt> <m>`, `fixtures.mjs <wt> <m>` (compare its FAIL lines with the tranche's, line numbers stripped); grep added `fixtures-(own|generic|contract|run)` markers; merge `--no-ff` in `modules.json` order; `architecture.mjs` over the tree and `words.mjs <modules>`; strike the marks (`sed` on `- **R<n>** *(not yet met: T51)* `); push; `git ls-remote origin tranche/T51` equals HEAD.
- `modules.json` is edited by a one-line `sed`, never re-serialised (the file's layout is one module per line); then `order-build.mjs --check` and `format.mjs`.
- STARTs: `python3 build/plan/mkstart.py <jobs.json>` (each `{m, n, item, tag, bob, model?, body}`); a new file name each time. Prepared and posted: `*-k5161`, `*-k5162`, `*-k5163`, `*-k5164`.
- `rulings-active.md` is at 24,541 bytes and 78 lines: a new rule replaces or merges a line. The round's plan is at about 42 KB of 51,200.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- My timers: backstop `trig_01XfezpKVYG6yMAp79NbKQZL`, WATCH #297 `trig_01UsA48a8zkjfEhLjbYpmnzZ`: delete both at takeover.
- Lanes nothing new (H43, A41, W4, P26); channel: UX-DESIGN read through U472; B517, B518 unread by UX design #40.
