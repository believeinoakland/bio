# office-readers (T33)

**Status** · session_01QtEmE6Gh2wQSGswWajw28K · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four readings of R30/R31 I am building on; I carry on with them unless you answer otherwise.

1. **R30 over the guard.** R30 says `cells` is `null` over the guard (R12, R13), but over the guard xlsx and csv `text()` already give `sheets: []` (R11/R12 as built and tested), so no sheet carries `cells`. My reading: `sheets` stays `[]` over the guard. The `null` rule then applies to every sheet entry whose cells were not walked: an xlsx sheet whose part could not be read gets `cells: null`, never `[]`.
2. **R31 "the reason is in undetermined".** If `docProps/core.xml` is present but unreadable, `metadata` is `null` and `text().undetermined` gets `{reason:"metadata_unreadable", part:"docProps/core.xml", why}`, counted in `counts.undetermined`. If the part is absent, `metadata` is `null` with no marker, because absence is normal OPC (ooxml R19). A marker there would raise the decode count that reading-pipeline and docprofile read for every file without core properties. `metadata` is also given over the size guard, since the core part is read whatever the guard says.
3. **R30 value and type.** For xlsx, `value` is the raw `<v>` (a boolean stays `"1"`/`"0"`; the text stream keeps `TRUE`/`FALSE`). A `t` token outside the format's list gets `type: null` and `declared` set to the token as written, with an undetermined marker `{sheet, cell, reason:"cell_type_unknown"}` (R22).
4. **A cell with no `r` attribute** gets `source: null`, as R10's formula item does. It is ordered after the cell before it.
