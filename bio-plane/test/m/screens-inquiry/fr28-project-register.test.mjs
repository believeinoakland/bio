/* screens-inquiry FR-28, `project`: the owners' declarations the project page's acts need, registered as the plane registers them at
 * start-up (op-declarations R80, R81; op-grades R49, R50), before any table is read: `rerunpair` and `rerunread` are `case-import`'s
 * (its R33) and `projectclose` is `investigation`'s (its R25). They are read from their owners (K3268), never hand-listed. A test
 * file of the project's FR-28 suites imports this one first (an import evaluates before the next one's modules read a table). It
 * holds no test; when the module's fixtures register every owner they need, this file goes. */
import { DECLARED_OPS as CASE_IMPORT } from "../../../src/case-import/index.mjs";
import { DECLARED_OPS as INVESTIGATION } from "../../../src/investigation/ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { registerDeclaredOps as registerGrades } from "../../../src/op-grades/index.mjs";

/** The declarations registered, `{owner: {op: row}}`. */
export const REGISTERED = { "case-import": CASE_IMPORT, investigation: INVESTIGATION };
registerDeclaredOps(REGISTERED);
registerGrades(REGISTERED);
