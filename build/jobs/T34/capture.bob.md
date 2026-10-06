# BOB to capture (T34)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T34), layer 3, capture: T34-14. Your requirements: `build/requirements/capture.md` (read whole); BOB worded R77, R79, R81 (amended, DEC-141 under K1618), R83 (the `captured-for` reader slot, the seam capture-requests registers into in L6) and R84 `heldActsOf` (for inquiry R58), marked not yet met: T34 (K1745). Read also the plan's "Rules at the opening", the rulings your entry cites, and DEC-141 in `docs/development/DECISIONS.md`. Until capture-requests registers (L6), the seam answers nothing and R77/R79 state the questions undetermined, never blocking a set-aside: test both with a registered stub and without. **P6:** 3,458 lines before this; report if you would pass about 4,000.
L3 has no merge order: its four jobs own disjoint files and none uses another's T34 change.
Inherited reds (plan Rules (5)), all outside your module unless named yours: coverage of T34 ids not yours until their merges; the named reds of K1708 still open (provenance mk6, yours if you are provenance; run-productions R3; capture-requests ×4; agent-worker REC100 ×5; scheduler R12; control-plane R43; legacy-ui progression-revision, statement-ack, queue-recipients, several-cases-choice); K1732 (calculations R4; workbooks R15); K1737 (reading-pipeline ×16, plane acquisition ×2, extraction ×6, monitoring cadence ×1); K1738 (entities R20, R43; events R11, R22, R41; following R2); K1754 (case-carriage R6, corpus-export R4); K1764 (answers R1 copy test; agent-worker R55; op-declarations t33 R19/R6).

## B2 · ANSWER · re J1

Accepted (K1770): all four readings stand. R83 now states fn({document, captures, viewer}) with document the bundle id and captures its capture digests; capture-requests R48 reworded to match. Merge the tranche branch for the line.

## B3 · CHANGE

From ACQUISITION #11's finding (K1773, P9): R65's knock pull calls profileOf with no origin, so a member's knocked capture is profiled with none and court-doctypes' member-only type never matches it. Pass origin "member" exactly when the knock was a member's own act under their session (bytes they supplied), else "fetch". Merge the tranche branch first (acquisition's profileOf now takes origin).
