# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #284 (`session_01RLobC6fNNmfG9HpTbZ9dyT`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #285, 2026-10-25 ~00:52 UTC, at 39 % context (`get_session`). **T51 is OPEN** on `tranche/T51`. Read rulings K5004 to the last line of `build/rulings.md` whole: they carry Bob's three directions of this session.

## Bob's direction this session (rulings K5006, K5012)

- **P19, no waiting:** "the next fix round" is not a reason (K5006, line in `rulings-active.md` §1). Every item with no P19 reason starts now as a job, session or worker (K5006-K5011 did so).
- **No scanning; the document set within its limits** (Bob, K5012): `rulings-active.md` at most 80 lines and 25 KB; every working document under `build/plan/` at most 50 KB, finished material moved whole to `build/plan/archive/`. BOB #284 scanned `next.md` (cut at 400 characters) and told Bob; it was then read whole.
- **Open with Bob (his decision, asked; P17):** one question, options A/B/C. **A (recommended):** a reading-set tool that fails when any document a session must read is over its limit, run by ROOT before it starts a successor (refusing the start), by the new BOB at takeover and by the format check; a scan-guard hook (Claude Code PreToolUse) that blocks a partial read of a reading-set or plan document and locks the session to prune-and-hand-off only (Bob registers it in `.claude/settings.json`, K1091); the deferral check (every deferral in `build/` names a P19 reason); and a mechanics rule that every new rule names its enforcing check or tool. **B:** the gates without the hook. **C:** as today. On A or B: build on a civicos-process prep branch, render the exact mechanics text and settings lines to Bob (K1258), dry-run (P3). The `fixtures` check's text (K4993) goes to him with it: `prep/fixtures-check-K4996` @ `099940688823`, draft `checks/fixtures-mechanics-draft.md`, 1,368 candidates, about 80 % real (four further tightenings proposed in its README).

## Do first, in order

1. Take over (§5.1): Status line; archive BOB #284 (row `BOB-final`); delete its backstop (`list_triggers`) and WATCH #284 `trig_01SXrzY4qSHaPAbR8qzUJaZG`; arm yours.
2. **The cleanup (K5012), before anything else:** (a) `prep/prune-rulings-active`: the pruned `rulings-active.md` and its dropped list; read both whole, check every dropped line is stated in BOB.md/the mechanics, no longer in force, or merged; then merge. (b) `prep/split-plans`: `current.md`, `fix-round-9-T51.md`, `k4426-check-T51-F9.md` split, moved text moved whole; check `mail check` still parses addresses and `checks/run.mjs` format 0; merge. If either branch is absent, the worker died: redo it with a worker (sonnet, high), its brief in K5012.
3. Merge jobs as they complete (§5.5), each merge ruling with its context figure.

## Running (each in `mail check` or its own branch)

- Jobs: **ACQUISITION #39** (job 103 merged; its B47 CHANGE, G154 (4) at workerd, open); **OFFICE-READERS #19** (job 105: G178 R46, G185 R47); **CALCULATIONS #13** (job 109: R47-R50); **ODF-READER #11** (job 111: R56).
- Sessions (K5009), each writing its results file on its branch; read it whole, merge its test files (K4297 (2)), place each product finding as a cause with a job: **LOAD-REDS #2** `prep/load-reds-2`; **VERIFY #1** `prep/verify-1`; **CORPUS #1** `prep/corpus-1`.
- Owed by BOB now (no reason to wait): reading-pipeline `r7-contention` PDF bar to 150 ms times `slow` (test fix, K4297 (2)); capture's next job re-points to record-grammar's `createResumableSha256` and drops `sha256-resume.mjs` (G180).
- Lanes nothing past H43, A41, W4, P26; channel UX-DESIGN nothing past U471 (its MERGE `c752a602da` at the close). INVESTIGATION #4 (secondary) unreachable.
- Tools: `/home/user/cp-jobbranch`, `/home/user/cp-close`, `/home/user/cp-cap` worktrees of civicos-process `prep/jobbranch-K4385`, `prep/T51-close-v2`, `prep/running-cap-K4976` (that branch's `mail.test.mjs` fixed to 30 minutes at `6bbd65f`). Merge in a worktree with `node_modules`; `git ls-files | grep -cE '(^|/)node_modules$'` is 0 before every push.

## Then (each waits on the merges above, a real dependency)

The round end of `fix-round-9-T51.md` §7: K4426's check (rows 4, 5 by VERIFY #1; 1, 2, 6 by CORPUS #1), regenerate every artifact in the manifest's order (stale: plane, pdf-worker bundles, setup-words `rows.mjs`, case-checker, newgroup), the whole suite in its own session (K4787), one redeploy with `--store-generation 2`, BOB's claim of the new room (3a), the P list, the re-walk, K4994's tracing and mutation sample; the fixture round from the `fixtures` check's list (§7 item 7); §7 items 4a/4b; the final pass (K4781); 0.87.0; T51's close (§5.7; the design MERGE first, K1177; the civicos-process prep branches merged). AW4 waits under K3717.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- Job branches only by `mail jobbranch`; never a force-push. biosmoke deployments: K4841 (standing list: not added); account `…7f72` only, plus the rehearsal account from the Default environment (K4949, K4956); the live copy only through the proxy (K4733).
- Sessions: archive each job at its merge (K4219); refused acts never taken to Bob nor rephrased (K3466, K4696).
