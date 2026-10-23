# READING-ARCHITECTURE lane: charter (Bob, K4812; BOB #269)

**Status** · In force. Started by BOB #269 on Bob's ruling K4812. The lane decides nothing: its options reach Bob through BOB, and his decisions are K rulings.

## Why (Bob, 2026-10-23, in his words)

"Again: we've been finding problem after problem related to reading specific file types and reading very large files in pieces. We need to step back so that we can get to the point where we really understand the challenges of these functions, our requirements, and develop a wholistic best practices architecture that is reliable, efficient, and user friendly in all supported scenarios. Only with this understanding should be be saying with any solid confidence what changes are need to fit our reviewed and confirmed architectural solution."

## Scope

Everything between a file reaching Civicsmith and a member searching, citing and interpreting it: every way in (upload, web capture as sent and as a visitor saw it, a delivery held elsewhere, an archive's members, a register import), file safety and the safe view, format detection, unpacking, reading text and structure (pages, rows, cells, slides), OCR, storing a reading, search and citation, where interpretation stops (Bob's K4632, K4636), the background work that carries a long read (the ledger, ticks, the alarm, the scheduler and its watchdog, Bob's K4565, K4566), and what a member sees at each point (being read, partly read and why, refused with its bound, finished, Bob's K4562, K4571). Every type of Bob's file standard (K4628, N1266), at its sizes (documents and scans 100 MB or 5,000 pages; spreadsheets 50 MB or about 1M rows; images 50 MB; archives 500 MB).

## What it delivers, in order (each a file here, on branch `lane/reading-architecture`)

1. `REQUIREMENTS.md`: the reading requirements consolidated, each stated once with its sources (Bob's rulings, the canon, the module requirements); conflicts and gaps between them named.
2. `PLATFORM.md`: every Cloudflare limit and capability that bears on reading (Workers and Durable Objects memory, CPU, wall time, subrequests, storage; R2 ranged reads and multipart; Queues; Workflows; Containers; Browser Rendering; service bindings), quoted from Cloudflare's current documentation read live with its page and date, and measured locally (workerd, Miniflare) where it can be, with what local runs cannot show.
3. `CHALLENGES.md`: why the present design keeps failing, from the evidence: the family reports (`pdf-envelope-T51.md`, `pdf-architecture-T51.md`, `envelope-scans-T51.md`, and `envelope-sheets-T51.md`, `envelope-docs-T51.md` when merged), the diagnoses (`diagnosis-R7-*.md`, `diagnosis-R8-*.md`), the walk records and the fix rounds' reading causes; the failure classes common to every family, each with the requirement or platform fact behind it.
4. `OPTIONS.md`: two to four whole architectures, best practice for this platform (each: where each stage runs, how a large file is read in bounded memory, how work survives a killed isolate, how progress and limits reach the member, how it is tested at the platform's shape), compared on reliability, efficiency, the member's experience, cost on the team's Cloudflare plan, and the effort to reach it from today; small spikes in scratch (never product code) where a claim needs proof; a recommendation.
5. `FOR-BOB.md`: only what is Bob's (P17: the architecture at its high level, what members experience, money, a requirement's meaning), each with an explanation he can understand, options and a recommendation. BOB renders it for him.
6. After Bob confirms an architecture: `GAP.md`: every change from today's code to the confirmed design, by module, in an order of work, each a plan entry BOB places; the existing reading causes mapped to it (kept, absorbed or dropped).

## How

- Read whole, never scan (P20; Bob's K3586, K3588): shares over about 150 KB go to helpers (sonnet, medium) told the task and what follows it, each returning findings with citations; the lane reviews them.
- Changes no product code or requirement; writes only this folder on its own branch. No deploy; the live copy only read-only through the proxy (K4733); never print a secret; an act a safety check refuses is recorded, never worked around.
- `HANDOFF.md` here: numbered entries `RA<n>` (a deliverable ready, a question for Bob, a finding a running fix round needs). BOB reads it at every backstop check and answers in rulings.
- Tokens are not spared to the results' cost (Bob, K4782); the lane keeps its own context under half its window, handing off to `READING-ARCHITECTURE #<n+1>` (started by BOB) with a `STATE.md` when it must.
