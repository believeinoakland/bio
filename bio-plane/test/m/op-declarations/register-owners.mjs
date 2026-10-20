/* The owners' declarations this module's tests register before any table is read (R80; K4168). Each owner's `DECLARED_OPS`
   is read from its own module and registered as the plane registers it at start-up, so an op it declares is served by its
   declaration and never by a hand list (K3268). Only the owners the tests name are registered here: registering every
   owner (`declaredOpsOf`, test-support R16) is refused today by citation's `citeimported` row, which declares a mutating op
   with no `needs` (R80), an owner's defect reported to BOB, not worked here. Registration happens once per process, at this
   file's evaluation, before any table is read. */
import { DECLARED_OPS as CASE_IMPORT } from "../../../src/case-import/index.mjs";
import { DECLARED_OPS as MEMBER_ROSTER } from "../../../src/member-roster/index.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";

/** The declarations registered, `{owner: {op: row}}`. */
export const REGISTERED = { "case-import": CASE_IMPORT, "member-roster": MEMBER_ROSTER };
registerDeclaredOps(REGISTERED);
