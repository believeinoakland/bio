<!-- Split proposal for pdf-worker, written for BOB on 2026-09-26 on tranche/T3 by a drafting worker (plan entry N34). Uncommitted; BOB reviews it. -->
# pdf-worker — split proposal

**Status** · ADOPTED by BOB #42, 2026-09-26 (K70): the recommended three-module split, applied when T4 opens. Measured 2026-09-26 on `tranche/T3` by a drafting worker. Why: `pdf-worker` is 4,075 lines of code, past the 4,000-line review mark (`layers.md`, ruling 1; P6), and N34's next job adds a JPX memory refusal and a low-memory wavelet to `jpxdecode.mjs`, its second-largest file. The contract read is `build/requirements/pdf-worker.md` (R1–R40, DRAFT, all met in T2).

## 1. What the module is today

| file | lines | what it does | imports |
| --- | --- | --- | --- |
| `src/index.mjs` | 223 | the Worker: `POST /structure` (tier-2 text via `unpdf`), `GET /version`, `SURFACE` | `unpdf`, `pdf-reader` (`extractPdfStructure`) |
| `src/pagepixels.mjs` | 1,130 | `renderPageToPixels`, `analyzePage`, `loadPdf`, `decodeImage` (filter chains, routes, `REFUSALS`), CCITT G3/G4 decoder (lines 696–931, 236 lines), rotation, PNG writer | `pdf-reader`, `dctdecode`, `jbig2decode`, `jpxdecode` |
| `src/imagecrop.mjs` | 127 | `cropImage`, `CROP_REFUSALS` | `pdf-reader`, `pagepixels` |
| `src/pagepixels-worker.mjs` | 44 | workerd-only test entry for `renderPageToPixels` | `pagepixels` |
| `src/dctdecode.mjs` | 559 | baseline JPEG decoder, `DctRefusal` | none |
| `src/jbig2decode.mjs` | 1,069 | JBIG2 decoder, `JBIG2_REFUSES` | `mq` |
| `src/jpxdecode.mjs` | 814 | JPEG 2000 decoder, `JPX_REFUSES` | `mq` |
| `src/mq.mjs` | 109 | MQ arithmetic decoder shared by JBIG2 and JPX | none |
| **code total** | **4,075** | (plus `scripts/build.mjs`, 39) | |

Two facts shape the split. First, **the Worker's own bundle holds none of the pixel code**: `dist/pdf-worker.bundle.json` lists only `src/index.mjs` and the plane's `pdfstructure`, `subresources` and `cpu`. The pixel path is a library that `ocr-worker` imports directly (`ocr-worker/src/member.mjs:41`), and `ocr-worker`'s bundle already lists `pagepixels`, `dctdecode`, `jbig2decode`, `jpxdecode` and `mq` as inputs. Second, the decoders are pure (bytes in, samples or a refusal out) and know nothing of PDF. So the one module today is three things: a deployed Worker, a page-pixel library and a set of image codecs.

## 2. Recommended split: three modules, files left where they are

Total order within layer 1: `… pdf-reader, format-registry, text-chain, docprofile,` **`image-codecs, pdf-pixels, pdf-worker`**`, ocr-worker …`.

| module | purpose | files | lines | uses |
| --- | --- | --- | --- | --- |
| `image-codecs` | Pure image decoders: bytes to samples, pixel-exact against an independent reference, or a declared refusal. No PDF, no PNG, no I/O. | `mq`, `dctdecode`, `jbig2decode`, `jpxdecode`, and a new `ccittdecode.mjs` (the CCITT block moved out of `pagepixels`) | 2,551 + 236 = **~2,787** | none (`test-support` for tests) |
| `pdf-pixels` | A PDF page or placed image as upright PNG pixels: page analysis, filter chains and routes, rotation, PNG, crop; the `REFUSALS` and `CROP_REFUSALS` vocabularies. | `pagepixels`, `imagecrop`, `pagepixels-worker` | 1,301 − 236 = **~1,065** | `pdf-reader`, `image-codecs`, `test-support` |
| `pdf-worker` | The tier-2 Worker: `/structure`, `/version`, `SURFACE`, its bundle and deployment. | `index`, `scripts/build.mjs`, `fleet-member.json`, `wrangler.jsonc`, `package*.json`, `dist/` | **223** (262 with the build script) | `pdf-reader`, `bundler`, `test-support` |

N34's JPX work lands in `image-codecs` (then about 2,900–3,100 lines, still well under the mark) and maps its refusal in `pdf-pixels`.

**Files stay in `pdf-worker/`.** Paths are file-level and the most specific path wins (as for `bio-plane/src/*`), so no import, no `ocr-worker` source and no bundle-manifest input path changes. Moving to top-level `image-codecs/` and `pdf-pixels/` directories is cleaner but rewrites imports in `ocr-worker`, eight legacy plane tests and five of this module's tests, and stales both bundles; it can follow later at no extra risk.

### modules.json entries

