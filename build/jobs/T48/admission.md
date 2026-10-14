# admission (T48)

**Status** · session_014TBE54ERQ8MZ87YxDeqkyj · depth 2 · COMPLETE · handled B1

## Completion

- **Read** (whole): `build/requirements/admission.md`; the T48-64 entry; `bio-plane/src/admission/index.mjs` (the agent-credential region, `aiTaskScope`, `aiReachesAsMember`); `op-declarations` R56, R70 and the `sourceof`/`sourcerung` rows; `test/m/admission/t47.test.mjs` and the R10 test in `admission.test.mjs` (the ids R26 changes).
- **Entry applied: T48-64 (R26).** `aiTaskScope` refuses an `ai` caller `AI_BEYOND_TASK_SCOPE` (C-29.6) at `sourceof` and `sourcerung` unless its declared scope (`writes`) names the op, after the member-reach check and before any store call; the session path is unchanged. No new check row (reuses C-29.6).
- **Tests:** new `test/m/admission/t48.test.mjs` ("R26", refusals with controls: scope naming the op, member session, another read). The R10 test's expectation updated to R10 as R26 amends it (who-a-source-is reads need a declared scope too); no test weakened.
- **Ran:** admission tests 49 pass, 0 fail. `checks/format` 0 failures; `checks/architecture admission` 0 failures; `checks/coverage admission` 26 of 26 ids named; `checks/ownership admission tranche/T48` 0 failures. `checks/run.mjs` over the product: format and architecture 0 failures; coverage fails only for other modules' ids (none is admission's after this change).
- **Deferred:** none. **Found in other modules:** none.

Size (session_014TBE54ERQ8MZ87YxDeqkyj): test runs 4, module lines 1055
