# PLATFORM: handoff

**Status** · PLATFORM #1 (Sonnet), lane `lane/platform`, started 2026-10-27 by BOB #320; BOB now #321 (`session_018BhcefWqhwJGg3zA2NE2PZ`; T53's Status line still names #320). Entries `P-n`; section 0 is rewritten whole after every entry.

## 0. State now and next steps

**Branch.** PR #46 (P-1) was merged by BOB; `lane/platform` was restarted from `tranche/T53` (b3ef391c) for P-2.

**Drafts (this folder).**
- `time-budgets-draft.md` **READY**: nine classes, time and hop ceilings, PL1-PL6. Bob's bar is ANSWERED (K5438, P1 option A): K4354's bar stands at every level.
- `combined-read-and-fold-draft.md` **READY**: fold (N1264) and combined read (K4599), PL10-PL17; throwaway tests T-a/T-b first; two technical points BOB's (§5).
- `load-test-draft.md` **READY**: ramped test on a scratch copy, proposed module `load-check`, PL40-PL43. The scratch deployment is BOB's under K5120, no approval needed (K5434): say when and on what.
- `service-levels-draft.md` **DRAFT**: gains K5438: the bar holds at every level; a copy is told when it is approaching (70 %) or outgrowing (90 %) its level's range (PL26-PL28); names read as Team / Institution / Enterprise = Levels 1 / 2 / 3 (BOB to confirm). Figures are estimates until measured; Level 2-3 wait on N1271's study; needs load figures.
- `record-placement-draft.md` **DRAFT**: PL30-PL33, the split's needs for N1271; waits on Bob's P2 (what the picker promises) and P3 (region after install).
- `DECISIONS.md`: eight decisions of Bob's (K5438 added).

**Open with Bob (QUESTIONS.html):** P2 picker (hint vs jurisdiction), P3 region after install, P4 which levels teams see.

**Needs from others.** FILES (via BOB; MAP.md §2 row exists): per-type load of Tier 2 (K5435) and held types (K5436), per-image time of DEC-460's photo redraw, the reading rate floor. CAPABILITIES (via BOB): load of registers, team layers and N824 (their step 4 will send it); neither lane has stated figures yet. AI-DESIGN: the assistant's declared reads. BOB: re-time biosmoke8's hop (BOB's act), the scratch deployment when the plan reaches the load test.

**Next steps.**
1. On Bob's P2-P4, fold the answers into `record-placement-draft.md` and `service-levels-draft.md`; mark each READY.
2. When FILES and CAPABILITIES send load figures, fold them into the rating (service-levels §2, load-test profile §3); mark service-levels READY.
3. Check Cloudflare's current Durable Object and R2 jurisdiction and limits pages (figures of 2026-10-23) before any figure is final.
4. Hand over at 40 % context.

## Entries

**P-1 · 2026-10-27** · Five drafts opened from the P1-P26 digest and the requirements already in force (`runtime-limits` R27-R35, `plane` R95, `installer` R83, `admission`). Nothing measured by this lane (it changes no code and has not touched a copy). Not confirmed: that biosmoke8's room was re-created and the hop fell.

**P-2 · 2026-10-27** · Bob's P1 answered (K5438): bar kept at every level, ranges per level, copies told when outgrowing. Folded into `service-levels-draft.md` (PL26-PL28; the name reading) and `time-budgets-draft.md` §5; `DECISIONS.md` +1. FILES and CAPABILITIES have stated no load figures yet; asked via BOB.
