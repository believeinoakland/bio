/* control-plane R113 (T51; K4213; K4222; R81): the plane registers each owner's declared ops before its first read, and this file does
   that for `tasks`' rows (`taskdecide` among them). t51-taskdecide.test.mjs imports it before the harness, which reads the op tables
   when it loads, so this registration is the first read of that process. */
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { DECLARED_OPS } from "../../../src/tasks/index.mjs";

registerDeclaredOps({ tasks: DECLARED_OPS });
