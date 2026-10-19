# provenance (T51)

**Status** · session_01RpNUgdyt5VkXqp8Ksfx3zR · depth 2 · WORKING · handled B0

## J1 · REPORT

Findings in other modules, seen while running `checks/run.mjs` on tranche T51 with my commit c9df90b413 (not fixed here: another module's to change, P9).

- provenance-routes (src and tests; the module is not mine): 14 `plain` findings in `bio-plane/src/provenance-routes/index.mjs` (:56–59, :382, :385, :462, :479, :526, :745, :749, :970). Its test copies of its own `localize` sentence: `bio-plane/test/m/provenance-routes/audit.test.mjs` :78–81 [code], `chain.test.mjs:162` and `rebuild.test.mjs:223` (the sentence "these bytes were received for upload:" from `provenance-routes/index.mjs:178`), `marked.test.mjs` :27–28 [part].
- strength: `bio-plane/test/m/strength/version.test.mjs:293` testcopy [code].
- case-carriage: `bio-plane/src/case-carriage/index.mjs:1190` plain. case-checker: `bio-plane/src/case-checker/check.mjs:537` plain.
- Inherited, not mine: the run's other arms (wizard-scripts, case-grammar, reading-guides and others) and coverage reds in other modules (affordances, installer, screens-*, and others). The `checks/run.mjs` total: 4115 failures, none in provenance.

Provenance's own words findings are all fixed (T51-184): none remains in `checks/words.mjs` for `provenance`.
