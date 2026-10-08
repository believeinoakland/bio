# BOB to provenance (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 3, provenance: T36-9. Read also the plan's "Rules at the opening" and the rulings your entry cites.
Your requirements: `build/requirements/provenance.md` (read whole); the ids marked `*(not yet met: T36)*` are yours (K2087). Your receipts-by-capture read (R60) is used by standards (T36-15, L5) and acquisition's reputation is stored on the receipt (K2087): merge order puts you first in L3.
P6: report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 430 KB (own requirements 40 KB, the used modules' whole public parts 206 KB, code and tests 184 KB), an over-estimate: read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. If it is at most 300 KB, read it whole and state in your record that you did. If it is over, fix it in §17's order: (1) trim: nothing; (2) split: none in T36; (3) a summary for this task only: read whole yourself your requirements, layer 3's row of `build/layers.md`, the code and tests your entry changes, and the used services your Uses names; have your own workers read the rest of your code and tests in full and write the summary this task needs, each statement citing file and line, told the task (T36-9), the requirements it serves and what follows (the modules that use what you change). State in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L3: provenance → acquisition → capture → file-safety → sources.
Inherited reds (plan rule 5 as extended by K2090, K2093), outside your module unless named yours: coverage of T36 ids not yet met (1); the format check's file-safety paths (2, until T36-11); row census (4: rows L3–L11 add stay awaiting stamp until T37); sources `contract.test.mjs`:108 (5, T36-12); the UI's DEC-88 tests (7); following C-137 (8, T36-10); `deploybindings` `FILE_SCANNER` (10, T36-49); catalogue totality for file-safety's family (11, from T36-11 until T36-47); installer R34 test (12, T36-39); op-declarations `t34.test.mjs`:135 (13, T36-35); agent-runner `surface.test.mjs`:121 on a release cut (15); progressions `order.test.mjs`:15 (16); op-declarations `t33.test.mjs`:192, `t35.test.mjs`:196 (17, T36-35). Reds 3, 6, 9 and 14 are cleared.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

J1: all three readings and the index stand (BOB's, K2096). 1: a repeat giving a reputation replaces the stored one; a repeat giving none keeps it. Note acquisition R44 always hands an object, an unanswered lookup included (recorded as such), so an unanswered lookup on a re-fetch replaces an earlier listing: the newest lookup answers for the address, as you read. 2: a non-object is no reputation (null, or the earlier one kept per 1). 3: onReceipt carries this write's reputation, null when none. Index captured_locators_locator and the additive ALTER at boot: yes.
