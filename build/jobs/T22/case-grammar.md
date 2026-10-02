# case-grammar (T22)

**Status** · session_01HZ5CHsHwbUhmPLbDLKrwjg · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

My readings of R8 and R9 where they leave a choice; I am building on them now and will bring the work in line with any answer.

1. **R8, "the section's text".** The lines after `## What Changed in This Edition, and Why` up to the next line beginning `## ` (or the end), leading and trailing blank lines dropped, joined with `\n`; `statement_sha` is the SHA-256 (record-grammar's `sha256HexSync`) of that text. The writer normalises a statement the same way (CRLF to LF, trailing spaces trimmed) and escapes a statement line that would begin a heading (`#`) with a leading backslash, so the section cannot end early; it renders identically.
2. **R8, a block whose `statement_sha` the section does not match.** `whatChangedOf` answers `statement: null` (undetermined, R6) with the block's other fields; a section with no block answers its statement with the block's fields null; neither answers null. Only a `/5` document is read (a `/4` answers null, as your START says).
3. **R3 collision.** R8's block has a `  statement_sha: ` line, which R3's acknowledgements locator (`the line beginning   statement_sha: `) would take for the acknowledgement list's. I keep R3's meaning by skipping lines inside the `what_changed:` run; documents without the block locate exactly as before. Placement for case-authoring: the "What changed" section at the top of the body (DEC-101), and neither new body section inside the acknowledgements prose run (from `**Who else read this statement.**` to `## What Was Searched`).
4. **R9, `lens_citations.statement`.** Statement ids are stable only within a bundle (bias's schema), so `statement` is written `<bundle>#<id>` (a bundle id cannot contain `#`), and `lensOf` attaches each citation to the statement with that key. `lensOf` answers `{statements: [{bundle, id, kind, subject, text, justification, withheld, citations}]}`.
5. **R9, `withheld` is computed, never given.** The writer takes each statement's citations as printed strings or `{citation, printed}`; `withheld` is the count not printed, and an unprinted citation's value is never written. A statement's count is printed beneath it even when 0 ("none").
6. **R9, with no manifest in force** the section prints the acknowledgement, then "No manifest was in force when this case was published: no bias set stood adopted for it. That is stated, not left blank: it is a different fact from a lens with nothing in it.", then the two sentences; an undetermined manifest (`in_force: null`) is stated as undetermined with its stated reason. The two sentences close every section, once.

## J2 · REPORT

Two things for other modules, neither a change of theirs I made.

1. **Generated artifact stale.** My change under `bio-plane/src/case-grammar/` (new `edition.mjs`; `index.mjs`, `formats.mjs`, `blocks.mjs`) stales the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`). Regenerated nothing (manifest, "Generated artifacts").
2. **For case-authoring's job (R38, and H9's lens).** Write the blocks and sections only with this module's builders: `whatChangedBlockLines`, `whatChangedSectionLines`, `lensBlockLines`, `lensSectionLines` (readings J1 (1)–(6), confirmed K1074). Place `## What Changed in This Edition, and Why` at the top of the body (DEC-101), and neither new section inside the acknowledgement list's prose run (from `**Who else read this statement.**` to `## What Was Searched`), which `publication` R21 re-authors whole. Hand each lens statement its full citation list with `{citation, printed}` (or a string for a printed one): `withheld` is computed from it. The lens section prints the acknowledgement itself, so case-authoring decides whether the existing `## Bias Acknowledgement` section stays beside it.

## J3 · COMPLETE

**Entries applied** (`build/plan/current.md` T22 L8: H6 (1), H9; START B1; readings J1 confirmed by B2, K1074).
- **R8 met.** `what_changed:` `{statement_sha, began_as, draft, adopted_as_drafted}` and `## What Changed in This Edition, and Why`; `statement_sha` is the SHA-256 of the section's text. Exported: `whatChangedOf(fm, body)`, `whatChangedBlockLines({statement, began_as, draft, adopted_as_drafted})`, `whatChangedSectionLines(statement)`, `whatChangedText(statement)`, `WHAT_CHANGED_HEAD`, `WHAT_CHANGED_ORIGINS`. All three origins' values read back; `/4` and older answer null.
- **R9 met.** `lens_statements:` `{bundle, id, kind, subject, text, justification, withheld}` and `lens_citations:` `{statement, citation}`; `## The Lens This Case Was Produced Under`. Exported: `lensOf(fm)`, `lensBlockLines(statements)`, `lensSectionLines({acknowledgement, statements, inForce, stated})`, `lensStatementKey(bundle, id)`, `LENS_HEAD`, `LENS_STATEMENT_FIELDS`, `LENS_CITATION_FIELDS`, `LENS_KIND_WORDS`, `LENS_CLOSING_SENTENCES` (R9's two sentences, verbatim), `LENS_NONE_SENTENCE`, `LENS_UNDETERMINED_SENTENCE`. Also `editionStatementsOf(text)`, both read from a document's bytes.
- **R1 met.** `/5` states both, with no `/6`: the signed release's plane (`release/bio-plane.bundled.mjs`) names `/1`–`/3` only, so no `/5` document is stored; the three format predicates are unchanged.
- **R3 kept.** R8's block has a `  statement_sha: ` line of its own: the acknowledgements locator skips lines inside the `what_changed:` run, so a document without it locates exactly as before (tested both ways).
- **Notes re-worded** (N469, N471, N480): `formats.mjs` no longer names the deleted catalogue's copy as live; `index.mjs` says publication's re-export happened; `blocks.mjs` names the deleted store's `#fmSafe` only as provenance.
- Code in `bio-plane/src/case-grammar/edition.mjs` (new) and re-exported from `index.mjs`; publication needs no re-export.

**Deferred:** none.

**Found in other modules:** the plane bundle is stale (REPORT J2), and case-authoring's placement notes (J2). No other flaw found.

**Tests and checks** (on the job branch with `tranche/T22` merged, aad0d7342d):
- `bio-plane/test/m/case-grammar/`: tests 27, pass 27, fail 0 (new `edition.test.mjs`: R8 and R9 round-trips with negative controls, the withheld citation counted and never named, R1's `/5` with every block, R3 both ways; R7's test covers the new outward text).
- Users: publication 94/0, public-read 71/0, project-stage 23/0, ratification 181/0, review 33/0; case-authoring 79 pass, 1 fail (`members.test.mjs`:98/129, accepted, K1065); control-plane 100 pass, 2 fail (`doorbell.test.mjs`:310, `catalogue-end.test.mjs`:15, accepted, K1037).
- Whole `bio-plane/test/m`: tests 4886, pass 4855, fail 12, every one accepted by name: actions `t18.test.mjs`:299; case-authoring `members.test.mjs`:98; control-plane `catalogue-end.test.mjs`:15, `doorbell.test.mjs`:310; membership `module-order.test.mjs`:12 and `t9-notice-sight-bounds.test.mjs`:185 and promotion `registry.test.mjs`:58 (accepted red 4, R39/R45/R46/R79/R83); queue-producers `proposals.test.mjs`:78, :124, :153, :167 (its accepted red); scheduler `plane.test.mjs`:85. `registry.test.mjs`:58 and the four `proposals` tests fail identically on bare `tranche/T22` (ff054fb6d7): no new red.
- `format`: 86 modules, 85 requirements files; 0 failures. `architecture case-grammar`: 11 product files, 24 relative imports; 0 failures. `coverage case-grammar`: 9 of 9 live ids named by a test; 0 failures (R8 R9 leave the accepted list). `ownership case-grammar tranche/T22`: 7 files; 0 failures.

The requirements' `*(not yet met: T22)*` marks on R1, R8 and R9 are BOB's to strike at the merge.

Size (session_01HZ5CHsHwbUhmPLbDLKrwjg): test runs 9, module lines 693
