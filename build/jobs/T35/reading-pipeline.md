# reading-pipeline (T35)

**Status** · session_01AcbJt7jg65wP95NhUuEfxf · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

COMPLETE — T35-24 reading-pipeline, on `job/T35/reading-pipeline` @ e2b58b8f98 (cut from `tranche/T35`; nothing to merge in).

Entries applied:
- DEC-149 sweep, 2 M rows, by the sweep's rule and its proposed text, each named by a test (`test/m/reading-pipeline/dec149.test.mjs`, titles R24 R21 and R4 R9 R11, each pinning its whole sentence at the interface and that it says neither "instance" nor "the plane"):
  - `index.mjs`:591–592 (tier3Extend's note, on the reading's basis): "this document has no text layer to read and no OCR engine is installed in your group's Civicsmith, so nothing is claimed about what it says".
  - `index.mjs`:945 (R24's failed reading): "your group's Civicsmith has no evidence store set up, so the capture's bytes cannot be read".
  - No check row moves (the sweep names none for this module). Negative control: the new tests fail 2/2 against the old wording, pass 2/2 with the new.
- Requirements unchanged (req: none); every live id still met.

Deferred: none.

Found (for BOB; nothing changed outside my paths):
1. Stale generated artifact (§14): `bio-plane/dist/bio-plane.bundled.mjs` (and the copies in `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs` where they embed it) carries the two old sentences; regenerated at L4's close.
2. The sweep's X row `index.mjs`:116 ("no pdf-worker member is bound to this instance, so tier 1's reading stands", `tier2FailureNote`) is classed "names a binding", but it reaches a member: it is on the reading's basis (read.test R3 R11, staffdirectory, convert-chain reading-wire). If BOB reclassifies it M, I would word it "no pdf-worker member is set up in your group's Civicsmith, so tier 1's reading stands"; I left it as the sweep ruled.
3. Same wording, other modules (DEC-149, their own rows): `extraction/index.mjs`:1212 ("this instance has no evidence store bound, so the stored bytes cannot be read again") and `content/index.mjs`:1404 ("this instance has no evidence store bound, …"); both are presumably in extraction's and content's sweep rows. `extraction`'s read.test.mjs:23 matches `/no evidence store/`, which the new text still satisfies.

Tests and checks:
- `node --test test/m/reading-pipeline/` (bio-plane): 87 pass, 0 fail.
- Legacy-path tests: d606-perpage-ocr 28 passed, 0 failed; tier2-wire 46 pass, 0 fail; system/pdf-worker-binding 12 passed, 0 failed. (`tier-pagewise.probe.mjs` is a probe, not run.)
- User check, `node --test test/m/extraction/`: 115 pass, 6 fail; the same six with and without my change (accepted red 6).
- No layer tests named in `build/manifest.md`.
- `checks/format.mjs`: 129 modules, 128 requirements files; 0 failures. `architecture.mjs`: 24 product files, 73 relative imports; 0 failures. `coverage.mjs`: 28 of 28 live requirement ids named by a test; 0 failures. `ownership.mjs … tranche/T35`: 3 files changed; 0 failures.

Size (session_01AcbJt7jg65wP95NhUuEfxf): test runs 8, module lines 1437

## J2 · COMPLETE · re B2

COMPLETE — B2 applied (K1960), on `job/T35/reading-pipeline` @ 400e0a3dee.

- `index.mjs`:116 (`tier2FailureNote`, on the reading's basis) re-classed M and worded as proposed: "tier 1 read essentially nothing of this document and no pdf-worker member is set up in your group's Civicsmith, so tier 1's reading stands".
- Named by a test: `dec149.test.mjs` "R3 R11 (DEC-149, K1960)", pinning the whole sentence through `tier2FailureNote` and on `read`'s basis, and that it says neither "instance" nor "the plane". Negative control: fails 1/1 against the old line, passes with the new.
- The four existing assertions that matched the old phrase (`read.test.mjs`:157, :325; `staffdirectory.test.mjs`:83; `convert-chain.test.mjs`:319) now match the new phrase, no weaker.
- Everything in J1 stands (rows :591–592 and :945); the stale-bundle finding (J1 (1)) now covers this sentence too.

Tests and checks:
- `node --test test/m/reading-pipeline/`: 88 pass, 0 fail.
- d606-perpage-ocr 28 passed, 0 failed; tier2-wire 46 pass, 0 fail; system/pdf-worker-binding 12 passed, 0 failed.
- Users: `node --test test/m/extraction/`: 115 pass, 6 fail, the same six as without my change (accepted red 6). No other module's test names the old sentence.
- `format.mjs` 0 failures; `architecture.mjs` 25 product files, 75 relative imports, 0 failures; `coverage.mjs` 28 of 28, 0 failures; `ownership.mjs … tranche/T35` 6 files changed, 0 failures.

Size (session_01AcbJt7jg65wP95NhUuEfxf): test runs 15, module lines 1438
