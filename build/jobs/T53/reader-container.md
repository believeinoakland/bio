# reader-container (T53)

**Status** · session_018BhcedfcFpkDwfqT6uTLcn · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

**Entries applied** · T53-65 (N1266, N1267): the new module `reader-container`, R1-R8, under `reader-container/` (K5578 (1)).
- Calls (`src/index.mjs`): `plan(source, kind)` (R6, no byte read), `read(source, kind, {container, depth, name})`, `collect(result)`; `kind` is format-registry's name or answer (`{format: "docx", variant: "macro"}` is `docm`). Routes: `convert` (doc, docm, rtf, ppt, pptm → docx/pptx; xls, xlsm → xlsx), `frames` (jpeg, png, tiff, heic, heif, avif, gif, webp, bmp, jp2), `archive` (zip, tar, gz, bz2, xz, 7z); `rar` refused by name. Answers: converted bytes + `original {size, sha256}` + `macros {present, ran: false, note}`; PNG frames + `facts {time, place, orientation}`; an async iterable of members (each `depth + 1`, encrypted stated with a note, bytes null), ending in a refusal when the stream breaks a bound. Every failure a stated refusal `{ok: false, code, key, detail}` by `localize` key, never a throw (R8).
- Container (`container/server.mjs`, Dockerfile, `packages.json`): LibreOffice in a fresh private profile per request (macros disabled, security level 3, active content off, links never updated, `BlockUntrustedRefererLinks`); ImageMagick + libheif/OpenJPEG decode, ExifTool facts, orientation applied explicitly; 7-Zip for ZIP/7z (listed, bounded, extracted member by member to a counted pipe), TAR and gzip/bzip2/xz walked twice (check every bound holding nothing, then send). The caller sends every figure in `x-reader-bounds`; the image holds none (R7). Each request's temporary directory is removed (R8).
- Bounds (R6, R7): every ceiling through `boundOf`; the route rows are K5578 (2)'s names (`document.bytes`, `spreadsheet.bytes`, `image.bytes`, `document.pages`), with the nearest existing row standing in until runtime-limits lands them (`pdf.bytes`, `workbook.bytes`, `image.cover_bytes`; no page cap until `document.pages` exists). The time per request is `scan.time_ms` until a container row exists.
- Found and fixed in my module while testing: LibreOffice as installed fetches a document's linked picture on load; `BlockUntrustedRefererLinks` stops it (test with a control that shows the installed fetch). LibreOffice converts any bytes as text, so a converted kind must carry its signature (compound file, `{\rtf`, ZIP); a TAR header's checksum is checked.

**Not done, and why**
- Not enrolled as a fleet member (no `fleet-member.json`, `wrangler.jsonc`, Worker front or plane binding): enrolment makes `bundles.mjs` build it and changes the generated `dist` artifacts and fleetbundles' verify, and the routing is `control-plane`'s (K5448 (4)). BOB's to schedule (bundler R24-R27).
- `packages.json` pins LibreOffice and the fonts at file-scanner's versions; the others (`imagemagick`, `libheif1`, `libopenjp2-7`, `libimage-exiftool-perl`, `p7zip-full`, `bzip2`, `xz-utils`) are `null`, pinned by the first release build (no snapshot reachable here). The image is LibreOffice 7.4.7; the tests ran on 24.2.
- R3's "read by OCR": no OCR engine in this container; frames are checked against test-support imggen's exact page pixels (lossless kinds to 0.5 mean difference, lossy within 2), which is what an OCR engine reads.
- A HEIC turned by its `irot` box is not tested (no encoder option here); libheif applies it, EXIF orientation is applied for every other kind.
- Tests skip, by tool presence, where a test machine lacks soffice, ImageMagick, exiftool, 7-Zip, Pillow, python UNO or an HEVC encoder (file-scanner's convention); here none skip. This container had `libheif-examples`, `libheif-plugin-x265`, `libheif-plugin-libde265`, `libarchive-tools`, `p7zip-full`, `libimage-exiftool-perl` installed by apt for the run.

**Other modules**
- `setup-words`' generated `rows.mjs`/`words-unreviewed.json` gain this module's 18 `reader-container.*` keys at the merge's regenerate (the generated-artifacts table); I did not edit them.
- `runtime-limits` (T53-22): this module quotes `document.bytes`, `document.pages`, `spreadsheet.bytes`, `image.bytes` by K5578 (2)'s names; a `container.time_ms` row (or `budgetOf` from T53-23) would replace the stand-in `scan.time_ms`.

**Tests** · 69 pass, 0 fail, 0 skip (`reader-container/test/`, `node --test --test-force-exit`). Checks for the module: architecture 0, coverage 8 of 8, words 0, fixtures 0, ownership 0.

**Met** · R1, R2, R3, R4, R5, R6, R7, R8

Tests: 69/69. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedfcFpkDwfqT6uTLcn): test runs 1, module lines 2145

## Completion (2026-10-28)

