# ZIP support: the architecture, kept at the highest grade

**Status** · DRAFT research for BOB #125, 2026-10-06, on `tranche/T34` (read-only; nothing built, measured or ruled). Bob asked: "Research the proper architecture for adding zip support — paying particular attention to keeping the grade as high as possible."

## Summary

1. The archive is filed exactly as any capture is today. It is kept byte-identical, and its grade comes from how it was fetched (B direct, C from an archive replay, an authored letter through the doorbell).
2. Each member becomes a capture of its own: its own SHA-256, stored content-addressed, and read by the existing readers unchanged. Its provenance names the archive's digest, its central-directory index, path, method, CRC-32, sizes and offset, and its own digest.
3. A member inherits the archive's capture grade **in full** whenever it can be cut out unambiguously. Unpacking loses nothing and adds nothing (deflate is lossless, the size and CRC are checked, the digest is recomputed), and any outsider can repeat it with `unzip -p archive.zip path | sha256sum`. An ambiguous or malformed member is never given a lower grade: it is not filed at all, and the reason is named.
4. No new product module is needed. The ZIP walk is added to `ooxml` (layer 1, already "the one dependency-free container reader"), a `zip` entry to `format-registry`, the unpack act to `acquisition` (layer 3), and one new route (`unpacked`) to `provenance.captureGrade`.
5. Bob decides three things: the doctrine sentence that a member inherits its archive's grade and co-attestation; whether members are unpacked automatically; and whether a member's grade may ever be raised by a fetch of its own. Roughly 1,100 lines of code and 900 lines of tests, over two layers.

## The grade today

