# monitoring (T45)

**Status** · session_0133TTPPm1mQzJwK2WwH5Yij · depth 2 · RUNNING until 2026-10-12T00:41:29Z (migrate-released, mine vs tranche base) · handled B3

## J1 · QUESTION

Readings I am building on (T45-35); none blocks me, so I carry on with each as stated unless you answer otherwise.

1. **R34/R50, where `due_at` comes from.** R34 names `action-clocks` R3 for an entry's `due_at` and zone, but R3 (`overdueClocks`) lists only entries already past by date, so it can never name an entry due at 12:00 today before today ends; R1 (`pendingClocks`, the read R44 binds me to) answers no `due_at`. Best reading: I keep reading through `pendingClocks`, asking `before` = two local days after today (so today's timed entries, and a `due_zone` east of the jurisdiction's, are read); for each candidate I read the entry's `due_at`/`due_zone` from the action's own document (the authority, which `#markOverdue` already reads), the zone being `due_zone` else the jurisdiction's (as `action-clocks`' own `dueAtOf`). A timed entry is past when now ≥ that instant; a wall time the zone skips or repeats that day falls back to the date-only rule (never marked early). R50 offers that instant as the candidate. Two of my existing tests pinned `before` = today; I update them to the new read, no weaker. **REPORT for `action-clocks`:** R1's items could carry `due_at` and `due_zone` (as R3's do), which would spare the document read.
2. **R71, when an address is ended.** Ended when today's local day ≥ `until` (R71's test: "ended today is not ticked", "ended tomorrow is ticked today"). "Today" is the jurisdiction's local day (`#zone`, the zone R34 reads). With no zone held, a non-null `until` is refused `WATCH_END_REFUSED` (the detail saying today cannot be read in the instance's zone; never the UTC day), `null` is accepted, and a setting already held reads `until` with the row saying its end is undetermined (not ended).
3. **R71 `asked_after_end`:** the versions at the ended address that still ask to be monitored (R15's `monitored_versions`), filtered by the viewer's sight on R32's rows.
4. **The row:** `WATCH_END_REFUSED` takes C-18.19 in this module's existing C-18 family (`checks.mjs`), with a translation of mine for UX to re-word; `following` R22 reads it from here rather than minting its own (one site). Accepted reds: rule 4 (2), (14).
5. **The plan and R32:** `schedule(now)` gains an `ended` list (never due, no `next`, read by no tick, no look); R32's rows read `state: "ended"`, so `machinery-producers`' recheck arm (overdue `due` or `unscheduled` only) draws nothing for it. `op=monitor` asked by a caller naming a bundle still runs (R1 is unamended). Every R32 row answers `until` (the day, or null) with `until_set: {by, at}` when one is set, or `ends: "none_set"`; the history is `end_settings` on the row, as `frequency_settings`.
6. **Size:** 3,489 code lines at START; R71/R72/R34 should land near 3,650, under 4,000 (M-T45-6 noted).

## J2 · REPORT

**R34's time-of-day arm is blocked by `actions` R33's write bound (another module; I change nothing there).**

What happens: my code now reads an entry's `due_at` (as J1 item 1 says) and, at 12:01 on the entry's own day, sends the mechanical `deadline-recheck` that moves it `pending` → `overdue`. `actions`' promotion step refuses it `CLOCK_STATUS_NOT_MECHANICAL` (`bio-plane/src/actions/index.mjs`:729–742, `clockMovesNotMechanical(heldClock, nextClock, today)`), because its bound (actions R33: "may move a `pending` entry whose date has passed") reads only the date: an entry dated today has not "passed" there until tomorrow. Reproduced in `ends.test.mjs` "R34 an entry due 12:00 …": `failed: [{reason: "CLOCK_STATUS_NOT_MECHANICAL"}]`.

Needed (for `actions`, against its R33 as amended by R34's T45 line): the machine bound admits a `pending` → `overdue` move of an entry that carries a `due_at` once that instant has passed in its zone (`due_zone`, else the office's), the same reading `action-clocks`' `dueAtOf` gives; date-only entries unchanged. Until then, monitoring's mark of a timed entry fails on its day (held back once a day by R50's N429 rule, never a loop) and lands at the start of the next local day as before, so nothing is marked early or wrongly.

My state: every other entry (R71, R72, R32, R50, and R34's read of the instant) is built and green; the two R34 tests are red only on this refusal. I am finishing the checks and my record now; I will post COMPLETE with these two named as the open red unless you send another reading. Also still open from J1 item 1: `action-clocks` R1 could answer `due_at`/`due_zone` (saves a document read).
