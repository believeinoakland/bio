import { execFileSync } from "child_process";
import fs from "fs";
const tests = fs.readdirSync(new URL(".", import.meta.url)).filter(f=>f.endsWith(".test.mjs")).sort();
let fail = 0;
for(const t of tests){
  try{ execFileSync("node", [new URL(t, import.meta.url).pathname], {stdio:"pipe"}); console.log("PASS", t); }
  catch(e){ fail++; console.error("FAIL", t, "\n"+String(e.stdout||"")+String(e.stderr||"")); }
}
/* CORRECTED 2026-08-07 (VF-2), never exempted: this call was NOT in a try/catch
   while both guards below are. `execFileSync` throws on a non-zero exit, so a
   failing check-semantics ABORTED this runner — and the two guards after it
   never ran, on the one path where that matters most. That is D-93's class
   exactly (`npm test` chaining suites with `&&` and stopping at the first
   failure), one directory over. It still fails the run; it no longer hides what
   is behind it. */
try{ execFileSync("node", [new URL("../check-semantics.mjs", import.meta.url).pathname], {stdio:"inherit"}); }
catch(_){ fail++; }
/* THE DEC-49 GUARD (VF-2). Bob ruled 2026-08-06 that surfaces MAY render an
   authored translation keyed on a code the plane sent, and the guard is what
   makes that safe: every code a surface can receive has a translation, and an
   UNTRANSLATED CODE FAILS THE HARNESS rather than reaching a member. It runs
   here, in the loop the reader actually runs, because a guard that is documented
   and not in the loop is not a mechanism (CLAUDE.md). Its own suite is
   test/refusal-codes.test.mjs, which runs it over fixture trees. */
try{ execFileSync("node", [new URL("../check-refusal-codes.mjs", import.meta.url).pathname], {stdio:"inherit"}); }
catch(_){ fail++; }
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
