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

## J3 · COMPLETE

Entry T51-174 applied (the three words findings from `build/plan/words-pass/subresources.md`):
1. `bio-plane/src/subresources.mjs` `link_note` (findings at :1367 and :1373, one concatenated sentence): now one literal read through `localize("subresources.subresources.every_a_the_page_carried", en)`.
2. `bio-plane/src/subresources.mjs` `BANNER` (finding at :407, the derived-artifact banner): now `localize("subresources.subresources.derived_banner", en, { primarySha, when })`. I judged it a derived text, not a signed one (K1333): the companion is derived and its hash is recorded, not signed. Its wording is unchanged, so output is byte-identical.
Verified byte-identical: old and new `BANNER(...)` and `link_note` strings compared with HEAD for two input sets; equal.

Deferred: nothing.

Reports to BOB (posted as REPORT): a copy of the banner sentence in acquisition's `subresources-walk.test.mjs:100` (not this module's path); the three stale generated bundles.

Tests and checks:
- `node --test bio-plane/test/m/subresources/subresources.test.mjs`: 36 pass, 0 fail.
- `node --test bio-plane/test/m/acquisition/subresources-walk.test.mjs`: 13 pass, 0 fail (reads the module, not edited).
- `node checks/run.mjs /home/user/bio`: format 0 failures (174 modules); architecture 0 failures; the words check lists no finding for subresources (its full run still reports other modules' findings, outside this job).
- `node checks/ownership.mjs /home/user/bio subresources tranche/T51 job/T51/subresources`: 1 file changed by subresources, 0 failures.

Size (session_016S5EWxLud6RnWPVBD4mLr4): test runs 36, module lines 1400
