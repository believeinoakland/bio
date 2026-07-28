import { execFileSync } from "child_process";
import fs from "fs";
const tests = fs.readdirSync(new URL(".", import.meta.url)).filter(f=>f.endsWith(".test.mjs")).sort();
let fail = 0;
for(const t of tests){
  try{ execFileSync("node", [new URL(t, import.meta.url).pathname], {stdio:"pipe"}); console.log("PASS", t); }
  catch(e){ fail++; console.error("FAIL", t, "\n"+String(e.stdout||"")+String(e.stderr||"")); }
}
execFileSync("node", [new URL("../check-semantics.mjs", import.meta.url).pathname], {stdio:"inherit"});
if(fail) process.exit(1);
console.log("civicos-ui: all harnesses green");
