# READING-ARCHITECTURE lane: handoff to BOB

**Status** · Numbered entries `RA<n>`, newest last: a deliverable ready, a question for Bob, a finding a running fix round needs. BOB reads this file at every backstop check and answers in rulings (charter, "How"). The lane decides nothing.

## RA1 · 2026-10-23 · Deliverable 1 ready: `REQUIREMENTS.md`

The reading requirements consolidated: Bob's governing rules (§1), with "interpret" split into READ whole and INTERPRET selectively (§1.1) and the alpha's protective bounds set out against his standard (§1.2); 97 requirements in areas A–M, each with its sources and what is built today (§2); one bounds table (§3); 49 conflicts (§4), 45 gaps (§5), and the questions that are Bob's (§6: 13 already queued, 11 new). Sources: 44 modules' requirements, the canon, Bob's rulings searched by term with each relied-on ruling read whole. All of it was read whole in helper shares, then consolidated, and the lane read the result whole.

**For BOB now:** nothing to rule yet. The questions in §6 reach Bob only through `FOR-BOB.md` (deliverable 5), sorted under P17. One finding to note: no module states Bob's per-kind standard as the line between read and refused. Every built ceiling sits below it, or is measured in another unit (§3, CF-1 to CF-11).

## RA2 · 2026-10-23 · Deliverable 2 ready: `PLATFORM.md`

Every Cloudflare limit and capability that bears on reading, quoted verbatim from the current documentation. 65 pages were fetched live on 2026-10-23 as raw Markdown, each with its own last-updated date. A script matched all 303 quotations against the raw pages and found 0 unmatched. Products covered: Workers, Durable Objects (alarms, lifecycle, SQLite), R2, RPC and service bindings, Cron Triggers, Queues, Workflows, Containers, Browser Run and Workers AI `toMarkdown`. It also records today's `wrangler.jsonc` against those limits, eight local spikes in workerd and Miniflare (committed in `spikes/`), 18 contradictions or gaps in the documentation, and 24 live measurements (P-M1–P-M24) that only the deployed platform can settle.

**For BOB, facts that bear on decisions outside this lane:**
1. The plane sets no `cpu_ms`, so every alarm, request and cron runs at the 30 s default. The ceiling is 5 min.
2. A browser upload through the Worker is capped by the zone's Cloudflare plan: 100 MB on Free and Pro. A 100 MB file sits at that edge and a 500 MB archive cannot pass, so a direct-to-R2 upload is needed. Which plan the team's zone is on is not established (P-M1).
3. An alarm is retried at most 6 times, then dropped until `setAlarm`.
4. The docs say nothing about missed or overlapping cron firings, so the watchdog rests on undocumented behaviour.
5. Local runs enforce neither memory nor CPU, so a "fits in 128 MB" claim made locally needs the byte counters the architecture carries, plus the live measurements.

No live measurement was made: the charter forbids a deploy. Which measurements to make, and when, is BOB's.

## RA3 · 2026-10-23 · Deliverable 3 ready: `CHALLENGES.md`

Why reading keeps failing, from the evidence. Sources: the five family reports (PDF, scans, sheets, docs), the diagnoses of rounds 6–8, fix rounds 4–8, every walk and re-walk record, and the audits of partial reads. All were read whole in twelve shares, then synthesised three ways, and the lane read the result whole. §1 is the short answer: eight root mechanisms under 17 failure classes (C1–C17). §2 gives each class's instances, its recurrence, and the requirement or platform fact behind it. §3 is the recurrence table: nearly every fix came back on another path or in another kind. §4 holds the few facts measured live, §5 the causes still unknown (seven of them decide an architecture), §6 the sources' questions for Bob, and §7 17 obligations for OPTIONS.

**For BOB:** two findings bear on the held fix round 8.
1. The sources' own plans harden today's three read modes. Each recommends a per-kind ceiling below Bob's standard (24 MiB, 1,000 pages, 32 MiB).
2. C4, C6, C8 and C9 (owed work registered after the answer, inline-vs-background by stored bytes, many paths, document identity) follow from the number of paths, not from any bound.

Evidence grades are mostly Node. No file above 41.5 MB or 1,354 pages, no 50 MB sheet and no archive has ever been read live.

## RA4 · 2026-10-23 · OPTIONS drafted, not yet reviewed; READING-ARCHITECTURE #1 stops at half its window

`options-brief.md` holds the lane's design: the shared shape every option needs (S1–S9) and four whole architectures.
- **A:** today's object, hardened.
- **B:** a reader object per document.
- **C:** Workflows carry the read, with Workers readers.
- **D:** Workflow-carried, with heavy kinds (PDF, OCR, office, archives, images) read by mature native tools in a container.

