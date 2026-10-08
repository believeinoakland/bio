# BOB to setup-page (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 11, setup-page: T36-33. Read also the plan's "Rules at the opening", K2130 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L11-reqs.md`, your section and its "BOB's review"; Suggestions bind nothing) and the rulings your entry cites.
Your requirements: `build/requirements/setup-page.md` (read whole); R18 and R24 (restated: DEC-172's two separate choices, nothing preselected; the keep-away line, `on` neither `true` nor `false` stated as not read) and R30 (the optional security-tools step) are yours (K2130). The page never sends `op=assistantset` (retired, T36-34). The words for "or later in Settings › Security" were asked of UX-DESIGN (K2130); until given, say the meaning plainly. Bob ruled (K2147) that "Sign in with Claude" gets no interim control on this page: nothing of N708 is yours. Once control-plane R62 merges, R26's record-browser download answers `SAFE_VIEW_ONLY` for a high-risk file: that follows from the approved package, not a regression (the draft's "For BOB" 8).
New edge (plan rule 4): setup-page uses file-safety, for your tests only (R30's ops in their documented shapes); it is in `modules.json` and your Uses names it (BOB added at this START, K2152): read `file-safety`'s Purpose and R27–R30. `credentials` is present (`aikeepaway`, `aikeepawaystate`, R51, R52, merged in T36-7).
P6: 2,375 lines on `tranche/T36` (own `paths`, code only, tests excluded; +about 150–250); report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 396 KB (before the `file-safety` edge, whose public part adds 22 KB), an over-estimate (it counts each used module's whole public part; it counts no tests): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 11's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task (T36-33), the requirements it serves and what follows (instance-setup R53, whose `assistantState` now follows keep-away, and control-plane, which routes the ops you send); state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Layer 11 has 16 jobs; merge order: wizard-scripts → op-grades → affordances → tasks → notice-producers → queue → setup-page → instance-setup → op-declarations → legacy-ui → installer → admission → answer-envelope → store-door → control-plane → plane (`modules.json` order, except N711's callers before admission); you are 7th.
Inherited reds: the plan's rule 5 list as it stands at your START (read it there; open at this writing: 1, 4, 7, 10–13, 15–20, 22–24, 26, 27). None is yours. Expect among your users' tests the reds rule 5 names for op-declarations, control-plane and plane until their L11 jobs merge.
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Re J1: your reading stands (K2155, BOB's). Your code imports `file-safety`'s `onOwnServers` and `DEEPER_CHECKS_PER_MONTH` and injects them into the page (as `riskTierState`), never a copy; your Uses line is amended to say so on the tranche branch. "Every file" is offered only where `onOwnServers` says so (R30). Merge the tranche branch before continuing.
