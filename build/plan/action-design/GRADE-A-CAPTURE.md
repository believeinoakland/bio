# Grade A capture: the options, documented and deferred

**Status** · Research note written 2026-09-29 by a research worker for the design session with Bob, checked against the code (the `BROWSER` binding in `bio-plane/wrangler.jsonc` and the CDP driver `bio-plane/src/browserrender.mjs` exist as it says). Complete as research; NOTHING in it is built, measured or ruled. **DEFERRED by Bob, 2026-09-29 (DEC-81 item 4):** the options are credible and are kept here in full, but the work is not a priority now; its three decisions (§6.2's Grade A rule, a member-recorded WACZ's grade, whether an evidentiary capture observes `robots.txt`) wait with it. Meanwhile a co-attested Grade B is sufficient to publish (DEC-81). Figures and prices are as the sources stated them on 2026-09-29 and will drift. as of 2026-09-29

**Place in the system** · A level-2 document serving construct 2, intake, capture and provenance, whose level-1 home is `BIO_Intake_Doctrine_v1_1.md` §3 (capture grades). It answers the question DEC-81 raised: whether and how the plane can produce the Grade A capture the doctrine defines. It qualifies `CAPTURE-FIDELITY.md`'s "WACZ/Grade A remains out of a Worker's reach" (true of the Worker's own `fetch()`, not of the instance's Browser Rendering binding), bears on `CLIENT-RENDERED.md` (the render arm it would extend), `ARCHIVE-FALLBACK.md` and `MILESTONES.md` M6 (the WARC writer it would share), and on `BIO_Case_Making_v0_1.md` R2 (the rule that no surface displays Grade A, which it proposes to make conditional).

**Incomplete sections** ·
- §7. Open items and what I could not verify — every **[MEASURE]** and **[UNVERIFIED]** item there is open; none can be settled without the measurement in §6.3 or fresh access to the vendors named.
- §6.2 What the grade rules would need to say (draft for Bob) — a draft; Bob has not ruled on it, and deferred it with the work (DEC-81 item 4).
- §6.3 Measurement plan (small, concrete) — not run.

