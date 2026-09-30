# content (T18)

**Status** · session_01YSoHhK3iM2dE9hknYcY6ai · depth 2 · RUNNING until 2026-09-30T21:53:34Z (four convert workers writing test/m/content/converts-*.test.mjs) · handled B0

## J1 · QUESTION

R1's term paragraph (content.md, Provides) says "pages, slides, shapes, paragraphs and tables are counted from 0 in the captured file". The grammar (the catalogue's `checkContentExtent`, content's face) counts a `slide-shape` slide from 1 (`slide: 0` is C-45.3, "a 1-based integer"), as IC-1 does (ref "slide 7" = slide 7) and as extraction R13 keys slides "by slide number". Changing it would move every slide row's content id (R3) and break the match against extraction's units (R31).

Best reading, which I am building on (no code change): slides are 1-based and the sentence is a wording defect; proposed wording: "pages, shapes, paragraphs and tables are counted from 0 in the captured file, slides from 1 (the producer's numbering, IC-1)". My tests assert 1-based slides.
