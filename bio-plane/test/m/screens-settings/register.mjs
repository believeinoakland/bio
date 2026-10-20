/* The owners' declarations, registered once before any table is read (op-declarations R80, R81; K4168), as the plane registers them at
   start-up: an op an owner declares and the hand tables do not hold (`expertisewithdraw`, member-roster's) is served by its declaration,
   so the screens' acts that name it pass `interfacePage`'s check. The rows come from `test-support`'s one collector, never a list kept here
   (K3268). A mutating row with no `needs` is refused by the registration (citation's `citeimported`, a defect of that owner, reported to
   BOB): it is left out, as the registration would refuse the whole call. */
import { fileURLToPath } from "node:url";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { declaredOpsOf } from "../../declared-ops.mjs";

const { ops, owners } = await declaredOpsOf(fileURLToPath(new URL("../../../../", import.meta.url)));
export const REGISTERED = {};
for (const [op, row] of Object.entries(ops)) if (!(row.mutating && row.needs === undefined)) (REGISTERED[owners[op]] ||= {})[op] = row;
registerDeclaredOps(REGISTERED);
