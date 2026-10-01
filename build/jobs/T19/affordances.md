# affordances (T19)

**Status** · session_01AaEsUvTJpxjt1vZfqghxZb · depth 2 · COMPLETE · handled B1

## J1 · REPORT

What I found outside my module while doing this job. None of it blocks my job.

1. **legacy-index / control-plane: an unused import.** `src/index.mjs`:56 still imports `decorateAct` from `control-plane/ops.mjs`. Since the `op=affordances` arm moved out, nothing in that file uses it (op=queue uses `ACT_GATE` only). I left the line alone, because editing it would add a line in a legacy file that is not an import from my own paths (§12.2). Whichever job next edits that file can drop `decorateAct` from it.
2. **Generated artifact made stale (§14).** My change moves code that `src/index.mjs` bundles, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`) are stale. I did not regenerate them; that is yours at layer close.
3. **My requirements and `modules.json` (your files).** No affordances file now imports `checks/bio-checks.mjs`, so `legacy-checks` can leave affordances' `uses` in `modules.json`. In `build/requirements/affordances.md`, the Uses line that starts "`legacy-checks`: `STATES`, …" can be re-worded to name record-grammar, action-grammar and basis-versions. The "*(not declared)*" notes on record-core, promotion, connections, basis-versions and the vocabulary providers are now stale too: each of those is declared. R26's "*(not yet met …)*" mark can be struck (see my COMPLETE).
4. **The catalogue's copies (already known, B1).** `checks/bio-checks.mjs` still holds its own `SUFFICIENCY_CLAIM_STATES` (:309) and `VERSION_MACHINE` copies, which are different objects from basis-versions'. Before this job, `VOCABULARIES.sufficiency_claim_states` published the catalogue's copy and so did not meet R4 (same reference as the enforcing module). It now publishes basis-versions' object. The copies go with control-plane's last act, as B1 says.
5. **Old root suites (legacy-tests' territory), for information.** Of the old suites that drive `op=affordances`, six were red before my change and are red identically after it, subtest for subtest: `d311-roster-affordances` (21/1), `founder-sight` (36/2), `project-discoverable` (1/2), `publish`, `skillpack` and `sufficiency-state`. The last three fail on load: missing `src/ai-runs/checks.mjs`, and `bio-checks.mjs` exports `SUBJECT_POSITIONS` and `isSufficiencyClaimed` that the suites expect. `rec132`/`rec149` also throw `ENOENT …/site-profiles/index.mjs` in their battery copies. `citeproject-inquiry`, `project-authority` and `conclude-project-arm` are green.
6. **K819's contradiction arm: no REPORT needed.** contradiction's own take-up path writes a question with two basis legs, one for each side, so it does not conclude a question that has no leg. Only my fixture inquiry had no leg, and I gave it one.

## J2 · COMPLETE

**Entries applied** (plan layer 11, affordances; START B1):
- **The `op=affordances` arm moved in** (index §4.1 (1)). New `src/affordances/door.mjs`, exported from `affordances.mjs`, holds two things:
  - `affordancesAnswer({target, facts, kinds, gate})`, R17's composition. It is pure, and every act, capture act and set act goes through `decorate(act, gate)` (R11).
  - `affordancesOp(url, stub, {json, doAnswer, storeSilent, storeRefusal, gate, viewer, identity, author, by, storeName, cls})`, the door's arm. It asks the store `actionkinds` and `affordancefacts` and answers through the envelope and silence answers it is handed: 404 for NO_SUCH_BUNDLE, 400 for any other refusal, as before.
  - `src/index.mjs` keeps the four stamp expressions and their comments, unchanged (control-plane's), and calls `affordancesOp` with `ACT_GATE`. Ownership: legacy-index +3 lines (the import and the two-line call), −100.
- **Rule 1 re-points.** No affordances file imports `bio-checks.mjs` any more:
  - From record-grammar: `affordances.mjs`' `STATES`, `normalizeType`, `vocabFor`, `EARNED_CAPTURE_CEILING` and `UNREACHABLE_CAPTURE_GRADE`, and `facts.mjs`' `normalizeType`, `parseFrontmatter` and `isMachineIdentity`.
  - From basis-versions: `SUFFICIENCY_CLAIM_STATES`.
  - From action-grammar: the action vocabularies `PRODUCT_KINDS`, `RISK_TIERS`, `LAW_LEVELS`, `ACTION_BASIS_KINDS`, the three `CORRESPONDENCE_*` and `RESOLUTIONS` (R26; K768, K787, K837). They used to come from `actions/index.mjs`. Nothing was read from `actions/checks.mjs`.
  - The comments at the old :197 and :346 are re-worded.
- **Tests re-pointed.**
  - `catalogue.test.mjs` no longer uses `import * as C`. It reads `STATES`, `BASIS_GRADES` and the two capture grades from record-grammar, `SUFFICIENCY_CLAIM_STATES` from basis-versions, and `ACTION_KINDS`, `actionKinds` and the vocabularies from action-grammar.
  - `derive.test.mjs` reads `VERSION_MACHINE` from basis-versions and the rest from record-grammar.
  - `plane.test.mjs` reads `actionKinds`, `PRODUCT_KINDS` and `RISK_TIERS` from action-grammar, and its header now says R17 is this module's.
- **K823, K834, K835.** `JUSTIFICATION_REFUSALS` gains `INTENT_NO_REASON`, `CONFORMANCE_NO_REASON` and `ESCALATION_NO_REASON`. `NO_REASON` stays, because other acts still answer it. RUNGS' comments for goalclose, aspirationdepart, triage, the four escalation acts and determine are re-worded, as is RUNG_ABSENT's note on `determine`. The catalogue's R19 family test names the three codes.
- **K819.** `contradiction.test.mjs`' half-hidden inquiry now rests on one basis leg, the visible side's document. contradiction's own take-up writes legs, so no REPORT was needed.
- **K789.** Nothing was red. My fixtures build membership through other modules' fixtures or through the plane's `op=claim`, which passes on tranche/T19.
- **New test `door.test.mjs`** (8 tests) covers R17 at both interfaces: the catalogue and target shapes, refusals as given, the stamps sent exactly as handed in, 404/400, silence and refusal on either question (REC-52), and only reads (R22).

**R met, with the tests that name them** (all under `test/m/affordances/`): R1 catalogue, derive, sources · R2 catalogue, backing, plane, sources · R3 catalogue · R4 catalogue (the same reference, now including `sufficiency_claim_states` as basis-versions' object) · R5 catalogue, converts · R6 catalogue · R7 catalogue · R8 derive, contradiction, converts, plane · R9 derive, catalogue, plane · R10 derive, contradiction, converts, plane · R11 services, door · R12 services, catalogue · R13 ops, plane, door · R14 ops, plane, contradiction, converts · R15 ops, plane, converts, door · R16 plane · R17 door, plane, catalogue · R18 plane, contradiction, converts · R19 plane, backing, contradiction, sources, catalogue · R20 plane, contradiction, converts, sources · R21 plane, converts · R22 ops, services, door, plane · R23 plane, converts · R24 services, catalogue, plane · R25 catalogue · R26 catalogue, plane (**newly met**: action-grammar's `RISK_TIERS`, the same reference; the "*not yet met*" mark can be struck) · R27 catalogue, backing · R28 catalogue · R29 catalogue.

**Deferred:** nothing.

**Found in other modules** (REPORT J1): the unused `decorateAct` import at `src/index.mjs`:56; the `bio-plane` bundle, stale; affordances' `uses` and Uses line (legacy-checks can go); the catalogue's `SUFFICIENCY_CLAIM_STATES`/`VERSION_MACHINE` copies; six old root suites red, identical before and after my change.

**Tests and checks run:**
- `node --test test/m/affordances/`: before, 123 tests, 118 pass, 5 fail (the accepted reds: K819 ×1, K823, K834, K835). After: **131 tests, 131 pass, 0 fail**.
- Users of the arm: skills pack and planning, op-declarations gate, basis-versions conclude-project-arm, sufficiency-state and versionstate, control-plane affordances-pack. **53 pass, 0 fail.**
- The old root suites driving `op=affordances`: 3 pass, 6 fail, identical with and without my change.
- `checks/format.mjs`: 87 modules, 82 requirements files; 0 failures.
- `checks/architecture.mjs bio affordances`: 13 product files, 89 relative imports; 0 failures.
- `checks/coverage.mjs bio affordances`: 29 of 29 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio affordances tranche/T19`: 10 files; legacy-store +0/−0, legacy-index +3/−100; 0 failures.

Size (session_01AaEsUvTJpxjt1vZfqghxZb): test runs 6, module lines 3095
