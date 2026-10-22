# corpus-export (T51)

**Status** · session_013RNXx78ApicHuNgHCy5nx7 · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

T51-230 done (corpus-export, layer 8, re-run R8). Commit 03b15db936 on job/T51/corpus-export, after merging tranche/T51 (merge of origin/tranche/T51 @ 6c98dc6386).

Applied: all 13 findings of the words check, each through localize with a fixed id, the English unchanged:
- index.mjs: corpus-export.index.table_not_declared (142); table_rebuilt_by_rule and table_never_travels (145); page_named_by_index (148); manifest_object_listing_records (239); snapshot_filed_under_key (312); promotion_filed_under_key (319); declared_tables_list (349, 353); never_table_no_row (366); canonical_page_of_rows (389); declared_table_carried_or_named (407).
- tables.mjs: corpus-export.tables.stored_tables_not_stated (138).
Judgement: I read the verifier's `expected` strings (a refusal's list, which an importing administrator reads) as member-read, so they are keyed, not listed in a REPORT. If Bob reads them as diagnostics, they move to the unkeyed list.
Deferred: none. Flaws found in other modules: none from this module's code. Observed, not touched: checks/run.mjs reports 2252 failures across other modules (testcopy, inline, handlist, missingkey), none in corpus-export.
No test holds a sentence: the module's tests hold no flagged text, so no test changed. No requirement changed.

