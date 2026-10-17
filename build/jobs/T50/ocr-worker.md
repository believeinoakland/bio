# ocr-worker (T50)

**Status** · session_017dvjrzTYuZd2L9Q8GJ5Cn4 · depth 2 · WORKING · handled B1

## Completion (T50-55 · R23)

**Entries applied.** T50-55: R23. A capture whose bytes begin with a JPEG (`FF D8 FF`) or PNG signature (`isPicture`, `src/contract.mjs`) is a one-page document: page 0 is rendered by `renderPictureToPixels` (pdf-pixels R42) with `{maxEdge: PICTURE_MAX_EDGE (4096), grey: true}` and then taken through R7 step 3 onward and R8–R10 exactly as a PDF page; any other page is `NO_SUCH_PAGE` (200, `ok:false`, naming `page`, `page_count: 1`), refused after `ENGINE_ABSENT` and before any pixel is made; a picture the renderer refuses is `PAGE_NOT_RENDERABLE` with its reason. A PDF, and bytes that are neither, go to the page renderer as before. `NO_SUCH_PAGE` is a declared refusal in `REFUSALS`.
- `PICTURE_MAX_EDGE` is not a measurement: it is `PICTURE_FRAME_MAX`'s own 4096 edge, so 12 MP camera frames arrive at their own resolution and a 4:3 frame is 50.3 MB RGBA, under `MAX_FRAME_BYTES`. A squarer frame over the bound is refused by R7 step 4, never attempted.
- `image.rotate_deg` is `null` for a picture (the renderer states an EXIF `orientation`, not a rotation; none is invented). `image.route` is `decoded-picture`, `dpi` is `null`. No consumer in `bio-plane/src` reads `rotate_deg`.
- Regions keep `source.kind: "pdf-page"`, `ref: "p0"` (the consumer's anchor check, `checkAnchor`, accepts it; reading-pipeline R4 relies on R23 as written).
- `makeMember(engine, {render, renderPicture})`: the picture renderer is handed in like the page renderer, so the node suite stands a renderer in.
- Tests: fixture photographs `test/fixtures/photo-printed-sentence.{jpg,png}` (Pillow-generated; a printed sentence, uneven light, noise, 1.2° turn, blur). Part A10 (stand-in renderer): routing, `NO_SUCH_PAGE` for pages 1 and 7, `[1,0]` takes 0, renderer refusal forwarded, R7.1/R7.4 order for a picture, controls (PDF unchanged, neither-bytes refused as today, truncated signatures are not pictures). Part B8 (the committed bundle under workerd, real renderer and engine, JPEG and PNG): the words `council approved budget Tuesday evening` come back for page 0 with R8's fields, regions anchored to the frame whose digest the renderer states, page 1 is `NO_SUCH_PAGE`, repeat answers are identical; controls: the scanned PDF page and non-PDF bytes as today.
- Real answer for both fixtures: 2 regions, `"The council approved the budget\n\n\non Tuesday evening.\n"`.
- Bundle `ocr-worker/dist/` rebuilt with `npm run build` in `ocr-worker/` (sha256 `afae3fe7…ddbb1c0`, 17 first-party inputs); BOB verifies it at the layer's close.

**Deferred.** None.

**Found in another module.** `bio-plane/test/system/fleetbundles.test.mjs` (not my module; its cross-tree list for `ocr-worker`, lines 294–298) now FAILS one test, "ocr-worker's build reaches into the RENDERER's tree and the PLANE's, and the manifest hashes all of them": the member's bundle now reaches two more renderer sources, `../pdf-worker/src/picturepixels.mjs` and `../pdf-worker/src/pngdecode.mjs` (the list wants nine, got eleven). The fix is to add those two paths to the expected list (and a line to the comment above it), a job on that file's owner. Everything else in that file passes for ocr-worker (no staleness, byte-identical fresh build, hashes match).

**Tests and checks run.**
- `node test/ocr-worker.test.mjs` (in `ocr-worker/`): `ocr-worker: 237 passed, 0 failed`.
- `node bio-plane/test/d606-perpage-ocr.test.mjs` (the plane's suite that drives this member): `28 passed, 0 failed`.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: ocr-worker's arms pass except the one above; the SKIPs are agent-runner and file-scanner (`node_modules` missing there), not mine.
- `bio-plane/test/ocr-measure-probe.mjs` is a network probe (npm install, Legistar fetch), not run.
- `checks/architecture.mjs bio ocr-worker`: 23 product files, 0 failures. `checks/coverage.mjs bio ocr-worker`: 23 of 23 live requirement ids named by a test; 0 failures. `checks/ownership.mjs bio ocr-worker tranche/T50`: 0 failures.
- `checks/format.mjs bio`: 2 failures, both in `build/rulings.md` (K3441 and K3597: no standing-list decision stated), not mine.

Size (session_017dvjrzTYuZd2L9Q8GJ5Cn4): test runs 5, module lines 822

## J1 · REPORT

Found in another module: bio-plane/test/system/fleetbundles.test.mjs lines 294-298 (ocr-worker's expected cross-tree inputs) now FAILS one test, 'ocr-worker's build reaches into the RENDERER's tree and the PLANE's...': R23 makes the bundle reach two more renderer sources, ../pdf-worker/src/picturepixels.mjs and ../pdf-worker/src/pngdecode.mjs (want 9, got 11). Fix: add those two paths to the expected list and a line to the comment above it; its owner's change, not mine. Every other ocr-worker arm in that file passes (no staleness, byte-identical fresh build).
