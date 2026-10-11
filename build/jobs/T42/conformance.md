# conformance (T42)

**Status** · session_01LHHoRgwt6hGfxJ2Qx2MQgt · depth 2 · COMPLETE · handled B1

## Completion

**Read (mechanics §17; START's set measured at 648 KB, over 300 KB).** I read these whole myself:
- `build/requirements/conformance.md`
- layer 9's row of `build/layers.md`
- the T42-24 entry and N841 in `draft-T42-reqs.md`
- K2558
- the plan's rule 4
- `src/conformance/index.mjs` (the code both entries change)
- `test/m/conformance/fixture.mjs`, `determine.test.mjs` and `reads.test.mjs` (the tests the entry changes)
- the two used services' parts the entry touches: calculations R9 (`read`) and events R21 (`eventForAct`)

My own worker read the rest of the module whole: `checks.mjs`, `schema.mjs` and the other nine test files. Its summary (about 7 KB, each statement citing file:line) covered the schema's tables and keys, the rows' `where`s, and the constraints these tests put on any change. The four constraints:
- an act with no measure answers synchronously (t35:200);
- a measure act answers a Promise (t35:201);
- the DEC-49 regions stay in their functions (t37);
- the comparison's refusal order (record.test.mjs:40–65).

**Entries applied (T42-24; N841, K2558).**
- **R30.** `determine` and `comparisonPropose` now ask their head refusals before any R29 measure is read: `#determineHead` and `#proposeHead`, in `src/conformance/index.mjs`.
  - For `determine`, the head refusals are `MACHINE_CANNOT_DETERMINE`, the project (`NO_SUCH_PROJECT`, or membership's existence answer), `DETERMINATION_NOT_A_PARTICIPANT`, and R18's cap (the cause's evidence cap included).
  - For a comparison, they are the project and the cap.
  - Such a refusal is answered at once (draft (1)), and no calculation is read.
  - Past the head, the measures are read and the act runs as before. R1's head is asked again after the asynchronous read, since the record may have moved meanwhile.
  - The refusals, their order and their answers are unchanged, and an act with no measure is still answered synchronously.
- **R11.** `determinationsFor` now reads a fixed number of statements per page, whatever its length:
  - one statement each for the page itself, its supersessions, its standards and its findings, over `json_each(?)`, which stays inside the Durable Object's bound-parameter limit;
  - `events.eventForAct` once per distinct `ACT-` id (a page memo, `#aliasOf`, which the `act` filter's `#actIds` shares);
  - each id's sight once per page (a memo in `#sight`, while each item still notes its own withholding, R24).
  - The answer is unchanged. Each item's standards and findings are still capped at 50.

**Tests (K874: each id tested explicitly, with a negative control).**
- `determine.test.mjs`:574, R30. Each head refusal is tested with a measure row, for `determine` (machine or empty author, absent or unseen project, existence-only viewer, invited and not joined, rows, standards and cause-evidence caps) and for `comparisonPropose` (unseen or absent project, rows and standards caps). In each case the fixture's counting `calculations.read` stand-in is not called, nothing is written, and the answer equals the same input's answer with the row in words. Controls: a valid head reads the measure (`NO_SUCH_CALCULATION`, one read); a refusal that is not R30's (`NO_FINDINGS`) still comes after the measure's read, as R1 orders it; the same holds for the comparison.
- `reads.test.mjs`:430, R11. The test builds a page of 200: real determinations (one superseded, one with two standards) and legacy rows naming three `ACT-` ids, one aliased.
  - The `determination` statements, counted by wrapping `sql.exec`, are the same number for a page of 3 as for a page of 200, and at most 4.
  - `eventForAct` is called once per distinct id, and the `act` filter asks no id twice.
  - Each page's JSON is byte-identical to its items read one at a time (pages of one): for a viewer who sees everything, one with a standard withheld, and a control viewer.
- Both new tests fail on the code before this job (checked: 0 pass, 2 fail) and pass with it.
- `fixture.mjs` gained a counter on its `calculations` stand-in (`w.calcReads`).

**Runs.**
- conformance: `node --test test/m/conformance/` → tests 89, pass 89, fail 0.
- Users' suites (P11):

  | suite | result |
  | --- | --- |
  | consequences | 41/41 |
  | actions | 109/109 |
  | action-clocks | 55/55 |
  | filings | 70/70 |
  | escalation | 63/63 |
  | action-plans | 63/63 |
  | affordances | 232/232 |
  | plane | 166/166 |
  | answer-envelope | 28/29 |

  answer-envelope's one red is `families.test.mjs`:425 (its assertion at :466, `src/steps/checks.mjs NO_SUCH_PROPOSAL C-142.28`). It is the plan's accepted red, rule 4 (6), and not mine.
- plane's `test/system/migrate-released.test.mjs` → 1/1 (8m50s).
- Checks:

  | check | result |
  | --- | --- |
  | format | 147 modules, 146 requirements files; 0 failures |
  | architecture | 15 product files, 61 relative imports; 0 failures |
  | coverage | 30 of 30 live requirement ids named by a test; 0 failures |
  | ownership | 5 files changed by conformance between tranche/T42 and HEAD; 0 failures |

**Deferred:** none. **Found in another module:** nothing. **Generated artifacts:** the plane bundle and `program.mjs` are made stale by this change to plane source (rule 4 (10), regenerated at the layer's close). **For BOB:** R11 and R30 are met; their `*(not yet met: T42)*` marks are BOB's to strike.

Size (session_01LHHoRgwt6hGfxJ2Qx2MQgt): test runs 8, module lines 2145

## J1 · COMPLETE

T42-24 applied: R30 (head refusals asked before any measure; no calculation read on a refusal) and R11 (determinationsFor: fixed statements per page, eventForAct once per distinct ACT- id; answer unchanged). New tests determine.test.mjs:574 and reads.test.mjs:430, each failing on the old code. conformance 89/89; users green except answer-envelope families.test.mjs:425 (rule 4 (6), accepted); checks 0 failures. R11 and R30 marks are yours to strike. Record: build/jobs/T42/conformance.md.
