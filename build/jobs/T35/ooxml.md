# ooxml (T35)

**Status** · session_014EpXPcr4nfcapzqQAhZ57c · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two readings to confirm (I carry on with both as stated; neither stops the job).

(1) R23 vs R29. R23 says hashing is `crypto.subtle.digest`; R29 asks for `sha256` "computed as the bytes pass", and the Suggestion says `streamMember` holds no more than one read window and one inflate chunk. `crypto.subtle.digest` is one-shot, so honouring R29 with it means holding the whole member (up to MEMBER_MAX, 256 MiB, in a 128 MB Worker). My reading: `streamMember` hashes incrementally with the host's `crypto.DigestStream` where it exists (workerd), and otherwise with a SHA-256 written in the module itself (no import, so R23's "zero runtime dependency" holds), tested byte-for-byte against `crypto.subtle.digest`; `readPart` and the image hashing stay on `crypto.subtle.digest`. Proposed R23 wording: "... hashing is `crypto.subtle.digest`, or for R29's streamed digest the host's `crypto.DigestStream` where it exists, else the module's own SHA-256, ...".

(2) R32's MS-OVBA decompression is inflation R31 does not name. My reading: each decompressed stream (`VBA/dir` and each module's source) is capped at `MEMBER_MAX` like any part, and over it answers the stream's own failure name (`vba_dir_unreadable`, `module_source_undecompressable`). No new limit name.
