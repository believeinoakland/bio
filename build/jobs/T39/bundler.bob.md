# BOB to bundler (T39)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 1, bundler: T39-1 (N802). Read also the plan's "Rules at the opening" and K2302 (its line in `build/rulings.md`; AGENT-WORKER #14 J2).
Your requirements: `build/requirements/bundler.md` (read whole); no requirement changes. The entry is a test only: `bio-plane/test/system/fleetbundles.test.mjs`:237 pins agent-worker's 23 bundle inputs by name, and T38-9 renamed agent-model's `src/subscription.mjs` to `src/signin.mjs`. Re-pin from the committed manifest this suite reads (`agent-worker/dist/agent-worker.bundle.json`), with a dated comment naming what changed. This clears the plan's rule 3 item 5 (T38's red 16); `fleetbundles` must then read 129/0.
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 226 KB, under the 300 KB limit: read it whole, and state in your record that you did.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
Merge order in L1: bundler → pdf-reader → image-cover → doc-clean (doc-clean uses the other two and merges last).
Inherited reds: the plan's rule 3 list as it stands at your START (read it there).
