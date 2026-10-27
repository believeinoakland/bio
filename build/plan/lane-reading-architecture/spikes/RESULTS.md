# Local platform spikes (workerd / Miniflare) for READING-ARCHITECTURE

Run 2026-10-23 on a shared 4-core / 16 GB Linux box (Node v26.10.0). `workerd 2026-07-22` (raw, via capnp config modelled on `test/m/pdf-reader/workerd-ceiling.probe.mjs`), Miniflare 4.20260722.0 (same workerd binary), compatibilityDate 2026-07-01, `nodejs_compat`. Nothing in /home/user/bio was changed; nothing deployed; no Cloudflare account reached. Scripts: `spikes/src/`, raw output: `spikes/results/`, generated data: `spikes/data/`.

Cloudflare's published numbers (128 MB isolate, 32 MiB RPC, 1000/10000 subrequests, 6 connections, 2 MB SQLite row, 100 KB statement, 50-byte LIKE, 5 MiB multipart minimum, alarm retries) are NOT re-fetched here. Where a "platform expects" line appears it is from memory of the docs and is for the PLATFORM.md author to verify and quote. Everything under "Measured" was observed in this session.

Summary table

| # | Topic | Local models the platform? |
|---|-------|----------------------------|
| 1 | 128 MB isolate memory | **no** (only a V8 old-space flag, raw workerd only; it kills the whole process) |
| 2 | CPU limit | **no** (nothing enforced, silently ignored options) |
| 3 | DO alarms | **yes** for retry/re-arm/persistence semantics; timings are local |
| 4 | DO SQLite limits | **yes** for limits; timings/size only indicative |
| 5 | R2 | **yes** for API shape and multipart rules; **partly** for memory/latency |
| 6 | Request body | **no** for size limits (none enforced); **yes** for streaming-with-length semantics |
| 7 | RPC | **yes** (32 MiB enforced, streams unbounded) |
| 8 | Subrequests/connections | **no** (nothing enforced) |

---

## 1. Memory: is the 128 MB isolate limit enforced locally?

**Setup.** Raw workerd, one worker, endpoints that retain allocations in a module-level array so they cannot be collected. Four runs of each case: no flag, `v8Flags=["--max-old-space-size=N"]` for N = 64, 128, 256 (capnp `v8Flags` on the Config, as in the repo probe). Each case in a fresh workerd process; failure judged from the HTTP result, the process exit status and workerd's log. Script `src/s1-memory.mjs`, data `results/s1.jsonl`.

**Measured.**

(a) One large `Uint8Array` (filled, 64 / 128 / 200 MB; also an unfilled 200 MB; also 50 x 8 MB = 400 MB of separate touched buffers): **succeeded in every flag setting, including `--max-old-space-size=64`**. Process RSS rose by about the buffer size (64 MB: 107 MB RSS; 128 MB: 170; 200 MB: 243; 400 MB: 443). Untouched (unfilled) buffers were resident too (242 MB RSS), so allocation was not lazy-zero in this environment. Conclusion: ArrayBuffer backing stores are off-heap and **do not count against V8 old-space**; the flag cannot see them. Nothing local limits them at 128 MB; workerd allowed a single 400 MB worker.

(b) JS heap objects (array of `{a, b:"x"+i}`; the "mb" is a nominal 64 B/object estimate, real heap use differs, so read the pass/fail boundary, not the label):

| flag | nominal 60 | 100 | 150 | 300 |
|------|-----------|-----|-----|-----|
| none | ok (RSS 133) | ok (196) | ok (249) | ok (391) |
| old-space=64 | ok (132) | **crash** | **crash** | **crash** |
| old-space=128 | ok (134) | ok (193) | ok (232) | **crash** |
| old-space=256 | ok | ok | ok | ok (340) |

**How it fails.** Not an exception the worker can catch: V8 prints `fatal: V8 fatal error; location = Reached heap limit; message = : allocation failed: JavaScript heap out of memory`, workerd gets SIGABRT and **the whole workerd process exits (code 1)**; the client sees a dropped socket (`UND_ERR_SOCKET`). Every worker, Durable Object and in-flight request in that process dies with it. A `try/catch` around the allocation never runs.

