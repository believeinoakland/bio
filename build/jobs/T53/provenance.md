# provenance (T53)

**Status** · session_018BhcefG3xsWrytnAQMJzis · depth 3 · WAITING: COMPLETE sent to BOB; available for a CHANGE
**Sessions** · 1

## Completion (2026-10-28)

# provenance T53 R1 report

**Entries applied**
- T53-91 (N824, K2425): `EMAIL_VIA` and `EMAIL_ATTACHMENT_VIA` exported. A message by email is graded as an upload (R82): route `email`, undetermined, `CAPTURE_RECEIVED_NOT_FETCHED`, not in `FETCHED_VIAS`, ranked with upload. An attachment earns exactly what its message earns (R84): `route: "email-attachment"`, `basis: "CAPTURE_ATTACHMENT_OF_MESSAGE"`, `message: {sha256, route, basis}`, walked through at most `ARCHIVE_DEPTH_MAX` containers; a bad locator or a chain past the bound answers `CAPTURE_ATTACHMENT_UNRESOLVED`; `fetchedByThisCopy` and `captureGrades` walk the same chain. `recordReceipt` takes `by` and `statement` for `email` as for `upload`. Register (R83): `origin.kind` `email`, methods `emailed` and `emailed-attachment`, the `message` block, and the `container` block admitted for `emailed-attachment`. The C-18.1 origin-kind sentence is now a keyed word (`provenance.register.origin_kind_one_of`), and the two pinned test lines read it by key. The receipt builder for `email-attachment` is `recordReceipt` (it takes the locator `email:<messageSha>!<index>`); `acquisition` writes the receipts, as for `unpacked`. Capture is not asked to build one.
- T53-92 (K5471 (6)): R-24 done: `testify` with a `project` (body, else query) states `project:` in the bundle's front matter, so promotion R53 commits it with that project; `DECLARED_OPS.testify.fields.accepts` gains `project` (R69 lists three fields: the requirement text needs `project` added, BOB's). R-1: the filer is already fixed in code (R81); what remains is PLATFORM's redeploy and re-walk, not this module's.
- T53-93 (K5565): all 8 provenance test files in the english baseline (audit, authority, convert-chain-marker, dec149, grade-origin, register-checks, unpacked, upload; 35 sites) converted to keys. 22 register messages and 2 testify sentences gained keys (`provenance.register.*`, `provenance.testify.*`) with the same words. A site that copied a fragment already covered by an equality assertion was dropped. Words check on the module: 0 failures; with an empty baseline the module's tests show 0 english sites. `build/tests-english-baseline.json` is not touched (BOB prunes it).

**Tests** new `email.test.mjs` (R81–R84, 9 tests, each with its control); whole module 201 + 9 pass.

**Not done / for others**
- A3-R1's test (an `email` or `email-attachment` capture is not `handed_in`) belongs to the module that owns A3-R1, not provenance.
- `capture` R116/R117 write the document and receipts; the `container` block for an attachment is checked here for presence only (its shape is R117's, capture, later in the order).
- Generated artifacts: new `localize` keys stale `setup-words/rows.mjs` and `words-unreviewed.json` (regenerated at merge); I did not commit them.

**Met** · R81, R82, R83, R84, R42

Tests: 211/211. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefG3xsWrytnAQMJzis): test runs 1, module lines 3506
