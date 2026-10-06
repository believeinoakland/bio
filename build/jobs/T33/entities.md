# entities (T33)

**Status** · session_01GwNBQvLbkzvmQayjiCByXF · depth 2 · WORKING · handled B1

## J1 · QUESTION

Five readings for T33-25. I am building on each now; none blocks me. Answer only where you disagree.

1. **R47's battery cannot fully pass for this owner.** `connection-grammar`'s `ownerConformance` (R9) needs one item `in` at the date and one fenced item that one member viewer sees and another does not. A declared relation has no dates, so `validAt` answers every item `undetermined`. The registry is group-wide (C6, K1489), so no item is fenced from a member. My reading: the test runs the battery and asserts that its only failures are those two checks (`at` for the `in` item, `sight` for the fenced item). It then tests R6 and R7 directly: every item is marked undetermined; every member viewer gets the whole set; an unrecognised viewer gets nothing; a missing viewer is refused. The battery's gap goes to you as a REPORT against connection-grammar.
2. **R45, a proceeding's label.** The module composes the label from the forum's label, the number and the kind's label, so `ENTITY_NO_LABEL` never arises for a proceeding. A label the caller gives is kept as an extra alias, never as the label (a caption may be one, K1452). The note is still required (R1).
3. **R43, a machine's identifier "only from a system rule" (K1443).** For a `class:` stamp, `basis` must be `{system, row}`, with `system` one of the scheme's `systems`; otherwise the act is refused `NO_BASIS`, with a detail that says why. A member's basis is a cited source: a non-empty string, or that same object.
4. **R42.** A `sector` given to `createEntity` for a kind that is not an organisation is refused `NOT_AN_ORGANISATION` before any id is allocated. `setSector` to the value already held answers `already: true` and writes nothing. `readEntity` answers `sector` (null for a kind that is not an organisation) and `sector_history`, bounded at 500 as R39 bounds the other lists.
5. **R45/R47 mechanics.** A proceeding's number is held under the reserved scheme `proceeding`, scoped by its forum's id, so `IDENTIFIER_TAKEN` is per forum. R9's identifier tier matches on the space, form and normal form across forums. `neighbours` is registered once at load in `connection-grammar`'s default registry and answers through the storage's `Entities` instance (`entitiesOf`; one per Durable Object). An `Entities` instance also exposes `neighbours()` itself, for tests and the battery.

Also: `modules.json`'s `uses` for entities do not list `connection-grammar`, `civil-time` or `content`. Requirements Uses list all three. I import connection-grammar, civil-time and content's pure extent grammar (R46).
