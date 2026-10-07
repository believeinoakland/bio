# provenance (T35)

**Status** · session_011BVPDot1xsr4sPx4NrRahU · depth 2 · COMPLETE · handled B3

## Completion (PROVENANCE #17)

**Entry applied: T35-18** (N664 sweep, 7 rows; N688: R15, R42, R48 amended, R59 new; K1799, K1844, K1852, K1940). B2's answer to J1 applied: (1) as read; (2) the archive's document is read only through the record (its home bundle's live register, found by `homeOf`), since each file is its own document in its own bundle.

- **R59** `captureGrade` (`index.mjs`): every route the receipts name answers and `#strongest` picks (determined first, higher letter, then direct, archive.org, unpacked, doorbell; a via no ruling names answers only when no ruled route does). `#unpacked` reads `zip:<sha>!<index>` from the receipt, passes the archive's answer through unchanged but `route: "unpacked"`, `basis: CAPTURE_UNPACKED_FROM_ARCHIVE` and `archive: {sha256, through, route, basis}`, recursively through at most `ooxml`'s `ARCHIVE_DEPTH_MAX` (3) archives; past the bound, a loop, or a malformed locator answers `CAPTURE_UNPACKED_UNRESOLVED` with the reason. Exports `UNPACKED_VIA`, `UNPACKED_FROM_ARCHIVE`, `UNPACKED_UNRESOLVED`. With no `unpacked` receipt every earlier answer is unchanged (R24–R27, R51 tests pass as before).
- **R15, R48**: the receipt table and `recordReceipt` needed no change (`via` is text, part of the key); the tests pin an unpacked row's columns, and that the archive's address finds the archive alone (`receipts`, `versionChain`) while the file answers at `<address>#zip:<index>`.
- **R42** (`register-checks.mjs` `checkContainer`): a `container` block on any other method, or an `unpacked` document with none or a malformed one (each field as R42 states it), is a C-18.1 error. With the record at hand (`Provenance.containerResolver()`: at the write, in the audit, and for any caller that passes it to `withRegisterChecks`): the archive must be registered or acquired (R5); the letter must be R59's answer through the container's archive (a letter exactly when it earns one; otherwise `grade_basis` = `archive.basis`); the origin must equal the archive's own document's (JSON values, key order ignored); no readable document of the archive is a finding. Ratification's gate calls `withRegisterChecks` without a resolver and so asks the shape only (the record's facts were asked at the write and are asked by the audit).
- **DEC-149** (7 rows): `checks.mjs`:138–139 C-103.7 → "Your group's Civicsmith holds no key … Whoever hosts your group's Civicsmith can add one."; `index.mjs` direct, archive and doorbell `why`s and testify's two sentences re-worded as the sweep proposes. New `dec149.test.mjs` names each string; `seam.test.mjs` R58 updated for C-103.7's new words (code and number unchanged).
- **Awaiting stamp:** C-103.7 RECEIPT_NO_KEY, awaiting stamp (its translation moved; T36's promotion job stamps it; row census red 2).

**B3 (CHANGE, K1951):** `register-checks.test.mjs`' pulled-knock fixture's `asserts` now reads "received at the doorbell of your group's Civicsmith", field for field as capture's `#pulledDocument` writes it on `job/T35/capture`; its `who` stays (acquisition's spelling). provenance 102/102; format, architecture, coverage (44/44), ownership (8 files): 0 failures. `tranche/T35` was rewritten after my first merge (the same commits under new hashes, e.g. K1950 `2768b5c252` → `946aa3151c`), so I merged it again and took the tranche's text for every file outside this module's paths; the branch now differs from the tranche only in this module's files and this record.

**Deferred.** None.

