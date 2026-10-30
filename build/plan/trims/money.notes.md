# money.md trim: notes

Read whole: build/requirements/README.md, neoprocess rulebooks/requirements.md, build/requirements/money.md. No other module file read.

## Size
- Old: 39,944 bytes. New: 32485 bytes. 25,000 was not reached without dropping meaning (see "Left long").

## Ids (checked by script: `grep -oE '^- \*\*R[0-9]+\*\*'` on both files, then diff)
- Old: R1 R2 R3 R4 R5 R6 R7 R8 R9 R10 R11 R12 R13 R14 R15 R16 R23 R17 R18 R19 R24 R25 R26 R28 R29 R30 R31 R32 R33 R34 R35 R36 R37 R38 R39 R40 R41 R42 R20 R21 R22 R27
- New: R1 R2 R3 R4 R5 R6 R7 R8 R9 R10 R11 R12 R13 R14 R15 R16 R23 R17 R18 R19 R24 R25 R26 R28 R29 R30 R31 R32 R33 R34 R35 R36 R37 R38 R39 R40 R41 R42 R20 R21 R22 R27
- Identical: 42 ids, same order. Each still first on its line after the list dash.

## Not-yet-met marks (checked by script, diff empty)
- Old: R39 `*(not yet met: T53)*`, R40 `*(not yet met: T53)*`, R41 `*(not yet met: T53)*`
- New: the same, character for character, right after the id.

## Other checks (scripts)
- Headings (`#` lines) identical; service headings with full signatures identical.
- Every backticked token of the old file is in the new one except: the R36 "Consequences, not drafted" file/line list (dropped as instructed; replaced by one line naming the round-1 job record and the T53 rows file), the `money/index.mjs:1311`/`:1331` "today" pointers in R36/R37 (history), and test-only literals (`{fiscal: "FY2025-26", body}`, `role: payer`, etc.) whose tests restated their rules. `retrieval`'s `findIn` became `retrieval.findIn`; `calc-grammar/index.mjs` is in Uses as "through its index".
- Every K/N/DEC/T/U/R id survives except T33 and R59, both only inside R36's dropped consequences list.
- R25 is now one id line plus indented sub-bullets (one per trail-row field); its id is still first on its line.

## Test sentences: facts moved into rules
- R28: "a set with no `concerns` is listed under no id"; `limit` folded into the return shape.
- R33: "a figure with no member act is held as a proposal".
- R34: a fiscal year alone, team with no profile included, is refused `MONEY_BAD_PERIOD`.
- R35: a set of only as-written facts answers no nodes and no refusal.
- R36: filtering holds "for a fund and an `MSR-` set alike"; `ownerConformance` passes for each of the five.
- R37: counts are per kind, never summed across kinds (from the 900+900 test); a money set's neighbours have no hub.
- R38: donations entry = `money_contribution`, money entry = the other four, never overlapping (DEC-447 (2)).
- R39: a Civicsmith-layer government keeps the records' year; another government's key is refused naming it.
- R40: DEC-451's two sentences unchanged. R41: a records year carries no stated status; disputed answers `status: "disputed"`.
- R42: two equal facts answer an empty list.
- R27: kept the `declaredOpHolds` / `declared-ops.test.mjs` pointer as one clause.
- Worked test numbers worth keeping (R37 1,001/3 and 900+900; R38 130 by 50) moved to the Suggestions test line.

## Left long, and why
- R1, R2: ordered refusal lists; every code and its order is the obligation.
- R25: each trail-row field has its own shape and fallbacks; all are the spec.
- R36, R38: the five-family map, the full `moneyByParty` signature, refusal list and `DECLARED_OPS` row are interface.
- R39, R40: the refusal and screen sentences are specified clause by clause (what each names, the no-`*` rule).
- Uses and Satisfies: citations kept whole per instructions; only connecting prose trimmed.
- Status and Size lines kept (shortened); they are not requirements but state scope (the money-checks/duties split, K1504).

## Ambiguities and contradictions (text kept, not fixed)
1. Status says "R24, R25 marked not yet met (T36), every other requirement met", but R24/R25 carry no mark and R39–R41 do. Status is stale (it also said "Last changed T36", though T51–T53 ids follow; that history clause was removed).
2. R1 still lists `BAD_PERIOD` while R29 (amends R1) says money never answers `BAD_PERIOD`, answering `MONEY_BAD_PERIOD`. Kept R1 as written.
3. R27 is a requirement placed under `### Suggestions`, which "bind nothing" (REQ 3). Kept in place to preserve order and structure.
4. R26 sits under the "The money trail" heading though it concerns `NO_BASIS` refusals; R28–R35 likewise are not about the trail.
5. R7 carries `checkConstant` and `factBySource`, unrelated to `withdrawFact`/`readFact`/`moneyOf`, under that service heading.
6. R12 says `readSet` hides a set whose `concerns` names "a bundle" the viewer may not see; the Terms and R28 speak of a project's id. Same thing presumably, words differ.
7. R39 and R40 both "supersede R34's last sentence"; R34 still keeps that sentence (pointing to R39, R40).
8. R42 cites "D2 money R?1", an unresolved id; kept verbatim.
9. R35: "what it draws waits on the design's ruling" names no ruling id.
10. Uses: `lines`, `standards`, `progressions` are "named by the plan's Rule 3; nothing calls them" with an open *(BOB's: keep or drop)*; `jurisdictions` appears twice (two entries).
11. Terms: `buys?` is a fact field never defined or used by any requirement.
12. R11 "rounding (precision)" vs R42: R42's example (period and amount differ, answering those two) suggests "amount" is a dimension, but R11's list has no amount dimension; that test sentence is kept in R42 as a rule clause (it states a fact R11's list does not); flagging the mismatch.

## Review fixes (money.review.md, four gaps, all judged real and applied)
1. R37: "counts" back to "considers", the filter now stated to apply to the hub count and the items alike. The binding tests are now in the rule: a fund with 1,001 facts of which 3 are valid at `at` answers 3 items, not a hub; a hidden fact changes neither `set_size` nor the items. The 1,001/3 case was removed from the Suggestions test line. The 900+900 case stays there because R37's "per kind, never summed" clause covers it, as the review agreed.
2. R29: appended the census test (no money act answers `BAD_PERIOD`) and the control (a first day after a last day is still refused; a valid fiscal key is accepted).
3. R38: appended "`moneyOf` (R9) answers as before."
4. R27: restored the three `declaredOpHolds` cases (only its requires, without each, a field outside its accepts).
Nothing else changed.

## Checks after the fixes (same scripts)
- Ids old = new, 42, identical order: R1 R2 R3 R4 R5 R6 R7 R8 R9 R10 R11 R12 R13 R14 R15 R16 R23 R17 R18 R19 R24 R25 R26 R28 R29 R30 R31 R32 R33 R34 R35 R36 R37 R38 R39 R40 R41 R42 R20 R21 R22 R27
- Not-yet-met marks: identical (diff empty). R39, R40 and R41 each carry `*(not yet met: T53)*`.
- New size: 32,887 bytes (old 39,944).
