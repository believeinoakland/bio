/* control-plane R49 (T51; K4230; case-inputs R24, R27): the plane registers each owner's declared ops before its first read, and this file does that for
   case-inputs' rows. The routing test imports it before the harness, which reads the op tables when it loads, so this
   registration is the first read of that process. */
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { DECLARED_OPS } from "../../../src/case-inputs/index.mjs";

registerDeclaredOps({ "case-inputs": DECLARED_OPS });
