# case-carriage (T39)

**Status** · session_01LmwYYcJzTZXw2vJWwsENHv · depth 2 · WORKING · handled B1

## Completion (T39-10, N806)

**Reading set (mechanics §17, K2304).** I measured the set mechanics §3 asks for at about 250 KB, under 300 KB, so I read it whole myself:
- `build/requirements/case-carriage.md` (28 KB) and layer 8's row of `build/layers.md`;
- `plan/draft-T39-N806.md` (14 KB), the T39-10 entry, and K2315, K2333, K2334, K2343, K2365;
- the used services my Uses names: `doc-clean`'s public part (R1–R6, `CLEAN_MAX_BYTES`), `provenance` R47 `onReceipt`, R48, R62 `fetchedByThisCopy` and `FETCHED_VIAS` (with their code at `index.mjs`:848–960, 1069–1105), `membership` R81 `listenerRefusal`, `record-core` R66 `afterCommit`, and `file-safety`'s R39/R40 wake and arming pattern (read for form only);
- every file of my module (`index.mjs`, `schema.mjs`, `checks.mjs`) and every test file under its `tests` path, `fixture.mjs` included.

**Entries applied.**
- **R15.** Queueing:
  - A `provenance.onReceipt` listener, registered once at creation (`start()`), queues a capture whose receipt `via` is not in `FETCHED_VIAS`. There is one row per digest, written inside the receipt's transaction, and a capture already derived is not queued again.
  - `documentCopy`'s miss queues too.
  - New tables: `document_copy_queue` (`capture`, `queued`, `tried`) and the append-only record `document_copies` (`state` public/clean/copy/refused, `sha256`, `bytes`, `format`, `refused_code`, `refused_detail`, `at`). Both are declared to record-core with their classes (R12; `CASE_CARRIAGE_DOCUMENT_TABLES`).
- **R15, continued.** `copyBatch({limit})`:
  - It takes due documents oldest first, at most `limit`, bounded by `DOCUMENT_COPY_BATCH_MAX` = 10.
  - It asks R62 again: a document fetched since is recorded `public`.
  - A register byte count over `CLEAN_MAX_BYTES` is refused `DOCUMENT_TOO_LARGE` without being read.
  - Otherwise it reads the bytes by digest from the evidence store and runs `doc-clean.cleanDocument`. A clean document is recorded `clean`; a refusal is recorded with doc-clean's `{code, detail}`.
  - A copy is held at `<store>/obscured/<sha>` with `customMetadata {derived: "cleaned", original, label: COPY_CLEANED_LABEL}`. It is never registered.
  - A failed read, bytes at another digest, or a copy that cannot be held leaves the document queued with `tried` stamped. It is retried no sooner than `DOCUMENT_COPY_RETRY_MS` (300,000) later.
  - A photo found in the queue leaves it; its copy is R11's.
  - With no evidence store or bucket bound, it answers `DOCUMENT_COPY_NO_STORE`, new row C-141.11 with BOB's draft words.
  - Its answer is `{ok, copied, clean, public, refused, failed, remaining}`. Batches run one at a time.
- **R15, `copyWake(now)`.** Null while nothing is queued. `now` while any queued document is untried; otherwise the earliest `tried + RETRY`, never before `now`. It answers in the form `now` was given (milliseconds or ISO) and reads only the tables.
- **R16 `documentCopy`.** Synchronous, no bucket read. It checks in this order: `photo` first, then `public` from R62, then the latest record row (`clean`, `copy`, `refused`), then the queue (`pending`). A miss is queued and answered `pending`. `undetermined` covers an R62 that cannot be asked, tables that cannot be read, or a malformed digest.
- **R17 `onCopyWork`.** Registration goes through `listenerRefusal`. After a commit that newly queues a document (record-core `afterCommit`), each listener gets `{at}` (`copyWake` in milliseconds). Nothing is called on a rollback. A listener that throws or rejects is contained.
- **R1.** An included member document whose state is not `clean` is answered unheld (`kind` `document`, `MEMBER_DOCUMENT_ONLY_AS_COPY`). This is checked after the "no bytes" check, so an uncaptured digest still answers "holds no bytes". A clean member document carried whole carries none of R8's files. `#holdCopy` also finds a document's copy in `document_copies`.
- **R8.** A walk that reaches an archive R62 does not answer fetched stops: the archive goes in unheld (`ARCHIVE_SUPPLIED_BY_MEMBER`). This is checked before the image check.
- **R13.** Every row now carries `kind` (`photo` or `document`).
  - A copy row for a non-photo lapses unless the copy is the document's current copy.
  - A member document carried whole lapses unless its state is `clean`.
  - An `undetermined` state lapses (fail closed).
  - My reading: a digest the register holds no capture under is not a member document. R1 answers it unheld, never refused, so R13 does not lapse it. A register that cannot be read lapses.
- **Constants and labels.** `COPY_CLEANED_LABEL` is in `checks.mjs` with BOB's draft words. `MEMBER_DOCUMENT_ONLY_AS_COPY` and `ARCHIVE_SUPPLIED_BY_MEMBER` are exported.

