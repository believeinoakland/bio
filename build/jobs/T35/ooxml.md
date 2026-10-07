# ooxml (T35)

**Status** · session_014EpXPcr4nfcapzqQAhZ57c · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two readings to confirm (I carry on with both as stated; neither stops the job).

(1) R23 vs R29. R23 says hashing is `crypto.subtle.digest`; R29 asks for `sha256` "computed as the bytes pass", and the Suggestion says `streamMember` holds no more than one read window and one inflate chunk. `crypto.subtle.digest` is one-shot, so honouring R29 with it means holding the whole member (up to MEMBER_MAX, 256 MiB, in a 128 MB Worker). My reading: `streamMember` hashes incrementally with the host's `crypto.DigestStream` where it exists (workerd), and otherwise with a SHA-256 written in the module itself (no import, so R23's "zero runtime dependency" holds), tested byte-for-byte against `crypto.subtle.digest`; `readPart` and the image hashing stay on `crypto.subtle.digest`. Proposed R23 wording: "... hashing is `crypto.subtle.digest`, or for R29's streamed digest the host's `crypto.DigestStream` where it exists, else the module's own SHA-256, ...".

(2) R32's MS-OVBA decompression is inflation R31 does not name. My reading: each decompressed stream (`VBA/dir` and each module's source) is capped at `MEMBER_MAX` like any part, and over it answers the stream's own failure name (`vba_dir_unreadable`, `module_source_undecompressable`). No new limit name.

## J2 · QUESTION

One reading to confirm (new; J1 is answered by K1918). I carry on with it; it does not stop the job.

R27: "With a range source it reads only those structures, never an entry's compressed data." R28's `several_eocd_candidates` requires scanning every offset of R3's end-record window (the last 22 + 65,535 bytes) for the signature, so the listing's first read is that whole window, and for an archive under ~64 KiB (or one whose last members sit in its last 64 KiB) the window covers member data. My reading: R27's "never" governs every read after that window; the window itself is R28's structure. For a 256 MiB archive in 8 MiB parts the listing reads the 64 KiB tail, the ZIP64 records, the directory and each local header (and descriptor), never a member's data, which keeps the purpose. Proposed R27 wording: "... it reads only R3's end-record window and those structures, never an entry's compressed data outside that window, ...". The suite asserts exactly that.

## J3 · COMPLETE

