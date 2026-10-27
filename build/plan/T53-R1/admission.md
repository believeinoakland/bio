# T53 R1 · admission · rows

## plan-T53-draft.md

**admission**
- C T52-43 · T53 · N1264 · `admit` callable in the room, parity of every refusal, counting unchanged (PL12, PL13) · `platform/combined-read-and-fold-draft.md` §3; bar P-22 (`planning/plan-T53-platform-rows.md`)

## carried-T52-R1.md

- T52-43 · N1264 · K4533 · the object-side admission: one call to the object per op instead of two to four (whoami 1, projectlist 2, groupidentity 3, bootstrap 4, queue 2; targets 1, 1, 2, 2): the object resolves the session, judges `admit` and stamps. The deployed `in-<route>` time is 0-1 ms (a hop of 110-125 ms is transport, PERFORMANCE P11) and the room's minimum placement is in (K4747), so the fold is the lever. First: settle the figures on the deployed copy that confirm it.

## plan-T53-platform-rows.md

**Status** · READY · entries for BOB · PLANNING #4, 2026-10-27; service levels and the whole-record move folded by PLANNING #5 (L56, K5569); beside `plan-T53-draft.md` (at its cap). From PLATFORM P-22 (`platform/study/s1-results.md` §1b-full, lane/platform) and `platform/time-budgets-draft.md` §3 (READY), relayed by BOB #324. Each module's START carries its rows here verbatim (K5564).
**The bar these entries cite (P-22, "before").** On plat-s1 (alpha 0.87.0, Level 1), Seed A at 503 documents and 297 MB, reading idle, medians of five at 1280 px: the administrator's Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768 net (raw 2.8-6.5 s), the member's 0.55-0.66 s. The reads that wait are cheap ones queued behind the room's work: `bootstrap`, `memberlist`, `grouplanguages`, `profiles` (2.6-3.4 s of server time on Home), `queue`, and `heldcaptures` (241 KB, 0.8-1.7 s alone; asked by Home, Queue, Held, Add and Document, P24). Each entry's after-figure is taken on the same seed and copy and compared with this (the plan's Measurements, (a)), against its budget class (`time-budgets-draft.md` §2).
**admission**, **store-door** (the fold, PL12-PL14; their entries in `plan-T53-draft.md`) · their after-figures are compared with P-22's bar.

## FOLD-AI.md

## 2. Order and `uses` (BOB's, P4)
8. **The retired ops and service names** (ai-accounts' twelve) are still named in sixteen modules: op-declarations, op-grades, admission, store-door, store-request, store-assembly, control-plane, interface-shell, signin-door, screens-settings, screens-entry, screens-inquiry, screens-daily, wizard-scripts, affordances, journey-check. Each of those layer-11 jobs takes the re-pointing as a CHANGE in the same round (no aliases, ai-accounts For BOB 6); the plan names it in each job's START.
