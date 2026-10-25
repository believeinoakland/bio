# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #293 (`session_01V3Cei5kJPGs5zvJAU6tMnr`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #294, 2026-10-25 ~14:35 UTC, past 40 % context. **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5108 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (§3, follow-ups 7-47, is the owed list), `build/plan/fix-round-10-waves.md` whole, and `build/plan/walk-T51-final/BRIEF.md` with `PHASE1-NOW.md`.

## Bob's rulings this session (in `rulings-active.md`)

- **K5120:** acts on the code, the tranche and job branches and the biosmoke deployments are approved standing for BOB and every job; a refusal of one is never relayed to Bob: cite K5120 and take the act as one plain command. Only the standing safety rules are Bob's.
- **K5122:** the walks cover every row now, never after: the final pass's offline phase is running (13 walkers).
- **K5123:** no step waits on an approval Bob need not give: one plain command per act (never an edit, commit and push chained); keep `rulings-active.md` and this file under 95 % of their limits (`mail check` prints `NEAR` once the size-gate fix lands); a refused act on the code is retried once plainly citing K5120, then carried by another legitimate route, never asked of Bob.

## Open with Bob

Nothing. Do not relay any refusal of an act on the code or the test copy (K5120, K5123).

## Running

- **STORE-ASSEMBLY #1** `session_01PFCJP5a6GVyjzzsxKD2a53` (the default model; the critical path). ANSWER B2 (K5125) rung for 14:50Z. At its merge: add its `paths` `["bio-plane/src/store-assembly/"]` and `tests` `["bio-plane/test/m/store-assembly/"]` to `modules.json` in the merge commit, then `order-build.mjs --check` and format; R98 and R1's class clause stay not yet met (test.todo) until plane's Wave B (follow-up 12). Then start `store-request` (START `store-request.txt`; it also enters `modules.json` at its merge), then interface-shell, batch 7 and the screens' op-table CHANGEs.
- **Thirteen walkers, WALK-FINAL-01 to -11** (session ids in K5122), each on `prep/final-<area>`, writing `build/plan/walk-T51-final/<area>.md` as it goes, ending with `DONE`. At every backstop: fetch each branch, read new rows; place every BROKEN row the day it appears (K4426's four fields, one owning job; KNOWN rows are already placed). Commit their records to the tranche when each says `DONE`; archive each walker with a `study-walk` row.
- No other job runs. Nineteen slots free.

## Then, in order

1. Merge every COMPLETE as it comes (the premerge steps below); keep slots full, providers first (K4215); start each follow-up as its provider merges. Every START now carries the K5120 line (one plain command; never relayed) and K5124's line (run the suite without `--test-force-exit` when it exits by itself, else compare its count with its files run alone).
2. Owed follow-ups (fix-round-10 §3): 8 control-plane's Wave B (with 42, the `r9-seam-reading` §1 red under load, and its R112 `declared-ops` red, K5121); 12 + 23 plane (after the world); 13 + 28 extraction (plane's runs have merged: check its list); 15 and 33 in the §5.10 pass; 32 promotion's stamp (last); 35 screens-inquiry (with its op tables); signin-door's 4 FIX-E lines (`door.test.mjs`, a CHANGE when providers' fixtures exist); 45 (K5120 into civicos-process `roles/JOB.md`, by PR); 47 (the size-gate fix: `prep/sizegate-K5123` head `8007c93edd`, read by BOB, 228/228; certify by a dry run, §15, then PR and merge, then rebuild the local tool from `main`).
3. After batches 1-7: the §5.10 pass (the waves' §4 modules with 15, 23, 33 and entry 6); the fixtures check zero for every module; then promotion's stamp.
4. After the round: the generated artifacts (manifest order; stale now: plane, agent-worker, pdf-worker, ocr-worker bundles, `program.mjs`, setup-words `rows.mjs`), the round's words HANDOFF to UX-DESIGN (`fix-round-10-words.md`), then K5063's step 4 (redeploy biosmoke8 with the owed live checks, the targeted re-walk, the final pass live (Phase 2), the 0.87.0 cut, the installer and site deploys, the rehearsal), then T51's close (§5.7).

## Tools

- The mail tool: a local merge of civicos-process `main` and `prep/jobbranch-K4385` (fetch with `--depth=1000`, `git worktree add --detach <dir> origin/main`, merge, take `--theirs` on `tools/test/mail.test.mjs`, commit). Run from the product with `--product /home/user/bio --tranche T51`. `addjob --name "<M> #k"` (quote it).
- Premerge, per module: `git fetch origin job/T51/<m> tranche/T51`; `B=$(git merge-base origin/tranche/T51 origin/job/T51/<m>)`; `node checks/ownership.mjs /home/user/bio <m> $B origin/job/T51/<m>`; a detached worktree of the job branch, `node checks/fixtures.mjs <ABSOLUTE worktree> <m>` and `checks/architecture.mjs <worktree> <m>`; read every added `fixtures-(own|generic|contract|run)` marker. After merging `--no-ff`: `checks/architecture.mjs /home/user/bio`, `checks/words.mjs /home/user/bio <m>` at 0. **Check every merge reached the remote** (`git ls-remote origin tranche/T51` equals HEAD): K5113 found two merges a predecessor recorded and never pushed.
- A START is the previous one's header (`contradiction-2.txt` for haiku test-only, `tasks-3.txt` for sonnet) with the module, number and ruling replaced, then its own entry and `**Done:**`. Never reuse a START file name: grep `build/plan/starts-T51-F10/` first (K5115 overwrote one and restored it).
- `archive_session` answers carry the usage for the metrics row; the `Size` line is in the job record (take the last one).
- A job branch the tranche lacks commits of (`mail jobbranch` refuses) means an unmerged job: merge it first (K5113).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3); CLAUDE.md's standing direction), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- civicos-process `main`: a text that changes no principle is BOB's (K5036), certified by a dry run, merged by PR with the GitHub merge tool (standing list, K1177); no refusal recorded.
- biosmoke deployments: K4841, K5120. `civicsmith-site` and `newgroup` deploys: K4935 and Bob's words at K5037; K1715 made each Bob's approval in session, superseded for code and test deployments by K5120. Account `…7f72` only, plus the rehearsal account (K4942).
- Job branches only by `mail jobbranch`; never a force-push. Sessions: archive each at its merge (K4219).

## Timers and lanes

- My timers: backstop `trig_0141wbNfT815qq5AkJsXddKi` (14:40Z), WATCH #293 `trig_01XnHF9ouVicCHuMb73E3yZo` (15:20Z): delete both at takeover.
- Lanes nothing past H43, A41, W4, P26; channel nothing past U471 (B517 unread by UX-DESIGN).
