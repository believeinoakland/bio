# Plan: next (T34)

**Status** · Entries for the tranche after T33, written as T33 runs (P18). Started at T33's opening by BOB #114, 2026-10-05.

## Entries

- N549 · `docprofile` · delete its seven copied doctypes and their default registration once `plane` registers `doctypes`' types (T33-90 merged), re-pointing its own tests to the seam's stubs (K1513). **Hard reason it is not in T33:** the order: plane (L11) registers after docprofile's one T33 job (L1), P4, P8.

- N550 · `queue`, `queue-producers`, and each module that shows a K1473 signal or a K1491 machine check to a member · DEC-131 (UX-DESIGN U48; K1536): queue R48 `QUEUE_CLASS_LABELS` CONDITION "Signal" becomes "Status"; queue-producers R24's member-facing word "signal" becomes "status"; the "Hint" label (K1473 signals, "Hint · machine work" on K1491's items) wherever they reach a member; codes and the canon's word "signal" unchanged. **Hard reason it is not in T33:** DEC-131 is not on `main` until PR #11 merges at T33's close (§13.1 item 5: a DEC is folded once it is on `main`).

Otherwise none yet. T33's release at its close (K1501) runs the deployment-gated measurements; the work they unlock is written here then.

## Carried from T33

The left-out table of `current.md` (T33), unchanged until re-read at T34's opening.
