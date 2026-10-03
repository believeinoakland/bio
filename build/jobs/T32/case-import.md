# case-import (T32)

**Status** · session_01MiW6fXUHMWPvHxptpYDLsJ · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** N546 (L8): `watchItems` (R20) names, on each verified entry under `entries`, `seen_at`: the instant this copy read the entry. Reading: the `at` of the docket read that first recorded the entry (the read's instant as `monitoring` gives it, else this copy's instant, settled reading (3)), not the commit instant `recorded_at`; this is the same instant queue-producers already ages the unreadable CONDITION from (QUEUE-PRODUCERS #10 J1 (3)). An entry served again by a later read keeps the instant it was first seen (the later read records nothing new for it, R18 reading (1)). An ended or replaced watch's entries keep their `seen_at`. Code: `bio-plane/src/case-import/index.mjs` (`watchItems` joins the read's `at`); no schema change.

**Deferred.** None.

**Found for BOB (not in another module's code).** R20's `refused` items carry no `seen_at`, though queue-producers R35 says "an entry's item ages from the instant this copy read it", which also covers its `cited-docket-entry-refused` item. Adding `seen_at` to `refused` is one line here, but it widens a provided service beyond R20's text, so it waits on BOB's requirement change (REPORT J1).

**Tests.** `watch.test.mjs`'s R20 test now checks `seen_at` on every verified entry: equal to the read's instant while this copy's clock differs; an entry first seen by a later read carries that read's instant; a re-served entry keeps its first instant; a read with no `at` uses this copy's instant; an ended watch's entries keep theirs; the read writes nothing.
- `node --test bio-plane/test/m/case-import/`: tests 75, pass 75, fail 0.
- `node --test bio-plane/test/m/queue-producers/` (its user; fakes `watchItems`): tests 79, pass 79, fail 0.
- Layer tests: none named by `build/manifest.md`.
- `checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `checks/architecture.mjs … case-import`: 10 product files, 51 relative imports; 0 failures.
- `checks/coverage.mjs … case-import`: 20 of 20 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … case-import tranche/T32`: 0 failures (re-run after the commit below).

**Reading done.** The requirements whole, the module's `index.mjs` and `watch.test.mjs` whole, the plan's entries; the Uses' public parts and the module's other test files were not re-read, since the change touches only R20's answer and none of the modules it uses.

Size (session_01MiW6fXUHMWPvHxptpYDLsJ): test runs 3, module lines 1325

## J1 · REPORT

For BOB (a requirement, not code): R20's `refused` items carry no `seen_at`, yet queue-producers R35 says an entry's item ages from the instant this copy read it, which also covers its `cited-docket-entry-refused` item (today aged `no_seen_instant`). Adding `seen_at` to `refused` is one line in case-import (the same join); it widens R20's provided answer, so it waits on your requirement change. Not done in this job.
