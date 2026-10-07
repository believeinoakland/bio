# office-readers (T35)

**Status** · session_0197hpZKQkhjw4tqoDSVoZF9 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Three readings, carrying on with each; none blocks the build.

1. **R33, `detect(null, contentType)` for a twin's package type: "with `format` the twin's".** Best reading: `format` is the entry's own (`"docx"` for `application/vnd.ms-word.document.macroEnabled.12`), as R1 fixes each entry's `format` and the registry routes by it; the signals name the macro-enabled flavour (e.g. `docm`). The other reading (`format:"docm"`) would name a format no registry entry answers to.

2. **R32, the `vba-project` item when `ooxml.readVbaProject` reads the project but a module's source cannot be read** (ooxml R32: that module `read:false`, listed in its `undetermined`). The item's shape `{kind, part, read, why, project, modules, autoRun, suspicious}` has no place to say so, so `autoRun`/`suspicious` could read as complete while a module went unread (R22). Best reading: build the shape exactly as worded (`read:true`, `why:null`, `modules` every module's name, unread ones included). Proposal, BOB's to word if wanted: add `undetermined` to the item, ooxml's `[{module, why}]` verbatim.

3. **R32, `activex` / `embedded-file` membership.** Best reading, literal: every member whose name is under `<fmt>/activeX/` (its `_rels/*.rels` included) is an `activex` item; likewise every non-`oleObject*` member under `<fmt>/embeddings/` is an `embedded-file`. A `.rels` part there also yields its own `external-target` items.

## J2 · REPORT

Built and pushed on `job/T35/office-readers` (5c7fc5290c), with B2/K1916 applied: R32's `active` (one builder, `docx.mjs` `activeContent`, the item's `undetermined`, `_rels/` parts named only by their targets), R33's `variant` and twin content types, and R12 through ooxml's cap. Module 3,729 lines (P6 fine).

**Waiting on ooxml (T35-8).** 5 of my 99 tests need ooxml's T35 services, which are not yet pushed (`readVbaProject` and its tables, `discriminate`'s `variant`, `readPart`'s `MEMBER_MAX`/`ARCHIVE_TOTAL_MAX`). Against a scratch stub of the missing export, the other 94 pass and the 5 fail only where ooxml's pieces are missing. I'll re-run in full against ooxml's code as soon as it is on `tranche/T35` (or pushed on its job branch), then post COMPLETE. Please ring me when ooxml merges.

**A finding on R12's wording (no change to build).** Since `MEMBER_MAX` = `ARCHIVE_TOTAL_MAX` (256 MiB, ooxml R30), a part declared over `MEMBER_MAX` also puts the file's declared total over `ARCHIVE_TOTAL_MAX`. So `discriminate`'s first read (`[Content_Types].xml`) already refuses with `ARCHIVE_TOTAL_MAX`, and every one of these entries answers `parts()` `{ok:false, why:"content_types_unreadable:ARCHIVE_TOTAL_MAX"}`. The per-part statements R12 lists (an `undetermined` link, `images:null`, an `active` item `read:false` naming the limit) cannot occur with today's figures. The test pins what does happen: the whole read is refused, naming the limit, before any inflation. If BOB wants per-part refusals reachable, ARCHIVE_TOTAL_MAX would have to exceed MEMBER_MAX (ooxml's figures, BOB's call); nothing in office-readers would change.

## J3 · COMPLETE

**Completion record (T35-9).** Branch `job/T35/office-readers` at the commit after this entry's parent, tranche/T35 merged with ooxml (K1927).

**Entries applied.** T35-9: R32 `active` on docx/pptx/xlsx `structure()` and `text()` from one builder (`docx.mjs` `activeContent`): vba-project (through `ooxml.readVbaProject`, with K1916's `undetermined`), activex, ole-object, embedded-file, external-target (non-hyperlink types), xl4-macrosheet (xlsx), unread (a `.rels` part walkRels could not read); a part under `_rels/` only by its targets (K1916); csv `active: []`; carried over the text guard. R33: `variant` on the three OOXML entries' answers (null for a plain file, absent for csv); the nine twin package types answer `detect(null, …)` with the entry's own `format` (K1916 (1)). R12 (F18): every part read goes through ooxml's cap; a refused limit is stated by name.

**Own-module fix made.** `formats-xlsx.mjs` `parts()` answered an undetermined discrimination as `not_xlsx:undetermined`, dropping `discriminate`'s reason (docx and pptx already carried it); it now carries the reason, so an `ARCHIVE_TOTAL_MAX` refusal is named for xlsx too. Nothing outside office-readers reads that string (grep).

**Deferred.** None.

**Found in another module.** ooxml (reported in J2): with `MEMBER_MAX` = `ARCHIVE_TOTAL_MAX` (256 MiB), a part over `MEMBER_MAX` puts the file's total over `ARCHIVE_TOTAL_MAX`, so `discriminate` refuses the file at `[Content_Types].xml` (`content_types_unreadable:ARCHIVE_TOTAL_MAX`). R12's per-part statements are unreachable with today's figures, and nothing in office-readers would change if they became reachable. No generated artifact made stale (office-readers feeds no bundle in the manifest's table).

**Tests and checks.**
- `node --test bio-plane/test/m/office-readers/`: tests 99, pass 99, fail 0 (new: `active.test.mjs`, R32/R33/R12; the VBA fixture `vba-sample.bin` with its olevba 0.60.2 report `vba-sample.olevba.json` beside it).
- Users of office-readers: odf-reader pass 69 fail 0; format-registry pass 27 fail 0; budget-doctypes pass 27 fail 0; extraction pass 115 fail 6 (accepted red 6: afterread ×1, convert-chain ×2, pdfstructure ×1, read ×2); workbooks pass 25 fail 1 (accepted red 8, R15). Without my change, extraction + workbooks fail the same 7.
- `checks/format.mjs`: 0 failures. `architecture.mjs … office-readers`: 0 failures. `coverage.mjs … office-readers`: 33 of 33 live ids, 0 failures. `ownership.mjs … office-readers tranche/T35`: 9 files, 0 failures.

Size (session_0197hpZKQkhjw4tqoDSVoZF9): test runs 9, module lines 3,737
