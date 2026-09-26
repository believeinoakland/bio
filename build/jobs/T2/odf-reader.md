# T2 · odf-reader — job record

**Session** · `session_0191Ek5BuDhcVCoPJoHo62Ge` (ODF-READER #1)

**Status** · COMPLETE, 2026-09-26. Job for module `odf-reader`, tranche T2, branch `job/T2/odf-reader`. Entries T2-8, D-612 and D-346 are applied. Q1 was answered by K34, which matches the reading built here; `origin/tranche/T2` @ 332aff0c02 is merged and steps 5–7 were re-run on it (45/45; all four checks 0 failures). Still open: the Q1 addendum (R10's empty lists, below). For BOB: the "not yet met" notes on R29 and R36, and the Status line saying the same, can now be cleared.

## Questions to BOB

### Q1 · 2026-09-26 · R3, R28, R30 once R29 is met; one ooxml symbol

Once R29 is met (D-346), R3, R28 and R30 as written contradict it. R3 says `parts().undetermined` "already carries the two markers of R28 on every successful read". R28 says both `outside_content_xml_not_read` markers are stated "unconditionally", and `notes` "always" says no `intra` link is emitted. R30 says "R28's manifest marker stays true and stays stated". R29 "narrows" R28 but does not say what is left of it.

**My best reading, which I am building:**
- **meta.xml.** When it is present and parses, there is one `core-properties` item and no meta marker. When it is absent: `{part:"meta.xml", why:"part_absent", detail}`. When it is present but cannot be read or parsed: `{part:"meta.xml", why:<readPart's why | "core_properties_unparseable">}`.
- **The manifest.** When it is readable, every listed member except the package's own parts, `Pictures/` images (those are R30's `images`) and `font-face-uri`-named fonts becomes an `intra` link keyed by sha256. A listed member that is absent, encrypted or unreadable becomes an `undetermined` link naming why. When it cannot be read or parsed: `{part:"META-INF/manifest.xml", why}` in the envelope, plus a note that `intra` was not looked for. When it lists no embedded member: a note that `intra` is empty because the manifest lists none.
- **R3.** `undetermined` carries these statements, not the two fixed markers.
- **R28 and R30.** R28 keeps only this "state every part not read" rule, and R30 keeps its `images` behaviour without the sentence about the marker.

Please reword R3, R28 and R30 to match, or correct me. The tests I am writing (R28 and R29 together) check the reading above.

**Also, a Uses gap.** To exclude `Pictures/` images from `intra` by the same extension table `withContainerImages` uses, I import `IMAGE_MIME_BY_EXT` from `ooxml`. `ooxml.mjs` exports it, but ooxml's Provides does not list it, and my Uses does not either. Please add it to both (wording only), or tell me to do this differently.

### Q1 addendum · R10 as well

R10 says that over the guard, or with no readable body, `links` is `[]` and `evidentiary.items` is `[]`. That was true before R29. Now meta.xml's `core-properties` item and the manifest's `intra` links come from parts other than content.xml, so they are still emitted over the guard. My reading, which I built and tested: R10's empty lists are the body-derived links and items only. The tests check it this way: R10 on packages with no meta.xml and no embedded member, and R29 on meta.xml read over the guard. Please add R10 to the rewording.

## Entries applied

- **T2-8** · Requirement-named tests for every live id. The suite is in `bio-plane/test/m/odf-reader/`: `entries`, `odt`, `ods`, `odp`, `envelope` and `digest`, 45 tests in all, naming R1–R43. Each test checks at the module's interface, on packages built byte by byte by `pkg.mjs` (a ZIP writer using `node:zlib`, independent of the module; every central-directory field can be overridden). Negative controls, each run by undoing one fix: the D-612 font rule, the meta.xml read, detect's local-header order, the strict UTF-8 decode, the font exclusion from `intra`, the `draw:a` wrapper, and the character-reference guard. Each made its named test fail.
- **D-612** · For `odfEvidentiaryDigest`, an `href` on an element whose local name is `font-face-uri` is not a referenced member (R36). `Pictures/` and `Object N/` references still refuse (R35). This is the snapshot's `f2dcbc6c` code, kept as it was.
- **D-346** · meta.xml is read into one `core-properties` item, mapped by meaning: `meta:initial-creator` becomes `creator`, and ODF's `dc:creator` becomes `lastModifiedBy`. META-INF/manifest.xml is walked for sha256 `intra` links. Both come from the snapshot's `96eeb2d5`, with three changes of mine:
  - The embedded members are hashed under COFF-6's bound. Over it, none is inflated, and each becomes an `undetermined` link naming why.
  - A member the manifest lists twice is linked once.
  - `notes` now explain an empty `intra` partition: either the manifest could not be read (so embedded members were not looked for), or it lists no embedded member.
  I dropped one snapshot change: it renamed the MEASUREMENTS citation to a filename, which breaks `statepaths`.

## Flaws fixed in the module (step 4)

- **An empty body read as unreadable.** An empty `<office:text>`, `<office:spreadsheet>` or `<office:presentation>` was tested for falsiness. So a document with no paragraphs, sheets or pages came back `paragraphs:null` and `main_part_unreadable`. It now reads as a body with zero units.
- **`.odp` links were lost or counted several times.**
  - A `<draw:a>` wrapping a shape (OpenDocument's clickable shape) was dropped. It is now located to the shape it wraps.
  - A link inside nested groups was emitted once per enclosing group. It is now emitted once, at its own shape.
  - A `<draw:a>` wrapping no shape now belongs to the shape around it, or at page level to the slide (`slideShapeRef(slide)`). It is never dropped.
- **`.odp` shape text.** A custom shape's or rectangle's own paragraphs were dropped, because only `<draw:text-box>` paragraphs were read. They are now the shape's own text; a group's text is still never counted twice.
- **detect** claimed `certain` when `mimetype` headed the central directory but another member lay earlier in the file. It now checks the local-header order the way `discriminate` does, so detect and parts no longer disagree (R1).
- **`.ods` digest.** The `.ods` content.xml was decoded lossily before the reference scan, and non-UTF-8 bytes were digested. Every flavour is now refused on invalid UTF-8 (R37).
- **Never throws (R38).**
  - A character reference outside Unicode (`&#99999999;`) made `fromCodePoint` throw. It is now kept as written.
  - A Symbol, an array of large numbers or an array-like argument made `parts` throw, and an `ArrayBuffer` passed to `detect` threw.
  - Every service now accepts any byte view and answers anything else as no bytes. A final guard turns any unexpected exception into a stated `reader_failed:<name>`.
- **R3.** `parts()` failures now always carry `part` and `flavourDeclared`. `flavourDeclared` names the other OpenDocument flavour on `not_odt:ods`.
- **Insertion text** is found by one token walk over the body, in either quote style (a single-quoted `text:change-id` was missed). Before, the body was re-stripped once per change. An annotation inside an inserted region is no longer part of the insertion's text.
- **Annotations.** Each annotation scanned the whole rest of the body, which made a comment-heavy document quadratic. The scan now stops at the first match.

## Deferred

- **Repeat amplification (needs a requirement).** `table:number-rows-repeated`/`number-columns-repeated` on a cell carrying content, and `text:c` on `<text:s>`, are expanded as stated (R16–R19, R11). Hostile bytes can therefore ask for billions of rows or spaces inside the 20 MiB bound. The result is a hang or a `reader_failed` refusal, not a stated `undetermined` naming the bound. Fixing it needs a new requirement, such as "an expansion over N is stated `undetermined`", with a bound that has been measured. That is BOB's to rule, so I invented no bound.

## Found in other modules

- **legacy-tests.** `bio-plane/test/formats-odf.test.mjs` asserts the D-346 defect: the two `outside_content_xml_not_read` markers, no `core-properties`, and the "no intra" note. It now gives `129 pass, 13 fail`; all 13 failures are those assertions. The snapshot's version of that file, at `96eeb2d5`, gives `171 pass, 0 fail` against this module. `bio-plane/test/nc-coff11.mjs` runs `formats-odf` as its baseline, so it too reads "NOT AS DECLARED" for the same reason. It is green on `tranche/T2`. Please route: take the snapshot's `formats-odf.test.mjs`, or retire those assertions now that this module's own suite covers R28 and R29.
- **ooxml, requirements only.** `IMAGE_MIME_BY_EXT` is exported and used here, but ooxml's Provides does not list it (Q1).
- **No generated artifact is made stale.** None of the four bundles lists `odf.mjs` among its inputs (`build/manifest.md`).

## Tests and checks run (on `job/T2/odf-reader`, tranche/T2 @ 79e6ccd829 merged; the suite and the four checks re-run after merging @ 332aff0c02 with K34, with the same results)

- `node --test bio-plane/test/m/odf-reader/`: `pass 45, fail 0`, over 14 runs in the job. The first runs found the empty-body bug, the dropped `draw:a` link and the nested double count; each is fixed.
- Layer tests: none named in `build/manifest.md`.
- Tests of the callers of this module (`format-registry`, `legacy-index`, `legacy-tests`):
  - `formats: 36 pass, 0 fail`
  - `d351-odf-evidentiary: 41 pass, 0 fail`
  - `d473-odt-evidentiary: 28 pass, 0 fail`
  - `fw19-extent-arms 36 pass, 0 fail`
  - `capture-container-extent 57 pass, 0 fail`
  - `drive: 160 pass, 0 fail`
  - `drive-convert 43 pass, 0 fail`
  - `d525-driveshells 42 passed, 0 failed`
  - `monitor-assess 91 passed, 0 failed`
  - `statepaths 29 pass, 0 fail`
  - `reading-dialect 20 pass, 0 fail`
  - `formats-docx 82/0`, `formats-xlsx 88/0`, `formats-pptx 118/0`, `formats-csv 75/0`
  - `nc-rec218` 0 findings
  - `formats-odf: 129 pass, 13 fail` and `nc-coff11` NOT AS DECLARED, both explained above.
- `node checks/format.mjs`: `format: 61 modules, 19 requirements files; 0 failures`
- `node checks/architecture.mjs … odf-reader`: `architecture: 8 product files, 31 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … odf-reader`: `coverage: 1 modules, 43 of 43 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … odf-reader tranche/T2`: `ownership: 9 files changed by odf-reader between tranche/T2 and HEAD; 0 failures`

## Metrics

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_0191Ek5BuDhcVCoPJoHo62Ge,job,odf-reader,13768743,227123,146,86612,73,14,2003
```