- **Two axes, and the grade lives on one.** The grade is "entirely on the capture-chain axis; it grades the copy's verifiability, never the source's credibility" (`docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3). The ladder: A = WACZ/chain-of-custody capture (no route builds one; deferred, DEC-81 item 4, `docs/development/GRADE-A-CAPTURE.md` §0); B = "bytes as fetched by a capable surface, hashed at receipt, with locator and instant"; C = reference only. A **co-attested B** (an RFC 3161 token over the digest, plus a third-party co-archive of the locator) is sufficient to publish (DEC-81, §3). Upgrades are accretive adds (§3).
- **What earns a rung is the route, read from the plane's own receipt.** `provenance` R24: a direct receipt earns `EARNED_CAPTURE_CEILING` (B, `bio-plane/src/record-grammar/grades.mjs`:98). R25: archive replay only earns `ARCHIVE_CAPTURE_GRADE` (C). R26: no receipt means the member's authored letter, "stated as authored, never as measured", and a `via` no ruling names answers `CAPTURE_GRADE_VIA_UNRULED`, undetermined. R27: testimony is D on its own axis. R51: doorbell material is "received, not fetched" and gets no fetched letter. `acquisition` R18 stamps `capture.grade` from that one rule. `sources` R17 caps a member-keyed capture one rank lower.
- **Who fetched, from where, when.** `acquisition` R9 (host governor, a named user agent), R13 (one receipt per address, `via`, retrieval locator), R14 (`transport`: status, every header, `peer_address: null` with the reason: no TLS or IP evidence today), R16 (`provenance_chain`, the first hop "these bytes were served for <locator> at <retrieved>", `bound: false`), and R20 with `attestation` R1–R3 (a timestamp and a co-archive at every capture). `attestation` R4: an archive-sourced capture gets the instance's signed receipt.
- **Bytes and identity.** `acquisition` R10: hashed as they arrive, stored content-addressed in 8 MiB parts, each under its own SHA-256, with a 256 MiB cap (`TOO_LARGE`). R26: "the raw bytes as served are the primary evidence … never rewritten; every derived artifact … is separate and says so." R27: every provenance fact is derived by the act, never handed in. `provenance` R1–R2: one register row per `capture_sha`, one capture, one home (C-53.13). R35: "the register is the only thing that proves bytes"; R15: only the plane's own acts write receipts. R45 (C-18.6): stored bytes must hash to the recorded digest. R43 (C-18.3): one capture appears once in a register. R6–R7 and Intake §8: a capture held in parts.
- **How derived things inherit or cap.** The content's *derivation cap* is separate from the document's capture grade, and "a leg citing the content may claim no more than the weaker of the two" (`docs/architecture/BIO_Content_Framework_v0_10.md` §14.2). `text-chain` R13/R85 (a chain only weakens), R58–R60 (`captureBound`: transcription bounds the capture axis, never above `byteGrade`), R56 (only a member's attestation reaches `EARNED_CAPTURE_CEILING`). `ocr-worker` R8 (OCR is fixed at C). `extraction` R44, `reading-pipeline` R20 (DEC-4: no machine mints a grade). The precedent closest to ZIP is the Drive export (DEC-75; `capture-sources` R42–R43): the capture grade follows the **fetch path** and stays B, while Google's *conversion* is a text derivation step whose cap is undetermined. `strength` R1, R9 and R19: a document leg is bounded by what its target earns, and nothing is shown as Grade A.
- **ZIP today.** `ooxml` R3 walks the central directory as "sole authority" and refuses ZIP64 (`zip64_unsupported`), multi-disk and truncation by name. R5 returns a member only after its size and CRC-32 check against the central directory, and only for stored (0) or deflate (8). R24: local headers are used to locate bytes, never trusted for size or CRC. R11: a plain ZIP answers `{ok:true, format:"zip"}` (Bob's brief says R6; R6 is the size constant). Nothing opens it further: `format-registry` R23 registers no `zip` entry. R20–R21 are the precedent for addressing a member by the SHA-256 of its verified bytes, never by its file name. Measured demand: 42 `.zip` keys among the 43,283 assets of the Oakland asset census (`docs/development/MEASUREMENTS.md`:11239). The doctrine already requires "every path validated against traversal before any write" when ingesting bags (Intake §3c, F7).

## Outside facts

- **APPNOTE** (PKWARE `.ZIP` Application Note 6.3.x, https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT):
  - The central directory at the end is the archive's index (§4.3.6). Local headers can be stale or zeroed when general-purpose bit 3 is set, with the sizes and CRC carried in a trailing data descriptor (§4.3.9).
  - The CRC-32 is an error check, not a cryptographic proof.
  - ZIP64 (§4.3.14, §4.5.3) carries 64-bit sizes and offsets in the 0x0001 extra field when a 16- or 32-bit field holds 0xFFFF or 0xFFFFFFFF. Some writers emit it even for small archives.
  - Encryption: traditional PKWARE encryption is flagged by bit 0; strong encryption by bit 6; WinZip AES uses method 99 with extra field 0x9901; bit 13 encrypts the central directory itself.
  - Names: UTF-8 when bit 11 is set, otherwise IBM code page 437 (Appendix D). `ooxml` R3 decodes non-UTF-8 names as Latin-1, a small deviation. Info-ZIP's Unicode Path field 0x7075 is valid only when its CRC matches the header name.
  - A stored path "MUST NOT contain a drive or device letter, or a leading slash", and uses forward slashes (§4.4.17). Times are MS-DOS local time with no zone.
  - Other methods (9 deflate64, 12 bzip2, 14 LZMA, 93 zstd, 95 xz) exist.
- **Parser differentials and duplicates.** Two entries with the same name, or a local header that disagrees with the central directory, make different tools extract different bytes. Android's "Master Key" bug was exactly this (duplicate names, CVE-2013-4787, https://nvd.nist.gov/vuln/detail/CVE-2013-4787).
- **Zip slip.** Entry names with `../` or absolute paths write outside the target directory (Snyk, 2018, https://github.com/snyk/zip-slip-vulnerability).
- **Zip bombs.** One deflate stream expands at most about 1,032:1. Fifield's non-recursive bomb overlaps many central-directory entries on one compressed kernel: 42 kB to 5.5 GB, 10 MB to 281 TB, 46 MB to 4.5 PB with ZIP64. The defence is to refuse overlapping entries and to bound the output actually inflated, never only the declared size (D. Fifield, "A better zip bomb", WOOT '19, https://www.bamsoftware.com/hacks/zipbomb/). Recursive bombs (42.zip) are stopped by a depth bound.
- **Archival practice.**
  - The Library of Congress format description notes that the wrapper is usually "discarded after successful extraction", which loses the relationships between files. It treats the central directory as the format's self-documentation (https://www.loc.gov/preservation/digital/formats/fdd/fdd000354.shtml).
  - PREMIS 3.0 records a member as a **structural** part of its container ("is part of" / "has part"), distinct from a **derivation** ("has source"), and counts nested encodings by `compositionLevel` (https://www.loc.gov/standards/premis/v3/; relationship vocabulary at https://id.loc.gov/vocabulary/preservation/relationshipSubType.html).
  - WARC (ISO 28500) keeps a fetched ZIP as one `response` record with its payload digest. Anything made from it is a separate `conversion` record that names its source by `WARC-Refers-To` (https://iipc.github.io/warc-specifications/specifications/warc-format/warc-1.1/).
  - BagIt (RFC 8493, https://www.rfc-editor.org/rfc/rfc8493) verifies every payload file against `manifest-sha256.txt` in one step, which Intake §3c already adopts.
  - NARA's Digital Preservation Framework rates formats and plans actions per format (https://www.archives.gov/preservation/digital-preservation/risk; https://github.com/usnationalarchives/digital-preservation). Its specific ZIP plan was not read here [UNVERIFIED].
- **Evidence practice.** A hash recorded at collection proves identity (FRE 902(14) note: "identical hash values for the original and copy reliably attest" that they are duplicates, https://www.law.cornell.edu/rules/fre/rule_902). The Berkeley Protocol ¶153–156 asks that collection keep native format and document every transformation (https://www.ohchr.org/sites/default/files/2024-01/OHCHR_BerkeleyProtocol.pdf). Applied to an archive: the archive's digest (fixed at the fetch, timestamped) plus a recorded `(archive digest, entry index, offset, path, member digest)` lets anyone re-derive the member and confirm its digest. The member's custody is therefore the archive's custody, as long as the cut is deterministic and unambiguous.

## Proposed architecture

1. **The archive is the capture.** `op=acquire` files a ZIP exactly as today (`acquisition` R10, R13, R16, R18, R20): stored as served, in parts, with its receipt, grade and co-attestation. Nothing about the ZIP is rewritten or normalised.
2. **A validated listing (layer 1, pure).** `ooxml` gains `listArchive(bytesOrRanges)`, which reads the EOCD (and ZIP64's EOCD locator and record) and then the whole central directory. It answers one row per entry: `{index, name_raw (hex), name, name_encoding, method, flags, crc32, compressed, uncompressed, local_offset, data_offset, dos_time, kind: file|dir|symlink, encrypted, verdict}`. It also cross-checks every local header against its central-directory row (name bytes, method, flags, and sizes and CRC unless bit 3; then the data descriptor). It refuses overlapping byte ranges, entries outside the archive, more than one EOCD candidate, and a central directory that disagrees with its EOCD. Because it reads only the end of the archive, it can run by range reads over the stored parts, so a 256 MiB archive is never held in a 128 MB Worker.
3. **A streaming cut (layer 1).** `ooxml` gains `streamMember(source, row)`. It inflates through `DecompressionStream("deflate-raw")`, hashes SHA-256 and CRC-32 as it goes, and **stops at declared size + 1**. It answers the member's digest only when the size, the CRC and the end of the stream all agree (R5's rule, streamed).
4. **The `zip` format entry.** `format-registry` registers `zip` (detect is `ooxml.discriminate` answering `format:"zip"`; its `parts` slot is `listArchive`). Office and ODF files keep winning detection first (`ooxml` R12–R13), so a `.docx` is never unpacked as a plain ZIP.
5. **The unpack act (layer 3, `acquisition`).** `unpack(store, {archiveSha, by})` runs after an acquire whose profile says `zip`, and as `op=unpack` for a ZIP already held. For each entry the listing passes, it streams the member into the evidence store under its own digest (parts of 8 MiB, as R10) and writes one receipt through `provenance.recordReceipt`. That receipt has `via: "unpacked"`, address `<archive document address>#zip:<index>`, and retrieval locator `zip:<archiveSha>!<index>`. Only the plane's own act writes it (`provenance` R15 gains this writer).

   It answers one provenance document per member: `capture.method: "unpacked"`, its `grade` from R7 below, and `container: {archive_sha256, index, path, name_raw, method, crc32, compressed, uncompressed, local_offset, member_sha256, dos_time_stated}`. Its first hop is "these bytes are entry <index> (<path>) of the archive <sha> this instance holds, cut out and verified by size and CRC-32 on <instant>"; the archive's own hop and receipt are cited, never copied. Like `acquire`, it writes no bundle (R25). The members are promoted at `collected` into the **archive's bundle** beside it, so the batch-release rules (Intake §4) apply to them as a set.
6. **Reading.** Every member is an ordinary capture, so `reading-pipeline` reads a PDF, DOCX or CSV member through its existing entry, with no change. Its text chain starts at the member's bytes: unpacking is **not** a text derivation step (no `text-chain` kind). It reverses a public, lossless encoding of the publisher's own bytes, unlike DEC-75's Drive conversion, which is a third party's re-rendering. The archive's own "reading" is its listing (`container_extent: {entries, filed, refused}`).
7. **The grade.** `provenance.captureGrade` gains route `unpacked` (one new R): the member's answer is the archive's answer, recursively to a depth bound, with `route: "unpacked"`, `determined` as the archive's, and a `basis` naming the archive. Whatever the archive's route earned, B, C, an authored letter or an undetermined grade, passes through **unchanged**: never stronger, never weaker. Co-attestation is inherited the same way. `attestation.attestationsOf(member)` answers the archive's timestamp and co-archive as `inherited: {from: archive_sha, through: entry}`. The token proves that the archive existed, and so does every byte deterministically inside it.
8. **One home and corroboration.** A member whose bytes the record already holds (the same PDF fetched directly elsewhere) is not filed twice. `provenance` R2's one-home rule stands, and the `unpacked` receipt is recorded as a corroborating observation on the existing home (Intake §8, ring-once). That is a second, independent route to the same bytes.
9. **Publication.** A published case citing a member carries the archive, the member and the `container` record in its bag. The outsider's check is the bag's `manifest-sha256.txt`, then `unzip -p <archive> <path> | sha256sum` against the member's digest, then `openssl ts -verify` on the archive's token. Every step uses a stock tool (Intake §3b).

## Grade rules for members

| Condition (from the validated listing and the cut) | Member's capture grade | Filed? |
|---|---|---|
| Stored (method 0), size and CRC-32 agree, central directory and local header agree | The archive's grade, in full | yes |
| Deflated (method 8), the same checks pass | The archive's grade, in full (deflate is lossless; method does not matter) | yes |
| Bit 3 (data descriptor), with the descriptor agreeing with the central directory | The archive's grade, in full | yes |
| ZIP64 fields, read and consistent | The archive's grade, in full | yes |
| The archive is C (archive replay), authored (doorbell), or capped (`sources` R17) | That same letter or undetermined state, passed through | yes |
| Nested ZIP within the depth bound (the inner archive is itself a member) | The outer archive's grade, through each level | yes |
| Name not UTF-8 (CP437), or an unsafe path (`..`, leading `/`, a drive letter, `\`) | The grade in full. The **path** is stated as the archive's claim, raw bytes kept, and never used as a file path | yes |
| Two entries share a name, but their ranges are distinct and each verifies | Each in full, addressed by **index**. The path is stated "ambiguous: N entries share this name" | yes |
| DOS timestamp, comment, extra fields | No effect on the grade. Recorded as "stated by the archive, zone unknown", never as fact | n/a |
| CRC-32 or size mismatch, or the inflate fails | none: `MEMBER_CORRUPT` | no |
| Central directory and local header disagree (name, method, sizes or CRC) | none: `MEMBER_AMBIGUOUS` (another tool would extract other bytes) | no |
| Entries overlap, a range runs outside the archive, or there are several EOCD candidates | none: the whole unpack is refused, `ARCHIVE_AMBIGUOUS` | no |
| Encrypted (bit 0 or 6, method 99, or bit 13) | none: `MEMBER_ENCRYPTED` (listed, not cut) | no |
| Method other than 0 or 8 | none: `MEMBER_METHOD_UNSUPPORTED` (named, deferred) | no |
| Directory or symlink | none: listed only (a symlink's target is stated, never followed) | no |
| Over a limit (next section) | none: refused by the limit's name | no |
| The archive's own bytes fail C-18.6, or are no longer held | none: `ARCHIVE_NOT_HELD` | no |

There is deliberately no "lower letter" row. A member either is exactly what the archive deterministically contains, or the record does not call it a capture. A guess filed at C would be a grade a machine minted (DEC-4).

## Safety limits

The figures are BOB's, each published as a bound with its name (D-496's rule).
- `ARCHIVE_ENTRIES_MAX` = 10,000 entries.
- `ARCHIVE_TOTAL_MAX` = 256 MiB declared uncompressed in total: `acquisition` R10's cap, reused.
- `MEMBER_MAX` = 256 MiB per member.
- `ARCHIVE_RATIO_MAX` = 1,100:1 per entry. Above deflate's possible 1,032:1, so a declared ratio over it is malformed, not merely large.
- Inflate is guarded by **actual** output (stop at declared + 1); overlap is refused (Fifield).
- `ARCHIVE_DEPTH_MAX` = 3 levels of nesting.
- A per-call budget of members, with a continuation, in the same way `acquisition` R12 resumes supporting files.

No path is ever written to a file system: members live under their digest, which is why zip slip cannot happen here. Names are still validated, so that no surface renders `../` as a location. Members are untrusted data (Intake §4), and an AI session reading them follows the same rule.

## Where it lives

- **`ooxml`** (layer 1, pure, no record): `listArchive`, `streamMember`, ZIP64, CP437 names, overlap and local-header cross-checks, the limits. It is already the shared container reader (its Purpose), so this is new services in an existing module. That is BOB's call, not Bob's. Its name now under-describes it; a rename to `zip-container` is optional and BOB's.
- **`format-registry`** (layer 1): the `zip` entry (R23's roster goes from nine to ten).
- **`test-support`** (layer 1): `make-zip.mjs`, a fixture writer for hostile archives, beside `make-pdf.mjs`.
- **`provenance`** (layer 3): the `unpacked` route in `captureGrade`, the new receipt writer, and C-18.1 accepting `capture.method: "unpacked"` with a `container` block.
- **`attestation`** (layer 3): inherited attestations in `attestationsOf`.
- **`acquisition`** (layer 3): `unpack` and its auto-run after a `zip` acquire. It measures about 1,320 lines (its P6 note), so it stays well under 4,000 with about 450 more.
- **`control-plane` / `op-declarations`** (layer 11): route `op=unpack`.
- **`case-carriage` / `publication`** (layer 8): carry the archive with a cited member.

**No new product module.** If Bob prefers the unpack act as its own module (`archives`, layer 3, after `acquisition`), that is his decision under P17. I recommend against it: the act is acquisition's act applied to bytes already held.

## Requirement changes

- `ooxml`: new R for `listArchive`, R for `streamMember`, and R for the limits. R3 is amended (ZIP64 read rather than refused; CP437 rather than Latin-1, for the listing).
- `format-registry`: new entry R; R23's roster.
- `provenance`: new R (route `unpacked`, recursion, depth). R15's writers, R42's C-18.1 method and `container` block, and R48 (the receipt's `via` value) amended.
- `attestation`: R7 amended (inherited attestations).
- `acquisition`: new R (`unpack`, receipts, its refusals and checks table: C-row family, R29), R17 (the profile names `zip`), R25–R27 restated for members.
- `reading-pipeline` and `text-chain`: none (stated in their Suggestions: unpacking is not a derivation step).
- `strength`: none (it reads `captureGrade`).
- Canon: Intake Doctrine §3 gains one paragraph on members of a captured archive (Bob's, below).

## Cost and sequencing

| Piece | Code | Tests |
|---|---|---|
| `ooxml` listing, cut, ZIP64, CP437 and limits | ~450 | ~400 |
| `make-zip` fixtures (overlap, duplicate names, CD/LH mismatch, bit 3, ZIP64, encrypted, traversal, a bomb) | ~150 | — |
| `format-registry` entry | ~30 | ~40 |
| `provenance` route, C-18 | ~80 | ~120 |
| `attestation` inheritance | ~40 | ~60 |
| `acquisition` `unpack`, streaming to parts, continuation | ~450 | ~280 |
| ops and carriage | ~60 | ~60 |

That is about 1,100 lines of code and 900 of tests. It runs as a layer-1 job (ooxml, then format-registry), then a layer-3 job (provenance, attestation, then acquisition), then the layer-11 and layer-8 wiring. It fits one tranche. Its oracles are Info-ZIP `unzip -t` and Python's `zipfile` over the same fixtures.

**Deferred:**
- gzip (`.csv.gz`, a single member) is next and cheap: the same rules, and `DecompressionStream("gzip")` already exists.
- tar (an unpacked stream, the same structural rules; no CRC, so the member digest rests on the archive alone).
- 7z and rar: no dependency-free reader, and rar is proprietary. Recognised and named only.
- Methods other than 0 and 8.
- Decryption with a password a member supplies.
- Monitoring that compares the members of a changed archive.

## Open questions for Bob

1. **Does a member inherit its archive's grade and co-attestation in full?** This is doctrine (Intake §3). **Recommend yes**, under the table's conditions. Unpacking is a structural part-of relation (PREMIS), not a derivation. It is lossless, it is checked by size and CRC, and any outsider repeats it with stock tools, so §3b holds. A co-attested B archive therefore makes its members co-attested B, sufficient to publish under DEC-81. Anything ambiguous is not filed rather than filed lower.
2. **Unpack automatically, or only on a member's request?** **Recommend automatic, within the limits.** Every ZIP acquired is listed and its members filed at `collected` in the archive's bundle. Release stays per document or by batch (Intake §4), and an archive over a limit is listed with the refusal named and waits for a member.
3. **May a member later earn a grade the archive did not?** For example, the same PDF fetched directly while the archive came from an archive replay (C). **Recommend yes, by the existing accretive rule:** the direct receipt is its own route and earns B by itself (`provenance` R24), and nothing is regraded. The `unpacked` route only ever passes the archive's grade through.
