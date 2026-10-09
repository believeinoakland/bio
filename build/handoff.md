# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #147 (`session_015RSW6DLs4ZrmfVfQPAvos5`), 2026-10-09 ~23:50 UTC, for BOB #148. Read `build/rulings-active.md` first; this BOB's rulings are K2467–K2502.

## Open with Bob

- **NEEDS BOB: approve `git pull --ff-only origin job/T41/ai-runs` in AI-RUNS #15** (`session_018LtTgjuoBm5JJCXEVJhJZ4`, https://claude.ai/code/session_018LtTgjuoBm5JJCXEVJhJZ4). Its permission check refused that first act (its checkout 147 commits behind its branch); mechanics §16, K2502; no earlier refusal of it in `rulings.md`; not on the standing list. Relayed to Bob by BOB #147. Until he approves, ai-runs (and question-explorer and agent-worker after it) cannot merge, so L6 cannot close. Do not start another ai-runs session to work around it (§16).
- **Pause after T41 (K2456):** T41 runs every layer and closes by §5.7 through step 5; T42 does not open until Bob resumes.
- The actions design lane's open decisions (D6, D18, D19) are with Bob on its page; nothing else of BOB's is open with him.

## Parallel lanes

- **ACTIONS-DESIGN #1** (`design/actions`): read to H8 (Actions D24 → N828, K2474). Not paused.
- **UX-DESIGN:** read to U145; B123 sent (four wording points, K2484/K2486); nothing owed.
- **INVESTIGATION-DESIGN:** HANDOFF at H43 (design work done).

## Where things stand (T41 on `tranche/T41`)

- **L1–L5 merged and closed** (L5: K2477).
- **L6 started 22:59** (K2478), 19 jobs. **Merged (15):** citation, leg-earning, contradiction, agent-model, reading-guides, ai-use, run-rules, inquiry-grammar, steps, skills, inquiry, run-productions, answers, basis-versions, hypotheses (K2481–K2502). **Open (4):**
  - **ai-runs** (T41-23): AI-RUNS #15 blocked on the refused pull (above). Its record's J4 "Next" lists the rest: R74 `openMany`; K624's delete of its R48–R52 copy and the two tables, re-pointed to ai-use (B5); run-rules' gate `partDeployable` etc. (B6); K2490's system-step order (B8); steps (B9). On merge: add `steps` to its uses; rule 4 (10)'s ai-runs reds clear.
  - **run-productions**: re-opened by K2502 (B6: R21 admits an investigate run carrying a step). Merge again when COMPLETE.
  - **capture-requests** (T41-25): RUNNING its users' suites with real steps until ~00:00. On merge: add `steps` to its uses.
  - **question-explorer** (T41-28, new): COMPLETE against real steps, ai-use, run-productions; merges after ai-runs, capture-requests and run-productions' re-merge (each by CHANGE). On merge: write its paths, tests and final uses from its record (K1043).
  - **agent-worker** (T41-31): COMPLETE (J5); merges last in L6.
- **L6 close (§5.6):** regenerate `program.mjs` and the bundles (manifest order; `npm ci` first after a container restart: agent-runner `--ignore-scripts`, sheet-worker, file-scanner, bio-plane), run the checks, archive the 19 job sessions with their rows (AI-RUNS #14's row is written; its `Size` line was not, the job unfinished), and name rule 4 (10)'s L11 users of the retired ceiling codes exactly.
- **L7–L11 are ready:** requirement text applied (K2448, K2451, K2471, K2472, K2483, K2484) and STARTs written and reviewed for L6–L8 (`build/plan/starts-T41/`, K2497). L9–L11 STARTs are not yet written (pattern as L6–L8; measure with `build/plan/reading-sets.py`). New code families: steps C-142, ai-use C-143, reading-guides C-144, question-explorer C-145, investigation C-146 (K2480); answer-envelope lists them at T41-60 (rule 4 (16)).
- `next.md` gained N827–N835 (each with its hard reason).

## Next steps, in order

1. Take over (§5.1): archive BOB #147, its `BOB-final` row under T41; `mail xwriter`; arm backstop and WATCH (`WATCH #148: tranche/T41`); delete mine: backstop `trig_01VBcrigHwY4BjEEXE2b443o`, WATCH `trig_01JQJntdR1KrJU4FxbXna84E`.
2. Run L6 to its close (above), then L7–L11 in order: for L9–L11 write the STARTs first.
3. Close T41 by §5.7 steps 1–5 (check the channel for a MERGE; PR `tranche/T41` → `main` with the GitHub merge tool, authority Bob's standing direction in the product's `CLAUDE.md`, K1177; standing list `mcp__github__merge_pull_request`; no refusal since K2273). Then stop (K2456): report to Bob, ask his meter, open nothing.

## Process notes

- Job sessions went idle mid-run with a background test command lost (observation-log, K2476): at QUIET, `get_session` and post `RESUME`.
- Routine creation is rate-limited (~8 in a burst): ring the rest a minute later (K1825).
- Commit only named paths while a worker edits the tree (K2482: a broad `git add` swept unreviewed drafts in).
- A worker may be refused git by its permission check: give it file edits only, and run the checks yourself (K2484).
