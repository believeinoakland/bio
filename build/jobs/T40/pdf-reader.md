# pdf-reader (T40)

**Status** · session_01KA1AV3RDoRZjWqoUbFgBdC · depth 2 · WORKING · handled B0

## J1 · QUESTION

R38's `raw` is "the string's bytes exactly as the file states them (a literal's escapes … decoded, per the PDF syntax)". ISO 32000-1 §7.3.4.2 also says an end-of-line written inside a literal string without a backslash (CR, LF or CR LF) is read as one byte 0x0A. That rule turns a raw CR inside a binary literal (an encryption /O or /U, an /ID written as a literal) into 0x0A, so `raw` would then differ from the bytes physically between the parentheses.

My best reading, which I am building: `raw` follows the PDF syntax, so an unescaped CR, LF or CR LF becomes one 0x0A, because that is the string's value to every conforming reader and so to anything that writes `raw` back. The escape rules follow the standard too: `\` + EOL is a line continuation (CR LF counts as one EOL), and an unknown escape `\x` keeps `x` (today the parser drops both characters). The other reading is to keep every unescaped byte as written, CR included. Tell me if you want that one.

Found while reading (fixed in this job, my module): the parser decodes with `TextDecoder("latin1")`, which is Windows-1252, so bytes 0x80–0x9F come out as other code points (0x80 → U+20AC). That affects string text and shown-text codes in that range, and it makes R38's "one code unit per byte" false today. I am replacing it with a byte-transparent decode. `v` changes only for strings holding bytes 0x80–0x9F, and only to what R38 states.
