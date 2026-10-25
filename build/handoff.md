# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #302 (`session_01WJsZWkoGCJqWG6874AF7LK`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #303, 2026-10-25 ~22:45Z, at 51 % of its window (Bob's reading). **T51 is OPEN** on `tranche/T51`; fix round 10 runs. Read rulings K5195 to the last line of `build/rulings.md` whole, and `build/plan/fix-round-10-T51.md` whole (items 95-98 are the live placements; 87-94 earlier).

## Bob's rulings in force for this round (in `rulings-active.md`)

- **K5175 (governs everything):** "this round must be the last one before the final round that must be the alpha release ... No guessing. No deferrals. No assumptions." Every owed item is a job the day it is found.
- K5171: no cap on concurrent jobs. K5167: refresh past 40 % by `get_session` (it read 0 all session; Bob told me 51 %). K5183: the work runs on the primary account; the third account's sessions are unreachable.

## Open with Bob

Nothing. Jobs keep labelling `uses` edges, test reds and op-grades rules "needs Bob": they are BOB's (P17, K2008); answer them as done.

## First

1. Take over (§5.1). My timers (primary account): backstop `trig_01FTTsqM8BkaiCwK3haxjD7Z` (22:42Z, may have fired), WATCH #302 `trig_01CpU942W6tQCb8jcLfqy6ya` (23:40Z into ROOT #7). Archive BOB #302 once idle; write its `BOB-final` row under T51. Sessions archived by me have rows already (K5195-K5199).
2. Item 98: (1) screens-daily's Count test still red after calculations R52 merged: diagnose before placing; (2) CHANGE to CREDENTIALS #29 (ai-accounts merged); (3) ANSWER RATIFICATION #39 J26 (COMPLETE with the chain red by name until public-read); (4) SCREENS-INVESTIGATE #17 must read B40.
3. Run `mail check` (2 minutes, in the background) and read every READ entry. Many jobs started at K5196/K5198 will have COMPLETEd: premerge and merge each.

## Running jobs (primary account; addresses in the plan's Jobs line)

PLANE #63 (Wave B; B95-B101: R85 `g123f-cells`, `door.test.mjs:143` 37 routes, `r9-jobs` not exiting, the transcribe and notice-producers `fixtures-run`s), STANDARDS #21, SCREENS-INQUIRY #31 (B63-B69: R123, R129, R137, `publishedcase` by `id`), SCREENS-INVESTIGATE #17 (B40), SCREENS-SETTINGS #20 (B50: pins R68 selftest and R5/R76 by commit), SCREENS-DAILY #24 (Count), CASE-AUTHORING #46 (waits: R31 chain after ratification merges, then R87 merge; then public-read R45, then screens-publish), RATIFICATION #39, PUBLIC-READ #37 (B36: assembly to 4 hops) with INSTANCE-SETUP #37 (coupled, merge together), RETRIEVAL-BROWSE #9 (B17 orphan run), NOTICE-PRODUCERS #19 (B11: marker; merged already, R29 marked), PUBLISH-SCHEDULE #6 (waits OP-GRADES #29, then re-apply `42d3fc15ca`), LAW-RELATIONS #4 (B4: edge added), CREDENTIALS #29, BUNDLER #31 (COMPLETE with `fleetbundles` red by name), READING-PIPELINE #39 (R49), STORE-REQUEST #6 (door case, older-installation recipe, screens-intake states, B16 reviewcopy stamp and recipes), MEMBERSHIP #46 (R156), OP-GRADES #29 (R54), HYPOTHESES #11, CASE-IMPORT #20, LINK-SWEEP #11, CONFORMANCE #28 (publish fixtures; users re-point after), MONEY #11, JURISDICTIONS #19 (fiscal years, sourced), SCREENS-ACTION #21 (`publishedcase` by `id`).

## Then, as each merges (each a CHANGE or a new session the same day)

1. **OP-GRADES #29** merged: CHANGE PUBLISH-SCHEDULE #6 (re-apply R12) and RATIFICATION (R53's `publishat` registers).
2. **PUBLIC-READ #37** merged (with INSTANCE-SETUP #37): RATIFICATION re-runs the chain; R60 struck when it reads 11; then CASE-AUTHORING #46's R31 chain CHANGE (case-catalogue, publication merged; ratification R61).
3. **HYPOTHESES #11, CASE-IMPORT #20, LINK-SWEEP #11, CONFORMANCE #28** merged: CHANGEs to screens-inquiry (hypotheses, case-import lines), screens-publish (case-import, case-inputs' casedetails), control-plane (`r49-routes.test.mjs:131`, `:143`, new session), screens-intake (SCREENS-INTAKE #28 with STORE-REQUEST #6's recipes: its 23 lines and link-sweep's three), actions (t45:41, t50:27, new session).
4. **STORE-REQUEST #6** merged: CHANGEs to SCREENS-SETTINGS (R58, R69 to the older-installation recipe), SCREENS-INTAKE #28, SCREENS-DAILY, SCREENS-INVESTIGATE (the recipes they asked).
5. **PLANE #63** merged: the store-assembly job (item 90 (3), with item 96 (3): `aiUseOf(ctx, {env, now})`, `aiUseOps(..., env)` at `assemble.mjs:288`, `:841`); CHANGE CONTROL-PLANE (new session) to delete `owner-ops.mjs`; re-point the following and answer-envelope walks (80 (1)); regenerate `rows.mjs` (its build refuses today on `plane.declared.readtranslate`'s two sentences) and every artifact in the manifest's order; then the `test.todo`s waiting on rows (screens-investigate's 43, screens-inquiry R137's, screens-intake's held keys, screens-entry R2's two) become tests.
6. Words to UX-DESIGN: B525 sent (SIGN_IN_PAUSED, office note); the round's one words HANDOFF (`fix-round-10-words.md` whole) when the jobs have merged.
7. In the window when the round's jobs have merged: the §5.10 pass (items 33, 6, 15, the reading-pipeline/extraction `transcribe` markers, screens-wizards' dead `{group: null}`), then 32 (promotion's stamp, last); K5063's step 4 (redeploy biosmoke8, targeted re-walk, final pass live, the 0.87.0 cut, installer and site deploys, the rehearsal), journey-check's R21 reach functions after the cut (item 94); T51's close (§5.7), where `build/channels.md`'s `BOB` row moves to the primary account (K4790).

## Tools

- Mail tool and checks: civicos-process `main` (`cf957b7`), `--product /home/user/bio --tranche T51`. `mail check` takes about 2-6 minutes. Trigger creation is rate limited to about ten a minute. `addjob --name` takes the name with its space.
- START template: `build/plan/starts-T51-F10/calculations-k5195.txt` (generic body; only "Your job:" differs). Never generate a START over an existing file name.
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR). `fix-round-10-T51.md` about 46 KB of 51.2 KB: move finished items to `archive/fix-round-10-T51-done-items.md` at the next placement.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- Lanes nothing new (H43, A41, W4, P26). Channel: UX-DESIGN read through U476 (DEC-435 merged, ACK B524); B525 HANDOFF (two rows) unread by them.
