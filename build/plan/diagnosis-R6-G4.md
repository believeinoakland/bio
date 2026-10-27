# Diagnosis R6-G4: the read-after-keep `extractread` unanswered while a deferred render is in flight

Status: PROBABLE cause (object reset on memory while the background render is resident); NOT certain. Nothing in product code changed.

## Evidence
- Door: `store = () => env.STORE.get(...)` (plane/door.mjs:60); `captureOp` makes ONE stub `at = store()` (capture/ops.mjs:196) and uses it for `acquire` (:198) and, through `readAcquired`, for `extractread` (door.mjs:95-103). So the same stub serves a call that lasted 10+ s and the call after it.
- The background `run` (acquisition/index.mjs:1440-1446) is an unawaited async inside the Durable Object; `PENDING_RENDERS.set(sid, {run})` (:1593) holds it; it is not handed to `waitUntil`. It holds the renderer's whole reply (`r.json()` of html plus subresource bodies, render.mjs:619-629) until it settles. Only the presses that waited the full 10 s have it resident while `extractread` starts; a render that finishes inside the wait has released it. That is exactly the 3-of-12 split.
- Signature equals the already-measured memory reset: extraction.md:169 (2.5 MB PDF, 3 of 3 "STORE_DID_NOT_ANSWER"): "the object is reset mid-read, which also loses the in-memory stage holder (`timings: {}`) and silences the same object's other calls". Here: no `in-extractread` (holder lost), no `correlation`, `do-extractread;dur=0` (workerd freezes the clock in synchronous work, R-CLOCK, so a failure after compute shows 0).
- Cloudflare, Durable Objects error handling: "Many exceptions leave the DurableObjectStub in a 'broken' state"; "you should avoid reusing a DurableObjectStub after it throws an exception" (create a new stub per retry); errors with `.retryable` true "are suggested to be retried" (idempotent requests, backoff); `.overloaded` true "should not be retried"; `.remote` is set on infrastructure exceptions, "for example, when the Durable Object exceeds its memory or CPU limits". DO state docs: "A promise passed to `waitUntil` prevents eviction until it settles or for up to 15 minutes". ("Network connection lost" and "code was updated" are not on those pages.)
- Weakness: I have no deploy log, so which of reset-on-memory, a broken stub from a different exception, or a render I/O failure is not seen. The fix's `diag` will name it.

## Reproduction attempt (Miniflare 4.20260722, workerd)
One plain Durable Object: `/acq` starts a background promise and answers; the worker waits 2 s and calls `/read` on the SAME stub. Variants: unawaited rejection after 800 ms; `setTimeout` throw after 800 ms; 1.3 GB allocation after 800 ms. All three: `/read` answered. Not reproduced. Local workerd does not enforce the 128 MB object limit (extraction.md:162), so the memory variant cannot fail here; an uncaught throw in the background does not break the stub or reset the object locally. This matches EXTRACTION #34's null result. Script (scratchpad, not in repo): /tmp/claude-0/-home-user-bio/7fdc2a56-574d-5061-a9fa-4977415909cb/scratchpad/g4/p.mjs.

## Ruled out or weak
- Stub reuse alone: the first call is complete before the second; the repo's own door test reuses the stub in workerd without failure.
- Throw in the background `run`: its body is fully try/caught (:1442-1445) and `renderSpend` is guarded; locally harmless.
- Subrequest limit: wrangler sets 10000.
- Overloaded/CPU: acquire's own call finished at 10.3-11.3 s.

## Why the tests missed it
Tests use a stub that never fails on the second call, renders finishing in 20-2000 ms, and a renderer reply of a few bytes; local workerd enforces no memory limit (R-CLOCK also hides compute). Nothing holds a large resident render across `extractread`.

## Fix and owner
1. Already merged (extraction `acquireReadingOp`, capture `captureOp`): answer `reading_pending` plus `diag`. Keep.
2. Make the cause go away (owner capture, `capture/ops.mjs` acquire arm, with plane/door.mjs as the stub source): on a thrown or silent `readAcquired`, create a FRESH stub (`store()` again) and retry `readAcquired` ONCE (read is idempotent), only when the error is not `.overloaded`; then fall back to the deferral. Cloudflare's guidance is a new stub per attempt.
3. If `diag` names a memory reset: acquisition must not keep the renderer reply resident while the request continues: do not read `r.json()` in the background run until the continuation takes it, or skip the inline `extractread` whenever `renderDeferred` is set (defer reading with `reading_pending`, as `deferReading` does for big PDFs). Owner acquisition (:1453-1456, :1593) plus control-plane's `deferReading`.

## Failing-first test shape
Capture/door test with a fake `store()` returning a stub whose FIRST `extractread` fetch rejects with an error `{remote:true}` and a second stub that answers: expect 200, the document read (not `reading_pending`), `store()` called twice. Control: both stubs reject: 200, `reading_pending`, `diag`. Third: error with `overloaded:true`: no retry. Red now: the single stub is reused and (before G4) 502; after G4, always pending.

## Platform check (the only proof)
On the deployed Worker: re-walk dena with the visitor view, 3 presses beyond the 10 s wait. Read `diag.name/message` and the log line `extraction.acquire_read_unanswered` / `{capture:"acquire", reading:"deferred"}`. "Durable Object's memory limit exceeded" or `remote: true` confirms the memory reset; if absent, enable Workers Logs (open item in the plan) and sample the object's memory with a render payload of the dena page's size (the renderer reply size is the number to measure; not yet known).
