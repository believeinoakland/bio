# capture (T42)

**Status** · session_01Kru2kyU9rCEgAQWN4QGh4o · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

The nine moved rows' `where`s (C-85.1–.5, C-118.2, .3, .4, .7). Doorbell R21 says "Each row's `where` names the code in this module [doorbell] that raises it", but K2609 keeps the rows defined once, in capture's `checks.mjs`, which only this job may edit; the map §2 says each `where` is re-pointed (`src/doorbell/index.mjs …` for `#noSuchKnock`, `pullKnock`, `inboxResolve`, `#knockRateRefusal`; `src/doorbell/door.mjs …` for the three pre-store helpers and `knockerSecretWeak`), and plan rule 4 (2) already expects "doorbell's re-pointed `where`s" in the census.

My best reading: this job re-points those nine `where`s in capture's `checks.mjs` to doorbell's files, with the function and region names kept (the map's §2 targets), so the rows name the live raiser; the row's code, number and translation unchanged. I merge after doorbell, so its files exist at my merge. If doorbell's job names its functions or regions differently, I follow its code at merge. Carrying on meanwhile; this decides only the `where` strings.

## Completion (T42-7, N826; B1, B2 K2627, B3 K2629)

**Read whole:** `requirements/capture.md`; layer 3's row and section of `layers.md`; `plan/current.md` rule 3, rule 4 and T42-7; K2607, K2609; `extraction/capture-split.md` whole; doorbell R13, R21, R25; the code this entry changes (`doorbell.mjs`; `index.mjs` 1–200, 440–535, 975–1260; `checks.mjs`; the schema's comments) and the tests it changes (`knocker`, `act`, `services`, `held`, `t35`, `reads`, `figures`, `ops`, `plane`, `relays`, `upload`, `fixture`). A worker read the rest of capture's code and tests in full (`index.mjs` whole, `schema`, `ops`, `grammar`, `archive`, `converts`, `evidence-absent`, `grammar`, `t36`, `t37`, `cap13-reuse-pages`, `d57selflink`) and wrote a ~6 KB summary citing file and line (K2304).

**Applied:**
1. The doorbell code kept whole as a named copy, unused by new code: a header comment naming it the copy deleted in T43 (N849) in `doorbell.mjs`, `index.mjs`' header and its doorbell block, `knocksOf`, `pulledKnocksOf`, `mayClearDiscarded`, the `litigation-hold` slot's comment, the nine routes in `captureOps`, and `schema.mjs`. No SQL, table, route or behaviour of the copy changed.
2. The moved tests left capture (map §6): `doorbell.test.mjs`, `inbox.test.mjs`, `knock-origin.test.mjs` deleted; `knocker.test.mjs` keeps R68, R69, R73 and a rebuilt R37; `t35` loses DEC-149's six doorbell rows and R85; `reads` 156–175, `figures` 47–63, `ops`' `capturePublicOp` arms, `plane`'s `op=knock`, `relays`' `knockOp` all gone; split as §6 says: `act`'s R38 now over an upload, `services`' R74 without the doorbell's five writers.
3. `held.test.mjs`' R76 (K2455) rebuilt over `provenance.recordReceipt({via: DOORBELL_VIA})`, with a capture whose receipts are doorbell and upload (null) and a doorbell receipt beside a fetched one (the note) as controls.
4. R86 tested against its own wording: its own fence (not a string, `member:` naming no member, machine identities) and its own `within` (a thrown non-Error never in the answer; any other answer, a non-object included, carried as `within`); the profile carries no transport or header. Code: the fence now also refuses `member:` with no member id ("blank"), and its comments no longer lean on R65/R80.
5. R37 rebuilt: capture's own rows C-118.1, .5, .6, .8, .9, .10 each at its raiser; the moved rows defined here once with numbers kept; C-118 runs 1–10.
6. K2627 (B2): the nine moved rows' `where`s name doorbell's raisers (`src/doorbell/index.mjs` `#noSuchKnock`, `pullKnock`, `inboxResolve`, `#knockRateRefusal`; `src/doorbell/door.mjs` the three pre-store helpers and `knockerSecretWeak`), as map §2; code, number and translation unchanged; tested in R37. To be matched against doorbell's COMPLETE at my merge.
7. R87 (B3, K2629): `declareTables()` answers one fixed answer on every call (`{ok: true, module: "capture", declared: true}`), and a record already holding every capture table as capture's (a second instance, or doorbell R25 calling first) is held, not re-declared and never a throw; a table another module holds still throws (a wiring fault); no declaration seam answers `NO_DECLARATION_SEAM` every time. `t42.test.mjs` tests it, with negative controls; the old method failed both the repeat and the second-instance arms.

