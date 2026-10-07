# Study · N710 · Security tools that plug in: candidates per kind

**Status** · STUDY by a research worker for BOB #128, 2026-10-07, on `tranche/T35`. Every page cited was **read on 2026-10-07**. Anything not confirmed on the vendor's own current page is marked *(unconfirmed)*; "(search summary)" means the claim came from a search engine's digest of the vendor page named, not from reading the page itself. Nothing was bought, configured or measured. Answers N710 (`build/plan/next.md`) under K1929 (Bob, 2026-10-07): every kind is supported; **no file goes to a service that shares submitted samples with others** (K1929 (3)); every other service's handling is stated before an administrator enables it; verdict notes name tool, engine and version; log forwarding carries counts, never who opened which file (K1892). Follows the model of `plan/study-scanner-N705.md` (Scanii, K1895).

**Short answer.** Every kind has at least two credible, privately usable candidates. The main split is not between vendors but between **modes**: most vendors have a public or community mode that shares samples (disqualified) and a paid private mode that does not. The real disqualifications are services whose only usable mode shares (VirusTotal upload, Jotti, Hybrid Analysis, Joe Sandbox Cloud Basic, urlscan.io public/unlisted). Two vendors (Sophos Intelix, Palo Alto WildFire) keep *malicious* samples for their own research but do not say they pass them to others; whether that counts as "sharing" is Bob's (§8 Q1).

---

## 1. Reachability from Civicsmith (applies to every kind)

- **HTTPS REST** is reachable from a Worker with `fetch` (and from a Container). Most candidates are REST.
- **Raw TCP (ICAP on 1344, syslog over TLS on 6514)**: a Worker's `connect()` supports TCP, TLS and StartTLS, blocks port 25, and **cannot reach private network or Cloudflare IP addresses** ([TCP sockets](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/)). So a public-facing ICAP or syslog server is reachable directly; an on-premises one is not.
- **On-premises servers** (ICAP, MetaDefender Core, self-hosted Glasswall, syslog collector): **Workers VPC** binds a Worker to services behind a Cloudflare Tunnel the organization runs; "VPC Network bindings" reach any service on that tunnel's network ([Workers VPC](https://developers.cloudflare.com/workers-vpc), search summary incl. 2026-04-14 changelog). Whether a VPC binding carries raw TCP (ICAP) rather than only HTTP *(unconfirmed)*. Fallback: the scanner Container speaks ICAP over the tunnel *(unconfirmed, not tested)*.
- **gRPC-only SDKs** (Trend Micro) need the Container, not a Worker *(Worker gRPC not tested)*.

## 2. Kind 1 · File scanners (API or ICAP)

Built-in default: ClamAV in the group's own account (K1929 (1)); Scanii already ruled as the deeper check's outside scanner (K1895).

