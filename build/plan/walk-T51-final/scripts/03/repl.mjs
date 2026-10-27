/* a development aid: keeps one world alive and runs snippet files dropped in the scratch dir (not part of the record) */
import { readdirSync, writeFileSync } from "node:fs";
import { makeWorld } from "./walk03.mjs";
import { dump, show, settle } from "./lib.mjs";
const DIR = process.argv[2];
const c = await makeWorld({ tag: "w03repl" });
c.dump = dump; c.show = show;
c.D = async (who, path, o = {}) => { const s = await c.go(who, path, o); show(await dump(s.page, { max: o.max ?? 1500 })); return s; };
c.runStages = async (from, to) => { const { PLAN } = await import("./plan.mjs?t=" + Date.now()); for (const [name, fn] of PLAN.slice(from, to)) { const t0 = Date.now(); await fn(c); console.log("STAGE", name, Math.round((Date.now() - t0) / 1000), "s"); } };
console.log("READY");
const done = new Set();
for (;;) {
  for (const f of readdirSync(DIR).filter((x) => /^\d+\.mjs$/.test(x)).sort()) {
    if (done.has(f)) continue; done.add(f);
    const out = []; const orig = console.log; console.log = (...a) => out.push(a.join(" "));
    try { const m = await import(DIR + "/" + f + "?t=" + Date.now()); await m.default(c); } catch (e) { out.push("ERROR " + (e.stack || e)); }
    console.log = orig; writeFileSync(DIR + "/" + f.replace(".mjs", ".out"), out.join("\n"));
  }
  await new Promise((r) => setTimeout(r, 300));
}
