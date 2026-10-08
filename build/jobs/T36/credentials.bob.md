# BOB to credentials (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 2, credentials: T36-7. Read also the plan's "Rules at the opening" and the rulings your entry cites (K1929, K1946, K1957, K2038; DEC-172 in `docs/development/DECISIONS.md`, read whole), and K2081.
Your requirements: `build/requirements/credentials.md` (read whole); R29, R35, R45 amended and R49–R52 new, not yet met: T36 (K2081). R29: the `security:<tool_id>` services `file-safety` holds (its R28, R30; read `build/requirements/file-safety.md`'s public part): a key may be a set of named fields held as one value, and a set with no key removes it. R35 (DEC-172): keep-away refuses every account `AI_KEPT_AWAY` with its reason before any account is read; R27 and R32 mint nothing then; otherwise a member's own reference is always served (K1757's "the group's key only" retired: find and retire it wherever this module still enforces it). R45 (N743): a failed read answers `level: null`, never `Ordinary`. R49 `securityTotals` (in-plane only, a failure never zeros); R50 the `securitycount` route for admission R22 (N744; admission's own change is T36-36); R51 `aiKeepAwaySet`, R52 `aiKeepAwayState`. New refusals add rows promotion stamps in this layer (T36-8): name every row you add in your COMPLETE. **P6:** 2,504 lines at the opening; report if you would pass about 4,000.

Reading set (mechanics §17, N739): measured at this START: 308 KB by `build/plan/reading-sets.py`, which counts each used module's whole public part (113 KB); read as mechanics §3 asks (each used module's Purpose and the services your Uses names) your set is about 230 KB (own requirements 43 KB, code and tests 152 KB, the used services and DEC-172), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L2: membership → credentials → promotion (last; it stamps the layer's rows).
Inherited reds (plan rule 5 as extended by K2084), outside your module unless named yours: coverage of T36 ids not yet met (1; file-safety's until L3, credentials R49–R52 until its merge); membership R83 `MODULE_ORDER` and its sister tests (3, until T36-6); row census (4, until T36-8); sources `contract.test.mjs`:108 (5); the UI's DEC-88 tests (7); following C-137 (8); `deploybindings` `FILE_SCANNER` (10, until T36-49); installer R34 test (12, T36-39); op-declarations `t34.test.mjs`:135 (13, T36-35); membership `members.test.mjs` D-57 (14, T36-6). Reds 6 and 9 are cleared.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
