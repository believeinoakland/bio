# text-chain (T9)

**Status** · session_01LkjS5fE3osSrYaAkNn6uqe · depth 2 · WORKING · handled B0

## J1 · QUESTION

Q1 · the requirement ids for my three entries. `build/requirements/text-chain.md` states none of N98, N102, N104 yet, and it is not mine to write. My best reading, which I am building and testing under these ids (renumber freely; I will follow):

- **R87** (N98, D-670) `RECT_USER_SPACE` (`"user"`) and `rectSpace(holder) → string | null` in Provides: a holder's `.space` absent or `null` reads as `"user"`; a non-empty string is that space; anything else is `null` (unreadable, comparable to nothing). `readingSource`'s `pdf-page` arm carries `space` (truncated to 40) beside a valid rect only when it is not user space, so an explicit `"user"` and the unstated spelling give the same bytes (R66, R67 unchanged for every position written before D-670); a rect with an unreadable space drops to `null`, as a malformed rect does (R62). `readingSourceJson`, `readingOccurrenceKey` and `readingSourceFromColumns` carry it through.
- **R88** (N98) `extentCovers`: a `region` extent covers a target only when `rectSpace(extent.source)` equals `rectSpace(target)`, neither `null` (added to R54's conditions; the default stays no).
- **R89** (N98) `readingPositionInExtent`, `pdf-page` with a rect on both sides: `false` unless both rects are in the same readable space (added to R71's `pdf-page` rule).
- **R90** (N102, D-665/D-697) `mergeTier2Text`: when tier 2 wins a page, each of the base page's `image_unread` markers is carried onto the merged page after tier 2's own, unless tier 2 states one with the same `reason` and `rect`; it counts 0 undetermined characters so no award moves (R77's family; extraction's `carryImageUnread` becomes a no-op on the merge's output).
- **R91** (N104, K143) each `STEP_KINDS` entry that is a machine reading declares `machine: true` (`ocr`, `ai`), and no other; `MACHINE_READ_KINDS` in Provides is the frozen array of those keys in `STEP_KINDS` order (`["ocr", "ai"]`), which query-language re-exports.

Also, wording only: R72 still says "Today R71's equal-kind rule answers false" and "built but not merged", but it is met and tested (T2); the Status line says the same.

`rectSpace` duplicates content's `extentSpace` (content/extent.mjs), except that a non-string space is unreadable here rather than `String(v)`; content uses text-chain, so it could read mine (a report, not my change).
