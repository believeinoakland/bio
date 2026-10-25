# Diagnosis, round 10, group G5 (R24-R28): the object's speed and uploads

**Status** · IN PROGRESS (DIAG-R10-D #1 for BOB #287, T51; branch `prep/diag-r10-d`; K5047). Nothing in product code or tests is changed by this file.

Method in brief: the walk records (A N2, N8; B NEW-2; C C7; D D1b, D2a, D4, D8a; E E2, E4), the code at each cause, the round-8/9 diagnoses (`diagnosis-R8-speed.md`, `diagnosis-R9-headofline.md`), PERFORMANCE's handoff (it holds P1-P26 only, archived; nothing new for G5), and the live copy biosmoke8, **read only**, through the proxy: the administrator's `op=login` with `JOURNEY_ADMIN_*` (token kept in a file, never printed), `op=list`, `op=image`, `op=owedwork[&sha=]`, `op=whoami`, `op=groupidentity`, `op=findin` (records nothing), and Cloudflare's analytics (`api.cloudflare.com/client/v4/graphql`, account `20b533579290b9b93168345edd3b7f72`, read only: `workersInvocationsAdaptive`, `durableObjectsInvocationsAdaptiveGroups`). The copy was **quiet** when I read it (no walker running, about 07:15-07:40Z on 2026-10-25), which the walk never had (R-QUIET). Scratch scripts are in the session's scratchpad, not in the repository.

## At a glance

| Round-10 cause | Verdict | Root in one line | Owner (one job) |
|---|---|---|---|
| **R24** `do-session` 2.3-6.5 s, `whoami` 26 s, sign-in 17-20 s | **three roots, one symptom** | (a) every foreground request writes (`sessions.last_active`), and a write hop has a +33 ms floor and a 0.3-1.3 s tail on a quiet copy (measured); (b) one tick lands its units in one synchronous stretch (`indexUnits`, 4,096 units, 8,386 statements) that the next request waits behind; (c) one 54 s request (R15's profile detect) stopped the object for a minute | (a) **credentials**; (b) **extraction**; (c) DIAG-R10-B's R15 |
| **R24** four uploads never answered | **not the copy** | the Worker saw no request longer than 43 s; the stalled uploads never reached it | none (the walk's route) |
| **R25** `NO_HOME` three times, read after 535 s | **not a defect** | the document was filed 8 min after the upload (live: bundle created 05:08:31Z); read 49 s after | none |
| **R26** first search on 24 MiB 18.9 s | **merged into R24 (b, c)**; plus one real inefficiency | on a quiet copy the same first search is 0.34 s wall; the 18.7 s was the queue. Separately `findIn` loads all 24 MiB of text for every search | queue: as R24; the load: **retrieval-browse** |
| **R27** `caseratify` 2.8-3.5 s | **structural** | nine sequential object hops, then a 0.66 s copy and a 1.2 s assembly, after the commit, on the act's path | **ratification** |
| **R27** `/app/group` `do-doorwindow` 2 s | **same as R24 (a)** | the door window writes on every public op | **admission** |
| **R28** `alarm_at` past / null | **a consequence of R24 (b, c)**, and by the spec when null | the platform delivers the alarm only when the thread is free; `getAlarm()` is null while the handler runs | none of its own (scheduler's spec holds) |
| **R28** lag meter `max_stretch_ms` NULL, `last_mem` NULL | **the instrument is blind where it matters** | the meter is a timer that cannot fire inside a stretch that never yields, and each run overwrites the last; `last_mem` cannot be measured on workerd | **plane** (+ a requirement for BOB) |

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