**Found in other modules / for BOB.**
- `acquisition` (T35-21): R42 asks, at the file's promotion, that the archive be held and its own document filed in its home first (control-plane's share already says the archive's document is promoted first), and that the file's `capture.grade`, `grade_basis` and `origin` be the archive's as above. The file's own `unpacked` receipt need not precede the promotion.
- `attestation` (T35-19): its tests read C-103.7's translation from `PROVENANCE_ACT_CHECKS`, so they follow the new words; `attest.test.mjs` and `instance-key.test.mjs` pass.
- Generated artifact made stale: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (embeds this module), for L3's close (§14). `newgroup/src/release.mjs` is a released embed and left as it is.
- `bio-plane/test/system/row-census.test.mjs` now names `changed with no record: C-103.7 RECEIPT_NO_KEY` until the row is declared awaiting stamp in its `AWAITING_STAMP` (promotion's suite; red 2).

**Tests and checks**
- `node --test bio-plane/test/m/provenance/*.test.mjs`: tests 102, pass 102, fail 0 (two new files: `unpacked.test.mjs` R15, R48, R59 ×4, R42 ×4; `dec149.test.mjs` ×5). Negative control: R59's route order changed (unpacked after doorbell) → the several-routes test fails; restored.
- `bio-plane/test/mk6-bundle-names-no-author.test.mjs`: 1 pass. No layer tests (manifest).
- Users of the changed service (every module whose `uses` names provenance, 562 test files): tests 4050, pass 4031, fail 17, every failure an accepted red by name: plane ask ×6 (22), extraction ×6 (6), sources contract R1 (21), action-clocks factreader ×2 (14), workbooks R15 (8), control-plane catalogue-end (19; it pins no C-103 row). After B2's change: ratification 212/212.
- `checks/format.mjs`: 129 modules, 128 requirements files, 0 failures. `architecture.mjs provenance`: 0 failures. `coverage.mjs provenance`: 44 of 44 live requirement ids named by a test, 0 failures. `ownership.mjs provenance tranche/T35`: 0 failures.

Size (session_011BVPDot1xsr4sPx4NrRahU): test runs 14, module lines 2696

## J1 · QUESTION

R42's `unpacked` arm (N688), two points I read as follows and am building on now; answer only if either is wrong.

1. "its `capture.grade` is present exactly when `captureGrade` answers a letter for its capture (R59) and is that letter, and otherwise its `grade_basis` is the archive's". I read "what `captureGrade` answers for its capture" as R59's answer through the route this document's `container` names, i.e. the answer of the archive `container.archive_sha256` (recursively, to `ARCHIVE_DEPTH_MAX`), not the capture's strongest answer over all its receipts. Reason: K1852 (3), "a file later captured directly earns R24's letter beside the first, and nothing is regraded": with the strongest-over-all-routes reading, a later direct receipt would make the archive's bundle carry a new C-18.1 error in the audit (the document says C, captureGrade then says B). This reading also does not depend on acquisition writing the file's `unpacked` receipt before it promotes. "The archive's" `grade_basis` is R59's `archive.basis` (the basis of the archive whose route decided it), or `CAPTURE_UNPACKED_UNRESOLVED` past the depth bound.

2. "its `origin` is that of the archive's own document": the archive's document is the one whose `capture.sha256` is `archive_sha256`, read first from the promoted image's own `data/provenance.json` (unpack files members into the archive's bundle), else from the archive's home bundle's live register. Origins are compared as JSON values, key order ignored. When the archive is held (R5) but no document of it can be found, that is an error finding (the origin cannot be shown).

These record-dependent arms run at the write (promotion check) and in the audit, where the record is at hand. `withRegisterChecks` (ratification's gate, a pure function with no record) gains an optional resolver argument; without one it asks the `container` block's shape and the method pairing only.

## J2 · COMPLETE

T35-18 applied (record build/jobs/T35/provenance.md, Completion). R59 captureGrade's unpacked route (archive's answer passed through, recursive to ARCHIVE_DEPTH_MAX, strongest-of-routes order); R42 container arm with B2's correction (archive's document read only through the record; resolver at the write and in the audit; withRegisterChecks takes an optional resolver, ratification asks shape only); R15/R48 pinned by tests; 7 DEC-149 rows with dec149.test.mjs. provenance 102/102; users of provenance 4031/4050, the 17 fails all accepted reds by name; ratification 212/212; format, architecture, coverage (44/44), ownership: 0 failures. Awaiting stamp: C-103.7 RECEIPT_NO_KEY (row census red 2 names it until declared). Stale: the plane bundle, for L3's close. For acquisition (T35-21): the archive's own document must be filed in its home before a file's promotion. Deferred: none.

## J3 · COMPLETE

B3 applied: register-checks.test.mjs's pulled-knock fixture asserts 'received at the doorbell of your group's Civicsmith', as capture's #pulledDocument writes it on job/T35/capture. provenance 102/102; format, architecture, coverage 44/44, ownership: 0 failures. Note: tranche/T35's history was rewritten after my first merge (same commits, new hashes, e.g. K1950 2768b5c252 -> 946aa3151c); I merged it again taking the tranche's text for every non-provenance file, so the branch differs from the tranche only in provenance's files and record.
