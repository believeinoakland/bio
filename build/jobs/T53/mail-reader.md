# mail-reader (T53)

**Status** · session_018Bhcefa3SdZX44kR48Ukpf · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

### Entries applied

- **T53-36** (N1266; K5435, K5437): the new module `bio-plane/src/mail-reader/`. EML (`mime.mjs`, `eml.mjs`), MSG through a compound-file reader of its own (`cfb.mjs`, `msg.mjs`), and MBOX split by streaming over a range source (`mbox.mjs`). Attachments are listed with a stable `index`, `size`, `inline`, `content_id`, and cut on request (`attachmentBytes`). An embedded Outlook message is listed as `message/rfc822`, read for the nesting count and not cut (`MAIL_ATTACHMENT_NOT_CUT`). Remote content is counted, never fetched (R5).
- **T53-37** (CAPABILITIES rows, ML7-ML12): `received[]` and `authentication_results` (`null` when absent, as N824's A1 asks); the four automatic-mail facts with `<>` kept distinct from `null`; `nesting_depth` counted over archives (via `ooxml`'s `listArchive`/`streamMember`) and messages together, refused above `nest_max`; every failure returned as `{ok: false, reason, detail, ...}`; the route bounds (address 25 MiB, upload 100 MB, mailbox 100,000 messages, mailbox bytes at the archive bound).
- R3's mailbox test reads a generated 500 MB mailbox (10,000 messages) by range, against `boundOf("archive", "uploaded_bytes")` as runtime-limits K5602 set it.
- R13: `emlEntry`, `msgEntry`, `mboxEntry` (`MAIL_ENTRIES`) in `format-registry`'s shape, with `plan`/`read` over `{size, readRange}`, detecting by content only.

### Readings taken (told to BOB)

- R10's count (accepted by BOB, J3): items along the chain, the outermost counting 1 (a plain message 1; ZIP⊃EML⊃ZIP⊃EML 4, refused). That is what R10's own test needs; N824's draft A4 counted a plain message as 0.
- Row names quoted (K5578 (2)): `mail.message_bytes`, `message.upload_bytes`, `archive.mailbox_messages`, `mail.nest_max`, `mail.nest_read_max`; the mailbox's bytes are bounded by `archive.uploaded_bytes`.

### Not done, and why

- R6's "one record" is `capture` R116's. This module gives the same answer for the same bytes on either route, and that is what it tests.
- `structured-text-reader` (a declared use) had no code yet. Bodies are decoded with `ooxml`'s `decodeText` and this module's own MIME decoding.

### Found in other modules

- `ooxml` keeps its MS-CFB reader private (`readCfb`). This module has its own copy modeled on it; exporting the reader from `ooxml` would leave one parser.

**Met** · R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15

Tests: 46/46. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcefa3SdZX44kR48Ukpf): test runs 1, module lines 1194
