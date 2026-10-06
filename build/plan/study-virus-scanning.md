# Study · Virus scanning that keeps the capture grade

**Status** · STUDY by a research worker for BOB, 2026-10-06, on `tranche/T34`. Answers Bob's question: "Is there a download service we can use (for free or a reasonable price) that preserves the download grade and provides any virus scanning capabilities that we can use?" Every web page cited was read on **2026-10-06**; anything not confirmed on a current page is marked *(unconfirmed)*. Nothing was configured or measured. Builds on `build/plan/study-cloudflare-security.md` §2.12 (Cloudflare's own upload scanning is Enterprise-only; no Cloudflare scan of R2 objects).

**Short answer for Bob.** No outside "download service" both fetches for us *and* keeps the grade: the grade rests on the group's own copy fetching and fingerprinting the bytes itself. What we can do instead is let the copy keep fetching exactly as now, then **check a duplicate** of the bytes and write the result *beside* the capture. A free baseline covers most groups; a paid scanner is an optional add-on for about $10–50 a month.

---

## 1. Summary (plain language)

"Keeps the grade?" means: does the capture keep the letter it earns today. "Runs in the group's account" means the file never leaves the group's own Cloudflare account.

| Option | What it does | Keeps the grade? | Privacy | Runs in the group's account? | Cost / month (2,000 files) |
|---|---|---|---|---|---|
| **A. Built-in "active content" check** (our own PDF and Office readers) | Flags the things that make a document dangerous: scripts and auto-run actions in PDFs, macros in Office files, embedded files, encryption. | **Yes** (reads only) | Nothing leaves the account | **Yes** | **$0** |
| **B. ClamAV in a Cloudflare Container** | A free, widely used open-source virus scanner, run in the group's own account, with its virus list refreshed daily. | **Yes** (scans a duplicate) | Nothing leaves the account | **Yes** | **≈ $0** inside the plan's included container time; ≈ $0.10–2 if over |
| **C. Hash lookups** (VirusTotal, MalwareBazaar) | Asks "has anyone already seen this exact file and called it malware?" using only its fingerprint. | **Yes** | Only the fingerprint leaves; public records are public anyway | Partly (a call out) | **$0** (MalwareBazaar, non-profit); VirusTotal free tier forbids product use |
| **D. Commercial scanning APIs** (Cloudmersive, Scanii, MetaDefender, Attachment Scanner) | Sends a copy of the file to a company that runs one or more commercial virus scanners and answers "clean" or "infected". | **Yes**, if it scans a copy we send | File goes to a third party; some share it unless you pay for "private" | No | ≈ $10–50 (Cloudmersive $19.99; Scanii $9.99 non-profit / $99; others more) |
| **E. Big-cloud scanners** (AWS GuardDuty, Microsoft Defender) | Scan files kept in *their* storage only. | Yes, but needs a copy in AWS/Azure | File copied to another cloud | No | AWS ≈ $0.43 + $0.09/GB; needs an AWS account. Microsoft: Azure storage only |
| **F. "Fetch and scan" services** (VirusTotal URL scan, urlscan.io, Cloudflare URL Scanner) | Visit the address themselves and report what they saw. | **No, if used as the capture** (we would no longer be the fetcher); harmless as a side-note | **Publishes what the group is looking at** by default | No | $0 free tiers; urlscan paid from $416 |
| **G. Content disarm ("safe copy")** e.g. Dangerzone-style flattening | Re-draws a document as plain pictures into a new, harmless PDF. | **Yes, only if kept as a separate "safe view"** beside the untouched original | Local | Yes (in a container) | ≈ $0–2 |

