/* screens-daily R75 (T51; K4213, K4222): the plane registers each owner's declared ops before its first read, and this file does that
   for `tasks`' rows (`taskdecide` among them), so `OPS` holds `taskdecide` and the authority form is drawn. A test file imports it
   before `page.mjs`, which reads the op tables when it loads. */
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { DECLARED_OPS } from "../../../src/tasks/index.mjs";

registerDeclaredOps({ tasks: DECLARED_OPS });
