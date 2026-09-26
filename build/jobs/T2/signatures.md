# T2 · signatures — job record

**Session** · `session_01GJC6ytwQrBRdr2Y8KdcybF` (SIGNATURES #1)

**Status** · COMPLETE, 2026-09-26, on best readings for the open Q1 (below). Job for module `signatures`, tranche T2, branch `job/T2/signatures` (merged `origin/tranche/T2` @ 79e6ccd829). Entries: T2-5, N7 (K33). Waits on: BOB's answer to Q1; if it adds R30/R31 or rules the page's text, the job re-opens, retitles or applies, and completes again.

## Questions to BOB

**Q1 (2026-09-26), two parts. Nothing waits on it.**

(a) *Requirement ids for what N7 makes testable.* N7 moves the signing page and its generator into this module "so the module's own tests can check that the page it serves is the current render", but `build/requirements/signatures.md` has no id for that: R25 states only that `SIGN_HTML` is self-contained, and the Suggestions still say the render and the page's OpenSSH conformance "are checked outside `signatures`' own paths today ... and are not restated here as testable requirements". **Best reading, which the job builds now:** tests under `bio-plane/test/m/signatures/` check (i) `SIGN_HTML` is byte-for-byte the render of `bio-plane/src/sign-release.html` by the generator, and (ii) the page's own embedded script signs release and ratification statements that `ssh-keygen -Y verify` and `verifySshsig` accept. Until ids exist they are titled under R25 (the page served). **Recommendation:** add, as wording under P17, R30 "`SIGN_HTML` is the current, byte-identical render of `bio-plane/src/sign-release.html` by `renderSignpage`" and R31 "the page's embedded script produces SSHSIG signatures in `bio-release` and `bio-ratify` that stock `ssh-keygen -Y verify` and `verifySshsig` accept", and drop that Suggestions paragraph; the job then retitles the two tests.

(b) *The page's outward text says "BIO".* The page every instance serves (R25) is titled "BIO signing keys" and says "When BIO goes to real groups", "no BIO code", "a BIO private key". `build/layers.md` "No jurisdiction in the product", rule 4: outward text names the product (CivicOS); Believe in Oakland only as publisher and signer of a release. **Best reading:** this is outward UX text, so the job does not change it without a ruling. **Recommendation:** rename the visible words to "CivicOS" and keep every wire format unchanged (the `BIOKEY-RAW1.` / `BIOKEY1.` key prefixes, the `bio-release` / `bio-ratify` namespaces, the download name `bio-signing-keys.txt`), so existing keys and signatures keep working. If ruled yes, the job applies it in this tranche; the legacy suite `bio-plane/test/signpage.test.mjs` reads `tools/sign-release.html` (unchanged), so nothing else breaks before the layer close.

## Entries applied

- **T2-5** · Requirement-named tests for every live id. `bio-plane/test/m/signatures/signatures.test.mjs` (41 tests, `node:test`) names R1–R29 in test titles and checks each at the interface. Signatures come from three independent sources: stock `ssh-keygen` (fresh keys, sha512 and `-O hashalg=sha256`, plus the pinned OpenSSH 9.6p1 fixture), a signer written in the test from PROTOCOL.sshsig (which can set any blob field wrong, for every `MALFORMED` case), and the served page's own script. R15 compares `timestampRequest` byte for byte with 40 `openssl ts -query -sha256 -cert` queries (nonce taken from each) and with hand-built DER for leading-zero and high-bit nonces. R17 parses a real reply from a throwaway `openssl ts -reply` TSA. R26 runs every service in a child process whose `fetch`, `Date`, `performance.now` and timers are traps. Cases needing `ssh-keygen` or `openssl` skip by name when the tool is absent.
- **N7** (K33) · The page's source is now `bio-plane/src/sign-release.html` (a byte copy of `tools/sign-release.html`, which is left in place for BOB to remove at the layer close). `embed-signpage.mjs` renders from it (`SIGNPAGE_SRC`), its generated header names the new source, and `src/signpage.mjs` is re-rendered (content unchanged, header line only). The module's tests now check that the served `SIGN_HTML` is the current render of the source and that the served page's signatures verify under `verifySshsig` and `ssh-keygen -Y verify` (titled R25 until Q1(a) is answered).

## Flaws fixed in the module (step 4)

- **`verifySshsig` threw** on a message that is not bytes (e.g. a string: `crypto.subtle.digest` throws) and on an `allowedKeys` that is not an array, against R4. A non-byte message is now `MALFORMED`; a non-list `allowedKeys` allows no key (`UNKNOWN_KEY`); a last-resort catch returns `MALFORMED`. Its comment no longer says it throws on malformed input, and the header states that sha256 is accepted (R2 already did).
- **`parseTimestampResponse` threw** on non-`Uint8Array` input (R19), and **waved an unbound token through** when `expectDigestHex` was missing or empty (R17: `ok` only when the token contains the digest). A missing or non-hex digest is now `NOT_BOUND`. The plane's one caller always passes the digest, so no behaviour it relies on changes.
- **`archiveLocatorFrom` threw** on a missing or unreadable `res` (R24), and **stopped at the first header present** even when it named no archive locator, so a usable `location` or `res.url` behind a non-locator `content-location` was lost (R23: read in order). It now tries each of the three in order.
- **`TSA_ENDPOINTS` was a mutable exported array**, so any importer could add an endpoint the plane would then ask (R20, R26). It is frozen.

## Deferred

None.

## Found in other modules (REPORT)

- **Generated artifacts made stale (mechanics §14).** `bio-plane/dist/bio-plane.bundled.mjs` + `.bundle.json` (`not_product`; `fleetbundles.test.mjs`: 92 pass, 4 fail, all four the plane's staleness/byte-identity arms; baseline 96/0) — regenerate at the close as the manifest lists. **Also `newgroup/dist/newgroup.bundled.mjs`**, which bundles `bio-plane/src/sshsig.mjs` (`newgroup-bundle-fresh.test.mjs`: 3 pass, 1 fail, arm C; baseline 4/0; its FIX line: `cd newgroup && npm run build`). It is **not listed** in `build/manifest.md`'s generated-artifact table; the table should gain it, with its owner and regenerate command.
- **legacy-tests, when BOB removes `tools/sign-release.html`:** `bio-plane/test/signpage.test.mjs` reads the page from `tools/sign-release.html` (line 38) and will fail to load; `bio-plane/test/fleetbundles.control.mjs` arm (7) edits `tools/sign-release.html` to prove the render arm fails, and now edits a file the generator no longer reads, so that control no longer proves anything. Both should point at `bio-plane/src/sign-release.html` (or `SIGNPAGE_SRC`). `signpage.test.mjs` now duplicates this module's page tests and could be retired with the battery.
- **bundler:** `bio-plane/scripts/fleet-bundle.mjs` lines 165–170 describe the plane's pre-step as rendering from `tools/sign-release.html` (comment only). `tools/bundles.mjs` (not product) says the same.

## Tests and checks run (job/T2/signatures @ the commit before this record)

- `node --test bio-plane/test/m/signatures/` — `tests 41, pass 41, fail 0, skipped 0` (4 runs in the job: the first found one test bug, a stub-DOM lookup; one run was a negative control against the unchanged module code, which failed 8 tests exactly on the flaws fixed above: R4, R18, R19, R20, R23, R24, R26, R29).
- Tests of the modules that use this one (legacy battery): `sshsig 18/0`, `signpage 35/0`, `attest 48/0`, `machine-attest 36/0`, `operator-attest 18/0`, `ratify-authority 52/0`, `casesign 77/0`, `case-authority 26/0`, `signer-enrolment 32/0`, `d530-parted-attest 28/0`, `group-public 26/0`, `deliverer 20/0`, `d84-case-manifest 44/0`, `rec219-case-document-v4 39/0`, `casesearched 26/0`, `machine-fences 88/0`; `fleetbundles 92/4` and `newgroup-bundle-fresh 3/1`, both the stale bundles reported above (baseline 96/0 and 4/0).
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs` — `format: 61 modules, 19 requirements files; 0 failures`
- `node checks/architecture.mjs … signatures` — `architecture: 6 product files, 4 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … signatures` — `coverage: 1 modules, 29 of 29 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … signatures tranche/T2` — `ownership: 7 files changed by signatures between tranche/T2 and HEAD; 0 failures`

## Metrics

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01GJC6ytwQrBRdr2Y8KdcybF,job,signatures,5280374,137893,82,49487,41,4,1023
```
