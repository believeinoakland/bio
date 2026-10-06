# record-grammar (T34)

**Status** · session_01X5UrDpK4HmWSTEDUK3KEDX · depth 2 · WORKING · handled B1

## J1 · QUESTION

R46's `CALC` clause asks two things that one function cannot give: `idPattern('CALC')` "matches an opaque `CALC-` core and refuses a sequential one", and a sequential `CALC-` minted before T34 "stays valid wherever it is read". Today every reader reads through `idPattern('CALC')` (inquiry-grammar `CALCULATION_REF_RE`, strength's reference scan, calculations `CALC_RE`, connection-grammar `shape.mjs`), and ~26 test files of other modules use sequential `CALC-2026-0001`-style ids. Flipping `CALC` to opaque alone makes every one of those readers refuse a 0.80.0 copy's calculations.

My best reading (proposed; I am building R49 and the form flip meanwhile, and will build this on your answer):
1. `ID_TABLE`'s `CALC` row becomes `{prefix: 'CALC', owner: 'calculations', form: 'opaque', legacy: 'sequential'}`: `legacy` present only on a row whose form changed, naming the form still read as valid and never minted (as `STATES`' `legacy`, R35). R46's entry shape reads `{prefix, owner, form}` plus that optional key.
2. `idPattern(prefix)` stays the minting form (R47 unchanged: opaque only for `CALC`); record-core keeps minting from `form`.
3. A new provided read, `idReadPattern(prefix)`: the anchored RegExp matching an id core of the row's `form` or its `legacy` form (equal to `idPattern` for every row without `legacy`), `null` for an unknown prefix, never throws. Readers that judge a stored id re-point to it (inquiry-grammar R14, strength, calculations' reads, connection-grammar, answers' `isFigureAddress`), each in its own job; minting and the "is this freshly minted" checks keep `idPattern`.
This needs a new R (or R47 amended) worded by you, and the readers' requirements amended. Alternative if you prefer no new name: `idPattern(prefix, {read: true})`.
Until you answer, other modules' tests that build sequential `CALC-` ids through `idPattern('CALC')`-based readers will go red once my flip merges; I will name them in my REPORT before COMPLETE.
