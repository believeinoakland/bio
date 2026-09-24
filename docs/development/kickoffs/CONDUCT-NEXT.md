# CONDUCT-NEXT — the resume prompt for CONDUCT #21, in cloud Claude Code

> Written by CONDUCT #20 (session_011PzZW1FSobMne4cYeAYWfU) 2026-09-24; kept current at every train; last 18:58Z, before the 19:20Z train.
> Everything below is on `origin` (main, coord, land/*). Where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING
```
git fetch origin
node tools/train.mjs list | awk '$2=="WAITING"{print $3}'
node tools/coord.mjs read docs/development/QUEUE.md | grep -E '^### '
```
A TRAIN OF ONE BRANCH: `node tools/train.mjs run --drop <b1> --drop <b2> …` — ONE `--drop` PER BRANCH. A comma list is NOT parsed:
#20's 07:08Z train took `--drop a,b,c` as one unknown name and merged EVERY waiting branch (killed by PID before any push; main
untouched). Build the args from `train.mjs list` (grep WAITING, awk $3), and confirm the log's first line says `1 waiting`.
Ids: always `node tools/mintid.mjs <NS>`; check new ids at each merge (`mintid.mjs --audit --base origin/main`).

## 2. LANE ADDRESSES (one-shot `create_trigger`, persistent_session_id, run_once_at ~1 min ahead; NEVER fire_trigger)
BOB #34 `session_015xYmWbudjCX7rFPF1bDJd3` (since 22:02Z; BOB #33 `session_01BkXH3dLHH2wx8eUA4k5p73` finishing batch-0924e) · SCHEDULER #20 `session_01RxoRvCfY35n2aXnn2unRJp` (since 22:05Z; #19 refreshed) · DIST #6
`session_01Vi1XTVwxcBBMStifuBasLZ` · CONDUCT #20 `session_011PzZW1FSobMne4cYeAYWfU`.
If the account switched, these sessions may be unreachable from the new account: route through the record (coord) and Bob.

## 3. STANDING RULINGS — CONDUCT.md holds them; #19's §3 lessons still bind
No timers; act on messages. CAP (Bob via BOB #33 18:24Z): 14 live workers + DIST until CACHE_ROWS 20 lands (it is on batch23), then 16. Only DIST releases. Refresh at 75%. Flip `queued→running` BEFORE the
spawn; tell SCHEDULER "integrated <ID> <sha>". Never branch a worker from a red integration branch. Union-only ratchets fixed
at integration from printed figures; `Dropped-from-branch:` trailers; regenerate status/dist last; no node_modules in the tree.

## 4. STATE (20:12Z, measured) — read the tree; these are pointers. Addresses: BOB #34 session_015xYmWbudjCX7rFPF1bDJd3 · SCHEDULER #20
session_01RxoRvCfY35n2aXnn2unRJp (confirm each with get_session before binding; both lanes refresh).
- #20 is LIVE (live context ~30%). get_session's used_tokens COUNTS PAST THE COMPACTION BOUNDARY — never refresh on it alone.
- MAIN = 1a7f0bcc (c20-batch24c + BOB batch-0924c): 18 rows landed, workers ARCHIVED. Main carries CACHE_ROWS 20 and M0-140;
  M0-140's coord write DONE (coord 0065b961: DEBT.md retired whole into DEBT-closed.md). WRITE COORD ONLY FROM A MAIN CHECKOUT —
  a pre-M0-140 checkout now fails LC-debt (DEBT.md is gone ON PURPOSE); a batch worktree may carry stale planning files.
  (#20 deleted DEBT.md twice by writing from batch worktrees before this landed; both restored — the lesson.)
- NEXT TRAIN ~21:20Z: land/conduct/c20-batch25 @ 1d8fd8b6 (pushed; worktree /home/user/w15). Carries M0-173 M0-169 D-511 D-491
  M0-178 M0-180 DIST-11 DIST-13 D-472 M0-183 (all flipped integrated). I3 94.0.0, I5 3.12.0, I4 2.3.0 (IC-281, minted at
  integration), CATALOG 1.27.0 = 460. Floors read from prints; 0 drift, 0 ambiguous. Train it ALONE with one --drop per other
  WAITING branch; if the train RETURNS it on a conflict, merge the conflicting branch into a NEW batch ref (never force-push).
- REC-194 (@5038ee57) is re-merging onto the union by its worker (REC-212 + D-507 both redesigned #statementAcknowledgements);
  its IC-269 (I3 MAJOR) resolves at its integration on top of 94.0.0.
- WORKING (18): D-490 D-510 D-518 D-476 FW-22 FW-23 D-463 D-475 M0-179 D-478 UI-99 M0-187 UI-101 UI-102 REC-199 REC-200 UI-93
  + REC-194. BOB 19:24Z: spawn EVERY queued row at once, 16+.
- Merge helpers (scratchpad): csmerge2.py (construct-status by claim OBJECT, either side's layout), hmerge.py (diff3 prose by
  words), catmerge.py (the CATALOG_VERSION union pattern: gate.mjs/ratify/d470 + floor history notes). A virtual merge base
  (criss-cross) breaks stage 1: use the shared tip as base. Status probes must match EXACTLY ONCE in CODE (M0-160 guard).

## 4b. THE SPLIT (Bob via BOB #33, 21:10Z): DISPATCH IS SCHEDULER'S
SCHEDULER (#20 since 22:05Z) marks finished rows integrated, refills, and SPAWNS. #19 got CONDUCT #20's brief form (scratchpad `brief2.tpl`, sent in
full 21:21Z) — workers still REPORT TO CONDUCT. CONDUCT keeps: verifying worker results, integrating into batches, trains, merges,
archiving under D-398, and answering workers. CONDUCT MAY still flip a row whose report says it is finished (as #20 did D-519).
At every wake, still read the slots first (`list_sessions` limit 50, parse with #20's `slots.py <file>`) — but for what CONDUCT
owns: a finished/pushed branch -> verify its gate, integrate, flip; a BLOCKED worker -> answer; a RUNNING row with no live
session -> tell SCHEDULER. REVIEW_READY is often a worker idling while its gate runs (REC-199, 21:07Z): never integrate on the
bucket alone — the branch must be pushed with a finished gate line. An open slot or a queued row with no worker is SCHEDULER's.
State at 22:05Z: c20-batch25 LANDED, main = 9f8b69e6; its 17 worker sessions are archived (REC-194's was not listed). c20-batch26 is in
/home/user/w16 @ 5dbb75f3 (UI-101, UI-102, M0-181, REC-199, D-514, D-478, UI-99, REC-200; IC-282, IC-284 and IC-285 resolved;
arms floor 2176), gating in the background, then push and train. NO RELEASE (Bob, 22:30Z via BOB #34, coord ec9b251d): "Hold the release until tomorrow or beyond" — trains keep landing on main; no release-readiness work ahead of plan rows; D-478's member deploy waits with it.
Workers based before 1a7f0bcc report a phantom "DEBT.md missing / cache over 16": the remedy is the rebase, never a restore.

## 5. CAP AND CADENCE (Bob via BOB #32 15:45Z): at most 16 live worker sessions. TRAIN at least every 2 HOURS whenever gated
land/* branches wait (sooner when a batch is ready); BOB's stall probe alarms after 120 min without a landing while branches wait. Refresh at 75% context.
