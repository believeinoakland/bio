# The platform's limits for reading (READING-ARCHITECTURE, deliverable 2)

**Status** · Draft by READING-ARCHITECTURE #1, 2026-10-23. Cloudflare's documentation read live 2026-10-23 (raw page Markdown, each page's own 'last updated' date given); local measurements with workerd 2026-07-22 and Miniflare 4.20260722.0. Decides nothing.

This file answers charter deliverable 2: every Cloudflare limit and capability that bears on reading a file between its arrival and a member's search, citation and interpretation, at the file standard's sizes (documents and scans 100 MB or 5,000 pages; spreadsheets 50 MB or about 1M rows; images 50 MB; archives 500 MB). It states facts, their source, what a local run shows of each, and what only the live platform can show. It makes no design choice; section 6 lists consequences that follow from the facts, for OPTIONS.md to use.

How to read a row: every table in section 2 has the columns `id | fact | verbatim quote | page key | local measurement | local models it?`. The quote is Cloudflare's text. The page key names the page (section 0). The local measurement is the lane's own spike (section 0, S1 to S8) or "not run". The last column says whether a local run reproduces the limit: yes, partly or no.

## 0 How it was read

**Fetching.** Each page was fetched on 2026-10-23 as Cloudflare's own raw Markdown (the page URL with `index.md` appended, by `curl`) and saved whole. Where a page carries its own “Last updated” stamp, that stamp is in the table below. Two older addresses now redirect (HTTP 301): `workers/configuration/smart-placement/` to `/workers/configuration/placement/`, and `r2/objects/multipart-objects/` to `/r2/objects/upload-objects/`; the quotes come from the targets. There is no summary page: `https://developers.cloudflare.com/platform/limits/` returns HTTP 404. “Browser Rendering” is now named “Browser Run” (path `/browser-run/`); this file says Browser Run and means the product the charter calls Browser Rendering.

**Quoting.** A quote is the page's text between straight double quotation marks (the lane's own words and text from the repository use curly quotation marks or backticks, never straight ones). Four mechanical changes only: link targets are dropped and the link text kept; Markdown emphasis marks (asterisks and backticks), backslash escapes and HTML tags (`<sup>`, `<code>`, `<br>`) are dropped; footnote markers (`<sup>` elements, which in the raw tables follow a cell's text) are dropped; and where a table row is quoted its cells are joined with ` / ` (the raw table has a vertical bar between cells). No word is changed, added or removed inside a quotation; where a raw cell carries a link or a footnote that would break the quotation, the cells are quoted singly. Every quotation in this file was matched by a script against the raw file of the page key beside it, under the same three changes; the result is given at the end of this section. A fact that is the lane's own arithmetic or inference is marked "arithmetic" or "inference" and carries no quotation marks.

**Not used.** The first drafts of the Workers, Durable Objects and R2 notes (WebFetch summaries) were discarded. The platform figures in the local spike report were written from memory and are cited nowhere; the report is cited only for what it measured.

**Pages read.** Raw copies are in the lane's scratch, `/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/platform/raw/` (each file is named by the page's last path segment: `workers-limits.md`, `do-alarms.md`, `r2-multipart.md`, `q-limits.md`, `w-limits.md`, `c-limits.md` and so on); they are not committed.

