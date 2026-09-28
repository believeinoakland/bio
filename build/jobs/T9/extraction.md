# extraction (T9)

**Status** · session_01CqUWiaFQX9UhsvtQ1DT23r · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

My entries need wording `build/requirements/extraction.md` does not state. Proposed below, for folding; I am building on exactly this meanwhile.

1. **N100 (page boxes).**
   - **R13**, add after its first sentence: "`page_boxes` follows `page_count`'s rule: present exactly where `page_count` is; null when no structure reader answered a box (a non-PDF, a structure with no `pageBoxes`, or one this wire cannot read whole); else `pdf-reader`'s `pageBoxes` (its R33) as `{boxes, of_page}`, each box `{media_box, w, h, rotate}`, a page whose box it could not read null in `of_page`; never a partial list."
   - **R34**, add: "`page_boxes` is the structure's (R13's rule), else the stored reading's when it holds the key, else absent."
   - **R30**, add `pageBoxes` to the answer: "`pageBoxes` is as R13 stored it, absent when never stored, null when stored null" (content R42 reads it).
   - **R31**: the plain read now also carries `pdf-reader`'s own `pageBoxes` (its R33). Reword "apart from R52's two additive keys" to "apart from R52's two additive keys and pdf-reader R33's `pageBoxes`".

2. **N139 (D-375's reading character count).** New **R60** (Provides, reading section, after R15): "A reading whose provenance digested a text (R15) carries `text_chars`, `text_glyphs` and `text_undetermined`, taken over exactly the text the reader was handed: I2's `counts.chars`; the glyphs of its `document` (`text-chain.glyphCount`); and I2's `counts.undetermined`, not counting `image_unread` (R4). Each is a non-negative integer, or null when that text states no such figure. A bare string gives its length, its glyphs and null. A reading with no text has none of the three keys, never a zero nothing counted. A re-read (R34) carries its own by this rule." observation-log (layer 5) reads them to tell a scan read to nothing from a document read whole (D-375, `contentObservationsFor`); its share of N139 is later.

3. **N151.** **R58** gains a fifth table: "`reading_text_source`: `capture_sha` (one row per capture whose reading carries a well-formed chain; no row for an absent or malformed chain, R19) and `chain` (that chain as JSON, exactly the reading's `text_source`)." These are the two columns inquiry's earned registry joins (`src/inquiry/index.mjs`, the `LEFT JOIN reading_text_source ts … ts.chain`).

4. **N202 (its share).** **R24** amended: "… registers once; a malformed registration is refused `LISTENER_MALFORMED` and a second by the same module `LISTENER_DECLARED`, both answered by `membership.listenerRefusal` (its R81, K231). After each write every `fn` runs in the same transaction, in `membership.MODULE_ORDER`'s order (its R83), whatever order they registered in, …" (rest unchanged). **Uses → membership**: add `listenerRefusal` (R81) and `MODULE_ORDER` (R83). This module's own registrations (promotion's `registerStep`, calibration's `onCalibration`) are refused by their hosts, so they need no change here.

5. **N253.**
   - **R4** amended, first sentence: "a PDF whose tier-1 undetermined markers, not counting `image_unread` (pdf-reader R34: an unread image, no undecoded character), outnumber the glyphs of its text, unless every remaining marker is a scan marker (`no_text_layer`, `image_content_unread`, `image_content_undetermined`), …". The code has exempted the two `image_content_*` markers since D-627; R4 names only `no_text_layer`.
   - **R12**: "Final text, its `image_unread` markers not counted as undecoded (R4), goes to `docprofile.readText` …".
   - **R9**: the tier-2 half is carried by `text-chain.mergeTier2Text` (its R90), which is why `carryImageUnread` goes. Uses → text-chain is unchanged.

Content's `passageText` (its R46) reads `unitsOf` (R36) as it stands, so it needs no new read from me.

## J2 · REPORT

Found while applying my entries. I changed none of these.

1. **Generated artifact made stale** (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` carry `src/extraction/pipeline.mjs` and `index.mjs`. Regenerate at the layer close.
2. **observation-log** (layer 5, N139's other share): the reading now carries `text_chars`, `text_glyphs` and `text_undetermined` (R60). `contentObservationsFor` can read them to file a scan read to nothing as `LOOKED_ABSENT` (D-375, OBSERVATION-LOG-DESIGN §4.2's fourth outcome). The legacy pins that follow, `nc-d375` and `observation-content`, are legacy-tests' work. `observation-content.test.mjs` is 0/1 on `tranche/T9` and on my branch alike.
3. **Legacy suites** that touch readings, pdfstructure, tiers, units or `onReading`: 71 suites run on `tranche/T9` and on my branch, with identical results on every suite. 60 are all green. These 11 are red on both, so none is mine: bounds, cpdf18-pdf-images, derivation-bounds, fleetbundles, hygiene, observation-content, reextract, strengthpair, textshown, tier3-layer-parts, versionnotice. reextract's plain-read digest pin (`PRE_ITEM_DIGEST`) already moved with pdf-reader's `pageBoxes` (R31, as K293 now states); the D-374 branch holds re-taken literals for it.
4. **connections** (test): m/connections is 59/1 on the base and on my branch alike (`factory.test.mjs`, already CAPTURE #3's report).
5. **My requirements file, header**: its "Not yet met" list is stale. Several ids it names (for example R20, R21, R22, R36 and R49) are met and tested since T5 and T7, and the K293 tags `(not yet met: T9, …)` on R4, R9, R12, R13, R24, R30, R31, R34, R58 and R60 are met now. Strike them, BOB's to word.
