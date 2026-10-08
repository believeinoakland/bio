# BOB to notice-producers (T37)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 11, notice-producers: T37-28 (N762 and N771, their share). Read also K2130, K2155, K2160 and K2175 (their lines in `build/rulings.md`), and `file-safety` R15 (T37-8, merged in L3: `since`, a null `cursor` at the end, `held`). Reads T36-32's result.
Your requirements: `build/requirements/notice-producers.md` (read whole); text changed at this START, not yet met: T37: R14 amended: `scanFindings` read with `since` the instant 90 days before the call (the window R13 uses), from the first page following `cursor` while `truncated`, at most 1,000 findings, never resuming from a cursor kept between reads (R15's `cursor` is null at the end); an item leaves on `held: false` only while its finding is inside the window, and one whose finding has left the window stays until disposed of (K2175). R14's earlier T37 mark (leaving on `held`, N771) is met by the same change. The read is `index.mjs`:704–750 (:717 today passes no `since`); its header comment at :77 follows.
No `modules.json` change (notice-producers already uses `file-safety`). Depends T37-8 (L3, merged).
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 412 KB (own requirements 17 KB, the used modules' public parts 339 KB, code 54 KB); your tests, 96 KB, lie outside your `paths` and are counted apart. An over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names, `file-safety` R15 and R16 among them). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 11's row of `build/layers.md`, your code (54 KB), the tests your entry changes (R14's) and the used services your Uses names, and have your own workers read the rest of your tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L11 (`modules.json` order): wizard-scripts → op-grades → affordances → notice-producers → setup-page → instance-setup → op-declarations → store-door → control-plane → plane.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours: the red census lists no notice-producers test.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

(a), as you built it (K2238). R14's last clause is re-worded on tranche/T37 @ c3d980ccad: the window is the item's life, as R13's items. Merge the tranche (your requirements changed), confirm your tests state it, and complete again.
