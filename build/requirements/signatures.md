# signatures — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `bio-plane/src/sshsig.mjs`, `bio-plane/src/tsa.mjs`, `bio-plane/src/signpage.mjs`. All requirements below are met by the code as it stands; none is outstanding. No old-plan row and no `build/plan/next.md` entry targets this module. The module holds no local (jurisdiction) fact today: its namespace strings, endpoints and the signer page are the same for every instance, so the "No jurisdiction in the product" rule (`build/layers.md`) raises nothing here.

## Public

### Purpose

Builds and verifies the signed and timestamped statements the plane and the installer exchange: OpenSSH detached signatures (SSHSIG) over a release, a fleet manifest, a bundle ratification or a case ratification; an RFC 3161 timestamp request and response, and the public-archive locator an opt-in co-archive returns; and the self-contained page a human signer uses to produce those signatures offline. It holds no record, no private key and no clock, and makes no network call itself — every network call is the caller's.

### Provides

**Signatures (`sshsig.mjs`)**

`NS_RELEASE`, `NS_RATIFY`, `NS_FLEET` → strings (`"bio-release"`, `"bio-ratify"`, `"bio-release-fleet"`).
- **R1** Three distinct compiled constants. No two are equal, so a signature that verifies in one namespace never verifies in another.

`verifySshsig(armored, message, expectNamespace, allowedKeys) → Promise<{ok:true, keyB64, namespace} | {ok:false, reason, ...}>`
- **R2** `ok:true` only when: `armored` dearmors to a version-1 SSHSIG blob whose key and signature are both `ssh-ed25519` (32-byte key, 64-byte signature); its `namespace` equals `expectNamespace`; its signing key's wire base64 (`keyB64`) is in `allowedKeys`, after normalising each entry (a bare base64 field, a full `"ssh-ed25519 AAAA… comment"` line, or a principal-prefixed allowed_signers line all name the same key); and the signature verifies over `SSHSIG | namespace | reserved | hashAlg | H(message)`, hashed with the blob's own declared `hashAlg` (`sha256` or `sha512`), against the exact bytes of `message`.
- **R3** `ok:false` gives a `reason`: `MALFORMED` (bad armor, magic, version, key/signature type or length, or a hash algorithm other than `sha256`/`sha512`); `NAMESPACE` (with `expected` and `got`) when the namespace does not match; `UNKNOWN_KEY` (with `keyB64`) when the signing key normalises to nothing in `allowedKeys`; `BAD_SIGNATURE` (with `keyB64`) when the signature does not verify over exactly `message`; `CRYPTO_UNAVAILABLE` when the runtime refuses to import the key.
- **R4** Never throws.

`ratifyStatement(bundleId, bundleSha) → Uint8Array`
- **R5** Returns the ASCII bytes `` `bio-ratify ${bundleId} ${bundleSha}\n` ``, exactly. Same inputs always give byte-identical output.

`caseRatifyStatement(caseId, edition, docSha) → Uint8Array`
- **R6** Returns the ASCII bytes `` `bio-ratify-case ${caseId} ${edition} ${docSha}\n` ``, exactly.
- **R7** Its leading token (`bio-ratify-case`) differs from `ratifyStatement`'s (`bio-ratify`), so no bundle ratification and no case ratification can ever be the same signed bytes.

`fleetStatement({version, plane, members}) → string`
- **R8** Renders `` `bio-release-fleet/2\nversion ${version}\nplane ${plane.sha256} ${plane.bytes} ${plane.asset}\n` ``, then one line per entry of `members`, then a trailing `\n`.
- **R9** Member lines are sorted by `member` name, ascending, regardless of input order: the same set of members always renders the same bytes.
- **R10** Each member line is `` `member ${member} ${sha256} ${bytes} ${asset} compat=${date}+${flags} services=${services} parts=${parts}` ``, where: `flags` is the member's `compat.flags`, sorted and comma-joined, or `-` when the list is empty (an empty list is stated, never omitted); `services` is each `{binding, service}` rendered `binding:service`, sorted and comma-joined (may be the empty string, but the `services=` key is always present); `parts` is each `{path, type, sha256, bytes}` rendered `path:type:sha256:bytes`, sorted and comma-joined (may be the empty string, but the `parts=` key is always present).
- **R11** Throws `Error` reading `REFUSED [MEMBER_COMPAT_UNSTATED]: …` when a member's `compat.date` is not a non-empty string.
- **R12** Throws `Error` reading `REFUSED [MEMBER_FLAGS_UNSTATED]: …` when a member's `compat.flags` is not an array.
- **R13** Throws `Error` reading `REFUSED [PART_TYPE_UNSTATED]: …` when a part's `type` is not a non-empty string.
- **R14** Deterministic: the same `{version, plane, members}` (members in any order) always renders the same string, and never partially — a throw from R11–R13 happens before any byte of a member's line is emitted for that member.

**Trusted timestamps and the co-archive (`tsa.mjs`)**

`timestampRequest(sha256Hex, nonceBytes?) → {der, nonce}`
- **R15** `der` is a DER-encoded RFC 3161 `TimeStampReq`, version 1, over the SHA-256 digest `sha256Hex`, with `certReq` true and the nonce present — byte-identical to what `openssl ts -query -sha256 -cert` builds for the same digest and nonce.
- **R16** `nonceBytes`, when given, is used verbatim and returned as `nonce`; when omitted, `nonce` is 8 fresh random bytes.

