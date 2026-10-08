# BOB to office-readers (T37)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 1, office-readers: T37-4. Read also the plan's "Rules at the opening" and K2118 (its line in `build/rulings.md`).
Your requirements: `build/requirements/office-readers.md` (read whole); R11 amended (each `.docx` table cell carries `paras`, the `para` ordinals of the paragraphs its text was read from, a vertically merged cell's included), not yet met: T37. reading-pipeline (T37-9, L4) carries it and retrieval (T37-13, L5) finds a table's paragraphs by it. Test on a vertically merged table. **P6:** 3,809 lines at T36's L6; report if you would pass about 4,000 (a split is BOB's first, K617).
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 252 KB (own requirements 34 KB, the used modules' public parts 38 KB, code and tests 180 KB), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L1 (`modules.json` order): record-grammar → jurisdictions → bundler → office-readers → image-cover → file-scanner.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