(c) A string-retention test (`"a".repeat(1024) + i` x N) was invalid: V8 kept them as ropes and RSS stayed at 62-79 MB. Disregard it; it shows nothing.

**Verdict: local models the 128 MB limit: NO (partly, only as a tool).** The one usable local knob is `--max-old-space-size`, and it models only the JS heap, not backing stores; it is process-wide, not per isolate; and its failure mode (process abort) is harsher than production. For this lane that means: the repo's probe technique (bisect the smallest old-space in which a read completes, then add the file's bytes) is the right way to produce a *heap* figure, and the *bytes* must be added by hand because backing stores are not counted. Miniflare exposes no v8Flags option (only the `unsafe*` family); the cap is available only via raw workerd.

**Only the live platform shows:** whether Cloudflare's 128 MB is measured as heap + ArrayBuffers + wasm memory (the "object limit 128" in the repo probe treats it as heap + bytes; local runs cannot confirm that); the actual failure (exceeded-memory error 1102 resets that isolate, other requests on it fail) and whether retained buffers are reclaimed in time; how many concurrent requests share one isolate and so share the 128 MB; the real baseline of the deployed bundle.

---

## 2. CPU: does workerd/Miniflare enforce a CPU limit?

**Setup.** Miniflare, a pure-JS busy loop (`x=(x*31+i)%1000003`, 7.6e9 iterations; calibrated beforehand at 5.2 s per 1e9 so intended as about 40 s), in (a) a `fetch` handler, (b) a Durable Object `alarm()` (SQLite-backed DO, persisted). Also tried Miniflare options `cpuMs: 50` and `limits: {cpu_ms: 50}`. Script `src/s2-cpu.mjs`, `src/s2b.mjs`, `results/s2.txt`.

**Measured.**
- Fetch handler: completed with HTTP 200 after **90.4 s** of wall clock (more than the planned 40 s; another process on the machine was competing, load average about 1). `Date.now()` and `performance.now()` both advanced by 90,448 ms inside the synchronous loop (local workerd does not freeze the clock during CPU work).
- DO alarm: ran to completion; start/end timestamps 111,029 ms apart; no exception recorded.
- Option check: Miniflare **accepts** `cpuMs` and `limits.cpu_ms` without error, but also accepts a completely bogus key (`totallyBogusOption`), so unknown options are silently stripped and the "acceptance" means nothing. `cpu_ms` appears in Miniflare only inside the wrangler-config validator; workerd.capnp has no CPU limit field (grep for cpu/limits finds only cache limits). Neither option had any effect (the loop above ran with them absent; the options were tried on separate throwaway instances only to check acceptance, not combined with the 90 s run).

**Verdict: NO.** No CPU limit exists locally, in fetch or alarm. A local run that completes proves nothing about the 30 s default / configurable CPU cap.

**Only the live platform shows:** the actual CPU-time cut (exceededCpu, 30 s default for HTTP and alarms; configurable ceiling), whether CPU time is counted per request or per invocation, how time awaiting I/O is excluded, and what a killed invocation leaves behind. Design implication: any CPU budget must be enforced by the code itself with its own work counters, not by a local test; on the platform, `Date.now()` is frozen between I/O, so a work-counter budget is the only portable measure.

---

## 3. Durable Object alarms in Miniflare

**Setup.** Miniflare, SQLite-backed DO, `durableObjectsPersist` = `spikes/data/s3-<ts>`; alarm handler logs every invocation (including the argument it receives) through a Node-side function service binding so logs survive a throw. Script `src/s3-alarms.mjs`, `results/s3.txt`.

