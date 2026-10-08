# tasks (T36)

**Status** · session_01V667ubum8HnBqPmhryNfLm · depth 2 · WORKING · handled B0

## Completion (T36-45; R1, R18)

**Reading.** The set as mechanics §3 asks it (my requirements whole, layer 11's row of `build/layers.md`, every file of my code and tests, the Purpose and the named services of each module in my Uses, capture R45 among them), measured at about 260 KB: at most 300 KB, so read whole by me, no worker. Also read: B1, the plan's "Rules at the opening" and entry T36-45, K2097 and K2130 in `build/rulings.md`, and the draft's tasks section, "Choices made" and "BOB's review"; and capture's `taskEvents` (`capture/index.mjs`:2395–2414), to make the stand-ins answer as it does.

**Entries applied.**
- **T36-45** (K2097, K2130; R1 and R18 as appended): one paged reader, `#eachQueued` (`tasks/index.mjs`), serves both sites. `taskDrain` asks capture for `limit` minus what it has created, folded or refused, reads the next page past the last event's `cursor` while a page came back full and fewer than `limit` have been drained, so a waiting event (unfiled, or the id space exhausted) no longer uses up `limit` (the draft's "Choices made" 7) and `limit` or more waiting events at the head never hide a filed one; `waiting` names every waiting event read. `#backoffWake` pages the same way at `TASK_DRAIN_ALARM_BATCH` a page, so the earliest due instant is taken over every waiting event of the kind. No page cap per drain: the read is bounded by the queue's length, which `remaining` states (the draft's Suggestion; I named none).
- **No event read twice, by construction:** the reader skips an event already visited (by kind and digest) and ends on a page that brings none new or whose last event carries no cursor, so even a capture that ignored `after` could not make a drain re-read the head or loop.
- **Test stand-ins** honour `after` as capture R45 states it: `queueRead` (`test/m/tasks/world.mjs`) answers each event with a `cursor` (its place in the queue), only the events past a cursor it issued whether or not that event is still queued, and an unknown `after` as absent; `inbox()` uses it and logs each read's `limit`, `after` and answer; `ledger.test.mjs`:53, :76 use it.
- **Tests (new):** "R1 (T36) … pages past each page's last cursor …" (50 waiting at the head and one filed behind: one drain creates it; pages ask what `limit` has left; a fold and a refusal use up `limit`; a short page ends the read with no extra call); "R1 (T36): no event is read twice …" (a queue that answers the head whatever `after`); "R18 (T36) … over every waiting event, not the first page alone" (450 waiting, the earliest due on the second page, then on the short third; exactly one full page then an empty read). Negative control: with `index.mjs` stashed, these three fail and the other 98 pass.

**Deferred.** Nothing. T35's deferred head-of-line item is this entry, now met.

**Found in other modules (REPORT J1).** Generated artifact: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) embeds `tasks`, so this job stales it; for L11's close regeneration (§14). R1 and R18 still carry `*(not yet met: T36)*` in `build/requirements/tasks.md` (not my file): both are met at this commit, so the marks can be struck at merge. Nothing else.

**Tests and checks.**
- `node --test bio-plane/test/m/tasks/`: 101 pass, 0 fail (was 98; three new).
- Users of `tasks`: `queue` (with `conclude-project`, `docdates`) 129/0; `store-door` 36/0; `op-declarations` 90/3, `answer-envelope` 24/2, `control-plane` 163/4, `plane` (with `migrate-released`) 129/2: the 15 failing tests are the same, by name, with my change stashed (rule 5's reds 11, 13, 17, 18, 22–24, 26, 27; none mine). Also `scheduler`, `capture`, `plane/unpack`, `op-declarations/tables` (the tests naming the drain): 417/0.
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 135 modules, 0 failures. `architecture.mjs tasks`: 9 files, 36 imports, 0 failures. `coverage.mjs tasks`: 18 of 18, 0 failures. `ownership.mjs tasks tranche/T36`: 5 files, 0 failures.
- P6: 1,443 lines (+27).

Size (session_01V667ubum8HnBqPmhryNfLm): test runs 6, module lines 1443
