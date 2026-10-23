# BASELINE (PERFORMANCE #1) — biosmoke8 after fix rounds 4 and 4b (tranche/T51 @ 86792d1179, run 39729170252), 2026-10-22

**Method.** `tools/probe.mjs`: sign in as the role (variables, never printed), open each screen directly, record every request (op, wait, size) and take **drawn** = the time from opening the address to the last API read finishing. Direct to the copy (no proxy). Cold = first load after sign-in; warm = second load in the same browser (cached shell and words). One re-walker (rewalk4 A) was on the copy at the same time. Bar (Bob, K4354): a screen drawn within 2 s at 1280 px. 390 px is measured the same way (the same reads; the narrow layout adds no request). Single samples vary by up to 2x: read the range, not one number. Screens measured: the eight with data in the sampled project; the other registry screens share the same frame (the same ~15 reads) and are not separately timed here.

| Screen | Admin 1280 cold / warm | Admin 390 | Member 1280 cold / warm | Member 390 | Requests (API) | Verdict (2 s) |
|---|---|---|---|---|---|---|
| Home | 4.3 / 12.1 s † | 3.3 s | 4.3 / 2.6 s | 3.5 s | 38 (31) | miss (2.6-4.3 s, one 12 s stall †) |
| Queue | 2.9 / 2.2 s | 3.2 s | 2.8 / 2.0 s | 2.9 s | 23 (16) | miss (2.0-3.2 s over all samples) |
| Project | 3.0 / 2.0 s | 2.9 s | 2.2 / 3.8 s | 2.9 s | 38 (31) | miss (2.0-3.8 s over all samples) |
| Held | 3.5 / 3.0 s | 3.1 s | 4.7 / 3.4 s | 3.9 s | 23 (16) | miss (3.0-4.7 s over all samples) |
| Inbox | 1.5 / 3.1 s | 2.4 s | 3.4 / 1.5 s | 2.4 s | 19 (12) | met in some samples (1.5-3.4 s over all samples) |
| Document | 3.4 / 2.7 s | 3.4 s | 3.0 / 2.3 s | 1.5 s | 39 (31) | met in some samples (1.5-3.4 s over all samples) |
| Add | 1.2 / 1.6 s | 1.6 s | 1.7 / 2.2 s | 1.4 s | 10 (2) | met in some samples (1.2-2.2 s over all samples) |
| Projects | (no reads) † / 1.6 s | 1.5 s | 1.5 / 2.3 s | 2.0 s | 23 (15) | met in some samples (1.5-2.3 s) |

† = the anomaly named below (a stalled session read; Projects' first load drew no reads at all in one pass).

Repeats still in a load (admin, 1280): Home `casedrafts` x4 (one per project with drafts), `queue` x2, `groupidentity` x2; Queue `queue` x3; Project `groupidentity` x2, `inquirystrength` x2; Held `heldcaptures` x3. Anomalies seen: `/app` once 12 s (8 requests, `whoami`/`bootstrap` slow) and in the previous pass the Document page twice (`bootstrap` 11.6 s, `whoami` 7.7-9.7 s): an occasional multi-second stall of the session read, not reproduced on demand (P13).

## Reads alone (Server-Timing, 4-5 repeats, administrator, from `tools/ops.mjs`)
| Read | Total | Durable Object calls (Server-Timing) |
|---|---|---|
| whoami | 0.15 s | session 123 ms |
| projectlist | 0.27 s | session 126 + projectlist 115 |
| signerregister / signerrevoke (member) | 0.27 s | session 121 + op 124 (key registration was 37.6 s) |
| groupidentity | 0.51 s | session 248 (2 calls) + doorwindow 123 + op 111 |
| queue | 0.65-0.94 s | session 125 + queue 331 |
| bootstrap | 0.93-1.29 s | session 249 + doorwindow 125 + bootstrap 114 + bootstrapfacts 109 (+ about 300 ms in the Worker) |

## Captures (administrator, 1280 px; the plane's `timings`, the door's Server-Timing, and wall time)
| Capture | Wall | Stages | Bar 15 s |
|---|---|---|---|
| iana page, plain | 2.3 s (round 3) | fetch 0.6, read 0.2, profile 0.3, attest 0 | met |
| iana page, as a visitor saw it | 5.5 s | fetch 0.7, render 3.3 (browser 2.7), profile 0.2 | met |
| legistar People, visitor | 11.6 s | fetch 0.5, read 1.1, render 8.1 (browser 4.6; 33 bodies), profile 0.6 | met |
| legistar Departments, visitor | 9.2 s | fetch 0.2, read 1.2, render 6.2 (browser 3.3; 36 bodies), profile 0.5 | met |
| PDF 2.5 MB (govinfo BUDGET-2025-BUD) | 5.2 s | fetch 0.16, read 3.9, profile 0.4; reading pending | met (was 502 at 17-20 s) |
| PDF 8.8 MB (BUDGET-2025-PER) | 14.2 s | fetch 0.14, read 12.9, keep 0.2; reading pending | met, 0.8 s to spare (was 504) |
| PDF 15.9 MB (BUDGET-2024-APP) | 60.5-61.7 s | acquire 24.3 s (read 23.2, keep 0.35) then `readheldfor` 37.2 s | **miss** (was 504) |
| Key registration (member) | 0.27 s | 2 object calls | met (was 37.6 s) |
| A shell act (explanations level, one POST) | 0.35-0.43 s | 1 POST, no re-read | met |
| "List this project's documents" (read act) | 0.6 s incl. 0.3 s settle | 1 `heldcaptures` | met |
