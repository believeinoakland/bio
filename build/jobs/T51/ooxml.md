# ooxml (T51)

**Status** · session_012TKKHe5Adb9PswRVKrEcj8 · depth 2 · COMPLETE · handled B7

## J1 · REPORT

T51-248 ooxml (words, K3949): the 8 findings are all diagnostic strings pushed into `discriminate`'s `signals` array. I changed no code: a member does not read these strings, so BOB's rule for unread strings applies (REPORT, not hidden, settled by the design's unkeyed list, K3944). Nothing else in ooxml's words file.

Findings (checks/run.mjs, words arm, ooxml):
1. ooxml.mjs:773 `declared-content-type:{} (not used for the determination)`. Pushed only when `discriminate` is given a `contentType`. No source caller passes one: docx, pptx, odf, formats-xlsx and doc-clean all call `discriminate(bytes)` with one argument. No member reads it.
2. ooxml.mjs:834 `part:{} parsed ({} defaults, {} overrides)`. Success-path signal. Its array goes out in the flavour result; no member reads the array.
3. ooxml.mjs:854 `ct:{} declared for {}, but the part is ABSENT`. Same: signal only; the member reads `why` (`declared_main_part_absent`).
4. ooxml.mjs:927 `odf:{} present but NOT the first archive member` (and 929, its second line `local-header offset {}, earliest {})`). Signal only; the member reads `why` (`odf_mimetype_not_first`).
5. ooxml.mjs:933 `odf:{} is first but COMPRESSED (method {}, ODF requires stored)`. Signal only; member reads `why` (`odf_mimetype_not_stored`).
6. ooxml.mjs:965 `odf:{} {} (first member, stored)`. Success-path signal; no member reads it.
7. ooxml.mjs:978 `odf:mimetype declares {}, but {} is ABSENT`. Signal only; member reads `why` (`declared_main_part_absent`).

Why no member reads them: `signals` leaves ooxml only inside the failure and flavour results of `discriminate`. docx.mjs:486-495, pptx.mjs:387-396, odf.mjs:648-672 and formats-xlsx.mjs:439-443 pass it on unchanged, and nothing in product source reads it: every consumer reads `why`. The two places that print signals as text, monitoring.mjs:930 (`sniffed.signals.join`) and drive.mjs:236, read the signals of formats.mjs `detectFormat`, which has its own strings and does not call `discriminate`. I traced this by grep; the chain is not exhaustive of every test fixture.

Options for BOB (my recommendation first):
A. Add these 8 ids to the design's `unkeyed` list (words-reads.json, K3944). No code change, no requirement change. Recommended.
B. Give them keys as `{key, vars}`. This changes R11's contract ("an array of strings") and touches four format entries and the signal consumers. Not recommended for diagnostics no member reads.
C. Import setup-words `localize`. This changes R23 (zero runtime dependency). Not recommended.

The job cannot reach COMPLETE on the words check until option A (or B/C) is settled, because the check counts these as findings until they are on the list. Everything else in ooxml is unchanged and the format, architecture and ownership checks read 0 failures.

## J2 · BLOCKED

Cause: needs Bob. The 8 ooxml words findings (see J1) are unread diagnostic strings. Their settlement is Bob's: option A (add the 8 ids to the design's unkeyed list, K3944) clears them; B or C changes R11 or R23. Until then checks/run.mjs keeps 8 ooxml findings and my COMPLETE would not meet the words rule. No code is changed; format, architecture and ownership read 0 failures. Waiting on your choice.

## J3 · COMPLETE

T51-248 ooxml (words, K3949): complete on BOB's ruling (B2, K3955).

Entries applied: T51-248. No code changed. The 8 `signals` strings of `discriminate` (ooxml.mjs:773, 834, 854, 927, 929, 933, 965, 978) are diagnostics no member reads, every consumer reads `why`. They are handed to the design stream for the `unkeyed` list (words-reads.json, ooxml) and accepted by name in K3955. Until that lands on tranche/T51, checks/run.mjs keeps these 8 as words findings.

Deferred: none. Found in another module: none.

Checks (civicos-process ebcc1a3, against /home/user/bio):
- format: 0 failures
- architecture: 0 failures
- ownership ooxml tranche/T51..job/T51/ooxml: 0 failures
- words: 8 ooxml findings, the 8 named above, accepted by name in K3955 pending the unkeyed list
- coverage: 33 failures repo-wide, none attributed to ooxml in the output

Tests: none run (no module code changed).

Size (session_01DQhDYhUjhzaGm67YZSpeDZ): test runs 0, module lines 0

