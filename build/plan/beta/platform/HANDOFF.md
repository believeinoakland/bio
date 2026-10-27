# PLATFORM: handoff

**Status** · PLATFORM #1 (Sonnet), lane `lane/platform`, started 2026-10-27 by BOB #320; BOB now #321 (`session_018BhcefWqhwJGg3zA2NE2PZ`; T53's Status line still names #320). Entries `P-n`; section 0 is rewritten whole after every entry.

## 0. State now and next steps

**Branch.** `lane/platform` restarted from `tranche/T53` after PR #46 merged; PR #47 (P-2) open; P-3 pushed on it.

**Drafts (this folder).**
- `time-budgets-draft.md` **READY**: nine classes, PL1-PL6; the bar kept at every level (K5438).
- `combined-read-and-fold-draft.md` **READY**: fold and combined read, PL10-PL17; throwaway tests first; two technical points BOB's.
- `load-test-draft.md` **READY**: PL40-PL43, proposed module `load-check`; the scratch deployment is BOB's (K5120, K5434): say when and on what.
- `record-placement-draft.md` **READY** for placement and the picker (P2 K5440, P3 K5441 folded; Cloudflare's pages re-read 2026-10-27 and quoted in §2, which changed the design: a jurisdiction covers only where the room runs and stores; Workers reach it from anywhere, so the words promise storage, and the R2 bucket needs its own jurisdiction at creation, PL34). The split (§4) waits on N1271's study.
- `whole-record-move-draft.md` **DRAFT** (new, K5443 (4)): PL50-PL53 for `corpus-export` (whole-record export by resumable parts), PL54-PL57 for the installer's import; one point maybe Bob's (whether a move carries members' sign-in material; assumed not).
- `levels-2-3-study-plan.md` **PLAN** (K5444): phases S0-S4, needs, about 3-3.5 lane days and 4-5 calendar days; S0 (table inventory, a worker is running) started now.
- `service-levels-draft.md` **DRAFT**: PL20-PL28; names Team / Institution / Enterprise = Levels 1 / 2 / 3 (confirmed, K5442; 70 %/90 % thresholds stand); figures estimates until measured; waits on P4 and on load figures from FILES and CAPABILITIES.
- `DECISIONS.md`: thirteen decisions (K5438, K5440-K5444).

**Open with Bob:** nothing; whether Bob can lend an Enterprise-plan account for the study (S3) is asked through BOB. P4 answered (K5444): a copy chooses its level at install, can move up, and unbuilt levels show "not yet measured" (PL29).

**Needs from others.** FILES: per-type load (Tier 2, held types), per-image time of DEC-460's photo redraw, the reading rate floor, and whether a jurisdiction R2 bucket changes the direct-to-R2 route. CAPABILITIES: load of registers, team layers, N824, and the whole-record export (PL35, K5441's move). BOB: re-time biosmoke8's hop; the scratch deployment at the load test; PL34's effect on rehearsal installs (K4942). AI-DESIGN: the assistant's declared reads.

**Next steps.**
1. Fold the table inventory (worker, scratchpad `table-inventory.md`) into S0's options; when S0 ends, send BOB the prototype spec (`study/prototype-spec.md`) and the `load-check` job request.
2. Fold FILES' and CAPABILITIES' load figures into the rating (service-levels §2) and the load-test profile (§3).
3. Re-read Cloudflare's Workers and Durable Object limits pages (figures of 2026-10-23) before any figure is final (the data-location pages are done).
4. Hand over at 40 % context.

## Entries

**P-1 · 2026-10-27** · Five drafts opened from the P1-P26 digest and the requirements already in force (`runtime-limits` R27-R35, `plane` R95, `installer` R83, `admission`). Nothing measured by this lane (it changes no code and has not touched a copy). Not confirmed: that biosmoke8's room was re-created and the hop fell.

**P-2 · 2026-10-27** · Bob's P1 answered (K5438): bar kept at every level, ranges per level, copies told when outgrowing. Folded into `service-levels-draft.md` (PL26-PL28; the name reading) and `time-budgets-draft.md` §5; `DECISIONS.md` +1. FILES and CAPABILITIES have stated no load figures yet; asked via BOB.

**P-3 · 2026-10-27** · Bob's P2 and P3 answered (K5440, K5441). Cloudflare's data-location pages (Durable Objects, 2026-06-26; R2, 2026-08-19) read and quoted in `record-placement-draft.md` §2; design changed by what they say (storage-only promise; R2 bucket in the same jurisdiction; hint and jurisdiction not combined; jurisdictions are eu, us, fedramp). New lines PL34 (R2 bucket) and PL35 (whole-record export, deferred to its owner).

**P-4 · 2026-10-27** · K5443 folded: `whole-record-move-draft.md` (PL50-PL57) written for `corpus-export` and the installer; the one-`eu`-rehearsal added to `load-test-draft.md` §2; placement §3 and §5 updated.

**P-5 · 2026-10-27** · P4 answered (K5444): `service-levels-draft.md` §5 and PL29 (the install's level choice) revised; `levels-2-3-study-plan.md` written; S0's table inventory started.

**P-6 · 2026-10-27** · FILES F5 (`LOAD-PER-TYPE.md`) read: record grows by extracted text (about 1.4-1.5 x), not file bytes; folded into `service-levels-draft.md` §2 (the record bound is database bytes and R2 bytes separately), `load-test-draft.md` §3 (text-heavy and scan-heavy seeds; P-M17 and L1-L6 in S1's cycle), `time-budgets-draft.md` PL7 (background work yields the room; one batch at most 100 ms). R2-to-R2 answered from Cloudflare's pages (`whole-record-move-draft.md` §5). Factor on real unit rows not confirmed: needs S1.

**P-7 · 2026-10-27** · K5448 folded: prototype by this lane's workers on `proto/levels-2-3` (never merged; `load-check` is R1's); CONSISTENCY (5)-(8) applied (one bounds table in runtime-limits for PL1 and PL20; `load-check` uses op-declarations, runtime-limits, test-support only; PL3 first an op-declarations test). Study plan re-timed: about 5-6 days, waiting only on deploys. The table inventory (S0) is still being written.
