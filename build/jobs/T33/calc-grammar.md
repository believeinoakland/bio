# calc-grammar (T33)

**Status** · session_01C7SS6rSXVbm5YnkpKzX2FE · depth 2 · COMPLETE · handled B3

## Completion

**State of the work.** Complete. B3 (K1529): tranche/T33 merged at ceb81d53dd with civil-time; the local stand-in removed (never committed); R7's date tests and R9's span test now run on civil-time's own `compare` and `span` (`bio-plane/src/civil-time/`, the names I import), all green. The invariants battery's lockdown was narrowed to what reads the clock (`new Date()` with no argument, `Date()`, `Date.now`): civil-time builds dated `Date`s from stated values, which is arithmetic, not a clock read.

**Entries applied.** T33-4 whole: the figure parser moved from `consequences/figures.mjs` by copy (C:A-11; R1–R3); exact decimals (`add`, `subtract`, `multiply`, `divide`, `round`; R4, R5); the closed `bio-calc/1` grammar with its twelve ops and `checkRecipe` (R6); `evaluate` with `select`, `count`, `sum`, `difference`, `ratio`, `share`, `group`, `span`, `compare`, `round`, `join` (resolver from the caller, choice 4) and `sort` by a stated quantity (R7–R12); the summation refusals by name (R13); the trace (R14); `resultKey` (R15); recorded draws and the exact hypergeometric interval (R16, R17, C §(c)); no eval, pure and exact (R18–R20).

**Paths for `modules.json`.** `paths`: `bio-plane/src/calc-grammar/`; `tests`: `bio-plane/test/m/calc-grammar/`. Final `uses`: `record-grammar` (`canonicalJson`, `sha256HexSync`: R15, R16) and `civil-time` (`compare`, `span`: R7, R9, R12), unchanged from the declared row.

**Choices made (the Suggestions and J1).** Figures: `$` reads as USD, `€` EUR, `£` GBP, `¥` JPY, a three-letter upper-case code as itself; qualifiers about, approximately, approx., nearly, over, `~`; scale words thousand(s), million(s), billion(s), trillion(s), k, m, mm, mn, b, bn, tn; a range takes a scale word, currency or `%` stated on one side for both; a qualified range keeps `approximate: true` beside `precision: range`. One difference from consequences' parser, by R1: `(-5)` carries two signs and is refused (consequences read it as −5); R3's test enumerates the old grammar and names that case. Ratios and shares default to 12 places, `half_even` (Suggestions). `compare` and `select` read a rounded figure as half a unit either side of its last printed place and an approximate one as settling no comparison. A `sort` orders by the stated value, sets aside a range or an undetermined cell, and keeps an undecided date pair in input order. Draws hash `seed + "\n" + key`; frame hash over the canonical JSON of the sorted frame. A recipe's inputs are `[{name, kind}]`; a table's rows are objects keyed by field name, a numeric cell a figure, a string read by `parseFigure`, or a safe integer (a float is never read, R19); a date field may carry `zone` (default UTC).

**Deferred.** None.

**Found in another module.** None. (consequences' own parser stays until its L9 job, T33-71, re-points to this module.)

**Runs** (from `bio-plane/`): `node --test test/m/calc-grammar/`: tests 29, pass 29, fail 0, on civil-time's own code (tranche/T33 @ ceb81d53dd merged). Layer tests: none named in `build/manifest.md`. No service I use changed, so no other module's tests are owed.

**Checks** (process repository, with this module's row's paths filled in a local, uncommitted copy of `modules.json`, since BOB writes them at merge):
- `format: 126 modules, 125 requirements files; 0 failures`
- `architecture: 13 product files, 19 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 20 of 20 live requirement ids named by a test; 0 failures`
- `ownership: 14 files changed by calc-grammar between tranche/T33 and HEAD; 0 failures`

Size (session_01C7SS6rSXVbm5YnkpKzX2FE): test runs 14, module lines 1083

## J1 · QUESTION

Readings I am building on (no answer needed unless one is wrong):
1. civil-time has no code yet. I import `compare` and `span` from `bio-plane/src/civil-time/index.mjs` (its job's natural path). If CIVIL-TIME #1 chooses another path or names, I re-point at its merge. Until it merges, my R7 date and R9 span tests run against a local, uncommitted stand-in; I re-run them on its code before COMPLETE.
2. `evaluate`'s options gain `view` and `office` (passed through to `civil-time.span` for a `business days` unit, R9). Without them a business-days span is civil-time's undetermined answer. This adds an optional argument; no requirement text changes unless you want it named.
3. `$` reads as currency `USD` (and `€` EUR, `£` GBP, `¥` JPY); a three-letter upper-case code reads as itself. `(7.3%)` reads as a negative percentage per R1's accounting parentheses: M-M1's four chart-label shares (F194–F200) are a reader's context, not the parser's; my fixture test asserts the parser's sign and says so.
4. A `range` operand in `divide`/`round` gives bounds rounded outward (floor for low, ceiling for high), so the range still bounds every reading (R5); the stated mode applies to non-range values.
5. `sum` over a field where any row's value is undetermined answers undetermined (never a partial total: R20, never read as zero), naming the rows.
6. `resultKey(recipe, inputHashes, {methodVersion?})`: the optional third argument (default `bio-calc/1`) exists so R15's "different method version" is testable.
7. `compare` treats a `rounded` figure as the interval of half a unit at its last printed place, and an `approximate` one as undetermined unless the other side settles it never; equal only for two exact equal values.

## J2 · REPORT

T33-4 built on K1514's readings and pushed (job/T33/calc-grammar): 29/29 tests; format, architecture, coverage (20/20) and ownership 0 failures (with my row's paths filled in a local copy of modules.json: paths bio-plane/src/calc-grammar/, tests bio-plane/test/m/calc-grammar/). Uses unchanged: record-grammar, civil-time.
One step before COMPLETE: R7's date and R9's span tests ran against a local stand-in of civil-time's compare and span (never committed). When civil-time merges into tranche/T33, send me a CHANGE (or RESUME) and I merge it, re-point to its exported names if they differ, re-run, and post COMPLETE. Progress is in my record's Completion section.
