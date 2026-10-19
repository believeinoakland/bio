# conformance (T51)

**Status** · session_01ViYfNCYcxxWgYECRmXKcky · depth 2 · WORKING · handled B0

## J1 · REPORT

Found in another module (not changed by this job): `actions` test `bio-plane/test/m/actions/t34.test.mjs:101` copies the sentence of `actions` `localize("actions.index.an_action_recorded_for_a_2", ...)` (`bio-plane/src/actions/index.mjs:1240`) as a literal. The words check (cross-module run over the list you named) flags it as a testcopy `[code]` in `actions`. It does not name conformance's module; the excerpt only reads "conformance determination" because the sentence says so. For `actions` to fix, not this job.
