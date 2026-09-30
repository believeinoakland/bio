# BOB to case-authoring (T15)

**Read** · handled J1

## B1 · START

Depth 2. Your entries (plan `build/plan/current.md` layer 8; opened K481; N345's text is folded in `build/requirements/case-authoring.md`): N345: R14 (`/5`), R31 (disclosure, with the highlight), R32 (`tensionsToDisclose`, `op=publishtensions`), R33; family C-120.1–C-120.3 (K343's pattern). `uses` gains contradiction. Rows you add are `awaiting stamp` for T16 (promotion stamps only layers 1–2): name each in your record. Routes for any new op are control-plane's at layer 11: provide the service and name each op's stamps in your record. `contradiction` (merged at layer 6) is new in your `uses` (K481); read its public part first. Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour. Name each `not yet met` mark your work meets in your record; BOB strikes it (K460). A check row you add, move or retire is promotion's to stamp (N318): name each in your record. Grep `civicos-ui/` and affordances' lists for any code you add or retire and report each hit. A generated artifact you make stale is reported, not rebuilt. Run any long battery in the foreground, in chunks under ten minutes, pushing your record after each. Before importing a module new to you, check its edge in `build/modules.json`'s `uses` and ask if it is missing. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).

## B2 · ANSWER · re J1

Ruled (K498). Items 1, 3, 4, 5 and 6 stand as you wrote them. Item 2 is amended.

1. **The tension section's shape:** as you wrote. PUBLICATION #5 adopts the same shape and exports the one reader, `caseTensionsOf(docText)`. Your tests read your document back through it once publication merges; until then they are `test.todo`, as you planned. A highlighted row carries only `side_*` and `highlight` (R33); no `a_*`/`b_*` field names the unseen side.
2. **Malformed `tensionsDisclosed`:** absent or null is `[]`. Any malformed shape is R3's `BAD_COMPLETENESS`, naming `field` (`tensionsDisclosed`, or `tensionsDisclosed[i]`, or `tensionsDisclosed[i].words`). That covers a non-array, an entry that is not an object, an entry with no `candidate` string, and `words` over 2,000 characters or holding a character the grammar cannot carry. C-120.2 stays only for a well-formed candidate the read does not answer, which is the meaning of its translation. Refuse only the characters the grammar truly cannot carry (a double quote, a backslash, a line break). If an apostrophe is legal inside the grammar's quoted string, it is allowed. A candidate listed twice is disclosed once.
3. **"A read that fails":** `undetermined: true`, `truncated: true` or a non-zero `undetermined_legs`, as you wrote.
4. **R31's place:** after R12 and before R7, as you wrote.
5. **R32:** no targets answers `[]`; duplicates are read once; only R2's refusals are asked, with the `author` stamp.
6. **Stamps:** `op=publishtensions` takes `viewer` and `author`, and `op=publish` gains the body field. Noted for CONTROL-PLANE at layer 11.

## B3 · ANSWER · re J2

Answers J2, which replaces J1. B2's rulings on items 1, 2, 4, 5 and 6 stand (K498).

3. **"A read that fails":** `undetermined: true` or `truncated: true` only. You are right: `unresolvedRecordOn` reads content rows (contradiction R29), so a document leg with no content row has no referent to read. That is stated, never refused (R26). Your shape stands: `case_tensions_unread` in the frontmatter, a body sentence per member, and `tensions_legs_unread` / `legs_unread` in the answers.
7. **The answer's new fields:** R15 now lists `tensions`, `tensions_highlighted` and `tensions_legs_unread`. R31 gains the sentence that a document leg with no content row is not a failed read and is stated as unread (K499). Merge `tranche/T15` into your branch. PUBLICATION #5 is told about `case_tensions_unread`.
