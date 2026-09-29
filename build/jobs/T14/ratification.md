# ratification (T14)

**Status** · session_01NkDk1W39kfk9zvHVf1PF48 · depth 2 · WORKING · handled B0


## Completion (RATIFICATION #6)

**Entries applied** (a2144d2582).
- **N339 with N349 (R17).** `src/ratification/ops.mjs`: each of the seven relays now asks, in its own two lines, `refused` and then `answered`. The store's own refusal (`refused`: `ok: false` below 500) is answered by `storeRefused(out, {json, storeRefusal})`: the caller's `storeRefusal` when handed, else `json(out.reply.body, out.reply.status)`, the same answer. A reply that is no answer is `storeSilent(op, out.correlation)`. The seven: `caseratify/facts` (:104), `caseratify/gate` (:189), `caseratify/commit` (:221), `ratify/gatefacts` (:364), `ratify/image` (:444), `ratify/list` (:469), `ratify/publish` (:719). The ratify act's sub-reads (`gatefacts`, `image`, `list`) relay a refusal by the same rule (K444). The post-commit reports (`reusedparts`, `capturelimit`, `recordreuseverdicts`) are reports, not relays, and are unchanged. Nothing is committed or copied on a relayed refusal: every relay is before the commit, or is the commit.

**What legacy-index must hand at layer 11, per call site** (`src/index.mjs`; today each hands `{env, json, doAnswer, storeSilent, …}`, and the relay composes the same answer itself):
- `:739` `caseRatifyOp(req, stub, {env, json, doAnswer, storeSilent, …})`: add `storeRefusal` (from control-plane's exports; `index.mjs` does not import it today).
- `:740` `ratifyOp(req, stub, {env, json, doAnswer, storeSilent, …})`: add `storeRefusal`.
Its `storeSilent` is control-plane's, which already takes the correlation (R25), so N349's half works through it now.

**`not yet met` marks my work meets** (for BOB to strike in `build/requirements/ratification.md`): R17's *(not yet met: N339, N349)*, and the Status line's "N339 (with N349) R17; not yet met".

**Check rows.** None added, moved or retired; nothing awaiting stamp.

**Found in other modules (reported, not changed).**
- **legacy-tests** (last in T14): `bio-plane/test/plane-envelope.test.mjs` now has 3 failures (it passed before), all pins on the exact text N349 changes. CLOSED (i) (:715–716) and its other direction (:728) match `if (!listOut.answered) return storeSilent("ratify/list");`; REACH (D2) (:891) deletes `if (!pubOut.answered) return storeSilent("ratify/publish");\n    ` and finds nothing to delete. Re-anchored, each reads `if (!listOut.answered) return storeSilent("ratify/list", listOut.correlation);` (and `pubOut`'s alike). Detector D2 itself passes: every binding is still read with `.answered` at its own site. `test/ratify-envelope.test.mjs` passes.
- **Generated artifact made stale** (reported, not rebuilt): `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`): `fleetbundles.test.mjs` names `src/ratification/ops.mjs` as a changed input. agent-worker, pdf-worker and ocr-worker are fresh.

**Found in my own module, deferred.** `ratifyOp`'s gate probe `registerholds` (inside `hasCapture`, :512) reads a silence or refusal as "not held in parts", so the gate can answer `PLANE_MISSING_BYTES` about the record when the store did not answer. It fails closed (promotion R28: never counted as present), and it is not one of R17's relays. Changing it decides what the act answers when the gate's own probe goes unanswered, so it is BOB's to place, not this entry's.

**Greps.** `storeRefused` and the seven relay op names: no hits in `civicos-ui/` or affordances (`src/affordances.mjs`, `src/affordances/`).

**Deferred.** The `registerholds` probe, above.

**Tests and checks** (on `job/T14/ratification` @ a2144d2582):
- `node --test bio-plane/test/m/ratification/`: tests 74, pass 74, fail 0, todo 0. New: `relays.test.mjs` (R17, 4 tests): each of the seven relays, with and without `storeRefusal`, relays refusals at 400 and 404 whole, with nothing committed or copied; through `storeRefusal` once, the same answer either way; a 500 with a stack is 502 `STORE_DID_NOT_ANSWER` naming the relay, with no stack and no `correlation` key; `STORE_INTERNAL_ERROR` with a correlation carries it, and without one has no key; a non-JSON reply, a thrown fetch, a 503 and a silence are 502; both ceremonies complete when every relay answers. Negative control: on the old `ops.mjs` the three R17 tests fail and the answered test passes.
- Modules that use ratification: case-authoring 39/39, affordances 76/76, control-plane 45/45.
- Legacy: `test/ratify-envelope.test.mjs` passes; `test/plane-envelope.test.mjs` fails 3 pins (above). `test/fleetbundles.test.mjs`: bio-plane stale (above).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs ratification`: 0 failures. `checks/coverage.mjs ratification`: 17 of 17 live ids named, 0 failures. `checks/ownership.mjs ratification tranche/T14`: 0 failures (legacy modules untouched).

Size (session_01NkDk1W39kfk9zvHVf1PF48): test runs 13, module lines 3,071
