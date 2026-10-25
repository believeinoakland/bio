# VERIFY #1 results, tranche T51 (K5009)

Run on `origin/tranche/T51` at `ebb82762a1` (branch `prep/verify-1`). Command: `node --max-old-space-size=6144 --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>`. No product code or test changed.

## Summary table
| Item | Result |
|---|---|
| A. screens-intake, `t51-seam-g126h` test 1 | **RED** (suite 371/372): a 2 MiB CSV through the no-cursor door came back with `text_units`, an inline read was made. Still MISSING row 5 NOT closed green. Tests 2 and 3 of the file green. |
| B. tasks R25 | **RED** (133/134): `seam-r25.test.mjs:64`, the three-part capture's event is kept with "not yet filed in any record" |
| B. queue R55 | **RED** (230/231): `t50.test.mjs:126`, stale `OWED` list: `fetch-done`, `ingest-done`, `ingest-stopped` now have words rows (`setup-words/rows.mjs:11614-11616`) |
| B. control-plane `t51-round5-seam` E3 | green (8/8, both E3 tests) |
| B. ODS pin | green (21/21). **The file is `extraction/g41.test.mjs`, not odf-reader (it has no `g41.test.mjs`)** |
| B. file-safety `rows.test.mjs` R24 | green (7/7) |
| C. plane `release` R24 | **PRODUCT** (words list): `screen.objective.purpose` and `screen.about-knocker.purpose` rows missing; requirement R24 / DEC-149 |
| C. plane `l77-size` R77 L | **TEST** (stale): child stops after 6 ticks; the reading is now by pieces (`pending.mjs:411-436`, plane R97/R101), 468 of 1,300 pages after 6 ticks |
| D. job 38 pieces | Tip all green (7 runs). On the old source: red as expected for G124a, G128f, G129e, `ISOLATE_STARTED`, null-language words. **G126d and G126b: NOT RED unless the files job 38 created are removed too; G127b NOT RED.** See D. Method flaw in J56 stated in D. |

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

## C. The two reds accepted since K4731 with no job
### C1 plane `release.test.mjs` R24
```
ℹ tests 6
ℹ pass 5
ℹ fail 1
✖ R24 (DEC-149; T34-87, K1784; T51): a title or purpose a surface draws is the screen's own key, `screen.<id>.name` and `screen.<id>.purpose`, ... (release.test.mjs:74)
  AssertionError [ERR_ASSERTION]: screen.objective.purpose is held by the words list   false !== true   at release.test.mjs:78:14
```
The loop stops at the first miss. Running its two checks over the whole registry (`SCREEN_REGISTRY` against `hasWord`) finds exactly two missing keys: **`screen.objective.purpose`** and **`screen.about-knocker.purpose`**. `screen.objective.name` exists (`setup-words/rows.mjs:17549`), but neither `.purpose` row exists.
**Root cause: PRODUCT, module setup-words (words list), with wizard-scripts as the source of the entries.** The registry (`wizard-scripts/screen-registry.mjs:52`, re-taken from `docs/development/ux-substrate/screens/registry.json` at 958d998ccb, commit 782a0c9c4d, FR-46 R45) gives screens `objective` and `about-knocker` a `purpose` string, and R24 (DEC-149, K1784: a title or purpose a surface draws is the screen's own key `screen.<id>.purpose`) requires a words row for each. The test is right and current; the rows are owed (design stream's words, `later-ux`).

