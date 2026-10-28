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
