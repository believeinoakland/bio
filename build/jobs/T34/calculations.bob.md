# BOB to calculations (T34)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T34), layer 5, calculations: T34-27. Your requirements: `build/requirements/calculations.md` (read whole); BOB worded R1, R4, R8, R9 (amended), R30 `gradeFactsOf`, R31 `calcStatusOf` (K1746), marked not yet met: T34. Read also the plan's "Rules at the opening" and the rulings your entry cites. **Finding before your start:** `calculations.test.mjs:49` (R4) expects a sequential fresh `CALC-` id; red since record-grammar's merge (K1732); expect the opaque form. **Finding before your start:** calc-grammar's streamed evaluate answers a streamed table result as `{fields, rows}`; read it through `rows()` when storing one (K1734).
Merge order in L5: `modules.json` order: entities → events → lines → local-facts → connections → standards → money-checks → duties → people → explore → bias → retrieval → calculations. lines merges before people (N573) and standards before duties (N583). A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan Rules (5)), all outside your module unless named yours: coverage of T34 ids not yours until their merges; the named reds of K1708 still open (provenance mk6, yours if you are provenance; run-productions R3; capture-requests ×4; agent-worker REC100 ×5; scheduler R12; control-plane R43; legacy-ui progression-revision, statement-ack, queue-recipients, several-cases-choice); K1732 (calculations R4; workbooks R15); K1737 (reading-pipeline ×16, plane acquisition ×2, extraction ×6, monitoring cadence ×1); K1738 (entities R20, R43; events R11, R22, R41; following R2); K1754 (case-carriage R6, corpus-export R4); K1764 (answers R1 copy test; agent-worker R55; op-declarations t33 R19/R6). K1776 adds none.
 **DEC-149 (T34-78, K1785):** also apply your share of T34-78: every member-facing string (a check's `translation`, a refusal's `why`, a `note` a member can read) that calls the group's Civicsmith "this instance", "the instance", "copy", "plane" or "server" says "your group's Civicsmith" or is reworded to need no name (Bob's DEC-149, on PR #12; the plan's T34-78 lists the lines found); comments, identifiers and a refusal naming the control plane's stamp to a caller without one stay. A test names each changed string.

## B2 · CHANGE

From RETRIEVAL #12 J1 (K1788): your R19 test (test/m/calculations/registrations.test.mjs:46) asserts the order [false, true] of occurrenceEvidence's answers, but the order follows calc ids, opaque since T34-1, so it fails about 1 run in 3 on the base. Make the test order-independent (sort, or match by id); R19 states no order. Deal with it in this job.
