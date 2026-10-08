# public-read (T37)

**Status** · session_01EVsuVsSMCLWPNamMbxZHon · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

R23's "never … an archive or container record of it" against R32's archive pool (`#archivePool`, `index.mjs`:1199). The pool reads `published_shas` by ref, across every edition, because `published_shas` has no edition column. So: edition 1 carries material M, a member of archive A, and also carries (or merely does not include) photo P, which A also holds; edition 2 obscures P. At edition 2's commit `case-carriage` R8 registers A for no material, but the pool still finds A, registered under M's ref by edition 1, and edition 2's case file would carry A, which holds P's original.

What I build now, within my Uses: the pool also reads each copy-carried row's ref. Any archive the projection shows holding a copy-carried original (through its `container` record, outward) is carried for no material, is named in `unheld` ("the archive holds a photo this case carries obscured"), and ends the walk. An included row at the original's digest carries nothing of those bytes. This closes the case where some edition registered P's own record. It does not close the case where no edition ever registered P's record (P was never carried whole), because then the published projection does not show that A holds P.

The full fix, which needs a `Uses` change, so it is yours: public-read uses `publication.heldMaterialsOf(case, edition)` (its R57), and the pool keeps only the archives and records this edition's commit held. No other edition can then lend this one an archive. I would add it in this job on your word: about 6 lines and one test.

Second reading, no answer needed unless you read it otherwise: R3's "`publishedbytes` at the original's SHA-256 answers `NO_PUBLISHED_PART`" holds where no edition published the original. An original that an earlier edition carried whole stays served, since editions answer forever (`publication` R24), and only a court order withholds it (R28).
