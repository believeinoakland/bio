# Whole architectures for reading (READING-ARCHITECTURE, deliverable 4)

**Status** · Written from the lane's brief by a writer for READING-ARCHITECTURE #1 (2026-10-23); read whole against `options-brief.md` and its inputs, corrected and adopted by READING-ARCHITECTURE #2 (2026-10-23, RA5). Decides nothing: the choice is Bob's at the high level (FOR-BOB.md), the details BOB's.

---

## 0. How to read it

**What this is.** Four whole architectures for everything between a file reaching Civicsmith and a member searching, citing and interpreting it, expanded from the lane's design brief (`options-brief.md`). The brief fixes the shared shape S1 to S9 (§2), the four options A to D (§3), the comparison axes (§4) and the recommendation (§5). This file expands them with the evidence; it changes none of their substance. Where the inputs contradicted the brief on a fact, a **Writer's note** says what was found and where; there are six (WN1 to WN6). The lane's review settled each (end of this section), and the text follows the settlement.

**Inputs, all in `build/plan/lane-reading-architecture/`, read whole.**

| Input | Cited as |
|---|---|
| `CHARTER.md`, `options-brief.md` | the brief, S1 to S9, A to D |
| `CHALLENGES.md` | C1 to C17 (the failure classes), **Ob 1 to Ob17** (the obligations of its §7), "§5 unknown" (its table of causes still unknown; the ones marked **A** decide an architecture) |
| `PLATFORM.md` | row ids W, D, R, B, CR, Q, WF, **CT** (its container rows C1 to C22, renamed CT1 to CT22 here because C1 to C17 are CHALLENGES' failure classes), BR, AI; **PG1 to PG18** (its documentation gaps G1 to G18, renamed because fix-round causes such as G70 are G-numbered too); E1 to E22 (consequences); P-M1 to P-M24 (live measurements); "§6.4" (the cost table) |
| `REQUIREMENTS.md` | RR-, CF-, GP- ids; K, N and DEC rulings as it quotes them |
| `spikes/options-RESULTS.md`, `spikes/RESULTS.md` | "spike W/N/R" (the options spikes) and "spike S1 to S8" (the platform spikes) |
| `build/modules.json` | module ids (grep only, for what each option touches); source sizes by `wc -c` of the paths it lists; two repository comments (agent-runner's `wrangler.jsonc`, file-scanner R10) read where the brief leans on them |

**Evidence tags.** [spike] measured locally in this lane (workerd 2026-07-22, Miniflare 4.20260722.0, native tools on one shared 4-core box). [doc] Cloudflare's text as quoted in PLATFORM. [live] measured on the deployed copy in the family evidence (CHALLENGES §4). [arith] the writer's arithmetic from stated inputs. [design] a design step the writer supplies, unproven. [live-only] only a probe on the team's account can show it.

**What was proved locally (the spikes), and what it binds.**

1. Workflows run in Miniflare 4: 50 steps in 204 ms, each once; retries with back-off are honoured (gaps 1.0 s, 2.0 s). After a dispose and restart the instance stays `running` until poked (a second `create` with the same id); then only the one in-flight step ran twice. A harness needs a poke-after-restart helper; whether the platform resumes unpoked is [live-only] (P-M14). A step result of 1 MiB + 1 to 2 MiB passes locally and 3 MB fails, so the 1 MiB rule (WF2) must be enforced by the product's own step contract. [spike W]
2. Native readers: `pdftotext` 1.3 ms a page at 17.5 MB for a 100-page range (`mutool` 1.8 ms, 10 MB); LibreOffice converts a small .docx or .xlsx in 1.2 to 4 s at about 220 MB; `7z l` lists a 92 MB zip in under 10 ms at 6 MB; `vips` takes a 48-megapixel JPEG in 43 MB where ImageMagick takes 388 MB. These are synthetic reportlab pages and generated files, not the project's hostile PDFs. [spike N]
3. OCR, same model: native 5.0 s against wasm 6.7 to 7.9 s on a dense 300 dpi page (1.45 against 2.0 to 2.5 s sparse); threads do not help. 5,000 scanned pages: about 2 to 7 h native single process, 3 to 11 h wasm, about 1.9 h on four cores. Native is 1.3 to 1.6 times faster, not several. [spike N]
4. Range reads: 100 MiB in 8 MiB ranges with a streaming SHA-256 completed correctly under `--max-old-space-size` 32 and 64; the heap is bounded by the range, but backing stores are not counted locally, so the 128 MB total is [live-only]. [spike R, S1, S5]
5. Local runs do enforce RPC 32 MiB, DO SQLite 2 MB value or row, 100 KB statement, 50-byte LIKE, R2's 5 MiB multipart minimum and equal parts, the alarm retry shape (1 + 6, gaps 2.1 to 68.5 s) (E20). They do not enforce isolate memory, CPU, body size, subrequests, the six connections or the 32 invocations (E21).

**What only a live probe can show** (none was run: the charter forbids a deploy; a probe is a throwaway Worker on the pinned account `20b533579290b9b93168345edd3b7f72`, BOB's to run): the 128 MB total with buffers (PG9, P-M2); the CPU cut (P-M5); what a deploy does to a running alarm or step (P-M4, P-M14); unpoked resume and a step's memory (P-M14, P-M16); the cause of the scheduler's gaps (P-M7, P-M8); container cold start, kill, rollout, R2-to-container throughput and half-vCPU speed (P-M17); the body cap on the team's zone (P-M1); R2 latency (P-M3); cost counters (P-M24).

**Not drawn as options.** Queues alone (Q1, Q9: 128 KB messages, a failed message retries its batch, no per-job cursor), Workers AI `toMarkdown` (AI4 to AI7, PG15: whole-Blob input, no documented limit, no OCR) and Browser Run (BR3: renders pages). Each may serve a small part inside an option; none carries reading.

**Nothing here was run against the repository's code; nothing in it was changed.** Costs use the prices in PLATFORM §6.4 and are gross marginal charges before the plan's included allowances unless stated.

**Writer's notes and the lane's settlement** (each note stays inline where it applies):
- WN1 `sheet-worker` is not a reading stage (§2.3). *Accepted:* the brief was wrong to list it; reading never calls it in any option.
- WN2 the 27 s container start was at the default size (§3.4). *Accepted:* no input measures a start at `standard-1`; the documented 1 to 3 s stands until P-M17.
- WN3 OCR time per page has three figures, one outside the brief's range (§4.2). *Accepted:* about 14 h is carried as the upper figure of the unmeasured live serial case; it changes no option's ranking.
- WN4 "small files under a threshold" against "the kind decides" (§3.4). *Settled:* D is drawn with the kind deciding (one path per kind, S3, C8). Whether small heavy-kind files take a Worker path to save container wake-ups is BOB's, after P-M17; it is a detail, not Bob's.
- WN5 no input measures a readers-only bundle's idle (§3.2). *Accepted:* 20 MB is an assumption carried in B and C, measured by P-M2(c).
- WN6 RR-F1's "64 MB above idle" cannot hold at the as-built idle (§3.1). *Accepted:* a finding for GAP.md (RR-F1 must state the object's total); the brief's "about 40 MB" for a read in A stands.

**Corrections made in review** (beyond the notes): C7 counted with the shared shape in every option's (f), as §4.3 already had it; C16 counted with the shared shape in D, as in §4.3; the 100 MB PDF row of §4.2 restated; the retired-source total (§3.4 (h)) said to cover only the modules sized; and every place that called the list of kinds read "Bob's" now says what his file standard already settles: K4628 point 1 lists .doc, .xls, RTF, TSV, JSON, XML, .eml, .msg, ZIP contents and JPEG, PNG, TIFF, HEIC, GIF, WebP for the beta, so those must be read under every option; only kinds beyond his list (TAR, GZ, 7z, RAR) and OCR languages beyond English remain open (§3.4 (f), §4.3, §5.4, §6).

---

## 1. The short answer

All four options share one shape (S1 to S9, §2): a durable READ JOB row registered before any answer, one identity, one range-reading reader per kind, pieces landed as units in the record, progress that only moves forward, bounds stated once, the member's view drawn from the job row, safety on its own jobs, and a harness at the platform's shape. That shape alone removes C3, C4, C6, C7, C9, C11 and C12 and most of C8 on every carrier. The options differ only in where a read runs and what carries it across a kill.

- **A, hardened in-object.** The team's Durable Object keeps carrying reading: one READ JOB table, a bounded alarm firing, the cron watchdog, every reader rewritten to ranges with a stored cursor. Least new platform surface. Keeps the record's 128 MB and thread (C1, C14) and the self-built liveness whose gaps (G70) are unexplained; fits the standard only if every reader works in about 22 to 59 MB, unproven above 41.5 MB.
- **B, a Reader object per document.** A new Durable Object class in its own Worker, with its own SQLite, alarm and small bundle; the team object only registers jobs and receives units in bounded batches. Removes C14 and most of C1; liveness stays self-built (simpler), and Readers of one team may share an isolate, so concurrency is capped.
- **C, Workflows carry the read.** Each job is a Cloudflare Workflow instance whose steps each read one bounded piece; the platform keeps completed steps, retries failed ones and sleeps for free. Removes C5 for reading, C14 and most of C1. Readers are still this project's JavaScript, in a Worker.
- **D, Workflow-carried, container-read heavy kinds (recommended).** As C, but PDF, OCR, office and legacy formats, archives and images are read in a Cloudflare Container by mature native tools (4 to 12 GiB, streaming), one container call per step; light kinds stay in Workers steps. Removes C1, C2, C5, C8, C14 and most of C10 and C17 for the heavy kinds; costs the most new surface.

**Recommendation (the lane's): D, staged.** (1) The shared shape S1 to S9 first, because every option needs it. (2) The Workflow carrier with Workers readers for the light kinds (C), which is also the fallback. (3) The container reader for PDF, OCR, office, archives and images behind the same step interface, kind by kind, each proven on the generated corpus at the standard's sizes and on a live probe before it replaces the JavaScript reader. A is not a fallback: it keeps the record's isolate and thread as the reader's and the self-built liveness, and four rounds of hardening it are the evidence against it.

**What D's case rests on:** memory headroom, format coverage and decades-tested parsers. It does not rest on OCR speed: a 5,000-page scan takes hours in every option (about 3 to 11 h in wasm, 2 to 7 h native single process, about 1.9 h on four parallel cores) unless pages run in parallel, which C and D can do and A cannot. **Cost** is cents a read on every line except a container held awake; at a modest team load about $1 to $2.50 a month gross in any option, mostly absorbed by the plan's allowances (§4.4). **What would change it:** P-M17 showing containers unreliable or slow to start under the team's load; P-M14 showing Workflow steps lost on a deploy; Bob preferring no container cost (then C).

---

## 2. The shared shape (S1 to S9)

These hold in every option because CHALLENGES §7 makes them obligations whatever the carrier. For each: the design; the obligations (Ob) and classes it discharges; the requirements it meets; the modules that change. Column names in the module lists are `modules.json` ids. Nothing below is a schema: names are illustrative and the details are BOB's.

### 2.1 S1 Register, then answer, then read

**Design.** Every way in writes one durable **READ JOB** row in the team's record, in the same transaction that files the capture, before the answer leaves. The row is keyed by whole sha and kind and carries: the bound verdict (within / above with figures / not yet known), the state, the stored cursor, the counters (units written, skipped, owed, failed with cause), the per-unit kill counts (S5), `started_at` and `last_progress_at`, a rate estimate (S7), and a carrier reference (the Workflow instance id in C and D, the Reader id in B, none in A). Registration is idempotent by sha, so a second door, a retry or "Read it" finds the row and raises its priority rather than starting an inline read. Bytes are put first; if the isolate dies before the transaction, the orphan bytes are adopted by a later registration (`existed: true` today) and a sweep compares held bytes with job rows. `keeps_pending` becomes this table for reading kinds; the scheduler's other consumers keep their own state. Money and register ingest (RR-G10), fetch (a parked large capture), unpack, scan and safe view are job kinds on the same table.

**No member request does heavy work.** A request reads only a bounded first look: head and tail ranges (about 64 KiB each) for format detection from bytes (the PDF trailer, a ZIP end-of-central-directory) and the declared size from R2's `head`. No OCR, no unpack, no whole parse, no large fetch runs inside a request. A size above the kind's bound is refused at once, with its size and the bound, before any work. A page or row count is only known after the first look, so a **plan step** (the job's first step, in the carrier) reads the declared pages or rows and refuses a file over a page or row bound with its figure, before the first piece is read. Acts answer within 2 s (K4354); a web capture keeps K4562's at-once answer for a large file by parking a `fetch` job before any body byte is pulled.

**Ways in (identical in A to D).**

| Way in | Bytes arrive and are kept | First look | Job row written | Answer |
|---|---|---|---|---|
| Upload | Worker streams the body to R2 (multipart for large; hashed as it arrives). Above the zone's body cap (W28 to W30, E17; 100 MB on Free and Pro) the browser must upload straight to R2 by presigned multipart (R19, R20, PG16): [live-only] P-M1, P-M3 | head and tail range | same transaction as the capture | within 2 s: kept, job registered |
| Web capture as sent | Worker fetch through the host governor; over 8 MiB or 10 s parked as a `fetch` job, body pulled by the carrier | head range when the body lands | at the park, before the body | at once (`fetch_pending`) or on completion |
| Web capture as a visitor saw it | rendered document and served shell kept as one capture (RR-A4); rendering is the existing renderer, not a reading stage | as above | one job per capture | as today |
| Delivery held elsewhere / pull (doorbell) | admitted at `collected` as the puller's capture (RR-A9) | as above | at admission | `sha`, `reading_pending: true` |
| Archive member | an `unpack` job cuts members to R2, each its own capture with its own sha (RR-A11) | per member | one job per member, registered by the unpack job in batches | the archive row shows `{entries, filed, waiting}` |
| Promote, press, "Read it" | already held | none | idempotent re-registration; priority raised | at once |
| Register import | structured, mechanical (RR-A12) | declared size | ingest job kind | delta size and estimate first |

**Discharges** Ob3, Ob6 (and Ob10 with S2). **Classes** C4, C6; helps C9, C11. **Requirements** RR-G1, RR-G2, RR-A2, RR-A6, RR-A10, RR-A12, RR-D3, RR-L3; meets what GP-2, GP-3 and part of GP-1 ask. **Modules** `acquisition`, `capture`, `store-door`, `doorbell`, `control-plane` (promote, press, `readheld`) register in the filing transaction; `extraction` (`Extraction.read` passes the registrar in place of the `owe` hook that only tests call); `reading-pipeline` (R37's `owe` retired); `plane` (`keeps_pending` becomes the job table; `cpu_ms` set from a measured figure, since `limits` today sets only `subrequests`); `screens-intake` reads it (S7).

### 2.2 S2 One identity

**Design.** A document is its whole sha. Part shas, if kept, are an integrity detail below R2 multipart and are never a record key, a lookup key or a citation key. The evidence store exposes `readRange(sha, offset, length)`; whether the bytes sit in one R2 object or several parts is hidden. Every consumer (provenance's `REGISTER_FIRST`, `content.captureFor`, retrieval, file-safety's home lookup, the reading's own key) is keyed by the whole sha. Stale part-keyed rows already in the live record (C9: R88's `#wholeOfPart` fixed forward, old rows still there) need a migration that nobody has placed.

**Discharges** Ob10. **Classes** C9. **Requirements** RR-A12, RR-A2, RR-H6, RR-J2. **Modules** `capture`, `acquisition`, `provenance` (the `whole` row of R72 and R73 is no longer a fourth row beside parts but the only row), `record-core`, `content`, `retrieval`, `file-safety` (its fail-open on an unknown-home capture), `extraction`.

### 2.3 S3 One reader per kind, read by range

**Design.** One reader per kind, one contract: `plan(source)` returns the kind, the declared units and the bound verdict; `read(source, cursor, budget)` returns units, the next cursor (strictly beyond the last, or a terminal state with a cause code), counts, and the causes of any skipped unit. `source` is a range source `{size, readRange(offset, length)}` over R2; **a whole read is a one-piece range** (budget = the whole), so the "whole", "ranged" and "held" modes of today collapse into one. A step's cost is bounded by **bytes decoded plus objects walked**, never by pages times an average, and at least one page; a declared header (dimensions, entry sizes, decompressed length, object counts, nesting) is checked before any allocation, on every route. The cursor is per kind: PDF page and object state; text and CSV byte offset plus line and row counters and a carry; zip member and inflate position; sheet and row; OCR page; archive member index. Where an input is a deflate stream (xlsx and ods sheets and shared strings, docx parts) a row window cannot start in the middle: the cursor carries a deflate access point (compressed offset, bit offset, 32 KiB window: the zlib `zran` technique) or the step re-inflates from the member's start and skips (inflate time only, cheap natively, uncertain in a Worker). Both are [design], unproven here. A 1M-row sheet's shared-strings table is tens of MB: never held, spilled once to R2 as a fixed-record scratch file with an offset index and resolved a window at a time [design]. A byte ledger in product code counts each step's live buffers (S9), because workerd will not.

> **Writer's note WN1.** The brief (Option A, Option B) lists `sheet-worker` among the workers the readers drive. `sheet-worker` recomputes formulas with the IronCalc engine and ships inactive until an administrator enables it (`build/requirements/sheet-worker.md`, Purpose and R2; RR-D6; PLATFORM §3). It is an analysis worker, not a reading stage: sheet text is read by `office-readers`, `csv-reader`, `ooxml` and `odf-reader`. I keep the brief's text; in every option below `sheet-worker` is unchanged and reading does not call it.

> **Writer's addition (not in the brief): interactive point reads.** `cellsOf` (typed cells of a range on demand, RR-F4, K4636), `cropOf` for a cited region (CO R32 through `pdf-pixels`) and the safe view are member-facing, not background jobs, and must meet the 2 s bar (K4354). They read by range too, but they must not depend on a cold container (1 to 3 s at best, CT9). Either the job precomputes what they need (xlsx access points, page boxes and image placements as rows, S4) so a Worker answers them, or a container is kept warm. Open in C and D; BOB's.

**Discharges** Ob1, Ob2, Ob13 (a declared kinds table), Ob16 (fewer paths). **Classes** C1, C2, C3, C8 (with C14 and C10 only in options that move the read). **Requirements** RR-F1 to RR-F4, RR-E1 to RR-E13, RR-C2, RR-C3, RR-D5. **Modules** `pdf-reader` (`openPdfRange` and `extractPdfRange` become the only path; `PdfDoc` and `XrefReader` agree on `/Encrypt`), `ooxml` (a range source over the central directory, R27, R35), `office-readers`, `odf-reader`, `csv-reader` (windows already exist), `format-registry` (detection from range reads, not a 1 KiB prefix: CF-28), `reading-pipeline` (tiers become implementations of the contract; R40's tier 2 to 4 "on the range's pages"), `pdf-worker` (tier 2 asks for the range only: CF-35), `pdf-pixels` and `image-codecs` (declared-size check on every route, N12), `ocr-worker` (one page per call, unchanged).

### 2.4 S4 Pieces land as units; completeness is one fact

**Design.** A reading is a header row plus unit rows landed in bounded batches, each batch its own transaction (about 1 MB, never a row near the 2,098,176-byte value). Text units, page boxes, image placements and cell ranges are rows of their own. A unit over the 128 Ki-character cap is **chunked, never cut** (consecutive units), so "searchable to the last line" holds (Ob12, K4571). The text index grows batch by batch to the last line. **Completeness is computed in one place from the job's own counters** (written, skipped, owed, failed with cause) and drawn by every screen and the API; `completeness: whole` is true only when nothing is owed, skipped or following. A stored reading over a bound is never replaced whole by a statement (EX R97 today); an optional part (cells, page boxes) is omitted with a statement and the units stay.

**Discharges** Ob9, Ob11, Ob12. **Classes** C3, C11, C12. **Requirements** RR-F2, RR-F7, RR-H1 to RR-H3, RR-H7, RR-I1, RR-I5, RR-J1, RR-J6. **Modules** `extraction` (the reading writer, `completeness`, R22/R36/R90 to R98), `record-core` (rows, `reading_history`), `retrieval` and `retrieval-browse` (`reproject`, indexing as pieces land), `content` (CO R46 must allow citing from landed pieces, GP-35), `text-chain`, `screens-intake`. Existing readings need a migration (BOB's).

### 2.5 S5 Progress monotone; failures classified

**Design.** A step advances a stored cursor or ends, stated, with a cause code; the wrapper that runs every step asserts `next > cursor || terminal`. Failures are **deterministic** (this input will always fail: encrypted, malformed; the unit ends stated, the read goes on), **transient** (the store did not answer; retried with back-off, at any tick including the second, never written as an end) or **resource** (memory, CPU, a kill). A durable attempt stamp for the unit (cursor, attempt number) is written before the reader runs; an unfinished stamp found later is a kill attributed to that unit. **Poison rule:** a unit that kills its reader three times is stated for that unit only (for a page, `PAGE_KILLED_READER`), after one retry with half the budget; the rest of the file is still read; the plane's deaths are not counted against the file. Three interrupted runs no longer end a whole read `final`; the stop applies to the unit that caused it (CF-18; the words of DEC-417 are the design stream's).

**Discharges** Ob4, Ob5. **Classes** C5. **Requirements** RR-G2 to RR-G4, RR-F7; answers CF-18 and part of GP-25. **Modules** `plane` (the ledger), `scheduler`, `reading-pipeline` (R37), `extraction` (R82).

### 2.6 S6 Bounds stated once per kind

**Design.** One table, `READ_BOUNDS`, derived from Bob's standard (documents and scans 100 MB or 5,000 pages; spreadsheets 50 MB or about 1M rows; images 50 MB; archives 500 MB total, each file within its kind) in the unit that matters (bytes, pages, rows, pixels, entries, ratio, depth), quoted by every module and every screen. Inside a bound a file is never refused or "kept, not read"; above it, refused before work with size and bound (DEC-419 `.toolarge`). Protective sub-bounds (pixels a page, decompression ratio 1,100:1, nesting 3, entries 10,000) are BOB's under K1881, stated, and reported. The nine byte ceilings on one PDF's path (2 MiB to 256 MiB, CF-2), `WHOLE_READ_MAX`, `MAX_PDF_BYTES`, `GRADE_READ_MAX`, `CAPTURE_MAX`, `SCAN_MAX_BYTES` and the seven alpha bounds (REQUIREMENTS §1.2) are replaced by it. Whether "100 MB or 5,000 pages" refuses on either limit (Q-N9), and whether the alpha ships at the standard (Q-N1), are Bob's (§6).

**Discharges** Ob8. **Classes** C7, C12. **Requirements** RR-D1 to RR-D6, RR-L6; meets what GP-12, GP-14, GP-15 ask. **Modules** every reader and gate above, plus `file-safety`, `file-scanner`, `doc-clean`, `image-cover`, `workbooks`, `calculations` (their own ceilings sit below the standard: CF-4, CF-6, CF-9).

### 2.7 S7 What the member sees comes from the job row

**Design.** States: queued; being fetched; being read N of M (pages or rows); read in part and why; refused with its bound; finished. A notice when a read finishes or stops (GP-38). The "by when" is an estimate from measured rates (Bob's B-3, Q-Q1), stated as "about" and only after a few units, from the job's own units-per-second and the rates the corpus measured per kind. Search and cite work on the units already landed and say "searched so far" (DEC-418 `reading.partial`, RR-I1, RR-I2). The words are the design stream's (DEC-98, DEC-417 to DEC-419); this shape supplies the fields. "Read it now" is offered only where it can succeed (Ob9).

**Discharges** Ob9, part of Ob6. **Classes** C11. **Requirements** RR-L1 to RR-L7, RR-I1, RR-I2, RR-J6; GP-32, GP-35, GP-37 to GP-39. **Modules** `screens-intake`, `control-plane` (`op=reading`, `owedwork`), `notice-producers`, `queue-producers`, `retrieval`, `content`.

### 2.8 S8 Safety decoupled

**Design.** The scan and the safe view run beside the read, each its own job kind; reading never waits on them. An unscannable verdict (encrypted, over a limit, no signatures) is its own state, never `clean`. A file above `GRADE_READ_MAX` is no longer graded `high` `unread` whatever its kind: the grade comes from the same range-read structure check. Whether a hold gates reading is Bob's (B-S7, Q-Q7); the shape supports either. In every option the scanner and renderer containers (`file-scanner`) stay separate from any reader container.

**Discharges** Ob14. **Classes** C16. **Requirements** RR-B1 to RR-B4. **Modules** `file-safety`, `file-scanner`, `acquisition` (the receipt queue for scan), `scheduler` (the scan consumer leaves the reading path).

### 2.9 S9 Testing at the platform's shape

**Design.** (1) A harness with the platform's real alarm and step semantics: a null `getAlarm()` during a run, a past alarm that stays set, the 6 retries; Workflows with a poke-after-restart helper; the 1 MiB step rule enforced by the product contract. (2) A capped isolate that counts buffers: raw workerd with `--max-old-space-size` for the heap, plus the byte ledger of S3 for backing stores (the cap alone proved 100 MiB reads with a 32 MB heap and could not prove 128 MB; spike R), one cap convention (today `128 - N` for PDFs and `128 + 39 - N` for sheets). (3) The 2 MB value shim in every suite. (4) Kill, restart and store-failure injection (`restartAt`, `killPage`, `storeFailAt`, `objectGoneAt`). (5) A seeded generated corpus per kind at the standard's sizes (100 MB and 5,000 pages; 50 MB and 1M rows; 50 MB image; 500 MB archive), with a truth function (a unique token per page, row, member) and an independent reader, run through the real entry path (upload and capture), judged on counts, not time, with boundary cases either side of each bound; large cases built on demand from the seed, not stored. A 5,000-page scan costs hours of OCR, so its CI case uses sparse pages and a stated sample, the full run at round end. (6) The live measurements the chosen option relies on (§3 (g)) run on a probe before building. (7) Instruments of the architecture's own where workerd withholds one: a lag meter, per-unit counters, NULL when unmeasured, a per-sha last-run record.

**Discharges** Ob15, Ob17, Ob16. **Classes** C13, C15. **Requirements** RR-M1 to RR-M5; meets what GP-41 to GP-44 ask. **Modules** `test-support` (harness, byte ledger, corpus generator), `plane` tests, `runtime-limits` (counters).

---

## 3. The four options

Each option has the charter's five headings: (a) where each stage runs, (b) how a large file is read in bounded memory, (c) how work survives a killed isolate or a deploy, (d) how progress and limits reach the member, (e) how it is tested at the platform's shape; then (f) the classes C1 to C17 it removes by design, by the shared shape, by discipline, or not at all, (g) what it depends on among the §5 unknowns and the P-M measurements, and (h) today's modules kept, rewritten, retired and new. All four take every way in as S1 (§2.1) and share S2 to S9, so the rest describes only what differs.

### 3.0 Where each stage runs, side by side

"Store" is the team's `STORE` Durable Object (the record, one per team, one thread). "Reader Worker" and "flow Worker" are new Workers holding the JavaScript readers, separate from the plane's bundle.

| Stage or kind | A in-object | B Reader object | C Workflows | D Workflows + container |
|---|---|---|---|---|
| Receive, keep, register, first look (all ways in) | Worker and Store, §2.1 | same | same | same |
| Carry (drives steps, survives kills) | Store's one alarm: bounded firing, rotation; cron watchdog | one Reader DO per job, its own alarm; Store registers and pokes; cron watchdog checks | one Workflow instance per job; the platform's engine | as C; a step makes one container call |
| Plan step (declared pages, rows, bound) | first firing | Reader's first alarm | step 1 | step 1 (a container call for PDF, archive, office) |
| PDF text and structure | in Store's isolate (tier 1 JS) a range per heavy row per tick; `pdf-worker` tier 2 by binding | in the Reader isolate (tier 1 JS); `pdf-worker` | a step in the flow Worker (JS); `pdf-worker` | container: poppler, MuPDF or PDFium on a page range |
| Scan OCR | `ocr-worker`, one page a call, serial from the alarm | Reader drives `ocr-worker`, several in flight | steps fan out to `ocr-worker`, width W | container: native Tesseract, N processes or N instances |
| Images | plane JS (baseline JPEG, PNG); `ocr-worker`; other types unread | Reader JS; same | step JS; same | container: libvips, ImageMagick (TIFF, HEIC, WebP, GIF, CMYK, progressive) |
| Text, CSV, TSV, HTML, JSON, XML | Store, byte windows | Reader | step, windows | step in a Worker (a light kind) |
| docx, pptx, odt, odp | Store, JS by range | Reader | step | container: direct OOXML and ODF parsing |
| xlsx, ods | Store; access points and shared-strings spill (S3) | Reader | step | container: streaming parser |
| Archives (500 MB) | Store: directory by range, members inflated to R2 | Reader | steps, batches of members | container: 7z or libarchive streams members to R2 |
| .doc .xls .ppt .rtf, .eml .msg, TAR GZ 7z RAR | not read (C17) unless new JS is written | same | same | container: LibreOffice headless; libarchive |
| Land units | same DO, same transaction as the cursor | Reader to Store by RPC, batches of about 1 MB | step to Store by RPC | step to Store by RPC; the container returns units under 512 KiB or an R2 reference |
| Safety (scan, safe view) | `file-scanner` on the shared alarm (must be bounded) | own jobs | own jobs | own jobs |
| Progress to the member | job row in Store | job row in Store, fed by the Reader | job row in Store; Workflow status for operators only | as C |
| Point reads (`cellsOf`, `cropOf`) | in the plane | in the plane | in the plane | Worker path or warm container (open, §2.3) |

---

### 3.1 Option A: hardened in-object (today's shape, made whole)

**What it is.** The team's Durable Object keeps carrying reading. `keeps_pending` becomes the READ JOB table. The alarm runs one bounded firing: a budget of about 10 s (K4811(5)), consumers in rotating order so none is always last, every await bounded (scanner and renderer calls about 8 s), `heal` wired into the request path, and the `*/5` cron watchdog as K4566 (it only checks and re-arms). `limits.cpu_ms` is set to 300,000 after P-M5 (today the 30 s default stands, W11, D7). Readers stay the plane's JavaScript readers (tier 1) plus `pdf-worker` and `ocr-worker` by binding, each rewritten to read by range from R2 with a stored cursor.

> **Writer's note WN1 (applies here and to B).** The brief names `sheet-worker` among the workers this option's readers use. It is the formula recompute worker, not a reader (§2.3). Unchanged here.

**(a) Where each stage runs.** Column A of §3.0. Every read, tier 1 included, runs in Store's isolate on its one thread; only `pdf-worker`, `ocr-worker` and the scanner run elsewhere.

**(b) Bounded memory.** The read shares the record's isolate: 128 MB (W1, D1), of which the plane idles at about 87 MB as built (86.7 in the harness; the committed bundle "needs 85") or about 50 MB with an ASCII-only bundle (diagnosis R6; due to be re-measured). Headroom H = 41 MB as built, 78 MB ASCII (E1, PLATFORM §3). Other requests in the isolate draw on H too (W2). Per step [arith], with a range of R MiB held twice (the buffer and its copy) and 3 MB for a 1 MB unit batch in its string forms:

| | Range 8 MiB (16 MB) | Range 1 MiB (2 MB) |
|---|---|---|
| Working set left, as built (H = 41) | 41 - 16 - 3 = **22 MB** | 41 - 2 - 3 = **36 MB** |
| Working set left, ASCII bundle (H = 78) | 78 - 16 - 3 = **59 MB** | 78 - 2 - 3 = **73 MB** |

The smaller range costs latency (R2 0.26 to 0.29 s a call from a far Worker, E3): 100 MB in 1 MiB ranges is 100 calls, about 28 s sequential. **PDF text:** a step holds the xref entries it reaches (at 10 to 100 objects a page, 5,000 pages is 50,000 to 500,000 objects, about 1 to 8 MB of offsets [arith]), one page's decoded content, fonts and CMaps, and any object stream it opens. Today's reader does not fit: 0111 (1,354 pages, 15.9 MB) peaked at 126.8 to 128.0 MB at cap 112, survives 144 MB and dies at 128, 112 and 96 (F-MEM-0111, plat). Rebuilding it to a 22 to 59 MB working set is the largest single piece of work in A. **Scans:** page images are decoded in `pdf-worker` and OCR runs in `ocr-worker`, each its own isolate; `MAX_FRAME_BYTES` 61.3 MB RGBA refuses a page above about 15.3 MP while a 600 dpi A4 page is about 34.8 MP (RR-E6, CF-7). **Sheets:** a 50 MB xlsx unpacks to sheet XML several times larger and a shared-strings table of tens of MB, both streamed through access points and the spill of S3; unproven. **Archives:** directory by range (10,000 entries is about 1 to 2 MB), members inflated as streams to R2 multipart. **Text, CSV:** 1 MiB windows with a carry already exist (17 MiB CSV, 12 MB text); 50 MB extends the same windows.

> **Writer's note WN6.** REQUIREMENTS RR-F1 requires reading work "above the bytes under 64 MB" over the object's idle. At the as-built idle of about 87 MB that is 151 MB, above the object's 128 MB; it holds only with the ASCII bundle (50 + 64 = 114). CHALLENGES C1 records that no requirement states the object's total, including the plane. The brief's "about 40 MB" for a read stands.

A meets the standard only if every reader works inside these figures at 100 MB, 50 MB and 500 MB. Nothing live is above 41.5 MB (CHALLENGES §0.4).

**(c) Surviving a kill or a deploy.** The cursor and counters are stored with the units in one transaction, so the state after a kill is what the last transaction left. Every firing is idempotent by cursor and re-derives the alarm from durable state at start. The platform may re-run an alarm handler, which "will run from the beginning on the other machine" (D14), and retries a throwing handler at most 6 times, then drops it until `setAlarm` (D10, D12): the firing catches, re-arms before returning, and writes an attempt stamp first (S5). A deploy shuts the object down and what it does to a running alarm is not documented (D24, D25, PG2, P-M4). A killed range is redone (up to about 10 s). After every plane release owed work resumed late (40, 20 and 6 minutes were seen, CHALLENGES §4), because the reader dies with the deploy. The weak point is liveness: one alarm runs every consumer, the watchdog is a cron that runs "on underutilized machines" (CR2; slots were seen hours late) and cannot preempt a handler, and the gaps of G70 (28 to 64 s, stalls of 451 to 551 s, 32 min against 1.4 min for one file) are unexplained.

**(d) Progress and limits to the member.** Counters are written in the same transaction as the units, so the job row is exact, and screens read it in the same object. That is also the harm: with a tick running, Home took 7.7 to 7.8 s and the Queue 7.9 to 8.3 s against 2.2 to 3.9 s idle (G117; C14), cause unknown (G82, G86). Updates arrive each tick (about 10 s). Time to whole is unbounded by evidence (§4.2).

**(e) Tested at the platform's shape.** Local: Miniflare's real alarm semantics (spike S3), DO SQLite with the 2 MB limit, R2 ranges and multipart, kill by disposing the instance, the corpus through the real entry path, `--max-old-space-size` plus the byte ledger. Probe only: the 128 MB total with buffers, the CPU cut, G70's cause, a deploy over a running alarm, cron lateness. A's risk is exactly the unmeasured part, so a local pass says least here.

**(f) Classes.** By the shared shape: C3, C4, C6, C7, C8, C9, C11, C12 (the brief names C4, C6, C8, C9, C11; S4 adds C3 and C12, S6 C7). By discipline only: C1 (readers inside 22 to 59 MB), C2 (an overrun still holds the record's thread), C5 (alarm, watchdog and rotation are self-built), C13, C15. Not removed: **C14**, C10 and C17 (hand-written parsers; legacy Office, TIFF, HEIC, WebP, GIF, RAR and 7z stay unread), and C16 only partly (the scan consumer still shares the alarm).

**(g) Depends on.** §5 unknowns: **G70**, **G82/G86**, which resource killed 0111, deployed `cpu_ms`, real memory and plane idle, OCR in workerd, the platform inferences (kills and the 6 retries, a set alarm over a spent one, the alarm wall limit, 32 invocations in an alarm chain), the PUT body bound, and whether the standard's sizes can be read at all. Measurements: P-M2 (a to e), P-M4, P-M5, P-M6, P-M7, P-M8, P-M9, P-M10, P-M11; P-M1 and P-M3 for the ways in.

**(h) Modules.** *Rewritten:* `pdf-reader`, `office-readers`, `ooxml`, `odf-reader`, `csv-reader`, `format-registry`, `pdf-worker` (range, not the whole document, CF-35), `pdf-pixels`, `image-codecs`, `reading-pipeline`, `extraction`, `scheduler` (bounded firing, rotation, `stale` redefined: G91 to G95 become the plan), `plane` (job table, `cpu_ms`). *Kept:* `ocr-worker`, `sheet-worker`, `file-scanner`, `retrieval`, `content` (S2 and S4 edits). *Retired:* the three read modes, the `owe` hook, the reading consumers' separate arms. *New:* the range source, the byte ledger, the corpus generator. Effort: the lowest new platform surface; every reader is rewritten to ranges and the held round-8 causes become its plan.

---

### 3.2 Option B: a Reader object per document (Workers only, off the record's thread)

**What it is.** A new Durable Object class `Reader`, in its own Worker (so it does not share an isolate with the plane's 50 to 87 MB), one instance per read job (id = team and whole sha), with its own small bundle (only the readers it needs), its own SQLite (cursor, counters, owed units, attempt stamps, an outbox of unlanded batches), its own alarm and its own 30 s to 5 min CPU per invocation. Store only registers the job (S1) and receives units by RPC in bounded batches (the 32 MiB serialized limit is B6; in practice about 1 MB a batch, idempotent by job and batch number). Store's screens never wait on a read. The Reader drives `pdf-worker` and `ocr-worker` by binding. Liveness: the Reader's alarm re-arms itself every step, catching and re-arming before it returns (D12); Store holds the job row, and the cron watchdog checks job rows whose Reader has not reported within N minutes and pokes the Reader with one RPC (K4566's "only checks and re-arms" kept).

> **Writer's note WN5.** The brief says the Reader's bundle idles "a few MB". No input measures a readers-only bundle. The plane's 86.7 MB is mostly the cost of importing its module graph (about 77 MB) and 43.5 MB of two-byte source strings (diagnosis R6); the plane's reader sources are about 619 KB of its 27 MB bundle [`wc -c` of the module paths: `pdfstructure.mjs` 221 KB, `ooxml.mjs` 110 KB, `odf.mjs` 121 KB, `docx.mjs` 55 KB, `pptx.mjs` 48 KB, `formats-xlsx.mjs` 64 KB], and `pdf-worker`'s 276 KB of decoders is a separate Worker. The idle is certainly far smaller than the plane's; "a few MB" is not shown. Below I carry 20 MB as an assumption; P-M2(c) measures it.

**(a) Where each stage runs.** Column B of §3.0. The JavaScript readers run in the Reader's isolate, not Store's. The plane's own bundle shrinks (it is at 30.18 to 30.85 MiB of the 32 MiB limit, K4520) once reading code moves out, though `file-safety`, `format-registry` and the screens still import some readers.

**(b) Bounded memory.** Caveat (D1, D2): instances of one class may share an isolate and its 128 MB, so the number of concurrent Readers per team is capped, by Store counting `running` rows (the platform gives no control). Let I = idle (assumed 20 MB), N = Readers in one isolate, R = range MiB, 3 MB for a batch. Working set per Reader W = (128 - I - N x (2R + 3)) / N [arith]:

| | N = 1 | N = 2 | N = 4 |
|---|---|---|---|
| R = 8 MiB | **89 MB** | **35 MB** | 8 MB (too small) |
| R = 1 MiB | **103 MB** | **49 MB** | **22 MB** |

So with a cap of 2 and 1 to 2 MiB ranges each Reader has about 35 to 49 MB, which is above A's as-built figure (22 to 36 MB) and below its ASCII-bundle figure (59 to 73 MB); with a cap of 1 it has 89 to 103 MB, the brief's "60 to 100 MB". Per kind the arithmetic is A's with these W. B meets the standard if the range readers fit a step in them; headroom is better than A's, the reader rewrites are the same.

**(c) Surviving a kill or a deploy.** As A, per job. Each Reader's cursor and outbox are in its own SQLite; units reach Store by RPC and the cursor advances only after Store's acknowledgement, so a kill between the two re-sends a batch that Store ignores (idempotent by job and batch number). The Reader's alarm persists and wakes the object after an eviction. If it was lost, spent after 6 failures, or late, the watchdog's poke re-arms it. The Reader Worker deploys independently of the plane, so a plane release no longer kills reads; a Reader-Worker release does. Whether a deploy cuts a running alarm is P-M4. Because it is one job per object with its own alarm, G70's cause (a long consumer starving a shared alarm) is out of the path, but alarm latency is unbounded in the documentation (D22) and measured by P-M8.

**(d) Progress and limits to the member.** Store applies each batch with its counters in one transaction, so the job row stays exact. Store's thread now carries only the landing writes (a 1 MB batch with its index rows), not the parse CPU: C14's cause goes, its residue (landing cost with several Readers at once) is bounded by a landing rate limit and measured by P-M9. Updates reach the member per batch (seconds).

**(e) Tested at the platform's shape.** As A, with RPC between two objects (the 32 MiB rule is enforced locally: spike S7), a Reader per job under Miniflare, and the cap's effect on memory provable only on a probe (whether instances of one class share an isolate, P-M2(e)). Probe only: isolate sharing, alarm latency across many objects (P-M8), the CPU cut, a deploy over a running alarm.

**(f) Classes.** By the shared shape: C3, C4, C6, C7, C8, C9, C11, C12, C16. By design: **C14** (the long read is off the record's thread), most of **C1** (headroom 35 to 103 MB against 22 to 59). By discipline: C2 (a runaway step now costs one Reader, not the record), C5 (self-built still, simpler: one job, its own alarm), C13, C15. Not removed: C10, C17 (same hand-written parsers; the kinds of K4628 point 1 they lack must be written in JavaScript), the residue of C14 at landing.

**(g) Depends on.** §5 unknowns: deployed `cpu_ms`, OCR in workerd, the platform inferences (kills and the 6 retries, 32 invocations), the Reader bundle's idle. Measurements: P-M2 (c, d, e), P-M4, P-M5, P-M8, P-M9, P-M10 (the binding callee's own memory), P-M11; P-M1 and P-M3 for the ways in.

**(h) Modules.** *Rewritten:* the readers as A. *Kept:* `ocr-worker`, `sheet-worker`, `file-scanner`, `scheduler` for its other consumers. *Retired:* reading from Store's alarm; the reading consumer arms. *New:* the `Reader` class and its Worker (a fleet member via `bundler`, one `new_sqlite_classes` migration), the batch protocol (job, sequence, ack), the cap, the watchdog's poke. The installer deploys the Reader Worker. Effort: a new class and a bundle on top of A's reader rewrite, less A's alarm hardening.

---

### 3.3 Option C: Workflows carry the read (Workers readers)

**What it is.** Each read job starts a Cloudflare Workflow instance (id = team and whole sha, so a second `create` with the same id is the same job; locally it did not error and it woke a stalled instance, spike W). The Workflow class lives in its own Worker, `reading-flow`, with the JavaScript readers bundled; the plane gets a `workflows` binding (it has none today, PLATFORM §3). Each step reads one bounded piece from R2 (a page range, a row window, a batch of archive members, a few OCR pages), lands its units in Store by RPC inside the step, and returns a small reference (cursor and counts, at most 1 MiB, WF2). The platform carries durability: completed steps are not re-run after a crash or deploy, a failed step retries with back-off (up to 10,000 retries, WF10), sleeps are free, and an instance may have 10,000 steps by default, 25,000 at most (WF5). Store keeps only the job row and the units; no self-built ledger claim, alarm firing or watchdog is on the reading path (the scheduler stays for the record's other consumers, smaller).

**Step sizes and contract [design].** PDF: 100 pages or 1.3 MB a step, budgeted by bytes and objects (50 to 100 steps for 5,000 pages). Text and CSV: 1 to 8 MiB windows. Sheets: 1,000 to 10,000-row windows (100 to 1,000 steps for 1M rows; the cursor carries an access point, S3). Archives: 100 members a step; each member is then its own instance. OCR: 5 to 10 pages a step, steps in parallel (`Promise.all`; 50 parallel is a P-M14 item); a 5,000-page scan is 500 to 5,000 steps, inside the default (E15; set 25,000 for headroom). A step throws only for transient and resource failures; a deterministic one returns `{unit_failed, cause}` so the Workflow never ends `errored` with its state lost. It writes the attempt stamp (S5) to Store first and lands its batch idempotently by (job, step). It asserts its result under 1 MiB itself. Nothing with side effects sits outside a step: "logic outside of the steps may be duplicated" (WF12).

**(a) Where each stage runs.** Column C of §3.0. Readers run in a step in `reading-flow`; `pdf-worker` and `ocr-worker` by binding; Store lands the units.

**(b) Bounded memory.** A step is a Worker invocation ("Workflows are Worker scripts", WF-LIM); the pages state no step memory, so 128 MB shared by steps in one isolate is an inference (PG14, P-M16). The flow Worker holds only the readers (idle assumed 20 MB, WN5). A read step runs at width 1, so W is B's N = 1 figure: **89 MB** with 8 MiB ranges, **103 MB** with 1 MiB. Fan-out is for steps that only call another Worker (`ocr-worker`, `pdf-worker`), whose isolates do the work. A step's memory is gone when it ends, so nothing accumulates across a 5,000-page read.

**(c) Surviving a kill or a deploy.** The engine keeps completed steps; a restarted engine "will start over from the beginning of that step" (WF12), which the local run confirmed (only the in-flight step ran twice). A kill costs one step (about 7 s of PDF work, a text window, a few OCR pages), attributed to its unit by the stamp. The flow Worker deploys independently of the plane, so a plane release does not touch reads. **What a deploy of the flow Worker does to a running step is not documented** (WF17, P-M14); locally the instance did not resume until poked. The writer adds one thin check outside the reading path: a job row with no progress for N minutes has its instance re-created by id, run by the existing `*/5` cron. It does not replace the platform's liveness; it is K4566's second independent clock and shows whether P-M14 needs it. Version skew is a real risk: an instance started under one reader version resumes under the next after a deploy; the job row records the reader version, and a release keeps the step contract compatible across one version [design].

**(d) Progress and limits to the member.** Each step lands units and counters in Store in one RPC, so the job row is as exact as in A and updates arrive per step (seconds). `instance.status()` is for operators. Waiting on a busy Store costs nothing (a sleep is free), so back-pressure on landing is a sleep, not a held thread. Production step overhead is unmeasured (locally 4 ms).

**(e) Tested at the platform's shape.** Local: Workflows run in Miniflare (create, status, pause, resume, retries with back-off); the harness gains a poke-after-restart helper; a test asserts "completed steps run once, the in-flight step may run twice"; the 1 MiB rule is the contract's own assertion; the corpus runs through the real entry path. Probe: P-M14 (5,000 no-op steps; 50 steps of 1 MiB and 1 MiB + 1; a deploy over a running step; a stream-returning step retried; 50 in parallel), P-M16 (step memory), P-M15 (concurrency), P-M5, P-M9, P-M3.

**(f) Classes.** By the shared shape: C3, C4, C6, C7, C8, C9, C11, C12. By design: **C5 for reading** (platform-managed; G70 is off the reading path, though it remains for the scheduler's other consumers), **C14** (parse CPU off Store's thread; landing writes remain), most of **C1** (no plane idle in the step's isolate). By discipline: C2 (a mis-sized step costs one step), C13, C15. Not removed: C10 and C17 (hand-written parsers; the kinds of K4628 point 1 they lack must be written in JavaScript); C16 by the shared shape. New exposure: step memory (PG14) and a product dependency billed per step.

**(g) Depends on.** §5 unknowns: OCR in workerd (the fan-out width), 32 invocations (P-M11), the PUT body bound; **new**: whether a deploy kills or finishes a step (WF17), unpoked resume, step memory (PG14), concurrency 10,000 against 50,000 (PG6, irrelevant at team scale). Measurements: P-M14, P-M15, P-M16, P-M2, P-M5, P-M9, P-M10, P-M11, P-M3; P-M1 for uploads.

**(h) Modules.** *Rewritten:* the readers as A and B, `reading-pipeline` and `extraction` (steps in place of ticks), `plane` (job table, binding), `scheduler` (smaller: the reading arms go). *Kept:* `ocr-worker`, `pdf-worker`, `sheet-worker`, `file-scanner`, `retrieval`, `content`, `csv-reader`. *Retired:* the reading arm of the ledger, `PENDING_INTERRUPTED_MAX`, the claim and rotation logic G91 to G95 would have built. *New:* the `reading-flow` Worker, step contract and wrapper, the poke check, the Workflow binding and its installer step. Effort: moderate; a new product dependency; the readers' range rewrite as in A and B, without A's alarm hardening.

---

### 3.4 Option D: Workflow-carried, container-read heavy kinds (the lane's recommended candidate)

**What it is.** As C for the carrier. The heavy kinds are read in a Cloudflare Container (reached only through its Durable Object, CT6) with mature native tools in place of hand-written parsers: PDF text and structure (poppler, MuPDF or PDFium), OCR (native Tesseract with language packs), office and legacy formats (LibreOffice headless for .doc, .xls, .ppt, .rtf, plus direct OOXML and ODF parsing), archives (libarchive or 7z: TAR, GZ, 7z, RAR as well as ZIP), images (libvips, ImageMagick: TIFF, HEIC, WebP, GIF, CMYK, progressive JPEG). Light kinds (plain text, CSV and TSV, HTML, JSON, XML) stay in Workers steps. The container streams the file from R2, reads a range of pages or members per call and returns units; each Workflow step is one container call over one range, so a container killed by a deploy or a host restart costs one range.

> **Writer's note WN4.** The brief lists "small files under a declared-size threshold" among the light kinds and also says "one path per kind: the kind decides, not the size". They pull apart: a small PDF read in a Worker step and a large one in the container gives PDF two paths, which S3 and C8 forbid. I keep the brief's text and draw D with the kind deciding (a small PDF also goes to the container). The threshold has a cost reason: a container is billed from the call until it sleeps, so each wake-up costs the inactivity timeout (§4.4). Whether small heavy-kind files take the Worker path anyway, at the price of two paths, or wake-ups are batched, is BOB's, to be settled by P-M17's idle-awake cost.

**Container side [design].** Two images, so the common path stays small (cold start depends on image size, CT9): `reader-core` (PDF tools, Tesseract with the English model, libvips, 7z or libarchive, streaming OOXML, ODF and sheet parsers, a small HTTP server) and `reader-office` (LibreOffice, legacy formats only). A call is `POST /read {job, kind, source, range, budget}` and returns `{units, cursor, counts, causes}` under 512 KiB; larger output goes to R2 and returns a reference (step results are 1 MiB, WF2). The container reaches R2 through an outbound handler, the S3 API, or FUSE (slower than a local disk, CT18); the default is to copy the object to the 8 GB instance disk once and read local ranges, since native tools want a seekable file; P-M17 measures all three. Instances are named per job (sticky: the disk copy is reused) or pooled by shard; `max_instances` caps fan-out and spend (the scanner has 3, agent-runner 10). A new Worker `reader-container` follows the fleet-member precedent of `file-scanner` and `agent-runner`: a container class in `fleet-member.json`, images published digest-pinned to `docker.io/civicsmith/<image>` by the existing `container-images.yml` workflow, because Containers do not pull from `ghcr.io` (file-scanner R10, N1242, K3805).

> **Writer's note WN2.** The brief cites "27 s seen for agent-runner's large image". The repository comment (`agent-runner/wrangler.jsonc`) and PLATFORM §3 say that **at the default instance size (1/16 vCPU, 256 MiB) one conversation's start-up took 27 s**, which is why the class is `standard-1`. The 27 s is a size effect, not an image-size effect, and no input measures a start at `standard-1`. The documented figure is often 1 to 3 seconds, dependent on image size (CT9). The brief's text is otherwise unchanged.

**(a) Where each stage runs.** Column D of §3.0. Workers work is as C; the container does the heavy-kind reading. Member-facing point reads (§2.3) stay in a Worker or on precomputed rows; a cold container cannot meet a 2 s act.

**(b) Bounded memory.** `standard-1` is 4 GiB, ½ vCPU, 8 GB disk; `standard-4` 12 GiB, 4 vCPU, 20 GB (CT2, CT3); not the 128 MB isolate (E7). Per kind [spike N unless marked]:

| Kind | Tool and unit | Peak memory | Against 4 GiB |
|---|---|---|---|
| PDF text, 5,000 pages | `pdftotext`, 100-page range | 17.5 MB (`mutool` 10) | 0.4% |
| Scan OCR | Tesseract, one page | 55 to 146 MB | one process in practice (½ vCPU) |
| Images | `vips thumbnail`, 48 MP JPEG | 43 MB (ImageMagick 388) | far inside; a pixel bound is still stated (S6) |
| Legacy and small office | LibreOffice `--convert-to` | about 220 MB | inside; **not** measured at 50 to 100 MB documents; not for 1M-row sheets (221 MB at 20,000 rows) |
| xlsx, ods, 1M rows | a streaming parser | **not measured** (no spike ran a sheet reader) | to be proven (§5) |
| Archives, 500 MB | `7z l`, `7z x -so` one member | 6 MB | the archive is a file on the disk; one member at a time |

The Worker side receives 512 KiB or less, so the 128 MB question leaves the heavy path. What remains is disk (a 500 MB archive plus one member fits 8 GB) and the time to bring the bytes in ([live-only], P-M17; at an assumed 10 MB/s, 500 MB is 50 s and 100 MB is 10 s [arith]).

**(c) Surviving a kill or a deploy.** As C for the carrier. The container is stateless (it reads R2 and returns units), so a stop costs one call. It can be stopped by an inactivity timeout, a rollout, a process exit, a host restart on an irregular cadence ("Cloudflare does not guarantee that any container instance will run for a set period", CT10) or an out-of-memory restart (CT12). SIGTERM gives it up to 15 minutes (CT11): it finishes its range and takes no more. A DO-managed instance does not join application-wide rollouts; the object picks the image at `start()` (CT14), so a plane release does not replace a running reader. After a deploy the object restarts without its inactivity timeout, which the constructor must set again (CT15); the Container class owns the alarm, so scheduling uses `schedule()` (CT17). A call is kept under about 5 minutes: an object holds a pending operation at most 15 minutes (D27) and is billed wall time while it waits (D37). A step retried while the old call still runs is made safe by cancellation on connection abort and landing idempotent by (job, step). A page that kills the process is attributed by the attempt stamp, retried once with half the budget, then stated.

**(d) Progress and limits to the member.** As C. Steps are larger for text (500 to 1,000 pages, seconds) and smaller for OCR (5 to 10 pages, 10 to 50 s). Rates are steadier than hand-written JavaScript's, so the "by when" is better founded. A refusal is made in the plan step with size and bound, or with a cause code the tool reports (encrypted, damaged, unsupported).

**(e) Tested at the platform's shape.** The image is an ordinary program: the corpus runs against it in Docker with the instance type's limits (`--memory 4g --cpus 0.5` [inference: container limits can be enforced locally, isolate memory cannot, E21; the numbers are CT2]); the step-to-container contract is tested with a fake container in Miniflare; the object-to-container wiring under `wrangler dev` was not run here and is to be verified. A parity corpus compares the JavaScript reader and the native tool on the same files, kind by kind. Probe, P-M17: cold start from sleep and from never run; first byte of a 100 MB object by outbound handler, S3 API and FUSE; a running job across `wrangler deploy` under the default and `immediate` rollouts; SIGTERM to SIGKILL; a week of an idle probe for host restarts; idle-awake cost at `standard-1` and `standard-4`; whether the timeout survives an object restart.

**(f) Classes.** By the shared shape: C3, C4, C6, C7, C9, C11, C12, C16 (the reader container is separate from the scanner's). By design: **C1**, **C2**, **C14**, **C5** (Workflows), **C8** (one path per heavy kind; see WN4), and **C10** and **C17** for the heavy kinds (tools with decades of use cover fonts, encodings, filters, TIFF, HEIC, WebP, GIF, CMYK, legacy Office, TAR/GZ/7z/RAR, encryption detection; the kinds required are Bob's list, K4628 point 1, and only kinds beyond it are open). By discipline: C13, C15, C2 for light kinds.

**New exposures D adds** (not in the brief; found in the inputs): (1) *parity with the evidentiary rules*: tier 1 reads "through `/ToUnicode` only (no character guessed; unmapped codes are named markers)" with a provenance chain, per-page tier and `image_content` flags (RR-E2, RR-E3, K4434, K4461, K4478); a native extractor may map glyph names or guess, so the wrapper must report unmapped codes and per-page glyph counts, or that kind keeps its JavaScript reader behind the same interface; (2) *point reads* (§2.3); (3) *licences* [writer's knowledge, not from the inputs, to be checked]: poppler is GPL, MuPDF AGPL, unRAR restricted, while PDFium, libvips, libarchive, Tesseract and LibreOffice are permissive or weak-copyleft, and an image on Docker Hub is a redistribution; (4) *native parsers on hostile input* (Fw §15): memory-unsafe code, contained by a no-internet, disposable container holding one job's bytes, as the scanner containers already run (PLATFORM §3); (5) *no container in this project has read a real file*: `file-scanner`'s container scan path has never run on real files (C16) and `agent-runner` started at the default size in 27 s; (6) *maturity*: the `durable_object` scheduling policy is "in public beta" (CT13), and no page gives a `max_instances` ceiling, a start-rate limit or a cold-start guarantee (PG18).

**(g) Depends on.** Everything C depends on, plus P-M17, P-M3(c) (ranged reads from a container) and P-M24 (cost reconciliation). The OCR-in-workerd unknown is moot for OCR moved to the container; G70 stays off the reading path; the deployed plane idle matters less (the plane shrinks).

**(h) Modules.** *Kept:* `csv-reader`, the text and HTML paths of `reading-pipeline`, `format-registry` (detection from range reads), `file-safety` (its structure check keeps the JavaScript readers it imports until it becomes a `grade` job kind in the same container), `content`, `retrieval`, `scheduler` (smaller), `sheet-worker`, `ocr-worker` (until OCR moves). *Rewritten:* `reading-pipeline` and `extraction` (tiers become a container client), `plane` (job table, Workflow binding). *Retired, kind by kind and only after the parity corpus passes:* `pdf-reader`'s parser (221 KB, apart from what `file-safety` imports), `pdf-worker` (276 KB: decoders and tier 2), `pdf-pixels`, `image-codecs`, the wasm OCR engine, the heavy-kind parts of `office-readers` (docx, pptx, xlsx, 167 KB), `ooxml` (110 KB, apart from detection and the safety lists) and `odf-reader` (121 KB): at least about 895 KB of source in the modules sized here (`pdf-pixels`, `image-codecs` and the OCR engine besides), the largest and most fragile code in the evidence, replaced instead of hardened. The plane's bundle (30.18 of 32 MiB) and idle (50 to 87 MB) shrink. *New:* `reader-container` (two images, the Container class, the call contract), `reading-flow`, the step contract, the parity corpus, the CI image build, an installer step (K3447) and a `bundler` fleet-member entry. Effort: the highest new surface (image, its object, the Workflow), against the highest retirement of fragile code.

---

## 4. Comparison

### 4.1 The table

| Axis | A in-object | B Reader object | C Workflows | D Workflows + container |
|---|---|---|---|---|
| **Reliability** | Shared shape only; C1, C2, C14 stay; liveness self-built on the unexplained G70, G82 | Adds C14 and most of C1; liveness self-built, simpler; isolate sharing caps concurrency | Adds C5 for reading, C14, most of C1; rests on deploy and step-memory behaviour (WF17, PG14) | Adds C1, C2, C5, C8, C14 and most of C10, C17 for heavy kinds; rests on Containers (CT10, CT14) and on tool parity |
| **Efficiency** | 22 to 59 MB working set; one heavy row a tick; screens contend (Home 7.7 s) | 35 to 103 MB; Readers in parallel, capped 1 to 2 | 89 to 103 MB a step; steps fan out | 4 to 12 GiB; 1.3 ms a PDF page; fan-out by instance |
| **Member's experience** | Updates each tick; time to whole unbounded by evidence; slow screens during a read; plane releases interrupt | Updates per batch; screens stay fast; same wasm OCR hours | Updates per step; reads survive plane releases; OCR fans out | As C; steadier rates; more kinds and larger files; start-up latency per wake |
| **Cost** (Workers Paid) | cents a read; about $1 to $2.50 a month gross (§4.4) | same | same, plus cents of steps | same order; adds container time (wake-ups, OCR hours) |
| **Effort from today** | readers rewritten to ranges; alarm hardened (G91 to G95) | A's readers plus a class and a Worker, less alarm hardening | A's readers plus a Workflow Worker; no alarm hardening | C plus an image, a container class, wrapper, parity corpus; retires about 895 KB of source over time |
| **Testability** | Miniflare alarms, SQLite, ranges; memory, CPU, G70 live-only | as A plus cross-object RPC; isolate sharing live-only | Workflows run locally (poke needed); memory, deploy live-only | image tested in Docker at instance limits; wiring and start-up live-only |
| **Platform risk** | Most unmeasured behaviour; nothing new | Medium: isolate sharing, alarm latency | Medium: a new product (billing since 2026-08-10), deploy semantics | Highest new surface (beta parts, no start-rate figure); isolated per kind; fallback C |

### 4.2 Time to whole

Quiet system, from the moment the bytes are in R2. Bases: [spike], [live] (the family evidence), [arith]. None was measured at the standard's size on the platform (CHALLENGES §0.4).

| Case | A | B | C | D |
|---|---|---|---|---|
| **100 MB, 5,000-page text PDF** | compute about 6 min (50 ranges of 100 pages, each about 3 s of fetch and parse plus 0.04 s a page, so about 7 s a range [arith]); one heavy row a tick, median gap 17 s: 15 to 30 min, tail unbounded (G70 gaps to 451 s) | 6 to 10 min | 6 to 8 min in sequence; about 2 min with 4 steps in parallel (PG14, P-M16) | about 1 to 2 min: 6.5 s of extraction [spike]; the rest is the R2-to-container copy and a 1 to 3 s cold start [live-only] |
| **5,000-page scan** | serial wasm 3 to 11 h (2.2 h at 1.6 s a page; about 14 h at 10.4 s, WN3); A cannot fan out without starving the record | same per Reader; 6 calls in flight would give 0.5 to 1.8 h, unproven (P-M10, P-M11) | width W: 3 to 11 h / W: W = 4 0.8 to 2.8 h; W = 8 0.4 to 1.4 h [arith] | native one process 2 to 7 h; 4 cores about 1.9 h [spike]; N `standard-1` instances 2 to 7 h / N if each runs at the single-process rate (a half vCPU may halve it) |
| **50 MB / 1M-row sheet** | CSV about 75 s of compute at 1.5 s/MB [live]; xlsx (about 300 MB of XML) about 2 min of CPU at 0.37 s/MB [live, ODS]; with gaps 5 to 15 min | 2 to 5 min | 3 to 6 min (100 to 1,000 steps) | not measured (no spike ran a sheet reader); bounded above by the JavaScript figure: 1 to 3 min [arith] |
| **500 MB archive** | R2 time for the members about 15 to 20 s at the local 28 to 33 MB/s [spike]: unpack in minutes; then **each member a job**, one heavy row a tick: 10,000 members at 17 s is about 47 h [arith] | unpack in minutes; members 2 at a time: about 2.8 h at 2 s each | unpack in minutes; members as parallel instances: about 17 min at 20 wide | unpack 1 to 3 min plus the copy of 500 MB [live-only]; members batched at about 0.1 s each: about 17 min |
| **50 MB image (one page)** | baseline JPEG and PNG only; OCR 1.6 to 8 s plus decode; TIFF, HEIC, WebP, GIF, progressive, CMYK not read | same | same | libvips 0.2 to 0.5 s plus OCR 1.5 to 5 s; those formats read |

> **Writer's note WN3.** The inputs carry three OCR times per page. About 1.6 s a call inline on the clean renders walked live (CHALLENGES §4). 6.7 to 7.9 s dense and 2.0 to 2.5 s sparse for tesseract-wasm in the spike. And **about 10 s a page deployed** in REQUIREMENTS RR-E4 (5,000 pages about 13.9 h), which rests on `ocr-worker`'s code comment of 10,400.6 ms CPU a page at 300 dpi (PLATFORM §3; a comment, not measured live; OCR has not been measured live since G67 landed). The brief's "3 to 11 h wasm" spans the spike's sparse and dense pages. At the 10.4 s figure the serial time is about 14 h and the CPU about 52 million ms. I keep the brief's range and carry about 14 h as the upper figure of the unmeasured live case.

The one result that holds in every column: a 5,000-page scan takes hours unless pages run in parallel. D's case does not rest on OCR speed.

### 4.3 Classes C1 to C17

S = removed by the shared shape, in all four. D = removed by the option's design. P = by discipline only (tests and rules, no structure forces it). N = not removed. (u) = rests on an unknown or a measurement (§3 (g)).

| Class | A | B | C | D |
|---|---|---|---|---|
| C1 memory at size | P (u) | D, residue P (u) | D, residue P (u) | D (heavy kinds); P for light |
| C2 work per step grows with the file | P, uncontained (an overrun holds the record) | P, contained to a Reader | P, contained to a step | D (native tools stream) for heavy; P for light |
| C3 piece boundaries | S | S | S | S |
| C4 owed work not registered | S | S | S | S |
| C5 liveness | P (u: G70) | P, simpler | D for reading (u: WF17) | D (u: WF17, CT10) |
| C6 inline versus background | S | S | S | S |
| C7 bounds ad hoc | S (the bar itself rests on C1) | S | S | S |
| C8 many paths | S | S | S | S + D (one path per heavy kind) |
| C9 identity | S | S | S | S |
| C10 formats mishandled | N | N | N | D for heavy kinds (parity: u) |
| C11 state not from the record | S | S | S | S |
| C12 storage limits | S | S | S | S |
| C13 tests not at the platform's shape | P | P | P | P, with container limits enforceable locally |
| C14 contention on the one object | N | D (residue: landing writes) | D (residue as B) | D (residue as B) |
| C15 process | P | P | P | P (fewer heavy paths) |
| C16 safety and third parties | P (still on the shared alarm) | S | S | S |
| C17 capability absent | N (the K4628 kinds lacking must be written in JS) | N (as A) | N (as A) | D for heavy kinds (K4628's list by tool; kinds beyond it open) |

### 4.4 Cost on the team's Cloudflare plan

All figures use PLATFORM §6.4's prices and are gross marginal charges, before the plan's included allowances (30 M CPU ms, 1 M object requests, 400,000 GB-s, 50 M rows written, 500,000 steps, 25 GiB-hours and 375 vCPU-minutes of containers). Assumptions: a unit is one stored row plus 4 index rows (5 rows written; the platform's real count is P-M9, P-M24); a Worker CPU millisecond is $0.02 per million; OCR on Workers is 1.6 to 10.4 s of CPU a page (WN3); native OCR is 1.45 to 5.0 s a page; a container hour awake at `standard-1` is at most $0.074 (memory and disk $0.038 for the whole awake time, CPU at most $0.036, active use only: CT21, CT22); a step is $8 per million beyond the allowance. A sheet stored one row per source row would be $1 to $2 a sheet (PLATFORM §6.4); S4 stores about 500 units and cells on demand, so it is cents.

**Per heavy read.**

| Read | A | B | C | D |
|---|---|---|---|---|
| 100 MB, 5,000-page text PDF | $0.03 (rows $0.025, CPU $0.007) | $0.03 | $0.03 | $0.03 (rows; container about $0.001) |
| 5,000-page scan | $0.20 to $1.15 (OCR CPU $0.16 to $1.04; rows $0.025; the object's wait $0.01 to $0.08) | $0.20 to $1.15 | $0.19 to $1.10 (steps $0.004 to $0.04) | $0.19 to $0.62 at one process; up to about $1.1 if a half vCPU doubles the wall; a 4-core `standard-4` run about $0.80 |
| 50 MB / 1M-row sheet | $0.01 | $0.01 | $0.01 to $0.02 (up to 1,000 steps) | $0.01 |
| 500 MB archive, 10,000 members (unpack only) | $0.05 (R2 Class A for 10,000 member puts $0.045) | $0.05 | $0.05 | $0.06 |

**Per month at an assumed modest load.** About 1,000 files: 940 ordinary (up to 10 MB, 40 units each), 30 large text PDFs (1,500 pages), 9 scans (eight of 300 pages and one of 5,000: 7,400 OCR pages), 6 sheets of 400,000 rows, 2 archives of 300 MB. D is assumed to wake the container 150 times with a 5 minute inactivity timeout (12.5 h awake, $0.48 of memory and disk). Gross: **A and B about $0.9 to $2.3** (ordinary $0.25, large PDFs $0.29, OCR $0.30 to $1.70, the rest $0.08); **C about $0.9 to $2.2**; **D about $1.3 to $1.9** (ordinary $0.72 with the wake-ups, large PDFs $0.23, OCR $0.27 to $0.85, the rest $0.09).

Net of the allowances most of it is free: 0.5 M rows against 50 M included; Workers CPU 18 to 86 M ms against 30 M (shared with everything else the plane does); D's 15 to 23 standard-1 hours (62 to 92 GiB-hours of memory) against 25 GiB-hours included, so about $0.3 to $0.6 beyond. Ten 5,000-page scans in one month are $2 to $11 in A, B and C and $2 to $6 in D. The plan's $5 minimum is paid in any case. **Cost does not decide between the options at this load.** D's only distinct line is container time, driven by wake-ups times the inactivity timeout and by OCR hours, not by bytes; each wake costs about $0.003 at a 5 minute timeout. A short timeout, batching, and the choice in WN4 move it; P-M17 and P-M24 measure it. Containers need Workers Paid (CT1), which the plane already requires.

### 4.5 The prose behind the rows (efficiency, testability and platform risk are in the table)

**Reliability.** Reading fails the same few ways in every family (CHALLENGES §1). The shared shape removes the registration, bound, path, identity and state classes whatever the carrier; the cost of a step and the shared thread are what the options decide. In A a step is bounded only by discipline and shares the record's thread, so an overrun takes the screens with it (C14), as 0111's eight kills and the 38 s ODS did, and liveness rests on the scheduler gaps (G70) that nothing in the lane explains. B takes the read off that thread and gives each job its own alarm, but still depends on alarm latency (D22) and on how many Readers share an isolate (D1). C hands liveness to the platform; its two unknowns are exactly what the local spike could not show, a deploy over a running step and a step's memory (WF17, PG14). D adds the only structural answer to the memory and format classes: a 4 GiB container in place of 22 to 59 MB, and tools with decades of use on fonts, filters, encodings, TIFF, HEIC, legacy Office, 7z and RAR. Its price is the exposures listed at 3.4 (f).

**Member's experience.** Every option shows the S7 states, a notice and a "by when". The differences are freshness and steadiness: in A a long read slows the screens (Home 7.7 s with a tick running) and every plane release interrupts it (owed work resumed 6 to 40 minutes late after redeploys); in B, C and D neither happens. D reaches the largest files and the most kinds by design and has steadier rates; its price is a start-up latency per wake that a member sees only as a slightly later first "being read".

**Effort from today.** The shared shape is common and comes first. Beyond it the range rewrite of the readers (S3) is the largest cost in A, B and C alike, and A needs the alarm hardening (G91 to G95) on top; B adds a class, a Worker and a protocol; C adds a Workflow Worker and a binding and needs no alarm hardening; D adds an image, a container class and a wrapper, and retires as parity is proved about 895 KB of source (sizes at 3.2 and 3.4 (h)), the project's largest and most recurrent source of failure. D replaces the heavy-kind readers where A, B and C rewrite them, so part of its extra surface is paid by code it does not rewrite.

---

## 5. The recommendation

**D, staged** (the lane's, from the brief). It is not a decision; it goes to Bob through FOR-BOB.md and the details to BOB.

### 5.1 Why D, and why staged

The evidence's largest and most recurrent classes (C1, C10, C17) live in the hand-written parsers for heavy kinds; native tools in a large container remove them instead of bounding them, and a Workflow carrier removes the self-built liveness (C5) and the shared thread (C14). The shared shape is needed under every option and removes C3, C4, C6, C9, C11 and C12 at once; C is also the fallback; and each container reader must be proven before it replaces a JavaScript one.

### 5.2 The order of work, at a high level

(The detailed gap is deliverable 6, after Bob confirms; tranche order and what a tranche holds are BOB's.)

**Stage 0: measure first (Ob17).** Cheap probes first, on a throwaway Worker and object on the pinned account: P-M1 (body cap on the team's zone, which decides how a 100 MB file and a 500 MB archive reach R2), P-M3 (R2 ranged reads and a presigned multipart), P-M2 (memory with buffers; idle of the deployed bundle), P-M5 and P-M6 (CPU and the clock), P-M9 (SQLite landing cost). Before Stage 2: P-M14 (Workflows: steps, 1 MiB edge, a deploy over a running step, parallel steps), P-M16 (step memory), P-M4 (a deploy over a running alarm, for whatever stays on the alarm). Before Stage 3: P-M17 (Containers). P-M24 after each, to reconcile cost.

**Stage 1: the shared shape, on the existing carrier.** First the harness and corpus generator (S9) and the bounds table (S6), so each later step is seen failing first; then identity and its migration (S2), the READ JOB table and its registrar on every door (S1), units and the single completeness (S4), the progress rule and attempt stamps (S5); then the reader contract (S3) with the readers behind it, starting where ranges already exist (PDF ranges; text and CSV windows) and rewriting the rest to range sources; then the screens drawing the job row (S7) and safety on its own jobs (S8). At the end the carrier is still Store's alarm, now on the job table; C3, C4, C6, C9, C11, C12 and most of C8 are gone. The held fixes G91 to G95 (K4812, K4814) are not built as such; whether any is needed in the interim is BOB's.

**Stage 2: the Workflow carrier (C).** The step contract and wrapper, the `reading-flow` Worker, the binding and the installer step; light kinds first (text, CSV, HTML), then the Workers readers behind the same step; the poke check; the reading arm of the ledger retired once the corpus passes through steps at the standard's sizes.

**Stage 3: the container reader, kind by kind, behind the same step interface.** Each kind is proven on the generated corpus at the standard's sizes, on a parity corpus against the JavaScript reader, and on a live probe, before it replaces that reader. A suggested order (BOB's): PDF text and structure first (the largest cause family and the strongest spike, with parity rules RR-E2, RR-E3 and the family report's proposed 64-file PDF corpus to prove against), then archives and images (capability the JavaScript lacks: 500 MB, TAR/GZ/7z/RAR, TIFF, HEIC, WebP, GIF), then OCR (the width and cost), then office and legacy formats. After each, the retired reader's source leaves the plane.

### 5.3 What would change it

The brief's three: P-M17 showing containers unreliable or slow to start under the team's load; P-M14 showing Workflow steps lost on a deploy; Bob preferring no container cost (then C). The writer adds, as further triggers: P-M16 showing a step's memory far below 128 MB (the readers then need B's smaller figures, or move to the container sooner); a native tool failing parity with the evidentiary rules for a kind (that kind keeps its JavaScript reader behind the same interface, in a Worker step); a licence ruling against a candidate tool; and P-M1 showing the zone cap blocks a 100 MB or 500 MB upload (the standard cannot be met at the door under any option, so that is Bob's, money or experience).

### 5.4 Fallbacks, and why A is not one

If containers disappoint, the fallback is **C**: Stage 2's carrier keeps working and the heavy kinds stay JavaScript readers that Stage 1 already rewrote to ranges; the kinds the JavaScript cannot yet read that Bob's list requires for the beta (K4628 point 1: .doc, .xls, RTF, .eml, .msg, TIFF, HEIC, WebP, GIF) need new JavaScript readers, the work D avoids; kinds beyond his list (7z, RAR) stay unread. If Workflows disappoint (P-M14), **B** carries the same step interface. **A is not a fallback.** It keeps the record's isolate and thread as the reader's (C1, C14); it keeps the self-built liveness whose stalls (G70) are still unexplained; it has been hardened for four rounds with the failures returning on the next path (CHALLENGES §3); and the work it needs (every reader to a 22 to 59 MB working set, plus the alarm hardening of G91 to G95) contains C's reader rewrite plus work that C makes unnecessary. Going from A to C later costs a carrier adapter; starting at A only adds that work first. Stage 1 is A's good part (the shared shape) without A's weak part (the carrier).

---

## 6. What is Bob's

For FOR-BOB.md, sorted under P17; one line each, asking nothing K4628 or K4630 already answers. Each will carry an explanation he can follow, the options, and the recommendation.

1. **The architecture, at its high level (A, B, C or D).** Where reading runs: inside the record's object, in a separate object, in a durable job engine, or in a larger machine for the heavy files. Recommendation: D, staged, with C as the fallback.
2. **Money.** Whether to accept a container line on the Cloudflare bill (cents a read; about $1 to $2.50 a month gross at the assumed load; $0.2 to $1.2 for a 5,000-page scan in every option) and how much to spend on speed (parallel width shortens a scan at the same compute).
3. **Time.** Whether a member is promised a time to whole and in what words (B-3, Q-Q1): a 5,000-page scan takes hours in every option, 2 to 14 h in one stream, about 1.9 h at four cores or fewer with more width.
4. **What members experience.** The states and words (the design stream's), the refusal sentence naming the bound, a notice on finished or stopped, and whether a safety hold gates reading (B-S7, Q-Q7).
5. **Kinds beyond his list.** Bob's list for the beta is set (K4628 point 1), so which of TIFF, HEIC, .doc, .xls and the rest are read is not asked: under every option they must be read, and D reads them by tool. Open only: kinds beyond the list (TAR, GZ, 7z, RAR) and OCR languages beyond English (Q-Q5, B-S4), which D makes cheap to add.
6. **The standard's reading.** What "100 MB or 5,000 pages" refuses on (Q-N9); whether the alpha ships at the standard (Q-N1); and, if P-M1 shows the zone caps the body, whether a larger file uploads straight to R2 or the plan changes.

Everything else is BOB's, decided and recorded in `build/rulings.md`: Workflow against object details, which tools, step sizes, thresholds, container size and timeout, the order of work, the schema and its migration, the harness.