`parseTimestampResponse(bytes, expectDigestHex) → {ok, reason?, status?, token?}`
- **R17** `ok:true` only when `bytes` is a well-formed `TimeStampResp` whose status is 0 ("granted") or 1 ("granted with modifications") and whose token's bytes contain `expectDigestHex`'s raw bytes somewhere inside it (the binding check); `token` is then the token's raw DER bytes.
- **R18** `ok:false` gives a `reason`: `MALFORMED` for bytes that do not parse as the expected shape; `REJECTED` (with `status`) for any other status; `NO_TOKEN` (with `status`) for a granted status carrying no token; `NOT_BOUND` (with `status`) for a token whose bytes do not contain `expectDigestHex`.
- **R19** Never throws.

`TSA_ENDPOINTS → string[]`
- **R20** A compiled constant naming the timestamp authorities to ask, in order (today: DigiCert, Sectigo, `rfc3161.ai.moda`); never read from a call's arguments. A caller must not accept an endpoint named by anything other than this list.

`TSA_CONTENT_TYPE`, `TSA_ACCEPT → strings`
- **R21** The request and accepted response media types for the RFC 3161 exchange (`"application/timestamp-query"`, `"application/timestamp-reply"`).

`ARCHIVE_SAVE_BASE`, `ARCHIVE_SERVICE → strings`
- **R22** `ARCHIVE_SAVE_BASE` is the one compiled URL a locator may be appended to for a save request (`https://web.archive.org/save/`); `ARCHIVE_SERVICE` names the service for the record. Neither is settable by a caller.

`archiveLocatorFrom(res, requested) → string | null`
- **R23** Returns the archived locator (`https://web.archive.org/web/<timestamp>/…`), read in order from `res`'s `content-location` header, its `location` header, or (last) `res.url` itself; `null` when none of the three names one.
- **R24** Never throws.

**The offline signer page (`signpage.mjs`)**

`SIGN_HTML → string`
- **R25** A single, non-empty, self-contained HTML document (opens with `<!doctype html>`): no `src=`/`href=` naming an `http:`/`https:` URL anywhere in it, so the page loads and runs with no network access once opened.

### Errors

Stated per service above. `verifySshsig`, `parseTimestampResponse` and `archiveLocatorFrom` never throw and always name a `reason` for a "no". `fleetStatement` throws (never partially renders) on an unstated compat date, flags list or part type; every other service throws only on malformed input it cannot make sense of (`verifySshsig`'s inner parse failures are caught and returned as `MALFORMED`, never thrown).

## Private

### Uses

None. Every export is built from Web platform primitives (`crypto.subtle`, `atob`/`btoa`, `TextEncoder`/`TextDecoder`) and literal data; nothing here imports another module.

### Invariants

- **R26** Pure and offline: no store, no network fetch, no clock. `verifySshsig`, `timestampRequest` and `parseTimestampResponse` make no request themselves; the endpoints they hand a caller (R20, R22) are compiled constants a caller cannot override from a request body, and `archiveLocatorFrom` only reads a `Response` the caller already fetched.
- **R27** No place is named in this module: no jurisdiction, city or county appears in any string it exports. Its tests need no jurisdiction profile.
- **R28** A signature verified for one namespace (R1) or over one message (R2, R5–R7) never verifies for a different namespace or a different message; a tampered message or signature is always `BAD_SIGNATURE`, never silently accepted.
- **R29** Every "no" this module returns names which kind of no (`reason` in R3, R18; `null` with no reason only where the interface documents `null` as the whole answer, R23).

### Satisfies

- `BIO_Distribution_v0_1.md` §3 ("The release") and §4 ("The fleet") — the release object, its two-key/three-namespace scheme, and the fleet statement one signature must cover as a set.
- `BIO_Intake_Doctrine_v1_1.md` §3 — trusted timestamps as the co-attestation a group cannot fabricate for itself, and the public archive as the opt-in second kind of co-attestation.
- `build/layers.md`, "No jurisdiction in the product" (R27).

### Suggestions

- **Checks.** Check C-18.8 (the gate's release-signature check, `bio-checks.mjs` "Release-signature primitives") still holds a second, hand-written SSHSIG/Ed25519 verifier. K10 (entry N8) replaces it with a call to `verifySshsig`: the Apps Script runtime that justified it is decommissioned. This module takes on no check-derived invariant.
- **The signer page's real source is out of this module's paths.** `signpage.mjs` is `GENERATED by scripts/embed-signpage.mjs from tools/sign-release.html` (its own header comment). `tools/` is declared "not product" (`build/layers.md`, "Paths that are not product"), and the generator script lives in `bio-plane/scripts/`, owned by `legacy-index` (layer 9) — later than this module and not in its `uses`. So R25 is what this module can state and test from its own paths; that `SIGN_HTML` is the current, byte-identical render of `tools/sign-release.html`, and that the page's embedded script produces SSHSIG output `ssh-keygen -Y verify` accepts, are checked outside `signatures`' own paths today (`bio-plane/test/fleetbundles.test.mjs`, `bio-plane/test/signpage.test.mjs`) and are not restated here as testable requirements of this module.
- **For callers.** `verifySshsig`'s `allowedKeys` and SSHSIG's own embedded key together are the only source of truth for who signed; a caller must supply the actual `ARMED_SIGNERS`/registry list, never a caller-asserted one. `fleetStatement`'s per-member `services` and `parts` fields are signed as the caller supplies them (R10); nothing in this module checks them against reality — that a member's declared parts match what was actually uploaded is the caller's obligation.
