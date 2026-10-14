# interface-assets — requirements

**Status** · New in T46 (T46-53; K657, K1043): a module built fresh, layer 11 directly after `store-door`, first of the six interface modules (N897 (1), Bob's K2816; DEC-138; N559). No ids move; nothing is extracted from a legacy module (`legacy-ui` stays as it is, K633). Not yet met (T46). Last changed T48 (T48-68: R5 new, amending R1, `ASSETS_COMMIT` on `main` at PR #34's merge, no help cursor and the three kind tokens, N1048, N1028, DEC-224, DEC-215 (3); R6 new, the faces carried as upload parts, N1039; K3147, K3166, K3195); marked not yet met (T48). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R7 new, amending R1 and R5, `shell.css` generated from the design page's product rules); marked not yet met (T48). Last changed T49 (T49-19: R8 new, amending R5 and R7, `ASSETS_COMMIT` at `f498560a37`, DEC-236's classes and the test band; K3334); marked not yet met (T49).

**Size (P6).** About 120 lines of generated data, about 1.1 MB (the 15 faces as base64; plan T46, M-T46-1), no code.

## Public

### Purpose

The visual language every member screen uses (DEC-138), as frozen data copied from the design stream's files at a named commit: the stylesheet with its faces, the typefaces with their licences, and the icons. Pure data: it imports nothing, reads nothing and writes nothing; `interface-shell` names its files and `control-plane` serves them.

### Provides

**The files: `ASSET_FILES`, `ASSETS_COMMIT`** (DEC-138; DEC-122 (3))
- **R1** `ASSETS_COMMIT` names the commit of `main` the files are read at: the merge of the design stream's PR #28 at T45's close (`3f40899950`, K2904), or a later `main` commit only by a later requirement naming it. `ASSET_FILES` maps each published name to `{type, body}` (`body` a string; a face's bytes as base64, with `encoding: "base64"`): `civicsmith.css` (`docs/development/ux-substrate/visual-language/civicsmith.css`'s bytes, followed by `faces.css`'s with each `url("fonts/<f>")` rewritten to `url("/app/assets/fonts/<f>")`), type `text/css`; `icons.svg`, type `image/svg+xml`; `fonts/<f>` for each of the 15 `woff2` faces of `visual-language/fonts/`, type `font/woff2`; and `fonts/OFL-source-serif-4.txt`, `fonts/OFL-source-sans-3.txt`, `fonts/OFL-source-code-pro.txt`, type `text/plain`; and no other name. A test reads each file from git at `ASSETS_COMMIT` and finds each entry equal to it byte for byte (a face base64-decoded; the stylesheet as the two files joined with only the stated rewriting).
- **R2** No file of `ASSET_FILES` names a resource on another origin in any `url()`, `@import`, `href` or `src`: every resource it names is `/app/assets/…` on the page's own origin (an XML namespace declaration, as `icons.svg`'s, names no resource). A test scans every entry.
- **R3** `ASSET_FILES` and each of its entries are frozen: no write changes the map, an entry or a field.
- **R5** (T48; N1048, N1028; DEC-224, DEC-215 (3); K3166; amends R1) `ASSETS_COMMIT` is `4664e8efd4` (`main` at PR #34's merge, whose visual language is PR #33's, `371af128a6`), or the later `main` commit named at the job's START if the visual language changed after. `ASSET_FILES` is read there by R1's rule. By it `civicsmith.css` holds no `cursor: help` anywhere; its `.cs-card` rule carries no `cursor` (DEC-224: the cursor changes only over a control); and it holds `--c-kind-money`, `--c-kind-part` and `--c-kind-mention`, light and dark. Test: R1's byte equality; a scan finds no `cursor: help` and no `cursor` in `.cs-card`; control: `.cs-btn` keeps `cursor: pointer`.
- **R6** (T48; N1039; K3147; `plane` R43, R54; `bundler` R31) The faces (`fonts/<f>`, the bulk of `ASSET_FILES`) are not evaluated as module code at the plane's start: `ASSET_FILES` holds each face so that the bundle carries its bytes as an upload part (a data module the Worker loads as bytes) or builds it on first read, never as a base64 string literal parsed in the global scope. Every name and every body answered is byte-identical to R1's. Test: R1's equality holds; a fresh import evaluates no face until one is read.

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R7** (T48; K3250, K3254 (2); walk C1; amends R1's "no other name", R5) `ASSET_FILES` also holds `shell.css`, of type `text/css`. It holds every product rule of the design's page stylesheet: the `<style>` of `docs/development/ux-substrate/screens/page.src.html` at `ASSETS_COMMIT` (`interface-shell` R56 enforces the emitted side, K3254 (2)). Inside the 760 px query the design's `.mk-device[data-device="phone"] ` prefix becomes `:root:root `, keeping its weight; the rules naming the design's unprefixed product classes that carried `mk-` components draw (the graph's `.e`, `.e-*` and `.gchip` rules, `.cell` and its children, `.st`, `.row`) are carried too, listed by name (K3295). `generate.mjs` writes it beside `civicsmith.css`; it is never copied or edited by hand and is regenerated whenever the visual language is.
  - **Which rules are carried.** A rule is carried when every one of its selectors names an `mk-` or `cs-` class, and none names a mock-only class or one of the page's own. The mock-only classes are `mk-device`'s frame, `mk-scaler`, `mk-mockctl`, `mk-osprompt` and the viewer's controls. The page's own are `anat`, `asfig`, `viewer` and `vlist`.
  - **How selectors are rewritten.** `.mk-page` becomes `.cs-frame`. A rule under `.mk-device[data-device="phone"]` is carried inside `@media (max-width: 760px)` with that prefix replaced by `:root:root ` (K3295).
  - **Other rules.** R2 holds for the new file.

  Test: the file equals the generator's transform of the source, read from git at `ASSETS_COMMIT`. It holds `.mk-door`, `.mk-acts`, `.mk-frontgrid` and `.mk-avatar`, and `.cs-tabs` inside the 760 px query. Control: no selector names `mk-device`, `mk-scaler` or `.anat`, and no rule lacks a `cs-` or `mk-` class.

#### T49 (T49-19)

- **R8** (T49; N1090, N1094, N1099; DEC-236 (B204 (1), (3)), DEC-240 (N1049), DEC-241; amends R5, R7) `ASSETS_COMMIT` is the `main` commit named at START (`f498560a37`, PR #37's merge, or later). `ASSET_FILES` is read there by R1's and R7's rules. By them:
  - `shell.css` carries DEC-236's design classes: `.mk-menuwrap`, `.mk-menu`, `.mk-actwrap`, `.mk-slot`, `.mk-rowname`, `.mk-scrim`, `.mk-image`, `.mk-imgareas`, `.mk-imgarea`, `button.mk-avatar` and `.mk-grp`. It also carries the graph's `.e-step_source` and DEC-241's `.mk-morerows` and `.mk-morerow`;
  - `civicsmith.css` carries `.cs-band[data-band="test"]`.

  Test: R1's byte equality and R7's transform. A scan finds each named rule. Control: no selector names `mk-device` or `mk-scaler`.

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
