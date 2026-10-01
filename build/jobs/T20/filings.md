# filings (T20)

**Status** · session_01P1zfsgRjysCm8qxemK8qTf · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R3 under R27, the standards blank. conformance's `out_of_view: true` says only that something was withheld, never which list it left. My reading: when `det.withheld`, neither list-blank is filled as though whole: `findings` AND `standards` both stay `[UNFILLED: …]` with one why, "a finding or standard the determination rests on is not one you may see, so this list would not be whole" (matches /not one you may see/). Filling `standards` with only the citations the reader sees would present a partial list as the determination's whole list (R3: a value is never invented), and naming which list was cut would say more than conformance does. This mirrors your R9 instruction that both the facts and standards sections state `out_of_view: true` when `det.withheld`. The standards arm (:397–403, a standard standards' read refuses here) keeps its own sentence. Built on this reading; nothing waits on the answer.

## J2 · REPORT

Built on the current conformance (pre-L9: placeholders) and on R24's shape alike: `#det` drops any item without an id and reads `out_of_view` or a placeholder as `withheld`, so it needs no change when conformance's L9 job merges; I re-run after your CHANGE.

1. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (+ `.bundle.json`), owner `not_product`: filings' source changed. Not touched.
2. **Readers whose answer changes** (escalation reads `filingsFor` and `availableActions`): `availableActions` no longer lists a `null` id in a determination's `tier3.standards` for a standard conformance withheld, and that determination item states `out_of_view: true` (R27, DEC-36); `filingsFor`'s `basis_changed` causes now carry conformance's flag causes as the reader is answered, and `standard_superseded` drops `by`/`why` for a successor the reader may not see, with `out_of_view: true`. `test/m` whole, run on job/T20/filings @ 1d272f1509: 4617 pass, 0 fail, 20 todo (escalation included). No escalation test changed answer.
