# filings (T20)

**Status** · session_01P1zfsgRjysCm8qxemK8qTf · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R3 under R27, the standards blank. conformance's `out_of_view: true` says only that something was withheld, never which list it left. My reading: when `det.withheld`, neither list-blank is filled as though whole: `findings` AND `standards` both stay `[UNFILLED: …]` with one why, "a finding or standard the determination rests on is not one you may see, so this list would not be whole" (matches /not one you may see/). Filling `standards` with only the citations the reader sees would present a partial list as the determination's whole list (R3: a value is never invented), and naming which list was cut would say more than conformance does. This mirrors your R9 instruction that both the facts and standards sections state `out_of_view: true` when `det.withheld`. The standards arm (:397–403, a standard standards' read refuses here) keeps its own sentence. Built on this reading; nothing waits on the answer.

## J2 · REPORT

Built on the current conformance (pre-L9: placeholders) and on R24's shape alike: `#det` drops any item without an id and reads `out_of_view` or a placeholder as `withheld`, so it needs no change when conformance's L9 job merges; I re-run after your CHANGE.

1. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (+ `.bundle.json`), owner `not_product`: filings' source changed. Not touched.
2. **Readers whose answer changes** (escalation reads `filingsFor` and `availableActions`): `availableActions` no longer lists a `null` id in a determination's `tier3.standards` for a standard conformance withheld, and that determination item states `out_of_view: true` (R27, DEC-36); `filingsFor`'s `basis_changed` causes now carry conformance's flag causes as the reader is answered, and `standard_superseded` drops `by`/`why` for a successor the reader may not see, with `out_of_view: true`. `test/m` whole, run on job/T20/filings @ 1d272f1509: 4617 pass, 0 fail, 20 todo (escalation included). No escalation test changed answer.

## J3 · COMPLETE

**Entries applied** (B1, T20 L9; K903 (4), DEC-36; K911 for J1): R27. `#det` carries conformance's `out_of_view` as `withheld` and drops any item without an id; R3 leaves both `findings` and `standards` blanks `[UNFILLED: …]` ("a finding or standard the determination rests on is not one you may see, so this list would not be whole") when `det.withheld`, the standards arm keeping its own sentence; R9's `#fact` and the standards map emit no `{… null, withheld}` item, and the facts and standards sections state `out_of_view: true` when `det.withheld` (standards also when a standard's read is refused here); R12 `#basisChanged` reads the flag with the reader's `viewer` (supersession still read as the plane, its successor named only when the reader may read it), and `standard_superseded` drops `by` for a successor the reader may not see, with `out_of_view: true`. Also (own module): `availableActions`'s `tier3.standards` no longer lists a null id, and a determination item states `out_of_view: true` when withheld. Stored versions are not rewritten. prepare.test.mjs:145 kept; no suite deleted.

**Deferred:** none.

**Other modules:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`, owner `not_product`) is stale (J2). Escalation's readers' changes as J2, accepted (B3).

**Tests** (after merging tranche/T20 @ conformance R24, merge 780233ea00): `node --test test/m/filings/`: 48 pass, 0 fail (3 new R27 tests, each shown failing on the old source); `node --test test/m/`: 4644 tests, 4624 pass, 0 fail, 20 todo. No layer tests named in the manifest.

**Checks:** format: 84 modules, 82 requirements files; 0 failures · architecture: 13 product files, 57 relative imports; 0 failures · coverage: 27 of 27 live requirement ids named by a test; 0 failures · ownership: 5 files changed by filings between tranche/T20 and HEAD; 0 failures.

Size (session_01P1zfsgRjysCm8qxemK8qTf): test runs 9, module lines 1893
