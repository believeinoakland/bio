# subresources (T51)

**Status** · session_016S5EWxLud6RnWPVBD4mLr4 · depth 2 · WORKING · handled B1

## J1 · REPORT

A test outside this module holds a sentence this module owns. `bio-plane/test/m/acquisition/subresources-walk.test.mjs:100` asserts `/DERIVED ARTIFACT, not evidence/`, copying the derived-artifact banner that `bio-plane/src/subresources.mjs` now reads through `localize`. The file is acquisition's (not in this job's paths), so I changed nothing there. The banner's wording is unchanged, so the test still passes; the copy is a words-check issue for acquisition's owner to convert to a key assertion (K3810).
