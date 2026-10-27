# PLATFORM: handoff

**Status** · PLATFORM #1 (Sonnet), lane `lane/platform`, started 2026-10-27 by BOB #320; BOB now #321 (`session_018BhcefWqhwJGg3zA2NE2PZ`; T53's Status line still names #320). Entries `P-n`; section 0 is rewritten whole after every entry.

## 0. State now and next steps

**Drafts (this folder).**
- `time-budgets-draft.md` **READY**: nine classes with a time ceiling and a hop ceiling (K4354 kept), PL1-PL6; Bob's choice of bar (A keep, B 1 s in-app) in §5.
- `combined-read-and-fold-draft.md` **READY**: the fold (N1264) and the combined read (K4599), PL10-PL17; throwaway tests T-a/T-b first; two points BOB's (§5).
- `load-test-draft.md` **READY**: ramped per-level test on a scratch copy, new module `load-check` (proposed), PL40-PL43; the scratch deployment is BOB's act.
- `service-levels-draft.md` **DRAFT**: structure complete (PL20-PL25); figures are estimates until measured; Level 2-3 wait on N1271's study; needs load figures from CAPABILITIES and FILES.
- `record-placement-draft.md` **DRAFT**: PL30-PL33, the split's needs for N1271; waits on Bob (what the picker promises: hint vs jurisdiction; region after install; the split's unit).
- `DECISIONS.md`: seven decisions of Bob's carried.

**Open with Bob (through BOB, each in its draft):** (1) the beta's bar: A keep 2 s / B add 1 s in-app and read acts / C 1 s all; recommend A (time-budgets §5). (2) What the region picker promises: near-me hint only / hint plus a jurisdiction for legal needs / silent; recommend hint plus jurisdiction, in honest words (placement §4). (3) Whether a team may change region after install (placement §4). (4) Show Level 1 figures only (recommend) or all three (service-levels §5).

**Needs from others.** CAPABILITIES, FILES: per capability and file type, the rows, bytes and load added, and each new screen's budget class and reads (MAP.md §2). FILES: the reading rate floor. AI-DESIGN: the assistant's declared reads. BOB: the scratch deployment (load test), and the first re-time of biosmoke8's re-created room (the hop).

**Next steps.**
1. On BOB's answers, fold Bob's rulings into the drafts and `DECISIONS.md`; mark `record-placement-draft.md` READY.
2. Read the other lanes' section 0 as they appear on `tranche/T53`; fold their figures into `service-levels-draft.md`; mark it READY when the load figures are in.
3. Check Cloudflare's current Durable Object and R2 jurisdiction and limits pages (the figures are of 2026-10-23) before any figure is final.
4. Answer any need BOB relays; hand over at 40 % context.

## Entries

**P-1 · 2026-10-27** · Five drafts opened from the P1-P26 digest and the requirements already in force (`runtime-limits` R27-R35, `plane` R95, `installer` R83, `admission`). Nothing measured by this lane (it changes no code and has not touched a copy). Not confirmed: that biosmoke8's room was re-created and the hop fell.
