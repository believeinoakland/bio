# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #296 (`session_01C6CGKwoVah4A1ddbXnJGou`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #297, 2026-10-25, at 38 % measured (`python3 build/plan/context.py`, K5158: never estimate; refresh unasked at 40 %). **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5157 to the last line of `build/rulings.md` whole, and `build/plan/fix-round-10-T51.md` whole (§3 items 7-77 are the owed list; 75-77 are this session's) and `build/plan/fix-round-10-waves.md` whole.

## Bob's rulings this session

None new. Bob (2026-10-25) asked why BOBs did not refresh unasked: the measure was wrong (K5158, the rulings-active line); he also said refreshing is due only at 40 % or more.

## Open with Bob

Nothing.

## Running (addresses in the plan's Jobs line; 20 of 20 slots)

STORE-ASSEMBLY #2 (RESUME B7 sent; idle while RUNNING: restart if still quiet, §5.4), INTERFACE-SHELL #22 (CHANGE B45: R130-R132; ANSWER B46), QUEUE-PRODUCERS #29 (CHANGE B18, R54: its COMPLETE J21 crossed it), the 14 of K5157 (CSV-READER #8, PROJECT-ROSTER #16, ACQUISITION #41, READING-PIPELINE #38, CONTENT #23, CONNECTIONS #19, RETRIEVAL #29, CALCULATIONS #17, CITATION #21 (ANSWER B17), STRENGTH #23, INTENT #19, CONSEQUENCES #16, ACTIONS #25, MONITORING #29: 06 §1 BLOCKER), and FILINGS #29, ESCALATION #20, OP-GRADES #28 (K5159). Sitting 02's diagnosis is FINAL on the tranche (`build/plan/walk-T51-final/diagnosis/diag2-02.md`, `5ebc8d7dc1`; record `archive/walk-T51-final/02-people.md`): 22 causes, 6 defects (interface-shell R04.q: INTERFACE-SHELL #22 already fixed the `SESSION_LOCKED` 401, its J30 item 6, so check it covers the walker's case; screens-entry R06.a and R06.c; member-roster R10.d; control-plane R11.e, `adminremovalsopen` stamped `member:<id>`, the class of 03b §1 and 11 §1, for control-plane's Wave B; screens-settings R15.a); one cause already placed (item 60); two UNKNOWN, each with its reproduction (R11.d2, overlay 17). Place it (K4849: read every cited line), the six defects in this round.

## Then, in order

1. Merge each COMPLETE as it comes (premerge below); archive each merged session with its row (K4219); keep 20 slots full, providers first.
2. As slots free, in this order (plan items 75, 77): action-producers (11 §7b, R26), store-request (11 §1 R25 with item 77 (3)), affordances (77 (2), test only), queue (03b §5, R95) after project-roster merges. Then the screens jobs, after their providers merge, each with every screen cause of items 70, 73, 74 (as item 75 lists): screens-inquiry, screens-daily, screens-action, screens-investigate, screens-publish, screens-settings (batch 7, with 03b §18); the last of them to merge deletes `harness.mjs`'s four frame defaults (77 (5)).
3. Owed still: control-plane Wave B (8, 42, 69, 71 (4), 72 (3), 73 (6), 11 §1's `publishcheck` stamp, and every door case the item-75 jobs REPORT; K5138), plane Wave B (12, 23, credentials' six `credentialsOf(ctx)` sites, 77 (4)), 13, 15 and 33 (the §5.10 pass, no job running), 32 (promotion's stamp, last), 35, case-carriage's re-point to `uploadProvenance` (72 (2)), 72 (4)'s reds diagnosed, item 76 (the context figure in `mail check`, civicos-process PR after a dry run).
4. After the round: generated artifacts (manifest order), the words HANDOFF to UX-DESIGN (`fix-round-10-words.md` whole, its last section K5157's), then K5063's step 4 (redeploy biosmoke8 with the owed live checks, the targeted re-walk with items 70 and 75's asks, the final pass live, the 0.87.0 cut, installer and site deploys, the rehearsal), then T51's close (§5.7).

## Tools

- Mail tool and checks: civicos-process `main` (`e54912f5b9`) in a detached worktree (`git worktree add --detach <dir> origin/main`); `--product /home/user/bio --tranche T51`. `addjob --name` needs the name quoted; a `while read` loop splits it unless `IFS='|'`.
- Premerge: fetch the job branch; ownership against `git merge-base`; a fresh detached worktree per job; `checks/architecture.mjs` and `checks/fixtures.mjs` on it with the module; grep added `fixtures-(own|generic|contract|run)` markers; merge `--no-ff` in module order; architecture over the tree and `words.mjs <modules>`; strike the marks; `git ls-remote origin tranche/T51` equals HEAD.
- STARTs: `python3 build/plan/mkstart.py <jobs.json>` (each `{m, n, item, tag, model?, body}`); files `build/plan/starts-T51-F10/<module>-k<ruling>.txt`, never a reused name. New requirement lines: append before `## Private` with the next free id, marked `*(not yet met: T51)*` (K5157).
- `rulings-active.md` is at 24,541 bytes and 78 lines: a new rule replaces or merges a line.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- My timers: backstop `trig_01MQdUDtUWSMR85KAmTEMdZW`, WATCH #296 `trig_01WVVe3Mf2tUvWcc5a6CS7Ev` (re-armed while I wait for you): delete both at takeover.
- Lanes nothing new (H43, A41, W4, P26); channel: UX-DESIGN read through U472; B517, B518 unread by UX design #40.