```
{"id": "image-codecs", "layer": 1,
 "paths": ["pdf-worker/src/mq.mjs", "pdf-worker/src/dctdecode.mjs", "pdf-worker/src/jbig2decode.mjs",
           "pdf-worker/src/jpxdecode.mjs", "pdf-worker/src/ccittdecode.mjs"],
 "tests": ["pdf-worker/test/codecs/", "pdf-worker/test/fixtures/make-dct-fixtures.py", "pdf-worker/test/fixtures/dct-variants.json",
           "pdf-worker/test/fixtures/make-jbig2-fixtures.py", "pdf-worker/test/fixtures/jbig2-variants.json",
           "pdf-worker/test/fixtures/make-jpx-fixtures.py", "pdf-worker/test/fixtures/jpx-variants.json"],
 "uses": ["test-support"]},
{"id": "pdf-pixels", "layer": 1,
 "paths": ["pdf-worker/src/pagepixels.mjs", "pdf-worker/src/imagecrop.mjs", "pdf-worker/src/pagepixels-worker.mjs"],
 "tests": ["pdf-worker/test/pagepixels.test.mjs", "pdf-worker/test/imagecrop.test.mjs", "pdf-worker/test/jbig2.test.mjs",
           "pdf-worker/test/jpx.test.mjs", "pdf-worker/test/pagepixels-corpus.probe.mjs", "pdf-worker/test/agenda-scan-census.probe.mjs",
           "pdf-worker/test/fixtures/scan-ccitt-g4-page.pdf", "pdf-worker/test/fixtures/scan-dct-page.pdf",
           "pdf-worker/test/fixtures/jbig2-scan-page.pdf", "pdf-worker/test/fixtures/jpx-scan-page.pdf"],
 "uses": ["pdf-reader", "image-codecs", "test-support"]},
{"id": "pdf-worker", "layer": 1, "paths": ["pdf-worker/"], "tests": ["pdf-worker/test/"],
 "uses": ["pdf-reader", "bundler", "test-support"]}
```

`pdf-worker/test/` keeps `structure.test.mjs` and the table-recognition probe and helpers (`table-candidate`, `table-recognition-worker`, `table-recognition.probe`; they drive `unpdf`, tier 2). `test/make-pdf.mjs` is used by tests of both `pdf-pixels` and `pdf-worker`: give it to `test-support` by path (`"pdf-worker/test/make-pdf.mjs"`, no file move), so neither test set reaches into the other.

`image-codecs` has no test of its own today: `jbig2.test` and `jpx.test` reach the decoders through `renderPageToPixels`. The fixtures already carry each raw stream and its reference hash (`stream_b64`/`globals_b64` with `jbig2dec_sha256`; `data_b64` with `opj_sha256`; the DCT variants likewise), so the split job writes direct decoder tests in `test/codecs/` from them, before N34 adds anything.

## 3. Requirement ids

Ids keep their numbers (the tests name them); a moved id's old place in `pdf-worker.md` is not rewritten as an id line. New modules number new ids from where they stand.

| id | new module | rewording |
| --- | --- | --- |
| Purpose | split three ways | each file gets its own Purpose; `pdf-worker`'s drops "this module's own image decoders" |
| R1–R12 | pdf-worker | none |
| R13–R21 | pdf-pixels | none (R16–R18 already cite `pdf-reader`) |
| R22 | pdf-pixels | yes: keeps the routes, `decodeDct` option, filter-chain rule and the refusal names; "bit-exact with libjpeg (ISLOW IDCT, …)" becomes a reference to `image-codecs`' DCT id |
| R23 | pdf-pixels | yes: keeps FlateDecode predecessor, K>0 refusal, rotation, `TRUNCATED_IMAGE_DATA`; "decoded G3 (K=0) or G4 (K<0)" cites `image-codecs`' CCITT id |
| R24 | pdf-pixels | none (no codec involved) |
| R25 | pdf-pixels | yes: keeps "decoded to a PNG like R23/R24, `UNSUPPORTED_FILTER` naming the feature"; the JBIG2 feature scope (K43) and pixel-exactness move to `image-codecs`; drop the stale "Today both filters answer `UNSUPPORTED_FILTER`" |
| R26 | pdf-pixels | none |
| R27–R34 | pdf-pixels | none |
| R35, R36 | pdf-worker | none |
| R37 | pdf-worker | none |
| R38 | pdf-worker | yes: "this module's code" means `index.mjs`; `pdf-pixels` and `image-codecs` each take a new id with the same rule |
| R39 | pdf-pixels | none |
| R40 | pdf-pixels | yes: its second sentence (checked pixel-exact against an independent decoder) moves to `image-codecs`; `pdf-worker` takes a new id for its own purity |

**New in `image-codecs`** (public, one id each): `decodeBaselineJpeg` / `readJpegHeader` / `colourTransformOf` and `DctRefusal` (from R22); `ccittDecode` (from R23); `decodeJbig2(data, globals)` with its K43 scope and `JBIG2_REFUSES`; `decodeJpx(d)` and `JPX_REFUSES`; `MqDecoder`; every codec pixel-exact against a named independent decoder (jbig2dec, OpenJPEG, libjpeg-turbo); no place named; pure. N34's memory refusal becomes a `JPX_REFUSES` key here and a mapping in `pdf-pixels`.

