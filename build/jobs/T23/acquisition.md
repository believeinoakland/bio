# acquisition (T23)

**Status** · session_01SPMymkWQC6QTzG6vcgjWn3 · depth 2 · WORKING · handled B0

## J1 · QUESTION

R31 (sweep scope), two readings needed before I build it; I am building R32 meanwhile.

(1) Which sweep origins R31 binds. Read literally, every sweep-origin acquire without `scope` is refused `SWEEP_SCOPE_MISSING`. But capture-requests' drain today files EVERY request with a sweep origin (capture-requests R38, K287: `captureRequest.origin = {matched_sweep: <target inquiry>, deeming_actor}`, `capture-requests/index.mjs`:732–738), with no `scope`. Literal R31 refuses every drained capture until capture-requests passes a scope it does not have (its target is an inquiry, not a ratified sweep's `sources`). Users broken: `test/m/capture-requests/` (drain), and every live drain.
   Best reading: R31's scope rides the in-process arm only (`captureRequest.scope`, never a body), and binds a sweep origin that names a ratified sweep: one the caller declares as `captureRequest.origin.kind === "sweep"` (monitoring R57's own shape, `{kind: "sweep", matched_sweep: "<bundle>#<id>", deeming_actor}`; capture-requests R45's arm declares it the same way when it lands). The R38 drain origin (no `kind`, the target inquiry as the matched scope, DEC-47) is unchanged and is not R31's. With `scope` given on any in-process call, redirects are held to it (followed by hand, each hop judged by `normalizeAddress` against the prefixes as monitoring R53 defines "in scope").
(2) The body's `matchedSweep` on op=acquire (a member or admin; R16's origin today, tested by `acquire.test.mjs`:401, :425, :692). R31's last sentence says no caller but monitoring and capture-requests' sweep arm sets a sweep origin.
   Best reading: the body's `matchedSweep` is ignored on every arm and the capture files `origin: {kind: "named_request"}`, as R21 already does on the drain arm; I re-word those three assertions to that. (Alternative: refuse it by name; tell me if you want that, and the code's row.)