**T35-8 applied** (N688; K1844, K1852, K1881, K1888, K1903; readings K1918, K1925). `bio-plane/src/ooxml.mjs` 1,003 → 2,017 lines.
- **R3** `readContainer` reads ZIP64: the locator directly before the EOCD and the end record it names (which must end exactly at the locator; disk 0, at most one disk), and each record's `0x0001` extra field for the fields it holds as sentinels; anything absent, malformed or over 2^53 is `zip64_record_invalid`. `zip64_unsupported` is gone.
- **R10, R11** the nine macro-enabled rows (docm, dotm, xlsm, xltm, xlam, pptm, potm, ppsm, ppam) between the plain OPC rows and the ODF rows, each read as its plain twin; every flavour answer now carries `variant` (the row's, or null). `OOXML_FLAVOURS` stays the three plain rows.
- **R27, R28** `listArchive(bytes | {size, read})`: exact-end EOCD candidates (two or more: `several_eocd_candidates`), ZIP64 read when its locator is present and required on a sentinel (fields stated by both must agree), `ARCHIVE_ENTRIES_MAX` before the walk, every record, every local header cross-checked (name bytes, method, flags; CRC and sizes through the local ZIP64 field, or the signed/unsigned 32/64-bit descriptor under bit 3), CP437 names (checked against Python's codec over all 128 high bytes), `path_unsafe`, `kind` (Unix symlinks from the external attributes), DOS time or null, verdicts in R28's order, `limit` on a limit row; then `directory_disagrees_with_eocd` (records not filling the directory, or bytes between it and the end records), `entry_out_of_range`, `entries_overlap`; `ARCHIVE_TOTAL_MAX` as the archive's verdict with `limit`. A range source answers identically and, past R3's window (K1925), reads only structures.
- **R29** `streamMember(source, row) → {chunks, done}`: 1 MiB windows, stored data copied through or deflate through `DecompressionStream("deflate-raw")`, CRC-32 and SHA-256 as the bytes pass (the host's `crypto.DigestStream` where present, else the module's own FIPS 180-4 SHA-256; K1918); `MEMBER_CORRUPT` with `over_declared_size` (stops at the first output past the declared size), `size_mismatch`, `crc_mismatch`, `inflate_failed`, `stream_end_mismatch` (the inflater fails after the whole verified member came out: trailing bytes or no final block); `source_unreadable`; a non-ok row refused by its verdict (with `limit`) without a read. A consumer that stops early: the rest is read and verified unyielded, so `done` still answers. A non-row argument answers `row_invalid` (outside the contract; never thrown).
- **R30** the seven limits exported by name and as the frozen `ARCHIVE_LIMITS`.
- **R31** `readPart` refuses `MEMBER_MAX` (the member's declared size) then `ARCHIVE_TOTAL_MAX` (the container's declared total, summed once per container) before any inflation; every caller states it as its own refusal (checked through discriminate, walkRels, readCoreProperties, withContainerImages, readVbaProject).
- **R32, R33** `readVbaProject`: MS-CFB v3/v4 (header, DIFAT, FAT, mini FAT, every stream chain and the directory tree walked with loop and range checks: `cfb_invalid`), `VBA/dir` decompressed per MS-OVBA §2.4.1 (each copy token checked against its chunk; each decompressed stream capped at `MEMBER_MAX`, K1918 (2)) and its records read (`vba_dir_absent`, `vba_dir_unreadable`), each module's source from its offset (`module_stream_absent`, `module_source_undecompressable`, listed and in `undetermined`), names matched as olevba's `(?i)\b…\b`. Tables: olevba 0.60.2's plain-string `AUTOEXEC_KEYWORDS` and `SUSPICIOUS_KEYWORDS` in order (its temporary `Auto_Ope` left out), then R33's four additions (`XMLHTTP`, `WinHttpRequest`, `URLDownloadToFile`, `RegWrite`). Nothing is run; p-code is not read.

**Tests** (`bio-plane/test/m/ooxml/`): `ooxml.test.mjs` (R1–R26, R31; R3, R10, R11, R22, R23, R25, R26 extended), new `archive.test.mjs` (R27–R30), new `vba.test.mjs` (R32–R33), new helper `cfb.mjs` (an MS-CFB, `dir` stream and MS-OVBA compressor writer from the specifications). Archives from test-support's `makeZip` (K1919). Oracles present here and run, none skipped: Info-ZIP UnZip 6.00 `unzip -t`, Python 3 `zipfile` (names, offsets, methods, CRCs, sizes, times, extracted SHA-256), olevba 0.60.2 (module streams, auto-run and suspicious names, the tables themselves). `node --test bio-plane/test/m/ooxml/`: **tests 57, pass 57, fail 0, skipped 0**. Every module that uses ooxml, before and after: office-readers 89/89, odf-reader 69/69, format-registry 27/27, public-read 131/131 (and reading-pipeline 85/85, capture-sources 82/82): no change. No layer tests in the manifest.

**Checks** (civicos-process, on the merged head d3b55d7093): format 0 failures; architecture 0 failures; coverage 33 of 33 live ids named, 0 failures; ownership 6 files, 0 failures.

**Generated artifact staled (mechanics §14):** `bio-plane/dist/bio-plane.bundled.mjs` now also has `src/ooxml.mjs` stale (fleetbundles' bio-plane arm, already accepted red 15 until L1's close regenerates). No other bundle embeds ooxml.

**For office-readers and format-registry:** discriminate's flavour answers carry `variant` (null for plain rows); a macro-enabled file now discriminates as its twin instead of `opc_main_part_unrecognized`; `readPart` can answer `MEMBER_MAX` / `ARCHIVE_TOTAL_MAX` (with `declared`, `limit`).

**Deferred:** none. **Found in other modules:** none.

Size (session_014EpXPcr4nfcapzqQAhZ57c): test runs 24, module lines 2017
