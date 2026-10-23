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

