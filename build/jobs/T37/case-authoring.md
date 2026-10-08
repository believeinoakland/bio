# case-authoring (T37)

**Status** · session_01SSuxFGyKjUgKQQSHYhEaFU · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

R62 is done and tested (statement.test.mjs, "R62: …"): `op=statementack` reads `secretSha` from the body only; a query digest opens no door (the dead answer). R34's Photos step is coded to `case-disclosures`' public R29 (`photosOf(reached.materials, memberRoles, viewer)`) as a new step 4 "photos" `{photos, unchecked}` between "what you are leaving out" and "the edition this creates". The later steps are renumbered 5 and 6, matching the screens' ceremony order (`library.src.py`); nothing outside this module reads the steps by position. R6's photo refusals reach `first`/`blockers` through `materialsJudged` unchanged. R14's `obscured: {copy, label}` passes through `disclosureBlocks` rows into `case-grammar`'s `materialBlockLines` with no reshaping here. Pushed at 1c62b1d53a.

My 20 pre-flight tests are red on one cause only, `D.photosOf is not a function`, until T37-41 is on `tranche/T37`. The end-to-end photo tests (a marked photo carried by its copy in the document; unchecked counted and not a blocker; PHOTO_NOT_COVERABLE and PHOTO_MARKS_UNDETERMINED as first and among blockers) also need T37-34 (`case-carriage`: `obscureMark`, `photoMarks`) and T37-40 (`case-grammar` R12) there. When they merge, my fixture will compose `case-carriage` (and `image-cover`) for `case-disclosures` the way the plane does.

QUESTION: my best reading is that I wait for T37-34, T37-40 and T37-41 to merge, then merge `tranche/T37` and finish. Please send a RESUME (or a CHANGE) once T37-41 is merged. If you would rather I write the photo tests now against stand-ins for `case-disclosures`, say so.
