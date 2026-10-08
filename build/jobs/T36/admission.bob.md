# BOB to admission (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 11, admission: T36-36. Read also the plan's "Rules at the opening", K2130 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L11-reqs.md`, your section and its "BOB's review"; Suggestions bind nothing), K2129 (with `build/plan/draft-T36-L8-L10-reqs.md`'s "F1's tail in L11" section and its "BOB's review", for R20 and R14's C-38.10) and the rulings your entry cites.
Your requirements: `build/requirements/admission.md` (read whole); R5 (`MEMBER_TOKEN_RETIRED`, **C-38.11**, not the draft's C-38.10, BOB's review), R20 (`CREDENTIAL_IN_ADDRESS`, C-38.10, a 400 refusal, its one site, K2129), R22 (its tally through `credentials`' `securitycount`, credentials R50, merged in T36-7, and counting `MEMBER_TOKEN_RETIRED` as kind `credential`) and R14 are yours. Digests are still compared with all four bindings (`BINDINGS`, `admission/index.mjs`:222). Edge: `credentials` present in `modules.json`; none new. New refusals add rows that T37's promotion job stamps (red 4); name every row you add or re-word in your COMPLETE (C-38.10 and C-38.11 among them).
P6: 1,260 lines on `tranche/T36` (own `paths`, code only, tests excluded; +about 30, and R20); report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 346 KB, an over-estimate (it counts each used module's whole public part; it counts no tests): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 11's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task (T36-36), the requirements it serves and what follows (control-plane, which runs your gates in R28's order, and op-declarations' three binding classes); state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Layer 11 has 16 jobs; merge order: wizard-scripts → op-grades → affordances → tasks → notice-producers → queue → setup-page → instance-setup → op-declarations → legacy-ui → installer → admission → answer-envelope → store-door → control-plane → plane (`modules.json` order, except N711's callers before admission); you are 12th. Merge the tranche branch after instance-setup's, op-declarations', legacy-ui's and installer's merges (N711's callers) when BOB says so: refuse a `class:member` bearer only then; no release is needed between (K2063). After your merge BOB walks Bob through removing `BIO_MEMBER_TOKEN` from the environment; nothing of that is yours.
Inherited reds: the plan's rule 5 list as it stands at your START (read it there; open at this writing: 1, 4, 7, 10–13, 15–20, 22–24, 26, 27). None is yours. Expect among your users' tests the reds rule 5 names for control-plane (22–24, 26) and plane (10, 27) until their jobs merge.
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

CHANGE (K2157): R20's gate is named: export `credentialAddressGate(url)`, answering `null`, or `{status: 400, body}` as your other gates do; control-plane calls it directly after R1 (its R28, R59). Merge the tranche branch (R20 re-worded) and carry on.

## B3 · ANSWER · re J1

Re J1 (BOB's, P17): (1)–(4) stand as you read them; none changes a requirement's meaning. Also read B2 (K2157): the R20 gate is named `credentialAddressGate(url)`; merge the tranche branch for R20's re-wording.
