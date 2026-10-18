# subresources (T51)

**Status** · session_016S5EWxLud6RnWPVBD4mLr4 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

A test outside this module holds a sentence this module owns. `bio-plane/test/m/acquisition/subresources-walk.test.mjs:100` asserts `/DERIVED ARTIFACT, not evidence/`, copying the derived-artifact banner that `bio-plane/src/subresources.mjs` now reads through `localize`. The file is acquisition's (not in this job's paths), so I changed nothing there. The banner's wording is unchanged, so the test still passes; the copy is a words-check issue for acquisition's owner to convert to a key assertion (K3810).

## J2 · REPORT

Generated artifacts made stale by this job's change (unchanged text, so their content is still correct until regenerated; listed for BOB's layer-close regeneration, manifest §14):
- `bio-plane/dist/bio-plane.bundled.mjs` (bio-plane, `npm run build`)
- `pdf-worker/dist/pdf-worker.bundled.mjs` (pdf-worker; its inputs include `subresources`)
- `ocr-worker/dist/ocr-worker.bundled.mjs` (ocr-worker; its inputs include `subresources`)
The bundles' source text for `BANNER` and `link_note` changed form (now `localize(...)` calls), so their bytes will differ on rebuild even though the rendered text is identical.
