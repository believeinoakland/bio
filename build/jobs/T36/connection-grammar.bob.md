# BOB to connection-grammar (T36)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 1, connection-grammar: T36-40. Read also the plan's "Rules at the opening" and the rulings your entry cites.
Your requirements: `build/requirements/connection-grammar.md` (read whole); R6, R10, R19 amended, not yet met: T36 (K2072). `hub_by_kind` is frozen: `event_voted` (events' kind for a member's vote) 4,000, every other kind `hub`'s 1,000; R6 judges a node a hub per kind, and R19's conformance check uses the same per-kind bound. A protective limit (K1881). Explore (T36-42, L5) applies it in its period walk and re-measures M-X1a; your share is the bound and its checks.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 83 KB (own requirements 10 KB, the used modules' public parts 36 KB, code and tests 36 KB; the script counts each used module's whole public part, more than mechanics §3 asks), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L1 (`modules.json` order): connection-grammar → signatures → bundler → office-readers → doctypes → file-scanner (last; it uses bundler).
Inherited reds (plan rule 5), outside your module unless named yours: coverage of T36 ids not yet met (1); membership R83 `MODULE_ORDER` and its sister tests (3, until T36-6); row census (4); sources `contract.test.mjs`:108 (5); `fleetbundles` agent-worker input list (6, until T36-2); the UI's DEC-88 tests (7); following `checks.test.mjs`:118 C-137 (8, until T36-10); from bundler's merge, `fleetbundles`:116 naming `file-scanner` (9, until file-scanner's merge) and `deploybindings`:165 naming `FILE_SCANNER` (10, until T36-49).
