# odf-reader (T35)

**Status** · session_01Cp5wGJf8KyKDzCvUrmymPr · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied: T35-76** (K1888, K1903, K1904; R47 as amended by K1917). `odf.mjs` gains one builder, `activeOf`. It runs once in `parts()`, and every successful `structure()` and `text()` of the three entries carries its list as `active`. That includes the size-guard, unreadable-body and repeat-bound branches: what the guard and R45 stop is the projection, not the list. One item per finding, in central-directory order (listeners in document order within their part):
- `{kind:"odf-basic", part}` for each member file under the package root's `Basic/`;
- `{kind:"odf-script", part}` for each member file under the root's `Scripts/` (K1917);
- `{kind:"odf-basic", part, event}` for each `script:event-listener` in `content.xml` or `styles.xml`. It is matched by the script namespace URI under any prefix the part binds, or the conventional `script` when the part declares none. `event` is its `script:event-name`, or `null` when it has none;
- `{kind:"launch", part, event}` for each `presentation:event-listener` whose `presentation:action` is `execute` (K1917), matched the same way;
- `{kind:"embedded-file", part}` for each member file under a root `Object …/` directory, and for member `X` when `ObjectReplacements/X` names it;
- `{kind:"unread", part, why}` when `content.xml` was not read (the guard's `over_size_bound`, or `readPart`'s why), or when `styles.xml` could not be read. `styles.xml` is bounded by the same `sizeGuard`, so one over the bound reads `over_size_bound`.

Names are read off the central directory. Nothing is run or resolved: no listener target is followed, and no Basic or script source is read. The module's header names the new field. No other service changed shape. Readings 1–3 of J1 stood (K1917 (4)).

**Tests.** A new file, `active.test.mjs`, holds seven tests named R47. They assert, on all three entries, that `structure()` and `text()` carry the same list, and cover:
- `[]` for a file with nothing that can act (`styles.xml` present or absent);
- every kind, in central-directory order, with the directory reordered against the file;
- namespace prefixes, comments and other namespaces;
- `launch` only for `execute`, in both parts;
- what is and is not an embedded object, Basic or script member;
- each `unread` case (content.xml over the guard or unreadable, styles.xml unreadable or over the guard), and a corrupt Basic module still listed and never unread;
- no fetch, and the list kept past R45's bound.

Three existing assertions that compare whole `text()` answers now include `active` in what they expect (`odt.test.mjs` R13, `odp.test.mjs` R27, `repeats.test.mjs` `refusedOds`). Nothing was loosened.

**Found in other modules (REPORT J3):** generated artifact made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` embeds `bio-plane/src/odf.mjs` (owned by `not_product`); regenerate at L1's close. `program.mjs` and the worker bundles do not include `odf.mjs`.

**Deferred:** nothing.

**Tests and checks run** (on `job/T35/odf-reader` after merging `tranche/T35` for K1917):
- `node --test bio-plane/test/m/odf-reader/*.test.mjs`: tests 69, pass 69, fail 0.
- Users of the module (`modules.json`): format-registry and acquisition, pass 115, fail 0; capture (with `cap13-reuse-pages`, `d57selflink`), pass 129, fail 0.
- Layer tests: none (`build/manifest.md`).
- `format`: 129 modules, 128 requirements files; 3 failures, all accepted reds outside this module (test-support's `make-zip.mjs`, red 13; bundler's `release-advisories.mjs` and `third-party.json`, red 16).
- `architecture odf-reader`: 12 product files, 43 relative imports; 0 failures.
- `coverage odf-reader`: 47 of 47 live requirement ids named by a test; 0 failures.
- `ownership odf-reader tranche/T35`: 6 files changed; 0 failures.

Size (session_01Cp5wGJf8KyKDzCvUrmymPr): test runs 9, module lines 2420

## J1 · QUESTION

R47's wording leaves four points open. Below is my best reading of each, and I am building on it now. None of the answers changes what I build next; each would only adjust a rule.

1. **"Under a `Basic/` directory"** means the package root's `Basic/` (where LibreOffice stores a document's Basic libraries: `Basic/script-lc.xml`, `Basic/<Library>/script-lb.xml`, `Basic/<Library>/<Module>.xml`). One `{kind:"odf-basic", part}` per member file whose name starts `Basic/`. A `Basic/` nested inside another directory is not counted.
2. **"An `Object …/` sub-document directory"** means a root directory whose name starts `Object ` (`Object 1/content.xml` and the like): one `embedded-file` per member file under it. **"An `ObjectReplacements/` part's source"** means member `X` when `ObjectReplacements/X` is present and `X` is a member file. This is how an OLE object stored as a single file (`Object 2`, with no slash) is recognised. The replacement image itself is not listed.
3. **Reading `styles.xml` for listeners.** R47 sets no bound for this read. I read it only when its declared uncompressed size is within COFF-6's bound (the same `sizeGuard` that guards `content.xml`). Over that bound, it reads `{kind:"unread", part:"styles.xml", why:"over_size_bound"}`. A missing `styles.xml` is not unread: there is nothing to read. When `content.xml` was not read (over the guard, or unreadable), it reads `{kind:"unread", part:"content.xml", why}`. Basic members and `Object` members are identified by name from the central directory, so they are listed even over the guard. Event listeners are matched by the `script` namespace URI, under whatever prefix the part binds it to (`script` when none is declared). A `presentation:event-listener` is therefore not counted as one.
4. **Not in R47 (proposal; for now I list neither):**
   - (a) Members under the package root's `Scripts/` (LibreOffice's embedded Python, BeanShell and JavaScript macros, which a `vnd.sun.star.script:…location=document` listener runs) can also act when the file is opened.
   - (b) `presentation:event-listener` with `presentation:action="execute"` (an `.odp` shape that launches a program) can act too.

   Should R47 list them, for example `Scripts/` members as `odf-basic` and (b) as an `odf-basic` item with its `event`? That is BOB's wording to make.

## J2 · REPORT

Generated artifact made stale (mechanics §14): bio-plane/dist/bio-plane.bundled.mjs embeds bio-plane/src/odf.mjs, which T35-76 changed (owned by not_product). Regenerate it at L1's close. case-checker's program.mjs and the worker bundles do not include odf.mjs.
