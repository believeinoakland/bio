# query-language (T33)

**Status** · session_01J1bJiH921XCXLHJ1rEezAb · depth 2 · WAITING ON BOB (J2) · handled B2

## J1 · QUESTION

Four points from T33-39; my best reading of each, which I am building on now.

1. **`modules.json` uses.** query-language's row lists `record-grammar, text-chain, membership, content`; its requirements' Uses now add `civil-time, standards, lines, events, money, duties, people`. R27 imports `civil-time` (`isCalendarDate`, `dayRange`), so `checks/architecture.mjs` fails until the row gains it. Best reading: BOB adds `civil-time` now (it is merged), and `money` when R28's closed words are read from it (point 2). The other five give only relations (R29) and no closed words, so I import nothing from them; I propose dropping those edges unless you want them kept.

2. **Where R28's closed words come from.** Only `money`'s fields have closed lists (`kinds()`, `phases()`, `stages()`, `bases()`, its R17); `standard`, `cites`, `person`, `holder`, `post`, `event`, `obligor`, `owed_to`, `fund`, `party` and `period` take ids or values with no closed list. `money` has no code yet (paths `[]`), so importing it now breaks my module's load. Best reading: I import `money`'s four lists from its index once MONEY #1 merges (it merges before me), and until then the closed-word check is the one piece I hold back. Please name money's index path if it is not `bio-plane/src/money/index.mjs`. (The alternative, the caller passing each owner's words beside its relation, would decouple us, but it does not match the requirement's Uses.)

3. **`due:` holds a local day, not an instant.** `action_clock_next` is a `YYYY-MM-DD` (actions R12), so R27's instant bounds cannot compare with it. Best reading: a field whose column holds local days (`due`) compares dates as days, inclusive, and needs no `zone`. Columns that hold instants (`created`, `updated`, `retrieved`, `checked`, `since`, `occurred`) take R27's `civil-time` bounds and drop a date term when there is no `zone`. Bounds are bound without the trailing `Z`, so both `…:SSZ` and `…:SS.mmmZ` stored forms compare correctly at the boundary instant.

4. **The T33 fields can hold many values per bundle** (a bundle cites many standards or concerns many persons). Best reading: they filter only. They are not in `SORTABLE`, and a request to facet or sort by one is dropped with a warning: a scalar per bundle would be an arbitrary pick among its values, the double-count reason the meaning arms are not facets either. R28 and R29 ask only for filtering. An inverted date range is dropped with a warning, which widens (R5's direction).

None of these blocks the rest; I carry on.

## J2 · REPORT

B2 applied (tranche/T33 merged in). T33-39 is built on `job/T33/query-language`, every entry on K1563's readings:
- R17: `due` and `overdue` carry the cached marker; every route into them is named with its as-of note.
- R27: local days in `zone` through `civil-time`'s `dayRange`/`isCalendarDate`. `due` compares as days. Drops: an impossible date, no zone, a refused zone, an inverted range.
- R28/R29: the 16 fields, filter-only, each read only through the relation named for it. Money's closed words are checked, with `money` injected per K1563 (1) as `compile(q, {money})`.
- R30: `savedForm`; `plan.drops` lists the warnings that dropped a term.

Tests: query-language 45/45, retrieval 123/123 against this branch. Checks: format, architecture, coverage (30/30) and ownership each 0 failures.

One step remains before COMPLETE: at MONEY #1's merge I replace the injected `money` with a static import of `bio-plane/src/money/index.mjs`, re-point the test's injected lists at it, and re-run. I wait for that merge (a CHANGE, or I see it on tranche/T33 when woken).

For retrieval (T33-40, R68): name a relation per field in `compile(q, {fields: {<field>: {table, key, col}}})`, and pass `zone` in the query object. Until money merges, also pass `money`. `savedForm(query, relation)` takes the same second argument, so a field retrieval can read is not refused.
