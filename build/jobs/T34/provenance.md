# provenance (T34)

**Status** · session_01DBo63Pgm1vRwniMXRiJeBC · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T34-72 applied (N626, K1708). Test-only, as the entry and B1 state; no requirement change, no product code changed.

**Entries applied.** `bio-plane/test/mk6-bundle-names-no-author.test.mjs` now sends `tieAttested: true` on `op=publish` (the signer's no-undeclared-tie attestation, case-authoring R55 / case-disclosures R27). Before: publish refused, so no case document, and every later act failed (`RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE`, `ATTRIBUTION_UNSTATED`), 7/3. After: 10/0, the population is 14 published objects + 2 manifest reads, and no published part names the observer. K1708's named red "provenance mk6" is cleared. The stale comment (a group's first two members must be administrators, `ADMINS_FIRST`) is corrected for DEC-134 (membership R12; C-96.5 retired, K1752); the second administrator enrolment is kept, since the suite does not depend on it.

**Deferred.** Nothing. I did not re-read the module's 2,525 source lines in full, because the entry changes only this test and leaves the source untouched.

**Found in other modules.** Nothing new. K1752 already lists the other stale DEC-134 comments (`stats-disclosure`, `d526-refusal-order`, `civicos-ui/test/review-copy`). Generated artifacts: none staled (test-only).

**Tests.** `mk6-bundle-names-no-author`: 10 pass, 0 fail. The module's tests (`node --test` over `test/m/provenance/` and mk6): 89 tests, 89 pass, 0 fail. No layer tests are named in `build/manifest.md`.

**Checks.** format: 126 modules, 125 requirements files; 0 failures. architecture: 22 product files, 60 relative imports; 0 failures. coverage: 43 of 43 live requirement ids named by a test; 0 failures. ownership: 2 files changed by provenance between tranche/T34 and HEAD; 0 failures.

Size (session_01DBo63Pgm1vRwniMXRiJeBC): test runs 3, module lines 2525