## J4 · QUESTION

QUESTION (R-NOTMET: the smallest thing I need). R6, R30, R31 and R35 take every ceiling through `boundOf`, but `read-bounds.mjs` (runtime-limits' alone, START ruling 1) has no row for three ceilings this module keeps, so `boundOf` would throw at import. I need these three rows added to the table before I can commit the import; I carry on with everything else meanwhile, on a local uncommitted copy of the rows, and will not commit it.

Rows (kind, name, standard, alpha, protective, key), all as `bytes(alpha, key, MB100)` in the table's own helper (K4845: documents 100 MB, the alpha where it is above):
1. `office`, `text_bytes`: alpha 20,971,520 (20 MiB; R6 `MEASURED_OOXML_TEXT_BOUND_BYTES`), standard 104,857,600, protective 104,857,600, key `limit.office.text_bytes`.
2. `office`, `streamed_text_bytes`: alpha 33,554,432 (32 MiB; R35 `STREAMED_TEXT_BOUND_BYTES`), standard 104,857,600, protective 104,857,600, key `limit.office.streamed_text_bytes`.
3. `archive`, `member_bytes`: alpha 268,435,456 (256 MiB; R30 `MEMBER_MAX`), standard 2,147,483,648 (the archive unpacked standard, one member cannot exceed the archive), protective 2,147,483,648, key `limit.archive.member_bytes`.

The other nine ceilings I keep have rows already: archive.members, unpacked_bytes, ratio, directory, name, depth; office.entries. ARCHIVE_TREE_TOTAL_MAX and ARCHIVE_TREE_ENTRIES_MAX I take from archive.unpacked_bytes and archive.members (same figures). If you prefer other names or figures, tell me; I will use what you add.

## J5 · QUESTION · re J4

QUESTION (replaces J4; R-NOTMET: the smallest thing I need). R6, R30, R31 and R35 take every ceiling through `boundOf`, but `read-bounds.mjs` (runtime-limits' alone, START ruling 1) has no row for five ceilings this module keeps, so `boundOf` would throw at import. I need these five rows added to the table before I can commit the import. I carry on meanwhile on a local, uncommitted copy of the rows and never commit it.

Rows (kind, name: standard / alpha / protective; key `limit.<kind>.<name>`), the byte rows as the table's own `bytes(alpha, key, MB100)` helper (K4845):
1. `office`, `text_bytes`: 104,857,600 / 20,971,520 / 104,857,600. R6 `MEASURED_OOXML_TEXT_BOUND_BYTES` (20 MiB).
2. `office`, `streamed_text_bytes`: 104,857,600 / 33,554,432 / 104,857,600. R35 `STREAMED_TEXT_BOUND_BYTES` (32 MiB).
3. `archive`, `member_bytes`: 2,147,483,648 / 268,435,456 / 2,147,483,648. R30 `MEMBER_MAX` (256 MiB alpha; a member cannot exceed the archive's unpacked standard).
4. `office`, `structural_part_bytes`: 8,388,608 in all three columns. NEW, my own, for DOCS O6 (G125d: a 100 MiB `.rels`, a 20 MiB `[Content_Types].xml`, which a ratio check alone passes at about 1,000:1): the XML parts this module itself decodes (`[Content_Types].xml`, `*.rels`, `docProps/core.xml`, `mimetype`) are refused by declared size, before inflation, above it. A real one is kilobytes (a 5,000-slide deck's `[Content_Types].xml` is about 1 MB). The refusal is `STRUCTURAL_PART_MAX` with name, declared, limit, `final: true`, stated by each caller as any other `readPart` refusal. I will propose the wording for R5/R31 in my record.
5. `office`, `piece_chars`: 8,388,608 in all three columns. R35's "carrying at most 8 MiB" before `piece_unbounded` (today the literal `TEXT_PIECE_MAX_CHARS`).

The other ceilings have rows already: archive.members (ARCHIVE_ENTRIES_MAX and ARCHIVE_TREE_ENTRIES_MAX), archive.unpacked_bytes (ARCHIVE_TOTAL_MAX and ARCHIVE_TREE_TOTAL_MAX), archive.ratio, archive.depth, archive.directory, archive.name, office.entries. If you prefer other names or figures, tell me; I use what you add.

## J6 · COMPLETE

COMPLETE · round 9 (B3, B5, B7). Causes, each with its failing-first test (round9.test.mjs, seen RED on the old source: 24 of 26 failed, e.g. `RangeError: Invalid code point 1114112` at String.fromCodePoint; `decodeText is not a function`; `1972 against 69` fetches for the shuffled listing; the unterminated-tag part 9.4 s) then green (99 of 99 in the module):
- G131g (R36): `decodeText` exported, owner; every part this module decodes goes through it; `readPartPieces` decodes by BOM/layout/prolog (ENCODING_UNSUPPORTED named).
- G133c (R37): bad numeric references and lone surrogates make core/rels/content-types unparseable, final, never a throw; tag scan is linear.
- G125d, G125h (R3, R5, R31): OFFICE_ENTRIES_MAX, ARCHIVE_DIRECTORY_MAX, ARCHIVE_NAME_MAX in `readContainer`; ratio check in `readPart`; MEMBER_ENCRYPTED; new STRUCTURAL_PART_MAX (8 MiB, K4859) for the XML parts the module decodes itself.
- G124c part, G124g, G124 quotes (R6, R30, R35): every ceiling through `boundOf`, no literal; `final: true` on every refusal carrying `limit`.
- G130e (R10): dotx, potx, ppsx rows. G130c (R11): `discriminate` and `readPart` take a range source; same answer as whole bytes, reads only structures.
- G133e (R38): local headers read in physical order; 10,001 entries refused.
- G126d: audit test per container kind (R7), already holding.
- B5: `readPartPieces` awaits the promise `onPiece` returns (test).
Proposed wording for BOB (R5/R31): readPart also answers MEMBER_ENCRYPTED, ARCHIVE_RATIO_MAX and, for the structural XML parts, STRUCTURAL_PART_MAX {name, declared, limit}; every refusal that carries `limit` also carries `final: true` (R31's literal shape lacks it). R23: the one import is `./read-bounds.mjs` (`boundOf`). R11: a range source that cannot be read answers `source_unreadable`. R3: entries carry a non-enumerable `flags`. ARCHIVE_LIMITS gains OFFICE_ENTRIES_MAX, ARCHIVE_DIRECTORY_MAX, ARCHIVE_NAME_MAX; STRUCTURAL_PART_MAX exported. Uppercase `&#X` is not an XML reference and is refused. xltx is not in R10 and is not read.
Deferred: none. Other modules: none. New files outside paths: none. Stale generated artifacts: none known.
Tests: module 99/99; users green: office-readers 115, odf-reader+format-registry 117, csv-reader+doc-clean+provenance+attestation 301 (1 skipped), capture-sources+site-profiles 117; file-safety R24 words and reading-pipeline BUDGET-2024-APP memory (2) are the named inherited/PDF reds; acquisition R95 passes alone.
Checks: format 0, architecture 0, coverage 38/38, ownership 0, words: no ooxml finding.
Size (session_0189TCqWsfgZ58Dcm8TZihQh): test runs 14, module lines 2480

## J7 · COMPLETE

COMPLETE · B8 (R36 amended, G169, K4985).
Cause: `sniffEncoding` (ooxml.mjs) sent any undeclared text that is not wholly valid UTF-8 to windows-1252, so UTF-8 with one stray byte read 'Å“uvre' for 'œuvre'. Fix: new `mostlyUtf8(b)`; such bytes stay UTF-8 (`assumed: true`, replacements counted) when valid multi-byte sequences number at least four times the invalid bytes (each byte outside a well-formed sequence counts one, a cut-off tail included); else windows-1252 as before.
Why missed: the R36 detection was all-or-nothing, with no case of a single stray byte in a mostly-UTF-8 text.
Red first: round9.test.mjs, test "R36 decodeText keeps undeclared UTF-8 with stray bytes ... (G169)" failed on the old source (windows-1252 against utf-8), now passes: stray 0xFF mid-text (replaced 1, other characters true), cut-off tail, boundary (4 sequences to 1 invalid byte is UTF-8, 3 is windows-1252); controls: real Latin-1 and 1 valid to 1 invalid stay windows-1252, declared encodings unchanged.
Platform check: none (pure function; no platform figure applies).
Deferred: none. Found in another module: none. Rows owed (words): none.
Tests: ooxml 100/100. Users of decodeText run: format-registry 60/60; csv-reader, odf-reader and office-readers all test files green (the only failures listed were worker/child helper scripts my glob wrongly handed to the runner, not tests). `impact.mjs origin/tranche/T51 HEAD`: 130 of 176 modules, 2144 of 2684 test files (ooxml is a base module); I ran the direct decodeText users only.
Checks (civicos-process): format 0 failures; architecture 0; coverage 0 (38 of 38 ids); ownership 0; words: no ooxml finding in run.mjs.
Size (session_012TKKHe5Adb9PswRVKrEcj8): test runs 6, module lines 28
