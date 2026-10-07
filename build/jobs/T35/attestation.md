# attestation (T35)

**Status** · session_01VTQaHgTy8PBDCChE2kLgVw · depth 2 · WORKING · handled B1

## Completion (ATTESTATION #3, T35-19)

**Entries applied.**
- (N688; K1852 (1)) R7 as amended: `attestationsOf` reads, for each register entry naming the capture with `capture.method: "unpacked"`, the archive its `container.archive_sha256` names, by the same read, recursively, through at most `ARCHIVE_DEPTH_MAX` archives (imported from `ooxml`, the edge BOB added at the START). Each archive attestation is answered as its entry states it, with `inherited: {from, through}` (`through` outermost first, as provenance R59's `archive.through`); the capture's own come first and carry none. A chain past the bound, an archive whose home's register cannot be read or that no register names, and an `unpacked` entry whose container block names no 64-hex archive and whole index are each stated in `undetermined` (joined with "; ") beside what was read. `note` adds the inherited-token sentence only for an unpacked capture; the answer for any other capture is unchanged. The per-capture read is one private method (`#recordedFor`), so the capture and each archive are read alike.
- (DEC-149, plan rule 4) The nine rows: `checks.mjs`:26, :27, :29 (C-89.1's translation; the row is `awaiting stamp` until T36's promotion job, accepted red 2), `index.mjs`:107, :117, :124, :201, :239, `ops.mjs`:28, each "your group's Civicsmith", each named by its own test in `wording.test.mjs`. Also, under the same rule, the sentence after :239 ("The operator binds one as a secret" → "Whoever hosts your group's Civicsmith sets one as a secret"), tested. `schema.mjs`:7, :9 are X (SQL comments) and stay.
- Tests: `inherit.test.mjs` (R7's inheritance, three tests; the world is the register as the unpack act records it, held by replay so provenance's C-18 arms, amended in parallel by T35-18, neither refuse nor are needed), `wording.test.mjs` (ten tests); `ops.test.mjs` re-pointed to ops.mjs:28's new words; the fixture's `promoteInfo` takes `replay`. Each new test was checked against a planted defect (`through` reversed; the bound off by one): each fails.

**Deferred.** None.

**Found in other modules (REPORT J1).**
- control-plane: `bio-plane/test/m/control-plane/rows-before-r43.json`:177 pins C-89.1's translation digest (`177eb6506e64bd82`); the DEC-149 rewording stales it. `catalogue-end.test.mjs` is already red (accepted red 19, failing first on C-29.3), so nothing new turns red, but control-plane's T35-72 must re-pin C-89.1 too.
- provenance: none. R7 reads only the register; it does not depend on provenance's T35-18 code, and its tests pass on `tranche/T35` as it stands.

**Tests and checks run.**
- `node --test test/m/attestation/` (bio-plane): tests 32, pass 32, fail 0.
- Users of attestation (acquisition, capture, cap13-reuse-pages, d57selflink, docket, network-notices, case-disclosures, case-authoring, filings, affordances, control-plane, plane): tests 1119, pass 1112, fail 7, all inherited: plane `ask.test.mjs` ×6 (red 22) and control-plane `catalogue-end.test.mjs` ×1 (red 19); the same 7 fail on `tranche/T35` without this change. `system/migrate-released.test.mjs`: 1 pass.
- `checks/format.mjs`: 0 failures. `architecture.mjs attestation`: 11 product files, 0 failures. `coverage.mjs attestation`: 10 of 10 live ids, 0 failures. `ownership.mjs attestation tranche/T35`: 0 failures.

Size (session_01VTQaHgTy8PBDCChE2kLgVw): test runs 9, module lines 613

## J1 · REPORT

control-plane: test/m/control-plane/rows-before-r43.json:177 pins C-89.1's translation digest (177eb6506e64bd82). T35-19's DEC-149 rewording of C-89.1 (checks.mjs:26, :27, :29) stales it. catalogue-end.test.mjs is already red (accepted red 19, first failing on C-29.3), so nothing new turns red; control-plane's T35-72 should re-pin C-89.1 with the rows red 19 names. Nothing else found in another module.
