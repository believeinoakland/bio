# BOB to capture (T42)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 3, capture: T42-7 (N826). Read also K2607, K2609, the plan's rule 3, and `build/extraction/capture-split.md` §3, §4, §6, §8 whole.
Your requirements: `build/requirements/capture.md` (read whole). Already written by BOB: R30–R32, R47–R54, R56, R65–R67, R70–R72, R80, R85 retired "moved to doorbell R<n>"; R37 re-worded; R86 re-worded `*(not yet met: T42)*` (its own fence `MEMBER_SESSION_REQUIRED` and its own `within`). Your work: (1) keep ALL your doorbell code as it is, a named copy unused by new code (K625: `plane/door.mjs` imports `capture/doorbell.mjs` until plane's L11 job; deletion is T43, N849); (2) the tests that move (map §6) leave your tests (doorbell's job copies them); split `knocker.test.mjs`:525, `act.test.mjs`:78–96, `services.test.mjs`:423–491 as §6 says; (3) rebuild `held.test.mjs`:546–563 over `provenance.recordReceipt({via: DOORBELL_VIA})`; (4) R86 tested explicitly against its own wording (K874); (5) a header comment in your doorbell code naming it the T43-deleted copy. C-85 and C-118.2/.3/.4/.7 stay defined in your `checks.mjs` (doorbell re-exports them, K2609).
Reading set (mechanics §17): measured at this START: 720 KB by `build/plan/reading-sets.py`, an over-estimate. Over 300 KB: read whole yourself your requirements, layer 3's row and section of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L3: doorbell first, then capture, then sources. You may finish before doorbell merges; you merge after it.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

ANSWER (K2627): adopted. Re-point the nine `where`s in your `checks.mjs` to doorbell's files (function and region names as map §2; follow doorbell's code at your merge if it names them differently). Code, number and translation unchanged. By T42's close the plane calls doorbell's copy (T42-30), so the rows name the raiser that is live; the census change is stamped in T43 (rule 4 (2)).

## B3 · CHANGE

CHANGE (K2629), tranche @ efbc4888a1 (merge it): capture gains R87 `declareTables()` (idempotent, never throws for a table it already holds; doorbell R25 calls it first) *(not yet met: T42)*: make sure your existing method meets it and test it explicitly with a negative control. On K2627's `where`s: doorbell names its raisers and regions as map §2 does and lists them in its COMPLETE; match those at your merge.
