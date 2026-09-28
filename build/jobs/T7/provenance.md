# provenance (T7)

**Status** · session_018s8qz5yiBJo3WgGQi652po · depth 2 · COMPLETE · handled B4

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

## J3 · COMPLETE

PROVENANCE #2 completes T7's provenance job. The record of completion is this entry.

**Entries applied**
- **N92** (K130, K173): the C-18 register arms (R42–R46) register with record-core's `registerAuditCheck("provenance", …)` in `provenanceOf`; `provenanceAudit` is gone. legacy-store's `auditPass` calls promotion's `recordAudit` in its place (already imported there).
- **N111** (K173): R48 as folded. The R48 test now also asserts `registered` is the module's clock at the register write and `address_norm` is the receipt's key. No code change was needed.
- **B3 / R49** (K171 (13), K176): `attestationsOf(captureSha)` is built with its test. It follows my reading in **J2**, which is still unanswered: it reads both eras (`timestamp` and `attestations[]` of kind `rfc3161`, and `co_archive` as a string or an object), and states `registered` and `undetermined` so that a missing home or an unreadable register never reads as "none". If the answer differs I'll bring the read in line.
- **LEGACY-CHECKS #2 REPORT 4** (forwarded, P9): regions `is-origin-act` and `is-origin-statement` are marked in `declareOrigin`, with `NO_SUCH_BUNDLE` outside both. `is-testify-bytes` now returns `refusal("TESTIMONY_WORDS_REGISTERED", …)` directly. The transaction answers the hit as `{spent: {id, sha}}`, so the squatted id stays spent, as R28 and its test require.
- **A flaw of my own, fixed:** my C-103 refusals (`PROVENANCE_REGISTER_REFUSED`, `ORIGIN_*`, `NO_BUNDLE` at both sites, `RECEIPT_*`) now carry their catalogue row's `code`, `check` and `translation`, as the Provides preamble requires. Each is tested.

**Deferred:** none.

**Legacy lines for BOB's review (ownership, mechanics §12.2).** legacy-store: 2 lines added, 6 removed.
- `store.mjs:224`, the provenance import, less `provenanceAudit` and the three names below.
- `store.mjs:13902`, `await recordAudit(this.ctx, {` in place of `provenanceAudit(`. This is the one ownership failure ("neither imports from nor uses the module's own paths"). It is the rewiring K173 adopted: N92 drops the wrapper, so the caller calls promotion's pass.
- Removed: the statics `Store.TESTIMONY_MAX_BYTES`, `Store.TESTIMONY_FORMAT` and `Store.testimonyBytes`. Each delegated to this module and had no caller in the plane, its tests or the UI (`git grep`). The suites that name them (`testify`, `mk7-attribution`, `nc-mk1`) stay green.

**Found in other modules (REPORT)**
1. **legacy-tests** (the refusal guard `civicos-ui/check-refusal-codes.mjs`, against `tranche/T7` with this job merged):
   - Cleared by this job: the two missing-region FAILs (`is-origin-act`, `is-origin-statement`), and one unclassified outcome (`testify > is-testify-bytes`), so arm C reads 5, not 6.
   - Still owed: arm G reads `PROVENANCE_ACT_CHECKS.NO_BUNDLE` at 2 sites (`declareOrigin`, `provenanceChainRebuild`). Both sites are one condition, and the row's sentence is true at both (LEGACY-CHECKS #2 decision 2), so it wants a `MULTI_SITE_CLOSED` declaration. Arm G's `LISTENER_DECLARED` line names my `onReceipt` among 12 sites (N118's family).
   - Ratchets to re-pin from its print: governed regions 263 (4682 lines), return-position outcomes 178 (my five direct helper calls replace five literal objects, so `refusalsJudged` 617 and `codesChecked` 621 rise), unclassified 5.
   - FAIL lines: 91 on the base, 89 after.
2. **legacy-tests, prose only:** comments in `repair-reachability`, `conformance`, `framework-digest-audit`, `d351-odf-evidentiary`, `check-firing`, `d473-odt-evidentiary`, `testify` (line 439) and `provenance-chain` still name `provenanceAudit` as where the audit runs the C-18 arms. It is now provenance's registered audit check (record-core R59). No assertion reads the name.
3. **Generated artifacts:** `bio-plane/dist/bio-plane.bundled.mjs` embeds this module and `store.mjs`, so it is stale until the layer close regenerates it (manifest §14).

**Tests and checks run**
- Module: `node --test bio-plane/test/m/provenance/`: `tests 55 · pass 55 · fail 0`. Every live id R1–R49 is named by a test. Layer tests: none named in the manifest.
- The 57 old suites that drive the audit, attest, testify, origin, route and chain acts: 53 green. The other 4 (`affordances`, `bounds`, `derivation-bounds`, `meaning-bounds`) are red with identical failure text on the base, my changes stashed.
- `node checks/format.mjs`: `format: 69 modules, 64 requirements files; 0 failures`
- `node checks/architecture.mjs … provenance`: `architecture: 12 product files, 38 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … provenance`: `coverage: 1 modules, 49 of 49 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … provenance tranche/T7`: `ownership: 10 files changed by provenance between tranche/T7 and HEAD; legacy-checks: 0 line(s) added, 0 removed; legacy-store: 2 line(s) added, 6 removed; legacy-index: 0 line(s) added, 0 removed; 1 failure` (the K173 line above).

Size (session_018s8qz5yiBJo3WgGQi652po): test runs 12, module lines 3154
