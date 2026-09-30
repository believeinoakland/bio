# content (T18)

**Status** · session_01YSoHhK3iM2dE9hknYcY6ai · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R1's term paragraph (content.md, Provides) says "pages, slides, shapes, paragraphs and tables are counted from 0 in the captured file". The grammar (the catalogue's `checkContentExtent`, content's face) counts a `slide-shape` slide from 1 (`slide: 0` is C-45.3, "a 1-based integer"), as IC-1 does (ref "slide 7" = slide 7) and as extraction R13 keys slides "by slide number". Changing it would move every slide row's content id (R3) and break the match against extraction's units (R31).

Best reading, which I am building on (no code change): slides are 1-based and the sentence is a wording defect; proposed wording: "pages, shapes, paragraphs and tables are counted from 0 in the captured file, slides from 1 (the producer's numbering, IC-1)". My tests assert 1-based slides.

## J2 · QUESTION

Two readings I have built on (J1 still open, separate).

1. **R8's reach.** R8 says an extent admitted without its bound held answers `undetermined: {level, why}`. The module stated it only for three arms (an image `{part}`, an image `{page}`, a pdf-page rect's page box); a pdf-page with no page set, a cell with no sheet list or no grid (an .ods sheet), a paragraph with no count, a slide or shape with no count, a table with none, and an envelope item minted with no `undetermined`, and a module test pinned "no rect: nothing unheld". Best reading, now built (`extent.mjs` `containerBoundUndetermined`): R8 is general; every bound R7 skips is stated, one level per address (`page_set`, `sheet_list`, `sheet_grid`, `paragraph_count`, `slide_list`, `shape_count`, `table_list`, `table_grid`, `envelope_items`), first unheld bound first. `test/m` whole: no other module's test moved (3493 tests, the one known control-plane R36 failure). If you want the narrow reading, say so and I revert.
2. **C-45.2 on an image part cited as text.** The grammar refuses `{kind: "image", part, cited_as: "text"}` C-45.2 even over a capture that has a chain ("nothing in this record has read text off an embedded image"). R7 words C-45.2 as "a text extent other than document over a capture with no chain". Best reading: correct behaviour (the capture's chain covers its text parts, never its media, so the part has no chain), and R7's C-45.2 clause could add "or an embedded image part cited as text". No code change; tests assert only the chainless case.

## J3 · COMPLETE

**Entries applied** (layer 4, content; `current.md` content bullet, B1, B2/K663):
- **✱ C-52.** `TRANSCRIBE_CHECKS` (C-52.1–.9) moved into `src/content/checks.mjs`, rows, codes, `where`s and translations unchanged; the catalogue's copy deleted (83 lines with its header). `store.mjs`' import of it (with `LEAD_CHECKS`, also unread there) removed whole (§12.2, 4 lines, no line added). No other product importer. R38 met for C-52.
- **C-80.3 copied** into `src/content/checks.mjs` (`VERSION_NOTICE_CHECKS`), exported from `src/content/index.mjs` for reevaluation's layer-7 re-point; the catalogue's copy stays until T19's layer 1 (a module test pins the two identical). R38 met for C-80.3. C-45 stays (K585 (3)).
- **Converts** (content's shares, requirement-named, at the interface): `converts-extent.test.mjs` (content-extent-arms, content-extent, capture-container-extent, fw19-extent-arms; 19 tests), `converts-reads.test.mjs` (content-reads, transcribe, textchain; 9), `converts-notice.test.mjs` (versiongrade, versionnotice's passage arm; 10), `converts-images.test.mjs` (cpdf18-pdf-images, content-chain-kind; 8). Other owners' shares (inquiry's C-2.8 relay and legs, connections' axis, control-plane's stamping and wire, extraction/pdf-reader/pdf-pixels arms, query-language's `rows=content`, reevaluation's question arm) not carried, each listed by the convert. Old suites not deleted (K619); `test/transcribe.test.mjs` imports the catalogue's `TRANSCRIBE_CHECKS` and stays unrun (K653).
- **Own flaw fixed (J2, open):** R8 now states every bound R7 skips (`containerBoundUndetermined`: `page_set`, `sheet_list`, `sheet_grid`, `paragraph_count`, `slide_list`, `shape_count`, `table_list`, `table_grid`, `envelope_items`), not only the three image/page-box arms; R8's test widened. Revert on your word if you rule the narrow reading.
- J1 answered (K663): slides 1-based; tranche merged.

**Rows `awaiting stamp` (T19):** C-52.1–.9 moved to `src/content/checks.mjs` (rows and `where`s unchanged); C-80.3 copied (unchanged).

**Deferred:** nothing of this module.

**Found for other modules / BOB:**
1. Stale generated artifacts (§14): the plane bundle (`bio-checks.mjs`, `store.mjs`, `src/content/` changed) and the agent-worker bundle (it takes `bio-checks.mjs`). I rebuilt neither.
2. The DEC-49 guard (release only) harvests `*_CHECKS` from the catalogue: C-52 now reads unregistered there (as C-85, C-75, C-35); control-plane's `CHECK_FAMILIES` should list `src/content/checks.mjs` (its L11 entry already names content's table).
3. reevaluation (L7): `VERSION_NOTICE_CHECKS` is now exported by content for its tests' re-point (`checks.test.mjs`, `notice.test.mjs`).
4. J2's second point: R7's C-45.2 clause could name an embedded image part cited as text (behaviour unchanged).

**Tests and checks:**
- `node --test test/m/content/`: tests 103, pass 103, fail 0.
- `node --test "test/m/**/*.test.mjs"` whole: tests 3493, pass 3470, fail 1, todo 22; the one failure is control-plane's R36 (`doorbell.test.mjs`, capture R65, CAPTURE #10 J3), not from this job.
- `format`: 82 modules, 77 requirements files; 0 failures.
- `architecture content`: 19 product files, 56 relative imports; 0 failures.
- `coverage content`: 47 of 47 live requirement ids named by a test; 0 failures.
- `ownership content tranche/T18`: 13 files changed; legacy-store 0 added, 4 removed; legacy-checks 0 added, 83 removed; 0 failures.

Size (session_01YSoHhK3iM2dE9hknYcY6ai): test runs 10, module lines 2423

## J4 · COMPLETE

B3 (K665) applied: tranche merged (R7's C-45.2 clause); one requirement-named test at the interface, `grammar.test.mjs` "R7 (K665)": `{kind: "image", part, cited_as: "text"}` over a capture WITH a chain is C-45.2 (check, translation, detail), the same part as bytes (stated or by default, R4) admitted. R8's widening kept. Everything else as J3.

**Tests and checks (rerun):**
- `node --test test/m/content/`: tests 104, pass 104, fail 0.
- `format`: 82 modules, 77 requirements files; 0 failures.
- `architecture content`: 19 product files, 56 relative imports; 0 failures.
- `coverage content`: 47 of 47 live requirement ids named by a test; 0 failures.
- `ownership content tranche/T18`: 13 files changed; legacy-store 0 added, 4 removed; legacy-checks 0 added, 83 removed; 0 failures.

Size (session_01YSoHhK3iM2dE9hknYcY6ai): test runs 11, module lines 2423
