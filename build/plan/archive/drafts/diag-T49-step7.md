# Step 7 diagnosis (journey-check "After B7"): the document page's words and its versions

Diagnosis worker for BOB, 2026-10-15. Tree: `tranche/T49` @ 66ecaa5982. The code for these paths is the same as at the walk's ceca2ea2fd: there is no diff in screens-inquiry, screens-intake, extraction, provenance or interface-shell. Nothing in the repository was changed.

**Reproduction.** `/tmp/claude-0/diag/repro.mjs` runs the whole plane under Miniflare, as `test/m/capture/plane.test.mjs` builds it. The stub city site serves the walk's exact `NOTICE_HTML`. The script then runs the screen's own path:
- a member session;
- `acquire {locator: NOTICE_ADDRESS}`;
- `promote` composed byte for byte as `screens-intake/capture.mjs` `promoteDocument` composes it;
- every read the document page makes, once with the capture sha and once with the sha the page actually uses.

Run it with `node /tmp/claude-0/diag/repro.mjs`.

| read | with the capture sha `d480cc23…` | with the sha the page uses, `content_hash` `5e44d505…` |
|---|---|---|
| `acquire` (the capture's answer) | 4 `doc-para` `text_units` (R32 works); the reading is generic, `found: false`, `text_chars: 624` | — |
| `op=reading` | `found: true`; the R1 reading, keys `content_type … text_chars, text_glyphs, metadata`. **No `passages`, `units` or `text`** | `found: false, reading: null` |
| `op=findin {scope:{capture}, kinds:["term"], term:"repair the roof"}` | 1 item, `doc-para` para 2, the passage itself | `CAPTURE_NOT_HELD` |
| `op=versionchain address=… at=…` | `ok`, 1 version, `at_index` 0 | **`VERSION_CHAIN_NO_SUCH_VERSION`** (the walk's defect 2) |

What this shows:
- The text-unit indexing is **synchronous at `promote`**. It needs no alarm or scheduler, so the local arm does not miss anything here.
- Reading-pipeline R32's path is reached and works end to end. Its units are in `capture_text`, and Find-in reaches them when it is given the capture sha.

## The root cause both defects share: the document page uses the wrong sha

`bio-plane/src/screens-inquiry/document.mjs:93`:
```js
const sha = doc && /^sha256:[0-9a-f]{64}$/.test(String(doc.content_hash || "")) ? String(doc.content_hash).slice(7) : "";
```
- `content_hash` is the bundle's **dataset digest** (capture grammar C-2.7: the sha256 of the canonicalised `data/dataset.json`). It is not the capture's sha.
- Screens-intake writes it exactly that way at `bio-plane/src/screens-intake/capture.mjs:72` (`"content_hash: sha256:" + await cs.digest(dataset)`), as C-2.7 and release's `ENTRY_REQUIREMENTS` require. That line is correct.
- The page then keys every capture read on this wrong value: `reading` (:138), `gradenote`, the held row's grade match (:116–118), the `findin` act's scope (:135 → `/app/find-in/<sha>`, which then answers `CAPTURE_NOT_HELD`), `versionchain`'s `at` (:193), `links` and `connections`.
- A testimony (`provenance` `testify`) writes no `content_hash` at all, so on a testimony `sha` is `""` and the page draws none of those reads.
- The module's own fixture hides the error. `bio-plane/test/m/screens-inquiry/fixtures.mjs:38` writes `content_hash: sha256:${SHA}` with `SHA` the capture sha, so every test passes against a bundle shape the plane never produces.

The real capture sha is already in the page's hands. `d.capture.value` (the `image` answer) carries `data/provenance.json`, and its `documents[0].capture.sha256` is `d480cc23…` in the reproduction. Testimonies carry the same field (`provenance/index.mjs`:1619). `data/dataset.json` `documents[0].sha256` holds it too, for a promoted capture.

---

## Defect (2): `versionchain` answers `VERSION_CHAIN_NO_SUCH_VERSION` for the copy just captured

- **Cause:** `screens-inquiry/document.mjs:93` together with `:193`. The page passes `at = content_hash` (the dataset digest `5e44d505…`), not the capture sha.
  - Provenance is correct. `versionChain` (`provenance/index.mjs`:1251–1318) holds the version: the capture path records the receipt through `acquisition/index.mjs`:1101 → `recordReceipt`, and promote registers `capture_sha → bundle_id`.
  - With the right sha the chain answers one version, `at_index` 0, `predecessor` null.
  - The walk record's "`at` its own sha" is mistaken: the `at` it sent is the bundle's dataset digest.
- **Owning module:** screens-inquiry. Provenance is not at fault.
- **Fix (code):** read the capture sha from the bundle's provenance document. `content_hash` is never that sha.
  ```diff
  -  const sha = doc && /^sha256:[0-9a-f]{64}$/.test(String(doc.content_hash || "")) ? String(doc.content_hash).slice(7) : "";
  +  /* the capture's own sha, from its provenance document (a testimony's too); never content_hash, which is the
  +     dataset digest (capture grammar C-2.7) */
  +  const provDoc = (() => { try { const p = JSON.parse(String(d.capture.value["data/provenance.json"] || "")); return Array.isArray(p.documents) ? p.documents[0] : null; } catch { return null; } })();
  +  const sha = doc && provDoc && provDoc.capture && /^[0-9a-f]{64}$/.test(String(provDoc.capture.sha256 || "")) ? String(provDoc.capture.sha256) : "";
  ```
  - For a multipart capture (`parts`), each part has its own sha in the register. Taking `documents[0].capture.sha256` keeps the page to the document's own capture, which is what `acquire` records the receipt under.
  - The test fixture must change with it. `fixtures.mjs:38`'s `content_hash` should become a dataset digest that differs from `SHA`, and the image fixture should carry `data/provenance.json` with `capture.sha256: SHA`. A control test should check that a `content_hash` different from the capture sha still reads `versionchain`, `reading` and `findin` at the capture sha.
- **Side defect, same section:** the page draws each version's date from `x.at || x.retrieved` (:207), but `versionchain` answers `first_retrieved`. The dates are blank as soon as there are two versions. The fixture (`fixtures.mjs:93`) invents `at` here too. Read `x.first_retrieved`.
- **Requirement:** screens-inquiry R3 (reads `versionchain`) and R32 ("Its versions"). Both already require this, so the fix needs no new requirement text. A one-clause clarification in R32 that the page's capture reads are keyed on the capture's sha from `data/provenance.json`, never `content_hash`, would stop this coming back.

## Defect (1): the document page draws none of the document's words

The cause has two layers, and both are in the way. Fixing only the first still draws no words.

1. **The wrong sha** (`document.mjs:93`, as above). `op=reading` gets the dataset digest and answers `found: false`. `later()` settles that as `empty` (:67), and `secOf` then draws no Passages section (:86–87). The same wrong sha makes the page's Find-in act open `/app/find-in/<content_hash>`, which answers `CAPTURE_NOT_HELD`, so step 7's second half fails as well.
   - The record's "624 characters read" matches the found reading at the capture sha (`text_chars: 624`), which the walk may have observed elsewhere, e.g. in the capture's answer.
   - The page's own `op=reading`, on this tree, is sent the dataset digest. I did not run the browser walk itself.
2. **The page reads a field that no reading carries** (`document.mjs:140–143`). It looks for `r.reading.passages`, then `.units`, then `.text`.
   - `op=reading` is `extractionOps.reading` → `Extraction.readingFor` (`extraction/index.mjs`:1866 → :947–985). It answers extraction R27's shape, whose `reading` is reading-pipeline R1's object: `{content_type, reader_version, read_from_text, found, entities, facts, at, basis, position_*, provenance, text_chars, …}`.
   - By requirement, that object holds **no text**. The text units (R15/R32) are written to `capture_text` (extraction R22, R58), and only `unitsOf` (extraction R36) reads them back. **No op exposes them.** `unitsOf` is an in-process read used by `content` and `case-carriage`.
   - The screens-inquiry fixture's `READING` (`fixtures.mjs:47–48`, `reading: {passages: [...]}`) invents a shape the plane never answers.
   - R32 itself is met: the units exist and are searchable. The gap is between extraction's answer and the page.

- **Owning module:** two modules share it.
  - **screens-inquiry** owns the sha (layer 1) and the field it reads (layer 2, page side).
  - **extraction** owns exposing the units to a screen (layer 2, provider side). That needs requirement text: today R27 does not answer units, and no op does.
  - reading-pipeline is not at fault: R32 is met and indexing is synchronous.
- **Smallest correct fix:**
  - (a) **screens-inquiry:** the sha fix above. It alone also repairs Find-in from the document page, the grade mark, `gradenote`, `links` and `connections`.
  - (b) **extraction:** amend R27 so that `op=reading`, for a found reading, also answers `text_units`. These are R36's indexed units in `seq` order, `{extent, ref, text, truncated, seq}`, at most its 4,096, with the index `state`. They are withheld with the bundle exactly as `bundle_id` is: a viewer who may not see the bundle gets no units, which keeps R27's "hidden and absent are one answer". This is about four lines in `readingFor`:
    ```diff
    +    const units = this.#redactor(viewer)(row.bundle_id) === null ? null : this.unitsOf(row.capture_sha);
         return { ok: true, found: true, capture_sha: row.capture_sha,
                  ...
    +             ...(units ? { text_units: units.units, text_units_state: units.state } : {}),
                  ...this.#unreadOf(...) };
    ```
    An alternative is a separate read-only op (e.g. `textunits`, declared in op-declarations for member/admin/probe and gated the same way). Amending R27 is smaller and keeps the page to one read. BOB should rule between the two.
  - (c) **screens-inquiry:** read the passages from `r.text_units` (top level), falling back to `r.reading.passages` only if some reading ever carries them. `extent` is then the unit's `doc-para` (or `pdf-page`) extent, so `cite`'s `found` (`{capture_sha, extent, kind:"passage"}`) works for step 8. Fix the `READING` fixture to the real shape: `reading` with no text, `text_units` beside it.
- **Code or test/expectation:** this is code, in two modules, plus the screens-inquiry fixtures, which are wrong. The walk's expectations are right. Its `READING_EXPECTS` (the generic reading's `found: false`) remains true after the fix, because the generic reader still finds no entities.
- **Requirement ids:**
  - screens-inquiry R3 (passages read from `reading`) and R32. R3's "its reading's passages (`reading`)" names a field `reading` does not answer, so R3 should be re-worded together with extraction's amendment.
  - **extraction R27: needs requirement text**, the `text_units` clause or the new op, with the R36 bound and the bundle gate.
  - reading-pipeline R32 is met, with no change.

## Routing summary

| | owner | kind | requirement |
|---|---|---|---|
| sha from `content_hash` (both defects) | screens-inquiry (`document.mjs:93`; fixtures :38) | code + fixture | R3, R32, no new text; a clarifying clause is optional |
| versions' dates `at` vs `first_retrieved` | screens-inquiry (`document.mjs:207`; fixtures :93) | code + fixture | R32 |
| no op answers a capture's text units | extraction (`readingFor`, `index.mjs`:947) | code | **R27 amendment needed** (or a new op, BOB's ruling) |
| page reads `reading.passages` | screens-inquiry (`document.mjs:140–143`; fixtures :47) | code + fixture | R3 re-worded with extraction R27 |
| provenance `versionChain` | none (correct) | — | — |
| reading-pipeline R32 / indexing | none (met, synchronous at promote) | — | — |