| key | URL (under https://developers.cloudflare.com) | page's last-updated |
|---|---|---|
| W-LIM | /workers/platform/limits/ | Oct 12, 2026 |
| W-PRICE | /workers/platform/pricing/ | Oct 2, 2026 |
| W-CTX | /workers/runtime-apis/context/ | Oct 12, 2026 |
| W-STREAMS | /workers/runtime-apis/streams/ | Jun 15, 2026 |
| W-BP | /workers/best-practices/workers-best-practices/ | Oct 12, 2026 |
| W-CRON | /workers/configuration/cron-triggers/ | Oct 17, 2026 |
| W-SCHED | /workers/runtime-apis/handlers/scheduled/ | Oct 17, 2026 |
| W-SB | /workers/runtime-apis/bindings/service-bindings/ | Oct 13, 2026 |
| W-SB-RPC | /workers/runtime-apis/bindings/service-bindings/rpc/ | Aug 3, 2026 |
| W-RPC | /workers/runtime-apis/rpc/ | Oct 12, 2026 |
| W-RPC-LIFE | /workers/runtime-apis/rpc/lifecycle/ | Oct 8, 2026 |
| W-SP | /workers/configuration/placement/ | Oct 12, 2026 |
| DO-LIM | /durable-objects/platform/limits/ | Jun 1, 2026 |
| DO-PRICE | /durable-objects/platform/pricing/ | Oct 18, 2026 |
| DO-ALARM | /durable-objects/api/alarms/ | Apr 21, 2026 |
| DO-BASE | /durable-objects/api/base/ | Jun 15, 2026 |
| DO-STATE | /durable-objects/api/state/ | Sep 30, 2026 |
| DO-SQL | /durable-objects/api/sqlite-storage-api/ | Sep 21, 2026 |
| DO-LIFE | /durable-objects/concepts/durable-object-lifecycle/ | Oct 15, 2026 |
| DO-MEM | /durable-objects/reference/in-memory-state/ | Jun 29, 2026 |
| DO-RULES | /durable-objects/best-practices/rules-of-durable-objects/ | Oct 18, 2026 |
| DO-WHAT | /durable-objects/concepts/what-are-durable-objects/ | Jul 15, 2026 |
| DO-ACCESS | /durable-objects/best-practices/access-durable-objects-storage/ | Jul 3, 2026 |
| R2-LIM | /r2/platform/limits/ | Jun 8, 2026 |
| R2-PRICE | /r2/pricing/ | Oct 1, 2026 |
| R2-API | /r2/api/workers/workers-api-reference/ | Jul 31, 2026 |
| R2-UP | /r2/objects/upload-objects/ | Jul 29, 2026 |
| R2-PRESIGN | /r2/api/s3/presigned-urls/ | Aug 22, 2026 |
| R2-CORS | /r2/buckets/cors/ | Sep 23, 2026 |
| R2-CONS | /r2/reference/consistency/ | Oct 14, 2026 |
| Q-LIM | /queues/platform/limits/ | Apr 21, 2026 |
| Q-BATCH | /queues/configuration/batching-retries/ | Apr 21, 2026 |
| Q-CONC | /queues/configuration/consumer-concurrency/ | Apr 21, 2026 |
| Q-DLQ | /queues/configuration/dead-letter-queues/ | Oct 12, 2026 |
| Q-DELIV | /queues/reference/delivery-guarantees/ | Apr 21, 2026 |
| Q-PULL | /queues/configuration/pull-consumers/ | Jul 1, 2026 |
| Q-PRICE | /queues/platform/pricing/ | Apr 21, 2026 |
| WF-LIM | /workflows/reference/limits/ | Sep 21, 2026 |
| WF-PRICE | /workflows/reference/pricing/ | Sep 21, 2026 |
| WF-RULES | /workflows/build/rules-of-workflows/ | Oct 15, 2026 |
| WF-SLEEP | /workflows/build/sleeping-and-retrying/ | Sep 24, 2026 |
| WF-TRIG | /workflows/build/trigger-workflows/ | Oct 15, 2026 |
| WF-API | /workflows/build/workers-api/ | Oct 12, 2026 |
| C-OV | /containers/ | Oct 12, 2026 |
| C-START | /containers/get-started/ | Sep 30, 2026 |
| C-LIM | /containers/platform/limits/ | Oct 21, 2026 |
| C-ARCH | /containers/concepts/architecture/ | Sep 30, 2026 |
| C-FAQ | /containers/faq/ | Oct 5, 2026 |
| C-ROLL | /containers/configuration/rollouts/ | Sep 30, 2026 |
| C-PRICE | /containers/platform/pricing/ | Oct 5, 2026 |
| C-PLACE | /containers/concepts/placement/ | Oct 1, 2026 |
| C-DOAPI | /containers/api/durable-object-container/ | Sep 30, 2026 |
| C-CLASS | /containers/api/container-class/ | Sep 30, 2026 |
| C-SCHED | /containers/configuration/scheduling-policy/ | Oct 12, 2026 |
| C-SNAP | /containers/ (snapshots page) | Sep 30, 2026 |
| C-CONN | /containers/configuration/workers-connections/ | Sep 30, 2026 |
| BR-LIM | /browser-run/limits/ | Oct 14, 2026 |
| BR-PRICE | /browser-run/pricing/ | Apr 21, 2026 |
| BR-OV | /browser-run/ | Aug 11, 2026 |
| AI-MD | /workers-ai/features/markdown-conversion/ | Apr 21, 2026 |
| AI-FMT | /workers-ai/features/markdown-conversion/supported-formats/ | Apr 21, 2026 |
| AI-HOW | /workers-ai/features/markdown-conversion/how-it-works/ | Oct 15, 2026 |
| AI-BIND | /workers-ai/features/markdown-conversion/usage/binding/ | Jul 13, 2026 |
| AI-DATA | /workers-ai/platform/data-usage/ | Oct 16, 2026 |
| AI-LIM | /workers-ai/platform/limits/ | Sep 17, 2026 |
| AI-PRICE | /workers-ai/platform/pricing/ | Oct 20, 2026 |
| D1-LIM | /d1/platform/limits/ | Apr 21, 2026 |
| D1-PRICE | /d1/platform/pricing/ | Apr 21, 2026 |
| VZ-LIM | /vectorize/platform/limits/ | Aug 5, 2026 |
| VZ-PRICE | /vectorize/platform/pricing/ | Apr 21, 2026 |
| IMG-BIND | /images/optimization/binding/ | Sep 2, 2026 |
| IMG-LIM | /images/get-started/limits/ | Jun 16, 2026 |
| IMG-PRICE | /images/pricing/ | Oct 19, 2026 |

**Staleness.** Twelve pages were last updated six months before the read date (Apr 21, 2026, DO-ALARM Apr 21 too): Q-LIM, Q-BATCH, Q-CONC, Q-DELIV, Q-PRICE, DO-ALARM, D1-LIM, D1-PRICE, BR-PRICE, VZ-PRICE, AI-MD and AI-FMT. Where an older page disagrees with a newer one (section 4), the disagreement is shown with both dates.

**Local spike set.** Eight spikes, run 2026-10-23 on a shared 4-core, 16 GB Linux machine (Node v26.10.0): raw `workerd 2026-07-22` (a capnp configuration modelled on the repository's `test/m/pdf-reader/workerd-ceiling.probe.mjs`) and Miniflare 4.20260722.0 (the same workerd binary), `compatibilityDate` 2026-07-01, `nodejs_compat`. Nothing in `/home/user/bio` was changed, nothing was deployed, no Cloudflare account was reached. Scripts, raw output and the report are committed beside this file: `spikes/src/`, `spikes/results/`, `spikes/RESULTS.md` (generated data not kept). The spikes:

| id | topic | what was run |
|---|---|---|
| S1 | memory | allocations retained in a module-level array, raw workerd, with and without `--max-old-space-size` 64, 128, 256 |
| S2 | CPU | 7.6e9-iteration busy loop in a `fetch` handler and in a DO `alarm()`; Miniflare `cpuMs` and `limits.cpu_ms` options |
| S3 | DO alarms | throwing handler, past alarm, re-arm in handler, persist/dispose/restart |
| S4 | DO SQLite | value, row and statement sizes; LIKE pattern; 100,000-row bulk insert; `databaseSize` |
| S5 | R2 | multipart (10 MiB parts, 1 MiB parts, unequal parts), 100 MiB `put` of a stream, 8 MiB and 1 MiB ranged reads, whole-object `arrayBuffer()`, process memory |
| S6 | request body | 150 MiB POST with and without Content-Length: read, `R2.put`, `FixedLengthStream`, `arrayBuffer()` |
| S7 | RPC | `Uint8Array` and `ReadableStream` as argument and return, 8 to 200 MiB |
| S8 | subrequests | 1,100 and 10,500 sequential fetches, R2 `head`, KV `get`; 30 and 200 concurrent fetches |

Limits of the local method that apply to all rows: the machine is shared (another process competed for CPU during S2); "RSS" below is the resident memory of the whole workerd process group, which includes Miniflare's own R2 and storage workers and cannot isolate one isolate; timings are local disk and loopback, never network.

**Civicsmith's own memory measurements** (the plane's idle, about 86.7 MB in a Node harness and about 50 MB as an ASCII bundle in raw workerd) are cited in section 3 and labelled there as Civicsmith's, not Cloudflare's.

**Quote check result.** See the last line of this file (section 7).

## 1 The short answer

The facts that most constrain reading, in the order a reading meets them. The row ids point to the quotations in section 2.

1. **Memory is 128 MB per isolate, shared** by concurrent requests and by every Durable Object instance placed in the isolate (W1, W2, D1). The page names the JavaScript heap and WebAssembly and does not name ArrayBuffer backing stores (G9). Next to the plane's own idle (about 50 to 87 MB, Civicsmith's measure, section 3) a 100 MB document, a 50 MB sheet or a 500 MB archive cannot be held whole.
2. **Overrun is not catchable.** The runtime lets in-flight requests finish and starts a new isolate; the client sees error 1102 (W3, W4). Whether an alarm in flight or a sibling object dies is not stated (P-M2).
3. **CPU is 30 seconds by default for every invocation kind and 5 minutes at most on Workers Paid**, set by `limits.cpu_ms`; I/O waits are free (W10 to W12, D7 to D9). The plane sets no `cpu_ms` (section 3). No local run enforces CPU (S2).
4. **Wall time:** 15 minutes for an alarm, a cron invocation and a queue consumer invocation; none for an HTTP request while the client stays connected; none for a Workflow step; `waitUntil` adds 30 seconds (W16, W17, W20, WF1).
5. **An alarm is retried at most 6 times, then dropped**; one alarm per object; at-least-once; backoff from 2 seconds; after a machine loss the handler runs again from its beginning (D10 to D15). Locally: 7 calls, gaps 2.1 to 68.5 seconds (S3).
6. **A Durable Object can be shut down at any time** (deploy, inactivity, runtime decision), with no hook; storage-touching work is stopped at once; what a deploy does to a running alarm is not stated (D23 to D25, G2).
7. **Durable Object SQLite: 10 GB per object, 2 MB per string, BLOB or row, 100 KB per statement** (D32, D33); the 2 MB edge is enforced locally to the byte (S4). `list()` without options loads everything into memory (D6).
8. **A browser upload through a Worker is capped by the zone's Cloudflare plan, not the Workers plan:** Free 100 MB, Pro 100 MB, Business 200 MB, Enterprise up to 5 GB (W28 to W30). A 500 MB archive needs a direct upload to R2, which "does not apply to subrequests" (R2, R19). Nothing local enforces the cap (S6).
9. **R2:** ranged reads (offset and length, or suffix) as streams; multipart parts of 5 MiB to 5 GiB, equal except the last, at most 10,000, abandoned after 7 days; one write per second per key (R3, R5 to R15). The part rules reproduce locally (S5).
10. **Six connections may wait for response headers at once per invocation**, R2 calls and Queue sends included; a seventh waits (W25, W26). Not enforced locally (S8).
11. **RPC carries 32 MiB serialized; a `ReadableStream` is exempt** and flow-controlled (B6 to B8). Enforced locally, 31 MiB passes and 32 MiB fails (S7).
12. **At most 32 Worker invocations per request**, each service-binding call counting; the scope of "a single request" is undefined (B2, G13). Binding calls also count as subrequests (B1).
13. **Queues:** 128 KB messages, 100 per batch, 15 minutes wall, consumer CPU 5 or 15 minutes (G1), at-least-once, 250 concurrent invocations, $0.40 per million operations (Q1 to Q14).
14. **Workflows:** step result 1 MiB (larger only as a byte stream), 10,000 steps by default, 1 GB state per instance, a restarted engine redoes the step "from the beginning of that step", unlimited step wall time, 30 seconds default CPU (WF1 to WF12).
15. **Containers:** up to 12 GiB, 20 GB ephemeral disk, 4 vCPU; reached only through a Durable Object; no fixed maximum runtime and no promise of any; SIGTERM then SIGKILL after 15 minutes; Workers Paid only (C1 to C22).
16. **Browser Run renders pages; `toMarkdown` takes a whole `Blob` in memory and documents no size limit and no OCR** (BR1 to BR3, AI1 to AI8).
17. **Cost at Workers Paid is cents** per 5,000-page or 1,000,000-row read on every line except a container held awake (section 6.4).

