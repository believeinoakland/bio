# monitoring (T31)

**Status** · session_01P7ix1fsb1sMMLpFiv27Btv · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R67/R68, my readings (carrying on with them; tell me if any is wrong):
1. `watched: {due, read, unreadable, governed, failed}`: `due` a count (as R19's `gathered.due`); the other four lists, each entry `{import, docket, …}` (`read` carries case-import's `outcome`, `new_entries`, `new_moves`, `new_refused`; `unreadable` its reason; `failed` the refusal's reason or the throw). A watch claimed by an unfinished tick is not read and not listed (R67 names no key for it), and keeps the epoch open as a skipped address does (R21).
2. Each docket read attempted spends one of R19's 50, a governed one included (as R28's locators do).
3. Defensive R36 guard: a watch whose docket address is not a public https locator (case-import R17 never stores one) is not fetched and is recorded `unreadable`, reason `fetch_failed`.
4. Paused, `cadenceWake` also looks again one archive interval on while any watch is in force (as it does for monitored documents and open requests), and the paused tick's `watched` states `due` with empty lists.
5. In `read`, a 200 JSON `{ok: true, result}` whose `result` is an object with an `entries` list is `read` even when case-import then records it `unreadable` (`not_this_case`); the entry carries case-import's recorded outcome.

## Completion

**Entries applied** (`build/plan/current.md` T31 L10):
- N534: R67 (the cadence tick reads every watch `case-import.watchedImports` answers, to its end; due when never read or a day after its last read; read after the batch's addresses and before the named requests, within R19's 50, oldest due first, each claimed `docket:<import>`; a governed GET of the docket address, at most 8 MiB, `read` or `unreadable` with `http_<status>`, `not_json`, `not_a_docket`, `too_large`, `fetch_failed`; the outcome to `caseImport.recordDocketRead`; governed records nothing; a refusal or throw there is `failed` and keeps the epoch open; no observation row, no capture reachability; the answer's `watched`); R68 (`cadenceDue` due while a watch is due; `cadenceWake` takes the watches' earliest next; a watch offered to the rank as `{kind: "docket", id, waitingSince}`); R30 (no docket read while paused, stated); R36 (only the address case-import holds, and only a public https one). Settled readings 1–5 (K1392) met as worded.
- N538: `civicsmithUserAgent` for the tick's and the docket read's user agent; `SLATE_FRAMING_OPEN` names "a Civicsmith instance".

**Code:** `bio-plane/src/monitoring/index.mjs` (`#watches`, `#readDocket`, `readBounded`, the `caseImport` dependency reached through `caseImportOf`, constants `DOCKET_READ_INTERVAL_MS`, `DOCKET_READ_MAX_BYTES`, `DOCKET_PURPOSE`, `DOCKET_UNREADABLE`). **Tests:** new `test/m/monitoring/docket.test.mjs` (12 tests: R67, R68, R30, R36, R2); `fixture.mjs` gains `stubCaseImport` and `watchOf` (case-import R18 in its Provides' shape) and records each fetch's `init`; `ticks.test.mjs` R19 names `watched` (with the real case-import, no watch).

**Deferred:** none. The `*(not yet met: T31)*` marks on R30, R36, R67, R68 are met; striking them is BOB's (requirements).

**Found in other modules:** none new. affordances (1), control-plane (1) and plane (1) each fail one test on case-import's new ops (`importwatch`, `importunwatch`), identically with and without this change: their L11 jobs' work.

**Tests and checks run:**
- `node --test test/m/monitoring/`: tests 111, pass 111, fail 0.
- Users of monitoring: scheduler 66/66, link-sweep 29/29; affordances 155/156, control-plane 146/147, plane 75/76 (the failures above, pre-existing).
- `format`: 98 modules, 97 requirements files; 0 failures. `architecture monitoring`: 16 product files, 75 relative imports; 0 failures. `coverage monitoring`: 55 of 55 live ids named by a test; 0 failures. `ownership monitoring tranche/T31`: 5 files changed; 0 failures.

Size (session_01P7ix1fsb1sMMLpFiv27Btv): test runs 12, module lines 3363