**Measured.**
- **Argument passed.** `alarm(info)` receives `{scheduledTime, retryCount, isRetry}`. First run: `retryCount:0, isRetry:false`; retries: `retryCount:1..6, isRetry:true`; `scheduledTime` is the same on every retry (the original).
- **Throwing handler.** 7 invocations total (1 + 6 retries) observed. Times since arming (s): 0.2, 2.3, 6.7, 14.9, 31.8, 69.6, 138.0; gaps 2.1, 4.4, 8.2, 16.8, 37.8, 68.5 s: roughly doubling from about 2 s (with jitter). Observation window ended at the 7th call (138 s); I did not wait for a possible 8th, so "6 retries then give up" is inferred from the retryCount reaching 6 and the doubling pattern, not observed to stop.
- **Alarm set in the past** (`setAlarm(Date.now()-5000)`): fires immediately (within about 20 ms), `retryCount:0`.
- **setAlarm inside the handler re-arms:** yes. A handler that re-armed 500 ms ahead ran 4 times at 0.5 s spacing, each with `retryCount:0`. Inside the handler `getAlarm()` returns `null` (the current alarm is cleared when the handler starts).
- **Persistence across dispose and restart** (same persist dir): (i) alarm due +25 s, instance disposed at +3 s, restarted after 40 s: alarm fired **the instant the new instance became ready** (overdue), `retryCount:0`. (ii) alarm due +20 s, disposed at +2 s, restarted at +5 s (not yet due): fired on schedule at the original time (+20 s). So pending alarms are persisted, survive a Miniflare restart, and overdue alarms run on first start.

**Verdict: yes** for semantics (retry count, `isRetry`, past alarm, re-arm, persistence). Retry spacing matches what I recall of the docs (up to 6 retries, exponential backoff starting at 2 s): the PLATFORM.md author should confirm against the docs.

**Only the live platform shows:** alarm latency and jitter at scale; behaviour when the whole isolate is killed (memory/CPU) mid-alarm and when the machine hosting the DO moves; whether storage writes made before a throw are rolled back (the writes in my handler were not what I measured: `n` counted correctly across retries, which indicates the pre-throw `put` of the counter *persisted* across the throw here, but that is a local-storage behaviour to re-check); at-least-once duplication; wall-clock alarm precision (docs promise only "at or after"); the guarantee after a deploy.

---

## 4. DO SQLite in Miniflare

**Setup.** Miniflare SQLite-backed DO, `ctx.storage.sql.exec`. Script `src/s4-sql.mjs`, `results/s4.jsonl`.

**Measured: value and row size.**
| Case | Result |
|------|--------|
| BLOB 1.9 MB (1,992,294 B) | ok |
| BLOB 2.0 MiB (2,097,152 B) | ok |
| BLOB 2.1 MB (2,202,009 B) | `Error: string or blob too big: SQLITE_TOOBIG` |
| BLOB 10 MB | `SQLITE_TOOBIG` |
| TEXT 1.9 MB | ok; TEXT 2.1 MB and 10 MB: `SQLITE_TOOBIG` |
| row with TEXT 1.5 MB + BLOB 1.5 MB (3 MB row) | `SQLITE_TOOBIG` (so the limit is also applied to the row, not only per value) |
| read back a 1.9 MB BLOB | ok (`byteLength` 1,992,294) |

So the 2 MB (2,097,152 B) limit **is enforced locally**; the exact edge is 2 MiB inclusive for a single value; a row summing past it also fails (I tested 3 MB, not the exact row-sum edge).

**Statement length.** Padded `SELECT 1`: 50,000 and 100,000 chars ok; 102,400 (100 KiB) and above: `statement too long: SQLITE_TOOBIG`. Literal-bearing statement: 1,019 chars ok; 100,000-char literal (statement above 100 KB): `statement too long`. Limit lies between 100,000 and 102,400: consistent with 100 KB; I did not bisect the exact byte.

**LIKE/GLOB pattern.** Pattern of 50 bytes ok; 51 bytes and above: `LIKE or GLOB pattern too complex: SQLITE_ERROR` (applies to bound parameters and literals, and to GLOB). Enforced exactly at 50.

**Bulk insert, 100,000 rows x 1 KB BLOB** (in the DO, server-side timing from `Date.now()`; shared machine):
| Method | ms |
|--------|----|
| one `transactionSync` for all 100,000 `exec` calls | 611 |
| 1000-row `transactionSync` batches | 668 |
| 100-row batches | 642 |
| multi-row `INSERT ... VALUES (?),(?)...` 50 per statement (autocommit) | 204 |
| 100,000 separate `exec`, no explicit transaction | 530 |

All local; no meaningful difference between one transaction and batches (locally the DO coalesces implicit writes). `ctx.storage.sql.databaseSize` after the 100,000 x 1 KB rows: **142,974,976 bytes (about 136.3 MiB)** vs 102.4 MB raw payload, i.e. about 1.4x: three 1 KB values fit a 4 KiB page, the rest is page slack. After `DELETE FROM r` the size returned to its pre-insert value (6,103,040 B, which at that moment included a few MB of earlier test rows), so freed pages are given back locally.

