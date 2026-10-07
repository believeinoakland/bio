# filings (T35)

**Status** · session_01Dryjzy6STyiTmo8nuxcBrs · depth 2 · WORKING · handled B2

## Completion (FILINGS #15)

**Entries applied.**
- **T35-64** (N653; K1739, K2019). R8: in the packet's standards section, a standard is carried as R9 states (its `text` content ids) only when its `access` is `free`, or is `null` on a law kind (public law, K2019). Every other standard (kind `standard` with access not `free`, `undetermined` included, or any kind stated `reading_room` or `paywalled`) is carried by its citation, kind, issuer, `designation`, `edition` (or `edition_says`), `adoption` and `access` with `access_says` (standards' DEC-145 words where it gives them), and only the passages relied on. Those are: `requires`, each comparison row's `requires` as conformance holds it, with the row's content ids that are among the standard's text; and `passages`, each such content id and each content id a finding's leg names among the standard's text, quoted through `content.passageText`, each with `relied_on_by`. A passage whose extent is the whole document is named but never quoted. A passage whose document the reader may not see is not quoted. The standard's other text content ids are not listed. `adoption` is `standards.editionInForce` for the act's actor's `body` on the act's day, or undetermined with why. Sections are stored per version, so every version and export (R11) carries the same. B2's correction (K2019) is applied, and the fixture's ordinance and commitment again state no access.
- New `held-back.test.mjs` (R8, R9): the relied-on passages quoted; the whole document named, not quoted; a passage relied on by nothing absent from every version, read, rendering and export; the adoption with and without a recorded adoption, and with no module; paywalled, reading-room, free and law-kind-null access, each with a negative control.

**Deferred.** None.

**Found in other modules / stale artifacts.**
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale from this change, for BOB's regeneration at L9's close.

**Tests and checks run.**
- `node --test bio-plane/test/m/filings/`: tests 70, pass 70, fail 0 (67/67 before).
- Users of filings: `node --test bio-plane/test/m/escalation/ bio-plane/test/m/action-plans/`: tests 126, pass 126, fail 0.
- `format`: 130 modules, 129 requirements files; 0 failures.
- `architecture filings`: 17 product files, 75 relative imports; 0 failures.
- `coverage filings`: 32 of 32 live requirement ids named by a test; 0 failures.
- `ownership filings tranche/T35`: 3 files changed; 0 failures.

Size (session_01Dryjzy6STyiTmo8nuxcBrs): test runs 9, module lines 2184

## J1 · QUESTION

R8 (T35, N653): my reading, which I am building on; answer only if it is wrong.
1. "The passages relied on": for each standard whose access is not `free`, (a) each comparison row of the determination for that standard: its `requires` statement as conformance holds it (the row's words), with the row's `content` ids that are among the standard's text content ids, each quoted; (b) each finding leg (the published finding's `basis` legs) whose `content_id` is among the standard's text content ids, quoted. Quoting is `content.passageText`. A passage whose extent is the whole document is named by content id but never quoted (that would carry the whole text). The standard's other text content ids are not listed at all (a free standard keeps R9's `text` list).
2. "adoption": standards' `editionInForce({standard, body, date})` for the act's actor's `body` at the act's day (the edition the body's adoptions put in force); undetermined with why when there is no single act day, no body, or no adoption decides it. Body is passed as the actor's `body` string as conformance holds it (adoptions store the adopting act's issuer, an entity id or a string).
3. An access standards does not state (`null` for kinds other than `standard`, `undetermined` for `standard`) is carried as not free, so every pre-T35 standard (no access recorded) is now carried with only its relied-on passages. This changes the packet for every existing standard of an ordinance or statute kind; I read that as R8's intent ("An access standards does not state is carried as not free").
