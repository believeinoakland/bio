# capture (T35)

**Status** · session_013T8uwQxiDgxa5pVNpN7fas · depth 2 · RUNNING until 2026-10-07T16:17:01Z (the users' tests, on my branch and on tranche/T35) · handled B4

## J1 · QUESTION

Q1 — the acquisition seam for T35-22 (acquisition's T35-21 is not built yet; I code to this reading and carry on).

My best reading (R73's pattern, acquisition's store-first convention as `acquire(store, body)`):
1. `Capture#unpack(args)` = `acquisition.unpack(this, args)`, `Capture#archiveList(args)` = `acquisition.archiveList(this, args)`, `Capture#memberOf(sha)` = `acquisition.memberOf(this, sha)`; DO routes `unpack` (body `archiveSha`; stamps `by`, `cls` from the query) and `archivelist` (query `archive`, `viewer`, `state`, `limit`, `after`). If ACQUISITION #12 builds `archiveList`/`memberOf` with another argument shape (e.g. `memberOf(store, [shas])`, which R77's "once per page" suggests), I follow it at its merge.
2. R77 asks `memberOf` once per page: I call it per captured digest of the page's rows (one call per capture, bounded by the page) unless acquisition offers a batch form; tell me if you want a batch form asked of ACQUISITION.
3. `ownHosts`: a `captureOf` option (R58 rules: a later caller's different list throws, one taken by default is adopted), held as `cap.ownHosts` (array of host names, default []) for acquisition R42 and capture-sources R55 to read off the store handed in.
4. R15: `TASK_KINDS` gains `archive-unpack`; the event is `{kind: "archive-unpack", captureSha: <archive digest>, subject, locator}`, deduped on (kind, digest) as today; who enqueues it (acquisition when an automatic run stops on a per-call budget) and who drains it (the daemon, as `op=unpack`) are theirs.
5. R85 `country`: `knockOp` takes it from the caller's hooks (`hooks.country`, the control plane's stamp, null until T35-72) and passes it to the store as a query stamp (`?country=`) on `knock` and `doorbellrefused`; `knockAttempt({sourceAddress, country, now})`. Never read from the body.

## J2 · REPORT

Progress, and two findings for other modules. Applied B2. B3 waits on ACQUISITION #12's merge (its branch has no `acquisitionOf`, `archiveList` or `memberOf` yet); please ring me when acquisition is merged into `tranche/T35`, and I merge it, build `store.acquisition`, re-point `unpack`/`archiveList`/`memberOf` to it and write R77's grouping tests against the real `archiveList`.

Done on `job/T35/capture` (pushed, 143/143 of the module's tests pass): the 11 DEC-149 rows, each named by a test (`t35.test.mjs`); R85 (every R53 refusal and every R71 refusal counted once as `handover` through `credentials.securityCount`, `country` the query stamp, never the body; `knockOp` takes `hooks.country`); R15's `archive-unpack` kind; R45's `taskEvents`/`taskEventCount` take an optional `kind`; `cap.ownHosts` (a `captureOf` option under R58's rules); R77's grouping code (beside its archive, `HELD_FILES_IN_ROW` 50, `limit` counts rows), pending the real `archiveList`.

Findings (REPORT):
1. `tasks` (its drain, `tasks/index.mjs`:313, :391, :444, :965) reads every `task_queue` event and would try to route an `archive-unpack` event as a task. With R45's new optional `kind`, tasks' drain should pass `kind: "authority-undetermined"` (and its counts likewise); the daemon's drain passes `kind: "archive-unpack"`. Harmless until acquisition enqueues one; R45's wording gains "with `kind`, only that kind's" (BOB's).
2. `provenance`'s test fixture `test/m/provenance/register-checks.test.mjs`:195 copies the old pulled-knock wording ("received at this instance's doorbell"); it pins nothing of mine (a literal fixture), so nothing is red, but it no longer matches what capture writes.
3. R48's quoted `stated` now reads "at most 10 knocks to this group's inbox in any 10 minutes, …" (BOB amends R48's text at my merge, as B1 said).
