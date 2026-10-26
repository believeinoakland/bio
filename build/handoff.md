# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #306 (`session_012j4sSKRN7JSLAcw57aPXNB`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #307, 2026-10-26 ~05:20Z, at 57 % of its window (`get_session` read 25 % until 05:16Z, then 566,426: the earlier figure was stale). **T51 is OPEN** on `tranche/T51`; fix round 10 runs. Read rulings K5232-K5253 whole and `build/plan/fix-round-10-T51.md` items 112-127 whole.

## Bob's rulings in force for this round (in `rulings-active.md`)

- **K5175 (governs everything):** "this round must be the last one before the final round that must be the alpha release ... No guessing. No deferrals. No assumptions." Every owed item is a job the day it is found.
- K5171: no cap on concurrent jobs. K5167: refresh past 40 %. K5183: the work runs on the primary account. K4966/K4787: a red seen under load is reproduced to its cause, never cleared by a later pass. K4849: a worker's or job's "probable" is never adopted.

## Open with Bob

Nothing.

## First

1. Take over (§5.1). My timers: backstop `trig_01SGF4j5Ktz3VMh8hDVPTgKr` (05:36Z), WATCH #306 `trig_01TshEL6o2idrLPGV2wNGmbs` (06:16Z into ROOT #7); delete both. Archive BOB #306 once idle; write its `BOB-final` row under T51.
2. `mail check` (filter: `grep -v "pushed [0-9]\{3,\} min ago" | grep -v "→ nothing"`). Read every entry whole before acting (K3588). Merge only when the record's cursor is at BOB's newest (K5171). Premerge as I ran it: ownership against `git merge-base` (one merge base), then fixtures (`--list`), architecture and words on a worktree of the job branch (`git worktree add --detach <scratch>/wt-<m> origin/job/T51/<m>`, `bio-plane/node_modules` symlinked, `git worktree remove --force` after), then architecture and words on the merged tree; `rows.mjs` regenerated (`node bio-plane/src/setup-words/build.mjs`) when a merge adds `localize` keys. A `uses` gap a job names is BOB's edit of `build/modules.json`, checked with `node bio-plane/src/member-roster/order-build.mjs --check`.
3. A job whose session reads idle past its RUNNING window: `get_session` first; a live turn is not restarted (K506).

## Running jobs (primary account; addresses in the plan's Jobs line)

- **PLANE #64** (B115/K5248): whoami's assertion follows the owed-work rule through a same-run ledger read; the heal-firing-read sequence reproduced on the real `Scheduler` (storage double, pinned clock); 30 runs under 4 loops. Its owedwork fix is pushed (10 of 10); B108, B109, B113 done. A red cause in `scheduler` is placed with that module's owner.
- **SCREENS-INQUIRY #33** (B86, K5245): its 138 fixtures lines on store-request's recipes, four workers; a state no act makes removed, test only; then merged (R50 struck at merge; B83/B85 done).
- **AGENT-WORKER #32** (K5245): mutation controls on temporary copies, a killed run leaves `git status` clean (cause of the foreign files every job saw).
- **STORE-REQUEST #8** (K5251): four recipes (rendered capture, unfinished capture with files outstanding, address capture in parts, reading after promote); at its merge a new SCREENS-INTAKE session restores SCREENS-INTAKE #28 J60 (c)'s removed cases.
- **CONTROL-PLANE #66** (K5251): `r8-seam-capture.mjs:195` G109 under 4 loops to its timing cause, 10 of 10.
- **SCREENS-INVESTIGATE #21** (K5252, restart of #20): a 404 `acquire` ends `money.test.mjs` silently after 4 of 15; its cause; all 15 run.

## Then (each the day its dependency merges)

1. UX-DESIGN's `dash-action` row on the tranche (HANDOFF B527, unread by them): new SCREENS-ACTION session removes the `taskresolve` arm and its test (R30, item 119).
2. Words to UX-DESIGN: one HANDOFF of `fix-round-10-words.md` whole when the jobs have merged.
3. The round end (items 100 (4), 101 (4)(j)): the §5.10 pass (marker re-points to `store-assembly`: `job-registrar`, `keep-later`, `owed-later`, `owed-ledger`, `reading-ended`, `transcribe-not-sent`, `transcribe-answer`; the `OWNER_MAP_DECLARED_OPS` to `DECLARED_OPS` rename in store-assembly and control-plane's tests; store-assembly `r10-fixtures-run.test.mjs:23`, `:27`, `:29` orphan runs removed; test-support's registrar stub, items 6, 15; item 33's "group" stand-ins), every artifact regenerated in the manifest's order, the full suite run alone, 32 (promotion's stamp, last), K5063's step 4 (redeploy biosmoke8, capture R113's platform check L, re-walk, final pass, the 0.87.0 cut, installer and site deploys, the rehearsal), journey-check's R21 after the cut, T51's close (§5.7).

## Tools

- Mail tool and checks: civicos-process `main` (`8be32ff`), `--product /home/user/bio --tranche T51`. START template: `build/plan/starts-T51-F10/screens-publish-k5219.txt` (sed the name, item, depth line, module; append "Your job:" and the template's `**Done:**` line); every START now says never `git commit -a` (K5245). Model: haiku for row/test-only, sonnet otherwise.
- `rulings-active.md` 78 lines, 24,594 bytes (NEAR): a new rule replaces a line. `fix-round-10-T51.md` 48.5 KB of 51.2 KB: move finished items whole to `build/plan/archive/fix-round-10-T51-done-items.md` before a placement passes it (§17).
- A stale test is BOB's to fix, test files only, its suite green (K4297 (2)); done at K5240 and K5241.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded. Design commits of design files only are merged into the tranche when the design asks (U476, U477; K5224).
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137).
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.
- A delete of a routine into ROOT was refused by auto mode once (K5219): not retried; the WATCH above was created by me and is deleted by its id.

## Timers and lanes

- Lanes nothing new (H43, A41, W4, P27). Channel: read through U477; B527 (HANDOFF, `dash-action`) unread by UX-DESIGN.
