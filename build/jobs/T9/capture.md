# capture (T9)

**Status** · session_01LMAH1easrQsx33uAH8zDHb · depth 2 · WORKING · handled B3

## J1 · QUESTION

N140 (the in-process `captureRequest` arm takes `{credential, heldSha, origin}`). capture's requirements state none of the three (R1 names the arm only), so no capture id holds the behaviour for P7's tests. Two questions, with my best readings, on which I am building now:

**Q1.1 — the requirement.** I read N140 as needing capture requirements for the arm's three inputs; I propose **R60–R62**, worded as below, for you to add (or reword):
- **R60** (N140; capture-requests R38) `captureRequest.origin` (`{matched_sweep, deeming_actor}`, from the drain's row, never a body) files the capture with `origin: {kind: "sweep", matched_sweep, deeming_actor}`; the body's `matchedSweep` is ignored on this arm. Without it the arm's origin is `named_request` as today.
- **R61** (N140; capture-requests R39) With `captureRequest.heldSha` (64 hex): the fetch is conditional with the validators (`ETag` → `If-None-Match`, `Last-Modified` → `If-Modified-Since`) this module recorded on the held capture's own successful fetch at the same document address (a new table, `capture_validators`, written on every filed direct capture: address_norm, capture_sha, etag, last_modified, at). A `304` files no capture and writes no receipt; it records a `success` outcome (R8) and answers `{ok: true, existed: true, unchanged: true, capture: {sha256: heldSha}, basis}` with no `document`. With no validators recorded the fetch is unconditional, and bytes hashing to `heldSha` answer as today with `existed` (one part) plus `held: true`. A `heldSha` that is not 64 hex is ignored (the arm fetches unconditionally).
- **R62** (N140; capture-requests R41; capture-sources R56's caller obligations) With `captureRequest.credential` (capture-sources R56's entry): `kind: "user-agent"` sends the secret as the `user-agent` in place of R7's; `kind: "login"` sends it as HTTP Basic (`authorization: Basic base64(secret)`, the secret `user:password`); `kind: "other"` sends it verbatim as the `authorization` header. The credential goes only to its own host: redirects are followed by hand and a hop to another host is fetched without it. The document records `capture.credentialed: {credential, kind, supplied_by, scope, project}` and `capture.reproducible_by_public: false`, never the secret, in the answer, the receipt or any error; a fetch with a credential never takes `heldSha`'s conditional path's validators from a public fetch (the conditional headers are sent, the answer is judged the same). A thrown fetch's message is not carried when a credential rode it.

**Q1.2 — the 304's receipt.** I read a `304` as the source asserting, not serving, the bytes, so no receipt (R12 stays "every filed capture"), only R8's `success`. If you would rather the receipt's interval widen on a 304, say so.

capture-requests' `#fire` passes only `credential` today; `heldSha` and `origin` wait on its side (reported, not changed).
