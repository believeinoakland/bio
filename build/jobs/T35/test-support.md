# test-support (T35)

**Status** · session_016FG9ULYTRSS3dhqvhVKfG6 · depth 2 · WORKING · handled B2

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
