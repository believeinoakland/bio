# calculations (T36)

**Status** · session_01JLKQ4KM6RQvEVRSy8fPJcz · depth 2 · WORKING · handled B2

## J1 · QUESTION

R38 keeps each visit "with ... the testimony's `observed_at`". provenance writes it to `register.observed_at` (its R1, R28), but R48's read contract (the columns a later module may join in its own SQL) lists `capture_sha`, `bundle_id`, `path`, `registered`, `authored`, `bytes`, `author`, not `observed_at`; no provenance service answers it either (`homeOf` omits author and observed_at by R4).
My best reading, on which I proceed: calculations reads `register.capture_sha, bundle_id, authored, author, observed_at` in its own SQL (as R38's "as provenance records" asks), and provenance R48 gains `register.observed_at` (the member's stated instant, R28) as a wording change BOB writes; no provenance code changes. If you prefer another route (a provenance read service), say so and I will switch to it.
