# format-registry (T35)

**Status** · session_01Kh4KjEZGmcA83CAoYuLqA8 · depth 2 · WORKING · handled B1

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
