# provenance (T7)

**Status** · session_018s8qz5yiBJo3WgGQi652po · depth 2 · WORKING · handled B0

## J1 · QUESTION

N111: R48's widened read contract, proposed text (fold as K152 did). I carry on against it now.

> **R48** The tables `register` (its `capture_sha`, `bundle_id`, `path` and `registered` columns) and `captured_locators` (its `address_norm`, `address`, `retrieval_locator` and `capture_sha` columns) are a stated read contract: a later module may join them in its own SQL, and this module changes none of those columns' names or meaning without a change to this requirement. `registered` is this module's clock at the register write (R1), an ISO instant, never a caller's time; `address_norm` is the document address as the acquisition that wrote the receipt normalised it (R13), the key a later module seeks a document address on. Every write to them stays this module's.

Why each column: `registered` and `address_norm` are the two retrieval reads (RETRIEVAL #1 REPORT 9: §5.1's cause, retrieval R41; `frontier.mjs` 150, 273, 376, 384; `index.mjs` 940); `address` and `retrieval_locator` are already in the R48 test's join and in the schema comment's contract (`provenance/schema.mjs`), so naming them states what the module already keeps. No column or behaviour changes; the R48 test grows to assert the two new columns' meaning (`registered` is the module's clock; `address_norm` is the receipt's key).

My reading of N92 (no question, stated for the record): `provenanceAudit` goes; provenance registers its C-18 arms with `record.registerAuditCheck("provenance", …)` at `provenanceOf`, and legacy-store's `auditPass` calls promotion's `recordAudit` (already imported there) in place of the dropped wrapper, a net removal in `store.mjs`.

## J2 · QUESTION

B3 (R49 `attestationsOf`): a small read, built in this job. Two points where the text and the record differ; my reading, which I am building now:

1. **Where R32's token is recorded.** R49 reads each entry's `timestamp`. That is the daemon-era shape (State Rules v1.5 §4.1: `timestamp {authority, token_file, encoding, caveat?}`, and `co_archive` as a bare locator string). The plane's own writer, `setup.mjs` (~1107–1111), records `attest`'s answer as `attestations: [{file, kind: "rfc3161", service, sha256, bytes, over}]` and `co_archive: {service, locator}`. Reading `timestamp` alone would answer "no attestation" for every capture this plane attested. So R49 reads all three, in the entry's order (`timestamp`, then each `attestations[]` of kind `rfc3161`, then `co_archive`): `service` from `service` or `authority`, `file` from `file` or `token_file`, `token_sha` from `sha256`; `co_archive` as a string or `{service, locator}`. `at` is the `attempted` instant of the entry's matching `attestation_attempts` row when it is a string (the daemon's boolean `attempted` gives none). `path` is `data/provenance.json`, the file the attestation is recorded in.
2. **No register row, or an unreadable register, is not "no attestation"** (R37). A capture held only in parts is registered by its parts' digests, not the whole's (`setup.mjs` registers `doc.parts`), so R49 finds no home for the whole digest the timestamp is over. So the answer also carries `registered` (a register row names the digest under an existing bundle, R4), and, when the answer cannot be determined, `undetermined` with why (no home; the home's `data/provenance.json` held as a blob, absent or unparsable). `attestations: []` without `undetermined` is the earned "none recorded". Plus a `note` saying no authority was asked and no signature verified.

Proposed wording, if you fold it: "…from each document entry that registers it: its `timestamp` (daemon era) and each `attestations[]` entry of kind `rfc3161` (R32's token, as `op=attest`'s answer is recorded) and its `co_archive` … The answer also states `registered`, and `undetermined` with why when no register row names the capture under an existing bundle (a capture registered only by its parts) or the home's register cannot be read; `attestations: []` alone means none is recorded."
