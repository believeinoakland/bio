# case-authoring (T29)

**Status** · session_01GeKDKfZzHTVtMfNysZDXp7 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

B2 applied and pushed (`job/T29/case-authoring` @ HEAD): the moved code, `materials.mjs`, `accepted.mjs`, the moved renderers and the C-120 rows are deleted; `publishCase` asks case-disclosures in R55's order; my tests 122/122 (R55 new: `disclosures.test.mjs`). Module 2,937 lines.

**Question (needs your file, `build/modules.json`):** my architecture check fails only because case-authoring's `uses` lacks `case-disclosures` (6 failures, all that edge). Please add `"case-disclosures"` to case-authoring's `uses`.

**My final uses (best reading of "record your final uses"):** the module's own code now imports only record-grammar, record-core, membership, inquiry, basis-versions, strength, bias, observation-log, reevaluation, publication, ratification, case-grammar, network-notices and case-disclosures, and reads provenance's, content's and extraction's tables under their stated read contracts (keep provenance, content, extraction). Its tests still import `contradiction`, `attestation`, `capture`, `sources`, `case-import` (and case-import's test fixture), `inquiry-grammar`, `promotion` and `credentials`, to build the real world `publishCase` runs over and to compare against their answers. The architecture check applies `uses` to tests too, so those stay unless you rule otherwise: if you want them gone, say so and I will rework the fixture (a sizeable change). Until you answer I keep them, and I change nothing else in `modules.json`'s entry.

Users unchanged (re-exports kept; `caseAuthoringOf(host, {contradiction, attestation, …})` still passes those to case-disclosures on first creation; `get attestation()` passes through). Tests of every importer: 1,397 pass, 3 fail, all control-plane: families.test.mjs ×2 (pre-existing on tranche/T29, as you named) and catalogue-end.test.mjs "R43, R22: every code decorated…" (`CO_ATTESTATION_UNACKNOWLEDGED lost its row`), same cause: `CHECK_FAMILY_FILES` lacks case-disclosures' `checks.mjs`, and now that my copy is gone (K529) the C-120 codes are undecorated until control-plane's L11 entry.

## J2 · COMPLETE

**Entries applied.** N529 (K1333; B1, B2, B3): the split, case-authoring's half.
- Deleted from this module: every judgment that moved (`#hunchDebt` … `#namedInRefusal`), `#publishCase`'s block assembly, `materials.mjs`, `accepted.mjs`, the moved renderers and sentences of `document.mjs`, and the C-120 family of `checks.mjs` (K529: no code held twice). Before deleting, each moved renderer was compared with case-disclosures' copy: byte-identical apart from `export` and one comment's id.
- R55: `publishCase` asks `case-disclosures` after R6 and before the case identity, in order: `hunchDebt`, `tensionsJudged`, `restingCaptures`/`captureFacts`/`selfAttestedJudged`, `materialsJudged`, `acceptedWorkJudged`, `flagsJudged`. It answers the first refusal. After R11, and only then, it asks `sourcesStated`, `withheldOf`, `findingFacts`, `methodOf` and `disclosureBlocks`. `document.mjs` writes their rows through case-disclosures' renderers, imported and never copied.
- R32 calls `tensionsRead`, and `tensionsUndetermined` when its own read throws. R34 and R53 call the same judgments.
- Users unchanged: `index.mjs` re-exports `CASE_DISCLOSURE_CHECKS` and the disclosure constants. `caseAuthoringOf(host, deps)` still accepts the dependencies case-disclosures reads and hands them to its factory on first creation, so `plane` and the fixtures compose one instance. `get attestation()` passes through until `plane` re-points (seam read §5).
- Tests: 73 references to retired ids re-tagged `R55 (case-disclosures Rn)`. The four R29 arms are rewritten: the C-120 table is case-disclosures' one table, re-exported, its `where`s there, and none of it held here. New `disclosures.test.mjs` proves R55:
  - the order, and the lists handed through as given;
  - each step's refusal stops the act there, writes nothing and draws no id;
  - nothing after R11 is asked when the searched section cannot be computed;
  - the answer's tensions are R1's entries, and the document's rows are case-disclosures' spelling.

**Final uses (B3, K1350):** `case-disclosures` added. The others are kept as they are: the code no longer imports contradiction, attestation, capture, sources, case-import, inquiry-grammar or promotion, but the tests use them to build the real world `publishCase` runs over.

**Deferred.** The `get attestation()` pass-through stays until `plane`'s L11 re-point (`caseDisclosuresOf(ctx, {attestation})` at store.mjs 173, and split.test). Its next case-authoring job drops it, together with the dependency hand-through in `caseAuthoringOf` once no caller passes them.

**Found in other modules (accepted reds, K1346, K1350):** control-plane's `CHECK_FAMILY_FILES` lacks `src/case-disclosures/checks.mjs`, so after my deletion the C-120 codes are undecorated. `catalogue-end.test.mjs` "R43, R22: every code decorated…" fails with `CO_ATTESTATION_UNACKNOWLEDGED lost its row`; `families.test.mjs` ×2 already failed on tranche/T29. All are cleared by control-plane's L11 entry. No generated artifact is staled by this job: `case-checker`'s `program.mjs` does not take case-authoring as an input.

**Tests and checks.**
- `node --test test/m/case-authoring/`: tests 122, pass 122, fail 0.
- The tests of every importer and user (affordances, case-carriage, case-checker, case-disclosures, case-grammar, conformance, control-plane, inquiry, op-declarations, plane, public-read, publication, ratification, record-core, review, skills): tests 1,402, pass 1,397, fail 3. The 3 are the control-plane reds above; on clean `tranche/T29`, control-plane alone has 2 fail, 144 pass.
- No layer tests are named in the manifest.
- format: 97 modules, 96 requirements files; 0 failures.
- architecture: 22 product files, 116 relative imports; 0 failures.
- coverage: 39 of 39 live requirement ids named by a test; 0 failures.
- ownership: 16 files changed by case-authoring between tranche/T29 and HEAD; 0 failures.

Size (session_01GeKDKfZzHTVtMfNysZDXp7): test runs 9, module lines 2937
