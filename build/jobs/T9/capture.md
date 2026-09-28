# capture (T9)

**Status** · session_01LMAH1easrQsx33uAH8zDHb · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

N140 (the in-process `captureRequest` arm takes `{credential, heldSha, origin}`). capture's requirements state none of the three (R1 names the arm only), so no capture id holds the behaviour for P7's tests. Two questions, with my best readings, on which I am building now:

**Q1.1 — the requirement.** I read N140 as needing capture requirements for the arm's three inputs; I propose **R60–R62**, worded as below, for you to add (or reword):
- **R60** (N140; capture-requests R38) `captureRequest.origin` (`{matched_sweep, deeming_actor}`, from the drain's row, never a body) files the capture with `origin: {kind: "sweep", matched_sweep, deeming_actor}`; the body's `matchedSweep` is ignored on this arm. Without it the arm's origin is `named_request` as today.
- **R61** (N140; capture-requests R39) With `captureRequest.heldSha` (64 hex): the fetch is conditional with the validators (`ETag` → `If-None-Match`, `Last-Modified` → `If-Modified-Since`) this module recorded on the held capture's own successful fetch at the same document address (a new table, `capture_validators`, written on every filed direct capture: address_norm, capture_sha, etag, last_modified, at). A `304` files no capture and writes no receipt; it records a `success` outcome (R8) and answers `{ok: true, existed: true, unchanged: true, capture: {sha256: heldSha}, basis}` with no `document`. With no validators recorded the fetch is unconditional, and bytes hashing to `heldSha` answer as today with `existed` (one part) plus `held: true`. A `heldSha` that is not 64 hex is ignored (the arm fetches unconditionally).
- **R62** (N140; capture-requests R41; capture-sources R56's caller obligations) With `captureRequest.credential` (capture-sources R56's entry): `kind: "user-agent"` sends the secret as the `user-agent` in place of R7's; `kind: "login"` sends it as HTTP Basic (`authorization: Basic base64(secret)`, the secret `user:password`); `kind: "other"` sends it verbatim as the `authorization` header. The credential goes only to its own host: redirects are followed by hand and a hop to another host is fetched without it. The document records `capture.credentialed: {credential, kind, supplied_by, scope, project}` and `capture.reproducible_by_public: false`, never the secret, in the answer, the receipt or any error; a fetch with a credential never takes `heldSha`'s conditional path's validators from a public fetch (the conditional headers are sent, the answer is judged the same). A thrown fetch's message is not carried when a credential rode it.

**Q1.2 — the 304's receipt.** I read a `304` as the source asserting, not serving, the bytes, so no receipt (R12 stays "every filed capture"), only R8's `success`. If you would rather the receipt's interval widen on a 304, say so.

capture-requests' `#fire` passes only `credential` today; `heldSha` and `origin` wait on its side (reported, not changed).

## Completion

**Entries applied**
- **N202** (its share): `on()` asks membership's `listenerRefusal` (R81) before recording a registration, so `LISTENER_MALFORMED` (was capture's own `BAD_LISTENER`) and `LISTENER_DECLARED` are minted at membership's one site, the slot's `event` beside them. `UNKNOWN_EVENT` stays capture's (another condition). No requirement text named `BAD_LISTENER`, so nothing to rename there.
- **N228**: `driveRow` is no longer exported. Nothing outside capture imported it; monitoring answers its tick's C-48.8/.9 from `DRIVE_CAPTURE_CHECKS` with a reader of its own. Its direct test went with it; R4's test now checks every C-48 refusal's status, `check` and `translation` through `acquire`.
- **N133** (its share, after provenance's K289): `resolveLinks` no longer reads a target's direct captures whole. For each deferred link one SQL statement answers the count and at most four rows: the first bracketing capture seen more than once, the last before T, the first after T, and the source's own. T is re-spelled whole-second, and the bracket is decided by comparing text (provenance R48). Ties are now defined (first retrieval, then digest). Verdicts are unchanged.
- **N247** (its share): `knockOp` opens the Durable Object's answer through the control plane's `doAnswer`, handed in like `json` and `storeSilent`, so `knock` has left plane-envelope's DETECTOR C unconverted set. `ops.mjs`'s private copy of the reader (`ask`) is gone for the same reason: `linksOp`, `archiveLookupOp` and `acquireOp` take `doAnswer` too. index.mjs's four call sites pass it, and index.mjs's two legacy comment blocks about acquisition and the archive fallback moved beside the code they explain in `ops.mjs` (legacy-index net −30).
- **N79** (its share): already wired from T4 (`recordLinks` files each link's `chrome`/`chrome_basis`, and subresources R34 now supplies them). Tested end to end on live captures: R28 holds. BOB may drop R28's "not yet met: N79".
- **N140** (R60–R62, K287): the capture-request arm files the drain's `origin` as a sweep (the body's `matchedSweep` is ignored on this arm). With `heldSha` it fetches conditionally on the validators recorded for that capture at that document address (new table `capture_validators`, purged whole-store, written on every filed direct non-rendered capture): a 304 files nothing, writes no receipt, records R8's `success` and answers `unchanged`; the same bytes answer `held: true`. A supplied credential rides only to its own host (redirects are followed by hand), `user-agent` goes through R7's `userAgent` as a delegated agent, `login` as HTTP Basic and `other` verbatim; `capture.credentialed` and `reproducible_by_public: false` are recorded; the secret never appears in an answer, receipt or error. BOB may drop R60–R62's "not yet met".
- **R45–R46**: not marked not-yet-met, already built and tested (R45, R46 tests).

**Deferred:** none.

**Found in other modules** (reported to BOB)
- **connections**: `test/m/connections/factory.test.mjs` "R24, R18, K155" fails on `tranche/T9` with or without this job. It calls `captureOf(host, {env: {}})` after connections created capture with another `env`, and expects the first instance back silently; capture R58 (N122, approved) refuses a differing `env` by a throw. The test pins the pre-R58 behaviour: connections' job should drop that assertion or pass the same `env`.
- **capture-requests** (T10, as B2 said): `#fire` passes only `credential`; `heldSha` (the held capture for R39) and `origin` (R38's sweep) are its side.
- **monitoring**: plane-envelope's other three N247 failures (D-240 (b), (c), (e)) and DETECTOR C's `monitor` are monitoring's share. Also, monitoring keeps its own copy of the `driveRow` reader (one site per reader would be monitoring's call).
- **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (and its `.bundle.json`), which bundles capture's and index.mjs's source. Not rebuilt (§14).

**Tests and checks**
- `node --test bio-plane/test/m/capture/`: tests 64, pass 64, fail 0, todo 0.
- The modules that use capture: extraction 65/0, retrieval 58/0, capture-requests 53/0, ratification 65/0 (1 todo), monitoring 43/0 (10 todo), scheduler 46/0 (6 todo), queue 10/0, connections 59/1 (the pre-existing failure above).
- Legacy tests that drive knock, links, acquire or archivelookup (81 files), each run alone, before (`tranche/T9`) and after: the same 12 fail on both. The one difference, `subresources.test.mjs`'s agent census, was fixed (R62's agent through `userAgent`): 363/0. `plane-envelope.test.mjs`: 60/4 (monitoring's four; `knock` left DETECTOR C).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … capture`: 0 failures. `checks/coverage.mjs … capture`: 62 of 62 live ids named, 0 failures. `checks/ownership.mjs … capture tranche/T9`: 0 failures (legacy-index 5 added, 35 removed; legacy-store 0/0).

Size (session_01LMAH1easrQsx33uAH8zDHb): test runs 275, module lines 3013
