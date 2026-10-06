# capture (T34)

**Status** · session_01QNQot9KaFLXjjqCENA7QuC · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R83's `fn({document, viewer})` does not say what `document` is. My reading, which I am building on: `document` is the held document's bundle id (the id R77 lists and R79/R81 take), and capture also passes `captures`, the capture digests the register files under that document (provenance R48's contract), so capture-requests R48 can match its requests' `capture_sha` without its own join. An extra field changes no meaning of R83 or R48. A malformed answer (not `{questions: [...]}`, or any entry without a non-empty string `question` and boolean `visible` and `waiting`) is treated whole as no answer, never a partial list (R48's "never a partial list"); for an entry with `visible` not true, capture never shows its title or asker whatever the reader sent. R84's per-document `set_aside` is the document's latest act overall (R81's rule), for the documents in the answered page. No reply needed unless you read it otherwise.

## Completion (CAPTURE #21)

**Entries applied.** T34-14 (N587; DEC-141 beneath K1618, K1645), with K1770's reading of R83 (B2) and B3 (K1773):
- **R83** `registerReader("captured-for", module, fn)`, a third slot beside R32's and R78's, refused as theirs are (`listenerRefusal`). `fn` is handed `{document, captures, viewer}` (the bundle id, the register's capture digests, the viewer). A throw, a promise, or any answer that is not `{questions: [...]}` with every entry well formed (non-empty `question`, boolean `visible` and `waiting`) is no answer, never a partial list. For an entry that is not visible, capture never shows its title or asker, whatever the reader sent.
- **R77** each held row answers `captured_for: {questions: [{question, title, asker}], withheld}`. `withheld` is "Captured for a question you may not see" when a question the viewer may not see is among them, with no id, title, asker or count. With no reader, or one that does not answer, `captured_for: null` and `captured_for_basis` saying it is undetermined.
- **R79** the reader is asked once per document per act, after the refusals and before anything is written. Every waiting question, seen or not, is recorded with the set-aside in the new table `held_act_questions` (one row per act and question, purged with `held_acts`). The answer adds `documents`, giving per document `captured_for` and `waiting` (`{questions, withheld}`). With no reader the set-aside is still made, no question is recorded, and `waiting: null` comes with `waiting_basis`.
- **R81** a restore is recorded with the questions of the set-aside it undoes (the document's latest act). Any member who may see the document may restore it.
- **R84** `heldActsOf({question, viewer, limit, after})`: acts recorded with the question, oldest first (`at`, document, seq), filtered by sight (membership R43) and left out unannounced. `documents` gives each page document's `set_aside` (its latest act overall). Paged by N90's bound, it writes nothing, and it never throws: an unreadable store answers `ok: false, acts: null`.
- **B3** a knock's pull hands `profileOf` the origin `"fetch"`. A knock is made with no account (R30), and neither `op=knock` nor the inbox row carries a member session, so no knock is a member's own act under their session.

**Deferred.** Nothing.

**Other modules (REPORT J2).** `acquisition`'s `profileOf` comment, and its `origin.test.mjs` header, say `"member"` is for bytes a member supplied by their own act, "an upload or a knock". Under K1773 (B3) a knock is never one today. Wording only, no behaviour.

**Tests and checks.**
- capture's tests (`bio-plane/test/m/capture/`, `cap13-reuse-pages`, `d57selflink`): 129 pass, 0 fail. The new tests are 9 in `held.test.mjs`, each run with a registered stub and without a reader, and 1 in `knock-origin.test.mjs`, shown failing without the origin. R74's every-write-in-transact test now covers the `held_act_questions` writes.
- Users' tests (22 modules that use capture, 2,113 tests): 14 fail, the identical set on `tranche/T34` without this change. All are inherited reds named in B1 (capture-requests ×4, scheduler R12, control-plane R43, extraction/reading-pipeline, following R2, monitoring cadence, plane migrate-released). After B3, control-plane and sources: 197 pass, 1 fail (control-plane R43, inherited).
- `format`: 0 failures. `architecture capture`: 0 failures. `coverage capture`: 57 of 57 ids named, 0 failures. `ownership capture tranche/T34`: 0 failures.

Size (session_01QNQot9KaFLXjjqCENA7QuC): test runs 10, module lines 3576

## J2 · REPORT

acquisition (wording only): profileOf's comment and origin.test.mjs's header say "member" is for bytes a member supplied by their own act, "an upload or a knock". Under K1773 (B3) no knock is a member's own act under their session today (op=knock carries no session, capture R30), so capture's pull passes "fetch". The comment should drop "or a knock", or name the case where a knock would be one. No behaviour is affected.
