# action-grammar (T33)

**Status** · session_019ZPA869n1maeYjDhwTzrT3 · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T33-72 (S0-10, B0.8; K1470's one id grammar): R12. `checks.mjs`' `ENTITY_ID_RE` (the one entity id this module tests, `counterparty.entity_id` in C-2.10's counterparty arm, reached by `counterpartyFindings` and `checkActionExtension`) is now `idPattern('ENT')` from `record-grammar` (its R47), no pattern of its own: `ENT-2026-10000` is accepted, `ENT-2026-999` refused as before, and the finding's sentence is unchanged, so every finding on a document written before T33 is byte-identical (the golden corpus still matches). No other arm here reads an entity id; the bundle ids it tests come from `record-grammar`'s `BUNDLE_ID_RE`, already built from `idPattern`. Uses: `record-grammar` (`idPattern` added), `jurisdictions`, `connections`, `inquiry-grammar`, unchanged otherwise; final `uses` as in `modules.json`.

**Deferred.** None. The R12 text's `*(not yet met: T33-72)*` marker in `build/requirements/action-grammar.md` is BOB's to clear (I write only my paths, tests and this record).

**Found in other modules.** None. `case-checker`'s `program.mjs` does not bundle this module, so no generated artifact is staled.

**Tests.**
- `node --test bio-plane/test/m/action-grammar/`: tests 26, pass 26, fail 0 (new: "R12: every entity id the module tests …", over four named kinds × 14 ids, at the arm and in the audit, against `idPattern('ENT')`). Negative control: with the old `/^ENT-\d{4}-\d{4}$/` restored, pass 25, fail 1 (the R12 test).
- Dependants (`modules.json` users of this module): actions 74/0, filing-templates 47/0, escalation 52/0; action-clocks 29/3, affordances 164/3, instance-setup 90/4, control-plane 155/4, each failure one of START's named inherited reds (action-clocks R10 ×3, K1519; affordances' three, K1550, K1571, K1643; instance-setup R44 ×4, K1544; control-plane's four, K1550, K1572, K1581, K1638), and the same counts with my change stashed.
- Layer tests: none named in `build/manifest.md`.

**Checks** (from `civicos-process`): `format: 126 modules, 125 requirements files; 0 failures`; `architecture: 7 product files, 13 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 12 of 12 live requirement ids named by a test; 0 failures`; `ownership: 3 files changed by action-grammar between tranche/T33 and HEAD; 0 failures` (the code, its test and this record).

Size (session_019ZPA869n1maeYjDhwTzrT3): test runs 4, module lines 1799

## J1 · COMPLETE

T33-72 applied: R12 met. ENTITY_ID_RE is record-grammar's idPattern('ENT'); ENT-2026-10000 accepted, ENT-2026-999 refused, golden corpus byte-identical. action-grammar 26/0 (negative control 25/1 on the old pattern); dependants' only reds are START's named inherited ones, same counts without my change. format, architecture, coverage (12/12), ownership: 0 failures. No generated artifact staled; nothing found in other modules. Please clear R12's not-yet-met marker. Details in the record's Completion.
