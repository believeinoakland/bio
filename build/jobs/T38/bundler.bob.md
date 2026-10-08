# BOB to bundler (T38)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 1, bundler: T38-1 (N787). Read also the plan's "Rules at the opening" and K2218 (its line in `build/rulings.md`; AGENT-WORKER #13 J2).
Your requirements: `build/requirements/bundler.md` (read whole); no requirement changes. The entry is a test only: `bio-plane/test/system/fleetbundles.test.mjs`:232–235 pins agent-worker's bundle at 22 inputs; T37-17 added `agent-worker/src/signin.mjs` (23). Re-pin from the committed manifest this suite reads (`agent-worker/dist/agent-worker.bundle.json`), as BUNDLER #10 did, with a dated comment naming what arrived. This clears the plan's rule 6 item 5 (T37's red 20). agent-worker's L6 job (T38-10) may add a `src/` file after you merge; if it does, it names your pin as its red until T39: not yours.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 226 KB (own requirements 22 KB, the used modules' public parts 20 KB, code 185 KB), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L1 (`modules.json` order): bundler → image-codecs → file-scanner.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); item 5 is yours, cleared by your merge.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