**Tests.** New `documents.test.mjs` has 11 tests, run against the real `doc-clean` on doc-clean's own fixtures (a PDF whose JPEG carries GPS EXIF and whose /Info names an author). They cover:
- explicit R15, R16 and R17 tests;
- a fetched PDF held whole;
- a knock PDF carried as its copy only, with every doc-clean SECRET absent from the copy;
- a refused document (`IMAGE_NOT_CLEANABLE`) and a pending one;
- R13's document lapses and its fail-closed arm;
- queueing from a receipt and from a miss;
- a document fetched after queueing, recorded `public`;
- `copyWake`'s three answers and that it survives a restart;
- a member's archive carried for no material;
- R12's declaration and the append-only record.

The fixture now records a `direct` receipt for `doc()` by default (`w.receipt`). The existing tests were adapted where their archives needed a fetch receipt, and R13 rows gained `kind`.
- `node --test bio-plane/test/m/case-carriage/`: tests 67, pass 67, fail 0.
- The manifest names no layer tests.

**Checks.** format: 139 modules, 137 requirements files; 0 failures. architecture (case-carriage): 0 failures. coverage (case-carriage): 17 of 17 live ids named by a test; 0 failures. ownership (case-carriage, tranche/T39): 0 failures.

**Deferred.** None. The `*(not yet met: T39)*` marks on Purpose, R1, R8, R13 and R15–R17 are BOB's to strike.

**Found in other modules (REPORT J1).** I ran the tests of every module that uses case-carriage (`modules.json`). Each failure below comes from the requirement change itself, not from a defect in case-carriage. Their fixtures hold documents with no fetch receipt, which R62 now reads as member-supplied:
1. **`publication`:** 128/5 (was 133/0). R22, R57 ×3, R58: their documents have no receipt, so R13 lapses them and the commit is refused with C-122.6 `PHOTO_MARKS_CHANGED_SINCE`. R13's document rows are owed C-122.7 by T39-11. The fix is a `direct` receipt for each fixture document carried whole (or an R13 `kind: "document"` arm, T39-11).
2. **`case-authoring`:** 140/24 (was 164/0). Its fixture's ratify is refused for the same reason.
3. **`affordances`:** 219/1 (was 220/0). Its R14/R8/R18 publication fixture, same reason.
4. **`plane`:** 150/1 (was 151/0). `test/m/plane/docket.test.mjs`:54 lists case-carriage's purge-cleared tables and now also sees `document_copies` and `document_copy_queue` (R12, T39).

`case-disclosures`, `scheduler`, `op-declarations`, `answer-envelope` and `control-plane` are unchanged and green. **Also:** C-141.11 `DOCUMENT_COPY_NO_STORE` is a new row for promotion's stamp. Its words end "Nothing was made.", as R15's draft words do.

Size (session_01LmwYYcJzTZXw2vJWwsENHv): test runs 16, module lines 1324

**B2 (CHANGE), applied.** `tranche/T39` was merged in, bringing case-grammar T39-9 (K2374). After the merge, `test/m/case-carriage`: tests 67, pass 67, fail 0. format (138 requirements files), architecture, coverage (17/17) and ownership each report 0 failures. Nothing in this module needed to change. `case-checker/program.mjs` is stale from case-grammar, not from this job, and is accepted by name.

## J1 · REPORT

T39-10 changes what R1 and R13 answer for a document no receipt fetched (R62 fetched:false), as K2333 intends. Four users' tests go red because their fixtures hold documents with no fetch receipt: publication 128/5 (R22, R57 x3, R58: the commit is refused C-122.6, because R13 now lapses a member document carried whole; T39-11 owes C-122.7 for those rows), case-authoring 140/24 (its fixture ratify is refused the same way), affordances 219/1 (the R14/R8/R18 publication fixture), and plane 150/1 (docket.test.mjs:54 lists case-carriage's purge-cleared tables and now also sees document_copies and document_copy_queue, R12). The fix in each is fixture-only: a direct receipt (provenance recordReceipt) for each document carried whole, and the two table names in plane's list. case-disclosures, scheduler, op-declarations, answer-envelope and control-plane are green. New for promotion's stamp: C-141.11 DOCUMENT_COPY_NO_STORE. One reading of mine, stated in the record: R13 does not lapse a digest the register holds no capture under (R1 answers it unheld, never refused), so publication's never refuses for a material it cannot hold arm keeps holding.

## J2 · COMPLETE

T39-10 done. R15 (receipt listener and miss queue, copyBatch with DOCUMENT_COPY_BATCH_MAX 10, DOCUMENT_COPY_RETRY_MS 300000, copyWake), R16 documentCopy (all seven states) and R17 onCopyWork are built, and R1, R8 and R13 are amended (R13 rows carry kind). The copy is held at <store>/obscured/<sha> (customMetadata derived cleaned, original, label COPY_CLEANED_LABEL) and recorded in the append-only document_copies table. C-141.11 DOCUMENT_COPY_NO_STORE is new. test/m/case-carriage: 67/0, including the new documents.test.mjs with explicit R15, R16 and R17 tests run against the real doc-clean. Checks: format, architecture, coverage (17/17) and ownership each report 0 failures. Module 1,324 lines (984 + 340). Users made red by the requirement change: see J2 (fixture-only fixes). The not-yet-met marks are yours to strike. Record: build/jobs/T39/case-carriage.md.