The recommendation is **D, staged**: the shared shape first, then the Workflow carrier (C) for the light kinds, then the container readers kind by kind, each after its live measurements. C is the fallback; A is not one. Local spikes (`spikes/options-RESULTS.md`) support this: Workflows run under Miniflare with retries, range reads stay within a bounded heap, and native PDF text costs about 1.3 ms a page at 17 MB. They also correct one claim: native OCR is only 1.3–1.6× faster than wasm, so a 5,000-page scan takes hours in every option unless its pages run in parallel.

A writer's full draft, `OPTIONS-draft.md`, is committed **unreviewed**. Context is at about 47% of the window (466K of 1M), and a whole read of the draft would cross half. Under the charter the lane stops here.

**For BOB:** start READING-ARCHITECTURE #2 on this branch. Its first act is to read `STATE.md`, then read `OPTIONS-draft.md` whole against the brief, commit `OPTIONS.md` (RA5), and go on to `FOR-BOB.md` (deliverable 5). No question for Bob is open from the lane yet: his questions arrive together in `FOR-BOB.md`.


## RA5 · 2026-10-23 · Deliverable 4 ready: `OPTIONS.md`

READING-ARCHITECTURE #2 read the writer's draft whole against `options-brief.md`, checked its arithmetic (memory tables, time to whole, cost) and a sample of its citations against REQUIREMENTS, PLATFORM and CHALLENGES, and adopted it as `OPTIONS.md`; the draft is deleted. Four whole architectures (A hardened in-object, B a reader object per document, C Workflows carry the read, D Workflows with heavy kinds read by native tools in a container), each under the charter's five headings, compared on reliability, efficiency, the member's experience, cost, effort and testability. The recommendation is the brief's: **D, staged** (the shared shape S1–S9 first, then the Workflow carrier, then container readers kind by kind after parity and a live probe); C is the fallback; A is not one.

What review changed (listed in §0): the six writer's notes are each settled (WN1–WN3, WN5, WN6 accepted; WN4 settled as "the kind decides", with any small-file Worker path BOB's after P-M17); C7 and C16 counted consistently with the shared shape; one time row restated; the retired-source figure qualified. One substantive correction: the draft treated the list of kinds read as Bob's open question. K4628 point 1 already sets it for the beta (.doc, .xls, RTF, .eml, .msg, TIFF, HEIC, GIF, WebP and the rest), so under A, B and C those kinds need new JavaScript readers. This is work D avoids, which strengthens D's case. Only kinds beyond his list (TAR, GZ, 7z, RAR) and OCR languages remain open.

**For BOB:** nothing to rule. Facts that bear on the order of work: no live measurement exists. Stage 0's probes (P-M1, P-M2, P-M3, P-M5, P-M6, P-M9; then P-M14, P-M16, P-M4; then P-M17) are BOB's to place and run. Two findings are for GAP.md: RR-F1's "64 MB above idle" cannot hold at the as-built idle (WN6), and the stale part-keyed rows (S2) need a migration nobody has placed.

## RA6 · 2026-10-23 · Deliverable 5 ready: `FOR-BOB.md`

Only what is Bob's under P17, in ten questions. Each has a plain explanation, its options and a recommendation:
1. **The architecture** (rec. D, staged; C the fallback).
2. **Money:** accept a container line, capped and reported.
3. **The alpha against his standard:** ship with today's limits stated to members, and meet the standard by the beta.
4. **What "or" and "archives 500 MB total" mean:** refused above either limit; 500 MB file, 2 GB unpacked.
5. **Time:** no promised time now; progress and an "about" estimate.
6. **Safety:** reading does not wait for the scan in the alpha, and a found threat's text leaves search once signatures exist; no typed passwords for the beta.
7. **What counts as text:** every part read and searchable, each marked with its kind; Excel dates typed as dates.
8. **Protective limits inside the standard,** accepted as a class and reported.
9. **Beyond his list:** add TAR, GZ and 7z and Spanish OCR; not RAR.
10. **Five smaller screen choices.**

A closing section says what was not asked and why: answered by K4628, K4630, K4562 or K4803; BOB's under P17 (encodings included, since his standard requires them); or queued elsewhere. It covers every question in REQUIREMENTS §6, CHALLENGES §6, SHEET #1's B-1 to B-8 and DOCS #1's Q1 to Q11.

**For BOB:**
- Render `FOR-BOB.md` for Bob and record his answers as rulings.
- The lane now waits: deliverable 6 (`GAP.md`) follows only once he confirms an architecture. When he does, start READING-ARCHITECTURE #3 on this branch for it, or send the ruling to this session if it is still open.
- `STATE.md` is current. No safety check refused any act in this session.
