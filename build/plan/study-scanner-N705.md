# Study · N705 · The paid outside scanner for the deeper check

**Status** · STUDY by a research worker for BOB #127, 2026-10-07, on `tranche/T34`. Every page cited was read on **2026-10-07**; anything not confirmed on a vendor's current page is marked *(unconfirmed)*. Nothing was bought, configured or measured. Builds on `build/plan/study-virus-scanning.md` §3 D (2026-10-06) and answers N705 (`build/plan/next.md`) under K1888, K1890, K1892: the third check of the deeper check, a paid outside multi-engine scanner in private mode, before a member may open a high-risk original.

**Short answer for Bob.** No vendor meets every requirement. The only true "many engines" service (OPSWAT MetaDefender Cloud, 10–20+ engines) hides its price behind a sales call, sells in bulk (1,000+ scans a day) and its terms restrict use inside a product. The services with clear, small prices run one or two engines. **Recommended: Scanii** — its own engine plus Sophos, files deleted when the scan ends, terms that expressly allow use inside your own product, and the only non-profit price found ($9.99 a month). Runner-up: MetaDefender Cloud, if Bob insists on many engines and a group will ask OPSWAT for a quote.

---

## 1. Summary (plain language)

"Private?" means the file is not shared and not kept after the scan. "Engines" means separate virus scanners looking at the same file. Prices are per group per month.

| Vendor | Private? | Engines | ~200 files | ~2,000 files | Non-profit price | Terms OK for our product? | Verdict |
|---|---|---|---|---|---|---|---|
| **Scanii** (Uva Software, US) | **Yes**: file deleted when the scan ends; region chosen by the group | **2** (own + Sophos) | **$9.99** non-profit / $49 | **$99** (non-profit price covers 1,000 only) | **Yes, $9.99** (Basic, on request) | **Yes**: "within Your own products and services" allowed | **Recommended** |
| **OPSWAT MetaDefender Cloud** | **Yes** with paid private scanning / private processing | **10–20+** by tier; per-engine results | quote only *(unconfirmed)* | quote only *(unconfirmed)* | none found | **Doubtful**: "solely for Your internal use"; no use to "build or enhance a commercially available product" without a partner agreement | Runner-up: only true multi-engine; price and terms unclear |
| **Attachment Scanner** (Clear Edge Software, UK) | Yes: file "discarded immediately after scanning" | "Standard" engine at $99; "commercial engines" (Bitdefender + ClamAV per terms) at $249 | $99 (1 engine) / $249 | $99 / $249 | no ("contact us") | Unclear: licence "non-transferable"; bars embedding its Web App | Fallback; dearer for two engines, one of which (ClamAV) we already run |
| **Cloudmersive Virus Scan** | Yes: "stateless … do not store or retain payload" | **1** (not stated as multi-engine) | $19.99 | $19.99 | none found | Mostly: bars an API Client "substantially the same as the APIs" offered to third parties | Fails "several engines" |
| **Verisys (Ionx Solutions, UK)** | Partly: kept "only as long as necessary" (no period) | not disclosed | $39 | $79 | none found | Unclear: "business purposes and research", no transfer | Fails on unknowns |
| **VirusTotal Private Scanning** | Yes (deleted after ~24 h) | **0 AV engines**: private scans exclude AV verdicts | not published | not published | none found | — | **Fails**: no antivirus engines in private mode |
| **Jotti** | **No**: all files shared with AV companies | 13 | free | free | — | — | **Fails** privacy |
| **Pangea File Scan** | not stated | 1 per call (CrowdStrike *or* ReversingLabs) | not published | not published | — | — | Not multi-engine per scan |

**Recommendation in one line:** Scanii, at $9.99 a month on its non-profit price (up to 1,000 files) or $49 without it; $99 if a group really checks ~2,000 files a month.

---

## 2. Vendors in detail

