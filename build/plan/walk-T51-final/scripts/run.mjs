import { makeKit, launch, startRecord, finish, counts } from "./lib.mjs";
import { secA } from "./secA.mjs";
import { secB } from "./secB.mjs";
import { secC } from "./secC.mjs";
const kit = makeKit({ tag: "w01" });
const url = (await kit.mf.ready).href.replace(/\/$/, "");
const browser = await launch();
const ctx = { kit, browser, base: url };
ctx.login = async (handle, password) => { const r = await kit.post({}, "login", { handle, password, device: "own" }); return r.body.result.token; };
startRecord("test header");
const only = process.argv.slice(2);
const SECTIONS = { A: secA, B: secB, C: secC };
try {
  for (const [k, fn] of Object.entries(SECTIONS)) {
    if (only.length && !only.includes(k)) continue;
    try { await fn(ctx); } catch (e) { console.log("SECTION", k, "FAILED", e.stack.split("\n").slice(0, 4).join(" | ")); }
  }
} finally { finish(); await browser.close(); await kit.mf.dispose(); }
console.log(JSON.stringify(counts));
process.exit(0);
