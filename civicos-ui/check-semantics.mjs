#!/usr/bin/env node
/* check-semantics.mjs
 *
 * The UI's SEMANTICS table is the one source of truth for what every state
 * MEANS on screen. The plane's source is the one source of truth for what
 * states EXIST. This check walks both and fails when they disagree:
 *
 *   1. Every state token the plane's store writes or gates on must have a
 *      semantics row somewhere in the UI table (the UI can explain the
 *      whole catalog).
 *   2. Every state in the UI table must appear in the plane's source (the
 *      UI invents nothing).
 *
 * Extraction is textual and deliberately conservative: it reads the
 * SEMANTICS block between its markers in app.html, and pulls state tokens
 * from the store's explicit state arrays and its current_state /
 * to_state literals. Run from civicos-ui/:
 *
 *     node check-semantics.mjs [path-to-store.mjs]
 */
import fs from "fs";
import vm from "vm";

const appPath = new URL("./app.html", import.meta.url).pathname;
const storePath = process.argv[2] || new URL("../bio-plane/src/store.mjs", import.meta.url).pathname;

const app = fs.readFileSync(appPath, "utf8");
const m = /\/\*__SEMANTICS_START__\*\/([\s\S]*?)\/\*__SEMANTICS_END__\*\//.exec(app);
if (!m) { console.error("FAIL: SEMANTICS markers not found in app.html"); process.exit(1); }
const ctx = {}; vm.createContext(ctx);
vm.runInContext(m[1] + "; globalThis.__S = SEMANTICS;", ctx);
const S = ctx.__S;

const uiStates = new Set();
for (const t of Object.values(S.types)) for (const s of Object.keys(t.states)) uiStates.add(s);
const uiCrit = new Set(Object.keys(S.criticality));

const store = fs.readFileSync(storePath, "utf8");
const planeStates = new Set();
// explicit state arrays, e.g. FOCUS_STATES = ["surfaced", ...]
for (const arr of store.matchAll(/_STATES\s*=\s*\[([^\]]*)\]/g))
  for (const w of arr[1].matchAll(/"([a-z_]+)"/g)) planeStates.add(w[1]);
// literals the store writes or gates on
for (const w of store.matchAll(/current_state\s*[!=]==?\s*"([a-z_]+)"/g)) planeStates.add(w[1]);
for (const w of store.matchAll(/#setScalar\([^,]+,\s*"current_state",\s*"([a-z_]+)"\)/g)) planeStates.add(w[1]);
for (const w of store.matchAll(/to_state:\s*"([a-z_]+)"/g)) planeStates.add(w[1]);
for (const w of store.matchAll(/from_state:\s*"([a-z_]+)"/g)) planeStates.add(w[1]);
const planeCrit = new Set();
for (const w of store.matchAll(/criticality\s*[!=]==?\s*"([a-z_]+)"/g)) planeCrit.add(w[1]);

const missingInUi = [...planeStates].filter(s => !uiStates.has(s));
const inventedByUi = [...uiStates].filter(s => !new RegExp(`"${s}"`).test(store));
const critMissing = [...planeCrit].filter(c => !uiCrit.has(c));

console.log("plane states observed:", [...planeStates].sort().join(", "));
console.log("ui states declared:  ", [...uiStates].sort().join(", "));
let fail = false;
if (missingInUi.length) { fail = true; console.error("FAIL: plane states with no semantics row:", missingInUi.join(", ")); }
if (inventedByUi.length) { fail = true; console.error("FAIL: ui states not found anywhere in the plane source:", inventedByUi.join(", ")); }
if (critMissing.length) { fail = true; console.error("FAIL: plane criticality values with no semantics row:", critMissing.join(", ")); }
if (!fail) console.log("OK: the semantics table covers the plane's catalog, and invents nothing.");
process.exit(fail ? 1 : 0);
