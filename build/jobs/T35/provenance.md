# provenance (T35)

**Status** · session_011BVPDot1xsr4sPx4NrRahU · depth 2 · WORKING · handled B0

## J1 · QUESTION

R42's `unpacked` arm (N688), two points I read as follows and am building on now; answer only if either is wrong.

1. "its `capture.grade` is present exactly when `captureGrade` answers a letter for its capture (R59) and is that letter, and otherwise its `grade_basis` is the archive's". I read "what `captureGrade` answers for its capture" as R59's answer through the route this document's `container` names, i.e. the answer of the archive `container.archive_sha256` (recursively, to `ARCHIVE_DEPTH_MAX`), not the capture's strongest answer over all its receipts. Reason: K1852 (3), "a file later captured directly earns R24's letter beside the first, and nothing is regraded": with the strongest-over-all-routes reading, a later direct receipt would make the archive's bundle carry a new C-18.1 error in the audit (the document says C, captureGrade then says B). This reading also does not depend on acquisition writing the file's `unpacked` receipt before it promotes. "The archive's" `grade_basis` is R59's `archive.basis` (the basis of the archive whose route decided it), or `CAPTURE_UNPACKED_UNRESOLVED` past the depth bound.

2. "its `origin` is that of the archive's own document": the archive's document is the one whose `capture.sha256` is `archive_sha256`, read first from the promoted image's own `data/provenance.json` (unpack files members into the archive's bundle), else from the archive's home bundle's live register. Origins are compared as JSON values, key order ignored. When the archive is held (R5) but no document of it can be found, that is an error finding (the origin cannot be shown).

These record-dependent arms run at the write (promotion check) and in the audit, where the record is at hand. `withRegisterChecks` (ratification's gate, a pure function with no record) gains an optional resolver argument; without one it asks the `container` block's shape and the method pairing only.
