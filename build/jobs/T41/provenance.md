# provenance (T41)

**Status** · session_01RyvfASFN7ZibC8F4dKNdSS · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings of R63, and one gap between R63 and capture R86. I carry on with my readings; only (3) needs an answer before I would build anything for it.

(1) Where `origin_statement` sits. Reading: a top-level field of the provenance document (R86: "her statement as `origin_statement: {text, words_of: by, evidence_of_truth: false}`" beside `source`, `name_stated`), not inside `origin`. C-18.1 then asks, for a document of `origin.kind` `upload`: no `capture.grade`; `capture.grade_basis` `CAPTURE_RECEIVED_NOT_FETCHED`; `capture.method` `uploaded`; `origin_statement` an object with `text` a non-blank string, `words_of` a non-blank string, `evidence_of_truth` exactly `false`. Each failure an error finding.

(2) The pairing, as R42 does for `container`/`unpacked`. Reading: an `origin_statement` on a document whose `origin.kind` is not `upload`, or `capture.method` `uploaded` on a document whose origin is not `upload`, is also a C-18.1 error finding (a statement or method that belongs to an upload, on something that is not one). I do not cap `text` at 2,000 characters here (R86's `UPLOAD_NO_STATEMENT` is capture's refusal); say if you want R42 to repeat it.

(3) Gap: capture R86 says its receipt is written "with `by`, the instant and her statement", and its Suggestion says "R86's receipt carries her statement so that a second sighting keeps it; if `provenance.recordReceipt` takes no such field, that is `provenance`'s amendment too." `recordReceipt` (R13) takes no `by` and no statement, and `captured_locators` has no such columns; R63 as written does not amend R13, R16, R47, R48 or R60. My reading: I do not add them in this job (R63 is the contract); capture records its statement in the document as R86 says, and the second sighting's receipt carries what R13 carries. If you want the receipt to carry `by` and the statement, amend R13 (and R16/R60's rows, R47's payload, R48's contract) and send a CHANGE; I can do it in this job.
