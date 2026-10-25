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
