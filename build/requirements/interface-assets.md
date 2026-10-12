# interface-assets — requirements

**Status** · New in T46 (T46-53; K657, K1043): a module built fresh, layer 11 directly after `store-door`, first of the six interface modules (N897 (1), Bob's K2816; DEC-138; N559). No ids move; nothing is extracted from a legacy module (`legacy-ui` stays as it is, K633). Not yet met (T46).

**Size (P6).** About 120 lines of generated data, about 1.1 MB (the 15 faces as base64; plan T46, M-T46-1), no code.

## Public

### Purpose

The visual language every member screen uses (DEC-138), as frozen data copied from the design stream's files at a named commit: the stylesheet with its faces, the typefaces with their licences, and the icons. Pure data: it imports nothing, reads nothing and writes nothing; `interface-shell` names its files and `control-plane` serves them.

### Provides

**The files: `ASSET_FILES`, `ASSETS_COMMIT`** (DEC-138; DEC-122 (3))
- **R1** `ASSETS_COMMIT` names the commit of `main` the files are read at: the merge of the design stream's PR #28 at T45's close (`3f40899950`, K2904), or a later `main` commit only by a later requirement naming it. `ASSET_FILES` maps each published name to `{type, body}` (`body` a string; a face's bytes as base64, with `encoding: "base64"`): `civicsmith.css` (`docs/development/ux-substrate/visual-language/civicsmith.css`'s bytes, followed by `faces.css`'s with each `url("fonts/<f>")` rewritten to `url("/app/assets/fonts/<f>")`), type `text/css`; `icons.svg`, type `image/svg+xml`; `fonts/<f>` for each of the 15 `woff2` faces of `visual-language/fonts/`, type `font/woff2`; and `fonts/OFL-source-serif-4.txt`, `fonts/OFL-source-sans-3.txt`, `fonts/OFL-source-code-pro.txt`, type `text/plain`; and no other name. A test reads each file from git at `ASSETS_COMMIT` and finds each entry equal to it byte for byte (a face base64-decoded; the stylesheet as the two files joined with only the stated rewriting).
- **R2** No file of `ASSET_FILES` names a resource on another origin in any `url()`, `@import`, `href` or `src`: every resource it names is `/app/assets/…` on the page's own origin (an XML namespace declaration, as `icons.svg`'s, names no resource). A test scans every entry.
- **R3** `ASSET_FILES` and each of its entries are frozen: no write changes the map, an entry or a field.

## Private

### Uses

None. It imports nothing. For its tests only: the design stream's files at `ASSETS_COMMIT`, read from git (no module).

### Invariants

- **R4** The module imports nothing and does nothing when loaded beyond defining its two exports: no I/O, no store, no registration, no time or randomness; every read of it answers the same.

### Satisfies

- DEC-138 (the visual language's stylesheet, faces with their licences, and icons, served from the group's own copy; owed since T33, N559): R1–R3.
- DEC-122 (3) and design principle 9.6 (nothing loaded from outside the group's own Civicsmith): R2.
- N897 (1) (Bob's K2816: the designed screens built as the real interface, served by each group's own Civicsmith).

### Suggestions

- **Generated, never edited by hand,** by a script kept beside the module and not imported (so not bundled), as `setup-words`' generator is; the generated file's header names this module's R1 and its test.
- **All 15 faces** (Latin, Latin Extended, Vietnamese; DEC-138 (2)): about 0.79 MB, about 1.05 MB as base64, taking the plane bundle from about 13.9 MB to about 15 MB, under `bundler` R31's 32 MiB warning (`draft-T46-interface.md` §7 T3).
- `check_contrast.py` is the design stream's, run whenever a colour changes (DEC-138's owed item); a new `ASSETS_COMMIT` is the moment to ask for it.
- The file's path: `bio-plane/src/interface-assets/index.mjs`, the repository's convention for a module.
