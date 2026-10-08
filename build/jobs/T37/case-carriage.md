# case-carriage (T37)

**Status** · session_013UybDevdS9DJfUx9eqiUuX · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three points; I carry on with each best reading.

1. **The bucket for the copy (R11).** `record-core.evidenceStore()` (R38) keys every object `<ns>/captures/<digest>`, so it reads the original but cannot hold the copy outside `captures/`. Best reading: `caseCarriageOf(host, deps)` takes `deps.bucket` (the `CAPTURES` R2 binding) and `deps.store` (the namespace, a string or function, default `"bio"`), as file-safety's `derivedKey` does, and holds the copy at `<store>/obscured/<sha>` with custom metadata `{derived: "obscured", original: <capture sha>}`. Until the composition root (store-door / publication's factory) passes them, no copy can be held; the tests pass a stand-in bucket. The handing-in is the composition root's (a REPORT for its owner).
2. **No bytes to cover.** When the evidence store or the bucket is unbound, or the original's bytes cannot be read, R9/R11 name no outcome. Best reading (fail closed): the mark is recorded, no copy is made, `copy` null and `refused` null; R10 answers `state: marked` with `copy: null`, so R1 answers a copy-carried row unheld and R13 answers a whole-carried row lapsed. The next mark (even `areas: []`) derives again. A original over `COVER_MAX_BYTES` (read by `head` first, so nothing over the bound is fetched) is answered `refused: {code: "PHOTO_TOO_LARGE"}` as image-cover would.
3. **The refusal family.** R9's refusals are "a family of this module's own": best reading C-141 (C-140 is file-safety's, the highest I find), rows C-141.1 MACHINE_CANNOT_MARK, .2 NO_SUCH_PHOTO, .3 NOT_A_PHOTO, .4 MARK_MALFORMED, .5 STAFF_MARK_NO_REASON, .6 AREA_OUTSIDE, in `case-carriage/checks.mjs` as `CASE_CARRIAGE_CHECKS`, awaiting stamp. `answer-envelope/families.mjs` must import it for the catalogue (another module's; REPORT follows at COMPLETE). If another L8 job has claimed C-141, name mine.
