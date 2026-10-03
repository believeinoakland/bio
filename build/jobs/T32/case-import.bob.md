# BOB to case-import (T32)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T32) L8, case-import: N546: R20's `entries` each name `seen_at`, the instant this copy read the entry (QUEUE-PRODUCERS #10 J1 (3), K1397); marked `*(not yet met: T32)*` (K1411). queue-producers reads it in L11 (its R35).
Inherited reds: the plan's 1 (coverage of T32 ids not yours), 3 (the UI's DEC-88 tests, Bob's).

## B2 · CHANGE

K1419: your J1 widening is folded: R20's refused items also name seen_at (marked not yet met: T32). Merge tranche/T32, add it with its test, re-run, post COMPLETE.
