# test-support (T35)

**Status** · session_016FG9ULYTRSS3dhqvhVKfG6 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Readings of R10–R14 I am building on (carrying on; none blocks the job). Say if any is wrong.
1. **R11 and the empty archive.** Info-ZIP `unzip -t` exits 1 on an archive with no entries ("zipfile is empty", UnZip 6.00). I read R11 as holding for conforming archives with at least one entry, methods 0 and 8; the empty archive is still tested under R10 and against Python's `zipfile`. A wording fix for R11 ("with at least one entry") would be yours.
2. **Encrypted entries (R12).** The data is written as given: not deflated, not encrypted; CRC-32 and sizes true over it. `"aes"` writes method 99 in both headers, an AE-2 `0x9901` extra naming the entry's declared method, and also sets bit 0 (APPNOTE requires it for AES).
3. **`sameDataAs` (R12, R14).** The entry writes no local header or data; its central record states the earlier entry's method, flags (bit 11 from its own name), CRC-32, sizes and extra fields under its own name, and its own `central` override applies. `data` is not required on such an entry (R13's "without data" means an entry that writes data).
4. **`options.zip64` sentinels.** The end record's entry counts are 0xFFFF and its CD size and offset 0xFFFFFFFF; its two disk-number fields stay 0.
5. **Entry `zip64` with `dataDescriptor`.** Local sizes 0xFFFFFFFF with zeros in the extra field; the descriptor's sizes are 8 bytes.
6. **`secondEocd`.** The candidate is appended to the end of the comment, states what the real end record states, with comment length 0, so it ends exactly at the archive's end.
7. **Time.** The fixed time is 1980-01-01 00:00:00; an entry may give its own as `dosDate`/`dosTime`.
8. **R13 errors beyond the listed three:** an override key makeZip cannot write, `descriptor` without `dataDescriptor`, `zip64Record` without `options.zip64`, and an out-of-range field value each throw an `Error` naming the field.

## J2 · COMPLETE

**T35-3 applied** (N688; K1844, K1852, F7). `bio-plane/test/make-zip.mjs` (337 lines, new): `makeZip(entries, options)` writes conforming archives in APPNOTE 6.3's form (R10) and every R12 hostile shape by override: duplicate names, verbatim unsafe names and `utf8: false` CP437 names, `local`/`central` disagreement (with `localOffset` out of range), bit 3 with `descriptor` overrides and `signature: false`, entry and archive ZIP64 with `zip64Record`, the four `encrypted` kinds, `sameDataAs` overlap, `eocd`/`comment`/`secondEocd`, and nesting. Deterministic, no clock, randomness or disk, import without side effect; unwritable specs throw naming the field (R13). `zipBomb` and `nestedZip` (R14) are built on `makeZip` alone. Readings J1 1–8 as accepted in B2 (K1917). Clears accepted red 13.

**Tests** (`bio-plane/test/m/test-support/make-zip.test.mjs`, 17 new, named R10–R14): every archive read back by Python `struct` (each record's bytes), Python `zipfile` and Info-ZIP `unzip -t` (UnZip 6.00, Python 3.13.16; both present in this container, none skipped). Field overrides checked byte for byte: only the named field's bytes change. `node --test test/m/test-support/` (bio-plane): **tests 42, pass 42, fail 0, skipped 0**. No layer tests named in the manifest; no module uses make-zip yet (ooxml, T35-8, codes against it).

**Checks** (civicos-process): format 2 failures, both bundler's (`bio-plane/scripts/release-advisories.mjs`, `third-party.json` in its `paths` name no file yet; K1900, its job's to create), none test-support's; architecture 0 failures; coverage 14 of 14 live ids named, 0 failures; ownership 3 files, 0 failures.

**Deferred:** none. **Found in other modules:** none (bundler's two format failures above are its pending T35-6 files, not a flaw).

Size (session_016FG9ULYTRSS3dhqvhVKfG6): test runs 6, module lines 721
