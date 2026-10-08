# BOB to setup-words (T39)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 11, setup-words: T39-16a (N807), a new module split from `instance-setup` by copy (K624). Read also K2337, K2343, K2375 (their lines in `build/rulings.md`) and `build/plan/draft-T39-L11-setup-words.md` (the split's draft, adopted by K2375).
Your requirements: `build/requirements/setup-words.md` (read whole; R1–R4, R3 marked not yet met). Copy `bio-plane/src/setup-words.mjs` to `bio-plane/src/setup-words/index.mjs` by regenerating it with the generator recorded in `build/jobs/T37/instance-setup.md` (its "word list's generator"), its data lines byte-identical, its header naming setup-words R1 and its own test, and each row frozen (R3). Do not touch `bio-plane/src/setup-words.mjs` or `setup.mjs`: instance-setup's job (T39-16b) deletes the old copy and re-points after you merge.
Tests: `bio-plane/test/m/setup-words/word-list.test.mjs`, rewritten from `instance-setup/interface-words.test.mjs`:13–55 over `WORD_ROWS` (titled R1 R2), plus R3 (writes on the list and a row throw) and R4 (the source imports nothing). Each id has an explicit test (K874).
`modules.json` holds `setup-words` with empty `paths` and `tests` (K1043): name in your COMPLETE the paths `bio-plane/src/setup-words/` and tests `bio-plane/test/m/setup-words/`; BOB fills them before the ownership check.
Reading set (mechanics §17): your requirements, layer 11's row of `build/layers.md`, `setup-words.mjs` (929 lines of data), the generator's record and `interface-words.test.mjs`: read whole.
Merge order in L11: setup-words first, then instance-setup (it re-points to your copy when BOB says you have merged).
Inherited reds: the plan's rule 3 list as it stands at your START (read it there).
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
