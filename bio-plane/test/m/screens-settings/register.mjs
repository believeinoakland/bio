/* The owners' declarations, registered once before any table is read (op-declarations R80, R81; K4168), as the plane registers them at
   start-up: an op an owner declares and the hand tables do not hold (`expertisewithdraw`, member-roster's) is served by its declaration,
   so the screens' acts that name it pass `interfacePage`'s check. The rows are `interface-shell`'s harness's collection of every owner's
   `DECLARED_OPS` (test-support's one collector), never a list kept here (K3268). A mutating row with no `needs` is refused by the
   registration (citation's `citeimported`, a defect of that owner, reported to BOB): it is left out, as the registration would refuse the
   whole call. */
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { collectOwnerRows } from "../interface-shell/harness.mjs";

const rows = {};
for (const [op, row] of Object.entries(collectOwnerRows())) if (!(row.mutating && row.needs === undefined)) rows[op] = row;
export const REGISTERED = { owners: rows };
registerDeclaredOps(REGISTERED);
