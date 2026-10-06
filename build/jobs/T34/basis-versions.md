# basis-versions (T34)

**Status** · session_01LMwfB83t6pYsWwQ4KtMjxD · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** T34-86 (N664, DEC-149; K1784, K1797), this module's share: every member-facing string that called the group's Civicsmith "this plane" or "the plane" now says "your group's Civicsmith". Three strings, all in `bio-plane/src/basis-versions/index.mjs`:
- R22's unrecognised entry `detail` (`#recordIn`, the site BOB's grep named at `:500`): "this entry names an act your group's Civicsmith does not know, …".
- R16's `FALSIFIER_AND_NONE_STATED` `detail` (`conclude`, ~`:1009`): "… your group's Civicsmith will not choose between them. …". Not in BOB's grep (it says "the plane", not "this plane"); the same retired name, so applied here.
- R20's `NOTHING_TO_WITHDRAW` `detail` over an unreadable stance (`withdrawConclusion`, ~`:1264`): "… is one your group's Civicsmith cannot read, …". Not in BOB's grep either; applied for the same reason.
Kept, as BOB's START says: the copy of a document (C-50.4, C-50.8 translations; R25's absence "this copy of the document has never been read"; narrow's "a DIFFERENT copy of it"); comments and identifiers (`CONTENT_MINTED_BY_PLANE`, the module header). No requirement changed (req: none).

**Deferred.** None.

**Found in other modules (for BOB).**
- `case-authoring` (L8) carries the same two retired names in member-facing `detail`s: `bio-plane/src/case-authoring/index.mjs` ~1226 ("names an act this plane does not know", its copy of R22's reading) and ~2188 ("hold arguments this plane cannot read"). Its test `test/m/case-authoring/members.test.mjs`:84 names the first only in a comment. For L8's DEC-149 share.
- Generated artifacts this change stales (mechanics §14; not written here): `bio-plane/dist/bio-plane.bundled.mjs` (the plane's bundle, `not_product`) and, through the release, `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs`; each carries the old R22 string. Regenerated at the layer close.

**Reading.** The module's code and tests, its requirements, the plan's T34-86 and Rules at the opening, `build/layers.md` (layer 6's contract) whole. Of the Uses' public parts, `record-grammar` and `text-chain` whole and the start of `record-core`; not the other eleven: this entry changes three strings and reads or changes no service of any module.

**Tests and checks.**
- New `bio-plane/test/m/basis-versions/dec149-strings.test.mjs` (4 tests, titled R22, R16, R20 and R35 with DEC-149): each changed string driven out of the module and named whole; no refusal row of the module names the Civicsmith as this instance, plane, server or copy.
- `node --test bio-plane/test/m/basis-versions/`: tests 131, pass 131, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture`: 24 product files, 83 relative imports; 0 failures. `coverage`: 44 of 44 live requirement ids named by a test; 0 failures. `ownership`: 3 files changed by basis-versions between tranche/T34 and HEAD; 0 failures.

Size (session_01LMwfB83t6pYsWwQ4KtMjxD): test runs 1, module lines 3594
