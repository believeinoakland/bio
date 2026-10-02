# provenance (T26)

**Status** · session_01SdzWp71ywfCMib8J3KaSnR · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied: N516** (B1, K1218, K1220, K1225, K1226, K1228).
- Deleted the pure copies option B kept in T25: `routeFinding`, `instanceStatement` and `attest` (with their private constants `FINDING_MEANS`, `ROUTE_MARK_NOTE`, `RECEIPT_KIND`, `STATEMENT_KIND`, `CAPTURE_HELD_IN_PARTS_ROW`) from `src/provenance/index.mjs`, and `attestOp` with `attestStatus` from `src/provenance/ops.mjs`. The imports only they used went with them: `../tsa.mjs` (signatures') whole, and record-grammar's `isPublicHttpsLocator`.
- Importers confirmed on this tree: no file outside the module imports any of the four names from `provenance/index.mjs` or `provenance/ops.mjs` (named, namespace and dynamic imports all checked; `attestation`'s tests import `instanceStatement`/`attest` from `attestation` and only `PROVENANCE_ACT_CHECKS` from here). No QUESTION needed.
- Tests: the N516 test in `seam.test.mjs` that pinned the copies is replaced by one (R41, N516) asserting at the interface that none of the copies, no C-34/C-89 family and no moved stateful method is exported, and that the module's tables are its three; `testify.test.mjs` R40 no longer feeds the copies' texts; `ops.test.mjs`'s attestOp test deleted and its export list is now `provenanceOps`, `registerAuditOp`.
- **Requirements (for BOB to re-word):** no live R id describes the copies, so none is struck or retired. Two passages still describe them as held: the header paragraph's last sentence ("Option B … its T26 job deletes the copies (N516)") and Suggestions' "Held over until T26" bullet, plus the Uses parenthesis ("the pure copies this module keeps until T26 are named under Suggestions"). They can now say the copies were deleted in T26.
- **`signatures`:** nothing in the module or its tests uses it any longer (its only use was `tsa.mjs` in the `attest` copy). BOB can drop it from `uses`.
- **N502/N508 re-scan** (N469's rule): no `awaiting stamp` note in the module; notes naming the retired store's private members as live re-pointed in `index.mjs`: `Store.testimonyBytes` / `Store.observerRef` → the module's `testimonyBytes` / `observerRef` (and the header's "`Store.x`" sentence re-worded), `#partsNamedFor` → `partsNamed`, `#bundleGate` → `bundleGate`, `#inSight` → membership's `inSight`, and `#conditionBundlesForHost` / `#rosterInSight` now said to be the legacy store's. The header and `ops.mjs`' header say the copies were deleted in T26.
- **Improvement in the module:** `partsNamed` and `registerHolds` each re-implemented the digest normalisation; both now use the module's one `bareSha` (same answers; R5, R6 tests green).

**Deferred:** none.

**Other modules:** the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (its inputs include `src/provenance/`); not regenerated (manifest §14, BOB's at the layer close). `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` still carry the old copies' text: N461's deploy share, not this job's.

**Tests run:**
- `bio-plane/test/m/provenance/`: 88 pass, 0 fail. `test/mk6-bundle-names-no-author.test.mjs`: 1 pass, 0 fail.
- Users of the copies: retrieval 123/0, network-notices 62/0, plane 55/0, acquisition 70/0, capture 116/0; also attestation 19/0, provenance-routes 37/0.
- Whole `bio-plane/test/m`: tests 5340, pass 5329, fail 0, todo 11. No red at all (neither red 2 nor red 3 appeared).

**Checks:** format: 91 modules, 90 requirements files; 0 failures · architecture: 22 product files, 60 relative imports; 0 failures · coverage: 43 of 43 live requirement ids named by a test; 0 failures · ownership: 6 files changed by provenance between tranche/T26 and HEAD; 0 failures.

Size (session_01SdzWp71ywfCMib8J3KaSnR): test runs 10, module lines 2525

## J1 · COMPLETE

N516 applied: routeFinding, instanceStatement, attest (index.mjs) and attestOp (ops.mjs) deleted with the tests that pinned them; no importer outside the module found on this tree. No R id describes the copies (none struck); for BOB to re-word: the header's option-B sentence, Suggestions' 'Held over until T26' bullet and the Uses parenthesis. signatures: no longer used by the module or its tests (tsa.mjs went with attest) — drop it from uses. N502/N508 re-scan: six stale store-member names re-pointed in index.mjs. provenance 88/0; retrieval, network-notices, plane, acquisition, capture all green; whole test/m 5329 pass, 0 fail. Checks all 0 failures. Plane bundle stale (not regenerated). Details in the record.