**CHANGE applied** · K5602 (runtime-limits merged): tranche/T53 merged; the stand-in rows replaced by K5578 (2)'s names. `src/limits.mjs` now quotes `document.bytes`, `spreadsheet.bytes`, `image.bytes`, `archive.uploaded_bytes` (R6), and `document.pages` (R3: a multi-page picture's page cap, always sent to the container now). No fallback rows remain.
- The request time stays `scan.time_ms` (the other container member's row): the table has no container row, and `budgetOf`'s time classes are screen and op budgets, not a container request's.
- R5's large-ZIP test is sized to the largest stored ZIP every bound lets open whole, `min(archive.uploaded_bytes, archive.unpacked_bytes, archive.member_bytes)`: today 256 MiB, and the full 500 MiB once the two unpacking bounds reach the upload bound. The uploaded bound + 1 is still refused before any read.

**Found in another module (runtime-limits)** · Active figures: `archive.uploaded_bytes` is now 500 MiB (the beta's), but `archive.unpacked_bytes` and `archive.member_bytes` are still the alpha's 256 MiB. So an archive between 256 and 500 MiB is accepted at upload but always refused while unpacking (a stored 500 MiB ZIP: "A file in this archive is 500 MB, over the limit of 256 MB for one file"). Per K5578 (2), unpacked should be 2 GiB. The module refuses correctly and keeps both figures; the figures are runtime-limits'.

**Not done, and why** · As in the first report: fleet enrolment is BOB's to schedule; seven package versions in `packages.json` are pinned by the first release build.

**Tests** · 69 pass, 0 fail, 0 skip. Checks for the module: architecture 0, coverage 8 of 8, words 0, fixtures 0, ownership 0.

**Met** · R1, R2, R3, R4, R5, R6, R7, R8

Tests: 69/69. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedfcFpkDwfqT6uTLcn): test runs 2, module lines 2144

## Completion (2026-10-28)

**CHANGE applied** · T53-538 (K5637): reader-container enrolled as a fleet member, every file in its own folder.
- `fleet-member.json`: kind `container`, entry `container/server.mjs`, testDir, surface; one class (top-level form) `ReaderContainer`, `instance_type` standard-1, `max_instances` 3, bind `{member: reader-container, binding: READER}`; image `docker.io/civicsmith/reader-container`, `digest` null and no `source_sha256` (both recorded by `recordContainerDigest` at the release), platform linux/amd64, port 8080, base = the Dockerfile's FROM digest, `packages: packages.json`; bundle `src/worker.mjs` → `dist/reader-container.bundled.mjs` + `.bundle.json`, external `cloudflare:workers`, `node:*`; build `{dockerfile, context, command}`; `egress` empty; `callers` bio-plane `READER_CONTAINER` (service).
- `src/worker.mjs`: default export `fetch` passes the image's four routes to one of the class's instances (named `reader-0`…`reader-2`), any other route 404 `UNKNOWN`, no class bound a stated 503 `UNREACHABLE`; `limits` statement as file-scanner's; exports `ReaderContainer` (`enableInternet` false, port from the marker, `sleepAfter` 5m) and `ContainerProxy`.
- `wrangler.jsonc`: account `20b533579290b9b93168345edd3b7f72` only, main the bundle, `vars.VERSION`, `workers_dev`/`preview_urls` false, `limits.cpu_ms`, observability on, the container block, the `READER` Durable Object binding, migration v1 `new_sqlite_classes: [ReaderContainer]`; no bucket, store, route or trigger.
- `package.json` `build` script (`scripts/build.mjs`, bundler's `writeMember`), `@cloudflare/containers` 0.3.7 dev dependency, `package-lock.json`; `dist/` built and committed (fleetbundles: byte-identical fresh build, sha256 in the manifest, R31 size and start-up measured).
- `packages.json` and the Dockerfile: every package pinned, versions read from the 2026-10-06 bookworm and bookworm-security indexes (none null). 7-Zip is `p7zip-full 16.02+really26.02+dfsg-0+deb12u1` (7-Zip 26.02).
- `test/member.test.mjs` (R8): the committed bundle loaded under Node: routes passed through, others 404, the class with no internet, the configuration binding nothing that stores, and the marker, statement and Dockerfile as bundler reads them.

**What the bundler checks refuse, which I cannot satisfy from my folder**
- `bio-plane/test/system/fleetbundles.test.mjs` (bundler's) pins the member list (around line 121, six names) and the container members with their images: both arms FAIL with reader-container enrolled (every other arm passes for it). That test is the bundles' merge verify, so the merge's verify fails until bundler adds `reader-container` to those two lists: a CHANGE for BUNDLER, landing with this merge.
- `wrangler.jsonc`'s image carries a placeholder digest of 64 zeros, because `recordContainerDigest` only rewrites an existing `repository@sha256:<64 hex>` reference; the marker's `digest` is null, so `imageReference` names the image as missing until recorded, and no install can deploy it before then.
- `.github/workflows/container-images.yml` (not this module's) needs a matrix row `{name: reader-container, context: reader-container, file: reader-container/Dockerfile, member: reader-container}` and its `paths` filter for the image to be built and its digest printed.
- Not provable before the image exists: that bookworm's `p7zip-full` 26.02 installs a `7z` command (the server reads `READER_7Z` if it is named otherwise), and that bookworm's ImageMagick 6.9.11 with libheif 1.15 decodes HEIC and AVIF as the tests here did (ImageMagick 6.9.12, libheif 1.17). The image's `GET /version` names each tool once it runs.

**Tests** · 73 pass, 0 fail, 0 skip. Checks for the module: architecture 0, coverage 8 of 8, words 0, fixtures 0, ownership 0.

**Met** · R1, R2, R3, R4, R5, R6, R7, R8

Tests: 73/73. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedfcFpkDwfqT6uTLcn): test runs 3, module lines 2545
