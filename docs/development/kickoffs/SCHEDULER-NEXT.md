# SCHEDULER-NEXT — the resume for SCHEDULER #17, in the cloud (written 2026-09-23 by SCHEDULER #16 at its refresh)

Read `CLAUDE.md`, `kickoffs/SCHEDULER.md`, then this, then `QUEUE.md` from `coord`. Measured at ~21:38Z: `origin/main` @ `02603e88`,
`coord` @ `930455b3`, context 70%. A POINTER: re-measure before resting on it.

## How the lane runs now (Bob's rulings of 2026-09-23, via BOB #30/#31)

- **No timers.** Only BOB keeps timers; this lane wakes on messages. BOB deleted SCHEDULER #16's wakes: arm none.
- **Work moves by message.** In the SAME turn rows enter the cache, `create_trigger` CONDUCT #17 (`session_01RQQSvvqhRfYC4PH1nBZQob`),
  `run_once_at` ONE minute out, naming them. If you cannot fill, one line to BOB #31 (`session_0124NEAbkH3D4rkivNhZtJ8X`):
  "SCHEDULER cannot fill: <why>". Never `fire_trigger` a routine to reach a session.
- **Only SCHEDULER writes the plan pipeline.** CONDUCT writes no row; it tells you, you write.
- **`integrated`** (on main since `af1ffa3f`): when CONDUCT reports a row finished and on a PUSHED batch, flip it `integrated` and
  `--refill` in the same write. Integrated rows hold no slot, no bytes; they close (`done` + archive) only when their train's sha is
  on `origin/main`, verified by content.
- **Cache target: 12 active + at least 4 queued** (Bob). `CACHE_ROWS` is 12 on main; **16 at 48 KiB** (BOB #31's ruling) is
  `land/scheduler16/integrated` @ `6ea0d504`, GREEN (tree `edbd78c5`), pushed, awaiting CONDUCT's next train. When it lands, refill to
  16 in the same turn and trigger CONDUCT. Until then, say "cannot fill (4 spare)" to BOB if asked.
- **Every row placed names its suite and NEGATIVE CONTROL** in accepts-when (a worker's whole gate is those plus plancheck). Refresh past
  75% context (auto-compaction ~79%).
- **Refill moves only `queued` rows.** A `running` row sitting in the backlog is moved in by hand (`--row` delete + `--insert`). A
  refilled row that is CUT is restored whole from `QUEUE-cut-2026-09-22.md` with an `uncut:` line (the python in this session's
  scratch did it; the pattern: take the archived block, keep the current `order:`, append `uncut:`).
- **Never run coord writes with tools from an ungated branch checkout** — I did once (a 16-row refill under 12-row tools) and undid it.

## State

- **Cache (~21:38Z):** running D-179, D-125, CAP-14, D-52, D-84, D-220, D-182, D-178, UI-74, REC-161; queued CPDF-22, REC-182;
  integrated D-219, D-54, D-128, D-278, COFF-13, D-311 (all on `land/conduct/c17-batch3` @ a8066053, waiting for its train). When it
  lands: verify each by content, done + archive, refill, trigger CONDUCT. D-311's note carries its worker's correction (projectremove is
  refused to any non-owner, not an administrator's act).
- **Backlog head, in order:** REC-159 (`blocked`: Bob approved ~21:08Z; CONDUCT's permission check refused its spawn; awaits Bob
  starting its worker himself), REC-162, REC-155 (depend on REC-159), REC-183, D-443, UI-83, REC-184, UI-84, REC-185, REC-186 (BOB #31's
  two Membership §7 rulings; cite his 21:37Z message until he folds them), DIST-7, M0-106 (blocked), D-65, … UI-83/REC-184/UI-84/REC-185/
  REC-186/DIST-7 wait on c17-batch3. NOT placed: D-311's worker's UI suggestion (roster acts read from op=affordances) — weigh it.
- **Owed by BOB:** fold into home documents the two rulings drained this session (M0-138 landed; CPDF-22's design line still cites the
  drained inbox entry).
- **LED-7:** 67 open DEBT rows; batches S16-1..S16-3 closed D-393, D-400, D-403, D-407, D-296, D-251 and placed D-121's defect (REC-179,
  done) and D-443. One batch per quiet wake when BOB says the lanes are quiet.
- **Local scratch:** `/tmp/claude-0/s16/` held the scripts; nothing there is needed.
