# entities (T52)

**Status** · session_018BhcecQhnVK36CsiRUDvsz · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# ENTITIES · T52 report

**T52-14 (R67)** applied. `resolve` without `ref`, when no reference of the capture resolved and none was held earlier, reads the capture's text (`capture_text`) for each registered entity's label and standing aliases (whole words, case and accents ignored) and answers each found, once per entity, in `unresolved` as `{kind:"name", key, label, entityId, grade:"C", needs_confirmation:true}`; nothing is written. `testify` takes no `ref`: the testimony of the whole document is held under `document:whole`, grade D as R12. An empty `ref` is still `NO_REF`; a capture with no reading or text is `NO_SUCH_REFERENCE`. `resolvetestify` no longer requires `ref` in `DECLARED_OPS`.
Readings I made (BOB, please confirm): "followed entity" = every registered entity (this layer cannot see `following`); a candidate carries no `ref`.

**T52-15** settled: the grade is right, the fields are right. DEC-88/K1025 grades `resolve` `reasoned` by its recorded grounds (each resolution's `basis` and `method`), as op-grades R1 words it; no `reason` field is needed. Recorded in R62. For op-grades (T52-38): keep `resolve` `reasoned`, no change needed there. For the screen side (DEC-443 / J69 REPORT 2): the dialog need not ask for a reason.

**Found in other modules:** none. Not done: none.
Tests: `t52.test.mjs` (4 new), `declared-ops.test.mjs` updated; entities and op-declarations suites pass (415).

**Met** · R67

**For BOB to fold into `build/requirements/entities.md`** (not mine to edit): R67 built as: whole-document testimony is held under the reference `document:whole`; an empty `ref` is still `NO_REF`; a capture with no reading or text is `NO_SUCH_REFERENCE`; "followed" read as every registered entity; a candidate carries no `ref`. R12: `ref` is optional (R67). R62: `resolvetestify` requires `captureSha`, `entityId`, `basis`; and T52-15's settlement (above) belongs there.

Tests: 172/172. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecQhnVK36CsiRUDvsz): test runs 1, module lines 2646

## Completion (2026-10-27)

# ENTITIES · T52 report

**T52-14 (R67)** applied. `resolve` without `ref`, when no reference of the capture resolved and none was held earlier, reads the capture's text (`capture_text`) for each registered entity's label and standing aliases (whole words, case and accents ignored) and answers each found, once per entity, in `unresolved` as `{kind:"name", key, label, entityId, grade:"C", needs_confirmation:true}`; nothing is written. `testify` takes no `ref`: the testimony of the whole document is held under `document:whole`, grade D as R12. An empty `ref` is still `NO_REF`; a capture with no reading or text is `NO_SUCH_REFERENCE`. `resolvetestify` no longer requires `ref` in `DECLARED_OPS`.
Readings I made (BOB, please confirm): "followed entity" = every registered entity (this layer cannot see `following`); a candidate carries no `ref`.

**T52-15** settled: the grade is right, the fields are right. DEC-88/K1025 grades `resolve` `reasoned` by its recorded grounds (each resolution's `basis` and `method`), as op-grades R1 words it; no `reason` field is needed. Recorded in R62. For op-grades (T52-38): keep `resolve` `reasoned`, no change needed there. For the screen side (DEC-443 / J69 REPORT 2): the dialog need not ask for a reason.

**Found in other modules:** none. Not done: none.
Tests: `t52.test.mjs` (4 new), `declared-ops.test.mjs` updated; entities and op-declarations suites pass (415).

**Met** · R67

**For BOB to fold into `build/requirements/entities.md`** (not mine to edit): R67 built as: whole-document testimony is held under the reference `document:whole`; an empty `ref` is still `NO_REF`; a capture with no reading or text is `NO_SUCH_REFERENCE`; "followed" read as every registered entity; a candidate carries no `ref`. R12: `ref` is optional (R67). R62: `resolvetestify` requires `captureSha`, `entityId`, `basis`; and T52-15's settlement (above) belongs there.

Tests: 172/172. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecQhnVK36CsiRUDvsz): test runs 2, module lines 2646
