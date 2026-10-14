# ooxml (T48)

**Status** · session_01GsfZaFc33QdfZbY8e4atXq · depth 2 · WORKING · handled B1

## Completion

**Read, whole:** `build/requirements/ooxml.md`; the public part of `test-support` (its only use); layer 1's contract in `build/layers.md` (and its helper-module notes); bundler R31 and its `measureStart` (how a global scope is measured); my entry T48-6 and the plan's "Rules at the opening"; every file of my code (`bio-plane/src/ooxml.mjs`) and tests (`ooxml.test.mjs`, `archive.test.mjs`, `vba.test.mjs`, `cfb.mjs`, `zip.mjs`) (P20). No entry names snapshot work.

**Entry applied:** T48-6 (N1039; K3147, K3195): R34. Evaluating the module now builds none of its derived tables:
- the CRC-32 table is built on the first CRC computed (`crc32`, `readPart`'s verification or a cut's running check) and kept;
- the SHA-256 round constants become a table on the module's first own digest (the streamed cut where the host has no `DigestStream`) and are kept;
- the VBA name matchers (about 160 compiled expressions, plus one `RegExp` compiled per name to test its ends) are compiled on the first `readVbaProject` and kept, per table;
- `CONTAINER_FLAVOURS` is written row by row instead of spread and mapped (`MACRO_ROW` and `MACRO_FLAVOURS` are gone). Its plain and ODF rows are still the very objects of `OOXML_FLAVOURS` and `ODF_FLAVOURS`, and each macro row keeps its keys in T47's order.
- The exported literal tables (`IMAGE_MIME_BY_EXT`, `ARCHIVE_LIMITS`, the VBA tables, the flavour rows) stay literals, as the requirement's Suggestions allow; the new test shows evaluation builds nothing.
- Measured (a fresh import, as bundler R31 measures one, best of several): about 3.7–5.3 ms before, 2.6 ms after.

**Found and fixed in my module (P8):** `readCfb` built a UTF-16 decoder for every 128-byte directory entry; it now builds one per walk. The `_rels` section's header still said ODF's part-map was "when built"; corrected (ODF carries no `_rels`; its manifest is its part list).

**Tests:** new `startup.test.mjs`, 5 tests naming R34:
- a fresh evaluation constructs no typed array or `RegExp` and runs no array `map`, `filter`, `find`, `flatMap`, `forEach`, `reduce`, `from` or iteration; its import time is reported against bundler R31's 500 ms budget; a control shows the watch sees a table being built. Run against the T47 module, this test fails, as it should.
- `crc32` answers the known vectors on a fresh evaluation's first call and every later one (and against zlib over many lengths), without building its table again; a fresh evaluation whose first CRC is `readPart`'s or `streamMember`'s answers rightly.
- the module's own SHA-256 is right on its first digest and later ones;
- the VBA matchers: right on the first project read and later ones, with no `RegExp` compiled again, and equal to the long-used instance's answer;
- every export keeps its T47 value and shape (names, function arities, constants, `CONTAINER_FLAVOURS`, `OOXML_FLAVOURS`, `ODF_FLAVOURS`, `IMAGE_MIME_BY_EXT`, `ARCHIVE_LIMITS` in full, frozen as before; the VBA tables by length, ends and the SHA-256 of their JSON), before any use and after every service has run.
R1–R33's existing tests are unchanged and pass (every service's answer unchanged).

**Deferred:** none.

**Found in another module:** none. My change stales the plane bundle (and any built artifact carrying `ooxml.mjs`); that is rule 5 (5), regenerated at the layer's close.

**Tests and checks run:**
- ooxml: `node --test bio-plane/test/m/ooxml/`: tests 62, pass 62, fail 0 (57 before, plus 5 new).
- Users of the module (no service changed, run as a check): office-readers 107/0; odf-reader 70/0; format-registry 42/0; doc-clean 39 pass, 0 fail (1 skipped); provenance 130/0; attestation 32/0.
- `node checks/format.mjs`: 168 modules, 166 requirements files; 0 failures.
- `node checks/architecture.mjs . ooxml`: 7 product files, 15 relative imports; 0 failures.
- `node checks/coverage.mjs . ooxml`: 34 of 34 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . ooxml tranche/T48`: 3 files changed; 0 failures.
- `node checks/run.mjs` over the product: format 0, architecture 0 and channels 0 failures; coverage 6 failures, all other L1 modules' T48 ids (bundler R32, court-citations R11, file-scanner R32, jurisdictions R89–R92, record-grammar R63, signatures R45 R48; rule 5 (1)), none of them ooxml's.
- R34's `*(not yet met: T48)*` mark is BOB's to clear at the merge.

Size (session_01GsfZaFc33QdfZbY8e4atXq): test runs 14, module lines 2032