**Readings, not deferrals:** R86's `EMPTY` answers 400 where acquisition's fetch answers 502: R10 states no status for `EMPTY`, and an empty upload is the caller's, not a source's, fault. R86's extra refusals (`EVIDENCE_STORAGE_NOT_CONFIGURED`, `NO_BODY`, `UPLOAD_NOT_STORED`, `RECEIPT_NOT_WRITTEN`) are conditions the wording does not reach; kept, tested. `evidence-absent.test.mjs`:26–29 still lists the moved C-118 keys in `CAPTURE_CHECKS`, true until T43's delete.

**Deferred:** none. The capture measure is 4,108 lines while the copy is kept (K625); about 900 leave with T43's delete.

**Found in other modules (REPORT):** `control-plane/owner-ops.mjs`:52–53 passes `within: q("within")`, a query string, to `uploadCapture`; capture ignores it (not a function), but it reads as unintended (control-plane's). The plane bundle is staled by this job's source change (rule 4 (10), regenerated at L3's close).

**Tests and checks:**
- capture's tests (`test/m/capture/`, `cap13-reuse-pages`, `d57selflink`): `tests 124, pass 124, fail 0, skipped 0`.
- users of `uploadCapture` (affordances, op-declarations, op-grades, store-door, control-plane: 9 files): `tests 118, pass 118, fail 0`, the same before and after.
- the moved rows' readers (acquisition checks, monitoring tick, capture-requests, affordances catalogue, answer-envelope, store-door pull, control-plane envelope/inbox-door/new-ops, promotion): `tests 300, pass 299, fail 1`, the one `catalogue-end.test.mjs` R7/R2/R10 failing identically on `tranche/T42` (rule 4 (6)).
- `format: 147 modules, 146 requirements files; 0 failures`; `architecture: 27 product files, 108 relative imports; 0 failures`; `coverage: 1 modules, 40 of 40 live requirement ids named by a test; 0 failures`; `ownership: 20 files changed by capture between tranche/T42 and HEAD; 0 failures`.

Size (session_01Kru2kyU9rCEgAQWN4QGh4o): test runs 26, module lines 4108

## J2 · REPORT

Two things outside capture. (1) control-plane: `src/control-plane/owner-ops.mjs`:52–53 passes `within: q("within")` (a query string) to `capture.uploadCapture`; capture ignores it since it is not a function, but it reads as unintended. (2) The plane bundle (and anything bundling capture's source) is staled by this job's source change, rule 4 (10).

## J3 · COMPLETE

T42-7 done; record's Completion section has the detail. Doorbell tests out of capture (map §6), held R76 rebuilt over provenance.recordReceipt({via: DOORBELL_VIA}), R86 tested against its own wording (fence now also refuses `member:` naming no member), the doorbell copy named as T43's delete throughout, R37 rebuilt, K2627's nine `where`s re-pointed to doorbell's files (map §2 names; I match doorbell's COMPLETE at my merge), R87 met and tested with negative controls (K2629). capture 124/124; uploadCapture's users 118/118 unchanged; the rows' readers 299/300, the one failure identical on tranche/T42 (rule 4 (6)). format, architecture, coverage (40/40), ownership: 0 failures. Measure 4,108 while the copy is kept. R86 and R87 can lose their not-yet-met marks at merge.

## B4 · CHANGE (K2630), applied

Merged `tranche/T42` (doorbell merged). (1) Doorbell's raisers match the nine `where`s already re-pointed (each region found in `src/doorbell/index.mjs` and `door.mjs`); no change. (2) `plane.test.mjs`' `op=knock` at the plane's door restored (as it stood on the tranche), re-labelled as the copy's test until plane's T42-30. capture: `tests 125, pass 125, fail 0`; doorbell's tests over the re-pointed rows: `tests 69, pass 69, fail 0`; format, architecture, coverage (40 of 40), ownership (20 files): 0 failures.

Size (session_01Kru2kyU9rCEgAQWN4QGh4o): test runs 29, module lines 4108
