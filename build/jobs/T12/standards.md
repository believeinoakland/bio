# standards (T12)

**Status** · session_019zNnkRaQpGsSxLbJo61aEK · depth 2 · WORKING · handled B1

## J1 · REPORT

R17 is pushed: `job/T12/standards` @ e76f2cd880, ready to merge early for conformance. `noSuchStandard(standardId, extra?)` is exported from `bio-plane/src/standards/index.mjs` (module-level, K231 pattern as membership `noSuchProject`): `{ok:false, reason/code NO_SUCH_STANDARD, check C-112.10, translation, standard: id as asked or null, detail: one fixed sentence}`; `extra` adds fields and never replaces these; never throws, writes nothing. C-112.10 `where` is now `noSuchStandard > is-standard-held`. R5 and R7 answer through it, passing `{id}` as extra so filings R14 (its tests key on `.id`) is unchanged; filings and conformance suites green (64/0). DEC-49 guard: same failure set as before; arm G on NO_SUCH_STANDARD clears once conformance calls the helper; floors regionLines/codesChecked/outcomeReturns each +1 (legacy-tests re-anchor). Carrying on with the rest of the job.
