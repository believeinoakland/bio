# scheduler (T36)

**Status** · session_0125xUMsGsJbUG2TvbA1Qtk6 · depth 2 · WORKING · handled B1

## Record

**Entry applied:** T36-29 (N707's share, rev. 2 §4; K1913, K1929, K2129 option B): **R24**, the four `file-safety` consumers after `dated-waits`, keys `filescan`, `filerender`, `filedeeper`, `fileforward`.
- `file-scan` → `scanBatch({at})` at its first firing, then `FILE_SCAN_EVERY_MS` (86,400,000) from its last tick, and at the next firing while its last answer stated `remaining` above 0; its own wake stays the day (R24 names no other).
- `file-render` → `renderBatch({})`, `file-deeper` → `deeperBatch({})`: due at every firing; wake `FILE_SAFETY_POLL_MS` (300,000) after a tick that left work (render: `remaining` > 0, or `copies.queued` > 0, or any copy made or failed; deeper: `queued` or `running` > 0 or null), else none.
- `file-forward` → `forwardSecurityCounts({from, to})` at the first firing at or after each whole UTC hour; `to` the hour's start, `from` the `to` of the last `ok` call (first: the hour before; never more than 24 h back); wake the next hour while the last `ok` answer named a log tool.
- A refusal is the tick's answer and keeps the cadence (a refused forward keeps its `to`, so the next hour re-sends the period; a refused render keeps the work-left flag it had). A tick that throws is `{error}` (R3) and counts as run (no spin).
- State: the storage value `sched_files` (no table, R18), read at the first firing, arm or start; with none kept each is due at once (R11).
- The owner is **handed** by the plane, not built here: `scheduler.hand({fileSafety})` or `schedulerOf(ctx, env, {fileSafety})` (works on the instance already made). The default owners do not build `file-safety` (it needs the plane's bindings; building it here before T36-49 would start it in every plane without them).
- Files: `bio-plane/src/scheduler/index.mjs` (657 → 761 lines), tests `test/m/scheduler/files.test.mjs` (new, 19 tests), `fixture.mjs` (a `fileSafety` stand-in, off unless asked, like the daily owners), `registry.test.mjs` (R5's order with the four; two counts that exclude absent owners).

**Reading (mechanics §17):** measured my set as §3 asks: my requirements (≈20 KB), layer 10's row, my code and tests (≈190 KB), `file-safety`'s public part (≈22 KB), the Purpose of each other used module (≈17 KB), the plan entry, rule 5, K2129 and the draft's scheduler section with BOB's review: ≈255 KB, under 300 KB, read whole by me; no workers.

**Deferred:** none in this module.

**Found in other modules (also in J1 REPORT):**
1. `plane` (T36-49): hand `file-safety` with `schedulerOf(ctx, env, { fileSafety: fs })` (or `.hand`) **before** `schedulerOf(ctx, env).start()`. Once handed, a fresh instance's alarm is wanted at once (each of the four is due at once with nothing kept); after that firing, with no work and no log tool, only `file-scan`'s day stays. I checked plane's `unpack.test.mjs`:88 and scheduler `plane.test.mjs`:1128 read that way; T36-49 should re-run them.
2. `file-safety` R12's `renderBatch` answer states no count of safe copies still queued (`copies` is `{made, failed}`); R24 reads a copy made or failed as maybe-more-left, and polls once more. A `copies.queued` count (N762) would make it exact.
3. `file-safety` R4: with a backlog over `SCAN_BATCH_MAX`, R24 gives `file-scan` no wake of its own while `remaining`, so on an idle instance the backlog is scanned one batch per firing, at worst a batch a day. N762 (option A: the owner's own due and wake) is where to fix it.
4. `file-safety` R36's `deeperBatch` answers `queued: null, running: null` when its table cannot be read; R24 polls on null, so a broken table is polled every 5 minutes until it reads. As R24 asks; noted for N762.
5. `scheduler.md` (BOB's): R2's key list could name `filescan`, `filerender`, `filedeeper`, `fileforward`; R24's "not yet met" mark clears at the merge. R7 stands against the two carried constants by K2129 until N762.

**Tests and checks:**
- `node --test test/m/scheduler/`: tests 114, pass 114, fail 0.
- Users of scheduler (`tasks`, `queue` with `conclude-project.test.mjs`, `instance-setup`, `plane` with `system/migrate-released.test.mjs`): tests 465, pass 463, fail 2: plane `body.test.mjs`:25, :34, rule 5's red 27 (K2146), red without my change too (checked on a clean tree).
- `format.mjs`: 135 modules, 134 requirements files; 0 failures. `architecture.mjs scheduler`: 0 failures. `coverage.mjs scheduler`: 24 of 24 live requirement ids named by a test; 0 failures. `ownership.mjs scheduler tranche/T36`: 0 failures.
- P6: 761 lines, well under 4,000.

Size (session_0125xUMsGsJbUG2TvbA1Qtk6): test runs 7, module lines 761

## J1 · REPORT

Found in other modules while applying T36-29 (details in my record, 'Found in other modules'): (1) plane T36-49: hand file-safety with schedulerOf(ctx, env, { fileSafety: fs }) (or scheduler.hand({fileSafety})) before schedulerOf(ctx, env).start(); the default owners do not build it. Once handed, a fresh instance wants its alarm at once; after that firing with no work only file-scan's day stays; re-run plane unpack.test.mjs:88 and scheduler plane.test.mjs:1128 there. (2) file-safety renderBatch states no count of copies still queued; R24 polls once more after any copy made or failed; a copies.queued (N762) would make it exact. (3) file-safety R4: R24 gives file-scan no wake while remaining, so a backlog over SCAN_BATCH_MAX on an idle instance is scanned a batch per firing, at worst a day; for N762. (4) deeperBatch answers queued/running null when its table cannot be read; R24 polls on null, every 5 minutes until it reads; for N762. (5) scheduler.md (BOB's): R2's key list could name filescan, filerender, filedeeper, fileforward.
