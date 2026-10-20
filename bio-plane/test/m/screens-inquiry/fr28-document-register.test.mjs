/* screens-inquiry FR-28, `document`: every owner's declarations registered (op-declarations only: op-grades refuses accountusesset, an owner defect reported to BOB) as the plane registers them at start-up (op-declarations R80,
 * R81; op-grades R49, R50) through test-support's `registerDeclared` (R17, K4245), before any table is read. A test file of the
 * document's FR-28 suites imports this one first. It holds no test; when the module's fixtures register, this file goes. */
import { fileURLToPath } from "node:url";
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";

await registerDeclared(fileURLToPath(new URL("../../../../", import.meta.url)), registerDeclaredOps);
