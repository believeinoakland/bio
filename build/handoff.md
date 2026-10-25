# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #295 (`session_01JWNfzmdV269x2j31RNMndK`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #296, 2026-10-25, on Bob's "time to refresh" (about 40 % context). **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5146 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (§3, items 7-74, is the owed list; 69-74 are this session's), `build/plan/fix-round-10-waves.md` whole, and the three diagnoses not yet placed: `build/plan/walk-T51-final/diagnosis/diag2-03b.md`, `diag2-06.md`, `diag2-11.md` (each about 45 KB: read whole, or by a reading worker told the task, K3676).

## Bob's rulings this session

None new. K5136, K5137 and K5141 (BOB #294's) stand, in `rulings-active.md`.

## Open with Bob

Nothing.

## Running (addresses in the plan's Jobs line)

- STORE-ASSEMBLY #2 (follow-up 68, then CHANGE B6: `INSTANCE_NAME` in its world, K5149), JURISDICTIONS #18 (08 C1 BLOCKER and C14; researching sources), RETRIEVAL-BROWSE #7, PUBLIC-READ #36 (CHANGE B34: a document-level seal, K5153), QUEUE-PRODUCERS #28, INTERFACE-SHELL #22 (Wave B batch 6, `boot({door})`, the screens' batch 7 waits on it), CALCULATIONS #16 (07's four causes), AFFORDANCES #47 (`ruleservicesstate` unaccounted), DOORBELL #10 (65's half), walker WALK-FINAL-02 (`prep/final-02-people`; at DONE commit its record, archive with a `study-walk` row, diagnose its BROKEN rows).
- 11 slots free of 20 (K4215).

## Then, in order

1. **Place item 74**: the three diagnoses, with the readings K5155 already made (06 §3 option B; 06 §16 Enter). Read every cited line before placing (K4849). Then start, providers first: monitoring (06 §1 BLOCKER), retrieval (06 §2, §11), citation (06 §3, R2 worded), content (06 §5), acquisition (06 §9), connections (06 §12), project-roster (03b §1), strength (03b §8, the bar the writer saw), queue (03b §5), intent (03b §12), filings (11 §2b), consequences (11 §3), actions (11 §5), action-producers (11 §7b), store-request (11 §1, `publishcheck`'s author stamp, and control-plane's Wave B the same); CHANGEs to CALCULATIONS #16 (06 §8) and INTERFACE-SHELL #22 (06 §16, §19; 11 §9). Then the screens jobs, each with every screen cause of items 70, 73 and 74 (screens-inquiry, screens-daily, screens-investigate, screens-publish with 54, screens-action), after their providers merge; the STARTs are written with the generator pattern below.
2. Merge each COMPLETE as it comes (premerge below); keep slots full; archive each merged session with its row (K4219).
3. Owed still: control-plane Wave B (8, 42, 69, 71 (4), every door case listed in 72 (3) and 73 (6), K5138), plane Wave B (12, 23; credentials' six `credentialsOf(ctx)` sites, K5155), 13, 15 and 33 (the §5.10 pass, no job running), 32 (promotion's stamp, last), 35, the screens batch 7 after INTERFACE-SHELL #22, case-carriage's re-point to `uploadProvenance` (72 (2)), 72 (4)'s three reds diagnosed.
4. After the round: generated artifacts (manifest order; the plane bundle is stale from many merges), the words HANDOFF to UX-DESIGN (`fix-round-10-words.md`, whole, including its last sections and the design conflicts of item 74), then K5063's step 4 (redeploy biosmoke8 with the owed live checks, the targeted re-walk with item 70's re-walk asks, the final pass live, the 0.87.0 cut, installer and site deploys, the rehearsal), then T51's close (§5.7).

## Tools

- Mail tool and checks: civicos-process `main` (`e54912f5b9`) in a detached worktree (`git worktree add --detach <dir> origin/main`); `--product /home/user/bio --tranche T51`. `addjob --name` needs the name quoted with its space.
- Premerge, as plain commands (a looped compound with `rm -rf` was refused once this session and not retried): fetch the job branches; ownership against `git merge-base`; one fresh detached worktree per job (`/home/user/wt…-<module>`, never deleted in a loop); `checks/architecture.mjs` and `checks/fixtures.mjs` on it with the module; grep added `fixtures-(own|generic|contract|run)` markers; merge `--no-ff` in module order; architecture over the tree and `words.mjs <modules>`; strike the marks; `git ls-remote origin tranche/T51` equals HEAD. A job's own requirement lines are accepted (K4210).
- STARTs: `python3 build/plan/mkstart.py <jobs.json>` (each job `{m, n, item, tag, model?, bob?, body}`) (BOB #295's header: depth, K5120, FIRST block, the job rules, K5138's door rule, "each cause below" with its diagnosis section, Done); files `build/plan/starts-T51-F10/<module>-k<ruling>.txt`, never a reused name.
- `rulings-active.md` is at 24,312 bytes and 78 lines: a new rule replaces or merges a line.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- My timers: backstop `trig_011zwYBp7oZu1F5uVHAryRcA` (17:10Z), WATCH #295 `trig_01EGcofRZxY76jkXvbD1MEpp` (17:50Z): delete both at takeover.
- Lanes nothing new (H43, A41, W4, P26); channel: UX-DESIGN read through U472; B517, B518 unread by UX design #40.
