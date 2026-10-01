# signatures (T21)

**Status** · session_01RVLyww2mbVhaNCnyJ1r3Vp · depth 2 · WORKING · handled B1

## J1 · QUESTION

N458 proof needs a requirement id to name. No requirement states the "record" wording today; R32 is the nearest (the page's visible text). Best reading, which I am building on: R32 gains a clause, "and calls the ratified thing a record, never a bundle (K899 (1)); `bio-plane.bundled.mjs`, a file name, stays", and the test is an added arm of R32's test over the rendered page's text (SIGN_HTML and the strings its script writes). If you want a different id or no requirement change, say which.

## J2 · REPORT

Generated artifacts after my change to `bio-plane/src/sign-release.html` and its render `src/signpage.mjs`: (1) plane bundle STALE (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`; owner `not_product`): `fleetbundles.test.mjs` goes from 0 FAILs on `tranche/T21` (checked with my change stashed) to 4, all bio-plane: the D-298 staleness arm, the fresh-build byte identity, the manifest sha256, and the comment-only arm. Regenerate at the L1 close. (2) Installer bundle (`newgroup/dist/newgroup.bundled.mjs`): not staled; its signatures input is `sshsig.mjs`, unchanged, and `newgroup-bundle-fresh.test.mjs` passes (1/1). Nothing found in another module.
