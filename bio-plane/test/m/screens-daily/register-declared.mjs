/* The owners' declared ops registered before the harness reads the op tables (control-plane R113, as its own `register-declared.mjs`
   does): a test that boots the real plane imports this first, so the page's op table is the plane's. */
import { fileURLToPath } from "node:url";
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { registerDeclaredOps as registerOpGrades } from "../../../src/op-grades/index.mjs";

await registerDeclared(fileURLToPath(new URL("../../../../", import.meta.url)), registerDeclaredOps, registerOpGrades);
