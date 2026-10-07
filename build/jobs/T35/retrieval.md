# retrieval (T35)

**Status** · session_01FeUn5pWXtcyMpN79S2qaN6 · depth 2 · WAITING ON BOB (J3) · handled B3

## J1 · QUESTION

Six readings of R73–R75 I am building on; none blocks me. Answer only where you read it otherwise.

1. **A table in a document.** Readings hold a `.docx` table only as `{table, ref, rows, cols}`, with no cells (office-readers R11), and a PDF table not at all. So which column holds the dates or amounts cannot be read. My reading: a `doc-table` text unit holding any date or amount match is **one** result naming the table, `table: {capture_sha, extent, column: null, rows: null, column_why}`, never one item per row. Workbooks, whose typed cells the reading holds (office-readers R30), get one result per qualifying column, `column` and `rows` filled.
2. **What makes an "amount column".** A sheet column (first row read = header) whose every other filled cell is either a `number` cell under a header naming a currency (a sign, code or currency word of the set), or a text cell the money matcher reads whole. A "date column": every other filled cell is a `date` cell, or a text cell the dates matcher reads whole as a calendar date. Bare numbers under a plain header are not amounts.
3. **Selection scope.** It is read under the control plane's `owner` stamp, defaulting to the viewer. Another owner's handle answers R19's `NOT_YOURS`; an unknown or expired one answers `NO_SUCH_SELECTION`. The selection is read **without** extending its life (R73: nothing written). I factored R19's member resolution into one read-only helper that `selectionResolve` also uses.
4. **An item whose reading cannot say where it was read** (an unplaced reference or agenda item) carries `extent: null` with `extent_why`. It is never given `{kind: "document"}`, because a reader's silence is not a member's citation of the whole (extraction's `reading_refs` doctrine).
5. **No language known.** Readings state no language today, so the active profiles' `locale` decides. With no profile and no locale, `money`, `dates` and `requirements` put the capture in `not_read`, saying that no language is stated. The capture is never matched with English by default.
6. **"People and offices the group follows".** I read this as every registered entity of kind `person` or `office`. For each, `entities.namingDocuments` (its R17) is called, and candidates outside the scope are dropped, so the correspondence rule stays in entities. If any call answers `truncated`, the `people` kind is `truncated` and never "Nothing here". This is one call per entity; I will report the efficiency to you separately.

## J2 · REPORT

Found in other modules while doing T35-37. None of these is mine to change.

1. **entities** (efficiency; K1968). R74's `people` asks `namingDocuments` (R17) once per followed person or office. Each call runs two statements per alias over the whole corpus, then drops the candidates outside the scope. Inside retrieval I took the bounded alternative you named: at most 200 followed entities per call (`FIND_PEOPLE_MAX`), in id order, and past that `truncated` with `truncated_why`. "One read over all entities" cannot be done from here, because `namingDocuments` is per entity and the alias table is not in entities' stated read contract (its R35). The lasting fix is entities': a lookup scoped by captures, such as `namingIn({captureShas, kinds, viewer})`, answering R17's candidates for every registered entity of the given kinds over those captures' references in one bounded read. Retrieval would then call it once per page.
2. **office-readers / extraction** (a gap behind R74's table rule, K1468). A `.docx` table is held in the reading as `{table, ref, rows, cols}` only, with no cells (office-readers R11), and a PDF table not at all. So "a table whose column holds dates or amounts" can be told by column only for workbooks (typed cells, office-readers R30). A document table is one result naming the table, with `column: null` and a why (J1 (1), K1968). Holding a document table's cells as R30 holds a sheet's would let the column be named.
3. **basis-versions** (`test/m/basis-versions/`, R43 "for every bundle of the corpus under every registry variant, checkBundle given record.grammars() answers the catalogue's findings before the move…"). It fails on `tranche/T35` without my change (1 fail of 131, the same test with and without it). It is not one of the plan's named inherited reds.
4. **The plane bundle** (`bio-plane/dist/bio-plane.bundled.mjs`, `not_product`'s, §14). It is stale from this job: retrieval gained `findin.mjs` and imports civil-time, calc-grammar and entities. It needs regenerating at L5's close.
5. **op-declarations (T35-70) and control-plane (T35-72).** `op=findin` is in `retrievalRoutes`. It reads `scope`, `kinds`, `term`, `limit` and `cursor` from the body, or from the query with the scope as JSON and the kinds comma-separated. It reads `viewer` and `owner` from the control plane's stamps; `owner` is the stamp a selection scope is read under and defaults to the viewer. Its refusal codes are R73's.

## J3 · COMPLETE

T35-37 done. Commits e9a97be0ea and 153c52329c on `job/T35/retrieval`, branched from `tranche/T35` after L4's close. The branch does not need `tranche/T35` merged in: none of the files I read changed there.

**Entries applied**
- **R69, worded as met (N677, K1803).** No code change. `zone()`'s first touch of local-facts can make that module's empty table in a store where the plane's boot has not made it. The new tests prime the store before taking their "writes nothing" snapshots, citing R69, as the plane has every module made before any request.
- **R73 `findIn` (`op=findin`).** Four scope forms, each resolved under the viewer's sight:
  - a capture;
  - a selection, read under the owner stamp, never extending its life. R19's member resolution is now one read-only helper that `selectionResolve` also uses, with no change to its behaviour;
  - up to 200 enumerated bundle ids or capture shas;
  - a project's holdings: the project's own bundle and the bundles filed in it.
  
  A capture the viewer may not see is left out and counted nowhere. R73's refusals come in its order. The answer is `{ok, scope, kinds: [{kind, items, count, truncated, nothing, not_read}], captures_read, limit, captures_limit, next}`. At most 200 captures are read per call, in capture-sha order, with `next` naming where to continue. Items per kind: 1–500, default 50, `truncated` by reading one past. Words are at most 500 characters, cut at a word with `…`. "Nothing here" is said only when the whole scope was read for that kind, nothing matched and nothing was unread. A find writes nothing and calls no model.
- **R74, the kinds**, in `bio-plane/src/retrieval/findin.mjs`:
  - `people`: entities R17's correspondence, at most 200 followed entities per call (K1968);
  - `money`: each amount with `as_read` and calc-grammar's `parseFigure` figure, or `figure: null` with why;
  - `dates`: `date` only for a whole calendar date (`isCalendarDate`), else null with why; deadlines with `period: {amount, units}` only where both are stated, never a due date;
  - `requirements`: the sentence and the word found, never a force;
  - `events`: the minutes and agenda readers' items, with their `facts`, as extraction holds the reading. The readings carry the items, so there is no `doctypes` edge;
  - `term`: query-language's `passage:` arm, through the compiler and the gated executor (R28).
  
  A workbook's date or amount column is one table result: `{capture_sha, extent, column, rows}`, its words the header. A document table is one result with `column: null` (J1, K1968). An item the reading cannot place carries `extent: null` with why.
- **R75.** `FIND_MATCHERS` is frozen, `en` is held, and it is the only place the matchers' words live. A capture's language is its reading's `language` where stated, else the active profiles' `locale` primary subtag. A capture with no set for its language, or no language at all, is in `not_read`.

**Deferred**: none in this module. The gaps behind the table rule and the `people` cost are other modules' (J2).

**Found in other modules**: J2. Entities' scoped name lookup; document tables' cells not held; basis-versions R43 red on the base and not named; the plane bundle stale; `op=findin`'s parameters for T35-70 and T35-72.

**Tests and checks**
- retrieval, `node --test bio-plane/test/m/retrieval/`: 153 tests, 153 pass, 0 fail. The new file is `findin.test.mjs`, 14 tests naming R73, R74, R75 (and R29, R32). `projection.test.mjs`'s R58 op list gains `findin`.
- Users of retrieval, run with the change:
  - calculations 38/0, inquiry 175/0, citation 55/0, strength 143/0, ai-runs 71/0, answers 34/0, intent 73/0, ratification 212/0, actions 96/0, monitoring 121/0, scheduler 95/0, agent-worker 9/0;
  - action-clocks 51/2: red 14;
  - control-plane 181/1: catalogue-end, red 19;
  - plane 109/6: ask ×6, red 22;
  - basis-versions 130/1: R43, also red on the base (J2 (3)).
- `format.mjs`: 130 modules, 2 failures, both the law-relations entries (red 24).
- `architecture.mjs retrieval`: 28 files, 0 failures.
- `coverage.mjs retrieval`: 75 of 75 live ids, 0 failures.
- `ownership.mjs retrieval tranche/T35`: 0 failures.

Size (session_01FeUn5pWXtcyMpN79S2qaN6): test runs 12, module lines 3276
