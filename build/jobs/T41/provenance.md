# provenance (T41)

**Status** · session_01RyvfASFN7ZibC8F4dKNdSS · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings of R63, and one gap between R63 and capture R86. I carry on with my readings; only (3) needs an answer before I would build anything for it.

(1) Where `origin_statement` sits. Reading: a top-level field of the provenance document (R86: "her statement as `origin_statement: {text, words_of: by, evidence_of_truth: false}`" beside `source`, `name_stated`), not inside `origin`. C-18.1 then asks, for a document of `origin.kind` `upload`: no `capture.grade`; `capture.grade_basis` `CAPTURE_RECEIVED_NOT_FETCHED`; `capture.method` `uploaded`; `origin_statement` an object with `text` a non-blank string, `words_of` a non-blank string, `evidence_of_truth` exactly `false`. Each failure an error finding.

(2) The pairing, as R42 does for `container`/`unpacked`. Reading: an `origin_statement` on a document whose `origin.kind` is not `upload`, or `capture.method` `uploaded` on a document whose origin is not `upload`, is also a C-18.1 error finding (a statement or method that belongs to an upload, on something that is not one). I do not cap `text` at 2,000 characters here (R86's `UPLOAD_NO_STATEMENT` is capture's refusal); say if you want R42 to repeat it.

(3) Gap: capture R86 says its receipt is written "with `by`, the instant and her statement", and its Suggestion says "R86's receipt carries her statement so that a second sighting keeps it; if `provenance.recordReceipt` takes no such field, that is `provenance`'s amendment too." `recordReceipt` (R13) takes no `by` and no statement, and `captured_locators` has no such columns; R63 as written does not amend R13, R16, R47, R48 or R60. My reading: I do not add them in this job (R63 is the contract); capture records its statement in the document as R86 says, and the second sighting's receipt carries what R13 carries. If you want the receipt to carry `by` and the statement, amend R13 (and R16/R60's rows, R47's payload, R48's contract) and send a CHANGE; I can do it in this job.

## Completion

**Entry applied.** T41-7a: R63 as amended by K2449.
- `UPLOAD_VIA = "upload"` exported. `captureGrade` grades an upload exactly as R51 grades a doorbell capture, with `route: "upload"`. The two routes share one answer, the new `#received` in `index.mjs`, so they cannot drift apart. The doorbell's `why` is unchanged.
- `upload` is not in `FETCHED_VIAS` (R62).
- In R59's tie order, `ROUTE_RANK.upload` equals `doorbell`'s.
- C-18.1 (`register-checks.mjs`, exported `UPLOAD_ORIGIN`, `UPLOADED_METHOD`):
  - `ORIGIN_KINDS` gains `upload`.
  - An upload document must have no letter and R51's `grade_basis`, method `uploaded`, and `origin_statement` `{text, words_of, evidence_of_truth: false}` with `text` and `words_of` non-blank.
  - The method or a statement on a document of any other origin is an error.
  - A file cut out of an uploaded archive (method `unpacked`, the archive's origin) owes neither. R42's `container` rule needs that origin, so without this exemption every such file would be refused. My reading worker found this.
- K2449 (3): `recordReceipt` takes `by` and `statement` for `via: "upload"` only.
  - They are stored in a new column `captured_locators.uploads`: a JSON array of `{by, statement, at}`, one entry per sighting, appended. The column is added at boot; earlier rows read null.
  - R16's and R60's rows answer `uploads` (null on any other route). R47's payload carries this sighting's `by` and `statement` (null on any other route).
  - A non-string `by` or `statement` is held as null, never coerced.
  - The `schema.mjs` comment that called the table "holding nothing a member wrote" is corrected: only a legacy table without `via` is ever dropped.
- R26's `why` no longer names "a member's upload" as unrecorded.

**Tests.**
- New `test/m/provenance/upload.test.mjs`, 8 tests named R63, each with negative controls (K874):
  - the answer is field-for-field R51's;
  - a later fetch governs;
  - not fetched, including a file of an uploaded archive;
  - tie order;
  - the sightings, answered by R16, R60 and R47, with a negative control over five other routes;
  - the boot migration;
  - the pure C-18.1 arms;
  - C-18.1 at the write, with nothing written on refusal.
- `unpacked.test.mjs` gains one R63/R42 test: a file of an uploaded archive.
- Re-pinned to the requirement's new shapes (no assertion loosened):
  - `register-checks.test.mjs`: the origin-kinds message names `upload`;
  - `ops`, `receipts`, `reputation`, `unpacked`: rows gain `uploads: null`, and the payload gains `by: null, statement: null`.
- Negative control: with `src/provenance` reverted, `upload.test.mjs` fails.

**Runs.**
- `node --test test/m/provenance/`: 130 tests, 130 pass, 0 fail.
- `test/mk6-bundle-names-no-author.test.mjs`: 10 pass, 0 fail.
- Users' suites (every module whose `uses` names provenance, plus scheduler): 5,023 tests, 95 fail. Every failing location also fails with `src/provenance` reverted (the base run of those files: 100 fail). So none is mine; they are inherited reds (rule 4).

**Checks.** format: 0 failures. architecture (provenance): 0 failures. coverage: 48 of 48 live ids; 0 failures. ownership vs tranche/T41: 0 failures.

**Reading set (K2304).** The set was over 300 KB (code 189 KB, tests 260 KB, requirements 43 KB).
- I read whole: `requirements/provenance.md`; layer 3's row of `layers.md`; plan entries T41-7a and T41-8a, rule 4, and K2425, K2434, K2449; `register-checks.mjs`; and `index.mjs` lines 1–130 and 940–1130 (constants, grade, `#strongest`, `#unpacked`, `fetchedByThisCopy`, `recordReceipt`, `receipts`).
- I read these parts in full as I changed them: the `schema.mjs` table and migration, the `ops.mjs` receipt arm, and the R51/R59/R62/R42 doorbell tests.
- I read capture R86 and its Suggestion for the document's shape.
- A worker read the rest of the code and tests in full and wrote a summary of about 11 KB, every statement citing file and line (index, schema, checks, ops, all 19 test files and the three root tests).
- What the summary surfaced mattered: the exemption for an uploaded archive's file, which I fixed. Nothing it left out mattered.

**Deferred.** None.

**Found in other modules (also in REPORT J2).**
- (a) `leg-earning/index.mjs:629` words every `CAPTURE_RECEIVED_NOT_FETCHED` route as "received through the doorbell", which misdescribes an upload.
- (b) `provenance-routes/index.mjs:143` gives a doorbell document its own one-hop chain from `source.receipt.knock_id`. An upload document (`source.receipt` with no `knock_id`) falls through to the generic path.
- (c) `op=recordcapturedlocator` (this module's R53 arm) passes a caller's body to `recordReceipt`, so whoever holds that op could write an upload receipt naming any `by`. That is pre-existing for every via. Which credential reaches the op is op-declarations' (R53).

Size (session_01RyvfASFN7ZibC8F4dKNdSS): test runs 12, module lines 2849
