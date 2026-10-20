/* screens-inquiry FR-28, `document`: the owner's declaration the document page's acts need, registered as the plane registers it at
 * start-up (op-declarations R80, R81; op-grades R49, R50), before any table is read: `declareorigin` is `provenance`'s (its R64, R68). It
 * is read from its owner (K3268), never hand-listed. A test file of the document's FR-28 suites imports this one first (an import
 * evaluates before the next one's modules read a table). It holds no test; when the module's fixtures register every owner they need,
 * this file goes. */
import { DECLARED_OPS as PROVENANCE } from "../../../src/provenance/ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { registerDeclaredOps as registerGrades } from "../../../src/op-grades/index.mjs";

/** The declarations registered, `{owner: {op: row}}`. */
export const REGISTERED = { provenance: PROVENANCE };
registerDeclaredOps(REGISTERED);
registerGrades(REGISTERED);
