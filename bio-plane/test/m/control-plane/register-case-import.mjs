/* control-plane R49 (K4219; R81): the plane registers each owner's declared ops before its first read, and this file does that for
   case-import's rows. r49-routes.test.mjs imports it before the harness, which reads the op tables when it loads, so this
   registration is the first read of that process. */
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { DECLARED_OPS } from "../../../src/case-import/index.mjs";

registerDeclaredOps({ "case-import": DECLARED_OPS });
