/* The owners' declarations registered as the plane registers them at start-up (op-declarations R80, R81; K4168), before any table is
   read, so an op its owner declares and no hand row holds (`casedetails`, `casedetailsset`, `casedetailspublic`, `importregrade`,
   `rerunstart`, `citeimported`) is in `OPS` and the screens that send it compose (interface-shell R21's check). Every test file of
   this module imports it first; it reads the declarations through test-support's collector, never a second list (K3268). */
import { fileURLToPath } from "node:url";
import { declaredOpsOf } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";

/* The ops this module's screens send that no hand row of op-declarations holds yet: their owners' own rows serve them. Registering every
   owner is refused today by another module's row (link-sweep's `sweepset` has no `needs`, R80), which this module does not touch. */
const OWN = ["casedetails", "casedetailsset", "casedetailspublic", "importregrade", "rerunstart", "citeimported"];
const { ops, owners } = await declaredOpsOf(fileURLToPath(new URL("../../../../", import.meta.url)));
const byOwner = {};
for (const op of OWN) (byOwner[owners[op]] ||= {})[op] = ops[op];
registerDeclaredOps(byOwner);
