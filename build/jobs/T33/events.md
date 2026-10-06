# events (T33)

**Status** · session_01K9DnAGrn74B6cYtMcraMxp · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Four readings I am building on now; none stops the job. Answer only where you read it otherwise.

1. **Vote values (R11).** No profile key holds vote values: `jurisdictions` has no `vote_values` section or vocabulary key (SECTIONS, VOCABULARY at `jurisdictions/index.mjs:17–29`), and the test profile has none. My reading: `voted` requires a non-empty `voteValue` (`NO_VOTE_VALUE`); when the active view holds a vote-value list, a value outside it is `UNKNOWN_VOTE_VALUE` naming the list; while no profile holds one, the value is kept exactly as the source writes it and the participant answers `vote_value_checked: false` with why (never a default list). I will REPORT the missing profile key against jurisdictions.
2. **Which scheme is Legistar's (R22).** The test profile's `identifier_schemes` has no Legistar `PersonId`/`BodyId` scheme. My reading: a `PersonId` resolves through `entities.entityByIdentifier({scheme, id})` over each view scheme whose `space` is `person`; a `BodyId` over each scheme whose `entity_kinds` holds `body`; exactly one entity across schemes resolves it, none or two different ones leave the row in `unresolved`. My tests add a Legistar person scheme through a test view, never through product code.
3. **followedImport's scope (R22).** `body` is the followed body's entity id; a row is in scope when its `BodyId` resolves (as 2) to that entity, or for items and votes when their meeting is held in scope; `period` is `{from, to}` local days, a meeting in scope when its day lies in it. Items need their meeting imported first and votes their item; one missing is answered in `unresolved` with its source row.
4. **R4's opt-in set (K1505 (9)).** Held in this module's table, changed by `setReadOptIn({captureClasses, by})`, an administrator's act (`membership.isAdministrator`; else `NOT_AN_ADMIN`), each change recorded with who and when. Since `onRead` takes its class list once at registration, the module registers once over the content types whose readings it reads dates from, and the hook acts only for a class in the current set. A date read this way cites the `document` extent and its method names the reader, its version and the fact's field.

Also: paths `bio-plane/src/events/` and `bio-plane/test/m/events/`. `entities`' T33 services (`entityByIdentifier`, `resolutionsFor`'s grades, `proceedingOf`) are not on `tranche/T33` yet; I code against their requirements and my tests reach them through the entities instance, giving a test stand-in only where the merged entities lacks the service, which I re-run against the real one once ENTITIES merges.

## J2 · REPORT

B2 applied (R37's `event_attestations(event_id, capture_sha)` built and tested: a relation's citation is held apart, so the table lists only captures attesting the event; the owner's `host` pass-through, else the isolate's one instance, else `OWNER_HOST_AMBIGUOUS`; `eventsOf(host)`; money's assumed shapes of `readEvent` and `eventsFor` hold as stated). B3 and B4 applied: `noSuchEvent(id, extra?)` and `noSuchDatedFact(id, extra?)` exported from `bio-plane/src/events/index.mjs`, entities' pattern, every act of this module answering through them; their rows are `EVENT_CHECKS` with `check: null` until promotion stamps T33's new rows (T34).

State: R1–R42 built, 44/44 tests green on `job/T33/events` @ HEAD; format, architecture, coverage (42/42) and ownership 0 failures with `paths` `bio-plane/src/events/`, `tests` `bio-plane/test/m/events/` set locally (not committed). Final `uses`: record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, provenance, reading-pipeline, extraction, content, entities, legistar-reader, court-doctypes (the last two by the tests only, over their captured fixtures; promotion dropped, unused).

Waiting only on ENTITIES' merge (K1563 (1)): the fixture stands in for `entityByIdentifier`, `addIdentifier`, `proceedingOf` and the `proceeding` kind while the merged entities lacks them; I re-point the tests at the real ones after it merges, then post COMPLETE. Send a CHANGE when it merges.
