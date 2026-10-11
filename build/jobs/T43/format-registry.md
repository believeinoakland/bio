# format-registry (T43)

**Status** · session_012CR9FjettQwdGvBEvk8MPR · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** · T43-3 (N853b, K2691, K2611): `formats.mjs` registers two built-in picture entries from one builder, `pictureEntry(format, signature, contentType, refusal)`: `jpeg` (R29: `FF D8 FF` at offset 0 → `certain`; with no bytes, exactly `image/jpeg` → `likely`; else `null`; `structure` one page 0 with no text and one `no_text_layer` marker `{page:0, reason:"no_text_layer", font:null, codes:"", count:0}`, a fresh object each call, or `{ok:false, container:"jpeg", reason:"NOT_A_JPEG"}` for anything without the signature, a non-`Uint8Array` included; decodes nothing; `parts`, `text` `null`) and `png` (R30: the same with `89 50 4E 47 0D 0A 1A 0A`, `image/png`, `NOT_A_PNG`). Registered after `csv` and before `zip`, so the roster is the twelve entries of R23. `structure` is `async`, like the other entries' (every caller awaits it). Header comment for the zip entry corrected ("tenth" → "twelfth").

**Tests** (at the interface; negative controls per K874)
- New `test/m/format-registry/pictures.test.mjs`: R23 (twelve, order, `jpeg`/`png` between `csv` and `zip`; pass 1 asks `html`/`pdf` first, pass 2 answers a picture type before `zip`); for each of R29 and R30: detect with bytes (JFIF, EXIF and bare heads; near-miss signatures, truncated, offset by one byte; PDF, HTML, ZIP, DOCX, ODT, text, GIF, TIFF, HEIC, WebP all `null`; the content type unconsulted with bytes, an empty `Uint8Array` included); detect without bytes (exact type only: case, parameters, spaces, `image/jpg`, `image/pjpeg`, `image/x-png`, `image/apng` all `null`); through the registry (bytes outrank a declared type; a picture is never `zip`, even declared `application/zip`; a PDF, HTML, ZIP, office or ODF file declared as a picture keeps its own format; unregistered image formats stay `undetermined`); structure (the exact one-page shape and key order, a fresh answer per call, a 1 MiB body after the signature answered the same, the detect→structure path, `NOT_A_*` for every non-picture input).
- `builtins.test.mjs`, `registry.test.mjs`, `zip.test.mjs`: the R23 roster pins move from ten to twelve entries.
- format-registry `bio-plane/test/m/format-registry/`: tests 42, pass 42, fail 0.
- users (P11), on this head: acquisition 158/0; capture (+ cap13-reuse-pages, d57selflink, with reading-pipeline's d606-perpage-ocr and tier2-wire: 4/0) 123/0; reading-pipeline 104/0; extraction 150/0; content 132/0; file-safety 53/0; link-sweep 29/0; monitoring 124/0; doorbell 69/0; sources 30/0. No red; no other test pins the ten-entry roster (searched the repository).
- layer tests: none named in `manifest.md`.

**Checks**
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture format-registry`: 6 product files, 20 relative imports; 0 failures.
- `coverage format-registry`: 30 of 30 live requirement ids named by a test; 0 failures.
- `ownership format-registry tranche/T43`: 6 files changed; 0 failures.

**Deferred** · none.

**Found in other modules / generated artifacts (for BOB)**
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (and its `.bundle.json`) carries `formats.mjs`, so it is stale from this change (rule 4 (6), regenerated at the layer's close). `case-checker/program.mjs` does not carry the registry.
- An observation, no change made (R10, R20, R23 as written): the `pdf` entry claims any bytes whose first KiB holds `%PDF-`, and `html` any whose first KiB holds `<html`, and both are asked before `jpeg`/`png` in pass 1; a photo whose EXIF or comment block carries either literal would detect as `pdf`/`html`. `pictures.test.mjs` pins this as the order R23 states. If BOB wants a picture signature at offset 0 to win, that is a requirement change (e.g. register the picture entries before `html`), not a job choice.
- The `*(not yet met: T43)*` marks on R23, R29, R30 in `requirements/format-registry.md` (BOB's file) can be removed at the merge.

**Reading set (mechanics §17)** · 125 KB at START, under 300 KB: read whole myself: `requirements/format-registry.md`; `plan/draft-T43-n853b.md`; K2611, K2691; the plan's T43 entries and "Rules at the opening"; `layers.md`'s table and layer-1 contract; the public parts of `office-readers`, `odf-reader`, `pdf-reader` and `ooxml`; `formats.mjs` and every file under `test/m/format-registry/`.

Size (session_012CR9FjettQwdGvBEvk8MPR): test runs 12, module lines 393

## J1 · COMPLETE

T43-3 applied: jpeg (R29) and png (R30) picture entries in formats.mjs, one builder, registered after csv and before zip; roster twelve (R23). New test/m/format-registry/pictures.test.mjs with negative controls (PDF/HTML/ZIP/office/ODF/GIF/TIFF/HEIC/WebP not pictures; a picture never zip; listFormats order); ten->twelve roster pins in builtins, registry, zip tests. format-registry 42/0; coverage 30/30; format, architecture, ownership 0 failures. Users green: acquisition 158, capture 123 (+4 extra), reading-pipeline 104, extraction 150, content 132, file-safety 53, link-sweep 29, monitoring 124, doorbell 69, sources 30; no other pin of ten entries. Stale: plane bundle (dist/bio-plane.bundled.mjs). Observation, unchanged (R23 order): a JPEG/PNG whose first KiB holds %PDF- or <html detects as pdf/html. No new files outside paths. Record: build/jobs/T43/format-registry.md.
