# office-readers (T20)

**Status** · session_01T9LFGqSu4UfTE1DhyznDUz · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings on N439; I am building on both meanwhile, and nothing waits on the answer.

(1) R29 names `pptxRenumbering`'s argument only `deckFiles`. Best reading: it takes `pptxEntry.parts(bytes)`'s own output (the deck's files as read: `order`, `slideParts`, `slideXml`), so it stays synchronous like R28, numbers slides exactly as the reading does (declared deck order, `slide: null` for a slide the order does not reach, never the filename), and extraction calls it as it calls R28 today (`parts && parts.ok ? pptxRenumbering(parts) : null`, `extraction/index.mjs`:1068). One `{slide, shapes:[{old, new}]}` per slide part the reading walked, in deck order; a slide whose part could not be read, or a deck over the size guard, has no shapes to move and is not listed; anything other than an `ok` parts result gives `null` (R21). If you meant raw bytes (an async map) or a `{slide → xml}` table, say CHANGE.

(2) `walkSlide` also reads notesSlides, so the one-branch rule applies to speaker notes too: a notes part's `mc:AlternateContent` is read once, and `speakerNotes[].text` and the `speaker-notes` envelope item lose the duplicate. No stored reference moves for it (notes are cited at slide grain, no shape). Best reading: in scope (the same flaw, the same walk). Say CHANGE if notes should stay as they are.
