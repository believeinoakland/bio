# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #148 (`session_01EeszW98JLSNnCn9cvup3E9`, secondary account), 2026-10-10 ~06:00 UTC, for BOB #149 on the other (primary) account. Read `build/rulings-active.md` first; this BOB's rulings are K2504–K2510.

## Why paused (K2510)

Bob: "Pause development and save everything to the repo so that development can continue in the other account." Everything is pushed on `tranche/T41`. No routine of this process is armed; every L6 job session is archived with its row in `build/metrics/T41.csv`. BOB #148 stays unarchived on the secondary account, with no `BOB-final` row (K742, K1897).

## Open with Bob

- **NEEDS BOB: start ROOT on the primary account.** Plain steps: on the primary account, open claude.ai/code, start a new session on `believeinoakland/bio` (branch `main`), title it `ROOT #7`, and paste: "You are ROOT #7 for BIO/CivicOS, on Bob's primary account. Attach believeinoakland/civicos-process, read roles/ROOT.md whole, and follow it. Your first act: START BOB #149: tranche/T41 @ <the commit that carries this handoff>; BOB #148 is `session_01EeszW98JLSNnCn9cvup3E9` (secondary account, unreachable from here)." ROOT then starts BOB #149.
- **Pause after T41 (K2456)** stands: T41 runs to its close through §5.7 step 5; T42 does not open until Bob resumes.
- **Bob's meter:** his reading on the primary account is asked at takeover (the 80% rule, K2341).
- The actions lane's open decisions (D6, D18, D19) are with Bob on its page.

## Parallel lanes

- **ACTIONS-DESIGN #1** (`design/actions`): read to H8. Not paused by K2510 (it is Bob's lane); its session is on the account it was started on.
- **UX-DESIGN:** read to U145; B123 sent; nothing owed. The channel's `BOB` row in `build/channels.md` (on `main`) still says secondary: change it to primary at T41's close (§13.1 item 1, K1428); meanwhile write the Writer line with `mail xwriter --account primary`.
- **INVESTIGATION-DESIGN:** HANDOFF at H43 (design work done).

## Where things stand (T41 on `tranche/T41`)

- **L1–L5 merged and closed.**
- **L6, 19 jobs, 17 merged** (K2481–K2509; capture-requests K2504, run-productions again K2506, hypotheses and answers again K2509 on K2508's CHANGEs). **Not merged (every session archived, K2510):**
  - **ai-runs** (T41-23): its record's J4 (BLOCKED, context) lists what remains: R74 `openMany`; re-point to ai-use and delete the R48–R52 copy and its two tables (B5, K624); run-rules' imports and `#PENDING_ROWS` dropped (B6); K2490's system-step order (B8); steps (B9). Start **AI-RUNS #16** on `job/T41/ai-runs` (§5.3 step 3, same prompt); a new session's checkout is fresh, so AI-RUNS #15's refused pull does not recur. Its `START` is `build/plan/starts-T41/ai-runs.txt` and its mailbox carries B1–B9. On merge: add `steps` to its uses; rule 4 (10)'s ai-runs reds clear.
  - **question-explorer** (T41-28): COMPLETE (J10) against the real capture-requests (B10) and run-productions R21 (B11); merges after ai-runs. On merge write its paths, tests and final uses from its record (K1043). If ai-runs' merge changes what it reads, restart it as QUESTION-EXPLORER #2 with a CHANGE.
  - **agent-worker** (T41-31): COMPLETE (J5); merges last in L6.
- **L6 close (§5.6):** `npm ci` first in this container (agent-runner `--ignore-scripts`, sheet-worker, file-scanner, bio-plane), regenerate `program.mjs` and the bundles in the manifest's order, run the checks, write AI-RUNS #16's row when archived (all other L6 rows are written), and name rule 4 (10)'s L11 users exactly (the L11 STARTs list today's grep: store-door `routes.test.mjs`:154–159, :208–210; control-plane `t34-routes.test.mjs`:233–238, `r53-routes.test.mjs`:35–36).
- **L7–L11 ready.** STARTs written for every job (`build/plan/starts-T41/`; L7–L8 K2497, L9–L11 K2507). L9's text K2505 (new job T41-46a action-grammar; plan total 66). L11's owed text applied K2508; **before L11's START** re-take each L11 START's marked ids from the requirements files and fill the `TO FIX AT L11 START` lines (op-grades, answer-envelope, plane).
- `next.md` holds N827–N835 (each with its hard reason).

## Next steps, in order

1. Take over (§5.1) on the primary account: depth check, Status line, record ROOT #7's id in `build/manifest.md`; `mail xwriter --as BOB --account primary`; arm backstop and `WATCH #149: tranche/T41`; nothing of BOB #148's to delete (no routine armed) or archive (other account).
2. Ask Bob's meter reading (K2341).
3. Start AI-RUNS #16; merge ai-runs, question-explorer, agent-worker; close L6; run L7–L11 in order.
4. Close T41 by §5.7 steps 1–5 (check the channel for a MERGE; PR `tranche/T41` → `main` with the GitHub merge tool, authority Bob's standing direction in the product's `CLAUDE.md`, K1177; standing list `mcp__github__merge_pull_request`; no refusal since K2273; at the close also move `build/channels.md`'s BOB row to primary). Then stop (K2456): report to Bob, ask his meter, open nothing.

## Process notes

- A new account's sessions need the standing list in `.claude/settings.json` (both repositories); it travels with the repositories.
- Routine creation is rate-limited (~8 in a burst): ring the rest a minute later (K1825).
- Commit only named paths while a worker edits the tree (K2482). A worker may be refused git: give it file edits only (K2484).
