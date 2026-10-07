# admission (T35)

**Status** · session_01UzvBSSmkGxV7XjL9Ky2FMv · depth 2 · WORKING · handled B2

## Completion

**Entries applied (T35-71; K1874, K1875, K1881, K1934 (5); B2 = K2038).** Code `bio-plane/src/admission/` 882 → 1,260 lines (`index.mjs`, `checks.mjs`, new `window.mjs`).
- R20 (F1): `presentedCredential({req, url, body})` answers `{token, secret, inAddress}` and never throws. It reads the token from an exact `Authorization: Bearer` header, else a JSON body's `token`, else (T35 only) the query; the secret from the body, else the query. Every gate now judges that answer through an optional `credential` argument on `queryGate`, `aiCredentialPresented`, `admit` and `readerOf`. Without it they read the URL alone, so control-plane's current calls are unchanged. `queryGate` drops a query `token` or `secret` that sits beside a header or body credential. `CREDENTIAL_IN_ADDRESS` is exported.
- R6, R20 (K2038 (1)): the store lookups carry the session token in `x-bio-session` and the digest in `x-bio-credential-sha`. The address holds neither.
- R5 (F12): the four bindings are compared as SHA-256 digests, every byte, with no early exit, and every binding's liveness is asked on each call, so the time taken does not depend on what was presented.
- R10 (K1934 (5)): `expired: true` is refused 401 `AI_CREDENTIAL_EXPIRED` (C-29.30) before any scope is judged; a credential both revoked and expired is answered revoked. R16: an expired credential reads as no one.
- R21 (F4; K2038 (3)): `countryOf`, `sourceOf` (capture R56's digest when `KNOCK_FINGERPRINT_KEY` is bound, else `null` and the store answers it), the estimator, `doorRetryAfter`, and `doorRateLimited` (429 `DOOR_RATE_LIMITED`, C-38.9, with `stated` and `retryAfter`). `doorWindowGate` counts public ops only and fails open, logging the correlation id only. The store side is `window.mjs`: `admissionOf` declares `admission_door_window` (exempt from purge, `export: never`; it holds source, bucket and count only), the fingerprint comes from `captureOf(ctx).sourceFingerprint`, and `admissionOps` serves the store-internal route `doorwindow`.
- R22 (N703; K2038 (2)): `securityKindOf` and `securityTally` classify every arm and answer `{kind, country}` (`country` is null when the credential names a member) or `null`. They write nothing: the store write is deferred to N744.
- R14: the two new rows are added. R17's test is re-worded for R21's window.

**Deferred.** R22's store write (K2038, N744). Nothing else.

**Found in other modules (also in my REPORT J2 to BOB).**
- control-plane (its tests, not its code): from my merge until store-door's R9 hand-over (T35-81) merges, 83 more control-plane tests fail, all `NOT_AUTHENTICATED`. The suite goes from 178/4 on the tranche to 95/87 on my branch, because credentials' map still reads `t` and `sha` from the query. Either store-door's hand-over merges before admission, or the 83 are a named red. That is BOB's call.
- setup-page red 35 clears only when control-plane passes the request or credential to `admit` (T35-72), not at my merge.
- control-plane (T35-72) must call `presentedCredential` once, pass `credential` to the gates, add `deprecated` when `inAddress` is true, call `doorWindowGate` first for public ops, stamp `source` and `country`, and call `securityTally` for every refusal. plane (T35-73) must compose `admissionOps` from `window.mjs`.
- No generated artifact is made stale by this job, as far as I know. The plane bundle is regenerated at layer close.

**Tests and checks.**
- `node --test bio-plane/test/m/admission/`: `ℹ tests 32`, `ℹ pass 32`, `ℹ fail 0`.
- Users of admission: `test/m/control-plane/` 95 pass / 87 fail (tranche baseline 178 / 4; the 83 new failures are the hand-over above). `test/m/plane/` 107 / 8, the same as baseline.
- `node checks/format.mjs`: `format: 133 modules, 132 requirements files; 0 failures`.
- `node checks/architecture.mjs … admission`: `architecture: 13 product files, 26 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs … admission`: `coverage: 1 modules, 22 of 22 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs … admission tranche/T35`: `ownership: 10 files changed by admission between tranche/T35 and HEAD; 0 failures`.

Size (session_01UzvBSSmkGxV7XjL9Ky2FMv): test runs 20, module lines 1260

## J1 · QUESTION

Three of my T35 requirements need a store side that no module provides on `tranche/T35` @ 301119dbe8. Each is BOB's (another module's change, or a `modules.json` edge). My best reading for each; I carry on with everything else meanwhile (R5's constant time, R10's expiry, R20's `presentedCredential` threaded through every gate, R22's classifier, R21's estimator and its row).

1. **R6/R20: the credential lookups leave the address.** R20: "this module places no credential, secret or digest of either in the address of any request it makes, the store's internal requests included". Today I ask `http://do/session?t=<token>` and `http://do/aicredentiallook?sha=<digest>`, and `credentialsOps` reads exactly `url.searchParams.get("t")` / `get("sha")` (credentials/index.mjs:1901, :1912). If I move them to a POST body alone, every session and agent credential stops resolving until credentials reads the body. **Best reading:** a credentials share (a CHANGE to CREDENTIALS #6, merged before me): `session: () => ({ session: c.session(body?.t ?? url.searchParams.get("t")) })` and `aicredentiallook: () => c.aiCredentialLook({ secretSha: body?.sha ?? url.searchParams.get("sha") })`. I then send `POST http://do/session` `{t}` and `POST http://do/aicredentiallook` `{sha}`, nothing in the address.

2. **R22: `securitycount` route.** R22 and op-declarations R6 name credentials' store-internal route `securitycount`; `credentialsOps` has none (its header says `securityCount` is "not routed"). **Best reading:** the same credentials share adds `securitycount: () => c.securityCount({ kind: body?.kind ?? null, country: body?.country ?? null })`. I write `POST http://do/securitycount` `{kind, country}` through the door's reader; a failure is dropped.

3. **R21: where the window is counted, and the fingerprint key.** (a) Cloudflare's rate-limiting binding allows periods of 10 s or 60 s only, so it cannot hold "300 in any 10 minutes"; the counts must be in the store. (b) capture R56's key is `KNOCK_FINGERPRINT_KEY` when bound, else a random key in capture's own `knock_key` table, which the Worker cannot read, so `sourceOf(req, env)` can make R56's digest in the Worker only when the binding is set. **Best reading:** admission provides a store-side route map, `admissionOps(ctx, url, body)`, with one store-internal route `doorwindow` (body `{address, now?}`; no op, op-declarations R6's kind): it makes the fingerprint with capture's `sourceFingerprint` (R56, same key), counts it in a table admission declares (`record-core.declareTable`, exempt from purge, `export: "never"`, holding only bucket and count, both buckets pruned), and answers `{source, refused, stated, retryAfter}` — never the address. `sourceOf(req, env)` answers R56's digest in the Worker when the binding is set, else `null`, meaning "ask the store" (`doorwindow`'s `source` is then the stamp control-plane passes on). That needs: `modules.json` admission uses `record-core` (and `plane` composing `admissionOps` into the store's route map, a T35-73 share), and op-declarations R6 naming `doorwindow` (a T35-70 share; it merges before me). If you prefer the window to live in capture (beside R31's), say so and I export only the estimator and the refusal.

Also for control-plane's START (T35-72), not a question: to read the header it must pass the parsed body and the request to my gates. I am adding an optional `credential` (the answer of `presentedCredential({req, url, body})`) to `aiCredentialPresented`, `admit` and `readerOf`; absent, they compute it from the URL alone, so today's calls keep working unchanged until control-plane passes it.

## J2 · REPORT

Applied B2 (K2038). Four things for you, measured on my branch (tranche @ 99e0abe307 merged):

1. **My merge turns 83 control-plane tests red until store-door's hand-over lands.** The lookups now go `GET http://do/session` with `x-bio-session` and `GET http://do/aicredentiallook` with `x-bio-credential-sha`, nothing in the address. Until store-door (T35-81) hands those headers to credentials' map as `t` and `sha` (its R9), every session and agent credential driven through the real dispatch resolves to no one: `node --test test/m/control-plane/` goes from 178 pass / 4 fail (tranche) to 95 pass / 87 fail (mine), each new failure a `NOT_AUTHENTICATED` (e.g. doorbell.test.mjs `inboxpull/founder`). `test/m/plane/` is unchanged (107/8 both). Two ways out, yours: merge store-door's R9 hand-over before admission (a few lines in its door: copy the three headers onto the in-process URL), or accept the 83 as a named red from admission's merge until T35-81's.

2. **Red 35 (setup-page `worker-page.test.mjs`) does not clear at my merge.** It drives the whole plane through control-plane's door, which calls `admit` with the URL only, so the session setup-page now sends in the header is not seen until control-plane passes the request (T35-72). It clears at control-plane's merge, not mine.

3. **For control-plane's START (T35-72), what its door must call** (all exported from `src/admission/index.mjs`):
   - `presentedCredential({req, url, body})` once, the body parsed once; pass its answer as `credential` to `queryGate(url, op, credential)`, `aiCredentialPresented(url, env, doAnswer, {credential, op})`, `admit({..., credential})` and `readerOf(url, env, storeName, presented, doAnswer, credential)` (each falls back to the URL alone when not given, so today's calls still work). The review and template doors read `credential.secret`, not `url.searchParams.get("secret")`. When `credential.inAddress` is true, the answer carries `deprecated: CREDENTIAL_IN_ADDRESS` (exported).
   - `doorWindowGate({req, env, op, spec, doAnswer})` first for every public op (after R1–R3, before the op); answer `{refusal}` as given; its `{source}` (or `await sourceOf(req, env)` when it is null) and `countryOf(req)` are the `source`/`country` stamps for `claim`, `login`, `recover` (credentials R38) and capture's `country`.
   - `securityTally({op, answer, presented: {token, cred}, req})` for each refusal it gives or relays; today it only classifies (write deferred to N744).
4. **For plane's START (T35-73):** compose `admissionOps(admissionOf(ctx), url, body)` from `src/admission/window.mjs` (not index.mjs) into `routes`; `admissionOf` declares its table `admission_door_window` through record-core and makes the fingerprint with `captureOf(ctx).sourceFingerprint`.