**Uses sections.** `pdf-worker` keeps `pdf-reader`'s `extractPdfStructure` only. `pdf-pixels` takes the `openPdf`/`PdfDoc`/`pageShowsText`/`pdfPageImages`/`imagePlacementSource` list and `image-codecs`. Suggestions: the `cropImage` note goes to `pdf-pixels`; the `unpdf` pin and bundle notes stay.

**Other files that name `pdf-worker` for pixels:** `ocr-worker.md` (lines 54, 118, 122: the renderer is `pdf-pixels`) and `pdf-reader.md` line 189 ("`pdf-worker` drives it through `openPdf`" becomes `pdf-pixels`). Both are wording changes only.

## 4. Bundles and the manifest

- `pdf-worker/dist/pdf-worker.bundled.mjs` and `.bundle.json` stay owned by `pdf-worker`; the regenerate command is unchanged. Its inputs do not change (`index.mjs` plus the plane's `pdfstructure`, `subresources`, `cpu`), so the split leaves it fresh. Manifest row inputs: "`pdf-worker`, and `pdf-reader`, `subresources`, `runtime-limits` files".
- The `ocr-worker` row's inputs are understated today (the row names only `pagepixels.mjs`; its manifest also lists the four decoders). It becomes "`ocr-worker`, `pdf-pixels`, `image-codecs`, plane `pdfstructure` (and `subresources`, `cpu`)".
- Moving the CCITT block changes `pagepixels.mjs` and adds `ccittdecode.mjs`, so the split job stales `ocr-worker`'s artifact (N34 would too, through `jpxdecode.mjs`). The job reports it; BOB regenerates at the layer close.

## 5. Other modules' `uses`

| module | today | after |
| --- | --- | --- |
| `ocr-worker` | `pdf-worker`, … | `pdf-pixels` in place of `pdf-worker` (it imports only `pagepixels`; its test reads `scan-ccitt-g4-page.pdf`, now `pdf-pixels`') |
| `content` | `pdf-worker`, … | `pdf-pixels` in place of `pdf-worker` (its reason is `cropImage`) |
| `extraction` | `pdf-worker`, … | unchanged: it calls `/structure` through `PDF_WORKER`; its job confirms it does not need pixels |
| `legacy-index`, `legacy-tests` | `*earlier` | unchanged (eight plane tests import `pdf-worker/src/*` files; all three modules precede them) |

`layers.md`: layer 1's module list gains `image-codecs` and `pdf-pixels` (58 modules become 60).

## 6. Risks

1. **Approval.** Amended ruling 5 sends "adding a module that carries product capability" to Bob. The split adds no capability, only redistributes it, but two new product modules are arguably that case. BOB decides whether this is his to rule or one line to Bob.
2. **Codec tests start from nothing.** Until `test/codecs/` exists, `image-codecs` is met only through another module's tests. The split job writes them first.
3. **R38's test crosses modules.** `structure.test.mjs` reads `REFUSALS`, `CROP_REFUSALS` and every file in `src/`, and asserts the decoders are among them. It must be split, one R38-style check per module, or `pdf-worker`'s tests use `pdf-pixels`.
4. **One directory, three owners.** `package.json`'s `npm test` runs all five suites and `node_modules` serves all three; a job must run its own module's tests by file. `bio-plane/scripts/coverage.mjs` (line 1747) counts the `pagepixels` suites as the fleet member's reach; its behaviour is unchanged, but it no longer matches ownership.
5. **Refusal sets become contracts.** `JBIG2_REFUSES`, `JPX_REFUSES` and `DctRefusal` become public, so renaming a codec refusal is a requirement change, and `pdf-pixels`' mapping of each to a `REFUSALS` reason must stay total (R39).
6. **The CCITT move is a code change** in a split that is otherwise only ownership. It is small and self-contained (tables, `BitReader`, `readRun`, `b1`, `b2`, `ccittDecode`; `getBit`/`setBit` stay with rotation), and `pagepixels.test` and `pagepixels-corpus.probe` check it pixel-exact. If BOB prefers a pure ownership split, it can stay in `pdf-pixels` (then ~1,301 and ~2,551 lines).

## 7. Alternative (close second): two modules

`image-codecs` as above, and `pdf-worker` keeping `index`, `pagepixels`, `imagecrop` and the test worker (~1,300 lines with CCITT moved out, ~1,524 without). This is simpler: no `ocr-worker` or `content` edge changes, and one fewer requirements file. But it leaves `pdf-worker` as two things: a deployed Worker whose bundle holds none of the pixel code, and a library that `ocr-worker` and `content` import. A session sizing `ocr-worker` would still read `/structure`'s requirements it never uses. The three-way split matches the code's actual seams: the bundle, the import graph and the users.