## 2 Per product

Sections 2.1 to 2.11 (Workers, Durable Objects, R2, service bindings, cron, queues, Workflows, containers, Browser Run, Workers AI, D1/Vectorize/Images) moved whole to `PLATFORM-s2-per-product.md` in this folder (K5022); their row ids (W, D, R, B, CR, Q, WF, CT, BR, AI) are unchanged.

## 3 Today's configuration

Read from `/home/user/bio/bio-plane/wrangler.jsonc` (version 0.86.0) on 2026-10-23, unchanged by the lane. The plane is one Worker with one Durable Object class; background work is the object's alarm plus one cron watchdog. It has no Queue, Workflow, Container or Workers AI binding of its own.

| setting | value | what it means against the limits |
|---|---|---|
| `name`, `account_id` | `bio-plane`; account `20b533579290b9b93168345edd3b7f72`, pinned | n/a |
| `main` | `src/plane/index.mjs` | One bundle: the idle memory is the module graph (Civicsmith measurement, below) |
| `compatibility_date`, `compatibility_flags` | `2026-07-01`; `nodejs_compat` | Behaviour of the runtime APIs is fixed at that date, not at today's |
| `durable_objects` | binding `STORE`, class `Store`; migration `v1` with `new_sqlite_classes` naming `Store` | SQLite-backed: rows D32 to D38 apply (10 GB per object, 2 MB per value or row, 100 KB per statement); alarms D10 to D22; shares an isolate with other instances of the class (D1) |
| `r2_buckets` | `CAPTURES` = `bio-captures`; `PUBLISHED` = `bio-published` | R2 rows R1 to R24; both calls count toward the six waiting connections (W25) |
| `services` | `PDF_WORKER` = `pdf-worker`; `AGENT_WORKER` = `agent-worker`; `OCR_WORKER` = `ocr-worker`; `SHEET_WORKER` = `sheet-worker`; `FILE_SCANNER` = `file-scanner`; `SELF` = `bio-plane` (a loopback so the object can reach its own Worker's ops) | Each call is a subrequest and a Worker invocation (B1, B2); the loopback adds one invocation per periodic consumer call |
| `browser` | binding `BROWSER` | Bound, but the in-plane driver is not built (the file says so); no Browser Run limit is reached today |
| `observability` | `{ enabled: true }` | Logs are subject to “Log data per request / 256 KB” (W-LIM, not quoted in section 2) |
| `triggers.crons` | `*/5 * * * *`: the watchdog, “every five minutes”; it “asks each object to check its alarm and set it afresh if it is absent, spent or stale. It runs no work.” | Interval under one hour, so the Cron row W12 gives 30 seconds of CPU; 15 minutes wall (W17); changes propagate in up to 15 minutes (CR3); missed or overlapping firings are not documented (CR8, G8) |
| `limits` | `{ subrequests: 10000 }` only | Equals the Paid default (W23). The file explains it was unset before and the default had moved. **`cpu_ms` is not set, so every invocation (fetch, alarm, scheduled) runs at the 30-second default (W11, D7, W12).** The file's own words: it is set “because a default that moves is not a decision” |
| not present | `queues`, `workflows`, `containers`, `ai`, `d1_databases`, `vectorize`, `images`, `placement`, `kv_namespaces`, `limits.cpu_ms` | The plane uses none of sections 2.6 to 2.11 directly |

The fleet members the plane calls (read from their `wrangler.jsonc`, not edited):

| member | what it sets | note |
|---|---|---|
| `pdf-worker` | an R2 binding; no `limits` block | 30-second CPU default |
| `ocr-worker` | `limits.cpu_ms: 30000`; comments record a Civicsmith measurement of 10,400.6 cpu_ms per page at 300 dpi and that 33.7, 48.5 and 61.3 MB RGBA frames complete while a 75.7 MB frame is killed (`exceededMemory`); rule: one page per invocation | Civicsmith's measurement, on its engine and model |
| `sheet-worker` | `limits.cpu_ms: 300000` (the Paid 5-minute ceiling); R2 `CAPTURES` read | Ships inactive until enabled |
| `file-scanner` | `limits.cpu_ms: 300000`; cron `*/10 * * * *`; two containers (`FileScanner`, `SafeViewRenderer`), each `standard-1` (4 GiB, 8 GB disk) with `max_instances: 3`, no internet; Durable Objects `SCANNER`, `RENDERER` | The only members using Containers besides `agent-runner` |
| `agent-runner` | one container `AgentRunner`, `standard-1`, `max_instances: 10`; comment: the default size took 27 seconds to start one conversation | Not a reading component |
| `agent-worker` | service and Durable Object bindings; no R2 binding; no `limits` block | 30-second CPU default |
| `stewards` | cron `17 3 * * *`; Durable Object `StewardsStore` | Not a reading component |

**Civicsmith's own memory measurements (not Cloudflare's), for scale.** In the lane's evidence: the assembled plane's Store idles at about 86.7 MB (heap plus array buffers) in a Node harness, of which about 77 MB is the cost of importing the code, and 43.5 MB is JavaScript source held as two-byte strings because of 18,274 non-ASCII characters (`diagnosis-R6-idle.md`, 2026-10-22); the plane's ASCII bundle in raw workerd boots and answers one Store operation at a heap cap of 49 MB and not at 48 (as built, 85), so the real object idles at about 50 MB (`diagnosis-R6-g40.md`; `envelope-scans-T51.md`); the harness's "real-shape" cap for reading a file of N MB is `128 + 39 - N` (the 39 being the harness-to-workerd difference). These figures sit on a local runtime, treat 128 MB as heap-plus-bytes (G9), and are due to be re-measured (`envelope-scans-T51.md`). Against W1: roughly 128 - 50 = 78 MB of the isolate is left to a read on the lane's best figure, and roughly 41 MB on the harness figure, before any other instance in the same isolate (D1).

