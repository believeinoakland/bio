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

Plan assumed throughout: Workers Paid (the plane's own `wrangler.jsonc` says “Workers Paid is required (DEC-42)”). Where a Free-plan figure matters it is given beside the Paid one. What the team's Cloudflare zone plan is (Free, Pro, Business, Enterprise) is not established by anything the lane has read; it decides the request body limit (W28) and is item P-M1 in section 5.

### 2.1 Workers: memory, CPU, wall time, subrequests, bodies

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| W1 | Memory per isolate | "Each isolate can consume up to 128 MB of memory, including the JavaScript heap and WebAssembly allocations." | W-LIM | S1: raw workerd with `--max-old-space-size` 64/128/256 limits only the V8 heap; a 400 MB set of `Uint8Array` buffers was accepted in every setting (RSS 443 MB), so backing stores are not counted locally | no |
| W2 | Per isolate, shared by concurrent requests | "This limit is per-isolate, not per-invocation. A single isolate can handle many concurrent requests." | W-LIM | not run (one request at a time) | no |
| W3 | What happens on overshoot | "When an isolate exceeds 128 MB, the Workers runtime lets in-flight requests complete and creates a new isolate for subsequent requests. During extremely high load, the runtime may cancel some incoming requests to maintain stability." | W-LIM | S1: a heap overshoot aborts the whole workerd process (V8 fatal error, location `Reached heap limit`, SIGABRT, exit 1); every worker, Durable Object and request in it dies; a `try/catch` never runs. Harsher than the platform's text | no |
| W4 | How it shows | "When a Worker exceeds its memory limit, Cloudflare returns Error 1102 to the client with the message Worker exceeded resource limits." and "You may also see the runtime error Memory limit would be exceeded before EOF when attempting to buffer a response body that exceeds the limit." | W-LIM | not reproducible (no limit) | no |
| W5 | Remedies the page gives | "Stream request and response bodies" and "Avoid large in-memory objects" and "Store large data in KV, R2, or D1 instead of holding it in Worker memory." | W-LIM | S5: whole-object `r2.get().arrayBuffer()` of 100 MiB added 233 MB peak RSS; streaming the whole object added 7 MB; 13 ranges of 8 MiB added 17 to 36 MB. Relative signal only | partly |
| W6 | Buffering is called a crash | "Workers have a 128 MB memory limit, so buffering an entire body with await response.text() or await request.arrayBuffer() will crash your Worker on large payloads." | W-BP | S6: `request.arrayBuffer()` of 150 MiB succeeded locally (RSS 251 to 571 MB; raw workerd old-space 128: no crash, backing store off-heap) | no |
| W7 | Streams are stated to fit | "This enables you to parse extremely large request or response bodies within a Worker's 128 MB memory limit." and "allows your Worker to handle multi-gigabyte payloads or files within its memory limits." | W-STREAMS | S5/S6: streamed 100 MiB and 150 MiB bodies stayed near baseline (+7 MB, +38 MB with `FixedLengthStream`) | partly |
| W10 | CPU time is active CPU | "Waiting on network requests (such as fetch() calls, KV reads, or database queries) does not count toward CPU time." | W-LIM | S2: no CPU limit exists locally; a 90.4 s synchronous loop returned 200 in a `fetch` handler and ran to completion in a DO `alarm()` (111 s); `Date.now()` advanced 90,448 ms during the loop | no |
| W11 | CPU default and ceiling | "On the Workers Paid plan, you can increase the maximum CPU time from the default 30 seconds to 5 minutes (300,000 ms)." and the row "CPU time per HTTP request / 10 ms / 5 min (default: 30 seconds)" | W-LIM | S2: Miniflare accepts `cpuMs` and `limits.cpu_ms` and also an invented option, so acceptance proves nothing; neither has an effect | no |
| W12 | CPU of a cron invocation depends on the schedule interval | "CPU time per Cron Trigger / 10 ms / 30 seconds (< 1 hour interval) 15 min (>= 1 hour interval)" | W-LIM | not run | no |
| W16 | Wall time, HTTP | "There is no hard limit on duration for HTTP-triggered Workers. As long as the client remains connected, the Worker can continue processing, making subrequests, and streaming a response body. When the client disconnects or the response is complete, tasks associated with that request may be canceled." | W-LIM | not run | no |
| W17 | Wall time, cron, alarm, queue consumer | "Scheduled Workers have a maximum wall time of 15 minutes per invocation." and "Alarm handler invocations have a maximum wall time of 15 minutes." and "Each consumer invocation has a maximum wall time of 15 minutes." | W-LIM | S2: the local alarm ran 111 s with no cut | no |
| W18 | Runtime updates give existing work up to 20 minutes, per process | "During routine updates, processes running the previous version of the Workers runtime give existing Workers requests and connections up to 20 minutes to finish." and "The grace period applies to each process running the previous version, not to each request. When it ends, that process terminates its remaining requests and connections." | W-LIM | not reproducible | no |
| W20 | `waitUntil` | "For HTTP-triggered Workers, ctx.waitUntil() can extend execution for up to 30 seconds after the response is sent or the client disconnects. This is not a limit on the total wall time of an HTTP request. This time limit is shared across all waitUntil() calls within the same request. If any Promises have not settled after 30 seconds, they are canceled." | W-CTX | not run | no |
| W23 | Subrequests: limit and what counts | "Subrequests per invocation / 50 / 10,000 (up to 10M)" and "A subrequest is any request a Worker makes using the Fetch API or to Cloudflare services like R2, KV, or D1." and "Each subrequest in a redirect chain counts against this limit." | W-LIM | S8: 10,500 sequential fetches, 1,100 R2 `head()` and 1,100 KV `get()` in one request all succeeded; no limit exists locally | no |
| W25 | Six connections waiting for headers | "Each Worker invocation can have up to six connections simultaneously waiting for response headers." The list that follows names "list(), get(), put(), delete(), and head() methods of R2" and "send() and sendBatch() methods of Queues". | W-LIM | S8: 30 and 200 simultaneous fetches all ran at once (server saw 30 and 200 concurrent); no limit locally | no |
| W26 | A slot is held only until headers arrive | "Once response headers arrive for a connection, it no longer counts toward the six-connection limit." and "If a seventh connection is attempted while six are already waiting for headers, it is queued until one of the existing connections receives its response headers." | W-LIM | not reproducible | no |
| W28 | Request body limit follows the Cloudflare plan | "Request body size limits depend on your Cloudflare account plan, not your Workers plan. Requests exceeding these limits return a 413 Request entity too large error." | W-LIM | S6: a 150 MiB POST passed in every mode; no body limit locally | no |
| W29 | The body limit by plan | "Free / 100 MB" and "Pro / 100 MB" and "Business / 200 MB" and "Enterprise / Up to 5 GB (self-serve)" | W-LIM | n/a | no |
| W30 | Enterprise adjustment | "Enterprise customers can adjust the maximum request body size up to 5 GB themselves from the zone's Network page (Maximum Upload Size). For limits above 5 GB, contact your account team or Cloudflare Support." | W-LIM | n/a | no |
| W34 | Workers Paid price | "The Workers Paid plan includes Workers, Pages Functions, Workers KV, Hyperdrive, and Durable Objects usage for a minimum charge of $5 USD per month for an account." and "10 million included per month +$0.30 per additional million" and "30 million CPU milliseconds included per month +$0.02 per additional million CPU milliseconds" | W-PRICE | n/a | n/a |

### 2.2 Durable Objects: memory, CPU, alarms, lifecycle, storage

A Durable Object is a Worker: "Durable Objects are a special kind of Worker, so Workers Limits apply according to your Workers plan. In addition, Durable Objects have specific limits as listed in this page." (DO-LIM).

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| D1 | A Durable Object's memory is the shared 128 MB | "Duration billing charges for the 128 MB of memory your Durable Object is allocated, regardless of actual usage. If your account creates many instances of a single Durable Object class, Durable Objects may run in the same isolate on the same physical machine and share the 128 MB of memory." | DO-PRICE | S1 (as W1) | no |
| D2 | Memory counted per isolate | "Memory is measured per isolate (which can host multiple Durable Objects), not per object." | DO-MEM | not run | no |
| D4 | Memory is lost on eviction | "Because in-memory state is not preserved across eviction or hibernation, persist anything important to storage." | DO-MEM | S3: a disposed Miniflare keeps the persisted alarm and storage, loses memory | yes |
| D5 | Unawaited writes can fill the isolate | "if an application performs a large number of put() without waiting for any I/O, the write buffer could theoretically grow large enough to cause the isolate to exceed its 128 MB memory limit." | DO-SQL | not run | no |
| D6 | `list()` without options | "Be aware of how much data may be stored in your Durable Object before calling this version of list without options because all the data will be loaded into the Durable Object's memory, potentially hitting its limit." | DO-SQL | not run | no |
| D7 | CPU of a Durable Object invocation, alarms named | "By default, the maximum CPU time per Durable Objects invocation (HTTP request, WebSocket message, or Alarm) is set to 30 seconds, but can be increased for all Durable Objects associated with a Durable Object definition by setting limits.cpu_ms in your Wrangler configuration:" and the row "CPU per request / 30 seconds (default) / configurable to 5 minutes of active CPU time" | DO-LIM | S2: no limit locally | no |
| D8 | CPU is reset by each incoming request or message | "Each incoming HTTP request or WebSocket message resets the remaining available CPU time to 30 seconds." and "If you consume more than 30 seconds of compute between incoming network requests, there is a heightened chance that the individual Durable Object is evicted and reset." | DO-LIM | n/a | no |
| D9 | Same CPU rules as Workers | "Durable Objects are Worker scripts, and have the same per invocation CPU limits as any Workers do." | DO-LIM | n/a | no |
| D10 | One alarm, at-least-once, 6 retries | "Each Durable Object is able to schedule a single alarm at a time by calling setAlarm()." and "Alarms have guaranteed at-least-once execution and are retried automatically when the alarm() handler throws." and "Retries are performed using exponential backoff starting at a 2 second delay from the first failure with up to 6 retries allowed." and "Only one instance of alarm() will ever run at a given time per Durable Object instance." | DO-ALARM | S3: a handler that always throws ran 7 times (the call and 6 retries), at 0.2, 2.3, 6.7, 14.9, 31.8, 69.6, 138.0 s after arming (gaps 2.1, 4.4, 8.2, 16.8, 37.8, 68.5 s); `retryCount` 0 then 1 to 6, `isRetry` true on retries, `scheduledTime` unchanged. The window ended at the 7th call; that no 8th call follows is inferred | yes (counts and shape), timings local |
| D11 | Retries apply to the latest `setAlarm` only | "This only applies to the most recent setAlarm() call. Retries will be performed if the method fails with an uncaught exception." | DO-ALARM | not run | partly |
| D12 | After 6 retries the alarm is gone until re-set | "Because alarms are only retried up to 6 times on error, it's recommended to catch any exceptions inside your alarm() handler and schedule a new alarm before returning if you want to make sure your alarm handler will be retried indefinitely. Otherwise, a sufficiently long outage in a downstream service that you depend on or a bug in your code that goes unfixed for hours can exhaust the limited number of retries, causing the alarm to not be re-run in the future until the next time you call setAlarm." | DO-ALARM | S3: re-arming inside the handler 500 ms ahead ran 4 times at 0.5 s spacing, each with `retryCount` 0 | yes |
| D13 | `setAlarm` overrides; `getAlarm` inside the handler | "If you call setAlarm when there is already one scheduled, it will override the existing alarm." and "If getAlarm is called while an alarm is already running, it returns null unless setAlarm has also been called since the alarm handler started running." | DO-ALARM | S3: inside the handler `getAlarm()` returned null; `setAlarm(Date.now() - 5000)` fired within about 20 ms | yes |
| D14 | An alarm is re-run from the start on another machine | "If an unexpected error terminates the Durable Object, the alarm() handler may be re-instantiated on another machine." and "Following a short delay, the alarm() handler will run from the beginning on the other machine." | DO-ALARM | not reproducible (S3 disposed the whole instance, not a mid-handler kill) | no |
| D15 | Alarms do not repeat | "Alarms do not repeat automatically — you must call setAlarm() again to schedule the next execution" | DO-RULES | S3 (re-arm) | yes |
| D22 | No latency or jitter bound for alarms | The page says only "Set the time for the alarm to run. Specify the time as the number of milliseconds elapsed since the UNIX epoch." No bound on lateness is stated anywhere read. | DO-ALARM | S3: local latency is small (about 20 ms for a past alarm); not a platform figure | no |
| D23 | Shutdown at any time, no hooks | "Durable Objects may shut down at any time due to deployments, inactivity, or runtime decisions. Rather than relying on shutdown hooks (which are not provided), design your application to write state incrementally." | DO-LIFE | not reproducible | no |
| D24 | In-flight requests at shutdown | "In-flight requests are allowed to finish if they do not access a Durable Object's storage. If a request attempts to access a Durable Object's storage, it will be stopped immediately and return an error to maintain Durable Objects global uniqueness property. When the Worker runtime system is being updated, in-flight requests have up to 30 seconds to complete." | DO-LIFE | not reproducible | no |
| D25 | Code deploy releases globally and shuts the object down; no grace stated | "When your Durable Object code is updated, your Worker and Durable Objects are released globally in an eventually consistent manner. This will cause a Durable Object to shut down, with the behavior described above." and "Other invocations are treated similarly to HTTP requests." Alarms are not named in the list of in-flight cases. | DO-LIFE | not reproducible | no |
| D26 | Idle eviction and hibernation | "While in the idle, in-memory, non-hibernateable state, after 70-140 seconds of inactivity (no incoming requests or events), the Durable Object will be evicted entirely from memory and potentially from the Cloudflare host and transition to the inactive state." and "After 10 seconds of no incoming request or event, and all the above conditions satisfied, the Durable Object will transition into the hibernated state." | DO-LIFE | not run | no |
| D27 | Pending work holds the object up to 15 minutes per operation | "Each operation prevents eviction until it completes or for up to 15 minutes from when it starts, whichever comes first." and "The limit applies to each operation, not to the total time in memory." | DO-LIFE | not run | no |
| D28 | Input and output gates | "Output gates hold outgoing network messages (responses, fetch requests) until pending storage writes complete." and "Input gates only protect during storage operations. Non-storage I/O like fetch() or writing to R2 allows other requests to interleave, which can cause race conditions:" | DO-RULES | not run | partly |
| D31 | Cursors and transactions | "For predictable behavior, fully consume cursors synchronously before the next await, for example with .toArray() or Array.from(cursor)." and "Note that sql.exec() cannot execute transaction-related statements like BEGIN TRANSACTION or SAVEPOINT." | DO-SQL | S4: `transactionSync` batches and autocommit both worked | yes |
| D32 | Storage per object, and when it is full | "Storage per Durable Object / 10 GB" and "When a SQLite-backed Durable Object reaches its maximum storage limit (10 GB on Workers Paid, or 1 GB on the Free plan), write operations (such as INSERT, UPDATE, or calls to the put() and sql.exec() storage APIs) will fail with the following error:" and "Read operations (such as SELECT queries, get(), and list() calls) will continue to work, and DELETE operations will also succeed so that you can remove data to free up space." and "Durable Objects both bills and measures storage based on a gigabyte (1 GB = 1,000,000,000 bytes) and not a gibibyte (GiB)." | DO-LIM | S4: not reachable locally; `databaseSize` after 100,000 x 1 KB BLOB rows was 142,974,976 bytes (about 1.4x the 102.4 MB payload) and returned to its prior size after `DELETE` | partly (size overhead), no (cap) |
| D33 | SQL value, row and statement limits | "Maximum string, BLOB or table row size / 2 MB" and "Maximum SQL statement length / 100 KB" and "Maximum bound parameters per query / 100" and "Maximum number of columns per table / 100" and "Maximum characters (bytes) in a LIKE or GLOB pattern / 50 bytes" and "Value size / Key and value combined cannot exceed 2 MB" | DO-LIM | S4: BLOB or TEXT of 2,097,152 bytes passes, 2,202,009 bytes fails with `SQLITE_TOOBIG`; a 1.5 MB TEXT plus 1.5 MB BLOB row fails (the limit applies to the row); a statement of 100,000 characters passes, 102,400 fails; a 50-byte LIKE pattern passes, 51 fails | yes |
| D36 | Request price | "Each RPC session is billed as one request to your Durable Object. Every RPC method call on a Durable Objects stub is its own RPC session and therefore a single billed request." and "1 million / month, + $0.15/million" | DO-PRICE | n/a | n/a |
| D37 | Duration price | "Durable Objects are billed for compute duration (wall-clock time) while the Durable Object is actively running or is idle in memory but unable to hibernate." and "400,000 GB-s / month, + $12.50/million GB-s" | DO-PRICE | n/a | n/a |
| D38 | SQLite price | "First 25 billion / month included + $0.001 / million rows" (rows read) and "First 50 million / month included + $1.00 / million rows" (rows written) and "5 GB-month, + $0.20/ GB-month" (stored data) and "When writing data, every row update of an index counts as an additional row." and "Each setAlarm() is billed as a single row written." | DO-PRICE, DO-SQL | S4: write counts not measured | no |

### 2.3 R2: ranged reads, multipart, limits, upload from a browser, price

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| R1 | Object and upload sizes | "Object size / 5 TiB per object" and "5 GiB (single-part)" and "4.995 TiB (multi-part)" and "Maximum upload parts / 10,000" and "The max upload size is 5 MiB less than 5 GiB, so 4.995 GiB." | R2-LIM | S5: Miniflare's constants include a 5,363,466,240-byte value maximum (5 GiB less 5 MiB); the 10,000-part and TiB limits not exercised | partly |
| R2 | Where the upload limit applies | "Max upload size applies to uploading a file via one request, uploading a part of a multipart upload, or copying into a part of a multipart upload. If you have a Worker, its inbound request size is constrained by Workers request limits. The max upload size limit does not apply to subrequests." | R2-LIM | S6: 150 MiB into `R2.put` through a Worker succeeded; no inbound limit locally | no |
| R3 | One write per second to the same key | "Maximum concurrent writes to the same object name (key) / 1 per second" and "Concurrent writes to the same object name (key) at a higher rate return HTTP 429 (rate limited) responses." | R2-LIM | not run | no |
| R5 | Range forms | "There are 3 variations of arguments that can be used in a range: - An offset with an optional length. - An optional offset with a length. - A suffix." | R2-API | S5: `get(key, {range: {offset, length}})` works | yes |
| R6 | Range arguments | "offset number - The byte to begin returning data from, inclusive." and "length number - The number of bytes to return. If more bytes are requested than exist in the object, fewer bytes than this number may be returned." and "suffix number - The number of bytes to return from the end of the file, starting from the last byte." | R2-API | S5: 13 ranges of 8 MiB (sequential): 291, 132, 104, 136, 155, 161, 158, 150, 163, 94, 89, 95, 47 ms (sum 1,775 ms; warm pass 1,262 ms); 100 ranges of 1 MiB about 12 to 15 ms each; range hashes identical across passes | yes (semantics), no (latency) |
| R7 | The body is a stream | "Retrieves the R2ObjectBody for the given key containing object metadata and the object body as a ReadableStream, if the key exists, and null if the key does not exist." | R2-API | S5: streaming a 100 MiB object chunk by chunk took 1.7 s, +7 MB RSS | partly |
| R8 | `head` | "Retrieves the R2Object for the given key containing only object metadata, if the key exists, and null if the key does not exist." | R2-API | S8: 1,100 `head()` calls fine | yes |
| R10 | Writes are strongly consistent | "R2 writes are strongly consistent. Once the Promise resolves, all subsequent read operations will see this key value pair globally." | R2-API | n/a | no |
| R11 | Multipart part rules | "Minimum part size: 5 MiB (except for the last part)" and "Maximum part size: 5 GiB" and "Maximum number of parts: 10,000" and "All parts except the last must be the same size" | R2-UP | S5: 10 parts of 10 MiB completed (3.0 s, 178 to 403 ms per part); three parts of 1 MiB uploaded but `complete()` failed (EntityTooSmall, code 10011) so the 5 MiB minimum is checked at completion; parts of 6, 6 and 7 MiB failed at `complete()` (code 10048) | yes |
| R12 | Binding wording on part size | "Each part must be uniform in size with an exception for the final part which can be smaller." | R2-API | S5: as R11 (the last part may not be larger) | yes |
| R14 | Abandoned uploads | "Incomplete multipart uploads are automatically aborted after 7 days by default." and "Abort on failure so incomplete uploads do not count against storage" | R2-UP | not run | no |
| R15 | Completion makes the object visible | "Once this happens, the object is immediately accessible globally by any subsequent read operation." | R2-API | S5: yes locally | yes |
| R17 | The client holds the multipart state | "In most cases, the multipart state (the uploadId and uploaded part ETags) is tracked by the client sending requests to your Worker." | R2-UP | n/a | n/a |
| R19 | Presigned URLs | "Timeout from 1 second to 7 days (604,800 seconds)" and "cannot be used with custom domains." and "Treat presigned URLs as bearer tokens. Anyone with the URL can perform the specified operation until it expires." and "POST (multipart form uploads via HTML forms) is not currently supported." | R2-PRESIGN | not run | no |
| R20 | A browser upload to R2 needs CORS | "When a browser makes a request to a presigned URL on a different origin, the browser enforces CORS. Without a CORS policy, browser-based uploads and downloads using presigned URLs will fail, even though the presigned URL itself is valid." and "Expired presigned URLs return a 403 ExpiredRequest response. R2 does not include CORS response headers on expired presigned URL responses, so browser JavaScript cannot read the error body." | R2-PRESIGN, R2-CORS | not run | no |
| R23 | Price | "Storage / $0.015 / GB-month / $0.01 / GB-month" and "Class A Operations / $4.50 / million requests / $9.00 / million requests" and "Class B Operations / $0.36 / million requests / $0.90 / million requests" and "There are no charges for egress bandwidth for any storage class." | R2-PRICE | n/a | n/a |
| R24 | Which calls are Class A and B | "Class A Operations include ListBuckets, PutBucket, ListObjects, PutObject, CopyObject, CompleteMultipartUpload, CreateMultipartUpload, LifecycleStorageTierTransition, ListMultipartUploads, UploadPart, UploadPartCopy, ListParts, PutBucketEncryption, PutBucketCors and PutBucketLifecycleConfiguration." and "Class B Operations include HeadBucket, HeadObject, GetObject, UsageSummary, GetBucketEncryption, GetBucketLocation, GetBucketCors and GetBucketLifecycleConfiguration." and "Free operations include DeleteObject, DeleteBucket and AbortMultipartUpload." | R2-PRICE | n/a | n/a |

The pages state no per-bucket or per-object read rate, and no rate for ranged reads separate from `GetObject` (R24 lists `GetObject` once, in Class B).

### 2.4 Service bindings and RPC

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| B1 | A binding call is a subrequest | "Each request to a Worker via a Service binding counts toward your subrequest limit." | W-SB | not run (S8 enforces no subrequest limit) | no |
| B2 | 32 invocations per request | "A single request has a maximum of 32 Worker invocations, and each call to a Service binding counts towards this limit. Subsequent calls will throw an exception." | W-SB (the only page that states it) | not run | no |
| B3 | A binding call and the connection limit | "Calling a service binding does not count towards simultaneous open connection limits" (W-SB) against "The runtime measures simultaneous open connections from the top-level request. Workers triggered via Service bindings share the same connection limit." (W-LIM) | W-SB, W-LIM | not run | no |
| B4 | Same thread by default | "By default, both Workers run on the same thread of the same Cloudflare server." | W-SB | S7: colocated locally | no |
| B6 | RPC payload limit | "The maximum serialized RPC limit is 32 MiB. Consider using ReadableStream when returning more data." | W-RPC | S7: `Uint8Array` of 31 MiB passes as argument (98 ms) and as return (44 ms); 32 MiB and above fail in both directions with the local runtime's message `Serialized RPC arguments or return values are limited to 32MiB, but the size of this value was: 33554452 bytes.`; the 100 MiB case took 0.9 to 1.2 s to fail (checked after serializing) | yes |
| B7 | Streams are exempt and flow-controlled | "You can send and receive ReadableStream, WritableStream, Request, and Response using RPC methods. When doing so, bytes in the body are automatically streamed with appropriate flow control. This allows you to send messages over RPC which are larger than the typical 32 MiB limit" | W-RPC | S7: `ReadableStream` of 40 MiB and 200 MiB, returned and passed as argument, all succeeded (200 MiB in 0.8 to 0.9 s, 1 MiB chunks); whole-process RSS 350 to 480 MB | yes (semantics) |
| B8 | Ownership and `tee` | "In all cases, ownership of the stream is transferred to the recipient. The sender can no longer read/write the stream after sending it." and "Keep in mind that doing this may force the system to buffer bytes and lose the benefits of flow control." | W-RPC | not run | partly |
| B10 | A stub does not outlive its execution context | "Currently, this proxying only lasts until the end of the Workers' execution contexts. A proxy connection cannot be persisted for later use." | W-RPC | not run | no |
| B11 | Billing across a binding | "Requests made from your Worker to another worker via a Service Binding do not incur additional request fees." and "The total amount of CPU time used across both Worker A and Worker B" | W-PRICE | n/a | n/a |

Whether the callee has its own 128 MB isolate and its own CPU budget is not stated on any page read: the only statements are B4 and the billing sentence in B11 (section 4, G4).

### 2.5 Cron Triggers

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| CR1 | UTC | "Cron Triggers execute on UTC time." | W-CRON | n/a | n/a |
| CR2 | Run on spare capacity | "Workers scheduled by Cron Triggers will run on underutilized machines to make the best use of Cloudflare's capacity and route traffic efficiently." | W-CRON | n/a | no |
| CR3 | Changes take up to 15 minutes to propagate | "Changes such as adding a new Cron Trigger, updating an old Cron Trigger, or deleting a Cron Trigger may take several minutes (up to 15 minutes) to propagate to the Cloudflare global network." | W-CRON | n/a | no |
| CR4 | How many | "Number of Cron Triggers per account / 5 / 250" | W-LIM | n/a | n/a |
| CR5 | CPU and wall | row W12 and "Scheduled Workers have a maximum wall time of 15 minutes per invocation." | W-LIM | not run | no |
| CR7 | Shortest interval shown | The page states no minimum. Its first example is "At every minute". | W-CRON | not run | no |
| CR8 | Missed, overlapping or failed firings | Not stated on W-CRON or W-SCHED: no sentence on whether a missed firing is made up, whether two firings may overlap, or whether a failed handler is retried. The page names a local-test field only. | W-CRON, W-SCHED | not run | no |

### 2.6 Queues

All rows are from pages last updated Apr 21, 2026 unless the page key says otherwise (section 0). The consumer's own limits (wall time, CPU) are in W17 and Q6.

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| Q1 | Message size | "Message size / 128 KB" and "1 KB is measured as 1000 bytes. Messages can include up to ~100 bytes of internal metadata that counts towards total message limits." | Q-LIM | not run | partly |
| Q4 | Backlog and retention | "Per-queue backlog size / 25GB" and "Message retention period / Configurable up to 14 days." and "Individual queues that reach this limit will receive a Storage Limit Exceeded error when calling send() or sendBatch() on the queue." | Q-LIM | not run | no |
| Q5 | Concurrency | "Concurrent consumer invocations / 250" (the cell carries the note push-based only) and "Set Maximum consumer invocations to a value between 1 and 250." and "By default, all queues have concurrency enabled." | Q-LIM, Q-CONC | not run | no |
| Q6 | Consumer wall time and CPU | "Consumer duration (wall clock time) / 15 minutes" and "Consumer CPU time / Configurable to 5 minutes" and "By default, the maximum CPU time per consumer Worker invocation is set to 30 seconds, but can be increased by setting limits.cpu_ms in your Wrangler configuration" | Q-LIM | not run | no |
| Q8 | Retries | "Message retries / 100" and "the default behaviour is to retry delivery three times before marking the delivery as failed. You can set max_retries (defaults to 3) when configuring your consumer" | Q-LIM, Q-BATCH | not run | no |
| Q9 | A failed message retries the whole batch | "When a single message within a batch fails to be delivered, the entire batch is retried, unless you have explicitly acknowledged a message (or messages) within that batch." and "Messages that are explicitly acknowledged will not be re-delivered, even if your queue consumer fails on a subsequent message and/or fails to return successfully when processing a batch." | Q-BATCH | not run | no |
| Q10 | Delivery guarantee | "Queues provides at least once delivery by default in order to optimize for reliability." and "messages are guaranteed to be delivered at least once, and in rare occasions, may be delivered more than once." | Q-DELIV | not run | no |
| Q11 | Dead-letter queue | "Without a DLQ configured, messages that reach the retry limit are deleted permanently." and "Messages delivered to a DLQ without an active consumer will persist for four (4) days before being deleted from the queue." | Q-DLQ | not run | no |
| Q14 | Price | "An operation is counted for each 64 KB of data that is written, read, or deleted." and "In most cases, it takes 3 operations to deliver a message: 1 write, 1 read, and 1 delete." and "Each retry incurs a read operation." and "1,000,000 operations/month included + $0.40/million operations" and "There are no data transfer (egress) or throughput (bandwidth) charges." | Q-PRICE | n/a | n/a |

### 2.7 Workflows

Workflows are Workers: "Workflows are Worker scripts, and share the same per invocation CPU limits as any Workers do." (WF-LIM). The Workflows pages state no memory figure for a step; that a step has 128 MB is inference from this sentence and W1 (section 4, G14). Billing for steps and storage began 2026-08-10, before the read date.

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| WF1 | Step compute and wall time | "Compute time per step / 10 ms / 30 seconds (default) / configurable to 5 minutes of active CPU time" and "Each step can run for an unlimited wall time. Individual steps are subject to the configured CPU time limit." | WF-LIM | not run | no |
| WF2 | A step's result is at most 1 MiB | "Maximum non-stream step result per step / 1MiB (2^20 bytes) / 1MiB (2^20 bytes)" and "A non-stream step.do() return value can persist up to 1 MiB (2^20 bytes). If your step returns structured data exceeding this limit, the step will fail." | WF-LIM, WF-RULES | not run | no |
| WF3 | Larger output as a byte stream, or elsewhere | "In JavaScript Workflows, if you need to persist large binary output from a step, return a ReadableStream<Uint8Array>." and "Streamed outputs still count toward the per-instance storage limit, so store very large or long-lived artifacts in external storage such as R2 and return a reference when appropriate." and "Keep individual chunks under 16 MB." and "BYOB streams and BYOB readers are not supported." | WF-LIM, WF-RULES | not run | no |
| WF4 | State per instance | "Maximum state that can be persisted per Workflow instance / 100MB / 1GB" | WF-LIM | not run | no |
| WF5 | Steps per Workflow | "Maximum steps per Workflow / 1,024 / 10,000 (default) / configurable up to 25,000" and "step.sleep and step.sleepUntil methods do not count towards the maximum Workflow steps limit." | WF-LIM, WF-API | not run | no |
| WF6 | Concurrency | "Concurrent Workflow instances (executions) per account / 100 / 50,000" and "Only instances with a running state count towards the concurrency limits. Instances in the waiting state are excluded from these limits." and (contradicting the table) "if there are 10,000 concurrent instances actively running, an instance that has been in a waiting state will be queued instead of resuming immediately." | WF-LIM | not run | no |
| WF10 | Retries and timeouts | "Maximum number of retries per step / 10,000 / 10,000" and "The total number of attempts to make for a step (limited to 10,000 retries per step)" and "When to timeout (in duration) before considering the step as failed (including during a retry attempt, as the timeout is set per attempt)" and "When setting a WorkflowStep timeout, ensure that its duration is 30 minutes or less." | WF-LIM, WF-SLEEP, WF-RULES | not run | no |
| WF11 | Durable execution | "Steps may emit (optional) state that allows a Workflow to persist and continue from that step, even if a Workflow fails due to a network or infrastructure issue." and "Because a step might be retried multiple times, your steps should (ideally) be idempotent." | WF-RULES | not run | no |
| WF12 | A restarted engine redoes the step | "Do not do too much CPU-intensive work inside a single step - sometimes the engine may have to restart, and it will start over from the beginning of that step." and "Workflows may hibernate and lose all in-memory state." and "If the engine restarts, the step logic will be preserved, but logic outside of the steps may be duplicated." | WF-RULES | not run | no |
| WF15 | Price | the Paid cells "10 million included per month + $0.30 per additional million" (requests), "1 GB-month included + $0.20/ GB-month" (storage) and "500,000 included per month + $0.80/ additional 100,000 per month" (steps) and "Step count does not include rollback handlers or retries." | WF-PRICE | n/a | n/a |
| WF17 | What the pages do not say about deploys | No Workflows page read says what a running step does when a new Worker version is deployed; the closest text is WF12. | WF-RULES | not run | no |

### 2.8 Containers

Containers need Workers Paid. A Container class is a Durable Object class (C6, C17), so rows D1 to D38 also bear on the object that fronts a container. Local runs: not run (no container runtime was started; the lane's spikes cover Workers, Durable Objects, R2 and RPC only).

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| C1 | Plan | "Available on Workers Paid plan" | C-OV | n/a | n/a |
| C2 | Instance types | "lite / 1/16 / 256 MiB / 2 GB" and "basic / 1/4 / 1 GiB / 4 GB" and "standard-1 / 1/2 / 4 GiB / 8 GB" and "standard-2 / 1 / 6 GiB / 12 GB" and "standard-3 / 2 / 8 GiB / 16 GB" and "standard-4 / 4 / 12 GiB / 20 GB" (columns: type, vCPU, memory, disk) | C-LIM | not run | no |
| C3 | Custom ceiling | "Maximum vCPU / 4" and "Maximum Memory / 12 GiB" and "Maximum Disk / 20 GB" and "Memory to vCPU ratio / Minimum 3 GiB memory per vCPU" | C-LIM | not run | no |
| C6 | Reached only through its Durable Object | "A Container can only be accessed through its Durable Object. A Worker sends a request to the Durable Object, which accesses the Container through ctx.container." | C-ARCH | not run | no |
| C7 | What stops an instance | "An inactivity timeout, signal(), destroy(), a rollout, or a process exit can stop the instance." | C-ARCH | not run | no |
| C9 | Cold start | "Container cold starts can often be in the 1-3 second range, but this is dependent on image size and code execution time, among other factors." | C-ARCH | not run | no |
| C10 | No fixed maximum runtime, but no promise either | "Cloudflare does not stop a container instance after a fixed maximum runtime." and "Another platform event can stop an active container. For example, a host server restart happens on an irregular cadence. Cloudflare does not guarantee that any container instance will run for a set period." | C-FAQ | not run | no |
| C11 | Stop sequence | "Sends SIGTERM to the main process in the container." and "Waits up to 15 minutes for that process to exit." and "Sends SIGKILL if the process is still running." | C-ARCH | not run | no |
| C12 | Disk is ephemeral; memory overrun restarts the instance | "All disk is ephemeral by default. When a Container instance goes to sleep, the next time it starts, it uses a fresh disk from the container image." and "If you run out of memory, your instance will throw an Out of Memory (OOM) error and will be restarted." and "Containers do not use swap memory." | C-FAQ | not run | no |
| C13 | Snapshots and the scheduling policy | "Snapshots capture the Container's complete filesystem state, but not its memory or running processes." and "Applications that use the default scheduling policy cannot create or restore snapshots." and "The durable_object scheduling policy is in public beta." and "Maximum snapshot size / 20 GB" and "Snapshot retention / 30 days from creation or the most recent restore" | C-SNAP, C-FAQ, C-SCHED, C-LIM | not run | no |
| C14 | A deploy does not finish with the deploy command | "Deploy success means the rollout started, not that every container instance has finished replacing." and "When the image changes, new Worker code can still reach container instances on the previous image until the rollout finishes." and "Durable Object-managed Container instances do not participate in application-wide rollouts; application code selects their image when it calls ctx.container.start()." | C-ROLL | not run | no |
| C15 | The inactivity timeout does not survive a Durable Object restart | "A Durable Object that restarts, for example after a deploy, starts without one. Set the timeout after start(), and set it again in the constructor when the container is already running." | C-DOAPI | not run | no |
| C16 | `exec` | "exec() has no built-in timeout." and "output() holds all of the output in the memory of the Durable Object, where it counts toward the memory limit. When output can be large, read both streams concurrently instead." | C-DOAPI | not run | no |
| C17 | The Container class owns the alarm | "The Container class uses the alarm handler to manage the container lifecycle, so use schedule() instead." | C-CLASS | not run | no |
| C18 | A container reaches R2 through an outbound handler, or FUSE | "Containers can access Workers bindings — KV, R2, D1, Durable Objects, and others — through outbound handlers." and "Though you should not expect native SSD-like performance while using FUSE." | C-CONN, C-FAQ | not run | no |
| C21 | Price | "Containers are billed for every 10ms that they are actively running" and "Workers Paid / 25 GiB-hours/month included +$0.0000025 per additional GiB-second / 375 vCPU-minutes/month + $0.000020 per additional vCPU-second / 200 GB-hours/month +$0.00000007 per additional GB-second" (memory, CPU, disk) | C-PRICE | n/a | n/a |
| C22 | What is billed | "Memory and disk usage are based on the provisioned resources for the instance type you select, while CPU usage is based on active usage only." and "charges start when a request is sent to the container or when it is manually started. Charges stop after the container instance goes to sleep" and "each container has its own Durable Object. You are billed for your usage of both Workers and Durable Objects." | C-PRICE | n/a | n/a |

### 2.9 Browser Run (formerly Browser Rendering)

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| BR1 | Limits on Workers Paid | "Browser hours / No limit" and "Concurrent browsers per account (Browser Sessions only) / 200 per account" and "New browser instances per second (Browser Sessions only) / 3 per second" and "Browser timeout / 60 seconds" and "Total requests per second (Quick Actions only) / 30 per second" | BR-LIM | not run | no |
| BR2 | Timeout and keep-alive | "you can use the keep_alive option, which allows you to extend the timeout to up to 20 minutes." and "There is no fixed maximum lifetime for a browser session as long as it remains active." | BR-LIM | not run | no |
| BR3 | What it does | "Use Browser Run Quick Actions HTTP endpoints to capture screenshots, extract HTML, generate PDFs, and perform other common browser tasks." and "Generate a PDF from a webpage or custom HTML" | BR-OV, BR-LLMS | not run | no |
| BR4 | Price | the Paid cells "10 hours per month, then $0.09 per additional hour" (browser hours) and "10 browsers (averaged monthly), then $2.00 per additional browser" (concurrent browsers) | BR-PRICE | n/a | n/a |

Nothing read documents Browser Run as a reader of an uploaded PDF or sheet: its endpoints render a web page or supplied HTML into output.

### 2.10 Workers AI document conversion (`env.AI.toMarkdown`)

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| AI1 | What it is | "Workers AI provides the toMarkdown utility method that developers can use from the env.AI binding or the REST APIs for quick, easy, and convenient conversion and summary of documents in multiple formats to Markdown language." | AI-MD | not run | no |
| AI2 | Price | "toMarkdown is free for most format conversions. In some cases, like image conversion, it can use Workers AI models for object detection and summarization, which may incur additional costs if it exceeds the Workers AI free allocation limits." and "priced at $0.011 per 1,000 Neurons" and "10,000 Neurons per day at no charge" | AI-MD, AI-PRICE | n/a | n/a |
| AI3 | Supported formats | the page's table of format and extensions: PDF Documents (.pdf); Microsoft Office Documents (".xlsx, .xlsm, .xlsb, .xls, .et, .docx"); Open Document Format (`.ods, .odt`); CSV (`.csv`); Apple Documents (`.numbers`); Images (".jpeg, .jpg, .png, .webp, .svg, .gif, .bmp"); HTML Documents (`.html, .htm`); XML Documents (`.xml`) | AI-FMT | not run | no |
| AI4 | A PDF is read page by page, text only | "Each page is parsed in sequence." and "If none is obtained, we extract the text of the page as-is and return it." No OCR step is described for a PDF. | AI-HOW | not run | no |
| AI5 | An image gets a description | "The image is sent to an object-detection model." and "For animated GIF files, only the first frame is extracted and analyzed." The page describes models that detect objects and summarize; it does not describe text transcription of an image. | AI-HOW | not run | no |
| AI6 | The input is a whole Blob | The page's own example builds the input as `new Blob([await pdf.arrayBuffer()], ...)`, so the whole file passes through the Worker's memory (inference from the example; no sentence says so). | AI-BIND | not run | no |
| AI7 | No size, page or time limit is documented | Not stated on AI-MD, AI-BIND, AI-HOW, AI-FMT or the conversion-options page. | none | not run | no |
| AI8 | Data handling is the product's, not toMarkdown's | "Workers AI processes Customer Content only for as long as needed to provide the service." and "Cloudflare does not use Customer Content processed by Workers AI to train AI models." | AI-DATA | n/a | n/a |

### 2.11 D1, Vectorize and Images (briefly)

| id | fact | verbatim quote | page | local measurement | local models it? |
|---|---|---|---|---|---|
| X1 | D1 size and row | "Maximum database size / 10 GB (Workers Paid) / 500 MB (Free)" and "Maximum string, BLOB or table row size / 2,000,000 bytes (2 MB)" and "Maximum SQL query duration / 30 seconds" and "1000 (Workers Paid) / 50 (Free)" (queries per Worker invocation) | D1-LIM | not run (the row size is the same as D33 and enforced locally for Durable Object SQLite) | partly |
| X2 | D1 is single-threaded | "Each individual D1 database is inherently single-threaded, and processes queries one at a time." | D1-LIM | not run | no |
| X5 | Images binding input cap | "Accepts image bytes up to 20 MB from any source" and "the maximum input size for .input() is 20 MB." | IMG-BIND, IMG-LIM | not run | no |
| X6 | Images file size by path | "The following limits apply when transforming a remote image stored outside of Images:" (table row "Image file size / 100 MB") and "The following limits apply when uploading to your Images storage:" (table row "Image file size / 10 MB") | IMG-LIM | not run | no |

The pages read give no byte limit for an image read as a stream by Civicsmith's own code; X5 and X6 matter only if the Images binding is used (a 50 MB image exceeds the 20 MB binding input).

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

