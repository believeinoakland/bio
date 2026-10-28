# Plan T53 · the completion round (P10)

**Status** · The tranche's completion round, after layer 11 and before the release (P10; needs no further approval): one job per module whose layer had closed when the work was found, run concurrently, lower layers first where one uses another. BOB adds each entry as it is placed, with its ruling; the requirement lines are written just before the round's START (K5377). Opened by `proc round open` from this file once R1's last layer closes.

## Layer 1
**image-cover**
- T53-570 · K5705, file-safety R66 · a redraw from decoded pixels (the container's other picture kinds), so file-safety can draw a picture from pixels another reader decoded; its line written before START
**runtime-limits**
- T53-572 · K5705, T53-510 (FILE-SAFETY's measurement) · `file_safety.grade_read`'s standard lowered from 100 MiB to the whole-read figure a Worker holds (a 100 MiB PDF graded whole measured 315 MiB above idle against 206 MiB headroom); the figure from FILE-SAFETY's ranged-grading report, larger containers graded by pieces (K1881, K5637's pattern)

## Layer 2
**record-core**
- T53-574 · K5705, FILE-SAFETY's finding · `purge` removes rows only, so derived objects of a purged capture (safe views, copies, pictures) stay in the store unreferenced: purge removes them too (whether record-core finds them or their owners register them for purge, settled at START)

## Layer 3
**file-safety**
- T53-571 · K5705, R66 · the container's other picture kinds: uses reader-container (the edge entered at START) and image-cover's redraw (T53-570)

## Carried from the handoff
- mail-door R12's `email()` wiring waits on M1 (K5692 (3)): a P19 deferral unless M1 is made.
- capture R120 / T53-108 if PLATFORM's stage timings come after layer 3 can otherwise close (K5699).
