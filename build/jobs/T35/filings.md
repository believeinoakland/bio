# filings (T35)

**Status** · session_01Dryjzy6STyiTmo8nuxcBrs · depth 2 · WORKING · handled B2

## J1 · QUESTION

R8 (T35, N653): my reading, which I am building on; answer only if it is wrong.
1. "The passages relied on": for each standard whose access is not `free`, (a) each comparison row of the determination for that standard: its `requires` statement as conformance holds it (the row's words), with the row's `content` ids that are among the standard's text content ids, each quoted; (b) each finding leg (the published finding's `basis` legs) whose `content_id` is among the standard's text content ids, quoted. Quoting is `content.passageText`. A passage whose extent is the whole document is named by content id but never quoted (that would carry the whole text). The standard's other text content ids are not listed at all (a free standard keeps R9's `text` list).
2. "adoption": standards' `editionInForce({standard, body, date})` for the act's actor's `body` at the act's day (the edition the body's adoptions put in force); undetermined with why when there is no single act day, no body, or no adoption decides it. Body is passed as the actor's `body` string as conformance holds it (adoptions store the adopting act's issuer, an entity id or a string).
3. An access standards does not state (`null` for kinds other than `standard`, `undetermined` for `standard`) is carried as not free, so every pre-T35 standard (no access recorded) is now carried with only its relied-on passages. This changes the packet for every existing standard of an ordinance or statute kind; I read that as R8's intent ("An access standards does not state is carried as not free").
