# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #303 (`session_01DVM2PvavUWQD9RhBRZoyCz`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #304, 2026-10-25 ~23:20Z, at about 40 % of its window (BOB's estimate; `get_session` reads 0, K5167). **T51 is OPEN** on `tranche/T51`; fix round 10 runs. Read rulings K5200 and K5201 whole, and `build/plan/fix-round-10-T51.md` items 98-100 whole (the live placements).

## Bob's rulings in force for this round (in `rulings-active.md`)

- **K5175 (governs everything):** "this round must be the last one before the final round that must be the alpha release ... No guessing. No deferrals. No assumptions." Every owed item is a job the day it is found.
- K5171: no cap on concurrent jobs. K5167: refresh past 40 % (`get_session` reads 0 all session: estimate from your own turns). K5183: the work runs on the primary account; third-account sessions are unreachable (STORE-ASSEMBLY #3 was one: archive refused "not found", skip it).

## Open with Bob

Nothing. Labels "needs Bob" on chain bars, `uses` edges, test reds, dead arms: BOB's (P17, K2008).

## First

1. Take over (§5.1). My timers: backstop `trig_012MCM4h81V1DMgofofEGDy4` (23:05Z, fired) and a new one I arm at handoff (named in K5201's push line below, if any); WATCH #303 `trig_01N6XWnhQgzZ5wQ681XhHgfE` (23:45Z into ROOT #7). Archive BOB #303 once idle; write its `BOB-final` row under T51.
2. **Prune `fix-round-10-T51.md`** (48 KB of 51.2 KB): move finished items 87-97 whole to `archive/fix-round-10-T51-done-items.md` after checking each is done or carried by items 98-100.
3. Run `mail check` and read every READ entry; premerge and merge each COMPLETE (my premerge script: ownership against the tranche, `checks/fixtures.mjs` on a worktree of the job branch; when ownership fails on many files, check `git merge-base --all`: a criss-cross base, read the job's own commits).
4. Place item 100 (2)'s new sessions the day each dependency merges: PLANE, NOTICE-PRODUCERS, READING-PIPELINE, FILINGS now; STORE-REQUEST, CONTROL-PLANE after STORE-ASSEMBLY #4; SCREENS-ACTION after store-request; RETRIEVAL, CONNECTIONS with BOB's wording first (R63, R44); screens-action R32, R30 worded by BOB first. START template: `build/plan/starts-T51-F10/calculations-k5195.txt` (generic; only "Your job:" differs); never over an existing file name.

## Running jobs (primary account; addresses in the plan's Jobs line)

STORE-ASSEMBLY #4 (just started: the composition's clocks, unref, world options), RATIFICATION #39 (B26), PUBLISH-SCHEDULE #6 (B8), SCREENS-INVESTIGATE #17 (B41), SCREENS-ACTION #21 (B42: merge, no code), SCREENS-SETTINGS #20 (B51), SCREENS-DAILY #24 (B46: Count reads `results.output`), MEMBERSHIP #46 (B11 RESUME), CASE-IMPORT #20, STANDARDS #21, ACTIONS #27, INQUIRY #31 (B15, B16), CASE-AUTHORING #46 (waits: R31 chain, then R87), SITE #4 (J5 waiting), SCREENS-PUBLISH #22 and SCREENS-WIZARDS #7 (saved, K5183).

## Then (each the day its dependency merges)

1. PUBLIC-READ merged: CASE-AUTHORING #46's R31 chain CHANGE (case-catalogue, publication merged; ratification R61 once ratification merges).
2. CASE-IMPORT #20 merged: screens-inquiry, screens-publish re-point to its fixtures; control-plane's lines.
3. STORE-ASSEMBLY #4 merged: CONTROL-PLANE (delete `owner-ops.mjs`; item 99 (2)'s list), STORE-REQUEST recipes, then SCREENS-SETTINGS R58/R69, SCREENS-INTAKE #28, SCREENS-DAILY, SCREENS-INVESTIGATE recipes; regenerate every artifact in the manifest's order; the `test.todo`s waiting on rows (screens-investigate's 43, screens-inquiry R137's, screens-intake's held keys, screens-entry R2's two) become tests.
4. Words to UX-DESIGN: the round's one words HANDOFF (`fix-round-10-words.md` whole, plus Explore's leads question (99 (8)) and dash-action's `taskresolve` label (K5201 A2)) when the jobs have merged. They have not read B524-B525.
5. In the window when the round's jobs have merged: the §5.10 pass (items 33, 6, 15, the `transcribe` markers, screens-wizards' dead `{group: null}`), then 32 (promotion's stamp, last); K5063's step 4 (redeploy biosmoke8, targeted re-walk, final pass live, the 0.87.0 cut, installer and site deploys, the rehearsal); journey-check's R21 reach functions after the cut (item 94); T51's close (§5.7), where `build/channels.md`'s `BOB` row moves to the primary account (K4790).

## Tools

- Mail tool and checks: civicos-process `main` (`cf957b7`), `--product /home/user/bio --tranche T51`. `mail check` 2-6 minutes. Trigger creation is rate limited (~10 a minute). A new session created with only the bio source reads JOB.md by attaching civicos-process itself.
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR): a new rule replaces a line.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.
- Two doorbells into BOB #302 (`trig_01JVFqi5jFY6QNbzxEL3hu9A`, `trig_01FdyaJntfgrKSzz24EUitfh`) were refused delete by auto mode: skipped (§5.1 (5)), never retried.

## Timers and lanes

- Lanes nothing new (H43, A41, W4, P26 → P27 onward empty). Channel: UX-DESIGN read through U476; B524, B525 unread by them.
