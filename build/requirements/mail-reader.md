# mail-reader — requirements

**Status** · New in T53 (N1266; K5435, K5437; `build/plan/beta/planning/CONSISTENCY.md` §2 rows 3, 10): a layer-1 reader module for email, placed after `structured-text-reader` and before `format-registry` in `modules.json`; `mail-door`'s intake and the forwarded-message route file through it and add no parser (K5530 G; `build/plan/beta/capabilities/N824-email-capture.md`). Marked not yet met (T53); nothing is built. Lines from `build/plan/beta/files/REQ-readers-beta.md` ML1–ML12 (same ids; ML7–ML11 are CAPABILITIES' additions A1–A5, K5466), R13–R15 drafted by the worker.

## Public

### Purpose

Reads an email message (EML, MSG) and a mailbox (MBOX): the headers, the body decoded from every transfer and character encoding, and each attachment as a member filed as its own capture, linked to its message. It fetches nothing a message names, never throws, and holds no record: `mail-door`, `capture` and `provenance` read what it returns.

### Provides

- **R1** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML1) EML: headers (from, to, cc, date, subject, message-id), the body (plain text, else the HTML cleaned), decoded from every transfer and character encoding. Test: quoted-printable, base64, a UTF-16 body, an HTML-only message.
- **R2** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML2) MSG: read from its compound container (OLE), the same fields. Test: a generated MSG with body and attachment.
- **R3** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML3) MBOX: split into messages by streaming, never loaded whole; each message a member read as EML; a mailbox of more than 100,000 messages is refused whole with the limit named (K5439; `runtime-limits` R37's mailbox row). Test: a generated 500 MB mailbox reads every message once, a token in the last message found; a 100,001-message mailbox refused naming 100,000.
- **R4** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML4) Each attachment is a member filed as its own capture with its own job, linked to its message; nested messages (an attached EML) count in the one nesting count of R10. Test: a message with a PDF, an XLSX and an inner EML: three members, each read.
- **R5** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML5) Headers are searchable and cited as headers; remote content (images, tracking links) is never fetched. Test: a message with a remote image: no request made.
- **R6** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML6) Email capture (N824) and forwarding use this reader; a forwarded message and an uploaded one of the same bytes are the same document (one whole sha). Test: the same bytes by both ways give one record.
- **R7** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML7; CAPABILITIES C14, A1) Headers returned include `received[]` (every Received header in order) and `authentication_results` (the Authentication-Results headers as read, never judged). Test: a message with three hops and an SPF/DKIM result returns all of them in order.
- **R8** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML8; A2) Headers returned include `auto_submitted`, `precedence`, `list_id` and `return_path`; an empty return path is returned as `<>`, distinct from an absent one (`null`). Test: a bounce with `Return-Path: <>` returns `<>`; a message with none returns `null`.
- **R9** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML9; A3) An attachment listing is returned with a stable `index` (the same across reads), `size`, `inline` flag, and a nested message as content type `message/rfc822`. Test: two reads of the same message give the same indexes; an inline image is flagged inline; an attached EML is `message/rfc822`.
- **R10** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML10; A4, with the decided single count) `nesting_depth` is counted along the whole chain, archives and messages together, to 4 (`boundOf("mail", "nest_read_max")`). A chain deeper than 3 (`boundOf("mail", "nest_max")`) is refused by name ("nested more than 3 levels"), the refusal carrying the depth reached; the one count is shared with `reader-container` R5. Test: a ZIP holding an EML holding a ZIP holding an EML (depth 4) is refused naming depth; depth 3 reads.
- **R11** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML11; A5) A failure is returned, never thrown: every call answers `{ok: false, reason, ...}` for a malformed, truncated, over-limit or unreadable message. Test: a truncated MSG, a bad MIME boundary and a 100,001st message each return a stated failure and the call does not throw.
- **R12** (T53; N1266; K5435, K5437; `build/plan/beta/files/REQ-readers-beta.md` ML12) Sizes: a message received by address is bounded at 25 MiB (Cloudflare's own limit; `boundOf("mail", "message_bytes")`, `runtime-limits` R46, which `mail-door` quotes too); an uploaded EML or MSG at 100 MB; a mailbox (MBOX) at 100,000 messages (K5439). Test: an uploaded 100 MB EML reads; 100 MB + 1 is refused with its size; the mailbox cap is R3's.
- **R13** (T53; N1266; K5435; `format-registry` R33 and Uses; drafted by the worker from them and from the reader contract of `reading-pipeline` R45; BOB reviews) **The module exports one registry entry for each format it reads.** `eml`, `msg` and `mbox`, each in `format-registry`'s entry shape (`format`, `detect(bytes, contentType)`, `parts`, `structure`, `text`; its R1–R5), which `format-registry` registers unmodified (its R33). Each `detect` answers by content as `format-registry` R34 and R35 require (`mbox` by `From ` lines, an `msg` by its compound container's signature), never by extension alone; each entry reads over a range source `{size, readRange(offset, length)}` (`reading-pipeline` R45), an MBOX by streaming and never whole. Test: a generated sample of each is answered with its `format`; an EML renamed `.txt` is `eml`; a PNG renamed `.eml` is `png`. Control: a text file that merely contains a `From:` line is `text`.

## Private

### Uses

- `structured-text-reader`: its units and the shared byte-window reading (R3: an MBOX message is read as an EML; R1's bodies decoded as text).
- `ooxml`: `listArchive`, `streamMember` and `decodeText` (R4's attachments that are archives, R1's character encodings).
- `runtime-limits`: `READ_BOUNDS`, `boundOf(kind, name)` and `statement` for every ceiling this module keeps (R3, R10, R12, R14).
- `test-support` for tests (generated messages, mailboxes of 500 MB, nested chains).
- `setup-words`: `word`, `localize` (the words rule: a sentence people read is read by key; K3930, K3943, K3949).

### Invariants

- **R14** (T53; K5435, K5437; K4835 (1); drafted by the worker on the convention of `doc-clean` R12) No numeric literal in this module's code is a ceiling it keeps (the 25 MiB message, the 100 MB upload, the 100,000 messages, the nesting counts 3 and 4): each is read from `READ_BOUNDS` through `boundOf` (`runtime-limits` R37, R46), and a test reads the module's source and finds none.
- **R15** (T53; K5435; drafted by the worker, as the other readers' invariants) Pure: no store, no network, no clock; remote content in a message (images, tracking links) is never fetched (R5) and nothing in a message is run. No place is named in this module's code or in any refusal text. Every failure is a returned `{ok: false, reason, ...}` and never a throw (R11).

### Satisfies

- K5435, K5437 (EML, MSG and MBOX are in the beta's list; PST/OST are held and named, not read), K5439 (the protective limits: 100,000 messages a mailbox, nesting), K5466 (CAPABILITIES' additions A1–A5 as ML7–ML11), K5504–K5506 and K5530 (the forwarding address files through this reader).

### Suggestions

- The same bytes by the forwarding address and by an upload are one document, one whole SHA (R6): the identity is `capture`'s and `provenance`'s to keep; this module returns the same answer for the same bytes.
- Residual of the drafts: R11 returns `{ok: false, reason}` where an earlier draft of `mail-door`'s intake wrote `refusals[]`; K5530 F5 aligned the intake to `{ok: false, reason}`.
- An OLE parser for MSG is a licence and reader choice for the job (GAP-3.0); none is asserted here.
