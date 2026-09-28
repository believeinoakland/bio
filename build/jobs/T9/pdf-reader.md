# pdf-reader (T9)

**Status** · session_01LKbhRJ9uya72jg3WhQgDJV · depth 2 · COMPLETE · handled B2

## Completion (PDF-READER #2)

**Entries applied** (plan layer 1, the pdf-reader bullet), as worded by K279 (B2):
- **N100's share, R33 (D-374's producer half):** `extractPdfStructure` carries a top-level `pageBoxes` = `{boxes: [{media_box, w, h, rotate}], of_page: [index | null]}`. Built on `land/worker/D-374`'s `pdfPageBox`/`extractPageBoxes`, re-based on today's module: R26's visible-box reader and R33's MediaBox read now share one inherited-attribute helper (`inheritedAttr`, `inheritedBox`) instead of two walks up the page tree.
- **N101, R34 (D-665's producer half):** `image_unread` per placement at or above share 0.001 of the visible box (or with no readable box), after any R26 marker, carried on a `no_text_layer` page too (R14 as amended). Built on `land/worker/D-665`'s `markImagesUnread`; the page-then-document restatement of `text.undetermined` is one function (`restateUndetermined`) that R26's and R34's markers both use.
- **N101, R35 (REC-206's link anchors):** every `links[]` record carries `anchor: {text, why, tier: 1}`. Built on `land/worker/REC-206`'s glyph placement and `anchorOf`; REC-206's `text.pages[].lines`/`linesWhy` are not carried (B2), so the glyph box keeps only its ink point. Improvement beyond the snapshot: glyph positions are held only for pages a link sits on, not for every page of the document.

**Shapes for extraction (layer 4), as B1 asked:**
- `pageBoxes` (top level of `extractPdfStructure`'s answer, beside `images`; tier 2's replacement of `text` keeps it): `null` when the document has no pages, else `{boxes: [{media_box: [x0, y0, x1, y1], w: x1 - x0, h: y1 - y0, rotate: 0 | 90 | 180 | 270 | null}], of_page: [integer index into boxes | null, … one per page in page order]}`. `media_box` in default user space with its own origin; `rotate` does not move it.
- `image_unread` (an entry of `text.pages[p].undetermined`, and so of `text.undetermined`, counted in `text.counts.undetermined`): `{page: <0-based>, reason: "image_unread", font: null, codes: "", count: 0, rect: [x0, y0, x1, y1] (exactly the R16 placement's rect, default user space, 1/1000 pt), area_share: <number to 4 places> | null}`. Present only when `images` is a list.
- Link anchors (`links[i].anchor`, every record, all five partitions): `{text: string | null, why: null | "no_rect" | "text_not_read" | "no_text_in_rect" | "positions_unknown" | "partly_unplaced" | "undecodable" | "partly_undecodable", tier: 1}`; `text` is non-null exactly when `why` is `null`, `partly_unplaced` or `partly_undecodable`. The rect it reads is `links[i].source.rect` (R3–R6).

**Deferred:** nothing.

**Behaviour note:** R26's box reader used to pass over a page's malformed /MediaBox or /CropBox (not a four-item array) to its parent's; the shared helper takes the nearest definition, as the standard does, so such a page's box now reads as unreadable (R26: `image_content_undetermined` with a null share). No test or fixture depended on the old reading.

**Found in other modules** (REPORT J2): legacy-tests' suites that pin exact marker lists or whole-output digests move with R34/R35, and the three bundles that embed pdfstructure are stale (§14). Consumers' exclusion of `image_unread` from the tier-2 decision is N253 (B2).

**Tests and checks run:**
- `node --test test/m/pdf-reader/ test/m/format-registry/` (bio-plane): tests 85, pass 85, fail 0 (pdf-reader 58 of them; baseline 48).
- `pdf-worker`: `node --test test/`: tests 46, pass 45, fail 1 (`structure.test.mjs`, R7/R10: the COMMITTED bundle still carries the old pdfstructure). With a fresh local `npm run build`: 46 pass, 0 fail; the committed `dist/` restored untouched, not committed.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures. `checks/architecture.mjs … pdf-reader`: 8 product files, 15 relative imports; 0 failures. `checks/coverage.mjs … pdf-reader`: 35 of 35 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … pdf-reader tranche/T9`: 8 files changed; 0 failures.

Size (session_01LKbhRJ9uya72jg3WhQgDJV): test runs 14, module lines 2941

## J1 · QUESTION

My share (N100, N101) adds three outputs my requirements do not yet state, so it needs requirement text first (JOB step 5). My best reading, which I am building on now; please confirm or correct:

1. **R2** gains a top-level `pageBoxes` (beside `images`, so tier 2's replacement of `text` keeps it). **New R33 (D-374):** `pageBoxes` is `{boxes:[{media_box:[x0,y0,x1,y1], w, h, rotate}], of_page:[index|null]}` — `of_page[i]` indexes page i's distinct box in `boxes` (each distinct box stored once), or is null where that page's box cannot be read. The box is the page's /MediaBox, inherited up the page tree, corners normalised, origin kept (never re-based to 0,0), never a default; four finite numbers with positive area, else null. `rotate` is the inherited /Rotate normalised to 0/90/180/270, 0 when absent, null when not a multiple of 90; it does not move the box. `pageBoxes` is null only when the document has no pages. Boxes are read for an encrypted document too (numbers are never encrypted).
2. **New R34 (D-665):** with `images` a list, every placement whose rect covers at least 0.001 of its page's visible box (R26's box: CropBox inside MediaBox), or whose page box cannot be read, adds to its page's `undetermined`, in painting order and after any R26 marker, `{page, reason:"image_unread", font:null, codes:"", count:0, rect, area_share}` — `rect` exactly the placement's, `area_share` the rect clipped to the box over the box's area, 4 places, null without a box. It routes nothing. It is carried on a `no_text_layer` page too, so **R14's "exactly one `undetermined` marker"** would read "exactly one `no_text_layer` marker" (alternative: skip such pages, as R26 does — say if you prefer that).
3. **New R35 (REC-206):** every `links[]` record gains `anchor:{text, why, tier:1}`: the text tier 1 shows whose glyph ink point (mid-advance, 0.35 em above the baseline, default user space) lies in the link's `source.rect`, in showing order, runs joined by one space, whitespace collapsed, trimmed. `why` null only for a complete reading, else one of `no_rect`, `text_not_read`, `no_text_in_rect`, `positions_unknown`, `partly_unplaced`, `undecodable`, `partly_undecodable` (REC-206's meanings). R3–R6's exact records gain the `anchor` key.
4. REC-206's `text.pages[].lines`/`linesWhy` are NOT in my share, so I do not carry them (the anchor needs only glyph positions, kept off the output). Say if extraction wants them.

For the consumers (not mine, reported): `image_unread` enters `text.undetermined` and `counts.undetermined`, so any reader judging a decode by `counts.undetermined` (needsTier2/readText; D-665's built work added `decodeView` in index.mjs for this) must exclude it, or a photo page escalates to tier 2. And whole-output pins of `op=pdfstructure`/tier 1 in other modules' tests (reextract, formats, cpdf18, capture-container-extent on the snapshot) move by exactly `pageBoxes`, `links[].anchor` and the `image_unread` markers. pdf-worker's bundle goes stale (§14).

## J2 · REPORT

Found in other modules by my T9 change (R33–R35, K279), measured against `tranche/T9` before and after:
1. **legacy-tests** (bio-plane/test, layer 11): four suites go red, all by the approved shapes, none by a regression:
   - `textshown.test.mjs`: pins a page's reasons as exactly `["no_text_layer"]` (4 asserts); an image-only page now also carries R34's `image_unread` (R14 as amended).
   - `tier3-layer-parts.test.mjs`: pins page 1's markers and "21 markers over 7 glyphs"; R34 adds the scan page's `image_unread` (count 0).
   - `cpdf18-pdf-images.test.mjs`: tier 1's text digest over the image fixture; the pinned object now carries `image_unread` markers (REC-206's snapshot stripped its additions by name before the digest; the same would do here, plus `image_unread`, `pageBoxes`, `links[].anchor`).
   - `fleetbundles.test.mjs`: stale bundles, next item.
2. **Generated artifacts (§14), stale:** `pdf-worker`, `ocr-worker` and `agent-worker` bundles embed pdfstructure. I did not rebuild them. pdf-worker's own `structure.test.mjs` (R7, R10) fails against its committed bundle and passes 46/46 against a fresh local build (restored, not committed).
3. **extraction**: `image_unread` is in `text.undetermined` and `counts.undetermined` (N253, as you said).
