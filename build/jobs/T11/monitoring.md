# monitoring (T11)

**Status** · session_01NE1TmJGxu5yVThzDzkCH6p · depth 2 · WORKING · handled B2


## Completion (MONITORING #3)

**Entries applied**
- **N283** (its reads): `subjects()`, `driveShells()`, `watched()` read `monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `source_locator` from `bundle_projection` joined on `bundle_id` (`PROJECTION_TABLE` from retrieval; LEFT JOIN where every bundle must appear). The fixture builds retrieval's table from its own `PROJECTION_SCHEMA` and projects into it, `action_clock_next` included, so R34, R44, R35 are green again.
- **N222** (R23, R45, R30): both ticks run in process: `cadenceTick` calls `monitor()` as `class:daemon`, `archiveTick` calls `capture.acquire({via: "archive.org", address}, {cls: "daemon"})`. No `env.SELF`, no credential; `unattendedCredential` and `MONITOR_NO_LIVE_CREDENTIAL` leave monitoring. `configured()` is true on every instance (R24 retired, K372). The pause is `pause({paused, by})`, held as record-core's setting `monitoring_paused` and read by `paused()`. A paused tick fetches nothing and says so; `cadenceDue` is null while paused and `cadenceWake` looks again one archive interval on. The pause is stated on every tick's answer and in R32's (`paused`). The due slate is `slate({viewer, now, limit})`: every monitored address due, every open named request and every ratified sweep in a `data/gathering.json` the viewer sees, one JSON line each between fixed markers inside fixed instruction framing. Durable Object routes: `monitorpause` (`by` = the stamped actor) and `monitorslate`.
- **N224** (R19, R20): `cadenceTick(now, rank)` and `archiveTick(now, rank)` read up to ten times their batch (`MONITOR_RANK_READ`) and take the batch in the rank's order. A cadence subject is offered as `{kind: "address", id, waitingSince: due_at or null, cadenceMs}`; a bundle scheduled as itself is `{kind: "bundle", id}`. An archive address is `{kind: "address", id, waitingSince: first_failure_since}`. A rank that throws or answers no list leaves the order as read; entries it drops follow in read order.
- **N266** (R46): `counts()` gives `{monitorFired, monitorTickEpoch, monitorAddressType}`. It is synchronous, writes nothing, and answers null for a table it cannot count. Legacy-store's `#counts` is untouched (K372: that share is legacy-store's).
- **N278, N247**: `monitorOp` takes the control plane's `doAnswer` when handed it, the way `knockOp` does. Until then it falls back to `openEnvelope`, the same rule, as K372 asks. Each branch declares the verdict as a literal (`ok: true` / `ok: false`) before the store's body is spread. `index.mjs` is untouched (K372).
- **N230** (R33, the published-finding half): `watched()` follows publication's `restingCapturesOf` by cursor to its end, keeps the captures whose findings belong to the project, and marks each capture with `rests_on` (`objective`, `finding`) and `findings`. `proposals()` says whether an objective, a published finding or both rest on the document. If publication cannot be read, the objective half still stands and `findings_unread` says why.
- **N297, N242** (its share): monitoring no longer mints a bare `REFUSED`. A deadline-recheck promotion that refuses without a code is reported with `reason: null` and a sentence in `detail`. The `is-drive-tick-export` and `is-drive-tick-bytes` regions are governed and judged by the DEC-49 guard (`check-refusal-codes.mjs` arm C: 1 code judged in each), so N242's orphan is resolved on this tree.
- K316, K313: the fixture's `exec` now returns a cursor (iterable, `toArray()`, `one()`) and refuses any LIKE or GLOB pattern over 50 bytes.

