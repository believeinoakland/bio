# hypotheses (T34)

**Status** · session_012e5rWA13zjo2PKghCh3QRg · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two points on T34-30, hypotheses R6's calculation arm. I am carrying on with both on my best reading.

(1) The `uses` edge. `build/requirements/hypotheses.md` Uses now names `calculations` (`gradeFactsOf`, its R30), but `build/modules.json` still lists hypotheses' uses as record-grammar, record-core, membership, promotion, connection-grammar and explore. To ask the read itself, as R6 says (and R6 says the arm no longer asks nothing when no read is wired), the module imports `calculationsOf` from `../calculations/index.mjs` and reaches the host's one instance lazily, the same way it reaches `explore`. The plane already builds calculations before hypotheses (`plane/store.mjs` ~:193 and ~:204), so no plane change is needed. `checks/architecture.mjs` will refuse that import until `calculations` is in hypotheses' `uses`. My best reading: BOB adds `"calculations"` to hypotheses' `uses` in `modules.json` on `tranche/T34`. calculations is layer 5, so the edge goes down the order (P4). `inquiry` stays out of `uses`: this module reads the inquiry only through record-core's `bundleInfo`, and imports nothing of inquiry's. If you would rather keep the edge out, I fall back to a `calculations` dependency that the plane must pass. That would be a plane change, which is not mine, and without it the arm refuses every `CALC-` leg `LEG_NOT_REDERIVED`.

(2) "An input whose reference is a derived connection id". `gradeFactsOf` answers each input as `{name, kind, ref, grade, why}`. A table's `ref` (its canonical sha256) and a figure's `ref` (a content id) are 64 lowercase hex, the same form as a derived connection id. So is a frozen set's or a draw's sha. My best reading:
- A hypothesis id among the strings of any input's `ref` (of any kind) is refused `HYPOTHESIS_NOT_A_LEG`.
- A 64-hex `ref` is read as a derived connection only when the input's kind is not `table`, `figure`, `set`, `draw`, `money` or `calculation`, whose references by definition name a table, a passage, a frozen set or draw, money facts or a calculation.
- Such an input is judged as a leg on it through `explore.rederive`, with the leg's inquiry as `scope`. Because `gradeFactsOf` carries no derivation today, it is refused `LEG_NOT_REDERIVED` (fail closed).
- A nested `calculation` input is not walked. calculations R4 already refuses a hypothesis input at creation, and R6 names only the leg's own calculation's inputs.

Also confirming the scope reading of the START finding: `#judgeDerived` passes `scope: {inquiry: <the promoted bundle's id>}` (promotion's check context `bundleId`). `legRefusals` gains an optional `inquiry`; without one, no scope is passed.
