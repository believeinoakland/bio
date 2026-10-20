/* screens-inquiry FR-28, `document`: every owner's declarations registered with op-declarations as the plane registers them at start-up
 * (R80, R81), through test-support's `registerDeclared` (R17, K4245), before any table is read. op-grades (R49, R50) is given
 * `provenance`'s alone: registering every owner is refused today at `accountusesset`'s description (an owner's row differing from
 * op-grades' hand row; reported to BOB), and `declareorigin` needs its rung. A test file of the document's FR-28 suites imports this one
 * first. It holds no test; when `registerDeclared` can register op-grades too, this file's second call goes. */
import { fileURLToPath } from "node:url";
import { registerDeclared } from "../../declared-ops.mjs";
import { DECLARED_OPS as PROVENANCE } from "../../../src/provenance/ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { registerDeclaredOps as registerGrades } from "../../../src/op-grades/index.mjs";

await registerDeclared(fileURLToPath(new URL("../../../../", import.meta.url)), registerDeclaredOps);
registerGrades({ provenance: PROVENANCE });
