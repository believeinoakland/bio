# mail-door (T53)

**Status** · session_018Bhced233u828vot13hTyX · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

**Entries applied.** T53-120 (N824, K5504-K5506, K5527, K5530 G, K5534; CAPABILITIES rows): the new module `mail-door` at `bio-plane/src/mail-door/` (`index.mjs`, `checks.mjs`, `schema.mjs`), tests at `bio-plane/test/m/mail-door/` (46 pass, 1 todo: R12's email() entry, M1).
- R1 a member's private address: `mailAddressOf`, `mailAddressMake` (old one off in the same act, `within` in the act), `mailAddressOff`; local part `m-` + 12 Crockford base32 characters (60 bits) of an HMAC of a random salt under the instance key (`MAIL_ADDRESS_KEY` or the `mail_key` row); the door matches the address's keyed digest; no row, answer of the door or log line holds the clear address or any member's own email address.
- R2 `receiveMail({raw, envelope_to, envelope_from, size, now})`: refusals in the stated order (MAIL_OFF, MAIL_NO_SUCH_ADDRESS, the two rate codes, MAIL_TOO_LARGE before a byte is read and on a stream passing the bound (cancelled), MAIL_EMPTY), each writing nothing but R9's tally; `envelope_from` read for nothing.
- R3/R4 the waiting list (`mail_waiting`, bytes under `bio/mail/<sha256>` in the `CAPTURES` bucket): `mailWaiting` (own rows, newest first, 200 a page, `next`), `mailRead` (headers as stated, text, attachment list by name and size, owner only, `NO_SUCH_MAIL` otherwise).
- R5 `mailBringIn`: fence, `NO_SUCH_MAIL`, `MAIL_ALREADY_IN`, then `capture.emailCapture` with the raw bytes, headers, statement and a `within` that marks the row `brought_in` inside capture's act; bytes deleted after capture answers.
- R6 `clearWaitingMail({now, limit})`, `mailClearDue`, `mailClearWake`, `mailDelete`; the answer's `owners` (count and received instants only) for the notice-producers line.
- R8 two-bucket sliding windows (member hour, team day) over keyed digests, figures from `runtime-limits`, `stated` carrying them; R9 count-only tally (`mailTally`, administrators only); R10 automatic flag from mail-reader's four facts, second sighting one row, mail-reader's MAIL_TOO_NESTED relayed unchanged; R11 no AI import, no network call; R12 `DECLARED_OPS` (the five member acts with `needs: "contribute"`, member classes, no machine class, plus `mailtally`), `mailDoorOps`; R13 C-157.1-C-157.9 in `MAIL_CHECKS`, rows read at the refusal, a missing row fails loud; R14 capture R115's clock (`now`, `BIO_NOW_MS`, wall clock).

**Not done, and why.**
- R5 (and the controls of R3 and R6, and `mailbringin`'s declaration test): built against `capture` R116 and, after BOB #330's CHANGE (capture merged, K5712), tested against the real `emailCapture`: met.
- R7 reworded by K5692 to mail-door's part, met: rows and list answers keep no address of a person, the owner's view alone reads the whole headers from the stored bytes.
- R12 NOT MET: its mail entry, the plane's `email()` export calling `receiveMail`, waits on the measurement M1 (K5692), a `test.todo` naming M1; the declared ops, the route map and the off-by-default refusals are done and tested.
- R13: family C-157 (K5692).
- Findings for other modules were placed by BOB (K5702: T53-563 to T53-569).

**Found in other modules.**
- `setup-words`' generated `rows.mjs` / `words-unreviewed.json` are stale by this module's new `localize` keys (`mail-door.*`): regenerated at the merge.
- `answer-envelope` (`families.mjs`, R12) lists each check family; C-157 (mail-door) needs its row there.
- The composition owes: `plane`/`store-assembly` building `mailDoorOf(ctx, {capture, settings})` with `settings()` answering `{mail_domain, mail_door}` (instance-setup R114's two settings), routing `mailDoorOps`; `scheduler`'s `mail-clear` consumer over `clearWaitingMail`/`mailClearDue`/`mailClearWake`; a `notice-producers` line reading `owners`; `op-declarations`/`op-grades` reading `DECLARED_OPS`.

**Met** · R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R13, R14

Tests: 46/47. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhced233u828vot13hTyX): test runs 1, module lines 785
