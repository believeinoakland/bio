# query-language (T33)

**Status** · session_01J1bJiH921XCXLHJ1rEezAb · depth 2 · WORKING · handled B3

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

## J3 · COMPLETE

B3 applied: tranche/T33 merged (K1580). Money's closed words are now read from money itself, and the tests run against the real module.

**Entries applied (T33-39; K1444, K1481, K1563):**
- **R17 (C-5a).** `due` and `overdue` carry `asOf` and an authority: the action's own read, actions R25. A plan that reaches either one, by filter, facet or sort (under NOT, in a range, through `has:`, as a `sort:` token), names it with its as-of note. `overdue:` filters the cached flag and says so.
- **R27 (C-5b).** `compile` takes `zone`. A date on a time field is a local day: `civil-time`'s `dayRange` gives the bounds and `isCalendarDate` validates the date. Ranges include both days, and `>`, `>=`, `<`, `<=` compare whole days. Bounds are bound without the trailing `Z`, so stored `…Z` and `….mmmZ` values both compare correctly. `due` holds local days, so it compares days with no zone (K1563). Dropped with a warning (it widens): an impossible date, no zone, a zone civil-time refuses, an inverted range. An instant compiles as before. A range is one `span` node, so on a many-row relation both bounds apply to the same row.
- **R3, R28.** The 16 T33 fields are in `FIELDS`. The money fields `kind`, `phase`, `stage` and `basis` are lower-cased, and a word outside money's list is dropped with a warning naming the list. `occurred` is a time field. The fields filter only: they are not in `SORTABLE`, and asking to facet or sort by one gets a warning (K1563, K1568).
- **R29.** Each T33 field is read only through the relation the caller names (R26's `fields`). With none named, it is dropped with `"<f>" is not available here; read as nothing`, it is never read from `bundles`, and the rest of the query compiles as before. R7 and R8 hold through every relation.
- **R30.** `savedForm(query, relation?)` answers `{ok: true, form: {v: 1, q, implicitOp, sort, dir}}`, or refuses with `{ok: false, reason, detail, warnings}`: `SAVED_QUERY_SELECTION`, `SAVED_QUERY_DROPS` (each dropped term named) or `SAVED_QUERY_EMPTY`. To support it, the plan now carries `drops`: the warnings that dropped a term, as distinct from notes on how one was read.

**How money is read.** Money's lists come from `bio-plane/src/money/vocab.mjs`: the same frozen lists `kinds()`, `phases()`, `stages()` and `bases()` return. Importing the index instead would register money's connection owner at load and pull in the store's modules, which breaks this module's purity (R20). The tests compare against money's index at its interface.

**Deferred:** none. **Found in other modules:** none. **Service changed:** `compile` (new `zone`, `plan.drops`, the T33 fields) and the new `savedForm`. Retrieval, the only user, passes 123/123 against this branch. The plane bundle includes query.mjs, so the job leaves it stale; it is regenerated at the close.

**Final uses:** record-grammar, civil-time, text-chain, membership, content, money (as K1563 set them).

**Tests and checks:**
- query-language: tests 45, pass 45, fail 0
- retrieval: pass 123, fail 0
- format: 126 modules, 125 requirements files; 0 failures
- architecture: 9 product files, 36 relative imports (0 naming no tracked file, not judged); 0 failures
- coverage: 1 modules, 30 of 30 live requirement ids named by a test; 0 failures
- ownership: 7 files changed by query-language between tranche/T33 and HEAD; 0 failures
- A negative control on R27: keeping the `Z` on the bounds fails the day test.

The "not yet met" marks on R3, R17 and R27–R30 can be struck at the merge.

Size (session_01J1bJiH921XCXLHJ1rEezAb): test runs 16, module lines 2941
