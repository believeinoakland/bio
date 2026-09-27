# provenance (T7)

**Status** · session_018s8qz5yiBJo3WgGQi652po · depth 2 · WORKING · handled B0

## J1 · QUESTION

N111: R48's widened read contract, proposed text (fold as K152 did). I carry on against it now.

> **R48** The tables `register` (its `capture_sha`, `bundle_id`, `path` and `registered` columns) and `captured_locators` (its `address_norm`, `address`, `retrieval_locator` and `capture_sha` columns) are a stated read contract: a later module may join them in its own SQL, and this module changes none of those columns' names or meaning without a change to this requirement. `registered` is this module's clock at the register write (R1), an ISO instant, never a caller's time; `address_norm` is the document address as the acquisition that wrote the receipt normalised it (R13), the key a later module seeks a document address on. Every write to them stays this module's.

Why each column: `registered` and `address_norm` are the two retrieval reads (RETRIEVAL #1 REPORT 9: §5.1's cause, retrieval R41; `frontier.mjs` 150, 273, 376, 384; `index.mjs` 940); `address` and `retrieval_locator` are already in the R48 test's join and in the schema comment's contract (`provenance/schema.mjs`), so naming them states what the module already keeps. No column or behaviour changes; the R48 test grows to assert the two new columns' meaning (`registered` is the module's clock; `address_norm` is the receipt's key).

My reading of N92 (no question, stated for the record): `provenanceAudit` goes; provenance registers its C-18 arms with `record.registerAuditCheck("provenance", …)` at `provenanceOf`, and legacy-store's `auditPass` calls promotion's `recordAudit` (already imported there) in place of the dropped wrapper, a net removal in `store.mjs`.
