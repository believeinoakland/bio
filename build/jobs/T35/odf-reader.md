# odf-reader (T35)

**Status** · session_01Cp5wGJf8KyKDzCvUrmymPr · depth 2 · WORKING · handled B0

## J1 · QUESTION

R47's wording leaves four points open. Below is my best reading of each, and I am building on it now. None of the answers changes what I build next; each would only adjust a rule.

1. **"Under a `Basic/` directory"** means the package root's `Basic/` (where LibreOffice stores a document's Basic libraries: `Basic/script-lc.xml`, `Basic/<Library>/script-lb.xml`, `Basic/<Library>/<Module>.xml`). One `{kind:"odf-basic", part}` per member file whose name starts `Basic/`. A `Basic/` nested inside another directory is not counted.
2. **"An `Object …/` sub-document directory"** means a root directory whose name starts `Object ` (`Object 1/content.xml` and the like): one `embedded-file` per member file under it. **"An `ObjectReplacements/` part's source"** means member `X` when `ObjectReplacements/X` is present and `X` is a member file. This is how an OLE object stored as a single file (`Object 2`, with no slash) is recognised. The replacement image itself is not listed.
3. **Reading `styles.xml` for listeners.** R47 sets no bound for this read. I read it only when its declared uncompressed size is within COFF-6's bound (the same `sizeGuard` that guards `content.xml`). Over that bound, it reads `{kind:"unread", part:"styles.xml", why:"over_size_bound"}`. A missing `styles.xml` is not unread: there is nothing to read. When `content.xml` was not read (over the guard, or unreadable), it reads `{kind:"unread", part:"content.xml", why}`. Basic members and `Object` members are identified by name from the central directory, so they are listed even over the guard. Event listeners are matched by the `script` namespace URI, under whatever prefix the part binds it to (`script` when none is declared). A `presentation:event-listener` is therefore not counted as one.
4. **Not in R47 (proposal; for now I list neither):**
   - (a) Members under the package root's `Scripts/` (LibreOffice's embedded Python, BeanShell and JavaScript macros, which a `vnd.sun.star.script:…location=document` listener runs) can also act when the file is opened.
   - (b) `presentation:event-listener` with `presentation:action="execute"` (an `.odp` shape that launches a program) can act too.

   Should R47 list them, for example `Scripts/` members as `odf-basic` and (b) as an `odf-basic` item with its `event`? That is BOB's wording to make.
