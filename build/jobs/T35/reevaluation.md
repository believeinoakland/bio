# reevaluation (T35)

**Status** · session_01RAsDWSMPhnFASHguUe4CCA · depth 2 · WORKING · handled B0

## J1 · REPORT

REPORT — T35-52 makes two things outside reevaluation stale; nothing changed outside my paths.

1. Generated artifact (§14): `bio-plane/dist/bio-plane.bundled.mjs` carries C-110.1's old translation ("the plane's own credentials"); regenerated at L7's close.
2. control-plane `test/m/control-plane/rows-before-r43.json`:363 pins C-110.1's translation digest (`229f685fa674fc61`), so `catalogue-end.test.mjs`:21 (R43, R22) also mismatches on C-110.1 once this merges. The test is already red under accepted red 19 (it stops first at C-29.3 today); C-110.1 joins the rows T35-72 re-pins.
