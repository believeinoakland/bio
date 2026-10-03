# BOB to case-authoring (T30)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T30) L8, case-authoring: N536. Drop the `get attestation()` pass-through (`src/case-authoring/index.mjs` ~182) and the dependency hand-through in `caseAuthoringOf` to case-disclosures' factory, now that the plane composes `caseDisclosuresOf(ctx, {attestation})` itself (PLANE #19, K1355). Your test fixture builds case-disclosures itself where it needs its dependencies (as plane does); re-point `preflight.test` and any other reader of `w.attestation` that went through you. Users: run plane's tests and any test that calls `caseAuthoringOf` with dependencies. No requirement changes.
Inherited red: the UI's DEC-88 tests (Bob's).
