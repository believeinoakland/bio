# monitoring (T11)

**Status** · session_01NE1TmJGxu5yVThzDzkCH6p · depth 2 · WORKING · handled B2

## J1 · QUESTION

Q1, my best readings; I am building on them now and will bring the work in line with your answer.

(a) R30 under N222. The pause is built in monitoring: `pause({paused, by})` recorded as record-core's setting `monitoring_paused`, read by both ticks (a paused tick answers `{paused: true, …}` and fetches nothing) and stated on every tick's answer and in R32's answer (R45). The due slate is `slate({viewer, now})`: fixed instruction framing with every item as quoted JSON data — monitored addresses now due (R16), open named requests (no request has run, so each is due), ratified sweeps. Both get Durable Object routes in `monitoringOps` (`monitorpause`, `monitorslate`); the Worker ops that reach them are legacy-index's (control-plane's) to add, reported.

(b) R24 after R23 and R45. With the ticks in process and `configured()` true on every instance, R24's clause "while ticks go over the instance's Worker" no longer applies: no binding, credential or `MONITOR_NO_LIVE_CREDENTIAL` remains in monitoring. I read R24 as retired by R23/R45 and test that `configured()` is true with no binding and no credential and that no tick spends one. If R24 should be struck from the requirements, that is yours.

(c) `monitorOp` and `doAnswer` (N278, N247). The control plane hands `doAnswer` in, as it does for `knockOp`; `monitorOp` classifies the answer with a literal verdict (`ok: true` / `ok: false`) before spreading. That needs `doAnswer` added to index.mjs 5285's argument object (a line using `monitorOp`, my import); the ownership check needs the legacy change to be net removal, so I will pair it with removing the `monitorFired`/`monitorTickEpoch`/`monitorAddressType` counts in store.mjs `#counts` replaced by N266's `counts()` call... except that is legacy-store's share of N266. If you prefer legacy-store keeps `#counts`, I will instead leave index.mjs alone and `monitorOp` falls back to its own guard (DETECTOR C would still see a raw envelope). My reading: add `doAnswer` at 5285 and ask legacy-store (via you) to call `counts()`.
