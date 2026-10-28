# Plan T53 · the completion round (P10)

**Status** · The tranche's completion round, after layer 11 and before the release (P10; needs no further approval): one job per module whose layer had closed when the work was found, run concurrently, lower layers first where one uses another. BOB adds each entry as it is placed, with its ruling; the requirement lines are written just before the round's START (K5377). Opened by `proc round open` from this file once R1's last layer closes.

## Layer 1
**image-cover**
- T53-570 · K5705, file-safety R66 · a redraw from decoded pixels (the container's other picture kinds), so file-safety can draw a picture from pixels another reader decoded; its line written before START
**runtime-limits**
- T53-572 · K5705, T53-510 (FILE-SAFETY's measurement) · `file_safety.grade_read`'s standard lowered from 100 MiB to the whole-read figure a Worker holds (a 100 MiB PDF graded whole measured 315 MiB above idle against 206 MiB headroom); the figure from FILE-SAFETY's ranged-grading report, larger containers graded by pieces (K1881, K5637's pattern)

**register-readers**
- T53-580 · K5715, ACQUISITION's finding · `register-readers` R9: `createReducer` offers a `snapshot()`/resume of its carry (the unfinished row, the row number, the hashes), so acquisition R127's offset checkpoint can be built; and `createRowParser` reads a separate header file in the header piece's own delimiter (acquisition's `headerInDelimiter` work-around then removed). With acquisition R127 after it
**runtime-limits** (also)
- T53-581 · K5715, acquisition R126 · the two `register` rows of `READ_BOUNDS` (runtime-limits R47) once M-R7 records them; acquisition R126 then met
- T53-586 · K5736, extraction R122 · the alarm reading's units-and-index-rows budget becomes a runtime-limits row, extraction reading it from there

## Layer 2
**promotion**
- T53-582 · K5715, capture's new rows · the census re-stamped for C-118.12 (`MAIL_NO_STATEMENT`), C-118.13 (`FILE_KIND_REFUSED`), C-139.22-.24 and every other check row minted in T53, last in its layer
**record-core**
- T53-574 · K5705, FILE-SAFETY's finding · `purge` removes rows only, so derived objects of a purged capture (safe views, copies, pictures) stay in the store unreferenced: purge removes them too (whether record-core finds them or their owners register them for purge, settled at START)

## Layer 3
**acquisition**
- T53-583 · K5715, R126, R127 · met once T53-580 and T53-581 land
**file-safety**
- T53-571 · K5705, R66 · the container's other picture kinds: uses reader-container (the edge entered at START) and image-cover's redraw (T53-570)

## Carried from the handoff
- mail-door R12's `email()` wiring waits on M1 (K5692 (3)): a P19 deferral unless M1 is made.
- capture R120 / T53-108 if PLATFORM's stage timings come after layer 3 can otherwise close (K5699).
