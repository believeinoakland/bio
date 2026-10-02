# case-grammar (T22)

**Status** · session_01HZ5CHsHwbUhmPLbDLKrwjg · depth 2 · WORKING · handled B1

## J1 · QUESTION

My readings of R8 and R9 where they leave a choice; I am building on them now and will bring the work in line with any answer.

1. **R8, "the section's text".** The lines after `## What Changed in This Edition, and Why` up to the next line beginning `## ` (or the end), leading and trailing blank lines dropped, joined with `\n`; `statement_sha` is the SHA-256 (record-grammar's `sha256HexSync`) of that text. The writer normalises a statement the same way (CRLF to LF, trailing spaces trimmed) and escapes a statement line that would begin a heading (`#`) with a leading backslash, so the section cannot end early; it renders identically.
2. **R8, a block whose `statement_sha` the section does not match.** `whatChangedOf` answers `statement: null` (undetermined, R6) with the block's other fields; a section with no block answers its statement with the block's fields null; neither answers null. Only a `/5` document is read (a `/4` answers null, as your START says).
3. **R3 collision.** R8's block has a `  statement_sha: ` line, which R3's acknowledgements locator (`the line beginning   statement_sha: `) would take for the acknowledgement list's. I keep R3's meaning by skipping lines inside the `what_changed:` run; documents without the block locate exactly as before. Placement for case-authoring: the "What changed" section at the top of the body (DEC-101), and neither new body section inside the acknowledgements prose run (from `**Who else read this statement.**` to `## What Was Searched`).
4. **R9, `lens_citations.statement`.** Statement ids are stable only within a bundle (bias's schema), so `statement` is written `<bundle>#<id>` (a bundle id cannot contain `#`), and `lensOf` attaches each citation to the statement with that key. `lensOf` answers `{statements: [{bundle, id, kind, subject, text, justification, withheld, citations}]}`.
5. **R9, `withheld` is computed, never given.** The writer takes each statement's citations as printed strings or `{citation, printed}`; `withheld` is the count not printed, and an unprinted citation's value is never written. A statement's count is printed beneath it even when 0 ("none").
6. **R9, with no manifest in force** the section prints the acknowledgement, then "No manifest was in force when this case was published: no bias set stood adopted for it. That is stated, not left blank: it is a different fact from a lens with nothing in it.", then the two sentences; an undetermined manifest (`in_force: null`) is stated as undetermined with its stated reason. The two sentences close every section, once.
