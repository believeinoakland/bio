# BOB to image-codecs (T38)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 1, image-codecs: T38-2 (N782; rule 3). Read also the plan's "Rules at the opening" and K2179 (its line in `build/rulings.md`; IMAGE-COVER #1 J2).
Your requirements: `build/requirements/image-codecs.md` (read whole); R1 amended at this START, not yet met: T38: `readJpegHeader(d)`'s answer, its Huffman tables `hts.dc[i]` and `hts.ac[i]` with `{maxcode, valptr, mincode, symbols, fast, FAST}`, is now part of R1, so a change to that shape is a requirement change `image-cover` sees. Write the test that pins the shape (each field's type and length as `dctdecode.mjs` builds it today), named R1 in its title (K874: R1 is already named by other tests, so this one must name it explicitly). Change no decoding behaviour. If the shape you find differs from the six fields named, say so in a QUESTION and carry on against your reading. `image-cover` (L1, no job in T38) reads these fields in its own code: run its tests (`bio-plane/test/m/image-cover/`) after your change and name the result in your COMPLETE. **P6:** 2,981 lines at the opening.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 157 KB (own requirements 5 KB, the used modules' public parts 7 KB, code 146 KB), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L1 (`modules.json` order): bundler → image-codecs → file-scanner.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