Checks:
- node --test bio-plane/test/m/corpus-export/*.test.mjs: tests 25, pass 25, fail 0.
- node checks/format.mjs /home/user/bio: 176 modules, 175 requirements files; 0 failures.
- node checks/architecture.mjs /home/user/bio corpus-export: 12 product files, 35 relative imports; 0 failures.
- node checks/coverage.mjs /home/user/bio corpus-export: 10 of 10 live requirement ids named by a test; 0 failures.
- node checks/words.mjs /home/user/bio corpus-export: 1046 string literals; 0 failures.
- node checks/ownership.mjs /home/user/bio corpus-export tranche/T51 job/T51/corpus-export: 3 files changed by corpus-export; 0 failures.
- node checks/run.mjs /home/user/bio: the words findings for corpus-export are 0; the run's other 2252 failures are in other modules (above).
- node bio-plane/src/setup-words/build.mjs --check: the stale-rows note names the new corpus-export ids (expected: rows.mjs is BOB's to regenerate at the layer close); no refusal naming this module.

Size (session_014TTSTRZBy424fto64QGN3J): test runs 1, module lines 1035

## J2 · COMPLETE

G22 done: a corpus-export rendering past RENDER_MAX is continued by part and states its cut in its own body (fix round 6, K4571, S12). Commits 9acf4dfa92, d46023f0dd on job/T51/corpus-export (tranche/T51 merged first).

**Root cause (1).** `render.mjs` (old :33, 76-80, 139, 357) read at most RENDER_MAX = 5,000 records per source with `LIMIT RENDER_MAX + 1`, set `this.truncated`, and `render()` returned it beside the body; `exportRendering` put it in the API answer (`index.mjs` old :183-187) and never in `rendering`, the file an outside party receives. No cursor existed, so the 5,001st record could not be reached. A second silent cut of the same kind: `personFacts()` read at most 5,000 person facts across all persons and flagged nothing in the body.

**Why the tests missed it (2).** No requirement said a bound must reach the body, and `render.test.mjs` builds worlds of a dozen records. Gap fixed: `render-parts.test.mjs` builds 5,001 real events, persons and money facts (the owners' own acts) and asks every one of the seven formats for part 1 and part 2 through the op arm `exportrender`.

**What changed.**
- `render.mjs`: `RenderSource(deps, viewer, part)`: `#ids` reads `LIMIT RENDER_MAX+1 OFFSET (part-1)*RENDER_MAX`, `more` set when a source holds beyond; `partNote(part, more)` (a `localize` stand-in) and `NOTE_FIELD` (`description` in a Fiscal Data Package, `note` at the top of every other envelope); `render(format, deps, viewer, at, part)` writes the note into the body and answers `{body, more}`. Cross-part references resolve by id: Popolo's membership finds its person/post/organization by `src.entity(id)` and a post's organization / an organization's parent by the new `RenderSource.linesFrom(id, kind)` (the lines owner's `linesOf`), not among the part's own items (else a membership whose person sits in another part would have been dropped, a new silent loss). `personFacts(persons)` reads every fact of the part's persons by person (the 5,000 cap is gone, nothing to say).
- `index.mjs`: `exportRendering({format, viewer, part})` (default 1; not a whole number from 1: `EXPORT_PART_MALFORMED`, nothing rendered or logged); the answer gains `part`, `next` (the following part, null on the last) and keeps `truncated` (true when `next` is set); `corpusExportOps.exportrender` reads `q("part")`; `DECLARED_OPS.exportrender` declared (K4208: accepts `format`, `part`; requires `format`; `viewer` is the door's stamp).
- A part within the bound with no earlier part is whole and carries no note; part 2 and after say they are the last or name the next.

**Failing-first (3).** Seen red before any code (`node --test --test-force-exit test/m/corpus-export/render-parts.test.mjs`, 2 tests): "R10 R14 a rendering of RENDER_MAX + 1 records ... in every format": `AssertionError: ftm-event: the first part's own body states the cut` (actual `undefined`, expected `'string'`: silent); "R10 R14 a rendering within the bound is whole ...": `[true, undefined, undefined, false]` vs `[true, 1, null, false]`. Green after: 2/2, all seven formats (first part holds the first 5,000 of the source, its body says part 1 and names part 2; part 2 holds the 5,001st; the two hold every record once; a Popolo membership of a part-2 person with its post and organization in part 1 appears once, whole).

**Platform check (4).** N. R-OLD: nothing stored (a rendering is computed per ask, one export_log row as before), no repair. R-CLOCK: no timing asserted.

**Tests and checks.**
- `node --test --test-force-exit test/m/corpus-export/*.test.mjs`: tests 35, pass 35, fail 0 (this job adds three: R10 R14 x2, R15; ops.test R6 exportrender updated for `part`).
- Users: impact names 57 modules because `DECLARED_OPS` is a shared table; run the modules that read the changed service: op-grades 149/149 (first run 9 red, `DECLARED_OP_DISAGREES: exportrender description`: my first sentence differed from the hand row's, fixed to the hand row's sentence, then green), op-declarations 247/247, affordances + test-support 338/338, plane `notices.test.mjs` 6/6.
- `node /home/user/civicos-process/checks/run.mjs /home/user/bio`: format 0, architecture 0, coverage 6623 of 6623 live ids named, channels 0, words 0 failures; words count unchanged against HEAD~1 (18421 words, dev 268, unkeyed 1982; inline/plain/testcopy/missingkey/handlist/marker 0).
- `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio corpus-export tranche/T51 job/T51/corpus-export`: 6 files changed by corpus-export; 0 failures.

**Requirement lines I propose (BOB writes `build/requirements/corpus-export.md`).**
- **R14** (fix round 6 G22; K4571) **A rendering past its bound is continued by part and says so in its own body.** `exportRendering({format, viewer, part})` (`op=exportrender`, key `part`) reads at most RENDER_MAX (5,000) records of each source in a part: part n (1-based, default 1) holds that source's records 5,000(n-1)+1 to 5,000n in id order. The answer carries `part`, `next` (the following part; null on the last) and `truncated` (true when `next` is set). A part that is not the whole rendering (any part after the first, or a first part with `next`) states it in the body an outside party receives, naming the part and the next, in its standard's own field: `description` for a Fiscal Data Package, a top-level `note` for every other envelope; a rendering that fits in one part carries no note. An item that refers to a record held in another part refers to it by id and keeps every field derived from it; a record an item names may also be rendered in the parts that name it (one id, one entity). Person facts are read whole for the persons of the part. A `part` that is not a whole number from 1 is refused `EXPORT_PART_MALFORMED`, rendering and logging nothing. Test: 5,001 records of a source, each format: part 1 states it is part 1 and names part 2; part 2 holds the 5,001st; a membership across parts keeps its post and organization.
- **R15** (T51; K4168, K4208; op-declarations R80, R81; op-grades R49, R50; test-support R15) The module declares `exportrender` in `DECLARED_OPS`: `{classes: ["admin","member"], machineClasses: [], mutating: true, weight: "substrate", description (the hand row's sentence), fields: {accepts: ["format","part"], requires: ["format"]}}`. Test: `declaredOpHolds` (`declared-ops.test.mjs`).
- R10: add "A rendering larger than one part is continued by R14" after the first sentence.

**Words owed (stand-ins now; HANDOFF to UX-DESIGN is BOB's, B485).** `corpus-export.render.part_more` ("This is part {part} of this rendering, and it is not all of it: each kind of record is cut at {max} a part. Ask for part {next} to continue."), `corpus-export.render.part_last` ("This is part {part} of this rendering, the last: the records before it are in the earlier parts."), `corpus-export.index.a_part_is_a_whole_number` (the `EXPORT_PART_MALFORMED` detail), `corpus-export.declared.exportrender` (the hand row's sentence, copied word for word).

**Deferred:** none. **Found in another module** (against op-grades' text, not a defect of this job): `src/op-grades/t33.mjs:355` describes `exportrender` as "keyed by (viewer, format)"; R50 makes the owner's declared sentence equal to that hand row, so I copied it, and it is now slightly stale (the key list gains `part`). BOB's call whether op-grades takes the owner's sentence as K4279 did for `export`.

Size (session_013RNXx78ApicHuNgHCy5nx7): test runs 16, module lines 1126