## 4 Contradictions and gaps in the documentation

Each item gives both statements with their pages and dates, and what the lane assumes meanwhile (the conservative side). Open means only a live measurement or Cloudflare can settle it (section 5).

**G1 Queue consumer CPU: 5 minutes or 15.** Q-LIM (Apr 21, 2026): "Consumer CPU time / Configurable to 5 minutes", example `limits.cpu_ms` 300,000. W-PRICE (Oct 2, 2026): "Max of 15 minutes of CPU time per Cron Trigger or Queue Consumer invocation". W-LIM's CPU table has no queue row. Wall time is 15 minutes on all. Assumed: 5. Open (P-M12).

**G2 Durable Object deploy grace: 30 seconds, 20 minutes or none.** DO-LIFE (Oct 15, 2026): "When the Worker runtime system is being updated, in-flight requests have up to 30 seconds to complete." W-LIM (Oct 12, 2026): "processes running the previous version of the Workers runtime give existing Workers requests and connections up to 20 minutes to finish." For a code deploy DO-LIFE states no grace, and its in-flight list names HTTP, RPC, WebSocket and "Other invocations (email, cron)", not alarms. Assumed: storage-touching work, an alarm handler included, can be stopped at once. Open (P-M4).

**G3 Cron count: three per Worker or 5 / 250 per account.** DO-ALARM (Apr 21, 2026): "A Worker can have up to three Cron Triggers configured at once". W-LIM: "Number of Cron Triggers per account / 5 / 250". The older sentence is likely stale. Not binding: the plane, `file-scanner` and `stewards` have one each.

