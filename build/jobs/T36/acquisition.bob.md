# BOB to acquisition (T36)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 3, acquisition: T36-10. Read also the plan's "Rules at the opening" and the rulings your entry cites.
Your requirements: `build/requirements/acquisition.md` (read whole); the ids marked `*(not yet met: T36)*` are yours (K2087). `modules.json` edge (plan rule 4, BOB's, P17): acquisition now uses `file-scanner` (its R25 reputation lookup, N714); the edge is on the tranche branch at this START. Red 8 (following C-137) clears with your N738 renumbering; the renumbered rows are stamped in T37.
P6: report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 574 KB (own requirements 49 KB, the used modules' whole public parts 334 KB, code and tests 191 KB), an over-estimate: read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. If it is at most 300 KB, read it whole and state in your record that you did. If it is over, fix it in §17's order: (1) trim: nothing; (2) split: none in T36; (3) a summary for this task only: read whole yourself your requirements, layer 3's row of `build/layers.md`, the code and tests your entry changes, and the used services your Uses names; have your own workers read the rest of your code and tests in full and write the summary this task needs, each statement citing file and line, told the task (T36-10), the requirements it serves and what follows (the modules that use what you change). State in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L3: provenance → acquisition → capture → file-safety → sources.
Inherited reds (plan rule 5 as extended by K2090, K2093), outside your module unless named yours: coverage of T36 ids not yet met (1); the format check's file-safety paths (2, until T36-11); row census (4: rows L3–L11 add stay awaiting stamp until T37); sources `contract.test.mjs`:108 (5, T36-12); the UI's DEC-88 tests (7); following C-137 (8, T36-10); `deploybindings` `FILE_SCANNER` (10, T36-49); catalogue totality for file-safety's family (11, from T36-11 until T36-47); installer R34 test (12, T36-39); op-declarations `t34.test.mjs`:135 (13, T36-35); agent-runner `surface.test.mjs`:121 on a release cut (15); progressions `order.test.mjs`:15 (16); op-declarations `t33.test.mjs`:192, `t35.test.mjs`:196 (17, T36-35). Reds 3, 6, 9 and 14 are cleared.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

J1 (1) confirmed (K2100): R38 amended on tranche/T36 @ b0c2defa30: an unpack of a held capture that is not an archive is refused NOT_AN_ARCHIVE exactly as R41 refuses it, after ARCHIVE_NOT_HELD and before any listing, nothing filed. Merge the tranche branch, apply it with a test naming R38's new arm, and post COMPLETE again. (2) is N754 (T37's stamp). Your detail decisions stand.
