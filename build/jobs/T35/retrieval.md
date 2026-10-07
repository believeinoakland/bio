# retrieval (T35)

**Status** · session_01FeUn5pWXtcyMpN79S2qaN6 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Six readings of R73–R75 I am building on; none blocks me. Answer only where you read it otherwise.

1. **A table in a document.** Readings hold a `.docx` table only as `{table, ref, rows, cols}`, with no cells (office-readers R11), and a PDF table not at all. So which column holds the dates or amounts cannot be read. My reading: a `doc-table` text unit holding any date or amount match is **one** result naming the table, `table: {capture_sha, extent, column: null, rows: null, column_why}`, never one item per row. Workbooks, whose typed cells the reading holds (office-readers R30), get one result per qualifying column, `column` and `rows` filled.
2. **What makes an "amount column".** A sheet column (first row read = header) whose every other filled cell is either a `number` cell under a header naming a currency (a sign, code or currency word of the set), or a text cell the money matcher reads whole. A "date column": every other filled cell is a `date` cell, or a text cell the dates matcher reads whole as a calendar date. Bare numbers under a plain header are not amounts.
3. **Selection scope.** It is read under the control plane's `owner` stamp, defaulting to the viewer. Another owner's handle answers R19's `NOT_YOURS`; an unknown or expired one answers `NO_SUCH_SELECTION`. The selection is read **without** extending its life (R73: nothing written). I factored R19's member resolution into one read-only helper that `selectionResolve` also uses.
4. **An item whose reading cannot say where it was read** (an unplaced reference or agenda item) carries `extent: null` with `extent_why`. It is never given `{kind: "document"}`, because a reader's silence is not a member's citation of the whole (extraction's `reading_refs` doctrine).
5. **No language known.** Readings state no language today, so the active profiles' `locale` decides. With no profile and no locale, `money`, `dates` and `requirements` put the capture in `not_read`, saying that no language is stated. The capture is never matched with English by default.
6. **"People and offices the group follows".** I read this as every registered entity of kind `person` or `office`. For each, `entities.namingDocuments` (its R17) is called, and candidates outside the scope are dropped, so the correspondence rule stays in entities. If any call answers `truncated`, the `people` kind is `truncated` and never "Nothing here". This is one call per entity; I will report the efficiency to you separately.