**Recommendation in one line:** A + B + MalwareBazaar lookup as the free baseline for every group; a paid private scanner (Scanii's non-profit price or Cloudmersive) as an opt-in for groups that receive members' own uploads or want a second engine. Never use a fetch-and-scan service as the fetcher.

---

## 2. How scanning coexists with the grade

What the grade rests on (repository): the copy itself fetches the address and every provenance fact "is derived by this call from what it fetched" (`build/requirements/acquisition.md` R27); the bytes are hashed at receipt and kept unaltered (Grade B, `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3); co-attestation by a trusted timestamp and an Internet Archive co-archive raises it; grades are never revised in place, upgrades are accretive (same §3).

Rules that follow, for any scanner:
1. **The substrate stays the fetcher.** The scanner reads a *duplicate* of the stored bytes (or only their SHA-256). The original is never rewritten, re-encoded, quarantined in place or replaced.
2. **The verdict is a note beside the capture**, not part of it: engine, engine and signature version, time, result (`clean` / `found: <name>` / `unknown` / `not scanned: <reason>`). It never changes the letter. A later rescan with newer signatures adds a new note; none is overwritten (the accretive rule).
3. **"Not found" is not "clean".** A hash lookup that finds nothing means "nobody reported it", which for most council PDFs is the normal answer.
4. **A sanitised copy is derived, never the capture.** A CDR "safe view" is a new file with its own digest, labelled as derived, pointing at the original.
5. **When a scanning service becomes the fetcher** (option F): its bytes are bytes we did not fetch, so a capture built on them would have no receipt of ours and could not earn the fetched letter (compare R51's doorbell rule in `build/requirements/provenance.md`: received-not-fetched earns none). As a *side record* next to our own fetch it could at most corroborate, like the co-archive, and only if it publishes a hash of the body and keeps the report: Cloudflare URL Scanner records "response body hashes" and keeps successful scans 12 months ([url-scanner](https://developers.cloudflare.com/radar/investigate/url-scanner/)). The Internet Archive co-archive already plays this role, without publishing the group's interest on a scanning site, so this adds nothing worth the disclosure.

---

## 3. Options in detail

### A. Built-in active-content check (our readers) — free, in the account
- **What it is.** Our existing readers already walk the parts of a file that carry danger; we would collect what they see into one "active content" list per capture.
- **Detects.** Not viruses by name; the *means* of attack. The PDF reader already resolves `Launch` actions, `javascript:` links, embedded files and encryption (`build/requirements/pdf-reader.md` R4–R6, R9, R23); the workbook worker already reports `macros_present` and never runs macros (`build/requirements/sheet-worker.md` R4, R7). Missing: PDF `/OpenAction`, `/AA`, `/JS`, `/XFA`, `/RichMedia`, the standard triage keywords listed by PDFiD ([pdf-tools](https://blog.didierstevens.com/programs/pdf-tools/)); VBA auto-run names and suspicious keywords as olevba reports them ([olevba](https://github.com/decalage2/oletools/wiki/olevba)).
- **Privacy / account.** Nothing leaves. **Cost** $0. **Limits** flags "can do something", not "is malicious"; a plain public PDF with a form script will be flagged. **Effort** small: one list per capture, shown to members before opening, and given to the assistant as a fact ("this file contains a macro; it was not run").

### B. ClamAV in a Cloudflare Container — ≈ free, in the account
- **What it is.** ClamAV is the free open-source virus scanner (Cisco Talos). We would run it in a container in the group's own account, fed a duplicate of each new capture from R2.
- **Detects.** Known malware by signature, plus document heuristics *(detection strength on documents unconfirmed)*.
- **Memory.** "Minimum RAM: 3 GiB … preferred 4 GiB"; signatures alone take "upwards of 1.2 GiB", and a reload can need about twice that ([ClamAV Docker](https://docs.clamav.net/manual/Installing/Docker.html)). **Fits** Cloudflare's `standard-1` (½ vCPU, 4 GiB, 8 GB disk) ([limits](https://developers.cloudflare.com/containers/platform-details/limits/)). `basic` (1 GiB) does not fit.
- **Signature updates.** `freshclam` is the supported updater; scripted `curl`/`wget` downloads are "explicitly denied" and heavy downloaders get HTTP 429; `cvdupdate` is the tool meant for cloud hosts ([freshclam FAQ](https://docs.clamav.net/faq/faq-freshclam.html)). Because many groups' containers share Cloudflare's outbound addresses, downloading the full database on every cold start risks rate limiting *(unconfirmed)*. Better: a daily scheduled job runs `cvdupdate` into the group's R2 and the container reads from there, the pattern Google's reference design uses (ClamAV on Cloud Run, private mirror refreshed every two hours with CVDUpdate) ([Google](https://docs.cloud.google.com/architecture/automate-malware-scanning-for-documents-uploaded-to-cloud-storage)).
- **Cost.** Workers Paid includes 25 GiB-hours memory, 375 vCPU-minutes and 200 GB-hours disk a month; beyond that $0.0000025/GiB-s, $0.000020/vCPU-s, $0.00000007/GB-s, billed only while running ([pricing](https://developers.cloudflare.com/containers/pricing/)). Estimate for 2,000 files scanned in one daily batch (≈ 1 min to load signatures + ≈ 1 s a file *(both unconfirmed)*, ≈ 1.5 h a month): ≈ 6 GiB-h, ≤ 45 vCPU-min, ≈ 12 GB-h, **inside the included amounts**; even fully billed ≈ $0.11. Starting a container per file instead (≈ 33 h) ≈ $2. **Caveat:** the included amounts are shared with the assistant's container (T33), so batching matters.
- **Limits.** One engine; signature-based; scan time and file-size caps to set (ClamAV defaults skip very large files *(unconfirmed)*). License GPLv2 (separate container, no linking concern).
- **Effort.** Medium: a container image, a queue of "to scan" captures, the R2 mirror job, verdict notes, a rescan rule. The installer already asks `containers.write`.

### C. Hash lookups — free, fingerprint only
- **VirusTotal.** A file report can be fetched by SHA-256 without uploading ([file-info](https://docs.virustotal.com/reference/file-info)). The free public API allows "500 requests per day and a rate of 4 requests per minute", "must not be used in commercial products or services" and "must not be used in business workflows that do not contribute new files" ([public vs premium](https://docs.virustotal.com/reference/public-vs-premium-api)). Built into a distributed product, the free tier is **not usable** by its terms; each group could hold its own key, but the "business workflows" clause still bites *(interpretation; unconfirmed with VirusTotal)*. **Uploading** a file is worse: "contents of submitted files … may also be shared with premium VirusTotal customers" ([how it works](https://docs.virustotal.com/docs/how-it-works)). **Private Scanning** avoids sharing but "is a paid offering"; price not published ([private scanning](https://docs.virustotal.com/docs/private-scanning)).
- **MalwareBazaar (abuse.ch).** Free hash lookup with an Auth-Key; "free of charge under the fair use principles"; commercial users "may require a paid subscription" ([API](https://bazaar.abuse.ch/api/)); "not-for-profit purposes" are allowed for authenticated users within limits ([terms](https://abuse.ch/terms-of-use/)). Holds **confirmed malware only** ([API](https://bazaar.abuse.ch/api/)), so it catches known-bad files and says nothing about the rest.
- **Privacy.** Only the fingerprint leaves the account. For public records this reveals little; for a member's own upload it reveals that someone holds that exact file *(whether lookups are logged: unconfirmed)*.
- **Effort.** Small: one outbound call per new capture, from each group's own key (each group is a non-profit user).

### D. Commercial scanning APIs — paid, file leaves the account
| Service | Free tier | Small-group price | Privacy | Notes |
|---|---|---|---|---|
| **Cloudmersive Virus Scan** | 600 calls/month, **3.5 MB** max ([pricing](https://cloudmersive.com/pricing-small-business)) | **$19.99** for 10,000 calls | "stateless … do not store or retain payload data" (same page) | Free file cap too small for 20 MB PDFs |
| **Scanii** | free trial | $49 (1,000 files), **$99 (5,000)**; non-profit Basic **$9.99** ([pricing](https://scanii.com/pricing)) | regional hosting; analytics kept 90–360 days (same page) | multi-engine, files to 2 GB; 2,000 files needs Plus unless the non-profit offer covers it *(unconfirmed)* |
| **OPSWAT MetaDefender Cloud** | throttled free use, "9 requests/hour … 45 scans per day" ([throttling](https://www.opswat.com/docs/mdcloud/integrations/throttling)) | not published ([licensing](https://www.opswat.com/docs/mdcloud/account-management/product-licensing)) | non-private submissions are shared "with the cybersecurity community"; private mode only on paid licenses ([private scanning](https://www.opswat.com/docs/mdcloud/operation/private-scanning-with-metadefender-cloud-apis)) | many engines; free tier too small (≈ 67 files/day needed) |
| **Attachment Scanner** | 14-day trial | **$99** for 5,000 scans ([pricing](https://www.attachmentscanner.com/pricing)) | not stated | — |
| **Verisys Antivirus API** (ionx) | — | price page not reachable *(unconfirmed)* | — | — |

**Effort** small to medium: an outbound call with a duplicate, a key the group pastes in, verdict notes. Their engines are commercial, so they add a second opinion to ClamAV.

### E. Big-cloud scanners
- **AWS GuardDuty Malware Protection for S3:** $0.09/GB scanned + $0.215 per 1,000 objects; free allowance 1,000 requests and 1 GB a month ([pricing](https://aws.amazon.com/guardduty/pricing/)); objects to 100 GB; scans S3 buckets only ([quotas](https://docs.aws.amazon.com/guardduty/latest/ug/malware-protection-s3-quotas-guardduty.html)). 2,000 files ≈ 10 GB ≈ $0.43 + $0.90 ≈ **$1.33**, but needs each group to open an AWS account and copy files there: too much for a non-engineer group.
- **Microsoft Defender for Storage:** "Malware Scanning … supports Azure Blob Storage only" ([pricing](https://azure.microsoft.com/en-us/pricing/details/defender-for-cloud/)). Not usable from Cloudflare.
- **Google:** no managed scanner found; its own guide builds ClamAV on Cloud Run ([Google](https://docs.cloud.google.com/architecture/automate-malware-scanning-for-documents-uploaded-to-cloud-storage)) — i.e., option B.

### F. Fetch-and-scan services (they fetch the address themselves)
- **VirusTotal URL scan:** "Any IoC submitted … will be … added to the VirusTotal dataset, making it accessible to the community" ([scan-url](https://docs.virustotal.com/reference/scan-url)).
- **urlscan.io:** public scans appear "on the frontpage and in the public search results"; free plan quotas 5,000 public / 1,000 unlisted / 50 private; paid from $416/month ([pricing](https://urlscan.io/pricing/), [API](https://urlscan.io/docs/api/)). It records downloads but does "**not** detect whether a downloaded file is malicious" ([FAQ](https://urlscan.io/docs/faq/)).
- **Cloudflare URL Scanner:** "By default, the report will have a `Public` visibility level" ([url-scanner](https://developers.cloudflare.com/radar/investigate/url-scanner/)); price and limits not stated.
- **Verdict.** Used as the fetcher they **lower** the grade (no receipt of ours); used beside our fetch they add little the co-archive does not, and they **publicise** what the group is researching. Not recommended.

### G. Content disarm (a "safe view")
- Dangerzone renders "your document into pixels in a secure sandbox and reconstruct[s] it locally as a PDF"; AGPLv3, by the Freedom of the Press Foundation ([dangerzone](https://dangerzone.rocks/)). The same idea fits our `pdf-pixels` path.
- Grade: unaffected **only** as a derived file beside the original (rule 4). Optional; useful for members opening flagged files on their own machines.

---

## 4. Recommendation

**Free baseline, every group ($0 extra):**
1. **A — active-content list** from our readers, on every capture.
2. **B — ClamAV container**, batch-scanning new captures daily (and on demand before a member opens a flagged file), signatures mirrored into the group's R2 by a daily `cvdupdate` job.
3. **C — MalwareBazaar hash lookup** under the group's own free key.
Members see one line per file: "Checked by ClamAV (signatures of <date>): nothing found · contains a macro (not run)". The assistant is told the same, and never opens embedded files or runs macros.

**Optional paid add-on (group opts in, pastes a key):** a private commercial scanner for a second engine, mainly for **members' own uploads and doorbell submissions**, where privacy matters more: Scanii (non-profit $9.99/month if eligible, else $99) or Cloudmersive ($19.99/month). Never VirusTotal or MetaDefender upload without their paid private mode.

**What a group pays:** $0 baseline (inside Workers Paid's included container time, if the assistant's container leaves room; worst case ≈ $2/month); $10–100/month with the add-on.

**What the product must build:**
- a scan-verdict note type beside the capture (engine, versions, time, result; append-only; "unknown" ≠ "clean"), never touching bytes, digest or grade;
- the active-content list in the PDF and Office readers (add `/OpenAction`, `/AA`, `/JS`, `/XFA`, `/RichMedia`, VBA auto-run names);
- the ClamAV container, its scan queue, and the R2 signature mirror job;
- the MalwareBazaar lookup and an optional paid-scanner adapter (key in Workers secrets);
- a members' warning before opening a flagged or "found" file, and the assistant's matching rule.

**Open for BOB:** whether a "found" verdict holds the file from members (release under Intake §4a) or only warns; whether ZIP members (Intake §3, K1852) are scanned as their own captures (recommended: yes, each is a capture).
