# image-codecs (T38)

**Status** · session_014rRSsfp8Sqbc9QHisanAS9 · depth 2 · WORKING · handled B1

## Reading set (mechanics §17, N739)

Read whole, as B1 measured it (157 KB, under the 300 KB limit): `build/requirements/image-codecs.md`; the public part of `test-support` (its one Use); layer 1's contract in `build/layers.md`; the five source files (`mq.mjs`, `dctdecode.mjs`, `jbig2decode.mjs`, `jpxdecode.mjs`, `ccittdecode.mjs`); the plan's T38-2 entry, its "Rules at the opening" and K2179. Beyond the set, also read whole: every test under `pdf-worker/test/codecs/` and the five fixture generators. The fixtures' JSON was not read (large data fixtures, K2053), apart from listing the DCT variants' names.

## Entries applied (T38-2)

- **T38-2** (N782, rule 3, K2179): R1 now states the shape of `readJpegHeader`'s Huffman tables. The new test in `pdf-worker/test/codecs/dct.test.mjs` is titled "R1 readJpegHeader's Huffman tables: hts.dc[i] and hts.ac[i], each {maxcode, valptr, mincode, symbols, fast, FAST}, typed and sized as stated" and names R1 in its title (K874). It derives each table from the file's DHT bytes alone (T.81 Annex C code assignment, Annex F.2.2.3 decoder tables) and checks every field of every table whole against it. It pins this shape:
  - `hts` holds exactly `dc` and `ac`, each an array indexed by table id, holding exactly the ids the file defines; a later DHT for an id replaces the earlier one.
  - Each table has exactly six fields:
    - `maxcode`: an Int32Array of 18 (index l for l = 1..16, -1 for a length with no codes, index 17 = 0x7fffffff).
    - `valptr` and `mincode`: Int32Arrays of 17.
    - `symbols`: a Uint8Array as long as the table's symbols.
    - `fast`: an Int32Array of 512, entries `(length << 8) | symbol` for codes of 9 bits or fewer, -1 elsewhere.
    - `FAST`: the number 9.
  - It covers every fixture whose header reads (14) and a constructed header with table ids 3 and 2, two tables in one DHT, codes up to 16 bits, and a redefined table.
  - It fails if a field's type, length or content changes. I checked this with five mutations of `buildHuffman` (FAST 10, maxcode of 17, symbols as a plain Array, a seventh field, one mincode changed): each turned the test red, and the source was restored.
  - The shape I found is the six fields B1 names, so I posted no QUESTION. No decoding behaviour changed: `pdf-worker/src/` is untouched.

## Deferred

- **A DHT whose codes overflow their length is not refused.** libjpeg's `jdhuff.c` refuses such a table ("Bogus Huffman table definition"). Here `buildHuffman` builds it, and typed-array writes past `fast`'s end are silently dropped. A conforming file never carries one, and every fixture decodes bit-exact. Making it a `CORRUPT_DATA` refusal would change decoding behaviour, which T38-2 forbids, so I suggest it as an entry for a later tranche.

## Found in other modules

None. `image-cover` reads exactly these six fields (`bio-plane/src/image-cover/jpeg.mjs`: `fast`, `FAST`, `maxcode`, `symbols`, `valptr`, `mincode`), and its tests pass unchanged.

## Tests and checks

- `node --test pdf-worker/test/codecs/`: tests 43, pass 43, fail 0, skipped 0.
- `node --test bio-plane/test/m/image-cover/` (B1's ask): tests 10, pass 10, fail 0, skipped 0.
- The manifest names no layer tests.
- `checks/format.mjs`: 136 modules, 135 requirements files; 0 failures.
- `checks/architecture.mjs … image-codecs`: 22 product files, 20 relative imports; 0 failures.
- `checks/coverage.mjs … image-codecs`: 9 of 9 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … image-codecs tranche/T38`: 0 failures.

Size (session_014rRSsfp8Sqbc9QHisanAS9): test runs 8, module lines 2981

## J1 · COMPLETE

T38-2 applied (N782, K2179). R1 now has a test pinning readJpegHeader's Huffman table shape, titled 'R1 readJpegHeader's Huffman tables: …' in pdf-worker/test/codecs/dct.test.mjs. hts.dc[i] and hts.ac[i] each hold exactly {maxcode Int32Array(18), valptr Int32Array(17), mincode Int32Array(17), symbols Uint8Array(table's symbols), fast Int32Array(512), FAST 9}. Each table is checked whole against tables the test derives from the DHT bytes, over 14 fixtures and a constructed header; five mutations each turn it red. The shape matched the six fields B1 names, so I asked no QUESTION. No source changed. Tests: codecs 43/43. image-cover (bio-plane/test/m/image-cover/) 10/10. Checks format, architecture, coverage (9/9) and ownership: 0 failures. Deferred: a DHT whose codes overflow is not refused as libjpeg refuses it, since refusing it would change decoding (see the record). Nothing found in other modules. Size: test runs 8, module lines 2981.
