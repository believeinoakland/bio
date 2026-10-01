# docprofile (T19)

**Status** · session_01U8i8H62hWH4qZJaGVoo2uf · depth 2 · WORKING · handled B1

## J1 · QUESTION

"N390's remainder" (B1): I find nothing of N390 left open. DOCPROFILE #2 (T17) converted `civicos-ui/test/staff-directory.test.mjs` whole (11 tests, deferred nothing; K574 settled its wording point), and EXTRACTION #7's "(4) the comment's negative-control arms … are docprofile's (N390)" names the same four arms (DECIDE, REFERENCE, ONEORG, OVERSTRICT) that T17's record already ran against `docprofile/test/staff-directory.test.mjs` (7, 2, 2, 0 failures, as declared). My best reading, which I am carrying out: the remainder is (a) the doubled `contact:` key, which T17's tests and EXTRACTION's tolerate but do not fix (that is N404, done here), and (b) the old fixtures `civicos-ui/test/fixtures/fw20-staff-directory.json` and `fw18-doctypes.json`, still read by `doctype-breadth`: my convert of it reads my own copies under `docprofile/test/fixtures/`, so nothing of mine depends on the old copies. If you meant something else by it, say which.

## J2 · QUESTION

A requirement the converted behaviour lacks (the K573 rule: a job proposes one, as a QUESTION). `reading-position-occurrences`' section 0 (D-454) pins `occurrences`, which no docprofile R names: a reference read more than once is ONE entity listing every place it was read. My convert carries it under R20 R34 (each occurrence is only what `locate` gave), which is the nearest meaning but not the whole of it. Proposed wording, appended to R34 (no change of behaviour; built and tested as it stands): "A reference read more than once is one entity, `source` its first sighting's, carrying `occurrences`: every place it was read, in reading order, the first included, each what `ctx.locate` returned for that read (null where it could not say); a reference read once carries no `occurrences`." If you would rather it be its own id, say which and I re-title the test. I carry on with R20 R34 in the meantime.
