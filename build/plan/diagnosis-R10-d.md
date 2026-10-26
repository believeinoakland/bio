# Diagnosis, round 10, group G5 (R24-R28): the object's speed and uploads

**Status** · COMPLETE (DIAG-R10-D #1 for BOB #287, T51; branch `prep/diag-r10-d`; K5047). Nothing in product code or tests is changed by this file.

Method in brief: the walk records (A N2, N8; B NEW-2; C C7; D D1b, D2a, D4, D8a; E E2, E4), the code at each cause, the round-8/9 diagnoses (`diagnosis-R8-speed.md`, `diagnosis-R9-headofline.md`), PERFORMANCE's handoff (it holds P1-P26 only, archived; nothing new for G5), and the live copy biosmoke8, **read only**, through the proxy: the administrator's `op=login` with `JOURNEY_ADMIN_*` (token kept in a file, never printed), `op=list`, `op=image`, `op=owedwork[&sha=]`, `op=whoami`, `op=groupidentity`, `op=findin` (records nothing), and Cloudflare's analytics (`api.cloudflare.com/client/v4/graphql`, account `20b533579290b9b93168345edd3b7f72`, read only: `workersInvocationsAdaptive`, `durableObjectsInvocationsAdaptiveGroups`). The copy was **quiet** when I read it (no walker running, about 07:15-07:40Z on 2026-10-25), which the walk never had (R-QUIET). Scratch scripts are in the session's scratchpad, not in the repository.

## At a glance

| Round-10 cause | Verdict | Root in one line | Owner (one job) |
|---|---|---|---|
| **R24** `do-session` 2.3-6.5 s, `whoami` 26 s, sign-in 17-20 s | **three roots, one symptom** | (a) every foreground request writes (`sessions.last_active`), and a write hop has a +33 ms floor and a 0.3-1.3 s tail on a quiet copy (measured); (b) one tick lands its units in one synchronous stretch (`indexUnits`, 4,096 units, 8,386 statements) that the next request waits behind; (c) one 54 s request (R15's profile detect) stopped the object for a minute | (a) **credentials**; (b) **extraction**; (c) DIAG-R10-B's R15 |
| **R24** four uploads never answered | **not the copy** | the Worker saw no request longer than 43 s; the stalled uploads never reached it | none (the walk's route) |
| **R25** `NO_HOME` three times, read after 535 s | **not a defect** | the document was filed 8 min after the upload (live: bundle created 05:08:31Z); read 49 s after | none |
| **R26** first search on 24 MiB 18.9 s | **merged into R24 (b, c)**; plus one real inefficiency | on a quiet copy the same first search is 0.34 s wall; the 18.7 s was the queue. Separately `findIn` loads all 24 MiB of text for every search | queue: as R24; the load: **retrieval-browse** |
| **R27** `caseratify` 2.8-3.5 s | **structural** | a chain of 18 sequential awaited calls (object and R2; counted), 1.9 s of it the copy and the assembly after the commit, on the act's path | **ratification** |
| **R27** `/app/group` `do-doorwindow` 2 s | **same as R24 (a)** | the door window writes on every public op | **admission** |
| **R28** `alarm_at` past / null | **a consequence of R24 (b, c)**, and by the spec when null | the platform delivers the alarm only when the thread is free; `getAlarm()` is null while the handler runs | none of its own (scheduler's spec holds) |
| **R28** lag meter `max_stretch_ms` NULL, `last_mem` NULL | **the instrument is blind where it matters** | the meter is a timer that cannot fire inside a stretch that never yields, and each run overwrites the last; `last_mem` cannot be measured on workerd | **plane** (+ a requirement for BOB) |

## R24: `do-session` 2.3-6.5 s, `whoami` 26 s, sign-in 17-20 s, four uploads never answered

### 1. Root cause with evidence

The symptom is always the same shape: the operation's own hop is fast (`do-findin` 100-300 ms) and the **hop that waits for the object's turn** is slow. Walkers B, D and A each saw it; PERFORMANCE has no entry on it (its handoff holds P1-P26, archived). Read against the quiet copy and Cloudflare's own analytics it is **three roots, plus one non-cause**.

**(a) Every foreground request ends in a write, and a write hop has a floor and a tail that a read hop does not.** `credentials/index.mjs:565`: `session()` runs `UPDATE sessions SET last_active=?` on every read not marked `background` (R65: "a request not marked background is activity"). `admission/window.mjs:79-96` (`#counted`): a public op's door window runs `DELETE ... WHERE bucket < ?` and `INSERT ... ON CONFLICT DO UPDATE` in a transaction. Measured on the live copy, quiet, alternating one foreground and one `background=1` `whoami` (the same hop; the only difference is the `UPDATE`), 90 of each, at 250-400 ms spacing:

| `do-session` hop | p50 | worst five | over 240 ms | over 500 ms |
|---|---|---|---|---|
| foreground (writes `last_active`) | **98 ms** | worst six: 321, 412, 563, 660, 930, **1,301** | 12 of 90 | 4 of 90 |
| `background=1` (no write) | **66 ms** | worst five: 75, 76, 77, 78, 265 | 1 of 90 | 0 of 90 |

and, as the same shape on the other write hop, 36 sequential `op=groupidentity` (its hops: `session` and `doorwindow` write, `groupidentity` does not): `do-groupidentity` p50 66, max 73 ms in 30 of 30; `do-session` and `do-doorwindow` p50 99-100 ms with, in the first six, one `do-session` of **1,437 ms** and one `do-doorwindow` of **1,024 ms** on an object doing nothing else. So on an idle object a write hop costs +33 ms always and a 0.3-1.3 s tail one time in eight; that is the platform holding a response until the write is confirmed (its output gate; this is my inference of the mechanism, the **measurement** is the table). Under load the same tail is longer because the tick has written thousands of rows ahead of it (below), which is where 2.3-6.5 s and, with a tick's stall added, the walk's 26 s come from. This is round 8's own "every foreground request writes a row" (`diagnosis-R8-speed.md` Two facts, 1), which round 8 removed from the queue's cache key (`record-core` bookkeeping) but **not from the request's path**.

**(b) One tick lands its units in one uninterrupted synchronous stretch, and a request that arrives during it waits for all of it.** `extraction/index.mjs:1773-1798`, `indexUnits`: `batches.forEach((b, k) => { ... this.core.transact(() => { for (const {u, ...} of b.rows) { [SELECT 1 FROM capture_text ...,] this.#sql.exec(INSERT INTO capture_text ...) } ... }) })`. The method is synchronous (no `await` between batches), so all batches of a tick (4,096 units, `sql: 8386` statements per tick in `shape/harness.mjs` for a text; each insert also fires the FTS triggers, `extraction/index.mjs:626-637`) run as one stretch. In Node, a 12,000,060 B text reads in 30 ticks of typically 300-500 ms (max **1,347 ms**), a 4 MB text in 10 ticks (max 833 ms); a CPU profile of the 4 MB run puts the time in `sql.exec` (40% of it with the test shim). On workerd (Miniflare) a cheap `op=whoami` asked every 20 ms beside the real alarm reading a filed 7.9 MB text: idle p50 8, p95 35-53 ms; during the read **p50 21-56, p95 237-298, max 640 ms** (a 7.9 MB CSV: p95 129, max 763-808 ms). The platform's CPU is several times slower than this machine's, and Cloudflare's own figures say so:

| DO analytics for biosmoke8 (all in microseconds in the API; shown in s) | 5-min buckets 05:00-05:50Z |
|---|---|
| `alarm` firings per bucket | 14-106 (the minute 05:19: **46 firings**, CPU p50 193 ms, p99 0.91 s) |
| `alarm` CPU per firing, p99 / p999 | 0.05-2.04 s / up to **3.53 s** (05:45) |
| `http` requests to the object per bucket | 1,239-5,846 (16-19 a second from 04:55 to 05:15) |
| `http` CPU, p99 / p999 | 46-345 ms / **0.76-1.99 s** |
| `http` wall, p99 / p999 | 1.1-5.3 s / 8.6-31.8 s |

So the object is asked 16-19 times a second while its firings, one after the other (gap 6-44 ms, R9's `gap_ms`), each hold the thread for 0.2 s (p50) to 2 s (p99): a request's wait is one stretch plus the queue ahead of it. That is (b) at the platform's shape; the local run is the same cause at 1/5 of the size.

**(b2) A second, unattributed stall, size-proportional and not the reading.** With `readHeld` stubbed to answer at once (same Miniflare world, nothing is read), the first firings after a filing stall a probing `whoami` for **267 ms (0.5 MB file), 476 ms (3 MB), 627-697 ms (7.9 MB)**; the filing call itself is 25-28 ms. The consumers in that firing report `file-scan` 32 ms, `file-render` 10 ms, `document-copy` 110 ms by the object's clock, which is frozen during a synchronous stretch (R-CLOCK) and so under-reports exactly this. A measured candidate: `record-grammar`'s `sha256HexSync` is pure JavaScript and hashes **8 MiB in 552 ms in Node (66 ms a MiB)**; whole-document one-shot hashes sit at `case-carriage/index.mjs:986, 1014, 1353, 1366` (the `document-copy` consumer; `maxBytes` is unbounded in `#copyOne`, `COPY_NOW_MAX_BYTES` 2 MiB binds only `copyNow`). That the stall is that call is **not proven**: a Node CPU profile of one firing over the plane fixture with an 8 MB filed text would name it in minutes, and it is the first step of the owner's job (section 5). Uploads do not stall this way: `capture/index.mjs:810-860` hashes each 8 MiB part with `crypto.subtle.digest` (native) and the whole incrementally per arriving chunk with an `await` between chunks.

**(c) One request stopped the object for a minute.** Cloudflare analytics, minute 05:21: one `http` invocation `clientDisconnected`, **wall 59.7 s, CPU 54.1 s**, ended 05:21:09Z; an `alarm` `internalError` of 62 s at 05:21:07; the minute served 140 `http` requests against 633-978 in the minutes around it. At 05:23:31, `http` requests `internalError` with CPU p99 27 s (30 in the 05:20-05:25 bucket, 17 in the minute 05:23). These are C's 240 KB `<div` upload (`captureupload` ST 30.5 s and 38.7 s, "object-age reset", record C8/X22): R15 of group G3, **DIAG-R10-B's**. For this group it is the largest single holder of the walk, in the window the walkers A-D report (05:19-05:24).

**(d) The four uploads never answered are not the copy's** (A N2, N8). Cloudflare's Worker analytics for 04:55-05:50Z (about 3,000 requests per five minutes, all `success` or `clientDisconnected`, `errors` 0): the longest invocation of any status is **43 s**; the P999 of `success` wall is 3.5-33 s. The stalls were 30 s (17 KB, 05:01), over 10 min (10 MB, 05:08), 8 min (7 KB, 05:17), 4.5 min (260 KB, 05:32). A 17 KB or 7 KB upload cannot stall mid-body inside the copy (its whole body is in the first packet), none landed (the sha was not held), and the identical file sent again answered in 1.1-3.6 s every time. So no Worker invocation lasted as long as the stalls: the requests never reached the Worker. (The object has `http` invocations of 100-887 s at 05:15, 05:18, 05:23, 05:27, 05:35; analytics carries no route, I cannot say whose they are, and they are not claimed as these.) The route between the walker's Chromium and the Worker is the environment's proxy (K4733); **no module owns it**.

**(e) Sign-in 17-20 s** (A N8) is not a fifth cause: a sign-in is about ten sequential hops (`login`, `whoami`, `bootstrap`, `interfacewords`, `queue`, ...), each of which is a write hop (a) behind a stretch (b, c); at the per-hop waits above, ten hops reach 17-20 s without any one of them being slow in its own work (`whoami` itself 0.24-0.9 s, ST 0.1 s, as A recorded).

What it is not, each tried: **not cold storage or a restarted object** (the live object's age was 1-12 s on my first calls and the same first `findin` answered in 0.34 s wall; `object-age` rises across the walk's slow samples); **not the Worker's CPU** (Worker CPU p99 46-102 ms in every bucket but 05:15 and 05:20, 849-923 ms, where (c) lies); **not password hashing** (`credentials/index.mjs:267-271` uses `crypto.subtle.deriveBits`, native, and a sign-in is one of ten hops).

### 2. Why the tests missed it

- (a) `r9-bookkeeping.test.mjs` and `record-core` `r8-bookkeeping` assert that a session read **does not move the write counter** (so the queue's cache survives); nothing asks whether the write should happen on the request path or counts writes per read. The credentials suite pins `last_active` by setting it by hand (`t47-signin.test.mjs:82-83`) and reads its effect on idle; it never counts the statements of a `session()` read.
- (b) `r7-contention.test.mjs:66-73` asserts the **control** (a stub owner, p95 under 500 ms) and **prints** the real reads' p95 and longest wait ("the assertion waits for the owner L names", its header). I ran it here: 12 MiB CSV p95 112 / max 176 ms, 17 MiB CSV 126 / 230, 21 MB PDF 131 / 236, all printed, none asserted, and all **CSV or PDF, not text**; the walker's cases are text (D2's 12 MB, C's 24 MiB). Text and CSV reads of 7.9 MB through the door, with the real alarm and the real filing, give p95 279-298 and 129 ms: higher, and unasserted.
- (b2) no test files a document and probes the object while the reading is stubbed, so a stall that belongs to the filing's consumers is invisible.
- (c), (d): out of scope of a module test; the platform check is the only one.

### 3. Failing-first tests (the walker's exact cases, real entry paths)

1. **credentials** · `bio-plane/test/m/credentials/r10-session-write.test.mjs` · builds `world()` (`fixture.mjs`), a shared session whose `last_active` is one second old, then 50 `session(token)` reads · asserts the rows changed (`total_changes()` before and after, the counter `record-core` already uses) is **at most 1**; controls: `session(token, {background: true})` changes 0; a read when `last_active` is older than the grain changes 1; a session idle beyond `sharedIdle` (15 min) still ends. **Seen red: 50 rows changed for 50 reads, 0 for 50 background reads** (`scratchpad/exp/sesswrites.mjs`).
2. **admission** (the R27 half; same shape) · `bio-plane/test/m/admission/r10-doorwindow-writes.test.mjs` · 50 `doorWindow({address, session})` calls · asserts at most 2 rows changed; controls: the 301st request in ten minutes is still refused at the limit; two sources are counted apart. **Seen red: 50 rows changed for 50 counts.**
3. **extraction** · `bio-plane/test/m/plane/r10-land-yields.test.mjs` (plane's L harness, `r7-contention-entry.mjs`, text kind) · a 7.9 MB text filed as the screen files it, read by the real alarm; twelve `whoami` through the real door, timed by the test's clock · asserts p95 under 100 ms and the longest under 250 ms (the figure K4770 quoted for a 12 MiB read after the yields, 85/250 ms); control: the stub-owner case of R93, kept. **Seen red: p95 279 and 298 ms, max 639 and 640 ms** (two runs; CSV 129 / 763-808).
4. **plane** · `bio-plane/test/m/plane/r10-filing-stall.test.mjs` · the same world with `readHeld` stubbed to answer at once; a 7.9 MB text filed; `whoami` every 20 ms for 2 s after the filing · asserts the longest under 150 ms. **Seen red: 627, 663, 697 ms** (and 267 / 476 ms at 0.5 / 3 MB: it scales with size).
5. (d) none: a record, not a test.

### 4. The platform check

- (a) **P, done here**: the alternating foreground/`background=1` `whoami` above (`scratchpad/live/ab.mjs`, 90 + 90) is the check at the real shape on the real copy, quiet. After the fix it must show foreground p50 about 66 ms and no hop over 500 ms in 90; the walkers' load changes the tail, not the floor.
- (b), (c) **P, done here by Cloudflare's analytics**, the read-only recipe in section 6: `durableObjectsInvocationsAdaptiveGroups` per minute, `type` and `status`, with `cpuTimeP99/P999` and `wallTimeP99/P999`. After the fix: `alarm` CPU p99 under 0.5 s and `http` CPU p999 under 0.5 s on a walk of this load.
- (d): a line at the Worker's arrival of `captureupload` (size, arrival instant, `cf-ray`), logging that rides the deploy (K4428); the walker lists its stalled requests by instant and size and the next read shows whether any reached the Worker.

### 5. Owner

(a) **credentials**: write `last_active` only when the stored value is older than a grain (BOB's detail, P17: the idle limits are 15 and 30 minutes, so a 60 s grain moves an idle ending by at most one minute); the requirement is credentials R65 ("a request not marked background is activity"), silent on granularity. (b) **extraction**: `indexUnits` yields between batches (it is synchronous today). (b2) **plane**: first step a CPU profile of one firing over a filed 8 MB text; the module the profile names gets the fix (if it is `case-carriage`'s one-shot hash, native `crypto.subtle.digest` for documents over 1 MiB), reported to BOB as done. (c) **DIAG-R10-B / R15's owner**. (d) none.

## R25: the first big text's reading "refused `NO_HOME` three times, read after 535 s" (D2a)

### 1. Root cause with evidence

**The reading waited because the document was not filed until 05:08:31Z, 8 minutes after the upload. It is the designed wait of plane R97 (G168), not a refusal; the product read it 49 s after the filing.** The walker's 535 s is the time from the upload to the filing, plus one reading.

Live evidence (biosmoke8, read-only, 2026-10-25 06:58Z, quiet copy):

| What | Value |
|---|---|
| D's 12,000,000 B text `rw9-D-2` = sha `381846ff...81ca3a` (locator of the only bundle that holds it) | bundle `INFO-2026-0069-text-b741beb1036e0bd7e2b42571-txt` |
| that bundle's `created` / `last_updated` / provenance `retrieved` | **05:08:31Z** / 05:08:31Z / 05:08:30Z |
| the walker's upload of it (D2: "12 MB upload ... then a small text 8 s later") | about 05:00:25Z (the small text finished inline 05:00:45Z) |
| the small text's bundle `INFO-2026-0012` (filed by the walker's own script) | 05:01:35Z: 50 s after its reading ended, so the walker's script files after its polling, not at the answer |
| the other three 12 MB texts, bundles `0085`, `0087`, `0096` (`rw9-D-2c`, `-4`, `-4b`) | filed 05:12:50, 05:13:36, 05:15:14: each read in 19-33 s after its filing, as D2a records |
| `owedwork&sha=381846...` `last` | `reading finished`, `at` 1792904960162 = **05:09:20Z**, rows_read 21, rows_written 2, units 6 |
| filing to finished | 05:08:31 to 05:09:20 = 49 s (a 12 MB text's reading; D2c's 19-33 s were on a quieter copy) |

So between 05:00:25 and 05:08:31 the digest had no home. `readHeld` answers `NO_HOME` exactly then (`extraction/index.mjs:886-887`: `homeOf(digest)` null and no `readings` row), and the ledger's `reading` arm turns that answer into `wait(row, at, "NO_HOME")` (`plane/pending.mjs:444`, `wait` at :343-349): `state queued`, `last_why NO_HOME`, `due_at = at + backoff(row.attempts)`. `attempts` is the stamp's count (`pending.mjs:458-460`, incremented at every try) and `backoff` is `15 s * 2^(n-1)` capped at one hour (:202), so the observed attempts 3, 4, 5 with `next_try` 120 s and 240 s ahead are exactly this arithmetic (15 * 2^3 = 120, 15 * 2^4 = 240). `failed` stays 0 (`wait` does not call `failedWhy`), which is what D2a saw.

Why the filing was late is the walk's, not the product's: the Add screen files the document in the same act as the upload (`captureupload` then `promote`, B's rows: `promote` 0.3 s after the answer). D's script uploaded, polled `owedwork&sha=` for 391 s, and only then filed (the 05:08:30 retrieval stamp is the filing's own build). The two repeats and the small text, filed at once or within a minute, behaved as designed. What the walker read as "a one-off at the first big file of the new room (cold room)" is the order of his own calls. The record cannot show the walker's own request log, so the one thing not proven is that no earlier `promote` was attempted and refused; the live copy holds no bundle for this digest before 05:08:31 (the first bundle `INFO-2026-0069` is the only one with this locator).

What the filing does when it does come, read at `control-plane/index.mjs:2774-2795` and `plane/pending.mjs:210-235`: `op=promote` collects the documents carrying a digest and no reading (`unreadDocuments`, :859-877), `followEntries` registers each (`pendSha` -> `registerJob` -> `write`), and `write` on an existing row re-arms it: `attempts=0, due_at=now, state='queued'`. So a filing through the door ends the wait at once, whatever the back-off had reached (it had reached 240 s). That is why the finish came 49 s after the filing and not up to an hour after the upload.

### 2. Why the tests missed it (they did not need to)

Nothing is missed in the product: `r9-jobs.test.mjs:679` ("R97 NO_HOME: a reading row answered NO_HOME waits and counts no failure; then READING_HELD ... ends it finished") pins the wait, with a **hand-built answer sequence** (`answers = [NO_HOME, READING_HELD]` served by a stub `readHeld`). No test pins the other half the walk showed: a row that has backed off to 240 s and is then filed through the real door is read at the next tick (the re-arm). That half is true today (read above), unpinned, and is the one a change to `write`'s re-arm would break silently.

### 3. Failing-first test

There is no red case for the product to fix. What I did reproduce, on workerd (Miniflare, `r8-headofline-entry.mjs` with a 12,000,000 B text uploaded through the real door and **not** filed; a scratch script, not committed): the row stays `owed`, `last_why NO_HOME`, `attempts 5` at 242 s (the walker's 3, 4, 5 over 391 s), `failed` 0, and it is never read while unfiled. (A 5 MB text filed at once through the same harness read in 3.5 s; the harness's own `/r8/file` cannot file a multipart document, which is why the 12 MB one stayed unfiled here: `PROVENANCE_REGISTER_REFUSED`.)

Recommended: a **control** that is green now and pins what the walk relied on (the row is re-armed by the filing):

- Module and file: plane, `bio-plane/test/m/plane/r10-nohome-filed-later.test.mjs`.
- Builds: the same Miniflare world, a 4 MB text (`TEXT_BYTES = 4_000_060`, the smallest size deferred to the ledger) uploaded through the real door and not filed; poll `/r8/rows` until the `reading` row shows `last_why NO_HOME` and `attempts >= 3`.
- Then files it through the **door's `op=promote`** (a promote body as the screen builds it; not `/r8/file`, which calls `promotionOf().promote` directly and so does not follow).
- Asserts: straight after the promote answer the row has `attempts` 0 and `due_at <= now` and the answer carries `reading_pending: true`; after the next firing `owedwork&sha=` shows `last.outcome finished`. Opposite control: the same filing through `/r8/file` (no follow) leaves the row at its back-off (the hazard in section 5).
- Seen red? Not red, by design (a characterisation). Not run: building a faithful `promote` body is the cost.

### 4. The platform check

No platform dependence in the cause. The only platform element is that `Date.now()` is frozen during synchronous work in workerd (R-CLOCK), which does not matter here. The live evidence above stands as the check at the real shape.

### 5. Owner and what is for BOB

**Owner: none for a defect.** I recommend BOB reclassify R25 as a walk-order finding (note in the next brief: file the upload before polling), not a fix job. Two small points BOB may want as detail decisions (his, P17: both are details, not policy):

1. **A hazard, not seen:** a filing that does not go through the door's follow (a direct `promotionOf(ctx).promote`, as the `r8-headofline` harness does) leaves a `NO_HOME` row at its back-off, up to one hour (plane R77: "retries back off from 15 s, doubling to at most one hour"). Today no product path files without following (`inboxpull`, `promote`, `acquire` all register), so it is unreachable; a one-line option is for `promotion.onCommitted` to re-arm a waiting `NO_HOME` row for the digests it registers (owner plane, with promotion as provider).
2. **A sentence a member could read:** `last_why: "NO_HOME"` is the ledger's machine code on `op=owedwork` (administrator's answer). Plane R97 permits it on a waiting row (the code it must not carry is on a *finished* scan's row, D7). No word-table key is drawn for it (`setup-words` has no `...nohome` key for the owed row); if BOB wants the admin to read a sentence ("not filed yet"), the key is the design's to add (UX-DESIGN) and the module's to choose.

## R26: the first search on the 24 MiB text took 18.9 s (C7)

### 1. Root cause with evidence

**The 18.9 s was a wait for the object's turn (R24 b, c), not the search.** On the quiet copy, the same file (`INFO-2026-0110`, C's 25,165,824 B text, sha `1853073469f1...bd949c5`), the same call the walker made (`op=findin`, scope the capture, kinds `term`, term `u1`; the call records nothing), made on an object that had just restarted (`object-age` 9.9 s, so its caches are as cold as they get):

| call | wall | `Server-Timing` |
|---|---|---|
| first | **0.34 s** | `findin;dur=195`, `do-session` 98, `do-findin` 97, `object-age` 9,904 |
| second | 1.50 s (proxy) | `findin;dur=172`, `do-findin` 73 |
| the 12 MB text `INFO-2026-0085`, first / second | 0.60 s / 0.38 s | `findin;dur=170` / 166 |

And in-process (Node, `retrieval-browse`'s own world, 12 units of 2 MiB = 24.0 MB, one unit holding the term): a `findIn` is **150-170 ms warm**, which is the walker's second figure (0.17 s). The walker's 18.9 s minus that is 18.7 s of waiting, in the minutes his copy was running C's 24 MiB reading (14.1 s), 20 MB CSVs and A's PDFs (the minute 05:18 had an `http` invocation of 237 s, the minute 05:19 a p999 wall of 16.3 s: analytics, R24 b).

**One real inefficiency stands behind it, small by itself:** `retrieval-browse/findin.mjs:342-355`, `#load(c)`, runs `SELECT seq, extent_kind, extent, ref, text FROM capture_text WHERE capture_sha = ?` for **every unit of every capture in the page, for every kind asked, including `term`**, and parses each unit's `extent` JSON; the `term` kind (`#term`, :597-640) takes its hits from the index (`passage:` through `planOf`/`runQuery`) and uses the loaded text only to say whether any unit exists and to find the hit unit (`d.units.find(...)`). So a search for a term with one hit loads 100% of the file's text. Measured in-process by counting the bytes the `capture_text` selects return: **24.0 MB loaded per call, in both calls, for one hit** (one unit needed, 2 MiB). It is O(document) of synchronous work for each search (150-170 ms here).

### 2. Why the tests missed it

`findin.test.mjs` and `g41-findin.test.mjs` build documents of a few units and assert the matches; none asserts what a find loads. C7 is the first search on a 24 MiB text.

### 3. Failing-first test

**retrieval-browse** · `bio-plane/test/m/retrieval-browse/r10-find-term-loads.test.mjs` · `world()` (`fixture.mjs`), a capture with a held `readings` row and 12 units of 2 MiB written with `w.unit(...)`, the term in unit 1 only; the `capture_text` selects counted by wrapping `st.sql.exec` · `findIn({scope: {capture}, kinds: ["term"], term})` · asserts one item whose words hold the term (the control, green today) and that the text bytes read are **at most 4 MiB** (the hit unit and slack). **Seen red: 24.0 MB** (`scratchpad/exp/find24.mjs`). The queueing half has no test of its own: R24's tests 3 and 4.

### 4. The platform check

**P**, after the fix, on the quiet copy: the same `findin` on `INFO-2026-0110` right after a restart, `do-findin` and `findin;dur` as above (97 / 195 ms) or better; under load, R24's analytics. The byte count is the **L** check.

### 5. Owner

The wait: **extraction** and **credentials** (R24 a, b). The load: **retrieval-browse** (`#load` reads the units of the kinds that need text only, and for `term` only the hit units).

## R27: `caseratify` 2.8-3.5 s (E2) and `/app/group`'s `do-doorwindow` 2 s (E4)

Two different causes under one id; each has its own owner.

### 1a. `caseratify`: the act is a chain of 18 sequential awaited calls, and 1.9 s of its 2.8 s follow the commit

Evidence. E2 (one finding, signed in one sitting, a second sample 4.0 s): `gate` 476, `commit` 157, `copy` 658, `assemble` 1,224, `reuse` 69 ms; object hops `session` 123, `reauthdue` 65, `casedocfacts` 71, `list` 86, `casetestimony`/`caseapproval`/`casegate` 114 each (together), `gatefacts` 170, `image` 170, `ratifygate` 281, `caseratify` 157, `recordcasefile` 203, `casefilefacts` 107, `recordcasemanifest` 112, `reusedparts` 138. Adding the critical path of the hops alone (the concurrent ones counted once): 123 + 65 + 71 + 114 + 170 + 281 + 157 + 203 + 107 + 112 + 138 = **1,541 ms**. The repository's own counted test (`control-plane/r8-caseratify-calls.test.mjs`, the same G59 case, run here): **47 awaited calls (20 to the object, 27 to R2 from the Worker), longest chain 18**, peak 8 in flight. Eighteen calls one after another, with a measured floor of 66 ms for a read hop and 98 ms for a write hop on the quiet copy (R24 a), and R2 calls on top, cannot make 2 s; E2's 2.8-3.5 s is that arithmetic plus the write tail.

Where the time is decided, in `ratification/ops.mjs` `caseCeremony`: the gate phase (:111-215: `casedocfacts`, then `casetestimony`/`caseapproval`/`casegate` together, the member preparation, `ratifygate`), the commit (:236, one hop), then **after the commit** the materials' and the findings' copy to R2 (`copyMaterialsDetailed`, `copyFinding`, :258-273, 658 ms), the assembly (`assembleEdition` -> `assembleCaseContainer`, :274-283, 1,224 ms: three more object hops `recordcasefile`, `casefilefacts`, `recordcasemanifest` = 422 ms and about 800 ms of the Worker's own assembling and R2 puts) and the reuse report (:284-293). The requirement is ratification R6 ("after the commit every part's bytes are copied ... the answer carries the container and the reused-parts report") with R57's case-file sweep as the repairer when a copy fails (`caseFilesOwed`); R60 (G120) made the independent calls concurrent and stated five phases, and its test asserts the **phases are stated** and, through the door, a chain "at most 25" (`r8-caseratify-calls.test.mjs:5-6`: derived from the chain of that day, 59 less the saved ones), not a figure derived from the 2 s bar.

### 2a. Why the tests missed it

The counting test's bound (25) was derived from the then-current chain, so it passes at 18 and would pass at 24; nothing derives a bound from the act bar (K4884's 2 s) and the per-hop floor. `r8-chain.test.mjs` asserts concurrency (peak 6-8) and the five phases' names, not their sum.

### 3a. Failing-first test

**ratification** · `bio-plane/test/m/control-plane/r10-caseratify-chain.test.mjs` (the counting door, `r8-kit.mjs` + `wrap-entry.mjs`, the same G59 case as E2: a case citing one sentence of a vouched upload, one finding, signed in one sitting) · asserts the longest chain awaited one after another at most **10** (derived: 2 s less 0.4 s for the proxy, at 150 ms a call) and, if BOB takes option B below, that neither `copy` nor `assemble` is in the chain before the answer. Controls: the answer's keys are the golden list (`GOLDEN_KEYS`, as today), `materials_copied` and `container` unchanged under option A. **Seen red as a count: chain 18, 47 calls** (run here). Not seen red as a time; the time is the platform check.

### 4a. The platform check

**P**: E2's own sequence on the copy (an unsigned one-finding edition; a write: a walker's, not mine), `Server-Timing` `gate`, `commit`, `copy`, `assemble`, `reuse` and `object-calls;dur`: chain 10 or less and the total under 2 s on a walk of this load. On the quiet copy the floor of 10 sequential write hops is about 1.0 s (98 ms each).

### 5a. Owner and what is for BOB

**ratification** (the hops are its; providers: `public-read`'s `assembleCaseContainer` for the assembly's three hops and R2 depth, and `control-plane` for `session` + `reauthdue`, which can be one hop). **A requirement choice for BOB (a detail of the act, P17: his, with a recommendation):**
- **A (recommended first):** keep the answer as R6 states it, and cut the chain: fold `session` and `reauthdue` into one door hop; fold `recordcasefile` + `casefilefacts` + `recordcasemanifest` into one hop; issue the R2 heads and puts of the copy and the assembly's puts in one group of 8 (they are 27 calls in 4-5 dependent steps). This reaches a chain of about 8-10 with no change to what the member is told.
- **B (if A misses the bar):** answer after the commit (gate + commit = 0.63 s of E2's 2.77 s) and give the copy and the assembly to the owed ledger (R57's sweep already exists for exactly "a case file owed"); the answer then carries no `container` and the screen draws "being published" until the sweep ends. That changes R6's sentence "the answer carries the container" and a sentence a member reads (the sign dialog's result): the sentence is the design's (UX-DESIGN), the key chosen a module's.

### 1b. `/app/group`'s `do-doorwindow` 2 s: the same write hop as R24 (a)

`admission/window.mjs:79-96` (`#counted`) writes on every public op (a `DELETE` of passed buckets and an `INSERT ... ON CONFLICT DO UPDATE`), 50 counts change 50 rows (measured, R24 test 2). E4 saw `do-doorwindow` 1,950 and 2,260 ms (and `groupidentity;dur` 2,116-2,583 ms) on `/app/group`'s later reads on a loaded copy while `do-session` and `do-groupidentity` were 94-197 and 66-104 ms. On the quiet copy 36 reads of `groupidentity`: `do-doorwindow` p50 100 ms, max 1,024 ms (one of 36 over 1 s), `do-groupidentity` max 73 ms. So the hop is a write hop with the platform's tail, longer under load; **why `/app/group` showed it four times in four and `/app/group-identity` (the same op) never is not established** (E4 read each screen a few times; a quiet re-time, which E4 itself asked for, shows no 2 s on the op). The remedy and its test are R24's (a) for admission: count in memory and flush at most every few seconds (the window's limit is 300 in ten minutes; a restart loses at most the flush interval of counts), BOB's detail; **owner: admission**; test `admission/r10-doorwindow-writes.test.mjs` as R24 test 2 (**seen red: 50 rows changed for 50 counts**).

## R28: `alarm_at` past by up to 11 s while owed; lag meter `max_stretch_ms` and `last_mem` NULL (D1b, D4)

### 1a. `alarm_at` past or null: a consequence of R24 (b, c), and null while a firing runs is the spec

Code: `scheduler/index.mjs:811-818`, `health()`: `alarm_at: alarm ?? null` straight from `getAlarm()`. While the handler runs the platform answers none (`:600-614` comments; scheduler R28/R29); the firing's end reconcile sets the earliest wake **outright** (`:658`, `#reconcile(now, reg, true)`), and when a row is already due that wake is in the past by design: the platform then starts the next firing at once (R9: `gap_ms` 6-44). R30 states the rule only for a firing in progress ("while a firing runs, the alarm is never read in the past"), the fix R9 made (`:738-743`, tested green again here: `r8-headofline.test.mjs`, 3 of 3, 126 s). D1b's samples (12 of ~60 past by 2-11 s, with `running` false; about 15 null during a tick, `running_since` set) are the two other states: **null during a firing** is the spec (and no `arm` came to set the lease), **past between firings** is the platform delivering the alarm only when the object's thread is free. Cloudflare's analytics show the thread busy in exactly that way (R24 b: 46 firings a minute at 05:19, CPU p99 0.9 s; a request of 54 s at 05:21). So the past values have no cause of their own: they are the length of the stretch the next alarm waited behind. Nothing in `scheduler` can deliver an alarm sooner than the platform does.

### 2a. Why the tests missed it

`r8-headofline.test.mjs` asserts "never answers an `alarm_at` in the past" during a **12 s scan** (a firing that awaits), where the object is free to answer; nothing holds the thread while the alarm is due.

### 3a. Failing-first test

None for the scheduler; the cause is R24's, and its tests 3 and 4 are the cases that move this figure. If BOB wants the figure stated honestly (below), the test is **control-plane / plane**: `owedwork` answers `alarm_at` and, when it is past, `alarm_late_ms`; `plane/r10-alarm-late.test.mjs` sets a due row with the alarm in the past and asserts `alarm_late_ms > 0` and that a future alarm carries none.

### 4a. Platform check

**P**: DO analytics `alarm` per minute (count, wall and CPU quantiles), the recipe in section 6, beside the walker's `owedwork` samples: after R24's fixes the past samples must shrink with `alarm` CPU p99.

### 5a. Owner and requirement

Owner: none of its own; R24's. **For BOB (a requirement, quoted):** D1b's check "`alarm_at` never in the past while work is owed" is not what scheduler R28-R30 promise (R30: "While a firing runs, the alarm is never read in the past"). The honest choices: (1) restate the check as "past by more than one stretch" and read the stretch from the analytics; (2) `owedwork` adds `alarm_late_ms` (small, plane's `owedwork` arm). Recommendation: (1) now, (2) when the stretches are gone.

### 1b. The lag meter is blind exactly where it was built to look, and what it sees is overwritten

Code, `plane/pending.mjs`: `openInstruments` (:291-299) starts `setInterval(() => { gap = now() - beat - 10; stretch = max(stretch, gap); ... }, 10)`; `closeInstruments` (:300-307) answers `max_stretch_ms: t.stretch === null ? null : round(t.stretch)`; `noteLast` (:316-322) writes it with `ON CONFLICT (sha, kind) DO UPDATE SET ... max_stretch_ms=excluded.max_stretch_ms` for **each run**, so a row's last run replaces every earlier one. Two consequences, both evidenced:

1. **A timer cannot fire inside a stretch that never yields.** The meter's callback runs only after the stretch ends; a pass that is one uninterrupted stretch closes its instruments in the same turn, before any beat, and answers NULL. Locally (workerd, a filed 7 MB text read by the real alarm): the row's `last` is `own_ms 191, rows_read 17, rows_written 15,078, max_stretch_ms: null` while a probing `whoami` from outside waited up to **576 ms** (`scratchpad/exp/stall.mjs`). Live, all 154 `keeps_last` rows of the walk (read through `owedwork&sha=` for every held capture): `max_stretch_ms` NULL in **67**, of which **65 are the 69 rows whose `own_ms` is 0** (the frozen clock sees no time pass in a stretch with no I/O, R-CLOCK, so `own_ms` 0 and the NULL are the same blindness), and **0 of the 83 rows with `own_ms` above 0** are NULL; the largest value anywhere is 1,937 ms (B's 1.36 MB text), only one is over 1 s, while the platform's analytics put alarm CPU p99 at 1-2 s and p999 at 3.5 s (R24 b). The meter sees the passes that wait on I/O and misses the ones that hold the thread.
2. **The tick that matters is not the one that is kept.** `keeps_last` holds one row per `(sha, kind)`, the last run's. A 12 MB text is read in 30 runs; at the end `last` is the finishing pass (the live 12 MB text's: `own_ms 0, rows_read 21, rows_written 2, units 6`, the D2a document). D4's walker polled after the upload and read small passes (`NO_HOME` waits, `own_ms 0`).

`last_mem` is NULL in **154 of 154** live rows: by design, plane R92 ("`last_mem` is NULL when unmeasured"; the code header: "NULL where the platform reports no memory (workerd answers zeros)"; `memory()` at :127). The brief's expectation "non-NULL on a tick" cannot be met by workerd.

### 2b. Why the tests missed it

`r8-lag.test.mjs` asserts the field **exists** and reports a value for a tick, and the R105 control is "an unmeasured figure is NULL" (satisfied by blindness). `r7-lastmem.test.mjs` pins `last_mem` NULL. Nothing runs a pass that never yields and asks what the meter says; nothing runs two passes and asks what the row keeps.

### 3b. Failing-first test

**plane** · `bio-plane/test/m/plane/r10-lag-figure.test.mjs` (workerd, `r8-headofline-entry.mjs`) · a 7.9 MB text filed and read by the real alarm; the founder's `owedwork&sha=` read after each pass and at the end · asserts (i) the row states a **work figure that does not depend on a timer**, the largest number of SQL statements (or rows written) between two yields in any of its runs (`max_run_statements`, name is plane's), non-NULL and above 1,000 for the pass that wrote a tick's 4,096 units, (ii) that figure is the **maximum over the row's runs**, still there after the finishing pass overwrote the rest, (iii) control: a `NO_HOME` wait pass states its few statements, and a figure that cannot be measured is NULL. **Seen red:** `max_stretch_ms` NULL for a pass an outside probe waited 576 ms behind (local), and 65 of 69 zero-time live rows NULL; the field `max_run_statements` does not exist.

### 4b. The platform check

**P**: the founder's `owedwork&sha=` for a 12 MB text read after the fix: the maximum figure above 1,000 and the same run's stall read from the DO analytics (alarm CPU p99); the two must agree in order of magnitude.

### 5b. Owner and what is for BOB

**plane** (`pending.mjs`'s instruments; the cursor wrapper that already counts rows, `meter.active`, counts statements and resets at the yields). **For BOB (a requirement, quoted):** plane R105 says "each is NULL when unmeasured, never zero, and none is a time read from the object's own clock", which the work figure respects; R92 says `last_mem` is NULL on workerd. The brief's check D4 ("the lag meter and `rows_*` fields exist and are non-NULL on a tick") asks `last_mem` and a time-based stretch of the platform, which cannot be. Recommendation: the next brief asks for `max_run_statements` and `rows_*`, and states that `last_mem` is NULL on workerd (memory is judged by the platform's `exceededMemory` outcome and capture's byte tally, `tally.hold`); retire nothing.

## 6. Platform-check recipes used here (read only; for the next walker or BOB)

- Sign in: `POST /api?op=login` `{handle, password, device: "shared"}` (the journey administrator), token to a file, never printed; a shared session ends after 15 minutes idle (credentials `SESSION_LIMITS.sharedIdle`): sign in again when `NOT_AUTHENTICATED`.
- Write-hop floor and tail: alternate `GET /api?op=whoami` and `GET /api?op=whoami&background=1` at 250-400 ms; read `do-session` from `Server-Timing` (R24 a table).
- Object-side load: Cloudflare GraphQL, `durableObjectsInvocationsAdaptiveGroups(filter: {scriptName: "biosmoke8", datetime_geq, datetime_leq}, orderBy: [datetimeMinute_ASC])` with dimensions `datetimeMinute type status`, `sum {requests wallTime}`, `max {wallTime}`, `quantiles {cpuTimeP50 cpuTimeP99 cpuTimeP999 wallTimeP50 wallTimeP99 wallTimeP999}` (microseconds); and `workersInvocationsAdaptive` for the Worker. No route dimension exists, so a single named request is found by its minute and its CPU.
- Local stall probe on workerd: `r8-headofline-entry.mjs`, a bearer from `/r8/session`, `whoami` every 20 ms from the test's clock, a filed text of 0.5 / 3 / 7.9 MB with and without `readHeld` stubbed.
- Pure-JS hash cost: `sha256HexSync` over 8 MiB, 552 ms in Node.

## 7. What is for BOB, in one place

1. **Nothing to decide for R24 (a), (b), R26, R27b, R28b beyond their details:** the `last_active` grain (60 s suggested), the door-window flush interval, the work figure's name; all are the modules' (P17: details).
2. **R25 is not a defect:** note for the next brief (file the upload before polling), or the walker's script.
3. **R27a, a requirement-level choice:** option A (cut the chain, no change to what the member is told; recommended) or B (answer after the commit; changes ratification R6 and a sentence the design owns).
4. **R28a / R28b, the brief's checks D1b and D4 do not match the requirements** (quoted above); recommendation in each.
5. **R24 (d), the four uploads never answered, are the environment's route**: no Worker invocation lasted as long as the stalls.
6. **R24 (c) is DIAG-R10-B's R15** and, by its size (a 54 s request, the object out of service for a minute, 30 requests failed), the first thing to fix for speed.
