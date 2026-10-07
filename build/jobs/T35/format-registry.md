# format-registry (T35)

**Status** · session_01Kh4KjEZGmcA83CAoYuLqA8 · depth 2 · COMPLETE · handled B2

## Work

**Entry T35-11 applied** (commit "T35-11 format-registry: the zip entry (R28), roster ten (R23)"):
- `bio-plane/src/formats.mjs`: the built-in `zip` entry, registered last (R23: ten entries, `zip` tenth). `detect` with bytes is synchronous and reads the central directory only: `ooxml.hasZipMagic`, `ooxml.readContainer` ok, and neither `[Content_Types].xml` (exact key, as `discriminate` looks it up) nor a `mimetype` member (exact or normalized name, as `discriminate`'s ODF branch looks it up), the same lookups `discriminate` makes before it would inflate anything; `"likely"`. Without bytes: exactly `application/zip` or `application/x-zip-compressed`. `parts` is `ooxml.listArchive(bytes)` unchanged; `structure`, `text` null.
- ooxml is imported as a namespace (`import * as ooxml`) so the module links before ooxml's `listArchive` exists on the tranche; the call resolves at use. A permanent form, not a stub.
- Tests: `zip.test.mjs` (R23, R28 ×5: the bytes rule as an equivalence with `await ooxml.discriminate(bytes)` over 30+ containers built by `zipfix.mjs` in my tests path: plain, ZIP64, malformed, every `CONTAINER_FLAVOURS` row as an office or ODF container, the ODF edge cases; synchronous and never inflating, with `DecompressionStream` trapped; routing through `detectFormat`; the content-type arm; `parts` vs `listArchive` over bytes and a range source). `builtins.test.mjs` R23 and `registry.test.mjs`'s roster constant moved to ten.

**Waiting on ooxml (T35-8).** Until ooxml merges, R28's `parts` test is red (`ooxml.listArchive is not a function`) and the ZIP64 container is refused by both `readContainer` and `discriminate` (so detect answers null on it, which the equivalence test accepts); after the merge both read it and detect answers `zip`. I merge `tranche/T35` once ooxml has merged, re-run steps 5–7 and post COMPLETE.

**Found elsewhere:** `bio-plane/dist/bio-plane.bundled.mjs` (not_product, the plane bundle) is stale from `src/formats.mjs`; BOB regenerates it at L1's close (manifest). No other module's test changed result: acquisition 88/0, capture 127/0, reading-pipeline 85/0, content 126/0, extraction 115/6 (accepted red 6: afterread ×1, convert-chain ×2, pdfstructure ×1, read ×2).

**Runs so far:** `node --test bio-plane/test/m/format-registry/`: pass 32, fail 1 (R28 parts, waiting on ooxml). Checks: format 1 failure (accepted red 13, test-support's make-zip path); architecture 0 failures; coverage 28 of 28 ids named, 0 failures; ownership 0 failures.

## J1 · REPORT

T35-11 built on job/T35/format-registry: the zip entry (R28) registered tenth (R23), detect synchronous from the central directory with the same lookups as ooxml.discriminate, the content-type arm, parts = ooxml.listArchive. Tests 32 pass, 1 red: R28's parts test, until ooxml (T35-8) merges listArchive. Please send a CHANGE when ooxml has merged into tranche/T35; I then merge it, re-run the tests and checks and post COMPLETE. Found: the plane bundle (dist/bio-plane.bundled.mjs) is stale from src/formats.mjs, for your layer-close regeneration. Details in my record's Work section.

## Completion

B2 (K1927: ooxml merged) applied: merged `tranche/T35`; the requirements I read are unchanged except ooxml's, whose changes (R3's ZIP64 read now met, R27's range-source window, R23's digest) touch nothing this module uses beyond `listArchive`, `hasZipMagic`, `readContainer`, `normalizePartName` and the two part-name constants. ZIP64 archives now detect as `zip`, as `discriminate` answers.

- **Entries applied:** T35-11 whole (R28 met, R23 met). No DEC-149 sweep rows for this module (`draft-T35-dec149-l1-l7.md`, "Modules with nothing to change").
- **Deferred:** nothing.
- **Found elsewhere:** the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from `src/formats.mjs` too (with accepted red 15's sources), for L1's close regeneration (§14).
- **Tests:** `node --test bio-plane/test/m/format-registry/`: pass 33, fail 0. Users of the registry: acquisition 88/0, capture 127/0, reading-pipeline 85/0, content 126/0, extraction 115/6 (accepted red 6, the same six tests as before my change).
- **Checks:** format: 0 failures; architecture: 0 failures; coverage: 28 of 28 live requirement ids named by a test, 0 failures; ownership: 0 failures.

Size (session_01Kh4KjEZGmcA83CAoYuLqA8): test runs 21, module lines 350

## J2 · COMPLETE

T35-11 complete on job/T35/format-registry, tranche/T35 merged (B2). R28 and R23 met; format-registry 33/0; acquisition, capture, reading-pipeline, content green, extraction only accepted red 6; format, architecture, coverage (28/28), ownership 0 failures. The plane bundle is stale from src/formats.mjs for L1's close. Record's Completion section has the details.
