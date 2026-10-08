# public-read (T37)

**Status** · session_01EVsuVsSMCLWPNamMbxZHon · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

R23's "never … an archive or container record of it" against R32's archive pool (`#archivePool`, `index.mjs`:1199). The pool reads `published_shas` by ref, across every edition, because `published_shas` has no edition column. So: edition 1 carries material M, a member of archive A, and also carries (or merely does not include) photo P, which A also holds; edition 2 obscures P. At edition 2's commit `case-carriage` R8 registers A for no material, but the pool still finds A, registered under M's ref by edition 1, and edition 2's case file would carry A, which holds P's original.

What I build now, within my Uses: the pool also reads each copy-carried row's ref. Any archive the projection shows holding a copy-carried original (through its `container` record, outward) is carried for no material, is named in `unheld` ("the archive holds a photo this case carries obscured"), and ends the walk. An included row at the original's digest carries nothing of those bytes. This closes the case where some edition registered P's own record. It does not close the case where no edition ever registered P's record (P was never carried whole), because then the published projection does not show that A holds P.

The full fix, which needs a `Uses` change, so it is yours: public-read uses `publication.heldMaterialsOf(case, edition)` (its R57), and the pool keeps only the archives and records this edition's commit held. No other edition can then lend this one an archive. I would add it in this job on your word: about 6 lines and one test.

Second reading, no answer needed unless you read it otherwise: R3's "`publishedbytes` at the original's SHA-256 answers `NO_PUBLISHED_PART`" holds where no edition published the original. An original that an earlier edition carried whole stays served, since editions answer forever (`publication` R24), and only a court order withholds it (R28).

## J2 · REPORT

B2 and B3 applied. I merged tranche/T37 (case-grammar and K2223's Uses line). The archive pool now keeps only what this edition's commit held (`publication.heldMaterialsOf`). I kept the narrower walk, run over every registration, so an archive holding a copy-carried original is still named `why: "the archive holds a photo this case carries obscured"`.

Tests: 153 in public-read, 152 pass. The one red is mine and expected: the K2223 arm (`obscured.test.mjs`, the last test). In it, a photo never carried whole sits in an archive that edition 1 registered under another material's ref. T36's case-carriage still holds that archive at edition 2's commit, because it does not yet know about `obscured` (its R8 as amended). The arm goes green when case-carriage T37-34 merges, which comes before me in L8's order. Please say when it has merged; I merge the tranche, re-run, and post COMPLETE.

Checks: format, architecture, coverage (33 of 33) and ownership: 0 failures each.
