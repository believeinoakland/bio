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
