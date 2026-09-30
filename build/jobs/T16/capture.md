# capture (T16)

**Status** · session_01C2JRNr5dArDzZueoyT1MmF · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Five points the requirements leave open. I am building on the reading given for each; none stops me.

1. **R65's provenance document (the pulled knock).** R16's fields are worded for a fetch. My reading, for R65's arm only:
   - `locator` `knock:<knockId>` (the receipt's address), `retrieved` the pull's instant (whole second), `file` `snapshots/<knockId>`;
   - the first hop: `who` this instance, `via: "doorbell"`, `bound: false`, `asserts` "these bytes were received at this instance's doorbell as knock <id> at <received>, and brought into the record by <by> at <retrieved>" (never "served for");
   - `capture`: `method` "doorbell knock, received, hashed at receipt", `grade: null` with `grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED"` (provenance R51's route; no fetched letter), `actor_class: "member"`, `actor: by`, `sha256`, `encoding`, `bytes`, no `transport`;
   - `origin: {kind: "doorbell", knock_id}` (R16 names only `named_request` and `sweep`, and neither is true of a knock);
   - `profile`: R17's profile, computed over the bytes as acquire computes it (the same helper), with no declared content type and no headers;
   - `attestation_attempts: []` (R68's `reattest` is the late co-attestation for it).
   - With no evidence store configured the pull answers the storage-absent refusal (as R21 and acquire do): the bytes cannot be held under their own digest.
2. **R69's signed message.** Nothing names the namespace or the bytes signed. My reading: namespace `NS_RATIFY` (the one the signer page signs besides releases), and the statement `bio-capture-account <captureSha>\n` followed by the text, exported as `captureAccountStatement(captureSha, text)` so a surface composes the same bytes. Its leading token differs from `bio-ratify` and `bio-ratify-case`, so no ratification is ever the same signed bytes (as signatures R7).
3. **Who is a capture's actor (R69).** Capture keeps no document after it answers, so it records each capturing actor it stamps (acquire's member session; the puller) in its own append-only table, `(capture_sha, actor)`. Several members who captured the same bytes are each its actor. `by` and the stored actor are compared as member ids (`member:x` and `x` are one member). A capture with no recorded actor is C-118.5.
4. **R66's two inputs.** A `knockerSecret` that is present and not a string of at least 20 characters is `KNOCKER_SECRET_WEAK`. With both `knockerSecret` and `generateSecret: true`, the supplied secret is used and none is generated.
5. **R68's match.** `matches` compares the capture digest with the SHA-256 of the co-archive's raw replay (`/web/<ts>id_/<locator>`), fetched through the governor; with no archived locator, or a replay that cannot be fetched, it is `undetermined`. A capture held only in parts counts as held for R68 when provenance's `registerHolds` finds its receipt (as `attest` itself does); otherwise R63.

## J2 · REPORT

**Ready for the early merge (K425) that `sources` needs**, at `job/T16/capture` @ 2ff4800ac2. R65–R67 and `knockerDigestOf` are met and tested, with their interface as worded:
- the inbox row holds `knocker_digest`, `pseudonym` (R66) and, once pulled, `capture_sha`, `pulled_by`, `pulled_at` (R65); `inboxList` and `inboxGet` answer them;
- `knocksOf({pseudonym, limit, after})` answers `{ok, pseudonym, continuity, knocks, count, limit, truncated, next}`, oldest first, never a contact;
- `knockerDigestOf(secret)` answers `{knocker_digest, pseudonym}` (both null, with `basis`, for no secret or before any secret-bearing knock made the instance key), writes nothing, never throws;
- the pulled capture's `source` is `document.source` as R65 words it (`{kind: "knocker", named: false, pseudonym, receipt}`).

The rest of the job is done too (every entry applied; the capture tests and the four checks pass: 89 tests, 0 fail; coverage 70 of 70). I am now running the tests of the fifteen modules that use capture, in chunks, before COMPLETE. The pull document's details wait on your answer to J1.
