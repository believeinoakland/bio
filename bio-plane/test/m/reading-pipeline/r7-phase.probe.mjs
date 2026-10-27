/* reading-pipeline G82 (fix round 7), a probe, not a test (no `.test.mjs`): which phase of a text tick holds the isolate's thread on workerd. Each
   phase of a 12 MB text's first tick is run alone by `r7-contention-entry.mjs`'s `/phase`, twice, while six cheap reads at a time are timed by this
   probe's clock: `node --test r7-phase.probe.mjs` from bio-plane/. Measured: decode 103 ms, a blank-line scan 66, the glyph count 114, flatten 60,
   and docprofile's `identify` + `doctypeFor` over the whole text 1,014 ms: the longest wait of a text's first tick is that classification (docprofile's
   detectors, one stretch), not this module's phases. */
import { test, after } from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Miniflare } from "miniflare";
const ENTRY = "/home/user/bio/bio-plane/test/m/reading-pipeline/r7-contention-entry.mjs";
const mf = new Miniflare({ modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"), modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["CAPTURES"] });
after(() => mf.dispose());
const cheap = async () => { const t = performance.now(); await (await mf.dispatchFetch("http://x/cheap")).json(); return performance.now() - t; };
test("phases", { timeout: 300000 }, async () => {
  const text = Buffer.from(Array.from({ length: 120000 }, (_, i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".")).join("\n"));
  const sha = createHash("sha256").update(text).digest("hex");
  await mf.dispatchFetch(`http://x/put?sha=${sha}`, { method: "POST", body: text });
  for (const name of ["decode", "blank", "glyph", "classify", "flatten"]) {
    let d = false; const w = [];
    const g = (async () => { for (let i = 0; i < 2; i++) await (await mf.dispatchFetch(`http://x/phase?sha=${sha}&name=${name}`)).json(); d = true; })();
    while (!d) { w.push(...await Promise.all(Array.from({ length: 6 }, cheap))); await new Promise((r) => setTimeout(r, 2)); }
    await g; console.log("phase", name, "max cheap wait", Math.round(Math.max(...w)));
  }
});
