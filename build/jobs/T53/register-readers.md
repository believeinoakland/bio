# register-readers (T53)

**Status** · session_018BhceejwjKtfM2xJWBwiY8 · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

## Entries applied

- **T53-53** (N1259, K4403, K1484; CAPABILITIES rows): new module `register-readers`, R1–R11, built whole.
- **T53-503** (K5577 (2)): `contactShape(text, streetTypes)`: the street types are the caller's data from the active layers; the module's code holds no street word (R11's test checks it). `reduce(row, definition, {streetTypes})` and `createReducer({..., streetTypes})` pass them through.

**Paths:** `bio-plane/src/register-readers/` (`index.mjs` the interface; `rows.mjs` R1, the one row parser `readRows` and the reducer share; `zip.mjs` R2, its own directory reader, inflate (RFC 1951, streamed, a 32 KiB window) and CRC-32; `reduce.mjs` R3, R4, R9; `terms.mjs` R5–R8; `estimate.mjs` R10). **Tests:** `bio-plane/test/m/register-readers/` (`rows`, `zip`, `reduce`, `terms`, `estimate`, `invariants` `.test.mjs`; `fixtures.mjs`, made-up "Riverbend"/"Sawtooth" definitions in `jurisdictions` R127's shape; `memory-child.mjs`, R1's heap measure). 65 tests. The `modules.json` row is BOB's (K1185, K1975).

## Detail decisions (BOB's to record, P17)

- **Items `readRows` yields:** first `{ok: true, header, encoding, assumed, delimiter}` (or `{ok: false, why}` and nothing more: `column_missing` with `column`, `header_missing`, `definition_invalid`, `piece_unknown`, `delimiter_unknown`, `source_invalid`, `source_failed`); then rows; last `{done: true, rows, undetermined_rows, encoding, assumed}`, the piece's statement of its encoding. `piece` is a piece object or the key of one of the definition's pieces. An absent `delimiter` reads as comma. A blank line is no row. A source item `{ok: false, why}` (a zip member's CRC result) ends the read with it, so `streamZipMember` feeds `readRows` directly.
- **Encoding:** a BOM's, else UTF-8 when the first window is valid UTF-8 (by `ooxml.decodeText`), else windows-1252. An assumed UTF-8 is checked window by window; from the first window that is not valid UTF-8 the rest is read as windows-1252 and the closing item states `windows-1252`.
- **A third undetermined kind:** a row with a cell longer than csv-reader's walk keeps (`sheet.cell_kept_chars`) is `{undetermined: true, why: "cell_too_long", columns}`, never cut.
- **`row_key_basis: content`:** the key is `<sha256 of the kept cells' JSON>\u001f<occurrence>`; the occurrence count holds one entry per distinct row while the piece is read (a source-keyed register holds nothing).
- **`droppedColumns`** also names a listed column with `keep: false` as `why: "not_kept"` (R3 names only `contact_role` and `unlisted`; a dropped column of another role would otherwise be unnamed).
- **Withheld cells in the reduced copy** are written empty; `withheld_cells` counts them.
- **Terms:** a one-letter token (an initial) is not a name token, which is what makes "MARTINEZ, ROSA M" equal "Rosa Martinez" (R5's test); `indexTerms` also answers `licence_no`, `docket_no`, `company_no` (the filter's `licence_numbers`, `docket_numbers` need them). `amount.units` is a safe integer (beyond it, undetermined). `date_format` tokens: `YYYY`, `MM`, `M`, `DD`, `D`, literals, a final `*` for an unread remainder (a timestamp's time); the default `YYYY-MM-DD`.
- **Filter:** ids are recognised in `id-spaces`' spaces `person` (filer, licence) and `proceeding` (docket); with no `view`, an id's form is not checked. `FILTER_TOO_LARGE`: over 1,000 in `names` or in `organizations`, over 500 ids over the three id lists together. The pattern characters refused are `* ? % [ ] ^ $ | \ { }`, `.*`, `.+`. "All filers of X" as words is not detected (it would need words in code); the closed criteria hold no such criterion. `filterFingerprint` token-normalises organizations as well as names; null for a non-object.
- **prefillFrom:** schemes `filer` and `committee` fill `filer_ids`, `licence` `licence_numbers`, `docket` `docket_numbers` (`jurisdictions` R130's names); `basis` is `[{criterion, value, fact}]`, `left_out` `[{criterion, fact, why}]` (`role_absent`, `scheme_not_issued`); a fact of any other kind is neither used nor listed.
- **estimate:** `spread` is the sampled windows `[{bytes, rows}]`; a sample of all the bytes gives `low = high`; with no total bytes, `not_stated`.
- **streamZipMember** ends with `{ok: true, bytes, crc32}` or `{ok: false, why}` (`member_missing`, `ambiguous_member`, `unsupported_method` with `method`, `member_unreadable`, `member_crc_mismatch`); it reads the member's local header and compressed span only; `opts.members` reuses a listing, `opts.readBytes` sets the read size (1 MiB). `listMembers` reads the last 22 bytes first, then 1 KiB, then 64 KiB only when a comment needs it.
- **Uses:** `setup-words`, `runtime-limits` and `test-support`'s `sheetgen` are declared but not imported: the module answers codes only (no sentence a member reads), quotes no bound (K5530 F4), and its fixtures are its own text with `make-zip.mjs`'s `zipChunks64`.

## Measured

R1's heap test: 200 MiB streamed through `readRows` under `--max-old-space-size=64` in about 4 s (about 50 MB/s of rows decoded, walked and keyed). The inflate decodes about 115 MB/s on this machine.

## Found in other modules

- `jurisdictions` (K5577 (2)): `contactShape` reads `streetTypes` as a list of strings, or of objects whose string or string-list values are the suffixes and abbreviations (sent to BOB at start). The federal layer's `street_types` section can take either shape.
- A ZIP64 member whose local header offset is past 4 GiB is read from the central directory's ZIP64 extra field; the fixture writer cannot place one there without writing 4 GiB, so that path is covered by the format rule, not by a test of an actual offset.

**Met** · R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11

Tests: 65/65. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceejwjKtfM2xJWBwiY8): test runs 1, module lines 1305
