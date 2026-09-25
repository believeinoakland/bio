successor: to be created by FLEET #4 on BOB #36's request when SCHEDULER #24 reaches 75%. Until then SCHEDULER #24 is session_01AFfq8GhbuuRpxUsjPtrigi (live since 10:46Z; #23 archived 10:47Z under D-398).

Read `CLAUDE.md`, `kickoffs/SCHEDULER.md`, then this, then `QUEUE.md` and `BACKLOG.md` from `coord`. A POINTER: re-measure before resting on any of it.

## WRITTEN 2026-09-25 ~13:20Z; PARKED ~13:50Z by SCHEDULER #24 (Bob 13:25Z: weekly token budget nearly spent)

## THE LANES (confirm with get_session)
BOB #36 `session_01TDAu2wMVfAbxnzwhBUzEt6` · CONDUCT #23 `session_01NYMcSDBEBi7p1Ny3kfQJVW` (took over from #22 at 11:29Z; #22 is ARCHIVED, and a trigger to it is refused) · DIST #7 `session_01FQcUMZ2f34zhHzBkMEEdQ6` · FLEET #4 `session_01YB9VgJtjiXwQ5vtx4fLvRB`.

## PARKED ~13:50Z (Bob, 13:25Z, via BOB #36). NOTHING RUNS AND NOTHING SPAWNS until Bob resumes.
The six workers still running at 13:25Z were told to park. They were recorded in ONE coord write (257d764b):
- DONE and GREEN, marked integrated: D-643 (480c206b), D-729 (72e123e2), D-649 (22974e39; carries D-758 fixed in place).
- WORK DONE, UNGATED, left queued to RESUME: D-724 @ a944481e (on D-685) and D-726 @ 0e0a928e (on D-707). Each OWES ONE FULL GATE before integration; each row's status line says so.
- D-734 was UNDETERMINED at the deadline, then REPORTED at 15:11Z: DONE, @ 582928ee (on D-712 f10b1024), full gate 385/386 (monitor-cadence was load-dependent, which is D-759), then a RERUN recorded GREEN on the same tree fbeb4f7e. It is marked integrated; IC-403 is proposed.
On resume: Bob's no-spawn stop (12:50Z) still binds until batch30 and batch31 land. Resume D-724 and D-726 by gating their tips first. D-738 (promote refuses an id that mismatches its bundleId) is placed behind D-741.

## BOB'S STOP — NO SPAWNS (Bob 12:50Z, confirmed ~13:00Z)
"Stop spawning new worker sessions and focus on batching up the changes for merging" / "no new job spawns until we get all these jobs merged." It SUPERSEDES "16 workers working" until BOB lifts it; only Bob lifts it. It holds until batch30 AND batch31 have landed and every running worker's branch is integrated and trained. Meanwhile: flip reports, mint and place rows, drain the inbox, and SPAWN NOTHING, even for a runnable row. BOB 12:55Z: batch30's scope is FROZEN (d557a837 + 15 C2a merges); every other ready branch rides batch31, which should land within ~2 h.

## STATE at ~13:20Z: main 95fe7bc7 (batch29), nothing landed since 08:35Z
Running (the tail; no replacements): D-734, D-726, D-729, D-724, D-728 (product), then D-643 and D-649 (anchor drift on M0-197). Read `grep '· running' QUEUE.md` on coord. The cache holds ~105 integrated rows waiting for trains. When a batch lands: verify each row's tip (or its merge) is an ancestor of origin/main, then ONE write `--status <ID> done --note ... --archive <ID>` for each, plus `--refill`.
HOLDS for the trains (CONDUCT carries them): UI-121 rides ONLY with D-712 @ f10b1024, which carries D-731 part (a) (BOB 11:22Z and 11:50Z, both met); D-686 is taken at 526cc17f with D-710 (f34c4c9f) and D-723 (fe2b9a6d) on it. CATALOG_VERSION is claimed along the promote chain D-628 1.35 / D-695 1.35 / D-692 1.36 / D-717 1.36 / D-707 1.37 (the union picks one). UI-117 and UI-118 both claim CIVICOS_UI_STATE v130.

## PLACED THIS SESSION (the rows are the record)
Product and record rows, waiting on running parents: D-741 (readability before content fences, behind D-726), D-742 (read-only count of pair-draft acks, placed low). Control-trust group: D-737, D-735 (note: D-638 re-anchored dec65 a2 on the signature), D-736, D-739, D-711, D-705, D-727, D-730, then D-743..D-757 (CONDUCT #23's batch30-union anchor drift, allowances on batch30 commit 75465bfd).

## WITH BOB, OPEN
None asked and unanswered at 13:20Z. Ruled today and drained: D-706/D-722 write half (final (A)+(C) at 11:15Z), D-710/D-723 mixed page, D-724 skipped units, D-720 pair reading, D-731 (a) and (b), D-707 readability (D-741), no row for D-717's sweep or for per-link recurrence.

## MECHANICS LEARNED BY #24
- Worker reports go to the SCHEDULER session named in their brief. At a lane change, trigger every running worker with the new id, or its report is lost (#23's workers' reports bounced off the archive).
- A row stacked on an integrated-not-done branch: move it BACKLOG -> QUEUE with `--row BACKLOG <ID> empty` plus `--insert QUEUE ...`, rewrite `depends-on: none (stacked on land/worker/<P> @ <sha>, integrated ...)`, and add a `status:` line after `order:`.
- P3 caps the cache at 20 non-integrated rows. To place a priority row when the cache is full, move the LOWEST queued row back to the backlog head of its group, both in the same write.
- Anchor-drift rows before M0-197 lands: spawn them from land/worker/M0-197 @ 11818309, because anchordrift.json exists only there.
- In an unquoted heredoc, backticks run as commands. Quote the delimiter (`<<'EOF'`) or keep backticks out of python replace strings.
- Flip on a GREEN seen in the worker's session summary only when the summary names the gate line; otherwise wait for the report.
