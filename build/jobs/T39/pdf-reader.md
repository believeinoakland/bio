# pdf-reader (T39)

**Status** · session_01TmZK6qZWMuPDraW8kWN2cb · depth 2 · COMPLETE · handled B1

## Completion

**Reading set** · read whole (194 KB, under the 300 KB limit): `build/requirements/pdf-reader.md`; the public parts of `subresources` and `test-support`; layer 1's contract and the "No jurisdiction" and helper sections of `build/layers.md`; `bio-plane/src/pdfstructure.mjs`; every file under `bio-plane/test/m/pdf-reader/` and `bio-plane/test/pdfstructure.test.mjs`; my entry T39-2b and the plan's "Rules at the opening"; K2315, K2333, K2334; `build/plan/draft-T39-N806.md` §3's pdf-reader line. No fixture was read (none is changed or relied on).

**Entry applied** · T39-2b (N806; K2333): R37 `PdfDoc.objects()` → `{trailer, objects, unresolved}`.
- `trailer` is the last trailer in file order, a classic `trailer` dict or an `/Type /XRef` stream's own dict, as its resolved dict (`map`). R10's `/Info` read and R37 now choose from one private list (`_trailers()`), so the two cannot disagree about which trailer is last; R10's behaviour is unchanged (its tests pass as before).
- `objects` is every indirect object reachable from the trailer's entries by any chain of references (through dicts, arrays, stream dicts and bare-reference chains), each once, ascending `num`, `value` exactly the object `resolve` returns, objects from an object stream included. `gen` is the generation the object's winning definition states (`N G obj`; 0 inside an object stream), which is what a rewrite writes; the reader now records it (`_gens`).
- `unresolved` is each reference on those chains that `resolve` answers `null` for (missing, in an undecodable object stream, a cycle of bare references, an object whose value is `null`), once, ascending, as `{num, gen}` with the reference's own generation. The walk continues through an unresolvable object's own definition, so both members of a reference cycle are listed.
- Null when no trailer dict can be read; never throws (the walk is iterative, and any internal fault answers null).
- The private field `objects` (the object map) was renamed `_objs`, since the method takes its name; nothing outside the module used it (searched).

**Note for doc-clean (built against this concurrently)** · the shape is exactly R37's. Two details it may rely on: `value` is the parser's own object (the same one `resolve` returns), so it must not be mutated; and `trailer` is the parser's own map, likewise.

**Deferred** · none.

**Found in other modules** · my change stales the generated artifacts built from `pdfstructure.mjs`: `pdf-worker/dist/pdf-worker.bundled.mjs` (and its `.bundle.json`) and the plane bundle; rule 3 (7) regenerates them at the layer's close. Nothing else.

**Tests and checks**
- `node --test bio-plane/test/m/pdf-reader/`: tests 71, pass 71, fail 0 (four new R37 tests in `pdfdoc.test.mjs`).
- `node bio-plane/test/pdfstructure.test.mjs`: pdfstructure: 170 passed, 0 failed.
- Negative controls, each armed alone and restored (verified with `cmp`): `objects()` taking the FIRST trailer fails 2 of the 4 R37 tests; not walking past an unresolvable reference fails the `unresolved` test. Restored: 17 pass, 0 fail.
- Users' tests (a private field was renamed): `pdf-worker/test/` pass 49 fail 0; `bio-plane/test/m/format-registry/` 33/0; `bio-plane/test/m/file-safety/` 52/0; `bio-plane/test/m/reading-pipeline/` 93/0; `doctypes/test/` 45/0; `budget-doctypes/test/` 27/0.
- Layer tests: none named in the manifest.
- `checks/format.mjs`: 138 modules, 137 requirements files; 0 failures.
- `checks/architecture.mjs bio pdf-reader`: 16 product files, 20 relative imports; 0 failures.
- `checks/coverage.mjs bio pdf-reader`: 37 of 37 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio pdf-reader tranche/T39`: 3 files changed by pdf-reader between tranche/T39 and HEAD; 0 failures.

P6: `pdfstructure.mjs` 3,108 → 3,152 lines (+44, under BOB's ~60).

Size (session_01TmZK6qZWMuPDraW8kWN2cb): test runs 6, module lines 3152
