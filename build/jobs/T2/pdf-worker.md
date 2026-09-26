# Job record · T2 · pdf-worker

Session: `session_01SSonB7dLsY8mZoHgBAoHT6` (PDF-WORKER #2). BOB: `session_01JwTyEmUPSgvwiHEwzCzoxK` (BOB #41), read from `origin/tranche/T2`.

## Questions and reports for BOB

- **Q1 · answered (K43).** R25's JBIG2 scope now covers symbol-dictionary and text regions, because the held pages use them. `tranche/T2` @ 1cdd6a01 merged; K43's "naming the segment type" is met: every JBIG2 refusal raised in a segment carries `segmentType` and `segment`, and a test names K43.
- **R1 · report: generated artifact stale.** `ocr-worker/dist/ocr-worker.bundled.mjs` inlines `pdf-worker/src/pagepixels.mjs`, which now imports `jbig2decode.mjs`, `jpxdecode.mjs` and `mq.mjs`. `bio-plane/test/fleetbundles.test.mjs` reports it stale: 206,033 B committed against 291,726 B fresh, with three new inputs. This is the only stale bundle; `pdf-worker`'s own bundle is byte-identical, since `index.mjs` does not import the renderer. Regenerate it at the layer close. `ocr-worker`'s job (@ cc8f7103) rebuilt the bundle before this change, so it is stale again.
- **R2 · report: R25 wording.** R25 still says "*(not yet met: D-622)* … Today both filters answer `UNSUPPORTED_FILTER`". It is met now; the last sentence should go.
- **R3 · report: R20 wording.** R20's success shape lists "(ccitt|dct detail when decoded)". The two new routes add `jbig2` and `jpx` detail objects the same way. I recommend "(ccitt|dct|jbig2|jpx detail when decoded)".
- **R4 · report: R24 polarity, a flaw fixed in this module.** An `/ImageMask` sample 0 paints (PDF 32000-1 §8.9.6.2). MuPDF 1.28.2 renders an all-0 mask black and the same mask with `/Decode [1 0]` white. The raw-samples route wrote a mask's PNG as the complement of its samples, so every image mask came out as its negative. It now writes the samples as they are, like DeviceGray, with `/Decode [1 0]` inverting them. R24 does not state a polarity; its test now does, citing MuPDF. `ocr-worker` renders through this code, and its 87 tests still pass.
- **R5 · proposal: a size bound for JPX (a service change, so BOB's or Bob's).** A single-tile colour JPEG 2000 image of 2550×3300 needs three float32 planes of 33.6 MB at once to be pixel-exact with OpenJPEG. I measured it (node, arrayBuffers plus heap, sampled every 5 ms):

  | image | peak memory |
  | --- | --- |
  | 2550×3300 colour, 9/7 | about 130 MB |
  | 2550×3300 grey, 5/3 | 57 MB |
  | the JBIG2 page | 36 MB |

  The colour page is past a 128 MB isolate, together with the capture it is read from. The size class the held pages are in (1280×1680 grey) passes in workerd. No declared refusal says "too large", so an image this big would end the isolate instead of being refused by name. **Recommendation:** add a refusal for a JPX image whose planes would exceed a stated workload bound, expressed as a size (D-312). Or accept the limit until a line-based wavelet is built (deferred below).
- **R6 · report: module size.** `pdf-worker/src` is 4,075 lines (the two decoders are 1,069 and 814 lines, and their shared MQ coder 109). `layers.md` asks BOB to report a module near 4,000 lines.

## Status

**COMPLETE.** D-622 applied. `tranche/T2` @ 1cdd6a01 merged.

## Entries

- **D-622 · applied.** No tier could read a JBIG2 or JPX image-only page; now both are decoded in-isolate, each pixel-exact against an independent decoder.
  - **JBIG2** (`src/jbig2decode.mjs`, and `src/mq.mjs`, the MQ coder shared with JPX). It decodes:
    - generic regions (arithmetic, all four templates, moved adaptive pixels, TPGDON; MMR; unknown data length);
    - generic refinement regions (both templates, TPGRON, onto an intermediate region or the page);
    - symbol dictionaries (arithmetic, refinement/aggregate; Huffman, with standard and custom tables and MMR or raw collective bitmaps; chained dictionaries and export flags);
    - text regions (arithmetic and Huffman; strips, all four corners, transposition, SBDSOFFSET, every combination operator, refinement);
    - pattern dictionaries and halftone regions (arithmetic and MMR, skip);
    - page composition (default pixel, operators, clipping, striped pages of unknown height, end of stripe).

    Refused by name (`JBIG2_REFUSES`): colour extension, the 12-pixel extended template, reused bitmap-coding contexts, Huffman-coded refinement, a necessary extension segment, an undefined segment type, several pages, and no page. A stream that runs out is `TRUNCATED_IMAGE_DATA`: jbig2dec pads with white, and this module does not invent pixels.

    Checked against jbig2dec 0.20 on 108 fixtures. They are the ordinance's 7 real pages byte for byte, jbig2enc output, and a T.88 encoder in `test/fixtures/make-jbig2-fixtures.py` for everything no encoder at hand writes. A fixture is kept only when jbig2dec decodes it, without error, to exactly the picture encoded. Two fixtures are judged by construction:
    - an intermediate generic region, which jbig2dec does not implement;
    - a refinement onto the page away from its origin, where jbig2dec ignores the offset (its own TODO) and this module follows T.88 §7.4.7.4.
  - **JPX** (`src/jpxdecode.mjs`). It decodes:
    - JP2 files and bare codestreams;
    - the 5/3 wavelet exactly, and the 9/7 in OpenJPEG 2.5's own float32 arithmetic (its lifting order, its 1.625732422 high-band scale, `lrintf` rounding), because the irreversible path is not bit-defined by the standard;
    - RCT and ICT; every progression order and POC; layers, precincts and code-block sizes;
    - every code-block mode (bypass, reset, termall, VSC, pterm, segsym);
    - tiles, tile-parts, image and tile offsets, ROI, SOP/EPH, PLT/TLM;
    - expounded and derived quantisation.

    Refused by name (`JPX_REFUSES`): HTJ2K, a JP2 palette, sYCC, a Part 2 capability, and packed packet headers (PPM/PPT), because no encoder at hand writes them, so a decode of them could not be checked. Refused `UNSUPPORTED_SAMPLES`: sub-sampled or signed components, precision other than 8 bits, more than 3 components, a PDF colour space other than DeviceGray, DeviceRGB or a 1- or 3-component ICCBased, a `/Decode` array, and a JPX image mask.

    Checked against opj_decompress (OpenJPEG 2.5.0) on 127 fixtures from `test/fixtures/make-jpx-fixtures.py`. PyMuPDF confirmed every decodable one before it was kept.
  - **Renderer** (`src/pagepixels.mjs`). Two routes, `decoded-jbig2` (1-bit PNG) and `decoded-jpx` (8-bit grey or RGB PNG). Each carries `pixels_sha256` and applies the page's `/Rotate` (R21). `FlateDecode` may come before either filter, as for CCITT; nothing else may. `cropImage` reaches both through `decodeImage` (R31, R32).
  - **End to end (evidence, not committed).** A fresh build of `ocr-worker`'s source under miniflare transcribed both fixture pages at tier 3. The JBIG2 page is 2560×3360 and its `pixels_sha256` c3260e6d… is jbig2dec's. The JPX page is 1280×1680, with digest d0b7e92e… The first line read on both was "B. For multiple-family dwellings, as defined by the District's Business Classification Code". Timings (workerd, harness wall time, not a Worker CPU figure):

    | page | render only | render and OCR |
    | --- | --- | --- |
    | JBIG2 | 1.1 s | 4.7 s |
    | JPX | 0.6 s | 3.9 s |

    In node the full JBIG2 page decodes in 0.05–0.23 s, and a full 2550×3300 colour 9/7 JPX in 4.0 s.

## Flaws found in this module and fixed

- **An `/ImageMask` rendered as its negative** (R4 above).
- **R38's test read a fixed list of five source files**, so a new decoder would have gone unchecked. It now reads every file in `src/`, and says the decoders are among them.
- **The R19 test and the R31 crop test used a JPX image as their "no decoder" example.** They now use `LZWDecode`, which is still refused. The interim R25 section of `pagepixels.test.mjs` now checks that eight zero bytes are refused by each decoder.

## Deferred

- **A line-based (low-memory) wavelet for large colour JPX images**, R5 above. It is a substantial rebuild of the transform stage and waits on BOB's answer about a size refusal.
- **PPM/PPT packed packet headers** are refused by name, not decoded, until an encoder that writes them is available to make a verifiable fixture.

## Found in other modules

- `ocr-worker`'s bundle is stale (R1). Nothing in `ocr-worker`'s source needs to change: it takes any `image/png` route, and its PNG reader already handles 1-bit and 8-bit grey and RGB.

## Tests and checks run

On `job/T2/pdf-worker` with `tranche/T2` @ 1cdd6a01 merged:
- `node test/structure.test.mjs` — structure: 78 passed, 0 failed
- `node test/pagepixels.test.mjs` — pagepixels: 173 passed, 0 failed
- `node test/imagecrop.test.mjs` — imagecrop: 54 passed, 0 failed
- `node test/jbig2.test.mjs` — jbig2: 179 passed, 0 failed
- `node test/jpx.test.mjs` — jpx: 197 passed, 0 failed
- `ocr-worker` (uses `renderPageToPixels`): `node test/ocr-worker.test.mjs` — ocr-worker: 87 passed, 0 failed
- `bio-plane/test/fleetbundles.test.mjs` — fails only on the `ocr-worker` bundle's staleness (R1); `pdf-worker`'s bundle is byte-identical
- `checks/format.mjs` — 61 modules, 23 requirements files; 0 failures
- `checks/architecture.mjs … pdf-worker` — 37 product files, 39 relative imports; 0 failures
- `checks/coverage.mjs … pdf-worker` — 1 modules, 40 of 40 live requirement ids named by a test; 0 failures
- `checks/ownership.mjs … pdf-worker tranche/T2` — 18 files changed by pdf-worker between tranche/T2 and HEAD; 0 failures

## Metrics

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01SSonB7dLsY8mZoHgBAoHT6,job,pdf-worker,77178574,621348,368,302192,184,24,4075
```
