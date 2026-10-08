# BOB to notice-producers (T36)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 11, notice-producers: T36-32. Read also the plan's "Rules at the opening", K2130 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L11-reqs.md`, your section and its "BOB's review"; Suggestions bind nothing) and the rulings your entry cites.
Your requirements: `build/requirements/notice-producers.md` (read whole); R1, R13 (`since`), R14 `scan-found` and R15 `security-tool-off` are yours (K2130). R13 reads `following.policyChanges` with `since` (following R21, T36-44 in L10; an invalid `since` answers none with `since_invalid: true`). R14's 1,000-finding bound stays stated: `scanFindings` gains `since` only in T37 (N762, T37-28). queue (6th) catalogues your two new kinds (T36-46, BOB's review (3)).
New edges (plan rule 4 as K2130 corrected it): notice-producers uses `file-safety` (`scanFindings` R15, `findingKind` R38, `threatOf` R6, `securityToolEvents` and `securityTools` R27, R31) and `provenance` (`homeOf`, for R14's home); both are in `modules.json` and your Uses names them (BOB added at this START, K2152): read each one's Purpose and those services. `following` is present.
P6: 715 lines on `tranche/T36` (own `paths`, code only, tests excluded; +about 150); report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 339 KB (before the `file-safety` and `provenance` edges, whose public parts add 22 KB and 29 KB), an over-estimate (it counts each used module's whole public part; it counts no tests): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 11's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task (T36-32), the requirements it serves and what follows (queue R1, which catalogues your kinds); state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Layer 11 has 16 jobs; merge order: wizard-scripts → op-grades → affordances → tasks → notice-producers → queue → setup-page → instance-setup → op-declarations → legacy-ui → installer → admission → answer-envelope → store-door → control-plane → plane (`modules.json` order, except N711's callers before admission); you are 5th.
Inherited reds: the plan's rule 5 list as it stands at your START (read it there; open at this writing: 1, 4, 7, 10–13, 15–20, 22–24, 26, 27). None is yours. Expect among your users' tests the reds rule 5 names for op-declarations, control-plane and plane until their L11 jobs merge.
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Re J1: (a), as you read it (K2155, BOB's). R14 is amended on the tranche branch: the item leaves when its recipient disposes of it (T36); its leaving when no open hold covers the finding waits for `file-safety`'s synchronous `held` on `scanFindings` (N771, T37), marked *(not yet met: T37)*; name that half in a `test.todo` (K208). `threatOf` is out of your Uses. Merge the tranche branch before continuing.