**G4 Service-binding connections and the callee's resources.** W-SB (Oct 13, 2026): "Calling a service binding does not count towards simultaneous open connection limits". W-LIM (Oct 12, 2026): "The runtime measures simultaneous open connections from the top-level request. Workers triggered via Service bindings share the same connection limit." Both can hold (the call takes no slot; the callee's connections count against the caller's six) but no page says so. No page says whether a callee has its own 128 MB or CPU budget. Assumed: the callee's calls add to the six; the callee has its own isolate. Open (P-M10).

**G5 Which subrequest counter a binding call hits.** W-SB: "Each request to a Worker via a Service binding counts toward your subrequest limit." W-LIM has a separate row "Subrequests to internal services / 1,000 / Matches configured limit (default 10,000)" without saying that service bindings are internal services. Assumed: one count against the invocation's 10,000.

**G6 Workflows concurrency: 50,000 or 10,000** (WF-LIM, Sep 21, 2026, one page). Table: "Concurrent Workflow instances (executions) per account / 100 / 50,000"; text: "if there are 10,000 concurrent instances actively running, an instance that has been in a waiting state will be queued instead of resuming immediately." Assumed: 10,000. Open (P-M15).

**G7 Images 10, 20 or 100 MB** is a mapping, not a conflict: IMG-LIM gives 100 MB for remote images transformed and 10 MB for images uploaded to Images storage (X6); IMG-BIND gives 20 MB for `.input()` (X5). Assumed: 20 MB for the binding.

**G8 Cron: no minimum interval and no missed-fire, overlap or retry semantics.** W-CRON and W-SCHED give no minimum (the first example is "At every minute") and no rule for a missed firing, two overlapping firings or a failed handler; W-CRON names the test field "noRetry" without describing a policy. Assumed: a firing may be late, missed or repeated; nothing may depend on one firing. Open (P-M7).

**G9 What the 128 MB contains.** W-LIM: "Each isolate can consume up to 128 MB of memory, including the JavaScript heap and WebAssembly allocations." ArrayBuffer backing stores are not named; but "Memory limit would be exceeded before EOF" is raised when a body is buffered, which implies body bytes count. Locally backing stores are unlimited (S1). Civicsmith's harness treats the limit as heap plus bytes. Assumed: heap plus every live buffer. Open (P-M2).

**G10 Request body limit: account plan or zone.** W-LIM: "Request body size limits depend on your Cloudflare account plan, not your Workers plan." The Enterprise setting is on "the zone's Network page". Not stated: which plan governs an account whose zones differ; whether MB is 10^6 or 2^20 bytes; whether multipart/form-data framing counts. Assumed: the smaller plan, 10^6 bytes, framing counts. Open (P-M1).

**G11 Smart Placement and RPC.** W-SP: "It does not affect RPC methods or named entrypoints", yet its example forwards "via RPC". W-RPC: "Smart Placement is currently ignored when making RPC calls." Assumed: not applied to the plane's RPC.

**G12 The 32-invocation cap's scope** (B2): "a single request" is undefined for a chain begun by an alarm, a cron or a queue; whether a Durable Object call counts is not stated. Assumed: every binding call and every object invocation counts (P-M11).

**G13 Alarm CPU on retry and chaining.** D7 gives 30 seconds by default; nothing says whether a retry or a re-armed alarm has a fresh budget. Assumed: fresh, of the configured size (P-M5).

**G14 Workflow step memory** is not stated; "Workflows are Worker scripts, and share the same per invocation CPU limits as any Workers do." Assumed: 128 MB shared (P-M16).

**G15 `toMarkdown`** documents no size, page, time or rate limit and no OCR (AI4, AI5, AI7). Assumed unsuitable for scans and for files near 100 MB until measured (P-M19).

**G16 Presigned multipart.** R2-PRESIGN and R2-UP show a presigned PUT for one object; neither shows signing `UploadPart` per part, though R2-UP says S3-compatible tools "automatically choose multipart upload for large files". Assumed unproven (P-M3).

**G17 `R2.put` of a stream of unknown length.** R2-API and R2-UP state no length requirement. Locally an unknown-length request body dropped the connection while a known length or `FixedLengthStream` worked (S6). Assumed: a length is required (P-M3).

**G18 Smaller gaps.** Queues state no default retry delay (Q-BATCH). DO-LIFE holds an object up to 15 minutes per pending operation and does not say what happens to one still pending at minute 15 (P-M23). No Containers page gives a `max_instances` ceiling, a start-rate limit or a cold-start guarantee (only “can often be in the 1-3 second range”). DO-LIM gives 10 GB per object with no plan named; its FAQ says "(10 GB on Workers Paid, or 1 GB on the Free plan)" (no conflict at Paid). The Queues pages and DO-ALARM are six months older than the October pages they conflict with; the lane assumes the more conservative statement, not the newer.

## 5 What local runs cannot show, and the live measurements to make

### 5.1 Limit by limit

