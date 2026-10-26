# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #304 (`session_01AnYAfLkcBeNLm6b2t6AWgR`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #305, 2026-10-26 ~00:30Z, at 57 % of its window (`get_session` now reports `used_tokens`; it read 0 at takeover, so BOB #304 refreshed late: read it at every backstop and merge, K3987). **T51 is OPEN** on `tranche/T51`; fix round 10 runs. Read rulings K5202-K5218 whole and `build/plan/fix-round-10-T51.md` items 98-101 whole (101 is this session's: the live placements).

## Bob's rulings in force for this round (in `rulings-active.md`)

- **K5175 (governs everything):** "this round must be the last one before the final round that must be the alpha release ... No guessing. No deferrals. No assumptions." Every owed item is a job the day it is found.
- K5171: no cap on concurrent jobs. K5167: refresh past 40 %. K5183: the work runs on the primary account.

## Open with Bob

Nothing. Every question this session met was BOB's (P17).

## First

1. Take over (§5.1). My timers: backstop `trig_01SuJn93A7QU4vke2pFoFU2X` (00:38Z), WATCH #304 `trig_01XG5cX96wa3tGFYucDW28ni` (01:20Z into ROOT #7); delete both. Archive BOB #304 once idle; write its `BOB-final` row under T51.
2. Run `mail check`; **read every entry whole before acting** (K3588; I merged ACQUISITION #43 once on a filtered read and had to place its questions after, K5215). COMPLETEs waiting now: INSTANCE-SETUP #38 J30 (`groupIdentityAnswer()`), RATIFICATION #40 J33 (`publishat` through `localize`), CREDENTIALS #31 J29 (`signout`). Merge only when the record's cursor is at BOB's newest (K5171); premerge = ownership vs tranche, one merge base, `checks/fixtures.mjs`, `architecture.mjs`, `words.mjs` on a worktree of the job branch, then architecture and words on the merged tree (grep "failure", singular too).
3. On each provider's merge, CHANGE its users (the plan names them): instance-setup, translations, queue, credentials → INTERFACE-SHELL #24 (R24 and ten frame tests, K5217); hypotheses → SCREENS-INQUIRY #32 (`fixtures.mjs:106`); case-import #22's `citeimported` → screens-inquiry and the coming screens-publish session; review, capture, case-authoring, public-read, case-inputs, credentials, sources, citation, wizard-scripts, action-holds, case-import → one new SCREENS-PUBLISH session for its 35 lines and K5212's `writinghelp` cases (item 101 (4)(i3), (i4)).

## Running jobs (primary account; addresses in the plan's Jobs line)

STORE-ASSEMBLY #4 (B11-B16: clocks, unref, world options, `releaseKeys`, agreement test of its three rows, R83's window, its 15 words), MEMBERSHIP #46 (B12: `Members` takes its clock), SCREENS-SETTINGS #20 (B54 RESUME), PLANE #64 (B103-B105), INTERFACE-SHELL #24 (waits on its four providers), SCREENS-INQUIRY #32 (B74), REVIEW #29 (rung; unread B23), ACQUISITION #44 (R124, B55), HYPOTHESES #12, TRANSLATIONS #6, QUEUE #39, CASE-IMPORT #22, SITE #4 (J5 waiting). Check: `job/T51/basis-version-grammar` is unmerged 11 h with no job in the plan (read its record; merge, restart or note).

## Then (each the day its dependency merges)

1. STORE-ASSEMBLY #4 merged: CONTROL-PLANE (delete `owner-ops.mjs`; item 99 (2)'s list and 101 (4)(d)'s additions), STORE-REQUEST recipes (item 101 (4)(e)), PLANE's `t42`/`t46` shrink, EXTRACTION (item 101 (4)(g): its 12 lines, `readHeldAnswer.failed()`, `NO_PROGRESS`), then SCREENS-SETTINGS R58/R69, SCREENS-INTAKE, SCREENS-DAILY, SCREENS-INVESTIGATE recipes; SCREENS-ACTION (item 100 (2), with K5212's `writinghelp` lines).
2. Words to UX-DESIGN: one HANDOFF of `fix-round-10-words.md` whole (K5202's rows included) when the jobs have merged. They have not read B524-B525.
3. The round end (item 100 (4), 101 (4)(j)): the §5.10 pass (item 101 (4)(a)'s marker re-points to `store-assembly` and `plane`, items 33, 6, 15), every artifact regenerated in the manifest's order, the full suite run alone (it names the owners of the consumer reds publish-schedule J10 and filings saw), 32 (promotion's stamp, last), K5063's step 4 (redeploy biosmoke8, re-walk, final pass, the 0.87.0 cut, installer and site deploys, the rehearsal), journey-check's R21 after the cut, T51's close (§5.7).

## Tools

- Mail tool and checks: civicos-process `main` (`8be32ff`, with PR #9's fixtures envelope rule, K5207), `--product /home/user/bio --tranche T51`. Trigger creation is rate limited (~10 a minute). START template: `build/plan/starts-T51-F10/calculations-k5195.txt` (only "Your job:" differs).
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR): a new rule replaces a line. `fix-round-10-T51.md` ~41 KB of 51.2 KB.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137); PR #9 merged so at K5207.
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- Lanes nothing new (H43, A41, W4, P27). Channel: UX-DESIGN read through U476; B524, B525 unread by them.
