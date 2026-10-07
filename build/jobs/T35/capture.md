# capture (T35)

**Status** · session_013T8uwQxiDgxa5pVNpN7fas · depth 2 · COMPLETE · handled B5

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

## J3 · COMPLETE

COMPLETE — T35-22 capture, on `job/T35/capture` (tranche/T35 @ 17758a92a0 merged in).

Entries applied:
- DEC-149 sweep, 6 M and 5 P rows, each named by a test (`test/m/capture/t35.test.mjs`): `checks.mjs` C-85.3 ("The size this inbox will read…"), C-85.4 ("larger than this inbox stores … set its Civicsmith up"); `doorbell.mjs`:24 (`stated`: "at most 10 knocks to this group's inbox in any 10 minutes, …"), :51; `index.mjs` :447, :770, :857, :1033, :1045, :1414; `ops.mjs`:150. C-85.3/C-85.4 translations re-worded: rows await stamp (accepted red 2).
- N703 / R85: every R53 refusal (Worker-side through `doorbellrefused`, store-side in `knock`) and every R71 refusal counted once through `credentials.securityCount({kind: "handover", country})`, beside R80's tally; `country` only from the control plane's stamp (`hooks.country` in `knockOp`, `?country=` on the store routes), never the body; a count that cannot be written is dropped. No capture table for it.
- DEC-167 / R77: an archive's document is one row with `archive` (archiveList's summary) and `files` (its held files the viewer may see under the same filters, index order, at most `HELD_FILES_IN_ROW` = 50, `files_total`, `files_truncated`); a file beside an archive-row is no row; a file whose archive is not a row carries `archive: {sha256}`; `limit` counts rows (windowed read). `memberOf` asked per captured digest of each window (B2).
- B3/B5 / R73: `store.acquisition` (acquisition's instance, made when first reached; a record with no table seam reads as none); `Capture#unpack/archiveList/memberOf` delegate to acquisition's merged functions; DO routes `unpack` (archive from the body, `by`/`cls`/`member` stamps) and `archivelist`; `store.ownHosts` (a `captureOf` option under R58: adopted, lower-cased, a different list refused); R58 also covers `acquisition`.
- K1940 shares: R15's `archive-unpack` kind; R45's `taskEvents`/`taskEventCount` take an optional `kind` (BOB words R45 at merge, B4).

Deferred: none.

Found in other modules (REPORT):
1. acquisition R41: `archiveList` answers `ok: true` for any held capture that is not an archive (its listing refused whole, `entries: 0`, `opened: false`) rather than a refusal; R41 names only `BAD_SHA` and `ARCHIVE_NOT_HELD`. Capture guards it (an archive is one acquisition opened, or one whose listing reads entries), but a screen reading `archiveList` directly would show any file as an unreadable archive.
2. Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` embeds capture's source (regenerated by BOB at layer close, §14).
3. (from J2) tasks' drain must pass `kind: "authority-undetermined"` (T35-77); provenance's fixture wording (forwarded).

Tests and checks:
- capture's tests (`test/m/capture/`, `cap13-reuse-pages`, `d57selflink`): `tests 151, pass 151, fail 0`.
- every user's tests (`tests` of each module whose `uses` names capture, plus publication, queue, acquisition): mine `tests 2787, pass 2770, fail 15`; the same on `tranche/T35` @ 17758a92a0: `tests 2783, pass 2764, fail 17`. Every red of mine is red on the tranche (no new red; the tranche's two extra are capture-requests' plane R19/R42/R38 and extraction `convert-tiers`).
- `format: 129 modules, 128 requirements files; 0 failures`; `architecture: 25 product files, 106 relative imports …; 0 failures`; `coverage: 1 modules, 58 of 58 live requirement ids named by a test; 0 failures`; `ownership: 9 files changed by capture between tranche/T35 and HEAD; 0 failures`.

P6: capture is 3,784 lines (was 3,576).
Size (session_013T8uwQxiDgxa5pVNpN7fas): test runs 11, module lines 3784
