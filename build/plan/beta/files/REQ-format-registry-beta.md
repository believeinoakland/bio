# Requirement draft: format-registry, the beta's type roster and what an unreadable type becomes

**Status** · READY for PLANNING (FILES #1, F3, 2026-10-27). Drafts lines for `build/requirements/format-registry.md` (BOB writes them, P17). Rests on K4628, K4632, K5435 (list = ruled + Tier 2), K5436 (hold and name), K5437 (MBOX in, PST/Access held), K5427 (text 100 MB). Numbering is provisional (continues from R32). Each line ends with its Test.

## Provides (changes)

- **RF1** The built-in roster at module load holds an entry for each type of the list below, each answering `detect` from content before any declared type or name (existing R10, R11 keep their order). The list: `pdf`, `docx`, `doc`, `xlsx`, `xlsm`, `xls`, `csv`, `tsv`, `pptx`, `ppt`, `odt`, `ods`, `odp`, `rtf`, `text`, `html`, `mhtml`, `json`, `ndjson`, `xml`, `svg`, `kml`, `kmz`, `geojson`, `ics`, `vcf`, `srt`, `vtt`, `jpeg`, `png`, `tiff`, `heic`, `heif`, `avif`, `gif`, `webp`, `bmp`, `jp2`, `eml`, `msg`, `mbox`, `zip`, `tar`, `gz`, `7z`, with macro and template siblings of the Office formats (`docm`, `pptm`, `dotx`, `xltx`, `potx`) answered as their base format with `variant` set. Test: for each type, a generated sample (small) is answered with that `format` and `confidence: "certain"`; the roster's `listFormats()` equals this list.
- **RF2** A file's type is judged from its bytes (head and, for containers, tail and directory, as R32), never from its extension or declared type alone; a file whose extension disagrees with its content is answered as its content with a signal naming the disagreement. Test: a `.docx` that is really a PDF, a `.pdf` that is a ZIP, an `.xls` that is a CSV, each answered as what it is, signal present.
- **RF3** Text-like types without a signature (`text`, `ndjson`, `ics`, `vcf`, `srt`, `vtt`, `mbox`, and the delimited kinds) are answered by content rules: valid text in a known encoding, then a leading structure (`BEGIN:VCALENDAR`, `From ` lines, numbered cues, one JSON object per line). A file of valid text that matches none is `text`. A binary file is never `text`. Test: a `.log` and a `.md` answered `text`; a PNG renamed `.txt` answered `png`; a random 1 MB file answered `undetermined`.
- **RF4** Macro-enabled Office files are answered as their base format with `variant: "macro"` and `macros: true` when the package holds a VBA project; nothing in the package is executed or loaded as code. Test: an `.xlsm` with a VBA part is `xlsx` + `macros: true`; its text is read as an `.xlsx`.
- **RF5** An encrypted or password-protected file (an encrypted ZIP, an Office file in an encrypted container, an encrypted PDF) is answered with its type and `encrypted: true`, never `undetermined`. Test: one of each, answered with `encrypted: true`.
- **RF6** (K5436) A file of a type not on the list, or of no determinable type, is answered `{format: "unlisted", named: <plain-word name or null>, confidence, signals}`; it is never `undetermined` without a named reason and never guessed as text. `named` comes from a table of known unlisted types (at least: Outlook archive `pst`/`ost`, Access `mdb`/`accdb`, SQLite, Parquet, `xlsb`, WordPerfect, Apple iWork, Visio, Publisher, OneNote, MS Project, CAD `dwg`/`dxf`, shapefile and GeoPackage, audio, video, EPUB), carrying the plain-word name members will read ("an Outlook mailbox", "a video"). Test: a generated sample of each named type is `unlisted` with its name; a file with no match has `named: null` and a reason in `signals`.
- **RF7** (K5436) The refused set is answered `{format: "refused", reason}`: RAR, programs, installers, shell and script files meant to run, disk images, and libraries. The reason is a plain-word reason. Test: a RAR, a Windows executable, an ISO, each `refused` with its reason.
- **RF8** `format-registry` exports a `formatNameFor(answer)` returning the plain-word kind of any answer (listed, unlisted or refused) through `setup-words`, so no screen builds a type name from an extension. Test: every roster entry and every RF6 name has a key in the words file; the words check passes.
- **RF9** A new type is added by one `registerFormat` entry plus a words row; nothing else changes (existing R1 to R5). Test: a test registers a fake entry and `detectFormat` returns it.

## Held and named: the contract with callers (suggested to `acquisition`, `reading-pipeline`, `screens-intake`)

- **RF10** A file answered `unlisted` is filed whole, safe-graded and findable by name and details like any other, with its reading stated "held, not read: {name}" and an owed state that a reader's arrival resolves (the job table of GAP-1.4: a `held-unread` verdict, re-run when the roster gains the type). Test (acquisition, reading-pipeline): an unlisted file is filed, found by its title, shown as held and named; adding a reader for it reads it without a second upload.
- **RF11** A `refused` file is not filed; the refusal states its type and reason. Test: the door answer for a RAR names RAR and the reason.

## Uses
`office-readers`, `odf-reader`, `csv-reader`, `pdf-reader`, `ooxml`, `setup-words` (existing); new readers (`structured-text-reader`, `mail-reader`; see `REQ-readers-beta.md`) register their own entries.

## Satisfies
K4628 point 1; K5435 to K5437; the canon's "never silent" (K4571).

## Proposed order
`format-registry` is order 19, so it cannot import the new readers' modules (P4): each new reader exports its entry and the registry imports it, as for csv-reader. The two new modules are therefore layer 1, ordered before the registry.
