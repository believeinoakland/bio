/* The owners' declarations this module's tests register with op-grades before any table is read (op-grades R49; K4168,
   K4225). `affordances` grades an op by what op-grades' tables hold, and an op its owner newly declares (case-inputs'
   `casedetailsset`, case-import's `rerunstart`) has no hand row, so it is graded only once its owner's `DECLARED_OPS` is
   registered, as the plane registers it at start-up. Each owner's rows are read from the owner (K3268), never listed here.
   Import this file before `affordances.mjs`: registration is refused once any table has been read, and happens once per
   process, at this file's evaluation. */
import { DECLARED_OPS as CASE_INPUTS } from "../../../src/case-inputs/index.mjs";
import { DECLARED_OPS as CASE_IMPORT } from "../../../src/case-import/index.mjs";
import { registerDeclaredOps } from "../../../src/op-grades/index.mjs";

/** The declarations registered, `{owner: {op: row}}`. */
export const REGISTERED = { "case-inputs": CASE_INPUTS, "case-import": CASE_IMPORT };
registerDeclaredOps(REGISTERED);
