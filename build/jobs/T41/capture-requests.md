# capture-requests (T41)

**Status** · session_01Y176r2DgXuBjQoTamPdKfb · depth 2 · RUNNING until 2026-10-09T23:24:50Z (users' test suites (intent … plane)) · handled B1

## J1 · QUESTION

R55's seam with `steps` (not yet built; its requirements name no signatures for `recordProduct` or the arrival read). My best reading, which I am building on now; only the signatures change if you rule otherwise:

1. **Reach.** `steps`' instance is `deps.steps` (K61). Until steps merges, nothing defaults it and no plane wiring changes (control-plane/plane are not mine); at your CHANGE for steps' merge I default it lazily (`stepsOf(host)`, as `inquiry` is reached) and the arrival registration then runs at creation.
2. **Door (sight).** `step`, when given and non-blank, is judged by `steps.step({step, viewer})` with `viewer` = `runPrincipalOf(run.principal_plane)` (the run's principal as a viewer stamp, as the drain judges R49). Seen = an answer `{ok !== false, step: <that id>}`. Unseen, absent, non-text, or no steps reachable: refused, before anything is written, under one new code `CAPTURE_REQUEST_NO_STEP` (C-28.34, region `is-capture-request`), answering alike for absent and unseen ("refused as absent"). Judged after R3's lead checks, before R4.
3. **Row.** New column `step` (TEXT, NULL on legacy rows), answered by R6 (both arms), R24/R43 reads and R29. Idempotency key unchanged (run, address, render): a repeat naming a different step answers the standing row (its stored `step`), nothing written, as R50 keeps `co_archive`.
4. **Tie.** On a `captured` outcome (new capture, and R39's already-held one alike), when the row names a step: `steps.recordProduct({step, record: <capture sha>, kind: "capture", by: <row's principal_plane>, run, request, at})`. Its answer (or failure/throw) never changes the row or the drain's outcome; it is reported on the captured entry as `step_product: {ok, ...}`.
5. **Arrival source.** At creation, `steps.registerArrivalSource("capture_request", read)`; `read(id | {id, viewer})` answers null for an unknown id, or one the given viewer cannot see by target (→ steps' `undetermined`), else `{kind: "capture_request", id, state, met: state === "captured", ended: state is terminal, at: captured_at ?? updated, capture_sha}`. Synchronous, writes nothing, never throws.

`uses` edge to add at my merge: `steps`.
