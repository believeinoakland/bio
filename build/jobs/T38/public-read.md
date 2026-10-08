# public-read (T38)

**Status** · session_017MDGGaJitGyMMpHwkiKVY2 · depth 2 · WORKING · handled B2

## J1 · QUESTION

R23's "no route of this module serves a photo's original", against what is already published. My worker found that, before this job, the original was refused only because nothing registered it. Two paths still served it:
(a) another included row at the original's digest (the T37 "twin"), which publication registers as a `document`;
(b) a photo an earlier edition (or another case) carried whole, together with its extracted text and any archive holding it.

**What I built (fail closed, about 40 lines in `index.mjs`).** It takes the hashes every published edition's signed `materials:` rows state as `obscured` originals: their `sha` and `text_sha`, plus each archive the projection shows holding one, outward. For those hashes:
- `verifySha` answers as for a hash never published;
- so `publishedbytes` answers NO_PUBLISHED_PART;
- `publishedManifest().shas` leaves them out.

This applies whatever registered them, earlier editions included. Each signed document is read once per instance.

**Two things I am leaving as they are; say if you read either otherwise.**
1. A case-file zip that an earlier edition built with the photo whole is still served by its manifest hash. Hiding the file would leave the part `PART_MISSING` and break that edition's signed bag. Withdrawing it is the docket's or a court order's job (R28), not a serving filter.
2. A photo that no published document states as a copy (one an edition before T38 carried whole and no later edition obscured) is still served. Public-read has no notion of "photo": case-carriage's image test is not in my Uses. Closing this would need a back-dated rule, which I take to be Bob's doctrine (K2248 says only "published photos do not" carry metadata), not a BOB detail.

I carry on with this reading.
T38-20 is done on `job/T38/public-read`, with `tranche/T38` merged in (case-carriage T38-11, K2311).

**Entries applied**
- **R23, "no route of this module serves a photo's original".** Built in `index.mjs` as BOB answered J1 (B2, K2308). `#photoOriginals` collects the `sha` and `text_sha` of every `obscured` row in every published edition's signed `materials:` block. When the hashes asked about include an archive, it also adds each archive the projection shows holding one of those originals, outward. Each signed document is read once per instance. With that set:
  - `verifySha` answers a photo's original as a hash never published, whatever registered it (another row at the same digest, an earlier edition, another case). So `publishedbytes` answers NO_PUBLISHED_PART in raw and zip form, the same bytes as for a hash never existing.
  - `publishedManifest().shas` leaves those hashes out.
  - As B2 says, an earlier edition's case-file zip stays served by its manifest hash, and a photo published whole before T38 that no document states as a copy stays served as built.
- **R23, the bag.** The case file already carried only `obscured` copies for rows stating `obscured` (T37). With case-carriage T38-11, every photo is marked and its copy derived, so a marked photo and an unmarked one each travel as one `obscured` file, metadata-free.

**Tests**
- New `photos.test.mjs`, two tests, run on the real case-carriage with no stand-in for R9–R11 or R1:
  - Two real photos from `image-cover`'s fixtures, each with EXIF (make, GPS), XMP, ICC and text: the phone JPEG is marked with areas, the screenshot PNG is marked "nothing to obscure". `obscureMark` derives each copy, `photoMarks` names it, and the commit holds it. Only ratification R39's copy into the published bucket is stood in for, since it is the Worker's.
  - The first test: every file of every part, read from the zips, is neither original nor holds a 64-byte run of one. None holds the originals' metadata strings. Each `obscured` file has no metadata segment or chunk beyond an Orientation-only EXIF.
  - The second test: `publishedbytes` (raw, `format=zip`, `part`), `verify`, `publishedcase` and `publishedManifest` serve or list neither original, though the published bucket holds their bytes.
  - Controls: the fixtures' metadata is asserted present. With the guard off, two tests fail. With the unmarked photo included whole, both new tests fail.
- `obscured.test.mjs`:
  - The twin-row test and the archive test now also check that no route serves the original or the archive holding it.
  - Its two archive tests seed the pre-T38 archive registration. From T38 no commit carries an archive holding an image (case-carriage R8), so that registration can only come from an older edition.
  - Its other arms keep the T37 stand-in on purpose: they inject faults (wrong bytes at the copy's digest, an unregistered copy). With the real `marksLapsed` they are refused PHOTO_MARKS_CHANGED_SINCE, as they should be.
- `archives.test.mjs`: each archive's listing is now recorded as acquisition R38 writes it. After the merge, case-carriage R8 fails closed on an archive whose listing is not recorded, which turned 6 R32 tests red until this.

**Deferred:** nothing.

**In other modules:** nothing new. Whether to withdraw photos published whole before T38 is with Bob (B2).

**Reading (mechanics §17).** Over 300 KB, so path (3).
- Read whole myself: `public-read.md`; layer 8's row of `layers.md`; plan rules 4, 6 and 8, and T38-11, T38-12, T38-19, T38-20; K2220, K2248, K2291, K2303; case-grammar R12 and R14 as amended; case-carriage R1, R8, R9–R11, R14; `casefile.mjs`; `index.mjs` 1095–1414; `obscured.test.mjs`; image-cover's R1, R2, `index.mjs` and `cover.test.mjs` 1–135.
- One worker read the rest of the code and the tests named in its summary, in full: `index.mjs`, `worker.mjs`, `door.mjs`, `reads.mjs`, `courtorders.mjs`, `container.mjs`, `inband.mjs`, and 7 test files. Its summary is about 11 KB and every statement cites file:line.
- What it left out did not matter. It found the twin and earlier-edition leaks, which shaped J1.

**Tests and checks**
- `node --test bio-plane/test/m/public-read/`: tests 155, pass 155, fail 0.
- Users of public-read, before the merge, with my `index.mjs` change: 899 tests, 891 pass, 8 fail.
  - 7 of the 8 are in answer-envelope, op-declarations and plane. Those three suites give 281 pass / 7 fail with and without my change.
  - The 8th is `migrate-released.test.mjs`, rule 6 item 11.
  - The other fails are items 11, 13 and 15.
- `format`: 137 modules, 0 failures. `architecture`: 46 product files, 0 failures. The new test reaches case-carriage only through publication's world, not by import. `coverage`: 33 of 33 live ids, 0 failures. `ownership`: 5 files, 0 failures.

Size (session_017MDGGaJitGyMMpHwkiKVY2): test runs 14, module lines 3538
