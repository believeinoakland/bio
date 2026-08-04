import { execFileSync } from "child_process";
import fs from "fs";
const tests = fs.readdirSync(new URL(".", import.meta.url)).filter(f=>f.endsWith(".test.mjs")).sort();
let fail = 0;
for(const t of tests){
  try{ execFileSync("node", [new URL(t, import.meta.url).pathname], {stdio:"pipe"}); console.log("PASS", t); }
  catch(e){ fail++; console.error("FAIL", t, "\n"+String(e.stdout||"")+String(e.stderr||"")); }
}
execFileSync("node", [new URL("../check-semantics.mjs", import.meta.url).pathname], {stdio:"inherit"});
/* THE D-173 GUARD (UI-23). It re-runs every suite above with an envelope probe
   preloaded, so it costs a second pass; that is deliberate and it is the only
   way to see what shape a mock ANSWERED rather than what its source looks like.
   It runs here, in the loop the reader actually runs, because a guard that is
   documented and not in the loop is not a mechanism (CLAUDE.md) — and because
   the class it closes shipped five times under a green harness. */
try{ execFileSync("node", [new URL("../check-mock-envelope.mjs", import.meta.url).pathname], {stdio:"inherit"}); }
catch(_){ fail++; }
if(fail) process.exit(1);
console.log("civicos-ui: all harnesses green");
