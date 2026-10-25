# VERIFY #1 results, tranche T51 (K5009)

Run on `origin/tranche/T51` at `ebb82762a1` (branch `prep/verify-1`). Command: `node --max-old-space-size=6144 --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>`. No product code or test changed.

## Summary table
(filled at the end; items below are written as each completes)

## A. screens-intake whole suite (`bio-plane/test/m/screens-intake/`)
```
ℹ tests 372
ℹ pass 371
ℹ fail 1
```
**`t51-seam-g126h` test 1 is RED** (Still MISSING row 5 is not closed green):
```
✖ R61 (G126h, the real plane; red by name until job 38 and job 37 merge) a 2 MiB sheet through the no-cursor door makes no inline read: the first look only, the answer says its reading follows (25752.6ms)
  AssertionError [ERR_ASSERTION]: no inline read: the door gave the first look, no units
      at t51-seam-g126h.test.mjs:77:10   actual: false  expected: true
```
Assertion (`t51-seam-g126h.test.mjs:77`): `!Array.isArray(up.document.text_units) || up.document.text_units.length === 0`. The 2 MiB CSV through the real door came back WITH text units, i.e. an inline read was made. Tests 2 and 3 of the file (owedwork `reading` row; control small CSV) pass.

## B. Named reds
### B1 tasks suite (`bio-plane/test/m/tasks/`) R25
```
ℹ tests 134
ℹ pass 133
ℹ fail 1
```
RED: `R25 (K4488; provenance R72): the three-part capture's authority event, promoted by the real chain, becomes its task at one drain` (`seam-r25.test.mjs:64`, assertion at :70): "the whole digest resolves to its bundle (provenance R72's whole row)": actual `[{attempts: 1, captureSha: 'c038d4a1…8c135a', detail: 'the capture is not yet filed in any record; the event is kept, not dropped'}]`, expected `[]`. The one-part control passes.

### B2 queue suite (`bio-plane/test/m/queue/`, `conclude-project.test.mjs`, `docdates.mjs`) R55
```
ℹ tests 231
ℹ pass 230
ℹ fail 1
```
RED: `R55: every kind a member may mute has the plain name the muted list's sentence reads, queue.kind.<kind>, and a muted row's kind is one of them` (`t50.test.mjs:126`, assertion at :133): `deepStrictEqual(mutable.filter(k => !hasWord('queue.kind.'+k)).sort(), OWED)`: actual lacks `fetch-done`, `ingest-done`, `ingest-stopped` (the test's `OWED` list names them as owed; the actual list is 7 kinds, expected 10). Cause: `bio-plane/src/setup-words/rows.mjs:11614-11616` now carries `queue.kind.ingest-done`, `ingest-stopped`, `fetch-done` (DEC-425, B498 G61), so the test's owed list is stale (it says a row arriving makes the assertion fail until the kind leaves the list).

### B3 control-plane `t51-round5-seam.test.mjs` (E3)
```
ℹ tests 8
ℹ pass 8
ℹ fail 0
```
Green: both E3 tests (`E3 (a 52 MB ... five-part upload)`, `E3 (a 41.5 MB five-part address capture)`).

### B4 the ODS pin
There is NO `g41.test.mjs` in `bio-plane/test/m/odf-reader/` (`find bio-plane/test -name 'g41*'` lists none there). The ODS pin at lines 142-159 (K4863) is in `bio-plane/test/m/extraction/g41.test.mjs` (`R97 (G41; fix round 9, K4863): an ods workbook whose cells pass 1 MiB ...`). Run of that file:
```
ℹ tests 21
ℹ pass 21
ℹ fail 0
```
Green, the ODS pin included.

### B5 file-safety `rows.test.mjs` R24
```
ℹ tests 7
ℹ pass 7
ℹ fail 0
```
Green on this run.