| limit | a local run shows | a local run cannot show |
|---|---|---|
| Isolate memory 128 MB (W1, D1) | S1: a V8 heap cap (raw workerd only; Miniflare has none) can bisect the smallest heap in which a read completes; relative costs (S5: whole-object `arrayBuffer()` about 2.3x the object; ranges and streams near baseline) | whether backing stores count (locally a 400 MB set passed); the real overrun (locally the whole process aborts; on the platform error 1102 and a new isolate); instances sharing an isolate; the deployed bundle's baseline; effect on siblings or an alarm in flight |
| CPU (W11, D7) | nothing: no limit exists (S2); a 90 s loop completed in a handler and an alarm | the cut and its error; a fresh budget on retry; the clock (the lane's evidence says workerd freezes `Date.now()` in synchronous work; S2 saw it advance 90,448 ms; they disagree) |
| Wall time, grace, deploys (W17, W18, D24, D25, C14) | nothing | what a deploy or runtime update does to a running alarm, request or step; the 15-minute cut |
| Alarms (D10 to D15) | S3: retry count and shape, the argument, re-arm, past alarm, persistence and an overdue alarm at restart | latency and jitter, a mid-handler machine loss, behaviour after a deploy, duplication, whether writes before a throw persist (locally they did; to re-check) |
| DO SQLite (D32, D33) | S4: 2 MB value and row, 100 KB statement, 50-byte LIKE, to the byte; about 1.4x size overhead for 1 KB rows | the 10 GB cap, write latency (locally 100,000 rows take half a second), `databaseSize` accounting, cache memory against the isolate, rows-written billing |
| R2 (R1 to R24) | S5: range semantics, multipart rules, `FixedLengthStream` | latency and throughput, the six-connection wait, 429 on a hot key, the 10,000-part ceiling, presigned and browser flows, CORS |
| Request body (W28 to W30) | S6: a known length passes to `R2.put`; a chunked body does not | the cap, the 413 before the Worker runs, edge timeouts on slow uploads |
| RPC (B6, B7) | S7: the 32 MiB limit and message; streams unbounded | cross-machine cost, back-pressure on a network, cancellation when the callee dies, the callee's memory |
| Subrequests, connections, 32 invocations (W23, W25, B2) | nothing (S8: 10,500 fetches and 200 concurrent all ran) | the counts per call kind, the queueing delay, the errors |
| Cron, Queues, Workflows, Containers, Browser Run, `toMarkdown`, Images | nothing was run | all of it |

### 5.2 The live measurements each architecture must make before relying on it

Measurements, not design. A probe means a throwaway Worker and object deployed to the team's account and removed after; the lane has made none (charter: no deploy).

**P-M1 Request body cap on the team's zone.** Read the zone's plan. POST 99, 100, 101 and 200 million bytes, and the same in mebibytes, raw and as multipart/form-data, to a probe that counts bytes; record status, whether the Worker ran, the time. Decides W28 to W30, G10.

**P-M2 Memory.** In a probe Worker and a SQLite-backed object: (a) retain `Uint8Array`s in 8 MiB steps and record where error 1102 appears (do backing stores count, G9); (b) the same with JavaScript objects; (c) the deployed plane bundle's idle; (d) with an alarm running and a second object of the class active, overrun in one and record whether the other and the alarm die, whether `retryCount` advances and the retry delay; (e) how many instances share an isolate at the team's object count. Decides W1 to W4, D1, D2, E1.

**P-M3 R2.** (a) `put` of a stream of unknown length and of known length at 1, 50 and 100 MB (G17). (b) A browser or CORS-bound client uploading 500 MB by presigned multipart: per-part presigning, part ETags readable under the bucket's CORS, completion (G16). (c) Ranged `get` of 1, 8 and 32 MiB from a Worker and an object, sequential and six in flight: latency, throughput, counters. (d) Hot-key reads at 10, 50 and 200 per second for 429. Decides R1 to R24.

**P-M4 A deploy during a running alarm.** A probe whose alarm runs 10 minutes in 30-second checkpoints, re-arming itself; deploy at minute 3, at minute 9 and during a storage write; with a pending `fetch` and a pending RPC call. Record whether it is cut, how soon, whether it is retried, whether `retryCount` increments, the last checkpoint kept, whether a second handler runs beside it. A runtime update cannot be provoked. Decides D23 to D27, G2, W18.

**P-M5 CPU.** A probe at the default and at `cpu_ms` 300000: CPU-bound alarms of 20, 40 and 100 seconds (error, status `exceededCpu`, fresh budget on retry) and a chain of ten alarms of 25 seconds each (G13); a CPU-bound `scheduled()` with and without `cpu_ms`. Decides W11, W12, D7 to D9.

**P-M6 The clock.** Compare `Date.now()` and `performance.now()` around a 5-second synchronous loop in a handler, an alarm and after an `await`. Decides whether a wall-clock budget in code can be trusted.

**P-M7 Cron.** A probe with `* * * * *`, `*/5 * * * *` and `*/15 * * * *` logging `scheduledTime` and the real start for 24 hours: lateness, misses, duplicates; a handler longer than the interval (overlap); one that throws (retry); a deploy during a firing; the CPU cut under a one-hour interval with and without `cpu_ms`. Decides CR2 to CR8, G8.

**P-M8 Alarm latency and jitter.** One alarm set 1 second ahead, a chain of 1,000, and `Date.now()`, alone and with 10 and 1,000 other active objects. Decides D22.

**P-M9 Durable Object SQLite.** Bulk insert of 100,000 and 1,000,000 rows of 1 KB and 100 bytes with one and three indexes: time, `databaseSize`, memory, the rows-written counter; a 2 MB value and 2 MB + 1; a 100 KB statement; the latency of a concurrent request during a long write. Decides D32, D33, D38.

**P-M10 The service-binding callee.** Worker A calls Worker B's method that allocates 100 MB and opens six `fetch`es and six R2 reads at once: B's own 128 MB, whether B's connections wait on A's six, CPU attribution. Decides B3, B4, G4.

**P-M11 The 32-invocation cap.** Sequential and fan-out chains of binding calls begun in a `fetch`, an alarm, a cron and a queue consumer, and through a Durable Object: the call number and text of the exception. Decides B2, G12.

**P-M12 Queue consumers.** `cpu_ms` 300000; a consumer burning 4, 6 and 16 minutes of CPU, one waiting 14 and 16 minutes, one exceeding memory: the cut, whether the batch is retried and counted against `max_retries`, latency, duplicates, per-message acknowledgement. Decides Q6, Q9, G1.

**P-M13 Queue throughput.** 5,000 messages of 1 KB, batches of 100: time to drain, concurrency reached, operation counters. Decides Q5, Q14.

**P-M14 Workflows.** 5,000 no-op steps; 50 steps returning 1 MiB and 1 MiB + 1; a deploy over a running step; a stream-returning step retried; 50 parallel steps: overhead per step, failure shape, counters. Decides WF1 to WF5, WF11, WF12, WF17.

**P-M15 Workflow concurrency.** Ask Cloudflare (the Limit Increase Request Form or support) or run 10,001 instances: where new ones queue (G6). **P-M16 Workflow step memory.** The P-M2 (a) allocation inside a step (G14).

**P-M17 Containers.** With the intended image: cold start from sleep and from never run; time to first byte of a 100 MB R2 object by outbound handler, S3 API and FUSE; `exec().output()` of 100 MB; a running job across `wrangler deploy` under the default and `immediate` rollouts; SIGTERM to SIGKILL; a week of an idle probe for host restarts; idle-awake cost at `standard-1` and `standard-4`; whether the inactivity timeout survives an object restart. Decides C6 to C22, G18.

**P-M18 Browser Run** (only if web capture uses it): time and size of a /pdf or /snapshot on three pages, the 60-second timeout, `keep_alive` to 20 minutes, 429 at 3 new sessions a second. **P-M19 `toMarkdown`:** PDFs of 1, 10, 50 and 100 MB and of 100, 1,000 and 5,000 pages, text and scanned, a 50 MB xlsx, a csv, a docx: acceptance, time, output, whether a scanned page is transcribed, the failure shape, refusals (G15).

**P-M20 A disconnecting client.** Stream an upload into R2 and disconnect at 10%, 50% and 90%: what remains in R2, whether the Worker's tail runs and for how long (W16, W20). **P-M21 The six-connection wait.** 20 simultaneous R2 `get`s and 20 `fetch`es to a slow server: the wait of the seventh and later, and whether an unread body holds a slot (W25, W26). **P-M22 Subrequest counting.** `limits.subrequests` 50 on a probe; calls of each kind (fetch, R2, object RPC, binding RPC, Queue send, KV) until the exception (W23, G5). **P-M23 The 15-minute hold.** An object with a 16-minute pending `fetch`: what happens at minute 15 (G18). **P-M24 Cost reconciliation.** After any of the above, compare the usage counters with section 6.4.

## 6 Consequences for a reading architecture

Facts that follow from sections 2 to 4, with arithmetic where numbers are combined. No design is chosen. Taking MB as MiB is stated where the unit changes a result.

### 6.1 Memory and where bytes can sit

**E1 A file of N MB cannot be held whole in a Durable Object isolate.** 128 MB, shared (W1, W2, D1). On the lane's best figure the plane's idle leaves about 78 MB, on the harness figure about 41 MB (section 3). A 100 MB document, a 50 MB sheet (a zip; its XML is larger) and a 500 MB archive exceed that; a 50 MB image lies between the two figures. The Images binding refuses more than 20 MB (X5).

**E2 The documented failure for whole-body reads is a crash.** W6: buffering "will crash your Worker on large payloads"; W3: the isolate is replaced. Locally the same read passes (S1, S5, S6).

**E3 Reading in windows is the documented route.** R2 `get` takes `offset`, `length`, `suffix`, returns a stream, and is strongly consistent (R5 to R8, R10). A 100 MB file in 8 MiB windows is 13 reads, a 500 MB archive 63, a 50 MB sheet 7; each is one Class B operation. Locally 13 windows cost 17 to 36 MB above baseline and 1.3 to 1.8 s (S5).

**E4 Six calls may wait for headers at once.** An R2 call counts from its start until its headers arrive (W25, W26); the seventh waits.

**E5 What crosses a Worker boundary.** At most 32 MiB serialized; a byte stream is exempt (B6, B7); ownership of a stream moves and a `tee` may buffer (B8); a stub does not outlive its execution context (B10). An R2 key with an offset and a length costs no payload.

**E6 Stored and queued sizes.** A queue message is under 128,000 bytes (Q1); a Workflow step result at most 1 MiB unless a byte stream, which still counts toward the 1 GB per-instance state (WF2 to WF4); a Durable Object value or row at most 2 MB (D33). Civicsmith measured a 1 MB CSV's stored reading at 11.27 MB of JSON (`diagnosis-R6-g40.md`), about 5.4 times the limit. With 100 bound parameters per statement (D33) a statement of eight columns carries at most 12 rows.

**E7 The container is the documented place for memory above 128 MB** (12 GiB, 20 GB ephemeral disk, 4 vCPU: C2, C3), reached only through its Durable Object (C6) whose 128 MB receives `exec().output()` (C16). It can be stopped at any time and a deploy replaces it (C10, C14): nothing in it survives unless written outside (C12, C18).

**E8 `toMarkdown` and the Images binding take whole inputs in a Worker's memory** (AI6, X5). `toMarkdown` documents no limit and no OCR of a scanned PDF (AI4, AI7), and its format list (AI3) excludes presentations, legacy Word, rich text, e-books, archives and TIFF (inference from the list).

### 6.2 Time, retries and liveness

**E9 CPU is 30 seconds unless set, and the plane sets none** (W11, D7, section 3); the ceiling is 5 minutes; I/O waits are free (W10); a fresh budget on retry is not stated (G13). `sheet-worker` and `file-scanner` ask for 300,000 ms, `ocr-worker` 30,000.

**E10 An alarm cannot be the only guarantee.** One per object (D10); at most 6 retries, then none until `setAlarm` (D12); a restart runs the handler from its beginning (D14); wall time 15 minutes (W17). Locally the delays are 2.1, 4.4, 8.2, 16.8, 37.8 and 68.5 s, 138 s in all (S3): a handler that throws seven times in a row is gone within about 2.5 minutes unless it re-armed first.

**E11 Every unit of work can run twice.** Alarms, Queue messages and Workflow steps are at-least-once (D10, D14, Q10, WF11).

**E12 A Durable Object can be shut down at any time**, with no hook; storage-touching work is stopped at once; memory is lost (D4, D23 to D25). Pending I/O holds it at most 15 minutes per operation (D27).

**E13 The cron watchdog's documented guarantees are thin:** UTC, spare capacity, changes in up to 15 minutes, 30 seconds of CPU under a one-hour interval, nothing on missed or overlapping firings (CR1 to CR8). The plane's schedule is every five minutes.

**E14 Long work has four documented homes**, each with its cut: an alarm (15 minutes wall, 30 s CPU by default); a queue consumer (15 minutes wall, CPU 5 or 15 minutes); a Workflow step (unlimited wall, 30 s CPU by default, 10-minute default timeout, redone from its beginning); a container (no fixed maximum, no guarantee, SIGTERM then 15 minutes). `waitUntil` offers 30 seconds after a response (W20).

**E15 Workflow step budget.** 10,000 steps by default, 25,000 configurable (WF5): one step per page of a 5,000-page document uses half the default; one per row of a million-row sheet is impossible. Steps are billed (WF15).

**E16 Queue retry.** A failed message retries the whole batch unless the others were acknowledged (Q9); retries default to 3 and go to 100 (Q8); a dead-letter queue keeps messages 4 days without a consumer (Q11).

### 6.3 Upload and storage

**E17 A browser upload through the Worker is capped by the zone's plan:** 100 MB on Free and Pro, 200 MB on Business, up to 5 GB on Enterprise (W28 to W30). A file of exactly the standard's 100 MB sits at the Free/Pro cap and multipart framing adds to it (G10). A 500 MB archive does not pass below Enterprise. The documented alternative bypasses the Worker: a presigned R2 upload (R19), which needs bucket CORS (R20), cannot use a custom domain and does not support `POST` forms.

**E18 Multipart arithmetic.** Parts 5 MiB to 5 GiB, equal except the last, at most 10,000 (R11): a 500 MiB archive is 100 parts at 5 MiB or 63 at 8 MiB; at the 5 MiB minimum the part ceiling gives 10,000 x 5 MiB = about 48.8 GiB. Create, each part and complete are Class A operations (R23). The client holds the upload id and ETags (R17); abandoned uploads are aborted after 7 days (R14).

**E19 One write per second per key** (R3): a progress record rewritten per page belongs in the object's SQLite, whose rows written are billed (D38). SQLite is 10 GB per object, rows of 1 KB use about 1.4x locally (S4), a full object refuses writes and accepts reads and deletes (D32).

### 6.4 Cost at the team's plan (Workers Paid), arithmetic from the quoted prices

Prices are as quoted (R23, D36 to D38, Q14, WF15, C21, W34, BR4, AI2). Paid includes monthly amounts first (10 million Worker requests, 30 million CPU ms, 1 million object requests, 400,000 GB-s, 50 million rows written, 1 million Class A and 10 million Class B R2 operations, 1 million queue operations, 500,000 workflow steps, 25 GiB-hours of container memory); the figures are the marginal charge beyond them.

| item | unit price | worked example (arithmetic) |
|---|---|---|
| Worker request, CPU | $0.30 per million; $0.02 per million ms | 5,000 page-units, 3 s CPU each: $0.0015 and $0.30 (both inside the included amounts) |
| Object request (each RPC call) | $0.15 per million | 5,000 calls: $0.00075 |
| Object duration | $12.50 per million GB-s (128 MB = 0.125 GB) | one 15-minute alarm: 900 s x 0.125 = 112.5 GB-s = $0.0014; 400,000 GB-s is 3,555 of them a month |
| Object rows written | $1.00 per million | 5,000 progress rows: $0.005; a 1,000,000-row sheet with one index: 2,000,000 rows (an index update counts as a row) = $2.00 |
| Object stored data | $0.20 per GB-month (5 GB included) | a 50 MB reading: $0.01 |
| R2 Class A (put, multipart steps, list) | $4.50 per million | a 500 MiB archive in 8 MiB parts: 65 operations = $0.0003 |
| R2 Class B (get, head) | $0.36 per million | a 100 MiB file in 13 ranged reads: $0.0000047; 5,000 range reads: $0.0018 |
| R2 storage | $0.015 per GB-month; no egress charge | 500 MB: $0.0075 a month |
| Queue | $0.40 per million operations, 3 per message | 5,000 messages: $0.006 |
| Workflow step | $0.80 per 100,000 beyond 500,000 | 5,000 steps: $0.04 (1% of the included steps) |
| Container `standard-1` (4 GiB, 1/2 vCPU, 8 GB) | memory $0.0000025 per GiB-s; CPU $0.000020 per vCPU-s (active use); disk $0.00000007 per GB-s | one hour awake: memory $0.036, disk $0.0020, CPU at most $0.036: at most $0.074; 25 GiB-hours included is 6.25 hours a month |
| Container `standard-4` (12 GiB, 4 vCPU, 20 GB) | same | one hour awake: at most $0.108 + $0.0050 + $0.288 = $0.40 |
| `toMarkdown`, Browser Run, Images | free for most formats; $0.09 per hour beyond 10; $0.50 per 1,000 unique transformations | not estimable (no limits documented) or not a file read |

On every Cloudflare line except a container held awake a 5,000-page or 1,000,000-row read costs cents. Two billing facts bear on design: an object is billed for wall-clock duration while it awaits pending I/O (D37), so awaiting a 15-minute container call costs the same 112.5 GB-s as computing for 15 minutes; and each RPC call to an object is a billed request (D36).

### 6.5 Testing at the platform's shape

**E20 Local runs reproduce to the byte:** RPC 32 MiB, DO SQLite 2 MB, 100 KB and the 50-byte LIKE, the R2 5 MiB multipart minimum and equal-part rule, `FixedLengthStream` length, the alarm retry shape. A test can pin them (S3, S4, S5, S7).

**E21 Local runs do not enforce:** isolate memory (backing stores free; a heap overrun kills the process), CPU, request body size, subrequest count, the six connections, the 32 invocations, the 10 GB cap, any time cut. A claim that a design fits within these is argued from arithmetic and the measurements of section 5, with the architecture carrying its own byte and work counters (S1, S2, S6, S8).

**E22 The only local memory meter** is raw workerd `--max-old-space-size`, which sees the V8 heap and not buffers; the live bytes of every `ArrayBuffer` are added by hand (S1). Miniflare cannot set it.

## 7 Quote check

Every quotation of twelve characters or more in this file (303 of them; text between straight double quotation marks) was matched by script against the raw page named by its page key (or, for prose outside the tables, against the raw pages as a set) after the mechanical changes of section 0. Unmatched: 0.