**Not yet met marks my work meets** (for BOB to strike; the requirements file is not a job's path): R19 (N224), R20 (N224), R23, R45, R30, R46 (N266), R33's N230 half.

**Deferred, with why**
- `openEnvelope` in `monitoring/index.mjs` duplicates the control plane's `doAnswer` rule (K231). It stays until legacy-index hands `doAnswer` in at `index.mjs` ~5285 (K372), and is removed then.
- R17, R18, R28, R29, R31, and R34's "members told" half remain `test.todo`, each with its cause.

**Found in other modules (REPORT)**
- **legacy-index** (layer 11, K372): hand `doAnswer` to `monitorOp` at `index.mjs` ~5285, and add Worker ops for `monitorpause` (administrator only; stamp `actor`) and `monitorslate` (viewer-stamped).
- **legacy-tests**: these suites pin the behaviour N222 retires and need re-anchoring or moving (N222 names them). On this tree, against `tranche/T11`: `d334-monitor-credential` 33/8 (was 41/0); `daemon-token` 54/2 (was 56/0; its two SELF-binding arms); `monitor-cadence` 64/3 (its "inert unless configured" arms; it throws on `tranche/T11` itself); `plane-envelope` 63/1 (was 62/2). D-240 (e) and DETECTOR C now pass. The one failure left is "`doAnswer` is the only thing that reads `ok` off an envelope", which counts `out.ok === true` spellings and sees `openEnvelope`; it clears when legacy-index hands `doAnswer` in. `refusal-wire` 41/1 (was 40/2): the two codeless-op arms now pass, and the forward set gains `r.body`, `monitorOp`'s declared-refusal forward (D-240 (e)'s classification, looked at). `archive-monitoring`, `gathering`, `hygiene`, `gate-reads` pass.
- **scheduler**: nothing to change. Its registry already passes the rank and reads `configured()`; `test/m/scheduler` passes 46/0 against this module.
- Generated artifacts: `bio-plane/dist/bio-plane.bundled.mjs` is made stale by this module's source (not rebuilt, per §14).

**Tests and checks run**
- `node --test bio-plane/test/m/monitoring/`: tests 57, pass 51, fail 0, todo 6.
- `node --test bio-plane/test/m/scheduler/` (a user of the changed services): pass 46, fail 0, todo 6.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … monitoring`: 12 product files, 58 relative imports; 0 failures.
- `node checks/coverage.mjs … monitoring`: 45 of 45 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … monitoring tranche/T11`: 9 files changed; 0 legacy lines added or removed; 0 failures.

Size (session_01NE1TmJGxu5yVThzDzkCH6p): test runs 24, module lines 2318

## J1 · QUESTION

Q1, my best readings; I am building on them now and will bring the work in line with your answer.

(a) R30 under N222. The pause is built in monitoring: `pause({paused, by})` recorded as record-core's setting `monitoring_paused`, read by both ticks (a paused tick answers `{paused: true, …}` and fetches nothing) and stated on every tick's answer and in R32's answer (R45). The due slate is `slate({viewer, now})`: fixed instruction framing with every item as quoted JSON data — monitored addresses now due (R16), open named requests (no request has run, so each is due), ratified sweeps. Both get Durable Object routes in `monitoringOps` (`monitorpause`, `monitorslate`); the Worker ops that reach them are legacy-index's (control-plane's) to add, reported.

(b) R24 after R23 and R45. With the ticks in process and `configured()` true on every instance, R24's clause "while ticks go over the instance's Worker" no longer applies: no binding, credential or `MONITOR_NO_LIVE_CREDENTIAL` remains in monitoring. I read R24 as retired by R23/R45 and test that `configured()` is true with no binding and no credential and that no tick spends one. If R24 should be struck from the requirements, that is yours.

(c) `monitorOp` and `doAnswer` (N278, N247). The control plane hands `doAnswer` in, as it does for `knockOp`; `monitorOp` classifies the answer with a literal verdict (`ok: true` / `ok: false`) before spreading. That needs `doAnswer` added to index.mjs 5285's argument object (a line using `monitorOp`, my import); the ownership check needs the legacy change to be net removal, so I will pair it with removing the `monitorFired`/`monitorTickEpoch`/`monitorAddressType` counts in store.mjs `#counts` replaced by N266's `counts()` call... except that is legacy-store's share of N266. If you prefer legacy-store keeps `#counts`, I will instead leave index.mjs alone and `monitorOp` falls back to its own guard (DETECTOR C would still see a raw envelope). My reading: add `doAnswer` at 5285 and ask legacy-store (via you) to call `counts()`.