**Verdict: yes** for the hard limits (2 MB value/row, 100 KB statement, 50-byte LIKE). **Partly** for sizing and speed.

**Only the live platform shows:** the storage-size cap per DO (10 GB) and the per-account cap; billing of rows read/written; real write latency (output gates and replicated durable commit; locally 100k rows take half a second); whether `databaseSize` on the platform counts the same pages; behaviour of very large transactions; memory of the SQLite cache against the 128 MB isolate (local workerd RSS rose from 92 to 129 MB through this spike, but that is the whole process, not one isolate).

---

## 5. R2 in Miniflare

**Setup.** Miniflare `r2Buckets` with `r2Persist` in spikes/data; all object bytes are produced inside the Worker (a patterned `Uint8Array`, no input). Process RSS = sum over workerd child processes, sampled every 40 ms from Node. Script `src/s5-r2.mjs`, `results/s5.jsonl`.

**Measured: multipart.**
- 10 parts of 10 MiB = 100 MiB (`createMultipartUpload`/`uploadPart`/`complete`): ok, total 3.0 s, per part 178-403 ms (the 10 MiB part is held in a Worker `Uint8Array` while uploading), `complete` 5 ms; object size 104,857,600.
- 3 parts of 1 MiB: `uploadPart` ok on all three, but **`complete()` fails**: `Your proposed upload is smaller than the minimum allowed object size. (10011)` = EntityTooSmall. So Miniflare enforces the 5 MiB minimum, **at completion, for every part but the last**, not at `uploadPart`.
- A single part of 1 MiB (it is the last part): ok.
- Parts 6 MiB, 6 MiB, 7 MiB (last larger than the others): `complete()` fails with `There was a problem with the multipart upload. (10048)`; Miniflare also requires all non-last parts to be the same size and the last part not larger. (R2's documented rule: equal-size parts; verify wording in docs.)
- Source of the 5 MiB constant: `R2Limits.MIN_MULTIPART_PART_SIZE = 5242880` in `miniflare/dist/src/workers/r2/bucket.worker.js` (also `MAX_VALUE_SIZE 5363466240`, `MAX_KEY_SIZE 1024`, `MAX_METADATA_SIZE 2048`, `MAX_LIST_KEYS 1000`).

**Measured: put of a 100 MiB stream.** `R2.put(key, fixedLengthStream.readable)` with `FixedLengthStream(104857600)` fed 1 MiB chunks: ok, 3.2 s, RSS +38 MB.

**Measured: ranged reads.** `get(key,{range:{offset,length}})` then `arrayBuffer()`, sequential, 13 ranges of 8 MiB (last 4 MiB):
- Pass 1 per-range ms: 291, 132, 104, 136, 155, 161, 158, 150, 163, 94, 89, 95, 47 (sum 1,775 ms, about 8 ms per MiB with SHA-256 of each range).
- Pass 2 (warm): 111, 90, 95, 139, 115, 87, 87, 92, 134, 91, 88, 89, 44 (sum 1,262).
- 100 ranges of 1 MiB: about 12-15 ms each (a few 20-36 ms spikes), so per-call overhead is small relative to 8 MiB ranges.
- Range hashes identical on both passes (data consistent).
- Streaming the whole object chunk by chunk (reader loop): 1.7 s.
- **Memory (process RSS, which includes Miniflare's R2 and storage workers, not just the user Worker; it cannot isolate a single isolate):** 13 x 8 MiB ranges added +36 MB peak on pass 1 and +17 MB on pass 2; streaming the whole 100 MiB added +7 MB; `await r2.get(key).arrayBuffer()` of the whole object added **+233 MB peak** (278 -> 511 MB; 445 MB retained afterwards until GC). The base RSS also climbed steadily (58 -> 171 MB after the first 100 MiB write -> 229 MB after the second), which is retained write-side buffering/page cache in that process and is not attributable to the user Worker.

So: ranged and streamed reads stay roughly bounded (tens of MB above baseline, independent of object size); a whole-object `arrayBuffer()` costs about 2.3x the object. That relation is a good local signal. It does **not** prove the user Worker stayed under 128 MB, because there is no per-isolate meter locally.

**Verdict: yes** for API semantics and multipart rules (5 MiB minimum, equal part sizes, FixedLengthStream requirement); **partly** for memory (relative comparison only) and **no** for latency/throughput.

**Only the live platform shows:** real R2 latency and per-request throughput (locally 8 MiB in 90-160 ms from local disk), per-range cost against Class A/B operation counts, the isolate memory used by an `arrayBuffer()` of an 8 MiB range (should be about 8 MiB + copy), eventual consistency/rate limits on one key (about 1 write/s on the same key), the platform maximums (4.995 TiB object, 10,000 parts), and the subrequest accounting of each R2 call (see 8).

---

## 6. Request body: 150 MB POST to a Worker

**Setup.** Node `http.request` streaming 150 MiB (157,286,400 B) of 1 MiB chunks to a Miniflare Worker, with `Content-Length`, or chunked (no length). Cases: count bytes via reader; `R2.put(request.body)`; `R2.put` through `FixedLengthStream`; `request.arrayBuffer()`. Then raw workerd with `--max-old-space-size=128` for count and arrayBuffer. Script `src/s6-body.mjs`, `results/s6.jsonl`.

**Measured (all HTTP 200 unless noted):**
| Case | ms | RSS base -> peak (MB) |
|------|----|-----------------------|
| Miniflare: read stream, Content-Length | 836 | 58 -> 122 |
| Miniflare: read stream, chunked | 762 | 122 -> 142 |
| Miniflare: `R2.put(request.body)`, Content-Length 150 MiB | 3,817 | 142 -> 179 (object size 157,286,400 stored) |
| Miniflare: `R2.put(request.body)`, **chunked (no length)** | 31 | **client got ECONNRESET** (no result; the Worker did not return a response. Miniflare process stayed up) |
| Miniflare: `R2.put(request.body.pipeTo(FixedLengthStream))` with Content-Length | 4,608 | 183 -> 221 |
| Miniflare: same, chunked, length passed in query string | 4,542 | 217 -> 250 |
| Miniflare: `await request.arrayBuffer()` | 1,439 | 251 -> **571** |
| raw workerd, old-space 128: read stream | 882 | 42 -> 100 |
| raw workerd, old-space 128: `arrayBuffer()` | 374 | 42 -> **365** (no crash: backing store is off heap) |

**Findings.**
- **No request-body size limit is enforced locally** (150 MiB passed in every mode; the platform's limit is plan-based, 100 MB on Free/Pro and larger on higher plans, to be verified in the docs).
- `R2.put(request.body)` works when the request carried a Content-Length (the body is a known-length stream); when the client sent chunked, the put failed at the connection level here (the clean error is not visible through the dropped socket; in a direct Worker-to-Worker test it would be a TypeError about unknown length; I did not isolate it). Wrapping in `FixedLengthStream(n)` with n from a trusted header or query works for both, and `pipeTo` applies back pressure (RSS +38 MB for a 150 MiB body, not +150).
- `arrayBuffer()` of the body succeeds with a 128 MB old-space cap and grabs about 320 MB RSS for 150 MiB. Locally nothing stops it. On the platform it would exceed the 128 MB isolate, which locally goes unseen (see 1).

**Verdict: no** for body-size and memory enforcement; **yes** for the stream-with-length semantics.

**Only the live platform shows:** the actual body cap (413 at the edge before the Worker runs), edge buffering and timeouts on slow uploads, whether `request.arrayBuffer()` of a large body is cut by the 128 MB limit, and how long an upload may take against the wall-clock allowance for a connection.

---

## 7. Service-binding RPC

**Setup.** Miniflare, two Workers (`caller`, `callee` with `WorkerEntrypoint` class `Callee`; `compatibilityDate 2026-07-01` set on each worker). Calls: pass `Uint8Array(n)` as an argument (`take`), return one (`give`), return a `ReadableStream` of n bytes in 1 MiB chunks (`stream`), pass a ReadableStream argument (`takeStream`). Script `src/s7-rpc.mjs`, `results/s7.jsonl`.

**Measured.**
| Size | argument `Uint8Array` | return `Uint8Array` |
|------|-----------------------|---------------------|
| 8 MiB | ok | ok |
| 31 MiB | ok (98 ms) | ok (44 ms) |
| 32 MiB | **error** | **error** |
| 33, 40, 100 MiB | error | error |

Error text (identical for args and returns): `Serialized RPC arguments or return values are limited to 32MiB, but the size of this value was: 33554452 bytes.` (the 32 MiB cap applies to serialized size, which is the payload plus about 15-20 bytes: 32 MiB of data is already over; 31 MiB passes.) The error is thrown to the caller as an `Error`; the 100 MiB case took 0.9-1.2 s before failing, so the check happens after serializing.

Streams: a `ReadableStream` of **40 MiB and 200 MiB** returned from the callee, and the same passed as an argument to the callee, **all succeeded** (200 MiB in 0.8-0.9 s, 51,200 chunks read in the return case); RSS peaked at 350-480 MB for the whole Miniflare process, though my stream was chunked at 1 MiB and read in a loop.

**Verdict: yes.** The 32 MiB serialization limit is enforced locally with the platform's message, and streams bypass it.

**Only the live platform shows:** cross-isolate/cross-machine cost of RPC (colocated here), back pressure and stream timeout over real networks, cancellation propagation when the callee is killed mid-stream, and whether a callee in a separate isolate has its own 128 MB (each Worker in a binding chain has its own, but the caller of a `stream()` still holds the chunks it buffers).

---

## 8. Subrequests and simultaneous connections

**Setup.** Miniflare Worker calling a local Node HTTP server (`fetch`), R2 `head()` and KV `get()`. Script `src/s8-sub.mjs`, `results/s8.jsonl`.

**Measured.**
- 1,100 sequential `fetch`es in one request: **all ok** (the 1,001st did not fail). 10,500 sequential: **all ok** (the server saw 10,500). So neither the 1,000 nor the 10,000 subrequest limit is enforced.
- 1,100 R2 `head()` and 1,100 KV `get()` calls in one request: all ok.
- Concurrency: 30 and 200 simultaneous `fetch`es to a server that held each response 400 ms: the server saw **30 and 200 concurrent** connections; all completed in about 410-470 ms. The 6-connection limit is not enforced (all requests ran at once).

**Verdict: no.** Neither the subrequest count (free 50 / paid 1,000, configurable up to 10,000 per the docs, to verify) nor the 6-simultaneous-connections limit exists locally.

**Only the live platform shows:** the real count semantics (which binding calls count as subrequests: fetch, R2, KV, DO/service calls; the lane should check the docs table), the 6-connection queuing delay (excess fetches wait for a slot, and an unread response body holds a slot, so never leave a `Response` body unconsumed), and the error text/behaviour at the limit.

---

## What this means for PLATFORM.md (cross-cutting)

1. **Hard limits local runs do enforce:** RPC 32 MiB, DO SQLite 2 MB / 100 KB / 50-byte LIKE, R2 multipart 5 MiB minimum and equal parts, FixedLengthStream length. Tests can pin these.
2. **Limits local runs do not enforce at all:** isolate memory (128 MB), CPU time, request-body size, subrequest count, 6 connections. For these the architecture must carry its own accounting (byte and work counters, explicit chunk sizes) and the claim "fits" must be argued from arithmetic plus the heap bisection technique, then checked on the live platform.
3. **Memory proxy.** The only local meter is raw-workerd `--max-old-space-size`, which sees JS heap and not ArrayBuffers; a failing allocation aborts the whole process. Budget = heap bisection result + the sum of live `ArrayBuffer`/`Uint8Array` bytes (+ the baseline of the bundle), and compare to 128 MB. Whole-body or whole-object `arrayBuffer()` of a 100 MB file is a 2-3x RSS cost locally (R2 +233 MB, request body +320 MB) and cannot fit 128 MB on the platform by any reading of the docs I remember; ranges of a few MiB and streams stay near baseline.
4. **Killed isolate.** The local analogue is a dropped socket and process exit (spike 1) or a disposed Miniflare (spike 3). The only recovery path that survives both: durable alarm state in the DO (persisted, overdue alarms run on restart) with idempotent steps, since an alarm may run again with `isRetry:true` and the same `scheduledTime`.
