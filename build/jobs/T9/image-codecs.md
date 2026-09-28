# image-codecs (T9)

**Status** · session_01NmWHzjUgZb4RbiiKmG4HyX · depth 2 · COMPLETE · handled B1

## J1 · REPORT

**Another module's test pins the old working-set formula (pdf-pixels).** N75 changes what `decodeJpx` holds at once, so the figure R4 puts in a memory refusal's `detail.working_set_bytes` changes. The interface does not change: same key, same code, same detail fields, same bound (61.3 MB).
- **Before:** 4 bytes a sample for every component of the largest tile, plus a tiled image's output.
- **Now:** the 8-bit output, plus the buffers the line-based decode reuses from tile to tile. Those are one code-block row of every band and a few rows of every level, at 4 bytes a sample.
- **Effect on pages:** a single-tile 2550×3300 colour 9/7 page was 101 MB and refused; it is now 31.5 MB and decodes, bit-exact with OpenJPEG.

`pdf-worker/test/jpx.test.mjs` (pdf-pixels' test, R25) patches a fixture's SIZ to one 5000×5000 tile and expects:
- `working_set_bytes` = 5000·5000·4·comps;
- the grey image refused as `IMAGE_TOO_LARGE`.

On this branch, the colour image is still refused, but with the new figure (75 MB of output plus buffers). The grey image (25 MB of output) is no longer refused for memory. Both of those checks fail until pdf-pixels' test is re-pinned. Sizes that are refused under the new formula:
- 5000×5000 colour;
- 8000×8000 grey (64 MB of output).

I am not touching pdf-pixels. I will report its suite's full result in COMPLETE. `ocr-worker`'s bundle, which inlines `jpxdecode.mjs`, is stale again.

## J2 · COMPLETE

**N75 applied: the low-memory, line-based inverse wavelet.** It is used for the 9/7 and, by the same code, the 5/3. Its measurement on a deployed plane stays out, as B1 says.

**What changed in `jpxdecode.mjs`**
- **No component is held whole.** Tier 2 still reads every packet first, which holds only codeword segments. After that:
  - tier 1 decodes one code-block row (2^ycb rows) per band, when the first row of that strip is asked for;
  - each level of the inverse transform pulls rows from the level below and from its three bands;
  - the colour transform, rounding, level shift and clamp run row by row, straight into the output.
- **The vertical lifting runs over a window of S+3 rows** (S is 4 for the 9/7, 2 for the 5/3). When row k arrives, step s is applied to row k−s if that row has the step's parity. Every sample therefore meets the same float32 operations, on the same operands, as the whole-plane `idwt97`/`idwt53` column: the scale by K or 2/K first, and the edges' mirrored neighbour spelled as `step97` spells it. The horizontal pass is unchanged.
- **Buffers come from a pool,** taken in the same order for every tile, so a tiled image reuses them. Nothing is allocated per row. The output is allocated after the first tile's packets have been read, so a short or patched stream is refused without a page-sized allocation.

**The memory bound (R4, N34).** The bound itself (61.3 MB) is unchanged; what it counts is not. The working set is now:
- the 8-bit output;
- plus, for each pool slot, the most any tile asks of it: one strip of every band and each level's line and ring, at 4 bytes a sample.

It is still computed from the headers before anything is allocated. `JPX_REFUSES`' key is unchanged; its description now says what is counted.

**Bit-exact against the current decoder.**
- All 114 OpenJPEG fixtures match.
- A differential run of the new decoder against the pre-change decoder, with the bound lifted, and against opj_decompress 2.5.0, all three agreeing to the bit on 17 streams: odd offsets, tiles with offsets, 4×1024 and 1024×4 code-blocks, all modes, no colour transform, lines of 1–3 samples, and pages up to 3500×4600.
- On the large pages the new decoder is faster: 2550×3300 colour 9/7 takes 2.0–2.3 s against 3.3–3.6 s.

**Measured in node** (`test/codecs/jpx-memory.probe.mjs`: heap plus external memory, sampled every 2 ms from outside the decoding thread). Working set, then live peak above the idle isolate:

| image | working set | live peak |
| --- | --- | --- |
| 1280×1680 grey 5/3 | 3.2 MB | 14.5 MB |
| 1280×1680 colour 9/7 | 9.6 MB | 21.6 MB |
| 1700×2200 colour | 15.4 MB | 28.8 MB |
| 2000×2600 colour | 20.5 MB | 39.8 MB |
| 2550×3300 grey 5/3 | 10.5 MB | 23.2 MB |
| 2550×3300 colour 9/7, one tile | 31.5 MB | 54.3 MB |
| 2550×3300 colour 5/3, one tile | 31.4 MB | 53.3 MB |
| 2550×3300 colour, 1024 tiles | 27.7 MB | 45.9 MB |
| 3500×4600 grey 9/7 | 18.9 MB | 33.1 MB |
| 4400×4600 colour | 71.5 MB | refused |

- **Before this job,** 2000×2600 colour was 62.4 MB and refused, and 2550×3300 colour in one tile was 101 MB and refused.
- **On the same one-tile colour page,** the whole-plane decoder peaked at 119.4 MB and this one at 53.6 MB.
- **The live peak is the working set plus 11–23 MB,** mostly heap. The whole-plane decode's was plus 12–18 MB, so the bound keeps its meaning.

**Tests (P7):** every live id R1–R9 is named.
- `jpx.test.mjs`:
  - new test, "R4 R6 N75 pages past the whole-plane working set decode, to OpenJPEG's bit". It uses 4 single-tile pages in the new `test/codecs/fixtures/jpx-pages.json`, from `make-jpx-pages.py`: real ink from `jbig2-scan-page.pdf`, encoded by opj_compress, with digests from opj_decompress 2.5.0 confirmed by PyMuPDF 1.28.2. The pages are 2550×3300 colour 9/7, colour 5/3, 3500×4600 grey 9/7, and 2551×3301 colour 9/7 with an image offset and 16×256 code-blocks. Together the fixtures are 445 KB.
  - the memory tests are rewritten for the new working set. They check the output alone past the bound; buffers taking a 61.2 MB output past it; taller code-blocks raising the working set; a 4×1024-block page refused where the 64×64-block one is not; the old 101 MB page no longer refused; tiles not escaping the bound; and the 60000² refusal staying under 200 ms.
- `jpx-memory.probe.mjs`: no double copy of its input; new sizes added; prints the output size.

**Tests and checks run:**
- My suites: ccitt 7, dct 7, invariants 8, jbig2 6, jpx 8, mq 6 pass; 0 fail.
- Layer tests: none named in `build/manifest.md`.
- Checks (civicos-process): `format` 0 failures (69 modules, 64 requirements files); `architecture image-codecs` 0 failures; `coverage image-codecs` 9 of 9 live ids, 0 failures; `ownership image-codecs tranche/T9` 6 files, 0 failures.

**Found in other modules:**
- **pdf-pixels** (users' suites, read only):
  - `jpx` is 199 passed, 2 failed on this branch against 201/0 on its base. Both failures are R25's memory-bound pins (J1), which your N255 re-pins.
  - `jbig2` 179/0, `pagepixels` 178/0, `imagecrop` 54/0.
- **ocr-worker's bundle** inlines `jpxdecode.mjs` and is stale; it is for you to regenerate at the layer close.

**Deferred:** nothing in the module.

Size (session_01NmWHzjUgZb4RbiiKmG4HyX): test runs 22, module lines 2981
