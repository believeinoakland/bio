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

## J3 · COMPLETE

Job complete at `job/T16/capture` @ 2944f2d9e9 (`tranche/T16` merged in after B2/B3). Ready to merge; R65–R67, R71, R72 and `knockerDigestOf` are what `sources` builds against.

**Entries applied** (plan layer 3, N364; K509, K530, K539)
- R65 `pullKnock` (`src/capture/index.mjs`): refusals in order (NO_SUCH_KNOCK C-118.2, KNOCK_DISCARDED C-118.4, R63's absence when the bytes are gone or no longer hash to the knock); `existed: true` with the same document for a knock already pulled; otherwise, in one `transact`: bytes held under their own digest, one receipt (`via: DOORBELL_VIA`, address `knock:<id>`), the knock `pulled` with `capture_sha`, `pulled_by`, `pulled_at`, and the puller recorded as actor. The document is K539's reading of J1 (source, knocker_note, grade null with `grade_basis` R51's, R17's profile, no contact). A failed receipt rolls the pull back (`RECEIPT_NOT_WRITTEN`); no evidence store answers the storage-absent refusal. `inboxResolve` to `pulled` answers as R65 (R32).
- R66: `knockerSecret` / `generateSecret` (128 bits, Crockford base32, shown once); `knocker_digest` = HMAC-SHA-256 under `KNOCKER_SECRET_KEY` or a generated key in the new exempt table `knocker_key` (R56's pattern, separate); pseudonym `knocker-XXXX-XXXX-XXXX-XXXX` from the digest; `knockerDigestOf(secret)`. KNOCKER_SECRET_WEAK (C-118.3) in R53's order, in the handler and the store side.
- R67 `knocksOf`, R71 `knockAttempt`, R72 `pulledKnocksOf` (K539), each as worded.
- R68 `reattest` / `lateAttestationsOf`; R69 `recordCaptureAccount` / `captureAccountsOf`, signing `captureAccountStatement(sha, text)` under `NS_RATIFY` (K539).
- R16 `capture.actor` on acquire (the member session's stamp, else null), recorded in the new table `capture_actors`; R32, R37, R53, R54 amended; R70 held (the contact reaches no document, receipt, actor row or `knocksOf`/`pulledKnocksOf` answer).
- R20: `acquire.mjs` meets it (co-attestation at every capture through `provenance.attest`, the co-archive asked except on the archive arm, whose locator is itself a replay). Test: `acquire.test.mjs` "R20: every capture requests a timestamp and, wherever the source permits, a co-archive…".

**Not-yet-met marks my work meets (for you to strike, K460):** R16, R32 (N364), R37, R53, R54, R65, R66, R67, R68, R69, R70, R71, R72, R20 (its inline mark and the Status line's "R20 (Intake §3; K60)"). Also stale and met, found while reading: R32's "(not yet met: K383)" (NO_SUCH_KNOCK, tested by `doorbell.test.mjs` "R32 (K383)…"); R28's "(not yet met: N79…)" (subresources R34 gives containment; `acquire.test.mjs` "R28 (N79)…"). The Status line's R11, R18, R41, R42 each have a passing test naming them; R41's remaining gap is profile data (no profile names a locale), not capture's code.

**Check rows added (promotion's to stamp, N318; `awaiting stamp` for T17):** C-118.3 `KNOCKER_SECRET_WEAK`, C-118.4 `KNOCK_DISCARDED`, C-118.5 `NOT_THE_CAPTURING_ACTOR`, C-118.6 `ACCOUNT_NO_TEXT`, all in `src/capture/checks.mjs`, each `where` a DEC-49 region in `doorbell.mjs` or `index.mjs`.

**Ops (routes and stamps are control-plane's, layer 11).** New Durable Object routes in `captureOps`: `inboxpull` (R65), `knocksof` (R67), `pulledknocks` (R72), `reattest` and `lateattestations` (R68), `captureaccount` and `captureaccounts` (R69). Each reads `by` from the query first, so a stamp there wins over a body's copy. `knockerDigestOf` and `knockAttempt` are in-process only. The pull's refusals carry a `status` hint (400, 403, 404, 409, 502, 503).

**Grep of `civicos-ui/` and affordances' lists:**
- `bio-plane/src/setup.mjs`:1328–1332 (instance-setup): the inbox's "Mark as taken up" button posts `inboxresolve` with `status: "pulled"`. That is now R65's pull. It files a capture and a receipt, but control-plane's `inboxresolve` route does not promote the document as `inboxpull` must (control-plane's entry). Either the button moves to `op=inboxpull`, or control-plane gives `inboxresolve`-to-`pulled` `inboxpull`'s promotion.
- `bio-plane/src/affordances.mjs`:935, :2142: `inboxresolve` reads "a disposition of a knock"; its `pulled` arm is now a filing act. No hit anywhere for the new ops (affordances' job words them, K530). `civicos-ui/`: no hit (`item_pulled` there is unrelated).

**Other modules:** (1) the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale: capture's source changed. (2) `test/m/ratification/checks.test.mjs`:133 (R8, N211) is red, identically on `tranche/T16` without my change: K500's accepted red, not mine.

**Flaws fixed in my module:** `knock()` called without `now` stamped the epoch (`Number(null)` is 0), so a direct call wrote 1970 ids and windows; an inline knock (no evidence bucket) kept only a lossy text decoding of its bytes, now also `content_b64`, so a pull holds exactly what was received; the profile is one helper (`profileOf`) that acquire and the pull share. Deferred: none.

**Tests and checks**
- `node --test bio-plane/test/m/capture/`: tests 91, pass 91, fail 0.
- The modules that use capture (at 2ff4800ac2, before R71/R72, which are additive and have no user yet): extraction 91/91, connections 66/66, retrieval 66/66, capture-requests 62/62, ratification 73/74 (the accepted red above), case-authoring 53/53, monitoring 65 pass 6 todo, scheduler 46 pass 2 todo, affordances 90/90, queue 69/69, instance-setup 58/58, control-plane 57/57. Sources, tasks and queue-producers have no tests yet.
- format: 72 modules, 67 requirements files; 0 failures. architecture: 15 product files, 70 relative imports; 0 failures. coverage: 72 of 72 live ids named by a test; 0 failures. ownership: 11 files changed; legacy-store and legacy-index 0 lines; 0 failures.

Size (session_01C2JRNr5dArDzZueoyT1MmF): test runs 17, module lines 3658
