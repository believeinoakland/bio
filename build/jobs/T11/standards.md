# standards (T11)

**Status** · session_01SXyQJAxnzwptrywGGyqWH7 · depth 2 · WORKING · handled B1

## J1 · QUESTION

N269 reading (applied; carrying on): R5's `NO_ID` is refused as **`STANDARD_NO_ID`**, its own row C-112.11 (the slot left unused), from `standardRead` and also `inForce` (a missing id there answered `NO_SUCH_STANDARD`/`STANDARD_DATE_INVALID` before). Why not keep the code `NO_ID` with a row: `check-refusal-codes` arm G then reads `STANDARDS_CHECKS.NO_ID` as one DEC-49 code minted at 12 sites (content, inquiry ×4, publication ×3, strength ×2, standards) and raises the multi-site count past its ceiling; K275 gives a code naming a different subject per site to each module as its own, renamed. With `STANDARD_NO_ID` the guard shows no new failure (one fewer: the census floor is met). No consumer keys on `NO_ID` from standards (civicos-ui, filings, conformance, store). If you agree, R5's text needs `NO_ID` → `STANDARD_NO_ID` (yours to edit). If you want the literal code `NO_ID` kept, say so and I switch it back (arm G then fails by one, legacy-tests' to re-anchor).
