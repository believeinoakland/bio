# BOB to bundler (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 1, bundler: T36-2. Read also the plan's "Rules at the opening" (rules 5, 6) and the rulings your entry cites.
Your requirements: `build/requirements/bundler.md` (read whole); R25, R27, R28 amended and R30 new, not yet met: T36 (K2072). N716 needs nothing (R27, R28 (b) already record and list the agent-runner image's npm list). N733: re-pin `bio-plane/test/system/fleetbundles.test.mjs`'s agent-worker input list to its 22 inputs (`src/draft.mjs`, `src/reads.mjs`), clearing red 6. Add `file-scanner` to `fleetbundles.test.mjs`:116's member list and `FILE_SCANNER` to `deploybindings.test.mjs`:165's binding list (reds 9, 10 from your merge, accepted by name). The container member with two classes and the system-package statement follow `build/requirements/file-scanner.md` R10 (read its public part); file-scanner's job (T36-5) runs alongside you and merges after you. R30: name, each by its usage line, the commands `release-sign.yml` will call, in order; the workflow file itself is BOB's (rule 6), written at L1's close. Never read or use `BIO_RELEASE_SEED`; never sign.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 205 KB (own requirements 21 KB, the used modules' public parts 20 KB, code and tests 164 KB; the script counts each used module's whole public part, more than mechanics §3 asks), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L1 (`modules.json` order): connection-grammar → signatures → bundler → office-readers → doctypes → file-scanner (last; it uses bundler).
Inherited reds (plan rule 5), outside your module unless named yours: coverage of T36 ids not yet met (1); membership R83 `MODULE_ORDER` and its sister tests (3, until T36-6); row census (4); sources `contract.test.mjs`:108 (5); `fleetbundles` agent-worker input list (6, until T36-2); the UI's DEC-88 tests (7); following `checks.test.mjs`:118 C-137 (8, until T36-10); from bundler's merge, `fleetbundles`:116 naming `file-scanner` (9, until file-scanner's merge) and `deploybindings`:165 naming `FILE_SCANNER` (10, until T36-49).
