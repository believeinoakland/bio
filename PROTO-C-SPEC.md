# PROTO C spec: a Worker-side cache of the team-wide shared reads (throwaway)

Base: 13c83a9ae7. Flags: `PROTO_C=1` (base set) / `2` (adds the per-viewer lists), `PROTO_C_HELD=1`, `PROTO_C_TTL_MS` (default 5000). All unset = no change.

## 1. Where an op reaches the room
- Door: `bio-plane/src/control-plane/index.mjs` `makeFetch` -> `planeDoor` (l.829) -> `fetch` (l.866). Admission (`admit`) runs first, then the op's handler: public ops through `hooks.publicOp` (`plane/door.mjs` -> `bootstrapOp`, `setup.mjs` ~l.3286), `grouplanguages`/`groupidentity` at l.1132/`groupRead`, gated ops through `hooks.gatedOp` or the generic forward `stub.fetch(new Request(inner, ...))` (l.~1980).
- Every call to the room (`http://do/<route>`) goes through one seam: `phase-clock.mjs` `clockedEnv` -> `clockedStub().fetch`, which already times it as Server-Timing `do-<route>`. The room's single frame is `plane/store.mjs` `Store.fetch` -> `assembled.dispatch` (`store-door/dispatch.mjs`). `transact` is record-core's (R32), inside the room.
- So one cache at `clockedStub` covers all ops, however each door reaches the room. (Rejected: caching per op at each handler, ~8 sites.)
- Important: every request first makes a `session` room call (`admission/index.mjs` l.344), then maybe `doorwindow`. Those queue behind a heavy read too, and this prototype does not cache them (see risks). It removes the op's own second wait, not the first.

## 2. The record version
record-core already has it: `RecordCore.writeCount()` (R89-R91, `record-core/index.mjs` l.472), SQLite `total_changes()` less bookkeeping rows, bumped by any writer of any module; `queue` already keys its derivation cache on it. It counts from the object's start (resets to 0). Prototype: `Store.fetch` adds `x-record-version: <instance>.<n>` before the call and `x-record-version-end` after it (instance = random tag per object start). The Worker keeps the newest per room (`shared-cache.noteVersion`). No extra room call. KV/Cache API was rejected: eventually consistent.

## 3. Ops cached and keys (`control-plane/shared-cache.mjs`)
Key = room route + sorted query, GET only, no `x-bio-grant`.
| route | scope | key |
|---|---|---|
| `grouplanguages`, `groupidentity`, `groupidentitypublic`, `instancegroup(public)`, `profiles` | team | route only (caller stamps dropped; handlers take no caller argument) |
| `bootstrap` (the claimed state) | team | route + `fp` (the bootstrap-secret fingerprint; a rotated secret re-arms) |
| `memberlist`, `peopledirectory`, `interfacewords`, `wizardsat`, `bootstrapfacts` (not `parts=1`) | viewer | whole query, `viewer` and `administer` stamps included (sight follows the viewer; admin-shared keys left out as a later refinement) |
| `queue`, `inbox`, `capturerequests` (mode 2 only) | viewer | whole query |
Admission has already judged class and capability before the room call, so a role never reaches an answer its op's gate refuses.
`heldcaptures` (PROTO_C_HELD): picker requests with `limit>20`, no cursor, no `bundle_ids` are rewritten to `limit=20&total=1`; `capture/index.mjs` `heldCaptures` adds `total` (+ `total_approx`) when `total=1`; `screens-daily/doors.mjs` shows `total`. Existing `next`/`after` paging continues. Not cached.

## 4. Correctness
- Kept only if start and end version agree (no write during the call) and the answer is `{"ok":true...}` JSON <= 256 KB. Served only while its version equals the newest seen and age < TTL. Any write bumps the counter; the next un-cached call (the request's own `session` lookup) shows it.
- Risks: (a) a write by another isolate between this request's `session` call and its cached read: bounded by TTL, not eliminated; (b) time-driven change the counter cannot see (an invitation expiring in `memberlist`, a date in `queue`): TTL; (c) per-isolate cache and counts, hit rate falls with isolates; (d) per-caller sight: viewer-keyed, so never shared across viewers; the `team` set is proven caller-independent only by reading the handlers (`m.profiles()`, `groupIdentity()`, `bootstrapState(fp)`); (e) the version header reaches callers if a door relays response headers (write-count metadata); (f) caching `session` too would give the full gain but delays revocation by the TTL and breaks (a)'s argument, so it is NOT built; (g) held paging changes screens that count 500 rows (`todos.mjs` own-row filter); `total` is approximate.

## 5. Size
New `shared-cache.mjs` ~150; `phase-clock.mjs` ~20; `store.mjs` ~12; `control-plane/index.mjs` 2; op-declarations 1; `capture/index.mjs` 5; `doors.mjs` 1; test ~65. About 255 changed lines: under the 500 limit, so built (stage 2).
