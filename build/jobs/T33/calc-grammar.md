# calc-grammar (T33)

**Status** · session_01C7SS6rSXVbm5YnkpKzX2FE · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings I am building on (no answer needed unless one is wrong):
1. civil-time has no code yet. I import `compare` and `span` from `bio-plane/src/civil-time/index.mjs` (its job's natural path). If CIVIL-TIME #1 chooses another path or names, I re-point at its merge. Until it merges, my R7 date and R9 span tests run against a local, uncommitted stand-in; I re-run them on its code before COMPLETE.
2. `evaluate`'s options gain `view` and `office` (passed through to `civil-time.span` for a `business days` unit, R9). Without them a business-days span is civil-time's undetermined answer. This adds an optional argument; no requirement text changes unless you want it named.
3. `$` reads as currency `USD` (and `€` EUR, `£` GBP, `¥` JPY); a three-letter upper-case code reads as itself. `(7.3%)` reads as a negative percentage per R1's accounting parentheses: M-M1's four chart-label shares (F194–F200) are a reader's context, not the parser's; my fixture test asserts the parser's sign and says so.
4. A `range` operand in `divide`/`round` gives bounds rounded outward (floor for low, ceiling for high), so the range still bounds every reading (R5); the stated mode applies to non-range values.
5. `sum` over a field where any row's value is undetermined answers undetermined (never a partial total: R20, never read as zero), naming the rows.
6. `resultKey(recipe, inputHashes, {methodVersion?})`: the optional third argument (default `bio-calc/1`) exists so R15's "different method version" is testable.
7. `compare` treats a `rounded` figure as the interval of half a unit at its last printed place, and an `approximate` one as undetermined unless the other side settles it never; equal only for two exact equal values.
