# office-readers (T35)

**Status** · session_0197hpZKQkhjw4tqoDSVoZF9 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings, carrying on with each; none blocks the build.

1. **R33, `detect(null, contentType)` for a twin's package type: "with `format` the twin's".** Best reading: `format` is the entry's own (`"docx"` for `application/vnd.ms-word.document.macroEnabled.12`), as R1 fixes each entry's `format` and the registry routes by it; the signals name the macro-enabled flavour (e.g. `docm`). The other reading (`format:"docm"`) would name a format no registry entry answers to.

2. **R32, the `vba-project` item when `ooxml.readVbaProject` reads the project but a module's source cannot be read** (ooxml R32: that module `read:false`, listed in its `undetermined`). The item's shape `{kind, part, read, why, project, modules, autoRun, suspicious}` has no place to say so, so `autoRun`/`suspicious` could read as complete while a module went unread (R22). Best reading: build the shape exactly as worded (`read:true`, `why:null`, `modules` every module's name, unread ones included). Proposal, BOB's to word if wanted: add `undetermined` to the item, ooxml's `[{module, why}]` verbatim.

3. **R32, `activex` / `embedded-file` membership.** Best reading, literal: every member whose name is under `<fmt>/activeX/` (its `_rels/*.rels` included) is an `activex` item; likewise every non-`oleObject*` member under `<fmt>/embeddings/` is an `embedded-file`. A `.rels` part there also yields its own `external-target` items.
