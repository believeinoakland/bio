# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #305 (`session_01SvXLDCv6K1oZMVKyqhK5Da`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #306, 2026-10-26 ~02:05Z, at 44 % of its window (`get_session`'s `used_tokens` now reads; it read 0 most of the session). **T51 is OPEN** on `tranche/T51`; fix round 10 runs. Read rulings K5219-K5230 whole and `build/plan/fix-round-10-T51.md` items 102-112 whole (112 is the latest placements).

## Bob's rulings in force for this round (in `rulings-active.md`)

- **K5175 (governs everything):** "this round must be the last one before the final round that must be the alpha release ... No guessing. No deferrals. No assumptions." Every owed item is a job the day it is found.
- K5171: no cap on concurrent jobs. K5167: refresh past 40 %. K5183: the work runs on the primary account.

## Open with Bob

Nothing. Bob asked (01:3xZ) where the round stands on requirements and how close the run-throughs are; answered in chat: 31 ids not yet met in 13 modules (journey-check 7, plane 6, control-plane 5, installer-steps 2, screens-inquiry 2, screens-investigate 2, then one each), the fixtures check 320 lines; the run-throughs follow the store-request recipes' merge, the screens re-points and the round end. Since then R30 and R32 of screens-action were marked not yet met (K5229). Bob also pointed at PLANE's question (K5221: no quarantine; it diagnoses its load red).

## First

1. Take over (§5.1). My timers: backstop `trig_01CQGBvrK5LChQLWfXSso7Ne` (02:25Z), WATCH #305 `trig_01K9SKRPNo4Ur3x8fw5VEmRq` (03:05Z into ROOT #7); delete both. BOB #304's WATCH `trig_01XG5cX96wa3tGFYucDW28ni`: its delete was refused by auto mode (K5219) and it has fired (01:20Z, harmless). Archive BOB #305 once idle; write its `BOB-final` row under T51.
2. `mail check` (filter: `grep -v "pushed [0-9]\{3,\} min ago"` hides the long-archived rows of earlier rounds, all RINGs into archived sessions; INVESTIGATION #4 is the secondary account's, left, K5063). Read every entry whole before acting (K3588). Merge only when the record's cursor is at BOB's newest (K5171). Premerge as I ran it: ownership against `git merge-base`, one merge base, then fixtures (`--list`), architecture and words on a worktree of the job branch (`node_modules` symlinked), then architecture and words on the merged tree; regenerate `rows.mjs` (`node bio-plane/src/setup-words/build.mjs`) whenever a merge adds `localize` keys, after checking every module whose words change has merged (K5224: credentials would throw on a row without its code).
3. A `uses` gap a job names is BOB's edit of `build/modules.json` (K2008), `order.mjs` checked with `node bio-plane/src/member-roster/order-build.mjs --check`; nine such edges were added this session (K5220-K5230).

## Running jobs (primary account; addresses in the plan's Jobs line)

PLANE #64 (B106: `r8-heal-door` G93's timing cause under load, no quarantine; B107 merge; B108 `t42`/`t46` shrink), INTERFACE-SHELL #24 (B52 frame answers; B53 its three tip reds R30, R5 `publishedcase`, R81 to be named with owners; B54 merge; B55 `settle()` counts forwarded calls), CONTROL-PLANE #65 (START B102: delete `owner-ops.mjs` (store-assembly R98), item 99 (2)'s list, 101 (4)(d), its reds; B103 three more reds), STORE-REQUEST #7 (B18: four recipes and screens-inquiry's states), EXTRACTION #48 (B64: 12 lines, `readHeldAnswer.failed()`, a `NO_PROGRESS` final), SCREENS-ACTION #22 (B43 START; B44 R30/R32 worded; B45: wait on UX-DESIGN's `dash-action` row and ACTION-HOLDS #10), SCREENS-SETTINGS #22 (B56: two `translationdraft` lines; held open for R58, R69 at STORE-REQUEST #7's merge), SCREENS-INQUIRY #33 (B80: `r10-stated` A7, A8; its 140 lines at STORE-REQUEST #7's merge), ACTION-HOLDS #10 (B8: release/preview/list of a hold placed from a docket mark or pressure record; its QUESTION proposes R5, R6, R16's wording, BOB's to word), SCREENS-PUBLISH #25 (B56: its last four lines).

## Then (each the day its dependency merges)

1. STORE-REQUEST #7 merged: CHANGEs to SCREENS-SETTINGS #22 (R58, R69's control and group), SCREENS-INQUIRY #33 (its 140 lines), and new SCREENS-INTAKE, SCREENS-DAILY, SCREENS-INVESTIGATE sessions for their recipe re-points (item 109 (3)).
2. CONTROL-PLANE #65 merged: a STORE-ASSEMBLY session renames `OWNER_MAP_DECLARED_OPS` to `DECLARED_OPS` and meets R98.
3. EXTRACTION #48 merged: CHANGE (new session) to STORE-ASSEMBLY for `r9-jobs.test.mjs:313`'s `readHeldAnswer.failed()`; PLANE takes the `NO_PROGRESS` final.
4. ACTION-HOLDS #10's QUESTION: word R5, R6, R16 (BOB's, P17), then CHANGE SCREENS-ACTION #22 at its merge. UX-DESIGN's answer to HANDOFF B527 (`dash-action` row): merge its commit into the tranche when design files only (as U476, U477, K5224), then CHANGE SCREENS-ACTION #22.
5. Not yet placed, place them now: installer-steps R26, R31; screens-investigate R8, R33; capture R113 (marks not yet met, no running job; read each requirement and its record); case-authoring R87 still carries its mark though K5218 records it met: check the tests and strike or place; screens-inquiry R23, R50 (item 101 (4)(i), BOB checks against B63's tests); the fixtures check's 92 stubs in extraction, file-safety, monitoring, plane, screens-intake, test-support (`checks/fixtures.mjs /home/user/bio --list | grep " stub "`), each module's lines a job.
6. Words to UX-DESIGN: one HANDOFF of `fix-round-10-words.md` whole when the jobs have merged.
7. The round end (items 100 (4), 101 (4)(j)): the §5.10 pass (item 101 (4)(a)'s marker re-points to `store-assembly` and `plane`, items 33, 6, 15), every artifact regenerated in the manifest's order, the full suite run alone, 32 (promotion's stamp, last), K5063's step 4 (redeploy biosmoke8, re-walk, final pass, the 0.87.0 cut, installer and site deploys, the rehearsal), journey-check's R21 after the cut, T51's close (§5.7).

## Tools

- Mail tool and checks: civicos-process `main` (`8be32ff`), `--product /home/user/bio --tranche T51`. Trigger creation is rate limited (~10 a minute). START template: `build/plan/starts-T51-F10/screens-publish-k5219.txt` (only the name, the plan item and "Your job:" differ; models sonnet unless haiku is enough).
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR): a new rule replaces a line. `fix-round-10-T51.md` about 46 KB of 51.2 KB: prune items 98-101's done acts into the archive at the next placement that would pass it (§17).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded. Design commits of design files only are merged into the tranche when the design asks (U476, U477; K5224).
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.
- A delete of a routine into ROOT was refused by auto mode once (K5219): not retried.

## Timers and lanes

- Lanes nothing new (H43, A41, W4, P27). Channel: read through U477; B526 (ACK) and B527 (HANDOFF, `dash-action`) posted.