| Candidate | Submit | From CF | Answer | Data handling | Price / licence | Product-use terms | Status |
|---|---|---|---|---|---|---|---|
| **Scanii** | REST, key:secret | Worker `fetch` | one `findings` list | file deleted at end of scan; result record ≤400 days; region chosen | $49/mo; non-profit $9.99 | allowed "within Your own products" | **Ruled (K1895)** |
| **OPSWAT MetaDefender Cloud** | REST v4, API key, upload then poll | Worker | per-engine results, 10–20+ engines | private mode: "not stored or shared", results kept; paid only | quote only | "internal use"; partner agreement for products | Catalogue (needs terms letter) |
| **OPSWAT MetaDefender Core** | REST `POST /file` → `data_id`, poll or webhook; self-hosted | Workers VPC / tunnel, or public HTTPS | per-engine; also sanitized file | in the organization's own servers | licence, quote *(unconfirmed)* | org's own licence | Catalogue |
| **Generic ICAP** (c-icap + ClamAV/squidclamav, MetaDefender ICAP, any vendor's ICAP) | ICAP RESPMOD/REQMOD (RFC 3507) | `connect()` if public; tunnel if on-prem | ICAP status + `X-Infection-Found` / `X-Virus-ID` headers | in the organization's own servers | free (c-icap) or vendor | org's own | Catalogue (transport) |
| **Trend Vision One File Security** | gRPC SDK (Go, Python, Java, Node), API key, region | Container only | JSON `scanResult`, `foundMalwares[]`, hashes; verbose adds engine version | **file retention not stated** | Vision One credits *(unconfirmed)* | SDK is MIT; service terms not read | Hold until Trend states handling |
| **Microsoft Defender for Storage** | no file-submit API: scans blobs in the org's **Azure** storage on upload (or on demand) | indirect: copy file to org's blob, read index tag | tag "No threats found / Malicious / Error / Not scanned"; alerts; Event Grid | read in-region, scanned in memory, "doesn't retain the scanned content" | per GB scanned | org's own Azure | Catalogue (Microsoft shops) |
| **Sophos Intelix** (static / cloud lookup) | REST | Worker | JSON/HTML report by job ID or SHA-256 | clean files ≤30 days; **malicious kept indefinitely, sent to UK Hub**; metadata ≤6 months for research | free monthly allowance + pay-as-you-go (AWS Marketplace) | not read *(unconfirmed)* | **Bob's (§8 Q1)** |

Evidence:
- **Scanii**: see `plan/study-scanner-N705.md` §2.1 (read 2026-10-07).
- **MetaDefender Cloud**: private mode, paid only ([private scanning](https://www.opswat.com/docs/mdcloud/operation/private-scanning-with-metadefender-cloud-apis), via N705); API v4 ([API](https://www.opswat.com/docs/mdcloud/metadefender-cloud-api-v4)); terms "solely for Your internal use" ([terms](https://www.opswat.com/legal/terms-of-service)). Full detail in N705 §2.2.
- **MetaDefender Core**: "JSON-based REST API", `POST /file` returns `data_id`, batch upload, results by polling or webhook, `GET /file/converted/{data_id}` for sanitized files, default server `localhost:8008` ([Core API](https://www.opswat.com/docs/mdcore/metadefender-core)). Licence price *(unconfirmed)*.
- **ICAP**: MetaDefender ICAP Server "follows the ICAP protocol defined in RFC 3507" and documents its responses ([MD ICAP KB](https://www.opswat.com/docs/mdicap/knowledge-base/what-are-icap-s-server-responses-for-various-post-analysis-file-)); squidclamav sets `X-Infection-Found` and `X-Virus-ID` (search summary of [openSUSE package](https://build-test-1.opensuse.org/package/show/server:proxy/squidclamav?rev=6)); c-icap's own `virus_scan` module "only scans downloaded data" (search summary, forum) *(unconfirmed on c-icap's own docs)*. ICAP answers are protocol-shaped, so the adapter maps status/headers to the verdict note; engine version is usually absent *(unconfirmed)*.
- **Trend**: transport gRPC with TLS; regions us-east-1, eu-central-1, eu-west-2, ca-central-1, ap-southeast-1/2/3, ap-northeast-1, ap-south-1, me-central-1, af-south-1; result fields as above; "does not explicitly state whether scanned files are retained" ([Go SDK](https://github.com/trendmicro/tm-v1-fs-golang-sdk)). Trend's own overview page would not load (redirect loop). The sibling Cloud One product collects "names of scanned files" (search summary, [data collection](https://cloudone.trendmicro.com/docs/file-storage-security/data-collection)) — the adapter must not send names.
- **Defender for Storage**: on-upload scanning of blobs; "The service doesn't retain the scanned content and deletes it immediately after scanning"; content read "within the same region as your storage account"; "billed per GB scanned" with a monthly cap; up to 50 GB/min ([on-upload scanning](https://learn.microsoft.com/en-us/azure/defender-for-cloud/on-upload-malware-scanning), updated 2026-09-22); result tags (search summary, [introduction](https://learn.microsoft.com/en-gb/azure/defender-for-cloud/introduction-malware-scanning)). **No Microsoft API that takes a file and returns a verdict was found**; "Microsoft Defender" endpoint products do not offer one for third-party files *(absence; unconfirmed)*. False-positive submission to Microsoft is a separate manual act and shares the file; the adapter never does it.
- **Sophos Intelix**: submitted data includes "Threat Object" plus "Customer ID, Machine ID, file path, filename"; analysis in the selected region, but dynamic-analysis traffic "might be routed to another region"; malicious files "automatically routed to the SophosLabs Hub" (UK) and "retained indefinitely"; "does not use third party sub-processors"; no statement of sharing samples with other parties ([Intelix privacy](https://www.sophos.com/en-us/legal/product-privacy-information/sophoslabs-intelix)). Free monthly allowance and pay-as-you-go via AWS Marketplace (search summary, [AWS listing](https://aws.amazon.com/marketplace/pp/Sophos-Limited-SophosLabs-Intelix/B07SLZPMCS)); current amounts *(unconfirmed)*. Note Scanii's second engine is Sophos; whether it reports to SophosLabs *(unconfirmed)*.
- **Cloudflare's own**: WAF "malicious uploads detection" scans uploads in requests to a proxied zone (first 50 MB), exposes `cf.waf.content_scan.*` fields, "Enterprise plan with a paid add-on", gives signals only, retention not stated ([malicious uploads](https://developers.cloudflare.com/waf/detections/malicious-uploads/)). It sees member uploads, not files a capture fetches; not a callable scanner. Listed for completeness, not catalogued.
- **Disqualified (K1929 (3))**: VirusTotal ordinary upload (shares with partners; private scanning has no AV engines) and Jotti ("All files are shared with anti-virus companies") — both per N705 §2.6.

## 3. Kind 2 · Safe-copy makers (CDR)

Built-in default: the safe view (K1888). A CDR output is a **derived document**, labelled and linked to its original; cases cite the original only (K1929 (4)).

| Candidate | Submit | From CF | Output | Data handling | Price / licence | Status |
|---|---|---|---|---|---|---|
| **OPSWAT Deep CDR** (Cloud or Core) | REST: scan, then download sanitized file | Worker (Cloud); tunnel (Core) | rebuilt file, 150+ types, report | Cloud: sanitized copy "deleted after 24h", private mode as §2; Core: org's servers | quote | Catalogue |
| **Glasswall Halo** | sync REST (also async, ICAP profiles) | Worker if hosted/public; tunnel if self-run | rebuilt "visually identical" file + analysis report | files deleted from the volume per retention policy | entitlement per files or volume/day; quote | Catalogue |
| **Votiro** (Menlo Security since 2025) | REST ("Disarmer"), SaaS | Worker *(unconfirmed)* | sanitized file + report | original deleted and replaced by sanitized version; region, retention, sharing **not found** | quote; AWS/Azure Marketplace | Hold until stated |
| **Check Point Threat Extraction** | Threat Prevention API (`te.checkpoint.com` cloud, or the org's gateway) upload/query | Worker (cloud) | cleaned file | **not found** | org's Check Point licence | Hold until stated |

Evidence:
- **OPSWAT**: Cloud "sanitizes files after first scanning them" and "Whether uploading files in private mode or not the sanitized version of the file will be deleted after 24h"; 150+ types incl. DOC(X), XLS(X), PPT(X), PDF; licensing not on page ([Cloud Deep CDR](https://www.opswat.com/docs/mdcloud/operation/data-sanitization-on-metadefender-cloud)). Core: `GET /file/converted/{data_id}` ([Core API](https://www.opswat.com/docs/mdcore/metadefender-core)).
- **Glasswall**: synchronous REST "typically securing files in under a second"; Halo SaaS and APIs for policy, ICAP profiles ([APIs](https://docs.glasswall.com/rest-api/about-glasswall-apis)); Kubernetes/Helm on Azure, AWS, GCP, Oracle or on-premises; max file 1 GB; "entitlement to process a number of files or a volume of data each day"; files "removed … according to the file retention policy" ([Halo FAQ 2.18.1](https://docs.glasswall.com/halo/2.18.1/glasswall-halo-faqs)). Whether a multi-tenant hosted Halo is sold to small customers, and its region *(unconfirmed)*.
- **Votiro**: REST API, 150+ file types incl. archives (search summary of [Azure Marketplace](https://marketplace.microsoft.com/fr-ca/product/votiro.votiro_cloud)); "deleted and then replaced by a sanitized version" (search summary, [support: File Cloud](https://support.votiro.com/hc/en-us/articles/27646697133981-File-Cloud)); acquired by Menlo Security 2025-02-19 ([SiliconANGLE](https://siliconangle.com/2025/02/19/menlo-security-acquires-votiro-strengthen-zero-trust-file-data-security/), secondary). Product continuity under Menlo *(unconfirmed)*.
- **Check Point**: API uploads files "for analysis by Anti-Virus, Threat Emulation, and Threat Extraction" and queries by hash; cloud server `te.checkpoint.com` (search summary, [Threat Prevention API, R81.20](https://sc1.checkpoint.com/documents/R81.20/WebAdminGuides/EN/CP_R81.20_ThreatPrevention_AdminGuide/Content/Topics-TPG/Threat_Prevention_API.htm)). Cloud retention/sharing *(unconfirmed)*.
- **Not CDR**: Cloudflare Browser Isolation renders pages remotely; it does not produce a derived file *(not studied further)*.

## 4. Kind 3 · Sandboxes (detonation)

A sandbox runs the file and watches it; answers take **minutes**, so it is asynchronous (submit, then poll or webhook) and fits the deeper check, never capture's path.

| Candidate | Submit | Private? | Data handling | Price | Status |
|---|---|---|---|---|---|
| **Joe Sandbox Cloud** Light / Pro / Enterprise | REST (Light+; Basic "limited") | Light+ "Private analyses & results"; **Basic: "Samples & results publicly shared"** | "does not share any malware sample or any IOCs with third parties"; customer may delete, "securely deleted in near real time" | Light credit-based (50 analyses); Pro custom (5 users, ≥100/month) | Catalogue (Light+); **Basic disqualified** |
| **VMRay** | REST | yes | "does not share your analysis reports with third parties or threat intelligence platforms"; US or Germany hosting | quote | Catalogue |
| **CrowdStrike Falcon Sandbox** (Falcon Intelligence) | REST (Falcon API: upload, submit, report) | private by default; **an option allows community access** | stored in the Falcon platform; retention *(unconfirmed)* | with Falcon subscription *(unconfirmed)* | Catalogue, community option forced off |
| **Palo Alto WildFire** (standalone API) | XML REST `/submit/file`, `/submit/url`, `/submit/link`; API key | own submissions only downloadable | benign kept 14 days, **malicious 10 years**; signatures and reports kept indefinitely; regional clouds, but some metadata shared across regional clouds | 150 submissions/day base; sales | **Bob's (§8 Q1)** |
| **Sophos Intelix** dynamic | REST | — | as §2: malicious kept indefinitely in UK Hub; egress may leave region | free allowance + PAYG | **Bob's (§8 Q1)** |
| **Hybrid Analysis** (free, by CrowdStrike) | REST | public community | samples downloadable by others | free | **Disqualified** |
| **ANY.RUN** | REST (paid only) | tasks "public or private"; service "not confidential unless otherwise stated" | public database of 2M+ submissions | Hunter 250 req/month… | Free/default **disqualified**; paid private mode: Bob's (§8 Q2) |

Evidence: Joe editions ([Joe Sandbox Cloud](https://joesecurity.org/joe-sandbox-cloud)); no sharing with third parties, deletion (search summary of [Joe blog](https://www.joesecurity.org/blog/2139974082984561161) and [data protection policy](https://www.joesandbox.com/pdpp)); data-centre country *(unconfirmed)*. VMRay statements (search summary of VMRay's own page [vmray.com/?p=3550](https://www.vmray.com/?p=3550)) *(unconfirmed on a current product page)*. Falcon: "all file submissions to Falcon Sandbox are private" and "an option to allow community access" (search summary, [Falcon Sandbox FAQ](https://crowdstrike.com/products/falcon-sandbox-faq), now 404); API collection ([Falcon Intelligence Sandbox](https://developer.crowdstrike.com/api-reference/collections/falconx-sandbox/), login-gated) — the adapter must send the confidential/non-community flag *(field name unconfirmed)*; Hybrid Analysis "independent service powered by Falcon Sandbox", users "download samples" (search summary). WildFire API and limits ([standalone API](https://docs.paloaltonetworks.com/wildfire/u-v/wildfire-whats-new/latest-wildfire-cloud-features/standalone-wildfire-api-subscription)); retention quotes ([retention](https://docs.paloaltonetworks.com/wildfire/u-v/wildfire-whats-new/latest-wildfire-cloud-features/updated-wildfire-retention-period)); metadata across regional clouds (search summary of the same docs); the privacy datasheet itself is a download not read *(sharing beyond Palo Alto unconfirmed)*. ANY.RUN (search summary of [plans](https://any.run/plans) and [privacy](https://any.run/privacy.pdf)). OPSWAT MetaDefender Sandbox (Filescan) exists with an API; its handling was not read *(unconfirmed; not catalogued)*.

## 5. Kind 4 · Web reputation (check an address before acquisition fetches it)

The check must be a **lookup**, not a visit: services that load the page themselves (URL scanners) are a second fetch by someone else, and most publish results.

| Candidate | Submit | Answer | Data handling | Price / terms | Status |
|---|---|---|---|---|---|
| **Cloudflare URL / domain intelligence** | `GET /accounts/{id}/intel/url?url=` and `/intel/domain`; API token "Intel Read" | `content_categories[]`, `risk_type[]`; domain adds risk score 0–1, popularity rank | stays within the group's own Cloudflare account relationship; no new third party | plan restriction not stated *(unconfirmed)* | **Catalogue (default suggestion)** |
| **Google Web Risk** | Lookup `uris.search` (URL sent in clear) or Update API (local hashed lists; server sees only hash prefixes on a match) | threat types matched: social engineering, malware, unwanted software | Lookup: "the server knows which URLs you look up"; results "must not be redistributed" | 10,000 free calls/month per method, then $0.50 per 1,000 (pricing page) — conflicts with a search digest (100,000 free; hashes $50 per 1,000) *(unresolved)*; commercial use is Web Risk's purpose (Safe Browsing is non-commercial only) | Catalogue (Update API preferred) |
| **Sophos Intelix** cloud lookup | REST (URL) | reputation category | lookup items kept "typically less than five minutes" | as §2 | Catalogue (lookup only; no file) |
| **OPSWAT MetaDefender Cloud** URL / domain reputation | REST v4 | per-source verdicts | not read *(unconfirmed)* | as §2 | Catalogue if Cloud already licensed |
| **Cloudflare URL Scanner** | `POST …/urlscanner/v2/scan` | full page scan, `verdicts.overall.malicious` | **visits the URL**; default **Public**, "Unlisted" readable by anyone with the ID; kept 12 months | — | Not a pre-fetch check; at most an optional second look, forced Unlisted |
| **urlscan.io** | REST | page scan | Public; Unlisted "visible to vetted security researchers and security companies"; Private on accounts | — | **Disqualified** unless Private (Bob's §8 Q3) |
| **VirusTotal URL submit** | REST | multi-vendor | submissions shared with partners (N705) | — | **Disqualified** for submission; hash/URL lookup only per §8 Q3 |

Evidence: Cloudflare intel ([URL](https://developers.cloudflare.com/api/resources/intel/subresources/urls/methods/get), [domain](https://developers.cloudflare.com/api/resources/intel/subresources/domains/methods/get) — domain fields via search summary). Google ([overview](https://docs.cloud.google.com/web-risk/docs/overview); [pricing](https://cloud.google.com/web-risk/pricing); Safe Browsing non-commercial, search summary of [usage limits](https://developers.google.com/safe-browsing/v4/usage-limits)). Sophos ([Intelix privacy](https://www.sophos.com/en-us/legal/product-privacy-information/sophoslabs-intelix)). Cloudflare URL Scanner ([docs](https://developers.cloudflare.com/radar/investigate/url-scanner/)). urlscan.io ([API docs](https://urlscan.io/docs/api/)). Microsoft Defender Threat Intelligence was retired as a product on 2026-08-01 and folded into Defender XDR/Sentinel (secondary sources, e.g. [Directions on Microsoft](https://www.directionsonmicrosoft.com/reports/defender-threat-intelligence-coming-to-sentinel-and-defender-xdr-at-no-additional-cost/)) — no standalone URL-reputation API to catalogue *(unconfirmed on Microsoft's own page)*.

## 6. Kind 5 · Security log forwarding (counts only)

What is sent is decided by Civicsmith, not the vendor: **aggregate counts per period and kind** (files scanned, flagged, released, sandbox submissions, refused fetches, sign-in failures), with no file name, no hash, no member, no IP. Destinations only differ in transport.

| Candidate | Submit | From CF | Auth | Status |
|---|---|---|---|---|
| **Splunk HEC** | HTTPS `POST /services/collector/event`, JSON `{"event":…}` | Worker `fetch` (port 8088 default) | `Authorization: Splunk <token>` | Catalogue |
| **Microsoft Sentinel** (Azure Monitor Logs Ingestion API) | HTTPS `POST {endpoint}/dataCollectionRules/{dcrId}/streams/{stream}?api-version=2023-01-01`, JSON array | Worker | Entra app, OAuth client-credentials bearer token, TLS 1.2+ | Catalogue |
| **Google SecOps (Chronicle)** | REST `ImportLogs` (replaces `unstructuredLogEntries`) | Worker | Google service account *(unconfirmed)* | Catalogue |
| **Elastic** | `_bulk` REST *(not read)* | Worker | API key *(unconfirmed)* | Catalogue (generic HTTPS) |
| **Generic syslog** (RFC 5424 over TLS) | TCP+TLS | `connect()` if public; Workers VPC/tunnel if on-prem | client cert or none | Catalogue (transport) |
| **Generic HTTPS webhook** | POST JSON | Worker | header token | Catalogue (transport) |

Evidence: Splunk HEC endpoint, header and port 8088 (search summary of [Splunk HEC cURL docs](https://help.splunk.com/en/splunk-enterprise/get-data-in/collect-http-event-data/use-curl-to-manage-http-event-collector-tokens-events-and-services); Splunk's own page returned 403). Whether a Worker `fetch` may use port 8088 *(unconfirmed)*; Splunk Cloud's HEC on 443 *(unconfirmed)*. Sentinel ([Logs Ingestion API](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview), updated 2026-09-23). Google ([ingestion methods](https://docs.cloud.google.com/chronicle/docs/reference/ingestion-methods), search summary).

**Do not use Cloudflare Logpush for this.** Logpush can send to Splunk, Datadog, Elastic, SentinelOne, QRadar, S3/R2, HTTP and others ([destinations](https://developers.cloudflare.com/logs/logpush/logpush-job/enable-destinations/)), but its datasets are per-request logs; a Workers trace or HTTP-request dataset would carry paths and client addresses, i.e. **who opened which file**, which K1892 forbids. Civicsmith's own aggregator sends counts; Logpush stays off for these datasets (a check, not a setting left to the administrator).

## 7. Proposed provider contract (file-scanner module, all kinds)

**Common descriptor** (declared by every adapter; shown to the administrator before enabling, K1929 (3)):
- `provider_id`, `vendor`, `product`, `kinds[]` ⊂ {`scan`, `cdr`, `sandbox`, `url_reputation`, `log_sink`}; `transport` ∈ {`https`, `grpc` (Container only), `icap`, `syslog_tls`, `azure_blob`}; `reach` ∈ {`public`, `tunnel`}.
- `credentials[]` (names only; values in the `credentials` module, never shown again); `test_probe` (EICAR for scan/sandbox, a known-bad test URL for reputation, a test count for sinks).
- **Data-handling statement** (all required; "not stated" is a value and is shown as such): `sends` (file bytes / file hash / URL / hostname / counts), `never_sends` (fixed: file name, member identity, IP), `recipient` (legal entity), `sub_processors`, `region` (fixed or chosen + value), `file_retention` (e.g. "deleted at end of scan", "14 days benign / 10 years malicious"), `result_retention`, `sample_sharing` ∈ {`none`, `vendor_internal_research`, `third_parties`, `public`} — `third_parties`/`public` are refused by name; `mode_required` (e.g. MetaDefender `samplesharing: 0`, Falcon non-community, Joe Light+), which the adapter sends on every call and verifies; `source_urls[]` + `read_on` date.
- `licence_note` (customer's own key; product-use terms quoted).

**Verdict note** (scan, sandbox, cdr's analysis): `tool`, `engine` (one note per engine when the vendor gives per-engine results), `engine_version` or "not reported", `signatures_date` if given, `verdict` ∈ {`clean`, `flagged`, `suspicious`, `error`, `not_scanned`}, `findings[]` (names), `vendor_ref` (scan ID; never a file name), `checked_at`, `latency_ms`. "A second, different engine" (K1929) compares `engine`, not `tool`: Scanii's Sophos and Intelix are the same engine family *(to confirm)*.
- `scan`: sync or async (`poll_after`), max size, archive handling.
- `sandbox`: always async; adds `behaviours[]`, `score` if given; timeout → `not_scanned`.
- `cdr`: returns a **derived file** + `removed[]` (macros, scripts, links, embedded objects) + output type; stored as derived, labelled, linked to the original (K1929 (4)).
- `url_reputation`: input URL or hostname; output `categories[]`, `risk[]`, `listed` (bool), `source`; `lookup_privacy` ∈ {`hash_prefix`, `clear_url`}; acquisition refuses or asks per the group's rule *(Bob/design stream)*.
- `log_sink`: input is a counts record `{period, counts{kind: n}}` only; schema fixed by Civicsmith, validated before send.

## 8. Recommended initial catalogue

| Kind | Built in | Catalogue (initial) | Hold (until vendor states handling) | Refused by name |
|---|---|---|---|---|
| Scan | ClamAV | Scanii; MetaDefender Cloud (private); MetaDefender Core; generic ICAP; Defender for Storage | Trend Vision One File Security; Sophos Intelix (Q1) | VirusTotal upload; Jotti |
| CDR | safe view | OPSWAT Deep CDR (Cloud/Core); Glasswall Halo | Votiro; Check Point Threat Extraction | — |
| Sandbox | — | Joe Sandbox Cloud Light+; VMRay; Falcon Sandbox (non-community) | WildFire, Sophos Intelix dynamic (Q1); ANY.RUN private (Q2) | Hybrid Analysis; Joe Basic; ANY.RUN public |
| Web reputation | — | Cloudflare intel; Google Web Risk (Update API); Sophos Intelix lookup | MetaDefender URL reputation | urlscan.io public/unlisted; VirusTotal URL submit |
| Log sink | — | Splunk HEC; Sentinel; Google SecOps; Elastic; syslog-TLS; HTTPS webhook | — | Cloudflare Logpush of per-request datasets |

Reasons: each catalogued entry has a primary-source statement that submitted samples are not shared (or never leave the organization's servers), a REST or ICAP path reachable from a Worker, Container or tunnel, and a licence the organization holds itself. Generic transports (ICAP, syslog, webhook) cover tools not named. Cloudflare intel is the default reputation suggestion because it adds no new recipient. Holds are one email each to the vendor.

**Questions only Bob can decide:**
- **Q1.** Does "shares submitted samples with others" (K1929 (3)) cover a vendor that keeps *malicious* samples for its own research and global protection without passing them on (Sophos Intelix: indefinitely, UK; WildFire: 10 years)? If yes, refuse both; if no, list them with that stated.
- **Q2.** Is a service acceptable when it shares by default but has a private mode the adapter forces and verifies (MetaDefender Cloud, Falcon, ANY.RUN)? Recommendation: yes, except where the vendor's own terms say "not confidential unless otherwise stated" (ANY.RUN).
- **Q3.** Does K1929 (3) apply to web addresses as well as files (an address sent in clear to Google Lookup, or submitted to urlscan.io/VirusTotal)? Most captured addresses are public records, but a member's pasted link may not be.
- **Q4.** On a bad reputation answer, does acquisition refuse the fetch, or fetch into the high-risk grade with the answer noted?
