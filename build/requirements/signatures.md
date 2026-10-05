# signatures — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `bio-plane/src/sshsig.mjs`, `bio-plane/src/tsa.mjs`, `bio-plane/src/signpage.mjs`. All requirements below are met by the code as it stands; none is outstanding. No old-plan row and no `build/plan/next.md` entry targets this module. The module holds no local (jurisdiction) fact today: its namespace strings, endpoints and the signer page are the same for every instance, so the "No jurisdiction in the product" rule (`build/layers.md`) raises nothing here. AMENDED at T19's fold (BOB-5, K648, K653) by a worker for BOB #80, 2026-10-01: the operator-side release signer `tools/sign-sshsig.mjs` joins the module (live: the release assembler, bundler R23, imports it); R33–R36 state its behaviour today, tested by signatures' T19 job (layer 1). `tools/sign-release.html` is not taken: it is an older copy of `bio-plane/src/sign-release.html` differing only in the product name (R32), read by nothing, and legacy-index deletes it. AMENDED at T23's opening (fold 1b) by a worker for BOB #94, 2026-10-02, from `build/plan/draft-network-notices.md` (DEC-111, K1019, K1031, K1100): R37 `NS_NOTICE` and R38 `noticeStatement` added, R1 amended "Three" to "Four", for `network-notices`. AMENDED by a worker for BOB #103, 2026-10-02, entry N520 (DEC-116; `plan/draft-T24-dec116.md`, K1134 (4)): R39 `NS_DOCKET` and R40 `docketStatement` added, R1 amended "Four" to "Five", for `docket`; not yet met (T27). AMENDED by BOB #106, 2026-10-03, entry N530 (K1336): R41 `captureAccountStatement` added (the capture account statement's one spelling, used by `capture` and `case-checker`); not yet met (T29). T33's fold, by a requirements worker for BOB #114 on `tranche/T32`, 2026-10-05, from plan entry T33-7 (entries B0.2, C S0-13; K1470): R38 and R40 amended (the id's counter is `record-grammar`'s, four digits or more), R42 (the signer page's copy) added; Uses gains `record-grammar` (the module's first edge); not yet met (T33-7).

## Public

### Purpose

Builds and verifies the signed and timestamped statements the plane and the installer exchange: OpenSSH detached signatures (SSHSIG) over a release, a fleet manifest, a bundle ratification or a case ratification; an RFC 3161 timestamp request and response, and the public-archive locator an opt-in co-archive returns; and the self-contained page a human signer uses to produce those signatures offline. It holds no record, no stored private key and no clock, and makes no network call itself — every network call is the caller's. Its one signing service (the release signer) runs on an operator's machine with a seed the caller passes, and never ships in the plane or the installer.

### Provides

**Signatures (`sshsig.mjs`)**