### C2 plane `l77-size.test.mjs` R77 L
```
ℹ tests 3
ℹ pass 2
ℹ fail 1
✖ R77 L (gate): the alarm reads a synthetic PDF (21 MB) through the ledger in a child capped at the measured idle plus 88 MB, 5 of 5 (l77-size.test.mjs:19)
  AssertionError: run 1: the ledger holds nothing   (l77-size.test.mjs:26:14)
  actual: [{ attempts: 0, final_why: null, interrupted: 0, kind: 'reading', last_ms: 408, last_why: null }]   expected: []
```
The other two tests (22 MiB `pdf22`, and the 15.9 MB `manyobjects`) pass. I ran the child (`l77-size-child.mjs`, mode `alarm`) by hand with the row's `state`, `cursor` added to its query (not committed): `"state":"partial","cursor":"{\"read_through\":468,\"total\":1300}"`, `ticks: 6`, `found: true, units: 67, words: true`. So the read itself works and stays within the cap; the row is not finished because the 1,300-page file is read in pieces, and 6 ticks reached page 468.
**Root cause: TEST (stale).** `bio-plane/src/plane/pending.mjs:411-436` (job 37's R101/R97 piece-by-ranges): a reading that answers `ok: true, more: true` is re-armed as `state='partial'` with its cursor, "one heavy piece for each tick" (extraction `index.mjs:969, 1008-1088` answers `detail: {read_through, total}`). The child's loop `while (!direct && rows().length && ticks < 6)` (`l77-size-child.mjs:78`) and the test's `left: []` assertion (`l77-size.test.mjs:26`) date from the one-tick alarm read (R77 L; E2 (4), K4544); at about 78 pages a tick the synthetic file needs more than 6 ticks (468 of 1,300 after 6). Governing requirement: plane R97/R101 (pieces by cursor, a moved cursor is progress) amending R77. The 6-tick cap, not the product, makes it red; I did not run it with a larger cap (no test changes in this session).

## D. "Update at K5000" weak reds of job 38's pieces
**Method, and a flaw in J56's.** Worktree of the tip (`/tmp/v1/old`), then `git checkout 74f9b76617^ -- bio-plane/src/control-plane`. That restores the old files but LEAVES the three files job 38 added: `reading-gate.mjs`, `jobs.mjs`, `job-state.mjs`. So J56's method ("old source") is a mix: old `index.mjs` beside the new `reading-gate.mjs`. I ran both: **old-A** = as J56 (new files left), **old-B** = the three files also removed (the true old directory). Per-file counts (pass/fail), tests run by `--test-name-pattern` for the seam sections:

| Test (piece) | tip | old-A (J56's method) | old-B (true old) |
|---|---|---|---|
| `r131-gate` (G124a, G126d) | 13/0 | 12/1 | file does not load: `ERR_MODULE_NOT_FOUND ... reading-gate.mjs imported from r131-gate.test.mjs` (0/1) |
| `r133-r134-follow` (G128f, G129e, G162) | 12/0 | 2/10 | 2/10 (same) |
| `r9-words-no-language` (null language) | 5/0 | 1/4 | 1/4 (same) |
| `r129-isolate-age` (`ISOLATE_STARTED`) | 3/0 | 1/2 | 1/2 (same) |
| seam `§2` (G126b door walk, G126c) | 5/0 | 4/1 | seam file does not load: `ERR_MODULE_NOT_FOUND reading-gate.mjs imported from r9-seam-limits.mjs` (0/1) |
| seam `§5` (G127b/c) | 3/0 | 2/1 | does not load (same import) |
| capture `R108` (G127b) | 2/0 | 2/0 | 2/0 |

**Assertion lines (old; red expected).**
- **G124a** `r131-gate`, old-A: `✖ R132 (G124a): no numeric literal for a ceiling stands in src/control-plane/*.mjs ...` `AssertionError: ceiling constants written as numbers in the module`, actual `['index.mjs:225 READING_DEFER_PDF_BYTES = 2 * 1024 * 1024', 'index.mjs:229 READING_DEFER_TEXT_BYTES = 3 * 1024 * 1024', 'index.mjs:232 READING_INLINE_MAX = 20 * 1024 * 1024', 'index.mjs:235 READING_STATEMENT_MIN = 24 * 1024 * 1024']`. Red, one test. Genuine failing-first for G124a: the literal-detector.
- **G126d** (the container-unpacked gate): in old-A all five `R131 (G126d)` tests PASS (they exercise the new `reading-gate.mjs`, which is present). **So the red J56 credits to G126d is the same one test as G124a's** (the literal check), not a G126d assertion; J56's "credited twice" is confirmed: the one failing test is `R132 (G124a) no numeric literal ...`. In old-B the whole file is red by import only: no assertion line exists for the unpacked-size behaviour on old code, because the old gate was inside `index.mjs` (`tooBigToReadInline`, `index.mjs:733-747`) and no test drives it.
- **G126b NOT RED at the door: confirmed.** old-A seam §2 `COUNTING-DOOR WALK` (`R9 seam §2 (G126a, G126b, G126d)`) PASSES on the old `index.mjs`; the only §2 red is `R9 seam §2 (G126c, G98): where every stub is broken the row cannot be written: the answer does not say reading_pending and carries reading_refused (R130)`. In old-B the seam cannot load, so no door assertion exists either way.
- **G127b**: capture `R108` (`r9-t51.test.mjs:70`) is green on old and new control-plane (2/2 each): it does not touch control-plane, so no red can be shown from this source (NOT RED, a characterization, as the table says). Seam §5 old-A red is `R9 seam §5 (K4833, G127c; R120 R123): the same file pressed by a second member is refused for the WHOLE only: kind: whole and the holder (red until provenance 21 merges)`, which is G127c/G160's, not G127b's.
- **G128f and G129e** `r133-r134-follow`, 2/10 on old (old-A = old-B), among them:
  - `R133 (DOCS A12, G128f): 17 documents promoted together are ALL followed ...` `AssertionError: and each is registered once: the row first, whether or not the read follows` (the 17 digests missing from the actual list);
  - `R133 (DOCS A12, G128f): 30 documents ...` `AssertionError: 30 rows, one for each digest`;
  - `R133 (control): a promotion of 3 documents follows 3 ...` `AssertionError: each registered first   0 !== 3` (`:87`);
  - `R133 (R130) ...` `TypeError: Cannot read properties of undefined (reading 'count')` (`:118`);
  - `R134 (DOCS A11, X20)` (G129e): `AssertionError: Expected values to be strictly deep-equal` actual `{code: 'STORE_DID_NOT_ANSWER', sha256: '...02'}` expected `transient: true` (missing);
  - `R134: the draw of the member's id ...` same shape; `R134 (DOCS A11): op=unpack ... unpack_pending` deep-equal red; `R134 (control) ...` `TypeError ... (reading 'reason')` (`:214`);
  - `R134 (fix round 9, G162; K4980)` `AssertionError: a reading row for each member filed, in the order filed, once, ...` actual `[]`; and the acquire-archive one.
  Passing on old: the two cases that assert nothing new. Tip 12/12.
- **`ISOLATE_STARTED`** `r129-isolate-age`: `✖ R129 isolate age: the first request of an isolate whose global-scope clock read 0 is age 0, never an epoch` `1792809551867 !== 0` (`:18`); `✖ ... a later request is the age since the isolate's first request` `1792809556188 !== 4321` (`:27`). Red, 2 of 3; tip 3/3.
- **Null-language words cache** `r9-words-no-language`, 4 of 5 red on old: `R127 no language (unit): a words answer stating language: null is kept for the year ...` `false !== true` (`:21`); `... the validator answers 304 ...` `200 !== 304` (`:32`); `... any other v ... stays private, no-cache` actual `null` expected `'private, no-cache'` (`:47`); `R127 no language (door) ...` `cache-control` actual `null` expected `'private, max-age=31536000, immutable'` (`:76`). Tip 5/5.

**Summary of D.** Real, assertion-line reds on the old source: G124a (one test), G128f and G129e (the shared `r133-r134-follow`), `ISOLATE_STARTED`, null-language. NOT RED: G126b at the door (seam §2 walk passes on old `index.mjs`), G127b (control-plane holds no part). G126d has no failing assertion of its own: its five tests pass on the half-old tree and the file cannot load on the true old one (red by import only). Besides, in old-A (old `index.mjs`, new `jobs.mjs` present) seam §2's G126c test (`reading_refused`) is red, 4 pass 1 fail; that is a mixed tree, so it is not the clean failing-first Still MISSING row 4 asks for (old-B cannot load the seam).
Worktree `/tmp/v1/old` removed after the runs.