### 2.1 Scanii (Uva Software, LLC)
- **R1 private.** "file contents are deleted on completion of analysis. Analysis result records are retained in the processing region for up to four hundred (400) days"; processed only by AWS as sub-processor; "we do not use Customer Data to train detection models or for any purpose other than providing the Services"; regions US1 Virginia, EU1 Dublin, EU2 London, AP1 Sydney, AP2 Singapore, CA1 Montreal ([privacy](https://docs.scanii.com/article/142-privacy-policy)). Terms §5.4: "Files and content You submit to the Services are deleted upon completion of analysis" ([terms](https://docs.scanii.com/article/143-terms-of-service)). "content never leaves your chosen region" ([pricing](https://scanii.com/pricing)). The kept result record holds hash, size, type and findings ([API](https://docs.scanii.com/article/144-version-2-0-resources)); the adapter must not send file names or member identities (K1892: no who-opened-what log).
- **R2 engines.** "our proprietary engine is paired with a top-tier commercial engine as a fallback" — Sophos; a "meta-engine approach that combines multiple detection layers" ([engines](https://docs.scanii.com/article/149-how-do-the-different-detection-engines-work)). That is **two** engines; whether Sophos runs on every file or only as a fallback *(unconfirmed)*. Results are one `findings` list, **not per engine** ([API](https://docs.scanii.com/article/144-version-2-0-resources)). Image and language engines can be switched off per key (same page) so credits go only to malware scanning.
- **R3 API.** `POST https://api.scanii.com/v2.1/files` (sync), `/files/async`, `/files/fetch` (by URL), `GET /files/{id}`; HTTP basic auth with key:secret over TLS ([API](https://docs.scanii.com/article/144-version-2-0-resources), [intro](https://docs.scanii.com/article/145-version-2-0-introduction)). A Worker can call it with `fetch` and a multipart body *(not tested)*.
- **R4 size/archives.** "Up to 2 GB file size" ([pricing](https://scanii.com/pricing)); malware engine "under 2 GB"; "Automatically decompresses and analyzes archive formats (e.g., ZIP, GZIP, RAR), unless password-protected" ([engines](https://docs.scanii.com/article/149-how-do-the-different-detection-engines-work)). Meets 8 MiB and 256 MiB.
- **R5 price.** Basic $49 (1,000 files), Plus $99 (5,000), Premium $199 (10,000); "Basic plan at $9.99/mo" for qualifying nonprofits via support; free trial credits, "no credit card needed" ([pricing](https://scanii.com/pricing)). Overage rules not stated *(unconfirmed)*; whether the non-profit price extends to Plus *(unconfirmed)*.
- **R6 terms.** §3.1(v) bars offering the Services "on a standalone or service-bureau basis" but allows "use the Services within Your own products and services made available to Your Clients"; §3.1(i) only "Your Users" may use them ([terms](https://docs.scanii.com/article/143-terms-of-service)). Each group is its own customer with its own key, using it for its own members: fits.
- **R7 standing.** "Scanning the web's content since 2010" ([home](https://scanii.com/)). Sophos received AV-Comparatives' "Approved Business Security Product Award" in both 2025 Enterprise test runs ([AV-Comparatives](https://av-comparatives.org/av-comparatives-awards-2025-for-sophos/)). Scanii's own engine has no independent test found *(unconfirmed)*. Small company *(size unconfirmed)*.

### 2.2 OPSWAT MetaDefender Cloud
- **R1 private.** "All files scanned in private mode are not stored or shared, although scan results will remain available in the MetaDefender Cloud database"; "the file is permanently removed from our storage"; set `samplesharing: 0`; "only available to users who have a paid license" ([private scanning](https://www.opswat.com/docs/mdcloud/operation/private-scanning-with-metadefender-cloud-apis)). Private Processing also limits results to the submitter ([account management](https://www.opswat.com/docs/mdcloud/account-management)). Data location not stated *(unconfirmed)*.
- **R2 engines.** "20+ (depending on licensing option)" ([why MetaDefender](https://www.opswat.com/docs/mdcloud/knowledge-base/why-metadefender-cloud-and-not-other-vendors-)); 10 / 15 / 23 engines for Standard / Professional / Enterprise per a third-party review dated 2026-08-30 ([top5soft](https://top5soft.com/privacy/metadefender-cloud-review/)) *(not on OPSWAT's own page; unconfirmed)*. Per-engine results are standard in OPSWAT's scan reports ([Core KB](https://www.opswat.com/docs/mdcore/knowledge-base/how-to-access-and-analyze-detailed-scan-results-for-an-infected-)) *(Cloud field names unconfirmed)*.
- **R3 API.** `https://api.metadefender.com/v4`, API key; upload, then poll with `data_id` ([API v4](https://www.opswat.com/docs/mdcloud/metadefender-cloud-api-v4)). Async; fits a Worker plus a later poll.
- **R4 size.** Tier limits exist; over 1 GB needs a signed URL ([licensing](https://www.opswat.com/docs/mdcloud/account-management/product-licensing)); 140 MB / 256 MB / 1 GB+ by tier *(search summaries only; unconfirmed)*. Unregistered tier 750 MB ([pulsesignal](https://getpulsesignal.com/pricing/opswat)). Archive handling *(unconfirmed for Cloud)*.
- **R5 price.** Paid tiers "Contact sales"; "Paid plans are contract-based; prices are not listed" ([pulsesignal](https://getpulsesignal.com/pricing/opswat), read of [metadefender.com/licensing](https://metadefender.com/licensing), which renders only in a browser); Standard "Starting at 1,000+ scans / day" ([GetApp](https://www.getapp.com/all-software/a/metadefender-cloud/)) — 15× more than a group needs. Free community use is only for "Prototyping" or demos when production uses a commercial licence, and community users "are not allowed to use the data provided by our platform in any way" ([public APIs](https://www.opswat.com/docs/mdcloud/integrations/public-apis)). No non-profit price found.
- **R6 terms.** Licence "solely for Your internal use"; no "make generally available to third parties as a billable service, resell, redistribute, package, repackage … sub-license"; users agree "not to use Services results provided by the API to build or enhance a commercially available product except in accordance with a joint development or channel partner agreement" ([terms](https://www.opswat.com/legal/terms-of-service)). A group using its own licence for its own members is arguably internal use, but CivicOS embeds the results; needs OPSWAT's written yes *(unconfirmed)*.
- **R7 standing.** Founded 2002, ~400 staff (2023) ([Wikipedia](https://en.wikipedia.org/wiki/OPSWAT)); reputation data since 2012 ([why MetaDefender](https://www.opswat.com/docs/mdcloud/knowledge-base/why-metadefender-cloud-and-not-other-vendors-)). Its engines are mainstream AV products tested individually by AV-Comparatives/AV-TEST *(per engine; not checked one by one)*.

### 2.3 Attachment Scanner (Clear Edge Software Ltd, company 12438621)
- **R1.** "File contents are discarded immediately after scanning. We keep metadata (filename, hash, verdict)"; US/EU/APAC clusters, "your file data never crosses borders" ([home](https://www.attachmentscanner.com/)). Do not send file names.
- **R2.** Startup $99: "Standard scanning engine"; Professional $249+: "Commercial scanning engines" ([pricing](https://www.attachmentscanner.com/pricing)); terms: "the bitdefender eula and the clamav GNU license" ([terms](https://www.attachmentscanner.com/terms)), i.e. Bitdefender + ClamAV, ClamAV duplicating our in-account check. One result `matches` list, not per engine; adds a `warning` status for macros and encrypted archives ([API](https://www.attachmentscanner.com/docs/api.html)).
- **R3.** Bearer token; upload or URL; `async: true` with callback or polling; regional endpoints ([API](https://www.attachmentscanner.com/docs/api.html)).
- **R4.** "Maximum file size is 256 MB for both uploads and URL fetches" (same page). Archives: encrypted ones flagged as warning; other handling *(unconfirmed)*.
- **R5.** $99 (5,000 scans, standard engine), $249 (10,000, commercial engines); 14-day trial; no non-profit price ([pricing](https://www.attachmentscanner.com/pricing)).
- **R6.** "limited, non-exclusive, revocable, worldwide, non-transferable licence" for "personal … and business purposes"; may not "embed or otherwise distribute Our Web App" ([terms](https://www.attachmentscanner.com/terms)) — aimed at the web app, not the API, but not explicit *(unconfirmed)*.
- **R7.** Team "scanning email since 2010" (CloudMailin) ([home](https://www.attachmentscanner.com/)); Bitdefender: multiple AV-Comparatives 2025 awards including Top-Rated ([AV-Comparatives](https://av-comparatives.org/av-comparatives-awards-2025-for-bitdefender/)).

### 2.4 Cloudmersive Virus Scan
- **R1.** "stateless, they do not store or retain payload data or copies after the transaction completes" ([pricing](https://cloudmersive.com/pricing-small-business)); "processes payloads in memory" ([virus API](https://cloudmersive.com/virus-api)). Terms reserve the right to "monitor use of the APIs" ([terms](https://portal.cloudmersive.com/terms-of-service)).
- **R2.** "Over 17 million virus and malware signatures"; no multiple engines described ([virus API](https://cloudmersive.com/virus-api)). **Fails.**
- **R3/R4.** REST with key *(details not re-read)*; archives "Zip … .Rar, .DMG, .Tar" ([virus API](https://cloudmersive.com/virus-api)); free tier 3.5 MB, Basic 1 GB ([pricing](https://cloudmersive.com/pricing-small-business)).
- **R5.** Free 600 calls (3.5 MB cap: fails 8 MiB); Basic **$19.99** for 10,000 calls; no non-profit price (same page).
- **R6.** No "Sublicense an API for use by a third party … create an API Client that functions substantially the same as the APIs and offer it for use by third parties" ([terms](https://portal.cloudmersive.com/terms-of-service)); our use is not that.
- **R7.** Company history not stated on pages read *(unconfirmed)*; listed as a Microsoft Power Platform connector ([Microsoft](https://learn.microsoft.com/en-us/connectors/cloudmersive/)).

### 2.5 Verisys Antivirus API (Ionx Solutions LLP, UK, since 2002)
- Starter $39 (1,000 scans), Pro $79 (5,000), Premium $199 (15,000); sync and async with webhooks; file or file URL; archives ZIP, 7-Zip, GZIP, tarball; four regions; free trial ([product](https://www.ionxsolutions.com/products/antivirus-api)). Engines and file size **not disclosed**. Content kept "only as long as necessary", held only in the chosen jurisdiction; licence for "business purposes and research", non-transferable ([terms](https://www.ionxsolutions.com/legal/terms-of-service/verisys-av)). Fails R2 on what is published.

### 2.6 Others checked
- **VirusTotal Private Scanning:** files "permanently deleted … (usually 24 hours)", but results "will NOT contain our multi-antivirus or url-scan partners verdicts"; paid, price not published ([private scanning](https://docs.virustotal.com/docs/private-scanning)). Fails R2. Ordinary VirusTotal upload shares files (2026-10-06 study).
- **Jotti:** "All files are shared with anti-virus companies"; 13 engines; 250 MB ([Jotti](https://virusscan.jotti.org/en-US/scan-file)). Fails R1.
- **Metascan** is OPSWAT's multiscanning engine inside MetaDefender, not a separate service ([AWS listing](https://aws.amazon.com/marketplace/pp/prodview-dkkiquinlsbg4)).
- **Pangea File Scan:** one provider per call, CrowdStrike or ReversingLabs; retention, size and price not on the page ([providers](https://pangea.cloud/docs/file-scan/provider-information)). Not multi-engine per scan.

---

## 3. Recommendation

**Choose Scanii.** It is the only candidate that meets privacy (file deleted at the end of the scan, region chosen), size (2 GB, archives opened), a Worker-friendly API, terms that expressly permit use inside a product each customer runs for its own users, and a published non-profit price. Its weakness is R2: two engines (its own plus Sophos), with one combined result. In the deeper check it is still the **third independent opinion**: the structure check, ClamAV in the group's account, and Scanii's own engine plus Sophos — none of which is ClamAV.

**Cost per group:** **$9.99/month** on the non-profit Basic price (up to 1,000 files, ample for ~200 deeper checks); $49 without the discount; **$99/month** (Plus) for ~2,000 files.

**Runner-up: OPSWAT MetaDefender Cloud** (Standard, private processing). The only real multi-engine service (10–20+ engines, per-engine results), so the strongest answer to "a second scanner" for release. Not first because its price is quote-only and sized for 1,000+ scans a day, and its terms ("internal use", no use of results in a "commercially available product" without a partner agreement) need OPSWAT's written confirmation. BOB could ask OPSWAT once, centrally, for a non-profit small-volume price and a terms letter; if both come back acceptable it can replace Scanii in the adapter.

**Rejected:** Cloudmersive (one engine), Attachment Scanner ($249 for two engines, one being ClamAV), Verisys (engines undisclosed), VirusTotal Private Scanning (no AV engines), Jotti (shares files), Pangea (one engine per scan).

**What a group does to sign up (plain steps):**
1. Go to scanii.com and create an account (no card needed; trial credits included).
2. Choose the region nearest the group (e.g. US1 Virginia); files stay there.
3. Email Scanii support asking for the non-profit Basic price ($9.99/month), attaching proof of non-profit status (e.g. the IRS determination letter).
4. In the Scanii dashboard, create an API key; leave only the malware engine switched on for that key.
5. In the group's CivicOS settings, paste the key and secret where asked (kept as a Cloudflare secret, never shown again).
6. Run the test scan (a step the adapter will provide) (the harmless EICAR test file) and confirm it reports "found".
