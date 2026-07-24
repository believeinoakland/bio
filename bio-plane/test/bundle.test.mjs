import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
const P = "/home/claude/work/bio-plane/dist/bio-plane.bundled.mjs";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: P, script: readFileSync(P, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "0.2.0", PROBE_TOKEN: "probe-local" },
});
const j = async (p) => (await (await mf.dispatchFetch("http://x" + p)).json());
const st = await j("/?op=selftest&token=probe-local");
console.log("selftest bindings:", JSON.stringify(st.bindings));
const lf = await j("/?op=livefire&token=probe-local");
console.log("livefire:", lf.summary, "ok:", lf.ok);
for (const a of lf.assertions) if (!a.ok) console.log("  FAIL", a.name);
const d1 = await j("/?op=promote&token=probe-local&store=bio");
console.log("confinement:", d1.error || "ALLOWED (DEFECT)");
await mf.dispose(); process.exit(lf.ok ? 0 : 1);
