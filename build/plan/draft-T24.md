# Plan draft: T24

**Status** · DRAFT by BOB #97, 2026-10-02, from `tranche/T23` @ K1167, while T23's L11 runs (P18). Re-checked at T23's close against L11's records and `next.md`, then written as `next.md` → `current.md` (§5.2). A line marked *(PR #7)* waits on the design stream's PR #7 reaching `main` and Bob's answers to K1134's questions (`t24-questions.html`); if both are in hand at the opening it is folded and carried, else it stays out with that hard reason.

## Legacy census

| legacy module | in T24 | reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633). Its shares wait on the UX stream (N487 and the `next.md` table's legacy-ui rows). |

## Folds before the opening (BOB, on the tranche branch)

1. **N506** (K1159): `requirements/link-sweep.md` from monitoring R53–R64, no change of meaning (monitoring's retired, never reused); `modules.json` gains `link-sweep` after monitoring in layer 10, `paths` filled before any ownership check (K1153), `uses` from the moved code's imports; scheduler's and every other reader's `uses` re-pointed.
2. **N503–N505, N507**: the new services stated in record-core, provenance and credentials Provides with `*(not yet met: T24)*`; network-notices R4, R1, R21, R14/R15 re-worded to use them, marked the same.
3. *(PR #7)* **N488–N491**: fold `draft-T24-dec113-115.md` and `draft-T24-dec116.md` as K1134 says; place N491's docket home (BOB's, P17). **N481** (DEC-112) only if it too is on `main`.
4. **N502/N508's scan**: list every module whose source still names the legacy store's dispatcher or an `awaiting stamp` from a tranche already stamped (`grep -rn "legacy store's op map\|awaiting stamp" bio-plane/src`), so each job's START names its lines.

## Roster (by layer)

**L2** (merge order: record-core and credentials before promotion)
- **record-core** · N503: `recordOpaqueId` (or `mintOpaqueId` with a chosen id) inside the caller's transaction.
- **credentials** · N505: `signers.status_at`, answered by R8's `signerList`. N508's note (`index.mjs`:669).
- **promotion** · S1: the stamp 1.53.0 → 1.54.0 over T23's L3–L11 rows (N486's catalogue rows, acquisition's `SWEEP_*`, network-notices' C-127.*, every T23 record's `awaiting stamp`), `ROW_CENSUS` re-pinned, its fixture, `AWAITING_STAMP` declarations retired.

**L3**
- **provenance** · N504: `instanceKeyBound()`.
- **host-governor** · N508's note (`index.mjs`:266).

**L4**
- **extraction** · N508's note (`index.mjs`:1474).
- **content** · N502's stale stamp notes.

**L6**
- **citation** · N508's note (`index.mjs`:736).
- **strength**, **run-rules**, **capture-requests** · N502's stale stamp notes.

**L8**
- **publication** · N501: retire the constant re-exports queue-producers no longer imports (after T23 L11's re-point). *(PR #7)* N491's publication share; N481 if landed.
- **network-notices** · N503–N505's consumers (R4, R1, R21) and N507 (idle wakes null, R14/R15), after L2–L3's merges.

**L9**
- **actions** · N508's note (`index.mjs`:2368). *(PR #7)* N488's actions share.
- **conformance**, **filings**, **action-plans** · N502's stale stamp notes.

**L10** (merge order: monitoring, then link-sweep, then scheduler)
- **monitoring** · N506: the split's removal side (its paths shed `sweep.mjs`, `sweep-match.mjs`); its test world creates `refs` and `inquiry_bundle_facts` (N506's tail).
- **link-sweep** · N506: new module from the moved files, R1–R12 (monitoring's R53–R64), its tests.
- **scheduler** · N506: `gathering-sweep` consumer re-pointed to link-sweep.

**L11**
- **admission**, **control-plane** · N502's stale stamp notes. *(PR #7)* N488's control-plane share (the wipe refused under a hold).
- **queue-producers** · *(PR #7)* N489, N491's shares.

## Left out (hard reason each)

As `next.md`'s table (deployment, measurement, Bob's: UX, dependency not yet built), re-checked at the opening; plus each *(PR #7)* line not in hand.

## For BOB at T23's close

- Add every T23 L11 record's deferral and report to the roster above; confirm N501's re-point merged (queue-producers).
- The roster's N502 lines come from fold 4's scan, not from this list.
- Monitoring and link-sweep in one layer: both jobs run concurrently, so link-sweep's job owns the moved files from the opening (`paths` moved in fold 1), and monitoring's job only reads them away from its own; the ownership check sees each job's own paths.
