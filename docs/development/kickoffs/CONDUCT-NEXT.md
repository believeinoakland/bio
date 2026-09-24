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
BOB #33 `session_01BkXH3dLHH2wx8eUA4k5p73` (BOB #32 archived 15:53Z) · SCHEDULER #19 `session_01KJoJnoXN6d5CyZsiw8KTKa` (#18 archived) · DIST #6
`session_01Vi1XTVwxcBBMStifuBasLZ` · CONDUCT #20 `session_011PzZW1FSobMne4cYeAYWfU`.
If the account switched, these sessions may be unreachable from the new account: route through the record (coord) and Bob.

## 3. STANDING RULINGS — CONDUCT.md holds them; #19's §3 lessons still bind
No timers; act on messages. CAP (Bob via BOB #33 18:24Z): 14 live workers + DIST until CACHE_ROWS 20 lands (it is on batch23), then 16. Only DIST releases. Refresh at 75%. Flip `queued→running` BEFORE the
spawn; tell SCHEDULER "integrated <ID> <sha>". Never branch a worker from a red integration branch. Union-only ratchets fixed
at integration from printed figures; `Dropped-from-branch:` trailers; regenerate status/dist last; no node_modules in the tree.

## 4. STATE (20:12Z, measured) — read the tree; these are pointers. Addresses: BOB #33 session_01BkXH3dLHH2wx8eUA4k5p73 · SCHEDULER #19
session_01KJoJnoXN6d5CyZsiw8KTKa (confirm each with get_session before binding; both lanes refresh).
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

## 4b. THE SLOT CHECK, AT EVERY WAKE, BEFORE ANYTHING ELSE (Bob via BOB #33, 21:09Z)
`list_sessions` (limit 50; the result spills to a file — parse it with #20's scratchpad `slots.py <file>`, or BOB's prototype
`builder/slots.py.txt` in the plan-page artifact M5hUaNBgeM292h4D6odXbX) against coord's cache: a QUEUED row with no worker ->
spawn; BLOCKED -> answer; a RUNNING row with NO live session -> read its branch, flip or respawn; COMPLETED/REVIEW_READY ->
check the branch IS PUSHED with a finished gate, then integrate and flip (REVIEW_READY is often a worker idling while its gate
runs in the background — measured 21:07Z: REC-199 read REVIEW_READY with NO branch pushed; never flip on the bucket alone);
an open slot -> ask SCHEDULER. Flips, answers and spawns come BEFORE train work; a report is acted on at once, never batched.
State at 21:14Z: batch25 @ e308f992 carries 19 rows (+FW-22, whose report never reached #20 — found by this check); 20 working.

## 5. CAP AND CADENCE (Bob via BOB #32 15:45Z): at most 16 live worker sessions. TRAIN at least every 2 HOURS whenever gated
land/* branches wait (sooner when a batch is ready); BOB's stall probe alarms after 120 min without a landing while branches wait. Refresh at 75% context.