`NS_RELEASE`, `NS_RATIFY`, `NS_FLEET`, `NS_NOTICE`, `NS_DOCKET` → strings (`"bio-release"`, `"bio-ratify"`, `"bio-release-fleet"`, `"bio-working-on"`, `"bio-docket"`).
- **R1** Five distinct compiled constants: `NS_RELEASE`, `NS_RATIFY`, `NS_FLEET`, `NS_NOTICE` and `NS_DOCKET`. No two are equal, so a signature that verifies in one namespace never verifies in another. (Amended at T23's opening from "Three": DEC-111, K1019, K1031; from "Four" by N520: DEC-116.)
- **R37** `NS_NOTICE` is `"bio-working-on"`, a compiled constant distinct from every other namespace (R1's rule). The offline signer page and the browser signer sign in it (DEC-111, K1019, K1031).
- **R39** `NS_DOCKET` is `"bio-docket"`, a compiled constant distinct from every other namespace (R1's rule). The offline signer page and the browser signer sign in it. (DEC-116 item 6; N520)

`verifySshsig(armored, message, expectNamespace, allowedKeys) → Promise<{ok:true, keyB64, namespace} | {ok:false, reason, ...}>`
- **R2** `ok:true` only when: `armored` dearmors to a version-1 SSHSIG blob whose key and signature are both `ssh-ed25519` (32-byte key, 64-byte signature); its `namespace` equals `expectNamespace`; its signing key's wire base64 (`keyB64`) is in `allowedKeys`, after normalising each entry (a bare base64 field, a full `"ssh-ed25519 AAAA… comment"` line, or a principal-prefixed allowed_signers line all name the same key); and the signature verifies over `SSHSIG | namespace | reserved | hashAlg | H(message)`, hashed with the blob's own declared `hashAlg` (`sha256` or `sha512`), against the exact bytes of `message`.
- **R3** `ok:false` gives a `reason`: `MALFORMED` (bad armor, magic, version, key/signature type or length, or a hash algorithm other than `sha256`/`sha512`); `NAMESPACE` (with `expected` and `got`) when the namespace does not match; `UNKNOWN_KEY` (with `keyB64`) when the signing key normalises to nothing in `allowedKeys`; `BAD_SIGNATURE` (with `keyB64`) when the signature does not verify over exactly `message`; `CRYPTO_UNAVAILABLE` when the runtime refuses to import the key.
- **R4** Never throws.

`ratifyStatement(bundleId, bundleSha) → Uint8Array`
- **R5** Returns the ASCII bytes `` `bio-ratify ${bundleId} ${bundleSha}\n` ``, exactly. Same inputs always give byte-identical output.

`caseRatifyStatement(caseId, edition, docSha) → Uint8Array`
- **R6** Returns the ASCII bytes `` `bio-ratify-case ${caseId} ${edition} ${docSha}\n` ``, exactly.
- **R7** Its leading token (`bio-ratify-case`) differs from `ratifyStatement`'s (`bio-ratify`), so no bundle ratification and no case ratification can ever be the same signed bytes.

`noticeStatement(noticeId, revision, sha) → Uint8Array`
- **R38** Returns exactly `` `bio-working-on ${noticeId} ${revision} ${sha}\n` ``. It throws when `noticeId` is not an opaque id (`^[A-Z]+-\d{4}-\d{4,}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$`, any prefix, the tail optional; K1115), `revision` is not a whole number of at least 1, or `sha` is not 64 lowercase hex characters (DEC-111, K1019, K1031). The counter is `record-grammar`'s sequential form (its R46: four digits or more, so the 10,000th id is accepted and every id accepted before T33 still is), read from `record-grammar`, never a copy held here (S0-13; K1470). *(not yet met: T33-7)*

`docketStatement(caseId, seq, sha) → Uint8Array`
- **R40** Returns exactly `` `bio-docket ${caseId} ${seq} ${sha}\n` ``. It throws when `caseId` is not an opaque id (R38's shape, its counter `record-grammar`'s, as R38 states), `seq` is not a whole number of at least 1, or `sha` is not 64 lowercase hex characters. Its leading token differs from every other statement's, so no docket entry and no other signed statement can be the same signed bytes. (DEC-116 item 6; N520) *(not yet met: T33-7)*

`captureAccountStatement(captureSha, text) → Uint8Array`
- **R41** Returns exactly `` `bio-capture-account ${captureSha}\n${text}` `` (each argument as `String(…)`), the text unchanged after the first newline. `CAPTURE_ACCOUNT_TOKEN` is `"bio-capture-account"`. Its leading token differs from every other statement's (R5, R6, R38, R40), so no capture account and no other signed statement can be the same signed bytes. It is signed in `NS_RATIFY`. Same inputs always give byte-identical output. (DEC-81 item 3(c); `capture` R69, `case-checker` R3; N530, K1317 (3))

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
- **R30** `SIGN_HTML` is the byte-identical render of `bio-plane/src/sign-release.html` by `bio-plane/scripts/embed-signpage.mjs` (K33).
- **R31** The page's own script signs `bio-release` and `bio-ratify` statements that both `ssh-keygen -Y verify` and `verifySshsig` (R1) accept.
- **R32** The page's visible text names the product Civicsmith, never BIO (`layers.md` rule 4; DEC-124); its wire formats are unchanged: the `BIOKEY-RAW1.`/`BIOKEY1.` prefixes, the `bio-release`/`bio-ratify` namespaces and the download filename. It calls the ratified thing a record, never a bundle; `bio-plane.bundled.mjs`, a file name, stays (K899 (1), N458; K934).
- **R42** (S0-13; K1470) The signer page's own test of a notice's or case's id (`sign-release.html`, rendered into `SIGN_HTML` by R30) accepts exactly the ids R38 and R40 accept, the 10,000th included, and refuses exactly those they refuse; the page's copy of the pattern is regenerated from `record-grammar`'s by `embed-signpage`, never edited by hand. *(not yet met: T33-7)*

**The release signer (`bio-plane/scripts/sign-sshsig.mjs`, moved from `tools/` in T19; BOB-5)** — run only on an operator's machine by the release assembler (bundler R23), never imported by the plane or the installer.

`signSshsig(envelope, message, namespace) → string`
- **R33** Returns an armored OpenSSH signature (`-----BEGIN SSH SIGNATURE-----`, base64 wrapped at 70 columns, `-----END SSH SIGNATURE-----` and a newline): a version-1 SSHSIG blob with an `ssh-ed25519` key and signature, `namespace`, an empty reserved field and hash algorithm `sha512`, signing the exact bytes of `message` with the key the envelope's seed gives. Same inputs give the same output (Ed25519 is deterministic). Stock `ssh-keygen -Y verify` and `verifySshsig` (R2) both accept it for that namespace and the key of R35.

`seedFromEnvelope(envelope) → {label, seed}`
- **R34** Accepts exactly `BIOKEY-RAW1.<label>.<base64 of 32 bytes>` (surrounding whitespace ignored), the envelope the signer page (R25) mints, and returns the label and the 32-byte seed. Throws `Error` reading `release seed is not a BIOKEY-RAW1 envelope` for any other shape and `release seed is <n> bytes, expected 32` for a seed of another length; `signSshsig` and `signerPublicLine` throw the same.

`signerPublicLine(envelope, comment = "bio-release") → string`, `keyFromSeed(seed)`, `publicFromKey(key)`
- **R35** `signerPublicLine` returns `ssh-ed25519 <base64 wire public key> <comment>`, the line an allowed-signers list or `RELEASE.json`'s `signer` carries for the envelope's key; `keyFromSeed` gives the Ed25519 private key of a 32-byte seed and `publicFromKey` its 32 raw public bytes.
- **R36** Never prints, writes or returns the seed or the private key; the only outputs are the signature and the public line.

### Errors

Stated per service above. `verifySshsig`, `parseTimestampResponse` and `archiveLocatorFrom` never throw and always name a `reason` for a "no". `fleetStatement` throws (never partially renders) on an unstated compat date, flags list or part type; every other service throws only on malformed input it cannot make sense of (`verifySshsig`'s inner parse failures are caught and returned as `MALFORMED`, never thrown).

## Private

### Uses

- `record-grammar`: the id grammar (`ID_TABLE`, `idPattern`; its R46, R47) for R38, R40 and R42 (T33-7; a new edge, P4 holding: `record-grammar` is first in layer 1).

Otherwise every export is built from Web platform primitives (`crypto.subtle`, `atob`/`btoa`, `TextEncoder`/`TextDecoder`) and literal data. The release signer (R33–R36) alone uses Node's `node:crypto`, which is why it never ships in the plane or the installer.

### Invariants

- **R26** Pure and offline: no store, no network fetch, no clock. `verifySshsig`, `timestampRequest` and `parseTimestampResponse` make no request themselves; the endpoints they hand a caller (R20, R22) are compiled constants a caller cannot override from a request body, and `archiveLocatorFrom` only reads a `Response` the caller already fetched.
- **R27** No place is named in this module: no jurisdiction, city or county appears in any string it exports. Its tests need no jurisdiction profile.
- **R28** A signature verified for one namespace (R1) or over one message (R2, R5–R7, R41) never verifies for a different namespace or a different message; a tampered message or signature is always `BAD_SIGNATURE`, never silently accepted.
- **R29** Every "no" this module returns names which kind of no (`reason` in R3, R18; `null` with no reason only where the interface documents `null` as the whole answer, R23).

### Satisfies

- `BIO_Distribution_v0_1.md` §3 ("The release") and §4 ("The fleet") — the release object, its two-key/three-namespace scheme, and the fleet statement one signature must cover as a set.
- `BIO_Intake_Doctrine_v1_1.md` §3 — trusted timestamps as the co-attestation a group cannot fabricate for itself, and the public archive as the opt-in second kind of co-attestation.
- `BIO_Publication_v0_1.md` §5D ("Who acts, and signing": the manager signs a public docket entry with their registered key; R39, R40; DEC-116).
- `build/layers.md`, "No jurisdiction in the product" (R27).

### Suggestions

- **Checks.** Check C-18.8 (the gate's release-signature check, `bio-checks.mjs` "Release-signature primitives") still holds a second, hand-written SSHSIG/Ed25519 verifier. K10 (entry N8) replaces it with a call to `verifySshsig`: the Apps Script runtime that justified it is decommissioned. This module takes on no check-derived invariant.
- **For callers.** `verifySshsig`'s `allowedKeys` and SSHSIG's own embedded key together are the only source of truth for who signed; a caller must supply the actual `ARMED_SIGNERS`/registry list, never a caller-asserted one. `fleetStatement`'s per-member `services` and `parts` fields are signed as the caller supplies them (R10); nothing in this module checks them against reality — that a member's declared parts match what was actually uploaded is the caller's obligation.
- **The release signer (BOB-5).** The job moves `tools/sign-sshsig.mjs` beside `sshsig.mjs` (a script directory, not `src/`, so no bundle reaches it), re-points the assembler's import (bundler's file, `uses`), and re-points `sshsig.mjs`:229's note naming `tools/release-assemble.mjs`. R33's test signs with a throwaway seed and verifies with `verifySshsig` and, where present, stock `ssh-keygen`.
