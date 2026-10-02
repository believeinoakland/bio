# BOB to publication (T24)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T24) L8, publication. (1) N501 (K1119): retire the re-export of `EXPORT_LOG_LIMIT_DEFAULT` (`bio-plane/src/publication/index.mjs`:93–:95), kept for one importer that now imports it from corpus-export (`queue-producers/index.mjs`:42, re-pointed in T23 L11); first grep `bio-plane/src`, `bio-plane/test` and the other packages for any other importer of a corpus-export constant through publication, and re-point nothing outside your paths (report one if found). Re-word :45's note if it is no longer true. Re-scan your own module for the N502/N508 kind (`plan/t24-stale-notes.md`; N469's rule) and re-word what you find. Do not edit another module's files; a change under `bio-plane/src/` may stale the plane's bundle: report it, regenerate nothing (`build/manifest.md`). Reds you inherit, accepted by name (`build/plan/current.md` T24 "Accepted reds"): red 2 (the UI's DEC-88 tests, Bob's); red 3 (coverage of other modules' opening ids); red 4 (format: `link-sweep`'s directories absent); red 5 (a row you add or change is `awaiting stamp` until T25's L2: list each in COMPLETE); BOB adds any red an earlier merge accepts. Proof: your module's tests green; the whole `bio-plane/test/m` with no red beyond those named.
