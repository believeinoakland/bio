# case-inputs (T49)

**Status** · session_015ACfzc2kakEh8pKoGWg4BC · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Stale generated artifact (not written by this job, per mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` still carries the removed constant `OPEN_REQUEST_NOQUOTE_PLAIN` and the `key: null` no-quotation line (around lines 169471–169473). T49-10 changes `bio-plane/src/case-inputs/` so that the bundle must be rebuilt by its own build step. No other generated artifact of another module is affected. `git grep` finds no other reference to the removed constant.
