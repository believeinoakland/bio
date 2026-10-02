# network-notices (T25)

**Status** · session_01Xmknu5rGF5DJySuKiZEqtc · depth 2 · COMPLETE · handled B1

## Completion (NETWORK-NOTICES #3, 2026-10-02)

**Entries applied** (`build/plan/current.md` T25 L8, B1 START):
- N512's user side: `instanceStatement` is imported from `bio-plane/src/attestation/` (no longer provenance's pure copy, so N516 may delete it); `instanceSign`, `instanceKeys` and `instanceKeyBound` are taken from an attestation instance handed in as `deps.attestation` (else `attestationOf(host)` on the same host, as every other neighbour is reached). The module no longer imports or reaches `provenance` at all. R1 (key check through attestation R6), R13 (signing through attestation R5), R21 (`copy` from attestation R5's `instanceKeys`).
- Fixture builds the real `attestation` module (with the instance key) over the real `provenance`, and hands it to network-notices; `activity.test.mjs` imports `instanceStatement` from attestation; the R1/R4/R13 tests drive `w.attestation`.
- New R21 test against the real attestation module: `copy` equals `attestation.instanceKeys()` restricted to the keys that signed an attestation, with `first_used` and the label; a replaced instance key stays listed beside the new one; a key that signed only a receipt (attestation R4) is not listed; each listed key verifies the attestations it signed.
- N502/N508 re-scan of this module: the only stale kind was naming provenance R56/R57 as the key's owner (header, deps list, R1 and R13 comments), re-worded to attestation R5/R6. `checks.mjs`'s "stamped by 1.54.0" is accurate. No legacy store, dispatcher or legacy-index named.

**Deferred:** none.

**Found in other modules (REPORT to BOB):**
- `modules.json`: network-notices' `uses` still lists `provenance`; its code no longer imports or reaches it (only attestation's fixture construction needs it, in the tests). BOB's to drop or keep.
- Red in the whole `test/m`, none touching network-notices, each failing identically on `origin/tranche/T25` without this job's change (checked in a clean worktree): affordances `sources.test.mjs`:117 R2 reattest (stubs `provenance.attest`; reads as red 7 or 9); promotion `write-path.test.mjs`:218 R53 (through the plane's `/list`; reads as red 9); control-plane `families.test.mjs` R22 and `catalogue-end.test.mjs` R43 (red 8). Also red 7 by name: case-authoring `preflight.test.mjs` (13) and filings `outward.test.mjs` (2), `packet.test.mjs` (1).
- No catalogue row added or changed (red 6: none). No generated artifact staled: network-notices is no bundle's input (`build/manifest.md`).

**Tests and checks:**
- `node --test bio-plane/test/m/network-notices/`: tests 62, pass 62, fail 0 (was 61 tests, most red with `NOTICE_NO_INSTANCE_KEY`, before the change).
- `node --test bio-plane/test/m/`: tests 5331, pass 5300, fail 20, skipped 0, todo 11; the 20 are exactly the inherited reds listed above.
- `checks/format.mjs`: 91 modules, 90 requirements files; 0 failures. `checks/architecture.mjs … network-notices`: 10 product files, 54 relative imports; 0 failures. `checks/coverage.mjs … network-notices`: 30 of 30 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … network-notices tranche/T25`: 0 failures.

Size (session_01Xmknu5rGF5DJySuKiZEqtc): test runs 5, module lines 1376
