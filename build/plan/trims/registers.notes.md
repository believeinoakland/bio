# registers.md trim: notes for BOB

## Size

- Old: 52,177 bytes. New: 41,298 bytes (−21%).
- **The 30,000-byte target is not reached.** 41,298 bytes is the smallest version I could make without changing meaning. About 10,000 bytes of what remains is interface text in backticks (names, fields, codes, objects), and about 3,500 bytes is the required per-line prefix (`- **Rn** *(not yet met: T53)* (citations)`). That leaves about 27,500 bytes of prose. Getting down to 30,000 would mean cutting about 40% of that prose, and the prose now left is mostly preconditions, refusal orders, conditions and test figures. Reaching 30k would take one of these choices, which are BOB's or Bob's, not a wording fix:
  - drop the Test/Control clauses that still add facts;
  - split the module's requirements (R42 already names the split: the import runner R11–R20 apart from search/rows/compare R24–R29);
  - move the guardrail scenario lines R61–R72 to `store-assembly`'s file, since they are also its `storeWorld()` tests.

## Ids: mechanical check

- `**R<n>**` count: old 59, new 59. The sequence is identical (checked by script):
  `1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 46 61 62 63 64 65 66 67 68 69 70 71 72 73 35 36 37 38 39 40 41 42 43 44 45`
- No retired or moved ids exist in the file.
- Each id is still first on its line (after the list dash), and the mark comes right after it (checked by script).

## `not yet met` marks: mechanical check

- Old: 59 marks. New: 59 marks. The sequence is identical, and every mark is exactly `*(not yet met: T53)*`.

## Other mechanical checks

- Ruling, decision and id citations (K…, N…, DEC-…, T…, G…, M-R…, R…, P…), compared per requirement between old and new:
  - Nothing was dropped.
  - Two citations were removed or added as pointers. R6 lost "(R1)" and then got it back. R66 gained a pointer to R27, so that its test refers to R27's statement instead of repeating it.
  - Several "`registers` R<n>" self-citations now read "R<n>".
- Backticked tokens, compared per requirement: the only ones removed are the self-name `registers` and repeated test-only spellings. Details were restored where something was actually lost: R5 `gate: fee`, R30 `record-core.tombstones`, R46 `gate: none`, R45 no `use_limit`.
- Numbers and ALL-CAPS codes, compared per requirement: every refusal code and constant is kept. These test figures were restored: R23's 5%, and R24's 10,001, 130/50 and 5 imports.

## Wording devices added (no new obligation)

- **Terms** now also defines:
  - *Visible* ("the viewer may see it");
  - *Machine* ("a machine author, viewer or credential");
  - `→` ("answers").
- **Folded Test/Control clauses:** where a Test or Control clause only restated the obligation, it was folded into the statement or dropped. Where it added a fact, the fact was moved into the statement. Examples: R1 "`not_stated` value null, never 0"; R13 "stopping twice → `existed: true`"; R22 "`{same: false, first}` on a corrupted row".
- **Pointers instead of repeated tests:** a requirement whose test is a guardrail line now points at it (R7→R71, R12→R67, R16→R68, R19→R70, R24→R62, R26→R65, R27→R66, R30→R69, R35→R63). The guardrail keeps the scenario.

## Statements left long (interface-dense; shortening would drop an input, output, error or condition)

- R9 (registerDelta: every figure's basis rule)
- R11 (importStart: ordered refusals, record, listener)
- R46 (the two officer doors)
- R12 (tick, states, retry)
- R24 (searchRows)
- R30 (rowExpunge)
- R32 (interest)
- R33 (refresh conditions)
- R13, R28 (status and cite shapes)
- Uses: kept whole.

## Ambiguities and possible errors, kept as written

1. **R8:** the project's saved interest is cited as "(R30)". R30 is `rowExpunge`; the interest is R32.
2. **R2:** `by_act` covers "the import is a team pre-read", but the old test says "a team pre-read with no interest shows `none`". Kept both, as "`none` (no interest, including a pre-read with none)". Which one wins for a pre-read is unclear.
3. **R9:** "`seconds` … `bytes_in` over the median throughput … (`took_ms` per byte)". Dividing bytes by ms-per-byte does not give a time. It probably means `bytes_in` × ms/byte. Kept as is.
4. **R7:** "a host the profile's systems mark `gated`, or a `gate` of `people_search`, is refused (`member_act_required`, `REGISTER_PEOPLE_SEARCH`)". Which code goes with which case is implied, not stated. Kept grouped.
5. **R65 (4):** "Every request carries R9's agent". R9 is `registerDelta`; the agent is stated in R18.
6. **R66:** "`corpus-export` carries no row (R16 above)". R16 is the no-AI rule; the export rule is R41 (or `corpus-export`'s R16?).
7. **R11:** "`scheduler` registers its `arm`, R9, R23". These are presumably `scheduler`'s R9 and R23, not this file's.
8. **Status:** it says R61–R72 are the guardrails, but R73 (content row context) sits under the guardrails heading and is not a guardrail.
9. **R3 and R46** carry "UNVERIFIED" notes (BETA-2 not found; the stream path to `streamRegister`). Kept verbatim.
10. **R42** writes the ranges "R11-R20"/"R24-R29" with a hyphen; Suggestions uses an en dash. Kept.
11. **"Open for Bob: None."** comes after Private, outside the README's section list. Kept.

## Files read

- Read: `build/requirements/README.md`, `neoprocess/rulebooks/requirements.md`, `build/requirements/registers.md`.
- No other module's requirements file was read.

## Review fixes (registers.review.md)

All five gaps were real. Each was fixed with the reviewer's restoring text, and nothing else was changed:

- **R2:** `none` again covers every other case, for example an `autoWatchable` interest with no watch running.
- **R26:** "written anywhere" is restored; the listed places are now examples.
- **R27:** "nothing in the module sends a row to a recipient" is restored, so the ban covers the whole module, not only its ops.
- **R37:** "Nothing in this module resolves…" is restored, again covering the whole module rather than only its ops.
- **R1:** "reads the profile and this module's tables" is restored, so it cannot be misread as the `own` field.

I left the reviewer's two "not gaps" (R25, R23) as they are.

### Re-run of the checks after the fixes

- `**R<n>**` ids: old 59, new 59, same sequence. Each id is still first on its line, with its mark right after it.
- `not yet met` marks: old 59, new 59, identical, all `*(not yet met: T53)*`.
- New size: 41,387 bytes.
