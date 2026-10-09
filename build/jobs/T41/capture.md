# capture (T41)

**Status** · session_01DfzCz7CLFcSqit28SNzCXp · depth 2 · WORKING · handled B0

## J1 · QUESTION

Readings of R86 (T41-8a). I build on them now; only (1) changes what I write, and I code it either way behind one line.

(1) The receipt's `by` and statement. R86: the receipt is written "with `by`, the instant and her statement"; `provenance.recordReceipt` (R13) takes neither, and PROVENANCE's J1 (3) asks you the same. Reading, until you answer: the statement and `by` travel in the document (`origin_statement`, `capture.actor`) and in `capture_actors` (R69's actor row, so she may append her signed account); the receipt carries what R13 carries. Consequence: a second upload of bytes already held (`existed: true`, no new document) keeps no record of the second uploader's statement. If you amend provenance R13 to take `by` and `statement`, I pass them (one line) and test that a second sighting keeps them.

(2) The fence. The op's fence is L11's; at this interface I refuse, first, a `by` that is absent, blank or a machine identity (`record-grammar.isMachineIdentity`) as `MEMBER_SESSION_REQUIRED` (403), the code this module's own store-side member fence already answers (`doorbellTally`, R80).

(3) Refusal order: fence; `UPLOAD_NO_STATEMENT` (C-118.10, 400, `maxChars`; translation, until the UX stream's words: "A file brought into the record records where it came from, in your own words, and none was given, or it is longer than 2,000 characters. Write it. Nothing was written."); `name` (`REQUIRED_ARGUMENT_MISSING`, `argument: "name"`, 400); no evidence store (acquisition's `EVIDENCE_STORAGE_NOT_CONFIGURED`, 503, as R65 answers it; R21's storage-absent refusal); then `EMPTY` and `TOO_LARGE` as acquisition R10 answers them (`EMPTY` with `locator`, 502 as acquire answers it; `TOO_LARGE` 413 with `bytes`, `maxBytes`, the stream cancelled). "Writing nothing" for `TOO_LARGE` read as R10 reads it: the 8 MiB parts already stored while streaming stay content-addressed and named by no row, receipt or document. `bytes` is taken as a `ReadableStream` (the raw body), a `Uint8Array`/`ArrayBuffer`, or an async iterable of chunks.

(4) `name_stated`: "also her statement" read as the same shape, `{text, words_of: by, evidence_of_truth: false}`.

(5) `existed`: the record already holds the bytes when `provenance.registerHolds` answers `registered` or `acquired` for the digest (R5), or, for a single part, the store held it before this call (acquisition R11's test). Then no document, `within` not called, the receipt written as a second sighting, `existed: true`, `capture.sha256`.

(6) `within`'s fault: answered as R65's (500, the fixed sentence `PULL_WITHIN_FAILED_DETAIL`), under the code `UPLOAD_WITHIN_FAILED` (a fault of an upload, not a pull); say if you want `PULL_WITHIN_FAILED` itself.

(7) The document: R65's form, `capture.method` `uploaded`, `grade: null`, `grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED"`, `origin: {kind: "upload"}`, `file` `snapshots/upload-<sha256>`, `parts` as acquisition R16's when multi-part, `profile` with `origin: "member"` for `doctypeFor` (acquisition's `profileOf` names an upload as that case, N615), first hop `via: "upload"` from `firstHopWho`. No archive is opened on upload (acquisition R40 is the fetch's; a member may `op=unpack`).

Found in another module (also in my record): `acquisition` does not export R10's 256 MiB (`CAPTURE_MAX`); I state it once here as `UPLOAD_MAX`, citing R10, and would read it from acquisition if it exported it.
