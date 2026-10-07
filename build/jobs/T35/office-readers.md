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
