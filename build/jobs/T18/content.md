# content (T18)

**Status** · session_01YSoHhK3iM2dE9hknYcY6ai · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R1's term paragraph (content.md, Provides) says "pages, slides, shapes, paragraphs and tables are counted from 0 in the captured file". The grammar (the catalogue's `checkContentExtent`, content's face) counts a `slide-shape` slide from 1 (`slide: 0` is C-45.3, "a 1-based integer"), as IC-1 does (ref "slide 7" = slide 7) and as extraction R13 keys slides "by slide number". Changing it would move every slide row's content id (R3) and break the match against extraction's units (R31).

Best reading, which I am building on (no code change): slides are 1-based and the sentence is a wording defect; proposed wording: "pages, shapes, paragraphs and tables are counted from 0 in the captured file, slides from 1 (the producer's numbering, IC-1)". My tests assert 1-based slides.

## J2 · QUESTION

Two readings I have built on (J1 still open, separate).

1. **R8's reach.** R8 says an extent admitted without its bound held answers `undetermined: {level, why}`. The module stated it only for three arms (an image `{part}`, an image `{page}`, a pdf-page rect's page box); a pdf-page with no page set, a cell with no sheet list or no grid (an .ods sheet), a paragraph with no count, a slide or shape with no count, a table with none, and an envelope item minted with no `undetermined`, and a module test pinned "no rect: nothing unheld". Best reading, now built (`extent.mjs` `containerBoundUndetermined`): R8 is general; every bound R7 skips is stated, one level per address (`page_set`, `sheet_list`, `sheet_grid`, `paragraph_count`, `slide_list`, `shape_count`, `table_list`, `table_grid`, `envelope_items`), first unheld bound first. `test/m` whole: no other module's test moved (3493 tests, the one known control-plane R36 failure). If you want the narrow reading, say so and I revert.
2. **C-45.2 on an image part cited as text.** The grammar refuses `{kind: "image", part, cited_as: "text"}` C-45.2 even over a capture that has a chain ("nothing in this record has read text off an embedded image"). R7 words C-45.2 as "a text extent other than document over a capture with no chain". Best reading: correct behaviour (the capture's chain covers its text parts, never its media, so the part has no chain), and R7's C-45.2 clause could add "or an embedded image part cited as text". No code change; tests assert only the chainless case.
