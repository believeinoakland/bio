# capture-requests (T10)

**Status** · session_019sbMfF1wWCjRTgXkdVuLBi · depth 2 · WORKING · handled B2

## J1 · QUESTION

My readings, on which I am building now (answer only where you differ):

1. **N141 / R38 (the promotion).** After the drain files a NEW capture (capture answers `ok`, a `document`, not `existed`/`held`/`unchanged`), the drain composes and promotes through `promotion.promote`, author `token:daemon` (R10's actor), no `writer: mechanical` (a creation, not an operation): id `${record.allocId("INFO", year).id}-requested`; `bundle.md` `information@2` at `collected` (produced_by mode `agent`, tier `session`; `source.locator` the address; `retrieved` the capture's; no `group`, so promote writes the recorded one or refuses C-64.1), a Summary naming the address, Provenance Notes and a Session Log entry carrying R10's statement; `data/provenance.json` `{documents: [capture's document]}`; the primary as a blob file with its register row. A capture already held (R39) makes no bundle. A refused promotion changes nothing of the row (still `captured`, the capture is filed) and the drain's answer names it: each `captured[]` entry gains `promoted: {ok, bundle_id} | {ok: false, reason}`. No new column (R24's field list unchanged).
2. **N262 / R38's origin.** `origin` = `{matched_sweep: <target inquiry>, deeming_actor: "run <run> under <plane>, paid by <claude>"}` (a string, since provenance C-18.1 needs it truthy and nothing reads it structurally).
3. **N262 / R39's `heldSha`.** "The record holds a successful capture" of the address is read from this module's own rows: the latest `captured` row with the same address and render flag and a `capture_sha`. Capture's `unchanged: true` answer (no `document`) is `captured` with `capture_sha` = heldSha and `already_held: true` (today it would be a failure).
4. **N188 (3) / R6's `at`.** The in-process caller's instant is the second argument's `at` (`captureRequest(args, {viewer, caller, at})`, ms or ISO); the op handler never passes one; a body's `at` stays ignored.
5. **N188 (1).** `waitSource().holds`/`woken` read in keyset pages, bounded in total by `CAPTURE_REQUEST_READ_MAX` rows per call, filtered by run status as today.
6. **N224 / R12.** With `rank`, the tick reads `10 × batch` requested rows oldest first, offers each as `{kind: "request", id, waitingSince: <requested_at in ms>, cadenceMs: drainIntervalMs()}` (the scheduler's `rankBy` reads ms and needs the cadence for "longer than one cadence"), takes the first `batch` in the rank's order; a rank that throws or answers a non-array falls back to oldest first (bias's pattern).
7. **N223 / R44.** `onRequestFiled` is synchronous to register; listeners are called after the row is written, a promise's rejection swallowed; `captureRequest` stays synchronous.
