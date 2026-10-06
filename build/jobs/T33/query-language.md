# query-language (T33)

**Status** · session_01J1bJiH921XCXLHJ1rEezAb · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

Four points from T33-39; my best reading of each, which I am building on now.

1. **`modules.json` uses.** query-language's row lists `record-grammar, text-chain, membership, content`; its requirements' Uses now add `civil-time, standards, lines, events, money, duties, people`. R27 imports `civil-time` (`isCalendarDate`, `dayRange`), so `checks/architecture.mjs` fails until the row gains it. Best reading: BOB adds `civil-time` now (it is merged), and `money` when R28's closed words are read from it (point 2). The other five give only relations (R29) and no closed words, so I import nothing from them; I propose dropping those edges unless you want them kept.

2. **Where R28's closed words come from.** Only `money`'s fields have closed lists (`kinds()`, `phases()`, `stages()`, `bases()`, its R17); `standard`, `cites`, `person`, `holder`, `post`, `event`, `obligor`, `owed_to`, `fund`, `party` and `period` take ids or values with no closed list. `money` has no code yet (paths `[]`), so importing it now breaks my module's load. Best reading: I import `money`'s four lists from its index once MONEY #1 merges (it merges before me), and until then the closed-word check is the one piece I hold back. Please name money's index path if it is not `bio-plane/src/money/index.mjs`. (The alternative, the caller passing each owner's words beside its relation, would decouple us, but it does not match the requirement's Uses.)

3. **`due:` holds a local day, not an instant.** `action_clock_next` is a `YYYY-MM-DD` (actions R12), so R27's instant bounds cannot compare with it. Best reading: a field whose column holds local days (`due`) compares dates as days, inclusive, and needs no `zone`. Columns that hold instants (`created`, `updated`, `retrieved`, `checked`, `since`, `occurred`) take R27's `civil-time` bounds and drop a date term when there is no `zone`. Bounds are bound without the trailing `Z`, so both `…:SSZ` and `…:SS.mmmZ` stored forms compare correctly at the boundary instant.

4. **The T33 fields can hold many values per bundle** (a bundle cites many standards or concerns many persons). Best reading: they filter only. They are not in `SORTABLE`, and a request to facet or sort by one is dropped with a warning: a scalar per bundle would be an arbitrary pick among its values, the double-count reason the meaning arms are not facets either. R28 and R29 ask only for filtering. An inverted date range is dropped with a warning, which widens (R5's direction).

None of these blocks the rest; I carry on.
