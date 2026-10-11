# citation (T42)

**Status** · session_01Ry8XJgz92P5UcBrruehLrc · depth 2 · WORKING · handled B3

## J1 · REPORT

Work pushed (7ee615020e, tranche/T42 merged after B2). `cite` already answered every write refusal unchanged (index.mjs:797); the comment now names inquiry R62's and run-productions R25's codes, and no seam was added (K2608).

Tests:
- cite-refusals.test.mjs: the stand-in relay test now runs all five relayed codes, each with nothing written, plus a negative control. Green.
- cite-write.test.mjs:219: a new test against the real booted inquiry, written to R62 as it reads with K2648 (B2). It covers PROPOSAL_NOT_TAKEN_UP answered unchanged, the read called once with the added leg and author = viewer, fail-closed MACHINE_PASSAGE_UNCHECKED (C-2.20) on a throw or a malformed answer, the found path (handle null, drift false), and a case edge never asked. Negative control: a null answer lands.
- That new test is red until inquiry T42-12 merges: `onMachinePassage` is not a function. I wait for your CHANGE, then merge and re-run, and post COMPLETE.
- Module tests: 78 pass, 1 fail (that test). format, architecture, coverage (13/13) and ownership: 0 failures.

Users' suites (P11):
- run-productions 54/0, affordances 232/0, plane 166/0.
- answer-envelope: 28 pass, 1 fail, catalogue-end.test.mjs:17 (NO_SUCH_PROPOSAL pin): accepted red 6.
- migrate-released: running; reported with COMPLETE.

Found against requirements, for BOB (a worker read the used modules' public parts, 277 KB, summary about 2,000 words):
(1) citation.md Uses pairs `inSight` with membership R61; it is membership R80 (R61 is a private invariant). This is a wording fix in my own requirements.
(2) citation.md calls `BASIS_ROLES` inquiry's R4 vocabulary; it is defined in record-grammar R16 and inquiry re-exports it. Wording only.
(3) promotion R39 says only that a registered check's refusal comes back "with its own `reason`". It does not say the refusal comes back whole, as provenance R52 and content R49 do. citation R1's "answered unchanged" therefore rests on promotion's code, which my tests confirm, not on its text. I suggest promotion R39 gain "with its refusal as it came".
