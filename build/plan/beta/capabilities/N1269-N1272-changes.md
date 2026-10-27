# N1269 and N1272: altered lines (moved from the requirements file for size)

## Changed for K5453

Altered lines (ids as drafted here; acquisition R134 is now R135):
- Point 2, one limit per kind: **R135** (was R134: rewritten and renumbered), **R72**, **R73** (test only), and the section 5 introduction, section 8 FILES (1), section 9 item 2.
- Point 3, DEC-77's acceptance shape: **R28** (rewritten), **R117** (rewritten), **R29** (adds `proposalRates` and its test), **R27** (stable proposal `id`, labelled machine work), **R114** (acceptance basis on the row), **R143** (basis `unaided`), **R144** (a changed part is the member's own choice), the terms in section 0, section 9 item 5.
- Point 1, C21 (now final, K5496): **R64** (rewritten), **R65**, **R27**, **R114**, **R115**, **R116**, **R141**, **R143**, the terms in section 0, section 7, section 8 FILES (2), section 9 item 1.
- Section 9 item 4 (collisions), the header status and the draft-ids note. Q2 lines (R31, R141, R142, R146, R109) were unchanged then and are final under K5495.

## Aligned to DEC-476 (the design stream's drawing of K5495, K5496)

- **R141** is the Document page's "Interpreted" fact row (`screen.document.interp.label/.tip/.for/.other/.none`); the draft's one-line "Read in full and searchable..." sentence, `.line` and `.being_read` are gone (reading is said by "Its text"). **R142**: act `interpretmark` (`.offer`); `.others` is now `.other`. **R143**: chooser words `.chooser.will` (reworded) and `.chooser.whole`; only the whole document and page ranges are drawn. **R146**: key `.recorded` (not drawn). **R147**: solid bar for `for_this`, dashed muted bar for `for_others`, legend `.legend.this`; the draft's `.mark` and `.mark.alt` keys are gone. **R109** (screens-daily; not screens-inquiry R109): key `screen.finder.notinterp`, from `interpretedFor` (R30); the positive `for_this` mark is dropped. R141 also: `screen.document.cells_held`, `.sheet.rows` and `.sheet.none` are no longer drawn (the sheet fold keeps "Every line of this sheet is read, and can be searched and cited.").

## Aligned to DEC-478 (B563, C27)

- **R141**: the row lists each visible investigation under `.for` ("For {investigation}:"), one `.group` line per member and date ("{parts}, by {member}, {date}") from `interpretationOf` parts grouped by `by` and day, then `.notyet` from `not_interpreted` or `.all` ("Every part is interpreted.") when it is empty; `.none` before any part; `.other` is DROPPED. **R142**: refers to the "For" lines, not `.other`. **R143**: parts named by `part.*` keys (page, pages, rows of the sheet, paragraphs, slides, the section); sheet, paragraph and slide ranges are now drawn (chooser, row, spreadsheet fold). **R146**: `.recorded` is drawn under the text's legend. **R147**: unchanged but cites DEC-478. Section 8 UX needs: the four needs sent as B563 are drawn; the two formerly undrawn rows (`.none`, `.recorded`) are drawn.

## Recorded details (moved from the requirements file, section 7)

BOB's details recorded here under P17, reported done, not put to Bob: R118 (withdrawing a mark, nothing erased); R26's whole-document mark as the member's explicit act; R28's refused proposals remembered per project; where the interpreted content and the per-investigation record live (R114-R119 against R26-R32).

## Changed for K5530

- **R119** bracketed on Bob's C32 (the limit); section 6's gold-set marker bracketed on C33 (K5530). The line texts stand.
