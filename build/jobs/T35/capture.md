# capture (T35)

**Status** · session_013T8uwQxiDgxa5pVNpN7fas · depth 2 · WORKING · handled B0

## J1 · QUESTION

Q1 — the acquisition seam for T35-22 (acquisition's T35-21 is not built yet; I code to this reading and carry on).

My best reading (R73's pattern, acquisition's store-first convention as `acquire(store, body)`):
1. `Capture#unpack(args)` = `acquisition.unpack(this, args)`, `Capture#archiveList(args)` = `acquisition.archiveList(this, args)`, `Capture#memberOf(sha)` = `acquisition.memberOf(this, sha)`; DO routes `unpack` (body `archiveSha`; stamps `by`, `cls` from the query) and `archivelist` (query `archive`, `viewer`, `state`, `limit`, `after`). If ACQUISITION #12 builds `archiveList`/`memberOf` with another argument shape (e.g. `memberOf(store, [shas])`, which R77's "once per page" suggests), I follow it at its merge.
2. R77 asks `memberOf` once per page: I call it per captured digest of the page's rows (one call per capture, bounded by the page) unless acquisition offers a batch form; tell me if you want a batch form asked of ACQUISITION.
3. `ownHosts`: a `captureOf` option (R58 rules: a later caller's different list throws, one taken by default is adopted), held as `cap.ownHosts` (array of host names, default []) for acquisition R42 and capture-sources R55 to read off the store handed in.
4. R15: `TASK_KINDS` gains `archive-unpack`; the event is `{kind: "archive-unpack", captureSha: <archive digest>, subject, locator}`, deduped on (kind, digest) as today; who enqueues it (acquisition when an automatic run stops on a per-call budget) and who drains it (the daemon, as `op=unpack`) are theirs.
5. R85 `country`: `knockOp` takes it from the caller's hooks (`hooks.country`, the control plane's stamp, null until T35-72) and passes it to the store as a query stamp (`?country=`) on `knock` and `doorbellrefused`; `knockAttempt({sourceAddress, country, now})`. Never read from the body.
