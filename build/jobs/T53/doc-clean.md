# doc-clean (T53)

**Status** · session_018BhcedJp6SW8wmUGjgoTVP · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-27)

# doc-clean T53 report

- T53-60 (K5565): the module's one English-in-test site (`fixture-answers.test.mjs`, the ENCRYPTED detail) now reads the sentence through `localize(id, en)`; its baseline row (`build/tests-english-baseline.json`, outside a job's paths) is BOB's to remove: `bio-plane/test/m/doc-clean/fixture-answers.test.mjs`; the words check reports 0 failures for the module.
- T53-59 (N824, K2334, K1485), as BOB #326 ruled: `cleanDocument(bytes, { materialNames })` takes the author's material display names (a list of strings, else refused `NOT_A_CLEANABLE_FORMAT`); R13's own tests are held as `test.todo` (not met) until `mail-reader` and `format-registry`'s eml/msg entries merge; BOB then sends a CHANGE naming the reading call and I finish R13 in this job before layer 1 closes.
- Not done and why: R13's email reading and cleaning (providers unbuilt).
- Found in other modules: none.

**Met** · none

Tests: 68/70. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedJp6SW8wmUGjgoTVP): test runs 1, module lines 1168

## Completion (2026-10-28)

# doc-clean T53 report (CHANGE: R13 wired to mail-reader)

- T53-59 (R13): `cleanDocument` now answers an email (`eml`, `msg`) with a published copy built by `src/doc-clean/mail.mjs` from mail-reader's `readMessage` and `attachmentBytes`: an EML holding the text, each attachment cleaned by its own format's rule (a refused attachment refuses the message under its code, naming its index), and From, To, Cc, Date and Subject as displayed; every other header dropped, every email address stripped (headers, subject, attachment names and body text, replaced by a words-keyed placeholder), names shown only when in `options.materialNames` (case-insensitive), else "withheld". A copy that equals its input answers `clean: true`. An MBOX is refused `NOT_A_CLEANABLE_FORMAT`.
- Choices to confirm (BOB's, reported): the copy is always an EML, even for an MSG; a bare network address in body text (not an email address) is left; inline images become ordinary attachments.
- Not done: detection through format-registry's `detectFormat` waits for its eml/msg entries; meanwhile `index.mjs` calls mail-reader's `detectMail` at one place (swap when BOB #327 tells me). That step is held as a `test.todo`; R13 therefore stays not yet met.
- T53-60: done earlier; the baseline line for `fixture-answers.test.mjs` is BOB's to remove (outside a job's paths).
- Found in other modules: none.

**Met** · none

Tests: 74/76. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedJp6SW8wmUGjgoTVP): test runs 2, module lines 1271

## Completion (2026-10-28)

# doc-clean T53 report (CHANGE: detection through format-registry)

- T53-59 (R13) finished: `cleanDocument` judges an email by `format-registry`'s `detectFormat` (eml, msg; an mbox is refused `NOT_A_CLEANABLE_FORMAT`), then builds the published copy through mail-reader's reading (`mail.mjs`). R13's test.todo is now tests: an EML judged by its bytes, a PNG is not a message, an MSG is judged `msg` and answered as an EML copy; the earlier R13 tests (addresses and Received absent, marked name shown, unmarked "withheld", attached PDF cleaned as R6, idempotence, control) stand.
- BOB's confirmed choices: the copy is always an EML; a bare network address in body text is left; inline images become ordinary attachments.
- T53-60 done earlier; the baseline line is BOB's to prune at the layer close.
- Found in other modules: none.

**Met** · R13

Tests: 76/77. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedJp6SW8wmUGjgoTVP): test runs 3, module lines 1271

## Completion (2026-10-28)

# doc-clean T53 report (CHANGES: T53-503, with detection already done)

- Detection through `format-registry`'s `detectFormat` and R13's tests: done at a200fc4d (the earlier COMPLETE); R13 met.
- T53-503 (R37, K5624): the tests read every figure the module bounds by from runtime-limits (`boundOf(kind, row)`; `TAG_MAX`, `CLEAN_MAX_*`): `document.clean_bytes`, `office.entries`, `archive.ratio`, `xml.tag` no longer pinned. The suite is green with `document.clean_bytes` and `document.part_bytes` flipped to their standard (tried on a throwaway edit of `BETA_STANDARD_ROWS`, reverted). The module's ceilings are already tied to the rows (R12).
- **A figure the module cannot hold: `document.clean_bytes` (standard 100 MB) and `document.part_bytes` (standard 100 MB).** Measured in workerd (peak resident growth during one request, R4's method; the isolate is 128 MB; PDF / PDF of small objects / .docx): 16 MiB 19 / 113 / 65 MB; 20 MiB 40 / 106 / 105; 24 MiB 24 / 117 / 138; 32 MiB 32 / 130 / 74; 48 MiB 48 / 135 / 128; 64 MiB 128 / refused / 135; 100 MiB 182 / refused / 113. The worst case (a PDF of ~135,000 small objects) is already 113 MB at today's 16 MiB; the whole-file copy (body in, copy out) cannot fit 100 MB in 128 MB. Beyond 64 MiB the small-object PDF is refused `DOCUMENT_UNREADABLE` by pdf-reader (an object array it cannot read; pdf-reader's, not measured further). So: the module holds 16 MiB in every case (20 MiB is the most I would call safe); I recommend `document.clean_bytes` stays at 16 MiB (its alpha) and `document.part_bytes` at its alpha until a streaming copy exists; flipping them to 100 MB would make the module accept files it cannot copy inside its isolate. That is BOB's call (R4 and the rows are requirements); no code of mine keeps it silently.
- Tests: `measure.test.mjs` measures at min(active figure, 16 MiB) and asserts the 128 MB; a second test measures at the rows' standard figures and prints (opt-in: `DOC_CLEAN_MEASURE_STANDARD=1`, or `DOC_CLEAN_MEASURE_MB=20,32`), its fixtures' padding in images of at most 16 MiB (image-cover bounds one image).
- Found in other modules: pdf-reader refuses a catalog-reachable array of about 270,000 object references ("object 4 0 is referred to and cannot be read") at 64 MiB of small objects.

**Met** · R13

Tests: 76/78. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedJp6SW8wmUGjgoTVP): test runs 4, module lines 1271
