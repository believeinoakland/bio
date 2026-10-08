# BOB to store-door (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 11, store-door: T36-48. Read also the plan's "Rules at the opening", K2130 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L11-reqs.md`, your section and its "BOB's review"; Suggestions bind nothing) and the rulings your entry cites.
Your requirements: `build/requirements/store-door.md` (read whole); req: none (K2130): R2 already requires the reads declared to name no project to be listed with the reason, so `PROJECT_NAMING_READS_NOT` gains `verdictnotes`, `threatof`, `originalstate`, `safeview` and `safecopy`, each with "`captureSha` is a CAPTURE's digest" (K2063). Check the other `file-safety` reads that take a parameter (`scanfindings`' `after`, `findingkind`'s `name`, `securitytoolevents`) against R2's table; each R2's test reaches joins the list with its reason. R10's read of `assistantState` is unchanged in shape (T36-34 changes what it answers). N761 (a grant's `secretSha` in the body, R9) is T37's, not yours.
Edge: store-door uses `file-safety`, added at this START for your tests' route list (K2152; your Uses names it); your code may import it too if R2 needs it.
P6: 533 lines on `tranche/T36` (own `paths`, code only, tests excluded; +about 5); report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 874 KB, an over-estimate (it counts each used module's whole public part; it counts no tests): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 11's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task (T36-48), the requirements it serves and what follows (control-plane and plane, which run the store's door); state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Layer 11 has 16 jobs; merge order: wizard-scripts → op-grades → affordances → tasks → notice-producers → queue → setup-page → instance-setup → op-declarations → legacy-ui → installer → admission → answer-envelope → store-door → control-plane → plane (`modules.json` order, except N711's callers before admission); you are 14th.
Inherited reds: the plan's rule 5 list as it stands at your START (read it there; open at this writing: 1, 4, 7, 10–13, 15–20, 22–24, 26, 27). None is yours. Expect among your users' tests the reds rule 5 names for control-plane and plane until their jobs merge.
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

CHANGE (K2157; CONTROL-PLANE #25 J1 (1)): new R13 in your requirements: a route-map answer that is a `Response` (file-safety's byte answers `openoriginal`, `openwithwarning`, `safeview`, `safecopy`) is returned as given, never wrapped in R1's envelope (`dispatch.mjs`:305). Merge the tranche branch, apply it with a test naming R13, and post COMPLETE again. Your J1 (2): instance-setup R55 now states `assistantGate()` stays, name and shape (K2157).
