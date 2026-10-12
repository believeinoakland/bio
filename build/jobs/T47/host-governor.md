# host-governor (T47)

**Status** · session_01KMdoJShc6cVjtBV9B9Kjxf · depth 2 · COMPLETE · handled B1

## Completion (HOST-GOVERNOR #9, session_01KMdoJShc6cVjtBV9B9Kjxf)

**Read whole (P20, mechanics §6 step 2):** `build/requirements/host-governor.md` (public and private); record-core's Purpose and Provides (my one Use); layer 3's contract in `build/layers.md`; my entry and the Rules at the opening in `build/plan/current.md`; my code (`src/host-governor/index.mjs`, `schema.mjs`) and every test file (`fixture.mjs`, `governor.test.mjs`, `holding.test.mjs`, `ops.test.mjs`), whole.

**Entry applied: T47-68 (N983, K3027), R28.** As BOB's START found, the code already met R28: `governorOp` forwards only `host` to the store, and the route's `governorState` reads only `host`; no route reads a caller's instant. So no behaviour changed. Added three tests to `ops.test.mjs`, each naming R28:
- the Worker's handler (`governorOp`, and `governorOpResponse` behind the plane's relay): for every `host` form and a range of instants (far past, far future, an ISO date, text, empty), a `now` or `nowMs` in the query answers exactly as the request without it, and the store is asked exactly as without it (nothing forwarded); a held host is answered as recorded even when the caller's instant would have lapsed the hold;
- the Durable Object's `governorstate` route (`governorRoutes`): a body whose `now`/`nowMs` throw when read answers as one without them (they are never read), as do the same instants as text and numbers in the body or the query; moving the module's own clock changes nothing either (the rows judge no instant); nothing is written;
- the whole plane (Miniflare): for the admin class, the founder's session and a member's session, with and without `host`, a `now`/`nowMs` in the query, the body or both answers exactly as the same request without it.
A mutation check (the handler forwarding the query's `now`, and `governorState` reading `q.now`) turned the first two red; the source was restored afterwards.
Comments only in `index.mjs`: the header cites R1–R28, and `governorState`'s doc states R28.

**Flaws found in my own module:** none beyond the header's stale id range (fixed). `governorHolding({now})` and `isHeld(host, now)` take a caller's instant by design (R14, in-plane callers only, not reachable from a request), as the requirements' T47 Suggestion records; unchanged.

**Deferred:** nothing.

**Other modules:** none found. Generated artifact: the comment change in `src/host-governor/index.mjs` stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), accepted red 5.4, regenerated at the layer close; not written here.

**Tests and checks:**
- `node --test bio-plane/test/m/host-governor/` → tests 43, pass 43, fail 0 (no layer tests named in the manifest; no provided service changed).
- `node checks/format.mjs` → format: 165 modules, 164 requirements files; 0 failures
- `node checks/architecture.mjs … host-governor` → architecture: 6 product files, 11 relative imports (0 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs … host-governor` → coverage: 1 modules, 28 of 28 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … host-governor tranche/T47` → ownership: 3 files changed by host-governor between tranche/T47 and HEAD; 0 failures
- `node checks/run.mjs` (K2950) → format 0 failures; architecture: 3063 product files, 9347 relative imports; 0 failures; coverage: 4967 of 5096, 44 failures, none host-governor's (other modules' *(not yet met: T47)* ids, accepted red 5.1); channels 0 failures.

Size (session_01KMdoJShc6cVjtBV9B9Kjxf): test runs 2, module lines 435