**Contents**
- [0. Bottom line](#0-bottom-line)
- [1. What the canon says, and what already exists](#1-what-the-canon-says-and-what-already-exists)
- [2. What a credible Grade A capture must contain](#2-what-a-credible-grade-a-capture-must-contain)
  - [2.1 WARC 1.1 (ISO 28500:2017) [VERIFIED]](#21-warc-11-iso-285002017-verified)
  - [2.2 WACZ 1.1.1 [VERIFIED]](#22-wacz-111-verified)
  - [2.3 Signing: WACZ Signing and Verification 0.1.0 [VERIFIED]](#23-signing-wacz-signing-and-verification-010-verified)
  - [2.4 How independent tools verify and replay [VERIFIED unless marked]](#24-how-independent-tools-verify-and-replay-verified-unless-marked)
  - [2.5 The fidelity every browser recorder gives up (state it, never paper over it)](#25-the-fidelity-every-browser-recorder-gives-up-state-it-never-paper-over-it)
- [3. Evidentiary and professional standards (brief)](#3-evidentiary-and-professional-standards-brief)
- [4. Candidate routes](#4-candidate-routes)
  - [(a) Browser Run plus an in-plane CDP recorder writing WARC/WACZ into R2](#a-browser-run-plus-an-in-plane-cdp-recorder-writing-warcwacz-into-r2)
  - [(b) Browsertrix Crawler or Scoop outside the Worker](#b-browsertrix-crawler-or-scoop-outside-the-worker)
  - [(c) Hosted services](#c-hosted-services)
  - [(d) Other routes considered](#d-other-routes-considered)
  - [Summary table](#summary-table)
- [5. Known pitfalls](#5-known-pitfalls)
- [6. Recommendation](#6-recommendation)
  - [6.1 The path](#61-the-path)
  - [6.2 What the grade rules would need to say (draft for Bob)](#62-what-the-grade-rules-would-need-to-say-draft-for-bob)
  - [6.3 Measurement plan (small, concrete)](#63-measurement-plan-small-concrete)
- [7. Open items and what I could not verify](#7-open-items-and-what-i-could-not-verify)
- [Sources](#sources)

---

Markers used: **[VERIFIED]** means read in a primary source (spec, official docs, source code) today. **[UNVERIFIED]** means secondary, inferred, or not checkable from here. **[MEASURE]** means only a live test can settle it.

## 0. Bottom line

1. **The canon's "Grade A is out of a Worker's reach" is true of the Worker's own `fetch()`. It is not true of the instance.** The plane already has a Browser Rendering binding (`BROWSER`, `bio-plane/wrangler.jsonc:123`) and a hand-written CDP driver over it (`bio-plane/src/browserrender.mjs`, D-490). This is the same mechanism Browsertrix Crawler and ArchiveWeb.page use to write WARCs: a real Chromium, with network traffic recorded over the Chrome DevTools Protocol. The missing parts are narrow and all in the group's own account: request and response headers, TLS and IP details, a WARC and WACZ writer (the plane already has a deterministic ZIP writer, `container.mjs`), and signing.
2. **Tech Arch §12's "headless dispatch is not admitted" does not apply here.** That gate is about unattended *Agent SDK* sessions under subscription terms (`BIO_Technical_Architecture_Decisions_v10.md:1312`, `:1612`), not headless *browsers*. Browser Rendering has already been admitted and built as the render arm (DIST-11, D-490).
3. **What a credible Grade A holds:** a WACZ 1.1.1 package. It contains WARC 1.1 `request`/`response` records for the page and every subresource the browser loaded, a full-page screenshot, a record of what the capture changed, and collection metadata (who, when, which egress IP, which browser). It is signed per WACZ Signing 0.1.0 and timestamped under RFC 3161. It replays in ReplayWeb.page and pywb, and it validates with `wacz validate` and `warcio check`.
4. **Honest ceiling.** No tool proves what the server sent. The WACZ signing spec says so itself: *"This proposal does not make any guarantees from the perspective of the web server serving the content, as this is not currently possible with HTTP/S."* Our own signed WACZ proves integrity since capture, who packaged it, and when. It is still the group's own testimony. Only a third party (the IA co-archive, Perma.cc) adds an independent witness. The grade text must say this.
5. **Two fidelity limits every browser-based recorder shares:** bodies arrive after decompression, and HTTP/2 headers are rebuilt in HTTP/1.1 form. Browser Run adds two more that must be measured before any Grade A claim: it injects headers we cannot remove (`Signature*`, `cf-brapi-devtools`), and it may re-terminate TLS on egress.
6. **Recommendation:** build route (a), Browser Run plus an in-plane CDP recorder that writes WACZ into R2. Sign with an instance ECDSA P-384 key (anonymous mode, key published by the instance). Timestamp the WACZ digest with the existing RFC 3161 code, and keep the IA co-archive attempt. Use Scoop, Harvard LIL's proxy-based recorder, only as a reference recorder during measurement. Keep member-browser capture (ArchiveWeb.page) as the fallback for sources that block cloud egress. Grade for that route is Bob's call. Hosted services (Perma.cc, Browsertrix cloud) are optional for crucial items and need the owner's word to fund.
7. **Before any "A" appears on a surface,** run the measurement plan in §6.3 over 7 Oakland source types. Grade A should be earned per source class, never granted globally.

---

## 1. What the canon says, and what already exists

| Canon | Says | Bearing |
|---|---|---|
| Intake Doctrine §3 | A = "WACZ web-archive or equivalent chain-of-custody capture of the source as served"; "produced by a network-capable agentic session or the M2' fetch layer where the source permits". Required before external distribution. | The doctrine already expects the fetch layer to produce A. |
| Intake Doctrine §3b | "Web captures at Grade A are WARC (ISO 28500) / WACZ, replayable in independent open-source players the group does not control"; "A trust primitive with no non-BIO verification path is not adopted." | Sets the verification bar: ReplayWeb.page, pywb, py-wacz, warcio, openssl. |
| Intake Doctrine §3c | The BagIt container holds "captures as WACZ, timestamps as RFC 3161 token files". | A WACZ drops straight into the distribution bag. |
| CAPTURE-FIDELITY.md §The shape item 5 | "WACZ/Grade A remains out of a Worker's reach and is not claimed." | True of regex-plus-fetch. Superseded in substance by the render arm. |
| Case Making R2 | "no surface may display Grade A for a direct capture" (a negative control exists). A = WACZ chain; B = direct fetch; C = via archive. | Any new A needs this rule and its negative control amended. The amendment should be *conditional on passing checks*, not removed. |
| ARCHIVE-FALLBACK.md §WARC as interchange | "Adopt WARC and Memento as INTERCHANGE. The internal store stays as it is." Nothing reads or writes WARC. M6 owns it. | A Grade A WACZ is the first WARC the tree would write. It overlaps with M6's export half and should share its writer. |
| CLIENT-RENDERED.md, `browserrender.mjs` | The render arm is BUILT: CDP over `env.BROWSER`, records every request's URL, status, type and outcome, and collects bodies with `Network.getResponseBody` under caps. Grade stays B and the method is `rendered`. `@cloudflare/puppeteer` cannot be carried (fleet bundle recipe). | About 70% of a recorder already exists. It does not keep request or response headers, TLS details or remote IP, and it takes bodies after load (they can be evicted) rather than intercepting them. |
| Tech Arch §7.2 | A snapshot's raw layer is "evidentiary, e.g. a WACZ web-archive". §12 leaves open "whether WACZ captures and SHA-256 manifests meet the chain-of-custody an evidence package may need". | §3 below is a partial answer. |
| SOURCE-ACCESS.md (measured 2026-07-30) | `www.oaklandca.gov` sits behind Akamai Bot Manager, which returns 403 to `archive.org_bot`, `ia_archiver`, Googlebot and others. The plane passes only because Akamai does not recognise `CivicOS`. BIO does not disguise its requests. | Bot-blocking is the main practical risk (§5). It also means the IA co-archive of oaklandca.gov likely fails. |

---

## 2. What a credible Grade A capture must contain

### 2.1 WARC 1.1 (ISO 28500:2017) [VERIFIED]
Source: https://iipc.github.io/warc-specifications/specifications/warc-format/warc-1.1/

- **Record types:** `warcinfo` (describes the records that follow: software, operator, settings), `request`, `response` ("complete scheme-specific response including network protocol information"), `resource` (content without protocol envelope, e.g. a screenshot), `metadata`, `revisit` (duplicate payload), `conversion`, `continuation`.
- **Mandatory fields:** `WARC-Record-ID`, `Content-Length`, `WARC-Date`, `WARC-Type`. Relevant optional fields: `WARC-Target-URI`, `WARC-IP-Address`, `WARC-Concurrent-To` (links request, response and metadata), `WARC-Block-Digest`, `WARC-Payload-Digest`.
- **An HTTP(S) `response` block** "should contain the full HTTP response received over the network, including headers". Imperfect material may be recorded "using its best effort determination".
- **Not in 1.1:** HTTP/2 or HTTP/3 representation, and TLS details. `WARC-Protocol` (e.g. `h2`, `tls/1.3`) is an **open proposal**, in active use by some tools (https://github.com/iipc/warc-specifications/issues/42). `WARC-Cipher-Suite` is proposed alongside it and requested for Browsertrix (https://github.com/webrecorder/browsertrix-crawler/issues/641).

**Minimum record set per Grade A capture (proposed):**
- one `warcinfo` record: software and version, instance, egress IP as observed, browser version, user-agent, viewport, the declared transformations (§2.5), capture window;
- `request` and `response` pairs for the locator and every subresource the browser completed;
- a `metadata` record per response carrying TLS `securityDetails` and the DER certificate chain (`Network.getCertificate`);
- a full-page screenshot and the serialised DOM as `resource` records (Browsertrix-style `urn:` URIs);
- a `metadata` record listing every request that failed, was blocked, or was omitted, with its reason. The plane's render record already keeps these facts.

### 2.2 WACZ 1.1.1 [VERIFIED]
Source: https://specs.webrecorder.net/wacz/1.1.1/

- **MUST contain:** `archive/` (one or more WARC files), `indexes/` (CDXJ, optionally gzipped), `pages/pages.jsonl` (each line needs `url` and `ts` in RFC 3339; `title`, `id`, `text`, `size` optional), and `datapackage.json` at the root.
- **`datapackage.json` MUST have** `profile: "data-package"`, `wacz_version`, and `resources[]` with `path`, `hash` (`sha256:<hex>`) and `bytes`. It SHOULD have `created`, `software`, `mainPageUrl`, `mainPageDate`, `title`.
- **`datapackage-digest.json` SHOULD be present**, with `path` and `hash` of `datapackage.json`. It is where the signature lives.
- **Fit with the plane:** the plane's STORE-mode deterministic ZIP (`container.mjs`) and its CRC-32 already cover the container. CDXJ is a sorted text index (SURT key, timestamp, JSON with offset and length).

### 2.3 Signing: WACZ Signing and Verification 0.1.0 [VERIFIED]
Spec: https://specs.webrecorder.net/wacz-auth/0.1.0/. Implementation: https://github.com/webrecorder/authsign

- **What is signed:** the `hash` string of `datapackage.json` held in `datapackage-digest.json`. The `signedData` object carries `hash`, `created`, `software`, `signature`, and then either:
  - **Anonymous mode:** `publicKey` (ECDSA, base64 SPKI). *"To validate authorship of the WACZ, external key management is required, and this signature is otherwise anonymous."*
  - **Domain mode:** `domain`, `domainCert` (PEM chain), `timeSignature` (RFC 3161 token over the signature), `timestampCert`, and optionally `crossSignedCert`. Verifiers check that `created` is within 10 minutes of the timestamp, and that the certificate was used soon after its not-before date.
- **authsign specifics (source read):**
  - ECDSA **P-256 / SHA-256**, DER signatures;
  - ACME HTTP-01 against Let's Encrypt (needs port 80 on a domain);
  - `CERT_DURATION = 7 days`, `STAMP_DURATION = 10 min`;
  - trusted timestamp roots are FreeTSA and DigiCert Trusted Root G4 (`authsign/trusted/roots.yaml`);
  - Browsertrix moved its default TSA from FreeTSA to DigiCert (https://github.com/webrecorder/browsertrix/pull/3603).
- **Its own disclaimer:** it proves nothing from the server's side and "requires trusting the client, and possible trusted third party 'observer' that signs the web archive".
- **Who signs today:**
  - Starling Lab (domain `authsign.starlinglab.org`), with Browsertrix and a second signature in its integrity pipeline (https://dispatch.starlinglab.org/p/authenticated-web-archives-wacz-files);
  - the ArchiveWeb.page extension (anonymous; "the publicKey is not yet distributed outside the extension" [UNVERIFIED, secondary]);
  - Scoop, via `--signing-url` to an authsign-compatible endpoint.

### 2.4 How independent tools verify and replay [VERIFIED unless marked]

- **ReplayWeb.page (wabac.js, AGPL):**
  - Validates every resource hash against `datapackage.json` as it loads, and shows a count in its "archive receipt" (https://webrecorder.net/blog/2022-11-10-showing-provenance-on-replaywebpage-embeds/).
  - Signature check, from `src/wacz/certutils.ts` read today:
    - **Anonymous:** imports `publicKey` as **ECDSA P-384 SPKI** and verifies `signature` over `encode(hash)` with SHA-256 through WebCrypto (raw r‖s format).
    - **Domain:** takes the public key from the leaf certificate and reads the domain from the CN.
    - **It does not validate the certificate chain or the `timeSignature`.** Full domain-mode verification needs authsign or `wacz validate --verify-auth`.
  - **Interop hazard [MEASURE]:** authsign signs P-256 in DER format; wabac's anonymous path expects P-384 in raw WebCrypto format. Our signature must be checked in *both* tools.
- **py-wacz:** `wacz validate` checks structure and hashes; `--verify-auth` verifies signatures through authsign, described by its own README as "alpha-quality" (https://github.com/webrecorder/py-wacz).
- **pywb 2.8+:** `wb-manager add --unpack-wacz <coll> file.wacz` replays WACZ content. It does not check signatures. [VERIFIED via pywb docs/search; version detail secondary]
- **warcio (Python):** `warcio check` recomputes block and payload digests. [UNVERIFIED in this session; well known]
- **openssl:**
  - `openssl ts -verify` for the RFC 3161 token (the plane's existing primitive);
  - `openssl dgst -sha256 -verify pub.pem -signature sig.der` for an ECDSA signature, after converting the raw signature to DER (a documented recipe is needed).
- **So the outsider's chain is:** `sha256sum` against the bag manifest, then `wacz validate`, then replay in ReplayWeb.page or pywb, then `openssl` for signature and timestamp, then a visit to the co-archive. Every step has a non-BIO path, which satisfies §3b.

### 2.5 The fidelity every browser recorder gives up (state it, never paper over it)
- **CDP recorders (Browsertrix Crawler since PR #424, ArchiveWeb.page):**
  - Pause each response with `Fetch.enable {requestStage: "Response"}` / `Fetch.requestPaused`, and take bodies with `Fetch.getResponseBody`, or stream them with `Fetch.takeResponseBodyAsStream` plus `IO.read` (64 KB chunks).
  - Take raw headers from `Network.requestWillBeSentExtraInfo` and `Network.responseReceivedExtraInfo`.
  - **Rebuild** the status line as `${httpProtocol} ${status} ${statusText}`.
  - Handle `content-encoding` specially, because bodies arrive decoded.
  - Hand bodies over 5 MB (non-essential) to streaming, and fall back to a fetch outside the browser (https://github.com/webrecorder/browsertrix-crawler/pull/424; `src/util/recorder.ts`).
  - CDP's own docs say `headersText` "may not always be available, such as in the case of HTTP/2 or QUIC" (devtools-protocol `browser_protocol.json`).
- **Proxy recorders (Scoop, used by Perma.cc):** they "intercept network exchanges as early as possible and preserve them 'as is'", and also save TLS certificates, a screenshot and a provenance summary (https://github.com/harvard-lil/scoop; https://lil.law.harvard.edu/blog/2023/04/13/scoop-witnessing-the-web/). Closer to the wire. HTTP/2 is still re-expressed as HTTP/1.1 in WARC [UNVERIFIED for Scoop specifically].
- **What CDP does give that a Worker `fetch()` cannot:**
  - `Response.remoteIPAddress`, `remotePort` and `protocol`;
  - `securityDetails` (TLS protocol, key exchange, cipher, subject, issuer, validity, SCT list);
  - `Network.getCertificate` (DER chain) [VERIFIED, protocol JSON].
- **Browser Run specifics [MEASURE]:**
  - It attaches non-removable `cf-brapi-devtools`, `cf-biso-devtools`, `Signature`, `Signature-Input` and `Signature-Agent` headers (https://developers.cloudflare.com/browser-run/reference/automatic-request-headers/).
  - Unknown: whether those headers appear in CDP's `requestWillBeSentExtraInfo`. If they are added outside Chrome, the WARC `request` record would under-state what was sent, and must declare it.
  - If they are added by a TLS-terminating egress proxy, `securityDetails` could describe the proxy's certificate rather than the origin's. This is the single most important unknown for route (a).

---

## 3. Evidentiary and professional standards (brief)

- **Berkeley Protocol (OHCHR / UC Berkeley, 2022 edition), ¶153–156 [VERIFIED, text extracted]:**
  - Collect "in its native format or in a state as close to its original format as possible. Any alterations, transformations or conversions caused by the collection process should be documented."
  - The first three items, "URL, Hypertext Markup Language (HTML) source code and full-page capture", "serve as a minimum standard for providing evidence in court". Also listed: embedded media, metadata, context, and **collection data**: "the name of the collector, the IP address of the machine used to collect the information … and a time stamp", with an NTP-synced clock.
  - A hash "at the point of collection".
  - For automated collection, "a technical report … for the purpose of establishing the item's authenticity".
  - https://www.ohchr.org/sites/default/files/2024-01/OHCHR_BerkeleyProtocol.pdf
  - **Consequence:** a Grade A WACZ should include a screenshot `resource` record and a `warcinfo` or collection report naming the collector, egress IP and time. WARC request and response records plus DOM cover "source code".
- **US Federal Rules of Evidence:**
  - 902(13), a certified record of an electronic process;
  - 902(14), data authenticated by "a process of digital identification". The 2017 note says "identical hash values for the original and copy reliably attest to the fact that they are exact duplicates" (https://www.law.cornell.edu/rules/fre/rule_902).
  - These allow self-authentication by a qualified person's certification. The WACZ hashes and RFC 3161 token supply the technical basis; a person must still certify.
- **Courts and web archives:** *United States v. Gasperini* (2d Cir. 2018) upheld Wayback Machine screenshots authenticated by an Internet Archive employee's testimony (https://law.justia.com/cases/federal/appellate-courts/ca2/17-2479/17-2479-2018-07-02.html). **I found no reported decision specifically ruling on WACZ signatures or self-produced WARCs [could not verify].** California law was not researched.
- **Investigative practice:**
  - Starling Lab and Hala Systems filed a "cryptographic submission" to the ICC in 2022 (https://sfi.usc.edu/news/2022/06/33571-starling-lab-and-hala-systems-file-cryptographic-submission-evidence-war-crimes), and Starling signs Browsertrix WACZs.
  - Perma.cc (Harvard LIL) captures with Scoop to WACZ plus a screenshot, and is widely cited by courts and journals.
  - Bellingcat's auto-archiver builds on the Browsertrix Crawler image for WACZ (https://github.com/bellingcat/auto-archiver).

---

## 4. Candidate routes

### (a) Browser Run plus an in-plane CDP recorder writing WARC/WACZ into R2

- **Feasibility: high.**
  - The binding and a CDP client already exist (`browserrender.mjs`).
  - Changes needed:
    - switch body capture to `Fetch.requestPaused` at the Response stage;
    - add the `*ExtraInfo` events, `securityDetails`, `getCertificate` and a screenshot (`Page.captureScreenshot`);
    - write WARC records;
    - build CDXJ, `pages.jsonl` and `datapackage.json`, then zip with `container.mjs`;
    - sign;
    - stream to R2.
  - **Library choice:** warcio.js is Apache-2.0 and browser-compatible, but depends on `hash-wasm`, which compiles WASM from embedded bytes. Workers forbid that ("Wasm code generation disallowed by embedder"; https://github.com/cloudflare/workers-sdk/issues/1366). The plane also cannot take npm dependencies under the fleet bundle recipe (`browserrender.mjs` header). **So write WARC by hand** (text headers, per-record gzip via `CompressionStream`, WebCrypto SHA-256), following the plane's SSHSIG pattern. Use warcio (Python), py-wacz and pywb as conformance oracles in tests.
  - js-wacz is Node-only (worker threads, fs), so it is not usable in a Worker.
  - **No public example found** of anyone recording WARC through Cloudflare Browser Rendering [searched; none found].
- **Fidelity:** a real Chromium records every script-loaded request, with the §2.5 limits (decoded bodies, rebuilt HTTP/2 headers). Browser Run's injected headers and possible TLS re-termination are **[MEASURE]**. The existing measured wait rule (R26, 4 s long-lived cutoff) carries over.
- **Limits** (https://developers.cloudflare.com/browser-rendering/platform/limits/, as of 2026-09-26):
  - Workers Paid: 200 concurrent browsers per account, 3 new per second, 60 s inactivity timeout (keep_alive up to 10 min).
  - Free plan: 10 min per day, 3 concurrent.
  - Worker and Durable Object memory is 128 MB, so bodies must stream to R2 multipart and the existing body caps (`SUBRESOURCE_CAP` 400) apply.
- **Cost** (https://developers.cloudflare.com/browser-rendering/pricing/):
  - 10 browser-hours per month included on Paid, then $0.09/h. At 15–30 s per capture that is about 1,200–2,400 captures a month included, then roughly $0.0004–0.0008 each.
  - 10 concurrent included (monthly average of daily peak), then $2 per browser.
  - R2: $0.015/GB-month after 10 GB free, egress free (https://developers.cloudflare.com/r2/pricing/).
- **Sovereignty: full.** Group's own account, no new vendor.
- **Verifiability:** full standard stack (§2.4), once the ECDSA signature interop is confirmed.

### (b) Browsertrix Crawler or Scoop outside the Worker

- **b1 – Cloudflare Containers (same account):**
  - Available on Workers Paid; standard-2 is 1 vCPU / 6 GiB / 12 GB disk; images up to instance disk (https://developers.cloudflare.com/containers/platform-details/limits/).
  - Billed per 10 ms: $0.000020 per vCPU-s, $0.0000025 per GiB-s, 375 vCPU-min and 25 GiB-h included (https://developers.cloudflare.com/containers/pricing/). About $0.002 per one-minute capture beyond the included amount.
  - Sovereign. Highest fidelity if Scoop (MIT, proxy-based, stores certificates and a provenance summary) is used.
  - Adds a new fleet member, a container image to maintain, and AGPL if Browsertrix is used (running it unmodified is fine).
  - Egress is still Cloudflare's, so the bot-blocking exposure is the same as (a).
  - Chromium in Containers is **[UNVERIFIED]**.
- **b2 – A member's machine:**
  - ArchiveWeb.page extension or app (AGPL, CDP-based, WACZ with anonymous signature), or Scoop / Browsertrix via Docker.
  - Upload through the member's path; the instance hashes at receipt, validates the WACZ, and timestamps under RFC 3161.
  - Residential egress gets past cloud-IP blocking, and a human can clear interstitials.
  - The chain is the member's custody (Intake §3a style), not the instance's. Trust in the member's machine is the named weakest layer.
- **Sovereignty:** b1 full; b2 group-controlled but distributed.
- **Verifiability:** standard.

### (c) Hosted services

- **Browsertrix cloud (Webrecorder):**
  - $30 / $60 / $120 per month for 180 / 360 / 720 execution-minutes and 100 / 220 / 500 GB (https://webrecorder.net/browsertrix/pricing/).
  - WACZ downloadable; authsign signing is supported in deployments (https://docs.browsertrix.com/deploy/customization/). Whether the hosted tier signs by default is **[UNVERIFIED]**.
  - A third-party *tool operator*, but not an independent *witness* (it acts on the group's instruction).
- **Perma.cc (Harvard LIL):**
  - Scoop capture, WACZ plus screenshot; API objects expose `wacz_download_url` and `warc_download_url` [UNVERIFIED: search snippet; perma.cc returned 403 to fetch].
  - Individual tiers of $10 / $25 / $100 per month for 10 / 100 / 500 links (2019–2021 figures, **[UNVERIFIED current]**).
  - Strongest *independent-institution* witness available; court-familiar.
- **Internet Archive Save Page Now:**
  - Free; SPN2 API: 10 concurrent sessions per user, a URL at most 10 times a day (SPN2 docs, archive.org item `spn-2-public-api-page-docs`).
  - The WARC is **not** retrievable through the API; SPN collections are access-restricted (https://wiki.archiveteam.org/index.php/Internet_Archive/Save_Page_Now).
  - Logged-in UI users can get an "Email me a WACZ file" copy, which expires in 3 days and has response records only (https://inkdroid.org/2023/04/03/spn-wacz/). The API equivalent is **[UNVERIFIED]**.
  - Stays what the canon already treats it as: delegated attestation. And oaklandca.gov 403s `archive.org_bot` (SOURCE-ACCESS).
- **Sovereignty:** all are external vendors, so the owner's word is required for anything paid.

### (d) Other routes considered

- **WARC from the Worker's own `fetch()` (no browser):**
  - Trivial to build, and useful for M6 interchange and for datasets (Socrata CSV/JSON exports) and PDFs.
  - Has no remote IP, no TLS details and no HTTP version, and the body is likely decoded **[UNVERIFIED for workerd]**.
  - Honestly "B, WARC-packaged". **Recommend it never earns A.**
- **ArchiveWeb.page Express / Create Archive Now:** captures through a CORS proxy running as a Cloudflare Worker; deprecated and experimental (https://github.com/webrecorder/express.archiveweb.page). Not credible for A.
- **archive.today and commercial legal-capture tools (Page Vault, WebPreserver):** non-standard or proprietary verification. Fail §3b. Not evaluated further.

### Summary table

| Route | Script-loaded resources | Near-wire HTTP + TLS/IP | In group's account | Marginal cost | Main risk | Could earn A? |
|---|---|---|---|---|---|---|
| (a) Browser Run + in-plane recorder | Yes | Partial (CDP-reconstructed; Browser Run proxy **[MEASURE]**) | Yes | ~$0.0005/capture after 10 h/mo; R2 $0.015/GB-mo | Injected headers or TLS re-termination; bot-blocking of CF egress | **Yes, per source class, after §6.3** |
| (b1) Scoop/Browsertrix in CF Containers | Yes | Best (Scoop proxy + certs) | Yes | ~$0.002/min-capture | New fleet member + image upkeep; same egress blocking; unverified Chromium-in-Containers | Yes; fallback if (a) fails fidelity |
| (b2) Member's browser (ArchiveWeb.page / Scoop CLI) | Yes | Good (CDP) or best (Scoop) | Group-controlled, off-plane | Free | Member's machine is the trust anchor | Bob's call: "A, member custody"? |
| (c) Perma.cc | Yes | Best (Scoop) | No | ~$0.25–1/link **[UNVERIFIED]** | Vendor; funding | Strongest *co-witness*; pair with (a) for crucial items |
| (c) Browsertrix cloud | Yes | Good (CDP) | No | $30–120/mo | Vendor; not independent | Yes, but no sovereignty gain over (a) |
| (c) IA SPN | Yes | n/a (not ours) | No | Free | WARC not retrievable; Oakland 403s IA | No (stays co-archive / C) |
| (d) Worker-fetch WARC | No | No | Yes | ~0 | — | No (B, WARC-packaged) |

---

## 5. Known pitfalls

1. **Bot-blocking.**
   - Oakland's CDN (Akamai) already 403s named archival crawlers, measured 2026-07-30.
   - Browser Run requests carry signed Web Bot Auth headers that cannot be removed, and Cloudflare scores them as bots (bot score 1) for its own customers.
   - Akamai is "partnering" on Web Bot Auth (https://www.akamai.com/blog/security/redefine-trust-web-bot-authentication). Whether it categorises Browser Run is **[UNVERIFIED]**.
   - Doctrine forbids disguise, so a refusal must be recorded as a refusal, and the fallback is (b2) member capture.
2. **Sites that refuse archiving.** The City's `robots.txt` disallows some transparency publications (SOURCE-ACCESS), and IA honours exclusions. Whether BIO's evidentiary single-page capture observes `robots.txt` is a **policy question for Bob**.
3. **Dynamic content.**
   - Long-lived requests (LaunchDarkly, social widgets on opengov) are handled by R26's rule.
   - Legistar's ASP.NET tabs and paging use POST postbacks, which WACZ replay handles poorly (IIPC "CDX for non-GET requests" is still a draft).
   - Socrata dataset pages render from API JSON, so the dataset export should also be captured as its own record.
   - Infinite scroll and interactions need "behaviors", which are out of scope for a single-page A.
4. **Large media.**
   - Agenda packets can be hundreds of MB; Granicus video is HLS.
   - Browsertrix streams anything over 5 MB and caps network loads at 200 MB; the plane has 128 MB of memory and body caps.
   - Stream to R2, exclude video by default, and list every omission in the WACZ (and keep completeness separate from grade, per Bob's ruling in CLIENT-RENDERED).
5. **Storage growth.** WACZ packs duplicate bytes that the content-addressed store dedups today. The options are to store signed WACZ bytes as-is (simple, grows linearly) or to store WARC records content-addressed and rebuild the WACZ (breaks byte-stable signatures unless the build is deterministic). M6 already owns "capture-byte custody at scale". Decide there.
6. **Clocks.** `WARC-Date` and `created` come from the Worker clock. The RFC 3161 token is the authoritative instant. Record both.
7. **Signature interop.** ReplayWeb.page (P-384, raw) and authsign (P-256, DER) differ. Domain mode needs ACME on a hostname the group controls, and ReplayWeb.page does not check chains anyway. **Use anonymous mode now** and publish the key in two places: in the instance at a stable URL, and in the group's BagIt metadata, anchored by an RFC 3161 token over the key's fingerprint.
8. **Legal / permitted use (not legal advice).**
   - Capturing public government pages for civic purposes is ordinary archiving practice.
   - California local-government records are generally not restrictable by copyright (*County of Santa Clara v. Superior Court*, 2009) **[UNVERIFIED here]**.
   - Vendor terms of service (Granicus/Legistar, Socrata/Tyler, OpenGov) were not reviewed **[UNVERIFIED]**.
   - Tech Arch §12's "permitted use" concerns Agent SDK terms, not browsers.
9. **Licensing.** Embedding wabac.js, ArchiveWeb.page or Browsertrix code in the plane imports AGPL obligations. warcio.js is Apache-2.0; js-wacz and Scoop are MIT. A hand-written writer avoids the question.

---

## 6. Recommendation

### 6.1 The path
1. **Build route (a)** as a recorder inside the render arm, behind a `record: "wacz"` flag. It extends `browserrender.mjs` and adds a new `wacz.mjs` (WARC, CDXJ, `pages.jsonl`, datapackage), reusing `container.mjs` for the ZIP and `tsa.mjs` for timestamps.
   - The raw Grade B fetch keeps happening beside it (accretive; the doctrine's "B to A upgrades are adds").
   - Grade A attaches to the WACZ capture only.
2. **Sign** `datapackage-digest.json` with a new instance ECDSA **P-384** key (WebCrypto; anonymous `publicKey` mode for ReplayWeb.page compatibility), kept like the existing Ed25519 receipt key. Add an RFC 3161 token over the same `datapackage.json` digest, stored as its own `.tsr` beside the WACZ, and keep R20's co-archive attempt.
3. **Reference recorder, measurement only:** run Scoop (MIT) on a dev machine or in one Container to produce a proxy-level WACZ of the same pages as a fidelity yardstick. Promote (b1) to production only if (a) fails the transport-truth test P4 below.
4. **Member route (b2)** for sources that refuse cloud egress: accept an ArchiveWeb.page or Scoop WACZ from a signed-in member. Validate it, hash it at receipt, timestamp it, and record the member's attestation. **Its grade is Bob's decision** (proposal below).
5. **Hosted co-witness (c)** for crucial-criticality items: a Perma.cc capture as an independent institution's witness. Needs the owner's word to fund. IA SPN stays as today.

### 6.2 What the grade rules would need to say (draft for Bob)

> **Grade A, evidentiary raw capture.** A WACZ (1.1.1) whose WARC records hold the request and response exchanges a browser made while loading the source, a full-page screenshot, the collection data (collector instance, time, egress address, software), and a declared list of every transformation the recorder applied and every request omitted. It earns A only when (1) it validates with `wacz validate` and its digests with `warcio check`; (2) its main page replays in ReplayWeb.page and pywb; (3) its `datapackage` digest carries the instance's published signature and an RFC 3161 token; and (4) the recording route has passed the measurement for that source class. **What A proves:** the group's instance recorded this exchange at this instant and it has not changed since. **What A does not prove:** that the server sent these bytes. That is still the group's attestation, raised by an independent co-witness (co-archive, Perma) where one exists.

- **Amend Case Making R2's negative control** from "no surface may display A for a direct capture" to "no surface may display A unless (1)–(4) are recorded as passed".
- **Member-recorded WACZ (b2):** proposed as **A with member custody named** (the §3a pattern). If Bob prefers, it can instead be capped at B until an instance capture or co-witness corroborates it.
- **A Worker-fetch WARC never earns A.**
- **Completeness stays separate from grade**, as Bob already ruled for rendered captures.

### 6.3 Measurement plan (small, concrete)

**Sample: 7 source types × 3 runs on different days.** Each run uses route (a); route (a) is compared with Scoop and with the existing Grade B fetch.

| # | Source | Why |
|---|---|---|
| 1 | `oakland.legistar.com/Calendar.aspx` | Server-rendered control (M-151's control) |
| 2 | A Legistar `MeetingDetail.aspx` plus its agenda PDF (`View.ashx`) | Postback UI, PDF by link |
| 3 | A Legistar `LegislationDetail.aspx` with attachments | Tabs and attachments |
| 4 | A `www.oaklandca.gov` budget page plus a `/files/assets/` PDF | Akamai bot manager |
| 5 | A `data.oaklandca.gov` dataset page plus its `resource/<id>.csv` export | Socrata client-rendered plus data |
| 6 | `oaklandca.opengov.com/transparency` | Long-lived requests (R26) |
| 7 | A Granicus meeting media page plus one >100 MB agenda packet | Media exclusion, streaming, caps |

**Pass criteria (per run):**
- **P1 Structure:** `wacz validate` passes; `warcio check` reports no digest errors.
- **P2 Independent replay:** the main page renders in ReplayWeb.page (hosted and a local copy) and in pywb (`--unpack-wacz`). Every resource the record says completed replays with no "not found". A replay screenshot matches the captured screenshot on visual inspection (set a pixel-diff threshold after run 1).
- **P3 Fidelity:**
  - every request CDP observed has request and response records or a named omission;
  - the WARC payload SHA-256 of each PDF or CSV **equals** the Grade B direct-fetch SHA-256 (cross-route corroboration);
  - header sets are compared with Scoop's for the same URL, and differences are listed and declared in `warcinfo`.
- **P4 Transport truth (route-level, run once per source host):**
  - the recorded leaf certificate's SPKI equals the origin's, checked against crt.sh or `openssl s_client` from a non-Cloudflare vantage point. A mismatch means Browser Run re-terminates TLS: record it and escalate to (b1).
  - Determine whether the injected `Signature*` and `cf-*` headers appear in recorded `request` records. If not, declare them.
- **P5 Signature:**
  - ReplayWeb.page shows the signature valid;
  - `openssl dgst` verifies it with the published key (documented recipe);
  - `openssl ts -verify` verifies the token;
  - `wacz validate --verify-auth` result recorded (an incompatibility is noted, not fatal, if the other checks pass);
  - a one-byte tamper is detected by ReplayWeb.page and `wacz validate`.
- **P6 Access:** HTTP status and any challenge page recorded per host through Browser Run. Any 403 or challenge means route (a) fails for that host, and the host is routed to (b2).
- **P7 Cost:** browser-seconds, WACZ bytes and R2 bytes per capture, projected against 10 h/month and the storage budget.

**Decision rule:**
- A source class earns A through route (a) if P1, P2, P3 and P5 pass in 3 of 3 runs and P6 passes.
- P4 must be either passed or its limitation stated in the grade text. If Browser Run re-terminates TLS, route (a) captures are A only with that limitation named, and (b1) Scoop-in-Containers becomes the recommended recorder.

---

## 7. Open items and what I could not verify
- Whether Browser Run's CDP endpoint allows the `Fetch` domain, `Network.getCertificate` and `*ExtraInfo` events; whether injected headers are visible to CDP; whether its egress re-terminates TLS. **[MEASURE]**
- Whether Akamai's Bot Manager categorises Browser Run's Web Bot Auth identity. **[MEASURE]**
- Perma.cc current pricing, API download fields and whether its WACZs are signed (perma.cc blocked fetches). **[UNVERIFIED]**
- Whether IA exposes SPN's WACZ through the API. **[UNVERIFIED]**
- Whether Browsertrix cloud signs WACZs by default. **[UNVERIFIED]**
- Whether workerd's `fetch()` returns decoded bodies for gzip/br (matters only for the Worker-fetch WARC). **[UNVERIFIED]**
- Any court decision on WACZ signatures specifically: none found. California evidentiary rules and vendor terms of service were not researched.

## Sources
- WARC 1.1: https://iipc.github.io/warc-specifications/specifications/warc-format/warc-1.1/ · WARC-Protocol proposal: https://github.com/iipc/warc-specifications/issues/42 · rendered-targets proposal: https://iipc.github.io/warc-specifications/specifications/warc-rendered-targets/warc-rendered-targets-1.0/
- WACZ 1.1.1: https://specs.webrecorder.net/wacz/1.1.1/ · WACZ signing 0.1.0: https://specs.webrecorder.net/wacz-auth/0.1.0/ · authsign: https://github.com/webrecorder/authsign (source: `authsign/crypto.py`, `utils.py`, `trusted/roots.yaml`) · Browsertrix TSA change: https://github.com/webrecorder/browsertrix/pull/3603
- ReplayWeb.page provenance: https://webrecorder.net/blog/2022-11-10-showing-provenance-on-replaywebpage-embeds/ · wabac.js `src/wacz/certutils.ts` (raw.githubusercontent.com/webrecorder/wabac.js/main) · py-wacz: https://github.com/webrecorder/py-wacz · pywb WACZ: https://pywb.readthedocs.io/en/latest/manual/apps.html
- Browsertrix Crawler: https://github.com/webrecorder/browsertrix-crawler · PR #424: https://github.com/webrecorder/browsertrix-crawler/pull/424 · `src/util/recorder.ts` · outputs: https://crawler.docs.browsertrix.com/user-guide/outputs/
- ArchiveWeb.page: https://github.com/webrecorder/archiveweb.page · Express: https://github.com/webrecorder/express.archiveweb.page · warcio.js: https://github.com/webrecorder/warcio.js · js-wacz: https://github.com/harvard-lil/js-wacz
- Scoop: https://github.com/harvard-lil/scoop · https://lil.law.harvard.edu/blog/2023/04/13/scoop-witnessing-the-web/
- CDP protocol definitions: https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json
- Cloudflare Browser Run limits: https://developers.cloudflare.com/browser-rendering/platform/limits/ · pricing: https://developers.cloudflare.com/browser-rendering/pricing/ · headers: https://developers.cloudflare.com/browser-run/reference/automatic-request-headers/ · changelog: https://developers.cloudflare.com/browser-run/changelog/ · https://blog.cloudflare.com/browser-run-for-ai-agents/ · Web Bot Auth: https://blog.cloudflare.com/web-bot-auth/
- Cloudflare Containers: https://developers.cloudflare.com/containers/ · limits: https://developers.cloudflare.com/containers/platform-details/limits/ · pricing: https://developers.cloudflare.com/containers/pricing/ · R2 pricing: https://developers.cloudflare.com/r2/pricing/ · Workers WASM restriction: https://github.com/cloudflare/workers-sdk/issues/1366
- Browsertrix pricing: https://webrecorder.net/browsertrix/pricing/ · self-host signing: https://docs.browsertrix.com/deploy/customization/
- IA SPN2 docs: https://archive.org/details/spn-2-public-api-page-docs · SPN WACZ email: https://inkdroid.org/2023/04/03/spn-wacz/ · ArchiveTeam: https://wiki.archiveteam.org/index.php/Internet_Archive/Save_Page_Now
- Perma.cc developer docs (not fetchable): https://perma.cc/docs/developer
- Berkeley Protocol: https://www.ohchr.org/sites/default/files/2024-01/OHCHR_BerkeleyProtocol.pdf · FRE 902: https://www.law.cornell.edu/rules/fre/rule_902 · Gasperini: https://law.justia.com/cases/federal/appellate-courts/ca2/17-2479/17-2479-2018-07-02.html · Starling: https://dispatch.starlinglab.org/p/authenticated-web-archives-wacz-files · https://sfi.usc.edu/news/2022/06/33571-starling-lab-and-hala-systems-file-cryptographic-submission-evidence-war-crimes · WACZ update: https://webrecorder.net/blog/2023-05-03-an-update-on-wacz/ · auto-archiver: https://github.com/bellingcat/auto-archiver
- Repo canon read: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3–3c; `docs/development/CAPTURE-FIDELITY.md`; `docs/development/ARCHIVE-FALLBACK.md`; `docs/development/MILESTONES.md` M6; `docs/architecture/BIO_Case_Making_v0_1.md` R2; `docs/architecture/BIO_Technical_Architecture_Decisions_v10.md` §7.2, §10 (headless dispatch), §12; `docs/development/CLIENT-RENDERED.md`; `docs/development/SOURCE-ACCESS.md`; `bio-plane/wrangler.jsonc`; `bio-plane/src/browserrender.mjs`, `tsa.mjs`, `container.mjs`, `sshsig.mjs`, `provenance/index.mjs`.
